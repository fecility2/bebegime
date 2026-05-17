// ============================================================
// OurStory — OneSignal Push Bildirim Yöneticisi
// ============================================================

window.OneSignalDeferred = window.OneSignalDeferred || [];

const ONESIGNAL_APP_ID  = "fb28cd3b-cfb3-442c-ac6b-7792e95b2de6";
// REST API key — sadece bildirim göndermek için kullanılır
const ONESIGNAL_REST_KEY = "os_v2_app_7mum2o6pwncczldlo6joswzn4ycq373mp5duc55kmvf2gej45mmckslqlvuk6hesvvtvmw62yvduzv3u3dbeqt5me2bto37n35myypi";

// Kullanıcı adı → external ID eşlemesi
const USER_EXTERNAL_IDS = { 'Ayşe': 'ayse', 'Mert': 'mert' };

function getCurrentUser() {
    return localStorage.getItem('active_player') || null;
}

function getExternalId(userName) {
    return USER_EXTERNAL_IDS[userName] || null;
}

// ── OneSignal init ──────────────────────────────────────────
OneSignalDeferred.push(async function (OneSignal) {
    try {
        await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            serviceWorkerPath: "sw.js",
            // Bildirim izni otomatik sorulmasın — login sonrası manuel isteyeceğiz
            autoResubscribe: true,
            notifyButton: { enable: false }
        });
        console.log('[OneSignal] Init tamamlandı');

        // Sayfa yüklenince mevcut kullanıcıyı bağla
        const user = getCurrentUser();
        if (user) {
            await _loginAndSubscribe(OneSignal, user, false);
        }
    } catch (e) {
        console.error('[OneSignal] Init hatası:', e);
    }
});

// ── Kullanıcı girişi sonrası çağrılır ──────────────────────
window.syncOneSignalUserTag = function (options) {
    const settings = options || {};
    const user = getCurrentUser();
    if (!user) return;

    window.OneSignalDeferred.push(async function (OneSignal) {
        await _loginAndSubscribe(OneSignal, user, !!settings.requestPermission);
    });
};

async function _loginAndSubscribe(OneSignal, userName, askPermission) {
    try {
        const extId = getExternalId(userName);
        if (!extId) return;

        // Push desteklenmiyor mu?
        const supported = OneSignal?.Notifications?.isPushSupported
            ? await OneSignal.Notifications.isPushSupported()
            : true;
        if (!supported) {
            console.warn('[OneSignal] Bu tarayıcı/cihaz web push desteklemiyor.');
            return;
        }

        // External ID ile login — bu sayede cihaz kullanıcıya bağlanır
        if (OneSignal.login) {
            await OneSignal.login(extId);
            console.log('[OneSignal] Login:', extId);
        }

        // Tag'leri de set et (yedek hedefleme için)
        if (OneSignal?.User?.addTags) {
            await OneSignal.User.addTags({ user_name: userName, account: extId });
        }

        // Mevcut izin durumu
        let hasPerm = await _getPermission(OneSignal);
        console.log('[OneSignal] Bildirim izni:', hasPerm);

        // iOS PWA'da veya ilk girişte izin iste
        if (!hasPerm && askPermission) {
            hasPerm = await _requestPermission(OneSignal);
        }

        // İzin varsa opt-in yap
        if (hasPerm) {
            if (OneSignal?.User?.PushSubscription?.optIn) {
                await OneSignal.User.PushSubscription.optIn();
            }
            console.log('[OneSignal] Push aboneliği aktif:', userName);
        }
    } catch (e) {
        console.error('[OneSignal] Login/subscribe hatası:', e);
    }
}

async function _getPermission(OneSignal) {
    try {
        return Boolean(await OneSignal?.Notifications?.permission);
    } catch { return false; }
}

async function _requestPermission(OneSignal) {
    try {
        if (!OneSignal?.Notifications?.requestPermission) return false;
        const result = await OneSignal.Notifications.requestPermission();
        console.log('[OneSignal] İzin isteği sonucu:', result);
        return Boolean(result);
    } catch (e) {
        console.warn('[OneSignal] İzin isteği başarısız:', e);
        return false;
    }
}

// ── Bildirim gönder ────────────────────────────────────────
// Gönderen: currentUser → Alıcı: karşı kullanıcı
window.sendLoveNotification = async function (title, message, options) {
    const sender = getCurrentUser();
    if (!sender) return;

    const targetName = sender === 'Ayşe' ? 'Mert' : 'Ayşe';
    const targetExtId = getExternalId(targetName);
    if (!targetExtId) return;

    // Bildirim payload — include_aliases ile external_id hedefleme
    // (tag filter'dan çok daha güvenilir)
    const payload = {
        app_id: ONESIGNAL_APP_ID,
        target_channel: "push",
        headings: { en: title, tr: title },
        contents: { en: message, tr: message },
        // external_id ile hedefleme — en güvenilir yöntem
        include_aliases: { external_id: [targetExtId] }
    };

    // Bildirim ikonu
    if (options?.icon) payload.chrome_web_icon = options.icon;
    if (options?.url)  payload.url = options.url;

    try {
        console.log('[OneSignal] Bildirim gönderiliyor →', targetName, '|', title);
        const res = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic " + ONESIGNAL_REST_KEY
            },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        console.log('[OneSignal] API yanıtı:', json);

        if (json.errors)       console.error('[OneSignal] Hata:', json.errors);
        if (json.recipients === 0) {
            console.warn('[OneSignal] external_id ile alıcı bulunamadı, tag filter ile tekrar deneniyor...');
            // Yedek: tag filter ile dene
            const fallbackPayload = {
                app_id: ONESIGNAL_APP_ID,
                target_channel: "push",
                headings: { en: title, tr: title },
                contents: { en: message, tr: message },
                filters: [
                    { field: "tag", key: "user_name", relation: "=", value: targetName }
                ]
            };
            if (options?.icon) fallbackPayload.chrome_web_icon = options.icon;
            if (options?.url)  fallbackPayload.url = options.url;
            const res2 = await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Basic " + ONESIGNAL_REST_KEY
                },
                body: JSON.stringify(fallbackPayload)
            });
            const json2 = await res2.json();
            console.log('[OneSignal] Tag filter yanıtı:', json2);
            if (json2.recipients === 0) {
                console.warn('[OneSignal] Alıcı bulunamadı — karşı cihazda bildirim izni veya abonelik eksik olabilir.');
            }
        }
        return json;
    } catch (e) {
        console.error('[OneSignal] Gönderim hatası:', e);
    }
};

// ── Logout ─────────────────────────────────────────────────
window.oneSignalLogout = function () {
    window.OneSignalDeferred.push(async function (OneSignal) {
        try {
            if (OneSignal.logout) await OneSignal.logout();
            console.log('[OneSignal] Logout tamamlandı');
        } catch (e) {
            console.warn('[OneSignal] Logout hatası:', e);
        }
    });
};

// ── Debug ──────────────────────────────────────────────────
window.getOneSignalDebugStatus = function () {
    window.OneSignalDeferred.push(async function (OneSignal) {
        const user = getCurrentUser();
        const status = {
            activePlayer:       user,
            externalId:         getExternalId(user),
            supported:          OneSignal?.Notifications?.isPushSupported
                                    ? await OneSignal.Notifications.isPushSupported()
                                    : 'N/A',
            permission:         await _getPermission(OneSignal),
            onesignalId:        OneSignal?.User?.onesignalId ?? 'N/A',
            pushSubscriptionId: OneSignal?.User?.PushSubscription?.id ?? 'N/A',
            pushOptedIn:        OneSignal?.User?.PushSubscription?.optedIn ?? 'N/A'
        };
        console.table(status);
        return status;
    });
};

window.testNotification = function () {
    window.sendLoveNotification("Test Bildirimi 🧪", "Bu bir test mesajıdır! Çalışıyor mu? 💌");
};
