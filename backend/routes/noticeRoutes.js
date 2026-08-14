/**
 * Notice routes — unified notice module
 */
import { Router } from 'express';
import { body } from 'express-validator';
import {
  createNoticeHandler,
  getPublishedNotices,
  getAllNotices,
  getStats,
  getNotice,
  updateNoticeHandler,
  publishNoticeHandler,
  deleteNoticeHandler,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/stats', authorize('admin'), getStats);
router.get('/published', authorize('resident'), getPublishedNotices);
router.get('/', authorize('admin'), getAllNotices);

router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Body is required'),
    body('priority').optional().isIn(['low', 'normal', 'high']),
  ],
  validate,
  createNoticeHandler
);

router.get('/:id', authorize('admin', 'resident'), getNotice);

router.put('/:id', authorize('admin'), updateNoticeHandler);

router.patch('/:id/publish', authorize('admin'), publishNoticeHandler);

router.delete('/:id', authorize('admin'), deleteNoticeHandler);

export default router;
