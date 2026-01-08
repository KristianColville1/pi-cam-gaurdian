# Data Flow

**PiCam Guardian - Data Flow Architecture**

## Data Flow Overview

PiCam Guardian handles two primary data streams: video streaming and sensor data. These streams are processed independently and use different protocols optimized for their specific requirements.

## Video Streaming Data Flow

### Flow Path

1. **Video Capture** (Raspberry Pi - Camera Service)
   - Picamera2 captures video frames from camera module
   - Multi-channel encoder provides H.264 encoded output
   - Streaming service accesses encoder output
   - Output: H.264 encoded video stream

2. **Video Encoding** (Raspberry Pi - Streaming Service)
   - Streaming service receives H.264 frames from camera encoder
   - `ffmpeg` processes frames via stdin pipe
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

*[Placeholder for video streaming flow diagram showing: Camera → Picamera2 → Streaming Service → ffmpeg → RTSP → MediaMTX → WebRTC → Browser]*

**Service Architecture**: Camera service and streaming service run as background threads/processes managed by `startup.py`, independent of FastAPI HTTP server.

## Sensor Data Flow

### Flow Path

1. **Sensor Data Collection** (Raspberry Pi - Metrics Service)
   - Sense HAT sensors read environmental and motion data
   - Metrics service collects sensor readings every 2 seconds
   - Non-blocking asynchronous operations prevent camera stalling
   - Data includes: temperature, humidity, pressure, orientation, acceleration

2. **Data Formatting** (Raspberry Pi - Metrics Service)
   - Sensor data formatted as JSON object
   - Values rounded to appropriate precision
   - Logged for monitoring and debugging

3. **MQTT Publishing** (Raspberry Pi - Metrics Service)
   - Metrics service publishes JSON payload to MQTT broker
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
   - Nginx proxies WebSocket connections (WSS)

6. **Frontend Reception** (Frontend)
   - Paho MQTT JavaScript client connects via WebSocket (WSS)
   - Subscribes to `sensors/metrics` topic
   - Receives real-time sensor data updates

7. **Data Display** (Frontend)
   - React components parse incoming JSON messages
   - Sensor data table updated with new values
   - Real-time display refresh every 2 seconds

### Sensor Data Flow Diagram

*[Placeholder for sensor data flow diagram showing: Sense HAT → Metrics Service → MQTT (1883) → Mosquitto → MQTT WebSocket (9001/WSS) → Browser → React Table Update]*

**Service Architecture**: Metrics service runs as background thread/process managed by `startup.py`, independent of FastAPI HTTP server.

## Image Capture Data Flow

### Flow Path

1. **Capture Request** (Frontend)
   - User clicks capture button
   - React component sends GET request to backend API
   - Endpoint: `/api/pi-guard/camera/capture`

2. **API Proxy** (Backend API)
   - Backend receives authenticated request
   - Proxies request to Pi-Guard FastAPI service
   - Endpoint: `http://[pi-ip]:80/camera/capture`

3. **Camera Capture** (Raspberry Pi - FastAPI/Camera Service)
   - FastAPI receives request and accesses camera service
   - Camera service captures frame from Picamera2
   - Frame converted to RGB format (RGBA → RGB)
   - Image saved to temporary file (JPEG)

4. **CDN Upload** (Raspberry Pi - Storage Service)
   - Storage service uploads image to Bunny.net storage zone via FTP
   - File path generated: `images/YYYY/MM/DD/snapshot_TIMESTAMP.jpg`
   - Upload URL returned: `https://uk.storage.bunnycdn.com/...`

5. **Database Storage** (Backend API)
   - Backend receives capture response from Pi-Guard
   - Creates File entity record in database
   - Stores file path, CDN URL, metadata
   - Returns file information to frontend

6. **Display** (Frontend)
   - Frontend receives file information
   - Displays image using CDN URL: `https://pi-guardian.b-cdn.net/[path]`
   - Image visible in storage interface or portal

### Image Capture Flow Diagram

*[Placeholder for image capture flow diagram showing: Frontend → Backend API → Pi-Guard FastAPI → Camera Service → Storage Service → Bunny.net CDN → Backend DB → Frontend]*

## Video Recording Data Flow

### Flow Path (Start Recording)

1. **Start Request** (Frontend)
   - User clicks record button
   - React component sends GET request to backend API
   - Endpoint: `/api/pi-guard/camera/recording/start`

2. **API Proxy** (Backend API)
   - Backend receives authenticated request
   - Proxies request to Pi-Guard FastAPI service
   - Endpoint: `http://[pi-ip]:80/camera/recording/start`

3. **Recording Start** (Raspberry Pi - FastAPI/Camera Service)
   - FastAPI receives request and accesses camera service
   - Camera service starts recording using pause recording pattern
   - Recording writes to temporary file (H.264 stream)
   - Returns confirmation to backend

### Flow Path (Stop Recording & Processing)

4. **Stop Request** (Frontend)
   - User clicks stop button
   - React component sends GET request to backend API
   - Endpoint: `/api/pi-guard/camera/recording/stop`

5. **API Proxy** (Backend API)
   - Backend receives authenticated request
   - Proxies request to Pi-Guard FastAPI service
   - Endpoint: `http://[pi-ip]:80/camera/recording/stop`

6. **Recording Stop** (Raspberry Pi - FastAPI/Camera Service)
   - Camera service stops recording (pauses file output)
   - FFmpeg packages H.264 stream into MP4 container
   - Storage service uploads MP4 to Bunny.net video library via API
   - Video library returns `video_guid` for tracking

7. **Database Storage** (Backend API)
   - Backend receives recording response with `video_guid`
   - Creates Recording entity record in database
   - Stores video_guid, status (queued), metadata
   - Returns recording information to frontend

8. **CDN Processing** (Bunny.net)
   - Bunny.net processes video (encoding, optimization)
   - Status updates sent via webhooks during processing:
     - Status 0: Queued
     - Status 1: Processing
     - Status 2: Encoding
     - Status 3: Finished
     - Status 4: Resolution finished
     - Status 5: Failed

9. **Webhook Updates** (Backend API)
   - Backend receives webhook POST requests from Bunny.net
   - Endpoint: `/api/webhooks/recordings`
   - Updates Recording entity status in database
   - Fetches video metadata (file_size, duration) from Bunny.net API
   - Updates database with complete metadata

10. **Display** (Frontend)
    - Frontend polls backend for recording updates
    - Recording displayed in storage interface with status badges
    - Finished recordings embedded using Bunny.net video player iframe
    - URL format: `https://iframe.mediadelivery.net/embed/[library_id]/[video_guid]`

### Video Recording Flow Diagram

*[Placeholder for video recording flow diagram showing: Frontend → Backend API → Pi-Guard FastAPI → Camera Service → Storage Service → Bunny.net Video Library → Webhook → Backend API → Database → Frontend]*

## Data Flow Characteristics

### Video Streaming
- **Latency**: ~220ms end-to-end
- **Resolution**: 1280x720 (720p)
- **Frame Rate**: 30 fps
- **Bitrate**: 1 Mbps
- **Protocol**: RTSP → WebRTC
- **Direction**: Unidirectional (Pi → Server → Frontend)
- **Service**: Background streaming service (independent thread)

### Sensor Data
- **Update Frequency**: Every 2 seconds
- **Protocol**: MQTT (standard and WebSocket/WSS)
- **Data Format**: JSON
- **Direction**: Unidirectional (Pi → Server → Frontend)
- **Topic**: `sensors/metrics`
- **Service**: Background metrics service (independent thread)

### Image Capture
- **Protocol**: HTTP/HTTPS (REST API)
- **Direction**: Bidirectional (Frontend ↔ Backend ↔ Pi)
- **Storage**: Bunny.net CDN (storage zone)
- **Database**: File entity record
- **Access**: CDN URL via pull zone

### Video Recording
- **Protocol**: HTTP/HTTPS (REST API), Webhooks
- **Direction**: Bidirectional (Frontend ↔ Backend ↔ Pi), Unidirectional (CDN → Backend)
- **Storage**: Bunny.net CDN (video library)
- **Database**: Recording entity record
- **Processing**: Async CDN encoding with status updates
- **Access**: Embedded video player iframe

## Unified Process Architecture

All Raspberry Pi services run as background processes/threads managed by `startup.py`:

- **Camera Service**: Background thread managing Picamera2 instance
- **Streaming Service**: Background thread with async event loop for RTSP streaming
- **Metrics Service**: Background thread for sensor data collection and MQTT publishing
- **FastAPI Server**: HTTP server for API endpoints (runs after services are started)

Services are independent of FastAPI and continue running even if HTTP server restarts. FastAPI accesses services via application state, not process management.

## Data Flow Summary Diagram

*[Placeholder for comprehensive data flow diagram showing: video streaming, sensor data, image capture, and video recording flows in parallel]*

---

**Navigation**

[← Previous Section](network.md) | [Table of Contents](index.md) | [Next Section →](api-design.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
