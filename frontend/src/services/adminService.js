import api from './api';

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAnalytics = () => api.get('/admin/analytics');

export const getUsers = (params) => api.get('/admin/users', { params });
export const createUser = (payload) => api.post('/admin/users', payload);
export const updateUser = (id, payload) => api.put(`/admin/users/${id}`, payload);
export const assignApartment = (id, payload) =>
  api.patch(`/admin/users/${id}/assign-apartment`, payload);

export const getApartments = (params) => api.get('/admin/apartments', { params });
export const createApartment = (payload) => api.post('/admin/apartments', payload);
export const updateApartment = (id, payload) =>
  api.put(`/admin/apartments/${id}`, payload);
export const deleteApartment = (id) => api.delete(`/admin/apartments/${id}`);
