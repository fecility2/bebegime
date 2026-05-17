(function () {
    var ROOT_PAGE = 'index.html';
    var currentPage = (location.pathname.split('/').pop() || ROOT_PAGE).toLowerCase();
    var isIndex = currentPage === '' || currentPage === ROOT_PAGE;

    function setViewportHeight() {
        document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        if (!window.isSecureContext && location.hostname !== 'localhost') return;

        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js')
                .then(function (registration) {
                    console.log('[PWA] Service worker aktif:', registration.scope);

                    // Güncelleme bildirimi
                    registration.addEventListener('updatefound', function () {
                        var newWorker = registration.installing;
                        if (!newWorker) return;
                        newWorker.addEventListener('statechange', function () {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateBanner();
                            }
                        });
                    });
                })
                .catch(function (error) {
                    console.error('[PWA] Service worker kayıt hatası:', error);
                });
        });
    }

    // Güncelleme banner'ı
    function showUpdateBanner() {
        if (document.getElementById('pwa-update-banner')) return;
        var banner = document.createElement('div');
        banner.id = 'pwa-update-banner';
        banner.style.cssText = [
            'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
            'background:linear-gradient(135deg,#ff4b72,#ff8c00)',
            'color:#fff', 'padding:12px 20px', 'border-radius:999px',
            'font-family:Outfit,sans-serif', 'font-size:0.88rem', 'font-weight:600',
            'z-index:99999', 'cursor:pointer', 'box-shadow:0 6px 24px rgba(255,75,114,0.5)',
            'display:flex', 'align-items:center', 'gap:10px',
            'animation:pwaSlideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275)'
        ].join(';');
        banner.innerHTML = '<span>🔄</span><span>Yeni sürüm hazır!</span><button style="background:rgba(255,255,255,0.25);border:none;color:#fff;border-radius:999px;padding:5px 12px;cursor:pointer;font-weight:700;font-size:0.82rem;">Güncelle</button>';
        var style = document.createElement('style');
        style.textContent = '@keyframes pwaSlideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
        document.head.appendChild(style);
        document.body.appendChild(banner);
        banner.querySelector('button').addEventListener('click', function () {
            banner.remove();
            window.location.reload();
        });
        banner.addEventListener('click', function (e) {
            if (e.target.tagName !== 'BUTTON') banner.remove();
        });
    }

    // Offline / Online banner
    function setupOfflineBanner() {
        var banner = null;

        function showOffline() {
            if (document.getElementById('offline-banner')) return;
            banner = document.createElement('div');
            banner.id = 'offline-banner';
            banner.style.cssText = [
                'position:fixed', 'top:0', 'left:0', 'width:100%',
                'background:rgba(30,10,20,0.97)', 'color:rgba(255,255,255,0.9)',
                'text-align:center', 'padding:10px 16px',
                'font-family:Outfit,sans-serif', 'font-size:0.85rem', 'font-weight:600',
                'z-index:99998', 'border-bottom:1px solid rgba(255,75,114,0.3)',
                'backdrop-filter:blur(10px)'
            ].join(';');
            banner.innerHTML = '📴 İnternet bağlantısı yok — bazı özellikler çalışmayabilir';
            document.body.appendChild(banner);
        }

        function hideOffline() {
            var el = document.getElementById('offline-banner');
            if (el) {
                el.style.transition = 'opacity 0.4s';
                el.style.opacity = '0';
                setTimeout(function () { el.remove(); }, 400);
                // Kısa "tekrar bağlandı" mesajı
                var toast = document.createElement('div');
                toast.style.cssText = [
                    'position:fixed', 'top:10px', 'left:50%', 'transform:translateX(-50%)',
                    'background:rgba(30,215,96,0.9)', 'color:#fff',
                    'padding:8px 18px', 'border-radius:999px',
                    'font-family:Outfit,sans-serif', 'font-size:0.82rem', 'font-weight:600',
                    'z-index:99999', 'transition:opacity 0.4s'
                ].join(';');
                toast.textContent = '✅ Bağlantı geri geldi!';
                document.body.appendChild(toast);
                setTimeout(function () { toast.style.opacity = '0'; setTimeout(function () { toast.remove(); }, 400); }, 2500);
            }
        }

        if (!navigator.onLine) showOffline();
        window.addEventListener('offline', showOffline);
        window.addEventListener('online', hideOffline);
    }

    // Global haptic feedback yardımcısı
    window.haptic = function (pattern) {
        if (navigator.vibrate) navigator.vibrate(pattern || 30);
    };

    function protectKnownUserPages() {
        if (isIndex) return;
        if (localStorage.getItem('active_player')) return;

        var next = location.pathname.split('/').pop() + location.search + location.hash;
        location.replace(ROOT_PAGE + '?next=' + encodeURIComponent(next));
    }

    function markInstallMode() {
        var standalone = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true;
        document.documentElement.dataset.displayMode = standalone ? 'standalone' : 'browser';
    }

    setViewportHeight();
    markInstallMode();
    registerServiceWorker();
    protectKnownUserPages();
    setupOfflineBanner();

    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function () {
        setTimeout(setViewportHeight, 250);
    });
})();
