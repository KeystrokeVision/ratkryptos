import os, sqlite3, pathlib, sys
srv = pathlib.Path(r"C:\Users\Administrator\Desktop\kryptos_vps\server")
con = sqlite3.connect(str(srv / "gangstar_local.db"))

import bcrypt
newpass = os.environ.get("KRYPTOS_NEWPASS", "").strip()
if newpass:
    h = bcrypt.hashpw(newpass.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode()
    con.execute("update operators set hashed_password=? where username='admin'", (h,))
    con.commit()
    g = con.execute("select hashed_password from operators where username='admin'").fetchone()[0]
    print("[OK] clave aplicada. Verificacion:", bcrypt.checkpw(newpass.encode(), g.encode()))

cols = [c[1] for c in con.execute("PRAGMA table_info(operators)")]
print("\n=== cuentas ===")
for r in con.execute("select * from operators"):
    d = dict(zip(cols, r))
    for k in ("id","username","email","is_admin","is_active","totp_enabled","last_ip","last_login"):
        if k in d:
            print("   %-12s %s" % (k, str(d[k])[:40]))
    print("   ---")

sec = con.execute("select totp_secret from operators where username='admin'").fetchone()
if sec and sec[0]:
    import pyotp
    print("*** CODIGO 2FA AHORA:", pyotp.TOTP(sec[0]).now(), "***")
    print("    secret para tu autenticador:", sec[0])

print("\n=== dispositivos ===")
dcols = [c[1] for c in con.execute("PRAGMA table_info(devices)")]
print("columnas:", dcols)
for r in con.execute("select * from devices"):
    d = dict(zip(dcols, r))
    keep = ("id","device_id","android_id","model","manufacturer","brand","name","ip","ip_address",
            "raw_ip_address","last_ip","last_seen","last_seen_at","created_at","build_id","is_online","active","notes")
    print("  ", {k: str(d.get(k))[:30] for k in dcols if k.lower() in keep})
