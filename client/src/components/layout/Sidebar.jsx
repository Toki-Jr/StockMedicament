import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Pill, Package, ArrowUpDown, ShoppingCart, History,
  Bell, LogOut, ChevronLeft, UserCircle, Users2, ChevronDown,
  Settings,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const NAV_GROUPS = [
  {
    label: 'Tableau de bord',
    icon: <LayoutDashboard size={17}/>,
    single: true,
    to: '/dashboard',
    roles: ['admin', 'pharmacien', 'user'],
  },
  {
    label: 'Stock',
    icon: <Package size={17}/>,
    roles: ['admin', 'pharmacien'],
    items: [
      { to: '/medicaments', icon: <Pill size={15}/>,        label: 'Médicaments' },
      { to: '/lots',        icon: <Package size={15}/>,     label: 'Lots'        },
      { to: '/mouvements',  icon: <ArrowUpDown size={15}/>, label: 'Mouvements'  },
    ]
  },
  {
    label: 'Gestion',
    icon: <ShoppingCart size={17}/>,
    roles: ['admin', 'pharmacien', 'user'],
    items: [
      { to: '/commandes', icon: <ShoppingCart size={15}/>, label: 'Commandes',    roles: ['admin', 'pharmacien', 'user'] },
      { to: '/users',     icon: <Users2 size={15}/>,       label: 'Utilisateurs', roles: ['admin'] },
      { to: '/alertes',   icon: <Bell size={15}/>,         label: 'Alertes',      roles: ['admin', 'pharmacien', 'user'] },
    ]
  },
  {
    label: 'Système',
    icon: <History size={17}/>,
    roles: ['admin', 'pharmacien'],
    items: [
      { to: '/history',    icon: <History size={15}/>,  label: 'Historiques', roles: ['admin'] },
      { to: '/parametres', icon: <Settings size={15}/>, label: 'Paramètres',  roles: ['admin', 'pharmacien'] },
    ]
  },
];

const ROLE_ACCENT = {
  admin:      { activeBg: 'rgba(22,163,74,0.12)', activeText: '#4ade80', dot: '#4ade80', avatar: '#16a34a' },
  pharmacien: { activeBg: 'rgba(22,163,74,0.12)', activeText: '#4ade80', dot: '#4ade80', avatar: '#16a34a' },
  user:       { activeBg: 'rgba(22,163,74,0.12)', activeText: '#4ade80', dot: '#4ade80', avatar: '#16a34a' },
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [openGroups, setOpenGroups] = useState({ Stock: true, Gestion: true, Système: false });
  const menuRef = useRef(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  const accent   = ROLE_ACCENT[user?.role] || ROLE_ACCENT.user;
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  // Auto-ouvrir le groupe contenant la route active
  useEffect(() => {
    NAV_GROUPS.forEach(group => {
      if (!group.single && group.items?.some(i => location.pathname.startsWith(i.to))) {
        setOpenGroups(p => ({ ...p, [group.label]: true }));
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const toggleGroup = (label) => {
    if (collapsed) return;
    setOpenGroups(p => ({ ...p, [label]: !p[label] }));
  };

  const isGroupActive = (group) =>
    !group.single && group.items?.some(i => location.pathname.startsWith(i.to));

  return (
    <aside
      className="h-screen flex flex-col sticky top-0 shrink-0 select-none bg-[var(--bg-sidebar,#111)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: collapsed ? 64 : 240, borderRight: '1px solid var(--border,#1f1f1f)' }}
    >
      {/* ── LOGO ── */}
      <div className="p-4 flex items-center justify-between gap-3 h-[60px] border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-dynamic text-white shrink-0"
            style={{ background: accent.avatar, boxShadow: `0 0 12px ${accent.avatar}44` }}
          >
            S
          </div>
          {!collapsed && (
            <p className="font-bold text-dynamic text-[var(--text-primary,#fff)] leading-tight truncate animate-in fade-in duration-200">
              Stock<span style={{ color: '#4ade80' }}>'méd</span>
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-md shrink-0 cursor-pointer border-none"
        >
          <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map(group => {
          if (!group.roles.includes(user?.role)) return null;

          // ── Item simple (Tableau de bord) ──
          if (group.single) {
            const isActive = location.pathname === group.to;
            return (
              <NavLink
                key={group.to}
                to={group.to}
                title={collapsed ? group.label : undefined}
                className="no-underline group mb-1"
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-dynamic font-medium transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
                  style={{
                    background: isActive ? accent.activeBg : 'transparent',
                    color:      isActive ? accent.activeText : '',
                  }}>
                  <span className="shrink-0">{group.icon}</span>
                  {!collapsed && <span className="flex-1 truncate">{group.label}</span>}
                  {isActive && !collapsed && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: accent.dot }} />
                  )}
                </div>
              </NavLink>
            );
          }

          // ── Groupe avec sous-items ──
          const visibleItems = group.items.filter(i => !i.roles || i.roles.includes(user?.role));
          if (visibleItems.length === 0) return null;

          const groupActive = isGroupActive(group);
          const isOpen      = openGroups[group.label];

          return (
            <div key={group.label} className="flex flex-col">
              {/* Header du groupe */}
              <button
                onClick={() => toggleGroup(group.label)}
                title={collapsed ? group.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-dynamic font-medium transition-all duration-200 cursor-pointer border-none ${collapsed ? 'justify-center' : ''}`}
                style={{
                  background: groupActive && collapsed ? accent.activeBg : '',
                  color:      groupActive ? accent.activeText : '',
                }}>
                <span className="shrink-0">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-dynamic truncate">{group.label}</span>
                    <ChevronDown
                      size={13}
                      className="shrink-0 transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </>
                )}
              </button>

              {/* Sous-items */}
              {!collapsed && isOpen && (
                <div className="flex flex-col gap-0.5 ml-3 pl-3 mb-1"
                     style={{ borderLeft: `1px solid var(--border)` }}>
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="no-underline group"
                    >
                      {({ isActive }) => (
                        <div
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-dynamic font-medium transition-all duration-150"
                          style={{
                            background: isActive ? accent.activeBg : 'transparent',
                            color:      isActive ? accent.activeText : '',
                          }}>
                          <span className="shrink-0">{item.icon}</span>
                          <span className="flex-1 truncate">{item.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ background: accent.dot }} />
                          )}
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── COMPTE UTILISATEUR ── */}
      <div ref={menuRef} className="relative p-2 border-t border-white/[0.04]">
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-white/[0.03] border-none ${collapsed ? 'justify-center' : ''}`}
        >
          {user?.photo ? (
            <img src={user.photo} alt="avatar" className="rounded-full object-cover shrink-0"
                 style={{ width: 32, height: 32, border: `2px solid ${accent.avatar}` }} />
          ) : (
            <div className="rounded-full flex items-center justify-center font-bold shrink-0 text-dynamic text-white"
                 style={{ width: 32, height: 32, background: accent.avatar }}>
              {initials}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-dynamic font-semibold text-[var(--text-primary,#fff)] truncate leading-tight">
                  {user?.prenom} {user?.nom}
                </span>
                <span className="text-dynamic text-[var(--text-muted,#666)] truncate mt-0.5">
                  {user?.email}
                </span>
              </div>
              <ChevronLeft size={14} className={`text-white/30 transition-transform duration-200 ${menuOpen ? '-rotate-90' : 'rotate-180'}`} />
            </>
          )}
        </button>

        {/* ── Menu popup overlay ── */}
        {menuOpen && (
          <div
            className={`absolute bg-[var(--bg-sidebar,#161616)] border border-white/[0.06] rounded-xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 ${collapsed ? 'left-[72px] bottom-2 w-48' : 'left-2 right-2 bottom-[calc(100%+8px)]'}`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {!collapsed && (
              <div className="flex items-center gap-3 px-4 py-3"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-dynamic shrink-0"
                     style={{ background: accent.avatar }}>
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-dynamic font-semibold text-[var(--text-primary,#fff)] truncate">
                    {user?.prenom} {user?.nom}
                  </span>
                  <span className="text-dynamic text-[var(--text-muted,#666)] truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            )}
            <div className="p-1 flex flex-col gap-0.5">
              <button
                onClick={() => { setMenuOpen(false); navigate('/profil'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-dynamic font-medium rounded-lg text-left border-none cursor-pointer hover:bg-white/[0.04] transition-colors">
                <UserCircle size={15} className="text-white/40" />
                Mon Profil
              </button>

              {/* Ligne Séparatrice & Bouton Déconnexion */}
              <div className="p-1 border-t border-white/[0.04]">
                <button
                  onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-dynamic font-medium rounded-lg hover:bg-[#dc2626]/10 text-left border-none cursor-pointer transition-colors"
                  style={{ color: '#fca5a5' }}>
                  <LogOut size={15} className="text-[#dc2626]" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── POPUP DE DÉCONNEXION GLOBAL (Placé hors du flux relatif pour éviter les bugs graphiques) ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-[340px] rounded-xl p-5 border flex flex-col gap-4 shadow-2xl animate-scale-up"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border)' 
            }}
          >
            {/* Header & Icone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-[#dc2626]/10 border border-[#dc2626]/20">
                <LogOut size={18} className="text-[#dc2626]" />
              </div>
              <div>
                <h3 
                  className="text-dynamic font-semibold leading-tight m-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Déconnexion
                </h3>
                <p 
                  className="text-dynamic text-xs mt-0.5 m-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Souhaitez-vous quitter l'application ?
                </p>
              </div>
            </div>

            {/* Message descriptif */}
            <p 
              className="text-dynamic text-sm leading-normal m-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              Vous devrez vous réauthentifier pour accéder à la gestion des médicaments et des commandes.
            </p>

            {/* Actions (Boutons) */}
            <div className="flex gap-2.5 mt-1">
              {/* Bouton Annuler (S'adapte dynamiquement au thème via var) */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg text-dynamic font-medium cursor-pointer transition-colors border"
                style={{ 
                  backgroundColor: 'var(--bg-hover)', 
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                Annuler
              </button>
              
              {/* Bouton Rouge de confirmation */}
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-2 rounded-lg text-dynamic font-semibold text-white border-none cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#dc2626' }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}