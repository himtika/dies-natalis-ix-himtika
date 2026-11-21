
/* ==========================================================
    DIES NATALIS IX — OCEAN AUDIO SYSTEM
    Ambience, crossfade, SFX interaksi, dan kontrol suara
   ========================================================== */

// card interaktif yang menggunakan elemen div dan event JavaScript, kamu bisa menambahkan atribut berikut tanpa mengubah class
{/* <div class="..." data-sfx="button"></div> */}

// Kalau ada elemen yang tidak boleh mengeluarkan SFX, gunakan:
{/* <div class="..." data-sfx="none"></div> */}

// Untuk area kosong yang ingin dipaksa menggunakan SFX klik area kosong:
{/* <div class="..." data-sfx="empty"></div> */}

(() => {
    "use strict";

    // ========================================================
    // 1. KONFIGURASI AUDIO
    // ========================================================

    const AUDIO_PATH = "assets/sfx/";

    const AUDIO_FILES = {
        preloader: `${AUDIO_PATH}upd (preloader) ambience-di-atas-air.mp3`,
        earlier: `${AUDIO_PATH}upd (earlier-section) ambience-di-bawah-air.mp3`,
        deeper: `${AUDIO_PATH}(deeper-section) di-bawah-air.mp3`,
        addon: `${AUDIO_PATH}(addon-deeper-sec) suara-kapal-selam-melaju.mp3`,
    };

    // ========================================================
    // KONFIGURASI SFX INTERAKSI — BOLEH DIUBAH
    // ========================================================

    const INTERACTION_SFX = {
        // Klik tombol, link, card interaktif
        button: `${AUDIO_PATH}(click) splash.mp3`,

        // Klik area kosong
        // BOLEH DIGANTI ke `${AUDIO_PATH}scroll.mp3`
        // jika nantinya ingin suara yang berbeda.
        emptyArea: `${AUDIO_PATH}(click) splash.mp3`,

        // Scroll halaman
        scroll: `${AUDIO_PATH}upd (scroll) habis-nyemplung.mp3`,
    };

    const CONFIG = {
        earlierVolume: 0.35,
        deeperVolume: 0.35,
        addonVolume: 0.22,
        buttonVolume: 0.55,
        emptyAreaVolume: 0.4,
        scrollVolume: 0.3,

        crossfadeMs: 3000,
        addonDelayMs: 10000,
        scrollCooldownMs: 3000,
        scrollMinDistance: 90,

        // ID section tempat ambience berubah ke Deeper
        timelineId: "wish-section",

        storageKey: "diesnatalis-ocean-sound",
    };

    // ========================================================
    // 2. MEMBUAT AUDIO
    // ========================================================

    function createAudio(src, volume, loop = false) {
        const audio = new Audio(src);
        audio.preload = "none";
        audio.volume = volume;
        audio.loop = loop;
        return audio;
    }

    const earlier = createAudio(
        AUDIO_FILES.earlier,
        0,
        true
    );

    const deeper = createAudio(
        AUDIO_FILES.deeper,
        0,
        true
    );

    const addon = createAudio(
        AUDIO_FILES.addon,
        CONFIG.addonVolume
    );

    const buttonSfx = createAudio(
        INTERACTION_SFX.button,
        CONFIG.buttonVolume
    );

    const emptyAreaSfx = createAudio(
        INTERACTION_SFX.emptyArea,
        CONFIG.emptyAreaVolume
    );

    const scrollSfx = createAudio(
        INTERACTION_SFX.scroll,
        CONFIG.scrollVolume
    );

    const allAudio = [
        earlier,
        deeper,
        addon,
        buttonSfx,
        emptyAreaSfx,
        scrollSfx,
    ];

    let enabled = true;
    let unlocked = false;
    let currentZone = null;
    let fadeFrame = null;
    let addonTimer = null;
    let addonActive = false;

    let lastScrollSfx = -Infinity;
    let lastScrollPosition = window.scrollY;
    let accumulatedScroll = 0;
    let suppressScrollUntil = 0;
    let lastInteractionSfx = -Infinity;

    let button = null;

    try {
        enabled = sessionStorage.getItem(CONFIG.storageKey) !== "off";
    } catch (error) {}

    function safePlay(audio) {
        const promise = audio.play();

        if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
            // Browser bisa menolak autoplay sebelum interaksi.
        });
        }
    }

    function restartSfx(audio) {
        if (!enabled || !unlocked) return;

        try {
        audio.currentTime = 0;
        } catch (error) {}

        safePlay(audio);
    }

    // ========================================================
    // 3. KONTROL SPEAKER
    // ========================================================

    function updateSpeaker() {
        if (!button) return;

        button.innerHTML = enabled
        ? '<i data-lucide="volume-2"></i>'
        : '<i data-lucide="volume-x"></i>';

        button.setAttribute(
        "aria-label",
        enabled ? "Matikan suara" : "Aktifkan suara"
        );

        button.setAttribute(
        "aria-pressed",
        String(enabled)
        );

        // Gunakan SVG langsung sebagai fallback agar tidak
        // bergantung pada library ikon eksternal.
        button.innerHTML = enabled
        ? `<svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
            <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
            <path d="M19 5a10 10 0 0 1 0 14"/>
            </svg>`
        : `<svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
            <path d="m16 9 5 6"/>
            <path d="m21 9-5 6"/>
            </svg>`;
    }

    function stopAllAudio() {
        if (fadeFrame !== null) {
        cancelAnimationFrame(fadeFrame);
        fadeFrame = null;
        }

        clearTimeout(addonTimer);
        addonTimer = null;

        allAudio.forEach((audio) => audio.pause());
        addonActive = false;
    }

    function setSound(nextEnabled) {
        enabled = nextEnabled;

        try {
        sessionStorage.setItem(
            CONFIG.storageKey,
            enabled ? "on" : "off"
        );
        } catch (error) {}

        updateSpeaker();

        if (!enabled) {
        stopAllAudio();
        return;
        }

        unlocked = true;
        currentZone = null;
        syncZone(true);
    }

    function initSpeaker() {
        button = document.getElementById("ocean-sound-toggle");

        if (!button) return;

        updateSpeaker();

        button.addEventListener("click", (event) => {
        event.stopPropagation();
        setSound(!enabled);
        });
    }

    // ========================================================
    // 4. DETEKSI ZONA HALAMAN
    // ========================================================

    function getZone() {
        const timeline = document.getElementById(
        CONFIG.timelineId
        );

        if (!timeline) return "earlier";

        const boundary =
        timeline.getBoundingClientRect().top +
        window.scrollY;

        // Pergantian ketika bagian atas Timeline mencapai
        // sekitar tengah viewport.
        const switchPoint = boundary - window.innerHeight * 0.5;

        // Hysteresis 80px untuk menghindari pergantian
        // bolak-balik di sekitar batas section.
        const margin = 80;

        if (currentZone === "earlier") {
        return window.scrollY >= switchPoint + margin
            ? "deeper"
            : "earlier";
        }

        if (currentZone === "deeper") {
        return window.scrollY <= switchPoint - margin
            ? "earlier"
            : "deeper";
        }

        return window.scrollY >= switchPoint
        ? "deeper"
        : "earlier";
    }

    // ========================================================
    // 5. CROSSFADE AMBIENCE
    // ========================================================

    function crossfadeTo(zone, immediate = false) {
        if (!enabled || !unlocked) return;

        if (fadeFrame !== null) {
        cancelAnimationFrame(fadeFrame);
        fadeFrame = null;
        }

        const incoming = zone === "deeper" ? deeper : earlier;
        const outgoing = zone === "deeper" ? earlier : deeper;

        const targetVolume =
        zone === "deeper"
            ? CONFIG.deeperVolume
            : CONFIG.earlierVolume;

        const fromIncoming = incoming.volume;
        const fromOutgoing = outgoing.volume;

        safePlay(incoming);

        if (immediate) {
        incoming.volume = targetVolume;
        outgoing.volume = 0;
        outgoing.pause();
        return;
        }

        const start = performance.now();

        function animate(now) {
        if (!enabled) return;

        const progress = Math.min(
            (now - start) / CONFIG.crossfadeMs,
            1
        );

        // Kurva smoothstep
        const eased = progress * progress * (3 - 2 * progress);

        incoming.volume =
            fromIncoming +
            (targetVolume - fromIncoming) * eased;

        outgoing.volume =
            fromOutgoing * (1 - eased);

        if (progress < 1) {
            fadeFrame = requestAnimationFrame(animate);
        } else {
            incoming.volume = targetVolume;
            outgoing.volume = 0;
            outgoing.pause();
            fadeFrame = null;
        }
        }

        fadeFrame = requestAnimationFrame(animate);
    }

    // ========================================================
    // 6. ADDON KAPAL SELAM
    // ========================================================

    function stopAddon() {
        clearTimeout(addonTimer);
        addonTimer = null;

        addon.pause();
        addon.currentTime = 0;
        addonActive = false;
    }

    function scheduleAddon() {
        clearTimeout(addonTimer);
        addonTimer = null;

        if (!enabled || !unlocked || currentZone !== "deeper") {
        return;
        }

        addonTimer = setTimeout(() => {
        if (!enabled || currentZone !== "deeper") return;

        addonActive = true;
        addon.currentTime = 0;
        safePlay(addon);
        }, CONFIG.addonDelayMs);
    }

    addon.addEventListener("ended", () => {
        addonActive = false;
        scheduleAddon();
    });

    addon.addEventListener("error", () => {
        addonActive = false;
        clearTimeout(addonTimer);
        addonTimer = null;
    });

    function syncZone(immediate = false) {
        if (!enabled || !unlocked) return;

        const nextZone = getZone();

        if (nextZone === currentZone && !immediate) return;

        currentZone = nextZone;
        crossfadeTo(nextZone, immediate);

        if (nextZone === "deeper") {
        scheduleAddon();
        } else {
        stopAddon();
        }
    }

    // ========================================================
    // 7. SFX KLIK TOMBOL DAN AREA KOSONG
    // ========================================================

    const INTERACTIVE_SELECTOR = [
        "a[href]",
        "button",
        "input",
        "select",
        "textarea",
        "summary",
        '[role="button"]',
        '[role="link"]',
        '[tabindex]:not([tabindex="-1"])',
        ".slide",
        ".gallery-more",
        ".purpose-card",
        ".swiper-button-next",
        ".swiper-button-prev",
        "[data-sfx]",
    ].join(",");

    document.addEventListener("click", (event) => {
        if (!event.isTrusted) return;

        const target = event.target;
        if (!(target instanceof Element)) return;

        if (target.closest("#ocean-sound-toggle")) return;

        // Klik pertama membuka izin audio browser.
        if (!unlocked && enabled) {
        unlocked = true;
        syncZone(true);
        }

        if (!enabled || !unlocked) return;

        const override = target.closest("[data-sfx]");

        if (override?.dataset.sfx === "none") return;

        const interactive =
        override?.dataset.sfx === "button" ||
        (
            override?.dataset.sfx !== "empty" &&
            !!target.closest(INTERACTIVE_SELECTOR)
        );

        const now = performance.now();

        // Perlindungan klik ganda yang terlalu berdekatan.
        if (now - lastInteractionSfx < 60) return;
        lastInteractionSfx = now;

        if (interactive) {
        restartSfx(buttonSfx);
        } else {
        // ==================================================
        // SFX KLIK AREA KOSONG — BISA DIUBAH DI KONFIGURASI
        // Ubah INTERACTION_SFX.emptyArea jika ingin suara lain.
        // ==================================================
        restartSfx(emptyAreaSfx);
        }
    }, true);

    // ========================================================
    // 8. SFX SCROLL
    // ========================================================

    function handleScroll() {
        const now = performance.now();
        const position = window.scrollY;

        const distance = Math.abs(position - lastScrollPosition);
        lastScrollPosition = position;

        syncZone();

        if (!enabled || !unlocked) return;

        if (now < suppressScrollUntil) {
        accumulatedScroll = 0;
        return;
        }

        accumulatedScroll += distance;

        if (
        accumulatedScroll >= CONFIG.scrollMinDistance &&
        now - lastScrollSfx >= CONFIG.scrollCooldownMs
        ) {
        lastScrollSfx = now;
        accumulatedScroll = 0;

        restartSfx(scrollSfx);
        }
    }

    window.addEventListener("scroll", handleScroll, {
        passive: true,
    });

    // Smooth scroll navbar dan CTA tidak perlu
    // menghasilkan efek scroll berulang.
    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        if (target.closest('#nav-menu a[href^="#"], .button')) {
        suppressScrollUntil = performance.now() + 4000;
        accumulatedScroll = 0;
        }
    }, true);

    // ========================================================
    // 9. AKTIVASI AUDIO PERTAMA
    // ========================================================

    function unlockAudio() {
        if (!enabled || unlocked) return;

        unlocked = true;
        syncZone(true);
    }

    document.addEventListener("pointerdown", unlockAudio, {
        capture: true,
        once: true,
    });

    document.addEventListener("keydown", unlockAudio, {
        capture: true,
        once: true,
    });

    // ========================================================
    // 10. TAB BROWSER DAN INISIALISASI
    // ========================================================

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
        stopAllAudio();
        } else if (enabled && unlocked) {
        currentZone = null;
        syncZone(true);
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        initSpeaker();
        lastScrollPosition = window.scrollY;

        // Siapkan posisi zona tanpa memutar audio.
        currentZone = null;
    });

    // API kecil untuk integrasi preloader di masa depan.
    window.OceanAudio = {
        start: unlockAudio,
        mute: () => setSound(false),
        unmute: () => setSound(true),
        sync: () => syncZone(),
    };
})();
