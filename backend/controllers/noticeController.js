/**
 * Notice Controller — unified notice module endpoints
 */
import asyncHandler from '../utils/asyncHandler.js';
import {
  createNotice,
  listNotices,
  listPublishedNotices,
  getNoticeById,
  updateNotice,
  publishNotice,
  deleteNotice,
  getNoticeStats,
} from '../services/noticeService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) res.status(error.statusCode);
  throw error;
};

/**
 * @desc    Create notice (admin)
 * @route   POST /api/notices
 */
export const createNoticeHandler = asyncHandler(async (req, res) => {
  const { title, body, priority, publish } = req.body;

  if (!title?.trim() || !body?.trim()) {
    res.status(400);
    throw new Error('Title and body are required');
  }

  const notice = await createNotice({
    title,
    body,
    priority,
    publish,
    adminId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: notice.isPublished ? 'Notice published' : 'Notice saved as draft',
    data: { notice },
  });
});

/**
 * @desc    Published notices (resident)
 * @route   GET /api/notices/published
 */
export const getPublishedNotices = asyncHandler(async (req, res) => {
  const result = await listPublishedNotices(req.query);

  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    All notices (admin)
 * @route   GET /api/notices
 */
export const getAllNotices = asyncHandler(async (req, res) => {
  const result = await listNotices({}, req.query);

  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Notice stats (admin)
 * @route   GET /api/notices/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await getNoticeStats();

  res.status(200).json({ success: true, data: { stats } });
});

/**
 * @desc    Single notice detail
 * @route   GET /api/notices/:id
 */
export const getNotice = asyncHandler(async (req, res) => {
  try {
    const publishedOnly = req.user.role === 'resident';
    const notice = await getNoticeById(req.params.id, { publishedOnly });

    res.status(200).json({ success: true, data: { notice } });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Update notice (admin)
 * @route   PUT /api/notices/:id
 */
export const updateNoticeHandler = asyncHandler(async (req, res) => {
  try {
    const notice = await updateNotice({
      noticeId: req.params.id,
      title: req.body.title,
      body: req.body.body,
      priority: req.body.priority,
    });

    res.status(200).json({
      success: true,
      message: 'Notice updated',
      data: { notice },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Publish draft notice (admin)
 * @route   PATCH /api/notices/:id/publish
 */
export const publishNoticeHandler = asyncHandler(async (req, res) => {
  try {
    const notice = await publishNotice(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Notice published',
      data: { notice },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Delete notice (admin)
 * @route   DELETE /api/notices/:id
 */
export const deleteNoticeHandler = asyncHandler(async (req, res) => {
  try {
    await deleteNotice(req.params.id);

    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    handleServiceError(res, error);
  }
});
