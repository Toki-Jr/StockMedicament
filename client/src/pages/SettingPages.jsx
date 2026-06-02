import { useState } from 'react';
import { Key, Eye, EyeOff, Type, Save, Loader2, X, ChevronDown, ChevronUp, HelpCircle, SunMoon, Settings } from 'lucide-react';
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
  const [fontSize, setFontSize] = useFontSize();
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
      title: "Premiers pas sur Stock'méd",
      content: "Bienvenue sur votre plateforme ! Pour débuter, explorez votre tableau de bord interactif. Utilisez la barre latérale pour naviguer entre le catalogue des médicaments, le suivi des lots et le journal des mouvements de stock."
    },
    {
      id: 'theme-management',
      title: "Gestion du thème (Clair / Sombre)",
      content: "Basculez instantanément entre l'affichage clair et sombre via le bouton icône (Soleil/Lune) situé dans la barre de navigation supérieure. Le mode sombre est idéal pour réduire la fatigue visuelle lors des gardes de nuit à l'officine."
    },
    {
      id: 'security-best-practices',
      title: "Sécurité & Gestion des accès",
      content: "L'accès aux données de la pharmacie est strictement réglementé selon votre rôle (Administrateur, Pharmacien ou Staff). Pour garantir la traçabilité des commandes et des modifications de stock, veillez à ne jamais partager vos identifiants."
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
            <Settings size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-dynamic">
              Paramètres du <span className="text-emerald-600 dark:text-emerald-400">système</span>
            </h1>
            <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
              Personnalisez votre interface et configurez vos options de sécurité
            </p>
          </div>
        </div>
      </div>

      {/* ── Zone de contenu défilante ── */}
      <div className="flex-1 overflow-y-auto pr-1 mt-5 flex flex-col gap-5 max-w-[580px] w-full mx-auto">
        
        {/* ── Section : Apparence ── */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <SunMoon size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Apparence</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 opacity-60 ml-1" />
          </div>
          
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">Thème visuel</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Basculez entre le mode clair et le mode sombre</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* ── Section : Typographie ── */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <Type size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Typographie</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 opacity-60 ml-1" />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-dynamic">Taille de police</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Ajustez l'échelle de lecture globale</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">A</span>
              <input
                type="range" min="12" max="20" step="1"
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-24 accent-emerald-600 cursor-pointer"
              />
              <span className="text-base text-zinc-400 dark:text-zinc-500">A</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-10 text-right">
                {fontSize}px
              </span>
            </div>
          </div>

          {/* Aperçu */}
          <div className="rounded-lg p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Aperçu en temps réel</p>
            <p className="text-dynamic leading-relaxed text-zinc-800 dark:text-zinc-200">
              Voici un exemple de phrase pour tester l'accessibilité et le confort de lecture de l'interface.
            </p>
          </div>

          {/* Presets rapides */}
          <div className="grid grid-cols-4 gap-2">
            {fontPresets.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFontSize(value)}
                className={`py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  fontSize === value 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section : Sécurité ── */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <Key size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Sécurité du compte</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 opacity-60 ml-1" />
          </div>

          <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
            <Field label="Mot de passe actuel">
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                  placeholder="Saisissez votre mot de passe actuel"
                  value={form.currentPassword}
                  onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {showCurrentPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nouveau mot de passe">
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                    placeholder="Min. 8 caractères"
                    value={form.newPassword}
                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirmer le mot de passe">
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    className="w-full px-3 py-2.5 rounded-lg text-dynamic outline-none transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                    placeholder="Validation conforme"
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer flex items-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {showConfirmPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </Field>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 w-full mt-2 py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer disabled:opacity-50 transition-colors bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <><Loader2 size={13} className="animate-spin" /> Mise à jour…</>
              ) : (
                <><Save size={13} /> Mettre à jour le mot de passe</>
              )}
            </button>
          </form>
        </div>

        {/* ── Section : Guide d'utilisation ── */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 mb-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <HelpCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Centre d'aide & documentation</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 opacity-60 ml-1" />
          </div>

          <div className="flex flex-col gap-2">
            {guideItems.map((item) => {
              const isOpen = openGuide === item.id;
              return (
                <div 
                  key={item.id}
                  className="rounded-lg overflow-hidden transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <button
                    type="button"
                    onClick={() => toggleGuide(item.id)}
                    className="w-full px-4 py-3 text-left flex justify-between items-center cursor-pointer border-none bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 text-dynamic">
                      {item.title}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 flex items-center">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
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