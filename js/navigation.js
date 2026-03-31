// ==========================================
// ====== NAVEGACIÓN ENTRE PANTALLAS   ======
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

// f3 → f4 (Dale)
$('.dale').on("click", function () {
    $('#f3').fadeOut(400, function() {
        $('#f4').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f4');
    });
});

// f4 → f5 (¿Un regalo?)
$('.rega').on("click", function () {
    $('#f4').fadeOut(400, function() {
        $('#f5').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f5');
    });
});

// f5 → f6 (Cerrar ojos)
$('.ojo').on("click", function () {
    $('#f5').fadeOut(400, function() {
        $('#f6').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f6');
    });
});

// f6 → f7 + f8 (Afirmarse)
$('.afi').on("click", function () {
    $('#f6').fadeOut(400, function() {
        $('#f7').css('display', 'flex').hide().fadeIn(400);
        $('#f8').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f8');
    });
});

// f8 → f9 (Saludar)
$('.salu').on("click", function () {
    $('#f8').fadeOut(400, function() {
        $('#f9').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f9');
    });
});

// f9 → f10 + f11 (Continuar)
$('.copy').on("click", function () {
    $('#f9').fadeOut(400, function() {
        $('#f10').css('display', 'flex').hide().fadeIn(400);
        $('#f11').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f11');
    });
});

// Seguir leyendo (carta)
$('span.go').on("click", function () {
    $('#f13').fadeOut(400, function() {
        $('#f14').css('display', 'block').hide().fadeIn(400);
    });
});

// Reproducir canción
$('.reproducir').on("click", function () {
    audioFondo.currentTime = 0;
    audioFondo.play().catch(e => {});

    $('#music-player').css({ 'display': 'flex', 'flex-direction': 'column', 'opacity': '0' })
        .animate({ opacity: 1 }, 800, function() {
            rePositionLyricsIfReady();
        });

    $(this).text('> reproduciendo...');
    $(this).css({'pointer-events': 'none', 'opacity': '0.5'});
});

// Cofre 1 → Carta
$('.ca1').on("click", function () {
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
    $('#f12').fadeOut(400, function() {
        $('#f7').css('background', '');
        $('#f10, #ico').css('display', 'flex').hide().fadeIn(400);
        $('#f11').css('display', 'flex').hide().fadeIn(400);
    });
});

// Recoger anillo
$('.anillo').on("click", function () {
    $('#f16').fadeOut(400, function() {
        $('#f17').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f17');
        $('body').css('background-color', '#200');
    });
});

// Guardar anillos → volver a cajas
$('.marry').on("click", function () {
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

// Pregunta 2
$('.meme2').on("click", function () {
    $('#f20').fadeOut(400, function() {
        $('#f21').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f21');
    });
});

// ¡SIII! → Final
$('.yes').on("click", function () {
    triggerFlash();
    $('#f21').fadeOut(400, function() {
        $('#f22').css('display', 'flex').hide().fadeIn(400);
        triggerSoundForNextScreen('#f22');
    });
});
