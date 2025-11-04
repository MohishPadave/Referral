import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMyReferrals, leaderboard } from '../controllers/referralController';

const router = Router();
router.get('/', requireAuth, getMyReferrals);
router.get('/leaderboard', leaderboard);

export default router;


