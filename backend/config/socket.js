/**
 * Socket.IO setup — real-time push to authenticated users.
 *
 * Each client joins a private room: user:<userId>
 * Notifications are emitted only to that room (privacy).
 */
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './env.js';

let io = null;

/**
 * Attach Socket.IO to the HTTP server (must share the same port as Express).
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  // Authenticate every socket connection with the same JWT as REST APIs
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = String(decoded.id);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user:${socket.userId}`;
    socket.join(room);

    if (config.nodeEnv === 'development') {
      console.log(`Socket connected: ${socket.userId} (${socket.id})`);
    }

    socket.on('disconnect', () => {
      if (config.nodeEnv === 'development') {
        console.log(`Socket disconnected: ${socket.userId}`);
      }
    });
  });

  return io;
};

export const getIO = () => io;

/**
 * Push an event to one user (all their open tabs/devices).
 */
export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  io.to(`user:${String(userId)}`).emit(event, data);
};
