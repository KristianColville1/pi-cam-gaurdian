import 'reflect-metadata';
import { ROUTES_METADATA } from './controller.js';
/**
 * Route decorator - sets up route metadata for a controller method
 *
 * Usage as decorator:
 * @route('post', '/login')
 * async login(req, res) { ... }
 */
export function route(method, path, ...middlewares) {
    return (target, propertyKey, descriptor) => {
        const routes = Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
        routes.push({
            method: method.toLowerCase(),
            path,
            propertyKey,
            middlewares,
        });
        Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
        return descriptor;
    };
}
/**
 * Helper function to manually apply route decorator to a method
 */
export function applyRoute(ControllerClass, methodName, httpMethod, path, ...middlewares) {
    const routes = Reflect.getMetadata(ROUTES_METADATA, ControllerClass) || [];
    routes.push({
        method: httpMethod.toLowerCase(),
        path,
        propertyKey: methodName,
        middlewares,
    });
    Reflect.defineMetadata(ROUTES_METADATA, routes, ControllerClass);
}
//# sourceMappingURL=route.js.map