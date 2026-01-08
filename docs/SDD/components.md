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

#### pi-guard Application (Unified Service)

**Architecture**: Unified Python application using FastAPI for HTTP API with background process management

**Components**:

##### startup.py

- **Purpose**: Unified startup script for all background processes
- **Functionality**:
  - Manages all background services as daemon threads
  - Starts camera service, metrics service, and streaming service
  - Launches FastAPI HTTP server after services are initialized
  - Provides unified process lifecycle management
- **Service Management**: systemd service runs `startup.py` on boot
- **Process Architecture**: Services run as independent background threads, not managed by FastAPI

##### main.py (FastAPI Application)

- **Purpose**: HTTP API server for remote control and status
- **Functionality**:
  - Provides REST API endpoints for camera control
  - Exposes service status and health endpoints
  - Serves OpenAPI documentation
  - Routes requests to underlying services
- **Protocol**: HTTP/HTTPS (REST API)
- **Port**: 80 (external access via No-IP dynamic DNS)
- **Architecture**: FastAPI application, services are accessed via app state (not managed by FastAPI)

##### Camera Service (modules/camera/service.py)

- **Purpose**: Camera management and image/video capture
- **Functionality**:
  - Manages Picamera2 camera instance
  - Provides multi-channel streaming support
  - Handles image capture with frame processing
  - Manages video recording with pause recording pattern (prevents camera interruptions)
  - Integrates with storage service for media uploads
- **Key Features**:
  - Pause recording pattern: Always recording, but controls file output to prevent camera interruptions
  - Multi-channel architecture: Supports live streaming, image capture, and video recording simultaneously
  - Frame capture API for snapshots
- **Dependencies**: Picamera2, PIL/Pillow for image processing

##### Streaming Service (modules/streaming/service.py)

- **Purpose**: Video streaming to cloud server
- **Functionality**:
  - Captures video using Picamera2 encoder output
  - Encodes and streams video via `ffmpeg` to RTSP server
  - Manages streaming process with error handling and auto-restart
  - Health monitoring and recovery mechanisms
- **Protocol**: RTSP (Real-Time Streaming Protocol)
- **Configuration**: 1280x720 resolution, 30fps, 1Mbps bitrate
- **Architecture**: Async service running in background thread with event loop

##### Metrics Service (modules/metrics/service.py)

- **Purpose**: Sensor data collection and publishing
- **Functionality**:
  - Reads sensor data from Sense HAT
  - Publishes metrics to MQTT broker every 2 seconds
  - Handles sensor data formatting and error management
  - Non-blocking asynchronous operations to prevent camera stalling
- **Protocol**: MQTT (standard MQTT on port 1883)
- **Data Format**: JSON payload containing all sensor metrics
- **Architecture**: Background service running in daemon thread

##### Storage Service (modules/storage/service.py)

- **Purpose**: Media file management and CDN integration
- **Functionality**:
  - Uploads images to Bunny.net storage zone (FTP)
  - Uploads video recordings to Bunny.net video library (API)
  - Manages file paths and temporary storage
  - Handles FFmpeg encoding for video containerization (MP4)
- **CDN Integration**: Bunny.net (storage zones and video library)
- **Dependencies**: Bunny.net FTP client, Bunny.net API client, FFmpeg

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

### Backend API (Express.js/TypeScript)

- **Purpose**: Application backend with database and API endpoints
- **Functionality**:
  - REST API for authentication, storage management, camera control
  - Database integration (TypeORM, SQLite)
  - Storage module with File and Recording entities
  - Webhook endpoints for CDN status updates
  - Pi-Guard API proxy endpoints
- **Port**: 3000 (internal), proxied via Nginx
- **Service Management**: systemd service

### Nginx Reverse Proxy

- **Purpose**: Reverse proxy and SSL termination
- **Functionality**:
  - Proxies requests to backend API
  - Serves frontend static files
  - WebSocket proxy for MQTT connections
  - SSL/TLS termination with Let's Encrypt certificates
- **Protocol**: HTTPS/WSS
- **Domain**: pi-guardian.kcolville.com

### Bunny.net CDN

- **Purpose**: Content delivery network for media storage
- **Components**:
  - **Storage Zone** (pi-guardian): Static asset hosting for images
  - **Video Library** (pi-guardian-recordings): Video storage and streaming
  - **Pull Zone** (pi-guardian.b-cdn.net): Content delivery URL
- **Functionality**:
  - Stores images and video recordings
  - Provides video streaming via embeddable player
  - Webhook notifications for recording processing status
  - Automatic video encoding and processing

## Frontend Components

### React Web Application

- **Purpose**: Modern single-page application for system monitoring and control
- **Architecture**: React 19 with Vite, React Bootstrap, React Router
- **Components**:
  - **Portal Page**: Live video stream, sensor data display, camera controls
  - **Storage Page**: File and recording management with tables, filtering, pagination
  - **API Documentation Pages**: OpenAPI/Swagger UI for API exploration
  - **Authentication**: Login modal, protected routes, session management
- **Key Features**:
  - Real-time video playback via WebRTC (embedded iframe)
  - Real-time sensor data via MQTT WebSocket (Paho MQTT Client)
  - Camera control (capture, record start/stop) via REST API
  - Storage management (view, edit, delete files and recordings)
  - Responsive design with light/dark theme support
- **Technologies**: React 19, Vite, React Bootstrap, React Router, Axios, Paho MQTT Client

**Navigation**

[← Previous Section](architecture.md) | [Table of Contents](index.md) | [Next Section →](network.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
