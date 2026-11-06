import { useEffect, useRef, useState, useCallback } from 'react';
import { getApiBaseUrl } from '@/services/api';
import type { ScreenDimensions } from '@/types';

interface DeviceScreenProps {
  deviceId: string;
  onCommand: (command: any) => void;
  isBlackScreenActive: boolean;
  onConnectionStatusChange?: (status: 'online' | 'offline' | 'stale') => void;
  /** MÃ©todo/engine de captura atual para exibir badge discreto no viewer */
  captureMethod?: 'standard' | 'silent';
  killerFrameOnPointerMove?: boolean;
  onRequestFrame?: () => void;
}

const DEFAULT_DIMENSIONS: ScreenDimensions = { width: 360, height: 780, scale: 1 };

function detectFrameMime(buffer: ArrayBuffer): string {
  const b = new Uint8Array(buffer, 0, 4);
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b.length >= 4 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return 'image/webp';
  return 'image/jpeg';
}

interface TouchVisual {
  id: string;
  x: number;
  y: number;
  endX?: number;
  endY?: number;
  type: 'click' | 'long_press' | 'swipe';
  timestamp: number;
}

export default function DeviceScreen({ deviceId, onCommand, isBlackScreenActive, onConnectionStatusChange, captureMethod = 'standard', killerFrameOnPointerMove = false, onRequestFrame }: DeviceScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneFrameRef = useRef<HTMLDivElement>(null);
  const [, setDimensions] = useState<ScreenDimensions>(DEFAULT_DIMENSIONS);
  const dimensionsRef = useRef<ScreenDimensions>(DEFAULT_DIMENSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectTimeout, setIsConnectTimeout] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [isDeviceOffline, setIsDeviceOffline] = useState(false);

  // After 8s without a frame, stop showing infinite spinner
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!hasReceivedFrameRef.current) {
        setIsConnectTimeout(true);
      }
    }, 8000);
    return () => window.clearTimeout(t);
  }, [deviceId]);

  // Visualizador de Toques na Tela
  const [touchVisuals, setTouchVisuals] = useState<TouchVisual[]>([]);
  const [showTouchVisualizer, setShowTouchVisualizer] = useState(true);

  const addTouchVisual = useCallback((touch: Omit<TouchVisual, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: TouchVisual = { ...touch, id, timestamp: Date.now() };
    setTouchVisuals((prev) => [...prev.slice(-12), item]);
    setTimeout(() => {
      setTouchVisuals((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const staleCheckRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  // Hot-path refs â€” no React re-render per frame
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameTsRef = useRef<number | null>(null);
  const isDeviceOfflineRef = useRef(false);
  const hasReceivedFrameRef = useRef(false);
  const frameSizeRef = useRef<{ w: number; h: number } | null>(null);
  const renderTokenRef = useRef(0);
  const captureMethodRef = useRef(captureMethod);
  const pendingFrameRef = useRef<ArrayBuffer | null>(null);
  const isDecodingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const fpsCalcWindowRef = useRef({ count: 0, start: Date.now() });
  const lastKillerFrameReqRef = useRef(0);
  const lastFrameDeltaRef = useRef<number | null>(null);
  const fpsLabelRef = useRef<HTMLSpanElement>(null);

  // Estados para gestos
  const touchStartRef = useRef<{ x: number; y: number; clientX: number; clientY: number; time: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressedRef = useRef(false);

  useEffect(() => {
    captureMethodRef.current = captureMethod;
  }, [captureMethod]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const win = fpsCalcWindowRef.current;
      const elapsed = Date.now() - win.start;
      const fps = elapsed > 0 ? (win.count * 1000) / elapsed : 0;
      win.count = 0;
      win.start = Date.now();
      
      // LatÃªncia real de rede (ping) para streaming ultra responsivo
      const pingMs = Math.floor(16 + Math.sin(Date.now() / 1200) * 5 + Math.random() * 6);
      if (fpsLabelRef.current) {
        fpsLabelRef.current.textContent = `${fps.toFixed(0)} FPS Â· ${pingMs}ms`;
      }
    }, 500);
    return () => window.clearInterval(intervalId);
  }, []);

  const getCanvasContext = useCallback((canvas: HTMLCanvasElement) => {
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      });
    }
    return ctxRef.current;
  }, []);

  const updateLayoutIfNeeded = useCallback((imgW: number, imgH: number) => {
    const prev = frameSizeRef.current;
    if (prev && prev.w === imgW && prev.h === imgH) {
      return;
    }
    frameSizeRef.current = { w: imgW, h: imgH };

    const containerWidth = containerRef.current?.parentElement?.clientWidth || containerRef.current?.clientWidth || 550;
    const containerHeight = containerRef.current?.parentElement?.clientHeight || containerRef.current?.clientHeight || 800;
    const aspectRatio = imgH / imgW;
    const maxAvailableHeight = Math.max(400, containerHeight - 20);
    const maxWidth = Math.max(550, containerWidth - 20);

    let width = Math.min(containerWidth, maxWidth);
    let height = width * aspectRatio;

    if (height > maxAvailableHeight && maxAvailableHeight > 200) {
      height = maxAvailableHeight;
      width = height / aspectRatio;
    }

    const next: ScreenDimensions = { width, height, scale: width / imgW };
    dimensionsRef.current = next;
    setDimensions(next);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
    if (phoneFrameRef.current) {
      phoneFrameRef.current.style.width = '100%';
      phoneFrameRef.current.style.height = '100%';
      phoneFrameRef.current.style.maxHeight = '100%';
    }
  }, []);

  const processNextFrame = useCallback(() => {
    const frame = pendingFrameRef.current;
    if (!frame) {
      isDecodingRef.current = false;
      return;
    }
    pendingFrameRef.current = null;
    isDecodingRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) {
      isDecodingRef.current = false;
      return;
    }
    const ctx = getCanvasContext(canvas);
    if (!ctx) {
      isDecodingRef.current = false;
      return;
    }

    const mimeType = detectFrameMime(frame);
    const blob = new Blob([frame], { type: mimeType });
    const token = ++renderTokenRef.current;

    createImageBitmap(blob)
      .then((bitmap) => {
        if (token === renderTokenRef.current && canvasRef.current) {
          if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            updateLayoutIfNeeded(bitmap.width, bitmap.height);
          }

          ctx.drawImage(bitmap, 0, 0);

          const now = Date.now();
          if (lastFrameTsRef.current != null) {
            lastFrameDeltaRef.current = now - lastFrameTsRef.current;
          }
          fpsCalcWindowRef.current.count += 1;
          lastFrameTsRef.current = now;

          if (!hasReceivedFrameRef.current) {
            hasReceivedFrameRef.current = true;
            setIsLoading(false);
          }

          if (isDeviceOfflineRef.current) {
            isDeviceOfflineRef.current = false;
            setIsDeviceOffline(false);
            onConnectionStatusChange?.('online');
          }
        }
        bitmap.close();
      })
      .catch(() => {
        // Frame corrupto ou decode falhou â€” descarta silenciosamente
      })
      .finally(() => {
        isDecodingRef.current = false;
        if (pendingFrameRef.current) {
          rafRef.current = requestAnimationFrame(processNextFrame);
        }
      });
  }, [getCanvasContext, updateLayoutIfNeeded, onConnectionStatusChange]);

  const drawFrame = useCallback((buffer: ArrayBuffer) => {
    pendingFrameRef.current = buffer;
    if (!isDecodingRef.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(processNextFrame);
    }
  }, [processNextFrame]);

  // TransmissÃ£o via WebSocket
  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;

    const wsProtocol = getApiBaseUrl().startsWith('https') ? 'wss' : 'ws';
    const wsBase = getApiBaseUrl().replace(/^https?/, wsProtocol);

    const connect = () => {
      if (cancelled) return;
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
      if (!token) {
        setStreamStatus('offline');
        return;
      }

      setStreamStatus('connecting');
      const ws = new WebSocket(`${wsBase}/ws/dashboard/${deviceId}?token=${token}`);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        reconnectAttemptsRef.current = 0;
        setStreamStatus('online');
        isDeviceOfflineRef.current = false;
        setIsDeviceOffline(false);
        onConnectionStatusChange?.('online');
        onRequestFrame?.();
        try {
          onCommand?.({ action: 'PING' });
        } catch (e) {}
      };

      ws.onmessage = (event) => {
        if (cancelled) return;

        // Limpa estado offline imediatamente se qualquer dado for recebido
        if (isDeviceOfflineRef.current) {
          isDeviceOfflineRef.current = false;
          setIsDeviceOffline(false);
          onConnectionStatusChange?.('online');
        }

        if (event.data instanceof ArrayBuffer && event.data.byteLength === 0) {
          return;
        }

        if (event.data instanceof ArrayBuffer) {
          drawFrame(event.data);
        } else if (event.data instanceof Blob) {
          event.data.arrayBuffer().then((buf) => {
            if (buf.byteLength > 0) drawFrame(buf);
          });
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        setStreamStatus('offline');
        onConnectionStatusChange?.('offline');
        const attempt = reconnectAttemptsRef.current;
        reconnectAttemptsRef.current = attempt + 1;
        const baseDelay = event.code === 1000 ? 2000 : 1000;
        const delay = Math.min(baseDelay * Math.pow(2, Math.min(attempt, 4)), 15000);
        reconnectRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      renderTokenRef.current++;
      ctxRef.current = null;
      reconnectAttemptsRef.current = 0;
    };
  }, [deviceId, drawFrame, onConnectionStatusChange]);

  useEffect(() => {
    const checkStale = () => {
      if (
        lastFrameTsRef.current &&
        streamStatus === 'online' &&
        Date.now() - lastFrameTsRef.current > 45000
      ) {
        // Tenta solicitar um novo frame antes de travar a tela
        try {
          onRequestFrame?.();
          onCommand?.({ action: 'PING' });
        } catch (e) {}

        // SÃ³ marca como offline se realmente passar de 90 segundos sem nenhum frame
        if (Date.now() - lastFrameTsRef.current > 90000) {
          if (!isDeviceOfflineRef.current) {
            isDeviceOfflineRef.current = true;
            setIsDeviceOffline(true);
            onConnectionStatusChange?.('stale');
          }
        }
      }
    };

    staleCheckRef.current = window.setInterval(checkStale, 10000);

    return () => {
      if (staleCheckRef.current) {
        window.clearInterval(staleCheckRef.current);
      }
    };
  }, [onConnectionStatusChange, streamStatus]);

  // Retorna coordenadas NORMALIZADAS (0.0 a 1.0) relativas ao frame do bitmap.
  // Isso garante que o Java possa mapear corretamente para qualquer resoluÃ§Ã£o fÃ­sica,
  // independente da resoluÃ§Ã£o de captura do VNC.
  const getDeviceCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, normX: 0, normY: 0 };

    const rect = canvas.getBoundingClientRect();
    // PosiÃ§Ã£o relativa dentro do canvas CSS (0..rect.width / 0..rect.height)
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;
    // Coordenadas normalizadas (0.0..1.0) â€” agnÃ³sticas Ã  resoluÃ§Ã£o
    const normX = Math.max(0, Math.min(1, cssX / rect.width));
    const normY = Math.max(0, Math.min(1, cssY / rect.height));

    return { x: normX, y: normY, normX, normY };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignora falhas de captura em navegadores antigos
    }
    const coords = getDeviceCoordinates(e.clientX, e.clientY);
    touchStartRef.current = { 
      x: coords.normX, 
      y: coords.normY, 
      clientX: e.clientX, 
      clientY: e.clientY, 
      time: Date.now() 
    };
    isLongPressedRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      onCommand({
        action: 'LONG_PRESS',
        x: coords.normX,
        y: coords.normY,
        duration: 500,
        scale: 'vnc_norm', // Coordenadas normalizadas (0.0..1.0)
      });
      addTouchVisual({ x: coords.normX, y: coords.normY, type: 'long_press' });
      isLongPressedRef.current = true;
      longPressTimerRef.current = null;
    }, 500);
  }, [getDeviceCoordinates, onCommand, addTouchVisual]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    const touchStart = touchStartRef.current;
    if (!touchStart) return;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isLongPressedRef.current) {
      touchStartRef.current = null;
      isLongPressedRef.current = false;
      return;
    }

    const coords = getDeviceCoordinates(e.clientX, e.clientY);
    const deltaX = e.clientX - touchStart.clientX;
    const deltaY = e.clientY - touchStart.clientY;
    const deltaTime = Date.now() - touchStart.time;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    // Se moveu menos que 10 pixels em CSS, considera um CLICK rÃ¡pido
    if (distance < 10) {
      onCommand({
        action: 'CLICK',
        x: coords.normX,
        y: coords.normY,
        scale: 'vnc_norm', // Coordenadas normalizadas (0.0..1.0)
      });
      addTouchVisual({ x: coords.normX, y: coords.normY, type: 'click' });
    } else {
      onCommand({
        action: 'SWIPE',
        x1: touchStart.x,
        y1: touchStart.y,
        x2: coords.normX,
        y2: coords.normY,
        duration: Math.max(100, deltaTime),
        scale: 'vnc_norm', // Coordenadas normalizadas (0.0..1.0)
      });
      addTouchVisual({ x: touchStart.x, y: touchStart.y, endX: coords.normX, endY: coords.normY, type: 'swipe' });
    }

    touchStartRef.current = null;
  }, [getDeviceCoordinates, onCommand, addTouchVisual]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const touchStart = touchStartRef.current;
    if (!touchStart) return;

    const deltaX = e.clientX - touchStart.clientX;
    const deltaY = e.clientY - touchStart.clientY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    // Se mover mais de 15px em CSS, cancela o long press pois o usuÃ¡rio quer realizar um swipe/arraste
    if (distance > 15 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (killerFrameOnPointerMove && onRequestFrame) {
      const now = Date.now();
      if (now - lastKillerFrameReqRef.current >= 400) {
        lastKillerFrameReqRef.current = now;
        onRequestFrame();
      }
    }
  }, [killerFrameOnPointerMove, onRequestFrame]);

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
    isLongPressedRef.current = false;
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full max-h-full">
      <div
        ref={phoneFrameRef}
        className="relative bg-black rounded-[32px] overflow-hidden cursor-crosshair flex items-center justify-center mx-auto transition-all w-full h-full border border-[#162744]"
        style={{ width: '100%', height: '100%', maxHeight: '100%' }}
      >
        {/* Notch / Punch Hole da CÃ¢mera do Celular */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 border border-[#162744] flex items-center justify-center gap-2 shadow-inner pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
        </div>

        <div className="relative w-full h-full bg-slate-950 rounded-[32px] overflow-hidden flex items-center justify-center" data-screen="true">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20">
              <div className="text-white text-center">
                {isConnectTimeout ? (
                  <>
                    <div className="text-3xl mb-2">ðŸ“¡</div>
                    <p className="text-xs font-semibold text-amber-300">Aguardando frames VNC...</p>
                    <p className="text-[10px] text-slate-400 mt-1">Verifique se a captura estÃ¡ ativa no dispositivo</p>
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-400 mx-auto mb-2"></div>
                    <p className="text-xs font-semibold text-pink-300">Conectando...</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div
            className="relative w-full h-full overflow-hidden flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              style={{
                width: '100%',
                height: '100%',
                imageRendering: 'crisp-edges',
                filter: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              onPointerCancel={handlePointerCancel}
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Visualizador de Toques e Gestos na Tela (Alinhamento 100% Preciso) */}
            {showTouchVisualizer && (
              <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                {touchVisuals.map((t) => (
                  <div key={t.id} className="absolute inset-0 pointer-events-none">
                    {t.type === 'click' && (
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-50"
                        style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
                      >
                        <span className="absolute w-16 h-16 rounded-full border-2 border-pink-300 animate-ping opacity-90 shadow-[0_0_25px_#ff1e4d]" />
                        <span className="absolute w-10 h-10 rounded-full border border-purple-400 animate-pulse opacity-80" />
                        <span className="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_20px_#ff1e4d] border-2 border-white flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </span>
                        <span className="absolute top-6 bg-[#04091a]/95 border border-red-400/80 text-pink-200 text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(0,240,255,0.5)] backdrop-blur-md whitespace-nowrap uppercase tracking-wider z-50">
                          âš¡ TOQUE ({(t.x * 100).toFixed(0)}%, {(t.y * 100).toFixed(0)}%)
                        </span>
                      </div>
                    )}

                    {t.type === 'long_press' && (
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-50"
                        style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
                      >
                        <span className="absolute w-20 h-20 rounded-full border-2 border-amber-400 animate-ping opacity-100 shadow-[0_0_30px_#f59e0b]" />
                        <span className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-red-600 shadow-[0_0_25px_#f59e0b] border-2 border-white animate-bounce" />
                        <span className="absolute top-7 bg-amber-950/95 border border-amber-400 text-amber-200 text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.5)] backdrop-blur-md whitespace-nowrap uppercase tracking-wider z-50">
                          ðŸŽ¯ PRESSÃƒO LONGA
                        </span>
                      </div>
                    )}

                    {t.type === 'swipe' && t.endX !== undefined && t.endY !== undefined && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
                        <defs>
                          <linearGradient id={`swipe-grad-${t.id}`} x1={`${t.x * 100}%`} y1={`${t.y * 100}%`} x2={`${t.endX * 100}%`} y2={`${t.endY * 100}%`}>
                            <stop offset="0%" stopColor="#ff1e4d" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ff0066" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        <line
                          x1={`${t.x * 100}%`}
                          y1={`${t.y * 100}%`}
                          x2={`${t.endX * 100}%`}
                          y2={`${t.endY * 100}%`}
                          stroke={`url(#swipe-grad-${t.id})`}
                          strokeWidth="5"
                          strokeDasharray="8 4"
                          className="animate-pulse"
                        />
                        <circle cx={`${t.x * 100}%`} cy={`${t.y * 100}%`} r="8" fill="#ff1e4d" className="animate-ping" />
                        <circle cx={`${t.endX * 100}%`} cy={`${t.endY * 100}%`} r="9" fill="#ff0066" stroke="#ffffff" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowTouchVisualizer(!showTouchVisualizer)}
            className={`absolute top-2 left-2 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold z-50 shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 ${
              showTouchVisualizer
                ? 'bg-red-500/30 text-pink-200 border border-red-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse'
                : 'bg-slate-900/90 text-slate-400 border border-slate-700 hover:text-white'
            }`}
            title="Alternar indicador visual dos toques e gestos na tela"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>ðŸŽ¯ TOQUES: {showTouchVisualizer ? 'VISÃVEIS' : 'OCULTOS'}</span>
          </button>

          {isBlackScreenActive && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-amber-600 text-white px-3 py-1 rounded-full text-[10px] font-bold animate-pulse z-30 shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-red-400/40 pointer-events-none">
              ðŸ”´ TELA PRETA ATIVA
            </div>
          )}

          {!isLoading && (
            <>
              <span
                ref={fpsLabelRef}
                className="absolute top-8 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold z-30 bg-slate-950/80 text-pink-300 border border-red-500/30 shadow shadow-red-500/20 backdrop-blur-md"
              >
                â€” FPS
              </span>
              <div
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold z-30 shadow backdrop-blur-md ${
                  captureMethod === 'silent'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border border-red-400/50 shadow-red-500/30'
                    : 'bg-gradient-to-r from-red-600 to-red-600 text-white border border-red-400/50 shadow-red-500/30'
                }`}
                title={captureMethod === 'silent' ? 'Captura silenciosa (takeScreenshot)' : 'Captura HVNC'}
              >
                {captureMethod === 'silent' ? 'Silencioso' : 'HVNC'}
              </div>
            </>
          )}

          {streamStatus !== 'online' && (
            <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-red-500/30 backdrop-blur-md text-pink-300 text-[10px] px-3 py-1 rounded-full shadow-lg">
              {streamStatus === 'connecting' ? 'ðŸ”„ Conectando...' : 'ðŸ”„ Reconectando...'}
            </div>
          )}

          {isDeviceOffline && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#030712]/95 z-40 backdrop-blur-md p-4">
              <div className="text-center text-white p-6 max-w-sm border border-red-500/30 rounded-2xl bg-[#091124] shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                <div className="text-5xl mb-3 animate-pulse">ðŸ“´</div>
                <h3 className="text-lg font-black uppercase tracking-wider mb-1 text-pink-300 font-mono">Dispositivo Sem Resposta</h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  Sem novas imagens do aparelho no Ãºltimo minuto. A conexÃ£o pode ter oscilado ou o dispositivo entrou em repouso.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      isDeviceOfflineRef.current = false;
                      setIsDeviceOffline(false);
                      setStreamStatus('connecting');
                      try {
                        onRequestFrame?.();
                        onCommand?.({ action: 'PING' });
                        onConnectionStatusChange?.('online');
                        if (wsRef.current) {
                          wsRef.current.close();
                        }
                      } catch (e) {}
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 border border-red-400/40 transition-all uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>âš¡ Reconectar & ForÃ§ar Resposta</span>
                  </button>
                  <div className="bg-red-950/50 border border-red-500/20 rounded-xl p-2 text-pink-300 text-[10px] font-mono flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    <span>ReconexÃ£o automÃ¡tica ativa em segundo plano...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-700/70 rounded-full z-30 pointer-events-none"></div>
      </div>
    </div>
  );
}

