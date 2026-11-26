package com.orasage.tablet

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import com.orasage.tablet.databinding.ActivityMainBinding

/**
 * Complete 4:3 portrait tablet shell.
 *
 * Native left rail opens each product surface directly (BaZi / Ziwei / Tarot / Shop),
 * so Android 11 does not depend on portal HTML links or target=_blank popups.
 */
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var lastFailedUrl: String = TabletApp.HOME.url
    private var currentApp: TabletApp = TabletApp.HOME
    private var popupWebView: WebView? = null
    private val railButtons = linkedMapOf<TabletApp, TextView>()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        buildRail()
        configureWebView(binding.webView)
        // 1280×1024 panels report ~1024×1280 in portrait; keep content unscaled.
        binding.webView.setInitialScale(100)
        binding.retryButton.setOnClickListener {
            showOffline(false)
            binding.webView.loadUrl(lastFailedUrl)
        }

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    val popup = popupWebView
                    if (popup != null) {
                        if (popup.canGoBack()) {
                            popup.goBack()
                        } else {
                            dismissPopup()
                        }
                        return
                    }
                    if (binding.webView.canGoBack()) {
                        binding.webView.goBack()
                    } else if (currentApp != TabletApp.HOME) {
                        openApp(TabletApp.HOME)
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            },
        )

        val start = resolveStart(intent)
        if (savedInstanceState == null) {
            openApp(start.app, start.url)
        } else {
            currentApp = TabletApp.entries.getOrNull(savedInstanceState.getInt(STATE_APP, 0))
                ?: TabletApp.HOME
            selectRail(currentApp)
            binding.webView.restoreState(savedInstanceState)
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val start = resolveStart(intent)
        openApp(start.app, start.url)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putInt(STATE_APP, currentApp.ordinal)
        binding.webView.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        dismissPopup()
        binding.webView.apply {
            stopLoading()
            loadUrl("about:blank")
            removeAllViews()
            destroy()
        }
        super.onDestroy()
    }

    private fun buildRail() {
        val inflater = LayoutInflater.from(this)
        binding.railLinks.removeAllViews()
        railButtons.clear()
        TabletApp.entries.forEach { app ->
            val item = inflater.inflate(R.layout.rail_link, binding.railLinks, false) as TextView
            item.text = app.labelZh
            item.setOnClickListener { openApp(app) }
            binding.railLinks.addView(item)
            railButtons[app] = item
        }
    }

    private fun openApp(app: TabletApp, url: String = app.url) {
        dismissPopup()
        currentApp = app
        selectRail(app)
        lastFailedUrl = url
        showOffline(false)
        binding.webView.loadUrl(url)
    }

    private fun selectRail(app: TabletApp) {
        railButtons.forEach { (key, view) ->
            view.isSelected = key == app
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView(webView: WebView) {
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(false)
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            mediaPlaybackRequiresUserGesture = false
            javaScriptCanOpenWindowsAutomatically = true
            setSupportMultipleWindows(true)
            cacheMode = WebSettings.LOAD_DEFAULT
            // Desktop-ish UA helps some fortune UIs pick the tablet rail, while keeping Android WebView.
            userAgentString =
                "Mozilla/5.0 (Linux; Android ${Build.VERSION.RELEASE}; OraSageTablet 1024x1280) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 " +
                    "OraSageTablet/2.1 (Android; portrait; 1024x1280; panel=1280x1024)"
            // Android 11 WebView: allow file access for blob/report downloads when same-origin.
            allowFileAccess = true
            allowContentAccess = true
        }

        if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
            @Suppress("DEPRECATION")
            WebSettingsCompat.setForceDark(webView.settings, WebSettingsCompat.FORCE_DARK_OFF)
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(webView.settings, false)
        }

        webView.webChromeClient =
            object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    binding.progress.visibility = if (newProgress in 1..99) View.VISIBLE else View.GONE
                    binding.progress.progress = newProgress
                }

                override fun onCreateWindow(
                    view: WebView?,
                    isDialog: Boolean,
                    isUserGesture: Boolean,
                    resultMsg: android.os.Message?,
                ): Boolean {
                    // Keep window.open / target=_blank inside the shell (critical for BaZi checkout links).
                    val popup = WebView(this@MainActivity).apply {
                        layoutParams =
                            FrameLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT,
                            )
                    }
                    configurePopupWebView(popup)
                    val parent = binding.webView.parent as ViewGroup
                    parent.addView(popup)
                    popupWebView = popup
                    val transport = resultMsg?.obj as? WebView.WebViewTransport ?: return false
                    transport.webView = popup
                    resultMsg.sendToTarget()
                    return true
                }

                override fun onCloseWindow(window: WebView?) {
                    if (window == popupWebView) {
                        dismissPopup()
                    }
                }
            }

        webView.webViewClient =
            object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest,
                ): Boolean = handleUrl(request.url)

                @Deprecated("Deprecated in Java")
                override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean =
                    handleUrl(Uri.parse(url))

                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    showOffline(false)
                    TabletApp.fromHost(Uri.parse(url ?: return).host)?.let {
                        currentApp = it
                        selectRail(it)
                    }
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    injectTabletChrome(view)
                }

                override fun onReceivedError(
                    view: WebView,
                    request: WebResourceRequest,
                    error: WebResourceError,
                ) {
                    if (!request.isForMainFrame) return
                    lastFailedUrl = request.url.toString()
                    val detail =
                        getString(
                            R.string.offline_detail_format,
                            request.url.host ?: "",
                            error.errorCode,
                            error.description ?: "",
                        )
                    binding.offlineDetail.text = detail
                    showOffline(true)
                }
            }
    }

    /**
     * Target panel is 1280×1024 (portrait 1024×1280). Hide the site's own tablet rail /
     * desktop top menu so only the native left rail remains — avoids a double sidebar.
     */
    private fun injectTabletChrome(view: WebView?) {
        if (view == null) return
        val js =
            """
            (function(){
              if (window.__orasageTabletShell) return;
              window.__orasageTabletShell = true;
              var css = document.createElement('style');
              css.id = 'orasage-tablet-shell-css';
              css.textContent = `
                .orasage-tablet-rail { display: none !important; }
                .orasage-site-topnav-desktop, .orasage-desktop-only { display: none !important; }
                .orasage-site-mobile-nav-toggle, .orasage-site-mobile-nav-panel { display: none !important; }
                body { min-width: 0 !important; }
                @media (min-width: 600px) {
                  .orasage-app-shell, .orasage-site-chrome { padding-left: 0 !important; margin-left: 0 !important; }
                }
              `;
              (document.head || document.documentElement).appendChild(css);
              document.documentElement.setAttribute('data-orasage-tablet-shell', '1024x1280');
            })();
            """.trimIndent()
        view.evaluateJavascript(js, null)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configurePopupWebView(webView: WebView) {
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.javaScriptCanOpenWindowsAutomatically = true
        webView.settings.setSupportMultipleWindows(true)
        webView.webViewClient =
            object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest,
                ): Boolean = handleUrl(request.url)
            }
    }

    private fun dismissPopup() {
        val popup = popupWebView ?: return
        val parent = popup.parent as? ViewGroup
        parent?.removeView(popup)
        popup.stopLoading()
        popup.destroy()
        popupWebView = null
    }

    private fun handleUrl(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return true
        if (isAllowedHost(host)) {
            // Stay in-app for every OraSage subdomain, including BaZi.
            return false
        }
        // tel:/mailto: leave the shell.
        if (uri.scheme == "tel" || uri.scheme == "mailto") {
            return try {
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                true
            } catch (_: ActivityNotFoundException) {
                true
            }
        }
        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
            true
        } catch (_: ActivityNotFoundException) {
            true
        }
    }

    private fun isAllowedHost(host: String): Boolean =
        host == BuildConfig.ALLOWED_ROOT_HOST ||
            host == "www.${BuildConfig.ALLOWED_ROOT_HOST}" ||
            host.endsWith(BuildConfig.ALLOWED_HOST_SUFFIX) ||
            host == "admin.orasage.com"

    private data class Start(val app: TabletApp, val url: String)

    private fun resolveStart(intent: Intent?): Start {
        val data = intent?.data
        if (data?.scheme == "https" && data.host != null && isAllowedHost(data.host!!.lowercase())) {
            val app = TabletApp.fromHost(data.host) ?: TabletApp.HOME
            return Start(app, data.toString())
        }
        // Launcher shortcut extras: orasage://open?app=bazi
        val appId = intent?.getStringExtra(EXTRA_APP)
        val app = TabletApp.entries.find { it.id == appId } ?: TabletApp.HOME
        return Start(app, app.url)
    }

    private fun showOffline(show: Boolean) {
        binding.offlinePanel.visibility = if (show) View.VISIBLE else View.GONE
        binding.webView.visibility = if (show) View.INVISIBLE else View.VISIBLE
    }

    companion object {
        const val EXTRA_APP = "app"
        private const val STATE_APP = "state_app"
    }
}
