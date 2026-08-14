/**
 * Visitor routes — public portal + resident pre-registration
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerVisitor,
  residentPreRegister,
  getResidentsForRegistration,
  verifyQrPublic,
  getStatus,
  getHistory,
} from '../controllers/visitorController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

/**
 * @route   POST /api/visitor/register
 * @desc    Public visitor self-registration
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('residentId').notEmpty().withMessage('Resident is required'),
  ],
  validate,
  registerVisitor
);

/**
 * @route   GET /api/visitor/residents
 * @desc    Search residents (public, limited info)
 */
router.get('/residents', getResidentsForRegistration);

/**
 * @route   POST /api/visitor/verify
 * @desc    Verify QR (public)
 */
router.post('/verify', verifyQrPublic);

/**
 * @route   GET /api/visitor/status/:id
 * @desc    Visitor status by ID + phone
 */
router.get('/status/:id', getStatus);

/**
 * @route   GET /api/visitor/history
 * @desc    Visit history by phone
 */
router.get('/history', getHistory);

/**
 * @route   POST /api/visitor/resident/pre-register
 * @desc    Resident pre-registers expected guest
 */
router.post(
  '/resident/pre-register',
  protect,
  authorize('resident'),
  [
    body('name').trim().notEmpty().withMessage('Guest name is required'),
    body('phone').trim().notEmpty().withMessage('Guest phone is required'),
  ],
  validate,
  residentPreRegister
);

export default router;
