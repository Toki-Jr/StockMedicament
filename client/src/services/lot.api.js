import api from './axios.instance';

export const getLots = (id_medoc = '') =>
  api.get('/lots', { params: id_medoc ? { id_medoc } : {} }).then(r => r.data.data);

export const getLotById = (id) =>
  api.get(`/lots/${id}`).then(r => r.data.data);

export const getLotsExpiration = (jours = 30) =>
  api.get('/lots/expiration', { params: { jours } }).then(r => r.data.data);

export const createLot = (data) =>
  api.post('/lots', data).then(r => r.data.data);

export const updateLot = (id, data) =>
  api.put(`/lots/${id}`, data).then(r => r.data.data);

export const deleteLot = (id) =>
  api.delete(`/lots/${id}`).then(r => r.data);