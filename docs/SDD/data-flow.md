# Data Flow

**PiCam Guardian - Data Flow Architecture**

## Data Flow Overview

PiCam Guardian handles two primary data streams: video streaming and sensor data. These streams are processed independently and use different protocols optimized for their specific requirements.

## Video Streaming Data Flow

### Flow Path

1. **Video Capture** (Raspberry Pi)
   - Camera module captures video frames
   - `rpicam-vid` processes raw video data
   - Output: H.264 encoded video stream

2. **Video Encoding** (Raspberry Pi)
   - `ffmpeg` receives H.264 stream via pipe
   - Applies scaling (1280x720) and encoding optimizations
   - Output: Optimized RTSP stream

3. **RTSP Transmission** (Network)
   - RTSP stream transmitted over TCP to cloud server
   - Destination: `rtsp://145.241.195.101:8554/cam`
   - Protocol: RTSP over TCP

4. **RTSP Reception** (Cloud Server)
   - MediaMTX receives RTSP stream on port 8554
   - Stream stored in memory buffer for distribution

5. **WebRTC Conversion** (Cloud Server)
   - MediaMTX converts RTSP to WebRTC format
   - WebRTC stream available on port 8889
   - Optimized for low-latency browser playback

6. **Video Playback** (Frontend)
   - Web browser connects to WebRTC stream
   - Embedded iframe displays live video feed
   - Low-latency playback (~220ms total latency)

### Video Streaming Flow Diagram

*[Placeholder for video streaming flow diagram showing: Camera → rpicam-vid → ffmpeg → RTSP → MediaMTX → WebRTC → Browser]*

## Sensor Data Flow

### Flow Path

1. **Sensor Data Collection** (Raspberry Pi)
   - Sense HAT sensors read environmental and motion data
   - `metrics.py` collects sensor readings every 2 seconds
   - Data includes: temperature, humidity, pressure, orientation, acceleration

2. **Data Formatting** (Raspberry Pi)
   - Sensor data formatted as JSON object
   - Values rounded to appropriate precision
   - Logged for monitoring and debugging

3. **MQTT Publishing** (Raspberry Pi)
   - `metrics.py` publishes JSON payload to MQTT broker
   - Topic: `sensors/metrics`
   - Protocol: MQTT over TCP (port 1883)
   - Destination: `145.241.195.101:1883`

4. **Message Broker** (Cloud Server)
   - Mosquitto MQTT broker receives published messages
   - Broker distributes messages to all subscribed clients
   - Supports both standard MQTT and WebSocket protocols

5. **WebSocket Distribution** (Cloud Server)
   - Mosquitto provides WebSocket interface on port 9001
   - Messages forwarded to WebSocket-connected clients

6. **Frontend Reception** (Frontend)
   - Paho MQTT JavaScript client connects via WebSocket
   - Subscribes to `sensors/metrics` topic
   - Receives real-time sensor data updates

7. **Data Display** (Frontend)
   - JavaScript parses incoming JSON messages
   - Table cells updated with new sensor values
   - Real-time display refresh every 2 seconds

### Sensor Data Flow Diagram

*[Placeholder for sensor data flow diagram showing: Sense HAT → metrics.py → MQTT (1883) → Mosquitto → MQTT WebSocket (9001) → Browser → Table Update]*

## Data Flow Characteristics

### Video Streaming
- **Latency**: ~220ms end-to-end
- **Resolution**: 1280x720 (720p)
- **Frame Rate**: 30 fps
- **Bitrate**: 1 Mbps
- **Protocol**: RTSP → WebRTC
- **Direction**: Unidirectional (Pi → Server → Frontend)

### Sensor Data
- **Update Frequency**: Every 2 seconds
- **Protocol**: MQTT (standard and WebSocket)
- **Data Format**: JSON
- **Direction**: Unidirectional (Pi → Server → Frontend)
- **Topic**: `sensors/metrics`

## Data Flow Summary Diagram

*[Placeholder for comprehensive data flow diagram showing both video and sensor data flows in parallel]*

---

**Navigation**

[← Previous Section](network.md) | [Table of Contents](index.md) | [Next Section →](api-design.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
