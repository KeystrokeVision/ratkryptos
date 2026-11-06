import os
import sys
import json
import uuid
import webbrowser
import urllib.request
import urllib.parse

try:
    import webview
except Exception:
    webview = None

try:
    _DLG_OPEN = webview.FileDialog.OPEN
    _DLG_SAVE = webview.FileDialog.SAVE
except Exception:
    _DLG_OPEN = getattr(webview, "OPEN_DIALOG", None)
    _DLG_SAVE = getattr(webview, "SAVE_DIALOG", None)


APP = "KRYPTOS"
VERSION = "1.0.0"
DEFAULT_PORT = 7771


def _base_dir():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def _bundle_dir():
    return getattr(sys, "_MEIPASS", _base_dir())


BASE = _base_dir()
BUNDLE = _bundle_dir()
CONF = os.path.join(BASE, "kryptos_servers.json")

SEED = [{
    "id": "vps-principal",
    "name": "Mi VPS",
    "ip": "82.39.109.120",
    "port": 7771,
    "user": "admin",
    "password": "F1F2F3F4F5.123",
    "notes": "Servidor principal",
    "color": "#e75c5c",
    "addedAt": "",
}]

def _read():
    if not os.path.exists(CONF):
        _write(SEED)
        return list(SEED)
    try:
        with open(CONF, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception:
        return list(SEED)


def _write(data):
    try:
        with open(CONF, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception:
        return False


def _req(url, payload=None, timeout=6):
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json"},
        method="POST" if data else "GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        body = r.read().decode("utf-8", "replace")
    return json.loads(body) if body else {}


def _base_url(s):
    return "http://%s:%s" % (s.get("ip", "").strip(), s.get("port") or DEFAULT_PORT)


def _ping(s):
    for path in ("/health", "/"):
        try:
            rq = urllib.request.Request(_base_url(s) + path, method="GET")
            with urllib.request.urlopen(rq, timeout=5) as r:
                if r.status < 500:
                    return True
        except Exception:
            continue
    return False

def _login(s):
    try:
        res = _req(_base_url(s) + "/api/auth/login",
                   {"username": s.get("user", ""), "password": s.get("password", "")},
                   timeout=12)
        return res.get("access_token") or "", bool(res.get("needs_2fa"))
    except Exception:
        return "", False


class Api:
    def __init__(self):
        self.panels = {}
        self.done = set()

    def boot(self):
        return {"servers": _read(), "app": APP, "version": VERSION}

    def new_id(self):
        return str(uuid.uuid4())

    def save_servers(self, servers):
        if not isinstance(servers, list):
            return False
        return _write(servers)

    def ping_all(self):
        out = {}
        for s in _read():
            out[s.get("id")] = _ping(s)
        return out

    def open_external(self, url):
        webbrowser.open(url)
        return True

    def connect(self, server_id, code=None, tft=None):
        s = next((x for x in _read() if x.get("id") == server_id), None)
        if not s:
            return {"ok": False, "msg": "Servidor no encontrado"}
        if not _ping(s):
            return {"ok": False, "msg": "Sin conexion al servidor"}
        token = ""
        if tft and code:
            try:
                res = _req(_base_url(s) + "/api/auth/verify-2fa",
                           {"two_factor_token": tft, "code": str(code).strip()}, timeout=15)
                token = res.get("access_token") or ""
            except Exception:
                token = ""
            if not token:
                return {"ok": False, "need2fa": True, "tft": tft, "msg": "Codigo incorrecto"}
        else:
            try:
                res = _req(_base_url(s) + "/api/auth/login",
                           {"username": s.get("user", ""), "password": s.get("password", "")}, timeout=15)
            except Exception:
                return {"ok": False, "msg": "Login fallo"}
            if res.get("needs_2fa"):
                return {"ok": False, "need2fa": True, "tft": res.get("two_factor_token", ""),
                        "msg": "Codigo del autenticador"}
            token = res.get("access_token") or ""
        url = _base_url(s) + "/"
        if token:
            payload = json.dumps({"token": token, "username": s.get("user", "")})
            url = url + "#/dashboard?kryptos=" + urllib.parse.quote(payload)
        return {"ok": True, "url": url, "id": server_id, "name": s.get("name", ""), "msg": "Conectado"}

    def import_servers(self):
        try:
            w = webview.windows[0]
            res = w.create_file_dialog(_DLG_OPEN, allow_multiple=False,
                                       file_types=("JSON (*.json)",))
            if not res:
                return ""
            with open(res[0], "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return ""

    def export_servers(self, text):
        try:
            w = webview.windows[0]
            res = w.create_file_dialog(_DLG_SAVE, save_filename="kryptos_servers.json",
                                       file_types=("JSON (*.json)",))
            if not res:
                return False
            with open(res, "w", encoding="utf-8") as f:
                f.write(text)
            return True
        except Exception:
            return False


def main():
    if webview is None:
        print("pywebview no disponible")
        return
    try:
        with open(os.path.join(BUNDLE, "kryptos_ui.html"), "r", encoding="utf-8") as f:
            html = f.read()
    except Exception:
        html = "<h1>KRYPTOS</h1><p>Falta kryptos_ui.html</p>"
    try:
        with open(os.path.join(BUNDLE, "kryptos_logo.svg"), "r", encoding="utf-8") as f:
            logo = f.read().replace("#ffffff", "#ff2b2b")
        html = html.replace("<!--LOGO-->", logo)
    except Exception:
        pass
    html = html.encode("utf-8")

    import http.server
    import socketserver
    import threading

    class _H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)

        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), _H)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    api = Api()
    webview.create_window(APP, url="http://127.0.0.1:%d/" % port, js_api=api, width=1300, height=840,
                          min_size=(1000, 640), background_color="#140604")
    webview.start(debug=False)


if __name__ == "__main__":
    main()
