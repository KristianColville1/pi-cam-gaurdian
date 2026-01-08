import 'reflect-metadata';
import { EntitySchema } from 'typeorm';

/**
 * Entity schema for video recordings stored in Bunny.net video library.
 */
export const Recording = new EntitySchema({
  name: 'Recording',
  tableName: 'recording',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
      generated: 'uuid',
    },
    // Bunny.net video library fields
    video_library_id: {
      type: 'varchar',
      length: 255,
      nullable: true,
      comment: 'Bunny.net video library ID',
    },
    video_id: {
      type: 'varchar',
      length: 255,
      nullable: true,
      unique: true,
      comment: 'Bunny.net video ID (GUID from URL)',
    },
    guid: {
      type: 'varchar',
      length: 255,
      nullable: true,
      comment: 'Bunny.net video GUID',
    },
    title: {
      type: 'varchar',
      length: 500,
      nullable: true,
      comment: 'Video title',
    },
    // Video URLs
    video_url: {
      type: 'varchar',
      length: 1000,
      nullable: true,
      comment: 'Full video URL',
    },
    thumbnail_url: {
      type: 'varchar',
      length: 1000,
      nullable: true,
      comment: 'Thumbnail/preview image URL',
    },
    // Video metadata
    duration: {
      type: 'real',
      nullable: true,
      comment: 'Video duration in seconds',
    },
    file_size: {
      type: 'bigint',
      nullable: true,
      comment: 'Video file size in bytes',
    },
    width: {
      type: 'integer',
      nullable: true,
      comment: 'Video width in pixels',
    },
    height: {
      type: 'integer',
      nullable: true,
      comment: 'Video height in pixels',
    },
    framerate: {
      type: 'real',
      nullable: true,
      comment: 'Video framerate (fps)',
    },
    bitrate: {
      type: 'integer',
      nullable: true,
      comment: 'Video bitrate (bps)',
    },
    // Status fields
    status: {
      type: 'varchar',
      length: 50,
      nullable: true,
      default: 'processing',
      comment: 'Video processing status (processing, finished, failed, etc.)',
    },
    views: {
      type: 'integer',
      nullable: true,
      default: 0,
      comment: 'Number of views',
    },
    // Recording metadata
    recorded_at: {
      type: 'datetime',
      nullable: true,
      comment: 'Timestamp when the recording was made',
    },
    uploaded_at: {
      type: 'datetime',
      nullable: true,
      comment: 'Timestamp when the video was uploaded to CDN',
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
      name: 'IDX_RECORDING_VIDEO_ID',
      columns: ['video_id'],
      unique: true,
    },
    {
      name: 'IDX_RECORDING_GUID',
      columns: ['guid'],
    },
    {
      name: 'IDX_RECORDING_STATUS',
      columns: ['status'],
    },
    {
      name: 'IDX_RECORDING_RECORDED_AT',
      columns: ['recorded_at'],
    },
    {
      name: 'IDX_RECORDING_CREATED_AT',
      columns: ['created_at'],
    },
  ],
});

