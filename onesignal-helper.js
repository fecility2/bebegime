// OneSignal Kurulum ve Bildirim Yönetimi
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.syncOneSignalUserTag = function () {
    var currentUser = localStorage.getItem('active_player');
    if (!currentUser) return;
    window.OneSignalDeferred.push(async function (OneSignal) {
        try {
            if (OneSignal?.User?.addTag) {
                await OneSignal.User.addTag("user_name", currentUser);
            }
            if (OneSignal?.Notifications?.permission === "default") {
                await OneSignal.Notifications.requestPermission();
            }
        } catch (e) {
            console.error("OneSignal etiket senkron hatası:", e);
        }
    });
};

OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
        appId: "fb28cd3b-cfb3-442c-ac6b-7792e95b2de6",
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
    window.syncOneSignalUserTag();
});

// Küresel Bildirim Gönderme Fonksiyonu
window.sendLoveNotification = async function(title, message) {
    const currentUser = localStorage.getItem('active_player');
    if (!currentUser) return;
    
    // Kime gidecek? (Ben Ayşe'ysem Mert'e, Mert'sem Ayşe'ye gitsin)
    const targetUser = (currentUser === "Ayşe") ? "Mert" : "Ayşe";
    
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic os_v2_app_7mum2o6pwncczldlo6joswzn4ycq373mp5duc55kmvf2gej45mmckslqlvuk6hesvvtvmw62yvduzv3u3dbeqt5me2bto37n35myypi"
    };
    
    const data = {
        app_id: "fb28cd3b-cfb3-442c-ac6b-7792e95b2de6",
        target_channel: "push",
        headings: { "en": title },
        contents: { "en": message },
        filters: [
            {"field": "tag", "key": "user_name", "relation": "=", "value": targetUser}
        ]
    };
    
    try {
        await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });
    } catch(e) {
        console.error("OneSignal Bildirim Hatası:", e);
    }
};

