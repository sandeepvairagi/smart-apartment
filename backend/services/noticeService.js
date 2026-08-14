/**
 * Notice Service — shared business logic for community announcements.
 *
 * Flow: draft → published (notifies all residents)
 */
import Notice from '../models/Notice.js';
import User from '../models/User.js';
import { createNotificationsForUsers } from './notificationService.js';
import { sendNoticePublishedEmail } from './emailService.js';

export const populateNotice = [{ path: 'createdBy', select: 'name email' }];

const paginate = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, parseInt(query.limit, 10) || 10);
  return { page, limit, skip: (page - 1) * limit };
};

const notifyAllResidents = async (notice) => {
  const residents = await User.find({ role: 'resident', isActive: true }).select(
    '_id name email'
  );

  await createNotificationsForUsers({
    userIds: residents.map((r) => r._id),
    title: 'New notice',
    message: notice.title,
    type: 'notice',
    link: '/resident/notices',
  });

  // Emails are fire-and-forget (safe wrapper inside sendNoticePublishedEmail)
  residents.forEach((r) => {
    if (r.email) {
      sendNoticePublishedEmail({
        to: r.email,
        residentName: r.name,
        noticeTitle: notice.title,
      });
    }
  });
};

/**
 * Create notice (admin). Optionally publish immediately.
 */
export const createNotice = async ({
  title,
  body,
  priority = 'normal',
  publish = false,
  adminId,
}) => {
  const notice = await Notice.create({
    title: title.trim(),
    body: body.trim(),
    priority,
    isPublished: Boolean(publish),
    publishedAt: publish ? new Date() : undefined,
    createdBy: adminId,
  });

  if (notice.isPublished) {
    await notifyAllResidents(notice);
  }

  return Notice.findById(notice._id).populate(populateNotice);
};

/**
 * List notices with filters (admin — includes drafts).
 */
export const listNotices = async (filter = {}, query = {}) => {
  const { page, limit, skip } = paginate(query);

  if (query.isPublished === 'true') filter.isPublished = true;
  if (query.isPublished === 'false') filter.isPublished = false;
  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { body: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Notice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(populateNotice),
    Notice.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Published notices for residents.
 */
export const listPublishedNotices = async (query = {}) => {
  const filter = { isPublished: true };
  const { page, limit, skip } = paginate(query);

  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { body: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Notice.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(populateNotice),
    Notice.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Get single notice. Residents only see published notices.
 */
export const getNoticeById = async (id, { publishedOnly = false } = {}) => {
  const filter = { _id: id };
  if (publishedOnly) filter.isPublished = true;

  const notice = await Notice.findOne(filter).populate(populateNotice);

  if (!notice) {
    const error = new Error('Notice not found');
    error.statusCode = 404;
    throw error;
  }

  return notice;
};

/**
 * Update notice fields (admin).
 */
export const updateNotice = async ({ noticeId, title, body, priority }) => {
  const notice = await Notice.findById(noticeId);

  if (!notice) {
    const error = new Error('Notice not found');
    error.statusCode = 404;
    throw error;
  }

  if (title !== undefined) notice.title = title.trim();
  if (body !== undefined) notice.body = body.trim();
  if (priority !== undefined) notice.priority = priority;

  await notice.save();

  return Notice.findById(notice._id).populate(populateNotice);
};

/**
 * Publish a draft notice and notify all residents.
 */
export const publishNotice = async (noticeId) => {
  const notice = await Notice.findById(noticeId);

  if (!notice) {
    const error = new Error('Notice not found');
    error.statusCode = 404;
    throw error;
  }

  const wasPublished = notice.isPublished;
  notice.isPublished = true;
  notice.publishedAt = new Date();
  await notice.save();

  if (!wasPublished) {
    await notifyAllResidents(notice);
  }

  return Notice.findById(notice._id).populate(populateNotice);
};

/**
 * Delete notice (admin).
 */
export const deleteNotice = async (noticeId) => {
  const notice = await Notice.findById(noticeId);

  if (!notice) {
    const error = new Error('Notice not found');
    error.statusCode = 404;
    throw error;
  }

  await notice.deleteOne();
  return notice;
};

/**
 * Notice stats for admin dashboard.
 */
export const getNoticeStats = async () => {
  const [total, published, drafts, high, normal, low] = await Promise.all([
    Notice.countDocuments(),
    Notice.countDocuments({ isPublished: true }),
    Notice.countDocuments({ isPublished: false }),
    Notice.countDocuments({ priority: 'high', isPublished: true }),
    Notice.countDocuments({ priority: 'normal', isPublished: true }),
    Notice.countDocuments({ priority: 'low', isPublished: true }),
  ]);

  return { total, published, drafts, high, normal, low };
};
