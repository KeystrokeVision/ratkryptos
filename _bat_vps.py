import pathlib
p = pathlib.Path(r"C:\Users\Administrator\Desktop\kryptos_vps\INSTALAR_Y_ARRANCAR.bat")
s = p.read_text(encoding="utf-8", errors="ignore")
n = 0

if "-LocalPort 7771,8080" in s:
    s = s.replace("-LocalPort 7771,8080", "-LocalPort 7771"); n += 1
if "Liberando puertos 7771 y 8080" in s:
    s = s.replace("echo [5/10] Liberando puertos 7771 y 8080...",
                  "echo [5/10] Liberando puerto 7771 (8080 queda libre para BTMOB)..."); n += 1

a = "echo       [OK] Modo casa - IP local: !LOCAL_IP!   (publica: !DETECTED_IP!)"
b = "echo       [OK] Modo casa - IP local: !LOCAL_IP!   publica: !DETECTED_IP!"
if a in s: s = s.replace(a, b); n += 1
c = "echo       [INFO] Puerto 8080 ocupado (BTMOB activo) - no lanzo bypass."
d = "echo       [INFO] Puerto 8080 ocupado por BTMOB - no lanzo bypass."
if c in s: s = s.replace(c, d); n += 1

if 'set "USAR_IP_PUBLICA=0"' in s:
    s = s.replace('set "USAR_IP_PUBLICA=0"', 'set "USAR_IP_PUBLICA=1"'); n += 1

p.write_text(s, encoding="utf-8", errors="ignore")
print("[OK] ajustes aplicados:", n)
