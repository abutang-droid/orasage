package com.orasage.tablet

import android.app.Application
import android.os.Build
import android.webkit.WebView
import androidx.appcompat.app.AppCompatDelegate

/**
 * Android 11+ multi-process WebView needs a unique data directory before any WebView is created.
 */
class OraSageApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val process = Application.getProcessName()
            if (process != packageName) {
                WebView.setDataDirectorySuffix(process)
            }
        }
    }
}
