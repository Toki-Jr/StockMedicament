import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/mouvement.api';

export function useMouvements() {
  const [mouvements, setMouvements] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filtre, setFiltre]         = useState({ type_mvt: '', id_lot: '' });

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filtre.type_mvt) params.type_mvt = filtre.type_mvt;
      if (filtre.id_lot)   params.id_lot   = filtre.id_lot;
      const [data, statsData] = await Promise.all([
        api.getMouvements(params),
        api.getMouvementStats(),
      ]);
      setMouvements(data);
      setStats(statsData);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally { setLoading(false); }
  }, [filtre]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data) => {
    await api.createMouvement(data);
    await fetch();
  };

  const remove = async (id) => {
    await api.deleteMouvement(id);
    await fetch();
  }

  return { mouvements, stats, loading, error, filtre, setFiltre, create, remove, refetch: fetch };
}