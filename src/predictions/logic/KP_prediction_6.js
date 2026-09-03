/**
 * KP_prediction_6.js
 *
 * PART 6 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-5 — reuses window.KP_PREDICTION (Part 1).
 * Sources: "Wealth in Astrology" (धन-भाव 2nd CSL, Rahul Kaushik) and
 * "Profession — KP Astrology" (10th CSL, Rahul Kaushik).
 *
 * Checked first against Part 1's existing IMPORTANCE_OF_2ND_CSL-style
 * content (added back in Part 2 as SECOND_CSL_WEALTH_SOURCE, houses
 * 4-9 only) and Part 1's CAREER_TYPE_BY_HOUSE (10th CSL, 8 houses) —
 * both existed but were PARTIAL. This module replaces them with the
 * FULL 12-house version for 2nd CSL and adds the missing profession
 * houses/case-studies for 10th CSL, rather than duplicating what's
 * already correct.
 *
 * ============================ NEW CONTENT ===========================
 *
 * 1. FULL 12-HOUSE 2nd CSL WEALTH TABLE — Part 2's SECOND_CSL_WEALTH_SOURCE
 *    only covered houses 4-9. This adds 1,2,3,10,11,12 (the "Golden Rule"
 *    self-house-strengthening principle, the 5th-house counsellor/
 *    blessing-giver finding, the 10th-house "best possible placement"
 *    result, the 11th-house social-circle-as-income-source result, and
 *    the 12th-house FD/investment "utilization" remedy) — genuinely
 *    missing from the earlier partial table.
 *
 * 2. FULL 10th CSL PROFESSION TABLE WITH ALIGNMENT TECHNIQUE — extends
 *    Part 1's CAREER_TYPE_BY_HOUSE with the 2-8 family-business-loss
 *    Alignment/Utilization Technique (turn the family structure into an
 *    8th-house manufacturing venture to convert the same combination
 *    from loss into growth), the 9+12 foreign-consultancy combination,
 *    the modern 8th-house "commission/dropshipping" business-model
 *    reading, the 8th-house funding/investment timing rule (needs 8th
 *    joined with 2nd or 11th in the active Dasha/Antardasha), and the
 *    worked "Vikas Kumar" case study (10th CSL Mercury/3,1 with Star
 *    Lord Saturn/7,8,9 → job unlikely at/near hometown, business
 *    recommended far from hometown instead).
 *
 * 3. DIAGNOSTIC Q&A METHOD for 9th-house-dominant 10th CSL charts (ask
 *    "Are you a consultant?" first, "Do you train others?" second).
 */

window.KP_PREDICTION_6 = {

    _p1: function () { return window.KP_PREDICTION || null; },


    // ================================================================
    // 1. 2nd CSL — FULL 12-HOUSE WEALTH TABLE
    // ================================================================

    SECOND_CSL_FULL_WEALTH_TABLE: {
        1: { source: 'Self-effort (आत्म-प्रयास) — the native creates wealth opportunities directly through personal initiative.', stability: 'Depends entirely on continued personal effort.' },
        2: { source: '"Golden Rule" self-strengthening — 2nd CSL sitting in its OWN house (2nd) automatically fortifies that house.', stability: 'Exceptionally strong, stable bank balance/financial position.' },
        3: { source: 'Commission, short travel, marketing, digital activity, communication.', stability: 'Reliable income through these specific channels.' },
        4: { source: 'Landed property, real estate.', stability: 'Rental income common with this placement; strong pull toward reinvesting savings into property.' },
        5: { source: 'Speculation, acting, giving solutions/advice, creativity, cinema.', stability: 'Classically a "negative" house for steady finance, yet these specific creative/speculative channels can deliver income. Special finding: if the 2nd CSL\'s Star Lord shows the 5th house, the native can become an excellent counsellor or "blessing-giver" (fakir/guru-type figure) — 2nd=speech, 5th=fulfilling the client\'s desire (11th-from-7th).' },
        6: { source: 'Service/job, or payment earned in exchange for a product/service.', stability: 'The SINGLE MOST POWERFUL financial combination — often stronger even than 2 or 11, since the client (7th house) pays via the 6th (7th-from-7th-is-1st, but payment itself is a 6th-house/debt-clearing act).' },
        7: { source: 'Business, partnership.', stability: 'Also the marriage house — business partnerships prosper under this placement.' },
        8: { source: 'Ancestral/inherited wealth.', stability: 'Found in the charts of those born into already-wealthy/royal families — wealth received without direct personal labour.' },
        9: { source: 'Counselling fees, father, guru, long-distance travel.', stability: 'Consultancy fees, guru-dakshina-type income.' },
        10: { source: 'Profession/karma.', stability: 'THE BEST possible placement for the 2nd CSL — money and status/respect grow together, at the same pace as the career itself.' },
        11: { source: 'Social circle.', stability: 'Highly desirable — the native\'s social activity itself becomes the income source.' },
        12: { source: 'Expenditure/investment.', stability: 'Looks negative in isolation, but the "Utilization" remedy applies: voluntarily moving savings into an FD/investment sends the planet the "expenditure has been satisfied" signal and balances the negative effect (see Remedies below).' }
    },

    /** Special conjunction rule: 2nd CSL landing on a 4-type (quadrupedal/fixed-heavy) combination indicates abundant real estate/land holdings PLUS social prestige (e.g. a village's biggest landowner) — prestige and land matter more here than raw cash. */
    checkFourfoldLandCombination: function (houseNumbers) {
        const hit = [4].filter(h => houseNumbers.includes(h));
        return { hit: hit.length > 0, note: hit.length > 0 ? 'The 4th house is prominent in this 2nd CSL script — abundant real estate/land holdings with accompanying social prestige is indicated (the "biggest landowner" pattern), more a matter of prestige+land than pure liquid wealth.' : 'No specific 4th-house land/prestige combination detected.' };
    },

    getSecondCSLFullWealthAnalysis: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const resolved = P1.resolveDeterminingPlanetPrecise(2, allCusps, natalPlanetsMap);
        if (!resolved) return null;
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const numbers = planetNumbers[resolved.determiningPlanet] || [];
        const matches = numbers.filter(h => this.SECOND_CSL_FULL_WEALTH_TABLE[h]).map(h => Object.assign({ house: h }, this.SECOND_CSL_FULL_WEALTH_TABLE[h]));
        const moneyHouses = [2, 6, 11];
        const moneyHit = moneyHouses.filter(h => numbers.includes(h));
        const goldenRuleActive = allCusps[2] && allCusps[2].subLord === resolved.determiningPlanet && numbers.includes(2);
        const fourfoldLand = this.checkFourfoldLandCombination(numbers);
        return {
            csl: allCusps[2].subLord, determiningPlanet: resolved.determiningPlanet, numbers: numbers,
            matches: matches, moneyHit: moneyHit, goldenRuleActive: goldenRuleActive, fourfoldLand: fourfoldLand,
            note: moneyHit.length >= 2
                ? `Strong 2-6-11 money combination present (H${moneyHit.join(',H')}) — exceptional financial strength expected, relative to the native's environment.`
                : `2-6-11 combination only partially present (H${moneyHit.join(',H') || 'none'}) — wealth will flow more specifically through the house-matched channels above rather than broad-based abundance.`
        };
    },

    /** The ethical warning from the source material — apply this note whenever rendering ANY negative wealth/health/longevity finding. */
    NEGATIVE_PREDICTION_ETHICS_NOTE: 'A negative prediction almost always fructifies, while a positive prediction fructifying is never guaranteed — so an astrologer must never deliver findings about loss, poverty, or short life insensitively. Being "technically correct" does not make delivering it that way desirable for the person receiving it.',

    renderSecondCSLFullWealth: function (data) {
        if (!data) return '';
        const rows = (data.matches || []).map(m => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #B2FF66;background:rgba(178,255,102,.08);"><b>H${m.house}:</b> ${m.source}<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">${m.stability}</div></div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid #B2FF66;">
            <div class="pred-title" style="color:#B2FF66;">🏦 2nd CSL — Full 12-House Wealth Analysis</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">2nd CSL: ${data.csl} → determining planet ${data.determiningPlanet} → H${data.numbers.join(',H') || '—'}</div>
            ${data.goldenRuleActive ? `<div style="margin-bottom:4px;padding:4px 8px;border-left:3px solid #FFD700;background:rgba(255,215,0,.08);"><b>Golden Rule active:</b> 2nd CSL sits in its own house — exceptionally strong bank balance/financial position.</div>` : ''}
            ${rows}
            ${data.fourfoldLand.hit ? `<div style="margin-top:4px;font-size:9px;color:var(--muted);">${data.fourfoldLand.note}</div>` : ''}
            <div style="margin-top:6px;font-size:8.5px;color:var(--muted);">${data.note}</div>
          </div>`;
    },


    // ================================================================
    // 2. 10th CSL — PROFESSION TABLE WITH ALIGNMENT TECHNIQUE
    // ================================================================

    TENTH_CSL_ALLOWED_PROFESSION: {
        2: { profession: 'Family business — banking, jewellery.', note: 'If the 8th house ALSO shows (a 2-8 combination), the family business risks loss/trouble — see the Alignment Technique below.' },
        3: { profession: 'Commission agency, online activity, digital marketing.', note: '"The 3rd house IS data" — no better single word describes it; the coming decade is thoroughly data-centric.' },
        4: { profession: 'Vastu consultancy.', note: 'NOT suited to giving astrological remedies/tantra directly (4th negates 5th), but excellent for delivering Vastu solutions specifically.' },
        6: { profession: 'Job/service.', note: 'Excellent combination for direct employment.' },
        7: { profession: 'Trading, business partnership.', note: 'Excellent.' },
        8: { profession: 'Manufacturing, insurance, or any business built on OTHER people\'s resources (commission/dropshipping-style models).', note: 'Excellent — see the "modern 8th house" theory below.' },
        9: { profession: 'Consultancy, training delivery.', note: 'Always consider "consultancy" as the first hypothesis to test.' },
        10: { profession: 'Administrative work.', note: 'Good.' },
        11: { profession: 'Cooperative society.', note: 'Excellent — but if the 10th house is ALSO active, a government link/subsidy connection is required; if the 12th is ALSO active, the venture should be based away from the native\'s hometown.' }
    },

    TENTH_CSL_NINTH_PLUS_TWELFTH: {
        profession: 'Consultancy work in a foreign or distant location.',
        note: 'Worked example: a native born in Bengal only found career stability once permanently settled in Uttarakhand (a distant location) and starting a consultancy practice there.'
    },

    /** Modern reading of the 8th house: money earned through a mechanism/system that isn't the native's own direct labour or own product. */
    EIGHTH_HOUSE_MODERN_THEORY: {
        summary: 'The 8th house is described as both "begging" and "the string/mechanism" — wealth that doesn\'t require direct personal labour, but flows through someone else\'s resource or system.',
        modernExample: 'If BOTH the 3rd house (digital/online) and 8th house are active, the native can list someone ELSE\'s product on their own online platform and earn margin purely through the mechanism/system — without manufacturing anything themselves (the same model any e-commerce marketplace runs on someone else\'s inventory).',
        historicalIllustration: 'The (real, historical) story of the con-man who "sold" the Taj Mahal is cited as the extreme illustration of 8th-house energy: profiting by "selling" something that was never truly one\'s own.',
        fundingRule: 'Angel-investor/crowdfunding capital is an 8th-house matter (it is the investor\'s money, not the native\'s own labour). Timing rule: funding actually arrives in whichever Dasha/Antardasha brings the 8th house together with the 2nd (wealth) or 11th (gains) house — attempting to raise funds before that specific period arrives has a much lower success rate.'
    },

    /** Alignment/Utilization Technique: a 2-8 combination on the 10th CSL (family business + loss) is resolved by converting the SAME family structure into an 8th-house-type venture (manufacturing) rather than abandoning the family business. */
    getAlignmentTechniqueFor2And8: function (houseNumbers) {
        const has2 = houseNumbers.includes(2), has8 = houseNumbers.includes(8);
        if (has2 && has8) {
            return {
                triggered: true,
                note: 'The 10th CSL/Star Lord shows a 2-8 combination (family business + loss/trouble). ALIGNMENT TECHNIQUE: rather than continuing the family business in its ordinary form, convert the same family-based structure into an 8th-house-type activity — specifically MANUFACTURING/a factory. The identical 2-8 combination that was causing loss then starts delivering growth through family participation in manufacturing instead.',
                verification: 'Verification method ("reverse engineering"): check the charts of people whose actual family manufacturing business IS successful — they should show this same 2nd-8th combination on their 10th CSL. If they do, the principle is confirmed for that chart type.',
                caveat: 'This only works reliably with a fully accurate birth time — even a 5-6 minute error can shift the whole combination (and therefore the recommendation).'
            };
        }
        return { triggered: false, note: 'No 2-8 combination detected on this chain — the family-business Alignment Technique does not apply here.' };
    },

    /** Diagnostic Q&A method for a 9th-house-dominant 10th CSL. */
    NINTH_HOUSE_DIAGNOSTIC_QUESTIONS: [
        'Are you a consultant? (First hypothesis — confirmed roughly 60-70% of the time in practice.)',
        'Do you train/mentor others (e.g. juniors at work)? (Second hypothesis — training delivery is also a valid expression of the 9th house.)'
    ],

    /** Worked case study: Vikas Kumar (b. 28 July 1999, 07:30, Bulandshahr, UP) — 10th CSL Mercury (H3,H1), Star Lord Saturn (H7,H8,H9). */
    CASE_STUDY_VIKAS_KUMAR: {
        setup: 'Question: "When will I get a job?" 10th CSL = Mercury, giving H3+H1. Mercury\'s Star Lord = Saturn, giving H7+H8+H9.',
        analysis: 'Because Mercury itself (the CSL) is tied to its OWN house (3 = the native\'s home region), a job in Bulandshahr — or even nearby Delhi — was assessed as very unlikely; employment would only come from a distant location. Since the Star Lord showed 7-8-9 (business, not job/6th), the recommendation reversed: "Don\'t look for a job — start a business" — specifically something 8th-house-aligned (manufacturing/insurance), and located far from the hometown (a culturally different region such as South or East India, e.g. Mumbai/Bengaluru). Digital marketing was also offered as an option, since the 8th house connects to the digital space too.',
        warning: 'If the native had stayed rooted in Bulandshahr, the 3-8-1 combination was flagged as "the depression combination" — sustained career struggle in the wrong location carrying a real risk of depression.'
    },

    /** General guidance principle: never label a Dasha/Antardasha "good" or "bad" without first knowing the native's actual need/purpose. */
    GUIDANCE_CAUTION_NOTE: 'Never judge an upcoming Antardasha as simply "good" or "bad" without first knowing what the native actually needs. Example: if someone needs funding and their next Antardasha strongly brings the 8th and 2nd houses together, reading that superficially as "family trouble incoming" would be wrong — that same combination may in fact be the auspicious window that brings them their funding.',

    getTenthCSLProfessionAnalysis: function (ascSid, natalPlanetsMap) {
        const P1 = this._p1(); if (!P1) return null;
        const allCusps = P1.getAllCusps(ascSid);
        const resolved = P1.resolveDeterminingPlanetPrecise(10, allCusps, natalPlanetsMap);
        if (!resolved) return null;
        const planetNumbers = P1.getPlanetNumbers(allCusps);
        const numbers = planetNumbers[resolved.determiningPlanet] || [];
        const matches = numbers.filter(h => this.TENTH_CSL_ALLOWED_PROFESSION[h]).map(h => Object.assign({ house: h }, this.TENTH_CSL_ALLOWED_PROFESSION[h]));
        const ninthPlusTwelfth = (numbers.includes(9) && numbers.includes(12)) ? this.TENTH_CSL_NINTH_PLUS_TWELFTH : null;
        const alignment = this.getAlignmentTechniqueFor2And8(numbers);
        const diagnosticQuestions = numbers.includes(9) ? this.NINTH_HOUSE_DIAGNOSTIC_QUESTIONS : null;
        const eighthHouseActive = numbers.includes(8);
        return {
            csl: allCusps[10].subLord, determiningPlanet: resolved.determiningPlanet, numbers: numbers,
            matches: matches, ninthPlusTwelfth: ninthPlusTwelfth, alignment: alignment,
            diagnosticQuestions: diagnosticQuestions, eighthHouseActive: eighthHouseActive
        };
    },

    renderTenthCSLProfession: function (data) {
        if (!data) return '';
        const rows = (data.matches || []).map(m => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid #7FA6FF;background:rgba(127,166,255,.08);"><b>H${m.house}:</b> ${m.profession}<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">${m.note}</div></div>`).join('');
        let html = `<div class="pred-item" style="border-left:3px solid #7FA6FF;">
            <div class="pred-title" style="color:#7FA6FF;">💼 10th CSL — Profession & Alignment Analysis</div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">10th CSL: ${data.csl} → determining planet ${data.determiningPlanet} → H${data.numbers.join(',H') || '—'}</div>
            ${rows}`;
        if (data.ninthPlusTwelfth) html += `<div style="margin-top:4px;padding:5px 8px;border-left:3px solid #C9A66B;background:rgba(201,166,107,.08);"><b>9+12 combination:</b> ${data.ninthPlusTwelfth.profession}<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">${data.ninthPlusTwelfth.note}</div></div>`;
        if (data.alignment && data.alignment.triggered) html += `<div style="margin-top:4px;padding:5px 8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);"><b style="color:#00DD77;">Alignment Technique triggered:</b> ${data.alignment.note}<div style="font-size:8.5px;color:var(--muted);margin-top:3px;">${data.alignment.verification}</div><div style="font-size:8.5px;color:var(--muted);margin-top:2px;">⚠️ ${data.alignment.caveat}</div></div>`;
        if (data.eighthHouseActive) html += `<div style="margin-top:4px;padding:5px 8px;border-left:3px solid #FFA500;background:rgba(255,165,0,.08);"><b>8th house active — modern reading:</b> ${this.EIGHTH_HOUSE_MODERN_THEORY.summary} ${this.EIGHTH_HOUSE_MODERN_THEORY.modernExample} <br><i>Funding timing:</i> ${this.EIGHTH_HOUSE_MODERN_THEORY.fundingRule}</div>`;
        if (data.diagnosticQuestions) html += `<div style="margin-top:4px;font-size:8.5px;color:var(--muted);"><b>9th-house diagnostic questions:</b><br>${data.diagnosticQuestions.join('<br>')}</div>`;
        html += '</div>';
        return html;
    },

    renderCaseStudyVikasKumar: function () {
        const cs = this.CASE_STUDY_VIKAS_KUMAR;
        return `<div class="pred-item" style="border-left:3px solid #7FDBAA;">
            <div class="pred-title" style="color:#7FDBAA;">📚 Case Study — Vikas Kumar (10th CSL Mercury/H3,H1, Star Lord Saturn/H7,H8,H9)</div>
            <div style="font-size:8.5px;color:var(--muted);margin-bottom:4px;"><b>Setup:</b> ${cs.setup}</div>
            <div style="font-size:9px;margin-bottom:4px;"><b>Analysis:</b> ${cs.analysis}</div>
            <div style="font-size:9px;color:#FF8855;"><b>Warning:</b> ${cs.warning}</div>
          </div>`;
    },


    // ================================================================
    // 3. TOP-LEVEL ANALYZE6 + RENDER
    // ================================================================

    analyze6: function (params) {
        params = params || {};
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        if (!natalPlanets || !natalAsc) return null;
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;

        const secondCSL = this.getSecondCSLFullWealthAnalysis(ascSid, natalPlanets);
        const tenthCSL = this.getTenthCSLProfessionAnalysis(ascSid, natalPlanets);

        return { secondCSL: secondCSL, tenthCSL: tenthCSL, includeCaseStudy: params.includeCaseStudy !== false };
    },

    renderHTML6: function (data) {
        if (!data) return '<div class="pred-item">KP Part 6 analysis unavailable — check that natalPlanets/natalAsc were supplied.</div>';
        let html = '<div class="pred-section-title" style="margin-top:10px;">🟢 KP Astrology — Part 6 (2nd CSL Wealth & 10th CSL Profession, Full Tables)</div>';
        if (data.secondCSL) html += this.renderSecondCSLFullWealth(data.secondCSL);
        if (data.tenthCSL) html += this.renderTenthCSLProfession(data.tenthCSL);
        if (data.includeCaseStudy) html += this.renderCaseStudyVikasKumar();
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION_6;
}