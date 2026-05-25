import { useState } from 'react';
import { Key, Eye, EyeOff, Type, Save, Loader2, X, ChevronDown, ChevronUp, HelpCircle, SunMoon } from 'lucide-react';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useFontSize } from '../hooks/useFontSize';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {

  const { updatePassword } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [ fontSize, setFontSize ] = useFontSize();
  const [saving, setSaving] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [openGuide, setOpenGuide] = useState(null);
  
  const [toast, setToast] = useState(null);

  const fontPresets = [
    { label: 'Petite', value: 12 },
    { label: 'Normale', value: 14 },
    { label: 'Grande', value: 16 },
    { label: 'Très grande', value: 18 },
  ];
  
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const guideItems = [
    {
      id: 'first-steps',
      title: "Premiers pas sur l'application",
      content: "Bienvenue sur notre plateforme ! Pour débuter, naviguez à travers les onglets du menu principal. Vous pouvez à tout moment revenir sur votre profil ou ici pour ajuster vos préférences d'utilisation de l'interface."
    },
    {
      id: 'theme-management',
      title: "Gestion du thème clair et sombre",
      content: "Basculez entre l'affichage clair et sombre via le commutateur dédié ci-dessus. Notre mode sombre est spécifiquement conçu pour réduire la fatigue visuelle lors d'utilisations nocturnes."
    },
    {
      id: 'security-best-practices',
      title: "Sécurité et gestion des accès",
      content: "Pour protéger vos informations personnelles, nous vous suggérons d'opter pour un mot de passe robuste combinant des lettres majuscules, minuscules, des chiffres et des symboles de sécurité."
    }
  ];

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return showToast('Veuillez remplir tous les champs', 'error');
    }
    if (form.newPassword !== form.confirmPassword) {
      return showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
    }
    if (form.newPassword.length < 8) {
      return showToast('Le mot de passe doit contenir au moins 8 caractères', 'error');
    }

    setSaving(true);
    try {
      const { message } = await updatePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });

      showToast(message || 'Mot de passe mis à jour avec succès');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleGuide = (id) => {
    setOpenGuide(prev => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[560px] mx-auto">
      
      {/* Toast de notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] px-5 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg flex items-center gap-2"
             style={{ background: toast.type === 'error' ? '#dc2626' : '#16a34a' }}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="cursor-pointer bg-transparent border-none text-white flex items-center">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Paramètres</h1>
        <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
          Personnalisez votre interface et configurez vos options de sécurité
        </p>
      </div>

      {/* ── Section : Apparence ── */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl"
           style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
        <div className="flex items-center gap-2 text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <SunMoon size={14} />
          <span>Apparence</span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-dynamic font-medium text-[var(--text-primary)]">Thème visuel</p>
            <p className="text-dynamic text-[var(--text-muted)] mt-0.5">Choisissez entre un thème clair ou sombre</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Section : Typographie ── */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl"
          style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>

        <div className="flex items-center gap-2 text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <Type size={14} />
          <span>Typographie</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-dynamic font-medium text-[var(--text-primary)]">Taille de police</p>
            <p className="text-dynamic text-[var(--text-muted)] mt-0.5">Ajustez la taille du texte dans l'interface</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-dynamic text-[var(--text-muted)]">A</span>
            <input
              type="range" min="12" max="20" step="1"
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-24 accent-green-600"
            />
            <span className="text-[17px] text-[var(--text-muted)]">A</span>
            <span className="text-dynamic font-medium text-[var(--text-primary)] w-8 text-right">
              {fontSize}px
            </span>
          </div>
        </div>

        {/* Aperçu */}
        <div className="rounded-lg p-3"
            style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)' }}>
          <p className="text-dynamic font-medium uppercase tracking-wide text-[var(--text-muted)] mb-2">Aperçu</p>
          <p className="text-dynamic leading-relaxed text-[var(--text-primary)]">
            Voici un exemple de texte avec la taille sélectionnée.
          </p>
        </div>

        {/* Presets rapides */}
        <div className="grid grid-cols-4 gap-2">
          {fontPresets.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFontSize(value)}
              className="py-1.5 rounded-lg text-dynamic border transition-colors"
              style={{
                background: fontSize === value ? 'rgba(22,163,74,0.1)' : 'var(--bg-content)',
                border: fontSize === value ? '0.5px solid #16a34a' : '0.5px solid var(--border)',
                color: fontSize === value ? '#16a34a' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section : Sécurité ── */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl"
           style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
        
        <div className="flex items-center gap-2 text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <Key size={14} />
          <span>Sécurité du compte</span>
        </div>

        <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
          
          <Field label="Mot de passe actuel">
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                className="w-full px-3 pr-9 py-2.5 rounded-lg text-dynamic outline-none"
                style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="Saisissez votre mot de passe actuel"
                value={form.currentPassword}
                onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center">
                {showCurrentPass ? <EyeOff size={14} color="var(--text-muted)" /> : <Eye size={14} color="var(--text-muted)" />}
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nouveau mot de passe">
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  className="w-full px-3 pr-9 py-2.5 rounded-lg text-dynamic outline-none"
                  style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Min. 8 caractères"
                  value={form.newPassword}
                  onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center">
                  {showNewPass ? <EyeOff size={14} color="var(--text-muted)" /> : <Eye size={14} color="var(--text-muted)" />}
                </button>
              </div>
            </Field>

            <Field label="Confirmer le mot de passe">
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  className="w-full px-3 pr-9 py-2.5 rounded-lg text-dynamic outline-none"
                  style={{ background: 'var(--bg-content)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Saisissez-le à nouveau"
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center">
                  {showConfirmPass ? <EyeOff size={14} color="var(--text-muted)" /> : <Eye size={14} color="var(--text-muted)" />}
                </button>
              </div>
            </Field>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer disabled:opacity-60 mt-2"
            style={{ background: '#16a34a' }}>
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Mise à jour…</>
            ) : (
              <><Save size={14} /> Mettre à jour le mot de passe</>
            )}
          </button>

        </form>
      </div>

      {/* ── Section : Guide d'utilisation ── */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl"
           style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
        
        <div className="flex items-center gap-2 text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <HelpCircle size={14} />
          <span>Guide d'utilisation</span>
        </div>

        <div className="flex flex-col gap-2">
          {guideItems.map((item) => {
            const isOpen = openGuide === item.id;
            return (
              <div 
                key={item.id}
                className="rounded-lg transition-colors"
                style={{ 
                  background: 'var(--bg-content)', 
                  border: '0.5px solid var(--border)' 
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleGuide(item.id)}
                  className="w-full px-4 py-3 text-left flex justify-between items-center cursor-pointer border-none bg-transparent"
                >
                  <span className="text-dynamic font-medium text-[var(--text-primary)]">
                    {item.title}
                  </span>
                  <span className="text-[var(--text-muted)] flex items-center">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-4 pb-4 pt-1" style={{ borderTop: '0.5px solid var(--border)' }}>
                    <p className="text-dynamic text-[var(--text-muted)] leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

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