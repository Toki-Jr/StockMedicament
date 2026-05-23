import api from "./axios.instance";

export const createUser = async ({ nom, prenom, email, password, role }) => {
  const res = await api.post('/auth/register', { nom, prenom, email, password, role });
  return res.data;
};
 
export const getAllUsers = async () => {
  const res = await api.get('/auth/users');
  return res.data;
};

export const updateUsers  = async({id, data}) =>
  api.put(`/auth/users/${id}`, data).then(r => r.data.data);
  
export const deleteUser = async (id) =>
  api.delete(`/auth/users/${id}`).then(r => r.data);