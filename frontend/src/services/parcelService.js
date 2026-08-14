import api from './api';

/** Guard — add parcel */
export const addParcel = (payload) => api.post('/parcels', payload);

/** Guard / Admin — all parcels */
export const getAllParcels = (params) => api.get('/parcels', { params });

/** Resident — my parcels */
export const getMyParcels = (params) => api.get('/parcels/mine', { params });

/** Guard / Admin — stats */
export const getParcelStats = () => api.get('/parcels/stats');

/** Get single parcel */
export const getParcel = (id) => api.get(`/parcels/${id}`);

/** Guard / Admin — update status */
export const updateParcel = (id, payload) => api.patch(`/parcels/${id}`, payload);

/** Guard — notify resident for pickup */
export const notifyParcel = (id) => api.patch(`/parcels/${id}/notify`);

/** Resident — confirm parcel collection */
export const collectParcel = (id) => api.patch(`/parcels/${id}/collect`);

