import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Pill, Package, ArrowUpDown, ShoppingCart, History,
  Bell, LogOut, ChevronLeft, ChevronRight, User2, Settings, UserCircle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: <LayoutDashboard size={17}/>, label: 'Tableau de bord', roles: ['admin', 'pharmacien', 'user'] },
  { to: '/medicaments',  icon: <Pill size={17}/>,            label: 'Médicaments',     roles: ['admin', 'pharmacien'] },
  { to: '/lots',         icon: <Package size={17}/>,         label: 'Lots',            roles: ['admin', 'pharmacien'] },
  { to: '/mouvements',   icon: <ArrowUpDown size={17}/>,     label: 'Mouvements',      roles: ['admin', 'pharmacien'] },
  { to: '/commandes',    icon: <ShoppingCart size={17}/>,    label: 'Commandes',       roles: ['admin', 'pharmacien'] },
  { to: '/users',        icon: <User2 size={17}/>,           label: 'Utilisateurs',    roles: ['admin'] },
  { to: '/alertes',      icon: <Bell size={17}/>,            label: 'Alertes',         roles: ['admin', 'pharmacien', 'user'] },
  { to: '/history',      icon: <History size={17}/>,         label: 'Historiques',     roles: ['admin'] },
];

const ROLE_META = {
  admin:      { label: 'Administration', textClass: 'text-[#4ade80]', bg: 'bg-[#16a34a]/20', border: 'border-[#16a34a]/50' },
  pharmacien: { label: 'Pharmacien',     textClass: 'text-[#93c5fd]', bg: 'bg-[#3b82f6]/20', border: 'border-[#3b82f6]/50' },
  user:       { label: 'Utilisateur',    textClass: 'text-[#fca5a5]', bg: 'bg-[#ef4444]/20', border: 'border-[#ef4444]/50' },
};

const ROLE_ACCENT = {
  admin:      { activeBg: 'rgba(22,163,74,0.15)',  activeText: '#4ade80', dot: '#4ade80', avatar: '#16a34a' },
  pharmacien: { activeBg: 'rgba(22,163,74,0.15)',  activeText: '#4ade80', dot: '#4ade80', avatar: '#16a34a'  },
  user:       { activeBg: 'rgba(22,163,74,0.15)',  activeText: '#4ade80', dot: '#4ade80', avatar: '#16a34a'  },
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const items = NAV_ITEMS.filter(i => i.roles.includes(user?.role));
  const roleM = ROLE_META[user?.role]   || ROLE_META.user;
  const accent = ROLE_ACCENT[user?.role] || ROLE_ACCENT.user;
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  return (
    <aside
      className="h-screen flex flex-col sticky top-0 shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none"
      style={{ width: collapsed ? 62 : 220, borderRight: '1px solid #1f1f1f' }}
    >

      {/* ══ LOGO ══ */}
      <div className={`flex items-center gap-[10px] px-[12px] py-[16px] ${collapsed ? 'justify-center' : ''}`}>
        {/* App icon */}
        <div
          className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center font-black text-[16px] text-white shrink-0 cursor-default"
          style={{ background: accent.avatar, boxShadow: `0 0 14px ${accent.avatar}66` }}
        >
          S
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0 animate-in fade-in duration-200">
            <p className="font-bold text-[15px] leading-none tracking-tight">
              Stock Médicament
            </p>
            <span className={`inline-flex items-center mt-[5px] text-[10px] font-semibold px-[8px] py-[2px] rounded-full border ${roleM.bg} ${roleM.border} ${roleM.textClass}`}>
              {roleM.label}
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? 'Agrandir' : 'Réduire'}
          className="w-[22px] h-[22px] flex items-center justify-center rounded-[5px] text-[#444] hover:text-[#888] hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
        >
          <span className={`transition-transform duration-300 inline-block ${collapsed ? 'rotate-180' : ''}`}>
            <ChevronLeft size={15} />
          </span>
        </button>
      </div>
      <hr className='m-2 font-medium'/>
      {/* ══ NAVIGATION ══ */}
      <nav className="flex flex-col gap-[2px] px-[8px] flex-1 overflow-y-auto overflow-x-hidden py-[4px]">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className="block"
          >
            {({ isActive }) => (
              <div
                className={`
                  flex items-center gap-[10px] px-[10px] py-[9px] rounded-[8px]
                  text-[13px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap
                  ${collapsed ? 'justify-center' : ''}
                  ${!isActive ? 'hover:bg-white/[0.04]' : ''}
                `}
                style={{
                  background: isActive ? accent.activeBg : 'transparent',
                  color:      isActive ? accent.activeText : '',
                }}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="flex-1 animate-in fade-in duration-150">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: accent.dot }} />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ══ USER CARD ══ */}
      <div ref={menuRef} className="relative">
        <div className="h-[1px] mx-[8px]" style={{ background: '#1f1f1f' }} />

        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className={`w-full flex items-center gap-[10px] px-[12px] py-[13px] cursor-pointer transition-colors duration-150 hover:bg-white/[0.03] ${collapsed ? 'justify-center' : ''}`}
        >
          {user?.photo ? (
            <img
              src={user.photo}
              alt="avatar"
              className="rounded-full object-cover shrink-0"
              style={{ width: 34, height: 34, border: `2px solid ${accent.avatar}` }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center font-bold shrink-0 text-[13px]"
              style={{ width: 34, height: 34, background: accent.avatar, boxShadow: `0 0 10px ${accent.avatar}55` }}
            >
              {initials}
            </div>
          )}

          {!collapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1 text-left animate-in fade-in duration-150">
                <span className="text-[13px] font-semibold  truncate leading-tight">
                  {user?.prenom} {user?.nom}
                </span>
                <span className="text-[11px] truncate" style={{ color: '#555' }}>
                  {user?.email}
                </span>
              </div>
              <ChevronRight size={14} style={{ color: '#444' }} className="shrink-0" />
            </>
          )}
        </button>

        {/* ══ DROPDOWN ══ */}
        {menuOpen && !collapsed && (
          <div
            className="absolute bottom-[calc(100%+6px)] left-[8px] right-[8px] rounded-[12px] overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.6)' }}
          >
            {/* Header */}
            <div className="flex  items-center gap-[10px] px-[14px] py-[12px]" style={{ borderBottom: '1px solid #222' }}>
              <div
                className="w-[36px] h-[36px] rounded-full text-white flex items-center justify-center font-bold text-[13px] shrink-0"
                style={{ background: accent.avatar, boxShadow: `0 0 10px ${accent.avatar}55` }}
              >
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold truncate">
                  {user?.prenom} {user?.nom}
                </span>
                <span className="text-[11px] truncate" style={{ color: '#555' }}>
                  {user?.email}
                </span>
                <span className={`inline-flex items-center mt-[4px] self-start text-[10px] font-semibold px-[7px] py-[1px] rounded-full border ${roleM.bg} ${roleM.border} ${roleM.textClass}`}>
                  {roleM.label}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="py-[6px]">
              {[
                { icon: <UserCircle size={15}/>,  label: 'Mon Profil',    to: '/profil' },
                { icon: <Settings size={15}/>,    label: 'Paramètres',    to: '/parametres' },
              ].map(({ icon, label, to }) => (
                <button
                  key={to}
                  onClick={() => { setMenuOpen(false); navigate(to); }}
                  className="w-full flex items-center gap-[10px] px-[14px] py-[9px] text-[13px] transition-colors duration-100 hover:bg-white/[0.05] text-left"
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Déconnexion */}
            <div style={{ borderTop: '1px solid #222' }} className="py-[6px]">
              <button
                onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                className="w-full flex items-center gap-[10px] px-[14px] py-[9px] text-[13px] transition-colors duration-100 hover:bg-[#dc2626]/10"
                style={{ color: '#dc2626' }}
              >
                <LogOut size={15}/>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}