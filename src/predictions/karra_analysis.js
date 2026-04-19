/**
 * Sastry Karra specialized prediction methods
 */

window.KARRA_ANALYSIS = {
  /**
   * Career Analysis
   * 1. Identify "Planet at Time of Birth" (Lagna or Moon Nakshatra ruler)
   * 2. Check its position (10th, 11th) and strength
   */
  getCareerPromise: function(planets, asc, nakshatras) {
    if (!planets || !asc || !nakshatras) return null;

    // Method A: Lagna Nakshatra Ruler
    const lagnaNak = nakshatras.Ascendant;
    const planetAtBirth = lagnaNak ? lagnaNak.lord : null;

    if (!planetAtBirth) return "Could not determine planet at birth.";

    const pPos = planets[planetAtBirth];
    if (!pPos) return `Planet at birth ${planetAtBirth} not found in chart.`;

    let score = 0;
    let details = [];

    // House placement
    if (pPos.house === 10) {
      score += 40;
      details.push(`Planet at birth (${planetAtBirth}) is in the 10th house (Karma Sthana) - Excellent for career.`);
    } else if (pPos.house === 11) {
      score += 30;
      details.push(`Planet at birth (${planetAtBirth}) is in the 11th house (Labha Sthana) - Indicates gains and recognition.`);
    } else if ([1, 4, 7].includes(pPos.house)) {
      score += 20;
      details.push(`Planet at birth (${planetAtBirth}) is in a Kendra house - Strong foundation.`);
    }

    // Dignity
    // Note: Dignity info would come from the planets object if calculated
    if (pPos.isExalted) {
      score += 30;
      details.push(`${planetAtBirth} is Exalted - Exceptional power.`);
    } else if (pPos.isOwnSign) {
      score += 20;
      details.push(`${planetAtBirth} is in its Own Sign - Natural strength.`);
    }

    // Association with 10th Lord
    const l10 = planets.L10; // Assuming L10 is identified in the engine
    if (l10 && (pPos.conjunctions?.includes(l10.name) || pPos.aspects?.includes(l10.name))) {
       score += 20;
       details.push(`Connected with the 10th Lord - Strong professional link.`);
    }

    let conclusion = "";
    if (score >= 60) conclusion = "Extremely successful career promised.";
    else if (score >= 40) conclusion = "Likely to have a strong and steady career.";
    else conclusion = "Average career potential; focus on hard work.";

    return {
      planetAtBirth: planetAtBirth,
      score: score,
      details: details,
      conclusion: conclusion
    };
  },

  /**
   * Marriage Timing Prediction using SCD
   */
  getMarriageTiming: function(birthDate, natalLagnaSn, currentAge) {
    if (!window.SUDARSHAN_CHAKRA) return "Sudarshan Chakra engine not loaded.";
    
    // Check Cycle 3 (approx age 24 to 36)
    const windows = window.SUDARSHAN_CHAKRA.getMarriageWindows(birthDate, natalLagnaSn, currentAge, currentAge + 5);
    
    return {
      title: "Marriage Timing Analysis (Sudarshan Chakra Method)",
      windows: windows.map(w => ({
          period: `${w.start.toDateString()} to ${w.end.toDateString()}`,
          houses: `MD House: ${w.mdHouse}, AD House: ${w.adHouse}`,
          interpretation: "Confluence of marriage houses in SCD."
      }))
    };
  }
};
