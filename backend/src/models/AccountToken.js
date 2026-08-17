const mongoose = require('mongoose');
const accountTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, tokenHash: { type: String, required: true, unique: true },
  purpose: { type: String, enum: ['verify_email', 'reset_password'], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, usedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('AccountToken', accountTokenSchema);
