function sendSuccess(res, { statusCode = 200, message, data, meta }) {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  });
}

module.exports = { sendSuccess };
