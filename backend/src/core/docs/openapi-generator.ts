import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { promises as fs } from 'fs';
import fg from 'fast-glob';
import env from '../config/env.js';
import { CONTROLLER_METADATA, ROUTES_METADATA } from '../decorators/controller.js';
import { DOCS_METADATA } from '../decorators/docs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate OpenAPI spec from decorated controllers
 */
export async function generateOpenAPISpec() {
  const operations = await collectOperations();
  const paths = buildPathsObject(operations);

  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'PiCam Guardian API',
      version: env.APP_VERSION || '0.0.0',
      description: 'PiCam Guardian API Documentation for backend API',
    },
    paths
  };

  return spec;
}

/**
 * Collect operations from all controllers using reflection
 * Uses the same logic as controller-loader for consistency
 */
async function collectOperations() {
  const rootDir = getRuntimeRoot();
  const patterns = [
    'modules/**/controllers/**/*Controller.ts',
    'modules/**/controllers/**/*.controller.ts',
    'shared/**/controllers/**/*Controller.ts',
    'shared/**/controllers/**/*.controller.ts',
  ];

  const files = await fg(patterns, {
    cwd: rootDir,
    absolute: true,
  });

  const operations: any[] = [];

  for (const file of files) {
    try {
      const moduleExports = await importModule(file);
      const controllers = getControllerClasses(moduleExports);

      for (const Controller of controllers) {
        const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA, Controller);
        if (!controllerMetadata) {
          console.warn(`Controller ${Controller.name} has no metadata`);
          continue;
        }

        const routes = Reflect.getMetadata(ROUTES_METADATA, Controller) || [];
        
        if (routes.length === 0) {
          console.warn(`Controller ${Controller.name} has no routes`);
          continue;
        }

        for (const route of routes) {
          const docs = Reflect.getMetadata(DOCS_METADATA, Controller.prototype, route.propertyKey);
          
          operations.push({
            basePath: controllerMetadata.basePath,
            route: {
              method: route.method,
              path: route.path,
            },
            docs: docs || {},
          });
        }
      }
    } catch (error: any) {
      console.error(`Failed to load controller from ${file}:`, error);
      console.error(error.stack);
    }
  }

  console.log(`📚 Collected ${operations.length} operations from ${files.length} controller files`);

  return operations;
}

function getRuntimeRoot() {
  return resolve(__dirname, '..', '..');
}

async function importModule(filePath: string) {
  return await import(filePath);
}

function getControllerClasses(moduleExports: any) {
  const controllers: any[] = [];
  
  // Check default export
  if (moduleExports.default && typeof moduleExports.default === 'function') {
    if (Reflect.hasMetadata(CONTROLLER_METADATA, moduleExports.default)) {
      controllers.push(moduleExports.default);
    }
  }
  
  // Check named exports
  for (const exportValue of Object.values(moduleExports)) {
    if (typeof exportValue === 'function' && exportValue !== moduleExports.default) {
      if (Reflect.hasMetadata(CONTROLLER_METADATA, exportValue)) {
        controllers.push(exportValue);
      }
    }
  }
  
  return controllers;
}

export function buildPathsObject(operations: any[]) {
  const paths: any = {};

  for (const operation of operations) {
    const { basePath, route, docs } = operation;
    const fullPath = resolveRoutePath(basePath, route.path);
    const method = route.method.toLowerCase();

    const operationObj: any = {};
    if (docs?.summary) operationObj.summary = docs.summary;
    if (docs?.description) operationObj.description = docs.description;
    if (docs?.tags) operationObj.tags = docs.tags;
    if (docs?.operationId) operationObj.operationId = docs.operationId;

    // Extract path parameters from the route path
    const pathParams = extractPathParameters(fullPath);
    
    // Start with path parameters
    const parameters: any[] = [...pathParams];

    // Handle parameters from docs.parameters array (merge with path params)
    if (docs?.parameters && Array.isArray(docs.parameters)) {
      // Merge, avoiding duplicates
      for (const param of docs.parameters) {
        if (!parameters.find(p => p.name === param.name && p.in === param.in)) {
          parameters.push(param);
        }
      }
    } else {
      // Build from docs.request if available
      const builtParams = buildParameters(docs);
      for (const param of builtParams) {
        if (!parameters.find(p => p.name === param.name && p.in === param.in)) {
          parameters.push(param);
        }
      }
    }

    if (parameters.length > 0) {
      operationObj.parameters = parameters;
    }

    const requestBody = buildRequestBody(docs);
    if (requestBody) {
      operationObj.requestBody = requestBody;
    }

    operationObj.responses = buildResponses(docs);

    const existingOperations = paths[fullPath] || {};
    existingOperations[method] = operationObj;
    paths[fullPath] = existingOperations;
  }

  return paths;
}

/**
 * Extract path parameters from a route path (e.g., /users/:id -> [{ name: 'id', in: 'path', ... }])
 */
function extractPathParameters(path: string): any[] {
  const params: any[] = [];
  const paramRegex = /:(\w+)/g;
  let match;

  while ((match = paramRegex.exec(path)) !== null) {
    params.push({
      name: match[1],
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: `Path parameter: ${match[1]}`,
    });
  }

  return params;
}

export function buildParameters(docs: any) {
  const parameters: any[] = [];
  if (!docs) return parameters;

  if (docs.request?.query) {
    parameters.push(...convertSchemaToParameters(docs.request.query, 'query'));
  }

  if (docs.request?.params) {
    parameters.push(...convertSchemaToParameters(docs.request.params, 'path'));
  }

  return parameters;
}

export function buildRequestBody(docs: any) {
  if (!docs?.request?.body) {
    return undefined;
  }

  const schema = toOpenApiSchema(docs.request.body);
  if (!schema) {
    return undefined;
  }

  return {
    required: true,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

export function buildResponses(docs: any) {
  const responses: any = {};
  const entries =
    docs?.responses && Object.keys(docs.responses).length > 0
      ? Object.entries(docs.responses)
      : [['200', { description: 'Success' }]];

  for (const [statusCode, metaRaw] of entries) {
    const meta =
      typeof metaRaw === 'string'
        ? { description: metaRaw }
        : (metaRaw || { description: 'Success' });

    const response: any = {
      description: (meta as any).description || 'Success',
    };

    if ((meta as any).schema) {
      const schema = toOpenApiSchema((meta as any).schema);
      if (schema) {
        response.content = {
          'application/json': {
            schema,
          },
        };
      }
    }

    responses[String(statusCode)] = response;
  }

  return responses;
}

function convertSchemaToParameters(schemaLike: any, location: string) {
  const schema = toOpenApiSchema(schemaLike);
  if (!schema || !isPlainObject(schema)) {
    return [];
  }

  const schemaObject = schema;

  if (schemaObject.type !== 'object' || !schemaObject.properties) {
    return [];
  }

  const params: any[] = [];
  const requiredSet = new Set(
    Array.isArray(schemaObject.required) ? schemaObject.required : []
  );

  for (const [name, definition] of Object.entries(schemaObject.properties)) {
    params.push({
      name,
      in: location,
      required: location === 'path' ? true : requiredSet.has(name),
      schema: definition,
    });
  }

  return params;
}

function toOpenApiSchema(schemaLike: any) {
  if (!schemaLike) return undefined;

  if (isPlainObject(schemaLike)) {
    return schemaLike;
  }

  return undefined;
}

function isPlainObject(value: any) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveRoutePath(basePath: string, routePath: string) {
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

/**
 * Legacy main function for CLI usage
 */
export async function main() {
  try {
    const spec = await generateOpenAPISpec();
    const projectRoot = resolve(__dirname, '../../..');
    const outputDir = join(projectRoot, 'docs');
    const jsonPath = join(outputDir, 'openapi.json');

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(jsonPath, JSON.stringify(spec, null, 2));
    console.log(`✅ OpenAPI spec (JSON) generated at ${jsonPath}`);
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI spec', error);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
