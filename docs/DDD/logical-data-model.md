# Logical Data Model

**Database Schema Definition**

This document provides detailed table structures for all entities in the PiCam Guardian database. All tables use SQLite with TypeORM EntitySchema definitions.

---

## User Table

The `user` table stores user account information for authentication and user management.

### Table Structure

| Column Name      | Data Type    | Constraints              | Description                          |
|-----------------|--------------|--------------------------|--------------------------------------|
| id              | VARCHAR      | PRIMARY KEY, UUID        | Unique identifier for user           |
| email           | VARCHAR(255) | UNIQUE, NOT NULL         | User email address (login identifier)|
| password_hash   | VARCHAR(255) | NOT NULL                 | Bcrypt hashed password               |
| first_name      | VARCHAR(100) | NULLABLE                 | User's first name                    |
| last_name       | VARCHAR(100) | NULLABLE                 | User's last name                     |
| is_verified     | BOOLEAN      | DEFAULT FALSE            | Email verification status            |
| is_active       | BOOLEAN      | DEFAULT TRUE             | Account activation status            |
| last_login_at   | DATETIME     | NULLABLE                 | Timestamp of last successful login   |
| preferences     | TEXT         | NULLABLE, DEFAULT '{}'   | JSON string of user preferences      |
| created_at      | DATETIME     | NOT NULL, AUTO           | Record creation timestamp            |
| updated_at      | DATETIME     | NOT NULL, AUTO           | Record last update timestamp         |
| deleted_at      | DATETIME     | NULLABLE                 | Soft delete timestamp                |

### Indexes

- **Primary Index**: `id` (automatic)
- **Unique Index**: `email` (enforced by UNIQUE constraint)

### Entity Location

`backend/src/modules/auth/entities/User.entity.ts`

---

## Device Table

The `device` table stores information about registered monitoring devices (Raspberry Pi devices).

### Table Structure

| Column Name      | Data Type    | Constraints              | Description                          |
|-----------------|--------------|--------------------------|--------------------------------------|
| id              | VARCHAR      | PRIMARY KEY, UUID        | Unique identifier for device         |
| name            | VARCHAR(255) | NOT NULL                 | Device name                          |
| identifier      | VARCHAR(255) | UNIQUE, NOT NULL         | Unique device identifier (MAC, serial)|
| device_type     | VARCHAR(100) | NULLABLE                 | Type of device (e.g., "Raspberry Pi 4")|
| ip_address      | VARCHAR(45)  | NULLABLE                 | IP address (supports IPv4 and IPv6) |
| hostname        | VARCHAR(255) | NULLABLE                 | Device hostname                      |
| location        | VARCHAR(255) | NULLABLE                 | Physical location of device          |
| description     | TEXT         | NULLABLE                 | Additional description or notes      |
| status          | VARCHAR(50)  | DEFAULT 'offline'        | Current status (online, offline, etc.)|
| last_seen_at    | DATETIME     | NULLABLE                 | Last time device was seen/heard from |
| metadata        | TEXT         | NULLABLE, DEFAULT '{}'   | JSON metadata for additional info    |
| is_active       | BOOLEAN      | DEFAULT TRUE             | Whether device is active and monitored|
| created_at      | DATETIME     | NOT NULL, AUTO           | Record creation timestamp            |
| updated_at      | DATETIME     | NOT NULL, AUTO           | Record last update timestamp         |
| deleted_at      | DATETIME     | NULLABLE                 | Soft delete timestamp                |

### Indexes

- **Primary Index**: `id` (automatic)
- **Unique Index**: `identifier` (IDX_DEVICE_IDENTIFIER)
- **Index**: `status` (IDX_DEVICE_STATUS)
- **Index**: `is_active` (IDX_DEVICE_IS_ACTIVE)

### Entity Location

`backend/src/modules/devices/entities/Device.entity.ts`

---

## SensorMetric Table

The `sensor_metric` table stores historical sensor data readings from the Raspberry Pi Sense HAT.

### Table Structure

| Column Name      | Data Type    | Constraints              | Description                          |
|-----------------|--------------|--------------------------|--------------------------------------|
| id              | VARCHAR      | PRIMARY KEY, UUID        | Unique identifier for metric         |
| temp_humidity   | REAL         | NULLABLE                 | Temperature from humidity sensor (°C)|
| temp_pressure   | REAL         | NULLABLE                 | Temperature from pressure sensor (°C)|
| humidity        | REAL         | NULLABLE                 | Humidity percentage (%)              |
| pressure        | REAL         | NULLABLE                 | Atmospheric pressure (mbar)          |
| pitch           | REAL         | NULLABLE                 | Pitch angle in degrees               |
| roll            | REAL         | NULLABLE                 | Roll angle in degrees                |
| yaw             | REAL         | NULLABLE                 | Yaw angle in degrees                 |
| accel_x         | REAL         | NULLABLE                 | Acceleration on X-axis (g)           |
| accel_y         | REAL         | NULLABLE                 | Acceleration on Y-axis (g)           |
| accel_z         | REAL         | NULLABLE                 | Acceleration on Z-axis (g)           |
| device_id       | VARCHAR      | NULLABLE                 | Reference to device (logical FK)     |
| recorded_at     | DATETIME     | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when metric recorded on device |
| created_at      | DATETIME     | NOT NULL, AUTO           | Record creation timestamp            |
| updated_at      | DATETIME     | NOT NULL, AUTO           | Record last update timestamp         |

### Indexes

- **Primary Index**: `id` (automatic)
- **Index**: `recorded_at` (IDX_SENSOR_METRIC_RECORDED_AT)
- **Index**: `device_id` (IDX_SENSOR_METRIC_DEVICE_ID)
- **Index**: `created_at` (IDX_SENSOR_METRIC_CREATED_AT)

### Entity Location

`backend/src/modules/metrics/entities/SensorMetric.entity.ts`

---

## File Table

The `file` table stores metadata for image files stored in Bunny.net CDN storage zones.

### Table Structure

| Column Name         | Data Type    | Constraints              | Description                          |
|--------------------|--------------|--------------------------|--------------------------------------|
| id                 | VARCHAR      | PRIMARY KEY, UUID        | Unique identifier for file           |
| guid               | VARCHAR(255) | NULLABLE                 | Bunny.net storage GUID               |
| storage_zone_name  | VARCHAR(255) | NULLABLE                 | Bunny.net storage zone name          |
| storage_zone_id    | VARCHAR(255) | NULLABLE                 | Bunny.net storage zone ID            |
| path               | VARCHAR(500) | NOT NULL                 | Path to file within storage zone     |
| object_name        | VARCHAR(255) | NOT NULL                 | Name of the file                     |
| full_path          | VARCHAR(1000)| NULLABLE                 | Full path to the file                |
| url                | VARCHAR(1000)| NULLABLE                 | Public CDN URL to access the asset   |
| content_type       | VARCHAR(100) | NULLABLE                 | MIME type (e.g., image/jpeg)         |
| file_size          | BIGINT       | NULLABLE                 | File size in bytes                   |
| checksum           | VARCHAR(255) | NULLABLE                 | File checksum/hash                   |
| file_type          | VARCHAR(50)  | NULLABLE                 | Type of file (e.g., image, document) |
| metadata           | TEXT         | NULLABLE, DEFAULT '{}'   | Additional metadata as JSON          |
| created_at         | DATETIME     | NOT NULL, AUTO           | Record creation timestamp            |
| updated_at         | DATETIME     | NOT NULL, AUTO           | Record last update timestamp         |
| deleted_at         | DATETIME     | NULLABLE                 | Soft delete timestamp                |

### Indexes

- **Primary Index**: `id` (automatic)
- **Index**: `guid` (IDX_FILE_GUID)
- **Index**: `path` (IDX_FILE_PATH)
- **Index**: `created_at` (IDX_FILE_CREATED_AT)
- **Index**: `file_type` (IDX_FILE_TYPE)

### Entity Location

`backend/src/modules/storage/entities/File.entity.ts`

---

## Recording Table

The `recording` table stores metadata for video recordings stored in Bunny.net video library.

### Table Structure

| Column Name      | Data Type    | Constraints              | Description                          |
|-----------------|--------------|--------------------------|--------------------------------------|
| id              | VARCHAR      | PRIMARY KEY, UUID        | Unique identifier for recording      |
| video_library_id| VARCHAR(255) | NULLABLE                 | Bunny.net video library ID           |
| video_id        | VARCHAR(255) | UNIQUE, NULLABLE         | Bunny.net video ID (GUID from URL)   |
| guid            | VARCHAR(255) | NULLABLE                 | Bunny.net video GUID                 |
| title           | VARCHAR(500) | NULLABLE                 | Video title                          |
| video_url       | VARCHAR(1000)| NULLABLE                 | Full video URL                       |
| thumbnail_url   | VARCHAR(1000)| NULLABLE                 | Thumbnail/preview image URL          |
| duration        | REAL         | NULLABLE                 | Video duration in seconds            |
| file_size       | BIGINT       | NULLABLE                 | Video file size in bytes             |
| width           | INTEGER      | NULLABLE                 | Video width in pixels                |
| height          | INTEGER      | NULLABLE                 | Video height in pixels               |
| framerate       | REAL         | NULLABLE                 | Video framerate (fps)                |
| bitrate         | INTEGER      | NULLABLE                 | Video bitrate (bps)                  |
| status          | VARCHAR(50)  | NULLABLE, DEFAULT 'processing' | Video processing status (queued, processing, encoding, finished, resolution_finished, failed) |
| views           | INTEGER      | NULLABLE, DEFAULT 0      | Number of views                      |
| recorded_at     | DATETIME     | NULLABLE                 | Timestamp when recording was made    |
| uploaded_at     | DATETIME     | NULLABLE                 | Timestamp when video uploaded to CDN |
| metadata        | TEXT         | NULLABLE, DEFAULT '{}'   | Additional metadata as JSON          |
| created_at      | DATETIME     | NOT NULL, AUTO           | Record creation timestamp            |
| updated_at      | DATETIME     | NOT NULL, AUTO           | Record last update timestamp         |
| deleted_at      | DATETIME     | NULLABLE                 | Soft delete timestamp                |

### Indexes

- **Primary Index**: `id` (automatic)
- **Unique Index**: `video_id` (IDX_RECORDING_VIDEO_ID)
- **Index**: `guid` (IDX_RECORDING_GUID)
- **Index**: `status` (IDX_RECORDING_STATUS)
- **Index**: `recorded_at` (IDX_RECORDING_RECORDED_AT)
- **Index**: `created_at` (IDX_RECORDING_CREATED_AT)

### Status Values

Recording status values correspond to Bunny.net processing status codes:
- `queued` - Status code 0: Video is queued for processing
- `processing` - Status code 1: Video is being processed
- `encoding` - Status code 2: Video is being encoded
- `finished` - Status code 3: Video encoding is finished
- `resolution_finished` - Status code 4: Video resolution processing is finished
- `failed` - Status code 5: Video processing failed

### Entity Location

`backend/src/modules/storage/entities/Recording.entity.ts`

---

## Data Types Mapping

SQLite data types used (via TypeORM):

- `VARCHAR` → SQLite TEXT
- `REAL` → SQLite REAL (floating point)
- `INTEGER` → SQLite INTEGER
- `BIGINT` → SQLite INTEGER (64-bit)
- `BOOLEAN` → SQLite INTEGER (0 or 1)
- `DATETIME` → SQLite TEXT (ISO 8601 format)
- `TEXT` → SQLite TEXT

---

## Common Patterns

All tables follow these common patterns:

### Primary Keys
- All tables use UUID-based primary keys (VARCHAR with UUID generation)
- Generated automatically by TypeORM

### Timestamps
- `created_at`: Automatically set on record creation (TypeORM createDate)
- `updated_at`: Automatically updated on record modification (TypeORM updateDate)
- `deleted_at`: Set when record is soft deleted (TypeORM deleteDate, NULL for active records)

### Soft Deletes
- All tables (except SensorMetric) support soft deletion via `deleted_at` field
- Soft-deleted records remain in database but are filtered from queries
- Allows for data recovery and audit purposes

### Indexes
- Primary key indexes are automatic
- Unique indexes on fields requiring uniqueness (email, identifier, video_id)
- Performance indexes on frequently queried fields (timestamps, status fields, foreign key references)

### Metadata Fields
- Several entities include JSON `metadata` fields (TEXT type storing JSON strings)
- Allows for flexible extension without schema changes
- Stored as JSON strings, parsed by application code

---

**Navigation**

[← Previous Section](conceptual-data-model.md) | [Table of Contents](index.md) | [Next Section →]()

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)
