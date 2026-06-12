import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
  getAppointmentById,
} from '../controllers/appointment.controller';

const router = Router();

router.use(authenticate);

router.get('/slots', authorize('patient', 'doctor', 'super_admin'), getAvailableSlots);
router.post('/', authorize('patient', 'doctor', 'super_admin'), bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/status', authorize('doctor', 'patient', 'super_admin'), updateAppointmentStatus);

export default router;
