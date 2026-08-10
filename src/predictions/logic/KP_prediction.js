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
        marriage: {
            prime: [7], supporting: [2, 11], negative: [6, 10, 12], repeatBase: 7,
            note: 'Marriage promise = 2/7/11 combination; 6-10-12 delays/breaks it; 8th anywhere nearby brings complication (e.g. secret relationships, special marriage act).',
            reference: 'K.S. Krishnamurti, KP Reader Vols. I–VI (CSL axiom); KP Timing-of-Events lecture tradition (2-7-11 / 6-10-12 method).',
            effect: 'When promised cleanly (prime H7 matched, no negative house contested), marriage tends to happen smoothly during the determining planet\'s dasha/sub-period; a contested promise (6-10-12 or 8th also touched) still tends to happen, but with delay, friction, or complication attached.',
            remedy: 'Where 6-10-12 or the 8th complicate the 7th CSL, traditional practice offers Venus worship (harmony, relationships) on Fridays and quiet, non-transactional charity connected to marriage/family welfare — offered as a supportive practice, not a guaranteed fix.'
        },
        second_marriage: {
            prime: [7], supporting: [2, 9, 11], negative: [6, 8, 10, 12], repeatBase: 7,
            note: 'If 2-7-11 did not fructify for a first marriage, a second marriage is checked via 2-9-11 — also derivable via the general "3 houses forward per repeat occurrence" rule: 2nd spouse = 3rd-from-7th = 9th, 3rd spouse = 3rd-from-9th = 11th. 6-8-10-12 signals separation/divorce.',
            reference: 'K.S. Krishnamurti, KP Reader Vols. I–VI; "repeat occurrence = 3 houses forward" rule from the same Timing-of-Events tradition.',
            effect: 'A second marriage promised via 2-9-11 tends to follow the same delay/complication pattern as the first if 6-8-10-12 remain involved in the chain.',
            remedy: 'Same supportive practice as first marriage (Venus worship, non-transactional charity), with particular attention to whichever of 6-8-10-12 is repeating from the earlier failed promise, since that is the pattern actually asking to be addressed.'
        },
        divorce_separation: {
            prime: [6, 10, 12], supporting: [8], negative: [],
            note: 'Separative combination = 6-10-12 (8th nearby aggravates it further); classically the teacher weighs this over blaming the 1st house alone.',
            reference: 'KP Timing-of-Events lecture tradition (6-10-12 separative combination).',
            effect: 'A clean 6-10-12 (or 8th-reinforced) combination tends toward actual separation/divorce fructifying during the determining planet\'s period, rather than staying at the level of mere friction.',
            remedy: 'Astrology names the timing pattern; it does not replace honest communication or professional relationship counseling. Where offered, traditional practice is 7th-lord and Venus worship on Fridays alongside active mediation, not ritual alone.'
        },
        property_purchase: {
            prime: [4], supporting: [11, 12], negative: [8],
            note: 'Property purchase — primary house 4th (4/11/12 combination); 4th CSL and its star lord must show 4-11-12 involvement for the promise to be confirmed.',
            reference: 'K.S. Krishnamurti, KP Reader Vols. I–VI; KP Timing-of-Events tradition (4-11-12 property combination).',
            effect: 'A clean 4-11-12 promise tends to close during the determining planet\'s dasha/sub-period; 8th involvement tends to add legal/title complications or last-minute renegotiation rather than blocking the purchase outright.',
            remedy: 'Where 8th-house complication appears alongside the 4th CSL, traditional practice pairs a plain legal/title due-diligence review of the specific property with Moon worship (domestic harmony) on Mondays before finalizing — the legal check is not optional even when the astrology looks favourable.'
        },
        property_sale: {
            prime: [10], supporting: [3, 5], negative: [],
            note: 'Property SALE (as opposed to purchase) is read from the 10th CSL — a 3-5-10 combination signals selling.',
            reference: 'KP Timing-of-Events lecture tradition (10th-CSL, 3-5-10 sale combination).',
            effect: 'A clean 3-5-10 combination at the 10th CSL tends to produce an actual sale during that period, often at favourable terms if the 11th also touches in.',
            remedy: 'No strong remedy tradition attaches to a sale beyond timing patience — proceed once the 10th CSL/L1/L2 chain confirms rather than forcing a sale during an unsupportive sub-period.'
        },
        children: {
            prime: [5], supporting: [2, 11], negative: [4, 10, 12], repeatBase: 5,
            note: 'Child-birth promise = 2-5-11 combination (5th prime, esp. for the first child); 4-10-12 signals difficulty/no children. CAVEAT: if the 5th CSL and its star lord are BOTH in a Barren sign (Aries/Gemini/Leo/Virgo — Gemini and Leo are the MOST barren of the four), even a promise can be hard to fructify without medical help. Twins are suggested when CSL and star lord are both in a Dual sign, especially via Mercury.',
            reference: 'K.S. Krishnamurti, KP Reader Vols. I–VI (2-5-11 combination; Barren/Fruitful/Dual sign classification).',
            effect: 'A clean 2-5-11 promise (without Barren-sign complication) tends to deliver childbirth during the determining planet\'s period; Barren-sign involvement narrows the window and often needs medical support to align the timing.',
            remedy: 'Where the 5th CSL/star lord sit in Barren signs, medical fertility consultation comes FIRST — astrology here supports timing, it never substitutes for medical care. Alongside that, traditional practice is Jupiter worship (natural karaka of children) on Thursdays and patience through better-aligned sub-periods.'
        },
        job_service: {
            prime: [6], supporting: [10, 11], negative: [5, 8, 12],
            note: 'Job/service = 6th house; 6-10-11 favours winning competition/getting hired; 4-5-12 (or 5-8-12) works against it.',
            reference: 'KP Timing-of-Events lecture tradition (6-10-11 vs 4-5-12/5-8-12).',
            effect: 'A clean 6-10-11 promise tends to deliver hiring/placement during that period; 5-8-12 (or 4-5-12) involvement tends to produce instability — frequent job changes or a difficult, short-lived placement — rather than outright failure to find work.',
            remedy: 'Where 5-8-12 (or 4-5-12) dominates the 6th CSL, traditional practice is disciplined routine (Saturn\'s domain) plus Mars/Hanuman worship on Tuesdays for the persistence to ride out a competitive window, rather than switching jobs impulsively mid-affliction.'
        },
        promotion: {
            prime: [10], supporting: [6, 11], negative: [],
            note: 'Promotion = 10th house.',
            reference: 'KP Timing-of-Events lecture tradition (10th-house promotion rule).',
            effect: 'A clean 10th-house promise tends to deliver the promotion/status change during the determining planet\'s own dasha/sub-period.',
            remedy: 'No specific remedy tradition attaches beyond the general 10th-house practice of Sun worship (status, recognition) on Sundays and visible, consistent performance during the supportive period.'
        },
        wealth_income: {
            prime: [2], supporting: [6, 10, 11], negative: [5, 8, 12],
            note: 'The single best wealth combination is 2-6-10-11 ("maalamaal" combination). Its mirror-opposite 5-8-12 signifies financial loss/struggle — "what comes with one hand leaves with the other."',
            reference: 'KP Timing-of-Events lecture tradition (2-6-10-11 "maalamaal" combination and its 5-8-12 mirror).',
            effect: 'A clean 2-6-10-11 promise tends to produce steady, compounding gain during that period; a 5-8-12 mirror pattern tends to produce gains that arrive and then leak away just as fast.',
            remedy: 'Where the 5-8-12 mirror pattern dominates, the specific remedy recorded in the source teaching is quiet, ANONYMOUS charity performed from genuine inner conviction (not transactional bargaining) — see the 12th-CSL/8th-house case study for the full worked example.'
        },
        competition_litigation: {
            prime: [6], supporting: [10, 11], negative: [4, 5, 12],
            note: 'Winning competitions/court cases = 6-10-11; the losing combination is 4-5-12.',
            reference: 'KP Timing-of-Events lecture tradition (6-10-11 vs 4-5-12).',
            effect: 'A clean 6-10-11 promise tends to favour winning the competition/case during that period; 4-5-12 involvement tends to favour the other side or produce a drawn-out, costly process.',
            remedy: 'Where 4-5-12 dominates the 6th CSL/L1, traditional practice favours Mars worship (courage, the 6th\'s natural co-karaka) on Tuesdays and scrupulous documentation (3rd-house support) rather than escalating from a weak position.'
        },
        foreign_travel: {
            prime: [12], supporting: [3, 9], negative: [],
            note: '12th = foreign land/settlement; 3rd = short travel; 9th = long-distance travel.',
            reference: 'KP Timing-of-Events lecture tradition (12-3-9 travel combination).',
            effect: 'A clean 12-3-9 combination tends to produce the travel/settlement during the determining planet\'s period — 12th alone favours longer settlement, 3rd/9th alone favour shorter trips.',
            remedy: 'No strong remedy tradition attaches beyond the general 12th-house practice of Ketu/Saturn worship and quiet charity toward travellers or those settling abroad, offered as supportive rather than corrective.'
        },
        education: {
            prime: [4], supporting: [9], negative: [],
            note: 'KP-specific: primary education house is the 4th (not the 5th as in classical Parashari); 9th governs higher education.',
            reference: 'K.S. Krishnamurti, KP Reader Vols. I–VI — explicit KP departure from classical Parashari 5th-house education rule.',
            effect: 'A clean 4-9 combination tends to produce steady educational progress/qualification completion during that period.',
            remedy: 'Persistent 4th-CSL affliction is traditionally supported by Mercury worship (learning, communication) on Wednesdays and addressing the concrete study-environment factors the 4th house governs (home stability) rather than ritual alone.'
        },
        health_disease: {
            prime: [1], supporting: [6, 8, 12], negative: [],
            note: '1st = overall health/vitality baseline; a 6-8-12 combination at the 6th CSL/star-lord level signals disease (esp. chronic if repeated); 5-11 signals a healthy/disease-free period.',
            reference: 'KP Timing-of-Events lecture tradition (6-8-12 disease combination). This is a TIMING signal only — never a diagnosis.',
            effect: 'A repeated 6-8-12 pattern at the 6th CSL/star-lord level tends to coincide with active illness during that period; a clean 5-11 pattern tends to coincide with a genuinely healthy stretch. Always confirm with a qualified medical professional — this reading is not a diagnosis and should never delay seeking care.',
            remedy: 'This is a supportive/traditional layer only, never a substitute for medical diagnosis and treatment. Where a repeated 6-8-12 pattern shows, traditional practice is Saturn worship (patience, the 6th\'s co-karaka) on Saturdays and disciplined routine — alongside, never instead of, seeing a doctor.'
        },
        consultancy_advisory: {
            prime: [9], supporting: [3, 5], negative: [],
            note: '9th = consultancy of every kind, universally; 3rd/5th reinforce advisory/solutions work.',
            reference: 'KP Timing-of-Events lecture tradition (9th-house universal consultancy rule).',
            effect: 'A strong, clean 9th-house promise tends to produce visible advisory/consultancy success (reputation, client flow) during that period.',
            remedy: 'No specific remedy tradition attaches beyond the general 9th-house practice of ethical, well-sourced advice-giving (Jupiter\'s domain) — Jupiter worship on Thursdays is the traditional support for advisory/consultancy careers broadly.'
        },
        debt_loan_recovery: {
            prime: [6], supporting: [10, 11], negative: [5, 8, 9],
            note: 'Recovering money owed to you, or securing a loan, needs 6-10-11; a 5-8-9 combination at the 6th CSL/star-lord level signals the money stays stuck.',
            reference: 'KP Timing-of-Events lecture tradition (6-10-11 vs 5-8-9 recovery combination).',
            effect: 'A clean 6-10-11 promise tends to produce actual recovery/loan approval during that period; 5-8-9 involvement tends to keep the money stuck regardless of how strongly it is chased.',
            remedy: 'Where 5-8-9 dominates the 6th CSL/star-lord level, traditional practice is patient, undramatic follow-up (Saturn\'s domain) rather than confrontation, paired with Saturn worship on Saturdays.'
        }
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
    // ===================== 2½. BHAVA CHALIT — EQUAL BHAVA APPROXIMATION (RECHECKED) =====================
    //
    // CORRECTED DOCUMENTATION: an earlier version of this comment claimed
    // this was "the classical Sripati mid-point method verbatim" — that
    // was an overclaim and has been fixed. True Sripati Bhava Madhya uses
    // UNEQUAL house arcs: each house's midpoint is the arithmetic mean of
    // two ADJACENT cusps from a real house system (Placidus, etc.), which
    // are generally NOT 30° apart — the arc widths vary with latitude and
    // the Ascendant's exact degree. This codebase has no Placidus/oblique-
    // ascension cusp calculator (confirmed — no such function exists
    // elsewhere in the app), so true unequal Sripati cusps cannot be
    // computed here.
    //
    // What this module actually computes is the "EQUAL BHAVA" system — a
    // real, named, legitimately-used KP-adjacent convention (some KP
    // practitioners use it as a documented fallback when precise Placidus
    // data isn't available): the Ascendant is treated as house 1's
    // MIDPOINT (Bhava Madhya) rather than its start, and every house is
    // given an EQUAL 30° span (15° before to 15° after its midpoint).
    // This is mathematically identical to plain Equal-House-from-Ascendant,
    // just re-centered — it is NOT the same as unequal-arc Sripati, and
    // is presented as its own distinct, honestly-labelled method:
    //   1. House h's midpoint = Ascendant + (h-1)*30° (mod 360).
    //   2. Every house spans 30°: 15° before its midpoint to 15° after.
    //   3. A planet's Bhava (Chalit) house is whichever house's [start,end)
    //      arc its longitude falls into — which CAN differ from its plain
    //      sign-based (Rashi) house when the planet sits in the first/last
    //      ~15° of a sign ("shift"), exactly as real Bhava Chalit shifts
    //      work, even though the underlying arc widths here are equal
    //      rather than genuinely Placidus-derived.
    // Swap in true Placidus cusps here (feed them into getBhavaChalitCusps
    // in place of the equal-30° formula) if/when a real house-system
    // calculator becomes available in this codebase.
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

        // Explicit METHOD line — which of the module's rules actually fired for this verdict.
        const methodParts = [`Prime House ${primeHouse}'s CSL (${resolved.csl}) resolved via the "2 levels deep" rule${resolved.cslSelfStarred ? ' (self-starred, so CSL itself stands)' : ' to determining planet ' + resolved.determiningPlanet}.`];
        if (chainConfirms) methodParts.push('L1/L2 chain cross-check on the same CSL independently confirms (both levels show a prime house).');
        if (goldenClaimants.length) methodParts.push(`Golden-Rule scan (§4½) surfaced ${goldenClaimants.length} additional claimant planet(s) on the prime house.`);
        const method = methodParts.join(' ');

        // Explicit RESULT verdict — one line, independent of the styling/color logic in strength.
        const result = !promised
            ? `NOT PROMISED — ${detPlanet}'s numbers (H${detNumbers.join(',H') || '—'}) do not touch prime H${ev.prime.join(',H')}, and no L1/L2 or Golden-Rule confirmation was found either.`
            : (matchedNegative.length > 0 || invitesEighth)
                ? `PROMISED BUT CONTESTED — confirmed via H${matchedPrime.concat(chainConfirms ? ['L1/L2'] : []).join(', H') || 'chain/Golden-Rule'}, but negative house(s) H${matchedNegative.join(',H') || (invitesEighth ? '8' : '')} are also touched, so expect delay/friction rather than a clean outcome.`
                : `PROMISED — confirmed via H${matchedPrime.join(',H') || 'L1/L2 chain / Golden-Rule claim'}, with no contesting negative house touched.`;

        return {
            eventType: eventType, primeHouse: primeHouse, cusp: allCusps[primeHouse],
            resolved: resolved, determiningPlanet: detPlanet, determiningPlanetNumbers: detNumbers,
            chain: chain, l1Matches: l1Matches, l2Matches: l2Matches, chainConfirms: chainConfirms,
            goldenClaimants: goldenClaimants,
            matchedPrime: matchedPrime, matchedSupporting: matchedSupporting, matchedNegative: matchedNegative,
            invitesEighth: invitesEighth, promised: promised, strength: strength, eventInfo: ev,
            method: method, result: result,
            reference: ev.reference || null,
            effect: ev.effect || null,
            remedy: (matchedNegative.length > 0 || invitesEighth) ? (ev.remedy || null) : null
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

    // ===================== 8⅛. LOSS-HOUSE & REPEAT-EVENT RULES =====================
    //
    // Two compact, generalizable rules from the consolidated notes:
    //   RULE A ("नुकसान/Loss") — the LOSS or ENDING of any house's matters
    //     is read from the 12th house FROM that house (12th being the
    //     universal "loss/ending" house in every context, not just natally
    //     the birth-chart's own 12th). Worked example: job = 6th house, so
    //     job-CHANGE/job-LOSS is read from the 12th-from-6th = 5th house.
    //   RULE B ("दूसरी बार" — repeat occurrence) — a SECOND (or 3rd, 4th...)
    //     occurrence of the same kind of event is read 3 houses forward
    //     from the previous occurrence's house, chained: 1st child = 5th
    //     → 2nd child = 7th (3rd-from-5th) → 3rd child = 9th; 1st spouse =
    //     7th → 2nd spouse = 9th → 3rd spouse = 11th.
    getLossHouse: function (houseNum) {
        return this._mod12(houseNum + 11); // 12th from houseNum
    },

    getRepeatEventHouse: function (baseHouse, occurrenceNumber) {
        // occurrenceNumber: 1 = the base/first occurrence itself.
        let h = baseHouse;
        for (let i = 1; i < occurrenceNumber; i++) h = this._mod12(h + 2); // 3rd house forward each time
        return h;
    },


    //
    // Built directly from "प्रथम भाव के उपनक्षत्र स्वामी का अध्ययन" (Study of
    // the 1st House's Cuspal Sub Lord). Core principle stressed repeatedly
    // in that lecture: the 1st CSL's numbers (via its L1/star-lord, exactly
    // the same "2 levels deep" rule used everywhere else in this module —
    // this lecture explicitly confirms/validates that rule: "हम प्रॉमिस सिर्फ
    // स्टार लॉर्ड लेवल तक चेक करते हैं, इससे आगे नहीं जाना") stay relevant for
    // your WHOLE LIFE, not just a passing dasha period — they describe
    // lifelong attachments, priorities, personality and health baseline.
    FIRST_CSL_L1_HOUSE_TABLE: {
        1: { meaning: 'Strong physique and personality; overall good general health.', caution: 'Also inclines toward a SELF-CENTERED nature — thoughts habitually circle back to "what\'s in it for me" first.' },
        2: { meaning: 'Deep attachment to family; a "foodie" by nature; life spent thinking about wealth creation and generating money.' },
        3: { meaning: 'Attachment to younger siblings; loves travel, especially adventurous/challenging trips; a natural talent for NETWORKING — quickly forms bonds with new people.' },
        4: { meaning: 'Wants a comfortable, even luxurious, life; strongly home-loving ("doesn\'t want to leave the house"); deep attachment to mother; also supports learning ability, creativity, and a sporty inclination.', caution: 'For HEALTH specifically: the 4th house governs "healing power"/immunity — shown here (especially without 5th/11th support) it can signal LOW IMMUNITY / slower-than-average recovery when ill, even though it otherwise supports comfort and general wellbeing.' },
        5: { meaning: 'Good general health (one of the 3 primary health-supporting houses, with 1st and 11th); strong learning ability, creativity, sports-orientation.', caution: 'The 5th naturally "pulls" toward the 6th (fun/enjoyment absorbing daily-routine discipline) — such people can get so caught up enjoying themselves that they neglect a steady health regimen.' },
        6: { meaning: 'One of the 3 primary health-NEGATIVE houses if it works unfavourably — argumentative tendencies, disease-proneness.', caution: 'If the SAME 6th works favourably instead, it produces the opposite: a highly disciplined, routine-oriented, diet-conscious personality (early riser, structured lifestyle) — the same house, read positively rather than negatively.' },
        7: { meaning: 'Deep devotion/attachment to one\'s partner; a persistent preference for company — even small errands feel better done alongside someone else, rather than alone.' },
        8: { meaning: 'Gives longevity, but also brings real stress and pressure into life; can point to inherited wealth/property ("dowry"-type inheritance) alongside self-earned money.', caution: 'One of the 3 primary health-NEGATIVE houses. If it links up with OTHER negative houses (esp. the 12th), it can incline toward addiction. If it links with the 6th (disease) AND positive houses like 5th/11th are absent, it signals CHRONIC illness specifically.' },
        9: { meaning: 'Follows ideals and principles in life; considered a naturally "lucky" person; deep attachment to father; religious/philosophical mindset, follows role-models/idols.' },
        10: { meaning: 'Extremely career-oriented — life\'s focus centers on career and status; achieves standing largely through self-effort.' },
        11: { meaning: 'Highly ambitious; desires (especially social/gains-related) tend to eventually get fulfilled; very social, deeply attached to friends.', caution: 'The 11th is ALSO the "fast recovery" house — when it appears alongside the 5th (e.g. numbers like 5 and 11 together), even if illness does strike, recovery tends to be quick.' },
        12: { meaning: 'Prefers isolation/solitude; inclined toward meditation and charity; often generous to a fault ("spendthrift," especially on charity); can carry a foreign-travel/settlement promise.', caution: 'One of the 3 primary health-NEGATIVE houses — often linked to fluid-retention-type body issues, sudden hospitalization, or needing a doctor unexpectedly.' }
    },

    HEALTH_HOUSE_GROUPS: { good: [1, 5, 11], decent: [3], bad: [6, 8, 12], immunitySpecial: 4 },

    /**
     * Dedicated First House (Tanu Bhava) deep-dive: CSL chain, the
     * lifelong house-attachment readings from the table above, a health
     * verdict built from the good/bad/immunity/fast-recovery house
     * groups, and — since the source lecture's own worked example used
     * Rahu as the 1st CSL — the Rahu/Ketu sign-dispositor blending rule
     * (nodes additionally carry the results of the planet whose sign
     * they occupy).
     */
    getFirstHouseAnalysis: function (ascSid, ascSignNum, natalPlanetsMap, lords) {
        const L = this._lords(lords);
        const explored = this.exploreHouse(1, ascSid, ascSignNum, natalPlanetsMap, L);
        const chain = this.getL1L2Chain(explored.resolved.csl, ascSid, natalPlanetsMap);
        const houseSet = chain ? chain.L1_numbers : [];
        const readings = houseSet.map(h => Object.assign({ house: h }, this.FIRST_CSL_L1_HOUSE_TABLE[h] || {}));

        const goodHealth = houseSet.filter(h => this.HEALTH_HOUSE_GROUPS.good.includes(h) || this.HEALTH_HOUSE_GROUPS.decent.includes(h));
        const badHealth = houseSet.filter(h => this.HEALTH_HOUSE_GROUPS.bad.includes(h));
        const immunityFlag = houseSet.includes(this.HEALTH_HOUSE_GROUPS.immunitySpecial);
        const fastRecoveryFlag = houseSet.includes(5) && houseSet.includes(11);
        let healthVerdict = 'mixed';
        if (goodHealth.length && !badHealth.length) healthVerdict = 'favourable';
        else if (badHealth.length && !goodHealth.length) healthVerdict = 'challenging';

        let nodeBlend = null;
        const detPlanet = explored.resolved.determiningPlanet;
        if ((detPlanet === 'Rahu' || detPlanet === 'Ketu') && natalPlanetsMap[detPlanet] && L) {
            const nodeSignNum = natalPlanetsMap[detPlanet].sn;
            const dispositor = L[nodeSignNum];
            nodeBlend = {
                node: detPlanet, dispositor: dispositor,
                note: `${detPlanet} additionally carries the results of its sign-dispositor, ${dispositor} (Rahu/Ketu classically deliver the results of the planet whose sign they occupy). ${detPlanet === 'Rahu' ? 'Rahu leans the blend toward materialistic drive/attachment.' : 'Ketu leans the blend toward a more detached/spiritual orientation.'}`
            };
        }

        return { explored: explored, chain: chain, readings: readings, goodHealth: goodHealth, badHealth: badHealth, immunityFlag: immunityFlag, fastRecoveryFlag: fastRecoveryFlag, healthVerdict: healthVerdict, nodeBlend: nodeBlend };
    },

    renderFirstHouseAnalysis: function (data) {
        if (!data) return '';
        const c = data.explored.independent ? '#00DD77' : '#8899AA';
        const readingRows = data.readings.length ? data.readings.map(r => `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #FFD700;background:rgba(255,215,0,.06);">
                <b style="color:#FFD700;">Shows House ${r.house}</b>
                <div style="font-size:9.5px;color:var(--text);opacity:.9;margin-top:2px;">${r.meaning || ''}</div>
                ${r.caution ? `<div style="font-size:9px;color:#FF9F43;margin-top:2px;">${r.caution}</div>` : ''}
              </div>`).join('') : '<div style="font-size:9px;color:var(--muted);">No L1 houses resolved for the 1st CSL.</div>';
        const healthColor = data.healthVerdict === 'favourable' ? '#00DD77' : data.healthVerdict === 'challenging' ? '#FF4477' : '#FFD700';

        return `<div class="pred-item" style="border-left:3px solid #FFD700;margin-top:10px;">
                   <div class="pred-title" style="color:#FFD700;">🧍 First House (Tanu Bhava) — Dedicated Analysis</div>
                   <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">The 1st CSL's numbers stay relevant for your WHOLE life — the houses it signifies are lifelong attachment/priority areas, not just a passing period.</div>
                   <div style="margin-top:6px;padding:8px;border:1px solid ${c}44;border-radius:6px;background:${c}0A;">
                     CSL: <b>${data.explored.resolved.csl}</b>${data.explored.resolved.cslSelfStarred ? ' (self-starred)' : ' → determining planet: <b>' + data.explored.resolved.determiningPlanet + '</b>'}
                     ${data.explored.independent ? this._chip('INDEPENDENT HOUSE', '#00DD77') : ''}
                   </div>
                   ${data.nodeBlend ? `<div style="margin-top:6px;padding:6px 8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.06);font-size:9px;color:var(--text);">${data.nodeBlend.note}</div>` : ''}
                   <div style="margin-top:8px;font-size:9px;color:var(--muted);font-weight:bold;">LIFELONG HOUSE-ATTACHMENT READINGS:</div>
                   ${readingRows}
                   <div style="margin-top:8px;padding:8px;border:1px solid ${healthColor}44;border-radius:6px;background:${healthColor}0A;">
                     <b style="color:${healthColor};">HEALTH VERDICT: ${data.healthVerdict.toUpperCase()}</b>
                     <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:2px;">Good-health houses touched: H${data.goodHealth.join(',H') || '—'} · Negative-health houses touched: H${data.badHealth.join(',H') || '—'}</div>
                     ${data.immunityFlag ? `<div style="font-size:9px;color:#FF9F43;margin-top:2px;">⚠ 4th house present — possible LOW IMMUNITY / slower recovery from illness.</div>` : ''}
                     ${data.fastRecoveryFlag ? `<div style="font-size:9px;color:#00DD77;margin-top:2px;">✓ 5th+11th both present — FAST RECOVERY even if illness does occur.</div>` : ''}
                   </div>
                 </div>`;
    },

    // ===================== 8⅜. MEDICAL / MENTAL-HEALTH INDICATORS =====================
    //
    // From "Unlock Daily Predictions with KP Astrology": mental-health
    // questions specifically need FOUR factors read TOGETHER — the Moon
    // (as a planet), the 4th cusp (mind), the 5th cusp (intelligence),
    // and the 1st cusp (body) — never a single factor alone. Specific
    // affliction-to-condition mapping given in the same lecture: Rahu ->
    // schizophrenia-type patterns, Mars -> anxiety, Saturn -> depression,
    // Mercury -> epilepsy.
    MENTAL_HEALTH_AFFLICTION_MAP: {
        Rahu: { condition: 'Schizophrenia-type dissociative patterns', note: 'A Rahu linkage into the Moon/1st/4th/5th combination inclines toward schizophrenia-type patterns.', remedy: 'Supportive traditional practice only — Durga worship and calming, grounding routines are the recorded support for Rahu-linked patterns. This NEVER substitutes for psychiatric evaluation and treatment; please see a qualified mental-health professional.' },
        Mars: { condition: 'Anxiety', note: 'A Mars linkage into the same combination inclines toward anxiety-type patterns.', remedy: 'Supportive traditional practice only — Hanuman worship and physical exertion/exercise (Mars\'s domain) are the recorded support for Mars-linked patterns. This NEVER substitutes for professional evaluation; please see a qualified mental-health professional.' },
        Saturn: { condition: 'Depression', note: 'A Saturn linkage into the same combination inclines toward depression-type patterns.', remedy: 'Supportive traditional practice only — Shani/Hanuman worship and steady, structured daily routine (Saturn\'s domain) are the recorded support for Saturn-linked patterns. This NEVER substitutes for professional evaluation; please see a qualified mental-health professional.' },
        Mercury: { condition: 'Epilepsy', note: 'A Mercury linkage into the same combination inclines toward epilepsy-type patterns.', remedy: 'Supportive traditional practice only — Vishnu/Mercury worship is the recorded support for Mercury-linked patterns. This is a NEUROLOGICAL condition requiring proper medical diagnosis and treatment — astrology never substitutes for that.' }
    },

    MEDICAL_REFERENCE: 'Source teaching: "Unlock Daily Predictions with KP Astrology" — Moon + 1st + 4th + 5th read together, never a single factor alone. This entire section is a traditional TIMING/pattern layer, not a diagnosis, and never replaces consultation with a qualified doctor or mental-health professional.',

    getMedicalIndicators: function (ascSid, ascSignNum, natalPlanetsMap, lords) {
        const L = this._lords(lords);
        const moonDetail = (this.getPlanetDetails(ascSid, ascSignNum, natalPlanetsMap, L) || []).find(p => p.planet === 'Moon');
        const firstExplored = this.exploreHouse(1, ascSid, ascSignNum, natalPlanetsMap, L);
        const fourthExplored = this.exploreHouse(4, ascSid, ascSignNum, natalPlanetsMap, L);
        const fifthExplored = this.exploreHouse(5, ascSid, ascSignNum, natalPlanetsMap, L);

        const linkedAfflictions = [];
        [firstExplored, fourthExplored, fifthExplored].forEach(ex => {
            const det = ex.resolved.determiningPlanet;
            if (this.MENTAL_HEALTH_AFFLICTION_MAP[det]) linkedAfflictions.push(Object.assign({ house: ex.house, planet: det }, this.MENTAL_HEALTH_AFFLICTION_MAP[det]));
        });
        if (moonDetail && this.MENTAL_HEALTH_AFFLICTION_MAP[moonDetail.nakLord]) {
            linkedAfflictions.push(Object.assign({ house: "Moon's star lord", planet: moonDetail.nakLord }, this.MENTAL_HEALTH_AFFLICTION_MAP[moonDetail.nakLord]));
        }

        return { moon: moonDetail, first: firstExplored, fourth: fourthExplored, fifth: fifthExplored, linkedAfflictions: linkedAfflictions };
    },

    renderMedicalIndicators: function (data) {
        if (!data) return '';
        const afflictionRows = data.linkedAfflictions.length ? data.linkedAfflictions.map(a => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #FF4477;background:rgba(255,68,119,.08);">
                <b>${a.planet}</b> linked via ${typeof a.house === 'number' ? 'House ' + a.house : a.house} → <b style="color:#FF4477;">${a.condition}</b>
                <div style="font-size:8.5px;color:var(--text);opacity:.85;margin-top:2px;">${a.note}</div>
                <div style="font-size:8.5px;color:#00DD77;margin-top:3px;"><b>Remedy (supportive only):</b> ${a.remedy}</div>
              </div>`).join('') : '<div style="font-size:9px;color:var(--muted);">No Rahu/Mars/Saturn/Mercury affliction pattern detected across Moon/1st/4th/5th.</div>';

        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FF4477;font-size:10.5px;font-weight:bold;">🧠 Medical/Mental-Health Indicators (Moon + 1st + 4th + 5th)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Per the source teaching, mental-health questions specifically need these 4 factors read TOGETHER — never a single planet or cusp alone.</div>
                  <div style="font-size:9px;color:var(--text);margin-top:4px;">Moon: Star Lord ${data.moon ? data.moon.nakLord : '?'}, Sub Lord ${data.moon ? data.moon.subLord : '?'}</div>
                  <div style="font-size:9px;color:var(--text);margin-top:2px;">1st Cusp (Body) CSL: ${data.first.resolved.csl} · 4th Cusp (Mind) CSL: ${data.fourth.resolved.csl} · 5th Cusp (Intelligence) CSL: ${data.fifth.resolved.csl}</div>
                  <div style="margin-top:6px;font-size:9px;color:var(--muted);font-weight:bold;">AFFLICTION-TYPE LINKAGE:</div>
                  ${afflictionRows}
                  <div style="font-size:7.5px;color:var(--muted);margin-top:6px;font-style:italic;border-top:1px dashed rgba(255,255,255,0.08);padding-top:4px;">${this.MEDICAL_REFERENCE}</div>
                </details>`;
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
          5: {
                meaning: 'Job/employment tends to change frequently — real difficulty staying in one job/role for long.',
                alignment: 'The fix is to consciously tie the job to 5th-house energy — creativity, self-expression, genuine enjoyment/entertainment — rather than approaching it purely as routine/discipline. The same house that "unsettles" the job (5th) is the house that stabilizes it once deliberately engaged: seek or reshape the work so it lets you create, perform, or enjoy the process, and it will hold far more steadily.'
            },
            7: {
                meaning: 'A relationship may develop with an employee/colleague; a possible reproductive-organ-related health issue; possible business partnership with an employee; some spouse-related tension is also possible since both 6th and 7th get engaged together.',
                alignment: 'Discipline in how you interact with people — especially at work — is the single most important practice here; with clear limits in place, none of the above need cause real trouble.'
            },
            8: {
                meaning: 'The 6th (service/routine/competition) and 8th (transformation/depth) link at the CSL/L1-L2 level — the classic astrological/occult-intelligence combination, but manifesting through whatever domain the 6th house is being read for. For health questions it commonly shows as "will need surgery, but the healing itself comes cleanly through the 8th house" (invasive treatment that resolves the problem) rather than pure suffering.',
                alignment: 'Career-relevant: this person is naturally suited to work where 6th-house routine/service meets 8th-house depth/transformation — surgery, invasive medicine, forensic or investigative work, research, or occult/astrological practice itself. Common-sense (5th house) and depth-intelligence (8th house) linking is what the source teaching calls the "ultimate" astrological brain — but it also means such a mind can look "impractical" to ordinary common-sense people, which is fine and expected.'
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
            },
            8: {
                meaning: 'Sudden disappointments, failures, and large unexpected losses — a classical book-reading the teacher explicitly cites as normally very negative.',
                alignment: 'The specific remedy recorded in the source teaching: quiet, ANONYMOUS charity — done so privately that (per the saying) "not even your own shadow knows" — reliably prevented these sudden losses in the case observed. Intention matters: charity performed transactionally ("I\'ll donate so my luck improves") is recorded as working far less reliably than charity done from genuine inner conviction that quiet giving is simply one\'s path, with no expectation attached.'
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
 // ===================== 8¾. CAREER ALIGNMENT =====================
    //
    // Applies the same Alignment principle (fix a house's problem THROUGH
    // that same house's energy, rather than fighting it) specifically to
    // career, using the 6th (job/service/competition) and 10th (career/
    // status) CSL chains, plus a "career-type by house emphasis" reading
    // built from which houses the source lectures explicitly tied to
    // which kind of work.
    CAREER_TYPE_BY_HOUSE: {
        3: { type: 'Marketing / Commission / Agency-Franchise / Documentation', note: 'Strong 3rd-house involvement favours marketing, commission-based work, franchise/agency business, and short-travel-heavy roles.' },
        5: { type: 'Creative / Entertainment / Speculative / Advisory-Solutions', note: '5th house is the "common sense" and creativity house — careers built around creativity, performance, speculation, or entertaining/engaging others thrive here.' },
        6: { type: 'Service / Routine Execution / Competitive Roles (jobs, exams, litigation)', note: '6th house governs job/service, competitive exams, and litigation — most job-related questions in practice trace back to the 6th CSL.' },
        7: { type: 'Business / Trading / Client-Facing Commerce', note: 'A strong 7th house favours transactional, exchange-based business — but per the source teaching, over-emphasizing 7th (business/trading mindset) tends to "empty out" 8th-house depth, which is part of why natural businesspeople and natural occultists/astrologers rarely overlap.' },
        8: { type: 'Occult / Research / Surgery / Deep Transformation Work', note: '8th house is the house of astrologers, surgeons, researchers, and anyone working with hidden or transformative forces — depth-of-insight professions.' },
        9: { type: 'Consultancy / Advisory / Higher Education / Publishing', note: '9th house is the universal house of consultancy, in any field.' },
        10: { type: 'Career / Status / Public Profession (general)', note: 'The default house for career/profession/status/promotion.' },
        11: { type: 'Ambition-Driven / Network-Based / Gains-Focused Roles', note: '11th house amplifies ambition and expectation wherever it shows up — a chart with 11th strongly active across many CSLs tends toward restless, ambition-driven career paths; the recorded antidote is deliberately curating one\'s social circle, since "your company defines your 11th house."' }
    },

    /**
     * Career Alignment analysis: reads the 6th (job/service) and 10th
     * (career/status) CSL chains, ranks career-TYPE fit by how strongly
     * each CSL's determining planet's numbers touch the CAREER_TYPE_BY_HOUSE
     * houses across the whole chart, and applies the two specific,
     * sourced career remedies:
     *   - 6th CSL/L1 = 5th → job instability; fix by engaging 5th-house
     *     (creative/self-expressive) energy in the work itself.
     *   - 6th CSL/L1 or L2 = 8th → naturally suited to 6-8 combination
     *     work (surgery, invasive medicine, research, occult/astrology).
     */
    getCareerAlignment: function (ascSid, ascSignNum, natalPlanetsMap, lords) {
        const sixthExplored = this.exploreHouse(6, ascSid, ascSignNum, natalPlanetsMap, lords);
        const tenthExplored = this.exploreHouse(10, ascSid, ascSignNum, natalPlanetsMap, lords);
        const sixthChain = this.getL1L2Chain(sixthExplored.resolved.csl, ascSid, natalPlanetsMap);
        const tenthChain = this.getL1L2Chain(tenthExplored.resolved.csl, ascSid, natalPlanetsMap);
        const sixthInterpretations = this.getCSL_L1_Interpretation(6, ascSid, natalPlanetsMap);

        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const emphasisScore = {};
        for (let h = 1; h <= 12; h++) {
            const resolved = this.resolveDeterminingPlanetPrecise(h, allCusps, natalPlanetsMap);
            if (!resolved) continue;
            const numbers = planetNumbers[resolved.determiningPlanet] || [];
            numbers.forEach(n => { if (this.CAREER_TYPE_BY_HOUSE[n]) emphasisScore[n] = (emphasisScore[n] || 0) + 1; });
        }
        const rankedCareerTypes = Object.keys(emphasisScore)
            .map(h => Object.assign({ house: Number(h), score: emphasisScore[h] }, this.CAREER_TYPE_BY_HOUSE[h]))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const jobStabilityFlag = sixthInterpretations.some(i => i.house === 5);
        const surgeryLinkFlag = sixthInterpretations.some(i => i.house === 8);

        return {
            sixth: { explored: sixthExplored, chain: sixthChain, interpretations: sixthInterpretations },
            tenth: { explored: tenthExplored, chain: tenthChain },
            rankedCareerTypes: rankedCareerTypes, jobStabilityFlag: jobStabilityFlag, surgeryLinkFlag: surgeryLinkFlag
        };
    },

    renderCareerAlignment: function (data) {
        if (!data) return '';
        const rankRows = data.rankedCareerTypes.map((r, i) => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid ${i === 0 ? '#00DD77' : '#66CCFF'};background:${i === 0 ? 'rgba(0,221,119,.08)' : 'rgba(102,204,255,.05)'};">
                <b>#${i + 1}: ${r.type}</b> <span style="font-size:8.5px;color:var(--muted);">(H${r.house}, emphasis score ${r.score})</span>
                <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">${r.note}</div>
              </div>`).join('') || '<div style="font-size:9px;color:var(--muted);">No career-type emphasis pattern detected.</div>';

        const s = data.sixth, t = data.tenth;
        const sixthBlock = `<div style="margin-top:6px;padding:8px;border:1px solid #FFD70044;border-radius:6px;background:rgba(255,215,0,.05);">
              <div style="font-size:10px;color:#FFD700;font-weight:bold;">6th House (Job/Service) CSL Chain</div>
              <div style="font-size:9px;color:var(--text);margin-top:2px;">CSL: <b>${s.explored.resolved.csl}</b>${s.explored.resolved.cslSelfStarred ? ' (self-starred)' : ' → determining planet: <b>' + s.explored.resolved.determiningPlanet + '</b>'}</div>
              ${s.chain ? `<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">L1 = ${s.chain.L1_planet} (H${s.chain.L1_numbers.join(',H') || '—'}) · L2 = ${s.chain.L2_planet} (H${s.chain.L2_numbers.join(',H') || '—'})</div>` : ''}
            </div>`;

        const tenthBlock = `<div style="margin-top:6px;padding:8px;border:1px solid #66CCFF44;border-radius:6px;background:rgba(102,204,255,.05);">
              <div style="font-size:10px;color:#66CCFF;font-weight:bold;">10th House (Career/Status) CSL Chain</div>
              <div style="font-size:9px;color:var(--text);margin-top:2px;">CSL: <b>${t.explored.resolved.csl}</b>${t.explored.resolved.cslSelfStarred ? ' (self-starred)' : ' → determining planet: <b>' + t.explored.resolved.determiningPlanet + '</b>'}</div>
              ${t.chain ? `<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">L1 = ${t.chain.L1_planet} (H${t.chain.L1_numbers.join(',H') || '—'}) · L2 = ${t.chain.L2_planet} (H${t.chain.L2_numbers.join(',H') || '—'})</div>` : ''}
            </div>`;

        const flags = [];
        if (data.jobStabilityFlag) {
            const interp = s.interpretations.find(i => i.house === 5);
            flags.push(`<div style="margin-top:6px;padding:6px 8px;border-left:3px solid #FF4477;background:rgba(255,68,119,.08);">
                <b style="color:#FF4477;">⚠ Job-Instability Signature Detected</b>
                <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:2px;">${interp ? interp.meaning : 'Job/employment tends to change frequently.'}</div>
                <div style="font-size:9px;color:#00DD77;margin-top:3px;"><b>Career Alignment fix (remedy):</b> ${interp ? interp.alignment : ''}</div>
                <div style="font-size:7.5px;color:var(--muted);margin-top:3px;font-style:italic;"><b>Reference:</b> 6th CSL/L1=5th pattern, source teaching on Career Alignment (Alignment principle: fix a house's problem through that same house's energy).</div>
              </div>`);
        }
        if (data.surgeryLinkFlag) {
            const interp = s.interpretations.find(i => i.house === 8);
            flags.push(`<div style="margin-top:6px;padding:6px 8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.08);">
                <b style="color:#9b6fff;">🔬 6-8 Combination Detected (Occult/Surgical/Research Fit)</b>
                <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:2px;">${interp ? interp.meaning : ''}</div>
                <div style="font-size:9px;color:#00DD77;margin-top:3px;"><b>Effect:</b> ${interp ? interp.alignment : ''}</div>
                <div style="font-size:7.5px;color:var(--muted);margin-top:3px;font-style:italic;"><b>Reference:</b> 6th CSL/L1 or L2=8th pattern, source teaching on Career Alignment (6-8 depth-of-insight professions).</div>
              </div>`);
        }

        return `<div class="pred-item" style="border-left:3px solid #66CCFF;margin-top:10px;">
                   <div class="pred-title" style="color:#66CCFF;">💼 Career Alignment</div>
                   <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Career-type fit ranked by which houses the chart's CSL chains emphasize most, plus the specific job-instability and 6-8 occult/surgical-fit signatures from the source lectures.</div>
                   <div style="font-size:9px;color:var(--muted);font-weight:bold;margin-top:4px;">RANKED CAREER-TYPE FIT:</div>
                   ${rankRows}
                   ${sixthBlock}
                   ${tenthBlock}
                   ${flags.join('')}
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
    /**
     * Cuspal aspects: which natal planets cast a Vedic special aspect onto
     * this house (Mars 4th/7th/8th, Jupiter 5th/7th/9th, Saturn 3rd/7th/10th,
     * others universal 7th) — the "Asp By" column. "Cuspal-Asp" (the
     * cusp's own outgoing aspect) is taken here as the universal 7th/
     * opposite house — a documented convention, since a bare cusp (not a
     * planet) has no special-aspect rule of its own in classical KP.
     */
    getCuspAspects: function (houseNum, natalPlanetsMap) {
        const aspectOffsets = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], default: [7] };
        const aspectedBy = [];
        Object.keys(natalPlanetsMap || {}).forEach(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.house === undefined) return;
            const offs = aspectOffsets[p] || aspectOffsets.default;
            if (offs.some(o => this._mod12(pd.house + o - 1) === houseNum)) aspectedBy.push(p);
        });
        return { aspectedBy: aspectedBy, cuspalAspectHouse: this._mod12(houseNum + 6) };
    },

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
            const significators = this.getSignificators(h, natalPlanetsMap, ascSignNum, L);
            const aspects = this.getCuspAspects(h, natalPlanetsMap);
            out.push({
                house: h, sign: this.SIGN_NAMES[signNum], degInSign: degInSign,
                signLord: houseLord, nakLord: c.nakLord, subLord: c.subLord, subSubLord: c.subSubLord,
                nlHouses: planetNumbers[c.nakLord] || [], slHouses: planetNumbers[c.subLord] || [],
                houseLord: houseLord, occupants: occupants, significators: significators, aspects: aspects
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
        const rows = cuspTableData.map(c => {
            const sig = c.significators;
            return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:4px 6px;font-weight:bold;color:#FF69B4;">Cusp ${c.house}</td>
              <td style="padding:4px 6px;">${c.sign} ${c.degInSign.toFixed(2)}°</td>
              <td style="padding:4px 6px;color:#FFD700;">${c.signLord || '—'}</td>
              <td style="padding:4px 6px;">${c.nakLord}</td>
              <td style="padding:4px 6px;color:#00DD77;font-weight:bold;">${c.subLord}</td>
              <td style="padding:4px 6px;">${c.subSubLord}</td>
              <td style="padding:4px 6px;font-size:8.5px;color:var(--cyan,#66CCFF);">${sig.level1_occupants.join(' ') || '—'}</td>
              <td style="padding:4px 6px;font-size:8.5px;">${sig.level2_starLordOfOccupants.join(' ') || '—'}</td>
              <td style="padding:4px 6px;font-size:8.5px;">${sig.level1_occupants.join(' ') || '—'}</td>
              <td style="padding:4px 6px;font-size:8.5px;">${(sig.level4_starLordOfHouseLord ? [sig.level4_starLordOfHouseLord] : []).join(' ') || '—'}</td>
              <td style="padding:4px 6px;font-size:8.5px;">${sig.level3_houseLord || '—'}</td>
              <td style="padding:4px 6px;font-size:8px;color:var(--muted);">${c.aspects.aspectedBy.join(' ') || '—'}</td>
              <td style="padding:4px 6px;font-size:8px;color:var(--muted);">H${c.aspects.cuspalAspectHouse}</td>
            </tr>`;
        }).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FF69B4;font-size:10.5px;font-weight:bold;">📐 Cuspal Table — All 12 House Cusps (SignLord / StarLord / SubLord / SSL / Significators / Aspects)</summary>
                  <div style="font-size:8px;color:var(--muted);margin:4px 0;">Columns A/B/C/D follow the classical 4-level significator scheme: B=OCCU (occupants, strongest), A=Star Lord of occupants, D=Sign/House Lord, C=planet in Sign Lord's own star (weakest) — same data as the "4-level Significators" method, laid out KP-software-style. "Cuspal-Asp" is this module's documented convention: the cusp's own outgoing aspect = the opposite (7th) house, since a bare cusp has no special-aspect rule of its own.</div>
                  <div style="overflow-x:auto;margin-top:6px;">
                  <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                    <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                      <th style="padding:4px 6px;">Cusp</th><th style="padding:4px 6px;">Sign/Deg</th><th style="padding:4px 6px;">SignLord</th>
                      <th style="padding:4px 6px;">StarLord</th><th style="padding:4px 6px;">SubLord</th><th style="padding:4px 6px;">SSL</th>
                      <th style="padding:4px 6px;">B-OCCU</th><th style="padding:4px 6px;">A-STL of Occu.</th><th style="padding:4px 6px;">Occupants</th>
                      <th style="padding:4px 6px;">C-In SignLord's Star</th><th style="padding:4px 6px;">D-Lord</th>
                      <th style="padding:4px 6px;">Asp By</th><th style="padding:4px 6px;">Cuspal-Asp</th>
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
    /**
     * ENHANCED (KP-correct) version of searchTransitWindows(): instead of
     * checking only the transiting planet's SIGN-based house/aspect, this
     * checks the transiting planet's own NAKSHATRA LORD's script (the
     * PROMISE layer — does the star it's passing through signify the
     * target houses) and its SUB LORD's script (the RESULT layer — does
     * the finer sub-division agree). This directly implements "use
     * transit to find nakshatra lord for house activation/promise, then
     * sub lord for result" — a real validation upgrade over the sign-only
     * approximation in searchTransitWindows() above (kept for backward
     * compatibility / as a fallback when natalPlanetsMap isn't available).
     */
    searchTransitWindowsKP: function (eventType, ascSid, ascSignNum, fromDate, toDate, getPosFn, stepDays, natalPlanetsMap, lords) {
        const ev = this.EVENT_PRIME_HOUSES[eventType];
        if (!ev || typeof getPosFn !== 'function' || !natalPlanetsMap) return [];
        const targetHouses = ev.prime.concat(ev.supporting || []);
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);

        const readPlanet = (p) => {
            if (!p || p.sid === undefined) return null;
            const kp = this._getKPLords(p.sid);
            const promiseHouses = planetNumbers[kp.nakLord] || [];
            const resultHouses = planetNumbers[kp.subLord] || [];
            return { nakLord: kp.nakLord, subLord: kp.subLord, promiseHouses: promiseHouses, resultHouses: resultHouses, promise: promiseHouses.some(h => targetHouses.includes(h)), result: resultHouses.some(h => targetHouses.includes(h)) };
        };

        const candidates = [];
        const step = stepDays || 30;
        for (let t = fromDate.getTime(); t <= toDate.getTime(); t += step * 24 * 3600 * 1000) {
            const d = new Date(t);
            let pos;
            try { pos = getPosFn(d); } catch (e) { continue; }
            if (!pos) continue;

            const jupiter = readPlanet(pos.Jupiter);
            if (!jupiter || !jupiter.promise) continue; // Jupiter's promise gates the YEAR-level candidate, same role as before
            const sun = readPlanet(pos.Sun);
            const moon = readPlanet(pos.Moon);

            candidates.push({
                date: d, jupiter: jupiter, sun: sun, moon: moon,
                allThreeAligned: !!(jupiter.promise && jupiter.result && sun && sun.promise && moon && moon.promise)
            });
        }
        return candidates;
    },
// ===================== 11½. UNIFIED EVENT-FINDING PROCESS (KP Promise → Dasha → Gochar) =====================
    //
    // THE single orchestrating pipeline for "when will this event happen?",
    // exactly matching the classical 3-stage method taught across these
    // lectures:
    //   STAGE 1 — PROMISE ("will it happen at all?"): checkEventPromise()
    //             — the natal CSL method. If there's no promise, the
    //             remaining stages are moot (an unpromised event doesn't
    //             happen no matter how supportive the dasha or transit is).
    //   STAGE 2 — MAHADASHA/ANTARDASHA SUPPORT ("during which period?"):
    //             searchSupportingWindowsInMahadasha() — within the
    //             CURRENT Mahadasha, which Antardasha/Pratyantardasha/
    //             Sookshma windows have a lord whose numbers support the
    //             event's prime house.
    //   STAGE 3 — GOCHAR / TRANSIT ("exactly when, within that window?"):
    //             searchTransitWindows() — Jupiter's transit pins the
    //             YEAR, the Sun's pins the MONTH, the Moon's pins the DAY,
    //             all searched only inside each Stage-2 window (not the
    //             whole Mahadasha) so the search stays tight and relevant.
    // A caller only needs `getPosFn` (the app's global getPos) to run all
    // 3 stages in one call.
    findEventWindow: function (params) {
        params = params || {};
        const eventType = params.eventType, ascSid = params.ascSid, ascSignNum = params.ascSignNum,
              natalPlanetsMap = params.natalPlanetsMap, lords = params.lords, mdNode = params.mdNode,
              getPosFn = params.getPosFn, searchFrom = params.searchFrom, searchTo = params.searchTo;

        const stage1 = this.checkEventPromise(eventType, ascSid, natalPlanetsMap, lords);
        const stage2 = mdNode ? this.searchSupportingWindowsInMahadasha(mdNode, eventType, ascSid, ascSignNum, natalPlanetsMap, lords) : [];

        const stage3 = [];
        if (typeof getPosFn === 'function' && stage2.length) {
            stage2.forEach(win => {
                const winStart = new Date(win.start).getTime(), winEnd = new Date(win.end).getTime();
                const from = (searchFrom && searchFrom.getTime() > winStart) ? searchFrom : new Date(winStart);
                const to = (searchTo && searchTo.getTime() < winEnd) ? searchTo : new Date(winEnd);
                if (from.getTime() >= to.getTime()) return;
                // Prefer the KP-correct (nakshatra-lord promise + sub-lord
                // result) search whenever natal data is available; fall
                // back to the sign/aspect-only method otherwise.
                const useKP = !!natalPlanetsMap;
                const hits = useKP
                    ? this.searchTransitWindowsKP(eventType, ascSid, ascSignNum, from, to, getPosFn, 30, natalPlanetsMap, lords)
                    : this.searchTransitWindows(eventType, ascSignNum, from, to, getPosFn, 30);
                const aligned = hits.filter(h => h.allThreeAligned);
                stage3.push({ subPeriod: win, method: useKP ? 'nakshatra-lord+sub-lord (KP-correct)' : 'sign/aspect-only (fallback)', jupiterYearCandidates: hits, allThreeAligned: aligned });
            });
        }

        return { eventType: eventType, stage1_promise: stage1, stage2_dashaSupport: stage2, stage3_transitTiming: stage3 };
    },

    renderFindEventWindow: function (report) {
        if (!report) return '';
        const p = report.stage1_promise;
        const promiseColor = p ? this._color(p.strength) : '#8899AA';
        const stage1Html = p ? `<div style="padding:6px 8px;border-left:3px solid ${promiseColor};background:${promiseColor}0A;">
              <b style="color:${promiseColor};">STAGE 1 — PROMISE: ${p.strength.toUpperCase()}</b>
              <div style="font-size:9px;color:var(--text);opacity:.85;margin-top:2px;">Prime H${p.primeHouse} CSL = ${p.resolved.csl}${p.resolved.cslSelfStarred ? ' (self-starred)' : ' → ' + p.resolved.determiningPlanet}. Numbers: ${p.determiningPlanetNumbers.join(', ') || '—'}.</div>
            </div>` : `<div style="font-size:9px;color:var(--muted);">Stage 1 unavailable — unknown event type.</div>`;

        let stage2Html = '<div style="font-size:9px;color:var(--muted);margin-top:6px;">No Mahadasha data supplied — Stage 2 skipped.</div>';
        if (report.stage2_dashaSupport && report.stage2_dashaSupport.length) {
            stage2Html = `<div style="margin-top:6px;font-size:9px;color:var(--muted);font-weight:bold;">STAGE 2 — SUPPORTING SUB-PERIODS IN CURRENT MAHADASHA:</div>` +
                report.stage2_dashaSupport.map(r => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #66CCFF;background:rgba(102,204,255,.06);">
                    <b>${r.level}: ${r.lord}</b> <span style="font-size:8.5px;color:var(--muted);">${new Date(r.start).toDateString()} → ${new Date(r.end).toDateString()}</span>
                  </div>`).join('');
        } else if (report.stage2_dashaSupport) {
            stage2Html = '<div style="font-size:9px;color:var(--muted);margin-top:6px;">No supporting sub-period found in the current Mahadasha.</div>';
        }

        let stage3Html = '';
        if (report.stage3_transitTiming && report.stage3_transitTiming.length) {
            stage3Html = `<div style="margin-top:6px;font-size:9px;color:var(--muted);font-weight:bold;">STAGE 3 — GOCHAR (TRANSIT) TIMING WITHIN THOSE WINDOWS:</div>` +
                report.stage3_transitTiming.map(s => {
                    const isKP = !!(s.jupiterYearCandidates[0] && s.jupiterYearCandidates[0].jupiter && s.jupiterYearCandidates[0].jupiter.nakLord);
                    const bestRows = (s.allThreeAligned.length ? s.allThreeAligned : s.jupiterYearCandidates.slice(0, 3))
                        .map(c => {
                            if (isKP) {
                                return `<div style="font-size:8.5px;color:${c.allThreeAligned ? '#00DD77' : 'var(--muted)'};margin-top:2px;">${c.date.toDateString()} — Jupiter NL ${c.jupiter.nakLord}/SL ${c.jupiter.subLord} (promise${c.jupiter.result ? '+result' : ''})${c.allThreeAligned ? ` · Sun NL ${c.sun.nakLord} · Moon NL ${c.moon.nakLord} (ALL ALIGNED — strong candidate)` : ' (year-level candidate only)'}</div>`;
                            }
                            return `<div style="font-size:8.5px;color:${c.allThreeAligned ? '#00DD77' : 'var(--muted)'};margin-top:2px;">${c.date.toDateString()} — Jupiter H${c.jupiterHouse}${c.allThreeAligned ? ' · Sun H' + c.sunHouse + ' · Moon H' + c.moonHouse + ' (ALL ALIGNED — strong candidate)' : ' (year-level candidate only)'}</div>`;
                        }).join('');
                    return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #FFD700;background:rgba(255,215,0,.06);">
                        <b style="color:#FFD700;">${s.subPeriod.level}: ${s.subPeriod.lord}</b> <span style="font-size:8px;color:var(--muted);">(method: ${s.method || 'legacy'})</span>
                        ${bestRows || '<div style="font-size:8.5px;color:var(--muted);">No Jupiter transit hit found in this window.</div>'}
                      </div>`;
                }).join('');
        }

        return `<div class="pred-item" style="border-left:3px solid #FF9F43;margin-top:10px;">
                   <div class="pred-title" style="color:#FF9F43;">🎯 Unified Event-Finding Process — ${(report.eventType || '').replace(/_/g, ' ')}</div>
                   <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Stage 1 (KP Promise) → Stage 2 (Mahadasha/Antardasha support) → Stage 3 (Gochar: Jupiter=year, Sun=month, Moon=day).</div>
                   ${stage1Html}
                   ${stage2Html}
                   ${stage3Html}
                 </div>`;
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
 // ===================== 12½. CASE STUDY LIBRARY =====================
    //
    // Concrete worked examples pulled directly from the source lectures —
    // kept as a reference library so predictions can be explained the way
    // the teacher explained them (rule → applied to a real chart →
    // observed outcome), rather than as abstract theory only. Each entry
    // names the exact rule used, so `verifyCaseStudyPattern()` below can
    // re-apply the SAME rule to any chart passed in (useful for confirming
    // you've understood a rule correctly on your own data).
    CASE_STUDIES: [
        {
            id: 'election_l1_l2',
            title: 'Election / Competitive-Winner Prediction via L1-L2 (Horary)',
            source: 'KP Horary Secrets',
            setup: 'Horary number 24 was used to ask whether a specific ("X") political party would win an election.',
            method: 'CSL resolved to the Sun. The Sun\'s own L1 (star lord\'s numbers) = house 4, L2 (sub lord\'s numbers) = house 5 — neither is a winning house for the QUERIED party itself.',
            conclusion: 'Because the queried party\'s own significators landed on non-winning houses (4, 5), and the "opposition" party\'s equivalent houses (counted 7th-from, i.e. 10 and 11 relative to 4 and 5) ARE favourable, the verdict given was: the queried party does NOT win — the opposition does. Demonstrates using the L1/L2 chain plus opposite-party house-counting for competitive yes/no questions.',
            houseKey: null
        },
        {
            id: 'surgery_horary_44',
            title: "Father's Surgery — Horary Question",
            source: 'KP Horary Secrets',
            setup: 'A student asked (via a horary number, ~44) whether doctors would go ahead with surgery on their father.',
            method: 'Checked the 6th CSL (disease/treatment) at the L1 level specifically for 8th-house involvement — the stated rule: "without the 8th house showing up, surgery cannot happen."',
            conclusion: 'The 6th CSL\'s L1 did NOT show the 8th house, so the answer given was: no surgery. This is the specific sub-rule this module encodes as the "surgeryLinkFlag" check inside getCareerAlignment() and can be checked for any chart via getCSL_L1_Interpretation(6, ...).',
            houseKey: 6
        },
        {
            id: 'job_instability_6_5',
            title: 'Chronic Job Instability',
            source: 'KP Horary Secrets / Karma Alignment',
            setup: 'A person reported repeatedly being unable to hold a job for long — frequent, involuntary job changes.',
            method: 'The 6th CSL\'s L1 showed house 5.',
            conclusion: 'Diagnosis: the instability traces to the person not engaging the 5th-house (creative/self-expressive/enjoyable) side of their work. Alignment fix: consciously tie the job to something creatively engaging, rather than only trying to be more disciplined about a joyless role. Encoded directly as `jobStabilityFlag` in getCareerAlignment().',
            houseKey: 6
        },
        {
            id: 'secret_charity_12_8',
            title: 'Sudden Losses — 12th CSL Showing the 8th House',
            source: 'KP Horary Secrets',
            setup: 'A chart repeatedly produced sudden disappointments, failures, and large unexpected losses.',
            method: 'The 12th CSL\'s L1 showed the 8th house — a combination a classical reference text calls out explicitly as very negative.',
            conclusion: 'Applied fix: quiet, anonymous charity performed from genuine inner conviction (not transactionally, "I do this so I avoid loss") reliably prevented the sudden losses in the case observed. Demonstrates Alignment as an ongoing PRACTICE, not a one-time remedy. Encoded in CSL_L1_INTERPRETATIONS[12][8].',
            houseKey: 12
        },
        {
            id: 'wealth_5_8_pattern',
            title: '"5-8 Everywhere" Wealth Pattern',
            source: 'KP Horary Secrets',
            setup: 'A chart where most/all planets show the 5-8 combination in their own numbers/script — usually read as a poor financial pattern.',
            method: 'Rather than reading a repeating 5-8 pattern as pure misfortune, it is reframed as one\'s SPECIFIC pair of life-houses (everyone\'s finances run through exactly 2 houses that "feed, amuse, and hurt" them the most).',
            conclusion: 'The practical fix: build financial life directly around 5-8 activities (creativity/speculation combined with depth/research/transformation), and let money earned specifically THROUGH 5-8 work flow generously back out rather than trying to hoard/save it through unrelated channels. A repeating pattern across a whole chart names your life\'s central axis, not a curse — the same logic applies to any house that keeps repeating across many planets\' scripts (e.g. a dominant 12th house = "the 12th house is the essence of this life").',
            houseKey: null
        },
        {
            id: 'twelfth_third_restlessness',
            title: 'Restlessness / Can\'t Stay in One Place',
            source: 'Karma Alignment (Dhan Prapti ke Upaay)',
            setup: 'A person could not stay confined to one home/city for long without growing deeply restless.',
            method: '12th CSL\'s L1 showed house 3.',
            conclusion: 'Fix: embrace travel and relocation deliberately rather than fighting the restlessness — roughly a year in one place before the urge returns is typical; freedom is felt precisely through movement for this person. Encoded in CSL_L1_INTERPRETATIONS[12][3].',
            houseKey: 12
        },
        {
            id: 'first_csl_rahu_venus',
            title: '1st CSL is Rahu, Sitting in Venus\'s Nakshatra',
            source: 'KP Astrology Basic Course — 1st House CSL Study',
            setup: 'In the lecture\'s worked chart, the 1st house Cuspal Sub Lord is Rahu.',
            method: 'Per the "2 levels deep" rule (explicitly re-confirmed in this lecture: "we only check promise up to the star lord level, we don\'t go further"), since Rahu is not self-starred, jump to Rahu\'s own star lord — Venus. Venus is the 2nd house\'s rashi lord AND occupies the 8th house natally, so Venus "shows" houses 2 and 8. Separately, since Rahu sits in Mars\'s SIGN (not nakshatra), Rahu additionally blends in Mars\'s nature (Rahu/Ketu classically deliver the results of whichever planet\'s sign they occupy).',
            conclusion: 'Reading: 2nd house shown → wealth-focused, family-attached, foodie; 8th house shown → stress/pressure in life alongside inherited wealth ("dowry"-type money) on top of self-earned income. The Mars-sign blend adds an energetic, aggressive-capability layer, while Rahu itself (rather than Ketu) tilts the whole picture toward materialistic drive/attachment rather than a spiritual orientation. Encoded as the Rahu/Ketu `nodeBlend` logic inside getFirstHouseAnalysis().',
            houseKey: 1
        },
        {
            id: 'daily_moon_mars_venus',
            title: 'Daily Prediction: Moon in Mars\'s Nakshatra, Venus\'s Sub',
            source: 'Unlock Daily Predictions with KP Astrology',
            setup: 'On a given day, the Moon was transiting through Mars\'s nakshatra, currently in Venus\'s sub-division.',
            method: 'Read Mars\'s own script (houses 5, 8, 12, 7, 10 in the worked chart) as the "possible" houses for the day (Nakshatra-Lord/promise layer), then narrow using Venus\'s own script (houses 4, 6, 11, 5, 7, 10 in the same chart) as the Sub-Lord/result layer. The OVERLAP between the two — houses 5, 7, 10 — is what actually manifests most strongly while the Moon stays in that exact Nakshatra+Sub combination.',
            conclusion: 'Prediction given: 5 (affection) + 7 (partner) → quality time with one\'s partner that day; 10 (career/gain) → business/gain-related thoughts. As soon as the Moon\'s Sub changed from Venus to the Sun (the next lord in sequence), the active overlap shifted to different houses (5, 8, 6 in that example) and the prediction shifted accordingly — entertainment/consultation still favoured (5), but a health caution appeared (6, 8). Demonstrates getDailyPanel()\'s overlap-then-cross-validate method exactly.',
            houseKey: null
        },
        {
            id: 'mental_health_four_factor',
            title: 'Mental-Health Reading Needs 4 Factors Together',
            source: 'Unlock Daily Predictions with KP Astrology (Q&A)',
            setup: 'A student asked how to specifically judge mental-health issues (depression, anxiety, schizophrenia, epilepsy) in KP.',
            method: 'Never judge from a single planet. Read the Moon (as a planet), the 4th cusp (mind), the 5th cusp (intelligence), and the 1st cusp (body) TOGETHER. Then match whichever planet links into that combination against a fixed affliction table: Rahu → schizophrenia-type patterns, Mars → anxiety, Saturn → depression, Mercury → epilepsy.',
            conclusion: 'This 4-factor-plus-affliction-table method is encoded directly in getMedicalIndicators(). The same Q&A also stressed a broader principle worth remembering for ALL predictions, not just medical ones: "कोई भी इवेंट होता है तो एक चीज के कारण नहीं होता" — no event happens due to a single factor; always combine multiple significators before committing to a prediction.',
            houseKey: null
        }
    ],

    /** Human-readable listing of the case study library. */
    renderCaseStudies: function () {
        const rows = this.CASE_STUDIES.map(cs => `<div style="margin:6px 0;padding:8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.05);border-radius:4px;">
              <div style="font-weight:bold;color:#9b6fff;font-size:10.5px;">${cs.title}</div>
              <div style="font-size:8.5px;color:var(--muted);">${cs.source}</div>
              <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:3px;"><b>Setup:</b> ${cs.setup}</div>
              <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:2px;"><b>Method:</b> ${cs.method}</div>
              <div style="font-size:9px;color:#00DD77;margin-top:2px;"><b>Conclusion:</b> ${cs.conclusion}</div>
            </div>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">📚 Case Study Library (worked examples from the source lectures)</summary>
                  ${rows}
                </details>`;
    },

    /**
     * Re-applies a case study's exact rule (where it's a CSL_L1_INTERPRETATIONS
     * entry — i.e. `houseKey` is set) to a NEW chart, so you can check
     * whether the same pattern shows up for a different person.
     */
    verifyCaseStudyPattern: function (caseStudyId, ascSid, natalPlanetsMap) {
        const cs = this.CASE_STUDIES.find(c => c.id === caseStudyId);
        if (!cs || !cs.houseKey) return { caseStudy: cs, applicable: false, note: 'This case study is not a directly re-appliable CSL/L1 rule (e.g. it involves horary-specific opposite-party counting).' };
        const hits = this.getCSL_L1_Interpretation(cs.houseKey, ascSid, natalPlanetsMap);
        return { caseStudy: cs, applicable: true, hits: hits, matchesThisChart: hits.length > 0 };
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
            significators: sig, lordPlacement: lordPlacement, cslTenancy: cslTenancy, independent: independent,
            lossHouse: this.getLossHouse(houseNum)
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

    // ===================== 13⅚. DASHA BALANCE TABLE (flat, current-period view) =====================

    /**
     * Flattens the currently-running MD→AD→PD→Sookshma window into a flat
     * table of rows (Dasa/Bhukti/Antra/Sookshma + start/end dates) — the
     * "Dasa Balance" layout from standard KP software. Only the CURRENTLY
     * running Antardasha is expanded (a full Mahadasha would produce
     * thousands of rows), matching the reference image's own scope.
     */
    getDashaBalanceTable: function (mdNode, currentDate, maxRows) {
        if (!mdNode) return [];
        const rows = [];
        const now = currentDate ? new Date(currentDate).getTime() : Date.now();
        (mdNode.subs || []).forEach(ad => {
            const adStart = new Date(ad.start).getTime(), adEnd = new Date(ad.end).getTime();
            if (now < adStart || now >= adEnd) return; // only the currently-running Antardasha
            (ad.subs || []).forEach(pd => {
                (pd.subs || []).forEach(sk => {
                    rows.push({ dasa: mdNode.lord, bhukti: ad.lord, antra: pd.lord, sookshma: sk.lord, start: sk.start, end: sk.end });
                });
            });
        });
        return maxRows ? rows.slice(0, maxRows) : rows;
    },

    renderDashaBalanceTable: function (rows) {
        if (!rows || !rows.length) return '';
        const bodyRows = rows.map(r => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:4px 6px;font-size:8.5px;color:var(--muted);">${new Date(r.start).toLocaleDateString()}</td>
              <td style="padding:4px 6px;font-weight:bold;color:#FFD700;">${r.dasa}</td>
              <td style="padding:4px 6px;color:#00DD77;">${r.bhukti}</td>
              <td style="padding:4px 6px;color:#66CCFF;">${r.antra}</td>
              <td style="padding:4px 6px;color:#FF9F43;">${r.sookshma}</td>
              <td style="padding:4px 6px;font-size:8.5px;color:var(--muted);">${new Date(r.end).toLocaleDateString()}</td>
            </tr>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FFD700;font-size:10.5px;font-weight:bold;">📅 Dasha Balance — Current Antardasha's Full Sookshma Breakdown</summary>
                  <div style="overflow-x:auto;margin-top:6px;">
                  <table style="width:100%;border-collapse:collapse;font-size:9px;">
                    <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                      <th style="padding:4px 6px;">Start</th><th style="padding:4px 6px;">Dasa</th><th style="padding:4px 6px;">Bhukti</th>
                      <th style="padding:4px 6px;">Antra</th><th style="padding:4px 6px;">Sookshma</th><th style="padding:4px 6px;">End</th>
                    </tr></thead>
                    <tbody>${bodyRows}</tbody>
                  </table>
                  </div>
                </details>`;
    },

    // ===================== 13⅞. ARGALA (JAIMINI SUPPORT/COUNTER) ANALYSIS =====================

    ARGALA_OFFSETS: [2, 4, 11],
    VIRODHA_ARGALA_OFFSETS: [12, 10, 3],

    /**
     * Argala (supporting influence) comes from planets occupying the 2nd,
     * 4th or 11th house from a given house; Virodha Argala (counter-
     * influence) comes from the 12th, 10th or 3rd. If Virodha Argala
     * planets are fewer/weaker than the Argala planets, the support
     * HOLDS and reinforces that house's promise; otherwise it's cancelled.
     */
    getArgala: function (houseNum, natalPlanetsMap) {
        const argalaHouses = this.ARGALA_OFFSETS.map(o => this._mod12(houseNum + o - 1));
        const virodhaHouses = this.VIRODHA_ARGALA_OFFSETS.map(o => this._mod12(houseNum + o - 1));
        const occupantsOf = h => Object.keys(natalPlanetsMap || {}).filter(p => natalPlanetsMap[p] && natalPlanetsMap[p].house === h);
        const argalaPlanets = argalaHouses.reduce((acc, h) => acc.concat(occupantsOf(h)), []);
        const virodhaPlanets = virodhaHouses.reduce((acc, h) => acc.concat(occupantsOf(h)), []);
        const argalaPresent = argalaPlanets.length > 0;
        const argalaHolds = argalaPresent && virodhaPlanets.length < argalaPlanets.length;
        const note = !argalaPresent
            ? `No planets occupy the Argala houses (2nd/4th/11th from House ${houseNum}) — no additional support to evaluate.`
            : argalaHolds
                ? `Argala (support) from ${argalaPlanets.join(', ')} HOLDS — Virodha Argala (${virodhaPlanets.join(', ') || 'none'}) isn't strong enough to cancel it, reinforcing House ${houseNum}'s promise.`
                : `Argala from ${argalaPlanets.join(', ')} is CANCELLED by an equal-or-stronger Virodha Argala from ${virodhaPlanets.join(', ')} — House ${houseNum} doesn't get this extra support.`;
        return { house: houseNum, argalaHouses: argalaHouses, virodhaHouses: virodhaHouses, argalaPlanets: argalaPlanets, virodhaPlanets: virodhaPlanets, argalaPresent: argalaPresent, argalaHolds: argalaHolds, note: note };
    },

    renderArgala: function (argalaData) {
        if (!argalaData) return '';
        const c = argalaData.argalaHolds ? '#00DD77' : (argalaData.argalaPresent ? '#FF4477' : 'var(--muted)');
        return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;">
            <b style="color:${c};">Argala on House ${argalaData.house}</b>
            <div style="font-size:8.5px;color:var(--muted);margin-top:2px;">Argala houses (2/4/11 from H${argalaData.house}): H${argalaData.argalaHouses.join(',H')} · Virodha Argala houses (12/10/3 from H${argalaData.house}): H${argalaData.virodhaHouses.join(',H')}</div>
            <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:2px;">${argalaData.note}</div>
          </div>`;
    },

    // ===================== 13⅞⅞. MONTHLY PANEL (SUN TRANSIT, ≈15-30 DAYS) =====================

    /**
     * Uses the SUN's current transit position (Sun holds one sign for
     * ~30 days, giving a natural month-level granularity) via the exact
     * Nakshatra-Lord + Sub-Lord cascading method from "Unlock Daily
     * Predictions with KP Astrology" — just applied to the Sun instead of
     * the Moon. Cross-references the overlap houses against the running
     * Antardasha (Bhukti) and Argala.
     */
    getMonthlyPanel: function (transitSunData, dashaInfo, ascSid, ascSignNum, natalPlanetsMap, lords) {
        if (!transitSunData || transitSunData.sid === undefined) return null;
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const tenancy = this.getTenancy(natalPlanetsMap);

        const sunKP = this._getKPLords(transitSunData.sid);
        const nlHouses = planetNumbers[sunKP.nakLord] || [];
        const slHouses = planetNumbers[sunKP.subLord] || [];
        const overlap = nlHouses.filter(h => slHouses.includes(h));

        const bhukti = dashaInfo && dashaInfo.antardasha ? dashaInfo.antardasha.lord : null;
        const bhuktiHouses = bhukti ? (planetNumbers[bhukti] || []) : [];
        const crossValidated = overlap.filter(h => bhuktiHouses.includes(h));
        const argala = overlap.map(h => this.getArgala(h, natalPlanetsMap));

        return {
            transitHouse: this._mod12(transitSunData.sn - ascSignNum + 1),
            nakLord: sunKP.nakLord, nlHouses: nlHouses, nlTenancy: tenancy[sunKP.nakLord],
            subLord: sunKP.subLord, slHouses: slHouses, slTenancy: tenancy[sunKP.subLord],
            overlap: overlap, bhukti: bhukti, bhuktiHouses: bhuktiHouses, crossValidated: crossValidated, argala: argala
        };
    },

    renderMonthlyPanel: function (data) {
        if (!data) return '<div class="pred-item">Sun transit data not available — pass transitPlanets.Sun into analyze().</div>';
        const nlUnt = data.nlTenancy && !data.nlTenancy.tenanted, slUnt = data.slTenancy && !data.slTenancy.tenanted;
        const nlChip = this._chip(nlUnt ? 'UNTENANTED' : 'TENANTED', nlUnt ? '#00DD77' : '#FFD700');
        const slChip = this._chip(slUnt ? 'UNTENANTED' : 'TENANTED', slUnt ? '#00DD77' : '#FFD700');
        const argalaRows = data.argala.map(a => this.renderArgala(a)).join('');
        return `<div class="pred-item" style="border-left:3px solid #FFD700;">
            <div class="pred-title" style="color:#FFD700;">☀️ Monthly Panel — Sun Transit (≈15-30 day window)</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Sun is transiting House ${data.transitHouse}. Its Nakshatra Lord's script names houses "possible" this month; its Sub Lord narrows to what's actually most likely; where BOTH agree is strongest.</div>
            <div style="margin-top:4px;"><b>Nakshatra Lord:</b> ${data.nakLord} ${nlChip} — Houses: H${data.nlHouses.join(',H') || '—'}</div>
            <div style="margin-top:4px;"><b>Sub Lord:</b> ${data.subLord} ${slChip} — Houses: H${data.slHouses.join(',H') || '—'}</div>
            <div style="margin-top:6px;padding:6px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">
              <b style="color:#00DD77;">Overlap (strongest this month):</b> H${data.overlap.join(', H') || 'none'}
            </div>
            ${data.bhukti ? `<div style="margin-top:6px;font-size:9px;color:var(--text);">Running Antardasha (Bhukti): <b>${data.bhukti}</b> — Houses: H${data.bhuktiHouses.join(',H') || '—'}</div>` : ''}
            ${data.crossValidated.length ? `<div style="margin-top:4px;padding:6px 8px;border-left:3px solid #FF69B4;background:rgba(255,105,180,.08);"><b style="color:#FF69B4;">Cross-validated with Bhukti:</b> H${data.crossValidated.join(', H')} — confirmed at BOTH the monthly-transit and dasha level.</div>` : ''}
            ${argalaRows}
          </div>`;
    },

    // ===================== 13⅞⅞⅞. DAILY PANEL (MOON TRANSIT, DAY-TO-DAY) =====================

    /**
     * Moon transits ~1 nakshatra/day and multiple Sub Lords within that
     * day; per "Unlock Daily Predictions with KP Astrology": the Moon's
     * transiting Nakshatra Lord's script names the houses active TODAY,
     * its Sub Lord narrows/refines within the day, and the whole reading
     * should be cross-validated against whichever dasha level is running
     * RIGHT NOW (deepest available) — "the event should be promised by
     * your dashas too" before you commit to a specific daily prediction.
     */
    getDailyPanel: function (transitMoonData, dashaInfo, ascSid, ascSignNum, natalPlanetsMap, lords) {
        if (!transitMoonData || transitMoonData.sid === undefined) return null;
        const allCusps = this.getAllCusps(ascSid);
        const planetNumbers = this.getPlanetNumbers(allCusps);
        const tenancy = this.getTenancy(natalPlanetsMap);

        const moonKP = this._getKPLords(transitMoonData.sid);
        const nlHouses = planetNumbers[moonKP.nakLord] || [];
        const slHouses = planetNumbers[moonKP.subLord] || [];
        const overlap = nlHouses.filter(h => slHouses.includes(h));

        const deepestLevel = (dashaInfo && dashaInfo.sukshma) ? { label: 'Sookshma Dasha', lord: dashaInfo.sukshma.lord }
            : (dashaInfo && dashaInfo.pratyantar) ? { label: 'Pratyantardasha', lord: dashaInfo.pratyantar.lord }
                : (dashaInfo && dashaInfo.antardasha) ? { label: 'Antardasha', lord: dashaInfo.antardasha.lord } : null;
        const deepestHouses = deepestLevel ? (planetNumbers[deepestLevel.lord] || []) : [];
        const crossValidated = overlap.filter(h => deepestHouses.includes(h));
        const eventDetails = crossValidated.map(h => ({ house: h, karaka: this.HOUSE_KARAKAS[h] }));

        return {
            transitHouse: this._mod12(transitMoonData.sn - ascSignNum + 1),
            nakLord: moonKP.nakLord, nlHouses: nlHouses, nlTenancy: tenancy[moonKP.nakLord],
            subLord: moonKP.subLord, slHouses: slHouses, slTenancy: tenancy[moonKP.subLord],
            overlap: overlap, deepestLevel: deepestLevel, deepestHouses: deepestHouses,
            crossValidated: crossValidated, eventDetails: eventDetails
        };
    },

    renderDailyPanel: function (data) {
        if (!data) return '<div class="pred-item">Moon transit data not available — pass transitPlanets.Moon into analyze().</div>';
        const nlUnt = data.nlTenancy && !data.nlTenancy.tenanted, slUnt = data.slTenancy && !data.slTenancy.tenanted;
        const nlChip = this._chip(nlUnt ? 'UNTENANTED' : 'TENANTED', nlUnt ? '#00DD77' : '#FFD700');
        const slChip = this._chip(slUnt ? 'UNTENANTED' : 'TENANTED', slUnt ? '#00DD77' : '#FFD700');
        const eventRows = data.eventDetails.map(e => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #FF69B4;background:rgba(255,105,180,.06);">
            <b>H${e.house} — ${e.karaka.name}</b>
            <div style="font-size:8.5px;color:var(--text);opacity:.85;margin-top:2px;">${e.karaka.keywords}</div>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #66CCFF;">
            <div class="pred-title" style="color:#66CCFF;">🌙 Daily Panel — Moon Transit (day-to-day)</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Moon is transiting House ${data.transitHouse}. Its Nakshatra Lord names houses "possible" TODAY (house activation/promise); its Sub Lord narrows further within the day (type of event/result); cross-validate against the deepest running dasha before committing to a prediction.</div>
            <div style="margin-top:4px;"><b>Nakshatra Lord (house activation):</b> ${data.nakLord} ${nlChip} — Houses: H${data.nlHouses.join(',H') || '—'}</div>
            <div style="margin-top:4px;"><b>Sub Lord (event detail/result):</b> ${data.subLord} ${slChip} — Houses: H${data.slHouses.join(',H') || '—'}</div>
            <div style="margin-top:6px;padding:6px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">
              <b style="color:#00DD77;">Overlap (strongest today):</b> H${data.overlap.join(', H') || 'none'}
            </div>
            ${data.deepestLevel ? `<div style="margin-top:6px;font-size:9px;color:var(--text);">Deepest running dasha: <b>${data.deepestLevel.label} (${data.deepestLevel.lord})</b> — Houses: H${data.deepestHouses.join(',H') || '—'}</div>` : ''}
            ${data.crossValidated.length ? `<div style="margin-top:4px;padding:6px 8px;border-left:3px solid #FF69B4;background:rgba(255,105,180,.08);"><b style="color:#FF69B4;">Cross-validated — commit to this:</b> H${data.crossValidated.join(', H')}</div>` : `<div style="margin-top:4px;font-size:9px;color:var(--muted);">No overlap house is also confirmed by the running dasha — treat today's Moon-only reading as tentative, per the source teaching's "event must be promised by your dashas too" rule.</div>`}
            ${eventRows}
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
                ${p.eventInfo.repeatBase ? `<div style="font-size:8px;color:#FF9F43;margin-top:2px;">Repeat-occurrence chain (3 houses forward each time): 1st=H${this.getRepeatEventHouse(p.eventInfo.repeatBase,1)} · 2nd=H${this.getRepeatEventHouse(p.eventInfo.repeatBase,2)} · 3rd=H${this.getRepeatEventHouse(p.eventInfo.repeatBase,3)}</div>` : ''}
                <div style="font-size:8px;color:var(--muted);margin-top:2px;">${p.eventInfo.note}</div>
                <div style="margin-top:6px;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.08);">
                  <div style="font-size:8.5px;color:#9b6fff;"><b>Method:</b> <span style="color:var(--text);opacity:.85;">${p.method}</span></div>
                  <div style="font-size:8.5px;color:${c};margin-top:2px;"><b>Result:</b> <span style="color:var(--text);opacity:.9;">${p.result}</span></div>
                  ${p.effect ? `<div style="font-size:8.5px;color:#66CCFF;margin-top:2px;"><b>Effect:</b> <span style="color:var(--text);opacity:.85;">${p.effect}</span></div>` : ''}
                  ${p.remedy ? `<div style="font-size:8.5px;color:#00DD77;margin-top:2px;"><b>Remedy:</b> <span style="color:var(--text);opacity:.85;">${p.remedy}</span></div>` : ''}
                  ${p.reference ? `<div style="font-size:7.5px;color:var(--muted);margin-top:2px;font-style:italic;"><b>Reference:</b> ${p.reference}</div>` : ''}
                </div>
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
            <div style="font-size:8px;color:#FF9F43;margin-top:4px;">Loss/ending of H${explored.house}'s matters is read from H${explored.lossHouse} (12th-from-H${explored.house}).</div>
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
/**
     * Interactive UI panel for the unified 3-stage findEventWindow()
     * pipeline. `getPosFn` defaults to the app's global getPos if not
     * explicitly supplied.
     */
    renderFindEventPanel: function (mdNode, ascSid, ascSignNum, natalPlanetsMap, lords, getPosFn) {
        this._findEventCache = {
            mdNode: mdNode, ascSid: ascSid, ascSignNum: ascSignNum, natalPlanetsMap: natalPlanetsMap, lords: lords,
            getPosFn: getPosFn || (typeof getPos === 'function' ? getPos : null)
        };
        const eventOptions = Object.keys(this.EVENT_PRIME_HOUSES).map(e => `<option value="${e}">${e.replace(/_/g, ' ')}</option>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#FF9F43;font-size:10.5px;font-weight:bold;">🎯 Find Event Window (KP → Mahadasha/Antardasha → Gochar, full pipeline)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Runs all 3 stages in one pass: does the chart promise this event (Stage 1), which sub-period in the current Mahadasha supports it (Stage 2), and — if a live getPos function is available — when Jupiter/Sun/Moon transit align within those windows (Stage 3).</div>
                  <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <select id="kpFindEventInput" style="background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">${eventOptions}</select>
                    <button onclick="window.KP_PREDICTION.runFindEventFromUI()" style="background:#FF9F43;color:#000;border:none;padding:4px 10px;border-radius:3px;font-size:10px;font-weight:bold;cursor:pointer;">Find Window</button>
                  </div>
                  <div id="kpFindEventResult" style="margin-top:8px;"></div>
                </details>`;
    },

    /** Called from the inline onclick in renderFindEventPanel()'s button. */
    runFindEventFromUI: function () {
        const evtEl = document.getElementById('kpFindEventInput');
        const resultEl = document.getElementById('kpFindEventResult');
        const cache = this._findEventCache;
        if (!evtEl || !resultEl || !cache) return;
        const report = this.findEventWindow({
            eventType: evtEl.value, ascSid: cache.ascSid, ascSignNum: cache.ascSignNum,
            natalPlanetsMap: cache.natalPlanetsMap, lords: cache.lords, mdNode: cache.mdNode, getPosFn: cache.getPosFn
        });
        resultEl.innerHTML = this.renderFindEventWindow(report);
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
        html += this.renderMedicalIndicators(data.medicalIndicators);
        if (data.houseExplorers && data.houseExplorers.length) {
            html += `<details style="margin-top:6px;"><summary style="cursor:pointer;color:#9b6fff;font-size:10.5px;font-weight:bold;">🧭 House-by-House Explorer (H1-H12)</summary>`;
            data.houseExplorers.forEach(ex => { html += this.renderHouseExplorer(ex); });
            html += `</details>`;
        }
        html += `</div>`;
        html += this.renderFirstHouseAnalysis(data.firstHouseAnalysis);
        html += this.renderThirdHouseAnalysis(data.thirdHouseAnalysis);
        html += this.renderCareerAlignment(data.careerAlignment);
        html += this.renderDashaConfirmation(data.dashaConfirmation);
        if (data.monthlyPanel || data.dailyPanel) {
            html += this.renderMonthlyPanel(data.monthlyPanel);
            html += this.renderDailyPanel(data.dailyPanel);
        }
        html += `<div class="pred-item" style="border-left:3px solid #9b6fff;">`;
        html += this.renderDashaBalanceTable(data.dashaBalanceTable);
        html += this.renderMDSearchPanel(mdNode, data.ascSid, data.ascSignNum, data._natalPlanetsMap, data._lords);
        html += this.renderFindEventPanel(mdNode, data.ascSid, data.ascSignNum, data._natalPlanetsMap, data._lords);
        html += this.renderHoraryPanel(transitPlanetsMap);
        html += this.renderCaseStudies();
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
        const careerAlignment = this.getCareerAlignment(ascSid, ascSignNum, natalPlanets, L);
        const firstHouseAnalysis = this.getFirstHouseAnalysis(ascSid, ascSignNum, natalPlanets, L);
        const medicalIndicators = this.getMedicalIndicators(ascSid, ascSignNum, natalPlanets, L);
        const dashaBalanceTable = params.mdNode ? this.getDashaBalanceTable(params.mdNode, params.currentDate) : [];
        const monthlyPanel = (params.transitPlanets && params.transitPlanets.Sun)
            ? this.getMonthlyPanel(params.transitPlanets.Sun, params.dashaInfo, ascSid, ascSignNum, natalPlanets, L) : null;
        const dailyPanel = (params.transitPlanets && params.transitPlanets.Moon)
            ? this.getDailyPanel(params.transitPlanets.Moon, params.dashaInfo, ascSid, ascSignNum, natalPlanets, L) : null;

        return {
            ascSid: ascSid, ascSignNum: ascSignNum,
            planetDetails: planetDetails, eventPromises: eventPromises,
            independentHouses: independentHouses, houseExplorers: houseExplorers,
            goldenRuleClaims: goldenRuleClaims, houseLordPlacements: houseLordPlacements,
            cuspTableData: cuspTableData, planetScripts: planetScripts, houseScripts: houseScripts,
            bhavaChalit: bhavaChalit,
            dashaConfirmation: dashaConfirmation, thirdHouseAnalysis: thirdHouseAnalysis,
            careerAlignment: careerAlignment, firstHouseAnalysis: firstHouseAnalysis,
            medicalIndicators: medicalIndicators, dashaBalanceTable: dashaBalanceTable,
            monthlyPanel: monthlyPanel, dailyPanel: dailyPanel,
            _natalPlanetsMap: natalPlanets, _lords: L
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION;
}