"""Streaming service for RTSP video streaming using Picamera2 and ffmpeg."""
import logging
import asyncio
import subprocess
from typing import Optional
from modules.camera.service import CameraService

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
        loop = asyncio.get_event_loop()
        self._stream_task = loop.create_task(self._stream_loop())
        
        logger.info("Streaming service started")
    
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
                self.ffmpeg_process.terminate()
                try:
                    self.ffmpeg_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    logger.warning("FFmpeg didn't terminate, killing...")
                    self.ffmpeg_process.kill()
                    self.ffmpeg_process.wait()
            except Exception as e:
                logger.error(f"Error terminating ffmpeg: {e}")
            finally:
                self.ffmpeg_process = None
    
    def _build_ffmpeg_command(self) -> list:
        """Build ffmpeg command for RTSP streaming."""
        # Parse resolution
        width, height = settings.STREAM_RESOLUTION.split(':')
        
        return [
            "ffmpeg",
            "-f", "rawvideo",
            "-pixel_format", "rgb24",  # Picamera2 returns RGB frames
            "-video_size", f"{width}x{height}",
            "-framerate", str(settings.STREAM_FRAMERATE),
            "-i", "-",
            "-vf", f"scale={width}:{height}",
            "-pix_fmt", "yuv420p",  # Convert to YUV420p for H.264 encoding
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-tune", "zerolatency",
            "-g", str(settings.STREAM_FRAMERATE),
            "-b:v", f"{settings.STREAM_BITRATE}",
            "-rtsp_transport", "tcp",
            "-f", "rtsp",
            settings.RTSP_URL
        ]
    
    async def _stream_loop(self):
        """Async loop for streaming video frames to ffmpeg."""
        restart_delay = 2
        max_restart_attempts = 5
        restart_count = 0
        
        while self._running and not self._shutdown_event.is_set():
            try:
                # Get camera instance
                picam2 = self.camera_service.get_camera()
                if not picam2:
                    logger.error("Camera not available")
                    break
                
                # Build ffmpeg command
                ffmpeg_cmd = self._build_ffmpeg_command()
                
                # Start ffmpeg process
                logger.info("Starting ffmpeg process...")
                self.ffmpeg_process = subprocess.Popen(
                    ffmpeg_cmd,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    bufsize=0
                )
                
                logger.info(f"FFmpeg process started with PID: {self.ffmpeg_process.pid}")
                restart_count = 0  # Reset on successful start
                
                # Stream frames
                try:
                    while self._running and not self._shutdown_event.is_set():
                        # Check if ffmpeg is still running
                        if self.ffmpeg_process.poll() is not None:
                            exit_code = self.ffmpeg_process.poll()
                            logger.warning(f"FFmpeg process died with exit code: {exit_code}")
                            
                            # Read stderr for error details
                            try:
                                stderr = self.ffmpeg_process.stderr.read().decode('utf-8', errors='ignore')
                                if stderr:
                                    logger.error(f"FFmpeg stderr: {stderr[:500]}")
                            except:
                                pass
                            
                            break  # Exit inner loop to restart
                        
                        # Get frame from camera
                        try:
                            # Capture frame from camera service
                            frame = self.camera_service.capture_frame()
                            
                            # Convert frame to bytes and write to ffmpeg
                            if self.ffmpeg_process.stdin:
                                # Convert numpy array to raw video bytes
                                # Picamera2 returns frames in RGB format, need to convert to YUV420p
                                # For now, we'll use a simpler approach - convert to bytes
                                # Note: This may need proper color space conversion for best quality
                                frame_bytes = frame.tobytes()
                                self.ffmpeg_process.stdin.write(frame_bytes)
                                self.ffmpeg_process.stdin.flush()
                            
                            # Small delay to match framerate
                            await asyncio.sleep(1.0 / settings.STREAM_FRAMERATE)
                            
                        except Exception as e:
                            logger.error(f"Error capturing/streaming frame: {e}")
                            await asyncio.sleep(0.1)
                            continue
                
                except asyncio.CancelledError:
                    break
                
                # Clean up before restart
                self._cleanup_ffmpeg()
                
                if self._shutdown_event.is_set():
                    break
                
                # Restart logic with backoff
                restart_count += 1
                if restart_count >= max_restart_attempts:
                    delay = restart_delay * restart_count
                    logger.warning(f"Multiple restart failures detected. Waiting {delay}s before retry...")
                else:
                    delay = restart_delay
                
                logger.info(f"Restarting streaming in {delay}s... (attempt {restart_count})")
                
                # Wait for delay or shutdown
                try:
                    await asyncio.wait_for(
                        self._shutdown_event.wait(),
                        timeout=delay
                    )
                    break  # Shutdown event was set
                except asyncio.TimeoutError:
                    continue  # Timeout is expected, continue to restart
            
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Unexpected error in stream loop: {e}", exc_info=True)
                await asyncio.sleep(restart_delay)
        
        # Final cleanup
        self._cleanup_ffmpeg()
    
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

