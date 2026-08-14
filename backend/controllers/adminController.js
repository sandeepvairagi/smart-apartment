/**
 * Admin Controller — building management, users, notices, complaints, analytics
 */
import User from '../models/User.js';
import Apartment from '../models/Apartment.js';
import Visitor from '../models/Visitor.js';
import Complaint from '../models/Complaint.js';
import Notice from '../models/Notice.js';
import Parcel from '../models/Parcel.js';
import asyncHandler from '../utils/asyncHandler.js';
import { formatUser } from '../utils/formatUser.js';

const paginate = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  return { page, limit, skip: (page - 1) * limit };
};

/**
 * @desc    Admin dashboard overview stats
 * @route   GET /api/admin/dashboard
 * @access  Private (admin)
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    residents,
    guards,
    apartments,
    occupied,
    openComplaints,
    visitorsToday,
    publishedNotices,
    pendingParcels,
    recentComplaints,
    recentVisitors,
  ] = await Promise.all([
    User.countDocuments({ role: 'resident' }),
    User.countDocuments({ role: 'guard' }),
    Apartment.countDocuments(),
    Apartment.countDocuments({ isOccupied: true }),
    Complaint.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
    Visitor.countDocuments({ createdAt: { $gte: startOfDay } }),
    Notice.countDocuments({ isPublished: true }),
    Parcel.countDocuments({ status: { $in: ['received', 'notified'] } }),
    Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resident', 'name unitLabel'),
    Visitor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resident', 'name unitLabel'),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        residents,
        guards,
        apartments,
        occupied,
        openComplaints,
        visitorsToday,
        publishedNotices,
        pendingParcels,
      },
      recentComplaints,
      recentVisitors,
    },
  });
});

/**
 * @desc    Analytics aggregates for charts / reports
 * @route   GET /api/admin/analytics
 * @access  Private (admin)
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const [complaintsByStatus, complaintsByCategory, visitorsByStatus, usersByRole] =
    await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Visitor.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

  // Last 7 days visitor counts
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const visitorsLast7Days = await Visitor.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      complaintsByStatus,
      complaintsByCategory,
      visitorsByStatus,
      usersByRole,
      visitorsLast7Days,
    },
  });
});

// -------------------- Users --------------------

/**
 * @desc    List users (optional role / search / active filter)
 * @route   GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};

  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive === 'true') filter.isActive = true;
  if (req.query.isActive === 'false') filter.isActive = false;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { unitLabel: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('apartment', 'block unitNumber floor type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: items.map(formatUser),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

/**
 * @desc    Create user (resident / guard / admin)
 * @route   POST /api/admin/users
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, unitLabel } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const safeRole = ['admin', 'guard', 'resident'].includes(role) ? role : 'resident';

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: safeRole,
    phone: phone?.trim() || '',
    unitLabel: unitLabel?.trim() || '',
  });

  res.status(201).json({
    success: true,
    message: `${safeRole} account created`,
    data: { user: formatUser(user) },
  });
});

/**
 * @desc    Update user (admin)
 * @route   PUT /api/admin/users/:id
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, unitLabel, role, isActive, password } = req.body;

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (unitLabel !== undefined) user.unitLabel = unitLabel.trim();
  if (role !== undefined && ['admin', 'guard', 'resident'].includes(role)) {
    // Prevent demoting the last admin accidentally is good practice
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        res.status(400);
        throw new Error('Cannot change role of the last active admin');
      }
    }
    user.role = role;
  }
  if (typeof isActive === 'boolean') {
    if (user.role === 'admin' && isActive === false) {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        res.status(400);
        throw new Error('Cannot deactivate the last active admin');
      }
    }
    user.isActive = isActive;
  }
  if (password) user.password = password;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated',
    data: { user: formatUser(user) },
  });
});

/**
 * @desc    Assign apartment to resident
 * @route   PATCH /api/admin/users/:id/assign-apartment
 */
export const assignApartment = asyncHandler(async (req, res) => {
  const { apartmentId } = req.body;
  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'resident') {
    res.status(400);
    throw new Error('Only residents can be assigned an apartment');
  }

  // Unassign previous apartment if any
  if (user.apartment) {
    await Apartment.findByIdAndUpdate(user.apartment, { isOccupied: false });
  }

  if (!apartmentId) {
    user.apartment = null;
    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Apartment unassigned',
      data: { user: formatUser(user) },
    });
  }

  const apartment = await Apartment.findById(apartmentId);
  if (!apartment) {
    res.status(404);
    throw new Error('Apartment not found');
  }

  // Free previous occupant of this unit if different resident
  const previous = await User.findOne({ apartment: apartmentId, _id: { $ne: user._id } });
  if (previous) {
    previous.apartment = null;
    await previous.save();
  }

  user.apartment = apartment._id;
  user.unitLabel = `${apartment.block}-${apartment.unitNumber}`;
  await user.save();

  apartment.isOccupied = true;
  await apartment.save();

  const populated = await User.findById(user._id).populate(
    'apartment',
    'block unitNumber floor type'
  );

  res.status(200).json({
    success: true,
    message: 'Apartment assigned',
    data: { user: formatUser(populated) },
  });
});

// -------------------- Apartments --------------------

/**
 * @route   GET /api/admin/apartments
 */
export const getApartments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};
  if (req.query.block) filter.block = req.query.block;
  if (req.query.isOccupied === 'true') filter.isOccupied = true;
  if (req.query.isOccupied === 'false') filter.isOccupied = false;
  if (req.query.search) {
    filter.$or = [
      { block: { $regex: req.query.search, $options: 'i' } },
      { unitNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Apartment.find(filter).sort({ block: 1, unitNumber: 1 }).skip(skip).limit(limit),
    Apartment.countDocuments(filter),
  ]);

  // Attach resident names
  const aptIds = items.map((a) => a._id);
  const residents = await User.find({
    apartment: { $in: aptIds },
    role: 'resident',
  }).select('name email apartment');

  const residentMap = {};
  residents.forEach((r) => {
    residentMap[String(r.apartment)] = { id: r._id, name: r.name, email: r.email };
  });

  const enriched = items.map((a) => ({
    ...a.toObject(),
    resident: residentMap[String(a._id)] || null,
  }));

  res.status(200).json({
    success: true,
    data: {
      items: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

/**
 * @route   POST /api/admin/apartments
 */
export const createApartment = asyncHandler(async (req, res) => {
  const { block, unitNumber, floor, type } = req.body;

  if (!block?.trim() || !unitNumber?.trim()) {
    res.status(400);
    throw new Error('Block and unit number are required');
  }

  const exists = await Apartment.findOne({
    block: block.trim(),
    unitNumber: unitNumber.trim(),
  });
  if (exists) {
    res.status(400);
    throw new Error('This apartment unit already exists');
  }

  const apartment = await Apartment.create({
    block: block.trim(),
    unitNumber: unitNumber.trim(),
    floor: floor ?? 1,
    type: type || '2BHK',
  });

  res.status(201).json({
    success: true,
    message: 'Apartment created',
    data: { apartment },
  });
});

/**
 * @route   PUT /api/admin/apartments/:id
 */
export const updateApartment = asyncHandler(async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) {
    res.status(404);
    throw new Error('Apartment not found');
  }

  const { block, unitNumber, floor, type } = req.body;
  if (block !== undefined) apartment.block = block.trim();
  if (unitNumber !== undefined) apartment.unitNumber = unitNumber.trim();
  if (floor !== undefined) apartment.floor = floor;
  if (type !== undefined) apartment.type = type;

  await apartment.save();

  res.status(200).json({
    success: true,
    message: 'Apartment updated',
    data: { apartment },
  });
});

/**
 * @route   DELETE /api/admin/apartments/:id
 */
export const deleteApartment = asyncHandler(async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) {
    res.status(404);
    throw new Error('Apartment not found');
  }

  await User.updateMany({ apartment: apartment._id }, { $set: { apartment: null } });
  await apartment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Apartment deleted',
  });
});
