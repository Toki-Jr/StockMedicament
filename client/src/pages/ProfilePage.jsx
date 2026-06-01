import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe, deleteMe } from '../services/profile.api';
import { Mail, LogOut, Trash2, Camera, Save, X, Loader2, Eye, EyeOff, User } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();

  const [form, setForm] = useState({
    nom:      user?.nom    ?? '',
    prenom:   user?.prenom ?? '',
    email:    user?.email  ?? '',
    password: '',
  });

  const [photo,       setPhoto]       = useState(user?.photo ?? null);
  const [photoFile,   setPhotoFile]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [toast,       setToast]       = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        nom:    form.nom,
        prenom: form.prenom,
        email:  form.email,
        ...(form.password ? { password: form.password } : {}),
        ...(photo && photo !== user?.photo ? { photo } : {}),
      };
      const updated = await updateMe(payload);

      updateUser(updated);

      const stored = JSON.parse(sessionStorage.getItem('user') ?? '{}');
      const merged = { ...stored, ...updated };
      sessionStorage.setItem('user', JSON.stringify(merged));

      showToast('Profil mis à jour avec succès');
      setForm(p => ({ ...p, password: '' }));
    } catch (e) {
      showToast(e.response?.data?.message || 'Une erreur est survenue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMe();
      logout();
    } catch (e) {
      showToast(e.response?.data?.message || 'Impossible de supprimer le compte', 'error');
    }
  };

  const initials = `${user?.nom?.[0] ?? ''}${user?.prenom?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 text-dynamic">

      {/* ── Toast Flottant Harmorisé ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[2000] flex items-center gap-2 px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <X size={14} /> : <Save size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30">
            <User size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-dynamic">
              Mon <span className="text-emerald-600 dark:text-emerald-400">profil</span>
            </h1>
            <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
              Gerez vos informations personnelles et d'identification
            </p>
          </div>
        </div>
      </div>

      {/* ── Zone de contenu défilante (Même comportement que les autres pages) ── */}
      <div className="flex-1 overflow-y-auto pr-1 mt-5 flex flex-col gap-6 max-w-[580px] w-full mx-auto">
        
        {/* ── Section Avatar ── */}
        <div className="flex flex-col items-center gap-4 py-6 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="relative">
            {photo ? (
              <img 
                src={photo} 
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-mono font-bold text-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200/50 dark:border-emerald-900/30">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border transition-transform hover:scale-105 cursor-pointer bg-emerald-600 border-white dark:border-zinc-950 text-white"
            >
              <Camera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <div className="text-center">
            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 text-dynamic">
              {user?.nom} {user?.prenom}
            </p>
            <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30">
              {user?.role}
            </span>
          </div>
        </div>

        {/* ── Formulaire d'édition ── */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Informations personnelles
            </span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 opacity-60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom">
              <input
                type="text"
                className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                value={form.nom}
                onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              />
            </Field>
            <Field label="Prénom">
              <input
                type="text"
                className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                value={form.prenom}
                onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Adresse Email">
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
          </Field>

          <Field label="Nouveau mot de passe">
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="w-full px-3 pr-9 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                placeholder="Laisser vide pour ne pas modifier"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
              <button
                onClick={() => setShowPass(p => !p)}
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 w-full mt-2 py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer disabled:opacity-50 transition-colors bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <><Loader2 size={13} className="animate-spin" /> Enregistrement…</>
            ) : (
              <><Save size={13} /> Enregistrer les modifications</>
            )}
          </button>
        </div>

        {/* ── Thème Apparence ── */}
        <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">Apparence globale</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Basculez entre l'interface claire et sombre</p>
          </div>
          {/* <ThemeToggle /> */}
        </div>

        {/* ── Zone Critique Danger ── */}
        <div className="flex flex-col gap-3 p-5 rounded-xl bg-red-500/[0.02] border border-red-200/40 dark:border-red-900/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Zone de danger
            </span>
            <div className="flex-1 h-px bg-red-200/40 dark:bg-red-900/20" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-dynamic font-medium cursor-pointer border transition-colors bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex-1"
            >
              <LogOut size={13} /> Se déconnecter
            </button>

            <button
              onClick={() => setConfirmDel(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer transition-colors bg-red-600 hover:bg-red-700 flex-1"
            >
              <Trash2 size={13} /> Supprimer le compte
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal de Confirmation (Suppression de compte) ── */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl w-full max-w-[380px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">Confirmation requise</h2>
              <button 
                onClick={() => setConfirmDel(false)}
                className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X size={13} />
              </button>
            </div>
            
            <div className="p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400 border border-red-200/30 dark:border-red-900/30">
                <Trash2 size={16} />
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">
                Voulez-vous vraiment supprimer votre compte ?
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 px-2">
                Cette action est irréversible. Toutes vos données ainsi que votre historique seront effacés de la plateforme.
              </p>
            </div>

            <div className="px-4 py-3 flex gap-2 justify-end bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={() => setConfirmDel(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white border-none cursor-pointer bg-red-600 hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1 w-full text-dynamic">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-0.5">
        {label}
      </label>
      {children}
    </div>
  );
}