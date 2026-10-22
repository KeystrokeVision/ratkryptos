import time
import requests
import os
import subprocess
import sys
import socket

URL_7771 = "http://127.0.0.1:7771/health"
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))

print("[WATCHDOG] Watchdog do Servidor Kryptos ativado...")

def is_port_open(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3)
        s.connect(("127.0.0.1", port))
        s.close()
        return True
    except Exception:
        return False

def is_server_healthy():
    try:
        r = requests.get(URL_7771, timeout=5)
        return r.status_code in (200, 400, 401, 422, 404)
    except Exception:
        return is_port_open(7771)


def ensure_bypass_server():
    if not is_port_open(8080):
        bypass_dir = os.path.join(SERVER_DIR, "projeto_bypass")
        if os.path.exists(bypass_dir):
            launch_script = os.path.join(bypass_dir, "launch_8080.py")
            if os.path.exists(launch_script):
                print("[WATCHDOG] Iniciando Servidor Bypass na porta 8080...")
                subprocess.Popen([sys.executable, launch_script], cwd=bypass_dir)

def block_rdp_attackers():
    try:
        ps_script = """
        $Events = Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 200 -ErrorAction SilentlyContinue
        $IPList = @()
        foreach ($event in $Events) {
            $ip = $event.Properties[19].Value
            if ($ip -and $ip -ne '-' -and $ip -ne '127.0.0.1' -and $ip -ne '::1' -and -not $ip.StartsWith("148.224.")) {
                $IPList += $ip
            }
        }
        $TargetBlockIPs = ($IPList | Group-Object | Where-Object { $_.Count -ge 3 } | Select-Object -ExpandProperty Name)
        if ($TargetBlockIPs.Count -gt 0) {
            Remove-NetFirewallRule -DisplayName 'BloqueioAtaqueRDP' -ErrorAction SilentlyContinue
            New-NetFirewallRule -DisplayName 'BloqueioAtaqueRDP' -Direction Inbound -Action Block -RemoteAddress $TargetBlockIPs -ErrorAction SilentlyContinue
        }
        """
        subprocess.run(["powershell", "-Command", ps_script], cwd=SERVER_DIR, timeout=15)
    except Exception as err:
        print(f"[WATCHDOG] Aviso ao aplicar bloqueio RDP: {err}")

fw_check_counter = 0

while True:
    try:
        fw_check_counter += 1
        if fw_check_counter % 20 == 0:  # A cada ~5 minutos
            block_rdp_attackers()

        if not is_server_healthy():
            print("[WATCHDOG] Servidor na porta 7771 nao respondeu! Executando recuperacao...")
            
            # Matar SOLO el proceso que escucha en 7771 (no matar todos los python)
            ps_cmd = "Get-NetTCPConnection -LocalPort 7771 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
            subprocess.run(["powershell", "-Command", ps_cmd], cwd=SERVER_DIR)
            time.sleep(2)

            # Executar otimizador e compactador de banco
            try:
                subprocess.run([sys.executable, "optimize_db.py"], cwd=SERVER_DIR, timeout=30)
            except Exception as opt_err:
                print(f"[WATCHDOG] Aviso ao rodar optimize_db: {opt_err}")

            # Iniciar servidor principal main.py
            print("[WATCHDOG] Re-iniciando main.py...")
            subprocess.Popen([sys.executable, "main.py"], cwd=SERVER_DIR)
            time.sleep(10)

        # Verificar se o servidor bypass 8080 esta ativo
        ensure_bypass_server()

        time.sleep(15)

    except Exception as e:
        print(f"[WATCHDOG] Erro no loop do watchdog: {e}")
        time.sleep(10)


