import { useState, useEffect } from 'react';
import { useLots } from '../hooks/useLots';
import { useAuth } from '../context/AuthContext';
import { getMedicaments } from '../services/medicament.api';
import {
  Package, Plus, AlertTriangle, CircleDot, BarChart3,
  Pencil, Trash2, X, Loader2, Hash, Calendar, FlaskConical, Check
} from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from 'date-fns/locale/fr';
registerLocale('fr', fr);

const EMPTY = {
  numero_lot: '', date_fabrication: '', date_expiration: '',
  quantite_entre: '', quantite_sortie: '0', id_medoc: '',
};

/* ─── Meta statuts d'expiration configurés pour Tailwind ─── */
const EXPIRATION_STATUS = (dateExp) => {
  const j = Math.ceil((new Date(dateExp) - new Date()) / 86400000);
  if (j < 0) return { 
    label: 'Expiré', 
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' 
  };
  if (j <= 30) return { 
    label: `${j}j`, 
    badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' 
  };
  if (j <= 90) return { 
    label: `${j}j`, 
    badge: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30' 
  };
  return { 
    label: `${j}j`, 
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' 
  };
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
              <Package size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-dynamic">
                Liste des <span className="text-emerald-600 dark:text-emerald-400">lots</span>
              </h1>
              <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lots.length} lot(s) enregistré(s)
              </p>
            </div>
          </div>
          {canEdit && !drawerOpen && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-colors border-none">
              <Plus size={15} /> Nouveau lot
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 shrink-0">
          <StatCard icon={<Package size={18} />} iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" label="Total lots" value={lots.length} valueColor="text-emerald-600 dark:text-emerald-400" />
          <StatCard icon={<AlertTriangle size={18} />} iconBg="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" label="Expire ≤ 30j" value={expires30} valueColor="text-orange-600 dark:text-orange-400" />
          <StatCard icon={<CircleDot size={18} />} iconBg="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" label="Expirés" value={expiredCount} valueColor="text-red-600 dark:text-red-400" />
          <StatCard icon={<BarChart3 size={18} />} iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" label="Stock total" value={stockTotal} valueColor="text-emerald-700 dark:text-emerald-300" />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg text-dynamic bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">

          {/* Table header */}
          <div className="px-5 py-3.5 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-dynamic font-medium text-zinc-900 dark:text-zinc-50">Répertoire des lots</h3>
            <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">{lots.length} lot(s) enregistré(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-dynamic text-zinc-500 dark:text-zinc-400">
                <Loader2 size={20} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                Chargement des lots…
              </div>
            ) : lots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-3xl mb-3 opacity-20 text-zinc-400 text-dynamic">📦</div>
                <p className="text-dynamic font-medium text-zinc-900 dark:text-zinc-50">Aucun lot en stock</p>
              </div>
            ) : (
              <table className="w-full text-left text-dynamic border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                    {['Numéro lot', 'Médicament', 'Fabrication', 'Expiration', 'Entrée', 'Sortie', 'Restant', 'Actions'].map(h => (
                      <th key={h} className="px-3.5 py-3 text-dynamic font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {lots.map((lot, i) => {
                    const exp     = EXPIRATION_STATUS(lot.date_expiration);
                    const restant = lot.quantite_entre - lot.quantite_sortie;
                    return (
                      <tr key={lot.id_lot} className={`transition-colors hover:bg-emerald-500/[0.02] ${
                        i % 2 !== 0 ? 'bg-zinc-50/50 dark:bg-zinc-900/20' : 'bg-transparent'
                      }`}>
                        <td className="px-3.5 py-3">
                          <code className="text-dynamic font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400">
                            {lot.numero_lot}
                          </code>
                        </td>
                        <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-50 text-dynamic">{lot.medicament?.nom ?? '—'}</td>
                        <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-400 text-dynamic">
                          {new Date(lot.date_fabrication).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-600 dark:text-zinc-400 text-dynamic">
                              {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                            </span>
                            <span className={`text-dynamic font-semibold px-2 py-0.5 rounded-full border ${exp.badge}`}>
                              {exp.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-emerald-600 dark:text-emerald-400 text-dynamic">+{lot.quantite_entre}</td>
                        <td className="px-3.5 py-3 font-semibold text-orange-600 dark:text-orange-400 text-dynamic">-{lot.quantite_sortie}</td>
                        <td className={`px-3.5 py-3 font-semibold font-mono text-dynamic ${restant <= 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
                          {restant}
                        </td>
                        <td className="px-3.5 py-3">
                          {canEdit && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openEdit(lot)}
                                className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-colors"
                                title="Modifier">
                                <Pencil size={13} className="text-orange-600 dark:text-orange-400" />
                              </button>
                              {isAdmin && !drawerOpen && (
                                <button
                                  onClick={() => setConfirmDel(lot)}
                                  className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                                  title="Supprimer">
                                  <Trash2 size={13} className="text-red-500 dark:text-red-400" />
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
          <div className="px-5 py-3 flex items-center justify-between shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-dynamic text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">{lots.length}</span> lot(s) au total
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
                <Package size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">
                  {isEdit ? `Modifier : ${selected?.numero_lot}` : 'Nouveau lot'}
                </h2>
                <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isEdit ? 'Édition du lot' : 'Créer un nouveau lot'}
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

            {/* Médicament */}
            <Field label="Médicament" icon={<FlaskConical size={13} />}>
              <select
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.id_medoc ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                value={form.id_medoc}
                onChange={e => set('id_medoc', e.target.value)}
                disabled={isEdit}>
                <option value="">-- Choisir --</option>
                {medicaments.map(m => (
                  <option key={m.id_medoc} value={m.id_medoc}>{m.nom} ({m.forme})</option>
                ))}
              </select>
              {errors.id_medoc && <span className="text-dynamic text-red-500 font-medium mt-1 inline-block">{errors.id_medoc}</span>}
            </Field>

            {/* Numéro lot */}
            <Field label="Numéro de lot" icon={<Hash size={13} />}>
              <input
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.numero_lot ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="LOT-2026-001"
                value={form.numero_lot}
                onChange={e => set('numero_lot', e.target.value)}
              />
              {errors.numero_lot && <span className="text-dynamic text-red-500 font-medium mt-1 inline-block">{errors.numero_lot}</span>}
            </Field>

            {/* Dates */}
            <Field label="Date de fabrication" icon={<Calendar size={13} />}>
              <DatePicker
                selected={form.date_fabrication ? new Date(form.date_fabrication) : null}
                onChange={(date) => set('date_fabrication', date ? date.toISOString() : '')}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                placeholderText="jj/mm/aaaa"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors ${
                  errors.date_fabrication 
                    ? 'border-red-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500'
                }`}
              />
              {errors.date_fabrication && <span className="text-dynamic text-red-500 mt-1 block">{errors.date_fabrication}</span>}
            </Field>

            <Field label="Date d'expiration" icon={<Calendar size={13} />}>
              <DatePicker
                selected={form.date_expiration ? new Date(form.date_expiration) : null}
                onChange={(date) => set('date_expiration', date ? date.toISOString() : '')}
                dateFormat="dd/MM/yyyy"
                locale="fr"
                placeholderText="jj/mm/aaaa"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.date_expiration 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
              />
              {errors.date_expiration && (
                <span className="text-dynamic text-red-500 font-medium mt-1 inline-block">
                  {errors.date_expiration}
                </span>
              )}
            </Field>

            {/* Quantités */}
            <Field label="Quantité entrée" icon={<Plus size={13} />}>
              <input
                type="number" min="1"
                className={`w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border transition-colors text-zinc-900 dark:text-zinc-50 ${
                  errors.quantite_entre ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500'
                }`}
                placeholder="500"
                value={form.quantite_entre}
                onChange={e => set('quantite_entre', e.target.value)}
              />
              {errors.quantite_entre && <span className="text-dynamic text-red-500 font-medium mt-1 inline-block">{errors.quantite_entre}</span>}
            </Field>

            <Field label="Quantité sortie" icon={<Plus size={13} />}>
              <input
                type="number" min="0"
                className="w-full pl-8 pr-3 py-2.5 text-dynamic bg-zinc-50 dark:bg-zinc-900 rounded-lg outline-none border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors text-zinc-900 dark:text-zinc-50"
                placeholder="0"
                value={form.quantite_sortie}
                onChange={e => set('quantite_sortie', e.target.value)}
              />
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
            <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-50 text-dynamic">Supprimer ce lot ?</h3>
            <p className="text-dynamic leading-relaxed mb-6 text-zinc-500 dark:text-zinc-400">
              Le lot <strong className="text-zinc-900 dark:text-zinc-50 text-dynamic">#{confirmDel?.numero_lot}</strong> sera définitivement supprimé.
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

function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className={`text-base font-bold leading-none ${valueColor}`}>{value}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1 text-dynamic">{label}</div>
      </div>
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