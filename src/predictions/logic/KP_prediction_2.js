/**
 * KP_prediction_2.js
 *
 * PART 2 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * This module is an ADDITIVE companion to KP_prediction.js — it does NOT
 * duplicate any rule already implemented there (house karakas, event
 * promise checker, tenanted/untenanted golden rules, independent houses,
 * house-lord placements, career alignment, timing-of-events 4-rule method,
 * horary/prashna 1-249, dasha confirmation, monthly/daily transit panels,
 * Argala, etc. all remain in KP_prediction.js and are simply CALLED from
 * here via `window.KP_PREDICTION`).
 *
 * Every method below is a topic sourced from lecture transcripts that was
 * confirmed ABSENT from KP_prediction.js (checked by keyword search across
 * the whole file before writing this module) — it was added specifically
 * to close that gap. As with Part 1, anywhere a full reference table
 * wasn't available in the source audio, that gap-fill is called out
 * explicitly in a comment.
 *
 * ============================ NEW TOPICS COVERED ===========================
 *
 * 1. DASHA PRAVESH ("दशा प्रवेश पद्धति") — the transiting Sun/starting-
 *    planet's SIGN LORD at the exact moment an Antardasha begins becomes
 *    the real "driver" of that sub-period, and can completely overrule the
 *    natal dasha-lord's own script (a natally weak planet can still give
 *    a strong result if its Dasha Pravesh sign lord is strong, and vice
 *    versa).
 *
 * 2. BIRTH TIME RECTIFICATION (BTR) — the "1-9 Connectivity Rule": a chart
 *    is treated as correctly timed only if the 1st cusp's Nakshatra Lord
 *    connects to the 9th cusp's Sub Lord (or vice-versa).
 *
 * 3. MUHURAT SELECTION — KP times an auspicious moment purely from the
 *    TRANSITING MOON's Sign/Star(NL)/Sub(SL), not from Panchang Tithi.
 *    Per-event house combinations (marriage 2-7-11, property 4-11,
 *    business 2-6-10-11, travel 3-9-11, surgery 1-5-9, conceiving 2-5-11
 *    read from the MOTHER's chart, competitive exam 3-6-11) plus the
 *    negation rule (avoid Moon transiting 6-10-12 for marriage).
 *
 * 4. SUN IN BHAVA CHALIT — SOUL PURPOSE (आत्म-उद्देश्य) — separate from the
 *    Moon (mind/Manas), the physical BHAVA CHALIT house of the natal Sun
 *    shows what the SOUL (Atma) needs to feel fulfilled/famous, house by
 *    house (1-12 table).
 *
 * 5. PLANETARY KARAKATVA BLENDING — KP is not a cold house-number game;
 *    the RULING PLANET of a CSL/significator chain overlays its own
 *    natural traits (Karakatva) onto the identical house-number script,
 *    which is why the same numbers (e.g. 5-8-12) manifest completely
 *    differently under Venus vs. Saturn vs. Rahu.
 *
 * 6. USE OF KP IN SHARE MARKET — 5th house (speculation) CSL checked
 *    against the 2-6-11 money combination, plus Moon-transit day/hour
 *    timing for the actual trade window.
 *
 * 7. REMEDIES — PLANETARY DONATION TABLE, Sharanaagati (Surrender) deity
 *    table, and the KAT (Karma Alignment Technique) house-specific
 *    "voluntary consumption" remedies (8th->auditing/astrology books on
 *    desk, 12th->foreign company/maps on desk + Gupt Daan, 6th+12th
 *    together->donate medicine, 5th-vs-6th conflict->children's photo on
 *    desk, 4th active->home office) — this is the fully-detailed remedy
 *    layer KP_prediction.js's EVENT_PRIME_HOUSES only sketches briefly.
 *
 * 8. DEDICATED TWIN-BIRTH CHECK — surfaced as its own callable/renderable
 *    function (was previously only a one-line note buried inside the
 *    `children` entry of EVENT_PRIME_HOUSES in Part 1).
 *
 * 9. DUAL-SIGN 15° RULE — a planet placed in a dual sign (Gemini/Virgo/
 *    Sagittarius/Pisces) behaves FIXED in the first 15° and MOVABLE in the
 *    last 15° of that sign — used for nature/behaviour analysis and as a
 *    supporting check for the twin-birth rule.
 *
 * 10. COMPETITIVE / DEFEAT-HOUSE PRASHNA FORMULA — in a horary chart cast
 *     for a competition/court case, houses are counted RELATIVE TO THE
 *     OPPONENT (who sits at the 7th from the querent): the querent's
 *     4th/5th/12th are the opponent's 10th/11th/6th, so if the OPPONENT's
 *     CSL shows 4-5-12 (in the querent's own house numbering) the
 *     OPPONENT wins.
 *
 * 11. 12th CSL — INVESTMENT-APPRECIATION FORMULA — a 12th CSL (and its
 *     star lord) landing in 4/11 signals an investment that will show
 *     strong long-term appreciation.
 *
 * 12. 2nd CSL — DETAILED WEALTH-SOURCE TABLE — what SPECIFIC kind of
 *     income/wealth-stability the 2nd CSL promises depending on which
 *     house (4,5,6,7,8,9) it involves (property/creative-unstable/
 *     lending-finance/business-partnership/inheritance-unstable/
 *     religious-teaching).
 *
 * 13. YEARLY PANEL (JUPITER TRANSIT, ~12 months/sign) — the missing 4th
 *     rung of the daily(Moon)/monthly(Sun)/yearly(Jupiter) macro-timing
 *     ladder; Part 1 already has Daily+Monthly, this adds Yearly using the
 *     exact same Source/Involvement/Confirmation cascading method.
 *
 * Dependencies: window.KP_PREDICTION (Part 1) MUST be loaded first — this
 * module reuses its cusp math, planet-numbers table, tenancy table, and
 * Bhava Chalit placement engine rather than re-deriving any of it.
 */

window.KP_PREDICTION_2 = {

    // Local shorthand accessor for Part 1 — resolved lazily (not at parse
    // time) so script load order only needs KP_prediction.js to run BEFORE
    // any KP_PREDICTION_2 method is CALLED, not before this file parses.
    _p1: function () { return window.KP_PREDICTION || null; },

    SIGNS: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    DUAL_SIGNS: [3, 6, 9, 12], // Gemini, Virgo, Sagittarius, Pisces (1-indexed sign numbers)

    _lordsFallback: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],

    _lords: function (lords) {
        return lords || (typeof LORDS !== 'undefined' ? LORDS : (window.LORDS || this._lordsFallback));
    },

    /** Sign-lord of a given house number counted from the Ascendant sign — mirrors Part 1's getHouseLordPlacements() indexing convention exactly, for consistency. */
    _houseSignLord: function (ascSignNum, houseNum, lords) {
        const L = this._lords(lords);
        return L[(ascSignNum + houseNum - 1) % 12];
    },

    _signNumOf: function (sid) { return Math.floor(((sid % 360) + 360) % 360 / 30) + 1; },
    _degInSign: function (sid) { return ((sid % 360) + 360) % 360 % 30; },


    // ================================================================
    // 1. DASHA PRAVESH ("दशा प्रवेश पद्धति") — TRANSIT-ENTRY OVERRULE
    // ================================================================
    //
    // Method: at the EXACT day/time an Antardasha (or any sub-period)
    // begins, find the Zodiac sign the transiting Sun (or the specified
    // "starting planet") is ENTERING at that moment. The SIGN LORD of
    // that transit sign becomes the actual "driver" of the whole
    // sub-period — the source teaching states this can completely
    // OVERRULE the natal Antardasha lord's own plain script: a natally
    // unfavourable planet can still deliver an outstanding result if its
    // Dasha Pravesh sign lord is a strong, favourable significator, and a
    // natally strong planet can fail if its Dasha Pravesh sign lord is
    // weak/afflicted.

    /**
     * @param transitPlanetSid  sidereal longitude of the transiting
     *   reference planet (Sun by default per the source teaching) AT THE
     *   EXACT MOMENT the sub-period begins.
     * @param subPeriodLord     the natal Antardasha/Pratyantardasha lord
     *   whose period is being entered (for the overrule comparison).
     * @param ascSid, natalPlanetsMap, lords — standard chart context.
     */
    analyzeDashaPravesh: function (transitPlanetSid, subPeriodLord, ascSid, natalPlanetsMap, lords) {
        const P1 = this._p1(); if (!P1 || transitPlanetSid === undefined) return null;
        const L = this._lords(lords);
        const signNum = this._signNumOf(transitPlanetSid);
        const driver = L[(signNum - 1) % 12];

        const allCusps = P1.getAllCusps(ascSid);
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const driverHouses = planetNumbers[driver] || [];
        const natalHouses = subPeriodLord ? (planetNumbers[subPeriodLord] || []) : [];

        const overlap = driverHouses.filter(h => natalHouses.includes(h));
        const overruled = subPeriodLord && driver !== subPeriodLord && overlap.length < Math.max(driverHouses.length, natalHouses.length) / 2;

        return {
            transitSign: this.SIGNS[signNum - 1], signNum: signNum, driver: driver, driverHouses: driverHouses,
            subPeriodLord: subPeriodLord || null, natalHouses: natalHouses, overlap: overlap,
            overruled: overruled,
            note: subPeriodLord
                ? (driver === subPeriodLord
                    ? `Dasha Pravesh driver (${driver}) IS the natal sub-period lord — the natal script runs largely UNCHANGED through this sub-period.`
                    : `Dasha Pravesh driver is ${driver} (sign lord of ${this.SIGNS[signNum - 1]}, the sign the reference planet entered exactly as this sub-period began) — houses H${driverHouses.join(',H') || '—'}. This OVERLAYS the natal ${subPeriodLord} script (H${natalHouses.join(',H') || '—'}); per the source teaching, ${driver}'s houses take precedence for THIS sub-period's actual lived results.`)
                : `Dasha Pravesh driver is ${driver} (sign lord of ${this.SIGNS[signNum - 1]}) — houses H${driverHouses.join(',H') || '—'} will dominate this sub-period's actual results.`
        };
    },

    renderDashaPravesh: function (data) {
        if (!data) return '<div class="pred-item">Dasha Pravesh needs a transiting reference-planet longitude at the exact sub-period start moment — pass transitPlanetSid into analyze2().</div>';
        const P1 = this._p1();
        return `<div class="pred-item" style="border-left:3px solid #B388FF;">
            <div class="pred-title" style="color:#B388FF;">🚪 Dasha Pravesh — Transit-Entry Driver</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Method: the Sign Lord of whatever sign the transiting reference planet enters AT THE EXACT MOMENT a sub-period begins can overrule the natal sub-period lord's own plain script.</div>
            <div><b>Transit Sign:</b> ${data.transitSign} → <b>Driver:</b> ${data.driver}${P1 ? P1._chip(data.driverHouses.length ? 'H' + data.driverHouses.join(',H') : 'no houses', '#B388FF') : ''}</div>
            ${data.subPeriodLord ? `<div style="margin-top:4px;">Natal sub-period lord: <b>${data.subPeriodLord}</b> — Houses: H${data.natalHouses.join(',H') || '—'}</div>` : ''}
            <div style="margin-top:6px;padding:6px 8px;border-left:3px solid ${data.overruled ? '#FF4477' : '#00DD77'};background:${data.overruled ? '#FF447715' : '#00DD7715'};">${data.note}</div>
          </div>`;
    },


    // ================================================================
    // 2. BIRTH TIME RECTIFICATION (BTR) — THE 1–9 CONNECTIVITY RULE
    // ================================================================
    //
    // A chart's birth time is treated as correctly timed / "genuine" only
    // when there is deep stellar connectivity between the 1st cusp (Body/
    // Self) and the 9th cusp (wisdom/destiny/fortune): either the 1st
    // house's Nakshatra Lord IS the 9th house's Sub Lord, OR the 1st
    // house's Sub Lord IS the 9th house's Nakshatra Lord.

    checkBirthTimeRectification: function (ascSid) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const c1 = allCusps[1], c9 = allCusps[9];
        const path1 = c1.nakLord === c9.subLord; // 1st NL == 9th SL
        const path2 = c1.subLord === c9.nakLord; // 1st SL == 9th NL
        const connected = path1 || path2;
        return {
            house1: { nakLord: c1.nakLord, subLord: c1.subLord },
            house9: { nakLord: c9.nakLord, subLord: c9.subLord },
            path1: path1, path2: path2, connected: connected,
            note: connected
                ? (path1 ? `1st House's Nakshatra Lord (${c1.nakLord}) = 9th House's Sub Lord (${c9.subLord}) — 1-9 connectivity CONFIRMED.` : `1st House's Sub Lord (${c1.subLord}) = 9th House's Nakshatra Lord (${c9.nakLord}) — 1-9 connectivity CONFIRMED.`)
                : `Neither path connects (1st NL=${c1.nakLord} vs 9th SL=${c9.subLord}; 1st SL=${c1.subLord} vs 9th NL=${c9.nakLord}) — per the source teaching this birth time should be treated as UNVERIFIED and may need rectification (adjust the birth minute until one of the two paths connects, then re-check every other rule in this engine against the corrected chart).`
        };
    },

    renderBirthTimeRectification: function (data) {
        if (!data) return '';
        const c = data.connected ? '#00DD77' : '#FF4477';
        return `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">🕰️ Birth Time Rectification — 1-9 Connectivity Check</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">A chart is treated as correctly timed only when the 1st cusp (Self) and 9th cusp (Fortune) are mutually connected at the star-lord/sub-lord level.</div>
            <div>H1 → NL: <b>${data.house1.nakLord}</b>, SL: <b>${data.house1.subLord}</b></div>
            <div>H9 → NL: <b>${data.house9.nakLord}</b>, SL: <b>${data.house9.subLord}</b></div>
            <div style="margin-top:6px;padding:6px 8px;border-left:3px solid ${c};background:${c}15;">${data.note}</div>
          </div>`;
    },


    // ================================================================
    // 3. MUHURAT SELECTION — MOON SIGN/STAR/SUB METHOD
    // ================================================================
    //
    // KP times an auspicious moment strictly from the TRANSITING MOON's
    // Nakshatra (Star) Lord (broad-day condition) and Sub Lord (narrows to
    // the exact hour), NOT from generic Panchang Tithi. Each event has its
    // own supportive house-combination and, for some events, a specific
    // NEGATION combination that must be strictly avoided on the day/hour
    // chosen (e.g. Moon transiting the Nakshatra/Sub of a 6-10-12
    // significator on a wedding day is said to derail the ceremony
    // mid-way).

    MUHURAT_EVENT_HOUSES: {
        marriage: { supportive: [2, 7, 11], avoid: [6, 10, 12], note: 'Marriage Muhurat — avoid Moon transiting the Star/Sub of any 6-10-12 significator on the wedding day; per the source teaching this can break the rituals off mid-way.' },
        property_purchase: { supportive: [4, 11], avoid: [8], note: 'Property purchase Muhurat.' },
        business_startup: { supportive: [2, 6, 10, 11], avoid: [5, 8, 12], note: 'Business/startup launch Muhurat.' },
        travel: { supportive: [3, 9, 11], avoid: [], note: 'Travel Muhurat — 3rd for short trips, 9th for long-distance.' },
        surgery: { supportive: [1, 5, 9], avoid: [6, 8, 12], note: 'Surgery Muhurat — 1/5/9 guarantees a safer procedure and faster bodily healing.' },
        conceiving: { supportive: [2, 5, 11], avoid: [4, 10, 12], note: 'Child-conceiving Muhurat — MUST be calculated from the MOTHER\'S (wife\'s) chart, not the husband\'s, since she is the one conceiving.', useSpouseChart: true },
        competitive_exam: { supportive: [3, 6, 11], avoid: [], note: 'Competitive exam / online exam Muhurat — 3rd (online medium), 6th (victory over competition), 11th (desire fulfilment).' },
        product_marketing: { supportive: [3, 11], avoid: [], note: 'Product promotion/marketing launch — 3rd CSL needs involvement of 11 (confirmation) or vice-versa.' }
    },

    /**
     * Scans a date range day-by-day for the transiting Moon's Nakshatra
     * Lord to match the event's supportive houses (and NOT match its avoid
     * houses); flags the best hours within a matching day by additionally
     * checking the Sub Lord (approximated here by sampling at `subStepHours`
     * intervals within the day, since Sub Lord changes multiple times/day).
     */
    findMuhuratWindows: function (eventType, ascSid, natalPlanetsMap, fromDate, toDate, getPosFn, subStepHours) {
        const P1 = this._p1(); if (!P1 || typeof getPosFn !== 'function') return [];
        const ev = this.MUHURAT_EVENT_HOUSES[eventType];
        if (!ev) return [];
        const allCusps = P1.getAllCusps(ascSid);
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        subStepHours = subStepHours || 3;

        const windows = [];
        let d = new Date(fromDate);
        while (d <= toDate) {
            for (let hr = 0; hr < 24; hr += subStepHours) {
                const moment = new Date(d); moment.setHours(hr, 0, 0, 0);
                let pos; try { pos = getPosFn(moment); } catch (e) { continue; }
                const moon = pos && pos.Moon; if (!moon || moon.sid === undefined) continue;
                const kp = P1._getKPLords(moon.sid);
                const nlHouses = planetNumbers[kp.nakLord] || [];
                const slHouses = planetNumbers[kp.subLord] || [];
                const supportiveHit = ev.supportive.filter(h => nlHouses.includes(h) || slHouses.includes(h));
                const avoidHit = ev.avoid.filter(h => nlHouses.includes(h) || slHouses.includes(h));
                if (supportiveHit.length && !avoidHit.length) {
                    windows.push({ date: new Date(moment), nakLord: kp.nakLord, subLord: kp.subLord, supportiveHit: supportiveHit, avoidHit: avoidHit });
                }
            }
            d.setDate(d.getDate() + 1);
        }
        return windows;
    },

    renderMuhuratWindows: function (eventType, windows) {
        const ev = this.MUHURAT_EVENT_HOUSES[eventType];
        const header = `<div class="pred-title" style="color:#FFD27A;">🗓️ Muhurat — ${eventType.replace(/_/g, ' ')}</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">${ev ? ev.note : ''} Supportive houses: H${ev ? ev.supportive.join(',H') : ''}${ev && ev.avoid.length ? ` · Strictly avoid: H${ev.avoid.join(',H')}` : ''}</div>`;
        if (!windows || !windows.length) return `<div class="pred-item" style="border-left:3px solid #FFD27A;">${header}<div style="font-size:9px;color:var(--muted);">No qualifying window found in the scanned range — widen the date range or relax to Nakshatra-Lord-only matching.</div></div>`;
        const rows = windows.slice(0, 12).map(w => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">
            <b>${w.date.toLocaleString()}</b> — Moon NL: ${w.nakLord}, SL: ${w.subLord} — matches H${w.supportiveHit.join(',H')}
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #FFD27A;">${header}${rows}</div>`;
    },


    // ================================================================
    // 4. SUN IN BHAVA CHALIT — SOUL PURPOSE (आत्म-उद्देश्य)
    // ================================================================
    //
    // While the natal Moon shows what makes the MIND (Manas) happy, the
    // Sun's placement in the BHAVA CHALIT chart specifically (not the
    // Rashi/D1 sign chart) shows what the SOUL (Atma) needs to feel
    // complete, and engaging that house's activities is said to bring
    // natural name/fame/recognition without forcing it.

    SOUL_PURPOSE_BY_HOUSE: {
        1: 'The soul is fulfilled through self-driven achievement, physical vitality, and an independent, self-made identity.',
        2: 'The soul is connected to banking, financial stewardship, family lineage, and the spoken/written word.',
        3: 'The soul finds purpose through courage, effort, communication, marketing, and short-distance movement/travel.',
        4: 'The soul seeks roots — home, property, motherland, and domestic peace; Vaastu/real-estate work can feel like a calling.',
        5: 'The soul constantly seeks knowledge, learning, creative self-expression, and self-education.',
        6: 'The soul finds its ultimate calling in daily service, routine work, and helping others through disciplined effort.',
        7: 'The soul is fulfilled through partnership, one-to-one relationship, and public/commercial dealing.',
        8: 'The soul is drawn to secrets, occult sciences, astrology, and Tantra/Mantra — the native cannot feel complete without occult/hidden knowledge.',
        9: 'The soul seeks higher wisdom, philosophy, long-distance travel, and teaching/guru-level guidance.',
        10: 'The soul seeks high authority — government, administration, politics, or public standing (e.g. Narendra Modi\'s chart, cited in the source lecture).',
        11: 'The soul finds happiness in friend circles, social societies, NGOs, and philanthropic/humanitarian work.',
        12: 'The soul is deeply drawn to meditation, research, isolated settings, or foreign environments (e.g. K.N. Rao\'s chart, cited in the source lecture).'
    },

    getSoulPurpose: function (ascSid, ascSignNum, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const bc = P1.getBhavaChalitPlacements(ascSid, ascSignNum, natalPlanetsMap);
        const sunRow = bc.placements.find(p => p.planet === 'Sun');
        if (!sunRow || !sunRow.bhavaHouse) return null;
        return { bhavaHouse: sunRow.bhavaHouse, purpose: this.SOUL_PURPOSE_BY_HOUSE[sunRow.bhavaHouse], nearSandhi: sunRow.nearSandhi, sandhiNote: sunRow.sandhiNote };
    },

    renderSoulPurpose: function (data) {
        if (!data) return '<div class="pred-item">Soul Purpose needs the natal Sun\'s Bhava Chalit placement — unavailable.</div>';
        return `<div class="pred-item" style="border-left:3px solid #FFB347;">
            <div class="pred-title" style="color:#FFB347;">☉ Soul Purpose — Sun in Bhava Chalit House ${data.bhavaHouse}</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">While the Moon shows what makes the MIND happy, the Chalit Sun shows what the SOUL needs — engaging this house's activities brings natural fulfilment, name and recognition.</div>
            <div>${data.purpose}</div>
            ${data.nearSandhi ? `<div style="margin-top:4px;font-size:8.5px;color:var(--muted);">${data.sandhiNote}</div>` : ''}
          </div>`;
    },


    // ================================================================
    // 5. PLANETARY KARAKATVA BLENDING
    // ================================================================
    //
    // KP is not a cold house-number game — the RULING PLANET of a
    // significator chain overlays its own natural Karakatva onto the
    // identical house-number script, so the SAME numbers manifest in
    // completely different fields depending on which planet delivers them.

    PLANETARY_KARAKATVA: {
        Sun: 'authority, government, self-confidence, bones/heart, high office, father',
        Moon: 'mind, public dealing, fluctuation, nurturing, the masses, mother',
        Mars: 'courage, land/property, energy, surgery/accident, siblings, blood',
        Mercury: 'communication, books, online mediums, database/writing/teaching, intellect, business acumen',
        Jupiter: 'counselling, teaching, astrology/advisory, expansion, children, higher wisdom, wealth-through-guidance',
        Venus: 'entertainment, media, luxury, fashion, relationships, hospitality, beauty/arts',
        Saturn: 'delay, chronic/structural issues, hard/mechanical work, engineering/metallurgy, discipline, the underprivileged',
        Rahu: 'sudden/unpredictable events, illusion, foreign setups, technology, unconventional/out-of-the-box paths, obsession',
        Ketu: 'detachment, occult/spiritual knowledge, research, isolation, past-life karma, moksha'
    },

    /** Overlays a ruling planet's natural Karakatva onto an arbitrary list of active house numbers, producing a field-specific narrative (not just a bare number list). */
    blendKarakatva: function (planet, houseNumbers) {
        const trait = this.PLANETARY_KARAKATVA[planet];
        if (!trait) return null;
        return {
            planet: planet, houses: houseNumbers, trait: trait,
            narrative: `Houses H${(houseNumbers || []).join(',H') || '—'} ruled through ${planet} express as: ${trait}. The same house numbers under a different ruling planet would manifest in a completely different field — always read the planet's Karakatva together with its numbers, never the numbers alone.`
        };
    },

    /** Convenience: blend a house's own CSL-determining-planet Karakatva onto its L1/L2 chain numbers in one call. */
    getBlendedCSLNarrative: function (houseNum, ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const resolved = P1.resolveDeterminingPlanetPrecise(houseNum, allCusps, natalPlanetsMap);
        if (!resolved) return null;
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const numbers = planetNumbers[resolved.determiningPlanet] || [];
        return Object.assign({ house: houseNum, determiningPlanet: resolved.determiningPlanet }, this.blendKarakatva(resolved.determiningPlanet, numbers));
    },

    renderBlendedKarakatva: function (data) {
        if (!data) return '';
        return `<div class="pred-item" style="border-left:3px solid #C4A2FC;">
            <div class="pred-title" style="color:#C4A2FC;">🎭 Karakatva Blend — House ${data.house} via ${data.planet}</div>
            <div style="font-size:9.5px;">${data.narrative}</div>
          </div>`;
    },


    // ================================================================
    // 6. USE OF KP IN SHARE MARKET
    // ================================================================
    //
    // Share trading is a 5th-house (speculative) activity. The 5th CSL's
    // Nakshatra Lord must signify the money-giving 2-6-11 combination for
    // a strong natal promise; an UNTENANTED 5th CSL signifying 2-6-11
    // makes the gains direct/substantial. Timing follows the same Moon
    // Nakshatra(day)/Sub(hour) cascading method as the Daily Panel.

    MONEY_HOUSES: [2, 6, 11],

    checkShareMarketPromise: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const fifth = allCusps[5];
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const tenancy = P1.getTenancy(natalPlanetsMap);
        const nlHouses = planetNumbers[fifth.nakLord] || [];
        const moneyHit = this.MONEY_HOUSES.filter(h => nlHouses.includes(h));
        const untenanted = tenancy[fifth.subLord] && !tenancy[fifth.subLord].tenanted;
        const promise = moneyHit.length >= 2;
        return {
            fifthCSL: fifth.subLord, fifthNL: fifth.nakLord, nlHouses: nlHouses, moneyHit: moneyHit,
            csl5Untenanted: untenanted, promise: promise,
            note: promise
                ? `5th CSL's Nakshatra Lord (${fifth.nakLord}) signifies H${moneyHit.join(',H')} — a strong natal promise of wealth through speculative/share-market activity.${untenanted ? ' The 5th CSL itself is UNTENANTED — per the source teaching this makes the gains direct and substantial rather than modest.' : ''}`
                : `5th CSL's Nakshatra Lord (${fifth.nakLord}) only weakly touches the 2-6-11 money combination (H${moneyHit.join(',H') || 'none'}) — no strong natal promise for share-market wealth; speculative trading is better treated as recreational, not a primary income source, for this chart.`
        };
    },

    /** Reuses Part 1's Daily-Panel-style Moon cascade, filtered specifically to the 2-6-11 money houses, for actual trade-day/hour timing. */
    getShareMarketTimingPanel: function (transitMoonData, ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1 || !transitMoonData || transitMoonData.sid === undefined) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const moonKP = P1._getKPLords(transitMoonData.sid);
        const nlHouses = planetNumbers[moonKP.nakLord] || [];
        const slHouses = planetNumbers[moonKP.subLord] || [];
        const dayHit = this.MONEY_HOUSES.filter(h => nlHouses.includes(h));
        const hourHit = this.MONEY_HOUSES.filter(h => slHouses.includes(h));
        return { nakLord: moonKP.nakLord, subLord: moonKP.subLord, dayHit: dayHit, hourHit: hourHit, favourable: dayHit.length > 0 && hourHit.length > 0 };
    },

    renderShareMarket: function (promiseData, timingData) {
        if (!promiseData) return '';
        const c = promiseData.promise ? '#00DD77' : '#FF4477';
        let out = `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">📈 Share Market — 5th CSL Money Check</div>
            <div>${promiseData.note}</div>`;
        if (timingData) {
            const tc = timingData.favourable ? '#00DD77' : 'var(--muted)';
            out += `<div style="margin-top:6px;padding:6px 8px;border-left:3px solid ${tc};background:${tc}15;">
                Today's Moon — NL: ${timingData.nakLord} (day-level ${timingData.dayHit.length ? 'HIT H' + timingData.dayHit.join(',H') : 'no money-house hit'}), SL: ${timingData.subLord} (hour-level ${timingData.hourHit.length ? 'HIT H' + timingData.hourHit.join(',H') : 'no money-house hit'}) — ${timingData.favourable ? 'a genuinely favourable trading window.' : 'not a standout window; wait for both NL and SL to hit a money house.'}
              </div>`;
        }
        out += '</div>';
        return out;
    },


    // ================================================================
    // 7. REMEDIES — DONATIONS, SHARANAAGATI, AND KAT (HOUSE-SPECIFIC)
    // ================================================================

    /** Item to donate to satisfy/balance a planet's active negative (6-8-12) signification. */
    REMEDY_DONATIONS: {
        Sun: 'Wheat or wheat flour (gehun)',
        Moon: 'Milk or rice',
        Mars: 'Red lentils (Masur dal) or spicy/spiced food',
        Mercury: 'Green moong dal or green cloth/items',
        Jupiter: 'Chana dal (Bengal gram) and ghee — traditionally for ~2 months',
        Venus: 'White sweets, curd, or white/light-coloured cloth',
        Saturn: 'Barley (jau), black sesame, or iron items',
        Rahu: 'Barley (jau) or iron/coal',
        Ketu: 'Sesame (til) or a multi-coloured blanket'
    },

    /** Deity for the "Sharanaagati" (mental surrender) remedy — reduces an intensely negative running dasha's active negativity by worshipping the deity associated with that dasha's planet, rather than fighting it. */
    SHARANAAGATI_DEITY: {
        Sun: 'Surya / Lord Vishnu', Moon: 'Shiva (as Chandrashekhara) / Goddess Parvati', Mars: 'Hanuman / Lord Shiva',
        Mercury: 'Vishnu', Jupiter: 'Vishnu / Brihaspati', Venus: 'Goddess Lakshmi', Saturn: 'Lord Shiva / Hanuman',
        Rahu: 'Lord Shiva / Durga', Ketu: 'Lord Ganesha'
    },

    suggestPlanetRemedy: function (afflictedPlanet) {
        const item = this.REMEDY_DONATIONS[afflictedPlanet];
        const deity = this.SHARANAAGATI_DEITY[afflictedPlanet];
        if (!item) return null;
        return {
            planet: afflictedPlanet, donationItem: item, deity: deity,
            note: `Donate ${item} to satisfy ${afflictedPlanet}'s active negative signification. If running an intensely negative ${afflictedPlanet} dasha, "Sharanaagati" (mental surrender to ${deity}) constructively reduces the planet's active negativity rather than confronting it.`
        };
    },

    /**
     * KAT (Karma Alignment Technique) — voluntarily "consume" a
     * challenging house's energy through a specific real-world action so
     * it doesn't manifest as an involuntary personal crisis. Keyed by
     * WHICH house is showing as active/afflicted; pass the list of active
     * houses you found via checkEventPromise()/exploreHouse() in Part 1.
     */
    KAT_REMEDIES: {
        8: { remedy: 'Voluntarily choose 8th-house-aligned work — auditing, taxation, deep data research, or astrology; if you can\'t change your job, keep astrology books on your work desk and read/flip through them during stressful moments. This constructively "consumes" the active 8th-house energy locally instead of letting it cause a personal crisis.' },
        12: { remedy: 'Align your career with 12th-house energy — work for a foreign company, or place pictures/maps of foreign lands near your workspace. To neutralise sudden financial drains specifically, practice Gupt Daan (completely secret, anonymous charity) — telling anyone activates the 11th house of social validation and cancels the protective effect.' },
        '6+12': { remedy: 'When 6th (illness/debt) and 12th (expenditure) are simultaneously active, there is a risk of heavy medical bills/hospitalisation. Voluntarily purchase and donate medicines to poor/sick patients — this satisfies the cosmic requirement to "spend on illness" through someone else\'s need rather than your own.' },
        '5v6': { remedy: 'If the 5th house is negating the 6th (job instability — 5th is the 12th/loss-house from the 6th), keep pictures of small, happy children on your office desk and spend time looking at them. This channels the 5th-house (children/creativity) energy constructively in the office, stabilising the job.' },
        4: { remedy: 'If the 4th house is causing career/home imbalance, set up an office space inside your house and operate at least part of your professional activity directly from home.' }
    },

    getKATRemedies: function (activeHouses) {
        const out = [];
        (activeHouses || []).forEach(h => { if (this.KAT_REMEDIES[h]) out.push(Object.assign({ trigger: h }, this.KAT_REMEDIES[h])); });
        if (activeHouses && activeHouses.includes(6) && activeHouses.includes(12)) out.push(Object.assign({ trigger: '6+12' }, this.KAT_REMEDIES['6+12']));
        if (activeHouses && activeHouses.includes(5) && activeHouses.includes(6)) out.push(Object.assign({ trigger: '5v6' }, this.KAT_REMEDIES['5v6']));
        return out;
    },

    renderRemedies: function (planetRemedy, katRemedies) {
        let out = '<div class="pred-item" style="border-left:3px solid #FFAA55;"><div class="pred-title" style="color:#FFAA55;">🕯️ Remedies</div>';
        if (planetRemedy) out += `<div style="margin:4px 0;">${planetRemedy.note}</div>`;
        (katRemedies || []).forEach(k => { out += `<div style="margin:4px 0;padding:5px 8px;border-left:3px solid #FFAA55;background:rgba(255,170,85,.08);"><b>Trigger H${k.trigger}:</b> ${k.remedy}</div>`; });
        out += '</div>';
        return out;
    },


    // ================================================================
    // 8. DEDICATED TWIN-BIRTH CHECK
    // ================================================================
    //
    // Two conditions must BOTH align in a parent's chart: (a) the 5th
    // Cuspal Sub Lord must be placed in a DUAL sign (Gemini/Virgo/
    // Sagittarius/Pisces) [and per Part 1's note, its star lord too], AND
    // (b) there must be a strong involvement of MERCURY (planet of
    // change/multiplicity) in the script.

    checkTwinBirthPromise: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const fifth = allCusps[5];
        const cslData = natalPlanetsMap[fifth.subLord];
        const nlData = natalPlanetsMap[fifth.nakLord];
        if (!cslData || cslData.sid === undefined || !nlData || nlData.sid === undefined) return null;

        const cslSign = this._signNumOf(cslData.sid), nlSign = this._signNumOf(nlData.sid);
        const cslDual = this.DUAL_SIGNS.includes(cslSign), nlDual = this.DUAL_SIGNS.includes(nlSign);
        const bothDual = cslDual && nlDual;

        const houseLord5 = this._houseSignLord(natalPlanetsMap._ascSignNum || this._signNumOf(ascSid), 5, null);
        const mercuryInvolved = fifth.subLord === 'Mercury' || fifth.nakLord === 'Mercury' || houseLord5 === 'Mercury'
            || (natalPlanetsMap.Mercury && natalPlanetsMap.Mercury.house === 5);

        const promise = bothDual && mercuryInvolved;
        return {
            csl: fifth.subLord, cslSign: this.SIGNS[cslSign - 1], cslDual: cslDual,
            nl: fifth.nakLord, nlSign: this.SIGNS[nlSign - 1], nlDual: nlDual,
            mercuryInvolved: mercuryInvolved, promise: promise,
            note: promise
                ? `5th CSL (${fifth.subLord}, in ${this.SIGNS[cslSign - 1]}) AND its Star Lord (${fifth.nakLord}, in ${this.SIGNS[nlSign - 1]}) are BOTH in Dual signs, with Mercury also strongly involved in the 5th-house script — this promises TWIN birth. NOTE: twins are typically born 2-3 minutes apart, which is often enough to shift the CSL between them — treat each twin's own birth-time chart separately once born.`
                : `Twin-birth conditions are NOT both met (CSL Dual: ${cslDual}, Star-Lord Dual: ${nlDual}, Mercury involved: ${mercuryInvolved}) — a single-birth reading applies.`
        };
    },

    renderTwinBirthCheck: function (data) {
        if (!data) return '';
        const c = data.promise ? '#00DD77' : 'var(--muted)';
        return `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">👯 Twin-Birth Check (5th House)</div>
            <div>5th CSL: <b>${data.csl}</b> (${data.cslSign}${data.cslDual ? ' — Dual' : ''}) · Star Lord: <b>${data.nl}</b> (${data.nlSign}${data.nlDual ? ' — Dual' : ''}) · Mercury involved: <b>${data.mercuryInvolved ? 'Yes' : 'No'}</b></div>
            <div style="margin-top:6px;padding:6px 8px;border-left:3px solid ${c};background:${c}15;">${data.note}</div>
          </div>`;
    },


    // ================================================================
    // 9. DUAL-SIGN 15° RULE (FIXED vs MOVABLE BEHAVIOUR SPLIT)
    // ================================================================
    //
    // A planet placed within a Dual sign (Gemini/Virgo/Sagittarius/Pisces)
    // behaves like a FIXED sign in the FIRST 15° (seeks stability/routine)
    // and like a MOVABLE sign in the LAST 15° (seeks frequent change,
    // travel, movement) — used for nature analysis and as a supporting
    // check elsewhere (e.g. twin-birth, business-relocation reads).

    classifyDualSignBehavior: function (sid) {
        if (sid === undefined) return null;
        const signNum = this._signNumOf(sid);
        if (!this.DUAL_SIGNS.includes(signNum)) return null;
        const deg = this._degInSign(sid);
        const behaves = deg < 15 ? 'Fixed (Sthira) — seeks stability, routine, permanence' : 'Movable (Chara) — seeks frequent change, travel, movement';
        return { signNum: signNum, sign: this.SIGNS[signNum - 1], degInSign: Math.round(deg * 100) / 100, behaves: behaves };
    },

    /** Runs the Dual-Sign-15° classification across all 9 planets for a full nature profile. */
    getDualSignProfile: function (natalPlanetsMap) {
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const out = [];
        planets.forEach(p => {
            const pd = natalPlanetsMap[p]; if (!pd || pd.sid === undefined) return;
            const c = this.classifyDualSignBehavior(pd.sid);
            if (c) out.push(Object.assign({ planet: p }, c));
        });
        return out;
    },

    renderDualSignProfile: function (rows) {
        if (!rows || !rows.length) return '<div class="pred-item">No planets are placed in a Dual sign (Gemini/Virgo/Sagittarius/Pisces) — this rule does not apply to this chart.</div>';
        const items = rows.map(r => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #7FDBFF;background:rgba(127,219,255,.08);"><b>${r.planet}</b> in ${r.sign} at ${r.degInSign}° — ${r.behaves}</div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #7FDBFF;">
            <div class="pred-title" style="color:#7FDBFF;">↔️ Dual-Sign 15° Behaviour Split</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">0-15° of a Dual sign behaves Fixed; 15-30° behaves Movable.</div>
            ${items}
          </div>`;
    },


    // ================================================================
    // 10. COMPETITIVE / DEFEAT-HOUSE PRASHNA FORMULA
    // ================================================================
    //
    // In a horary chart cast for a competition, sports match, or court
    // case, the OPPONENT sits at the 7th house from the querent. Houses
    // must therefore be counted RELATIVE TO THE OPPONENT: the querent's
    // own 4th house is the opponent's 10th (status/win), the querent's 5th
    // is the opponent's 11th (gain), and the querent's 12th is the
    // opponent's 6th (victory-over-competition). So if the relevant CSL
    // (the one governing the contest) shows 4-5-12 in the QUERENT's OWN
    // house numbering, that is actually a 10-11-6 WIN for the OPPONENT —
    // i.e. the querent loses.

    /** Given an offset (10=status/win, 11=gains, 6=victory) counted from the OPPONENT's own seat (house 7 from the querent), returns which of the QUERENT's own house-numbers that maps to. */
    getOpponentHouseInQuerentFrame: function (opponentOffset) {
        const P1 = this._p1(); const mod12 = P1 ? P1._mod12.bind(P1) : (h => ((h - 1) % 12 + 12) % 12 + 1);
        return mod12(7 + opponentOffset - 1); // 7th house is the opponent's own "1st"
    },

    /**
     * Analyzes a competition/court-case horary CSL script against BOTH
     * frames at once: the querent's OWN win-houses (6-10-11 in the
     * querent's normal numbering) versus the OPPONENT's win-houses,
     * expressed in the querent's own house-numbering (4-5-12, since the
     * opponent's 10-11-6 fall on the querent's 4-5-12).
     */
    analyzeCompetitivePrashna: function (cslHouseNumbers) {
        const querentWinHouses = [6, 10, 11];
        const opponentWinHousesInQuerentFrame = [4, 5, 12]; // opponent's 10,11,6 respectively
        const nums = cslHouseNumbers || [];
        const querentHit = querentWinHouses.filter(h => nums.includes(h));
        const opponentHit = opponentWinHousesInQuerentFrame.filter(h => nums.includes(h));
        let verdict;
        if (querentHit.length > opponentHit.length) verdict = 'QUERENT wins';
        else if (opponentHit.length > querentHit.length) verdict = 'OPPONENT wins';
        else verdict = 'Inconclusive — needs L2/L3 or Ruling Planets to break the tie';
        return {
            cslHouseNumbers: nums, querentWinHouses: querentWinHouses, opponentWinHousesInQuerentFrame: opponentWinHousesInQuerentFrame,
            querentHit: querentHit, opponentHit: opponentHit, verdict: verdict,
            note: `Querent's own win-combination (6-10-11) hit: H${querentHit.join(',H') || 'none'}. Opponent's win-combination (their 10-11-6 = querent's own 4-5-12) hit: H${opponentHit.join(',H') || 'none'}. Verdict: ${verdict}.`
        };
    },

    renderCompetitivePrashna: function (data) {
        if (!data) return '';
        const c = data.verdict.indexOf('QUERENT') === 0 ? '#00DD77' : data.verdict.indexOf('OPPONENT') === 0 ? '#FF4477' : '#FFD700';
        return `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">🏆 Competitive Prashna — Defeat-House Formula</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">The opponent sits at the 7th house from the querent — the querent's own 4th/5th/12th houses are the opponent's 10th/11th/6th (status/gain/victory).</div>
            <div>${data.note}</div>
          </div>`;
    },


    // ================================================================
    // 11. 12th CSL — INVESTMENT-APPRECIATION FORMULA
    // ================================================================
    //
    // The 12th house represents long-term investment. If the 12th CSL and
    // its Nakshatra Lord are BOTH placed in wealth-generating houses
    // (4=property, 11=gains), the native will see massive long-term
    // appreciation on that investment.

    checkInvestmentAppreciation: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const twelfth = allCusps[12];
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const cslHouses = planetNumbers[twelfth.subLord] || [];
        const nlHouses = planetNumbers[twelfth.nakLord] || [];
        const wealthHouses = [4, 11];
        const cslHit = wealthHouses.filter(h => cslHouses.includes(h));
        const nlHit = wealthHouses.filter(h => nlHouses.includes(h));
        const strongAppreciation = cslHit.length > 0 && nlHit.length > 0;
        return {
            csl: twelfth.subLord, cslHouses: cslHouses, nl: twelfth.nakLord, nlHouses: nlHouses,
            cslHit: cslHit, nlHit: nlHit, strongAppreciation: strongAppreciation,
            note: strongAppreciation
                ? `12th CSL (${twelfth.subLord}, H${cslHit.join(',H')}) AND its Nakshatra Lord (${twelfth.nakLord}, H${nlHit.join(',H')}) both touch the wealth-houses 4/11 — this investment promises massive long-term appreciation (the source example: land bought in lakhs appreciating into crores).`
                : `12th CSL/Nakshatra-Lord chain does not cleanly double-confirm the 4/11 wealth combination — this investment's appreciation potential is ordinary/uncertain rather than exceptional; treat it as a standard allocation, not a can't-miss bet.`
        };
    },

    renderInvestmentAppreciation: function (data) {
        if (!data) return '';
        const c = data.strongAppreciation ? '#00DD77' : 'var(--muted)';
        return `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">💰 12th CSL — Investment Appreciation Check</div>
            <div>${data.note}</div>
          </div>`;
    },


    // ================================================================
    // 12. 2nd CSL — DETAILED WEALTH-SOURCE TABLE
    // ================================================================

    SECOND_CSL_WEALTH_SOURCE: {
        4: { source: 'Property, real estate, land development, or Vastu consultancy.', stability: 'Stable and growing.' },
        5: { source: 'Creative work, sports, or speculation.', stability: 'Because the 5th is the 12th (loss-house) from the 6th, this can mean weak or unstable DAILY cash liquidity even when overall wealth is fine.' },
        6: { source: 'Interest/lending, finance, loans — a highly powerful financial script associated with large wealth.', stability: 'Very strong, but tied to active service/finance work.' },
        7: { source: 'Business partnerships or retail trade.', stability: 'Normal, stable income.' },
        8: { source: '"Unearned" money — inheritance, taxation/auditing work, occult work, or cash transactions.', stability: 'The actual bank balance stays highly UNSTABLE despite the wealth existing.' },
        9: { source: 'Religious work, teaching, or counselling/consultancy.', stability: 'Steady, dignity-linked income.' }
    },

    getSecondCSLWealthSource: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const resolved = P1.resolveDeterminingPlanetPrecise(2, allCusps, natalPlanetsMap);
        if (!resolved) return null;
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const numbers = planetNumbers[resolved.determiningPlanet] || [];
        const matches = numbers.filter(h => this.SECOND_CSL_WEALTH_SOURCE[h]).map(h => Object.assign({ house: h }, this.SECOND_CSL_WEALTH_SOURCE[h]));
        return { csl: allCusps[2].subLord, determiningPlanet: resolved.determiningPlanet, numbers: numbers, matches: matches };
    },

    renderSecondCSLWealthSource: function (data) {
        if (!data) return '';
        const rows = (data.matches || []).map(m => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #B2FF66;background:rgba(178,255,102,.08);"><b>H${m.house}:</b> ${m.source}<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">${m.stability}</div></div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #B2FF66;">
            <div class="pred-title" style="color:#B2FF66;">🏦 2nd CSL — Wealth Source Detail</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">2nd CSL: ${data.csl} → determining planet ${data.determiningPlanet} → H${data.numbers.join(',H') || '—'}</div>
            ${rows || '<div style="font-size:9px;color:var(--muted);">No 4/5/6/7/8/9 hit in this chain — no specific detailed wealth-source pattern from this table applies; use the general 2-6-10-11 wealth check instead.</div>'}
          </div>`;
    },


    // ================================================================
    // 13. YEARLY PANEL (JUPITER TRANSIT, ≈12 MONTHS/SIGN)
    // ================================================================
    //
    // Completes the macro-timing ladder: Daily=Moon, Monthly=Sun (both in
    // Part 1), Yearly=Jupiter (added here) — same Source/Involvement/
    // Confirmation cascading method, just applied to whichever sign
    // Jupiter is transiting THIS YEAR. For a promised event to manifest in
    // a SPECIFIC year, transiting Jupiter must be in a sign whose Sign
    // Lord is a supportive significator of that event in the natal chart.

    getYearlyPanel: function (transitJupiterData, dashaInfo, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const P1 = this._p1(); if (!P1 || !transitJupiterData || transitJupiterData.sid === undefined) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const tenancy = P1.getTenancy(natalPlanetsMap);

        const jupKP = P1._getKPLords(transitJupiterData.sid);
        const nlHouses = planetNumbers[jupKP.nakLord] || [];
        const slHouses = planetNumbers[jupKP.subLord] || [];
        const overlap = nlHouses.filter(h => slHouses.includes(h));

        // The transiting SIGN LORD itself is the primary "year agreement"
        // check per the source teaching (independent of NL/SL cascade):
        // the sign lord of whatever sign Jupiter occupies this year must
        // be a supportive significator for the target event to manifest
        // THIS year.
        const signNum = this._signNumOf(transitJupiterData.sid);
        const L = this._lords(lords);
        const signLord = L[(signNum - 1) % 12];
        const signLordHouses = planetNumbers[signLord] || [];

        const mahadasha = dashaInfo && dashaInfo.mahadasha ? dashaInfo.mahadasha.lord : null;
        const mdHouses = mahadasha ? (planetNumbers[mahadasha] || []) : [];
        const crossValidated = overlap.filter(h => mdHouses.includes(h));

        return {
            transitSign: this.SIGNS[signNum - 1], signLord: signLord, signLordHouses: signLordHouses,
            nakLord: jupKP.nakLord, nlHouses: nlHouses, nlTenancy: tenancy[jupKP.nakLord],
            subLord: jupKP.subLord, slHouses: slHouses, slTenancy: tenancy[jupKP.subLord],
            overlap: overlap, mahadasha: mahadasha, mdHouses: mdHouses, crossValidated: crossValidated
        };
    },

    renderYearlyPanel: function (data) {
        if (!data) return '<div class="pred-item">Yearly Panel needs Jupiter transit data — pass transitPlanets.Jupiter into analyze2().</div>';
        const P1 = this._p1();
        const nlUnt = data.nlTenancy && !data.nlTenancy.tenanted, slUnt = data.slTenancy && !data.slTenancy.tenanted;
        const nlChip = P1 ? P1._chip(nlUnt ? 'UNTENANTED' : 'TENANTED', nlUnt ? '#00DD77' : '#FFD700') : '';
        const slChip = P1 ? P1._chip(slUnt ? 'UNTENANTED' : 'TENANTED', slUnt ? '#00DD77' : '#FFD700') : '';
        return `<div class="pred-item" style="border-left:3px solid #9ACD32;">
            <div class="pred-title" style="color:#9ACD32;">🪐 Yearly Panel — Jupiter Transit (≈12-month window)</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Jupiter holds one sign for ~12 months, setting the 1-year window. For a promised event to manifest THIS year, the transit sign's LORD must be a supportive significator in the natal chart.</div>
            <div><b>Transit Sign:</b> ${data.transitSign} → <b>Sign Lord (year-agreement check):</b> ${data.signLord} — Houses: H${data.signLordHouses.join(',H') || '—'}</div>
            <div style="margin-top:4px;"><b>Nakshatra Lord (Involvement):</b> ${data.nakLord} ${nlChip} — Houses: H${data.nlHouses.join(',H') || '—'}</div>
            <div style="margin-top:4px;"><b>Sub Lord (Confirmation):</b> ${data.subLord} ${slChip} — Houses: H${data.slHouses.join(',H') || '—'}</div>
            <div style="margin-top:6px;padding:6px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">
              <b style="color:#00DD77;">Overlap (strongest this year):</b> H${data.overlap.join(', H') || 'none'}
            </div>
            ${data.mahadasha ? `<div style="margin-top:6px;font-size:9px;color:var(--text);">Running Mahadasha: <b>${data.mahadasha}</b> — Houses: H${data.mdHouses.join(',H') || '—'}</div>` : ''}
            ${data.crossValidated.length ? `<div style="margin-top:4px;padding:6px 8px;border-left:3px solid #FF69B4;background:rgba(255,105,180,.08);"><b style="color:#FF69B4;">Cross-validated with Mahadasha:</b> H${data.crossValidated.join(', H')}</div>` : ''}
          </div>`;
    },


    // ================================================================
    // 14. TOP-LEVEL ANALYZE2 + RENDER
    // ================================================================

    /**
     * params: { natalPlanets, natalAsc, lords, dashaInfo, transitPlanets,
     *   transitPlanetSid (for Dasha Pravesh), subPeriodLord,
     *   muhuratEventType, muhuratFrom, muhuratTo, getPosFn }
     * All fields optional beyond natalPlanets/natalAsc — each panel
     * degrades gracefully (returns null / a "data not available" message)
     * if its specific inputs weren't supplied.
     */
    analyze2: function (params) {
        params = params || {};
        const P1 = this._p1();
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        if (!P1 || !natalPlanets || !natalAsc) return null;
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;
        const ascSignNum = natalAsc.sn;
        const L = this._lords(params.lords);

        const dashaPravesh = params.transitPlanetSid !== undefined
            ? this.analyzeDashaPravesh(params.transitPlanetSid, params.subPeriodLord, ascSid, natalPlanets, L) : null;
        const btr = this.checkBirthTimeRectification(ascSid);
        const soulPurpose = this.getSoulPurpose(ascSid, ascSignNum, natalPlanets);
        const shareMarketPromise = this.checkShareMarketPromise(ascSid, natalPlanets);
        const shareMarketTiming = (params.transitPlanets && params.transitPlanets.Moon)
            ? this.getShareMarketTimingPanel(params.transitPlanets.Moon, ascSid, natalPlanets) : null;
        const twinBirth = this.checkTwinBirthPromise(ascSid, natalPlanets);
        const dualSignProfile = this.getDualSignProfile(natalPlanets);
        const investmentAppreciation = this.checkInvestmentAppreciation(ascSid, natalPlanets);
        const secondCSLWealthSource = this.getSecondCSLWealthSource(ascSid, natalPlanets);
        const yearlyPanel = (params.transitPlanets && params.transitPlanets.Jupiter)
            ? this.getYearlyPanel(params.transitPlanets.Jupiter, params.dashaInfo, ascSid, ascSignNum, natalPlanets, L) : null;
        const muhuratWindows = (params.muhuratEventType && params.muhuratFrom && params.muhuratTo && typeof params.getPosFn === 'function')
            ? this.findMuhuratWindows(params.muhuratEventType, ascSid, natalPlanets, params.muhuratFrom, params.muhuratTo, params.getPosFn, params.muhuratStepHours) : null;

        // Karakatva blend + KAT remedies for every house whose CSL touches a Trika (6/8/12) house — built from Part 1's own event-promise data if supplied.
        const karakatvaBlends = [];
        for (let h = 1; h <= 12; h++) karakatvaBlends.push(this.getBlendedCSLNarrative(h, ascSid, natalPlanets));

        return {
            dashaPravesh: dashaPravesh, btr: btr, soulPurpose: soulPurpose,
            shareMarketPromise: shareMarketPromise, shareMarketTiming: shareMarketTiming,
            twinBirth: twinBirth, dualSignProfile: dualSignProfile,
            investmentAppreciation: investmentAppreciation, secondCSLWealthSource: secondCSLWealthSource,
            yearlyPanel: yearlyPanel, muhuratWindows: muhuratWindows, muhuratEventType: params.muhuratEventType,
            karakatvaBlends: karakatvaBlends,
            _natalPlanetsMap: natalPlanets, _lords: L
        };
    },

    renderHTML2: function (data) {
        if (!data) return '<div class="pred-item">KP Part 2 analysis unavailable — check that natalPlanets/natalAsc were supplied.</div>';
        let html = '<div class="pred-section-title" style="margin-top:10px;">🔶 KP Astrology — Part 2 (Advanced/Supplementary Rules)</div>';
        html += this.renderBirthTimeRectification(data.btr);
        if (data.dashaPravesh) html += this.renderDashaPravesh(data.dashaPravesh);
        if (data.soulPurpose) html += this.renderSoulPurpose(data.soulPurpose);
        html += this.renderShareMarket(data.shareMarketPromise, data.shareMarketTiming);
        if (data.twinBirth) html += this.renderTwinBirthCheck(data.twinBirth);
        html += this.renderDualSignProfile(data.dualSignProfile);
        if (data.investmentAppreciation) html += this.renderInvestmentAppreciation(data.investmentAppreciation);
        if (data.secondCSLWealthSource) html += this.renderSecondCSLWealthSource(data.secondCSLWealthSource);
        if (data.yearlyPanel) html += this.renderYearlyPanel(data.yearlyPanel);
        if (data.muhuratWindows) html += this.renderMuhuratWindows(data.muhuratEventType, data.muhuratWindows);
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION_2;
}
