import { Response } from 'express';
import { AuthedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { Purchase } from '../models/Purchase';

export async function me(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user._id, email: user.email, referralCode: user.referralCode, credits: user.credits } });
}

export async function dashboardStats(req: AuthedRequest, res: Response) {
  const userId = req.userId!;
  const referrals = await Referral.find({ referrerId: userId }).select('referredUserId status');
  const totalReferred = referrals.length;
  const convertedCount = referrals.filter((r) => r.status === 'converted').length;
  const user = await User.findById(userId);
  res.json({
    stats: {
      totalReferred,
      convertedCount,
      totalCredits: user?.credits ?? 0,
      referralLink: `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/signup?ref=${user?.referralCode}`,
    },
  });
}


