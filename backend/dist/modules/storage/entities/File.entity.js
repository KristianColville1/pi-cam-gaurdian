import 'reflect-metadata';
import { EntitySchema } from 'typeorm';
/**
 * Entity schema for files (images, etc.) stored in Bunny.net CDN.
 */
export const File = new EntitySchema({
    name: 'File',
    tableName: 'file',
    columns: {
        id: {
            type: 'varchar',
            primary: true,
            generated: 'uuid',
        },
        // Bunny.net storage fields
        guid: {
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: 'Bunny.net storage GUID',
        },
        storage_zone_name: {
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: 'Bunny.net storage zone name',
        },
        storage_zone_id: {
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: 'Bunny.net storage zone ID',
        },
        path: {
            type: 'varchar',
            length: 500,
            nullable: false,
            comment: 'Path to the file within the storage zone',
        },
        object_name: {
            type: 'varchar',
            length: 255,
            nullable: false,
            comment: 'Name of the file',
        },
        full_path: {
            type: 'varchar',
            length: 1000,
            nullable: true,
            comment: 'Full path to the file',
        },
        // CDN URL
        url: {
            type: 'varchar',
            length: 1000,
            nullable: true,
            comment: 'Public CDN URL to access the asset',
        },
        // File metadata
        content_type: {
            type: 'varchar',
            length: 100,
            nullable: true,
            comment: 'MIME type of the file (e.g., image/jpeg)',
        },
        file_size: {
            type: 'bigint',
            nullable: true,
            comment: 'File size in bytes',
        },
        checksum: {
            type: 'varchar',
            length: 255,
            nullable: true,
            comment: 'File checksum/hash',
        },
        // File type/metadata
        file_type: {
            type: 'varchar',
            length: 50,
            nullable: true,
            comment: 'Type of file (e.g., image, document)',
        },
        metadata: {
            type: 'text',
            nullable: true,
            default: '{}',
            comment: 'Additional metadata as JSON',
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
        deleted_at: {
            type: 'datetime',
            nullable: true,
            deleteDate: true,
        },
    },
    indices: [
        {
            name: 'IDX_FILE_GUID',
            columns: ['guid'],
        },
        {
            name: 'IDX_FILE_PATH',
            columns: ['path'],
        },
        {
            name: 'IDX_FILE_CREATED_AT',
            columns: ['created_at'],
        },
        {
            name: 'IDX_FILE_TYPE',
            columns: ['file_type'],
        },
    ],
});
//# sourceMappingURL=File.entity.js.map