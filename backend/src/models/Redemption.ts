import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRedemption extends Document {
  userId: Types.ObjectId;
  amount: number;
  item: string; // description or SKU
}

const RedemptionSchema = new Schema<IRedemption>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  item: { type: String, required: true },
}, { timestamps: true });

export const Redemption = mongoose.model<IRedemption>('Redemption', RedemptionSchema);


