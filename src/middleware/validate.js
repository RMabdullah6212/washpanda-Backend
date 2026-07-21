const AppError = require('../utils/AppError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        new AppError(
          'Request validation failed',
          400,
          result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        )
      );
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = validate;
