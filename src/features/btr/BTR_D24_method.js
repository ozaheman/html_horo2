/**
 * BTR_D24_method.js
 * ─────────────────────────────────────────────────────────────
 * Birth Time Rectification — D24 (Siddhamsha) / Jaimini Matrikaraka
 * method, per BPHS Ch.6 v.22 for the D24 sign rule ("starting from Leo
 * for odd signs and Cancer for even signs") and the classical Jaimini
 * teaching that the Matrikaraka (MK, the 4th-ranked of the 7 Char
 * Karakas) should connect to the D24 chart's 5th house/5th lord for a
 * candidate birth time to be confirmed.
 *
 * Also hosts a small registry of OTHER birth-time-rectification methods
 * (METHODS) so the method dropdown this file drives is genuinely
 * extensible. A second method — KP 1st/9th Cuspal Connectivity — is
 * fully implemented alongside the D24 method; several more from the
 * wider literature are registered with an efficiency note but marked
 * not-yet-implemented, ready to be filled in later without touching the
 * UI wiring.
 */
window.BTR_D24_METHOD = {

    SIGN_NAMES: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    SIGN_LORDS: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],

    _norm360: function (d) { return ((d % 360) + 360) % 360; },

    // ===================== JAIMINI CHAR KARAKAS (7-karaka scheme) =====================
    KARAKA_ORDER: ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'],
    KARAKA_FULL_NAME: {
        AK: 'Atmakaraka', AmK: 'Amatyakaraka', BK: 'Bhratrikaraka', MK: 'Matrikaraka',
        PK: 'Putrakaraka', GK: 'Gnatikaraka', DK: 'Daarakaraka'
    },

    /**
     * Ranks the 7 classical planets (Sun..Saturn — the Sapta Karaka
     * scheme; Rahu/Ketu excluded, per the source teaching's own argument
     * that an 8-karaka scheme can never cleanly resolve since two
     * planets essentially never share the exact same degree to the
     * second) by degree-within-sign, descending — highest degree =
     * Atmakaraka (AK), down to Daarakaraka (DK) at 7th place.
     */
    getCharKarakas: function (natalPlanetsMap) {
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const withDeg = planets.filter(p => natalPlanetsMap[p] && natalPlanetsMap[p].sid !== undefined).map(p => {
            const pd = natalPlanetsMap[p];
            return { planet: p, degInSign: this._norm360(pd.sid) % 30 };
        });
        withDeg.sort((a, b) => b.degInSign - a.degInSign);
        const result = {};
        withDeg.forEach((item, i) => {
            const key = this.KARAKA_ORDER[i];
            result[key] = { planet: item.planet, degInSign: item.degInSign, key: key, fullName: this.KARAKA_FULL_NAME[key] };
        });
        return result;
    },

    // ===================== SELF-CONTAINED KP LORDS (NL/SL/SSL) =====================
    _DASHA_SEQ: ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'],
    _DASHA_YRS: { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 },
    _NAK_SIZE: 360 / 27,

    _getKPLords: function (sid) {
        const lon = this._norm360(sid);
        const nakIndex = Math.floor(lon / this._NAK_SIZE);
        const nakLordIdx = nakIndex % 9;
        const degIntoNak = lon - nakIndex * this._NAK_SIZE;
        const TOTAL = 120;
        let subLordIdx = nakLordIdx, subStart = 0, subSpanFound = 0;
        for (let i = 0; i < 9; i++) {
            const seqIdx = (nakLordIdx + i) % 9;
            const span = (this._DASHA_YRS[this._DASHA_SEQ[seqIdx]] / TOTAL) * this._NAK_SIZE;
            if (degIntoNak >= subStart && degIntoNak < subStart + span) { subLordIdx = seqIdx; subSpanFound = span; break; }
            subStart += span; subSpanFound = span;
        }
        const degIntoSub = degIntoNak - subStart;
        let subSubLordIdx = subLordIdx, ssStart = 0;
        for (let i = 0; i < 9; i++) {
            const seqIdx = (subLordIdx + i) % 9;
            const span = (this._DASHA_YRS[this._DASHA_SEQ[seqIdx]] / TOTAL) * subSpanFound;
            if (degIntoSub >= ssStart && degIntoSub < ssStart + span) { subSubLordIdx = seqIdx; break; }
            ssStart += span;
        }
        return { nakLord: this._DASHA_SEQ[nakLordIdx], subLord: this._DASHA_SEQ[subLordIdx], subSubLord: this._DASHA_SEQ[subSubLordIdx] };
    },

    // ===================== D24 (SIDDHAMSHA) — BPHS Ch.6 v.22 =====================
    /**
     * "The lords of the Siddhamshas are, starting from Leo for odd signs
     * and Cancer for even signs" — BPHS 6.22. Each sign is divided into
     * 24 parts of 1°15' each; the D24 sign cycles forward from that
     * starting point through the 24 divisions.
     */
    getD24Sign: function (siderealLon) {
        const signNum = Math.floor(this._norm360(siderealLon) / 30);
        const degInSign = this._norm360(siderealLon) % 30;
        const part = Math.min(23, Math.floor(degInSign / (30 / 24)));
        const isOddSign = (signNum % 2 === 0); // signNum 0 = Aries = the 1st (odd) sign
        const startSign = isOddSign ? 4 : 3;   // Leo=4, Cancer=3
        return (startSign + part) % 12;
    },

    /** D9 (Navamsa) sign — fire signs count from Aries, earth from Capricorn, air from Libra, water from Cancer. Needed alongside D24 for the requested D1/D9/D24 display. */
    getD9Sign: function (siderealLon) {
        const signNum = Math.floor(this._norm360(siderealLon) / 30);
        const degInSign = this._norm360(siderealLon) % 30;
        const part = Math.min(8, Math.floor(degInSign / (30 / 9)));
        const startBySign = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
        return (startBySign[signNum] + part) % 12;
    },

    /** Builds a full D24 chart {asc, planets} from D1 natal data. House = sign-offset from the D24 Ascendant (standard varga-chart convention). */
    getD24Chart: function (natalPlanetsMap, natalAsc) {
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30 + (natalAsc.deg || 0);
        const d24AscSn = this.getD24Sign(ascSid);
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const d24Planets = {};
        planets.forEach(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return;
            const sn = this.getD24Sign(pd.sid);
            d24Planets[p] = { sn: sn, sign: this.SIGN_NAMES[sn], house: ((sn - d24AscSn + 12) % 12) + 1 };
        });
        return { asc: { sn: d24AscSn, sign: this.SIGN_NAMES[d24AscSn], house: 1 }, planets: d24Planets };
    },

    // ===================== JAIMINI RASHI DRISHTI (sign aspect) =====================
    /**
     * Movable signs aspect all fixed signs except the one adjacent to
     * them; fixed signs aspect all movable signs except the one adjacent
     * to them; dual signs mutually aspect other dual signs.
     */
    jaiminiAspects: function (fromSignNum, toSignNum) {
        if (fromSignNum === toSignNum) return false;
        const movable = [0, 3, 6, 9], fixed = [1, 4, 7, 10], dual = [2, 5, 8, 11];
        const diff = Math.abs(fromSignNum - toSignNum);
        const isAdjacent = diff === 1 || diff === 11;
        if (movable.includes(fromSignNum)) return fixed.includes(toSignNum) && !isAdjacent;
        if (fixed.includes(fromSignNum)) return movable.includes(toSignNum) && !isAdjacent;
        if (dual.includes(fromSignNum)) return dual.includes(toSignNum);
        return false;
    },

    // ===================== THE BTR TEST (D24 / Matrikaraka) =====================
    /**
     * Confirmed when the Matrikaraka (MK) either (a) occupies the D24's
     * 5th house, (b) sits together with the D24's 5th lord, or (c)
     * casts a Jaimini rashi-drishti onto the D24's 5th house.
     */
    checkBTR: function (natalPlanetsMap, natalAsc) {
        const karakas = this.getCharKarakas(natalPlanetsMap);
        const mkInfo = karakas['MK'];
        const d24 = this.getD24Chart(natalPlanetsMap, natalAsc);
        if (!mkInfo) return { verified: false, reason: 'Could not resolve the Matrikaraka — need at least 4 of the 7 classical planets with valid longitudes.', karakas: karakas, d24: d24 };
        const mk = mkInfo.planet;

        const fifthSignNum = (d24.asc.sn + 4) % 12;
        const fifthLord = this.SIGN_LORDS[fifthSignNum];
        const mkD24 = d24.planets[mk];
        if (!mkD24) return { verified: false, reason: `${mk} (Matrikaraka) has no resolvable D24 position.`, karakas: karakas, d24: d24 };

        const occupiesFifth = mkD24.house === 5;
        const fifthLordD24 = d24.planets[fifthLord];
        const conjunctFifthLord = fifthLordD24 && fifthLordD24.house === mkD24.house;
        const aspectsFifth = this.jaiminiAspects(mkD24.sn, fifthSignNum);
        const verified = occupiesFifth || conjunctFifthLord || aspectsFifth;

        let reason;
        if (occupiesFifth) reason = `Matrikaraka (${mk}) occupies the D24's 5th house directly — birth time confirmed.`;
        else if (conjunctFifthLord) reason = `Matrikaraka (${mk}) sits together with the D24's 5th lord (${fifthLord}) in House ${mkD24.house} — birth time confirmed.`;
        else if (aspectsFifth) reason = `Matrikaraka (${mk}) casts a Jaimini rashi-drishti onto the D24's 5th house (${this.SIGN_NAMES[fifthSignNum]}) — birth time confirmed.`;
        else reason = `Matrikaraka (${mk}) has no occupancy, conjunction with the 5th lord (${fifthLord}), or Jaimini aspect on the D24's 5th house — the D24 shifts roughly every 3-5 minutes of birth time, so nudge the time and re-check.`;

        return { verified, mk, mkHouse: mkD24.house, mkSign: mkD24.sign, fifthLord, fifthSignName: this.SIGN_NAMES[fifthSignNum], occupiesFifth, conjunctFifthLord, aspectsFifth, reason, karakas, d24 };
    },

    // ===================== FULL DISPLAY DATA (D1/D9/D24 + NL/SL/SSL) =====================
    getFullAnalysis: function (natalPlanetsMap, natalAsc) {
        const btr = this.checkBTR(natalPlanetsMap, natalAsc);
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30 + (natalAsc.deg || 0);
        const d9AscSn = this.getD9Sign(ascSid);

        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const planetRows = planets.map(p => {
            const pd = natalPlanetsMap[p];
            if (!pd || pd.sid === undefined) return { planet: p, available: false };
            const kp = this._getKPLords(pd.sid);
            const d9Sn = this.getD9Sign(pd.sid);
            const d24Info = btr.d24.planets[p];
            return {
                planet: p, available: true,
                sign: this.SIGN_NAMES[pd.sn !== undefined ? pd.sn : Math.floor(this._norm360(pd.sid) / 30)],
                degInSign: this._norm360(pd.sid) % 30, house: pd.house,
                nakLord: kp.nakLord, subLord: kp.subLord, subSubLord: kp.subSubLord,
                d9Sign: this.SIGN_NAMES[d9Sn], d9House: ((d9Sn - d9AscSn + 12) % 12) + 1,
                d24Sign: d24Info ? d24Info.sign : this.SIGN_NAMES[this.getD24Sign(pd.sid)],
                d24House: d24Info ? d24Info.house : null
            };
        });

        return { btr: btr, planetRows: planetRows, d9AscSn: d9AscSn };
    },

    /** Chart-panel descriptors for D1/D9/D24, drawn via the app's existing window.drawDChart(canvasId, {planets, asc}). */
    getChartConfigs: function (natalPlanets, natalAsc) {
        if (!natalPlanets || !natalAsc) return [];
        const d24 = this.getD24Chart(natalPlanets, natalAsc);
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;
        const d9AscSn = this.getD9Sign(ascSid);
        const d9Planets = {};
        Object.keys(natalPlanets).forEach(p => {
            const pd = natalPlanets[p];
            if (!pd || pd.sid === undefined) return;
            d9Planets[p] = { sn: this.getD9Sign(pd.sid) };
        });
        const d24PlanetsForChart = {};
        Object.keys(d24.planets).forEach(p => { d24PlanetsForChart[p] = { sn: d24.planets[p].sn }; });

        return [
            { canvasId: 'btrD1Canvas', label: 'D1 — Rashi (Birth Chart)', color: '#FFD700', planets: natalPlanets, asc: natalAsc },
            { canvasId: 'btrD9Canvas', label: 'D9 — Navamsa', color: '#66CCFF', planets: d9Planets, asc: { sn: d9AscSn } },
            { canvasId: 'btrD24Canvas', label: 'D24 — Siddhamsha', color: '#9b6fff', planets: d24PlanetsForChart, asc: { sn: d24.asc.sn } }
        ];
    },

    // ===================== KP 1st / 9th CUSP CONNECTIVITY (2nd BTR method) =====================
    /**
     * Classical KP birth-time verification: the chart is genuine when
     * there's a mutual stellar connection between the 1st cusp (self)
     * and the 9th cusp (destiny) — either the 1st cusp's Star Lord
     * equals the 9th cusp's Sub Lord, or the 1st cusp's Sub Lord equals
     * the 9th cusp's Star Lord. Because Placidus-style cusps move with
     * latitude-dependent trigonometry, this is often the single
     * fastest-moving check available for narrowing a birth time.
     * Equal-house cusp approximation (Ascendant + (house-1)*30°) is used
     * here — the same documented approximation this codebase's other KP
     * modules use in place of true Placidus cusps.
     */
    checkKP1st9thConnectivity: function (natalAsc) {
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30 + (natalAsc.deg || 0);
        const ninthCuspSid = this._norm360(ascSid + 8 * 30);
        const firstKP = this._getKPLords(ascSid);
        const ninthKP = this._getKPLords(ninthCuspSid);
        const connected = (firstKP.nakLord === ninthKP.subLord) || (firstKP.subLord === ninthKP.nakLord);
        return {
            verified: connected, method: 'kp_1_9_connectivity',
            first: firstKP, ninth: ninthKP,
            reason: connected
                ? `Connected: ${firstKP.nakLord === ninthKP.subLord ? `1st cusp's Star Lord (${firstKP.nakLord}) = 9th cusp's Sub Lord` : `1st cusp's Sub Lord (${firstKP.subLord}) = 9th cusp's Star Lord`} — birth time confirmed.`
                : `Not connected: 1st cusp NL/SL (${firstKP.nakLord}/${firstKP.subLord}) don't match 9th cusp SL/NL (${ninthKP.subLord}/${ninthKP.nakLord}) — try adjusting the time.`
        };
    },

    // ===================== METHOD REGISTRY (drives the dropdown) =====================
    // Efficiency notes drawn from the wider BTR literature: event-based
    // Dasha matching is generally rated the single most reliable method,
    // since it checks the chart against REAL dated life events rather
    // than internal consistency alone — but it needs those event dates
    // from the querent. The two implemented here are chart-internal,
    // fast, and need no outside data, which is why they were built
    // first: they narrow a time window quickly on their own; event-based
    // Dasha matching (once implemented) is best used afterward, to
    // confirm the final minute within whatever window these two leave.
    METHODS: {
        d24_jaimini: {
            label: 'D24 Siddhamsha — Matrikaraka/5th House (Jaimini)',
            implemented: true,
            efficiency: 'Fast, chart-internal — the D24 shifts every ~3-5 minutes of birth time, so it narrows a window quickly without needing any outside life-event data.'
        },
        kp_1_9_connectivity: {
            label: 'KP 1st–9th Cuspal Connectivity',
            implemented: true,
            efficiency: 'Very fast, chart-internal — Placidus-style cusps move with latitude-dependent trigonometry, often changing within just a few minutes.'
        },
        dasha_event_matching: {
            label: 'Vimshottari Dasha Event Matching',
            implemented: false,
            efficiency: 'Rated the single most reliable method in the wider literature, since it cross-checks the chart against REAL dated life events (marriage, career change, health crisis) rather than only internal chart consistency — but it needs those event dates from the querent. Best used to confirm the final minute after the D24/KP-cusp methods have narrowed the window.'
        },
        tattva_shodhana: {
            label: 'Tattva Shodhana (Nadi Elemental Timing)',
            implemented: false,
            efficiency: 'A Nadi-based supporting method — assigns Agni/Prithvi/Vayu/Jala/Aakash rulership in a repeating planetary-period sequence; used as a secondary cross-check rather than a primary method.'
        },
        varga_cross_verification: {
            label: 'Multi-Varga Cross-Verification (Vimshopaka Bala)',
            implemented: false,
            efficiency: 'Weighs agreement across many divisional charts (D1-D60) using classical Shodashavarga strength weighting — thorough, but computationally heavier and mainly useful for confirming a time already narrowed by faster methods.'
        },
        arudha_lagna: {
            label: 'Arudha Lagna Correlation',
            implemented: false,
            efficiency: 'Compares the Arudha Lagna (image/perception house) against the querent\'s actual lived circumstances and self-image — qualitative and relies on querent feedback, so best used as a final sanity check rather than a first pass.'
        }
    },

    /** Dispatches to whichever method is selected; unimplemented methods return a clear "coming soon" result instead of silently failing. */
    runMethod: function (methodKey, natalPlanetsMap, natalAsc) {
        const m = this.METHODS[methodKey];
        if (!m) return { btr: { verified: false, reason: 'Unknown method.' }, planetRows: [] };
        if (!m.implemented) return { btr: { verified: null, comingSoon: true, reason: `"${m.label}" is registered for a future update — not yet implemented. ${m.efficiency}` }, planetRows: [] };
        if (methodKey === 'd24_jaimini') return this.getFullAnalysis(natalPlanetsMap, natalAsc);
        if (methodKey === 'kp_1_9_connectivity') return { btr: this.checkKP1st9thConnectivity(natalAsc), planetRows: [] };
        return { btr: { verified: false, reason: 'Method not wired.' }, planetRows: [] };
    },

    // ===================== RENDERING =====================
    renderKarakaTable: function (karakas) {
        if (!karakas) return '';
        const rows = this.KARAKA_ORDER.map(k => {
            const info = karakas[k];
            if (!info) return '';
            return `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:4px 6px;font-weight:bold;color:var(--gold,#FFD700);">${k}</td>
                <td style="padding:4px 6px;color:var(--muted);">${info.fullName}</td>
                <td style="padding:4px 6px;">${info.planet}</td>
                <td style="padding:4px 6px;font-family:monospace;">${info.degInSign.toFixed(2)}°</td>
              </tr>`;
        }).join('');
        return `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:left;">
            <tr style="color:var(--muted);border-bottom:1px solid var(--border2);"><th style="padding:4px 6px;">Karaka</th><th style="padding:4px 6px;">Name</th><th style="padding:4px 6px;">Planet</th><th style="padding:4px 6px;">Deg</th></tr>
            ${rows}
          </table>`;
    },

    renderPlanetTable: function (planetRows) {
        if (!planetRows || !planetRows.length) return '';
        const rows = planetRows.filter(r => r.available).map(r => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:4px 6px;font-weight:bold;">${r.planet}</td>
              <td style="padding:4px 6px;">${r.sign} ${r.degInSign.toFixed(2)}°</td>
              <td style="padding:4px 6px;">H${r.house}</td>
              <td style="padding:4px 6px;color:var(--cyan);">${r.nakLord}</td>
              <td style="padding:4px 6px;color:#00DD77;">${r.subLord}</td>
              <td style="padding:4px 6px;">${r.subSubLord}</td>
              <td style="padding:4px 6px;">${r.d9Sign} (H${r.d9House})</td>
              <td style="padding:4px 6px;">${r.d24Sign} (H${r.d24House})</td>
            </tr>`).join('');
        return `<div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:9px;text-align:left;">
              <tr style="color:var(--muted);border-bottom:1px solid var(--border2);">
                <th style="padding:4px 6px;">Planet</th><th style="padding:4px 6px;">D1 Sign/Deg</th><th style="padding:4px 6px;">D1 House</th>
                <th style="padding:4px 6px;">NL</th><th style="padding:4px 6px;">SL</th><th style="padding:4px 6px;">SSL</th>
                <th style="padding:4px 6px;">D9</th><th style="padding:4px 6px;">D24</th>
              </tr>
              ${rows}
            </table>
          </div>`;
    },

    renderVerdict: function (btr) {
        if (!btr) return '';
        if (btr.comingSoon) {
            return `<div style="padding:10px;border:1px dashed var(--muted);border-radius:6px;color:var(--muted);font-size:10px;">🔜 ${btr.reason}</div>`;
        }
        const color = btr.verified ? '#00DD77' : '#FF4477';
        return `<div style="margin-top:8px;padding:10px;border:1px solid ${color}55;border-radius:6px;background:${color}0A;">
            <b style="color:${color};">${btr.verified ? '✓ BIRTH TIME CONFIRMED' : '✗ NEEDS ADJUSTMENT'}</b>
            <div style="font-size:9.5px;color:var(--text);opacity:0.9;margin-top:4px;">${btr.reason}</div>
          </div>`;
    },

    renderPanel: function (result, methodKey) {
        const m = this.METHODS[methodKey];
        let html = `<div style="font-size:9.5px;color:var(--muted);margin-bottom:8px;">${m ? m.efficiency : ''}</div>`;
        if (!result) return html + '<div style="color:var(--muted);">No data.</div>';
        if (result.btr && result.btr.comingSoon) return html + this.renderVerdict(result.btr);
        if (methodKey === 'kp_1_9_connectivity') return html + this.renderVerdict(result.btr);
        // d24_jaimini (default/full display)
        html += `<div style="font-size:10.5px;font-weight:bold;color:var(--gold,#FFD700);margin:8px 0 4px;">Jaimini Char Karakas</div>`;
        html += this.renderKarakaTable(result.btr.karakas);
        html += this.renderVerdict(result.btr);
        html += `<div style="font-size:10.5px;font-weight:bold;color:var(--gold,#FFD700);margin:12px 0 4px;">Planetary Positions — D1 / D9 / D24 + NL/SL/SSL</div>`;
        html += this.renderPlanetTable(result.planetRows);
        return html;
    }
};
