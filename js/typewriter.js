// ==========================================
// ====== EFECTO MÁQUINA DE ESCRIBIR   ======
// — Soporta HTML dinámico y limpia loops —
// ==========================================

let typeTimeouts = [];
let typeIntervals = [];

function clearAllTypewriterLoops() {
    typeTimeouts.forEach(t => clearTimeout(t));
    typeTimeouts = [];
    typeIntervals.forEach(i => clearInterval(i));
    typeIntervals = [];
    $('.typer-cursor').remove();
}

function triggerSoundForNextScreen(nextDivId) {
    clearAllTypewriterLoops();

    const $container = $(nextDivId);
    if (!$container.length) return;

    // Forzar reseteo de animación de los botones de opción en esta pantalla
    const $options = $container.find('.si, .no, .weno, .dale, .salu, .copy, .reproducir, span.go, .carta, .rega, .ojo, .afi, .anillo, .marry, .meme, .meme2, .yes, .confirmar-nombre');
    $options.css({ 'animation': 'none', 'opacity': '0' });
    void $container[0].offsetWidth; // Repaint
    $options.css({ 'animation': '' });

    const els = $container.find('h1, h2, h3');

    els.each(function(index) {
        const $el = $(this);
        
        // Guardar la estructura HTML actual (incluyendo spans dinámicos)
        const fullHTML = $el.html().trim();
        const plainText = $el.text().trim();

        if (!plainText) return;

        // Ocultar temporalmente para la animación de tipeo
        $el.css({ 'opacity': '0' });

        // Si contiene HTML complejo (como user-name-span), revelar suavemente con fade/typewriter inteligente
        const delay = $el.prop('tagName') === 'H2' ? 1800 : (index * 600);

        let targetTimeout = setTimeout(() => {
            $('.typer-cursor').remove();
            $el.css({ 'opacity': '1' });

            let i = 0;
            const speed = Math.max(25, Math.min(80, 2500 / plainText.length));

            $el.html('<span class="typer-cursor"></span>');

            let typeInterval = setInterval(() => {
                i++;
                if (i >= plainText.length) {
                    clearInterval(typeInterval);
                    $el.html(fullHTML); // Restaurar HTML completo al finalizar
                    $('.typer-cursor').remove();
                } else {
                    let currentText = plainText.substring(0, i);
                    let formattedHTML = currentText.replace(/1-3-2/g, '<span style="color: #ffff00 !important; text-shadow: 0 0 10px #ffff00 !important;">1-3-2</span>');
                    $el.html(formattedHTML + '<span class="typer-cursor"></span>');
                    playUndertaleBlip();
                }
            }, speed);

            typeIntervals.push(typeInterval);

        }, delay);

        typeTimeouts.push(targetTimeout);
    });
}

