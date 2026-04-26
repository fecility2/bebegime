// ===========================================================================
// AYŞE & MERT — GÖLGE KORUYUCU SİSTEMİ (Firebase Notifications + Full App)
// ===========================================================================

import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1EbNEABIODcVts24HpES1UebXQ4wTifU",
    authDomain: "ayseye-surpriz.firebaseapp.com",
    projectId: "ayseye-surpriz",
    storageBucket: "ayseye-surpriz.firebasestorage.app",
    messagingSenderId: "531177459988",
    appId: "1:531177459988:web:09060a95bea0b06f197201"
};

// Double-init protector
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ===========================================================================
// GÖLGE KORUYUCU — Arka Plan Mesaj Dinleyicisi
// Kullanıcı chat.html'de DEĞİLSE yeni mesajlarda bildirim gönderir
// ===========================================================================
const currentUser = localStorage.getItem('active_player');
const isOnChatPage = window.location.pathname.includes('chat.html');

if (currentUser && !isOnChatPage) {
    const partnerName = currentUser === 'Ayşe' ? 'Mert' : 'Ayşe';

    // Bildirim izni iste
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    // Global Presence: Sitede nerede olursa olsun online durumunu güncelle
    const updatePresence = async (isOnline) => {
        try {
            await setDoc(doc(db, 'online_status', currentUser), {
                last_seen: serverTimestamp(),
                online: isOnline 
            }, { merge: true });
        } catch (e) { /* sessizce geç */ }
    };

    updatePresence(true);
    window.addEventListener('focus', () => updatePresence(true));
    window.addEventListener('blur', () => updatePresence(false));
    document.addEventListener('visibilitychange', () => {
        updatePresence(!document.hidden);
    });

    // Periyodik güncelleme (Tarayıcı açık kaldığı sürece)
    setInterval(() => {
        if (!document.hidden) updatePresence(true);
    }, 10000);

    // Gölge Koruyucu — Mesajları Dinle
    let isInitialLoad = true;
    let lastKnownCount = 0;

    const q = query(
        collection(db, 'chat_messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    onSnapshot(q, (snapshot) => {
        if (isInitialLoad) {
            lastKnownCount = snapshot.size;
            isInitialLoad = false;
            return;
        }

        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                // Sadece partnerin mesajlarında bildirim ver
                if (data.sender === partnerName) {
                    triggerNotification(partnerName, data.text);
                }
            }
        });
    });

    function triggerNotification(from, text) {
        // Tarayıcı bildirimi
        if (Notification.permission === 'granted') {
            const notif = new Notification(`${from} ❤️`, {
                body: text,
                icon: './icon.svg',
                badge: './icon.svg',
                tag: 'love-message',
                renotify: true
            });
            notif.onclick = () => {
                window.focus();
                window.location.href = 'chat.html';
            };
        }

        // Ekranda da küçük bir toast göster
        showToast(from, text);
    }

    function showToast(from, text) {
        const existing = document.getElementById('msg-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'msg-toast';
        toast.style.cssText = `
            position: fixed; bottom: 130px; left: 50%; transform: translateX(-50%);
            background: rgba(20,10,15,0.97); color: #fff; padding: 16px 24px;
            border-radius: 20px; border: 1.5px solid rgba(255,75,114,0.5);
            box-shadow: 0 15px 40px rgba(0,0,0,0.7); z-index: 99999;
            font-family: 'Outfit', sans-serif; max-width: 320px; text-align: center;
            animation: toastIn 0.4s ease; cursor: pointer; backdrop-filter: blur(20px);
        `;
        toast.innerHTML = `
            <div style="font-size:1.8rem; margin-bottom:6px;">💬</div>
            <div style="font-weight:700; color:#ff4b72; margin-bottom:4px;">${from} mesaj gönderdi ❤️</div>
            <div style="font-size:0.9rem; opacity:0.85; margin-bottom:10px;">"${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"</div>
            <div style="font-size:0.75rem; opacity:0.5;">Mesajlaşmaya git →</div>
        `;
        toast.onclick = () => window.location.href = 'chat.html';

        // Toast animasyonu
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = '0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 6000);
    }
}

// ===========================================================================
// 50 AŞK NOTU (Kavanoz)
// ===========================================================================
const loveNotes = [
    "Sen hayatımda başıma gelen en güzel şeysin. ✨",
    "Gülüşün, dünyadaki tüm karanlıkları aydınlatmaya yeter. 💖",
    "Seninle geçirdiğim her saniye, ömrüme ömür katıyor. ⏳",
    "Dünyadaki en güvenli limanım senin kolların. ⚓",
    "Gözlerine her baktığımda, geleceğimi orada görüyorum. 👀",
    "Kalbinin güzelliği yüzüne öyle bir yansımış ki... 😍",
    "Seni sevmek, nefes almak kadar doğal ve zorunlu benim için. 💨",
    "Her sabah senin varlığınla uyanmak en büyük şükür sebebim. 🙏",
    "Seninleyken zamanın nasıl geçtiğini hiç anlamıyorum. 🕰️",
    "Ruhumun eşi, kalbimin tek sahibi sensin. 💍",
    "Seninle yaşlanmak, hayallerimin en tepesinde. 👵👴",
    "Elini tuttuğumda dünyayı fethedecekmişim gibi hissediyorum. 🌍",
    "Sesin, duyduğum en güzel melodi. 🎶",
    "Varlığın, hayatımın en değerli hediyesi. 🎁",
    "Seninle sıradan bir an bile, ömürlük bir anıya dönüşüyor. 📸",
    "Aşkın, damarlarımda akan en saf enerji. ⚡",
    "Sen benim evimsin; nerede olursak olalım, senin yanın huzur. 🏠",
    "Her düştüğümde beni kaldıran o sıcacık ellerini hiç bırakma. 🤝",
    "Seninle hayaller kurmak bile, onları yaşamış kadar güzel. 💭",
    "Ayşe, senin adın kalbimde sonsuz bir mührün adı. ❤️",
    "Güneş batsa da, senin parlaklığın benim yolumu aydınlatır. 🌟",
    "En zor günlerimde, senin bir tek bakışın her şeyi unutturuyor. 😊",
    "Seninle paylaştığımız sustuğumuz anlar bile çok değerli. 🤫",
    "Beni ben yapan her şeyin içinde biraz da sen varsın. 🧩",
    "Dünyayı bir kenara bıraktığım, sadece senin olduğun o yer çok güzel. 🪐",
    "Aklımda hep sen, kalbimde hep senin sevgin... 🧠❤️",
    "Seni her gün yeniden seviyorum, sanki ilk defaymış gibi. ✨",
    "Yıldızlar kadar uzaktaydın belki başlangıçta, şimdi nefesim kadar yakınımdasın. ✨",
    "Seninle kavga etmeyi bile, başkasıyla gülmeye değişmem. 😤❤️",
    "Mutfaktaki dağınıklığını bile seviyorum, senin her halin özel. 🍳",
    "Uykulu halindeki o masumiyetin, dünyadaki en tatlı şey. 😴",
    "Seninle bir kahve içmek, en lüks tatilden daha keyifli. ☕",
    "Şarkılar senin adını sayıklıyor sanki, her nakarat seni anlatıyor. 🎵",
    "Bana aşkı öğreten, sevmeyi sevdiren kadın... 👩‍🏫❤️",
    "Seninle paylaştığımız her an, bir film karesi kadar estetik. 🎞️",
    "Kalbimdeki her atış, sadece senin ismini zikrediyor: Ayşe... Ayşe... 🥁",
    "Sonsuzluk bir kavram değil, seninle geçecek ömrün adı benim için. ♾️",
    "Baharda açan ilk çiçek gibisin; taze, narin ve büyüleyici. 🌸",
    "Kışın en soğuk gününde, senin varlığın içimi ısıtan tek soba. 🔥",
    "Fırtınalara karşı durduğum o dev kale sensin. 🏰",
    "Seninle dertleşmek, dünyanın en iyi terapisinden daha etkili. 🗣️❤️",
    "Nazını, niyazını, her bir mimiğini ezbere biliyorum ve hepsine bayılıyorum. 🥰",
    "Güneşimsin; gündüzümü aydınlatan, ruhumu ısıtan... 🌞",
    "Ayımsın; gecemi parlatan, rüyalarımı süsleyen... 🌙",
    "Senin mutluluğun, benim hayattaki tek misyonum. 🎯",
    "Gözyaşlarının tek bir damlası için dünyayı yakarım, unutma. 🔥💧",
    "Birlikte yapacağımız o kadar çok şey var ki, heyecandan kalbim duracak. 🎢",
    "Hayat kumarında kazandığım en büyük ikramiye sensin. 🎰💰",
    "Seni anlatmaya kelimeler yetmez; sessizliğimdeki en büyük çığlıksın. 🤫🔊",
    "Mert, senin sevginle her gün yeniden doğuyor sevgilim. 🏁🏎️"
];

// ===========================================================================
// UYGULAMA FONKSİYONLARI (window.* = HTML onclick'lerle uyumlu)
// ===========================================================================
const audio = document.getElementById('bg-music');
let isPlaying = false;

window.startExperience = function () {
    if (audio) {
        audio.volume = 0.55;
        audio.muted = false;
        var playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(function (e) { console.log("Audio play blocked:", e); });
        }
    }
    var intro = document.getElementById('intro-screen');
    if (intro) {
        intro.style.opacity = '0';
        setTimeout(function () {
            intro.style.display = 'none';
            var pass = document.getElementById('password-screen');
            if (pass) {
                pass.style.display = 'flex';
                setTimeout(function () { pass.style.opacity = '1'; }, 50);
            }
        }, 1000);
    }
};

window.checkPassword = function () {
    const val = document.getElementById('love-password').value.trim();
    // Şifre: 25.02.2026 (ve alternatifler)
    if (['25.02.2026', '25022026', '25/02/2026', '25.02.26'].includes(val)) {
        document.getElementById('password-step').style.display = 'none';
        document.getElementById('name-selection-step').style.display = 'block';
    } else {
        var err = document.getElementById('password-error');
        if (err) {
            err.style.opacity = '1';
            setTimeout(function() { err.style.opacity = '0'; }, 3000);
        }
    }
};

window.selectUserName = function (name) {
    localStorage.setItem('active_player', name);
    sessionStorage.setItem('isLoggedIn', 'true');
    
    // Kesintisiz geçiş: Sayfayı yenilemiyoruz
    var pass = document.getElementById('password-screen');
    if (pass) {
        pass.style.opacity = '0';
        setTimeout(function() {
            pass.style.display = 'none';
            showMainDashboard();
        }, 800);
    }
};

function showMainDashboard() {
    var main = document.getElementById('main-content');
    if (main) {
        main.style.display = 'block';
        setTimeout(function() {
            main.style.opacity = '1';
            main.classList.add('visible');
        }, 10);
    }
    ['toggle-music', 'memory-jar', 'magic-heart'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    });
    if (window.initEffects) window.initEffects();
}

window.toggleHub = function () {
    const hub = document.getElementById('feature-hub');
    if (!hub) return;
    const isActive = hub.classList.contains('active');
    if (isActive) {
        hub.style.opacity = '0';
        setTimeout(() => {
            hub.classList.remove('active');
            hub.style.display = 'none';
        }, 400);
    } else {
        hub.style.display = 'flex';
        hub.classList.add('active');
        setTimeout(() => hub.style.opacity = '1', 10);
    }
};

window.openJar = function () {
    const text = document.getElementById('jar-note-text');
    const modal = document.getElementById('jar-modal');
    if (text && modal) {
        text.innerText = loveNotes[Math.floor(Math.random() * loveNotes.length)];
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }
};

window.closeJar = function () {
    const modal = document.getElementById('jar-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 500);
    }
};

window.toggleAudio = function () {
    var icon = document.getElementById('play-pause-icon');
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(() => { });
        isPlaying = true;
        if (icon) icon.innerText = '⏸';
    } else {
        audio.pause();
        isPlaying = false;
        if (icon) icon.innerText = '▶';
    }
};

window.setMood = function (mood, icon) {
    alert(`Şu an modun: ${icon}\nSenin mutluluğun benim her şeyim sevgilim! ✨❤️`);
    window.toggleHub();
};
window.triggerLoveStorm = function () {
    var defaultEmojis = ['❤️', '💕', '💖', '🌹', '✨'];
    var emojiList = (window._stormEmojis && window._stormEmojis.length > 0) ? window._stormEmojis : defaultEmojis;
    
    for (var i = 0; i < 50; i++) {
        (function(idx) {
            setTimeout(function() {
                var h = document.createElement('div');
                var randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                h.innerText = randomEmoji || '❤️';
                h.style.cssText = 'position:fixed;top:-60px;left:' + (Math.random() * 100) + 'vw;font-size:' + (Math.random() * 25 + 18) + 'px;transition:5s linear;z-index:999999;pointer-events:none;';
                document.body.appendChild(h);
                setTimeout(function() { h.style.top = '115vh'; }, 100);
                setTimeout(function() { h.remove(); }, 5500);
            }, idx * 120);
        })(i);
    }
};

// ===========================================================================
// EFEKTLER (Fare Yıldız Tozu Sadece)
// ===========================================================================
window._effectsInitialized = false;
window.initGlobalStars = function () {
    if (window._effectsInitialized) return;
    window._effectsInitialized = true;
    if (window.initMouseStars) {
        window.initMouseStars();
    }
};




// --- MOUSE YILDIZ TOZU ---
window.initMouseStars = function() {
    document.addEventListener('mousemove', function(e) {
        if (Math.random() < 0.08) {
            var p = document.createElement('div');
            p.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;pointer-events:none;font-size:14px;z-index:9999;transition:1s;line-height:1;';
            var stars = ['✨', '💫', '⭐', '🌟', '💕'];
            p.innerText = stars[Math.floor(Math.random() * stars.length)];
            document.body.appendChild(p);
            setTimeout(function() { p.style.opacity = '0'; p.style.transform = 'translateY(-30px)'; }, 100);
            setTimeout(function() { p.remove(); }, 1100);
        }
    });
};

// ===========================================================================
// BAŞLANGIÇ KONTROLÜ
// ===========================================================================
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        var intro = document.getElementById('intro-screen');
        var pass = document.getElementById('password-screen');
        if (intro) intro.style.display = 'none';
        if (pass) pass.style.display = 'none';
        showMainDashboard();
        if (window.initEffects) window.initEffects();
    }
});
