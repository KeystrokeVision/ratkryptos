import io
p = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
s = io.open(p, encoding="utf-8", newline="").read()
s = s.replace("const [silentQuality, setSilentQuality] = useState(15);",
              "const [silentQuality, setSilentQuality] = useState(70);")
s = s.replace("silent_only: true, quality: 50 }", "silent_only: true, quality: 70 }")
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK quality")