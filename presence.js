/**
 * presence.js
 * Tüm sayfalara eklenir. Kullanıcının çevrimiçi durumunu Firestore'a yazar.
 * Her sayfaya: <script type="module" src="presence.js"></script>
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1EbNEABIODcVts24HpES1UebXQ4wTifU",
    authDomain: "ayseye-surpriz.firebaseapp.com",
    projectId: "ayseye-surpriz",
    storageBucket: "ayseye-surpriz.firebasestorage.app",
    messagingSenderId: "531177459988",
    appId: "1:531177459988:web:09060a95bea0b06f197201"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const currentUser = localStorage.getItem('active_player');

if (currentUser === 'Ayşe' || currentUser === 'Mert') {
    const statusRef = doc(db, 'online_status', currentUser);
    
    let presenceInterval = null;
    
    const updatePresence = async (isOnline) => {
        try {
            await setDoc(statusRef, {
                last_seen: serverTimestamp(),
                online: isOnline
            }, { merge: true });
            console.log('[Presence] Durum:', currentUser, isOnline ? 'çevrimiçi' : 'çevrimdışı');
        } catch (e) {
            console.error('[Presence] Hata:', e);
        }
    };
    
    // Sayfa açıldığında çevrimiçi ol
    updatePresence(true);
    
    // Her 10 saniyede bir heartbeat gönder (sadece görünürse)
    presenceInterval = setInterval(() => {
        if (!document.hidden) {
            updatePresence(true);
        }
    }, 10000);
    
    // Sekme gizlendiğinde çevrimdışı göster
    document.addEventListener('visibilitychange', () => {
        updatePresence(!document.hidden);
    });
    
    // Sayfa kapatıldığında çevrimdışı göster
    window.addEventListener('beforeunload', () => {
        updatePresence(false);
        if (presenceInterval) {
            clearInterval(presenceInterval);
        }
    });
    
    // Mobil cihazlarda uyku modundan çıkınca güncelle
    document.addEventListener('resume', () => {
        updatePresence(true);
    });
    
    // Online/offline eventleri (internet bağlantısı)
    window.addEventListener('online', () => updatePresence(true));
    window.addEventListener('offline', () => updatePresence(false));
}
