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
  '/dashboard':   { label: 'Tableau de bord', icon: <LayoutDashboard size={25}/> },
  '/medicaments': { label: 'Médicaments',     icon: <Pill size={25}/> },
  '/lots':        { label: 'Lots',            icon: <Package size={25}/> },
  '/mouvements':  { label: 'Mouvements',      icon: <ArrowUpDown size={25}/>  },
  '/commandes':   { label: 'Commandes',       icon: <ShoppingCart size={25}/> },
  '/alertes':     { label: 'Alertes',         icon: <Bell size={25}/> },
  '/users':       { label: 'Utilisateurs',    icon: <User2 size={25}/> },
  '/history':     { label: 'Historiques',     icon: <History size={25}/> },
  '/parametres':  { label: 'Paramètres',      icon: <Settings size={25}/> },
  '/profil':      { label: 'Profil',          icon: <User size={25}/> },
};

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, logout } = useAuth();

  const [alertCount, setAlertCount] = useState(0);
  const [greeting, setGreeting]     = useState('');
  const [menuOpen, setMenuOpen]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // État pour le popup
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
    <header className="h-[60px] bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky 
    top-0 z-10 shadow-[var(--shadow)] shrink-0 select-none cursor-default">

      <div className="flex items-center gap-[10px]">
        <span className="text-[20px] flex items-center">{page.icon}</span>
        <h1 className="font-['Syne'] text-[16px] font-bold text-[var(--text-primary)] m-0">
          {page.label}
        </h1>
      </div>

      {/* ── Actions droite ── */}
      <div className="flex items-center gap-[16px]">

        <span className="text-dynamic font-medium tracking-wide hidden sm:block">
          {greeting} 👋
        </span>

        {/* ── Bouton trois points + dropdown ── */}
        <div className="relative hidden sm:block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-[var(--bg-hover)] border border-[var(--border)] 
            cursor-pointer transition-colors hover:brightness-95"
            title="Menu utilisateur"
          >
            <MoreVertical size={20} className="text-[var(--text-secondary)]" />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[170px] bg-[var(--bg-card)] border border-[var(--border)] 
            rounded-[12px] shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

              {/* Profil */}
              <Link
                to="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-[10px] px-4 py-[10px] text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] 
                transition-colors no-underline cursor-pointer"
              >
                <User size={16} className="text-[var(--text-secondary)]" />
                Profil
              </Link>

              {/* Séparateur */}
              <div className="h-[1px] bg-[var(--border)] mx-3" />

              {/* Déconnecter */}
              <button
                onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-[10px] px-4 py-[10px] text-[14px] text-[#ef4444] border-none 
                bg-transparent hover:bg-[#ef444415] transition-colors cursor-pointer text-left"
              >
                <LogOut size={16} />
                Déconnecter
              </button>

            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="w-[1px] h-[16px] bg-[var(--border)] hidden sm:block" />

        {/* Bouton alerte */}
        <Link
          to="/alertes"
          className="relative flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-[var(--bg-hover)]
           border border-[var(--border)] cursor-pointer no-underline transition-colors hover:brightness-95"
          title="Alertes non lues"
        >
          <Bell size={22} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#dc2626] text-white text-[10px] font-bold min-w-[18px]
             h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-[var(--bg-card)] animate-in zoom-in">
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </Link>

        {/* Séparateur */}
        <div className="w-[1px] h-[28px] bg-[var(--border)]" />

        {/* Toggle thème */}
        <div className="flex items-center justify-center transform hover:scale-110 transition-transform">
          <ThemeToggle />
        </div>
      </div>

      {/* ── POPUP DE DÉCONNEXION MODERNE ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-[340px] rounded-xl p-5 border flex flex-col gap-4 bg-[var(--bg-card)] shadow-2xl animate-scale-up text-left"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Header & Icone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-[#dc2626]/10 border border-[#dc2626]/20">
                <LogOut size={18} className="text-[#dc2626]" />
              </div>
              <div>
                <h3 className="text-dynamic font-semibold text-[var(--text-primary)] leading-tight m-0">
                  Déconnexion
                </h3>
                <p className="text-dynamic text-xs text-[var(--text-muted)] mt-0.5 m-0">
                  Souhaitez-vous quitter l'application ?
                </p>
              </div>
            </div>

            {/* Message descriptif */}
            <p className="text-dynamic text-sm text-[var(--text-secondary)] leading-normal m-0">
              Vous devrez vous réauthentifier pour accéder à la gestion des médicaments et des commandes.
            </p>

            {/* Actions (Boutons) */}
            <div className="flex gap-2.5 mt-1">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg text-dynamic font-medium cursor-pointer bg-[var(--bg-hover)] 
                border border-[var(--border)] text-[var(--text-muted)] hover:opacity-80 transition-opacity"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-2 rounded-lg text-dynamic text-white border-none cursor-pointer font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#dc2626' }}
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