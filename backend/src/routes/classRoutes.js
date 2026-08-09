import express from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getClasses);
router.get('/:id', getClassById);
router.post('/', authorize('ADMIN'), createClass);
router.put('/:id', authorize('ADMIN', 'FACULTY'), updateClass);
router.delete('/:id', authorize('ADMIN'), deleteClass);

export default router;
