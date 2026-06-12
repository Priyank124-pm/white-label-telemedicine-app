import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import {
  searchPatients,
  getPharmacyDashboard,
  getActivePrescriptions,
  dispensePrescription,
  getInvoices,
  getInvoiceById,
} from '../controllers/pharmacy.controller';

const router = Router();

router.use(authenticate, authorize('pharmacy', 'super_admin'));

router.get('/dashboard', authorize('pharmacy'), getPharmacyDashboard);
router.get('/patients/search', searchPatients);
router.get('/prescriptions', getActivePrescriptions);
router.post('/dispense', authorize('pharmacy'), dispensePrescription);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);

export default router;
