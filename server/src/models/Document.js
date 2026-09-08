import { Schema, model } from 'mongoose';

const documentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },

  name:       { type: String, required: true },
  kind:       { type: String, enum: ['Resume', 'Cover Letter', 'Portfolio', 'Certification', 'Questionnaire', 'Other'], required: true },
  mimeType:   String,
  sizeBytes:  Number,     // formatted to 'PDF · 842 KB' on the client
  storageKey: String,     // path of the stored file, relative to server/uploads

  uploadedAt: { type: Date, default: Date.now },
  usedFor: [{ type: Schema.Types.ObjectId, ref: 'Application' }],

  // Set when the hiring team asked for this file rather than the candidate
  // volunteering it. Drives the "Requested Documents" tab.
  request: {
    isRequested: { type: Boolean, default: false },
    requestedBy: String,
    dueAt:       Date,
    fulfilled:   { type: Boolean, default: false },
    note:        String
  },

  deletedAt: Date         // soft delete
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

documentSchema.index({ user: 1, slug: 1 }, { unique: true });
export const Document = model('Document', documentSchema);
