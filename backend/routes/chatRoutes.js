/**
 * Chat Routes — AI Assistant endpoint
 */
import { Router } from 'express';
import { handleChatQuery } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Optional authentication middleware — attaches req.user if bearer token present
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, handleChatQuery);

export default router;
