/**
 * Auth routes — maps URLs to controller functions
 */
import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} from '../middleware/authValidation.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (public → resident only)
 * @access  Public
 */
router.post('/register', registerRules, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login and receive JWT
 * @access  Public
 */
router.post('/login', loginRules, validate, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client should discard JWT)
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);

/**
 * @route   PUT /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.put('/reset-password/:token', resetPasswordRules, validate, resetPassword);

export default router;
