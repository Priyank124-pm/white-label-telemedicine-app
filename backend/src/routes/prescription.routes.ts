import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
} from '../controllers/prescription.controller';

const router = Router();

router.use(authenticate);

router.post('/', authorize('doctor'), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.put('/:id', authorize('doctor'), updatePrescription);

export default router;
