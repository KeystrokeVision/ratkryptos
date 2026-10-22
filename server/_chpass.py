import os, sqlite3, pathlib, sys
srv = pathlib.Path(os.environ["KRYPTOS_SRV"])
p = srv / "gangstar_local.db"
if not p.is_file(): print("[ERRO] no encontre", p); sys.exit(1)
con = sqlite3.connect(str(p)); con.row_factory = sqlite3.Row
cols = [r[1] for r in con.execute("PRAGMA table_info(users)")]
print("columnas:", cols)
pcol = next((c for c in ("password_hash","hashed_password","password","senha") if c in cols), None)
print("columna de password:", pcol)
print("hash actual (inicio):", str(con.execute("select %s from users where username='admin'" % pcol).fetchone()[0])[:16])
newpass = os.environ["KRYPTOS_NEWPASS"].strip()
import bcrypt
h = bcrypt.hashpw(newpass.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode()
con.execute("update users set %s=? where username='admin'" % pcol, (h,))
con.commit()
print("[OK] clave de admin cambiada")
