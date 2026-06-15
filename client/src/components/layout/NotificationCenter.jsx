import { useSocketContext } from '../../context/SocketContext';
import { useAlertesContext } from '../../context/AlertesContext';
import { useState, useEffect, useRef, } from 'react';
import { Link } from 'react-router-dom'
import { Bell, CheckCircle, ClipboardList } from 'lucide-react';

const TYPE_ICONS = {
  alerte_stock:      '🔴',
  stock_faible:      '⚠️',
  commande_livree:   '📦',
  NOUVELLE_COMMANDE: <ClipboardList icon={18} />,
  COMMANDE_VALIDEE:  <CheckCircle icon={18} />,
  COMMANDE_REJETEE:  '❌',
  RUPTURE_STOCK:     '🚨',
  EXPIRATION:        '📅',
  peremption:        '📅',
  test:              <Bell icon={18} />,
};

export default function NotificationCenter() {
  const { connected } = useSocketContext();
  const { alertes, nonLues, marquerToutesLues } = useAlertesContext();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const notifsFiltrees = alertes.filter(a => !a.lu);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <Bell size={20} />
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-zinc-950 animate-in zoom-in">
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[420px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">

          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-semibold text-dynamic text-zinc-900 dark:text-zinc-50">
              Notifications {nonLues > 0 && `(${nonLues})`}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] flex items-center gap-1 ${connected ? 'text-emerald-500' : 'text-red-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                {connected ? 'Temps réel' : 'Hors ligne'}
              </span>
              {nonLues > 0 && (
                <button
                  onClick={marquerToutesLues}
                  className="text-[12px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer transition-colors"
                >
                  Tout marquer lu
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifsFiltrees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2 opacity-30">🔕</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">Aucune notification</p>
              </div>
            ) : (
              notifsFiltrees.map((n) => (
                <div key={n.id_alerte} className="flex items-start gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <span className="text-lg mt-0.5 shrink-0">
                    {TYPE_ICONS[n.type_alerte] ?? '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 m-0 leading-snug">{n.message}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 m-0">
                      {new Date(n.createdAt).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {nonLues > 0 && (
            <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-900">
              <Link to="/alertes" onClick={() => setOpen(false)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline no-underline font-medium">
                Voir toutes les alertes →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}