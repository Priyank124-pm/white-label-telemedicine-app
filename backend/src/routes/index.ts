import { Router } from 'express';
import authRoutes         from './auth.routes';
import adminRoutes        from './admin.routes';
import doctorRoutes       from './doctor.routes';
import patientRoutes      from './patient.routes';
import appointmentRoutes  from './appointment.routes';
import prescriptionRoutes from './prescription.routes';
import medicineRoutes     from './medicine.routes';
import reportRoutes       from './report.routes';
import referralRoutes     from './referral.routes';
import pharmacyRoutes     from './pharmacy.routes';

const router = Router();

router.use('/auth',          authRoutes);
router.use('/admin',         adminRoutes);
router.use('/doctors',       doctorRoutes);
router.use('/patients',      patientRoutes);
router.use('/appointments',  appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/medicines',     medicineRoutes);
router.use('/reports',       reportRoutes);
router.use('/referrals',     referralRoutes);
router.use('/pharmacy',      pharmacyRoutes);

export default router;
