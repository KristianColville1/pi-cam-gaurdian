"""Camera service with dual-stream support."""
import logging
import subprocess
import time
from pathlib import Path
from typing import Optional
from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import FileOutput, Output
from config import settings
from modules.camera.utils import QueueOutput

logger = logging.getLogger(__name__)


class CameraService:
    """
    Camera service with dual-stream support:
    - Main stream: High resolution for snapshots/recording
    - Lores stream: Lower resolution for streaming (H.264 encoded)
    """
    
    def __init__(self):
        self.camera: Optional[Picamera2] = None
        self._encoder: Optional[H264Encoder] = None
        self._encoder_output: Optional[QueueOutput] = None
        self._recording_encoder: Optional[H264Encoder] = None
        self._recording_output: Optional[Output] = None
        self._recording_file: Optional[Path] = None
        self._final_mp4_path: Optional[Path] = None
        self._running = False
        self._recording = False
    
    def start(self):
        """Start the camera service."""
        if self._running:
            logger.warning("Camera service is already running")
            return
        
        logger.info("Starting camera service...")
        
        try:
            # Parse streaming resolution
            stream_width, stream_height = settings.STREAM_RESOLUTION.split(':')
            stream_size = (int(stream_width), int(stream_height))
            
            # Initialize camera
            self.camera = Picamera2()
            
            # Configure camera with dual streams
            video_config = self.camera.create_video_configuration(
                main={"size": (1920, 1080)},  # High-res for snapshots
                lores={"size": stream_size}    # Low-res for streaming
            )
            self.camera.configure(video_config)
            
            # Create H.264 encoder for lores stream
            self._encoder_output = QueueOutput(maxsize=1)
            self._encoder = H264Encoder(bitrate=settings.STREAM_BITRATE)
            self._encoder.output = self._encoder_output
            
            # Start encoder and camera
            self.camera.start_encoder(self._encoder)
            self.camera.start()
            
            self._running = True
            logger.info(f"Camera started with dual streams: main=1920x1080, lores={stream_size}, bitrate={settings.STREAM_BITRATE}bps, framerate={settings.STREAM_FRAMERATE}fps")
            
        except Exception as e:
            logger.error(f"Failed to start camera: {e}", exc_info=True)
            self._cleanup()
            raise
    
    def stop(self):
        """Stop the camera service and clean up resources."""
        if not self._running:
            return
        
        logger.info("Stopping camera service...")
        self._running = False
        self._cleanup()
        logger.info("Camera service stopped")
    
    def _cleanup(self):
        """Clean up camera resources."""
        # Stop recording if active
        self._stop_recording_internal()
        
        try:
            if self.camera is not None:
                if self.camera.started:
                    self.camera.stop()
                if self._encoder is not None:
                    self.camera.stop_encoder(self._encoder)
        except Exception as e:
            logger.error(f"Error cleaning up camera: {e}")
        finally:
            self.camera = None
            self._encoder = None
            self._encoder_output = None
    
    def get_camera(self) -> Optional[Picamera2]:
        """Get the Picamera2 instance."""
        return self.camera
    
    async def capture_frame(self):
        """Capture a frame from the main (high-resolution) stream."""
        if self.camera is None or not self.camera.started:
            raise RuntimeError("Camera not started")
        
        # capture_array is blocking, so run in executor
        # Use a proper function instead of lambda to avoid closure issues
        import asyncio
        
        def _capture():
            """Helper function to capture frame in executor."""
            return self.camera.capture_array("main")
        
        loop = asyncio.get_event_loop()
        logger.debug("Capturing frame in executor...")
        frame = await loop.run_in_executor(None, _capture)
        logger.debug("Frame captured successfully")
        return frame
    
    def get_encoder_output(self) -> QueueOutput:
        """Get the encoder output queue for reading H.264 frames from lores stream."""
        if self.camera is None or self._encoder_output is None:
            raise RuntimeError("Camera not started")
        return self._encoder_output
    
    def _verify_recording_file(self, file_path: Path, max_wait: float = 1.5, min_size: int = 100) -> bool:
        """
        Verify that the recording file exists and is receiving data.
        
        Args:
            file_path: Path to the recording file
            max_wait: Maximum time to wait for file to start receiving data (seconds)
            min_size: Minimum file size in bytes to consider valid
        
        Returns:
            True if file exists and is receiving data, False otherwise
        """
        # Give encoder a moment to start writing
        time.sleep(0.3)
        
        # Check if file exists
        if not file_path.exists():
            logger.warning(f"Recording file does not exist after encoder start: {file_path}")
            return False
        
        # Wait and check for data growth
        initial_size = file_path.stat().st_size
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            time.sleep(0.2)
            current_size = file_path.stat().st_size
            
            # If file has grown or reached minimum size, recording is working
            if current_size >= min_size or current_size > initial_size:
                logger.debug(f"Recording file validated: {file_path} ({current_size} bytes)")
                return True
        
        # Final check - file exists but didn't grow enough
        final_size = file_path.stat().st_size
        if final_size < min_size:
            logger.error(f"Recording file too small after {max_wait}s: {file_path} ({final_size} bytes, expected >= {min_size})")
            return False
        
        logger.debug(f"Recording file validated: {file_path} ({final_size} bytes)")
        return True
    
    def start_recording(self, file_path: Path) -> bool:
        """Start recording video - records to H.264, converts to MP4 on stop."""
        if not self._running or not self.camera or not self.camera.started:
            logger.error("Camera not started, cannot start recording")
            return False
        
        if self._recording:
            logger.warning("Recording already in progress")
            return False
        
        try:
            file_path = Path(file_path)
            # Record to H.264 first (will convert to MP4 on stop)
            h264_path = file_path.with_suffix('.h264') if file_path.suffix == '.mp4' else file_path
            h264_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Create file output for recording (simple H.264 file)
            self._recording_output = FileOutput(str(h264_path))
            
            # Create encoder for recording (using main stream - high res)
            self._recording_encoder = H264Encoder(bitrate=settings.STREAM_BITRATE)
            
            # Use start_recording() for file recording (not start_encoder)
            # This is the recommended API for recording to files
            self.camera.start_recording(self._recording_encoder, self._recording_output)
            
            # Store both paths (H.264 for recording, MP4 for final output)
            self._recording_file = h264_path
            self._final_mp4_path = file_path.with_suffix('.mp4') if h264_path.suffix == '.h264' else file_path
            
            # Verify that the file exists and is receiving data
            if not self._verify_recording_file(h264_path):
                logger.error(f"Recording file validation failed: {h264_path}")
                self._stop_recording_internal()
                return False
            
            self._recording = True
            logger.info(f"Started recording to: {h264_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start recording: {e}", exc_info=True)
            self._stop_recording_internal()
            return False
    
    def stop_recording(self) -> Optional[Path]:
        """Stop recording, convert H.264 to MP4 with metadata, return MP4 path."""
        if not self._recording:
            logger.warning("Not currently recording")
            return None
        
        h264_path = self._recording_file
        mp4_path = self._final_mp4_path
        self._stop_recording_internal()
        
        if not h264_path or not h264_path.exists():
            logger.error(f"H.264 recording file not found: {h264_path}")
            return None
        
        # Convert H.264 to MP4 using ffmpeg (stream copy for efficiency)
        logger.info(f"Converting {h264_path} to MP4: {mp4_path}")
        try:
            # First try: copy stream without re-encoding (fastest, preserves quality)
            cmd = [
                "ffmpeg",
                "-f", "h264",
                "-r", "30",  # Input framerate
                "-i", str(h264_path),
                "-c:v", "copy",  # Copy video stream (no re-encoding)
                "-movflags", "+faststart",  # Optimize for web streaming
                "-y",  # Overwrite output file
                str(mp4_path)
            ]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
                timeout=300  # 5 minute timeout
            )
            
            # Remove H.264 file after successful conversion
            h264_path.unlink()
            logger.info(f"Recording converted to MP4 (stream copy): {mp4_path}")
            return mp4_path
            
        except subprocess.CalledProcessError as e:
            # Stream copy failed, try re-encoding as fallback
            logger.warning(f"FFmpeg stream copy failed: {e.stderr.decode() if e.stderr else str(e)}")
            logger.info("Trying ffmpeg re-encode as fallback...")
            try:
                cmd = [
                    "ffmpeg",
                    "-f", "h264",
                    "-r", "30",
                    "-i", str(h264_path),
                    "-c:v", "libx264",
                    "-preset", "ultrafast",
                    "-crf", "23",
                    "-movflags", "+faststart",
                    "-y",
                    str(mp4_path)
                ]
                subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    check=True,
                    timeout=600  # 10 minute timeout for re-encoding
                )
                h264_path.unlink()
                logger.info(f"Recording converted to MP4 (re-encoded): {mp4_path}")
                return mp4_path
            except Exception as fallback_error:
                logger.error(f"FFmpeg re-encode also failed: {fallback_error}")
                return h264_path  # Return H.264 file as fallback
        except FileNotFoundError:
            logger.error("FFmpeg not found, cannot convert recording")
            return h264_path  # Return H.264 file as fallback
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg conversion timed out")
            return h264_path  # Return H.264 file as fallback
        except Exception as e:
            logger.error(f"Error converting recording: {e}", exc_info=True)
            return h264_path  # Return H.264 file as fallback
    
    def _stop_recording_internal(self):
        """Internal method to stop recording."""
        try:
            if self._recording_encoder and self.camera:
                # Use stop_recording() to match start_recording()
                self.camera.stop_recording()
        except Exception as e:
            logger.error(f"Error stopping recording: {e}")
        
        # FileOutput doesn't need explicit close, but check anyway
        if self._recording_output:
            try:
                if hasattr(self._recording_output, 'close'):
                    self._recording_output.close()
            except Exception as e:
                logger.error(f"Error closing recording output: {e}")
        
        # Clean up
        self._recording_encoder = None
        self._recording_output = None
        self._recording_file = None
        self._final_mp4_path = None
        self._recording = False
    
    def is_recording(self) -> bool:
        """Check if currently recording."""
        return self._recording
    
    def is_running(self) -> bool:
        """Check if the service is running."""
        return self._running
