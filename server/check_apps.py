import sqlite3, json

conn = sqlite3.connect('gangstar_local.db')
c = conn.cursor()

# Try to find installed apps log
c.execute("SELECT log_data FROM device_logs WHERE log_type='INSTALLED_APPS' ORDER BY id DESC LIMIT 1")
row = c.fetchone()
if row:
    data = json.loads(row[0])
    apps = data.get('apps', [])
    print('Total apps:', len(apps))
    print('First 5 apps:')
    for a in apps[:5]:
        icon = a.get('icon', '')
        print(f"  name={a.get('name')} | package={a.get('package')} | icon_len={len(icon) if icon else 0}")
else:
    print('No INSTALLED_APPS log found')
    # Check what types exist
    c.execute("SELECT DISTINCT log_type FROM device_logs ORDER BY log_type")
    types = c.fetchall()
    print('Log types found:', [t[0] for t in types])

conn.close()
