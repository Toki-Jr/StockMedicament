import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const { resetToLight } = useTheme();
  const [form, setForm]       = useState({ email: '', password: '' });
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
    if (!form.email || !form.password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      await login(form);
      resetToLight();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors duration-300 font-sans antialiased leading-normal text-dynamic
      ${dark ? 'bg-[#080d0a] text-[#f0fdf4]' : 'bg-[#f0fdf4] text-[#0f1a10]'}`}
    >
      {/* ── NOISE TEXTURE FLUIDE & GRID PATTERN ── */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      <div 
        className={`fixed inset-0 pointer-events-none z-0 bg-[size:48px_48px]
          ${dark 
            ? 'bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'}`}
      />

      {/* ── Blobs décoratifs ── */}
      {dark ? (
        <>
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none bg-radial from-[#16a34a]/12 to-transparent" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full pointer-events-none bg-radial from-[#16a34a]/8 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute top-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none bg-radial from-[#16a34a]/15 to-transparent" />
          <div className="absolute bottom-[-40px] right-[40px] w-[300px] h-[300px] rounded-full pointer-events-none bg-radial from-[#16a34a]/10 to-transparent" />
        </>
      )}

      {/* ── Bouton thème ── */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 w-[38px] h-[38px] flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer z-50 text-dynamic
          ${dark ? 'border-white/5 hover:border-[#4ade80]/30 bg-[#0d1510] text-gray-400' : 'border-black/5 hover:border-[#16a34a]/30 bg-white text-gray-600'}`}
        title={dark ? 'Mode clair' : 'Mode sombre'}
      >
        {dark ? <Sun size={17}/> : <Moon size={17}/>}
      </button>

      {/* ── CARD ── */}
      <div className={`w-full max-w-[380px] rounded-2xl p-10 transition-all duration-300 relative z-10 border shadow-2xl text-dynamic
        ${dark ? 'border-[#4ade80]/20 bg-[#0d1510] shadow-black/60' : 'border-[#16a34a]/35 bg-white shadow-black/5'}`}
      >

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-7 text-dynamic">
          <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center font-black text-base text-white shrink-0 bg-[#16a34a] shadow-[0_0_14px_rgba(22,163,74,0.4)] text-dynamic">
            S
          </div>
          <div className="text-dynamic">
            <p className="text-base font-bold leading-none text-dynamic">
              Stock<span className="text-[#4ade80]">'méd</span>
            </p>
            <p className={`text-[11px] mt-0.5 text-dynamic ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Gestion des médicaments
            </p>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-7 text-dynamic">
          <h1 className="text-2xl font-syne font-black tracking-tight m-0 mb-1.5 text-dynamic">
            Connexion
          </h1>
          <p className={`text-sm m-0 text-dynamic ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Accédez à votre espace{' '}
            <span className="font-semibold text-amber-600">Admin</span>
            {' '}ou{' '}
            <span className="font-semibold text-indigo-600">Pharmacien</span>
             {' '}ou{' '}
            <span className="font-semibold text-emerald-600">User</span>
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-dynamic">
            <label className={`text-xs font-semibold text-dynamic ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Adresse email
            </label>
            <div className={`flex items-center gap-2.5 px-3.5 rounded-lg border transition-all duration-200 focus-within:!border-[#16a34a] text-dynamic
              ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-[#f8fdf8] border-black/5'}`}
            >
              <Mail size={16} className={`shrink-0 text-dynamic ${dark ? 'text-gray-600' : 'text-gray-400'}`} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@pharma.mg"
                autoFocus
                className={`flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:opacity-40 text-dynamic ${dark ? 'text-gray-200' : 'text-gray-800'}`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-dynamic">
            <div className="flex items-center justify-between text-dynamic">
              <label className={`text-xs font-semibold text-dynamic ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold no-underline hover:underline text-[#1a7a4a]"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className={`flex items-center gap-2.5 px-3.5 rounded-lg border transition-all duration-200 focus-within:!border-[#16a34a] text-dynamic
              ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-[#f8fdf8] border-black/5'}`}
            >
              <Lock size={16} className={`shrink-0 text-dynamic ${dark ? 'text-gray-600' : 'text-gray-400'}`} />
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:opacity-40 text-dynamic ${dark ? 'text-gray-200' : 'text-gray-800'}`}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className={`cursor-pointer transition-colors text-dynamic ${dark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 text-dynamic">
              <Lock size={13} className="shrink-0"/>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#1a7a4a] hover:bg-[#1a7a4a] text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-0.5 shadow-[0_4px_16px_rgba(74,222,128,0.25)] text-dynamic"
            style={loading ? { backgroundColor: '#15803d', color: '#ffffff' } : {}}
          >
            {loading ? (
              <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Se connecter <ArrowRight size={16}/></>
            )}
          </button>

          {/* Mention légale */}
          <p className={`text-center text-[11px] leading-relaxed m-0 text-dynamic ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            En vous connectant, vous acceptez le fonctionnement interne<br />
            de la plateforme{' '}
            <span className={`font-black text-dynamic ${dark ? 'text-white' : 'text-black'}`}>
              Stock<span className="text-[#1a7a4a]">'méd</span>
            </span>
          </p>

          <p className={`text-center text-xs m-0 text-dynamic ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Pas de compte ?{' '}
            <Link
              to="/register"
              className="font-bold no-underline underline-offset-2 hover:underline text-[#1a7a4a]"
            >
              S'inscrire
            </Link>
          </p>
        </form>
      </div>

      {/* Aide */}
      <p className={`mt-5 text-xs relative z-10 text-dynamic ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        Besoin d'aide ? Contactez l'administrateur système.
      </p>
    </div>
  );
}