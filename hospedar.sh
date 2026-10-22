@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Gangstar Remote - Auto Hospedagem

echo =======================================================================
echo               ATIVANDO AUTO-HOSPEDAGEM DO PROJETO
echo =======================================================================
echo.

REM ============ 1. Localizar pasta do servidor ============
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "SERVER_DIR="

if exist "%SCRIPT_DIR%\finalvnc\finalvnc\server\main.py" set "SERVER_DIR=%SCRIPT_DIR%\finalvnc\finalvnc\server"
if not defined SERVER_DIR if exist "%SCRIPT_DIR%\server\main.py" set "SERVER_DIR=%SCRIPT_DIR%\server"
if not defined SERVER_DIR if exist "%SCRIPT_DIR%\main.py" set "SERVER_DIR=%SCRIPT_DIR%"

if not defined SERVER_DIR (
    for /f "delims=" %%i in ('dir /s /b "%SCRIPT_DIR%\main.py" 2^>nul') do (
        if not defined SERVER_DIR set "SERVER_DIR=%%~dpi"
    )
)

if not defined SERVER_DIR (
    echo [ERRO] Nao foi possivel encontrar a pasta do servidor [contendo main.py].
    echo Extraia o projeto completo e execute novamente.
    pause
    exit /b 1
)

if "%SERVER_DIR:~-1%"=="\" set "SERVER_DIR=%SERVER_DIR:~0,-1%"
echo [INFO] Pasta do servidor encontrada: %SERVER_DIR%
cd /d "%SERVER_DIR%" || exit /b 1

REM ============ 2. Verificar Python ============
where py >nul 2>&1
if errorlevel 1 (
    where python >nul 2>&1
    if errorlevel 1 (
        echo [ERRO] Python nao foi encontrado. Instale Python 3.11+ e marque "Add to PATH".
        pause
        exit /b 1
    )
    set "PY=python"
) else (
    set "PY=py"
)
echo [INFO] Usando Python: %PY%

REM ============ 3. Liberar portas 7771 e 8080 ============
echo [INFO] Liberando portas 7771 e 8080...
powershell -Command "Get-NetTCPConnection -LocalPort 7771,8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

REM ============ 4. Configurar venv ============
if exist "venv\Scripts\python.exe" (
    echo [INFO] Removendo venv antigo para recriar com Python atual...
    rmdir /s /q venv
)
echo [INFO] Criando ambiente virtual [venv]...
%PY% -m venv venv
if errorlevel 1 (
    echo [AVISO] Falha ao criar venv. Usando Python global.
    set "USE_VENV=0"
) else (
    set "USE_VENV=1"
)

if "!USE_VENV!"=="1" (
    echo [INFO] Ativando venv...
    call venv\Scripts\activate.bat
)

REM ============ 5. Instalar dependencias ============
echo [INFO] Instalando dependencias (pip)...
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if errorlevel 1 (
    echo [AVISO] Erro ao instalar algumas dependencias. Continuando...
)

REM ============ 6. Variaveis de ambiente ============
set PYTHONIOENCODING=utf-8
set DATABASE_URL=sqlite:///gangstar_local.db
set GANGSTAR_HOST=0.0.0.0
set GANGSTAR_PORT=7771
set GANGSTAR_UVICORN_WORKERS=1

REM ============ 7. Detectar IP publico ============
echo [INFO] Detectando IP publico...
set "DETECTED_IP="
for /f "delims=" %%i in ('curl -s --max-time 5 https://api.ipify.org') do set "DETECTED_IP=%%i"
echo !DETECTED_IP! | findstr /r "^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*$" >nul 2>&1
if errorlevel 1 set "DETECTED_IP="

set "CURRENT_ENV_IP="
if exist ".env" (
    for /f "usebackq tokens=2 delims==" %%a in (`findstr /b "SERVER_URL=" .env`) do (
        set "TEMP_URL=%%a"
        set "TEMP_URL=!TEMP_URL:http://=!"
        set "TEMP_URL=!TEMP_URL:https://=!"
        for /f "tokens=1 delims=:" %%b in ("!TEMP_URL!") do set "CURRENT_ENV_IP=%%b"
    )
)

set "LOCAL_IP="
if defined DETECTED_IP (
    echo [OK] IP Publico detectado: !DETECTED_IP!
    if not defined CURRENT_ENV_IP (
        set "LOCAL_IP=!DETECTED_IP!"
    ) else if "!CURRENT_ENV_IP!"=="192.168.1.10" (
        echo [INFO] Atualizando IP padrao para IP publico...
        set "LOCAL_IP=!DETECTED_IP!"
    ) else (
        set "LOCAL_IP=!CURRENT_ENV_IP!"
        echo [INFO] Mantendo IP do .env: !LOCAL_IP!
    )
) else (
    if defined CURRENT_ENV_IP (
        set "LOCAL_IP=!CURRENT_ENV_IP!"
    ) else (
        set "LOCAL_IP=192.168.1.70"
    )
    echo [AVISO] Nao foi possivel detectar IP publico. Usando: !LOCAL_IP!
)

set "SHOULD_WRITE=0"
if not exist ".env" (
    set "SHOULD_WRITE=1"
) else if "!LOCAL_IP!" NEQ "!CURRENT_ENV_IP!" (
    set "SHOULD_WRITE=1"
)

if "!SHOULD_WRITE!"=="1" (
    (
        echo SERVER_URL=http://!LOCAL_IP!:7771
        echo SERVER_WS_URL=ws://!LOCAL_IP!:7771/ws
        echo GANGSTAR_HOST=0.0.0.0
        echo GANGSTAR_PORT=7771
        echo DATABASE_URL=sqlite:///gangstar_local.db
    ) > .env
    echo [OK] Arquivo .env atualizado com IP: !LOCAL_IP!
) else (
    echo [OK] Configuracoes do .env preservadas para IP: !LOCAL_IP!
)

REM ============ 8. Inicializar BD + admin ============
echo [INFO] Inicializando banco de dados e criando usuario admin...
python seed_local_admin.py
if errorlevel 1 (
    echo [AVISO] Falha ao executar seed_local_admin.py. Continuando...
)

REM ============ 9. Iniciar servidor Bypass 8080 em segundo plano ============
echo [INFO] Iniciando servidor Bypass na porta 8080...
if "!USE_VENV!"=="1" (
    start "Gangstar Bypass (8080)" cmd /k ""%SERVER_DIR%\venv\Scripts\python.exe" "%SERVER_DIR%\projeto_bypass\launch_8080.py""
) else (
    start "Gangstar Bypass (8080)" cmd /k "python "%SERVER_DIR%\projeto_bypass\launch_8080.py""
)

echo.
echo =======================================================================
echo   SERVIDOR RODANDO!
echo.
echo   Painel Web (navegador):
echo     - Local:  http://localhost:7771
echo     - Rede:   http://!LOCAL_IP!:7771
echo     - Bypass: http://localhost:8080
echo.
echo   Dados padrao:
echo     - Usuario: admin
echo     - Senha:   admin
echo =======================================================================
echo.

REM ============ 10. Loop de reinicio do servidor principal ============
:loop
python main.py
echo.
echo [INFO] O servidor parou. Reiniciando em 5 segundos...
timeout /t 5 /nobreak >nul
goto loop