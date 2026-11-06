import shutil
D = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
shutil.copyfile(D, D + ".bak_otp")
d = open(D, encoding="utf-8").read()
imp = "import BlackScreenEditor from '../components/BlackScreenEditor';"
assert d.count(imp) == 1
d = d.replace(imp, imp + "\nimport OtpPanel from '../components/OtpPanel';", 1)
k = d.index('bg-[#0f0404] text-white relative')
k = d.index('>', k) + 1
d = d[:k] + "\n      <OtpPanel deviceId={deviceId} />" + d[k:]
open(D, "w", encoding="utf-8").write(d)
print("DeviceControl parcheado")
