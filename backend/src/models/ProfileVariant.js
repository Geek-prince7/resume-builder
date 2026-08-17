const mongoose = require('mongoose');

const profileVariantSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    targetRole: { type: String, trim: true, maxlength: 120 },
    summary: String,
    skillNames: [String],
    experienceIds: [String],
    projectIds: [String],
  },
  { timestamps: true }
);

profileVariantSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ProfileVariant', profileVariantSchema);
