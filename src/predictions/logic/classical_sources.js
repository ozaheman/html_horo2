(function (global) {
  'use strict';

  const SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const SIGN_LORDS = [
    'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
    'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
  ];
  const PLANETS = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus',
    'Saturn', 'Rahu', 'Ketu'
  ];
  const HOUSE_TOPICS = {
    1: 'identity, body and vitality',
    2: 'resources, family and speech',
    3: 'initiative, skills and siblings',
    4: 'home, property and inner wellbeing',
    5: 'learning, discernment and children',
    6: 'service, obligations and obstacles',
    7: 'partnerships and agreements',
    8: 'shared matters, change and vulnerability',
    9: 'principles, teachers and fortune',
    10: 'work, responsibility and public role',
    11: 'gains, networks and aspirations',
    12: 'expenditure, retreat and release'
  };
  const PLANET_TOPICS = {
    Sun: 'purpose, authority and vitality',
    Moon: 'feeling, care and receptivity',
    Mars: 'initiative, effort and competition',
    Mercury: 'learning, communication and trade',
    Jupiter: 'counsel, principles and growth',
    Venus: 'agreement, enjoyment and comfort',
    Saturn: 'duty, persistence and limitation',
    Rahu: 'ambition, novelty and unconventional paths',
    Ketu: 'separation, focus and inward study'
  };
  const PROFESSION_TOPICS = {
    Sun: 'government, authority and power',
    Moon: 'travel, arts and liquids',
    Mars: 'machinery and energy',
    Mercury: 'trade, commerce and intelligence',
    Jupiter: 'prestige and spiritual matters',
    Venus: 'finance and monetary gain',
    Saturn: 'profession and sustained work',
    Rahu: 'large-scale or unconventional fields',
    Ketu: 'writing, lines, threads and specialized work'
  };
  const GOCHAR_RULES = {
    Sun: { favorable: [3, 6, 10, 11], adverse: [1, 2, 4, 5, 8, 9, 12] },
    Moon: { favorable: [1, 3, 6, 7, 10, 11], adverse: [2, 4, 5, 8, 12] },
    Mars: { favorable: [3, 6, 11], adverse: [1, 2, 3, 5, 7, 8, 9, 10, 12], unlisted: [4] },
    Mercury: { favorable: [6, 8, 10, 11], adverse: [1, 2, 3, 4, 5, 7, 9, 12] },
    Jupiter: { favorable: [2, 5, 7, 9, 11], adverse: [1, 3, 4, 6, 8, 10, 12] },
    Venus: { favorable: [1, 2, 3, 4, 5, 8, 9, 11, 12], adverse: [6, 7, 10] },
    Saturn: { favorable: [3, 6, 9, 11], adverse: [1, 2, 4, 5, 7, 8, 9, 10, 12], mixed: [9] },
    Rahu: { favorable: [3, 6, 11], adverse: [1, 2, 4, 7, 8, 9, 10, 12] },
    Ketu: { favorable: [3, 6, 11], adverse: [1, 2, 4, 7, 8, 9, 10, 12] }
  };

  const SOURCES = {
    classical_bphs: {
      name: 'Brihat Parashara Hora Shastra',
      context: 'Parashara’s house judgement and bhava-lord sections',
      references: [
        { file: './reference/bookbph.md', label: 'reference/bookbph.md', citation: 'Ch. 11, pp. 120–125; Chs. 12–23, pp. 126–186; Ch. 24, from p. 189' }
      ]
    },
    classical_laghu: {
      name: 'Laghu Parashari',
      context: 'Vimshottari dasha, functional lordship and yoga sections',
      references: [
        { file: './reference/booklbph.md', label: 'reference/booklbph.md', citation: 'Preliminaries, pp. 13–53; Yogadhyaya, pp. 54–87; Dasha Phala, pp. 103–131' }
      ],
      shlokaReferences: [
        {
          title: 'Laghu Parashari, Preliminaries, verse 3',
          status: 'reference-found',
          text: 'फलानि नक्षत्र दशा प्रकारेण विवृणमहे। दशा विंशोत्तरी चात्र ग्राह्या नाष्टोत्तरी मता॥३॥',
          meaning: 'The text specifies Vimshottari Nakshatra Dasha as the timing system used for its rules.',
          file: './reference/shlokas/classical_prediction_shlokas.md'
        }
      ]
    },
    classical_phaladeepika: {
      name: 'Phaladeepika',
      context: 'Bhava analysis and the results of the twelve houses',
      references: [
        { file: './reference/bookphd.md', label: 'reference/bookphd.md', citation: 'Ch. 8, Bhavashraya Phal, pp. 163–187; Chs. 15–16, pp. 261–297' }
      ],
      planetShlokaRanges: {
        Sun: '1–4',
        Moon: '5–7',
        Mars: '8–10',
        Mercury: '11–13',
        Jupiter: '14–16',
        Venus: '17–19',
        Saturn: '20–24',
        Rahu: '25–27',
        Ketu: '28–33'
      },
      shlokaUrl: 'https://archive.org/details/Phaladeepika2ndEd.1950ByVSubrahmanyaSastri'
    },
    classical_saravali: {
      name: 'Saravali',
      context: 'Planetary results in houses and bhava analysis',
      references: [
        { file: './reference/saravali-1.md', label: 'reference/saravali-1.md', citation: 'Ch. 8, pp. 163–187; Ch. 15, pp. 261–281' },
        { file: './reference/saravali-2.md', label: 'reference/saravali-2.md', citation: 'Ch. 30, from p. 473' }
      ],
      shlokaReferences: [
        {
          title: 'Saravali, Vol. II, Ch. 30, verse 1',
          status: 'reference-found',
          text: '',
          meaning: 'Opening verse introducing the analysis of horoscope houses; cited as the source for the house-results section.',
          file: './reference/saravali-2.md'
        }
      ]
    },
    classical_raman: {
      name: 'Hindu Predictive Astrology · B. V. Raman',
      context: 'Judgment of Bhavas, planets in houses and Gocharaphala',
      references: [
        { file: './reference/bookpreastro.md', label: 'reference/bookpreastro.md', citation: 'Ch. XIX, p. 90; Ch. XXI, p. 112' }
      ],
      shlokaReferences: [
        {
          title: 'Hindu Predictive Astrology, house and transit rules',
          status: 'reference-needed',
          verificationNote: 'REFERENCE NEEDED — VERIFY a specific Sanskrit verse and edition citation. The online scan checked for this source’s transit chapter gives prose rules, not a numbered shloka.',
          meaning: 'The cited chapters provide house and transit rules in prose; no individual verse is identified in the extract.',
          file: './reference/bookpreastro.md',
          url: 'https://archive.org/details/hindupredictiveastrologyofbvraman'
        }
      ]
    },
    classical_profession: {
      name: 'Profession from the Position of Planets · R. G. Rao',
      context: 'Saturn, planets in its sign and the seventh sign, and planetary karakatwas',
      references: [
        { file: './reference/bookrgrao.md', label: 'reference/bookrgrao.md', citation: '“Profession from the Position of Planets” section; the extract does not preserve printed page numbers' }
      ],
      shlokaReferences: [
        {
          title: 'Profession from the Position of Planets, Saturn-based method',
          status: 'reference-needed',
          verificationNote: 'REFERENCE NEEDED — VERIFY whether the source has a Sanskrit verse for this method; no verse citation is present in the extract.',
          meaning: 'The extract describes the method in prose and illustrative charts, without an individual verse reference.',
          file: './reference/bookrgrao.md'
        }
      ]
    },
    classical_gochar: {
      name: 'Gochar Phaladeepika · Current transit',
      context: 'Current planetary transits counted from the natal Moon, with source-table qualifications',
      references: [
        { file: './reference/bookgphd.md', label: 'reference/bookgphd.md', citation: 'Ch. 8, p. 61; Ch. 10, p. 69; Chs. 11–20, pp. 77–192; Chs. 21–22, pp. 200–205; Ch. 27, p. 241' }
      ],
      shlokaReferences: [
        {
          title: 'Gochar Phaladeepika, Ch. 20, Transit Results at a Glance — Sanskrit Texts, p. 192',
          status: 'reference-needed',
          verificationNote: 'REFERENCE NEEDED — VERIFY the individual verse number and exact stanza against the cited edition. The online scan is available, but its OCR did not establish a reliable verse number for this table.',
          meaning: 'The extracted Sanskrit section is a section-level reference for the transit table used here, not a claim that one numbered verse covers every planet.',
          file: './reference/bookgphd.md',
          url: 'https://archive.org/details/13-book.-gochar-phaladeepika-dr.-u.-s.-pulippani'
        }
      ]
    }
  };

  function signIndex(position) {
    if (!position || typeof position !== 'object') return null;
    const sign = Number(position.sn);
    if (Number.isInteger(sign) && sign >= 0 && sign < 12) return sign;
    const longitude = Number(position.sid ?? position.longitude);
    if (Number.isFinite(longitude)) return Math.floor((((longitude % 360) + 360) % 360) / 30);
    return null;
  }

  function getChart(planets, ascendant) {
    const ascSign = signIndex(ascendant);
    if (ascSign === null || !planets || typeof planets !== 'object') return null;

    const placements = [];
    PLANETS.forEach((name) => {
      const position = planets[name];
      const planetSign = signIndex(position);
      if (planetSign === null) return;
      const house = ((planetSign - ascSign + 12) % 12) + 1;
      placements.push({
        name: name,
        sign: SIGNS[planetSign],
        house: house
      });
    });

    if (placements.length === 0) return null;

    const houseLords = {};
    for (let house = 1; house <= 12; house++) {
      houseLords[house] = SIGN_LORDS[(ascSign + house - 1) % 12];
    }

    const lordHouses = {};
    Object.keys(houseLords).forEach((house) => {
      const lord = houseLords[house];
      lordHouses[lord] = lordHouses[lord] || [];
      lordHouses[lord].push(Number(house));
    });

    return { ascSign: ascSign, placements: placements, houseLords: houseLords, lordHouses: lordHouses };
  }

  function makePlacementPredictions(chart, source) {
    return chart.placements.map((placement) => {
      const prediction = {
        category: 'Planetary placement',
        title: placement.name + ' in House ' + placement.house,
        description: placement.name + ' (' + PLANET_TOPICS[placement.name] + ') occupies House ' + placement.house +
          ' (' + HOUSE_TOPICS[placement.house] + '). This brings the planet’s topics into focus in this area; ' +
          'the sign, house lord, strength and associations qualify the indication.',
        chartFacts: placement.name + ' in ' + placement.sign + ', House ' + placement.house,
        references: source.references
      };
      const verseRange = source.planetShlokaRanges && source.planetShlokaRanges[placement.name];
      if (verseRange) {
        prediction.shloka = {
          title: 'Phaladeepika, Adhyaya VIII, ślokas ' + verseRange + ' (' + placement.name + ' house results)',
          status: 'reference-found',
          meaning: 'The online edition’s contents assigns this verse range to ' + placement.name +
            ' in the houses. It is a planet-level range; this report does not infer a single verse for each house.',
          file: './reference/bookphd.md',
          url: source.shlokaUrl
        };
      }
      return prediction;
    });
  }

  function makeHouseLordPredictions(chart, source) {
    const predictions = [];
    for (let house = 1; house <= 12; house++) {
      const lord = chart.houseLords[house];
      const placement = chart.placements.find((item) => item.name === lord);
      if (!placement) continue;

      const otherLords = chart.lordHouses[lord].filter((ownedHouse) => ownedHouse !== house);
      const sharedOwnership = otherLords.length
        ? ' It also rules House' + (otherLords.length > 1 ? 's ' : ' ') + otherLords.join(', ') + '.'
        : '';
      predictions.push({
        category: 'House-lord connection',
        title: 'House ' + house + ' lord in House ' + placement.house,
        description: 'The lord of House ' + house + ' (' + HOUSE_TOPICS[house] + ') is ' + lord +
          ', placed in House ' + placement.house + ' (' + HOUSE_TOPICS[placement.house] + '). ' +
          'This links these areas and may show one affecting the other.' + sharedOwnership +
          ' Judge the result with the condition of the house and lord, related planets, and period activation.',
        chartFacts: lord + ' rules House' + (chart.lordHouses[lord].length > 1 ? 's ' : ' ') +
          chart.lordHouses[lord].join(', ') + ' and occupies House ' + placement.house,
        references: source.references
      });
    }
    return predictions;
  }

  function dashaLord(dashaInfo) {
    const mahadasha = dashaInfo && dashaInfo.mahadasha;
    if (typeof mahadasha === 'string') return mahadasha;
    return mahadasha && (mahadasha.lord || mahadasha.planet || mahadasha.name) || null;
  }

  function makeDashaPrediction(chart, source, dashaInfo) {
    const lord = dashaLord(dashaInfo);
    if (!lord || !chart.lordHouses[lord]) return null;
    const placement = chart.placements.find((item) => item.name === lord);
    if (!placement) return null;

    const ownedHouses = chart.lordHouses[lord];
    const ownedTopics = ownedHouses.map((house) => 'House ' + house + ' (' + HOUSE_TOPICS[house] + ')');
    const trikonaHouses = ownedHouses.filter((house) => [1, 5, 9].includes(house));
    const trishadayaHouses = ownedHouses.filter((house) => [3, 6, 11].includes(house));
    let ownershipReading = 'Its period should be weighed through its house ownership, placement and relationships.';
    if (trikonaHouses.length && trishadayaHouses.length) {
      ownershipReading = 'It owns both trinal houses (' + trikonaHouses.join(', ') +
        ') and effort/challenge houses (' + trishadayaHouses.join(', ') +
        '); weigh both indications and the planet’s relationships.';
    } else if (trikonaHouses.length) {
      ownershipReading = 'Its trinal ownership (' + trikonaHouses.join(', ') +
        ') is a supportive factor, subject to strength and relationships.';
    } else if (trishadayaHouses.length) {
      ownershipReading = 'Its ownership of effort/challenge houses (' + trishadayaHouses.join(', ') +
        ') calls for careful assessment of strength and relationships.';
    }
    if (ownedHouses.includes(8)) {
      ownershipReading += ' Its additional ownership of House 8 is another factor to qualify.';
    }
    return {
      category: 'Vimshottari timing',
      title: 'Current Mahadasha: ' + lord,
      description: 'The current Vimshottari Mahadasha is ruled by ' + lord + ', which owns ' +
        ownedTopics.join(' and ') + ' and is placed in House ' + placement.house + ' (' +
        HOUSE_TOPICS[placement.house] + '). ' + ownershipReading +
        ' Laghu Parashari treats dasha results as period-specific; the Antardasha must also be considered.',
      chartFacts: 'Mahadasha lord ' + lord + '; occupies House ' + placement.house,
      references: source.references
    };
  }

  function makeBphsYogaPredictions(chart, source) {
    const fifthLord = chart.houseLords[5];
    const placement = chart.placements.find((item) => item.name === fifthLord);
    if (!placement) return [];

    if (placement.house === 10) {
      return [{
        category: 'Yoga indication',
        title: 'Fifth lord in the tenth house',
        description: 'The BPHS house-lord section associates this placement with status and recognition. ' +
          'The source commentary stresses that strength and affliction can change the outcome, so treat this as ' +
          'a conditional indication rather than a guaranteed Raja Yoga.',
        chartFacts: fifthLord + ' rules House 5 and occupies House 10',
        references: source.references,
        shloka: {
          title: 'BPHS, Chapter 24, verse 58',
          status: 'reference-found',
          text: 'सुतेशे राज्यमावस्थे राजयोगो हि जायते। अनेकसुखभोगी च स्यातकीतिर्नरो भवेत् ॥५८॥',
          meaning: 'The text associates this placement with status and recognition; its commentary qualifies the result by strength and affliction.',
          file: './reference/shlokas/classical_prediction_shlokas.md'
        }
      }];
    }
    if (placement.house === 11) {
      return [{
        category: 'Gain indication',
        title: 'Fifth lord in the eleventh house',
        description: 'The BPHS house-lord section links this placement with learning, social regard and gains. ' +
          'The condition of the planet and its associations still need to be judged.',
        chartFacts: fifthLord + ' rules House 5 and occupies House 11',
        references: source.references
      }];
    }
    return [];
  }

  function makeGocharPredictions(source, input) {
    const natalMoonSign = signIndex(input.planets && input.planets.Moon);
    if (natalMoonSign === null) {
      return {
        error: 'A valid natal Moon sign is required to calculate Gochar houses from Janma Rasi.',
        predictions: []
      };
    }
    if (!input.transitPlanets || typeof input.transitPlanets !== 'object') {
      return {
        error: 'Current transit positions are unavailable for the selected date.',
        predictions: []
      };
    }

    const predictions = [];
    PLANETS.forEach((name) => {
      const position = input.transitPlanets[name];
      const transitSign = signIndex(position);
      if (transitSign === null) return;

      const house = ((transitSign - natalMoonSign + 12) % 12) + 1;
      const rule = GOCHAR_RULES[name];
      const isFavorable = rule.favorable.includes(house);
      const isAdverse = rule.adverse.includes(house);
      let classification = 'Not classified in the source table';
      let description = 'The extract does not classify this planet in this house; avoid drawing a favorable or adverse conclusion from this table alone.';

      if ((rule.mixed || []).includes(house) || (isFavorable && isAdverse)) {
        classification = 'Mixed in source — verify';
        description = 'The extract gives conflicting classifications for this transit house. The report flags it for source verification instead of choosing one result.';
      } else if (isFavorable) {
        classification = 'Supportive position in source table';
        description = 'The source table treats this as a supportive transit position. It may be read as a more favorable period for ' +
          HOUSE_TOPICS[house] + ', subject to the natal chart and other transit factors.';
      } else if (isAdverse) {
        classification = 'Caution position in source table';
        description = 'The source table treats this as a position requiring care. Review plans involving ' +
          HOUSE_TOPICS[house] + ' and weigh the wider chart before drawing conclusions.';
      }

      predictions.push({
        category: 'Current Gochar',
        title: name + ' in House ' + house + ' from natal Moon',
        description: description,
        chartFacts: name + ' transits ' + SIGNS[transitSign] + '; natal Moon is in ' + SIGNS[natalMoonSign],
        classification: classification,
        references: source.references
      });
    });

    if (!predictions.length) {
      return {
        error: 'No usable planetary transit positions were returned for the selected date.',
        predictions: []
      };
    }

    const date = input.currentDate instanceof Date && !Number.isNaN(input.currentDate.getTime())
      ? input.currentDate
      : null;
    const currentDasha = dashaContext(input.dashaInfo);
    return {
      source: source,
      currentDate: date ? date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') : null,
      natalMoon: SIGNS[natalMoonSign],
      dashaContext: currentDasha,
      intro: 'Transit houses are counted from the natal Moon, following the source. This summary uses its transit-at-a-glance table; the text also requires reconciliation with Dasha/Bhukti and other factors such as Vedha and Ashtakavarga, which are not calculated here.',
      predictions: predictions,
      shlokas: (source.shlokaReferences || []).slice()
    };
  }

  function dashaContext(dashaInfo) {
    if (!dashaInfo) return null;
    const parts = [];
    const maha = dashaLord(dashaInfo);
    const antar = dashaLord({ mahadasha: dashaInfo.antardasha });
    if (maha) parts.push('Mahadasha: ' + maha);
    if (antar) parts.push('Antardasha: ' + antar);
    return parts.length ? parts.join('; ') : null;
  }

  function makeProfessionPrediction(chart, source) {
    const saturn = chart.placements.find((placement) => placement.name === 'Saturn');
    if (!saturn) return null;

    const saturnSign = SIGNS.indexOf(saturn.sign);
    const seventhSign = (saturnSign + 6) % 12;
    const withSaturn = chart.placements.filter((placement) =>
      SIGNS.indexOf(placement.sign) === saturnSign && placement.name !== 'Saturn'
    );
    const oppositeSaturn = chart.placements.filter((placement) =>
      SIGNS.indexOf(placement.sign) === seventhSign
    );
    const describePlanets = (placements) => placements.length
      ? placements.map((placement) => placement.name + ' (' + PROFESSION_TOPICS[placement.name] + ')').join(', ')
      : 'none shown in the available chart data';

    return {
      category: 'Professional indications',
      title: 'Profession indicators around Saturn in ' + saturn.sign,
      description: 'R. G. Rao’s extract uses Saturn as a profession indicator and examines planets with Saturn or in the seventh sign from it, then their karakatwas. ' +
        'The associated themes are possibilities for reflection, not a definite occupation or career outcome.',
      chartFacts: 'With Saturn: ' + describePlanets(withSaturn) + '. In the seventh sign (' +
        SIGNS[seventhSign] + '): ' + describePlanets(oppositeSaturn) + '.',
      references: source.references
    };
  }

  function generate(mode, input) {
    const source = SOURCES[mode];
    if (!source) {
      return { error: 'The selected classical source is not supported.', predictions: [] };
    }

    input = input || {};
    if (mode === 'classical_gochar') {
      return makeGocharPredictions(source, input);
    }

    const chart = getChart(input && input.planets, input && input.ascendant);
    if (!chart) {
      return {
        source: source,
        error: 'A valid natal ascendant and planetary positions are required for this source analysis.',
        predictions: []
      };
    }

    let predictions = [];
    if (mode === 'classical_laghu') {
      const dasha = makeDashaPrediction(chart, source, input.dashaInfo);
      if (!dasha) {
        return {
          source: source,
          error: 'Vimshottari Mahadasha information is unavailable for the selected date. Rebuild or calculate dasha data and try again.',
          predictions: []
        };
      }
      predictions.push(dasha);
    } else if (mode === 'classical_profession') {
      const profession = makeProfessionPrediction(chart, source);
      if (!profession) {
        return {
          source: source,
          error: 'Saturn’s natal sign is required for the source’s profession analysis.',
          predictions: []
        };
      }
      predictions.push(profession);
    } else {
      predictions = makePlacementPredictions(chart, source)
        .concat(makeHouseLordPredictions(chart, source));
      if (mode === 'classical_bphs') {
        predictions.unshift.apply(predictions, makeBphsYogaPredictions(chart, source));
      }
    }

    return {
      source: source,
      ascendant: SIGNS[chart.ascSign],
      predictions: predictions,
      shlokas: (source.shlokaReferences || []).concat(
        predictions.filter((prediction) => prediction.shloka).map((prediction) => prediction.shloka)
      )
    };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function renderHTML(report) {
    if (report.error) {
      return '<div class="pred-item"><div class="pred-title">Classical source analysis unavailable</div>' +
        '<div class="pred-detail">' + escapeHtml(report.error) + '</div></div>';
    }

    let html = '<h3 style="color:var(--violet);margin:18px 0 8px;">' +
      escapeHtml(report.source.name) +
      (report.currentDate ? ' · ' + escapeHtml(report.currentDate) : ' · ' + escapeHtml(report.ascendant) + ' rising') +
      '</h3>' +
      '<p class="pred-detail">' + escapeHtml(report.intro ||
        'Interpretive indications based on natal whole-sign houses. These are traditional possibilities, not certain outcomes.') + '</p>';
    if (report.dashaContext) {
      html += '<p class="pred-detail"><strong>Current Dasha/Bhukti context:</strong> ' +
        escapeHtml(report.dashaContext) + '</p>';
    }

    report.predictions.forEach((prediction) => {
      html += '<div class="pred-item">' +
        '<div class="pred-title">' + escapeHtml(prediction.title) + '</div>' +
        (prediction.classification ? '<div class="pred-detail"><strong>Source classification:</strong> ' +
          escapeHtml(prediction.classification) + '</div>' : '') +
        '<div class="pred-detail">' + escapeHtml(prediction.description) + '</div>' +
        '<div class="pred-detail"><strong>Chart basis:</strong> ' + escapeHtml(prediction.chartFacts) + '</div>' +
        '<div class="pred-detail"><strong>Source:</strong> ';
      html += prediction.references.map((reference) =>
        '<a href="' + escapeHtml(reference.file) + '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(reference.label) + '</a> · ' + escapeHtml(reference.citation)
      ).join('; ');
      html += '</div></div>';
    });

    html += '<div class="pred-item"><div class="pred-title">Shloka references</div>';
    if (report.shlokas && report.shlokas.length) {
      report.shlokas.forEach((shloka) => {
        html += '<div class="pred-detail"><strong>' + escapeHtml(shloka.title) + '</strong></div>' +
          (shloka.text ? '<div class="pred-detail" lang="sa">' + escapeHtml(shloka.text) + '</div>' : '') +
          (shloka.meaning ? '<div class="pred-detail">' + escapeHtml(shloka.meaning) + '</div>' : '') +
          (shloka.verificationNote ? '<div class="pred-detail"><strong>' +
            escapeHtml(shloka.verificationNote) + '</strong></div>' : '') +
          '<div class="pred-detail"><a href="' + escapeHtml(shloka.url || shloka.file) +
          '" target="_blank" rel="noopener noreferrer">' +
          (shloka.url ? 'Open online source edition' : 'Open source extract') + '</a></div>';
      });
    } else {
      html += '<div class="pred-detail">No verified verse is directly matched to these results yet. ' +
        'Unverified verse collections are not displayed.</div>';
    }
    html += '</div>';
    return html;
  }

  const api = {
    sources: SOURCES,
    generate: generate,
    renderHTML: renderHTML
  };
  global.CLASSICAL_SOURCES = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
