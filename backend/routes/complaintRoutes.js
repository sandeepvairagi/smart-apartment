/**
 * Complaint routes — unified complaint module
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  raiseComplaint,
  getMyComplaints,
  getAllComplaints,
  getStats,
  getComplaint,
  updateComplaint,
  resolveComplaintHandler,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

/**
 * @route   GET /api/complaints/stats
 * @access  Admin
 */
router.get('/stats', authorize('admin'), getStats);

/**
 * @route   GET /api/complaints/mine
 * @access  Resident
 */
router.get('/mine', authorize('resident'), getMyComplaints);

/**
 * @route   GET /api/complaints
 * @access  Admin
 */
router.get('/', authorize('admin'), getAllComplaints);

/**
 * @route   POST /api/complaints
 * @access  Resident
 */
router.post(
  '/',
  authorize('resident'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .optional()
      .isIn(['maintenance', 'noise', 'security', 'cleaning', 'parking', 'other']),
  ],
  validate,
  raiseComplaint
);

/**
 * @route   GET /api/complaints/:id
 * @access  Resident (own) / Admin
 */
router.get('/:id', authorize('admin', 'resident'), getComplaint);

/**
 * @route   PATCH /api/complaints/:id/resolve
 * @access  Admin
 */
router.patch(
  '/:id/resolve',
  authorize('admin'),
  [body('resolution').trim().notEmpty().withMessage('Resolution is required')],
  validate,
  resolveComplaintHandler
);

/**
 * @route   PATCH /api/complaints/:id
 * @access  Admin
 */
router.patch('/:id', authorize('admin'), updateComplaint);

export default router;
