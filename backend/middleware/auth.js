/**
 * Authentication & Authorization middleware
 *
 * protect  — verifies JWT, attaches user to req.user
 * authorize — allows only specific roles (RBAC)
 */
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Protect routes — must be logged in
 * Expects header: Authorization: Bearer <token>
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized — user not found');
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Not authorized — invalid or expired token');
    }
    throw error;
  }
});

/**
 * Role-Based Access Control
 * Usage: authorize('admin', 'guard')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Role '${req.user?.role}' is not allowed to access this resource`
        )
      );
    }
    next();
  };
};
