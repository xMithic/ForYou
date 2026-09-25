// ==========================================
// ====== CONFIGURACIÓN GENERAL        ======
// ==========================================

// Detección de dispositivo móvil (usado por lyrics.js y effects.js)
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window)
    || (window.innerWidth <= 768);

// 1. Música de fondo por defecto (se usa como respaldo si ENLACE_SPOTIFY está vacío "")
const CANCION_FONDO_URL = "assets/audio/Musica.flac";

// 2. Extracción Mágica de Spotify (extrae automáticamente la Portada, Título, Artista y el Audio de la canción)
const ENLACE_SPOTIFY = "https://open.spotify.com/intl-es/track/1FG7TNfGc5HNYauiobhZHk?si=a5b656613d21480f";

// 3. Nombre Secreto / Contraseña de Acceso (Cámbialo por el nombre real que debe escribir el usuario)
const NOMBRE_ACCESO_SECRETO = "Bby";

// 4. Datos Manuales (SOLO se usan si ENLACE_SPOTIFY queda vacío "")
const IMG_PORTADA_URL = "https://i.imgur.com/KX94WfX.png";
const TITULO_CANCION = "Nombre de la Canción";
const AUTOR_CANCION = "Artista";

// 4. Sonidos de la interfaz
const SONIDO_HOVER_URL = "WaterSelection.wav";
const SONIDO_CLICK_URL = "assets/audio/WaterDrop.wav";
const SONIDO_ESCRITURA_URL = "assets/audio/SoundText.wav";
const TONO_UNDERTALE = 300;

// ==========================================
// ====== 🖼️ IMÁGENES Y PERSONAJES       ======
// ==========================================
// Coloca aquí las URLs (enlaces) de tus propias imágenes para cambiarlas fácilmente:

// 1. Personaje Principal (Aparece en la pantalla "¡este eres tú! estás chiquito...")
const IMG_PERSONAJE_PRINCIPAL = "assets/img/Personaje.png";

// 2. Avatar del Personaje en el Escenario (Aparece caminando/flotando en el mapa del juego)
const IMG_AVATAR_ESCENARIO = "assets/img/Personaje.png";

// 3. Personaje Pareja / Ichigo (Aparece al abrir el cofre especial)
const IMG_PERSONAJE_PAREJA = "https://i.imgur.com/hGY3pGX.png";

// 4. Imagen de los Anillos de regalo (Aparece en el cofre del centro)
const IMG_ANILLOS = "https://i.imgur.com/oEs8TdL.png";

// 5. Cofres del Tesoro (Imagen cerrado e imagen al pasar el mouse por encima)
const IMG_COFRE_CERRADO = "https://i.imgur.com/ViqP2fB.png";
const IMG_COFRE_ABIERTO = "https://i.imgur.com/FIrcwmM.png";

// 6. Fondo del Escenario / Mapa del juego
const IMG_FONDO_ESCENARIO = "https://i.imgur.com/kx3psEN.png";

// Función de formateo inteligente de rutas (resuelve rutas relativas de assets locales y URLs web)
function formatCssUrl(path) {
    if (!path) return '';
    let p = path.trim();
    if (p.startsWith('url(')) p = p.substring(4, p.length - 1).replace(/["']/g, '');
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('/') || p.startsWith('data:')) {
        return `url("${p}")`;
    }
    if (p.startsWith('./')) p = p.substring(2);
    if (!p.startsWith('../')) p = '../' + p;
    return `url("${p}")`;
}

function formatDocUrl(path) {
    if (!path) return '';
    let p = path.trim();
    if (p.startsWith('url(')) p = p.substring(4, p.length - 1).replace(/["']/g, '');
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('/') || p.startsWith('data:')) {
        return `url("${p}")`;
    }
    if (p.startsWith('../')) p = p.substring(3);
    if (p.startsWith('./')) p = p.substring(2);
    return `url("${p}")`;
}

function syncConfigImages() {
    const root = document.documentElement;

    const items = [
        { jsVar: typeof IMG_PERSONAJE_PRINCIPAL !== 'undefined' ? IMG_PERSONAJE_PRINCIPAL : null, cssVar: '--img-personaje-principal', selector: '.img1' },
        { jsVar: typeof IMG_AVATAR_ESCENARIO !== 'undefined' ? IMG_AVATAR_ESCENARIO : null, cssVar: '--img-avatar-escenario', selector: '#ico' },
        { jsVar: typeof IMG_PERSONAJE_PAREJA !== 'undefined' ? IMG_PERSONAJE_PAREJA : null, cssVar: '--img-personaje-pareja', selector: '.ichigo' },
        { jsVar: typeof IMG_ANILLOS !== 'undefined' ? IMG_ANILLOS : null, cssVar: '--img-anillos', selector: '.ring' },
        { jsVar: typeof IMG_COFRE_CERRADO !== 'undefined' ? IMG_COFRE_CERRADO : null, cssVar: '--img-cofre-cerrado', selector: '.box' },
        { jsVar: typeof IMG_COFRE_ABIERTO !== 'undefined' ? IMG_COFRE_ABIERTO : null, cssVar: '--img-cofre-abierto', selector: null },
        { jsVar: typeof IMG_FONDO_ESCENARIO !== 'undefined' ? IMG_FONDO_ESCENARIO : null, cssVar: '--img-fondo-escenario', selector: '#f7' }
    ];

    items.forEach(item => {
        if (item.jsVar) {
            const cssUrl = formatCssUrl(item.jsVar);
            const docUrl = formatDocUrl(item.jsVar);
            
            root.style.setProperty(item.cssVar, cssUrl);
            
            if (item.selector && typeof $ !== 'undefined' && $(item.selector).length) {
                $(item.selector).css('background-image', docUrl);
            }
        }
    });
}

syncConfigImages();
if (typeof $ !== 'undefined') {
    $(document).ready(syncConfigImages);
} else {
    document.addEventListener('DOMContentLoaded', syncConfigImages);
}

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

// ==========================================
// ====== GUÍA DE CAMBIO DE COLORES     ======
// ==========================================
// Para cambiar los colores de la pantalla de acceso / contraseña y efectos:
// Abre el archivo 'css/variables.css' y modifica las variables del apartado 🎨 1:
//
// --paso-nombre-titulo-color: #ff2255;    -> Color del título "ACCESO RESTRINGIDO"
// --paso-nombre-subtitulo-color: #d0c0e0; -> Color del subtítulo
// --paso-nombre-input-borde: #ff2255;     -> Borde del cuadro de texto
// --paso-nombre-input-texto: #ff60b4;     -> Color del texto que escribe el usuario
// --paso-nombre-input-focus-borde: #72efff;-> Color cuando el usuario hace clic/escribe
// --paso-nombre-boton-texto: #ff4466;     -> Color del botón "[ VALIDAR CONTRASEÑA ]"
// --paso-nombre-error-color: #ff2255;     -> Color del texto "ACCESO DENEGADO"

