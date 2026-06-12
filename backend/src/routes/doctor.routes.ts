import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  listDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAvailability,
  setAvailability,
  addLeave,
  deleteLeave,
  getDoctorPatients,
  addPatient,
  getDoctorDashboard,
} from '../controllers/doctor.controller';

const router = Router();

router.use(authenticate);

router.get('/', authorize('patient', 'doctor', 'super_admin', 'pharmacy'), listDoctors);
router.get('/dashboard', authorize('doctor'), getDoctorDashboard);
router.get('/profile', authorize('doctor'), getDoctorProfile);
router.get('/profile/:userId', authorize('super_admin'), getDoctorProfile);
router.put('/profile', authorize('doctor'), updateDoctorProfile);

router.get('/availability', authorize('doctor', 'super_admin', 'patient'), getDoctorAvailability);
router.get('/availability/:userId', authorize('super_admin', 'patient', 'doctor'), getDoctorAvailability);
router.put('/availability', authorize('doctor'), setAvailability);

router.post('/leaves', authorize('doctor'), addLeave);
router.delete('/leaves/:id', authorize('doctor'), deleteLeave);

router.get('/patients', authorize('doctor'), getDoctorPatients);
router.post('/patients', authorize('doctor'), addPatient);

export default router;
