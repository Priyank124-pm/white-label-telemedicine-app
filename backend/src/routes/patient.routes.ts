import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientDashboard,
  getPatientHistory,
} from '../controllers/patient.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize('patient'), getPatientDashboard);
router.get('/profile', authorize('patient'), getPatientProfile);
router.get('/profile/:userId', authorize('super_admin', 'doctor'), getPatientProfile);
router.put('/profile', authorize('patient'), updatePatientProfile);
router.get('/history', authorize('patient'), getPatientHistory);
router.get('/history/:userId', authorize('super_admin', 'doctor'), getPatientHistory);

export default router;
