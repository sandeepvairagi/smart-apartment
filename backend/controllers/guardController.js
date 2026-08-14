/**
 * Guard Controller — visitor entry, QR, check-in/out, history
 * Delegates core logic to visitorService.
 */
import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createVisitorWithQr,
  verifyVisitorQr,
  checkInVisitor,
  checkOutVisitor,
  regenerateVisitorQr,
  populateVisitor,
} from '../services/visitorService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) {
    res.status(error.statusCode);
  }
  throw error;
};

export const getDashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayTotal, checkedIn, pending, checkedOutToday] = await Promise.all([
    Visitor.countDocuments({ createdAt: { $gte: startOfDay } }),
    Visitor.countDocuments({ status: 'checked-in' }),
    Visitor.countDocuments({ status: 'pending' }),
    Visitor.countDocuments({
      status: 'checked-out',
      checkOutAt: { $gte: startOfDay },
    }),
  ]);

  const recent = await Visitor.find({ createdAt: { $gte: startOfDay } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('resident', 'name unitLabel');

  res.status(200).json({
    success: true,
    data: {
      stats: { todayTotal, checkedIn, pending, checkedOutToday },
      recent,
    },
  });
});

export const getResidents = asyncHandler(async (req, res) => {
  const filter = { role: 'resident', isActive: true };
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { unitLabel: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const residents = await User.find(filter)
    .select('name email phone unitLabel apartment')
    .sort({ name: 1 })
    .limit(50);

  res.status(200).json({ success: true, data: { residents } });
});

export const addVisitor = asyncHandler(async (req, res) => {
  const { name, phone, purpose, residentId, expectedDate } = req.body;

  if (!name?.trim() || !phone?.trim() || !residentId) {
    res.status(400);
    throw new Error('Name, phone, and resident are required');
  }

  try {
    const { visitor, qrPayload } = await createVisitorWithQr({
      name,
      phone,
      purpose,
      residentId,
      expectedDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Visitor registered and QR generated',
      data: { visitor, qrPayload },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

export const getVisitors = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Visitor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(populateVisitor),
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

export const getVisitorById = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id).populate(populateVisitor);

  if (!visitor) {
    res.status(404);
    throw new Error('Visitor not found');
  }

  res.status(200).json({ success: true, data: { visitor } });
});

export const verifyQr = asyncHandler(async (req, res) => {
  try {
    const visitor = await verifyVisitorQr(req.body);

    res.status(200).json({
      success: true,
      message: 'QR verified successfully',
      data: { visitor, valid: true },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

export const checkInVisitorHandler = asyncHandler(async (req, res) => {
  try {
    const visitor = await checkInVisitor(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Visitor checked in',
      data: { visitor },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

export const checkOutVisitorHandler = asyncHandler(async (req, res) => {
  try {
    const visitor = await checkOutVisitor(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Visitor checked out',
      data: { visitor },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

export const regenerateQr = asyncHandler(async (req, res) => {
  try {
    const { visitor, qrPayload } = await regenerateVisitorQr(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'QR regenerated',
      data: { visitor, qrPayload },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});
