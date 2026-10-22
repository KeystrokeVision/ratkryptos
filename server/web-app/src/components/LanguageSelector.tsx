import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, getCurrentLanguage, setPanelLanguage, Language } from '../utils/i18n';

interface LanguageSelectorProps {
  className?: string;
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
        width: 190,
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
      const menuEl = document.getElementById('gangstar-language-dropdown-menu');
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
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 border border-cyan-500/50 hover:border-cyan-300 text-slate-100 hover:text-cyan-200 rounded-xl text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(255,43,43,0.25)] hover:shadow-[0_0_22px_rgba(255,43,43,0.5)] group cursor-pointer"
        title="Selecionar Idioma do Painel / Select Language"
      >
        <Globe className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
        <span className="text-sm leading-none">{selectedOpt.flag}</span>
        <span className="uppercase text-[11px] font-mono tracking-wider font-black">{selectedOpt.code}</span>
        <ChevronDown className={`w-3 h-3 text-cyan-400/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div
          id="gangstar-language-dropdown-menu"
          className="fixed bg-[#260803]/98 border-2 border-cyan-400/80 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(255,43,43,0.3)] z-[9999999] overflow-hidden py-1.5 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: dropdownPos.top,
            right: Math.max(12, dropdownPos.right),
            width: dropdownPos.width,
          }}
        >
          <div className="px-3.5 py-2 border-b border-cyan-500/25 text-[10px] font-mono uppercase font-black text-cyan-300 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              IDIOMA / LANGUAGE
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-black">v2.0</span>
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
                      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-200 font-black border border-cyan-400/70 shadow-[0_0_12px_rgba(255,43,43,0.3)]'
                      : 'text-slate-200 hover:bg-cyan-500/15 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{option.flag}</span>
                    <span className="font-sans font-bold">{option.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_6px_#ff2b2b]" />}
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

