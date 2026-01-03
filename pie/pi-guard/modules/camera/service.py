from picamera2 import Picamera2

class CameraService:
    def __init__(self):
        self.picam2 = Picamera2()
        self.config = self.picam2.create_video_configuration()

    def start(self):
        self.picam2.configure(self.config)
        self.picam2.start()

    def stop(self):
        self.picam2.stop()

    def get_camera(self):
        return self.picam2
