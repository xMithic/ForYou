// ==========================================
// ====== EFECTOS VISUALES             ======
// ==========================================

// --- Flash cinemático ---
function triggerFlash() {
    const $flash = $('<div class="screen-flash"></div>');
    $('body').append($flash);
    setTimeout(() => $flash.remove(), 700);
}

// --- Sonidos de hover y click en opciones ---
const interactionSelectors = '.si, .no, .weno, .dale, .rega, .ojo, .afi, .salu, .copy, .box, .reproducir, span.go, .carta, .anillo, .marry, .meme, .meme2, .yes, .ca1, .ca2, .ca3';

$(interactionSelectors).on('mouseenter', function() {
    playHoverSound();
});

$(interactionSelectors).on('mousedown', function() {
    playClickSound();
    const $t = $(this);
    $t.addClass('text-glitch');
    setTimeout(() => $t.removeClass('text-glitch'), 400);
});

// --- Generador de partículas ambientales (BLANCAS) ---
function initParticles() {
    const numParticles = 25;
    for (let i = 0; i < numParticles; i++) {
        createParticle();
    }
}

function createParticle() {
    const size = Math.floor(Math.random() * 3) + 2;

    const $p = $('<div class="particle"></div>').css({
        left: Math.random() * 100 + 'vw',
        width: size + 'px',
        height: size + 'px',
        background: '#ffffff',
        boxShadow: 'none',
        animationDuration: (Math.random() * 15 + 15) + 's',
        animationDelay: (Math.random() * 5) + 's'
    });

    $('body').append($p);

    setTimeout(() => {
        $p.remove();
        createParticle();
    }, 32000);
}
