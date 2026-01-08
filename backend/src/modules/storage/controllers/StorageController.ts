import 'reflect-metadata';
import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';
import { authenticateRequest } from '../../../core/middleware/auth.js';

import StorageHttpHandler from '../http/StorageHttpHander.js';

const storageHttpHandler = new StorageHttpHandler();

@Controller('/storage')
class StorageController {
  @route('get', '/files')
  @apiDoc({
    summary: 'Get paginated files',
    description: 'Get a paginated list of files with optional filtering and sorting.',
    tags: ['Storage'],
    operationId: 'getFiles',
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
      { name: 'sort', in: 'query', schema: { type: 'string', default: 'created_at' } },
      { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } },
      { name: 'file_type', in: 'query', schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Paginated list of files' },
      500: { description: 'Internal server error' },
    },
  })
  async getFiles(req: Request, res: Response) {
    return storageHttpHandler.getFiles(req, res);
  }

  @route('get', '/files/:id')
  @apiDoc({
    summary: 'Get file by ID',
    description: 'Get a single file by its ID.',
    tags: ['Storage'],
    operationId: 'getFileById',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'File data' },
      404: { description: 'File not found' },
      500: { description: 'Internal server error' },
    },
  })
  async getFileById(req: Request, res: Response) {
    return storageHttpHandler.getFileById(req, res);
  }

  @route('put', '/files/:id', authenticateRequest())
  @apiDoc({
    summary: 'Update file',
    description: 'Update file metadata. Requires authentication.',
    tags: ['Storage'],
    operationId: 'updateFile',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    request: {
      body: {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            metadata: { type: 'object' },
            file_type: { type: 'string' },
          },
        },
      },
    },
    responses: {
      200: { description: 'File updated successfully' },
      401: { description: 'Authentication required' },
      404: { description: 'File not found' },
      500: { description: 'Internal server error' },
    },
  })
  async updateFile(req: Request, res: Response) {
    return storageHttpHandler.updateFile(req, res);
  }

  @route('delete', '/files/:id', authenticateRequest())
  @apiDoc({
    summary: 'Delete file',
    description: 'Soft delete a file by its ID. Also deletes from CDN. Requires authentication.',
    tags: ['Storage'],
    operationId: 'deleteFile',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'File deleted successfully' },
      401: { description: 'Authentication required' },
      404: { description: 'File not found' },
      500: { description: 'Internal server error' },
    },
  })
  async deleteFile(req: Request, res: Response) {
    return storageHttpHandler.deleteFile(req, res);
  }

  @route('get', '/recordings')
  @apiDoc({
    summary: 'Get paginated recordings',
    description: 'Get a paginated list of recordings with optional filtering and sorting.',
    tags: ['Storage'],
    operationId: 'getRecordings',
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
      { name: 'sort', in: 'query', schema: { type: 'string', default: 'created_at' } },
      { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } },
      { name: 'status', in: 'query', schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Paginated list of recordings' },
      500: { description: 'Internal server error' },
    },
  })
  async getRecordings(req: Request, res: Response) {
    return storageHttpHandler.getRecordings(req, res);
  }

  @route('get', '/recordings/:id')
  @apiDoc({
    summary: 'Get recording by ID',
    description: 'Get a single recording by its ID.',
    tags: ['Storage'],
    operationId: 'getRecordingById',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Recording data' },
      404: { description: 'Recording not found' },
      500: { description: 'Internal server error' },
    },
  })
  async getRecordingById(req: Request, res: Response) {
    return storageHttpHandler.getRecordingById(req, res);
  }

  @route('put', '/recordings/:id', authenticateRequest())
  @apiDoc({
    summary: 'Update recording',
    description: 'Update recording metadata. Requires authentication.',
    tags: ['Storage'],
    operationId: 'updateRecording',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    request: {
      body: {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            metadata: { type: 'object' },
            status: { type: 'string' },
          },
        },
      },
    },
    responses: {
      200: { description: 'Recording updated successfully' },
      401: { description: 'Authentication required' },
      404: { description: 'Recording not found' },
      500: { description: 'Internal server error' },
    },
  })
  async updateRecording(req: Request, res: Response) {
    return storageHttpHandler.updateRecording(req, res);
  }

  @route('delete', '/recordings/:id', authenticateRequest())
  @apiDoc({
    summary: 'Delete recording',
    description: 'Soft delete a recording by its ID. Also deletes from CDN. Requires authentication.',
    tags: ['Storage'],
    operationId: 'deleteRecording',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Recording deleted successfully' },
      401: { description: 'Authentication required' },
      404: { description: 'Recording not found' },
      500: { description: 'Internal server error' },
    },
  })
  async deleteRecording(req: Request, res: Response) {
    return storageHttpHandler.deleteRecording(req, res);
  }
}

export default StorageController;

