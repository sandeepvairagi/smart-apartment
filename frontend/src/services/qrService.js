import api from './api';

/** Verify QR pass (public or guard) */
export const verifyQrPass = (payload) => api.post('/qr/verify', payload);

/** Guard — scan QR and auto check-in */
export const scanQrPass = (payload) => api.post('/qr/scan', payload);

/** Guard — QR usage stats */
export const getQrStats = () => api.get('/qr/stats');

/** Get QR pass image (guard / resident / public with phone) */
export const getQrPass = (visitorId, params) =>
  api.get(`/qr/${visitorId}`, { params });

/** Guard or resident — regenerate QR pass */
export const regenerateQrPass = (visitorId) =>
  api.post(`/qr/${visitorId}/regenerate`);

/** Download QR PNG from a data URL */
export const downloadQrImage = (dataUrl, filename = 'visitor-qr-pass.png') => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

/** Copy QR payload JSON to clipboard */
export const copyQrPayload = async (payload) => {
  await navigator.clipboard.writeText(payload);
};
