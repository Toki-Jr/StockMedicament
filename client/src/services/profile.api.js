import api from "./axios.instance";

export const getMe     = ()     => api.get('/auth/me').then(r => r.data);
export const updateMe  = (data) => api.put('/auth/me', data).then(r => r.data);
export const deleteMe  = ()     => api.delete('/auth/me').then(r => r.data);