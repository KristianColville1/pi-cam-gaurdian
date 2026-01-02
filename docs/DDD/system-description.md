# System Description

**Database System Overview**

## Database Technology

PiCam Guardian uses **SQLite** as its database engine, managed through **TypeORM** as an Object-Relational Mapping layer.

### SQLite Database

- **File Location**: `backend/db.sqlite3`
- **Type**: Serverless, file-based database
- **Advantages**: 
  - No separate database server required
  - Lightweight and suitable for development
  - Easy to backup and migrate (single file)
  - Low resource overhead

### TypeORM Configuration

TypeORM is configured in `backend/src/core/config/database.js` with the following settings:

- **Type**: `better-sqlite3` (SQLite driver)
- **Database Path**: Relative path to `db.sqlite3` in the backend directory
- **Synchronize**: Enabled for development (automatically creates/updates schema)
- **Logging**: Enabled for development debugging
- **Entities**: Array of entity schemas (currently just User entity)

### Backend Architecture

The backend follows a modular architecture:

- **Core Configuration**: Database initialization in `backend/src/core/config/`
- **Modules**: Feature-based modules in `backend/src/modules/`
  - Each module can contain entities, controllers, services
- **Entity Definitions**: Located in `backend/src/modules/{module}/entities/`
- **Database Initialization**: Handled by `initializeDatabase()` function

### Database Initialization

The database is initialized when the backend server starts:

1. TypeORM DataSource is configured with entity schemas
2. Connection to SQLite database is established
3. Schema synchronization occurs (if enabled)
4. Database file (`db.sqlite3`) is created if it doesn't exist

An initialization script (`backend/src/scripts/init-db.js`) is also available for manual database setup:

```bash
npm run init-db
```

## Current Schema

The database currently contains a single table:

- **user** - Stores user account information for authentication

Future tables will be added for sensor data storage, session management, and other features as the system evolves.

---

**Navigation**

[← Previous Section](purpose.md) | [Table of Contents](index.md) | [Next Section →](conceptual-data-model.md)

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

