#!/usr/bin/env python3
"""
RTSP Camera Stream Service
Streams video from Raspberry Pi camera to RTSP server using rpicam-vid and ffmpeg.
Designed to run as a systemd service with auto-restart capabilities.
"""
import subprocess
import time
import signal
import sys
import logging
from datetime import datetime

# Configure logging for systemd
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# RTSP server endpoint
RTSP_URL = "rtsp://pi-guardian.kcolville.com:8554/cam"

# Camera command
CAMERA_CMD = [
    "rpicam-vid",
    "--mode", "1280:720:10",
    "--framerate", "30",
    "--bitrate", "1000000",
    "--inline",
    "--nopreview",
    "--timeout", "0",
    "-o", "-"
]

# FFmpeg command
FFMPEG_CMD = [
    "ffmpeg",
    "-f", "h264",
    "-i", "-",
    "-vf", "scale=1280:720",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-g", "30",
    "-rtsp_transport", "tcp",
    "-f", "rtsp",
    RTSP_URL
]

# Global process references
camera_process = None
ffmpeg_process = None
shutdown_flag = False

# Restart configuration
RESTART_DELAY = 2  # seconds to wait before restarting
MAX_RESTART_ATTEMPTS = 5  # max consecutive failures before longer delay
restart_count = 0

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully."""
    global shutdown_flag
    logger.info("Received shutdown signal, terminating processes...")
    shutdown_flag = True
    cleanup_processes()

def cleanup_processes():
    """Clean up camera and ffmpeg processes."""
    global camera_process, ffmpeg_process
    
    # Terminate ffmpeg first (consumer)
    if ffmpeg_process:
        try:
            logger.info("Terminating ffmpeg process...")
            ffmpeg_process.terminate()
            try:
                ffmpeg_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                logger.warning("FFmpeg didn't terminate, killing...")
                ffmpeg_process.kill()
                ffmpeg_process.wait()
        except Exception as e:
            logger.error(f"Error terminating ffmpeg: {e}")
        finally:
            ffmpeg_process = None
    
    # Terminate camera (producer)
    if camera_process:
        try:
            logger.info("Terminating camera process...")
            camera_process.terminate()
            try:
                camera_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                logger.warning("Camera didn't terminate, killing...")
                camera_process.kill()
                camera_process.wait()
        except Exception as e:
            logger.error(f"Error terminating camera: {e}")
        finally:
            camera_process = None

def start_streaming():
    """Start both camera and ffmpeg processes with pipe."""
    global camera_process, ffmpeg_process
    
    try:
        logger.info("Starting camera process...")
        camera_process = subprocess.Popen(
            CAMERA_CMD,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=0
        )
        
        logger.info("Starting ffmpeg process...")
        ffmpeg_process = subprocess.Popen(
            FFMPEG_CMD,
            stdin=camera_process.stdout,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=0
        )
        
        # Close camera's stdout in parent process (ffmpeg has it)
        camera_process.stdout.close()
        
        logger.info(f"Streaming started. Camera PID: {camera_process.pid}, FFmpeg PID: {ffmpeg_process.pid}")
        return True
        
    except FileNotFoundError as e:
        logger.error(f"Command not found: {e}. Please ensure rpicam-vid and ffmpeg are installed.")
        return False
    except Exception as e:
        logger.error(f"Failed to start streaming processes: {e}")
        cleanup_processes()
        return False

def monitor_processes():
    """Monitor camera and ffmpeg processes, restart if needed."""
    global camera_process, ffmpeg_process, restart_count, shutdown_flag
    
    while not shutdown_flag:
        # Check if processes are still running
        camera_running = camera_process and camera_process.poll() is None
        ffmpeg_running = ffmpeg_process and ffmpeg_process.poll() is None
        
        if not camera_running or not ffmpeg_running:
            # One or both processes have died
            if not camera_running:
                exit_code = camera_process.poll() if camera_process else None
                logger.warning(f"Camera process died with exit code: {exit_code}")
                # Read stderr for error details
                if camera_process:
                    try:
                        stderr = camera_process.stderr.read().decode('utf-8', errors='ignore')
                        if stderr:
                            logger.error(f"Camera stderr: {stderr[:500]}")
                    except:
                        pass
            
            if not ffmpeg_running:
                exit_code = ffmpeg_process.poll() if ffmpeg_process else None
                logger.warning(f"FFmpeg process died with exit code: {exit_code}")
                # Read stderr for error details
                if ffmpeg_process:
                    try:
                        stderr = ffmpeg_process.stderr.read().decode('utf-8', errors='ignore')
                        if stderr:
                            logger.error(f"FFmpeg stderr: {stderr[:500]}")
                    except:
                        pass
            
            # Clean up dead processes
            cleanup_processes()
            
            if shutdown_flag:
                break
            
            # Restart with backoff on repeated failures
            restart_count += 1
            if restart_count >= MAX_RESTART_ATTEMPTS:
                delay = RESTART_DELAY * restart_count
                logger.warning(f"Multiple restart failures detected. Waiting {delay}s before retry...")
            else:
                delay = RESTART_DELAY
            
            logger.info(f"Restarting streaming processes in {delay}s... (attempt {restart_count})")
            time.sleep(delay)
            
            if start_streaming():
                restart_count = 0  # Reset on successful start
            else:
                logger.error("Failed to restart streaming processes")
        
        # Small sleep to avoid busy waiting
        time.sleep(1)

def main():
    """Main entry point."""
    global shutdown_flag
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("Starting RTSP camera stream service...")
    logger.info(f"RTSP URL: {RTSP_URL}")
    
    if not start_streaming():
        logger.error("Failed to start streaming. Exiting.")
        sys.exit(1)
    
    try:
        monitor_processes()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as e:
        logger.error(f"Unexpected error in main loop: {e}", exc_info=True)
    finally:
        cleanup_processes()
        logger.info("Service stopped.")

if __name__ == "__main__":
    main()