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
import AuthHttpHandler from '../http/AuthHttpHandler.js';
const authHttpHandler = new AuthHttpHandler();
let AuthController = class AuthController {
    async login(req, res) {
        return authHttpHandler.login(req, res);
    }
    async register(req, res) {
        return authHttpHandler.register(req, res);
    }
    async logout(req, res) {
        return authHttpHandler.logout(req, res);
    }
    async getCurrentUser(req, res) {
        return authHttpHandler.getCurrentUser(req, res);
    }
};
__decorate([
    route('post', '/login'),
    apiDoc({
        summary: 'User login',
        description: 'Authenticate user with email and password, returning user profile and session cookie.',
        tags: ['Auth'],
        operationId: 'login',
        request: {},
        responses: {
            200: { description: 'Login successful' },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    route('post', '/register'),
    apiDoc({
        summary: 'Register user',
        description: 'Create a user account and start an authenticated session.',
        tags: ['Auth'],
        operationId: 'register',
        request: {},
        responses: {
            201: { description: 'Registration successful' },
            400: { description: 'Validation error' },
            409: { description: 'Email already registered' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    route('post', '/logout', authenticateRequest()),
    apiDoc({
        summary: 'Logout user',
        description: 'Invalidate the active session cookie.',
        tags: ['Auth'],
        operationId: 'logout',
        responses: {
            200: { description: 'Logout successful' },
            401: { description: 'Authentication required' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    route('get', '/me', authenticateRequest()),
    apiDoc({
        summary: 'Get current user',
        description: 'Return the authenticated user profile.',
        tags: ['Auth'],
        operationId: 'getCurrentUser',
        responses: {
            200: { description: 'Current user profile' },
            401: { description: 'Authentication required' },
            404: { description: 'User not found' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
AuthController = __decorate([
    Controller('/auth')
], AuthController);
export default AuthController;
//# sourceMappingURL=AuthController.js.map