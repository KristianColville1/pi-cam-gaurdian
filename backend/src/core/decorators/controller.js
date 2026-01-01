import 'reflect-metadata';

export const CONTROLLER_METADATA = Symbol('controller:metadata');
export const ROUTES_METADATA = Symbol('controller:routes');

/**
 * Controller decorator function
 * @param {string} basePath - Base path for all routes in this controller
 * @returns {Function} Class decorator function
 */
export function Controller(basePath = '') {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, { basePath }, target);
    if (!Reflect.hasMetadata(ROUTES_METADATA, target)) {
      Reflect.defineMetadata(ROUTES_METADATA, [], target);
    }
  };
}
