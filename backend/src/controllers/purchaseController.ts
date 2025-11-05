import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import { PurchaseSchema } from '../validation/schemas';
import { Purchase } from '../models/Purchase';
import { Referral } from '../models/Referral';
import { User } from '../models/User';
import { CreditLedger } from '../models/CreditLedger';

const REWARD_CREDITS = 2;

export async function simulatePurchase(req: AuthedRequest, res: Response) {
  try {
    const { amount } = PurchaseSchema.parse(req.body);
    const userId = req.userId!;
    const session = await mongoose.startSession();
    let createdPurchaseId: string | null = null;

    console.log(`🛒 Purchase initiated by user: ${userId}`);

    await session.withTransaction(async () => {
      const prior = await Purchase.findOne({ userId }).session(session);
      const isFirst = !prior;
      const purchase = await Purchase.create([{ userId, amount, isFirst }], { session });
      createdPurchaseId = purchase[0]._id.toString();

      console.log(`Purchase created: ${createdPurchaseId}, isFirst: ${isFirst}`);

      if (!isFirst) {
        console.log(`Not first purchase, no credits awarded`);
        return;
      }

      const referral = await Referral.findOne({ referredUserId: userId }).session(session);
      if (!referral) {
        console.log(`No referral found for user: ${userId}`);
        return;
      }
      if (referral.expiryDate && referral.expiryDate < new Date()) {
        console.log(` Referral expired for user: ${userId}`);
        return;
      }
      if (referral.credited) {
        console.log(` Referral already credited for user: ${userId}`);
        return;
      }

      const referredUser = await User.findById(userId).session(session);
      const referrer = await User.findById(referral.referrerId).session(session);
      
      console.log(`Awarding credits:`);
      console.log(`   Referred User: ${referredUser?.email} (${referredUser?._id})`);
      console.log(`   Referrer: ${referrer?.email} (${referrer?._id})`);
      console.log(`   Referral Code: ${referral.referralCode}`);
      if (!referredUser || !referrer) return;

      await Promise.all([
        User.updateOne({ _id: referredUser._id }, { $inc: { credits: REWARD_CREDITS } }).session(session),
        User.updateOne({ _id: referrer._id }, { $inc: { credits: REWARD_CREDITS } }).session(session),
        CreditLedger.create([
          { userId: referredUser._id, delta: REWARD_CREDITS, reason: 'first_purchase_referral', counterpartUserId: referrer._id, purchaseId: purchase[0]._id },
        ], { session }),
        CreditLedger.create([
          { userId: referrer._id, delta: REWARD_CREDITS, reason: 'first_purchase_referral', counterpartUserId: referredUser._id, purchaseId: purchase[0]._id },
        ], { session }),
        Referral.updateOne({ _id: referral._id }, { $set: { status: 'converted', credited: true } }).session(session),
      ]);

      const referrersRef = await Referral.findOne({ referredUserId: referrer._id }).session(session);
      if (referrersRef && !referral.level2Credited) {
        const grandReferrer = await User.findById(referrersRef.referrerId).session(session);
        if (grandReferrer) {
          await Promise.all([
            User.updateOne({ _id: grandReferrer._id }, { $inc: { credits: 1 } }).session(session),
            CreditLedger.create([
              { userId: grandReferrer._id, delta: 1, reason: 'first_purchase_referral', counterpartUserId: referredUser._id, purchaseId: purchase[0]._id },
            ], { session }),
            Referral.updateOne({ _id: referral._id }, { $set: { level2Credited: true } }).session(session),
          ]);
        }
      }
    });

    session.endSession();
    return res.status(201).json({ ok: true, purchaseId: createdPurchaseId });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Purchase failed' });
  }
}


