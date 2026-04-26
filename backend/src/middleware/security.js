const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');

const APP_ENV = process.env.APP_ENV || 'dev';
const isProdLike = APP_ENV === 'testapp' || APP_ENV === 'prod';

const parseOrigins = (value) => {
  if (!value || value.trim() === '*') return '*';
  return value.split(',').map((v) => v.trim()).filter(Boolean);
};

const allowedOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173');

const corsOptions = {
  origin: allowedOrigins === '*' ? true : allowedOrigins,
  credentials: true,
};

const generalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

function applySecurityMiddleware(app) {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: isProdLike
        ? {
            directives: {
              defaultSrc: ["'self'"],
              connectSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          }
        : false,
    })
  );
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(compression());
  app.use(generalRateLimiter);
}

module.exports = {
  corsOptions,
  applySecurityMiddleware,
  authRateLimiter,
};
