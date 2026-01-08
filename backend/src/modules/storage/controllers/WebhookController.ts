import 'reflect-metadata';
import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';

import WebhookHttpHandler from '../http/WebhookHttpHandler.js';

const webhookHttpHandler = new WebhookHttpHandler();

@Controller('/webhooks/recordings')
class WebhookController {
  @route('post', '/')
  @apiDoc({
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
  })
  async handleWebhook(req: Request, res: Response) {
    return webhookHttpHandler.handleWebhook(req, res);
  }
}

export default WebhookController;

