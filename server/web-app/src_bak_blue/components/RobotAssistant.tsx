import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle, 
  Smartphone, Monitor, Zap, Shield, Play, Flame, RefreshCw,
  Layers, Eye, Target, Minus, Maximize2, Move
} from 'lucide-react';
import itauLogoUrl from '../assets/banks/itau.svg';
import nubankLogoUrl from '../assets/banks/nubank.svg';
import caixaTemIconUrl from '../assets/banks/caixa_tem_icon.png';

interface TutorialStep {
  targetId: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: string;
  tip?: string;
  highlightLabel?: string;
}

/* ==========================================================================
   🏦 LOGOTIPOS DOS BANCOS & GOOGLE PLAY STORE (AUTÊNTICOS & OFICIAIS DA INTERNET)
   ========================================================================== */

export const ItauLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-[#ec7000] p-1.5 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(236, 112, 0, 0.45)'
    }}
  >
    <img 
      src={itauLogoUrl} 
      alt="Itaú" 
      className="w-full h-full object-contain select-none pointer-events-none" 
    />
  </div>
);

export const CaixaLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center flex-shrink-0 select-none p-1 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #ce7000 0%, #8e4500 100%)',
      boxShadow: '0 4px 15px rgba(206, 112, 0, 0.55)'
    }}
  >
    <div className="flex items-center justify-center" style={{ width: size * 0.55, height: size * 0.55 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none" fill="none">
        <defs>
          <linearGradient id="caixaXOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8300" />
            <stop offset="100%" stopColor="#e06500" />
          </linearGradient>
        </defs>
        {/* Barra Branca Diagonal */}
        <path d="M22 18 L40 18 L78 82 L60 82 Z" fill="#ffffff" />
        {/* Barra Laranja Inferior Esquerda */}
        <path d="M22 82 L40 82 L53 60 L35 60 Z" fill="url(#caixaXOrange)" />
        {/* Barra Laranja Superior Direita */}
        <path d="M47 40 L65 40 L78 18 L60 18 Z" fill="url(#caixaXOrange)" />
      </svg>
    </div>
    <span 
      className="font-black text-white uppercase tracking-tight leading-none mt-0.5"
      style={{ fontSize: size * 0.17, fontFamily: 'Inter, sans-serif' }}
    >
      CAIXA
    </span>
  </div>
);

export const CaixaTemLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-2xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-[#005ca9] ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(206, 114, 0, 0.45)'
    }}
  >
    <img 
      src={caixaTemIconUrl} 
      alt="CAIXA Tem" 
      className="w-full h-full object-cover select-none pointer-events-none rounded-2xl"
    />
  </div>
);

export const SicrediLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center flex-shrink-0 select-none p-1 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #008542 0%, #00602e 100%)',
      boxShadow: '0 4px 15px rgba(0, 133, 66, 0.55)'
    }}
  >
    {/* Catavento Sicredi Oficial Play Store */}
    <div className="flex items-center justify-center" style={{ width: size * 0.52, height: size * 0.52 }}>
      <svg viewBox="0 0 120 120" className="w-full h-full select-none pointer-events-none" fill="none">
        <g fill="#ffffff">
          {/* Pétala Topo */}
          <path d="M60 14 C68 14 74 20 74 29 C74 38 60 46 60 46 C60 46 46 38 46 29 C46 20 52 14 60 14 Z" opacity="0.95" />
          {/* Pétala Direita */}
          <path d="M106 60 C106 68 100 74 91 74 C82 74 74 60 74 60 C74 60 82 46 91 46 C100 46 106 52 106 60 Z" opacity="0.95" />
          {/* Pétala Fundo */}
          <path d="M60 106 C52 106 46 100 46 91 C46 82 60 74 60 74 C60 74 74 82 74 91 C74 100 68 106 60 106 Z" opacity="0.95" />
          {/* Pétala Esquerda */}
          <path d="M14 60 C14 52 20 46 29 46 C38 46 46 60 46 60 C46 60 38 74 29 74 C20 74 14 68 14 60 Z" opacity="0.95" />
          {/* Pétalas de Vento Intermediárias */}
          <path d="M78 28 C85 34 86 44 80 50 C74 56 60 52 60 52 C60 52 64 38 70 32 C72 30 75 28 78 28 Z" opacity="0.85" />
          <path d="M92 78 C86 85 76 86 70 80 C64 74 68 60 68 60 C68 60 82 64 88 70 C90 72 92 75 92 78 Z" opacity="0.85" />
          <path d="M42 92 C35 86 34 76 40 70 C46 64 60 68 60 68 C60 68 56 82 50 88 C48 90 45 92 42 92 Z" opacity="0.85" />
          <path d="M28 42 C34 35 44 34 50 40 C56 46 52 60 52 60 C52 60 38 56 32 50 C30 48 28 45 28 42 Z" opacity="0.85" />
          <circle cx="60" cy="60" r="4.5" fill="#00602e" />
        </g>
      </svg>
    </div>
    <span 
      className="font-black text-white tracking-tight leading-none mt-0.5"
      style={{ fontSize: size * 0.16, fontFamily: 'Inter, sans-serif' }}
    >
      Sicredi
    </span>
  </div>
);

export const NubankLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-[#820ad1] p-2 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(209, 10, 130, 0.5)'
    }}
  >
    <img 
      src={nubankLogoUrl} 
      alt="Nubank" 
      className="w-full h-auto object-contain filter brightness-0 invert select-none pointer-events-none" 
      style={{ maxHeight: size * 0.65 }}
    />
  </div>
);

export const SantanderLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center flex-shrink-0 select-none p-1 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #ec0000 0%, #a80000 100%)',
      boxShadow: '0 4px 15px rgba(236, 0, 0, 0.5)'
    }}
  >
    <svg viewBox="0 0 100 100" style={{ width: size * 0.44, height: size * 0.44 }} fill="none">
      <path d="M50 15 C45 32 30 42 30 60 C30 75 40 85 50 85 C60 85 70 75 70 60 C70 42 55 32 50 15 Z" fill="#ffffff" />
      <path d="M40 38 C32 48 25 58 25 68 C25 80 32 85 40 85 C35 80 35 70 40 60 C42 54 44 48 40 38 Z" fill="#ffffff" />
      <path d="M60 38 C68 48 75 58 75 68 C75 80 68 85 60 85 C65 80 65 70 60 60 C58 54 56 48 60 38 Z" fill="#ffffff" />
    </svg>
    <span 
      className="font-black text-white uppercase tracking-tighter leading-none mt-0.5"
      style={{ fontSize: size * 0.16, fontFamily: 'Inter, sans-serif' }}
    >
      Santander
    </span>
  </div>
);

export const BradescoLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center flex-shrink-0 select-none p-1 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #cc092f 0%, #85061e 100%)',
      boxShadow: '0 4px 15px rgba(204, 9, 47, 0.5)'
    }}
  >
    <svg viewBox="0 0 100 100" style={{ width: size * 0.42, height: size * 0.42 }} fill="none">
      <rect x="46" y="35" width="8" height="45" rx="4" fill="#ffffff" />
      <path d="M30 45 C30 35 40 28 50 28 C60 28 70 35 70 45" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
      <path d="M20 62 C20 48 32 38 50 38 C68 38 80 48 80 62" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
    </svg>
    <span 
      className="font-bold text-white tracking-tight leading-none mt-0.5 lowercase"
      style={{ fontSize: size * 0.18, fontFamily: 'Inter, sans-serif' }}
    >
      bradesco
    </span>
  </div>
);

export const BancoDoBrasilLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center flex-shrink-0 select-none p-1 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #fcdb00 0%, #e5c300 100%)',
      boxShadow: '0 4px 15px rgba(252, 219, 0, 0.45)'
    }}
  >
    <div className="flex items-center justify-center" style={{ width: size * 0.46, height: size * 0.46 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <path d="M20 20 L50 50 L20 80 L35 80 L65 50 L35 20 Z" fill="#003882" />
        <path d="M80 80 L50 50 L80 20 L65 20 L35 50 L65 80 Z" fill="#003882" />
      </svg>
    </div>
    <span 
      className="font-black text-[#003882] tracking-tighter leading-none mt-0.5"
      style={{ fontSize: size * 0.22, fontFamily: 'Inter, sans-serif' }}
    >
      BB
    </span>
  </div>
);

export const GooglePlayStoreCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-slate-900 border border-slate-700/80 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(255, 43, 43, 0.35)'
    }}
  >
    {/* Google Play Store 4-Color Triangle */}
    <svg viewBox="0 0 100 100" style={{ width: size * 0.65, height: size * 0.65 }} fill="none">
      <path d="M18 12 L72 45 L18 78 Z" fill="#00e676" />
      <path d="M18 12 L58 52 L18 92 Z" fill="#f88600" />
      <path d="M18 92 L72 55 L58 52 Z" fill="#ff334b" />
      <path d="M58 52 L86 38 L72 45 Z" fill="#ffd400" />
      <path d="M58 52 L72 55 L86 46 Z" fill="#ff8000" />
    </svg>
    
    {/* Tiny Play Protect Shield Overlay Badge */}
    <div className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded bg-cyan-400 text-[7px] font-black text-slate-950">
      PROT
    </div>
  </div>
);

/* ==========================================================================
   🤖 AVATAR DO ROBÔ CIBERNÉTICO (CYBER MECHA ROBOT)
   ========================================================================== */
export const RobotAvatar: React.FC<{ 
  size?: number; 
  isFloating?: boolean; 
  isSpeaking?: boolean; 
  isKicking?: boolean; 
  theme?: 'cyan' | 'blue';
}> = ({
  size = 52,
  isFloating = false,
  isKicking = false,
}) => {
  const cyanGlow = '#ff2b2b';
  const midBlue = '#dc2626';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        isFloating && !isKicking ? 'animate-robot-float' : ''
      } ${isKicking ? 'animate-robot-kick-body' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Cyan Energy Aura */}
      <div 
        className="absolute inset-0 rounded-2xl blur-md animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,43,43,0.45) 0%, rgba(220,38,38,0.2) 70%, transparent 100%)'
        }}
      />

      {/* Cyber Robot SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 8px ${cyanGlow})` }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robotHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="50%" stopColor="#160606" />
            <stop offset="100%" stopColor="#0a0404" />
          </linearGradient>
          <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#300a03" />
            <stop offset="100%" stopColor="#140403" />
          </linearGradient>
        </defs>

        {/* Antena Esquerda */}
        <line x1="32" y1="26" x2="22" y2="10" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="10" r="3.5" fill={cyanGlow} className="animate-pulse" />

        {/* Antena Direita */}
        <line x1="68" y1="26" x2="78" y2="10" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="78" cy="10" r="3.5" fill={cyanGlow} className="animate-pulse" />

        {/* Cabeça do Robô */}
        <rect x="20" y="24" width="60" height="52" rx="16" fill="url(#robotHeadGrad)" stroke={cyanGlow} strokeWidth="2" />

        {/* Orelhas / Parafusos Laterais */}
        <rect x="14" y="42" width="6" height="16" rx="3" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        <rect x="80" y="42" width="6" height="16" rx="3" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />

        {/* Viseira Digital de Alta Tecnologia */}
        <rect x="26" y="32" width="48" height="34" rx="10" fill="url(#robotVisorGrad)" stroke="#ff6b6b" strokeWidth="1.5" />

        {/* Olhos LED Expressivos do Robô */}
        <g className="animate-robot-blink">
          {/* Olho Esquerdo */}
          <rect x="33" y="42" width="12" height="13" rx="4" fill={cyanGlow} />
          <circle cx="36" cy="45" r="1.5" fill="#ffffff" />
          {/* Olho Direito */}
          <rect x="55" y="42" width="12" height="13" rx="4" fill={cyanGlow} />
          <circle cx="58" cy="45" r="1.5" fill="#ffffff" />
        </g>

        {/* Sorriso Cibernético / Indicador de Status */}
        <path d="M42 59 Q50 64 58 59" stroke={cyanGlow} strokeWidth="2" strokeLinecap="round" />

        {/* Pescoço Conector */}
        <rect x="42" y="76" width="16" height="6" rx="2" fill="#2a1212" stroke={cyanGlow} strokeWidth="1" />

        {/* Ombros Metálicos */}
        <path d="M28 82 C28 82 38 78 50 78 C62 78 72 82 72 82 L76 96 L24 96 Z" fill="url(#robotHeadGrad)" stroke={cyanGlow} strokeWidth="1.5" />
        <circle cx="50" cy="88" r="4" fill={cyanGlow} className="animate-pulse" />
      </svg>
    </div>
  );
};

/* ==========================================================================
   🥋 ARENA DO CHUTE: ROBÔ CHUTANDO ITAÚ, CAIXA & PLAY STORE (AZUL MODERNO)
   ========================================================================== */

export const RobotKickShowcase: React.FC<{
  autoKick?: boolean;
  userName?: string;
  isDashboardFeatured?: boolean;
  onKicked?: () => void;
}> = ({ autoKick = true, userName = 'risada', isDashboardFeatured = false, onKicked }) => {
  const [kickState, setKickState] = useState<'idle' | 'charging' | 'kicking' | 'flying'>('idle');
  const [kickCount, setKickCount] = useState<number>(0);
  const [autoLoop, setAutoLoop] = useState<boolean>(autoKick); // Auto-kick ligado por padrão
  const [combatText, setCombatText] = useState<string>('🛡️ BANCOS NA MIRA');

  const executeKick = () => {
    if (kickState === 'kicking' || kickState === 'charging') return;

    setKickState('charging');
    setCombatText('⚡ CARREGANDO BYPASS...');

    setTimeout(() => {
      setKickState('kicking');
      setCombatText('💥 KICK NO ITAÚ, CAIXA & PLAY STORE!');

      setTimeout(() => {
        setKickState('flying');
        setKickCount((c) => c + 1);
        setCombatText('🚫 100% BYPASS! BANCOS CHUTADOS!');
        if (onKicked) onKicked();

        setTimeout(() => {
          setKickState('idle');
          setCombatText('🛡️ FILA PRONTA PARA NOVO BYPASS');
        }, 1900);
      }, 350);
    }, 350);
  };

  // Loop contínuo automático
  useEffect(() => {
    if (!autoLoop) return;
    const interval = setInterval(() => {
      if (kickState === 'idle') {
        executeKick();
      }
    }, 3800);
    return () => clearInterval(interval);
  }, [autoLoop, kickState]);

  return (
    <div className={`relative rounded-3xl bg-gradient-to-b from-[#3a0b03]/95 via-[#290803]/95 to-[#170403]/98 border border-cyan-400/50 shadow-[0_0_35px_rgba(255,43,43,0.25)] overflow-hidden select-none ${
      isDashboardFeatured ? 'p-4 sm:p-5 mb-5' : 'p-4 sm:p-5'
    }`}>
      {/* Laser Top Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#ff2b2b]" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,43,43,0.12),transparent_70%)] pointer-events-none" />

      {/* 🚀 HEADER: BYPASS Apenas para os melhores */}
      <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3 mb-3 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-black text-base sm:text-lg tracking-wider text-white flex items-center gap-1">
            <span className="text-white">B</span>
            <span className="text-white">Y</span>
            <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_12px_rgba(255,43,43,0.9)]">PASS</span>
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-300/80 tracking-wide">
            Apenas para os melhores.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 shadow-[0_0_10px_rgba(255,43,43,0.3)]">
            KICKS: {kickCount}
          </span>
        </div>
      </div>

      {/* 🥋 ARENA PRINCIPAL: ROBÔ À ESQUERDA + NA FILA À DIREITA */}
      <div className="relative min-h-[135px] flex items-center justify-between gap-4 px-2 py-2 z-10 overflow-visible">
        {/* Shockwave Flash Effect at Impact Point */}
        {kickState === 'kicking' && (
          <div className="absolute left-[38%] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-cyan-400 animate-kick-shockwave shadow-[0_0_30px_#ff2b2b] pointer-events-none z-30" />
        )}

        {/* 🤖 ROBÔ FIGHTER */}
        <div className="flex flex-col items-center flex-shrink-0 relative">
          <div className={`transition-transform duration-200 ${kickState === 'charging' ? 'scale-95 -rotate-6' : ''}`}>
            <RobotAvatar 
              size={64} 
              isFloating={kickState === 'idle'} 
              isSpeaking={kickState === 'charging' || kickState === 'kicking'}
              isKicking={kickState === 'kicking' || kickState === 'charging'}
              theme="cyan" 
            />
          </div>

          {/* User Badge */}
          <div className="mt-2 text-center">
            <span className="text-[8px] font-mono tracking-widest text-cyan-400/60 uppercase block">USUÁRIO</span>
            <span className="text-[11px] font-black font-mono text-white tracking-wider drop-shadow-[0_0_6px_rgba(255,43,43,0.6)]">
              {userName}
            </span>
          </div>
        </div>

        {/* ⚡ COMBAT STATUS FLOATING BANNER */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
          <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider text-cyan-300 uppercase animate-pulse">
            {combatText}
          </span>
          <span className="text-[9px] font-mono text-cyan-400/70 mt-0.5">
            {kickState === 'flying' ? 'Bancos Arremessados!' : 'Bypass Ativo & 100% Indetectável'}
          </span>
        </div>

        {/* 📦 FILA DOS BANCOS ("NA FILA" - QUADRO AZUL TRACEJADO) */}
        <div className="relative flex-shrink-0 min-w-[130px] sm:min-w-[150px] min-h-[95px] flex items-center justify-center">
          {/* Dashed Rounded Frame */}
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-cyan-400/70 bg-cyan-950/25 shadow-[0_0_20px_rgba(255,43,43,0.2)] flex flex-col justify-between p-2 pointer-events-none">
            <div className="text-right">
              <span className="text-[9px] font-black font-mono tracking-widest text-cyan-300 uppercase drop-shadow-[0_0_6px_rgba(255,43,43,0.8)]">
                NA FILA
              </span>
            </div>
          </div>

          {/* 💥 STACKED LOGOS (ITAÚ, SICREDI, CAIXA, CAIXA TEM) */}
          <div className="relative w-24 h-16 flex items-center justify-center z-10">
            {/* Card 1: Sicredi */}
            <div 
              className={`absolute left-0 top-0 transition-all duration-300 ${
                kickState === 'flying' ? 'animate-fly-play' : 'transform translate-x-0 translate-y-0 opacity-80'
              }`}
            >
              <SicrediLogoCard size={38} />
            </div>

            {/* Card 2: Itaú */}
            <div 
              className={`absolute left-4 top-1 transition-all duration-300 ${
                kickState === 'flying' ? 'animate-fly-itau' : 'transform translate-x-0 translate-y-0 opacity-90'
              }`}
            >
              <ItauLogoCard size={40} />
            </div>

            {/* Card 3: CAIXA Econômica (Frente / Destaque) */}
            <div 
              className={`absolute left-8 top-2 transition-all duration-300 ${
                kickState === 'flying' ? 'animate-fly-caixa' : 'transform translate-x-0 translate-y-0 opacity-100'
              }`}
            >
              <CaixaLogoCard size={42} />
            </div>
          </div>
        </div>
      </div>

      {/* 🎮 CONTROLES INTERATIVOS DO CHUTE */}
      <div className="mt-2 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between gap-2 relative z-10">
        <button
          type="button"
          onClick={() => setAutoLoop(!autoLoop)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
            autoLoop 
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(255,43,43,0.3)]' 
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${autoLoop ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoLoop ? 'Auto-Kick Ativo' : 'Auto-Kick Pausado'}</span>
        </button>

        <button
          type="button"
          onClick={executeKick}
          disabled={kickState !== 'idle'}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-white font-black font-mono text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(255,43,43,0.6)] border border-cyan-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:scale-100 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-cyan-200 fill-cyan-200" />
          <span>Chutar Bancos Agora!</span>
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   🎯 OVERLAY DE DESTAQUE DAS FUNÇÕES DEMONSTRADAS (SPOTLIGHT EM TEMPO REAL)
   ========================================================================== */

export const SpotlightTargetOverlay: React.FC<{
  targetId: string;
  label: string;
  isActive: boolean;
}> = ({ targetId, label, isActive }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || !targetId) {
      setRect(null);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const bounds = el.getBoundingClientRect();
        setRect(bounds);
        // Scroll suavemente o elemento para o centro da tela
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setRect(null);
      }
    };

    // Atualiza imediatamente e com pequeno atraso para transições
    updatePosition();
    const t1 = setTimeout(updatePosition, 100);
    const t2 = setTimeout(updatePosition, 300);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const timer = setInterval(updatePosition, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearInterval(timer);
    };
  }, [targetId, isActive]);

  if (!isActive || !rect) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none transition-all duration-300 ease-out"
      style={{
        top: Math.max(0, rect.top - 8),
        left: Math.max(0, rect.left - 8),
        width: rect.width + 16,
        height: rect.height + 16,
        zIndex: 99999,
      }}
    >
      {/* 🌟 Caixilho Neon Pulsante com Brilho Intenso */}
      <div className="w-full h-full rounded-2xl border-[3px] border-cyan-300 shadow-[0_0_50px_rgba(255,43,43,0.95),0_0_100px_rgba(255,43,43,0.4),inset_0_0_25px_rgba(255,43,43,0.35)] animate-pulse relative">
        {/* Cantoneiras Táticas HUD */}
        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl-lg shadow-[0_0_10px_#fff]" />
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr-lg shadow-[0_0_10px_#fff]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl-lg shadow-[0_0_10px_#fff]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-white rounded-br-lg shadow-[0_0_10px_#fff]" />
      </div>

      {/* 🏷️ Badge Flutuante Indicador com Seta */}
      <div className="absolute -top-9 left-4 px-3.5 py-1.5 rounded-full bg-[#1c0503] border-2 border-cyan-300 text-cyan-200 text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(255,43,43,0.9)] animate-bounce" style={{ animationDuration: '2s' }}>
        <Target className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '3s' }} />
        <span>{label}</span>
      </div>
    </div>,
    document.body
  );
};

export default function RobotAssistant({ 
  initialCategory = 'dashboard',
  isOpen: propIsOpen,
  onOpenChange,
}: { 
  initialCategory?: 'dashboard' | 'device_control';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      if (onOpenChange) onOpenChange(val);
    } else {
      setInternalIsOpen(val);
    }
  };

  const [activeCategory, setActiveCategory] = useState<'dashboard' | 'device_control'>(initialCategory);
  const [activeTab, setActiveTab] = useState<'tutorial' | 'kick_arena'>('tutorial');
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dockPosition, setDockPosition] = useState<'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'>('top-right');
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const modalRef = useRef<HTMLDivElement | null>(null);

  const dockClasses = {
    'top-right': 'top-16 right-5',
    'bottom-right': 'bottom-5 right-5',
    'top-left': 'top-16 left-5',
    'bottom-left': 'bottom-5 left-5',
  }[dockPosition];

  const cycleDockPosition = () => {
    setCustomPos(null);
    const order: Array<'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'> = [
      'top-right', 'bottom-right', 'top-left', 'bottom-left'
    ];
    const nextIdx = (order.indexOf(dockPosition) + 1) % order.length;
    setDockPosition(order[nextIdx]);
  };

  // 🎯 Desvio Inteligente Automático: Se a função destacada estiver na direita, o robô vai para a esquerda e vice-versa!
  useEffect(() => {
    if (!isOpen || activeTab !== 'tutorial' || customPos !== null) return;
    const activeTargetId = (activeCategory === 'dashboard' ? dashboardSteps : deviceControlSteps)[currentStep]?.targetId;
    if (!activeTargetId) return;

    const checkAndAutoPosition = () => {
      const el = document.getElementById(activeTargetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Se o elemento estiver no lado direito da tela (ex: tela preta, keylogger, VNC),
        // o assistente vai para o lado esquerdo para não cobrir a função!
        if (rect.left > window.innerWidth * 0.45) {
          setDockPosition('top-left');
        } else {
          setDockPosition('top-right');
        }
      }
    };

    checkAndAutoPosition();
    const t = setTimeout(checkAndAutoPosition, 150);
    return () => clearTimeout(t);
  }, [currentStep, isOpen, activeTab, activeCategory, customPos]);

  // 🖱️ Arrasto Livre com o Mouse pelo Cabeçalho
  const handleDragMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const modalEl = modalRef.current;
    if (!modalEl) return;
    const rect = modalEl.getBoundingClientRect();
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: rect.left,
      posY: rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(10, Math.min(window.innerWidth - 480, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.posY + dy));
      setCustomPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 📋 Passos do Tutorial: Painel Geral (Dashboard)
  const dashboardSteps: TutorialStep[] = [
    {
      targetId: 'tour-build-buttons',
      highlightLabel: '👉 Geradores de Aplicativo & Bypass',
      title: 'Geradores de APK & Bypass de Segurança',
      badge: 'Passo 1 de 4',
      icon: <Zap className="w-5 h-5 text-cyan-300" />,
      content:
        'No topo do painel, utilize os botões **GERAR APK** (padrão), **GERAR APK BYPASS** (com evasão Play Protect e otimização de bateria) ou **GERAR .EXE** para controle remoto de computadores Windows.',
      tip: 'Dica: O APK Bypass é blindado e impede que os módulos de segurança do Android encerrem a conexão em segundo plano.',
    },
    {
      targetId: 'tour-device-table',
      highlightLabel: '👉 Lista de Aparelhos Sincronizados',
      title: 'Monitoramento & Sincronização em Tempo Real',
      badge: 'Passo 2 de 4',
      icon: <Smartphone className="w-5 h-5 text-cyan-300" />,
      content:
        'A tabela central exibe todos os celulares sincronizados. Visualize instantaneamente status **ONLINE**, nível de bateria, IP e se a tela está **LIVRE** ou **BLOQUEADA** para ações.',
      tip: 'Aparelhos com luz azul/verde pulsante respondem em milissegundos aos seus toques e comandos.',
    },
    {
      targetId: 'tour-build-buttons',
      highlightLabel: '👉 Transmissão VNC Ultra-Rápida',
      title: 'Transmissão VNC & Acesso Remoto',
      badge: 'Passo 3 de 4',
      icon: <Monitor className="w-5 h-5 text-cyan-300" />,
      content:
        'Acesse a tela do aparelho em alta definição clicando em **📺 VER VNC** ou diretamente na linha do dispositivo. Execute toques, gestos e digitação remota sem travar.',
      tip: 'O modo VNC funciona direto pelo navegador, sem necessidade de programas externos instalados.',
    },
    {
      targetId: 'tour-banking-radar',
      highlightLabel: '👉 Radar & Bypass Bancário Total',
      title: 'Radar de Alertas & Bypass Itaú, Caixa e Play Store',
      badge: 'Passo 4 de 4',
      icon: <Shield className="w-5 h-5 text-cyan-300" />,
      content:
        'O sistema monitora a abertura de aplicativos bancários (Itaú, Caixa Tem, Nubank, Bradesco) e executa o **bypass total do Google Play Protect**, neutralizando avisos de segurança!',
      tip: 'Veja abaixo o robô em ação chutando os logotipos dos bancos e da Play Store para longe!',
    },
  ];

  // 🎮 Passos do Tutorial: Controle do Aparelho (Device Control Cockpit)
  const deviceControlSteps: TutorialStep[] = [
    {
      targetId: 'tour-black-screen',
      highlightLabel: '👉 Ativar Tela Preta / Cortina',
      title: '🕶️ Como Dar Tela Preta (Black Screen)',
      badge: 'Controle 1 de 6',
      icon: <Eye className="w-5 h-5 text-cyan-300" />,
      content:
        'Clique em **ATIVAR TELA PRETA** no painel lateral direito. A tela física do aparelho alvo ficará completamente escura (ou exibindo uma tela fake de atualização do sistema). Assim você pode navegar, abrir bancos e transferir sem a vítima ver nada!',
      tip: 'Dica: Clique no ícone de engrenagem ao lado para editar o texto e a imagem da tela preta como "Atualizando o Android...".',
    },
    {
      targetId: 'tour-vnc-stream',
      highlightLabel: '👉 Transmissão VNC & Toques Remotos',
      title: '📺 Transmissão VNC HD & Toques',
      badge: 'Controle 2 de 6',
      icon: <Monitor className="w-5 h-5 text-cyan-300" />,
      content:
        'Assista à tela do celular em tempo real com até **60 FPS**. Dê cliques com o botão esquerdo do mouse para tocar, arraste para rolar a página e use os botões **Voltar (◀)**, **Início (⌂)** e **Recentes (▢)** na barra lateral esquerda.',
      tip: 'Dica: Use a barra inferior "Digite para enviar texto rápido" para preencher campos no celular instantaneamente.',
    },
    {
      targetId: 'tour-screen-reader',
      highlightLabel: '👉 Leitor de Tela & Bypass Anti-Print',
      title: '👁️ Screen Reader V2 (Bypass Anti-Print / Bancos)',
      badge: 'Controle 3 de 6',
      icon: <Layers className="w-5 h-5 text-cyan-300" />,
      content:
        'Aplicativos de bancos (Itaú, Caixa, Nubank) ativam proteção contra print (**FLAG_SECURE**), deixando a imagem preta no VNC. O **Screen Reader V2** extrai a árvore interna do Android e exibe todos os botões e textos clicáveis para você interagir normalmente!',
      tip: 'Dica: Clique diretamente na lista de elementos do Screen Reader V2 para clicar nos botões do banco mesmo no escuro.',
    },
    {
      targetId: 'tour-fake-injects',
      highlightLabel: '👉 Injeção de Telas Fake Oficiais',
      title: '💉 Injeção de Telas Fake (Captura de Senhas & PINs)',
      badge: 'Controle 4 de 6',
      icon: <Zap className="w-5 h-5 text-cyan-300" />,
      content:
        'Clique em **INJEÇÃO DE TELAS FAKE** no menu lateral esquerdo. Escolha o banco desejado (**Itaú, Nubank, Caixa Tem, Banco do Brasil, Bradesco, Santander**). Uma tela oficial interativa aparecerá instantaneamente sobre o app da vítima solicitando senha ou assinatura eletrônica!',
      tip: 'Dica: Assim que a vítima digita, a senha cai no seu **Bloco de Notas / Senhas** e no Keylogger em tempo real!',
    },
    {
      targetId: 'tour-keylogger',
      highlightLabel: '👉 Keylogger & Monitor VIP',
      title: '⌨️ Keylogger em Tempo Real & VIP Banking',
      badge: 'Controle 5 de 6',
      icon: <Target className="w-5 h-5 text-cyan-300" />,
      content:
        'Monitore tudo que a vítima digita no teclado do celular (senhas, CPFs, mensagens). O **VIP Banking Monitor** avisa com alertas sonoros assim que um aplicativo de banco for aberto no aparelho!',
      tip: 'Dica: Use o botão "COPIAR" ao lado de qualquer texto capturado para colar rapidamente em formulários.',
    },
    {
      targetId: 'tour-admin-perms',
      highlightLabel: '👉 Admin & Manter Tela Ligada',
      title: '🛡️ Permissões de Admin & Otimização do Sistema',
      badge: 'Controle 6 de 6',
      icon: <Shield className="w-5 h-5 text-cyan-300" />,
      content:
        'Clique em **SOLICITAR PERMISSÃO ADMIN** na barra lateral para fixar o aplicativo como Administrador do Dispositivo e impedir desinstalação. Ative também **MANTER TELA ON** para não deixar o celular bloquear.',
      tip: 'Dica: Use "OTIMIZAR SISTEMA & ROM" para desativar a economia de bateria agressiva de marcas como Xiaomi e Samsung.',
    },
  ];

  const currentStepsList = activeCategory === 'dashboard' ? dashboardSteps : deviceControlSteps;

  // Auto-open on first visit
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('gangstar_robot_tour_seen');
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleNext = () => {
    if (currentStep < currentStepsList.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('gangstar_robot_tour_seen', 'true');
    } catch {
      // ignore
    }
  };

  const handleOpenTour = () => {
    setCurrentStep(0);
    setActiveTab('tutorial');
    setIsMinimized(false);
    setIsOpen(true);
  };

  const activeData = currentStepsList[currentStep] || currentStepsList[0];

  return (
    <>
      {/* 🎯 SPOTLIGHT NO ELEMENTO DO PAINEL EM TEMPO REAL */}
      {isOpen && activeTab === 'tutorial' && (
        <SpotlightTargetOverlay 
          targetId={activeData.targetId} 
          label={activeData.highlightLabel || 'Função Demonstrada'} 
          isActive={true} 
        />
      )}

      {/* 🤖 GATILHO FLUTUANTE DO ROBÔ (POSICIONADO NO CANTO SUPERIOR DIREITO) */}
      <div className={`fixed ${dockClasses} z-40 flex items-center gap-3`}>
        {!isOpen && (
          <button
            type="button"
            onClick={handleOpenTour}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#380b03]/95 via-[#551203]/95 to-[#240703]/95 border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_25px_rgba(255,43,43,0.4)] hover:shadow-[0_0_35px_rgba(255,43,43,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-xl"
            title="Abrir Robô Assistente & Simulador Bypass"
          >
            {/* Ambient Pulse Glow */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-300 shadow-[0_0_10px_#ff2b2b]" />

            <RobotAvatar size={36} isFloating theme="cyan" />

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider text-cyan-300 font-mono uppercase">
                  ROBÔ ASSISTENTE
                </span>
                <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <span className="text-[9px] text-cyan-200/70 font-mono block">
                {activeCategory === 'device_control' ? 'Como Dar Tela Preta & VNC' : 'Como Usar & Kick Bancos'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* 💬 MODAL INTERATIVO DO ROBÔ COM ABAS, MINIMIZAR & DESTAQUES */}
      {isOpen && (
        isMinimized ? (
          /* 🗕 BARRA COMPACTA FLUTUANTE (NÃO COBRE A TELA) */
          <div className={`fixed ${dockClasses} z-50 transition-all duration-300 animate-scale-in select-none`}>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#380b03]/98 via-[#551203]/98 to-[#240703]/98 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(255,43,43,0.6)] backdrop-blur-2xl">
              <RobotAvatar size={34} isFloating isSpeaking theme="cyan" />
              <div className="text-left max-w-[220px]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-cyan-200 font-mono truncate">
                    {activeData.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black font-mono bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
                    {currentStep + 1}/{currentStepsList.length}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400/80 font-mono block truncate">
                  {activeData.highlightLabel?.replace('👉 ', '')}
                </span>
              </div>

              {/* Botões de Ação na Barra Compacta */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-cyan-500/30">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="p-1 rounded-lg border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 disabled:opacity-30 transition-all"
                  title="Passo Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs font-mono shadow-[0_0_12px_#ff2b2b] transition-all flex items-center gap-1"
                  title="Próximo Passo"
                >
                  <span>{currentStep === currentStepsList.length - 1 ? 'Concluir' : 'Próximo'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all ml-1"
                  title="Expandir Janela Completa"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-red-400 transition-all"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 🗖 MODAL COMPLETO (AUTO-FIT COM ROLAGEM INTERNA, DRAG LIVRE E DESVIO INTELIGENTE) */
          <div 
            ref={modalRef}
            style={customPos ? { top: customPos.y, left: customPos.x, right: 'auto', bottom: 'auto' } : undefined}
            className={`fixed ${customPos ? '' : dockClasses} z-50 w-[94vw] max-w-[480px] max-h-[82vh] transition-all duration-300 animate-scale-in select-none`}
          >
            <div className="relative h-full max-h-[82vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#380b03]/98 via-[#300903]/98 to-[#1c0503]/98 border-2 border-cyan-400/70 shadow-[0_0_50px_rgba(255,43,43,0.45)] backdrop-blur-2xl p-4 sm:p-5 overflow-hidden">
              {/* Top Laser Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#ff2b2b]" />

              {/* Background cyber pattern */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header: Robô, Abas, Mover & Botão Minimizar / Fechar */}
              <div 
                onMouseDown={handleDragMouseDown}
                className="flex items-center justify-between pb-3 border-b border-cyan-500/25 relative z-10 flex-shrink-0 cursor-grab active:cursor-grabbing"
                title="Clique e arraste para posicionar o robô onde quiser"
              >
                <div className="flex items-center gap-3">
                  <RobotAvatar size={42} isFloating isSpeaking theme="cyan" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-widest text-cyan-300 uppercase font-mono drop-shadow-[0_0_8px_rgba(255,43,43,0.7)]">
                        ROBÔ ASSISTENTE
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black font-mono bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 shadow-[0_0_8px_rgba(255,43,43,0.3)]">
                        {activeTab === 'tutorial' ? activeData.badge : 'SIMULADOR 3D'}
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-300/70 font-mono flex items-center gap-1 mt-0.5">
                      <Play className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                      {activeCategory === 'device_control' ? 'Guia de Controle do Celular' : 'Guia Interativo com Destaques'}
                    </span>
                  </div>
                </div>

                {/* Controles da Janela: Mover, Minimizar e Fechar */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={cycleDockPosition}
                    className="p-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 transition-all hover:scale-105 active:scale-95"
                    title={`Mover Janela (${dockPosition})`}
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 transition-all hover:scale-105 active:scale-95"
                    title="Minimizar para Barra Flutuante"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleComplete}
                    className="p-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 transition-all hover:scale-105 active:scale-95"
                    title="Fechar Tutorial"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 📑 SELETOR DE MODO: PAINEL GERAL vs CONTROLE DO CELULAR vs CHUTAR BANCOS */}
              <div className="flex items-center gap-1.5 mt-2.5 p-1 rounded-xl bg-slate-950/80 border border-cyan-500/30 relative z-10 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('dashboard');
                    setActiveTab('tutorial');
                    setCurrentStep(0);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'tutorial' && activeCategory === 'dashboard'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-[0_0_12px_rgba(255,43,43,0.5)]'
                      : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-500/10'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Painel Geral</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('device_control');
                    setActiveTab('tutorial');
                    setCurrentStep(0);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'tutorial' && activeCategory === 'device_control'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-[0_0_12px_rgba(255,43,43,0.5)]'
                      : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-500/10'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Controle & Tela Preta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('kick_arena')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'kick_arena'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-[0_0_12px_rgba(255,43,43,0.5)]'
                      : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-500/10'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>Chutar Bancos</span>
                </button>
              </div>

              {/* CONTEÚDO ROLÁVEL (NUNCA TRAVA O FOOTER) */}
              <div className="flex-1 overflow-y-auto pr-1 my-2 relative z-10 custom-scrollbar">
                {activeTab === 'kick_arena' ? (
                  <div className="py-1">
                    <RobotKickShowcase />
                  </div>
                ) : (
                  /* Step Content Body */
                  <div className="py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40">
                        {activeData.icon}
                      </div>
                      <h4 className="text-sm font-black text-white font-mono tracking-wide">
                        {activeData.title}
                      </h4>
                    </div>

                    <p className="text-xs text-cyan-100/90 leading-relaxed font-sans mt-1">
                      {activeData.content.split('**').map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="text-cyan-300 font-bold drop-shadow-[0_0_6px_rgba(255,43,43,0.4)]">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>

                    {activeCategory === 'dashboard' && currentStep === 3 && (
                      <div className="mt-3">
                        <RobotKickShowcase autoKick={true} />
                      </div>
                    )}

                    {activeData.tip && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#240703]/90 border border-cyan-500/30 flex items-start gap-2 text-[11px] text-cyan-200/80 font-mono shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{activeData.tip}</span>
                      </div>
                    )}

                    {/* Indicador de foco da função no painel */}
                    <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-cyan-300/80">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-cyan-400 animate-pulse" />
                        Função demonstrada
                      </span>
                      <span className="text-[9px] text-cyan-400 font-black">
                        {activeData.highlightLabel?.replace('👉 ', '')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Progress Indicators (Apenas no Tutorial) */}
              {activeTab === 'tutorial' && (
                <div className="flex items-center justify-between gap-1.5 my-1.5 relative z-10 flex-shrink-0">
                  {currentStepsList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? 'bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_10px_#ff2b2b]'
                          : idx < currentStep
                          ? 'bg-cyan-600/60'
                          : 'bg-slate-800'
                      }`}
                      title={`Ir para Passo ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Footer: Navegação Anterior / Próximo (SEMPRE VISÍVEL & FIXO) */}
              {activeTab === 'tutorial' ? (
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-cyan-500/25 relative z-10 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  <div className="text-[10px] font-mono text-cyan-400/80 font-bold">
                    {currentStep + 1} / {currentStepsList.length}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-black shadow-[0_0_15px_rgba(255,43,43,0.4)] hover:shadow-[0_0_20px_rgba(255,43,43,0.7)] transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                  >
                    <span>{currentStep === currentStepsList.length - 1 ? 'Concluir' : 'Próximo'}</span>
                    {currentStep === currentStepsList.length - 1 ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="pt-2.5 border-t border-cyan-500/25 flex items-center justify-between relative z-10 flex-shrink-0">
                  <span className="text-[10px] font-mono text-cyan-300/70">
                    ⚡ O robô chuta as logos ao vivo na Sidebar
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tutorial')}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs font-mono font-bold transition-all"
                  >
                    Voltar ao Tutorial
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
}

/* ==========================================================================
   🤖 MASCOTE ROBÔ CIBERNÉTICO (CORPO INTEIRO + PERNA DE CHUTE + PROPULSOR + PISADA)
   ========================================================================== */
export const FullBodyKickingRobot: React.FC<{ 
  size?: number; 
  className?: string;
  kickPhase?: 'idle' | 'charging' | 'impact' | 'flying' | 'wall_hit' | 'returning';
}> = ({
  size = 72,
  className = '',
  kickPhase = 'idle',
}) => {
  const cyanGlow = '#ff2b2b';
  const midBlue = '#dc2626';
  const isKickingImpact = kickPhase === 'impact';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        kickPhase === 'idle' || kickPhase === 'returning' ? 'animate-robot-idle-alive' : ''
      } ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Aura de Energia Cibernética */}
      <div 
        className="absolute inset-0 rounded-full blur-md animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,43,43,0.45) 0%, rgba(220,38,38,0.18) 70%, transparent 100%)'
        }}
      />

      <svg
        viewBox="0 0 110 120"
        className="w-full h-full relative z-10 overflow-visible"
        style={{ 
          filter: `drop-shadow(0 0 8px ${cyanGlow})`,
          transform: 
            kickPhase === 'charging' 
              ? 'translateX(-3px) rotate(-4deg)' 
              : isKickingImpact 
              ? 'translateX(4px) rotate(4deg)' 
              : 'translateX(0px) rotate(0deg)',
          transition: isKickingImpact ? 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'transform 0.3s ease-out'
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyberRobotBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="50%" stopColor="#160606" />
            <stop offset="100%" stopColor="#0a0404" />
          </linearGradient>
          <linearGradient id="cyberRobotVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#300a03" />
            <stop offset="100%" stopColor="#140403" />
          </linearGradient>
        </defs>

        {/* --- 📡 ANTENAS VIVAS & PULSANTES --- */}
        <line x1="42" y1="20" x2="34" y2="6" stroke={cyanGlow} strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="6" r="3" fill={cyanGlow} className="animate-pulse" />

        <line x1="68" y1="20" x2="76" y2="6" stroke={cyanGlow} strokeWidth="2" strokeLinecap="round" />
        <circle cx="76" cy="6" r="3" fill={cyanGlow} className="animate-pulse" />

        {/* --- 🤖 CABEÇA DO ROBÔ --- */}
        <rect x="30" y="18" width="50" height="42" rx="14" fill="url(#cyberRobotBody)" stroke={cyanGlow} strokeWidth="1.8" />
        {/* Parafusos das Orelhas */}
        <rect x="25" y="32" width="5" height="14" rx="2" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        <rect x="80" y="32" width="5" height="14" rx="2" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />

        {/* Viseira Digital */}
        <rect x="35" y="24" width="40" height="28" rx="8" fill="url(#cyberRobotVisor)" stroke="#ff6b6b" strokeWidth="1.2" />

        {/* Olhos LED Expressivos (Piscando naturalmente) */}
        <g className="animate-robot-blink">
          <rect x="41" y="32" width="10" height="11" rx="3.5" fill={cyanGlow} />
          <circle cx="44" cy="35" r="1.2" fill="#ffffff" />
          <rect x="59" y="32" width="10" height="11" rx="3.5" fill={cyanGlow} />
          <circle cx="62" cy="35" r="1.2" fill="#ffffff" />
        </g>
        {/* Sorriso Cibernético */}
        <path d="M49 46 Q55 50 61 46" stroke={cyanGlow} strokeWidth="1.5" strokeLinecap="round" />

        {/* --- 🤖 CORPO / TRONCO DO ROBÔ --- */}
        {/* Pescoço */}
        <rect x="49" y="60" width="12" height="5" rx="1.5" fill="#2a1212" stroke={cyanGlow} strokeWidth="1" />
        {/* Peitoral Mecha Blindado */}
        <rect x="36" y="64" width="38" height="28" rx="8" fill="url(#cyberRobotBody)" stroke={cyanGlow} strokeWidth="1.8" />
        {/* Arc Reactor no Peito (Pulsa com energia constante) */}
        <circle cx="55" cy="76" r="6" fill="#300a03" stroke={cyanGlow} strokeWidth="1.2" />
        <circle cx="55" cy="76" r="3.5" fill={cyanGlow} className="animate-pulse" />

        {/* Braço Esquerdo (Reage dinamicamente ao impacto/chute) */}
        <g style={{ 
          transformOrigin: '36px 68px',
          transform: isKickingImpact ? 'rotate(18deg)' : kickPhase === 'charging' ? 'rotate(-12deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-out'
        }}>
          <path d="M36 68 L22 76 L24 86" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="86" r="3.5" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        </g>

        {/* Braço Direito (Postura de Ataque / Força) */}
        <g style={{ 
          transformOrigin: '74px 68px',
          transform: isKickingImpact ? 'rotate(-22deg)' : kickPhase === 'charging' ? 'rotate(15deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-out'
        }}>
          <path d="M74 68 L88 74 L86 84" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="86" cy="84" r="3.5" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        </g>

        {/* --- 💥 ONDA DE CHOQUE DA PISADA NO CHÃO (NO IMPACTO) --- */}
        {isKickingImpact && (
          <g>
            <ellipse cx="44" cy="112" rx="16" ry="4" stroke={cyanGlow} strokeWidth="1.8" fill="none" className="animate-ground-stomp" />
            <ellipse cx="44" cy="112" rx="26" ry="6" stroke="#ffffff" strokeWidth="1" fill="rgba(255,43,43,0.25)" className="animate-ground-stomp" />
            <line x1="38" y1="110" x2="28" y2="102" stroke={cyanGlow} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="50" y1="110" x2="60" y2="102" stroke={cyanGlow} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="28" cy="102" r="1.5" fill="#ffffff" />
            <circle cx="60" cy="102" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* --- 🦵 PERNA ESQUERDA (PÉ DE APOIO QUE PISA FIRME NO CHÃO) --- */}
        <rect x="42" y="92" width="7" height="16" rx="3.5" fill="#160606" stroke={cyanGlow} strokeWidth="1.5" />
        <path d="M36 108 L52 108 L52 112 L36 112 Z" fill={midBlue} stroke={cyanGlow} strokeWidth="1.2" />

        {/* --- 🦵 PERNA DIREITA MECÂNICA (CHUTA PARA FRENTE E RETRAI IMEDIATAMENTE QUANDO A LOGO VAI PARA LONGE) --- */}
        <g 
          style={{ 
            transformOrigin: '58px 92px',
            transform: 
              kickPhase === 'charging' 
                ? 'rotate(-28deg)' 
                : isKickingImpact 
                ? 'rotate(65deg)' 
                : kickPhase === 'flying'
                ? 'rotate(-6deg)' 
                : 'rotate(0deg)',
            transition: 
              isKickingImpact 
                ? 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)' 
                : kickPhase === 'charging'
                ? 'transform 0.35s ease-out'
                : 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)'
          }}
        >
          {/* Coxa Mecânica */}
          <rect x="58" y="92" width="8" height="15" rx="4" fill="#160606" stroke={cyanGlow} strokeWidth="1.5" />
          {/* Junta do Joelho */}
          <circle cx="62" cy="107" r="3.5" fill="#ffffff" stroke={cyanGlow} strokeWidth="1" />
          {/* Canela e Pé Chutando */}
          <path d="M58 107 L58 118 L76 118 L76 113 L66 107 Z" fill={midBlue} stroke={cyanGlow} strokeWidth="1.8" />
          
          {/* Propulsor de Plasma / Raio do Chute (Dispara apenas no impacto) */}
          {isKickingImpact && (
            <>
              <path d="M76 112 L96 116 L76 120 Z" fill={cyanGlow} className="animate-pulse" />
              <path d="M76 114 L88 116 L76 118 Z" fill="#ffffff" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

/* ==========================================================================
   🥋 MINI ARENA DO ROBÔ PARA A BARRA LATERAL (SIDEBAR)
   ========================================================================== */
export const SidebarRobotKick: React.FC = () => {
  const [logoIndex, setLogoIndex] = useState<number>(0);
  const [kickPhase, setKickPhase] = useState<'idle' | 'charging' | 'impact' | 'flying' | 'wall_hit' | 'returning'>('idle');
  const [showStompBadge, setShowStompBadge] = useState<boolean>(false);
  const [cycleKey, setCycleKey] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [screenPos, setScreenPos] = useState<{ top: number; left: number } | null>(null);

  const BANK_CARDS = [
    { id: 'caixa', name: 'CAIXA', Card: CaixaLogoCard },
    { id: 'caixa_tem', name: 'CAIXA Tem', Card: CaixaTemLogoCard },
    { id: 'sicredi', name: 'Sicredi', Card: SicrediLogoCard },
    { id: 'itau', name: 'Itaú', Card: ItauLogoCard },
  ];

  useEffect(() => {
    const updatePos = () => {
      if (containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setScreenPos({ top: bounds.top + bounds.height / 2 - 22, left: bounds.left + 90 });
      }
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);

    let active = true;
    let timerId: any = null;
    let badgeTimerId: any = null;

    const runCycle = () => {
      if (!active) return;
      setKickPhase('charging');

      timerId = setTimeout(() => {
        if (!active) return;
        setKickPhase('impact');
        setCycleKey((k) => k + 1);
        setShowStompBadge(true);

        // O badge "PISOU!" fica exatamente 1.0 segundo e depois desaparece
        clearTimeout(badgeTimerId);
        badgeTimerId = setTimeout(() => {
          if (active) setShowStompBadge(false);
        }, 1000);

        // 3. A logo sai voando para longe aos 130ms -> PERNA VOLTA PARA TRÁS IMEDIATAMENTE!
        timerId = setTimeout(() => {
          if (!active) return;
          setKickPhase('flying');

          // 4. A logo atinge o extremo direito da tela (impacto na parede) aos 520ms
          timerId = setTimeout(() => {
            if (!active) return;
            setKickPhase('wall_hit');

            // 5. Conclusão do voo: próximo banco assume a frente na fila
            timerId = setTimeout(() => {
              if (!active) return;
              setKickPhase('returning');
              setLogoIndex((prev) => (prev + 1) % BANK_CARDS.length);

              // 6. Pouso na posição neutra / repouso
              timerId = setTimeout(() => {
                if (!active) return;
                setKickPhase('idle');

                // 7. Intervalo antes do próximo ciclo de chute
                timerId = setTimeout(runCycle, 800);
              }, 250);
            }, 250);
          }, 520);
        }, 130);
      }, 350);
    };

    const initialTimer = setTimeout(runCycle, 500);

    return () => {
      active = false;
      clearTimeout(initialTimer);
      clearTimeout(timerId);
      clearTimeout(badgeTimerId);
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="w-full my-3 px-1 select-none">
        <div className={`relative w-full h-[120px] rounded-2xl bg-gradient-to-r from-[#1c0503]/95 via-[#380b03]/90 to-[#170403]/95 border border-cyan-500/35 p-2 overflow-hidden flex items-center justify-between shadow-[0_0_25px_rgba(255,43,43,0.2)] ${kickPhase === 'impact' ? 'animate-arena-jolt' : ''}`}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff2b2b07_1px,transparent_1px),linear-gradient(to_bottom,#ff2b2b07_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />

          <div className="relative z-10 flex-shrink-0 flex items-center justify-center pl-0.5">
            <FullBodyKickingRobot size={58} kickPhase={kickPhase} />

            {/* Badge Tático Neon "💥 PISOU!" ao pisar no chão - visível por 1 segundo */}
            {showStompBadge && (
              <div 
                key={`stomp-badge-${cycleKey}`}
                className="animate-stomp-badge absolute -bottom-1.5 left-1 px-1.5 py-0.2 rounded-md bg-[#240603]/95 border border-cyan-300 text-[8px] font-mono font-black text-cyan-200 shadow-[0_0_12px_#ff2b2b] pointer-events-none z-30"
              >
                💥 PISOU!
              </div>
            )}
          </div>

          <div className="relative z-10 flex-1 ml-1.5 h-[98px] rounded-xl border border-dashed border-cyan-400/45 bg-[#1d0403]/85 p-1.5 flex flex-col justify-between overflow-hidden shadow-inner">
            <div className="flex items-center justify-end pr-1 pt-0.5">
              <span className="text-[9px] font-black font-mono tracking-widest text-cyan-300 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                NA FILA
              </span>
            </div>

            <div className="relative flex-1 flex items-center justify-center -mt-1">
              <div 
                className="absolute transform translate-x-7 -translate-y-1.5 scale-70 opacity-30 blur-[0.5px] pointer-events-none transition-all duration-300"
                style={{ zIndex: 1 }}
              >
                {React.createElement(BANK_CARDS[(logoIndex + 2) % BANK_CARDS.length].Card, { size: 38 })}
              </div>

              <div 
                className={`absolute pointer-events-none transition-all duration-300 ${
                  kickPhase === 'impact' || kickPhase === 'flying' || kickPhase === 'wall_hit'
                    ? 'translate-x-0 translate-y-0 scale-100 opacity-100' 
                    : 'translate-x-3.5 -translate-y-0.5 scale-85 opacity-65'
                }`}
                style={{ zIndex: 2 }}
              >
                {React.createElement(BANK_CARDS[(logoIndex + 1) % BANK_CARDS.length].Card, { size: 40 })}
              </div>

              <div 
                className={`absolute pointer-events-none transition-all duration-200 ${
                  kickPhase === 'impact' || kickPhase === 'flying' || kickPhase === 'wall_hit'
                    ? 'opacity-0 scale-90 translate-x-3' 
                    : 'opacity-100 scale-100 translate-x-0'
                }`}
                style={{ zIndex: 3 }}
              >
                {React.createElement(BANK_CARDS[logoIndex].Card, { size: 42 })}
              </div>
            </div>
          </div>

          <div className="absolute bottom-1.5 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_8px_#ff2b2b]" />
        </div>
      </div>

      {/* 🚀 LOGO ATIVA CHUTADA ATRAVESSANDO A TELA INTEIRA VIA PORTAL (100% SINCRONIZADA COM O CHUTE) */}
      {screenPos && (kickPhase === 'impact' || kickPhase === 'flying' || kickPhase === 'wall_hit') && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed pointer-events-none z-[999999] overflow-visible"
          style={{
            top: screenPos.top,
            left: screenPos.left,
            width: '120px',
            height: '45px',
          }}
        >
          {/* Laser condutor de disparo que corta o painel */}
          <div 
            className="animate-screen-laser absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-gradient-to-r from-cyan-400/80 via-cyan-300 to-sky-400 shadow-[0_0_15px_#ff2b2b] pointer-events-none origin-left" 
            style={{ width: `calc(100vw - ${screenPos.left + 60}px)` }}
          />

          {/* Anel de impacto expansivo no ponto de contato */}
          <div 
            key={`hit-ring-${cycleKey}`}
            className="animate-kick-hit-ring absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 w-14 h-14 rounded-full border-2 border-cyan-300 shadow-[0_0_20px_#ff2b2b] pointer-events-none z-10"
          />

          {/* Explosão de faíscas estelares (Hit Spark Burst) */}
          <div 
            key={`spark-burst-${cycleKey}`}
            className="animate-kick-spark-burst absolute top-1/2 left-1 -translate-y-1/2 -translate-x-3 w-16 h-16 rounded-full bg-cyan-300/40 blur-[1px] pointer-events-none z-12 flex items-center justify-center"
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_#ffffff]" />
          </div>

          {/* Rastro fantasma de alta velocidade atrás da logo (Afterimage Trail) */}
          <div
            key={`flight-trail-${cycleKey}`}
            className="animate-logo-trail-ghost absolute will-change-transform opacity-50 filter blur-[0.8px] scale-90 z-15"
            style={{
              ['--cross-distance' as string]: `calc(100vw - ${screenPos.left + 90}px)`
            }}
          >
            {React.createElement(BANK_CARDS[logoIndex].Card, { size: 40 })}
          </div>

          {/* Impacto no outro extremo do painel (Lado direito da tela) */}
          {kickPhase === 'wall_hit' && (
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
              style={{ left: `calc(100vw - ${screenPos.left + 70}px)` }}
            >
              <div key={`impact-${cycleKey}`} className="animate-screen-wall-spark absolute w-16 h-16 rounded-full bg-cyan-400/50 blur-[3px]" />
              <div key={`impact-core-${cycleKey}`} className="animate-screen-wall-spark absolute w-5 h-5 rounded-full bg-white shadow-[0_0_20px_#ff2b2b]" />
            </div>
          )}

          {/* A Logo com Squash & Stretch, Rotação Aerodinâmica e Esmagamento na Parede */}
          <div
            key={`flight-logo-${cycleKey}`}
            className="animate-screen-cross-logo absolute will-change-transform scale-100 z-20"
            style={{
              ['--cross-distance' as string]: `calc(100vw - ${screenPos.left + 90}px)`
            }}
          >
            {React.createElement(BANK_CARDS[logoIndex].Card, { size: 44 })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};




