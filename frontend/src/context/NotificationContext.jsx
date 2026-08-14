import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket } from '../services/socketService';
import { getMyNotifications } from '../services/residentService';
import { ROLES } from '../utils/constants';

const NotificationContext = createContext(null);

const TOAST_TTL_MS = 6000;

/**
 * NotificationProvider — Socket.IO live feed + toast stack + unread badge.
 * Residents get full history via REST; toasts work for any logged-in user.
 */
export function NotificationProvider({ children }) {
  const { token, user, isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const socketRef = useRef(null);
  const toastTimers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (notification) => {
      const id = String(notification._id || Date.now());
      setToasts((prev) => [
        {
          id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.link,
        },
        ...prev,
      ].slice(0, 4));

      const timer = setTimeout(() => dismissToast(id), TOAST_TTL_MS);
      toastTimers.current.set(id, timer);
    },
    [dismissToast]
  );

  const refreshUnread = useCallback(async () => {
    if (!token || user?.role !== ROLES.RESIDENT) return;
    try {
      const { data } = await getMyNotifications({ limit: 1 });
      setUnread(data.data.unread ?? 0);
    } catch {
      // Ignore — user may not have notification API access
    }
  }, [token, user?.role]);

  // Bootstrap unread count for residents
  useEffect(() => {
    if (isAuthenticated && user?.role === ROLES.RESIDENT) {
      refreshUnread();
    } else {
      setUnread(0);
    }
  }, [isAuthenticated, user?.role, refreshUnread]);

  // Connect / disconnect Socket.IO with auth token
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return undefined;
    }

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('notification:new', ({ notification }) => {
      if (!notification) return;
      setUnread((n) => n + 1);
      setLastNotification(notification);
      pushToast(notification);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      setConnected(false);
    });

    return () => {
      socket.off('notification:new');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, token, pushToast]);

  // Cleanup toast timers on unmount
  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const markLocalRead = useCallback((count = 1) => {
    setUnread((n) => Math.max(0, n - count));
  }, []);

  const clearUnread = useCallback(() => setUnread(0), []);

  const value = {
    unread,
    toasts,
    connected,
    lastNotification,
    dismissToast,
    refreshUnread,
    markLocalRead,
    clearUnread,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return ctx;
}
