// ==========================================
// ====== INTEGRACIÓN CON SPOTIFY      ======
// — Extrae portada, título, artista y audio —
// ==========================================

// Limpia la URL de Spotify quitando /intl-XX/ y parámetros ?si=...
function cleanSpotifyUrl(url) {
    if (!url) return "";
    let clean = url.split('?')[0].trim();
    clean = clean.replace(/\/intl-[a-z]{2}(-[a-z]{2})?\//i, '/');
    if (clean.startsWith('spotify:track:')) {
        clean = 'https://open.spotify.com/track/' + clean.split(':').pop();
    }
    return clean;
}

function loadManual() {
    if (typeof IMG_PORTADA_URL !== 'undefined' && IMG_PORTADA_URL) {
        $('#music-cover').attr('src', IMG_PORTADA_URL);
    }
    if (typeof TITULO_CANCION !== 'undefined') {
        $('#music-title').text(TITULO_CANCION);
    }
    if (typeof AUTOR_CANCION !== 'undefined') {
        $('#music-author').text(AUTOR_CANCION);
    }
    if (typeof fetchLyrics === 'function' && typeof TITULO_CANCION !== 'undefined') {
        fetchLyrics(cleanString(TITULO_CANCION), cleanString(AUTOR_CANCION || ''));
    }
}

function initSpotify() {
    if (typeof ENLACE_SPOTIFY === 'undefined' || !ENLACE_SPOTIFY || !ENLACE_SPOTIFY.includes('spotify')) {
        console.log('[Spotify] No hay enlace de Spotify configurado, usando datos manuales.');
        return loadManual();
    }

    const cleanLink = cleanSpotifyUrl(ENLACE_SPOTIFY);
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(cleanLink)}`;

    console.log('[Spotify] Cargando datos desde Spotify:', cleanLink);

    // 1. Obtener metadatos oficiales de Spotify vía oEmbed (nativamente soportado con CORS)
    fetch(oembedUrl)
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            processSpotifyData(data);
        })
        .catch(err => {
            console.warn('[Spotify] Error en oEmbed directo:', err.message);
            // Si oEmbed falla por URL inválida o red, intentamos búsqueda por término en iTunes
            const trackId = (cleanLink.match(/track\/([a-zA-Z0-9]+)/) || [])[1];
            if (trackId) {
                const searchFallback = (typeof TITULO_CANCION !== 'undefined' && TITULO_CANCION !== 'Nombre de la Canción') 
                    ? `${TITULO_CANCION} ${AUTOR_CANCION}` 
                    : trackId;
                searchAudioAndMetadata(searchFallback);
            } else {
                loadManual();
            }
        });
}

function processSpotifyData(data) {
    if (!data) return loadManual();

    // Portada de Spotify CDN
    if (data.thumbnail_url) {
        $('#music-cover').attr('src', data.thumbnail_url);
    } else if (typeof IMG_PORTADA_URL !== 'undefined' && IMG_PORTADA_URL) {
        $('#music-cover').attr('src', IMG_PORTADA_URL);
    }

    const rawTitle = data.title || (typeof TITULO_CANCION !== 'undefined' ? TITULO_CANCION : '');
    const cleanT = typeof cleanString === 'function' ? cleanString(rawTitle) : rawTitle;
    let artist = (data.author_name && data.author_name.toLowerCase() !== 'spotify') ? data.author_name : '';

    // 2. Buscar audio stream en vivo y datos precisos del artista
    const searchQuery = artist ? `${cleanT} ${cleanString(artist)}` : cleanT;
    searchAudioAndMetadata(searchQuery, rawTitle, artist);
}

function searchAudioAndMetadata(query, fallbackTitle, fallbackArtist) {
    const cleanQ = typeof cleanString === 'function' ? cleanString(query) : query;
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&entity=song&limit=5`;

    fetch(itunesUrl)
        .then(res => res.json())
        .then(data => {
            let matchedTrack = null;
            if (data.results && data.results.length > 0) {
                // Coincidencia con título o primer resultado
                matchedTrack = data.results.find(r => 
                    r.trackName && r.trackName.toLowerCase() === cleanQ.toLowerCase()
                ) || data.results[0];
            }

            const finalTitle = matchedTrack ? matchedTrack.trackName : (fallbackTitle || TITULO_CANCION);
            const finalArtist = matchedTrack ? matchedTrack.artistName : (fallbackArtist || AUTOR_CANCION);
            const audioPreview = matchedTrack ? matchedTrack.previewUrl : null;
            const artwork = matchedTrack ? matchedTrack.artworkUrl100 : null;

            // Actualizar portada si estaba vacía
            if (!$('#music-cover').attr('src') && artwork) {
                $('#music-cover').attr('src', artwork.replace('100x100bb', '600x600bb'));
            }

            // Actualizar interfaz
            $('#music-title').text(finalTitle.length > 28 ? finalTitle.substring(0, 28) + '…' : finalTitle);
            $('#music-author').text(finalArtist);

            // Vinculación automática del audio enviado por la canción de Spotify
            if (audioPreview) {
                window.spotifyAudioUrl = audioPreview;
                if (typeof audioFondo !== 'undefined') {
                    console.log('[Spotify Audio] Audio stream cargado correctamente desde Spotify link:', audioPreview);
                    audioFondo.src = audioPreview;
                    audioFondo.load();
                }
            } else if (fallbackTitle && query !== fallbackTitle) {
                // Re-intento de búsqueda solo por título
                return searchAudioAndMetadata(fallbackTitle, fallbackTitle, fallbackArtist);
            } else {
                console.warn('[Spotify Audio] No se encontró pista de audio remota, usando audio por defecto.');
            }

            // Buscar letras sincronizadas
            if (typeof fetchLyrics === 'function') {
                const searchTitle = typeof cleanString === 'function' ? cleanString(finalTitle) : finalTitle;
                const searchArtist = typeof cleanString === 'function' ? cleanString(finalArtist) : finalArtist;
                fetchLyrics(searchTitle, searchArtist);
            }
        })
        .catch(err => {
            console.error('[Spotify] Error buscando audio y metadatos:', err);
            const title = fallbackTitle || (typeof TITULO_CANCION !== 'undefined' ? TITULO_CANCION : '');
            const artist = fallbackArtist || (typeof AUTOR_CANCION !== 'undefined' ? AUTOR_CANCION : '');
            $('#music-title').text(title);
            $('#music-author').text(artist);
            if (typeof fetchLyrics === 'function') {
                fetchLyrics(cleanString(title), cleanString(artist));
            }
        });
}

// Ejecución inmediata si los scripts anteriores ya están cargados
if (typeof ENLACE_SPOTIFY !== 'undefined' && ENLACE_SPOTIFY) {
    initSpotify();
}


