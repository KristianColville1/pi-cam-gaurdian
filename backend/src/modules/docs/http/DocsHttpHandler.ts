import { Request, Response } from 'express';
import { generateOpenAPISpec } from '../../../core/docs/openapi-generator.js';
import env from '../../../core/config/env.js';

class DocsHttpHandler {
  /**
   * Get the OpenAPI specification for the API
   * @param req - The request object
   * @param res - The response object
   * @returns The OpenAPI specification
   */
  async getOpenAPISpec(req: Request, res: Response) {
    try {
        const spec = await generateOpenAPISpec();
      res.json(spec);
    } catch (error: any) {
      console.error('Failed to generate OpenAPI spec:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  /**
   * Get the OpenAPI specification for the Pi Guard API
   * @param req - The request object
   * @param res - The response object
   * @returns The OpenAPI specification
   */
  async getPiGuardOpenAPISpec(req: Request, res: Response) {
    try {
      const spec = await fetch(`${env.PI_GUARD_URL}/openapi.json`);
      res.json(spec);
    } catch (error: any) {
      console.error('Failed to generate Pi Guard OpenAPI spec:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
}

export default DocsHttpHandler;

