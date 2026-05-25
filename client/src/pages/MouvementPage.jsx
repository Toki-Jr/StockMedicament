import { useState, useEffect } from 'react';
import { useMouvements } from '../hooks/useMouvements';
import { getLots } from '../services/lot.api';
import {
  CalendarDays, TrendingDown, TrendingUp, ArrowUpDown,
  Plus, X, Check, Loader2, Package, FileText
} from 'lucide-react';

/* ─── Palette ─── */
const C = {
  green:      '#22c55e',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.10)',
  greenBdr:   'rgba(34,197,94,0.25)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.10)',
  redBdr:     'rgba(239,68,68,0.25)',
  blue:       '#3b82f6',
  blueSoft:   'rgba(59,130,246,0.10)',
  blueBdr:    'rgba(59,130,246,0.25)',
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

export default function MouvementsPage() {
  const { mouvements, stats, loading, error, filtre, setFiltre, create } = useMouvements();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [lots,       setLots]       = useState([]);
  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    getLots().then(setLots).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY);
    setErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setForm(EMPTY);
    setErrors({});
  };

  const set = (k, v) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await create({
        ...form,
        quantite_mvt: parseInt(form.quantite_mvt),
        id_lot:       parseInt(form.id_lot),
      });
      closeDrawer();
      showToast('Mouvement enregistré avec succès');
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const todayCount = mouvements.filter(
    m => new Date(m.date_mvt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="h-screen flex overflow-hidden rounded-xl border border-white/[0.05] shadow-2xl">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] flex items-center gap-2 px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg"
             style={{ background: toast.type === 'error' ? C.red : C.greenDark }}>
          {toast.type === 'error' ? <X size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                 style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
              <ArrowUpDown size={20} color={C.green} />
            </div>
            <div>
              <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                Mouvements de <span style={{ color: C.green }}>stock</span>
              </h1>
              <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
                {mouvements.length} mouvement(s) enregistré(s)
              </p>
            </div>
          </div>
          {!drawerOpen && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white border-none cursor-pointer"
              style={{ background: C.greenDark }}>
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
        <div className="flex gap-2 flex-wrap shrink-0">
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
                className="px-4 py-1.5 rounded-full text-dynamic font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: active ? C.greenDark : 'transparent',
                  color:      active ? '#fff' : 'var(--text-muted)',
                  border:     active ? 'none' : '0.5px solid var(--border)',
                }}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-dynamic"
               style={{ background: C.redSoft, color: C.red, border: `0.5px solid ${C.redBdr}` }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl"
             style={{ border: '0.5px solid var(--border)' }}>

          <div className="px-5 py-3.5 shrink-0"
               style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <h3 className="text-dynamic font-medium text-[var(--text-primary)]">Journal des mouvements</h3>
            <p className="text-dynamic text-[var(--text-muted)] mt-0.5">{mouvements.length} mouvement(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-[var(--text-muted)] text-dynamic">
                <Loader2 size={20} className="animate-spin" style={{ color: C.green }} />
                Chargement…
              </div>
            ) : mouvements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                <div className="text-dynamic mb-3 opacity-20">↕</div>
                <p className="text-dynamic font-medium">Aucun mouvement enregistré</p>
                <p className="text-dynamic mt-1">Cliquez sur « Nouveau mouvement » pour commencer</p>
              </div>
            ) : (
              <table className="w-full text-dynamic border-collapse">
                <thead>
                  <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0 }}>
                    {['Type', 'Lot / Médicament', 'Quantité', 'Motif', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mouvements.map((m, i) => {
                    const meta = TYPE_META[m.type_mvt] ?? TYPE_META.entree;
                    return (
                      <tr key={m.id_mvt}
                          style={{ borderTop: '0.5px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent'}>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-dynamic font-medium"
                                style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.bdr}` }}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[var(--text-primary)]">{m.lot?.medicament?.nom ?? '—'}</div>
                          <div className="text-dynamic font-mono text-[var(--text-muted)] mt-0.5">{m.lot?.numero_lot}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-dynamic font-bold"
                                style={{ color: m.type_mvt === 'entree' ? C.greenDark : C.red }}>
                            {m.type_mvt === 'entree' ? '+' : '-'}{m.quantite_mvt}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-[var(--text-muted)]">
                          {m.motif || <span className="opacity-40">—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[var(--text-muted)]">
                          {new Date(m.date_mvt).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-5 py-3 flex items-center justify-between shrink-0"
               style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <span className="text-dynamic text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-primary)]">{mouvements.length}</span> mouvement(s)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
              <span className="text-dynamic text-[var(--text-muted)]">Synchronisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer formulaire ── */}
      <div className="shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
           style={{
             width: drawerOpen ? '360px' : '0px',
             borderLeft: drawerOpen ? '0.5px solid var(--border)' : 'none',
             background: 'var(--bg-content)',
           }}>
        <div className="w-[360px] flex flex-col h-full">

          {/* Drawer header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0"
               style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                   style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
                <ArrowUpDown size={18} color={C.green} />
              </div>
              <div>
                <h2 className="text-dynamic font-medium text-[var(--text-primary)]">Nouveau mouvement</h2>
                <p className="text-dynamic text-[var(--text-muted)] mt-0.5">Enregistrer une entrée ou sortie</p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer border-none"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dynamic font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Type de mouvement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'entree', label: 'Entrée',  color: C.greenDark, bg: C.greenSoft, bdr: C.greenBdr },
                  { val: 'sortie', label: 'Sortie',  color: C.red,       bg: C.redSoft,   bdr: C.redBdr   },
                ].map(opt => {
                  const active = form.type_mvt === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('type_mvt', opt.val)}
                      className="py-2.5 rounded-[9px] text-dynamic font-medium cursor-pointer border-none flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: active ? opt.bg  : 'var(--bg-sidebar)',
                        border:    `0.5px solid ${active ? opt.bdr : 'var(--border)'}`,
                        color:      active ? opt.color : 'var(--text-muted)',
                      }}>
                      {opt.val === 'entree' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lot */}
            <Field label="Lot" error={errors.id_lot} icon={<Package size={13} />}>
              <select
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.id_lot ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                value={form.id_lot}
                onChange={e => set('id_lot', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.id_lot ? C.red : 'var(--border)'}>
                <option value="">-- Choisir un lot --</option>
                {lots.map(l => (
                  <option key={l.id_lot} value={l.id_lot}>
                    {l.numero_lot} — {l.medicament?.nom} (dispo: {l.quantite_entre - l.quantite_sortie})
                  </option>
                ))}
              </select>
              {errors.id_lot && <Err>{errors.id_lot}</Err>}
            </Field>

            {/* Quantité */}
            <Field label="Quantité" error={errors.quantite_mvt} icon={<ArrowUpDown size={13} />}>
              <input
                type="number" min="1"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.quantite_mvt ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="10"
                value={form.quantite_mvt}
                onChange={e => set('quantite_mvt', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.quantite_mvt ? C.red : 'var(--border)'}
              />
              {errors.quantite_mvt && <Err>{errors.quantite_mvt}</Err>}
            </Field>

            {/* Motif */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dynamic font-medium uppercase tracking-wide text-[var(--text-muted)]">Motif</label>
              <div className="relative">
                <FileText size={13} className="absolute left-2.5 top-3 text-[var(--text-muted)]" />
                <textarea
                  rows={3}
                  className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none resize-none"
                  style={{
                    background: 'var(--bg-sidebar)',
                    border: `0.5px solid ${errors.motif ? C.red : 'var(--border)'}`,
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Ex: Dispensation patient, Retour fournisseur…"
                  value={form.motif}
                  onChange={e => set('motif', e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e  => e.target.style.borderColor = errors.motif ? C.red : 'var(--border)'}
                />
              </div>
              {errors.motif && <Err>{errors.motif}</Err>}
            </div>

            {/* Submit */}
            <div className="mt-auto pt-4 flex gap-2.5" style={{ borderTop: '0.5px solid var(--border)' }}>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 py-2.5 rounded-[8px] text-dynamic font-medium cursor-pointer"
                style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-[8px] text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: C.greenDark }}>
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Traitement…</>
                  : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
         style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
           style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <div className="text-dynamic font-medium leading-none" style={{ color: valueColor }}>{value}</div>
        <div className="text-dynamic uppercase tracking-wide mt-1 text-[var(--text-muted)]">{label}</div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-dynamic font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Err({ children }) {
  return <span className="text-dynamic" style={{ color: C.red }}>{children}</span>;
}