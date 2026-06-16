import api from './axios.instance';

export const getCommandes     = ()     => api.get('/commandes').then(r => r.data);
export const createCommande   = (data) => api.post('/commandes', data).then(r => r.data);
export const envoyerCommande  = (id)   => api.patch(`/commandes/${id}/envoyer`).then(r => r.data);
export const deleteBrouillon = (id) =>
  api.delete(`/commandes/${id}/brouillon`).then(r => r.data);
export const deleteCommande = (id) =>
  api.delete(`/commandes/${id}`).then(r => r.data);
export const validerCommande = (id, motif = '') =>
  api.patch(`/commandes/${id}/valider`, { motif });

export const rejeterCommande = (id, motif) =>
  api.patch(`/commandes/${id}/rejeter`, { motif });