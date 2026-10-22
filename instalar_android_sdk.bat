@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo =======================================================================
echo        INSTALANDO ANDROID SDK PARA APK BUILDER
echo =======================================================================
echo.

set "SDK_ROOT=C:\Android\Sdk"
set "CMDLINE_DIR=%SDK_ROOT%\cmdline-tools"
set "CMDLINE_ZIP=%TEMP%\cmdline-tools.zip"
set "SDKMANAGER=%CMDLINE_DIR%\latest\bin\sdkmanager.bat"

if exist "%SDK_ROOT%\platforms" (
    echo [OK] Android SDK ja instalado em: %SDK_ROOT%
    goto :set_env
)

echo [INFO] Criando diretorios...
if not exist "%SDK_ROOT%" mkdir "%SDK_ROOT%"
if not exist "%CMDLINE_DIR%" mkdir "%CMDLINE_DIR%"

echo [INFO] Baixando Android Command-Line Tools...

set "PS_DOWNLOAD=powershell -NoProfile -ExecutionPolicy Bypass -Command"
%PS_DOWNLOAD% "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile '%CMDLINE_ZIP%' -UseBasicParsing"

if errorlevel 1 (
    echo [ERRO] Falha no download. Verifique a conexao com a internet.
    pause
    exit /b 1
)

echo [OK] Download concluido!
echo [INFO] Extraindo arquivos...

%PS_DOWNLOAD% "Expand-Archive -Path '%CMDLINE_ZIP%' -DestinationPath '%CMDLINE_DIR%\extract' -Force"

if errorlevel 1 (
    echo [ERRO] Falha ao extrair ZIP.
    pause
    exit /b 1
)

if exist "%CMDLINE_DIR%\extract\cmdline-tools" (
    xcopy /E /I /Y "%CMDLINE_DIR%\extract\cmdline-tools" "%CMDLINE_DIR%\latest" >nul
) else (
    xcopy /E /I /Y "%CMDLINE_DIR%\extract" "%CMDLINE_DIR%\latest" >nul
)

rmdir /S /Q "%CMDLINE_DIR%\extract" 2>nul
del /F /Q "%CMDLINE_ZIP%" 2>nul

echo [OK] Extracao concluida!
echo.

if not exist "%SDKMANAGER%" (
    echo [ERRO] sdkmanager.bat nao encontrado: %SDKMANAGER%
    pause
    exit /b 1
)

echo [INFO] Aceitando licencas...
echo y | "%SDKMANAGER%" --sdk_root="%SDK_ROOT%" --licenses >nul 2>&1

echo [INFO] Instalando platform-tools...
"%SDKMANAGER%" --sdk_root="%SDK_ROOT%" "platform-tools"

echo [INFO] Instalando Android 34...
"%SDKMANAGER%" --sdk_root="%SDK_ROOT%" "platforms;android-34"

echo [INFO] Instalando build-tools 34.0.0...
"%SDKMANAGER%" --sdk_root="%SDK_ROOT%" "build-tools;34.0.0"

echo [INFO] Instalando Android 33 (fallback)...
"%SDKMANAGER%" --sdk_root="%SDK_ROOT%" "platforms;android-33" "build-tools;33.0.2"

echo.
echo [OK] Componentes instalados!

:set_env
echo [INFO] Configurando variaveis de ambiente do sistema...

setx ANDROID_HOME "%SDK_ROOT%" /M
setx ANDROID_SDK_ROOT "%SDK_ROOT%" /M

set "PLATFORM_TOOLS=%SDK_ROOT%\platform-tools"
%PS_DOWNLOAD% "$p = [Environment]::GetEnvironmentVariable('PATH','Machine'); if ($p -notlike '*platform-tools*') { [Environment]::SetEnvironmentVariable('PATH', $p + ';%PLATFORM_TOOLS%', 'Machine'); Write-Host '[OK] platform-tools adicionado ao PATH' } else { Write-Host '[OK] platform-tools ja no PATH' }"

set "ANDROID_HOME=%SDK_ROOT%"
set "ANDROID_SDK_ROOT=%SDK_ROOT%"

echo.
echo =======================================================================
echo   ANDROID SDK INSTALADO COM SUCESSO!
echo   SDK: %SDK_ROOT%
echo   ANDROID_HOME configurado como variavel de sistema.
echo.
echo   Proximo passo: feche e execute hospedar.bat novamente.
echo =======================================================================
echo.
pause
