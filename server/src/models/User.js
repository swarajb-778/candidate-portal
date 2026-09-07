import { Schema, model } from 'mongoose';

const channel = (sms = false, email = true, app = true) => ({
  email: { type: Boolean, default: email },
  sms:   { type: Boolean, default: sms },
  app:   { type: Boolean, default: app }
});

const userSchema = new Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },

  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, trim: true },
  city:      { type: String, trim: true },
  pronouns:  { type: String, trim: true },
  workAuth:  { type: String, enum: ['US Citizen', 'Permanent Resident', 'Visa holder', 'Need sponsorship'] },

  links: { linkedin: String, github: String, site: String },

  preferences: {
    targetRole:    String,
    locations:     String,
    earliestStart: String,
    workSetup:     String,
    compensation:  String
  },

  // Voluntary self-identification. NEVER returned by any recruiter-facing
  // endpoint. Kept in a subdocument so it can be projected out in one line.
  eeo: {
    provided:   { type: Boolean, default: false },
    gender:     { type: String, default: 'Prefer not to say' },
    veteran:    { type: String, default: 'Prefer not to say' },
    disability: { type: String, default: 'Prefer not to say' }
  },

  experience: [{ title: String, org: String, period: String, loc: String, desc: String }],
  education:  [{ school: String, degree: String, period: String, extra: String }],
  skills:     [String],

  visibility: { openToOtherRoles: { type: Boolean, default: true } },

  settings: {
    twoFactor:  { type: Boolean, default: true },
    language:   { type: String, default: 'English (US)' },
    timezone:   { type: String, default: 'America/Los_Angeles' }, // IANA, not 'Pacific Time (PT)'
    dateFormat: { type: String, enum: ['MM/DD/YYYY', 'DD.MM.YYYY'], default: 'MM/DD/YYYY' },
    pauseNonUrgent: { type: Boolean, default: false },
    digest:     { type: String, enum: ['Off', 'Daily', 'Weekly on Monday'], default: 'Weekly on Monday' },
    notifications: {
      status:    channel(false),
      interview: channel(true),
      messages:  channel(false),
      docs:      channel(false),
      matches:   channel(false, false)
    }
  },

  // Signed-in devices. Seeded rather than derived — the design lists three.
  devices: [{
    key:        String,
    name:       String,
    location:   String,
    lastActive: Date,
    current:    { type: Boolean, default: false }
  }],

  passwordChangedAt: Date
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals the chrome leans on — see README "Identity propagation".
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
userSchema.virtual('initials').get(function () {
  return ((this.firstName?.[0] ?? '?') + (this.lastName?.[0] ?? '')).toUpperCase();
});

export const User = model('User', userSchema);
