const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  validate: { xForwardedForHeader: false },
});

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 1, // limit each IP to 1 vote per windowMs
  message: 'You can only vote once per hour.',
});

module.exports = { limiter, voteLimiter };
