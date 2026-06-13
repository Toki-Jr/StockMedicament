import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, RotateCcw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/axios.instance';

export default function OtpPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || '';
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown pour "Renvoyer"
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Rediriger si pas d'email
  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) { setError('Entrez les 6 chiffres.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { email });
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Échec du renvoi.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors duration-300 font-sans antialiased
      ${dark ? 'bg-[#080d0a] text-[#f0fdf4]' : 'bg-[#f0fdf4] text-[#0f1a10]'}`}
    >
      {/* Noise + Grid (identique à Register) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className={`fixed inset-0 pointer-events-none z-0 bg-[size:48px_48px] ${dark ? 'bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'}`} />
      <div className={`absolute top-[-60px] left-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none bg-radial ${dark ? 'from-[#16a34a]/12' : 'from-[#16a34a]/15'} to-transparent`} />

      {/* Bouton thème */}
      <button onClick={toggleTheme} className={`fixed top-4 right-4 w-[38px] h-[38px] flex items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer z-50 ${dark ? 'border-white/5 hover:border-[#4ade80]/30 bg-[#0d1510] text-gray-400' : 'border-black/5 hover:border-[#16a34a]/30 bg-white text-gray-600'}`}>
        {dark ? <Sun size={17}/> : <Moon size={17}/>}
      </button>

      {/* Card */}
      <div className={`w-full max-w-[400px] rounded-2xl p-8 relative z-10 border shadow-2xl ${dark ? 'border-[#4ade80]/20 bg-[#0d1510] shadow-black/60' : 'border-[#16a34a]/35 bg-white shadow-black/5'}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-7">
          <div className="w-[36px] h-[36px] rounded-lg flex items-center justify-center font-black text-base text-white shrink-0 bg-[#1a7a4a] shadow-[0_0_14px_rgba(22,163,74,0.4)]">S</div>
          <div>
            <p className="text-base font-bold leading-none">Stock<span className="text-[#1a7a4a]">'méd</span></p>
            <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Gestion des médicaments</p>
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-black tracking-tight mb-1.5">Vérification</h1>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            Code envoyé à <span className="font-semibold text-[#1a7a4a]">{email}</span>
          </p>
        </div>

        {/* Inputs OTP */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-[46px] h-[54px] text-center text-xl font-black rounded-xl border outline-none transition-all duration-200
                ${d ? 'border-[#16a34a] bg-[#16a34a]/10 text-[#4ade80]' : dark ? 'border-white/10 bg-white/[0.02] text-gray-200' : 'border-black/10 bg-[#f8fdf8] text-gray-800'}
                focus:border-[#16a34a]`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
            <Shield size={13}/>{error}
          </div>
        )}

        <button onClick={handleVerify} disabled={loading || digits.join('').length < 6}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-[#1a7a4a] text-white transition-all disabled:opacity-50 mb-4">
          {loading
            ? <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <>Vérifier <ArrowRight size={16}/></>
          }
        </button>

        {/* Renvoyer */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Renvoyer dans <span className="font-bold text-[#1a7a4a]">{countdown}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={resending}
              className="flex items-center gap-1.5 mx-auto text-xs font-semibold text-[#1a7a4a] hover:underline disabled:opacity-50">
              <RotateCcw size={13}/>{resending ? 'Envoi...' : 'Renvoyer le code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}