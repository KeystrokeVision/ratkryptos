import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Monitor,
  Smartphone,
  ScrollText,
  Palette,
  Package,
  LogOut,
  Zap,
  User,
} from 'lucide-react';
import { SidebarRobotKick } from '../RobotAssistant';
import { useTranslation } from '../../utils/i18n';

interface DashboardSidebarProps {
  onLogout: () => void;
  isMobile?: boolean;
}

export default function DashboardSidebar({ onLogout, isMobile }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const username = (typeof window !== 'undefined' && localStorage.getItem('username')) || 'OPERADOR';

  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: t('sidebar.overview'), path: '/overview', disabled: false },
    { id: 'devices', icon: Smartphone, label: t('sidebar.devices'), path: '/dashboard', disabled: false },
    { id: 'windows', icon: Monitor, label: t('sidebar.windows'), path: '/win-builder', disabled: false },
    { id: 'logs', icon: ScrollText, label: t('sidebar.logs'), path: null, disabled: true, hint: t('sidebar.soon') },
  ];

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e0603]/95 backdrop-blur-xl border-t border-cyan-500/30 safe-bottom z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-5 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path === location.pathname;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                title={item.hint}
                onClick={() => item.path && !item.disabled && navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all ${
                  item.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : active
                      ? 'text-cyan-300 font-black scale-105'
                      : 'text-cyan-400/80 hover:text-cyan-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(255,43,43,0.8)]' : 'text-cyan-400/70'}`} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-red-400 font-bold hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <aside className="w-56 flex-shrink-0 h-full max-h-screen sticky top-0 bg-[#160403]/40 backdrop-blur-md border-r border-cyan-500/20 flex flex-col justify-between p-3.5 shadow-[5px_0_30px_rgba(0,0,0,0.6)] z-30 overflow-y-auto hide-scrollbar">
      <div className="flex flex-col gap-5 w-full">
        {/* Card do Perfil do Usuário / Operador */}
        <div 
          onClick={() => navigate('/dashboard')}
          title={`Perfil do Usuário: ${username}`}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent border border-cyan-400/50 cursor-pointer shadow-[0_0_20px_rgba(255,43,43,0.3)] hover:border-cyan-300 hover:shadow-[0_0_28px_rgba(255,43,43,0.6)] transition-all duration-300 group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/25 border border-cyan-400/70 flex items-center justify-center shadow-[0_0_12px_rgba(255,43,43,0.5)] flex-shrink-0 relative">
            <User className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 shadow-[0_0_6px_#ff2b2b]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black tracking-wider uppercase text-cyan-300 font-mono truncate">{username}</h2>
            <span className="text-[9px] text-cyan-400 font-mono font-bold tracking-wider uppercase flex items-center gap-1">
              ● {t('sidebar.connected')}
            </span>
          </div>
        </div>

        {/* Lista de Abas Limpas e Modernas */}
        <div className="flex flex-col gap-2 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path === location.pathname;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                title={item.disabled ? item.hint : item.label}
                onClick={() => item.path && !item.disabled && navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative border cursor-pointer ${
                  item.disabled
                    ? 'text-slate-600 border-slate-800/40 cursor-not-allowed bg-slate-950/40'
                    : active
                      ? 'bg-gradient-to-r from-cyan-500/35 via-blue-600/30 to-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_20px_rgba(255,43,43,0.45)]'
                      : 'bg-slate-900/60 text-slate-300 border-cyan-500/15 hover:text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(255,43,43,0.25)]'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(255,43,43,1)]" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${active ? 'text-cyan-200 drop-shadow-[0_0_8px_rgba(255,43,43,0.8)]' : 'text-cyan-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 🥋 ANIMAÇÃO DO ROBÔ KICK NA BARRA LATERAL (APENAS O ROBÔ E AS LOGOS) */}
        <SidebarRobotKick />
      </div>

      {/* Ferramentas Secundárias Limpas (APK Studio, APK Builder, APK Bypass, Sair) */}
      <div className="flex flex-col gap-2 w-full pt-3.5 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={() => navigate('/apk-studio')}
          title={t('sidebar.apk_studio')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/60 text-slate-300 border border-cyan-500/15 hover:text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(255,43,43,0.25)] transition-all duration-200 group cursor-pointer"
        >
          <Palette className="w-4 h-4 text-cyan-400 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
          <span className="truncate">{t('sidebar.apk_studio')}</span>
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/build-apk')}
          title={t('sidebar.apk_builder')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/60 text-slate-300 border border-cyan-500/15 hover:text-cyan-200 hover:bg-blue-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(255,43,43,0.25)] transition-all duration-200 group cursor-pointer"
        >
          <Package className="w-4 h-4 text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
          <span className="truncate">{t('sidebar.apk_builder')}</span>
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/apk-bypass')}
          title={t('sidebar.bypass')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_22px_rgba(245,158,11,0.6)] transition-all duration-300 uppercase tracking-wider cursor-pointer"
        >
          <Zap className="w-4 h-4 animate-pulse text-amber-300 flex-shrink-0" />
          <span className="truncate">{t('sidebar.bypass')}</span>
        </button>
        
        <button
          type="button"
          onClick={onLogout}
          title={t('sidebar.logout')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-1 rounded-xl text-xs font-bold bg-slate-900/60 text-red-400/90 border border-red-500/30 hover:text-red-300 hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-200 font-mono cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
