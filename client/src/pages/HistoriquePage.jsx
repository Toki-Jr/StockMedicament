import { useState, useEffect } from 'react';
import { getHistoriques, deleteHistorique, deleteAllHistoriques } from '../services/historique.api';
import { History, Filter, Loader2, Trash2, X, ShieldAlert, Clock } from 'lucide-react';

const C = {
  indigo:     '#6366f1',
  indigoSoft: 'rgba(99,102,241,0.10)',
  indigoBdr:  'rgba(99,102,241,0.25)',
  red:        '#dc2626',
  redSoft:    'rgba(220,38,38,0.10)',
  redBdr:     'rgba(220,38,38,0.25)',
  green:      '#22c55e',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.10)',
  greenBdr:   'rgba(34,197,94,0.25)',
  orange:     '#f97316',
  orangeSoft: 'rgba(249,115,22,0.10)',
  blue:       '#0ea5e9',
  blueSoft:   'rgba(14,165,233,0.10)',
};

const ACTION_META = {
  CONNEXION:        { label: 'Connexion',         color: C.indigo,    bg: C.indigoSoft  },
  INSCRIPTION:      { label: 'Inscription',       color: C.blue,      bg: C.blueSoft    },
  COMMANDE_CREEE:   { label: 'Commande créée',    color: C.orange,    bg: C.orangeSoft  },
  COMMANDE_ENVOYEE: { label: 'Commande envoyée',  color: C.blue,      bg: C.blueSoft    },
  COMMANDE_VALIDEE: { label: 'Commande validée',  color: C.greenDark, bg: C.greenSoft   },
  COMMANDE_REJETEE: { label: 'Commande rejetée',  color: C.red,       bg: C.redSoft     },
  USER_SUPPRIME:    { label: 'User supprimé',     color: C.red,       bg: C.redSoft     },
  USER_APPROUVE:    { label: 'User approuvé',     color: C.greenDark, bg: C.greenSoft   },
  USER_MODIFIE:     { label: 'User modifié',      color: C.orange,    bg: C.orangeSoft  },
};

const getMeta = (action) => ACTION_META[action] ?? {
  label: action, color: '#6b7280', bg: 'rgba(107,114,128,0.10)',
};

const groupByDate = (items) => {
  return items.reduce((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
};

export default function HistoriquePage() {
  const [historiques,  setHistoriques]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filtreAction, setFiltreAction] = useState('');
  const [filtreDate,   setFiltreDate]   = useState('');
  const [confirmAll,   setConfirmAll]   = useState(false);
  const [toast,        setToast]        = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoriques({
        ...(filtreAction ? { action: filtreAction } : {}),
        ...(filtreDate   ? { date:   filtreDate   } : {}),
      });
      setHistoriques(data);
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filtreAction, filtreDate]);

  const grouped = groupByDate(historiques);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistorique(id);
      setHistoriques(prev => prev.filter(h => h.id_historique !== id));
      showToast('Ligne supprimée');
    } catch { showToast('Erreur', 'error'); }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllHistoriques();
      setHistoriques([]);
      setConfirmAll(false);
      showToast('Historique effacé');
    } catch { showToast('Erreur', 'error'); }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg flex items-center gap-2"
             style={{ background: toast.type === 'error' ? C.red : C.greenDark }}>
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: C.indigo }} />
            <span className="text-dynamic font-medium uppercase tracking-wider" style={{ color: C.indigo }}>
              Journal système
            </span>
          </div>
          <h1 className="text-[22px] font-medium text-[var(--text-primary)]">
            Historique des <span style={{ color: C.indigo }}>actions</span>
          </h1>
          <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
            {historiques.length} action(s) enregistrée(s)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtre action */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
               style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
            <Filter size={13} color="var(--text-muted)" />
            <select
              className="text-dynamic outline-none border-none bg-transparent text-[var(--text-primary)] cursor-pointer"
              value={filtreAction}
              onChange={e => setFiltreAction(e.target.value)}>
              <option value="">Toutes les actions</option>
              {Object.entries(ACTION_META).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Filtre date */}
          <input
            type="date"
            className="px-3 py-2 rounded-lg text-dynamic outline-none cursor-pointer"
            style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
            value={filtreDate}
            onChange={e => setFiltreDate(e.target.value)}
          />

          {(filtreAction || filtreDate) && (
            <button
              onClick={() => { setFiltreAction(''); setFiltreDate(''); }}
              className="px-3 py-2 rounded-lg text-dynamic cursor-pointer border-none"
              style={{ background: C.redSoft, color: C.red }}>
              Réinitialiser
            </button>
          )}

          {/* Effacer tout */}
          <button
            onClick={() => setConfirmAll(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-dynamic font-medium border-none cursor-pointer"
            style={{ background: C.redSoft, color: C.red, border: `0.5px solid ${C.redBdr}` }}>
            <Trash2 size={13} /> Effacer tout
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 rounded-lg text-dynamic"
             style={{ background: C.redSoft, color: C.red, border: `1px solid ${C.redBdr}` }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin" size={28} color={C.indigo} />
          <p className="text-dynamic text-[var(--text-muted)]">Chargement…</p>
        </div>
      ) : historiques.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl"
             style={{ border: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
               style={{ background: C.indigoSoft }}>
            <History size={24} color={C.indigo} />
          </div>
          <p className="text-dynamic font-medium text-[var(--text-primary)]">Aucun historique trouvé</p>
          <p className="text-dynamic text-[var(--text-muted)] mt-1">Les actions apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>

              {/* ── Séparateur date style dashboard ── */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-dynamic font-medium uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ background: C.indigoSoft, color: C.indigo, border: `0.5px solid ${C.indigoBdr}` }}>
                  {date}
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-dynamic text-[var(--text-muted)]">{items.length} action(s)</span>
              </div>

              {/* ── Card style activité récente ── */}
              <div className="rounded-xl overflow-hidden"
                   style={{ border: '0.5px solid var(--border)' }}>
                {items.map((h, i) => {
                  const meta = getMeta(h.action);
                  return (
                    <div
                      key={h.id_historique}
                      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[rgba(99,102,241,0.03)]"
                      style={{
                        borderBottom: i === items.length - 1 ? 'none' : '0.5px solid var(--border)',
                        borderLeft:   `3px solid ${meta.color}`,
                      }}>

                      {/* Badge action */}
                      <span className="text-dynamic font-medium px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap"
                            style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>

                      {/* Description */}
                      <p className="flex-1 text-dynamic text-[var(--text-primary)] min-w-0 truncate">
                        {h.description}
                      </p>

                      {/* Utilisateur */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-dynamic font-medium text-white shrink-0"
                             style={{ background: C.indigo }}>
                          {h.user?.nom?.[0]}{h.user?.prenom?.[0]}
                        </div>
                        <span className="text-dynamic text-[var(--text-muted)] hidden sm:block">
                          {h.user?.nom} {h.user?.prenom}
                        </span>
                        <span className="text-dynamic px-1.5 py-0.5 rounded-full hidden sm:block"
                              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                          {h.user?.role}
                        </span>
                      </div>

                      {/* Heure */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock size={11} color="var(--text-muted)" />
                        <span className="text-dynamic font-mono text-[var(--text-muted)]">
                          {new Date(h.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(h.id_historique)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer border-none shrink-0 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
                        style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}
                        title="Supprimer">
                        <Trash2 size={12} color={C.red} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal confirm suppression tout ── */}
      {confirmAll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--bg-content)] rounded-[16px] w-full max-w-[400px] shadow-2xl overflow-hidden"
               style={{ border: '0.5px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
              <h2 className="text-dynamic font-medium text-[var(--text-primary)]">Effacer l'historique</h2>
              <button onClick={() => setConfirmAll(false)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
            <div className="p-5 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}>
                <Trash2 size={24} color={C.red} />
              </div>
              <p className="text-dynamic font-medium text-[var(--text-primary)]">
                Supprimer <strong>tout</strong> l'historique ?
              </p>
              <p className="text-dynamic text-[var(--text-muted)] mt-1">
                Cette action est irréversible.
              </p>
            </div>
            <div className="px-5 py-4 flex gap-2.5 justify-end"
                 style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
              <button onClick={() => setConfirmAll(false)}
                      className="px-4 py-2 rounded-lg text-dynamic font-medium cursor-pointer"
                      style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                Annuler
              </button>
              <button onClick={handleDeleteAll}
                      className="px-4 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer"
                      style={{ background: C.red }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}