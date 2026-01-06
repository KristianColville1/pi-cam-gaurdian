import 'reflect-metadata';

export const DOCS_METADATA = Symbol('docs:metadata');

/**
 * API documentation decorator
 * 
 * Usage as decorator:
 * @apiDoc({ summary: 'User login', ... })
 * async login(req, res) { ... }
 */
export function apiDoc(metadata: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(DOCS_METADATA, metadata, target, propertyKey);
    return descriptor;
  };
}

/**
 * Helper function to manually apply API documentation to a method
 */
export function applyApiDoc(ControllerClass: any, methodName: string, metadata: any) {
  Reflect.defineMetadata(DOCS_METADATA, metadata, ControllerClass.prototype, methodName);
}

