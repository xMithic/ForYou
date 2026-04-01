// ==========================================
// ====== CONFIGURACIÓN GENERAL        ======
// ==========================================

// Detección de dispositivo móvil (usado por lyrics.js y effects.js)
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window)
    || (window.innerWidth <= 768);

// 1. Música de fondo al aceptar la canción (archivo local)
const CANCION_FONDO_URL = "assets/audio/Musica.flac";

// 2. Extracción Mágica de Spotify
const ENLACE_SPOTIFY = "https://open.spotify.com/intl-es/track/3HMuJG1y7pyjg7Rrk17Rsb?si=c6e624e3cdaf4f32";

// 3. Datos Manuales (SOLO se usan si ENLACE_SPOTIFY queda vacío "")
const IMG_PORTADA_URL = "https://i.imgur.com/KX94WfX.png";
const TITULO_CANCION = "Nombre de la Canción";
const AUTOR_CANCION = "Artista";

// 4. Sonidos de la interfaz
const SONIDO_HOVER_URL = "WaterSelection.wav";
const SONIDO_CLICK_URL = "assets/audio/WaterDrop.wav";
const SONIDO_ESCRITURA_URL = "assets/audio/SoundText.wav";
const TONO_UNDERTALE = 300;

// ==========================================
// ====== CONFIGURACIÓN AVANZADA       ======
// ==========================================

// Volúmenes de los audios (0.0 = silencio, 1.0 = máximo)
const VOLUMEN_MUSICA_FONDO = 0.4;
const VOLUMEN_SONIDO_HOVER = 0.4;
const VOLUMEN_SONIDO_CLICK = 0.8;
const VOLUMEN_SONIDO_ESCRITURA = 0.3;

// Aspecto del mini-reproductor musical
const WIDGET_OPACIDAD_FONDO = 0.8;
const WIDGET_TAMAÑO_PORTADA = 60;
const WIDGET_TAMAÑO_TITULO = 26;
const WIDGET_TAMAÑO_ARTISTA = 16;
