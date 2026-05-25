import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label="Changer le thème"
      className="flex items-center gap-2 bg-none border [border-width:1.5px] border-[var(--border)] rounded-full p-1 pr-2.5 cursor-pointer font-medium transition-all duration-200"
    >
      {/* Track */}
      <div 
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 flex-shrink-0 ${
          isDark ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
        }`}
      >
        {/* Thumb */}
        <span 
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center text-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isDark ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* Label */}
      <span className="text-dynamic">
        {isDark ? 'Sombre' : 'Claire'}
      </span>
    </button>
  );
}