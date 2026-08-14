/**
 * Shared helper — format a user object for API responses (no password).
 */
export const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  unitLabel: user.unitLabel || '',
  apartment: user.apartment || null,
  avatar: user.avatar || '',
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
});
