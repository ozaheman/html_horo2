// =====================================================================
//  Jaimini (Jemini) Astrology Prediction Module  —  v2
//  Sources: Jaimini Upadesa Sutras, BPHS ch.32 (Chara Karakas),
//           K.N. Rao's Chara Dasha rules, and the uploaded Jaimini lecture notes.
//
//  Key rules implemented
//   1. Chara Karakas are ranked by DEGREE INSIDE THE SIGN (0-30°), never by
//      the absolute 0-360° longitude. Ties are broken by minutes, then seconds.
//   2. Default = 7 karakas (Sun..Saturn). Rahu/Ketu are excluded.
//      If two planets have exactly equal degrees (BPHS), Rahu becomes the
//      8th karaka ('auto' scheme). scheme:'8' forces 8 karakas.
//      Rahu is retrograde, so its karaka-degree = 30 - (degree in sign).
//      In the 8-karaka scheme, PiK (father) sits between MK and PK.
//   3. Karakamsa = sign of the Atmakaraka in the Navamsa (D9).
//   4. Rashi drishti: movable -> fixed (except adjacent), fixed -> movable
//      (except adjacent), dual -> other duals.
//   5. Chara Dasha: sequence direction by Lagna, duration = count to sign
//      lord minus 1 (Scorpio / Aquarius use the stronger of their two lords).
//
//  Load order:  jemini_prediction.js  ->  varga_text_analysis.js
// =====================================================================
(function (global) {
'use strict';

// ───────────────────────── constants ─────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_ALIASES = {
    mesha:0, mesh:0, vrishabha:1, vrish:1, vrishab:1, mithuna:2, mithun:2, karka:3, kark:3, karkata:3,
    simha:4, simh:4, kanya:5, tula:6, vrischika:7, vrishchik:7, vrishchika:7, dhanu:8, dhanus:8,
    makara:9, makar:9, kumbha:10, kumbh:10, meena:11, meen:11, mina:11
};
const SEVEN = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const LABELS_7 = ['AK','AmK','BK','MK','PK','GK','DK'];
const LABELS_8 = ['AK','AmK','BK','MK','PiK','PK','GK','DK'];

const KARAKA_LABELS = {
    AK:  { full: 'Atmakaraka',   role: 'Soul / Self — body, health, life purpose' },
    AmK: { full: 'Amatyakaraka', role: 'Career, finances, advisors & status' },
    BK:  { full: 'Bhratrikaraka', role: 'Siblings, courage, gurus & followers' },
    MK:  { full: 'Matrikaraka',  role: 'Mother, home, vehicles & comforts' },
    PiK: { full: 'Pitrikaraka',  role: 'Father & paternal line (8-karaka scheme)' },
    PK:  { full: 'Putrakaraka',  role: 'Children, creativity, education & merit' },
    GK:  { full: 'Gnatikaraka',  role: 'Enemies, disease, litigation, obstacles & relatives' },
    DK:  { full: 'Darakaraka',   role: 'Spouse & partnerships' }
};

const SIGN_MEANINGS = {
    Aries:'leadership, initiative, pioneering energy', Taurus:'wealth, stability, sensual pleasures, art',
    Gemini:'intellect, communication, duality, trade', Cancer:'emotions, home, nurturing, devotion',
    Leo:'authority, fame, royal bearing, spiritual power', Virgo:'analysis, service, healing, craftsmanship',
    Libra:'balance, justice, partnerships, diplomacy', Scorpio:'transformation, research, occult, hidden power',
    Sagittarius:'dharma, higher learning, philosophy, travel', Capricorn:'ambition, discipline, status, government',
    Aquarius:'humanitarian ideals, innovation, social reform', Pisces:'spirituality, moksha, imagination, sacrifice'
};

const PLANET_AS_KARAKA = {
    Sun:     'a solar, authority-seeking nature — pride, leadership and self-reliance',
    Moon:    'a lunar, emotional nature — sensitivity, public connection and changeability',
    Mars:    'a martial nature — courage, drive and a tendency to compete or act impulsively',
    Mercury: 'a mercurial nature — intellect, speech, trade and adaptability',
    Jupiter: 'a jovian nature — wisdom, ethics, teaching and expansion',
    Venus:   'a venusian nature — love of beauty, harmony, comfort and relationships',
    Saturn:  'a saturnine nature — discipline, delay, duty and long-term perseverance',
    Rahu:    'a Rahu nature — worldly ambition, foreign or unconventional pursuits',
    Ketu:    'a Ketu nature — detachment, research and spiritual inclination'
};

const KARAKAMSA_PLANET_RESULTS = {
    Sun:     'government, authority or leadership roles; strong sense of self-worth',
    Moon:    'public-facing, nurturing or creative work; emotional, imaginative mind',
    Mars:    'technical, engineering, medical-surgical or defence-type work; courageous drive',
    Mercury: 'commerce, writing, accounts, analysis or teaching; skilful intellect',
    Jupiter: 'knowledge, teaching, counselling, law or spiritual life; respected wisdom',
    Venus:   'arts, luxury, entertainment, design or diplomacy; refined tastes',
    Saturn:  'service, labour, administration, industry; success through steady effort',
    Rahu:    'foreign, technology-driven or unconventional fields; sudden rises',
    Ketu:    'spiritual, research or occult inclination; detachment and moksha orientation'
};

const EXALT   = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 };
const DEBIL   = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0 };
const OWN     = { Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5], Jupiter:[8,11], Venus:[1,6], Saturn:[9,10] };

// ───────────────────────── helpers ───────────────────────────────────
const norm360 = v => ((v % 360) + 360) % 360;
const num = v => { const n = Number(v); return (v === null || v === undefined || v === '' || !isFinite(n)) ? null : n; };
const houseFrom = (fromSign, toSign) => ((toSign - fromSign + 12) % 12) + 1;
const fmtDeg = d => (typeof d === 'number' && isFinite(d)) ? d.toFixed(2) + '°' : '';
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function signIdx(sign) {
    if (typeof sign === 'number' && isFinite(sign)) return ((Math.floor(sign) % 12) + 12) % 12;
    if (!sign) return -1;
    const s = String(sign).trim();
    const i = SIGNS.findIndex(x => x.toLowerCase() === s.toLowerCase());
    if (i >= 0) return i;
    const a = SIGN_ALIASES[s.toLowerCase()];
    return a === undefined ? -1 : a;
}

/** Longitude (sidereal, D1) from the many shapes used across the app. */
function planetLongitude(p) {
    if (!p) return null;
    let v = num(p.sid);            if (v !== null) return norm360(v);      // main.js BIRTH_PLANETS (D1 sidereal)
    v = num(p.longitude);          if (v !== null) return norm360(v);      // AI_prediction / normalised planets
    const si = signIdx(p.signIndex !== undefined ? p.signIndex : (p.sn !== undefined ? p.sn : p.sign));
    const d  = num(p.degree !== undefined ? p.degree : p.deg);
    if (si >= 0 && d !== null && d >= 0 && d < 30) return si * 30 + d;     // degree inside sign
    if (d !== null) return norm360(d);                                      // legacy: absolute degree
    return null;
}

/** Accepts a map {Sun:{..}} or an array [{name:'Sun',..}] → map of normalised planets. */
function normalizePlanets(input) {
    const out = {};
    if (!input) return out;
    const entries = Array.isArray(input)
        ? input.filter(p => p && p.name).map(p => [p.name, p])
        : Object.entries(input);
    entries.forEach(([name, p]) => {
        const lon = planetLongitude(p);
        if (lon === null) return;
        const si = Math.floor(lon / 30) % 12;
        out[name] = {
            name, longitude: lon, signIndex: si, sign: SIGNS[si], degree: lon - si * 30,
            retro: !!(p && (p.retro || p.retrograde))
        };
    });
    // Ketu is always 180° from Rahu — synthesise whichever is missing
    const mk = (name, lon) => { const si = Math.floor(lon / 30) % 12; out[name] = { name, longitude: lon, signIndex: si, sign: SIGNS[si], degree: lon - si * 30, retro: true, derived: true }; };
    if (out.Rahu && !out.Ketu) mk('Ketu', norm360(out.Rahu.longitude + 180));
    if (out.Ketu && !out.Rahu) mk('Rahu', norm360(out.Ketu.longitude + 180));
    return out;
}

function getDignity(planet, sIdx) {
    if (EXALT[planet] === sIdx) return 'Exalted';
    if (DEBIL[planet] === sIdx) return 'Debilitated';
    if (OWN[planet] && OWN[planet].includes(sIdx)) return 'Own Sign';
    return 'Neutral';
}

// ───────────────────────── 1. CHARA KARAKAS ──────────────────────────
/**
 * Full karaka report.
 * @param {object|array} planetsIn
 * @param {{scheme?:'auto'|'7'|'8'}} options
 */
function getCharaKarakaReport(planetsIn, options) {
    const planets = normalizePlanets(planetsIn);
    const scheme = String((options && options.scheme) || 'auto');
    const notes = [];

    const pool = SEVEN.filter(n => planets[n]).map(n => ({
        name: n, p: planets[n], key: planets[n].degree
    }));

    // exact-tie test at arc-second precision (BPHS: degrees → minutes → seconds)
    const secs = pool.map(x => Math.round(x.key * 3600));
    const tie = new Set(secs).size !== secs.length;

    let use8 = false;
    if (scheme === '8') use8 = true;
    else if (scheme === 'auto' && tie) use8 = true;

    if (use8 && !planets.Rahu) { use8 = false; notes.push('8-karaka scheme requested but Rahu data is missing — using 7 karakas.'); }
    if (tie && scheme === 'auto' && use8) notes.push('Two planets have identical degrees, so Rahu is added as the 8th karaka (BPHS rule).');
    if (tie && scheme === '7') notes.push('Two planets have identical degrees; 7-karaka scheme was forced, so their order is arbitrary.');

    const list = pool.slice();
    if (use8) {
        // Rahu moves retrograde: karaka-degree is measured from the END of the sign
        list.push({ name: 'Rahu', p: planets.Rahu, key: 30 - planets.Rahu.degree, reversed: true });
    }
    list.sort((a, b) => (b.key - a.key) || SEVEN.indexOf(a.name) - SEVEN.indexOf(b.name));

    const labels = use8 ? LABELS_8 : LABELS_7;
    const map = {};
    list.forEach((x, i) => {
        if (i >= labels.length) return;
        map[labels[i]] = {
            name: x.name,
            longitude: x.p.longitude,
            sign: x.p.sign,
            signIndex: x.p.signIndex,
            degree: x.p.degree,          // real degree inside the sign
            karakaDegree: x.key,         // value actually used for ranking (reversed for Rahu)
            rank: i + 1,
            reversed: !!x.reversed
        };
    });

    const ranking = list.map((x, i) => ({ karaka: labels[i], planet: x.name, karakaDegree: x.key }));
    const meta = { scheme: use8 ? '8' : '7', requestedScheme: scheme, tieDetected: tie, notes, ranking };
    Object.defineProperty(map, '_meta', { value: meta, enumerable: false });
    return { karakas: map, scheme: meta.scheme, tieDetected: tie, notes, ranking, planets };
}

function calculateCharaKarakas(planetsIn, options) {
    return getCharaKarakaReport(planetsIn, options).karakas;
}

// ───────────────────────── 2. VARGA MATH ─────────────────────────────
/** Sign index (0-11) of a longitude in divisional chart Dn (Parashara rules). */
function vargaSignIndex(longitude, n) {
    const lon = norm360(longitude);
    const s = Math.floor(lon / 30) % 12;
    const d = lon - s * 30;                    // degree inside sign
    const odd = s % 2 === 0;                   // Aries(0), Gemini(2)... are odd signs
    const mode = s % 3;                        // 0 movable, 1 fixed, 2 dual
    const part = Math.min(Math.floor(d / (30 / n)), n - 1);
    switch (n) {
        case 1:  return s;
        case 2:  return odd ? (d < 15 ? 4 : 3) : (d < 15 ? 3 : 4);                // Leo / Cancer hora
        case 3:  return (s + 4 * Math.floor(d / 10)) % 12;
        case 4:  return (s + 3 * Math.floor(d / 7.5)) % 12;
        case 6:  return ((odd ? 0 : 6) + part) % 12;
        case 7:  return ((odd ? s : s + 6) + part) % 12;
        case 8:  return ([0, 8, 4][mode] + part) % 12;                              // movable Ar, fixed Sg, dual Le
        case 9:  return ([0, 9, 6, 3][s % 4] + part) % 12;                          // fire Ar, earth Cp, air Li, water Cn
        case 10: return ((odd ? s : s + 8) + part) % 12;
        case 12: return (s + part) % 12;
        case 16: return ([0, 4, 8][mode] + part) % 12;                              // movable Ar, fixed Le, dual Sg
        case 20: return ([0, 8, 4][mode] + part) % 12;                              // movable Ar, fixed Sg, dual Le
        case 24: return ((odd ? 4 : 3) + part) % 12;                                // odd Leo, even Cancer
        case 27: return ([0, 3, 6, 9][s % 4] + part) % 12;                          // fire Ar, earth Cn, air Li, water Cp
        case 30: {
            if (odd) { if (d < 5) return 0; if (d < 10) return 10; if (d < 18) return 8; if (d < 25) return 2; return 6; }
            if (d < 5) return 1; if (d < 12) return 5; if (d < 20) return 11; if (d < 25) return 9; return 7;
        }
        case 40: return ((odd ? 0 : 6) + part) % 12;
        case 45: return ([0, 4, 8][mode] + part) % 12;
        case 60: return (s + Math.floor(d * 2)) % 12;
        default: return (s * n + part) % 12;
    }
}

// ───────────────────────── 3. RASHI DRISHTI ──────────────────────────
/** Signs aspected by a sign under Jaimini rules. */
function aspectedSigns(s) {
    const t = s % 3, out = [];
    for (let x = 0; x < 12; x++) {
        if (x === s) continue;
        const tx = x % 3;
        if (t === 0 && tx === 1 && x !== (s + 1) % 12) out.push(x);        // movable → fixed, not adjacent
        else if (t === 1 && tx === 0 && x !== (s + 11) % 12) out.push(x);  // fixed → movable, not adjacent
        else if (t === 2 && tx === 2) out.push(x);                         // dual ↔ dual
    }
    return out;
}
function signAspects(a, b) { const i = signIdx(a), j = signIdx(b); return i >= 0 && j >= 0 && i !== j && aspectedSigns(i).includes(j); }
function getJaiminiAspect(a, b) { return signAspects(a, b) ? 'rashi' : null; }

function calculateJaiminiAspects(planetsIn) {
    const planets = normalizePlanets(planetsIn), res = {};
    Object.keys(planets).forEach(a => {
        res[a] = {};
        Object.keys(planets).forEach(b => {
            if (a !== b && signAspects(planets[a].signIndex, planets[b].signIndex)) res[a][b] = 'rashi';
        });
    });
    return res;
}

function listJaiminiAspects(planets) {
    const out = [], names = Object.keys(planets);
    names.forEach(a => names.forEach(b => {
        if (a !== b && signAspects(planets[a].signIndex, planets[b].signIndex)) {
            out.push({ planet1: a, planet2: b, type: 'Rashi Drishti', note: `${planets[a].sign} -> ${planets[b].sign}` });
        }
    }));
    return out;
}

/** Relationship of planet a with planet b: conjunction / mutual rashi aspect. */
function relation(planets, a, b) {
    if (!planets[a] || !planets[b] || a === b) return null;
    if (planets[a].signIndex === planets[b].signIndex) return 'Conjunction';
    if (signAspects(planets[a].signIndex, planets[b].signIndex)) return 'Rashi Drishti';
    return null;
}

// ───────────────────────── 4. KARAKA RELATIONSHIPS ───────────────────
/** Jaimini Raja Yoga: AK, AmK, PK, DK linked by conjunction or rashi drishti. */
function findRajaYogas(karakas, planets) {
    const keys = ['AK', 'AmK', 'PK', 'DK'].filter(k => karakas[k]);
    const out = [];
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
        const A = karakas[keys[i]], B = karakas[keys[j]];
        const rel = relation(planets, A.name, B.name);
        if (rel) out.push({
            pair: [keys[i], keys[j]], planets: [A.name, B.name], type: rel,
            text: `${keys[i]} (${A.name}) and ${keys[j]} (${B.name}) are linked by ${rel.toLowerCase()} — a Jaimini Raja Yoga that supports status, success and recognition.`
        });
    }
    return out;
}

/** For each karaka: who afflicts (GK / Rahu / Ketu) and who supports (other karakas). */
function karakaInfluences(karakas, planets) {
    const gkName = karakas.GK && karakas.GK.name;
    const out = {};
    Object.keys(karakas).forEach(k => {
        const kp = karakas[k].name;
        const afflict = [], support = [];
        if (gkName && gkName !== kp) { const r = relation(planets, gkName, kp); if (r) afflict.push({ by: `GK ${gkName}`, how: r }); }
        ['Rahu', 'Ketu'].forEach(n => { if (n !== kp) { const r = relation(planets, n, kp); if (r) afflict.push({ by: n, how: r }); } });
        ['AK', 'AmK', 'PK', 'DK'].forEach(o => {
            if (o !== k && karakas[o]) { const r = relation(planets, karakas[o].name, kp); if (r) support.push({ by: `${o} ${karakas[o].name}`, how: r }); }
        });
        let verdict;
        if (afflict.length && !support.length) verdict = 'Obstructed';
        else if (afflict.length && support.length) verdict = 'Mixed';
        else if (support.length) verdict = 'Supported';
        else verdict = 'Free of GK/Rahu/Ketu influence';
        out[k] = { planet: kp, afflictedBy: afflict, supportedBy: support, verdict };
    });
    return out;
}

// ───────────────────────── 5. KARAKAMSA ──────────────────────────────
function calculateKarakamsa(planetsIn, atmakarakaName) {
    const planets = normalizePlanets(planetsIn);
    const ak = planets[atmakarakaName];
    if (!ak) return { karakamsaSignIndex: 0, karakamsaSignName: 'Unknown', atmakarakaName: atmakarakaName || 'Unknown' };
    const idx = vargaSignIndex(ak.longitude, 9);
    return { karakamsaSignIndex: idx, karakamsaSignName: SIGNS[idx], atmakarakaName };
}

function analyzeKarakamsa(planetsIn, atmakarakaName) {
    const planets = normalizePlanets(planetsIn);
    const base = calculateKarakamsa(planets, atmakarakaName);
    if (base.karakamsaSignName === 'Unknown') return Object.assign({ detailed: null }, base);
    const ki = base.karakamsaSignIndex;

    const d9 = {};
    Object.keys(planets).forEach(n => { d9[n] = vargaSignIndex(planets[n].longitude, 9); });

    const inKarakamsa = Object.keys(d9).filter(n => d9[n] === ki && n !== atmakarakaName);
    const aspecting = Object.keys(d9).filter(n => d9[n] !== ki && aspectedSigns(d9[n]).includes(ki));
    const houses = {};
    [2, 5, 10, 12].forEach(h => {
        const s = (ki + h - 1) % 12;
        houses[h] = { sign: SIGNS[s], planets: Object.keys(d9).filter(n => d9[n] === s) };
    });
    const inRashi = Object.keys(planets).filter(n => planets[n].signIndex === ki);

    const bits = [`Karakamsa is ${base.karakamsaSignName} (${atmakarakaName}'s Navamsa sign): the soul's aspiration turns toward ${SIGN_MEANINGS[base.karakamsaSignName]}.`];
    if (inKarakamsa.length) bits.push('Planets in Karakamsa (D9): ' + inKarakamsa.map(n => `${n} — ${KARAKAMSA_PLANET_RESULTS[n] || 'adds its own flavour'}`).join('; ') + '.');
    if (aspecting.length) bits.push(`Rashi drishti on Karakamsa from: ${aspecting.join(', ')}.`);
    if (houses[10].planets.length) bits.push(`10th from Karakamsa holds ${houses[10].planets.join(', ')} — shapes the career field.`);
    if (houses[5].planets.length) bits.push(`5th from Karakamsa holds ${houses[5].planets.join(', ')} — shapes intellect, creativity and merit.`);
    if (houses[12].planets.length) bits.push(`12th from Karakamsa holds ${houses[12].planets.join(', ')} — shapes spiritual release and foreign/loss themes.`);
    if (inRashi.length) bits.push(`In the rashi chart, ${inRashi.join(', ')} occupy the Karakamsa sign.`);

    return Object.assign({}, base, {
        inKarakamsa, aspecting, houses, inRashi,
        meaning: bits[0],
        detailed: { description: bits.join(' ') }
    });
}

// ───────────────────────── 6. CHARA DASHA ────────────────────────────
const SINGLE_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', null, 'Jupiter', 'Saturn', null, 'Jupiter'];
const REVERSE_LAGNAS = [1, 2, 3, 7, 8, 9];             // Taurus, Gemini, Cancer, Scorpio, Sagittarius, Capricorn
const COUNT_FORWARD = [0, 1, 2, 6, 7, 8];              // Aries-Gemini, Libra-Sagittarius count forward; others backward

function countSigns(from, to, forward) { return (forward ? (to - from + 12) % 12 : (from - to + 12) % 12) + 1; }

function lordSign(planets, name) {
    if (planets[name]) return planets[name].signIndex;
    if (name === 'Ketu' && planets.Rahu) return (planets.Rahu.signIndex + 6) % 12;
    if (name === 'Rahu' && planets.Ketu) return (planets.Ketu.signIndex + 6) % 12;
    return null;
}

function pickDualLord(planets, sIdx, a, b) {
    const sa = lordSign(planets, a), sb = lordSign(planets, b);
    if (sa === sIdx && sb === sIdx) return { lord: `${a}+${b}`, sign: sIdx, full: true };
    if (sa === sIdx) return { lord: b, sign: sb };
    if (sb === sIdx) return { lord: a, sign: sa };
    if (sa === null) return { lord: b, sign: sb };
    if (sb === null) return { lord: a, sign: sa };
    const cnt = s => Object.keys(planets).filter(n => planets[n].signIndex === s).length;
    const deg = n => (planets[n] ? planets[n].degree : (n === 'Ketu' || n === 'Rahu') && planets.Rahu ? planets.Rahu.degree : 0);
    const ca = cnt(sa), cb = cnt(sb);
    if (ca !== cb) return ca > cb ? { lord: a, sign: sa } : { lord: b, sign: sb };
    return deg(a) >= deg(b) ? { lord: a, sign: sa } : { lord: b, sign: sb };
}

function addYears(d, n) { return new Date(d.getFullYear() + n, d.getMonth(), d.getDate()); }

function calculateCharaDasha(lagnaSign, planetsIn, birthDate) {
    const planets = normalizePlanets(planetsIn);
    let lagna = signIdx(lagnaSign); if (lagna < 0) lagna = 0;
    const reverse = REVERSE_LAGNAS.includes(lagna);
    let birth = birthDate ? new Date(birthDate) : null;
    if (birth && isNaN(birth.getTime())) birth = null;

    const seq = [];
    let cursor = 0;
    for (let i = 0; i < 12; i++) {
        const s = reverse ? (lagna - i + 12) % 12 : (lagna + i) % 12;
        const fwd = COUNT_FORWARD.includes(s);
        let lord, lSign, years, full = false;
        if (s === 7 || s === 10) {
            const pair = s === 7 ? ['Mars', 'Ketu'] : ['Saturn', 'Rahu'];
            const pk = pickDualLord(planets, s, pair[0], pair[1]);
            lord = pk.lord; lSign = pk.sign; full = !!pk.full;
        } else {
            lord = SINGLE_LORD[s]; lSign = lordSign(planets, lord);
        }
        if (full) years = 12;
        else if (lSign === null || lSign === undefined) years = 12;
        else { years = countSigns(s, lSign, fwd) - 1; if (years === 0) years = 12; }

        const entry = {
            sign: SIGNS[s], signIndex: s, lord, lordSign: lSign === null || lSign === undefined ? null : SIGNS[lSign],
            periodYears: years, startAge: cursor, endAge: cursor + years, sequenceNumber: i + 1,
            startDegree: cursor, endDegree: cursor + years
        };
        if (birth) { entry.start = addYears(birth, cursor); entry.end = addYears(birth, cursor + years); }
        seq.push(entry);
        cursor += years;
    }

    const now = new Date();
    let current = null;
    if (birth) {
        seq.forEach(e => { e.active = now >= e.start && now < e.end; if (e.active) current = e; });
    }
    return {
        lagnaSign: SIGNS[lagna], direction: reverse ? 'Reverse (apasavya)' : 'Direct (savya)',
        dashaSequence: seq, totalCycle: cursor, current
    };
}

// ───────────────────────── 7. CHAR CHART ─────────────────────────────
function calculateCharaChart(planetsIn, lagnaSign, karakaMap) {
    const planets = normalizePlanets(planetsIn);
    const karakas = karakaMap || calculateCharaKarakas(planets);
    const ak = karakas.AK;
    if (!ak) return { error: 'Atmakaraka not found', charLagna: 'Unknown' };
    const akSign = ak.signIndex;
    const kam = calculateKarakamsa(planets, ak.name);
    const chart = {};
    Object.keys(planets).forEach(n => {
        chart[n] = {
            longitude: planets[n].longitude, sign: planets[n].sign,
            houseFromAK: houseFrom(akSign, planets[n].signIndex),
            houseFromKarakamsa: kam.karakamsaSignName === 'Unknown' ? null : houseFrom(kam.karakamsaSignIndex, planets[n].signIndex),
            house: houseFrom(akSign, planets[n].signIndex)
        };
    });
    return {
        charLagna: ak.sign, charLagnaSign: ak.sign, planets: chart,
        calculationMethod: 'Houses counted from the sign occupied by the Atmakaraka (AK-sign reference chart); Karakamsa houses are listed alongside.'
    };
}

// ───────────────────────── 8. VARGA POSITIONS (planets in Dn) ────────
const DEFAULT_VARGAS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 20, 24, 27, 30, 60];

function getVargaChart(planetsIn, divisor) {
    if (!divisor || divisor < 1 || divisor > 60) return { error: 'Invalid varga divisor, must be 1-60' };
    const planets = normalizePlanets(planetsIn), pos = {};
    Object.keys(planets).forEach(n => {
        const si = vargaSignIndex(planets[n].longitude, divisor);
        pos[n] = { varga: divisor, vargaSignIndex: si, vargaSign: SIGNS[si], originalLongitude: planets[n].longitude };
    });
    return { varga: divisor, divisor, planetPositions: pos, totalSigns: 12 };
}
function analyzeVargaCharts(planetsIn) {
    const out = {};
    DEFAULT_VARGAS.forEach(d => { out['D' + d] = getVargaChart(planetsIn, d); });
    return out;
}

// ───────────────────────── 9. FULL ANALYSIS ──────────────────────────
function resolveBirthDate(d) {
    if (d) { const x = new Date(d); if (!isNaN(x.getTime())) return x; }
    if (global.BIRTH && global.BIRTH.date) { const x = new Date(global.BIRTH.date); if (!isNaN(x.getTime())) return x; }
    return null;
}

function generateJaiminiAnalysis(planetsIn, lagnaSign, birthDate, options) {
    const planets = normalizePlanets(planetsIn);
    if (Object.keys(planets).length === 0) return { error: 'No planet data available. Please calculate the chart first.' };

    const report = getCharaKarakaReport(planets, options);
    const karakas = report.karakas;
    const akName = karakas.AK ? karakas.AK.name : null;
    const lagnaIdx = Math.max(0, signIdx(lagnaSign));
    const bd = resolveBirthDate(birthDate);

    const out = {
        karakas, karakaReport: report, planets,
        charDasha: calculateCharaDasha(SIGNS[lagnaIdx], planets, bd),
        charChart: calculateCharaChart(planets, SIGNS[lagnaIdx], karakas),
        karakamsa: analyzeKarakamsa(planets, akName),
        rajaYogas: findRajaYogas(karakas, planets),
        influences: karakaInfluences(karakas, planets),
        aspects: listJaiminiAspects(planets),
        vargaCharts: analyzeVargaCharts(planets),
        lagnaSign: SIGNS[lagnaIdx], lagnaIndex: lagnaIdx, birthDate: bd, akName
    };

    // Jaimini-style varga text (optional module)
    try {
        if (global.VARGA_TEXT_ANALYSIS && global.VARGA_TEXT_ANALYSIS.generateJaiminiVargaAnalysis) {
            out.vargaAnalysis = global.VARGA_TEXT_ANALYSIS.generateJaiminiVargaAnalysis(planets, {
                lagnaSign: SIGNS[lagnaIdx], karakas, scheme: report.scheme
            });
        }
    } catch (e) { out.vargaAnalysis = { error: e.message }; }
    return out;
}

// ───────────────────────── 10. HTML RENDERING ────────────────────────
function generateJaiminiHTML(analysis) {
    if (!analysis || analysis.error) {
        return `<div style="text-align:center;padding:40px 20px;color:var(--muted);font-family:'Courier New',monospace;font-size:11px;">
            ${esc(analysis ? analysis.error : 'Analysis data missing. Please calculate the chart first.')}</div>`;
    }
    const { karakas, karakaReport, charDasha, karakamsa, rajaYogas, influences, lagnaIndex } = analysis;

    const sec = (title, color, content) => `
        <div style="margin-bottom:18px;">
            <div style="font-size:10px;font-weight:bold;color:${color};text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid ${color}33;padding-bottom:4px;margin-bottom:10px;">${title}</div>
            ${content}
        </div>`;
    const row = (label, value, desc) => `
        <div style="display:flex;gap:6px;margin-bottom:7px;font-size:11px;align-items:baseline;flex-wrap:wrap;">
            <span style="color:var(--muted);min-width:110px;flex-shrink:0;">${label}</span>
            <span style="color:var(--gold);font-weight:bold;">${value}</span>
            ${desc ? `<span style="color:rgba(255,255,255,.45);font-size:9.5px;margin-left:4px;">${desc}</span>` : ''}
        </div>`;
    const note = t => `<div style="font-size:9.5px;color:rgba(255,255,255,.45);line-height:1.6;margin-top:4px;">${t}</div>`;

    // 1 — karakas
    const order = karakaReport.scheme === '8' ? LABELS_8 : LABELS_7;
    let kRows = '';
    order.forEach(k => {
        const kd = karakas[k]; if (!kd) return;
        const lbl = KARAKA_LABELS[k];
        kRows += row(`<span style="color:var(--cyan)">${k}</span> ${lbl.full}`,
            `${esc(kd.name)} <span style="font-size:9px;color:var(--muted)">${kd.sign} ${fmtDeg(kd.degree)}${kd.reversed ? ' (counted as ' + fmtDeg(kd.karakaDegree) + ')' : ''}</span>`, lbl.role);
    });
    kRows += note(`Ranked by degree inside the sign (0–30°), not by zodiac longitude. Scheme: ${karakaReport.scheme}-karaka.` +
        (karakaReport.notes.length ? '<br>' + karakaReport.notes.map(esc).join('<br>') : ''));
    let html = sec('✦ Chara Karakas', '#FFD700', kRows);

    // 2 — key significators
    const keyRow = (k, color, title) => {
        const kd = karakas[k]; if (!kd) return '';
        return row(`<span style="color:${color}">${title}</span>`, esc(kd.name),
            `in ${kd.sign} (${houseFrom(lagnaIndex, kd.signIndex)}H) — ${SIGN_MEANINGS[kd.sign] || ''}`);
    };
    html += sec('✦ Key Significators', '#FF9933',
        keyRow('AK', '#FF9933', 'Atmakaraka (Soul)') + keyRow('AmK', '#44FFAA', 'Amatyakaraka (Career)') +
        keyRow('DK', '#FF88CC', 'Darakaraka (Spouse)') +
        row('<span style="color:#9B6FFF">Karakamsa</span>', esc(karakamsa.karakamsaSignName), SIGN_MEANINGS[karakamsa.karakamsaSignName] ? 'soul aspires toward ' + SIGN_MEANINGS[karakamsa.karakamsaSignName] : ''));

    // 3 — karakamsa
    if (karakamsa.detailed) html += sec('✦ Karakamsa Reading', '#9B6FFF', `<div style="font-size:10.5px;line-height:1.7;color:var(--text);">${esc(karakamsa.detailed.description)}</div>`);

    // 4 — raja yogas & influences
    let yoga = rajaYogas.length ? rajaYogas.map(y => `<div style="font-size:10.5px;line-height:1.6;margin-bottom:5px;color:#00FF88;">★ ${esc(y.text)}</div>`).join('')
                                : note('No Raja Yoga between AK, AmK, PK and DK by conjunction or rashi drishti.');
    const infl = Object.keys(influences).map(k => {
        const i = influences[k];
        const col = i.verdict === 'Obstructed' ? '#FF6688' : i.verdict === 'Mixed' ? '#FFB347' : '#44FFAA';
        const why = i.afflictedBy.map(a => `${a.by} (${a.how})`).join(', ');
        return `<div style="font-size:10px;margin-bottom:3px;"><span style="color:var(--cyan)">${k}</span> ${esc(i.planet)} — <span style="color:${col}">${i.verdict}</span>${why ? ` <span style="color:var(--muted)">← ${esc(why)}</span>` : ''}</div>`;
    }).join('');
    html += sec('✦ Raja Yogas & Karaka Influences', '#44AAFF', yoga + '<div style="margin-top:8px;">' + infl + '</div>' +
        note('A karaka touched by GK, Rahu or Ketu faces obstruction in its area; links with AK/AmK/PK/DK support it.'));

    // 5 — Chara Dasha with dates
    let d = '';
    (charDasha.dashaSequence || []).forEach(e => {
        const when = e.start ? `${e.start.getFullYear()}–${e.end.getFullYear()}` : `age ${e.startAge}–${e.endAge}`;
        d += `<div style="display:flex;justify-content:space-between;align-items:center;font-size:10.5px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);">
            <span style="color:${e.active ? 'var(--gold)' : 'var(--text)'};font-weight:${e.active ? 'bold' : 'normal'};">${e.sign}
                <span style="color:var(--muted);font-size:9px;">(${esc(e.lord)})</span>${e.active ? '<span style="color:#00FF88;margin-left:6px;font-size:9px;">◀ ACTIVE</span>' : ''}</span>
            <span style="color:var(--muted);font-size:9px;">${when} &nbsp;(${e.periodYears}y)</span></div>`;
    });
    d += note(`Direction from ${charDasha.lagnaSign} Lagna: ${charDasha.direction}. Duration = count from the sign to its lord − 1.`);
    html += sec('✦ Chara Dasha', '#3AF0FF', d);

    // 6 — varga
    if (analysis.vargaAnalysis && !analysis.vargaAnalysis.error && global.VARGA_TEXT_ANALYSIS && global.VARGA_TEXT_ANALYSIS.toHTML) {
        html += sec('✦ Varga Analysis (Jaimini)', '#FF9933', global.VARGA_TEXT_ANALYSIS.toHTML(analysis.vargaAnalysis));
    }

    html += `<div style="font-size:9px;color:rgba(255,255,255,.35);line-height:1.6;border:1px dashed rgba(255,255,255,.1);border-radius:4px;padding:10px;margin-bottom:12px;">
        <strong style="color:rgba(255,255,255,.55);">Jaimini principles used</strong><br>
        • Movable signs aspect fixed signs (except adjacent); fixed aspect movable (except adjacent); dual aspect other duals.<br>
        • AK is read in every varga; AmK in D10, DK in D9, PK in D7/D24, BK in D3, MK in D4.<br>
        • GK, Rahu and Ketu influence on a karaka brings obstruction.</div>`;
    return `<div style="padding:15px;padding-bottom:60px;">${html}</div>`;
}

// ───────────────────────── 11. REPORT INTEGRATION ────────────────────
function getAtmakarakaMeaning(sign) {
    const m = {
        Aries: 'Soul\'s purpose through assertiveness and leadership', Taurus: 'Soul\'s purpose through resources and values',
        Gemini: 'Soul\'s purpose through communication and learning', Cancer: 'Soul\'s purpose through home and nurturing',
        Leo: 'Soul\'s purpose through creativity and self-expression', Virgo: 'Soul\'s purpose through service and analysis',
        Libra: 'Soul\'s purpose through relationships and balance', Scorpio: 'Soul\'s purpose through transformation and depth',
        Sagittarius: 'Soul\'s purpose through philosophy and expansion', Capricorn: 'Soul\'s purpose through discipline and structure',
        Aquarius: 'Soul\'s purpose through innovation and friendships', Pisces: 'Soul\'s purpose through spirituality and compassion'
    };
    return m[SIGNS[signIdx(sign)]] || ('Soul\'s purpose through ' + sign);
}

function resolveLagnaIndex(report) {
    const n = report.natal || {}, tries = [
        n.lagnaSign, report.lagnaSign, n.lagnaSignIndex, report.lagnaSignIndex,
        n.asc && (n.asc.signIndex !== undefined ? n.asc.signIndex : n.asc.sign),
        n.houses && n.houses[0] && (n.houses[0].signIndex !== undefined ? n.houses[0].signIndex : n.houses[0].sign)
    ];
    for (const t of tries) { const i = signIdx(t); if (i >= 0) return i; }
    const a = global.BIRTH_ASC;
    if (a) {
        if (typeof a.sn === 'number') return a.sn % 12;
        if (typeof a.sid === 'number') return Math.floor(norm360(a.sid) / 30);
    }
    return 0;
}

function generateJaiminiPredictions(report) {
    if (!report) return {};
    const raw = report.natal ? report.natal.planets : report.planets || {};
    const planets = normalizePlanets(raw);
    if (Object.keys(planets).length === 0) return {};

    const lagnaIdx = resolveLagnaIndex(report), lagnaSign = SIGNS[lagnaIdx];
    const analysis = generateJaiminiAnalysis(planets, lagnaSign, report.birthDate, report.options) || {};
    if (analysis.error) return {};
    const { karakas, charDasha, charChart, karakamsa } = analysis;
    const html = generateJaiminiHTML(analysis);

    const karakaAnalysis = (k, label, role) => {
        if (!k) return {};
        const meaning = getAtmakarakaMeaning(k.sign);
        const dig = getDignity(k.name, k.signIndex);
        const prediction = `${label} is ${k.name} in ${k.sign} (${houseFrom(lagnaIdx, k.signIndex)}H from Lagna, ${role}), reflecting ${PLANET_AS_KARAKA[k.name] || 'its own nature'}. ${meaning}.` +
            (dig !== 'Neutral' ? ` ${k.name} is ${dig.toLowerCase()}, ${dig === 'Debilitated' ? 'so results need extra effort' : 'which strengthens these results'}.` : '');
        return { name: k.name, sign: k.sign, degree: k.degree, longitude: k.longitude, planet: k.name, meaning, prediction };
    };
    const atmakarakaAnalysis   = karakaAnalysis(karakas.AK,  'Atmakaraka',   'soul & life purpose');
    const amatyakarakaAnalysis = karakaAnalysis(karakas.AmK, 'Amatyakaraka', 'career & counsel');
    const darakarakaAnalysis   = karakaAnalysis(karakas.DK,  'Darakaraka',   'spouse & partnerships');

    const charaDashaAnalysis = charDasha && charDasha.dashaSequence.length ? Object.assign({}, charDasha, {
        description: `Chara Dasha runs ${charDasha.direction.toLowerCase()} from ${charDasha.lagnaSign}: ` +
            charDasha.dashaSequence.slice(0, 4).map(d => `${d.sign} (${d.periodYears}y)`).join(' -> ') + ' ...' +
            (charDasha.current ? ` Current period: ${charDasha.current.sign} (${charDasha.current.start.getFullYear()}–${charDasha.current.end.getFullYear()}).` : '')
    }) : null;

    const predictions = [];
    if (atmakarakaAnalysis.planet)   predictions.push({ title: 'Soul Purpose (AK)', content: atmakarakaAnalysis.prediction });
    if (amatyakarakaAnalysis.planet) predictions.push({ title: 'Career (AmK)', content: amatyakarakaAnalysis.prediction });
    if (darakarakaAnalysis.planet)   predictions.push({ title: 'Partnerships (DK)', content: darakarakaAnalysis.prediction });
    (analysis.rajaYogas || []).slice(0, 2).forEach(y => predictions.push({ title: `Raja Yoga ${y.pair.join('–')}`, content: y.text }));
    if (analysis.vargaAnalysis && analysis.vargaAnalysis.highlights) {
        analysis.vargaAnalysis.highlights.slice(0, 3).forEach(h => predictions.push({ title: h.title, content: h.text }));
    }

    return {
        karakas, karakaReport: analysis.karakaReport, charChart, dasha: charDasha, karakamsa, analysis, html,
        atmakarakaAnalysis, amatyakarakaAnalysis, darakarakaAnalysis,
        karakamsaAnalysis: karakamsa, charaDashaAnalysis,
        jaiminiAspects: analysis.aspects, rajaYogas: analysis.rajaYogas, influences: analysis.influences,
        vargaAnalysis: analysis.vargaAnalysis, predictions
    };
}

// ───────────────────────── MODULE EXPORT ─────────────────────────────
global.JEMINI_PREDICTION = {
    // core
    calculateCharaKarakas, getCharaKarakaReport, calculateCharaDasha, calculateCharaChart,
    calculateJaiminiAspects, calculateKarakamsa, analyzeKarakamsa,
    getVargaChart, analyzeVargaCharts, getVargaCharts: () => DEFAULT_VARGAS.slice(),
    generateJaiminiAnalysis, generateJaiminiHTML, generateJaiminiPredictions,
    // shared helpers (also used by varga_text_analysis.js)
    normalizePlanets, vargaSignIndex, aspectedSigns, signAspects, getJaiminiAspect, relation,
    findRajaYogas, karakaInfluences, getDignity, houseFrom,
    SIGNS, KARAKA_LABELS, SIGN_MEANINGS, PLANET_AS_KARAKA, DEFAULT_VARGAS
};

})(typeof window !== 'undefined' ? window : globalThis);