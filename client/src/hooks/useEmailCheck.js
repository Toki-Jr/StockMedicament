import { useState, useCallback } from 'react';

export function useEmailCheck() {
  const [emailStatus, setEmailStatus] = useState('idle');

  const checkEmail = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailStatus('checking');
    try {
      const res  = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      // ✅ On vérifie juste que le domaine a des MX records (email techniquement valide)
      // isGoogleDomain ou domaine avec MX = ok
      const ok = data.data?.isGoogleDomain || data.success;
      setEmailStatus(ok ? 'exists' : 'not_found');

    } catch {
      setEmailStatus('error');
    }
  }, []);

  return { emailStatus, setEmailStatus, checkEmail };
}