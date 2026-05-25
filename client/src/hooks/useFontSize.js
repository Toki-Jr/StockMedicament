import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios.instance';

export function useFontSize() {
  const { user, updateUser } = useAuth();

  // Priorité : profil user en mémoire → localStorage → 14 par défaut
  const [fontSize, setFontSizeState] = useState(() => {
    return user?.fontSize || Number(localStorage.getItem('app-font-size')) || 14;
  });

  // Applique la CSS variable à chaque changement
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
  }, [fontSize]);

  const setFontSize = useCallback(async (value) => {
    setFontSizeState(value);                          // 1. UI réagit immédiatement
    localStorage.setItem('app-font-size', value);    // 2. Fallback offline

    if (user?.id) {
      try {
        await api.patch('/auth/preferences', { fontSize: value });
        updateUser({ fontSize: value });             // 3. Sync AuthContext + sessionStorage
      } catch (err) {
        console.error('[useFontSize]', err);
        // Rollback si l'API échoue
        const previous = user?.fontSize || 14;
        setFontSizeState(previous);
        localStorage.setItem('app-font-size', previous);
      }
    }
  }, [user?.id, user?.fontSize, updateUser]);

  return [fontSize, setFontSize];
}