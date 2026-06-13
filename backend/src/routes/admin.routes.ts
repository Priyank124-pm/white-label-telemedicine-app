import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  getTenants, createTenant, updateTenant, deleteTenant, toggleTenantStatus,
  getDoctors, createDoctor,
  getPatients,
  getPharmacies, createPharmacy,
  getAnalytics,
  toggleUserStatus,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('super_admin'));

// Tenants / Clinics
router.get('/tenants',              getTenants);
router.post('/tenants',             createTenant);
router.put('/tenants/:id',          updateTenant);
router.patch('/tenants/:id/toggle', toggleTenantStatus);
router.delete('/tenants/:id',       deleteTenant);

// Doctors
router.get('/doctors',  getDoctors);
router.post('/doctors', createDoctor);

// Patients
router.get('/patients', getPatients);

// Pharmacies
router.get('/pharmacies',  getPharmacies);
router.post('/pharmacies', createPharmacy);

// Analytics
router.get('/analytics', getAnalytics);

// User status toggle
router.patch('/users/:id/toggle-status', toggleUserStatus);

export default router;
