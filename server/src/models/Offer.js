import { Schema, model } from 'mongoose';

const offerSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },

  stage: { type: String, enum: ['review', 'accepted', 'declined', 'expired'], default: 'review' },

  title:          String,
  team:           String,
  employmentType: String,
  location:       String,
  reportsTo:      String,
  contingencies:  [String],

  extendedAt:  Date,
  respondByAt: Date,     // powers the "Respond by" panel

  startDate: {
    proposedByCompany:   Date,
    proposedByCandidate: Date,
    confirmed:           Date
  },
  // Bounds for the counter-proposal date input. Mondays only.
  startDateWindow: { min: String, max: String },

  letter: { name: String, sizeBytes: Number, storageKey: String },

  signature: {
    typedName: String,
    agreedAt:  Date,
    ip:        String
  },
  declineReason: String
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export const Offer = model('Offer', offerSchema);
