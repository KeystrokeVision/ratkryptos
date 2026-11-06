import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, Minimize2, Maximize2, X } from 'lucide-react';

export interface PanelPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  visible: boolean;
}

interface DraggablePanelProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  initialPosition?: Partial<PanelPosition>;
  minWidth?: number;
  minHeight?: number;
  onPositionChange?: (position: PanelPosition) => void;
  positions: Record<string, PanelPosition>;
  setPositions: React.Dispatch<React.SetStateAction<Record<string, PanelPosition>>>;
  className?: string;
  headerColor?: string;
}

export function DraggablePanel({
  id,
  title,
  icon,
  children,
  initialPosition,
  minWidth = 200,
  minHeight = 100,
  onPositionChange,
  positions,
  setPositions,
  className = '',
  headerColor = 'from-[#0d1e4c] via-[#0b1636] to-[#07112c]',
}: DraggablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // PosiÃ§Ã£o atual do painel
  const position = positions[id] || {
    id,
    x: initialPosition?.x ?? 0,
    y: initialPosition?.y ?? 0,
    width: initialPosition?.width ?? 300,
    height: initialPosition?.height ?? 400,
    zIndex: initialPosition?.zIndex ?? 1,
    minimized: false,
    visible: true,
  };

  // Inicializa posiÃ§Ã£o se nÃ£o existir
  useEffect(() => {
    if (!positions[id]) {
      setPositions(prev => ({
        ...prev,
        [id]: position,
      }));
    }
  }, [id]);

  // Trazer para frente
  const bringToFront = useCallback(() => {
    const maxZ = Math.max(...Object.values(positions).map(p => p.zIndex || 0));
    setPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: maxZ + 1 },
    }));
  }, [id, positions, setPositions]);

  // Iniciar arraste
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position.x, position.y, bringToFront]);

  // Iniciar redimensionamento
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: position.width,
      height: position.height,
    });
  }, [position.width, position.height, bringToFront]);

  // Mover durante arraste/redimensionamento
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragOffset.x);
        const newY = Math.max(0, e.clientY - dragOffset.y);
        
        setPositions(prev => ({
          ...prev,
          [id]: { ...prev[id], x: newX, y: newY },
        }));
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(minWidth, resizeStart.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStart.height + deltaY);
        
        setPositions(prev => ({
          ...prev,
          [id]: { ...prev[id], width: newWidth, height: newHeight },
        }));
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        if (onPositionChange) {
          onPositionChange(positions[id]);
        }
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, id, minWidth, minHeight, positions, setPositions, onPositionChange]);

  // Toggle minimizar
  const toggleMinimize = useCallback(() => {
    setPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], minimized: !prev[id].minimized },
    }));
  }, [id, setPositions]);

  // Fechar/ocultar painel
  const hidePanel = useCallback(() => {
    setPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], visible: false },
    }));
  }, [id, setPositions]);

  if (!position.visible) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed bg-[#0b1636]/90 backdrop-blur-2xl rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] border border-red-500/30 overflow-hidden ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.minimized ? 'auto' : position.height,
        zIndex: position.zIndex + 100,
        transition: isDragging || isResizing ? 'none' : 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={bringToFront}
    >
      {/* Header arrastÃ¡vel */}
      <div
        className={`flex items-center justify-between px-3 py-2 bg-gradient-to-r ${headerColor} border-b border-red-500/25 cursor-move select-none`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="w-4 h-4 text-red-400/70 flex-shrink-0" />
          {icon}
          <span className="text-pink-300 font-extrabold text-xs font-mono uppercase tracking-wider truncate">{title}</span>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
            className="p-1 hover:bg-red-500/20 text-slate-300 hover:text-pink-300 rounded-lg transition-colors"
            title={position.minimized ? 'Expandir' : 'Minimizar'}
          >
            {position.minimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); hidePanel(); }}
            className="p-1 hover:bg-red-500/30 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
            title="Ocultar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ConteÃºdo */}
      {!position.minimized && (
        <div className="p-3 overflow-auto custom-scrollbar" style={{ height: 'calc(100% - 40px)' }}>
          {children}
        </div>
      )}

      {/* Handle de redimensionamento */}
      {!position.minimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-red-500/30 transition-colors rounded-tl-lg"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(0,240,255,0.4) 50%)',
          }}
        />
      )}
    </div>
  );
}


// Hook para gerenciar posiÃ§Ãµes dos painÃ©is
export function usePanelPositions(storageKey: string = 'RESTRITO-remote-panel-positions') {
  const [positions, setPositions] = useState<Record<string, PanelPosition>>({});

  // Carregar do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPositions(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao carregar posiÃ§Ãµes:', e);
    }
  }, [storageKey]);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (Object.keys(positions).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(positions));
    }
  }, [positions, storageKey]);

  // Resetar todas as posiÃ§Ãµes
  const resetPositions = useCallback(() => {
    localStorage.removeItem(storageKey);
    setPositions({});
  }, [storageKey]);

  // Mostrar painel oculto
  const showPanel = useCallback((id: string) => {
    setPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], visible: true },
    }));
  }, []);

  // Verificar quais painÃ©is estÃ£o ocultos
  const hiddenPanels = Object.entries(positions)
    .filter(([_, p]) => !p.visible)
    .map(([id]) => id);

  return {
    positions,
    setPositions,
    resetPositions,
    showPanel,
    hiddenPanels,
  };
}

// Componente de menu para painÃ©is ocultos
export function HiddenPanelsMenu({
  hiddenPanels,
  showPanel,
  panelNames,
}: {
  hiddenPanels: string[];
  showPanel: (id: string) => void;
  panelNames: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (hiddenPanels.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <span>ðŸ“¦ PainÃ©is Ocultos ({hiddenPanels.length})</span>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-[#111c44] rounded-lg shadow-xl border border-red-500/25 p-2 min-w-[200px]">
          {hiddenPanels.map(id => (
            <button
              key={id}
              onClick={() => { showPanel(id); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-white hover:bg-slate-700 rounded transition-colors text-sm"
            >
              âž• {panelNames[id] || id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DraggablePanel;


