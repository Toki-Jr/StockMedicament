import { useState } from 'react';
import { useAlertes } from '../hooks/useAlertes';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle, Bell, Calendar, CalendarDays,
  Mail, CheckCheck, Trash2, Check, Package,
  ShieldAlert, ClipboardList
} from 'lucide-react';

/* ─── Meta par type d'alerte configuré pour Tailwind ─── */
const TYPE_META = {
  peremption: { 
    label: 'Péremption', Icon: Calendar, 
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30', 
    leftBdr: 'border-l-red-500' 
  },
  EXPIRATION: { 
    label: 'Expiration', Icon: Calendar, 
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30', 
    leftBdr: 'border-l-red-500' 
  },
  stock_faible: { 
    label: 'Stock faible', Icon: AlertTriangle, 
    badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30', 
    leftBdr: 'border-l-orange-500' 
  },
  RUPTURE_STOCK: { 
    label: 'Rupture stock', Icon: Package, 
    badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30', 
    leftBdr: 'border-l-orange-500' 
  },
  NOUVELLE_COMMANDE: { 
    label: 'Nouvelle commande', Icon: ClipboardList, 
    badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30', 
    leftBdr: 'border-l-indigo-500' 
  },
  COMMANDE_VALIDEE: { 
    label: 'Commande validée', Icon: Bell, 
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30', 
    leftBdr: 'border-l-emerald-600' 
  },
  COMMANDE_REJETEE: { 
    label: 'Commande rejetée', Icon: Bell, 
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30', 
    leftBdr: 'border-l-red-500' 
  },
};

const getMeta = (type) => TYPE_META[type] ?? {
  label: type, Icon: Bell,
  badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
  leftBdr: 'border-l-emerald-600',
};

/* ─── Filtres selon rôle ─── */
const FILTRES_PAR_ROLE = {
  admin: [
    { val: '',                  label: 'Toutes'           },
    { val: 'NOUVELLE_COMMANDE', label: 'Nouvelles cdes'   },
    { val: 'RUPTURE_STOCK',     label: 'Rupture stock'    },
    { val: 'EXPIRATION',        label: 'Expiration'       },
  ],
  pharmacien: [
    { val: '',                  label: 'Toutes'           },
    { val: 'COMMANDE_VALIDEE',  label: 'Cdes validées'    },
    { val: 'COMMANDE_REJETEE',  label: 'Cdes rejetées'    },
    { val: 'stock_faible',      label: 'Stock faible'     },
    { val: 'peremption',        label: 'Péremption'       },
  ],
  user: [
    { val: '',                  label: 'Toutes'           },
    { val: 'COMMANDE_VALIDEE',  label: 'Cdes validées'    },
    { val: 'COMMANDE_REJETEE',  label: 'Cdes rejetées'    },
  ],
};

/* ─── Stats selon rôle ─── */
const getStats = (alertes, nonLues, role) => {
  const base = [
    { icon: <Bell size={18} />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', label: 'Total', value: alertes.length, valueColor: 'text-emerald-600 dark:text-emerald-400' },
    { icon: <Mail size={18} />, iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400', label: 'Non lues', value: nonLues, valueColor: 'text-red-500 dark:text-red-400' },
  ];

  if (role === 'admin') return [
    ...base,
    {
      icon: <ClipboardList size={18} />, iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400',
      label: 'Nouvelles cdes',
      value: alertes.filter(a => a.type_alerte === 'NOUVELLE_COMMANDE').length,
      valueColor: 'text-indigo-500 dark:text-indigo-400',
    },
    {
      icon: <Package size={18} />, iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400',
      label: 'Ruptures',
      value: alertes.filter(a => a.type_alerte === 'RUPTURE_STOCK').length,
      valueColor: 'text-orange-500 dark:text-orange-400',
    },
  ];

  if (role === 'pharmacien') return [
    ...base,
    {
      icon: <CalendarDays size={18} />, iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400',
      label: 'Péremptions',
      value: alertes.filter(a => ['peremption', 'EXPIRATION'].includes(a.type_alerte)).length,
      valueColor: 'text-red-500 dark:text-red-400',
    },
    {
      icon: <AlertTriangle size={18} />, iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400',
      label: 'Stock faible',
      value: alertes.filter(a => a.type_alerte === 'stock_faible').length,
      valueColor: 'text-orange-500 dark:text-orange-400',
    },
  ];

  return [
    ...base,
    {
      icon: <Bell size={18} />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      label: 'Validées',
      value: alertes.filter(a => a.type_alerte === 'COMMANDE_VALIDEE').length,
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: <Bell size={18} />, iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400',
      label: 'Rejetées',
      value: alertes.filter(a => a.type_alerte === 'COMMANDE_REJETEE').length,
      valueColor: 'text-red-500 dark:text-red-400',
    },
  ];
};

/* ══════════════════════════════════════════════ */
export default function AlertesPage() {
  const {
    alertes, nonLues, loading, error,
    filtre, setFiltre,
    marquerLu, marquerToutesLues, remove,
  } = useAlertes();

  const { user } = useAuth();
  const role     = user?.role ?? 'user';

  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarquerLu = async (id) => {
    try   { await marquerLu(id); showToast('Alerte marquée comme lue'); }
    catch { showToast('Erreur', 'error'); }
  };

  const handleToutesLues = async () => {
    setSaving(true);
    try   { await marquerToutesLues(); showToast('Toutes les alertes marquées comme lues'); }
    catch { showToast('Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try   { await remove(id); showToast('Alerte supprimée'); }
    catch { showToast('Erreur', 'error'); }
  };

  const filtres = FILTRES_PAR_ROLE[role] ?? FILTRES_PAR_ROLE.user;
  const stats   = getStats(alertes, nonLues, role);

  const FILTRES_LU = [
    { val: '',      label: 'Toutes'   },
    { val: 'false', label: 'Non lues' },
    { val: 'true',  label: 'Lues'     },
  ];

  const titreRole = {
    admin:      { icon: <ShieldAlert size={20} />, sub: 'Vue administrateur — commandes & stocks' },
    pharmacien: { icon: <Bell size={20} />,        sub: 'Vos alertes stock et retours commandes'  },
    user:       { icon: <Bell size={20} />,        sub: 'Retours sur vos commandes'               },
  }[role] ?? { icon: <Bell size={20} />, sub: '' };

  return (
    <div className="h-screen flex flex-col gap-5 p-6 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white font-medium shadow-lg text-dynamic transition-all duration-200 ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-700'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            {titreRole.icon}
            {nonLues > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-medium flex items-center justify-center text-white bg-red-500">
                {nonLues > 9 ? '9+' : nonLues}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-dynamic font-medium tracking-tight leading-tight text-gray-900 dark:text-white">
              Mes <span className="text-emerald-700 dark:text-emerald-400 font-bold">alertes</span>
            </h1>
            <p className="text-dynamic text-gray-500 dark:text-neutral-400 mt-0.5">{titreRole.sub}</p>
          </div>
        </div>

        {nonLues > 0 && (
          <button
            onClick={handleToutesLues}
            disabled={saving}
            className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg font-medium text-white border-none cursor-pointer bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 transition-colors text-dynamic"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckCheck size={15} /> Tout marquer comme lu</>
            }
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-2 flex-wrap items-center px-4 py-3 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800">
        {/* Filtre par type */}
        <div className="flex gap-1.5 flex-wrap flex-1 text-dynamic">
          {filtres.map(f => {
            const active = filtre.type_alerte === f.val;
            return (
              <button
                key={f.val}
                onClick={() => setFiltre(p => ({ ...p, type_alerte: f.val }))}
                className={`px-3.5 py-1.5 rounded-full font-medium cursor-pointer border transition-all duration-150 text-dynamic ${
                  active 
                    ? 'bg-emerald-700 text-white border-transparent' 
                    : 'bg-transparent text-gray-600 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Séparateur */}
        <div className="w-px h-5 shrink-0 bg-gray-200 dark:bg-neutral-800" />

        {/* Filtre lu/non lu */}
        <div className="flex gap-1.5 text-dynamic">
          {FILTRES_LU.map(f => {
            const active = filtre.lu === f.val;
            return (
              <button
                key={f.val}
                onClick={() => setFiltre(p => ({ ...p, lu: f.val }))}
                className={`px-3.5 py-1.5 rounded-full font-medium cursor-pointer border transition-all duration-150 text-dynamic ${
                  active 
                    ? 'bg-emerald-700 text-white border-transparent' 
                    : 'bg-transparent text-gray-600 dark:text-neutral-300 border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 rounded-lg text-dynamic bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
          {error}
        </div>
      )}

      {/* ── Liste (Avec Scroll) ── */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
        {loading ? (
          <div className="text-center py-20 text-gray-400 dark:text-neutral-500 italic text-dynamic">
            Chargement des alertes…
          </div>
        ) : alertes.length === 0 ? (
          <div className="text-center py-20 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/30 dark:bg-transparent">
            <div className="text-4xl mb-3 opacity-20">🔕</div>
            <p className="font-medium text-gray-900 dark:text-white text-dynamic">Aucune alerte</p>
            <p className="text-gray-400 mt-1 text-dynamic">Tout est sous contrôle !</p>
          </div>
        ) : (
          alertes.map(alerte => {
            const meta      = getMeta(alerte.type_alerte);
            const { Icon }  = meta;
            return (
              <div
                key={alerte.id_alerte}
                className={`flex items-start justify-between gap-4 px-5 py-4 border border-l-[3px] border-gray-200 dark:border-neutral-800 ${meta.leftBdr} rounded-r-xl bg-white dark:bg-neutral-900/40 transition-opacity duration-200 ${
                  alerte.lu ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Icône */}
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${meta.badge}`}>
                  <Icon size={16} />
                </div>

                {/* Corps */}
                <div className="flex-1 min-w-0 text-dynamic">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5 text-dynamic">
                    <span className={`font-medium px-2 py-0.5 rounded-full border text-dynamic ${meta.badge}`}>
                      {meta.label}
                    </span>
                    {!alerte.lu && (
                      <span className="font-medium px-2 py-0.5 rounded-full border bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/20 text-dynamic">
                        Nouveau
                      </span>
                    )}
                    {alerte.medicament?.nom && (
                      <span className="font-mono font-medium px-2 py-0.5 rounded border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/20 text-dynamic">
                        {alerte.medicament.nom}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed mb-1 text-gray-900 dark:text-white font-medium text-dynamic">
                    {alerte.message}
                  </p>
                  <p className="text-gray-400 dark:text-neutral-500 text-dynamic">
                    {new Date(alerte.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 mt-0.5 text-dynamic">
                  {!alerte.lu && (
                    <button
                      onClick={() => handleMarquerLu(alerte.id_alerte)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded border font-medium cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-dynamic"
                    >
                      <Check size={12} /> Lu
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(alerte.id_alerte)}
                    className="w-[30px] h-[30px] flex items-center justify-center rounded border cursor-pointer bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-dynamic"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-200 dark:border-neutral-800">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className={`font-bold leading-none text-dynamic ${valueColor}`}>
          {value}
        </div>
        <div className="text-gray-400 dark:text-neutral-500 uppercase font-semibold tracking-wider mt-1 text-dynamic">
          {label}
        </div>
      </div>
    </div>
  );
}