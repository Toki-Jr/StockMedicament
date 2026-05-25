import { data } from "react-router-dom";
import api from "./axios.instance";

export const login = async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });

    return res.data;  // { success, message, data: { token, user } }
}

export const register = async ({ nom, prenom, email, password, role }) => {
  const res = await api.post('/auth/register', { nom, prenom, email, password, role });
  return res.data;
};
 
export const getUsers = async () => {
  const res = await api.get('/auth/users');
  return res.data;
};

export const updateUsers  = async({id, data}) =>
  api.put(`/auth/users/${id}`, data).then(r => r.data.data);
  
export const updatePassword = async({id, data}) => 
  api.put(`/auth/change-password/${id}`, data).then(r => r.data);

export const updateMedicament = (id, data) =>
  api.put(`/medicaments/${id}`, data).then(r => r.data.data);

export const deleteMedicament = (id) =>
  api.delete(`/medicaments/${id}`).then(r => r.data);
