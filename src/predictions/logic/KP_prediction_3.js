/**
 * KP_prediction_3.js
 *
 * PART 3 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive companion to KP_prediction.js (Part 1) and KP_prediction_2.js (Part 2).
 * Reuses window.KP_PREDICTION and window.KP_PREDICTION_2 helpers rather than re-deriving math.
 *
 * ============================ TOPICS COVERED ===========================
 *
 * 1. EXTENDED KARMA-ALIGNMENT CONJUNCTIONS — Jupiter+Rahu (Guru Chandal Yoga),
 *    Sun+Rahu, Mars+Ketu, and Mars+Rahu with precise KAT workspace/behavioral remedies.
 *
 * 2. FOUR-TRINE (DHARMA/ARTHA/KAMA/MOKSHA) CONJUNCTION READING — Manifestations
 *    across 1-5-9 / 2-6-10 / 3-7-11 / 4-8-12 trines.
 *
 * 3. FULL 3-RULE RETROGRADE FILTER — (a) Star-Lord retrograde disqualification,
 *    (b) Self-retrograde delayed-not-denied rule, (c) Transit Agreement Rule.
 *
 * 4. TIERED 5th-HOUSE MONEY & CHILDBIRTH GRADING — Graded scale for stock speculation
 *    and 5th-house relative 6-8-12 ("unhealthy child at birth") risks.
 *
 * 5. COMPLETE 200-QUESTION MASTER HORARY / DIAGNOSTIC SCRIPT LIBRARY & EVALUATOR —
 *    Full 200-question catalog with house signatures, CSL mappings, retrograde screening,
 *    untenanted wildcard evaluations, and live programmatic execution.
 */

window.KP_PREDICTION_3 = {

    _p1: function () { return window.KP_PREDICTION || null; },
    _p2: function () { return window.KP_PREDICTION_2 || null; },

    // ================================================================
    // 1. EXTENDED KARMA-ALIGNMENT (RAHU/KETU/MARS) CONJUNCTIONS
    // ================================================================

    EXTENDED_CONJUNCTIONS: {
        'Jupiter+Rahu': {
            planets: ['Jupiter', 'Rahu'],
            method: 'Natal conjunction of Jupiter (guru-karaka, luck, wisdom) with Rahu (illusion, over-exposure) in the same house — classically "Guru Chandal Yoga."',
            prediction: 'Luck and personal aura get systematically destroyed specifically when the native makes themselves too accessible or available to everyone.',
            effect: 'Over-sharing personal plans, being constantly "on call" for everyone, or losing selectivity about who gets access to you directly drains this combination\'s luck reserve.',
            remedy: 'Maintain strict secrecy around personal plans and life details — deliberately create a "fog" around your personal life. Keep a genuinely safe distance from people rather than being universally accessible; luck returns in proportion to the boundary re-established.',
            reference: 'Rahul Kaushik, Karma Alignment Technique (KAT) — Jupiter-Rahu (Guru Chandal) accessibility rule.'
        },
        'Sun+Rahu': {
            planets: ['Sun', 'Rahu'],
            method: 'Natal conjunction of Sun (father/self/eldest son-karaka) with Rahu (illusion, indirect/digital medium) in the same house.',
            prediction: 'Immense suffering from immediate family or the first male child specifically when the native tries to be brutally, directly honest with them.',
            effect: 'Direct confrontation or blunt honesty with family under this combination consistently backfires into conflict; indirect, diplomatic communication consistently succeeds.',
            remedy: 'Be completely diplomatic with family. Do not share financial success directly. To motivate a child, do not tell the child directly — praise the child in front of the mother instead, letting the message travel indirectly (Rahu = indirect channel). The same "Sun conjunct Rahu" combination, read constructively, is also recorded as excellent for running an online/digital channel or business together with the eldest son.',
            reference: 'Rahul Kaushik, Karma Alignment Technique (KAT) — Sun-Rahu indirect-communication rule.'
        },
        'Mars+Ketu': {
            planets: ['Mars', 'Ketu'],
            method: 'Natal conjunction of Mars (impulsive direct action) with Ketu (detachment, instinct, non-analytical) in the same house.',
            prediction: 'Highly impulsive, aggressive, but brutally honest and straightforward nature.',
            effect: 'Overthinking or excessive strategizing actively RUINS this combination\'s natural strength — performance (especially in competitive/sporting contexts) measurably worsens the more the person deliberates.',
            remedy: 'For sportsmen/competitors specifically: do not strategize or overthink — go out and perform purely on instinct. Thinking is what destroys this combination\'s performance; trust the direct, reflexive first response instead.',
            reference: 'Rahul Kaushik, Karma Alignment Technique (KAT) — Mars-Ketu instinct-over-strategy rule for sportsmen.'
        },
        'Mars+Rahu': {
            planets: ['Mars', 'Rahu'],
            method: 'Natal conjunction of Mars (direct/impulsive action) with Rahu (illusion, indirect/digital medium) in the same house — commonly read in the context of expressing love/affection.',
            prediction: 'Expressing feelings (especially love, in a marital/partner context) DIRECTLY (Mars-style) under this combination consistently causes misunderstanding or conflict rather than connection.',
            effect: 'The native\'s natural instinct is direct/Mars-style expression, but the Rahu component means the message only lands correctly when delivered indirectly.',
            remedy: 'Align with the Rahu component rather than fighting it: express love/important messages indirectly — e.g. via a text message, or by telling a third person who then relays it to the intended recipient. The identical message, delivered indirectly instead of directly, is received perfectly.',
            reference: 'Rahul Kaushik, Karma Alignment Technique (KAT) — Mars-Rahu indirect-expression marital remedy.'
        }
    },

    getExtendedConjunctions: function (natalPlanetsMap) {
        if (!natalPlanetsMap) return [];
        const found = [];
        Object.keys(this.EXTENDED_CONJUNCTIONS).forEach(key => {
            const combo = this.EXTENDED_CONJUNCTIONS[key];
            const houses = combo.planets.map(p => natalPlanetsMap[p] && natalPlanetsMap[p].house).filter(h => h !== undefined);
            if (houses.length === combo.planets.length && houses.every(h => h === houses[0])) {
                found.push(Object.assign({ key: key, house: houses[0] }, combo));
            }
        });
        return found;
    },

    renderExtendedConjunctions: function (combos) {
        if (!combos || !combos.length) return '';
        const rows = combos.map(c => `<div style="margin:6px 0;padding:8px;border-left:3px solid #9b6fff;background:rgba(155,111,255,.06);">
            <b style="color:#9b6fff;">${c.planets.join(' + ')} in House ${c.house}</b>
            <div style="font-size:8.5px;color:var(--muted);margin-top:2px;"><b>Method:</b> ${c.method}</div>
            <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:4px;"><b>Prediction:</b> ${c.prediction}</div>
            <div style="font-size:9px;color:#66CCFF;margin-top:4px;"><b>Effect:</b> ${c.effect}</div>
            <div style="font-size:9px;color:#00DD77;margin-top:4px;"><b>Remedy:</b> ${c.remedy}</div>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #9b6fff;"><div class="pred-title" style="color:#9b6fff;">🔗 Extended KAT Conjunctions</div>${rows}</div>`;
    },

    // ================================================================
    // 2. FOUR-TRINE (DHARMA/ARTHA/KAMA/MOKSHA) CONJUNCTION READING
    // ================================================================

    TRINES: {
        Dharma: { houses: [1, 5, 9], theme: 'Personality, knowledge, righteous path' },
        Artha: { houses: [2, 6, 10], theme: 'Wealth, work, career (Saturn/Mercury/Venus-flavoured)' },
        Kama: { houses: [3, 7, 11], theme: 'Ambitions, desires, material gains' },
        Moksha: { houses: [4, 8, 12], theme: 'Liberation, occult, detachment (Sun/Moon/Mars/Jupiter-flavoured)' }
    },

    getTrineOf: function (houseNum) {
        for (const name in this.TRINES) if (this.TRINES[name].houses.includes(houseNum)) return name;
        return null;
    },

    GENERIC_TRINE_NARRATIVE_TEMPLATE: {
        Dharma: house => `Engaging deeply with this combination's natural subject develops and polishes the native's PERSONALITY (House ${house}, Dharma trine).`,
        Artha: house => `Engaging deeply with this combination's natural subject boosts the native's CAREER and workplace efficiency (House ${house}, Artha trine).`,
        Kama: house => `Engaging deeply with this combination's natural subject directly fulfils MATERIAL DESIRES and brings financial gains — makes the native a "go-getter" (House ${house}, Kama trine).`,
        Moksha: house => `Engaging deeply with this combination's natural subject brings deep DETACHMENT — the native says "I don't want money or fame, I just want to keep doing this" (House ${house}, Moksha trine). Advising commercial exploitation here typically fails — the karmic alignment demands liberation, not monetisation.`
    },

    analyzeTrinePlacement: function (houseNum) {
        const trine = this.getTrineOf(houseNum);
        if (!trine) return null;
        const narrative = this.GENERIC_TRINE_NARRATIVE_TEMPLATE[trine](houseNum);
        return { house: houseNum, trine: trine, trineHouses: this.TRINES[trine].houses, trineTheme: this.TRINES[trine].theme, narrative: narrative };
    },

    getConjunctionTrineReadings: function (natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return [];
        const combos = (P1.getRahuKetuCombinations ? P1.getRahuKetuCombinations(natalPlanetsMap) : [])
            .concat(this.getExtendedConjunctions(natalPlanetsMap));
        return combos.map(c => Object.assign({ comboKey: c.key, planets: c.planets }, this.analyzeTrinePlacement(c.house)));
    },

    renderTrineReadings: function (readings) {
        if (!readings || !readings.length) return '';
        const rows = readings.map(r => `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #FFB6C1;background:rgba(255,182,193,.08);">
            <b>${r.planets.join('+')}</b> in House ${r.house} → <b>${r.trine} Trine</b> (H${r.trineHouses.join(',H')} — ${r.trineTheme})
            <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:3px;">${r.narrative}</div>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #FFB6C1;"><div class="pred-title" style="color:#FFB6C1;">🔺 Four-Trine Conjunction Reading (Dharma/Artha/Kama/Moksha)</div>${rows}</div>`;
    },

    // ================================================================
    // 3. FULL 3-RULE RETROGRADE FILTER
    // ================================================================

    analyzeRetrogradeFilter: function (significatorPlanet, ascSid, natalPlanetsMap, transitTriggerPlanets) {
        const P1 = this._p1(); if (!P1 || !natalPlanetsMap[significatorPlanet]) return null;
        const pd = natalPlanetsMap[significatorPlanet];
        const kp = P1._getKPLords(pd.sid);
        const starLordData = natalPlanetsMap[kp.nakLord];
        const subLordData = natalPlanetsMap[kp.subLord];

        const selfRetro = !!(pd.retro === true || pd.isRetrograde === true);
        const starLordRetro = !!(starLordData && (starLordData.retro === true || starLordData.isRetrograde === true));
        const subLordRetro = !!(subLordData && (subLordData.retro === true || subLordData.isRetrograde === true));

        let verdict, note;
        if (starLordRetro) {
            verdict = 'DISQUALIFIED';
            note = `${significatorPlanet}'s Star Lord (${kp.nakLord}) is RETROGRADE — Rule (a): ${significatorPlanet} is DISQUALIFIED from delivering this event in its period, regardless of what its house-number script shows.`;
        } else if (selfRetro && !starLordRetro && !subLordRetro) {
            verdict = 'DELAYED';
            note = `${significatorPlanet} is itself RETROGRADE, but its Star Lord (${kp.nakLord}) and Sub Lord (${kp.subLord}) are both DIRECT — Rule (b): the event is NOT denied, only DELAYED until ${significatorPlanet} resumes direct motion.`;
        } else {
            verdict = 'CLEAR';
            note = `${significatorPlanet}, its Star Lord (${kp.nakLord}), and Sub Lord (${kp.subLord}) show no disqualifying retrograde pattern — this significator is clear to deliver on its own script's merits.`;
        }

        let transitAgreement = null;
        if (transitTriggerPlanets) {
            const retroTriggers = Object.keys(transitTriggerPlanets).filter(p => {
                const t = transitTriggerPlanets[p]; return t && (t.retro === true || t.isRetrograde === true);
            });
            transitAgreement = {
                allDirect: retroTriggers.length === 0, retroTriggers: retroTriggers,
                note: retroTriggers.length === 0
                    ? 'Transit Agreement Rule: all supplied transiting trigger planets are DIRECT on the predicted day — timing confirmed.'
                    : `Transit Agreement Rule VIOLATED: ${retroTriggers.join(', ')} ${retroTriggers.length > 1 ? 'are' : 'is'} retrograde on the predicted day — the event will likely NOT deliver on this exact date; look for the next window where all trigger significators are direct.`
            };
        }

        return { planet: significatorPlanet, starLord: kp.nakLord, subLord: kp.subLord, selfRetro: selfRetro, starLordRetro: starLordRetro, subLordRetro: subLordRetro, verdict: verdict, note: note, transitAgreement: transitAgreement };
    },

    renderRetrogradeFilter: function (data) {
        if (!data) return '';
        const c = data.verdict === 'DISQUALIFIED' ? '#FF4477' : data.verdict === 'DELAYED' ? '#FFD700' : '#00DD77';
        let out = `<div class="pred-item" style="border-left:3px solid ${c};">
            <div class="pred-title" style="color:${c};">↩️ Retrograde Filter — ${data.planet} [${data.verdict}]</div>
            <div>${data.note}</div>`;
        if (data.transitAgreement) {
            const tc = data.transitAgreement.allDirect ? '#00DD77' : '#FF4477';
            out += `<div style="margin-top:6px;padding:6px 8px;border-left:3px solid ${tc};background:${tc}15;">${data.transitAgreement.note}</div>`;
        }
        out += '</div>';
        return out;
    },

    // ================================================================
    // 4. TIERED 5th-HOUSE MONEY & CHILDBIRTH GRADING
    // ================================================================

    SHARE_MARKET_TIERS: [
        { tier: 'Great Gains', houses: [2, 6, 11], match: 'all' },
        { tier: 'Moderate Gains', houses: [2, 10], match: 'all' },
        { tier: 'Insignificant Gains', houses: [1, 3], match: 'all' },
        { tier: 'Great/Huge Loss', houses: [5, 8, 12], match: 'all' },
        { tier: 'Insignificant Loss', houses: [7, 9], match: 'any' },
        { tier: 'No Trade Executed', houses: [4], match: 'any' }
    ],

    gradeShareMarketOutcome: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const fifth = allCusps[5];
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const nlHouses = planetNumbers[fifth.nakLord] || [];

        const matchedTiers = this.SHARE_MARKET_TIERS.filter(t => {
            return t.match === 'all' ? t.houses.every(h => nlHouses.includes(h)) : t.houses.some(h => nlHouses.includes(h));
        });
        return {
            fifthCSL: fifth.subLord, fifthNL: fifth.nakLord, nlHouses: nlHouses,
            matchedTiers: matchedTiers.map(t => t.tier),
            note: matchedTiers.length
                ? `5th CSL's Nakshatra Lord (${fifth.nakLord}, H${nlHouses.join(',H')}) matches: ${matchedTiers.map(t => t.tier).join(' + ')}.${matchedTiers.some(t => t.tier === 'No Trade Executed') ? ' The 4th house presence means the native will naturally LOSE THE DESIRE to hit the trade button even on a good setup.' : ''}`
                : `5th CSL's Nakshatra Lord (${fifth.nakLord}, H${nlHouses.join(',H') || 'none'}) doesn't cleanly match any graded tier — treat as a neutral/unremarkable speculative signature.`
        };
    },

    checkUnhealthyChildRisk: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const fifth = allCusps[5];
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const nlHouses = planetNumbers[fifth.nakLord] || [];
        const riskHouses = [10, 12, 4]; // 6th, 8th, 12th counted FROM the 5th house
        const hit = riskHouses.filter(h => nlHouses.includes(h));
        const risk = hit.length >= 2;
        return {
            nlHouses: nlHouses, hit: hit, risk: risk,
            note: risk
                ? `5th CSL's Nakshatra Lord signifies H${hit.join(',H')} — these are the 6th/8th/12th houses COUNTED FROM the 5th house itself, warning of health complications for the child at birth.`
                : `No strong match with the 5th-house-relative 6th/8th/12th risk combination (H${riskHouses.join(',H')}) — no specific "unhealthy child" warning from this rule.`
        };
    },

    renderShareMarketGrading: function (grading, childRisk) {
        let out = '';
        if (grading) {
            const bad = grading.matchedTiers.some(t => t.indexOf('Loss') >= 0 || t === 'No Trade Executed');
            const c = grading.matchedTiers.length === 0 ? 'var(--muted)' : bad ? '#FF4477' : '#00DD77';
            out += `<div class="pred-item" style="border-left:3px solid ${c};"><div class="pred-title" style="color:${c};">📊 Tiered Share-Market Grading</div><div>${grading.note}</div></div>`;
        }
        if (childRisk) {
            const c = childRisk.risk ? '#FF4477' : '#00DD77';
            out += `<div class="pred-item" style="border-left:3px solid ${c};"><div class="pred-title" style="color:${c};">👶 Unhealthy-Child-at-Birth Check</div><div>${childRisk.note}</div></div>`;
        }
        return out;
    },

    // ================================================================
    // 5. MASTER 200-QUESTION HORARY & DIAGNOSTIC LIBRARY
    // ================================================================

    HORARY_LIBRARY: [
        { id: 1, category: 'Travel/Visa', q: 'Will I settle permanently in a foreign country?', csl: '12th CSL', positive: [3, 9, 12], negative: [4, 8, 11], method: 'Star Lord must involve 3 (leaving home), 9 (long travel), and 12 (foreign land). Sub-Lord must confirm.' },
        { id: 2, category: 'Legal', q: 'Who will win the match, election, or court case?', csl: '6th CSL', positive: [6, 10, 11], negative: [4, 5, 12], method: 'Ignore Dasha/Bhukti in competitive horary. 6-10-11 gives victory; 4-5-12 gives victory to opponent.' },
        { id: 3, category: 'Legal', q: 'Will I clear my competitive examination?', csl: '6th CSL', positive: [3, 6, 11], negative: [5, 12], method: '3 = writing/tests, 6 = passing competition, 11 = desire fulfillment.' },
        { id: 4, category: 'Children', q: 'Will I conceive a child?', csl: '5th CSL', positive: [2, 5, 11], negative: [1, 4, 10], method: 'Analyze mother\'s chart. 5th CSL Star Lord must involve 2, 5, 11. 4 negates 5.' },
        { id: 5, category: 'Marriage', q: 'Will I get married to my partner?', csl: '7th CSL', positive: [2, 7, 11], negative: [1, 6, 10, 12], method: '7th CSL Star Lord must involve 2, 7, 11. Sub-Lord landing in 6, 10, or 12 denies or breaks the marriage.' },
        { id: 6, category: 'Finance', q: 'Will my stuck payments in the market be recovered?', csl: '6th CSL', positive: [2, 6, 11], negative: [5, 8, 12], method: '2, 6, 11 recovers the debt; 5, 8, 12 indicates default.' },
        { id: 7, category: 'Finance', q: 'Can I generate regular profits in the stock market?', csl: '5th CSL', positive: [2, 5, 6, 11], negative: [5, 8, 12], method: 'Speculation is a 5th-house matter; Untenanted 5th CSL accelerates sudden windfalls.' },
        { id: 8, category: 'Career', q: 'Will I get this job offer or promotion?', csl: '6th/10th CSL', positive: [2, 6, 10, 11], negative: [5, 9, 12], method: '6th CSL governs job; 10th governs promotion. 5 negates 6; 9 negates 10.' },
        { id: 9, category: 'Property', q: 'Will I successfully purchase this property/house?', csl: '4th CSL', positive: [4, 11, 12], negative: [3, 8, 12], method: '4th CSL Star Lord must involve 4 and 11. Sub-Lord in 3 or 8 ruins the transaction.' },
        { id: 10, category: 'Property', q: 'Will I sell my property profitably?', csl: '10th CSL', positive: [3, 5, 10], negative: [4], method: 'The 10th CSL is the buyer\'s 4th — must involve 3 (loss of old house), 5, and 10.' },
        { id: 11, category: 'Health', q: 'Will I undergo a surgical operation?', csl: '6th CSL', positive: [8], negative: [7], method: '6th CSL Star Lord involving 8 indicates surgery. Involving 7 (12th from 8) negates it.' },
        { id: 12, category: 'Health', q: 'Will my disease heal successfully?', csl: '6th CSL', positive: [1, 5, 11], negative: [6, 8, 12], method: '1, 5, 11 = rapid healing; 6, 8, 12 = chronic distress/hospitalisation.' },
        { id: 13, category: 'Finance', q: 'Should I buy a specific share/equity?', csl: '11th CSL', positive: [5], negative: [4], method: '11th CSL Star or Sub involving 5 indicates profitable purchase. Involving 4 (12th from 5) indicates loss; do not buy.' },
        { id: 14, category: 'Career', q: 'Will I receive a corporate promotion this cycle?', csl: '10th CSL', positive: [2, 6, 10, 11], negative: [5, 9, 12], method: '10th CSL Star Lord involving 2, 6, 10, 11 confirms status elevation. 9 negates 10.' },
        { id: 15, category: 'Property', q: 'Will I experience a sudden relocation of my home?', csl: '4th CSL', positive: [1, 3, 8, 12], negative: [4], method: '4th CSL signifying 1, 3, and 8 with 12 indicates sudden, unexpected residential relocation.' },
        { id: 16, category: 'Children', q: 'Can I conceive a child via clinical IVF assistance?', csl: '5th CSL', positive: [4, 8, 12, 2, 5, 11], negative: [], method: '5th CSL connecting to clinical houses (4, 8, 12) along with 2, 5, 11 confirms birth through IVF.' },
        { id: 17, category: 'Health', q: 'Am I suffering from chronic clinical depression?', csl: '1st/4th CSL', positive: [5, 11], negative: [8, 12], method: 'Saturn/Rahu linking 1st/4th CSL to 8, 12 without 5, 11 recovery indicates clinical depression.' },
        { id: 18, category: 'Travel/Visa', q: 'Will my Visa or Passport application be approved?', csl: '3rd CSL', positive: [3, 9, 11], negative: [8, 12], method: '3 = documents, 9 = long travel, 11 = approval. 8, 12 causes rejection.' },
        { id: 19, category: 'Property', q: 'Will I purchase a vehicle (Car/Bike)?', csl: '4th CSL', positive: [4, 11, 12], negative: [3, 8], method: '4th CSL Star Lord involving 4 and 11 guarantees purchase.' },
        { id: 20, category: 'Marriage', q: 'Will I have a Love Marriage or Out-of-Caste Marriage?', csl: '7th CSL', positive: [5, 7, 11], negative: [], method: '7th CSL Star Lord involving 5 indicates love marriage; Rahu/Ketu confirms an unconventional union.' },
        { id: 21, category: 'Career', q: 'Will I successfully switch my job to a new company?', csl: '10th CSL', positive: [5, 9, 11], negative: [6, 10], method: '5 (12th from 6) and 9 (12th from 10) confirm resignation/status change.' },
        { id: 22, category: 'Finance', q: 'Will I inherit ancestral property or insurance funds?', csl: '8th CSL', positive: [2, 8, 11], negative: [1, 4, 10], method: '8th CSL Star Lord signifying 2, 8, 11 brings legacy/inheritance/insurance clearances.' },
        { id: 23, category: 'Property', q: 'Is there an Evil Spirit or Negative Energy in my home?', csl: '4th CSL', positive: [], negative: [8, 12], method: '4th CSL as Rahu signifying 8 or 12 confirms negative vibrations. Jupiter confirms divine energy.' },
        { id: 24, category: 'Finance', q: 'Can I recover my lost valuables or stolen assets?', csl: '2nd CSL', positive: [2, 6, 11], negative: [5, 8, 12], method: '2, 6, 11 recovers; 5, 8, 12 confirms permanent loss.' },
        { id: 25, category: 'Children', q: 'Will my clinical pregnancy survive without miscarriage?', csl: '5th CSL', positive: [2, 5, 11], negative: [4, 8], method: '5th CSL Sub-Lord involving 4 (negation) and 8 (trauma) indicates high miscarriage risk.' },
        { id: 26, category: 'General', q: 'Will a pet animal bring domestic harmony or medical drain?', csl: '6th CSL', positive: [6, 11], negative: [5, 12], method: 'Pets are ruled by 6th house. Star Lord in 6, 11 brings joy; Sub-Lord in 12 indicates recurring vet bills.' },
        { id: 27, category: 'Marriage', q: 'Will my marital relationship experience ideological disputes?', csl: '7th CSL', positive: [], negative: [6, 8, 12], method: '7th CSL in 6 = ideological dispute; in 12 = residential/legal separation.' },
        { id: 28, category: 'Finance', q: 'Should I purchase and wear a specific gemstone?', csl: '2nd CSL', positive: [2, 11], negative: [8, 12], method: 'Gemstones are ruled by 2nd house. 2nd CSL in 2, 11 boosts wealth; in 8, 12 triggers cash drains.' },
        { id: 29, category: 'Career', q: 'Can I earn wealth by launching or joining an MLM network?', csl: '10th CSL', positive: [3, 11, 2, 10], negative: [], method: 'MLM schemes are ruled by 3rd house (agencies/networking). 10th CSL signifying 3, 11 indicates high profits.' },
        { id: 30, category: 'Marriage', q: 'Will my business partner or spouse fall ill?', csl: '7th CSL', positive: [], negative: [6, 8], method: '7th CSL Star Lord signifying 6 (illness) and 8 (trauma) indicates physical distress for spouse.' },
        { id: 31, category: 'Legal', q: 'Will I face a government tax audit or tax raid?', csl: '8th CSL', positive: [], negative: [6, 8], method: '8th house rules tax departments. 8th CSL as Saturn/Rahu connecting to 6 and 8 triggers tax notices.' },
        { id: 32, category: 'Career', q: 'Will I obtain a traveling-oriented profession?', csl: '10th CSL', positive: [3, 9, 10, 11], negative: [], method: '10th CSL Star Lord involving 3 (short journeys) or 9 (long tours) alongside 10, 11 yields travel-career income.' },
        { id: 33, category: 'Children', q: 'Will my child get admission into a foreign university?', csl: '5th CSL', positive: [3, 5, 9, 11, 12], negative: [4], method: '5th CSL Star Lord involving 3, 5, 9, 12 confirms overseas admission. 4 indicates local home admission.' },
        { id: 34, category: 'Career', q: 'Will I face defamation or public humiliation at work?', csl: '10th CSL', positive: [5, 11], negative: [8, 12], method: '10th CSL Star Lord involving 8 (humiliation) and 12 (loss of post) brings disgrace unless protected by 5, 11.' },
        { id: 35, category: 'Career', q: 'Can I successfully run a home-based digital business?', csl: '3rd/10th CSL', positive: [3, 4, 10, 11], negative: [12], method: '3rd CSL (internet) linked to 4th (home) and 10th (status) confirms lucrative profits from remote operations.' },
        { id: 36, category: 'Travel/Visa', q: 'Will I embark on an auspicious spiritual pilgrimage?', csl: '9th CSL', positive: [3, 5, 9, 11], negative: [2, 6], method: '9th CSL Star Lord involving 3, 5, and 9 indicates visits to holy shrines and sacred pilgrimage sites.' },
        { id: 37, category: 'Marriage', q: 'Will I have a second marriage (re-marriage)?', csl: '9th CSL', positive: [2, 9, 11], negative: [1, 8, 12], method: 'Second marriage is 3rd from 7th (9th Cusp). 9th CSL Star Lord involving 2, 9, 11 promises successful re-marriage.' },
        { id: 38, category: 'Children', q: 'Will I conceive a second child?', csl: '7th CSL', positive: [2, 7, 11], negative: [], method: 'Second child is 3rd from 5th (7th Cusp). 7th CSL Star Lord involving 2, 7, 11 confirms second childbirth.' },
        { id: 39, category: 'Property', q: 'Will my home suffer from plumbing failures or water leakage?', csl: '4th CSL', positive: [], negative: [8, 12], method: '4th CSL as Moon connected to Saturn or 8, 12 triggers chronic plumbing defects and internal water leakages.' },
        { id: 40, category: 'Career', q: 'Will I win a Government Tender or Construction Contract?', csl: '3rd CSL', positive: [3, 10, 11], negative: [], method: 'Tenders are formal bids (3rd house). 3rd CSL signifying 3, 10, 11 guarantees winning government contract.' },
        { id: 41, category: 'Property', q: 'Will I receive regular Rental Income from my property?', csl: '6th CSL', positive: [2, 6, 11], negative: [], method: 'Rental income is service debt collection (6th house). 6th CSL Star Lord signifying 2, 6, 11 promises stable rent.' },
        { id: 42, category: 'Astrology Career', q: 'Will I become a successful Professional Astrologer?', csl: '10th CSL', positive: [1, 9, 10, 5], negative: [], method: 'Career cusp connecting 1 (self), 9 (counseling), and 10 (status) with 5 (solutions) confirms thriving career.' },
        { id: 43, category: 'Career', q: 'Will I lose my current corporate job due to layoffs?', csl: '6th CSL', positive: [], negative: [5, 9, 12], method: '6th CSL Star Lord involving 5 (12th from 6), 9 (12th from 10), and 12 confirms immediate job termination.' },
        { id: 44, category: 'Health', q: 'Will my father recover from his critical medical condition?', csl: '9th CSL', positive: [9, 1, 7], negative: [], method: 'Rotate chart so 9th is 1st. Recovery is confirmed by houses 1, 5, 11 from the 9th (standard 9, 1, 7).' },
        { id: 45, category: 'Finance', q: 'Will I secure funding from Angel Investors or VCs?', csl: '8th CSL', positive: [2, 8, 11], negative: [], method: '8th house rules investor capital (other people\'s money). 8th CSL signifying 2, 8, 11 secures funding.' },
        { id: 46, category: 'General', q: 'Will I experience constant domestic friction with my mother?', csl: '4th CSL', positive: [], negative: [6], method: '4th CSL Star Lord signifying 6 at Level 1 brings constant arguments. KAT: Maintain physical boundaries.' },
        { id: 47, category: 'General', q: 'Will my younger siblings become my opponents in business?', csl: '3rd CSL', positive: [], negative: [6], method: '3rd CSL (siblings) signifying 6th house indicates litigation, rivalry, and competition initiated by siblings.' },
        { id: 48, category: 'Property', q: 'Will our family property face court litigation among heirs?', csl: '2nd/8th CSL', positive: [], negative: [6, 8], method: '2nd CSL (family assets) or 8th CSL (inheritance) linking to 6 and 8 locks family estates in court disputes.' },
        { id: 49, category: 'Marriage', q: 'Will I reside with my in-laws or become a "Ghar Jamai"?', csl: '8th CSL', positive: [4, 8], negative: [], method: '8th CSL Star Lord involving 4 (home) and 8 (in-laws) confirms residing in or working from in-laws\' home.' },
        { id: 50, category: 'Health', q: 'Does my critical illness pose an immediate threat to life?', csl: '7th CSL', positive: [5, 11], negative: [2, 7], method: '7th CSL activating Maraka houses (2, 7) without 5, 11 recovery indicates grave physical danger.' },
        { id: 51, category: 'Career', q: 'Will I successfully run a Restaurant or Food business?', csl: '2nd CSL', positive: [2, 10, 11], negative: [], method: '2nd CSL signifying 2, 10, 11 with Moon (food/liquids) or Venus (dining) confirms a thriving restaurant.' },
        { id: 52, category: 'General', q: 'Will I face back-stabbing conspiracies by secret enemies?', csl: '12th CSL', positive: [11], negative: [8, 12], method: '12th CSL (secret plots) signifying 8 and 12 confirms malicious schemes by hidden rivals.' },
        { id: 53, category: 'Marriage', q: 'Are my partner and I heading for a temporary dispute or divorce?', csl: '7th CSL', positive: [], negative: [6, 12], method: '7th CSL in 6th indicates sleeping in separate beds; in 12th indicates legal/residential separation.' },
        { id: 54, category: 'Career', q: 'Should I start travel blogging or food blogging?', csl: '10th CSL', positive: [10, 11], negative: [], method: 'Saturn (work), Moon (travel/food), and Rahu (social media) combined on career cusps confirms success.' },
        { id: 55, category: 'Property', q: 'Will I face a sudden change of residence due to exams?', csl: '3rd CSL', positive: [1, 3, 8], negative: [], method: '3rd CSL triggering 1 (self) and 8 (suddenness) indicates sudden academic relocation.' },
        { id: 56, category: 'Astrology Career', q: 'Can I learn and practice astrology as a full-time career?', csl: '10th CSL', positive: [10, 8], negative: [], method: '10th Lord residing in the Nakshatra of the 8th Lord establishes astrology as a primary profession.' },
        { id: 57, category: 'Sports/Fame', q: 'Will I achieve stardom in Sports, Theater, or Creative Arts?', csl: '5th CSL', positive: [11], negative: [], method: '5th CSL Star Lord signifying 11 confirms personal stardom. Without 11, the native remains back-stage crew.' },
        { id: 58, category: 'Career', q: 'Will I succeed as a professional Vastu Consultant?', csl: '10th CSL', positive: [4, 10], negative: [], method: '10th CSL Star Lord involving 4 (buildings/Vastu) and 10 (status) confirms lucrative earnings as Vastu advisor.' },
        { id: 59, category: 'Career', q: 'Will I work as an employee inside a stock brokerage firm?', csl: '10th Lord', positive: [5], negative: [], method: '10th Lord placed in 5th house of Bhav Chalit confirms employment inside financial brokerage companies.' },
        { id: 60, category: 'General', q: 'Will I possess an extremely saving-oriented or miserly nature?', csl: '1st CSL', positive: [11], negative: [], method: '11th house is 12th from 12th (negating spending). 1st CSL signifying 11 creates an obsessive saving mindset.' },
        { id: 61, category: 'Health', q: 'Why do I panic and rush to the clinic over minor health issues?', csl: '1st CSL', positive: [], negative: [12], method: '1st CSL signifying 12th house (hospitalization fear) induces acute hypochondria and clinic visits.' },
        { id: 62, category: 'Property', q: 'Will my driving style be extremely fast and aggressive?', csl: '4th CSL', positive: [], negative: [], method: '4th CSL as Moon transfers rapid transit speed to conveyances, prompting aggressive driving.' },
        { id: 63, category: 'General', q: 'Will I win a heated verbal argument over the phone/internet?', csl: '3rd CSL', positive: [3, 11], negative: [], method: '3rd CSL Star Lord involving 3 (telecommunications) and 11 (victory) guarantees dominating online debates.' },
        { id: 64, category: 'Finance', q: 'Will I receive substantial financial aid or dowry from in-laws?', csl: '2nd CSL', positive: [8], negative: [], method: '2nd CSL heavily linked to 8th house (in-laws\' wealth) confirms major capital or asset transfers from in-laws.' },
        { id: 65, category: 'Children', q: 'Will I conceive a third child?', csl: '9th CSL', positive: [2, 9, 11], negative: [], method: 'Third child is 3rd from 7th (9th Cusp). 9th CSL Star Lord signifying 2, 9, 11 promises birth of a third child.' },
        { id: 66, category: 'Marriage', q: 'Will I have a third marriage?', csl: '11th CSL', positive: [2, 11], negative: [], method: 'Third marriage is 3rd from 9th (11th Cusp). 11th CSL Star Lord signifying 2, 11 confirms third marital union.' },
        { id: 67, category: 'Health', q: 'Am I at high risk of chronic lung disease or respiratory cancer?', csl: '6th CSL', positive: [], negative: [4, 8, 12], method: '6th CSL as Venus afflicted by Saturn/Rahu in 4th house (chest) indicates high respiratory vulnerability.' },
        { id: 68, category: 'Career', q: 'Will I succeed as a high-level Data Scientist?', csl: '10th CSL', positive: [3, 8, 10], negative: [], method: '10th CSL involving 3 (data/web), 8 (unmined databases), and 10 (status) confirms data analytics success.' },
        { id: 69, category: 'Career', q: 'Will I succeed in establishing or managing a private School?', csl: '10th CSL', positive: [4, 10], negative: [], method: '10th CSL Star Lord involving 4 (educational premises) and 10 (authority) promises school management success.' },
        { id: 70, category: 'Career', q: 'Should I start a business in Export-Import marketing?', csl: '10th CSL', positive: [3, 11, 12], negative: [], method: '10th CSL linking 3 (agency), 11 (gains), and 12 (foreign markets) yields international trade prosperity.' },
        { id: 71, category: 'Career', q: 'Should I open a photocopy or documentation kiosk?', csl: '10th CSL', positive: [3, 6, 8, 12], negative: [], method: 'Difficult 3, 6, 8, 12 career script is neutralized by opening a photocopying or typing center.' },
        { id: 72, category: 'Health', q: 'Why does my body take so long to heal from minor illnesses?', csl: '1st CSL', positive: [5], negative: [4], method: '1st CSL Star Lord residing in 4th house negates 5th house (healing engine), inducing weak recuperation.' },
        { id: 73, category: 'General', q: 'Am I prone to compulsive addictions, over-eating, or smoking?', csl: '1st CSL', positive: [], negative: [8], method: '8th house rules excess and extremes. 1st CSL linking to 8th induces obsessive behavioral dependencies.' },
        { id: 74, category: 'General', q: 'Why do I feel an insatiable urge to splurge on luxury brands?', csl: '3rd Lord', positive: [], negative: [12], method: '3rd Lord (choices/shopping) in 12th house (heavy expenditure) creates an irresistible urge to splurge.' },
        { id: 75, category: 'Children', q: 'Should my child pursue distance learning or homeschooling?', csl: '3rd CSL', positive: [3, 4], negative: [], method: '3rd CSL (distance learning) active with 4th (home) indicates child thrives via homeschooling.' },
        { id: 76, category: 'Career', q: 'Why am I unable to hold a single job for more than a few months?', csl: '6th CSL', positive: [], negative: [5], method: '6th CSL triggering 5th house (12th from 6th) continually negates service, forcing frequent job exits.' },
        { id: 77, category: 'General', q: 'Will I achieve spiritual liberation (Moksha) or total let-go?', csl: '12th CSL', positive: [12], negative: [], method: '12th CSL connecting to 12th house across Planet, Star, and Sub confirms total spiritual detachment.' },
        { id: 78, category: 'General', q: 'Will my speech spark legal trouble, controversies, or plots?', csl: '3rd CSL', positive: [], negative: [8], method: '3rd CSL Star Lord in 8th house causes spoken words to spark legal crises. KAT: Practice silence.' },
        { id: 79, category: 'General', q: 'Will I achieve national or international fame in my lifetime?', csl: '1st CSL', positive: [10], negative: [], method: '1st CSL signifying 10th house promises significant public honor, administrative recognition, and fame.' },
        { id: 80, category: 'General', q: 'Why am I extremely tight-fisted when spending on myself?', csl: '1st CSL', positive: [11], negative: [], method: '1st CSL signifying 11th house (negation of 12th house of spending) creates an intense wealth-hoarding habit.' },
        { id: 81, category: 'Health', q: 'Why do I rush to emergency clinics over minor physical aches?', csl: '1st CSL', positive: [], negative: [12], method: '1st CSL signifying 12th house triggers subconscious hospital fears, making native panic over symptoms.' },
        { id: 82, category: 'Finance', q: 'Will I be cheated or suffer heavy capital loss in an auction bid?', csl: '8th CSL', positive: [2, 11], negative: [5, 8, 12], method: '8th CSL Star Lord in 8th confirmed by 5, 8, 12 Sub-Lord leads to auction defaults and capital loss.' },
        { id: 83, category: 'Finance', q: 'Will I inherit unearned capital or insurance settlements?', csl: '2nd CSL', positive: [8], negative: [], method: '2nd CSL linking to 8th house brings sudden financial windfalls through inheritance or insurance claims.' },
        { id: 84, category: 'Health', q: 'Will my chronic work stress manifest as a physical disease?', csl: '8th Lord', positive: [], negative: [6], method: '8th Lord (mental stress) placed in 6th house (disease) in Bhav Chalit converts trauma into physical illness.' },
        { id: 85, category: 'General', q: 'Why do my confidential business plans always get leaked?', csl: '12th CSL', positive: [], negative: [7], method: '12th CSL (secrets) signifying 7th house (the public) exposes private strategies to competitors.' },
        { id: 86, category: 'Finance', q: 'Will I make money by organizing chit funds or pooled committees?', csl: '2nd Lord', positive: [8], negative: [], method: '2nd Lord in 8th house of Bhav Chalit generates wealth by handling collective funds and trusts.' },
        { id: 87, category: 'KAT-Remedy', q: 'How do I align Guru Chandal Yoga to gain divine blessings?', csl: 'Jupiter+Rahu', positive: [], negative: [], method: 'KAT: Maintain strict professional and physical distance from clients/gurus. Proximity triggers clashes.' },
        { id: 88, category: 'Career', q: 'Can my eldest son and I build a successful online business?', csl: 'Sun+Rahu', positive: [3, 10, 11], negative: [], method: 'Sun (eldest son) conjunct Rahu (digital medium) confirms massive success running a virtual channel.' },
        { id: 89, category: 'KAT-Remedy', q: 'How do I neutralize chronic career anxiety from Saturn-Rahu?', csl: 'Saturn+Rahu', positive: [], negative: [], method: 'KAT: Focus on continuous expansion and scaling of business operations. Static routines trigger anxiety.' },
        { id: 90, category: 'Donation', q: 'What item should I donate to pacify an unfavorable Jupiter?', csl: 'Jupiter', positive: [], negative: [], method: 'Donate yellow chana dal (split peas) to poor priests or temples during daylight hours.' },
        { id: 91, category: 'Donation', q: 'What item should I donate to pacify a negative Saturn period?', csl: 'Saturn', positive: [], negative: [], method: 'Donate black urad dal (gram) or iron items to manual laborers during daylight hours.' },
        { id: 92, category: 'Donation', q: 'What item should I donate to pacify an afflicted Mercury?', csl: 'Mercury', positive: [], negative: [], method: 'Donate whole green moong dal to birds or needy students during daylight to resolve nervous stress.' },
        { id: 93, category: 'Donation', q: 'What item should I donate to pacify an active Ketu period?', csl: 'Ketu', positive: [], negative: [], method: 'Donate fresh yellow bananas to orphans or monkeys near temple premises to neutralize physical injuries.' },
        { id: 94, category: 'Donation', q: 'What item should I donate to pacify an afflicted Venus?', csl: 'Venus', positive: [], negative: [], method: 'Donate fresh white curd (yogurt) to religious shrines to heal marital disputes.' },
        { id: 95, category: 'Marriage', q: 'What underlying trigger will cause my marital divorce?', csl: '7th CSL', positive: [], negative: [2, 10], method: '10th house indicates workaholic neglect; 2nd house indicates harsh speech and cash disputes.' },
        { id: 96, category: 'Health', q: 'Can a simple 1-6-10 career script cause life-threatening tumors?', csl: '6th CSL', positive: [1, 6, 10], negative: [], method: '1-6-10 is purely professional. Malignant growths require active 8th (trauma) and 12th (confinement).' },
        { id: 97, category: 'Marriage', q: 'Will my business partner or spouse face major surgeries?', csl: '7th CSL', positive: [], negative: [6, 8], method: '7th CSL Star Lord signifying 6 (illness) and 8 (cutting/pain) confirms partner will undergo major surgeries.' },
        { id: 98, category: 'General', q: 'Should I study in absolute isolation to master occult sciences?', csl: '9th CSL', positive: [6], negative: [], method: '9th CSL involving 6th house confirms profound occult mastery is achieved only when studying in isolation.' },
        { id: 99, category: 'Legal', q: 'Will the political opposition party defeat the incumbent government?', csl: '7th CSL', positive: [], negative: [4, 5], method: 'Horary script showing 4 and 5 (opponent\'s 10th and 11th) confirms opposition party wins election.' },
        { id: 100, category: 'Finance', q: 'Why is my bank liquidity unstable despite very high revenue?', csl: '2nd CSL', positive: [], negative: [8], method: '2nd CSL linking to 8th house brings massive cash flow through consulting but keeps bank reserves volatile.' },
        { id: 101, category: 'Career', q: 'Will I get an immediate job call letter or joining date this month?', csl: '6th/10th CSL', positive: [2, 6, 11], negative: [5, 9, 12], method: 'Sun transit in month and Moon transit on day crossing 2, 6, 11 significators delivers joining date.' },
        { id: 102, category: 'Career', q: 'Will I have a successful career in the jewelry or ornament trade?', csl: '10th CSL', positive: [2, 7, 10, 11], negative: [], method: '10th CSL signifying 2, 7, 10, 11 under Venus (Karakatva for luxury/gems) confirms massive jewelry profits.' },
        { id: 103, category: 'Career', q: 'Will I succeed in a creative product design or software development company?', csl: '10th CSL', positive: [5, 10, 11], negative: [], method: '10th CSL Star Lord involving 5 (design) and 10 confirmed by 11 with Mercury confirms tech development success.' },
        { id: 104, category: 'General', q: 'Should I select Option D in a multi-investment business dilemma?', csl: 'Transiting Lagna', positive: [2, 11], negative: [], method: 'Sum active direct RP values. Modulo 4 remainder of 0 indicates Option D (4th choice) is successful.' },
        { id: 105, category: 'Career', q: 'Will I get a corporate job inside a stock trading or financial brokerage firm?', csl: '10th Lord', positive: [5], negative: [], method: '10th Lord in 5th house of Bhav Chalit confirms employment inside financial brokerage companies.' },
        { id: 106, category: 'Astrology Career', q: 'Can I practice as a successful full-time astrologer or occult consultant?', csl: '10th CSL', positive: [8, 10], negative: [], method: '10th Lord residing in the Nakshatra of 8th Lord establishes astrology/occult as a primary calling.' },
        { id: 107, category: 'Marriage', q: 'Will my business partner or spouse fall ill, causing financial strain?', csl: '7th CSL', positive: [], negative: [6, 8, 12], method: '7th CSL signifying 6 (illness), 8 (pain), and 12 (expenses) drains family savings on partner treatments.' },
        { id: 108, category: 'Career', q: 'Should I start an online distance learning or homeschooling franchise?', csl: '3rd/10th CSL', positive: [3, 4, 10, 11], negative: [], method: '3rd CSL (distance education) with 4th (home) and 10th confirms lucrative earnings from online schooling.' },
        { id: 109, category: 'Finance', q: 'Will I make money by running financial committees or collective trust funds?', csl: '2nd Lord', positive: [8], negative: [], method: '2nd Lord in 8th house of Bhav Chalit generates wealth by handling collective funds and trusts.' },
        { id: 110, category: 'Finance', q: 'Will my speculative stock investments fail due to bad timing today?', csl: '5th CSL', positive: [], negative: [5, 12], method: '5th CSL Star Lord triggering 5 and 12 on trading day warns of intraday trading capital wipeout.' },
        { id: 111, category: 'Legal', q: 'Who will win the upcoming political election or court case?', csl: '6th CSL', positive: [6, 10, 11], negative: [4, 5, 12], method: '6th CSL Star Lord signifying 6, 10, 11 guarantees victory for queried candidate. 4, 5, 12 gives win to opponent.' },
        { id: 112, category: 'Legal', q: 'Will my business rival file a copyright or trademark infringement lawsuit?', csl: '6th CSL', positive: [], negative: [6, 8, 12], method: '6th CSL Star Lord involving 6 (litigation), 8 (disputes), and 12 (losses) confirms lawsuit will be filed.' },
        { id: 113, category: 'Finance', q: 'Will I recover my stolen valuables or lost family gold?', csl: '2nd CSL', positive: [2, 6, 11], negative: [5, 8, 12], method: '2nd CSL Star Lord involving 2, 6, 11 ensures stolen family jewelry is recovered. 5, 8, 12 confirms loss.' },
        { id: 114, category: 'Property', q: 'Will there be a dispute or litigation over my family inheritance?', csl: '2nd/8th CSL', positive: [], negative: [6, 8], method: '2nd or 8th CSL linking to 6 and 8 indicates relatives will contest the ancestral will in court.' },
        { id: 115, category: 'General', q: 'Will I win a verbal argument or fight over the phone/internet today?', csl: '3rd CSL', positive: [3, 11], negative: [], method: '3rd CSL Star Lord involving 3 (communication) and 11 (victory) guarantees winning phone debate.' },
        { id: 116, category: 'Legal', q: 'Will the opposition political party win the upcoming local elections?', csl: '7th CSL', positive: [], negative: [4, 5], method: 'Horary 7th CSL activating 4 and 5 (opponent\'s 10th and 11th) confirms opposition party wins.' },
        { id: 117, category: 'Finance', q: 'Will my business partner freeze our joint bank accounts during a dispute?', csl: '2nd CSL', positive: [], negative: [8, 12], method: '2nd CSL signifying 8 and 12 indicates corporate banking accounts will be frozen during disputes.' },
        { id: 118, category: 'General', q: 'Will my siblings turn against me or file a lawsuit over property?', csl: '3rd CSL', positive: [], negative: [6], method: '3rd CSL (siblings) signifying 6th house indicates brother/sister will initiate legal partition of land.' },
        { id: 119, category: 'Finance', q: 'Will I successfully settle a pending bank loan or liability dispute?', csl: '6th CSL', positive: [2, 6, 11], negative: [5, 12], method: '6th CSL Star Lord involving 2, 6, 11 confirms bank will approve debt restructuring terms.' },
        { id: 120, category: 'Career', q: 'Will my defense lawyer successfully protect me from a defamation case?', csl: '10th CSL', positive: [5, 11], negative: [8, 12], method: '10th CSL Star Lord in 8, 12 without 5, 11 confirmation indicates failure to dismiss defamation charges.' },
        { id: 121, category: 'Health', q: 'Will I undergo a surgical procedure for my physical condition?', csl: '6th CSL', positive: [8], negative: [7], method: '6th CSL Star Lord in 8th confirms medical doctors will recommend immediate surgical intervention.' },
        { id: 122, category: 'Health', q: 'Will my chronic disease or sickness heal successfully?', csl: '6th CSL', positive: [1, 5, 11], negative: [6, 8, 12], method: '6th CSL Star Lord involving 1, 5, 11 confirms therapy will fully resolve condition without surgery.' },
        { id: 123, category: 'Health', q: 'Can a simple 1-6-10 career script cause a life-threatening illness like Cancer?', csl: '6th CSL', positive: [1, 6, 10], negative: [], method: '1-6-10 is purely corporate drive. Malignancy requires active Sun/nodes afflicted in 4th/8th/12th.' },
        { id: 124, category: 'Health', q: 'Am I at risk of chronic respiratory diseases or Lung Cancer?', csl: '6th CSL', positive: [], negative: [4, 8, 12], method: 'Venus in 4th house afflicted by Saturn/Rahu indicates chronic bronchial sensitivity and allergy risk.' },
        { id: 125, category: 'Health', q: 'Why does it take so long for me to recover from a simple cold or flu?', csl: '1st CSL', positive: [5], negative: [4], method: '1st CSL Star Lord in 4th negates 5th house immunity, prolonging recovery duration.' },
        { id: 126, category: 'Health', q: 'Which line of medicine will cure me? (Allopathy, Ayurveda, or Homeopathy)', csl: '5th CSL', positive: [5], negative: [], method: '5th CSL linked to Sun = Allopathy; Jupiter = Ayurveda; Rahu/Uranus = Homeopathy/Alternative.' },
        { id: 127, category: 'Health', q: 'Will my chronic work stress manifest as a physical illness?', csl: '8th Lord', positive: [], negative: [6], method: '8th Lord in 6th house of Bhav Chalit indicates workplace tension directly triggers physical ulcers/illness.' },
        { id: 128, category: 'Health', q: 'Will my mother\'s health recover after her major hospitalization?', csl: '4th CSL', positive: [4, 8, 2], negative: [], method: 'Rotate chart so 4th is 1st. Recovery houses (1, 5, 11 from 4th = 4, 8, 2) confirm rapid healing.' },
        { id: 129, category: 'Health', q: 'Will my father recover from his critical sickness or bypass surgery?', csl: '9th CSL', positive: [9, 1, 7], negative: [], method: 'Rotate chart so 9th is 1st. Recovery houses (1, 5, 11 from 9th = 9, 1, 7) confirm recovery.' },
        { id: 130, category: 'Health', q: 'Will I recover from chronic insomnia, anxiety, and sleep disorders?', csl: '1st/12th CSL', positive: [5, 11], negative: [8, 12], method: '1st/12th CSL connecting to 5 and 11 confirms meditation will resolve chronic insomnia.' },
        { id: 131, category: 'Travel/Visa', q: 'Will I get permanent settlement in a foreign country?', csl: '12th CSL', positive: [3, 9, 12], negative: [4, 8, 11], method: '12th CSL Star Lord involving 3, 9, 12 confirms permanent residency immigration file clearance.' },
        { id: 132, category: 'Travel/Visa', q: 'Will my Visa or Passport application get approved for international travel?', csl: '3rd CSL', positive: [3, 9, 11], negative: [8, 12], method: '3rd CSL Star Lord involving 3 (documents), 9 (travel), and 11 (approval) confirms visa grant.' },
        { id: 133, category: 'Career', q: 'Will I face an unexpected transfer in my job to another city?', csl: '3rd CSL', positive: [3, 10, 11], negative: [4], method: '3rd CSL involving 3 (movement) and 10 (employer) confirms mandatory transfer to an interstate branch.' },
        { id: 134, category: 'Children', q: 'Will my child get admission to a foreign university?', csl: '5th CSL', positive: [3, 5, 9, 11, 12], negative: [4], method: '5th CSL Star Lord involving 3, 5, 9, 12 confirms child\'s admission to overseas university.' },
        { id: 135, category: 'Travel/Visa', q: 'Will I travel abroad for spiritual purposes or an auspicious pilgrimage?', csl: '9th CSL', positive: [3, 5, 9, 11], negative: [2, 6], method: '9th CSL Star Lord involving 3, 5, 9, 11 confirms completing sacred overseas pilgrimage.' },
        { id: 136, category: 'Career', q: 'Will I get a traveling-oriented job with frequent international flights?', csl: '10th CSL', positive: [3, 9, 10, 11], negative: [], method: '10th CSL involving 3 (flights), 9 (international routes), 10, 11 confirms aviation/travel career.' },
        { id: 137, category: 'Property', q: 'Will I experience a sudden, unexpected change of my residence?', csl: '4th CSL', positive: [1, 3, 8, 12], negative: [4], method: '4th CSL signifying 1, 3, 8, 12 indicates landlord notice forcing immediate apartment relocation.' },
        { id: 138, category: 'Career', q: 'Should I start a career in export-import or international marketing?', csl: '10th CSL', positive: [3, 11, 12], negative: [], method: '10th CSL linking 3 (logistics), 11 (profits), and 12 (imports) confirms cross-border margins.' },
        { id: 139, category: 'Travel/Visa', q: 'Will my passport dispatch be delayed due to police verification issues?', csl: '3rd CSL', positive: [], negative: [3, 8, 12], method: '3rd CSL signifying 3, 8, 12 indicates administrative verification bottlenecks delaying passport.' },
        { id: 140, category: 'Travel/Visa', q: 'Will my spouse get their visa approved to join me in my foreign workplace?', csl: '7th/9th CSL', positive: [7, 9, 11, 12], negative: [], method: '7th CSL connecting to 9 (travel), 11 (approval), and 12 (abroad) confirms spouse visa issuance.' },
        { id: 141, category: 'Property', q: 'Will I finalize the purchase of this commercial property?', csl: '4th CSL', positive: [4, 11, 12], negative: [3, 8, 12], method: '4th CSL Star Lord involving 4 and 11 with 12 confirms successful purchase of commercial property.' },
        { id: 142, category: 'Property', q: 'Will I find a qualified buyer to purchase my agricultural land?', csl: '10th CSL', positive: [3, 5, 10], negative: [4], method: '10th CSL (buyer\'s property) involving 3, 5, 10 confirms signing land sale contract.' },
        { id: 143, category: 'Property', q: 'Will installing heavy plumbing fixtures stop recurring basement leaks?', csl: '4th CSL', positive: [], negative: [8, 12], method: '4th CSL afflicted by Moon-Saturn in 8, 12 indicates structural seepage needing waterproofing.' },
        { id: 144, category: 'Career', q: 'Will my construction firm win the highway infrastructure tender?', csl: '3rd CSL', positive: [3, 10, 11], negative: [], method: '3rd CSL signifying 3, 10, 11 confirms infrastructure tender will be awarded to querent\'s firm.' },
        { id: 145, category: 'Property', q: 'Will leasing my warehouse provide steady monthly cash flow?', csl: '6th CSL', positive: [2, 6, 11], negative: [], method: '6th CSL Star Lord signifying 2, 6, 11 confirms warehouse lease will provide steady rental cash flow.' },
        { id: 146, category: 'Career', q: 'Should I offer commercial Vastu audits to corporate offices?', csl: '10th CSL', positive: [4, 10], negative: [], method: '10th CSL involving 4 and 10 confirms offering corporate Vastu design audits will be lucrative.' },
        { id: 147, category: 'Property', q: 'Will converting my residential basement into an office succeed?', csl: '4th CSL', positive: [4, 10], negative: [], method: '4th CSL connected to career lords confirms basement workspace conversion aligns with chart.' },
        { id: 148, category: 'Career', q: 'Will opening a Montessori preschool yield steady tuition revenue?', csl: '10th CSL', positive: [4, 10], negative: [], method: '10th CSL involving 4 (school) and 10 (status) confirms preschool will generate tuition revenue.' },
        { id: 149, category: 'Property', q: 'Will municipal zoning issues halt my apartment complex project?', csl: '4th/6th CSL', positive: [], negative: [6, 8, 12], method: '4th and 6th CSLs linked to 8 and 12 confirm municipal stop-work zoning notice.' },
        { id: 150, category: 'Property', q: 'Will I purchase an electric vehicle this festival season?', csl: '4th CSL', positive: [4, 11, 12], negative: [3, 8], method: '4th CSL Star Lord involving 4, 11, 12 confirms purchasing new vehicle during festival cycle.' },
        { id: 151, category: 'Marriage', q: 'Will our formal arranged marriage engagement take place this year?', csl: '7th CSL', positive: [2, 7, 11], negative: [1, 6, 10, 12], method: 'Transiting Jupiter in a sign whose lord signifies 2, 7, 11 confirms formal marriage engagement.' },
        { id: 152, category: 'Marriage', q: 'Will my second marriage be emotionally harmonious and stable?', csl: '9th CSL', positive: [2, 9, 11], negative: [1, 8, 12], method: '9th CSL (second partner) Star Lord involving 2, 9, 11 confirms lasting harmony in second marriage.' },
        { id: 153, category: 'Marriage', q: 'Will I enter a third marriage late in life?', csl: '11th CSL', positive: [2, 11], negative: [], method: '11th CSL Star Lord involving 2, 11 confirms third marital union.' },
        { id: 154, category: 'Children', q: 'Will fertility treatments result in the birth of our second child?', csl: '7th CSL', positive: [2, 7, 11], negative: [], method: '7th CSL (second child) Star Lord involving 2, 7, 11 confirms successful conception.' },
        { id: 155, category: 'Children', q: 'Will our family be blessed with the birth of a third child?', csl: '9th CSL', positive: [2, 9, 11], negative: [], method: '9th CSL (third child) Star Lord involving 2, 9, 11 confirms birth of third child.' },
        { id: 156, category: 'Marriage', q: 'Will my parents consent to my inter-faith love marriage?', csl: '7th CSL', positive: [5, 7, 11], negative: [], method: '7th CSL involving 5, 11 with Rahu confirms parents will consent to unconventional marriage.' },
        { id: 157, category: 'Marriage', q: 'Will persistent marital arguments escalate into a legal divorce?', csl: '7th CSL', positive: [], negative: [6, 8, 12], method: '7th CSL in 6, 8 without 12 indicates severe arguments but no legal divorce.' },
        { id: 158, category: 'Career', q: 'Will establishing my dental clinic in my in-laws\' building succeed?', csl: '8th CSL', positive: [4, 8], negative: [], method: '8th CSL involving 4 and 8 confirms operating clinic from in-laws\' building brings success.' },
        { id: 159, category: 'General', q: 'How do I resolve ongoing ideological friction with my mother?', csl: '4th CSL', positive: [], negative: [6], method: '4th CSL in 6th indicates domestic friction. KAT: Maintain independent living boundaries.' },
        { id: 160, category: 'Career', q: 'Will my daughter\'s husband help expand our export business?', csl: '11th house', positive: [2, 7, 11], negative: [], method: 'Rotate chart to 11th (son-in-law). Favorable connections to 2, 11 confirm business expansion.' },
        { id: 161, category: 'Finance', q: 'Will my client clear the overdue commercial invoice this week?', csl: '6th CSL', positive: [2, 6, 11], negative: [5, 8, 12], method: '6th CSL Star Lord involving 2, 6, 11 with Moon transit confirms overdue invoice clearance.' },
        { id: 162, category: 'Finance', q: 'Can I build a sustainable algorithmic equity trading business?', csl: '5th CSL', positive: [2, 5, 6, 11], negative: [5, 12], method: '5th CSL signifying 2, 6, 11 with Mercury confirms profitable algorithmic trading business.' },
        { id: 163, category: 'Finance', q: 'Will the national insurance company settle my casualty claim?', csl: '8th CSL', positive: [2, 8, 11], negative: [1, 4, 10], method: '8th CSL Star Lord involving 2, 8, 11 confirms insurance company will disburse full claim.' },
        { id: 164, category: 'Finance', q: 'Will my marriage bring substantial ancestral dowry assets?', csl: '8th CSL', positive: [2, 8, 11], negative: [], method: '8th CSL signifying 2, 8, 11 confirms receipt of significant ancestral assets at marriage.' },
        { id: 165, category: 'Finance', q: 'Will purchasing a distressed hotel at an auction yield profits?', csl: '8th CSL', positive: [2, 11], negative: [5, 8, 12], method: '8th CSL Star Lord in 8th confirmed by 2, 11 Sub-Lord ensures distressed hotel yields gains.' },
        { id: 166, category: 'Property', q: 'Will leasing my commercial retail space secure long-term tenants?', csl: '6th CSL', positive: [2, 6, 11], negative: [], method: '6th CSL Star Lord signifying 2, 6, 11 confirms retail space will secure corporate tenants.' },
        { id: 167, category: 'Finance', q: 'Why does my cash flow fluctuate wildly despite top billing rates?', csl: '2nd CSL', positive: [], negative: [8], method: '2nd CSL linked to 8th house creates high billing rates alongside extreme liquidity volatility.' },
        { id: 168, category: 'Career', q: 'Will expanding my direct sales distribution network succeed?', csl: '10th CSL', positive: [3, 11, 2, 10], negative: [], method: '10th CSL signifying 3 (distribution) and 11 (gains) confirms direct sales growth.' },
        { id: 169, category: 'Property', q: 'Will the court probate my grandfather\'s ancestral property will?', csl: '8th CSL', positive: [2, 8, 11], negative: [6], method: '8th CSL Star Lord involving 2, 8, 11 confirms probate court will validate grandfather\'s will.' },
        { id: 170, category: 'KAT-Remedy', q: 'How do I stop sudden liquid cash drains during 12th house dashas?', csl: '2nd/12th CSL', positive: [], negative: [12], method: 'KAT: Lock liquid funds into multi-year bank Fixed Deposits to satisfy the "cash lock" requirement.' },
        { id: 171, category: 'General', q: 'Is this astrological chart of a living person or deceased native?', csl: '1st CSL', positive: [1, 5, 9, 11], negative: [2, 7], method: '1st CSL signifying 1, 5, 9, 11 confirms living native. Exclusive Maraka/Badhaka indicates deceased.' },
        { id: 172, category: 'General', q: 'At what exact time will the neighborhood power outage be restored?', csl: 'Lagna Sub-Lord', positive: [2, 6, 11], negative: [8, 12], method: 'Cast momentary chart. Power restores when transiting Lagna crosses Sub-Lord of 2, 6, 11.' },
        { id: 173, category: 'General', q: 'When will my traveling spouse return home from the airport today?', csl: 'Transiting Lagna', positive: [], negative: [], method: 'Transiting Lagna crossing Movable signs indicates arrival within hours. Dual signs split by 15°.' },
        { id: 174, category: 'Finance', q: 'Should I execute a large long position in this technology stock?', csl: '11th CSL', positive: [5], negative: [4], method: '11th CSL involving 5th confirms large tech stock gain. Involving 4th warns of crash; do not buy.' },
        { id: 175, category: 'Career', q: 'Is today an auspicious day to launch my astrology masterclass?', csl: 'Moon Star Lord', positive: [5, 9, 11], negative: [4, 8], method: 'Moon transiting Star Lord signifying natal 5, 9, 11 confirms masterclass launch will succeed.' },
        { id: 176, category: 'Marriage', q: 'Should I meet my estranged partner to discuss reconciliation today?', csl: 'Moon Star Lord', positive: [5, 7, 11], negative: [6, 10, 12], method: 'Moon transiting Star Lord signifying natal 5, 7, 11 ensures emotional reconciliation succeeds.' },
        { id: 177, category: 'Property', q: 'How do I time a critical real estate signing within a 2-hour window?', csl: 'Transiting Lagna', positive: [4, 11], negative: [3, 8], method: 'Time signing when transiting Lagna degree crosses exact Sub-Lord of natal 4th and 11th houses.' },
        { id: 178, category: 'BTR', q: 'How do I rectify my birth time using the 1-9 connectivity method?', csl: '1st & 9th Cusps', positive: [], negative: [], method: 'Authentic chart requires 1st Cusp Star Lord connecting to 9th Sub, or 1st Sub to 9th Star Lord.' },
        { id: 179, category: 'General', q: 'Which life department will dominate my upcoming 6-year Sun dasha?', csl: 'Sun Star Lord', positive: [], negative: [], method: 'Physical house occupied by Sun\'s Nakshatra Lord becomes the central life theme of the Dasha.' },
        { id: 180, category: 'Legal', q: 'Will our business competitor accept our out-of-court settlement?', csl: '6th CSL', positive: [5, 11], negative: [6, 8, 12], method: '6th CSL Sub-Lord connecting to 5 (negation of fight) and 11 confirms competitor will settle.' },
        { id: 181, category: 'KAT-Remedy', q: 'How do I channel Guru Chandal Yoga to gain institutional fame?', csl: 'Jupiter+Rahu', positive: [], negative: [], method: 'KAT: Deliver consulting to foreign clients while maintaining strict personal boundaries locally.' },
        { id: 182, category: 'Career', q: 'Can my son and I run an educational media network together?', csl: 'Sun+Rahu', positive: [3, 10, 11], negative: [], method: 'Sun (son) conjunct Rahu (digital video) confirms establishing a lucrative media network.' },
        { id: 183, category: 'KAT-Remedy', q: 'How do I overcome business expansion fear from Saturn-Rahu?', csl: 'Saturn+Rahu', positive: [], negative: [], method: 'KAT: Continuously modernize operational infrastructure. Stagnant business models trigger anxiety.' },
        { id: 184, category: 'Donation', q: 'What donation resolves academic blocks during an afflicted Jupiter period?', csl: 'Jupiter', positive: [], negative: [], method: 'Donate yellow split chana dal to temple priests on Thursday afternoons to clear exam blocks.' },
        { id: 185, category: 'Donation', q: 'What donation resolves chronic knee stiffness during Saturn dashas?', csl: 'Saturn', positive: [], negative: [], method: 'Donate black urad dal and mustard oil to indigent laborers on Saturday mornings to relieve pain.' },
        { id: 186, category: 'Donation', q: 'What donation resolves stammering or speech anxiety from Mercury?', csl: 'Mercury', positive: [], negative: [], method: 'Donate whole green moong dal to birds on Wednesday mornings to clear speech anxiety.' },
        { id: 187, category: 'Donation', q: 'What donation neutralizes mysterious skin eruptions caused by Ketu?', csl: 'Ketu', positive: [], negative: [], method: 'Donate ripe yellow bananas to street animals or temple ashrams on Tuesday mornings.' },
        { id: 188, category: 'Donation', q: 'What donation heals chronic marital coldness during Venus periods?', csl: 'Venus', positive: [], negative: [], method: 'Donate fresh white yogurt (curd) and sugar candy to women\'s shelters on Friday mornings.' },
        { id: 189, category: 'KAT-Remedy', q: 'How do I prevent sudden career shocks from an active 8th cusp?', csl: '10th CSL', positive: [], negative: [8], method: 'KAT: Keep classical astrology texts on office desk and read daily passages to consume 8th house.' },
        { id: 190, category: 'KAT-Remedy', q: 'How do I neutralize sudden business capital loss from a 12th cusp?', csl: '2nd CSL', positive: [], negative: [12], method: 'KAT: Perform completely anonymous charitable donations (Gupt Daan) without telling anyone.' },
        { id: 191, category: 'Health', q: 'Why do I experience extreme anxiety over minor routine symptoms?', csl: '1st CSL', positive: [], negative: [12], method: '1st CSL signifying 12th house creates subconscious medical phobia. KAT: Volunteer at clinics.' },
        { id: 192, category: 'General', q: 'Why do I feel compelled to hoard liquid savings without spending?', csl: '1st CSL', positive: [11], negative: [], method: '1st CSL signifying 11th (negates 12th house of spending) induces wealth-hoarding habit.' },
        { id: 193, category: 'General', q: 'Why do I spend excessive amounts on designer luxury items?', csl: '3rd Lord', positive: [], negative: [12], method: '3rd Lord in 12th house of Bhav Chalit creates an involuntary urge to buy premium designer brands.' },
        { id: 194, category: 'KAT-Remedy', q: 'How do I stabilize my corporate career against sudden dismissals?', csl: '6th CSL', positive: [], negative: [5], method: 'KAT: Place framed photographs of smiling young children on work desk to consume 5th house.' },
        { id: 195, category: 'General', q: 'Why do I have a habit of speeding while driving on highways?', csl: '4th CSL', positive: [], negative: [], method: '4th CSL as Moon transfers rapid lunar transit speed to conveyances, prompting highway speeding.' },
        { id: 196, category: 'General', q: 'How do I protect confidential corporate mergers from being leaked?', csl: '12th CSL', positive: [], negative: [7], method: '12th CSL in 7th leaks mergers. KAT: Draft contracts alone; avoid third-party disclosures.' },
        { id: 197, category: 'General', q: 'Why do I learn advanced metaphysics best when studying in solitude?', csl: '9th CSL', positive: [6], negative: [], method: '9th CSL involving 6th confirms metaphysical wisdom is absorbed only through solitary study.' },
        { id: 198, category: 'KAT-Remedy', q: 'How do I overcome compulsive binge-eating habits during stress?', csl: '1st CSL', positive: [], negative: [8], method: 'KAT: Redirect compulsive 8th house energy into intense data analytics or coding tasks.' },
        { id: 199, category: 'Property', q: 'How do I purify heavy or disturbed vibrations in a newly bought home?', csl: '4th CSL', positive: [], negative: [8, 12], method: '4th CSL as Rahu in 8, 12 indicates heavy vibrations. KAT: Perform Vedic recitations.' },
        { id: 200, category: 'General', q: 'How do I determine my Soul\'s ultimate life calling in this birth?', csl: 'Sun in Chalit', positive: [], negative: [], method: 'Locate physical house of Sun in Bhav Chalit. Aligning with this house brings fulfillment.' },

        // Unique entries from the first library (not present in the base)
        { id: 201, category: 'Career', q: 'Should I do a job or business?', csl: '6th vs 7th CSL', positive: [2, 6, 11], negative: [8, 12], method: 'Compare 6th CSL (job) and 7th CSL (business); the one with fewer 8/12 and more 2-6-11 is the right path.' },
        { id: 202, category: 'Career', q: 'Will I be a highly accurate predictor (Astrologer)?', csl: '10th Lord', positive: [], negative: [], method: 'If 10th Lord sits in the Nakshatra of the 8th Lord, astrology becomes a chosen full-time profession.' },
        { id: 203, category: 'Health', q: 'Does a strong 1-6-10 career script indicate cardiovascular disease?', csl: '6th CSL', positive: [], negative: [], method: 'No — 1-6-10 is purely professional drive; cardiac pathology needs active Sun afflicted in 4th/8th.' },
        { id: 204, category: 'Travel/Visa', q: 'Will the embassy clear my international student visa application?', csl: '3rd CSL', positive: [3, 9, 11], negative: [], method: 'Same as above, education-specific.' },
        { id: 205, category: 'Twins', q: 'Will I have Twins?', csl: '5th CSL + Star Lord', positive: [], negative: [], method: 'Both 5th CSL and its Star Lord must be Mercury OR placed in Dual Signs (Gemini, Virgo, Sagittarius, Pisces).' },
        { id: 206, category: 'KAT-Remedy', q: 'How do I neutralize sudden career shocks from an active 8th cusp?', csl: '10th CSL', positive: [], negative: [8], method: 'KAT: keep classical astrology texts on the office desk and read daily passages to consume 8th-house energy safely.' },
        { id: 207, category: 'Astrology Career', q: 'Will I be chosen by destiny to practice astrology as a full-time career?', csl: '10th Lord', positive: [], negative: [], method: '10th Lord in the Nakshatra of the 8th Lord establishes astrology/occult as a primary life calling; if the Atmakaraka is there too, supreme fame in the field follows.' },
        { id: 208, category: 'Timing', q: 'At what exact time will the neighbourhood power outage be restored (or any micro-event)?', csl: 'Transiting Lagna', positive: [2, 6, 11], negative: [], method: 'Cast a momentary chart; the event triggers when the transiting Lagna crosses the Sub-Lord signifying the relevant houses.' },
        { id: 209, category: 'Donation', q: 'What item should I donate to pacify an unfavourable Jupiter?', csl: 'Jupiter', positive: [], negative: [], method: 'Donate yellow chana dal (split peas) to poor priests/temples during daylight hours.' }
    ],

    searchHorary: function (query) {
        if (!query) return this.HORARY_LIBRARY;
        const q = String(query).toLowerCase();
        return this.HORARY_LIBRARY.filter(e =>
            e.q.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.csl.toLowerCase().includes(q) || String(e.id) === q);
    },

    // ================================================================
    // 6. DYNAMIC HORARY EVALUATOR ENGINE
    // ================================================================

    /**
     * Programmatically evaluates any query from the 200-question library
     * against chart coordinates (natal or horary prashna).
     */
    evaluateHoraryQuery: function (queryIdOrText, ascSid, planetsMap) {
        const P1 = this._p1(); if (!P1 || !planetsMap) return null;
        let entry = null;
        if (typeof queryIdOrText === 'number') entry = this.HORARY_LIBRARY.find(e => e.id === queryIdOrText);
        else {
            const matches = this.searchHorary(queryIdOrText);
            if (matches && matches.length) entry = matches[0];
        }
        if (!entry) return null;

        // Parse target house number from CSL descriptor
        let targetHouse = 1;
        const m = entry.csl.match(/(\d+)/);
        if (m) targetHouse = parseInt(m[1], 10);
        else if (entry.csl.toLowerCase().includes('job')) targetHouse = 6;
        else if (entry.csl.toLowerCase().includes('marriage') || entry.csl.toLowerCase().includes('partner')) targetHouse = 7;
        else if (entry.csl.toLowerCase().includes('10th lord')) targetHouse = 10;

        const allCusps = P1.getAllCusps(ascSid);
        const resolved = P1.resolveDeterminingPlanetPrecise(targetHouse, allCusps, planetsMap);
        if (!resolved) return null;

        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const detPlanet = resolved.determiningPlanet;
        const detNumbers = planetNumbers[detPlanet] || [];

        // Check Untenanted Status
        const tenancy = P1.getTenancy ? P1.getTenancy(planetsMap) : {};
        const isUntenanted = tenancy[detPlanet] && !tenancy[detPlanet].tenanted;

        // Apply 3-Rule Retrograde Filter
        const retroFilter = this.analyzeRetrogradeFilter(detPlanet, ascSid, planetsMap, null);

        // Calculate positive & negative matches
        const posHits = (entry.positive || []).filter(h => detNumbers.includes(h));
        const negHits = (entry.negative || []).filter(h => detNumbers.includes(h));

        let verdict = 'NO / DENIED';
        let explanation = '';

        if (retroFilter && retroFilter.verdict === 'DISQUALIFIED') {
            verdict = 'DENIED (STAR RETROGRADE)';
            explanation = `${detPlanet}'s Star Lord (${retroFilter.starLord}) is RETROGRADE — query is denied outright.`;
        } else if (retroFilter && retroFilter.verdict === 'DELAYED') {
            verdict = 'DELAYED';
            explanation = `${detPlanet} is self-retrograde (in direct star/sub) — event is delayed until ${detPlanet} turns direct.`;
        } else if (isUntenanted && posHits.length > 0) {
            verdict = 'YES / PROMISED (STRONG)';
            explanation = `${detPlanet} is UNTENANTED (direct claimant) and strongly signifies positive house(s) H${posHits.join(',H')}.`;
        } else if (posHits.length > 0 && negHits.length === 0) {
            verdict = 'YES / PROMISED';
            explanation = `Determining planet ${detPlanet} satisfies positive requirement H${posHits.join(',H')} with zero negative hits.`;
        } else if (posHits.length > 0 && negHits.length > 0) {
            verdict = 'CONTESTED / MIXED';
            explanation = `Positive houses H${posHits.join(',H')} matched, but negative house(s) H${negHits.join(',H')} also activated.`;
        } else {
            verdict = 'NO / DENIED';
            explanation = `Determining planet ${detPlanet} (numbers: H${detNumbers.join(',H') || '—'}) failed to touch required positive houses.`;
        }

        return {
            entry: entry, targetHouse: targetHouse, cslPlanet: resolved.csl,
            determiningPlanet: detPlanet, isUntenanted: isUntenanted,
            detNumbers: detNumbers, posHits: posHits, negHits: negHits,
            retroFilter: retroFilter, verdict: verdict, explanation: explanation
        };
    },

    renderHoraryResults: function (results) {
        if (!results || !results.length) return '<div class="pred-item">No matching horary reference found in the curated library.</div>';
        const rows = results.map(e => `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid #7FDBAA;background:rgba(127,219,170,.08);">
            <b>[${e.category}]</b> ${e.q}<br/>
            <span style="font-size:8.5px;color:var(--muted);">${e.csl}${e.positive.length ? ' · Positive: H' + e.positive.join(',H') : ''}${e.negative.length ? ' · Negative: H' + e.negative.join(',H') : ''}</span>
            <div style="font-size:9px;margin-top:2px;">${e.method}</div>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #7FDBAA;"><div class="pred-title" style="color:#7FDBAA;">📚 Curated Horary Reference Library</div>${rows}</div>`;
    },
    // ================================================================
    // 5½. HORARY Q&A LIBRARY — FULL METHOD / EFFECT / RESULT / REMEDY
    // ================================================================
    //
    // A second, narrative-style horary library — distinct from
    // HORARY_LIBRARY above (which is simple house-tuple lookups). These
    // entries are the source lecture's fully-worked ADVISORY questions,
    // each carrying all four dimensions the source itself uses:
    //   method  — how to read the chart for this question
    //   effect  — what planetary/house indicator drives the outcome
    //   result  — the actual predicted outcome/answer given to the client
    //   remedy  — the behavioural/karma-alignment remedy that follows
    // Curated from "5th House Untold Secrets" and the KP/KAT Master
    // Secrets set (Timing, 8th-House Suffering, Career, Astrology-as-
    // Profession, Medical Astrology, Trine Analysis, Myth-Busters, Master
    // Workflow sections).

    HORARY_QA_LIBRARY: [
        {
            id: 1, category: 'Timing', q: 'When will I get married?',
            method: 'Check the running Dasha for the 2, 7, 11 combination.',
            effect: 'Confirm with the Parashari Transit Secret: is the current Antardasha Lord sitting in the 7th house, or aspecting the 7th lord, in TODAY\'S transit sky?',
            result: 'If the Dasha shows 2-7-11 AND the transit connection is confirmed, stamp the prediction: "Marriage will happen in this period." A strong natal marriage Yoga with no Dasha connection in the active lifespan simply stays undelivered — a Dasha only sets a "trend," the Antardasha "locks" it, and the Pratyantardasha "delivers" it.',
            remedy: 'If the transit connection is not yet showing, re-check at the start of each new Antardasha/Pratyantardasha rather than assuming denial.'
        },
        {
            id: 2, category: 'Timing', q: 'When will my spouse/family member return home (micro-timing)?',
            method: 'Cast a momentary chart at the exact time of asking and note the current Ruling Planets (Lagna Lord, Lagna Nakshatra Lord, Moon Sign Lord, Moon Nakshatra Lord, Day Lord).',
            effect: 'Track the currently rising Lagna as it changes minute to minute — the person arrives exactly when the Lagna Lord, Lagna Star Lord, and Lagna Sub-Lord all match the Ruling Planets noted above.',
            result: 'Example: if the current Lagna is Gemini but Mercury (its lord) is missing from the Ruling Planets, predict "she will not return in the next 2 hours" — wait for a Lagna whose lord IS among the RPs.',
            remedy: 'No remedy needed — this is a pure timing technique; simply keep re-checking the rising Lagna until it matches an RP planet.'
        },
        {
            id: 3, category: 'Business/8th House', q: 'Why am I facing so much stress in my business or marriage?',
            method: 'Check whether the running Dasha Lord sits IN the 7th house (partner/business-partner) with its own Nakshatra Lord sitting in the 8th house.',
            effect: 'The 8th house (pain/hidden trouble) activating through a planet placed in the 7th channels the suffering specifically through the partnership.',
            result: 'Predict: "Your marital partner or business partner is the root source of your current suffering" — not an external/unrelated cause.',
            remedy: 'Address the partnership directly rather than looking elsewhere for the cause; separately, apply the general 8th-house KAT remedy (channel the energy into audit/research-type constructive work) so the 8th house has a productive outlet.'
        },
        {
            id: 4, category: 'Business/8th House', q: 'Will I get funding for my startup?',
            method: 'Check whether the Dasha/Antardasha planet\'s Nakshatra Lord connects to the 8th house.',
            effect: 'The 8th house rules "other people\'s money" — angel investors, crowdfunding, VC capital — as distinct from the 2nd house (your own money).',
            result: 'If the AD Nakshatra Lord connects to the 8th, predict: "Yes, you will easily get funding from external investors."',
            remedy: 'Actively pursue angel investors/crowdfunding rather than self-funding when the 8th house is this active — trying to bootstrap with only your own (2nd house) money fights the chart instead of aligning with it.'
        },
        {
            id: 5, category: 'Career', q: 'Should I do a job or start a business?',
            method: 'Compare the 6th CSL (job) against the 7th CSL (business) for which one more strongly signifies the money houses 2, 6, 11.',
            effect: 'The house whose CSL carries fewer negative numbers (8, 12) and more of 2-6-11 is the naturally supported path.',
            result: 'If 6th CSL is stronger → a Job suits better. If 7th CSL is stronger → independent Business suits better.',
            remedy: 'Align the career choice with the stronger CSL rather than following personal preference against the chart\'s natural support.'
        },
        {
            id: 6, category: 'Wealth', q: 'Why do I feel broke despite earning well?',
            method: 'Check the placement of the 2nd CSL (wealth/bank balance).',
            effect: '2nd CSL placed in the 12th house indicates the native is subconsciously HOARDING cash out of fear ("it\'ll get spent") rather than genuinely lacking money.',
            result: 'Predict: "You are hoarding money. Because you refuse to spend or donate, the universe will create a sudden loss (a hospital bill, an accident) to force the drain instead."',
            remedy: 'Apply the 12th-house rule: "Daan, Bhog, ya Nash" (Donate, Enjoy, or it will be Destroyed) — voluntarily spend or donate so the 12th house\'s "spend requirement" is met constructively rather than destructively.'
        },
        {
            id: 7, category: 'KAT/Family', q: 'Why do my relatives seem to hate me or turn jealous?',
            method: 'Check for a Sun+Rahu natal conjunction.',
            effect: 'Being too straightforward/transparent about personal happiness, success, or wealth with family, under this combination, directly breeds envy and conflict.',
            result: 'Predict: "You are too straightforward with your happiness and wealth. Keep your success a secret from your family, and the jealousy/fights will stop."',
            remedy: 'Be completely diplomatic with family — do not share financial success directly. To motivate a child, praise them in front of the mother rather than telling them directly (Rahu = indirect channel).'
        },
        {
            id: 8, category: 'KAT/Destiny', q: 'Will I become famous?',
            method: 'Check for Jupiter, Sun, and Rahu together across the trines (conjunction or mutual trine placement).',
            effect: 'This combination is recorded as typically activating THROUGH a major family crisis rather than through ordinary steady effort.',
            result: 'Predict: "When a massive crisis hits your family, a divine blessing will save you, and you will emerge highly famous from that very event."',
            remedy: 'No corrective remedy — stay ethically grounded (Jupiter) through the crisis so the outcome resolves as a genuine "blessing" rather than a purely destructive event.'
        },
        {
            id: 9, category: 'Astrology Career', q: 'Will I be a highly accurate astrologer/predictor?',
            method: 'Check the 2nd CSL (speech/tongue) for involvement of the 5th and 9th houses.',
            effect: 'The 5th house counted here is the 11th-from-the-7th (fulfilment of the CLIENT\'s desires); the 9th is wisdom. Speech (2nd) fulfilling those houses is a specific "blessed tongue" signature.',
            result: 'Predict: "Your predictions will be stunningly accurate because your speech fulfils the desires of your clients."',
            remedy: 'If the 2nd CSL lacks 5/9 involvement, lean on written/structured methodology rather than relying purely on spontaneous verbal readings.'
        },
        {
            id: 10, category: 'Astrology Career', q: 'As an astrologer, should I give remedies or just counsel/guide?',
            method: 'Compare which house is more strongly and repeatedly signified across the chart: the 5th or the 9th.',
            effect: '5th-house strength makes one a natural "Solution Giver" (remedies genuinely work through them); 9th-house strength makes one a natural "Guide/Counsellor" (life advice lands powerfully, but ritual/tantric remedies may underperform).',
            result: 'Match the practice style to the dominant house rather than forcing the other.',
            remedy: '5th-dominant → build a remedies/solutions-focused practice. 9th-dominant → build a counselling/advisory-focused practice and be cautious about promising tantric-style remedies.'
        },
        {
            id: 11, category: 'Medical', q: 'Why was I suddenly hospitalized?',
            method: 'Identify the current Dasha Lord (the Source/माध्यम) and the house occupied by ITS Nakshatra Lord (the Activation).',
            effect: 'The activated house tells you WHAT happened (e.g. 12th = hospitalization, 6th = disease); the Dasha Lord\'s own natural biological signification tells you WHY — e.g. Sun = calcium/bones/acidity, Venus = sugar/kidneys/hormones, Jupiter = liver/fat/cholesterol.',
            result: 'Predict: "Your hospitalization was triggered by a malfunction in [Dasha Lord]\'s biological element" — naming the specific bodily system.',
            remedy: 'Proactively address that specific biological/dietary factor (e.g. calcium intake and acidity management for the Sun) BEFORE the next similar Dasha/Antardasha arrives, as a physical remedy that bypasses the activation.'
        },
        {
            id: 12, category: 'KAT/Trine', q: 'Why is my business suddenly failing?',
            method: 'Check for a Mercury+Ketu natal conjunction and identify which of the four trines (Dharma 1-5-9 / Artha 2-6-10 / Kama 3-7-11 / Moksha 4-8-12) it occupies.',
            effect: 'If Mercury+Ketu sits in the Kama trine (3, 7, 11 — desires/gains), the combination is meant to fulfil material desire specifically through intellectual/occult engagement, not through the current conventional business model alone.',
            result: 'Predict: "Start learning Astrology or Occult sciences. Because it sits in your Desire/Gain trine, the moment you align your brain (Mercury) with the occult (Ketu), your stalled business profits will start flowing again."',
            remedy: 'Incorporate astrology/occult study, or occult-adjacent consulting, into the existing business rather than avoiding it — the same combination in the Moksha trine (4-8-12) would instead call for pure non-commercial study, so always confirm the trine before prescribing this.'
        },
        {
            id: 13, category: 'Astrology Career', q: 'What is my ultimate destiny in Astrology (Navamsa check)?',
            method: 'Check the Navamsa (D9) chart specifically for Mercury\'s house placement.',
            effect: 'Mercury placed in the 10th house of the D9 indicates a CAREER-LEVEL (not merely hobby-level) astrological calling.',
            result: 'Predict: "You are biologically and karmically wired to be an extraordinarily brilliant astrologer — your analytical mind will dominate your career."',
            remedy: 'Pursue formal astrology training/certification to fully activate this D9-level promise rather than leaving it as an untrained natural talent.'
        },
        {
            id: 14, category: 'Myth-Buster', q: 'Do I have the power to potentize (सिद्ध) mantras?',
            method: 'Check whether the 1st Lord is placed in the 8th house, or is conjunct the 8th Lord.',
            effect: 'This specific placement is recorded as giving a rare, unusual capacity to charge/activate mantras with disproportionate power.',
            result: 'Predict: "Any mantra you chant will activate with frightening power" — a genuine but intense gift.',
            remedy: 'The same 8th-house intensity that empowers mantras can also disturb the native\'s own sleep/peace — the traditional grounding countermeasure recorded is chanting a specific calming mantra (e.g. "Ya Devi Sarvabhuteshu Nidra-rupena Samsthita") as an energetic anchor.'
        },
        {
            id: 15, category: 'Myth-Buster', q: 'Is a Venus-Mars conjunction really as dangerous (lust/scandal) as classically feared?',
            method: 'Check the Venus+Mars conjunction\'s aspects specifically — and for the "Urdhva Reta" exception, check whether Venus is in Mars\' sign aspected by Saturn, OR Venus is in Saturn\'s sign aspected by Mars (especially in the Navamsa).',
            effect: 'Venus (master of scriptures) + Mars (sharp logic) more commonly produces a razor-sharp, highly discriminative ability to decode ancient texts and find hidden logic in a single sentence ("Sarva Shastra Pravaktaram") — NOT automatic scandal. If the Saturn-aspect exception applies, the combination transmutes entirely into spiritual pursuit instead (the "Urdhva Reta" celibate-monk pattern).',
            result: 'Read this conjunction by its FULL context (aspects, trine placement) rather than by its popular reputation alone — the same raw combination can mean scriptural brilliance, romantic impulsiveness, or complete celibacy depending on what else touches it.',
            remedy: 'No remedy needed for the base combination — this is a myth-correction, not a defect requiring correction. Only the specific Saturn/Mars cross-aspect pattern (Urdhva Reta) genuinely redirects the energy toward celibacy/spirituality.'
        },
        {
            id: 16, category: 'Myth-Buster', q: 'How do I motivate a Leo Ascendant specifically?',
            method: 'Behavioural technique, not a chart calculation — applies whenever the native (or client) is a Leo Ascendant.',
            effect: 'Leo Ascendants respond powerfully to a direct ego-challenge rather than to encouragement.',
            result: 'Telling them "You are incapable of doing this" reliably locks their internal drive, and they will move mountains specifically to disprove the statement.',
            remedy: 'Use this ONLY as a deliberate motivational technique with someone whose success you actually want — never as genuine discouragement, since it is a documented behavioural lever specific to this Ascendant, not a neutral observation.'
        },
        {
            id: 17, category: 'Master Workflow', q: 'What is the correct end-to-end sequence for reading ANY chart/question?',
            method: '4-step sequence: (1) Verify the birth time — ask the client self-check questions tied to 1st/2nd CSL placements (e.g. "do you rush to the doctor over small issues?" for 1st CSL=12th). (2) Check the Promise — does the relevant CSL\'s Nakshatra Lord signify the required numbers for this specific question? (3) Time the Event — do the current Mahadasha/Antardasha/Pratyantardasha connect to the relevant house in TODAY\'S transit chart? (4) Align the Karma — read any relevant planetary conjunction across its trine and give the matching behavioural remedy.',
            effect: 'Following all 4 steps in order turns a vague prediction ("you will get a job") into a precise, falsifiable one ("you will get a job in a hospital/MNC through a female friend, because your 6th CSL is Venus sitting in the Nakshatra of the 12th Lord").',
            result: 'The astrologer functions as a precision Astrometric Counsellor (9th house) and Solution Provider (5th house) rather than a generic fortune-teller — the client leaves with exact timing, a specific behavioural remedy, and a clear karmic explanation.',
            remedy: 'The Golden Rule of Prediction: "Planets do not lie; people do." If a client denies a prediction but the CSL mathematically confirms it, trust the CSL — the universe operates on these exact numeric and karmic alignments, not on the client\'s self-report.'
        }
    ],

    /** Free-text/category search across the narrative Method/Effect/Result/Remedy horary Q&A library. */
    searchHoraryQA: function (query) {
        if (!query) return this.HORARY_QA_LIBRARY;
        const q = String(query).toLowerCase();
        return this.HORARY_QA_LIBRARY.filter(e =>
            e.q.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
            || e.method.toLowerCase().includes(q) || e.effect.toLowerCase().includes(q)
            || e.result.toLowerCase().includes(q) || e.remedy.toLowerCase().includes(q));
    },
renderHoraryQAResults: function (results) {
        if (!results || !results.length) return '<div class="pred-item">No matching entry found in the Horary Q&A (Method/Effect/Result/Remedy) library.</div>';
        const rows = results.map(e => `<div style="margin:6px 0;padding:8px;border-left:3px solid #FFA07A;background:rgba(255,160,122,.06);">
            <b style="color:#FFA07A;">[${e.category}]</b> <b>${e.q}</b>
            <div style="font-size:8.5px;color:var(--muted);margin-top:4px;"><b>Method:</b> ${e.method}</div>
            <div style="font-size:9px;color:#66CCFF;margin-top:3px;"><b>Effect:</b> ${e.effect}</div>
            <div style="font-size:9px;color:var(--text);opacity:.9;margin-top:3px;"><b>Result:</b> ${e.result}</div>
            <div style="font-size:9px;color:#00DD77;margin-top:3px;"><b>Remedy:</b> ${e.remedy}</div>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #FFA07A;"><div class="pred-title" style="color:#FFA07A;">🗂️ Horary Q&A — Method / Effect / Result / Remedy</div>${rows}</div>`;
    },
    renderHoraryEvaluatorUI: function () {
        const options = this.HORARY_LIBRARY.map(e => `<option value="${e.id}">[#${e.id} ${e.category}] ${e.q.substring(0, 60)}...</option>`).join('');
        return `<details open style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#7FDBAA;font-size:10.5px;font-weight:bold;">🔮 Master Horary Evaluator (200 Questions Engine)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Select any query from the 200-question Master Bank or type a keyword to evaluate against active chart coordinates:</div>
                  <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <select id="kpMasterHorarySelect" style="max-width:320px;background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">${options}</select>
                    <input id="kpMasterHorarySearch" type="text" placeholder="Or search keyword..." style="width:130px;background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">
                    <button onclick="window.KP_PREDICTION_3.runMasterHoraryEvaluator()" style="background:#7FDBAA;color:#000;border:none;padding:4px 10px;border-radius:3px;font-size:10px;font-weight:bold;cursor:pointer;">Evaluate</button>
                  </div>
                  <div id="kpMasterHoraryEvalResult" style="margin-top:8px;"></div>
                </details>`;
    },

    runMasterHoraryEvaluator: function () {
        const selEl = document.getElementById('kpMasterHorarySelect');
        const searchEl = document.getElementById('kpMasterHorarySearch');
        const resultEl = document.getElementById('kpMasterHoraryEvalResult');
        if (!resultEl || !this._cachedAnalysisParams) return;

        const p = this._cachedAnalysisParams;
        const qId = (searchEl && searchEl.value.trim().length > 0) ? searchEl.value.trim() : parseInt(selEl.value, 10);
        const evalRes = this.evaluateHoraryQuery(qId, p.ascSid, p.natalPlanets);

        if (!evalRes) {
            resultEl.innerHTML = '<div style="font-size:9px;color:#FF4477;">Query not found or could not be evaluated.</div>';
            return;
        }

        const vColor = evalRes.verdict.startsWith('YES') ? '#00DD77' : evalRes.verdict.startsWith('DELAYED') ? '#FFD700' : '#FF4477';
        resultEl.innerHTML = `<div style="padding:8px;border-left:3px solid ${vColor};background:rgba(255,255,255,0.03);border-radius:4px;">
            <b style="color:${vColor};font-size:11px;">VERDICT: ${evalRes.verdict}</b>
            <div style="font-size:9.5px;color:var(--text);font-weight:bold;margin-top:3px;">[#${evalRes.entry.id} - ${evalRes.entry.category}] ${evalRes.entry.q}</div>
            <div style="font-size:9px;color:var(--muted);margin-top:2px;">Target: ${evalRes.entry.csl} → CSL: ${evalRes.cslPlanet} → Determining Planet: <b>${evalRes.determiningPlanet}</b> ${evalRes.isUntenanted ? '<span style="color:#00DD77;">(UNTENANTED)</span>' : ''}</div>
            <div style="font-size:9px;color:var(--text);margin-top:2px;">Numbers: H${evalRes.detNumbers.join(',H') || '—'} · Matched Positive: H${evalRes.posHits.join(',H') || 'none'} · Matched Negative: H${evalRes.negHits.join(',H') || 'none'}</div>
            <div style="font-size:9px;color:${vColor};margin-top:4px;"><b>Analysis:</b> ${evalRes.explanation}</div>
            <div style="font-size:8.5px;color:var(--muted);margin-top:4px;"><b>Method Rule:</b> ${evalRes.entry.method}</div>
          </div>`;
    },

    // ================================================================
    // 7. TOP-LEVEL ANALYZE3 + RENDER
    // ================================================================

        /**
     * params: { natalPlanets, natalAsc, retroCheckPlanet, transitTriggerPlanets, horaryQuery }
     */

    analyze3: function (params) {
        params = params || {};
        const P1 = this._p1();
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        if (!P1 || !natalPlanets || !natalAsc) return null;
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;

        this._cachedAnalysisParams = { ascSid: ascSid, natalPlanets: natalPlanets };

        const extendedConjunctions = this.getExtendedConjunctions(natalPlanets);
        const trineReadings = this.getConjunctionTrineReadings(natalPlanets);
        const retrogradeFilter = params.retroCheckPlanet
            ? this.analyzeRetrogradeFilter(params.retroCheckPlanet, ascSid, natalPlanets, params.transitTriggerPlanets) : null;
        const shareMarketGrading = this.gradeShareMarketOutcome(ascSid, natalPlanets);
        const unhealthyChildRisk = this.checkUnhealthyChildRisk(ascSid, natalPlanets);
        const horaryResults = params.horaryQuery ? this.searchHorary(params.horaryQuery) : null;
        const horaryQAResults = params.horaryQuery ? this.searchHoraryQA(params.horaryQuery) : null;
        return {
            extendedConjunctions: extendedConjunctions, trineReadings: trineReadings,
            retrogradeFilter: retrogradeFilter, shareMarketGrading: shareMarketGrading,
            unhealthyChildRisk: unhealthyChildRisk, horaryResults: horaryResults,
            horaryQAResults: horaryQAResults
        };
    },

    renderHTML3: function (data) {
        if (!data) return '<div class="pred-item">KP Part 3 analysis unavailable — check that natalPlanets/natalAsc were supplied.</div>';
        let html = '<div class="pred-section-title" style="margin-top:10px;">🔷 KP Astrology — Part 3 (Extended KAT, Retrograde, Tiered Grading, Master Horary Library)</div>';
        html += this.renderExtendedConjunctions(data.extendedConjunctions);
        html += this.renderTrineReadings(data.trineReadings);
        if (data.retrogradeFilter) html += this.renderRetrogradeFilter(data.retrogradeFilter);
        html += this.renderShareMarketGrading(data.shareMarketGrading, data.unhealthyChildRisk);
        html += this.renderHoraryEvaluatorUI();
        if (data.horaryResults) html += this.renderHoraryResults(data.horaryResults);
        if (data.horaryQAResults) html += this.renderHoraryQAResults(data.horaryQAResults);
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION_3;
}