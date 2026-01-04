from picamera2 import Picamera2
from picamera2.encoders import H264Encoder
from picamera2.outputs import Output
import queue
from config import settings

class QueueOutput(Output):
    """Custom output class to capture H.264 encoded bytes in a queue."""
    def __init__(self, maxsize=10):
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
        """Get the next encoded frame from the queue."""
        try:
            return self.queue.get(timeout=timeout)
        except queue.Empty:
            return None

class CameraService:
    def __init__(self):
        self.camera = None
        self._encoder = None
        self._encoder_output = None

    def start(self):
        if self.camera is None:
            self.camera = Picamera2()
            # Parse resolution
            width, height = settings.STREAM_RESOLUTION.split(':')
            size = (int(width), int(height))
            
            # Configure camera with video configuration
            video_config = self.camera.create_video_configuration(
                main={"size": size}
            )
            self.camera.configure(video_config)
            
            # Create H.264 encoder
            self._encoder_output = QueueOutput()
            self._encoder = H264Encoder(bitrate=settings.STREAM_BITRATE)
            self._encoder.output = self._encoder_output
            
            self.camera.start_encoder(self._encoder)
            self.camera.start()
        elif not self.camera.started:
            self.camera.start()

    def stop(self):
        if self.camera is not None:
            if self.camera.started:
                self.camera.stop()
            if self._encoder is not None:
                self.camera.stop_encoder(self._encoder)
                self._encoder = None
                self._encoder_output = None

    def get_camera(self):
        """Get the Picamera2 instance."""
        return self.camera

    def capture_frame(self):
        """Capture a frame from the camera."""
        if self.camera is None:
            raise RuntimeError("Camera not started. Call start() first.")
        return self.camera.capture_array()

    def get_encoder_output(self):
        """Get the encoder output queue for reading H.264 frames."""
        if self.camera is None or self._encoder_output is None:
            raise RuntimeError("Camera not started. Call start() first.")
        return self._encoder_output
