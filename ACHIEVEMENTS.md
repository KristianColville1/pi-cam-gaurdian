# PiCam Guardian - Project Achievements

**Overview of Project Accomplishments**

---

## Project Summary

PiCam Guardian is a smart home monitoring system that provides remote visibility into environmental conditions and activity using a Raspberry Pi with sensors and camera capabilities. The system delivers real-time video streaming with ~220ms latency and comprehensive sensor monitoring through a modern web application.

## Overall Achievements

### Technical Accomplishments

- **Low-Latency Video Streaming**: Achieved ~220ms latency using WebRTC, creating a "mirror-like" viewing experience
- **Full-Stack Web Application**: Built production-ready React frontend with Express.js/TypeScript backend
- **Real-Time Data Transmission**: Implemented MQTT-based sensor data publishing with WebSocket frontend integration
- **Media Capture & Management**: Integrated image capture and video recording with CDN storage (Bunny.net)
- **Production Deployment**: Deployed to Oracle Cloud Infrastructure with SSL/TLS, domain configuration, and CI/CD pipeline
- **Database Integration**: TypeORM-based database with SQLite for development, entity models for users, sensors, files, and recordings
- **Authentication System**: JWT-based authentication with protected routes and secure session management

### Infrastructure & Architecture

- **Cloud Infrastructure**: Oracle Cloud free tier VPS with Ubuntu 22.04 LTS
- **Reverse Proxy**: Nginx configuration for frontend, backend API, and WebSocket connections
- **Service Management**: systemd services for MediaMTX, Mosquitto, backend API, and Raspberry Pi services
- **CDN Integration**: Bunny.net CDN for static assets and video library with webhook integration
- **Network Configuration**: Proper firewall rules, security groups, port forwarding, and SSL/TLS certificates

### Development Practices

- **TypeScript Migration**: Converted backend from JavaScript to TypeScript with minimal complexity
- **Modular Architecture**: Domain-Driven Design principles with repository pattern and manager layer
- **API Documentation**: OpenAPI specification generation with Swagger UI integration
- **Version Control**: Git-based workflow with branching strategy for releases
- **CI/CD Pipeline**: Automated frontend deployment via GitHub Actions

## Release Breakdown

### Baseline

**Core Networking & Streaming Infrastructure**

- Video streaming pipeline (RTSP → WebRTC)
- Low-latency streaming (~220ms)
- Cloud server setup and configuration
- Service automation and error handling

### Release 1

**Sensor Data Collection & Real-Time Updates**

- MQTT broker configuration (Mosquitto)
- Sensor data collection (Sense HAT)
- Real-time data publishing and frontend updates
- WebSocket integration

### Release 2

**Public Website & Database Integration**

- Domain and DNS configuration
- Full-stack architecture (React + Express.js)
- Database integration (TypeORM, SQLite)
- Authentication system (JWT)
- Production deployment (Nginx, SSL/TLS)
- UI/UX enhancements

### Release 3

**Media Capture, Storage & Management**

- Backend TypeScript migration
- Database entities (File, Recording)
- CDN integration (Bunny.net)
- Raspberry Pi camera integration (FastAPI)
- Storage module with CRUD operations
- Frontend storage management interface
- Webhook integration for recording status
- Recording status management system

## Key Metrics

- **Video Latency**: ~220ms (WebRTC)
- **Sensor Update Frequency**: Every 2 seconds
- **Database Entities**: 6 entities (User, Device, SensorMetric, File, Recording)
- **API Endpoints**: 20+ REST endpoints
- **Frontend Routes**: 7+ protected routes
- **Development Timeline**: 5-6 weeks
- **Releases Completed**: 3 major releases + baseline

## Technology Stack Summary

**Frontend**: React 19, Vite, React Bootstrap, React Router, Axios

**Backend**: Node.js, Express.js, TypeScript, TypeORM, SQLite, JWT

**Raspberry Pi**: Python 3, FastAPI, Picamera2, Paho MQTT, Sense HAT, FFmpeg

**Infrastructure**: Oracle Cloud, Ubuntu 22.04, Nginx, MediaMTX, Mosquitto, Bunny.net CDN

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

