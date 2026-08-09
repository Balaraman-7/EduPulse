import express from 'express';
import { getSystemOverviewAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', authorize('ADMIN', 'FACULTY'), getSystemOverviewAnalytics);

export default router;
