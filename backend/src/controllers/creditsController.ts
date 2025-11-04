import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { CreditLedger } from '../models/CreditLedger';
import { Redemption } from '../models/Redemption';

const RedeemSchema = z.object({ amount: z.number().min(1), item: z.string().min(1) });

export async function redeemCredits(req: AuthedRequest, res: Response) {
  try {
    const { amount, item } = RedeemSchema.parse(req.body);
    const userId = req.userId!;
    const session = await mongoose.startSession();
    
    let errorResult: { status: number; message: string } | null = null;
    
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        errorResult = { status: 404, message: 'User not found' };
        return;
      }
      if (user.credits < amount) {
        errorResult = { status: 400, message: 'Insufficient credits' };
        return;
      }
      await User.updateOne({ _id: userId }, { $inc: { credits: -amount } }).session(session);
      await Redemption.create([{ userId, amount, item }], { session });
      await CreditLedger.create([{ userId, delta: -amount, reason: 'signup_referral' }], { session });
    });
    
    session.endSession();
    
    if (errorResult) {
      return res.status(errorResult.status).json({ error: errorResult.message });
    }
    
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors });
    return res.status(500).json({ error: 'Redemption failed' });
  }
}

export async function creditHistory(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const history = await CreditLedger.find({ userId }).sort({ createdAt: -1 }).limit(100);
  res.json({ history });
}

export async function activityFeed(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const history = await CreditLedger.find({ $or: [{ userId }, { counterpartUserId: userId }] })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('counterpartUserId', 'email');
  const items = history.map((h) => {
    if (h.delta > 0 && h.reason === 'first_purchase_referral') {
      return `You earned ${h.delta} credits from ${(h as any).counterpartUserId?.email || 'a referral'}`;
    }
    if (h.delta < 0) return `You redeemed ${-h.delta} credits`;
    return `Activity recorded`;
  });
  res.json({ feed: items });
}


