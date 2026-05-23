// hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/user.api';

export function useUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllUsers();
      // si le backend renvoie { data: [...] } adapte ici :
      setUsers(Array.isArray(data) ? data : data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (userData) => {
    await api.createUser(userData);
    await fetch();
  };

  const update = async (id, data) => {
    await api.updateUsers({ id, data });
    await fetch();
  };

  const remove = async (id) => {
    await api.deleteUser(id);
    await fetch();
  };

  return { users, loading, error, search, setSearch, create, update, remove, refetch: fetch };
}