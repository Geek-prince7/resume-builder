const mongoose = require('mongoose');

const generatedResumeSchema = new mongoose.Schema({
  templateId: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed },
  htmlContent: String,
  score: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
});

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    company: String,
    role: String,
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'processed', 'failed'],
      default: 'pending',
    },
    generatedResumes: [generatedResumeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
