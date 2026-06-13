import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { createReport, getReports, getReportById, deleteReport } from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.post('/', authorize('doctor'), createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.delete('/:id', authorize('doctor', 'super_admin'), deleteReport);

export default router;
