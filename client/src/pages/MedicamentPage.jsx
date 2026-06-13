import { useState } from 'react';
import { useMedicaments } from '../hooks/useMedicaments';
import { useAuth } from '../context/AuthContext';
import {
  Pill, Search, Trash2, Plus, X, Check, Pencil, Loader2,
  Hash, Tag, FlaskConical, Gauge, Coins, BellDot, CalendarClock
} from 'lucide-react';

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
              <Pill size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-dynamic">
                Liste de <span className="text-emerald-600 dark:text-emerald-400">médicaments</span>
              </h1>
              <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                {total} médicament(s) dans la base
              </p>
            </div>
          </div>
          {canEdit && !drawerOpen && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-colors border-none">
              <Plus size={15} /> Nouveau médicament
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <div className="flex items-center gap-2 px-3.5 rounded-lg flex-1 max-w-[360px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors">
            <Search size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              className="flex-1 bg-transparent py-2.5 text-dynamic text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Zone de recherche…"
            />
            {search && (
              <button onClick={() => setSearch('')} className="border-none bg-transparent cursor-pointer p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X size={14} />
              </button>
            )}
          </div>
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
            <h3 className="text-dynamic font-medium text-zinc-900 dark:text-zinc-50">Répertoire des médicaments</h3>
            <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">{displayed.length} sur {total} médicament(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-dynamic text-zinc-500 dark:text-zinc-400">
                <Loader2 size={20} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                Chargement…
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-3xl mb-3 opacity-20 text-zinc-400 text-dynamic">💊</div>
                <p className="text-dynamic font-medium text-zinc-900 dark:text-zinc-50">Aucun médicament trouvé</p>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  {search ? `Aucun résultat pour « ${search} »` : 'Cliquez sur « Nouveau médicament » pour commencer'}
                </p>
              </div>
            ) : (
              <table className="w-full text-dynamic border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                    {['Code du Médicament', 'Nom du Médicament', 'Forme', 'Dosage', 'Prix', 'Seuil stock', 'Péremption', ...(canEdit ? ['Actions'] : [])].map(h => (
                      <th key={h} className="px-3.5 py-3 text-left font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-dynamic">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {displayed.map((m, i) => (
                    <tr key={m.id_medoc} className={`transition-colors hover:bg-emerald-500/[0.02] ${
                      i % 2 !== 0 ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : 'bg-transparent'
                    }`}>
                      <td className="px-3.5 py-3">
                        <span className="font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-dynamic">
                          {m.code_cip}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="font-medium text-zinc-900 dark:text-zinc-50 text-dynamic">{m.nom}</span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-dynamic">
                          {m.forme}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 text-dynamic">{m.dosage} mg</td>
                      <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-50 text-dynamic">
                        {Number(m.prix_unitaire).toLocaleString()} Ar
                      </td>
                      <td className="px-3.5 py-3 font-mono text-zinc-600 dark:text-zinc-400 text-dynamic">{m.seuil_alerte_qte}</td>
                      <td className="px-3.5 py-3 font-mono text-zinc-600 dark:text-zinc-400 text-dynamic">{m.seuil_alerte_peremption}j</td>
                      {canEdit && (
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(m)}
                              className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors"
                              title="Modifier">
                              <Pencil size={13} className="text-orange-600 dark:text-orange-400" />
                            </button>
                            {isAdmin && !drawerOpen && (
                              <button
                                onClick={() => setConfirmDel(m)}
                                className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                                title="Supprimer">
                                <Trash2 size={13} className="text-red-500 dark:text-red-400" />
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

          <div className="px-5 py-3 flex items-center justify-between shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-dynamic text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">{displayed.length}</span> médicament(s)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-dynamic text-zinc-500 dark:text-zinc-400">Synchronisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer formulaire ── */}
      <div className={`shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-zinc-950 ${
             drawerOpen ? 'w-[360px] border-l border-zinc-200 dark:border-zinc-800' : 'w-0'
           }`}>
        <div className="w-[360px] flex flex-col h-full">

          {/* Drawer header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30">
                <Pill size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">
                  {isEdit ? `Modifier : ${selected?.nom}` : 'Nouveau médicament'}
                </h2>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isEdit ? 'Édition du médicament' : 'Ajouter un médicament'}
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer border-none bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            <Field label="Code CIP" icon={<Hash size={13} />}>
              <input
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.code_cip ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="3400935514688"
                value={form.code_cip}
                onChange={e => set('code_cip', e.target.value)}
              />
              {errors.code_cip && <Err>{errors.code_cip}</Err>}
            </Field>

            <Field label="Nom" icon={<Tag size={13} />}>
              <input
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.nom ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="Paracétamol 500mg"
                value={form.nom}
                onChange={e => set('nom', e.target.value)}
              />
              {errors.nom && <Err>{errors.nom}</Err>}
            </Field>

            <Field label="Forme" icon={<FlaskConical size={13} />}>
              <select
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.forme ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                value={form.forme}
                onChange={e => set('forme', e.target.value)}>
                <option value="">-- Choisir --</option>
                {FORMES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.forme && <Err>{errors.forme}</Err>}
            </Field>

            <Field label="Dosage (mg)" icon={<Gauge size={13} />}>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.dosage ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="500"
                value={form.dosage} min={0}
                onChange={e => set('dosage', e.target.value)}
              />
              {errors.dosage && <Err>{errors.dosage}</Err>}
            </Field>

            <Field label="Prix (Ar)" icon={<Coins size={13} />}>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.prix_unitaire ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="250" min={0}
                value={form.prix_unitaire}
                onChange={e => set('prix_unitaire', e.target.value)}
              />
              {errors.prix_unitaire && <Err>{errors.prix_unitaire}</Err>}
            </Field>

            <Field label="Seuil alerte stock" icon={<BellDot size={13} />}>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.seuil_alerte_qte ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="50" min={0}
                value={form.seuil_alerte_qte}
                onChange={e => set('seuil_alerte_qte', e.target.value)}
              />
              {errors.seuil_alerte_qte && <Err>{errors.seuil_alerte_qte}</Err>}
            </Field>

            <Field label="Seuil péremption (jours)" icon={<CalendarClock size={13} />}>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.seuil_alerte_peremption ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="30" min={0}
                value={form.seuil_alerte_peremption}
                onChange={e => set('seuil_alerte_peremption', e.target.value)}
              />
              {errors.seuil_alerte_peremption && <Err>{errors.seuil_alerte_peremption}</Err>}
            </Field>

            {/* Submit */}
            <div className="mt-auto pt-4 flex gap-2.5 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50 transition-colors">
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-colors">
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
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/50 backdrop-blur-sm">
          <div className="text-center max-w-[380px] w-[90%] px-8 py-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30">
              <Trash2 size={24} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-50 text-dynamic">Supprimer ce médicament ?</h3>
            <p className="text-dynamic leading-relaxed mb-6 text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-50 text-dynamic">{confirmDel?.nom}</strong> sera définitivement retiré.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-medium text-dynamic cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-3 rounded-xl font-medium text-dynamic text-white cursor-pointer border-none flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-dynamic font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Err({ children }) {
  return <span className="text-dynamic text-red-500 font-medium mt-1 inline-block">{children}</span>;
}