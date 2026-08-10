/**
 * mundane_astrology.js
 * Mundane (national/collective) Astrology engine.
 *
 * Builds a "national radix" chart for a chosen country's founding moment,
 * runs Vimshottari dasha on it, layers current transits on top of it, and
 * scores a chosen event category using the convergence method described in
 * the app's Mundane Astrology reference notes (dasha + transit + angular +
 * ingress + lunar trigger).
 *
 * Reuses core engine primitives already defined in main.js:
 *   jd(), norm360(), computeAsc(), computeAll(), getAyanamsa(), getNakshatra(),
 *   buildVimsh(), getMoonNakLord(), VORD, VYRS, SIGNS, LORDS
 *
 * IMPORTANT: The founding date/time/location used per chart below are the
 * commonly-cited reference moments for each chart type. As the reference
 * notes stress, several are debated among mundane astrologers (exact minute,
 * or even which event should count as "birth"). Treat them as a starting
 * point for testing/rectification, not settled fact.
 */

window.MUNDANE_ASTROLOGY = (function () {

  // ═══════════════════════════════════════════════════════════
  //  COUNTRY CHART DATABASE
  //  date = local calendar date/time (JS Date, local fields only used
  //         for Y/M/D/H/M — timezone of the Date object itself is ignored,
  //         utcOff below is what's actually used for the conversion)
  // ═══════════════════════════════════════════════════════════
  const COUNTRIES = {
    india: {
      name: 'India',
      charts: {
        independence: { label: 'Independence — 15 Aug 1947, 00:00 IST, New Delhi', date: new Date(1947, 7, 15, 0, 0, 0), lat: 28.6139, lon: 77.2090, utcOff: 5.5 },
        republic:      { label: 'Republic — 26 Jan 1950, 10:18 IST, New Delhi', date: new Date(1950, 0, 26, 10, 18, 0), lat: 28.6139, lon: 77.2090, utcOff: 5.5 }
      }
    },
    usa: {
      name: 'United States',
      charts: {
        independence: { label: 'Declaration of Independence — 4 Jul 1776, 17:10 LMT, Philadelphia', date: new Date(1776, 6, 4, 17, 10, 0), lat: 39.9526, lon: -75.1652, utcOff: -5 }
      }
    },
    uk: {
      name: 'United Kingdom',
      charts: {
        union: { label: 'Act of Union — 1 Jan 1801, 00:00, London', date: new Date(1801, 0, 1, 0, 0, 0), lat: 51.5074, lon: -0.1278, utcOff: 0 }
      }
    },
    uae: {
      name: 'United Arab Emirates',
      charts: {
        founding: { label: 'Federation — 2 Dec 1971, 12:00, Dubai', date: new Date(1971, 11, 2, 12, 0, 0), lat: 25.2048, lon: 55.2708, utcOff: 4 }
      }
    },
    pakistan: {
      name: 'Pakistan',
      charts: {
        independence: { label: 'Independence — 14 Aug 1947, 00:00 IST, Karachi', date: new Date(1947, 7, 14, 0, 0, 0), lat: 24.8607, lon: 67.0011, utcOff: 5.5 }
      }
    },
    china: {
      name: 'China',
      charts: {
        founding: { label: "People's Republic founding — 1 Oct 1949, 15:00, Beijing", date: new Date(1949, 9, 1, 15, 0, 0), lat: 39.9042, lon: 116.4074, utcOff: 8 }
      }
    },
    russia: {
      name: 'Russia',
      charts: {
        federation: { label: 'Russian Federation — 12 Dec 1991, 12:00, Moscow', date: new Date(1991, 11, 12, 12, 0, 0), lat: 55.7558, lon: 37.6173, utcOff: 3 }
      }
    },
    france: {
      name: 'France',
      charts: {
        fifthRepublic: { label: 'Fifth Republic — 4 Oct 1958, 12:00, Paris', date: new Date(1958, 9, 4, 12, 0, 0), lat: 48.8566, lon: 2.3522, utcOff: 1 }
      }
    },
    germany: {
      name: 'Germany',
      charts: {
        reunification: { label: 'Reunification — 3 Oct 1990, 00:00, Berlin', date: new Date(1990, 9, 3, 0, 0, 0), lat: 52.5200, lon: 13.4050, utcOff: 1 }
      }
    },
    israel: {
      name: 'Israel',
      charts: {
        independence: { label: 'Independence — 14 May 1948, 16:00, Tel Aviv', date: new Date(1948, 4, 14, 16, 0, 0), lat: 32.0853, lon: 34.7818, utcOff: 2 }
      }
    },
    japan: {
      name: 'Japan',
      charts: {
        constitution: { label: 'Constitution effective — 3 May 1947, 00:00, Tokyo', date: new Date(1947, 4, 3, 0, 0, 0), lat: 35.6762, lon: 139.6503, utcOff: 9 }
      }
    },
    brazil: {
      name: 'Brazil',
      charts: {
        republic: { label: 'Republic proclaimed — 15 Nov 1889, 08:00, Rio de Janeiro', date: new Date(1889, 10, 15, 8, 0, 0), lat: -22.9068, lon: -43.1729, utcOff: -3 }
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  //  HOUSE SIGNIFICATIONS (mundane meanings)
  // ═══════════════════════════════════════════════════════════
  const HOUSE_MEANINGS = {
    1: 'Nation, people, national identity',
    2: 'Treasury, national wealth, revenue',
    3: 'Communications, transport, media',
    4: 'Land, agriculture, property, opposition',
    5: 'Education, children, entertainment, speculation',
    6: 'Workers, labour, disease, public services',
    7: 'Foreign relations, treaties, enemies',
    8: 'Death, debt, taxation, crisis, transformation',
    9: 'Religion, law, higher education, international matters',
    10: 'Government, ruler, administration',
    11: 'Parliament, gains, alliances, national objectives',
    12: 'Losses, expenditure, prisons, hospitals, hidden matters'
  };

  // ═══════════════════════════════════════════════════════════
  //  EVENT SIGNIFICATION MATRIX
  // ═══════════════════════════════════════════════════════════
  const EVENTS = {
    government_change: { label: 'Government Change / Political Instability', houses: [1, 4, 8, 9, 10], planets: ['Sun', 'Saturn', 'Mars', 'Rahu', 'Ketu'] },
    election:           { label: 'Elections', houses: [1, 5, 7, 10, 11], planets: ['Sun', 'Jupiter', 'Saturn'] },
    war_conflict:       { label: 'War / Conflict', houses: [1, 6, 7, 8], planets: ['Mars', 'Saturn', 'Rahu'] },
    economic_growth:    { label: 'Economic Growth / Prosperity', houses: [2, 5, 9, 11], planets: ['Jupiter', 'Venus'] },
    economic_crisis:    { label: 'Economic Crisis / Recession', houses: [2, 8, 12], planets: ['Saturn', 'Rahu'] },
    foreign_relations:  { label: 'Foreign Relations / Treaties', houses: [7, 9], planets: ['Venus', 'Jupiter', 'Mercury'] },
    natural_disaster:   { label: 'Natural Disaster', houses: [4, 8, 12], planets: ['Saturn', 'Mars', 'Rahu', 'Ketu'] },
    infrastructure:     { label: 'Infrastructure / Real-Estate Boom', houses: [4, 10, 11], planets: ['Saturn', 'Mars', 'Venus'] },
    mass_unrest:        { label: 'Mass Unrest / Public Disorder', houses: [1, 4, 6, 8], planets: ['Moon', 'Mars', 'Rahu'] },
    public_health:      { label: 'Public Health Crisis', houses: [6, 8, 12], planets: ['Saturn', 'Mars', 'Rahu'] }
  };

  const PLANET_LIST = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  // ── local helpers (don't touch the global BIRTH_* state) ──
  function houseOfSign(signNum, ascSignNum) {
    return ((signNum - ascSignNum + 12) % 12) + 1;
  }
  function houseLord(houseNum, ascSignNum) {
    return window.LORDS[(ascSignNum + houseNum - 1) % 12];
  }
  function getVimshFrom(vimshArr, d) {
    for (const v of vimshArr) if (d >= v.start && d < v.end) return v;
    return vimshArr[vimshArr.length - 1] || { lord: '?', end: new Date() };
  }

  /**
   * Build the national radix chart (D1 only — sufficient for mundane work).
   */
  function buildNationalChart(countryKey, chartKey) {
    const country = COUNTRIES[countryKey];
    if (!country) return null;
    const chart = country.charts[chartKey];
    if (!chart) return null;

    const d = chart.date;
    const utHour = d.getHours() + d.getMinutes() / 60 - chart.utcOff;
    const jday = window.jd(d.getFullYear(), d.getMonth() + 1, d.getDate(), utHour);

    const asc = window.computeAsc(jday, chart.lat, chart.lon, chart.utcOff, 'lahiri', 1);
    const raw = window.computeAll(jday, 'lahiri', 1);

    const planets = {};
    PLANET_LIST.forEach(p => {
      const rp = raw[p];
      if (!rp) return;
      const nak = window.getNakshatra ? window.getNakshatra(rp.sid) : { name: '', pada: 1 };
      planets[p] = { ...rp, house: houseOfSign(rp.sn, asc.sn), nak: nak.name, pada: nak.pada };
    });

    // Houses table: sign + lord + occupants
    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const signNum = (asc.sn + h - 1) % 12;
      const occupants = PLANET_LIST.filter(p => planets[p] && planets[p].house === h);
      houses.push({ num: h, sign: window.SIGNS[signNum], lord: window.LORDS[signNum], occupants, meaning: HOUSE_MEANINGS[h] });
    }

    // Vimshottari dasha from Moon's nakshatra at founding moment
    const nakInfo = window.getMoonNakLord(planets.Moon.sid);
    const vimsh = window.buildVimsh(d, nakInfo.lord, nakInfo.elapsed, window.VYRS[nakInfo.lord]);

    return { countryKey, chartKey, countryName: country.name, chartLabel: chart.label, jday, asc, planets, houses, vimsh, meta: chart };
  }

  /**
   * Current transiting planets (geocentric — location makes negligible
   * difference to sign-level transit placement), mapped onto the houses
   * of the given natal ascendant.
   */
  function getTransits(natalAscSignNum, refDate) {
    const now = refDate || new Date();
    const jNow = window.jd(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
      now.getUTCHours() + now.getUTCMinutes() / 60);
    const raw = window.computeAll(jNow, 'lahiri', 1);
    const transits = {};
    PLANET_LIST.forEach(p => {
      const rp = raw[p];
      if (!rp) return;
      transits[p] = { ...rp, house: houseOfSign(rp.sn, natalAscSignNum) };
    });
    return { jday: jNow, planets: transits, date: now };
  }

  /**
   * Score a chosen event category against a national chart + current transits.
   */
  function scoreEvent(chart, eventKey, refDate) {
    const ev = EVENTS[eventKey];
    if (!ev || !chart) return null;

    const transits = getTransits(chart.asc.sn, refDate);
    const now = transits.date;

    const md = getVimshFrom(chart.vimsh, now);
    const ad = (md.subs || []).find(s => now >= s.start && now < s.end) || null;
    const pd = ad ? (ad.subs || []).find(s => now >= s.start && now < s.end) : null;

    const findings = [];
    let score = 0;

    function add(pts, label) { score += pts; findings.push({ pts, label }); }

    // Dasha lord significations
    if (md && ev.planets.includes(md.lord)) add(2, `Mahadasha lord ${md.lord} is a direct significator of this event`);
    if (ad && ev.planets.includes(ad.lord)) add(3, `Antardasha lord ${ad.lord} is a direct significator of this event`);

    // Dasha lord ruling event houses
    if (md && ev.houses.includes(houseRuledBy(chart, md.lord))) add(2, `Mahadasha lord ${md.lord} rules house ${houseRuledBy(chart, md.lord)}, an event house`);
    if (ad && ev.houses.includes(houseRuledBy(chart, ad.lord))) add(2, `Antardasha lord ${ad.lord} rules house ${houseRuledBy(chart, ad.lord)}, an event house`);

    // Slow-planet transits into event houses
    ['Saturn', 'Jupiter'].forEach(p => {
      const h = transits.planets[p]?.house;
      if (h && ev.houses.includes(h)) add(2, `Transiting ${p} is activating house ${h} (${HOUSE_MEANINGS[h]})`);
    });
    ['Rahu', 'Ketu'].forEach(p => {
      const h = transits.planets[p]?.house;
      if (h && ev.houses.includes(h)) add(2, `Transiting ${p} is activating house ${h} (${HOUSE_MEANINGS[h]})`);
    });
    const marsHouse = transits.planets.Mars?.house;
    if (marsHouse && ev.houses.includes(marsHouse)) add(1, `Transiting Mars is activating house ${marsHouse} (${HOUSE_MEANINGS[marsHouse]})`);

    // Key house activations
    if (ev.houses.includes(10) && (chart.houses[9].occupants.length > 0 || transits.planets.Saturn?.house === 10 || transits.planets.Mars?.house === 10))
      add(3, '10th house (government) shows natal or transit activation');
    if (ev.houses.includes(8) && (chart.houses[7].occupants.length > 0 || transits.planets.Saturn?.house === 8 || transits.planets.Rahu?.house === 8))
      add(2, '8th house (crisis/transformation) shows natal or transit activation');
    if (ev.houses.includes(12) && (transits.planets.Saturn?.house === 12 || transits.planets.Rahu?.house === 12))
      add(2, '12th house (loss/hidden matters) is being transited by a slow malefic');

    // Angular (kendra) activation by a slow/node planet
    const kendras = [1, 4, 7, 10];
    ['Saturn', 'Jupiter', 'Rahu'].forEach(p => {
      const h = transits.planets[p]?.house;
      if (h && kendras.includes(h)) add(3, `Transiting ${p} is angular (house ${h}) from the national ascendant`);
    });

    // Aries-ingress style confirmation: Sun's transit house resonates with event houses
    const sunHouse = transits.planets.Sun?.house;
    if (sunHouse && ev.houses.includes(sunHouse)) add(2, `Transiting Sun is passing through house ${sunHouse}, reinforcing the current period`);

    // New/Full Moon trigger: Sun-Moon elongation near 0° or 180°
    const sunLon = transits.planets.Sun?.sid, moonLon = transits.planets.Moon?.sid;
    if (sunLon !== undefined && moonLon !== undefined) {
      let elong = Math.abs(sunLon - moonLon) % 360;
      if (elong > 180) elong = 360 - elong;
      if (elong <= 12) add(1, 'New Moon window — a lunar trigger is active');
      else if (elong >= 168) add(1, 'Full Moon window — a lunar trigger is active');
    }

    let level = 'Weak';
    if (score >= 15) level = 'Major Activation';
    else if (score >= 10) level = 'Strong';
    else if (score >= 6) level = 'Moderate';

    return { event: ev, eventKey, md, ad, pd, transits, score, level, findings };
  }

  function houseRuledBy(chart, planetName) {
    for (const h of chart.houses) if (h.lord === planetName) return h.num;
    return null;
  }

  // ═══════════════════════════════════════════════════════════
  //  HTML RENDERING
  // ═══════════════════════════════════════════════════════════
  function levelColor(level) {
    if (level === 'Major Activation') return 'var(--rose,#ff6688)';
    if (level === 'Strong') return 'var(--gold,#a67c00)';
    if (level === 'Moderate') return 'var(--cyan,#3AF0FF)';
    return 'var(--muted,#888)';
  }

  function renderReport(chart, result) {
    if (!chart || !result) {
      return `<div style="text-align:center;padding:30px;color:var(--muted);font-family:'Courier New',monospace;font-size:11px;">Could not build report — check inputs.</div>`;
    }
    const fmtD = d => d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
    const lc = levelColor(result.level);

    let html = `<div style="font-family:'Courier New',monospace;">`;

    html += `<div style="padding:12px;background:rgba(255,255,255,.03);border-radius:4px;border-left:3px solid var(--gold,#a67c00);margin-bottom:14px;">
      <div style="font-size:13px;color:var(--gold,#a67c00);font-weight:bold;">${chart.countryName}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:3px;">${chart.chartLabel}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:3px;">Ascendant: <strong style="color:var(--text)">${chart.asc.sign} ${chart.asc.deg}°</strong></div>
    </div>`;

    // Event + verdict
    html += `<div style="padding:12px;background:${lc}18;border:1px solid ${lc}55;border-radius:4px;margin-bottom:14px;text-align:center;">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">${result.event.label}</div>
      <div style="font-size:22px;font-weight:bold;color:${lc};margin:6px 0;">${result.level}</div>
      <div style="font-size:10px;color:var(--muted);">Score: ${result.score}</div>
    </div>`;

    // Dasha
    html += `<div class="sec-title" style="color:var(--gold,#a67c00);font-size:11px;margin:14px 0 6px;">CURRENT DASHA (as of ${fmtD(new Date())})</div>
      <div style="font-size:11px;color:var(--text);line-height:1.7;">
        MD: <strong>${result.md ? result.md.lord : '—'}</strong> (${fmtD(result.md?.start)} – ${fmtD(result.md?.end)})<br>
        AD: <strong>${result.ad ? result.ad.lord : '—'}</strong> (${fmtD(result.ad?.start)} – ${fmtD(result.ad?.end)})<br>
        PD: <strong>${result.pd ? result.pd.lord : '—'}</strong> (${fmtD(result.pd?.start)} – ${fmtD(result.pd?.end)})
      </div>`;

    // Findings
    html += `<div class="sec-title" style="color:var(--gold,#a67c00);font-size:11px;margin:14px 0 6px;">CONVERGING INDICATIONS</div>`;
    if (result.findings.length === 0) {
      html += `<div style="font-size:11px;color:var(--muted);">No strong indications converged for this period.</div>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;gap:6px;">`;
      result.findings.forEach(f => {
        html += `<div style="display:flex;gap:8px;align-items:flex-start;padding:6px 8px;background:rgba(255,255,255,.02);border-left:2px solid var(--cyan,#3AF0FF);border-radius:2px;">
          <span style="font-size:10px;color:var(--cyan,#3AF0FF);font-weight:bold;min-width:24px;">+${f.pts}</span>
          <span style="font-size:10.5px;color:var(--text);line-height:1.4;">${f.label}</span>
        </div>`;
      });
      html += `</div>`;
    }

    // Transit table
    html += `<div class="sec-title" style="color:var(--gold,#a67c00);font-size:11px;margin:14px 0 6px;">CURRENT TRANSITS (over national chart)</div>
      <table style="width:100%;font-size:10px;border-collapse:collapse;">
        <tr style="color:var(--muted);text-align:left;">
          <th style="padding:3px 6px;">Planet</th><th>Sign</th><th>House</th><th>Signification</th>
        </tr>`;
    PLANET_LIST.forEach(p => {
      const t = result.transits.planets[p];
      if (!t) return;
      html += `<tr style="border-top:1px solid rgba(255,255,255,.06);">
        <td style="padding:3px 6px;color:var(--text);">${p}</td>
        <td style="color:var(--text);">${t.sign}</td>
        <td style="color:var(--text);">${t.house}</td>
        <td style="color:var(--muted);">${HOUSE_MEANINGS[t.house]}</td>
      </tr>`;
    });
    html += `</table>`;

    // Natal houses summary
    html += `<div class="sec-title" style="color:var(--gold,#a67c00);font-size:11px;margin:14px 0 6px;">NATIONAL CHART — HOUSES</div>
      <table style="width:100%;font-size:10px;border-collapse:collapse;">
        <tr style="color:var(--muted);text-align:left;">
          <th style="padding:3px 6px;">H</th><th>Sign</th><th>Lord</th><th>Occupants</th>
        </tr>`;
    chart.houses.forEach(h => {
      const marker = result.event.houses.includes(h.num) ? 'border-left:2px solid var(--rose,#ff6688);' : '';
      html += `<tr style="border-top:1px solid rgba(255,255,255,.06);${marker}">
        <td style="padding:3px 6px;color:var(--text);">${h.num}</td>
        <td style="color:var(--text);">${h.sign}</td>
        <td style="color:var(--text);">${h.lord}</td>
        <td style="color:var(--muted);">${h.occupants.join(', ') || '—'}</td>
      </tr>`;
    });
    html += `</table>`;

    html += `<div style="margin-top:14px;padding:8px;font-size:9px;color:var(--muted);border-top:1px dashed rgba(255,255,255,.1);">
      Reference-chart based structural analysis, not a certain forecast. Founding time/location for some charts is debated among mundane astrologers — treat as a starting point for rectification against known history.
    </div>`;

    html += `</div>`;
    return html;
  }

  // Public API
  return {
    COUNTRIES,
    EVENTS,
    HOUSE_MEANINGS,
    buildNationalChart,
    getTransits,
    scoreEvent,
    renderReport,
    generateReport: function (countryKey, chartKey, eventKey, refDate) {
      const chart = buildNationalChart(countryKey, chartKey);
      const result = scoreEvent(chart, eventKey, refDate);
      return renderReport(chart, result);
    }
  };
})();