import api from './api';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (payload) => api.put('/users/profile', payload);

export const getResidentDashboard = () => api.get('/resident/dashboard');

export const getMyVisitors = (params) =>
  api.get('/resident/visitors', { params });

export const getMyNotifications = (params) =>
  api.get('/resident/notifications', { params });

export const markNotificationRead = (id) =>
  api.patch(`/resident/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch('/resident/notifications/read-all');
