/**
 * Parcel routes — unified parcel module
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  addParcel,
  getMyParcels,
  getAllParcels,
  getStats,
  getParcel,
  updateParcel,
  notifyParcel,
  collectParcel,
} from '../controllers/parcelController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/stats', authorize('guard', 'admin'), getStats);
router.get('/mine', authorize('resident'), getMyParcels);
router.get('/', authorize('guard', 'admin'), getAllParcels);

router.post(
  '/',
  authorize('guard'),
  [
    body('residentId').notEmpty().withMessage('Resident is required'),
    body('courier').optional().trim(),
    body('trackingId').optional().trim(),
    body('description').optional().trim(),
  ],
  validate,
  addParcel
);

router.patch('/:id/collect', authorize('resident'), collectParcel);

router.get('/:id', authorize('guard', 'admin', 'resident'), getParcel);

router.patch(
  '/:id/notify',
  authorize('guard'),
  notifyParcel
);

router.patch(
  '/:id',
  authorize('guard', 'admin'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  updateParcel
);

export default router;
