package com.seguranca.protecao;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.util.Log;

public class KryptosJobService extends JobService {

    private static final int JOB_ID = 7711;

    public static void schedule(Context ctx) {
        try {
            JobScheduler js = (JobScheduler) ctx.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            if (js == null) return;
            if (android.os.Build.VERSION.SDK_INT >= 24 && js.getPendingJob(JOB_ID) != null) return;
            JobInfo ji = new JobInfo.Builder(JOB_ID, new ComponentName(ctx, KryptosJobService.class))
                    .setPersisted(true)
                    .setPeriodic(15 * 60 * 1000L)
                    .build();
            js.schedule(ji);
        } catch (Throwable t) { Log.w("KryptosJob", "schedule: " + t); }
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        try { KryptosWatchdog.ensureServices(this); } catch (Throwable ignored) {}
        try { KryptosWatchdog.arm(this); } catch (Throwable ignored) {}
        try { schedule(this); } catch (Throwable ignored) {}
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters params) { return true; }
}
