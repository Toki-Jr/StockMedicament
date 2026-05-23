import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sun, Moon, Shield } from 'lucide-react';

const ROLES = [
  { value: 'user',       label: 'Utilisateur',  color: '#fca5a5', dot: '#ef4444' },
  { value: 'pharmacien', label: 'Pharmacien',    color: '#93c5fd', dot: '#3b82f6' },
  { value: 'admin',      label: 'Administrateur',color: '#4ade80', dot: '#16a34a' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ nom: '', prenom: '', email: '', password: '', role: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [dark, setDark]       = useState(
    () => document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email || !form.password || !form.role) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  /* ── thème ── */
  const bg         = dark ? '#0d0d0d' : '#f4f7f4';
  const cardBg     = dark ? '#161616' : '#ffffff';
  const cardBorder = dark ? '#252525' : '#e8ede8';
  const cardShadow = dark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.08)';
  const textPri    = dark ? '#f0f0f0' : '#111';
  const textSec    = dark ? '#888'    : '#666';
  const fieldBg    = dark ? '#1e1e1e' : '#f0f5f0';
  const fieldBdr   = dark ? '#2e2e2e' : '#dde8dd';
  const fieldFocus = dark ? '#22c55e' : '#16a34a';
  const fieldText  = dark ? '#e0e0e0' : '#111';
  const iconClr    = dark ? '#555'    : '#9ca3af';
  const toggleBg   = dark ? '#1e1e1e' : '#f0f0f0';
  const toggleClr  = dark ? '#aaa'    : '#555';

  const fieldClass = `flex items-center gap-[10px] px-[14px] rounded-[10px] transition-all duration-200`;

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors duration-300"
      style={{ background: bg }}
    >

      {/* ── Blobs ── */}
      {dark ? (
        <>
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)' }} />
        </>
      ) : (
        <>
          <div className="absolute top-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(134,239,172,0.35) 0%, transparent 65%)' }} />
          <div className="absolute bottom-[-40px] right-[40px] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(134,239,172,0.2) 0%, transparent 65%)' }} />
        </>
      )}

      {/* ── Toggle thème ── */}
      <button
        onClick={toggleTheme}
        className="fixed top-[16px] right-[16px] w-[38px] h-[38px] flex items-center justify-center rounded-[10px] transition-colors duration-200 cursor-pointer z-10"
        style={{ background: toggleBg, color: toggleClr, border: `1px solid ${cardBorder}` }}
        title={dark ? 'Mode clair' : 'Mode sombre'}
      >
        {dark ? <Moon size={17}/> : <Sun size={17}/>}
      </button>

      {/* ── CARD ── */}
      <div
        className="w-full max-w-[420px] rounded-[20px] p-[36px] transition-colors duration-300 relative z-[1]"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
      >

        {/* Logo */}
        <div className="flex items-center gap-[10px] justify-center mb-[24px]">
          <div
            className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center font-black text-[16px] text-white shrink-0"
            style={{ background: '#16a34a', boxShadow: '0 0 14px rgba(22,163,74,0.4)' }}
          >
            S
          </div>
          <div>
            <p className="text-[16px] font-bold leading-none" style={{ color: textPri }}>
              Stock<span style={{ color: '#22c55e' }}>'méd</span>
            </p>
            <p className="text-[11px] mt-[2px]" style={{ color: textSec }}>
              Gestion des médicaments
            </p>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-[24px]">
          <h1 className="text-[22px] font-black tracking-tight m-0 mb-[5px]" style={{ color: textPri }}>
            Inscription
          </h1>
          <p className="text-[13px] m-0" style={{ color: textSec }}>
            Créez votre compte pour accéder à la plateforme.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]" autoComplete="off">

          <div className="flex flex-col gap-[5px]">
            <label className="text-[12px] font-semibold" style={{ color: textSec }}>Nom</label>
            <div
              className={fieldClass}
              style={{ background: fieldBg, border: `1.5px solid ${fieldBdr}` }}
              onFocusCapture={e => e.currentTarget.style.borderColor = fieldFocus}
              onBlurCapture={e  => e.currentTarget.style.borderColor = fieldBdr}
            >
              <User size={15} style={{ color: iconClr, flexShrink: 0 }} />
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Rakoto"
                className="flex-1 bg-transparent py-[11px] text-[13px] outline-none placeholder:opacity-40"
                style={{ color: fieldText }}
              />
            </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[12px] font-semibold" style={{ color: textSec }}>Prénom</label>
              <div
                className={fieldClass}
                style={{ background: fieldBg, border: `1.5px solid ${fieldBdr}` }}
                onFocusCapture={e => e.currentTarget.style.borderColor = fieldFocus}
                onBlurCapture={e  => e.currentTarget.style.borderColor = fieldBdr}
              >
                <User size={15} style={{ color: iconClr, flexShrink: 0 }} />
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="flex-1 bg-transparent py-[11px] text-[13px] outline-none placeholder:opacity-40"
                  style={{ color: fieldText }}
                />
              </div>
            </div>

          {/* Email */}
          <div className="flex flex-col gap-[5px]">
            <label className="text-[12px] font-semibold" style={{ color: textSec }}>Adresse email</label>
            <div
              className={fieldClass}
              style={{ background: fieldBg, border: `1.5px solid ${fieldBdr}` }}
              onFocusCapture={e => e.currentTarget.style.borderColor = fieldFocus}
              onBlurCapture={e  => e.currentTarget.style.borderColor = fieldBdr}
            >
              <Mail size={15} style={{ color: iconClr, flexShrink: 0 }} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jean@pharma.mg"
                className="flex-1 bg-transparent py-[11px] text-[13px] outline-none placeholder:opacity-40"
                style={{ color: fieldText }}
              />
            </div>
          </div>

          {/* Rôle — cartes cliquables */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[12px] font-semibold" style={{ color: textSec }}>Rôle</label>
            <div className="grid grid-cols-3 gap-[8px]">
              {ROLES.map(r => {
                const active = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setForm(p => ({ ...p, role: r.value })); setError(''); }}
                    className="flex flex-col items-center gap-[5px] py-[10px] px-[6px] rounded-[10px] text-[11px] font-semibold transition-all duration-150 cursor-pointer"
                    style={{
                      background: active ? `${r.dot}18` : fieldBg,
                      border: `1.5px solid ${active ? r.dot : fieldBdr}`,
                      color: active ? r.color : textSec,
                    }}
                  >
                    <span
                      className="w-[8px] h-[8px] rounded-full"
                      style={{ background: active ? r.dot : (dark ? '#333' : '#ccc') }}
                    />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-[5px]">
            <label className="text-[12px] font-semibold" style={{ color: textSec }}>Mot de passe</label>
            <div
              className={fieldClass}
              style={{ background: fieldBg, border: `1.5px solid ${fieldBdr}` }}
              onFocusCapture={e => e.currentTarget.style.borderColor = fieldFocus}
              onBlurCapture={e  => e.currentTarget.style.borderColor = fieldBdr}
            >
              <Lock size={15} style={{ color: iconClr, flexShrink: 0 }} />
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="flex-1 bg-transparent py-[11px] text-[13px] outline-none placeholder:opacity-40"
                style={{ color: fieldText }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="cursor-pointer transition-colors"
                style={{ color: iconClr }}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div
              className="flex items-center gap-[8px] px-[14px] py-[10px] rounded-[9px] text-[12px]"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#ef4444', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              <Shield size={13} className="shrink-0"/>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-[8px] w-full py-[13px] rounded-[11px] text-[14px] font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-[4px]"
            style={{
              background: loading ? '#15803d' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
            }}
          >
            {loading ? (
              <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Créer un compte <ArrowRight size={16}/></>
            )}
          </button>

          {/* Lien login */}
          <p className="text-center text-[12px] m-0" style={{ color: textSec }}>
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-bold no-underline underline-offset-2 hover:underline"
              style={{ color: '#22c55e' }}
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>

      {/* Aide */}
      <p className="mt-[20px] text-[12px] relative z-[1]" style={{ color: textSec }}>
        Besoin d'aide ? Contactez l'administrateur système.
      </p>
    </div>
  );
}