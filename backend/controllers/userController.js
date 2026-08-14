/**
 * User Controller — profile management
 */
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { formatUser } from '../utils/formatUser.js';

/**
 * @desc    Update logged-in user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, unitLabel } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (unitLabel !== undefined) user.unitLabel = unitLabel;

  // Residents cannot change email/role here (security)
  const updated = await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: formatUser(updated) },
  });
});

/**
 * @desc    Get logged-in user profile (alias of auth/me shape)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'apartment',
    'block unitNumber floor type'
  );

  res.status(200).json({
    success: true,
    data: { user: formatUser(user) },
  });
});
