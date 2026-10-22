import urllib.request
import urllib.parse
import json
import time
import io
from PIL import Image

BASE_URL = "http://localhost:7771"

def run_test():
    print("[1] Efetuando login em http://localhost:7771...")
    payload = json.dumps({"username": "admin", "password": "admin"}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print("    Resposta do login:", res)
        token = res.get("access_token")

    # Gera um ícone PNG válido em memória
    img = Image.new('RGB', (128, 128), color='blue')
    img_buf = io.BytesIO()
    img.save(img_buf, format='PNG')
    icon_bytes = img_buf.getvalue()

    print("[2] Solicitando geração de APK de teste no servidor local com ícone válido...")
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = []
    
    # Campo app_name
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="app_name"')
    body.append(b'')
    body.append(b'App Teste Local')

    # Campo hide_from_launcher
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="hide_from_launcher"')
    body.append(b'')
    body.append(b'false')

    # Arquivo icon
    body.append(f'--{boundary}'.encode())
    body.append(b'Content-Disposition: form-data; name="icon"; filename="icon.png"')
    body.append(b'Content-Type: image/png')
    body.append(b'')
    body.append(icon_bytes)

    body.append(f'--{boundary}--'.encode())
    body.append(b'')
    payload_data = b'\r\n'.join(body)

    req_build = urllib.request.Request(
        f"{BASE_URL}/api/build-apk",
        data=payload_data,
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
            'Authorization': f'Bearer {token}'
        },
        method='POST'
    )

    with urllib.request.urlopen(req_build) as resp:
        res_b = json.loads(resp.read().decode("utf-8"))
        print("    Build disparado! Resposta:", res_b)
        build_id = res_b.get("build_id")

    print(f"[3] Acompanhando progresso do build ID {build_id}...")
    while True:
        time.sleep(3)
        req_st = urllib.request.Request(
            f"{BASE_URL}/api/build-status/{build_id}",
            headers={'Authorization': f'Bearer {token}'}
        )
        with urllib.request.urlopen(req_st) as resp_st:
            st = json.loads(resp_st.read().decode("utf-8"))
            status = st.get("status")
            progress = st.get("progress")
            message = st.get("message")
            print(f"    [{progress}%] {message} (Status: {status})")
            if status == "done":
                result = st.get("result", {})
                print(f"    ✅ SUCESSO COMPLETO!")
                print(f"    Nome do APK: {result.get('apk_name')}")
                print(f"    URL de Download: {result.get('download_url')}")
                print(f"    WS Configurado no APK: {result.get('server_ws_url')}")
                break
            elif status == "error":
                print(f"    ❌ ERRO NO BUILD: {message}")
                break

if __name__ == "__main__":
    run_test()
