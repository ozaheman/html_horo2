/**
 * sahdharm_sambandh_predictor.js
 *
 * "Sah-Dharm + Sambandh + Tara Milan" Dasha Prediction Engine
 * ─────────────────────────────────────────────────────────────
 * Implements the classical Laghu Parashari method (as taught in the
 * "Dasha Prediction Niyam 1 & 2" lecture) for judging whether a running
 * Mahadasha → Antardasha → Pratyantardasha → Sukshma → Prana chain will
 * give favourable or unfavourable results, and how strongly.
 *
 * THREE LAYERS (applied in this exact order, per the source teaching):
 *
 *   1. सहधर्म (SAH-DHARM) — "shared duty/agenda" between the house(s) a
 *      planet rules. Trikona (1,5,9), Kendra (1,4,7,10) and Dhana/Labha
 *      (2,11) lords all "want" to uplift the native — they are mutually
 *      sah-dharmi (co-operating). Trik/Dushtana (6,8,12) lords all "want"
 *      to create obstacles — they too are mutually sah-dharmi, but toward
 *      a negative agenda. When ONE planet owns two houses of opposite
 *      agendas (e.g. a Simha-lagna Jupiter owning 5th [trikona] AND 8th
 *      [trik]), which agenda actually fires in a given period is decided
 *      by whichever OTHER dasha-lord it is paired with in that period —
 *      this is exactly what this engine computes per MD↔AD, AD↔PD, etc.
 *
 *   2. सम्बन्ध (SAMBANDH) — a real, current-chart relationship between the
 *      two lords: rashi-parivartan (mutual sign exchange, strongest —
 *      "ek parivartan yog, sau raj yogo ke baraabar"), nakshatra-
 *      parivartan, yuti/conjunction, mutual or one-way graha-drishti
 *      (Vedic aspect), or one planet sitting in the other's nakshatra.
 *      Sambandh AMPLIFIES the sah-dharm verdict — good sah-dharm +
 *      sambandh = strong, "planned" good results (Raj-Yoga-Karaka dasha
 *      when Trikona MD + Kendra AD + sambandh); bad sah-dharm +
 *      sambandh = strong, hard-to-escape "planned" trouble. No sambandh
 *      at all softens the intensity in either direction.
 *
 *   3. तारा मिलान (TARA MILAN) — counted from the SENIOR lord's NATAL
 *      nakshatra to the JUNIOR lord's NATAL nakshatra (classical 9-fold
 *      Navatara cycle: Janma/Sampat/Vipat/Kshema/Pratyak/Sadhaka/
 *      Vadha/Mitra/Parama-Mitra), used as a confirming/flavouring layer
 *      on top of sah-dharm + sambandh — NOT a standalone verdict.
 *
 * This is a NATAL-chart engine (compares the natal positions of the two
 * dasha lords to each other). It is intentionally separate from
 * window.DASHA_TRANSIT_RELATIONS, which instead judges each dasha lord
 * against TODAY'S TRANSIT sky.
 *
 * Depends on: LORDS-style sign→lord array, natal planet map with
 * {sn, sid, house} per planet, and ascendant sign number. All are passed
 * in via analyzeChain() params — no globals are read directly, so this
 * file can be dropped into any chart engine.
 */

window.SAHDHARM_SAMBANDH_PREDICTOR = {

    // ===================== CONSTANTS =====================

    DEFAULT_LORDS: ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'],

    NAK_NAMES_FALLBACK: ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
        'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
        'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadra','Uttara Bhadra','Revati'],

    // House-group membership (whole-sign houses, 1-12). A house can belong
    // to more than one group (e.g. house 10 is both Kendra & Upachaya).
    GROUPS: {
        trikona: [1, 5, 9],
        kendra:  [1, 4, 7, 10],
        dhana:   [2, 11],
        upachaya:[3, 6, 10, 11],
        trik:    [6, 8, 12]
    },

    // Weight of each group toward the net sah-dharm score. Positive =
    // uplifting agenda, negative = obstructive agenda.
    GROUP_WEIGHT: { trikona: 2, kendra: 1, dhana: 1, upachaya: 0.5, trik: -2 },

    GROUP_LABEL: {
        trikona: 'Trikona (1-5-9) — Dharma/Fortune uplift',
        kendra:  'Kendra (1-4-7-10) — pillar of life, stability',
        dhana:   'Dhana/Labha (2-11) — wealth & income',
        upachaya:'Upachaya (3-6-10-11) — growth through effort/struggle',
        trik:    'Trik/Dushtana (6-8-12) — obstacle, loss, affliction'
    },

    // ===== PPP ("Purna Parmatma Ansh" / Raj-Yoga-Karaka) + Dhan-Yoga constants =====
    // Classical 4 Dhana-Sthana (wealth houses) per the "Money Making Dasha /
    // Huge Wealth Combination" teaching — 2nd (Dhana/family wealth),
    // 5th (Purva-Punya/speculative wealth), 9th (Bhagya/fortune wealth),
    // 11th (Labha/gains). Deliberately a SEPARATE list from GROUPS.dhana
    // (which is only [2,11] and used for the sah-dharm weight table above).
    DHANA_STHANA: [2, 5, 9, 11],

    // Classical pairings the source teaching calls out explicitly as
    // Dhan-Yoga-forming when their lords combine (yuti/parivartan/drishti):
    // 2-9, 2-11, 5-9, 5-11. (2-5 and 9-11 are not separately flagged in the
    // source — 2nd/11th are treated as the "core" wealth pair with 5th/9th
    // reinforcing them.)
    DHANA_STHANA_PAIRS: [[2, 9], [2, 11], [5, 9], [5, 11]],

    // Naisargik (natural) benefic/malefic split used only for the
    // Kendradhipati-Dosha note — Moon here is treated as benefic by default
    // (waxing-Moon assumption); Rahu/Ketu are judged by their own 3-point
    // rule in getRahuKetuPPP(), not by this list.
    NATURAL_BENEFICS: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
    NATURAL_MALEFICS: ['Sun', 'Mars', 'Saturn'],

    TARA_SEQUENCE: ['Janma', 'Sampat', 'Vipat', 'Kshem', 'Pratyari', 'Saadhak', 'Vadha', 'Maitri', 'Ati-Maitri'],

    // Position (1-9) that a count/remainder maps to — kept 0-indexed internally,
    // shown 1-indexed ("number") in the UI so results can be rechecked by hand
    // against the classical count: Ashwini,Bharani,Kritika,Rohini,Mrigashira,
    // Ardra,Punarvasu,Pushya,Ashlesha,Magha,Purva Phalguni,Uttara Phalguni,
    // Hasta,Chitra,Swati,Vishakha,Anuradha,Jyeshtha,Moola,Purva Ashadha,
    // Uttara Ashadha,Shravana,Dhanishta,Shatabhisha,Purva Bhadrapada,
    // Uttara Bhadrapada,Revati.
    TARA_MEANING: {
        'Janma':      { nature: 'caution', label: 'Janma (Tara #1) — Birth Star',        desc: 'Self-referential; result matches your own karma/effort — good if you have worked, flat if you have not.' },
        'Sampat':     { nature: 'good',    label: 'Sampat (Tara #2) — Prosperity',        desc: 'Wealth, gain, and favourable material outcomes.' },
        'Vipat':      { nature: 'bad',     label: 'Vipat (Tara #3) — Danger/Obstruction', desc: 'Whatever result comes will be achieved only with obstruction/struggle.' },
        'Kshem':      { nature: 'good',    label: 'Kshem (Tara #4) — Wellbeing',          desc: 'Safety, comfort, steady favourable results (welfare/kalyan).' },
        'Pratyari':   { nature: 'bad',     label: 'Pratyari (Tara #5) — Adversity',       desc: 'Opposition, conflict, delays; an unfavourable/enemy-like tara.' },
        'Saadhak':    { nature: 'good',    label: 'Saadhak (Tara #6) — Fulfilment',       desc: 'Objectives get accomplished; favourable for completing a venture.' },
        'Vadha':      { nature: 'bad',     label: 'Vadha / Ved (Tara #7) — Ending',       desc: 'Whatever was running either completes or winds up — a closure-tara, not literally destructive.' },
        'Maitri':     { nature: 'good',    label: 'Maitri (Tara #8) — Friend',            desc: 'Supportive, favourable conditions are waiting for you.' },
        'Ati-Maitri': { nature: 'good',    label: 'Ati-Maitri (Tara #9) — Best Friend',   desc: 'Highly auspicious, best supportive results; remainder 0 also falls here.' }
    },

    /**
     * HIGH-IMPACT ABSOLUTE NAKSHATRA COUNTS (1-27, NOT reduced mod 9).
     * These are specific counts classically flagged as carrying unusually
     * strong (near-always negative) impact — some coincide with the
     * ordinary bad taras (3=Vipat, 5=Pratyari, 7=Vadha/Ved recur every
     * 9 counts), but three of them (10=Karma, 19=Aadhan, 22=Vainashak)
     * are special EXCEPTION counts that override the plain mod-9 reading
     * even when that reading would otherwise be neutral or good (e.g.
     * count 22 reduces to Tara #4 "Kshem", normally good — but count 22
     * itself is specifically flagged Vainashak/"destructive" and treated
     * as a strong negative, per the source teaching that these six counts
     * "have more impact" than the general 9-fold pattern). All six are
     * treated as bad and heavier-weighted than an ordinary bad tara.
     */
    HIGH_IMPACT_COUNTS: {
        3:  'Vipat',
        5:  'Pratyari',
        7:  'Vadha / Ved',
        10: 'Karma',
        19: 'Aadhan',
        22: 'Vainashak'
    },

    /**
     * Resolve the full Tara reading for an absolute 1-27 nakshatra count:
     * the ordinary mod-9 tara PLUS the high-impact override/flag when the
     * count is one of HIGH_IMPACT_COUNTS.
     */
    resolveTaraForCount: function (count) {
        const taraIdx = (count - 1) % 9;
        const baseName = this.TARA_SEQUENCE[taraIdx];
        const baseMeta = this.TARA_MEANING[baseName];
        const hiLabel = this.HIGH_IMPACT_COUNTS[count];
        if (hiLabel) {
            return {
                name: hiLabel,
                nature: 'bad',
                highImpact: true,
                label: `${hiLabel} (count=${count}, Tara #${taraIdx + 1}) — High-Impact Malefic Count`,
                desc: `Classically flagged as an especially strong/impactful negative count (count=${count}); this overrides the plain 9-fold reading (which alone would read "${baseMeta.label.split(' (')[0]}").`
            };
        }
        return {
            name: baseName, nature: baseMeta.nature, highImpact: false,
            label: baseMeta.label, desc: baseMeta.desc
        };
    },

    /** good=+1 / caution=0 / bad=-1, doubled in magnitude when high-impact-flagged. */
    _taraScoreValue: function (taraInfo) {
        if (!taraInfo) return 0;
        const base = taraInfo.nature === 'good' ? 1 : taraInfo.nature === 'bad' ? -1 : 0;
        return taraInfo.highImpact ? base * 2 || -2 : base;
    },

    // ===================== SMALL HELPERS =====================

    _getNakIndex: function (sidLon) {
        const lon = ((sidLon % 360) + 360) % 360;
        return Math.floor(lon / (360 / 27));
    },

    _nakName: function (nakIdx, nakNamesArr) {
        const idx = ((nakIdx % 27) + 27) % 27;
        const arr = nakNamesArr || this.NAK_NAMES_FALLBACK;
        return arr[idx];
    },

    /**
     * Classical Graha-Drishti (Vedic aspect) — every planet aspects the
     * 7th house from itself; Mars additionally 4th & 8th; Jupiter 5th &
     * 9th; Saturn 3rd & 10th. Houses are 1-12 (whole sign, from the
     * planet's OWN house, not the ascendant).
     */
    _vedicAspectHouses: function (planet, fromHouse) {
        const asp = [((fromHouse + 6) % 12) || 12];
        if (planet === 'Mars')    asp.push(((fromHouse + 3) % 12) || 12, ((fromHouse + 7) % 12) || 12);
        if (planet === 'Jupiter') asp.push(((fromHouse + 4) % 12) || 12, ((fromHouse + 8) % 12) || 12);
        if (planet === 'Saturn')  asp.push(((fromHouse + 2) % 12) || 12, ((fromHouse + 9) % 12) || 12);
        return asp;
    },

    // ===================== 1. SAH-DHARM LAYER =====================

    /**
     * Which houses does `planet` rule, given the ascendant sign number
     * (0=Aries..11=Pisces)? Returns array of house numbers 1-12.
     */
    getOwnedHouses: function (planet, ascSignNum, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const owned = [];
        for (let h = 1; h <= 12; h++) {
            const signNum = (ascSignNum + h - 1) % 12;
            if (L[signNum] === planet) owned.push(h);
        }
        return owned;
    },

    /**
     * All group-tags a planet carries, from ALL houses it rules. A dual
     * (or triple) lord of houses in different groups will carry multiple
     * tags — this "ambiguity" is intentional; it is resolved per-pairing
     * in getSahdharm() below, exactly as the classical method prescribes.
     */
    getGroupTags: function (planet, ascSignNum, lords) {
        const owned = this.getOwnedHouses(planet, ascSignNum, lords);
        const tags = {};
        owned.forEach(h => {
            Object.entries(this.GROUPS).forEach(([g, houses]) => {
                if (houses.includes(h)) {
                    tags[g] = tags[g] || [];
                    tags[g].push(h);
                }
            });
        });
        return { owned: owned, tags: tags };
    },

    /**
     * Core Sah-Dharm judgement between two dasha lords (senior→junior,
     * e.g. MD lord → AD lord). Returns the shared agenda(s), a net
     * weighted score, and a nature bucket.
     */
    getSahdharm: function (lordA, lordB, ascSignNum, lords) {
        const A = this.getGroupTags(lordA, ascSignNum, lords);
        const B = this.getGroupTags(lordB, ascSignNum, lords);
        const sharedGroups = Object.keys(A.tags).filter(g => B.tags[g]);

        let netScore = 0;
        const shared = sharedGroups.map(g => {
            netScore += this.GROUP_WEIGHT[g];
            return { group: g, label: this.GROUP_LABEL[g], housesA: A.tags[g], housesB: B.tags[g] };
        });

        let nature = 'neutral';
        if (netScore > 0.4) nature = 'good';
        else if (netScore < -0.4) nature = 'bad';
        else if (shared.length) nature = 'mixed';

        // Special classical flag: Trikona MD-side + Kendra AD-side (or
        // vice-versa) sharing no trik = potential Raj-Yoga-Karaka pairing.
        const isRajYogaCandidate = sharedGroups.length > 0 &&
            !sharedGroups.includes('trik') &&
            ((A.tags.trikona && B.tags.kendra) || (A.tags.kendra && B.tags.trikona));

        return {
            lordA: lordA, lordB: lordB,
            ownedA: A.owned, ownedB: B.owned,
            tagsA: A.tags, tagsB: B.tags,
            sharedGroups: shared,
            netScore: Math.round(netScore * 10) / 10,
            nature: nature,
            isRajYogaCandidate: isRajYogaCandidate
        };
    },

    // ===================== 2. SAMBANDH LAYER =====================

    /**
     * Real chart relationship between two planets' NATAL placements.
     * natalPlanetsMap[planet] must have: sn (sign 0-11), sid (sidereal
     * longitude), house (1-12, whole sign from ascendant).
     */
    getSambandh: function (lordA, lordB, natalPlanetsMap, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const pa = natalPlanetsMap && natalPlanetsMap[lordA];
        const pb = natalPlanetsMap && natalPlanetsMap[lordB];
        const out = { found: false, strength: 0, details: [] };
        if (!pa || !pb) return out;
        out.found = true;

        // Conjunction (yuti) — same sign
        if (pa.sn === pb.sn) {
            out.strength += 2;
            out.details.push({ type: 'conjunction', label: 'Yuti (Conjunction)', desc: `${lordA} and ${lordB} sit together in the same sign.` });
        }

        // Mutual sign exchange (rashi parivartan) — strongest sambandh
        if (L[pa.sn] === lordB && L[pb.sn] === lordA && pa.sn !== pb.sn) {
            out.strength += 3;
            out.details.push({ type: 'parivartan', label: 'Rashi Parivartan (Mutual Sign Exchange)', desc: `${lordA} sits in ${lordB}'s sign and ${lordB} sits in ${lordA}'s sign — deepest possible sambandh.` });
        }

        // Nakshatra exchange / placement
        if (pa.sid !== undefined && pb.sid !== undefined) {
            const nakA = this._getNakIndex(pa.sid);
            const nakB = this._getNakIndex(pb.sid);
            const nlA = window.NAK_LORDS ? window.NAK_LORDS[nakA % 27] : null;
            const nlB = window.NAK_LORDS ? window.NAK_LORDS[nakB % 27] : null;
            if (nlA && nlB) {
                const aInB = nlA === lordB; // A sits in a nakshatra ruled by B
                const bInA = nlB === lordA; // B sits in a nakshatra ruled by A
                if (aInB && bInA) {
                    out.strength += 2.5;
                    out.details.push({ type: 'nak-parivartan', label: 'Nakshatra Parivartan (Mutual)', desc: `${lordA} sits in ${lordB}'s nakshatra and ${lordB} sits in ${lordA}'s nakshatra.` });
                } else if (aInB) {
                    out.strength += 0.8;
                    out.details.push({ type: 'nak-oneway', label: 'Nakshatra Placement', desc: `${lordA} sits in a nakshatra ruled by ${lordB}.` });
                } else if (bInA) {
                    out.strength += 0.8;
                    out.details.push({ type: 'nak-oneway', label: 'Nakshatra Placement', desc: `${lordB} sits in a nakshatra ruled by ${lordA}.` });
                }
            }
        }

        // Mutual / one-way graha drishti (Vedic aspect), using house #s
        if (pa.house && pb.house) {
            const aspFromA = this._vedicAspectHouses(lordA, pa.house);
            const aspFromB = this._vedicAspectHouses(lordB, pb.house);
            const aSeesB = aspFromA.includes(pb.house);
            const bSeesA = aspFromB.includes(pa.house);
            if (aSeesB && bSeesA && pa.sn !== pb.sn) {
                out.strength += 1.5;
                out.details.push({ type: 'aspect-mutual', label: 'Mutual Drishti (Aspect)', desc: `${lordA} and ${lordB} fully aspect each other.` });
            } else if (aSeesB) {
                out.strength += 1;
                out.details.push({ type: 'aspect-oneway', label: 'One-way Drishti', desc: `${lordA} aspects ${lordB}.` });
            } else if (bSeesA) {
                out.strength += 1;
                out.details.push({ type: 'aspect-oneway', label: 'One-way Drishti', desc: `${lordB} aspects ${lordA}.` });
            }
        }

        out.strength = Math.round(out.strength * 10) / 10;
        out.level = out.strength >= 2.5 ? 'strong' : out.strength >= 1 ? 'medium' : out.strength > 0 ? 'weak' : 'none';
        return out;
    },

    // ===================== 3. TARA MILAN (NATAL-NATAL) LAYER =====================

    /**
     * Counted from senior lord's (e.g. MD) NATAL nakshatra to junior
     * lord's (e.g. AD) NATAL nakshatra — classical 9-fold Tara cycle.
     * `count` (1-27, inclusive both ends, e.g. Ashwini->Rohini = 4) and
     * `remainder` (count mod 9, 0 shown as 9) are exposed explicitly so
     * the result can be rechecked by hand against the classical method.
     */
    getTaraMilan: function (lordA, lordB, natalPlanetsMap, nakNamesArr) {
        const pa = natalPlanetsMap && natalPlanetsMap[lordA];
        const pb = natalPlanetsMap && natalPlanetsMap[lordB];
        if (!pa || !pb || pa.sid === undefined || pb.sid === undefined) return null;
        const nakA = this._getNakIndex(pa.sid);
        const nakB = this._getNakIndex(pb.sid);
        const diff = ((nakB - nakA) % 27 + 27) % 27;
        const count = diff + 1; // 1-indexed inclusive count, as counted by hand
        const remainder = ((count % 9) === 0) ? 9 : (count % 9);
        const resolved = this.resolveTaraForCount(count);
        return {
            fromNak: this._nakName(nakA, nakNamesArr), toNak: this._nakName(nakB, nakNamesArr),
            nakDiff: count, count: count, remainder: remainder, taraNumber: ((count - 1) % 9) + 1,
            name: resolved.name, nature: resolved.nature, label: resolved.label, desc: resolved.desc,
            highImpact: resolved.highImpact
        };
    },

    /**
     * A dasha lord's OWN Tara counted from the native's JANMA NAKSHATRA
     * (natal Moon's nakshatra) to that lord's NATAL nakshatra — this is
     * the "Tara from birth star" check (separate from, and supplementary
     * to, the senior->junior lord-to-lord Tara Milan above).
     */
    getJanmaTaraForLord: function (lordPlanet, janmaNakIdx, natalPlanetsMap, nakNamesArr) {
        const p = natalPlanetsMap && natalPlanetsMap[lordPlanet];
        if (!p || p.sid === undefined || janmaNakIdx === undefined || janmaNakIdx === null) return null;
        const nakL = this._getNakIndex(p.sid);
        const diff = ((nakL - janmaNakIdx) % 27 + 27) % 27;
        const count = diff + 1;
        const remainder = ((count % 9) === 0) ? 9 : (count % 9);
        const resolved = this.resolveTaraForCount(count);
        return {
            lord: lordPlanet,
            fromNak: this._nakName(janmaNakIdx, nakNamesArr), toNak: this._nakName(nakL, nakNamesArr),
            count: count, remainder: remainder, taraNumber: ((count - 1) % 9) + 1,
            name: resolved.name, nature: resolved.nature, label: resolved.label, desc: resolved.desc,
            highImpact: resolved.highImpact
        };
    },

    // ===================== 4. COMBINED PAIR VERDICT =====================

    /**
     * Full judgement for one senior→junior dasha-lord pair (e.g. MD lord
     * → AD lord, or AD lord → PD lord).
     */
    predictPair: function (seniorLabel, lordA, juniorLabel, lordB, ascSignNum, natalPlanetsMap, lords, nakNamesArr) {
        if (!lordA || !lordB) return null;
        const sahdharm = this.getSahdharm(lordA, lordB, ascSignNum, lords);
        const sambandh = this.getSambandh(lordA, lordB, natalPlanetsMap, lords);
        const tara = this.getTaraMilan(lordA, lordB, natalPlanetsMap, nakNamesArr);

        // Combine into a final call. Sah-dharm sets DIRECTION; sambandh
        // sets INTENSITY (amplifies whichever direction sah-dharm gave);
        // tara adds a confirming/contradicting flavour note.
        let finalNature = sahdharm.nature;
        let intensity = 'moderate';
        if (sambandh.level === 'strong') intensity = finalNature === 'neutral' ? 'moderate' : 'high';
        else if (sambandh.level === 'none') intensity = finalNature === 'neutral' ? 'low' : 'subdued';

        let verdictLabel, verdictColor;
        if (finalNature === 'good') {
            verdictLabel = (intensity === 'high') ? 'Strongly Favourable' : (intensity === 'subdued') ? 'Mildly Favourable' : 'Favourable';
            verdictColor = (intensity === 'high') ? '#00DD77' : '#66DD99';
        } else if (finalNature === 'bad') {
            verdictLabel = (intensity === 'high') ? 'Strongly Challenging' : (intensity === 'subdued') ? 'Mildly Challenging' : 'Challenging';
            verdictColor = (intensity === 'high') ? '#FF4477' : '#FF8899';
        } else if (finalNature === 'mixed') {
            verdictLabel = 'Mixed — house-specific effects';
            verdictColor = '#FFD700';
        } else {
            verdictLabel = 'Neutral / no strong co-agenda';
            verdictColor = '#8888AA';
        }

        // Narrative sentence
        let narrative = `${lordA} (${seniorLabel}) rules house${sahdharm.ownedA.length > 1 ? 's' : ''} ${sahdharm.ownedA.join(', ')}; ${lordB} (${juniorLabel}) rules house${sahdharm.ownedB.length > 1 ? 's' : ''} ${sahdharm.ownedB.join(', ')}. `;
        if (sahdharm.sharedGroups.length) {
            narrative += `They share ${sahdharm.sharedGroups.map(s => s.label.split(' — ')[0]).join(' & ')} agenda — `;
            narrative += finalNature === 'good' ? 'both lords co-operate to uplift the native. '
                        : finalNature === 'bad' ? 'both lords co-operate toward obstacles/loss. '
                        : 'a mixed pull between houses. ';
        } else {
            narrative += `No shared house-agenda (sah-dharm) between them — result stays fairly neutral unless transits intervene. `;
        }
        if (sambandh.found) {
            if (sambandh.level === 'strong') narrative += `A strong sambandh (${sambandh.details.map(d=>d.label).join(', ')}) is present, so results will feel deliberate/"planned" and hard to avoid — `;
            else if (sambandh.level !== 'none') narrative += `A ${sambandh.level} sambandh (${sambandh.details.map(d=>d.label).join(', ')}) is present, giving some real connection between the two — `;
            else narrative += `No direct sambandh (yuti/drishti/parivartan) between the two lords, so intensity is naturally reduced — `;
        } else {
            narrative += `No sambandh data available — `;
        }
        if (tara) {
            narrative += `and the natal Tara from ${lordA} to ${lordB} is ${tara.label} [${lordA}'s ${tara.fromNak} → ${lordB}'s ${tara.toNak}, count=${tara.count}, count mod 9=${tara.remainder}], ${tara.nature === 'bad' ? 'reinforcing caution' : tara.nature === 'good' ? 'reinforcing support' : 'a mild, self-referential influence'}.`;
            if (tara.highImpact) narrative += ` ⚠ This is one of the six specially-flagged high-impact counts (3=Vipat, 5=Pratyari, 7=Vadha/Ved, 10=Karma, 19=Aadhan, 22=Vainashak) — treat this pairing's negative side as stronger than usual.`;
        }
        if (sahdharm.isRajYogaCandidate && sambandh.level !== 'none') narrative += ` ⚑ Classical Raj-Yoga-Karaka dasha pattern (Trikona↔Kendra lords in sambandh).`;

        // Explicit numeric score: sah-dharm score amplified by sambandh
        // strength, plus the (high-impact-aware) tara score.
        const sambandhAmp = sambandh.level === 'strong' ? 1.5 : sambandh.level === 'medium' ? 1.2 : sambandh.level === 'weak' ? 1.05 : 1.0;
        const taraScoreValue = this._taraScoreValue(tara);
        const numericScore = Math.round((sahdharm.netScore * sambandhAmp + taraScoreValue) * 10) / 10;
        const scoreVerdict = numericScore > 0.5 ? 'Positive' : numericScore < -0.5 ? 'Negative' : 'Neutral/Mixed';

        return {
            seniorLabel: seniorLabel, lordA: lordA,
            juniorLabel: juniorLabel, lordB: lordB,
            sahdharm: sahdharm, sambandh: sambandh, tara: tara,
            finalNature: finalNature, intensity: intensity,
            verdictLabel: verdictLabel, verdictColor: verdictColor,
            numericScore: numericScore, scoreVerdict: scoreVerdict, taraScoreValue: taraScoreValue,
            narrative: narrative
        };
    },

    /**
     * A single planet's OWN sah-dharm score from its house-lordships alone
     * (no pairing) — used to score the top-level Mahadasha, which has no
     * senior dasha-lord above it to be paired against.
     */
    getStandaloneSahdharmScore: function (planet, ascSignNum, lords) {
        const tags = this.getGroupTags(planet, ascSignNum, lords).tags;
        let score = 0;
        Object.keys(tags).forEach(g => { score += this.GROUP_WEIGHT[g]; });
        return Math.round(score * 10) / 10;
    },

    // ===================== 4a½. BENEFIC/MALEFIC DETERMINATION + NULLIFICATION =====================
    //
    // Embedded sidereal exaltation/debilitation degrees + own-sign list
    // (same values used elsewhere in the app's chart engine) so this module
    // stays self-contained and doesn't need to read chart globals.
    DIGNITY: {
        Sun:     { ex: 10,  de: 190, own: [4] },
        Moon:    { ex: 33,  de: 213, own: [3] },
        Mars:    { ex: 298, de: 118, own: [0, 7] },
        Mercury: { ex: 165, de: 345, own: [2, 5] },
        Jupiter: { ex: 95,  de: 275, own: [8, 11] },
        Venus:   { ex: 357, de: 177, own: [1, 6] },
        Saturn:  { ex: 200, de: 20,  own: [9, 10] }
    },

    /** Exalted / Debilitated / Own-sign / neutral dignity check from sidereal longitude. */
    _getDignity: function (planet, sid) {
        const d = this.DIGNITY[planet];
        if (!d || sid === undefined) return { state: 'unknown', label: '' };
        const lon = ((sid % 360) + 360) % 360;
        const signNum = Math.floor(lon / 30);
        const angDist = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
        if (angDist(lon, d.ex) < 5) return { state: 'exalted', label: 'Exalted' };
        if (angDist(lon, d.de) < 5) return { state: 'debilitated', label: 'Debilitated' };
        if (d.own.includes(signNum)) return { state: 'own', label: 'Own Sign (Swakshetra)' };
        return { state: 'neutral', label: '' };
    },

    /** Shukla (waxing) vs Krishna (waning) Paksha, needed for Moon's naisargik nature. */
    _getMoonPaksha: function (natalPlanetsMap) {
        const moon = natalPlanetsMap && natalPlanetsMap.Moon;
        const sun = natalPlanetsMap && natalPlanetsMap.Sun;
        if (!moon || !sun || moon.sid === undefined || sun.sid === undefined) return null;
        const diff = ((moon.sid - sun.sid) % 360 + 360) % 360; // Moon's lead over Sun
        return diff < 180 ? 'waxing' : 'waning';
    },

    /** All planets sharing the same rashi (sign) as `planet` — i.e. in conjunction. */
    _getConjunctPlanets: function (planet, natalPlanetsMap) {
        const p = natalPlanetsMap && natalPlanetsMap[planet];
        if (!p) return [];
        return Object.keys(natalPlanetsMap).filter(pl =>
            pl !== planet && natalPlanetsMap[pl] && natalPlanetsMap[pl].sn === p.sn);
    },

    /** Bare naisargik (natural) nature only — used internally to avoid recursing through Mercury's own logic. */
    _naisargikOnly: function (planet, natalPlanetsMap) {
        if (planet === 'Jupiter' || planet === 'Venus') return 'benefic';
        if (planet === 'Sun' || planet === 'Mars' || planet === 'Saturn' || planet === 'Rahu' || planet === 'Ketu') return 'malefic';
        if (planet === 'Moon') return this._getMoonPaksha(natalPlanetsMap) === 'waning' ? 'malefic' : 'benefic';
        return 'neutral';
    },

    /**
     * METHOD TO FIND naisargik (natural) benefic/malefic status, with the
     * classical reasoning spelled out:
     *   • Jupiter, Venus → always benefic.
     *   • Sun, Mars, Saturn → always malefic.
     *   • Rahu, Ketu → treated as malefic (shadow/node grahas).
     *   • Moon → benefic if waxing (Shukla Paksha), malefic if waning
     *     (Krishna Paksha) — found by comparing Moon's longitude to Sun's.
     *   • Mercury → naturally neutral ("chameleon" graha); takes on the
     *     nature of whichever planet(s) it's conjunct — benefic if only
     *     conjunct benefics, malefic if only conjunct malefics, neutral/
     *     mixed if conjunct both or none.
     */
    getNaisargikNature: function (planet, natalPlanetsMap) {
        if (planet === 'Jupiter' || planet === 'Venus') {
            return { nature: 'benefic', reason: `${planet} is a Naisargik (natural) Shubha Graha — always benefic by nature.` };
        }
        if (planet === 'Sun' || planet === 'Mars' || planet === 'Saturn') {
            return { nature: 'malefic', reason: `${planet} is a Naisargik (natural) Papa Graha — always malefic by nature.` };
        }
        if (planet === 'Rahu' || planet === 'Ketu') {
            return { nature: 'malefic', reason: `${planet} is a Chhaya Graha (shadow planet/node) — classically treated as naturally malefic.` };
        }
        if (planet === 'Moon') {
            const paksha = this._getMoonPaksha(natalPlanetsMap);
            if (paksha === 'waxing') return { nature: 'benefic', reason: `Moon is in Shukla Paksha (waxing — ahead of Sun in longitude), so it is classed as a natural benefic.` };
            if (paksha === 'waning') return { nature: 'malefic', reason: `Moon is in Krishna Paksha (waning — behind Sun in longitude), so it is classed as a natural malefic (weaker light).` };
            return { nature: 'benefic', reason: `Moon's paksha could not be determined (Sun's position missing) — defaulting to its usual benefic classification.` };
        }
        if (planet === 'Mercury') {
            const conjunct = this._getConjunctPlanets('Mercury', natalPlanetsMap);
            if (!conjunct.length) return { nature: 'neutral', reason: `Mercury is naturally neutral (the "chameleon" graha) — with nothing conjunct it here, it stays neutral.` };
            const natures = conjunct.map(pl => this._naisargikOnly(pl, natalPlanetsMap));
            if (natures.every(n => n === 'benefic')) return { nature: 'benefic', reason: `Mercury is conjunct only natural benefic(s) (${conjunct.join(', ')}) — it takes on their benefic character.` };
            if (natures.every(n => n === 'malefic')) return { nature: 'malefic', reason: `Mercury is conjunct only natural malefic(s) (${conjunct.join(', ')}) — it takes on their malefic character.` };
            return { nature: 'neutral', reason: `Mercury is conjunct a mix of benefic and malefic planets (${conjunct.join(', ')}) — it stays neutral/mixed, reflecting a bit of both.` };
        }
        return { nature: 'neutral', reason: `${planet} — no naisargik classification defined.` };
    },

    /**
     * METHOD TO FIND functional (house-lordship-based) nature for THIS
     * ascendant — the classical principle being that functional nature
     * usually DOMINATES results in a given chart, even overriding an
     * otherwise-fixed naisargik nature:
     *   • Rules Trikona (1,5,9) AND Kendra (1,4,7,10), no Trik → Yogakaraka
     *     (strongest functional benefic; this is the PPP/Raj-Yoga-Karaka
     *     condition itself).
     *   • Rules any Trik/Dushtana house (6,8,12) → functional malefic,
     *     regardless of naisargik nature.
     *   • Rules Trikona only → strong functional benefic.
     *   • Rules Kendra only → functional benefic, tempered by Kendradhipati
     *     Dosha (see getKendradhipatiNullification below).
     *   • Rules Dhana/Labha (2/11) only → mixed (wealth-giving, but 2nd is
     *     also a Maraka/death-inflicting house).
     *   • Rules ONLY the 3rd house (the one Upachaya house that never
     *     overlaps Kendra/Trikona/Trik/Dhana) → many classical authors call
     *     a pure 3rd-lord a mild functional malefic; this point is debated
     *     across traditions and is flagged as such.
     */
    getFunctionalNature: function (planet, ascSignNum, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const tags = this.getGroupTags(planet, ascSignNum, L).tags;
        const hasTrikona = !!tags.trikona, hasKendra = !!tags.kendra, hasTrik = !!tags.trik, hasDhana = !!tags.dhana;
        const hasUpachayaOnly = !!tags.upachaya && !hasTrikona && !hasKendra && !hasTrik && !hasDhana;

        if (hasTrikona && hasKendra && !hasTrik) {
            return { nature: 'yogakaraka', reason: `${planet} rules BOTH a Trikona house (${tags.trikona.join(',')}) and a Kendra house (${tags.kendra.join(',')}) with no Trik overlap — the strongest functional-benefic status (Yogakaraka).` };
        }
        if (hasTrik) {
            return { nature: 'malefic', reason: `${planet} rules Trik/Dushtana house(s) (${tags.trik.join(',')}) — a functional malefic for this ascendant, regardless of its naisargik nature.` };
        }
        if (hasTrikona) {
            return { nature: 'benefic', reason: `${planet} rules Trikona house(s) (${tags.trikona.join(',')}) with no Trik overlap — a strong functional benefic for this ascendant.` };
        }
        if (hasKendra) {
            return { nature: 'benefic', reason: `${planet} rules only Kendra house(s) (${tags.kendra.join(',')}) — functionally benefic, though tempered by Kendradhipati Dosha.` };
        }
        if (hasDhana) {
            return { nature: 'mixed', reason: `${planet} rules only Dhana/Labha house(s) (${tags.dhana.join(',')}) — functionally mixed: wealth-giving, but 2nd is also a Maraka house.` };
        }
        if (hasUpachayaOnly) {
            return { nature: 'mixed', reason: `${planet} rules only the 3rd house (Upachaya) with no other group overlap — several classical authors treat a pure 3rd-lord as a mild functional malefic; opinion is divided across traditions.` };
        }
        return { nature: 'neutral', reason: `${planet} rules none of the Kendra/Trikona/Trik/Dhana houses for this ascendant — functionally neutral.` };
    },

    /**
     * Combines naisargik + functional nature into one verdict, applying the
     * classical rule that functional nature (specific to THIS ascendant)
     * generally outweighs the fixed naisargik nature when they disagree.
     */
    getPlanetNature: function (planet, ascSignNum, natalPlanetsMap, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const naisargik = this.getNaisargikNature(planet, natalPlanetsMap);
        const functional = this.getFunctionalNature(planet, ascSignNum, L);

        let overall, overallReason;
        if (functional.nature === 'yogakaraka') {
            overall = 'yogakaraka';
            overallReason = `Functional Yogakaraka status overrides everything else — ${planet} acts as one of the most auspicious planets in this chart regardless of its ${naisargik.nature} naisargik nature.`;
        } else if (naisargik.nature === functional.nature) {
            overall = naisargik.nature;
            overallReason = `Naisargik and functional nature agree (both ${naisargik.nature}) — a clear, unambiguous verdict.`;
        } else if (functional.nature === 'malefic' && naisargik.nature === 'benefic') {
            overall = 'mixed';
            overallReason = `${planet} is naturally benefic but functionally malefic for this ascendant — the FUNCTIONAL (house-lordship) nature dominates results here, so treat it with caution despite its pleasant natural character.`;
        } else if (functional.nature === 'benefic' && naisargik.nature === 'malefic') {
            overall = 'mixed-favourable';
            overallReason = `${planet} is naturally malefic but functionally benefic for this ascendant — functional nature dominates here, so it can act auspiciously despite its harsher natural character (classically why planets like Mars/Saturn turn highly favourable for certain ascendants).`;
        } else {
            overall = 'mixed';
            overallReason = `Naisargik nature is ${naisargik.nature} and functional nature is ${functional.nature} — results are situational; judge case-by-case using dignity, conjunctions and dasha context.`;
        }

        return { planet: planet, naisargik: naisargik, functional: functional, overall: overall, overallReason: overallReason };
    },

    /**
     * NULLIFICATION check for Kendradhipati Dosha — the classical
     * mitigating/aggravating factors:
     *   • Exalted Kendra-lord → FULLY nullifies the Dosha.
     *   • Own-sign (Swakshetra) Kendra-lord → PARTIALLY reduces the Dosha.
     *   • Debilitated Kendra-lord → AGGRAVATES the Dosha (opposite effect;
     *     this engine does not separately check for Neecha-Bhanga/
     *     debilitation-cancellation).
     *   • Retrograde (Vakri) Kendra-lord → a classical, debated opinion
     *     holds this PARTIALLY softens the Dosha (retrogression is said to
     *     add hidden strength). Only checked when retro data is present.
     *   • Conjunct a Trikona-lord, or conjunct a natural benefic → PARTIALLY
     *     offsets the Dosha through a real supportive chart relationship.
     */
    getKendradhipatiNullification: function (planet, ascSignNum, natalPlanetsMap, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const p = natalPlanetsMap && natalPlanetsMap[planet];
        if (!p) return null;
        const factors = [];
        const dignity = this._getDignity(planet, p.sid);

        if (dignity.state === 'exalted') {
            factors.push({ type: 'exaltation', strength: 'full', desc: `${planet} is Exalted — this classically FULLY NULLIFIES Kendradhipati Dosha; it gives full auspicious results as a Kendra-lord.` });
        } else if (dignity.state === 'own') {
            factors.push({ type: 'own-sign', strength: 'partial', desc: `${planet} is in its own sign (Swakshetra) — this PARTIALLY reduces Kendradhipati Dosha (a planet is comfortable/strong in its own house).` });
        } else if (dignity.state === 'debilitated') {
            factors.push({ type: 'debilitation', strength: 'aggravates', desc: `${planet} is Debilitated — this AGGRAVATES Kendradhipati Dosha rather than nullifying it (unless a separate Neecha-Bhanga/debilitation-cancellation applies, which this engine does not check).` });
        }

        if (p.retro === true) {
            factors.push({ type: 'retrograde', strength: 'partial', desc: `${planet} is Retrograde (Vakri) — a classical (debated) opinion holds retrograde Kendra-lords carry a milder Kendradhipati Dosha, since retrogression is said to add hidden strength.` });
        }

        const conjunct = this._getConjunctPlanets(planet, natalPlanetsMap);
        const conjunctTrikonaLord = conjunct.filter(pl => !!this.getGroupTags(pl, ascSignNum, L).tags.trikona);
        const conjunctBenefic = conjunct.filter(pl => this.getNaisargikNature(pl, natalPlanetsMap).nature === 'benefic');
        if (conjunctTrikonaLord.length) {
            factors.push({ type: 'trikona-conjunction', strength: 'partial', desc: `${planet} is conjunct Trikona-lord(s) (${conjunctTrikonaLord.join(', ')}) — this real chart relationship helps offset the Dosha and can push results toward Raj-Yoga-Karaka-like territory.` });
        }
        if (conjunctBenefic.length) {
            factors.push({ type: 'benefic-conjunction', strength: 'partial', desc: `${planet} is conjunct natural benefic(s) (${conjunctBenefic.join(', ')}) — their supportive influence softens the Dosha.` });
        }

        let status;
        if (factors.some(f => f.strength === 'full')) status = 'nullified';
        else if (factors.some(f => f.strength === 'aggravates') && !factors.some(f => f.strength === 'partial' || f.strength === 'full')) status = 'aggravated';
        else if (factors.some(f => f.strength === 'partial')) status = 'reduced';
        else status = 'unmitigated';

        return { planet: planet, dignity: dignity, factors: factors, status: status };
    },

    // ===================== 4b. PPP ("PURNA PARMATMA ANSH") LAYER =====================
    //
    // Single-planet Raj-Yoga-Karaka rules, per the "Purna Parmatma Ansh
    // grahon ka prabhav" teaching:
    //   • A planet that rules ONLY Kendra house(s) (1,4,7,10 — no Trikona,
    //     no Trik overlap) and NATALLY SITS in a Trikona house (1,5,9) →
    //     single-planet Raj-Yoga-Karaka ("PPP planet").
    //   • A planet that rules ONLY Trikona house(s) and natally sits in a
    //     Kendra house → also a single-planet Raj-Yoga-Karaka.
    //   • Either condition is CANCELLED if that same planet also owns any
    //     Trik/Dushtana house (6,8,12) — "trishadaya dosha" crosses it out.
    //   • Kendradhipati Dosha (independent of the above): a planet that
    //     rules ONLY Kendra house(s) has its own natural quality dampened —
    //     a natural BENEFIC there loses some auspiciousness, a natural
    //     MALEFIC there loses some of its harshness. This is a softening
    //     note, not a verdict flip. WHY it's benefic/malefic (naisargik +
    //     functional determination) and its NULLIFICATION factors are now
    //     computed via getPlanetNature() / getKendradhipatiNullification()
    //     above and attached to each result below.

    /**
     * Per-planet PPP check for all non-node grahas (Sun..Saturn).
     * Rahu/Ketu are judged separately in getRahuKetuPPP() below, since the
     * source teaching gives them their own distinct 3-point rule.
     */
    getPPPPlanets: function (ascSignNum, natalPlanetsMap, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const results = [];
        planets.forEach(planet => {
            const p = natalPlanetsMap && natalPlanetsMap[planet];
            if (!p || p.house === undefined) return;
            const tags = this.getGroupTags(planet, ascSignNum, L).tags;
            const hasTrik = !!tags.trik;
            const ownsKendraOnly = !!tags.kendra && !tags.trikona;
            const ownsTrikonaOnly = !!tags.trikona && !tags.kendra;
            const sitsInTrikona = this.GROUPS.trikona.includes(p.house);
            const sitsInKendra = this.GROUPS.kendra.includes(p.house);
            const natureAnalysis = this.getPlanetNature(planet, ascSignNum, natalPlanetsMap, L);

            let isPPP = false, reason = null;
            if (!hasTrik && ownsKendraOnly && sitsInTrikona) {
                isPPP = true;
                reason = `${planet} rules only Kendra house${tags.kendra.length > 1 ? 's' : ''} (${tags.kendra.join(',')}) and natally sits in Trikona (house ${p.house}) — a pure single-planet Raj-Yoga-Karaka ("PPP" planet).`;
            } else if (!hasTrik && ownsTrikonaOnly && sitsInKendra) {
                isPPP = true;
                reason = `${planet} rules only Trikona house${tags.trikona.length > 1 ? 's' : ''} (${tags.trikona.join(',')}) and natally sits in Kendra (house ${p.house}) — a pure single-planet Raj-Yoga-Karaka ("PPP" planet).`;
            } else if (hasTrik && ((ownsKendraOnly && sitsInTrikona) || (ownsTrikonaOnly && sitsInKendra))) {
                reason = `${planet} would otherwise qualify (Kendra↔Trikona placement) but also rules Trik/Dushtana house(s) (${tags.trik.join(',')}) — trishadaya dosha CANCELS the Raj-Yoga-Karaka status.`;
            }

            let kendradhipatiDosha = null;
            if (ownsKendraOnly) {
                const nullification = this.getKendradhipatiNullification(planet, ascSignNum, natalPlanetsMap, L);
                const naisargikNature = natureAnalysis.naisargik.nature;
                if (naisargikNature === 'benefic') {
                    kendradhipatiDosha = { nature: 'benefic', desc: `${planet} rules only Kendra house(s) (${tags.kendra.join(',')}) — being a natural benefic (${natureAnalysis.naisargik.reason}), it suffers Kendradhipati Dosha: some reduction in its auspiciousness (it does NOT turn malefic).`, nullification: nullification };
                } else if (naisargikNature === 'malefic') {
                    kendradhipatiDosha = { nature: 'malefic', desc: `${planet} rules only Kendra house(s) (${tags.kendra.join(',')}) — being a natural malefic (${natureAnalysis.naisargik.reason}), its harshness is softened by Kendradhipati Dosha (it does NOT turn benefic, but acts noticeably milder).`, nullification: nullification };
                } else {
                    kendradhipatiDosha = { nature: 'neutral', desc: `${planet} rules only Kendra house(s) (${tags.kendra.join(',')}) — as a naturally neutral planet here (${natureAnalysis.naisargik.reason}), Kendradhipati Dosha has only a mild, situational effect.`, nullification: nullification };
                }
            }

            results.push({
                planet: planet, house: p.house, tags: tags,
                isPPP: isPPP, hasTrikDosha: hasTrik, reason: reason,
                kendradhipatiDosha: kendradhipatiDosha, natureAnalysis: natureAnalysis
            });
        });
        return results;
    },

    /**
     * Rahu/Ketu get their own 3-point rule from the source teaching (NOT
     * the Sun..Saturn rule above):
     *   1. Node alone (no conjunction with any other graha) in Kendra OR
     *      Trikona → highly auspicious ("atishubh") on its own.
     *   2. Node in Kendra conjunct a Trikona-lord, OR node in Trikona
     *      conjunct a Kendra-lord → Raj Yoga.
     *   3. Node in Upachaya (3,6,10,11) → generally good; BUT if conjunct a

     *      Trik-lord (6th/8th/12th lord) → its dasha can bring major
     *      hardship despite the Upachaya placement.
     */
    getRahuKetuPPP: function (ascSignNum, natalPlanetsMap, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const out = [];
        ['Rahu', 'Ketu'].forEach(node => {
            const p = natalPlanetsMap && natalPlanetsMap[node];
            if (!p || p.house === undefined) return;
            const house = p.house;
            const inKendra = this.GROUPS.kendra.includes(house);
            const inTrikona = this.GROUPS.trikona.includes(house);
            const inUpachaya = this.GROUPS.upachaya.includes(house);

            const conjunct = Object.keys(natalPlanetsMap).filter(pl =>
                pl !== node && natalPlanetsMap[pl] && natalPlanetsMap[pl].sn === p.sn);
            const conjunctKendraLord = conjunct.some(pl => !!this.getGroupTags(pl, ascSignNum, L).tags.kendra);
            const conjunctTrikonaLord = conjunct.some(pl => !!this.getGroupTags(pl, ascSignNum, L).tags.trikona);
            const conjunctTrikLord = conjunct.some(pl => !!this.getGroupTags(pl, ascSignNum, L).tags.trik);

            let verdict = 'neutral', label = 'No Special PPP Condition', detail =
                `${node} sits in house ${house} — none of the three classical ${node} conditions (alone in Kendra/Trikona, Kendra+Trikona-lord relation, or Upachaya) is triggered.`;

            if ((inKendra || inTrikona) && conjunct.length === 0) {
                verdict = 'highly_auspicious'; label = 'Atishubh (Highly Auspicious)';
                detail = `${node} sits alone (no conjunction) in ${inKendra ? 'Kendra' : 'Trikona'} (house ${house}) — classically highly auspicious on its own.`;
            } else if (inKendra && conjunctTrikonaLord) {
                verdict = 'raj_yoga'; label = 'Raj Yoga';
                detail = `${node} in Kendra (house ${house}) is conjunct a Trikona-lord — this forms Raj Yoga.`;
            } else if (inTrikona && conjunctKendraLord) {
                verdict = 'raj_yoga'; label = 'Raj Yoga';
                detail = `${node} in Trikona (house ${house}) is conjunct a Kendra-lord — this forms Raj Yoga.`;
            } else if (inUpachaya) {
                if (conjunctTrikLord) {
                    verdict = 'dangerous'; label = 'Upachaya + Trishadaya-linked — Caution';
                    detail = `${node} sits in Upachaya (house ${house}) but is conjunct a Trik(6/8/12)-lord — its dasha can bring significant hardship despite the otherwise-favourable Upachaya placement.`;
                } else {
                    verdict = 'good'; label = 'Good (Upachaya Placement)';
                    detail = `${node} sits in Upachaya (house ${house}) with no Trik-lord conjunction — generally favourable, growth-through-effort results.`;
                }
            }

            const naisargik = this.getNaisargikNature(node, natalPlanetsMap);
            out.push({ planet: node, house: house, verdict: verdict, label: label, detail: detail, conjunct: conjunct, naisargik: naisargik });
        });
        return out;
    },

    // ===================== 4c. DHAN-YOGA (WEALTH HOUSE) LAYER =====================
    //
    // Per "Money Making Dasha / Huge Wealth Combination" teaching: Dhan Yoga
    // forms when lords of the 4 wealth houses (2,5,9,11) combine with each
    // other (yuti/parivartan/mutual-drishti, judged via getSambandh, or one
    // planet ruling BOTH houses outright). WHICHEVER HOUSE the yoga forms
    // in is the actual SOURCE of wealth for the native; if the 7th house
    // from that source is empty of natal planets, it becomes a second
    // source (the "opposite empty house also reacts" rule).

    /** Resolve the lord of each of the 4 Dhana-Sthana for this ascendant. */
    getDhanaSthanaLords: function (ascSignNum, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const map = {};
        this.DHANA_STHANA.forEach(h => {
            const signNum = (ascSignNum + h - 1) % 12;
            map[h] = L[signNum];
        });
        return map;
    },

    /**
     * All Dhan-Yoga-forming combinations among the classical 2-9 / 2-11 /
     * 5-9 / 5-11 wealth-house pairs.
     */
    getDhanYogaCombinations: function (ascSignNum, natalPlanetsMap, lords) {
        const L = lords || this.DEFAULT_LORDS;
        const dhanaLords = this.getDhanaSthanaLords(ascSignNum, L);
        const combos = [];
        this.DHANA_STHANA_PAIRS.forEach(pair => {
            const h1 = pair[0], h2 = pair[1];
            const l1 = dhanaLords[h1], l2 = dhanaLords[h2];
            if (!l1 || !l2) return;
            if (l1 === l2) {
                combos.push({
                    houses: [h1, h2], lord1: l1, lord2: l2, sameLord: true, relation: 'single-lord',
                    detail: `${l1} rules BOTH house ${h1} and house ${h2} — one planet carrying two wealth-house agendas is itself a strong built-in Dhan Yoga.`
                });
                return;
            }
            const sambandh = this.getSambandh(l1, l2, natalPlanetsMap, L);
            if (sambandh.found && sambandh.level !== 'none') {
                combos.push({
                    houses: [h1, h2], lord1: l1, lord2: l2, sameLord: false, relation: sambandh.level,
                    sambandhDetails: sambandh.details,
                    detail: `${l1} (lord of ${h1}) and ${l2} (lord of ${h2}) share a ${sambandh.level} sambandh (${sambandh.details.map(d => d.label).join(', ') || 'chart relationship'}) — Dhan Yoga formed.`
                });
            }
        });
        return { dhanaLords: dhanaLords, combos: combos };
    },

    /**
     * For each Dhan-Yoga combo, work out the actual SOURCE house(s) of
     * wealth: the natal house each involved lord sits in, PLUS the 7th
     * house from it if that 7th house holds no natal planet (per the
     * "opposite empty house also becomes a source" rule).
     */
    getDhanYogaSourceHouses: function (combos, natalPlanetsMap) {
        const occupied = {};
        Object.values(natalPlanetsMap || {}).forEach(p => { if (p && p.house) occupied[p.house] = true; });
        return (combos || []).map(combo => {
            const sourceHouses = [];
            const seen = {};
            [combo.lord1, combo.lord2].forEach(lord => {
                const p = natalPlanetsMap && natalPlanetsMap[lord];
                if (!p || !p.house) return;
                if (!seen[p.house]) { sourceHouses.push({ house: p.house, why: `${lord} (dhan-yoga lord) sits here natally.` }); seen[p.house] = true; }
                const opp = ((p.house + 5) % 12) + 1;
                if (!occupied[opp] && !seen[opp]) {
                    sourceHouses.push({ house: opp, why: `7th from ${lord}'s house ${p.house} is empty of natal planets, so it also reacts as a wealth source.` });
                    seen[opp] = true;
                }
            });
            sourceHouses.sort((a, b) => a.house - b.house);
            return Object.assign({}, combo, { sourceHouses: sourceHouses });
        });
    },

    // ===================== 4d. PPP + DHAN-YOGA PER-DASHA-LEVEL SUMMARY =====================
    //
    // Ties the PPP (Raj-Yoga-Karaka) status and Dhan-Yoga wealth-source
    // houses of EACH running dasha lord together, so a running Mahadasha
    // (and every level below it) can be read as: "is this lord a PPP
    // planet, and if it also carries a wealth-house agenda, which house(s)
    // is the money actually going to come from during its period?"
    analyzePPPWealthForChain: function (levels, ascSignNum, natalPlanetsMap, lords, nakNamesArr) {
        const L = lords || this.DEFAULT_LORDS;
        const clean = (levels || []).filter(l => l && l.lord);
        const pppPlanets = this.getPPPPlanets(ascSignNum, natalPlanetsMap, L);
        const rahuKetuPPP = this.getRahuKetuPPP(ascSignNum, natalPlanetsMap, L);
        const dhanCombosRaw = this.getDhanYogaCombinations(ascSignNum, natalPlanetsMap, L);
        const dhanCombos = this.getDhanYogaSourceHouses(dhanCombosRaw.combos, natalPlanetsMap);

        const levelAnalysis = clean.map((lvl, i) => {
            const lord = lvl.lord;
            const isNode = (lord === 'Rahu' || lord === 'Ketu');
            const pppInfo = isNode ? (rahuKetuPPP.find(r => r.planet === lord) || null)
                                   : (pppPlanets.find(p => p.planet === lord) || null);
            const isPPP = isNode ? !!(pppInfo && (pppInfo.verdict === 'raj_yoga' || pppInfo.verdict === 'highly_auspicious'))
                                  : !!(pppInfo && pppInfo.isPPP);
            const involvedCombos = dhanCombos.filter(c => c.lord1 === lord || c.lord2 === lord);
            const wealthSourceHouses = [];
            const seenHouse = {};
            involvedCombos.forEach(c => c.sourceHouses.forEach(sh => {
                if (!seenHouse[sh.house]) { wealthSourceHouses.push(sh); seenHouse[sh.house] = true; }
            }));
            wealthSourceHouses.sort((a, b) => a.house - b.house);

            // Classical strength note: MD gives the FULL result of any yoga
            // it carries; AD gives a partial share; deeper levels flavour
            // it further but the MD/AD split is what the source teaching
            // stresses most for wealth timing.
            const strengthNote = i === 0
                ? `As the Mahadasha lord, ${lord} — if it carries a Dhan-Yoga/PPP status — delivers the FULLEST share of that yoga's result in this period.`
                : `As ${lvl.label} lord (a sub-period), ${lord} delivers only a PARTIAL share of any Dhan-Yoga/PPP result it carries — the Mahadasha lord still sets the overall ceiling.`;

            return {
                level: lvl.label, lord: lord, isMahadasha: i === 0,
                isPPP: isPPP, pppInfo: pppInfo,
                dhanYogaCombos: involvedCombos, wealthSourceHouses: wealthSourceHouses,
                strengthNote: strengthNote
            };
        });

        return { pppPlanets: pppPlanets, rahuKetuPPP: rahuKetuPPP, dhanCombos: dhanCombos, levelAnalysis: levelAnalysis };
    },

    // ===================== 5. FULL CHAIN ANALYSIS =====================

    /**
     * levels: ordered array [{label:'MAHADASHA', lord:'Jupiter'}, {label:'ANTARDASHA', lord:'Saturn'}, ...]
     * (MD → AD → PD → SD → PRA, whichever are currently active/known).
     * Produces a pairwise verdict for every adjacent pair, plus the two
     * "skip" pairs MD↔PD and MD↔AD-junior... kept simple: adjacent pairs
     * only, which is what the classical method actually judges.
     */
    analyzeChain: function (levels, ascSignNum, natalPlanetsMap, lords, nakNamesArr) {
        const clean = (levels || []).filter(l => l && l.lord);
        const pairs = [];
        for (let i = 0; i < clean.length - 1; i++) {
            const p = this.predictPair(clean[i].label, clean[i].lord, clean[i+1].label, clean[i+1].lord, ascSignNum, natalPlanetsMap, lords, nakNamesArr);
            if (p) pairs.push(p);
        }
        // Also directly judge senior-most (MD) against the deepest active
        // level, if chain has 3+ levels — gives the "big picture" call.
        let overview = null;
        if (clean.length >= 3) {
            overview = this.predictPair(clean[0].label, clean[0].lord, clean[clean.length-1].label, clean[clean.length-1].lord, ascSignNum, natalPlanetsMap, lords, nakNamesArr);
        }

        // Supplementary: each level's OWN Tara counted from the native's
        // Janma Nakshatra (birth Moon's nakshatra) to that lord's natal
        // nakshatra. Distinct from (and in addition to) the lord-to-lord
        // Tara Milan used inside each pair above.
        let janmaTaraChecks = [];
        const moonP = natalPlanetsMap && natalPlanetsMap.Moon;
        if (moonP && moonP.sid !== undefined) {
            const janmaNakIdx = this._getNakIndex(moonP.sid);
            const janmaNakName = this._nakName(janmaNakIdx, nakNamesArr);
            janmaTaraChecks = clean.map(l => {
                const t = this.getJanmaTaraForLord(l.lord, janmaNakIdx, natalPlanetsMap, nakNamesArr);
                return t ? Object.assign({ level: l.label }, t) : null;
            }).filter(Boolean);
            janmaTaraChecks.janmaNakName = janmaNakName;
        }

        // ===== Per-level POSITIVE/NEGATIVE score (what the user actually
        // wants displayed): Mahadasha is scored standalone (house-lordship
        // sah-dharm + its own Tara-from-Janma-Nakshatra); every deeper
        // level (Antardasha, Pratyantardasha, Sukshma, Prana) is scored
        // from its pair-verdict against the level immediately above it,
        // which is how the classical method actually judges a running
        // sub-period. =====
        const levelScores = clean.map((lvl, i) => {
            const taraInfo = janmaTaraChecks.find ? janmaTaraChecks.find(t => t.level === lvl.label) : null;
            if (i === 0) {
                const sahdharmScore = this.getStandaloneSahdharmScore(lvl.lord, ascSignNum, lords);
                const taraScoreValue = this._taraScoreValue(taraInfo);
                const totalScore = Math.round((sahdharmScore + taraScoreValue) * 10) / 10;
                return {
                    level: lvl.label, lord: lvl.lord, basis: 'standalone house-lordship (no senior lord above it)',
                    sahdharmScore: sahdharmScore, sambandh: null, tara: taraInfo, taraScoreValue: taraScoreValue,
                    totalScore: totalScore, verdict: totalScore > 0.5 ? 'Positive' : totalScore < -0.5 ? 'Negative' : 'Neutral/Mixed'
                };
            }
            const pair = pairs[i - 1]; // levels[i-1] -> levels[i]
            return {
                level: lvl.label, lord: lvl.lord, basis: `${clean[i - 1].label} ${clean[i - 1].lord} → ${lvl.label} ${lvl.lord}`,
                sahdharmScore: pair ? pair.sahdharm.netScore : 0, sambandh: pair ? pair.sambandh : null,
                tara: pair ? pair.tara : taraInfo, taraScoreValue: pair ? pair.taraScoreValue : this._taraScoreValue(taraInfo),
                totalScore: pair ? pair.numericScore : 0, verdict: pair ? pair.scoreVerdict : 'Neutral/Mixed'
            };
        });

        const pppWealth = this.analyzePPPWealthForChain(clean, ascSignNum, natalPlanetsMap, lords, nakNamesArr);

        return { levels: clean, pairs: pairs, overview: overview, janmaTaraChecks: janmaTaraChecks, levelScores: levelScores, pppWealth: pppWealth };
    },

    // ===================== 6. HTML RENDERING =====================

    _natureColor: function (nature) {
        if (nature === 'good') return '#00DD77';
        if (nature === 'bad') return '#FF4477';
        if (nature === 'caution') return '#FFA500';
        return '#8888AA';
    },

    _renderChip: function (text, color) {
        return `<span style="display:inline-block;margin:2px 4px 0 0;padding:2px 6px;border-radius:4px;background:${color}22;color:${color};font-size:9px;font-weight:bold;">${text}</span>`;
    },

    _renderPair: function (p) {
        if (!p) return '';
        const sh = p.sahdharm, sb = p.sambandh, tr = p.tara;
        const sharedChips = sh.sharedGroups.length
            ? sh.sharedGroups.map(g => this._renderChip(g.label.split(' — ')[0] + ' (h' + g.housesA.join(',') + '↔h' + g.housesB.join(',') + ')', p.verdictColor)).join('')
            : `<span style="color:var(--muted);font-size:9px;">no shared house-agenda</span>`;
        const sambandhChips = sb.found && sb.details.length
            ? sb.details.map(d => this._renderChip(d.label, '#66CCFF')).join('')
            : `<span style="color:var(--muted);font-size:9px;">no sambandh (yuti/drishti/parivartan)</span>`;
        const taraBlock = tr
            ? `<div style="margin-top:3px;font-size:9px;color:var(--muted);">Tara Milan (${p.lordA}→${p.lordB}, natal): <b style="color:${tr.nature==='good'?'#00DD77':tr.nature==='bad'?'#FF4477':'#FFA500'};">${tr.label}</b> — ${tr.desc}<br><span style="opacity:.85;">${tr.fromNak} → ${tr.toNak} · count=${tr.count} (mod 9 = ${tr.remainder}) → Tara #${tr.taraNumber}</span>${tr.highImpact ? '<br><span style="color:#FF4477;font-weight:bold;">⚠ HIGH-IMPACT COUNT (' + tr.name + ', count=' + tr.count + ')</span>' : ''}</div>`
            : '';
        const rajFlag = sh.isRajYogaCandidate && sb.level !== 'none'
            ? `<div style="margin-top:3px;font-size:9.5px;color:#FFD700;font-weight:bold;">⚑ Raj-Yoga-Karaka pattern (Trikona ↔ Kendra, in sambandh)</div>` : '';

        return `<div style="margin-top:8px;padding:7px 8px;border:1px solid ${p.verdictColor}44;border-radius:6px;background:${p.verdictColor}0A;">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;">
                    <div style="font-weight:bold;font-size:11px;color:${p.verdictColor};">${p.seniorLabel} ${p.lordA} → ${p.juniorLabel} ${p.lordB}</div>
                    <div style="font-size:9.5px;font-weight:bold;color:${p.verdictColor};">${p.verdictLabel}</div>
                  </div>
                  <div style="margin-top:4px;"><span style="font-size:8.5px;color:var(--muted);">SAH-DHARM:</span> ${sharedChips}</div>
                  <div style="margin-top:3px;"><span style="font-size:8.5px;color:var(--muted);">SAMBANDH:</span> ${sambandhChips}</div>
                  ${taraBlock}
                  ${rajFlag}
                  <div style="margin-top:5px;font-size:9px;line-height:1.45;color:var(--fg);opacity:.9;">${p.narrative}</div>
                </div>`;
    },

    _renderJanmaTaraChecks: function (checks) {
        if (!checks || !checks.length) return '';
        const rows = checks.map(t => {
            const c = this._natureColor(t.nature);
            return `<div style="display:flex;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:9px;">
                      <span style="color:var(--muted);min-width:110px;">${t.level} (${t.lord})</span>
                      <span style="flex:1;color:var(--muted);">${t.fromNak} → ${t.toNak} · count=${t.count} (mod 9=${t.remainder})</span>
                      <span style="color:${c};font-weight:bold;">Tara #${t.taraNumber} ${t.name}</span>
                    </div>`;
        }).join('');
        return `<div style="margin-top:10px;padding-top:6px;border-top:1px dashed rgba(255,215,0,.3);">
                  <div style="font-size:9.5px;font-weight:bold;color:#FFD700;margin-bottom:2px;">TARA-FROM-JANMA-NAKSHATRA CHECK (birth Moon nakshatra: ${checks.janmaNakName || '?'}) — each running lord's own Tara from the birth star, supplementary to the lord-to-lord Tara Milan above:</div>
                  ${rows}
                </div>`;
    },

    _renderScoreSummary: function (levelScores) {
        if (!levelScores || !levelScores.length) return '';
        const rows = levelScores.map(s => {
            const color = s.verdict === 'Positive' ? '#00DD77' : s.verdict === 'Negative' ? '#FF4477' : '#FFD700';
            const hi = s.tara && s.tara.highImpact ? ` <span style="color:#FF4477;font-weight:bold;">⚠${s.tara.name}(${s.tara.count})</span>` : '';
            return `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                      <span style="font-size:9.5px;color:var(--muted);min-width:120px;">${s.level} <b style="color:var(--fg);">${s.lord}</b></span>
                      <span style="flex:1;font-size:8.5px;color:var(--muted);">${s.basis}${hi}</span>
                      <span style="font-size:11px;font-weight:bold;color:${color};">${s.totalScore > 0 ? '+' : ''}${s.totalScore} → ${s.verdict}</span>
                    </div>`;
        }).join('');
        return `<div style="margin-bottom:8px;padding:7px 8px;border-radius:6px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.25);">
                  <div style="font-size:9.5px;font-weight:bold;color:#FFD700;margin-bottom:3px;">SCORE PER DASHA LEVEL (sah-dharm + sambandh-amplification + high-impact-aware Tara):</div>
                  ${rows}
                </div>`;
    },

    _natureVerdictColor: function (nature) {
        if (nature === 'benefic' || nature === 'yogakaraka' || nature === 'mixed-favourable') return '#00DD77';
        if (nature === 'malefic') return '#FF4477';
        if (nature === 'mixed') return '#FFD700';
        return '#8899AA';
    },

    _nullifyStatusColor: function (status) {
        if (status === 'nullified') return '#00DD77';
        if (status === 'reduced') return '#FFD700';
        if (status === 'aggravated') return '#FF4477';
        return 'var(--muted)';
    },

    _renderPPPWealthBlock: function (pppWealth) {
        if (!pppWealth || !pppWealth.levelAnalysis || !pppWealth.levelAnalysis.length) return '';

        const rows = pppWealth.levelAnalysis.map(la => {
            const pppColor = la.isPPP ? '#FFD700' : 'var(--muted)';
            const pppChip = la.isPPP
                ? this._renderChip('⚑ PPP / Raj-Yoga-Karaka', pppColor)
                : `<span style="color:var(--muted);font-size:9px;">not a PPP planet</span>`;
            const isNode = (la.lord === 'Rahu' || la.lord === 'Ketu');

            let pppDetail = '';
            if (la.pppInfo) {
                const detailText = isNode ? la.pppInfo.detail : la.pppInfo.reason;
                if (detailText) {
                    pppDetail = `<div style="margin-top:3px;font-size:9.5px;color:var(--fg);opacity:.9;">${detailText}</div>`;
                }
            }

            // ----- WHY benefic/malefic + METHOD used to determine it -----
            let natureBlock = '';
            if (isNode && la.pppInfo && la.pppInfo.naisargik) {
                const nz = la.pppInfo.naisargik;
                natureBlock = `<div style="margin-top:5px;padding:6px;border-radius:4px;background:rgba(255,255,255,.03);">
                    <div style="font-size:8.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Benefic/Malefic — Naisargik (Natural) Nature</div>
                    <div style="font-size:9px;margin-top:2px;"><b style="color:${this._natureVerdictColor(nz.nature)};">${nz.nature.toUpperCase()}</b> — ${nz.reason}</div>
                  </div>`;
            } else if (!isNode && la.pppInfo && la.pppInfo.natureAnalysis) {
                const na = la.pppInfo.natureAnalysis;
                natureBlock = `<div style="margin-top:5px;padding:6px;border-radius:4px;background:rgba(255,255,255,.03);">
                    <div style="font-size:8.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Benefic/Malefic Determination (Method: Naisargik + Functional)</div>
                    <div style="font-size:9px;margin-top:3px;"><b style="color:${this._natureVerdictColor(na.naisargik.nature)};">Naisargik: ${na.naisargik.nature.toUpperCase()}</b> — ${na.naisargik.reason}</div>
                    <div style="font-size:9px;margin-top:3px;"><b style="color:${this._natureVerdictColor(na.functional.nature)};">Functional (this ascendant): ${na.functional.nature.toUpperCase()}</b> — ${na.functional.reason}</div>
                    <div style="font-size:9px;margin-top:3px;color:var(--fg);opacity:.9;"><b>Overall verdict — ${na.overall.toUpperCase()}:</b> ${na.overallReason}</div>
                  </div>`;
            }

            // ----- Kendradhipati Dosha + its NULLIFICATION check -----
            let doshaBlock = '';
            if (!isNode && la.pppInfo && la.pppInfo.kendradhipatiDosha) {
                const kd = la.pppInfo.kendradhipatiDosha;
                doshaBlock = `<div style="margin-top:3px;font-size:9px;color:#FFA500;">⚠ ${kd.desc}</div>`;
                if (kd.nullification) {
                    const nf = kd.nullification;
                    const sc = this._nullifyStatusColor(nf.status);
                    const factorLines = nf.factors.length
                        ? nf.factors.map(f => `<div style="font-size:9px;margin-top:2px;">• ${f.desc}</div>`).join('')
                        : `<div style="font-size:9px;color:var(--muted);margin-top:2px;">No classical nullifying/aggravating factor detected (checked: exaltation, own-sign, debilitation, retrograde, Trikona-lord conjunction, benefic conjunction) — the Dosha applies at its ordinary strength.</div>`;
                    doshaBlock += `<div style="margin-top:5px;padding:6px;border-radius:4px;border-left:2px solid ${sc};background:${sc}0F;">
                        <div style="font-size:8.5px;color:${sc};font-weight:bold;text-transform:uppercase;letter-spacing:.5px;">Kendradhipati Dosha — Nullification Check: ${nf.status}</div>
                        ${factorLines}
                      </div>`;
                }
            }

            let wealthBlock = '';
            if (la.wealthSourceHouses.length) {
                const houseChips = la.wealthSourceHouses.map(sh =>
                    this._renderChip(`House ${sh.house}`, '#66CCFF')).join('');
                const comboLines = la.dhanYogaCombos.map(c => `<div style="font-size:9px;color:var(--fg);opacity:.85;margin-top:2px;">${c.detail}</div>`).join('');
                wealthBlock = `<div style="margin-top:6px;padding-top:5px;border-top:1px dashed rgba(102,204,255,.3);">
                    <span style="font-size:8.5px;color:var(--muted);">धन योग — WEALTH SOURCE HOUSE(S):</span> ${houseChips}
                    ${comboLines}
                  </div>`;
            } else {
                wealthBlock = `<div style="margin-top:6px;padding-top:5px;border-top:1px dashed rgba(102,204,255,.15);font-size:9px;color:var(--muted);">No Dhan-Yoga (2-5-9-11 lord combination) traced through this lord.</div>`;
            }

            return `<div style="margin-top:8px;padding:7px 8px;border:1px solid ${pppColor}44;border-radius:6px;background:${la.isPPP ? 'rgba(255,215,0,.06)' : 'rgba(255,255,255,.02)'};">
                      <div style="display:flex;justify-content:space-between;align-items:baseline;">
                        <div style="font-weight:bold;font-size:11px;color:var(--fg);">${la.level} — ${la.lord}</div>
                        ${pppChip}
                      </div>
                      ${pppDetail}
                      ${natureBlock}
                      ${doshaBlock}
                      ${wealthBlock}
                      <div style="margin-top:4px;font-size:8.5px;color:var(--muted);font-style:italic;">${la.strengthNote}</div>
                    </div>`;
        }).join('');

        return `<div class="pred-item" style="border-left:3px solid #FFD700;margin-top:10px;">
                   <div class="pred-title" style="color:#FFD700;">🕉️ PPP (पूर्ण परमात्मा अंश) ग्रह × धन योग — Mahadasha Wealth-House Analysis</div>
                   <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">For each running dasha lord: is it a single-planet Raj-Yoga-Karaka ("PPP" planet — pure Kendra-lord sitting in Trikona, or pure Trikona-lord sitting in Kendra, with Rahu/Ketu judged by their own 3-point rule), and does it also carry a 2-5-9-11 Dhan-Yoga — if so, which house(s) will actually deliver the wealth (किस भाव से मिलेगा अपार धन).</div>
                   ${rows}
                 </div>`;
    },

    renderHTML: function (analysis) {
        if (!analysis || !analysis.pairs || !analysis.pairs.length) {
            return `<div class="pred-item">Not enough active dasha levels to judge Sah-Dharm/Sambandh (need at least MD+AD).</div>`;
        }
        let html = `<div class="pred-item" style="border-left:3px solid #FFD700;">
                       <div class="pred-title" style="color:#FFD700;">📜 Sah-Dharm × Sambandh × Tara-Milan — Dasha Prediction (Laghu Parashari)</div>
                       <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Judges each running dasha pair by shared house-agenda of the two lords (सहधर्म), any real chart relationship between them (सम्बन्ध), and natal-to-natal Tara Milan.</div>`;
        html += this._renderScoreSummary(analysis.levelScores);
        analysis.pairs.forEach(p => { html += this._renderPair(p); });
        if (analysis.overview) {
            html += `<div style="margin-top:10px;padding-top:6px;border-top:1px dashed rgba(255,215,0,.3);">
                        <div style="font-size:9.5px;font-weight:bold;color:#FFD700;margin-bottom:2px;">OVERALL (${analysis.overview.seniorLabel} → deepest active level):</div>
                        ${this._renderPair(analysis.overview)}
                      </div>`;
        }
        html += this._renderJanmaTaraChecks(analysis.janmaTaraChecks);
        html += `</div>`;
        html += this._renderPPPWealthBlock(analysis.pppWealth);
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SAHDHARM_SAMBANDH_PREDICTOR;
}