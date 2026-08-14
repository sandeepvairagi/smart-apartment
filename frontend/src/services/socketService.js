/**
 * Socket.IO client — connects to backend with JWT auth.
 * Uses Vite proxy in development (same origin).
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Create a socket connection authenticated with the user's JWT.
 */
export const connectSocket = (token) => {
  if (!token) return null;

  return io(SOCKET_URL || undefined, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
};
