import json, urllib.request

base = 'http://192.168.1.70:7771'

# Try login
req = urllib.request.Request(
    f'{base}/api/auth/login',
    data=json.dumps({'username': 'admin', 'password': '123456'}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read())
        token = data.get('access_token') or data.get('token')
        print('Token OK')
except Exception as e:
    print('Login failed:', e)
    # Try other password
    req = urllib.request.Request(
        f'{base}/api/auth/login',
        data=json.dumps({'username': 'admin', 'password': 'gangstar123'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            token = data.get('access_token') or data.get('token')
            print('Token OK with gangstar123')
    except Exception as e2:
        print('Still failed:', e2)
        token = None

if token:
    req = urllib.request.Request(f'{base}/api/devices', headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as resp:
        devices = json.loads(resp.read())
        for dev in devices[:2]:
            dev_id = dev.get('device_id')
            print(f'\nDevice {dev_id}:')
            req2 = urllib.request.Request(f'{base}/api/devices/{dev_id}/installed-apps', headers={'Authorization': f'Bearer {token}'})
            try:
                with urllib.request.urlopen(req2) as resp2:
                    apps_data = json.loads(resp2.read())
                    apps = apps_data.get('apps', [])
                    print(f'  Total apps: {len(apps)}')
                    for a in apps[:8]:
                        icon = a.get('icon') or ''
                        print(f"  [{a.get('package','?')}] name={a.get('name','?')} icon_len={len(str(icon))}")
            except Exception as e:
                print(f'  Error getting apps: {e}')
