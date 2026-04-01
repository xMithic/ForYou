// ==========================================
// ====== INICIALIZACIÓN PRINCIPAL     ======
// — Ultra Premium Edition —
// ==========================================

$(document).ready(function() {

    // --- Cursor siempre visible ---
    document.documentElement.style.cursor = 'auto';
    document.body.style.cursor = 'auto';

    // --- Ambient effects (Vignette, Noise, Breathing Glow, Light Scan) ---
    const frag = document.createDocumentFragment();

    const vignetteDiv = document.createElement('div');
    vignetteDiv.className = 'vignette-overlay';
    frag.appendChild(vignetteDiv);

    const ambientDiv = document.createElement('div');
    ambientDiv.className = 'ambient-glow';
    frag.appendChild(ambientDiv);

    const noiseDiv = document.createElement('div');
    noiseDiv.className = 'noise-overlay';
    frag.appendChild(noiseDiv);

    // CRT scan line (solo desktop)
    if (!isMobile) {
        const scanDiv = document.createElement('div');
        scanDiv.className = 'light-scan';
        frag.appendChild(scanDiv);
    }

    document.body.insertBefore(frag, document.body.firstChild);

    // --- Extracción de color dominante de la portada ---
    $('#music-cover').on('load', function() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { willReadFrequently: true });
            canvas.width = this.width || 50;
            canvas.height = this.height || 50;
            context.drawImage(this, 0, 0, canvas.width, canvas.height);

            const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let r=0, g=0, b=0, count=0;

            for (let i = 0; i < data.length; i += 16) {
                let maxC = Math.max(data[i], data[i+1], data[i+2]);
                let minC = Math.min(data[i], data[i+1], data[i+2]);
                if (maxC > 30 && maxC < 240 && (maxC - minC) > 20) {
                    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
                }
            }

            if (count === 0) {
                for (let i = 0; i < data.length; i += 16) {
                    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
                }
            }

            r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);

            let max = Math.max(r, g, b);
            if (max > 0 && max < 255) {
                let factor = 255 / max;
                r = Math.floor(r * factor);
                g = Math.floor(g * factor);
                b = Math.floor(b * factor);
            }

            currentNeonColor = `rgb(${r}, ${g}, ${b})`;

            const neonStyle = {
                color:         currentNeonColor,
                'text-shadow': `0 0 6px rgba(255,255,255,0.6), 0 0 16px ${currentNeonColor}, 0 0 30px ${currentNeonColor}`
            };

            $('#music-title, #music-author').css(neonStyle);

            // Actualizar cursor glow color con el color de la portada
            if (cursorGlowEl) {
                cursorGlowEl.style.background = `radial-gradient(circle, ${currentNeonColor.replace('rgb', 'rgba').replace(')', ', 0.06)')} 0%, transparent 70%)`;
            }

        } catch(e) {
            currentNeonColor = '#72efff';
            const fallbackStyle = {
                color:         currentNeonColor,
                'text-shadow': `0 0 6px rgba(255,255,255,0.6), 0 0 16px ${currentNeonColor}, 0 0 30px ${currentNeonColor}`
            };
            $('#music-title, #music-author').css(fallbackStyle);
        }
    });

    // --- Aplicar estilos del widget ---
    $('#music-cover').css({ 'width': `${WIDGET_TAMAÑO_PORTADA}px`, 'height': `${WIDGET_TAMAÑO_PORTADA}px` });
    $('#music-title').css('font-size', `${WIDGET_TAMAÑO_TITULO}px`);
    $('#music-author').css({ 'font-size': `${WIDGET_TAMAÑO_ARTISTA}px`, 'opacity': '0.65' });

    // --- Cargar datos de Spotify ---
    initSpotify();

    // --- Click en overlay: iniciar el juego ---
    $('#start-overlay').on('click', function() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playClickSound();
        
        triggerFlash();
        triggerChromaticFlash();
        
        // Atmosphere: initial
        setAtmosphere('adventure');
        
        $(this).fadeOut(600, function() {
            $('#f1').css('display', 'flex');
            triggerSoundForNextScreen('#f1');
        });
    });

    // --- ✨ Iniciar campo estelar ---
    initStarfield();

    // --- 💫 Iniciar estrellas fugaces ---
    initShootingStars();

    // --- Partículas ambientales ---
    initParticles();

    // --- 🔮 Cursor glow trail ---
    initCursorGlow();

    // --- 🧲 Magnetic hover ---
    initMagneticHover();

    // --- 💥 Click ripple ---
    initClickRipple();

    // --- 🎵 Audio reactive glow ---
    initAudioReactive();
});
