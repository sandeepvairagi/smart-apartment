/**
 * Auth API calls — maps to backend /api/auth/*
 */
import api from './api';

export const registerUser = (payload) => api.post('/auth/register', payload);

export const loginUser = (payload) => api.post('/auth/login', payload);

export const logoutUser = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');

export const forgotPassword = (payload) =>
  api.post('/auth/forgot-password', payload);

export const resetPassword = (token, payload) =>
  api.put(`/auth/reset-password/${token}`, payload);
