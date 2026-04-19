/**
 * PREDICTION SYSTEM - Multi-Chart Analysis
 * Provides comprehensive planet/house/aspect/nakshatra analysis across D1-D60 charts
 * 
 * Key Functions:
 * - getPlanetsInHouses()      : Planets in each house with full details
 * - getConjunctions()         : All planet pairs within conjunction orb
 * - getAspects()              : Vedic aspects (Jupiter 7th/10th, Saturn 3rd/10th, Mars 4th/8th)
 * - getPlanetaryDegrees()     : Exact degrees + minutes for all planets
 * - getNakshatraInfo()        : Nakshatra + Pada + Lord for each planet & ASC
 * - getChartAnalysisByDivisor(): Complete analysis for specific varga (D1-D60)
 * - getHouseAnalysis()        : House lords, cusps, planets, and significations
 */

window.PREDICTION_ANALYSIS = {
  
  /**
   * Get comprehensive planets-in-houses map with full details
   * @param {Object} birthChart - Current chart object (use global BIRTH_PLANETS, BIRTH_ASC)
   * @returns {Array} Array of planets with {name, sign, house, degree, minute, nakshatra, pada, lord, status, retrograde, speed, conjunctions, aspects}
   */
  getPlanetsInHouses: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return [];
    
    const planetData = [];
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    planetNames.forEach(name => {
      const p = birthChart[name];
      if (!p) return;
      
      const signNum = p.sn || 0;
      const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const signName = signNames[signNum % 12];
      
      const degree = parseInt(p.deg) || 0;
      const minute = Math.round(((parseFloat(p.deg) || 0) - degree) * 60);
      
      planetData.push({
        name: name,
        sign: signName,
        signNum: signNum,
        house: p.house || 1,
        degree: degree,
        minute: minute,
        exactDegree: p.deg || 0,
        nakshatra: p.nak || 'Unknown',
        pada: p.pada || 1,
        lord: getNakshatraLord(p.nak),
        status: p.status || 'Neutral',
        retrograde: p.retro || false,
        combust: p.combust || false,
        speed: p.speed || 0,
        nakshatraLord: getNakshatraLord(p.nak)
      });
    });
    
    return planetData.sort((a, b) => (a.house - b.house) || (planetNames.indexOf(a.name) - planetNames.indexOf(b.name)));
  },
  
  /**
   * Get all conjunctions (planets within 8° orb in same sign)
   * @param {Object} birthChart 
   * @returns {Array} Array of {planet1, planet2, orb, strength}
   */
  getConjunctions: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return [];
    
    const conjunctions = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const ORB = 8; // Standard orb for conjunction
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = birthChart[planets[i]];
        const p2 = birthChart[planets[j]];
        
        if (!p1 || !p2) continue;
        
        // Check if same sign
        if (p1.sn === p2.sn) {
          const orb = Math.abs((p1.deg || 0) - (p2.deg || 0));
          if (orb <= ORB || orb >= (30 - ORB)) {
            const actualOrb = Math.min(orb, 30 - orb);
            
            conjunctions.push({
              planet1: planets[i],
              planet2: planets[j],
              sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][p1.sn],
              orb: actualOrb,
              strength: this.scoreConjunction(planets[i], planets[j], actualOrb)
            });
          }
        }
      }
    }
    
    return conjunctions.sort((a, b) => a.orb - b.orb);
  },
  
  /**
   * Score conjunction strength (0-100)
   */
  scoreConjunction: function(p1, p2, orb) {
    let score = 80 - (orb * 10); // Base on orb (exact = 80, 8° = 0)
    
    // Benefic pairs get bonus
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    if (benefics.includes(p1) && benefics.includes(p2)) score += 20;
    
    // Malefic pairs get penalty
    const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
    if (malefics.includes(p1) && malefics.includes(p2)) score -= 15;
    
    return Math.min(100, Math.max(0, score));
  },
  
  /**
   * Get Vedic aspects (Jupiter 7th/10th, Saturn 3rd/10th, Mars 4th/8th, others full/4th/8th)
   * @returns {Array} Array of {planet, aspectingPlanet, type, house, strength}
   */
  getAspects: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return [];
    
    const aspects = [];
    
    // Vedic aspect rules
    const vedicAspects = {
      'Jupiter': [7, 10],  // 7th and 10th from planet position
      'Saturn': [3, 10],   // 3rd and 10th
      'Mars': [4, 8],      // 4th and 8th
      'Mercury': [1, 7],   // 1st (itself) and 7th
      'Venus': [1, 7],
      'Sun': [1, 7],
      'Moon': [1, 7],
      'Rahu': [1, 7],
      'Ketu': [1, 7]
    };
    
    Object.keys(birthChart).forEach(planetName => {
      const planet = birthChart[planetName];
      if (!planet) return;
      
      const aspectRules = vedicAspects[planetName] || [1, 7];
      
      // Check which houses this planet aspects
      aspectRules.forEach(houseOffset => {
        const aspectedHouse = ((planet.house - 1 + houseOffset - 1) % 12) + 1;
        
        // Find planets in the aspected house
        Object.keys(birthChart).forEach(targetName => {
          if (targetName === planetName) return;
          const target = birthChart[targetName];
          if (!target || target.house !== aspectedHouse) return;
          
          // Determine if favorable or unfavorable
          const type = this.scoreAspectType(planetName, targetName);
          
          aspects.push({
            planet: planetName,
            aspectingPlanet: targetName,
            aspectedHouse: aspectedHouse,
            type: type,
            strength: type === 'Favorable' ? 80 : 30
          });
        });
      });
    });
    
    return aspects;
  },
  
  /**
   * Score aspect as favorable or unfavorable
   */
  scoreAspectType: function(aspectingPlanet, targetPlanet) {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
    
    const aspectingIsBenefic = benefics.includes(aspectingPlanet);
    const targetIsBenefic = benefics.includes(targetPlanet);
    
    // Benefic on benefic = favorable
    if (aspectingIsBenefic && targetIsBenefic) return 'Favorable';
    
    // Malefic on malefic = favorable (they cancel)
    if (malefics.includes(aspectingPlanet) && malefics.includes(targetPlanet)) return 'Favorable';
    
    // Benefic on malefic = favorable
    if (aspectingIsBenefic && malefics.includes(targetPlanet)) return 'Favorable';
    
    // Malefic on benefic = unfavorable
    if (malefics.includes(aspectingPlanet) && targetIsBenefic) return 'Unfavorable';
    
    return 'Neutral';
  },
  
  /**
   * Get exact degrees, minutes, seconds for all planets
   * @returns {Array} Array of {name, degree, minute, second}
   */
  getPlanetaryDegrees: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return [];
    
    const degrees = [];
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(name => {
      const p = birthChart[name];
      if (!p) return;
      
      const deg = parseFloat(p.deg) || 0;
      const degree = Math.floor(deg);
      const minute = Math.floor((deg - degree) * 60);
      const second = Math.round(((deg - degree) * 60 - minute) * 60);
      
      degrees.push({
        name: name,
        degree: degree,
        minute: minute,
        second: second,
        totalDegrees: deg,
        formatted: `${degree}°${minute}'${second}"`
      });
    });
    
    return degrees;
  },
  
  /**
   * Get nakshatra info for all planets and ASC
   * @returns {Object} {planets: {...}, asc: {...}}
   */
  getNakshatraInfo: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return null;
    
    const planetNaks = {};
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(name => {
      const p = birthChart[name];
      if (!p) return;
      
      planetNaks[name] = {
        name: name,
        nakshatra: p.nak || 'Unknown',
        pada: p.pada || 1,
        lord: getNakshatraLord(p.nak),
        nature: getNakshatraNature(p.nak || '')
      };
    });
    
    // ASC nakshatra
    const asc = window.BIRTH_ASC || {};
    const ascNak = {
      nakshatra: asc.nak || 'Unknown',
      pada: asc.pada || 1,
      lord: getNakshatraLord(asc.nak),
      nature: getNakshatraNature(asc.nak || '')
    };
    
    return {
      planets: planetNaks,
      asc: ascNak
    };
  },
  
  /**
   * Get complete chart analysis for a specific divisor (D1-D60)
   * Requires divisional chart data to be pre-calculated
   * @param {Number} divisor - Chart divisor (1=D1, 9=D9, 10=D10, etc.)
   * @returns {Object} Complete analysis for that chart
   */
  getChartAnalysisByDivisor: function(divisor = 1) {
    // Note: This function assumes divisional chart data is already calculated
    // In index.html, use computeAllVargas() and load the specific varga
    
    return {
      divisor: divisor,
      chartName: this.getDivisionalChartName(divisor),
      planets: this.getPlanetsInHouses(window.BIRTH_PLANETS),
      conjunctions: this.getConjunctions(window.BIRTH_PLANETS),
      aspects: this.getAspects(window.BIRTH_PLANETS),
      degrees: this.getPlanetaryDegrees(window.BIRTH_PLANETS),
      nakshatras: this.getNakshatraInfo(window.BIRTH_PLANETS),
      interpretation: this.getChartInterpretation(divisor)
    };
  },
  
  /**
   * Get house analysis with lords, cusps, and planets
   * @returns {Array} House information
   */
  getHouseAnalysis: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return [];
    
    const houses = [];
    const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const asc = window.BIRTH_ASC || {};
    const ascSn = asc.sn || 0;
    
    for (let h = 1; h <= 12; h++) {
      const houseLordSn = (ascSn + h - 1) % 12;
      const houseSign = signNames[houseLordSn];
      
      // Planets in this house
      const planetsInHouse = [];
      ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(name => {
        const p = birthChart[name];
        if (p && p.house === h) {
          planetsInHouse.push({
            name: name,
            degree: p.deg,
            status: p.status,
            retrograde: p.retro
          });
        }
      });
      
      houses.push({
        houseNumber: h,
        sign: houseSign,
        lord: getSignLord(houseSign),
        planets: planetsInHouse,
        significance: this.getHouseSignificance(h),
        quality: planetsInHouse.length > 0 ? 'Occupied' : 'Empty'
      });
    }
    
    return houses;
  },
  
  /**
   * Get divisional chart name from divisor
   */
  getDivisionalChartName: function(divisor) {
    const chartNames = {
      1: 'D1 - Rashi (Birth Chart)',
      2: 'D2 - Hora (Wealth)',
      3: 'D3 - Drekkana (Siblings)',
      4: 'D4 - Chaturthamsa (Property)',
      7: 'D7 - Saptamsa (Children)',
      9: 'D9 - Navamsa (Spouse)',
      10: 'D10 - Dasamsa (Career)',
      12: 'D12 - Dwadasamsa (Parents)',
      16: 'D16 - Shodanamsa (Happiness)',
      20: 'D20 - Vimshamsa (Spiritual Practice)',
      24: 'D24 - Chaturvimshamsa (Learning)',
      27: 'D27 - Saptavimshamsa (Strength)',
      30: 'D30 - Trimshamsa (Suffering)',
      40: 'D40 - Khavedamsa (Liberation)',
      45: 'D45 - Akshavedamsa (Spiritual)',
      60: 'D60 - Shashtyamsa (Karmic)'
    };
    return chartNames[divisor] || `D${divisor}`;
  },
  
  /**
   * Get house significance meanings
   */
  getHouseSignificance: function(houseNum) {
    const significance = {
      1: 'Self, personality, appearance, health',
      2: 'Wealth, family, speech, food',
      3: 'Siblings, courage, communication, short travel',
      4: 'Mother, property, vehicles, home, emotions',
      5: 'Children, education, creativity, romance',
      6: 'Health, enemies, service, debts, diseases',
      7: 'Spouse, partnerships, public image, marriage',
      8: 'Longevity, inheritance, occult, transformation',
      9: 'Luck, father, spirituality, long travel, dharma',
      10: 'Career, status, public life, achievements',
      11: 'Gains, friends, networks, income, hopes',
      12: 'Losses, expenses, foreign travel, spirituality, liberation'
    };
    return significance[houseNum] || '';
  },
  
  /**
   * Get interpretation of chart by divisor
   */
  getChartInterpretation: function(divisor) {
    const interpretations = {
      1: 'Birth chart - overall life pattern and personality',
      2: 'Wealth and material possessions',
      3: 'Siblings and communication abilities',
      4: 'Real estate and landed properties',
      7: 'Children and creative output',
      9: 'Marriage and partnerships',
      10: 'Profession and public recognition',
      12: 'Parental relationships and family matters',
      16: 'Happiness and pleasure in life',
      20: 'Spiritual practices and inner development',
      24: 'Intellectual capacity and learning ability',
      27: 'Physical strength and vitality',
      30: 'Suffering and karmic challenges',
      40: 'Spiritual liberation and ultimate freedom',
      45: 'Spiritual evolution and higher consciousness',
      60: 'Karmic debts and spiritual lessons'
    };
    return interpretations[divisor] || 'Analysis parameter';
  }
};

/**
 * Helper: Get nakshatra lord
 */
function getNakshatraLord(nakName) {
  const lords = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
    'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu',
    'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Aslesha': 'Mercury',
    'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
    'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury',
    'Mula': 'Ketu', 'Purvashadha': 'Venus', 'Uttarashadha': 'Sun',
    'Sravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn',
    'Revati': 'Mercury'
  };
  return lords[nakName] || 'Unknown';
}

/**
 * Helper: Get nakshatra nature
 */
function getNakshatraNature(nakName) {
  const natures = {
    'Ashwini': 'Mobile, quick, energetic',
    'Bharani': 'Stable but controlled',
    'Krittika': 'Sharp, cutting, fierce',
    'Rohini': 'Creative, domestic, fertile',
    'Mrigashira': 'Curious, nervous, restless',
    'Ardra': 'Fierce, extreme, transformative',
    'Punarvasu': 'Return, repetition, positive',
    'Pushya': 'Nourishing, supportive, best',
    'Aslesha': 'Secretive, mysterious, cunning'
  };
  return natures[nakName] || 'See Nakshatra details';
}

/**
 * Helper: Get sign lord (Rashi lord)
 */
function getSignLord(signName) {
  const lords = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
  };
  return lords[signName] || 'Unknown';
}
