import api from "./axios.instance";
export const getDashboardStats = () => api.get('/dashboard').then(r => r.data);
export const getCommandesParJour = () =>
  api.get('/dashboard/commandes-par-jour').then(r => r.data);