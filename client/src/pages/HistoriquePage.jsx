import { useState, useEffect } from 'react';
import { getHistoriques, deleteHistorique, deleteAllHistoriques } from '../services/historique.api';
import { History, User, Filter, Loader2, Trash2, X } from 'lucide-react';

const ACTION_META = {
  CONNEXION:        { label: 'Connexion',         color: '#6366f1', bg: 'rgba(99,102,241,0.10)'  },
  COMMANDE_CREEE:   { label: 'Commande créée',    color: '#f97316', bg: 'rgba(249,115,22,0.10)'  },
  COMMANDE_ENVOYEE: { label: 'Commande envoyée',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)'  },
  COMMANDE_VALIDEE: { label: 'Commande validée',  color: '#16a34a', bg: 'rgba(22,163,74,0.10)'   },
  COMMANDE_REJETEE: { label: 'Commande rejetée',  color: '#dc2626', bg: 'rgba(220,38,38,0.10)'   },
};

const getMeta = (action) => ACTION_META[action] ?? {
  label: action, color: '#6b7280', bg: 'rgba(107,114,128,0.10)',
};

// Grouper par date
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
    const [historiques, setHistoriques] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [filtreAction,setFiltreAction]= useState('');
    const [filtreDate,  setFiltreDate]  = useState('');

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

    const [confirmAll, setConfirmAll] = useState(false);
    const [toast,      setToast]      = useState(null);

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
        <div className="flex flex-col gap-5 p-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.10)', border: '0.5px solid rgba(99,102,241,0.25)' }}>
                <History size={20} color="#6366f1" />
            </div>
            <div>
                <h1 className="text-[22px] font-medium text-[var(--text-primary)]">
                Historique
                </h1>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                Journal des actions par jour
                </p>
            </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
                style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
                <Filter size={13} color="var(--text-muted)" />
                <select
                className="text-[12px] outline-none border-none bg-transparent text-[var(--text-primary)] cursor-pointer"
                value={filtreAction}
                onChange={e => setFiltreAction(e.target.value)}>
                <option value="">Toutes les actions</option>
                {Object.entries(ACTION_META).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                ))}
                </select>
            </div>

            <input
                type="date"
                className="px-3 py-2 rounded-lg text-[12px] outline-none cursor-pointer"
                style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                value={filtreDate}
                onChange={e => setFiltreDate(e.target.value)}
            />

            {(filtreAction || filtreDate) && (
                <button
                onClick={() => { setFiltreAction(''); setFiltreDate(''); }}
                className="px-3 py-2 rounded-lg text-[12px] cursor-pointer border-none"
                style={{ background: 'rgba(220,38,38,0.10)', color: '#dc2626' }}>
                Réinitialiser
                </button>
            )}
            </div>
            <button
                onClick={() => setConfirmAll(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium border-none cursor-pointer"
                style={{ background: 'rgba(220,38,38,0.10)', color: '#dc2626', border: '0.5px solid rgba(220,38,38,0.25)' }}>
                <Trash2 size={14} /> Effacer tout
            </button>
        </div>

        {/* Compteur */}
        <div className="text-[12px] text-[var(--text-muted)]">
            {historiques.length} action(s) trouvée(s)
        </div>

        {/* Erreur */}
        {error && (
            <div className="px-4 py-3 rounded-lg text-[13px]"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
            </div>
        )}

        {/* Loading */}
        {loading ? (
            <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} color="#6366f1" />
            <p className="text-[12px] text-[var(--text-muted)]">Chargement…</p>
            </div>
        ) : historiques.length === 0 ? (
            <div className="py-20 text-center rounded-xl" style={{ border: '0.5px solid var(--border)' }}>
            <div className="text-[40px] mb-3 opacity-20">📋</div>
            <p className="text-[13px] text-[var(--text-muted)]">Aucun historique trouvé</p>
            </div>
        ) : (
            /* Groupes par date */
            <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                {/* Séparateur date */}
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1', border: '0.5px solid rgba(99,102,241,0.25)' }}>
                    {date}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-[11px] text-[var(--text-muted)]">{items.length} action(s)</span>
                </div>

                {/* Entrées */}
                <div className="flex flex-col gap-2">
                    {items.map(h => {
                    const meta = getMeta(h.action);
                    return (
                        <div key={h.id_historique}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl"
                            style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', borderLeft: `3px solid ${meta.color}` }}>

                            {/* Badge action */}
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0"
                                    style={{ background: meta.bg, color: meta.color }}>
                                {meta.label}
                            </span>

                            {/* Description */}
                            <p className="flex-1 text-[13px] text-[var(--text-primary)]">
                                {h.description}
                            </p>

                            {/* Utilisateur */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                                    style={{ background: '#6366f1' }}>
                                {h.user?.nom?.[0]}{h.user?.prenom?.[0]}
                                </div>
                                <span className="text-[12px] text-[var(--text-muted)]">
                                {h.user?.nom} {h.user?.prenom}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                                {h.user?.role}
                                </span>
                            </div>

                            {/* Heure */}
                            <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                                {new Date(h.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>

                            <button
                                onClick={() => handleDelete(h.id_historique)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer border-none shrink-0"
                                style={{ background: 'rgba(220,38,38,0.10)', border: '0.5px solid rgba(220,38,38,0.25)' }}
                                title="Supprimer">
                                <Trash2 size={13} color="#dc2626" />
                            </button>
                        </div>
                    );
                    })}
                </div>
                </div>
            ))}
            </div>
        )}

        {confirmAll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1000] p-4">
            <div className="bg-[var(--bg-content)] rounded-[16px] w-full max-w-[400px] shadow-2xl overflow-hidden"
                style={{ border: '0.5px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                <h2 className="text-[14px] font-medium text-[var(--text-primary)]">Effacer l'historique</h2>
                <button onClick={() => setConfirmAll(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                        style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                <X size={14} />
                </button>
            </div>
            <div className="p-5 text-center">
                <Trash2 size={40} color="#dc2626" className="mx-auto mb-3" />
                <p className="text-[14px] text-[var(--text-primary)]">
                Supprimer <strong>tout</strong> l'historique définitivement ?
                </p>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">
                Cette action est irréversible.
                </p>
            </div>
            <div className="px-5 py-4 flex gap-2.5 justify-end"
                style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                <button onClick={() => setConfirmAll(false)}
                        className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
                        style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                Annuler
                </button>
                <button onClick={handleDeleteAll}
                        className="px-4 py-2 rounded-lg text-[13px] font-medium text-white border-none cursor-pointer"
                        style={{ background: '#dc2626' }}>
                Confirmer
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Toast */}
        {toast && (
        <div className="fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white text-[13px] font-medium shadow-lg flex items-center gap-2"
            style={{ background: toast.type === 'error' ? '#dc2626' : '#16a34a' }}>
            {toast.msg}
            <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
        )}
        </div>
    );
}