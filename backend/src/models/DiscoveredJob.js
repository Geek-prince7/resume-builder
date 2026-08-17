const mongoose = require('mongoose');

const discoveredJobSchema = new mongoose.Schema({
  externalId: { type: String, required: true },
  source: { type: String, enum: ['greenhouse', 'lever'], required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  companyName: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  location: String,
  country: { type: String, trim: true, uppercase: true, index: true },
  workMode: { type: String, enum: ['remote', 'hybrid', 'onsite', 'unspecified'], default: 'unspecified' },
  jobUrl: { type: String, required: true },
  applyUrl: String,
  departments: [String],
  skills: [String],
  publishedAt: Date,
  lastSeenAt: { type: Date, default: Date.now },
  expiresAt: Date,
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

discoveredJobSchema.index({ source: 1, externalId: 1 }, { unique: true });
discoveredJobSchema.index({ active: 1, country: 1, publishedAt: -1 });
module.exports = mongoose.model('DiscoveredJob', discoveredJobSchema);
