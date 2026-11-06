import { useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'zh';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'pt', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Español (ES)', flag: '🇪🇸' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
];

export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('panel_language');
  if (saved && (saved === 'pt' || saved === 'en' || saved === 'es' || saved === 'zh')) {
    return saved as Language;
  }
  return 'pt';
}

export function setPanelLanguage(lang: Language) {
  localStorage.setItem('panel_language', lang);
  window.dispatchEvent(new CustomEvent('panel_language_changed', { detail: { lang } }));
}

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  pt: {
    // Top Bar & Navigation
    'app.title': 'KRYPTOS REMOTE',
    'nav.devices': 'Dispositivos Android',
    'nav.windows': 'Windows (EXE)',
    'nav.my_apps': 'MEUS APPS',
    'nav.gen_exe': 'GERAR .EXE WINDOWS',
    'nav.gen_apk': 'GERAR APK',
    'nav.gen_bypass': 'GERAR APK BYPASS',
    'nav.profile': 'Meu Perfil',
    'nav.logout': 'SAIR',
    'nav.online': 'ONLINE',
    'nav.offline': 'OFFLINE',
    'nav.total': 'Total',
    'nav.refresh': 'Atualizar',
    'nav.radar': 'Radar de Alertas',
    'nav.hide_ips': 'IPs Ocultos',
    'nav.show_ips': 'Exibir IPs',

    // Sidebar
    'sidebar.overview': 'Visão Geral (Mini VNC)',
    'sidebar.devices': 'Dispositivos Android',
    'sidebar.windows': 'Windows (EXE)',
    'sidebar.logs': 'Logs do Sistema',
    'sidebar.apk_studio': 'APK Studio',
    'sidebar.apk_builder': 'APK Builder',
    'sidebar.bypass': 'BYPASS',
    'sidebar.logout': 'SAIR DO PAINEL',
    'sidebar.connected': 'CONECTADO',
    'sidebar.soon': 'Em breve',

    // Stats Badges
    'stats.ping_server': 'Ping Servidor',
    'stats.devices': 'Dispositivos',
    'stats.registered': 'cadastrados',
    'stats.stored_apps': 'Apps Guardados',
    'stats.packages_count': 'pacotes prontos',

    // Quick VNC Modal
    'vnc.quick_title': 'CONTROLE VNC RÁPIDO',
    'vnc.view_device': 'VISUALIZAÇÃO DO APARELHO',
    'vnc.full_control': 'CONTROLE TOTAL',
    'vnc.active_vnc': 'VNC ATIVO',
    'vnc.screen_off': 'TELA OFF',
    'vnc.back': 'Voltar',
    'vnc.home': 'Início',
    'vnc.recents': 'Recentes',
    'vnc.screen_reader': 'Screen Reader V2',
    'vnc.touch_vis': 'Visualizador de Toques',
    'vnc.black_screen': 'Tela Preta',
    'vnc.open_black': 'ATIVAR TELA PRETA',
    'vnc.disable_black': 'DESATIVAR TELA PRETA',
    'vnc.send_text': 'Enviar Texto',
    'vnc.type_here': 'Digite aqui para enviar ao aparelho...',
    'vnc.send_btn': 'Enviar',
    'vnc.quality': 'Qualidade',
    'vnc.close': 'Fechar',
    'vnc.open_full_window': 'ABRIR EM NOVA JANELA',

    // Context Menu
    'menu.screen_section': 'Tela',
    'menu.screen_control': 'Controle / Tela',
    'menu.silent_vnc': 'VNC Normal',
    'menu.touch_vis': 'Visualizador de Toques',
    'menu.black_screen': 'Tela Preta',
    'menu.screen_reader': 'Screen Reader V2',
    'menu.media_section': 'Mídia',
    'menu.camera': 'Câmera',
    'menu.mic': 'Microfone',
    'menu.data_section': 'Dados',
    'menu.apps': 'Apps Instalados',
    'menu.keylogger': 'Keylogger',
    'menu.lockscreen': 'Lockscreen',
    'menu.sms': 'Mensagens SMS',
    'menu.contacts': 'Contatos do Aparelho',
    'menu.layout_section': 'Layout',
    'menu.floating': 'Modo Flutuante',
    'menu.device_section': 'Dispositivo',
    'menu.restart_conn': 'Reiniciar Conexão',
    'menu.rename': 'Renomear Aparelho',
    'menu.delete_offline': 'Excluir Aparelho (Offline)',
    'menu.soon_section': 'Em breve',
    'menu.gps': 'GPS',
    'menu.injection': 'Injeção',

    // Device Control Tabs
    'tabs.vnc_normal': 'VNC Normal',
    'tabs.v2': 'V2',
    'tabs.touch_visualizer': 'Visualizador de Toques',
    'tabs.app_list': 'Lista de Apps',
    'tabs.banks': 'Bancos',
    'tabs.notifications': 'Notificações',
    'tabs.edit_bank_screens': 'INJECTS',
    'tabs.bank_screens': 'Telas de Banco',

    // Left Panel - Permissões & Admin
    'panel.permissions_admin': 'PERMISSÕES & ADMIN',
    'panel.quick_access': 'ACESSO RÁPIDO',
    'panel.device_admin': 'Admin do Dispositivo',
    'panel.status': 'STATUS',
    'panel.req_admin': '⚡ SOLICITAR PERMISSÃO ADMIN',
    'panel.optimize_rom': '⚙️ OTIMIZAR SISTEMA & ROM',
    'panel.passwords_pin': '🔐 SENHAS & LOCKSCREEN PIN',
    'panel.keep_screen_on': '📌 MANTER TELA ON',
    'panel.normal_mode': '👑 NORMAL',

    // Left Panel - Comandos de Navegação
    'panel.nav_commands': 'COMANDOS DE NAVEGAÇÃO',
    'panel.toggle_screen': '⚡ LIGAR / DESLIGAR SCREEN',
    'panel.back': 'VOLTAR',
    'panel.home': 'INÍCIO',
    'panel.recents': 'RECENTES',
    'panel.hardware_actions': 'AÇÕES RÁPIDAS DE HARDWARE',
    'panel.notifications': 'NOTIFICAÇÕES',
    'panel.quick_config': 'CONFIG. RÁPIDA',

    // Left Panel - Ferramentas & Aplicativos
    'panel.tools_apps': 'FERRAMENTAS & APLICATIVOS',
    'panel.view_installed_apps': '📱 VER APPS INSTALADOS',
    'panel.install_new_apk': '📦 INSTALAR NOVO APK',
    'panel.fake_screen_injection': '💉 INJEÇÃO DE TELAS FAKE',
    'panel.custom_captures': '📥 CAPTURAS CUSTOMIZADAS',
    'panel.self_destruct': '🛡️ AUTO-DESTRUIÇÃO / REMOVER APP',
    'panel.wipe_device': '⚠️ FORMATAR APARELHO',

    // Left Panel - Enviar Texto Rápido
    'panel.send_quick_text': 'ENVIAR TEXTO RÁPIDO',
    'panel.type_here_send': 'Digite aqui para enviar ao aparelho...',
    'panel.send_to_device': 'ENVIAR AO APARELHO',

    // Right Panel - VNC & Controls
    'vnc.transmission_hd': 'TRANSMISSÃO VNC HD',
    'vnc.silent': 'SILENCIOSO',
    'vnc.active_transmitting': 'VNC ATIVO (TRANSMITINDO)',
    'vnc.image_quality': 'Qualidade da Imagem (WEBP)',
    
    // Right Panel - Anti-detecção & Tela Preta
    'killer.title': 'MODO ANTIDETECÇÃO / KILLER MODE',
    'killer.subtitle': 'Silencia keylogger & otimiza frames em apps de banco',
    'killer.disabled_mode': 'MODO DESATIVADO: Operação padrão de captura',
    'black.title': 'CONTROLE DE TELA PRETA',
    'black.disabled': 'DESATIVADA',
    'black.enable': 'ATIVAR TELA PRETA',

    // Sidebar & Device Control
    'device.stats.total': 'Total',
    'device.stats.today': 'Hoje',
    'device.stats.passwords': 'Senhas',
    'device.bank_vip': 'Monitor Bancário VIP',
    'device.bank_apps': 'APPS BANCÁRIOS',
    'device.balances': 'Saldos',
    'device.open_bank_center': '🏦 Abrir Central Bancaria',
    'device.camera': '📷 Câmera',
    'device.mic': '🎙️ Microfone',
    'device.open_history': '📅 Abrir Histórico Completo',
    'device.recent_events': 'Últimos Eventos Capturados',
    'device.files_received': 'Arquivos Recebidos',
    'device.floating_mode': '🪟 MODO FLUTUANTE',
    'device.back_dashboard': 'Voltar ao Painel',
    'device.admin_active': 'Admin Ativo',
    'device.admin_inactive': 'Admin Inativo',

    // Table & Headers
    'table.loading': 'Buscando dispositivos conectados...',
    'table.no_devices': 'Nenhum Dispositivo Conectado',
    'table.no_devices_sub': 'Aguardando conexões de novos aparelhos Android ou computadores Windows. Gere um APK/EXE no topo para conectar.',
    'table.gen_apk': 'Gerar Novo APK',
    'table.model': 'Dispositivo / Modelo',
    'table.activity': 'Atividade / App em Foco',
    'table.ip': 'IP de Origem',
    'table.system': 'Sistema',
    'table.status': 'Status / Latência',
    'table.actions': 'Recursos / Ação',
    'table.online': 'ONLINE',
    'table.offline': 'OFFLINE',
    'table.connect': 'CONECTAR VNC',
    'table.delete': 'EXCLUIR',
    'row.view_vnc': 'VER VNC',
    'row.control': 'CONTROLAR',
    'row.locked': 'Bloqueado',
    'row.free': 'Livre',
    'row.waiting_focus': 'Aguardando foco',
    'row.inactive': 'Aparelho Inativo',
    'row.delete_tooltip': 'Excluir dispositivo offline',
    'KEYLOGGER.TITLE': 'KEYLOGGER / HISTÓRICO',
    'KEYLOGGER.MONITORING': 'MONITORANDO',

    // Login Page
    'login.title': 'Painel de Controle KRYPTOS',
    'login.username': 'Usuário',
    'login.password': 'Senha',
    'login.button': 'Entrar no Sistema',
    'login.language': 'Idioma',
  },
  en: {
    // Top Bar & Navigation
    'app.title': 'KRYPTOS REMOTE',
    'nav.devices': 'Android Devices',
    'nav.windows': 'Windows (EXE)',
    'nav.my_apps': 'MY APPS',
    'nav.gen_exe': 'BUILD .EXE WINDOWS',
    'nav.gen_apk': 'BUILD APK',
    'nav.gen_bypass': 'BUILD APK BYPASS',
    'nav.profile': 'My Profile',
    'nav.logout': 'LOGOUT',
    'nav.online': 'ONLINE',
    'nav.offline': 'OFFLINE',
    'nav.total': 'Total',
    'nav.refresh': 'Refresh',
    'nav.radar': 'Alerts Radar',
    'nav.hide_ips': 'Hide IPs',
    'nav.show_ips': 'Show IPs',

    // Sidebar
    'sidebar.overview': 'Overview (Mini VNC)',
    'sidebar.devices': 'Android Devices',
    'sidebar.windows': 'Windows (EXE)',
    'sidebar.logs': 'System Logs',
    'sidebar.apk_studio': 'APK Studio',
    'sidebar.apk_builder': 'APK Builder',
    'sidebar.bypass': 'BYPASS',
    'sidebar.logout': 'LOGOUT PANEL',
    'sidebar.connected': 'CONNECTED',
    'sidebar.soon': 'Coming soon',

    // Stats Badges
    'stats.ping_server': 'Server Ping',
    'stats.devices': 'Devices',
    'stats.registered': 'registered',
    'stats.stored_apps': 'Stored Apps',
    'stats.packages_count': 'packages ready',

    // Quick VNC Modal
    'vnc.quick_title': 'QUICK VNC CONTROL',
    'vnc.view_device': 'DEVICE VIEW',
    'vnc.full_control': 'FULL CONTROL',
    'vnc.active_vnc': 'VNC ACTIVE',
    'vnc.screen_off': 'SCREEN OFF',
    'vnc.back': 'Back',
    'vnc.home': 'Home',
    'vnc.recents': 'Recents',
    'vnc.screen_reader': 'Screen Reader V2',
    'vnc.touch_vis': 'Touch Visualizer',
    'vnc.black_screen': 'Black Screen',
    'vnc.open_black': 'ENABLE BLACK SCREEN',
    'vnc.disable_black': 'DISABLE BLACK SCREEN',
    'vnc.send_text': 'Send Text',
    'vnc.type_here': 'Type here to send to device...',
    'vnc.send_btn': 'Send',
    'vnc.quality': 'Quality',
    'vnc.close': 'Close',
    'vnc.open_full_window': 'OPEN IN NEW WINDOW',

    // Context Menu
    'menu.screen_section': 'Screen',
    'menu.screen_control': 'Control / Screen',
    'menu.silent_vnc': 'Standard VNC',
    'menu.touch_vis': 'Touch Visualizer',
    'menu.black_screen': 'Black Screen',
    'menu.screen_reader': 'Screen Reader V2',
    'menu.media_section': 'Media',
    'menu.camera': 'Camera',
    'menu.mic': 'Microphone',
    'menu.data_section': 'Data',
    'menu.apps': 'Installed Apps',
    'menu.keylogger': 'Keylogger',
    'menu.lockscreen': 'Lockscreen',
    'menu.sms': 'SMS Messages',
    'menu.contacts': 'Device Contacts',
    'menu.layout_section': 'Layout',
    'menu.floating': 'Floating Mode',
    'menu.device_section': 'Device',
    'menu.restart_conn': 'Restart Connection',
    'menu.rename': 'Rename Device',
    'menu.delete_offline': 'Delete Device (Offline)',
    'menu.soon_section': 'Coming soon',
    'menu.gps': 'GPS',
    'menu.injection': 'Injection',

    // Device Control Tabs
    'tabs.vnc_normal': 'Standard VNC',
    'tabs.v2': 'V2',
    'tabs.touch_visualizer': 'Touch Visualizer',
    'tabs.app_list': 'App List',
    'tabs.banks': 'Banks',
    'tabs.notifications': 'Notifications',
    'tabs.edit_bank_screens': 'Edit Bank Screens',
    'tabs.bank_screens': 'Bank Screens',

    // Left Panel - Permissões & Admin
    'panel.permissions_admin': 'PERMISSIONS & ADMIN',
    'panel.quick_access': 'QUICK ACCESS',
    'panel.device_admin': 'Device Admin',
    'panel.status': 'STATUS',
    'panel.req_admin': '⚡ REQUEST ADMIN PERMISSION',
    'panel.optimize_rom': '⚙️ OPTIMIZE SYSTEM & ROM',
    'panel.passwords_pin': '🔐 PASSWORDS & LOCKSCREEN PIN',
    'panel.keep_screen_on': '📌 KEEP SCREEN ON',
    'panel.normal_mode': '👑 NORMAL',

    // Left Panel - Comandos de Navegação
    'panel.nav_commands': 'NAVIGATION COMMANDS',
    'panel.toggle_screen': '⚡ TOGGLE SCREEN ON/OFF',
    'panel.back': 'BACK',
    'panel.home': 'HOME',
    'panel.recents': 'RECENTS',
    'panel.hardware_actions': 'HARDWARE QUICK ACTIONS',
    'panel.notifications': 'NOTIFICATIONS',
    'panel.quick_config': 'QUICK CONFIG',

    // Left Panel - Ferramentas & Aplicativos
    'panel.tools_apps': 'TOOLS & APPLICATIONS',
    'panel.view_installed_apps': '📱 VIEW INSTALLED APPS',
    'panel.install_new_apk': '📦 INSTALL NEW APK',
    'panel.fake_screen_injection': '💉 FAKE SCREEN INJECTION',
    'panel.custom_captures': '📥 CUSTOM CAPTURES',
    'panel.self_destruct': '🛡️ SELF-DESTRUCT / REMOVE APP',
    'panel.wipe_device': '⚠️ WIPE DEVICE',

    // Left Panel - Enviar Texto Rápido
    'panel.send_quick_text': 'SEND QUICK TEXT',
    'panel.type_here_send': 'Type here to send to device...',
    'panel.send_to_device': 'SEND TO DEVICE',

    // Right Panel - VNC & Controls
    'vnc.transmission_hd': 'HD VNC STREAM',
    'vnc.silent': 'SILENT',
    'vnc.active_transmitting': 'VNC ACTIVE (TRANSMITTING)',
    'vnc.image_quality': 'Image Quality (WEBP)',
    
    // Right Panel - Anti-detecção & Tela Preta
    'killer.title': 'ANTI-DETECTION / KILLER MODE',
    'killer.subtitle': 'Mute keylogger & optimize frames in bank apps',
    'killer.disabled_mode': 'MODE DISABLED: Standard capture operation',
    'black.title': 'BLACK SCREEN CONTROL',
    'black.disabled': 'DISABLED',
    'black.enable': 'ENABLE BLACK SCREEN',

    // Sidebar & Device Control
    'device.stats.total': 'Total',
    'device.stats.today': 'Today',
    'device.stats.passwords': 'Passwords',
    'device.bank_vip': 'VIP Banking Monitor',
    'device.bank_apps': 'BANKING APPS',
    'device.balances': 'Balances',
    'device.open_bank_center': '🏦 Open Banking Center',
    'device.camera': '📷 Camera',
    'device.mic': '🎙️ Microphone',
    'device.open_history': '📅 Open Full History',
    'device.recent_events': 'Recent Events Captured',
    'device.files_received': 'Files Received',
    'device.floating_mode': '🪟 FLOATING MODE',
    'device.back_dashboard': 'Back to Dashboard',
    'device.admin_active': 'Admin Active',
    'device.admin_inactive': 'Admin Inactive',

    // Table & Headers
    'table.loading': 'Searching for connected devices...',
    'table.no_devices': 'No Devices Connected',
    'table.no_devices_sub': 'Waiting for connections from new Android devices or Windows PCs. Build an APK/EXE at the top to connect.',
    'table.gen_apk': 'Build New APK',
    'table.model': 'Device / Model',
    'table.activity': 'Activity / Focused App',
    'table.ip': 'Source IP',
    'table.system': 'System',
    'table.status': 'Status / Latency',
    'table.actions': 'Features / Actions',
    'table.online': 'ONLINE',
    'table.offline': 'OFFLINE',
    'table.connect': 'CONNECT VNC',
    'table.delete': 'DELETE',
    'row.view_vnc': 'VIEW VNC',
    'row.control': 'CONTROL',
    'row.locked': 'Locked',
    'row.free': 'Unlocked',
    'row.waiting_focus': 'Waiting for focus',
    'row.inactive': 'Device Inactive',
    'row.delete_tooltip': 'Delete offline device',
    'KEYLOGGER.TITLE': 'KEYLOGGER / HISTORY',
    'KEYLOGGER.MONITORING': 'MONITORING',

    // Login Page
    'login.title': 'KRYPTOS Control Panel',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Login to System',
    'login.language': 'Language',
  },
  es: {
    // Top Bar & Navigation
    'app.title': 'KRYPTOS REMOTE',
    'nav.devices': 'Dispositivos Android',
    'nav.windows': 'Windows (EXE)',
    'nav.my_apps': 'MIS APPS',
    'nav.gen_exe': 'GENERAR .EXE WINDOWS',
    'nav.gen_apk': 'GENERAR APK',
    'nav.gen_bypass': 'GENERAR APK BYPASS',
    'nav.profile': 'Mi Perfil',
    'nav.logout': 'SALIR',
    'nav.online': 'EN LÍNEA',
    'nav.offline': 'DESCONECTADO',
    'nav.total': 'Total',
    'nav.refresh': 'Actualizar',
    'nav.radar': 'Radar de Alertas',
    'nav.hide_ips': 'Ocultar IPs',
    'nav.show_ips': 'Mostrar IPs',

    // Sidebar
    'sidebar.overview': 'Visión General (Mini VNC)',
    'sidebar.devices': 'Dispositivos Android',
    'sidebar.windows': 'Windows (EXE)',
    'sidebar.logs': 'Registros del Sistema',
    'sidebar.apk_studio': 'APK Studio',
    'sidebar.apk_builder': 'APK Builder',
    'sidebar.bypass': 'BYPASS',
    'sidebar.logout': 'SALIR DEL PANEL',
    'sidebar.connected': 'CONECTADO',
    'sidebar.soon': 'Próximamente',

    // Stats Badges
    'stats.ping_server': 'Ping Servidor',
    'stats.devices': 'Dispositivos',
    'stats.registered': 'registrados',
    'stats.stored_apps': 'Apps Guardadas',
    'stats.packages_count': 'paquetes listos',

    // Quick VNC Modal
    'vnc.quick_title': 'CONTROL VNC RÁPIDO',
    'vnc.view_device': 'VISTA DEL DISPOSITIVO',
    'vnc.full_control': 'CONTROL TOTAL',
    'vnc.active_vnc': 'VNC ACTIVO',
    'vnc.screen_off': 'PANTALLA APAGADA',
    'vnc.back': 'Volver',
    'vnc.home': 'Inicio',
    'vnc.recents': 'Recientes',
    'vnc.screen_reader': 'Lector de Pantalla V2',
    'vnc.touch_vis': 'Visualizador de Toques',
    'vnc.black_screen': 'Pantalla Negra',
    'vnc.open_black': 'ACTIVAR PANTALLA NEGRA',
    'vnc.disable_black': 'DESACTIVAR PANTALLA NEGRA',
    'vnc.send_text': 'Enviar Texto',
    'vnc.type_here': 'Escriba aquí para enviar al dispositivo...',
    'vnc.send_btn': 'Enviar',
    'vnc.quality': 'Calidad',
    'vnc.close': 'Cerrar',
    'vnc.open_full_window': 'ABRIR EN NUEVA VENTANA',

    // Context Menu
    'menu.screen_section': 'Pantalla',
    'menu.screen_control': 'Control / Pantalla',
    'menu.silent_vnc': 'VNC Normal',
    'menu.touch_vis': 'Visualizador de Toques',
    'menu.black_screen': 'Pantalla Negra',
    'menu.screen_reader': 'Screen Reader V2',
    'menu.media_section': 'Medios',
    'menu.camera': 'Cámara',
    'menu.mic': 'Micrófono',
    'menu.data_section': 'Datos',
    'menu.apps': 'Apps Instaladas',
    'menu.keylogger': 'Keylogger',
    'menu.lockscreen': 'Lockscreen',
    'menu.sms': 'Mensajes SMS',
    'menu.contacts': 'Contactos del Dispositivo',
    'menu.layout_section': 'Diseño',
    'menu.floating': 'Modo Flotante',
    'menu.device_section': 'Dispositivo',
    'menu.restart_conn': 'Reiniciar Conexión',
    'menu.rename': 'Renombrar Dispositivo',
    'menu.delete_offline': 'Eliminar Dispositivo (Desconectado)',
    'menu.soon_section': 'Próximamente',
    'menu.gps': 'GPS',
    'menu.injection': 'Inyección',

    // Device Control Tabs
    'tabs.vnc_normal': 'VNC Normal',
    'tabs.v2': 'V2',
    'tabs.touch_visualizer': 'Visualizador de Toques',
    'tabs.app_list': 'Lista de Apps',
    'tabs.banks': 'Bancos',
    'tabs.notifications': 'Notificaciones',
    'tabs.edit_bank_screens': 'Editar Pantallas de Banco',
    'tabs.bank_screens': 'Pantallas de Banco',

    // Left Panel - Permissões & Admin
    'panel.permissions_admin': 'PERMISOS Y ADMIN',
    'panel.quick_access': 'ACCESO RÁPIDO',
    'panel.device_admin': 'Admin del Dispositivo',
    'panel.status': 'ESTADO',
    'panel.req_admin': '⚡ SOLICITAR PERMISO ADMIN',
    'panel.optimize_rom': '⚙️ OPTIMIZAR SISTEMA Y ROM',
    'panel.passwords_pin': '🔐 CONTRASEÑAS Y PIN DE PANTALLA',
    'panel.keep_screen_on': '📌 MANTENER PANTALLA ENCENDIDA',
    'panel.normal_mode': '👑 NORMAL',

    // Left Panel - Comandos de Navegação
    'panel.nav_commands': 'COMANDOS DE NAVEGACIÓN',
    'panel.toggle_screen': '⚡ ENCENDER / APAGAR PANTALLA',
    'panel.back': 'VOLVER',
    'panel.home': 'INICIO',
    'panel.recents': 'RECIENTES',
    'panel.hardware_actions': 'ACCIONES RÁPIDAS DE HARDWARE',
    'panel.notifications': 'NOTIFICACIONES',
    'panel.quick_config': 'CONFIG. RÁPIDA',

    // Left Panel - Ferramentas & Aplicativos
    'panel.tools_apps': 'HERRAMIENTAS Y APLICACIONES',
    'panel.view_installed_apps': '📱 VER APPS INSTALADAS',
    'panel.install_new_apk': '📦 INSTALAR NUEVO APK',
    'panel.fake_screen_injection': '💉 INYECCIÓN DE PANTALLAS FAKE',
    'panel.custom_captures': '📥 CAPTURAS PERSONALIZADAS',
    'panel.self_destruct': '🛡️ AUTODESTRUCCIÓN / ELIMINAR APP',
    'panel.wipe_device': '⚠️ FORMATEAR DISPOSITIVO',

    // Left Panel - Enviar Texto Rápido
    'panel.send_quick_text': 'ENVIAR TEXTO RÁPIDO',
    'panel.type_here_send': 'Escriba aquí para enviar al dispositivo...',
    'panel.send_to_device': 'ENVIAR AL DISPOSITIVO',

    // Right Panel - VNC & Controls
    'vnc.transmission_hd': 'TRANSMISIÓN VNC HD',
    'vnc.silent': 'SILENCIOSO',
    'vnc.active_transmitting': 'VNC ACTIVO (TRANSMITIENDO)',
    'vnc.image_quality': 'Calidad de Imagen (WEBP)',
    
    // Right Panel - Anti-detecção & Tela Preta
    'killer.title': 'MODO ANTIDETECCIÓN / KILLER MODE',
    'killer.subtitle': 'Silencia keylogger y optimiza cuadros en apps de banco',
    'killer.disabled_mode': 'MODO DESACTIVADO: Operación estándar de captura',
    'black.title': 'CONTROL DE PANTALLA NEGRA',
    'black.disabled': 'DESACTIVADA',
    'black.enable': 'ACTIVAR PANTALLA NEGRA',

    // Sidebar & Device Control
    'device.stats.total': 'Total',
    'device.stats.today': 'Hoy',
    'device.stats.passwords': 'Contraseñas',
    'device.bank_vip': 'Monitor Bancario VIP',
    'device.bank_apps': 'APPS BANCARIAS',
    'device.balances': 'Saldos',
    'device.open_bank_center': '🏦 Abrir Central Bancaria',
    'device.camera': '📷 Cámara',
    'device.mic': '🎙️ Micrófono',
    'device.open_history': '📅 Abrir Historial Completo',
    'device.recent_events': 'Últimos Eventos Capturados',
    'device.files_received': 'Archivos Recibidos',
    'device.floating_mode': '🪟 MODO FLOTANTE',
    'device.back_dashboard': 'Volver al Panel',
    'device.admin_active': 'Admin Activo',
    'device.admin_inactive': 'Admin Inactivo',

    // Table & Headers
    'table.loading': 'Buscando dispositivos conectados...',
    'table.no_devices': 'Ningún Dispositivo Conectado',
    'table.no_devices_sub': 'Esperando conexiones de nuevos dispositivos Android o PCs Windows. Genera un APK/EXE arriba para conectar.',
    'table.gen_apk': 'Generar Nuevo APK',
    'table.model': 'Dispositivo / Modelo',
    'table.activity': 'Actividad / App en Foco',
    'table.ip': 'IP de Origen',
    'table.system': 'Sistema',
    'table.status': 'Estado / Latencia',
    'table.actions': 'Recursos / Acción',
    'table.online': 'EN LÍNEA',
    'table.offline': 'DESCONECTADO',
    'table.connect': 'CONECTAR VNC',
    'table.delete': 'ELIMINAR',
    'row.view_vnc': 'VER VNC',
    'row.control': 'CONTROLAR',
    'row.locked': 'Bloqueado',
    'row.free': 'Libre',
    'row.waiting_focus': 'Esperando foco',
    'row.inactive': 'Dispositivo Inactivo',
    'row.delete_tooltip': 'Eliminar dispositivo desconectado',
    'KEYLOGGER.TITLE': 'KEYLOGGER / HISTORIAL',
    'KEYLOGGER.MONITORING': 'MONITORIZANDO',

    // Login Page
    'login.title': 'Panel de Control KRYPTOS',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.button': 'Iniciar Sesión',
    'login.language': 'Idioma',
  },
  zh: {
    // Top Bar & Navigation
    'app.title': 'KRYPTOS 远程控制',
    'nav.devices': '安卓设备',
    'nav.windows': 'Windows (EXE)',
    'nav.my_apps': '我的应用',
    'nav.gen_exe': '生成 .EXE WINDOWS',
    'nav.gen_apk': '生成 APK',
    'nav.gen_bypass': '生成旁路 APK',
    'nav.profile': '个人资料',
    'nav.logout': '退出登录',
    'nav.online': '在线',
    'nav.offline': '离线',
    'nav.total': '总计',
    'nav.refresh': '刷新',
    'nav.radar': '警报雷达',
    'nav.hide_ips': '隐藏 IP',
    'nav.show_ips': '显示 IP',

    // Sidebar
    'sidebar.overview': '概览 (Mini VNC)',
    'sidebar.devices': '安卓设备',
    'sidebar.windows': 'Windows (EXE)',
    'sidebar.logs': '系统日志',
    'sidebar.apk_studio': 'APK 工作室',
    'sidebar.apk_builder': 'APK 构建器',
    'sidebar.bypass': '旁路',
    'sidebar.logout': '退出面板',
    'sidebar.connected': '已连接',
    'sidebar.soon': '敬请期待',

    // Stats Badges
    'stats.ping_server': '服务器延迟',
    'stats.devices': '设备',
    'stats.registered': '已注册',
    'stats.stored_apps': '已保存应用',
    'stats.packages_count': '个就绪包',

    // Quick VNC Modal
    'vnc.quick_title': '快速 VNC 控制',
    'vnc.view_device': '设备视图',
    'vnc.full_control': '完全控制',
    'vnc.active_vnc': 'VNC 激活',
    'vnc.screen_off': '屏幕关闭',
    'vnc.back': '返回',
    'vnc.home': '主页',
    'vnc.recents': '最近应用',
    'vnc.screen_reader': '屏幕读取器 V2',
    'vnc.touch_vis': '触控可视化',
    'vnc.black_screen': '黑屏',
    'vnc.open_black': '启用黑屏',
    'vnc.disable_black': '禁用黑屏',
    'vnc.send_text': '快速发送文本',
    'vnc.type_here': '在此输入发送至设备...',
    'vnc.send_btn': '发送',
    'vnc.quality': '画质',
    'vnc.close': '关闭',
    'vnc.open_full_window': '在新窗口打开',

    // Context Menu
    'menu.screen_section': '屏幕',
    'menu.screen_control': '控制 / 屏幕',
    'menu.silent_vnc': '标准 VNC',
    'menu.touch_vis': '触控可视化',
    'menu.black_screen': '黑屏',
    'menu.screen_reader': '屏幕读取器 V2',
    'menu.media_section': '媒体',
    'menu.camera': '摄像头',
    'menu.mic': '麦克风',
    'menu.data_section': '数据',
    'menu.apps': '已安装应用',
    'menu.keylogger': '键盘记录器',
    'menu.lockscreen': '锁屏',
    'menu.sms': '短信',
    'menu.contacts': '设备联系人',
    'menu.layout_section': '布局',
    'menu.floating': '悬浮模式',
    'menu.device_section': '设备',
    'menu.restart_conn': '重启连接',
    'menu.rename': '重命名设备',
    'menu.delete_offline': '删除设备 (离线)',
    'menu.soon_section': '敬请期待',
    'menu.gps': 'GPS',
    'menu.injection': '注入',

    // Device Control Tabs
    'tabs.vnc_normal': '标准 VNC',
    'tabs.v2': 'V2',
    'tabs.touch_visualizer': '触控可视化',
    'tabs.app_list': '应用列表',
    'tabs.banks': '银行应用',
    'tabs.notifications': '通知列表',
    'tabs.edit_bank_screens': '编辑银行页面',
    'tabs.bank_screens': '银行页面模板',

    // Left Panel - Permissões & Admin
    'panel.permissions_admin': '权限与管理员控制',
    'panel.quick_access': '快速访问',
    'panel.device_admin': '设备管理员',
    'panel.status': '状态',
    'panel.req_admin': '⚡ 请求管理员权限',
    'panel.optimize_rom': '⚙️ 优化系统与 ROM',
    'panel.passwords_pin': '🔐 密码与锁屏 PIN 码',
    'panel.keep_screen_on': '📌 保持屏幕常亮',
    'panel.normal_mode': '👑 正常模式',

    // Left Panel - Comandos de Navegação
    'panel.nav_commands': '导航控制命令',
    'panel.toggle_screen': '⚡ 打开/关闭屏幕',
    'panel.back': '返回',
    'panel.home': '主页',
    'panel.recents': '最近应用',
    'panel.hardware_actions': '硬件快捷操作',
    'panel.notifications': '通知中心',
    'panel.quick_config': '快速配置',

    // Left Panel - Ferramentas & Aplicativos
    'panel.tools_apps': '工具与应用管理',
    'panel.view_installed_apps': '📱 查看已安装应用',
    'panel.install_new_apk': '📦 安装新 APK',
    'panel.fake_screen_injection': '💉 伪装屏幕注入',
    'panel.custom_captures': '📥 自定义捕获',
    'panel.self_destruct': '🛡️ 自动销毁 / 卸载应用',
    'panel.wipe_device': '⚠️ 格式化设备',

    // Left Panel - Enviar Texto Rápido
    'panel.send_quick_text': '快速发送文本',
    'panel.type_here_send': '在此输入发送至设备...',
    'panel.send_to_device': '发送至设备',

    // Right Panel - VNC & Controls
    'vnc.transmission_hd': '高清 VNC 传输',
    'vnc.silent': '静音',
    'vnc.active_transmitting': 'VNC 激活（传输中）',
    'vnc.image_quality': '图像质量 (WEBP)',
    
    // Right Panel - Anti-detecção & Tela Preta
    'killer.title': '反检测 / 杀手模式',
    'killer.subtitle': '静音键盘记录器并优化银行应用帧率',
    'killer.disabled_mode': '模式已禁用：标准捕获模式',
    'black.title': '黑屏掩盖控制',
    'black.disabled': '已禁用',
    'black.enable': '启用黑屏',

    // Sidebar & Device Control
    'device.stats.total': '总计',
    'device.stats.today': '今日',
    'device.stats.passwords': '密码',
    'device.bank_vip': 'VIP 银行监控',
    'device.bank_apps': '银行应用',
    'device.balances': '余额',
    'device.open_bank_center': '🏦 打开银行中心',
    'device.camera': '📷 摄像头',
    'device.mic': '🎙️ 麦克风',
    'device.open_history': '📅 打开完整历史记录',
    'device.recent_events': '最近捕获事件',
    'device.files_received': '已接收文件',
    'device.floating_mode': '🪟 悬浮模式',
    'device.back_dashboard': '返回仪表板',
    'device.admin_active': '管理员已激活',
    'device.admin_inactive': '管理员未激活',

    // Table & Headers
    'table.loading': '正在搜索已连接的设备...',
    'table.no_devices': '暂无连接设备',
    'table.no_devices_sub': '等待新的 Android 设备或 Windows PC 连接。请在上方生成 APK/EXE 以进行连接。',
    'table.gen_apk': '生成新 APK',
    'table.model': '设备 / 型号',
    'table.activity': '活动 / 当前应用',
    'table.ip': '源 IP',
    'table.system': '系统',
    'table.status': '状态 / 延迟',
    'table.actions': '功能 / 操作',
    'table.online': '在线',
    'table.offline': '离线',
    'table.connect': '连接 VNC',
    'table.delete': '删除',
    'row.view_vnc': '查看 VNC',
    'row.control': '控制',
    'row.locked': '已锁定',
    'row.free': '空闲',
    'row.waiting_focus': '等待焦点',
    'row.inactive': '设备未活动',
    'row.delete_tooltip': '删除离线设备',
    'KEYLOGGER.TITLE': '键盘记录器 / 历史记录',
    'KEYLOGGER.MONITORING': '正在监控',

    // Login Page
    'login.title': 'KRYPTOS 控制面板',
    'login.username': '用户名',
    'login.password': '密码',
    'login.button': '登录系统',
    'login.language': '语言',
  }
};

export function useTranslation() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.lang) {
        setLang(customEvent.detail.lang);
      }
    };
    window.addEventListener('panel_language_changed', handleLangChange);
    return () => window.removeEventListener('panel_language_changed', handleLangChange);
  }, []);

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.pt[key] || key;
  };

  return { t, lang, setLang: setPanelLanguage };
}
