// ==========================================
// ====== SISTEMA DE AUDIO             ======
// ==========================================

// Reproductor principal de música de fondo
const audioFondo = new Audio(CANCION_FONDO_URL);
audioFondo.volume = VOLUMEN_MUSICA_FONDO;
audioFondo.loop = true;

// Vinilo giratorio al reproducir
audioFondo.addEventListener('play', () => $('#music-cover').addClass('spin-vinyl').removeClass('paused-vinyl'));
audioFondo.addEventListener('pause', () => $('#music-cover').addClass('paused-vinyl'));

// Sonidos de interfaz
const audioHover = new Audio(SONIDO_HOVER_URL);
audioHover.volume = VOLUMEN_SONIDO_HOVER;
const audioClick = new Audio(SONIDO_CLICK_URL);
audioClick.volume = VOLUMEN_SONIDO_CLICK;

// AudioContext para sonidos sintetizados
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- Blip estilo Undertale ---
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
    const randomFreq = TONO_UNDERTALE + Math.random() * 40;
    osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// --- Sonidos UI ---
function playHoverSound() {
    audioHover.currentTime = 0;
    audioHover.play().catch(e => {});
}

function playClickSound() {
    audioClick.currentTime = 0;
    audioClick.play().catch(e => {});
}
