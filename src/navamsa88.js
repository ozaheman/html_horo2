/**
 * 88th Navamsa (Ashtashiti Navamsa) Engine
 * ------------------------------------------------------------------------
 * Based on the classical "Prashna Tantra" principle popularised by
 * Nitin P. Kashyap: out of the 108 navamshas in a chart (12 signs x 9
 * navamshas), the 88th navamsha (counted from the Lagna) is a specific,
 * rare and sensitive zone. Any planet occupying it in the birth chart (or
 * transiting over it — especially a slow-moving natural malefic) disturbs
 * career satisfaction, mental peace and domestic happiness connected with
 * the significations of that planet.
 *
 * TWO EQUIVALENT METHODS ARE IMPLEMENTED:
 *
 * 1. EXACT DEGREE METHOD
 *    - Take the Lagna degree, add 20 degrees, and locate that point in the
 *      10th house (or 11th house, if the addition overflows 30 degrees).
 *    - The specific navamsha pada (3d20') that this point falls into is
 *      the "88th Navamsha". Any planet sitting in that exact pada is
 *      "in the 88th Navamsha".
 *
 * 2. SIMPLIFIED (BHAVA) METHOD  — endorsed by the source video as the
 *    quick way to check the same thing:
 *    - Take any planet sitting in the 10th house or 11th house of the
 *      Rashi (D1) chart.
 *    - Cast its Navamsha (D9). If that planet falls in the 4th house of
 *      the D9 chart, it is "in the 88th Navamsha".
 *
 * Both methods are cross-checked here; the simplified method is treated as
 * authoritative when they disagree (this can happen near sign/pada
 * boundaries due to rounding), and the exact-degree method is shown for
 * transparency.
 * ------------------------------------------------------------------------
 */

(function () {

  const PADA_WIDTH = 10 / 3; // 3 deg 20'  (30/9)

  // ---------------------------------------------------------------------
  // Generic helpers
  // ---------------------------------------------------------------------

  function getLongitude(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj === 'number') return obj;
    if (obj.sid !== undefined) return obj.sid;
    if (obj.longitude !== undefined) return obj.longitude;
    if (obj.dlon !== undefined) return obj.dlon;
    if (obj.sn !== undefined) return (obj.sn * 30) + (obj.deg || 0);
    return null;
  }

  function normalize360(lon) {
    return ((lon % 360) + 360) % 360;
  }

  // Universal navamsha-sign formula: works for movable/fixed/dual signs
  // without branching, because the classical starting-point rule for each
  // sign type collapses to this single formula.
  function navamsaSignIndex(lon) {
    const norm = normalize360(lon);
    const signIndex = Math.floor(norm / 30);
    const partIndex = Math.floor((norm % 30) * 9 / 30);
    return (signIndex * 9 + partIndex) % 12;
  }

  function houseFromAsc(signIndex, ascSignIndex) {
    return ((signIndex - ascSignIndex + 12) % 12) + 1;
  }

  const PLANET_LIST = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  // Natural slow-moving malefics whose transit over the 88th Navamsha
  // point the source stresses the most (Sun is a "neutral"/fast mover and
  // is de-emphasised for transit purposes, though it still counts natally).
  const SLOW_MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

  const TRANSIT_CYCLE_NOTE = {
    Saturn: 'returns to this exact degree roughly every ~30 years (about twice from Lagna + Moon Lagna combined)',
    Mars: 'returns to this exact degree roughly every ~1.5-2 years',
    Rahu: 'returns to this exact degree roughly every ~18 years',
    Ketu: 'returns to this exact degree roughly every ~18 years',
    Sun: 'returns to this exact degree every year (generally mild, less critical to track)'
  };

  // Broad career/professional significations used to generate the
  // "avoid this line of work" / "prefer this line of work" guidance.
  const PLANET_CAREER_SIGNIFICATIONS = {
    Sun: 'government service, administration, politics, positions of authority, leadership roles',
    Moon: 'public-facing work, hospitality, dairy/liquids, nursing/care-giving, retail dealing with the public',
    Mars: 'real estate, defense/police/army, engineering, surgery, sports, land & property dealing',
    Mercury: 'trading, commission-based work, writing/media, banking & finance, accountancy, marketing, communication',
    Jupiter: 'teaching, law, consultancy, finance/banking, priesthood, counselling',
    Venus: 'arts, luxury goods, beauty & fashion, entertainment, design, diplomacy, partnerships',
    Saturn: 'labour-intensive work, mining, manufacturing, service to the masses, agriculture, long-term/slow-growth ventures',
    Rahu: 'foreign dealings, technology, unconventional/speculative fields, import-export',
    Ketu: 'research, spirituality, isolated or highly specialised technical work'
  };

  // ---------------------------------------------------------------------
  // Core computation
  // ---------------------------------------------------------------------

  /**
   * Exact-degree method: locate the 88th Navamsha point and see which
   * planet (if any) occupies that exact pada.
   */
  function computeExactPoint(ascendant) {
    const ascLon = getLongitude(ascendant);
    if (ascLon === null) return null;

    const ascSignIndex = Math.floor(normalize360(ascLon) / 30);
    const ascDegInSign = normalize360(ascLon) % 30;

    let targetDeg = ascDegInSign + 20;
    let houseOffset = 9;  // 10th house from Lagna (0-indexed offset)
    if (targetDeg >= 30) {
      targetDeg -= 30;
      houseOffset = 10; // spills over into the 11th house
    }

    const targetSignIndex = (ascSignIndex + houseOffset) % 12;
    const padaIndex = Math.floor(targetDeg / PADA_WIDTH);
    const padaStart = padaIndex * PADA_WIDTH;
    const padaEnd = padaStart + PADA_WIDTH;
    const originHouse = houseOffset === 9 ? 10 : 11;

    return {
      ascSignIndex, ascDegInSign, targetSignIndex, targetDeg,
      padaIndex, padaStart, padaEnd, originHouse
    };
  }

  function findPlanetAtExactPoint(planets, point) {
    if (!planets || !point) return null;
    let match = null;
    PLANET_LIST.forEach(name => {
      const p = planets[name];
      if (!p) return;
      const lon = getLongitude(p);
      if (lon === null) return;
      const norm = normalize360(lon);
      const signIndex = Math.floor(norm / 30);
      if (signIndex !== point.targetSignIndex) return;
      const degInSign = norm % 30;
      if (degInSign >= point.padaStart && degInSign < point.padaEnd) {
        match = { name, degInSign, house: point.originHouse };
      }
    });
    return match;
  }

  /**
   * Simplified/bhava method: any planet in the 10th or 11th house of D1
   * whose Navamsha (D9) house (counted from the D9/Navamsha ascendant) is
   * the 4th house.
   */
  function findPlanetsBySimplifiedMethod(planets, ascendant) {
    const ascLon = getLongitude(ascendant);
    if (ascLon === null || !planets) return [];

    const ascSignIndex = Math.floor(normalize360(ascLon) / 30);
    const d9AscSignIndex = navamsaSignIndex(ascLon);

    const matches = [];
    PLANET_LIST.forEach(name => {
      const p = planets[name];
      if (!p) return;
      const lon = getLongitude(p);
      if (lon === null) return;

      const signIndex = Math.floor(normalize360(lon) / 30);
      const d1House = (p.house !== undefined && p.house !== null) ? p.house : houseFromAsc(signIndex, ascSignIndex);

      if (d1House !== 10 && d1House !== 11) return;

      const d9SignIdx = navamsaSignIndex(lon);
      const d9House = houseFromAsc(d9SignIdx, d9AscSignIndex);

      if (d9House === 4) {
        matches.push({ name, originHouse: d1House, d9House });
      }
    });
    return matches;
  }

  /**
   * Full analysis combining both methods, plus career guidance, remedies
   * and transit-timing notes. Falls back to window.BIRTH_PLANETS /
   * window.BIRTH_ASC when planets/ascendant are not supplied, so it can be
   * called standalone from any panel.
   */
  function analyze(planets, ascendant, transitPlanets) {
    planets = planets || window.BIRTH_PLANETS;
    ascendant = ascendant || window.BIRTH_ASC;
    if (!planets || !ascendant) {
      return { available: false, reason: 'Birth chart data not available.' };
    }

    const exactPoint = computeExactPoint(ascendant);
    const exactMatch = findPlanetAtExactPoint(planets, exactPoint);
    const simplifiedMatches = findPlanetsBySimplifiedMethod(planets, ascendant);

    // Cross-validate: prefer the simplified method's result set; use the
    // exact method to corroborate / add degree-level detail.
    const occupantNames = new Set(simplifiedMatches.map(m => m.name));
    if (exactMatch && !occupantNames.has(exactMatch.name)) {
      simplifiedMatches.push({ name: exactMatch.name, originHouse: exactMatch.house, d9House: 4, fromExactOnly: true });
      occupantNames.add(exactMatch.name);
    }

    const occupied = simplifiedMatches.length > 0;

    const occupants = simplifiedMatches.map(m => {
      const p = planets[m.name] || {};
      return {
        name: m.name,
        originHouse: m.originHouse, // 10 or 11 in D1
        sign: p.sign || null,
        deg: p.deg !== undefined ? p.deg : null,
        careerDomain: PLANET_CAREER_SIGNIFICATIONS[m.name] || 'the significations of this planet',
        isSlowMalefic: SLOW_MALEFICS.includes(m.name)
      };
    });

    // Transit check (optional): is any transiting slow malefic currently
    // sitting on the natal 88th Navamsha degree?
    let activeTransit = null;
    if (transitPlanets && exactPoint) {
      SLOW_MALEFICS.concat(['Sun']).forEach(name => {
        const tp = transitPlanets[name];
        if (!tp) return;
        const lon = getLongitude(tp);
        if (lon === null) return;
        const norm = normalize360(lon);
        const signIndex = Math.floor(norm / 30);
        if (signIndex !== exactPoint.targetSignIndex) return;
        const degInSign = norm % 30;
        if (degInSign >= exactPoint.padaStart && degInSign < exactPoint.padaEnd) {
          activeTransit = name;
        }
      });
    }

    return {
      available: true,
      occupied,
      occupants,
      exactPoint,
      activeTransit,
      transitCycleNotes: TRANSIT_CYCLE_NOTE
    };
  }

  // ---------------------------------------------------------------------
  // Text / HTML rendering
  // ---------------------------------------------------------------------

  function buildRemediesList(occupants) {
    const generic = [
      'Before taking up a career/business tied to the flagged planet, weigh it against other well-placed yogas/karakas in the chart and prefer those instead.',
      'Track the transit of slow malefics (Saturn, Mars, Rahu, Ketu) over this exact natal degree (10th/11th house) — avoid major career decisions, resignations, or new ventures during that window.',
      'Check the same point from the Moon (Chandra) Lagna as well and give weight to whichever Lagna is stronger.',
      'Strengthen the 10th house / 10th lord generally through standard remedies for that planet (mantra, colour, charity) to soften the mental dissatisfaction this placement can bring.'
    ];
    return generic;
  }

  function houseWord(h) {
    return h === 10 ? '10th (career)' : '11th (gains/income)';
  }

  /**
   * Detailed renderer — meant for the Step-by-Step Panchang panel.
   */
  function renderStep2StepHTML(planets, ascendant, transitPlanets) {
    const r = analyze(planets, ascendant, transitPlanets);
    if (!r.available) {
      return `<div class="pred-item" style="border-left:3px solid var(--muted);margin-top:20px;">
        <div class="pred-title" style="color:var(--muted);">88th Navamsha (Ashtashiti Navamsha) Analysis</div>
        <div style="font-size:10px;color:var(--muted);">${r.reason}</div>
      </div>`;
    }

    const ep = r.exactPoint;
    const SIGNS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) || [];

    let body = '';
    if (!r.occupied) {
      body = `<div style="font-size:10.5px;color:var(--text);line-height:1.5;">
        No planet occupies the exact 88th Navamsha pada in this chart (a rare placement — only about 1 in 100 charts have it).
        Even so, watch the <b>transit</b> of slow-moving natural malefics (Saturn, Mars, Rahu, Ketu) over
        <b>${ep ? SIGNS[ep.targetSignIndex] : ''} ${ep ? ep.padaStart.toFixed(1) : ''}&deg;&ndash;${ep ? ep.padaEnd.toFixed(1) : ''}&deg;</b>
        in the ${ep ? houseWord(ep.originHouse) : ''} house — during that window avoid major career decisions in whichever house/planet's affairs are afflicted.
      </div>`;
    } else {
      const rows = r.occupants.map(o => `
        <div style="margin:6px 0;padding:8px;background:rgba(255,255,255,0.03);border-left:2px solid ${o.isSlowMalefic ? 'var(--rose)' : 'var(--gold)'};border-radius:3px;">
          <div style="font-size:11px;"><b style="color:var(--gold2);">${o.name}</b> is in the 88th Navamsha (originating from House ${o.originHouse} &rarr; Navamsha 4th house)${o.sign ? ` &mdash; ${o.sign}${o.deg !== null ? ' ' + parseFloat(o.deg).toFixed(1) + '&deg;' : ''}` : ''}</div>
          <div style="font-size:9.5px;color:var(--muted);margin-top:3px;">Career domain of ${o.name}: ${o.careerDomain}</div>
          <div style="font-size:9.5px;color:var(--cyan);margin-top:3px;">Effect: Work/career built primarily around ${o.name}'s significations will bring mental dissatisfaction, a sense of "this wasn't worth it" even on nominal success, and disturbance to domestic/marital contentment &mdash; because this planet's 7th aspect on the natal 4th house is echoed by its own presence in the Navamsha 4th house.</div>
        </div>`).join('');

      body = `<div style="font-size:10px;color:var(--muted);margin-bottom:6px;">
        Planet(s) occupying the sensitive 88th Navamsha zone (natal point: ${ep ? SIGNS[ep.targetSignIndex] : ''} ${ep ? ep.padaStart.toFixed(1) : ''}&deg;&ndash;${ep ? ep.padaEnd.toFixed(1) : ''}&deg; in House ${ep ? ep.originHouse : ''}):
      </div>${rows}`;
    }

    const transitNote = r.activeTransit
      ? `<div style="margin-top:8px;padding:8px;background:rgba(255,68,119,0.1);border-radius:4px;font-size:10px;color:var(--rose);">
          ⚠ Currently transiting: <b>${r.activeTransit}</b> is passing over the natal 88th Navamsha degree right now &mdash; ${r.transitCycleNotes[r.activeTransit] || ''}. Avoid major professional decisions during this period.
        </div>`
      : '';

    const remedies = buildRemediesList(r.occupants);

    return `<div class="pred-item" style="border-left:3px solid #ff6b6b;margin-top:20px;">
      <div class="pred-title" style="color:#ff6b6b;font-size:14px;text-align:center;">🎯 88th Navamsha (Ashtashiti Navamsha) Analysis</div>
      <div style="font-size:9.5px;color:var(--muted);text-align:center;margin-bottom:12px;">
        Rule: Lagna degree + 20&deg;, read in the 10th house &mdash; equivalently, any 10th/11th-house planet whose Navamsha (D9) falls in the 4th house. This zone disturbs career satisfaction &amp; domestic peace when work is built around the occupying planet.
      </div>
      ${body}
      ${transitNote}
      <div style="margin-top:10px;padding:8px;background:rgba(0,188,212,0.08);border-radius:4px;">
        <div style="font-size:10px;color:var(--cyan);font-weight:bold;margin-bottom:4px;">Remedies &amp; Guidance:</div>
        <ul style="margin:0;padding-left:16px;font-size:9.5px;color:var(--text);line-height:1.5;">
          ${remedies.map(rm => `<li>${rm}</li>`).join('')}
        </ul>
      </div>
    </div>`;
  }

  /**
   * Compact, career-focused renderer for the Business panel — states
   * clearly what to avoid and what to prefer.
   */
  function renderBusinessHTML(planets, ascendant, transitPlanets) {
    const r = analyze(planets, ascendant, transitPlanets);
    if (!r.available) {
      return `<div class="pred-item" style="color:var(--muted);">88th Navamsha check unavailable: ${r.reason}</div>`;
    }

    if (!r.occupied) {
      return `<div class="pred-item" style="border-left:3px solid var(--gold);">
        <div class="pred-title" style="color:var(--gold);">🎯 88th Navamsha Career Check</div>
        <div style="font-size:9px;color:var(--muted);">No natal planet occupies the 88th Navamsha &mdash; this specific caution does not apply. Still, avoid launching major ventures while a slow malefic (Saturn/Mars/Rahu/Ketu) transits the Lagna-degree+20&deg; point in the 10th/11th house.</div>
      </div>`;
    }

    const avoidList = r.occupants.map(o => `<b>${o.name}</b> (${o.careerDomain})`).join('; ');

    return `<div class="pred-item" style="border-left:3px solid #ff6b6b;">
      <div class="pred-title" style="color:#ff6b6b;">🎯 88th Navamsha Career Caution</div>
      <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Even though these planets may look favourable by classical house-placement rules, this specific Navamsha placement means a career/business built primarily on their significations brings prolonged mental dissatisfaction rather than the expected fulfilment.</div>
      <div style="margin:4px 0;padding:6px 8px;background:rgba(255,107,107,0.08);border-radius:4px;font-size:9px;">
        <b style="color:#ff6b6b;">Avoid centering your career/business on:</b> ${avoidList}
      </div>
      <div style="margin:4px 0;padding:6px 8px;background:rgba(0,221,119,.08);border-radius:4px;font-size:9px;">
        <b style="color:#00DD77;">Prefer instead:</b> career avenues driven by your chart's other strong yogas, well-placed Kendra/Trikona lords, or Raja/Dhana yoga karakas not listed above.
      </div>
      ${r.activeTransit ? `<div style="margin-top:4px;font-size:8.5px;color:var(--rose);">⚠ ${r.activeTransit} is transiting this exact degree now — a sensitive period for career/business decisions.</div>` : ''}
    </div>`;
  }

  window.NAVAMSA_88 = {
    analyze,
    computeExactPoint,
    navamsaSignIndex,
    renderStep2StepHTML,
    renderBusinessHTML,
    PLANET_CAREER_SIGNIFICATIONS
  };

})();
