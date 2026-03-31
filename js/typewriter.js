// ==========================================
// ====== EFECTO MÁQUINA DE ESCRIBIR   ======
// ==========================================

let typeTimeouts = [];
let typeIntervals = [];

function triggerSoundForNextScreen(nextDivId) {
    typeTimeouts.forEach(t => clearTimeout(t));
    typeTimeouts = [];
    typeIntervals.forEach(i => clearInterval(i));
    typeIntervals = [];

    // Limpia cursores previos
    $('.typer-cursor').remove();

    const els = $(nextDivId).find('h1, h2, h3');

    els.each(function() {
        const $el = $(this);

        if (!$el.data('original-text')) {
            $el.data('original-text', $el.text().trim());
        }

        const text = $el.data('original-text');
        if (!text) return;

        $el.empty();
        $el.css({ 'opacity': '0' });

        const delay = $el.prop('tagName') === 'H2' ? 3500 : 0;

        let targetTimeout = setTimeout(() => {
            $('.typer-cursor').remove();
            $el.css({ 'opacity': '1' });

            let i = 0;
            const speed = 3500 / text.length;

            $el.append('<span class="typer-cursor"></span>');

            let typeInterval = setInterval(() => {
                let currentText = text.substring(0, i + 1);

                // Highlight dinámico de "1-3-2"
                let currentHTML = currentText.replace(/1-3-2/g, '<span style="color: #ffff00 !important; text-shadow: 0 0 10px #ffff00 !important;">1-3-2</span>');

                $el.html(currentHTML);
                $el.append('<span class="typer-cursor"></span>');

                playUndertaleBlip();
                i++;

                if (i >= text.length) {
                    clearInterval(typeInterval);
                }
            }, speed);

            typeIntervals.push(typeInterval);

        }, delay);

        typeTimeouts.push(targetTimeout);
    });
}
