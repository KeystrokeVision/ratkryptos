import sqlite3, pathlib
srv = pathlib.Path(r"C:\Users\Administrator\Desktop\kryptos_vps\server")
db = srv / "gangstar_local.db"
print("db:", db, "existe:", db.is_file(), "bytes:", (db.stat().st_size if db.is_file() else 0))
con = sqlite3.connect(str(db))
tabs = [r[0] for r in con.execute("select name from sqlite_master where type='table' order by name")]
print("tablas:", len(tabs))
for t in tabs: print("  -", t)
for t in tabs:
    if any(x in t.lower() for x in ("user","admin","operator","conta","account")):
        cols = [r[1] for r in con.execute("PRAGMA table_info(%s)" % t)]
        print("\n==", t, "->", cols)
        for r in con.execute("select * from %s" % t).fetchall()[:5]:
            print("   ", r)
