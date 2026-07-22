/**
 * panchang_engine.js
 * ─────────────────────────────────────────────────────────────
 * Full Panchanga (five/seven limbs of Vedic time) calculation and
 * "what work suits this moment" interpretation engine:
 *
 *   Ritu (season) · Maas (lunar month) · Nakshatra · Vara (weekday)
 *   Tithi · Karana · Yoga (luni-solar) · Chogadiya · Rahu Kaal ·
 *   Yamaganda · Gulika Kaal · Abhijit Muhurat
 *
 * Astronomy dependencies (all optional — sensible fallbacks provided
 * so this file also works stand-alone):
 *   window.jd(y, m, d, ut)          → Julian Day
 *   window.computeAll(jd, ayan, 1)  → { Sun:{sid}, Moon:{sid}, ... }
 *   window.revjul(jd, flag)         → calendar date parts from a JD
 *   window.norm360(x)               → normalize degrees to [0,360)
 *   window.getAyanamsha(jd)         → ayanamsha in degrees (optional)
 *   window.ASTRO_CONSTANTS.NAKSHATRAS → 27-nakshatra table (constant.js)
 *
 * Sunrise/sunset use a self-contained NOAA-style solar-position
 * formula — no ephemeris dependency required for those.
 */

window.PANCHANG_ENGINE = {

    // ===================== STATIC DATA =====================

    RITU_SEASONS: [
        { key: 'sisira',  name: 'Sisira (Cold)',            tropicalSigns: [9, 10], ruler: 'Saturn',  desc: 'A period of cold and retraction.' },
        { key: 'vasanta', name: 'Vasanta (Spring)',          tropicalSigns: [11, 0], ruler: 'Venus',   desc: 'A period of brilliant growth and renewal.' },
        { key: 'grishma', name: 'Grishma (Summer)',          tropicalSigns: [1, 2],  ruler: 'Mars',    desc: 'A period of intense heat and energy.' },
        { key: 'varsha',  name: 'Varsha (Rainy)',            tropicalSigns: [3, 4],  ruler: 'Moon',    desc: 'A period of nourishment and water-element dominance.' },
        { key: 'sarad',   name: 'Sarad (Autumn)',            tropicalSigns: [5, 6],  ruler: 'Mercury', desc: 'A period of maturity and harvest.' },
        { key: 'hemanta', name: 'Hemanta (Winter)',          tropicalSigns: [7, 8],  ruler: 'Jupiter', desc: 'A period of frost and preservation.' }
    ],

    MAAS_NAMES: ["Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Sravana", "Bhadrapada", "Asvina", "Karttika", "Margasiras", "Pushya", "Magha", "Phalguna"],

    VARA: [
        { name: 'Sunday',    ruler: 'Sun',     quality: 'Fixed',   good: 'Leadership, government, high-visibility ventures, medicine, gold.', bad: 'Partnerships/collaboration (ego clashes).' },
        { name: 'Monday',    ruler: 'Moon',    quality: 'Movable', good: 'Public-facing trades, food, hospitality, travel, emotional connections.', bad: '—' },
        { name: 'Tuesday',   ruler: 'Mars',    quality: 'Fierce',  good: 'Military, sports, defense, competitive/aggressive action.', bad: 'Gentle or auspicious new beginnings.' },
        { name: 'Wednesday', ruler: 'Mercury', quality: 'Mixed',   good: 'Commerce, technology, communication, trading, logic.', bad: '—' },
        { name: 'Thursday',  ruler: 'Jupiter', quality: 'Swift',  good: 'Wealth, education, dharmic/ethical ventures, charity.', bad: '—' },
        { name: 'Friday',    ruler: 'Venus',   quality: 'Gentle',  good: 'Beauty, hospitality, luxury, arts, romance.', bad: '—' },
        { name: 'Saturday',  ruler: 'Saturn',  quality: 'Sharp',   good: 'Heavy industry, long-term institutional/legacy ventures.', bad: 'Fast-moving or new positive beginnings.' }
    ],

    TITHI_GROUPS: {
        Nanda:  { members: [1, 6, 11],  ruler: 'Venus/Moon',   best: 'Joyous events, entertainment, starting new work.' },
        Bhadra: { members: [2, 7, 12],  ruler: 'Mercury',      best: 'Wealth, business, starting a job, meeting important people.' },
        Jaya:   { members: [3, 8, 13],  ruler: 'Mars',         best: 'Overcoming obstacles, competitive efforts, litigation.' },
        Rikta:  { members: [4, 9, 14],  ruler: 'Saturn',       best: 'Elimination: paying off debts, surgery, waste disposal — AVOID for beginnings.' },
        Purna:  { members: [5, 10, 15], ruler: 'Jupiter',      best: 'Abundance, harvesting, education, minting money.' }
    },

    NAKSHATRA_CATEGORY_INFO: {
        'Dhruva':  { label: 'Fixed (Dhruva)',      best: 'Permanent, long-lasting activities: foundations, marriage, long-term investment, starting businesses.', bad: 'Temporary tasks or swift movement.' },
        'Chara':   { label: 'Movable (Chara)',     best: 'Motion-based tasks: buying vehicles, travel, changing jobs, machinery work.', bad: 'Permanent commitments.' },
        'Kshipra': { label: 'Light/Fast (Laghu/Kshipra)', best: 'Quick, temporary activities: medicine, short trips, sports, learning, trade.', bad: 'Long-term heavy foundations.' },
        'Mridu':   { label: 'Soft (Mridu)',        best: 'Gentle/artistic/relationship-building: music, romance, new clothes, making friends.', bad: 'Aggressive or highly competitive endeavors.' },
        'Tikshna': { label: 'Sharp (Tikshna)',     best: 'Cutting/piercing/aggressive: surgery, breaking habits, tantra, confronting enemies.', bad: 'Auspicious daily activities or gentle beginnings.' },
        'Ugra':    { label: 'Fierce (Ugra)',       best: 'Intense/forceful: legal matters, breaking contracts, fire/weapons, destroying enemies.', bad: 'Gentle, peaceful beginnings.' },
        'Mixed':   { label: 'Mixed (Mishra)',      best: 'Routine day-to-day duties, religious work (Agnihotra), melting, welding, preparing medicine.', bad: 'Soft or diplomatic actions.' }
    },

    // 60 Karanas cycle through 11 named karanas (4 "fixed" occur only once
    // per lunar month at the very start/end; 7 "movable" repeat 8x).
    KARANA_MOVEABLE: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'],
    KARANA_FIXED_TAIL: ['Shakuni', 'Chatushpada', 'Naga'],
    KARANA_INFO: {
        Bava: 'Health, strength, general auspicious acts.', Balava: 'Religious/meritorious acts, seeking blessings of authorities.',
        Kaulava: 'Love, friendship, relationship-building.', Taitila: 'Popularity, seeking shelter, housing affairs.',
        Gara: 'Cultivating land, sowing seeds, building houses.', Vanija: 'Trade, business associations, lasting ventures.',
        Vishti: 'BAD for beneficial deeds (extreme drudgery/delay) — good only for attacking enemies/destruction.',
        Kimstughna: 'Exception: favourable for marriage, meritorious acts, sacrifices (despite being a "fixed" karana).',
        Shakuni: 'Medicine, herbs, spells, astrology, prophecy — not for general auspicious work.',
        Chatushpada: 'Cattle, political affairs, ancestral rites — not for general auspicious work.',
        Naga: 'Cruelty, force, hateful acts — AVOID for beneficial deeds.'
    },

    // 27 Yogas — classical auspicious/inauspicious classification.
    YOGA_NAMES: ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shoola','Ganda',
        'Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva',
        'Siddha','Sadhya','Shubha','Shukla','Brahma','Aindra','Vaidhriti'],
    YOGA_BAD: ['Vishkambha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    YOGA_SEVERE_BAD: ['Vyatipata', 'Vaidhriti'], // "consuming fire" — strictly forbidden for constructive work

    CHOGADIYA_SEQUENCE: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
    CHOGADIYA_QUALITY: { Udveg: 'bad', Char: 'good', Labh: 'good', Amrit: 'good', Kaal: 'bad', Shubh: 'good', Rog: 'bad' },
    // Day-sequence starting Chogadiya per weekday (0=Sun..6=Sat), classical table.
    CHOGADIYA_DAY_START: { 0: 'Udveg', 1: 'Amrit', 2: 'Rog', 3: 'Labh', 4: 'Shubh', 5: 'Char', 6: 'Kaal' },
    // Night-sequence starting Chogadiya per weekday.
    CHOGADIYA_NIGHT_START: { 0: 'Shubh', 1: 'Char', 2: 'Kaal', 3: 'Udveg', 4: 'Amrit', 5: 'Rog', 6: 'Labh' },

    // Rahu Kaal / Yamaganda / Gulika Kaal: which of the 8 daytime segments
    // (Sunrise->Sunset divided into 8) is used, per weekday (0=Sun..6=Sat).
    RAHU_KAAL_SEGMENT:   { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 },
    YAMAGANDA_SEGMENT:   { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 },
    GULIKA_KAAL_SEGMENT: { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 },

    // ===================== ASTRONOMY HELPERS =====================

    _norm360: function (x) { return window.norm360 ? window.norm360(x) : ((x % 360) + 360) % 360; },

    /** Rough Lahiri ayanamsha (degrees) if no better source is wired up. */
    _approxAyanamsha: function (date) {
        const year = date.getFullYear() + (date.getMonth() + 1) / 12;
        return 23.85 + 0.0130125 * (year - 1950);
    },

    /** Returns { sunSid, moonSid, ayan } for a JS Date, using window helpers when present. */
    getSiderealPositions: function (date, lat, lon, utcOff) {
        utcOff = utcOff !== undefined ? utcOff : -date.getTimezoneOffset() / 60;
        if (window.jd && window.computeAll) {
            const ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
            const jday = window.jd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), ut);
            const ayan = window.getAyanamsha ? window.getAyanamsha(jday) : (window.BIRTH && window.BIRTH.ayan !== undefined ? window.BIRTH.ayan : this._approxAyanamsha(date));
            try {
                const pos = window.computeAll(jday, ayan, 1);
                if (pos && pos.Sun && pos.Moon) {
                    return { sunSid: this._norm360(pos.Sun.sid), moonSid: this._norm360(pos.Moon.sid), ayan: ayan, jd: jday };
                }
            } catch (e) { /* fall through to approximation */ }
        }
        // Very rough fallback (mean longitudes) — only used if no ephemeris is wired up.
        const epoch = Date.UTC(2000, 0, 1, 12, 0, 0);
        const days = (date.getTime() - epoch) / 86400000;
        const sunTropical = this._norm360(280.46 + 0.9856474 * days);
        const moonTropical = this._norm360(218.316 + 13.176396 * days);
        const ayan = this._approxAyanamsha(date);
        return { sunSid: this._norm360(sunTropical - ayan), moonSid: this._norm360(moonTropical - ayan), ayan: ayan, jd: null };
    },

    /** NOAA-style sunrise/sunset (self-contained, no ephemeris needed). Returns {sunrise, sunset} as JS Dates (local). */
    getSunriseSunset: function (date, lat, lon, utcOffsetHours) {
        const rad = Math.PI / 180, deg = 180 / Math.PI;
        const utcOff = utcOffsetHours !== undefined ? utcOffsetHours : -date.getTimezoneOffset() / 60;
        const yearStartUTC = Date.UTC(date.getFullYear(), 0, 0); // "day 0" reference (Dec 31 prev year, 00:00 UTC)
        const baseN = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - yearStartUTC) / 86400000);

        function calcUT(N, isSunrise) {
            const lngHour = lon / 15;
            const t = N + ((isSunrise ? 6 : 18) - lngHour) / 24;
            const M = (0.9856 * t) - 3.289;
            let L = M + (1.916 * Math.sin(M * rad)) + (0.020 * Math.sin(2 * M * rad)) + 282.634;
            L = ((L % 360) + 360) % 360;
            let RA = deg * Math.atan(0.91764 * Math.tan(L * rad));
            RA = ((RA % 360) + 360) % 360;
            const Lquadrant = Math.floor(L / 90) * 90;
            const RAquadrant = Math.floor(RA / 90) * 90;
            RA = RA + (Lquadrant - RAquadrant);
            RA /= 15;
            const sinDec = 0.39782 * Math.sin(L * rad);
            const cosDec = Math.cos(Math.asin(sinDec));
            const zenith = 90.833;
            const cosH = (Math.cos(zenith * rad) - (sinDec * Math.sin(lat * rad))) / (cosDec * Math.cos(lat * rad));
            if (cosH > 1 || cosH < -1) return null; // polar day/night — not handled further
            let H = isSunrise ? 360 - deg * Math.acos(cosH) : deg * Math.acos(cosH);
            H /= 15;
            const Tt = H + RA - (0.06571 * t) - 6.622;
            let UT = Tt - lngHour;
            UT = ((UT % 24) + 24) % 24;
            return UT;
        }

        // The simple day-of-year formula can hand back a UT event that,
        // once converted to local time (UT + offset), actually lands on
        // the calendar day before or after the one we asked for (this
        // depends on longitude/offset). Try N-1, N, N+1 and keep whichever
        // candidate's LOCAL calendar date matches the requested date.
        function findEvent(isSunrise) {
            for (const dN of [0, -1, 1]) {
                const N = baseN + dN;
                const UT = calcUT(N, isSunrise);
                if (UT === null) continue;
                const absoluteInstant = new Date(yearStartUTC + N * 86400000 + UT * 3600000);
                const localInstant = new Date(absoluteInstant.getTime() + utcOff * 3600000);
                if (localInstant.getUTCFullYear() === date.getFullYear() &&
                    localInstant.getUTCMonth() === date.getMonth() &&
                    localInstant.getUTCDate() === date.getDate()) {
                    return absoluteInstant;
                }
            }
            return null;
        }

        return { sunrise: findEvent(true), sunset: findEvent(false), utcOffsetHours: utcOff };
    },

    // ===================== PANCHANG ELEMENT CALCULATORS =====================

    getNakshatra: function (moonSid) {
        const NAKS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.NAKSHATRAS) || [];
        const span = 360 / 27;
        const idx = Math.min(26, Math.floor(this._norm360(moonSid) / span));
        const within = this._norm360(moonSid) - idx * span;
        const pada = Math.min(4, Math.floor(within / (span / 4)) + 1);
        const nak = NAKS[idx] || { name: 'Nak' + idx, lord: '?', nature: 'Mixed' };
        const natureKey = (nak.nature || 'Mixed').split(' ')[0];
        return { index: idx, name: nak.name, lord: nak.lord, pada: pada, natureKey: natureKey, natureInfo: this.NAKSHATRA_CATEGORY_INFO[natureKey] || this.NAKSHATRA_CATEGORY_INFO.Mixed };
    },

    getTithi: function (sunSid, moonSid) {
        const diff = this._norm360(moonSid - sunSid);
        const num = Math.floor(diff / 12) + 1; // 1-30
        const paksha = num <= 15 ? 'Shukla' : 'Krishna';
        const ofPaksha = num <= 15 ? num : num - 15; // 1-15
        let groupName = null;
        Object.entries(this.TITHI_GROUPS).forEach(([g, info]) => { if (info.members.includes(ofPaksha)) groupName = g; });
        return { number: num, paksha: paksha, ofPaksha: ofPaksha, group: groupName, groupInfo: this.TITHI_GROUPS[groupName] };
    },

    getVara: function (date) {
        return this.VARA[date.getDay()];
    },

    getKarana: function (sunSid, moonSid) {
        const diff = this._norm360(moonSid - sunSid);
        const idx = Math.floor(diff / 6); // 0-59
        let name;
        if (idx === 0) name = 'Kimstughna';
        else if (idx >= 57) name = this.KARANA_FIXED_TAIL[idx - 57];
        else name = this.KARANA_MOVEABLE[(idx - 1) % 7];
        return { index: idx, name: name, info: this.KARANA_INFO[name] || '', favorable: !['Vishti', 'Shakuni', 'Chatushpada', 'Naga'].includes(name) };
    },

    getYoga: function (sunSid, moonSid) {
        const sum = this._norm360(sunSid + moonSid);
        const idx = Math.floor(sum / (360 / 27));
        const name = this.YOGA_NAMES[idx];
        const severe = this.YOGA_SEVERE_BAD.includes(name);
        const bad = this.YOGA_BAD.includes(name);
        return { index: idx, name: name, nature: severe ? 'severe-bad' : bad ? 'bad' : 'good' };
    },

    getRitu: function (sunSid, ayan) {
        const tropicalSun = this._norm360(sunSid + ayan);
        const sign = Math.floor(tropicalSun / 30);
        const ritu = this.RITU_SEASONS.find(r => r.tropicalSigns.includes(sign));
        return ritu || this.RITU_SEASONS[0];
    },

    /** Maas (lunar month) by the amanta convention: month = sign of the Sun at the preceding/covering New Moon; simplified here via the Nakshatra of the following Purnima's Moon, using Sun's sidereal sign as a practical proxy. */
    getMaas: function (sunSid) {
        const sign = Math.floor(this._norm360(sunSid) / 30);
        return this.MAAS_NAMES[sign];
    },

    getChogadiya: function (date, sunrise, sunset) {
        if (!sunrise || !sunset) return null;
        const dow = date.getDay();
        const dayStart = this.CHOGADIYA_DAY_START[dow];
        const nightStart = this.CHOGADIYA_NIGHT_START[dow];
        const dayStartIdx = this.CHOGADIYA_SEQUENCE.indexOf(dayStart);
        const nightStartIdx = this.CHOGADIYA_SEQUENCE.indexOf(nightStart);
        const daySpan = (sunset - sunrise) / 8;
        // Night span approximated as (next sunrise - sunset); since we don't
        // have tomorrow's exact sunrise here, reuse today's daylight length
        // as a close approximation of the night span (accurate to a few
        // minutes for most latitudes/seasons).
        const nightSpan = (24 * 3600000 - (sunset - sunrise)) / 8;
        const segments = [];
        for (let i = 0; i < 8; i++) {
            const nm = this.CHOGADIYA_SEQUENCE[(dayStartIdx + i) % 7];
            segments.push({
                period: 'day', name: nm, quality: this.CHOGADIYA_QUALITY[nm],
                start: new Date(sunrise.getTime() + i * daySpan), end: new Date(sunrise.getTime() + (i + 1) * daySpan)
            });
        }
        for (let i = 0; i < 8; i++) {
            const nm = this.CHOGADIYA_SEQUENCE[(nightStartIdx + i) % 7];
            segments.push({
                period: 'night', name: nm, quality: this.CHOGADIYA_QUALITY[nm],
                start: new Date(sunset.getTime() + i * nightSpan), end: new Date(sunset.getTime() + (i + 1) * nightSpan)
            });
        }
        return segments;
    },

    /** Rahu Kaal / Yamaganda / Gulika Kaal windows (each = 1/8th of the daylight span). */
    getInauspiciousWindows: function (date, sunrise, sunset) {
        if (!sunrise || !sunset) return null;
        const dow = date.getDay();
        const span = (sunset - sunrise) / 8;
        const windowFor = (segment1to8) => ({
            start: new Date(sunrise.getTime() + (segment1to8 - 1) * span),
            end: new Date(sunrise.getTime() + segment1to8 * span)
        });
        return {
            rahuKaal: windowFor(this.RAHU_KAAL_SEGMENT[dow]),
            yamaganda: windowFor(this.YAMAGANDA_SEGMENT[dow]),
            gulikaKaal: windowFor(this.GULIKA_KAAL_SEGMENT[dow])
        };
    },

    /** Abhijit Muhurat — the 8th of 15 muhurtas of the day, centred on local solar noon; ~1/15th of daylight span wide. */
    getAbhijitMuhurat: function (sunrise, sunset) {
        if (!sunrise || !sunset) return null;
        const daySpan = sunset - sunrise;
        const muhurtaLen = daySpan / 15;
        const solarNoon = new Date(sunrise.getTime() + daySpan / 2);
        return { start: new Date(solarNoon.getTime() - muhurtaLen / 2), end: new Date(solarNoon.getTime() + muhurtaLen / 2), solarNoon: solarNoon };
    },

    /** Brahma Muhurat — the 2nd-to-last muhurta before sunrise (~1.5h before sunrise, ~48min window). */
    getBrahmaMuhurat: function (sunrise) {
        if (!sunrise) return null;
        return { start: new Date(sunrise.getTime() - 96 * 60000), end: new Date(sunrise.getTime() - 48 * 60000) };
    },

    // ===================== FULL PANCHANG FOR A MOMENT =====================

    /**
     * Full Panchang for a given JS Date + location.
     * @param {Date} date  - local date/time to evaluate
     * @param {number} lat - latitude (degrees, + = North)
     * @param {number} lon - longitude (degrees, + = East)
     * @param {number} [utcOffsetHours] - timezone offset in hours (defaults to browser's local offset)
     */
    compute: function (date, lat, lon, utcOffsetHours) {
        const { sunSid, moonSid, ayan } = this.getSiderealPositions(date, lat, lon, utcOffsetHours);
        const { sunrise, sunset, utcOffsetHours: resolvedOffset } = this.getSunriseSunset(date, lat, lon, utcOffsetHours);
        const nakshatra = this.getNakshatra(moonSid);
        const tithi = this.getTithi(sunSid, moonSid);
        const vara = this.getVara(date);
        const karana = this.getKarana(sunSid, moonSid);
        const yoga = this.getYoga(sunSid, moonSid);
        const ritu = this.getRitu(sunSid, ayan);
        const maas = this.getMaas(sunSid);
        const chogadiya = this.getChogadiya(date, sunrise, sunset);
        const inauspicious = this.getInauspiciousWindows(date, sunrise, sunset);
        const abhijit = this.getAbhijitMuhurat(sunrise, sunset);
        const brahma = this.getBrahmaMuhurat(sunrise);

        // Special combined yogas
        const isPushyaDay = nakshatra.name === 'Pushya';
        const guruPushyaYoga = isPushyaDay && vara.name === 'Thursday';
        const raviPushyaYoga = isPushyaDay && vara.name === 'Sunday'; // a form of Sarvartha Siddhi
        const sarvarthaSiddhi = raviPushyaYoga; // simplified: extend with full day+nakshatra table if needed

        return {
            date, lat, lon, sunSid, moonSid, ayan, sunrise, sunset, utcOffsetHours: resolvedOffset,
            ritu, maas, nakshatra, tithi, vara, karana, yoga,
            chogadiya, inauspicious, abhijit, brahma,
            specialYogas: { guruPushyaYoga, raviPushyaYoga, sarvarthaSiddhi, isPushyaDay }
        };
    },

    // ===================== RECOMMENDATION TEXT =====================

    /** Human-readable "what to do now" summary for a computed Panchang. */
    recommendation: function (p) {
        const lines = [];
        lines.push(`Nakshatra ${p.nakshatra.name} (${p.nakshatra.natureInfo.label}): best for ${p.nakshatra.natureInfo.best}`);
        if (p.tithi.groupInfo) lines.push(`Tithi ${p.tithi.ofPaksha} (${p.tithi.paksha}) — ${p.tithi.group}: ${p.tithi.groupInfo.best}`);
        lines.push(`${p.vara.name} (${p.vara.ruler}): ${p.vara.good}${p.vara.bad !== '—' ? ' Avoid: ' + p.vara.bad : ''}`);
        lines.push(`Karana ${p.karana.name}: ${p.karana.info}`);
        lines.push(`Yoga ${p.yoga.name}: ${p.yoga.nature === 'severe-bad' ? 'STRICTLY AVOID for constructive work (classically "consuming fire").' : p.yoga.nature === 'bad' ? 'Inauspicious — avoid new beneficial beginnings.' : 'Auspicious — supports firmness and good resolution.'}`);
        if (p.specialYogas.guruPushyaYoga) lines.push('⭐ Guru Pushya Yoga today — one of the most favoured windows for commerce/wealth all day.');
        if (p.specialYogas.raviPushyaYoga) lines.push('⭐ Ravi Pushya Yoga today — Sarvartha Siddhi-like, generally excellent all day.');
        if (p.abhijit) lines.push(`Abhijit Muhurat: ${this.fmtTime(p.abhijit.start, p.utcOffsetHours)}–${this.fmtTime(p.abhijit.end, p.utcOffsetHours)} — universally auspicious window, overrides most ordinary contradictions.`);
        if (p.inauspicious) lines.push(`Avoid Rahu Kaal ${this.fmtTime(p.inauspicious.rahuKaal.start, p.utcOffsetHours)}–${this.fmtTime(p.inauspicious.rahuKaal.end, p.utcOffsetHours)} for new beginnings.`);
        return lines;
    },

    fmtTime: function (d, utcOffsetHours) {
        if (!d) return '?';
        const off = utcOffsetHours !== undefined ? utcOffsetHours : -new Date().getTimezoneOffset() / 60;
        const shifted = new Date(d.getTime() + off * 3600000);
        let h = shifted.getUTCHours(), m = shifted.getUTCMinutes();
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12; if (h === 0) h = 12;
        return `${h}:${String(m).padStart(2, '0')} ${ap}`;
    },
    fmtDate: function (d, utcOffsetHours) {
        const off = utcOffsetHours !== undefined ? utcOffsetHours : -new Date().getTimezoneOffset() / 60;
        const shifted = new Date(d.getTime() + off * 3600000);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${String(shifted.getUTCDate()).padStart(2,'0')} ${months[shifted.getUTCMonth()]} ${shifted.getUTCFullYear()}`;
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.PANCHANG_ENGINE;
