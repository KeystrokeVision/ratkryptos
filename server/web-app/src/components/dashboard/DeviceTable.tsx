import type { MouseEvent } from 'react';
import type { Cliente } from '@/types/dashboard';
import DeviceRow from './DeviceRow';
import { Smartphone, Zap } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

interface DeviceTableProps {
  clientes: Cliente[];
  loading: boolean;
  onRowClick: (cliente: Cliente) => void;
  onRowContextMenu: (event: MouseEvent, cliente: Cliente) => void;
  onDeleteDevice?: (cliente: Cliente) => void;
  onCreateApk?: () => void;
  onOpenVnc?: (cliente: Cliente) => void;
}

export default function DeviceTable({
  clientes,
  loading,
  onRowClick,
  onRowContextMenu,
  onDeleteDevice,
  onCreateApk,
  onOpenVnc,
}: DeviceTableProps) {
  const { t } = useTranslation();

  if (loading && clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#ef4444] bg-[#2b0803]/60 rounded-lg border border-[#2a2a31]/30 backdrop-blur-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a3a44] mb-4 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#ef4444] font-bold">{t('table.loading')}</p>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-[#350a03]/80 backdrop-blur-2xl rounded-lg border border-[#2a2a31]/30 p-12 text-center shadow-[0_10px_35px_rgba(239,68,68,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171] to-transparent"></div>
        <Smartphone className="w-16 h-16 mx-auto stroke-1 text-[#ef4444]/40 mb-4 animate-pulse" />
        <p className="text-[#e8e8ea] font-black text-lg mb-1 uppercase font-mono tracking-wider">{t('table.no_devices')}</p>
        <p className="text-[#ef4444]/60 text-xs mb-6 max-w-md mx-auto font-mono">
          {t('table.no_devices_sub')}
        </p>
        {onCreateApk && (
          <button
            type="button"
            onClick={onCreateApk}
            className="px-6 py-3 bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] rounded-md text-xs font-black uppercase font-mono tracking-wider shadow-lg shadow-[#ef4444]/25 border border-[#4a4a56]/40 transition-all cursor-pointer active:scale-95 inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-[#e8e8ea]" />
            <span>{t('table.gen_apk')}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#2a2a31]/35 bg-gradient-to-b from-[#1a1a1e]/95 via-[#1a0503]/95 to-[#0f0203]/95 backdrop-blur-2xl p-4 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden transition-all">
      {/* Top glowing laser beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ef4444] via-[#f87171] via-[#f87171] to-[#ef4444] shadow-[0_0_25px_rgba(239,68,68,1)]"></div>

      {/* Header Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 mb-3 bg-[#1e0503]/90 rounded-md border border-[#2a2a31]/25 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-[#ef4444]/20 border border-[#3a3a44]/50 text-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <Smartphone className="w-4 h-4 text-[#ef4444] animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black text-white font-mono uppercase tracking-widest block">Painel de Dispositivos</span>
            <span className="text-[10px] text-[#ef4444]/70 font-mono">Gerenciamento remoto de aparelhos em tempo real</span>
          </div>
        </div></div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[#ef4444]/80 font-mono text-[11px] uppercase font-black tracking-widest px-4">
              <th className="px-5 py-2.5 font-black">{t('table.status')}</th>
              <th className="px-5 py-2.5 font-black">{t('table.model')}</th>
              <th className="px-5 py-2.5 font-black">{t('table.activity')}</th>
              <th className="px-5 py-2.5 font-black">{t('table.ip')}</th>
              <th className="px-5 py-2.5 font-black">{t('table.system')}</th>
              <th className="px-5 py-2.5 font-black text-right">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <DeviceRow
                key={cliente.deviceId}
                cliente={cliente}
                onClick={() => onRowClick(cliente)}
                onContextMenu={(e: MouseEvent) => onRowContextMenu(e, cliente)}
                onDeleteDevice={onDeleteDevice}
                onOpenVnc={onOpenVnc}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
