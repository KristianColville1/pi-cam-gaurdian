"""Camera service with dual-stream support."""
import logging
import subprocess
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
            self._recording_output = FileOutput(h264_path)
            
            # Create encoder for recording (using main stream - high res)
            self._recording_encoder = H264Encoder(bitrate=settings.STREAM_BITRATE)
            self._recording_encoder.output = self._recording_output
            
            # Start recording encoder on main stream
            self.camera.start_encoder(self._recording_encoder, "main")
            
            # Store both paths (H.264 for recording, MP4 for final output)
            self._recording_file = h264_path
            self._final_mp4_path = file_path.with_suffix('.mp4') if h264_path.suffix == '.h264' else file_path
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
        
        # Convert H.264 to MP4 using MP4Box (better for H.264 streams)
        logger.info(f"Converting {h264_path} to MP4: {mp4_path}")
        try:
            import subprocess
            # Use MP4Box to mux H.264 into MP4 container with metadata
            cmd = [
                "MP4Box",
                "-add", str(h264_path),
                "-fps", "30",  # Set framerate
                "-new", str(mp4_path)
            ]
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            
            # Remove H.264 file after successful conversion
            h264_path.unlink()
            logger.info(f"Recording converted to MP4: {mp4_path}")
            return mp4_path
            
        except subprocess.CalledProcessError as e:
            logger.error(f"MP4Box conversion failed: {e.stderr.decode() if e.stderr else str(e)}")
            # Fallback: try ffmpeg with re-encode
            logger.info("Trying ffmpeg re-encode as fallback...")
            try:
                cmd = [
                    "ffmpeg",
                    "-f", "h264",
                    "-i", str(h264_path),
                    "-c:v", "libx264",
                    "-preset", "ultrafast",
                    "-crf", "23",
                    "-movflags", "+faststart",
                    "-y",
                    str(mp4_path)
                ]
                subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
                h264_path.unlink()
                logger.info(f"Recording converted to MP4 via ffmpeg: {mp4_path}")
                return mp4_path
            except Exception:
                return h264_path  # Return H.264 file as fallback
        except FileNotFoundError:
            # MP4Box not installed, use ffmpeg re-encode
            logger.info("MP4Box not found, using ffmpeg re-encode...")
            try:
                cmd = [
                    "ffmpeg",
                    "-f", "h264",
                    "-i", str(h264_path),
                    "-c:v", "libx264",
                    "-preset", "ultrafast",
                    "-crf", "23",
                    "-movflags", "+faststart",
                    "-y",
                    str(mp4_path)
                ]
                subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
                h264_path.unlink()
                logger.info(f"Recording converted to MP4: {mp4_path}")
                return mp4_path
            except Exception as e:
                logger.error(f"FFmpeg conversion failed: {e}")
                return h264_path  # Return H.264 file as fallback
        except Exception as e:
            logger.error(f"Error converting recording: {e}")
            return h264_path  # Return H.264 file as fallback
    
    def _stop_recording_internal(self):
        """Internal method to stop recording."""
        try:
            if self._recording_encoder and self.camera:
                self.camera.stop_encoder(self._recording_encoder)
        except Exception as e:
            logger.error(f"Error stopping recording encoder: {e}")
        
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
