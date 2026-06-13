import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/axios.instance';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  // step: 'email' → 'otp' → 'password'
  const [step, setStep]         = useState('email');
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Étape 1 — envoyer OTP
  const handleSendOtp = async () => {
    if (!email) { setError('Email requis'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur envoi');
    } finally { setLoading(false); }
  };

  // Étape 2 — vérifier OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError('Entrez les 6 chiffres'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect');
    } finally { setLoading(false); }
  };

  // Étape 3 — nouveau mot de passe
  const handleReset = async () => {
    if (!newPassword) { setError('Mot de passe requis'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      navigate('/login', { state: { reset: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur réinitialisation');
    } finally { setLoading(false); }
  };

  return (
    <div className={`min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors duration-300 font-sans antialiased
      ${dark ? 'bg-[#080d0a] text-[#f0fdf4]' : 'bg-[#f0fdf4] text-[#0f1a10]'}`}>

      {/* Noise + Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className={`fixed inset-0 pointer-events-none z-0 bg-[size:48px_48px] ${dark ? 'bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'}`} />
      <div className={`absolute top-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none bg-radial ${dark ? 'from-[#16a34a]/12' : 'from-[#16a34a]/15'} to-transparent`} />

      {/* Bouton thème */}
      <button onClick={toggleTheme} className={`fixed top-4 right-4 w-[38px] h-[38px] flex items-center justify-center rounded-lg border transition-all z-50 ${dark ? 'border-white/5 bg-[#0d1510] text-gray-400' : 'border-black/5 bg-white text-gray-600'}`}>
        {dark ? <Sun size={17}/> : <Moon size={17}/>}
      </button>

      <div className={`w-full max-w-[400px] rounded-2xl p-8 relative z-10 border shadow-2xl ${dark ? 'border-[#4ade80]/20 bg-[#0d1510] shadow-black/60' : 'border-[#16a34a]/35 bg-white shadow-black/5'}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-7">
          <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center font-black text-base text-white bg-[#1a7a4a] shadow-[0_0_14px_rgba(22,163,74,0.4)]">S</div>
          <div>
            <p className="text-base font-bold leading-none">Stock<span className="text-[#1a7a4a]">'méd</span></p>
            <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Gestion des médicaments</p>
          </div>
        </div>

        {/* Titre selon step */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-black tracking-tight mb-1.5">
            {step === 'email'    && 'Mot de passe oublié'}
            {step === 'otp'     && 'Vérification'}
            {step === 'password' && 'Nouveau mot de passe'}
          </h1>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            {step === 'email'    && 'Entrez votre email pour recevoir un code.'}
            {step === 'otp'     && <>Code envoyé à <span className="font-semibold text-[#1a7a4a]">{email}</span></>}
            {step === 'password' && 'Choisissez un nouveau mot de passe.'}
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* STEP 1 — Email */}
          {step === 'email' && (
            <div className={`flex items-center gap-2.5 px-3.5 rounded-lg border transition-all focus-within:!border-[#16a34a] ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-[#f8fdf8] border-black/5'}`}>
              <Mail size={16} className={dark ? 'text-gray-600' : 'text-gray-400'}/>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Votre email"
                className={`flex-1 bg-transparent py-2.5 text-sm outline-none ${dark ? 'text-gray-200' : 'text-gray-800'}`}/>
            </div>
          )}

          {/* STEP 2 — OTP */}
          {step === 'otp' && (
            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Code à 6 chiffres"
              className={`w-full text-center text-2xl font-black tracking-[12px] px-4 py-3 rounded-xl border outline-none transition-all focus:border-[#16a34a] ${dark ? 'bg-white/[0.02] border-white/10 text-gray-200' : 'bg-[#f8fdf8] border-black/5 text-gray-800'}`}/>
          )}

          {/* STEP 3 — Nouveau mot de passe */}
          {step === 'password' && (
            <div className={`flex items-center gap-2.5 px-3.5 rounded-lg border transition-all focus-within:!border-[#16a34a] ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-[#f8fdf8] border-black/5'}`}>
              <Lock size={16} className={dark ? 'text-gray-600' : 'text-gray-400'}/>
              <input type={showPw ? 'text' : 'password'} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className={`flex-1 bg-transparent py-2.5 text-sm outline-none ${dark ? 'text-gray-200' : 'text-gray-800'}`}/>
              <button type="button" onClick={() => setShowPw(!showPw)} className={dark ? 'text-gray-600' : 'text-gray-400'}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20">
              <Shield size={13}/>{error}
            </div>
          )}

          <button onClick={step === 'email' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleReset}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#1a7a4a] text-white disabled:opacity-50">
            {loading
              ? <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <>{step === 'email' ? 'Envoyer le code' : step === 'otp' ? 'Vérifier' : 'Réinitialiser'} <ArrowRight size={16}/></>
            }
          </button>

          <p className={`text-center text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Link to="/login" className="font-bold text-[#1a7a4a] hover:underline">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}