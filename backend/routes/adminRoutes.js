/**
 * Admin routes — only role: admin
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDashboard,
  getAnalytics,
  getUsers,
  createUser,
  updateUser,
  assignApartment,
  getApartments,
  createApartment,
  updateApartment,
  deleteApartment,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.post(
  '/users',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['admin', 'guard', 'resident']),
  ],
  validate,
  createUser
);
router.put('/users/:id', updateUser);
router.patch('/users/:id/assign-apartment', assignApartment);

// Apartments
router.get('/apartments', getApartments);
router.post(
  '/apartments',
  [
    body('block').trim().notEmpty().withMessage('Block is required'),
    body('unitNumber').trim().notEmpty().withMessage('Unit number is required'),
  ],
  validate,
  createApartment
);
router.put('/apartments/:id', updateApartment);
router.delete('/apartments/:id', deleteApartment);

export default router;
