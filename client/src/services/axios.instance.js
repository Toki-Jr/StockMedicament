import axios from 'axios';
import { storage } from '../utils/storage';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://stock-medoc-production.up.railway.app/api',
    headers: { 'Content-Type': 'application/json' },
});

// Inject auto le token ds chq requete
api.interceptors.request.use((config) => {
    const token = storage.getItem('token');
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Redirige vers login si token exprié
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status ===401){
            storage.removeItem('token');
            storage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);

    }
);

export default api;

