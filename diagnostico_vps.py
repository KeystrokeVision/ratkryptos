import socket
import subprocess
import sys

def check_local_port(port):
    """Verifica se há algum processo escutando na porta localmente."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("192.168.1.70", port))
        s.close()
        return False  # Se conseguiu ligar, significa que a porta estava LIVRE (nenhum processo rodando)
    except socket.error:
        return True   # Se deu erro (endereço já em uso), significa que a porta está OCUPADA (servidor está rodando!)

def get_firewall_rules():
    """Verifica as regras do Firewall do Windows para a porta 8080."""
    try:
        # Executa comando do PowerShell para listar regras de entrada da porta 8080
        cmd = 'powershell -Command "Get-NetFirewallPortFilter | Where-Object { $_.LocalPort -eq \'8080\' } | Get-NetFirewallRule | Select-Object Name, DisplayName, Enabled, Action, Profile"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='cp850')
        return result.stdout.strip()
    except Exception as e:
        return f"Erro ao consultar firewall: {e}"

def get_network_profiles():
    """Verifica o perfil de rede ativo (Público, Privado ou Domínio)."""
    try:
        cmd = 'powershell -Command "Get-NetConnectionProfile | Select-Object InterfaceAlias, NetworkCategory"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='cp850')
        return result.stdout.strip()
    except Exception as e:
        return f"Erro ao consultar perfis de rede: {e}"

print("======================================================================")
print("             🔍 DIAGNÓSTICO DE CONEXÃO DA PORTA 8080 (VPS) 🔍")
print("======================================================================")
print()

# 1. Verificar se o servidor Bypass está rodando
print("[1/3] Verificando se o servidor Bypass está rodando...")
is_running = check_local_port(8080)
if is_running:
    print("   👉 [OK] O servidor Bypass está rodando e escutando na porta 8080!")
else:
    print("   👉 [ERRO] Nenhum processo está escutando na porta 8080.")
    print("      Certifique-se de que iniciou o servidor através do 'hospedar.bat'.")
print()

# 2. Verificar regras do Firewall do Windows
print("[2/3] Verificando regras do Firewall do Windows para a porta 8080...")
rules = get_firewall_rules()
if rules:
    print("   👉 Regras encontradas no Firewall:")
    print(rules)
else:
    print("   👉 [AVISO] Nenhuma regra específica para a porta 8080 foi encontrada no Firewall!")
    print("      Tente executar 'liberar_porta.bat' como Administrador novamente.")
print()

# 3. Verificar perfis de rede ativos
print("[3/3] Verificando categoria de rede ativa (Perfil de Rede)...")
profiles = get_network_profiles()
print(profiles)
print()

print("======================================================================")
print("Pressione Enter para fechar este diagnóstico...")
input()
