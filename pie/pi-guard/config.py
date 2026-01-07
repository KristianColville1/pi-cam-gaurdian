"""Configuration settings for Pi Guardian service."""
import os
from typing import Optional
from pathlib import Path

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, skip
    pass


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
        mqtt_broker = os.getenv("MQTT_BROKER")
        if not mqtt_broker:
            raise ValueError("MQTT_BROKER environment variable must be set (see env.py for template)")
        self.MQTT_BROKER: str = mqtt_broker
        self.MQTT_PORT: int = int(os.getenv("MQTT_PORT", "9001"))  # WebSocket port (default)
        self.MQTT_TOPIC_PREFIX: str = os.getenv("MQTT_TOPIC_PREFIX", "sensors")
        self.MQTT_METRICS_TOPIC: str = f"{self.MQTT_TOPIC_PREFIX}/metrics"
        self.MQTT_CLIENT_ID: Optional[str] = os.getenv("MQTT_CLIENT_ID")
        
        # Streaming Configuration
        rtsp_url = os.getenv("RTSP_URL")
        if not rtsp_url:
            raise ValueError("RTSP_URL environment variable must be set (see env.py for template)")
        self.RTSP_URL: str = rtsp_url
        self.STREAM_RESOLUTION: str = os.getenv("STREAM_RESOLUTION", "1280:720")
        self.STREAM_FRAMERATE: int = int(os.getenv("STREAM_FRAMERATE", "15"))
        self.STREAM_BITRATE: int = int(os.getenv("STREAM_BITRATE", "512000"))  # 512kbps
        
        # Metrics Configuration
        self.METRICS_PUBLISH_INTERVAL: float = float(os.getenv("METRICS_PUBLISH_INTERVAL", "2.0"))
        
        # Backend API Configuration
        self.BACKEND_API_URL: Optional[str] = os.getenv("BACKEND_API_URL")
        
        # Storage Configuration (Bunny.net)
        # Video CDN (recording bucket)
        self.VIDEO_CDN_LIBRARY_ID: Optional[str] = os.getenv("VIDEO_CDN_LIBRARY_ID")
        self.VIDEO_CDN_HOST: Optional[str] = os.getenv("VIDEO_CDN_HOST")
        self.VIDEO_CDN_PULL_ZONE: Optional[str] = os.getenv("VIDEO_CDN_PULL_ZONE")
        self.VIDEO_CDN_API_KEY: Optional[str] = os.getenv("VIDEO_CDN_API_KEY")
        
        # Static Asset CDN (FTP)
        self.CDN_USER: Optional[str] = os.getenv("CDN_USER")
        self.CDN_HOST: Optional[str] = os.getenv("CDN_HOST")
        self.CDN_PORT: int = int(os.getenv("CDN_PORT", "21"))
        self.CDN_CONNECTION_TYPE: str = os.getenv("CDN_CONNECTION_TYPE", "PASSIVE")
        self.CDN_PASS: Optional[str] = os.getenv("CDN_PASS")
        
        # Camera Configuration (Picamera2)
        self.CAMERA_ENABLED: bool = os.getenv("CAMERA_ENABLED", "true").lower() == "true"
        self.CAMERA_IMU_CONFIG: bool = os.getenv("CAMERA_IMU_CONFIG", "true").lower() == "true"
        
        # Logging
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT: str = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"


# Global settings instance
settings = Settings()
