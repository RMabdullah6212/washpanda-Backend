function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with the same unique value already exists';
    details = error.keyValue;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (error.name === 'MulterError') {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? error.field === 'photo'
          ? 'Profile photo cannot exceed 5 MB'
          : 'Gallery file cannot exceed 100 MB'
        : error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

module.exports = { errorHandler, notFound };
