// ==========================================
// ====== LETRAS SINCRONIZADAS SPOTIFY ======
// ==========================================

let parsedLyrics = [];
let currentLyricIndex = -1;
let lyricsRAF = null;
let currentNeonColor = '#fff';
const LYRIC_OFFSET = -0.08;

function cleanString(str) {
    if (!str) return "";
    return str.split(/ - | \(| \[/)[0].trim();
}

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

// Busca la mejor coincidencia en los resultados de lrclib
function findBestLyricMatch(results, title, artist) {
    if (!Array.isArray(results) || results.length === 0) return null;

    const normTitle = title.toLowerCase().trim();
    const normArtist = artist.toLowerCase().trim();

    // 1. Prioridad: synced lyrics con título Y artista coincidentes
    let best = results.find(t => t.syncedLyrics &&
        t.trackName && t.trackName.toLowerCase().includes(normTitle) &&
        t.artistName && t.artistName.toLowerCase().includes(normArtist));
    if (best) return { type: 'synced', data: best.syncedLyrics };

    // 2. Synced lyrics con solo título coincidente
    best = results.find(t => t.syncedLyrics &&
        t.trackName && t.trackName.toLowerCase().includes(normTitle));
    if (best) return { type: 'synced', data: best.syncedLyrics };

    // 3. Cualquier synced lyrics (menos fiable)
    best = results.find(t => t.syncedLyrics);
    if (best) return { type: 'synced', data: best.syncedLyrics };

    // 4. Plain lyrics con título coincidente
    best = results.find(t => t.plainLyrics &&
        t.trackName && t.trackName.toLowerCase().includes(normTitle));
    if (best) return { type: 'plain', data: best.plainLyrics };

    // 5. Cualquier plain lyrics
    best = results.find(t => t.plainLyrics);
    if (best) return { type: 'plain', data: best.plainLyrics };

    return null;
}

function fetchLyrics(title, artist) {
    const cleanT = cleanString(title);
    const cleanA = cleanString(artist);

    // Intentar primero con artista + título (más preciso)
    const artistTitleUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanA + ' ' + cleanT)}`;
    const titleOnlyUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanT)}`;
    // Búsqueda directa por campos (la más precisa si la API la soporta)
    const directUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanT)}&artist_name=${encodeURIComponent(cleanA)}`;

    // Intento 1: Búsqueda directa por campos
    fetch(directUrl)
        .then(r => r.json())
        .then(data => {
            const match = findBestLyricMatch(data, cleanT, cleanA);
            if (match) {
                if (match.type === 'synced') { parseLRC(match.data); showLyricsContainer(); }
                else { showPlainLyrics(match.data); }
            } else throw new Error('no match');
        })
        .catch(() => {
            // Intento 2: Búsqueda con artista + título
            fetch(artistTitleUrl)
                .then(r => r.json())
                .then(data => {
                    const match = findBestLyricMatch(data, cleanT, cleanA);
                    if (match) {
                        if (match.type === 'synced') { parseLRC(match.data); showLyricsContainer(); }
                        else { showPlainLyrics(match.data); }
                    } else throw new Error('no match');
                })
                .catch(() => {
                    // Intento 3: Solo título (menos preciso)
                    fetch(titleOnlyUrl)
                        .then(r => r.json())
                        .then(data => {
                            const match = findBestLyricMatch(data, cleanT, cleanA);
                            if (match) {
                                if (match.type === 'synced') { parseLRC(match.data); showLyricsContainer(); }
                                else { showPlainLyrics(match.data); }
                            } else {
                                console.log('[Lyrics] No se encontraron letras para:', cleanT, '-', cleanA);
                                $('#lyrics-container').hide();
                            }
                        })
                        .catch(() => {
                            console.log('[Lyrics] Error buscando letras');
                            $('#lyrics-container').hide();
                        });
                });
        });
}

function showPlainLyrics(text) {
    const lines = text.split('\n').filter(l => l.trim());
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

function startLyricsLoop() {
    if (lyricsRAF) cancelAnimationFrame(lyricsRAF);

    function tick() {
        if (parsedLyrics.length === 0 || audioFondo.paused || audioFondo.currentTime === 0) {
            if (currentLyricIndex !== -1) {
                currentLyricIndex = -1;
                updateActiveLyric(-1);
            }
            lyricsRAF = requestAnimationFrame(tick);
            return;
        }

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

    if (activeIndex < 0) {
        $lines.css({
            opacity: 0, transform: 'scale(0.9)',
            'text-shadow': 'none', 'font-weight': 'normal', color: '#fff'
        });
        return;
    }

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

    const activeDom = $lines[activeIndex];
    if (activeDom) {
        activeDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
