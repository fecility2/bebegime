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
                })
                .catch(function (error) {
                    console.error('[PWA] Service worker kayıt hatası:', error);
                });
        });
    }

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

    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function () {
        setTimeout(setViewportHeight, 250);
    });
})();
