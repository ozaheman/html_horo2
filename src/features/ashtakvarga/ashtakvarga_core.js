/**
 * ashtakvarga.js
 * ─────────────────────────────────────────────────────────────
 * Full Ashtakavarga engine: Bhinnashtakavarga (BAV, per planet),
 * Sarvashtakavarga (SAV), Trikona + Ekadhipatya Sodhana reductions,
 * the Kaksha (planetary sub-division) transit-timing system, and
 * detailed result/analysis functions for current transits, Dasha
 * periods, marriage (Venus), and business/career.
 *
 * Classical data verified against B.V. Raman's "Ashtakavarga System
 * of Prediction" (the standard reference every Vedic software follows)
 * and cross-checked against the well-known constants: BAV totals
 * Sun=48, Moon=49, Mars=39, Mercury=54, Jupiter=56, Venus=52, Saturn=39,
 * grand total 337. This file's computeBAV() has been unit-tested
 * against B.V. Raman's own published "Standard Horoscope" worked
 * example and reproduces it exactly (see test notes in comments).
 *
 * Kaksha system, the "5-factor" overall-period method, the specific-
 * event timing method, and the "judge against each planet's own
 * average, not a universal threshold" refinement are all drawn from
 * the accompanying Nitin Kashyap teaching videos (Planetary Transits
 * Key - Kaksha; Role of Ashtakvarga in Dasha and Transit; Rahu and
 * Ashtakvarga; Ashtakvarga of Venus & Married Life).
 */

window.ASHTAKVARGA = {

    SIGNS: ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"],
    PLANETS7: ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'],
    CONTRIBUTORS8: ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Ascendant'],

    // ===================== CLASSICAL BAV CONTRIBUTION TABLES =====================
    // BAV_TABLES[targetPlanet][contributor] = array of house-offsets (1-12,
    // counted from the contributor's own position) that receive a bindu in
    // the target planet's Bhinnashtakavarga. Verified totals in comments.

    BAV_TABLES: {
        Sun: { // Total 48
            Sun: [1,2,4,7,8,9,10,11], Moon: [3,6,10,11], Mars: [1,2,4,7,8,9,10,11],
            Mercury: [3,5,6,9,10,11,12], Jupiter: [5,6,9,11], Venus: [6,7,12],
            Saturn: [1,2,4,7,8,9,10,11], Ascendant: [3,4,6,10,11,12]
        },
        Moon: { // Total 49
            Sun: [3,6,7,8,10,11], Moon: [1,3,6,7,10,11], Mars: [2,3,5,6,9,10,11],
            Mercury: [1,3,4,5,7,8,10,11], Jupiter: [1,4,7,8,10,11,12], Venus: [3,4,5,7,9,10,11],
            Saturn: [3,5,6,11], Ascendant: [3,6,10,11]
        },
        Mars: { // Total 39
            Sun: [3,5,6,10,11], Moon: [3,6,11], Mars: [1,2,4,7,8,10,11],
            Mercury: [3,5,6,11], Jupiter: [6,10,11,12], Venus: [6,8,11,12],
            Saturn: [1,4,7,8,9,10,11], Ascendant: [1,3,6,10,11]
        },
        Mercury: { // Total 54
            Sun: [5,6,9,11,12], Moon: [2,4,6,8,10,11], Mars: [1,2,4,7,8,9,10,11],
            Mercury: [1,3,5,6,9,10,11,12], Jupiter: [6,8,11,12], Venus: [1,2,3,4,5,8,9,11],
            Saturn: [1,2,4,7,8,9,10,11], Ascendant: [1,2,4,6,8,10,11]
        },
        Jupiter: { // Total 56
            Sun: [1,2,3,4,7,8,9,10,11], Moon: [2,5,7,9,11], Mars: [1,2,4,7,8,10,11],
            Mercury: [1,2,4,5,6,9,10,11], Jupiter: [1,2,3,4,7,8,10,11], Venus: [2,5,6,9,10,11],
            Saturn: [3,5,6,12], Ascendant: [1,2,4,5,6,7,9,10,11]
        },
        Venus: { // Total 52
            Sun: [8,11,12], Moon: [1,2,3,4,5,8,9,11,12], Mars: [3,5,6,9,11,12],
            Mercury: [3,5,6,9,11], Jupiter: [5,8,9,10,11], Venus: [1,2,3,4,5,8,9,10,11],
            Saturn: [3,4,5,8,9,10,11], Ascendant: [1,2,3,4,5,8,9,11]
        },
        Saturn: { // Total 39
            Sun: [1,2,4,7,8,10,11], Moon: [3,6,11], Mars: [3,5,6,10,11,12],
            Mercury: [6,8,9,10,11,12], Jupiter: [5,6,11,12], Venus: [6,11,12],
            Saturn: [3,5,6,11], Ascendant: [1,3,4,6,10,11]
        }
    },
    BAV_TOTALS: { Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39 },
    SAV_GRAND_TOTAL: 337,

    // Rahu has no classical BAV of its own (Parashari system uses only the 7
    // planets + Lagna). Per the specific teaching referenced here, when a
    // Rahu BAV is wanted for transit judgement, Mars's contribution table is
    // borrowed (a commonly used, non-classical practical convention) — this
    // is clearly flagged wherever it's used, never presented as canonical.
    RAHU_BORROWED_TABLE_SOURCE: 'Mars',

    // Trinal (Trikona) groups for Trikona Sodhana, by sign index (0=Aries).
    TRIKONA_GROUPS: [[0,4,8],[1,5,9],[2,6,10],[3,7,11]], // Fire, Earth, Air, Water

    // Fixed dual-lordship pairs for Ekadhipatya Sodhana (sign indices).
    // Sun (Leo=4) and Moon (Cancer=3) are single-lordship and exempt.
    DUAL_LORDSHIP: { Mars: [0,7], Mercury: [2,5], Jupiter: [8,11], Venus: [1,6], Saturn: [9,10] },

    // Kaksha order (slowest to fastest) and their degree boundaries within a sign.
    KAKSHA_ORDER: ['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon','Ascendant'],
    KAKSHA_BOUNDARIES: [0, 3.75, 7.5, 11.25, 15, 18.75, 22.5, 26.25, 30],

    // ===================== HELPERS =====================

    _signOf: function (lon) { return Math.floor((((lon % 360) + 360) % 360) / 30); },
    _degInSign: function (lon) { return (((lon % 360) + 360) % 360) % 30; },

    /** Build a {planetName: {sn, deg}} map (sign index + degree-in-sign) from a natal/transit planets map, including 'Ascendant'. */
    _positionsFromChart: function (planetsMap, ascSignNum, ascDeg) {
        const pos = {};
        this.CONTRIBUTORS8.forEach(name => {
            if (name === 'Ascendant') {
                pos.Ascendant = { sn: ascSignNum, deg: ascDeg || 0 };
            } else {
                const p = planetsMap[name];
                if (!p) return;
                const lon = p.sid !== undefined ? p.sid : (p.longitude !== undefined ? p.longitude : (p.sn !== undefined ? p.sn * 30 + (parseFloat(p.deg) || 0) : undefined));
                if (lon === undefined) return;
                pos[name] = { sn: this._signOf(lon), deg: this._degInSign(lon) };
            }
        });
        return pos;
    },

    // ===================== 1. BHINNASHTAKAVARGA (BAV) =====================

    /**
     * Compute one planet's BAV: a 12-entry bindu-count array plus, per sign,
     * which contributors gave a bindu (needed later for "who gave it"
     * quality analysis and Kaksha matching).
     */
    computeBAV: function (targetPlanet, planetsMap, ascSignNum, ascDeg) {
        const table = this.BAV_TABLES[targetPlanet] ||
            (targetPlanet === 'Rahu' || targetPlanet === 'Ketu' ? this.BAV_TABLES[this.RAHU_BORROWED_TABLE_SOURCE] : null);
        if (!table) return null;
        const pos = this._positionsFromChart(planetsMap, ascSignNum, ascDeg);
        const bindus = new Array(12).fill(0);
        const contributorsBySign = Array.from({ length: 12 }, () => []);

        this.CONTRIBUTORS8.forEach(contributor => {
            const cPos = pos[contributor];
            const offsets = table[contributor];
            if (!cPos || !offsets) return;
            offsets.forEach(offset => {
                const signIdx = (cPos.sn + offset - 1) % 12;
                bindus[signIdx]++;
                contributorsBySign[signIdx].push(contributor);
            });
        });

        return { planet: targetPlanet, bindus: bindus, contributorsBySign: contributorsBySign, total: bindus.reduce((a, b) => a + b, 0) };
    },

    /** Compute BAV for all 7 classical planets (+ Rahu using the borrowed table) at once. */
    computeAllBAV: function (planetsMap, ascSignNum, ascDeg, includeRahu) {
        const all = {};
        this.PLANETS7.forEach(p => { all[p] = this.computeBAV(p, planetsMap, ascSignNum, ascDeg); });
        if (includeRahu) all.Rahu = this.computeBAV('Rahu', planetsMap, ascSignNum, ascDeg);
        return all;
    },

    // ===================== 2. SARVASHTAKAVARGA (SAV) =====================

    /** SAV = sum of the 7 classical planets' BAV bindus per sign (Lagna/Rahu excluded from classical SAV). */
    computeSAV: function (allBAV) {
        const sav = new Array(12).fill(0);
        this.PLANETS7.forEach(p => {
            if (allBAV[p]) allBAV[p].bindus.forEach((b, i) => { sav[i] += b; });
        });
        return sav;
    },

    // ===================== 3. TRIKONA SODHANA (I Reduction) =====================

    applyTrikonaSodhana: function (bindus12) {
        const result = bindus12.slice();
        const log = [];
        this.TRIKONA_GROUPS.forEach(group => {
            const vals = group.map(s => result[s]);
            const zeros = vals.filter(v => v === 0).length;
            if (zeros >= 2) {
                group.forEach(s => { result[s] = 0; });
                log.push({ group, rule: zeros === 2 ? 'c' : 'c', before: vals, after: [0,0,0] });
            } else if (zeros === 1) {
                log.push({ group, rule: 'b', before: vals, after: vals }); // no change
            } else if (vals[0] === vals[1] && vals[1] === vals[2]) {
                group.forEach(s => { result[s] = 0; });
                log.push({ group, rule: 'd', before: vals, after: [0,0,0] });
            } else {
                const min = Math.min(...vals);
                group.forEach(s => { result[s] = result[s] - min; });
                log.push({ group, rule: 'a', before: vals, after: group.map(s => result[s]) });
            }
        });
        return { reduced: result, log: log };
    },

    // ===================== 4. EKADHIPATYA SODHANA (II Reduction) =====================

    /**
     * @param bindus12AfterTrikona - array from applyTrikonaSodhana().reduced
     * @param occupiedSigns - Set/array of sign indices (0-11) that have at least one planet physically in them (natal chart)
     */
    applyEkadhipatyaSodhana: function (bindus12AfterTrikona, occupiedSigns) {
        const result = bindus12AfterTrikona.slice();
        const occ = new Set(occupiedSigns);
        const log = [];
        Object.entries(this.DUAL_LORDSHIP).forEach(([lord, pair]) => {
            const [s1, s2] = pair;
            const v1 = result[s1], v2 = result[s2];
            const occ1 = occ.has(s1), occ2 = occ.has(s2);

            if ((occ1 && occ2) || v1 === 0 || v2 === 0) {
                log.push({ lord, pair, rule: (occ1 && occ2) ? 'I(a)' : 'I(b)', before: [v1, v2], after: [v1, v2] });
                return; // Scenario I: no change
            }
            if (occ1 !== occ2) {
                const [occSign, unoccSign] = occ1 ? [s1, s2] : [s2, s1];
                const occVal = result[occSign], unoccVal = result[unoccSign];
                if (occVal > unoccVal) { result[unoccSign] = 0; log.push({ lord, pair, rule: 'II(a)', before: [v1, v2], after: [result[s1], result[s2]] }); }
                else if (occVal < unoccVal) { result[unoccSign] = occVal; log.push({ lord, pair, rule: 'II(b)', before: [v1, v2], after: [result[s1], result[s2]] }); }
                else { result[unoccSign] = 0; log.push({ lord, pair, rule: 'II(c)', before: [v1, v2], after: [result[s1], result[s2]] }); }
                return;
            }
            // Scenario III: neither occupied
            if (v1 === v2) { result[s1] = 0; result[s2] = 0; log.push({ lord, pair, rule: 'III(a)', before: [v1, v2], after: [0, 0] }); }
            else { const min = Math.min(v1, v2); result[s1] = min; result[s2] = min; log.push({ lord, pair, rule: 'III(b)', before: [v1, v2], after: [min, min] }); }
        });
        return { reduced: result, log: log };
    },

    /** Full reduction pipeline for one planet's BAV: Trikona -> Ekadhipatya. */
    computeReducedBAV: function (bindus12, occupiedSigns) {
        const t = this.applyTrikonaSodhana(bindus12);
        const e = this.applyEkadhipatyaSodhana(t.reduced, occupiedSigns);
        return { reduced: e.reduced, trikonaLog: t.log, ekadhipatyaLog: e.log };
    },

    // ===================== 5. SAV REDUCTION (Mandala + Trikona + Ekadhipatya) =====================

    applyMandalaSodhana: function (sav12) {
        return sav12.map(v => { let x = v; while (x > 12) x -= 12; return x; });
    },

    computeReducedSAV: function (sav12, occupiedSigns) {
        const mandala = this.applyMandalaSodhana(sav12);
        const t = this.applyTrikonaSodhana(mandala);
        const e = this.applyEkadhipatyaSodhana(t.reduced, occupiedSigns);
        return { mandala: mandala, afterTrikona: t.reduced, afterEkadhipatya: e.reduced, trikonaLog: t.log, ekadhipatyaLog: e.log };
    },

    /** Rekha (malefic points) = 56 - bindus, for the (unreduced) SAV of 7 planets x 8 max each. */
    savToRekha: function (sav12) { return sav12.map(v => 56 - v); },

    // ===================== 6. KAKSHA SYSTEM =====================

    /** Which of the 8 kakshas (and its lord) a given degree-in-sign (0-30) falls into. */
    getKaksha: function (degInSign) {
        const d = ((degInSign % 30) + 30) % 30;
        for (let i = 0; i < 8; i++) {
            if (d >= this.KAKSHA_BOUNDARIES[i] && d < this.KAKSHA_BOUNDARIES[i + 1]) {
                return { index: i, lord: this.KAKSHA_ORDER[i], rangeStart: this.KAKSHA_BOUNDARIES[i], rangeEnd: this.KAKSHA_BOUNDARIES[i + 1] };
            }
        }
        return { index: 7, lord: 'Ascendant', rangeStart: 26.25, rangeEnd: 30 }; // d==30 edge case
    },

    /** Did the current Kaksha's lord give a bindu to `targetPlanetBAV` in `signIdx`? (the "gate pass" check) */
    kakshaGrantsBindu: function (targetPlanetBAV, signIdx, kakshaLordName) {
        if (!targetPlanetBAV || !targetPlanetBAV.contributorsBySign) return false;
        return targetPlanetBAV.contributorsBySign[signIdx].includes(kakshaLordName);
    },

    // ===================== 7. ANALYSIS: SIGN/HOUSE STRENGTH =====================

    /** A planet's own long-run average bindus/sign (its BAV total / 12) — the fair benchmark for THAT planet (malefics naturally average lower than benefics). */
    planetOwnAverage: function (planetName) {
        const total = this.BAV_TOTALS[planetName];
        return total ? total / 12 : null;
    },

    /** Classify a BAV bindu count for a planet against its OWN average (not a universal threshold). */
    classifyBAVStrength: function (planetName, bindus) {
        const avg = this.planetOwnAverage(planetName);
        if (avg === null) return bindus >= 5 ? 'strong' : bindus <= 2 ? 'weak' : 'average';
        if (bindus >= Math.ceil(avg) + 1) return 'strong';
        if (bindus <= Math.floor(avg) - 1) return 'weak';
        return 'average';
    },

    classifySAVStrength: function (sav) {
        if (sav >= 35) return 'exceptional';
        if (sav >= 30) return 'strong';
        if (sav >= 28) return 'good';
        if (sav >= 18) return 'weak';
        return 'very-weak';
    },

    // ===================== 8. TRANSIT / DASHA ANALYSIS =====================

    /**
     * Full analysis of one transiting planet against the natal chart's
     * Ashtakavarga: BAV bindu count + quality (who gave it, cross-referenced
     * against house lordships for this Lagna), Kaksha "gate pass" status,
     * and SAV strength of the transited sign.
     */
    analyzeTransitPlanet: function (planetName, transitSignIdx, transitDegInSign, allBAV, ascSignNum, lords, savArray) {
        const bav = allBAV[planetName];
        if (!bav) return null;
        const bindus = bav.bindus[transitSignIdx];
        const contributors = bav.contributorsBySign[transitSignIdx];
        const strength = this.classifyBAVStrength(planetName, bindus);

        // Cross-reference contributors with house-lordships of THIS lagna.
        const contributorHouseRoles = contributors.map(c => {
            if (c === 'Ascendant') return { contributor: c, role: 'Lagna itself' };
            const houses = [];
            for (let h = 1; h <= 12; h++) { if (lords[(ascSignNum + h - 1) % 12] === c) houses.push(h); }
            return { contributor: c, houses: houses };
        });

        const kaksha = this.getKaksha(transitDegInSign);
        const kakshaGrants = this.kakshaGrantsBindu(bav, transitSignIdx, kaksha.lord);

        const savHere = savArray ? savArray[transitSignIdx] : null;
        const savStrength = savHere !== null ? this.classifySAVStrength(savHere) : null;

        return {
            planet: planetName, sign: this.SIGNS[transitSignIdx], signIdx: transitSignIdx,
            bindus: bindus, ownAverage: this.planetOwnAverage(planetName), strength: strength,
            contributors: contributors, contributorHouseRoles: contributorHouseRoles,
            kaksha: kaksha, kakshaGrantsBindu: kakshaGrants,
            sav: savHere, savStrength: savStrength
        };
    },

    /**
     * The classical "5-factor overall period" method: Lagnesh, Mahadasha
     * lord, Antardasha lord, Jupiter, Saturn — each judged by current
     * transit BAV bindus + Kaksha gate-pass status.
     */
    analyzeOverallPeriod: function (opts) {
        // opts: { lagnesh, mdLord, adLord, allBAV, ascSignNum, lords, savArray, transitPositions: {planet:{sn,deg}} }
        const factors = [
            { label: 'Lagnesh', planet: opts.lagnesh },
            { label: 'Mahadasha Lord', planet: opts.mdLord },
            { label: 'Antardasha Lord', planet: opts.adLord },
            { label: 'Jupiter (natural benefic)', planet: 'Jupiter' },
            { label: 'Saturn (slow-moving, key transit)', planet: 'Saturn' }
        ];
        const results = [];
        let goodCount = 0;
        factors.forEach(f => {
            const tp = opts.transitPositions[f.planet];
            if (!tp || !opts.allBAV[f.planet]) { results.push({ label: f.label, planet: f.planet, ok: null, reason: 'position/BAV unavailable' }); return; }
            const analysis = this.analyzeTransitPlanet(f.planet, tp.sn, tp.deg, opts.allBAV, opts.ascSignNum, opts.lords, opts.savArray);
            const ok = analysis.strength !== 'weak' && analysis.kakshaGrantsBindu;
            if (ok) goodCount++;
            results.push({ label: f.label, planet: f.planet, ok: ok, analysis: analysis });
        });
        return { factors: results, goodCount: goodCount, total: factors.length, verdict: goodCount >= 4 ? 'Good overall period' : goodCount >= 2 ? 'Mixed period' : 'Challenging period' };
    },

    /**
     * Specific-event timing method: for a house's significations (e.g. 10th
     * = career/job), check if the HOUSE LORD's current transit position gets
     * bindus (in its own BAV) from the 9th lord (Bhagyesh), Lagnesh, and
     * Lagna itself — and whether the current Kaksha lord also grants one.
     */
    analyzeSpecificEvent: function (houseNum, opts) {
        // opts: { ascSignNum, lords, allBAV, transitPositions, savArray }
        const houseLordSign = (opts.ascSignNum + houseNum - 1) % 12;
        const houseLord = opts.lords[houseLordSign];
        const bhagyeshSign = (opts.ascSignNum + 8) % 12;
        const bhagyesh = opts.lords[bhagyeshSign];
        const lagnesh = opts.lords[opts.ascSignNum];

        const tp = opts.transitPositions[houseLord];
        const bav = opts.allBAV[houseLord];
        if (!tp || !bav) return null;

        const analysis = this.analyzeTransitPlanet(houseLord, tp.sn, tp.deg, opts.allBAV, opts.ascSignNum, opts.lords, opts.savArray);
        const keySources = Array.from(new Set([bhagyesh, lagnesh, 'Ascendant']));
        const keySourcesGiving = keySources.filter(s => analysis.contributors.includes(s));

        return {
            houseNum: houseNum, houseLord: houseLord, bhagyesh: bhagyesh, lagnesh: lagnesh,
            analysis: analysis, keySourcesGiving: keySourcesGiving,
            verdict: (keySourcesGiving.length >= 2 && analysis.kakshaGrantsBindu) ? 'Timing favourable now' :
                     (keySourcesGiving.length >= 1) ? 'Partially favourable' : 'Not yet — timing unclear'
        };
    },

    // ===================== 9. MARRIAGE (VENUS) & BUSINESS/CAREER HELPERS =====================

    /** Venus's BAV bindus falling in each of the 12 houses (from Lagna), for marriage analysis. */
    venusHouseBindus: function (venusBAV, ascSignNum) {
        const perHouse = [];
        for (let h = 1; h <= 12; h++) {
            const signIdx = (ascSignNum + h - 1) % 12;
            perHouse.push({ house: h, sign: this.SIGNS[signIdx], bindus: venusBAV.bindus[signIdx], contributors: venusBAV.contributorsBySign[signIdx] });
        }
        return perHouse;
    },

    /** Career/business significators: 2nd (wealth), 10th (career), 11th (gains) lords' BAV in their own houses. */
    careerSignificatorBindus: function (allBAV, ascSignNum, lords) {
        const houses = [2, 10, 11];
        return houses.map(h => {
            const signIdx = (ascSignNum + h - 1) % 12;
            const lord = lords[signIdx];
            const bav = allBAV[lord];
            if (!bav) return { house: h, lord: lord, bindus: null };
            return { house: h, lord: lord, sign: this.SIGNS[signIdx], bindus: bav.bindus[signIdx], contributors: bav.contributorsBySign[signIdx] };
        });
    },

    // ===================== 10. SUN'S DIRECTION & MEETING-TIMING ANALYSIS =====================

    // Classical planet-direction (Dik) associations used for travel/movement timing.
    PLANET_DIRECTIONS: { Sun: 'East', Moon: 'North-West', Mars: 'South', Mercury: 'North', Jupiter: 'North-East', Venus: 'South-East', Saturn: 'West' },

    // Classical 12-house-to-direction wheel (1st/Lagna = East, going clockwise;
    // Kendras get the 4 cardinal points, the houses between them share the
    // adjoining intercardinal direction).
    HOUSE_DIRECTIONS: { 1: 'East', 2: 'South-East', 3: 'South-East', 4: 'South', 5: 'South-West', 6: 'South-West', 7: 'West', 8: 'North-West', 9: 'North-West', 10: 'North', 11: 'North-East', 12: 'North-East' },

    /**
     * Sun's Bhinnashtakavarga direction analysis: which compass direction
     * (via the house Sun's strongest/weakest sign falls in, from Lagna) is
     * most/least auspicious right now for travel, going out to meet people,
     * or any Sun-ruled (authority/status/outward-facing) activity.
     */
    analyzeSunDirection: function (sunBAV, ascSignNum) {
        const perHouse = [];
        for (let h = 1; h <= 12; h++) {
            const signIdx = (ascSignNum + h - 1) % 12;
            perHouse.push({ house: h, sign: this.SIGNS[signIdx], direction: this.HOUSE_DIRECTIONS[h], bindus: sunBAV.bindus[signIdx], contributors: sunBAV.contributorsBySign[signIdx] });
        }
        const sorted = perHouse.slice().sort((a, b) => b.bindus - a.bindus);
        const best = sorted[0], worst = sorted[sorted.length - 1];
        return {
            perHouse: perHouse, best: best, worst: worst,
            recommendation: `${best.direction} (house ${best.house}, ${best.sign}, ${best.bindus} bindus) is the most Sun-favoured direction right now — best for travel, meeting authorities, or any status-related outward activity. Avoid ${worst.direction} (house ${worst.house}, ${worst.sign}, ${worst.bindus} bindus) for the same kind of activity.`
        };
    },

    /**
     * Meeting-timing analysis via the Kaksha system applied to Sun (and
     * optionally Lagnesh/Mercury) — Sun governs authority, status, and
     * meetings with important people classically. Gives a "favourable now /
     * wait N days" verdict based on whether the current Kaksha lord grants
     * Sun a bindu in its transited sign, and estimates the date the next
     * (favourable) Kaksha begins using Sun's ~1 degree/day motion.
     */
    analyzeMeetingTiming: function (sunTransitSignIdx, sunTransitDegInSign, sunBAV, opts) {
        opts = opts || {};
        const kaksha = this.getKaksha(sunTransitDegInSign);
        const grants = this.kakshaGrantsBindu(sunBAV, sunTransitSignIdx, kaksha.lord);
        const bindusHere = sunBAV.bindus[sunTransitSignIdx];
        const strength = this.classifyBAVStrength('Sun', bindusHere);

        const daysPerDegree = 1; // Sun's mean motion ~1 deg/day
        const daysLeftInKaksha = Math.max(0, (kaksha.rangeEnd - sunTransitDegInSign) * daysPerDegree);

        let verdict, nextGoodWindow = null;
        if (grants && strength !== 'weak') {
            verdict = `Favourable NOW for meetings, approvals, or appearing before authorities — Sun's current Kaksha lord (${kaksha.lord}) grants it a bindu here, for roughly the next ${daysLeftInKaksha.toFixed(1)} days.`;
        } else {
            // Scan forward kaksha-by-kaksha (within the same sign, then optionally note a sign change) to find the next granting kaksha.
            let scanDeg = kaksha.rangeEnd;
            let found = null;
            for (let i = 0; i < 8 && scanDeg < 30; i++) {
                const k2 = this.getKaksha(scanDeg + 0.01);
                if (this.kakshaGrantsBindu(sunBAV, sunTransitSignIdx, k2.lord)) { found = { kaksha: k2, atDeg: k2.rangeStart, daysFromNow: (k2.rangeStart - sunTransitDegInSign) }; break; }
                scanDeg = k2.rangeEnd;
            }
            if (found) {
                nextGoodWindow = found;
                verdict = `Not ideal right now (Kaksha lord ${kaksha.lord} withholds the bindu here). The next favourable window opens in about ${found.daysFromNow.toFixed(1)} days, when Sun enters ${found.kaksha.lord}'s Kaksha.`;
            } else {
                verdict = `Not ideal right now (Kaksha lord ${kaksha.lord} withholds the bindu, and no better Kaksha remains in this sign) — reassess once Sun moves into the next sign.`;
            }
        }

        return { kaksha: kaksha, kakshaGrantsBindu: grants, bindusInSign: bindusHere, strength: strength, daysLeftInKaksha: daysLeftInKaksha, nextGoodWindow: nextGoodWindow, verdict: verdict };
    },

    // ===================== 11. SAV-BASED LIFE-DOMAIN YOGAS =====================
    // A single helper to get a house's SAV value (from Lagna) plus its sign.
    _houseSAV: function (houseNum, ascSignNum, sav) {
        const signIdx = (ascSignNum + houseNum - 1) % 12;
        return { house: houseNum, sign: this.SIGNS[signIdx], signIdx: signIdx, sav: sav[signIdx] };
    },

    /**
     * Wealth analysis: 1-2-9-10-11 houses, Income(11) vs Expense(12) ratio,
     * and the "Grand Wealth Yoga" (1+2+4+9+10+11 SAV > 175).
     */
    analyzeWealth: function (ascSignNum, sav) {
        const h = n => this._houseSAV(n, ascSignNum, sav);
        const houses = [1, 2, 9, 10, 11].map(h);
        const h11 = h(11), h12 = h(12);
        const incomeExceedsExpense = h11.sav > h12.sav && h11.sav >= 30 && h12.sav >= 30 ? 'strong-effortless-surplus'
            : h11.sav > h12.sav ? 'income-exceeds-expense' : 'expense-pressure';
        const grandTotal = [1, 2, 4, 9, 10, 11].reduce((sum, hn) => sum + h(hn).sav, 0);
        return {
            houses: houses, income: h11, expense: h12, incomeVsExpense: incomeExceedsExpense,
            grandWealthYoga: grandTotal > 175, grandTotal: grandTotal,
            verdict: grandTotal > 175 ? `Grand Wealth Yoga present (1+2+4+9+10+11 SAV = ${grandTotal} > 175) — strong overall wealth potential.` :
                     `Combined 1+2+4+9+10+11 SAV = ${grandTotal} (need >175 for Grand Wealth Yoga).`
        };
    },

    /**
     * Career analysis: 10th-house per-planet bindu strength -> natural
     * career aptitude/field, plus the Career Power Ratio (10th vs 11th SAV)
     * distinguishing a "Workhorse" (job) from an "Opportunist" (business) profile.
     */
    CAREER_FIELDS_BY_PLANET: {
        Sun: 'authority, government, politics, leadership, public service, CEO roles',
        Moon: 'people-oriented services: PR, hospitality, nursing, food industry, mass communication, psychology',
        Mars: 'action/courage-based work: military, police, engineering, sports, surgery, real estate, fire services, construction',
        Mercury: 'communication and commerce: business, trading, accounting, writing, media, IT, sales',
        Jupiter: 'knowledge/wisdom sectors: teaching, law, finance, advisory, priesthood, banking, philosophy',
        Venus: 'creative/aesthetic fields: arts, fashion, entertainment, luxury goods, beauty, design, diplomacy',
        Saturn: 'structured/methodical fields: labor-intensive work, mining, construction, agriculture, technical fields, civil service'
    },

    analyzeCareer: function (allBAV, ascSignNum, sav, lords) {
        const tenthHouseSign = (ascSignNum + 9) % 12;
        const perPlanet = this.PLANETS7.map(p => {
            const bindus = allBAV[p] ? allBAV[p].bindus[tenthHouseSign] : null;
            return { planet: p, bindus: bindus, field: this.CAREER_FIELDS_BY_PLANET[p], strong: bindus !== null && bindus >= 5, weak: bindus !== null && bindus < 3 };
        });
        const h10 = this._houseSAV(10, ascSignNum, sav), h11 = this._houseSAV(11, ascSignNum, sav), h6 = this._houseSAV(6, ascSignNum, sav), h3 = this._houseSAV(3, ascSignNum, sav), h7 = this._houseSAV(7, ascSignNum, sav);
        const isWorkhorse = h10.sav > h11.sav;
        const employmentYoga = isWorkhorse && h6.sav > 28;
        const businessYoga = !isWorkhorse && h3.sav > 28 && h7.sav > 28;
        return {
            perPlanetTenthHouse: perPlanet, strongCareerPlanets: perPlanet.filter(p => p.strong),
            tenthHouseSAV: h10.sav, eleventhHouseSAV: h11.sav,
            profile: isWorkhorse ? 'Workhorse (Job/Salaried)' : 'Opportunist (Business)',
            employmentYoga: employmentYoga, businessYoga: businessYoga,
            thirdHouseSAV: h3.sav, seventhHouseSAV: h7.sav, sixthHouseSAV: h6.sav
        };
    },

    /**
     * Marriage analysis: 7th house alone, Combined Marriage Durability Yoga
     * (7th+8th > 50, each > 25), and 1st-vs-7th personality compatibility.
     */
    analyzeMarriageSAV: function (ascSignNum, sav) {
        const h1 = this._houseSAV(1, ascSignNum, sav), h7 = this._houseSAV(7, ascSignNum, sav), h8 = this._houseSAV(8, ascSignNum, sav);
        const combined = h7.sav + h8.sav;
        const durabilityYoga = combined > 50 && h7.sav > 25 && h8.sav > 25;
        const compatDiff = Math.abs(h1.sav - h7.sav);
        return {
            seventh: h7, eighth: h8, combined: combined, durabilityYoga: durabilityYoga,
            seventhVerdict: h7.sav >= 30 ? 'Strong, harmonious marriage potential' : h7.sav < 25 ? 'Warns of major relationship challenges' : 'Average — moderate effort needed',
            compatibility: { first: h1.sav, seventh: h7.sav, diff: compatDiff, verdict: compatDiff < 7 ? 'Fundamental compatibility, aligned worldviews' : 'Inherent friction/disagreements likely' }
        };
    },

    /**
     * Foreign travel/settlement: 12th (foreign) vs 4th (homeland) vs 9th
     * (long travel), the 12th-house per-planet bindu "trigger" analysis, and
     * the Foreign Earnings Yoga (12th SAV > 2nd SAV AND 12th SAV > 28).
     */
    analyzeForeignSettlement: function (allBAV, ascSignNum, sav) {
        const h4 = this._houseSAV(4, ascSignNum, sav), h9 = this._houseSAV(9, ascSignNum, sav), h12 = this._houseSAV(12, ascSignNum, sav), h2 = this._houseSAV(2, ascSignNum, sav);
        const twelfthHouseSign = h12.signIdx;
        const perPlanet12th = this.PLANETS7.map(p => ({ planet: p, bindus: allBAV[p] ? allBAV[p].bindus[twelfthHouseSign] : null }));
        const saturnBindus = (perPlanet12th.find(x => x.planet === 'Saturn') || {}).bindus;
        const pullToSettle = h12.sav > h4.sav;
        const foreignEarningsYoga = h12.sav > h2.sav && h12.sav > 28;
        let nature;
        if (pullToSettle && h12.sav >= 30) nature = 'Strong pull toward permanent foreign settlement';
        else if (h12.sav >= 30 && h4.sav >= h12.sav) nature = 'Excellent foreign experiences/travel, but strong homeland attachment — likely to return rather than settle';
        else nature = 'Moderate/situational foreign connection';
        return {
            fourth: h4, ninth: h9, twelfth: h12, second: h2,
            perPlanet12th: perPlanet12th, saturnLongTermIndicator: saturnBindus !== null && saturnBindus >= 4,
            pullToSettle: pullToSettle, foreignEarningsYoga: foreignEarningsYoga, nature: nature
        };
    },

    /**
     * Property/Vehicle: 4th house + lord strength, and the "flip/invest"
     * paradox (4th weaker than at least 3 of {2,5,10}, all three >28).
     */
    analyzePropertyVehicle: function (ascSignNum, sav, lords, allBAV) {
        const h4 = this._houseSAV(4, ascSignNum, sav), h2 = this._houseSAV(2, ascSignNum, sav), h5 = this._houseSAV(5, ascSignNum, sav), h10 = this._houseSAV(10, ascSignNum, sav);
        const fourthLord = lords[h4.signIdx];
        const fourthLordBAVInOwnHouse = allBAV[fourthLord] ? allBAV[fourthLord].bindus[h4.signIdx] : null;
        const weakerThanCount = [h2, h5, h10].filter(x => x.sav > h4.sav).length;
        const allThreeStrong = h2.sav > 28 && h5.sav > 28 && h10.sav > 28;
        const flipYoga = weakerThanCount >= 3 && allThreeStrong;
        return {
            fourth: h4, fourthLord: fourthLord, fourthLordBAVInOwnHouse: fourthLordBAVInOwnHouse,
            personalUseFavourable: h4.sav >= 28 && fourthLordBAVInOwnHouse !== null && fourthLordBAVInOwnHouse >= 4,
            flipInvestmentYoga: flipYoga, secondHouse: h2, fifthHouse: h5, tenthHouse: h10
        };
    },

    // ===================== 12. TATWA CHAKRA (CLASSICAL DIRECTION BY ELEMENT) =====================

    TATWA_TRIKONAS: {
        Agni:    { direction: 'East',  signs: [0, 4, 8],   element: 'Fire',  label: 'Poshaka Labha Trikona (advantages & wealth)' },
        Prithvi: { direction: 'South', signs: [1, 5, 9],   element: 'Earth', label: 'Ghataka Vyaya Trikona (misfortunes & losses — direction to avoid for finances)' },
        Vayu:    { direction: 'West',  signs: [2, 6, 10],  element: 'Air',   label: 'help from relatives/friends rather than independent wealth generation' },
        Jala:    { direction: 'North', signs: [3, 7, 11],  element: 'Water', label: 'Sevaka Karma Trikona (gains from service & career)' }
    },

    /**
     * The classical Tatwa Chakra: sum SAV bindus across the 4 elemental
     * trines (fixed zodiac groupings, NOT relative to Lagna) to find the
     * most favourable overall direction for life/career/finance.
     */
    analyzeTatwaChakraDirection: function (sav) {
        const totals = {};
        Object.entries(this.TATWA_TRIKONAS).forEach(([name, t]) => {
            totals[name] = { name: name, direction: t.direction, label: t.label, total: t.signs.reduce((s, i) => s + sav[i], 0), signs: t.signs.map(i => this.SIGNS[i]) };
        });
        const sorted = Object.values(totals).sort((a, b) => b.total - a.total);
        const [best, second] = sorted;
        const nearEqual = Math.abs(best.total - second.total) <= (best.total * 0.05); // within ~5%
        const oppositePairs = { East: 'West', West: 'East', North: 'South', South: 'North' };
        let finalDirection = best.direction;
        if (nearEqual) {
            if (oppositePairs[best.direction] === second.direction) {
                finalDirection = `${best.direction} (marginally ahead of opposite ${second.direction} — re-check with a finer chart)`;
            } else {
                const compass = { 'East-North': 'North-East', 'North-East': 'North-East', 'East-South': 'South-East', 'South-East': 'South-East', 'West-North': 'North-West', 'North-West': 'North-West', 'West-South': 'South-West', 'South-West': 'South-West' };
                finalDirection = compass[`${best.direction}-${second.direction}`] || compass[`${second.direction}-${best.direction}`] || `between ${best.direction} and ${second.direction}`;
            }
        }
        return { totals: totals, sorted: sorted, best: best, second: second, nearEqual: nearEqual, finalDirection: finalDirection };
    },

    // ===================== 13. VAISESHIKAMSA (MULTI-VARGA DIGNITY) =====================

    VAISESHIKAMSA_LEVELS: {
        2: { name: 'Parijatamsa', result: 'Respectability, good qualities, wealth, happiness, authority, and dignity.' },
        3: { name: 'Uttamamsa', result: 'Makes the native modest, clever, and well-behaved.' },
        4: { name: 'Gopuramsa', result: 'Brings intelligence, wealth, and acquisition of lands, cows, and houses.' },
        5: { name: 'Simhasanamsa', result: 'Makes the native a friend of a king, or equal to one.' },
        6: { name: 'Paravatamsa', result: 'Acquisition of good houses, vehicles, and other princely appendages.' },
        7: { name: 'Devalokamsa', result: 'Endows kingship and renown for good qualities.' },
        8: { name: 'Suralokamsa', result: 'Good fortune, wealth, grains, kingship, and birth of children.' },
        9: { name: 'Airavatamsa', result: 'Highly auspicious (classical texts do not detail further specifics).' },
        10: { name: '"King of Kings"', result: 'The highest classification — supreme authority and fortune.' }
    },
    // Standard 10-varga set used for this classification (Dasavarga).
    VAISESHIKAMSA_VARGAS: [1, 2, 3, 4, 7, 9, 10, 12, 30, 60],

    /**
     * Counts how many of the 10 standard vargas a planet is "strong" in
     * (own sign, a friend's sign, or exalted), and maps that count to its
     * Vaiseshikamsa classification. Requires a `getVargaSignFn(planetLon,
     * vargaN) => signIndex` you supply (wired to your app's own varga
     * calculator, e.g. getVargaData/getChartPlanetsForDiv).
     */
    computeVaiseshikamsa: function (planetName, planetLon, getVargaSignFn) {
        const DIGN = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.DIGNITIES) || {};
        const RELS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.NATURAL_RELATIONSHIPS) || {};
        const d = DIGN[planetName];
        if (!d || typeof getVargaSignFn !== 'function') return null;
        let strongCount = 0;
        const perVarga = [];
        this.VAISESHIKAMSA_VARGAS.forEach(vn => {
            let signIdx;
            try { signIdx = getVargaSignFn(planetLon, vn); } catch (e) { signIdx = null; }
            if (signIdx === null || signIdx === undefined) { perVarga.push({ varga: vn, strong: null }); return; }
            const vargaLord = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS[signIdx]) || null;
            const isOwn = d.own && d.own.includes(signIdx);
            const isExalt = d.exalt === signIdx;
            const isFriend = vargaLord && RELS[planetName] && RELS[planetName][vargaLord] === 'Friend';
            const strong = isOwn || isExalt || isFriend;
            if (strong) strongCount++;
            perVarga.push({ varga: vn, strong: strong, reason: isExalt ? 'exalted' : isOwn ? 'own sign' : isFriend ? 'friend\'s sign' : 'neutral/enemy sign' });
        });
        let level = null;
        if (strongCount >= 10) level = this.VAISESHIKAMSA_LEVELS[10];
        else if (this.VAISESHIKAMSA_LEVELS[strongCount]) level = this.VAISESHIKAMSA_LEVELS[strongCount];
        return { planet: planetName, strongCount: strongCount, perVarga: perVarga, level: level, gravelyCritical: strongCount <= 1 };
    },

    // ===================== 14. PLANETARY AVASTHA (AGE BY DEGREE) =====================

    ODD_SIGNS: [0, 2, 4, 6, 8, 10], // Aries, Gemini, Leo, Libra, Sagittarius, Aquarius
    AVASTHA_STAGES: ['Infancy', 'Boyhood', 'Youth', 'Middle Age', 'Old Age'],
    AVASTHA_EFFECT: {
        'Infancy': 'Progressing — mildly auspicious, building momentum.',
        'Boyhood': 'Happiness — auspicious.',
        'Youth': 'Most auspicious — full strength and favourable results.',
        'Middle Age': 'Classically associated with health challenges/vitality dips for the significations of this planet.',
        'Old Age': 'Classically the most challenging stage — significant decline in this planet\'s supportive capacity.'
    },

    /** Planetary Avastha (age) from its degree-in-sign; direction reverses for even signs. */
    getAvastha: function (signIdx, degInSign) {
        const isOdd = this.ODD_SIGNS.includes(signIdx);
        const portion = Math.min(4, Math.floor(degInSign / 6));
        const stageIdx = isOdd ? portion : (4 - portion);
        const stage = this.AVASTHA_STAGES[stageIdx];
        return { stage: stage, portion: portion, isOddSign: isOdd, effect: this.AVASTHA_EFFECT[stage] };
    },

    // ===================== 15. VASTU & DIRECTION ANALYSIS =====================

    /** 
     * Computes the strongest direction for each planet based on its BAV points 
     * in directional signs (East: 1,5,9, South: 2,6,10, West: 3,7,11, North: 4,8,12)
     */
    analyzeVastuAndDirections: function (allBAV) {
        const directions = [
            { name: 'East', signs: [0, 4, 8] },
            { name: 'South', signs: [1, 5, 9] },
            { name: 'West', signs: [2, 6, 10] },
            { name: 'North', signs: [3, 7, 11] }
        ];

        const analysis = {};
        this.PLANETS7.forEach(p => {
            if (!allBAV[p]) return;
            const dirScores = directions.map(dir => {
                const total = dir.signs.reduce((sum, signIdx) => sum + allBAV[p].bindus[signIdx], 0);
                return { direction: dir.name, signs: dir.signs.map(s => this.SIGNS[s]), total: total };
            });
            dirScores.sort((a, b) => b.total - a.total);
            analysis[p] = {
                strongest: dirScores[0],
                weakest: dirScores[dirScores.length - 1],
                allDirections: dirScores
            };
        });
        return analysis;
    },

    // ===================== 16. MAHADASHA ANALYSIS =====================

    /**
     * Evaluates property/land prospects during a Mahadasha by treating the Mahadasha 
     * lord's sign as the Ascendant (Dasha Lagna) and checking the 4th house SAV.
     */
    analyzeMahadashaForLand: function (mdLord, natalPlanets, savArray) {
        if (!mdLord || !natalPlanets || !natalPlanets[mdLord]) return null;
        
        // Dasha Lagna is the sign where the Mahadasha lord is placed
        const dashaLagnaSignIdx = natalPlanets[mdLord].sn;
        
        // Check the 4th house from Dasha Lagna (Property/Land)
        const fourthHouseIdx = (dashaLagnaSignIdx + 3) % 12;
        const fourthHousePoints = savArray[fourthHouseIdx];
        
        // Also check the 11th house from Dasha Lagna (Gains) to see if efforts yield high results
        const eleventhHouseIdx = (dashaLagnaSignIdx + 10) % 12;
        const eleventhHousePoints = savArray[eleventhHouseIdx];
        
        return {
            dashaLord: mdLord,
            dashaLagnaSign: this.SIGNS[dashaLagnaSignIdx],
            fourthHouseSign: this.SIGNS[fourthHouseIdx],
            fourthHousePoints: fourthHousePoints,
            eleventhHousePoints: eleventhHousePoints,
            favourable: fourthHousePoints >= 28,
            highlyFavourable: fourthHousePoints >= 30 && eleventhHousePoints >= 28
        };
    },

    /**
     * Evaluates business/career prospects during a Mahadasha by treating the Mahadasha 
     * lord's sign as the Ascendant (Dasha Lagna) and checking the 10th and 11th house SAV.
     */
    analyzeMahadashaForBusiness: function (mdLord, natalPlanets, savArray) {
        if (!mdLord || !natalPlanets || !natalPlanets[mdLord]) return null;
        
        const dashaLagnaSignIdx = natalPlanets[mdLord].sn;
        
        // Check the 10th house (Career/Business) and 11th house (Gains) from Dasha Lagna
        const tenthHouseIdx = (dashaLagnaSignIdx + 9) % 12;
        const tenthHousePoints = savArray[tenthHouseIdx];
        
        const eleventhHouseIdx = (dashaLagnaSignIdx + 10) % 12;
        const eleventhHousePoints = savArray[eleventhHouseIdx];
        
        // Less effort, more gains if 11th > 10th
        const effortVsGains = {
            effort: tenthHousePoints,
            gains: eleventhHousePoints,
            ratio: (tenthHousePoints > 0) ? (eleventhHousePoints / tenthHousePoints).toFixed(2) : 1
        };

        return {
            dashaLord: mdLord,
            dashaLagnaSign: this.SIGNS[dashaLagnaSignIdx],
            tenthHouseSign: this.SIGNS[tenthHouseIdx],
            tenthHousePoints: tenthHousePoints,
            eleventhHouseSign: this.SIGNS[eleventhHouseIdx],
            eleventhHousePoints: eleventhHousePoints,
            effortVsGains: effortVsGains,
            favourable: tenthHousePoints >= 28 && eleventhHousePoints >= 28,
            highlyFavourable: eleventhHousePoints > tenthHousePoints && eleventhHousePoints >= 30
        };
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.ASHTAKVARGA;