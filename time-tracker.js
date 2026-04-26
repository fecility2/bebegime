/**
 * time-tracker.js
 * Her sayfaya <script type="module" src="time-tracker.js"></script> olarak eklenir.
 * active_player'ı localStorage'dan okur, her 60 saniyede Firestore'a +1 dk yazar.
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1EbNEABIODcVts24HpES1UebXQ4wTifU",
    authDomain: "ayseye-surpriz.firebaseapp.com",
    projectId: "ayseye-surpriz",
    storageBucket: "ayseye-surpriz.firebasestorage.app",
    messagingSenderId: "531177459988",
    appId: "1:531177459988:web:09060a95bea0b06f197201"
};

// Eğer uygulama zaten başlatıldıysa tekrar başlatma
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const currentUser = localStorage.getItem('active_player');
if (currentUser === 'Ayşe' || currentUser === 'Mert') {
    const statsRef = doc(db, 'user_stats', currentUser);

    setInterval(async () => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await setDoc(statsRef, {
                timeSpent: { [today]: increment(1) }
            }, { merge: true });
        } catch(e) { /* sessizce geç */ }
    }, 60000); // Her 60 saniyede +1 dakika
}
