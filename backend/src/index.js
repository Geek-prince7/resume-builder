const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { logger, requestLogger, APP_ENV } = require('./logger');
const { corsOptions, applySecurityMiddleware } = require('./middleware/security');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobDescriptionRoutes = require('./routes/jobDescription.routes');
const templateRoutes = require('./routes/template.routes');
const billingRoutes = require('./routes/billing.routes');
const profileVariantRoutes = require('./routes/profileVariant.routes');
const billingController = require('./controllers/billing.controller');
const { snapshot } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingController.webhook);
applySecurityMiddleware(app);
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.BODY_LIMIT || '2mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '2mb' }));
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/profile-variants', profileVariantRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'resume-builder-backend' });
});
app.get('/api/metrics', (_req, res) => res.json(snapshot()));

app.use((err, _req, res, _next) => {
  logger.error('Unhandled backend error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

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
