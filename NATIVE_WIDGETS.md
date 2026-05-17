# OurStory Native App + Widget Plan

Bu proje GitHub Pages'ta web/PWA olarak calismaya devam eder. Capacitor ise ayni HTML/CSS/JS dosyalarini Android ve iOS uygulamasinin icine paketlemek icin eklendi.

## Kurulum

1. Node.js kurulu olmali.
2. Android icin Android Studio kurulu olmali.
3. iPhone icin macOS + Xcode + Apple Developer hesabi gerekir.

Komutlar:

```bash
npm install
npm run prepare:cap
npx cap add android
npx cap add ios
npm run cap:sync
```

Android Studio:

```bash
npm run cap:android
```

Xcode:

```bash
npm run cap:ios
```

## GitHub'dan calisir mi?

Evet. GitHub Pages web uygulamasini yayinlar. Capacitor tarafinda ise GitHub repo kodu indirilir, `npm install` ve `npx cap sync` calistirilir, sonra Android Studio/Xcode ile app build edilir.

## Native widget neden ayrica kod ister?

Telefonun ana ekranindaki gercek widget, webview'in icinden olusturulamaz. Android App Widget ve iOS WidgetKit ana uygulamadan ayri native extension olarak calisir.

## Android widget yolu

Android projesi olustuktan sonra:

1. Android Studio'da `android` klasorunu ac.
2. `native-widget-templates/android/ourstory_widget_info.xml` dosyasini `android/app/src/main/res/xml/` icine kopyala.
3. `native-widget-templates/android/ourstory_widget.xml` dosyasini `android/app/src/main/res/layout/` icine kopyala.
4. `native-widget-templates/android/ourstory_widget_bg.xml` dosyasini `android/app/src/main/res/drawable/` icine kopyala.
5. `native-widget-templates/android/OurStoryWidgetProvider.kt` dosyasini `android/app/src/main/java/com/ourstory/aysemert/` icine kopyala.
6. `AndroidManifest.xml` icine widget receiver ekle.
7. Web app tarafindan secilen widget verisini native tarafa aktarmak icin Capacitor plugin veya SharedPreferences koprusu yaz.

## iOS widget yolu

iOS projesi olustuktan sonra:

1. Xcode'da `ios/App/App.xcworkspace` ac.
2. File > New > Target > Widget Extension sec.
3. App Groups ac ve app ile widget extension'a ayni group id ver.
4. `native-widget-templates/ios/OurStoryWidget.swift` icindeki kodu Widget Extension hedefindeki Swift dosyasina uygula.
5. Web app tarafindan secilen widget verisini native tarafa aktarmak icin Capacitor plugin veya UserDefaults App Group koprusu yaz.
6. WidgetKit SwiftUI view'inde bu veriyi goster.

## En pratik ilk hedef

Once native uygulamayi calistir:

```bash
npm install
npx cap add android
npm run cap:sync
npm run cap:android
```

Sonra Android widget'i eklemek iOS'a gore daha kolay oldugu icin once Android'den baslamak mantikli.
