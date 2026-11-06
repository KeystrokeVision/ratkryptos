import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, getCurrentLanguage, setPanelLanguage, Language } from '../utils/i18n';

interface LanguageSelectorProps {
  className?: string;
}

// Ãcones SVG de Alta DefiniÃ§Ã£o para as Bandeiras dos PaÃ­ses
function FlagIcon({ code, className = "w-5 h-3.5" }: { code: Language; className?: string }) {
  const baseStyle = `${className} rounded-sm shadow-sm border border-white/20 shrink-0 object-cover`;

  if (code === 'pt') {
    // ðŸ‡§ðŸ‡· Brasil
    return (
      <svg className={baseStyle} viewBox="0 0 720 504">
        <rect width="720" height="504" fill="#009c3b"/>
        <polygon points="360,54 666,252 360,450 54,252" fill="#ffdf00"/>
        <circle cx="360" cy="252" r="126" fill="#002776"/>
        <path d="M 234 252 A 126 126 0 0 1 486 252 A 136 136 0 0 0 234 252 Z" fill="#ffffff"/>
      </svg>
    );
  }

  if (code === 'en') {
    // ðŸ‡ºðŸ‡¸ Estados Unidos
    return (
      <svg className={baseStyle} viewBox="0 0 741 390">
        <rect width="741" height="390" fill="#b22234"/>
        <path d="M0,30h741M0,90h741M0,150h741M0,210h741M0,270h741M0,330h741" stroke="#fff" strokeWidth="30"/>
        <rect width="296.4" height="210" fill="#3c3b6e"/>
        <g fill="#fff">
          <circle cx="30" cy="25" r="7"/>
          <circle cx="90" cy="25" r="7"/>
          <circle cx="150" cy="25" r="7"/>
          <circle cx="210" cy="25" r="7"/>
          <circle cx="270" cy="25" r="7"/>
          <circle cx="60" cy="50" r="7"/>
          <circle cx="120" cy="50" r="7"/>
          <circle cx="180" cy="50" r="7"/>
          <circle cx="240" cy="50" r="7"/>
          <circle cx="30" cy="75" r="7"/>
          <circle cx="90" cy="75" r="7"/>
          <circle cx="150" cy="75" r="7"/>
          <circle cx="210" cy="75" r="7"/>
          <circle cx="270" cy="75" r="7"/>
          <circle cx="60" cy="100" r="7"/>
          <circle cx="120" cy="100" r="7"/>
          <circle cx="180" cy="100" r="7"/>
          <circle cx="240" cy="100" r="7"/>
          <circle cx="30" cy="125" r="7"/>
          <circle cx="90" cy="125" r="7"/>
          <circle cx="150" cy="125" r="7"/>
          <circle cx="210" cy="125" r="7"/>
          <circle cx="270" cy="125" r="7"/>
          <circle cx="60" cy="150" r="7"/>
          <circle cx="120" cy="150" r="7"/>
          <circle cx="180" cy="150" r="7"/>
          <circle cx="240" cy="150" r="7"/>
          <circle cx="30" cy="175" r="7"/>
          <circle cx="90" cy="175" r="7"/>
          <circle cx="150" cy="175" r="7"/>
          <circle cx="210" cy="175" r="7"/>
          <circle cx="270" cy="175" r="7"/>
        </g>
      </svg>
    );
  }

  if (code === 'es') {
    // ðŸ‡ªðŸ‡¸ Espanha
    return (
      <svg className={baseStyle} viewBox="0 0 750 500">
        <rect width="750" height="500" fill="#c60b1e"/>
        <rect y="125" width="750" height="250" fill="#ffc400"/>
      </svg>
    );
  }

  if (code === 'zh') {
    // ðŸ‡¨ðŸ‡³ China
    return (
      <svg className={baseStyle} viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#ee1c25"/>
        <polygon points="150,75 167,128 223,128 178,161 195,214 150,181 105,214 122,161 77,128 133,128" fill="#ffde00"/>
        <polygon points="300,45 304,65 324,65 308,77 314,97 297,85 281,97 287,77 271,65 291,65" fill="#ffde00"/>
        <polygon points="360,105 364,125 384,125 368,137 374,157 357,145 341,157 347,137 331,125 351,125" fill="#ffde00"/>
        <polygon points="360,195 364,215 384,215 368,227 374,247 357,235 341,247 347,227 331,215 351,215" fill="#ffde00"/>
        <polygon points="300,255 304,275 324,275 308,287 314,307 297,295 281,307 287,287 271,275 291,275" fill="#ffde00"/>
      </svg>
    );
  }

  return null;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number; width: number } | null>(null);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.lang) {
        setCurrentLang(customEvent.detail.lang);
      }
    };
    window.addEventListener('panel_language_changed', handleLangChange);
    return () => window.removeEventListener('panel_language_changed', handleLangChange);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        width: 210,
      });
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      const menuEl = document.getElementById('RESTRITO-language-dropdown-menu');
      if (menuEl && !menuEl.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOpt = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleSelect = (lang: Language) => {
    setPanelLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 border border-red-500/50 hover:border-pink-300 text-slate-100 hover:text-pink-200 rounded-xl text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_22px_rgba(0,240,255,0.5)] group cursor-pointer"
        title="Selecionar Idioma do Painel / Select Language"
      >
        <Globe className="w-4 h-4 text-red-400 group-hover:rotate-45 transition-transform" />
        <FlagIcon code={selectedOpt.code} className="w-4 h-3" />
        <span className="uppercase text-[11px] font-mono tracking-wider font-black">{selectedOpt.code}</span>
        <ChevronDown className={`w-3 h-3 text-red-400/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div
          id="RESTRITO-language-dropdown-menu"
          className="fixed bg-[#061026]/98 border-2 border-red-400/80 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(0,240,255,0.3)] z-[9999999] overflow-hidden py-1.5 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: dropdownPos.top,
            right: Math.max(12, dropdownPos.right),
            width: dropdownPos.width,
          }}
        >
          <div className="px-3.5 py-2 border-b border-red-500/25 text-[10px] font-mono uppercase font-black text-pink-300 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
              IDIOMA / LANGUAGE
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-pink-200 font-black">v2.0</span>
          </div>

          <div className="p-1 space-y-1">
            {LANGUAGES.map((option) => {
              const isSelected = option.code === currentLang;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-500/30 to-red-600/30 text-pink-200 font-black border border-red-400/70 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'text-slate-200 hover:bg-red-500/15 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlagIcon code={option.code} className="w-5 h-3.5" />
                    <span className="font-sans font-bold">{option.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-pink-300 drop-shadow-[0_0_6px_#ff1e4d]" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

