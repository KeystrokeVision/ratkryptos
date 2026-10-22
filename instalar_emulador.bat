@echo off
chcp 65001 >nul
setlocal

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "CMDTOOLS=%ANDROID_HOME%\cmdline-tools\latest\bin"
set "PATH=%PATH%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%CMDTOOLS%"
set "WORK=%~dp0_emu"
set "ZIP=%WORK%\cmdtools.zip"
set "EXT=%WORK%\extract"

echo ============================================================
echo   EMULADOR ANDROID - INSTALADOR TODO EN UNO
echo ============================================================
echo.

if not exist "%ANDROID_HOME%\emulator\emulator.exe" (
    echo [ERRO] No encuentro el emulador en %ANDROID_HOME%\emulator
    pause & exit /b 1
)
echo [OK] Emulador encontrado.

if not defined JAVA_HOME (
    if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
)
if defined JAVA_HOME (echo [OK] Java detectado.) else (echo [AVISO] Java no detectado.)

if not exist "%CMDTOOLS%\sdkmanager.bat" (
    echo [1/5] Descargando command-line tools...
    taskkill /F /IM powershell.exe >nul 2>&1
    if not exist "%WORK%" mkdir "%WORK%"
    if exist "%ZIP%" del /F /Q "%ZIP%" >nul 2>&1
    if exist "%EXT%" rmdir /S /Q "%EXT%" >nul 2>&1
    curl -L -o "%ZIP%" "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    if not exist "%ZIP%" ( echo [ERRO] Descarga fallida. & pause & exit /b 1 )
    echo       Extrayendo...
    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Expand-Archive -Path '%ZIP%' -DestinationPath '%EXT%' -Force"
    if not exist "%ANDROID_HOME%\cmdline-tools" mkdir "%ANDROID_HOME%\cmdline-tools"
    xcopy /E /I /Y "%EXT%\cmdline-tools" "%ANDROID_HOME%\cmdline-tools\latest" >nul
) else (
    echo [1/5] Command-line tools ya instaladas.
)

if not exist "%CMDTOOLS%\sdkmanager.bat" ( echo [ERRO] sdkmanager no encontrado. & pause & exit /b 1 )
echo       OK

echo [2/5] Aceptando licencias...
echo y | sdkmanager --sdk_root="%ANDROID_HOME%" --licenses >nul 2>&1

echo [3/5] Instalando platform-tools + imagen android-33 (~1 GB, tarda)...
sdkmanager --sdk_root="%ANDROID_HOME%" "platform-tools" "system-images;android-33;google_apis;x86_64"

echo [4/5] Creando emulador...
echo no | avdmanager create avd -n test33 -k "system-images;android-33;google_apis;x86_64" -d pixel_6

echo [5/5] Arrancando emulador...
emulator -avd test33

pause