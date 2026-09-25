// ==========================================
// ====== NAVEGACIÓN ENTRE PANTALLAS   ======
// — Con efectos dramáticos ultra      ======
// — + Atmósfera progresiva            ======
// ==========================================

// f1 → f2 (No)
$('.no').on("click", function () {
    $('#f1').fadeOut(400, function() {
        $('#f2').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f2');
    });
});

// f2 → f1 (Bueno...)
$('.weno').on("click", function () {
    $('#f2').fadeOut(400, function() {
        $('#f1').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f1');
    });
});

// f1 → f3 (Sí)
$('.si').on("click", function () {
    $('#f1').fadeOut(400, function() {
        $('#f3').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f3');
    });
});

// Variable global para almacenar el nombre ingresado (tomado dinámicamente de config.js)
function getSecretName() {
    return (typeof NOMBRE_ACCESO_SECRETO !== 'undefined' && NOMBRE_ACCESO_SECRETO) ? NOMBRE_ACCESO_SECRETO : "Papa Fritas";
}

let currentUserName = getSecretName();

function updateUserNameSpans(newName) {
    currentUserName = newName || getSecretName();
    $('.user-name-span').text(currentUserName);
}

$(document).ready(function() {
    updateUserNameSpans(getSecretName());
});

// f3 → f4 (Dale) — Momento de suspenso + contraseña + sonido marrón
$('.dale').on("click", function () {
    setAtmosphere('suspense');
    triggerChromaticFlash();

    // Limpiar input y mensaje de error
    $('#user-name-input').val('');
    $('#password-error-msg').text('');

    // Iniciar sonido marrón y suspenso sintetizado
    if (typeof startBrownNoiseSuspense === 'function') {
        startBrownNoiseSuspense();
    }

    $('#f3').fadeOut(300, function() {
        $('#f4').css('display', 'flex').hide().fadeIn(400, function() {
            // Desplegar automáticamente el teclado en Android / Móviles
            const inputEl = document.getElementById('user-name-input');
            if (inputEl) {
                inputEl.focus();
                inputEl.click();
            }
        });
        triggerSoundForNextScreen('#f4');
    });
});

// Forzar apertura de teclado en móvil al tocar cualquier parte del contenedor
$(document).on('click touchstart', '.name-input-wrapper', function(e) {
    const inputEl = document.getElementById('user-name-input');
    if (inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
        inputEl.click();
    }
});

// Validar contraseña (f4 → f4b)
function submitUserName() {
    const rawVal = $('#user-name-input').val() || '';
    const cleanVal = rawVal.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanValNoSpace = cleanVal.replace(/\s+/g, '');

    const secretName = getSecretName();
    const cleanSecret = secretName.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanSecretNoSpace = cleanSecret.replace(/\s+/g, '');

    // Se acepta la contraseña configurada dinámicamente en NOMBRE_ACCESO_SECRETO
    const isCorrect = (cleanVal === cleanSecret || cleanValNoSpace === cleanSecretNoSpace);
    const $input = $('#user-name-input');
    const $errorMsg = $('#password-error-msg');

    if (!isCorrect) {
        // ❌ Contraseña incorrecta: efecto horror / susto (rojo)
        $input.removeClass('success-glow').addClass('error-shake');
        setTimeout(() => $input.removeClass('error-shake'), 500);

        $errorMsg.removeClass('password-success').addClass('password-error')
                  .text('> ACCESO DENEGADO. Esa no es la contraseña...');

        triggerScreenShake();
        triggerChromaticFlash();
        if (typeof playClickSound === 'function') playClickSound();

        $input.focus().select();
        return; // BLOQUEAR: No pasa a la siguiente sección
    }

    // ✅ Contraseña correcta: Desbloquear regalo con el nombre secreto configurado
    updateUserNameSpans(secretName);

    // Cambiar la atmósfera y fondo inmediatamente a VERDE
    setAtmosphere('success');

    $input.removeClass('error-shake').addClass('success-glow');
    $errorMsg.removeClass('password-error').addClass('password-success')
              .text('> ACCESO CONCEDIDO. ¡BIENVENIDO/A, ' + secretName.toUpperCase() + '!');

    if (typeof playClickSound === 'function') playClickSound();
    triggerFlash('green'); // Flash verde deslumbrante
    triggerChromaticFlash();
    if (typeof spawnSparkles === 'function') spawnSparkles($input[0], 10);

    // Detener sonido marrón y suspenso
    if (typeof stopBrownNoiseSuspense === 'function') {
        stopBrownNoiseSuspense();
    }

    // Pausa para que el usuario aprecie el estado y fondo verde de "ACCESO CONCEDIDO"
    setTimeout(() => {
        setAtmosphere('reveal');
        $('#f4').fadeOut(500, function() {
            $input.removeClass('success-glow');
            $errorMsg.text('').removeClass('password-success');
            $('#f4b').css('display', 'flex').hide().fadeIn(400);
            triggerSoundForNextScreen('#f4b');
        });
    }, 750);
}

$(document).on('click', '.confirmar-nombre', function() {
    submitUserName();
});

$(document).on('keypress', '#user-name-input', function(e) {
    if (e.which === 13) { // Tecla Enter
        submitUserName();
    }
});

// f4b → f5 (¿Un regalo?)
$('.rega').on("click", function () {
    triggerChromaticFlash();
    $('#f4b').fadeOut(400, function() {
        $('#f5').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f5');
    });
});

// f5 → f6 (Cerrar ojos)
$('.ojo').on("click", function () {
    triggerFlash();
    $('#f5').fadeOut(600, function() {
        $('#f6').css('display', 'flex').hide().fadeIn(600);
        triggerSoundForNextScreen('#f6');
    });
});

// f6 → f7 + f8 (Afirmarse) — ¡TERREMOTO!
$('.afi').on("click", function () {
    triggerScreenShake();
    triggerChromaticFlash();
    triggerFlash();
    
    setTimeout(() => {
        $('#f6').fadeOut(400, function() {
            $('#f7').css('display', 'flex').hide().fadeIn(600);
            $('#f8').css('display', 'flex').hide().fadeIn(600);
            triggerSoundForNextScreen('#f8');
        });
    }, 300);
});

// f8 → f9 (Saludar)
$('.salu').on("click", function () {
    $('#f8').fadeOut(400, function() {
        $('#f9').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f9');
    });
});

// f9 → f10 + f11 (Continuar — cofres aparecen)
$('.copy').on("click", function () {
    triggerChromaticFlash();
    $('#f9').fadeOut(400, function() {
        $('#f10').css('display', 'flex').hide().fadeIn(500);
        $('#f11').css('display', 'flex').hide().fadeIn(500);
        triggerSoundForNextScreen('#f11');
        
        // Sparkles de bienvenida en los cofres (delay escalonado)
        setTimeout(() => {
            document.querySelectorAll('.box').forEach((box, i) => {
                setTimeout(() => spawnSparkles(box, 3), i * 300);
            });
        }, 600);
    });
});

// Seguir leyendo (carta)
$('span.go').on("click", function () {
    setAtmosphere('intimate');
    $('#f13').fadeOut(400, function() {
        $('#f14').css('display', 'block').hide().fadeIn(400);
    });
});

// Reproducir canción
$('.reproducir').on("click", function () {
    // Si hay audio extraído desde el link de Spotify, asegurar asignación inmediata
    if (window.spotifyAudioUrl && audioFondo.src !== window.spotifyAudioUrl) {
        console.log('[Audio Player] Asignando pista enviada por Spotify:', window.spotifyAudioUrl);
        audioFondo.src = window.spotifyAudioUrl;
        audioFondo.load();
    }

    audioFondo.currentTime = 0;
    audioFondo.play().then(() => {
        console.log('[Audio Player] Reproducción de audio iniciada correctamente.');
    }).catch(e => {
        console.warn('[Audio Player] Error al reproducir audio, usando fallback:', e);
        if (CANCION_FONDO_URL && audioFondo.src !== CANCION_FONDO_URL) {
            audioFondo.src = CANCION_FONDO_URL;
            audioFondo.play().catch(() => {});
        }
    });

    triggerFlash(true);

    $('#music-player').css({ 'display': 'flex', 'flex-direction': 'column', 'opacity': '0' })
        .animate({ opacity: 1 }, 800, function() {
            rePositionLyricsIfReady();
        });

    $(this).text('> reproduciendo...');
    $(this).css({'pointer-events': 'none', 'opacity': '0.5'});
});

// Cofre 1 → Carta
$('.ca1').on("click", function () {
    spawnSparkles(this, 8);
    triggerChromaticFlash();
    triggerScreenShake();
    
    $('#f10, #ico').fadeOut(400);
    $('#f11').fadeOut(400, function() {
        $('#f7').css('background', 'transparent');
        $('#f12').css('display', 'flex').hide().fadeIn(400);
        $('#f13').css('display', 'block').hide().fadeIn(400);
        triggerSoundForNextScreen('#f13');
    });
});

// Cofre 3 → Anillos
$('.ca3').on("click", function () {
    spawnSparkles(this, 8);
    triggerChromaticFlash();
    triggerScreenShake();
    
    $('#f10, #ico').fadeOut(400);
    $('#f11').fadeOut(400, function() {
        $('#f7').css('background', 'transparent');
        $('#f15').css('display', 'block').hide().fadeIn(400);
        $('#f16').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f16');
    });
});

// Cofre 2 → Final
$('.ca2').on("click", function () {
    spawnSparkles(this, 8);
    triggerChromaticFlash();
    triggerScreenShake();
    
    $('#f10, #ico').fadeOut(400);
    $('#f11').fadeOut(400, function() {
        $('#f7').css('background', 'transparent');
        $('#f18').css('display', 'block').hide().fadeIn(400);
        $('#f19').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f19');
    });
});

// Volver a las cajas desde carta
$('.carta').on("click", function () {
    setAtmosphere('adventure');
    $('#f12').fadeOut(400, function() {
        $('#f7').css('background', '');
        $('#f10, #ico').css('display', 'flex').hide().fadeIn(400);
        $('#f11').css('display', 'flex').hide().fadeIn(400);
    });
});

// Recoger anillo — ✨ Momento mágico dorado
$('.anillo').on("click", function () {
    triggerFlash(true);
    triggerChromaticFlash();
    spawnSparkles(this, 10);
    
    // Golden sparkles extra
    setTimeout(() => spawnSparkles(this, 6), 300);
    
    $('#f16').fadeOut(400, function() {
        $('#f17').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f17');
        setAtmosphere('intimate');
        $('body').css('background-color', '#200');
    });
});

// Guardar anillos → volver a cajas
$('.marry').on("click", function () {
    setAtmosphere('adventure');
    $('#f15, #f17').fadeOut(400, function() {
        $('body').css('background-color', '');
        $('#f7').css('background', '');
        $('#f10, #ico').css('display', 'flex').hide().fadeIn(400);
        $('#f11').css('display', 'flex').hide().fadeIn(400);
    });
});

// Pregunta 1
$('.meme').on("click", function () {
    $('#f19').fadeOut(400, function() {
        $('#f20').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f20');
    });
});

// Pregunta 2 — tension builds
$('.meme2').on("click", function () {
    triggerChromaticFlash();
    setAtmosphere('intimate');
    $('#f20').fadeOut(400, function() {
        $('#f21').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f21');
    });
});

// ==========================================
// 🎉 ¡SIII! → CELEBRACIÓN ULTRA MÁXIMA
// ==========================================
$('.yes').on("click", function () {
    // 🌈 Atmosphere: celebration
    setAtmosphere('celebration');
    
    // 📺 Screen shake de emoción
    triggerScreenShake();
    
    // ⚡ Flash blanco + aberración cromática
    triggerFlash();
    triggerChromaticFlash();
    
    // 💖 Oleada 1: Corazones
    setTimeout(() => spawnHearts(isMobile ? 10 : 20), 300);
    
    // 🎊 Oleada 1: Confetti
    setTimeout(() => spawnConfetti(isMobile ? 25 : 50), 500);
    
    // ⚡ Segundo flash
    setTimeout(() => {
        triggerFlash(true);
        triggerScreenShake();
    }, 1200);
    
    // 🎊 Oleada 2: Más confetti
    setTimeout(() => spawnConfetti(isMobile ? 15 : 35), 1800);
    
    // 💖 Oleada 2: Más corazones
    setTimeout(() => spawnHearts(isMobile ? 8 : 15), 2500);
    
    // 🎊 Oleada 3: Confetti final
    setTimeout(() => spawnConfetti(isMobile ? 10 : 25), 3500);
    
    // 💖 Oleada 3: Corazones finales
    setTimeout(() => spawnHearts(isMobile ? 6 : 12), 4500);

    $('#f21').fadeOut(400, function() {
        $('#f22').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f22');
    });
});
