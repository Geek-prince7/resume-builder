const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
  highlights: [String],
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: String,
  startDate: Date,
  endDate: Date,
  grade: String,
  description: String,
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
  category: String,
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: String,
  date: Date,
  url: String,
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  url: String,
  technologies: [String],
});

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ['elementary', 'limited_working', 'professional_working', 'full_professional', 'native'],
    default: 'professional_working',
  },
});

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: { type: String, sparse: true },
    name: { type: String, required: true },
    phone: String,
    profilePicture: String,
    totalExperience: {
      years: { type: Number, default: 0 },
      months: { type: Number, default: 0 },
    },
    linkedinUrl: String,
    githubUrl: String,
    behanceUrl: String,
    portfolioUrl: String,
    summary: String,
    experiences: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
    languages: [languageSchema],
    achievements: [String],
    billing: {
      plan: { type: String, enum: ['free', 'starter', 'pro', 'career'], default: 'free' },
      status: {
        type: String,
        enum: ['free', 'trialing', 'active', 'past_due', 'canceled', 'incomplete'],
        default: 'free',
      },
      stripeCustomerId: { type: String, index: true, sparse: true },
      stripeSubscriptionId: { type: String, index: true, sparse: true },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    usage: {
      periodStart: { type: Date, default: Date.now },
      periodEnd: {
        type: Date,
        default: () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)),
      },
      aiActionsUsed: { type: Number, default: 0, min: 0 },
      resumeParsesUsed: { type: Number, default: 0, min: 0 },
      inputTokens: { type: Number, default: 0, min: 0 },
      outputTokens: { type: Number, default: 0, min: 0 },
      estimatedCostUsd: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
