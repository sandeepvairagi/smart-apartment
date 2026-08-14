/**
 * Parcel Service — shared business logic for parcel lifecycle.
 *
 * Flow: received → notified → delivered (or returned)
 */
import Parcel from '../models/Parcel.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';
import { sendParcelReceivedEmail } from './emailService.js';

export const populateParcel = [
  { path: 'resident', select: 'name email phone unitLabel' },
  { path: 'receivedBy', select: 'name role' },
  { path: 'apartment', select: 'block unitNumber' },
];

const paginate = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, parseInt(query.limit, 10) || 10);
  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Add a new parcel at the gate.
 */
export const createParcel = async ({
  trackingId,
  courier,
  description,
  residentId,
  receivedById,
}) => {
  const resident = await User.findOne({
    _id: residentId,
    role: 'resident',
    isActive: true,
  });

  if (!resident) {
    const error = new Error('Resident not found');
    error.statusCode = 404;
    throw error;
  }

  const parcel = await Parcel.create({
    trackingId: trackingId?.trim() || '',
    courier: courier?.trim() || 'Unknown',
    description: description?.trim() || 'Parcel',
    resident: resident._id,
    apartment: resident.apartment || null,
    receivedBy: receivedById,
    status: 'received',
  });

  await createNotification({
    userId: resident._id,
    title: 'Parcel received',
    message: `A parcel from ${parcel.courier} has arrived at the gate.`,
    type: 'parcel',
    link: '/resident/parcels',
  });

  sendParcelReceivedEmail({
    to: resident.email,
    residentName: resident.name,
    courier: parcel.courier,
    trackingId: parcel.trackingId,
    description: parcel.description,
  });

  return Parcel.findById(parcel._id).populate(populateParcel);
};

/**
 * List parcels with filters + pagination.
 */
export const listParcels = async (filter, query = {}) => {
  const { page, limit, skip } = paginate(query);

  if (query.status) filter.status = query.status;
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    const matchingResidents = await User.find({
      role: 'resident',
      $or: [{ name: searchRegex }, { unitLabel: searchRegex }, { email: searchRegex }],
    }).select('_id');
    const residentIds = matchingResidents.map((r) => r._id);

    filter.$or = [
      { trackingId: searchRegex },
      { courier: searchRegex },
      { description: searchRegex },
      ...(residentIds.length ? [{ resident: { $in: residentIds } }] : []),
    ];
  }

  const [items, total] = await Promise.all([
    Parcel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(populateParcel),
    Parcel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Get single parcel with optional resident ownership check.
 */
export const getParcelById = async (id, { residentId } = {}) => {
  const filter = { _id: id };
  if (residentId) filter.resident = residentId;

  const parcel = await Parcel.findOne(filter).populate(populateParcel);

  if (!parcel) {
    const error = new Error('Parcel not found');
    error.statusCode = 404;
    throw error;
  }

  return parcel;
};

/**
 * Update parcel status.
 */
export const updateParcelStatus = async ({
  parcelId,
  status,
  actorId,
}) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    const error = new Error('Parcel not found');
    error.statusCode = 404;
    throw error;
  }

  const validStatuses = ['received', 'notified', 'delivered', 'returned'];
  if (!validStatuses.includes(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  const prevStatus = parcel.status;
  parcel.status = status;

  if (status === 'delivered') {
    parcel.deliveredAt = new Date();
  }

  await parcel.save();

  if (status !== prevStatus) {
    const messages = {
      notified: 'Your parcel is ready for pickup at the gate.',
      delivered: 'Your parcel has been marked as collected.',
      returned: 'Your parcel was returned to the courier.',
      received: 'Your parcel status was updated to received.',
    };

    await createNotification({
      userId: parcel.resident,
      title: 'Parcel update',
      message: messages[status] || `Parcel status: ${status}`,
      type: 'parcel',
      link: '/resident/parcels',
    });
  }

  return Parcel.findById(parcel._id).populate(populateParcel);
};

/**
 * Notify resident explicitly (shortcut: received → notified).
 */
export const notifyResident = async (parcelId) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    const error = new Error('Parcel not found');
    error.statusCode = 404;
    throw error;
  }

  if (parcel.status === 'delivered' || parcel.status === 'returned') {
    const error = new Error('Cannot notify — parcel already closed');
    error.statusCode = 400;
    throw error;
  }

  return updateParcelStatus({ parcelId, status: 'notified' });
};

/**
 * Parcel stats for dashboards.
 */
export const getParcelStats = async (filter = {}) => {
  const [total, received, notified, delivered, returned] = await Promise.all([
    Parcel.countDocuments(filter),
    Parcel.countDocuments({ ...filter, status: 'received' }),
    Parcel.countDocuments({ ...filter, status: 'notified' }),
    Parcel.countDocuments({ ...filter, status: 'delivered' }),
    Parcel.countDocuments({ ...filter, status: 'returned' }),
  ]);

  return { total, received, notified, delivered, returned };
};

/**
 * Confirm parcel collection by resident.
 */
export const markParcelCollectedByResident = async ({ parcelId, residentId }) => {
  const parcel = await Parcel.findOne({ _id: parcelId, resident: residentId });

  if (!parcel) {
    const error = new Error('Parcel not found or does not belong to you');
    error.statusCode = 404;
    throw error;
  }

  if (parcel.status === 'delivered') {
    return Parcel.findById(parcel._id).populate(populateParcel);
  }

  if (parcel.status === 'returned') {
    const error = new Error('Parcel was returned to courier and cannot be marked collected');
    error.statusCode = 400;
    throw error;
  }

  return updateParcelStatus({ parcelId, status: 'delivered', actorId: residentId });
};

