/**
 * Complaint Service — shared business logic for complaint lifecycle.
 *
 * Flow: open → in-progress → resolved → closed
 */
import Complaint from '../models/Complaint.js';
import { createNotification } from './notificationService.js';

export const populateComplaint = [
  { path: 'resident', select: 'name email unitLabel phone' },
  { path: 'resolvedBy', select: 'name role' },
  { path: 'apartment', select: 'block unitNumber' },
];

const paginate = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, parseInt(query.limit, 10) || 10);
  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Raise a new complaint (resident).
 */
export const createComplaint = async ({
  title,
  description,
  category,
  residentId,
  apartmentId = null,
}) => {
  const complaint = await Complaint.create({
    title: title.trim(),
    description: description.trim(),
    category: category || 'other',
    resident: residentId,
    apartment: apartmentId,
    status: 'open',
  });

  await createNotification({
    userId: residentId,
    title: 'Complaint submitted',
    message: `Your complaint "${complaint.title}" is now open.`,
    type: 'complaint',
    link: '/resident/complaints',
  });

  return Complaint.findById(complaint._id).populate(populateComplaint);
};

/**
 * List complaints with filters + pagination.
 */
export const listComplaints = async (filter, query = {}) => {
  const { page, limit, skip } = paginate(query);

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(populateComplaint),
    Complaint.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Get single complaint by ID with optional resident ownership check.
 */
export const getComplaintById = async (id, { residentId } = {}) => {
  const filter = { _id: id };
  if (residentId) filter.resident = residentId;

  const complaint = await Complaint.findOne(filter).populate(populateComplaint);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  return complaint;
};

/**
 * Update complaint status (admin).
 */
export const updateComplaintStatus = async ({
  complaintId,
  status,
  resolution,
  adminId,
}) => {
  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const prevStatus = complaint.status;
  const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];

  if (status && !validStatuses.includes(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  if (status) complaint.status = status;
  if (resolution !== undefined) complaint.resolution = resolution.trim();

  if (['resolved', 'closed'].includes(complaint.status)) {
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = adminId;
  }

  await complaint.save();

  if (status && status !== prevStatus) {
    await createNotification({
      userId: complaint.resident,
      title: 'Complaint status updated',
      message: `"${complaint.title}" is now ${complaint.status.replace('-', ' ')}.`,
      type: 'complaint',
      link: '/resident/complaints',
    });
  }

  return Complaint.findById(complaint._id).populate(populateComplaint);
};

/**
 * Resolve complaint with resolution notes (admin shortcut).
 */
export const resolveComplaint = async ({ complaintId, resolution, adminId }) => {
  if (!resolution?.trim()) {
    const error = new Error('Resolution notes are required');
    error.statusCode = 400;
    throw error;
  }

  return updateComplaintStatus({
    complaintId,
    status: 'resolved',
    resolution,
    adminId,
  });
};

/**
 * Complaint stats for dashboards.
 */
export const getComplaintStats = async (filter = {}) => {
  const [total, open, inProgress, resolved, closed] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.countDocuments({ ...filter, status: 'open' }),
    Complaint.countDocuments({ ...filter, status: 'in-progress' }),
    Complaint.countDocuments({ ...filter, status: 'resolved' }),
    Complaint.countDocuments({ ...filter, status: 'closed' }),
  ]);

  return { total, open, inProgress, resolved, closed };
};
