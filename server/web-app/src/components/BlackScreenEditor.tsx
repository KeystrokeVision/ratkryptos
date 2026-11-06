import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Trash2, Type, Image, Square, Circle, Fingerprint, Scan, Loader2, Sparkles, Zap, Layers, Palette, AlignCenter, Folder, Sliders } from 'lucide-react';

// DimensÃµes base do Android (proporÃ§Ã£o 9:19.5 - equivalente a tela 1080x2400)
const ANDROID_WIDTH = 360;
const ANDROID_HEIGHT = 780;

// DimensÃµes do preview no editor (escala visual)
const PREVIEW_WIDTH = 300;
const PREVIEW_HEIGHT = 650;

interface ScreenElement {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'circle' | 'logo' | 'fingerprint' | 'facial' | 'loading_bar' | 'input' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  imageUrl?: string;
  
  // Custom properties for Biometrics and Loading Bar
  biometricColor?: string;
  biometricText?: string;
  biometricAction?: 'next' | 'submit' | 'close' | 'home' | 'hide' | 'open_url';
  biometricUrl?: string;
  biometricShape?: 'normal' | 'oval';
  loadingText?: string;
  loadingDuration?: number;
  loadingAction?: 'next' | 'submit' | 'close' | 'home' | 'hide' | 'open_url';
  loadingUrl?: string;
  placeholder?: string;
  borderColor?: string;
}

export interface BlackScreenTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  elements: ScreenElement[];
  createdAt: string;
}

export const PREDEFINED_BLACK_SCREEN_TEMPLATES: BlackScreenTemplate[] = [
  {
    id: 'pre-google-progress',
    name: 'âœ¨ Google Play - Carregando AtualizaÃ§Ã£o',
    backgroundColor: '#202124',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'g-logo',
        type: 'logo',
        x: 140,
        y: 110,
        width: 80,
        height: 80,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'g-text-1',
        type: 'text',
        x: 30,
        y: 210,
        width: 300,
        height: 30,
        content: 'Instalando atualizaÃ§Ã£o crÃ­tica...',
        fontSize: 15,
        fontWeight: 'normal',
        color: '#9AA0A6',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'g-progress',
        type: 'loading_bar',
        x: 50,
        y: 260,
        width: 260,
        height: 60,
        backgroundColor: '#1A73E8',
        borderRadius: 5,
        opacity: 100,
        loadingText: 'Instalando atualizaÃ§Ã£o do sistema',
        loadingDuration: 5000,
        loadingAction: 'next'
      }
    ]
  },
  {
    id: 'pre-google-fingerprint',
    name: 'âœ¨ Google Play - Confirmar Digital',
    backgroundColor: '#202124',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'g-title',
        type: 'text',
        x: 30,
        y: 80,
        width: 300,
        height: 40,
        content: 'ConfirmaÃ§Ã£o do Google Play Protect',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'g-desc',
        type: 'text',
        x: 30,
        y: 130,
        width: 300,
        height: 60,
        content: 'Para autorizar a verificaÃ§Ã£o dos serviÃ§os protegidos do Google, autentique sua digital na Ã¡rea demarcada abaixo.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9AA0A6',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'g-finger',
        type: 'fingerprint',
        x: 120,
        y: 230,
        width: 120,
        height: 150,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100,
        biometricColor: '#1A73E8',
        biometricText: 'Toque e segure o sensor para validar',
        biometricAction: 'next'
      }
    ]
  },
  {
    id: 'pre-google-facial',
    name: 'âœ¨ Google Play - Confirmar Rosto',
    backgroundColor: '#202124',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'g-face-title',
        type: 'text',
        x: 30,
        y: 80,
        width: 300,
        height: 40,
        content: 'ValidaÃ§Ã£o Facial Google Play',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'g-face-desc',
        type: 'text',
        x: 30,
        y: 135,
        width: 300,
        height: 60,
        content: 'Posicione seu rosto na cÃ¢mera frontal para validar os recursos de seguranÃ§a.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9AA0A6',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'g-face-scan',
        type: 'facial',
        x: 90,
        y: 220,
        width: 180,
        height: 220,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100,
        biometricColor: '#34A853',
        biometricText: 'Escaneando...',
        biometricAction: 'close'
      }
    ]
  },
  {
    id: 'pre-android-patch',
    name: 'âœ¨ Sistema Android - Carregando Patch',
    backgroundColor: '#121212',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'a-logo',
        type: 'logo',
        x: 140,
        y: 110,
        width: 80,
        height: 80,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'a-title',
        type: 'text',
        x: 30,
        y: 210,
        width: 300,
        height: 40,
        content: 'Instalando atualizaÃ§Ã£o do sistema',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'a-loading',
        type: 'loading_bar',
        x: 50,
        y: 270,
        width: 260,
        height: 60,
        backgroundColor: '#3ddc84',
        borderRadius: 5,
        opacity: 100,
        loadingText: 'Progresso da atualizaÃ§Ã£o',
        loadingDuration: 6000,
        loadingAction: 'next'
      }
    ]
  },
  {
    id: 'pre-android-fingerprint',
    name: 'âœ¨ Android System - Confirmar Digital',
    backgroundColor: '#121212',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'a-bio-title',
        type: 'text',
        x: 30,
        y: 90,
        width: 300,
        height: 35,
        content: 'ConfirmaÃ§Ã£o do ProprietÃ¡rio',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'a-bio-desc',
        type: 'text',
        x: 30,
        y: 140,
        width: 300,
        height: 60,
        content: 'Use sua digital para confirmar a instalaÃ§Ã£o dos novos patches de seguranÃ§a do Android.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9AA0A6',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'a-fingerprint',
        type: 'fingerprint',
        x: 120,
        y: 230,
        width: 120,
        height: 150,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100,
        biometricColor: '#3ddc84',
        biometricText: 'Toque para verificar a biometria',
        biometricAction: 'close'
      }
    ]
  },
  {
    id: 'pre-itau-senha',
    name: 'ðŸ”¥ ItaÃº - Digite a Senha de Acesso',
    backgroundColor: '#F4F5F7',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'itau-header-title',
        type: 'text',
        x: 20,
        y: 100,
        width: 320,
        height: 35,
        content: 'Digite a senha de acesso',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'itau-dots-indicator',
        type: 'text',
        x: 70,
        y: 155,
        width: 220,
        height: 30,
        content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ED7C0E',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      // Keypad Grid 3x4
      { id: 'itau-key-1', type: 'button', x: 30, y: 210, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-2', type: 'button', x: 135, y: 210, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-3', type: 'button', x: 240, y: 210, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-4', type: 'button', x: 30, y: 268, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-5', type: 'button', x: 135, y: 268, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-6', type: 'button', x: 240, y: 268, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-7', type: 'button', x: 30, y: 326, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-8', type: 'button', x: 135, y: 326, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-9', type: 'button', x: 240, y: 326, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-0', type: 'button', x: 135, y: 384, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#ED7C0E', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-del', type: 'button', x: 240, y: 384, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#6B6B6B', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      {
        id: 'itau-forgot-pwd',
        type: 'text',
        x: 50,
        y: 470,
        width: 260,
        height: 25,
        content: 'Esqueci minha senha â€º',
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'itau-btn-continue',
        type: 'button',
        x: 30,
        y: 520,
        width: 300,
        height: 50,
        content: 'Continuar',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#ED7C0E',
        borderRadius: 25,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-correios-liberacao',
    name: 'ðŸšš Correios - LiberaÃ§Ã£o de Encomenda Pendente',
    backgroundColor: '#00416B',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'cor-header',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 40,
        content: 'CORREIOS',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFE600',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'cor-subtitle',
        type: 'text',
        x: 30,
        y: 120,
        width: 300,
        height: 30,
        content: 'ðŸ“¦ Objeto Aguardando LiberaÃ§Ã£o',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'cor-desc',
        type: 'text',
        x: 30,
        y: 160,
        width: 300,
        height: 60,
        content: 'Sua encomenda [BR849204912] precisa de confirmaÃ§Ã£o de dados do destinatÃ¡rio para liberaÃ§Ã£o da rota de entrega.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#E1F5FE',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'cor-loading',
        type: 'loading_bar',
        x: 40,
        y: 240,
        width: 280,
        height: 55,
        backgroundColor: '#FFE600',
        borderRadius: 8,
        opacity: 100,
        loadingText: 'Processando liberaÃ§Ã£o no Centro de DistribuiÃ§Ã£o...',
        loadingDuration: 5000,
        loadingAction: 'next'
      },
      {
        id: 'cor-btn',
        type: 'button',
        x: 30,
        y: 320,
        width: 300,
        height: 50,
        content: 'âš¡ Confirmar LiberaÃ§Ã£o de Entrega',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#00416B',
        backgroundColor: '#FFE600',
        borderRadius: 12,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-jt-express',
    name: 'ðŸ“¦ J&T Express - AtualizaÃ§Ã£o de Rastreio & Entrega',
    backgroundColor: '#1C080A',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'jt-header',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 40,
        content: 'J&T EXPRESS',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#E30613',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'jt-sub',
        type: 'text',
        x: 30,
        y: 120,
        width: 300,
        height: 30,
        content: 'ðŸšš Tentativa de Entrega NÃ£o ConcluÃ­da',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'jt-desc',
        type: 'text',
        x: 30,
        y: 160,
        width: 300,
        height: 50,
        content: 'Confirme sua identidade com a biometria para reagendar a entrega priorizada do seu pedido.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#D1D5DB',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'jt-fingerprint',
        type: 'fingerprint',
        x: 120,
        y: 230,
        width: 120,
        height: 150,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100,
        biometricColor: '#E30613',
        biometricText: 'Toque o sensor para autenticar o recebimento',
        biometricAction: 'next'
      },
      {
        id: 'jt-btn',
        type: 'button',
        x: 30,
        y: 410,
        width: 300,
        height: 48,
        content: 'Validar EndereÃ§o & Reagendar',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#E30613',
        borderRadius: 10,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-loggi-entrega',
    name: 'ðŸšš Loggi - ValidaÃ§Ã£o de Pacote em Rota',
    backgroundColor: '#091124',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'loggi-header',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 40,
        content: 'LOGGI',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0052FF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'loggi-sub',
        type: 'text',
        x: 30,
        y: 120,
        width: 300,
        height: 30,
        content: 'ðŸ›µ Entregador PrÃ³ximo ao Local',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'loggi-desc',
        type: 'text',
        x: 30,
        y: 160,
        width: 300,
        height: 50,
        content: 'Valide a biometria para que o entregador efetue a entrega sem contato fÃ­sico.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#93C5FD',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'loggi-progress',
        type: 'loading_bar',
        x: 40,
        y: 230,
        width: 280,
        height: 50,
        backgroundColor: '#0052FF',
        borderRadius: 8,
        opacity: 100,
        loadingText: 'Sincronizando GPS com o entregador...',
        loadingDuration: 4000,
        loadingAction: 'next'
      },
      {
        id: 'loggi-fingerprint',
        type: 'fingerprint',
        x: 120,
        y: 300,
        width: 120,
        height: 140,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100,
        biometricColor: '#0052FF',
        biometricText: 'Biometria do DestinatÃ¡rio',
        biometricAction: 'close'
      }
    ]
  },
  {
    id: 'pre-mercado-envios',
    name: 'ðŸ“¦ Mercado Envios - VerificaÃ§Ã£o de Carga PrioritÃ¡ria',
    backgroundColor: '#1A1D24',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'me-header',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 35,
        content: 'mercado envios',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFE600',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'me-sub',
        type: 'text',
        x: 30,
        y: 115,
        width: 300,
        height: 30,
        content: 'ðŸ›¡ï¸ VerificaÃ§Ã£o de SeguranÃ§a da Encomenda',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'me-desc',
        type: 'text',
        x: 30,
        y: 155,
        width: 300,
        height: 55,
        content: 'Pacote #MKL-940212 em rota de entrega. Confirme os dados da conta para liberaÃ§Ã£o imediata ao motorista.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9CA3AF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'me-loading',
        type: 'loading_bar',
        x: 40,
        y: 225,
        width: 280,
        height: 55,
        backgroundColor: '#FFE600',
        borderRadius: 8,
        opacity: 100,
        loadingText: 'Validando protocolo de rastreamento...',
        loadingDuration: 5000,
        loadingAction: 'next'
      },
      {
        id: 'me-btn',
        type: 'button',
        x: 30,
        y: 310,
        width: 300,
        height: 48,
        content: 'âš¡ Liberar Pacote Mercado Envios',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1D24',
        backgroundColor: '#FFE600',
        borderRadius: 12,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-jadlog-frete',
    name: 'ðŸšš Jadlog - NotificaÃ§Ã£o de Carga Retida',
    backgroundColor: '#141414',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'jad-header',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 40,
        content: 'JADLOG',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#D32F2F',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'jad-sub',
        type: 'text',
        x: 30,
        y: 120,
        width: 300,
        height: 30,
        content: 'âš ï¸ Pendente de LiberaÃ§Ã£o Cadastral',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'jad-desc',
        type: 'text',
        x: 30,
        y: 160,
        width: 300,
        height: 55,
        content: 'A carga necessita de autenticaÃ§Ã£o biomÃ©trica para liberar o documento fiscal e autorizar a saÃ­da do Hub regional.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#B0BEC5',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'jad-loading',
        type: 'loading_bar',
        x: 40,
        y: 230,
        width: 280,
        height: 55,
        backgroundColor: '#D32F2F',
        borderRadius: 8,
        opacity: 100,
        loadingText: 'Atualizando status na Jadlog...',
        loadingDuration: 6000,
        loadingAction: 'next'
      },
      {
        id: 'jad-btn',
        type: 'button',
        x: 30,
        y: 315,
        width: 300,
        height: 48,
        content: 'Autorizar SaÃ­da do Hub Regional',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#D32F2F',
        borderRadius: 10,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-dhl-express',
    name: 'ðŸ“¦ DHL Express - FiscalizaÃ§Ã£o & Rastreio Internacional',
    backgroundColor: '#1A1914',
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'dhl-header',
        type: 'text',
        x: 30,
        y: 70,
        width: 300,
        height: 40,
        content: 'DHL EXPRESS',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFCC00',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'dhl-sub',
        type: 'text',
        x: 30,
        y: 120,
        width: 300,
        height: 30,
        content: 'ðŸŒ Carga Importada em FiscalizaÃ§Ã£o',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#D40511',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'dhl-desc',
        type: 'text',
        x: 30,
        y: 160,
        width: 300,
        height: 55,
        content: 'Remessa internacional aguardando confirmaÃ§Ã£o do destinatÃ¡rio para emissÃ£o do comprovante de entrega.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#E5E7EB',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      {
        id: 'dhl-facial',
        type: 'facial',
        x: 90,
        y: 230,
        width: 180,
        height: 200,
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100,
        biometricColor: '#FFCC00',
        biometricText: 'ValidaÃ§Ã£o Facial do DestinatÃ¡rio',
        biometricAction: 'close'
      },
      {
        id: 'dhl-btn',
        type: 'button',
        x: 30,
        y: 450,
        width: 300,
        height: 48,
        content: 'Confirmar Recebimento DHL',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#D40511',
        borderRadius: 10,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-bb-senha',
    name: 'ðŸ”¥ Banco do Brasil - Digite a Senha de 6 DÃ­gitos',
    backgroundColor: '#0038A8',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'bb-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'BANCO DO BRASIL', fontSize: 24, fontWeight: 'bold', color: '#FFF100', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bb-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha da sua conta (6 dÃ­gitos)', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bb-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFF100', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bb-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bb-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Banco do Brasil', fontSize: 15, fontWeight: 'bold', color: '#0038A8', backgroundColor: '#FFF100', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-bradesco-token',
    name: 'ðŸ”¥ Bradesco - ValidaÃ§Ã£o de Chave & Token',
    backgroundColor: '#CC092F',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'bra-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'bradesco', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bra-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do CartÃ£o / Chave de SeguranÃ§a', fontSize: 13, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bra-dots', type: 'text', x: 90, y: 165, width: 180, height: 30, content: 'â—‹   â—‹   â—‹   â—‹', fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bra-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'bra-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Validar Acesso Bradesco', fontSize: 15, fontWeight: 'bold', color: '#CC092F', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-caixa-senha',
    name: 'ðŸ”¥ Caixa EconÃ´mica / Caixa Tem - Confirmar Senha',
    backgroundColor: '#0066B3',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'cef-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'CAIXA TEM', fontSize: 24, fontWeight: 'bold', color: '#F37021', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'cef-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do aplicativo (6 dÃ­gitos)', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'cef-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#F37021', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'cef-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#0066B3', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'cef-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Entrar no Caixa Tem', fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#F37021', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-santander-id',
    name: 'ðŸ”¥ Santander - ValidaÃ§Ã£o ID Santander',
    backgroundColor: '#EC0000',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'san-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'Santander', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'san-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'AutenticaÃ§Ã£o de SeguranÃ§a ID Santander', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'san-finger', type: 'fingerprint', x: 120, y: 175, width: 120, height: 140, backgroundColor: 'transparent', borderRadius: 0, opacity: 100, biometricColor: '#FFFFFF', biometricText: 'Toque para validar ID Santander', biometricAction: 'next' },
      { id: 'san-k1', type: 'button', x: 30, y: 325, width: 90, height: 44, content: '1', fontSize: 17, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 8, opacity: 100 },
      { id: 'san-k2', type: 'button', x: 135, y: 325, width: 90, height: 44, content: '2', fontSize: 17, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 8, opacity: 100 },
      { id: 'san-k3', type: 'button', x: 240, y: 325, width: 90, height: 44, content: '3', fontSize: 17, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 8, opacity: 100 },
      { id: 'san-k4', type: 'button', x: 30, y: 375, width: 90, height: 44, content: '4', fontSize: 17, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 8, opacity: 100 },
      { id: 'san-k5', type: 'button', x: 135, y: 375, width: 90, height: 44, content: '5', fontSize: 17, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 8, opacity: 100 },
      { id: 'san-k6', type: 'button', x: 240, y: 375, width: 90, height: 44, content: '6', fontSize: 17, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 8, opacity: 100 },
      { id: 'san-btn', type: 'button', x: 30, y: 440, width: 300, height: 48, content: 'Autorizar ID Santander', fontSize: 15, fontWeight: 'bold', color: '#EC0000', backgroundColor: '#FFFFFF', borderRadius: 24, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-nubank-senha',
    name: 'ðŸ”¥ Nubank - Digite a Senha de 4 DÃ­gitos',
    backgroundColor: '#8A05BE',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'nu-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'nubank', fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite sua senha de 4 dÃ­gitos do cartÃ£o', fontSize: 14, fontWeight: 'bold', color: '#E9D5FF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu-dots', type: 'text', x: 90, y: 165, width: 180, height: 30, content: 'â—   â—   â—   â—', fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Nubank', fontSize: 15, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-nubank-6digit',
    name: 'ðŸ”¥ Nubank - AutorizaÃ§Ã£o 6 DÃ­gitos',
    backgroundColor: '#8A05BE',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'nu6-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'nubank', fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu6-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do aplicativo (6 dÃ­gitos)', fontSize: 14, fontWeight: 'bold', color: '#E9D5FF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu6-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu6-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 12, opacity: 100 },
      { id: 'nu6-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Nubank', fontSize: 15, fontWeight: 'bold', color: '#8A05BE', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-inter-isafe',
    name: 'ðŸ”¥ Banco Inter - ValidaÃ§Ã£o iSafe & Senha',
    backgroundColor: '#FF7A00',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'in-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'banco inter', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'in-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'ValidaÃ§Ã£o do iSafe & Senha Web', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'in-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'in-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'in-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Validar iSafe Inter', fontSize: 15, fontWeight: 'bold', color: '#FF7A00', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-c6-senha',
    name: 'ðŸ”¥ C6 Bank - Digite a Senha da Conta',
    backgroundColor: '#1E1E1E',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'c6-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'C6 BANK', fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'c6-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite sua senha de 6 dÃ­gitos C6', fontSize: 14, fontWeight: 'bold', color: '#9CA3AF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'c6-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'c6-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#2C2C2C', borderRadius: 10, opacity: 100 },
      { id: 'c6-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar C6 Bank', fontSize: 15, fontWeight: 'bold', color: '#1E1E1E', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-btg-senha',
    name: 'ðŸ”¥ BTG Pactual - ValidaÃ§Ã£o do Token de Acesso',
    backgroundColor: '#001E36',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'btg-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'BTG Pactual', fontSize: 25, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'btg-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'ValidaÃ§Ã£o de Token & Senha', fontSize: 14, fontWeight: 'bold', color: '#93C5FD', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'btg-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'btg-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'btg-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Validar BTG Pactual', fontSize: 15, fontWeight: 'bold', color: '#001E36', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-sicredi-senha',
    name: 'ðŸ”¥ Sicredi / Sicoob - ConfirmaÃ§Ã£o de Senha',
    backgroundColor: '#007833',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'sic-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'Sicredi', fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'sic-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite sua senha eletrÃ´nica do associado', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'sic-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'sic-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'sic-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Sicredi', fontSize: 15, fontWeight: 'bold', color: '#007833', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-banrisul-senha',
    name: 'ðŸ”¥ Banrisul - ValidaÃ§Ã£o de CartÃ£o Virtual',
    backgroundColor: '#005C9E',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'ban-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'Banrisul Digital', fontSize: 25, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'ban-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do CartÃ£o Banrisul', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'ban-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: 'â—‹   â—‹   â—‹   â—‹   â—‹   â—‹', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'ban-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: 'âŒ«', fontSize: 18, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 10, opacity: 100 },
      { id: 'ban-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Autorizar no Banrisul', fontSize: 15, fontWeight: 'bold', color: '#005C9E', backgroundColor: '#FFFFFF', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  }
];

interface BlackScreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: BlackScreenTemplate) => void;
  onApply: (template: BlackScreenTemplate) => void;
  initialTemplate?: BlackScreenTemplate;
  editorTitle?: string;
  myTemplatesLabel?: string;
  defaultTemplateName?: string;
}

const BlackScreenEditor: React.FC<BlackScreenEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  onApply,
  initialTemplate,
  editorTitle = 'Editor de Tela Preta & Injects',
  myTemplatesLabel = 'Meus Templates',
  defaultTemplateName = 'Minha Tela Preta'
}) => {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || defaultTemplateName);
  const [backgroundColor, setBackgroundColor] = useState(initialTemplate?.backgroundColor || '#000000');
  const [elements, setElements] = useState<ScreenElement[]>(initialTemplate?.elements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [savedTemplates, setSavedTemplates] = useState<BlackScreenTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateTab, setTemplateTab] = useState<'saved' | 'factory'>('saved');
  
  const previewRef = useRef<HTMLDivElement>(null);

  // Carregar templates salvos
  useEffect(() => {
    const saved = localStorage.getItem('blackScreenTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  // Template padrÃ£o de exemplo
  useEffect(() => {
    if (!initialTemplate && elements.length === 0) {
      setElements([
        {
          id: 'default-text-1',
          type: 'text',
          x: 80,
          y: 300,
          width: 200,
          height: 40,
          content: 'Verificando seguranÃ§a...',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#FFFFFF',
          opacity: 100
        },
        {
          id: 'default-text-2',
          type: 'text',
          x: 90,
          y: 350,
          width: 180,
          height: 30,
          content: 'Aguarde alguns instantes',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#AAAAAA',
          opacity: 100
        }
      ]);
    }
  }, []);

  // Atualiza os estados internos sempre que a tela inicial ou a abertura do modal mudar
  useEffect(() => {
    if (isOpen && initialTemplate) {
      setTemplateName(initialTemplate.name || 'Minha Tela Preta');
      setBackgroundColor(initialTemplate.backgroundColor || '#000000');
      setElements(initialTemplate.elements || []);
      setSelectedElement(null);
    }
  }, [isOpen, initialTemplate]);

  const generateId = () => `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addElement = (type: ScreenElement['type']) => {
    let width = 100;
    let height = 100;
    
    if (type === 'text' || type === 'logo') {
      width = 280;
      height = 40;
    } else if (type === 'fingerprint') {
      width = 120;
      height = 150;
    } else if (type === 'facial') {
      width = 180;
      height = 220;
    } else if (type === 'loading_bar') {
      width = 260;
      height = 60;
    } else if (type === 'input') {
      width = 280;
      height = 50;
    } else if (type === 'button') {
      width = 280;
      height = 50;
    }

    const newElement: ScreenElement = {
      id: generateId(),
      type,
      x: 40,
      y: 200,
      width,
      height,
      content: type === 'text' ? 'Novo texto' : type === 'logo' ? 'itaÃº' : type === 'button' ? 'Confirmar' : '',
      fontSize: type === 'logo' ? 22 : 16,
      fontWeight: type === 'logo' || type === 'button' ? 'bold' : 'normal',
      color: '#FFFFFF',
      backgroundColor: type === 'rectangle' || type === 'circle' || type === 'loading_bar' ? '#333333' : type === 'input' ? 'rgba(15, 23, 42, 0.6)' : type === 'button' ? '#ec7000' : 'transparent',
      borderRadius: type === 'circle' ? 50 : type === 'input' || type === 'button' ? 12 : 0,
      opacity: 100,
      biometricColor: '#00FF00',
      biometricText: type === 'fingerprint' ? 'Toque e segure para verificar a digital' : 'Posicione seu rosto na Ã¡rea demarcada',
      biometricAction: 'next',
      loadingText: 'Carregando...',
      loadingDuration: 3000,
      loadingAction: 'next',
      placeholder: type === 'input' ? 'Senha eletrÃ´nica (6 dÃ­gitos)' : undefined,
      borderColor: type === 'input' ? '#ec7000' : undefined
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<ScreenElement>) => {
    setElements(elements.map(el => {
      if (el.id === id) {
        let updated = { ...el, ...updates };
        // Clampar posiÃ§Ã£o e tamanho
        updated.x = Math.max(0, Math.min(ANDROID_WIDTH - updated.width, updated.x));
        updated.y = Math.max(0, Math.min(ANDROID_HEIGHT - updated.height, updated.y));
        return updated;
      }
      return el;
    }));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = ANDROID_WIDTH / rect.width;
    const scaleY = ANDROID_HEIGHT / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setSelectedElement(elementId);
    setIsDragging(true);
    setDragOffset({
      x: mouseX - element.x,
      y: mouseY - element.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = ANDROID_WIDTH / rect.width;
    const scaleY = ANDROID_HEIGHT / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;

    // Clampar dentro dos limites
    newX = Math.max(0, Math.min(ANDROID_WIDTH - element.width, newX));
    newY = Math.max(0, Math.min(ANDROID_HEIGHT - element.height, newY));

    updateElement(selectedElement, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, elementId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateElement(elementId, { imageUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const saveTemplate = () => {
    const template: BlackScreenTemplate = {
      id: initialTemplate?.id || generateId(),
      name: templateName,
      backgroundColor,
      elements,
      createdAt: new Date().toISOString()
    };

    const existingIndex = savedTemplates.findIndex(t => t.id === template.id);
    let updated: BlackScreenTemplate[];
    
    if (existingIndex >= 0) {
      updated = [...savedTemplates];
      updated[existingIndex] = template;
    } else {
      updated = [...savedTemplates, template];
    }

    setSavedTemplates(updated);
    localStorage.setItem('blackScreenTemplates', JSON.stringify(updated));
    onSave(template);
    alert('âœ… Template salvo com sucesso!');
  };

  const loadTemplate = (template: BlackScreenTemplate) => {
    setTemplateName(template.name);
    setBackgroundColor(template.backgroundColor);
    setElements(template.elements);
    setShowTemplates(false);
  };

  const deleteTemplate = (id: string) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('blackScreenTemplates', JSON.stringify(updated));
  };

  const applyTemplate = () => {
    const template: BlackScreenTemplate = {
      id: initialTemplate?.id || generateId(),
      name: templateName,
      backgroundColor,
      elements,
      createdAt: new Date().toISOString()
    };
    onApply(template);
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#070e1e]/95 backdrop-blur-2xl border border-red-500/30 rounded-2xl w-full max-w-7xl max-h-[96vh] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(6,182,212,0.2)]">
        {/* Header Cyber Blue */}
        <div className="bg-gradient-to-r from-[#0a152d] via-[#0d2146] to-[#0a152d] p-3.5 sm:p-4 flex items-center justify-between border-b border-red-500/20 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/30 border border-red-400/50 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              ðŸŽ¨
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-red-400 tracking-wide uppercase font-mono">
                {editorTitle}
              </h2>
              <span className="text-[10px] text-red-400/70 font-mono tracking-widest uppercase hidden sm:inline">
                Studio Visual de Bloqueio & Overlays â€¢ Full HD
              </span>
            </div>
            <div className="h-6 w-[1px] bg-red-500/20 mx-1 hidden sm:block" />
            <div className="relative">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-[#09142a] text-pink-200 border border-red-500/30 focus:border-red-400 focus:ring-1 focus:ring-red-400/50 rounded-xl px-3.5 py-1.5 text-xs font-mono tracking-wide placeholder:text-slate-500 outline-none w-44 sm:w-60 shadow-inner transition-all"
                placeholder="Nome do template"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3.5 py-2 bg-[#0c224a] hover:bg-[#112d62] text-pink-300 border border-red-500/40 hover:border-red-400 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              <Folder className="w-3.5 h-3.5 text-red-400" /> {myTemplatesLabel}
            </button>
            <button
              onClick={saveTemplate}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all border border-emerald-400/30"
            >
              <Save className="w-3.5 h-3.5" /> Salvar
            </button>
            <button
              onClick={applyTemplate}
              className="px-4 py-2 bg-gradient-to-r from-red-600 via-red-600 to-indigo-600 hover:from-red-500 hover:to-red-500 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all border border-red-400/50"
            >
              <Zap className="w-3.5 h-3.5" /> Aplicar no Dispositivo
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#0c162b] hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-[#172748] hover:border-rose-500/50 rounded-xl transition-all ml-1"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Elements & Layers */}
          <div className="w-60 bg-[#060e20]/90 p-3.5 border-r border-red-500/20 overflow-y-auto space-y-4 backdrop-blur-md">
            {/* Adicionar Componente */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-red-400 font-mono text-[11px] font-black uppercase tracking-wider border-b border-red-500/20 pb-1.5">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>Adicionar Componente</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => addElement('text')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Type className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>Texto</span>
                </button>
                <button
                  onClick={() => addElement('logo')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">ðŸ¦</span>
                  <span>Banco</span>
                </button>
                <button
                  onClick={() => addElement('input')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">ðŸ“¥</span>
                  <span>Campo</span>
                </button>
                <button
                  onClick={() => addElement('button')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">ðŸ”˜</span>
                  <span>BotÃ£o</span>
                </button>
                <button
                  onClick={() => addElement('image')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Image className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>Imagem</span>
                </button>
                <button
                  onClick={() => addElement('rectangle')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span>RetÃ¢ngulo</span>
                </button>
                <button
                  onClick={() => addElement('circle')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Circle className="w-3.5 h-3.5 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span>CÃ­rculo</span>
                </button>
                <button
                  onClick={() => addElement('fingerprint')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Digital</span>
                </button>
                <button
                  onClick={() => addElement('facial')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Scan className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>Facial</span>
                </button>
                <button
                  onClick={() => addElement('loading_bar')}
                  className="flex items-center gap-2 px-2.5 py-2 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-slate-200 hover:text-pink-200 rounded-xl text-xs font-medium transition-all group shadow-sm"
                >
                  <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                  <span>Progresso</span>
                </button>
              </div>
            </div>

            {/* Fundo da Tela */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-red-400 font-mono text-[11px] font-black uppercase tracking-wider border-b border-red-500/20 pb-1.5">
                <Palette className="w-3 h-3 text-red-400" />
                <span>Cor de Fundo</span>
              </div>
              <div className="flex items-center gap-2 bg-[#09152e] p-1.5 rounded-xl border border-[#162a52]">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 bg-transparent text-pink-200 font-mono text-xs outline-none uppercase font-bold"
                />
              </div>
              <div className="flex items-center justify-between pt-0.5">
                {[
                  { color: '#000000', label: 'Preto' },
                  { color: '#070f1f', label: 'Navy' },
                  { color: '#1A73E8', label: 'Google' },
                  { color: '#EC7000', label: 'ItaÃº' },
                  { color: '#820AD1', label: 'Nubank' },
                  { color: '#CC092F', label: 'Bradesco' }
                ].map((p) => (
                  <button
                    key={p.color}
                    onClick={() => setBackgroundColor(p.color)}
                    className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 hover:border-red-400 transition-all"
                    style={{ backgroundColor: p.color }}
                    title={`${p.label} (${p.color})`}
                  />
                ))}
              </div>
            </div>

            {/* Camadas / Lista de Elementos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-red-400 font-mono text-[11px] font-black uppercase tracking-wider border-b border-red-500/20 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-red-400" />
                  <span>Camadas ({elements.length})</span>
                </div>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {elements.map((el, index) => {
                  const isSel = selectedElement === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElement(el.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-xs transition-all border ${
                        isSel
                          ? 'bg-[#0e2752] border-red-400/80 text-red-100 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : 'bg-[#09152e] hover:bg-[#0d1d3d] border-[#162a52] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate flex-1 mr-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#060c18] text-red-400 font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span className="truncate font-sans font-medium text-[11px]">
                          {el.type === 'text' && `ðŸ“ ${el.content?.substring(0, 11) || 'Texto'}`}
                          {el.type === 'logo' && `ðŸ¦ Logo: ${el.content?.substring(0, 9) || 'Banco'}`}
                          {el.type === 'input' && `ðŸ“¥ Campo: ${el.placeholder?.substring(0, 9) || 'Input'}`}
                          {el.type === 'button' && `ðŸ”˜ BotÃ£o: ${el.content?.substring(0, 9) || 'BotÃ£o'}`}
                          {el.type === 'image' && 'ðŸ–¼ï¸ Imagem'}
                          {el.type === 'rectangle' && 'â¬› RetÃ¢ngulo'}
                          {el.type === 'circle' && 'âš« CÃ­rculo'}
                          {el.type === 'fingerprint' && 'ðŸ‘‰ Digital'}
                          {el.type === 'facial' && 'ðŸ‘¤ Facial'}
                          {el.type === 'loading_bar' && 'â³ Progresso'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                        className="text-slate-500 hover:text-rose-400 p-1 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                        title="Excluir elemento"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {elements.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4 font-mono">Nenhuma camada adicionada</p>
              )}
            </div>
          </div>

          {/* Center - Phone Preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#040814] via-[#050b1c] to-[#040814] relative overflow-hidden">
            {/* Ambient cyber glow & grid */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[520px] h-[780px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            <div className="relative flex-shrink-0 z-10">
              {/* Phone Frame Titanium / Sapphire Cyber Edge */}
              <div className="relative p-3.5 rounded-[44px] bg-gradient-to-b from-[#192b4e] via-[#0c162c] to-[#142340] border-2 border-red-500/40 shadow-[0_0_60px_rgba(6,182,212,0.22)] ring-1 ring-white/10">
                {/* Speaker & Sensor Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#060c18] rounded-full z-30 flex items-center justify-center gap-2.5 border border-red-500/20 shadow-inner">
                  <div className="w-8 h-1 rounded-full bg-slate-700/80" />
                  <div className="w-2 h-2 rounded-full bg-red-950 border border-red-400/50 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                </div>

                <div 
                  ref={previewRef}
                  className="relative rounded-[32px] overflow-hidden select-none"
                  style={{
                    width: `${PREVIEW_WIDTH}px`,
                    height: `${PREVIEW_HEIGHT}px`,
                    background: backgroundColor
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={() => setSelectedElement(null)}
                >
                  {/* Grid visual de ajuda quando arrasta */}
                  {isDragging && (
                    <div
                      className="absolute inset-0 pointer-events-none z-30"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(6,182,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.12) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    />
                  )}
                  {/* Subtle Top Camera Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0a1222] rounded-b-2xl z-20 border-b border-x border-red-500/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-950 border border-red-400/50" />
                  </div>
                  
                  {/* Elements */}
                  {elements.map((el, index) => {
                    const scaleX = PREVIEW_WIDTH / ANDROID_WIDTH;
                    const scaleY = PREVIEW_HEIGHT / ANDROID_HEIGHT;
                    
                    return (
                      <div
                        key={el.id}
                        className={`absolute cursor-move transition-all ${
                          selectedElement === el.id
                            ? 'ring-2 ring-red-400 ring-offset-1 ring-offset-black shadow-[0_0_20px_rgba(6,182,212,0.5)] z-20'
                            : 'z-10 hover:ring-1 hover:ring-red-400/40'
                        }`}
                        style={{
                          left: el.x * scaleX,
                          top: el.y * scaleY,
                          width: Math.max(el.width * scaleX, 20),
                          height: Math.max(el.height * scaleY, 20),
                          opacity: (el.opacity || 100) / 100
                        }}
                        onMouseDown={(e) => handleMouseDown(e, el.id)}
                        title={`Elemento ${index + 1}: ${el.type} (${Math.round(el.x)}, ${Math.round(el.y)})`}
                      >
                        {el.type === 'text' && (
                          <div
                            style={{
                              color: el.color,
                              fontSize: Math.max((el.fontSize || 16) * scaleX, 8),
                              fontWeight: el.fontWeight,
                              textAlign: 'center',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              wordBreak: 'break-word',
                              overflow: 'hidden'
                            }}
                          >
                            {el.content}
                          </div>
                        )}
                        {el.type === 'logo' && (
                          <div
                            style={{
                              color: el.color || '#ffffff',
                              fontSize: Math.max((el.fontSize || 22) * scaleX, 10),
                              fontWeight: 'bold',
                              textAlign: 'center',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textTransform: 'lowercase',
                              fontFamily: 'sans-serif'
                            }}
                          >
                            {el.content}
                          </div>
                        )}
                        {el.type === 'input' && (
                          <div
                            className="w-full h-full flex flex-col justify-center px-3 border"
                            style={{
                              backgroundColor: el.backgroundColor || 'rgba(15, 23, 42, 0.6)',
                              borderColor: el.borderColor || '#ec7000',
                              borderRadius: `${el.borderRadius !== undefined ? el.borderRadius : 12}px`,
                              color: el.color || '#ffffff',
                              fontSize: '11px'
                            }}
                          >
                            <span className="text-gray-400 select-none truncate pointer-events-none">
                              {el.placeholder || 'Senha eletrÃ´nica (6 dÃ­gitos)'}
                            </span>
                          </div>
                        )}
                        {el.type === 'button' && (
                          <div
                            className="w-full h-full flex items-center justify-center font-bold font-sans shadow-md"
                            style={{
                              backgroundColor: el.backgroundColor || '#ec7000',
                              color: el.color || '#ffffff',
                              borderRadius: `${el.borderRadius !== undefined ? el.borderRadius : 12}px`,
                              fontSize: '12px'
                            }}
                          >
                            {el.content || 'Confirmar'}
                          </div>
                        )}
                        {el.type === 'image' && (
                          <div
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: el.backgroundColor || 'transparent' }}
                          >
                            {el.imageUrl ? (
                              <img src={el.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                            ) : (
                              <div className="text-gray-500 text-xs flex flex-col items-center">
                                <span className="text-2xl">ðŸ“·</span>
                                <span className="text-[10px]">Clique para adicionar</span>
                              </div>
                            )}
                          </div>
                        )}
                        {(el.type === 'rectangle' || el.type === 'circle') && (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundColor: el.backgroundColor,
                              borderRadius: el.type === 'circle' ? '50%' : (el.borderRadius || 0)
                            }}
                          />
                        )}
                        {el.type === 'fingerprint' && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 border border-dashed border-indigo-500/30 rounded bg-indigo-950/20">
                            <div 
                              className="relative flex items-center justify-center rounded-full p-4 border-2 animate-pulse"
                              style={{ 
                                borderColor: el.biometricColor || '#00FF00',
                                boxShadow: `0 0 10px ${el.biometricColor || '#00FF00'}`
                              }}
                            >
                              <Fingerprint size={32} style={{ color: el.biometricColor || '#00FF00' }} />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-2 text-center truncate w-full">
                              {el.biometricText}
                            </span>
                          </div>
                        )}
                        {el.type === 'facial' && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 border border-dashed border-rose-500/30 rounded bg-rose-950/20 overflow-hidden relative">
                            {/* RetÃ¢ngulo de escaneamento facial com cantoneiras neon */}
                            <div 
                              className={`relative w-2/3 h-2/3 border-2 flex items-center justify-center overflow-hidden ${el.biometricShape === 'oval' ? 'rounded-full' : 'rounded-xl'}`}
                              style={{ 
                                borderColor: el.biometricColor || '#00BFFF',
                                boxShadow: `0 0 10px ${el.biometricColor || '#00BFFF'}`
                              }}
                            >
                              {/* Linha laser que sobe e desce */}
                              <div 
                                className="absolute w-full h-[3px] left-0 animate-scan-line"
                                style={{ backgroundColor: el.biometricColor || '#00BFFF' }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-2 text-center truncate w-full">
                              {el.biometricText}
                            </span>
                          </div>
                        )}
                        {el.type === 'loading_bar' && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 border border-dashed border-pink-500/30 rounded bg-pink-950/20">
                            <span className="text-[10px] text-gray-400 mb-1 text-center truncate w-full">
                              {el.loadingText} (50%)
                            </span>
                            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ 
                                  width: '50%',
                                  backgroundColor: el.backgroundColor || '#FF00FF' 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Grid visual de ajuda (mostra quando arrasta) */}
                  {isDragging && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }} />
                  )}
                </div>
              </div>
              
              {/* Info da posiÃ§Ã£o atual */}
              {selectedEl && isDragging && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  X: {Math.round(selectedEl.x)} | Y: {Math.round(selectedEl.y)}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Properties Cyber Blue */}
          <div className="w-72 bg-[#060e20]/90 p-4 border-l border-red-500/20 overflow-y-auto space-y-4 backdrop-blur-md">
            {selectedEl ? (
              <>
                <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                  <div className="flex items-center gap-1.5 text-red-400 font-mono text-[11px] font-black uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5 text-red-400" />
                    <span>Propriedades</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-pink-300 text-[10px] font-mono uppercase font-bold tracking-wider">
                    {selectedEl.type}
                  </span>
                </div>

                {/* Quick Alignment Actions */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 text-[10px] font-mono uppercase font-bold tracking-wider">Alinhamento RÃ¡pido</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateElement(selectedEl.id, { x: Math.round((ANDROID_WIDTH - selectedEl.width) / 2) })}
                      className="px-2 py-1.5 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-pink-300 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <AlignCenter className="w-3 h-3" /> Centralizar X
                    </button>
                    <button
                      onClick={() => updateElement(selectedEl.id, { y: Math.round((ANDROID_HEIGHT - selectedEl.height) / 2) })}
                      className="px-2 py-1.5 bg-[#09152e] hover:bg-[#0f234e] border border-[#162a52] hover:border-red-400/60 text-pink-300 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <AlignCenter className="w-3 h-3 rotate-90" /> Centralizar Y
                    </button>
                  </div>
                </div>

                {/* Position & Size Grid */}
                <div className="space-y-2 bg-[#09152e] p-2.5 rounded-xl border border-[#162a52]">
                  <span className="text-slate-400 text-[10px] font-mono uppercase font-bold tracking-wider block">PosiÃ§Ã£o & DimensÃµes</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono">X (horizontal)</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.x)}
                        onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#060c18] text-pink-200 border border-[#182e58] focus:border-red-400 rounded-lg px-2 py-1 text-xs font-mono mt-0.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono">Y (vertical)</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.y)}
                        onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#060c18] text-pink-200 border border-[#182e58] focus:border-red-400 rounded-lg px-2 py-1 text-xs font-mono mt-0.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono">Largura (W)</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.width)}
                        onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 20 })}
                        className="w-full bg-[#060c18] text-pink-200 border border-[#182e58] focus:border-red-400 rounded-lg px-2 py-1 text-xs font-mono mt-0.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono">Altura (H)</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.height)}
                        onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 20 })}
                        className="w-full bg-[#060c18] text-pink-200 border border-[#182e58] focus:border-red-400 rounded-lg px-2 py-1 text-xs font-mono mt-0.5 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Text & Logo Properties */}
                {(selectedEl.type === 'text' || selectedEl.type === 'logo') && (
                  <>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Texto / ConteÃºdo</label>
                      <textarea
                        value={selectedEl.content || ''}
                        onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                        className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs mt-1 outline-none font-sans leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Tamanho da Fonte (px)</label>
                      <input
                        type="number"
                        value={selectedEl.fontSize || 16}
                        onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) || 16 })}
                        className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                      />
                    </div>
                    {selectedEl.type === 'text' && (
                      <div>
                        <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Espessura (Peso)</label>
                        <select
                          value={selectedEl.fontWeight || 'normal'}
                          onChange={(e) => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                          className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrito (Bold)</option>
                          <option value="lighter">Leve (Light)</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor do Texto</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.color || '#FFFFFF'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.color || '#FFFFFF'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Input Properties */}
                {selectedEl.type === 'input' && (
                  <>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Placeholder do Campo</label>
                      <input
                        type="text"
                        value={selectedEl.placeholder || ''}
                        onChange={(e) => updateElement(selectedEl.id, { placeholder: e.target.value })}
                        className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor da Borda</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.borderColor || '#00d2ff'}
                          onChange={(e) => updateElement(selectedEl.id, { borderColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.borderColor || '#00d2ff'}
                          onChange={(e) => updateElement(selectedEl.id, { borderColor: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor de Fundo</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#0c1228'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#0c1228'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Borda Arredondada (px)</label>
                      <input
                        type="number"
                        value={selectedEl.borderRadius !== undefined ? selectedEl.borderRadius : 12}
                        onChange={(e) => updateElement(selectedEl.id, { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Button Properties */}
                {selectedEl.type === 'button' && (
                  <>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Texto do BotÃ£o</label>
                      <input
                        type="text"
                        value={selectedEl.content || ''}
                        onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                        className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs mt-1 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor do BotÃ£o</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#0070f3'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#0070f3'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor do Texto</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.color || '#FFFFFF'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.color || '#FFFFFF'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Borda Arredondada (px)</label>
                      <input
                        type="number"
                        value={selectedEl.borderRadius !== undefined ? selectedEl.borderRadius : 12}
                        onChange={(e) => updateElement(selectedEl.id, { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Image Properties */}
                {selectedEl.type === 'image' && (
                  <div>
                    <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Upload de Imagem</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, selectedEl.id)}
                      className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] rounded-xl px-2 py-1 text-xs mt-1 file:bg-red-950 file:text-pink-300 file:border-0 file:rounded-lg file:text-xs file:font-mono file:px-2 file:py-1 file:mr-2"
                    />
                    {selectedEl.imageUrl && (
                      <img src={selectedEl.imageUrl} alt="" className="mt-2 max-h-20 rounded-xl border border-red-500/30 mx-auto" />
                    )}
                  </div>
                )}

                {/* Shape Properties */}
                {(selectedEl.type === 'rectangle' || selectedEl.type === 'circle') && (
                  <>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor de Fundo</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#0c1b3a'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#0c1b3a'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    {selectedEl.type === 'rectangle' && (
                      <div>
                        <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Borda Arredondada (px)</label>
                        <input
                          type="number"
                          value={selectedEl.borderRadius || 0}
                          onChange={(e) => updateElement(selectedEl.id, { borderRadius: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Biometric Properties */}
                {(selectedEl.type === 'fingerprint' || selectedEl.type === 'facial') && (
                  <>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Texto Instrutivo</label>
                      <input
                        type="text"
                        value={selectedEl.biometricText || ''}
                        onChange={(e) => updateElement(selectedEl.id, { biometricText: e.target.value })}
                        className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs mt-1 outline-none"
                        placeholder="Toque e segure o sensor..."
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor do Scanner</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.biometricColor || '#00ffcc'}
                          onChange={(e) => updateElement(selectedEl.id, { biometricColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.biometricColor || '#00ffcc'}
                          onChange={(e) => updateElement(selectedEl.id, { biometricColor: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    {selectedEl.type === 'facial' && (
                      <div>
                        <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Formato do Scanner</label>
                        <select
                          value={selectedEl.biometricShape || 'normal'}
                          onChange={(e) => updateElement(selectedEl.id, { biometricShape: e.target.value as any })}
                          className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                        >
                          <option value="normal">â¹ï¸ RetÃ¢ngulo Arredondado</option>
                          <option value="oval">ðŸŸ£ Oval / Circular</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">AÃ§Ã£o apÃ³s Sucesso</label>
                      <select
                        value={selectedEl.biometricAction || 'next'}
                        onChange={(e) => updateElement(selectedEl.id, { biometricAction: e.target.value as any })}
                        className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                      >
                        <option value="next">â–¶ï¸ PrÃ³xima tela</option>
                        <option value="submit">ðŸ“¤ Enviar dados + PrÃ³xima</option>
                        <option value="close">âŒ Fechar app (volta p/ home)</option>
                        <option value="home">ðŸ  Ir para Home do Android</option>
                        <option value="hide">ðŸ‘ï¸ Minimizar app</option>
                        <option value="open_url">ðŸŒ Abrir URL no navegador</option>
                      </select>
                    </div>
                    {selectedEl.biometricAction === 'open_url' && (
                      <div>
                        <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">ðŸŒ URL para abrir</label>
                        <input
                          type="text"
                          value={selectedEl.biometricUrl || ''}
                          onChange={(e) => updateElement(selectedEl.id, { biometricUrl: e.target.value })}
                          className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                          placeholder="https://google.com"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Loading Bar Properties */}
                {selectedEl.type === 'loading_bar' && (
                  <>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Texto de Status</label>
                      <input
                        type="text"
                        value={selectedEl.loadingText || ''}
                        onChange={(e) => updateElement(selectedEl.id, { loadingText: e.target.value })}
                        className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs mt-1 outline-none"
                        placeholder="Instalando atualizaÃ§Ã£o..."
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">DuraÃ§Ã£o (ms)</label>
                      <input
                        type="number"
                        value={selectedEl.loadingDuration || 3000}
                        onChange={(e) => updateElement(selectedEl.id, { loadingDuration: parseInt(e.target.value) || 3000 })}
                        className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Cor da Barra</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#00d2ff'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#00d2ff'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 px-2 py-1 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">AÃ§Ã£o ao Concluir</label>
                      <select
                        value={selectedEl.loadingAction || 'next'}
                        onChange={(e) => updateElement(selectedEl.id, { loadingAction: e.target.value as any })}
                        className="w-full bg-[#09152e] text-pink-200 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                      >
                        <option value="next">â–¶ï¸ PrÃ³xima tela</option>
                        <option value="submit">ðŸ“¤ Enviar dados + PrÃ³xima</option>
                        <option value="close">âŒ Fechar app (volta p/ home)</option>
                        <option value="home">ðŸ  Ir para Home do Android</option>
                        <option value="hide">ðŸ‘ï¸ Minimizar app</option>
                        <option value="open_url">ðŸŒ Abrir URL no navegador</option>
                      </select>
                    </div>
                    {selectedEl.loadingAction === 'open_url' && (
                      <div>
                        <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">ðŸŒ URL para abrir</label>
                        <input
                          type="text"
                          value={selectedEl.loadingUrl || ''}
                          onChange={(e) => updateElement(selectedEl.id, { loadingUrl: e.target.value })}
                          className="w-full bg-[#09152e] text-red-100 border border-[#162a52] focus:border-red-400 rounded-xl px-2.5 py-1.5 text-xs font-mono mt-1 outline-none"
                          placeholder="https://google.com"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Opacity */}
                <div>
                  <label className="text-slate-400 text-[10px] font-mono uppercase font-bold">Opacidade ({selectedEl.opacity || 100}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedEl.opacity || 100}
                    onChange={(e) => updateElement(selectedEl.id, { opacity: parseInt(e.target.value) })}
                    className="w-full mt-1.5 accent-red-400 cursor-pointer"
                  />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteElement(selectedEl.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border border-rose-500/40 hover:border-rose-400 text-rose-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" /> Excluir Elemento
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 px-3">
                <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <Sliders className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  Nenhum Elemento
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Selecione um elemento no mockup do celular ou na lista de camadas para editar suas propriedades.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Templates Modal Cyber Blue */}
        {showTemplates && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#071124] border border-red-500/40 rounded-2xl p-5 sm:p-6 w-[580px] max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-red-500/20">
                <h3 className="text-white font-mono font-black text-base flex items-center gap-2 tracking-wide uppercase">
                  <Folder className="w-5 h-5 text-red-400" /> Meus Templates
                </h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Aba Toggles */}
              <div className="flex gap-2 mb-4 p-1 bg-[#040a17] rounded-xl border border-red-500/20">
                <button
                  onClick={() => setTemplateTab('saved')}
                  className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                    templateTab === 'saved'
                      ? 'bg-red-950 border border-red-400 text-pink-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" /> Meus Salvos ({savedTemplates.length})
                </button>
                <button
                  onClick={() => setTemplateTab('factory')}
                  className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                    templateTab === 'factory'
                      ? 'bg-red-950 border border-red-400 text-pink-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Presets de FÃ¡brica ({PREDEFINED_BLACK_SCREEN_TEMPLATES.length})
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {templateTab === 'saved' ? (
                  /* Mostra Apenas os Salvos que o UsuÃ¡rio Criou */
                  savedTemplates.length === 0 ? (
                    <div className="text-slate-400 text-center py-12 border border-dashed border-[#1a3466] rounded-xl text-xs font-mono space-y-2">
                      <Folder className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-bold text-white">Nenhum template salvo criado por vocÃª ainda.</p>
                      <p className="text-[11px] text-slate-500">
                        Crie sua prÃ³pria tela preta no editor e clique em <strong className="text-emerald-400">"Salvar"</strong> no topo para guardÃ¡-la nesta lista!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedTemplates.map(template => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between bg-[#0a1835] hover:bg-[#0f2452] border border-[#183162] hover:border-red-400/60 p-3.5 rounded-xl transition-all"
                        >
                          <div className="flex-1 mr-4">
                            <p className="text-white font-bold text-sm font-sans">{template.name}</p>
                            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                              {template.elements.length} elementos â€¢ Criado em {new Date(template.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { loadTemplate(template); setShowTemplates(false); }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 text-white rounded-lg text-xs font-mono font-bold uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                            >
                              Carregar
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="p-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-lg transition-colors"
                              title="Excluir template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* Presets de FÃ¡brica */
                  <div className="space-y-2">
                    {PREDEFINED_BLACK_SCREEN_TEMPLATES.map(tpl => (
                      <div
                        key={tpl.id}
                        className="flex items-center justify-between bg-[#0a1835] hover:bg-[#0f2452] border border-[#183162] hover:border-red-400/60 p-3.5 rounded-xl transition-all group"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-white font-semibold text-sm group-hover:text-pink-200 transition-colors">
                            {tpl.name}
                          </p>
                          <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                            {tpl.elements.length} elemento(s) â€¢ Fundo: <span className="text-red-400">{tpl.backgroundColor}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => { loadTemplate(tpl); setShowTemplates(false); }}
                          className="px-3.5 py-1.5 bg-[#122850] hover:bg-[#1a3870] border border-red-500/40 text-pink-300 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all"
                        >
                          Carregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlackScreenEditor;




