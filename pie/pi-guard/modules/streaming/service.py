"""Streaming service for RTSP video streaming using Picamera2 and ffmpeg."""
import logging
import asyncio
import subprocess
import time
from typing import Optional
from modules.camera.service import CameraService
from modules.streaming.stream_utils import (
    StreamHealthMonitor,
    start_ffmpeg_process,
    is_ffmpeg_healthy,
    log_ffmpeg_stderr,
    write_frame_to_ffmpeg,
    calculate_restart_delay,
)

from config import settings

logger = logging.getLogger(__name__)


class StreamingService:
    """Service for streaming camera video to RTSP server using ffmpeg."""
    
    def __init__(self, camera_service: CameraService):
        self.camera_service = camera_service
        self.ffmpeg_process: Optional[subprocess.Popen] = None
        self._running = False
        self._stream_task: Optional[asyncio.Task] = None
        self._shutdown_event = asyncio.Event()
    
    def start(self):
        """Start the streaming service."""
        if self._running:
            logger.warning("Streaming service is already running")
            return
        
        if not self.camera_service or not hasattr(self.camera_service, 'get_camera'):
            raise ValueError("Camera service is not available or invalid")
        
        logger.info("Starting streaming service...")
        logger.info(f"RTSP URL: {settings.RTSP_URL}")
        
        self._running = True
        self._shutdown_event.clear()
        
        # Start async streaming task
        # In FastAPI startup, the event loop is already running
        # Use get_running_loop() to get the current running loop
        try:
            loop = asyncio.get_running_loop()
            self._stream_task = loop.create_task(self._stream_loop())
            logger.info("Streaming service started")
        except RuntimeError:
            # No event loop running - this shouldn't happen in FastAPI, but handle gracefully
            logger.warning("No running event loop found for streaming service")
            self._stream_task = None
    
    def stop(self):
        """Stop the streaming service."""
        if not self._running:
            return
        
        logger.info("Stopping streaming service...")
        self._running = False
        self._shutdown_event.set()
        
        # Cancel stream task
        if self._stream_task and not self._stream_task.done():
            self._stream_task.cancel()
        
        # Clean up ffmpeg process
        self._cleanup_ffmpeg()
        
        logger.info("Streaming service stopped")
    
    def _cleanup_ffmpeg(self):
        """Clean up ffmpeg process."""
        if self.ffmpeg_process:
            try:
                logger.info("Terminating ffmpeg process...")
                # Close stdin first to prevent further writes
                if self.ffmpeg_process.stdin:
                    try:
                        self.ffmpeg_process.stdin.close()
                    except Exception as e:
                        logger.debug(f"Error closing ffmpeg stdin: {e}")
                
                # Terminate the process
                self.ffmpeg_process.terminate()
                try:
                    self.ffmpeg_process.wait(timeout=3)  # Reduced timeout for faster recovery
                except subprocess.TimeoutExpired:
                    logger.warning("FFmpeg didn't terminate, killing...")
                    self.ffmpeg_process.kill()
                    try:
                        self.ffmpeg_process.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        logger.error("FFmpeg process still alive after kill, may be zombie")
            except ProcessLookupError:
                # Process already dead
                logger.debug("FFmpeg process already terminated")
            except Exception as e:
                logger.error(f"Error terminating ffmpeg: {e}")
            finally:
                self.ffmpeg_process = None
    
    def _build_ffmpeg_command(self) -> list:
        """Build ffmpeg command for RTSP streaming with H.264 input."""
        return [
            "ffmpeg",
            "-f", "h264",  # Input format is H.264
            "-i", "-",  # Read from stdin
            "-c:v", "copy",  # Copy the stream without re-encoding
            "-rtsp_transport", "tcp",
            "-f", "rtsp",
            settings.RTSP_URL
        ]
    
    async def _stream_loop(self):
        """Async loop for streaming video frames to ffmpeg."""
        restart_count = 0
        
        while self._running and not self._shutdown_event.is_set():
            try:
                if not self._validate_camera():
                    break
                
                if not await self._start_ffmpeg_stream():
                    break
                
                encoder_output = self.camera_service.get_encoder_output()
                health_monitor = StreamHealthMonitor()
                restart_count = 0
                
                await self._process_frames(encoder_output, health_monitor)
                
                self._cleanup_ffmpeg()
                
                if self._shutdown_event.is_set():
                    break
                
                restart_count += 1
                if not await self._wait_for_restart(restart_count):
                    break
            
            except asyncio.CancelledError:
                break
            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt, shutting down...")
                break
            except Exception as e:
                logger.error(f"Unexpected error in stream loop: {e}", exc_info=True)
                self._cleanup_ffmpeg()
                await asyncio.sleep(1.0)
        
        self._cleanup_ffmpeg()
    
    def _validate_camera(self) -> bool:
        """Validate camera is available."""
        picam2 = self.camera_service.get_camera()
        if not picam2:
            logger.error("Camera not available")
            return False
        return True
    
    async def _start_ffmpeg_stream(self) -> bool:
        """Start ffmpeg process for streaming. Returns True if successful."""
        if self.ffmpeg_process:
            logger.warning("Cleaning up previous ffmpeg process before starting new one")
            self._cleanup_ffmpeg()
        
        ffmpeg_cmd = self._build_ffmpeg_command()
        
        try:
            self.ffmpeg_process = start_ffmpeg_process(ffmpeg_cmd)
            await asyncio.sleep(0.2)  # Give ffmpeg a moment to initialize
            return True
        except Exception as e:
            logger.error(f"Failed to start ffmpeg: {e}")
            self._cleanup_ffmpeg()
            return False
    
    async def _process_frames(self, encoder_output, health_monitor: StreamHealthMonitor):
        """Process frames from encoder and write to ffmpeg."""
        try:
            while self._running and not self._shutdown_event.is_set():
                current_time = time.time()
                
                if not self._check_ffmpeg_health(current_time, health_monitor):
                    break
                
                frame_bytes = encoder_output.get_frame(timeout=0.1)
                
                if frame_bytes:
                    if not await self._handle_frame_write(frame_bytes, health_monitor):
                        break
                else:
                    new_encoder_output = await self._handle_no_frame(current_time, encoder_output, health_monitor)
                    if new_encoder_output:
                        encoder_output = new_encoder_output
                
        except asyncio.CancelledError:
            pass
    
    def _check_ffmpeg_health(self, current_time: float, health_monitor: StreamHealthMonitor) -> bool:
        """Check ffmpeg process health. Returns False if restart needed."""
        is_healthy, exit_code = is_ffmpeg_healthy(self.ffmpeg_process)
        
        if not is_healthy:
            if exit_code is not None:
                logger.warning(f"FFmpeg process died with exit code: {exit_code}")
                if self.ffmpeg_process:
                    log_ffmpeg_stderr(self.ffmpeg_process)
            else:
                logger.error("FFmpeg stdin is closed or unavailable")
            return False
        
        if health_monitor.check_write_timeout(current_time):
            logger.warning("No successful writes to ffmpeg, restarting...")
            return False
        
        return True
    
    async def _handle_frame_write(self, frame_bytes: bytes, health_monitor: StreamHealthMonitor) -> bool:
        """Handle writing a frame to ffmpeg. Returns False if restart needed."""
        health_monitor.update_frame_time()
        
        is_healthy, _ = is_ffmpeg_healthy(self.ffmpeg_process)
        if not is_healthy:
            logger.warning("FFmpeg process unhealthy during frame processing")
            return False
        
        if write_frame_to_ffmpeg(self.ffmpeg_process, frame_bytes):
            health_monitor.update_write_time()
            
            if health_monitor.should_log_progress():
                logger.debug(f"Streamed {health_monitor.frames_written} frames to ffmpeg")
            
            return True
        
        self._cleanup_ffmpeg()
        return False
    
    async def _handle_no_frame(self, current_time: float, encoder_output, health_monitor: StreamHealthMonitor):
        """Handle case when no frame is available from encoder."""
        if health_monitor.check_frame_timeout(current_time):
            logger.warning("No frames from camera encoder - camera may be stalled, but continuing...")
            health_monitor.reset_frame_timer()  # Reset timer to avoid constant warnings
        
        await asyncio.sleep(0.01)
        return None
    
    async def _wait_for_restart(self, restart_count: int) -> bool:
        """Wait before restarting. Returns False if shutdown requested."""
        delay = calculate_restart_delay(restart_count)
        
        if restart_count == 1:
            logger.info("First restart attempt, quick recovery...")
        
        logger.info(f"Restarting streaming in {delay}s... (attempt {restart_count})")
        
        try:
            await asyncio.wait_for(self._shutdown_event.wait(), timeout=delay)
            return False  # Shutdown event was set
        except asyncio.TimeoutError:
            return True  # Continue to restart
    
    async def get_status(self) -> dict:
        """Get the current status of the streaming service."""
        ffmpeg_running = self.ffmpeg_process and self.ffmpeg_process.poll() is None
        
        return {
            "status": "running" if self._running else "stopped",
            "ffmpeg_running": ffmpeg_running,
            "ffmpeg_pid": self.ffmpeg_process.pid if ffmpeg_running else None,
            "rtsp_url": settings.RTSP_URL,
        }
    
    def is_running(self) -> bool:
        """Check if the service is running."""
        return self._running

