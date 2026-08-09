import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('ADMIN'), createDepartment);
router.put('/:id', authorize('ADMIN'), updateDepartment);
router.delete('/:id', authorize('ADMIN'), deleteDepartment);

export default router;
