/**
 * Sudarshan Chakra Dasa (SCD) Engine
 * Based on Sastry Karra's methodology for event timing.
 */

window.SUDARSHAN_CHAKRA = {
  /**
   * Calculates Balance Days for Cycle 1 based on Lagna degree.
   * Formula: (Remaining degrees in Lagna sign / 30) * 365
   */
  calculateBalanceDays: function(lagnaLon) {
    const degInSign = lagnaLon % 30;
    const remaining = 30 - degInSign;
    return (remaining / 30) * 365;
  },

  /**
   * Calculates SCD periods (Mahadasha and Antardasha).
   * MD = 1 House per Year (365 days)
   * AD = 1 House per Month (~30.41 days)
   */
  getSCDPeriods: function(birthDate, lagnaLon, startYear, endYear) {
    const periods = [];
    const balanceDays = this.calculateBalanceDays(lagnaLon);
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Cycle 1, House 1 start=birth, duration=balanceDays
    // Cycle 1, House 2-12 duration=365
    // Cycle 2, House 1-12 duration=365
    
    let currentStart = new Date(birthDate);
    let houseCounter = 0; // 0-indexed house count from birth

    // We generate enough periods to cover the requested range
    // Total houses to generate to reach endYear (roughly)
    const targetAge = endYear - birthDate.getFullYear() + 2; 
    const totalHouses = targetAge * 12; 

    for (let h = 0; h < totalHouses; h++) {
      const isFirstHouse = (h === 0);
      const durationDays = isFirstHouse ? balanceDays : 365;
      const currentEnd = new Date(currentStart.getTime() + durationDays * msPerDay);
      
      const houseNum = (h % 12) + 1;
      const cycleNum = Math.floor(h / 12) + 1;
      const mdYearStart = currentStart.getFullYear();

      // Only store if within requested range
      if (mdYearStart >= startYear && mdYearStart <= endYear) {
        // Divide this MD (year) into 12 ADs (months)
        const adDuration = durationDays / 12;
        for (let m = 0; m < 12; m++) {
          const adStart = new Date(currentStart.getTime() + m * adDuration * msPerDay);
          const adEnd = new Date(currentStart.getTime() + (m + 1) * adDuration * msPerDay);
          const adHouse = ((houseNum - 1 + m) % 12) + 1;

          periods.push({
            cycle: cycleNum,
            mdHouse: houseNum,
            adHouse: adHouse,
            start: adStart,
            end: adEnd,
            isFirstHouse: isFirstHouse
          });
        }
      }

      currentStart = currentEnd;
      if (currentStart.getFullYear() > endYear + 1) break;
    }
    
    return periods;
  },

  /**
   * Analyzes SCD for marriage windows.
   */
  getMarriageWindows: function(birthDate, lagnaLon, startAge, endAge) {
    const marriageHouses = [2, 4, 5, 7, 12];
    const startYear = birthDate.getFullYear() + startAge;
    const endYear = birthDate.getFullYear() + endAge;
    
    const allPeriods = this.getSCDPeriods(birthDate, lagnaLon, startYear, endYear);
    const windows = allPeriods.filter(p => marriageHouses.includes(p.mdHouse) && marriageHouses.includes(p.adHouse));

    // Merge adjacent
    const merged = [];
    if (windows.length > 0) {
      let current = { ...windows[0] };
      for (let i = 1; i < windows.length; i++) {
        const next = windows[i];
        if (Math.abs(next.start - current.end) < 2000 && next.mdHouse === current.mdHouse) {
           current.end = next.end;
        } else {
          merged.push(current);
          current = { ...next };
        }
      }
      merged.push(current);
    }
    return merged;
  }
};
