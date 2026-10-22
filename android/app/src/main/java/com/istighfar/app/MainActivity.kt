package com.istighfar.app

import android.content.Intent
import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.istighfar.app.widget.IstighfarWidgetProvider

/**
 * Capacitor host activity.
 *
 * Beyond the default BridgeActivity this does two things for the home-screen
 * widget:
 *
 *  1. Keeps it current. The widget renders from a snapshot the web app mirrors
 *     into SharedPreferences, so it is re-read whenever the app leaves or
 *     returns to the foreground.
 *  2. Handles the widget's "+1". The launch mode is `singleTask`, so a cold
 *     start arrives in [onCreate] and a warm one in [onNewIntent].
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleWidgetAction(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleWidgetAction(intent)
    }

    override fun onResume() {
        super.onResume()
        IstighfarWidgetProvider.refreshAll(this)
    }

    override fun onPause() {
        super.onPause()
        IstighfarWidgetProvider.refreshAll(this)
    }

    /**
     * Translates the widget's `widget_action=quick-tap` extra into the
     * `?action=quick-tap` query the web app already handles on startup, then
     * reloads. Deferred until the bridge has a WebView, which it may not during
     * a cold-start onCreate.
     */
    private fun handleWidgetAction(intent: Intent?) {
        val action = intent?.getStringExtra(IstighfarWidgetProvider.EXTRA_ACTION) ?: return
        if (action != "quick-tap") return
        // Consume the extra so a later rotation/resume can't count a second tap.
        intent.removeExtra(IstighfarWidgetProvider.EXTRA_ACTION)
        bridge?.webView?.post {
            bridge.webView.evaluateJavascript(
                "location.search.includes('action=quick-tap') || " +
                    "location.replace(location.pathname + '?action=quick-tap')",
                null,
            )
        }
    }
}
