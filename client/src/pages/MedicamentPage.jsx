import { useState } from 'react';
import { useMedicaments } from '../hooks/useMedicaments';
import { useAuth } from '../context/AuthContext';
import {
  Pill, AlertTriangle, CheckCircle2, Search, Trash2,
  Plus, X, Check, Pencil, Loader2,
  Hash, Tag, FlaskConical, Gauge, Coins, BellDot, CalendarClock
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
};

const FORMES = ['comprimé', 'gélule', 'sirop', 'injectable', 'pommade', 'suppositoire', 'patch', 'autre'];

const EMPTY = {
  code_cip: '', nom: '', forme: '', dosage: '',
  prix_unitaire: '', seuil_alerte_qte: '', seuil_alerte_peremption: '',
};

export default function MedicamentsPage() {
  const { medicaments, loading, error, search, setSearch, create, update, remove } = useMedicaments();
  const { isAdmin, isPharmacien } = useAuth();
  const canEdit = isAdmin || isPharmacien;

  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [filtre,      setFiltre]      = useState('');
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});

  const isEdit = !!selected;

  const total     = medicaments.length;
  const critiques = medicaments.filter(m => (m.stock_actuel ?? 0) <= m.seuil_alerte_qte).length;
  const normaux   = total - critiques;

  const displayed = filtre === 'critique'
    ? medicaments.filter(m => (m.stock_actuel ?? 0) <= m.seuil_alerte_qte)
    : filtre === 'normal'
    ? medicaments.filter(m => (m.stock_actuel ?? 0) > m.seuil_alerte_qte)
    : medicaments;

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

  const openEdit = (m) => {
    setSelected(m);
    setForm({
      code_cip:               m.code_cip,
      nom:                    m.nom,
      forme:                  m.forme,
      dosage:                 String(m.dosage),
      prix_unitaire:          String(m.prix_unitaire),
      seuil_alerte_qte:       String(m.seuil_alerte_qte),
      seuil_alerte_peremption:String(m.seuil_alerte_peremption),
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
    if (!form.code_cip.trim())                            e.code_cip = 'Requis';
    if (!form.nom.trim())                                 e.nom = 'Requis';
    if (!form.forme)                                      e.forme = 'Requis';
    if (!form.dosage || isNaN(form.dosage))               e.dosage = 'Nombre requis';
    if (!form.prix_unitaire || isNaN(form.prix_unitaire)) e.prix_unitaire = 'Nombre requis';
    if (!form.seuil_alerte_qte || isNaN(form.seuil_alerte_qte)) e.seuil_alerte_qte = 'Nombre requis';
    if (!form.seuil_alerte_peremption || isNaN(form.seuil_alerte_peremption)) e.seuil_alerte_peremption = 'Nombre requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      dosage:                  parseFloat(form.dosage),
      prix_unitaire:           parseInt(form.prix_unitaire),
      seuil_alerte_qte:        parseInt(form.seuil_alerte_qte),
      seuil_alerte_peremption: parseInt(form.seuil_alerte_peremption),
    };
    try {
      if (isEdit) {
        await update(selected.id_medoc, payload);
        showToast('Médicament modifié');
      } else {
        await create(payload);
        showToast('Médicament ajouté avec succès');
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
      await remove(confirmDel.id_medoc);
      setConfirmDel(null);
      showToast('Médicament supprimé');
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

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
              <Pill size={20} color={C.green} />
            </div>
            <div>
              <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                Liste de <span style={{ color: C.green }}>médicaments</span>
              </h1>
              <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
                {total} médicament(s) dans la base
              </p>
            </div>
          </div>
          {canEdit && !drawerOpen && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white border-none cursor-pointer"
              style={{ background: C.greenDark }}>
              <Plus size={15} /> Nouveau médicament
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 shrink-0">
          <StatCard icon={<Pill size={18} color={C.green} />}           iconBg={C.greenSoft} label="Total médicaments" value={total}     valueColor={C.green}     />
          <StatCard icon={<AlertTriangle size={18} color={C.red} />}    iconBg={C.redSoft}   label="Stock critique"    value={critiques} valueColor={C.red}       />
          <StatCard icon={<CheckCircle2 size={18} color={C.greenDark}/>} iconBg={C.greenSoft} label="Stock normal"      value={normaux}   valueColor={C.greenDark} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <div className="flex items-center gap-2 px-3.5 rounded-[10px] flex-1 max-w-[360px]"
               style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}
               onFocusCapture={e => e.currentTarget.style.borderColor = C.green}
               onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="flex-1 bg-transparent py-2.5 text-dynamic outline-none placeholder:opacity-40 text-[var(--text-primary)]"
              style={{ border: 'none' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un médicament…"
            />
            {search && (
              <button onClick={() => setSearch('')} className="border-none bg-transparent cursor-pointer p-0">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { val: '',         label: 'Tous'        },
              { val: 'normal',   label: '✓ Normaux'   },
              { val: 'critique', label: '⚠ Critiques' },
            ].map(f => {
              const active = filtre === f.val;
              return (
                <button
                  key={f.val}
                  onClick={() => setFiltre(f.val)}
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
            <h3 className="text-dynamic font-medium text-[var(--text-primary)]">Répertoire des médicaments</h3>
            <p className="text-dynamic text-[var(--text-muted)] mt-0.5">{displayed.length} sur {total} médicament(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-[var(--text-muted)] text-dynamic">
                <Loader2 size={20} className="animate-spin" style={{ color: C.green }} />
                Chargement…
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                <div className="text-dynamic mb-3 opacity-20">💊</div>
                <p className="text-dynamic font-medium">Aucun médicament trouvé</p>
                <p className="text-dynamic mt-1">
                  {search ? `Aucun résultat pour « ${search} »` : 'Cliquez sur « Nouveau médicament » pour commencer'}
                </p>
              </div>
            ) : (
              <table className="w-full text-dynamic border-collapse">
                <thead>
                  <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0 }}>
                    {['Référence', 'Médicament', 'Forme', 'Dosage', 'Prix', 'Seuil stock', 'Péremption', ...(canEdit ? ['Actions'] : [])].map(h => (
                      <th key={h} className="px-3.5 py-3 text-left text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((m, i) => (
                    <tr key={m.id_medoc}
                        style={{ borderTop: '0.5px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent'}>
                      <td className="px-3.5 py-3">
                        <span className="text-dynamic font-mono px-2 py-0.5 rounded-[5px]"
                              style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                          {m.code_cip}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="font-medium text-[var(--text-primary)]">{m.nom}</span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="text-dynamic px-2 py-0.5 rounded-full font-medium"
                              style={{ background: C.greenSoft, color: C.greenDark, border: `0.5px solid ${C.greenBdr}` }}>
                          {m.forme}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-[var(--text-secondary)]">{m.dosage} mg</td>
                      <td className="px-3.5 py-3 font-medium text-[var(--text-primary)]">
                        {Number(m.prix_unitaire).toLocaleString()} Ar
                      </td>
                      <td className="px-3.5 py-3 font-mono text-[var(--text-secondary)]">{m.seuil_alerte_qte}</td>
                      <td className="px-3.5 py-3 font-mono text-[var(--text-secondary)]">{m.seuil_alerte_peremption}j</td>
                      {canEdit && (
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(m)}
                              className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] cursor-pointer border-none"
                              style={{ background: C.orangeSoft, border: `0.5px solid ${C.orangeBdr}` }}
                              title="Modifier">
                              <Pencil size={13} color={C.orange} />
                            </button>
                            {isAdmin && !drawerOpen && (
                              <button
                                onClick={() => setConfirmDel(m)}
                                className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] cursor-pointer border-none"
                                style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}
                                title="Supprimer">
                                <Trash2 size={13} color={C.red} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-5 py-3 flex items-center justify-between shrink-0"
               style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <span className="text-dynamic text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-primary)]">{displayed.length}</span> médicament(s)
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
                <Pill size={18} color={C.green} />
              </div>
              <div>
                <h2 className="text-dynamic font-medium text-[var(--text-primary)]">
                  {isEdit ? `Modifier : ${selected?.nom}` : 'Nouveau médicament'}
                </h2>
                <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
                  {isEdit ? 'Édition du médicament' : 'Ajouter un médicament'}
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

            <Field label="Code CIP" error={errors.code_cip} icon={<Hash size={13} />}>
              <input
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.code_cip ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="3400935514688"
                value={form.code_cip}
                onChange={e => set('code_cip', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.code_cip ? C.red : 'var(--border)'}
              />
              {errors.code_cip && <Err>{errors.code_cip}</Err>}
            </Field>

            <Field label="Nom" error={errors.nom} icon={<Tag size={13} />}>
              <input
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.nom ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="Paracétamol 500mg"
                value={form.nom}
                onChange={e => set('nom', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.nom ? C.red : 'var(--border)'}
              />
              {errors.nom && <Err>{errors.nom}</Err>}
            </Field>

            <Field label="Forme" error={errors.forme} icon={<FlaskConical size={13} />}>
              <select
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.forme ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                value={form.forme}
                onChange={e => set('forme', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.forme ? C.red : 'var(--border)'}>
                <option value="">-- Choisir --</option>
                {FORMES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.forme && <Err>{errors.forme}</Err>}
            </Field>

            <Field label="Dosage (mg)" error={errors.dosage} icon={<Gauge size={13} />}>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.dosage ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="500"
                value={form.dosage}
                onChange={e => set('dosage', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.dosage ? C.red : 'var(--border)'}
              />
              {errors.dosage && <Err>{errors.dosage}</Err>}
            </Field>

            <Field label="Prix (Ar)" error={errors.prix_unitaire} icon={<Coins size={13} />}>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.prix_unitaire ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="250"
                value={form.prix_unitaire}
                onChange={e => set('prix_unitaire', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.prix_unitaire ? C.red : 'var(--border)'}
              />
              {errors.prix_unitaire && <Err>{errors.prix_unitaire}</Err>}
            </Field>

            <Field label="Seuil alerte stock" error={errors.seuil_alerte_qte} icon={<BellDot size={13} />}>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.seuil_alerte_qte ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="50"
                value={form.seuil_alerte_qte}
                onChange={e => set('seuil_alerte_qte', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.seuil_alerte_qte ? C.red : 'var(--border)'}
              />
              {errors.seuil_alerte_qte && <Err>{errors.seuil_alerte_qte}</Err>}
            </Field>

            <Field label="Seuil péremption (jours)" error={errors.seuil_alerte_peremption} icon={<CalendarClock size={13} />}>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${errors.seuil_alerte_peremption ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                placeholder="30"
                value={form.seuil_alerte_peremption}
                onChange={e => set('seuil_alerte_peremption', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = errors.seuil_alerte_peremption ? C.red : 'var(--border)'}
              />
              {errors.seuil_alerte_peremption && <Err>{errors.seuil_alerte_peremption}</Err>}
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
            <h3 className="font-medium text-dynamic mb-2 text-[var(--text-primary)]">Supprimer ce médicament ?</h3>
            <p className="text-dynamic leading-relaxed mb-8 text-[var(--text-muted)]">
              <strong style={{ color: 'var(--text-primary)' }}>{confirmDel?.nom}</strong> sera définitivement retiré.
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
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Supprimer'}
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

function Err({ children }) {
  return <span className="text-dynamic" style={{ color: C.red }}>{children}</span>;
}