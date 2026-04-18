/**
 * PREDICTION SYSTEM - Phaladeepika Rule Engine
 * Classical astrology interpretation based on Phaladeepika and Jaimini texts
 * 
 * Key Functions:
 * - applyPhaladeepika()           : Get classic rules for planet in house/sign/aspect
 * - getPhaladeepikaPrediction()   : Full predictive report
 * - interpretYogaWithPhaladeepika(): Yoga interpretation using classic rules
 * - getPlanetaryResultsByHouse()  : All classical results for planet in each house
 */

window.PREDICTION_PHALADEEPIKA = {
  
  /**
   * Apply Phaladeepika classical rules for a planet in given house/sign
   * @param {String} planetName - Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
   * @param {Number} house - House number (1-12)
   * @param {String} sign - Sign name (Aries, Taurus, etc.)
   * @param {Array} aspects - Array of aspecting planets
   * @returns {Array} Classical prediction texts
   */
  applyPhaladeepika: function(planetName, house, sign, aspects = []) {
    const predictions = [];
    
    // Get base prediction for planet in house
    const houseRule = this.getPlanetInHouseRule(planetName, house);
    if (houseRule) predictions.push(houseRule);
    
    // Get sign-based modifiers
    const signRule = this.getPlanetInSignRule(planetName, sign);
    if (signRule) predictions.push(signRule);
    
    // Apply aspect modifications
    if (aspects && aspects.length > 0) {
      aspects.forEach(aspect => {
        const aspectText = this.getAspectModifier(aspect.planet, planetName, aspect.type);
        if (aspectText) predictions.push(aspectText);
      });
    }
    
    return predictions;
  },
  
  /**
   * Generate comprehensive Phaladeepika prediction report
   * @param {Object} birthChart - Current chart object
   * @returns {Object} Complete predictive analysis
   */
  getPhaladeepikaPrediction: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return null;
    
    const report = {
      generatedDate: new Date().toISOString().split('T')[0],
      title: 'Phaladeepika Predictive Analysis',
      methodology: 'Based on classical Phaladeepika and Hora Shastra texts',
      planetaryResults: {},
      overallInterpretation: '',
      strengths: [],
      challenges: [],
      recommendations: []
    };
    
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    planetNames.forEach(planetName => {
      const planet = birthChart[planetName];
      if (!planet) return;
      
      const sign = signNames[planet.sn % 12];
      const house = planet.house || 1;
      
      const predictions = this.applyPhaladeepika(planetName, house, sign, []);
      const dignity = this.getDignityInterpretation(planet.status);
      
      report.planetaryResults[planetName] = {
        position: `${house}th house in ${sign}`,
        dignity: planet.status,
        dignityInterpretation: dignity,
        retrograde: planet.retro ? '(Retrograde - Intensified)' : '',
        combust: planet.combust ? '(Combust - Diminished)' : '',
        predictions: predictions,
        primaryResult: predictions.length > 0 ? predictions[0] : 'Analyze through divisional charts',
        gemstone: this.recommendGemstone(planetName, planet.status),
        mantra: this.recommendMantra(planetName),
        day: this.getPlanetaryDay(planetName)
      };
      
      // Collect strengths and challenges
      if (['Own', 'Exalt.', 'Mool'].includes(planet.status)) {
        report.strengths.push(`${planetName} in ${sign} ${house}H - Strong significations`);
      }
      if (['Deb.', 'Enemy'].includes(planet.status)) {
        report.challenges.push(`${planetName} in ${sign} ${house}H - Needs support & remedies`);
      }
    });
    
    // Generate overall interpretation
    report.overallInterpretation = this.generateOverallInterpretation(
      birthChart,
      report.strengths,
      report.challenges
    );
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(birthChart);
    
    return report;
  },
  
  /**
   * Interpret yoga using Phaladeepika context
   * @param {Object} yoga - Yoga definition
   * @param {Object} charts - Chart data (can include divisional charts)
   * @returns {Object} Context-aware interpretation
   */
  interpretYogaWithPhaladeepika: function(yoga, charts = {}) {
    const interpretation = {
      yogaName: yoga.name,
      category: yoga.category || 'Natal Yoga',
      phaladeepikaMeaning: this.getPhaladeepikaMeaning(yoga.name),
      classicalResult: yoga.result || '',
      modernInterpretation: yoga.effect || '',
      strength: yoga.strength || 'Unknown',
      yogaSpecificRules: this.getYogaSpecificRules(yoga.name),
      cancellationFactors: this.getYogaCancellationFactors(yoga.name),
      supportingFactors: this.getYogaSupportingFactors(yoga.name),
      applications: this.getYogaApplications(yoga.name),
      gemstones: yoga.deities ? this.getGemstonesForDeities(yoga.deities) : [],
      mantras: yoga.mantras || [],
      rituals: yoga.remedies || [],
      timeToActivate: this.getYogaActivationPeriod(yoga.name),
      expectedOutcomes: this.getYogaOutcomes(yoga.name)
    };
    
    return interpretation;
  },
  
  /**
   * Get all Phaladeepika planetary results organized by house
   * @returns {Object} House-wise results for each planet
   */
  getPlanetaryResultsByHouse: function() {
    return {
      Sun: {
        1: 'Self-confidence, authority, leadership, health, personality. If weak: suffering, diseases during childhood.',
        2: 'Speech authority, wealth through own efforts, family property. If weak: financial difficulties, family disputes.',
        3: 'Courage, siblings, communication, business. If weak: lack of initiative, weak siblings.',
        4: 'Vehicles, property, mother, happiness. If weak: unhappy mother, property loss.',
        5: 'Children, creativity, intellect, romance. If weak: childlessness, creative blocks.',
        6: 'Service, enemies overcome, health issues. If weak: frequent illnesses, enemies' success.',
        7: 'Marriage, partnership, public image. If weak: marriage delays, partnership failure.',
        8: 'Longevity challenges, inheritance, occult. If weak: health threats, sudden losses.',
        9: 'Father, luck, spirituality, long journey. If weak: paternal separation, bad luck.',
        10: 'Career success, status, public recognition. If weak: career stagnation, lost reputation.',
        11: 'Gains, friends, income, aspirations fulfilled. If weak: failed hopes, financial loss.',
        12: 'Expenses, foreign travel, isolation, losses. If weak: forced expenditure, health issues.'
      },
      Moon: {
        1: 'Excellent health, good appearance, emotional sensitivity, popularity.',
        2: 'Wealth through inheritance, good family relations, eloquent speech.',
        3: 'Emotional courage, interest in arts, short travels, sibling support.',
        4: 'Domestic happiness, mother's blessings, property ownership, emotional peace.',
        5: 'Creative talents, good children, romance, educational success.',
        6: 'Health concerns, mental disturbance, enemies around, service career.',
        7: 'Popular wife, happy marriage, good social life, partnership success.',
        8: 'Longevity challenges, sudden wealth (inheritance), occult interests.',
        9: 'Pilgrimage inclination, religious faith, good fortune, support from guides.',
        10: 'Career in nursing/hospitality, public service, recognition.',
        11: 'Popularity, many friends, income from public service, aspirations met.',
        12: 'Foreign settlement, spiritual practices, monastery life possible.'
      },
      Mars: {
        1: 'Courage, energy, sports ability, military inclination, aggressive nature.',
        2: 'Financial success through own efforts, bold decisions, family property.',
        3: 'Courage, strong siblings, communication skills, competition success.',
        4: 'Property disputes, vehicle accidents risk, mother conflicts, engineering bent.',
        5: 'Children difficulties, but sports excellence, engineering talents.',
        6: 'Victory over enemies, courage, good health, surgery success if needed.',
        7: 'Quarrelsome spouse, passionate marriage, sexual vigor, conflict risk.',
        8: 'Accidents risk, sudden events, surgery predictions, violent death risk.',
        9: 'Pilgrimage warrior, courage for righteousness, father's wealth, good luck through action.',
        10: 'Military career, police, engineering, architecture - action-oriented professions.',
        11: 'Gains through courage, influential friends, athletic achievements.',
        12: 'Foreign travel for work, military abroad, accidents in foreign land.'
      },
      Mercury: {
        1: 'Excellent intelligence, communication skills, mental agility, business ability.',
        2: 'Wealth through commerce, trade, writing, good financial language.',
        3: 'Excellent communication, writing, journalism, commerce, sibling support.',
        4: 'Vehicles, property dealings, mental peace, education in mother's home.',
        5: 'Intellectual children, writing/poetry success, student accomplishments.',
        6: 'Health management profession (doctor, pharmacist), clerical work, solving problems.',
        7: 'Intelligent spouse, witty partnership, merchant marriage, communication harmony.',
        8: 'Intellectual crisis, sudden information loss, mysteries, surgery (mental).',
        9: 'Teaching, writing on philosophy, long travel planning, intellectual pilgrimage.',
        10: 'Career in writing, commerce, teaching, communications, accounting.',
        11: 'Gains through writing, business, intellect. Influential circle of friends.',
        12: 'Writing abroad, teaching overseas, spiritual learning, intellectual isolation.'
      },
      Jupiter: {
        1: 'Wisdom, prosperity, good health, respect, spiritual inclination, leadership.',
        2: 'Immense wealth, gold ownership, good family, generous, religious.',
        3: 'Wisdom, good communication, success in business, younger sibling protected.',
        4: 'Happiness, property, vehicles, mother's blessings, education, spiritual home.',
        5: 'Good children, intelligence, creativity, success in competitive exams.',
        6: 'Victory over enemies through wisdom, health improvement, service to poor.',
        7: 'Virtuous spouse, ideal marriage, partnership prosperity, wealth through partner.',
        8: 'Long life (Jupiter extending), wealth through inheritance, spiritual transformation.',
        9: 'Father's blessings, highest luck, pilgrimage success, spiritual achievement.',
        10: 'Excellent career, public respect, teaching career, law/justice.',
        11: 'Gains materialize, many virtuous friends, all aspirations fulfilled.',
        12: 'Spiritual gains, monastery tendency, charity work, foreign pilgrimage.'
      },
      Venus: {
        1: 'Beauty, charm, love, artistic talents, sensual nature, good appearance.',
        2: 'Luxury, wealth, indulgence, good food, beautiful objects, female family support.',
        3: 'Artistic communication, sibling affection, cooperation, business with pleasure.',
        4: 'Love of comforts, vehicles, beautiful home, mother's affection, wife\'s beauty.',
        5: 'Romance success, artistic children, entertainment career, pleasure seekers.',
        6: 'Love affairs complicated, enemies seduced (unusual), health luxuries.',
        7: 'Beautiful spouse, passionate marriage, partnership wealth, artistic collaboration.',
        8: 'Sexual magnetism, sudden wealth (spouse inheritance), occult/tantra interest.',
        9: 'Spiritual love (devotion), pilgrimage for romance, father's wealth, grace received.',
        10: 'Career in entertainment, arts, beauty industry, luxury business.',
        11: 'Gains through beauty/arts, wealthy friends, social popularity, desires achieved.',
        12: 'Love in foreign land, artistic pilgrimage, romance in monasteries.'
      },
      Saturn: {
        1: 'Delays, restrictions in youth, hard work needed, longevity, discipline.',
        2: 'Financial struggles early, slow wealth accumulation, property after 30.',
        3: 'Sibling loss possibility, harsh communication, business after 30.',
        4: 'Property disputes, late vehicle, mother's hardship, anxiety early life, delays comfort.',
        5: 'Children difficulties (no children possible), business losses through speculation.',
        6: 'Chronic diseases, enemy victory (unusual), service restriction, imprisonment risk.',
        7: 'Late marriage, difficult spouse, partnership hardships, marriage after 35.',
        8: 'Difficult longevity, chronic diseases, sudden accidents, early death risk.',
        9: 'Father's loss, bad luck early, pilgrimage hardships, grandfather loss.',
        10: 'Career struggles initially, late success after 30, hard-earned status.',
        11: 'Delayed gains, restricted friends, late aspirations fulfillment.',
        12: 'Foreign suffering, imprisonment possibility, monastic inclination after 50+.'
      },
      Rahu: {
        1: 'Obsessive personality, unusual appearance, unconventional, materialistic.',
        2: 'Sudden wealth, dishonest gains possible, relationship with mother unstable.',
        3: 'Younger siblings' issues, communication about unconventional subjects.',
        4: 'Property through unusual means, mother's instability, late education.',
        5: 'Children difficulties, love affairs unconventional and problematic.',
        6: 'Enemies overcome through unconventional methods, poison/medicine related.',
        7: 'Unconventional marriage, foreign spouse, partnership instability.',
        8: 'Sudden death/accidents, hidden inheritance, secret discoveries.',
        9: 'Spirituality through unconventional paths, foreign pilgrimage.',
        10: 'Career in unconventional fields, occult, foreign business, sudden success.',
        11: 'Gains through speculation/industry, unusual friends, network expansion.',
        12: 'Foreign imprisonment possibility, hidden foreign settlements, occult practices.'
      },
      Ketu: {
        1: 'Spiritual inclination, renunciation tendency, quiet nature, moksha interest.',
        2: 'Wealth loss possibility, family separation, mother relationship difficult.',
        3: 'Siblings separation, communication difficulties, no support from siblings.',
        4: 'Property loss, mother separation, accidents with vehicles, late education.',
        5: 'No children or difficult children, spiritual creativity, detachment.',
        6: 'Chronic disease or unexpected healing, enemy defeat through spirituality.',
        7: 'Spouse loss tendency, late marriage, partnership dissolution, widow-maker.',
        8: 'Sudden death/liberation tendency, occult knowledge, transformation.',
        9: 'Spiritual enlightenment interest, pilgrimage success, moksha pathway.',
        10: 'Career changes frequently, occult/spiritual career possible, retirement early.',
        11: 'Gains through spirituality/detachment, limited but loyal friends.',
        12: 'Monastic life, foreign spirituality, spiritual losses/gains abroad.'
      }
    };
  },
  
  // ===== HELPER FUNCTIONS =====
  
  /**
   * Get planet in house rule
   */
  getPlanetInHouseRule: function(planetName, house) {
    const rules = this.getPlanetaryResultsByHouse();
    return rules[planetName]?.[house] || null;
  },
  
  /**
   * Get planet in sign modifier
   */
  getPlanetInSignRule: function(planetName, sign) {
    const signModifiers = {
      'Sun': { 'Leo': 'Strength doubles in Leo', 'Libra': 'Weakened in Libra' },
      'Moon': { 'Cancer': 'Exalted in Cancer - very strong', 'Scorpio': 'Debilitated in Scorpio - weak' },
      'Mars': { 'Aries': 'Own sign - strong action', 'Cancer': 'Debilitated - weak courage' },
      'Mercury': { 'Virgo': 'Own sign - intelligence peak', 'Pisces': 'Debilitated - confusion' },
      'Jupiter': { 'Sagittarius': 'Own sign - wisdom peak', 'Gemini': 'Debilitated - wisdom scattered' },
      'Venus': { 'Libra': 'Own sign - relationships excellent', 'Virgo': 'Debilitated - love blocked' },
      'Saturn': { 'Capricorn': 'Own sign - discipline strong', 'Aries': 'Debilitated - weak discipline' }
    };
    return signModifiers[planetName]?.[sign] || '';
  },
  
  /**
   * Get aspect modifier
   */
  getAspectModifier: function(aspectingPlanet, targetPlanet, type) {
    if (type === 'Favorable') {
      return `${aspectingPlanet}'s favorable aspect strengthens ${targetPlanet}'s significations`;
    } else if (type === 'Unfavorable') {
      return `${aspectingPlanet}'s unfavorable aspect weakens ${targetPlanet}'s significations`;
    }
    return '';
  },
  
  /**
   * Get Phaladeepika meaning for yoga
   */
  getPhaladeepikaMeaning: function(yogaName) {
    const meanings = {
      'Raj Yoga': 'Kendra/Trikona lords conjunction - ultimate power yoga',
      'Gajakesari': 'Jupiter in Kendra from Moon - wisdom with lion courage',
      'Dhana Yoga': '2nd/11th lords exchanging or connecting - wealth generation',
      'Kemadruma': 'No planets in Kendra from Moon - isolation and loss',
      'Shakata': 'Jupiter in 6/8/12 from Moon - obstacles and instability'
    };
    return meanings[yogaName] || yogaName + ' - See complete text';
  },
  
  /**
   * Get dignity interpretation
   */
  getDignityInterpretation: function(status) {
    const interpretations = {
      'Own': 'Excellent dignity - full power',
      'Exalt.': 'Very good dignity - enhanced power',
      'Mool': 'Good dignity - moolatrikona power',
      'Frnd': 'Friendly sign - moderate support',
      'Neutral': 'Neutral position - standard results',
      'Enemy': 'Enemy sign - reduced effectiveness',
      'Deb.': 'Debilitated - weak and challenged'
    };
    return interpretations[status] || 'Check dignity carefully';
  },
  
  /**
   * Get yoga-specific rules
   */
  getYogaSpecificRules: function(yogaName) {
    return `Check if the yoga is fully formed. Check if planets are retrograde. Check divisional charts for confirmation.`;
  },
  
  /**
   * Get yoga cancellation factors
   */
  getYogaCancellationFactors: function(yogaName) {
    return `Yoga can be cancelled by opposite indicators. Check Kriyaman Yoga. Check current dasha compatibility.`;
  },
  
  /**
   * Get yoga supporting factors
   */
  getYogaSupportingFactors: function(yogaName) {
    return `Supporting yogas amplify the effect. Strong dasha lord increases manifestation.`;
  },
  
  /**
   * Get yoga applications
   */
  getYogaApplications: function(yogaName) {
    return ['Career advancement', 'Financial growth', 'Relationship matters', 'Health improvement'];
  },
  
  /**
   * Get gemstones for deities
   */
  getGemstonesForDeities: function(deities) {
    const gemMapping = {
      'Sun': 'Ruby', 'Moon': 'Pearl', 'Mars': 'Coral',
      'Mercury': 'Emerald', 'Jupiter': 'Yellow Sapphire',
      'Venus': 'Diamond/White Sapphire', 'Saturn': 'Blue Sapphire',
      'Shiva': 'Blue Sapphire', 'Vishnu': 'Emerald', 'Lakshmi': 'Diamond'
    };
    return deities.map(d => gemMapping[d] || d);
  },
  
  /**
   * Get yoga activation period (which dasha)
   */
  getYogaActivationPeriod: function(yogaName) {
    return 'Yoga activates during Mahadasha/Antardasha of yoga lord or involved planets';
  },
  
  /**
   * Get yoga expected outcomes
   */
  getYogaOutcomes: function(yogaName) {
    return ['Success in endeavors', 'Wealth and prosperity', 'Recognition and respect', 'Good health', 'Family happiness'];
  },
  
  /**
   * Recommend gemstone
   */
  recommendGemstone: function(planetName, status) {
    const gemstones = {
      'Sun': 'Ruby', 'Moon': 'Pearl', 'Mars': 'Coral',
      'Mercury': 'Emerald', 'Jupiter': 'Yellow Sapphire',
      'Venus': 'Diamond', 'Saturn': 'Blue Sapphire'
    };
    if (['Deb.', 'Enemy'].includes(status)) return `4-5 carat ${gemstones[planetName] || 'recommended stone'}`;
    return `Consider ${gemstones[planetName] || 'auspicious stone'} if needed`;
  },
  
  /**
   * Recommend mantra
   */
  recommendMantra: function(planetName) {
    const mantras = {
      'Sun': 'Om Suryaya Namaha (108x daily)',
      'Moon': 'Om Chandramase Namaha (108x Mon-Wed)',
      'Mars': 'Om Angarakaya Namaha (108x Tuesdays)',
      'Mercury': 'Om Budhaya Namaha (108x Wednesdays)',
      'Jupiter': 'Om Brihaspataye Namaha (108x Thursdays)',
      'Venus': 'Om Shukraya Namaha (108x Fridays)',
      'Saturn': 'Om Shanaischaraya Namaha (108x Saturdays)'
    };
    return mantras[planetName] || 'Planetary mantra 108x daily';
  },
  
  /**
   * Get planetary day
   */
  getPlanetaryDay: function(planetName) {
    const days = {
      'Sun': 'Sunday', 'Moon': 'Monday', 'Mars': 'Tuesday',
      'Mercury': 'Wednesday', 'Jupiter': 'Thursday',
      'Venus': 'Friday', 'Saturn': 'Saturday'
    };
    return days[planetName] || 'Specific planetary day';
  },
  
  /**
   * Generate overall interpretation
   */
  generateOverallInterpretation: function(birthChart, strengths, challenges) {
    let text = 'Based on Phaladeepika analysis: ';
    if (strengths.length > 0) {
      text += `Strengths include ${strengths.slice(0, 2).join(', ')}. `;
    }
    if (challenges.length > 0) {
      text += `Challenges include ${challenges.slice(0, 2).join(', ')}. `;
    }
    text += 'Use gemstones, mantras, and remedies to strengthen beneficial planets.';
    return text;
  },
  
  /**
   * Generate recommendations
   */
  generateRecommendations: function(birthChart) {
    return [
      'Perform weekly appropriate planetary pierchas',
      'Chant mantras of weak planets daily during their hour',
      'Wear recommended gemstones after consultation',
      'Practice meditation on planetary deities',
      'Perform charity during Antardasha of each planet'
    ];
  }
};
