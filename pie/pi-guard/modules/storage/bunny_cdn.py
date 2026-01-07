"""Bunny.net Video CDN uploader."""
import logging
import requests
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class BunnyCDNUploader:
    """Upload videos to Bunny.net Video CDN."""
    
    def __init__(self, library_id: str, api_key: str, host: Optional[str] = None):
        self.library_id = library_id
        self.api_key = api_key
        self.host = host
        self.base_url = f"https://video.bunnycdn.com/library/{library_id}/videos"
    
    def upload_video(self, file_path: Path, title: Optional[str] = None) -> Optional[dict]:
        """
        Upload a video file to Bunny.net Video CDN.
        Returns video info dict with video ID and URL, or None on failure.
        """
        try:
            file_path = Path(file_path)
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return None
            
            # Create video object
            create_url = f"{self.base_url}"
            headers = {
                "AccessKey": self.api_key,
                "Content-Type": "application/json"
            }
            data = {
                "title": title or file_path.stem
            }
            
            response = requests.post(create_url, json=data, headers=headers, timeout=30)
            if response.status_code != 200:
                logger.error(f"Failed to create video object: {response.status_code} - {response.text}")
                return None
            
            video_data = response.json()
            video_id = video_data.get("guid")
            
            if not video_id:
                logger.error("No video ID returned from API")
                return None
            
            # Upload video file (use PUT with file data)
            upload_url = f"{self.base_url}/{video_id}"
            headers = {
                "AccessKey": self.api_key
            }
            
            with open(file_path, 'rb') as f:
                response = requests.put(upload_url, data=f, headers=headers, timeout=300)
            
            if response.status_code != 200:
                logger.error(f"Failed to upload video: {response.status_code} - {response.text}")
                return None
            
            result = response.json()
            
            # Build video URL if host is provided
            video_url = None
            if self.host:
                video_url = f"https://{self.host}/{video_id}/play_720p.mp4"
            
            return {
                "video_id": video_id,
                "url": video_url,
                "title": result.get("title"),
                "status": result.get("status")
            }
            
        except Exception as e:
            logger.error(f"Error uploading video to Bunny CDN: {e}", exc_info=True)
            return None

