"""Utility functions for camera service."""
import logging
import queue
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
