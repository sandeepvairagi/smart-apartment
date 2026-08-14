import api from './api';

/** Resident — published notices */
export const getPublishedNotices = (params) =>
  api.get('/notices/published', { params });

/** Admin or resident — single notice detail */
export const getNotice = (id) => api.get(`/notices/${id}`);

/** Admin — all notices (includes drafts) */
export const getAllNotices = (params) => api.get('/notices', { params });

/** Admin — notice stats */
export const getNoticeStats = () => api.get('/notices/stats');

/** Admin — create notice */
export const createNotice = (payload) => api.post('/notices', payload);

/** Admin — update notice */
export const updateNotice = (id, payload) => api.put(`/notices/${id}`, payload);

/** Admin — publish draft */
export const publishNotice = (id) => api.patch(`/notices/${id}/publish`);

/** Admin — delete notice */
export const deleteNotice = (id) => api.delete(`/notices/${id}`);
