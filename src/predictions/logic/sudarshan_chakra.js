/**
 * Sudarshan Chakra Dasa (SCD) Engine
 * Based on Sastry Karra's methodology for event timing.
 */

window.SUDARSHAN_CHAKRA = {
  /**
   * Calculates Balance Days for Cycle 1 based on Lagna degree.
   * Formula: (Remaining degrees in Lagna sign / 30) * 365
   */
  calculateBalanceDays: function(lagnaLon) {
    const degInSign = lagnaLon % 30;
    const remaining = 30 - degInSign;
    return (remaining / 30) * 365;
  },

  /**
   * Calculates SCD periods (Mahadasha and Antardasha).
   * MD = 1 House per Year (365 days)
   * AD = 1 House per Month (~30.41 days)
   */
  getSCDPeriods: function(birthDate, lagnaLon, startYear, endYear) {
    const periods = [];
    const balanceDays = this.calculateBalanceDays(lagnaLon);
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Cycle 1, House 1 start=birth, duration=balanceDays
    // Cycle 1, House 2-12 duration=365
    // Cycle 2, House 1-12 duration=365
    
    let currentStart = new Date(birthDate);
    let houseCounter = 0; // 0-indexed house count from birth

    // We generate enough periods to cover the requested range
    // Total houses to generate to reach endYear (roughly)
    const targetAge = endYear - birthDate.getFullYear() + 2; 
    const totalHouses = targetAge * 12; 

    for (let h = 0; h < totalHouses; h++) {
      const isFirstHouse = (h === 0);
      const durationDays = isFirstHouse ? balanceDays : 365;
      const currentEnd = new Date(currentStart.getTime() + durationDays * msPerDay);
      
      const houseNum = (h % 12) + 1;
      const cycleNum = Math.floor(h / 12) + 1;
      const mdYearStart = currentStart.getFullYear();

      // Only store if within requested range
      if (mdYearStart >= startYear && mdYearStart <= endYear) {
        // Divide this MD (year) into 12 ADs (months)
        const adDuration = durationDays / 12;
        for (let m = 0; m < 12; m++) {
          const adStart = new Date(currentStart.getTime() + m * adDuration * msPerDay);
          const adEnd = new Date(currentStart.getTime() + (m + 1) * adDuration * msPerDay);
          const adHouse = ((houseNum - 1 + m) % 12) + 1;

          periods.push({
            cycle: cycleNum,
            mdHouse: houseNum,
            adHouse: adHouse,
            start: adStart,
            end: adEnd,
            isFirstHouse: isFirstHouse
          });
        }
      }

      currentStart = currentEnd;
      if (currentStart.getFullYear() > endYear + 1) break;
    }
    
    return periods;
  },

  /**
   * Analyzes SCD for marriage windows.
   */
  getMarriageWindows: function(birthDate, lagnaLon, startAge, endAge) {
    const marriageHouses = [2, 4, 5, 7, 12];
    const startYear = birthDate.getFullYear() + startAge;
    const endYear = birthDate.getFullYear() + endAge;
    
    const allPeriods = this.getSCDPeriods(birthDate, lagnaLon, startYear, endYear);
    const windows = allPeriods.filter(p => marriageHouses.includes(p.mdHouse) && marriageHouses.includes(p.adHouse));

    // Merge adjacent
    const merged = [];
    if (windows.length > 0) {
      let current = { ...windows[0] };
      for (let i = 1; i < windows.length; i++) {
        const next = windows[i];
        if (Math.abs(next.start - current.end) < 2000 && next.mdHouse === current.mdHouse) {
           current.end = next.end;
        } else {
          merged.push(current);
          current = { ...next };
        }
      }
      merged.push(current);
    }
    return merged;
  },

  // ============================================================
  // SUDARSHAN CHAKRA CHART (Lagna + Chandra + Surya combined view)
  // ============================================================
  // NOT the same technique as the SCD Dasha engine above — same
  // classical name, different tool. This is the traditional
  // "Sudarshan Chakra Chart": the SAME set of planets read
  // simultaneously from three lagna (reference) points — the
  // Ascendant, the Moon (Chandra Lagna), and the Sun (Surya Lagna).
  // A house/theme confirmed from all three angles at once is read as
  // far stronger than any single chart's view alone. Self-contained
  // (own sign/nakshatra tables) so it doesn't depend on any other
  // module's globals being loaded first.

  SIGN_NAMES: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  SIGN_LORDS: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],
  NAKSHATRA_NAMES: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
  NAKSHATRA_LORD_SEQ: ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'], // repeats x3 across the 27 nakshatras
  NAK_SIZE: 360 / 27,

  _norm360: function (deg) { return ((deg % 360) + 360) % 360; },
  _mod12: function (h) { return ((h - 1) % 12 + 12) % 12 + 1; },

  getSignInfo: function (sid) {
    const signNum = Math.floor(this._norm360(sid) / 30);
    return { signNum: signNum, sign: this.SIGN_NAMES[signNum], signLord: this.SIGN_LORDS[signNum] };
  },

  getNakInfo: function (sid) {
    const nakNum = Math.floor(this._norm360(sid) / this.NAK_SIZE) % 27;
    return { nakNum: nakNum, nakshatra: this.NAKSHATRA_NAMES[nakNum], nakLord: this.NAKSHATRA_LORD_SEQ[nakNum % 9] };
  },

  /** House counted from a reference sign (1-12), classical "N houses from X" rule. */
  houseFrom: function (refSignNum, targetSignNum) {
    if (refSignNum === null || refSignNum === undefined || targetSignNum === null || targetSignNum === undefined) return null;
    return this._mod12(targetSignNum - refSignNum + 1);
  },

  /**
   * Builds one Sudarshan Chakra row set for whichever planets map is
   * passed in, read from three fixed reference sign numbers (Ascendant,
   * Moon, Sun). Used for both the natal chart (getChakraData) and the
   * transit chart (getTransitChakraData) below — the difference is only
   * which planets get placed vs. which sign numbers anchor the houses.
   */
  _buildChakraRows: function (planetsToPlace, ascSn, moonSn, sunSn) {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    return planets.map(p => {
      const pd = planetsToPlace ? planetsToPlace[p] : null;
      if (!pd || pd.sid === undefined) return { planet: p, available: false };
      const sn = (pd.sn !== undefined) ? pd.sn : Math.floor(this._norm360(pd.sid) / 30);
      const sign = this.getSignInfo(pd.sid);
      const nak = this.getNakInfo(pd.sid);
      return {
        planet: p, available: true, sid: pd.sid, degInSign: this._norm360(pd.sid) % 30,
        sign: sign.sign, signLord: sign.signLord,
        nakshatra: nak.nakshatra, nakLord: nak.nakLord,
        houseFromAsc: this.houseFrom(ascSn, sn),
        houseFromMoon: this.houseFrom(moonSn, sn),
        houseFromSun: this.houseFrom(sunSn, sn)
      };
    });
  },

  /**
   * NATAL Sudarshan Chakra: matches the classic "Planet Positions" +
   * "House Positions" (From Ascendant / From Moon / From Sun) tables.
   */
  getChakraData: function (natalPlanets, natalAsc) {
    if (!natalPlanets || !natalAsc) return null;
    const ascSn = natalAsc.sn;
    const moonSn = natalPlanets.Moon ? natalPlanets.Moon.sn : null;
    const sunSn = natalPlanets.Sun ? natalPlanets.Sun.sn : null;
    return { ascSn: ascSn, moonSn: moonSn, sunSn: sunSn, rows: this._buildChakraRows(natalPlanets, ascSn, moonSn, sunSn) };
  },

  /**
   * TRANSIT Sudarshan Chakra: today's transiting planets, placed from
   * the SAME three NATAL reference points (natal Ascendant, natal Moon,
   * natal Sun — fixed, not the transiting Moon/Sun). Flags each
   * transiting planet "tripleConfirmed" when it lands on the identical
   * house number from all three angles at once — the classical strongest
   * signal — and separately finds which HOUSES are touched by at least
   * one transiting planet from all three angles (not necessarily the
   * same planet), for the summary panel.
   */
  getTransitChakraData: function (natalPlanets, natalAsc, transitPlanets) {
    if (!natalPlanets || !natalAsc || !transitPlanets) return null;
    const ascSn = natalAsc.sn;
    const moonSn = natalPlanets.Moon ? natalPlanets.Moon.sn : null;
    const sunSn = natalPlanets.Sun ? natalPlanets.Sun.sn : null;
    const rows = this._buildChakraRows(transitPlanets, ascSn, moonSn, sunSn);

    rows.forEach(r => {
      if (!r.available) { r.tripleConfirmed = false; return; }
      const vals = [r.houseFromAsc, r.houseFromMoon, r.houseFromSun].filter(v => v !== null && v !== undefined);
      r.tripleConfirmed = vals.length === 3 && vals[0] === vals[1] && vals[1] === vals[2];
    });

    const houseHits = {};
    for (let h = 1; h <= 12; h++) houseHits[h] = { fromAsc: [], fromMoon: [], fromSun: [] };
    rows.forEach(r => {
      if (!r.available) return;
      if (r.houseFromAsc) houseHits[r.houseFromAsc].fromAsc.push(r.planet);
      if (r.houseFromMoon) houseHits[r.houseFromMoon].fromMoon.push(r.planet);
      if (r.houseFromSun) houseHits[r.houseFromSun].fromSun.push(r.planet);
    });
    const tripleHouses = [];
    for (let h = 1; h <= 12; h++) {
      if (houseHits[h].fromAsc.length && houseHits[h].fromMoon.length && houseHits[h].fromSun.length) tripleHouses.push(h);
    }

    return { ascSn: ascSn, moonSn: moonSn, sunSn: sunSn, rows: rows, houseHits: houseHits, tripleHouses: tripleHouses };
  },

  /**
   * Chart-panel descriptors for all three natal charts (Lagna/Chandra/
   * Surya) and, if transit planets are supplied, the same three charts
   * redrawn with TODAY's planets. Every entry reuses the app's existing
   * window.drawDChart(canvasId, {planets, asc}) renderer — Chandra/Surya
   * charts are drawn by handing it a synthetic {sn: <moon or sun sign>}
   * "ascendant," which drawDChart already treats as House 1 for house
   * numbering purposes.
   */
  getChartConfigs: function (natalPlanets, natalAsc, transitPlanets) {
    const cfgs = [];
    if (natalPlanets && natalAsc) {
      cfgs.push({ canvasId: 'sudarshanAscCanvas', label: 'Lagna Chakra (from Ascendant)', color: '#FFD700', planets: natalPlanets, asc: natalAsc });
      if (natalPlanets.Moon) cfgs.push({ canvasId: 'sudarshanMoonCanvas', label: 'Chandra Chakra (from Moon)', color: '#66CCFF', planets: natalPlanets, asc: { sn: natalPlanets.Moon.sn } });
      if (natalPlanets.Sun) cfgs.push({ canvasId: 'sudarshanSunCanvas', label: 'Surya Chakra (from Sun)', color: '#FF9F43', planets: natalPlanets, asc: { sn: natalPlanets.Sun.sn } });
    }
    if (transitPlanets && natalAsc) {
      cfgs.push({ canvasId: 'sudarshanTransitAscCanvas', label: 'Transit — from Ascendant', color: '#00DD77', planets: transitPlanets, asc: natalAsc });
      if (natalPlanets && natalPlanets.Moon) cfgs.push({ canvasId: 'sudarshanTransitMoonCanvas', label: 'Transit — from Moon (Chandra Lagna)', color: '#9b6fff', planets: transitPlanets, asc: { sn: natalPlanets.Moon.sn } });
      if (natalPlanets && natalPlanets.Sun) cfgs.push({ canvasId: 'sudarshanTransitSunCanvas', label: 'Transit — from Sun (Surya Lagna)', color: '#FF69B4', planets: transitPlanets, asc: { sn: natalPlanets.Sun.sn } });
    }
    return cfgs;
  },

  _renderChartPanels: function (chartConfigs, title) {
    if (!chartConfigs || !chartConfigs.length) return '';
    const cells = chartConfigs.map(c => `
        <div style="text-align:center;">
          <div style="font-size:10px;color:${c.color};margin-bottom:4px;font-weight:bold;">${c.label}</div>
          <canvas id="${c.canvasId}" width="190" height="190" style="background:var(--panel2,#1a1a2e);border-radius:3px;"></canvas>
        </div>`).join('');
    return `<div style="margin-top:8px;">
              <div style="font-size:10px;color:var(--muted);font-weight:bold;margin-bottom:6px;">${title}</div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">${cells}</div>
            </div>`;
  },
  /**
   * ONE combined Sudarshan Chakra Chart — a single North-Indian diamond
   * chart (planets placed physically, exactly like the natal D1 chart)
   * where every one of the 12 house cells additionally shows three small
   * color-coded numbers: the house-count for that cell's sign as read
   * from the Ascendant (gold), from the Moon (cyan), and from the Sun
   * (orange). This is the classical single "Sudarshan Chakra Chart"
   * (three lagnas read off ONE wheel at once) rather than three separate
   * side-by-side charts. Self-contained — does not depend on drawDChart
   * or any other module's canvas helpers being loaded.
   */
  drawCombinedChart: function (cvId, natalPlanets, natalAsc) {
    const cv = document.getElementById(cvId);
    if (!cv || !natalPlanets || !natalAsc) return;
    const attrW = parseFloat(cv.getAttribute('width')) || 320;
    const S = attrW;
    const dpr = window.devicePixelRatio || 1;
    cv.width = S * dpr; cv.height = S * dpr;
    cv.style.width = S + 'px'; cv.style.height = S + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cssVar = (name, fallback) => {
      try { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fallback; }
      catch (e) { return fallback; }
    };
    ctx.fillStyle = cssVar('--bg', '#0a0a14'); ctx.fillRect(0, 0, S, S);

    const M = 10, L = S - 2 * M, x0 = M, y0 = M, U = L / 4;
    const P = (c, r) => ({ x: x0 + c * U, y: y0 + r * U });
    const p00 = P(0, 0), p20 = P(2, 0), p40 = P(4, 0);
    const p02 = P(0, 2), p11 = P(1, 1), p31 = P(3, 1), p22 = P(2, 2), p13 = P(1, 3), p33 = P(3, 3), p42 = P(4, 2);
    const p04 = P(0, 4), p24 = P(2, 4), p44 = P(4, 4);
    const ln = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    ctx.strokeStyle = cssVar('--border3', '#444488') + 'AA'; ctx.lineWidth = 1.2;
    ctx.strokeRect(x0, y0, L, L);
    ln(p20, p02); ln(p02, p24); ln(p24, p42); ln(p42, p20); // inner diamond
    ln(p00, p44); ln(p40, p04); // main diagonals

    const avg3 = (a, b, c) => ({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 });
    const avg4 = (a, b, c, d) => ({ x: (a.x + b.x + c.x + d.x) / 4, y: (a.y + b.y + c.y + d.y) / 4 });
    const CE = {
      1: avg4(p20, p11, p22, p31), 2: avg3(p00, p20, p11), 3: avg3(p00, p02, p11),
      4: avg4(p02, p11, p22, p13), 5: avg3(p04, p02, p13), 6: avg3(p04, p24, p13),
      7: avg4(p24, p13, p22, p33), 8: avg3(p44, p24, p33), 9: avg3(p44, p42, p33),
      10: avg4(p42, p31, p22, p33), 11: avg3(p40, p42, p31), 12: avg3(p40, p20, p31)
    };

    const ascSn = natalAsc.sn ?? 0;
    const moonSn = natalPlanets.Moon ? natalPlanets.Moon.sn : null;
    const sunSn = natalPlanets.Sun ? natalPlanets.Sun.sn : null;

    // Sign number in each house cell (physical D1 layout, Ascendant = House 1).
    ctx.textAlign = 'center';
    for (let h = 1; h <= 12; h++) {
      const sn = ((ascSn + h - 1) % 12) + 1;
      const c = CE[h];
      ctx.fillStyle = cssVar('--gold', '#FFD700'); ctx.font = 'bold 10px Courier New';
      ctx.fillText(sn, c.x, c.y - 26);
    }

    // Planets physically placed (from the Ascendant, exactly as in the D1 chart).
    const hmap = {}; for (let i = 1; i <= 12; i++) hmap[i] = [];
    Object.entries(natalPlanets).filter(([p]) => !['Uranus', 'Neptune', 'Pluto'].includes(p)).forEach(([p, pd]) => {
      if (pd.sn === undefined) return;
      const h = ((pd.sn - ascSn + 12) % 12) + 1;
      hmap[h].push(p.substring(0, 2));
    });
    hmap[1].unshift('As');
    ctx.font = 'bold 9px Courier New';
    for (let h = 1; h <= 12; h++) {
      const c = CE[h];
      hmap[h].forEach((abbr, i) => {
        ctx.fillStyle = cssVar('--cyan', '#66CCFF');
        ctx.fillText(abbr, c.x, c.y - 12 + i * 10);
      });
    }

    // The three stacked, color-coded "which house is this from each lagna"
    // numbers — the actual Sudarshan Chakra reading, per house cell.
    ctx.font = 'bold 8px Courier New';
    for (let h = 1; h <= 12; h++) {
      const sn0 = (ascSn + h - 1) % 12;
      const c = CE[h];
      const fromAsc = h; // by construction, house h IS h houses from the Ascendant
      const fromMoon = (moonSn !== null) ? this.houseFrom(moonSn, sn0) : null;
      const fromSun = (sunSn !== null) ? this.houseFrom(sunSn, sn0) : null;
      const line = (label, val, color, dy) => {
        if (val === null || val === undefined) return;
        ctx.fillStyle = color;
        ctx.fillText(`${label}:${val}`, c.x, c.y + dy);
      };
      line('L', fromAsc, '#FFD700', 12);
      line('M', fromMoon, '#66CCFF', 22);
      line('S', fromSun, '#FF9F43', 32);
    }
    ctx.textAlign = 'left';
  },

  renderPlanetPositionsTable: function (chakraData) {
    if (!chakraData) return '';
    const rows = chakraData.rows.filter(r => r.available).map(r => `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:4px 6px;font-weight:bold;">${r.planet}</td>
          <td style="padding:4px 6px;">${r.degInSign.toFixed(2)}°</td>
          <td style="padding:4px 6px;">${r.sign}</td>
          <td style="padding:4px 6px;">${r.signLord}</td>
          <td style="padding:4px 6px;">${r.nakshatra}</td>
          <td style="padding:4px 6px;">${r.nakLord}</td>
        </tr>`).join('');
    return `<div style="overflow-x:auto;margin-top:6px;">
              <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                  <th style="padding:4px 6px;">Planet</th><th style="padding:4px 6px;">Degree</th><th style="padding:4px 6px;">Rasi</th>
                  <th style="padding:4px 6px;">Rasi Lord</th><th style="padding:4px 6px;">Nakshatra</th><th style="padding:4px 6px;">Nakshatra Lord</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
  },

  renderHousePositionsTable: function (chakraData) {
    if (!chakraData) return '';
    const rows = chakraData.rows.filter(r => r.available).map(r => `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:4px 6px;font-weight:bold;">${r.planet}</td>
          <td style="padding:4px 6px;text-align:center;">${r.houseFromAsc ?? '—'}</td>
          <td style="padding:4px 6px;text-align:center;">${r.houseFromMoon ?? '—'}</td>
          <td style="padding:4px 6px;text-align:center;">${r.houseFromSun ?? '—'}</td>
        </tr>`).join('');
    return `<div style="overflow-x:auto;margin-top:6px;">
              <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                  <th style="padding:4px 6px;">Planet</th><th style="padding:4px 6px;text-align:center;">From Ascendant</th>
                  <th style="padding:4px 6px;text-align:center;">From Moon</th><th style="padding:4px 6px;text-align:center;">From Sun</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
  },

  renderTransitChakraTable: function (transitChakraData) {
    if (!transitChakraData) return '';
    const rows = transitChakraData.rows.filter(r => r.available).map(r => `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);${r.tripleConfirmed ? 'background:rgba(0,221,119,.1);' : ''}">
          <td style="padding:4px 6px;font-weight:bold;">${r.planet}${r.tripleConfirmed ? ' ⭐' : ''}</td>
          <td style="padding:4px 6px;">${r.sign}</td>
          <td style="padding:4px 6px;">${r.nakshatra} (${r.nakLord})</td>
          <td style="padding:4px 6px;text-align:center;">${r.houseFromAsc ?? '—'}</td>
          <td style="padding:4px 6px;text-align:center;">${r.houseFromMoon ?? '—'}</td>
          <td style="padding:4px 6px;text-align:center;">${r.houseFromSun ?? '—'}</td>
        </tr>`).join('');
    return `<div style="font-size:8px;color:var(--muted);margin:4px 0;">⭐ = this transiting planet lands on the SAME house number from all three lagnas at once — the strongest single-planet confirmation.</div>
            <div style="overflow-x:auto;margin-top:6px;">
              <table style="width:100%;border-collapse:collapse;font-size:9px;color:var(--text);">
                <thead><tr style="border-bottom:1px solid var(--border);color:var(--muted);text-align:left;">
                  <th style="padding:4px 6px;">Planet</th><th style="padding:4px 6px;">Rasi</th><th style="padding:4px 6px;">Nakshatra (Lord)</th>
                  <th style="padding:4px 6px;text-align:center;">H (Asc)</th><th style="padding:4px 6px;text-align:center;">H (Moon)</th><th style="padding:4px 6px;text-align:center;">H (Sun)</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
  },

  renderTripleHousesSummary: function (transitChakraData) {
    if (!transitChakraData) return '';
    const houses = transitChakraData.tripleHouses;
    if (!houses.length) {
      return `<div style="margin-top:8px;font-size:9px;color:var(--muted);">No house is currently touched by transiting planets from all three lagnas at once — today's transit signal is more diffuse than a sharp Sudarshan Chakra confirmation.</div>`;
    }
    let eventsHtml = '';
    if (window.KP_PREDICTION && typeof window.KP_PREDICTION.predictEventTypesForHouses === 'function') {
      const events = window.KP_PREDICTION.predictEventTypesForHouses(houses);
      if (events.length) {
        eventsHtml = `<div style="margin-top:6px;">${events.map(e => `<span style="display:inline-block;margin:2px 3px 2px 0;padding:2px 6px;border-radius:3px;font-size:8px;background:${e.negativeHit ? 'rgba(255,68,119,.15)' : 'rgba(0,221,119,.15)'};color:${e.negativeHit ? '#FF4477' : '#00DD77'};border:1px solid ${e.negativeHit ? 'rgba(255,68,119,.3)' : 'rgba(0,221,119,.3)'};">${e.eventType.replace(/_/g, ' ')}${e.negativeHit ? ' ⚠' : ''}</span>`).join('')}</div>`;
      }
    }
    return `<div style="margin-top:8px;padding:8px;border-left:3px solid #00DD77;background:rgba(0,221,119,.08);">
              <b style="color:#00DD77;">Triple-Confirmed Houses Today: H${houses.join(', H')}</b>
              <div style="font-size:8.5px;color:var(--text);opacity:.85;margin-top:4px;">These houses are activated by transiting planet(s) counted from the Ascendant AND from the Moon AND from the Sun simultaneously — the Sudarshan Chakra's classical strongest-possible transit signal.</div>
              ${eventsHtml}
            </div>`;
  },

  /**
   * Top-level renderer — natal tables + charts, and (if transit data was
   * supplied) today's transit tables/charts + the triple-confirmation
   * summary. chartConfigs comes from getChartConfigs() — canvases are
   * left empty here; the caller draws them after the HTML is in the DOM
   * (same pattern as GOCHAR/KP_PREDICTION's chart panels).
   */
  renderChakraSection: function (natalChakraData, transitChakraData, chartConfigs) {
    if (!natalChakraData) {
      return `<div class="pred-item" style="border-left: 3px solid var(--violet); background: rgba(155, 111, 255, 0.05);">
                <div class="pred-title" style="color:var(--violet);">☸ Sudarshan Chakra Insights</div>
                <div class="pred-detail" style="font-size:10px; color:var(--muted); line-height:1.4;">
                  The Sudarshan Chakra is the combined wheel of Lagna, Moon, and Sun. Requires BIRTH_PLANETS and BIRTH_ASC to compute — not available.
                </div>
              </div>`;
    }
    const natalCfgs = (chartConfigs || []).filter(c => c.canvasId.indexOf('Transit') === -1);
    const transitCfgs = (chartConfigs || []).filter(c => c.canvasId.indexOf('Transit') !== -1);

    let html = `<div class="pred-item" style="border-left: 3px solid var(--violet); background: rgba(155, 111, 255, 0.05);">
        <div class="pred-title" style="color:var(--violet);">☸ Sudarshan Chakra Chart</div>
        <div class="pred-detail" style="font-size:10px; color:var(--muted); line-height:1.4;margin-bottom:6px;">
          The Sudarshan Chakra reads the SAME planets from three lagnas at once — the Ascendant, the Moon (Chandra Lagna), and the Sun (Surya Lagna). A house confirmed from all three angles together carries far more weight than any one chart alone.
</div>
        <div style="text-align:center;margin:8px 0;">
          <canvas id="sudarshanCombinedCanvas" width="320" height="320" style="background:var(--panel2,#1a1a2e);border-radius:4px;max-width:100%;"></canvas>
          <div style="font-size:8px;color:var(--muted);margin-top:4px;">Each house cell: sign number (gold, top) · planets there · L=from Lagna, M=from Moon, S=from Sun (house number for that cell)</div>

        </div>`;

    html += this._renderChartPanels(natalCfgs, 'Per-Lagna Detail Charts (Natal)');
    html += `<details open style="margin-top:8px;"><summary style="cursor:pointer;color:var(--violet);font-size:10px;font-weight:bold;">Planet Positions (Natal)</summary>${this.renderPlanetPositionsTable(natalChakraData)}</details>`;
    html += `<details open style="margin-top:6px;"><summary style="cursor:pointer;color:var(--violet);font-size:10px;font-weight:bold;">House Positions — From Ascendant / Moon / Sun (Natal)</summary>${this.renderHousePositionsTable(natalChakraData)}</details>`;

    if (transitChakraData) {
      html += this._renderChartPanels(transitCfgs, "Today's Transit — three lagnas");
      html += `<details open style="margin-top:8px;"><summary style="cursor:pointer;color:#00DD77;font-size:10px;font-weight:bold;">Today's Transit — House Positions From Natal Ascendant / Moon / Sun</summary>${this.renderTransitChakraTable(transitChakraData)}</details>`;
      html += this.renderTripleHousesSummary(transitChakraData);
    }

    html += `</div>`;
    return html;
  }
};