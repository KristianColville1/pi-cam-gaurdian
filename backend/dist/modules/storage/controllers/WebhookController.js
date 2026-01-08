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
import WebhookHttpHandler from '../http/WebhookHttpHandler.js';
const webhookHttpHandler = new WebhookHttpHandler();
let WebhookController = class WebhookController {
    async handleWebhook(req, res) {
        return webhookHttpHandler.handleWebhook(req, res);
    }
};
__decorate([
    route('post', '/'),
    apiDoc({
        summary: 'Handle Bunny.net recording webhook',
        description: 'Receives webhooks from Bunny.net video library when recording processing status changes. Routes to appropriate handler based on status code.',
        tags: ['Webhooks', 'Storage'],
        operationId: 'handleRecordingWebhook',
        request: {
            body: {
                schema: {
                    type: 'object',
                    properties: {
                        VideoLibraryId: { type: 'integer' },
                        VideoGuid: { type: 'string' },
                        Status: {
                            type: 'integer',
                            enum: [0, 1, 2, 3, 4, 5],
                            description: 'Status code: 0=Queued, 1=Processing, 2=Encoding, 3=Finished, 4=Resolution finished, 5=Failed',
                        },
                    },
                    required: ['VideoLibraryId', 'VideoGuid', 'Status'],
                },
            },
        },
        responses: {
            200: { description: 'Webhook processed successfully' },
            400: { description: 'Missing required fields' },
            500: { description: 'Internal server error' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleWebhook", null);
WebhookController = __decorate([
    Controller('/webhooks/recordings')
], WebhookController);
export default WebhookController;
//# sourceMappingURL=WebhookController.js.map