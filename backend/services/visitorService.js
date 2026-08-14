/**
 * Visitor Service — shared business logic for visitor lifecycle.
 * Used by Guard, Resident, and public Visitor module routes.
 */
import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';
import { sendVisitorRegisteredEmail } from './emailService.js';
import {
  buildQrPayload,
  generateQrDataUrl,
  generateQrToken,
} from './qrService.js';

export const populateVisitor = [
  { path: 'resident', select: 'name email phone unitLabel' },
  { path: 'createdBy', select: 'name role' },
];

/**
 * Create visitor record and generate QR pass.
 */
export const createVisitorWithQr = async ({
  name,
  phone,
  purpose,
  residentId,
  expectedDate,
  createdBy = null,
}) => {
  const resident = await User.findOne({ _id: residentId, role: 'resident', isActive: true });
  if (!resident) {
    const error = new Error('Resident not found');
    error.statusCode = 404;
    throw error;
  }

  const qrToken = generateQrToken();
  const visitor = await Visitor.create({
    name: name.trim(),
    phone: phone.trim(),
    purpose: purpose?.trim() || 'Personal visit',
    resident: resident._id,
    apartment: resident.apartment || null,
    expectedDate: expectedDate ? new Date(expectedDate) : new Date(),
    createdBy,
    qrToken,
    status: 'pending',
    qrIssuedAt: new Date(),
  });

  const qrPayload = buildQrPayload(visitor._id, qrToken);
  visitor.qrCode = await generateQrDataUrl(qrPayload);
  await visitor.save();

  await createNotification({
    userId: resident._id,
    title: 'Visitor registered',
    message: `${visitor.name} is scheduled to visit you.`,
    type: 'visitor',
    link: '/resident/visitors',
  });

  sendVisitorRegisteredEmail({
    to: resident.email,
    residentName: resident.name,
    visitorName: visitor.name,
    purpose: visitor.purpose,
    expectedDate: visitor.expectedDate,
  });

  const populated = await Visitor.findById(visitor._id).populate(populateVisitor);

  return { visitor: populated, qrPayload };
};

/**
 * Verify QR payload — delegates to qrPassService.
 */
export const verifyVisitorQr = async (payload) => {
  const { verifyQrPass } = await import('./qrPassService.js');
  return verifyQrPass(payload);
};

/**
 * Public status lookup — requires matching phone for privacy.
 */
export const getVisitorStatus = async (visitorId, phone) => {
  const visitor = await Visitor.findById(visitorId)
    .select('-qrToken')
    .populate('resident', 'name unitLabel');

  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }

  if (visitor.phone !== phone.trim()) {
    const error = new Error('Phone number does not match this visit');
    error.statusCode = 403;
    throw error;
  }

  return visitor;
};

/**
 * Visitor history by phone number.
 */
export const getVisitorHistoryByPhone = async (phone, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const filter = { phone: phone.trim() };

  const [items, total] = await Promise.all([
    Visitor.find(filter)
      .select('-qrToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('resident', 'name unitLabel'),
    Visitor.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const checkInVisitor = async (visitorId) => {
  const visitor = await Visitor.findById(visitorId).populate('resident', 'name');

  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }

  if (visitor.status === 'checked-in') {
    const error = new Error('Visitor is already checked in');
    error.statusCode = 400;
    throw error;
  }

  if (['checked-out', 'cancelled', 'expired'].includes(visitor.status)) {
    const error = new Error(`Cannot check in — status is ${visitor.status}`);
    error.statusCode = 400;
    throw error;
  }

  visitor.status = 'checked-in';
  visitor.checkInAt = new Date();
  await visitor.save();

  await createNotification({
    userId: visitor.resident._id,
    title: 'Visitor arrived',
    message: `${visitor.name} has checked in at the gate.`,
    type: 'visitor',
    link: '/resident/visitors',
  });

  return Visitor.findById(visitor._id).populate(populateVisitor);
};

export const checkOutVisitor = async (visitorId) => {
  const visitor = await Visitor.findById(visitorId);

  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }

  if (visitor.status !== 'checked-in') {
    const error = new Error('Visitor must be checked in before check-out');
    error.statusCode = 400;
    throw error;
  }

  visitor.status = 'checked-out';
  visitor.checkOutAt = new Date();
  await visitor.save();

  return Visitor.findById(visitor._id).populate(populateVisitor);
};

export const regenerateVisitorQr = async (visitorId, user = { role: 'guard' }) => {
  const { regenerateQrPass } = await import('./qrPassService.js');
  return regenerateQrPass(visitorId, user);
};

/** Public-safe resident list for visitor registration dropdown */
export const searchResidentsPublic = async (search = '') => {
  const filter = { role: 'resident', isActive: true };
  if (search.trim()) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { unitLabel: { $regex: search, $options: 'i' } },
    ];
  }

  return User.find(filter)
    .select('name unitLabel')
    .sort({ unitLabel: 1, name: 1 })
    .limit(30);
};
