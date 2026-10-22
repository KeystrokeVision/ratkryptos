import sqlite3, pathlib
p = pathlib.Path(r"C:\Users\Administrator\Desktop\kryptos_vps\server\gangstar_local.db")
if not p.is_file():
    p = pathlib.Path(r"C:\Users\Administrator\Desktop\kryptos_vps\gangstar_local.db")
print("existe:", p.is_file(), " tamano:", (p.stat().st_size if p.is_file() else 0), "bytes")
if p.is_file():
    con = sqlite3.connect(str(p))
    tabs = [r[0] for r in con.execute("select name from sqlite_master where type='table' order by name")]
    print("tablas:", len(tabs))
    print(", ".join(tabs))
    try:
        print("usuarios:", con.execute("select count(*) from users").fetchone())
        print("nombres:", con.execute("select username from users").fetchall())
    except Exception as e:
        print("users:", e)
    con.close()
