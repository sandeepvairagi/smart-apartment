/**
 * Express app factory — no listen / no DB connect.
 * Used by server.js (production) and tests (supertest).
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import config from './config/env.js';
import indexRoutes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import guardRoutes from './routes/guardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import parcelRoutes from './routes/parcelRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const createApp = () => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );

  // Skip rate limiting in tests so suites don't trip the limiter
  if (config.nodeEnv !== 'test') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
    });
    app.use('/api', limiter);
  }

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to Smart Apartment & Visitor Management System API',
      version: '1.0.0',
    });
  });

  app.use('/api', indexRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/resident', residentRoutes);
  app.use('/api/guard', guardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/visitor', visitorRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/parcels', parcelRoutes);
  app.use('/api/notices', noticeRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/chat', chatRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
