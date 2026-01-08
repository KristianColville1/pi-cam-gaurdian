import 'reflect-metadata';
import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';
import { authenticateRequest } from '../../../core/middleware/auth.js';

import PiGuardHttpHandler from '../http/PiGuardHttpHandler.js';

const piGuardHttpHandler = new PiGuardHttpHandler();

@Controller('/pi-guard')
class PiGuardController {
  @route('get', '/endpoints')
  @apiDoc({
    summary: 'Get available endpoints',
    description: 'Retrieve a list of available endpoints from the pi-guard service.',
    tags: ['PiGuard'],
    operationId: 'getPiGuardEndpoints',
    responses: {
      200: { description: 'List of available endpoints' },
      500: { description: 'Failed to fetch endpoints from pi-guard' },
    },
  })
  async getEndpoints(req: Request, res: Response) {
    return piGuardHttpHandler.getEndpoints(req, res);
  }

  @route('get', '/health')
  @apiDoc({
    summary: 'Get pi-guard health status',
    description: 'Check the health status of the pi-guard service.',
    tags: ['PiGuard'],
    operationId: 'getPiGuardHealth',
    responses: {
      200: { description: 'Health status from pi-guard' },
      500: { description: 'Failed to get health status' },
    },
  })
  async getHealth(req: Request, res: Response) {
    return piGuardHttpHandler.getHealth(req, res);
  }

  @route('get', '/camera/capture', authenticateRequest())
  @apiDoc({
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
  })
  async captureImage(req: Request, res: Response) {
    return piGuardHttpHandler.captureImage(req, res);
  }

  @route('get', '/camera/recording/start', authenticateRequest())
  @apiDoc({
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
  })
  async startRecording(req: Request, res: Response) {
    return piGuardHttpHandler.startRecording(req, res);
  }

  @route('get', '/camera/recording/stop', authenticateRequest())
  @apiDoc({
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
  })
  async stopRecording(req: Request, res: Response) {
    return piGuardHttpHandler.stopRecording(req, res);
  }

  @route('get', '/camera/recording/status')
  @apiDoc({
    summary: 'Get recording status',
    description: 'Get the current recording status (whether recording is in progress).',
    tags: ['PiGuard', 'Camera'],
    operationId: 'getRecordingStatus',
    responses: {
      200: { description: 'Recording status' },
      500: { description: 'Failed to get recording status' },
    },
  })
  async getRecordingStatus(req: Request, res: Response) {
    return piGuardHttpHandler.getRecordingStatus(req, res);
  }
}

export default PiGuardController;

