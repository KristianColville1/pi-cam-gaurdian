import { Request, Response } from 'express';
import { generateOpenAPISpec } from '../../../core/docs/openapi-generator.js';

class DocsHttpHandler {
  async getOpenAPISpec(req: Request, res: Response) {
    try {
        const spec = await generateOpenAPISpec();
        console.log(spec);
      res.json(spec);
    } catch (error: any) {
      console.error('Failed to generate OpenAPI spec:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
}

export default DocsHttpHandler;

