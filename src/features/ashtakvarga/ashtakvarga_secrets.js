/**
 * ashtakvarga_secrets.js
 * ─────────────────────────────────────────────────────────────
 * "Ashtakavarga Secrets" — a set of lesser-known, practically
 * oriented Ashtakavarga techniques (character-typing via the four
 * Khandas, Moon/Sun/Venus bindu-based marriage harmony, business
 * aptitude ratios, transit "secrets" for Sun/Jupiter/Moon, Sadhe
 * Sati assessment via Moon's own Ashtakavarga, and a simple
 * Varshaphal-style age-to-house progression).
 *
 * Builds entirely on top of the existing window.ASHTAKVARGA engine
 * (ashtakvarga_core.js) — no duplication of BAV/SAV/Kaksha math.
 *
 * REFERENCE: Synthesized from the "Ashtakavarga Secrets" discourse
 * (Manoj Kaushik, drawing on K.N. Rao, Vinay Gupta, C.S. Patel, and
 * classical Parashari Ashtakavarga principles). Content below is an
 * original restatement of the underlying technique, not reproduced
 * text.
 *
 * Namespaces exposed:
 *   window.ASHTAKVARGA.SECRETS           — calculation layer
 *   window.ASHTAKVARGA_SECRETS_DISPLAY   — HTML rendering layer
 */

(function () {

    if (!window.ASHTAKVARGA) {
        console.warn('ashtakvarga_secrets.js loaded before ashtakvarga_core.js — SECRETS will attach lazily but needs window.ASHTAKVARGA present at call time.');
    }

    // ─────────────────────────────────────────────────────────────
    //  SHARED HELPERS
    // ─────────────────────────────────────────────────────────────
    function A() { return window.ASHTAKVARGA; }

    function houseSign(ascSignNum, houseNum) {
        return (ascSignNum + houseNum - 1) % 12;
    }

    function houseSAV(sav, ascSignNum, houseNum) {
        const signIdx = houseSign(ascSignNum, houseNum);
        return { house: houseNum, signIdx: signIdx, sign: A().SIGNS[signIdx], sav: sav[signIdx] };
    }

    // ═══════════════════════════════════════════════════════════
    //  1. THE FOUR KHANDAS (character-typing from Sarvashtakavarga)
    // ═══════════════════════════════════════════════════════════
    const KHANDA_GROUPS = {
        Bandhu: { houses: [1, 5, 9], title: 'Bandhu Khanda (Kinship/Influence Segment)',
            summary: 'Above-average strength here tends to produce a naturally influential, take-charge presence — the kind of person others gravitate toward and are guided by in a crisis.' },
        Sevak: { houses: [2, 6, 10], title: 'Sevak Khanda (Service Segment)',
            summary: 'Above-average strength here favours dependable service and diligent execution, though classically this segment is said to support supporting roles more than top independent command — strong performance under a senior more than as the senior.' },
        Poshak: { houses: [3, 7, 11], title: 'Poshak Khanda (Nourishing/Enterprise Segment)',
            summary: 'Above-average strength here is classically the strongest indicator of business acumen and effective administration — including the "trusted intermediary" role that connects people at different levels of an organisation.' },
        Ghatak: { houses: [4, 8, 12], title: 'Ghatak Khanda (Testing Segment)',
            summary: 'Above-average strength here often brings mixed, karmically textured results — advancement that arrives bundled with an offsetting challenge (commonly health-related), rather than an unclouded gain.' }
    };

    function computeKhandaAnalysis(sav, ascSignNum) {
        const totalSav = sav.reduce((a, b) => a + b, 0);
        const perKhandaAverage = totalSav / 4;

        const khandas = Object.entries(KHANDA_GROUPS).map(([key, def]) => {
            const houseDetails = def.houses.map(h => houseSAV(sav, ascSignNum, h));
            const total = houseDetails.reduce((s, h) => s + h.sav, 0);
            return {
                key: key,
                title: def.title,
                houses: houseDetails,
                total: total,
                aboveAverage: total > perKhandaAverage,
                summary: def.summary
            };
        });

        const sorted = khandas.slice().sort((a, b) => b.total - a.total);
        const dominant = sorted[0];

        return {
            perKhandaAverage: perKhandaAverage,
            totalSav: totalSav,
            khandas: khandas,
            sorted: sorted,
            dominant: dominant
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  2. LAGNA CONFIDENCE vs 8TH-HOUSE FEAR (moderated by 4th house)
    // ═══════════════════════════════════════════════════════════
    function analyzeConfidenceFear(sav, ascSignNum) {
        const h1 = houseSAV(sav, ascSignNum, 1);   // confidence
        const h4 = houseSAV(sav, ascSignNum, 4);   // pleasure/happiness — moderates fear
        const h8 = houseSAV(sav, ascSignNum, 8);   // fear/anxiety

        const rawLeaning = h1.sav >= h8.sav ? 'confidence' : 'apprehension';
        const moderated = h4.sav >= h4.sav && h4.sav > (sav.reduce((a, b) => a + b, 0) / 12)
            ? 'Domestic comfort (4th house) is above the chart average, which classically softens any 8th-house apprehension considerably.'
            : 'Domestic comfort (4th house) is not strongly above average, so any 8th-house apprehension is less cushioned and may be felt more directly.';

        return {
            confidence: h1, pleasure: h4, fear: h8,
            rawLeaning: rawLeaning,
            narrative: `Lagna (confidence): ${h1.sav} bindus vs 8th house (fear/anxiety): ${h8.sav} bindus — ` +
                (h1.sav > h8.sav ? 'the natural baseline leans toward self-assurance. ' : h1.sav < h8.sav ? 'some underlying apprehension is part of the natural temperament. ' : 'confidence and apprehension are evenly balanced. ') +
                moderated
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  3. DESIRE (3rd) vs FULFILMENT OF DESIRE (11th)
    // ═══════════════════════════════════════════════════════════
    function analyzeDesireFulfillment(sav, ascSignNum) {
        const h3 = houseSAV(sav, ascSignNum, 3);
        const h11 = houseSAV(sav, ascSignNum, 11);
        let verdict;
        if (h11.sav > h3.sav + 3) verdict = 'Fulfilment capacity clearly exceeds the raw desire — even wishes not consciously pursued tend to be fulfilled.';
        else if (h3.sav > h11.sav + 3) verdict = 'Desire runs stronger than the chart\'s current fulfilment capacity — ambitions may need sustained, deliberate effort to be realised.';
        else verdict = 'Desire and its fulfilment are fairly evenly matched — outcomes generally track effort proportionally.';
        return { desire: h3, fulfillment: h11, verdict: verdict };
    }

    // ═══════════════════════════════════════════════════════════
    //  4. DHARMA (9th) → KARMA (10th) → FULFILMENT OF KARMA (11th)
    // ═══════════════════════════════════════════════════════════
    function analyzeDharmaKarmaGains(sav, ascSignNum) {
        const h9 = houseSAV(sav, ascSignNum, 9);
        const h10 = houseSAV(sav, ascSignNum, 10);
        const h11 = houseSAV(sav, ascSignNum, 11);
        return {
            dharma: h9, karma: h10, gains: h11,
            narrative: `Dharma (H9): ${h9.sav} · Karma (H10): ${h10.sav} · Fulfilment-of-Karma (H11): ${h11.sav} — ` +
                'the 11th house is classically why nearly every planet grants it at least one bindu in its own Bhinnashtakavarga: everything ultimately routes toward fulfilment. ' +
                (h11.sav >= h10.sav ? 'Here, fulfilment (H11) matches or exceeds the effort house (H10) — a supportive combination for reaping visible rewards from one\'s work.' :
                    'Here, the effort house (H10) runs ahead of fulfilment (H11) for now — rewards may lag the effort invested, calling for patience.')
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  5. MARRIAGE HARMONY — Moon / Sun / Venus bindu-matching
    //     (an Ashtakavarga-based supplement to classical Kundli Milan)
    // ═══════════════════════════════════════════════════════════
    const HARMONY_PLANETS = {
        Moon: { label: 'Mental & Emotional Harmony (Mansik Samanjasya)', icon: '🌙' },
        Sun: { label: 'Physical/Vitality Harmony (Sharirik Samanjasya)', icon: '☀️' },
        Venus: { label: 'Romantic & Deeper Harmony (Atmik Samanjasya)', icon: '💞' }
    };

    function harmonyThreshold(planetName) {
        const avg = A().planetOwnAverage(planetName) || 4;
        return Math.ceil(avg + 1.5); // ~6 for Sun/Moon/Venus, consistent with the classical "6-or-more bindus" guidance
    }

    function analyzeMarriageHarmony(allBAV, ascSignNum, partnerSigns) {
        const results = {};
        Object.keys(HARMONY_PLANETS).forEach(function (p) {
            const bav = allBAV[p];
            if (!bav) return;
            const threshold = harmonyThreshold(p);
            const favorableSigns = [];
            for (let s = 0; s < 12; s++) {
                if (bav.bindus[s] >= threshold) favorableSigns.push({ sign: A().SIGNS[s], signIdx: s, bindus: bav.bindus[s] });
            }
            let partnerVerdict = null;
            if (partnerSigns && partnerSigns[p] !== undefined && partnerSigns[p] !== null) {
                const pSignIdx = typeof partnerSigns[p] === 'number' ? partnerSigns[p] : A().SIGNS.indexOf(partnerSigns[p]);
                const bindusThere = bav.bindus[pSignIdx];
                partnerVerdict = {
                    signIdx: pSignIdx, sign: A().SIGNS[pSignIdx], bindus: bindusThere,
                    favorable: bindusThere >= threshold,
                    note: bindusThere >= threshold
                        ? `${bindusThere} bindus (≥ ${threshold}) — a genuinely supportive placement for this dimension of harmony.`
                        : `${bindusThere} bindus (below the ${threshold}-bindu benchmark) — this dimension may need more conscious effort in the relationship.`
                };
            }
            results[p] = {
                label: HARMONY_PLANETS[p].label,
                icon: HARMONY_PLANETS[p].icon,
                threshold: threshold,
                favorableSigns: favorableSigns,
                partnerVerdict: partnerVerdict
            };
        });
        return results;
    }

    // ═══════════════════════════════════════════════════════════
    //  6. BUSINESS SECRETS
    // ═══════════════════════════════════════════════════════════
    function analyzeBusinessSecrets(sav, ascSignNum, khandaAnalysis) {
        const h2 = houseSAV(sav, ascSignNum, 2);
        const h4 = houseSAV(sav, ascSignNum, 4);
        const h6 = houseSAV(sav, ascSignNum, 6);
        const h8 = houseSAV(sav, ascSignNum, 8);
        const h10 = houseSAV(sav, ascSignNum, 10);
        const h11 = houseSAV(sav, ascSignNum, 11);

        const poshak = khandaAnalysis.khandas.find(function (k) { return k.key === 'Poshak'; });

        // Karma (effort, H10) vs Gains (fulfilment, H11)
        let effortVsIncome;
        if (h11.sav > h10.sav + 3) effortVsIncome = 'Income tends to exceed direct effort — earnings flow relatively easily relative to the work put in.';
        else if (h10.sav > h11.sav + 3) effortVsIncome = 'Effort tends to exceed direct income — earnings are more hard-won and proportional to sustained work.';
        else effortVsIncome = 'Effort and income are fairly proportional to one another.';

        // Pleasure (H4) vs Karma (H10) — work location/rhythm
        let workRhythm;
        if (h4.sav > h10.sav + 3) workRhythm = 'A pull toward working from or very near home — comfort and business/work can coexist in the same space, with more work-life blending and less late-hour strain.';
        else if (h10.sav > h4.sav + 3) workRhythm = 'A pull toward working away from home and for longer hours — career demands take precedence over domestic downtime.';
        else workRhythm = 'A reasonably even balance between home comfort and work commitments.';

        // Accumulation (H2) vs Investment (H8)
        let savingsVsInvestment;
        if (Math.abs(h2.sav - h8.sav) <= 2) savingsVsInvestment = 'Savings (H2) and investment appetite (H8) are closely balanced.';
        else if (h2.sav > h8.sav) savingsVsInvestment = 'A stronger pull toward straightforward saving/accumulation (H2) over active investment risk (H8).';
        else savingsVsInvestment = 'A stronger pull toward active investment (H8) over simple accumulation (H2) — comfort with calculated financial risk.';

        // Rivals (H6) vs Growth via allies/gains (H11)
        let competitionVsGrowth;
        if (h11.sav > h6.sav + 3) competitionVsGrowth = 'Gains/allies (H11) outweigh obstacles/rivals (H6) — natural, relatively unobstructed business growth is favoured.';
        else if (h6.sav > h11.sav + 3) competitionVsGrowth = 'Obstacles/rivals (H6) outweigh gains (H11) for now — growth is achievable but will likely require actively out-competing challengers.';
        else competitionVsGrowth = 'Obstacles and growth-support are fairly evenly matched.';

        return {
            poshakKhanda: poshak,
            entrepreneurAptitude: poshak ? poshak.aboveAverage : null,
            effortVsIncome: effortVsIncome, workRhythm: workRhythm,
            savingsVsInvestment: savingsVsInvestment, competitionVsGrowth: competitionVsGrowth,
            houses: { h2: h2, h4: h4, h6: h6, h8: h8, h10: h10, h11: h11 }
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  7. TRANSIT SECRETS — Sun (vitality), Jupiter (growth), Moon (swing)
    // ═══════════════════════════════════════════════════════════
    function analyzeSunTransitHealth(sunBAV, transitSignIdx) {
        const bindus = sunBAV.bindus[transitSignIdx];
        let verdict, caution;
        if (bindus <= 2) { verdict = 'Low vitality window'; caution = true; }
        else if (bindus <= 4) { verdict = 'Average/neutral window'; caution = false; }
        else { verdict = 'Favourable, vitality-boosting window'; caution = false; }
        return {
            sign: A().SIGNS[transitSignIdx], bindus: bindus, verdict: verdict, caution: caution,
            narrative: caution
                ? `Sun is transiting a sign where its own Bhinnashtakavarga gives only ${bindus} bindu(s) — classically a time to be more careful about vitality/immunity rather than to over-exert.`
                : `Sun is transiting a sign with ${bindus} bindus in its own Bhinnashtakavarga — a ${bindus <= 4 ? 'neutral' : 'supportive'} period for Sun-related matters (vitality, authority, father, government dealings).`
        };
    }

    function analyzeJupiterTransitGrowth(jupiterBAV, transitSignIdx) {
        const bindus = jupiterBAV.bindus[transitSignIdx];
        let level;
        if (bindus <= 2) level = 'Slow growth';
        else if (bindus <= 4) level = 'Steady/moderate growth';
        else if (bindus <= 6) level = 'Good growth';
        else level = 'Excellent growth';
        return {
            sign: A().SIGNS[transitSignIdx], bindus: bindus, level: level,
            narrative: `Jupiter transiting ${A().SIGNS[transitSignIdx]} carries ${bindus} bindus in its own Bhinnashtakavarga — indicating "${level.toLowerCase()}" for the significations Jupiter governs during this transit (expansion, wisdom, fortune, children, wealth).`
        };
    }

    function analyzeMoonSwing(moonBAV, transitSignIdx, degInSign) {
        const bindus = moonBAV.bindus[transitSignIdx];
        const kaksha = A().getKaksha(degInSign || 0);
        const grants = A().kakshaGrantsBindu(moonBAV, transitSignIdx, kaksha.lord);
        const favorable = bindus >= 5 && grants;
        return {
            sign: A().SIGNS[transitSignIdx], bindus: bindus, kaksha: kaksha, kakshaGrantsBindu: grants,
            favorable: favorable,
            narrative: favorable
                ? `Moon's mood/mind (its own ${bindus}-bindu strength here, with an "open" Kaksha of ${kaksha.lord}) is running favourably in this roughly 2–3 hour window — a good sub-period to initiate or decide things.`
                : `Moon's current sub-period (Kaksha of ${kaksha.lord}, ${bindus} bindus, gate ${grants ? 'open' : 'closed'}) is not especially strong right now — better to stay measured and avoid reactive decisions until the mood/window improves.`
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  8. SADHE SATI — assessed through Moon's own Bhinnashtakavarga
    // ═══════════════════════════════════════════════════════════
    function analyzeSadheSati(moonBAV, natalMoonSignIdx) {
        const phases = [
            { label: 'Rising Phase (12th from Moon)', signIdx: (natalMoonSignIdx + 11) % 12 },
            { label: 'Peak Phase (Moon\'s own sign)', signIdx: natalMoonSignIdx },
            { label: 'Setting Phase (2nd from Moon)', signIdx: (natalMoonSignIdx + 1) % 12 }
        ];
        const avg = A().planetOwnAverage('Moon');
        const detailed = phases.map(function (ph) {
            const bindus = moonBAV.bindus[ph.signIdx];
            const manageable = bindus >= avg;
            return {
                label: ph.label, sign: A().SIGNS[ph.signIdx], bindus: bindus, manageable: manageable,
                note: manageable
                    ? `${bindus} bindus (at/above Moon's own average of ${avg.toFixed(1)}) — this phase should be workable, even if outwardly demanding.`
                    : `${bindus} bindus (below Moon's own average of ${avg.toFixed(1)}) — this phase calls for extra emotional patience and care.`
            };
        });
        const overallManageableCount = detailed.filter(function (d) { return d.manageable; }).length;
        return {
            phases: detailed,
            overallVerdict: overallManageableCount >= 2 ? 'Sadhe Sati is likely to be manageable overall — the classical fear attached to this transit is not strongly supported here.' :
                'Sadhe Sati may feel more taxing than average through at least two of its three phases — building emotional support structures in advance is worthwhile.',
            note: 'Reminder: Sadhe Sati\'s common description as "loss paired with gain" (something is released so something else can be received) applies regardless of bindu strength — the bindus mainly indicate how smoothly that exchange plays out.'
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  9. SIMPLE VARSHAPHAL-STYLE AGE → HOUSE PROGRESSION
    // ═══════════════════════════════════════════════════════════
    function analyzeVarshaphalHouse(age, ascSignNum, sav) {
        const safeAge = Math.max(1, Math.floor(age) || 1);
        const houseNum = ((safeAge - 1) % 12) + 1;
        const h = houseSAV(sav, ascSignNum, houseNum);
        const strength = A().classifySAVStrength(h.sav);
        return {
            age: safeAge, house: houseNum, sign: h.sign, sav: h.sav, strength: strength,
            narrative: `At age ${safeAge}, the simple age→house progression points to House ${houseNum} (${h.sign}), carrying ${h.sav} Sarvashtakavarga bindus — a "${strength}" year for that house's significations.`
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  ATTACH CALCULATION LAYER
    // ═══════════════════════════════════════════════════════════
    function attach() {
        window.ASHTAKVARGA.SECRETS = {
            KHANDA_GROUPS: KHANDA_GROUPS,
            computeKhandaAnalysis: computeKhandaAnalysis,
            analyzeConfidenceFear: analyzeConfidenceFear,
            analyzeDesireFulfillment: analyzeDesireFulfillment,
            analyzeDharmaKarmaGains: analyzeDharmaKarmaGains,
            analyzeMarriageHarmony: analyzeMarriageHarmony,
            analyzeBusinessSecrets: analyzeBusinessSecrets,
            analyzeSunTransitHealth: analyzeSunTransitHealth,
            analyzeJupiterTransitGrowth: analyzeJupiterTransitGrowth,
            analyzeMoonSwing: analyzeMoonSwing,
            analyzeSadheSati: analyzeSadheSati,
            analyzeVarshaphalHouse: analyzeVarshaphalHouse,
            REFERENCES: [
                'Ashtakavarga Secrets discourse — Manoj Kaushik (in conversation, crediting K.N. Rao, Vinay Gupta, and C.S. Patel)',
                'B.V. Raman — Ashtakavarga System of Prediction (standard BAV/SAV reference)',
                'Classical Parashari Ashtakavarga tradition'
            ]
        };
    }
    if (window.ASHTAKVARGA) attach();
    else document.addEventListener('DOMContentLoaded', function () { if (window.ASHTAKVARGA) attach(); else console.error('ashtakvarga_secrets.js: window.ASHTAKVARGA still not found — check script load order (ashtakvarga_core.js must load first).'); });

    // ═══════════════════════════════════════════════════════════
    //  DISPLAY LAYER
    // ═══════════════════════════════════════════════════════════
    function color(strength) {
        return strength === 'exceptional' ? '#00FFAA' : strength === 'strong' ? '#00DD77' : strength === 'good' ? '#FFD700' : strength === 'weak' ? '#FF9955' : '#FF4477';
    }

    const DISPLAY = {

        renderFourKhanda: function (k) {
            const rows = k.khandas.map(function (kh) {
                const c = kh.aboveAverage ? '#00DD77' : '#FF9955';
                const isDominant = kh === k.dominant;
                return `<div style="margin:4px 0;padding:6px 8px;border-left:3px solid ${c};background:${c}0A;border-radius:3px;">
                  <div style="display:flex;justify-content:space-between;">
                    <span style="font-size:9.5px;font-weight:bold;">${isDominant ? '⭐ ' : ''}${kh.title}</span>
                    <span style="font-size:9.5px;font-weight:bold;color:${c};">${kh.total} bindus ${kh.aboveAverage ? '(above avg)' : '(below avg)'}</span>
                  </div>
                  <div style="font-size:8px;color:var(--muted);margin-top:2px;">Houses ${kh.houses.map(function(h){return 'H'+h.house+'('+h.sav+')';}).join(', ')}</div>
                  <div style="font-size:8.5px;margin-top:3px;">${kh.summary}</div>
                </div>`;
            }).join('');
            return `<div class="pred-item" style="border-left:3px solid var(--gold,#FFD700);">
              <div class="pred-title" style="color:var(--gold,#FFD700);">🧬 Four Khanda Character Analysis</div>
              <div style="font-size:8px;color:var(--muted);margin-bottom:4px;">Per-Khanda average: ${k.perKhandaAverage.toFixed(1)} bindus (Total SAV ${k.totalSav} ÷ 4). Dominant segment: <b>${k.dominant.title}</b>.</div>
              ${rows}
            </div>`;
        },

        renderConfidenceDesire: function (cf, df, dkg) {
            return `<div class="pred-item" style="border-left:3px solid var(--cyan);">
              <div class="pred-title" style="color:var(--cyan);">🧭 Personality Bindu-Comparisons</div>
              <div style="font-size:8.5px;margin:3px 0;"><b>Confidence vs Fear:</b> ${cf.narrative}</div>
              <div style="font-size:8.5px;margin:3px 0;"><b>Desire vs Fulfilment:</b> ${df.verdict} (H3: ${df.desire.sav} · H11: ${df.fulfillment.sav})</div>
              <div style="font-size:8.5px;margin:3px 0;"><b>Dharma → Karma → Gains:</b> ${dkg.narrative}</div>
            </div>`;
        },

        renderMarriageHarmony: function (harmony) {
            const blocks = Object.keys(harmony).map(function (p) {
                const h = harmony[p];
                const signList = h.favorableSigns.length
                    ? h.favorableSigns.map(function (s) { return `${s.sign} (${s.bindus})`; }).join(', ')
                    : 'none reach the threshold in this chart';
                const partnerHTML = h.partnerVerdict
                    ? `<div style="font-size:8.5px;margin-top:2px;color:${h.partnerVerdict.favorable ? '#00DD77' : '#FF9955'};">Partner check (${h.partnerVerdict.sign}): ${h.partnerVerdict.note}</div>`
                    : '';
                return `<div style="margin:5px 0;padding:6px 8px;border-left:3px solid var(--rose);background:rgba(255,68,119,.05);border-radius:3px;">
                  <div style="font-size:9.5px;font-weight:bold;">${h.icon} ${h.label}</div>
                  <div style="font-size:8px;color:var(--muted);margin-top:2px;">Favourable partner Moon/Lagna/Venus signs (≥ ${h.threshold} bindus): ${signList}</div>
                  ${partnerHTML}
                </div>`;
            }).join('');
            return `<div class="pred-item" style="border-left:3px solid var(--rose);">
              <div class="pred-title" style="color:var(--rose);">💍 Ashtakavarga Marriage Harmony Secrets</div>
              <div style="font-size:8px;color:var(--muted);margin-bottom:4px;">A supplement to classical Kundli Milan: a partner whose Moon/Lagna/Venus falls in one of these signs tends to bring smoother harmony on that specific dimension.</div>
              ${blocks}
            </div>`;
        },

        renderBusinessSecrets: function (biz) {
            const poshakColor = biz.entrepreneurAptitude ? '#00DD77' : '#FF9955';
            return `<div class="pred-item" style="border-left:3px solid var(--gold,#FFD700);">
              <div class="pred-title" style="color:var(--gold,#FFD700);">💼 Ashtakavarga Business Secrets</div>
              ${biz.poshakKhanda ? `<div style="font-size:8.5px;margin:3px 0;color:${poshakColor};font-weight:bold;">Poshak Khanda (H3/H7/H11): ${biz.poshakKhanda.total} bindus — ${biz.entrepreneurAptitude ? '✓ classically favourable for business/administrative aptitude' : 'below average — business success more likely built through deliberate skill-building than natural inclination'}</div>` : ''}
              <div style="font-size:8.5px;margin:3px 0;"><b>Effort vs Income (H10 vs H11):</b> ${biz.effortVsIncome}</div>
              <div style="font-size:8.5px;margin:3px 0;"><b>Work Rhythm (H4 vs H10):</b> ${biz.workRhythm}</div>
              <div style="font-size:8.5px;margin:3px 0;"><b>Savings vs Investment (H2 vs H8):</b> ${biz.savingsVsInvestment}</div>
              <div style="font-size:8.5px;margin:3px 0;"><b>Rivals vs Growth (H6 vs H11):</b> ${biz.competitionVsGrowth}</div>
            </div>`;
        },

        renderTransitSecrets: function (opts) {
            const parts = [];
            if (opts.sunHealth) {
                const c = opts.sunHealth.caution ? '#FF4477' : '#00DD77';
                parts.push(`<div style="font-size:8.5px;margin:3px 0;padding:4px 6px;border-left:2px solid ${c};">☀️ <b>${opts.sunHealth.verdict}</b> — ${opts.sunHealth.narrative}</div>`);
            }
            if (opts.jupiterGrowth) {
                parts.push(`<div style="font-size:8.5px;margin:3px 0;padding:4px 6px;border-left:2px solid #FFD700;">🪐 <b>${opts.jupiterGrowth.level}</b> — ${opts.jupiterGrowth.narrative}</div>`);
            }
            if (opts.moonSwing) {
                const c = opts.moonSwing.favorable ? '#00DD77' : 'var(--muted)';
                parts.push(`<div style="font-size:8.5px;margin:3px 0;padding:4px 6px;border-left:2px solid ${c};">🌙 ${opts.moonSwing.narrative}</div>`);
            }
            if (opts.sadheSati) {
                const rows = opts.sadheSati.phases.map(function (p) {
                    const c = p.manageable ? '#00DD77' : '#FF9955';
                    return `<div style="font-size:8px;margin:2px 0;padding-left:4px;border-left:2px solid ${c};">${p.label} (${p.sign}): ${p.note}</div>`;
                }).join('');
                parts.push(`<div style="margin-top:4px;"><div style="font-size:9px;font-weight:bold;">🪐 Sadhe Sati via Moon's Bhinnashtakavarga</div>${rows}<div style="font-size:8.5px;margin-top:2px;font-weight:bold;">${opts.sadheSati.overallVerdict}</div><div style="font-size:7.5px;color:var(--muted);margin-top:2px;">${opts.sadheSati.note}</div></div>`);
            }
            if (opts.varshaphal) {
                parts.push(`<div style="font-size:8.5px;margin-top:4px;padding:4px 6px;border-left:2px solid ${color(opts.varshaphal.strength)};">📅 ${opts.varshaphal.narrative}</div>`);
            }
            return `<div class="pred-item" style="border-left:3px solid var(--cyan);">
              <div class="pred-title" style="color:var(--cyan);">🔮 Ashtakavarga Transit & Timing Secrets</div>
              ${parts.join('')}
            </div>`;
        },

        // ── Convenience: full "all" section for the Ashtakavarga panel ──
        renderAllSecretsForAshtakvargaPanel: function (opts) {
            const S = window.ASHTAKVARGA.SECRETS;
            const { natalPlanets, ascSignNum, ascDeg, allBAV, sav, transitPlanets, birthDate } = opts;
            let html = '';
            const khanda = S.computeKhandaAnalysis(sav, ascSignNum);
            html += this.renderFourKhanda(khanda);
            html += this.renderConfidenceDesire(
                S.analyzeConfidenceFear(sav, ascSignNum),
                S.analyzeDesireFulfillment(sav, ascSignNum),
                S.analyzeDharmaKarmaGains(sav, ascSignNum)
            );
            if (allBAV) html += this.renderMarriageHarmony(S.analyzeMarriageHarmony(allBAV, ascSignNum));
            html += this.renderBusinessSecrets(S.analyzeBusinessSecrets(sav, ascSignNum, khanda));

            const transitOpts = {};
            if (transitPlanets && allBAV) {
                if (allBAV.Sun && transitPlanets.Sun) transitOpts.sunHealth = S.analyzeSunTransitHealth(allBAV.Sun, transitPlanets.Sun.sn);
                if (allBAV.Jupiter && transitPlanets.Jupiter) transitOpts.jupiterGrowth = S.analyzeJupiterTransitGrowth(allBAV.Jupiter, transitPlanets.Jupiter.sn);
                if (allBAV.Moon && transitPlanets.Moon) transitOpts.moonSwing = S.analyzeMoonSwing(allBAV.Moon, transitPlanets.Moon.sn, parseFloat(transitPlanets.Moon.deg) || 0);
                if (allBAV.Moon && natalPlanets && natalPlanets.Moon) {
                    const natalMoonSignIdx = window.ASHTAKVARGA._signOf(natalPlanets.Moon.sid !== undefined ? natalPlanets.Moon.sid : natalPlanets.Moon.longitude);
                    transitOpts.sadheSati = S.analyzeSadheSati(allBAV.Moon, natalMoonSignIdx);
                }
            }
            if (birthDate instanceof Date) {
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
                transitOpts.varshaphal = S.analyzeVarshaphalHouse(age, ascSignNum, sav);
            }
            if (Object.keys(transitOpts).length) html += this.renderTransitSecrets(transitOpts);

            return `<div style="margin-top:10px;"><div style="font-size:10px;font-weight:bold;color:var(--gold,#FFD700);padding:6px 0;border-top:1px dashed rgba(255,255,255,.1);">✨ ASHTAKAVARGA SECRETS</div>${html}</div>`;
        },

        // ── Convenience wrappers for individual panels ──
        renderForBusinessPanel: function (natalPlanets, ascSignNum, ascDeg, lords) {
            try {
                const A_ = window.ASHTAKVARGA, S = A_.SECRETS;
                const allBAV = A_.computeAllBAV(natalPlanets, ascSignNum, ascDeg, true);
                const sav = A_.computeSAV(allBAV);
                const khanda = S.computeKhandaAnalysis(sav, ascSignNum);
                return this.renderBusinessSecrets(S.analyzeBusinessSecrets(sav, ascSignNum, khanda));
            } catch (e) {
                console.error('renderForBusinessPanel failed:', e);
                return '';
            }
        },

        renderForMarriagePanel: function (natalPlanets, ascSignNum, ascDeg, partnerSigns) {
            try {
                const A_ = window.ASHTAKVARGA, S = A_.SECRETS;
                const allBAV = A_.computeAllBAV(natalPlanets, ascSignNum, ascDeg, true);
                return this.renderMarriageHarmony(S.analyzeMarriageHarmony(allBAV, ascSignNum, partnerSigns));
            } catch (e) {
                console.error('renderForMarriagePanel failed:', e);
                return '';
            }
        },

        renderForStep2Step: function (natalPlanets, ascSignNum, ascDeg, transitPlanets, birthDate) {
            try {
                const A_ = window.ASHTAKVARGA, S = A_.SECRETS;
                const allBAV = A_.computeAllBAV(natalPlanets, ascSignNum, ascDeg, true);
                const sav = A_.computeSAV(allBAV);
                const opts = {};
                if (transitPlanets) {
                    if (allBAV.Sun && transitPlanets.Sun) opts.sunHealth = S.analyzeSunTransitHealth(allBAV.Sun, transitPlanets.Sun.sn);
                    if (allBAV.Jupiter && transitPlanets.Jupiter) opts.jupiterGrowth = S.analyzeJupiterTransitGrowth(allBAV.Jupiter, transitPlanets.Jupiter.sn);
                    if (allBAV.Moon && transitPlanets.Moon) opts.moonSwing = S.analyzeMoonSwing(allBAV.Moon, transitPlanets.Moon.sn, parseFloat(transitPlanets.Moon.deg) || 0);
                    if (allBAV.Moon && natalPlanets && natalPlanets.Moon) {
                        const natalMoonSignIdx = A_._signOf(natalPlanets.Moon.sid !== undefined ? natalPlanets.Moon.sid : natalPlanets.Moon.longitude);
                        opts.sadheSati = S.analyzeSadheSati(allBAV.Moon, natalMoonSignIdx);
                    }
                }
                if (birthDate instanceof Date) {
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
                    opts.varshaphal = S.analyzeVarshaphalHouse(age, ascSignNum, sav);
                }
                const khanda = S.computeKhandaAnalysis(sav, ascSignNum);
                let html = this.renderFourKhanda(khanda);
                html += this.renderConfidenceDesire(S.analyzeConfidenceFear(sav, ascSignNum), S.analyzeDesireFulfillment(sav, ascSignNum), S.analyzeDharmaKarmaGains(sav, ascSignNum));
                if (Object.keys(opts).length) html += this.renderTransitSecrets(opts);
                return html;
            } catch (e) {
                console.error('renderForStep2Step failed:', e);
                return '';
            }
        }
    };

    window.ASHTAKVARGA_SECRETS_DISPLAY = DISPLAY;

    if (typeof module !== 'undefined' && module.exports) module.exports = { SECRETS: window.ASHTAKVARGA && window.ASHTAKVARGA.SECRETS, DISPLAY: DISPLAY };

})();