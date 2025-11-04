import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  userId: Types.ObjectId;
  amount: number;
  isFirst: boolean;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    isFirst: { type: Boolean, required: true, default: false, index: true },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);


