"""Streaming service for RTSP video streaming using Picamera2 and ffmpeg."""
import logging
import asyncio
import subprocess
import time
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
                
                # Ensure any previous ffmpeg process is cleaned up
                if self.ffmpeg_process:
                    logger.warning("Cleaning up previous ffmpeg process before starting new one")
                    self._cleanup_ffmpeg()
                
                # Start ffmpeg process
                logger.info("Starting ffmpeg process...")
                try:
                    self.ffmpeg_process = subprocess.Popen(
                        ffmpeg_cmd,
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        bufsize=0
                    )
                    
                    # Verify process started successfully
                    if self.ffmpeg_process.poll() is not None:
                        exit_code = self.ffmpeg_process.poll()
                        raise RuntimeError(f"FFmpeg process exited immediately with code {exit_code}")
                    
                    logger.info(f"FFmpeg process started with PID: {self.ffmpeg_process.pid}")
                    restart_count = 0  # Reset on successful start
                    
                    # Give ffmpeg a moment to initialize
                    await asyncio.sleep(0.2)
                    
                except FileNotFoundError:
                    logger.error("FFmpeg command not found. Please ensure ffmpeg is installed.")
                    raise
                except Exception as e:
                    logger.error(f"Failed to start ffmpeg process: {e}", exc_info=True)
                    self._cleanup_ffmpeg()
                    raise
                
                # Get encoder output queue
                encoder_output = self.camera_service.get_encoder_output()
                
                # Health monitoring variables
                last_frame_time = time.time()
                last_write_time = time.time()
                no_frame_timeout = 5.0  # Restart camera if no frames for 5 seconds
                no_write_timeout = 3.0  # Restart ffmpeg if no successful write for 3 seconds
                frames_written = 0
                
                # Stream frames
                try:
                    while self._running and not self._shutdown_event.is_set():
                        current_time = time.time()
                        
                        # Check if ffmpeg is still running (check first before any operations)
                        if self.ffmpeg_process is None or self.ffmpeg_process.poll() is not None:
                            exit_code = self.ffmpeg_process.poll() if self.ffmpeg_process else None
                            logger.warning(f"FFmpeg process died with exit code: {exit_code}")
                            
                            # Read stderr for error details
                            if self.ffmpeg_process:
                                try:
                                    stderr = self.ffmpeg_process.stderr.read().decode('utf-8', errors='ignore')
                                    if stderr:
                                        logger.error(f"FFmpeg stderr: {stderr[:500]}")
                                except:
                                    pass
                            
                            break  # Exit inner loop to restart
                        
                        # Validate stdin is still available and writable
                        if not self.ffmpeg_process.stdin or self.ffmpeg_process.stdin.closed:
                            logger.error("FFmpeg stdin is closed or unavailable")
                            break  # Exit inner loop to restart
                        
                        # Check if we've written data recently (ffmpeg health)
                        if current_time - last_write_time > no_write_timeout:
                            logger.warning(f"No successful writes to ffmpeg for {no_write_timeout}s, restarting ffmpeg...")
                            break  # Exit inner loop to restart ffmpeg
                        
                        # Get encoded H.264 frame from encoder
                        try:
                            # Get frame from encoder output queue (non-blocking)
                            frame_bytes = encoder_output.get_frame(timeout=0.1)
                            
                            if frame_bytes:
                                last_frame_time = current_time
                                
                                # Double-check process and stdin before writing
                                if self.ffmpeg_process is None or self.ffmpeg_process.poll() is not None:
                                    logger.warning("FFmpeg process died during frame processing")
                                    break
                                
                                if not self.ffmpeg_process.stdin or self.ffmpeg_process.stdin.closed:
                                    logger.error("FFmpeg stdin closed during frame processing")
                                    break
                                
                                try:
                                    # Write H.264 encoded frame to ffmpeg
                                    self.ffmpeg_process.stdin.write(frame_bytes)
                                    self.ffmpeg_process.stdin.flush()
                                    last_write_time = current_time
                                    frames_written += 1
                                    
                                    # Log every 100 frames for debugging
                                    if frames_written % 100 == 0:
                                        logger.debug(f"Streamed {frames_written} frames to ffmpeg")
                                except BrokenPipeError:
                                    logger.error("FFmpeg stdin pipe broken - process likely died")
                                    # Force immediate cleanup
                                    self._cleanup_ffmpeg()
                                    break
                                except OSError as e:
                                    # Handle various I/O errors (pipe errors, process gone, etc.)
                                    logger.error(f"OS error writing to ffmpeg: {e}")
                                    self._cleanup_ffmpeg()
                                    break
                                except ValueError as e:
                                    # Handle closed file descriptor
                                    logger.error(f"Value error writing to ffmpeg (likely closed): {e}")
                                    self._cleanup_ffmpeg()
                                    break
                                except Exception as e:
                                    logger.error(f"Unexpected error writing to ffmpeg: {e}", exc_info=True)
                                    # Don't break immediately, but mark for restart if it persists
                                    if current_time - last_write_time > 1.0:
                                        logger.error("Multiple write failures, restarting ffmpeg")
                                        self._cleanup_ffmpeg()
                                        break
                                    await asyncio.sleep(0.1)
                                    continue
                            else:
                                # No frame available - check if camera is stuck
                                if current_time - last_frame_time > no_frame_timeout:
                                    logger.warning(f"No frames from camera encoder for {no_frame_timeout}s, restarting camera...")
                                    # Restart camera service
                                    try:
                                        self.camera_service.stop()
                                        await asyncio.sleep(0.5)  # Reduced delay for faster recovery
                                        self.camera_service.start()
                                        encoder_output = self.camera_service.get_encoder_output()
                                        last_frame_time = time.time()  # Reset timer
                                        logger.info("Camera service restarted successfully")
                                    except Exception as e:
                                        logger.error(f"Error restarting camera: {e}", exc_info=True)
                                        # If camera restart fails, we should still try to continue
                                        # but mark that we need to restart the whole stream
                                        await asyncio.sleep(1)
                                await asyncio.sleep(0.01)
                            
                        except Exception as e:
                            logger.error(f"Error streaming H.264 frame: {e}", exc_info=True)
                            await asyncio.sleep(0.1)
                            continue
                
                except asyncio.CancelledError:
                    break
                
                # Clean up before restart (ensure it's done)
                self._cleanup_ffmpeg()
                
                if self._shutdown_event.is_set():
                    break
                
                # Restart logic with backoff (but faster initial restart)
                restart_count += 1
                if restart_count >= max_restart_attempts:
                    delay = restart_delay * restart_count
                    logger.warning(f"Multiple restart failures detected. Waiting {delay}s before retry...")
                elif restart_count == 1:
                    # First restart attempt - be very quick
                    delay = 0.5
                    logger.info("First restart attempt, quick recovery...")
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
            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt, shutting down...")
                break
            except Exception as e:
                logger.error(f"Unexpected error in stream loop: {e}", exc_info=True)
                # Clean up on unexpected errors
                self._cleanup_ffmpeg()
                # Quick recovery for unexpected errors
                await asyncio.sleep(min(restart_delay, 1.0))
        
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

