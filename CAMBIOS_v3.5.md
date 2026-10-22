CAMBIOS_v3.5.md
# CAMBIOS v3.5 — Kryptos Remote

## Resumen
Arreglo del bug por el que teléfonos instalados correctamente **no aparecían en el panel**.

## Causa raíz
Los APK compilados por `build_visual_apk_background` no creaban fila en `APKBuild`.
Al conectar, `register_device_on_connect` no encontraba el dueño y dejaba
`owner_id = NULL`. El endpoint `/api/devices` filtraba por
`owner_id == current_user.id`, así que esos dispositivos eran **invisibles**.
Agravado por `logging.basicConfig(level=ERROR)`, que ocultaba las conexiones.

## Síntoma
Teléfonos que se instalaban bien, con accesibilidad activa, pero no aparecían
en el panel. Unos sí, otros no.

## Parches aplicados
1. **register_device_on_connect** — fallback de `owner_id` cuando no hay `APKBuild` (evita el NULL).
2. **/api/devices** — no filtrar los dispositivos sin dueño (`or_(..., owner_id.is_(None))`).
3. **build_visual_apk_background** — inserta fila `APKBuild` (arregla la raíz).
4. **/ws** — sonda de log `[SONDA]` y manejo del `device_id` ausente.
5. **get_project_stats** — corregida indentación rota (el endpoint devolvía null).

## Verificación / regresión
```bat
venv\Scripts\python test_50_devices_load.py
venv\Scripts\python -c "import sqlite3;c=sqlite3.connect('gangstar_local.db');print('NULL:',c.execute('select count(*) from devices where owner_id is null').fetchone())"
```
Debe dar `NULL: (0,)`.

- Test de carga: 50/50 conectados, 0 errores.
- Emulador Android aparece en el panel.
- Teléfonos que antes fallaban ahora entran.

## Configuración por PC
Cada PC es un servidor independiente, con **su propia IP y su propia base de datos**.

En CADA PC:
1. `ipconfig` → coger la IPv4 local.
2. Editar `server\.env` con esa IP:
   ```
   SERVER_URL=http://IP:7771
   SERVER_WS_URL=ws://IP:7771/ws
   KRYPTOS_HOST=0.0.0.0
   KRYPTOS_PORT=7771
   DATABASE_URL=sqlite:///gangstar_local.db
   ```
3. Ejecutar `liberar_porta.bat` **como administrador** (abre el firewall).
4. Ejecutar `hospedar.bat` para arrancar.
5. Si la IP cambió, **regenerar los APK** para que apunten a la nueva.

## Correcciones pendientes en .bat
- `atualizar...bat` (paso 4/4): `http://:7771` → `http://IP:7771`
- `atualizar_frontend.bat` (línea ~106): mismo cambio.

## Qué copiar a otro PC
| Cosa | ¿Copiar? |
|---|---|
| Carpeta del proyecto | Sí |
| `server\gangstar_local.db` | Sí, para conservar datos |
| `server\.env` | Sí, cambiando la IP |
| `server\venv\` | No (se recrea con hospedar.bat) |
| `__pycache__`, `_emu` | No |

## Notas
- Si el PC se suspende o apaga, el servidor cae y los teléfonos se desconectan.
- Teléfonos fuera de la red local necesitan IP pública + redirección de puerto en el router, o ngrok.
- Emulador Android disponible para pruebas sin teléfono físico (AVD `test33`).