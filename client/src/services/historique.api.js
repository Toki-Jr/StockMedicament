import api from "./axios.instance";

export const getHistoriques  = (params) => api.get('/historiques', { params }).then(r => r.data);
export const deleteHistorique = (id)    => api.delete(`/historiques/${id}`).then(r => r.data);
export const deleteAllHistoriques = ()  => api.delete('/historiques/all').then(r => r.data);