import express from 'express';
import { getSubscriptions, updatePlan } from './billing.controller.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';
import { requireRole } from '../../core/middlewares/role.middleware.js';

const router = express.Router();

router.get('/subscriptions', requireAuth, requireRole(['SUPERADMIN']), getSubscriptions);
router.post('/subscriptions/plan', requireAuth, requireRole(['SUPERADMIN']), updatePlan);

export default router;
