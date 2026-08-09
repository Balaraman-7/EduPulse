import express from 'express';
import {
  addAttendanceRecord,
  addAcademicRecord,
  addOrUpdateBacklog,
  getStudentAcademicHistory
} from '../controllers/academicDataController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/attendance', authorize('ADMIN', 'FACULTY'), addAttendanceRecord);
router.post('/academics', authorize('ADMIN', 'FACULTY'), addAcademicRecord);
router.post('/backlogs', authorize('ADMIN', 'FACULTY'), addOrUpdateBacklog);
router.get('/student/:studentId', getStudentAcademicHistory);

export default router;
