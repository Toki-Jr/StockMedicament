import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected]         = useState(false);
  const socketRef = useRef(null);
  const { user }= useAuth();

  useEffect(() => {
    const token = storage.getItem('token');
    if (!token) return;                    

    if(socketRef.current) return;

    const socket = io(import.meta.env.VITE_API_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (data) => {
      setNotifications((prev) => [{ id: Date.now(), ...data }, ...prev]);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Erreur connexion:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => setNotifications([]), []);

  return { notifications, connected, dismiss, dismissAll, socketRef };
}