// ==========================================
// ====== EFECTOS VISUALES ULTRA       ======
// — Nivel de sitios de millones $$$   ======
// ==========================================

// ==========================================
// 🧲 MAGNETIC HOVER (Atracción magnética)
// ==========================================
let mouseX = 0, mouseY = 0;

function initMagneticHover() {
    if (isMobile) return;

    // Track mouse globally (for magnetic + glow)
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    const magneticEls = document.querySelectorAll('.box, .img1, .ring, .ichigo, #music-cover');

    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) * 0.15;
            const deltaY = (e.clientY - centerY) * 0.15;
            el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05) translateZ(0)`;
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

// ==========================================
// 🔮 CURSOR GLOW (Solo el halo luminoso, sin bolitas)
// ==========================================
let cursorGlowEl = null;
let glowRAF = null;

function initCursorGlow() {
    if (isMobile) return;

    cursorGlowEl = document.createElement('div');
    cursorGlowEl.className = 'cursor-glow';
    document.body.appendChild(cursorGlowEl);

    function updateGlow() {
        if (cursorGlowEl) {
            cursorGlowEl.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) translateZ(0)`;
        }
        glowRAF = requestAnimationFrame(updateGlow);
    }
    glowRAF = requestAnimationFrame(updateGlow);
}

// ==========================================
// 💥 CLICK RIPPLE (Onda expansiva al click)
// ==========================================
function initClickRipple() {
    document.addEventListener('click', (e) => {
        spawnClickRipple(e.clientX, e.clientY);
    });

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            spawnClickRipple(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });
}

function spawnClickRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);

    // Mini particle burst (solo desktop)
    if (!isMobile) {
        for (let i = 0; i < 6; i++) {
            const p = document.createElement('div');
            p.className = 'click-particle';
            const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
            const dist = 30 + Math.random() * 40;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            p.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                --tx: ${tx}px;
                --ty: ${ty}px;
            `;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    }

    setTimeout(() => ripple.remove(), 700);
}

// ==========================================
// 🎵 AUDIO-REACTIVE GLOW 
// — Safe: Usa un AudioContext separado con cloneNode —
// ==========================================
let audioReactiveRAF = null;
let audioReactiveActive = false;

function initAudioReactive() {
    // En vez de capturar audioFondo (lo rompe),
    // usamos un enfoque CSS-only basado en timeupdate
    audioFondo.addEventListener('play', () => {
        if (audioReactiveActive) return;
        audioReactiveActive = true;
        startSimulatedReactiveLoop();
    });
}

function startSimulatedReactiveLoop() {
    const glowEl = document.querySelector('.ambient-glow');
    const vignetteEl = document.querySelector('.vignette-overlay');
    if (!glowEl) return;

    let phase = 0;
    let lastTime = performance.now();

    function tick() {
        if (audioFondo.paused) {
            // Restaurar valores normales cuando la música está en pausa
            glowEl.style.opacity = '';
            glowEl.style.transform = '';
            if (vignetteEl) vignetteEl.style.opacity = '';
            audioReactiveRAF = requestAnimationFrame(tick);
            return;
        }

        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Simular beat con sinusoidales combinadas (orgánico y musical)
        phase += dt;
        const beat1 = Math.sin(phase * 2.5) * 0.5 + 0.5;   // Ritmo lento ~150 BPM
        const beat2 = Math.sin(phase * 4.2) * 0.3 + 0.5;   // Ritmo rápido
        const beat3 = Math.sin(phase * 0.8) * 0.2 + 0.5;   // Ola lenta
        const combined = beat1 * 0.5 + beat2 * 0.3 + beat3 * 0.2;

        const glowScale = 1 + combined * 0.08;
        const glowOpacity = 0.35 + combined * 0.4;
        glowEl.style.opacity = glowOpacity.toFixed(3);
        glowEl.style.transform = `translate(-50%, -50%) scale(${glowScale.toFixed(3)}) translateZ(0)`;

        if (vignetteEl) {
            const vigOpacity = Math.max(0.4, 1 - combined * 0.3);
            vignetteEl.style.opacity = vigOpacity.toFixed(3);
        }

        audioReactiveRAF = requestAnimationFrame(tick);
    }

    audioReactiveRAF = requestAnimationFrame(tick);
}

// ==========================================
// 🌊 PROGRESSIVE ATMOSPHERE
// ==========================================
let currentAtmosphere = 'default';
const atmospheres = {
    default:    { bg: '#111' },
    adventure:  { bg: '#0d1117' },
    reveal:     { bg: '#110d15' },
    intimate:   { bg: '#150d0d' },
    celebration:{ bg: '#0d1510' }
};

function setAtmosphere(name) {
    if (!atmospheres[name] || currentAtmosphere === name) return;
    currentAtmosphere = name;
    document.body.style.backgroundColor = atmospheres[name].bg;
}

// ==========================================
// 🔥 TEXT DECODE/SCRAMBLE EFFECT
// ==========================================
const glitchChars = '█▓▒░╔╗╚╝║═╬▄▀■□●○◆◇★☆♠♦♣♥';

function textDecodeEffect(element, finalText, duration) {
    if (!element || !finalText) return;
    const frames = Math.floor(duration / 50);
    let frame = 0;

    const interval = setInterval(() => {
        frame++;
        const progress = frame / frames;
        let result = '';

        for (let i = 0; i < finalText.length; i++) {
            if (i / finalText.length < progress - 0.1) {
                result += finalText[i];
            } else if (i / finalText.length < progress + 0.2) {
                result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                result += ' ';
            }
        }

        element.textContent = result;

        if (frame >= frames) {
            clearInterval(interval);
            element.textContent = finalText;
        }
    }, 50);
}

// ==========================================
// ⚡ FLASH CINEMÁTICO
// ==========================================
function triggerFlash(warm) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash' + (warm ? ' screen-flash-warm' : '');
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
}

function triggerChromaticFlash() {
    const el = document.createElement('div');
    el.className = 'chromatic-flash';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function triggerScreenShake() {
    const outAll = document.getElementById('out-all');
    if (!outAll) return;
    outAll.classList.remove('screen-shake');
    void outAll.offsetWidth;
    outAll.classList.add('screen-shake');
    setTimeout(() => outAll.classList.remove('screen-shake'), 600);
}

// ==========================================
// 🌀 PARALLAX DE PROFUNDIDAD (Parallax con mouse)
// ==========================================
function initParallaxDepth() {
    if (isMobile) return;

    const layers = [
        { el: '.vignette-overlay', depth: 0.005 },
        { el: '.ambient-glow', depth: 0.01 }
    ];

    document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;

        layers.forEach(layer => {
            const el = document.querySelector(layer.el);
            if (!el) return;
            const x = cx * layer.depth * 100;
            const y = cy * layer.depth * 100;
            el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) translateZ(0)`;
        });
    }, { passive: true });
}

// ==========================================
// 🌸 PÉTALOS / PARTÍCULAS LUMINOSAS (Para momentos especiales)
// ==========================================
function spawnLightOrbs(count) {
    const frag = document.createDocumentFragment();
    const num = count || (isMobile ? 6 : 12);

    for (let i = 0; i < num; i++) {
        const orb = document.createElement('div');
        orb.className = 'light-orb';
        const size = Math.floor(Math.random() * 8 + 4);
        const hue = Math.floor(Math.random() * 60 + 160); // Cyan-blue range
        const speed = (Math.random() * 4 + 4).toFixed(1);
        orb.style.cssText = `
            left: ${Math.random() * 100}vw;
            bottom: -20px;
            width: ${size}px;
            height: ${size}px;
            background: hsl(${hue}, 80%, 70%);
            box-shadow: 0 0 ${size * 2}px hsl(${hue}, 80%, 50%), 0 0 ${size * 4}px hsl(${hue}, 60%, 40%);
            --orb-speed: ${speed}s;
            animation-delay: ${(Math.random() * 2).toFixed(1)}s;
        `;
        frag.appendChild(orb);
    }

    document.body.appendChild(frag);

    setTimeout(() => {
        document.querySelectorAll('.light-orb').forEach(o => o.remove());
    }, 10000);
}

// ==========================================
// 🔊 INTERACCIONES CON SONIDO
// ==========================================
const interactionSelectors = '.si, .no, .weno, .dale, .rega, .ojo, .afi, .salu, .copy, .box, .reproducir, span.go, .carta, .anillo, .marry, .meme, .meme2, .yes, .ca1, .ca2, .ca3';

$(document).on('mouseenter', interactionSelectors, function() {
    playHoverSound();
});

$(document).on('mousedown touchstart', interactionSelectors, function(e) {
    if (e.type === 'touchstart' && e.handled) return;
    e.handled = true;
    playClickSound();
    const $t = $(this);
    $t.addClass('text-glitch');
    setTimeout(() => $t.removeClass('text-glitch'), 400);
});

// ==========================================
// ✨ CAMPO ESTELAR
// ==========================================
function initStarfield() {
    const count = isMobile ? 20 : 50;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        const speed = (Math.random() * 3 + 2).toFixed(1);
        star.style.cssText = `
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            width: ${size}px;
            height: ${size}px;
            --star-speed: ${speed}s;
            animation-delay: ${(Math.random() * 5).toFixed(1)}s;
            opacity: ${(Math.random() * 0.3 + 0.1).toFixed(2)};
        `;
        frag.appendChild(star);
    }

    document.body.appendChild(frag);
}

// ==========================================
// 💫 ESTRELLAS FUGACES
// ==========================================
let shootingStarInterval = null;

function initShootingStars() {
    if (isMobile) return;

    function launchStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        const speed = (Math.random() * 1 + 1).toFixed(1);
        star.style.cssText = `
            left: ${Math.random() * 60 + 10}vw;
            top: ${Math.random() * 40 + 5}vh;
            --shoot-speed: ${speed}s;
        `;
        document.body.appendChild(star);
        setTimeout(() => star.remove(), parseFloat(speed) * 1000 + 200);
    }

    shootingStarInterval = setInterval(() => {
        if (Math.random() > 0.4) launchStar();
    }, 6000 + Math.random() * 9000);

    setTimeout(launchStar, 4000);
}

// ==========================================
// 💖 CORAZONES FLOTANTES
// ==========================================
function spawnHearts(count) {
    const hearts = ['❤️', '💖', '💕', '💗', '💝', '🩷'];
    const frag = document.createDocumentFragment();

    for (let i = 0; i < (count || 15); i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        const speed = (Math.random() * 3 + 3).toFixed(1);
        const size = Math.floor(Math.random() * 20 + 16);
        heart.style.cssText = `
            left: ${Math.random() * 90 + 5}vw;
            font-size: ${size}px;
            --heart-speed: ${speed}s;
            animation-delay: ${(Math.random() * 2).toFixed(1)}s;
        `;
        frag.appendChild(heart);
    }

    document.body.appendChild(frag);

    setTimeout(() => {
        document.querySelectorAll('.floating-heart').forEach(h => h.remove());
    }, 8000);
}

// ==========================================
// 🎊 CONFETTI
// ==========================================
function spawnConfetti(count) {
    const colors = [
        '#ff60b4', '#72efff', '#ffff00', '#ff4444', 
        '#44ff44', '#ff8800', '#aa66ff', '#ffffff',
        '#ffd700', '#ff69b4'
    ];
    const frag = document.createDocumentFragment();
    const num = count || (isMobile ? 30 : 60);

    for (let i = 0; i < num; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speed = (Math.random() * 2 + 2.5).toFixed(1);
        const w = Math.floor(Math.random() * 6 + 5);
        const h = Math.floor(Math.random() * 8 + 8);
        c.style.cssText = `
            left: ${Math.random() * 100}vw;
            width: ${w}px;
            height: ${h}px;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            --confetti-speed: ${speed}s;
            animation-delay: ${(Math.random() * 1.5).toFixed(2)}s;
            opacity: ${(Math.random() * 0.3 + 0.7).toFixed(2)};
        `;
        frag.appendChild(c);
    }

    document.body.appendChild(frag);

    setTimeout(() => {
        document.querySelectorAll('.confetti').forEach(c => c.remove());
    }, 6000);
}

// ==========================================
// 🌟 SPARKLES
// ==========================================
function spawnSparkles(element, count) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const num = count || 5;

    for (let i = 0; i < num; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.cssText = `
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            position: fixed;
        `;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1600);
    }
}

// ==========================================
// PARTÍCULAS FLOTANTES
// ==========================================
const PARTICLE_COUNT = isMobile ? 10 : 25;
const PARTICLE_LIFETIME = isMobile ? 40000 : 32000;

let particlePool = [];

function initParticles() {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        resetParticle(p);
        frag.appendChild(p);
        particlePool.push(p);
    }

    document.body.appendChild(frag);

    particlePool.forEach((p, i) => {
        scheduleRecycle(p, PARTICLE_LIFETIME + (i * 800));
    });
}

function resetParticle(p) {
    const size = Math.floor(Math.random() * 3) + 2;
    p.style.cssText = `
        left: ${Math.random() * 100}vw;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${(Math.random() * 15 + 15)}s;
        animation-delay: ${(Math.random() * 5)}s;
    `;
}

function scheduleRecycle(p, delay) {
    setTimeout(() => {
        resetParticle(p);
        p.style.animation = 'none';
        void p.offsetWidth;
        p.style.animation = '';
        scheduleRecycle(p, PARTICLE_LIFETIME);
    }, delay);
}

// ==========================================
// Sparkles en hover de cofres
// ==========================================
$(document).on('mouseenter', '.box', function() {
    if (!isMobile) spawnSparkles(this, 3);
});
