# KRYPTOS REMOTE 4.5 - GUIA COMPLETA
### Como instalarlo en un VPS y como usarlo (explicado paso a paso)

Ultima actualizacion: 17/10/2026
Puerto: 7771

=======================================================================
## PARTE 1 - QUE ES ESTO (leelo una vez)
=======================================================================

Es un PANEL WEB de control remoto.

- Vos lo pones en un VPS (una computadora prendida 24 horas, conectada a
  internet, con una IP publica). Alquilado, no tuya.
- Tus clientes entran con un LINK y una CLAVE desde el navegador.
- Ellos instalan un APK en su celular.
- Desde el panel vos controlas esos celulares.

Nada de Tailscale. Nada de dominio. Solo IP + puerto.

=======================================================================
## PARTE 2 - LOS 2 LINKS IMPORTANTES (guardalos)
=======================================================================

### 2.1 - TU LINK (para crear usuarios)
    http://192.168.1.70:7771/#/admin

### 2.2 - EL LINK QUE LE MANDAS AL CLIENTE
    http://192.168.1.70:7771/

OJO: los links llevan una almohadilla (#). Es normal, no la borres.

=======================================================================
## PARTE 3 - CONSEGUIR EL VPS
=======================================================================

Necesitas un VPS con Windows. Recomendado:

- Windows Server 2019 o 2022
- 4 vCPU / 8 GB de RAM / 60 GB de disco
- IP publica

Proveedores (precio aprox):
| Proveedor | Precio | Notas |
|---|---|---|
| Contabo | ~9 EUR/mes | Barato, mucha RAM |
| Hetzner Cloud | ~14 EUR/mes | Confiable |
| Vultr | ~16 USD/mes | Buen panel |
| DigitalOcean | ~16 USD/mes | Facil |

Cuando lo contratas, te llega un mail con:
- IP publica  (ANOTALA)
- Usuario administrador  (ANOTALO)
- Contrasena  (ANOTALA)

=======================================================================
## PARTE 4 - CONECTARTE AL VPS
=======================================================================

1. En tu PC apreta la tecla Windows y escribi: mstsc
2. Enter. Se abre "Conexion a Escritorio Remoto".
3. En "Equipo" pone la IP del VPS.
4. Pone el usuario y la contrasena que te dio el proveedor.
5. Ya estas adentro del VPS (ves otro Windows, es normal).

=======================================================================
## PARTE 5 - PREPARAR EL VPS (2 cosas, no te saltees)
=======================================================================

### 5.1 Instalar Python
1. Abri el navegador DENTRO del VPS y anda a https://www.python.org/downloads/
2. Descarga Python 3.12 y ejecutalo.
3. MUY IMPORTANTE: en la primer pantalla del instalador MARCA la casilla
   "Add Python to PATH". Si no la marcas, no funciona.
4. Click en "Install Now" y espera.
5. Para verificar: abri CMD y escribi  python --version
   Tiene que responder algo como "Python 3.12.x"

### 5.2 Excluir el proyecto del Defender
Defender escanea cada archivo y hace el build del APK lentisimo.
1. Seguridad de Windows -> Proteccion antivirus y amenazas
2. Administrar la configuracion -> Exclusiones -> Agregar exclusion -> Carpeta
3. Elegis  C:\kryptos

=======================================================================
## PARTE 6 - SUBIR EL PROYECTO
=======================================================================

Subi TODO el proyecto a la carpeta  C:\kryptos\  del VPS.
(Podes copiar/pegar por RDP, o usar FileZilla.)

SI subir:
- la carpeta  server\
- la carpeta  android-rat\
- el archivo INSTALAR_Y_ARRANCAR.bat
- el archivo atualizar_frontend.bat
- el archivo INICIAR_PROJETO.bat

NO subir:
- venv\            (el .bat lo crea solo en el VPS)
- __pycache__\
- node_modules\

Si queres conservar los usuarios que ya creaste, subi tambien:
- server\gangstar_local.db
- server\gangstar_local.db-wal
- server\gangstar_local.db-shm

Si no los subis, el .bat crea la base de datos de cero.

=======================================================================
## PARTE 7 - INSTALAR Y ARRANCAR (esto hace todo solo)
=======================================================================

1. Entra a C:\kryptos\
2. Doble clic en INSTALAR_Y_ARRANCAR.bat
3. Va a pedir permisos de administrador. Acepta (Si / Yes).
4. Espera. Va a tardar unos minutos. NO cierres la ventana.

El .bat hace solo:
- Abre los puertos en el Firewall de Windows
- Instala el Android SDK
- Crea el entorno de Python e instala las dependencias
- DETECTA TU IP PUBLICA y escribe el archivo .env
- Crea la base de datos y el usuario admin
- Arranca el servidor y lo reinicia solo si se cae

Cuando termine, va a mostrar:
    SERVIDOR RODANDO
    Local:  http://localhost:7771
    Rede:   http://TU_IP_PUBLICA:7771

=======================================================================
## PARTE 8 - ABRIR EL PUERTO EN EL PROVEEDOR  (LO MAS IMPORTANTE)
=======================================================================

Si no haces ESTO, nadie de afuera va a poder entrar, aunque todo lo
demas este perfecto.

1. Anda al PANEL WEB del proveedor (Contabo / Hetzner / Vultr / etc.)
2. Busca la seccion "Firewall" o "Seguridad" o "Red" de tu VPS.
3. Crea una regla:
       Protocolo: TCP
       Puerto:    7771
       Origen:    cualquier (0.0.0.0/0)
4. Guarda.

=======================================================================
## PARTE 9 - PROBAR QUE ANDA
=======================================================================

1. En el VPS, abri CMD y escribi:
       netstat -ano | findstr :7771
   Tiene que aparecer LISTENING.

2. Agarra tu celular, APAGA EL WIFI y usa DATOS MOVILES.
   (asi probas desde internet de verdad)

3. Abri en el navegador del celu:
       http://192.168.1.70:7771
   Tiene que cargar el panel ROJO con el logo KRYPTOS.

Si carga en el celular con datos = perfecto, ya esta en internet.
Si NO carga = volve a la PARTE 8, el puerto esta cerrado.

=======================================================================
## PARTE 10 - QUE ARRANQUE SOLO CUANDO EL VPS SE REINICIA
=======================================================================

1. Abri el "Programador de tareas" del VPS.
2. Click en "Crear tarea".
3. Nombre: KRYPTOS
4. Pestana "General" -> tilda "Ejecutar con privilegios mas altos".
5. Pestana "Desencadenadores" -> Nuevo -> "Al iniciar el sistema" -> Aceptar.
6. Pestana "Acciones" -> Nuevo -> "Iniciar un programa" ->
   Programa:  C:\kryptos\INSTALAR_Y_ARRANCAR.bat
7. Aceptar. Te va a pedir la contrasena de Windows: ponela.

Listo: si el VPS se reinicia, el panel arranca solo.

=======================================================================
## PARTE 11 - USAR EL PANEL: CREAR USUARIOS Y VENDER
=======================================================================

### 11.1 Entrar como admin
1. Abri:  http://192.168.1.70:7771/#/admin
2. Usuario: admin      Clave: admin
3. Cambia la clave apenas entres (viene admin/admin).

### 11.2 Crear un usuario (un cliente)
1. Ya estas en la pantalla de admin (link de arriba).
2. Click en "Crear usuario" / "Nuevo usuario".
3. Completa:
       Usuario:    pepe
       Email:      pepe@mail.com
       Contrasena: (la que le vas a pasar)
       Dias:       30   (los dias que dura la licencia)
4. Guardar.

### 11.3 Mandarle el link al cliente
Copiale este mensaje y mandaselo (WhatsApp, Telegram, etc.):

    --------------------------
    Panel:    http://192.168.1.70:7771/
    Usuario:  pepe
    Clave:    (la que pusiste)
    --------------------------

El cliente entra, se loguea, y ahi ve SOLO sus dispositivos y sus APKs.

=======================================================================
## PARTE 12 - GENERAR EL APK (el programa que instala el cliente)
=======================================================================

1. Entra al panel logueado (con tu usuario admin).
2. En el menu del panel busca "APK" o "Builder" y abrilo.
3. Elegi el usuario/dispositivo y genera el APK.
4. En la ventana negra del servidor tiene que aparecer algo asi:
       [URL] URL do servidor atualizada: ws://192.168.1.70:7771/ws?build_id=XXXX
5. Cuando termine, descarga el APK y mandaselo al cliente.

El cliente lo instala en el celular. Si Play Protect dice algo, toca
"Instalar de todas formas".

OJO: el APK tiene la IP grabada adentro. Si cambia la IP del VPS, hay
que generar TODOS los APKs de nuevo.

=======================================================================
## PARTE 13 - SEGURIDAD (hacelo, no lo dejes para despues)
=======================================================================

1. Cambia la clave del admin (admin/admin).
2. Cambia la contrasena del usuario Windows del VPS.
3. Cada cliente configura Google Authenticator (2FA) la primera vez.
4. Hace un backup de la base de datos todos los dias
   (Programador de tareas -> copiar gangstar_local.db a otra carpeta).

=======================================================================
## PARTE 14 - ACTUALIZAR EL PANEL EN EL FUTURO
=======================================================================

Cuando cambies algo del frontend en tu PC:

1. En tu PC, doble clic a  atualizar_frontend.bat
   (te va a pedir la carpeta del VPS y detecta la IP publica sola)
2. En el VPS: cerra la ventana del servidor y abri
   INSTALAR_Y_ARRANCAR.bat de nuevo.

=======================================================================
## PARTE 15 - SI CAMBIA LA IP DEL VPS
=======================================================================

1. Corre atualizar_frontend.bat (o edita C:\kryptos\server\.env a mano)
2. Reinicia el servidor.
3. Genera TODOS los APKs de nuevo.

=======================================================================
## PARTE 16 - SI ALGO FALLA
=======================================================================

| Sintoma | Causa | Solucion |
|---|---|---|
| Nadie entra desde afuera | Puerto 7771 cerrado en el proveedor | PARTE 8 |
| Panel en blanco | El servidor se cayo | Abri INSTALAR_Y_ARRANCAR.bat de nuevo |
| El APK instala pero no aparece en el panel | APK con IP vieja | Genera el APK de nuevo |
| El APK no conecta | Falta cleartext | Ya esta en el manifest; regenera el APK |
| "Puerto 10048" al arrancar | Servidor viejo abierto | taskkill /F /IM python.exe |
| Accesibilidad en gris | Ajustes restringidos | Ajustes -> Apps -> la app -> Permitir ajustes restringidos |
| Play Protect bloquea | APK sin firmar | "Instalar de todas formas" |
| El build del APK es lentisimo | Defender | Exclusion de C:\kryptos (PARTE 5.2) |

=======================================================================
## PARTE 17 - COMANDOS UTILES (en el VPS)
=======================================================================

    netstat -ano | findstr :7771      (ver si el server esta escuchando)
    tasklist | findstr python         (ver si python corre)
    taskkill /F /IM python.exe        (matar el server)
    type C:\kryptos\server\.env       (ver la config)

=======================================================================
## PARTE 18 - CHECKLIST FINAL
=======================================================================

- [ ] VPS Windows contratado (8 GB RAM)
- [ ] Python 3.12 instalado con "Add to PATH"
- [ ] C:\kryptos excluido del Defender
- [ ] Proyecto subido a C:\kryptos\
- [ ] INSTALAR_Y_ARRANCAR.bat corrido sin errores
- [ ] Puerto 7771 abierto en Windows Firewall Y EN EL PROVEEDOR
- [ ] Tarea programada para auto-arranque
- [ ] Panel carga desde el celular con datos
- [ ] Clave del admin cambiada
- [ ] Usuario de prueba creado
- [ ] APK de prueba generado e instalado en un celular ajeno
- [ ] Ese celular APARECE en el panel

=======================================================================
## RESUMEN EN 7 PASOS
=======================================================================

1. Contrata el VPS Windows, anota IP / usuario / contrasena.
2. Instala Python 3.12 (con "Add to PATH") y exclui C:\kryptos del Defender.
3. Subi todo el proyecto a C:\kryptos\.
4. Doble clic a INSTALAR_Y_ARRANCAR.bat.
5. Abri el puerto 7771 en el panel del proveedor.
6. Proba desde el celular con datos.
7. Crea usuarios y genera los APKs.

FIN.
