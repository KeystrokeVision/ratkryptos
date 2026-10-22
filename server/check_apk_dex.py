import zipfile
import re

apk_path = r'c:\Users\Usuário\Pictures\OOOP\finalvnc\finalvnc\server\downloads\app-teste-local.apk'
with zipfile.ZipFile(apk_path, 'r') as z:
    for name in z.namelist():
        if name.endswith('.dex'):
            dex_data = z.read(name)
            matches = re.findall(b'ws://[^\s"\']+', dex_data)
            if matches:
                print('Found WebSocket URLs in', name, ':', [m.decode('utf-8', errors='ignore') for m in matches])
