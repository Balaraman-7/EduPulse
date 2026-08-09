import express from 'express';
import { getFacultyList, createFaculty, getMyAssignedStudents } from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN'), getFacultyList);
router.post('/', authorize('ADMIN'), createFaculty);
router.get('/assigned-students', authorize('FACULTY'), getMyAssignedStudents);

export default router;
