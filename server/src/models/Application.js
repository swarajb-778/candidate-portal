import { Schema, model } from 'mongoose';

const applicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },     // 'cc' | 'vp' | 'dx' — stable URL segment

  title:          { type: String, required: true },
  team:           { type: String, required: true },
  location:       String,
  employmentType: String,
  reqRef:         String,                     // 'SWE-VP-1663' — rendered in mono

  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Submitted', 'Under Review', 'Interview', 'Offer', 'Hired', 'Not Selected', 'Withdrawn']
  },

  appliedAt:   { type: Date, required: true },
  closedAt:    Date,
  withdrawnAt: Date,
  closeNote:   String,

  recruiter:     { name: String, initials: String, role: String },
  hiringManager: { name: String, role: String },

  timeline: [{
    at:    { type: Date, required: true },
    title: { type: String, required: true },
    text:  String,
    tone:  { type: String, enum: ['success', 'active', 'neutral'], default: 'neutral' }
  }],

  documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],

  jobDescriptionUrl: String
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

applicationSchema.index({ user: 1, slug: 1 }, { unique: true });
export const Application = model('Application', applicationSchema);
