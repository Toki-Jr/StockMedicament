import api from './axios.instance';

export const getAlertes = (params = {}) =>
  api.get('/alertes', { params }).then(r => r.data?.data ?? r.data ?? []);

export const getNonLues = () =>
  api.get('/alertes/non-lues').then(r => {
  const d = r.data;
  const count = d?.count ?? d?.data?.count ?? (typeof d === 'number' ? d : 0);
  return { count };
});

export const marquerLu = (id) =>
  api.patch(`/alertes/${id}/lire`).then(r => r.data.data);

export const marquerToutesLues = () =>
  api.patch('/alertes/marquer-toutes-lues').then(r => r.data.data);

export const deleteAlerte = (id) =>
  api.delete(`/alertes/${id}`).then(r => r.data);