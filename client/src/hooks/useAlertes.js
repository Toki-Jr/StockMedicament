import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/alerte.api';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext'; // ← ajouter

export function useAlertes() {
  const { user } = useAuth(); // ← récupère le user
  const [alertes,  setAlertes]  = useState([]);
  const [nonLues,  setNonLues]  = useState(0);
  const [loading,  setLoading]  = useState(false); // false par défaut
  const [error,    setError]    = useState(null);
  const [filtre,   setFiltre]   = useState({ type_alerte: '', lu: '' });

  const { notifications } = useSocketContext();

  const fetch = useCallback(async () => {
    if (!user) return; // ← guard
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
      setAlertes(Array.isArray(data) ? data : []);
      setNonLues(nonLuesRes?.count ?? 0);
    } catch (e) {
      console.error('useAlerte error: ', e);
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filtre, user]); // ← user dans deps

  useEffect(() => { fetch(); }, [fetch]);

  // Reset quand l'user se déconnecte
  useEffect(() => {
    if (!user) {
      setAlertes([]);
      setNonLues(0);
    }
  }, [user]);

  useEffect(() => {
    if (notifications.length > 0) fetch();
  }, [notifications.length]);

  const marquerLu = async (id) => { await api.marquerLu(id); await fetch(); };
  const marquerToutesLues = async () => { await api.marquerToutesLues(); await fetch(); };
  const remove = async (id) => { await api.deleteAlerte(id); await fetch(); };

  return { alertes, nonLues, loading, error, filtre, setFiltre, marquerLu, marquerToutesLues, remove, refetch: fetch };
}