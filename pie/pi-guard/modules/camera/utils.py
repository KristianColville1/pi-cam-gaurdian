"""Utility classes for camera module."""
import queue
import time
from typing import Optional, Callable
from picamera2.outputs import Output


class QueueOutput(Output):
    """Custom output class to capture H.264 encoded bytes in a queue.
    Uses minimal buffering to prevent stalling."""
    
    def __init__(self, maxsize=1, frame_callback: Optional[Callable[[], None]] = None):
        super().__init__()
        self.queue = queue.Queue(maxsize=maxsize)
        self.frame_callback = frame_callback  # Callback when frame is produced
        self.last_frame_time: Optional[float] = None
    
    def outputframe(self, frame, keyframe=True, timestamp=None, packet=None, audio=False):
        """Called by encoder to output a frame."""
        self.last_frame_time = time.time()
        if self.frame_callback:
            self.frame_callback()
        
        try:
            self.queue.put_nowait(frame)
        except queue.Full:
            # Drop oldest frame if queue is full (no buffering - prevent stalling)
            try:
                self.queue.get_nowait()
                self.queue.put_nowait(frame)
            except queue.Empty:
                pass
    
    def get_frame(self, timeout=None):
        """Get the next encoded frame from the queue."""
        try:
            return self.queue.get(timeout=timeout)
        except queue.Empty:
            return None

