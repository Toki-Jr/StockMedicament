import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';
import api from '../../services/axios.instance';
import { LayoutDashboard, Pill, Package, ArrowUpDown, ShoppingCart, Bell, LogOut, ChevronLeft } from 'lucide-react';

const ROUTE_TITLES = {
  '/dashboard':   { label: 'Tableau de bord', icon: <LayoutDashboard size={25}/> },
  '/medicaments': { label: 'Médicaments',     icon: <Pill size={25}/> },
  '/lots':        { label: 'Lots',            icon: <Package size={25}/> },
  '/mouvements':  { label: 'Mouvements',      icon: <ArrowUpDown size={25}/>  },
  '/commandes':   { label: 'Commandes',       icon: <ShoppingCart size={25}/> },
  '/alertes':     { label: 'Alertes',         icon: <Bell size={25}/> },
};

export default function Navbar() {
  const location  = useLocation();
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(0);
  const [greeting, setGreeting] = useState('');

  const page = ROUTE_TITLES[location.pathname] ?? { label: 'StockMed', icon: '💊' };

  // Déterminer la salutation (Bonjour / Bonsoir) selon l'heure
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const salutation = hour < 12 ? 'Bonjour' : 'Bonsoir';
      
      // Si le prénom existe dans le contexte (ex: user.prenom), on l'affiche, sinon fallback sur Tokinirina
      const name = user?.nom;
      const lastname = user?.prenom;
      setGreeting(`${salutation}, ${name} ${lastname}`);
    };

    updateGreeting();
    // Optionnel: On recalcule toutes les minutes au cas où l'utilisateur passe le cap de midi la page ouverte
    const interval = setInterval(updateGreeting, 60000); 
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchCount = () => {
      api.get('/alertes/non-lues')
        .then(res => setAlertCount(res.data?.count ?? 0))
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval); 
  }, [location.pathname]);

  return (
    <header className="h-[60px] bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-10 shadow-[var(--shadow)] shrink-0 select-none cursor-default">

      {/* ── Titre de la page ── */}
      <div className="flex items-center gap-[10px]">
        <span className="text-[20px] flex items-center">{page.icon}</span>
        <h1 className="font-['Syne'] text-[18px] font-bold text-[var(--text-primary)] m-0">
          {page.label}
        </h1>
      </div>

      {/* ── Actions droite (Message d'accueil + Notifications + Thème) ── */}
      <div className="flex items-center gap-[14px]">
        
        {/* Souhait de bienvenue */}
        <span className="text-[13px] font-medium text-[var(--text-muted)] tracking-wide hidden sm:block">
          {greeting}
        </span>

        {/* Séparateur pour isoler le message si affiché */}
        <div className="w-[1px] h-[16px] bg-[var(--border)] hidden sm:block" />

        {/* Bouton alerte */}
        <Link 
          to="/alertes" 
          className="relative flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-[var(--bg-hover)] border border-[var(--border)] cursor-pointer no-underline transition-colors hover:brightness-95"
          title="Alertes non lues"
        >
          <span className="text-[18px] flex items-center"><Bell size={22}/></span>
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#dc2626] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-[var(--bg-card)] animate-in zoom-in">
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
    </header>
  );
}