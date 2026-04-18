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

    return {
      year: targetYear,
      age: age,
      varshapraveshJD: midJD,
      asc: varshaAsc,
      planets: varshaPlanets,
      muntha: {
        sn: munthaSn,
        sign: munthaSign,
        house: window.s2h(munthaSn, varshaAsc.sn)
      }
    };
  }
};
