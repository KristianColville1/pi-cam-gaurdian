import 'reflect-metadata';
import { EntitySchema } from 'typeorm';
export const Device = new EntitySchema({
    name: 'Device',
    tableName: 'device',
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        name: {
            type: 'varchar',
            length: 255,
            nullable: false,
        },
        identifier: {
            type: 'varchar',
            length: 255,
            unique: true,
            nullable: false,
            comment: 'Unique identifier for the device (e.g., MAC address, serial number)',
        },
        device_type: {
            type: 'varchar',
            length: 100,
            nullable: true,
            comment: 'Type of device (e.g., "Raspberry Pi 4", "Raspberry Pi Zero")',
        },
        ip_address: {
            type: 'varchar',
            length: 45,
            nullable: true,
            comment: 'IP address of the device (supports IPv4 and IPv6)',
        },
        hostname: {
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: 'Hostname of the device',
        },
        location: {
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: 'Physical location of the device',
        },
        description: {
            type: 'text',
            nullable: true,
            comment: 'Additional description or notes about the device',
        },
        status: {
            type: 'varchar',
            length: 50,
            default: 'offline',
            comment: 'Current status: online, offline, maintenance, etc.',
        },
        last_seen_at: {
            type: 'datetime',
            nullable: true,
            comment: 'Last time the device was seen/heard from',
        },
        metadata: {
            type: 'text',
            nullable: true,
            default: '{}',
            comment: 'JSON metadata for additional device-specific information',
        },
        is_active: {
            type: 'boolean',
            default: true,
            comment: 'Whether the device is active and should be monitored',
        },
        created_at: {
            type: 'datetime',
            createDate: true,
        },
        updated_at: {
            type: 'datetime',
            updateDate: true,
        },
        deleted_at: {
            type: 'datetime',
            nullable: true,
            deleteDate: true,
        },
    },
    indices: [
        {
            name: 'IDX_DEVICE_IDENTIFIER',
            columns: ['identifier'],
            unique: true,
        },
        {
            name: 'IDX_DEVICE_STATUS',
            columns: ['status'],
        },
        {
            name: 'IDX_DEVICE_IS_ACTIVE',
            columns: ['is_active'],
        },
    ],
});
//# sourceMappingURL=Device.entity.js.map