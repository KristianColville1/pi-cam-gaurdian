import 'reflect-metadata';
import { ROUTES_METADATA } from './controller.js';

/**
 * Route decorator helper - sets up route metadata for a controller method
 * Since JavaScript doesn't support decorators natively, this is used as a manual function
 * 
 * Usage (manual):
 * After defining a method, call: route('get', '/path', ...middlewares)(target, 'methodName')
 * 
 * Or use the applyRoute helper function for cleaner syntax
 * 
 * @param {string} method - HTTP method (get, post, put, patch, delete)
 * @param {string} path - Route path
 * @param {...Function} middlewares - Optional middleware functions
 * @returns {Function} Decorator function
 */
export function route(method, path, ...middlewares) {
  return (target, propertyKey) => {
    const routes = Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
    routes.push({
      method: method.toLowerCase(),
      path,
      propertyKey,
      middlewares,
    });
    Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
  };
}

/**
 * Helper function to manually apply route decorator to a method
 * Use this instead of decorator syntax in plain JavaScript
 * 
 * @param {Function} ControllerClass - The controller class
 * @param {string} methodName - Name of the method to decorate
 * @param {string} httpMethod - HTTP method (get, post, put, patch, delete)
 * @param {string} path - Route path
 * @param {...Function} middlewares - Optional middleware functions
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
