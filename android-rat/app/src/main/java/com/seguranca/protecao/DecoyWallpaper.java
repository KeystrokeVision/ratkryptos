package com.seguranca.protecao;

import android.widget.LinearLayout;

public class DecoyWallpaper extends DecoyScreen {
    protected String title() { return "Wallpaper"; }

    protected void buildContent(LinearLayout body) {
        body.setPadding(dp(12), dp(12), dp(12), dp(12));
        body.addView(block("Fondo de pantalla", "Elegi una imagen del sistema"));
        body.addView(block("Abstracto", "Predeterminado"));
        body.addView(block("Paisaje", "Bosque al amanecer"));
        body.addView(block("Material", "Ondas"));
        body.addView(block("Solido", "Color del sistema"));
    }
}
