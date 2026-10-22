package com.istighfar.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews
import com.istighfar.app.MainActivity
import com.istighfar.app.R

/**
 * Home-screen widget: today's count, goal progress, streak and a one-tap
 * "count one" action.
 *
 * Rendering is pure RemoteViews against values mirrored out of the web app
 * (see WidgetState), so the widget never tries to read the WebView's IndexedDB.
 * Taps go through app intents: the body opens the app, the +1 button opens it
 * with the `quick-tap` action the app already handles on startup.
 */
class IstighfarWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        appWidgetIds.forEach { id ->
            appWidgetManager.updateAppWidget(id, safeBuildViews(context))
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle,
    ) {
        // Re-render on resize so the tall/short variants swap cleanly.
        appWidgetManager.updateAppWidget(appWidgetId, safeBuildViews(context))
    }

    /**
     * A throw while building RemoteViews leaves the launcher showing
     * "Problem loading widget" with no way back short of re-adding it. The
     * counter is a convenience, so a failure degrades to a blank-but-valid card
     * instead of a broken one.
     */
    companion object {
        private fun safeBuildViews(context: Context): RemoteViews =
            try {
                companionBuildViews(context, WidgetState.load(context))
            } catch (e: Exception) {
                companionBuildViews(context, WidgetState())
            }

        const val EXTRA_ACTION = "widget_action"

        /** Push the mirrored state into every placed widget. */
        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context) ?: return
            val ids = manager.getAppWidgetIds(
                ComponentName(context, IstighfarWidgetProvider::class.java),
            )
            if (ids.isEmpty()) return
            ids.forEach { manager.updateAppWidget(it, safeBuildViews(context)) }
        }

        private fun companionBuildViews(context: Context, state: WidgetState): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_istighfar)

            views.setTextViewText(R.id.widget_count, state.count.toString())
            views.setTextViewText(R.id.widget_goal, "Goal ${state.target}")
            views.setTextViewText(R.id.widget_percent, "${state.percent}%")
            views.setProgressBar(R.id.widget_progress, 100, state.percent, false)

            views.setTextViewText(
                R.id.widget_streak,
                if (state.streakDays == 1) "1 day streak" else "${state.streakDays} day streak",
            )

            // Prayer times come from the app's saved location. Until one exists
            // the row prompts for it rather than showing a guessed time.
            if (state.nextPrayerName.isBlank()) {
                views.setTextViewText(R.id.widget_prayer_name, "Set location in app")
                views.setTextViewText(R.id.widget_prayer_time, "")
            } else {
                val day = if (state.nextPrayerTomorrow) "Fajr · tomorrow" else state.nextPrayerName
                views.setTextViewText(R.id.widget_prayer_name, day)
                views.setTextViewText(R.id.widget_prayer_time, state.nextPrayerTime)
            }

            views.setOnClickPendingIntent(
                R.id.widget_root,
                appIntent(context, action = null, requestCode = 0),
            )
            return views
        }

        /**
         * A PendingIntent into MainActivity. `data` is a unique URI per action
         * so Android treats them as distinct intents instead of reusing the
         * first one (extras are ignored when matching).
         */
        private fun appIntent(responseContext: Context, action: String?, requestCode: Int): PendingIntent {
            val intent = Intent(responseContext, MainActivity::class.java).apply {
                this.action = Intent.ACTION_VIEW
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
                data = Uri.parse("istighfar://widget/${action ?: "open"}")
                if (action != null) putExtra(EXTRA_ACTION, action)
            }
            return PendingIntent.getActivity(
                responseContext,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }
    }
}

