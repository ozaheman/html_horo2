/**
 * guru_trikona_dhanagam.js
 * ─────────────────────────────────────────────────────────────
 * "Dhanagam Yoga" — Jupiter-transit money-gain window detector,
 * per the classical method taught in the source video:
 *
 *   1. Take the Navamsha (D9) sign of the 2nd lord (Dhanesh) and/or
 *      11th lord (Labhesh) — and, as a supplementary/exploratory check
 *      the speaker floats but hasn't personally tested, the Lagna lord too.
 *   2. The TRIKONA (that sign + its 5th + its 9th) from each of those
 *      Navamsha signs is where transiting Jupiter brings monetary gain.
 *   3. Within a trikona sign, gain intensity peaks when transiting
 *      Jupiter's degree approaches the NATAL (D1) degree of that sign's
 *      own dispositor (rashi swami) — e.g. transiting Jupiter in Scorpio,
 *      watch for it nearing natal Mars's degree (Scorpio's D1 lord).
 *   4. Amplifiers: Dhanesh & Labhesh mutually in 5-9/conjunct in D9;
 *      a natural malefic occupying the transited D1 sign while also being
 *      a benefic-house lord (lagnesh/trikona lord) there; the transited
 *      sign's D1 dispositor being itself strong; transit Jupiter passing
 *      directly over natal Lagnesh or Bhagyesh's sign.
 *   5. Reducers: transiting Jupiter itself weak/debilitated/afflicted;
 *      a brief RETROGRADE re-entry into an already-covered sign (the
 *      teaching says this dip should not be counted as a fresh trigger).
 *
 * NOTE (from the source): the speaker explicitly says the Dasha/Antardasha
 * link to this yoga was left for a future video — this module does NOT
 * invent that connection.
 *
 * Depends on optional globals (all guarded — degrades gracefully if
 * missing): window.getVargaData(lon, 9), window.ASTRO_CONSTANTS
 * (SIGNS, SIGN_LORDS, DIGNITIES, BENEFICS, MALEFICS), and a transit
 * position provider you pass in yourself (see computeTrail's `getTransitFn`).
 */

window.GURU_TRIKONA_DHANAGAM = {

    SIGNS: (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) ||
        ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"],

    // ===================== HELPERS =====================

    _lord: function (signIdx) {
        const L = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) ||
            { 0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter' };
        return L[((signIdx % 12) + 12) % 12];
    },

    _navamshaSign: function (lonDeg) {
        if (typeof window.getVargaData === 'function') {
            try { return window.getVargaData(lonDeg, 9).sign; } catch (e) { /* fall through */ }
        }
        // Self-contained fallback Navamsha calc: 9 navamshas per sign, each 3°20'.
        const sign = Math.floor(lonDeg / 30);
        const degInSign = lonDeg % 30;
        const navIdx = Math.floor(degInSign / (30 / 9));
        // Navamsha counting: movable signs start from themselves, fixed from the 9th, dual from the 5th (classical rule).
        const startSign = [0, 3, 6, 9].includes(sign) ? sign          // movable (chara)
                         : [1, 4, 7, 10].includes(sign) ? (sign + 8) % 12  // fixed (sthira) -> start 9th from itself
                         : (sign + 4) % 12;                          // dual (dwiswabhava) -> start 5th from itself
        return (startSign + navIdx) % 12;
    },

    /** [selfSign, 5th, 9th] — the trikona set from a given sign. */
    trikonaOf: function (signIdx) {
        const s = ((signIdx % 12) + 12) % 12;
        return [s, (s + 4) % 12, (s + 8) % 12];
    },

    _isStrong: function (planetName, planetPos) {
        const DIGN = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.DIGNITIES) || {};
        const d = DIGN[planetName];
        if (!d || !planetPos) return false;
        if (planetPos.sn === d.exalt) return true;
        if (d.own && d.own.includes(planetPos.sn)) return true;
        return false;
    },

    // ===================== 1. IDENTIFY SIGNIFICATORS =====================

    /**
     * @param natalPlanets - map like BIRTH_PLANETS: {Sun:{sn,sid,house,...}, ...}
     * @param ascSn - natal ascendant sign index (0-11)
     */
    identifySignificators: function (natalPlanets, ascSn) {
        const dhaneshSign = (ascSn + 1) % 12;   // 2nd house sign
        const labheshSign = (ascSn + 10) % 12;  // 11th house sign
        const bhagyeshSign = (ascSn + 8) % 12;  // 9th house sign
        return {
            lagnesh: this._lord(ascSn),
            dhanesh: this._lord(dhaneshSign),
            labhesh: this._lord(labheshSign),
            bhagyesh: this._lord(bhagyeshSign)
        };
    },

    // ===================== 2. COMPUTE DHANAGAM TRIKONA SETS =====================

    /**
     * Builds the full set of "gain trikona" signs (with trigger degrees and
     * amplifier notes) derived from Dhanesh, Labhesh, and (flagged as
     * exploratory) Lagnesh.
     */
    computeDhanagamSets: function (natalPlanets, ascSn) {
        const sig = this.identifySignificators(natalPlanets, ascSn);
        const BENEFICS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.BENEFICS) || ['Jupiter','Venus','Mercury','Moon'];
        const MALEFICS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.MALEFICS) || ['Saturn','Mars','Rahu','Ketu'];
        const results = [];

        const buildFor = (label, planetName, exploratory) => {
            const p = natalPlanets[planetName];
            if (!p) return null;
            const lon = p.sid !== undefined ? p.sid : p.longitude;
            if (lon === undefined) return null;
            const navSign = this._navamshaSign(lon);
            const trikona = this.trikonaOf(navSign);

            const signs = trikona.map(signIdx => {
                const dispositor = this._lord(signIdx);
                const dispositorPos = natalPlanets[dispositor];
                const rawDeg = dispositorPos ? (dispositorPos.deg !== undefined ? dispositorPos.deg : ((dispositorPos.sid || dispositorPos.longitude || 0) % 30)) : null;
                const triggerDeg = rawDeg !== null && rawDeg !== undefined && !isNaN(parseFloat(rawDeg)) ? parseFloat(rawDeg) : null;

                // Amplifiers / reducers for this specific sign
                const occupants = Object.keys(natalPlanets).filter(pn => {
                    const pp = natalPlanets[pn];
                    return pp && pp.sn === signIdx;
                });
                const maleficOccupantIsGoodLord = occupants.filter(pn => MALEFICS.includes(pn)).some(pn => {
                    // "good lord" heuristic: this malefic owns Lagna, or a trikona house (1/5/9), or 2nd/11th, in natal chart
                    const houses = [];
                    for (let h = 1; h <= 12; h++) { if (this._lord((ascSn + h - 1) % 12) === pn) houses.push(h); }
                    return houses.some(h => [1, 2, 5, 9, 11].includes(h));
                });
                const dispositorStrong = this._isStrong(dispositor, dispositorPos);
                const isLagneshSign = dispositor === sig.lagnesh;
                const isBhagyeshSign = dispositor === sig.bhagyesh;

                return {
                    sign: signIdx, signName: this.SIGNS[signIdx], dispositor: dispositor,
                    triggerDegree: triggerDeg, occupants: occupants,
                    amplifiers: {
                        maleficOccupantIsGoodLord, dispositorStrong, isLagneshSign, isBhagyeshSign
                    }
                };
            });

            return { label: label, basisPlanet: planetName, navamshaSign: navSign, navamshaSignName: this.SIGNS[navSign], signs: signs, exploratory: !!exploratory };
        };

        const dhaneshSet = buildFor('Dhanesh (2nd Lord)', sig.dhanesh, false);
        const labheshSet = buildFor('Labhesh (11th Lord)', sig.labhesh, false);
        const lagneshSet = buildFor('Lagnesh (exploratory — per audience Q&A, not yet personally verified by the teacher)', sig.lagnesh, true);
        if (dhaneshSet) results.push(dhaneshSet);
        if (labheshSet) results.push(labheshSet);
        if (lagneshSet) results.push(lagneshSet);

        // Mutual relationship amplifier: Dhanesh & Labhesh conjunct or in 5-9 in Navamsha
        let mutualAmplifier = null;
        if (dhaneshSet && labheshSet) {
            const a = dhaneshSet.navamshaSign, b = labheshSet.navamshaSign;
            const dist = ((b - a + 12) % 12) + 1;
            if (a === b) mutualAmplifier = `Dhanesh and Labhesh are CONJUNCT in Navamsha (both in ${this.SIGNS[a]}) — strong amplifier.`;
            else if (dist === 5 || dist === 9) mutualAmplifier = `Dhanesh and Labhesh are mutually in a 5th/9th (trikona) relationship in Navamsha (${this.SIGNS[a]} / ${this.SIGNS[b]}) — strong amplifier.`;
        }

        return { significators: sig, sets: results, mutualAmplifier: mutualAmplifier };
    },

    // ===================== 3. EVALUATE A GIVEN TRANSIT MOMENT =====================

    /**
     * @param dhanagamSets - output of computeDhanagamSets()
     * @param transitJupiter - {sn, deg, retro} at the moment being checked
     */
    evaluateMoment: function (dhanagamSets, transitJupiter) {
        if (!transitJupiter) return { active: false, matches: [] };
        const matches = [];
        dhanagamSets.sets.forEach(set => {
            set.signs.forEach(s => {
                if (s.sign !== transitJupiter.sn) return;
                let orb = null, isPeak = false;
                if (s.triggerDegree !== null && transitJupiter.deg !== undefined && transitJupiter.deg !== null) {
                    const tjDeg = parseFloat(transitJupiter.deg);
                    if (!isNaN(tjDeg)) { orb = Math.abs(tjDeg - s.triggerDegree); isPeak = orb <= 3; }
                }
                matches.push({
                    basis: set.label, basisPlanet: set.basisPlanet, exploratory: set.exploratory,
                    sign: s.signName, dispositor: s.dispositor, triggerDegree: s.triggerDegree,
                    orbToTrigger: orb, isPeak: isPeak, amplifiers: s.amplifiers
                });
            });
        });
        const retroCaveat = transitJupiter.retro
            ? 'Jupiter is retrograde right now — per the teaching, a brief retrograde re-entry into a sign already covered this direct-motion cycle should NOT be counted as a fresh trigger; treat this window cautiously.'
            : null;
        return { active: matches.length > 0, matches: matches, retroCaveat: retroCaveat };
    },

    // ===================== 4. BUILD A TRAIL OVER A DATE RANGE =====================

    /**
     * Scans month-by-month across [startDate, endDate] and returns a list of
     * contiguous "gain window" segments (Jupiter's sign matches a Dhanagam
     * trikona sign), ready to feed into a timeline/bar renderer.
     *
     * @param getTransitJupiterFn - function(date) => {sn, deg, retro} for transiting Jupiter at that date (YOU supply this — wire it to your existing ephemeris, e.g. window.computeAll)
     */
    computeTrail: function (dhanagamSets, startDate, endDate, getTransitJupiterFn) {
        if (typeof getTransitJupiterFn !== 'function') { console.warn('GURU_TRIKONA_DHANAGAM.computeTrail: getTransitJupiterFn is required'); return []; }
        const gainSigns = new Set();
        dhanagamSets.sets.forEach(set => set.signs.forEach(s => gainSigns.add(s.sign)));

        const segments = [];
        let cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        let curSeg = null;
        let guard = 0;
        while (cur <= end && guard < 600) { // ~50 years of months, hard safety cap
            const tj = getTransitJupiterFn(new Date(cur));
            const inWindow = tj && gainSigns.has(tj.sn);
            if (inWindow) {
                const evalNow = this.evaluateMoment(dhanagamSets, tj);
                if (!curSeg || curSeg.sign !== tj.sn) {
                    if (curSeg) segments.push(curSeg);
                    curSeg = { sign: tj.sn, signName: this.SIGNS[tj.sn], start: new Date(cur), end: new Date(cur), peakDates: [] };
                }
                curSeg.end = new Date(cur);
                if (evalNow.matches.some(m => m.isPeak)) curSeg.peakDates.push(new Date(cur));
            } else if (curSeg) {
                segments.push(curSeg);
                curSeg = null;
            }
            cur.setMonth(cur.getMonth() + 1);
            guard++;
        }
        if (curSeg) segments.push(curSeg);
        return segments;
    },

    // ===================== 5. RENDERING =====================

    _fmtMonYear: function (d) { return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); },

    renderExplainerPanel: function (dhanagamSets) {
        const sig = dhanagamSets.significators;
        const setBlocks = dhanagamSets.sets.map(set => {
            const signChips = set.signs.map(s => {
                const amps = [];
                if (s.amplifiers.dispositorStrong) amps.push('dispositor strong');
                if (s.amplifiers.maleficOccupantIsGoodLord) amps.push('malefic-but-good-lord present');
                if (s.amplifiers.isLagneshSign) amps.push('= Lagnesh sign');
                if (s.amplifiers.isBhagyeshSign) amps.push('= Bhagyesh sign');
                const ampStr = amps.length ? ` <span style="color:#00DD77;">[${amps.join(', ')}]</span>` : '';
                return `<div style="margin:2px 0;font-size:9px;">• <b>${s.signName}</b> — dispositor ${s.dispositor}${s.triggerDegree !== null ? `, peak near ${s.triggerDegree.toFixed(1)}°` : ''}${ampStr}</div>`;
            }).join('');
            return `<div style="margin-top:6px;padding:6px 8px;border-left:2px solid var(--gold,#FFD700);background:rgba(255,215,0,.05);">
                <div style="font-size:10px;font-weight:bold;color:var(--gold,#FFD700);">${set.label}${set.exploratory ? ' <span style="font-weight:normal;color:var(--muted);">(exploratory)</span>' : ''}</div>
                <div style="font-size:8.5px;color:var(--muted);">Navamsha sign: ${set.navamshaSignName} → Trikona (gain) signs:</div>
                ${signChips}
            </div>`;
        }).join('');

        return `<div class="pred-item" style="border-left:3px solid var(--gold,#FFD700);">
            <div class="pred-title" style="color:var(--gold,#FFD700);">💰 Dhanagam Yoga — Jupiter Transit Money-Gain Windows</div>
            <div style="font-size:8.5px;color:var(--muted);margin-bottom:4px;">Lagnesh: <b>${sig.lagnesh}</b> · Dhanesh (2nd): <b>${sig.dhanesh}</b> · Labhesh (11th): <b>${sig.labhesh}</b> · Bhagyesh (9th): <b>${sig.bhagyesh}</b></div>
            ${dhanagamSets.mutualAmplifier ? `<div style="font-size:9px;color:#00DD77;margin-bottom:4px;">⭐ ${dhanagamSets.mutualAmplifier}</div>` : ''}
            ${setBlocks}
            <div style="margin-top:6px;font-size:8px;color:var(--muted);font-style:italic;">Gain intensity peaks when transiting Jupiter's degree nears the natal degree of a sign's own dispositor. A weak/afflicted transiting Jupiter, or a brief retrograde dip back into an already-covered sign, reduces or voids the effect. The link to Dasha/Antardasha timing was left open by the source teaching — not assumed here.</div>
        </div>`;
    },

    renderMomentBadge: function (evalResult) {
        if (!evalResult.active) return `<span style="font-size:9px;color:var(--muted);">No Dhanagam trikona active right now.</span>`;
        const rows = evalResult.matches.map(m => {
            const color = m.isPeak ? '#00DD77' : '#FFD700';
            return `<div style="font-size:9px;margin:2px 0;">
                <span style="color:${color};font-weight:bold;">${m.isPeak ? '⭐ PEAK' : '● Active'}</span>
                — ${m.sign} (via ${m.basis}${m.exploratory ? ', exploratory' : ''})${m.orbToTrigger !== null ? `, ${m.orbToTrigger.toFixed(1)}° from trigger` : ''}
            </div>`;
        }).join('');
        const retro = evalResult.retroCaveat ? `<div style="font-size:8.5px;color:#FFA500;margin-top:3px;">⚠ ${evalResult.retroCaveat}</div>` : '';
        return `<div>${rows}${retro}</div>`;
    },

    /** Draw the gain-window trail onto a canvas, mirroring this app's existing drawDashaBar(cvId, timeline, colMap, small) convention. */
    drawTrailBar: function (cvId, segments, rangeStart, rangeEnd) {
        const cv = document.getElementById(cvId);
        if (!cv) return;
        const w = cv.clientWidth || cv.width || 600, h = cv.height || 20;
        const dpr = window.devicePixelRatio || 1;
        cv.width = w * dpr; cv.height = h * dpr;
        cv.style.width = w + 'px'; cv.style.height = h + 'px';
        const ctx = cv.getContext('2d');
        if (!ctx) { console.warn('GURU_TRIKONA_DHANAGAM.drawTrailBar: 2D canvas context unavailable'); return; }
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, 0, w, h);

        const totalMs = rangeEnd - rangeStart;
        segments.forEach(seg => {
            const x1 = ((seg.start - rangeStart) / totalMs) * w;
            const x2 = ((seg.end - rangeStart) / totalMs) * w;
            ctx.fillStyle = 'rgba(255,215,0,0.55)';
            ctx.fillRect(x1, 2, Math.max(2, x2 - x1), h - 4);
            seg.peakDates.forEach(pd => {
                const px = ((pd - rangeStart) / totalMs) * w;
                ctx.fillStyle = '#00DD77';
                ctx.fillRect(px - 1, 0, 2, h);
            });
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.strokeRect(0, 0, w, h);
    },

    // ===================== 6. UI: CHECKBOX MOUNT HELPER =====================

    /**
     * Injects a "💰 Money Gain Trail" checkbox + explainer panel + trail bar
     * into a container, and wires it to compute/draw on toggle.
     *
     * @param containerId - element id to render into
     * @param opts - { natalPlanets, ascSn, getTransitJupiterFn(date), rangeStartDate, rangeEndDate, checkboxLabel }
     */
    mountCheckbox: function (containerId, opts) {
        const el = document.getElementById(containerId);
        if (!el) { console.warn('GURU_TRIKONA_DHANAGAM.mountCheckbox: container not found', containerId); return; }
        const dhanagamSets = this.computeDhanagamSets(opts.natalPlanets, opts.ascSn);
        const chkId = containerId + '_chkMoneyGainTrail';
        const barId = containerId + '_moneyGainCanvas';
        const panelId = containerId + '_moneyGainPanel';

        el.innerHTML += `<label style="font-size:9px;color:var(--muted);display:inline-flex;align-items:center;gap:4px;margin:4px 0;">
            <input type="checkbox" id="${chkId}"> ${opts.checkboxLabel || '💰 Show Money Gain Trail (Jupiter Transit Dhanagam Yoga)'}
        </label>
        <div id="${panelId}" style="display:none;">
            <canvas id="${barId}" height="20" style="width:100%;display:block;"></canvas>
        </div>`;

        document.getElementById(chkId).addEventListener('change', (e) => {
            const panel = document.getElementById(panelId);
            panel.style.display = e.target.checked ? 'block' : 'none';
            if (!e.target.checked) return;
            if (!panel.dataset.rendered) {
                panel.innerHTML = this.renderExplainerPanel(dhanagamSets) + `<canvas id="${barId}" height="20" style="width:100%;display:block;margin-top:6px;"></canvas>`;
                const segments = this.computeTrail(dhanagamSets, opts.rangeStartDate, opts.rangeEndDate, opts.getTransitJupiterFn);
                this.drawTrailBar(barId, segments, opts.rangeStartDate, opts.rangeEndDate);
                panel.dataset.rendered = '1';
            }
        });
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.GURU_TRIKONA_DHANAGAM;