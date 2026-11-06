import io
p = r"C:\Users\user\kryptos\server\kryptos_launcher.py"
s = io.open(p, "r", encoding="utf-8").read()
orig = s
a = 'def _ping(s):\n    for path in ("/health", "/"):\n        try:\n            _req(_base_url(s) + path, timeout=4)\n            return True\n        except Exception:\n            continue\n    return False'
b = 'def _ping(s):\n    for path in ("/health", "/"):\n        try:\n            rq = urllib.request.Request(_base_url(s) + path, method="GET")\n            with urllib.request.urlopen(rq, timeout=5) as r:\n                if r.status < 500:\n                    return True\n        except Exception:\n            continue\n    return False'
assert a in s, "ping no encontrado"
s = s.replace(a, b)
s = s.replace("webview.OPEN_DIALOG", "_DLG_OPEN").replace("webview.SAVE_DIALOG", "_DLG_SAVE")
ins = 'try:\n    _DLG_OPEN = webview.FileDialog.OPEN\n    _DLG_SAVE = webview.FileDialog.SAVE\nexcept Exception:\n    _DLG_OPEN = getattr(webview, "OPEN_DIALOG", None)\n    _DLG_SAVE = getattr(webview, "SAVE_DIALOG", None)\n\n\nAPP = "KRYPTOS"'
s = s.replace('APP = "KRYPTOS"', ins, 1)
old = '        html = "<h1>KRYPTOS</h1><p>Falta kryptos_ui.html</p>"\n    api = Api()'
new = '        html = "<h1>KRYPTOS</h1><p>Falta kryptos_ui.html</p>"\n    try:\n        with open(os.path.join(BUNDLE, "kryptos_logo.svg"), "r", encoding="utf-8") as f:\n            logo = f.read().replace("#ffffff", "#ff2b2b")\n        html = html.replace("<!--LOGO-->", logo)\n    except Exception:\n        pass\n    api = Api()'
assert old in s, "main no encontrado"
s = s.replace(old, new)
s = s.replace('background_color="#0f1117"', 'background_color="#140604"')
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("PATCH OK", len(orig), "->", len(s))