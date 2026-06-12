import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { createReferral, getReferrals, updateReferralStatus } from '../controllers/referral.controller';

const router = Router();

router.use(authenticate);

router.post('/', authorize('doctor'), createReferral);
router.get('/', getReferrals);
router.patch('/:id/status', authorize('doctor'), updateReferralStatus);

export default router;
