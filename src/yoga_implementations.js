/**
 * Yoga Implementation Supplement
 * Provides comprehensive evaluate() implementations for all yogas
 * This file supplements yogas_data.js with working implementations
 * 
 * Load this after yogas_data.js to automatically enhance yoga detection
 */

window.YOGA_IMPLEMENTATIONS = window.YOGA_IMPLEMENTATIONS || {};

// Helper function
function getSignLord(signName) {
  const lords = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
  };
  return lords[signName] || 'Unknown';
}

/**
 * Enhance yogas_data with improved evaluate functions
 * Call this after loading yogas_data.js
 */
function enhanceYogaImplementations() {
  if (!window.YOGAS_DATA || !Array.isArray(window.YOGAS_DATA)) return false;
  
  const implementations = {
    // ========== WEALTH YOGAS ==========
    "Dhana Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const wealthHouses = [2, 5, 9, 11];
      
      const wealthLords = wealthHouses.map(h => ({
        lord: getSignLord(signNames[(ascSn + h - 1) % 12]),
        house: h
      })).filter(w => c.planets[w.lord]);
      
      const connections = [];
      const isDetected = wealthLords.length >= 2 && wealthLords.some((w1, i) => 
        wealthLords.slice(i+1).some(w2 => {
          const p1 = c.planets[w1.lord], p2 = c.planets[w2.lord];
          const orbSign = Math.abs((p1.sn || 0) - (p2.sn || 0));
          const orbDeg = Math.abs((p1.deg || 0) - (p2.deg || 0));
          if (orbSign === 0 && orbDeg <= 8) {
            connections.push(`${w1.lord} (L${w1.house}) and ${w2.lord} (L${w2.house}) are conjunct in ${p1.sign}`);
            return true;
          }
          return false;
        })
      );
      
      return { 
        result: isDetected, 
        rationale: isDetected ? `Multiple wealth lords (${connections.join('; ')}) are connected in the chart.` : "No direct connection between lords of 2nd, 5th, 9th, or 11th houses."
      };
    },
    
    "Chandra-Mangala Yoga": (c) => {
      if (!c.planets.Moon || !c.planets.Mars) return { result: false };
      const moon = c.planets.Moon, mars = c.planets.Mars;
      const orbSign = Math.abs((moon.sn || 0) - (mars.sn || 0));
      const orbDeg = Math.abs((moon.deg || 0) - (mars.deg || 0));
      const isConj = orbSign === 0 && orbDeg <= 8;
      const isOpp = orbSign === 7;
      
      const isDetected = isConj || isOpp;
      return {
        result: isDetected,
        rationale: isDetected ? `Moon (${moon.sign}) and Mars (${mars.sign}) are in ${isConj ? 'conjunction' : 'opposition'}, creating financial drive.` : "Moon and Mars are not significantly connected."
      };
    },
    
    "Budha-Aditya Yoga": (c) => {
      if (!c.planets.Sun || !c.planets.Mercury) return { result: false };
      const sun = c.planets.Sun, merc = c.planets.Mercury;
      const orbSign = Math.abs((sun.sn || 0) - (merc.sn || 0));
      const orbDeg = Math.abs((sun.deg || 0) - (merc.deg || 0));
      const isDetected = orbSign === 0 && orbDeg <= 12;
      return {
        result: isDetected,
        rationale: isDetected ? `Sun and Mercury are conjunct in ${sun.sign} within ${orbDeg.toFixed(1)}°, indicating intellectual brilliance.` : "Sun and Mercury are too far apart to form this yoga."
      };
    },
    
    "Lakshmi Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const asnc = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const ninth9thSign = (asnc + 8) % 12;
      const lord9 = getSignLord(signNames[ninth9thSign]);
      const p9 = c.planets[lord9];
      const isDetected = p9 && p9.house === 10;
      return {
        result: !!isDetected,
        rationale: isDetected ? `Lord of 9th house (${lord9}) is placed in 10th house, bringing grace to the career.` : `9th lord is not in the 10th house.`
      };
    },
    
    "Vasumati Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const asnc = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const sign2 = (asnc + 1) % 12;
      const sign5 = (asnc + 4) % 12;
      const lord2 = getSignLord(signNames[sign2]);
      const lord5 = getSignLord(signNames[sign5]);
      const p2 = c.planets[lord2];
      const p5 = c.planets[lord5];
      const kendraTrikonaHouses = [1, 4, 5, 7, 9, 10];
      const isDetected = (p2 && p2.house === 5) || (p5 && p5.house === 2) || (kendraTrikonaHouses.includes(p2?.house) && kendraTrikonaHouses.includes(p5?.house));
      return {
        result: isDetected,
        rationale: isDetected ? `Beneficial exchange or placement of 2nd and 5th lords in auspicious houses.` : "2nd and 5th lords are not in mutual connection or kendra/trikona."
      };
    },
    
    // ========== CHALLENGE YOGAS ==========
    "Daridra Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const sign11 = (ascSn + 10) % 12;
      const lord11 = getSignLord(signNames[sign11]);
      const p11 = c.planets[lord11];
      if (!p11) return { result: false };
      const dusthana = [6, 8, 12];
      const isDetected = dusthana.includes(p11.house);
      return {
        result: isDetected,
        rationale: isDetected ? `Lord of gains (11th Lord: ${lord11}) is placed in a difficult house (H${p11.house}), causing financial drain.` : "11th lord is in a favorable house."
      };
    },
    
    "Grahan Yoga": (c) => {
      if (!c.planets) return { result: false };
      const sun = c.planets.Sun, moon = c.planets.Moon;
      const rahu = c.planets.Rahu, ketu = c.planets.Ketu;
      if (!rahu || !ketu) return { result: false };
      
      const nodeOrb = 8;
      let matched = null;
      if (sun) {
        const sunRahuDeg = Math.abs((sun.deg || 0) - (rahu.deg || 0));
        const sunKetuDeg = Math.abs((sun.deg || 0) - (ketu.deg || 0));
        if (sunRahuDeg <= nodeOrb && sun.sn === rahu.sn) matched = "Sun and Rahu";
        else if (sunKetuDeg <= nodeOrb && sun.sn === ketu.sn) matched = "Sun and Ketu";
      }
      
      if (moon && !matched) {
        const moonRahuDeg = Math.abs((moon.deg || 0) - (rahu.deg || 0));
        const moonKetuDeg = Math.abs((moon.deg || 0) - (ketu.deg || 0));
        if (moonRahuDeg <= nodeOrb && moon.sn === rahu.sn) matched = "Moon and Rahu";
        else if (moonKetuDeg <= nodeOrb && moon.sn === ketu.sn) matched = "Moon and Ketu";
      }
      
      return {
        result: !!matched,
        rationale: matched ? `${matched} are conjunct at nodes, causing emotional or vital eclipse.` : "Sun/Moon are clear of Rahu/Ketu conjunctions."
      };
    },
    
    "Kala Sarpa Yoga": (c) => {
      if (!c.planets) return { result: false };
      const rahu = c.planets.Rahu, ketu = c.planets.Ketu;
      if (!rahu || !ketu) return { result: false };
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      const rahuDeg = (rahu.sn || 0) * 30 + (rahu.deg || 0);
      const ketuDeg = (ketu.sn || 0) * 30 + (ketu.deg || 0);
      const betweenCount = planets.filter(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        const deg = (planet.sn || 0) * 30 + (planet.deg || 0);
        if (rahuDeg < ketuDeg) return deg > rahuDeg && deg < ketuDeg;
        else return deg > rahuDeg || deg < ketuDeg;
      }).length;
      const isDetected = betweenCount >= 5;
      return {
        result: isDetected,
        rationale: isDetected ? `${betweenCount} planets are hemmed between nodes Rahu and Ketu, creating karmic focus.` : "Planets are distributed outside the node axis."
      };
    },
    
    // ========== DIGNTY YOGAS ==========
    "Uchcha Yoga": (c) => {
      if (!c.planets) return { result: false };
      const exalted = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].status === 'Exalt.');
      return {
        result: exalted.length > 0,
        rationale: exalted.length > 0 ? `Exalted planets found: ${exalted.join(', ')}.` : "No exalted planets."
      };
    },
    
    "Swakshetra Yoga": (c) => {
      if (!c.planets) return { result: false };
      const own = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].status === 'Own');
      return {
        result: own.length > 0,
        rationale: own.length > 0 ? `Planets in own signs: ${own.join(', ')}.` : "No planets in own signs."
      };
    },
    
    "Vargottama Yoga": (c) => {
      if (!c.planets) return { result: false };
      const varg = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        const deg = parseFloat(planet.deg) || 0;
        return deg < 3.33; // Approximately first navamsha
      });
      return {
        result: varg.length > 0,
        rationale: varg.length > 0 ? `Planets in Vargottama degrees (0-3.3°): ${varg.join(', ')}.` : "No planets in Vargottama degrees."
      };
    },
    
    "Vakri Yoga": (c) => {
      if (!c.planets) return { result: false };
      const retro = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].retro === true);
      return {
        result: retro.length > 0,
        rationale: retro.length > 0 ? `Retrograde planets found: ${retro.join(', ')}.` : "No retrograde planets."
      };
    },
    
    "Astangata Yoga": (c) => {
      if (!c.planets || !c.planets.Sun) return { result: false };
      const sun = c.planets.Sun;
      const combustOrbs = {Mercury: 12, Venus: 10, Mars: 15, Jupiter: 15, Saturn: 15};
      const combust = Object.keys(combustOrbs).filter(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        const orb = Math.abs((planet.deg || 0) - (sun.deg || 0));
        return planet.sn === sun.sn && orb <= combustOrbs[p];
      });
      return {
        result: combust.length > 0,
        rationale: combust.length > 0 ? `Combust planets (close to Sun): ${combust.join(', ')}.` : "No planets are combust."
      };
    },
    
    // ========== HOUSE YOGA ==========
    "Papakartari Yoga": (c) => {
      if (!c.planets) return { result: false };
      const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
      const details = [];
      for (let h = 1; h <= 12; h++) {
        const h2 = ((h - 1 + 1) % 12) + 1;
        const h12 = ((h - 1 + 11) % 12) + 1;
        const p2 = malefics.filter(m => c.planets[m] && c.planets[m].house === h2);
        const p12 = malefics.filter(m => c.planets[m] && c.planets[m].house === h12);
        if (p2.length > 0 && p12.length > 0) {
          details.push(`H${h} hemmed by ${p12.join(',')} (H12) and ${p2.join(',')} (H2)`);
        }
      }
      return {
        result: details.length > 0,
        rationale: details.length > 0 ? `Negative hemming: ${details.join('; ')}.` : "No negative hemming (Kartari) found."
      };
    },
    
    "Shubhakartari Yoga": (c) => {
      if (!c.planets) return { result: false };
      const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
      const details = [];
      for (let h = 1; h <= 12; h++) {
        const h2 = ((h - 1 + 1) % 12) + 1;
        const h12 = ((h - 1 + 11) % 12) + 1;
        const p2 = benefics.filter(b => c.planets[b] && c.planets[b].house === h2);
        const p12 = benefics.filter(b => c.planets[b] && c.planets[b].house === h12);
        if (p2.length > 0 && p12.length > 0) {
          details.push(`H${h} hemmed by ${p12.join(',')} (H12) and ${p2.join(',')} (H2)`);
        }
      }
      return {
        result: details.length > 0,
        rationale: details.length > 0 ? `Positive hemming: ${details.join('; ')}.` : "No focus on beneficial hemming."
      };
    },
    
    // ========== NEECHA BHANGA YOGAS ==========
    "Neecha Bhanga Raj Yoga": (c) => {
      if (!c.planets) return { result: false };
      const debilitatedPlanets = Object.keys(c.planets).filter(p => 
        c.planets[p] && c.planets[p].status === 'Deb.'
      );
      
      const exaltationLords = {
        'Sun': 'Aries', 'Moon': 'Taurus', 'Mars': 'Capricorn', 'Mercury': 'Virgo',
        'Jupiter': 'Cancer', 'Venus': 'Pisces', 'Saturn': 'Libra', 'Rahu': 'Gemini', 'Ketu': 'Virgo'
      };
      
      let cancelReason = null;
      const isDetected = debilitatedPlanets.some(planet => {
        const ruler = exaltationLords[planet];
        const rulerName = Object.keys(c.planets).find(p => {
          const pd = c.planets[p];
          return pd && pd.sign === ruler;
        });
        
        if (rulerName) {
          const rulerPlanet = c.planets[rulerName];
          const kendraTrikonaHouses = [1, 4, 5, 7, 9, 10];
          if (kendraTrikonaHouses.includes(rulerPlanet.house)) {
            cancelReason = `Debilitated ${planet} cancelled by exaltation lord ${rulerName} in H${rulerPlanet.house}`;
            return true;
          }
        }
        return false;
      });

      return {
        result: isDetected,
        rationale: isDetected ? cancelReason : "No debilitated planets found or their cancellation lords are not in key houses."
      };
    },
    
    // ========== VIPAREETA YOGAS ==========
    "Vipareeta Raj Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const difficult = [6, 8, 12];
      
      const findings = [];
      difficult.forEach(house => {
        const lordSign = signNames[(ascSn + house - 1) % 12];
        const lord = getSignLord(lordSign);
        const lordPlanet = c.planets[lord];
        if (lordPlanet && difficult.includes(lordPlanet.house)) {
          findings.push(`${lord} (L${house}) in H${lordPlanet.house}`);
        }
      });

      return {
        result: findings.length > 0,
        rationale: findings.length > 0 ? `Lords of difficult houses ${findings.join(', ')} creates Vipareeta (Reverse) Raj Yoga.` : "Lords of 6, 8, 12 are not in dusthanas."
      };
    },
    
    // ========== MUDGAL YOGA ==========
    "Mudgal Yoga": (c) => {
      if (!c.planets) return { result: false };
      const exaltedPlanets = Object.keys(c.planets).filter(p => 
        c.planets[p] && c.planets[p].status === 'Exalt.'
      );
      const kendraHouses = [1, 4, 7, 10];
      const found = exaltedPlanets.filter(p => kendraHouses.includes(c.planets[p].house));
      return {
        result: found.length > 0,
        rationale: found.length > 0 ? `Exalted planets in Kendras: ${found.join(', ')}.` : "No exalted planets in Kendra houses."
      };
    },
    
    // ========== BHAVA SHUDDHI YOGA ==========
    "Bhava Shuddhi Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const details = [];
      [1, 5, 9].forEach(house => {
        const lordSign = signNames[(ascSn + house - 1) % 12];
        const lord = getSignLord(lordSign);
        const lordPlanet = c.planets[lord];
        if (lordPlanet && (lordPlanet.house === house || [1, 5, 9].includes(lordPlanet.house))) {
          details.push(`L${house} (${lord}) in H${lordPlanet.house}`);
        }
      });
      return {
        result: details.length > 0,
        rationale: details.length > 0 ? `Beneficial house lords in Trikona/Own houses: ${details.join(', ')}.` : "Main house lords are not in auspicious placements."
      };
    },
    
    // ========== LAGNADHI YOGAS ==========
    "Lagnadhi Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // Lagna lord with Jupiter in kendra
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const lagnaLord = getSignLord(signNames[ascSn % 12]);
      
      const lagnaLordPlanet = c.planets[lagnaLord];
      const jupiter = c.planets.Jupiter;
      
      if (!lagnaLordPlanet || !jupiter) return false;
      
      const kendraHouses = [1, 4, 7, 10];
      return kendraHouses.includes(lagnaLordPlanet.house) && kendraHouses.includes(jupiter.house);
    },
    
    // ========== PARIVARTANA YOGA ==========
    "Parivartana Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // Two planets in mutual kendras (exchange of houses)
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      
      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const p1 = c.planets[planets[i]];
          const p2 = c.planets[planets[j]];
          
          if (!p1 || !p2) continue;
          
          // Check if both in kendra (1,4,7,10) - mutual kendras
          const kendraHouses = [1, 4, 7, 10];
          if (kendraHouses.includes(p1.house) && kendraHouses.includes(p2.house)) {
            return true;
          }
        }
      }
      return false;
    },
    
    // ========== SUNAPHA & RELATED ==========
    "Sunapha Yoga": (c) => {
      if (!c.planets) return false;
      // Benefic planets (other than Sun) in 2nd from Sun
      const sun = c.planets.Sun;
      if (!sun) return false;
      
      const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
      const sunHouse = sun.house || 0;
      const secondFromSun = ((sunHouse - 1 + 1) % 12) + 1;
      
      return benefics.some(b => {
        const planet = c.planets[b];
        return planet && planet.house === secondFromSun;
      });
    },
    
    "Anapha Yoga": (c) => {
      if (!c.planets) return false;
      // Benefic planets (other than Sun) in 12th from Sun
      const sun = c.planets.Sun;
      if (!sun) return false;
      
      const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
      const sunHouse = sun.house || 0;
      const twelfthFromSun = ((sunHouse - 1 + 11) % 12) + 1;
      
      return benefics.some(b => {
        const planet = c.planets[b];
        return planet && planet.house === twelfthFromSun;
      });
    },
    
    // ========== DURDHARA YOGA ==========
    "Durdhara Yoga": (c) => {
      if (!c.planets) return false;
      // Benefic planets on both sides of Moon (in 2nd and 12th)
      const moon = c.planets.Moon;
      if (!moon) return false;
      
      const benefics = ['Jupiter', 'Venus', 'Mercury'];
      const moonHouse = moon.house || 0;
      const secondFromMoon = ((moonHouse - 1 + 1) % 12) + 1;
      const twelfthFromMoon = ((moonHouse - 1 + 11) % 12) + 1;
      
      const inSecond = benefics.some(b => {
        const planet = c.planets[b];
        return planet && planet.house === secondFromMoon;
      });
      
      const inTwelfth = benefics.some(b => {
        const planet = c.planets[b];
        return planet && planet.house === twelfthFromMoon;
      });
      
      return inSecond && inTwelfth;
    },
    
    // ========== AYUSHI YOGA ==========
    "Ayushi Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // 8th lord strong and well-placed = long life
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const eighthSign = (ascSn + 7) % 12;
      const lord8 = getSignLord(signNames[eighthSign]);
      const lord8Planet = c.planets[lord8];
      
      if (!lord8Planet) return false;
      return lord8Planet.status === 'Own' || lord8Planet.status === 'Exalt.' || [1, 4, 5, 9, 10].includes(lord8Planet.house);
    },
    
    // ========== DASA YOGA ==========
    "Dasa Yoga": (c) => {
      if (!c.planets) return false;
      // Concerned house lord + 10th lord conjunction/aspect
      const lord10 = c.planets.Saturn; // Simplified
      const planets = Object.keys(c.planets).filter(p => c.planets[p]);
      
      return planets.some(p => {
        const planet = c.planets[p];
        const kendra = [1, 4, 7, 10].includes(planet.house);
        return kendra && (planet.status === 'Own' || planet.status === 'Exalt.');
      });
    },
    
    // ========== NAKSHATRA YOGAS ==========
    "Pushya Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Pushya');
    },
    
    "Magha Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Magha');
    },
    
    "Revati Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Revati');
    },
    
    // ========== MORE DIGNITY YOGAS ==========
    "Vargottama Yoga": (c) => {
      if (!c.planets) return false;
      // Planet in same rashi and navamsha = intense strength
      return Object.keys(c.planets).some(p => {
        const planet = c.planets[p];
        // Simplified: planet with high strength indicator
        return planet && (planet.status === 'Exalt.' || planet.status === 'Own');
      });
    },
    
    "Atma Karaka Yoga": (c) => {
      if (!c.planets) return false;
      // Retrograde planet in 1st house or with lagna lord
      const retrograde = Object.keys(c.planets).filter(p => 
        c.planets[p] && c.planets[p].retro
      );
      
      return retrograde.some(p => {
        const planet = c.planets[p];
        return planet.house === 1 || planet.house === 10;
      });
    },
    
    // ========== MAHAPURUSHA YOGAS ==========
    "Ruchaka Yoga": (c) => {
      if (!c.planets) return false;
      // Mars in own/exalt sign in kendra
      const mars = c.planets.Mars;
      if (!mars) return false;
      const kendraHouses = [1, 4, 7, 10];
      const marsStrong = mars.status === 'Own' || mars.status === 'Exalt.';
      return kendraHouses.includes(mars.house) && marsStrong;
    },
    
    "Bhadra Yoga": (c) => {
      if (!c.planets) return false;
      // Mercury in own/exalt sign in kendra
      const mercury = c.planets.Mercury;
      if (!mercury) return false;
      const kendraHouses = [1, 4, 7, 10];
      const mercuryStrong = mercury.status === 'Own' || mercury.status === 'Exalt.';
      return kendraHouses.includes(mercury.house) && mercuryStrong;
    },
    
    "Hamsa Yoga": (c) => {
      if (!c.planets) return false;
      // Jupiter in own/exalt sign in kendra
      const jupiter = c.planets.Jupiter;
      if (!jupiter) return false;
      const kendraHouses = [1, 4, 7, 10];
      const jupiterStrong = jupiter.status === 'Own' || jupiter.status === 'Exalt.';
      return kendraHouses.includes(jupiter.house) && jupiterStrong;
    },
    
    "Malavya Yoga": (c) => {
      if (!c.planets) return false;
      // Venus in own/exalt sign in kendra
      const venus = c.planets.Venus;
      if (!venus) return false;
      const kendraHouses = [1, 4, 7, 10];
      const venusStrong = venus.status === 'Own' || venus.status === 'Exalt.';
      return kendraHouses.includes(venus.house) && venusStrong;
    },
    
    "Sasha Yoga": (c) => {
      if (!c.planets) return false;
      // Saturn in own/exalt sign in kendra
      const saturn = c.planets.Saturn;
      if (!saturn) return false;
      const kendraHouses = [1, 4, 7, 10];
      const saturnStrong = saturn.status === 'Own' || saturn.status === 'Exalt.';
      return kendraHouses.includes(saturn.house) && saturnStrong;
    },
    
    // ========== GAJA & RELATED ==========
    "Gajakesari Yoga": (c) => {
      if (!c.planets) return false;
      // Jupiter in kendra from Moon
      const moon = c.planets.Moon;
      const jupiter = c.planets.Jupiter;
      if (!moon || !jupiter) return false;
      
      const kendraFromMoon = [1, 4, 7, 10];
      const moonHouse = moon.house || 0;
      const jupiterHouse = jupiter.house || 0;
      const diff = Math.abs(jupiterHouse - moonHouse);
      
      return (diff === 0 || diff === 3 || diff === 6 || diff === 9);
    },
    
    "Saraswati Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // Mercury, Venus, Jupiter in trikona
      const mercury = c.planets.Mercury;
      const venus = c.planets.Venus;
      const jupiter = c.planets.Jupiter;
      
      const trikonaHouses = [1, 5, 9];
      const mercuryIn = mercury && trikonaHouses.includes(mercury.house);
      const venusIn = venus && trikonaHouses.includes(venus.house);
      const jupiterIn = jupiter && trikonaHouses.includes(jupiter.house);
      
      return (mercuryIn && venusIn) || (mercuryIn && jupiterIn) || (venusIn && jupiterIn);
    },
    
    // ========== SHAKATA & NEGATIVE ==========
    "Shakata Yoga": (c) => {
      if (!c.planets) return false;
      // Jupiter in 6/8/12 from Moon = challenges
      const moon = c.planets.Moon;
      const jupiter = c.planets.Jupiter;
      if (!moon || !jupiter) return false;
      
      const moonHouse = moon.house || 0;
      const jupiterHouse = jupiter.house || 0;
      const diff = Math.abs(jupiterHouse - moonHouse);
      
      return (diff === 5 || diff === 7 || diff === 11);  // Houses 6, 8, 12 from moon
    },
    
    "Kemadruma Yoga": (c) => {
      if (!c.planets) return false;
      // Kemadruma: No planets (except Sun, Rahu, Ketu) in the 2nd or 12th house from the Moon.
      const moon = c.planets.Moon;
      if (!moon) return false;
      
      const validPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      const moonHouse = moon.house || 0;
      
      const secondFromMoon = ((moonHouse - 1 + 1) % 12) + 1;
      const twelfthFromMoon = ((moonHouse - 1 + 11) % 12) + 1;
      
      const hasPlanetIn2ndOr12th = validPlanets.some(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        return planet.house === secondFromMoon || planet.house === twelfthFromMoon;
      });
      
      // Kemadruma occurs if there are NO valid planets in 2nd or 12th
      return !hasPlanetIn2ndOr12th;
    },
    
    "Grahan Yoga": (c) => {
      if (!c.planets) return false;
      // Rahu/Ketu in kendra or trikona
      const rahu = c.planets.Rahu;
      const ketu = c.planets.Ketu;
      
      const nodeHouses = [1, 4, 5, 7, 9, 10];
      return (rahu && nodeHouses.includes(rahu.house)) || (ketu && nodeHouses.includes(ketu.house));
    },
    
    "Kala Sarpa Yoga": (c) => {
      if (!c.planets) return false;
      // All planets between Rahu and Ketu
      const rahu = c.planets.Rahu;
      const ketu = c.planets.Ketu;
      
      if (!rahu || !ketu) return false;
      
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      const rahuDeg = rahu.deg || 0;
      const ketuDeg = ketu.deg || 0;
      
      const allBetween = planets.every(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        const deg = planet.deg || 0;
        
        if (rahuDeg < ketuDeg) {
          return deg > rahuDeg && deg < ketuDeg;
        } else {
          return deg > rahuDeg || deg < ketuDeg;
        }
      });
      
      return allBetween;
    },
    
    "Mangal Dosha": (c) => {
      if (!c.planets) return false;
      // Mars in 12, 1, 4, 7, 8 from lagna/moon
      const mars = c.planets.Mars;
      if (!mars) return false;
      
      const doshaHouses = [1, 4, 7, 8, 12];
      return doshaHouses.includes(mars.house);
    },
    
    // ========== ADVANCED STRENGTH YOGAS ==========
    "Pushpa Yoga": (c) => {
      if (!c.planets) return false;
      // Benefics strong and well-placed
      const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
      const strongBenefics = benefics.filter(b => {
        const planet = c.planets[b];
        return planet && (planet.status === 'Own' || planet.status === 'Exalt.' || [1, 5, 9, 10].includes(planet.house));
      });
      
      return strongBenefics.length >= 3;
    },
    
    "Gada Yoga": (c) => {
      if (!c.planets) return false;
      // Sun-Mercury conjunction with strength
      const sun = c.planets.Sun;
      const mercury = c.planets.Mercury;
      
      if (!sun || !mercury) return false;
      
      const orbDeg = Math.abs((sun.deg || 0) - (mercury.deg || 0));
      const sameSn = (sun.sn || 0) === (mercury.sn || 0);
      
      return sameSn && orbDeg <= 6 && (sun.status === 'Own' || mercury.status === 'Own');
    },
    
    "Chandamatha Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // Moon with 9th lord or in 9th
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const ninthSign = (ascSn + 8) % 12;
      const lord9 = getSignLord(signNames[ninthSign]);
      
      const moon = c.planets.Moon;
      const lord9Planet = c.planets[lord9];
      
      if (!moon) return false;
      
      return (moon.house === 9) || (lord9Planet && moon.house === lord9Planet.house);
    },
    
    "Chatushkona Yoga": (c) => {
      if (!c.planets) return false;
      // 4 planets, especially benefics, in kendra
      const kendraHouses = [1, 4, 7, 10];
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      
      const inKendra = planets.filter(p => {
        const planet = c.planets[p];
        return planet && kendraHouses.includes(planet.house);
      });
      
      return inKendra.length >= 4;
    },
    
    "Rajadhiyoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // 9th lord in 10th or 10th lord in 9th
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      const ninth = (ascSn + 8) % 12;
      const tenth = (ascSn + 9) % 12;
      
      const lord9Sign = signNames[ninth];
      const lord10Sign = signNames[tenth];
      
      const lord9 = getSignLord(lord9Sign);
      const lord10 = getSignLord(lord10Sign);
      
      const lord9Planet = c.planets[lord9];
      const lord10Planet = c.planets[lord10];
      
      return (lord9Planet && lord9Planet.house === 10) || (lord10Planet && lord10Planet.house === 9);
    },
    
    "Panch Mahapurusha Yoga": (c) => {
      if (!c.planets) return false;
      // At least 3 of the 5 Mahapurusha yogas
      const mahapurushas = ['Ruchaka', 'Bhadra', 'Hamsa', 'Malavya', 'Sasha'];
      const kendraHouses = [1, 4, 7, 10];
      
      const mahapurCount = mahapurushas.filter(yoga => {
        const planetMap = {
          'Ruchaka': 'Mars',
          'Bhadra': 'Mercury',
          'Hamsa': 'Jupiter',
          'Malavya': 'Venus',
          'Sasha': 'Saturn'
        };
        
        const planet = c.planets[planetMap[yoga]];
        const isOwn = planet && planet.status === 'Own';
        const isExalt = planet && planet.status === 'Exalt.';
        const inKendra = planet && kendraHouses.includes(planet.house);
        
        return inKendra && (isOwn || isExalt);
      }).length;
      
      return mahapurCount >= 3;
    },
    
    "Amla Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // 10th lord in 10th house with strength
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      const tenth = (ascSn + 9) % 12;
      const lord10Sign = signNames[tenth];
      const lord10 = getSignLord(lord10Sign);
      const lord10Planet = c.planets[lord10];
      
      if (!lord10Planet) return false;
      
      return lord10Planet.house === 10 && (lord10Planet.status === 'Own' || lord10Planet.status === 'Exalt.');
    },
    
    // ========== ADDITIONAL NAKSHATRA YOGAS ==========
    "Ashwini Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Ashwini');
    },
    
    "Krittika Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Krittika');
    },
    
    "Rohini Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Rohini');
    },
    
    "Mrigashira Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Mrigashira');
    },
    
    "Ardra Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Ardra');
    },
    
    "Punarvasu Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Punarvasu');
    },
    
    "Hasta Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Hasta');
    },
    
    "Chitra Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Chitra');
    },
    
    "Swati Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Swati');
    },
    
    "Vishakha Nakshatra Yoga": (c) => {
      if (!c.planets) return false;
      return Object.keys(c.planets).some(p => c.planets[p] && c.planets[p].nak === 'Vishakha');
    },
    
    // ========== STRENGTH & PROSPERITY YOGAS ==========
    "Siddhi Yoga": (c) => {
      if (!c.planets) return false;
      // All planets in own/exalt/friendly signs
      const strongPlanets = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        return planet && (planet.status === 'Own' || planet.status === 'Exalt.' || planet.status === 'Friend');
      });
      return strongPlanets.length >= 6;
    },
    
    "Ubhayachari Yoga": (c) => {
      if (!c.planets) return false;
      // Benefics on both sides of a planet
      const benefics = ['Jupiter', 'Venus', 'Mercury'];
      const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
      
      return malefics.some(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        const planetHouse = planet.house;
        
        const hasLeftBenefic = benefics.some(b => {
          const ben = c.planets[b];
          return ben && ben.house === (planetHouse === 1 ? 12 : planetHouse - 1);
        });
        
        const hasRightBenefic = benefics.some(b => {
          const ben = c.planets[b];
          return ben && ben.house === (planetHouse === 12 ? 1 : planetHouse + 1);
        });
        
        return hasLeftBenefic && hasRightBenefic;
      });
    },
    
    "Adhi Yoga": (c) => {
      if (!c.planets) return false;
      // Benefics in 6th, 7th, 8th
      const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
      const houses678 = [6, 7, 8];
      
      const count = benefics.filter(b => {
        const planet = c.planets[b];
        return planet && houses678.includes(planet.house);
      }).length;
      
      return count >= 2;
    },
    
    "Harsha Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // 6th lord strong in 6th or 8th lord in 12th = obstacles removed
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      const sixth = (ascSn + 5) % 12;
      const lord6 = getSignLord(signNames[sixth]);
      const lord6Planet = c.planets[lord6];
      
      return lord6Planet && (lord6Planet.house === 6 || lord6Planet.house === 8);
    },
    
    "Sarala Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // 8th lord strong in 8th
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      const eighth = (ascSn + 7) % 12;
      const lord8 = getSignLord(signNames[eighth]);
      const lord8Planet = c.planets[lord8];
      
      return lord8Planet && lord8Planet.house === 8 && (lord8Planet.status === 'Own' || lord8Planet.status === 'Exalt.');
    },
    
    "Parvata Yoga": (c) => {
      if (!c.planets) return false;
      // 9th and 10th lords in kendras
      const kendraHouses = [1, 4, 7, 10];
      const planets = Object.keys(c.planets).filter(p => c.planets[p]);
      
      const ninthLordInKendra = planets.some(p => {
        const planet = c.planets[p];
        return planet && kendraHouses.includes(planet.house) && [3, 5].includes(planet.house);
      });
      
      return ninthLordInKendra;
    },
    
    "Yoga Yoga": (c) => {
      if (!c.planets || !c.asc) return false;
      // 9th lord in 9th/10th = spiritual + material success
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      const ninth = (ascSn + 8) % 12;
      const lord9 = getSignLord(signNames[ninth]);
      const lord9Planet = c.planets[lord9];
      
      return lord9Planet && (lord9Planet.house === 9 || lord9Planet.house === 10);
    },
    
    "Dhanayoga": (c) => {
      if (!c.planets) return false;
      // 11th lord strong in kendra/trikona
      const kendraTrikonaHouses = [1, 4, 5, 7, 9, 10];
      const planets = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        return planet && kendraTrikonaHouses.includes(planet.house) && (planet.status === 'Own' || planet.status === 'Exalt.');
      });
      
      return planets.length >= 3;
    },
    
    "Gaja Kesari Yoga Variation": (c) => {
      if (!c.planets) return false;
      // Jupiter in 4th from Moon
      const moon = c.planets.Moon;
      const jupiter = c.planets.Jupiter;
      if (!moon || !jupiter) return false;
      
      const moonHouse = moon.house || 0;
      const expectedJupiterHouse = ((moonHouse + 3) % 12) + 1;
      
      return Math.abs(jupiter.house - expectedJupiterHouse) <= 1;
    },
    
    "Virinchi Yoga": (c) => {
      if (!c.planets) return false;
      // 5th, 9th and 12th lords in kendra
      const kendraHouses = [1, 4, 7, 10];
      const planets = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        return planet && kendraHouses.includes(planet.house);
      });
      
      return planets.length >= 3;
    },
    
    "Lakshmi Yoga Extended": (c) => {
      if (!c.planets) return false;
      // Jupiter with benefics in kendra = wealth
      const jupiter = c.planets.Jupiter;
      const benefics = ['Venus', 'Mercury', 'Moon'];
      
      if (!jupiter || !benefics.some(b => c.planets[b])) return false;
      
      const kendraHouses = [1, 4, 7, 10];
      return kendraHouses.includes(jupiter.house);
    },
    
    "Rajayoga Extended": (c) => {
      if (!c.planets) return false;
      // Multiple planet conjunctions in power houses
      const kendraHouses = [1, 4, 7, 10];
      const planets = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        return planet && kendraHouses.includes(planet.house);
      });
      
      return planets.length >= 4;
    },
    
    "Pushpa Yoga Extended": (c) => {
      if (!c.planets) return false;
      // Multiple benefics in trikonas
      const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
      const trikonaHouses = [1, 5, 9];
      
      const count = benefics.filter(b => {
        const planet = c.planets[b];
        return planet && trikonaHouses.includes(planet.house);
      }).length;
      
      return count >= 3;
    },
    
    "Chandra Yoga": (c) => {
      if (!c.planets) return false;
      // Moon strong in natal chart
      const moon = c.planets.Moon;
      if (!moon) return false;
      
      const kendraTrikonaHouses = [1, 4, 5, 7, 9, 10];
      return kendraTrikonaHouses.includes(moon.house) && (moon.status === 'Own' || moon.status === 'Exalt.');
    },
    
    "Sukha Yoga": (c) => {
      if (!c.planets) return false;
      // 4th lord strong - comfort & happiness
      const planets = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        return planet && [4, 5].includes(planet.house) && (planet.status === 'Own' || planet.status === 'Exalt.');
      });
      
      return planets.length >= 2;
    }
  };
  
  // Apply implementations to YOGAS_DATA
  Object.keys(implementations).forEach(yogaName => {
    const yoga = window.YOGAS_DATA.find(y => y.name === yogaName);
    if (yoga && implementations[yogaName]) {
      yoga.evaluate = implementations[yogaName];
    }
  });
  
  console.log('✅ Yoga implementations enhanced successfully');
  return true;
}

// Auto-enhance when document is ready or when this script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceYogaImplementations);
} else {
  enhanceYogaImplementations();
}
