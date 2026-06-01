import { useState, useEffect } from 'react';
import { getHistoriques, deleteHistorique, deleteAllHistoriques } from '../services/historique.api';
import { History, Filter, Loader2, Trash2, X, Clock } from 'lucide-react';

const C = {
  indigo:     '#6366f1',
  indigoSoft: 'rgba(99,102,241,0.08)',
  indigoBdr:  'rgba(99,102,241,0.2)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.08)',
  redBdr:     'rgba(239,68,68,0.2)',
  green:      '#22c55e',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.08)',
  greenBdr:   'rgba(34,197,94,0.2)',
  orange:     '#f97316',
  orangeSoft: 'rgba(249,115,22,0.08)',
  blue:       '#3b82f6',
  blueSoft:   'rgba(59,130,246,0.08)',
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
  label: action, color: '#6b7280', bg: 'rgba(107,114,128,0.08)',
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
    <div className="h-screen flex flex-col gap-5 p-6 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900 text-dynamic">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] px-4 py-2.5 rounded-xl border text-white text-dynamic font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4"
             style={{ background: toast.type === 'error' ? C.red : C.greenDark, borderColor: toast.type === 'error' ? C.redBdr : C.greenBdr }}>
          <span className="text-dynamic">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-white bg-transparent border-none cursor-pointer p-0.5"><X size={13} /></button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-dynamic">
        <div className="text-dynamic">
          <div className="flex items-center gap-2 mb-1 text-dynamic">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.indigo }} />
            <span className="text-dynamic font-medium uppercase tracking-wider text-xs" style={{ color: C.indigo }}>
              Journal système
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight leading-tight text-gray-900 dark:text-white text-dynamic">
            Historique des <span className="text-indigo-600 dark:text-indigo-400 font-bold text-dynamic">actions</span>
          </h1>
          <p className="text-dynamic text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
            {historiques.length} action(s) enregistrée(s)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-dynamic">
          {/* Filtre action */}
          <div className="flex items-center gap-1.5 px-3 py-[7px] rounded-lg bg-gray-50 dark:bg-neutral-800/40 border border-gray-200 dark:border-neutral-800 text-dynamic">
            <Filter size={13} className="text-gray-400 dark:text-neutral-500" />
            <select
              className="text-dynamic outline-none border-none bg-transparent text-gray-800 dark:text-neutral-200 text-xs font-medium cursor-pointer"
              value={filtreAction}
              onChange={e => setFiltreAction(e.target.value)}>
              <option value="" className="text-dynamic bg-white dark:bg-neutral-900">Toutes les actions</option>
              {Object.entries(ACTION_META).map(([val, { label }]) => (
                <option key={val} value={val} className="text-dynamic bg-white dark:bg-neutral-900">{label}</option>
              ))}
            </select>
          </div>

          {/* Filtre date */}
          <input
            type="date"
            className="px-3 py-1.5 rounded-lg text-dynamic text-xs font-medium outline-none cursor-pointer bg-gray-50 dark:bg-neutral-800/40 border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200"
            value={filtreDate}
            onChange={e => setFiltreDate(e.target.value)}
          />

          {/* Réinitialiser */}
          {(filtreAction || filtreDate) && (
            <button
              onClick={() => { setFiltreAction(''); setFiltreDate(''); }}
              className="px-3 py-1.5 rounded-lg text-dynamic text-xs font-medium cursor-pointer border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
              Réinitialiser
            </button>
          )}

          {/* Effacer tout */}
          <button
            onClick={() => setConfirmAll(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-dynamic text-xs font-medium border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Effacer tout
          </button>
        </div>
      </div>

      {/* Zone Défilante */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 text-dynamic">

        {/* ── Error ── */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-dynamic border text-sm font-medium bg-red-50 dark:bg-red-950/20"
               style={{ color: C.red, borderColor: C.redBdr }}>
            {error}
          </div>
        )}

        {/* ── Loading / Empty ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-gray-50 dark:bg-neutral-800/20 rounded-xl border border-gray-200 dark:border-neutral-800">
            <Loader2 className="animate-spin" size={28} style={{ color: C.indigo }} />
            <p className="text-dynamic text-xs text-gray-400 dark:text-neutral-500">Chargement du journal…</p>
          </div>
        ) : historiques.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/30 dark:bg-transparent">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 border"
                 style={{ background: C.indigoSoft, borderColor: C.indigoBdr }}>
              <History size={20} style={{ color: C.indigo }} />
            </div>
            <p className="text-dynamic font-semibold text-sm text-gray-900 dark:text-white">Aucun historique trouvé</p>
            <p className="text-dynamic text-xs text-gray-400 dark:text-neutral-500 mt-0.5">Les actions système apparaîtront ici</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 text-dynamic">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="text-dynamic">

                {/* Séparateur de date */}
                <div className="flex items-center gap-2 text-dynamic px-1 mb-2.5">
                  <span className="text-dynamic text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
                  <span className="text-dynamic text-[10px] text-gray-400 dark:text-neutral-500 font-medium">{items.length} action(s)</span>
                </div>

                {/* Conteneur de Liste */}
                <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900/40 border border-gray-200 dark:border-neutral-800 text-dynamic divide-y divide-gray-100 dark:divide-neutral-800/50">
                  {items.map((h) => {
                    const meta = getMeta(h.action);
                    return (
                      <div
                        key={h.id_historique}
                        className="group flex items-center gap-4 px-4 py-2.5 transition-colors hover:bg-gray-50/50 dark:hover:bg-neutral-800/20 text-dynamic"
                        style={{ borderLeft: `3.5px solid ${meta.color}` }}>

                        {/* Badge action */}
                        <span className="text-dynamic text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border whitespace-nowrap"
                              style={{ background: meta.bg, color: meta.color, borderColor: 'transparent' }}>
                          {meta.label}
                        </span>

                        {/* Description */}
                        <p className="flex-1 text-dynamic text-sm font-medium text-gray-950 dark:text-neutral-200 min-w-0 truncate">
                          {h.description}
                        </p>

                        {/* Utilisateur */}
                        <div className="flex items-center gap-1.5 shrink-0 text-dynamic">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-dynamic font-semibold text-white text-[10px] shrink-0"
                               style={{ background: C.indigo }}>
                            {h.user?.nom?.[0]}{h.user?.prenom?.[0]}
                          </div>
                          <span className="text-dynamic text-xs text-gray-600 dark:text-neutral-400 font-medium hidden sm:block">
                            {h.user?.nom} {h.user?.prenom}
                          </span>
                          <span className="text-dynamic text-[10px] font-medium px-1.5 py-0.5 rounded-md hidden sm:block bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 border border-gray-200/40 dark:border-neutral-700/40">
                            {h.user?.role}
                          </span>
                        </div>

                        {/* Heure */}
                        <div className="flex items-center gap-1 shrink-0 text-dynamic">
                          <Clock size={11} className="text-gray-400 dark:text-neutral-500" />
                          <span className="text-dynamic font-mono text-[11px] text-gray-400 dark:text-neutral-500">
                            {new Date(h.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit', minute: '2-digit', second: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Supprimer individuel */}
                        <button
                          onClick={() => handleDelete(h.id_historique)}
                          className="w-6 h-6 flex items-center justify-center rounded-md cursor-pointer border shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                          title="Supprimer">
                          <Trash2 size={11} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal confirm suppression tout ── */}
      {confirmAll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[2500] p-4 text-dynamic animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-[380px] shadow-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 text-dynamic">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 dark:bg-neutral-800/40 border-b border-gray-200 dark:border-neutral-800 text-dynamic">
              <h2 className="text-dynamic font-semibold text-sm text-gray-900 dark:text-white">Effacer l'historique</h2>
              <button onClick={() => setConfirmAll(false)}
                      className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200">
                <X size={13} />
              </button>
            </div>
            <div className="p-5 text-center text-dynamic">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/30">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <p className="text-dynamic font-semibold text-sm text-gray-900 dark:text-white">
                Supprimer <span className="text-red-600 dark:text-red-400 font-bold">tout</span> l'historique ?
              </p>
              <p className="text-dynamic text-xs text-gray-400 dark:text-neutral-500 mt-1">
                Cette opération videra tout le journal. Cette action est irréversible.
              </p>
            </div>
            <div className="px-4 py-3 flex gap-2 justify-end bg-gray-50 dark:bg-neutral-800/40 border-t border-gray-200 dark:border-neutral-800 text-dynamic">
              <button onClick={() => setConfirmAll(false)}
                      className="px-3 py-1.5 rounded-lg text-dynamic text-xs font-medium cursor-pointer border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700">
                Annuler
              </button>
              <button onClick={handleDeleteAll}
                      className="px-3 py-1.5 rounded-lg text-dynamic text-xs font-medium text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
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