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
import PiGuardHttpHandler from '../http/PiGuardHttpHandler.js';
const piGuardHttpHandler = new PiGuardHttpHandler();
let PiGuardController = class PiGuardController {
    async getEndpoints(req, res) {
        return piGuardHttpHandler.getEndpoints(req, res);
    }
    async getHealth(req, res) {
        return piGuardHttpHandler.getHealth(req, res);
    }
    async captureImage(req, res) {
        return piGuardHttpHandler.captureImage(req, res);
    }
    async startRecording(req, res) {
        return piGuardHttpHandler.startRecording(req, res);
    }
    async stopRecording(req, res) {
        return piGuardHttpHandler.stopRecording(req, res);
    }
    async getRecordingStatus(req, res) {
        return piGuardHttpHandler.getRecordingStatus(req, res);
    }
};
__decorate([
    route('get', '/endpoints'),
    apiDoc({
        summary: 'Get available endpoints',
        description: 'Retrieve a list of available endpoints from the pi-guard service.',
        tags: ['PiGuard'],
        operationId: 'getPiGuardEndpoints',
        responses: {
            200: { description: 'List of available endpoints' },
            500: { description: 'Failed to fetch endpoints from pi-guard' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PiGuardController.prototype, "getEndpoints", null);
__decorate([
    route('get', '/health'),
    apiDoc({
        summary: 'Get pi-guard health status',
        description: 'Check the health status of the pi-guard service.',
        tags: ['PiGuard'],
        operationId: 'getPiGuardHealth',
        responses: {
            200: { description: 'Health status from pi-guard' },
            500: { description: 'Failed to get health status' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PiGuardController.prototype, "getHealth", null);
__decorate([
    route('get', '/camera/capture', authenticateRequest()),
    apiDoc({
        summary: 'Capture image from pi camera',
        description: 'Capture a snapshot image from the Raspberry Pi camera. Requires authentication.',
        tags: ['PiGuard', 'Camera'],
        operationId: 'captureImage',
        responses: {
            200: { description: 'Image captured successfully' },
            401: { description: 'Authentication required' },
            503: { description: 'Camera service not available' },
            500: { description: 'Failed to capture image' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PiGuardController.prototype, "captureImage", null);
__decorate([
    route('get', '/camera/recording/start', authenticateRequest()),
    apiDoc({
        summary: 'Start video recording',
        description: 'Start recording video from the Raspberry Pi camera. Requires authentication.',
        tags: ['PiGuard', 'Camera'],
        operationId: 'startRecording',
        responses: {
            200: { description: 'Recording started successfully' },
            401: { description: 'Authentication required' },
            409: { description: 'Recording already in progress' },
            503: { description: 'Camera service not available' },
            500: { description: 'Failed to start recording' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PiGuardController.prototype, "startRecording", null);
__decorate([
    route('get', '/camera/recording/stop', authenticateRequest()),
    apiDoc({
        summary: 'Stop video recording',
        description: 'Stop the current video recording and upload the MP4 file. Requires authentication.',
        tags: ['PiGuard', 'Camera'],
        operationId: 'stopRecording',
        responses: {
            200: { description: 'Recording stopped and uploaded successfully' },
            401: { description: 'Authentication required' },
            409: { description: 'No recording in progress' },
            503: { description: 'Camera service not available' },
            500: { description: 'Failed to stop recording' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PiGuardController.prototype, "stopRecording", null);
__decorate([
    route('get', '/camera/recording/status'),
    apiDoc({
        summary: 'Get recording status',
        description: 'Get the current recording status (whether recording is in progress).',
        tags: ['PiGuard', 'Camera'],
        operationId: 'getRecordingStatus',
        responses: {
            200: { description: 'Recording status' },
            500: { description: 'Failed to get recording status' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PiGuardController.prototype, "getRecordingStatus", null);
PiGuardController = __decorate([
    Controller('/pi-guard')
], PiGuardController);
export default PiGuardController;
//# sourceMappingURL=PiGuardController.js.map