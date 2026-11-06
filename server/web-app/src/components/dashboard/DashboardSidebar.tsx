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

  const toolItems = [
    { id: 'studio', icon: Palette, label: t('sidebar.apk_studio'), path: '/apk-studio' },
    { id: 'builder', icon: Package, label: t('sidebar.apk_builder'), path: '/build-apk' },
    { id: 'bypass', icon: Zap, label: t('sidebar.bypass'), path: '/apk-bypass' },
  ];

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f11]/95 backdrop-blur-xl border-t border-[#24242a] safe-bottom z-50">
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
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all ${
                  item.disabled ? 'text-[#5c5c64]' : active ? 'text-[#ef4444]' : 'text-[#8b8b94]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button type="button" onClick={onLogout} className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-[#8b8b94]">
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <aside className="w-60 flex-shrink-0 h-full max-h-screen sticky top-0 bg-[#0f0f11] border-r border-[#24242a] flex flex-col z-30 overflow-y-auto hide-scrollbar">

      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-[#24242a]">
        <div className="w-7 h-7 rounded-md bg-[#1a1a1e] border border-[#2a2a31] flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-[#8b8b94]" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-[#e8e8ea] truncate leading-tight">{username}</div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-[#8b8b94] leading-tight">En línea</div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3">
        <p className="px-2 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6f6f78]">Operación</p>
        <div className="space-y-0.5">
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
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[11px] transition-colors relative ${
                  item.disabled
                    ? 'text-[#5c5c64] cursor-not-allowed'
                    : active
                      ? 'bg-[#ef4444]/10 text-[#e8e8ea] font-semibold'
                      : 'text-[#8b8b94] hover:bg-[#1a1a1e] hover:text-[#e8e8ea]'
                }`}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#ef4444]" />}
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#ef4444]' : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        <p className="px-2 pt-4 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6f6f78]">Crear</p>
        <div className="space-y-0.5">
          {toolItems.map((item) => {
            const Icon = item.icon;
            const active = item.path === location.pathname;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[11px] transition-colors relative ${
                  active
                    ? 'bg-[#ef4444]/10 text-[#e8e8ea] font-semibold'
                    : 'text-[#8b8b94] hover:bg-[#1a1a1e] hover:text-[#e8e8ea]'
                }`}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#ef4444]" />}
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#ef4444]' : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-2 py-2 border-t border-[#24242a]">
        <button
          type="button"
          onClick={onLogout}
          title={t('sidebar.logout')}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[11px] text-[#8b8b94] hover:bg-[#1a1a1e] hover:text-[#e8e8ea] transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{t('sidebar.logout')}</span>
        </button>
      </div>

      <SidebarRobotKick />
    </aside>
  );
}