// OneSignal kurulum ve bildirim yönetimi
window.OneSignalDeferred = window.OneSignalDeferred || [];

const ONESIGNAL_APP_ID = "fb28cd3b-cfb3-442c-ac6b-7792e95b2de6";

function getCurrentUserName() {
    return localStorage.getItem('active_player');
}

function getExternalUserId(userName) {
    return userName === 'Ayşe' ? 'ayse' : userName === 'Mert' ? 'mert' : '';
}

async function readPermissionState(OneSignal) {
    try {
        if (!OneSignal?.Notifications) return false;
        return Boolean(await OneSignal.Notifications.permission);
    } catch (e) {
        return false;
    }
}

window.syncOneSignalUserTag = function (options) {
    const settings = options || {};
    const currentUser = getCurrentUserName();
    const externalId = getExternalUserId(currentUser);
    console.log('[OneSignal] Kullanıcı senkron başlatıldı:', currentUser);
    if (!currentUser || !externalId) return;

    window.OneSignalDeferred.push(async function (OneSignal) {
        try {
            const supported = OneSignal?.Notifications?.isPushSupported
                ? await OneSignal.Notifications.isPushSupported()
                : true;

            if (!supported) {
                console.warn('[OneSignal] Bu tarayıcı web push desteklemiyor.');
                return;
            }

            if (OneSignal.login) {
                await OneSignal.login(externalId);
                console.log('[OneSignal] External ID bağlandı:', externalId);
            }

            if (OneSignal?.User?.addTags) {
                await OneSignal.User.addTags({
                    user_name: currentUser,
                    account: externalId
                });
            } else if (OneSignal?.User?.addTag) {
                await OneSignal.User.addTag("user_name", currentUser);
                await OneSignal.User.addTag("account", externalId);
            }

            let hasPermission = await readPermissionState(OneSignal);
            console.log('[OneSignal] Bildirim izni:', hasPermission);

            if (!hasPermission && settings.requestPermission && OneSignal?.Notifications?.requestPermission) {
                hasPermission = Boolean(await OneSignal.Notifications.requestPermission());
                console.log('[OneSignal] İzin isteği sonucu:', hasPermission);
            }

            if (hasPermission && OneSignal?.User?.PushSubscription?.optIn) {
                await OneSignal.User.PushSubscription.optIn();
            }
        } catch (e) {
            console.error("[OneSignal] Kullanıcı senkron hatası:", e);
        }
    });
};

window.getOneSignalDebugStatus = function () {
    window.OneSignalDeferred.push(async function (OneSignal) {
        const currentUser = getCurrentUserName();
        const status = {
            activePlayer: currentUser,
            externalId: getExternalUserId(currentUser),
            supported: OneSignal?.Notifications?.isPushSupported
                ? await OneSignal.Notifications.isPushSupported()
                : null,
            permission: await readPermissionState(OneSignal),
            oneSignalId: OneSignal?.User?.onesignalId ? await OneSignal.User.onesignalId : null,
            pushSubscriptionId: OneSignal?.User?.PushSubscription?.id
                ? await OneSignal.User.PushSubscription.id
                : null,
            pushOptedIn: OneSignal?.User?.PushSubscription?.optedIn
                ? await OneSignal.User.PushSubscription.optedIn
                : null
        };
        console.table(status);
        return status;
    });
};

OneSignalDeferred.push(async function (OneSignal) {
    await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: "sw.js",
        notifyButton: {
            enable: true,
            size: 'medium',
            position: 'bottom-left',
            showCredit: false,
            text: {
                'tip.state.unsubscribed': 'Bildirimleri Aç 💌',
                'tip.state.subscribed': 'Bildirimler Açık 💖',
                'tip.state.blocked': 'Bildirimler Engellendi 💔',
                'message.prenotify': 'Sana anında mesaj atabilmem için...',
                'message.action.subscribed': 'Harika, artık kapalıyken bile sesimi duyacaksın! 🥰',
                'message.action.resubscribed': 'Bildirimlerine tekrar kavuştuk! 🎉',
                'message.action.unsubscribed': 'Bir daha beni duymayacaksın... 🥺',
                'dialog.main.title': 'Aşk Portalı Bildirimleri',
                'dialog.main.button.subscribe': 'EVET LÜTFEN',
                'dialog.main.button.unsubscribe': 'İSTEMİYORUM'
            }
        }
    });
    console.log('[OneSignal] Init tamamlandı');
    window.syncOneSignalUserTag();
});

// Küresel bildirim gönderme fonksiyonu
window.sendLoveNotification = async function (title, message) {
    const currentUser = getCurrentUserName();
    if (!currentUser) {
        console.error('[OneSignal] Kullanıcı bulunamadı!');
        return;
    }

    const targetUser = currentUser === "Ayşe" ? "Mert" : "Ayşe";

    // Bu key OneSignal Dashboard > Settings > Keys & IDs > REST API Key olmalı.
    const API_KEY = "os_v2_app_7mum2o6pwncczldlo6joswzn4ycq373mp5duc55kmvf2gej45mmckslqlvuk6hesvvtvmw62yvduzv3u3dbeqt5me2bto37n35myypi";

    const data = {
        app_id: ONESIGNAL_APP_ID,
        target_channel: "push",
        headings: { "en": title, "tr": title },
        contents: { "en": message, "tr": message },
        filters: [
            { "field": "tag", "key": "user_name", "relation": "=", "value": targetUser }
        ]
    };

    try {
        console.log('[OneSignal] Bildirim gönderiliyor:', { to: targetUser, title, message });
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic " + API_KEY
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('[OneSignal] API yanıtı:', result);

        if (!response.ok) {
            console.error('[OneSignal] HTTP hatası:', response.status, response.statusText);
        }
        if (result.errors) {
            console.error('[OneSignal] API hatası:', result.errors);
        }
        if (result.recipients === 0) {
            console.warn('[OneSignal] Alıcı bulunamadı. Karşı cihazda bildirim izni veya kullanıcı etiketi eksik olabilir.');
        }
        return result;
    } catch (e) {
        console.error("[OneSignal] Bildirim hatası:", e);
    }
};

window.testNotification = function () {
    console.log('[OneSignal] Test bildirimi gönderiliyor...');
    window.sendLoveNotification("Test Bildirimi 🧪", "Bu bir test mesajıdır!");
};
