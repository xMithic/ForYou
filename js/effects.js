// ==========================================
// ====== EFECTOS VISUALES             ======
// — Optimizado para rendimiento móvil —
// ==========================================

// --- Flash cinemático ---
function triggerFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
}

// --- Sonidos de hover y click en opciones ---
const interactionSelectors = '.si, .no, .weno, .dale, .rega, .ojo, .afi, .salu, .copy, .box, .reproducir, span.go, .carta, .anillo, .marry, .meme, .meme2, .yes, .ca1, .ca2, .ca3';

// Usar delegación de eventos en vez de bind individual (mucho más eficiente)
$(document).on('mouseenter', interactionSelectors, function() {
    playHoverSound();
});

$(document).on('mousedown touchstart', interactionSelectors, function() {
    playClickSound();
    const $t = $(this);
    $t.addClass('text-glitch');
    setTimeout(() => $t.removeClass('text-glitch'), 400);
});

// --- Generador de partículas optimizado ---
// En móvil: menos partículas, ciclo de vida más largo, sin box-shadow
const PARTICLE_COUNT = isMobile ? 10 : 25;
const PARTICLE_LIFETIME = isMobile ? 40000 : 32000;

// Pool de partículas reutilizables (evita crear/destruir DOM constantemente)
let particlePool = [];

function initParticles() {
    // Usar DocumentFragment para inserción batch
    const frag = document.createDocumentFragment();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        resetParticle(p);
        frag.appendChild(p);
        particlePool.push(p);
    }

    document.body.appendChild(frag);

    // Reciclar partículas con temporización escalonada
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
        // Forzar reinicio de animación
        p.style.animation = 'none';
        // Trigger reflow mínimo
        void p.offsetWidth;
        p.style.animation = '';
        scheduleRecycle(p, PARTICLE_LIFETIME);
    }, delay);
}
