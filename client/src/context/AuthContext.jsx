import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, updatePassword as apiUpdatePassword} from '../services/auth.api';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(storage.getItem('user')); }
    catch { return null; }
  });

  const [token, setToken] = useState(() => storage.getItem('token'));

  const register = useCallback(async (data) => {
    const res = await apiRegister(data);
    return res;
  }, []);
  
  // Mémorise l'user et token
  const login = useCallback(async (credentials) => {
    const res = await apiLogin(credentials);
    const { token, user } = res; // ← plus de .data.data
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const updateUser = (data) => {
    const merged = { ...user, ...data };
    sessionStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const updatePassword = useCallback(async ({ currentPassword, newPassword }) => {
    return await apiUpdatePassword({
      id: user.id,
      data: { currentPassword, newPassword },
    });
  }, [user?.id]);

  // Détruire user et token
  const logout = useCallback(() => {
    storage.removeItem('token');
    storage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin       = user?.role === 'admin';
  const isPharmacien  = user?.role === 'pharmacien';

  const authData = {
    user,
    token,
    register,
    login,
    updateUser,
    updatePassword,
    logout,
    isAuthenticated,
    isAdmin,
    isPharmacien
  };
  
  return (
    // Distributeur du contexte
    <AuthContext.Provider value={ authData }>
      {children}
    </AuthContext.Provider>
  );
};

// Hook raccourci
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
};