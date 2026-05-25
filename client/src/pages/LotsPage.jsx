import { useState, useEffect } from 'react';
import { useLots } from '../hooks/useLots';
import { useAuth } from '../context/AuthContext';
import { getMedicaments } from '../services/medicament.api';
import {
  Package, Plus, AlertTriangle, CircleDot, BarChart3,
  Pencil, Trash2, X, Loader2, Hash, Calendar, FlaskConical
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
  yellow:     '#eab308',
  yellowSoft: 'rgba(234,179,8,0.10)',
  yellowBdr:  'rgba(234,179,8,0.25)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.10)',
  redBdr:     'rgba(239,68,68,0.25)',
};

const EMPTY = {
  numero_lot: '', date_fabrication: '', date_expiration: '',
  quantite_entre: '', quantite_sortie: '0', id_medoc: '',
};

const EXPIRATION_STATUS = (dateExp) => {
  const j = Math.ceil((new Date(dateExp) - new Date()) / 86400000);
  if (j < 0)   return { label: 'Expiré', bg: C.redSoft,    color: C.red,       bdr: C.redBdr    };
  if (j <= 30) return { label: `${j}j`,  bg: C.orangeSoft, color: C.orange,    bdr: C.orangeBdr };
  if (j <= 90) return { label: `${j}j`,  bg: C.yellowSoft, color: C.yellow,    bdr: C.yellowBdr };
  return              { label: `${j}j`,  bg: C.greenSoft,  color: C.greenDark, bdr: C.greenBdr  };
};

export default function LotsPage() {
  const { lots, loading, error, create, update, remove } = useLots();
  const { isAdmin, isPharmacien } = useAuth();
  const canEdit = isAdmin || isPharmacien;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [medicaments, setMeds]      = useState([]);
  const [form,        setForm]      = useState(EMPTY);
  const [errors,      setErrors]    = useState({});

  const isEdit = !!selected;

  useEffect(() => {
    getMedicaments().then(setMeds).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (lot) => {
    setSelected(lot);
    setForm({
      numero_lot:       lot.numero_lot,
      date_fabrication: lot.date_fabrication?.slice(0, 10) || '',
      date_expiration:  lot.date_expiration?.slice(0, 10)  || '',
      quantite_entre:   String(lot.quantite_entre),
      quantite_sortie:  String(lot.quantite_sortie),
      id_medoc:         String(lot.id_medoc),
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
    setForm(EMPTY);
    setErrors({});
  };

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.numero_lot.trim())     e.numero_lot = 'Requis';
    if (!form.date_fabrication)      e.date_fabrication = 'Requis';
    if (!form.date_expiration)       e.date_expiration = 'Requis';
    if (!form.quantite_entre || isNaN(form.quantite_entre)) e.quantite_entre = 'Nombre requis';
    if (!form.id_medoc)              e.id_medoc = 'Requis';
    if (form.date_fabrication && form.date_expiration &&
        new Date(form.date_expiration) <= new Date(form.date_fabrication))
      e.date_expiration = 'Doit être après la fabrication';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      quantite_entre:  parseInt(form.quantite_entre),
      quantite_sortie: parseInt(form.quantite_sortie || 0),
      id_medoc:        parseInt(form.id_medoc),
    };
    try {
      if (isEdit) {
        await update(selected.id_lot, payload);
        showToast('Lot mis à jour');
      } else {
        await create(payload);
        showToast('Lot créé avec succès');
      }
      closeDrawer();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await remove(confirmDel.id_lot);
      setConfirmDel(null);
      showToast('Lot supprimé');
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const expires30    = lots.filter(l => { const j = Math.ceil((new Date(l.date_expiration) - new Date()) / 86400000); return j >= 0 && j <= 30; }).length;
  const expiredCount = lots.filter(l => new Date(l.date_expiration) < new Date()).length;
  const stockTotal   = lots.reduce((a, l) => a + (l.quantite_entre - l.quantite_sortie), 0);

  return (
    <div className="h-screen flex overflow-hidden rounded-xl border border-white/[0.05] shadow-2xl">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg"
             style={{ background: toast.type === 'error' ? C.red : C.greenDark }}>
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
              <Package size={20} color={C.green} />
            </div>
            <div>
              <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                Liste des <span style={{ color: C.green }}>lots</span>
              </h1>
              <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
                {lots.length} lot(s) enregistré(s)
              </p>
            </div>
          </div>
          {canEdit && !drawerOpen && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white border-none cursor-pointer"
              style={{ background: C.greenDark }}>
              <Plus size={15} /> Nouveau lot
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 shrink-0">
          <StatCard icon={<Package size={18} color={C.green} />}        iconBg={C.greenSoft}  label="Total lots"   value={lots.length}   valueColor={C.green}     />
          <StatCard icon={<AlertTriangle size={18} color={C.orange} />} iconBg={C.orangeSoft} label="Expire ≤ 30j" value={expires30}     valueColor={C.orange}    />
          <StatCard icon={<CircleDot size={18} color={C.red} />}        iconBg={C.redSoft}    label="Expirés"      value={expiredCount}  valueColor={C.red}       />
          <StatCard icon={<BarChart3 size={18} color={C.greenDark} />}  iconBg={C.greenSoft}  label="Stock total"  value={stockTotal}    valueColor={C.greenDark} />
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

          {/* Table header */}
          <div className="px-5 py-3.5 shrink-0"
               style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <h3 className="text-dynamic font-medium text-[var(--text-primary)]">Répertoire des lots</h3>
            <p className="text-dynamic text-[var(--text-muted)] mt-0.5">{lots.length} lot(s) enregistré(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-[var(--text-muted)] text-dynamic">
                <Loader2 size={20} className="animate-spin" style={{ color: C.green }} />
                Chargement des lots…
              </div>
            ) : lots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                <div className="text-dynamic mb-3 opacity-20">📦</div>
                <p className="text-dynamic font-medium">Aucun lot en stock</p>
              </div>
            ) : (
              <table className="w-full text-left text-dynamic border-collapse">
                <thead>
                  <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0 }}>
                    {['Numéro lot', 'Médicament', 'Fabrication', 'Expiration', 'Entrée', 'Sortie', 'Restant', 'Actions'].map(h => (
                      <th key={h} className="px-3.5 py-3 text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot, i) => {
                    const exp     = EXPIRATION_STATUS(lot.date_expiration);
                    const restant = lot.quantite_entre - lot.quantite_sortie;
                    return (
                      <tr key={lot.id_lot}
                          style={{ borderTop: '0.5px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent' }}>
                        <td className="px-3.5 py-3">
                          <code className="text-dynamic px-2 py-0.5 rounded-[5px] font-mono font-medium"
                                style={{ background: C.greenSoft, color: C.green, border: `0.5px solid ${C.greenBdr}` }}>
                            {lot.numero_lot}
                          </code>
                        </td>
                        <td className="px-3.5 py-3 font-medium text-[var(--text-primary)]">{lot.medicament?.nom ?? '—'}</td>
                        <td className="px-3.5 py-3 text-dynamic text-[var(--text-muted)]">
                          {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-dynamic text-[var(--text-muted)]">
                              {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-dynamic font-medium px-2 py-0.5 rounded-full"
                                  style={{ background: exp.bg, color: exp.color, border: `0.5px solid ${exp.bdr}` }}>
                              {exp.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 font-medium" style={{ color: C.green }}>+{lot.quantite_entre}</td>
                        <td className="px-3.5 py-3 font-medium" style={{ color: C.orange }}>-{lot.quantite_sortie}</td>
                        <td className="text-dynamic font-medium font-mono"
                            style={{ color: restant <= 0 ? C.red : 'var(--text-primary)' }}>
                          {restant}
                        </td>
                        <td className="px-3.5 py-3">
                          {canEdit && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openEdit(lot)}
                                className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] cursor-pointer border-none"
                                style={{ background: C.orangeSoft, border: `0.5px solid ${C.orangeBdr}` }}
                                title="Modifier">
                                <Pencil size={13} color={C.orange} />
                              </button>
                              {isAdmin && !drawerOpen && (
                                <button
                                  onClick={() => setConfirmDel(lot)}
                                  className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] cursor-pointer border-none"
                                  style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}
                                  title="Supprimer">
                                  <Trash2 size={13} color={C.red} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 flex items-center justify-between shrink-0"
               style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <span className="text-dynamic text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-primary)]">{lots.length}</span> lot(s) au total
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
                <Package size={18} color={C.green} />
              </div>
              <div>
                <h2 className="text-dynamic font-medium text-[var(--text-primary)]">
                  {isEdit ? `Modifier : ${selected?.numero_lot}` : 'Nouveau lot'}
                </h2>
                <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
                  {isEdit ? 'Édition du lot' : 'Créer un nouveau lot'}
                </p>
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

            {/* Médicament */}
            <Field label="Médicament" error={errors.id_medoc} icon={<FlaskConical size={13} />}>
              <select
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.id_medoc ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                value={form.id_medoc}
                onChange={e => set('id_medoc', e.target.value)}
                disabled={isEdit}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.id_medoc ? C.red : 'var(--border)'}>
                <option value="">-- Choisir --</option>
                {medicaments.map(m => (
                  <option key={m.id_medoc} value={m.id_medoc}>{m.nom} ({m.forme})</option>
                ))}
              </select>
              {errors.id_medoc && <span className="text-dynamic" style={{ color: C.red }}>{errors.id_medoc}</span>}
            </Field>

            {/* Numéro lot */}
            <Field label="Numéro de lot" error={errors.numero_lot} icon={<Hash size={13} />}>
              <input
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.numero_lot ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="LOT-2024-001"
                value={form.numero_lot}
                onChange={e => set('numero_lot', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.numero_lot ? C.red : 'var(--border)'}
              />
              {errors.numero_lot && <span className="text-dynamic" style={{ color: C.red }}>{errors.numero_lot}</span>}
            </Field>

            {/* Dates */}
            <Field label="Date de fabrication" error={errors.date_fabrication} icon={<Calendar size={13} />}>
              <input
                type="date"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.date_fabrication ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                value={form.date_fabrication}
                onChange={e => set('date_fabrication', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.date_fabrication ? C.red : 'var(--border)'}
              />
              {errors.date_fabrication && <span className="text-dynamic" style={{ color: C.red }}>{errors.date_fabrication}</span>}
            </Field>

            <Field label="Date d'expiration" error={errors.date_expiration} icon={<Calendar size={13} />}>
              <input
                type="date"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.date_expiration ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                value={form.date_expiration}
                onChange={e => set('date_expiration', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.date_expiration ? C.red : 'var(--border)'}
              />
              {errors.date_expiration && <span className="text-dynamic" style={{ color: C.red }}>{errors.date_expiration}</span>}
            </Field>

            {/* Quantités */}
            <Field label="Quantité entrée" error={errors.quantite_entre} icon={<Plus size={13} />}>
              <input
                type="number" min="1"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.quantite_entre ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="500"
                value={form.quantite_entre}
                onChange={e => set('quantite_entre', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.quantite_entre ? C.red : 'var(--border)'}
              />
              {errors.quantite_entre && <span className="text-dynamic" style={{ color: C.red }}>{errors.quantite_entre}</span>}
            </Field>

            <Field label="Quantité sortie" error={errors.quantite_sortie} icon={<Plus size={13} />}>
              <input
                type="number" min="0"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.quantite_sortie ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="0"
                value={form.quantite_sortie}
                onChange={e => set('quantite_sortie', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

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
                  : isEdit ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Modal Suppression ── */}
      {confirmDel && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000]"
             style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="text-center max-w-[380px] w-[90%] px-10 py-10 rounded-2xl"
               style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                 style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}>
              <Trash2 size={24} color={C.red} />
            </div>
            <h3 className="font-medium text-dynamic mb-2 text-[var(--text-primary)]">Supprimer ce lot ?</h3>
            <p className="text-dynamic leading-relaxed mb-8 text-[var(--text-muted)]">
              Le lot <strong style={{ color: 'var(--text-primary)' }}>#{confirmDel?.numero_lot}</strong> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                disabled={saving}
                className="flex-1 py-3 rounded-[10px] font-medium text-dynamic cursor-pointer"
                style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-3 rounded-[10px] font-medium text-dynamic text-white cursor-pointer border-none flex items-center justify-center disabled:opacity-60"
                style={{ background: C.red }}>
                {saving
                  ? <Loader2 size={14} className="animate-spin" />
                  : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
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