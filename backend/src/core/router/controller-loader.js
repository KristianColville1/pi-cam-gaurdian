import 'reflect-metadata';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import express from 'express';
import fg from 'fast-glob';
import { CONTROLLER_METADATA, ROUTES_METADATA } from '../decorators/controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default glob patterns for locating controller classes.
 * 
 * Scans:
 * - Domain modules: modules with entities (DDD bounded contexts)
 * - Shared utilities: cross-cutting utilities without entities
 */
const DEFAULT_GLOB = [
  'modules/**/controllers/**/*Controller.js',
  'modules/**/controllers/**/*.controller.js',
  'shared/**/controllers/**/*Controller.js',
  'shared/**/controllers/**/*.controller.js',
];

/**
 * Dynamically discover and register every controller with the provided Express app.
 * @param {Object} app - Express application instance
 * @param {Object} options - Options for loading controllers
 * @param {string|string[]} options.controllersGlob - Custom glob patterns for controllers
 * @returns {Promise<number>} Number of registered routes
 */
export async function registerControllers(app, options = {}) {
  const rootDir = getRuntimeRoot();
  const patterns = Array.isArray(options.controllersGlob)
    ? options.controllersGlob
    : options.controllersGlob
    ? [options.controllersGlob]
    : DEFAULT_GLOB;

  const files = await fg(patterns, {
    cwd: rootDir,
    absolute: true,
  });

  let registeredRoutes = 0;

  for (const file of files) {
    try {
      const moduleExports = await importModule(file);
      const exportedControllers = getControllerClasses(moduleExports);

      for (const Controller of exportedControllers) {
        const metadata = Reflect.getMetadata(CONTROLLER_METADATA, Controller);

        if (!metadata) {
          continue;
        }

        const { router, routeCount } = createControllerRouter(Controller, metadata);
        registeredRoutes += routeCount;
        console.log(`🧭 Registered controller ${Controller.name} at /api${metadata.basePath || '/'}`);
        app.use('/api', router);
      }
    } catch (error) {
      console.error(`Failed to load controller from ${file}:`, error);
    }
  }

  return registeredRoutes;
}

function getRuntimeRoot() {
  // __dirname is src/core/router
  // We want the directory that contains modules/**
  return resolve(__dirname, '..', '..');
}

async function importModule(filePath) {
  // In ESM, dynamic imports are cached. For hot reload in dev,
  // you might want to implement a cache-busting mechanism if needed.
  // For now, we'll use the standard dynamic import.
  return await import(filePath);
}

/**
 * Filter module exports to controller classes (identified by `@Controller` metadata).
 */
function getControllerClasses(moduleExports) {
  return Object.values(moduleExports).filter((exportValue) => {
    if (typeof exportValue !== 'function') return false;
    return Reflect.hasMetadata(CONTROLLER_METADATA, exportValue);
  });
}

/**
 * Instantiate a controller, wire its routes, and return an Express router instance.
 */
function createControllerRouter(Controller, metadata) {
  const router = express.Router();
  const controllerInstance = new Controller();
  const routes = Reflect.getMetadata(ROUTES_METADATA, Controller) || [];

  for (const route of routes) {
    const handler = getControllerHandler(controllerInstance, route.propertyKey);
    const fullPath = resolveRoutePath(metadata.basePath, route.path);
    const middlewares = route.middlewares || [];

    router[route.method.toLowerCase()](fullPath, ...middlewares, wrapAsync(handler));
  }

  return {
    router,
    routeCount: routes.length,
  };
}

function getControllerHandler(instance, propertyKey) {
  const handler = instance[propertyKey];
  if (typeof handler !== 'function') {
    throw new Error(`Controller handler ${String(propertyKey)} is not a function`);
  }

  return handler.bind(instance);
}

function resolveRoutePath(basePath, routePath) {
  const normalizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedRoute = routePath.startsWith('/') ? routePath : `/${routePath}`;

  if (normalizedRoute === '/' || normalizedRoute === '') {
    return normalizedBase;
  }

  if (normalizedBase === '/') {
    return normalizedRoute;
  }

  return `${normalizedBase}${normalizedRoute}`.replace(/\/{2,}/g, '/');
}

function wrapAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
