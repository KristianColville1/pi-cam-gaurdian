# PiCam Guardian

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

**Smart Home Safety & Monitoring System**

PiCam Guardian is an IoT-based smart home monitoring prototype that provides remote visibility into environmental conditions and activity using a Raspberry Pi with sensors and camera capabilities.

---

## Table of Contents

* [Project Goals](#project-goals)
  * [Personal Goals](#personal-goals)
* [User Experience (UX)](#user-experience-ux)
  * [Target Audience](#target-audience)
* [Design](#design)
  * [Color Scheme](#color-scheme)
  * [Typography](#typography)
  * [Layout](#layout)
  * [Icons](#icons)
* [Technologies &amp; Tools](#technologies--tools)
* [Features](#features)
  * [Baseline](#baseline)
  * [Release 1](#release-1)
  * [Release 2](#release-2)
  * [Release 3](#release-3)
* [System Design](#system-design)
* [Database Design](#database-design)
* [Development Log](#development-log)
* [Data](#data)
* [Testing](#testing)
* [Bugs](#bugs)
  * [Bug Details](#bug-details)
* [Releases](#releases)
  * [Overview](#overview)
  * [Git Workflow](#git-workflow)
  * [Development Strategy](#development-strategy)
    * [Timeline](#timeline)
    * [Git Scope &amp; Branching](#git-scope--branching)
  * [Release Results](#release-results)
    * [Baseline](#baseline-1)
    * [Release 1](#release-1-1)
    * [Release 2](#release-2-1)
    * [Release 3](#release-3-1)
* [Development &amp; Deployment](#development--deployment)
  * [Version Control](#version-control)
  * [Cloning the Repository](#cloning-this-repository)
  * [Server Setup](#server-setup)
  * [Setting Up MQTT Mosquitto](#setting-up-mqtt-mosquitto)
* [Credits](#credits)

---

## Project Goals

PiCam Guardian aims to create a smart home monitoring system that provides real-time remote visibility into a physical space. The primary goal is to develop a low-latency camera streaming solution that enables remote monitoring with near-instantaneous feedback, making it feel like looking through a window rather than viewing a delayed video feed.

**Core Objectives:**

- **Remote Camera Access**: Primary goal is to access the camera feed remotely and see what's happening in real-time with minimal latency
- **Low-Latency Streaming**: Achieve sub-300ms latency for video streaming, making remote monitoring feel natural and responsive
- **Environmental Monitoring**: Collect and display real-time sensor data (temperature, humidity, pressure, motion) alongside video feed
- **Smart Home Integration**: Build a foundation for smart home safety and monitoring applications
- **Accessibility**: Create a system that can be used by various users, including elderly relatives who may benefit from remote monitoring solutions

### Personal Goals

As the primary developer and intended user of PiCam Guardian, this project serves multiple purposes:

- **Technical Learning**: Gain hands-on experience with IoT development, cloud infrastructure, networking, and real-time communication protocols
- **Practical Application**: Build a working system that solves a real need for remote monitoring and visibility
- **Performance Optimization**: Achieve and demonstrate low-latency streaming capabilities, with current implementation achieving ~220ms latency - effectively making it "may as well be a mirror" in terms of responsiveness
- **System Integration**: Learn to integrate multiple technologies (Raspberry Pi, cloud services, web technologies, protocols like RTSP, WebRTC, MQTT) into a cohesive system
- **Production Deployment**: Experience the full software development lifecycle from prototyping to deployment on cloud infrastructure

## User Experience (UX)

PiCam Guardian is designed to provide an intuitive, real-time monitoring experience that feels natural and responsive. The system prioritizes low latency and clear visual feedback to create a sense of presence and immediacy when monitoring a remote location.

**Core User Experience Principles:**

- **Immediate Feedback**: With ~220ms latency achieved, the video feed feels nearly instant, creating a mirror-like experience rather than traditional delayed video streaming
- **Real-Time Information**: Both video and sensor data update in real-time, providing comprehensive situational awareness
- **Simple Interface**: Clean, accessible web interface that doesn't require specialized software or complex setup
- **Remote Accessibility**: Access the system from anywhere with an internet connection through a standard web browser
- **Reliable Connection**: Robust error handling and automatic reconnection ensure continuous monitoring capabilities

### Target Audience

**Primary Audience: Developer/Owner**

As the primary intended user, the system is designed for personal use to:
- Monitor a space remotely with real-time video feed
- Keep track of environmental conditions and sensor readings
- Have peace of mind knowing what's happening in a monitored location
- Experience the benefits of a low-latency monitoring system for personal or professional use

**Secondary Audience: Elderly Care & Family Monitoring**

The system is designed to be adaptable for use cases such as:
- **Elderly Relatives**: Family members can remotely monitor elderly relatives to check on their well-being, see daily activity, and ensure safety
- **Pet Monitoring**: Check on pets when away from home
- **Home Security**: Monitor home entrances, common areas, or specific rooms for security purposes
- **Caregivers**: Professional or family caregivers can remotely check on individuals who need periodic monitoring

**User Requirements:**

- Basic web browser access (no specialized software needed)
- Internet connection (broadband recommended for optimal video quality)
- Mobile or desktop device (system is responsive and works on various screen sizes)
- No technical expertise required for end users (system setup is done by the developer/admin)

## Design

### Color Scheme

### Typography

### Layout

### Icons

## Technologies & Tools

## Features

### Baseline

**Programming & Networking Strands**

- Camera streaming infrastructure using `rpicam-vid` and `ffmpeg`
- RTSP streaming pipeline from Raspberry Pi to cloud server
- Oracle Cloud free tier server setup and configuration
- MediaMTX installation and systemd service configuration for RTSP/WebRTC streaming
- Network configuration (NSG rules, iptables, port forwarding)
- Low-latency video streaming (~220ms) via WebRTC
- Python streaming service (`stream.py`) with error handling and auto-restart
- Basic web interface with embedded WebRTC player
- Dynamic DNS setup for remote access preparation

### Release 1

**Sensor Data Collection & Real-Time Updates**

- MQTT broker (Mosquitto) installation and configuration on cloud server
- MQTT server listening on ports 1883 (standard MQTT) and 9001 (WebSocket)
- Sense HAT sensor metrics collection via `metrics.py`
- Real-time sensor data publishing to MQTT broker (temperature, humidity, pressure, orientation, acceleration)
- WebSocket connection from frontend to MQTT broker
- Dynamic table updates in web interface for real-time sensor data
- Complete end-to-end data flow: Raspberry Pi sensors → MQTT → Frontend display
- Systemd service configuration for metrics collection service
- Network configuration for MQTT ports (1883 and 9001)

### Release 2

**Public Website & Database Integration**

- Development of public-facing website interface
- Implementation of database concepts from database design strand
- Historical data storage and retrieval capabilities
- Enhanced user interface and user experience features

### Release 3

## System Design

The system architecture, component design, and technical specifications for PiCam Guardian are documented in detail in the [System Design Document (SDD)](docs/SDD/index.md).

The SDD covers architecture overview, system components, network architecture, data flow, API design, security considerations, and deployment architecture.

[View System Design Document →](docs/SDD/index.md)

---

## Database Design

The database schema, data models, relationships, and storage design for PiCam Guardian are documented in detail in the [Database Design Document (DDD)](docs/DDD/index.md).

The DDD covers database schema, entity relationships, data models, tables, indexes, and constraints.

[View Database Design Document →](docs/DDD/index.md)

---

## Development Log

The development log provides insight into the development process, documenting the journey from initial concepts to implementation. These entries capture procedural notes, challenges encountered, solutions explored, and the iterative thought process behind design decisions.

These logs are journal-style entries intended to give readers insight into the development experience rather than serving as step-by-step documentation or tutorials.

[View Development Log Index →](docs/dev-log/index.md)

---

## Data

## Testing

## Bugs

1: The camera falls over after a period of time, suspect its the ffmpeg process and checking the camera is actually available.

### Bug Details

## Releases

### Overview

### Git Workflow

### Development Strategy

The assignment is delivered in multiple iterations:

- **Baseline**
- **Release 1** → **Release 3**
- **Release 4** and beyond (if time permits)

The development approach follows an agile methodology with a focus on rapid prototyping and iterative refinement. The strategy moves from the most abstract concepts to concrete implementations, starting with minimal viable products (MVPs) and progressively optimizing toward production-ready solutions.

**Core Principles:**

- **Abstract to Concrete**: Begin with high-level architecture and system design, then progressively implement specific components
- **Rapid Prototyping**: Quickly build working prototypes to validate concepts and identify challenges early
- **Optimization Iteration**: Each release refines and optimizes previous implementations based on learnings
- **Continuous Mini-MVPs**: Each iteration delivers a functional, testable product that builds upon previous releases
- **Agile Adaptation**: Respond to technical challenges and requirements changes through flexible, iterative development

This approach ensures early validation of core functionality while maintaining flexibility to refine and optimize based on real-world testing and feedback.

#### Timeline

| Milestone                 | Date           |
| ------------------------- | -------------- |
| Project Start             | Dec 7th, 2025  |
| Development Start         | Dec 28th, 2025 |
| Expected Final Submission | Jan 8th, 2026  |
| Approximate Duration      | 5/6 weeks      |

#### Git Scope & Branching

| Branch       | Description                   |
| ------------ | ----------------------------- |
| `main`     | Stable, release-ready version |
|              |                               |
| `baseline` | Baseline project              |
| `rel1`     | Release 1                     |
| `rel2`     | Release 2                     |
| `rel3`     | Release 3                     |

### Release Results

#### Baseline

Successfully established the core networking and programming infrastructure for the camera streaming system. The baseline release focused on proving the concept and establishing a working video streaming pipeline from the Raspberry Pi to a remote server.

**Achievements:**

- **Video Streaming Pipeline**: Implemented end-to-end RTSP streaming from Raspberry Pi camera to Oracle Cloud server using `rpicam-vid` piped through `ffmpeg`
- **Low Latency Streaming**: Achieved ~220ms latency using WebRTC through MediaMTX, exceeding industry standards for live streaming
- **Cloud Infrastructure**: Successfully configured Oracle Cloud free tier instance with proper network security groups, iptables rules, and port management
- **Service Automation**: Configured systemd services for MediaMTX and streaming processes to ensure automatic startup and resilience
- **Network Configuration**: Resolved complex cloud networking challenges including NSG rules, VNIC configuration, and firewall settings
- **Streaming Service**: Developed robust Python streaming service with error handling, process monitoring, and auto-restart capabilities

**Current State:**

The baseline release provides a functional streaming system with camera feed accessible via WebRTC through a web interface.

**Development Approach:**

Implementing a cloud server setup early in the baseline release presented scope and time risks, but was approached from an MVP perspective to validate core infrastructure and networking concepts. Heavy refinements for security hardening, performance optimization, and production-ready configurations are planned for future iterations, allowing the baseline to focus on establishing a working foundation.

**Prepared for Future Releases:**

Networking infrastructure and streaming pipeline are established and ready for integration with additional features such as sensor data collection, database storage, authentication systems, and enhanced user interfaces.

#### Release 1

Successfully implemented sensor data collection and real-time data transmission infrastructure. Release 1 builds upon the baseline streaming foundation by adding comprehensive sensor monitoring capabilities.

**Achievements:**

- **MQTT Infrastructure**: Configured Mosquitto MQTT broker on the cloud server with dual-protocol support (standard MQTT on port 1883 and WebSocket on port 9001)
- **Sensor Data Collection**: Implemented `metrics.py` service to collect Sense HAT sensor metrics including temperature (from humidity and pressure sensors), humidity, pressure, orientation (pitch, roll, yaw), and acceleration (x, y, z axes)
- **Real-Time Data Publishing**: Established continuous data flow with metrics published to MQTT broker every 2 seconds
- **WebSocket Integration**: Enabled WebSocket connections from web frontend to MQTT broker for real-time data reception
- **Dynamic Frontend Updates**: Implemented real-time table updates in web interface, displaying live sensor data as it's received
- **Service Automation**: Configured systemd service for metrics collection with proper error handling and logging
- **Network Configuration**: Configured firewall rules and security groups for MQTT ports (1883 and 9001)

**Current State:**

Release 1 provides a complete real-time monitoring system with both video streaming (from baseline) and sensor data collection. The system demonstrates full end-to-end data flow from Raspberry Pi sensors through MQTT to the web frontend, with all data updating in real-time.

**Prepared for Future Releases:**

The MQTT infrastructure and real-time data flow established in Release 1 provides the foundation for database integration, historical data storage, and advanced analytics features planned for Release 2.

#### Release 2

Successfully implemented a public-facing website with full-stack architecture, database integration, authentication system, and production deployment infrastructure. Release 2 transforms the system from a prototype into a production-ready web application accessible via public domain.

**Achievements:**

- **Domain & DNS Configuration**: Purchased and configured domain (pi-guardian.kcolville.com) with Cloudflare DNS, set up reserved IP address on Oracle Cloud for stable public access
- **Backend Infrastructure**: Built Express.js backend with TypeORM for database abstraction, SQLite database for local development, modular architecture using Domain-Driven Design principles, ES Modules support, decorator-based controller system, JWT authentication middleware
- **Frontend Infrastructure**: Created React application with Vite build system, React Bootstrap for UI components, atomic design architecture for component organization, React Router for client-side routing, authentication context and protected routes, responsive design with theme support (light/dark mode)
- **Database Integration**: Implemented TypeORM entity system, SQLite database initialization, user authentication entities and relationships, database seeding scripts for initial admin account, prepared architecture for future data persistence
- **Production Deployment**: Configured Nginx reverse proxy for frontend, backend API, and WebSocket connections, implemented SSL/TLS with Let's Encrypt certificates via Certbot, automated HTTP to HTTPS redirection, configured systemd services for backend process management, deployed frontend static files and backend application to cloud server
- **WebSocket Security**: Resolved WSS (WebSocket Secure) connection issues through nginx proxy configuration, implemented proper WebSocket upgrade headers for secure MQTT connections, ensured all production traffic uses HTTPS/WSS protocols
- **UI/UX Enhancements**: Created logo and favicon assets, implemented modern web interface with React Bootstrap components, developed authentication flow with login modal and protected routes, integrated video stream and sensor data display into React components, improved user experience with theme switching and responsive layout

**Current State:**

Release 2 provides a fully functional public-facing web application accessible at https://pi-guardian.kcolville.com. The system includes a complete authentication system, database infrastructure, and production-ready deployment configuration. Users can access the system securely via HTTPS, authenticate to view the monitoring portal, and access real-time video and sensor data through a modern web interface.

**Technical Highlights:**

- **Low Latency Maintained**: Despite adding full-stack architecture and production infrastructure, the system maintains ~220ms video latency, preserving the "mirror-like" experience from baseline
- **Secure Production Environment**: All traffic encrypted with SSL/TLS, secure authentication system, protected routes, and secure WebSocket connections
- **Scalable Architecture**: Modular backend design, database abstraction layer, and component-based frontend architecture provide foundation for future feature expansion
- **Production Challenges Resolved**: Addressed nginx proxy configuration issues, WebSocket upgrade problems, port configuration errors, and deployment workflow challenges

**Prepared for Future Releases:**

The database infrastructure and authentication system established in Release 2 provides the foundation for data persistence, historical data storage, user management, and advanced features planned for Release 3. The production deployment pipeline and infrastructure are now established for continued development and deployment.

#### Release 3

## Development & Deployment

### Version Control

I used [Visual Studio Code](https://code.visualstudio.com/) as a local repository and IDE & [GitHub](https://github.com/) as a remote repository.

1. Firstly, I needed to create a new repository on Github [pi-cam-gaurdian](https://github.com/KristianColville1/pi-cam-gaurdian).
2. I opened that repository on my local machine by copying the URL from that repository and cloning it from my IDE for use.
3. Visual Studio Code opened a new workspace for me.
4. I created files and folders to use.
5. To push my newly created files to GitHub I used the terminal by pressing Ctrl + shift + `.
6. A new terminal opened and then I used the below steps.

   - `git add (name of the file)` *This selects the file for the commit*
   - `git commit -m "Commit message: (i.e. Initial commit)"` *Allows the developer to assign a specific concise statement to the commit*
   - `git push` *The final command sends the code to GitHub*

### Cloning this Repository

If you would like to clone this repository please follow the bellow steps.

Instructions:

1. Log into GitHub.
2. Go to the repository you wish to clone.
3. Click the green "Code" button.
4. Copy the URL provided under the HTTPS option.
5. Open your preferred IDE with Git installed.
6. Open a new terminal window in your IDE.
7. Enter the following command exactly: `git clone the-URL-you-copied-from-GitHub`.
8. Press Enter.

### Server Setup

**Oracle Cloud Free Tier Setup**

The cloud infrastructure for PiCam Guardian is hosted on Oracle Cloud Infrastructure (OCI) using the free tier offering.

**Initial Setup Process:**

1. **Oracle Cloud Account Creation**

   - Signed up for Oracle Cloud free tier account
   - Accessed the Oracle Cloud Console

   ![Oracle Cloud Signup](docs/dev-log/image/30-12-2025/1767105717858.png)
   ![Oracle Cloud Console](docs/dev-log/image/30-12-2025/1767105930294.png)
2. **Instance Creation**

   - Created a compute instance with default settings
   - Configured necessary settings and resolved initial setup errors

   ![Instance Creation](docs/dev-log/image/30-12-2025/1767106256048.png)
   ![Instance Configuration](docs/dev-log/image/30-12-2025/1767106606821.png)
3. **SSH Key Configuration**

   - Encountered SSH key download error during initial setup
   - Downloaded SSH keys from networking section

   ![SSH Key Error](docs/dev-log/image/30-12-2025/1767106689319.png)
   ![SSH Key Download](docs/dev-log/image/30-12-2025/1767106724087.png)
4. **Instance Details**

   - Instance created successfully
   - Obtained FQDN (Fully Qualified Domain Name) for the instance

   ![Instance Created](docs/dev-log/image/30-12-2025/1767106808077.png)
   ![FQDN](docs/dev-log/image/30-12-2025/1767106938355.png)
5. **Network Configuration**

   - Configured local SSH keys for connection
   - Created and attached public IP address to VNIC (Virtual Network Interface Card)
   - Created reserved IP first, then attached to VNIC for public access

   ![SSH Key Configuration](docs/dev-log/image/30-12-2025/1767107679358.png)
   ![Create Public IP](docs/dev-log/image/30-12-2025/1767108282010.png)
   ![Attach IP to VNIC](docs/dev-log/image/30-12-2025/1767108862519.png)
   ![Reserved IP Attached](docs/dev-log/image/30-12-2025/1767109072490.png)
6. **SSH Connection Verification**

   - Successfully tested SSH connection using private key
   - Confirmed remote access to the server

   ![SSH Connection Success](docs/dev-log/image/30-12-2025/1767109200715.png)

**Configuration Notes:**

- Initially tested with Oracle Linux, but performance was too slow
- Switched to Ubuntu 22.04 LTS for better performance and familiarity
- Changed from shared compute to dedicated VPS for improved speed
- After confirming SSH access, the initial instance was deleted and recreated with Ubuntu on dedicated VPS
- The server now runs Ubuntu on a dedicated VPS instance on Oracle Cloud free tier

### Nginx & SSL Configuration

Nginx serves as a reverse proxy for the frontend, backend API, and WebSocket connections. SSL/TLS certificates are managed through Let's Encrypt using Certbot.

**Installation:**

```bash
sudo apt update
sudo apt install nginx -y
```

![Nginx Installation](docs/dev-log/image/02-01-2026/1767357644381.png)

**Initial Configuration:**

1. **Copy Frontend and Backend Files**

   Ensure the frontend build (`dist` folder) and backend code are on the server:

   ![Server Files](docs/dev-log/image/02-01-2026/1767362518558.png)

2. **Create Nginx Configuration**

   Navigate to the sites-available directory and create a configuration file:

   ```bash
   cd /etc/nginx/sites-available
   sudo nano pi-guardian
   ```

   ![Sites Available Directory](docs/dev-log/image/02-01-2026/1767362732554.png)

3. **Open Required Ports**

   Configure Oracle Cloud security list to allow HTTP (port 80) and HTTPS (port 443):

   ![Security List Configuration](docs/dev-log/image/02-01-2026/1767363155246.png)

   Configure iptables on the server:

   ```bash
   sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
   ```

   ![Iptables Configuration](docs/dev-log/image/02-01-2026/1767363276751.png)

4. **Basic HTTP Configuration**

   Initial nginx configuration for serving frontend and proxying backend:

   ```nginx
   server {
       listen 80;
       server_name pi-guardian.kcolville.com;

       root /home/ubuntu/pi-guardian/frontend/dist;
       index index.html;

       location / {
           try_files $uri /index.html;
       }

       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Test the configuration and enable the site:

   ```bash
   sudo nginx -t
   sudo ln -s /etc/nginx/sites-available/pi-guardian /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

   ![HTTP Working](docs/dev-log/image/02-01-2026/1767363826254.png)

**SSL/TLS Configuration with Certbot:**

1. **Install Certbot**

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain SSL Certificate**

   Run Certbot to automatically configure SSL for your domain:

   ```bash
   sudo certbot --nginx -d pi-guardian.kcolville.com
   ```

   ![Certbot Configuration](docs/dev-log/image/02-01-2026/1767365097249.png)

   Select option 2 to redirect HTTP traffic to HTTPS automatically:

   ![Certbot Redirect Option](docs/dev-log/image/02-01-2026/1767365349025.png)

3. **Verify SSL Configuration**

   Certbot automatically updates your nginx configuration. Verify the changes:

   ![Certbot Configuration Success](docs/dev-log/image/02-01-2026/1767365433954.png)

**Common Issues & Solutions:**

1. **Port Configuration Error**

   Ensure port 443 (not 433) is opened in the Oracle Cloud security list:

   ![Port Fix](docs/dev-log/image/02-01-2026/1767365655244.png)

2. **HTTPS Working**

   After fixing port configuration, the site should load over HTTPS:

   ![HTTPS Success](docs/dev-log/image/02-01-2026/1767365712892.png)

3. **WebSocket Proxy Configuration**

   For MQTT WebSocket connections, ensure proper upgrade headers:

   ```nginx
   location /mqtt {
       proxy_pass http://127.0.0.1:9001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

**Configuration Notes:**

- Certbot automatically manages SSL certificate renewal
- The configuration file is updated to include SSL settings and HTTP to HTTPS redirect
- All traffic is automatically redirected to HTTPS for security
- WebSocket connections require proper upgrade headers for WSS (WebSocket Secure) to work correctly

### Setting Up MQTT Mosquitto

MQTT Mosquitto is used as a publisher/subscriber system on the server so the Raspberry Pi can send events to it.

**Installation:**

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
```

![Mosquitto Installation](docs/dev-log/image/01-01-2026/1767270903753.png)

**Starting the Service:**

```bash
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

![Mosquitto Service Status](docs/dev-log/image/01-01-2026/1767270949504.png)

**Network Configuration:**

MQTT uses port 1883. Update the iptables and security list on the cloud server:

```bash
sudo iptables -A INPUT -p tcp --dport 1883 -j ACCEPT
```

![Iptables Configuration](docs/dev-log/image/01-01-2026/1767272015212.png)

![Cloud Security List](docs/dev-log/image/01-01-2026/1767272055695.png)

**Verify Service:**

Check that the port is listening:

```bash
ss -nltp
```

![Port Listening Status](docs/dev-log/image/01-01-2026/1767272193402.png)

**Testing Basic Communication:**

Test the MQTT setup by subscribing on the Raspberry Pi or a local Linux machine:

```bash
mosquitto_sub -h your.server.ip -t test/topic
```

On the server, publish a test message:

```bash
mosquitto_pub -h your.server.ip -t test/topic -m "hello"
```

If ports need to be fixed, use a more specific iptables rule:

```bash
sudo iptables -I INPUT 5 -p tcp --dport 1883 -m conntrack --ctstate NEW -j ACCEPT
```

![Iptables Fix](docs/dev-log/image/01-01-2026/1767274152501.png)

![Iptables Save](docs/dev-log/image/01-01-2026/1767274217423.png)

![Pi Communication Confirmation](docs/dev-log/image/01-01-2026/1767274242550.png)

## Credits

---

**Navigation**

[← Previous Section]() | [Table of Contents](README.md) | [Next Section →]()

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

<!-- Footer Component: README/footer.md -->
