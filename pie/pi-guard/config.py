"""Configuration settings for Pi Guardian service."""
import os
from typing import Optional


class Settings:
    """Application configuration settings."""
    
    def __init__(self):
        """Initialize settings from environment variables."""
        # Application settings
        self.APP_NAME: str = "Pi Guardian Service"
        self.APP_VERSION: str = "0.1.0"
        self.DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
        
        # Server settings
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.PORT: int = int(os.getenv("PORT", "8000"))
        
        # MQTT Configuration
        self.MQTT_BROKER: str = os.getenv("MQTT_BROKER", "pi-guardian.kcolville.com")
        self.MQTT_PORT: int = int(os.getenv("MQTT_PORT", "1883"))
        self.MQTT_TOPIC_PREFIX: str = os.getenv("MQTT_TOPIC_PREFIX", "sensors")
        self.MQTT_METRICS_TOPIC: str = f"{self.MQTT_TOPIC_PREFIX}/metrics"
        self.MQTT_CLIENT_ID: Optional[str] = os.getenv("MQTT_CLIENT_ID")
        
        # Streaming Configuration
        self.RTSP_URL: str = os.getenv("RTSP_URL", "rtsp://pi-guardian.kcolville.com:8554/cam")
        self.STREAM_RESOLUTION: str = os.getenv("STREAM_RESOLUTION", "1280:720")
        self.STREAM_FRAMERATE: int = int(os.getenv("STREAM_FRAMERATE", "30"))
        self.STREAM_BITRATE: int = int(os.getenv("STREAM_BITRATE", "1000000"))
        
        # Metrics Configuration
        self.METRICS_PUBLISH_INTERVAL: float = float(os.getenv("METRICS_PUBLISH_INTERVAL", "2.0"))
        
        # Camera Configuration (Picamera2)
        self.CAMERA_ENABLED: bool = os.getenv("CAMERA_ENABLED", "true").lower() == "true"
        self.CAMERA_IMU_CONFIG: bool = os.getenv("CAMERA_IMU_CONFIG", "true").lower() == "true"
        
        # Logging
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT: str = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"


# Global settings instance
settings = Settings()
