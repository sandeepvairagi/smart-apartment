/**
 * Base API routes — health check used to verify the server is alive.
 */
import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check — confirms API + database status
 * @access  Public
 */
router.get('/health', (req, res) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'Smart Apartment VMS API is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
