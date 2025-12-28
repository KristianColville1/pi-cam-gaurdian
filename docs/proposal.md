**PiCam Guardian – Smart Home Safety & Monitoring System**

Author: Kristian Colville
Student No: W20114790

repo: https://github.com/KristianColville1/pi-cam-gaurdian

---

## **1. Introduction**

PiCam Guardian is an IoT-based smart home monitoring prototype developed using a Raspberry Pi.

The goal is to provide remote visibility into both the environmental conditions and activity in a small room or home space. This is applicable to domains such as  home security,  indoor safety, and  general remote monitoring.

The Raspberry Pi will collect sensor data (e.g., temperature, humidity, pressure, motion) and provide a live video stream using the Pi Camera. The device will publish sensor readings and status information to a backend service running on a remote/cloud machine. This backend stores data, generates alerts when thresholds are exceeded, and exposes a web-based dashboard.

Users will be able to view  live sensor values,  a live video feed,  historical charts, and system alerts through the dashboard.

The project demonstrates the full IoT architecture stack, including sensors, local processing, networking (MQTT/HTTP/WebSockets), cloud integration, and a usable application layer.

---

## **2. Proposed Technologies**

### **Devices / Sensors**

* Raspberry Pi
* Pi Camera module for live video
* SenseHAT

### **Networking & Protocols**

* **MQTT** for IoT messaging between Pi and backend
* **HTTP/REST** for backend API endpoints
* **WebSockets** for live UI updates
* **RTSP or WebRTC** for video streaming
* **HTTPS** for secure access to the dashboard

### **Programming Languages / Frameworks**

* **Python** or **Node.js** on the Raspberry Pi for sensor collection & messaging
* **Node.js + TypeScript** backend service
* **React/TypeScript** for dashboard UI
* **PostgreSQL** for persistent storage

## **3. Proposed Tools & Platforms**

### **Development Tools**

* Visual Studio Code
* Git & GitHub for source control and documentation

### **Cloud / Deployment**

* Docker & Docker Compose for containerised backend + dashboard
* systemd for running Pi services persistently
* A cloud VM to host:
  * MQTT broker
  * Backend API & WebSocket server
  * Dashboard web app

### **Additional Tools**

* Chart.js or Recharts for UI charts
* Typeorm for database mapper
* nginx as a reverse proxy for HTTPS and routing
