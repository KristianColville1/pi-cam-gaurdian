import 'reflect-metadata';
import { EntitySchema } from 'typeorm';

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
    password_hash: {
      type: 'varchar',
      length: 255,
    },
    first_name: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    last_name: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    is_verified: {
      type: 'boolean',
      default: false,
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    last_login_at: {
      type: 'datetime',
      nullable: true,
    },
    preferences: {
      type: 'text',
      nullable: true,
      default: '{}',
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
});
