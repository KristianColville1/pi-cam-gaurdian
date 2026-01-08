"""Storage service for uploading files to Bunny.net."""
import asyncio
import logging
import shutil
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime

from config import settings
from modules.storage.bunny_cdn import BunnyCDNUploader
from modules.storage.bunny_ftp import BunnyFTPUploader

logger = logging.getLogger(__name__)


class StorageService:
    """Service for uploading files to Bunny.net storage."""
    
    def __init__(self):
        self.tmp_dir = Path("/tmp/pi-guard")
        self.tmp_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize uploaders if configured
        self.cdn_uploader: Optional[BunnyCDNUploader] = None
        self.ftp_uploader: Optional[BunnyFTPUploader] = None
        
        if settings.VIDEO_CDN_LIBRARY_ID and settings.VIDEO_CDN_API_KEY:
            self.cdn_uploader = BunnyCDNUploader(
                library_id=settings.VIDEO_CDN_LIBRARY_ID,
                api_key=settings.VIDEO_CDN_API_KEY,
                host=settings.VIDEO_CDN_HOST
            )
        
        if settings.CDN_USER and settings.CDN_HOST and settings.CDN_PASS:
            passive = settings.CDN_CONNECTION_TYPE.upper() == "PASSIVE"
            self.ftp_uploader = BunnyFTPUploader(
                host=settings.CDN_HOST,
                user=settings.CDN_USER,
                password=settings.CDN_PASS,
                port=settings.CDN_PORT,
                passive=passive
            )
    
    async def upload_video(self, file_path: Path, title: Optional[str] = None) -> Optional[Dict]:
        """
        Upload a video file to Bunny.net Video CDN.
        File is moved from tmp to CDN.
        Returns video info dict or None on failure.
        """
        if not self.cdn_uploader:
            logger.error("Video CDN uploader not configured")
            return None
        
        file_path = Path(file_path)
        if not file_path.exists():
            logger.error(f"Video file not found: {file_path}")
            return None
        
        # Upload in executor (blocking operation)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.cdn_uploader.upload_video(file_path, title)
        )
        
        if result:
            # Move file after successful upload (or delete, as it's now in CDN)
            try:
                file_path.unlink()
                logger.info(f"Removed uploaded video file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to remove uploaded file: {e}")
        
        return result
    
    async def upload_image(self, file_path: Path, remote_path: Optional[str] = None) -> Optional[str]:
        """
        Upload an image file to Bunny.net FTP.
        File is moved from tmp to CDN.
        Returns remote URL or None on failure.
        """
        if not self.ftp_uploader:
            logger.error("FTP uploader not configured")
            return None
        
        file_path = Path(file_path)
        if not file_path.exists():
            logger.error(f"Image file not found: {file_path}")
            return None
        
        if not remote_path:
            # Generate remote path with timestamp
            timestamp = datetime.now().strftime("%Y/%m/%d")
            remote_path = f"images/{timestamp}/{file_path.name}"
        
        # Upload in executor (blocking operation)
        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(
            None,
            lambda: self.ftp_uploader.upload_file(file_path, remote_path)
        )
        
        if success:
            # Build URL
            url = f"https://{settings.CDN_HOST}/{remote_path}"
            
            # Remove file after successful upload
            try:
                file_path.unlink()
                logger.info(f"Removed uploaded image file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to remove uploaded file: {e}")
            
            return url
        
        return None
    
    def get_tmp_path(self, filename: str) -> Path:
        """Get a temporary file path for storing files before upload."""
        return self.tmp_dir / filename

