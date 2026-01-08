"""Service instances - shared between processes and API."""

from modules.camera.service import CameraService
from modules.metrics.service import MetricsService
from modules.storage.service import StorageService
from modules.streaming.service import StreamingService

# Create service instances (not started)
camera_service = CameraService()
streaming_service = StreamingService(camera_service)
metrics_service = MetricsService()
storage_service = StorageService()

