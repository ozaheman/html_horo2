/**
 * KP_prediction_10.js
 *
 * PART 10 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-9 — reuses window.KP_PREDICTION (Part 1) for
 * all cusp/significator/dasha math rather than re-deriving any chart math.
 *
 * Checked first against Parts 1-9 for what's already covered before writing
 * anything below:
 *
 *   ALREADY PRESENT (confirmed, NOT duplicated here):
 *     - Full KP significator machinery (getPlanetNumbers, getSignificators,
 *       getFruitfulSignificators, getPlanetSignifiedHouses) — the general
 *       "which houses does this planet signify" answer.
 *     - checkEventPromise() / checkAllEventPromises() / EVENT_PRIME_HOUSES —
 *       including marriage_h7 (+2nd/3rd/4th), job_employment_h6,
 *       job_resignation_h10, career_promotion_h10, business_partnership_h7.
 *     - findEventWindow() — the full classical 3-stage Promise -> Mahadasha/
 *       Antardasha support -> Jupiter(year)/Sun(month)/Moon(day) transit
 *       pipeline (Part 1, section 11½), which already IS the "4 simple
 *       steps" method taught in the source transcripts.
 *     - checkBirthTimeRectification() (Part 2) — the "1-9 Connectivity
 *       Rule" BTR method (1st house Nakshatra-Lord <-> 9th house Sub-Lord
 *       cross-check). This is a DIFFERENT technique from the Ruling-Planets
 *       method below; both are kept, cross-referenced, not merged.
 *     - Full house-signification library (Part 5), profession/wealth CSL
 *       tables (Part 6), Promise-vs-Result event library (Part 8), and the
 *       MD->AD->PD->Sookshma->Pran Event Timing Finder (Part 9).
 *     - Type-of-business (D9-based) already covered separately by
 *       business_tarachakra.js's analyzeD9BusinessType().
 *
 *   GENUINELY NEW BELOW (confirmed absent from Parts 1-9 and from
 *   business_tarachakra.js / business_muhurta_calendar.js):
 *     1. MOST POWERFUL PLANET FINDER — "Harish Kumar" 11th-house method:
 *        NOT which planet sits in / owns the target house (that's the
 *        existing significator method), but which planet's own NAKSHATRA
 *        LORD is *placed* in the target house (KP/Bhava-Chalit chart, not
 *        Lagna chart) — plus that planet's own-sign "speed" (movable/
 *        fixed/dual). This reverse NL-placement lookup, and the House-11-
 *        as-default target ("the one house whose own results AND whose
 *        negation of the 12th [house 11 negates house 12] are BOTH good"),
 *        did not exist anywhere in Parts 1-9.
 *     2. RULING-PLANETS BIRTH TIME VERIFICATION — a second, independent BTR
 *        technique: does the querent's PRIMARY HOUSE (the house of
 *        whatever they're actually asking about) Sub-Lord appear among the
 *        Ruling Planets of the moment the chart is read? If not, step the
 *        Sub-Lord forward/backward along the fixed Vimshottari Sub-Lord
 *        cycle (KP_PREDICTION.DASHA_SEQ) until it lands on a Sub-Lord that
 *        IS a Ruling Planet, and report which direction (and by how many
 *        cusp-degrees) the birth time likely needs nudging.
 *     3. JOB-CHANGE TWO-PHASE TRANSITION CHECK — the specific "5th/9th end
 *        a job (12th-from-6th/10th), 2nd/6th/10th/11th deliver a NEW one"
 *        two-phase read: whether a running dasha lord's signified houses
 *        support ENDING a job only, or ENDING+REPLACING it, or neither.
 *     4. A thin guided 4-STEP WALKTHROUGH renderer that narrates Promise ->
 *        Mahadasha -> Antardasha -> Sun-Transit as one readable story for a
 *        chosen event (marriage / job-change / new-job / business), purely
 *        by calling Part 1's existing functions in sequence — no new chart
 *        math, just the missing "teach me the steps on THIS chart" layer.
 */

window.KP_PREDICTION_10 = {

    // ===================== 1. MOST POWERFUL PLANET FINDER =====================
    //
    // KP stellar rule: "a planet gives its OWN placement's result less, and
    // its Nakshatra Lord's placement result more." So to find which single
    // planet is the strongest all-round significator of a given house
    // (11th by default — the one house in the chart whose own results are
    // good AND whose negation, the 12th, is also good, per the source
    // teaching), scan every planet's Nakshatra Lord and see which one is
    // itself SITTING in that target house — read from the KP/Bhava-Chalit
    // chart, not the plain Lagna/Rashi chart, exactly as the source stresses.

    MOVABLE_SIGNS: [0, 3, 6, 9],   // Aries, Cancer, Libra, Capricorn (Chara)
    FIXED_SIGNS: [1, 4, 7, 10],    // Taurus, Leo, Scorpio, Aquarius (Sthira)
    DUAL_SIGNS: [2, 5, 8, 11],     // Gemini, Virgo, Sagittarius, Pisces (Dwiswabhava)

    _speedOfSign: function (sn) {
        if (this.MOVABLE_SIGNS.includes(sn)) return { modality: 'Chara (Movable)', speed: 'Fast — the result tends to arrive quickly once triggered.' };
        if (this.FIXED_SIGNS.includes(sn)) return { modality: 'Sthira (Fixed)', speed: 'Slow/delayed — the result takes longer to manifest, but is typically more durable once it does.' };
        return { modality: 'Dwiswabhava (Dual)', speed: 'Medium — neither fast nor delayed, a moderate pace.' };
    },

    /**
     * For every one of the 9 planets: its Nakshatra Lord (NL), and the KP/
     * Bhava-Chalit house that NL itself occupies — this is the house whose
     * result this planet delivers MOST STRONGLY (per the stellar rule),
     * which is often a different house from where the planet itself sits.
     */
    getPlanetPowerViaNL: function (ascSid, ascSignNum, natalPlanetsMap) {
        const KP = window.KP_PREDICTION;
        if (!KP || !natalPlanetsMap) return [];
        const bc = KP.getBhavaChalitPlacements(ascSid, ascSignNum, natalPlanetsMap);
        const bhavaHouseOf = {};
        (bc.placements || []).forEach(row => { bhavaHouseOf[row.planet] = row.bhavaHouse; });

        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const out = [];
        planets.forEach(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return;
            const kp = KP._getKPLords(pd.sid);
            const nl = kp.nakLord;
            const nlHouse = bhavaHouseOf[nl] !== undefined ? bhavaHouseOf[nl] : null;
            const ownHouse = bhavaHouseOf[p] !== undefined ? bhavaHouseOf[p] : pd.house;
            const speed = this._speedOfSign(pd.sn);
            out.push({ planet: p, ownHouse: ownHouse, nl: nl, nlHouse: nlHouse, ownSign: (KP.SIGN_NAMES || [])[pd.sn] || pd.sign, modality: speed.modality, speedNote: speed.speed });
        });
        return out;
    },

    /**
     * Which planet(s) deliver the TARGET house's result most strongly (its
     * NL sits there). Defaults to the 11th house — per the source teaching
     * the one house in KP whose own results (gains, fulfilment of desire,
     * friends/network) are good AND whose negation (the 12th, from which
     * it's the very next/11th-from house) is also favourable (undoing
     * hospitalization, jail, foreign exile, expenses).
     */
    findMostPowerfulPlanetForHouse: function (targetHouse, ascSid, ascSignNum, natalPlanetsMap) {
        const th = targetHouse || 11;
        const all = this.getPlanetPowerViaNL(ascSid, ascSignNum, natalPlanetsMap);
        const matches = all.filter(p => p.nlHouse === th);
        return { targetHouse: th, all: all, matches: matches };
    },

    renderMostPowerfulPlanet: function (data) {
        if (!data) return '';
        const rows = data.all.map(p => {
            const hit = p.nlHouse === data.targetHouse;
            return `<tr style="${hit ? 'background:rgba(255,215,0,.12);' : ''}">
                <td style="padding:4px 8px;font-weight:${hit ? 'bold' : 'normal'};color:${hit ? 'var(--gold)' : 'var(--text)'};">${p.planet}${hit ? ' ⭐' : ''}</td>
                <td style="padding:4px 8px;">H${p.ownHouse != null ? p.ownHouse : '?'}</td>
                <td style="padding:4px 8px;">${p.nl}</td>
                <td style="padding:4px 8px;">${p.nlHouse != null ? 'H' + p.nlHouse : '?'}</td>
                <td style="padding:4px 8px;font-size:8.5px;color:var(--muted);">${p.ownSign} — ${p.modality}</td>
            </tr>`;
        }).join('');

        const verdict = data.matches.length
            ? `<div style="margin-top:10px;padding:8px;border-left:3px solid var(--gold);background:rgba(255,215,0,.08);border-radius:4px;">
                 <b style="color:var(--gold);">Most Powerful Planet for House ${data.targetHouse}: ${data.matches.map(m => m.planet).join(', ')}</b>
                 <div style="font-size:8.8px;color:var(--text);opacity:.9;margin-top:3px;">${data.matches.map(m => `${m.planet}'s Nakshatra Lord (${m.nl}) sits in H${m.nlHouse} — so ${m.planet} delivers H${data.targetHouse}'s results (money, job, education, recovery, all-round good) most strongly. Its own sign is ${m.ownSign} (${m.modality}): ${m.speedNote}`).join('<br>')}</div>
               </div>`
            : `<div style="margin-top:10px;padding:8px;color:var(--muted);font-size:9px;">No planet's Nakshatra Lord sits exactly in House ${data.targetHouse} in this chart — no single "most powerful planet" for this house by this method; fall back to the general significator ranking (KP_PREDICTION.getFruitfulSignificators) instead.</div>`;

        return `<div class="biz-summary" style="border-color:var(--gold);background:rgba(255,215,0,0.03);margin-top:20px;border-radius:12px;">
            <h3 style="color:var(--gold);font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">⭐ Most Powerful Planet (House ${data.targetHouse} via Nakshatra-Lord Placement)</h3>
            <div style="font-size:9px;color:var(--muted);margin:8px 0;">KP stellar rule: a planet gives its OWN house's result less, and its Nakshatra Lord's placement result more. Table below is read from the KP/Bhava-Chalit chart (not the plain Lagna chart) — a planet's house can differ between the two.</div>
            <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
              <thead><tr style="color:var(--muted);text-align:left;border-bottom:1px solid rgba(255,255,255,.08);"><th style="padding:4px 8px;">Planet</th><th style="padding:4px 8px;">Own House</th><th style="padding:4px 8px;">Nakshatra Lord</th><th style="padding:4px 8px;">NL's House</th><th style="padding:4px 8px;">Speed</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            ${verdict}
        </div>`;
    },

    // ===================== 2. RULING-PLANETS BIRTH TIME VERIFICATION =====================
    //
    // A SECOND, independent BTR technique — complementary to (not a
    // replacement for) Part 2's 1-9 Connectivity Rule. Method taught:
    //   1. Take the Ruling Planets (RP) of the moment the chart is being
    //      read/judged: Ascendant sign lord, Moon sign lord, Moon Nakshatra
    //      lord, and the weekday (Day) lord, at THAT moment — not the
    //      birth moment. Caller supplies this list (the app already has a
    //      Ruling Planets calculator elsewhere; this function just consumes
    //      the result so it isn't duplicated here).
    //   2. Identify which house the querent's actual question is about (7th
    //      for marriage, 4th for education, 10th for profession, etc.) —
    //      the "primary house."
    //   3. Get that house's KP Sub-Lord. If the Sub-Lord is itself one of
    //      the Ruling Planets, the birth time is verified as correct for
    //      this reading — proceed as-is.
    //   4. If not, the birth time likely needs a small correction: step the
    //      Sub-Lord forward and backward one position along the fixed
    //      Vimshottari Sub-Lord cycle (Ketu-Venus-Sun-Moon-Mars-Rahu-
    //      Jupiter-Saturn-Mercury) and see which of the two neighbours IS a
    //      Ruling Planet — that tells you whether to nudge the birth time
    //      forward or backward (and re-check every other rule against the
    //      corrected chart once found).
    verifyBirthTimeViaRulingPlanets: function (primaryHouse, ascSid, ascSignNum, rulingPlanets) {
        const KP = window.KP_PREDICTION;
        if (!KP || !primaryHouse || !rulingPlanets || !rulingPlanets.length) return null;
        const cusps = KP.getAllCusps(ascSid);
        const cusp = cusps[primaryHouse];
        if (!cusp) return null;
        const subLord = cusp.subLord;
        const verified = rulingPlanets.includes(subLord);

        const seq = KP.DASHA_SEQ; // ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']
        const idx = seq.indexOf(subLord);
        const nextLord = idx >= 0 ? seq[(idx + 1) % seq.length] : null;
        const prevLord = idx >= 0 ? seq[(idx - 1 + seq.length) % seq.length] : null;
        const nextInRP = nextLord ? rulingPlanets.includes(nextLord) : false;
        const prevInRP = prevLord ? rulingPlanets.includes(prevLord) : false;

        let recommendation;
        if (verified) {
            recommendation = `Birth time verified for a "${primaryHouse === 7 ? 'marriage' : primaryHouse === 4 ? 'education' : primaryHouse === 10 ? 'profession' : 'House ' + primaryHouse}"-type reading — House ${primaryHouse}'s Sub-Lord (${subLord}) is itself a Ruling Planet. No time adjustment needed for this question.`;
        } else if (nextInRP && prevInRP) {
            recommendation = `House ${primaryHouse}'s Sub-Lord (${subLord}) is NOT a Ruling Planet — BOTH neighbours (${prevLord} before, ${nextLord} after) are Ruling Planets. Prefer whichever of the two is ranked earlier in your Ruling-Planets list, and nudge the birth time in that direction (earlier for ${prevLord}, later for ${nextLord}) minute by minute until that Sub-Lord becomes active, then re-verify.`;
        } else if (nextInRP) {
            recommendation = `House ${primaryHouse}'s Sub-Lord (${subLord}) is NOT a Ruling Planet — the NEXT Sub-Lord in the cycle, ${nextLord}, IS. Move the birth time slightly LATER until ${nextLord} becomes this house's Sub-Lord, then re-verify every other rule against the corrected chart.`;
        } else if (prevInRP) {
            recommendation = `House ${primaryHouse}'s Sub-Lord (${subLord}) is NOT a Ruling Planet — the PREVIOUS Sub-Lord in the cycle, ${prevLord}, IS. Move the birth time slightly EARLIER until ${prevLord} becomes this house's Sub-Lord, then re-verify every other rule against the corrected chart.`;
        } else {
            recommendation = `Neither immediate neighbour (${prevLord}, ${nextLord}) is a Ruling Planet either — step further along the cycle (Ketu→Venus→Sun→Moon→Mars→Rahu→Jupiter→Saturn→Mercury, wrapping around) in both directions until one is found; this indicates the time correction needed may be larger than a couple of minutes.`;
        }

        return { primaryHouse, subLord, rulingPlanets, verified, nextLord, prevLord, nextInRP, prevInRP, recommendation };
    },

    renderBirthTimeRulingPlanetsCheck: function (data) {
        if (!data) return '';
        const c = data.verified ? '#00DD77' : '#FF4477';
        return `<div class="biz-summary" style="border-color:${c};background:${c}0D;margin-top:20px;border-radius:12px;">
            <h3 style="color:${c};font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">🕰️ Birth Time Check — Ruling Planets Method (House ${data.primaryHouse})</h3>
            <div style="font-size:9px;color:var(--muted);margin:8px 0;">A second, independent BTR technique alongside the 1-9 Connectivity Rule elsewhere in this engine — run both; if they disagree, trust neither until reconciled.</div>
            <div style="font-size:9px;color:var(--text);">Ruling Planets: <b>${data.rulingPlanets.join(', ')}</b></div>
            <div style="font-size:9px;color:var(--text);margin-top:2px;">House ${data.primaryHouse} Sub-Lord: <b style="color:${c};">${data.subLord}</b> — ${data.verified ? 'IS' : 'is NOT'} a Ruling Planet.</div>
            <div style="margin-top:8px;padding:8px;border-left:3px solid ${c};background:${c}0D;border-radius:4px;font-size:8.8px;color:var(--text);opacity:.9;">${data.recommendation}</div>
        </div>`;
    },

    // ===================== 3. JOB-CHANGE TWO-PHASE TRANSITION CHECK =====================
    //
    // 6th and 10th houses GIVE a job. The house immediately BEHIND each
    // (12th-from) negates it: 5th negates the 6th's job, 9th negates the
    // 10th's job — so 5th/9th activation ENDS a job. Whether that ending is
    // a clean transition or an unemployment gap depends on whether the SAME
    // dasha-lord (or the very next one) also signifies the job-GIVING
    // houses (2, 6, 10, 11) — if yes, a new job follows quickly; if the
    // 5th/9th fire WITHOUT 2/6/10/11 support, expect a gap before the next
    // job.
    JOB_LOSS_HOUSES: [5, 9],
    JOB_GAIN_HOUSES: [2, 6, 10, 11],

    checkJobChangeWindow: function (dashaLord, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const KP = window.KP_PREDICTION;
        if (!KP || !dashaLord) return null;
        const signified = KP.getPlanetSignifiedHouses(dashaLord, KP.getAllCusps(ascSid), ascSid, ascSignNum, natalPlanetsMap, lords);
        const touchesLoss = this.JOB_LOSS_HOUSES.filter(h => signified.includes(h));
        const touchesGain = this.JOB_GAIN_HOUSES.filter(h => signified.includes(h));

        let verdict, detail;
        if (touchesLoss.length && touchesGain.length) {
            verdict = 'smooth-transition';
            detail = `${dashaLord} signifies both the job-ending houses (${touchesLoss.map(h => 'H' + h).join(', ')}) and job-giving houses (${touchesGain.map(h => 'H' + h).join(', ')}) — indicates the current job/role ends and a NEW one follows within the same period, a relatively smooth transition.`;
        } else if (touchesLoss.length) {
            verdict = 'loss-only';
            detail = `${dashaLord} signifies job-ending houses (${touchesLoss.map(h => 'H' + h).join(', ')}) but NOT the job-giving houses (2, 6, 10, 11) — indicates the current job/role ends, but a replacement is not indicated in this same period; expect a gap/unemployment stretch before the next job (check the following dasha/antardasha lord for when 2/6/10/11 activate).`;
        } else if (touchesGain.length) {
            verdict = 'gain-only';
            detail = `${dashaLord} signifies job-giving houses (${touchesGain.map(h => 'H' + h).join(', ')}) without touching the ending houses (5, 9) — indicates a new job/opportunity arriving without necessarily ending the current one (a promotion, a second offer, or the FIRST job if none is currently held).`;
        } else {
            verdict = 'neutral';
            detail = `${dashaLord} does not strongly signify either the job-ending (5, 9) or job-giving (2, 6, 10, 11) houses — this period is largely neutral for employment status.`;
        }
        return { dashaLord, signified, touchesLoss, touchesGain, verdict, detail };
    },

    renderJobChangeWindow: function (data) {
        if (!data) return '';
        const colorOf = { 'smooth-transition': '#00DD77', 'loss-only': '#FF4477', 'gain-only': '#00DD77', neutral: '#8888AA' };
        const c = colorOf[data.verdict] || '#8888AA';
        return `<div style="margin:6px 0;padding:8px;border-left:3px solid ${c};background:${c}0D;border-radius:4px;">
            <b style="font-size:9.5px;color:${c};">${data.dashaLord} Dasha — ${data.verdict.replace('-', ' ').toUpperCase()}</b>
            <div style="font-size:8.8px;color:var(--text);opacity:.9;margin-top:3px;line-height:1.45;">${data.detail}</div>
        </div>`;
    },

    // ===================== 4. GUIDED 4-STEP WALKTHROUGH =====================
    //
    // Pure narrative glue over Part 1's existing pipeline — no new chart
    // math. Step 1: Promise (checkEventPromise). Steps 2-3: Mahadasha /
    // Antardasha confirmation (getDashaConfirmation). Step 4: Sun transit
    // narrowing within the supportive window (searchTransitWindows, read
    // for its `sunOK` field — the source material gives Sun transit
    // special priority for pinning the month of an event).
    render4StepGuide: function (eventType, ascSid, ascSignNum, natalPlanetsMap, lords, dashaInfo) {
        const KP = window.KP_PREDICTION;
        if (!KP) return '';
        const steps = [];

        // Step 1 — Promise
        let promise = null;
        try { promise = KP.checkEventPromise(eventType, ascSid, natalPlanetsMap, lords); } catch (e) { /* noop */ }
        steps.push({
            n: 1, title: 'Promise of Event', color: promise && promise.promised ? '#00DD77' : '#FF4477',
            html: promise
                ? `<div style="font-size:9px;color:var(--text);">${promise.promised ? '✅ PROMISED' : '❌ NOT PROMISED'} — ${promise.reason || promise.result || ''}</div><div style="font-size:8.3px;color:var(--muted);margin-top:4px;">Without this promise, no dasha or transit can force the event — always check this FIRST, before timing.</div>`
                : `<div style="font-size:9px;color:var(--muted);">Promise check unavailable for event type "${eventType}".</div>`
        });

        // Steps 2-3 — Mahadasha / Antardasha confirmation
        let confirmation = null;
        if (dashaInfo) { try { confirmation = KP.getDashaConfirmation(dashaInfo, ascSid, ascSignNum, natalPlanetsMap, lords); } catch (e) { /* noop */ } }
        steps.push({
            n: 2, title: 'Mahadasha — Which Big Period?', color: 'var(--gold)',
            html: confirmation && confirmation.levels[0] ? `<div style="font-size:9px;color:var(--text);">Running Mahadasha lord: <b>${confirmation.levels[0].lord}</b> — signifies H${confirmation.levels[0].totalSignified.join(', H') || '—'}.</div>` : `<div style="font-size:9px;color:var(--muted);">No running Mahadasha data supplied.</div>`
        });
        steps.push({
            n: 3, title: 'Antardasha — Which Smaller Window?', color: 'var(--gold)',
            html: confirmation && confirmation.levels[1] ? `<div style="font-size:9px;color:var(--text);">Running Antardasha lord: <b>${confirmation.levels[1].lord}</b> — signifies H${confirmation.levels[1].totalSignified.join(', H') || '—'}.</div><div style="font-size:8.3px;margin-top:4px;color:${confirmation.verdict.includes('SURE') || confirmation.verdict.includes('STRONG') ? '#00DD77' : confirmation.verdict.includes('PARTIAL') ? '#FFD700' : '#FF4477'};"><b>Verdict: ${confirmation.verdict}</b></div>` : `<div style="font-size:9px;color:var(--muted);">No running Antardasha data supplied.</div>`
        });

        // Step 4 — Sun transit (month-level narrowing)
        steps.push({
            n: 4, title: 'Sun Transit — Which Month?', color: '#FFD700',
            html: `<div style="font-size:9px;color:var(--text);">Within the supportive Antardasha window above, scan the Sun's monthly sign transit (KP_PREDICTION.searchTransitWindows('${eventType}', ascSignNum, adStart, adEnd, getPosFn, 30)) and read each candidate's <code>sunOK</code> flag — the source teaching gives the Sun transit special priority for pinning the specific month, ahead of Moon (day-level) or Jupiter (year-level) alone.</div>`
        });

        const nav = steps.map(s => `<span style="display:inline-block;margin:2px 6px 2px 0;padding:3px 9px;border-radius:12px;background:rgba(255,215,0,.1);color:var(--gold);font-size:9px;font-weight:bold;">Step ${s.n}: ${s.title}</span>`).join('');
        const body = steps.map(s => `<div style="margin:6px 0;padding:8px;border-left:3px solid ${s.color};background:${s.color}0D;border-radius:4px;">${s.html}</div>`).join('');

        return `<div class="biz-summary" style="border-color:var(--gold);background:rgba(255,215,0,0.03);margin-top:20px;border-radius:12px;">
            <h3 style="color:var(--gold);font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">🪜 4-Step Prediction Method — ${eventType.replace(/_/g, ' ')}</h3>
            <div style="padding:6px 0 10px;">${nav}</div>
            ${body}
        </div>`;
    },

    // ===================== 4B. SIGNIFICATOR PLANET — 4-LEVEL METHOD, WITH REASONING =====================
    //
    // Reuses KP_PREDICTION.getFruitfulSignificators() / getSignificators()
    // (Part 1) for the actual derivation — nothing re-derived here — but
    // turns the raw levels into an explicit, readable REASONING chain plus
    // a ranked RESULT, matching the classical 4-level method taught:
    //   Level A — planets OCCUPYING the house (direct significators)
    //   Level B — planets in the NAKSHATRA (star) of a Level-A planet
    //   Level C — the house's OWNER (sign lord)
    //   Level D — planets in the NAKSHATRA (star) of the Level-C owner
    // ...then the Fruitful-Significator refinement: among all of the
    // above, an UNTENANTED planet (occupies no house's worth of baggage of
    // its own) is the TRUE fruitful significator; a Tenanted one is a
    // weaker, dependent significator.
    findSignificatorWithReasoning: function (houseNum, ascSid, ascSignNum, natalPlanetsMap, lords) {
        const KP = window.KP_PREDICTION;
        if (!KP || !natalPlanetsMap) return null;
        const data = KP.getFruitfulSignificators(houseNum, natalPlanetsMap, ascSignNum, lords);
        const sig = data.significators;

        const steps = [];
        steps.push({
            level: 'A', title: 'Occupants of House ' + houseNum,
            planets: sig.level1_occupants,
            reasoning: sig.level1_occupants.length
                ? `${sig.level1_occupants.join(', ')} physically sit in House ${houseNum} — each directly signifies it (a planet always signifies the house it occupies).`
                : `No planet occupies House ${houseNum} — this level contributes no significator; the house leans on its owner and star-lord chains instead (Levels C/D below).`
        });
        steps.push({
            level: 'B', title: 'Star Lords of the Occupants',
            planets: sig.level2_starLordOfOccupants,
            reasoning: sig.level2_starLordOfOccupants.length
                ? `${sig.level2_starLordOfOccupants.join(', ')} — each is the Nakshatra (star) Lord of a Level-A occupant, so each delivers that occupant's result and therefore also signifies House ${houseNum}.`
                : `No Level-A occupants, so no star-lord chain to follow at this level.`
        });
        steps.push({
            level: 'C', title: 'Owner (Sign Lord) of House ' + houseNum,
            planets: sig.level3_houseLord ? [sig.level3_houseLord] : [],
            reasoning: sig.level3_houseLord
                ? `${sig.level3_houseLord} owns (is the Rashi Swami of) House ${houseNum}'s sign — ownership itself is a direct, always-present significator line.`
                : `House ${houseNum}'s owner could not be resolved.`
        });
        steps.push({
            level: 'D', title: 'Star Lord of the Owner',
            planets: sig.level4_starLordOfHouseLord ? [sig.level4_starLordOfHouseLord] : [],
            reasoning: sig.level4_starLordOfHouseLord
                ? `${sig.level4_starLordOfHouseLord} is the Nakshatra Lord of ${sig.level3_houseLord} (the owner) — it delivers the owner's result, extending the ownership significance one level further.`
                : `Owner's star lord could not be resolved.`
        });

        // Ranking: a planet appearing at MORE levels is a stronger
        // significator (classical KP ranking order is A+B > C+D, but any
        // planet hitting multiple levels outranks one hitting only one).
        const tally = {};
        steps.forEach(s => s.planets.forEach(p => { tally[p] = (tally[p] || 0) + 1; }));
        const rankedAll = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);

        const fruitfulNames = data.fruitfulSignificators.map(f => f.planet);
        const finalResult = fruitfulNames.length ? fruitfulNames : rankedAll;

        return {
            house: houseNum, steps: steps, rankedAll: rankedAll, tally: tally,
            fruitful: data.fruitfulSignificators, supplementary: data.supplementarySignificators,
            finalResult: finalResult
        };
    },

    renderSignificatorStep: function (data) {
        if (!data) return '<div style="font-size:9px;color:var(--muted);">Significator data unavailable.</div>';
        const levelRows = data.steps.map(s => `
            <div style="margin:5px 0;padding:6px 8px;border-left:3px solid #66CCFF;background:rgba(102,204,255,.06);border-radius:4px;">
              <b style="font-size:9px;color:#66CCFF;">Level ${s.level} — ${s.title}${s.planets.length ? ': ' + s.planets.join(', ') : ''}</b>
              <div style="font-size:8.5px;color:var(--text);opacity:.85;margin-top:2px;">${s.reasoning}</div>
            </div>`).join('');

        const fruitfulRows = data.fruitful.length
            ? data.fruitful.map(f => `<div style="font-size:8.5px;color:#00DD77;margin:2px 0;">✓ ${f.reason}</div>`).join('')
            : `<div style="font-size:8.5px;color:var(--muted);">No Untenanted planet among the significators — using the full ranked list below instead.</div>`;
        const suppRows = data.supplementary.length
            ? data.supplementary.map(f => `<div style="font-size:8.3px;color:var(--muted);margin:2px 0;">• ${f.reason}</div>`).join('') : '';

        return `
            ${levelRows}
            <div style="margin-top:8px;padding:8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.06);border-radius:4px;">
              <b style="font-size:9.5px;color:#00DD77;">Fruitful-Significator Refinement (Untenanted-planet rule)</b>
              <div style="margin-top:3px;">${fruitfulRows}${suppRows}</div>
            </div>
            <div style="margin-top:8px;padding:8px;border-left:3px solid var(--gold);background:rgba(255,215,0,.08);border-radius:4px;">
              <b style="color:var(--gold);">RESULT — Significator Planet(s) for House ${data.house}: ${data.finalResult.join(', ') || '—'}</b>
              <div style="font-size:8.3px;color:var(--muted);margin-top:2px;">Full ranked list (by how many of the 4 levels each planet appears in): ${data.rankedAll.map(p => `${p}(${data.tally[p]})`).join(', ') || '—'}.</div>
            </div>`;
    },

    // ===================== 4C. SUN + MOON TRANSIT — TWO-PHASE NARROWING =====================
    //
    // Classical two-phase gochar narrowing: the SUN pins the MONTH (it
    // holds one sign for ~30 days), then — only WITHIN that best month —
    // the MOON pins the DAY (it holds one sign for ~2.25 days). Kept
    // separate from KP_PREDICTION.searchTransitWindows() (Part 1), which
    // samples Jupiter/Sun/Moon together at one coarse step and therefore
    // undersamples the Moon; this does a proper two-resolution scan.
    _touchesHouse: function (house, targetHouses) {
        if (targetHouses.includes(house)) return true;
        const seventh = ((house + 6 - 1) % 12) + 1; // universal 7th aspect
        return targetHouses.includes(seventh);
    },
    searchSunMoonWindow: function (targetHouses, ascSignNum, fromDate, toDate, getPosFn) {
        if (!targetHouses || !targetHouses.length || typeof getPosFn !== 'function') return [];
        const monthHits = [];
        for (let t = fromDate.getTime(); t <= toDate.getTime(); t += 30 * 86400000) {
            const d = new Date(t);
            let pos; try { pos = getPosFn(d); } catch (e) { continue; }
            if (!pos || !pos.Sun) continue;
            const sunHouse = ((pos.Sun.sn - ascSignNum + 12) % 12) + 1;
            if (this._touchesHouse(sunHouse, targetHouses)) monthHits.push({ date: d, sunHouse: sunHouse });
        }
        return monthHits.map(mh => {
            const monthStart = mh.date.getTime();
            const monthEnd = Math.min(monthStart + 30 * 86400000, toDate.getTime());
            const dayHits = [];
            for (let t = monthStart; t <= monthEnd; t += 86400000) {
                const d = new Date(t);
                let pos; try { pos = getPosFn(d); } catch (e) { continue; }
                if (!pos || !pos.Moon) continue;
                const moonHouse = ((pos.Moon.sn - ascSignNum + 12) % 12) + 1;
                if (this._touchesHouse(moonHouse, targetHouses)) dayHits.push({ date: d, moonHouse: moonHouse });
            }
            return { sunMonth: mh.date, sunHouse: mh.sunHouse, moonDayHits: dayHits };
        });
    },

    renderSunMoonWindow: function (windows, targetHouses) {
        if (!windows) return '<div style="font-size:9px;color:var(--muted);">Sun/Moon transit scan unavailable (no getPosFn / date range supplied).</div>';
        if (!windows.length) return `<div style="font-size:9px;color:var(--muted);">No month in the searched range has the Sun touching H${targetHouses.join(', H')} (directly or by 7th aspect) — widen the search range.</div>`;
        const rows = windows.slice(0, 3).map(w => {
            const days = w.moonDayHits.slice(0, 6).map(dh => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 7px;border-radius:10px;background:rgba(0,221,119,.12);color:#00DD77;font-size:8.5px;">${dh.date.toDateString()} (Moon in H${dh.moonHouse})</span>`).join('') || '<span style="font-size:8.3px;color:var(--muted);">No Moon-touch day found within this Sun-month — check the adjoining month.</span>';
            return `<div style="margin:6px 0;padding:8px;border-left:3px solid #FFD700;background:rgba(255,215,0,.06);border-radius:4px;">
                <b style="font-size:9px;color:#FFD700;">Sun transits H${w.sunHouse} around ${w.sunMonth.toDateString()} (candidate MONTH)</b>
                <div style="margin-top:4px;">${days}</div>
              </div>`;
        }).join('');
        return `<div style="font-size:8.8px;color:var(--muted);margin-bottom:4px;">Step A — Sun pins the month (holds one sign ~30 days). Step B — within that month, the Moon (holds one sign ~2.25 days) pins the candidate day(s) below.</div>${rows}`;
    },

    // ===================== 4D. THE FULL 5-STEP SIGNIFICATOR-TO-EVENT METHOD =====================
    //
    // 1) Find the Significator Planet(s) for the event's primary house
    //    (4-level method + Fruitful/Untenanted rule, with reasoning).
    // 2) Promise — checkEventPromise() on that same house (CSL / L1-L2 /
    //    Golden-Rule), with its own reasoning + result already built in.
    // 3) Mahadasha — does the running MD lord's total significations
    //    (ownership + CSL + star-lord involvement/confirmation) include the
    //    event's houses? (getDashaConfirmation level 0)
    // 4) Antardasha + Pratyantardasha — same check one and two levels
    //    deeper (getDashaConfirmation levels 1 and 2), which is what
    //    actually narrows WHEN within the Mahadasha.
    // 5) Sun transit (month) then Moon transit (day) — searchSunMoonWindow()
    //    above, run inside the Antardasha/Pratyantardasha window found to
    //    be supportive in Step 4 — to FIX the exact date.
    render5StepSignificatorMethod: function (eventType, ascSid, ascSignNum, natalPlanetsMap, lords, dashaInfo, getPosFn) {
        const KP = window.KP_PREDICTION;
        if (!KP) return '';
        const ev = KP.EVENT_PRIME_HOUSES[eventType];
        if (!ev) return `<div style="padding:12px;color:var(--muted);">Unknown event type "${eventType}".</div>`;
        const primeHouse = ev.prime[0];
        const targetHouses = ev.prime.concat(ev.supporting || []);
        const steps = [];

        // STEP 1 — Significator
        let sigData = null;
        try { sigData = this.findSignificatorWithReasoning(primeHouse, ascSid, ascSignNum, natalPlanetsMap, lords); } catch (e) { console.error('STEP1 sig', e); }
        steps.push({ n: 1, title: `Find the Significator Planet (House ${primeHouse})`, color: '#66CCFF', html: this.renderSignificatorStep(sigData) });

        // STEP 2 — Promise
        let promise = null;
        try { promise = KP.checkEventPromise(eventType, ascSid, natalPlanetsMap, lords); } catch (e) { console.error('STEP2 promise', e); }
        steps.push({
            n: 2, title: 'Promise of the Event', color: promise && promise.promised ? '#00DD77' : '#FF4477',
            html: promise
                ? `<div style="font-size:9px;color:var(--text);"><b>${promise.strength.toUpperCase()}</b></div><div style="font-size:8.5px;color:var(--muted);margin-top:3px;"><b>Reasoning:</b> ${promise.method}</div><div style="font-size:8.8px;color:var(--text);margin-top:4px;"><b>Result:</b> ${promise.result}</div>`
                : `<div style="font-size:9px;color:var(--muted);">Promise check unavailable for "${eventType}".</div>`
        });

        // STEPS 3-4 — Mahadasha / Antardasha / Pratyantardasha
        let conf = null;
        if (dashaInfo) { try { conf = KP.getDashaConfirmation(dashaInfo, ascSid, ascSignNum, natalPlanetsMap, lords); } catch (e) { console.error('STEP3-4 conf', e); } }
        const levelHtml = (lv) => {
            if (!lv) return `<div style="font-size:9px;color:var(--muted);">No period data supplied for this level.</div>`;
            const hit = lv.totalSignified.some(h => targetHouses.includes(h));
            const hitHouses = lv.totalSignified.filter(h => targetHouses.includes(h));
            return `<div style="font-size:9px;color:var(--text);"><b>${lv.lord}</b> (${lv.start ? new Date(lv.start).toDateString() : '?'} → ${lv.end ? new Date(lv.end).toDateString() : '?'})</div>
                <div style="font-size:8.3px;color:var(--muted);margin-top:2px;"><b>Reasoning:</b> owns H${lv.ownsHouses.join(',H') || '—'}; CSL numbers H${lv.cslNumbers.join(',H') || '—'}; star lord ${lv.nakLord||'—'} (involvement H${lv.involvementHouses.join(',H') || '—'}); sub lord ${lv.subLord||'—'} (confirmation H${lv.confirmationHouses.join(',H') || '—'}). Combined: H${lv.totalSignified.join(',H') || '—'}.</div>
                <div style="font-size:8.8px;margin-top:4px;color:${hit ? '#00DD77' : '#FF4477'};"><b>Result:</b> ${hit ? `SUPPORTS the event — touches target house(s) H${hitHouses.join(',H')}.` : `Does NOT clearly touch the event's target houses (H${targetHouses.join(',H')}) — weak/no support from this period.`}</div>`;
        };
        steps.push({ n: 3, title: 'Mahadasha — Which Big Period?', color: 'var(--gold)', html: conf && conf.levels[0] ? levelHtml(conf.levels[0]) : `<div style="font-size:9px;color:var(--muted);">No running Mahadasha data supplied.</div>` });
        steps.push({
            n: 4, title: 'Antardasha + Pratyantardasha — Which Window?', color: 'var(--gold)',
            html: (conf && (conf.levels[1] || conf.levels[2]))
                ? `<div style="margin-bottom:8px;"><b style="font-size:8.8px;color:var(--muted);">Antardasha:</b>${levelHtml(conf.levels[1])}</div><div><b style="font-size:8.8px;color:var(--muted);">Pratyantardasha:</b>${levelHtml(conf.levels[2])}</div><div style="margin-top:6px;font-size:9px;font-weight:bold;color:${conf.verdict.includes('SURE') ? '#00DD77' : conf.verdict.includes('STRONG') || conf.verdict.includes('PARTIAL') ? '#FFD700' : '#FF4477'};">Overall Dasha Verdict: ${conf.verdict}</div>`
                : `<div style="font-size:9px;color:var(--muted);">No running Antardasha/Pratyantardasha data supplied.</div>`
        });

        // STEP 5 — Sun + Moon transit, searched inside the supportive AD/PD window if we have one.
        let sunMoonHtml = `<div style="font-size:9px;color:var(--muted);">Supply getPosFn and a running Antardasha/Pratyantardasha window (with start/end dates) to run this step.</div>`;
        if (typeof getPosFn === 'function' && conf) {
            const win = conf.levels[2] || conf.levels[1] || conf.levels[0];
            if (win && win.start && win.end) {
                try {
                    const windows = this.searchSunMoonWindow(targetHouses, ascSignNum, new Date(win.start), new Date(win.end), getPosFn);
                    sunMoonHtml = this.renderSunMoonWindow(windows, targetHouses);
                } catch (e) { console.error('STEP5 sunmoon', e); }
            }
        }
        steps.push({ n: 5, title: 'Sun Transit (Month) → Moon Transit (Day) — Fix the Event', color: '#FFD700', html: sunMoonHtml });

        const nav = steps.map(s => `<span style="display:inline-block;margin:2px 6px 2px 0;padding:3px 9px;border-radius:12px;background:rgba(255,215,0,.1);color:var(--gold);font-size:9px;font-weight:bold;">Step ${s.n}: ${s.title}</span>`).join('');
        const body = steps.map(s => `<div style="margin:8px 0;padding:8px;border-left:3px solid ${s.color};background:${s.color}0D;border-radius:4px;"><b style="font-size:9.5px;color:${s.color};">Step ${s.n} — ${s.title}</b><div style="margin-top:4px;">${s.html}</div></div>`).join('');

        return `<div class="biz-summary" style="border-color:var(--gold);background:rgba(255,215,0,0.03);margin-top:20px;border-radius:12px;">
            <h3 style="color:var(--gold);font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">🪜 5-Step Significator-to-Event Method — ${eventType.replace(/_/g, ' ')}</h3>
            <div style="padding:6px 0 10px;">${nav}</div>
            ${body}
        </div>`;
    },

    // ===================== 5. PANEL ENTRY POINT (matches Parts 7/8/9's ctx interface) =====================
    //
    // Same calling convention as KP_PREDICTION_7/8/9.renderForPanel(ctx) —
    // wired into main.js's Dasha Explorer panel alongside them. Renders the
    // two chart-general pieces that don't need a specific event type picked
    // by the caller (Most Powerful Planet for H11, and a Job-Change read for
    // the currently running Mahadasha). The event-specific pieces —
    // render4StepGuide(eventType, ...) for marriage/job/business, and
    // verifyBirthTimeViaRulingPlanets(primaryHouse, ..., rulingPlanets) —
    // need a caller-supplied event type / Ruling-Planets list respectively,
    // so they stay directly callable functions for panels that have that
    // context (e.g. the marriage panel, or a dedicated chart-verification
    // flow) rather than being force-fit in here.
    renderForPanel: function (ctx) {
        if (!ctx || !ctx.natalPlanets || !ctx.natalAsc) return '';
        try {
            const ascSid = (ctx.natalAsc.sn * 30) + (parseFloat(ctx.natalAsc.deg) || 0);
            const ascSignNum = ctx.natalAsc.sn;
            let html = '';

            const mp = this.findMostPowerfulPlanetForHouse(11, ascSid, ascSignNum, ctx.natalPlanets);
            html += this.renderMostPowerfulPlanet(mp);

            if (ctx.mahaLord) {
                const jc = this.checkJobChangeWindow(ctx.mahaLord, ascSid, ascSignNum, ctx.natalPlanets, (typeof LORDS !== 'undefined') ? LORDS : null);
                if (jc) {
                    html += `<div class="biz-summary" style="border-color:#8888AA;background:rgba(136,136,170,0.03);margin-top:20px;border-radius:12px;">
                        <h3 style="color:#8888AA;font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">💼 Job-Change Read — Current Mahadasha</h3>
                        <div style="font-size:9px;color:var(--muted);margin:8px 0;">5th/9th (12th-from-6th/10th) end a job; 2nd/6th/10th/11th give one. Whether ${ctx.mahaLord}'s Mahadasha touches one, both, or neither determines a smooth transition vs. a gap.</div>
                        ${this.renderJobChangeWindow(jc)}
                    </div>`;
                }
            }
            return html;
        } catch (e) { console.error('KP Part 10 renderForPanel failed:', e); return ''; }
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.KP_PREDICTION_10;