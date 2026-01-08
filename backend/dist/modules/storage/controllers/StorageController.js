var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import 'reflect-metadata';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';
import { authenticateRequest } from '../../../core/middleware/auth.js';
import StorageHttpHandler from '../http/StorageHttpHander.js';
const storageHttpHandler = new StorageHttpHandler();
let StorageController = class StorageController {
    async getFiles(req, res) {
        return storageHttpHandler.getFiles(req, res);
    }
    async getFileById(req, res) {
        return storageHttpHandler.getFileById(req, res);
    }
    async updateFile(req, res) {
        return storageHttpHandler.updateFile(req, res);
    }
    async deleteFile(req, res) {
        return storageHttpHandler.deleteFile(req, res);
    }
    async getRecordings(req, res) {
        return storageHttpHandler.getRecordings(req, res);
    }
    async getRecordingById(req, res) {
        return storageHttpHandler.getRecordingById(req, res);
    }
    async updateRecording(req, res) {
        return storageHttpHandler.updateRecording(req, res);
    }
    async deleteRecording(req, res) {
        return storageHttpHandler.deleteRecording(req, res);
    }
};
__decorate([
    route('get', '/files'),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getFiles", null);
__decorate([
    route('get', '/files/:id'),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getFileById", null);
__decorate([
    route('put', '/files/:id', authenticateRequest()),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "updateFile", null);
__decorate([
    route('delete', '/files/:id', authenticateRequest()),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteFile", null);
__decorate([
    route('get', '/recordings'),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getRecordings", null);
__decorate([
    route('get', '/recordings/:id'),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getRecordingById", null);
__decorate([
    route('put', '/recordings/:id', authenticateRequest()),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "updateRecording", null);
__decorate([
    route('delete', '/recordings/:id', authenticateRequest()),
    apiDoc({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteRecording", null);
StorageController = __decorate([
    Controller('/storage')
], StorageController);
export default StorageController;
//# sourceMappingURL=StorageController.js.map