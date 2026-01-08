import 'reflect-metadata';
import { Request, Response } from 'express';
import { Controller } from '../../../core/decorators/controller.js';
import { route } from '../../../core/decorators/route.js';
import { apiDoc } from '../../../core/decorators/docs.js';
import DocsHttpHandler from '../http/DocsHttpHandler.js';

const docsHttpHandler = new DocsHttpHandler();

@Controller("/docs")
class DocsController {
    @route("get", "/openapi.json")
    @apiDoc({
        summary: "Get OpenAPI specification",
        description:
            "Returns the OpenAPI 3.1 specification for the API, generated from controller decorators.",
        tags: ["Docs"],
        operationId: "getOpenAPISpec",
        responses: {
            200: {
                description: "OpenAPI specification",
                schema: {
                    type: "object",
                },
            },
            500: { description: "Internal server error" },
        },
    })
    async getOpenAPISpec(req: Request, res: Response) {
        return docsHttpHandler.getOpenAPISpec(req, res);
    }

    @route("get", "/pi-guard/openapi.json")
    @apiDoc({
        summary: "Get Pi Guard OpenAPI specification",
        description: "Returns the OpenAPI 3.1 specification for the Pi Guard API, generated from controller decorators.",
        tags: ["Docs"],
        operationId: "getPiGuardOpenAPISpec",
    })
    async getPiGuardOpenAPISpec(req: Request, res: Response) {
        return docsHttpHandler.getPiGuardOpenAPISpec(req, res);
    }
}

export default DocsController;

