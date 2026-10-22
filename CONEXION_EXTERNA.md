# CONEXION_EXTERNA.md

## Objetivo
Que CUALQUIER persona, desde cualquier red o país, instale la APK
y aparezca en tu panel web. Sin que esté en tu misma WiFi.

---

## ⚠️ LA REGLA DE ORO (léela antes de todo)

**La APK lleva la dirección del servidor DENTRO.**

- Si la dirección es una IP privada (`192.168.x.x`) → solo funciona en tu red.
- Si la dirección es una URL pública (ngrok) → funciona desde cualquier parte.
- **Cambias la dirección → tienes que REGENERAR la APK.**

Por eso tu amigo no podía: su APK llevaba `192.168.1.70`, que para él no existe.

---

## EL ÚNICO MÓDULO QUE HAY QUE CAMBIAR

Archivo: `server\.env`

### ❌ ANTES (solo red local)
```
SERVER_URL=http://192.168.1.70:7771
SERVER_WS_URL=ws://192.168.1.70:7771/ws
KRYPTOS_HOST=0.0.0.0
KRYPTOS_PORT=7771
DATABASE_URL=sqlite:///gangstar_local.db
```

### ✅ DESPUÉS (accesible desde cualquier red)
```
SERVER_URL=https://TU-URL.ngrok-free.app
SERVER_WS_URL=wss://TU-URL.ngrok-free.app/ws
KRYPTOS_HOST=0.0.0.0
KRYPTOS_PORT=7771
DATABASE_URL=sqlite:///gangstar_local.db
```

**Ojo a los dos detalles:**
- `http` → `https`
- `ws` → `wss`
- Cambia `TU-URL.ngrok-free.app` por tu URL real de ngrok.

Esos son los **únicos dos valores** que se cambian. El resto igual.

---

## CÓMO OBTENER LA URL (ngrok)

1. Descarga `ngrok.exe` desde https://ngrok.com/download
   y ponlo en la carpeta del proyecto.
2. Crea cuenta gratis y copia tu authtoken de
   https://dashboard.ngrok.com/get-started/your-authtoken
3. Configúralo (una sola vez):
   ```
   ngrok config add-authtoken TU_TOKEN
   ```
4. Arranca el servidor.
5. En OTRA consola:
   ```
   ngrok http 7771
   ```
6. Copia la URL que aparece, ejemplo:
   `https://a1b2c3d4.ngrok-free.app`

---

## PASOS COMPLETOS, EN ORDEN

1. Arranca el servidor.
2. Arranca `ngrok http 7771` y copia la URL.
3. Edita `server\.env` con esa URL (bloque ✅ de arriba).
4. Reinicia el servidor.
5. **Regenera la APK** desde el panel (ahora lleva la URL pública).
6. Envía la APK por WhatsApp / Telegram / Drive.
7. La otra persona la instala y activa **Accesibilidad**.
8. Aparece en tu panel. ✅

---

## VERIFICACIÓN (antes de enviar)

Abre la URL de ngrok **desde un móvil con datos móviles** (sin WiFi).
Si carga el panel → funciona desde fuera. Si no carga, revisa que
ngrok siga corriendo.

---

## QUÉ HACE LA OTRA PERSONA

Nada técnico. Solo:
1. Instala la APK.
2. Activa el permiso de **Accesibilidad**.

No configura IPs ni nada.

---

## AVISOS IMPORTANTES

- **El servidor y ngrok deben estar corriendo a la vez.** Si cierras uno, se cae.
- Si reinicias ngrok (plan gratis), **la URL cambia** → actualiza el `.env`
  y **regenera la APK**.
- Si el PC se suspende o apaga, todos se desconectan.
- Solo una instancia del servidor a la vez.
- Las APK viejas siguen apuntando a la dirección vieja: hay que reemplazarlas.

---

## SI ALGUIEN NO APARECE

1. Mira en la BD si hay fila:
   ```
   select device_id, owner_id from devices;
   ```
   - **No hay fila** → no conecta (revisa red, ngrok, o que el sistema no
     haya matado la app).
   - **Hay fila** → conecta bien; mira el panel.
2. ¿La URL del `.env` es alcanzable desde fuera? (pruébala con datos móviles).
3. ¿La APK se generó DESPUÉS de poner la URL pública?

---

## ALTERNATIVA: IP PÚBLICA + ROUTER

Si prefieres no usar ngrok:
1. `curl ifconfig.me` → tu IP pública.
2. Router → Redirección de puertos → 7771 TCP → 192.168.1.70.
3. `liberar_porta.bat` como administrador.
4. `.env` con tu IP pública:
   ```
   SERVER_URL=http://TU_IP_PUBLICA:7771
   SERVER_WS_URL=ws://TU_IP_PUBLICA:7771/ws
   ```
5. Regenera la APK.

Funciona, pero si tu IP cambia o tu operador usa CGNAT, se rompe.
Para máxima compatibilidad, **ngrok**.