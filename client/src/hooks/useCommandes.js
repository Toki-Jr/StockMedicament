import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/commande.api';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

export function useCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const { user } = useAuth();
  const { socketRef } = useSocketContext();
  const isAdmin = user?.role === 'admin';

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.getCommandes();
      setCommandes(Array.isArray(data) ? data : data.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de chargement');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!isAdmin) return;
    const socket = socketRef?.current;
    if (!socket) return;

    const handler = (commande) => {
      setCommandes(prev => {
        const existe = prev.some(c => c.id_commande === commande.id_commande);
        if (existe) return prev;
        return [commande, ...prev];
      });
    };

    socket.on('nouvelle_commande', handler);
    return () => socket.off('nouvelle_commande', handler);
  }, [isAdmin, socketRef]);

  const create          = async (data)      => { await api.createCommande(data);       await fetch(); };
  const envoyer         = async (id)        => { await api.envoyerCommande(id);        await fetch(); };
  const removeBrouillon = async (id)        => { await api.deleteBrouillon(id);        await fetch(); };
  const valider         = async (id, motif) => { await api.validerCommande(id, motif); await fetch(); };
  const rejeter         = async (id, motif) => { await api.rejeterCommande(id, motif); await fetch(); };

  return { commandes, loading, error, create, envoyer, removeBrouillon, valider, rejeter, refetch: fetch };
}