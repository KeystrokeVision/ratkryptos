# PENDIENTES

## Bugs confirmados en UiAssistBridge.java (watchdog del VNC)
- BUG1: el watchdog (watchdogRunnable) solo chequea CommandControlService.sInstance == null.
  No vigila silentScreenThread. Si el hilo muere con silentScreenActive=true, el VNC queda muerto.
  FIX: en watchdogRunnable, si silentScreenActive && (silentScreenThread == null || !isAlive()) -> reiniciar.
- BUG3: stopSilentScreenCapture() pone silentScreenThread=null antes de que el hilo termine.
  El hilo viejo al salir vuelve a poner null y pisa la referencia del hilo nuevo -> hilos duplicados o perdidos.
  FIX: join(500) al hilo antes de poner silentScreenThread=null.

## Persistencia del servidor (VPS)
- PASO1: INSTALAR_Y_ARRANCAR.bat: quitar el bucle :loop (el watchdog pasa a ser el unico supervisor).
- PASO1b: watchdog.py: cambiar el "kill de todos los python" por matar SOLO el proceso que escucha en 7771.
- PASO2: INSTALAR_Y_ARRANCAR.bat: registrar automaticamente la tarea GangstarServerWatchdog con setup_watchdog_task.ps1 si no existe.
- PASO3: verificar que el watchdog arranque main.py tambien en frio (post-reboot, sin RDP).

## Mas bugs del mismo watchdog (mismo archivo)
- BUG2: el catch del loop de captura solo atrapa Exception. Un OutOfMemoryError (comun con HardwareBuffer)
  mata el hilo y deja silentScreenActive=true. FIX: catch (Throwable) en el loop.
- BUG4: en startSilentScreenCapture, si instance==null se reintenta UNA sola vez y no reprograma.
  FIX: reintentar hasta 10 veces cada 1s.
- BUG5: onDestroy no drena SILENT_ENCODE_QUEUE -> se envian frames viejos al reconectar.
  FIX: llamar drainSilentEncodeQueue() en onDestroy.
