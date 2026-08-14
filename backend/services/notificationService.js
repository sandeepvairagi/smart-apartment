/**
 * Notification service — create in-app notifications + real-time Socket.IO push.
 */
import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
  });

  // Real-time push — only reaches this user if they are online
  emitToUser(userId, 'notification:new', {
    notification: {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    },
  });

  return notification;
};

/**
 * Bulk create (e.g. notice published to all residents).
 * Emits one Socket event per user.
 */
export const createNotificationsForUsers = async ({
  userIds,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  if (!userIds?.length) return [];

  const docs = userIds.map((userId) => ({
    user: userId,
    title,
    message,
    type,
    link,
  }));

  const created = await Notification.insertMany(docs);

  created.forEach((notification) => {
    emitToUser(notification.user, 'notification:new', {
      notification: {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });
  });

  return created;
};
