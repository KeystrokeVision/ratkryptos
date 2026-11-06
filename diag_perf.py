M = r"C:\Users\user\kryptos\server\main.py"
s = open(M, encoding="utf-8").read()
for n, line in enumerate(s.splitlines(), 1):
    if "store_screen_hierarchy" in line or "maybe_render_tree" in line or "_is_black_jpeg" in line or "_persist_hierarchy" in line:
        print(n, repr(line[:115]))
print("total lineas:", len(s.splitlines()))
