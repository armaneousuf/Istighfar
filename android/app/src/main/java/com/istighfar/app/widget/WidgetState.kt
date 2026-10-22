package com.istighfar.app.widget

import android.content.Context
import org.json.JSONObject

/**
 * Snapshot of the counter that the widget renders.
 *
 * The web app writes this JSON into Preferences' SharedPreferences file after
 * every save; the widget only ever reads it. Nothing here is authoritative —
 * if the value is missing or malformed we render zeros rather than guess.
 */
data class WidgetState(
    val count: Int = 0,
    val target: Int = 1000,
    val percent: Int = 0,
    val lifetimeTotal: Int = 0,
    val streakDays: Int = 0,
) {
    companion object {
        private const val PREFS_FILE = "CapacitorStorage"
        private const val KEY = "widget_state"

        fun load(context: Context): WidgetState {
            val raw = context
                .getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)
                .getString(KEY, null)
                ?: return WidgetState()

            return try {
                val json = JSONObject(raw)
                WidgetState(
                    count = json.optInt("count", 0),
                    target = json.optInt("target", 1000).takeIf { it > 0 } ?: 1000,
                    percent = json.optInt("percent", 0).coerceIn(0, 100),
                    lifetimeTotal = json.optInt("lifetimeTotal", 0),
                    streakDays = json.optInt("streakDays", 0),
                )
            } catch (e: Exception) {
                // A corrupt mirror should render as empty, never crash the host.
                WidgetState()
            }
        }

        /** True once the web app has written at least once. */
        fun hasData(context: Context): Boolean = context
            .getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)
            .contains(KEY)
    }
}
