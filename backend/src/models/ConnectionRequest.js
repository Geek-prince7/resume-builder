const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    jobDescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', index: true },
    contactName: { type: String, trim: true, required: true },
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    profileUrl: { type: String, trim: true, maxlength: 2048 },
    requestType: {
      type: String,
      enum: ['connection', 'referral', 'informational'],
      default: 'connection',
    },
    status: {
      type: String,
      enum: ['planned', 'sent', 'accepted', 'declined', 'no_response'],
      default: 'planned',
      index: true,
    },
    connectionMessage: String,
    welcomeMessage: String,
    referralMessage: String,
    followUpMessage: String,
    sentAt: Date,
    acceptedAt: Date,
    followUpAt: Date,
    lastContactedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

connectionRequestSchema.index({ userId: 1, followUpAt: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
