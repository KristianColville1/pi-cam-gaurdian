#!/usr/bin/env python3
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8000
CAMERA_CMD = [
    "rpicam-vid",
    "--mode", "2304:1296:10",
    "--framerate", "30",
    "--bitrate", "2000000",
    "--inline",
    "--nopreview",
    "--timeout", "0",
    "-o", "-"
]

# Global camera process
camera_process = None

def start_camera():
    global camera_process
    if camera_process and camera_process.poll() is None:
        return camera_process  # Already running
    try:
        print("Starting camera process...")
        camera_process = subprocess.Popen(
            CAMERA_CMD, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        return camera_process
    except Exception as e:
        print("Failed to start camera:", e)
        return None

class StreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'video/H264')
        self.send_header('Connection', 'close')
        self.end_headers()

        cam = start_camera()
        if not cam:
            self.wfile.write(b"Camera not available\n")
            return

        try:
            while True:
                chunk = cam.stdout.read(4096)
                if not chunk:
                    # No data, sleep briefly to avoid hammering
                    time.sleep(0.01)
                    # Check if camera has exited
                    if cam.poll() is not None:
                        print("Camera process exited, will retry...")
                        break
                    continue
                self.wfile.write(chunk)
        except BrokenPipeError:
            # Client disconnected
            pass
        except Exception as e:
            print("Streaming error:", e)

def run_server():
    global camera_process
    server = ThreadingHTTPServer(("", PORT), StreamHandler)
    print(f"Streaming camera on port {PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down server...")
    finally:
        server.server_close()
        if camera_process:
            camera_process.terminate()
            camera_process.wait()
            print("Camera process terminated.")

if __name__ == "__main__":
    run_server()
