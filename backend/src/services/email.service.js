const nodemailer = require('nodemailer');
const { logger } = require('../logger');

const transport = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
}) : null;

async function sendAccountEmail({ to, subject, text }) {
  if (!transport) {
    logger.info('Development email', { to, subject, text });
    return;
  }
  await transport.sendMail({ from: process.env.EMAIL_FROM || 'ResumeAI <no-reply@example.com>', to, subject, text });
}
module.exports = { sendAccountEmail };
