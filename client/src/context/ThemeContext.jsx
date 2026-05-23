import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// ─── Tokens CSS pour chaque thème ────────────────────────────────────────────
const themes = {
  light: {
    '--bg-app':        '#f1f5f9',
    '--bg-sidebar':    '#ffffff',
    '--bg-card':       '#ffffff',
    '--bg-hover':      '#f8fafc',
    '--border':        '#e2e8f0',
    '--text-primary':  '#0f172a',
    '--text-secondary':'#64748b',
    '--text-muted':    '#94a3b8',
    '--accent':        '#0d9488',
    '--accent-light':  '#ccfbf1',
    '--accent-dark':   '#0f766e',
    '--danger':        '#dc2626',
    '--success':       '#16a34a',
    '--warning':       '#d97706',
    '--shadow':        '0 1px 8px rgba(0,0,0,0.08)',
    '--shadow-lg':     '0 4px 24px rgba(0,0,0,0.10)',
  },
  dark: {
    '--bg-app':        '#0f172a',
    '--bg-sidebar':    '#1e293b',
    '--bg-card':       '#1e293b',
    '--bg-hover':      '#334155',
    '--border':        '#334155',
    '--text-primary':  '#f1f5f9',
    '--text-secondary':'#94a3b8',
    '--text-muted':    '#64748b',
    '--accent':        '#14b8a6',
    '--accent-light':  'rgba(20,184,166,0.15)',
    '--accent-dark':   '#0d9488',
    '--danger':        '#f87171',
    '--success':       '#4ade80',
    '--warning':       '#fbbf24',
    '--shadow':        '0 1px 8px rgba(0,0,0,0.30)',
    '--shadow-lg':     '0 4px 24px rgba(0,0,0,0.40)',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );

  // Applique les variables CSS sur <html> à chaque changement
  useEffect(() => {
    const root = document.documentElement;
    const vars = themes[theme];
    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
    localStorage.setItem('theme', theme);
    // Classe sur body pour styles globaux
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.style.background = vars['--bg-app'];
    document.body.style.color = vars['--text-primary'];
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
};