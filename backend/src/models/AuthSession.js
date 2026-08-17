const mongoose = require('mongoose');
const authSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, tokenHash: { type: String, required: true, unique: true },
  userAgent: String, ip: String, expiresAt: { type: Date, required: true, index: { expires: 0 } }, revokedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('AuthSession', authSessionSchema);
