import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  assignFaculty,
  transferStudentClass
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('ADMIN', 'FACULTY'), createStudent);
router.put('/:id', authorize('ADMIN', 'FACULTY'), updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent);
router.post('/assign-faculty', authorize('ADMIN'), assignFaculty);
router.post('/transfer', authorize('ADMIN'), transferStudentClass);

export default router;
