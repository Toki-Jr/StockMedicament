import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/alerte.api';

export function useAlertes() {
  const [alertes,  setAlertes]  = useState([]);
  const [nonLues,  setNonLues]  = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filtre,   setFiltre]   = useState({ type_alerte: '', lu: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filtre.type_alerte) params.type_alerte = filtre.type_alerte;
      if (filtre.lu !== '')   params.lu           = filtre.lu;
     
    const [data, nonLuesRes] = await Promise.all([
      api.getAlertes(params),
      api.getNonLues(),
    ]);
    setAlertes(Array.isArray(data) ? data : []);  // data is already unwrapped
    setNonLues(nonLuesRes?.count ?? 0);

    } catch (e) {
      console.error('useAlerte  error: ', e);
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filtre]);

  useEffect(() => { fetch(); }, [fetch]);

  const marquerLu = async (id) => {
    await api.marquerLu(id);
    await fetch();
  };

  const marquerToutesLues = async () => {
    await api.marquerToutesLues();
    await fetch();
  };

  const remove = async (id) => {
    await api.deleteAlerte(id);
    await fetch();
  };

  return { alertes, nonLues, loading, error, filtre, setFiltre, marquerLu, marquerToutesLues, remove, refetch: fetch };
}