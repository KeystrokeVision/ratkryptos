import io
p = r"C:\Users\user\kryptos\server\kryptos_launcher.py"
s = io.open(p, encoding="utf-8").read()
old = 'url = url + "#kryptos=" + urllib.parse.quote(payload)'
new = 'url = url + "#/dashboard?kryptos=" + urllib.parse.quote(payload)'
assert old in s, "no encontrado"
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("OK launcher")