import 'reflect-metadata';
import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';
import { authenticateRequest } from '../../../core/middleware/auth.js';

import MetricsHttpHandler from '../http/MetricsHttpHandler.js';

const metricsHttpHandler = new MetricsHttpHandler();

@Controller('/metrics')
class MetricsController {
  @route('post', '/')
  @apiDoc({
    summary: 'Create sensor metric',
    description: 'Create a new sensor metric entry. Can be called from Pi to store metrics.',
    tags: ['Metrics'],
    operationId: 'createMetric',
    request: {},
    responses: {
      201: { description: 'Metric created successfully' },
      400: { description: 'Validation error' },
      500: { description: 'Internal server error' },
    },
  })
  async createMetric(req: Request, res: Response) {
    return metricsHttpHandler.createMetric(req, res);
  }

  @route('get', '/')
  @apiDoc({
    summary: 'Get paginated metrics',
    description: 'Get a paginated list of sensor metrics with optional filtering and sorting.',
    tags: ['Metrics'],
    operationId: 'getMetrics',
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
      { name: 'sort', in: 'query', schema: { type: 'string', default: 'created_at' } },
      { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } },
      { name: 'device_id', in: 'query', schema: { type: 'string' } },
      { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
      { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
    ],
    responses: {
      200: { description: 'Paginated list of metrics' },
      500: { description: 'Internal server error' },
    },
  })
  async getMetrics(req: Request, res: Response) {
    return metricsHttpHandler.getMetrics(req, res);
  }

  @route('get', '/latest')
  @apiDoc({
    summary: 'Get latest metric',
    description: 'Get the most recent sensor metric, optionally filtered by device.',
    tags: ['Metrics'],
    operationId: 'getLatestMetric',
    parameters: [
      { name: 'device_id', in: 'query', schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Latest metric' },
      404: { description: 'No metrics found' },
      500: { description: 'Internal server error' },
    },
  })
  async getLatestMetric(req: Request, res: Response) {
    return metricsHttpHandler.getLatestMetric(req, res);
  }

  @route('get', '/statistics')
  @apiDoc({
    summary: 'Get statistics',
    description: 'Get aggregated statistics for sensor metrics with optional filtering.',
    tags: ['Metrics'],
    operationId: 'getStatistics',
    parameters: [
      { name: 'device_id', in: 'query', schema: { type: 'string' } },
      { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
      { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
    ],
    responses: {
      200: { description: 'Statistics data' },
      500: { description: 'Internal server error' },
    },
  })
  async getStatistics(req: Request, res: Response) {
    return metricsHttpHandler.getStatistics(req, res);
  }

  @route('get', '/:id')
  @apiDoc({
    summary: 'Get metric by ID',
    description: 'Get a single sensor metric by its ID.',
    tags: ['Metrics'],
    operationId: 'getMetricById',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Metric data' },
      404: { description: 'Metric not found' },
      500: { description: 'Internal server error' },
    },
  })
  async getMetricById(req: Request, res: Response) {
    return metricsHttpHandler.getMetricById(req, res);
  }

  @route('delete', '/:id', authenticateRequest())
  @apiDoc({
    summary: 'Delete metric',
    description: 'Delete a sensor metric by its ID. Requires authentication.',
    tags: ['Metrics'],
    operationId: 'deleteMetric',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      200: { description: 'Metric deleted successfully' },
      401: { description: 'Authentication required' },
      404: { description: 'Metric not found' },
      500: { description: 'Internal server error' },
    },
  })
  async deleteMetric(req: Request, res: Response) {
    return metricsHttpHandler.deleteMetric(req, res);
  }
}

export default MetricsController;

