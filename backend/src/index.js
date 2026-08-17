const mongoose = require('mongoose');
require('dotenv').config();
const { logger, APP_ENV } = require('./logger');
const app = require('./app');
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB', { env: APP_ENV });
    app.listen(PORT, () => {
      logger.info('Backend server started', { port: PORT, env: APP_ENV });
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error', { message: err.message, stack: err.stack });
    process.exit(1);
  });
