import api from './api';

/** Resident — raise complaint */
export const raiseComplaint = (payload) => api.post('/complaints', payload);

/** Resident — my complaint history */
export const getMyComplaints = (params) => api.get('/complaints/mine', { params });

/** Resident or admin — single complaint detail */
export const getComplaint = (id) => api.get(`/complaints/${id}`);

/** Admin — all complaints */
export const getAllComplaints = (params) => api.get('/complaints', { params });

/** Admin — complaint stats */
export const getComplaintStats = () => api.get('/complaints/stats');

/** Admin — update status / resolution */
export const updateComplaint = (id, payload) =>
  api.patch(`/complaints/${id}`, payload);

/** Admin — resolve with notes */
export const resolveComplaint = (id, payload) =>
  api.patch(`/complaints/${id}/resolve`, payload);
