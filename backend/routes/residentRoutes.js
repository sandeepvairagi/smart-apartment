/**
 * Resident routes — only role: resident
 */
import { Router } from 'express';
import {
  getDashboard,
  getMyVisitors,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/residentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('resident'));

router.get('/dashboard', getDashboard);
router.get('/visitors', getMyVisitors);
router.get('/notifications', getMyNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
