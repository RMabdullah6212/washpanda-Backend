const crypto = require('crypto');

function generateBookingId(date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `WP-${datePart}-${randomPart}`;
}

module.exports = generateBookingId;
