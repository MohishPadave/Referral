import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { redeemCredits, creditHistory, activityFeed } from '../controllers/creditsController';

const router = Router();
router.post('/redeem', requireAuth, redeemCredits);
router.get('/history', requireAuth, creditHistory);
router.get('/activity', requireAuth, activityFeed);

export default router;


