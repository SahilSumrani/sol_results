function errorHandler(err, req, res, next) {
  const logger = req.log || console;
  logger.error(err, 'Unhandled Application Error');

  const status = err.status || err.statusCode || 500;
  const response = {
    error: status === 500 ? 'Internal Server Error' : err.message
  };

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    response.details = err.message;
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
