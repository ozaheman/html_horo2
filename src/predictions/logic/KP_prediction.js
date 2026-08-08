/**
 * KP_prediction.js
 *
 * Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Methodology researched and encoded from the source lecture transcripts
 * (Rahul Kaushik's KP Basic Course + supplementary videos). Every rule
 * below is traceable to a specific taught principle; anywhere this module
 * had to fill a gap with a documented, defensible convention (because the
 * source audio was garbled or a full reference table wasn't available),
 * that is called out explicitly in a comment so a KP practitioner can spot
 * and correct it.
 *
 * ============================== CORE RULES =================================
 *
 * 1. HOUSE KARAKAS (KP-specific, differs from classical Parashari in a few
 *    places — most notably EDUCATION is read from the 4th house in KP, not
 *    the 5th). See HOUSE_KARAKAS below.
 *
 * 2. CUSPAL SUB LORD (CSL) — "the Sub Lord of a house cusp is what actually
 *    delivers the PROMISE for that house." A house's cusp longitude is
 *    broken into Nakshatra Lord (NL) → Sub Lord (SL) → Sub-Sub Lord (SSL)
 *    using the standard Vimshottari-proportional sub-division. This module
 *    reuses the app's own `getKPLords(sidLon)` (defined in main.js) for
 *    that math rather than re-deriving it.
 *      NOTE ON CUSPS: true KP practice uses Placidus house cusps (unequal
 *      arcs from oblique ascension). This codebase does not have a
 *      Placidus cusp calculator elsewhere, so this module approximates
 *      each house cusp as EQUAL-HOUSE (Ascendant + (house-1)*30°). This is
 *      a documented approximation, not classical Placidus KP — swap in a
 *      true cuspal longitude here if one becomes available.
 *
 * 3. READING A CSL — "only go 2 levels deep": look at the CSL itself; if
 *    the CSL sits in ITS OWN nakshatra (self-star), use the CSL's own
 *    "numbers" (see #4); otherwise jump to the CSL's STAR LORD and use
 *    THAT planet's numbers instead. Never go a 3rd level deep.
 *
 * 4. "A PLANET'S NUMBERS" — the specific, complete list of houses (1-12)
 *    for which a planet serves as Cuspal Sub Lord anywhere in the chart.
 *    A house's promise exists if its own event-relevant PRIME HOUSE
 *    numbers appear in the determining planet's number list (per rule 3).
 *
 * 5. TENANTED vs UNTENANTED PLANETS (single most powerful KP heuristic
 *    from "सबसे शक्तिशाली भाव" lecture):
 *      Rule 1 — a planet that is NOT the nakshatra lord (star lord) of any
 *               OTHER planet is UNTENANTED (it "owns its own house," most
 *               powerful/stable). A planet that IS star lord of others is
 *               TENANTED (dependent/unstable — "can be evicted").
 *      Rule 2 — even a Tenanted planet is re-classed UNTENANTED if it sits
 *               in ITS OWN nakshatra (self-owned overrides having tenants).
 *      Rule 3 — if two planets mutually exchange nakshatra lordship
 *               (A is NL of B and B is NL of A), BOTH become UNTENANTED
 *               (a fair "house-swap" cancels the tenancy).
 *
 * 6. INDEPENDENT HOUSES — a house whose CSL is an UNTENANTED planet acts
 *    "independently": it delivers its results even when the deeper
 *    nakshatra-level story looks mixed/negative, because an Untenanted
 *    planet's promise isn't hostage to anyone else's chart position
 *    (worked example: Mars ruling the 3rd house independently still gives
 *    3rd-house results in its dasha despite negative star-lord indications).
 *
 * 7. TIMING OF EVENTS — 4-rule method from "समय निर्धारण" lecture:
 *      Rule 1 — the MAHADASHA lord shows WHAT KIND of event/theme is
 *               active in life right now (broad promise).
 *      Rule 2 — the ANTARDASHA (and deeper: Pratyantardasha, Sookshma)
 *               must SUPPORT the theme by reflecting the event's PRIME
 *               HOUSE(S) — see EVENT_PRIME_HOUSES.
 *      Rule 3 — fine-tune the exact window via transits: JUPITER's transit
 *               through the relevant houses pins down the YEAR; the SUN's
 *               transit (≈1 month/sign) pins down the MONTH; the MOON's
 *               transit (≈2.25 days/sign) pins down the DAY. The Lagna/
 *               Ascendant can be used to refine further to the moment.
 *      Rule 4 — cross-verify all of the above together before committing;
 *               when still uncertain, Ruling Planets (day lord, weekday
 *               lord, Moon's sign+star lord, Ascendant's sign+star lord at
 *               the moment of judgment/query) act as a tie-breaker — this
 *               is also the basis of the Horary/Prashna panel below.
 *
 * 8. FRUITFUL SIGNIFICATOR — a planet is a "fruitful" significator of an
 *    event if it occupies the NAKSHATRA of a planet that itself signifies
 *    the required houses, AND that star lord also signifies those houses
 *    at the sub-lord level (a 2-tier occupant+star-lord confirmation).
 *
 * 9. BHAVA CHALIT "HOUSE LORD PLACEMENT" READING — a house's RESULTS are
 *    carried through wherever its HOUSE LORD (rashi lord of that house's
 *    sign) is physically PLACED. Example: 12th lord placed in the 6th ⇒
 *    expenditure/investment happens through 6th-house matters (service,
 *    disease, litigation). Sign-of-placement itself is irrelevant in KP;
 *    only the HOUSE of placement matters.
 *
 * 10. DUAL-LORDSHIP PLANETS (classical Parashari cross-check, included
 *     here as supplementary planet detail) — when one planet rules two
 *     houses, prefer whichever sign is that planet's Moolatrikona sign
 *     (fuller results), THEN weigh which of the two owned houses the
 *     planet is actually PLACED to favour (placement usually outweighs
 *     Moolatrikona in this teacher's practical experience) — judged case
 *     by case, not mechanically.
 *
 * 11. HORARY / PRASHNA — KP's classical 1-249 horary number system maps a
 *     chosen number to a precise zodiacal longitude (used as the Prashna
 *     Ascendant), built from the exact same NL→SL sub-division maths as
 *     rule #2, walked sequentially across the whole zodiac.
 *       NOTE: this module computes that mapping directly from the
 *       Vimshottari sub-division formula (243 raw NL×SL segments spanning
 *       0-360°), which is mathematically identical to Krishnamurti's
 *       published 249-number table in spirit but may not match its exact
 *       historical numbering 1-for-1 (the published table has a few
 *       boundary-merging conventions this module doesn't reproduce).
 *       Treat horary numbers here as internally consistent, not as a
 *       byte-exact reproduction of the classical printed table.
 *     Horary-specific rule: if the query's relevant CSL sits in the
 *     nakshatra of a RETROGRADE planet, the classical answer defaults to
 *     NO / reversed — retrograde matters specifically in horary charts
 *     even though it's not weighted this way for natal dasha reading.
 *
 * Dependencies (checked defensively, degrades gracefully if missing):
 *   - global getKPLords(sidLon)  (main.js)      — NL/SL/SSL math
 *   - global LORDS array or window.LORDS         — sign-index -> rashi lord
 *   - window.GOCHAR                               — reused for chart configs
 *   - global getPos(date)                         — transit positions, for
 *     the timing-of-event transit search
 */

window.KP_PREDICTION = {

    // ===================== 0. HOUSE KARAKAS (KP-specific) =====================

    HOUSE_KARAKAS: {
        1: {
            name: 'Tanu Bhava (Self)',
            karakas: ['Sun'],
            keywords: 'Health, physical body, appearance, overall vitality, self-attitude, priorities in life',
            notes: 'Most important house in KP practice — the person\'s health/vitality underwrites every other house\'s promise. Body=Lagna lord, Mind=Moon, Soul=Sun ("Body-Mind-Soul" triad).'
        },
        2: {
            name: 'Dhana Bhava (Wealth)',
            karakas: ['Jupiter', 'Mercury'],
            keywords: 'Cash liquidity, bank balance, movable wealth, speech, food habits, family (of birth)',
            notes: 'Governs day-to-day financial sustenance and how one speaks.'
        },
        3: {
            name: 'Sahaja Bhava (Siblings/Effort)',
            karakas: ['Mars', 'Mercury'],
            keywords: 'Siblings, courage, marketing, commission-based work, documentation, short travel, agency/franchise business, communication',
            notes: 'Prime house for marketing/commission/agency-franchise businesses and short-distance travel.'
        },
        4: {
            name: 'Sukha Bhava (Comforts/Education in KP)',
            karakas: ['Moon'],
            keywords: 'Home, property, vehicles, mother\'s health, domestic peace, Vaastu work, EDUCATION (KP reads education from H4, not H5)',
            notes: 'KP-specific: Education is judged from the 4th house, departing from classical Parashari\'s 5th-house rule.'
        },
        5: {
            name: 'Putra Bhava (Children/Intellect)',
            karakas: ['Jupiter'],
            keywords: 'Children (esp. first child), creativity, artistic talent, acting, speculation, advisory/solutions work, sports, romance',
            notes: 'Primary house for advisory/consulting-adjacent "solution providers" and creative/artistic income.'
        },
        6: {
            name: 'Roga Bhava (Service/Disease/Debt/Competition)',
            karakas: ['Mars', 'Saturn'],
            keywords: 'Job/service, service-oriented business, doctors, lawyers, disease, enemies, debt/loans, competition/litigation, daily routine, exercise/diet',
            notes: 'One of the 3 houses (6-8-12) said to "run today\'s world." Governs whether you can actually COLLECT money owed for your effort (customer/market payments).'
        },
        7: {
            name: 'Kalatra Bhava (Spouse/Partnerships)',
            karakas: ['Venus'],
            keywords: 'Marriage, spouse, partnerships, daily retail/client-facing business (buy-sell interactions)',
            notes: 'Along with 2nd, a Maraka (life-shortening-timing) house; also the house of daily commercial transactions (e.g. retail).'
        },
        8: {
            name: 'Mrityu/Randhra Bhava (Transformation)',
            karakas: ['Saturn'],
            keywords: 'Longevity, sudden events, surgery, accidents, suffering, addiction, occult, research, inheritance, taxation (incl. GST/audit), illegal/under-the-table money',
            notes: 'One of the 3 houses (6-8-12) running today\'s world. Nearly universally regarded as troublesome for ANY matter it attaches to — "if any house\'s CSL invites the 8th, expect problems there."'
        },
        9: {
            name: 'Bhagya Bhava (Fortune)',
            karakas: ['Jupiter', 'Sun'],
            keywords: 'Luck, father, higher philosophy/religion, long-distance travel, CONSULTANCY/ADVISORY of every kind, higher education, publishing',
            notes: 'The universal house of consultancy — "whatever kind of consultancy you do, it is seen through the 9th house first."'
        },
        10: {
            name: 'Karma Bhava (Career)',
            karakas: ['Sun', 'Saturn', 'Mercury'],
            keywords: 'Career, profession, promotion, honour, father, public standing, trading/stock-related company employment',
            notes: 'Primary house for promotion at work.'
        },
        11: {
            name: 'Labha Bhava (Gains)',
            karakas: ['Jupiter'],
            keywords: 'Gains, income realized, fulfillment of desires, elder siblings, large social/friend circle, stock-trading INCOME (as opposed to working for a trading firm, which is 10th)',
            notes: 'One of the 3 houses (6-8-12... actually Upachaya) said to grow with effort/time.'
        },
        12: {
            name: 'Vyaya Bhava (Loss/Moksha)',
            karakas: ['Saturn', 'Ketu'],
            keywords: 'Expenditure, investment, losses, foreign travel/settlement, moksha/spirituality, bed pleasures, hospitalization',
            notes: 'One of the 3 houses (6-8-12) running today\'s world. Wherever its lord is PLACED shows where money is actually spent/invested.'
        }
    },

    // ===================== 1. EVENT → PRIME/SUPPORTING/NEGATIVE HOUSES =====================
    //
    // "Prime house" = the single most decisive house for that event type
    // (per the Timing-of-Events lecture: "आपसे कहे कोई की प्रॉपर्टी परचेज के
    // लिए प्राइम हाउस कौन सा होगा तो आप कहेंगे प्राइम हाउस चौथा"). Supporting
    // houses reinforce the promise; negative houses (esp. 6-10-12, and 8th
    // for almost anything) work against/delay/break it.
    EVENT_PRIME_HOUSES: {
        marriage: { prime: [7], supporting: [2, 11], negative: [6, 10, 12], note: 'Marriage promise = 2/7/11 combination; 6-10-12 delays/breaks it; 8th anywhere nearby brings complication (e.g. secret relationships, special marriage act).' },
        second_marriage: { prime: [7], supporting: [2, 9, 11], negative: [6, 8, 10, 12], note: 'If 2-7-11 did not fructify for a first marriage, a second marriage is checked via 2-9-11; 6-8-10-12 signals separation/divorce.' },
        divorce_separation: { prime: [6, 10, 12], supporting: [8], negative: [], note: 'Separative combination = 6-10-12 (8th nearby aggravates it further); classically the teacher weighs this over blaming the 1st house alone.' },
        property_purchase: { prime: [4], supporting: [11, 12], negative: [8], note: 'Property purchase — primary house 4th (4/11/12 combination); 4th CSL and its star lord must show 4-11-12 involvement for the promise to be confirmed.' },
        property_sale: { prime: [10], supporting: [3, 5], negative: [], note: 'Property SALE (as opposed to purchase) is read from the 10th CSL — a 3-5-10 combination signals selling.' },
        children: { prime: [5], supporting: [2, 11], negative: [4, 10, 12], note: 'Child-birth promise = 2-5-11 combination (5th prime, esp. for the first child); 4-10-12 signals difficulty/no children. CAVEAT: if the 5th CSL and its star lord are BOTH in a Barren sign (Gemini/Leo/Virgo), even a promise can be hard to fructify without medical help. Twins are suggested when CSL and star lord are both in a Dual sign, especially via Mercury.' },
        job_service: { prime: [6], supporting: [10, 11], negative: [5, 8, 12], note: 'Job/service = 6th house; 6-10-11 favours winning competition/getting hired; 4-5-12 (or 5-8-12) works against it.' },
        promotion: { prime: [10], supporting: [6, 11], negative: [], note: 'Promotion = 10th house.' },
        wealth_income: { prime: [2], supporting: [6, 10, 11], negative: [5, 8, 12], note: 'The single best wealth combination is 2-6-10-11 ("maalamaal" combination). Its mirror-opposite 5-8-12 signifies financial loss/struggle — "what comes with one hand leaves with the other."' },
        competition_litigation: { prime: [6], supporting: [10, 11], negative: [4, 5, 12], note: 'Winning competitions/court cases = 6-10-11; the losing combination is 4-5-12.' },
        foreign_travel: { prime: [12], supporting: [3, 9], negative: [], note: '12th = foreign land/settlement; 3rd = short travel; 9th = long-distance travel.' },
        education: { prime: [4], supporting: [9], negative: [], note: 'KP-specific: primary education house is the 4th (not the 5th as in classical Parashari); 9th governs higher education.' },
        health_disease: { prime: [1], supporting: [6, 8, 12], negative: [], note: '1st = overall health/vitality baseline; a 6-8-12 combination at the 6th CSL/star-lord level signals disease (esp. chronic if repeated); 5-11 signals a healthy/disease-free period.' },
        consultancy_advisory: { prime: [9], supporting: [3, 5], negative: [], note: '9th = consultancy of every kind, universally; 3rd/5th reinforce advisory/solutions work.' },
        debt_loan_recovery: { prime: [6], supporting: [10, 11], negative: [5, 8, 9], note: 'Recovering money owed to you, or securing a loan, needs 6-10-11; a 5-8-9 combination at the 6th CSL/star-lord level signals the money stays stuck.' }
    },

    // Reference to the 6 dashaSeq/dashaYrs used by getKPLords, duplicated
    // here ONLY for the horary-number mapping in section 7 (kept in sync
    // with main.js's getKPLords by construction, not by import).
    DASHA_SEQ: ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'],
    DASHA_YRS: [7, 20, 6, 10, 7, 18, 16, 19, 17],
    NAK_SIZE: 360 / 27,

    KENDRA: [1, 4, 7, 10],
    TRIKONA: [1, 5, 9],
    TRIK: [6, 8, 12],
    MARAKA: [2, 7],

    _mod12: function (h) { return (((h - 1) % 12) + 12) % 12 + 1; },

    _lords: function (lords) {
        return lords || (typeof LORDS !== 'undefined' ? LORDS : (window.LORDS || null));
    },

    /** Reuses the app's own KP math (main.js). Falls back to a local re-derivation if unavailable (kept mathematically identical). */
    _getKPLords: function (sidLon) {
        if (typeof getKPLords === 'function') return getKPLords(sidLon);
        // Fallback re-derivation (only used if main.js's getKPLords isn't loaded)
        const dashaSeq = this.DASHA_SEQ, dashaYrs = this.DASHA_YRS, nakSize = this.NAK_SIZE;
        const lon = ((sidLon % 360) + 360) % 360;
        const nakIdx = Math.floor(lon / nakSize);
        const nlIdx = nakIdx % 9;
        const nakLord = dashaSeq[nlIdx];
        const degInNak = lon % nakSize;
        let acc = 0, slIdx = -1;
        for (let i = 0; i < 9; i++) {
            const ci = (nlIdx + i) % 9;
            acc += (dashaYrs[ci] / 120) * nakSize;
            if (degInNak < acc - 1e-9) { slIdx = ci; break; }
        }
        if (slIdx === -1) slIdx = (nlIdx + 8) % 9;
        const subLord = dashaSeq[slIdx];
        let subStart = 0;
        for (let i = 0; i < 9; i++) {
            const ci = (nlIdx + i) % 9;
            const subSize = (dashaYrs[ci] / 120) * nakSize;
            if (ci === slIdx) break;
            subStart += subSize;
        }
        const subSize = (dashaYrs[slIdx] / 120) * nakSize;
        const degInSub = degInNak - subStart;
        let sslIdx = -1, acc2 = 0;
        for (let i = 0; i < 9; i++) {
            const ci = (slIdx + i) % 9;
            acc2 += (dashaYrs[ci] / 120) * subSize;
            if (degInSub < acc2 - 1e-9) { sslIdx = ci; break; }
        }
        if (sslIdx === -1) sslIdx = (slIdx + 8) % 9;
        const subSubLord = dashaSeq[sslIdx];
        return { nakLord: nakLord, subLord: subLord, subSubLord: subSubLord };
    },

    // ===================== 2. CUSPS + CSL (EQUAL-HOUSE APPROXIMATION) =====================

    /** House cusp longitude (equal-house approximation — see module header). */
    getCuspSid: function (ascSid, houseNum) {
        return (ascSid + (houseNum - 1) * 30) % 360;
    },

    /** All 12 cusps' KP lords in one call: {1:{sid,nakLord,subLord,subSubLord}, ...}. */
    getAllCusps: function (ascSid) {
        const out = {};
        for (let h = 1; h <= 12; h++) {
            const sid = this.getCuspSid(ascSid, h);
            out[h] = Object.assign({ house: h, sid: sid }, this._getKPLords(sid));
        }
        return out;
    },
// ===================== 2½. TRUE BHAVA CHALIT (SRIPATI MID-POINT METHOD) =====================
    //
    // This is a SEPARATE, exact calculation from the §2 equal-house CSL
    // approximation above (that one is a stand-in for true Placidus cusps,
    // used only to drive the KP Cuspal-Sub-Lord math). This section
    // reproduces the classical Sripati/mid-point Bhava Chalit method
    // verbatim:
    //   1. The Ascendant degree is the MIDPOINT (Bhava Madhya) of house 1,
    //      not its start.
    //   2. Every house spans 30°: 15° before its midpoint to 15° after.
    //   3. House h's midpoint = Ascendant + (h-1)*30° (mod 360); its start/
    //      end follow from rule 2.
    //   4. A planet's Bhava (Chalit) house is whichever house's [start,end)
    //      arc its longitude falls into — which can differ from its plain
    //      sign-based (Rashi) house when the planet sits in the first/last
    //      ~15° of a sign ("shift").
    // NOTE on the "whole sign swallowed" idea sometimes described for this
    // method: under this exact equal-30°-per-house model every house
    // boundary is offset from the nearest sign boundary by the SAME
    // constant amount (15° minus the Ascendant's degree-in-sign). Since
    // both the house and the sign are exactly 30° wide, that constant
    // offset always splits a sign across two adjacent houses — it never
    // fully swallows a whole sign into one house (that would need the
    // house to be wider than 30°, or the boundaries to align only some
    // of the time). The only offset-free case is when the Ascendant sits
    // at exactly 15° into its sign (Δ=0), where Bhava houses coincide
    // exactly with signs and NO planet ever shifts.

    _norm360: function (deg) { return ((deg % 360) + 360) % 360; },

    /** Bhava Chalit house boundaries: {house, midpoint, start, end} for all 12 houses. */
    getBhavaChalitCusps: function (ascSid) {
        const out = {};
        for (let h = 1; h <= 12; h++) {
            const mid = this._norm360(ascSid + (h - 1) * 30);
            out[h] = { house: h, midpoint: mid, start: this._norm360(mid - 15), end: this._norm360(mid + 15) };
        }
        return out;
    },

    /** Plain sign-based (Rashi) house of a longitude, given the Ascendant's sign number. */
    _rashiHouseOf: function (lonDeg, ascSignNum) {
        const signNum = Math.floor(this._norm360(lonDeg) / 30);
        return this._mod12(signNum - ascSignNum + 1);
    },

    /** Which Bhava Chalit house a longitude falls in (handles the 360°/0° wraparound arcs). */
    _bhavaHouseOf: function (lonDeg, bhavaCusps) {
        const lon = this._norm360(lonDeg);
        for (let h = 1; h <= 12; h++) {
            const c = bhavaCusps[h];
            if (c.start < c.end) { if (lon >= c.start && lon < c.end) return h; }
            else { if (lon >= c.start || lon < c.end) return h; } // wrapped arc, e.g. start=355°, end=25°
        }
        return null;
    },

    /** Degrees from a longitude to a boundary, shortest way around the circle. */
    _circDist: function (a, b) {
        const d = Math.abs(this._norm360(a) - this._norm360(b));
        return Math.min(d, 360 - d);
    },

    SANDHI_ORB: 1, // degrees — how close to a Bhava junction counts as "borderline" (see Phase 5 sub-rules)

    /**
     * Full recalculation: Bhava Chalit house boundaries + every planet's
     * Bhava house, flagged against its plain Rashi house for "shift", plus
     * a Sandhi (near-junction) warning where the classical sub-rules (A/B)
     * become a judgment call rather than a clean answer.
     */
    getBhavaChalitPlacements: function (ascSid, ascSignNum, natalPlanetsMap) {
        const bhavaCusps = this.getBhavaChalitCusps(ascSid);
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const rows = [];
        planets.forEach(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return;
            const lon = pd.sid;
            const bhavaHouse = this._bhavaHouseOf(lon, bhavaCusps);
            const rashiHouse = pd.house || this._rashiHouseOf(lon, ascSignNum);
            const shifted = (bhavaHouse !== null && rashiHouse !== null && bhavaHouse !== rashiHouse);
            let nearSandhi = false, sandhiNote = null;
            if (bhavaHouse) {
                const c = bhavaCusps[bhavaHouse];
                if (this._circDist(lon, c.start) <= this.SANDHI_ORB || this._circDist(lon, c.end) <= this.SANDHI_ORB) {
                    nearSandhi = true;
                    sandhiNote = `Within ${this.SANDHI_ORB}° of a Bhava Sandhi (house junction) — borderline; some systems push it into the neighbouring house (proximity to the junction), others weigh it by which house's MIDPOINT it sits closer to.`;
                }
            }
            rows.push({ planet: p, longitude: lon, rashiHouse: rashiHouse, bhavaHouse: bhavaHouse, shifted: shifted, nearSandhi: nearSandhi, sandhiNote: sandhiNote });
        });
        return { cusps: bhavaCusps, placements: rows };
    },

    _fmtDeg: function (deg) {
        const signNum = Math.floor(this._norm360(deg) / 30);
        const inSign = this._norm360(deg) % 30;
        return `${inSign.toFixed(2)}° ${this.SIGN_NAMES[signNum]}`;
    },

    renderBhavaChalitCusps: function (bhavaCusps) {
        if (!bhavaCusps) return '';
        const rows = Object.keys(bhavaCusps).map(h => {
            const c = bhavaCusps[h];
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:4px 6px;font-weight:bold;color:#00CED1;">H${c.house}</td>
                <td style="padding:4px 6px;">${this._fmtDeg(c.start)}</td>
                <td style="padding:4px 6px;font-weight:bold;">${this._fmtDeg(c.midpoint)}</td>
                <td style="padding:4px 6px;">${this._fmtDeg(c.end)}</td>
              </tr>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#00CED1;font-size:10.5px;font-weight:bold;">📏 Bhava Chalit Boundaries (Sripati Mid-Point Method)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Ascendant = Bhava Madhya (midpoint) of House 1; every house spans 15° before to 15° after its midpoint.</div>
                  <div style="overflow-x:auto;margin-top:6px;">
                  <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                    <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                      <th style="padding:4px 6px;">House</th><th style="padding:4px 6px;">Start</th><th style="padding:4px 6px;">Midpoint</th><th style="padding:4px 6px;">End</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                  </table>
                  </div>
                </details>`;
    },

    renderBhavaChalitPlacements: function (bcData) {
        if (!bcData || !bcData.placements || !bcData.placements.length) return '';
        const rows = bcData.placements.map(r => {
            const c = r.shifted ? '#FF9F43' : '#00DD77';
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b>${r.planet}</b> <span style="font-size:8.5px;color:var(--muted);">${this._fmtDeg(r.longitude)}</span>
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">
                  Rashi (sign-based) house: <b>H${r.rashiHouse}</b> &nbsp;→&nbsp; Bhava Chalit house: <b style="color:${c};">H${r.bhavaHouse}</b>
                  ${r.shifted ? this._chip('SHIFTED', '#FF9F43') : this._chip('NO SHIFT', '#00DD77')}
                  ${r.nearSandhi ? this._chip('NEAR SANDHI', '#FF4477') : ''}
                </div>
                ${r.shifted ? `<div style="font-size:8.5px;color:#FF9F43;margin-top:2px;">A planet's period (Dasha) can lean toward its BHAVA house's results here, not just its Rashi house's — worth cross-checking against real-life events per the "resolve contradictions" guidance.</div>` : ''}
                ${r.sandhiNote ? `<div style="font-size:8px;color:#FF4477;margin-top:2px;">⚠ ${r.sandhiNote}</div>` : ''}
              </div>`;
        }).join('');
        const shiftedCount = bcData.placements.filter(r => r.shifted).length;
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#00CED1;font-size:10.5px;font-weight:bold;">🔄 Bhava Chalit Planet Placements (${shiftedCount} shifted vs. Rashi chart)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">The Rashi chart stays primary for sign-based factors (dignity, aspects, relationships); Bhava Chalit house placement is used to sharpen WHICH house's life-themes a planet's period actually plays out through, especially for planets in the first/last ~15° of a sign.</div>
                  ${rows}
                </details>`;
    },
    // ===================== 3. "A PLANET'S NUMBERS" (reverse CSL lookup) =====================

    /**
     * For every planet, the full list of houses (1-12) for which it is the
     * Cuspal Sub Lord anywhere in the chart — "the numbers a planet gives."
     */
    getPlanetNumbers: function (allCusps) {
        const numbers = {};
        Object.keys(allCusps).forEach(h => {
            const subLord = allCusps[h].subLord;
            (numbers[subLord] = numbers[subLord] || []).push(Number(h));
        });
        Object.keys(numbers).forEach(p => numbers[p].sort((a, b) => a - b));
        return numbers;
    },

    // ===================== 4. CSL 2-LEVEL "PROMISE" READ =====================

    /**
     * Resolves the FINAL determining planet for a house's promise, per the
     * "only 2 levels deep" rule: if the CSL sits in its own nakshatra, use
     * the CSL itself; otherwise use the CSL's STAR LORD.
     */
    resolveDeterminingPlanet: function (houseNum, allCusps) {
        const cusp = allCusps[houseNum];
        if (!cusp) return null;
        const csl = cusp.subLord;
        const cslIsSelfStarred = (cusp.nakLord === csl); // CSL sits in its own nakshatra
        const determiningPlanet = cslIsSelfStarred ? csl : cusp.nakLord;
        // NOTE: cusp.nakLord here is the NL of the cusp's OWN longitude, not
        // of the CSL planet's placement. The "CSL sits in its own star"
        // check classically refers to whether the CSL PLANET (wherever it
        // is natally placed) sits in its own nakshatra — see
        // resolveDeterminingPlanetPrecise() below for that fuller version,
        // which needs the natal planet positions and is used by
        // checkEventPromise().
        return { csl: csl, cslSelfStarred: cslIsSelfStarred, determiningPlanet: determiningPlanet };
    },

    /**
     * Fuller, correct version: checks whether the CSL PLANET's own natal
     * placement sits in its own nakshatra (self-star) — not the cusp's
     * longitude's nakshatra. This is the version actually used for the
     * promise check.
     */
    resolveDeterminingPlanetPrecise: function (houseNum, allCusps, natalPlanetsMap) {
        const cusp = allCusps[houseNum];
        if (!cusp || !natalPlanetsMap) return null;
        const csl = cusp.subLord;
        const cslPlanetData = natalPlanetsMap[csl];
        let cslOwnStarLord = null, cslSelfStarred = false;
        if (cslPlanetData && cslPlanetData.sid !== undefined) {
            const cslKP = this._getKPLords(cslPlanetData.sid);
            cslOwnStarLord = cslKP.nakLord;
            cslSelfStarred = (cslOwnStarLord === csl);
        }
        const determiningPlanet = cslSelfStarred ? csl : (cslOwnStarLord || csl);
        return { csl: csl, cslOwnStarLord: cslOwnStarLord, cslSelfStarred: cslSelfStarred, determiningPlanet: determiningPlanet };
    },

    /**
     * THE precise L1/L2/L3 significator chain for a planet's OWN natal/
     * transit placement (used both for house-promise reading AND for
     * horary case-study-style answers, e.g. "Sun's L1 shows house 4, L2
     * shows house 5"):
     *   L1 = the planet's own STAR LORD (nakshatra lord of its placement)
     *        -> "the house(s) L1 shows" = L1's OWN numbers (which houses
     *        L1 is CSL of anywhere in the chart).
     *   L2 = the planet's own SUB LORD (sub lord of its placement, one
     *        level deeper than the star lord) -> L2's own numbers.
     *   L3 = the planet's own SUB-SUB LORD -> L3's own numbers.
     * Rule of thumb from the source lectures: if a required prime-house
     * number shows up at BOTH L1 and L2, the promise is strongly confirmed.
     */
    getL1L2Chain: function (planet, ascSid, planetsMap) {
        const pd = planetsMap && planetsMap[planet];
        if (!pd || pd.sid === undefined) return null;
        const kp = this._getKPLords(pd.sid);
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        return {
            planet: planet,
            L1_planet: kp.nakLord, L1_numbers: planetNumbers[kp.nakLord] || [],
            L2_planet: kp.subLord, L2_numbers: planetNumbers[kp.subLord] || [],
            L3_planet: kp.subSubLord, L3_numbers: planetNumbers[kp.subSubLord] || []
        };
    },

    // ===================== 4½. THREE GOLDEN RULES (Untenanted/Tenanted CLAIMS) =====================
    //
    // From "सबसे शक्तिशाली भाव": a planet's "normal script" (its own CSL
    // numbers) can UNDERSTATE what it actually delivers in its dasha. These
    // 3 rules surface EXTRA house-claims hiding in the Tenanted/Untenanted
    // status of every planet — explaining results (wealth, status,
    // children) that show up in a dasha whose lord's plain script didn't
    // mention that house at all.
    //   Rule 1 — an UNTENANTED planet that becomes a house's CSL is that
    //            house's STRONGEST claimant (already surfaced by
    //            getIndependentHouses(), included here too for completeness).
    //   Rule 2 — a TENANTED planet (sits in another's nakshatra) inherits
    //            an extra claim on any house for which ITS OWN star lord
    //            is the Sub Lord.
    //   Rule 3 — an UNTENANTED planet that is NOT itself a CSL of any house
    //            but IS the star lord of some house's CSL, still becomes a
    //            strong claimant of that house.
    getGoldenRuleClaims: function (ascSid, natalPlanetsMap) {
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const tenancy = this.getTenancy(natalPlanetsMap);
        const claims = {}; // planet -> [{house, rule, reason}]
        const addClaim = (planet, house, rule, reason) => { (claims[planet] = claims[planet] || []).push({ house: house, rule: rule, reason: reason }); };

        for (let h = 1; h <= 12; h++) {
            const csl = allCusps[h].subLord;
            const t = tenancy[csl];
            if (!t) continue;

            // Rule 1: untenanted CSL = strongest claimant of its own house (restated for completeness)
            if (!t.tenanted) {
                addClaim(csl, h, 1, `${csl} is Untenanted and is the CSL of house ${h} — strongest claimant (Rule 1).`);
            }

            // Rule 3: untenanted planet that is star-lord of this CSL (even if never itself a CSL)
            const cslPlanetData = natalPlanetsMap[csl];
            if (cslPlanetData && cslPlanetData.sid !== undefined) {
                const cslStarLord = this._getKPLords(cslPlanetData.sid).nakLord;
                const starLordTenancy = tenancy[cslStarLord];
                if (cslStarLord && cslStarLord !== csl && starLordTenancy && !starLordTenancy.tenanted) {
                    addClaim(cslStarLord, h, 3, `${cslStarLord} is Untenanted and is the star lord of house ${h}'s CSL (${csl}) — strong claimant (Rule 3), even though ${cslStarLord} may not be a CSL of any house itself.`);
                }
            }
        }

        // Rule 2: every TENANTED planet inherits the numbers of its own star lord (if that star lord is itself a Sub Lord/CSL somewhere)
        Object.keys(tenancy).forEach(planet => {
            const t = tenancy[planet];
            if (!t || !t.tenanted) return;
            const starLord = t.starLord;
            const starLordNumbers = planetNumbers[starLord] || [];
            starLordNumbers.forEach(h => addClaim(planet, h, 2, `${planet} is Tenanted (sits in ${starLord}'s nakshatra), and ${starLord} is the CSL of house ${h} — ${planet} inherits a claim on house ${h} (Rule 2).`));
        });

        return claims;
    },


    /**
     * THE core promise check: does the chart promise event `eventType`?
     * Combines rules #3 and #4 — checks whether the event's PRIME (and
     * optionally supporting) house numbers appear in the determining
     * planet's number-list for the event's own prime house's CSL chain.
     */
    checkEventPromise: function (eventType, ascSid, natalPlanetsMap, lords) {
        const ev = this.EVENT_PRIME_HOUSES[eventType];
        if (!ev) return null;
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);

        const primeHouse = ev.prime[0];
        const resolved = this.resolveDeterminingPlanetPrecise(primeHouse, allCusps, natalPlanetsMap);
        if (!resolved) return null;

        const detPlanet = resolved.determiningPlanet;
        const detNumbers = planetNumbers[detPlanet] || [];

        // L1/L2 chain on the CSL planet itself (the case-study method:
        // "Sun's L1 shows house 4, L2 shows house 5") — a second,
        // independent confirmation line alongside the CSL->star-lord jump above.
        const chain = this.getL1L2Chain(allCusps[primeHouse].subLord, ascSid, natalPlanetsMap);
        const l1Matches = chain ? ev.prime.filter(h => chain.L1_numbers.includes(h)) : [];
        const l2Matches = chain ? ev.prime.filter(h => chain.L2_numbers.includes(h)) : [];
        const chainConfirms = l1Matches.length > 0 && l2Matches.length > 0;

        // Golden-rule extra claims on the prime house (Rules 1-3) for any
        // planet, surfacing dasha periods that wouldn't otherwise show promise.
        const goldenClaims = this.getGoldenRuleClaims(ascSid, natalPlanetsMap);
        const goldenClaimants = Object.keys(goldenClaims).filter(p => goldenClaims[p].some(c => ev.prime.includes(c.house)));

        const matchedPrime = ev.prime.filter(h => detNumbers.includes(h));
        const matchedSupporting = (ev.supporting || []).filter(h => detNumbers.includes(h));
        const matchedNegative = (ev.negative || []).filter(h => detNumbers.includes(h));
        const invitesEighth = detNumbers.includes(8);

        const promised = matchedPrime.length > 0 || chainConfirms || goldenClaimants.length > 0;
        let strength = 'no promise found';
        if (promised && matchedNegative.length === 0) strength = (matchedSupporting.length > 0 || chainConfirms) ? 'strong promise' : 'promise present';
        else if (promised && matchedNegative.length > 0) strength = 'promise present but contested (negative houses also touched)';

        return {
            eventType: eventType, primeHouse: primeHouse, cusp: allCusps[primeHouse],
            resolved: resolved, determiningPlanet: detPlanet, determiningPlanetNumbers: detNumbers,
            chain: chain, l1Matches: l1Matches, l2Matches: l2Matches, chainConfirms: chainConfirms,
            goldenClaimants: goldenClaimants,
            matchedPrime: matchedPrime, matchedSupporting: matchedSupporting, matchedNegative: matchedNegative,
            invitesEighth: invitesEighth, promised: promised, strength: strength, eventInfo: ev
        };
    },

    /** Runs checkEventPromise() for every known event type at once. */
    checkAllEventPromises: function (ascSid, natalPlanetsMap, lords) {
        const out = {};
        Object.keys(this.EVENT_PRIME_HOUSES).forEach(evt => { out[evt] = this.checkEventPromise(evt, ascSid, natalPlanetsMap, lords); });
        return out;
    },

    // ===================== 5. TENANTED / UNTENANTED PLANETS =====================

    /**
     * Implements the 3 rules from "सबसे शक्तिशाली भाव": builds the natal
     * nakshatra-lord (star-lord) table, finds who is star-lord OF whom,
     * applies the self-star override, and the nakshatra-exchange override.
     */
    getTenancy: function (natalPlanetsMap) {
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const starLordOf = {}; // planet -> its own nakshatra lord
        planets.forEach(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return;
            starLordOf[p] = this._getKPLords(pd.sid).nakLord;
        });

        // Rule 1: who is star-lord OF others (reverse lookup) -> tenants list
        const tenantsOf = {}; // landlord -> [tenant planets living in its star]
        planets.forEach(p => {
            const nl = starLordOf[p];
            if (!nl) return;
            (tenantsOf[nl] = tenantsOf[nl] || []).push(p);
        });

        const results = {};
        planets.forEach(p => {
            if (!starLordOf[p]) { results[p] = null; return; }
            const hasTenants = !!(tenantsOf[p] && tenantsOf[p].length);
            let tenanted = hasTenants;
            let reason = hasTenants
                ? `${p} is nakshatra lord (landlord) for: ${tenantsOf[p].join(', ')} — Rule 1: TENANTED.`
                : `${p} is nakshatra lord of no other planet — Rule 1: UNTENANTED (owns its own house).`;

            // Rule 2: self-star override
            if (hasTenants && starLordOf[p] === p) {
                tenanted = false;
                reason += ` However ${p} sits in its OWN nakshatra — Rule 2 override: reclassified UNTENANTED (self-owned).`;
            }

            // Rule 3: nakshatra exchange override
            const partner = starLordOf[p];
            if (hasTenants && partner && partner !== p && starLordOf[partner] === p) {
                tenanted = false;
                reason += ` ${p} and ${partner} mutually exchange nakshatra lordship — Rule 3 override: both reclassified UNTENANTED (nakshatra exchange).`;
            }

            results[p] = { planet: p, starLord: starLordOf[p], tenants: tenantsOf[p] || [], tenanted: tenanted, reason: reason };
        });
        return results;
    },

    // ===================== 6. INDEPENDENT HOUSES =====================

    /**
     * A house whose CSL is an UNTENANTED planet delivers its results
     * "independently" of deeper nakshatra-level obstacles.
     */
    getIndependentHouses: function (ascSid, natalPlanetsMap, lords) {
        const allCusps = this.getAllCusps(ascSid);
        const tenancy = this.getTenancy(natalPlanetsMap);
        const out = [];
        for (let h = 1; h <= 12; h++) {
            const csl = allCusps[h].subLord;
            const t = tenancy[csl];
            if (t && !t.tenanted) {
                out.push({ house: h, csl: csl, reason: `House ${h}'s CSL (${csl}) is Untenanted — ${t.reason} This house acts INDEPENDENTLY: it will deliver its results during ${csl}'s periods even if deeper star-lord indications look mixed.` });
            }
        }
        return out;
    },

    // ===================== 7. CLASSICAL 4-LEVEL SIGNIFICATORS (supplementary) =====================

    /**
     * Standard KP significator method (4 levels, strongest to weakest):
     *   1. Planets occupying the house
     *   2. Planets occupying the nakshatra of the house's occupants
     *   3. The house's (rashi) lord
     *   4. Planets occupying the nakshatra of the house's lord
     */
    getSignificators: function (houseNum, natalPlanetsMap, ascSignNum, lords) {
        const L = this._lords(lords);
        const occupants = Object.keys(natalPlanetsMap).filter(p => natalPlanetsMap[p] && natalPlanetsMap[p].house === houseNum);
        const starLordOfOccupants = new Set();
        occupants.forEach(p => {
            const pd = natalPlanetsMap[p];
            if (pd && pd.sid !== undefined) starLordOfOccupants.add(this._getKPLords(pd.sid).nakLord);
        });
        const houseLord = L ? L[(ascSignNum + houseNum - 1) % 12] : null;
        let starLordOfHouseLord = null;
        if (houseLord && natalPlanetsMap[houseLord] && natalPlanetsMap[houseLord].sid !== undefined) {
            starLordOfHouseLord = this._getKPLords(natalPlanetsMap[houseLord].sid).nakLord;
        }
        return {
            house: houseNum,
            level1_occupants: occupants,
            level2_starLordOfOccupants: Array.from(starLordOfOccupants),
            level3_houseLord: houseLord,
            level4_starLordOfHouseLord: starLordOfHouseLord
        };
    },

    /**
     * PRIMARY rule (from "समय निर्धारण"): "Untenanted Planet ही Fruitful
     * Significator बन सकता है" — an Untenanted planet that signifies a
     * house (via occupancy, house-lordship, OR the Golden Rule claims) is
     * the TRUE fruitful significator for it, because its promise isn't
     * hostage to any other planet's placement. Tenanted planets that
     * signify the same house are listed too, but flagged as weaker/
     * dependent significators (supplementary occupant+star-lord check).
     */
    getFruitfulSignificators: function (houseNum, natalPlanetsMap, ascSignNum, lords) {
        const sig = this.getSignificators(houseNum, natalPlanetsMap, ascSignNum, lords);
        const signifyingPlanets = new Set([...sig.level1_occupants, sig.level3_houseLord].filter(Boolean));
        const tenancy = this.getTenancy(natalPlanetsMap);
        const fruitful = [];
        const supplementary = [];
        Object.keys(natalPlanetsMap).forEach(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return;
            const myStarLord = this._getKPLords(pd.sid).nakLord;
            if (signifyingPlanets.has(myStarLord)) {
                const t = tenancy[p];
                const entry = { planet: p, occupiesStarOf: myStarLord, reason: `${p} occupies the nakshatra of ${myStarLord}, which signifies house ${houseNum}.` };
                if (t && !t.tenanted) {
                    entry.reason += ` ${p} is UNTENANTED — this makes it the TRUE fruitful significator (its promise doesn't depend on any other planet).`;
                    fruitful.push(entry);
                } else {
                    entry.reason += ` ${p} is Tenanted — a weaker/dependent significator, listed for completeness.`;
                    supplementary.push(entry);
                }
            }
        });
        // signifying planets that are themselves Untenanted are also direct fruitful significators
        signifyingPlanets.forEach(p => {
            const t = tenancy[p];
            if (t && !t.tenanted && !fruitful.some(f => f.planet === p)) {
                fruitful.push({ planet: p, occupiesStarOf: null, reason: `${p} directly signifies house ${houseNum} (as occupant or house lord) and is UNTENANTED — true fruitful significator.` });
            }
        });
        return { house: houseNum, significators: sig, fruitfulSignificators: fruitful, supplementarySignificators: supplementary };
    },

    // ===================== 8. BHAVA CHALIT "HOUSE LORD PLACEMENT" READING =====================

    /**
     * Rich, per-lord interpretive tables from Section 14 of the source
     * notes ("भावेश की स्थिति के अनुसार फलादेश") — for the 8 lords the
     * lectures gave detailed placement-by-placement readings for. Houses
     * not covered here fall back to the generic template in
     * getHouseLordPlacements().
     */
    HOUSE_LORD_PLACEMENT_TABLE: {
        1: { // Lagnesh — nature/career inclination
            9: 'Knowledge/wisdom-driven nature — religiosity expressed as ethics and good judgement, not showmanship.',
            10: 'Career-oriented life — thinks about career morning to night; also builds an authoritative nature.',
            11: 'Highly ambitious — many desires bring some restlessness too; socially/social-media active.',
            12: 'Ups and downs in health or in international business; isolation-loving nature, inclination toward yoga/meditation, foreign settlement yoga.'
        },
        2: { // 2nd lord — source of wealth
            1: 'Wealth through own effort/body/labour.', 2: 'Family business, gems-jewellery, banking work.',
            3: 'Commission, franchise/agency, tour-travel, documentation.', 4: 'Property, education, vehicles, hospitality industry.',
            5: 'Advisory/consulting, giving remedies (relevant for astrologers).', 6: 'Lending money (finance work), service, disease-related medical work, litigation.',
            7: 'Handling others\' money (managing investments), running a chit-fund/committee, tax consultancy.', 8: 'Same as 7 — handling others\' money, secretive financial work.',
            9: 'Higher education, consultancy, teaching/professorship, publishing.', 10: 'Own profession/government.',
            11: 'Social circle.', 12: 'Investment, or by going abroad/far from home.'
        },
        3: { // 3rd lord — inclination/attraction
            1: 'Excessive focus on own health/body — always alert about health.', 2: 'Constant attraction toward earning money.',
            4: 'Inclination toward expensive cars/homes/luxury.', 5: 'Creativity, acting, sports, inclination to study.',
            6: 'Sympathy toward the underprivileged/exploited class.', 7: 'Attraction toward the opposite sex, tendency toward affairs.',
            8: 'Strong desire to know secrets/occult/tantra, hidden wealth.', 9: 'Inclination toward higher learning.',
            10: 'Attraction toward status/authority.', 11: 'Inclination to network, sociable nature.', 12: 'Attraction to expensive things (buys without checking price), tendency to spend and travel abroad.'
        },
        4: { // 4th lord — source of property
            1: 'Building property through one\'s own efforts.', 3: 'Property built through hard work.',
            4: 'Strong foundation — property comes without much effort.', 5: 'Property received after the first child.',
            6: 'Property purchased via loan; possibility of property disputes/litigation.', 7: 'Property after marriage — in spouse\'s name or jointly.',
            8: 'Ancestral/inherited property.', 9: 'Property through fortune/father\'s support, or in father\'s name.',
            10: 'Property grows alongside career progress.', 12: 'Property abroad, or a signal of property loss.'
        },
        7: { // 7th lord — nature of marriage
            1: 'Marriage through one\'s own efforts.', 2: 'Marriage via family recommendation.', 3: 'Marriage through advertisement/a mediator.',
            4: 'Spouse found in one\'s own city.', 5: 'Love marriage.', 6: 'Spouse may have a health issue, or spouse from a medical field.',
            8: 'Trouble/problems in married life, possibility of secret relationships.', 9: 'Idealistic spouse, religious inclination.',
            10: 'Career-oriented spouse.', 11: 'Fulfilment of desires after marriage, socially active spouse.',
            12: 'Signals separation/divorce — Utilization remedy: marrying someone of a different culture/background can positively use this 12th-house energy.'
        },
        8: { // 8th lord — root cause of suffering
            1: 'Self-made mistakes cause trouble.', 2: 'Family and money/bank-related causes.', 3: 'Carelessness in documentation causes trouble.', 4: 'Home/property-related causes.'
        },
        9: { // 9th lord — source of luck
            1: 'Lucky from birth.', 2: 'Lucky in money matters.', 3: 'Travel is lucky for you.', 4: 'Luck favours you at your native place.',
            5: 'Children are lucky for you.', 6: 'Employees are lucky for you.', 7: 'Spouse proves lucky.', 9: 'Strong foundation of luck, fortune rises through siblings.',
            10: 'Luck favours your profession.', 11: 'Luck comes through your social circle.', 12: 'Luck lies away from home — abroad or in a different environment/culture.'
        },
        10: { // 10th lord — field of profession
            1: 'Work connected to the body/personality — physiotherapist, modelling, psychiatrist, etc.', 2: 'Jewellery, family business, banking.',
            3: 'Tour-travel, commission agent, agency business.', 4: 'Education, property, vehicles, hospitality.',
            6: 'Service sector (including consulting/influencing) — solving problems related to disease, debt and competition.'
        }
    },

    /** For every house, where its (rashi) LORD is physically placed, and the interpretive template that implies. */
    getHouseLordPlacements: function (ascSignNum, natalPlanetsMap, lords) {
        const L = this._lords(lords);
        const out = [];
        for (let h = 1; h <= 12; h++) {
            const houseLord = L ? L[(ascSignNum + h - 1) % 12] : null;
            const pd = houseLord ? natalPlanetsMap[houseLord] : null;
            const placedHouse = pd ? pd.house : null;
            const specific = (this.HOUSE_LORD_PLACEMENT_TABLE[h] || {})[placedHouse];
            const reading = placedHouse
                ? (specific ? `House ${h}'s lord (${houseLord}) sits in house ${placedHouse}: ${specific}` : `House ${h}'s lord (${houseLord}) sits in house ${placedHouse} — house ${h}'s results/priorities are carried through and expressed via house ${placedHouse}'s matters.`)
                : null;
            out.push({ house: h, houseLord: houseLord, placedInHouse: placedHouse, specificReading: specific || null, reading: reading });
        }
        return out;
    },

    // ===================== 8½. THIRD HOUSE (SAHAJA BHAVA) — DEDICATED ANALYSIS =====================
    //
    // Built specifically from the "Karma Alignment Technique — Dhan Prapti
    // ke Upaay" lecture, which worked through concrete examples of what a
    // house's CSL showing a particular house AT THE L1 (STAR LORD) LEVEL
    // actually means in practice, and how to respond via the Alignment
    // principle (align with what's written, rather than fight it) instead
    // of a generic remedy. The 3rd house got the most detailed treatment
    // in that lecture, so it anchors this table — a few other houses'
    // CSL/L1 combinations that came up in the same discussion are included
    // too, since the METHOD (not just the 3rd-house content) generalizes.
    //
    // NOTE: this is a DIFFERENT technique from HOUSE_LORD_PLACEMENT_TABLE
    // above (which reads where a house's RASHI LORD physically sits).
    // This one reads what house number appears at a CSL's own STAR LORD
    // (L1) / SUB LORD (L2) level — i.e. it uses getL1L2Chain() on the
    // house's Cuspal Sub Lord itself.
    CSL_L1_INTERPRETATIONS: {
        3: {
            6: {
                meaning: 'Hostility/friction with younger siblings.',
                alignment: 'Not a fate to accept passively — like the "maintain safe distance" sign posted on the vehicle ahead of you on the road, keep an appropriate emotional/physical DISTANCE (boundary) between yourself and your younger siblings. The friction is largely avoidable once that boundary is respected.'
            },
            8: {
                meaning: 'Manipulation through communication/talking — you will either be manipulated by others through words, or you will (consciously or not) manipulate others through your own words. Excess/careless talking specifically invites complications here.',
                alignment: 'Practice "Word Transformation": the same information can be delivered destructively or gently — reframe negative statements into positive phrasing (classic example: instead of a blunt "won\'t survive past 70-72", say "I don\'t see anything stopping a long life before 70-72" — same content, opposite energetic charge, like flipping "मरा मरा" into "राम राम"). Manipulation itself is neither inherently good nor bad — its ethics are decided entirely by INTENT, not the act (per the Mahabharata example the lecture uses). Speak less, speak carefully.'
            }
        },
        4: {
            6: {
                meaning: 'Relationship with mother does not stay smooth by default.',
                alignment: 'This is a karmic guideline, not a verdict against you or your mother — maintain clear BOUNDARIES with her (this is not about opposing her); the relationship stabilizes once the boundary is respected.'
            }
        },
        6: {
            7: {
                meaning: 'A relationship may develop with an employee/colleague; a possible reproductive-organ-related health issue; possible business partnership with an employee; some spouse-related tension is also possible since both 6th and 7th get engaged together.',
                alignment: 'Discipline in how you interact with people — especially at work — is the single most important practice here; with clear limits in place, none of the above need cause real trouble.'
            },
            9: {
                meaning: 'Deep respect for the underprivileged/employee class; very good for holding a steady job, but conflict with employees/subordinates if distance isn\'t maintained.',
                alignment: 'Keep an appropriate distance from employees/subordinates even while respecting them — closeness without boundaries invites conflict. A related point from the same teaching: worldly wisdom actually comes from keeping some distance FROM the world, not from immersing fully in it.'
            }
        },
        9: {
            6: {
                meaning: 'Relationship with father does not stay smooth by default — without boundaries, the father can come to be seen as the most difficult person in your life.',
                alignment: 'Maintain clear boundaries with your father; this is a karmic guideline for this life, not a call to oppose him.'
            }
        },
        12: {
            3: {
                meaning: 'A deep restlessness with staying confined in one place — the person craves movement/travel/relocation ("the 3rd house doesn\'t want four walls").',
                alignment: 'Embrace travel and change of place deliberately — don\'t stay too long in one home/city (the lecture suggests roughly a year is often enough before the restlessness returns). This is literally where FREEDOM will be felt for this person, rather than by chasing some abstract "ultimate freedom."'
            }
        }
    },

    /**
     * Generic reader for the CSL_L1_INTERPRETATIONS table above: for a
     * given house's CSL, checks whether its L1 (star lord's own numbers)
     * or L2 (sub lord's own numbers) — via getL1L2Chain() — land on a
     * house for which a specific interpretation has been recorded.
     */
    getCSL_L1_Interpretation: function (houseNum, ascSid, natalPlanetsMap) {
        const allCusps = this.getAllCusps(ascSid);
        const csl = allCusps[houseNum].subLord;
        const chain = this.getL1L2Chain(csl, ascSid, natalPlanetsMap);
        if (!chain) return [];
        const table = this.CSL_L1_INTERPRETATIONS[houseNum] || {};
        const hits = [];
        chain.L1_numbers.forEach(h => {
            if (table[h]) hits.push({ level: 'L1', house: h, starLordPlanet: chain.L1_planet, meaning: table[h].meaning, alignment: table[h].alignment });
        });
        chain.L2_numbers.forEach(h => {
            if (table[h] && !hits.some(x => x.house === h)) hits.push({ level: 'L2', house: h, starLordPlanet: chain.L2_planet, meaning: table[h].meaning, alignment: table[h].alignment });
        });
        return hits;
    },

    /**
     * Dedicated Third House (Sahaja Bhava) deep-dive: karakas, CSL chain,
     * determining planet, Tenanted/Untenanted status of that CSL,
     * Independent-House check, fruitful significators, the House-Lord
     * placement reading, business-suitability note, and the specific
     * CSL/L1 interpretive readings from the table above.
     */
    getThirdHouseAnalysis: function (ascSid, ascSignNum, natalPlanetsMap, lords) {
        const explored = this.exploreHouse(3, ascSid, ascSignNum, natalPlanetsMap, lords);
        const chain = this.getL1L2Chain(explored.resolved.csl, ascSid, natalPlanetsMap);
        const interpretations = this.getCSL_L1_Interpretation(3, ascSid, natalPlanetsMap);
        const goldenClaims = this.getGoldenRuleClaims(ascSid, natalPlanetsMap);
        const goldenClaimants = Object.keys(goldenClaims).filter(p => goldenClaims[p].some(c => c.house === 3));

        return {
            house: 3, karaka: this.HOUSE_KARAKAS[3], cusp: explored.cusp,
            resolved: explored.resolved, chain: chain, interpretations: interpretations,
            independent: explored.independent, significators: explored.significators,
            lordPlacement: explored.lordPlacement, goldenClaimants: goldenClaimants,
            businessNote: 'The 3rd house governs marketing, commission-based work, agency/franchise business, documentation, and short travel. If the 3rd house is strongly involved in the chart (occupied, or its CSL/determining planet shows favourable numbers), setting up a business/manufacturing location AWAY from one\'s birth-place/residence is classically considered advantageous for this house\'s significations.'
        };
    },

    renderThirdHouseAnalysis: function (data) {
        if (!data) return '';
        const c = data.independent ? '#00DD77' : '#8899AA';
        const interpRows = data.interpretations.length
            ? data.interpretations.map(i => `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #FF9F43;background:rgba(255,159,67,.08);">
                <b style="color:#FF9F43;">${i.level} → House ${i.house}</b> <span style="font-size:8.5px;color:var(--muted);">(via ${i.starLordPlanet})</span>
                <div style="font-size:9.5px;color:var(--text);opacity:.9;margin-top:2px;"><b>Meaning:</b> ${i.meaning}</div>
                <div style="font-size:9px;color:#00DD77;margin-top:3px;"><b>Alignment (not a generic remedy):</b> ${i.alignment}</div>
              </div>`).join('')
            : `<div style="font-size:9px;color:var(--muted);">No recorded CSL/L1 combination matched for this chart — the 3rd house here doesn't trigger any of the specific readings from the source lecture; fall back to the general House Explorer / Event Promise sections above.</div>`;

        return `<div class="pred-item" style="border-left:3px solid #FF9F43;margin-top:10px;">
                   <div class="pred-title" style="color:#FF9F43;">🗣️ Third House (Sahaja Bhava) — Dedicated Analysis</div>
                   <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">${data.karaka.keywords}</div>
                   <div style="margin-top:6px;padding:8px;border:1px solid ${c}44;border-radius:6px;background:${c}0A;">
                     <div style="font-size:10px;color:var(--text);">
                       CSL: <b>${data.resolved.csl}</b>${data.resolved.cslSelfStarred ? ' (self-starred)' : ' → determining planet: <b>' + data.resolved.determiningPlanet + '</b>'}
                       ${data.independent ? this._chip('INDEPENDENT HOUSE', '#00DD77') : ''}
                     </div>
                     ${data.chain ? `<div style="font-size:8.5px;color:var(--muted);margin-top:4px;">L1 = ${data.chain.L1_planet} (H${data.chain.L1_numbers.join(',H') || '—'}) · L2 = ${data.chain.L2_planet} (H${data.chain.L2_numbers.join(',H') || '—'}) · L3 = ${data.chain.L3_planet} (H${data.chain.L3_numbers.join(',H') || '—'})</div>` : ''}
                     ${data.goldenClaimants.length ? `<div style="font-size:8.5px;color:#FFD700;margin-top:4px;">Golden-Rule extra claimants on H3: ${data.goldenClaimants.join(', ')}</div>` : ''}
                     ${data.lordPlacement && data.lordPlacement.reading ? `<div style="font-size:8.5px;color:var(--text);opacity:.8;margin-top:4px;">${data.lordPlacement.reading}</div>` : ''}
                   </div>
                   <div style="margin-top:8px;font-size:9px;color:var(--muted);font-weight:bold;">CSL/L1 INTERPRETIVE READINGS (specific, sourced):</div>
                   ${interpRows}
                   <div style="margin-top:8px;padding:6px 8px;border-left:3px solid #66CCFF;background:rgba(102,204,255,.06);font-size:9px;color:var(--text);opacity:.9;">${data.businessNote}</div>
                 </div>`;
    },

    // ===================== 9. DUAL-LORDSHIP PLANET DETAIL (supplementary Parashari cross-check) =====================

    MOOLATRIKONA_SIGN: { Sun: 4, Moon: 3, Mars: 0, Mercury: 5, Jupiter: 8, Venus: 6, Saturn: 10 },

    /** For planets ruling 2 signs/houses in this chart, which lordship should be weighted more heavily. */
    getDualLordshipDetail: function (ascSignNum, natalPlanetsMap, lords) {
        const L = this._lords(lords);
        if (!L) return [];
        const rulership = {}; // planet -> [houses]
        for (let h = 1; h <= 12; h++) {
            const lord = L[(ascSignNum + h - 1) % 12];
            (rulership[lord] = rulership[lord] || []).push(h);
        }
        const out = [];
        Object.keys(rulership).forEach(planet => {
            const houses = rulership[planet];
            if (houses.length < 2) return;
            const mtSign = this.MOOLATRIKONA_SIGN[planet];
            let mtHouse = null;
            if (mtSign !== undefined) mtHouse = this._mod12(mtSign - ascSignNum + 1);
            const placedHouse = natalPlanetsMap[planet] ? natalPlanetsMap[planet].house : null;
            const favoursPlacement = placedHouse && houses.includes(placedHouse);
            out.push({
                planet: planet, houses: houses, moolatrikonaHouse: mtHouse, placedHouse: placedHouse,
                note: `${planet} rules houses ${houses.join(' & ')}. Its Moolatrikona sign falls in house ${mtHouse} (fuller/100% results lean there per classical shloka). ${favoursPlacement ? `It is natally placed in house ${placedHouse}, one of its own houses — practically, placement often outweighs Moolatrikona; weigh both, judged case by case.` : `It is natally placed in house ${placedHouse}, judge which owned house it favours by placement + dispositor strength, not mechanically by Moolatrikona alone.`}`
            });
        });
        return out;
    },

    // ===================== 10. TENANTED/CSL-AWARE "PLANET DETAIL CARD" =====================

    /**
     * One consolidated detail object per planet: nakshatra lord, sub lord,
     * sub-sub lord, tenancy status, houses it rules, and "its numbers"
     * (houses for which it's CSL anywhere) — the full "details of planets"
     * view requested for the panel.
     */
    getPlanetDetails: function (ascSid, ascSignNum, natalPlanetsMap, lords) {
        const L = this._lords(lords);
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const tenancy = this.getTenancy(natalPlanetsMap);
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

        const ownedHousesOf = (pl) => {
            const o = [];
            if (L) for (let h = 1; h <= 12; h++) { if (L[(ascSignNum + h - 1) % 12] === pl) o.push(h); }
            return o;
        };

        return planets.map(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return { planet: p, available: false };
            const kp = this._getKPLords(pd.sid);
            const owns = ownedHousesOf(p);
            // NL "present in which houses" = the NL's own significations (houses it
            // rules as Rashi Lord + houses it is CSL of anywhere in the chart).
            const nlOwns = ownedHousesOf(kp.nakLord);
            const nlCSL = planetNumbers[kp.nakLord] || [];
            const nlSignifies = Array.from(new Set([...nlOwns, ...nlCSL])).sort((a, b) => a - b);
            // Sub Lord (=CSL-maker) significations, same construction.
            const slOwns = ownedHousesOf(kp.subLord);
            const slCSL = planetNumbers[kp.subLord] || [];
            const slSignifies = Array.from(new Set([...slOwns, ...slCSL])).sort((a, b) => a - b);
            // "CSL present in house" — the Cuspal Sub Lord of the house cusp this
            // planet is physically sitting in (colors the planet's own results).
            const houseCSL = allCusps[pd.house] ? allCusps[pd.house].subLord : null;
            return {
                planet: p, available: true, house: pd.house, sign: pd.sign,
                nakLord: kp.nakLord, subLord: kp.subLord, subSubLord: kp.subSubLord,
                tenancy: tenancy[p], ownsHouses: owns, csl_of_houses: planetNumbers[p] || [],
                nlSignifies: nlSignifies, slSignifies: slSignifies, houseCSL: houseCSL
            };
        });
    },

    // ===================== 10½. CUSPAL TABLE (all 12 cusps, for the Cuspal/Bhava Chalit panel) =====================

    SIGN_NAMES: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],

    /**
     * One row per house cusp: sign/degree, occupant planets, NL (+ NL's own
     * significations), Sub Lord/CSL (+ its significations), SSL, and the
     * Rashi (sign) lord of that house. Feeds renderCuspTable() and the
     * Cuspal/Bhava Chalit chart panel.
     */
    getCuspTableData: function (ascSid, ascSignNum, natalPlanetsMap, lords) {
        const L = this._lords(lords);
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const out = [];
        for (let h = 1; h <= 12; h++) {
            const c = allCusps[h];
            const signNum = Math.floor(c.sid / 30) % 12;
            const degInSign = c.sid % 30;
            const occupants = Object.keys(natalPlanetsMap || {}).filter(p => natalPlanetsMap[p] && natalPlanetsMap[p].house === h);
            const houseLord = L ? L[signNum] : null;
            out.push({
                house: h, sign: this.SIGN_NAMES[signNum], degInSign: degInSign,
                nakLord: c.nakLord, subLord: c.subLord, subSubLord: c.subSubLord,
                nlHouses: planetNumbers[c.nakLord] || [], slHouses: planetNumbers[c.subLord] || [],
                houseLord: houseLord, occupants: occupants
            });
        }
        return out;
    },

    /**
     * Chart-panel descriptors for the KP Cuspal chart and Bhava Chalit
     * chart, in the same {canvasId,label,color,planets,asc} shape as
     * GOCHAR.getChartConfigs() — the caller draws them with the shared
     * window.drawDChart(cfg.canvasId, {planets, asc}).
     *   NOTE: because this module approximates house cusps as EQUAL-HOUSE
     *   (Ascendant + (house-1)*30°, see module header §2), the Bhava Chalit
     *   placement is mathematically identical to the plain D1 Rashi
     *   placement here — both charts share the same natal planets/asc.
     *   They are still rendered as two separate panels so the Cuspal
     *   Table beneath (real per-house NL/SL/SSL/CSL detail) has a picture
     *   to sit under either way; swap in true Placidus cusps here if they
     *   become available to make the two genuinely diverge.
     */
    getChartConfigs: function (params) {
        params = params || {};
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        const cfgs = [];
        if (natalPlanets && natalAsc) {
            cfgs.push({ canvasId: 'kpCuspChartCanvas', label: 'Cuspal Chart (KP)', color: '#FF69B4', planets: natalPlanets, asc: natalAsc });
            cfgs.push({ canvasId: 'kpBhavaChalitCanvas', label: 'Bhava Chalit (Rashi diagram — see shift table below)', color: '#00CED1', planets: natalPlanets, asc: natalAsc });
        }
        return cfgs;
    },

    _renderKPChartPanels: function (chartConfigs) {
        if (!chartConfigs || !chartConfigs.length) return '';
        const cells = chartConfigs.map(c => `
            <div style="text-align:center;">
              <div style="font-size:11px;color:${c.color};margin-bottom:4px;font-weight:bold;">${c.label}</div>
              <canvas id="${c.canvasId}" width="200" height="200" style="background:var(--panel2,#1a1a2e);border-radius:3px;"></canvas>
            </div>`).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FF69B4;font-size:11px;font-weight:bold;">📊 KP Charts — Cuspal · Bhava Chalit</summary>
                  <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:10px;">${cells}</div>
                  <div style="font-size:8px;color:var(--muted);margin-top:6px;text-align:center;">Both diagrams show Rashi (sign-based) placement — the exact Bhava Chalit house shifts are calculated (not approximated) in the boundary/placement tables below.</div>
                </details>`;
    },

    renderCuspTable: function (cuspTableData) {
        if (!cuspTableData || !cuspTableData.length) return '';
        const rows = cuspTableData.map(c => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:4px 6px;font-weight:bold;color:#FF69B4;">H${c.house}</td>
              <td style="padding:4px 6px;">${c.sign} ${c.degInSign.toFixed(2)}°</td>
              <td style="padding:4px 6px;">${c.occupants.join(', ') || '—'}</td>
              <td style="padding:4px 6px;">${c.nakLord}</td>
              <td style="padding:4px 6px;font-size:8.5px;color:var(--muted);">H${c.nlHouses.join(',H') || '—'}</td>
              <td style="padding:4px 6px;color:#00DD77;font-weight:bold;">${c.subLord}</td>
              <td style="padding:4px 6px;font-size:8.5px;color:var(--muted);">H${c.slHouses.join(',H') || '—'}</td>
              <td style="padding:4px 6px;">${c.subSubLord}</td>
              <td style="padding:4px 6px;">${c.houseLord || '—'}</td>
            </tr>`).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FF69B4;font-size:10.5px;font-weight:bold;">📐 Cuspal Table — All 12 House Cusps (NL / CSL / SSL)</summary>
                  <div style="overflow-x:auto;margin-top:6px;">
                  <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                    <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                      <th style="padding:4px 6px;">House</th><th style="padding:4px 6px;">Cusp Sign/Deg</th><th style="padding:4px 6px;">Occupants</th>
                      <th style="padding:4px 6px;">NL</th><th style="padding:4px 6px;">NL's Houses</th>
                      <th style="padding:4px 6px;">CSL (Sub Lord)</th><th style="padding:4px 6px;">CSL's Houses</th>
                      <th style="padding:4px 6px;">SSL</th><th style="padding:4px 6px;">House Lord (Rashi)</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                  </table>
                  </div>
                </details>`;
    },

    renderPlanetHouseTable: function (planetDetails) {
        if (!planetDetails || !planetDetails.length) return '';
        const rows = planetDetails.filter(p => p.available).map(p => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:4px 6px;font-weight:bold;">${p.planet}</td>
              <td style="padding:4px 6px;">${p.sign}</td>
              <td style="padding:4px 6px;">H${p.house}</td>
              <td style="padding:4px 6px;">${p.nakLord}</td>
              <td style="padding:4px 6px;font-size:8.5px;color:var(--muted);">H${p.nlSignifies.join(',H') || '—'}</td>
              <td style="padding:4px 6px;color:#00DD77;">${p.subLord}</td>
              <td style="padding:4px 6px;font-size:8.5px;color:var(--muted);">H${p.slSignifies.join(',H') || '—'}</td>
              <td style="padding:4px 6px;">${p.subSubLord}</td>
              <td style="padding:4px 6px;">${p.csl_of_houses.length ? 'H' + p.csl_of_houses.join(',H') : '—'}</td>
              <td style="padding:4px 6px;">${p.houseCSL || '—'}</td>
            </tr>`).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🪐 Planet-in-House Table (NL / Sub Lord / CSL detail)</summary>
                  <div style="overflow-x:auto;margin-top:6px;">
                  <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                    <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                      <th style="padding:4px 6px;">Planet</th><th style="padding:4px 6px;">Sign</th><th style="padding:4px 6px;">House</th>
                      <th style="padding:4px 6px;">NL</th><th style="padding:4px 6px;">NL Signifies</th>
                      <th style="padding:4px 6px;">Sub Lord</th><th style="padding:4px 6px;">SL Signifies</th>
                      <th style="padding:4px 6px;">SSL</th><th style="padding:4px 6px;">Planet is CSL of</th><th style="padding:4px 6px;">House's own CSL</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                  </table>
                  </div>
                </details>`;
    },

    // ===================== 11. TIMING OF EVENTS (4-rule method + transit search) =====================

    /** Rule 1: what theme does the Mahadasha lord reflect (via its own CSL-numbers / house lordships)? */
    getMahadashaTheme: function (mdLord, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const L = this._lords(lords);
        const owns = [];
        if (L) for (let h = 1; h <= 12; h++) { if (L[(ascSignNum + h - 1) % 12] === mdLord) owns.push(h); }
        const numbers = planetNumbers[mdLord] || [];
        const themes = Array.from(new Set([...owns, ...numbers])).sort((a, b) => a - b)
            .map(h => (this.HOUSE_KARAKAS[h] || {}).keywords).filter(Boolean);
        return { lord: mdLord, ownsHouses: owns, cslNumbers: numbers, themeHouses: Array.from(new Set([...owns, ...numbers])).sort((a, b) => a - b), themeKeywords: themes };
    },

    /** Rule 2: does this sub-period's lord support a specific event type (reflects its prime/supporting houses)? */
    checkSubPeriodSupport: function (subLord, eventType, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const ev = this.EVENT_PRIME_HOUSES[eventType];
        if (!ev) return null;
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const L = this._lords(lords);
        const owns = [];
        if (L) for (let h = 1; h <= 12; h++) { if (L[(ascSignNum + h - 1) % 12] === subLord) owns.push(h); }
        const numbers = Array.from(new Set([...(planetNumbers[subLord] || []), ...owns]));
        const matchedPrime = ev.prime.filter(h => numbers.includes(h));
        const matchedSupporting = (ev.supporting || []).filter(h => numbers.includes(h));
        const matchedNegative = (ev.negative || []).filter(h => numbers.includes(h));
        const supports = matchedPrime.length > 0;
        return { lord: subLord, eventType: eventType, numbers: numbers, matchedPrime: matchedPrime, matchedSupporting: matchedSupporting, matchedNegative: matchedNegative, supports: supports };
    },

    /**
     * Walks a Vimshottari dasha tree (as produced by main.js's getVimsh(),
     * shape: {lord,start,end,subs:[{lord,start,end,subs:[...]}]}) and
     * returns every AD/PD/Sookshma window inside it whose lord supports
     * the given event per Rule 2, restricted to the CURRENT Mahadasha
     * (per the user's request: "search for events possible in current
     * mahadasha").
     */
    searchSupportingWindowsInMahadasha: function (mdNode, eventType, ascSid, ascSignNum, natalPlanetsMap, lords) {
        if (!mdNode) return [];
        const results = [];
        const walk = (node, levelName, path) => {
            const chk = this.checkSubPeriodSupport(node.lord, eventType, ascSid, ascSignNum, natalPlanetsMap, lords);
            if (chk && chk.supports) {
                results.push({ level: levelName, lord: node.lord, start: node.start, end: node.end, path: path.concat(node.lord), check: chk });
            }
            if (node.subs) {
                const nextLevel = levelName === 'Mahadasha' ? 'Antardasha' : levelName === 'Antardasha' ? 'Pratyantardasha' : levelName === 'Pratyantardasha' ? 'Sookshma Dasha' : 'Prana Dasha';
                node.subs.forEach(s => walk(s, nextLevel, path.concat(node.lord)));
            }
        };
        walk(mdNode, 'Mahadasha', []);
        return results.filter(r => r.level !== 'Mahadasha'); // Rule 2 is about sub-periods, MD is Rule 1's theme-setter
    },

    /**
     * Rule 3 transit search: within a date window [from, to], scan month
     * by month for Jupiter transiting/aspecting the event's houses (->
     * candidate YEAR), then within the best month scan day by day for the
     * Sun doing the same (-> candidate MONTH is really pinned by which
     * *month* the Sun sits there, since Sun moves ~1 sign/month — reported
     * directly), then within that month scan day by day for the Moon (->
     * candidate DAY). Requires a `getPosFn(date) -> {planet:{sn,house,...}}`
     * function (pass in the app's global getPos) and `ascSignNum`.
     *
     * Vedic special aspects used for "transiting/aspecting": Jupiter
     * 5th/7th/9th, Saturn 3rd/7th/10th, Mars 4th/7th/8th, others 7th only —
     * consistent with gochar.js's convention.
     */
    searchTransitWindows: function (eventType, ascSignNum, fromDate, toDate, getPosFn, stepDays) {
        const ev = this.EVENT_PRIME_HOUSES[eventType];
        if (!ev || typeof getPosFn !== 'function') return [];
        const targetHouses = ev.prime.concat(ev.supporting || []);
        const aspectOffsets = { Jupiter: [5, 7, 9], Saturn: [3, 7, 10], Mars: [4, 7, 8], default: [7] };
        const mod12 = this._mod12;
        const touchesTarget = (planet, house) => {
            if (targetHouses.includes(house)) return true;
            const offs = aspectOffsets[planet] || aspectOffsets.default;
            return offs.some(o => targetHouses.includes(mod12(house + o - 1)));
        };

        const candidates = [];
        const step = stepDays || 30; // month-granularity default for the Jupiter/Sun scan
        for (let t = fromDate.getTime(); t <= toDate.getTime(); t += step * 24 * 3600 * 1000) {
            const d = new Date(t);
            let pos;
            try { pos = getPosFn(d); } catch (e) { continue; }
            if (!pos) continue;
            const jHouse = pos.Jupiter ? mod12(pos.Jupiter.sn - ascSignNum + 1) : null;
            const sHouse = pos.Sun ? mod12(pos.Sun.sn - ascSignNum + 1) : null;
            const mHouse = pos.Moon ? mod12(pos.Moon.sn - ascSignNum + 1) : null;
            const jOK = jHouse !== null && touchesTarget('Jupiter', jHouse);
            const sOK = sHouse !== null && touchesTarget('Sun', sHouse);
            const mOK = mHouse !== null && touchesTarget('Moon', mHouse);
            if (jOK) {
                candidates.push({
                    date: d, jupiterHouse: jHouse, jupiterOK: jOK,
                    sunHouse: sHouse, sunOK: sOK, moonHouse: mHouse, moonOK: mOK,
                    allThreeAligned: jOK && sOK && mOK
                });
            }
        }
        return candidates;
    },

    // ===================== 12. HORARY / PRASHNA (1-249 NUMBER SYSTEM) =====================

    /**
     * Builds the full sequential NL→SL horary-number table across the
     * zodiac (243 raw segments — see module header note on the 249 vs 243
     * discrepancy). Returns [{number, startDeg, endDeg, nakLord, subLord}].
     */
    buildHoraryTable: function () {
        const dashaSeq = this.DASHA_SEQ, dashaYrs = this.DASHA_YRS, nakSize = this.NAK_SIZE;
        const table = [];
        let num = 1;
        for (let nak = 0; nak < 27; nak++) {
            const nlIdx = nak % 9;
            const nakStart = nak * nakSize;
            let cursor = nakStart;
            for (let i = 0; i < 9; i++) {
                const ci = (nlIdx + i) % 9;
                const size = (dashaYrs[ci] / 120) * nakSize;
                table.push({ number: num++, startDeg: cursor, endDeg: cursor + size, nakLord: dashaSeq[nlIdx], subLord: dashaSeq[ci] });
                cursor += size;
            }
        }
        return table;
    },

    /** Resolves a horary number (1-243, see buildHoraryTable note) to a zodiacal longitude (mid-point of its segment). */
    horaryNumberToLongitude: function (number) {
        const table = this.buildHoraryTable();
        const entry = table[((number - 1) % table.length + table.length) % table.length];
        if (!entry) return null;
        return { longitude: (entry.startDeg + entry.endDeg) / 2, entry: entry, totalSegments: table.length };
    },

    /**
     * Full horary/Prashna analysis: given a horary number and the CURRENT
     * transit planet positions (the Prashna chart uses the moment's
     * transits, not natal planets), builds the horary Ascendant and reruns
     * the promise-check machinery against it — "recheck an event and its
     * result." Applies the horary-specific retrograde rule.
     */
    analyzeHorary: function (number, transitPlanetsMap, eventType) {
        const resolved = this.horaryNumberToLongitude(number);
        if (!resolved) return null;
        const horaryAscSid = resolved.longitude;
        const horaryAscSignNum = Math.floor(horaryAscSid / 30);

        const promise = eventType ? this.checkEventPromise(eventType, horaryAscSid, transitPlanetsMap) : null;

        let retrogradeWarning = null;
        if (promise && promise.resolved) {
            const detPlanet = promise.determiningPlanet;
            const detData = transitPlanetsMap[detPlanet];
            if (detData && (detData.retro === true)) {
                retrogradeWarning = `${detPlanet} (the determining planet for this question) is RETROGRADE right now. Horary-specific rule: this classically pushes the answer toward NO / reversed / delayed, even if the house-number logic above shows a promise.`;
            }
        }

        return {
            number: number, horaryAscSid: horaryAscSid, horaryAscSignNum: horaryAscSignNum,
            horaryEntry: resolved.entry, totalSegments: resolved.totalSegments,
            eventType: eventType, promise: promise, retrogradeWarning: retrogradeWarning
        };
    },

    // ===================== 13. TOP-LEVEL: HOUSE EXPLORER (1-12) =====================

    /**
     * Full "house explorer" bundle for a single house — karakas, CSL chain,
     * determining planet, significators, lord placement, and independence
     * check — everything needed to "fine-tune finding events" per house.
     */
    exploreHouse: function (houseNum, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const allCusps = this.getAllCusps(ascSid);
        const cusp = allCusps[houseNum];
        const resolved = this.resolveDeterminingPlanetPrecise(houseNum, allCusps, natalPlanetsMap);
        const sig = this.getFruitfulSignificators(houseNum, natalPlanetsMap, ascSignNum, lords);
        const lordPlacement = this.getHouseLordPlacements(ascSignNum, natalPlanetsMap, lords).find(x => x.house === houseNum);
        const tenancy = this.getTenancy(natalPlanetsMap);
        const cslTenancy = resolved ? tenancy[resolved.csl] : null;
        const independent = !!(cslTenancy && !cslTenancy.tenanted);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        return {
            house: houseNum, karaka: this.HOUSE_KARAKAS[houseNum], cusp: cusp, resolved: resolved,
            determiningPlanetNumbers: resolved ? (planetNumbers[resolved.determiningPlanet] || []) : [],
            significators: sig, lordPlacement: lordPlacement, cslTenancy: cslTenancy, independent: independent
        };
    },

    // ===================== 13½. NARRATIVE SCRIPTS (per-planet, per-house) =====================

    /** Full-sentence narrative per planet, built from the same data as getPlanetDetails(). */
    getPlanetScripts: function (planetDetails) {
        if (!planetDetails) return [];
        return planetDetails.filter(p => p.available).map(p => {
            const tenLine = (p.tenancy && !p.tenancy.tenanted)
                ? `${p.planet} is UNTENANTED — it is not the Star Lord of any other planet, so it "owns its own house" and tends to deliver its results independently.`
                : `${p.planet} is TENANTED — it acts as Star Lord for other planet(s), making it dependent on what else is happening in the chart; its results can be modified by whoever it "hosts."`;
            const ownLine = p.ownsHouses.length
                ? `As Rashi Lord, ${p.planet} rules House${p.ownsHouses.length > 1 ? 's' : ''} ${p.ownsHouses.join(', ')}.`
                : `${p.planet} does not rule any house as Rashi Lord here.`;
            const cslLine = p.csl_of_houses.length
                ? `${p.planet} is Cuspal Sub Lord (CSL) for House${p.csl_of_houses.length > 1 ? 's' : ''} ${p.csl_of_houses.join(', ')} — during ${p.planet}'s own Dasha/Antardasha it is positioned to actually DELIVER ${p.csl_of_houses.length > 1 ? 'those houses\' results' : 'that house\'s result'}.`
                : `${p.planet} is not the Sub Lord (CSL) of any house cusp, so it doesn't independently deliver any house's promise on its own — its periods express through its Star Lord and Sub Lord instead.`;
            const nlLine = `Its own Star Lord (NL) is ${p.nakLord}, who signifies House${p.nlSignifies.length !== 1 ? 's' : ''} ${p.nlSignifies.join(', ') || '—'} — ${p.planet}'s results are strongly colored by ${p.nakLord}'s agenda.`;
            const slLine = `Its Sub Lord (SL) is ${p.subLord}, signifying House${p.slSignifies.length !== 1 ? 's' : ''} ${p.slSignifies.join(', ') || '—'} — the Sub Lord fine-tunes whether the promise is actually granted.`;
            const ssLine = `Its Sub-Sub Lord (SSL) is ${p.subSubLord}, adding a third, finer layer of timing.`;
            const houseCslLine = p.houseCSL
                ? `The house ${p.planet} physically occupies (H${p.house}) is itself ruled by CSL ${p.houseCSL}, so ${p.planet}'s placement results are additionally filtered through ${p.houseCSL}'s promise for H${p.house}.`
                : '';
            const script = [`${p.planet} is placed in ${p.sign}, House ${p.house}.`, tenLine, ownLine, cslLine, nlLine, slLine, ssLine, houseCslLine].filter(Boolean).join(' ');
            return { planet: p.planet, script: script };
        });
    },

    /** Full-sentence narrative per house, built from exploreHouse()'s output. */
    getHouseScripts: function (houseExplorers) {
        if (!houseExplorers) return [];
        return houseExplorers.map(ex => {
            const k = ex.karaka;
            const cslLine = ex.resolved.cslSelfStarred
                ? `Its Cuspal Sub Lord (CSL) is ${ex.resolved.csl}, and ${ex.resolved.csl} sits in its OWN nakshatra (self-starred) — per the "2 levels deep" rule, ${ex.resolved.csl} itself is the final determining planet.`
                : `Its Cuspal Sub Lord (CSL) is ${ex.resolved.csl}, which sits in the nakshatra of ${ex.resolved.determiningPlanet} — per the "2 levels deep" rule, ${ex.resolved.determiningPlanet} (the CSL's own Star Lord) is the final determining planet, not ${ex.resolved.csl} directly.`;
            const numbersLine = `The determining planet's own numbers (houses it is CSL of elsewhere) are: ${ex.determiningPlanetNumbers.join(', ') || 'none'} — these are the houses through which House ${ex.house}'s promise actually flows.`;
            const indepLine = ex.independent
                ? `Because the CSL (${ex.resolved.csl}) is UNTENANTED, House ${ex.house} is an INDEPENDENT HOUSE — it tends to deliver results in the CSL's own dasha/antardasha regardless of deeper nakshatra-level obstacles.`
                : `The CSL (${ex.resolved.csl}) is TENANTED, so House ${ex.house}'s results lean on the wider chain (its Star Lord ${ex.resolved.determiningPlanet}, and beyond) rather than standing fully on its own.`;
            const lordLine = ex.lordPlacement && ex.lordPlacement.reading ? ex.lordPlacement.reading + '.' : '';
            const sigLine = (ex.significators && ex.significators.fruitfulSignificators && ex.significators.fruitfulSignificators.length)
                ? `Fruitful significators of House ${ex.house}: ${ex.significators.fruitfulSignificators.map(f => f.planet).join(', ')}.`
                : '';
            const script = [`House ${ex.house} — ${k.name}. This house governs: ${k.keywords}.`, cslLine, numbersLine, indepLine, lordLine, sigLine].filter(Boolean).join(' ');
            return { house: ex.house, script: script };
        });
    },

    renderPlanetScripts: function (scripts) {
        if (!scripts || !scripts.length) return '';
        const rows = scripts.map(s => `<div style="margin:6px 0;padding:8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.05);border-radius:4px;">
            <b style="color:#9b6fff;">${s.planet}</b>
            <div style="font-size:9.5px;color:var(--text);opacity:.9;line-height:1.5;margin-top:4px;">${s.script}</div>
          </div>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">📜 Planet-by-Planet Script (Full Narrative)</summary>
                  ${rows}
                </details>`;
    },

    renderHouseScripts: function (scripts) {
        if (!scripts || !scripts.length) return '';
        const rows = scripts.map(s => `<div style="margin:6px 0;padding:8px;border-left:3px solid #66CCFF;background:rgba(102,204,255,.05);border-radius:4px;">
            <b style="color:#66CCFF;">House ${s.house}</b>
            <div style="font-size:9.5px;color:var(--text);opacity:.9;line-height:1.5;margin-top:4px;">${s.script}</div>
          </div>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#66CCFF;font-size:10.5px;font-weight:bold;">📜 House-by-House Script (Full Narrative)</summary>
                  ${rows}
                </details>`;
    },

    // ===================== 13¾. DASHA CONFIRMATION (MD -> AD -> PD -> Sookshma -> Prana) =====================

    /**
     * Combines the 4-rule Timing-of-Events method (§7) with whichever
     * dasha levels are CURRENTLY running (as produced by
     * PREDICTION_FORECASTING.getCurrentDashaInfo()) to judge whether the
     * running periods are actively confirming a result RIGHT NOW:
     * Rule 1 — Mahadasha lord's own significations set the broad theme.
     * Rule 2 — each deeper running level (Antardasha, Pratyantardasha,
     *          Sookshma, Prana) must SUPPORT that theme via its own
     *          significations for the promise to be a "sure shot."
     * A house signified at EVERY currently-running level is the strongest
     * possible confirmation; a house shared only by Mahadasha+Antardasha
     * is a weaker "partial support" reading; no overlap at all is flagged
     * as quiet/unconfirmed for now.
     */
    getDashaConfirmation: function (dashaInfo, ascSid, ascSignNum, natalPlanetsMap, lords) {
        if (!dashaInfo) return null;
        const L = this._lords(lords);
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const tenancy = this.getTenancy(natalPlanetsMap);

        const LEVELS = [
            { key: 'mahadasha', label: 'Mahadasha' },
            { key: 'antardasha', label: 'Antardasha' },
            { key: 'pratyantar', label: 'Pratyantardasha' },
            { key: 'sukshma', label: 'Sookshma Dasha' },
            { key: 'prana', label: 'Prana Dasha' }
        ];

        const levelData = [];
        LEVELS.forEach(lv => {
            const period = dashaInfo[lv.key];
            if (!period || !period.lord) return;
            const lord = period.lord;
            const owns = [];
            if (L) for (let h = 1; h <= 12; h++) { if (L[(ascSignNum + h - 1) % 12] === lord) owns.push(h); }
            const cslNumbers = planetNumbers[lord] || [];
            const houses = Array.from(new Set([...owns, ...cslNumbers])).sort((a, b) => a - b);
            levelData.push({
                level: lv.label, lord: lord, start: period.start, end: period.end,
                ownsHouses: owns, cslNumbers: cslNumbers, houses: houses,
                tenancy: tenancy[lord] || null
            });
        });

        if (!levelData.length) return null;

        // Intersection across EVERY currently-running level = strongest confirmation.
        let common = levelData[0].houses.slice();
        for (let i = 1; i < levelData.length; i++) common = common.filter(h => levelData[i].houses.includes(h));

        // Softer bar: does the Antardasha at least support the Mahadasha's theme?
        const mdHouses = levelData[0] ? levelData[0].houses : [];
        const mdAdOverlap = levelData[1] ? levelData[1].houses.filter(h => mdHouses.includes(h)) : [];

        let verdict = 'not confirmed';
        if (common.length > 0) verdict = 'sure shot';
        else if (mdAdOverlap.length > 0) verdict = 'partial support';

        return { levels: levelData, commonHouses: common, mdAdOverlap: mdAdOverlap, verdict: verdict };
    },

    renderDashaConfirmation: function (conf) {
        if (!conf) return `<div class="pred-item"><div class="pred-title">⚠️ Dasha info not available</div><div class="pred-detail" style="font-size:9px;color:var(--muted);">Requires PREDICTION_FORECASTING.getCurrentDashaInfo() — ensure dashas have been built (rebuildDashas()).</div></div>`;
        const lvColor = { Mahadasha: '#FFD700', Antardasha: '#00DD77', Pratyantardasha: '#66CCFF', 'Sookshma Dasha': '#FF9F43', 'Prana Dasha': '#FF69B4' };
        const rows = conf.levels.map(lv => {
            const c = lvColor[lv.level] || '#9b6fff';
            const t = lv.tenancy;
            const tChip = t ? this._chip(t.tenanted ? 'TENANTED' : 'UNTENANTED', t.tenanted ? '#FFD700' : '#00DD77') : '';
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b style="color:${c};">${lv.level}: ${lv.lord}</b> ${tChip}
                <span style="font-size:8.5px;color:var(--muted);">${lv.start ? new Date(lv.start).toDateString() : ''}${lv.end ? ' → ' + new Date(lv.end).toDateString() : ''}</span>
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">
                  Owns H${lv.ownsHouses.join(',H') || '—'} · CSL of H${lv.cslNumbers.join(',H') || '—'} → Combined significations: H${lv.houses.join(', H') || '—'}
                </div>
              </div>`;
        }).join('');

        const verdictColor = conf.verdict === 'sure shot' ? '#00DD77' : conf.verdict === 'partial support' ? '#FFD700' : '#FF4477';
        const verdictText = conf.verdict === 'sure shot'
            ? `House${conf.commonHouses.length > 1 ? 's' : ''} ${conf.commonHouses.join(', ')} ${conf.commonHouses.length > 1 ? 'are' : 'is'} signified at EVERY currently-running dasha level (Mahadasha down to the deepest running sub-period) — per Rule 2, this is the strongest available confirmation that House${conf.commonHouses.length > 1 ? 's' : ''} ${conf.commonHouses.join(', ')}-related results can fructify RIGHT NOW.`
            : conf.verdict === 'partial support'
                ? `No house is common to every running level, but the Antardasha does support the Mahadasha's theme on House${conf.mdAdOverlap.length > 1 ? 's' : ''} ${conf.mdAdOverlap.join(', ')} — a real but weaker confirmation than a full match across all levels. Check the Pratyantardasha/Sookshma rows above to fine-tune further.`
                : `The currently-running sub-periods do not overlap with the Mahadasha's theme on any house — per Rule 2, this suggests the Mahadasha's broad promise is not being actively delivered by the CURRENT Antardasha/Pratyantardasha window; results may stay quiet until a better-aligned sub-period arrives.`;

        return `<div class="pred-item" style="border-left:3px solid #FF69B4;">
            <div class="pred-title" style="color:#FF69B4;">⏱️ Dasha Confirmation — Mahadasha → Antardasha → Pratyantardasha → Sookshma → Prana</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Rule 1 (Mahadasha = broad theme) + Rule 2 (every deeper running level must SUPPORT that theme) applied together, to judge whether results are a "sure shot" right now.</div>
            ${rows}
            <div style="margin-top:8px;padding:8px;border:1px solid ${verdictColor}44;border-radius:6px;background:${verdictColor}0A;">
              <b style="color:${verdictColor};">${conf.verdict.toUpperCase()}</b>
              <div style="font-size:9.5px;color:var(--text);opacity:.9;margin-top:4px;">${verdictText}</div>
            </div>
          </div>`;
    },

    // ===================== 14. RENDERING =====================

    _color: function (v) {
        if (v === true || v === 'strong promise' || v === 'promise present') return '#00DD77';
        if (v === false || v === 'no promise found') return '#FF4477';
        return '#FFD700';
    },

    _chip: function (text, color) {
        return `<span style="display:inline-block;margin:2px 4px 0 0;padding:2px 6px;border-radius:4px;background:${color}22;color:${color};font-size:9px;font-weight:bold;">${text}</span>`;
    },

    renderHouseKarakaTable: function () {
        const rows = Object.keys(this.HOUSE_KARAKAS).map(h => {
            const k = this.HOUSE_KARAKAS[h];
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.06);">
                <b style="color:#9b6fff;">H${h} — ${k.name}</b> <span style="font-size:8.5px;color:var(--muted);">(Karaka: ${k.karakas.join(', ')})</span>
                <div style="font-size:9.5px;color:var(--text);opacity:.9;margin-top:2px;">${k.keywords}</div>
                <div style="font-size:8.5px;color:var(--muted);font-style:italic;margin-top:2px;">${k.notes}</div>
              </div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🏠 House Karakas 1-12 (KP-specific)</summary>
                  ${rows}
                </details>`;
    },

    renderPlanetDetails: function (planetDetails) {
        if (!planetDetails || !planetDetails.length) return '';
        const rows = planetDetails.filter(p => p.available).map(p => {
            const t = p.tenancy;
            const tColor = t && !t.tenanted ? '#00DD77' : '#FFD700';
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${tColor};background:${tColor}0A;">
                <b>${p.planet}</b> <span style="font-size:8.5px;color:var(--muted);">${p.sign} H${p.house}</span>
                ${this._chip(t && !t.tenanted ? 'UNTENANTED' : 'TENANTED', tColor)}
                ${p.ownsHouses.length ? this._chip('Rules H' + p.ownsHouses.join(',H'), '#66CCFF') : ''}
                ${p.csl_of_houses.length ? this._chip('CSL of H' + p.csl_of_houses.join(',H'), '#FF9F43') : ''}
                <div style="font-size:8.5px;color:var(--text);opacity:.85;margin-top:2px;">NL: ${p.nakLord} · SL: ${p.subLord} · SSL: ${p.subSubLord}</div>
                <div style="font-size:8px;color:var(--muted);margin-top:2px;">${t ? t.reason : ''}</div>
              </div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">☉ Planet Details — Star Lord, Sub Lord, Tenancy</summary>
                  ${rows}
                </details>`;
    },

    renderEventPromises: function (allPromises) {
        if (!allPromises) return '';
        const rows = Object.keys(allPromises).map(evt => {
            const p = allPromises[evt];
            if (!p) return '';
            const c = this._color(p.strength);
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b style="color:${c};">${evt.replace(/_/g, ' ')}</b> — <b>${p.strength.toUpperCase()}</b>
                <div style="font-size:8.5px;color:var(--text);opacity:.85;margin-top:2px;">
                  Prime H${p.primeHouse} CSL = ${p.resolved.csl}${p.resolved.cslSelfStarred ? ' (self-starred)' : ' → star lord ' + p.resolved.determiningPlanet}. 
                  ${p.determiningPlanet}'s numbers: ${p.determiningPlanetNumbers.join(', ') || '—'}.
                  ${p.matchedPrime.length ? ' Matches prime H' + p.matchedPrime.join(',H') + '.' : ''}
                  ${p.matchedNegative.length ? ' ⚠ Also touches negative H' + p.matchedNegative.join(',H') + '.' : ''}
                  ${p.invitesEighth ? ' ⚠ Invites 8th house.' : ''}
                </div>
                ${p.chain ? `<div style="font-size:8px;color:#66CCFF;margin-top:2px;">L1/L2 chain on ${p.chain.planet}: L1=${p.chain.L1_planet}(H${p.chain.L1_numbers.join(',H') || '—'}) · L2=${p.chain.L2_planet}(H${p.chain.L2_numbers.join(',H') || '—'})${p.chainConfirms ? ' — CONFIRMS at both levels' : ''}</div>` : ''}
                ${p.goldenClaimants.length ? `<div style="font-size:8px;color:#FFD700;margin-top:2px;">Golden-Rule extra claimants on H${p.primeHouse}: ${p.goldenClaimants.join(', ')}</div>` : ''}
                <div style="font-size:8px;color:var(--muted);margin-top:2px;">${p.eventInfo.note}</div>
              </div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🔎 Event Promise Check (CSL Method)</summary>
                  ${rows}
                </details>`;
    },

    renderGoldenRuleClaims: function (claims) {
        if (!claims || !Object.keys(claims).length) return '';
        const ruleColor = { 1: '#00DD77', 2: '#FFD700', 3: '#66CCFF' };
        const rows = Object.keys(claims).map(planet => {
            const items = claims[planet].map(c => `<div style="font-size:8.5px;color:${ruleColor[c.rule]};margin-top:2px;">Rule ${c.rule} → H${c.house}: <span style="color:var(--text);opacity:.85;">${c.reason}</span></div>`).join('');
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.05);"><b>${planet}</b>${items}</div>`;
        }).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🗝️ Three Golden Rules — Extra House Claims (beyond a planet's plain CSL script)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Explains results (wealth/status/children) that show up in a dasha whose lord's own CSL-list didn't mention that house at all.</div>
                  ${rows}
                </details>`;
    },

    renderIndependentHouses: function (independentHouses) {
        if (!independentHouses) return '';
        const rows = independentHouses.length
            ? independentHouses.map(h => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">
                <b>H${h.house}</b> — CSL ${h.csl} <span style="font-size:8.5px;color:var(--muted);">(Untenanted)</span>
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">${h.reason}</div>
              </div>`).join('')
            : '<div style="font-size:9px;color:var(--muted);">No houses found with an Untenanted CSL.</div>';
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FFD700;font-size:10.5px;font-weight:bold;">⚑ Independent Houses (deliver results regardless of nakshatra-level obstacles)</summary>
                  ${rows}
                </details>`;
    },

    renderHouseExplorer: function (explored) {
        if (!explored) return '';
        const k = explored.karaka;
        const c = explored.independent ? '#00DD77' : '#8899AA';
        return `<div style="margin-top:8px;padding:8px;border:1px solid ${c}44;border-radius:6px;background:${c}0A;">
            <div style="font-weight:bold;color:${c};font-size:11px;">H${explored.house} — ${k.name}</div>
            <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">${k.keywords}</div>
            <div style="font-size:9px;color:var(--muted);margin-top:4px;">
              CSL: <b>${explored.resolved.csl}</b>${explored.resolved.cslSelfStarred ? ' (self-starred)' : ' → determining planet: <b>' + explored.resolved.determiningPlanet + '</b>'}
              · Numbers: ${explored.determiningPlanetNumbers.join(', ') || '—'}
              ${explored.independent ? this._chip('INDEPENDENT HOUSE', '#00DD77') : ''}
            </div>
            <div style="font-size:8.5px;color:var(--text);opacity:.8;margin-top:4px;">${explored.lordPlacement ? explored.lordPlacement.reading : ''}</div>
            <div style="font-size:8.5px;color:var(--muted);margin-top:4px;">Fruitful significators: ${explored.significators.fruitfulSignificators.map(f => f.planet).join(', ') || '—'}</div>
          </div>`;
    },

    renderHoraryResult: function (horary) {
        if (!horary) return '<div class="pred-item">Enter a horary number 1-243 to analyze.</div>';
        const p = horary.promise;
        const c = p ? this._color(p.strength) : '#8899AA';
        return `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">🔮 Horary #${horary.number} Analysis</div>
            <div style="font-size:9px;color:var(--muted);">Horary Ascendant: ${horary.horaryAscSid.toFixed(2)}° (segment NL ${horary.horaryEntry.nakLord} / SL ${horary.horaryEntry.subLord})</div>
            ${p ? `<div style="margin-top:6px;font-size:10px;"><b style="color:${c};">${p.strength.toUpperCase()}</b> for ${horary.eventType.replace(/_/g, ' ')}</div>
                   <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">Determining planet: ${p.determiningPlanet} (numbers: ${p.determiningPlanetNumbers.join(', ') || '—'})</div>` : ''}
            ${horary.retrogradeWarning ? `<div style="margin-top:6px;padding:6px 8px;border-left:3px solid #FF4477;background:rgba(255,68,119,.08);font-size:9px;color:#FF4477;">⚠ ${horary.retrogradeWarning}</div>` : ''}
          </div>`;
    },

    renderHoraryPanel: function (transitPlanetsMap) {
        this._horaryTransitCache = transitPlanetsMap || {};
        const eventOptions = Object.keys(this.EVENT_PRIME_HOUSES).map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FF69B4;font-size:10.5px;font-weight:bold;">🔮 Horary / Prashna — Recheck an Event's Occurrence &amp; Result</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Pick a number 1-243 (KP's classical 1-249 horary system, computed here — see module notes on the 243 vs 249 count) and an event type, using the CURRENT transit positions as the Prashna chart.</div>
                  <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <input id="kpHoraryNumberInput" type="number" min="1" max="243" placeholder="Number 1-243" style="width:110px;background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">
                    <select id="kpHoraryEventInput" style="background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">${eventOptions}</select>
                    <button onclick="window.KP_PREDICTION.runHoraryFromUI()" style="background:#FF69B4;color:#000;border:none;padding:4px 10px;border-radius:3px;font-size:10px;font-weight:bold;cursor:pointer;">Check</button>
                  </div>
                  <div id="kpHoraryResult" style="margin-top:8px;"></div>
                </details>`;
    },

    /** Called from the inline onclick in renderHoraryPanel()'s button. */
    runHoraryFromUI: function () {
        const numEl = document.getElementById('kpHoraryNumberInput');
        const evtEl = document.getElementById('kpHoraryEventInput');
        const resultEl = document.getElementById('kpHoraryResult');
        if (!numEl || !evtEl || !resultEl) return;
        const number = parseInt(numEl.value, 10);
        if (!number || number < 1) { resultEl.innerHTML = '<div style="color:#FF4477;font-size:9px;">Enter a valid number 1-243.</div>'; return; }
        const horary = this.analyzeHorary(number, this._horaryTransitCache || {}, evtEl.value);
        resultEl.innerHTML = this.renderHoraryResult(horary);
    },

    renderMDSearchPanel: function (mdNode, ascSid, ascSignNum, natalPlanetsMap, lords) {
        this._mdSearchCache = { mdNode: mdNode, ascSid: ascSid, ascSignNum: ascSignNum, natalPlanetsMap: natalPlanetsMap, lords: lords };
        if (!mdNode) return `<details style="margin-top:6px;"><summary style="cursor:pointer;color:#66CCFF;font-size:10.5px;font-weight:bold;">🔍 Search Events in Current Mahadasha</summary><div style="font-size:9px;color:var(--muted);margin-top:6px;">No Mahadasha data supplied.</div></details>`;
        const eventOptions = Object.keys(this.EVENT_PRIME_HOUSES).map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#66CCFF;font-size:10.5px;font-weight:bold;">🔍 Search Events in Current Mahadasha (${mdNode.lord})</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Rule 2: finds every Antardasha/Pratyantardasha/Sookshma window inside the current ${mdNode.lord} Mahadasha whose lord's numbers support the chosen event's prime house.</div>
                  <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <select id="kpMDSearchEventInput" style="background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">${eventOptions}</select>
                    <button onclick="window.KP_PREDICTION.runMDSearchFromUI()" style="background:#66CCFF;color:#000;border:none;padding:4px 10px;border-radius:3px;font-size:10px;font-weight:bold;cursor:pointer;">Search</button>
                  </div>
                  <div id="kpMDSearchResult" style="margin-top:8px;"></div>
                </details>`;
    },

    renderMDSearchResults: function (results, eventType) {
        if (!results || !results.length) return `<div style="font-size:9px;color:var(--muted);">No supporting sub-periods found for "${(eventType || '').replace(/_/g, ' ')}" in the current Mahadasha.</div>`;
        return results.map(r => {
            const c = r.check.matchedNegative.length ? '#FFD700' : '#00DD77';
            return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
                <b style="color:${c};">${r.level}: ${r.lord}</b>
                <span style="font-size:8.5px;color:var(--muted);">${new Date(r.start).toDateString()} → ${new Date(r.end).toDateString()}</span>
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">Numbers: ${r.check.numbers.join(', ') || '—'} · Matches prime H${r.check.matchedPrime.join(',H')}${r.check.matchedNegative.length ? ' · ⚠ also touches negative H' + r.check.matchedNegative.join(',H') : ''}</div>
              </div>`;
        }).join('');
    },

    /** Called from the inline onclick in renderMDSearchPanel()'s button. */
    runMDSearchFromUI: function () {
        const evtEl = document.getElementById('kpMDSearchEventInput');
        const resultEl = document.getElementById('kpMDSearchResult');
        const cache = this._mdSearchCache;
        if (!evtEl || !resultEl || !cache || !cache.mdNode) return;
        const results = this.searchSupportingWindowsInMahadasha(cache.mdNode, evtEl.value, cache.ascSid, cache.ascSignNum, cache.natalPlanetsMap, cache.lords);
        resultEl.innerHTML = this.renderMDSearchResults(results, evtEl.value);
    },

    renderHTML: function (data, transitPlanetsMap, mdNode, chartConfigs) {
        if (!data) return '<div class="pred-item">No KP data available.</div>';
        let html = `<div class="pred-item" style="border-left:3px solid #9b6fff;">
                       <div class="pred-title" style="color:#9b6fff;">🪔 KP (Krishnamurti Paddhati) Prediction Engine</div>
                       <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Cuspal Sub Lord promise-check, Tenanted/Untenanted planets, Independent Houses, and Timing-of-Event analysis.</div>`;
        html += this._renderKPChartPanels(chartConfigs);
        html += this.renderCuspTable(data.cuspTableData);
        html += this.renderBhavaChalitCusps(data.bhavaChalit && data.bhavaChalit.cusps);
        html += this.renderBhavaChalitPlacements(data.bhavaChalit);
        html += this.renderPlanetHouseTable(data.planetDetails);
        html += this.renderHouseKarakaTable();
        html += this.renderPlanetDetails(data.planetDetails);
        html += this.renderPlanetScripts(data.planetScripts);
        html += this.renderHouseScripts(data.houseScripts);
        html += this.renderEventPromises(data.eventPromises);
        html += this.renderIndependentHouses(data.independentHouses);
        html += this.renderGoldenRuleClaims(data.goldenRuleClaims);
        if (data.houseExplorers && data.houseExplorers.length) {
            html += `<details style="margin-top:6px;"><summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🧭 House-by-House Explorer (H1-H12)</summary>`;
            data.houseExplorers.forEach(ex => { html += this.renderHouseExplorer(ex); });
            html += `</details>`;
        }
        html += `</div>`;
        html += this.renderThirdHouseAnalysis(data.thirdHouseAnalysis);
        html += this.renderDashaConfirmation(data.dashaConfirmation);
        html += `<div class="pred-item" style="border-left:3px solid #9b6fff;">`;
        html += this.renderMDSearchPanel(mdNode, data.ascSid, data.ascSignNum, data._natalPlanetsMap, data._lords);
        html += this.renderHoraryPanel(transitPlanetsMap);
        html += `</div>`;
        return html;
    },

    // ===================== 15. TOP-LEVEL ANALYZE =====================

    /**
     * params: { natalPlanets, natalAsc, lords, dashaInfo }
     * dashaInfo (optional): output of PREDICTION_FORECASTING.getCurrentDashaInfo(date)
     *   — {mahadasha,antardasha,pratyantar,sukshma,prana}, each {lord,start,end}.
     * Produces the full dataset the renderer / UI panel needs.
     */
    analyze: function (params) {
        params = params || {};
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        if (!natalPlanets || !natalAsc) return null;
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;
        const ascSignNum = natalAsc.sn;
        const L = this._lords(params.lords);

        const planetDetails = this.getPlanetDetails(ascSid, ascSignNum, natalPlanets, L);
        const eventPromises = this.checkAllEventPromises(ascSid, natalPlanets, L);
        const independentHouses = this.getIndependentHouses(ascSid, natalPlanets, L);
        const goldenRuleClaims = this.getGoldenRuleClaims(ascSid, natalPlanets);
        const houseLordPlacements = this.getHouseLordPlacements(ascSignNum, natalPlanets, L);
        const houseExplorers = [];
        for (let h = 1; h <= 12; h++) houseExplorers.push(this.exploreHouse(h, ascSid, ascSignNum, natalPlanets, L));
        const cuspTableData = this.getCuspTableData(ascSid, ascSignNum, natalPlanets, L);
        const bhavaChalit = this.getBhavaChalitPlacements(ascSid, ascSignNum, natalPlanets);
        const planetScripts = this.getPlanetScripts(planetDetails);
        const houseScripts = this.getHouseScripts(houseExplorers);
        const dashaConfirmation = params.dashaInfo ? this.getDashaConfirmation(params.dashaInfo, ascSid, ascSignNum, natalPlanets, L) : null;
        const thirdHouseAnalysis = this.getThirdHouseAnalysis(ascSid, ascSignNum, natalPlanets, L);

        return {
            ascSid: ascSid, ascSignNum: ascSignNum,
            planetDetails: planetDetails, eventPromises: eventPromises,
            independentHouses: independentHouses, houseExplorers: houseExplorers,
            goldenRuleClaims: goldenRuleClaims, houseLordPlacements: houseLordPlacements,
            cuspTableData: cuspTableData, planetScripts: planetScripts, houseScripts: houseScripts,
            bhavaChalit: bhavaChalit,
            dashaConfirmation: dashaConfirmation, thirdHouseAnalysis: thirdHouseAnalysis,
            _natalPlanetsMap: natalPlanets, _lords: L
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION;
}