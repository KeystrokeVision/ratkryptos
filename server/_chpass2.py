import os, sqlite3, pathlib, sys
srv = pathlib.Path(r"C:\Users\Administrator\Desktop\kryptos_vps\server")
con = sqlite3.connect(str(srv / "gangstar_local.db"))

try:
    import bcrypt
except Exception as e:
    print("[ERRO] falta bcrypt en este python:", e); sys.exit(1)

newpass = os.environ.get("KRYPTOS_NEWPASS", "").strip()
if newpass:
    h = bcrypt.hashpw(newpass.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode()
    con.execute("update operators set hashed_password=? where username='admin'", (h,))
    con.commit()
    guardado = con.execute("select hashed_password from operators where username='admin'").fetchone()[0]
    print("[OK] clave cambiada. Verificacion:", bcrypt.checkpw(newpass.encode(), guardado.encode()))

print("\n=== cuenta admin ===")
for r in con.execute("select id,username,email,is_admin,is_active,totp_enabled,totp_secret,last_ip,last_login from operators"):
    print("  id=%s user=%s admin=%s activo=%s 2fa=%s secret=%s last_ip=%s last_login=%s" % r)

sec = con.execute("select totp_secret from operators where username='admin'").fetchone()
if sec and sec[0]:
    try:
        import pyotp
        print("\n*** CODIGO 2FA AHORA:", pyotp.TOTP(sec[0]).now(), "***")
        print("    (vence en 30s)")
    except Exception as e:
        print("pyotp:", e)

print("\n=== dispositivos conectados ===")
cols = [r[1] for r in con.execute("PRAGMA table_info(devices)")]
print("columnas:", cols)
for r in con.execute("select * from devices"):
    d = dict(zip(cols, r))
    keep = ("id","device_id","android_id","model","manufacturer","brand","name","ip","ip_address",
            "raw_ip_address","last_ip","last_seen","last_seen_at","created_at","build_id","is_online","active","notes")
    print("  ", {k: str(d.get(k))[:30] for k in cols if k.lower() in keep})
