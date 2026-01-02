# Logical Data Model

**Database Schema Definition**

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

### TypeORM Entity Schema

The User entity is defined in `backend/src/modules/auth/entities/User.entity.js` using TypeORM EntitySchema:

```javascript
export const User = new EntitySchema({
  name: 'User',
  tableName: 'user',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      generated: 'uuid',
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    // ... additional columns
  },
});
```

### Column Details

**Primary Key:**
- `id` - UUID v4 generated identifier for unique user identification

**Authentication Fields:**
- `email` - Unique email address used for user login
- `password_hash` - Bcrypt-hashed password (never stored as plaintext)

**Profile Fields:**
- `first_name` - Optional first name
- `last_name` - Optional last name

**Status Fields:**
- `is_verified` - Boolean flag indicating if email has been verified
- `is_active` - Boolean flag for account activation/deactivation
- `last_login_at` - Timestamp tracking last successful authentication

**Metadata Fields:**
- `preferences` - JSON string storing user preferences (stored as TEXT in SQLite)
- `created_at` - Automatic timestamp on record creation
- `updated_at` - Automatic timestamp on record updates
- `deleted_at` - Soft delete timestamp (NULL indicates active record)

### Indexes

- **Primary Index**: `id` (automatic)
- **Unique Index**: `email` (enforced by UNIQUE constraint)

### Constraints

- Email uniqueness enforced at database level
- Password hash is required (cannot be NULL)
- UUID generation handled by TypeORM

### Data Types Mapping

SQLite data types used (via TypeORM):

- `VARCHAR` → SQLite TEXT
- `BOOLEAN` → SQLite INTEGER (0 or 1)
- `DATETIME` → SQLite TEXT (ISO 8601 format)
- `TEXT` → SQLite TEXT

### Future Schema Additions

Planned tables for future releases:

- `sensor_data` - Historical sensor readings
- `sessions` - User session tracking
- `alerts` - System alerts and notifications
- `devices` - Registered monitoring devices

---

**Navigation**

[← Previous Section](conceptual-data-model.md) | [Table of Contents](index.md) | [Next Section →]()

---

**PiCam Guardian** | [Repository](https://github.com/KristianColville1/pi-cam-gaurdian)

