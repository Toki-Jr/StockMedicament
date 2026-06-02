import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ROLES = [
  { value: 'user',       label: 'Utilisateur',  color: '#fca5a5', dot: '#ef4444' },
  { value: 'pharmacien', label: 'Pharmacien',    color: '#93c5fd', dot: '#3b82f6' },
  { value: 'admin',      label: 'Administrateur',color: '#4ade80', dot: '#16a34a' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  const [form, setForm]       = useState({ nom: '', prenom: '', email: '', password: '', role: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

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

  return (
    <div className={`min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors duration-300 font-sans antialiased
      ${dark ? 'bg-[#080d0a] text-[#f0fdf4]' : 'bg-[#f0fdf4] text-[#0f1a10]'}`}
    >
      {/* ── NOISE & GRID ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className={`fixed inset-0 pointer-events-none z-0 bg-[size:48px_48px] ${dark ? 'bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'}`} />

      {/* ── Blobs ── */}
      <div className={`absolute top-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none bg-radial ${dark ? 'from-[#16a34a]/12' : 'from-[#16a34a]/15'} to-transparent`} />
      <div className={`absolute bottom-[-40px] right-[40px] w-[300px] h-[300px] rounded-full pointer-events-none bg-radial ${dark ? 'from-[#16a34a]/8' : 'from-[#16a34a]/10'} to-transparent`} />

      {/* ── Bouton thème ── */}
      <button onClick={toggleTheme} className={`fixed top-4 right-4 w-[38px] h-[38px] flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer z-50 ${dark ? 'border-white/5 hover:border-[#4ade80]/30 bg-[#0d1510] text-gray-400' : 'border-black/5 hover:border-[#16a34a]/30 bg-white text-gray-600'}`}>
        {dark ? <Sun size={17}/> : <Moon size={17}/>}
      </button>

      {/* ── CARD ── */}
      <div className={`w-full max-w-[400px] rounded-2xl p-8 transition-all duration-300 relative z-10 border shadow-2xl ${dark ? 'border-[#4ade80]/20 bg-[#0d1510] shadow-black/60' : 'border-[#16a34a]/35 bg-white shadow-black/5'}`}>
        
        <div className="flex items-center gap-2.5 justify-center mb-7">
          <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center font-black text-base text-white shrink-0 bg-[#1a7a4a] shadow-[0_0_14px_rgba(22,163,74,0.4)]">S</div>
          <div>
            <p className="text-base font-bold leading-none">Stock<span className="text-[#1a7a4a]">'méd</span></p>
            <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Gestion des médicaments</p>
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-black tracking-tight m-0 mb-1.5">Inscription</h1>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Créez votre compte pour commencer.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
          {/* Inputs */}
          {['nom', 'prenom', 'email'].map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className={`text-xs font-semibold capitalize ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{field}</label>
              <div className={`flex items-center gap-2.5 px-3.5 rounded-lg border transition-all duration-200 focus-within:!border-[#16a34a] ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-[#f8fdf8] border-black/5'}`}>
                {field === 'email' ? <Mail size={16} className={dark ? 'text-gray-600' : 'text-gray-400'} /> : <User size={16} className={dark ? 'text-gray-600' : 'text-gray-400'} />}
                <input type={field === 'email' ? 'email' : 'text'} name={field} value={form[field]} onChange={handleChange} className={`flex-1 bg-transparent py-2.5 text-sm outline-none ${dark ? 'text-gray-200' : 'text-gray-800'}`} />
              </div>
            </div>
          ))}

          {/* Rôles */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Rôle</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[10px] font-bold transition-all ${form.role === r.value ? 'ring-1 ring-[#16a34a] bg-[#16a34a]/10 text-[#4ade80]' : 'bg-[#f8fdf8] dark:bg-white/[0.02] border border-transparent'}`}>
                  <div className="w-2 h-2 rounded-full" style={{ background: r.dot }} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Mot de passe</label>
            <div className={`flex items-center gap-2.5 px-3.5 rounded-lg border transition-all duration-200 focus-within:!border-[#16a34a] ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-[#f8fdf8] border-black/5'}`}>
              <Lock size={16} className={dark ? 'text-gray-600' : 'text-gray-400'} />
              <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className={`flex-1 bg-transparent py-2.5 text-sm outline-none ${dark ? 'text-gray-200' : 'text-gray-800'}`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className={dark ? 'text-gray-600' : 'text-gray-400'}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20"><Shield size={13}/>{error}</div>}

          <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#1a7a4a] hover:bg-[#1a7a4a] text-white transition-all disabled:opacity-60">
            {loading ? <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Créer un compte <ArrowRight size={16}/></>}
          </button>

          <p className={`text-center text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            Déjà un compte ? <Link to="/login" className="font-bold text-[#1a7a4a] hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
      <p className={`mt-5 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Besoin d'aide ? Contactez l'administrateur.</p>
    </div>
  );
}