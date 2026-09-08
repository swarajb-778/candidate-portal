import { Schema, model } from 'mongoose';

const interviewSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  slug:        { type: String, required: true },

  kind:   { type: String, enum: ['panel-day', 'single'], default: 'single' },
  status: { type: String, enum: ['Scheduled', 'Reschedule requested', 'Completed', 'Cancelled'], default: 'Scheduled' },

  // For a panel day these bound the whole day; sessions carry their own times.
  startsAt: { type: Date, required: true },
  endsAt:   { type: Date, required: true },

  sessions: [{
    title:    String,
    startsAt: Date,
    endsAt:   Date,
    kind:     { type: String, enum: ['session', 'break'], default: 'session' },
    interviewers: [{ name: String, role: String, initials: String }],
    focus:    String
  }],

  format:  { type: String, enum: ['Video', 'Onsite', 'Phone'], default: 'Video' },
  joinUrl: String,
  // The server refuses to hand out joinUrl before this window — a real access
  // control, not a hidden button.
  joinUnlockMinutesBefore: { type: Number, default: 15 },
  dialIn:       String,
  locationNote: String,

  outcome: String,

  prepChecklist: [{ label: String, done: { type: Boolean, default: false } }],
  resources:     [{ label: String, meta: String, url: String }],

  // Recruiting's open request for the candidate's times. Slots are generated
  // from this template per date rather than stored one document per slot.
  availabilityRequest: {
    open:            { type: Boolean, default: false },
    dueAt:           Date,
    windowStart:     Date,
    windowEnd:       Date,
    timezone:        String,
    note:            String,
    localStarts:     [String],   // 'HH:mm' in the request's timezone
    durationMinutes: { type: Number, default: 60 },
    takenStarts:     [Date],     // UTC instants already booked
    submittedAt:     Date,
    submittedSlots:  [{ startsAt: Date, endsAt: Date }]
  },

  rescheduleRequest: {
    requestedAt: Date,
    reason:      String,
    slots: [{ startsAt: Date, endsAt: Date }]
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

interviewSchema.index({ user: 1, slug: 1 }, { unique: true });
export const Interview = model('Interview', interviewSchema);
