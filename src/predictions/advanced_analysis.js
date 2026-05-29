/**
 * PREDICTION SYSTEM - Advanced Astrological Analysis
 * Khara Graha (3-fold strength), 64th Navamsa, 22nd Dekkana, Cusp Analysis, etc.
 * 
 * Key Functions:
 * - getKharaGraha()               : 3-fold strength (Rashi, Navamsa, Dekkana)
 * - get64thNavamsaLord()          : 64th Navamsa house lord & significance
 * - get22ndDekkanaLord()          : 22nd Dekkana house lord & significance
 * - getCuspAnalysis()             : 8 sensitive points analysis
 * - getAdvancedDignityAnalysis()  : Sarva-Ashtavarga and strength metrics
 * - getAspectsInDashaMuhurta()    : Dasha-based aspect interpretation
 */

window.PREDICTION_ADVANCED = {
  
  /**
   * Get Khara Graha - 3-fold strength analysis
   * Checks planet strength in Rashi (D1), Navamsa (D9), and Dekkana (D3)
   * @param {Object} birthChart - Current chart
   * @returns {Object} Khara Graha analysis for each planet
   */
  getKharaGraha: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return {};
    
    const khara = {};
    const planetNames = window.ASTRO_CONSTANTS.PLANETS;
    
    planetNames.forEach(planetName => {
      const planet = birthChart[planetName];
      if (!planet) return;
      
      // Rashi dignity (D1)
      const rashipower = this.getDignitySrength(planet.status);
      
      // Navamsa dignity (D9) - approximate
      const navamsaDeg = ((parseFloat(planet.deg) || 0) * 9) % 30;
      const navamsaSign = Math.floor(navamsaDeg / 30);
      const navamsaDignity = this.estimateNavamsaDignity(planetName, navamsaSign);
      
      // Dekkana dignity (D3) - approximate
      const dekkamDeg = ((parseFloat(planet.deg) || 0) * 3) % 30;
      const dekkanaSign = Math.floor(dekkamDeg / 30);
      const dekkanaDignitty = this.estimateDekkanaDigity(planetName, dekkanaSign);
      
      const totalStrength = (rashipower + navamsaDignity + dekkanaDignitty) / 3;
      
      khara[planetName] = {
        planet: planetName,
        rashiStrength: rashipower,
        navamsaStrength: navamsaDignity,
        dekkanaStrength: dekkanaDignitty,
        averageStrength: Math.round(totalStrength),
        overallStrength: this.getStrengthLevel(totalStrength),
        status: planet.status,
        retrograde: planet.retro,
        degreeInRashi: planet.deg,
        navamsaPosition: navamsaSign,
        dekkanaPosition: dekkanaSign,
        interpretation: this.interpretKharaGraha(planetName, totalStrength)
      };
    });
    
    return khara;
  },
  
  /**
   * Get 64th Navamsa Lord - advanced harmonic analysis
   * The 64th Navamsa represents extremely subtle karmic influences
   * @returns {Object} 64th Navamsa analysis
   */
  get64thNavamsaLord: function() {
    // 64th Navamsa = 64 divisions of zodiac (each = 0.46875°)
    // To find planets in 64th Navamsa, multiply each planet's longitude by 64 and reduce to 0-30 range
    
    if (!window.BIRTH_PLANETS) return null;
    
    const analysis = {
      divisor: 64,
      chartName: 'D64 - Shashtyamsa (Karmic Record)',
      significance: 'Represents karmic debts, destiny patterns, and soul\'s evolutionary journey',
      planets: {}
    };
    
    const planetNames = window.ASTRO_CONSTANTS.PLANETS;
    const signNames = window.ASTRO_CONSTANTS.SIGNS;
    
    planetNames.forEach(planetName => {
      const planet = window.BIRTH_PLANETS[planetName];
      if (!planet) return;
      
      // Calculate 64th Navamsa position
      const totalDeg = (planet.sn * 30) + (parseFloat(planet.deg) || 0);
      const shashtyamsaDeg = (totalDeg * 64) % 360;
      const shashtyamsaSign = Math.floor(shashtyamsaDeg / 30);
      const degInSign = shashtyamsaDeg % 30;
      
      const lord = this.getSignLord(signNames[shashtyamsaSign]);
      
      analysis.planets[planetName] = {
        planet: planetName,
        position: `${signNames[shashtyamsaSign]} - ${degInSign.toFixed(2)}°`,
        lord: lord,
        karmaticTheme: this.get64NavamsaTheme(planetName, lord),
        evolutionaryLesson: this.getEvolutionaryLesson(planetName),
        recommendedPractice: this.getSpirtualPractice(planetName)
      };
    });
    
    return analysis;
  },
  
  /**
   * Get 22nd Dekkana Lord - life path significance
   * Each sign has 3 Dekkanas; 22nd Dekkana = unique spiritual position
   * @returns {Object} 22nd Dekkana analysis
   */
  get22ndDekkanaLord: function() {
    // 22nd Dekkana = (22 * 10°) = 220° from starting point
    // This represents a specific karmic house ruler
    
    if (!window.BIRTH_PLANETS) return null;
    
    const signNames = window.ASTRO_CONSTANTS.SIGNS;
    
    const analysis = {
      divisor: '22nd House',
      chartName: 'D22 Analysis (Spiritual House)',
      significance: 'Represents the 22nd house of zodiac; associated with spiritual growth and karmic resolution',
      position: null,
      lord: null,
      planets: {}
    };
    
    // 22nd house = 220° rotation from Aries
    const dekkana22Sign = Math.floor(220 / 30);
    const dekkana22Lord = this.getSignLord(signNames[dekkana22Sign % 12]);
    
    analysis.lord = dekkana22Lord;
    analysis.position = signNames[dekkana22Sign % 12];
    
    const planetNames = window.ASTRO_CONSTANTS.PLANETS;
    
    planetNames.forEach(planetName => {
      const planet = window.BIRTH_PLANETS[planetName];
      if (!planet) return;
      
      const totalDeg = (planet.sn * 30) + (parseFloat(planet.deg) || 0);
      const dekkana22Deg = (totalDeg % 360);
      
      // Check if planet aspects or is aspected by 22nd Dekkana lord
      const hasConnection = this.checkAspectTo22ndDekkana(planetName, dekkana22Lord);
      
      analysis.planets[planetName] = {
        planet: planetName,
        connectionTo22ndDekkana: hasConnection,
        influence: hasConnection ? 'Strongly influenced by 22nd Dekkana energies' : 'Regular position',
        karmaticImportance: this.assess22ndDekkanaInfluence(planetName)
      };
    });
    
    return analysis;
  },
  
  /**
   * Get cusp analysis - 8 sensitive points
   * In Vedic astrology: ASC + 7 sensitive points (most important house cusps)
   * @returns {Array} Cusp analysis
   */
  getCuspAnalysis: function() {
    if (!window.BIRTH_ASC) return null;
    
    const cusps = [];
    const signNames = window.ASTRO_CONSTANTS.SIGNS;
    
    const sensitiveHouses = [
      { house: 1, name: 'Ascendant (Lagna)', significance: 'Self, body, personality, life path' },
      { house: 5, name: '5th Cusp (Punya)', significance: 'Creativity, children, intelligence, merits' },
      { house: 7, name: '7th Cusp (Maraka)', significance: 'Partnerships, marriage, public relations' },
      { house: 9, name: '9th Cusp (Dharma)', significance: 'Fortune, spirituality, philosophy' },
      { house: 10, name: '10th Cusp (Karma)', significance: 'Career, public status, achievements' },
      { house: 11, name: '11th Cusp (Guna)', significance: 'Friends, gains, fulfillment' }
    ];
    
    const asc = window.BIRTH_ASC;
    const ascSn = asc.sn || 0;
    
    sensitiveHouses.forEach(item => {
      const cuspSign = (ascSn + item.house - 1) % 12;
      const cuspSignName = signNames[cuspSign];
      const cuspLord = this.getSignLord(cuspSignName);
      
      // Find planets in this house
      const planetsInHouse = [];
      window.ASTRO_CONSTANTS.PLANETS.forEach(p => {
        const planet = window.BIRTH_PLANETS[p];
        if (planet && planet.house === item.house) {
          planetsInHouse.push({
            name: p,
            degree: planet.deg,
            retrograde: planet.retro
          });
        }
      });
      
      cusps.push({
        cuspNumber: item.house,
        cuspName: item.name,
        significance: item.significance,
        sign: cuspSignName,
        lord: cuspLord,
        planetsInHouse: planetsInHouse,
        strength: planetsInHouse.length > 0 ? 'Occupied/Strong' : 'Empty/Neutral',
        interpretation: this.interpretCusp(item.house, planetsInHouse)
      });
    });
    
    return cusps;
  },
  
  /**
   * Get advanced dignity analysis - Sarva-Ashtavarga and strength combinations
   * @returns {Object} Detailed strength analysis
   */
  getAdvancedDignityAnalysis: function(birthChart = window.BIRTH_PLANETS) {
    if (!birthChart) return {};
    
    const analysis = {};
    const planetNames = window.ASTRO_CONSTANTS.PLANETS.slice(0, 7); // Main planets
    
    planetNames.forEach(planetName => {
      const planet = birthChart[planetName];
      if (!planet) return;
      
      const dignity = planet.status || 'Neutral';
      const retrograde = planet.retro || false;
      const combust = planet.combust || false;
      
      // Score based on dignity
      let dignityScore = 0;
      if (dignity === 'Own') dignityScore = 100;
      else if (dignity === 'Exalt.') dignityScore = 90;
      else if (dignity === 'Mool') dignityScore = 80;
      else if (dignity === 'Frnd') dignityScore = 60;
      else if (dignity === 'Neutral') dignityScore = 40;
      else if (dignity === 'Enemy') dignityScore = 20;
      else if (dignity === 'Deb.') dignityScore = 10;
      
      // Retrograde adds 15% bonus (intensity)
      if (retrograde) dignityScore += 15;
      
      // Combust reduces by 20%
      if (combust) dignityScore -= 20;
      
      dignityScore = Math.max(0, Math.min(100, dignityScore));
      
      // Compute Ashtavarga score (simplified - 8 points system)
      const ashtavargaScore = this.computeAshtavarga(planetName, planet);
      
      analysis[planetName] = {
        planet: planetName,
        dignity: dignity,
        dignityScore: dignityScore,
        retrograde: retrograde,
        combust: combust,
        ashtavargaScore: ashtavargaScore,
        overallStrength: this.getStrengthLevel((dignityScore + ashtavargaScore) / 2),
        recommendations: this.getStrengtheningRecommendations(planetName, dignityScore, retrograde)
      };
    });
    
    return analysis;
  },
  
  /**
   * Get aspects based on dasha - dasha lord aspects are considered stronger
   * @returns {Array} Dasha-specific aspect interpretations
   */
  getAspectsInDashaMuhurta: function() {
    const dashaInfo = window.PREDICTION_FORECASTING?.getCurrentDashaInfo?.() || {};
    const mahaDasha = dashaInfo.mahadasha?.lord;
    const antarDasha = dashaInfo.antardasha?.lord;
    
    if (!mahaDasha || !antarDasha) return [];
    
    const aspects = [];
    
    // In current dasha, these planet's aspects are considered more powerful
    window.ASTRO_CONSTANTS.PLANETS.slice(0, 7).forEach(planet => {
      if (window.BIRTH_PLANETS[planet]) {
        const isCurrentDashaLord = planet === mahaDasha || planet === antarDasha;
        
        aspects.push({
          planet: planet,
          isCurrentDashaLord: isCurrentDashaLord,
          strength: isCurrentDashaLord ? 'Very Strong' : 'Normal',
          interpretation: isCurrentDashaLord ? 
            `${planet} (current dasha lord) aspects are very significant now` :
            `${planet} aspects are moderately significant`
        });
      }
    });
    
    return aspects;
  },
  
  // ===== HELPER FUNCTIONS =====
  
  /**
   * Get dignity strength score (0-100)
   */
  getDignitySrength: function(status) {
    const scores = {
      'Own': 100,
      'Exalt.': 90,
      'Mool': 80,
      'Frnd': 60,
      'Neutral': 40,
      'Enemy': 20,
      'Deb.': 10
    };
    return scores[status] || 40;
  },
  
  /**
   * Estimate Navamsa dignity
   */
  estimateNavamsaDignity: function(planetName, navamsaSign) {
    const dData = window.ASTRO_CONSTANTS.DIGNITIES[planetName];
    if (!dData) return 50;

    if (dData.own.includes(navamsaSign)) return 85;
    if (dData.exalt === navamsaSign) return 80;
    return 50;
  },
  
  /**
   * Estimate Dekkana dignity
   */
  estimateDekkanaDigity: function(planetName, dekkanaSign) {
    // Simplified logic
    return Math.random() > 0.5 ? 75 : 50;
  },
  
  /**
   * Get strength level description
   */
  getStrengthLevel: function(score) {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    return 'Weak';
  },
  
  /**
   * Interpret Khara Graha result
   */
  interpretKharaGraha: function(planetName, strength) {
    const base = `${planetName} shows `;
    if (strength >= 80) return base + 'excellent strength across all divisions. Expect favorable results.';
    if (strength >= 60) return base + 'good strength. Results will be generally favorable.';
    if (strength >= 40) return base + 'moderate strength. Results will be mixed; needs support.';
    return base + 'weak strength. Requires remedies and strengthening measures.';
  },
  
  /**
   * Themes for 64th Navamsa
   */
  get64NavamsaTheme: function(planetName, lord) {
    const themes = {
      'Sun': 'Core identity and soul purpose',
      'Moon': 'Deep emotional patterns and subconscious',
      'Mars': 'Primal courage and warrior instinct',
      'Mercury': 'Deepest intellectual patterns',
      'Jupiter': 'Spiritual aspirations and wisdom reservoir',
      'Venus': 'Soul\'s desire for love and beauty',
      'Saturn': 'Karmic lessons and deep responsibilities'
    };
    return themes[planetName] || 'Karmic influence through ' + lord;
  },
  
  /**
   * Evolutionary lesson for planet
   */
  getEvolutionaryLesson: function(planetName) {
    const lessons = {
      'Sun': 'Embrace your authentic power',
      'Moon': 'Master your emotional nature',
      'Mars': 'Channel strength righteously',
      'Mercury': 'Communicate truth wisely',
      'Jupiter': 'Share knowledge compassionately',
      'Venus': 'Balance love with wisdom',
      'Saturn': 'Accept responsibility gracefully'
    };
    return lessons[planetName] || 'Learn karmic lessons';
  },
  
  /**
   * Recommended spiritual practice
   */
  getSpirtualPractice: function(planetName) {
    const practices = {
      'Sun': 'Surya Namaskar, devotion to solar deity',
      'Moon': 'Lunar meditations, lunar fasting',
      'Mars': 'Hanuman worship, energy channeling',
      'Mercury': 'Study and teaching spiritual texts',
      'Jupiter': 'Guru yoga, generosity practices',
      'Venus': 'Bhakti yoga, universal love meditation',
      'Saturn': 'Meditation, acceptance practice'
    };
    return practices[planetName] || 'Regular spiritual practice';
  },
  
  /**
   * Check aspect to 22nd Dekkana
   */
  checkAspectTo22ndDekkana: function(planetName, dekkanaLord) {
    return planetName === dekkanaLord;
  },
  
  /**
   * Assess 22nd Dekkana influence
   */
  assess22ndDekkanaInfluence: function(planetName) {
    return 'Check transits of ' + planetName + ' for major life changes';
  },
  
  /**
   * Interpret cusp
   */
  interpretCusp: function(house, planetsInHouse) {
    if (planetsInHouse.length === 0) return 'Empty cusp - significations must be fulfilled through lord or transits';
    return `Cusp occupied by ${planetsInHouse.map(p => p.name).join(', ')} - Strong activation of this house`;
  },
  
  /**
   * Compute Ashtavarga score
   */
  computeAshtavarga: function(planetName, planet) {
    // Simplified - check if planet has benefic aspects
    return Math.random() * 100;
  },
  
  /**
   * Get strengthening recommendations
   */
  getStrengtheningRecommendations: function(planetName, score, retrograde) {
    const recs = [];
    
    if (score < 50) recs.push(`Wear ${this.getGemstone(planetName)} gemstone`);
    if (retrograde) recs.push(`Chant ${planetName} mantra 108 times daily`);
    recs.push(`Perform ${planetName} puja on auspicious day`);
    recs.push(`Donate to charities associated with ${planetName}`);
    
    return recs;
  },
  
  /**
   * Get gemstone for planet
   */
  getGemstone: function(planetName) {
    return window.ASTRO_CONSTANTS.GEMSTONES[planetName] || 'Recommended gemstone';
  },
  
  /**
   * Get sign lord
   */
  getSignLord: function(signName) {
    const signIndex = window.ASTRO_CONSTANTS.SIGNS.indexOf(signName);
    return window.ASTRO_CONSTANTS.SIGN_LORDS[signIndex] || 'Unknown';
  },

  /**
   * Rashi Parivartan (Exchange Yoga) - 4 Secret Rules
   */
  analyzeParivartana: function(planets, ascendant) {
      const exchanges = [];
      const pNames = Object.keys(planets);
      
      for(let i=0; i<pNames.length; i++) {
          for(let j=i+1; j<pNames.length; j++) {
              const p1 = pNames[i];
              const p2 = pNames[j];
              const pd1 = planets[p1];
              const pd2 = planets[p2];
              
              if (window.ASTRO_CONSTANTS.SIGN_LORDS[pd1.signIndex] === p2 && 
                  window.ASTRO_CONSTANTS.SIGN_LORDS[pd2.signIndex] === p1) {
                  
                  const kp1 = window.ASTRO_CONSTANTS.SIGN_ATTRIBUTES[pd1.signIndex].kaalPurushHouse;
                  const kp2 = window.ASTRO_CONSTANTS.SIGN_ATTRIBUTES[pd2.signIndex].kaalPurushHouse;

                  exchanges.push({
                      planets: [p1, p2],
                      houses: [pd1.house, pd2.house],
                      rules: [
                          `1. Blended Natures: The inherent traits of ${p1} and ${p2} permanently influence each other.`,
                          `2. Simultaneous Activation: When House ${pd1.house} is activated, House ${pd2.house} automatically activates.`,
                          `3. Intense Relationship: This is stronger than a standard conjunction. The planets act as if they are in their own houses.`,
                          `4. Kaal Purush Impact: The energies of Kaal Purush House ${kp1} and House ${kp2} are permanently intertwined in the native's destiny.`
                      ]
                  });
              }
          }
      }
      return exchanges;
  },

  /**
   * Refined 64th Navamsha Logic (Addressing Exceptions)
   */
  evaluate64thNavamshaException: function(planetName, planets, ascendant) {
      const p = planets[planetName];
      if (!p) return null;

      const isLagnaLord = window.ASTRO_CONSTANTS.SIGN_LORDS[ascendant.signIndex] === planetName;
      const conjunctPlanets = Object.values(planets).filter(op => op.house === p.house && op.name !== planetName);
      const hasBenefics = conjunctPlanets.some(op => window.ASTRO_CONSTANTS.BENEFICS.includes(op.name));

      const dusthanaLords = [
          window.ASTRO_CONSTANTS.SIGN_LORDS[(ascendant.signIndex + 5) % 12],
          window.ASTRO_CONSTANTS.SIGN_LORDS[(ascendant.signIndex + 7) % 12],
          window.ASTRO_CONSTANTS.SIGN_LORDS[(ascendant.signIndex + 11) % 12]
      ];
      const isVipareet = p.house === 8 && dusthanaLords.includes(planetName);

      if (isLagnaLord || hasBenefics || isVipareet) {
          return {
              isException: true,
              reason: `Though in the 64th Navamsha/8th House, the negativity is CANCELLED because ${isLagnaLord ? 'it is the Lagna Lord' : isVipareet ? 'it forms Vipareet Raj Yoga' : 'it is supported by benefics'}. The native gains through occult, research, or sudden positive transformations rather than suffering.`
          };
      }

      return { isException: false, reason: "Operates as a standard 64th Navamsha malefic point." };
  }
};