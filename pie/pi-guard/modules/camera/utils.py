"""Utility functions for camera service."""
import logging
import queue
import subprocess
from pathlib import Path
from picamera2.outputs import Output

logger = logging.getLogger(__name__)


class QueueOutput(Output):
    """Queue-based output for encoder frames."""
    
    def __init__(self, maxsize=1):
        super().__init__()
        self.queue = queue.Queue(maxsize=maxsize)
    
    def outputframe(self, frame, keyframe=True, timestamp=None, packet=None, audio=False):
        """Called by encoder to output a frame."""
        try:
            self.queue.put_nowait(frame)
        except queue.Full:
            # Drop oldest frame if queue is full
            try:
                self.queue.get_nowait()
                self.queue.put_nowait(frame)
            except queue.Empty:
                pass
    
    def get_frame(self, timeout=None):
        """Get a frame from the queue. Returns None if timeout."""
        try:
            return self.queue.get(timeout=timeout)
        except queue.Empty:
            return None


class MP4PipeOutput(Output):
    """Output that pipes H.264 frames to ffmpeg to create MP4 with metadata."""
    
    def __init__(self, output_path: Path, width: int, height: int, framerate: int, bitrate: int):
        super().__init__()
        self.output_path = Path(output_path)
        self.width = width
        self.height = height
        self.framerate = framerate
        self.bitrate = bitrate
        self.process: Optional[subprocess.Popen] = None
        self.frames_written = 0
        self.bytes_written = 0
        self._start_ffmpeg()
    
    def _start_ffmpeg(self):
        """Start ffmpeg process to pipe H.264 to MP4."""
        # For raw H.264 streams, ffmpeg should detect parameters from the stream
        # Use analyzeduration and probesize to help it detect parameters
        cmd = [
            "ffmpeg",
            "-f", "h264",  # Input format
            "-analyzeduration", "2147483647",  # Max analysis time
            "-probesize", "2147483647",  # Max probe size
            "-i", "-",  # Read from stdin
            "-c:v", "copy",  # Copy codec (no re-encoding)
            "-movflags", "+faststart",  # Optimize for streaming
            "-y",  # Overwrite output
            str(self.output_path)
        ]
        self.process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        logger.info(f"Started ffmpeg MP4 pipe: {self.output_path}")
        
        # Check if process started successfully (wait a bit, then check if still alive)
        import time
        time.sleep(0.1)
        if self.process.poll() is not None:
            # Process died immediately - read stderr
            stderr = self.process.stderr.read().decode() if self.process.stderr else "Unknown error"
            raise RuntimeError(f"FFmpeg process failed to start: {stderr}")
    
    def outputframe(self, frame, keyframe=True, timestamp=None, packet=None, audio=False):
        """Called by encoder to output a frame - write to ffmpeg stdin."""
        if self.process and self.process.stdin:
            try:
                if frame:
                    frame_bytes = bytes(frame) if not isinstance(frame, bytes) else frame
                    self.process.stdin.write(frame_bytes)
                    self.process.stdin.flush()
                    self.frames_written += 1
                    self.bytes_written += len(frame_bytes)
                    
                    # Log periodically to confirm data flow
                    if self.frames_written % 30 == 0:  # Every 30 frames (~1 second at 30fps)
                        logger.debug(f"MP4 pipe: {self.frames_written} frames, {self.bytes_written} bytes written")
            except (BrokenPipeError, OSError) as e:
                logger.error(f"Error writing to ffmpeg pipe: {e}")
                # Check if process is still alive
                if self.process and self.process.poll() is not None:
                    stderr = self.process.stderr.read().decode() if self.process.stderr else "Unknown error"
                    logger.error(f"FFmpeg process died: {stderr}")
    
    def close(self):
        """Close the ffmpeg process."""
        logger.info(f"Closing MP4 pipe: {self.frames_written} frames, {self.bytes_written} bytes total")
        if self.process:
            try:
                if self.process.stdin:
                    self.process.stdin.close()
                self.process.wait(timeout=5)
                # Check for errors
                if self.process.returncode != 0:
                    stderr = self.process.stderr.read().decode() if self.process.stderr else "Unknown error"
                    logger.error(f"FFmpeg exited with code {self.process.returncode}: {stderr}")
                else:
                    logger.info(f"FFmpeg completed successfully, file: {self.output_path}")
            except subprocess.TimeoutExpired:
                logger.warning("FFmpeg didn't finish, terminating...")
                self.process.terminate()
                try:
                    self.process.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    self.process.kill()
            except Exception as e:
                logger.error(f"Error closing ffmpeg process: {e}")
            finally:
                self.process = None
