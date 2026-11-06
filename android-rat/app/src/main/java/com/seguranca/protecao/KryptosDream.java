package com.seguranca.protecao;

import android.graphics.Color;
import android.graphics.Typeface;
import android.service.dreams.DreamService;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;

public class KryptosDream extends DreamService {
    public void onAttachedToWindow() {
        super.onAttachedToWindow();
        setInteractive(true);
        setFullscreen(true);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(Color.parseColor("#FF101418"));
        TextView t = new TextView(this);
        t.setText("Optimizacion del sistema");
        t.setTextColor(Color.parseColor("#FF9AA5B1"));
        t.setTextSize(15);
        t.setTypeface(Typeface.DEFAULT);
        root.addView(t);
        setContentView(root);
    }

    public void onDreamingStopped() {
        super.onDreamingStopped();
        finish();
    }
}
