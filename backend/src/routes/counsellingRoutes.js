import express from 'express';
import {
  addCounsellingSession,
  getStudentSessions,
  updateSessionStatus
} from '../controllers/counsellingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('ADMIN', 'FACULTY'), addCounsellingSession);
router.get('/student/:studentId', getStudentSessions);
router.put('/:id', authorize('ADMIN', 'FACULTY'), updateSessionStatus);

export default router;
