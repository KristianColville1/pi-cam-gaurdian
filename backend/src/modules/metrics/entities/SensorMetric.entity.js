import 'reflect-metadata';
import { EntitySchema } from 'typeorm';

/**
 * Entity schema for the sensor metric table.
 */
export const SensorMetric = new EntitySchema({
  name: 'SensorMetric',
  tableName: 'sensor_metric',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      generated: 'uuid',
    },
    // Temperature readings
    temp_humidity: {
      type: 'real',
      nullable: true,
      comment: 'Temperature reading from humidity sensor (°C)',
    },
    temp_pressure: {
      type: 'real',
      nullable: true,
      comment: 'Temperature reading from pressure sensor (°C)',
    },
    // Environmental readings
    humidity: {
      type: 'real',
      nullable: true,
      comment: 'Humidity percentage (%)',
    },
    pressure: {
      type: 'real',
      nullable: true,
      comment: 'Atmospheric pressure (mbar)',
    },
    // Orientation (Euler angles)
    pitch: {
      type: 'real',
      nullable: true,
      comment: 'Pitch angle in degrees',
    },
    roll: {
      type: 'real',
      nullable: true,
      comment: 'Roll angle in degrees',
    },
    yaw: {
      type: 'real',
      nullable: true,
      comment: 'Yaw angle in degrees',
    },
    // Acceleration (g-force)
    accel_x: {
      type: 'real',
      nullable: true,
      comment: 'Acceleration on X-axis (g)',
    },
    accel_y: {
      type: 'real',
      nullable: true,
      comment: 'Acceleration on Y-axis (g)',
    },
    accel_z: {
      type: 'real',
      nullable: true,
      comment: 'Acceleration on Z-axis (g)',
    },
    // Device reference (optional, for future device tracking)
    device_id: {
      type: 'varchar',
      nullable: true,
      comment: 'Reference to device that generated this metric',
    },
    // Timestamp when metric was recorded
    recorded_at: {
      type: 'datetime',
      nullable: false,
      default: () => 'CURRENT_TIMESTAMP',
      comment: 'Timestamp when the metric was recorded on the device',
    },
    // Standard timestamps
    created_at: {
      type: 'datetime',
      createDate: true,
    },
    updated_at: {
      type: 'datetime',
      updateDate: true,
    },
  },
  indices: [
    {
      name: 'IDX_SENSOR_METRIC_RECORDED_AT',
      columns: ['recorded_at'],
    },
    {
      name: 'IDX_SENSOR_METRIC_DEVICE_ID',
      columns: ['device_id'],
    },
    {
      name: 'IDX_SENSOR_METRIC_CREATED_AT',
      columns: ['created_at'],
    },
  ],
});

