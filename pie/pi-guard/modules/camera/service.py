from picamera2 import Picamera2
import logging
from config import settings

logger = logging.getLogger(__name__)


class CameraService:
    def __init__(self):
        self.picam2 = Picamera2()
        # Parse resolution from settings
        width, height = map(int, settings.STREAM_RESOLUTION.split(':'))
        self.config = self.picam2.create_video_configuration(
            main={"size": (width, height)}
        )
        self._running = False

    def start(self):
        """Start the camera service."""
        if self._running:
            logger.warning("Camera service is already running")
            return
        
        logger.info("Starting camera service...")
        self.picam2.configure(self.config)
        self.picam2.start()
        self._running = True
        logger.info("Camera service started")

    def stop(self):
        """Stop the camera service."""
        if not self._running:
            return
        
        logger.info("Stopping camera service...")
        self.picam2.stop()
        self._running = False
        logger.info("Camera service stopped")

    def get_camera(self):
        """Get the Picamera2 instance."""
        return self.picam2
    
    def is_running(self) -> bool:
        """Check if the camera service is running."""
        return self._running
    
    def capture_frame(self):
        """Capture a frame from the camera."""
        if not self._running:
            raise RuntimeError("Camera service is not running")
        return self.picam2.capture_array()
