import { useState, useEffect } from 'react';
import { useMouvements } from '../hooks/useMouvements';
import { getLots } from '../services/lot.api';
import { facturer, getDownloadUrl } from '../services/facture.api';
import {
  CalendarDays, TrendingDown, TrendingUp, ArrowUpDown,
  Plus, X, Check, Loader2, Package, FileText, Receipt
} from 'lucide-react';

/* ─── Palette de couleur pour les badges / états ─── */
const C = {
  green:      '#1a7a4a',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.10)',
  greenBdr:   'rgba(34,197,94,0.25)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.10)',
  redBdr:     'rgba(239,68,68,0.25)',
  blue:       '#3b82f6',
  blueSoft:   'rgba(59,130,246,0.10)',
  blueBdr:    'rgba(59,130,246,0.25)',
  amber:      '#f59e0b',
  amberSoft:  'rgba(245,158,11,0.10)',
  amberBdr:   'rgba(245,158,11,0.25)',
};

const TYPE_META = {
  entree: {
    label: 'Entrée',
    color: C.greenDark,
    bg:    C.greenSoft,
    bdr:   C.greenBdr,
    icon:  <TrendingUp size={12} />,
  },
  sortie: {
    label: 'Sortie',
    color: C.red,
    bg:    C.redSoft,
    bdr:   C.redBdr,
    icon:  <TrendingDown size={12} />,
  },
};

const EMPTY = { type_mvt: 'entree', quantite_mvt: '', motif: '', id_lot: '' };
const EMPTY_FACTURE = { nomClient: '', emailClient: '', nomPharmacien: '' };

export default function MouvementsPage() {
  const { mouvements, stats, loading, error, filtre, setFiltre, create } = useMouvements();

  /* ── États drawer création ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [lots,       setLots]       = useState([]);
  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});

  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (i) => {
    setExpandedRows(prev => ({ ...prev, [i]: !prev[i] }));
  };
  
  /* ── États drawer facturation ── */
  const [factureDrawerOpen,  setFactureDrawerOpen]  = useState(false);
  const [mouvementAFacturer, setMouvementAFacturer] = useState(null);
  const [factureForm,        setFactureForm]        = useState(EMPTY_FACTURE);
  const [factureErrors,      setFactureErrors]      = useState({});
  const [facturing,          setFacturing]          = useState(false);
  const [factureResultat,    setFactureResultat]    = useState(null);

  /* ── Toast partagé ── */
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getLots().then(setLots).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Drawer création de mouvement ── */
  const openCreate = () => {
    setForm(EMPTY);
    setErrors({});
    setDrawerOpen(true);
    setFactureDrawerOpen(false);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setForm(EMPTY);
    setErrors({});
  };

  const setField = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.id_lot)                                    e.id_lot       = 'Requis';
    if (!form.quantite_mvt || isNaN(form.quantite_mvt)) e.quantite_mvt = 'Nombre requis';
    if (!form.motif.trim())                              e.motif        = 'Requis';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const todayCount = mouvements.filter(
    m => new Date(m.date_mvt).toDateString() === new Date().toDateString()
  ).length;

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await create({
        ...form,
        quantite_mvt: parseInt(form.quantite_mvt),
        id_lot:       parseInt(form.id_lot),
      });
      showToast('Mouvement enregistré avec succès');
      closeDrawer();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Drawer facturation d'un mouvement existant ── */
  const openFactureDrawer = (mouvement) => {
    console.log('user dans groupe:', mouvement.user); // ← ajoute ça temporairement
    setMouvementAFacturer(mouvement);
    setFactureForm({
      nomClient:     mouvement.user ? `${mouvement.user.prenom} ${mouvement.user.nom}` : '',
      emailClient:   mouvement.user?.email ?? '',
      nomPharmacien: '',
    });
    
    setFactureErrors({});
    setFactureResultat(null);
    setFactureDrawerOpen(true);
    setDrawerOpen(false);
  };

  const closeFactureDrawer = () => {
    setFactureDrawerOpen(false);
    setMouvementAFacturer(null);
    setFactureForm(EMPTY_FACTURE);
    setFactureErrors({});
    setFactureResultat(null);
  };

  const setFactureField = (k, v) => {
    setFactureForm(p => ({ ...p, [k]: v }));
    setFactureErrors(p => ({ ...p, [k]: '' }));
  };

  const validateFacture = () => {
    const e = {};
    if (!factureForm.nomClient.trim())     e.nomClient     = 'Requis';
    if (!factureForm.nomPharmacien.trim()) e.nomPharmacien = 'Requis';
    if (factureForm.emailClient && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(factureForm.emailClient)) {
      e.emailClient = 'Email invalide';
    }
    setFactureErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFacturer = async (ev) => {
    ev.preventDefault();
    // 'mouvementAFacturer' est maintenant un objet groupe 'g'
    if (!validateFacture() || !mouvementAFacturer) return;
    
    setFacturing(true);
    try {
      const result = await facturer({
        nomClient:     factureForm.nomClient.trim(),
        emailClient:   factureForm.emailClient.trim(),
        nomPharmacien: factureForm.nomPharmacien.trim(),
        type_mvt:      'sortie',
        motif:         mouvementAFacturer.motif ?? '',
        // On transforme les items du groupe en tableau pour l'API
        medicaments:   mouvementAFacturer.items.map(item => ({
          nom:          item.nom,
          quantite:     item.qte,
          // On récupère le prix unitaire réel si possible
          prixUnitaire: item.prix / item.qte,
        })),
      });
      setFactureResultat(result);
      showToast(`Facture ${result.numeroFacture} générée`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur facturation', 'error');
    } finally {
      setFacturing(false);
    }
  };

  /* ─── Logique de regroupement des mouvements pour affichage ─── */
  const mouvementsGroupes = mouvements.reduce((acc, mvt) => {
  const key = mvt.motif || 'sans-motif';
  if (!acc[key]) {
    acc[key] = {
      motif:     mvt.motif,
      type_mvt:  mvt.type_mvt,
      date_mvt:  mvt.date_mvt,
      items:     {},        // ← objet keyed par id_medoc
      totalPrix: 0,
      user:      mvt.user ?? null,
    };
  }

  const idMed        = mvt.id_medoc ?? mvt.lot?.medicaments?.[0]?.id_medoc ?? 'unknown';
  const nomMed       = mvt.medicament?.nom ?? mvt.lot?.medicaments?.[0]?.medicament?.nom ?? '—';
  const prixUnitaire = mvt.medicament?.prix_unitaire ?? mvt.lot?.medicaments?.[0]?.medicament?.prix_unitaire ?? 0;
  const prixLigne    = mvt.quantite_mvt * prixUnitaire;

  if (acc[key].items[idMed]) {
    // ✅ Même médicament → additionner les quantités
    acc[key].items[idMed].qte  += mvt.quantite_mvt;
    acc[key].items[idMed].prix += prixLigne;
  } else {
    acc[key].items[idMed] = {
      nom:  nomMed,
      qte:  mvt.quantite_mvt,
      prix: prixLigne,
    };
  }

  acc[key].totalPrix += prixLigne;
  return acc;
}, {});

// Convertir items en tableau pour l'affichage
const groupesArray = Object.values(mouvementsGroupes).map(g => ({
  ...g,
  items: Object.values(g.items), // ← tableau pour le .map() dans le JSX
}));


  return (
    <div className="h-screen flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 text-dynamic">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[2000] flex items-center gap-2 px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <X size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30">
              <ArrowUpDown size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-dynamic">
                Mouvements de <span className="text-emerald-600 dark:text-emerald-400">stock</span>
              </h1>
              <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                {mouvements.length} mouvement(s) enregistré(s)
              </p>
            </div>
          </div>
          {!drawerOpen && !factureDrawerOpen && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-colors border-none">
              <Plus size={15} /> Nouveau mouvement
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 shrink-0">
          <StatCard icon={<TrendingUp size={18} color={C.greenDark} />}  iconBg={C.greenSoft} label="Total entrées"    value={stats?.total_entrees ?? 0} valueColor={C.greenDark} />
          <StatCard icon={<TrendingDown size={18} color={C.red} />}      iconBg={C.redSoft}   label="Total sorties"    value={stats?.total_sorties ?? 0} valueColor={C.red}       />
          <StatCard icon={<ArrowUpDown size={18} color={C.green} />}     iconBg={C.greenSoft} label="Total mouvements" value={mouvements.length}         valueColor={C.green}     />
          <StatCard icon={<CalendarDays size={18} color={C.blue} />}     iconBg={C.blueSoft}  label="Aujourd'hui"      value={todayCount}                valueColor={C.blue}      />
        </div>

        {/* Filtres */}
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {[
            { val: '',       label: 'Tous'      },
            { val: 'entree', label: '↑ Entrées' },
            { val: 'sortie', label: '↓ Sorties' },
          ].map(f => {
            const active = filtre.type_mvt === f.val;
            return (
              <button
                key={f.val}
                onClick={() => setFiltre(p => ({ ...p, type_mvt: f.val }))}
                className={`px-4 py-1.5 rounded-full font-semibold cursor-pointer border transition-all text-dynamic ${
                  active 
                    ? 'bg-emerald-600 text-white border-transparent' 
                    : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-dynamic bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">

          <div className="px-5 py-3.5 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-dynamic font-medium text-zinc-900 dark:text-zinc-50">Journal des mouvements</h3>
            <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">{mouvements.length} mouvement(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-dynamic text-zinc-500 dark:text-zinc-400">
                <Loader2 size={20} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                Chargement…
              </div>
            ) : mouvements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-3xl mb-3 opacity-20 text-zinc-400 text-dynamic">↕</div>
                <p className="text-dynamic font-medium text-zinc-900 dark:text-zinc-50">Aucun mouvement enregistré</p>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-1">Cliquez sur « Nouveau mouvement » pour commencer</p>
              </div>
            ) : (
              <table className="w-full text-dynamic border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                    {['Type', 'Lot / Médicament', 'Quantité', 'Prix Total', 'Motif', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-dynamic">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {groupesArray.map((g, i) => {
                    const estSortie = g.type_mvt === 'sortie';
                    const meta = TYPE_META[g.type_mvt] ?? TYPE_META.entree;

                    return (
                      <tr key={i} className="hover:bg-zinc-500/[0.02]">
                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-dynamic font-semibold"
                                style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.bdr}` }}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>      
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          <div className="flex flex-wrap items-center gap-1">
                            {g.items
                              .slice(0, expandedRows[i] ? g.items.length : 2)
                              .map((it, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                  {it.nom}
                                </span>
                              ))
                            }

                            {/* Badge "...+N autres" quand collapsed */}
                            {!expandedRows[i] && g.items.length > 2 && (
                              <button
                                onClick={() => toggleExpand(i)}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer border-none bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                              >
                                +{g.items.length - 2} autres ▾
                              </button>
                            )}

                            {/* Bouton "Moins" quand expanded */}
                            {expandedRows[i] && g.items.length > 2 && (
                              <button
                                onClick={() => toggleExpand(i)}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer border-none bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                              >
                                Moins ▴
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-dynamic text-zinc-600 dark:text-zinc-400">
                          {g.items
                            .slice(0, expandedRows[i] ? g.items.length : 2)
                            .map((it, idx) => (
                              <div key={idx} className="text-dynamic">
                                {it.nom}: <span className="font-bold" style={{ color: estSortie ? C.red : C.greenDark }}>
                                  {estSortie ? '-' : '+'}{it.qte}
                                </span>
                              </div>
                            ))
                          }
                        </td>

                        {/* Prix Total */}
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                          {g.totalPrix.toLocaleString('fr-FR')} Ar
                        </td>

                        {/* Motif */}
                        <td className="px-4 py-3 text-zinc-500 truncate max-w-[150px]">
                          {g.motif}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-dynamic text-zinc-500 dark:text-zinc-400">
                            {new Date(g.date_mvt).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                        <td className="px-4 py-3">
                          {estSortie ? (
                            <button
                              onClick={() => openFactureDrawer(g)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400 transition-all cursor-pointer">
                              <Receipt size={13} /> Facturer
                            </button>
                          ) : (
                            <span className="opacity-30 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-5 py-3 flex items-center justify-between shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-dynamic text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">{mouvements.length}</span> mouvement(s)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-dynamic text-zinc-500 dark:text-zinc-400">Synchronisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          Drawer — Création d'un mouvement
      ════════════════════════════════════════════════════ */}
      <div className={`shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-zinc-950 ${
             drawerOpen ? 'w-[380px] border-l border-zinc-200 dark:border-zinc-800' : 'w-0'
           }`}>
        <div className="w-[380px] flex flex-col h-full">

          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30">
                <ArrowUpDown size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">Nouveau mouvement</h2>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">Enregistrer une entrée ou sortie</p>
              </div>
            </div>
            <button onClick={closeDrawer}
                    className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer border-none bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dynamic font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Type de mouvement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'entree', label: 'Entrée',  color: C.greenDark, bg: C.greenSoft, bdr: C.greenBdr },
                  { val: 'sortie', label: 'Sortie',  color: C.red,       bg: C.redSoft,   bdr: C.redBdr   },
                ].map(opt => {
                  const active = form.type_mvt === opt.val;
                  return (
                    <button key={opt.val} type="button" onClick={() => setField('type_mvt', opt.val)}
                            className="py-2.5 rounded-lg text-dynamic font-semibold cursor-pointer border-none flex items-center justify-center gap-2 transition-all"
                            style={{
                              background: active ? opt.bg  : 'transparent',
                              border:    `1px solid ${active ? opt.bdr : 'var(--border, #e4e4e7)'}`,
                              color:      active ? opt.color : '#71717a',
                            }}>
                      {opt.val === 'entree' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lot */}
            <DrawerField label="Lot" error={errors.id_lot} icon={<Package size={13} />}>
              <select
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.id_lot ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                value={form.id_lot}
                onChange={e => setField('id_lot', e.target.value)}>
                <option value="">-- Choisir un lot --</option>
                {lots.map(l => (
                  <option key={l.id_lot} value={l.id_lot}>
                    {l.numero_lot} — {l.medicament?.nom} (dispo: {l.quantite_entre - l.quantite_sortie})
                  </option>
                ))}
              </select>
              {errors.id_lot && <ErrMsg>{errors.id_lot}</ErrMsg>}
            </DrawerField>

            {/* Quantité */}
            <DrawerField label="Quantité" error={errors.quantite_mvt} icon={<ArrowUpDown size={13} />}>
              <input type="number" min="1"
                     className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                       errors.quantite_mvt ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                     }`}
                     placeholder="10"
                     value={form.quantite_mvt}
                     onChange={e => setField('quantite_mvt', e.target.value)} />
              {errors.quantite_mvt && <ErrMsg>{errors.quantite_mvt}</ErrMsg>}
            </DrawerField>

            {/* Motif */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dynamic font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Motif</label>
              <div className="relative">
                <FileText size={13} className="absolute left-2.5 top-3.5 text-zinc-400 dark:text-zinc-500" />
                <textarea rows={3}
                          className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors resize-none text-zinc-900 dark:text-zinc-50 ${
                            errors.motif ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                          }`}
                          placeholder="Ex: Dispensation patient, Retour fournisseur…"
                          value={form.motif}
                          onChange={e => setField('motif', e.target.value)} />
              </div>
              {errors.motif && <ErrMsg>{errors.motif}</ErrMsg>}
            </div>

            {/* Submit */}
            <div className="mt-auto pt-4 flex gap-2.5 border-t border-zinc-200 dark:border-zinc-800">
              <button type="button" onClick={closeDrawer}
                      className="flex-1 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                      className="flex-1 py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Traitement…</>
                  : 'Enregistrer'
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          Drawer — Facturation d'un mouvement existant
      ════════════════════════════════════════════════════ */}
      <div className={`shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-zinc-950 ${
             factureDrawerOpen ? 'w-[380px] border-l border-zinc-200 dark:border-zinc-800' : 'w-0'
           }`}>
        <div className="w-[380px] flex flex-col h-full">

          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30">
                <Receipt size={18} color={C.amber} />
              </div>
              <div>
                <h2 className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">Générer une facture</h2>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {mouvementAFacturer
                    ? `${mouvementAFacturer.items.length} article(s) — ${mouvementAFacturer.totalPrix.toLocaleString('fr-FR')} Ar`
                    : 'Mouvement sélectionné'}
                </p>
              </div>
            </div>
            <button onClick={closeFactureDrawer}
                    className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer border-none bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Résumé mouvement */}
          {mouvementAFacturer && !factureResultat && (
            <div className="mx-5 mt-4 px-4 py-3 rounded-xl text-dynamic"
                style={{ background: C.greenSoft, border: `1px solid ${C.greenBdr}` }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={13} color={C.green} />
                <span className="font-semibold text-dynamic" style={{ color: C.green }}>
                  Sortie groupée ({mouvementAFacturer.items.length} articles)
                </span>
              </div>
              <div className="text-zinc-500 text-dynamic space-y-1">
                {mouvementAFacturer.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.nom} (x{it.qte})</span>
                    <span>{it.prix.toLocaleString('fr-FR')} Ar</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-red-200 font-bold text-zinc-900 dark:text-zinc-50 flex justify-between">
                <span>Total :</span>
                <span>{mouvementAFacturer.totalPrix.toLocaleString('fr-FR')} Ar</span>
              </div>
            </div>
          )}

          {/* Résultat succès */}
          {factureResultat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ background: C.greenSoft, border: `1px solid ${C.greenBdr}` }}>
                <Check size={26} color={C.greenDark} />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">{factureResultat.message}</p>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-1">
                  Facture <strong>{factureResultat.numeroFacture}</strong>
                </p>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400">
                  Total : <strong>{(factureResultat.totalGeneral ?? 0).toFixed(2)} Ar</strong>
                </p>
              </div>
              {factureResultat.fileName && (
                <a href={getDownloadUrl(factureResultat.fileName)}
                   target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-dynamic font-medium text-white no-underline bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  ⬇️ Télécharger le PDF
                </a>
              )}
              {factureResultat.email?.statut === 'envoye' && (
                <p className="text-dynamic font-semibold" style={{ color: C.greenDark }}>
                  📧 Envoyé à <strong>{factureResultat.email.destinataire}</strong>
                </p>
              )}
              <button onClick={closeFactureDrawer}
                      className="text-dynamic underline cursor-pointer border-none bg-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                Fermer
              </button>
            </div>
          ) : (
            /* Form facturation */
            <form onSubmit={handleFacturer} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

              {/* Nom client */}
              <DrawerField label="Nom & Prénom client *" error={factureErrors.nomClient} icon={<FileText size={13} />}>
                <input type="text"
                       className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                         factureErrors.nomClient ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-amber-500 dark:focus:border-amber-500'
                       }`}
                       placeholder="Ex : Rakoto Jean"
                       value={factureForm.nomClient}
                       onChange={e => setFactureField('nomClient', e.target.value)} />
                {factureErrors.nomClient && <ErrMsg>{factureErrors.nomClient}</ErrMsg>}
              </DrawerField>

              {/* Email client */}
              <DrawerField label="Email client" error={factureErrors.emailClient} icon={<FileText size={13} />}>
                <input type="email"
                       className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                         factureErrors.emailClient ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-amber-500 dark:focus:border-amber-500'
                       }`}
                       placeholder="client@email.com (optionnel)"
                       value={factureForm.emailClient}
                       onChange={e => setFactureField('emailClient', e.target.value)} />
                {factureErrors.emailClient && <ErrMsg>{factureErrors.emailClient}</ErrMsg>}
              </DrawerField>

              {/* Nom pharmacien */}
              <DrawerField label="Nom pharmacien *" error={factureErrors.nomPharmacien} icon={<FileText size={13} />}>
                <input type="text"
                       className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                         factureErrors.nomPharmacien ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-amber-500 dark:focus:border-amber-500'
                       }`}
                       placeholder="Ex : Dr. Robert"
                       value={factureForm.nomPharmacien}
                       onChange={e => setFactureField('nomPharmacien', e.target.value)} />
                {factureErrors.nomPharmacien && <ErrMsg>{factureErrors.nomPharmacien}</ErrMsg>}
              </DrawerField>

              {/* Submit Facture */}
              <div className="mt-auto pt-4 flex gap-2.5 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={closeFactureDrawer}
                        className="flex-1 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={facturing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400 transition-all cursor-pointer">
                  {facturing
                    ? <><Loader2 size={13} className="animate-spin" /> Facturation…</>
                    : 'Générer facture'
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Composants Utilitaires Internes Harmonisés ─── */
function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div className="p-4 rounded-xl flex items-center gap-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-dynamic">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-zinc-500 dark:text-zinc-400 font-semibold text-dynamic truncate uppercase tracking-wider">{label}</p>
        <p className="text-[20px] font-bold mt-0.5 tracking-tight text-dynamic truncate" style={{ color: valueColor }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

function DrawerField({ label, error, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5 text-dynamic">
      <label className="text-dynamic font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <div className="relative text-zinc-400 dark:text-zinc-500">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function ErrMsg({ children }) {
  return (
    <span className="text-dynamic font-medium mt-1 inline-block text-red-500">
      {children}
    </span>
  );
}