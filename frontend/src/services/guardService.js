import api from './api';

export const getGuardDashboard = () => api.get('/guard/dashboard');

export const getResidents = (params) => api.get('/guard/residents', { params });

export const addVisitor = (payload) => api.post('/guard/visitors', payload);

export const getVisitors = (params) => api.get('/guard/visitors', { params });

export const getVisitorById = (id) => api.get(`/guard/visitors/${id}`);

export const verifyQr = (payload) => api.post('/qr/verify', payload);

export const checkInVisitor = (id) => api.patch(`/guard/visitors/${id}/check-in`);

export const checkOutVisitor = (id) => api.patch(`/guard/visitors/${id}/check-out`);

export const regenerateQr = (id) => api.post(`/qr/${id}/regenerate`);
