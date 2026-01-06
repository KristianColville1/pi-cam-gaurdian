"""Utility functions for streaming service operations."""
import logging
import subprocess
import time
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


class StreamHealthMonitor:
    """Monitors health of streaming process."""
    
    def __init__(self, no_frame_timeout: float = 5.0, no_write_timeout: float = 3.0):
        self.no_frame_timeout = no_frame_timeout
        self.no_write_timeout = no_write_timeout
        self.last_frame_time = time.time()
        self.last_write_time = time.time()
        self.frames_written = 0
    
    def update_frame_time(self):
        """Update the last frame received time."""
        self.last_frame_time = time.time()
    
    def update_write_time(self):
        """Update the last successful write time."""
        self.last_write_time = time.time()
        self.frames_written += 1
    
    def check_frame_timeout(self, current_time: float) -> bool:
        """Check if camera frame timeout has been exceeded."""
        return current_time - self.last_frame_time > self.no_frame_timeout
    
    def check_write_timeout(self, current_time: float) -> bool:
        """Check if write timeout has been exceeded."""
        return current_time - self.last_write_time > self.no_write_timeout
    
    def reset_frame_timer(self):
        """Reset the frame timer."""
        self.last_frame_time = time.time()
    
    def should_log_progress(self) -> bool:
        """Check if progress should be logged."""
        return self.frames_written % 100 == 0


def start_ffmpeg_process(ffmpeg_cmd: list) -> subprocess.Popen:
    """Start ffmpeg process with the given command."""
    logger.info("Starting ffmpeg process...")
    
    try:
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=0
        )
        
        if process.poll() is not None:
            exit_code = process.poll()
            raise RuntimeError(f"FFmpeg process exited immediately with code {exit_code}")
        
        logger.info(f"FFmpeg process started with PID: {process.pid}")
        return process
        
    except FileNotFoundError:
        logger.error("FFmpeg command not found. Please ensure ffmpeg is installed.")
        raise
    except Exception as e:
        logger.error(f"Failed to start ffmpeg process: {e}", exc_info=True)
        raise


def is_ffmpeg_healthy(process: Optional[subprocess.Popen]) -> Tuple[bool, Optional[int]]:
    """Check if ffmpeg process is healthy and running."""
    if process is None:
        return False, None
    
    exit_code = process.poll()
    if exit_code is not None:
        return False, exit_code
    
    if not process.stdin or process.stdin.closed:
        return False, None
    
    return True, None


def log_ffmpeg_stderr(process: subprocess.Popen):
    """Log ffmpeg stderr output for debugging."""
    try:
        stderr = process.stderr.read().decode('utf-8', errors='ignore')
        if stderr:
            logger.error(f"FFmpeg stderr: {stderr[:500]}")
    except Exception:
        pass


def write_frame_to_ffmpeg(process: subprocess.Popen, frame_bytes: bytes) -> bool:
    """Write frame bytes to ffmpeg process. Returns True if successful."""
    try:
        process.stdin.write(frame_bytes)
        process.stdin.flush()
        return True
    except BrokenPipeError:
        logger.error("FFmpeg stdin pipe broken - process likely died")
        return False
    except OSError as e:
        logger.error(f"OS error writing to ffmpeg: {e}")
        return False
    except ValueError as e:
        logger.error(f"Value error writing to ffmpeg (likely closed): {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error writing to ffmpeg: {e}", exc_info=True)
        return False


def calculate_restart_delay(restart_count: int, base_delay: float = 2.0) -> float:
    """Calculate restart delay with backoff. First restart is quick."""
    if restart_count == 1:
        return 0.5
    return base_delay

