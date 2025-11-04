import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { me, dashboardStats } from '../controllers/userController';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', requireAuth, me);

/**
 * @swagger
 * /users/dashboard:
 *   get:
 *     summary: Get user dashboard statistics
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard', requireAuth, dashboardStats);

export default router;


