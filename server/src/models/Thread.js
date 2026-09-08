import { Schema, model } from 'mongoose';

// Two collections, since a thread's message list grows unbounded.
const threadSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true },

  participant: {
    name:     { type: String, required: true },
    role:     String,
    initials: String
  },
  application:   { type: Schema.Types.ObjectId, ref: 'Application' },
  lastMessageAt: Date,
  unreadCount:   { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const messageSchema = new Schema({
  thread:        { type: Schema.Types.ObjectId, ref: 'Thread', required: true, index: true },
  fromCandidate: { type: Boolean, required: true }, // true = right-aligned accent bubble
  body:          { type: String, required: true },
  sentAt:        { type: Date, default: Date.now },
  attachments: [{ name: String, sizeBytes: Number, storageKey: String }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

threadSchema.index({ user: 1, slug: 1 }, { unique: true });
messageSchema.index({ thread: 1, sentAt: 1 });

export const Thread = model('Thread', threadSchema);
export const Message = model('Message', messageSchema);
