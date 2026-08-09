import express from 'express';
import {
  getStudentRecommendations,
  refreshRecommendations,
  chatWithAICounsellor
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/recommendations/:studentId', getStudentRecommendations);
router.post('/recommendations/refresh', refreshRecommendations);
router.post('/chat', chatWithAICounsellor);

export default router;
