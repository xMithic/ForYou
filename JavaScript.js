// ==========================================
// ====== CONFIGURACIÓN GENERAL        ======
// ==========================================

// 1. Música de fondo al aceptar la canción (Tu archivo local MP3 o WAV)
const CANCION_FONDO_URL = "Musica.mp3"; 

// 2. Extracción Mágica de Spotify
// Pon un enlace de Spotify aquí y la portada, el título y el artista se cargarán solos.
const ENLACE_SPOTIFY = "https://open.spotify.com/intl-es/track/58PFyeGo1oNUCMX4IZ9pW1?si=48f4d00353bb4011"; 

// 3. Datos Manuales (SOLO se usarán si borras el ENLACE_SPOTIFY dejándolo vacío "")
const IMG_PORTADA_URL = "https://i.imgur.com/KX94WfX.png"; 
const TITULO_CANCION = "Nombre de la Canción";
const AUTOR_CANCION = "Artista";

// 4. Sonido al pasar el ratón
const SONIDO_HOVER_URL = "WaterSelection.wav"; 

// 5. Sonido al hacer clic 
const SONIDO_CLICK_URL = "WaterDrop.wav"; 

// 6. Sonido de la máquina de escribir
const SONIDO_ESCRITURA_URL = "SoundText.wav";
const TONO_UNDERTALE = 300; // Solo se usa si el de arriba queda ""

// ==========================================
// ====== CONFIGURACIÓN AVANZADA       ======
// ==========================================

// Volúmenes de los audios (0.0 = silencio, 1.0 = máximo)
const VOLUMEN_MUSICA_FONDO = 0.4;
const VOLUMEN_SONIDO_HOVER = 0.4;
const VOLUMEN_SONIDO_CLICK = 0.8;
const VOLUMEN_SONIDO_ESCRITURA = 0.3;

// Aspecto del mini-reproductor musical
const WIDGET_OPACIDAD_FONDO = 0.8; // Transparencia de la cajita (0.0 a 1.0)
const WIDGET_TAMAÑO_PORTADA = 60; // Tamaño de la imagen cuadrada en píxeles
const WIDGET_TAMAÑO_TITULO = 26; // Tamaño de letra del título (en píxeles)
const WIDGET_TAMAÑO_ARTISTA = 16; // Tamaño de letra del artista (más pequeño)

// ==========================================

// Inicializar Reproductores Globales
const audioFondo = new Audio(CANCION_FONDO_URL);
audioFondo.volume = VOLUMEN_MUSICA_FONDO;
audioFondo.loop = true;

// ======== SISTEMA DE LETRAS SINCRONIZADAS ESTILO SPOTIFY ========
let parsedLyrics = [];
let currentLyricIndex = -1;
let lyricsRAF = null;           // requestAnimationFrame handle
let currentNeonColor = '#fff';  // Color neón global compartido
// Adelanta la detección para compensar el lag de rAF + CSS transition (80ms)
const LYRIC_OFFSET = -0.08;

function cleanString(str) {
    if (!str) return "";
    // Elimina basuras como "(Remasterizado)", "[Radio Edit]", "- Single"
    return str.split(/ - | \(| \[/)[0].trim();
}

// Track - las letras están listas pero quizás la caja todavía no es visible
let lyricsReadyToDisplay = false;

function showLyricsContainer() {
    lyricsReadyToDisplay = true;
    if ($('#music-player').is(':visible')) {
        $('#lyrics-container').css({ 'display': 'block', 'opacity': '0' }).animate({ opacity: 1 }, 800);
        startLyricsLoop();
    }
}

function rePositionLyricsIfReady() {
    if (!lyricsReadyToDisplay) return;
    currentLyricIndex = -1;
    $('#lyrics-container').css({ 'display': 'block', 'opacity': '0' }).animate({ opacity: 1 }, 800);
    startLyricsLoop();
}

function fetchLyrics(title, artist) {
    const cleanT = cleanString(title);
    const cleanA = cleanString(artist);
    const titleOnlyUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanT)}`;
    const artistTitleUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanA + ' ' + cleanT)}`;
    
    fetch(titleOnlyUrl)
        .then(r => r.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) throw new Error('no results');
            const syncedMatch = data.find(t => t.syncedLyrics);
            const plainMatch  = data.find(t => t.plainLyrics);
            if (syncedMatch) {
                parseLRC(syncedMatch.syncedLyrics);
                showLyricsContainer();
            } else if (plainMatch) {
                showPlainLyrics(plainMatch.plainLyrics);
            } else throw new Error('no lyrics');
        })
        .catch(() => {
            fetch(artistTitleUrl)
                .then(r => r.json())
                .then(data => {
                    if (!Array.isArray(data) || data.length === 0) return $('#lyrics-container').hide();
                    const syncedMatch = data.find(t => t.syncedLyrics);
                    const plainMatch  = data.find(t => t.plainLyrics);
                    if (syncedMatch) { parseLRC(syncedMatch.syncedLyrics); showLyricsContainer(); }
                    else if (plainMatch) { showPlainLyrics(plainMatch.plainLyrics); }
                    else { $('#lyrics-container').hide(); }
                }).catch(() => $('#lyrics-container').hide());
        });
}

function showPlainLyrics(text) {
    const lines = text.split('\n').filter(l => l.trim());
    // Para plain lyrics sin timestamps, las mostramos como scroll estático
    parsedLyrics = lines.map((t, i) => ({ time: i * 3.5, text: t }));
    buildLyricLines();
    showLyricsContainer();
}

function parseLRC(lrcText) {
    parsedLyrics = [];
    const lines = lrcText.split('\n');
    const regex = /\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/;
    lines.forEach(line => {
        const match = line.match(regex);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            const text = match[3].trim();
            if (text) parsedLyrics.push({ time: minutes * 60 + seconds, text: text });
        }
    });
    buildLyricLines();
}

// Construye todos los elementos DOM de las letras de una vez
function buildLyricLines() {
    const $inner = $('#lyrics-inner');
    $inner.empty();
    parsedLyrics.forEach((lyric, i) => {
        const $line = $('<div>')
            .addClass('lyric-scroll-line')
            .attr('data-index', i)
            .text(lyric.text);
        $inner.append($line);
    });
    currentLyricIndex = -1;
}

// Loop de sincronización de alta precisión con requestAnimationFrame
function startLyricsLoop() {
    if (lyricsRAF) cancelAnimationFrame(lyricsRAF);

    function tick() {
        // Si la canción no ha arrancado o está pausada, ocultar letras
        if (parsedLyrics.length === 0 || audioFondo.paused || audioFondo.currentTime === 0) {
            if (currentLyricIndex !== -1) {
                currentLyricIndex = -1;
                updateActiveLyric(-1);
            }
            lyricsRAF = requestAnimationFrame(tick);
            return;
        }

        // LYRIC_OFFSET: compensa el tiempo que tarda rAF->CSS transition->paint
        const t = audioFondo.currentTime + LYRIC_OFFSET;
        let newIndex = -1;
        for (let i = 0; i < parsedLyrics.length; i++) {
            if (t >= parsedLyrics[i].time) newIndex = i;
            else break;
        }

        if (newIndex !== currentLyricIndex) {
            currentLyricIndex = newIndex;
            updateActiveLyric(newIndex);
        }

        lyricsRAF = requestAnimationFrame(tick);
    }
    lyricsRAF = requestAnimationFrame(tick);
}

function updateActiveLyric(activeIndex) {
    const $inner  = $('#lyrics-inner');
    const $lines  = $inner.find('.lyric-scroll-line');

    // Antes de que empiece la canción: todo invisible
    if (activeIndex < 0) {
        $lines.css({
            opacity: 0, transform: 'scale(0.9)',
            'text-shadow': 'none', 'font-weight': 'normal', color: '#fff'
        });
        return;
    }

    // Actualizar estilos de cada línea según distancia al centro
    $lines.each(function(i) {
        const dist = Math.abs(i - activeIndex);
        const $el  = $(this);

        if (i === activeIndex) {
            $el.css({
                color:         currentNeonColor,
                opacity:       '1',
                transform:     'scale(1.08)',
                'text-shadow': `0 0 6px rgba(255,255,255,0.5), 0 0 18px ${currentNeonColor}`,
                'font-weight': 'bold'
            });
        } else {
            const fade  = Math.max(0,    1 - dist * 0.25);
            const scale = Math.max(0.82, 1 - dist * 0.05);
            $el.css({
                color:         '#fff',
                opacity:       fade.toFixed(2),
                transform:     `scale(${scale})`,
                'text-shadow': 'none',
                'font-weight': 'normal'
            });
        }
    });

    // Scroll nativo (GPU-accelerated, mismo ciclo rAF, sin jQuery lag)
    const activeDom = $lines[activeIndex];
    if (activeDom) {
        activeDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
// ==============================================================

const audioHover = new Audio(SONIDO_HOVER_URL);
audioHover.volume = VOLUMEN_SONIDO_HOVER;
const audioClick = new Audio(SONIDO_CLICK_URL);
audioClick.volume = VOLUMEN_SONIDO_CLICK;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let typeTimeouts = [];

function playUndertaleBlip() {
    if (SONIDO_ESCRITURA_URL !== "") {
        let aud = new Audio(SONIDO_ESCRITURA_URL);
        aud.volume = VOLUMEN_SONIDO_ESCRITURA; 
        aud.play().catch(e => {});
        return;
    }

    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    // Leve variación para que suene orgánico como Undertale
    const randomFreq = TONO_UNDERTALE + Math.random() * 40;
    osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime); 
    
    // Sobrescribimos con un tono más percusivo ("mejorado")
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function triggerSoundForNextScreen(nextDivId) {
    typeTimeouts.forEach(t => clearTimeout(t));
    typeTimeouts = [];

    // Limpia el cursor de cualquier otra pantalla
    $('h1, h2, h3').removeClass('typing-active');

    // Encuentra los textos en la nueva pantalla
    const els = $(nextDivId).find('h1, h2, h3');
    
    els.each(function() {
        const $el = $(this);
        const text = $el.text();
        if (!text) return;

        // JS toma control total: medimos el tamaño exacto y desaparecemos el texto (opacity 0) para que no brille antes de tiempo
        $el.css({ 'transition': 'none', 'width': 'max-content', 'opacity': '0' });
        let targetWidth = $el.width();
        
        // Devolvemos a width 0 y forzamos render
        $el.css({ 'width': '0px' });
        $el[0].offsetHeight; 
        
        const delay = $el.prop('tagName') === 'H2' ? 3500 : 0;
        
        // Programamos que se deslice desde 0 hasta el ancho exacto medido
        setTimeout(() => {
            // Le quita el cursor a otros textos de la escena y se lo pone a este
            els.removeClass('typing-active');
            $el.addClass('typing-active');

            $el.css({
                'opacity': '1', // ¡Recién al arrancar el width, encendemos el neón!
                'width': `${targetWidth + 18}px`, // Da espacio al cursor CMD sin romper de línea
                'transition': `width 3500ms steps(${text.length}, end)`
            });
        }, delay);
        
        const speed = 3500 / text.length; 

        for (let i = 0; i < text.length; i++) {
            let t = setTimeout(() => {
                playUndertaleBlip();
            }, delay + (i * speed));
            typeTimeouts.push(t);
        }
    });
}

$('.no').on("click", function () {
    $('#f1').css('display', 'none');
    $('#f2').css('display', 'flex');
    triggerSoundForNextScreen('#f2');
});

$('.weno').on("click", function () {
    $('#f2').css('display', 'none');
    $('#f1').css('display', 'flex');
    triggerSoundForNextScreen('#f1');
});

$('.si').on("click", function () {
    $('#f1').css('display', 'none');
    $('#f3').css('display', 'flex');
    triggerSoundForNextScreen('#f3');
});

$('.dale').on("click", function () {
    $('#f3').css('display', 'none');
    $('#f4').css('display', 'flex');
    triggerSoundForNextScreen('#f4');
});

$('.rega').on("click", function () {
    $('#f4').css('display', 'none');
    $('#f5').css('display', 'flex');
    triggerSoundForNextScreen('#f5');
});

$('.ojo').on("click", function () {
    $('#f5').css('display', 'none');
    $('#f6').css('display', 'flex');
    triggerSoundForNextScreen('#f6');
});

$('.afi').on("click", function () {
    $('#f6').css('display', 'none');
    $('#f7').css('display', 'flex');
    $('#f8').css('display', 'flex');
    triggerSoundForNextScreen('#f8');
});

$('.salu').on("click", function () {
    $('#f8').css('display', 'none');
    $('#f9').css('display', 'flex');
    triggerSoundForNextScreen('#f9');
});

$('.copy').on("click", function () {
    $('#f9').css('display', 'none');
    $('#f10').css('display', 'flex'); 
    $('#f11').css('display', 'flex');
    triggerSoundForNextScreen('#f11');
});

$('span.go').on("click", function () {
    $('#f13').css('display', 'none');
    $('#f14').css('display', 'block');
});

// ¡Nuevo Evento para el Reproductor Musical Nativo!
$('.reproducir').on("click", function () {
    audioFondo.currentTime = 0;
    audioFondo.play().catch(e => {});

    // Mostramos el player correctamente como flex (no block)
    $('#music-player').css({ 'display': 'flex', 'flex-direction': 'column', 'opacity': '0' })
        .animate({ opacity: 1 }, 800, function() {
            // Ahora que el padre es visible, re-posicionamos las letras
            rePositionLyricsIfReady();
        });
    
    // Evitamos multiplicar el sonido cancelando el botón
    $(this).text('> reproduciendo...');
    $(this).css({'pointer-events': 'none', 'opacity': '0.5'});
});

$('.ca1').on("click", function () {
    $('#f12').css('display', 'flex');
    $('#f13').css('display', 'block');
    triggerSoundForNextScreen('#f13');
});

$('.ca3').on("click", function () {
    $('#f15').css('display', 'block');
    $('#f16').css('display', 'flex');
    triggerSoundForNextScreen('#f16');
});

$('.ca2').on("click", function () {
    $('#f18').css('display', 'block');
    $('#f19').css('display', 'flex');
    triggerSoundForNextScreen('#f19');
});

$('.carta').on("click", function () {
    $('#f12').css('display', 'none');
});

$('.anillo').on("click", function () {
    $('#f16').css('display', 'none');
    $('#f17').css('display', 'flex');
    triggerSoundForNextScreen('#f17');
});

$('.marry').on("click", function () {
    $('#f15').css('display', 'none');
    $('#f17').css('display', 'none');
});

$('.meme').on("click", function () {
    $('#f19').css('display', 'none');
    $('#f20').css('display', 'flex');
    triggerSoundForNextScreen('#f20');
});

$('.meme2').on("click", function () {
    $('#f20').css('display', 'none');
    $('#f21').css('display', 'flex');
    triggerSoundForNextScreen('#f21');
});

$('.yes').on("click", function () {
    $('#f21').css('display', 'none');
    $('#f22').css('display', 'flex');
    triggerSoundForNextScreen('#f22');
});

// --- EFECTOS DE SONIDO UI ---
function playHoverSound() {
    audioHover.currentTime = 0;
    audioHover.play().catch(e => {});
}

function playClickSound() {
    audioClick.currentTime = 0;
    audioClick.play().catch(e => {});
}

// Configuración dinámica del widget del estéreo
$(document).ready(function() {
    // Magia Camaleónica: Extraer color dominante de la portada y aplicarlo a los textos
    $('#music-cover').on('load', function() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = this.width || 50;
            canvas.height = this.height || 50;
            context.drawImage(this, 0, 0, canvas.width, canvas.height);
            
            const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let r=0, g=0, b=0, count=0;
            
            // Buscar píxeles coloridos (ignorar los bordes aburridos muy blancos/negros)
            for (let i = 0; i < data.length; i += 16) { 
                let maxC = Math.max(data[i], data[i+1], data[i+2]);
                let minC = Math.min(data[i], data[i+1], data[i+2]);
                if (maxC > 30 && maxC < 240 && (maxC - minC) > 20) { 
                    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
                }
            }
            
            // Fallback si la imagen es puro blanco/negro/sepia
            if (count === 0) {
                for (let i = 0; i < data.length; i += 16) { 
                    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
                }
            }
            
            r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);
            
            // Iluminar el color para que parezca un neón súper brillante
            let max = Math.max(r, g, b);
            if (max > 0 && max < 255) {
                let factor = 255 / max;
                r = Math.floor(r * factor);
                g = Math.floor(g * factor);
                b = Math.floor(b * factor);
            }
            
            currentNeonColor = `rgb(${r}, ${g}, ${b})`;

            // Mismo neón en info de Spotify Y en letras sincronizadas
            $('#music-title, #music-author').css({
                color:         currentNeonColor,
                'text-shadow': `0 0 6px rgba(255,255,255,0.6), 0 0 16px ${currentNeonColor}, 0 0 30px ${currentNeonColor}`
            });
            
        } catch(e) {
            // Si el canvas falla por seguridad local, usar turquesa por defecto
            currentNeonColor = '#72efff';
            $('#music-title, #music-author').css({
                color:         currentNeonColor,
                'text-shadow': `0 0 6px rgba(255,255,255,0.6), 0 0 16px ${currentNeonColor}, 0 0 30px ${currentNeonColor}`
            });
        }
    });

    // Aplicar estilos personalizados al widget base
    $('#music-player').css('background', 'transparent');
    $('#music-cover').css({ 'width': `${WIDGET_TAMAÑO_PORTADA}px`, 'height': `${WIDGET_TAMAÑO_PORTADA}px` });
    $('#music-title').css('font-size', `${WIDGET_TAMAÑO_TITULO}px`);
    $('#music-author').css({ 'font-size': `${WIDGET_TAMAÑO_ARTISTA}px`, 'opacity': '0.65' });

    // ============================================================
    // CARGA DE SPOTIFY: proxies en cascada para máxima fiabilidad
    // ============================================================
    const PROXIES = [
        u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        u => `https://thingproxy.freeboard.io/fetch/${u}`
    ];

    function tryFetch(url, idx) {
        if (idx >= PROXIES.length) return Promise.reject(new Error('All proxies failed'));
        return fetch(PROXIES[idx](url))
            .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
            .catch(() => tryFetch(url, idx + 1));
    }

    function loadManual() {
        $('#music-cover').attr('src', IMG_PORTADA_URL || '');
        $('#music-title').text(TITULO_CANCION);
        $('#music-author').text(AUTOR_CANCION);
        fetchLyrics(TITULO_CANCION, AUTOR_CANCION);
    }

    function onSpotifyData(data) {
        if (!data || !data.thumbnail_url || !data.title) return loadManual();

        $('#music-cover').attr('src', data.thumbnail_url);
        $('#music-title').text(data.title.length > 28 ? data.title.substring(0, 28) + '…' : data.title);

        const cleanT = cleanString(data.title);
        const validArtist = data.author_name && data.author_name.toLowerCase() !== 'spotify';

        if (validArtist) {
            $('#music-author').text(data.author_name);
            fetchLyrics(cleanT, cleanString(data.author_name));
        } else {
            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanT)}&entity=song&limit=1`)
                .then(r => r.json())
                .then(ir => {
                    const artist = (ir.results && ir.results.length > 0) ? ir.results[0].artistName : AUTOR_CANCION;
                    $('#music-author').text(artist);
                    fetchLyrics(cleanT, cleanString(artist));
                })
                .catch(() => { $('#music-author').text(AUTOR_CANCION); fetchLyrics(cleanT, AUTOR_CANCION); });
        }
    }

    if (ENLACE_SPOTIFY.includes('spotify')) {
        const cleanLink = ENLACE_SPOTIFY.split('?')[0];
        tryFetch(`https://open.spotify.com/oembed?url=${cleanLink}`, 0)
            .then(onSpotifyData)
            .catch(loadManual);
    } else {
        loadManual();
    }

    $('#start-overlay').on('click', function() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playClickSound();
        $(this).fadeOut(400, function() {
            $('#f1').css('display', 'flex'); 
            triggerSoundForNextScreen('#f1');
        });
    });
});

const interactionSelectors = '.si, .no, .weno, .dale, .rega, .ojo, .afi, .salu, .copy, .box, .reproducir, span.go, .carta, .anillo, .marry, .meme, .meme2, .yes, .ca1, .ca2, .ca3';

$(interactionSelectors).on('mouseenter', function() {
    playHoverSound();
});

$(interactionSelectors).on('mousedown', function() {
    playClickSound();
});
