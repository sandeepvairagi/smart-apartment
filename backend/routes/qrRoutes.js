/**
 * QR routes — unified QR module
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  verifyQr,
  scanQr,
  getStats,
  getPass,
  regeneratePass,
} from '../controllers/qrController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

/**
 * @route   POST /api/qr/verify
 * @access  Public (optional auth)
 */
router.post(
  '/verify',
  [
    body('qrData').optional().trim(),
    body('visitorId').optional(),
    body('qrToken').optional(),
  ],
  validate,
  verifyQr
);

/**
 * @route   GET /api/qr/stats
 * @access  Guard
 */
router.get('/stats', protect, authorize('guard'), getStats);

/**
 * @route   POST /api/qr/scan
 * @access  Guard
 */
router.post(
  '/scan',
  protect,
  authorize('guard'),
  [
    body('qrData').optional().trim(),
    body('visitorId').optional(),
    body('qrToken').optional(),
  ],
  validate,
  scanQr
);

/**
 * @route   GET /api/qr/:visitorId
 * @access  Guard / Resident (own) / Public with phone
 */
router.get(
  '/:visitorId',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return protect(req, res, next);
    }
    next();
  },
  getPass
);

/**
 * @route   POST /api/qr/:visitorId/regenerate
 * @access  Guard / Resident
 */
router.post(
  '/:visitorId/regenerate',
  protect,
  authorize('guard', 'resident'),
  regeneratePass
);

export default router;
