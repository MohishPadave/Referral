import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { simulatePurchase } from '../controllers/purchaseController';

const router = Router();

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Simulate a purchase
 *     tags: [Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 example: 10
 *                 description: Purchase amount
 *     responses:
 *       201:
 *         description: Purchase completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 purchaseId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Invalid purchase amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAuth, simulatePurchase);

export default router;


