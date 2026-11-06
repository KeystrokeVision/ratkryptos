import io
p = r"C:\Users\user\kryptos\server\kryptos_launcher.py"
s = io.open(p, encoding="utf-8").read()
old = '''    def connect(self, server_id):
        s = next((x for x in _read() if x.get("id") == server_id), None)
        if not s:
            return {"ok": False, "msg": "Servidor no encontrado"}
        if not _ping(s):
            return {"ok": False, "msg": "Sin conexion al servidor"}
        token, need2fa = _login(s)
        url = _base_url(s) + "/"
        if token and not need2fa:
            payload = json.dumps({"token": token, "username": s.get("user", "")})
            url = url + "#/dashboard?kryptos=" + urllib.parse.quote(payload)
        return {"ok": True, "url": url, "id": server_id, "name": s.get("name", ""),
                "msg": ("Conectado como " + s.get("user", "")) if token else "Abriendo login"}'''
new = '''    def connect(self, server_id, code=None, tft=None):
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
        return {"ok": True, "url": url, "id": server_id, "name": s.get("name", ""), "msg": "Conectado"}'''
assert old in s, "connect no encontrado"
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("OK connect")