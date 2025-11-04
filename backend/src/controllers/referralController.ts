import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthedRequest } from '../middleware/auth';
import { Referral } from '../models/Referral';
import { User } from '../models/User';

export async function getMyReferrals(req: AuthedRequest, res: Response) {
  const refs = await Referral.find({ referrerId: req.userId }).populate('referredUserId', 'email');
  res.json({ referrals: refs });
}

export async function acceptReferralOnSignup(referralCode: string, referredUserId: string, session: mongoose.ClientSession) {
  const referrer = await User.findOne({ referralCode }).session(session);
  if (!referrer) return;
  const existing = await Referral.findOne({ referrerId: referrer._id, referredUserId }).session(session);
  if (!existing) {
    await Referral.create([{ referrerId: referrer._id, referredUserId, referralCode, status: 'pending', credited: false }], { session });
  }
}

export async function leaderboard(_req: Request, res: Response) {
  const top = await User.find().sort({ credits: -1 }).limit(10).select('email credits referralCode');
  res.json({ leaderboard: top });
}


