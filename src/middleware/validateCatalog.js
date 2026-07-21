const AppError = require('../utils/AppError');
const { catalogSchemas } = require('../validations/adminSchemas');

function validateCatalog(operation) {
  return (req, res, next) => {
    const schema = catalogSchemas[req.params.resource]?.[operation];

    if (!schema) {
      return next(new AppError('Unsupported catalogue resource', 404));
    }

    const result = schema.safeParse(req.body);

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

    req.body = result.data;
    return next();
  };
}

module.exports = validateCatalog;
