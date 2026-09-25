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

// ==========================================
// 🧘 SONIDO MARRÓN Y SUSPENSO SINTETIZADO (Web Audio API)
// ==========================================
let brownNoiseNode = null;
let suspenseDroneOsc = null;
let suspenseGainNode = null;

function startBrownNoiseSuspense() {
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // 1. Buffer de Sonido Marrón (Brown Noise: frecuencia grave y concentrada)
        const bufferSize = audioCtx.sampleRate * 4;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.2; // Ajuste de ganancia
        }

        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // Filtro pasabajo suave para tono profundo
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, audioCtx.currentTime);

        // 2. Drone de Suspenso (Frecuencia sub-grave 55Hz)
        suspenseDroneOsc = audioCtx.createOscillator();
        suspenseDroneOsc.type = 'sine';
        suspenseDroneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);

        const droneGain = audioCtx.createGain();
        droneGain.gain.setValueAtTime(0.12, audioCtx.currentTime);

        // LFO para efecto respiración
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime);
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(suspenseDroneOsc.frequency);

        // Ganancia principal con Fade-In
        suspenseGainNode = audioCtx.createGain();
        suspenseGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
        suspenseGainNode.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 1.2);

        // Conexiones
        noiseSource.connect(filter);
        filter.connect(suspenseGainNode);
        suspenseDroneOsc.connect(droneGain);
        droneGain.connect(suspenseGainNode);

        suspenseGainNode.connect(audioCtx.destination);

        noiseSource.start();
        suspenseDroneOsc.start();
        lfo.start();

        brownNoiseNode = { noiseSource, suspenseDroneOsc, lfo };
        console.log('[Audio] Sonido marrón y suspenso iniciado.');
    } catch(e) {
        console.warn('[Audio] No se pudo iniciar el sonido marrón:', e);
    }
}

function stopBrownNoiseSuspense() {
    if (suspenseGainNode) {
        try {
            suspenseGainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
            setTimeout(() => {
                if (brownNoiseNode) {
                    try { brownNoiseNode.noiseSource.stop(); } catch(e){}
                    try { brownNoiseNode.suspenseDroneOsc.stop(); } catch(e){}
                    try { brownNoiseNode.lfo.stop(); } catch(e){}
                    brownNoiseNode = null;
                }
            }, 850);
        } catch(e) {}
    }
}

