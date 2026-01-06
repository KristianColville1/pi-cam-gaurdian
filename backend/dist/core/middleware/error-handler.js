/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
}
/**
 * Global error handler
 */
export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    const statusCode = err.statusCode || err.status || 500;
    const errorResponse = {
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
}
//# sourceMappingURL=error-handler.js.map