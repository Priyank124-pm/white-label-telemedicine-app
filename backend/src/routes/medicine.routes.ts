import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineCategories,
} from '../controllers/medicine.controller';

const router = Router();

router.use(authenticate);

router.get('/categories', getMedicineCategories);
router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', authorize('super_admin'), createMedicine);
router.put('/:id', authorize('super_admin'), updateMedicine);
router.delete('/:id', authorize('super_admin'), deleteMedicine);

export default router;
