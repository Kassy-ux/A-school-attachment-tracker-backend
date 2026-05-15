// ---- Global error handler ----
export const errorMiddleware = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    if (process.env.NODE_ENV === "development") {
        console.error(`[ERROR] ${statusCode} — ${message}`, err.stack);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
// ---- 404 handler ----
export const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
};
// ---- Create operational error ----
export const createError = (message, statusCode) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};
