"""Bunny.net FTP uploader for static assets."""
import logging
import ftplib
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class BunnyFTPUploader:
    """Upload static assets to Bunny.net via FTP."""
    
    def __init__(self, host: str, user: str, password: str, port: int = 21, passive: bool = True):
        self.host = host
        self.user = user
        self.password = password
        self.port = port
        self.passive = passive
    
    def upload_file(self, local_path: Path, remote_path: str) -> bool:
        """
        Upload a file to Bunny.net FTP.
        Returns True on success, False on failure.
        """
        try:
            local_path = Path(local_path)
            if not local_path.exists():
                logger.error(f"File not found: {local_path}")
                return False
            
            ftp = ftplib.FTP()
            ftp.connect(self.host, self.port)
            ftp.login(self.user, self.password)
            
            if self.passive:
                ftp.set_pasv(True)
            
            # Ensure remote directory exists
            remote_dir = '/'.join(remote_path.split('/')[:-1]) if '/' in remote_path else ''
            if remote_dir:
                try:
                    ftp.mkd(remote_dir)
                except ftplib.error_perm:
                    pass  # Directory might already exist
            
            # Upload file
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
            
            ftp.quit()
            logger.info(f"Uploaded {local_path} to {remote_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error uploading file via FTP: {e}", exc_info=True)
            try:
                ftp.quit()
            except:
                pass
            return False

