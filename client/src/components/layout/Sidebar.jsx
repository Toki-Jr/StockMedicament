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
      { to: '/lots',        icon: <Package size={15}/>,     label: 'Lots'       },
      { to: '/mouvements',  icon: <ArrowUpDown size={15}/>, label: 'Mouvements', roles: ['admin']},
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
    roles: ['admin', 'pharmacien', 'user'],
    items: [
      { to: '/history',    icon: <History size={15}/>,  label: 'Historiques', roles: ['admin'] },
      { to: '/parametres', icon: <Settings size={15}/>, label: 'Paramètres',  roles: ['admin', 'pharmacien', 'user'] },
    ]
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [openGroups, setOpenGroups] = useState({ Stock: true, Gestion: true, Système: false });
  const menuRef = useRef(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false); 

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
      className="h-screen flex flex-col sticky top-0 shrink-0 select-none bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-900 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* ── LOGO ── */}
      <div className="p-4 flex items-center justify-between gap-3 h-[60px] border-b border-zinc-200 dark:border-zinc-900">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white shrink-0 bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.2)] dark:shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            S
          </div>
          {!collapsed && (
            <p className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight truncate animate-in fade-in duration-200 text-dynamic">
              Stock<span className="text-emerald-600 dark:text-emerald-400">'méd</span>
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-md shrink-0 cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
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
                className="no-underline group mb-0.5"
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-dynamic ${
                    isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold' 
                      : 'text-zinc-600 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="shrink-0">{group.icon}</span>
                  {!collapsed && <span className="flex-1 truncate text-dynamic">{group.label}</span>}
                  {isActive && !collapsed && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse bg-emerald-600 dark:bg-emerald-400" />
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 cursor-pointer border-none bg-transparent text-dynamic ${
                  groupActive 
                    ? (collapsed ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'text-emerald-700 dark:text-emerald-400 font-semibold') 
                    : 'text-zinc-600 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="shrink-0">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate text-dynamic">{group.label}</span>
                    <ChevronDown
                      size={13}
                      className="shrink-0 transition-transform duration-200 text-zinc-400 dark:text-zinc-500"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </>
                )}
              </button>

              {/* Sous-items */}
              {!collapsed && isOpen && (
                <div className="flex flex-col gap-0.5 ml-3.5 pl-3.5 mb-1 border-l border-zinc-200 dark:border-zinc-900">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="no-underline group"
                    >
                      {({ isActive }) => (
                        <div
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all duration-150 text-dynamic ${
                            isActive 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold' 
                              : 'text-zinc-500 dark:text-white hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <span className="shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{item.icon}</span>
                          <span className="flex-1 truncate text-dynamic">{item.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-600 dark:bg-emerald-400" />
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
      <div ref={menuRef} className="relative p-2 border-t border-zinc-200 dark:border-zinc-900">
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border-none bg-transparent ${collapsed ? 'justify-center' : ''}`}
        >
          {user?.photo ? (
            <img src={user.photo} alt="avatar" className="rounded-full object-cover shrink-0 border-2 border-emerald-600"
                 style={{ width: 32, height: 32 }} />
          ) : (
            <div className="rounded-full flex items-center justify-center font-bold shrink-0 text-white bg-emerald-600 text-dynamic"
                 style={{ width: 32, height: 32 }}>
              {initials}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1 text-left text-dynamic">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight text-dynamic">
                  {user?.prenom} {user?.nom}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 truncate mt-0.5 text-dynamic">
                  {user?.email}
                </span>
              </div>
              <ChevronLeft size={14} className={`text-zinc-400 dark:text-zinc-600 transition-transform duration-200 ${menuOpen ? '-rotate-90' : 'rotate-180'}`} />
            </>
          )}
        </button>

        {/* ── Menu popup overlay ── */}
        {menuOpen && (
          <div className={`absolute bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-md ${collapsed ? 'left-[72px] bottom-2 w-48' : 'left-2 right-2 bottom-[calc(100%+8px)]'}`}>
            {!collapsed && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-900">
                  {user?.photo ? (
                    <img src={user.photo} alt="avatar" className="rounded-full object-cover shrink-0 border-2 border-emerald-600"
                        style={{ width: 32, height: 32 }} />
                  ) : (
                    <div className="rounded-full flex items-center justify-center font-bold shrink-0 text-white bg-emerald-600 text-dynamic"
                        style={{ width: 32, height: 32 }}>
                      {initials}
                    </div>
                  )}
                <div className="flex flex-col min-w-0 text-dynamic">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-dynamic">
                    {user?.prenom} {user?.nom}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 truncate text-dynamic">
                    {user?.email}
                  </span>
                </div>
              </div>
            )}
            <div className="p-1 flex flex-col gap-0.5">
              <button
                onClick={() => { setMenuOpen(false); navigate('/profil'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-lg text-left border-none cursor-pointer bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors text-dynamic"
              >
                <UserCircle size={15} className="text-zinc-400 dark:text-zinc-500" />
                Mon Profil
              </button>

              {/* Ligne Séparatrice & Bouton Déconnexion */}
              <div className="pt-1 mt-1 border-t border-zinc-200 dark:border-zinc-900">
                <button
                  onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 font-medium rounded-lg text-left border-none cursor-pointer bg-transparent text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-dynamic"
                >
                  <LogOut size={15} className="text-red-500" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL GLOBAL DE DÉCONNEXION ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[340px] rounded-xl p-5 border flex flex-col gap-4 shadow-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 animate-in zoom-in-95 duration-150 text-dynamic">
            {/* Header & Icone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30">
                <LogOut size={18} className="text-red-500" />
              </div>
              <div className="text-dynamic">
                <h3 className="font-semibold leading-tight m-0 text-zinc-900 dark:text-zinc-50 text-dynamic">
                  Déconnexion
                </h3>
                <p className="mt-0.5 m-0 text-zinc-400 dark:text-zinc-500 text-dynamic">
                  Souhaitez-vous quitter l'application ?
                </p>
              </div>
            </div>

            {/* Message descriptif */}
            <p className="leading-normal m-0 text-zinc-600 dark:text-zinc-400 text-dynamic">
              Vous devrez vous réauthentifier pour accéder à la gestion des médicaments et des commandes de l'officine.
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 rounded-lg font-medium cursor-pointer border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-dynamic"
              >
                Annuler
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-2 rounded-lg font-semibold text-white border-none cursor-pointer bg-red-600 hover:bg-red-700 transition-colors text-dynamic"
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