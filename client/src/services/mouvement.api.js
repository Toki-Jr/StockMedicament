import api from './axios.instance';

export const getMouvements = (params = {}) =>
  api.get('/mouvements', { params }).then(r => r.data.data);

export const getMouvementStats = () =>
  api.get('/mouvements/stats').then(r => r.data.data);

export const createMouvement = (data) =>
  api.post('/mouvements', data).then(r => r.data.data);

export const deleteMouvement = (id) => 
  api.delete(`/mouvements/${id}`).then(r => r.data);