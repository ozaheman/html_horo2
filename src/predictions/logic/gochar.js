/**
 * gochar.js
 *
 * "Gochar" (Transit) Prediction Engine.
 *
 * Answers, for the person's chart RIGHT NOW (or any chosen date):
 *   1. Which bhavas (houses) are currently ACTIVE — from natal Lagna, from
 *      natal Moon (Rashi Tulya / Chandra Lagna), and via the classical
 *      "Dwigraha Gochar" (Jupiter+Saturn double-transit significator)
 *      technique taught in "गोचर फल कैसे देखें" — Jupiter and Saturn are
 *      each given a significator-house table (occupied house, aspected
 *      houses, owned houses, houses of planets they relate to in transit,
 *      and their fixed Kaal-Purush karakatva house — 9th for Jupiter,
 *      10th for Saturn); houses common to BOTH tables are the truly
 *      "active" bhavas for this period.
 *   2. Benefic/malefic EFFECT of each transiting planet right now —
 *      combining naisargik nature, functional (house-lordship) nature,
 *      and sign-dignity of the transit position.
 *   3. Current DASHA × TRANSIT effect — for the Mahadasha, Antardasha,
 *      Pratyantardasha and Sookshma-dasha lords, is each one transiting
 *      favourably or not right now (the "Dashanath transiting well" rule
 *      from the same teaching: a dasha only delivers its promised result
 *      if its lord is ALSO well-placed in transit).
 *   4. Sudarshan Chakra — the classical tri-lagna (Lagna + Chandra Lagna +
 *      Surya Lagna) overlay: for each of the 12 houses, how many of the
 *      three reference points currently see it occupied/aspected.
 *   5. Optional integration with window.SUDARSHAN_CHAKRA (the Sudarshan
 *      Chakra DASHA engine already in this app) — if available, shows
 *      today's SCD Mahadasha house and which transiting planets sit there.
 *   6. The classical 5-FACTOR overall time-quality check: Lagnesh,
 *      Mahadasha lord, Antardasha lord, Jupiter, Saturn — all transiting
 *      well = a good period; several transiting poorly = a difficult one.
 *
 * Depends on (all optional / degrades gracefully if missing):
 *   - window.ASTRO_CONSTANTS (constant.js) — BENEFICS/MALEFICS, DIGNITIES,
 *     NATURAL_RELATIONSHIPS, HOUSE_NATURE, HOUSE_SIGNIFICATIONS, SIGNS.
 *   - a global LORDS array (sign-index -> ruling planet), OR pass `lords`
 *     explicitly into every call.
 *   - window.SUDARSHAN_CHAKRA (sudarshan_chakra.js) — for the SCD overlay.
 *   - window.ASHTAKVARGA — if present, callers may enrich the pancha-factor
 *     verdict with bindus themselves (this module stays chart-engine
 *     agnostic and does not call it directly; see gochar's usage notes in
 *     predictions_ui.js for the optional bindu enrichment pattern).
 *
 * This module is pure data + HTML-string generation — it does NOT touch
 * the DOM/canvas itself. Chart drawing (D1/D9/Transit/Rashi-Tulya/Moon)
 * is left to the caller via getChartConfigs(), which returns plain
 * {canvasId, label, planets, asc} descriptors for window.drawDChart().
 */

window.GOCHAR = {

    // ===================== 0. CONSTANTS =====================

    KENDRA: [1, 4, 7, 10],
    TRIKONA: [1, 5, 9],
    TRIK: [6, 8, 12],
    UPACHAYA: [3, 6, 10, 11],

    // Kaal-Purush-Kundali fixed natural significator houses (from the
    // "गोचर फल कैसे देखें" teaching): Jupiter is the natural 9th-house
    // (Dharma/Bhagya) karaka; Saturn is the natural 10th-house (Karma)
    // karaka — used as a FIXED extra significator house for each in the
    // Dwigraha Gochar technique, regardless of ascendant.
    JUPITER_KARAKATVA_HOUSE: 9,
    SATURN_KARAKATVA_HOUSE: 10,

    // Special Vedic drishti (aspect) offsets, counted inclusively from a
    // planet's own house (so 7 = the opposite/7th house). Any planet not
    // listed uses the universal 7th-house aspect only.
    VEDIC_ASPECT_OFFSETS: {
        Mars: [4, 7, 8],
        Jupiter: [5, 7, 9],
        Saturn: [3, 7, 10],
        default: [7]
    },

    PLANETS9: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    PLANETS7: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],

    _mod12: function (h) {
        return (((h - 1) % 12) + 12) % 12 + 1;
    },

    _lords: function (lords) {
        return lords || (typeof LORDS !== 'undefined' ? LORDS : (window.LORDS || null));
    },

    /** Houses a planet rules for a given natal ascendant sign-number. */
    _housesRuledBy: function (planet, ascSignNum, lords) {
        const L = this._lords(lords);
        if (!L) return [];
        const out = [];
        for (let h = 1; h <= 12; h++) {
            if (L[(ascSignNum + h - 1) % 12] === planet) out.push(h);
        }
        return out;
    },

    _groupOf: function (house) {
        const inK = this.KENDRA.includes(house), inT = this.TRIKONA.includes(house);
        if (inK && inT) return 'kendra-trikona';
        if (inT) return 'trikona';
        if (inK) return 'kendra';
        if (this.TRIK.includes(house)) return 'trik';
        if (this.UPACHAYA.includes(house)) return 'upachaya';
        return 'other';
    },

    /** Houses aspected by `planet` sitting in `house` (its current transit house). */
    _aspectedHousesFrom: function (planet, house) {
        const offs = this.VEDIC_ASPECT_OFFSETS[planet] || this.VEDIC_ASPECT_OFFSETS.default;
        return offs.map(o => this._mod12(house + o - 1));
    },

    /** Transit house number (1-12) counted from a given reference sign-number ("house 1"). */
    _transitHouseFrom: function (refSignNum, planetSignNum) {
        return this._mod12(planetSignNum - refSignNum + 1);
    },

    // ===================== 1. HOUSE ACTIVATION (general) =====================

    /**
     * For every house 1-12 counted from `refSignNum` (natal Lagna sign-num,
     * natal Moon sign-num, natal Sun sign-num, or today's own Lagna
     * sign-num — caller decides which reference to use), lists which
     * transiting planets OCCUPY it and which ASPECT it.
     */
    getActiveHouses: function (transitPlanetsMap, refSignNum) {
        const houseData = {};
        for (let h = 1; h <= 12; h++) houseData[h] = { house: h, occupants: [], aspectedBy: [] };
        if (refSignNum === undefined || refSignNum === null || !transitPlanetsMap) return Object.values(houseData);

        this.PLANETS9.forEach(p => {
            const tp = transitPlanetsMap[p];
            if (!tp || tp.sn === undefined) return;
            const house = this._transitHouseFrom(refSignNum, tp.sn);
            houseData[house].occupants.push(p);
            this._aspectedHousesFrom(p, house).forEach(ah => houseData[ah].aspectedBy.push(p));
        });

        return Object.values(houseData).map(hd => Object.assign({}, hd, {
            touchCount: hd.occupants.length + hd.aspectedBy.length,
            group: this._groupOf(hd.house)
        }));
    },

    // ===================== 2. DWIGRAHA GOCHAR (Jupiter+Saturn double transit) =====================

    /**
     * Builds Jupiter's and Saturn's significator-house tables (own transit
     * house + special drishti houses + natally-owned houses + houses ruled
     * by any planet they're conjunct/aspecting in transit + their fixed
     * karakatva house), then intersects the two — the houses common to
     * BOTH are the classically "active" bhavas for this period per the
     * Dwigraha Gochar Siddhant.
     */
    getDwigrahaGochar: function (transitPlanetsMap, ascSignNum, lords) {
        const L = this._lords(lords);
        const buildFor = (planet, karakaHouse) => {
            const tp = transitPlanetsMap && transitPlanetsMap[planet];
            if (!tp || tp.sn === undefined) return null;
            const house = this._transitHouseFrom(ascSignNum, tp.sn);
            const aspected = this._aspectedHousesFrom(planet, house);
            const owned = this._housesRuledBy(planet, ascSignNum, L);
            const relatedHouses = new Set();
            this.PLANETS9.forEach(other => {
                if (other === planet) return;
                const op = transitPlanetsMap[other];
                if (!op || op.sn === undefined) return;
                const oHouse = this._transitHouseFrom(ascSignNum, op.sn);
                const isConjunct = oHouse === house;
                const isAspectedByMain = aspected.includes(oHouse);
                if (isConjunct || isAspectedByMain) {
                    this._housesRuledBy(other, ascSignNum, L).forEach(h => relatedHouses.add(h));
                }
            });
            const sig = new Set([house, karakaHouse, ...aspected, ...owned, ...Array.from(relatedHouses)]);
            return {
                planet: planet, transitHouse: house, aspectedHouses: aspected,
                ownedHouses: owned, karakaHouse: karakaHouse, relatedHouses: Array.from(relatedHouses).sort((a, b) => a - b),
                significators: Array.from(sig).sort((a, b) => a - b)
            };
        };

        const jupiter = buildFor('Jupiter', this.JUPITER_KARAKATVA_HOUSE);
        const saturn = buildFor('Saturn', this.SATURN_KARAKATVA_HOUSE);
        const commonHouses = (jupiter && saturn)
            ? jupiter.significators.filter(h => saturn.significators.includes(h))
            : [];

        return { jupiter: jupiter, saturn: saturn, commonHouses: commonHouses };
    },

    // ===================== 3. BENEFIC/MALEFIC EFFECT OF A TRANSITING PLANET =====================

    /**
     * Combines naisargik (natural) nature, functional (natal house
     * lordship) nature, and sign-dignity of the CURRENT transit position
     * into one "is this planet acting favourably right now" verdict.
     */
    getBeneficMaleficNow: function (planet, transitPlanetsMap, ascSignNum, lords) {
        const L = this._lords(lords);
        const AC = window.ASTRO_CONSTANTS || {};
        const tp = transitPlanetsMap && transitPlanetsMap[planet];
        if (!tp || tp.sn === undefined) return null;
        const tSn = tp.sn;
        const house = this._transitHouseFrom(ascSignNum, tSn);
        const group = this._groupOf(house);

        // --- naisargik nature (from this app's own constant.js table) ---
        let naisargik = 'neutral';
        if ((AC.BENEFICS || []).includes(planet)) naisargik = 'benefic';
        else if ((AC.MALEFICS || []).includes(planet)) naisargik = 'malefic';

        // --- functional nature (natal house lordship) ---
        let functional = 'neutral', functionalReason = '';
        if (planet === 'Rahu' || planet === 'Ketu') {
            functionalReason = 'Rahu/Ketu do not classically own houses — judged by naisargik nature and sign-dignity only.';
        } else if (L) {
            const owned = this._housesRuledBy(planet, ascSignNum, L);
            const groups = owned.map(h => this._groupOf(h));
            if (groups.includes('trik')) {
                functional = 'malefic';
                functionalReason = `rules Trik/Dushtana house(s) ${owned.filter(h => this._groupOf(h) === 'trik').join(', ')} for this ascendant`;
            } else if (groups.some(g => g === 'trikona' || g === 'kendra-trikona')) {
                functional = 'benefic';
                functionalReason = `rules Trikona house(s) ${owned.filter(h => this.TRIKONA.includes(h)).join(', ')} for this ascendant`;
            } else if (groups.includes('kendra')) {
                functional = 'benefic';
                functionalReason = `rules Kendra house(s) ${owned.filter(h => this.KENDRA.includes(h)).join(', ')} for this ascendant`;
            } else if (owned.length) {
                functional = 'mixed';
                functionalReason = `rules only Dhana/Upachaya house(s) ${owned.join(', ')} — mixed functional nature`;
            }
        }

        // --- sign dignity of the transit position ---
        let dignity = 'neutral';
        const DIG = AC.DIGNITIES && AC.DIGNITIES[planet];
        const signLordPlanet = L ? L[tSn] : null;
        if (DIG) {
            if (DIG.exalt === tSn) dignity = 'exalted';
            else if (DIG.debilitation === tSn) dignity = 'debilitated';
            else if ((DIG.own || []).includes(tSn)) dignity = 'own';
            else if (AC.NATURAL_RELATIONSHIPS && AC.NATURAL_RELATIONSHIPS[planet] && signLordPlanet && signLordPlanet !== planet) {
                const rel = AC.NATURAL_RELATIONSHIPS[planet][signLordPlanet];
                dignity = rel === 'Friend' ? 'friendly-sign' : rel === 'Enemy' ? 'enemy-sign' : 'neutral-sign';
            }
        }

        const housePol = (AC.HOUSE_NATURE && AC.HOUSE_NATURE[house]) ? AC.HOUSE_NATURE[house].pol : 0;

        let score = 0;
        if (naisargik === 'benefic') score += 1; else if (naisargik === 'malefic') score -= 1;
        if (functional === 'benefic') score += 1; else if (functional === 'malefic') score -= 1;
        if (dignity === 'exalted') score += 2; else if (dignity === 'own') score += 1; else if (dignity === 'friendly-sign') score += 0.5;
        else if (dignity === 'debilitated') score -= 2; else if (dignity === 'enemy-sign') score -= 0.5;
        score += housePol * 0.5;

        const verdict = score >= 1.5 ? 'favorable' : score <= -1.5 ? 'challenging' : 'mixed';

        return {
            planet: planet, house: house, sign: (AC.SIGNS || [])[tSn], group: group,
            naisargik: naisargik, functional: functional, functionalReason: functionalReason,
            dignity: dignity, housePol: housePol, score: score, verdict: verdict
        };
    },

    // ===================== 4. DASHA × TRANSIT EFFECT (MD/AD/PD/Sookshma) =====================

    /**
     * `dashaInfo` = the object returned by
     * window.PREDICTION_FORECASTING.getCurrentDashaInfo(date):
     * { mahadasha, antardasha, pratyantar, sukshma, ... } each with a
     * `.lord` field.
     */
    getDashaTransitEffect: function (dashaInfo, transitPlanetsMap, ascSignNum, lords) {
        if (!dashaInfo) return [];
        const L = this._lords(lords);
        const levels = [
            { key: 'md', label: 'Mahadasha', data: dashaInfo.mahadasha, weight: "Sets the overall tone for this multi-year period — if its lord transits poorly, even a promising Mahadasha struggles to deliver." },
            { key: 'ad', label: 'Antardasha', data: dashaInfo.antardasha, weight: "Refines/modifies the Mahadasha's promise for this sub-period." },
            { key: 'pd', label: 'Pratyantardasha', data: dashaInfo.pratyantar, weight: "Fine-tunes short-term timing within the Antardasha above." },
            { key: 'sookshma', label: 'Sookshma Dasha', data: dashaInfo.sukshma, weight: "Narrowest classical timing layer — pinpoints week-to-week flavour." }
        ];
        return levels.map(lv => {
            if (!lv.data || !lv.data.lord) return { level: lv.label, lord: null, verdict: null, weight: lv.weight };
            const lord = lv.data.lord;
            const verdict = this.getBeneficMaleficNow(lord, transitPlanetsMap, ascSignNum, L);
            return { level: lv.label, lord: lord, verdict: verdict, weight: lv.weight };
        });
    },

    // ===================== 5. SUDARSHAN CHAKRA (tri-lagna transit overlay) =====================

    /**
     * Classical Sudarshan Chakra technique: overlay house-activation
     * counted from THREE reference points — natal Lagna, natal Chandra
     * (Moon sign), and natal Surya (Sun sign) — onto one 12-house wheel.
     * A house touched from all 3 references is far more strongly
     * "activated" right now than one touched from just 1.
     */
    getSudarshanChakra: function (transitPlanetsMap, natalAscSn, natalMoonSn, natalSunSn) {
        const refs = { Lagna: natalAscSn, Chandra: natalMoonSn, Surya: natalSunSn };
        const perRef = {};
        Object.keys(refs).forEach(name => {
            const sn = refs[name];
            perRef[name] = (sn === undefined || sn === null) ? null : this.getActiveHouses(transitPlanetsMap, sn);
        });

        const tally = [];
        for (let h = 1; h <= 12; h++) {
            const refsActive = [];
            const planetsByRef = {};
            Object.keys(perRef).forEach(name => {
                const data = perRef[name];
                if (!data) return;
                const hd = data.find(d => d.house === h);
                if (hd && (hd.occupants.length || hd.aspectedBy.length)) {
                    refsActive.push(name);
                    planetsByRef[name] = { occupants: hd.occupants, aspectedBy: hd.aspectedBy };
                }
            });
            tally.push({ house: h, refsActive: refsActive, planetsByRef: planetsByRef, strength: refsActive.length });
        }

        return { perRef: perRef, tally: tally };
    },

    /**
     * Optional integration with window.SUDARSHAN_CHAKRA (the Sudarshan
     * Chakra DASHA engine, sudarshan_chakra.js) — finds today's active SCD
     * Mahadasha house and lists which transiting planets currently sit
     * there (from natal Lagna).
     */
    getSCDNow: function (currentDate, birthDate, birthLagnaLon, activeHousesLagna) {
        if (!window.SUDARSHAN_CHAKRA || !birthDate || birthLagnaLon === undefined || birthLagnaLon === null || !currentDate) return null;
        try {
            const y = currentDate.getFullYear();
            const periods = window.SUDARSHAN_CHAKRA.getSCDPeriods(birthDate, birthLagnaLon, y - 1, y + 1);
            const active = periods.find(p => currentDate >= p.start && currentDate < p.end);
            if (!active) return null;
            const hd = (activeHousesLagna || []).find(h => h.house === active.mdHouse);
            return { active: active, transitingPlanetsInMDHouse: hd ? hd.occupants : [] };
        } catch (e) {
            return null;
        }
    },

    // ===================== 6. FIVE-FACTOR OVERALL TIME-QUALITY VERDICT =====================

    /**
     * Classical 5-factor check from "गोचर फल कैसे देखें": Lagnesh,
     * Mahadasha lord, Antardasha lord, Jupiter, Saturn — all transiting
     * well = a strongly favourable period; several transiting poorly =
     * a difficult one. De-duplicates by planet (e.g. Lagnesh === MD lord).
     */
    getPanchaFactorVerdict: function (params) {
        const transitPlanetsMap = params.transitPlanetsMap, ascSignNum = params.ascSignNum, lords = params.lords;
        const roleMap = {};
        const addRole = (planet, role) => { if (!planet) return; (roleMap[planet] = roleMap[planet] || []).push(role); };
        addRole(params.lagnesh, 'Lagnesh (Ascendant Lord)');
        addRole(params.mdLord, 'Mahadasha Lord');
        addRole(params.adLord, 'Antardasha Lord');
        addRole('Jupiter', 'Guru (natural benefic karaka)');
        addRole('Saturn', 'Shani (karma karaka)');

        const factors = Object.keys(roleMap).map(planet => {
            const v = this.getBeneficMaleficNow(planet, transitPlanetsMap, ascSignNum, lords);
            return v ? Object.assign({ roles: roleMap[planet] }, v) : null;
        }).filter(Boolean);

        const favorableCount = factors.filter(f => f.verdict === 'favorable').length;
        const challengingCount = factors.filter(f => f.verdict === 'challenging').length;
        const total = factors.length;
        let overall = 'mixed';
        if (total) {
            if (favorableCount === total) overall = 'very favourable';
            else if (favorableCount > challengingCount) overall = 'favourable';
            else if (challengingCount > favorableCount) overall = 'challenging';
        }
        return { factors: factors, favorableCount: favorableCount, challengingCount: challengingCount, total: total, overall: overall };
    },

    // ===================== 7. TOP-LEVEL ANALYZE =====================

    /**
     * params:
     *   natalPlanets, natalAsc      - natal D1 chart ({sn,...} per planet / asc)
     *   transitPlanets, transitAsc  - today's transit positions ({sn,...}) / today's own ascendant ({sn,...})
     *   lords                       - sign-index -> lord array (defaults to global LORDS)
     *   dashaInfo                   - output of PREDICTION_FORECASTING.getCurrentDashaInfo(date)
     *   currentDate, birthDate      - JS Date objects
     *   birthLagnaLon               - natal Lagna's sidereal longitude (for optional SCD overlay)
     */
    analyze: function (params) {
        params = params || {};
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc,
              transitPlanets = params.transitPlanets, transitAsc = params.transitAsc;
        if (!natalPlanets || !natalAsc || !transitPlanets) return null;

        const L = this._lords(params.lords);
        const ascSignNum = natalAsc.sn;
        const moonSignNum = natalPlanets.Moon ? natalPlanets.Moon.sn : undefined;
        const sunSignNum = natalPlanets.Sun ? natalPlanets.Sun.sn : undefined;
        const transitAscSignNum = transitAsc ? transitAsc.sn : undefined;

        const activeHousesLagna = this.getActiveHouses(transitPlanets, ascSignNum);
        const activeHousesMoon = (moonSignNum !== undefined) ? this.getActiveHouses(transitPlanets, moonSignNum) : [];
        const activeHousesToday = (transitAscSignNum !== undefined) ? this.getActiveHouses(transitPlanets, transitAscSignNum) : [];

        const dwigraha = this.getDwigrahaGochar(transitPlanets, ascSignNum, L);

        const beneficMaleficNow = this.PLANETS9
            .map(p => this.getBeneficMaleficNow(p, transitPlanets, ascSignNum, L))
            .filter(Boolean);

        const dashaTransitEffect = this.getDashaTransitEffect(params.dashaInfo, transitPlanets, ascSignNum, L);

        const sudarshanChakra = this.getSudarshanChakra(transitPlanets, ascSignNum, moonSignNum, sunSignNum);

        const scd = this.getSCDNow(params.currentDate, params.birthDate, params.birthLagnaLon, activeHousesLagna);
        const sawhneyMoonTransit = (moonSignNum !== undefined) ? this.getAllSawhneyMoonTransitVerdicts(transitPlanets, moonSignNum) : [];
        const lagnesh = L ? L[ascSignNum] : null;
        const mdLord = params.dashaInfo && params.dashaInfo.mahadasha ? params.dashaInfo.mahadasha.lord : null;
        const adLord = params.dashaInfo && params.dashaInfo.antardasha ? params.dashaInfo.antardasha.lord : null;
        const panchaFactor = this.getPanchaFactorVerdict({
            transitPlanetsMap: transitPlanets, ascSignNum: ascSignNum, lords: L,
            lagnesh: lagnesh, mdLord: mdLord, adLord: adLord
        });

        return {
            date: params.currentDate, ascSignNum: ascSignNum, moonSignNum: moonSignNum,
            sunSignNum: sunSignNum, transitAscSignNum: transitAscSignNum,
            activeHousesLagna: activeHousesLagna, activeHousesMoon: activeHousesMoon, activeHousesToday: activeHousesToday,
            dwigraha: dwigraha, beneficMaleficNow: beneficMaleficNow,
            dashaTransitEffect: dashaTransitEffect, sudarshanChakra: sudarshanChakra, scd: scd,
            sawhneyMoonTransit: sawhneyMoonTransit,
            panchaFactor: panchaFactor, lagnesh: lagnesh, mdLord: mdLord, adLord: adLord
        };
    },

    // ===================== 8. CHART CONFIGS (for caller to draw via window.drawDChart) =====================

    /**
     * Returns plain descriptors for the 5 requested chart panels — D1, D9,
     * live Transit-of-the-day, Rashi-Tulya (transit planets over natal
     * Lagna houses), and Moon-transit (transit planets over natal Chandra
     * Lagna houses). This module does NOT touch canvases itself; the
     * caller loops over the returned array and calls
     * window.drawDChart(cfg.canvasId, {planets: cfg.planets, asc: cfg.asc})
     * AFTER the HTML from renderHTML() has been inserted into the DOM.
     */
    getChartConfigs: function (params) {
        params = params || {};
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc,
              d9Planets = params.d9Planets, d9Asc = params.d9Asc,
              transitPlanets = params.transitPlanets, transitAsc = params.transitAsc;
        const moonSn = natalPlanets && natalPlanets.Moon ? natalPlanets.Moon.sn : 0;

        const cfgs = [];
        if (natalPlanets && natalAsc) cfgs.push({ canvasId: 'gocharD1Canvas', label: 'D1 — Rashi (Natal)', color: '#FFD700', planets: natalPlanets, asc: natalAsc });
        if (d9Planets && d9Asc) cfgs.push({ canvasId: 'gocharD9Canvas', label: 'D9 — Navamsha (Natal)', color: '#9B6FFF', planets: d9Planets, asc: d9Asc });
        if (transitPlanets && transitAsc) cfgs.push({ canvasId: 'gocharTransitCanvas', label: 'Transit Chart (Today\'s Sky)', color: '#00DD77', planets: transitPlanets, asc: transitAsc });
        if (transitPlanets && natalAsc) cfgs.push({ canvasId: 'gocharRashiTulyaCanvas', label: 'Rashi Tulya (Transit over Natal Lagna)', color: '#66CCFF', planets: transitPlanets, asc: natalAsc });
        if (transitPlanets) cfgs.push({ canvasId: 'gocharChandraCanvas', label: 'Moon Transit (Chandra Lagna)', color: '#FF9F43', planets: transitPlanets, asc: { sn: moonSn } });
        return cfgs;
    },

    // ===================== 9. HTML RENDERING =====================

    _natureColor: function (nature) {
        if (nature === 'benefic' || nature === 'favorable' || nature === 'good' || nature === 'very favourable' || nature === 'favourable') return '#00DD77';
        if (nature === 'malefic' || nature === 'challenging' || nature === 'bad') return '#FF4477';
        if (nature === 'mixed' || nature === 'neutral') return '#FFD700';
        return '#8899AA';
    },

    _renderChip: function (text, color) {
        return `<span style="display:inline-block;margin:2px 4px 0 0;padding:2px 6px;border-radius:4px;background:${color}22;color:${color};font-size:9px;font-weight:bold;">${text}</span>`;
    },

    _renderChartPanels: function (chartConfigs) {
        if (!chartConfigs || !chartConfigs.length) return '';
        const cells = chartConfigs.map(c => `
            <div style="text-align:center;">
              <div style="font-size:11px;color:${c.color};margin-bottom:4px;font-weight:bold;">${c.label}</div>
              <canvas id="${c.canvasId}" width="200" height="200" style="background:var(--panel2,#1a1a2e);border-radius:3px;"></canvas>
            </div>`).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FFD700;font-size:11px;font-weight:bold;">📊 Charts — D1 · D9 · Transit · Rashi Tulya · Moon Transit</summary>
                  <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:10px;">${cells}</div>
                </details>`;
    },

    _renderActiveHousesTable: function (title, activeHouses, HSIG) {
        if (!activeHouses || !activeHouses.length) return '';
        const sorted = activeHouses.slice().sort((a, b) => b.touchCount - a.touchCount);
        const rows = sorted.filter(h => h.touchCount > 0).map(h => {
            const sig = HSIG && HSIG[h.house];
            const groupColor = (h.group === 'trikona' || h.group === 'kendra-trikona') ? '#00DD77'
                : h.group === 'kendra' ? '#66CCFF' : h.group === 'trik' ? '#FF4477' : '#FFD700';
            return `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid ${groupColor};background:${groupColor}0A;">
                <b>H${h.house}</b> <span style="font-size:8.5px;color:var(--muted);">(${h.group})</span>
                ${h.occupants.length ? this._renderChip('Occupied: ' + h.occupants.join(', '), '#FFD700') : ''}
                ${h.aspectedBy.length ? this._renderChip('Aspected: ' + h.aspectedBy.join(', '), '#66CCFF') : ''}
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">${sig ? sig.name + ': ' + sig.keywords : ''}</div>
              </div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">${title}</summary>
                  <div style="margin-top:6px;">${rows}</div>
                </details>`;
    },

    _renderDwigraha: function (dwigraha, HSIG) {
        if (!dwigraha || !dwigraha.jupiter || !dwigraha.saturn) return '';
        const planetBlock = (p, color) => `
            <div style="margin-top:4px;padding:6px 8px;border:1px solid ${color}44;border-radius:5px;background:${color}0A;">
              <div style="font-weight:bold;color:${color};font-size:10.5px;">${p.planet} — transiting H${p.transitHouse}</div>
              <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">
                Aspects H${p.aspectedHouses.join(', H')} · Owns H${p.ownedHouses.join(', H') || '—'} · Karakatva H${p.karakaHouse}${p.relatedHouses.length ? ' · Related (via conjunct/aspected planets) H' + p.relatedHouses.join(', H') : ''}
              </div>
              <div style="margin-top:3px;">Significators: ${p.significators.map(h => this._renderChip('H' + h, color)).join('')}</div>
            </div>`;
        const commonRows = dwigraha.commonHouses.map(h => {
            const sig = HSIG && HSIG[h];
            return `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #FFD700;background:rgba(255,215,0,.08);">
                <b>H${h}</b> ${sig ? '— ' + sig.name + ': ' + sig.keywords : ''}
              </div>`;
        }).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FFD700;font-size:10.5px;font-weight:bold;">🪐 द्विग्रह गोचर (Dwigraha Gochar) — Jupiter + Saturn Double-Transit Active Bhavas</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Houses common to BOTH Jupiter's and Saturn's significator tables are the classically most "active" bhavas for this period.</div>
                  ${planetBlock(dwigraha.jupiter, '#DAA520')}
                  ${planetBlock(dwigraha.saturn, '#4682B4')}
                  <div style="margin-top:8px;font-size:9.5px;color:var(--muted);font-weight:bold;">COMMON (ACTIVE) HOUSES:</div>
                  ${commonRows || '<div style="font-size:9px;color:var(--muted);">No common significator house found.</div>'}
                </details>`;
    },

    _renderBeneficMaleficNow: function (beneficMaleficNow) {
        if (!beneficMaleficNow || !beneficMaleficNow.length) return '';
        const rows = beneficMaleficNow.map(v => {
            const c = this._natureColor(v.verdict);
            return `<div style="margin:3px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b style="color:${c};">${v.planet}</b> <span style="font-size:9px;color:var(--muted);">transiting ${v.sign || '?'} (H${v.house}, ${v.group})</span>
                — <b style="color:${c};">${v.verdict.toUpperCase()}</b>
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">
                  Naisargik: ${v.naisargik}${v.functionalReason ? ' · Functional: ' + v.functional + ' (' + v.functionalReason + ')' : ' · Functional: ' + v.functional}
                  · Dignity: ${v.dignity}
                </div>
              </div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">☯ Benefic / Malefic Effect of Each Transiting Planet Right Now</summary>
                  <div style="margin-top:6px;">${rows}</div>
                </details>`;
    },

    _renderDashaTransitEffect: function (dashaTransitEffect) {
        if (!dashaTransitEffect || !dashaTransitEffect.length) return '';
        const rows = dashaTransitEffect.map(lv => {
            if (!lv.lord) return `<div style="margin:3px 0;font-size:9px;color:var(--muted);">${lv.level}: not available.</div>`;
            const v = lv.verdict;
            const c = v ? this._natureColor(v.verdict) : '#8899AA';
            return `<div style="margin-top:6px;padding:6px 8px;border:1px solid ${c}44;border-radius:5px;background:${c}0A;">
                <div style="font-weight:bold;color:${c};font-size:10.5px;">${lv.level}: ${lv.lord}${v ? ' — ' + v.verdict.toUpperCase() : ''}</div>
                ${v ? `<div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">Transiting ${v.sign} (H${v.house}, ${v.group}) · Naisargik: ${v.naisargik} · Functional: ${v.functional} · Dignity: ${v.dignity}</div>` : ''}
                <div style="font-size:8.5px;color:var(--muted);font-style:italic;margin-top:3px;">${lv.weight}</div>
              </div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🌙 Current Dasha × Transit Effect (Mahadasha → Sookshma)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Classical rule: a dasha only delivers its promised result if its lord is ALSO transiting well right now.</div>
                  ${rows}
                </details>`;
    },

    _renderSudarshanChakra: function (sudarshanChakra, scd, HSIG) {
        if (!sudarshanChakra) return '';
        const cells = sudarshanChakra.tally.map(t => {
            const c = t.strength === 3 ? '#00DD77' : t.strength === 2 ? '#FFD700' : t.strength === 1 ? '#66CCFF' : 'var(--muted)';
            const sig = HSIG && HSIG[t.house];
            return `<div style="padding:5px 6px;border:1px solid ${c}44;border-radius:4px;background:${c}0A;min-width:120px;">
                <div style="font-weight:bold;color:${c};font-size:10px;">H${t.house} <span style="font-size:8.5px;">(${t.strength}/3)</span></div>
                <div style="font-size:8px;color:var(--muted);">${t.refsActive.join(', ') || '—'}</div>
                <div style="font-size:8px;color:var(--text);opacity:.8;margin-top:2px;">${sig ? sig.name : ''}</div>
              </div>`;
        }).join('');
        let scdBlock = '';
        if (scd && scd.active) {
            scdBlock = `<div style="margin-top:8px;padding:6px 8px;border-left:3px solid #FF69B4;background:rgba(255,105,180,.08);">
                <b style="color:#FF69B4;">Sudarshan Chakra Dasha (SCD) — current MD house: H${scd.active.mdHouse}</b>
                <div style="font-size:9px;color:var(--text);margin-top:2px;">Transiting planets currently in this SCD house: ${scd.transitingPlanetsInMDHouse.length ? scd.transitingPlanetsInMDHouse.join(', ') : 'none'}</div>
              </div>`;
        }
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🔯 Sudarshan Chakra — Tri-Lagna (Lagna + Chandra + Surya) Transit Overlay</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Each house is scored 0-3 by how many of the three reference lagnas currently see it occupied/aspected by a transiting planet.</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">${cells}</div>
                  ${scdBlock}
                </details>`;
    },

    _renderPanchaFactor: function (panchaFactor) {
        if (!panchaFactor || !panchaFactor.total) return '';
        const overallColor = this._natureColor(panchaFactor.overall);
        const rows = panchaFactor.factors.map(f => {
            const c = this._natureColor(f.verdict);
            return `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b style="color:${c};">${f.planet}</b> <span style="font-size:8.5px;color:var(--muted);">(${f.roles.join(', ')})</span> — <b>${f.verdict.toUpperCase()}</b>
                <div style="font-size:8.5px;color:var(--text);opacity:.8;">Transiting ${f.sign} (H${f.house}) · ${f.dignity}</div>
              </div>`;
        }).join('');
        return `<div class="pred-item" style="border-left:3px solid ${overallColor};margin-top:10px;">
                   <div class="pred-title" style="color:${overallColor};">⚖️ Overall Time-Quality (5-Factor Classical Check)</div>
                   <div style="font-size:11px;font-weight:bold;color:${overallColor};margin:4px 0;">${panchaFactor.overall.toUpperCase()} — ${panchaFactor.favorableCount}/${panchaFactor.total} factors favourable, ${panchaFactor.challengingCount}/${panchaFactor.total} challenging</div>
                   ${rows}
                 </div>`;
    },

    /**
     * Renders the full Gochar panel. `chartConfigs` (from getChartConfigs())
     * is optional — pass it to get canvas placeholders; the caller must
     * still call window.drawDChart(...) for each config AFTER this HTML
     * is inserted into the DOM.
     */
    // ===================== 9. SAWHNEY MOON-TRANSIT RESULT TABLES + VEDHA (Ch.4) =====================
    //
    // From S.K. Sawhney, "Timing of Events Through Dasha & Transit" (Ch.4,
    // "Importance of Transit of Planets"): classical house-from-Moon
    // result bands for each planet's gochar, independent of the
    // Dwigraha/Pancha-Factor techniques above — the OLDEST and most
    // widely-taught transit rule ("गोचर सदा चन्द्रात्" — gochar is always
    // read from the natal Moon). Each planet has a `bad` house set and a
    // `good` house set as literally given in the source; six of the nine
    // planets additionally have a `maxBad` house — a worse sub-case
    // explicitly called out in the source text (Sun and Saturn's entries
    // do not name a separate worst house, so none is invented here).
    SAWHNEY_MOON_TRANSIT: {
        Sun: { bad: [1, 2, 5, 8, 9, 12], good: [3, 6, 10, 11],
            badText: 'No efforts of the native succeed; possible eye trouble, excess expenditure, many diseases, defeat in lawsuits.',
            goodText: 'Very auspicious — good health, income, gain, promotion, new job.' },
        Moon: { bad: [2, 4, 5, 9, 12], maxBad: [8], good: [1, 3, 6, 7, 10, 11],
            badText: 'Sorrows, miseries, loss of reputation, unwanted expenditure, obstruction in efforts.',
            maxBadText: 'Maximum malefic — mental agony, trouble to mother.',
            goodText: 'Increase in facilities, income, comforts.' },
        Mars: { bad: [1, 2, 4, 5, 8, 9, 10, 12], maxBad: [7], good: [3, 6, 11],
            badText: 'Sorrows, miseries, diseases.',
            maxBadText: 'Maximum malefic — quarrel, litigation, loss, diseases.',
            goodText: 'Happiness, comforts, gain.' },
        Mercury: { bad: [1, 3, 4, 5, 7, 9, 12], maxBad: [2], good: [6, 8, 10, 11],
            badText: 'Difficulties, heavy expenditure, diseases of skin/nerves.',
            maxBadText: 'Maximum bad — obstruction in all spheres, loss of wealth.',
            goodText: 'Good health, overall happiness, education, income.' },
        Jupiter: { bad: [1, 4, 10], maxBad: [3, 6], good: [2, 5, 7, 9, 11],
            badText: 'Fear, worries, loss of status, bad health, heavy expenditure.',
            maxBadText: 'Maximum bad — loss of respect, humiliation, enmity.',
            goodText: 'Good health, comforts, progress in business, travels, gain of jewelry.' },
        Venus: { bad: [7, 10], maxBad: [6], good: [1, 2, 3, 4, 5, 9, 11, 12],
            badText: 'Sorrows, heavy expenditure, loss of comforts, lack of intimacy, bad health of spouse.',
            maxBadText: 'Maximum malefic — health issues in relationship, loans, humiliation from women.',
            goodText: 'Easy life, good health, intimacy, increase in income, benefits from females, gain in business.' },
        Saturn: { bad: [1, 2, 4, 5, 7, 8, 10, 12], good: [3, 6, 9, 11],
            badText: 'Malefic results in different ways, excess expenditure, loans.',
            goodText: 'Gains, comforts, gain of money, promotion, success in efforts.' },
        Rahu: { bad: [1, 2, 4, 5, 7, 8, 10, 12], maxBad: [9], good: [3, 6, 11],
            badText: 'Miseries, sorrow, agony, downfall, over-expenditure.',
            maxBadText: 'Maximum malefic — misfortunes, diseases.',
            goodText: 'Good health, success in efforts, gains, comforts, progress in profession, all-round prosperity.' },
        Ketu: { bad: [1, 2, 4, 5, 7, 8, 10, 12], maxBad: [9], good: [3, 6, 11],
            badText: 'Miseries, sorrow, agony, downfall, over-expenditure.',
            maxBadText: 'Maximum malefic — misfortunes, diseases.',
            goodText: 'Good health, success in efforts, gains, comforts, progress in profession, all-round prosperity.' }
    },

    // Vedha (cancellation): if a specific OTHER planet is ALSO transiting
    // its own paired house at the same time, the main table's result
    // above is cancelled/nullified. NOTE: the source table (pp.11-12) is
    // reconstructed here from a scanned/OCR'd source and several digit
    // groupings were ambiguous in the original; treat this as a
    // best-effort/advisory cross-check rather than a fully verified
    // classical table, and confirm against a physical copy before relying
    // on it for exact predictions. Structure: for planet P transiting
    // house H, Vedha is cancelled if `vedhaBy` planet is transiting one
    // of `houses` (counted from the same reference, Lagna or Moon).
    SAWHNEY_VEDHA: {
        Sun: { vedhaBy: 'Moon', houses: [9, 1, 2, 4, 5] },
        Moon: { vedhaBy: 'Mercury', houses: [2, 5, 12, 8, 4, 9] },
        Mars: { vedhaBy: null, houses: [1, 2, 5, 9] },
        Mercury: { vedhaBy: 'Moon', houses: [1, 2, 8, 10, 4, 3, 12] },
        Jupiter: { vedhaBy: null, houses: [5, 3, 9, 1, 8] },
        Venus: { vedhaBy: 'Sun', houses: [8, 7, 1, 10, 9, 5, 11, 6, 3] },
        Saturn: { vedhaBy: 'Sun', houses: [1, 2, 9, 5] },
        Rahu: { vedhaBy: null, houses: [1, 2, 9, 5] },
        Ketu: { vedhaBy: null, houses: [1, 2, 9, 5] }
    },

    /**
     * One planet's classical Moon-transit verdict: which band (good /
     * bad / maxBad) its current transit house-from-Moon falls into, plus
     * a best-effort Vedha (cancellation) check against SAWHNEY_VEDHA.
     */
    getSawhneyMoonTransitVerdict: function (planet, transitPlanetsMap, natalMoonSignNum) {
        const table = this.SAWHNEY_MOON_TRANSIT[planet];
        const tp = transitPlanetsMap && transitPlanetsMap[planet];
        if (!table || !tp || tp.sn === undefined || natalMoonSignNum === undefined || natalMoonSignNum === null) return null;
        const house = this._transitHouseFrom(natalMoonSignNum, tp.sn);

        let band = 'unstated', text = '';
        if ((table.maxBad || []).includes(house)) { band = 'maxBad'; text = table.maxBadText; }
        else if (table.bad.includes(house)) { band = 'bad'; text = table.badText; }
        else if (table.good.includes(house)) { band = 'good'; text = table.goodText; }

        // Vedha cross-check: is the paired cancelling planet ALSO transiting
        // one of its Vedha houses (from Moon) right now?
        let vedhaCancelled = false, vedhaBy = null, vedhaHouse = null;
        const vd = this.SAWHNEY_VEDHA[planet];
        if (vd && vd.vedhaBy && transitPlanetsMap[vd.vedhaBy] && transitPlanetsMap[vd.vedhaBy].sn !== undefined) {
            const vTp = transitPlanetsMap[vd.vedhaBy];
            const vHouse = this._transitHouseFrom(natalMoonSignNum, vTp.sn);
            if (vd.houses.includes(vHouse)) { vedhaCancelled = true; vedhaBy = vd.vedhaBy; vedhaHouse = vHouse; }
        }

        return { planet: planet, houseFromMoon: house, band: band, text: text, vedhaCancelled: vedhaCancelled, vedhaBy: vedhaBy, vedhaHouse: vedhaHouse };
    },

    /** All nine planets' Sawhney Moon-transit verdicts in one call. */
    getAllSawhneyMoonTransitVerdicts: function (transitPlanetsMap, natalMoonSignNum) {
        return this.PLANETS9
            .map(p => this.getSawhneyMoonTransitVerdict(p, transitPlanetsMap, natalMoonSignNum))
            .filter(Boolean);
    },

    _renderSawhneyMoonTransit: function (verdicts) {
        if (!verdicts || !verdicts.length) return '';
        const bandColor = { good: '#00DD77', bad: '#FF9F43', maxBad: '#FF4477', unstated: '#8899AA' };
        const rows = verdicts.map(v => {
            const c = bandColor[v.band] || '#8899AA';
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b style="color:${c};">${v.planet}</b> — H${v.houseFromMoon} from Moon
                <span style="font-size:8.5px;color:${c};text-transform:uppercase;margin-left:6px;">${v.band === 'maxBad' ? 'maximum malefic' : v.band === 'unstated' ? 'not covered by source table' : v.band}</span>
                ${v.text ? `<div style="font-size:9px;color:var(--text);opacity:.9;margin-top:2px;">${v.text}</div>` : ''}
                ${v.vedhaCancelled ? `<div style="font-size:8.5px;color:#FFD700;margin-top:2px;">⚡ Vedha: ${v.vedhaBy} is transiting H${v.vedhaHouse} from Moon — this result is classically CANCELLED. <i>(Vedha table best-effort reconstruction — verify.)</i></div>` : ''}
              </div>`;
        }).join('');
        return `<details style="margin-top:8px;">
                  <summary style="cursor:pointer;color:#00DD77;font-size:10.5px;font-weight:bold;">🌙 Classical Moon-Transit Results (S.K. Sawhney, Ch.4)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">"गोचर सदा चन्द्रात्" — every planet's transit is read from the natal Moon. Vedha (cancellation) is shown where the paired cancelling planet is also transiting its own trigger house.</div>
                  ${rows}
                </details>`;
    },
     
    renderHTML: function (analysis, chartConfigs) {
        if (!analysis) return '<div class="pred-item">No transit data available.</div>';
        const HSIG = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.HOUSE_SIGNIFICATIONS) || {};

        let html = `<div class="pred-item" style="border-left:3px solid #00DD77;">
                       <div class="pred-title" style="color:#00DD77;">🪐 Gochar (Live Transit) Analysis</div>
                       <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Active bhavas, benefic/malefic transit effect, dasha × transit synthesis, and Sudarshan Chakra — as of ${analysis.date ? new Date(analysis.date).toDateString() : 'today'}.</div>`;

        html += this._renderChartPanels(chartConfigs);
        html += this._renderDwigraha(analysis.dwigraha, HSIG);
        html += this._renderActiveHousesTable('🏠 Active Bhavas — from Natal Lagna', analysis.activeHousesLagna, HSIG);
        html += this._renderActiveHousesTable('🌙 Active Bhavas — from Natal Moon (Rashi Tulya / Chandra Lagna)', analysis.activeHousesMoon, HSIG);
        html += this._renderBeneficMaleficNow(analysis.beneficMaleficNow);
        html += this._renderDashaTransitEffect(analysis.dashaTransitEffect);
        html += this._renderSudarshanChakra(analysis.sudarshanChakra, analysis.scd, HSIG);
        html += this._renderSawhneyMoonTransit(analysis.sawhneyMoonTransit);
        html += `</div>`;
        html += this._renderPanchaFactor(analysis.panchaFactor);

        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.GOCHAR;
}
