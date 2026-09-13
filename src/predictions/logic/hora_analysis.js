/**
 * hora_analysis.js
 * ---------------------------------------------------------------------------
 * HORA SYSTEM ENGINE — Vedic Astrology (Jyotish)
 * Implements the full Hora specification (Parashari D-2, Special D-2 Wealth
 * Variants, Surya-Chandra Court, Dynamic Kaal Hora, Mathematical Hora Lagna),
 * the Predictive Rule Engine (Dasha/Degree-Phase interpretation, Kaal Hora
 * career mapping, Muhurta-by-Kaarkatva, Retrograde handling, 4-Level Transit
 * Hierarchy), a North-Indian style SVG chart renderer for every divisional
 * Hora chart, and a per-planet interpretation table (NL/SL/SSL, nature,
 * result, effect) for each of those charts.
 *
 * Consistent with the app's existing prediction modules (analysis.js,
 * shadbala.js, graha_maitri.js): exposes a single global namespace,
 * window.HORA_ANALYSIS, and degrades gracefully when optional globals are
 * unavailable.
 *
 * Optional globals used when present (never required at load time):
 *   window.BIRTH_PLANETS, window.BIRTH_ASC, window.BIRTH, window.BIRTH_JD
 *   window.ASTRO_CONSTANTS   (constant.js)
 *   window.divLon            (main.js — precise divisional longitude)
 *   window.getHora           (main.js — precise sunrise/sunset based Kaal Hora)
 *   window.calcSunriseSunset (main.js)
 *   window.jd                (main.js — Julian Day helper)
 *   window.PREDICTION_FORECASTING.getCurrentDashaInfo() (forecasting.js)
 *
 * Key Functions:
 * - getParashariHora()        : D-2 Sun/Moon Hora for a longitude
 * - getLabhMandookHora()      : Gains & income-timing D-2 variant
 * - getParakramHora()         : Courage/effort-for-wealth D-2 variant
 * - getSanchayHora()          : Wealth accumulation/savings D-2 variant
 * - getCourtRole()            : Surya-Chandra planetary court placement
 * - getKaalHoraAtBirth()      : Ruling Hora lord at birth + dignity + theme
 * - getBirthDayKaalHoraTable(): Full 24-Hora day/night table for the birth day
 * - getTodayKaalHoraTable()   : Full 24-Hora day/night table for "now"
 * - computeMathematicalHoraLagna() : First-principles Hora Lagna (D1/D3/D12)
 * - getDashaHoraInterpretation()   : Dasha lord's Hora-quality + degree phase
 * - getRetrogradeNote()       : Vakri (retrograde) interpretation
 * - validateTransitTrigger()  : Enforces Dasha > Antar > Pratyantar > Gochar
 * - getD1Chart / getDivisionalSummary / getWealthHoraCharts : chart builders
 * - buildPlanetTable()        : Per-planet NL/SL/SSL, nature, result, effect
 * - renderNorthIndianChartSVG(): North-Indian style SVG chart for any chart
 * - HORA_TYPES_REFERENCE      : Researched reference guide, one flowing
 *   paragraph per Hora type covering chart form, calculation, usability, and
 *   prediction method
 * - getFullReport()           : Assembles everything per the reference schema
 * - renderHTML() / renderPanel(): Self-contained HTML report + floating panel
 *   (call window.showHoraAnalysis() from the console or wire it to a button)
 *
 * Research note: the "types of Hora" reference guide and the Kaal Hora
 * muhurta-activity table draw on classical Muhurta Shastra usage (e.g.
 * Muhurta Chintamani-style planetary-hour karakatva) and standard Parashari
 * divisional-chart usage (Brihat Parashara Hora Shastra's D-2 treatment),
 * consolidated here in the app's own words. NL/SL/SSL use the standard
 * 27-Nakshatra lord cycle and Vimshottari-proportion KP sub-lord method.
 */

window.HORA_ANALYSIS = (function () {

  const SIGNS_FALLBACK = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  function SIGNS() { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) || SIGNS_FALLBACK; }
  function ALL_PLANETS() {
    return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.PLANETS) ||
      ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  }

  const PLANET_ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };

  function norm360(a) { return ((a % 360) + 360) % 360; }
  function signNumOf(lon) { return Math.floor(norm360(lon) / 30) % 12; }
  function lonInSignOf(lon) { return norm360(lon) % 30; }
  // 0-indexed sign numbers: Aries=0 is classical sign #1 (odd). Even index -> classical odd sign.
  function isOddSign(signNum) { return signNum % 2 === 0; }
  function sidLonOf(p) { return (p && p.sid !== undefined) ? p.sid : ((p && p.longitude) || 0); }
  function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function esc(s) { return (s === undefined || s === null) ? '' : String(s); }

  // =========================================================================
  // DIVISIONAL LONGITUDE (self-contained; prefers the app's precise divLon)
  // =========================================================================
  function divLon(lon, div) {
    if (typeof window.divLon === 'function') {
      try { return window.divLon(lon, div); } catch (e) { /* fall through */ }
    }
    const signNum = signNumOf(lon);
    const lonInSign = lonInSignOf(lon);
    let targetSign;
    if (div === 1) return norm360(lon);
    if (div === 2) { // Parashari Hora
      if (signNum % 2 === 0) { targetSign = lonInSign < 15 ? 4 : 3; }
      else { targetSign = lonInSign < 15 ? 3 : 4; }
      return norm360(targetSign * 30 + (lonInSign * 2) % 30);
    }
    if (div === 3) {
      targetSign = (signNum + Math.floor(lonInSign / 10) * 4) % 12;
      return norm360(targetSign * 30 + (lonInSign * 3) % 30);
    }
    if (div === 9) {
      const p9 = Math.floor(lonInSign / (30 / 9));
      const triStart = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
      targetSign = (triStart[signNum] + p9) % 12;
      return norm360(targetSign * 30 + (lonInSign * 9) % 30);
    }
    if (div === 12) {
      targetSign = (signNum + Math.floor(lonInSign / (30 / 12))) % 12;
      return norm360(targetSign * 30 + (lonInSign * 12) % 30);
    }
    return norm360((lon * div) % 360); // last-resort proportional fallback
  }

  // =========================================================================
  // 2.1  PARASHARI HORA (D-2)
  // =========================================================================
  function getParashariHora(lon) {
    const signNum = signNumOf(lon);
    const half = lonInSignOf(lon) < 15 ? 1 : 2;
    let lord;
    if (signNum % 2 === 0) { lord = half === 1 ? 'Sun' : 'Moon'; }
    else { lord = half === 1 ? 'Moon' : 'Sun'; }
    return { lord, hora: lord === 'Sun' ? "Surya Hora" : "Chandra Hora", half, sign: SIGNS()[signNum] };
  }

  // =========================================================================
  // 2.2  SPECIAL DIVISIONAL HORA VARIANTS (Wealth timing)
  // =========================================================================
  function shiftSign(signNum, housesForward) { return (signNum + housesForward) % 12; }

  function buildWealthVariant(lon, forwardShift, natalAscSignNum) {
    const signNum = signNumOf(lon);
    const half = lonInSignOf(lon) < 15 ? 1 : 2;
    const resultSignNum = half === 1 ? signNum : shiftSign(signNum, forwardShift);
    const house = (natalAscSignNum !== undefined && natalAscSignNum !== null)
      ? (((resultSignNum - natalAscSignNum + 12) % 12) + 1) : null;
    return {
      half, natalSignNum: signNum, natalSign: SIGNS()[signNum],
      resultSignNum, resultSign: SIGNS()[resultSignNum], house
    };
  }

  /** Labh Mandook Hora — Gains & Timing of Income (2nd half -> 11th sign) */
  function getLabhMandookHora(lon, natalAscSignNum) { return buildWealthVariant(lon, 10, natalAscSignNum); }
  /** Parakram Hora — Courage & Effort for Wealth (2nd half -> 3rd sign) */
  function getParakramHora(lon, natalAscSignNum) { return buildWealthVariant(lon, 2, natalAscSignNum); }
  /** Sanchay Hora — Wealth Accumulation & Savings (2nd half -> 2nd sign) */
  function getSanchayHora(lon, natalAscSignNum) { return buildWealthVariant(lon, 1, natalAscSignNum); }

  // =========================================================================
  // 2.3  SURYA-CHANDRA HORA (Planetary Court System)
  // =========================================================================
  const SUN_COURT = { 4: "Sun (King)", 5: "Mercury", 6: "Venus", 7: "Mars", 8: "Jupiter", 10: "Saturn" };
  const MOON_COURT = { 3: "Moon (Queen)", 2: "Mercury", 1: "Venus", 0: "Mars", 11: "Jupiter", 9: "Saturn" };

  function getCourtRole(signNum) {
    if (SUN_COURT[signNum]) return { court: "Sun's Court (Right Hand)", minister: SUN_COURT[signNum] };
    if (MOON_COURT[signNum]) return { court: "Moon's Court (Left Hand)", minister: MOON_COURT[signNum] };
    return { court: 'Unassigned', minister: '-' };
  }

  // =========================================================================
  // NAKSHATRA / KP SUB-LORD ENGINE (NL, SL, SSL)
  // Standard 27-Nakshatra lord cycle + Vimshottari-proportion sub-division.
  // =========================================================================
  const NAK_LORD_CYCLE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const VIMSHOTTARI_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  const NAK_SPAN = 360 / 27; // 13°20'

  function nakshatraIndexOf(lon) { return Math.floor(norm360(lon) / NAK_SPAN) % 27; }
  function nakshatraLordOf(lon) { return NAK_LORD_CYCLE[nakshatraIndexOf(lon) % 9]; }

  function cyclicOrderFrom(lordIdx) {
    const order = [];
    for (let i = 0; i < 9; i++) order.push(NAK_LORD_CYCLE[(lordIdx + i) % 9]);
    return order;
  }

  /** Recursively subdivides by Vimshottari proportions to find the lord at a given depth (1=SL, 2=SSL). */
  function subLordChainOf(lon, depth) {
    let span = NAK_SPAN;
    let posInSpan = norm360(lon) % NAK_SPAN;
    let lordIdx = nakshatraIndexOf(lon) % 9;
    let currentLord = NAK_LORD_CYCLE[lordIdx];
    for (let d = 0; d < depth; d++) {
      const order = cyclicOrderFrom(lordIdx);
      let cum = 0, found = currentLord, foundStart = 0, foundSpan = span;
      for (let i = 0; i < order.length; i++) {
        const lord = order[i];
        const portion = span * (VIMSHOTTARI_YEARS[lord] / 120);
        if (posInSpan < cum + portion || i === order.length - 1) {
          found = lord; foundStart = cum; foundSpan = portion; break;
        }
        cum += portion;
      }
      currentLord = found;
      posInSpan = posInSpan - foundStart;
      span = foundSpan;
      lordIdx = NAK_LORD_CYCLE.indexOf(found);
    }
    return currentLord;
  }

  function getSubLord(lon) { return subLordChainOf(lon, 1); }
  function getSubSubLord(lon) { return subLordChainOf(lon, 2); }

  // =========================================================================
  // HOUSE SIGNIFICATIONS (generic keywords, used in the Result column)
  // =========================================================================
  const HOUSE_SIGNIFICATIONS = {
    1: 'self, personality, physical body', 2: 'wealth, family, speech, savings',
    3: 'courage, siblings, communication, effort', 4: 'home, mother, comforts, property',
    5: 'children, creativity, intelligence, romance', 6: 'enemies, debts, disease, service, obstacles',
    7: 'spouse, partnerships, public dealings', 8: 'transformation, longevity, hidden matters, sudden events',
    9: 'fortune, dharma, higher learning, father', 10: 'career, status, authority, public reputation',
    11: 'gains, income, aspirations, elder siblings', 12: 'losses, expenses, foreign lands, liberation'
  };
  function getHouseSignification(h) { return HOUSE_SIGNIFICATIONS[h] || 'general life matters'; }

  // =========================================================================
  // 3.1  DYNAMIC KAAL HORA (ruling planet of the hour)
  // =========================================================================
  function getKaalHoraAtBirth() {
    if (typeof window.getHora !== 'function' || !window.BIRTH_JD || !window.BIRTH || !window.BIRTH.date) return null;
    try {
      const horas = window.getHora(window.BIRTH_JD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff);
      if (!horas || !horas.length) return null;
      const bDate = window.BIRTH.date;
      let dayFrac = (bDate.getHours() + bDate.getMinutes() / 60 + bDate.getSeconds() / 3600) / 24;
      const sunriseFrac = horas[0].start;
      if (dayFrac < sunriseFrac) dayFrac += 1;
      let found = horas.find(h => dayFrac >= h.start && dayFrac < h.end);
      if (!found) found = horas[horas.length - 1];
      return found; // { lord, start, end, isDay }
    } catch (e) { return null; }
  }

  function getDignityTier(planetName) {
    const AC = window.ASTRO_CONSTANTS;
    const p = window.BIRTH_PLANETS && window.BIRTH_PLANETS[planetName];
    if (!p || !AC || !AC.DIGNITIES) return { tier: 'Unknown', detail: 'Birth chart not loaded' };
    const dign = AC.DIGNITIES[planetName];
    const sn = p.sn;
    let tier = 'Moderate', detail = 'Placed in a neutral/friendly sign';
    if (dign) {
      if (sn === dign.exalt) { tier = 'High'; detail = 'Exalted'; }
      else if (sn === dign.debilitation) { tier = 'Low'; detail = 'Debilitated'; }
      else if (dign.own && dign.own.includes(sn)) { tier = 'Moderate'; detail = 'Own sign'; }
    }
    if (tier === 'High' && [1, 4, 7, 10].includes(p.house)) detail += ' + Kendra placement (Digbali-like)';
    return { tier, detail, house: p.house, sign: p.sign };
  }

  // Section 4.3 — Kaal Hora & Professional Mapping.
  // NOTE: the Mars rows are transcribed exactly from the source specification.
  // Rows for the other six grahas are reasoned extensions built with the same
  // dignity-tier logic and classical karakatva — not verbatim from the source.
  const KAAL_HORA_CAREER_MAP = {
    Mars: {
      High: 'Military / Army Services (8th-house aspect dominance: destruction of enemies).',
      Moderate: 'Police / Enforcement Services (4th-house aspect dominance: maintaining domestic order).',
      Low: 'IAS / Civil Services / Magistrate (Dandadhikari — administrative authority).'
    },
    Sun: {
      High: 'Top government/political authority, administrative leadership.',
      Moderate: 'Public-sector executive or managerial role.',
      Low: 'Subordinate government or clerical-administrative post.'
    },
    Saturn: {
      High: 'Judiciary, large-scale labour administration, mining/heavy-industry leadership.',
      Moderate: 'Long-term salaried service, factory or labour management.',
      Low: 'Manual labour or service role — delayed but steady progress.'
    },
    Jupiter: {
      High: 'Judge, professor, senior legal/financial counsel, high priest.',
      Moderate: 'Teaching, consultancy, financial advisory.',
      Low: 'Support role within an educational or religious institution.'
    },
    Mercury: {
      High: 'Senior analyst, chartered accountant, top commerce/communications executive.',
      Moderate: 'Trade, writing, clerical or analytical work.',
      Low: 'Junior clerical or data-entry type role.'
    },
    Venus: {
      High: 'Creative-industry leadership — luxury goods, entertainment, arts direction.',
      Moderate: 'Design, hospitality, relationship-facing roles.',
      Low: 'Support role within arts, beauty, or service sector.'
    },
    Moon: {
      High: 'Public-facing leadership — medicine, hospitality, PR, popular politics.',
      Moderate: 'Nursing, caregiving, food/hospitality service.',
      Low: 'Domestic or care-support role with a fluctuating routine.'
    }
  };

  // Section 4.4 — Muhurta (Activity Selection) by Planet's Kaarkatva.
  // Full 7-planet table, cross-checked against classical planetary-hour usage.
  const MUHURTA_BY_PLANET = {
    Sun: 'Job interviews, meeting authority figures, executive decisions, government & leadership matters.',
    Moon: 'Travel (especially involving water), public dealing, domestic/home matters, matters concerning mother or women.',
    Mars: 'Property or technical matters, sports, competitive or surgical undertakings, courage-driven action.',
    Mercury: 'Educational admissions, commerce, contracts, analytical work, writing & communication.',
    Jupiter: 'Spiritual pursuits, higher learning, temple visits, legal consultation, financial expansion.',
    Venus: 'Friendship, romance, marriage discussions, creative arts, luxury or vehicle purchases.',
    Saturn: 'Long-term employment commencement, labor management, persistent hard work, agriculture, service.'
  };

  function fmtDayFrac(f) {
    const wrapped = ((f % 1) + 1) % 1;
    let hh = Math.floor(wrapped * 24);
    let mm = Math.round((wrapped * 24 - hh) * 60);
    if (mm === 60) { mm = 0; hh = (hh + 1) % 24; }
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  function buildKaalHoraTable(jday, lat, lon, utcOff, markHora) {
    if (typeof window.getHora !== 'function' || jday === undefined || lat === undefined || lon === undefined || utcOff === undefined) return null;
    let horas;
    try { horas = window.getHora(jday, lat, lon, utcOff); } catch (e) { return null; }
    if (!horas || !horas.length) return null;
    return horas.map((h, i) => ({
      index: i + 1, lord: h.lord, period: h.isDay ? 'Day' : 'Night',
      start: fmtDayFrac(h.start), end: fmtDayFrac(h.end),
      activity: MUHURTA_BY_PLANET[h.lord] || '-',
      isMarked: !!(markHora && h.lord === markHora.lord && Math.abs(h.start - markHora.start) < 1e-9 && Math.abs(h.end - markHora.end) < 1e-9)
    }));
  }

  function getBirthDayKaalHoraTable() {
    if (!window.BIRTH_JD || !window.BIRTH) return null;
    const birthHora = getKaalHoraAtBirth();
    return buildKaalHoraTable(window.BIRTH_JD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff, birthHora);
  }

  function getTodayKaalHoraTable(opts) {
    opts = opts || {};
    const lat = opts.lat !== undefined ? opts.lat : (window.BIRTH && window.BIRTH.lat);
    const lon = opts.lon !== undefined ? opts.lon : (window.BIRTH && window.BIRTH.lon);
    const utcOff = opts.utcOff !== undefined ? opts.utcOff : (window.BIRTH && window.BIRTH.utcOff);
    if (typeof window.jd !== 'function' || lat === undefined || lon === undefined || utcOff === undefined) return null;
    const now = new Date();
    const todayJd = window.jd(now.getFullYear(), now.getMonth() + 1, now.getDate(), 12);
    const horas = buildKaalHoraTable(todayJd, lat, lon, utcOff, null);
    if (!horas) return null;
    let nowFrac = (now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600) / 24;
    let raw;
    try { raw = window.getHora(todayJd, lat, lon, utcOff); } catch (e) { raw = null; }
    if (raw) {
      const sunriseFrac = raw[0] ? raw[0].start : 0;
      if (nowFrac < sunriseFrac) nowFrac += 1;
      const found = raw.find(h => nowFrac >= h.start && nowFrac < h.end);
      if (found) {
        const idx = raw.indexOf(found);
        if (horas[idx]) horas[idx].isMarked = true;
      }
    }
    return horas;
  }

  // =========================================================================
  // 3.2  MATHEMATICAL HORA LAGNA (First-Principles Longevity Engine)
  // =========================================================================
  function computeMathematicalHoraLagna() {
    if (!window.BIRTH || !window.BIRTH.date || !window.BIRTH_ASC || !window.BIRTH_PLANETS || !window.BIRTH_PLANETS.Sun) return null;

    let sunriseFrac;
    if (typeof window.calcSunriseSunset === 'function' && window.BIRTH_JD) {
      try { sunriseFrac = window.calcSunriseSunset(window.BIRTH_JD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff).sunrise; }
      catch (e) { sunriseFrac = 6 / 24; }
    } else { sunriseFrac = 6 / 24; }

    const bDate = window.BIRTH.date;
    let birthFrac = (bDate.getHours() + bDate.getMinutes() / 60 + bDate.getSeconds() / 3600) / 24;
    if (birthFrac < sunriseFrac) birthFrac += 1;

    const elapsedHours = (birthFrac - sunriseFrac) * 24;
    const totalMinutes = elapsedHours * 60;
    const horaIndexElapsed = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const degreesToAdd = remainingMinutes / 2;

    const ascSignNum = window.BIRTH_ASC.sn;
    const oddLagna = isOddSign(ascSignNum);
    const sunSid = sidLonOf(window.BIRTH_PLANETS.Sun);
    const ascSid = window.BIRTH_ASC.sid !== undefined ? window.BIRTH_ASC.sid : ascSignNum * 30;
    const basePoint = oddLagna ? sunSid : ascSid;
    const horaLagnaD1 = norm360(basePoint + degreesToAdd);

    const d3 = divLon(horaLagnaD1, 3);
    const d12 = divLon(horaLagnaD1, 12);

    const hlSign = signNumOf(horaLagnaD1);
    const distFromLagna = ((hlSign - ascSignNum + 12) % 12) + 1;
    let longevityKhanda;
    if ([1, 4, 5, 7, 9, 10].includes(distFromLagna)) longevityKhanda = 'Purnayu (full-longevity indication)';
    else if ([2, 6, 11].includes(distFromLagna)) longevityKhanda = 'Madhyayu (medium-longevity indication)';
    else longevityKhanda = 'Alpayu (short-longevity indication) — verify against other longevity yogas';

    return {
      basisLagnaType: oddLagna ? "Odd Natal Lagna → degrees added to Sun's position" : "Even Natal Lagna → degrees added to natal Lagna's position",
      horaIndexElapsed, remainingMinutes: +remainingMinutes.toFixed(2), degreesAdded: +degreesToAdd.toFixed(2),
      d1Degree: +horaLagnaD1.toFixed(2), d1Sign: SIGNS()[hlSign],
      d3Degree: +lonInSignOf(d3).toFixed(2), d3Sign: SIGNS()[signNumOf(d3)],
      d12Degree: +lonInSignOf(d12).toFixed(2), d12Sign: SIGNS()[signNumOf(d12)],
      longevityKhanda
    };
  }

  // =========================================================================
  // 4.1 / 4.2  DASHA & DEGREE-PHASE INTERPRETATION ENGINE
  // =========================================================================
  function getDashaHoraInterpretation(dashaLordName) {
    const p = window.BIRTH_PLANETS && window.BIRTH_PLANETS[dashaLordName];
    if (!p) return null;
    const sid = sidLonOf(p);
    const hora = getParashariHora(sid);
    const deg = lonInSignOf(sid);
    const phase = deg <= 5
      ? 'Early (0°-5°, Purna Bali — peak planetary strength)'
      : (deg >= 10 ? 'Ending (10°-15°, Ksheen — diminishing / transition phase)' : 'Middle degrees');

    const AC = window.ASTRO_CONSTANTS;
    const isBenefic = AC && AC.BENEFICS && AC.BENEFICS.includes(dashaLordName);
    const isMalefic = AC && AC.MALEFICS && AC.MALEFICS.includes(dashaLordName);

    let effortLevel;
    if (hora.lord === 'Moon') {
      effortLevel = isBenefic
        ? 'Maximum smooth results, happiness, comfort (Mridu — gentle, low friction).'
        : isMalefic ? 'Reduced cruelty; possible loss of drive unless supported by dignity.'
          : 'Gentle, smooth outcomes with low friction.';
    } else {
      effortLevel = isBenefic
        ? 'Positive results achieved through continuous effort (a hard taskmaster, but favorable).'
        : isMalefic ? 'Channelled administrative power, bravery, administrative success.'
          : 'Requires hard work, intense effort, and struggle.';
    }

    let note = '';
    if (deg <= 5) note = hora.lord === 'Sun' ? 'Heavy initial physical workload.' : 'Effortless initial successes.';

    return { dashaLord: dashaLordName, horaType: hora.hora, degreePhase: phase, effortLevel, note };
  }

  // =========================================================================
  // 4.5  RETROGRADE (VAKRI) HANDLING
  // =========================================================================
  function getRetrogradeNote(planetName) {
    const p = window.BIRTH_PLANETS && window.BIRTH_PLANETS[planetName];
    if (!p || !p.retro) return null;
    return {
      planet: planetName,
      note: 'Retrograde (Vakri): not inherently negative. Delivers results suddenly and unexpectedly, often beyond normal expectations/magnitude.'
    };
  }

  // =========================================================================
  // 4.6  HIERARCHY OF TRANSIT (GOCHAR) ANALYSIS
  // =========================================================================
  function validateTransitTrigger({ dashaLord, antarLord, pratyantarLord, natalPromiseConfirmed } = {}) {
    const chainActive = !!(dashaLord && antarLord);
    return {
      sequence: 'Dasha (1st) → Antardasha (2nd) → Pratyantardasha (3rd) → Gochar/Transit (4th)',
      dashaLord: dashaLord || null, antarLord: antarLord || null, pratyantarLord: pratyantarLord || null,
      canTransitTrigger: !!(chainActive && natalPromiseConfirmed),
      reasoning: (chainActive && natalPromiseConfirmed)
        ? 'The active Dasha/Antardasha/Pratyantardasha lords promise this event in the natal chart — the transit may now trigger it.'
        : 'No confirmed natal promise from the active Dasha chain — per the Hierarchy of Transit rule, the transit alone cannot manifest this result.'
    };
  }

  // =========================================================================
  // TYPES OF HORA — RESEARCHED REFERENCE GUIDE (paragraph form)
  // =========================================================================
  const HORA_TYPES_REFERENCE = [
    {
      id: 'parashari_d2', name: 'Parashari Hora (D-2)',
      paragraph: "The Parashari Hora, or D-2 chart, is the second divisional chart in the classical Parashari sixteen-varga system, and it takes an unusual chart form: every planet collapses into just one of two signs — Leo, called the Sun's Hora, or Cancer, called the Moon's Hora — no matter which sign it occupies natally. It is calculated by splitting each 30° sign into two 15° halves: in odd signs the first half belongs to the Sun and the second to the Moon, while in even signs the order reverses. Its primary usability is wealth (Dhana) and prosperity (Sampatti) analysis, always read alongside D1's 2nd, 11th, 5th and 9th houses rather than in isolation. For prediction, planets in the Sun's Hora point to self-earned, authority-driven wealth, while planets in the Moon's Hora point to inherited, family-linked, liquidity-driven wealth; the overall balance across all planets, confirmed against D1 strength and the running Dasha, shows the native's dominant earning style."
    },
    {
      id: 'labh_mandook', name: 'Labh Mandook Hora',
      paragraph: "Labh Mandook Hora is a special D-2 variant named for its 'frog-jump' (Mandook) rule: its chart form keeps a planet in its natal sign for the first half of that sign (0°-15°), then leaps it forward to the 11th sign from natal for the second half (15°-30°). This makes it a finer-grained gains-timing tool than the plain D-2. Its usability lies specifically in timing financial gains, income spikes, and windfalls under a given planet's Dasha or Antardasha. For prediction, the placement of a Dasha lord's Labh Mandook result relative to the natal Lagna matters most: a fall into a gain-supportive house — the 11th, 2nd, 5th, or 9th — suggests real income gains are more likely to manifest during that lord's period, while a fall elsewhere suggests gains will need extra support from other yogas to show up."
    },
    {
      id: 'parakram', name: 'Parakram Hora',
      paragraph: "Parakram Hora is a second special D-2 variant, built the same way as Labh Mandook but with the 2nd-half jump going to the 3rd sign from natal instead of the 11th. Its chart form therefore keeps a planet natal for 0°-15° and shifts it three signs forward for 15°-30°. It is used to judge whether a native's path to wealth demands proactive effort, courage, and initiative, or arrives more passively. In prediction, a Dasha lord whose Parakram Hora result lands in an effort-linked house — the 3rd, 6th, or 10th — points toward wealth built through competition, initiative, or hard graft during that period, whereas a fall into the 4th, 9th, or 12th suggests the same wealth can arrive with comparatively less struggle."
    },
    {
      id: 'sanchay', name: 'Sanchay Hora',
      paragraph: "Sanchay Hora is the third special D-2 variant: it keeps a planet in its natal sign for the first half (0°-15°) and shifts it just one sign forward, to the 2nd from natal, for the second half (15°-30°). Where Labh Mandook times income and Parakram gauges effort, Sanchay Hora is used specifically to judge capital preservation — savings discipline and how well accumulated wealth is retained rather than spent or lost. For prediction, a Dasha lord whose Sanchay Hora result falls into an accumulation house — the 2nd or 11th — favors real savings retention during that period, while a fall into a loss-prone house — the 8th or 12th — warns of financial leakage or poor retention even if income itself is healthy."
    },
    {
      id: 'surya_chandra_court', name: 'Surya-Chandra Hora (Planetary Court)',
      paragraph: "The Surya-Chandra Hora, or planetary court system, is not a separate divisional chart but a relational overlay placed directly on D1: it groups all twelve signs into two courts, the Sun's court (the 'Right Hand', comprising Leo itself plus Virgo, Libra, Scorpio, Sagittarius, and Aquarius held respectively by Mercury, Venus, Mars, Jupiter, and Saturn as ministers) and the Moon's court (the 'Left Hand', comprising Cancer itself plus Gemini, Taurus, Aries, Pisces, and Capricorn held by the same five ministers). Its usability is symbolic and temperamental rather than quantitative — it offers a lens for reading whether a planet, and by extension the native, tends to operate in a more solar (willful, authority-driven) or lunar (adaptive, people-facing) mode. For prediction, simply counting how many natal planets cluster in each court reveals whether the chart as a whole leans toward assertive self-direction or collaborative, emotionally-attuned decision-making."
    },
    {
      id: 'kaal_hora', name: 'Kaal Hora (Dynamic Planetary Hour)',
      paragraph: "Kaal Hora is fundamentally different from the divisional charts above — its chart form is temporal rather than spatial: the period from one sunrise to the next is divided into 24 unequal Horas, 12 across the daylight hours and 12 across the night, each ruled in turn by one of the seven classical planets in fixed Chaldean order. It is calculated by dividing the day's length by 12 to get one day-Hora's duration and the night's length by 12 for one night-Hora, so a Hora's clock-length shifts with the season and the native's latitude; the weekday's own ruling planet always governs the first day-Hora, after which the sequence cycles Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars, repeating. Its usability is broad: it is the backbone of everyday Muhurta for choosing auspicious moments to travel, meet, buy, or undergo a procedure, and in Nadi Jyotish it additionally stands as a complete predictive system in its own right, used for horary questions, birth-time rectification, and day-to-day event forecasting. For prediction, an activity is matched to the ruling planet's natural karakatva, and a Hora is judged more favorable for a given native specifically when its ruling planet is also well-placed or strong in that native's own birth chart, not merely favorable in the abstract."
    },
    {
      id: 'hora_lagna', name: 'Mathematical Hora Lagna',
      paragraph: "The Mathematical Hora Lagna is not a chart of planets but a single calculated sensitive point, derived first onto D1 and then carried through the D3 and D12 divisional charts for longevity analysis. It is calculated by measuring the elapsed time from sunrise to the exact birth moment, converting the leftover minutes within the final Hora into degrees (minutes divided by two), and adding that degree value either to the natal Sun's position — if the ascendant falls in a classically odd sign — or to the natal Lagna itself, if the ascendant is even. Its usability is squarely in Ayurdaya, or longevity analysis, where it helps classify a chart into Alpayu (short), Madhyayu (medium), or Purnayu (full) longevity bands in the spirit of Phaladeepika-style methodology. For prediction, the house relationship between the Hora Lagna's resulting sign and the natal Lagna determines which longevity band the chart leans toward — a reading that should always be cross-checked against other classical longevity yogas rather than relied on alone."
    }
  ];

  // =========================================================================
  // CHART BUILDERS — D1, D9, D3, D12, D2 (Parashari + Wealth variants), Court
  // =========================================================================
  function getD1Chart() {
    const bp = window.BIRTH_PLANETS, asc = window.BIRTH_ASC;
    if (!bp || !asc) return null;
    const planets = ALL_PLANETS().filter(n => bp[n]).map(n => {
      const p = bp[n];
      return { planet: n, sign: p.sign || SIGNS()[p.sn], degree: p.deg, house: p.house, nakshatra: p.nak, retro: !!p.retro };
    });
    return { ascendant: { sign: asc.sign, degree: asc.deg }, ascSignNum: asc.sn, planets };
  }

  function getDivisionalSummary(div, label) {
    const bp = window.BIRTH_PLANETS, asc = window.BIRTH_ASC;
    if (!bp || !asc) return null;
    const ascSid = asc.sid !== undefined ? asc.sid : asc.sn * 30;
    const dAscSign = signNumOf(divLon(ascSid, div));
    const planets = ALL_PLANETS().filter(n => bp[n]).map(n => {
      const dl = divLon(sidLonOf(bp[n]), div);
      const sn = signNumOf(dl);
      const house = ((sn - dAscSign + 12) % 12) + 1;
      return { planet: n, sign: SIGNS()[sn], degree: +lonInSignOf(dl).toFixed(2), house };
    });
    return { label, ascendantSign: SIGNS()[dAscSign], ascSignNum: dAscSign, planets };
  }

  function getD2HoraChart() {
    const bp = window.BIRTH_PLANETS;
    if (!bp) return null;
    return ALL_PLANETS().filter(n => bp[n]).map(n => {
      const h = getParashariHora(sidLonOf(bp[n]));
      return { planet: n, hora: h.hora, lord: h.lord, natalSign: bp[n].sign };
    });
  }

  function getWealthHoraCharts() {
    const bp = window.BIRTH_PLANETS, asc = window.BIRTH_ASC;
    if (!bp) return null;
    const natalAscSignNum = asc ? asc.sn : undefined;
    const build = fn => ALL_PLANETS().filter(n => bp[n]).map(n => {
      const r = fn(sidLonOf(bp[n]), natalAscSignNum);
      return {
        planet: n, sign: r.resultSign, signNum: r.resultSignNum, natalSign: r.natalSign,
        house: r.house, half: r.half, degree: +lonInSignOf(sidLonOf(bp[n])).toFixed(2)
      };
    });
    return {
      labhMandook: { label: 'Labh Mandook Hora', ascSignNum: natalAscSignNum, ascendantSign: asc ? asc.sign : null, planets: build(getLabhMandookHora) },
      parakram: { label: 'Parakram Hora', ascSignNum: natalAscSignNum, ascendantSign: asc ? asc.sign : null, planets: build(getParakramHora) },
      sanchay: { label: 'Sanchay Hora', ascSignNum: natalAscSignNum, ascendantSign: asc ? asc.sign : null, planets: build(getSanchayHora) }
    };
  }

  function getSuryaChandraCourtChart() {
    const bp = window.BIRTH_PLANETS;
    if (!bp) return null;
    return ALL_PLANETS().filter(n => bp[n]).map(n => {
      const role = getCourtRole(bp[n].sn);
      return { planet: n, sign: bp[n].sign, court: role.court, minister: role.minister };
    });
  }

  // =========================================================================
  // PER-PLANET INTERPRETATION TABLE (NL / SL / SSL, Nature, Result, Effect)
  // =========================================================================
  function getChartSpecificEffect(chartTypeId, planetName, signName, house) {
    switch (chartTypeId) {
      case 'd1': return `Natal placement — colors how ${planetName} expresses itself through the significations of house ${house}.`;
      case 'd9': return `In Navamsa, ${planetName} here speaks to marriage strength and inner dharma tied to house ${house}'s themes.`;
      case 'd3': return `In Drekkana, ${planetName} here relates to courage, siblings, and effort connected to house ${house}.`;
      case 'd12': return `In Dwadasamsha, ${planetName} here reflects parental legacy and ancestry connected to house ${house}.`;
      case 'parashari_d2': {
        const isSun = signName === 'Leo';
        return isSun
          ? `${planetName} falls in Sun's Hora — wealth here tends to be self-earned, active, and authority-driven.`
          : `${planetName} falls in Moon's Hora — wealth here tends to be inherited/family-linked and liquidity-driven.`;
      }
      case 'labh_mandook_hora': {
        const favorable = [11, 2, 5, 9].includes(house);
        return favorable
          ? `Favorable placement for income timing — gains via ${planetName}'s Dasha are more likely to manifest.`
          : `Less direct gains placement — ${planetName}'s Dasha may need supporting yogas for financial gains to manifest.`;
      }
      case 'parakram_hora': {
        const effortHouse = [3, 6, 10].includes(house);
        return effortHouse
          ? `Effort-linked house — wealth through ${planetName}'s Dasha likely requires initiative or competition.`
          : `Comparatively easier house — wealth through ${planetName}'s Dasha may arrive with less struggle.`;
      }
      case 'sanchay_hora': {
        if ([2, 11].includes(house)) return `Accumulation house — supports savings retention during ${planetName}'s Dasha.`;
        if ([8, 12].includes(house)) return `Loss-prone house — risk of leakage or poor retention during ${planetName}'s Dasha.`;
        return `Neutral for savings — retention depends on other supporting factors during ${planetName}'s Dasha.`;
      }
      default: return `Placed in house ${house}.`;
    }
  }

  function buildPlanetTable(planets, chartTypeId) {
    if (!planets) return [];
    const AC = window.ASTRO_CONSTANTS;
    return planets.map(p => {
      const natal = window.BIRTH_PLANETS && window.BIRTH_PLANETS[p.planet];
      const sid = natal ? sidLonOf(natal) : null;
      const nl = sid !== null ? nakshatraLordOf(sid) : '-';
      const sl = sid !== null ? getSubLord(sid) : '-';
      const ssl = sid !== null ? getSubSubLord(sid) : '-';
      let nature = 'Neutral';
      if (AC && AC.BENEFICS && AC.BENEFICS.includes(p.planet)) nature = 'Benefic';
      else if (AC && AC.MALEFICS && AC.MALEFICS.includes(p.planet)) nature = 'Malefic';
      const dign = getDignityTier(p.planet);
      const houseSig = getHouseSignification(p.house);
      const result = p.house
        ? `${dign.tier !== 'Unknown' ? dign.tier + ' (' + dign.detail + ')' : 'Placement noted'} in the ${ordinal(p.house)} house — ${houseSig}.`
        : 'House not determined for this variant.';
      const effect = p.house ? getChartSpecificEffect(chartTypeId, p.planet, p.sign, p.house) : '-';
      return {
        planet: p.planet, sign: p.sign, house: p.house || '-',
        degree: p.degree !== undefined ? p.degree : p.deg, nl, sl, ssl, nature, result, effect
      };
    });
  }

  // =========================================================================
  // NORTH-INDIAN STYLE SVG CHART RENDERER
  // Standard 12-house North Indian layout: houses 1/4/7/10 are the four
  // "kite" shapes at top/right/bottom/left; each corner holds two triangular
  // houses. House 1 (Lagna) is always the top kite; the sign occupying each
  // house rotates with the chart's own ascendant.
  // =========================================================================
  // House-number layout runs ANTICLOCKWISE from house 1 (top): 2/3 sit to the
  // upper-left, 4 is the left kite, 5/6 lower-left, 7 bottom kite, 8/9
  // lower-right, 10 the right kite, 11/12 upper-right, back to 1. Since a
  // house's occupying sign is (ascSignNum + house - 1), this direction is
  // what makes the sign numbers themselves read anticlockwise too.
  const HOUSE_POLYS = {
    1: [[220, 20], [320, 120], [220, 220], [120, 120]],
    2: [[120, 120], [20, 20], [220, 20]],
    3: [[20, 220], [20, 20], [120, 120]],
    4: [[20, 220], [120, 120], [220, 220], [120, 320]],
    5: [[120, 320], [20, 420], [20, 220]],
    6: [[220, 420], [20, 420], [120, 320]],
    7: [[220, 420], [120, 320], [220, 220], [320, 320]],
    8: [[320, 320], [420, 420], [220, 420]],
    9: [[420, 220], [420, 420], [320, 320]],
    10: [[420, 220], [320, 320], [220, 220], [320, 120]],
    11: [[320, 120], [420, 20], [420, 220]],
    12: [[220, 20], [420, 20], [320, 120]]
  };

  function renderNorthIndianChartSVG(chart, title) {
    if (!chart || chart.ascSignNum === undefined || chart.ascSignNum === null || !chart.planets) {
      return `<p style="color:var(--muted,#888);font-size:11px;">${esc(title)}: chart data unavailable — compute/load a birth chart first.</p>`;
    }
    const planetsByHouse = {};
    chart.planets.forEach(p => {
      if (!p.house) return;
      (planetsByHouse[p.house] = planetsByHouse[p.house] || []).push(p.planet);
    });
    let svg = `<svg viewBox="0 0 440 460" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;width:100%;height:auto;display:block;margin:6px auto;color:var(--text,#ddd);">`;
    svg += `<text x="220" y="18" text-anchor="middle" font-size="15" font-weight="bold" fill="var(--gold,#c8a84b)">${esc(title)}</text>`;
    svg += `<g transform="translate(0,28)">`;
    svg += `<rect x="20" y="20" width="400" height="400" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    svg += `<line x1="20" y1="420" x2="420" y2="20" stroke="currentColor" stroke-width="1"/>`;
    svg += `<line x1="20" y1="20" x2="420" y2="420" stroke="currentColor" stroke-width="1"/>`;
    svg += `<polygon points="220,420 420,220 220,20 20,220" fill="none" stroke="currentColor" stroke-width="1"/>`;
    for (let h = 1; h <= 12; h++) {
      const poly = HOUSE_POLYS[h];
      const cx = poly.reduce((s, pt) => s + pt[0], 0) / poly.length;
      const cy = poly.reduce((s, pt) => s + pt[1], 0) / poly.length;
      const signNum = (chart.ascSignNum + h - 1) % 12;
      svg += `<text x="${cx}" y="${cy - 16}" text-anchor="middle" font-size="10" fill="var(--muted,#999)">${signNum + 1}</text>`;
      const abbrs = (planetsByHouse[h] || []).map(pn => PLANET_ABBR[pn] || pn.slice(0, 2));
      const lineCount = Math.max(1, Math.ceil(abbrs.length / 3));
      for (let li = 0; li * 3 < abbrs.length; li++) {
        const line = abbrs.slice(li * 3, li * 3 + 3).join(' ');
        svg += `<text x="${cx}" y="${cy + 2 + li * 13}" text-anchor="middle" font-size="12" font-weight="600" fill="currentColor">${esc(line)}</text>`;
      }
      if (h === 1) {
        const ascLineY = cy + 2 + lineCount * 13 + 8;
        svg += `<text x="${cx}" y="${ascLineY}" text-anchor="middle" font-size="9" fill="var(--gold2,#e0c060)">Asc</text>`;
      }
    }
    svg += `</g></svg>`;
    return svg;
  }

  // =========================================================================
  // FULL REPORT (matches the reference System Output Schema, extended)
  // =========================================================================
  function getFullReport(opts) {
    opts = opts || {};
    const kaalHora = getKaalHoraAtBirth();
    const dignity = kaalHora ? getDignityTier(kaalHora.lord) : null;
    const career = (kaalHora && dignity)
      ? ((KAAL_HORA_CAREER_MAP[kaalHora.lord] || {})[dignity.tier] || 'No career mapping available for this planet.')
      : null;

    let currentMD = opts.mahadashaLord || null;
    if (!currentMD && window.PREDICTION_FORECASTING && typeof window.PREDICTION_FORECASTING.getCurrentDashaInfo === 'function') {
      try { currentMD = (window.PREDICTION_FORECASTING.getCurrentDashaInfo(new Date()) || {}).mahadashaLord || null; } catch (e) { /* ignore */ }
    }
    const dashaHora = currentMD ? getDashaHoraInterpretation(currentMD) : null;
    const retro = window.BIRTH_PLANETS ? ALL_PLANETS().map(getRetrogradeNote).filter(Boolean) : [];

    // --- Uniform chart builders, each with planetTable attached ---
    const d1raw = getD1Chart();
    const d1 = d1raw ? {
      label: 'D1 - Rashi (Birth Chart)', ascendantSign: d1raw.ascendant.sign, ascSignNum: d1raw.ascSignNum,
      planets: d1raw.planets.map(p => ({ planet: p.planet, sign: p.sign, house: p.house, degree: p.degree, nakshatra: p.nakshatra, retro: p.retro }))
    } : null;
    if (d1) d1.planetTable = buildPlanetTable(d1.planets, 'd1');

    const d9 = getDivisionalSummary(9, 'D9 - Navamsa (Spouse & Dharma)');
    if (d9) d9.planetTable = buildPlanetTable(d9.planets, 'd9');
    const d3 = getDivisionalSummary(3, 'D3 - Drekkana (Siblings & Courage)');
    if (d3) d3.planetTable = buildPlanetTable(d3.planets, 'd3');
    const d12 = getDivisionalSummary(12, 'D12 - Dwadasamsha (Parents)');
    if (d12) d12.planetTable = buildPlanetTable(d12.planets, 'd12');
    const parashariD2 = getDivisionalSummary(2, 'D2 - Parashari Hora (Wealth)');
    if (parashariD2) parashariD2.planetTable = buildPlanetTable(parashariD2.planets, 'parashari_d2');

    const wealth = getWealthHoraCharts();
    if (wealth) {
      wealth.labhMandook.planetTable = buildPlanetTable(wealth.labhMandook.planets, 'labh_mandook_hora');
      wealth.parakram.planetTable = buildPlanetTable(wealth.parakram.planets, 'parakram_hora');
      wealth.sanchay.planetTable = buildPlanetTable(wealth.sanchay.planets, 'sanchay_hora');
    }

    return {
      kaal_hora_at_birth: kaalHora ? {
        ruler: kaalHora.lord,
        dignity_state: dignity ? `${dignity.tier} (${dignity.detail})` : 'Unknown',
        predicted_life_theme: career || 'N/A',
        muhurta_domain: MUHURTA_BY_PLANET[kaalHora.lord] || 'N/A'
      } : null,
      hora_divisional_charts: {
        d1, d9, d3, d12,
        parashari_d2: parashariD2,
        labh_mandook_hora: wealth ? wealth.labhMandook : null,
        parakram_hora: wealth ? wealth.parakram : null,
        sanchay_hora: wealth ? wealth.sanchay : null,
        surya_chandra_court: getSuryaChandraCourtChart()
      },
      mathematical_hora_lagna: computeMathematicalHoraLagna(),
      dasha_qualitative_result: dashaHora,
      retrograde_notes: retro,
      kaal_hora_birth_day_table: getBirthDayKaalHoraTable(),
      kaal_hora_today_table: getTodayKaalHoraTable(),
      hora_types_reference: HORA_TYPES_REFERENCE,
      transit_hierarchy_rule: 'Dasha (1st) → Antardasha (2nd) → Pratyantardasha (3rd) → Gochar/Transit (4th). A transit can trigger an event only if the active Dasha/Antardasha/Pratyantardasha lords already promise it in the natal chart.'
    };
  }

  // =========================================================================
  // HTML RENDERING — self-contained report + floating panel
  // =========================================================================
  /**
   * Matches the app's established planet-table style (see the Shadbala /
   * Natal Degrees table in predictions_ui.js): compact 9px font, uniform 4px
   * padding, a single header underline instead of per-cell borders, tbody
   * rows separated by a faint underline, and the first (label) column
   * left-aligned in gold. Short columns center; long descriptive columns
   * (Result/Effect/Activity text) left-align instead of centering, since
   * centered prose reads poorly.
   */
  function renderTable(headers, rows) {
    const LONG_THRESHOLD = 14;
    const alignments = headers.map((hd, i) => {
      if (i === 0) return 'left';
      const hasLongCell = rows.some(r => String(r[i] === undefined ? '' : r[i]).length > LONG_THRESHOLD);
      return hasLongCell ? 'left' : 'center';
    });
    let h = `<div style="overflow-x:auto;margin-top:8px;">`;
    h += `<table style="width:100%;font-size:9px;color:var(--text,#ddd);border-collapse:collapse;"><thead>`;
    h += `<tr style="border-bottom:1px solid var(--border,#333);color:var(--muted,#999);">`;
    headers.forEach((hd, i) => h += `<th style="text-align:${alignments[i]};padding:4px;white-space:nowrap;">${esc(hd)}</th>`);
    h += `</tr></thead><tbody>`;
    rows.forEach(r => {
      h += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">`;
      r.forEach((c, i) => {
        const style = i === 0
          ? 'text-align:left;padding:4px;color:var(--gold,#c8a84b);white-space:nowrap;'
          : `text-align:${alignments[i]};padding:4px;`;
        h += `<td style="${style}">${esc(c)}</td>`;
      });
      h += `</tr>`;
    });
    h += `</tbody></table></div>`;
    return h;
  }

  function renderHTML(report) {
    report = report || getFullReport();
    const dc = report.hora_divisional_charts;
    let html = `<div style="font-family:inherit;">`;
    html += `<h3 style="color:var(--gold,#c8a84b);margin:4px 0;">🕉️ Hora System Analysis</h3>`;

    const chartSections = [
      ['d1', 'D1 — Rashi (Birth Chart)'],
      ['d9', 'D9 — Navamsa (Spouse & Dharma)'],
      ['d3', 'D3 — Drekkana (Siblings & Courage)'],
      ['d12', 'D12 — Dwadasamsha (Parents)'],
      ['parashari_d2', 'D2 — Parashari Hora (Wealth)'],
      ['labh_mandook_hora', 'Labh Mandook Hora (Gains & Income Timing)'],
      ['parakram_hora', 'Parakram Hora (Courage & Effort for Wealth)'],
      ['sanchay_hora', 'Sanchay Hora (Wealth Accumulation & Savings)']
    ];

    chartSections.forEach(([key, title]) => {
      const chart = dc[key];
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">${esc(title)}</h4>`;
      if (!chart) {
        html += `<p style="color:var(--muted,#888);">Chart unavailable — compute/load a birth chart first.</p>`;
        return;
      }
      html += renderNorthIndianChartSVG(chart, title.split('—')[0].trim());
      if (chart.planetTable && chart.planetTable.length) {
        html += renderTable(['Planet', 'Sign', 'House', 'Deg', 'NL', 'SL', 'SSL', 'Nature', 'Result', 'Effect'],
          chart.planetTable.map(r => [r.planet, r.sign, r.house, r.degree, r.nl, r.sl, r.ssl, r.nature, r.result, r.effect]));
      }
    });

    if (dc.surya_chandra_court) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">Surya-Chandra Hora (Planetary Court)</h4>`;
      html += renderTable(['Planet', 'Sign', 'Court', 'Role/Minister'],
        dc.surya_chandra_court.map(c => [c.planet, c.sign, c.court, c.minister]));
    }

    const renderKaalTable = (rows, caption) => {
      if (!rows) return '';
      let s = `<h5 style="color:var(--text,#ddd);margin:8px 0 2px;font-size:12px;">${esc(caption)}</h5>`;
      s += renderTable(['#', 'Lord', 'Period', 'Start', 'End', 'Activity Domain', ''],
        rows.map(r => [r.index, r.lord, r.period, r.start, r.end, r.activity, r.isMarked ? '★' : '']));
      return s;
    };
    if (report.kaal_hora_birth_day_table || report.kaal_hora_today_table) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">⏰ Kaal Hora — Full 24-Hora Day/Night Table</h4>`;
      if (report.kaal_hora_birth_day_table) html += renderKaalTable(report.kaal_hora_birth_day_table, '★ Birth Day (★ = exact Hora of birth)');
      else html += `<p style="color:var(--muted,#888);">Birth-day Kaal Hora table unavailable — requires window.getHora() and a computed birth chart.</p>`;
      if (report.kaal_hora_today_table) html += renderKaalTable(report.kaal_hora_today_table, '★ Today (★ = current live Hora)');
    }

    if (report.hora_types_reference && report.hora_types_reference.length) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">📖 Types of Hora — Reference Guide</h4>`;
      report.hora_types_reference.forEach(t => {
        html += `<h5 style="color:var(--text,#ddd);margin:8px 0 2px;font-size:12px;">${esc(t.name)}</h5>`;
        html += `<p style="margin:2px 0 8px;font-size:12px;line-height:1.55;">${esc(t.paragraph)}</p>`;
      });
    }

    if (report.kaal_hora_at_birth) {
      const k = report.kaal_hora_at_birth;
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">Kaal Hora at Birth</h4>`;
      html += `<p style="margin:2px 0;">Ruler: <b>${esc(k.ruler)}</b> &nbsp; Dignity: ${esc(k.dignity_state)}<br/>`
        + `Predicted Life Theme: ${esc(k.predicted_life_theme)}<br/>`
        + `Muhurta Domain (this Hora): ${esc(k.muhurta_domain)}</p>`;
    } else {
      html += `<p style="color:var(--muted,#888);">Kaal Hora at birth unavailable — requires window.getHora() and a computed birth chart.</p>`;
    }

    if (report.mathematical_hora_lagna) {
      const hl = report.mathematical_hora_lagna;
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">Mathematical Hora Lagna (Longevity Engine)</h4>`;
      html += `<p style="margin:2px 0;">${esc(hl.basisLagnaType)}<br/>`
        + `D1: ${esc(hl.d1Sign)} ${esc(hl.d1Degree)}° &nbsp; D3: ${esc(hl.d3Sign)} ${esc(hl.d3Degree)}° &nbsp; D12: ${esc(hl.d12Sign)} ${esc(hl.d12Degree)}°<br/>`
        + `<b>${esc(hl.longevityKhanda)}</b></p>`;
    }

    if (report.dasha_qualitative_result) {
      const dq = report.dasha_qualitative_result;
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">Current Mahadasha × Hora Result</h4>`;
      html += `<p style="margin:2px 0;">${esc(dq.dashaLord)} Dasha — ${esc(dq.horaType)}, Degree Phase: ${esc(dq.degreePhase)}<br/>`
        + `${esc(dq.effortLevel)}${dq.note ? '<br/>' + esc(dq.note) : ''}</p>`;
    }

    if (report.retrograde_notes && report.retrograde_notes.length) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:16px 0 4px;">Retrograde (Vakri) Notes</h4>`;
      html += renderTable(['Planet', 'Interpretation'], report.retrograde_notes.map(r => [r.planet, r.note]));
    }

    html += `<p style="font-size:10px;color:var(--muted,#888);margin-top:10px;">Transit Rule: ${esc(report.transit_hierarchy_rule)}</p>`;
    html += `</div>`;
    return html;
  }

  function renderPanel(containerId) {
    const html = renderHTML(getFullReport());
    if (containerId && document.getElementById(containerId)) {
      const el = document.getElementById(containerId);
      el.innerHTML = html;
      return el;
    }
    let panel = document.getElementById('horaAnalysisPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'horaAnalysisPanel';
      panel.style.cssText = 'position:fixed;top:5%;left:50%;transform:translateX(-50%);width:min(760px,94vw);' +
        'max-height:88vh;overflow:auto;background:#0b0b16;border:1px solid var(--border2,#333);border-radius:8px;' +
        'padding:16px;z-index:9999;box-shadow:0 10px 40px rgba(0,0,0,0.6);';
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕ Close';
      closeBtn.style.cssText = 'float:right;background:transparent;border:1px solid var(--border2,#333);' +
        'color:var(--text,#ddd);padding:4px 10px;border-radius:4px;cursor:pointer;';
      closeBtn.onclick = () => panel.remove();
      const bodyDiv = document.createElement('div');
      bodyDiv.id = 'horaAnalysisPanelBody';
      panel.appendChild(closeBtn);
      panel.appendChild(bodyDiv);
      document.body.appendChild(panel);
    }
    document.getElementById('horaAnalysisPanelBody').innerHTML = html;
    return panel;
  }

  window.showHoraAnalysis = renderPanel;

  return {
    divLon, norm360, signNumOf, isOddSign,
    getParashariHora, getLabhMandookHora, getParakramHora, getSanchayHora, getCourtRole,
    getKaalHoraAtBirth, getDignityTier, computeMathematicalHoraLagna,
    getDashaHoraInterpretation, getRetrogradeNote, validateTransitTrigger,
    getBirthDayKaalHoraTable, getTodayKaalHoraTable, buildKaalHoraTable, fmtDayFrac,
    nakshatraLordOf, getSubLord, getSubSubLord, getHouseSignification,
    getD1Chart, getDivisionalSummary, getD2HoraChart, getWealthHoraCharts, getSuryaChandraCourtChart,
    buildPlanetTable, renderNorthIndianChartSVG,
    getFullReport, renderHTML, renderPanel,
    KAAL_HORA_CAREER_MAP, MUHURTA_BY_PLANET, HORA_TYPES_REFERENCE, PLANET_ABBR, HOUSE_POLYS
  };
})();