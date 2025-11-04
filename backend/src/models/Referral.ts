import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReferralStatus = 'pending' | 'converted';

export interface IReferral extends Document {
  referrerId: Types.ObjectId;
  referredUserId?: Types.ObjectId;
  referralCode: string;
  status: ReferralStatus;
  credited: boolean;
  expiryDate?: Date;
  level2Credited?: boolean;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referralCode: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'converted'], default: 'pending', index: true },
    credited: { type: Boolean, default: false, index: true },
    expiryDate: { type: Date },
    level2Credited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true, sparse: true });

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);


