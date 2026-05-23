import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/commande.api';

export function useCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCommandes();
      setCommandes(Array.isArray(data) ? data : data.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create         = async (data)           => { await api.createCommande(data);        await fetch(); };
  const envoyer        = async (id)             => { await api.envoyerCommande(id);         await fetch(); };
  const removeBrouillon= async (id)             => { await api.deleteBrouillon(id);         await fetch(); };
  const valider        = async (id, motif)      => { await api.validerCommande(id, motif);  await fetch(); };
  const rejeter         = async (id, motif)     => { await api.rejeterCommande(id, motif);  await fetch(); };
  return { commandes, loading, error, create, envoyer, removeBrouillon, valider, rejeter, refetch: fetch };
}