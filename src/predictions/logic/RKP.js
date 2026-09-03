/**
 * RKP.js — Ratan Kotamraju Paddhati (RKP) Prashna Engine
 * ────────────────────────────────────────────────────────────
 * RKP is an "instant Prashna" (horary) method: no birth data, no
 * ephemeris look-up needed to fix the Lagna — only the exact clock
 * time at the moment the question is asked.
 *
 * THE CORE RULE (per the RKP course material + corroborating public
 * sources, e.g. Kaal Chakraa's "Predict the Question as well as the
 * Answer"):
 *   - Look at the minute-hand only.
 *   - The 12 numbers on a clock face = the 12 Lagnas (Aries..Pisces).
 *   - Each 5-minute block of the current hour = one Lagna:
 *       0–5   Aries    20–25 Leo         40–45 Sagittarius
 *       5–10  Taurus   25–30 Virgo       45–50 Capricorn
 *       10–15 Gemini   30–35 Libra       50–55 Aquarius
 *       15–20 Cancer   35–40 Scorpio     55–60 Pisces
 *     (e.g. 17:17 → minute hand between 3 & 4 → approaching 4 →
 *      Cancer Lagna. This matches "15 to 20 minutes = Cancer" in the
 *      course notes.)
 *   - Planets are then placed at their live transiting positions.
 *   - Minutes 45–55 (Capricorn & Aquarius Lagna) are a special
 *     "avoid" window: the course teaches that a question asked then
 *     will not fructify immediately, and work begun then will not
 *     complete without restarting. This lines up with classical
 *     Badhakasthana logic for a movable (chara) Kalapurusha Lagna
 *     (Aries): the 11th house (Aquarius) is the Badhaka bhava, and
 *     the neighbouring 10th (Capricorn, Saturn's own sign — Saturn
 *     being the natural obstructer) is bundled in with it.
 *   - The rising sign's own natural house number (in the Kalapurusha
 *     Kundali, Aries = house 1 ... Pisces = house 12) is treated as
 *     an immediate, unprompted clue to what the querent is likely to
 *     ask about — before they've said a word.
 *   - For questions about someone other than the querent (mother,
 *     spouse, child, etc.) the classical bhavat-bhavam ("house from
 *     house") technique is used: the relative's own significator
 *     house becomes a fresh reference point, and the topic house is
 *     counted onward from there.
 *
 * This engine reuses the app's real Swiss-Ephemeris-backed planetary
 * engine (window.jd / window.computeAll, already loaded by main.js)
 * for planetary longitudes — RKP's own "no ephemeris" shortcuts for
 * transits (Saturn ~2.5 yr/sign, Jupiter ~1 yr/sign, etc.) exist only
 * because a real ephemeris wasn't always at hand; since this app has
 * one, we use it for accuracy and reserve RKP's distinctive
 * contribution — the clock-based Lagna and the instant significator
 * logic — for what it actually is.
 */

window.RKP_ASTROLOGY = (function () {

  const AC = window.ASTRO_CONSTANTS || {};
  const SIGNS = AC.SIGNS || ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const SIGN_LORDS_ARR = AC.SIGN_LORDS
    ? SIGNS.map((_, i) => AC.SIGN_LORDS[i])
    : ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  const PLANETS = AC.PLANETS || ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const BENEFICS = AC.BENEFICS || ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const MALEFICS = AC.MALEFICS || ['Saturn', 'Mars', 'Rahu', 'Ketu'];
  const DIGNITIES = AC.DIGNITIES || {};
  const HOUSE_SIG = AC.HOUSE_SIGNIFICATIONS || {};
  const GEMSTONES = AC.GEMSTONES || {};

  // Reuse the app's established (simplified) Vedic aspect convention —
  // same table already used in analysis.js's getAspects(), so RKP's
  // aspect reading matches the rest of the app.
  const VEDIC_ASPECTS = {
    Jupiter: [7, 10], Saturn: [3, 10], Mars: [4, 8],
    Mercury: [1, 7], Venus: [1, 7], Sun: [1, 7], Moon: [1, 7], Rahu: [1, 7], Ketu: [1, 7]
  };

  // Kendra / Trikona / Dusthana groupings
  const KENDRA = [1, 4, 7, 10];
  const TRIKONA = [1, 5, 9];
  const DUSTHANA = [6, 8, 12];

  // ═══════════════════════════════════════════════════════════
  //  WHO IS THE QUESTION ABOUT? (bhavat-bhavam reference house)
  // ═══════════════════════════════════════════════════════════
  const RELATIVE_HOUSES = {
    self: { label: 'Myself (the querent)', house: 1 },
    mother: { label: 'Mother', house: 4 },
    father: { label: 'Father', house: 9 },
    spouse: { label: 'Spouse / Partner', house: 7 },
    children: { label: 'Children', house: 5 },
    younger_sibling: { label: 'Younger Sibling', house: 3 },
    elder_sibling: { label: 'Elder Sibling', house: 11 },
    friend: { label: 'Friend', house: 11 },
    enemy_rival: { label: 'Enemy / Rival / Opponent', house: 6 },
    employee_servant: { label: 'Employee / Servant', house: 6 },
    business_partner: { label: 'Business Partner', house: 7 },
    grandchild: { label: 'Grandchild', house: 3 } // 5th from 5th (9) is trad.; 3rd used here as simplified "child of child" via 5th-from-5th ≈ 9th — kept simple as sibling-style extension
  };

  // ═══════════════════════════════════════════════════════════
  //  WHAT IS BEING ASKED? (topic house, from that person's own 1st)
  //  Labels sourced from ASTRO_CONSTANTS.HOUSE_SIGNIFICATIONS so the
  //  wording matches the rest of the app.
  // ═══════════════════════════════════════════════════════════
  function topicOptions() {
    const out = [];
    for (let h = 1; h <= 12; h++) {
      const sig = HOUSE_SIG[h];
      let label = sig ? `${h}. ${sig.name} — ${sig.keywords.split(',')[0]}` : `House ${h}`;
      // RKP course explicitly distinguishes Job (service, under someone
      // else) from Business (trade/partnership) — a worked example in the
      // material shows a wrong house choice here (6th vs 7th) leading to
      // a wrong recommendation, so it's called out explicitly in the UI.
      if (h === 6) label += ' [Job/Service — Naukri]';
      if (h === 7) label += ' [also: Business/Trade — Vyapar]';
      out.push({ house: h, label });
    }
    return out;
  }

  // 12-house → compass direction wheel, anchored to the classical
  // 1st=East / 4th=North / 7th=West / 10th=South quadrant points
  // (matches the "12th house = South-East" remedy convention used in
  // the RKP source material).
  const HOUSE_DIRECTIONS = {
    1: 'East', 2: 'North-East', 3: 'North-East', 4: 'North',
    5: 'North-West', 6: 'North-West', 7: 'West', 8: 'South-West',
    9: 'South-West', 10: 'South', 11: 'South-East', 12: 'South-East'
  };

  const REMEDY_OBJECTS = {
    Sun: 'a copper or red-gold object', Moon: 'a white object', Mars: 'a red object or copper item',
    Mercury: 'a green object', Jupiter: 'a yellow object', Venus: 'a white or multicoloured object',
    Saturn: 'a black or iron object', Rahu: 'a smoky/mixed-colour object', Ketu: 'a multicoloured or dull-toned object'
  };

  // ═══════════════════════════════════════════════════════════
  //  1. THE CLOCK-BASED RKP LAGNA
  // ═══════════════════════════════════════════════════════════
  function getLagnaFromTime(date) {
    const minute = date.getMinutes();
    const segIndex = Math.min(11, Math.floor(minute / 5)); // 0=Aries..11=Pisces
    const isVoidWindow = (segIndex === 9 || segIndex === 10); // Capricorn / Aquarius
    return {
      hour: date.getHours(),
      minute,
      signIndex: segIndex,
      signName: SIGNS[segIndex],
      segStart: segIndex * 5,
      segEnd: segIndex * 5 + 5,
      isVoidWindow
    };
  }

  function getRelativeHouse(baseHouse, topicHouse) {
    return ((baseHouse - 1 + topicHouse - 1) % 12) + 1;
  }

  function signOf(lon) { return Math.floor(((lon % 360) + 360) % 360 / 30); }
  function houseOfSign(signNum, ascSignIndex) { return ((signNum - ascSignIndex + 12) % 12) + 1; }

  // ═══════════════════════════════════════════════════════════
  //  2. BUILD THE PRASHNA CHART (real transiting planets + RKP Lagna)
  // ═══════════════════════════════════════════════════════════
  function buildChart(date, relKey) {
    const rel = RELATIVE_HOUSES[relKey] || RELATIVE_HOUSES.self;
    const lagnaInfo = getLagnaFromTime(date);
    const ascSignIndex = lagnaInfo.signIndex;

    const jday = window.jd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60);
    const raw = window.computeAll(jday, 'lahiri', 1);

    const planets = {};
    PLANETS.forEach(p => {
      const rp = raw[p];
      if (!rp) return;
      planets[p] = { ...rp, house: houseOfSign(rp.sn, ascSignIndex) };
    });

    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const signNum = (ascSignIndex + h - 1) % 12;
      const occupants = PLANETS.filter(p => planets[p] && planets[p].house === h);
      houses.push({ num: h, sign: SIGNS[signNum], lord: SIGN_LORDS_ARR[signNum], occupants });
    }

    return { date, jday, relKey, relBase: rel.house, relLabel: rel.label, lagnaInfo, ascSignIndex, planets, houses };
  }

  function dignityOf(planetName, signIndex) {
    const d = DIGNITIES[planetName];
    if (!d) return 'Neutral';
    if (signIndex === d.exalt) return 'Exalted';
    if (signIndex === d.debilitation) return 'Debilitated';
    if (d.own && d.own.includes(signIndex)) return 'Own Sign';
    return 'Neutral';
  }

  function aspectsHouse(planetName, fromHouse, targetHouse) {
    const rule = VEDIC_ASPECTS[planetName] || [1, 7];
    return rule.some(offset => ((fromHouse - 1 + offset - 1) % 12) + 1 === targetHouse);
  }

  // ═══════════════════════════════════════════════════════════
  //  3. ANALYZE — score the question against the chart
  // ═══════════════════════════════════════════════════════════
  function analyze(date, relKey, topicHouseNum, questionText) {
    const chart = buildChart(date, relKey);
    const lagnaHouseNum = 1; // by construction, the RKP Lagna sign IS house 1

    // The instant, unprompted "topic hint" — the rising sign's own
    // natural house signification in the Kalapurusha Kundali.
    const naturalTopicHint = HOUSE_SIG[chart.ascSignIndex + 1] || null;

    // bhavat-bhavam: where the actual question (relative + topic) lands
    const topicHouseAbs = getRelativeHouse(chart.relBase, topicHouseNum || 1);
    const topicSignNum = (chart.ascSignIndex + topicHouseAbs - 1) % 12;
    const topicLord = SIGN_LORDS_ARR[topicSignNum];
    const topicLordPlacement = chart.planets[topicLord] || null;

    const findings = [];
    let score = 0;
    function add(pts, label) { score += pts; findings.push({ pts, label }); }

    // Special void-window rule (Capricorn/Aquarius Lagna, minute 45-59)
    if (chart.lagnaInfo.isVoidWindow) {
      add(-6, `Question arose with ${chart.lagnaInfo.signName} rising (minute ${chart.lagnaInfo.segStart}-${chart.lagnaInfo.segEnd}) — RKP's "avoid" window. The matter will not fructify immediately in this attempt.`);
    }

    // Lagna lord condition
    const lagnaLord = SIGN_LORDS_ARR[chart.ascSignIndex];
    const lagnaLordP = chart.planets[lagnaLord];
    if (lagnaLordP) {
      const dign = dignityOf(lagnaLord, lagnaLordP.sn);
      if (dign === 'Exalted') add(3, `Lagna lord ${lagnaLord} is exalted — strong support for the querent's side`);
      if (dign === 'Own Sign') add(2, `Lagna lord ${lagnaLord} is in its own sign — stable, self-sufficient outcome`);
      if (dign === 'Debilitated') add(-3, `Lagna lord ${lagnaLord} is debilitated — weak support for a favourable result`);
      if (KENDRA.includes(lagnaLordP.house) || TRIKONA.includes(lagnaLordP.house)) add(2, `Lagna lord ${lagnaLord} is angular/trinal (house ${lagnaLordP.house}) — favourable placement`);
      if (DUSTHANA.includes(lagnaLordP.house)) add(-2, `Lagna lord ${lagnaLord} falls in a dusthana (house ${lagnaLordP.house}) — obstruction indicated`);
    }

    // Benefics/malefics in and aspecting the Lagna
    PLANETS.forEach(p => {
      const pl = chart.planets[p];
      if (!pl) return;
      if (pl.house === lagnaHouseNum) {
        if (BENEFICS.includes(p)) add(2, `${p} occupies the Lagna — benefic support for the querent`);
        if (MALEFICS.includes(p)) add(-2, `${p} occupies the Lagna — some pressure/urgency on the querent`);
      } else if (aspectsHouse(p, pl.house, lagnaHouseNum)) {
        if (BENEFICS.includes(p)) add(1, `${p} aspects the Lagna — mild favourable influence`);
        if (MALEFICS.includes(p)) add(-1, `${p} aspects the Lagna — mild adverse influence`);
      }
    });

    // Topic house lord condition (the actual question)
    if (topicLordPlacement) {
      const dign = dignityOf(topicLord, topicLordPlacement.sn);
      if (dign === 'Exalted') add(3, `Significator ${topicLord} (lord of house ${topicHouseAbs}, the matter asked about) is exalted`);
      if (dign === 'Own Sign') add(2, `Significator ${topicLord} is in its own sign — stable result for this matter`);
      if (dign === 'Debilitated') add(-3, `Significator ${topicLord} is debilitated — weak result for this matter`);
      if (KENDRA.includes(topicLordPlacement.house) || TRIKONA.includes(topicLordPlacement.house)) add(2, `${topicLord} is angular/trinal (house ${topicLordPlacement.house}) — favourable for this matter`);
      if (DUSTHANA.includes(topicLordPlacement.house)) add(-2, `${topicLord} falls in a dusthana (house ${topicLordPlacement.house}) — delay/obstruction for this matter`);
    }
    PLANETS.forEach(p => {
      const pl = chart.planets[p];
      if (!pl || p === topicLord) return;
      if (pl.house === topicHouseAbs) {
        if (BENEFICS.includes(p)) add(1, `${p} occupies house ${topicHouseAbs} — supportive influence on the matter`);
        if (MALEFICS.includes(p)) add(-1, `${p} occupies house ${topicHouseAbs} — adverse influence on the matter`);
      }
    });

    // Moon's paksha (waxing/waning) as a minor modifier — Moon is the
    // querent's mind/messenger in Prashna.
    let moonPhaseNote = null;
    if (chart.planets.Sun && chart.planets.Moon) {
      let elong = (chart.planets.Moon.sid - chart.planets.Sun.sid + 360) % 360;
      if (elong <= 180) { add(1, 'Moon is waxing (Shukla Paksha) — building, growing energy'); moonPhaseNote = 'Waxing (Shukla Paksha)'; }
      else { add(-1, 'Moon is waning (Krishna Paksha) — receding, diminishing energy'); moonPhaseNote = 'Waning (Krishna Paksha)'; }
    }

    // Moon-about-to-change-sign caution. The course explicitly teaches
    // noting the Moon's sign each morning because it moves ~13.2°/day
    // (~1 sign every ~2.25 days); if it's about to cross into the next
    // sign within the next couple of hours, the reading is treated as
    // provisional until it settles — a Vedic analogue to "void of
    // course Moon" in Western horary.
    let moonChangingSoon = null;
    if (chart.planets.Moon) {
      const moonDegInSign = parseFloat(chart.planets.Moon.deg) || 0;
      const remainingDeg = 30 - moonDegInSign;
      const MOON_DEG_PER_HOUR = 13.2 / 24; // ~13.2°/day average
      const hoursLeft = remainingDeg / MOON_DEG_PER_HOUR;
      if (hoursLeft <= 3) {
        moonChangingSoon = { hoursLeft: Math.round(hoursLeft * 10) / 10, nextSign: SIGNS[(chart.planets.Moon.sn + 1) % 12] };
        add(-1, `Moon is only ~${moonChangingSoon.hoursLeft}h from entering ${moonChangingSoon.nextSign} — per RKP practice, treat this reading as provisional and re-check shortly`);
      }
    }

    // Technical vs Non-technical nature of the matter — an RKP-specific
    // reading: malefics (Mars/Saturn/Rahu/Ketu) around the topic house
    // point to a technical domain/nature to the matter; benefics
    // (Moon/Venus/Mercury/Jupiter) point to a non-technical one.
    let natureHint = null;
    {
      let malCount = 0, benCount = 0;
      PLANETS.forEach(p => {
        const pl = chart.planets[p];
        if (!pl) return;
        const touches = pl.house === topicHouseAbs || aspectsHouse(p, pl.house, topicHouseAbs);
        if (!touches) return;
        if (MALEFICS.includes(p)) malCount++;
        if (BENEFICS.includes(p)) benCount++;
      });
      if (malCount > 0 || benCount > 0) {
        if (malCount > benCount) natureHint = 'Technical / hands-on in nature (malefic influence dominates the matter)';
        else if (benCount > malCount) natureHint = 'Non-technical / people-or-mind-oriented in nature (benefic influence dominates the matter)';
        else natureHint = 'Mixed technical and non-technical influence on the matter';
      }
    }

    let level = 'Mixed / Uncertain';
    if (score >= 6) level = 'Favorable — Yes';
    else if (score >= 2) level = 'Mostly Favorable';
    else if (score <= -6) level = 'Unfavorable — No';
    else if (score <= -2) level = 'Delayed / Obstructed';
    if (chart.lagnaInfo.isVoidWindow) level = 'Not Ripe Yet (Void Window)';

    // Simple remedy suggestion — same pattern as the source material's
    // "place/remove a [colour] object in the [direction]" method.
    let remedy = null;
    if (score < 0) {
      const troublePlanet = MALEFICS.find(p => chart.planets[p] && (chart.planets[p].house === lagnaHouseNum || chart.planets[p].house === topicHouseAbs)) || topicLord;
      const dir = HOUSE_DIRECTIONS[chart.planets[troublePlanet]?.house || topicHouseAbs] || 'East';
      remedy = {
        planet: troublePlanet,
        object: REMEDY_OBJECTS[troublePlanet] || 'a related object',
        direction: dir,
        gemstone: GEMSTONES[troublePlanet] || null,
        text: `Consider placing/removing ${REMEDY_OBJECTS[troublePlanet] || 'a related object'} in the ${dir} of the space, associated with ${troublePlanet}'s influence.`
      };
    }

    return {
      chart, questionText: questionText || '', relKey, topicHouseNum,
      naturalTopicHint, topicHouseAbs, topicLord, topicLordPlacement,
      moonPhaseNote, moonChangingSoon, natureHint, score, level, findings, remedy
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  4. RENDER
  // ═══════════════════════════════════════════════════════════
  function levelColor(level) {
    if (level === 'Favorable — Yes') return 'var(--green,#4ade80)';
    if (level === 'Mostly Favorable') return 'var(--cyan,#3AF0FF)';
    if (level === 'Unfavorable — No') return 'var(--rose,#ff6688)';
    if (level === 'Delayed / Obstructed') return 'var(--gold,#a67c00)';
    if (level === 'Not Ripe Yet (Void Window)') return 'var(--rose,#ff6688)';
    return 'var(--muted,#888)';
  }

  function renderReport(result) {
    if (!result) return `<div style="text-align:center;padding:30px;color:var(--muted);font-family:'Courier New',monospace;font-size:11px;">Could not build report.</div>`;
    const { chart } = result;
    const lc = levelColor(result.level);
    const timeStr = `${String(chart.date.getHours()).padStart(2, '0')}:${String(chart.date.getMinutes()).padStart(2, '0')}`;

    let html = `<div style="font-family:'Courier New',monospace;">`;

    html += `<div style="padding:12px;background:rgba(255,255,255,.03);border-radius:4px;border-left:3px solid var(--gold,#a67c00);margin-bottom:14px;">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">RKP Prashna Kundali</div>
      <div style="font-size:13px;color:var(--gold,#a67c00);font-weight:bold;margin-top:3px;">Time of question: ${timeStr} (minute hand ${chart.lagnaInfo.segStart}-${chart.lagnaInfo.segEnd})</div>
      <div style="font-size:11px;color:var(--text);margin-top:3px;">RKP Lagna: <strong>${chart.lagnaInfo.signName}</strong> &nbsp;|&nbsp; Asked about: <strong>${result.chart.relLabel}</strong></div>
      ${result.questionText ? `<div style="font-size:10px;color:var(--muted);margin-top:6px;font-style:italic;">"${result.questionText}"</div>` : ''}
    </div>`;

    if (chart.lagnaInfo.isVoidWindow) {
      html += `<div style="padding:10px;background:rgba(255,102,136,.12);border:1px solid rgba(255,102,136,.4);border-radius:4px;margin-bottom:14px;font-size:10.5px;color:var(--rose,#ff6688);">
        ⚠ ${chart.lagnaInfo.signName} rising falls in RKP's traditional "avoid" window (minutes 45–55). Per the method, a question asked now — or work begun now — will not fructify/complete on this attempt.
      </div>`;
    }

    if (result.naturalTopicHint) {
      html += `<div style="padding:10px;background:rgba(58,240,255,.06);border-left:2px solid var(--cyan,#3AF0FF);border-radius:2px;margin-bottom:14px;">
        <div style="font-size:9px;color:var(--cyan,#3AF0FF);text-transform:uppercase;letter-spacing:1px;">Unprompted Topic Clue (from Lagna sign alone)</div>
        <div style="font-size:11px;color:var(--text);margin-top:4px;">Before anything is said, ${chart.lagnaInfo.signName} rising (house ${chart.ascSignIndex + 1} of the Kalapurusha Kundali — <em>${result.naturalTopicHint.name}</em>) suggests the query likely concerns: <strong>${result.naturalTopicHint.keywords}</strong>.</div>
      </div>`;
    }

    html += `<div style="padding:12px;background:${lc}18;border:1px solid ${lc}55;border-radius:4px;margin-bottom:14px;text-align:center;">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Verdict</div>
      <div style="font-size:20px;font-weight:bold;color:${lc};margin:6px 0;">${result.level}</div>
      <div style="font-size:10px;color:var(--muted);">Score: ${result.score}${result.moonPhaseNote ? ` · Moon: ${result.moonPhaseNote}` : ''}</div>
    </div>`;

    html += `<div style="font-size:11px;color:var(--text);line-height:1.6;margin-bottom:14px;">
      Matter asked about lands in house <strong>${result.topicHouseAbs}</strong> (counted from house ${chart.relBase}, ${chart.relLabel}, per bhavat-bhavam).
      Its significator is <strong>${result.topicLord}</strong>${result.topicLordPlacement ? `, placed in house ${result.topicLordPlacement.house} (${result.topicLordPlacement.sign}).` : '.'}
      ${result.natureHint ? `<br>Nature of the matter: <strong>${result.natureHint}</strong>.` : ''}
    </div>`;

    if (result.moonChangingSoon) {
      html += `<div style="padding:10px;background:rgba(58,240,255,.06);border:1px solid rgba(58,240,255,.3);border-radius:4px;margin-bottom:14px;font-size:10.5px;color:var(--cyan,#3AF0FF);">
        ⏳ Moon is only ~${result.moonChangingSoon.hoursLeft}h from entering ${result.moonChangingSoon.nextSign}. Per RKP practice, note the Moon's position fresh each time — treat this reading as provisional and re-check once the Moon has settled into its new sign.
      </div>`;
    }

    html += `<div style="color:var(--gold,#a67c00);font-size:11px;margin:14px 0 6px;">CONVERGING INDICATIONS</div>`;
    if (result.findings.length === 0) {
      html += `<div style="font-size:11px;color:var(--muted);">No strong indications either way.</div>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;gap:6px;">`;
      result.findings.forEach(f => {
        const c = f.pts > 0 ? 'var(--green,#4ade80)' : 'var(--rose,#ff6688)';
        html += `<div style="display:flex;gap:8px;align-items:flex-start;padding:6px 8px;background:rgba(255,255,255,.02);border-left:2px solid ${c};border-radius:2px;">
          <span style="font-size:10px;color:${c};font-weight:bold;min-width:28px;">${f.pts > 0 ? '+' : ''}${f.pts}</span>
          <span style="font-size:10.5px;color:var(--text);line-height:1.4;">${f.label}</span>
        </div>`;
      });
      html += `</div>`;
    }

    if (result.remedy) {
      html += `<div style="margin-top:14px;padding:10px;background:rgba(166,124,0,.08);border-left:2px solid var(--gold,#a67c00);border-radius:2px;">
        <div style="font-size:9px;color:var(--gold,#a67c00);text-transform:uppercase;letter-spacing:1px;">Suggested Remedy</div>
        <div style="font-size:11px;color:var(--text);margin-top:4px;">${result.remedy.text}${result.remedy.gemstone ? ` Associated gemstone: <strong>${result.remedy.gemstone}</strong>.` : ''}</div>
      </div>`;
    }

    html += `<div style="color:var(--gold,#a67c00);font-size:11px;margin:16px 0 6px;">PRASHNA CHART — HOUSES</div>
      <table style="width:100%;font-size:10px;border-collapse:collapse;">
        <tr style="color:var(--muted);text-align:left;"><th style="padding:3px 6px;">H</th><th>Sign</th><th>Lord</th><th>Occupants</th></tr>`;
    chart.houses.forEach(h => {
      const marker = (h.num === result.topicHouseAbs) ? 'border-left:2px solid var(--rose,#ff6688);' : (h.num === 1 ? 'border-left:2px solid var(--cyan,#3AF0FF);' : '');
      html += `<tr style="border-top:1px solid rgba(255,255,255,.06);${marker}">
        <td style="padding:3px 6px;color:var(--text);">${h.num}</td>
        <td style="color:var(--text);">${h.sign}</td>
        <td style="color:var(--text);">${h.lord}</td>
        <td style="color:var(--muted);">${h.occupants.join(', ') || '—'}</td>
      </tr>`;
    });
    html += `</table>`;

    html += `<div style="margin-top:14px;padding:8px;font-size:9px;color:var(--muted);border-top:1px dashed rgba(255,255,255,.1);">
      RKP fixes only the Lagna from the clock; planetary positions here are the app's real computed transits (not RKP's own approximate speed-based shortcut) for accuracy. Structural analysis, not a certainty.
    </div>`;

    html += `</div>`;
    return html;
  }

  // Public API
  return {
    RELATIVE_HOUSES,
    HOUSE_DIRECTIONS,
    topicOptions,
    getLagnaFromTime,
    getRelativeHouse,
    buildChart,
    analyze,
    renderReport,
    generateReport: function (dateInput, relKey, topicHouseNum, questionText) {
      const date = (dateInput instanceof Date && !isNaN(dateInput)) ? dateInput : new Date();
      const result = analyze(date, relKey, Number(topicHouseNum) || 1, questionText);
      return renderReport(result);
    }
  };
})();
