@echo off
:: Verifica privilÃ©gios de Administrador
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo ====================================================================
    echo [ERRO] Este script precisa ser executado como ADMINISTRADOR!
    echo Clique com o botao direito no arquivo e selecione "Executar como Administrador".
    echo ====================================================================
    pause
    exit /b 1
)

echo ====================================================================
echo   âš¡ LIBERANDO A PORTA 7771 NO FIREWALL DO WINDOWS SERVER 2022 âš¡
echo ====================================================================
echo.

:: Executa comando netsh para abrir portas de entrada TCP 7771 e 8080
netsh advfirewall firewall add rule name="RAT C&C Port 7771" dir=in action=allow protocol=TCP localport=7771
netsh advfirewall firewall add rule name="Bypass Generator Port 8080" dir=in action=allow protocol=TCP localport=8080

if %errorLevel% EQU 0 (
    echo.
    echo ====================================================================
    echo [OK] Portas 7771 e 8080 liberadas com sucesso no Firewall!
    echo ====================================================================
) else (
    echo.
    echo ====================================================================
    echo [ERRO] Falha ao tentar adicionar a regra no Firewall.
    echo ====================================================================
)
echo.
pause
