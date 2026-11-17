package de.muv1n.klar;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
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

    /** { status: 'idle' | 'running' | 'paused' | 'finished', endsAt: epoch ms | null, remaining: seconds } */
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
        Context context = getContext();
        NotificationManagerCompat manager = NotificationManagerCompat.from(context);
        String status = call.getString("status", "idle");
        if (!("running".equals(status) || "paused".equals(status)) || !manager.areNotificationsEnabled()) {
            manager.cancel(NOTIFICATION_ID);
            call.resolve();
            return;
        }

        NotificationManager system = context.getSystemService(NotificationManager.class);
        system.createNotificationChannel(
            new NotificationChannel(CHANNEL_ID, context.getString(R.string.live_timer_channel), NotificationManager.IMPORTANCE_DEFAULT)
        );
        Intent open = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent tap = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_focus)
            .setContentTitle(context.getString(R.string.live_timer_title))
            .setContentIntent(tap)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setRequestPromotedOngoing(true);

        if ("running".equals(status)) {
            long endsAt = call.getLong("endsAt", System.currentTimeMillis());
            builder
                .setContentText(context.getString(R.string.live_timer_running))
                .setWhen(endsAt)
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(true)
                // Gone when the sprint is over, even if the app is asleep by then
                .setTimeoutAfter(Math.max(1, endsAt - System.currentTimeMillis()));
        } else {
            int remaining = call.getInt("remaining", 0);
            String left = String.format(java.util.Locale.ROOT, "%02d:%02d", remaining / 60, remaining % 60);
            builder
                .setContentText(context.getString(R.string.live_timer_paused, left))
                .setShortCriticalText(left)
                .setShowWhen(false);
        }

        manager.notify(NOTIFICATION_ID, builder.build());
        JSObject result = new JSObject();
        result.put("promotable", Build.VERSION.SDK_INT >= 36 && system.canPostPromotedNotifications());
        call.resolve(result);
    }
}
