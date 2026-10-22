"""Configuracao central Gangastar Remote — VPS (PostgreSQL + URLs publicas)."""
from __future__ import annotations
def _kryptos_env(key: str) -> str:
    """[KRYPTOS-PATCH] lee una clave PRIMERO del .env del proyecto, luego de os.environ."""
    try:
        from pathlib import Path as _Path
        here = _Path(__file__).resolve()
        for cand in (here.parent.parent / ".env", here.parent / ".env", _Path.cwd() / ".env"):
            if cand.is_file():
                for line in cand.read_text(encoding="utf-8-sig", errors="ignore").splitlines():
                    s = line.strip()
                    if not s or s.startswith("#") or "=" not in s:
                        continue
                    k, val = s.split("=", 1)
                    if k.strip().lstrip(chr(0xFEFF)) == key:
                        v = val.strip().strip('"').strip("'")
                        if v:
                            return v
    except Exception:
        pass
    try:
        import os as _os
        return (_os.environ.get(key) or "").strip()
    except Exception:
        return ""


import os
from pathlib import Path

_SERVER_DIR = Path(__file__).resolve().parent

def _get_fallback_public_url() -> str:
    try:
        import urllib.request
        with urllib.request.urlopen("https://api.ipify.org", timeout=3) as resp:
            ip = resp.read().decode("utf-8").strip()
            if ip:
                return f"http://{ip}:7771"
    except Exception:
        pass
    return "http://127.0.0.1:7771"

DEFAULT_PUBLIC_URL = _get_fallback_public_url()
DEFAULT_DATABASE_URL = "sqlite:///gangstar_local.db"


def _load_env_file(path: Path, overwrite: bool = True) -> None:
    """Carrega .env — insere valores no ambiente."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        k = key.strip()
        v = val.strip().strip('"').strip("'")
        if overwrite or k not in os.environ:
            os.environ[k] = v


def bootstrap() -> None:
    """Carrega .env.vps como fallback primeiro, e depois .env para que .env prevaleça."""
    _load_env_file(_SERVER_DIR / ".env.vps", overwrite=False)
    _load_env_file(_SERVER_DIR / ".env", overwrite=True)
    os.environ.setdefault("DATABASE_URL", DEFAULT_DATABASE_URL)
    os.environ.setdefault("SERVER_URL", DEFAULT_PUBLIC_URL)
    os.environ.setdefault("KRYPTOS_PROFILE", "vps")


bootstrap()


def public_base_url() -> str:
    # [KRYPTOS-PATCH] forzar base desde .env
    _forced = _kryptos_env("PUBLIC_BASE_URL") or _kryptos_env("SERVER_URL")
    if _forced:
        return _forced.rstrip("/")
    return os.environ.get("SERVER_URL", DEFAULT_PUBLIC_URL).rstrip("/")


def public_http_url() -> str:
    url = public_base_url()
    if url.startswith("ws://"):
        return "http://" + url[5:].split("/")[0]
    if url.startswith("wss://"):
        return "https://" + url[6:].split("/")[0]
    return url


def public_ws_url(extra_query: str = "") -> str:
    # [KRYPTOS-PATCH] forzar ws desde .env
    _forced_ws = _kryptos_env("PUBLIC_WS_URL") or _kryptos_env("SERVER_WS_URL")
    if _forced_ws:
        _u = _forced_ws.rstrip("/")
        if extra_query:
            _u += ("&" if "?" in _u else "?") + extra_query.lstrip("?")
        return _u
    raw = os.environ.get("SERVER_WS_URL", "").strip()
    if raw:
        base = raw.rstrip("/")
        if not base.endswith("/ws"):
            base += "/ws"
    else:
        http = public_http_url()
        if http.startswith("https://"):
            base = http.replace("https://", "wss://", 1) + "/ws"
        else:
            base = http.replace("http://", "ws://", 1) + "/ws"

    if extra_query:
        sep = "&" if "?" in base else "?"
        return f"{base}{sep}{extra_query.lstrip('?')}"
    return base


def database_url() -> str:
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)
