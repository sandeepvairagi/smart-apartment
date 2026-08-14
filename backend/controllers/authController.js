/**
 * Auth Controller (MVC — Controller)
 * Handles register, login, logout, profile, forgot & reset password.
 */
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/env.js';
import { formatUser } from '../utils/formatUser.js';
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // For security: only allow public self-registration as resident.
  // Admin/guard accounts should be created by an admin later.
  const safeRole = role === 'admin' || role === 'guard' ? 'resident' : role || 'resident';

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    phone,
  });

  // Welcome email (non-blocking if Ethereal/SMTP fails)
  sendWelcomeEmail({
    to: user.email,
    name: user.name,
    role: user.role,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: formatUser(user),
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false — must explicitly include it
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Contact admin.');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: formatUser(user),
      token,
    },
  });
});

/**
 * @desc    Logout user (stateless JWT — client discards token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove the token on the client.',
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: formatUser(req.user),
    },
  });
});

/**
 * @desc    Forgot password — generate reset token + email link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Same response whether user exists or not (avoid email enumeration)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

  const payload = {
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  };

  try {
    const mail = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    if (config.nodeEnv === 'development') {
      payload.devResetToken = resetToken;
      payload.devResetUrl = resetUrl;
      if (mail?.previewUrl) {
        payload.devPreviewUrl = mail.previewUrl;
      }
    }
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Forgot-password email failed:', error.message);
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }

  res.status(200).json(payload);
});

/**
 * @desc    Reset password using token from email/dev response
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});
