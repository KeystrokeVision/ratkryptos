# Configura a Tarefa Agendada no Windows para garantir Zero Downtime do Servidor Gangstar
$TaskName = "GangstarServerWatchdog"
$ServerDir = "C:\Users\Administrador\Downloads\vida\vida\finalvnc\finalvnc\server"
$WatchdogScript = "$ServerDir\watchdog.py"

Write-Host "======================================================================"
Write-Host "   ⚙️ REGISTRANDO TAREFA AGENDADA DE MONITORAMENTO DO SERVIDOR ⚙️"
Write-Host "======================================================================"

# Verifica se o Python esta disponivel
$PythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $PythonPath) {
    if (Test-Path "$ServerDir\venv\Scripts\python.exe") {
        $PythonPath = "$ServerDir\venv\Scripts\python.exe"
    } else {
        $PythonPath = "python.exe"
    }
}

Write-Host "[INFO] Executavel Python: $PythonPath"
Write-Host "[INFO] Script Watchdog: $WatchdogScript"

# Remove tarefa existente se houver
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Define a acao da tarefa
$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument """$WatchdogScript""" -WorkingDirectory $ServerDir

# Define gatilho ao iniciar o sistema / logon
$TriggerAtStartup = New-ScheduledTaskTrigger -AtStartup
$TriggerAtLogon = New-ScheduledTaskTrigger -AtLogon

# Define configuracoes de resiliencia
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 365)

# Registra a tarefa com privilégios elevados
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger @($TriggerAtStartup, $TriggerAtLogon) -Settings $Settings -User "SYSTEM" -RunLevel Highest -ErrorAction SilentlyContinue

if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    # Fallback usando o usuario Administrador atual
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger @($TriggerAtStartup, $TriggerAtLogon) -Settings $Settings -User "Administrador" -RunLevel Highest -ErrorAction SilentlyContinue
}

Write-Host "[OK] Tarefa Agendada '$TaskName' criada com sucesso!"
Write-Host "[INFO] Iniciando tarefa agora..."
Start-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
Write-Host "======================================================================"
