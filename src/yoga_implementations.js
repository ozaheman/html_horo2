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
            connections.push(`${w1.lord} (Lord of H${w1.house}) and ${w2.lord} (Lord of H${w2.house}) are conjunct in ${p1.sign} (H${p1.house})`);
            return true;
          }
          return false;
        })
      );
      
      return { 
        result: isDetected, 
        rationale: isDetected ? `Dhana Yoga is actively forming because ${connections.join('; ')}. This creates a powerful wealth combination.` : "No direct connection between lords of 2nd, 5th, 9th, or 11th houses."
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
        rationale: isDetected ? `It forms because Moon is in ${moon.sign} (H${moon.house}) and Mars is in ${mars.sign} (H${mars.house}). They are in direct ${isConj ? 'conjunction' : 'opposition'}, creating financial drive.` : "Moon and Mars are not significantly connected."
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
        rationale: isDetected ? `It forms because Sun is in ${sun.sign} (H${sun.house}) and Mercury is placed exactly in ${merc.sign} (H${merc.house}) within a ${orbDeg.toFixed(1)}° orb, illuminating intellectual capabilities.` : "Sun and Mercury are too far apart to form this yoga."
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
        rationale: isDetected ? `It forms because the Lord of 9th house (${lord9}) is placed strongly in the 10th house of career (${p9.sign}), bringing profound grace to professional endeavors.` : `9th lord is not in the 10th house.`
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
        rationale: isDetected ? `It forms because the 2nd Lord (${lord2} in H${p2?.house||'?'}) and 5th Lord (${lord5} in H${p5?.house||'?'}) are exchanging houses or placed securely in favorable Kendra/Trikona houses.` : "2nd and 5th lords are not in mutual connection or kendra/trikona."
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
        rationale: isDetected ? `It forms because the Lord of Gains (11th House Lord: ${lord11}) is placed in a difficult dusthana house (${p11.sign}, H${p11.house}), causing potential financial drainage.` : "11th lord is in a favorable house."
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
      
      const details = matched && matched.includes('Sun') ? `${sun.sign} (H${sun.house})` : (matched && matched.includes('Moon') ? `${moon.sign} (H${moon.house})` : '');
      
      return {
        result: !!matched,
        rationale: matched ? `It forms because ${matched} are in a tight conjunction in ${details}, causing a deep eclipse effect on vitality or emotions.` : "Sun/Moon are clear of Rahu/Ketu conjunctions."
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
        rationale: isDetected ? `It forms because ${betweenCount >= 7 ? 'all core' : 'the majority of'} planets are hemmed between Rahu in ${rahu.sign} (H${rahu.house}) and Ketu in ${ketu.sign} (H${ketu.house}), creating an intense karmic axis.` : "Planets are distributed outside the node axis."
      };
    },
    
    // ========== MOON & SUN FLANK YOGAS ==========
    "Sunapha Yoga": (c) => {
      const moon = c.planets.Moon; if(!moon) return { result: false };
      const h2 = (moon.sn + 1) % 12;
      const flankers = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
      return { result: flankers.length > 0, rationale: flankers.length > 0 ? `It forms because ${flankers.join(', ')} occupied the 2nd position from the Moon (${moon.sign}, H${moon.house}), bringing self-made wealth.` : '' };
    },
    
    "Anapha Yoga": (c) => {
      const moon = c.planets.Moon; if(!moon) return { result: false };
      const h12 = (moon.sn + 11) % 12;
      const flankers = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
      return { result: flankers.length > 0, rationale: flankers.length > 0 ? `It forms because ${flankers.join(', ')} occupied the 12th position from the Moon (${moon.sign}, H${moon.house}), ensuring spiritual inclination and polite manners.` : '' };
    },
    
    "Durdhara Yoga": (c) => {
      const moon = c.planets.Moon; if(!moon) return { result: false };
      const h2 = (moon.sn + 1) % 12, h12 = (moon.sn + 11) % 12;
      const p2 = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
      const p12 = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
      const isDet = (p2.length > 0 && p12.length > 0);
      return { result: isDet, rationale: isDet ? `It forms because the Moon (${moon.sign}, H${moon.house}) is hemmed by ${p2.join(', ')} in the 2nd and ${p12.join(', ')} in the 12th position, granting abundance.` : '' };
    },
    
    "Vesi Yoga": (c) => {
      const sun = c.planets.Sun; if(!sun) return { result: false };
      const h2 = (sun.sn + 1) % 12;
      const flankers = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
      return { result: flankers.length > 0, rationale: flankers.length > 0 ? `It forms because ${flankers.join(', ')} occupied the 2nd position from the Sun (${sun.sign}, H${sun.house}), indicating good financial status and truthful speech.` : '' };
    },
    
    "Vosi Yoga": (c) => {
      const sun = c.planets.Sun; if(!sun) return { result: false };
      const h12 = (sun.sn + 11) % 12;
      const flankers = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
      return { result: flankers.length > 0, rationale: flankers.length > 0 ? `It forms because ${flankers.join(', ')} occupied the 12th position from the Sun (${sun.sign}, H${sun.house}), granting philosophical nature and charitable disposition.` : '' };
    },
    
    "Ubhayachari Yoga": (c) => {
      const sun = c.planets.Sun; if(!sun) return { result: false };
      const h2 = (sun.sn + 1) % 12, h12 = (sun.sn + 11) % 12;
      const p2 = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
      const p12 = Object.keys(c.planets).filter(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
      const isDet = (p2.length > 0 && p12.length > 0);
      return { result: isDet, rationale: isDet ? `It forms because the Sun (${sun.sign}, H${sun.house}) is beautifully flanked by ${p2.join(', ')} in the 2nd position and ${p12.join(', ')} in the 12th, indicating great renown and physical endurance.` : '' };
    },
    
    // ========== DIGNTY YOGAS ==========
    "Uchcha Yoga": (c) => {
      if (!c.planets) return { result: false };
      const exalted = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].status === 'Exalt.');
      return {
        result: exalted.length > 0,
        rationale: exalted.length > 0 ? `It forms because ${exalted.map(p => `${p} is exalted in ${c.planets[p].sign} (H${c.planets[p].house})`).join(' and ')}.` : "No exalted planets."
      };
    },
    
    "Swakshetra Yoga": (c) => {
      if (!c.planets) return { result: false };
      const own = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].status === 'Own');
      return {
        result: own.length > 0,
        rationale: own.length > 0 ? `It forms because ${own.map(p => `${p} is in its own sign ${c.planets[p].sign} (H${c.planets[p].house})`).join(' and ')}.` : "No planets in own signs."
      };
    },
    
    "Vargottama Yoga": (c) => {
      if (!c.planets) return { result: false };
      const varg = Object.keys(c.planets).filter(p => {
        const planet = c.planets[p];
        if (!planet || planet.deg === undefined) return false;
        const deg = parseFloat(planet.deg) || 0;
        return deg >= 0 && deg < 3.33; // Approximately first navamsha
      });
      return {
        result: varg.length > 0,
        rationale: varg.length > 0 ? `It forms because ${varg.map(p => `${p} is placed in the Vargottama degree (${(parseFloat(c.planets[p].deg) || 0).toFixed(1)}° in ${c.planets[p].sign}, H${c.planets[p].house})`).join(' and ')}.` : "No planets in Vargottama degrees."
      };
    },
    
    "Vakri Yoga": (c) => {
      if (!c.planets) return { result: false };
      const retro = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].retro === true);
      return {
        result: retro.length > 0,
        rationale: retro.length > 0 ? `It forms because ${retro.map(p => `${p} is retrograde in ${c.planets[p].sign} (H${c.planets[p].house})`).join(' and ')}.` : "No retrograde planets."
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
        rationale: combust.length > 0 ? `It forms because ${combust.map(p => `${p} (H${c.planets[p].house}) is combust heavily due to being too close to the Sun in ${sun.sign}`).join(' and ')}.` : "No planets are combust."
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
            cancelReason = `the deep debilitation of ${planet} (in ${c.planets[planet].sign}, H${c.planets[planet].house}) is miraculously cancelled and reversed by its exaltation lord ${rulerName} sitting powerfully in H${rulerPlanet.house} (${rulerPlanet.sign})`;
            return true;
          }
        }
        return false;
      });

      return {
        result: isDetected,
        rationale: isDetected ? `It forms because ${cancelReason}, creating an unexpected rise to power after initial adversity.` : "No debilitated planets found or their cancellation lords are not in key houses."
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
          findings.push(`${lord} (Lord of H${house}) located in another dusthana H${lordPlanet.house} (${lordPlanet.sign})`);
        }
      });

      return {
        result: findings.length > 0,
        rationale: findings.length > 0 ? `It forms because the lords of historically difficult houses are beautifully neutralizing each other: ${findings.join(' and ')}. This creates Vipareeta (Reverse) Raj Yoga.` : "Lords of 6, 8, 12 are not in dusthanas."
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
        rationale: found.length > 0 ? `It forms because the exalted planet(s) ${found.map(p => `${p} is soaring in H${c.planets[p].house} (${c.planets[p].sign})`).join(', ')} are positioned purely in Kendra houses.` : "No exalted planets in Kendra houses."
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
          details.push(`L${house} (${lord}) in H${lordPlanet.house} (${lordPlanet.sign})`);
        }
      });
      return {
        result: details.length > 0,
        rationale: details.length > 0 ? `It forms because your most beneficial house lords are firmly seated in Trikona or Their Own houses: ${details.join(', ')}.` : "Main house lords are not in auspicious placements."
      };
    },
    
    // ========== LAGNADHI YOGAS ==========
    "Lagnadhi Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      // Lagna lord with Jupiter in kendra
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const lagnaLord = getSignLord(signNames[ascSn % 12]);
      
      const lagnaLordPlanet = c.planets[lagnaLord];
      const jupiter = c.planets.Jupiter;
      
      if (!lagnaLordPlanet || !jupiter) return { result: false };
      
      const kendraHouses = [1, 4, 7, 10];
      const isDet = kendraHouses.includes(lagnaLordPlanet.house) && kendraHouses.includes(jupiter.house);
      return {
          result: isDet, 
          rationale: isDet ? `It forms because the Ascendant Lord ${lagnaLord} (H${lagnaLordPlanet.house}, ${lagnaLordPlanet.sign}) and the supreme benefic Jupiter (H${jupiter.house}, ${jupiter.sign}) are both holding commanding Kendra houses.` : ''
      };
    },
    
    // ========== PARIVARTANA YOGA ==========
    "Parivartana Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      
      let findings = [];
      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const p1 = planets[i];
          const p2 = planets[j];
          const pd1 = c.planets[p1];
          const pd2 = c.planets[p2];
          
          if (!pd1 || !pd2) continue;
          
          if (getSignLord(pd1.sign) === p2 && getSignLord(pd2.sign) === p1) {
            findings.push(`${p1} (in ${pd1.sign}, H${pd1.house}) and ${p2} (in ${pd2.sign}, H${pd2.house})`);
          }
        }
      }
      return {
          result: findings.length > 0,
          rationale: findings.length > 0 ? `It forms because there is a perfect mutual exchange of signs between ${findings.join(' | ')}, linking their house significations powerfully.` : ''
      };
    },
    
    // ========== AYUSHI YOGA ==========
    "Ayushi Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      // 8th lord strong and well-placed = long life
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const eighthSign = (ascSn + 7) % 12;
      const lord8 = getSignLord(signNames[eighthSign]);
      const lord8Planet = c.planets[lord8];
      
      if (!lord8Planet) return { result: false };
      const strongPlacement = lord8Planet.status === 'Own' || lord8Planet.status === 'Exalt.' || [1, 4, 5, 9, 10].includes(lord8Planet.house);
      return {
          result: strongPlacement,
          rationale: strongPlacement ? `It forms because the 8th Lord of longevity (${lord8}) is placed powerfully in H${lord8Planet.house} (${lord8Planet.sign}), reinforcing vitality and lifespan.` : ''
      };
    },
    
    // ========== NAKSHATRA YOGAS ==========
    "Pushya Nakshatra Yoga": (c) => {
      if (!c.planets) return { result: false };
      const found = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].nak === 'Pushya');
      return { result: found.length > 0, rationale: found.length > 0 ? `It forms because ${found.join(', ')} is placed in the highly auspicious Pushya Nakshatra.` : '' };
    },
    
    "Magha Nakshatra Yoga": (c) => {
      if (!c.planets) return { result: false };
      const found = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].nak === 'Magha');
      return { result: found.length > 0, rationale: found.length > 0 ? `It forms because ${found.join(', ')} is placed in the royal Magha Nakshatra.` : '' };
    },
    
    "Revati Nakshatra Yoga": (c) => {
      if (!c.planets) return { result: false };
      const found = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].nak === 'Revati');
      return { result: found.length > 0, rationale: found.length > 0 ? `It forms because ${found.join(', ')} is placed in the prosperous Revati Nakshatra.` : '' };
    },
    
    "Atma Karaka Yoga": (c) => {
      if (!c.planets) return { result: false };
      // Retrograde planet in 1st house or with lagna lord
      const retrograde = Object.keys(c.planets).filter(p => 
        c.planets[p] && c.planets[p].retro
      );
      
      const soulPlanets = retrograde.filter(p => {
        const planet = c.planets[p];
        return planet.house === 1 || planet.house === 10;
      });
      return { result: soulPlanets.length > 0, rationale: soulPlanets.length > 0 ? `It forms because the retrograde soul-indicator ${soulPlanets.join(', ')} is placed predominantly in Kendra H${c.planets[soulPlanets[0]].house}.` : '' };
    },
    
    // ========== MAHAPURUSHA YOGAS ==========
    "Ruchaka Yoga": (c) => {
      if (!c.planets) return { result: false };
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
      if (!c.planets) return { result: false };
      // Jupiter in 6/8/12 from Moon = challenges
      const moon = c.planets.Moon;
      const jupiter = c.planets.Jupiter;
      if (!moon || !jupiter) return { result: false };
      
      const moonHouse = moon.house || 0;
      const jupiterHouse = jupiter.house || 0;
      const diff = Math.abs(jupiterHouse - moonHouse);
      
      const isDet = (diff === 5 || diff === 7 || diff === 11);  // Houses 6, 8, 12 from moon
      return { 
          result: isDet, 
          rationale: isDet ? `It forms because Jupiter (H${jupiterHouse}, ${jupiter.sign}) is placed in a difficult 6th, 8th or 12th position from the Moon (H${moonHouse}, ${moon.sign}), causing fluctuating fortunes.` : '' 
      };
    },
    
    "Kemadruma Yoga": (c) => {
      if (!c.planets) return { result: false };
      const moon = c.planets.Moon;
      if (!moon) return { result: false };
      
      const validPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      const moonHouse = moon.house || 0;
      
      const secondFromMoon = ((moonHouse - 1 + 1) % 12) + 1;
      const twelfthFromMoon = ((moonHouse - 1 + 11) % 12) + 1;
      
      const hasPlanetIn2ndOr12th = validPlanets.some(p => {
        const planet = c.planets[p];
        if (!planet) return false;
        return planet.house === secondFromMoon || planet.house === twelfthFromMoon;
      });
      
      return { 
          result: !hasPlanetIn2ndOr12th, 
          rationale: !hasPlanetIn2ndOr12th ? `It forms because the Moon (in H${moonHouse}, ${moon.sign}) is completely isolated without any major planets in either the 2nd (H${secondFromMoon}) or 12th (H${twelfthFromMoon}) positions.` : '' 
      };
    },
    
    "Mangal Dosha": (c) => {
      if (!c.planets) return { result: false };
      const mars = c.planets.Mars;
      if (!mars) return { result: false };
      
      const doshaHouses = [1, 4, 7, 8, 12];
      const isDet = doshaHouses.includes(mars.house);
      return { 
          result: isDet, 
          rationale: isDet ? `It forms because Mars is aggressively positioned in H${mars.house} (${mars.sign}), directly activating the Kuja Dosha axis.` : '' 
      };
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
      if (!c.planets || !c.asc) return { result: false };
      // Moon with 9th lord or in 9th
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const ninthSign = (ascSn + 8) % 12;
      const lord9 = getSignLord(signNames[ninthSign]);
      
      const moon = c.planets.Moon;
      const lord9Planet = c.planets[lord9];
      
      if (!moon) return { result: false };
      
      const isDet = (moon.house === 9) || (lord9Planet && moon.house === lord9Planet.house);
      return {
          result: isDet,
          rationale: isDet ? `It forms because the Moon (H${moon.house}, ${moon.sign}) is deeply connected with the 9th house of fortune (Lord ${lord9}).` : ''
      };
    },
    
    "Chatushkona Yoga": (c) => {
      if (!c.planets) return { result: false };
      // 4 planets, especially benefics, in kendra
      const kendraHouses = [1, 4, 7, 10];
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      
      const inKendra = planets.filter(p => {
        const planet = c.planets[p];
        return planet && kendraHouses.includes(planet.house);
      });
      
      return {
          result: inKendra.length >= 4,
          rationale: inKendra.length >= 4 ? `It forms because a powerful cluster of ${inKendra.length} planets (${inKendra.join(', ')}) are occupying the pivotal Kendra houses.` : ''
      };
    },
    
    "Rajadhiyoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
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
      
      const l9in10 = (lord9Planet && lord9Planet.house === 10);
      const l10in9 = (lord10Planet && lord10Planet.house === 9);
      
      const isDet = l9in10 || l10in9;
      return {
          result: isDet,
          rationale: isDet ? `It forms because there is an explosive connection between the 9th Lord of luck (${lord9}) and the 10th Lord of career (${lord10}), placed in each other's domain.` : ''
      };
    },
    
    "Panch Mahapurusha Yoga": (c) => {
      if (!c.planets) return { result: false };
      // At least 3 of the 5 Mahapurusha yogas
      const mahapurushas = ['Ruchaka', 'Bhadra', 'Hamsa', 'Malavya', 'Sasha'];
      const kendraHouses = [1, 4, 7, 10];
      
      const matched = mahapurushas.filter(yoga => {
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
      });
      
      return {
          result: matched.length >= 3,
          rationale: matched.length >= 3 ? `Extremely rare! It forms because ${matched.length} major Yoga combinations (${matched.join(', ')}) are operating simultaneously due to immense planetary dignities in Kendras.` : ''
      };
    },
    
    "Amla Yoga": (c) => {
      if (!c.planets || !c.asc) return { result: false };
      // 10th lord in 10th house with strength
      const ascSn = c.asc.sn || 0;
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
      const tenth = (ascSn + 9) % 12;
      const lord10Sign = signNames[tenth];
      const lord10 = getSignLord(lord10Sign);
      const lord10Planet = c.planets[lord10];
      
      if (!lord10Planet) return { result: false };
      
      const isDet = lord10Planet.house === 10 && (lord10Planet.status === 'Own' || lord10Planet.status === 'Exalt.');
      return {
          result: isDet,
          rationale: isDet ? `It forms because the 10th Lord of career (${lord10}) is powerfully exalted or situated in its own sign precisely in the 10th house (${lord10Planet.sign}).` : ''
      };
    },
    
    // ========== END OF IMPLEMENTATIONS ==========
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
