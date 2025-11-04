import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { Purchase } from '../models/Purchase';
import { CreditLedger } from '../models/CreditLedger';
import { AuthedRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

async function debugUserData(req: AuthedRequest, res: Response) {
  try {
    const userId = req.userId!;
    
    // Get current user
    const currentUser = await User.findById(userId);
    
    // Get all users (for debugging)
    const allUsers = await User.find({}).select('email referralCode credits').sort({ createdAt: -1 });
    
    // Get ALL referrals (for debugging)
    const allReferrals = await Referral.find({})
      .populate('referrerId', 'email referralCode')
      .populate('referredUserId', 'email referralCode')
      .sort({ createdAt: -1 });
    
    // Get referrals where this user is the referrer
    const myReferrals = await Referral.find({ referrerId: userId }).populate('referredUserId', 'email');
    
    // Get referral where this user was referred
    const myReferral = await Referral.findOne({ referredUserId: userId }).populate('referrerId', 'email');
    
    // Get purchases by this user
    const myPurchases = await Purchase.find({ userId });
    
    // Get ALL purchases (for debugging)
    const allPurchases = await Purchase.find({}).populate('userId', 'email').sort({ createdAt: -1 });
    
    // Get credit ledger for this user
    const myCreditHistory = await CreditLedger.find({ userId }).populate('counterpartUserId', 'email');
    
    // Get ALL credit history (for debugging)
    const allCreditHistory = await CreditLedger.find({})
      .populate('userId', 'email')
      .populate('counterpartUserId', 'email')
      .sort({ createdAt: -1 });
    
    res.json({
      currentUser: {
        id: currentUser?._id,
        email: currentUser?.email,
        referralCode: currentUser?.referralCode,
        credits: currentUser?.credits
      },
      allUsers,
      allReferrals,
      allPurchases,
      allCreditHistory,
      myReferrals,
      myReferral,
      myPurchases,
      myCreditHistory
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
}

router.get('/user-data', requireAuth, debugUserData);

export default router;