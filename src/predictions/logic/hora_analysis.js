/**
 * hora_analysis.js
 * ---------------------------------------------------------------------------
 * HORA SYSTEM ENGINE — Vedic Astrology (Jyotish)
 * Implements the full Hora specification (Parashari D-2, Special D-2 Wealth
 * Variants, Surya-Chandra Court, Dynamic Kaal Hora, Mathematical Hora Lagna,
 * and the Predictive Rule Engine incl. Dasha/Degree-Phase interpretation,
 * Kaal Hora career mapping, Muhurta-by-Kaarkatva, Retrograde handling, and
 * the 4-Level Transit Hierarchy).
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
 *   window.PREDICTION_FORECASTING.getCurrentDashaInfo() (forecasting.js)
 *
 * Key Functions:
 * - getParashariHora()        : D-2 Sun/Moon Hora for a longitude
 * - getLabhMandookHora()      : Gains & income-timing D-2 variant
 * - getParakramHora()         : Courage/effort-for-wealth D-2 variant
 * - getSanchayHora()          : Wealth accumulation/savings D-2 variant
 * - getCourtRole()            : Surya-Chandra planetary court placement
 * - getKaalHoraAtBirth()      : Ruling Hora lord at birth + dignity + theme
 * - computeMathematicalHoraLagna() : First-principles Hora Lagna (D1/D3/D12)
 * - getDashaHoraInterpretation()   : Dasha lord's Hora-quality + degree phase
 * - getRetrogradeNote()       : Vakri (retrograde) interpretation
 * - validateTransitTrigger()  : Enforces Dasha > Antar > Pratyantar > Gochar
 * - getD1Chart / getDivisionalSummary / getD2HoraChart / getWealthHoraCharts
 *   / getSuryaChandraCourtChart : chart builders for D1, D9, D3, D12, D2, etc.
 * - getFullReport()           : Assembles everything per the reference schema
 * - renderHTML() / renderPanel(): Self-contained HTML report + floating panel
 *   (call window.showHoraAnalysis() from the console or wire it to a button)
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

  function norm360(a) { return ((a % 360) + 360) % 360; }
  function signNumOf(lon) { return Math.floor(norm360(lon) / 30) % 12; }
  function lonInSignOf(lon) { return norm360(lon) % 30; }
  // 0-indexed sign numbers: Aries=0 is classical sign #1 (odd). Even index -> classical odd sign.
  function isOddSign(signNum) { return signNum % 2 === 0; }
  function sidLonOf(p) { return (p && p.sid !== undefined) ? p.sid : ((p && p.longitude) || 0); }

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
    if (signNum % 2 === 0) { // Odd signs: Aries, Gemini, Leo, Libra, Sagittarius, Aquarius
      lord = half === 1 ? 'Sun' : 'Moon';
    } else {                // Even signs: Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces
      lord = half === 1 ? 'Moon' : 'Sun';
    }
    return { lord, hora: lord === 'Sun' ? "Surya Hora" : "Chandra Hora", half, sign: SIGNS()[signNum] };
  }

  // =========================================================================
  // 2.2  SPECIAL DIVISIONAL HORA VARIANTS (Wealth timing)
  // =========================================================================
  function shiftSign(signNum, housesForward) { return (signNum + housesForward) % 12; }

  function buildWealthVariant(lon, forwardShift) {
    const signNum = signNumOf(lon);
    const half = lonInSignOf(lon) < 15 ? 1 : 2;
    const resultSignNum = half === 1 ? signNum : shiftSign(signNum, forwardShift);
    return {
      half, natalSignNum: signNum, natalSign: SIGNS()[signNum],
      resultSignNum, resultSign: SIGNS()[resultSignNum]
    };
  }

  /** Labh Mandook Hora — Gains & Timing of Income (2nd half -> 11th sign) */
  function getLabhMandookHora(lon) { return buildWealthVariant(lon, 10); }
  /** Parakram Hora — Courage & Effort for Wealth (2nd half -> 3rd sign) */
  function getParakramHora(lon) { return buildWealthVariant(lon, 2); }
  /** Sanchay Hora — Wealth Accumulation & Savings (2nd half -> 2nd sign) */
  function getSanchayHora(lon) { return buildWealthVariant(lon, 1); }

  // =========================================================================
  // 2.3  SURYA-CHANDRA HORA (Planetary Court System)
  // =========================================================================
  // Sign indices are 0-based: Aries0 Taurus1 Gemini2 Cancer3 Leo4 Virgo5
  // Libra6 Scorpio7 Sagittarius8 Capricorn9 Aquarius10 Pisces11
  const SUN_COURT = { 4: "Sun (King)", 5: "Mercury", 6: "Venus", 7: "Mars", 8: "Jupiter", 10: "Saturn" };
  const MOON_COURT = { 3: "Moon (Queen)", 2: "Mercury", 1: "Venus", 0: "Mars", 11: "Jupiter", 9: "Saturn" };

  function getCourtRole(signNum) {
    if (SUN_COURT[signNum]) return { court: "Sun's Court (Right Hand)", minister: SUN_COURT[signNum] };
    if (MOON_COURT[signNum]) return { court: "Moon's Court (Left Hand)", minister: MOON_COURT[signNum] };
    return { court: 'Unassigned', minister: '-' };
  }

  // =========================================================================
  // 3.1  DYNAMIC KAAL HORA (ruling planet of the hour)
  // =========================================================================
  /**
   * Finds the exact Kaal Hora lord active at the birth moment using the
   * app's precise sunrise/sunset based getHora() + calcSunriseSunset().
   * Returns null gracefully if the ephemeris helpers or birth data aren't
   * available yet (e.g. module loaded before a chart is computed).
   */
  function getKaalHoraAtBirth() {
    if (typeof window.getHora !== 'function' || !window.BIRTH_JD || !window.BIRTH || !window.BIRTH.date) return null;
    try {
      const horas = window.getHora(window.BIRTH_JD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff);
      if (!horas || !horas.length) return null;
      const bDate = window.BIRTH.date;
      let dayFrac = (bDate.getHours() + bDate.getMinutes() / 60 + bDate.getSeconds() / 3600) / 24;
      const sunriseFrac = horas[0].start;
      if (dayFrac < sunriseFrac) dayFrac += 1; // pre-sunrise birth belongs to the previous night's sequence
      let found = horas.find(h => dayFrac >= h.start && dayFrac < h.end);
      if (!found) found = horas[horas.length - 1];
      return found; // { lord, start, end, isDay }
    } catch (e) { return null; }
  }

  /** Dignity tier of a planet in the natal (D1) chart — feeds the career map. */
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
  // Sun/Mercury/Venus/Jupiter/Saturn rows are transcribed from the source.
  // Moon/Mars rows are marked as extensions for completeness.
  const MUHURTA_BY_PLANET = {
    Sun: 'Job interviews, meeting authority figures, executive decisions.',
    Mercury: 'Educational admissions, commerce, contracts, analytical work.',
    Venus: 'Friendship, romance, marriage discussions, creative arts.',
    Jupiter: 'Spiritual pursuits, higher learning, temple visits, legal consultation.',
    Saturn: 'Long-term employment commencement, labor management, persistent hard work.',
    Moon: '(extension) Domestic matters, public dealing, travel involving water.',
    Mars: '(extension) Property/technical matters, sports, competitive or surgical undertakings.'
  };

  // =========================================================================
  // 3.2  MATHEMATICAL HORA LAGNA (First-Principles Longevity Engine)
  // =========================================================================
  function computeMathematicalHoraLagna() {
    if (!window.BIRTH || !window.BIRTH.date || !window.BIRTH_ASC || !window.BIRTH_PLANETS || !window.BIRTH_PLANETS.Sun) return null;

    let sunriseFrac;
    if (typeof window.calcSunriseSunset === 'function' && window.BIRTH_JD) {
      try { sunriseFrac = window.calcSunriseSunset(window.BIRTH_JD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff).sunrise; }
      catch (e) { sunriseFrac = 6 / 24; }
    } else {
      sunriseFrac = 6 / 24; // fallback: assume 6:00 AM local sunrise
    }

    const bDate = window.BIRTH.date;
    let birthFrac = (bDate.getHours() + bDate.getMinutes() / 60 + bDate.getSeconds() / 3600) / 24;
    if (birthFrac < sunriseFrac) birthFrac += 1; // birth before sunrise -> previous day's Hora cycle

    // Step 1-3: elapsed time -> remaining-minutes -> degrees
    const elapsedHours = (birthFrac - sunriseFrac) * 24;
    const totalMinutes = elapsedHours * 60;
    const horaIndexElapsed = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const degreesToAdd = remainingMinutes / 2;

    // Step 4: Odd Lagna -> add to Sun; Even Lagna -> add to natal Lagna
    const ascSignNum = window.BIRTH_ASC.sn;
    const oddLagna = isOddSign(ascSignNum);
    const sunSid = sidLonOf(window.BIRTH_PLANETS.Sun);
    const ascSid = window.BIRTH_ASC.sid !== undefined ? window.BIRTH_ASC.sid : ascSignNum * 30;
    const basePoint = oddLagna ? sunSid : ascSid;
    const horaLagnaD1 = norm360(basePoint + degreesToAdd);

    // Step 5: apply across D1 / D3 / D12
    const d3 = divLon(horaLagnaD1, 3);
    const d12 = divLon(horaLagnaD1, 12);

    // Simplified longevity classification (Alpayu/Madhyayu/Purnayu) via the
    // Hora Lagna sign's house relationship to the natal Lagna. This is a
    // pragmatic simplification of the Phaladeepika longevity rule and should
    // be cross-checked against other longevity yogas, not used in isolation.
    const hlSign = signNumOf(horaLagnaD1);
    const distFromLagna = ((hlSign - ascSignNum + 12) % 12) + 1; // 1..12
    let longevityKhanda;
    if ([1, 4, 5, 7, 9, 10].includes(distFromLagna)) longevityKhanda = 'Purnayu (full-longevity indication)';
    else if ([2, 6, 11].includes(distFromLagna)) longevityKhanda = 'Madhyayu (medium-longevity indication)';
    else longevityKhanda = 'Alpayu (short-longevity indication) — verify against other longevity yogas';

    return {
      basisLagnaType: oddLagna ? "Odd Natal Lagna → degrees added to Sun's position" : "Even Natal Lagna → degrees added to natal Lagna's position",
      horaIndexElapsed,
      remainingMinutes: +remainingMinutes.toFixed(2),
      degreesAdded: +degreesToAdd.toFixed(2),
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
        : isMalefic
          ? 'Reduced cruelty; possible loss of drive unless supported by dignity.'
          : 'Gentle, smooth outcomes with low friction.';
    } else { // Sun's Hora
      effortLevel = isBenefic
        ? 'Positive results achieved through continuous effort (a hard taskmaster, but favorable).'
        : isMalefic
          ? 'Channelled administrative power, bravery, administrative success.'
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
  /**
   * Enforces: Dasha (1st) -> Antardasha (2nd) -> Pratyantardasha (3rd) -> Gochar (4th).
   * A transit can only be treated as triggering an event if the active Dasha
   * chain (with Kaal Hora involvement, where supplied) already promises it.
   */
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
  // CHART BUILDERS — D1, D9, D3, D12, D2 (Parashari + Wealth variants), Court
  // =========================================================================
  function getD1Chart() {
    const bp = window.BIRTH_PLANETS, asc = window.BIRTH_ASC;
    if (!bp || !asc) return null;
    const planets = ALL_PLANETS().filter(n => bp[n]).map(n => {
      const p = bp[n];
      return { planet: n, sign: p.sign || SIGNS()[p.sn], degree: p.deg, house: p.house, nakshatra: p.nak, retro: !!p.retro };
    });
    return { ascendant: { sign: asc.sign, degree: asc.deg }, planets };
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
    return { label, ascendantSign: SIGNS()[dAscSign], planets };
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
    const bp = window.BIRTH_PLANETS;
    if (!bp) return null;
    const build = fn => ALL_PLANETS().filter(n => bp[n]).map(n => {
      const r = fn(sidLonOf(bp[n]));
      return { planet: n, natalSign: r.natalSign, resultSign: r.resultSign, half: r.half };
    });
    return {
      labhMandook: build(getLabhMandookHora),
      parakram: build(getParakramHora),
      sanchay: build(getSanchayHora)
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
    const wealth = getWealthHoraCharts();

    return {
      kaal_hora_at_birth: kaalHora ? {
        ruler: kaalHora.lord,
        dignity_state: dignity ? `${dignity.tier} (${dignity.detail})` : 'Unknown',
        predicted_life_theme: career || 'N/A',
        muhurta_domain: MUHURTA_BY_PLANET[kaalHora.lord] || 'N/A'
      } : null,
      hora_divisional_charts: {
        d1: getD1Chart(),
        d9: getDivisionalSummary(9, 'D9 - Navamsa (Spouse & Dharma)'),
        d3: getDivisionalSummary(3, 'D3 - Drekkana (Siblings, Courage)'),
        d12: getDivisionalSummary(12, 'D12 - Dwadasamsha (Parents, Longevity)'),
        parashari_d2: getD2HoraChart(),
        labh_mandook_hora: wealth ? wealth.labhMandook : null,
        parakram_hora: wealth ? wealth.parakram : null,
        sanchay_hora: wealth ? wealth.sanchay : null,
        surya_chandra_court: getSuryaChandraCourtChart()
      },
      mathematical_hora_lagna: computeMathematicalHoraLagna(),
      dasha_qualitative_result: dashaHora,
      retrograde_notes: retro,
      transit_hierarchy_rule: 'Dasha (1st) → Antardasha (2nd) → Pratyantardasha (3rd) → Gochar/Transit (4th). A transit can trigger an event only if the active Dasha/Antardasha/Pratyantardasha lords already promise it in the natal chart.'
    };
  }

  // =========================================================================
  // HTML RENDERING — self-contained report + floating panel
  // =========================================================================
  function esc(s) { return (s === undefined || s === null) ? '' : String(s); }

  function renderTable(headers, rows) {
    let h = `<table style="width:100%;border-collapse:collapse;font-size:11px;margin:6px 0;"><thead><tr>`;
    headers.forEach(hd => h += `<th style="text-align:left;padding:4px;border-bottom:1px solid var(--border2,#333);color:var(--gold,#c8a84b);">${esc(hd)}</th>`);
    h += `</tr></thead><tbody>`;
    rows.forEach(r => {
      h += `<tr>`;
      r.forEach(c => h += `<td style="padding:4px;border-bottom:1px solid rgba(255,255,255,0.05);color:var(--text,#ddd);">${esc(c)}</td>`);
      h += `</tr>`;
    });
    h += `</tbody></table>`;
    return h;
  }

  function renderHTML(report) {
    report = report || getFullReport();
    const dc = report.hora_divisional_charts;
    let html = `<div style="font-family:inherit;">`;
    html += `<h3 style="color:var(--gold,#c8a84b);margin:4px 0;">🕉️ Hora System Analysis</h3>`;

    if (dc.d1) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">D1 — Rashi (Birth Chart) — Asc: ${esc(dc.d1.ascendant.sign)} ${esc(dc.d1.ascendant.degree)}°</h4>`;
      html += renderTable(['Planet', 'Sign', 'Deg', 'House', 'Nakshatra', 'Retro'],
        dc.d1.planets.map(p => [p.planet, p.sign, p.degree, p.house, p.nakshatra, p.retro ? 'R' : '-']));
    } else {
      html += `<p style="color:var(--muted,#888);">D1 chart unavailable — compute/load a birth chart first (window.BIRTH_PLANETS / window.BIRTH_ASC not found).</p>`;
    }

    if (dc.d9) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">D9 — Navamsa (Spouse &amp; Dharma) — Asc: ${esc(dc.d9.ascendantSign)}</h4>`;
      html += renderTable(['Planet', 'Sign', 'Deg', 'House'], dc.d9.planets.map(p => [p.planet, p.sign, p.degree, p.house]));
    }

    if (dc.d3) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">D3 — Drekkana (Siblings &amp; Courage) — Asc: ${esc(dc.d3.ascendantSign)}</h4>`;
      html += renderTable(['Planet', 'Sign', 'Deg', 'House'], dc.d3.planets.map(p => [p.planet, p.sign, p.degree, p.house]));
    }

    if (dc.d12) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">D12 — Dwadasamsha (Parents) — Asc: ${esc(dc.d12.ascendantSign)}</h4>`;
      html += renderTable(['Planet', 'Sign', 'Deg', 'House'], dc.d12.planets.map(p => [p.planet, p.sign, p.degree, p.house]));
    }

    if (dc.parashari_d2) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">D2 — Parashari Hora (Wealth: Effort vs Ease)</h4>`;
      html += renderTable(['Planet', 'Natal Sign', 'Hora'], dc.parashari_d2.map(p => [p.planet, p.natalSign, `${p.hora} (${p.lord})`]));
    }

    const variants = [
      ['labh_mandook_hora', 'Labh Mandook Hora — Gains &amp; Income Timing'],
      ['parakram_hora', 'Parakram Hora — Courage &amp; Effort for Wealth'],
      ['sanchay_hora', 'Sanchay Hora — Wealth Accumulation &amp; Savings']
    ];
    variants.forEach(([key, title]) => {
      const rows = dc[key];
      if (rows) {
        html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">${title}</h4>`;
        html += renderTable(['Planet', 'Natal Sign', 'Result Sign', 'Half'],
          rows.map(r => [r.planet, r.natalSign, r.resultSign, r.half === 1 ? '1st (0-15°)' : '2nd (15-30°)']));
      }
    });

    if (dc.surya_chandra_court) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">Surya-Chandra Hora (Planetary Court)</h4>`;
      html += renderTable(['Planet', 'Sign', 'Court', 'Role/Minister'],
        dc.surya_chandra_court.map(c => [c.planet, c.sign, c.court, c.minister]));
    }

    if (report.kaal_hora_at_birth) {
      const k = report.kaal_hora_at_birth;
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">Kaal Hora at Birth</h4>`;
      html += `<p style="margin:2px 0;">Ruler: <b>${esc(k.ruler)}</b> &nbsp; Dignity: ${esc(k.dignity_state)}<br/>`
        + `Predicted Life Theme: ${esc(k.predicted_life_theme)}<br/>`
        + `Muhurta Domain (this Hora): ${esc(k.muhurta_domain)}</p>`;
    } else {
      html += `<p style="color:var(--muted,#888);">Kaal Hora at birth unavailable — requires window.getHora() and a computed birth chart (window.BIRTH_JD / window.BIRTH).</p>`;
    }

    if (report.mathematical_hora_lagna) {
      const hl = report.mathematical_hora_lagna;
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">Mathematical Hora Lagna (Longevity Engine)</h4>`;
      html += `<p style="margin:2px 0;">${esc(hl.basisLagnaType)}<br/>`
        + `D1: ${esc(hl.d1Sign)} ${esc(hl.d1Degree)}° &nbsp; D3: ${esc(hl.d3Sign)} ${esc(hl.d3Degree)}° &nbsp; D12: ${esc(hl.d12Sign)} ${esc(hl.d12Degree)}°<br/>`
        + `<b>${esc(hl.longevityKhanda)}</b></p>`;
    }

    if (report.dasha_qualitative_result) {
      const dq = report.dasha_qualitative_result;
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">Current Mahadasha × Hora Result</h4>`;
      html += `<p style="margin:2px 0;">${esc(dq.dashaLord)} Dasha — ${esc(dq.horaType)}, Degree Phase: ${esc(dq.degreePhase)}<br/>`
        + `${esc(dq.effortLevel)}${dq.note ? '<br/>' + esc(dq.note) : ''}</p>`;
    }

    if (report.retrograde_notes && report.retrograde_notes.length) {
      html += `<h4 style="color:var(--gold2,#e0c060);margin:10px 0 2px;">Retrograde (Vakri) Notes</h4>`;
      html += renderTable(['Planet', 'Interpretation'], report.retrograde_notes.map(r => [r.planet, r.note]));
    }

    html += `<p style="font-size:10px;color:var(--muted,#888);margin-top:10px;">Transit Rule: ${esc(report.transit_hierarchy_rule)}</p>`;
    html += `</div>`;
    return html;
  }

  /**
   * Renders the full report either into an existing container (pass its id),
   * or as a self-created floating panel appended to <body>.
   */
  function renderPanel(containerId) {
    const html = renderHTML(getFullReport());
    let bodyEl;
    if (containerId && document.getElementById(containerId)) {
      bodyEl = document.getElementById(containerId);
      bodyEl.innerHTML = html;
      return bodyEl;
    }
    let panel = document.getElementById('horaAnalysisPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'horaAnalysisPanel';
      panel.style.cssText = 'position:fixed;top:5%;left:50%;transform:translateX(-50%);width:min(720px,92vw);' +
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
    // primitives
    divLon, norm360, signNumOf, isOddSign,
    // D-2 systems
    getParashariHora, getLabhMandookHora, getParakramHora, getSanchayHora, getCourtRole,
    // temporal / predictive engines
    getKaalHoraAtBirth, getDignityTier, computeMathematicalHoraLagna,
    getDashaHoraInterpretation, getRetrogradeNote, validateTransitTrigger,
    // chart builders
    getD1Chart, getDivisionalSummary, getD2HoraChart, getWealthHoraCharts, getSuryaChandraCourtChart,
    // aggregate report + rendering
    getFullReport, renderHTML, renderPanel,
    // reference tables
    KAAL_HORA_CAREER_MAP, MUHURTA_BY_PLANET
  };
})();
