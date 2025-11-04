import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICreditLedger extends Document {
  userId: Types.ObjectId;
  delta: number;
  reason: 'signup_referral' | 'first_purchase_referral';
  counterpartUserId?: Types.ObjectId;
  purchaseId?: Types.ObjectId;
}

const CreditLedgerSchema = new Schema<ICreditLedger>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    delta: { type: Number, required: true },
    reason: { type: String, enum: ['signup_referral', 'first_purchase_referral'], required: true },
    counterpartUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase' },
  },
  { timestamps: true }
);

export const CreditLedger = mongoose.model<ICreditLedger>('CreditLedger', CreditLedgerSchema);


