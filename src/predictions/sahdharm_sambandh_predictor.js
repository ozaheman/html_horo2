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

    TARA_SEQUENCE: ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhaka', 'Vadha', 'Mitra', 'Parama Mitra'],

    TARA_MEANING: {
        'Janma':        { nature: 'caution', label: 'Janma (Birth Star)',        desc: 'Self-referential; identity/health focus, mildly cautionary.' },
        'Sampat':       { nature: 'good',    label: 'Sampat (Prosperity)',       desc: 'Wealth, gain, favourable material outcomes.' },
        'Vipat':        { nature: 'bad',     label: 'Vipat (Danger)',            desc: 'Obstacles, setbacks; avoid new ventures.' },
        'Kshema':       { nature: 'good',    label: 'Kshema (Wellbeing)',        desc: 'Safety, comfort, steady favourable results.' },
        'Pratyak':      { nature: 'bad',     label: 'Pratyak/Pratyari (Adversity)', desc: 'Opposition, conflict, delays.' },
        'Sadhaka':      { nature: 'good',    label: 'Sadhaka (Fulfilment)',      desc: 'Goals accomplished; favourable for objectives.' },
        'Vadha':        { nature: 'bad',     label: 'Vadha/Naidhana (Destructive)', desc: 'Most inauspicious; loss, harm, endings.' },
        'Mitra':        { nature: 'good',    label: 'Mitra (Friend)',            desc: 'Supportive, harmonious, cooperative results.' },
        'Parama Mitra': { nature: 'good',    label: 'Parama Mitra (Best Friend)', desc: 'Highly auspicious, best supportive results.' }
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
     */
    getTaraMilan: function (lordA, lordB, natalPlanetsMap, nakNamesArr) {
        const pa = natalPlanetsMap && natalPlanetsMap[lordA];
        const pb = natalPlanetsMap && natalPlanetsMap[lordB];
        if (!pa || !pb || pa.sid === undefined || pb.sid === undefined) return null;
        const nakA = this._getNakIndex(pa.sid);
        const nakB = this._getNakIndex(pb.sid);
        const diff = ((nakB - nakA) % 27 + 27) % 27;
        const taraIdx = diff % 9;
        const name = this.TARA_SEQUENCE[taraIdx];
        const meta = this.TARA_MEANING[name];
        return {
            fromNak: this._nakName(nakA, nakNamesArr), toNak: this._nakName(nakB, nakNamesArr),
            nakDiff: diff + 1, name: name, nature: meta.nature, label: meta.label, desc: meta.desc
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
        if (tara) narrative += `and the natal Tara from ${lordA} to ${lordB} is ${tara.label}, ${tara.nature === 'bad' ? 'reinforcing caution' : tara.nature === 'good' ? 'reinforcing support' : 'a mild, self-referential influence'}.`;
        if (sahdharm.isRajYogaCandidate && sambandh.level !== 'none') narrative += ` ⚑ Classical Raj-Yoga-Karaka dasha pattern (Trikona↔Kendra lords in sambandh).`;

        return {
            seniorLabel: seniorLabel, lordA: lordA,
            juniorLabel: juniorLabel, lordB: lordB,
            sahdharm: sahdharm, sambandh: sambandh, tara: tara,
            finalNature: finalNature, intensity: intensity,
            verdictLabel: verdictLabel, verdictColor: verdictColor,
            narrative: narrative
        };
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
        return { levels: clean, pairs: pairs, overview: overview };
    },

    // ===================== 6. HTML RENDERING =====================

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
            ? `<div style="margin-top:3px;font-size:9px;color:var(--muted);">Tara Milan (${p.lordA}→${p.lordB}, natal): <b style="color:${tr.nature==='good'?'#00DD77':tr.nature==='bad'?'#FF4477':'#FFA500'};">${tr.label}</b> — ${tr.desc}</div>`
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

    renderHTML: function (analysis) {
        if (!analysis || !analysis.pairs || !analysis.pairs.length) {
            return `<div class="pred-item">Not enough active dasha levels to judge Sah-Dharm/Sambandh (need at least MD+AD).</div>`;
        }
        let html = `<div class="pred-item" style="border-left:3px solid #FFD700;">
                       <div class="pred-title" style="color:#FFD700;">📜 Sah-Dharm × Sambandh × Tara-Milan — Dasha Prediction (Laghu Parashari)</div>
                       <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Judges each running dasha pair by shared house-agenda of the two lords (सहधर्म), any real chart relationship between them (सम्बन्ध), and natal-to-natal Tara Milan.</div>`;
        analysis.pairs.forEach(p => { html += this._renderPair(p); });
        if (analysis.overview) {
            html += `<div style="margin-top:10px;padding-top:6px;border-top:1px dashed rgba(255,215,0,.3);">
                        <div style="font-size:9.5px;font-weight:bold;color:#FFD700;margin-bottom:2px;">OVERALL (${analysis.overview.seniorLabel} → deepest active level):</div>
                        ${this._renderPair(analysis.overview)}
                      </div>`;
        }
        html += `</div>`;
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SAHDHARM_SAMBANDH_PREDICTOR;
}
