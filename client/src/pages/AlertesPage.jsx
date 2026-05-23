import { useState } from 'react';
import { useAlertes } from '../hooks/useAlertes';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle, Bell, Calendar, CalendarDays,
  Mail, CheckCheck, Trash2, Check, Package,
  ShieldAlert, ClipboardList
} from 'lucide-react';

/* ─── Palette ─── */
const C = {
  green:      '#22c55e',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.10)',
  greenBdr:   'rgba(34,197,94,0.25)',
  orange:     '#f97316',
  orangeSoft: 'rgba(249,115,22,0.10)',
  orangeBdr:  'rgba(249,115,22,0.25)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.10)',
  redBdr:     'rgba(239,68,68,0.25)',
  indigo:     '#6366f1',
  indigoSoft: 'rgba(99,102,241,0.10)',
  indigoBdr:  'rgba(99,102,241,0.25)',
};

/* ─── Meta par type d'alerte ─── */
const TYPE_META = {
  peremption:        { label: 'Péremption',        Icon: Calendar,       color: C.red,    bg: C.redSoft,    bdr: C.redBdr,    left: C.red    },
  EXPIRATION:        { label: 'Expiration',         Icon: Calendar,       color: C.red,    bg: C.redSoft,    bdr: C.redBdr,    left: C.red    },
  stock_faible:      { label: 'Stock faible',       Icon: AlertTriangle,  color: C.orange, bg: C.orangeSoft, bdr: C.orangeBdr, left: C.orange },
  RUPTURE_STOCK:     { label: 'Rupture stock',      Icon: Package,        color: C.orange, bg: C.orangeSoft, bdr: C.orangeBdr, left: C.orange },
  NOUVELLE_COMMANDE: { label: 'Nouvelle commande',  Icon: ClipboardList,  color: C.indigo, bg: C.indigoSoft, bdr: C.indigoBdr, left: C.indigo },
  COMMANDE_VALIDEE:  { label: 'Commande validée',   Icon: Bell,           color: C.green,  bg: C.greenSoft,  bdr: C.greenBdr,  left: C.green  },
  COMMANDE_REJETEE:  { label: 'Commande rejetée',   Icon: Bell,           color: C.red,    bg: C.redSoft,    bdr: C.redBdr,    left: C.red    },
};

const getMeta = (type) => TYPE_META[type] ?? {
  label: type, Icon: Bell,
  color: C.green, bg: C.greenSoft, bdr: C.greenBdr, left: C.green,
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
    { icon: <Bell size={18} color={C.green} />,   iconBg: C.greenSoft, label: 'Total',    value: alertes.length, valueColor: C.green },
    { icon: <Mail size={18} color={C.red} />,     iconBg: C.redSoft,   label: 'Non lues', value: nonLues,        valueColor: C.red   },
  ];

  if (role === 'admin') return [
    ...base,
    {
      icon: <ClipboardList size={18} color={C.indigo} />, iconBg: C.indigoSoft,
      label: 'Nouvelles cdes',
      value: alertes.filter(a => a.type_alerte === 'NOUVELLE_COMMANDE').length,
      valueColor: C.indigo,
    },
    {
      icon: <Package size={18} color={C.orange} />, iconBg: C.orangeSoft,
      label: 'Ruptures',
      value: alertes.filter(a => a.type_alerte === 'RUPTURE_STOCK').length,
      valueColor: C.orange,
    },
  ];

  if (role === 'pharmacien') return [
    ...base,
    {
      icon: <CalendarDays size={18} color={C.red} />, iconBg: C.redSoft,
      label: 'Péremptions',
      value: alertes.filter(a => ['peremption', 'EXPIRATION'].includes(a.type_alerte)).length,
      valueColor: C.red,
    },
    {
      icon: <AlertTriangle size={18} color={C.orange} />, iconBg: C.orangeSoft,
      label: 'Stock faible',
      value: alertes.filter(a => a.type_alerte === 'stock_faible').length,
      valueColor: C.orange,
    },
  ];

  // user
  return [
    ...base,
    {
      icon: <Bell size={18} color={C.green} />, iconBg: C.greenSoft,
      label: 'Validées',
      value: alertes.filter(a => a.type_alerte === 'COMMANDE_VALIDEE').length,
      valueColor: C.green,
    },
    {
      icon: <Bell size={18} color={C.red} />, iconBg: C.redSoft,
      label: 'Rejetées',
      value: alertes.filter(a => a.type_alerte === 'COMMANDE_REJETEE').length,
      valueColor: C.red,
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
  const isAdmin  = role === 'admin';

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

  /* titre selon rôle */
  const titreRole = {
    admin:      { icon: <ShieldAlert size={20} color={C.green} />, sub: 'Vue administrateur — commandes & stocks' },
    pharmacien: { icon: <Bell size={20} color={C.green} />,        sub: 'Vos alertes stock et retours commandes'  },
    user:       { icon: <Bell size={20} color={C.green} />,        sub: 'Retours sur vos commandes'               },
  }[role] ?? { icon: <Bell size={20} color={C.green} />, sub: '' };

  return (
    <div className="flex flex-col gap-5 p-6 min-h-screen">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white text-[13px] font-medium shadow-lg"
          style={{ background: toast.type === 'error' ? C.red : C.greenDark }}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 relative"
            style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}
          >
            {titreRole.icon}
            {nonLues > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-medium flex items-center justify-center text-white"
                style={{ background: C.red }}
              >
                {nonLues > 9 ? '9+' : nonLues}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
              Mes <span style={{ color: C.green }}>alertes</span>
            </h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{titreRole.sub}</p>
          </div>
        </div>

        {nonLues > 0 && (
          <button
            onClick={handleToutesLues}
            disabled={saving}
            className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-medium text-white border-none cursor-pointer disabled:opacity-60"
            style={{ background: C.greenDark }}
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
      <div
        className="flex gap-2 flex-wrap items-center px-4 py-3 rounded-xl"
        style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}
      >
        {/* Filtre par type */}
        <div className="flex gap-1.5 flex-wrap flex-1">
          {filtres.map(f => {
            const active = filtre.type_alerte === f.val;
            return (
              <button
                key={f.val}
                onClick={() => setFiltre(p => ({ ...p, type_alerte: f.val }))}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border-none transition-all duration-150"
                style={{
                  background: active ? C.greenDark : 'transparent',
                  color:      active ? '#fff' : 'var(--text-muted)',
                  border:     active ? 'none' : '0.5px solid var(--border)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Séparateur */}
        <div className="w-px h-5 shrink-0" style={{ background: 'var(--border)' }} />

        {/* Filtre lu/non lu */}
        <div className="flex gap-1.5">
          {FILTRES_LU.map(f => {
            const active = filtre.lu === f.val;
            return (
              <button
                key={f.val}
                onClick={() => setFiltre(p => ({ ...p, lu: f.val }))}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border-none transition-all duration-150"
                style={{
                  background: active ? C.greenDark : 'transparent',
                  color:      active ? '#fff' : 'var(--text-muted)',
                  border:     active ? 'none' : '0.5px solid var(--border)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-[13px]"
          style={{ background: C.redSoft, color: C.red, border: `0.5px solid ${C.redBdr}` }}
        >
          {error}
        </div>
      )}

      {/* ── Liste ── */}
      {loading ? (
        <div className="text-center py-20 text-[13px] italic text-[var(--text-muted)]">
          Chargement des alertes…
        </div>
      ) : alertes.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl"
          style={{ border: '0.5px solid var(--border)' }}
        >
          <div className="text-[40px] mb-3 opacity-20">🔕</div>
          <p className="font-medium text-[14px] text-[var(--text-primary)]">Aucune alerte</p>
          <p className="text-[12px] mt-1 text-[var(--text-muted)]">Tout est sous contrôle !</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alertes.map(alerte => {
            const meta      = getMeta(alerte.type_alerte);
            const { Icon }  = meta;
            return (
              <div
                key={alerte.id_alerte}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-opacity duration-200"
                style={{
                  background:   'var(--bg-content)',
                  border:       '0.5px solid var(--border)',
                  borderLeft:   `3px solid ${meta.left}`,
                  borderRadius: '0 12px 12px 0',
                  opacity:      alerte.lu ? 0.45 : 1,
                }}
              >
                {/* Icône */}
                <div
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: meta.bg, border: `0.5px solid ${meta.bdr}` }}
                >
                  <Icon size={17} color={meta.color} />
                </div>

                {/* Corps */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.bdr}` }}
                    >
                      {meta.label}
                    </span>
                    {!alerte.lu && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: C.redSoft, color: C.red, border: `0.5px solid ${C.redBdr}` }}
                      >
                        Nouveau
                      </span>
                    )}
                    {alerte.medicament?.nom && (
                      <span
                        className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[5px]"
                        style={{ background: C.greenSoft, color: C.greenDark, border: `0.5px solid ${C.greenBdr}` }}
                      >
                        {alerte.medicament.nom}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed mb-1 text-[var(--text-primary)]">
                    {alerte.message}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {new Date(alerte.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  {!alerte.lu && (
                    <button
                      onClick={() => handleMarquerLu(alerte.id_alerte)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[11px] font-medium cursor-pointer border-none"
                      style={{ background: C.greenSoft, color: C.greenDark, border: `0.5px solid ${C.greenBdr}` }}
                    >
                      <Check size={12} /> Lu
                    </button>
                  )}
                  {/* Seul l'admin peut supprimer */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(alerte.id_alerte)}
                      className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] cursor-pointer border-none"
                      style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}
                      title="Supprimer"
                    >
                      <Trash2 size={13} color={C.red} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
      style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}
    >
      <div
        className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[21px] font-medium leading-none" style={{ color: valueColor }}>
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wide mt-1 text-[var(--text-muted)]">
          {label}
        </div>
      </div>
    </div>
  );
}