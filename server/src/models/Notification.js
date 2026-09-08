import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },

  kind:  { type: String, enum: ['application', 'interview', 'message', 'document'], required: true },
  title: { type: String, required: true },
  body:  String,
  contextLabel: String,

  createdAt:   { type: Date, default: Date.now }, // client groups by recency
  readAt:      Date,
  dismissedAt: Date,

  // Where the CTA goes. Client maps target → route.
  action: {
    label:  String,
    target: { type: String, enum: ['offer', 'interview-details', 'messages', 'documents', 'application', 'applications', 'overview', ''] },
    targetSlug: String
  }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, slug: 1 }, { unique: true });
export const Notification = model('Notification', notificationSchema);
