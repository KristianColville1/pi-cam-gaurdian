import 'reflect-metadata';

export const DOCS_METADATA = Symbol('docs:metadata');

/**
 * API documentation decorator helper
 * Since JavaScript doesn't support decorators natively, use applyApiDoc helper function
 * 
 * @param {Object} metadata - API documentation metadata
 * @returns {Function} Decorator function
 */
export function apiDoc(metadata) {
  return (target, propertyKey) => {
    Reflect.defineMetadata(DOCS_METADATA, metadata, target, propertyKey);
  };
}

/**
 * Helper function to manually apply API documentation to a method
 * Use this instead of decorator syntax in plain JavaScript
 * 
 * @param {Function} ControllerClass - The controller class
 * @param {string} methodName - Name of the method to document
 * @param {Object} metadata - API documentation metadata
 */
export function applyApiDoc(ControllerClass, methodName, metadata) {
  Reflect.defineMetadata(DOCS_METADATA, metadata, ControllerClass.prototype, methodName);
}
