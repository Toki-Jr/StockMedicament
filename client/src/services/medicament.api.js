import api from './axios.instance';

export const refreshAlertes = () =>
  api.post('/medicaments/refresh-alertes').then(r => r.data);

export const getMedicaments = (search = '') =>
  api.get('/medicaments', { params: search ? { search } : {} }).then(r => r.data.data);

export const getMedicamentById = (id) =>
  api.get(`/medicaments/${id}`).then(r => r.data.data);

export const createMedicament = (data) =>
  api.post('/medicaments', data).then(r => r.data.data);

export const updateMedicament = (id, data) =>
  api.put(`/medicaments/${id}`, data).then(r => r.data.data);

export const deleteMedicament = (id) =>
  api.delete(`/medicaments/${id}`).then(r => r.data);
