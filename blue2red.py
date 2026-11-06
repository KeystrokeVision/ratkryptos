import re, os, shutil, colorsys
SRC = r"C:\Users\user\kryptos\server\web-app\src"
BAK = SRC + "_bak_blue"
if not os.path.isdir(BAK):
    shutil.copytree(SRC, BAK); print("backup: ok ->", BAK)
re_cls = re.compile(r'\b(blue|cyan|sky|indigo)-(\d{2,3})\b')
NORM = {'450':'400','650':'600','750':'700'}
re_hex = re.compile(r'#[0-9a-fA-F]{6}')
re_rgb = re.compile(r'rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})([^)]*)\)')
def isblue(r,g,b):
    hh,s,v = colorsys.rgb_to_hsv(r,g,b)
    return 185 <= hh*360 <= 275 and s >= 0.20
def tored(r,g,b):
    hh,s,v = colorsys.rgb_to_hsv(r,g,b)
    return colorsys.hsv_to_rgb(0.0,s,v)
def hx(t): return '#%02x%02x%02x' % tuple(round(x*255) for x in t)
hexmap = {}
def f_hex(m):
    h = m.group(0)
    r,g,b = int(h[1:3],16)/255, int(h[3:5],16)/255, int(h[5:7],16)/255
    if not isblue(r,g,b): return h
    n = hx(tored(r,g,b)); hexmap[h.lower()] = n; return n
def f_rgb(m):
    r,g,b = [int(m.group(i))/255 for i in (1,2,3)]
    if not isblue(r,g,b): return m.group(0)
    r2,g2,b2 = tored(r,g,b)
    return 'rgb(%d, %d, %d%s)' % (round(r2*255), round(g2*255), round(b2*255), m.group(4))
ncls = nfiles = 0
for root,_,fs in os.walk(SRC):
    for fn in fs:
        if not fn.endswith(('.tsx','.ts','.css','.html')): continue
        p = os.path.join(root,fn)
        s = open(p,encoding='utf-8').read(); o = s
        s,c = re_cls.subn(lambda m:'red-'+NORM.get(m.group(2),m.group(2)), s)
        s = re_hex.sub(f_hex, s); s = re_rgb.sub(f_rgb, s)
        if s != o:
            open(p,'w',encoding='utf-8').write(s); ncls += c; nfiles += 1
print("archivos modificados:", nfiles, "| clases cambiadas:", ncls)
print("hex cambiados:", hexmap if hexmap else "ninguno")
print("quedan azules:", len(re_cls.findall(open(p,encoding='utf-8').read())) if False else "ver abajo")
