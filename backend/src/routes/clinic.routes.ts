import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  getClinicDashboard,
  getClinicDoctors, createClinicDoctor, updateClinicDoctor, deleteClinicDoctor,
  getClinicPharmacies, createClinicPharmacy, deleteClinicPharmacy,
  getClinicPatients,
} from '../controllers/clinic.controller';

const router = Router();

router.use(authenticate, authorize('clinic_admin'));

router.get('/dashboard',       getClinicDashboard);

router.get('/doctors',         getClinicDoctors);
router.post('/doctors',        createClinicDoctor);
router.put('/doctors/:id',     updateClinicDoctor);
router.delete('/doctors/:id',  deleteClinicDoctor);

router.get('/pharmacies',      getClinicPharmacies);
router.post('/pharmacies',     createClinicPharmacy);
router.delete('/pharmacies/:id', deleteClinicPharmacy);

router.get('/patients',        getClinicPatients);

export default router;
