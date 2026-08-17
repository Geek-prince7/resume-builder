const mongoose = require('mongoose');

const resumeRevisionSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

const generatedResumeSchema = new mongoose.Schema({
  templateId: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed },
  score: { type: Number, min: 0, max: 100 },
  atsReport: {
    confirmedSkills: [String],
    missingSkills: [String],
    matchedKeywords: [String],
    missingKeywords: [String],
    strengths: [String],
    recommendations: [String],
  },
  revisions: { type: [resumeRevisionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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
    jobUrl: { type: String, trim: true, maxlength: 2048 },
    location: String,
    source: String,
    profileVariantId: String,
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'processed', 'failed'],
      default: 'pending',
    },
    applicationStatus: {
      type: String,
      enum: ['saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn'],
      default: 'saved',
      index: true,
    },
    appliedAt: Date,
    nextAction: String,
    nextActionAt: Date,
    applicationNotes: String,
    generatedResumes: [generatedResumeSchema],
    coverLetters: [{
      content: { type: String, required: true },
      profileVariantId: String,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
