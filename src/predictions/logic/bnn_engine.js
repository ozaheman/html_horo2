// --- START OF FILE bnn_engine.js ---
//
// Self-contained Bhrigu Nandi Nadi (BNN) rule engine.
//
// Why this file exists: predictions_ui.js's 'bnn' mode used to call
// window.GENERIC_ANALYZER.analyzeComprehensive(...), which isn't present
// anywhere in this project, and bnn_logic.js depends on a PLANET_IDS
// module that also isn't present. Neither is needed here — this engine
// works directly off plain sign numbers (0=Aries ... 11=Pisces), the same
// convention already used by constant.js and main.js's BIRTH_PLANETS.
//
// Everything below implements rules taken directly from the structured
// portion of bnn_db.js (the "Compilation of Brighu Nandi Nadi Astrology"
// by Umashankara) — marriage, foreign travel, progeny, house-yoga,
// profession (Saturn combinations), and education. Rule text is quoted
// in comments next to the code that implements it so the mapping is
// auditable.
//
// USAGE
// -----
//   const chart = window.BNN_ENGINE.buildChart(window.BIRTH_PLANETS, window.BIRTH_ASC);
//   const report = window.BNN_ENGINE.runFullAnalysis(chart, { gender: 'male' });
//   // report.html   -> ready-to-insert HTML block (matches the visual
//   //                   style of the rest of the prediction panel)
//   // report.findings -> structured array, in case you want to render
//   //                     it yourself or feed it into something else.
//
// This file has no external dependencies. Include it after constant.js
// (optional — SIGNS names are duplicated locally so it works standalone
// too) and before predictions_ui.js.

(function () {

  // ========== 1. CONSTANTS (self-contained, no PLANET_IDS needed) ==========

  // 0-based sign index, same convention as constant.js / main.js
  const SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // The nine grahas BNN actually works with (no ASC needed for most rules,
  // but we keep it for house numbering / display purposes).
  const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  // ========== 2. CHART BUILDING ==========

  /**
   * Normalizes whatever chart-source object you have (BIRTH_PLANETS-style,
   * keyed by planet name with a `.sn` sign index 0-11) into the flat shape
   * this engine expects: { PlanetName: { sign: 0-11, house: 1-12 } }.
   *
   * @param {Object} birthPlanets - e.g. window.BIRTH_PLANETS: { Sun: {sn:5,...}, ... }
   * @param {Object} birthAsc - e.g. window.BIRTH_ASC: { sn: 2, ... }
   * @returns {Object} normalized chart
   */
  function buildChart(birthPlanets, birthAsc) {
    if (!birthPlanets) throw new Error('BNN_ENGINE.buildChart: no planet data supplied');
    const ascSign = birthAsc && typeof birthAsc.sn === 'number' ? birthAsc.sn : 0;
    const chart = { Ascendant: { sign: ascSign, house: 1 } };

    PLANETS.forEach(name => {
      const p = birthPlanets[name];
      if (!p || typeof p.sn !== 'number') return;
      chart[name] = {
        sign: p.sn,
        house: signHouse(p.sn, ascSign)
      };
    });
    return chart;
  }

  /** Whole-sign house number of `sign` counted from `ascSign` (1-12). */
  function signHouse(sign, ascSign) {
    return ((sign - ascSign + 12) % 12) + 1;
  }

  /**
   * BNN's core counting device: "N-th house/sign FROM planet X" — this is
   * just whole-sign distance between two sign numbers, always counted
   * forward (anti-clockwise, per the source material), 1-12.
   */
  function distanceInSigns(fromSign, toSign) {
    return ((toSign - fromSign + 12) % 12) + 1;
  }

  /** Two planets are "conjoined" in BNN if they occupy the same sign. */
  function isConjunct(chart, planetA, planetB) {
    if (!chart[planetA] || !chart[planetB]) return false;
    return chart[planetA].sign === chart[planetB].sign;
  }

  /** All planets that are conjunct (same sign as) the given planet. */
  function conjunctPlanets(chart, planetName) {
    if (!chart[planetName]) return [];
    const sign = chart[planetName].sign;
    return PLANETS.filter(p => p !== planetName && chart[p] && chart[p].sign === sign);
  }

  /** Planets found at a specific sign-distance from a reference planet. */
  function planetsAtDistance(chart, refPlanet, distance) {
    if (!chart[refPlanet]) return [];
    const refSign = chart[refPlanet].sign;
    return PLANETS.filter(p => {
      if (p === refPlanet || !chart[p]) return false;
      return distanceInSigns(refSign, chart[p].sign) === distance;
    });
  }

  // ========== 3. MARRIAGE ==========
  // Source: "MARRIAGE (BNN)" section of the Umashankara compilation.

  function analyzeMarriage(chart, gender) {
    const isMale = gender !== 'female';
    const causative = isMale ? 'Venus' : 'Mars'; // Venus = male-native marriage karaka, Mars = female-native
    if (!chart.Jupiter || !chart[causative]) {
      return { title: 'Marriage', findings: ['Insufficient chart data (Jupiter/' + causative + ' missing).'] };
    }

    const distFromJupiter = distanceInSigns(chart.Jupiter.sign, chart[causative].sign);
    const promisedHouses = [1, 2, 3, 5, 7, 9, 11, 12];
    const brokenHouses = [4, 6, 8, 10];

    const findings = [];

    // "If Venus[/Mars] is placed in 1-2-3-5-7-9-11-12 from Jupiter, marriage is promised."
    if (promisedHouses.includes(distFromJupiter)) {
      findings.push(`Marriage is promised — ${causative} is the ${ordinal(distFromJupiter)} sign from Jupiter (a promised-marriage position).`);
    }
    // "No marriage / separation / divorce if placed in 4-6-8-10 from Jupiter."
    if (brokenHouses.includes(distFromJupiter)) {
      findings.push(`${causative} is the ${ordinal(distFromJupiter)} sign from Jupiter — a position the source flags for no-marriage, separation, or divorce risk.`);
    }

    // "If Ketu is placed in 1-5-9-or-2 from [causative], leads to break in marriage/divorce (male chart)."
    // Female-chart equivalent uses the same 1-5-9-2 window from Mars.
    if (chart.Ketu) {
      const ketuFromCausative = distanceInSigns(chart[causative].sign, chart.Ketu.sign);
      if ([1, 5, 9, 2].includes(ketuFromCausative)) {
        findings.push(`Ketu is the ${ordinal(ketuFromCausative)} sign from ${causative} — this specific window is called out as a break/divorce risk factor.`);
      }
    }

    // "If Jupiter aspects [causative], early marriage; if Saturn aspects [causative], marriage delayed."
    // We treat conjunction (same sign) as the clearest form of "connection" here,
    // since full graha-drishti rules aren't in scope of this reconstruction.
    if (chart.Jupiter && isConjunct(chart, 'Jupiter', causative)) {
      findings.push(`Jupiter is conjunct ${causative} — early marriage indicated.`);
    }
    if (chart.Saturn && isConjunct(chart, 'Saturn', causative)) {
      findings.push(`Saturn is conjunct ${causative} — marriage is likely to be delayed rather than early.`);
    }

    if (findings.length === 0) {
      findings.push('No specific marriage combination from this rule set was matched for this chart.');
    }

    return { title: 'Marriage', causative, distFromJupiter, findings };
  }

  // ========== 4. FOREIGN TRAVEL ==========
  // Source: "Foreign Travel (Brighu Nandi Nadi)" section.

  function analyzeForeignTravel(chart) {
    if (!chart.Moon) return { title: 'Foreign Travel', findings: ['Moon position missing.'] };
    const promisedHouses = [1, 2, 3, 5, 7, 9, 11, 12];
    const findings = [];

    if (chart.Rahu) {
      const d = distanceInSigns(chart.Moon.sign, chart.Rahu.sign);
      // "If Rahu is posited in 1,2,3,5,7,9,11,12 from Moon, foreign travel /
      // long travel is promised... long stay in foreign country."
      if (promisedHouses.includes(d)) {
        findings.push(`Rahu is the ${ordinal(d)} sign from Moon — foreign travel is promised, with a tendency toward a longer stay or settling abroad.`);
      }
    }
    if (chart.Ketu) {
      const d = distanceInSigns(chart.Moon.sign, chart.Ketu.sign);
      // "If Ketu is posited in ... from Moon, foreign travel is promised.
      // It denotes short stay in foreign country."
      if (promisedHouses.includes(d)) {
        findings.push(`Ketu is the ${ordinal(d)} sign from Moon — foreign travel is promised, typically a shorter stay abroad.`);
      }
    }

    // Male-chart amplifiers: Jupiter conjunct Moon+Rahu/Ketu, optionally with
    // Venus+Sun (family goes too), Mercury (further study), Saturn (work
    // assignment), Saturn+Mercury (business expansion).
    if (chart.Jupiter && (isConjunct(chart, 'Jupiter', 'Rahu') || isConjunct(chart, 'Jupiter', 'Ketu'))
        && (isConjunct(chart, 'Jupiter', 'Moon'))) {
      let detail = 'Jupiter conjoined with Moon and Rahu/Ketu — foreign travel indicated.';
      if (isConjunct(chart, 'Jupiter', 'Mercury')) detail += ' Mercury also involved: likely for advanced study abroad.';
      if (isConjunct(chart, 'Jupiter', 'Saturn')) detail += ' Saturn also involved: likely a professional work assignment abroad.';
      findings.push(detail);
    }

    if (findings.length === 0) {
      findings.push('No foreign-travel combination from this rule set was matched.');
    }
    return { title: 'Foreign Travel', findings };
  }

  // ========== 5. PROGENY ==========
  // Source: "Progeny (BNN)" section.

  function analyzeProgeny(chart) {
    if (!chart.Jupiter) return { title: 'Progeny', findings: ['Jupiter position missing.'] };
    const promisedMale = [1, 2, 3, 5, 7, 9, 11];
    const promisedFemale = [1, 2, 3, 5, 7, 9, 11];
    const findings = [];

    if (chart.Sun) {
      const d = distanceInSigns(chart.Jupiter.sign, chart.Sun.sign);
      if (promisedMale.includes(d)) {
        findings.push(`Sun is the ${ordinal(d)} sign from Jupiter — male progeny is promised.`);
      } else {
        findings.push(`Sun is the ${ordinal(d)} sign from Jupiter — outside the promised-male-progeny window, so this specific combination doesn't confirm a male child.`);
      }
    }
    if (chart.Venus) {
      const d = distanceInSigns(chart.Jupiter.sign, chart.Venus.sign);
      if (promisedFemale.includes(d)) {
        findings.push(`Venus is the ${ordinal(d)} sign from Jupiter — female progeny is favored.`);
      }
    }
    // "If Jupiter aspects Sun and Venus, progeny is promised early;
    //  if Saturn aspects them, a bit late." (conjunction used as proxy here)
    ['Sun', 'Venus'].forEach(p => {
      if (chart.Jupiter && isConjunct(chart, 'Jupiter', p)) findings.push(`Jupiter conjunct ${p} — timing of progeny tends to be earlier.`);
      if (chart.Saturn && isConjunct(chart, 'Saturn', p)) findings.push(`Saturn conjunct ${p} — timing of progeny tends to be later.`);
    });

    return { title: 'Progeny', findings };
  }

  // ========== 6. HOUSE / PROPERTY YOGA ==========
  // Source: "House Yoga (Brighu Nandi Nadi)" section.

  function analyzeHouseYoga(chart) {
    if (!chart.Jupiter || !chart.Venus) return { title: 'Own House', findings: ['Jupiter/Venus position missing.'] };
    const findings = [];
    const promisedHouses = [1, 2, 3, 5, 7, 9, 11];

    const d = distanceInSigns(chart.Jupiter.sign, chart.Venus.sign);
    if (promisedHouses.includes(d)) {
      findings.push(`Venus is the ${ordinal(d)} sign from Jupiter — house/property ownership is indicated.`);
    }

    if (chart.Ketu) {
      // "If Ketu is posited in 1,5,9 or 2 from Venus, the native will not
      // have house yoga or will have to dispose of the house due to debts."
      const ketuFromVenus = distanceInSigns(chart.Venus.sign, chart.Ketu.sign);
      if ([1, 5, 9, 2].includes(ketuFromVenus)) {
        findings.push(`Ketu is the ${ordinal(ketuFromVenus)} sign from Venus — this specific window works against house yoga, or points to having to sell/dispose of a property due to debt.`);
      }
    }

    // Flavor of the property, based on what's conjunct Venus.
    const conjunctWithVenus = conjunctPlanets(chart, 'Venus');
    const flavors = {
      Mercury: 'a duplex, richly furnished house, or a commercial/shopping property',
      Rahu: 'a large multi-storied building, apartment, or more than one flat/house',
      Saturn: 'a house purchased after marriage, possibly government-allotted quarters if Sun is also involved',
      Mars: 'an ordinary house, or (with Saturn/Sun involved) government/military quarters',
      Jupiter: 'a beautiful, well-furnished house with fine luxury items'
    };
    conjunctWithVenus.forEach(p => {
      if (flavors[p]) findings.push(`Venus conjunct ${p}: suggests ${flavors[p]}.`);
    });

    if (findings.length === 0) findings.push('No house-yoga combination from this rule set was matched.');
    return { title: 'Own House', findings };
  }

  // ========== 7. PROFESSION (Saturn combinations) ==========
  // Source: "PROFESSIONS THROUGH BHRUGU NADI" table.

  const SATURN_PROFESSION_TABLE = {
    Sun: 'Politics, government job, continuing/sharing the father\'s profession.',
    Moon: 'Transport, liquids/drinks/food items, hotel or restaurant business, milk products, reporting/news, a transferable job.',
    Mars: 'Technical or machinery-related work, engineering, police, defence, fire services, energy, iron/metal/minerals, surgery, dentistry.',
    Mercury: 'Business, real estate, teaching, astrology, intellectual work, accounting, business management, mathematics, writing/communication.',
    Jupiter: 'A comfortable, respected position — teaching in one\'s field, education, guiding/mentoring, judging.',
    Venus: 'Banking, finance, money-lending, luxury-goods trade, shares, gold, art, music, building/construction (stronger still if Rahu is also involved).',
    Rahu: 'Secretive or unconventional work, computers/software, graphics, photography, TV/cinema, printing and publishing — or, less positively, smuggling/gambling (transport if Moon and Venus are also involved).',
    Ketu: 'Service-oriented work — spiritual, occult, religious, healing, medical/pharma/chemical, or law (with Mercury also involved).'
  };

  function analyzeProfession(chart) {
    if (!chart.Saturn) return { title: 'Profession', findings: ['Saturn position missing.'] };
    const findings = [];

    // Priority order per the source material: direct conjunction (same sign)
    // is strongest; 2nd/5th/7th/9th-house connections are next, with 12th
    // being weakest. We surface conjunctions first, then the 2nd-house tier,
    // since that's what the source explicitly calls "next strongest."
    const conjunct = conjunctPlanets(chart, 'Saturn');
    conjunct.forEach(p => {
      if (SATURN_PROFESSION_TABLE[p]) {
        findings.push({ strength: 'strong (conjunct)', planet: p, text: `Saturn + ${p} (conjunct): ${SATURN_PROFESSION_TABLE[p]}` });
      }
    });

    const secondHouse = planetsAtDistance(chart, 'Saturn', 2);
    secondHouse.forEach(p => {
      if (SATURN_PROFESSION_TABLE[p]) {
        findings.push({ strength: 'secondary (2nd from Saturn)', planet: p, text: `Saturn + ${p} (2nd-house link): ${SATURN_PROFESSION_TABLE[p]}` });
      }
    });

    if (findings.length === 0) {
      findings.push({ strength: 'none', planet: null, text: 'Saturn has no direct or 2nd-house connections in this chart under this rule set — profession themes are less clearly indicated by Saturn alone.' });
    }

    return { title: 'Profession', findings };
  }

  // ========== 8. EDUCATION ==========
  // Source: "Education (BNN)" section + "Planets and their Subjects" table.

  const EDUCATION_SUBJECTS = {
    Sun: 'political science, civics, history, social sciences',
    Moon: 'arts, psychology, chemistry, marine studies, hotel management, agriculture, fine arts',
    Mars: 'mechanical/electrical/civil engineering, physics, mining, gems and minerals',
    Mercury: 'accounting, mathematics, statistics, C.A./M.B.A., logic, education itself',
    Jupiter: 'audit and accounts, philosophy, biology, B.Ed., Sanskrit studies',
    Venus: 'higher studies, economics, finance, marketing, architecture',
    Saturn: 'departmental/vocational training, HR management',
    Rahu: 'chemical or nuclear physics, computers, media, IT, foreign-language study',
    Ketu: 'medicine, pharmacy, chemistry, law, astrology/occult sciences, textile or tailoring design'
  };

  function analyzeEducation(chart) {
    if (!chart.Mercury) return { title: 'Education', findings: ['Mercury position missing.'] };
    const findings = [];
    const conjunct = conjunctPlanets(chart, 'Mercury');

    conjunct.forEach(p => {
      if (EDUCATION_SUBJECTS[p]) {
        findings.push(`Mercury conjunct ${p}: leans toward ${EDUCATION_SUBJECTS[p]}.`);
      }
    });

    // "Bhahu Vidya Yoga (more than two degrees): Mercury + Rahu"
    if (conjunct.includes('Rahu')) {
      findings.push('Mercury conjunct Rahu is specifically called out as "Bhahu Vidya Yoga" — a tendency toward multiple degrees/qualifications.');
    }
    // "Research and PhD: Mercury + Sun + Venus + Jupiter"
    if (['Sun', 'Venus', 'Jupiter'].every(p => conjunct.includes(p))) {
      findings.push('Mercury conjunct Sun, Venus, and Jupiter together — indicated for research/doctoral-level study.');
    }
    // "No education: Mercury + Mars + Ketu"
    if (['Mars', 'Ketu'].every(p => conjunct.includes(p))) {
      findings.push('Mercury conjunct both Mars and Ketu — flagged in the source as an obstruction to formal education.');
    }
    // "Educational breaks: Mercury + Ketu"
    if (conjunct.includes('Ketu')) {
      findings.push('Mercury conjunct Ketu — indicates a break or interruption in education.');
    }

    if (findings.length === 0) findings.push('No specific education combination from this rule set was matched.');
    return { title: 'Education', findings };
  }

  // ========== 9. TOP-LEVEL ORCHESTRATION ==========

  /**
   * Runs every module above against a chart and returns both a structured
   * result (for programmatic use) and a ready-to-insert HTML block styled
   * consistently with the rest of the prediction panel (same CSS var names
   * used elsewhere: --gold, --cyan, --rose, --muted, --border, --text).
   *
   * @param {Object} chart - output of buildChart()
   * @param {Object} [options]
   * @param {'male'|'female'} [options.gender='male']
   */
  function runFullAnalysis(chart, options) {
    const gender = (options && options.gender) || 'male';

    const sections = [
      analyzeMarriage(chart, gender),
      analyzeForeignTravel(chart),
      analyzeProgeny(chart),
      analyzeHouseYoga(chart),
      analyzeProfession(chart),
      analyzeEducation(chart)
    ];

    return { findings: sections, html: renderHtml(sections) };
  }
// ========== 9b. RAW SOURCE NOTES (collapsed by default) ==========
  //
  // window.BNN_DB entries are raw transcript text — lines are wrapped with
  // \r\n mid-sentence (just line-wrapping from the original source, not
  // paragraph breaks), so rendered as-is it reads as one giant unbroken
  // block. This reflows it into real paragraphs and hides it behind a
  // collapsed "[+] Additional Notes" toggle so it doesn't dominate the
  // panel — click to expand.

  /** Undo the mid-sentence \r\n wrapping, keep genuine blank-line breaks. */
  function reflowTranscriptText(raw) {
    if (!raw) return '';
    return String(raw)
      .replace(/\r\n/g, '\n')
      // A run of 2+ newlines is a real paragraph break — protect it first.
      .replace(/\n{2,}/g, '\u0001')
      // Any remaining single newline is just line-wrap — rejoin with a space.
      .replace(/\n/g, ' ')
      .replace(/\u0001/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  /** Group a wall of sentences into readable paragraphs (~N sentences each). */
  function chunkIntoParagraphs(text, sentencesPerParagraph) {
    const n = sentencesPerParagraph || 4;
    const paragraphs = text.split(/\n\n+/).filter(Boolean);
    const out = [];
    paragraphs.forEach(block => {
      // Split on Hindi '।' or Latin '.'/'?'/'!' followed by a space, keeping the delimiter.
      const sentences = block.split(/(?<=[।.?!])\s+/).filter(Boolean);
      for (let i = 0; i < sentences.length; i += n) {
        out.push(sentences.slice(i, i + n).join(' ').trim());
      }
    });
    return out.filter(Boolean);
  }

  /**
   * Builds the collapsed "Additional Notes from BNN Source Material" block.
   * @param {Number} [maxEntries=5] - cap how many BNN_DB entries to include,
   *   since the corpus is very large — this is supplementary reading, not
   *   the primary analysis above.
   */
  function renderSourceNotes(maxEntries) {
    const db = window.BNN_DB || [];
    if (!db.length) return '';
    const entries = db.slice(0, maxEntries || 5);

    const body = entries.map(entry => {
      const reflowed = reflowTranscriptText(entry.text);
      const paragraphs = chunkIntoParagraphs(reflowed, 4);
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:9px;color:var(--cyan);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${escapeHtml(entry.topic || '')}</div>
          ${paragraphs.map(p => `<p style="margin:0 0 8px 0;font-size:10.5px;color:var(--text);line-height:1.6;">${escapeHtml(p)}</p>`).join('')}
        </div>`;
    }).join('');

    // Native <details>/<summary> gives a free, accessible, JS-free collapse;
    // ontoggle just swaps the "[+]"/"[-]" label to match the open state.
    return `
      <details ontoggle="this.querySelector('.bnn-notes-toggle').textContent = this.open ? '[\u2212]' : '[+]';" style="margin-top:14px;background:rgba(20,20,40,0.35);border:1px solid var(--border);border-radius:4px;padding:0;">
        <summary style="cursor:pointer;list-style:none;padding:10px 12px;color:var(--gold);font-size:11px;user-select:none;">
          <span class="bnn-notes-toggle" style="display:inline-block;width:14px;">[+]</span> Additional Notes from BNN Source Material
        </summary>
        <div style="padding:4px 12px 12px 12px;border-top:1px solid var(--border);">${body}</div>
      </details>
      <style>.bnn-integrated-report summary::-webkit-details-marker, .pred-item summary::-webkit-details-marker { display: none; }</style>`;
  }
  function renderHtml(sections) {
    let html = '<div style="display:grid;gap:12px;">';
    sections.forEach(sec => {
      html += `
        <div style="background:rgba(20,20,40,0.5);border:1px solid var(--border);border-left:3px solid var(--gold);border-radius:4px;padding:12px;">
          <h3 style="color:var(--gold);font-size:12px;margin:0 0 8px 0;">${escapeHtml(sec.title)}</h3>
          <ul style="margin:0;padding-left:18px;font-size:10.5px;color:var(--text);line-height:1.5;">
            ${sec.findings.map(f => `<li>${escapeHtml(typeof f === 'string' ? f : f.text)}</li>`).join('')}
          </ul>
        </div>`;
    });
    html += '</div>';
     html += renderSourceNotes();
    return html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // ========== 10. EXPORT ==========

  window.BNN_ENGINE = {
    SIGNS,
    PLANETS,
    buildChart,
    signHouse,
    distanceInSigns,
    isConjunct,
    conjunctPlanets,
    planetsAtDistance,
    analyzeMarriage,
    analyzeForeignTravel,
    analyzeProgeny,
    analyzeHouseYoga,
    analyzeProfession,
    analyzeEducation,
    runFullAnalysis
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.BNN_ENGINE;
  }

})();
// --- END OF FILE bnn_engine.js ---