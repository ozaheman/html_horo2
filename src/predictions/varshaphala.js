/**
 * Varshaphala (Tajik Solar Return) Engine
 * Calculates the exact moment of Solar Return and casts the annual chart.
 */

window.VARSHAPHALA = {
  /**
   * Casts the Varshaphala chart for a given target year.
   * Finds the exact moment when Sun's sidereal longitude returns to its natal coordinate.
   */
  castAnnualChart: function(targetYear) {
    if (!window.BIRTH_PLANETS || !window.BIRTH_PLANETS.Sun || !window.BIRTH) {
      console.warn("Natal chart not loaded for Varshaphala.");
      return null;
    }

    const natalSunSid = window.BIRTH_PLANETS.Sun.sid;
    const natalAscSn = window.BIRTH_ASC.sn;
    const bDate = window.BIRTH.date;
    const age = targetYear - bDate.getFullYear();

    // 1. Binary Search for Varshapravesha (Solar Return time)
    // The sun moves about 1 degree per day (0.041 degrees per hour).
    // Start search window 2 days before and after birth month/day in the target year.
    let searchStartJD = window.jd(targetYear, bDate.getMonth() + 1, bDate.getDate() - 2, 0);
    let searchEndJD = window.jd(targetYear, bDate.getMonth() + 1, bDate.getDate() + 2, 0);

    const ayan = window.BIRTH.ayan;
    const tolerance = 0.00001; // degrees (approx 1 second of arc)
    
    let midJD, midSunSid, diff;
    let iteration = 0;
    const maxIter = 50;

    while (iteration < maxIter) {
      midJD = (searchStartJD + searchEndJD) / 2;
      const pos = window.computeAll(midJD, ayan, 1);
      midSunSid = pos.Sun.sid;

      // shortest angular distance
      diff = window.norm360(midSunSid - natalSunSid);
      if (diff > 180) diff -= 360;

      if (Math.abs(diff) < tolerance) break;

      if (diff > 0) {
        // Sun has passed natal degree, look earlier
        searchEndJD = midJD;
      } else {
        // Sun is behind, look later
        searchStartJD = midJD;
      }
      iteration++;
    }

    // 2. Cast Planetary Chart at Varshapravesha (midJD)
    const varshaAsc = window.computeAsc(midJD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff, ayan, 1);
    const rawPos = window.computeAll(midJD, ayan, 1);
    const varshaPlanets = {};
    for (const [p, d] of Object.entries(rawPos)) {
      varshaPlanets[p] = {
        ...d,
        house: window.s2h(d.sn, varshaAsc.sn),
        sign: window.SIGNS ? window.SIGNS[d.sn] : "Sign" + d.sn
      };
    }
    
    // Convert midJD back to a Date object using rough estimation
    // Or we just return JD. We know JD = day count.
    
    // 3. Calculate Muntha
    // Rule: (Natal Lagna Sign + completed years) % 12
    // completed years = age
    const munthaSn = (natalAscSn + age) % 12;
    const munthaSign = window.SIGNS ? window.SIGNS[munthaSn] : "Sign"+munthaSn;
    const munthaHouse = window.s2h(munthaSn, varshaAsc.sn);

    // 4. Calculate Varshadhipati (Year Lord)
    // Contenders: Munthesh, Janma Lagnesh, Varsha Lagnesh, Dina/Ratri Pati, Tri-Rashi Pati
    const lords = {
      0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon", 4: "Sun", 5: "Mercury",
      6: "Venus", 7: "Mars", 8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter"
    };

    const munthesh = lords[munthaSn];
    const janmaLagnesh = lords[natalAscSn];
    const varshaLagnesh = lords[varshaAsc.sn];

    // Determine Dina/Ratri Pati based on Varshapravesh time (midJD)
    // Simplified: Check Sun's house in Varsha Chart. Houses 7-12 are above horizon (day), 1-6 below (night).
    const isDayVP = varshaPlanets.Sun.house >= 7;
    const dinaRatriPati = isDayVP ? "Sun" : "Moon";

    // Tri-Rashi Pati (Tajika Rule)
    const triRashiTable = {
      // Sign: [Day, Night]
      0: ["Sun", "Jupiter"],    // Aries
      1: ["Venus", "Moon"],     // Taurus
      2: ["Saturn", "Mercury"], // Gemini
      3: ["Venus", "Mars"],     // Cancer
      4: ["Jupiter", "Sun"],     // Leo
      5: ["Moon", "Venus"],     // Virgo
      6: ["Mercury", "Saturn"], // Libra
      7: ["Mars", "Venus"],     // Scorpio
      8: ["Saturn", "Saturn"],  // Sagittarius
      9: ["Mars", "Mars"],      // Capricorn
      10: ["Jupiter", "Jupiter"],// Aquarius
      11: ["Moon", "Moon"]       // Pisces
    };
    const triRashiPati = triRashiTable[varshaAsc.sn][isDayVP ? 0 : 1];

    const contenders = [...new Set([munthesh, janmaLagnesh, varshaLagnesh, dinaRatriPati, triRashiPati])];
    
    // In a full implementation, we'd calculate Panchavargiya Bala here.
    // For now, we take the one with highest dignity or just the first if simple.
    // Let's pick the one with strongest house or exaltation.
    let yearLord = contenders[0];
    let maxScore = -1;

    contenders.forEach(p => {
      let score = 0;
      const pos = varshaPlanets[p];
      if (!pos) return;

      // Simple scoring for Year Lord selection
      if ([1, 4, 7, 10].includes(pos.house)) score += 5; // Kendra
      if ([2, 5, 8, 11].includes(pos.house)) score += 3; // Panapara
      if (p === "Sun" && pos.sn === 4) score += 10; // Exalted Sun
      if (p === "Moon" && pos.sn === 1) score += 10; // Exalted Moon
      // ... more rules could go here
      
      if (score > maxScore) {
        maxScore = score;
        yearLord = p;
      }
    });

    // 5. Analysis Text
    let analysis = "";
    const goodHouses = [1, 2, 4, 5, 7, 9, 10, 11];
    if (goodHouses.includes(munthaHouse)) {
      analysis += `Muntha is in an auspicious house (${munthaHouse}). This suggests a year of growth and positive events in ${SIGN_HOUSE_SIGS[munthaHouse] || 'this area'}. `;
    } else {
      analysis += `Muntha is in a challenging house (${munthaHouse}). This may bring obstacles or health issues related to ${SIGN_HOUSE_SIGS[munthaHouse] || 'this area'}. `;
    }

    analysis += `The Year Lord is ${yearLord}, bringing its influence of ${PLANET_SIGS[yearLord] || ''} to the forefront. `;

    return {
      year: targetYear,
      age: age,
      varshapraveshJD: midJD,
      asc: varshaAsc,
      planets: varshaPlanets,
      yearLord: yearLord,
      muntha: {
        sn: munthaSn,
        sign: munthaSign,
        house: munthaHouse,
        lord: munthesh
      },
      analysis: analysis,
      dateInfo: window.revjul ? window.revjul(midJD, 1) : null
    };
  }
};

const SIGN_HOUSE_SIGS = {
  1: "Self, health, new beginnings",
  2: "Wealth, family, speech",
  3: "Siblings, courage, short travels",
  4: "Home, happiness, mother, properties",
  5: "Children, creativity, romance",
  6: "Health, debts, enemies",
  7: "Partnerships, marriage, public life",
  8: "Transformation, longevity, hurdles",
  9: "Luck, dharma, long travels",
  10: "Career, status, achievements",
  11: "Gains, friendships, desires",
  12: "Losses, isolation, spirituality"
};

const PLANET_SIGS = {
  "Sun": "Authority, soul, vitality",
  "Moon": "Mind, emotions, comfort",
  "Mars": "Energy, action, courage",
  "Mercury": "Intellect, communication, business",
  "Jupiter": "Wisdom, wealth, expansion",
  "Venus": "Love, arts, luxury",
  "Saturn": "Discipline, structure, karma"
};
