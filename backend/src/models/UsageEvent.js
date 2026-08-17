const mongoose = require('mongoose');

const usageEventSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    operation: {
      type: String,
      required: true,
      enum: ['resume_parse', 'resume_generate', 'cover_letter', 'ats_analysis'],
    },
    provider: String,
    model: String,
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    status: { type: String, enum: ['reserved', 'completed', 'failed'], default: 'reserved' },
    referenceId: String,
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

usageEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UsageEvent', usageEventSchema);
