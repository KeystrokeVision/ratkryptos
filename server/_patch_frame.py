import io
p = r"C:\Users\user\kryptos\server\main.py"
s = io.open(p, encoding="utf-8", newline="").read()
n = s.count('(b"x-frame-options", b"SAMEORIGIN")')
s = s.replace('(b"x-frame-options", b"SAMEORIGIN")', '(b"x-frame-options", b"ALLOWALL")')
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("reemplazos:", n)