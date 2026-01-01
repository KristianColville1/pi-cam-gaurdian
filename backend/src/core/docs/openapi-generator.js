import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { promises as fs } from 'fs';
import fg from 'fast-glob';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * OpenAPI generator that reflects over decorated controllers, converts
 * any attached metadata into an OpenAPI 3.1 document, and emits the
 * resulting JSON under `backend/docs/`.
 * 
 * ?NOTE: This file requires decorator infrastructure to be set up.
 * Currently simplified to work without decorators - expand when decorator system is implemented properly and all working.
 */

/**
 * Entry point – discovers operations, composes the OpenAPI document,
 * and persists it to disk.
 */
export async function main() {
  try {
    const operations = await collectOperations();
    const paths = buildPathsObject(operations);

    const spec = {
      openapi: '3.1.0',
      info: {
        title: 'PiCam Guardian API',
        version: env.APP_VERSION || '0.0.0',
        description: 'PiCam Guardian API Documentation',
      },
      paths,
    };

    const projectRoot = resolve(__dirname, '../../..');
    const outputDir = join(projectRoot, 'docs');
    const jsonPath = join(outputDir, 'openapi.json');

    await fs.mkdir(outputDir, { recursive: true });
    
    // Write JSON format
    await fs.writeFile(jsonPath, JSON.stringify(spec, null, 2));
    console.log(`✅ OpenAPI spec (JSON) generated at ${jsonPath}`);
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI spec', error);
    process.exitCode = 1;
  }
}

/**
 * Walk every controller export and capture each route definition along
 * with any documentation metadata that has been attached via `@apiDoc`.
 * 
 * NOTE: Currently returns empty array - implement when decorator system is set up
 */
async function collectOperations() {
  // TODO: Implement controller discovery when decorator system is available
  // This requires:
  // - CONTROLLER_METADATA and ROUTES_METADATA from decorators
  // - DOCS_METADATA from decorators
  // - Reflect metadata support (reflect-metadata package)
  
  return [];
}

/**
 * Transform the collected operations into the OpenAPI `paths` structure.
 */
export function buildPathsObject(operations) {
  const paths = {};

  for (const operation of operations) {
    const { basePath, route, docs } = operation;
    const fullPath = resolveRoutePath(basePath, route.path);
    const method = route.method.toLowerCase();

    const operationObj = {};
    if (docs?.summary) operationObj.summary = docs.summary;
    if (docs?.description) operationObj.description = docs.description;
    if (docs?.tags) operationObj.tags = docs.tags;
    if (docs?.operationId) operationObj.operationId = docs.operationId;

    const parameters = buildParameters(docs);
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
 * Convert request schema metadata into OpenAPI parameters (query/path).
 */
export function buildParameters(docs) {
  const parameters = [];
  if (!docs) return parameters;

  if (docs.request?.query) {
    parameters.push(...convertSchemaToParameters(docs.request.query, 'query'));
  }

  if (docs.request?.params) {
    parameters.push(...convertSchemaToParameters(docs.request.params, 'path'));
  }

  return parameters;
}

/**
 * Produce an OpenAPI requestBody section when a schema is provided.
 */
export function buildRequestBody(docs) {
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

/**
 * Build the OpenAPI responses map, defaulting to a generic 200 when no
 * explicit metadata is supplied.
 */
export function buildResponses(docs) {
  const responses = {};
  const entries =
    docs?.responses && Object.keys(docs.responses).length > 0
      ? Object.entries(docs.responses)
      : [['200', { description: 'Success' }]];

  for (const [statusCode, metaRaw] of entries) {
    const meta =
      typeof metaRaw === 'string'
        ? { description: metaRaw }
        : (metaRaw || { description: 'Success' });

    const response = {
      description: meta.description || 'Success',
    };

    if (meta.schema) {
      const schema = toOpenApiSchema(meta.schema);
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

/**
 * Expand a schema object into individual parameter definitions.
 */
function convertSchemaToParameters(schemaLike, location) {
  const schema = toOpenApiSchema(schemaLike);
  if (!schema || !isPlainObject(schema)) {
    return [];
  }

  const schemaObject = schema;

  if (schemaObject.type !== 'object' || !schemaObject.properties) {
    return [];
  }

  const params = [];
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

/**
 * Normalise a schema reference (plain object) into a JSON schema fragment that OpenAPI understands.
 */
function toOpenApiSchema(schemaLike) {
  if (!schemaLike) return undefined;

  if (isPlainObject(schemaLike)) {
    return schemaLike;
  }

  return undefined;
}

/**
 * Lightweight `typeof` guard for plain objects (excludes arrays/null).
 */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Ensure controller base paths and route fragments combine cleanly.
 */
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

// Run if called directly (ESM equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
