(function () {
    const STORAGE_KEY = 'ourstory_home_widgets';

    let pendingWidget = null;

    function escapeHTML(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
        });
    }

    function readWidgets() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            return [];
        }
    }

    function writeWidgets(widgets) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }

    function createId() {
        return 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    function typeLabel(type) {
        return {
            photo: 'Albüm fotoğrafı',
            diary: 'Günlük notu',
            list: 'Liste',
            dream: 'Hayal',
            special: 'Hatıra günü',
            envelope: 'Zaman kapsülü',
            confession: 'İtiraf',
            note: 'OurStory'
        }[type] || 'OurStory';
    }

    function showToast(message) {
        const existing = document.querySelector('.os-widget-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'os-widget-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => toast.classList.remove('show'), 2600);
        setTimeout(() => toast.remove(), 3100);
    }

    function injectStyles() {
        if (document.getElementById('os-widget-style')) return;
        const style = document.createElement('style');
        style.id = 'os-widget-style';
        style.textContent = `
            .os-widget-btn {
                border: 1px solid rgba(255,255,255,0.16);
                background: rgba(255,255,255,0.08);
                color: #fff;
                border-radius: 999px;
                min-height: 34px;
                padding: 7px 12px;
                font: inherit;
                font-size: 0.82rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                white-space: nowrap;
                transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease;
            }
            .os-widget-btn:hover {
                background: rgba(255,75,114,0.18);
                border-color: rgba(255,75,114,0.42);
            }
            .os-widget-btn:active { transform: scale(0.95); }
            .os-widget-toast {
                position: fixed;
                left: 50%;
                bottom: max(22px, env(safe-area-inset-bottom, 22px));
                transform: translate(-50%, 14px);
                opacity: 0;
                z-index: 99999;
                padding: 11px 16px;
                border-radius: 999px;
                background: rgba(15, 8, 16, 0.92);
                border: 1px solid rgba(255,255,255,0.14);
                color: #fff;
                font: 700 0.9rem 'Outfit', system-ui, sans-serif;
                box-shadow: 0 14px 40px rgba(0,0,0,0.38);
                backdrop-filter: blur(14px);
                transition: opacity 0.18s ease, transform 0.18s ease;
                max-width: calc(100vw - 28px);
                text-align: center;
            }
            .os-widget-toast.show {
                opacity: 1;
                transform: translate(-50%, 0);
            }
            .os-widget-preview-backdrop {
                position: fixed;
                inset: 0;
                z-index: 99998;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(7, 2, 8, 0.72);
                backdrop-filter: blur(16px);
            }
            .os-widget-preview-backdrop.show { display: flex; }
            .os-widget-preview-modal {
                width: min(100%, 420px);
                max-height: min(760px, calc(100vh - 36px));
                overflow: auto;
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 24px;
                background:
                    radial-gradient(circle at 20% 0%, rgba(255,75,114,0.22), transparent 34%),
                    linear-gradient(160deg, rgba(35, 18, 38, 0.96), rgba(14, 8, 18, 0.98));
                box-shadow: 0 28px 80px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.12);
                color: #fff;
                font-family: 'Outfit', system-ui, sans-serif;
            }
            .os-widget-preview-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 16px 16px 10px;
            }
            .os-widget-preview-title {
                font-size: 0.92rem;
                font-weight: 800;
                color: rgba(255,255,255,0.9);
            }
            .os-widget-preview-close {
                width: 34px;
                height: 34px;
                border: 1px solid rgba(255,255,255,0.16);
                border-radius: 999px;
                background: rgba(255,255,255,0.08);
                color: #fff;
                cursor: pointer;
                font-size: 1rem;
                line-height: 1;
            }
            .os-widget-preview-card {
                margin: 0 16px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.14);
                border-radius: 22px;
                min-height: 260px;
                background: linear-gradient(160deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04));
            }
            .os-widget-preview-img {
                width: 100%;
                height: 190px;
                display: block;
                object-fit: cover;
                background: rgba(0,0,0,0.24);
            }
            .os-widget-preview-content { padding: 18px; }
            .os-widget-preview-kicker {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                color: #ffd166;
                font-size: 0.72rem;
                font-weight: 800;
                margin-bottom: 8px;
            }
            .os-widget-preview-card h2 {
                margin: 0 0 10px;
                color: #fff;
                font-family: 'Playfair Display', Georgia, serif;
                font-size: clamp(1.7rem, 8vw, 2.45rem);
                line-height: 1.04;
                overflow-wrap: anywhere;
            }
            .os-widget-preview-text {
                color: rgba(255,255,255,0.92);
                font-family: 'Caveat', cursive;
                font-size: clamp(1.35rem, 6vw, 2rem);
                line-height: 1.12;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
            }
            .os-widget-preview-meta {
                margin-top: 14px;
                color: rgba(255,255,255,0.62);
                font-size: 0.84rem;
                line-height: 1.45;
            }
            .os-widget-preview-note {
                margin: 12px 18px 0;
                color: rgba(255,255,255,0.68);
                font-size: 0.82rem;
                line-height: 1.45;
                text-align: center;
            }
            .os-widget-preview-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                padding: 16px;
            }
            .os-widget-preview-actions button {
                min-height: 42px;
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 999px;
                color: #fff;
                font: inherit;
                font-weight: 800;
                cursor: pointer;
            }
            .os-widget-preview-cancel { background: rgba(255,255,255,0.08); }
            .os-widget-preview-confirm {
                background: linear-gradient(135deg, #ff4b72, #ff8fab);
                box-shadow: 0 12px 30px rgba(255,75,114,0.25);
            }
        `;
        document.head.appendChild(style);
    }

    function buildWidget(data) {
        return {
            id: createId(),
            type: data.type || 'note',
            title: data.title || 'OurStory',
            text: data.text || '',
            image: data.image || '',
            meta: data.meta || '',
            source: data.source || location.pathname.split('/').pop(),
            createdAt: new Date().toISOString()
        };
    }

    function ensurePreviewModal() {
        let modal = document.getElementById('os-widget-preview');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'os-widget-preview';
        modal.className = 'os-widget-preview-backdrop';
        modal.innerHTML = `
            <div class="os-widget-preview-modal" role="dialog" aria-modal="true" aria-labelledby="os-widget-preview-heading">
                <div class="os-widget-preview-head">
                    <div class="os-widget-preview-title" id="os-widget-preview-heading">Widget önizleme</div>
                    <button class="os-widget-preview-close" type="button" aria-label="Kapat" onclick="window.OurStoryWidget.cancelPreview()">×</button>
                </div>
                <div id="os-widget-preview-body"></div>
                <p class="os-widget-preview-note">Onaylayınca widget sayfası açılır. Sonra tarayıcı menüsünden telefonun ana ekranına ekleyebilirsin.</p>
                <div class="os-widget-preview-actions">
                    <button class="os-widget-preview-cancel" type="button" onclick="window.OurStoryWidget.cancelPreview()">Vazgeç</button>
                    <button class="os-widget-preview-confirm" type="button" onclick="window.OurStoryWidget.confirmPreview()">Ana ekrana ekle</button>
                </div>
            </div>
        `;
        modal.addEventListener('click', function (event) {
            if (event.target === modal) cancelPreview();
        });
        document.body.appendChild(modal);
        return modal;
    }

    function renderPreview(widget) {
        const modal = ensurePreviewModal();
        const body = modal.querySelector('#os-widget-preview-body');
        body.innerHTML = `
            <article class="os-widget-preview-card">
                ${widget.image ? `<img class="os-widget-preview-img" src="${escapeHTML(widget.image)}" alt="">` : ''}
                <div class="os-widget-preview-content">
                    <div class="os-widget-preview-kicker">📌 ${escapeHTML(typeLabel(widget.type))}</div>
                    <h2>${escapeHTML(widget.title || 'OurStory')}</h2>
                    ${widget.text ? `<div class="os-widget-preview-text">${escapeHTML(widget.text)}</div>` : ''}
                    ${widget.meta ? `<div class="os-widget-preview-meta">${escapeHTML(widget.meta)}</div>` : ''}
                </div>
            </article>
        `;
        modal.classList.add('show');
    }

    function cancelPreview() {
        const modal = document.getElementById('os-widget-preview');
        if (modal) modal.classList.remove('show');
        pendingWidget = null;
    }

    function confirmPreview() {
        if (!pendingWidget) return;
        const widgets = readWidgets();
        widgets.unshift(pendingWidget);
        writeWidgets(widgets.slice(0, 50));
        const widgetId = pendingWidget.id;
        pendingWidget = null;
        showToast('Widget hazırlandı.');
        location.href = 'widget.html?id=' + encodeURIComponent(widgetId) + '&add=1';
    }

    function save(data) {
        pendingWidget = buildWidget(data || {});
        renderPreview(pendingWidget);
        return pendingWidget;
    }

    function button(label, onclick) {
        return `<button class="os-widget-btn" type="button" onclick="${escapeHTML(onclick)}">📌 ${escapeHTML(label || 'Widget yap')}</button>`;
    }

    window.OurStoryWidget = {
        key: STORAGE_KEY,
        read: readWidgets,
        save,
        button,
        cancelPreview,
        confirmPreview
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }
})();
