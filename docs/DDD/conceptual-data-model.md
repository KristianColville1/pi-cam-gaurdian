# Conceptual Data Model

**High-Level Data Model**

## Entity Overview

The conceptual data model for PiCam Guardian represents the core entities and their relationships within the system. As of Release 3, the system includes five main entities supporting user management, device tracking, sensor data storage, and media file management.

## Current Entities

### User Entity

The **User** entity represents system users who can access the monitoring portal and manage the system.

**Key Concepts:**

- **Authentication**: Users have email addresses and password hashes for secure login
- **Profile Information**: Optional first name and last name fields
- **Account Status**: Users have verification status and active/inactive flags
- **Session Tracking**: Last login timestamp for activity monitoring
- **Preferences**: JSON-stored user preferences for customization
- **Soft Deletes**: Support for soft deletion with `deleted_at` timestamp
- **Audit Trail**: Created and updated timestamps for record tracking

**Business Rules:**

- Each user must have a unique email address
- User accounts can be verified or unverified
- User accounts can be activated or deactivated
- Soft deletion allows for data recovery and audit purposes

---

### Device Entity

The **Device** entity represents registered monitoring devices (typically Raspberry Pi devices) in the system.

**Key Concepts:**

- **Device Identification**: Unique identifier (MAC address, serial number, etc.)
- **Network Information**: IP address and hostname for device communication
- **Device Metadata**: Device type, location, description, and status
- **Status Tracking**: Current status (online, offline, maintenance) and last seen timestamp
- **Active Flag**: Whether the device is active and should be monitored
- **Metadata Storage**: JSON field for additional device-specific information
- **Soft Deletes**: Support for soft deletion
- **Audit Trail**: Created and updated timestamps

**Business Rules:**

- Each device must have a unique identifier
- Devices can be marked as active or inactive
- Device status is tracked independently of the active flag
- Soft deletion preserves device history

---

### SensorMetric Entity

The **SensorMetric** entity stores historical sensor data readings from the Raspberry Pi Sense HAT.

**Key Concepts:**

- **Environmental Data**: Temperature (from humidity and pressure sensors), humidity, pressure
- **Orientation Data**: Pitch, roll, and yaw angles (Euler angles)
- **Acceleration Data**: X, Y, Z axis acceleration values (g-force)
- **Device Association**: Optional reference to device that generated the metric
- **Recording Timestamp**: Timestamp when the metric was recorded on the device
- **Audit Trail**: Created and updated timestamps

**Business Rules:**

- Metrics are timestamped with both device recording time and database creation time
- Metrics can optionally be associated with a specific device
- All sensor values are nullable to handle missing sensor data gracefully
- Metrics are primarily used for historical data analysis and trending

---

### File Entity

The **File** entity represents image files stored in Bunny.net CDN storage zones.

**Key Concepts:**

- **CDN Integration**: Storage zone information (name, ID, GUID)
- **File Path Management**: Path within storage zone and full path
- **File Metadata**: Object name, content type (MIME type), file size, checksum
- **CDN URL**: Public URL for accessing the file via CDN
- **File Type Classification**: Type categorization (image, document, etc.)
- **Metadata Storage**: JSON field for additional file-specific information
- **Soft Deletes**: Support for soft deletion (also triggers CDN deletion)
- **Audit Trail**: Created and updated timestamps

**Business Rules:**

- Files are associated with Bunny.net storage zones
- File paths are stored for CDN reference
- Files can be soft deleted (also removes from CDN)
- File metadata is stored for efficient querying and display

---

### Recording Entity

The **Recording** entity represents video recordings stored in Bunny.net video library.

**Key Concepts:**

- **Video Library Integration**: Video library ID, video ID (GUID), and GUID references
- **Video Metadata**: Title, duration, file size, resolution (width/height), framerate, bitrate
- **Video URLs**: Full video URL and thumbnail/preview image URL
- **Processing Status**: Status tracking (queued, processing, encoding, finished, resolution_finished, failed)
- **Recording Timestamps**: When recording was made and when uploaded to CDN
- **View Tracking**: Number of views for analytics
- **Metadata Storage**: JSON field for additional recording-specific information
- **Soft Deletes**: Support for soft deletion (also triggers CDN deletion)
- **Audit Trail**: Created and updated timestamps

**Business Rules:**

- Recordings are associated with Bunny.net video library
- Video ID (GUID) must be unique
- Status is updated via webhooks from Bunny.net during processing
- Recordings can be soft deleted (also removes from CDN)
- Video metadata (size, duration) is fetched from Bunny.net API after processing

---

## Relationships

The entities have the following logical relationships (not enforced via foreign keys in current implementation):

### Logical Relationships

- **SensorMetric → Device**: Optional relationship via `device_id` field (references Device.id)
  - One device can have many sensor metrics
  - Metrics can optionally be associated with a device

### Future Relationships

Potential relationships for future releases:

- Users to Sessions (session management)
- Users to Alerts/Notifications
- Users to Files/Recordings (ownership/access control)
- Devices to Files/Recordings (source device tracking)

---

## Entity Characteristics

All entities in the system follow common patterns:

- **Primary Keys**: UUID-based identifiers (VARCHAR with UUID generation) for unique identification
- **Timestamps**: Created, updated, and deleted timestamps for audit purposes
- **Soft Deletes**: Support for logical deletion without physical data removal (via `deleted_at` field)
- **TypeORM Integration**: All entities defined using TypeORM EntitySchema pattern
- **Indexes**: Appropriate indexes on frequently queried fields (IDs, timestamps, status fields)
- **Nullable Fields**: Sensible use of nullable fields for optional data
- **JSON Metadata**: Support for additional metadata via JSON TEXT fields
- **CDN Integration**: File and Recording entities integrate with Bunny.net CDN for storage

---

**Navigation**

[← Previous Section](system-description.md) | [Table of Contents](index.md) | [Next Section →](logical-data-model.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
