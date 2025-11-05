import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { simulatePurchase } from '../controllers/purchaseController';
const router = Router();
router.post('/', requireAuth, simulatePurchase);

export default router;


