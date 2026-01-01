# System Components

**PiCam Guardian - Component Design**

## Component Overview

The PiCam Guardian system consists of several key components distributed across the edge device and cloud infrastructure.

## Raspberry Pi Components

### Hardware Components

- **Raspberry Pi Board**: Single-board computer running the edge device software
- **Camera Module**: Provides video capture capabilities using `rpicam-vid`
- **Sense HAT**: Multi-sensor board providing:
  - Temperature sensors (from humidity and pressure sensors)
  - Humidity sensor
  - Pressure sensor
  - Orientation sensors (pitch, roll, yaw)
  - Accelerometer (x, y, z axes)

### Software Components

#### stream.py
- **Purpose**: Camera streaming service
- **Functionality**: 
  - Captures video using `rpicam-vid`
  - Encodes and streams video via `ffmpeg` to RTSP server
  - Manages streaming process with error handling and auto-restart
- **Protocol**: RTSP (Real-Time Streaming Protocol)
- **Configuration**: 1280x720 resolution, 30fps, 1Mbps bitrate
- **Service Management**: systemd service for automatic startup and resilience

#### metrics.py
- **Purpose**: Sensor data collection and publishing
- **Functionality**:
  - Reads sensor data from Sense HAT
  - Publishes metrics to MQTT broker every 2 seconds
  - Handles sensor data formatting and error management
- **Protocol**: MQTT (standard MQTT on port 1883)
- **Data Format**: JSON payload containing all sensor metrics
- **Service Management**: systemd service for continuous operation

## Cloud Server Components

### MediaMTX
- **Purpose**: RTSP server and WebRTC gateway
- **Functionality**:
  - Receives RTSP stream from Raspberry Pi
  - Converts RTSP to WebRTC for browser playback
  - Provides low-latency video streaming (~220ms)
- **Ports**: 8554 (RTSP), 8889 (WebRTC)
- **Service Management**: systemd service

### Mosquitto MQTT Broker
- **Purpose**: Message broker for sensor data
- **Functionality**:
  - Receives sensor data from Raspberry Pi
  - Distributes data to subscribed clients
  - Supports both standard MQTT and WebSocket connections
- **Ports**: 1883 (standard MQTT), 9001 (WebSocket)
- **Topic**: `sensors/metrics`
- **Service Management**: systemd service

### Web Server
- **Purpose**: Hosts frontend interface
- **Functionality**:
  - Serves HTML/CSS/JavaScript files
  - Provides access to video stream and sensor data display

## Frontend Components

### Web Interface (webpagetest.html)
- **Purpose**: User interface for monitoring system
- **Components**:
  - Embedded WebRTC video player for camera feed
  - Real-time sensor data table
  - MQTT WebSocket client for live data updates
- **Technologies**: HTML, CSS, JavaScript, Paho MQTT Client

## Component Interaction Diagram

*[Placeholder for component interaction diagram showing relationships between hardware and software components]*

---

**Navigation**

[← Previous Section](architecture.md) | [Table of Contents](index.md) | [Next Section →](network.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
