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
import DocsHttpHandler from '../http/DocsHttpHandler.js';
const docsHttpHandler = new DocsHttpHandler();
let DocsController = class DocsController {
    async getOpenAPISpec(req, res) {
        return docsHttpHandler.getOpenAPISpec(req, res);
    }
    async getPiGuardOpenAPISpec(req, res) {
        return docsHttpHandler.getPiGuardOpenAPISpec(req, res);
    }
};
__decorate([
    route("get", "/openapi.json"),
    apiDoc({
        summary: "Get OpenAPI specification",
        description: "Returns the OpenAPI 3.1 specification for the API, generated from controller decorators.",
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "getOpenAPISpec", null);
__decorate([
    route("get", "/pi-guard/openapi.json"),
    apiDoc({
        summary: "Get Pi Guard OpenAPI specification",
        description: "Returns the OpenAPI 3.1 specification for the Pi Guard API, generated from controller decorators.",
        tags: ["Docs"],
        operationId: "getPiGuardOpenAPISpec",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocsController.prototype, "getPiGuardOpenAPISpec", null);
DocsController = __decorate([
    Controller("/docs")
], DocsController);
export default DocsController;
//# sourceMappingURL=DocsController.js.map