import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe, deleteMe } from '../services/profile.api';
import { User, Mail, LogOut, Trash2, Camera, Save, X, Loader2, Eye, EyeOff } from 'lucide-react';

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

      // Mettre à jour le contexte
      const stored = JSON.parse(sessionStorage.getItem('user') ?? '{}');
      const merged = { ...stored, ...updated };
      sessionStorage.setItem('user', JSON.stringify(merged));

      showToast('Profil mis à jour');
      setForm(p => ({ ...p, password: '' }));
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMe();
      logout();
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const initials = `${user?.nom?.[0] ?? ''}${user?.prenom?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col gap-6 max-w-[560px] mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg flex items-center gap-2"
             style={{ background: toast.type === 'error' ? '#dc2626' : '#16a34a' }}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="border-none bg-transparent cursor-pointer p-0 flex items-center"><X size={14} /></button>
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-dynamic font-medium text-[var(--text-primary)]">Mon profil</h1>
        <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* ── Avatar ── */}
      <div className="flex flex-col items-center gap-4 py-6 px-5 rounded-2xl"
           style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
        <div className="relative">
          {photo ? (
            <img src={photo} alt="avatar"
                 className="w-24 h-24 rounded-full object-cover"
                 style={{ border: '3px solid #16a34a' }} />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-dynamic font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80)' }}>
              {initials}
            </div>
          )}
          {/* Bouton caméra */}
          <button
            onClick={() => fileRef.current.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer"
            style={{ background: '#16a34a', borderColor: 'var(--bg-sidebar)' }}>
            <Camera size={14} color="white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className="text-center">
          <p className="text-dynamic font-medium text-[var(--text-primary)]">
            {user?.nom} {user?.prenom}
          </p>
          <span className="text-dynamic px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* ── Formulaire ── */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl"
           style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
        <p className="text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Informations personnelles
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom">
            <input
              className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none"
              style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
              value={form.nom}
              onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
            />
          </Field>
          <Field label="Prénom">
            <input
              className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none"
              style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
              value={form.prenom}
              onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Email">
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-muted)" />
            <input
              type="email"
              className="w-full pl-8 pr-3 py-2.5 rounded-lg text-dynamic outline-none"
              style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
        </Field>

        <Field label="Nouveau mot de passe (optionnel)">
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="w-full px-3 pr-9 py-2.5 rounded-lg text-dynamic outline-none"
              style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="Laisser vide pour ne pas changer"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
            <button
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center">
              {showPass ? <EyeOff size={14} color="var(--text-muted)" /> : <Eye size={14} color="var(--text-muted)" />}
            </button>
          </div>
        </Field>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer disabled:opacity-60"
          style={{ background: '#16a34a' }}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde…</> : <><Save size={14} /> Sauvegarder</>}
        </button>
      </div>

      {/* ── Thème ── */}
      <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
           style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
        <div>
          <p className="text-dynamic font-medium text-[var(--text-primary)]">Apparence</p>
          <p className="text-dynamic text-[var(--text-muted)] mt-0.5">Basculer entre le mode clair et sombre</p>
        </div>
        {/* <ThemeToggle /> */}
      </div>

      {/* ── Actions danger ── */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl"
           style={{ background: 'rgba(220,38,38,0.04)', border: '0.5px solid rgba(220,38,38,0.2)' }}>
        <p className="text-dynamic font-medium uppercase tracking-wider" style={{ color: '#dc2626' }}>
          Zone de danger
        </p>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer border-none w-full"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '0.5px solid rgba(220,38,38,0.2)' }}>
          <LogOut size={14} /> Se déconnecter
        </button>

        <button
          onClick={() => setConfirmDel(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer border-none w-full"
          style={{ background: '#dc2626', color: 'white' }}>
          <Trash2 size={14} /> Supprimer mon compte
        </button>
      </div>

      {/* ── Modal confirm suppression ── */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1000] p-4">
          <div className="bg-[var(--bg-content)] rounded-[16px] w-full max-w-[400px] shadow-2xl overflow-hidden"
               style={{ border: '0.5px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
              <h2 className="text-dynamic font-medium text-[var(--text-primary)]">Supprimer le compte</h2>
              <button onClick={() => setConfirmDel(false)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
            <div className="p-5 text-center">
              <Trash2 size={40} color="#dc2626" className="mx-auto mb-3" />
              <p className="text-dynamic text-[var(--text-primary)]">
                Supprimer définitivement votre compte ?
              </p>
              <p className="text-dynamic text-[var(--text-muted)] mt-1">
                Toutes vos données seront perdues.
              </p>
            </div>
            <div className="px-5 py-4 flex gap-2.5 justify-end"
                 style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
              <button onClick={() => setConfirmDel(false)}
                      className="px-4 py-2 rounded-lg text-dynamic font-medium cursor-pointer"
                      style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                Annuler
              </button>
              <button onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer"
                      style={{ background: '#dc2626' }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant réutilisable local
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-dynamic font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}