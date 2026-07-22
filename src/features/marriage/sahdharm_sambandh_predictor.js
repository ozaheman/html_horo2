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

        return { levels: clean, pairs: pairs, overview: overview, janmaTaraChecks: janmaTaraChecks, levelScores: levelScores };
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
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SAHDHARM_SAMBANDH_PREDICTOR;
}