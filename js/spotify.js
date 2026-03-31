// ==========================================
// ====== INTEGRACIÓN CON SPOTIFY      ======
// ==========================================

// Proxies CORS en cascada (se prueban en orden hasta que uno funcione)
const PROXIES = [
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://thingproxy.freeboard.io/fetch/${u}`
];

function tryFetch(url, idx) {
    if (idx >= PROXIES.length) return Promise.reject(new Error('All proxies failed'));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    return fetch(PROXIES[idx](url), { signal: controller.signal })
        .then(res => {
            clearTimeout(timeout);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .catch(err => {
            clearTimeout(timeout);
            console.log(`[Spotify] Proxy ${idx + 1} falló: ${err.message}`);
            return tryFetch(url, idx + 1);
        });
}

// Limpia la URL de Spotify quitando /intl-XX/ y parámetros
function cleanSpotifyUrl(url) {
    // Quitar parámetros ?si=...
    let clean = url.split('?')[0];
    // Quitar prefijos de idioma /intl-es/, /intl-en/, etc.
    clean = clean.replace(/\/intl-[a-z]{2}(-[a-z]{2})?\//i, '/');
    return clean;
}

function loadManual() {
    $('#music-cover').attr('src', IMG_PORTADA_URL || '');
    $('#music-title').text(TITULO_CANCION);
    $('#music-author').text(AUTOR_CANCION);
    fetchLyrics(TITULO_CANCION, AUTOR_CANCION);
}

function onSpotifyData(data) {
    if (!data || (!data.thumbnail_url && !data.title)) return loadManual();

    if (data.thumbnail_url) {
        $('#music-cover').attr('src', data.thumbnail_url);
    }

    const displayTitle = data.title || TITULO_CANCION;
    $('#music-title').text(displayTitle.length > 28 ? displayTitle.substring(0, 28) + '…' : displayTitle);

    const cleanT = cleanString(displayTitle);
    const validArtist = data.author_name && data.author_name.toLowerCase() !== 'spotify';

    if (validArtist) {
        $('#music-author').text(data.author_name);
        fetchLyrics(cleanT, cleanString(data.author_name));
    } else {
        // Si el oEmbed no trajo artista, buscamos en iTunes
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanT)}&entity=song&limit=5`)
            .then(r => r.json())
            .then(ir => {
                let artist = AUTOR_CANCION;
                if (ir.results && ir.results.length > 0) {
                    // Intentar matchear el título exacto
                    const exactMatch = ir.results.find(r =>
                        r.trackName.toLowerCase() === cleanT.toLowerCase()
                    );
                    artist = exactMatch ? exactMatch.artistName : ir.results[0].artistName;
                }
                $('#music-author').text(artist);
                fetchLyrics(cleanT, cleanString(artist));
            })
            .catch(() => {
                $('#music-author').text(AUTOR_CANCION);
                fetchLyrics(cleanT, AUTOR_CANCION);
            });
    }
}

function initSpotify() {
    if (ENLACE_SPOTIFY.includes('spotify')) {
        const cleanLink = cleanSpotifyUrl(ENLACE_SPOTIFY);
        const oembedUrl = `https://open.spotify.com/oembed?url=${cleanLink}`;

        console.log('[Spotify] Intentando cargar:', cleanLink);

        tryFetch(oembedUrl, 0)
            .then(onSpotifyData)
            .catch(() => {
                console.log('[Spotify] Todos los proxies fallaron, usando datos manuales.');
                loadManual();
            });
    } else {
        loadManual();
    }
}
