import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/lot.api';

export function useLots(id_medoc = '') {
  const [lots, setLots]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.getLots(id_medoc);
      setLots(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally { setLoading(false); }
  }, [id_medoc]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data) => { await api.createLot(data);       await fetch(); };
  const update = async (id, data) => { await api.updateLot(id, data); await fetch(); };
  const remove = async (id) => { await api.deleteLot(id);            await fetch(); };

  return { lots, loading, error, create, update, remove, refetch: fetch };
}