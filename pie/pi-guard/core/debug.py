"""Debug logging handler with file rotation."""
import logging
from pathlib import Path
from logging import FileHandler


class RotatingDebugFileHandler(FileHandler):
    """
    Custom logging handler that rotates debug logs when they exceed 50MB.
    Maintains up to 100MB of logs across two files (current + previous).
    """
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
    LOG_FILE = "debug.log"
    OLD_LOG_FILE = "debug.log.old"
    
    def __init__(self, base_path: Path):
        """
        Initialize the rotating debug file handler.
        
        :param base_path: Base directory path for log files
        """
        self.base_path = Path(base_path)
        self.log_path = self.base_path / self.LOG_FILE
        self.old_log_path = self.base_path / self.OLD_LOG_FILE
        
        # Create directory if it doesn't exist
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize the base handler with the log file
        super().__init__(str(self.log_path), mode='a', encoding='utf-8', delay=False)
    
    def emit(self, record):
        """
        Emit a record, checking for rollover first.
        
        :param record: Log record to emit
        """
        if self.should_rollover(record):
            self.do_rollover()
        super().emit(record)
    
    def should_rollover(self, record):
        """
        Determine if rollover should occur.
        
        :param record: Log record
        :return: True if rollover should occur
        """
        if not self.log_path.exists():
            return False
        
        return self.log_path.stat().st_size >= self.MAX_FILE_SIZE
    
    def do_rollover(self):
        """
        Perform the rollover operation.
        Rotates debug.log to debug.log.old and creates a new debug.log.
        If debug.log.old exceeds 50MB, it is deleted.
        """
        if self.stream:
            self.stream.close()
            self.stream = None
        
        # If old log exists and is too large, delete it
        if self.old_log_path.exists():
            if self.old_log_path.stat().st_size >= self.MAX_FILE_SIZE:
                try:
                    self.old_log_path.unlink()
                except OSError:
                    pass  # Ignore errors when deleting
        
        # Move current log to old log if it exists
        if self.log_path.exists():
            try:
                if self.old_log_path.exists():
                    self.old_log_path.unlink()
                self.log_path.rename(self.old_log_path)
            except OSError:
                pass  # Ignore errors during rotation
        
        # Create new log file
        self.log_path.touch()
        
        # Reopen the stream
        self.stream = self._open()


def setup_debug_logging(base_path: str = None):
    """
    Set up debug file logging handler.
    
    :param base_path: Base directory path for log files (defaults to pi-guard root)
    :return: The handler instance
    """
    root_logger = logging.getLogger()
    
    # Check if handler already exists to prevent duplicates (e.g., during uvicorn reload)
    for existing_handler in root_logger.handlers:
        if isinstance(existing_handler, RotatingDebugFileHandler):
            return existing_handler  # Return existing handler if already added
    
    if base_path is None:
        # Get the pi-guard root directory (parent of core directory)
        base_path = Path(__file__).parent.parent
    
    handler = RotatingDebugFileHandler(base_path)
    handler.setLevel(logging.DEBUG)
    
    # Format: timestamp, level, logger name, message
    formatter = logging.Formatter(
        '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    
    # Add handler to root logger to capture all logs
    root_logger.addHandler(handler)
    
    return handler

