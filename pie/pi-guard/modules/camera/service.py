"""Camera service with dual-stream support and self-healing capabilities."""
import asyncio
import logging
import time
from typing import Optional
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from config import settings
from modules.camera.utils import QueueOutput

logger = logging.getLogger(__name__)


class CameraService:
    """
    Camera service with dual-stream support and self-healing:
    - Main stream: High resolution for snapshots/recording (capture_frame)
    - Lores stream: Lower resolution for streaming (H.264 encoded)
    - Periodic health checks to detect and recover from failures
    """
    
    def __init__(self):
        self.camera: Optional[Picamera2] = None
        self._encoder: Optional[H264Encoder] = None
        self._encoder_output: Optional[QueueOutput] = None
        self._running = False
        self._health_task: Optional[asyncio.Task] = None
        self._shutdown_event = asyncio.Event()
        
        # Health monitoring
        self._last_frame_time: Optional[float] = None
        self._health_check_interval = 5.0  # Check health every 5 seconds
        self._no_frame_timeout = 10.0  # Restart if no frames for 10 seconds
        self._restart_delay = 2.0  # Wait 2 seconds before restart
        
    async def start(self):
        """Start the camera service asynchronously with health monitoring."""
        if self._running:
            logger.warning("Camera service is already running")
            return
        
        logger.info("Starting camera service...")
        self._running = True
        self._shutdown_event.clear()
        
        # Start camera synchronously
        await self._start_camera()
        
        # Start health monitoring task
        loop = asyncio.get_event_loop()
        self._health_task = loop.create_task(self._health_monitor_loop())
        
        logger.info("Camera service started with health monitoring")
    
    async def _start_camera(self):
        """Initialize and start the camera with dual-stream configuration."""
        try:
            # Clean up any existing camera instance
            if self.camera is not None:
                await self._stop_camera_internal()
            
            # Parse streaming resolution
            stream_width, stream_height = settings.STREAM_RESOLUTION.split(':')
            stream_size = (int(stream_width), int(stream_height))
            
            # Run blocking camera operations in executor to avoid blocking event loop
            loop = asyncio.get_event_loop()
            
            # Initialize camera in executor
            def _init_camera():
                camera = Picamera2()
                
                # Configure camera with dual streams:
                # - main: Higher resolution for snapshots/recording
                # - lores: Lower resolution for streaming
                video_config = camera.create_video_configuration(
                    main={"size": (1920, 1080)},  # High-res for snapshots
                    lores={"size": stream_size}    # Low-res for streaming
                )
                camera.configure(video_config)
                return camera, stream_size
            
            try:
                self.camera, stream_size = await loop.run_in_executor(None, _init_camera)
                logger.debug("Camera video configuration created successfully")
            except Exception as e:
                logger.error(f"Failed to create/configure video configuration: {e}", exc_info=True)
                raise
            
            # Create H.264 encoder for lores stream with no buffering
            # Use callback to track frame production for health monitoring
            self._encoder_output = QueueOutput(
                maxsize=1,  # Minimal queue to prevent stalling
                frame_callback=self._on_frame_produced
            )
            self._encoder = H264Encoder(bitrate=settings.STREAM_BITRATE)
            self._encoder.output = self._encoder_output
            
            # Start encoder and camera in executor
            def _start_camera_internal():
                # Start encoder on lores stream (streaming channel)
                # When both main and lores are configured, encoder defaults to lores
                self.camera.start_encoder(self._encoder)
                self.camera.start()
            
            await loop.run_in_executor(None, _start_camera_internal)
            
            self._last_frame_time = time.time()
            logger.info(f"Camera started with dual streams: main=1920x1080, lores={stream_size}, bitrate={settings.STREAM_BITRATE}bps, framerate={settings.STREAM_FRAMERATE}fps")
            
        except Exception as e:
            logger.error(f"Failed to start camera: {e}", exc_info=True)
            await self._stop_camera_internal()
            raise
    
    def _on_frame_produced(self):
        """Callback when encoder produces a frame - updates health monitoring."""
        self._last_frame_time = time.time()
    
    async def stop(self):
        """Stop the camera service and clean up resources."""
        if not self._running:
            return
        
        logger.info("Stopping camera service...")
        self._running = False
        self._shutdown_event.set()
        
        # Cancel health monitoring task
        if self._health_task and not self._health_task.done():
            self._health_task.cancel()
            try:
                await self._health_task
            except asyncio.CancelledError:
                pass
        
        await self._stop_camera_internal()
        logger.info("Camera service stopped")
    
    async def _stop_camera_internal(self):
        """Internal method to stop camera and clean up."""
        if self.camera is not None:
            camera = self.camera
            encoder = self._encoder
            
            def _stop_camera_internal_blocking():
                try:
                    if camera.started:
                        camera.stop()
                    if encoder is not None:
                        camera.stop_encoder(encoder)
                except Exception as e:
                    logger.error(f"Error stopping camera: {e}", exc_info=True)
            
            # Run blocking stop operations in executor
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _stop_camera_internal_blocking)
            
            self.camera = None
            self._encoder = None
            self._encoder_output = None
    
    async def _health_monitor_loop(self):
        """Monitor camera health and restart if necessary."""
        while self._running and not self._shutdown_event.is_set():
            try:
                await asyncio.wait_for(
                    self._shutdown_event.wait(),
                    timeout=self._health_check_interval
                )
                break  # Shutdown event was set
            except asyncio.TimeoutError:
                # Timeout is expected, proceed with health check
                pass
            
            if not self._running:
                break
            
            try:
                await self._check_camera_health()
            except Exception as e:
                logger.error(f"Error in health check: {e}", exc_info=True)
    
    async def _check_camera_health(self):
        """Check camera health and restart if needed."""
        if self.camera is None or not self.camera.started:
            logger.warning("Camera is not running, attempting restart...")
            await self._restart_camera()
            return
        
        # Check if encoder output is receiving frames (camera configuration is working)
        if self._encoder_output is not None:
            current_time = time.time()
            # Check last frame production time from encoder
            encoder_last_frame = self._encoder_output.last_frame_time
            if encoder_last_frame is not None:
                time_since_last_frame = current_time - encoder_last_frame
                if time_since_last_frame > self._no_frame_timeout:
                    logger.warning(f"No frames produced by encoder for {time_since_last_frame:.1f}s, camera configuration may have failed. Restarting...")
                    await self._restart_camera()
                    return
            elif self._last_frame_time is not None:
                # Fallback to general last frame time if encoder timestamp not available
                time_since_last_frame = current_time - self._last_frame_time
                if time_since_last_frame > self._no_frame_timeout:
                    logger.warning(f"No frames received for {time_since_last_frame:.1f}s, camera may be stalled. Restarting...")
                    await self._restart_camera()
                    return
            
            # Check if encoder output queue is accessible
            try:
                queue_size = self._encoder_output.queue.qsize()
                logger.debug(f"Encoder output queue size: {queue_size}, last frame: {encoder_last_frame}")
            except Exception as e:
                logger.error(f"Encoder output queue check failed: {e}")
                await self._restart_camera()
                return
        
        # Verify video configuration is still valid
        try:
            # Check if camera configuration is accessible
            if self.camera.camera_configuration is None:
                logger.warning("Camera configuration is None, restarting...")
                await self._restart_camera()
                return
        except Exception as e:
            logger.error(f"Camera configuration check failed: {e}")
            await self._restart_camera()
            return
        
        logger.debug("Camera health check passed")
    
    async def _restart_camera(self):
        """Restart the camera after a delay."""
        logger.info(f"Restarting camera in {self._restart_delay}s...")
        
        try:
            await asyncio.wait_for(
                self._shutdown_event.wait(),
                timeout=self._restart_delay
            )
            return  # Shutdown requested, don't restart
        except asyncio.TimeoutError:
            pass
        
        if not self._running:
            return
        
        try:
            await self._start_camera()
            logger.info("Camera restarted successfully")
        except Exception as e:
            logger.error(f"Failed to restart camera: {e}", exc_info=True)
    
    def get_camera(self) -> Optional[Picamera2]:
        """Get the Picamera2 instance."""
        return self.camera
    
    async def capture_frame(self):
        """
        Capture a frame from the main (high-resolution) stream asynchronously.
        This is used for snapshots and recording, independent of streaming.
        Updates the last frame time for health monitoring.
        """
        if self.camera is None:
            raise RuntimeError("Camera not started. Call start() first.")
        if not self.camera.started:
            raise RuntimeError("Camera not running. Call start() first.")
        
        # Capture from main stream (high resolution) in executor to avoid blocking
        loop = asyncio.get_event_loop()
        camera = self.camera  # Capture reference for executor
        frame = await loop.run_in_executor(None, lambda: camera.capture_array("main"))
        self._last_frame_time = time.time()  # Update health monitor
        return frame
    
    def get_encoder_output(self) -> QueueOutput:
        """
        Get the encoder output queue for reading H.264 frames from lores stream.
        This is used by the streaming service.
        Frame production is tracked automatically via callback.
        """
        if self.camera is None or self._encoder_output is None:
            raise RuntimeError("Camera not started. Call start() first.")
        return self._encoder_output
    
    def is_running(self) -> bool:
        """Check if the service is running."""
        return self._running
