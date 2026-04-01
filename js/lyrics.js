// ==========================================
// ====== LETRAS SINCRONIZADAS SPOTIFY ======
// — Optimizado: mínimo DOM thrashing —
// ==========================================

let parsedLyrics = [];
let currentLyricIndex = -1;
let lyricsRAF = null;
let currentNeonColor = '#fff';
const LYRIC_OFFSET = -0.08;

// Cache de nodos DOM para evitar queries repetidas
let _lyricsLines = [];
let _lyricsInner = null;

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

    // 3. Cualquier synced lyrics
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

    const directUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanT)}&artist_name=${encodeURIComponent(cleanA)}`;
    const artistTitleUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanA + ' ' + cleanT)}`;
    const titleOnlyUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanT)}`;

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
            // Intento 2
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
                    // Intento 3
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
    _lyricsInner = document.getElementById('lyrics-inner');
    if (!_lyricsInner) return;

    // Usar DocumentFragment para batch insert
    const frag = document.createDocumentFragment();
    _lyricsInner.innerHTML = '';

    parsedLyrics.forEach((lyric, i) => {
        const div = document.createElement('div');
        div.className = 'lyric-scroll-line';
        div.setAttribute('data-index', i);
        div.textContent = lyric.text;
        frag.appendChild(div);
    });

    _lyricsInner.appendChild(frag);

    // Cache de los nodos de línea (evita queries repetidas en cada frame)
    _lyricsLines = Array.from(_lyricsInner.querySelectorAll('.lyric-scroll-line'));
    currentLyricIndex = -1;
}

function startLyricsLoop() {
    if (lyricsRAF) cancelAnimationFrame(lyricsRAF);

    // Throttle: en móvil actualizar cada ~100ms en vez de cada frame
    let lastUpdate = 0;
    const UPDATE_INTERVAL = isMobile ? 100 : 0;

    function tick(now) {
        if (parsedLyrics.length === 0 || audioFondo.paused || audioFondo.currentTime === 0) {
            if (currentLyricIndex !== -1) {
                currentLyricIndex = -1;
                updateActiveLyric(-1);
            }
            lyricsRAF = requestAnimationFrame(tick);
            return;
        }

        // Throttle en móvil
        if (UPDATE_INTERVAL && (now - lastUpdate) < UPDATE_INTERVAL) {
            lyricsRAF = requestAnimationFrame(tick);
            return;
        }
        lastUpdate = now;

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
    if (!_lyricsLines || _lyricsLines.length === 0) return;

    if (activeIndex < 0) {
        // Reset: usar batch class toggle en vez de jQuery .css() por cada línea
        for (let i = 0; i < _lyricsLines.length; i++) {
            const el = _lyricsLines[i];
            el.style.opacity = '0';
            el.style.transform = 'scale(0.9) translateZ(0)';
            el.style.textShadow = 'none';
            el.style.fontWeight = 'normal';
            el.style.color = '#fff';
        }
        return;
    }

    // Solo actualizar las líneas visibles (±5 del índice activo)
    const visibleRange = 5;
    const startIdx = Math.max(0, activeIndex - visibleRange);
    const endIdx = Math.min(_lyricsLines.length - 1, activeIndex + visibleRange);

    // Ocultar líneas fuera del rango visible
    for (let i = 0; i < _lyricsLines.length; i++) {
        if (i < startIdx || i > endIdx) {
            const el = _lyricsLines[i];
            if (el.style.opacity !== '0') {
                el.style.opacity = '0';
                el.style.transform = 'scale(0.85) translateZ(0)';
                el.style.textShadow = 'none';
                el.style.fontWeight = 'normal';
                el.style.color = '#fff';
            }
        }
    }

    // Actualizar solo las líneas en rango visible
    for (let i = startIdx; i <= endIdx; i++) {
        const el = _lyricsLines[i];
        const dist = Math.abs(i - activeIndex);

        if (i === activeIndex) {
            el.style.color = currentNeonColor;
            el.style.opacity = '1';
            el.style.transform = 'scale(1.08) translateZ(0)';
            el.style.textShadow = `0 0 6px rgba(255,255,255,0.5), 0 0 18px ${currentNeonColor}`;
            el.style.fontWeight = 'bold';
        } else {
            const fade  = Math.max(0,    1 - dist * 0.25);
            const scale = Math.max(0.82, 1 - dist * 0.05);
            el.style.color = '#fff';
            el.style.opacity = fade.toFixed(2);
            el.style.transform = `scale(${scale}) translateZ(0)`;
            el.style.textShadow = 'none';
            el.style.fontWeight = 'normal';
        }
    }

    // Scroll to active
    const activeDom = _lyricsLines[activeIndex];
    if (activeDom) {
        activeDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
