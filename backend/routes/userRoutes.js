/**
 * User routes
 */
import { Router } from 'express';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const profileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('unitLabel').optional().trim().isLength({ max: 30 }),
];

router.use(protect);

/**
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put('/profile', profileRules, validate, updateProfile);

export default router;
