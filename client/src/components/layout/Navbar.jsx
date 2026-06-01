import { useEffect, useState, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';
import api from '../../services/axios.instance';
import {
  LayoutDashboard, Pill, Package, ArrowUpDown, ShoppingCart,
  Bell, LogOut, History, User2, Settings, User, MoreVertical
} from 'lucide-react';

const ROUTE_TITLES = {
  '/dashboard':   { label: 'Tableau de bord', icon: <LayoutDashboard size={22}/> },
  '/medicaments': { label: 'Médicaments',     icon: <Pill size={22}/> },
  '/lots':        { label: 'Lots',            icon: <Package size={22}/> },
  '/mouvements':  { label: 'Mouvements',      icon: <ArrowUpDown size={22}/>  },
  '/commandes':   { label: 'Commandes',       icon: <ShoppingCart size={22}/> },
  '/alertes':     { label: 'Alertes',         icon: <Bell size={22}/> },
  '/users':       { label: 'Utilisateurs',    icon: <User2 size={22}/> },
  '/history':     { label: 'Historiques',     icon: <History size={22}/> },
  '/parametres':  { label: 'Paramètres',      icon: <Settings size={22}/> },
  '/profil':      { label: 'Profil',          icon: <User size={22}/> },
};

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, logout } = useAuth();

  const [alertCount, setAlertCount] = useState(0);
  const [greeting, setGreeting]     = useState('');
  const [menuOpen, setMenuOpen]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);

  const page = ROUTE_TITLES[location.pathname] ?? { label: 'StockMed', icon: '💊' };

  /* ── Salutation ── */
  useEffect(() => {
    const updateGreeting = () => {
      const hour       = new Date().getHours();
      const salutation = hour < 12 ? 'Bonjour' : 'Bonsoir';
      setGreeting(`${salutation}, ${user?.nom ?? ''} ${user?.prenom ?? ''}`);
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  /* ── Compteur alertes ── */
  useEffect(() => {
    const fetchCount = () => {
      api.get('/alertes/non-lues')
        .then(res => setAlertCount(res.data?.count ?? 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  /* ── Fermer le menu en cliquant en dehors ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[60px] bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shrink-0 select-none cursor-default text-dynamic">

      {/* Titre de la page active */}
      <div className="flex items-center gap-2.5 text-dynamic">
        <span className="text-xl flex items-center text-emerald-600 dark:text-emerald-400">{page.icon}</span>
        <h1 className="font-['Syne'] text-base font-bold text-zinc-900 dark:text-zinc-50 m-0 text-dynamic">
          {page.label}
        </h1>
      </div>

      {/* ── Actions droite ── */}
      <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300 text-dynamic">

        <span className="font-medium tracking-wide hidden sm:block text-dynamic text-zinc-600 dark:text-zinc-400 text-dynamic">
          {greeting} 👋
        </span>

        {/* ── Bouton trois points + dropdown ── */}
        <div className="relative hidden sm:block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            title="Menu utilisateur"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown utilisateur */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[170px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-dynamic">

              {/* Profil */}
              <Link
                to="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors no-underline cursor-pointer text-dynamic"
              >
                <User size={16} className="text-zinc-400 dark:text-zinc-500" />
                Profil
              </Link>

              {/* Séparateur */}
              <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 mx-3" />

              {/* Déconnecter */}
              <button
                onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 border-none bg-transparent hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left font-medium text-dynamic"
              >
                <LogOut size={16} className="text-red-500" />
                Déconnecter
              </button>

            </div>
          )}
        </div>

        {/* Séparateur vertical */}
        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Bouton alertes notifications */}
        <Link
          to="/alertes"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer no-underline transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Alertes non lues"
        >
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-zinc-950 animate-in zoom-in">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </Link>

        {/* Séparateur vertical */}
        <div className="w-[1px] h-7 bg-zinc-200 dark:bg-zinc-800" />

        {/* Dark/Light Mode Toggle */}
        <div className="flex items-center justify-center transform hover:scale-105 transition-transform">
          <ThemeToggle />
        </div>
      </div>

      {/* ── MODAL GLOBAL DE DÉCONNEXION ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[340px] rounded-xl p-5 border flex flex-col gap-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 shadow-2xl animate-in zoom-in-95 duration-150 text-left text-dynamic">
            {/* Header & Icone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30">
                <LogOut size={18} className="text-red-500" />
              </div>
              <div className="text-dynamic">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 leading-tight m-0 text-base text-dynamic">
                  Déconnexion
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 m-0 text-dynamic">
                  Souhaitez-vous quitter l'application ?
                </p>
              </div>
            </div>

            {/* Message descriptif */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-normal m-0 text-dynamic">
              Vous devrez vous réauthentifier pour accéder à la gestion des médicaments et des commandes.
            </p>

            {/* Actions (Boutons) */}
            <div className="flex gap-2.5 mt-1 text-sm text-dynamic">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg font-medium cursor-pointer bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-dynamic"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-2 rounded-lg text-white border-none cursor-pointer font-semibold bg-red-600 hover:bg-red-700 transition-colors text-dynamic"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}