/**
 * Lal Kitab Main Evaluator
 */

window.LAL_KITAB = {
  // Detect special horoscope types and yogas
  evaluateSpecialConditions: function(planets) {
    if (!planets) return [];
    const conds = [];
    const p = planets;
    
    // Helper to check if planets are together in a house
    const together = (p1, p2) => p[p1] && p[p2] && p[p1].house === p[p2].house;
    const inHouse = (pName, houseNum) => p[pName] && p[pName].house === houseNum;

    // 1. Dharmi Teva (Pious Horoscope)
    if (inHouse('Jupiter', 4) || together('Jupiter', 'Saturn')) {
      conds.push({
        name: "Dharmi Teva (Pious Horoscope)",
        type: "Positive",
        desc: "The native is protected from evil eyes and sudden misfortunes. Malefic planets lose their sting."
      });
    }

    // 2. Andhi Kundali (Blind Horoscope)
    if (together('Sun', 'Saturn') && inHouse('Sun', 7)) {
      conds.push({
        name: "Andhi Kundali (Blind Horoscope)",
        type: "Warning",
        desc: "Major struggles in career and early life. Needs specific remedies for Sun and Saturn."
      });
    }

    // 3. Ratandhi Kundali (Night Blind)
    if (inHouse('Sun', 4) && inHouse('Moon', 7)) {
      conds.push({
        name: "Ratandhi Kundali (Night Blind)",
        type: "Warning",
        desc: "Success comes with great difficulty and delay. Relationship with mother or spouse might be strained."
      });
    }

    // 4. Mangal Badh (Afflicted Mars)
    if (together('Mars', 'Saturn') || [4, 8, 12].includes(p.Mars?.house)) {
      conds.push({
        name: "Mangal Baddh (Afflicted Mars)",
        type: "Negative",
        desc: "Obstacles in marriage, property, and siblings. High aggression or suppressed energy issues."
      });
    }

    // 5. Check for Sleeping Planets (Soya Grah) 
    // (Simplified: A planet in a house not aspected by others, mostly focusing on 1, 4, 7, 10 for now)
    const housesOccupied = new Set();
    Object.values(p).forEach(pd => housesOccupied.add(pd.house));
    [1, 4, 7, 10].forEach(h => {
      if (!housesOccupied.has(h)) {
        conds.push({
          name: `Soya Ghar (Sleeping House ${h})`,
          type: "Neutral",
          desc: "This major pivot house is inactive. Its potential can only be unlocked via remedies or specific transit triggers."
        });
      }
    });

    return conds;
  },

  // Varshphal Good/Bad Houses lookup
  VARSHPHAL_RULES: {
    "Sun": { good: [1, 2, 4, 5, 7, 8, 9, 12], bad: [3, 6, 10, 11] },
    "Moon": { good: [1, 4, 5, 6, 7, 9, 10, 11, 12], bad: [2, 3, 8] },
    "Mars": { good: [1, 3, 5, 6, 7, 8, 10, 11], bad: [2, 4, 9, 12] },
    "Mercury": { good: [1, 3, 5, 6, 7, 8, 10, 11], bad: [2, 4, 9, 12] },
    "Jupiter": { good: [1,2,3,5,6,7,8,9,10,11,12], bad: [4] },
    "Venus": { good: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12], bad: [6, 7] },
    "Saturn": { good: [3, 6, 7, 8, 10, 11], bad: [1, 2, 4, 5, 9, 12] },
    "Rahu": { good: [2, 4, 6, 8, 10, 12], bad: [1, 3, 5, 7, 9, 11] },
    "Ketu": { good: [1, 3, 5, 7, 9, 11], bad: [2, 4, 6, 8, 10, 12] }
  },

  get35YearCycle: function(age) {
    const cycleAge = (age % 35) || 35;
    // Standard Lal Kitab 35-Year Cycle durations
    if (cycleAge <= 6) return { planet: "Jupiter", dur: 6 };
    if (cycleAge <= 8) return { planet: "Sun", dur: 2 };
    if (cycleAge <= 9) return { planet: "Moon", dur: 1 };
    if (cycleAge <= 12) return { planet: "Venus", dur: 3 };
    if (cycleAge <= 18) return { planet: "Mars", dur: 6 };
    if (cycleAge <= 20) return { planet: "Mercury", dur: 2 };
    if (cycleAge <= 26) return { planet: "Saturn", dur: 6 };
    if (cycleAge <= 32) return { planet: "Rahu", dur: 6 };
    return { planet: "Ketu", dur: 3 };
  },

  // Main evaluation function
  evaluateChart: function(planets, birthDate) {
    if (!planets) return { analysis: {}, conditions: [], varshphal: null };
    
    // Exclude extras
    const lkPlanets = {};
    Object.keys(planets).forEach(k => {
      if (!['Uranus', 'Neptune', 'Pluto'].includes(k)) lkPlanets[k] = planets[k];
    });

    const conditions = this.evaluateSpecialConditions(lkPlanets);
    const analysis = {}; // Grouped by house number
    
    // Initialize all 12 houses as empty arrays
    for (let i = 1; i <= 12; i++) {
      analysis[i] = [];
    }
    
    Object.keys(lkPlanets).forEach(pName => {
      const pData = lkPlanets[pName];
      if (pData && typeof pData.house === 'number') {
        const h = pData.house;
        if (h >= 1 && h <= 12) {
          const cause = (window.LAL_KITAB_CAUSE[pName] && window.LAL_KITAB_CAUSE[pName][h]) || `Placement of ${pName} in House ${h}.`;
          const rems = (window.LAL_KITAB_REMEDIES[pName] && window.LAL_KITAB_REMEDIES[pName][h]) || ["Worship the respective deity"];
          
          // Determine annual status
          let status = "Neutral";
          if (this.VARSHPHAL_RULES[pName]) {
            if (this.VARSHPHAL_RULES[pName].good.includes(h)) status = "Good";
            if (this.VARSHPHAL_RULES[pName].bad.includes(h)) status = "Bad";
          }

          analysis[h].push({
            planet: pName,
            house: h,
            sign: pData.sign,
            prediction: cause,
            remedies: rems,
            annualStatus: status
          });
        }
      }
    });

    // Varshphal details
    let varshphal = null;
    if (birthDate) {
      const age = new Date().getFullYear() - birthDate.getFullYear();
      varshphal = {
        age: age,
        cycle: this.get35YearCycle(age)
      };
    }

    return { analysis, conditions, varshphal };
  }
};
