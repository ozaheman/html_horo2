/**
 * KP_prediction_4.js
 *
 * PART 4 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-3 — reuses window.KP_PREDICTION (Part 1).
 * Before writing this module, the existing engine was checked line-by-line
 * for what the new source material ("House Activation / Kashta House",
 * two "Dasha Pravesh Paddhati" lectures, "Planetary Script Formation")
 * already covers vs. what's genuinely new:
 *
 *   ALREADY PRESENT in KP_prediction.js (confirmed, NOT duplicated here):
 *     - getHouseActivatorPlanets()  — the full "connection then activation"
 *       two-step method (occupant/sign-lord "connection" -> whichever
 *       OTHER planet has that connected planet as ITS Nakshatra Lord is
 *       the "activator") for any house, not just 8th.
 *     - getSeventhHouseAnalysis() / SEVENTH_CSL_L1_HOUSE_TABLE — a full
 *       dedicated 7th-house (marriage/partnership) deep-dive already
 *       exists, complete with the negate-house cross-check.
 *     - getLossHouse(h) / getObstacleHouse(h) — generic, reusable
 *       "12th-from-h" (negation) and "8th-from-h" (obstacle) helpers
 *       already exist and are wired into getSeventhHouseAnalysis().
 *     - EIGHTH_HOUSE_PAIN_TYPE_TABLE — what KIND of pain each house's
 *       "planet-sits-here, NL-in-8th" pattern brings.
 *
 *   BUG FOUND AND FIXED directly in KP_prediction.js:
 *     - getNodeDispositorHouses() (the Rahu/Ketu sign-dispositor script
 *       builder) had a leftover DUPLICATE loop re-computing `ownedHouses`
 *       a second time immediately after already computing it — dead,
 *       redundant code (harmless in output only because the result is
 *       later de-duplicated through a Set(), but still incorrect/wasteful
 *       and a genuine copy-paste error). Removed the duplicate block.
 *
 *   GENUINELY MISSING (added in this file):
 *     1. DISEASE SOURCE-CAUSE-EFFECT-REMEDY ENGINE — the specific "Planet
 *        = Source/माध्यम (biological WHY) + Nakshatra = Activation (WHAT
 *        condition/house)" diagnostic combination, with a planet-to-
 *        biological-system table (Sun=calcium/bones/acidity, Venus=sugar/
 *        kidneys/hormones, Jupiter=liver/fat/cholesterol, etc.) and a
 *        body-part-by-house table, fused into one worked "why was I
 *        hospitalized" style diagnosis + remedy — this exact fusion
 *        wasn't present anywhere in Parts 1-3.
 *     2. FULLY-WORKED DASHA PRAVESH ("Guide Planet") METHOD — Part 2's
 *        analyzeDashaPravesh() already computes the transit-day sign
 *        lord as a "driver," but this adds the source lecture's full
 *        Tour-Guide analogy, the Guide's own NL(involvement)/SL
 *        (confirmation) two-level script (not just a flat house list),
 *        three fully-worked case studies from the lecture (marriage/
 *        health/property in one Antardasha; a child's exam result; a
 *        foreign-relocation confirmation), a marriage-specific OVERRIDE
 *        checker (natal AD promise vs. Guide's contradicting script), and
 *        the 3rd-CSL-to-9th-house Authorship/Publication rule.
 */

window.KP_PREDICTION_4 = {

    _p1: function () { return window.KP_PREDICTION || null; },


    // ================================================================
    // 1. DISEASE SOURCE-CAUSE-EFFECT-REMEDY DIAGNOSTIC ENGINE
    // ================================================================
    //
    // Method (from "House Activation / Kashta House"):
    //   PLANET (the running Dasha/Antardasha/Pratyantardasha lord) = the
    //     SOURCE/माध्यम — WHY the condition happened, read through that
    //     planet's own natural biological signification.
    //   Its NAKSHATRA LORD's house = the ACTIVATION — WHAT actually shows
    //     up (which house's affairs "wake up": 6th=ordinary illness,
    //     8th=chronic/surgical, 12th=hospitalization/isolation).
    //   The planet's OWN occupied/owned houses additionally point to the
    //     specific BODY PART affected (e.g. 1st=overall physique/head,
    //     5th=stomach/digestion).

    PLANET_BIOLOGICAL_SOURCE: {
        Sun: 'Calcium levels, bone density/strength, acidity (hyperacidity), and overall physical vitality.',
        Moon: 'Fluids/lymphatic balance, the mind/emotional-nervous state, and blood-sugar-adjacent fluctuation.',
        Mars: 'Blood (hemoglobin/red cells), muscle tissue, sharp/inflammatory pain, and accident-type physical trauma.',
        Mercury: 'The nervous system, skin, and respiratory/speech apparatus.',
        Jupiter: 'Liver function, body fat/cholesterol, and the pancreas (blood sugar regulation).',
        Venus: 'Sugar metabolism (diabetes-adjacent), kidneys, reproductive/hormonal balance.',
        Saturn: 'Chronic/degenerative processes, joints and bones (structural, distinct from Sun\'s calcium angle), and circulation/blockages.',
        Rahu: 'Toxic buildup, unexplained/mysterious ailments, and poisoning-type or contamination-linked issues.',
        Ketu: 'Immune-system irregularities, injuries of sudden/unclear origin, and conditions that resist conventional diagnosis.'
    },

    BODY_PART_BY_HOUSE: {
        1: 'Overall physique/constitution, the head.', 2: 'Face, mouth, teeth, throat.', 3: 'Shoulders, arms, hands, upper respiratory passage.',
        4: 'Chest, heart region, lungs.', 5: 'Stomach, upper abdomen, digestion.', 6: 'Lower abdomen, intestines, immune system.',
        7: 'Lower back, kidneys, reproductive organs.', 8: 'Reproductive/excretory organs, chronic-pain sites, sites of surgery.',
        9: 'Hips, thighs.', 10: 'Knees, joints.', 11: 'Calves, shins, circulation (legs).', 12: 'Feet, and sleep/hospital-bound states generally.'
    },

    ACTIVATION_CONDITION_BY_HOUSE: {
        6: 'Ordinary illness (साधारण बीमारी) — typically minor, resolves with standard treatment/medication.',
        8: 'Chronic illness, severe pain, sudden shock, or surgical/physical trauma.',
        12: 'Hospitalization, medical isolation, or significant bodily weakness/confinement.'
    },

    /**
     * Full diagnosis: given the currently-running Dasha/Antardasha/
     * Pratyantardasha planet, resolve its biological SOURCE, the house
     * its Nakshatra Lord ACTIVATES (what condition manifests), and the
     * likely BODY PART (from the source planet's own occupied/owned
     * houses) — then compose one worked diagnosis + remedy, exactly
     * mirroring the source lecture's own "Sun Mahadasha, Moon Nakshatra
     * Lord in 6th/12th -> stomach/calcium-linked illness leading to
     * hospitalization" worked example.
     */
    diagnoseIllnessSource: function (dashaPlanet, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const P1 = this._p1(); if (!P1 || !natalPlanetsMap[dashaPlanet]) return null;
        const pd = natalPlanetsMap[dashaPlanet];
        const kp = P1._getKPLords(pd.sid);
        const allCusps = P1.getAllCusps(ascSid);
        const planetNumbers = P1.getPlanetNumbers(allCusps);

        const sourceHouses = planetNumbers[dashaPlanet] || [];
        const activationHouses = (planetNumbers[kp.nakLord] || []).filter(h => this.ACTIVATION_CONDITION_BY_HOUSE[h]);
        const biologicalSource = this.PLANET_BIOLOGICAL_SOURCE[dashaPlanet] || 'General constitutional factors specific to this planet.';
        const bodyParts = sourceHouses.map(h => this.BODY_PART_BY_HOUSE[h]).filter(Boolean);

        const conditions = activationHouses.map(h => ({ house: h, condition: this.ACTIVATION_CONDITION_BY_HOUSE[h] }));

        const diagnosis = conditions.length
            ? `Running ${dashaPlanet} (Source/माध्यम) → Nakshatra Lord ${kp.nakLord} activates H${activationHouses.join(',H')}: ${conditions.map(c => c.condition).join(' ')} The biological WHY, from ${dashaPlanet}'s own natural signification: ${biologicalSource}${bodyParts.length ? ` The likely BODY AREA affected (from ${dashaPlanet}'s own occupied/owned houses H${sourceHouses.join(',H')}): ${bodyParts.join('; ')}.` : ''}`
            : `Running ${dashaPlanet}'s Nakshatra Lord (${kp.nakLord}) does not activate any of the 6th/8th/12th disease-triggering houses in this script — no specific illness-activation signature from this Dasha/Antardasha/Pratyantardasha combination.`;

        return {
            dashaPlanet: dashaPlanet, starLord: kp.nakLord, sourceHouses: sourceHouses,
            activationHouses: activationHouses, conditions: conditions,
            biologicalSource: biologicalSource, bodyParts: bodyParts, diagnosis: diagnosis
        };
    },

    /** Preventive remedy: address the biological factor named by the Source planet BEFORE its next Dasha/Antardasha/Pratyantardasha arrives — a physical remedy that bypasses the activation, per the source lecture. */
    getIllnessRemedy: function (diagnosisData) {
        if (!diagnosisData || !diagnosisData.conditions.length) return null;
        return {
            note: `Preventive remedy: proactively address the biological factor named above (${diagnosisData.biologicalSource}) — through diet, medical check-ups, or targeted treatment — BEFORE ${diagnosisData.dashaPlanet}'s next Dasha/Antardasha/Pratyantardasha period arrives. This is a physical remedy that bypasses the activation rather than merely reacting to it once the illness has already manifested.`
        };
    },

    renderIllnessDiagnosis: function (diagnosis, remedy) {
        if (!diagnosis) return '<div class="pred-item">Illness-source diagnosis needs a specific running Dasha planet — pass illnessDashaPlanet into analyze4().</div>';
        const hasCondition = diagnosis.conditions.length > 0;
        const c = hasCondition ? '#FF4477' : '#00DD77';
        return `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">🩺 Disease Source-Cause-Effect Diagnosis</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Method: the running Dasha planet is the biological SOURCE (why); its Nakshatra Lord's house is the ACTIVATION (what condition/where it shows up).</div>
            <div>${diagnosis.diagnosis}</div>
            ${remedy ? `<div style="margin-top:6px;padding:6px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">${remedy.note}</div>` : ''}
          </div>`;
    },


    // ================================================================
    // 2. DASHA PRAVESH ("दशा प्रवेश पद्धति") — THE GUIDE-PLANET METHOD
    // ================================================================
    //
    // Full method (Tour-Guide analogy): when a specific ANTARDASHA
    // begins (the technique is deliberately Antardasha-based, NEVER
    // Mahadasha — because the very first Antardasha inside any Mahadasha
    // already belongs to the Mahadasha lord itself, so building the rule
    // around Antardasha covers both cases at once; a 20-year Mahadasha is
    // also far too broad a span for any single yes/no event to hang on),
    // find which RASHI (sign) the Antardasha lord is transiting through
    // AT THE EXACT MOMENT that Antardasha begins. The LORD of that
    // transit sign becomes the "Guide" — like a stranger in a new town
    // who must ask a local Guide what's really there, the Antardasha
    // lord (new to this transit sign) effectively defers to the Guide's
    // own knowledge. The GUIDE's own two-level script — its Nakshatra
    // Lord's houses (Involvement — what enters the native's life) and
    // its Sub Lord's houses (Confirmation — whether it actually lands
    // well or badly) — gives the TRUE outcome for that Antardasha,
    // frequently overriding or sharply refining the Antardasha lord's
    // own natal-script guess.

    /**
     * @param antardashaLordTransitSid  sidereal longitude of the
     *   Antardasha lord IN TRANSIT at the exact moment the Antardasha
     *   begins (this is a real ephemeris position on that specific date
     *   — NOT the planet's natal position).
     */
    analyzeDashaPraveshGuide: function (antardashaLordTransitSid, ascSid, natalPlanetsMap, lords) {
        const P1 = this._p1(); if (!P1 || antardashaLordTransitSid === undefined) return null;
        const L = lords || (typeof LORDS !== 'undefined' ? LORDS : (window.LORDS || ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter']));
        const signNum = Math.floor(((antardashaLordTransitSid % 360) + 360) % 360 / 30) + 1;
        const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const guide = L[(signNum - 1) % 12];

        const guideData = natalPlanetsMap[guide];
        if (!guideData || guideData.sid === undefined) return { transitSign: signNames[signNum - 1], guide: guide, note: `Guide planet ${guide}'s own natal position is unavailable — cannot resolve its NL/SL script.` };

        const guideKP = P1._getKPLords(guideData.sid);
        const allCusps = P1.getAllCusps(ascSid);
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const involvementHouses = planetNumbers[guideKP.nakLord] || []; // Guide's NL = Involvement
        const confirmationHouses = planetNumbers[guideKP.subLord] || []; // Guide's SL = Confirmation

        return {
            transitSign: signNames[signNum - 1], guide: guide,
            guideNakLord: guideKP.nakLord, involvementHouses: involvementHouses,
            guideSubLord: guideKP.subLord, confirmationHouses: confirmationHouses,
            note: `The Antardasha lord transited into ${signNames[signNum - 1]} (ruled by ${guide}) exactly as this Antardasha began — ${guide} becomes the "Guide" for this entire sub-period. Guide's Involvement (its own Nakshatra Lord, ${guideKP.nakLord}): H${involvementHouses.join(',H') || '—'}. Guide's Confirmation (its own Sub Lord, ${guideKP.subLord}): H${confirmationHouses.join(',H') || '—'}. This two-level script is the TRUE outcome for this Antardasha — read it ahead of the Antardasha lord's own natal-script guess.`
        };
    },

    /**
     * Marriage-specific override: even if the natal Antardasha shows the
     * standard 2-7-11 marriage promise, if the Dasha Pravesh Guide's
     * Confirmation (Sub-Lord) level lands on 6-10-12, the source lecture
     * says to write FIRMLY that marriage will NOT happen in this specific
     * Antardasha — the Guide's script overrides the natal-level promise.
     */
    checkMarriageOverride: function (guideAnalysis) {
        if (!guideAnalysis || !guideAnalysis.confirmationHouses) return null;
        const negHit = [6, 10, 12].filter(h => guideAnalysis.confirmationHouses.includes(h));
        const posHit = [2, 7, 11].filter(h => guideAnalysis.confirmationHouses.includes(h));
        const overridden = negHit.length > 0;
        return {
            negHit: negHit, posHit: posHit, overridden: overridden,
            note: overridden
                ? `Guide (${guideAnalysis.guide})'s Confirmation level hits H${negHit.join(',H')} (6-10-12) — even if the natal Antardasha itself promised 2-7-11, write FIRMLY: "Marriage will NOT happen in this Antardasha." The Dasha Pravesh Guide's script overrides the natal-level promise.`
                : `Guide (${guideAnalysis.guide})'s Confirmation level does not hit 6-10-12${posHit.length ? ` and DOES hit H${posHit.join(',H')} (2-7-11)` : ''} — no override; the natal Antardasha promise stands.`
        };
    },

    /**
     * Authorship/Publication rule (3rd CSL → 9th house): 3rd house =
     * writing; 9th house = publication. Whether writing becomes AUTHORED
     * PUBLICATION depends on the NL/SL ORDER: NL=3,SL=9 → published;
     * NL=9,SL=3 → also published; NL=3,SL=8 → the work gets pulled/
     * cancelled even after being fully written (8 = sudden negation at
     * the final confirmation step). Timing of WHEN this fructifies in
     * life is found the normal way — via which Dasha/Antardasha involves
     * these same houses in its own NL script.
     */
    checkAuthorshipPromise: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const third = allCusps[3];

        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const nlHouses = planetNumbers[third.nakLord] || [];
        const slHouses = planetNumbers[third.subLord] || [];
        const nlHas3 = nlHouses.includes(3), nlHas9 = nlHouses.includes(9);
        const slHas3 = slHouses.includes(3), slHas9 = slHouses.includes(9);
        const slHas8 = slHouses.includes(8);

        let verdict, note;
        if ((nlHas3 && slHas9) || (nlHas9 && slHas3)) {
            verdict = 'PUBLISHED';
            note = `3rd CSL's Nakshatra Lord (${third.nakLord}, H${nlHouses.join(',H')}) and Sub Lord (${third.subLord}, H${slHouses.join(',H')}) together carry both H3 (writing) and H9 (publication) — the native's writing WILL become authored, published work. Exact life-timing: find whichever Dasha/Antardasha planet's own Nakshatra Lord involves H3/H9 in its script.`;
        } else if (nlHas3 && slHas8) {
            verdict = 'WRITTEN BUT PULLED';
            note = `3rd CSL's Nakshatra Lord (${third.nakLord}) gives H3 (writing happens) but Sub Lord (${third.subLord}) gives H8 — the work gets pulled, cancelled, or fails to reach publication even after being fully written.`;
        } else {
            verdict = 'NO STRONG SIGNAL';
            note = `No clean H3+H9 (or H3-then-H8 cancellation) pattern found on the 3rd CSL chain (NL H${nlHouses.join(',H') || '—'}, SL H${slHouses.join(',H') || '—'}) — authorship/publication is not strongly promised or denied by this specific rule.`;
        }
        return { csl: third.subLord, nakLord: third.nakLord, nlHouses: nlHouses, slHouses: slHouses, verdict: verdict, note: note };
    },

    renderDashaPraveshGuide: function (guideAnalysis, marriageOverride, authorship) {
        let html = '';
        if (guideAnalysis) {
            html += `<div class="pred-item" style="border-left:3px solid #B388FF;">
                <div class="pred-title" style="color:#B388FF;">🧭 Dasha Pravesh — Guide Planet Method</div>
                <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Method: whichever sign the Antardasha lord transits into exactly as the Antardasha begins, that sign's LORD becomes the "Guide" — its own two-level (Involvement/Confirmation) script is the TRUE outcome for this Antardasha, like asking a local guide rather than trusting a stranger's own guess.</div>
                <div><b>Transit Sign:</b> ${guideAnalysis.transitSign} → <b>Guide:</b> ${guideAnalysis.guide}</div>
                ${guideAnalysis.involvementHouses ? `<div style="margin-top:4px;"><b>Involvement (Guide's NL, ${guideAnalysis.guideNakLord}):</b> H${guideAnalysis.involvementHouses.join(',H') || '—'}</div>` : ''}
                ${guideAnalysis.confirmationHouses ? `<div style="margin-top:4px;"><b>Confirmation (Guide's SL, ${guideAnalysis.guideSubLord}):</b> H${guideAnalysis.confirmationHouses.join(',H') || '—'}</div>` : ''}
                <div style="margin-top:6px;padding:6px 8px;border-left:3px solid #B388FF;background:rgba(179,136,255,.08);">${guideAnalysis.note}</div>
              </div>`;
        }
        if (marriageOverride) {
            const c = marriageOverride.overridden ? '#FF4477' : '#00DD77';
            html += `<div class="pred-item" style="border-left:3px solid ${c};"><div class="pred-title" style="color:${c};">💍 Marriage Override Check (Dasha Pravesh)</div><div>${marriageOverride.note}</div></div>`;
        }
        if (authorship) {
            const c = authorship.verdict === 'PUBLISHED' ? '#00DD77' : authorship.verdict === 'WRITTEN BUT PULLED' ? '#FF4477' : 'var(--muted)';
            html += `<div class="pred-item" style="border-left:3px solid ${c};"><div class="pred-title" style="color:${c};">📖 Authorship/Publication Check (3rd CSL → 9th House)</div><div>${authorship.note}</div></div>`;
        }
        return html;
    },


    // ================================================================
    // 3. WORKED CASE STUDIES (from the source lecture, as reference data)
    // ================================================================

    CASE_STUDIES: [
        {
            id: 1, title: 'Sun\'s Antardasha — Marriage, Health & Property (not hospitalization/foreign/separation)',
            setup: 'Native\'s Sun Antardasha began Aug 18. Sun\'s OWN natal script (read the ordinary way): Nakshatra level gives H1+H7 (7th house occupied by Sun\'s own sign, so stronger); Sub Lord is Mercury, sitting in H4, with H12\'s own sign vacant (no other planet there) — which per KP still lets H12 contribute meaningfully. Read naively, this natal script suggests hospitalization, foreign travel, or spouse-separation as live possibilities.',
            method: 'Apply Dasha Pravesh: on Aug 18 (the exact day this Antardasha began), Sun was transiting Sagittarius — ruled by Jupiter. Jupiter becomes the Guide. Read JUPITER\'s own two-level script instead of trusting Sun\'s ambiguous natal read: Jupiter NL level gives H7 (marriage) with SL level H11 (fulfilment) → marriage reads as excellent, not troubled. Jupiter NL level also gives H1 (self/body) with SL level H5+H11 → health reads as excellent. Jupiter NL level H1 again with SL level H4+H11 → property/vehicle purchase likely.',
            result: 'Actual outcome matched the Guide\'s (Jupiter\'s) script, NOT Sun\'s own ambiguous natal possibilities: the native reported an excellent, friendly relationship with their spouse, very good health throughout the period, and did purchase property/a vehicle during this Antardasha — none of the hospitalization/foreign-travel/separation possibilities the raw Sun script alone had suggested actually occurred.',
            takeaway: 'The Antardasha lord\'s own natal script sets out several LIVE POSSIBILITIES; the Dasha Pravesh Guide\'s script is what actually resolves which possibility fructifies. Always run both, and trust the Guide\'s reading as the tie-breaker.'
        },
        {
            id: 2, title: 'Child\'s Exam Result — from "barely pass" to "excellent marks"',
            setup: 'Worried parents ask about a child\'s exam results. The child\'s Antardasha Sub Lord (at the natal level) gives H3, H8, H11 — an ambiguous mix (3 negates, 11 saves) that reads as "the child will barely scrape a pass."',
            method: 'Apply Dasha Pravesh: identify the sign the Antardasha planet transited into exactly as this Antardasha began. That sign\'s Lord (the Guide) gives, at its own NL level, H5 (intelligence/exam success), and at its own SL level, H2+H4+H11 together.',
            result: 'This is a dramatically stronger and more specific script than the natal "barely pass" read — the correct prediction, per the Guide\'s script, is that the child will not merely pass but score EXCELLENT marks.',
            takeaway: 'This is exactly why the SAME Antardasha (by planet name) never gives identical results twice across different life periods or different natives — the transit-day sign (and therefore the Guide) is different each time, even for the identical Antardasha-lord planet.'
        },
        {
            id: 3, title: 'Foreign Relocation — a weak natal signal confirmed decisively by Dasha Pravesh',
            setup: 'A native asks whether they will relocate abroad. Natally, the 3rd house (short travel) shows some involvement, but not strongly enough on its own to confidently predict actual relocation.',
            method: 'Apply Dasha Pravesh for the relevant Antardasha: the Guide planet\'s own Sub Lord level gives H3+H9 together (short-distance movement PLUS long-distance/foreign travel) — a much stronger, more specific combination than the natal 3rd-house-alone signal.',
            result: 'The native did in fact relocate to a foreign country during this exact Antardasha — matching the Dasha Pravesh Guide\'s stronger H3+H9 confirmation rather than the weaker natal-only signal.',
            takeaway: 'When a natal signal is present but not fully convincing on its own, Dasha Pravesh is the tool that either confirms it decisively or reveals that the natal signal was a red herring for this specific period.'
        }
    ],

    renderCaseStudies: function () {
        const rows = this.CASE_STUDIES.map(cs => `<div style="margin:6px 0;padding:8px;border-left:3px solid #7FDBAA;background:rgba(127,219,170,.06);">
            <b style="color:#7FDBAA;">Case ${cs.id}: ${cs.title}</b>
            <div style="font-size:8.5px;color:var(--muted);margin-top:4px;"><b>Setup:</b> ${cs.setup}</div>
            <div style="font-size:9px;color:#66CCFF;margin-top:3px;"><b>Method:</b> ${cs.method}</div>
            <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:3px;"><b>Result:</b> ${cs.result}</div>
            <div style="font-size:9px;color:#00DD77;margin-top:3px;"><b>Takeaway:</b> ${cs.takeaway}</div>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #7FDBAA;"><div class="pred-title" style="color:#7FDBAA;">📚 Dasha Pravesh — Worked Case Studies</div>${rows}</div>`;
    },


    // ================================================================
    // 4. TOP-LEVEL ANALYZE4 + RENDER
    // ================================================================

    /**
     * params: { natalPlanets, natalAsc, lords, illnessDashaPlanet,
     *   antardashaLordTransitSid, includeCaseStudies }
     */
    analyze4: function (params) {
        params = params || {};
        const P1 = this._p1();
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        if (!P1 || !natalPlanets || !natalAsc) return null;
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;
        const ascSignNum = natalAsc.sn;

        const illnessDiagnosis = params.illnessDashaPlanet
            ? this.diagnoseIllnessSource(params.illnessDashaPlanet, ascSid, ascSignNum, natalPlanets, params.lords) : null;
        const illnessRemedy = illnessDiagnosis ? this.getIllnessRemedy(illnessDiagnosis) : null;

        const guideAnalysis = params.antardashaLordTransitSid !== undefined
            ? this.analyzeDashaPraveshGuide(params.antardashaLordTransitSid, ascSid, natalPlanets, params.lords) : null;
        const marriageOverride = guideAnalysis ? this.checkMarriageOverride(guideAnalysis) : null;
        const authorship = this.checkAuthorshipPromise(ascSid, natalPlanets);

        return {
            illnessDiagnosis: illnessDiagnosis, illnessRemedy: illnessRemedy,
            guideAnalysis: guideAnalysis, marriageOverride: marriageOverride,
            authorship: authorship, includeCaseStudies: params.includeCaseStudies !== false
        };
    },

    renderHTML4: function (data) {
        if (!data) return '<div class="pred-item">KP Part 4 analysis unavailable — check that natalPlanets/natalAsc were supplied.</div>';
        let html = '<div class="pred-section-title" style="margin-top:10px;">🩷 KP Astrology — Part 4 (House Activation / Disease Source / Dasha Pravesh Guide)</div>';
        html += this.renderIllnessDiagnosis(data.illnessDiagnosis, data.illnessRemedy);
        html += this.renderDashaPraveshGuide(data.guideAnalysis, data.marriageOverride, data.authorship);
        if (data.includeCaseStudies) html += this.renderCaseStudies();
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION_4;
}
