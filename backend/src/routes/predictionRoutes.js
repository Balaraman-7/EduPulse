import express from 'express';
import { runPrediction, getStudentPredictions, getHighRiskStudents } from '../controllers/predictionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('ADMIN', 'FACULTY'), runPrediction);
router.get('/high-risk', authorize('ADMIN', 'FACULTY'), getHighRiskStudents);
router.get('/:studentId', getStudentPredictions);

export default router;
