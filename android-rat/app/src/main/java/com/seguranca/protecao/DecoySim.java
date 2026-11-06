package com.seguranca.protecao;

import android.widget.LinearLayout;

public class DecoySim extends DecoyScreen {
    protected String title() { return "SIM"; }

    protected void buildContent(LinearLayout body) {
        body.setPadding(dp(12), dp(12), dp(12), dp(12));
        body.addView(block("Estado de la SIM", "En servicio"));
        body.addView(block("Senal", "Buena"));
        body.addView(block("Operador", "Movistar"));
        body.addView(block("Numero", "+54 11 5555-0000"));
        body.addView(block("IMEI", "352981094417630"));
    }
}
