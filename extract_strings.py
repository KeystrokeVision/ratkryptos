import re, os

def strings_from(path, minlen=4):
    data = open(path, 'rb').read()
    out = set()
    for m in re.finditer(rb'[\x20-\x7e]{%d,}' % minlen, data):
        out.add(m.group().decode('ascii', 'ignore'))
    for m in re.finditer(rb'(?:[\x20-\x7e]\x00){%d,}' % minlen, data):
        out.add(m.group().decode('utf-16-le', 'ignore'))
    return out

T = {
 'BTMOB': r"C:\Users\user\Downloads\Telegram Desktop\Btmob 4.6.1\Btmob 4.6.1\BTMOB_v4.6.1",
 'GANGSTAR': r"C:\Users\user\Desktop\Gangstar 4.0",
}
KW = ['camera','sms','call','location','gps','mic','audio','record','keylog','clipboard',
      'shell','contact','photo','notif','whatsapp','telegram','bank','pin','password',
      'screenshot','stream','vnc','codec','h264','upload','download','permission','admin',
      'root','overlay','uninstall','wake','reboot','brightness','volume','toast','swipe',
      'tap','hidden','icon','autostart','battery','proxy','wifi','sim','installed','apps']
alls_by = {}
for name, d in T.items():
    if not os.path.isdir(d):
        print(name, "NO EXISTE:", d); continue
    exes = []
    for root, _, fs in os.walk(d):
        for f in fs:
            if f.lower().endswith('.exe'):
                p = os.path.join(root, f); exes.append((os.path.getsize(p), p))
    exes.sort(reverse=True)
    print("=== " + name + " ===")
    for s, p in exes[:4]:
        print("   exe:", s, p)
    if not exes: continue
    alls = set()
    for s, p in exes[:2]:
        alls |= strings_from(p)
    alls_by[name] = alls
    out = r"C:\Users\user\kryptos\strings_" + name.lower() + ".txt"
    open(out, 'w', encoding='utf-8').write("\n".join(sorted(alls)))
    print("   strings:", len(alls), "->", out)

for name, alls in alls_by.items():
    print("=== " + name + " coincidencias ===")
    low = [s for s in alls if 3 <= len(s) <= 45]
    for k in KW:
        hits = sorted({s for s in low if k in s.lower()})
        if hits:
            print(k + ": " + " | ".join(hits[:7]))
