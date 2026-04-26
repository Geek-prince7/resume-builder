const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const APP_ENV = process.env.APP_ENV || 'dev';
const isCloudEnv = APP_ENV === 'testapp' || APP_ENV === 'prod';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'resume-builder-backend',
    env: APP_ENV,
  },
  transports: [],
});

if (APP_ENV === 'dev') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
    })
  );
} else if (isCloudEnv) {
  const logGroupName = process.env.CLOUDWATCH_LOG_GROUP || `resume-builder-${APP_ENV}`;
  const logStreamName =
    process.env.CLOUDWATCH_BACKEND_LOG_STREAM || `backend-${new Date().toISOString().slice(0, 10)}`;
  const awsRegion = process.env.AWS_REGION || 'us-east-1';

  try {
    logger.add(
      new WinstonCloudWatch({
        logGroupName,
        logStreamName,
        awsRegion,
        jsonMessage: true,
      })
    );
  } catch (err) {
    // Safe fallback: if CloudWatch transport fails to initialize, keep logging locally.
    logger.add(new winston.transports.Console());
    logger.warn('Failed to initialize CloudWatch transport, falling back to console', {
      error: err.message,
    });
  }
}

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP request completed', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
}

module.exports = { logger, requestLogger, APP_ENV };
