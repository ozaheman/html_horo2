/**
 * sawhney_event_timing.js
 *
 * Implements S.K. Sawhney's "Timing of Events Through Dasha & Transit"
 * method (Ch.7 "Timing for rise in Profession" and Ch.8 "How to Identify
 * Timing of Marriage") as one generic, reusable engine rather than two
 * separate copy-pasted implementations, since both chapters share the
 * exact same two-stage structure:
 *
 *   STAGE 1 — DASHA PARAMETERS: the event can fructify in the
 *   Mahadasha/Antardasha/Pratyantardasha of a specific set of
 *   "qualifying" planets for that house (its own lord, that lord's
 *   sign-dispositor, natural significators, planets placed in/aspecting/
 *   conjunct the house or its lord, and — optionally — the relevant
 *   divisional chart's own Lagna lord).
 *
 *   STAGE 2 — TRANSIT PARAMETERS: DURING that qualifying dasha, Saturn
 *   and Jupiter must additionally make contact (by occupation or aspect)
 *   with at least 2 of 4 specific points — the house itself, that
 *   house's lord (as a planet), an alternative/"trine" house, and that
 *   alternative house's lord — counted from BOTH natal Lagna and natal
 *   Moon (either satisfies the source's "from Lagna or Moon" wording).
 *
 * This module is a soft dependency on window.GOCHAR (reuses its house-
 * math helpers for consistency with the rest of this codebase) but
 * degrades to self-contained fallbacks if GOCHAR isn't loaded, so it
 * can be used standalone.
 */

window.SAWHNEY_TIMING = {

    // ===================== 0. SELF-CONTAINED HOUSE MATH (falls back if GOCHAR absent) =====================

    _mod12: function (h) {
        if (window.GOCHAR && typeof window.GOCHAR._mod12 === 'function') return window.GOCHAR._mod12(h);
        return (((h - 1) % 12) + 12) % 12 + 1;
    },

    _lords: function (lords) {
        return lords || (typeof LORDS !== 'undefined' ? LORDS : (window.LORDS || null));
    },

    /** Houses a planet rules for a given natal ascendant sign-number. */
    _housesRuledBy: function (planet, ascSignNum, lords) {
        const L = this._lords(lords);
        if (!L) return [];
        const out = [];
        for (let h = 1; h <= 12; h++) { if (L[(ascSignNum + h - 1) % 12] === planet) out.push(h); }
        return out;
    },

    /** House number (1-12) of `planetSignNum` counted from `refSignNum` as house 1. */
    _transitHouseFrom: function (refSignNum, planetSignNum) {
        if (window.GOCHAR && typeof window.GOCHAR._transitHouseFrom === 'function') return window.GOCHAR._transitHouseFrom(refSignNum, planetSignNum);
        return this._mod12(planetSignNum - refSignNum + 1);
    },

    VEDIC_ASPECT_OFFSETS: {
        Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], default: [7]
    },

    /** Houses aspected by `planet` sitting in transit `house`. */
    _aspectedHousesFrom: function (planet, house) {
        if (window.GOCHAR && typeof window.GOCHAR._aspectedHousesFrom === 'function') return window.GOCHAR._aspectedHousesFrom(planet, house);
        const offs = this.VEDIC_ASPECT_OFFSETS[planet] || this.VEDIC_ASPECT_OFFSETS.default;
        return offs.map(o => this._mod12(house + o - 1));
    },

    /** The sign-lord (dispositor) of whatever sign natal `planet` occupies. */
    _dispositorOf: function (planet, natalPlanetsMap, ascSignNum, lords) {
        const L = this._lords(lords);
        const pd = natalPlanetsMap && natalPlanetsMap[planet];
        if (!pd || pd.sn === undefined || !L) return null;
        return L[pd.sn] || null;
    },

    // ===================== 1. EVENT CONFIGS =====================

    EVENT_CONFIGS: {
        marriage: {
            label: 'Marriage', icon: '💍', color: '#FF6EC7',
            primeHouse: 7, altHouse: 1, altHouseLabel: 'Lagna (7th-from-7th)',
            naturalSignificators: ['Venus', 'Rahu'],
            vargaName: 'Navamsha (D9)', vargaKey: 'natalD9Asc',
            reference: 'S.K. Sawhney, "Timing of Events Through Dasha & Transit", Ch.8 "How to Identify Timing of Marriage"',
            dashaParamLabels: [
                '7th Lord (marriage/spouse house)',
                'Lagna Lord (== lord of 7th-from-the-7th)',
                'Lagna Lord of Navamsha (D9), if supplied',
                'Dispositor (sign-lord) of the 7th Lord',
                'Venus or Rahu — natural marriage significators',
                'Planet(s) placed in / conjunct with / aspecting the 7th Lord or 7th house',
                '7th Lord from Moon or Venus, and planet(s) placed in the 7th-from-Moon/Venus'
            ]
        },
        profession: {
            label: 'Profession / Business', icon: '💼', color: '#66CCFF',
            primeHouse: 10, altHouse: 7, altHouseLabel: '7th house (alternative Karma house, 10th-from-10th)',
            naturalSignificators: [],
            vargaName: 'Dashamsha (D10)', vargaKey: 'natalD10Asc',
            reference: 'S.K. Sawhney, "Timing of Events Through Dasha & Transit", Ch.7 "Timing for rise in Profession"',
            dashaParamLabels: [
                '10th Lord (career/status house)',
                'Dispositor (sign-lord) of the 10th Lord',
                'Lagna Lord of Dashamsha (D10), if supplied',
                'Planet(s) aspecting/conjunct the 10th Lord, or placed in the 10th house',
                '7th Lord — alternative house of profession (10th-from-10th)'
            ]
        }
    },

    // ===================== 2. STAGE 1 — DASHA PARAMETERS =====================

    /**
     * Builds the full set of planets that "qualify" as timing triggers
     * for this event, per the book's Dasha Parameters list, each tagged
     * with WHY it qualifies (so the render can cite chapter/verse-style
     * reasoning exactly like the book's case studies do).
     */
    getDashaSignificatorSet: function (eventType, ascSignNum, natalPlanetsMap, lords, vargaAscSignNum) {
        const cfg = this.EVENT_CONFIGS[eventType];
        if (!cfg || !natalPlanetsMap) return [];
        const L = this._lords(lords);
        if (!L) return [];

        const primeLord = L[(ascSignNum + cfg.primeHouse - 1) % 12];
        const altLord = L[(ascSignNum + cfg.altHouse - 1) % 12];
        const dispositorOfPrime = primeLord ? this._dispositorOf(primeLord, natalPlanetsMap, ascSignNum, L) : null;

        const primeLordHouse = (natalPlanetsMap[primeLord] || {}).house;
        const planetsInPrimeHouse = Object.keys(natalPlanetsMap).filter(p => natalPlanetsMap[p] && natalPlanetsMap[p].house === cfg.primeHouse);
        const planetsConjunctPrimeLord = primeLordHouse ? Object.keys(natalPlanetsMap).filter(p => p !== primeLord && natalPlanetsMap[p] && natalPlanetsMap[p].house === primeLordHouse) : [];
        // Planets natally aspecting the prime house or the prime lord's house (Vedic drishti, from natal placement).
        const planetsAspectingPrime = Object.keys(natalPlanetsMap).filter(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.house === undefined) return false;
            const asp = this._aspectedHousesFrom(p, pd.house);
            return asp.includes(cfg.primeHouse) || (primeLordHouse && asp.includes(primeLordHouse));
        });

        const varga = vargaAscSignNum !== undefined && vargaAscSignNum !== null ? L[vargaAscSignNum] : null;

        const set = new Map(); // planet -> [reasons]
        const add = (planet, reason) => {
            if (!planet) return;
            if (!set.has(planet)) set.set(planet, []);
            set.get(planet).push(reason);
        };

        add(primeLord, `${cfg.primeHouse}th Lord`);
        add(altLord, eventType === 'marriage' ? 'Lagna Lord (7th-from-7th)' : `${cfg.altHouse}th Lord (alt. house)`);
        if (varga) add(varga, `${cfg.vargaName} Lagna Lord`);
        if (dispositorOfPrime) add(dispositorOfPrime, `Dispositor of ${cfg.primeHouse}th Lord (${primeLord})`);
        cfg.naturalSignificators.forEach(p => { if (natalPlanetsMap[p]) add(p, 'Natural significator'); });
        planetsInPrimeHouse.forEach(p => add(p, `Placed in ${cfg.primeHouse}th house`));
        planetsConjunctPrimeLord.forEach(p => add(p, `Conjunct with ${cfg.primeHouse}th Lord (${primeLord})`));
        planetsAspectingPrime.forEach(p => add(p, `Aspecting ${cfg.primeHouse}th house/${cfg.primeHouse}th Lord`));

        // #7 for marriage / implicit for profession: prime-house-lord counted from Moon, and planets in that house-from-Moon.
        const moonSn = natalPlanetsMap.Moon ? natalPlanetsMap.Moon.sn : null;
        if (moonSn !== null) {
            const primeFromMoonSn = (moonSn + cfg.primeHouse - 1) % 12;
            const primeLordFromMoon = L[primeFromMoonSn];
            if (primeLordFromMoon) add(primeLordFromMoon, `${cfg.primeHouse}th Lord from Moon`);
            Object.keys(natalPlanetsMap).forEach(p => {
                const pd = natalPlanetsMap[p];
                if (pd && pd.sn === primeFromMoonSn) add(p, `Placed in ${cfg.primeHouse}th-from-Moon`);
            });
        }

        return Array.from(set.entries()).map(([planet, reasons]) => ({ planet: planet, reasons: reasons }));
    },

    /**
     * Checks the currently-running MD/AD/PD lords (from
     * PREDICTION_FORECASTING.getCurrentDashaInfo()) against the
     * significator set above.
     */
    checkDashaParameters: function (eventType, dashaInfo, ascSignNum, natalPlanetsMap, lords, vargaAscSignNum) {
        const sigSet = this.getDashaSignificatorSet(eventType, ascSignNum, natalPlanetsMap, lords, vargaAscSignNum);
        const sigMap = {};
        sigSet.forEach(s => { sigMap[s.planet] = s.reasons; });

        const levels = [
            { key: 'md', label: 'Mahadasha', lord: dashaInfo && dashaInfo.mahadasha ? dashaInfo.mahadasha.lord : null },
            { key: 'ad', label: 'Antardasha', lord: dashaInfo && dashaInfo.antardasha ? dashaInfo.antardasha.lord : null },
            { key: 'pd', label: 'Pratyantardasha', lord: dashaInfo && dashaInfo.pratyantar ? dashaInfo.pratyantar.lord : null }
        ];

        const checked = levels.map(lv => ({
            level: lv.label, lord: lv.lord,
            qualifies: !!(lv.lord && sigMap[lv.lord]),
            reasons: lv.lord ? (sigMap[lv.lord] || []) : []
        }));

        const qualifyingCount = checked.filter(c => c.qualifies).length;
        return { levels: checked, significatorSet: sigSet, qualifyingCount: qualifyingCount, allQualify: checked.every(c => c.lord && c.qualifies) };
    },

    // ===================== 3. STAGE 2 — TRANSIT PARAMETERS (Saturn+Jupiter, 2-of-4) =====================

    /**
     * For ONE reference point (natal Lagna sign-num OR natal Moon
     * sign-num), checks whether transiting Saturn/Jupiter occupy or
     * aspect each of the event's 4 designated points:
     *   C1: the prime house itself (e.g. 7th for marriage, 10th for profession)
     *   C2: the natal prime-house-lord's CURRENT transit sign
     *   C3: the alt house (e.g. Lagna for marriage, 7th for profession)
     *   C4: the natal alt-house-lord's CURRENT transit sign
     */
    _checkTransitConditionsFromRef: function (eventType, refSignNum, transitPlanetsMap, natalPlanetsMap, ascSignNum, lords) {
        const cfg = this.EVENT_CONFIGS[eventType];
        const L = this._lords(lords);
        if (!cfg || refSignNum === undefined || refSignNum === null || !transitPlanetsMap || !L) return [];

        const primeLord = L[(ascSignNum + cfg.primeHouse - 1) % 12];
        const altLord = L[(ascSignNum + cfg.altHouse - 1) % 12];
        const primeLordNatalSn = (natalPlanetsMap[primeLord] || {}).sn;
        const altLordNatalSn = (natalPlanetsMap[altLord] || {}).sn;

        const touches = (targetHouseOrSn, isSignNum) => {
            const hits = [];
            ['Saturn', 'Jupiter'].forEach(gp => {
                const tp = transitPlanetsMap[gp];
                if (!tp || tp.sn === undefined) return;
                const gpHouse = this._transitHouseFrom(refSignNum, tp.sn);
                const targetHouse = isSignNum ? this._transitHouseFrom(refSignNum, targetHouseOrSn) : targetHouseOrSn;
                const occupies = gpHouse === targetHouse;
                const aspects = this._aspectedHousesFrom(gp, gpHouse).includes(targetHouse);
                if (occupies) hits.push({ planet: gp, mode: 'occupies' });
                else if (aspects) hits.push({ planet: gp, mode: 'aspects' });
            });
            return hits;
        };

        const conditions = [
            { id: 'C1', label: `${cfg.primeHouse}th house`, hits: touches(cfg.primeHouse, false) },
            { id: 'C2', label: `${cfg.primeHouse}th Lord (${primeLord || '?'})`, hits: primeLordNatalSn !== undefined ? touches(primeLordNatalSn, true) : [] },
            { id: 'C3', label: cfg.altHouseLabel, hits: touches(cfg.altHouse, false) },
            { id: 'C4', label: `Lord of ${cfg.altHouseLabel} (${altLord || '?'})`, hits: altLordNatalSn !== undefined ? touches(altLordNatalSn, true) : [] }
        ];
        return conditions;
    },

    /**
     * Runs the check from BOTH natal Lagna and natal Moon (the source's
     * "from Lagna or Moon" wording), and returns whichever reference
     * satisfies at least 2-of-4 conditions — matching how the book's own
     * case studies mix Lagna- and Moon-based confirmations freely.
     */
    checkTransitParameters: function (eventType, transitPlanetsMap, ascSignNum, moonSignNum, natalPlanetsMap, lords) {
        const refs = [{ name: 'Lagna', sn: ascSignNum }, { name: 'Moon', sn: moonSignNum }].filter(r => r.sn !== undefined && r.sn !== null);
        const perRef = refs.map(r => {
            const conditions = this._checkTransitConditionsFromRef(eventType, r.sn, transitPlanetsMap, natalPlanetsMap, ascSignNum, lords);
            const metCount = conditions.filter(c => c.hits.length > 0).length;
            return { ref: r.name, conditions: conditions, metCount: metCount, satisfied: metCount >= 2 };
        });
        const best = perRef.slice().sort((a, b) => b.metCount - a.metCount)[0] || null;
        return { perRef: perRef, best: best, satisfied: perRef.some(r => r.satisfied) };
    },

    // ===================== 4. COMBINED VERDICT =====================

    /**
     * params: { eventType, dashaInfo, transitPlanetsMap, ascSignNum,
     *           natalPlanetsMap, lords, vargaAscSignNum }
     */
    analyzeEvent: function (params) {
        params = params || {};
        const eventType = params.eventType;
        const cfg = this.EVENT_CONFIGS[eventType];
        if (!cfg || !params.natalPlanetsMap || params.ascSignNum === undefined) return null;
        const moonSignNum = params.natalPlanetsMap.Moon ? params.natalPlanetsMap.Moon.sn : undefined;

        const dashaCheck = this.checkDashaParameters(eventType, params.dashaInfo, params.ascSignNum, params.natalPlanetsMap, params.lords, params.vargaAscSignNum);
        const transitCheck = params.transitPlanetsMap
            ? this.checkTransitParameters(eventType, params.transitPlanetsMap, params.ascSignNum, moonSignNum, params.natalPlanetsMap, params.lords)
            : null;

        let verdict = 'insufficient data';
        if (dashaCheck.qualifyingCount > 0 && transitCheck) {
            verdict = (transitCheck.satisfied) ? 'favourable — dasha & transit both align' : 'dasha qualifies, transit not yet confirming';
        } else if (dashaCheck.qualifyingCount > 0) {
            verdict = 'dasha qualifies (transit not checked — no live transit data supplied)';
        } else if (transitCheck) {
            verdict = transitCheck.satisfied ? 'transit favourable, but running dasha lord is not a qualifying planet' : 'neither dasha nor transit currently confirming';
        }

        return { eventType: eventType, config: cfg, dashaCheck: dashaCheck, transitCheck: transitCheck, verdict: verdict };
    },

    // ===================== 5. RENDER =====================

    renderEventCard: function (data) {
        if (!data) return '';
        const cfg = data.config;
        const dc = data.dashaCheck, tc = data.transitCheck;

        const dashaRows = dc.levels.map(lv => `<div style="margin:3px 0;padding:5px 8px;border-left:3px solid ${lv.qualifies ? '#00DD77' : '#8899AA'};background:${lv.qualifies ? 'rgba(0,221,119,.06)' : 'rgba(136,153,170,.05)'};">
              <b>${lv.level}:</b> ${lv.lord || '—'} ${lv.qualifies ? `<span style="color:#00DD77;">✓ qualifies</span>` : (lv.lord ? `<span style="color:var(--muted);">— not a listed significator</span>` : '')}
              ${lv.reasons.length ? `<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">${lv.reasons.join(' · ')}</div>` : ''}
            </div>`).join('');

        const sigList = dc.significatorSet.map(s => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 6px;border-radius:3px;background:rgba(155,111,255,.1);color:#9b6fff;font-size:8.5px;" title="${s.reasons.join(' · ')}">${s.planet}</span>`).join('');

        let transitBlock = '<div style="font-size:9px;color:var(--muted);margin-top:6px;">No live transit data supplied — transit parameters not checked.</div>';
        if (tc) {
            const refBlocks = tc.perRef.map(r => {
                const condRows = r.conditions.map(c => `<div style="margin:2px 0;font-size:8.5px;color:${c.hits.length ? '#00DD77' : 'var(--muted)'};">
                    ${c.hits.length ? '✓' : '✗'} ${c.id} — ${c.label}${c.hits.length ? ': ' + c.hits.map(h => `${h.planet} ${h.mode}`).join(', ') : ''}
                  </div>`).join('');
                return `<div style="margin-top:6px;padding:6px 8px;border:1px solid ${r.satisfied ? '#00DD7744' : '#FF9F4344'};border-radius:5px;background:${r.satisfied ? 'rgba(0,221,119,.05)' : 'rgba(255,159,67,.05)'};">
                    <b style="font-size:9px;color:${r.satisfied ? '#00DD77' : '#FF9F43'};">From ${r.ref}: ${r.metCount}/4 conditions met ${r.satisfied ? '✓ (≥2 required)' : ''}</b>
                    ${condRows}
                  </div>`;
            }).join('');
            transitBlock = `<div style="margin-top:6px;">
                <div style="font-size:9px;color:var(--muted);font-weight:bold;">TRANSIT PARAMETERS (Saturn + Jupiter, 2-of-4, from Lagna or Moon):</div>
                ${refBlocks}
              </div>`;
        }

        const verdictColor = data.verdict.startsWith('favourable') ? '#00DD77' : data.verdict.startsWith('neither') ? '#FF4477' : '#FFD700';

        return `<div class="pred-item" style="border-left:3px solid ${cfg.color};margin-top:10px;">
                  <div class="pred-title" style="color:${cfg.color};">${cfg.icon} ${cfg.label} Timing — Classical Dasha &amp; Transit Method</div>
                  <div style="font-size:8px;color:var(--muted);margin-bottom:6px;">${cfg.reference}</div>
                  <div style="font-size:9px;color:var(--muted);font-weight:bold;">DASHA PARAMETERS — currently running:</div>
                  ${dashaRows}
                  <div style="font-size:8.5px;color:var(--muted);margin-top:6px;">Full qualifying-significator set: ${sigList || '—'}</div>
                  ${transitBlock}
                  <div style="margin-top:8px;padding:8px;border:1px solid ${verdictColor}44;border-radius:6px;background:${verdictColor}0A;">
                    <b style="color:${verdictColor};">VERDICT: ${data.verdict.toUpperCase()}</b>
                  </div>
                </div>`;
    },

    /** Convenience: analyze + render one event type in one call. */
    renderEvent: function (eventType, params) {
        params = Object.assign({}, params, { eventType: eventType });
        const data = this.analyzeEvent(params);
        return data ? this.renderEventCard(data) : '';
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SAWHNEY_TIMING;
}
