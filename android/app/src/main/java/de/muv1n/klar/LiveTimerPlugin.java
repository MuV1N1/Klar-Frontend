package de.muv1n.klar;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.text.format.DateFormat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.Date;
import java.util.Locale;

/**
 * Shows the running focus timer as an Android 16 Live Update (promoted ongoing notification).
 * HyperOS 3.1 puts these into the Super Island, other phones show a status bar chip. The system
 * counts down by itself, so it keeps going while the WebView sleeps.
 */
@CapacitorPlugin(
    name = "LiveTimer",
    permissions = @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
)
public class LiveTimerPlugin extends Plugin {

    private static final String CHANNEL_ID = "focus";
    private static final int NOTIFICATION_ID = 1;
    /** How often the short text ("22 min") and the progress bar are refreshed while running. */
    private static final long REFRESH_MS = 15_000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refresh = this::show;
    // The sprint as last synced from the web app
    private String status = "idle";
    private long endsAt;
    private int remaining;
    private int total;
    private String title;

    /** { status: 'idle' | 'running' | 'paused' | 'finished', endsAt: epoch ms | null, remaining: s, total: s, title: string | null } */
    @PluginMethod
    public void sync(PluginCall call) {
        String status = call.getString("status", "idle");
        boolean show = "running".equals(status) || "paused".equals(status);
        if (show && Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "afterPermission");
            return;
        }
        apply(call);
    }

    @PermissionCallback
    private void afterPermission(PluginCall call) {
        apply(call);
    }

    private void apply(PluginCall call) {
        status = call.getString("status", "idle");
        endsAt = call.getLong("endsAt", System.currentTimeMillis());
        remaining = call.getInt("remaining", 0);
        total = Math.max(1, call.getInt("total", 1));
        title = call.getString("title");
        JSObject result = new JSObject();
        result.put("promotable", show());
        call.resolve(result);
    }

    /** Posts (or removes) the notification for the current sprint; returns whether it can be promoted. */
    private boolean show() {
        handler.removeCallbacks(refresh);
        Context context = getContext();
        NotificationManagerCompat manager = NotificationManagerCompat.from(context);
        boolean running = "running".equals(status);
        long left = running ? endsAt - System.currentTimeMillis() : remaining * 1000L;
        if (!(running || "paused".equals(status)) || left <= 0 || !manager.areNotificationsEnabled()) {
            manager.cancel(NOTIFICATION_ID);
            return false;
        }

        NotificationManager system = context.getSystemService(NotificationManager.class);
        system.createNotificationChannel(
            new NotificationChannel(CHANNEL_ID, context.getString(R.string.live_timer_channel), NotificationManager.IMPORTANCE_DEFAULT)
        );
        Intent open = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        int leftSeconds = (int) Math.ceil(left / 1000.0);
        String clock = String.format(Locale.ROOT, "%d:%02d", leftSeconds / 60, leftSeconds % 60);
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_focus)
            .setContentTitle(title != null && !title.isBlank() ? title : context.getString(R.string.live_timer_title))
            .setContentIntent(tap)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setProgress(total, Math.min(total, total - leftSeconds), false)
            .setRequestPromotedOngoing(true);

        if (running) {
            String end = DateFormat.getTimeFormat(context).format(new Date(endsAt));
            int minutes = (leftSeconds + 59) / 60;
            builder
                .setContentText(context.getString(R.string.live_timer_running, end))
                // Short text in the small island / status bar chip
                .setShortCriticalText(minutes > 1 ? context.getString(R.string.live_timer_minutes, minutes) : clock)
                .setWhen(endsAt)
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(true)
                // Gone when the sprint is over, even if the app is asleep by then
                .setTimeoutAfter(left);
            handler.postDelayed(refresh, Math.min(REFRESH_MS, Math.max(1000, left % 60_000)));
        } else {
            builder
                .setContentText(context.getString(R.string.live_timer_paused, clock))
                .setShortCriticalText(clock)
                .setShowWhen(false);
        }

        manager.notify(NOTIFICATION_ID, builder.build());
        return Build.VERSION.SDK_INT >= 36 && system.canPostPromotedNotifications();
    }
}
