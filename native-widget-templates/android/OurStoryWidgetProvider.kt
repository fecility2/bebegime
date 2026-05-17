package com.ourstory.aysemert

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class OurStoryWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, appWidgetIds: IntArray) {
        appWidgetIds.forEach { widgetId ->
            val views = RemoteViews(context.packageName, R.layout.ourstory_widget)
            val prefs = context.getSharedPreferences("ourstory_widget", Context.MODE_PRIVATE)

            views.setTextViewText(R.id.widgetTitle, prefs.getString("title", "OurStory"))
            views.setTextViewText(R.id.widgetText, prefs.getString("text", "Bir hatira sec ve widget yap."))
            views.setTextViewText(R.id.widgetMeta, prefs.getString("meta", "Ayse & Mert"))

            manager.updateAppWidget(widgetId, views)
        }
    }

    companion object {
        fun requestUpdate(context: Context) {
            val intent = Intent(context, OurStoryWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(intent)
        }
    }
}
