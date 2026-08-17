const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  source: { type: String, enum: ['greenhouse', 'lever', 'manual'], required: true },
  websiteUrl: String,
  careersUrl: String,
  country: { type: String, trim: true, uppercase: true, index: true },
  companyType: { type: String, index: true },
  industries: [String],
  employeeRange: String,
  activeJobCount: { type: Number, default: 0 },
  lastDiscoveredAt: Date,
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

companySchema.index({ source: 1, slug: 1 }, { unique: true });
module.exports = mongoose.model('Company', companySchema);
