/**
 * Guard routes — only role: guard
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDashboard,
  getResidents,
  addVisitor,
  getVisitors,
  getVisitorById,
  verifyQr,
  checkInVisitorHandler,
  checkOutVisitorHandler,
  regenerateQr,
} from '../controllers/guardController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect, authorize('guard'));

router.get('/dashboard', getDashboard);
router.get('/residents', getResidents);

router.get('/visitors', getVisitors);
router.post(
  '/visitors',
  [
    body('name').trim().notEmpty().withMessage('Visitor name is required'),
    body('phone').trim().notEmpty().withMessage('Visitor phone is required'),
    body('residentId').notEmpty().withMessage('Resident is required'),
    body('purpose').optional().trim(),
    body('expectedDate').optional().isISO8601(),
  ],
  validate,
  addVisitor
);

router.post(
  '/visitors/verify',
  [body('qrData').optional().trim(), body('visitorId').optional(), body('qrToken').optional()],
  verifyQr
);

router.get('/visitors/:id', getVisitorById);
router.patch('/visitors/:id/check-in', checkInVisitorHandler);
router.patch('/visitors/:id/check-out', checkOutVisitorHandler);
router.post('/visitors/:id/regenerate-qr', regenerateQr);
router.post('/visitors/:id/regenerate', regenerateQr);

export default router;
