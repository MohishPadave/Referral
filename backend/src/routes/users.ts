import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { me, dashboardStats } from '../controllers/userController';
const router = Router();
router.get('/me', requireAuth, me);
router.get('/dashboard', requireAuth, dashboardStats);

export default router;


