const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscoveredJob', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  reasons: [String],
  missingSkills: [String],
  status: { type: String, enum: ['new', 'saved', 'dismissed', 'applied'], default: 'new', index: true },
  matchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

recommendationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
recommendationSchema.index({ userId: 1, status: 1, score: -1 });
module.exports = mongoose.model('JobRecommendation', recommendationSchema);
