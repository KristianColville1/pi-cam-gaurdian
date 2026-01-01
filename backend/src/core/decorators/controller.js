require('reflect-metadata');

const CONTROLLER_METADATA = Symbol('controller:metadata');
const ROUTES_METADATA = Symbol('controller:routes');

/**
 * Controller decorator function
 * @param {string} basePath - Base path for all routes in this controller
 * @returns {Function} Class decorator function
 */
function Controller(basePath = '') {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, { basePath }, target);
    if (!Reflect.hasMetadata(ROUTES_METADATA, target)) {
      Reflect.defineMetadata(ROUTES_METADATA, [], target);
    }
  };
}

module.exports = {
  CONTROLLER_METADATA,
  ROUTES_METADATA,
  Controller,
};
