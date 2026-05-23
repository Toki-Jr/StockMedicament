import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/medicament.api';

export function useMedicaments() {
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMedicaments(search);
      setMedicaments(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data) => {
    await api.createMedicament(data);
    await fetch();
  };

  const update = async (id, data) => {
    await api.updateMedicament(id, data);
    await fetch();
  };

  const remove = async (id) => {
    await api.deleteMedicament(id);
    await fetch();
  };

  return { medicaments, loading, error, search, setSearch, create, update, remove, refetch: fetch };
}