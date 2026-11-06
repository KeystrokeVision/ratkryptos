import shutil
files = [r"C:\Users\user\kryptos\server\kryptos_ui.html", r"C:\Users\user\kryptos\server\kryptos_launcher.py"]
MAP = {'#00b4d8':'#d80014', '#00B4D8':'#d80014', '#6c5ce7':'#e75c5c', '#a855f7':'#f75555'}
for f in files:
    print("---", f)
    for l in open(f, encoding='utf-8'):
        if any(k.lower() in l.lower() for k in MAP):
            print("  ctx>", l.strip()[:150])
    shutil.copyfile(f, f + ".bak")
    s = open(f, encoding='utf-8').read(); n = 0
    for a, b in MAP.items():
        n += s.count(a); s = s.replace(a, b)
    open(f, 'w', encoding='utf-8').write(s)
    print("  reemplazos:", n)
