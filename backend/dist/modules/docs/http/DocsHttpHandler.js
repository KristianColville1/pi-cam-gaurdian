import { generateOpenAPISpec } from '../../../core/docs/openapi-generator.js';
class DocsHttpHandler {
    async getOpenAPISpec(req, res) {
        try {
            const spec = await generateOpenAPISpec();
            res.json(spec);
        }
        catch (error) {
            console.error('Failed to generate OpenAPI spec:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}
export default DocsHttpHandler;
//# sourceMappingURL=DocsHttpHandler.js.map