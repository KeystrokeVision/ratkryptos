"""
Sistema de autenticação com JWT e HWID
"""

from datetime import datetime, timedelta, UTC
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import get_db
from models import Operator

# Configurações
import os
import secrets

def _get_or_create_secret_key() -> str:
    env_secret = os.getenv("SECRET_KEY")
    if env_secret and env_secret.strip() and env_secret != "SUA_CHAVE_SECRETA_SUPER_SEGURA_AQUI_MUDAR_EM_PRODUCAO":
        return env_secret.strip()
    
    secret_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".jwt_secret")
    if os.path.exists(secret_file):
        try:
            with open(secret_file, "r", encoding="utf-8") as f:
                key = f.read().strip()
                if key and key != "SUA_CHAVE_SECRETA_SUPER_SEGURA_AQUI_MUDAR_EM_PRODUCAO":
                    return key
        except Exception:
            pass
            
    new_key = secrets.token_hex(32)
    try:
        with open(secret_file, "w", encoding="utf-8") as f:
            f.write(new_key)
    except Exception:
        pass
    return new_key

SECRET_KEY = _get_or_create_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

# Contexto de criptografia de senha - contorna bug do passlib+bcrypt no Python 3.12+
import bcrypt

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha usando bcrypt nativo para contornar bug do passlib no Python 3.12+"""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Gera hash de senha usando bcrypt nativo"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT"""
    to_encode = data.copy()
    
    # Atualizado para usar timezone-aware UTC
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def decode_token_username(token: str) -> Optional[str]:
    """Decodifica token JWT e retorna o username se for válido"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None

def create_2fa_token(username: str) -> str:
    """Cria token temporário de 5 minutos para validação 2FA"""
    expire = datetime.now(UTC) + timedelta(minutes=5)
    to_encode = {"sub": username, "type": "2fa_pending", "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_2fa_token(token: str) -> Optional[str]:
    """Valida e retorna o username do token 2FA temporário"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "2fa_pending":
            return None
        return payload.get("sub")
    except Exception:
        return None

import pyotp
import qrcode
import io
import base64

def generate_totp_secret() -> str:
    """Gera nova chave secreta base32 para Google Authenticator"""
    return pyotp.random_base32()

def generate_totp_qr_and_uri(username: str, secret: str, issuer_name: str = "Kryptos Remote") -> tuple[str, str]:
    """Gera URI e QR Code (Base64 data URL) para o Google Authenticator"""
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name=issuer_name)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    qr_data_url = f"data:image/png;base64,{img_b64}"
    
    return uri, qr_data_url

def verify_totp_code(secret: str, code: str) -> bool:
    """Verifica código de 6 dígitos do Google Authenticator com janela de tolerância de 1 ciclo"""
    if not secret or not code:
        return False
    clean_code = str(code).strip().replace(" ", "").replace("-", "")
    if len(clean_code) != 6 or not clean_code.isdigit():
        return False
    try:
        totp = pyotp.TOTP(secret)
        return bool(totp.verify(clean_code, valid_window=1))
    except Exception:
        return False


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Operator:
    """Obtém usuário atual do token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    operator = db.query(Operator).filter(Operator.username == username).first()
    if operator is None:
        raise credentials_exception
    
    # Verifica se está banido
    if operator.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta foi banida. Contate o administrador."
        )
    
    # Verifica se está ativo
    if not operator.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta está desativada."
        )
    
    return operator

def get_user_from_expired_token(token: str, db: Session) -> Optional[Operator]:
    """
    Obtém usuário mesmo de token expirado (para refresh).
    Valida assinatura mas ignora expiração.
    """
    try:
        # Decodifica ignorando expiração
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        username: str = payload.get("sub")
        if username is None:
            return None
        
        operator = db.query(Operator).filter(Operator.username == username).first()
        if operator is None:
            return None
        
        # Verifica se está banido
        if operator.is_banned:
            return None
        
        # Verifica se está ativo
        if not operator.is_active:
            return None
        
        return operator
    except JWTError:
        return None

def get_current_admin(current_user: Operator = Depends(get_current_user)) -> Operator:
    """Verifica se usuário atual é admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores."
        )
    return current_user
def authenticate_user(db: Session, username: str, password: str) -> Optional[Operator]:
    """Autentica usuário"""
    operator = db.query(Operator).filter(Operator.username == username).first()
    if not operator:
        return None
    if not verify_password(password, operator.hashed_password):
        return None
    return operator
def validate_hwid(operator: Operator, hwid: str) -> bool:
    """Valida HWID do usuário"""
    # Se não tem HWID registrado, precisa ativar
    if operator.hwid is None:
        return False
    # Verifica se HWID bate
    return operator.hwid == hwid
def activate_hwid(db: Session, operator: Operator, hwid: str) -> bool:
    """Ativa HWID para o usuário"""
    # Verifica se já tem HWID
    if operator.hwid is not None:
        return False
    
    # Verifica se HWID já está em uso por outro usuário
    existing = db.query(Operator).filter(Operator.hwid == hwid, Operator.id != operator.id).first()
    if existing:
        return False
    
    # Ativa HWID
    operator.hwid = hwid
    operator.hwid_activated_at = datetime.now(UTC)   # atualizado para timezone-aware
    db.commit()
    return True
