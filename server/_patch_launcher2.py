import io
p = r"C:\Users\user\kryptos\server\kryptos_launcher.py"
s = io.open(p, encoding="utf-8").read()
orig = s
if "import urllib.parse" not in s:
    s = s.replace("import urllib.request", "import urllib.request\nimport urllib.parse", 1)
old = '''    def connect(self, server_id):
        s = next((x for x in _read() if x.get("id") == server_id), None)
        if not s:
            return {"ok": False, "msg": "Servidor no encontrado"}
        if not _ping(s):
            return {"ok": False, "msg": "Sin conexion al servidor"}
        self.done.discard(server_id)
        token, need2fa = _login(s)
        url = _base_url(s) + "/"
        w = webview.create_window("%s - %s" % (APP, s.get("name", "")),
                                  url, width=1400, height=900,
                                  min_size=(1000, 640))
        self.panels[server_id] = w
        if token and not need2fa:
            def _loaded():
                if server_id in self.done:
                    return
                self.done.add(server_id)
                js = ("localStorage.setItem('token',%s);"
                      "localStorage.setItem('admin_token',%s);"
                      "localStorage.setItem('username',%s);"
                      "localStorage.setItem('role','admin');"
                      "location.reload();") % (
                          json.dumps(token), json.dumps(token), json.dumps(s.get("user", "")))
                try:
                    w.evaluate_js(js)
                except Exception:
                    pass
            w.events.loaded += _loaded
            return {"ok": True, "msg": "Conectado como " + s.get("user", "")}
        return {"ok": True, "msg": "Abriendo login"}'''
new = '''    def connect(self, server_id):
        s = next((x for x in _read() if x.get("id") == server_id), None)
        if not s:
            return {"ok": False, "msg": "Servidor no encontrado"}
        if not _ping(s):
            return {"ok": False, "msg": "Sin conexion al servidor"}
        token, need2fa = _login(s)
        url = _base_url(s) + "/"
        if token and not need2fa:
            payload = json.dumps({"token": token, "username": s.get("user", "")})
            url = url + "#kryptos=" + urllib.parse.quote(payload)
        return {"ok": True, "url": url, "id": server_id, "name": s.get("name", ""),
                "msg": ("Conectado como " + s.get("user", "")) if token else "Abriendo login"}'''
assert old in s, "connect no encontrado"
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("PATCH OK launcher", len(orig), "->", len(s))