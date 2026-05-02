/**
 * Lal Kitab Main Evaluator
 */

window.LAL_KITAB = {
  // Main evaluation function
  evaluateChart: function(planets) {
    if (!planets) return [];
    
    // In Lal Kitab, Aries is fixed as the 1st house.
    // However, since we want to give remedies based on the CURRENT house placement 
    // (relative to Lagna), we'll use the dynamically calculated house from planets object.
    
    const results = [];
    Object.keys(planets).forEach(pName => {
      // Exclude Uranus, Neptune, Pluto if present
      if (['Uranus', 'Neptune', 'Pluto'].includes(pName)) return;

      const pData = planets[pName];
      if (pData && typeof pData.house === 'number') {
        const h = pData.house;
        const cause = (window.LAL_KITAB_CAUSE[pName] && window.LAL_KITAB_CAUSE[pName][h]) || `Placement of ${pName} in House ${h}.`;
        const rems = (window.LAL_KITAB_REMEDIES[pName] && window.LAL_KITAB_REMEDIES[pName][h]) || ["Worship the respective deity"];
        
        results.push({
          planet: pName,
          house: h,
          sign: pData.sign,
          prediction: cause,
          remedies: rems
        });
      }
    });

    // Sort by house
    results.sort((a,b) => a.house - b.house);
    return results;
  }
};
