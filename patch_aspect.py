import re, shutil
B = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao"
U = B + r"\UiAssistBridge.java"
S = B + r"\ScreenStreamService.java"
shutil.copyfile(U, U + ".bak"); shutil.copyfile(S, S + ".bak")
u = open(U, encoding='utf-8').read()
pat = re.compile(r'scaled = android\.graphics\.Bitmap\.createScaledBitmap\(\s*source,\s*SILENT_WIDTH,\s*SILENT_HEIGHT,\s*true\s*\);')
u, n = pat.subn('scaled = scaleForPipeline(source);', u)
print("escalados reemplazados:", n)
helper = """
    // [KRYPTOS-PATCH PERF] escala proporcional (sin deformar) al lado mayor SILENT_MAX_SIDE
    private static final int SILENT_MAX_SIDE = 720;
    private static android.graphics.Bitmap scaleForPipeline(android.graphics.Bitmap src) {
        int sw = src.getWidth(), sh = src.getHeight();
        float sc = Math.min(1f, SILENT_MAX_SIDE / (float) Math.max(sw, sh));
        int tw = Math.max(2, Math.round(sw * sc));
        int th = Math.max(2, Math.round(sh * sc));
        if (tw == sw && th == sh) return src;
        return android.graphics.Bitmap.createScaledBitmap(src, tw, th, true);
    }

    private static void processOneSilentEncodeJob() {"""
u = u.replace("    private static void processOneSilentEncodeJob() {", helper, 1)
open(U, 'w', encoding='utf-8').write(u)
s = open(S, encoding='utf-8').read()
s2 = s.replace("650f / Math.max(srcW, srcH)", "720f / Math.max(srcW, srcH)")
print("captura a 720:", 1 if s2 != s else 0)
open(S, 'w', encoding='utf-8').write(s2)
