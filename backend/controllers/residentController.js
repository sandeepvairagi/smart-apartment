/**
 * Resident Controller — dashboard + resident-facing resources
 */
import Visitor from '../models/Visitor.js';
import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import Parcel from '../models/Parcel.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createNotification } from '../services/notificationService.js';

/**
 * @desc    Resident dashboard stats
 * @route   GET /api/resident/dashboard
 * @access  Private (resident)
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const residentId = req.user._id;

  const [visitorCount, openComplaints, parcelCount, unreadNotifications, recentNotices] =
    await Promise.all([
      Visitor.countDocuments({ resident: residentId }),
      Complaint.countDocuments({
        resident: residentId,
        status: { $in: ['open', 'in-progress'] },
      }),
      Parcel.countDocuments({
        resident: residentId,
        status: { $in: ['received', 'notified'] },
      }),
      Notification.countDocuments({ user: residentId, isRead: false }),
      Notice.find({ isPublished: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(3)
        .select('title priority publishedAt createdAt'),
    ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        visitors: visitorCount,
        openComplaints,
        pendingParcels: parcelCount,
        unreadNotifications,
      },
      recentNotices,
    },
  });
});

/**
 * @desc    List visitors for this resident
 * @route   GET /api/resident/visitors
 * @access  Private (resident)
 */
export const getMyVisitors = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = { resident: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Visitor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Visitor.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/**
 * @desc    Notification center
 * @route   GET /api/resident/notifications
 * @access  Private (resident)
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      unread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/**
 * @desc    Mark one notification as read
 * @route   PATCH /api/resident/notifications/:id/read
 * @access  Private (resident)
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/resident/notifications/read-all
 * @access  Private (resident)
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
