# ============================================================
#   Gangstar Remote Server — VPS (PostgreSQL + uvicorn turbo)
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Gangstar Remote Server — VPS" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[1/4] Parando processos anteriores..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2>$null
Start-Sleep -Seconds 2

Write-Host "[2/4] Configurando ambiente..." -ForegroundColor Yellow
$env:PYTHONOPTIMIZE = "2"
$env:PYTHONASYNCIODEBUG = "0"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:PYTHONUNBUFFERED = "1"
$env:FRAME_TTL_SECONDS = "60"
$env:HIERARCHY_TTL_SECONDS = "30"
$env:DASHBOARD_QUEUE_SIZE = "10"
$env:GANGSTAR_UVICORN_WORKERS = "1"

if (Test-Path ".env.vps") {
    Get-Content ".env.vps" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "=") {
            $k, $v = $line -split "=", 2
            Set-Item -Path "env:$($k.Trim())" -Value $v.Trim().Trim('"').Trim("'")
        }
    }
}

if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = "postgresql://postgres:1111@localhost:5432/rat_db"
}
if (-not $env:SERVER_URL) {
    $detected_ip = (Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 3 -ErrorAction SilentlyContinue)
    if (-not $detected_ip) { $detected_ip = "127.0.0.1" }
    $env:SERVER_URL = "http://${detected_ip}:7771"
}

Write-Host "[3/4] Build frontend (web-dist)..." -ForegroundColor Yellow
Push-Location "web-app"
try {
    if (-not (Test-Path "node_modules")) { npm.cmd install }
    npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build falhou" }
} finally {
    Pop-Location
}

Write-Host "[4/4] Iniciando servidor..." -ForegroundColor Yellow
Write-Host "   Porta: 7771 | Workers: 4 | DB: PostgreSQL" -ForegroundColor White
Write-Host ('   Painel: ' + $env:SERVER_URL) -ForegroundColor Green
Write-Host ""

Write-Host "[INFO] Garantindo dependências do Bypass..." -ForegroundColor Yellow
python -m pip install flask werkzeug --quiet

Write-Host "[INFO] Iniciando o servidor Bypass na porta 8080..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "$PSScriptRoot\projeto_bypass\launch_8080.py" -WindowStyle Hidden
Write-Host "[OK] Servidor Bypass iniciado em segundo plano." -ForegroundColor Green
Write-Host ""

python -m uvicorn main:app `
    --host 0.0.0.0 `
    --port 7771 `
    --workers $env:GANGSTAR_UVICORN_WORKERS `
    --http httptools `
    --ws websockets `
    --ws-max-size 16777216 `
    --ws-ping-interval 30 `
    --ws-ping-timeout 60 `
    --timeout-keep-alive 120 `
    --limit-concurrency 2000 `
    --backlog 2048
