import api from './api';

export const registerVisitor = (payload) => api.post('/visitor/register', payload);

export const getResidentsForRegistration = (params) =>
  api.get('/visitor/residents', { params });

export const verifyVisitorQr = (payload) => api.post('/qr/verify', payload);

export const getVisitorStatus = (id, phone) =>
  api.get(`/visitor/status/${id}`, { params: { phone } });

export const getVisitorHistory = (params) => api.get('/visitor/history', { params });

export const preRegisterGuest = (payload) =>
  api.post('/visitor/resident/pre-register', payload);
