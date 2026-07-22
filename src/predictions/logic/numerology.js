/**
 * Numerology Module
 * Implements Lo Shu grid, birth/destiny numbers, lucky colors/numbers, and yearly predictions.
 */

window.NUMEROLOGY = {
  // Reduces any number to a single digit (1-9) except master numbers if needed (but usually Lo Shu focuses on 1-9)
  reduceD: function(num) {
    if (!num) return 0;
    let sum = num;
    while (sum > 9) {
      sum = sum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return sum;
  },

  // Calculate Lo Shu Grid array from date
  buildGrid: function(day, month, year) {
    const grid = {
      4: 0, 9: 0, 2: 0,
      3: 0, 5: 0, 7: 0,
      8: 0, 1: 0, 6: 0
    };
    
    // 1. Raw digits from birth date (DD-MM-YYYY)
    const rawDigits = `${day}${month}${year}`.split('');
    
    // 2. Driver Number (sum of DD)
    const driver = this.reduceD(day);
    
    // 3. Conductor Number (sum of full DOB)
    const conductor = this.reduceD(day + month + year);
    
    // Combine all relevant numbers for plotting
    const allToPlot = [...rawDigits, driver.toString(), conductor.toString()];
    
    allToPlot.forEach(d => {
      const num = parseInt(d);
      if (num > 0 && grid[num] !== undefined) {
        grid[num]++;
      }
    });

    return grid;
  },

  calculateKua: function(year, gender = 'Male') {
    let yearSum = this.reduceD(year);
    if (gender === 'Male') {
      let kua = 11 - yearSum;
      return this.reduceD(kua);
    } else {
      let kua = 4 + yearSum;
      return this.reduceD(kua);
    }
  },

  getPrediction: function(day, month, year) {
    const driver = this.reduceD(day);
    const conductor = this.reduceD(day + month + year);
    const currentYear = new Date().getFullYear();
    const personalYearStr = this.reduceD(day + month + currentYear);
    
    const elements = {
      1: "Water", 2: "Earth", 3: "Wood", 4: "Wood", 5: "Earth", 
      6: "Metal", 7: "Metal", 8: "Earth", 9: "Fire"
    };

    const lucky = {
      1: { col: "Yellow, Gold", num: "1, 2, 3, 9" },
      2: { col: "White, Green", num: "1, 5" },
      3: { col: "Yellow, Red", num: "1, 3, 9" },
      4: { col: "Green, Blue", num: "1, 7" },
      5: { col: "Green, White", num: "1, 5, 6" },
      6: { col: "Blue, White", num: "1, 5, 6, 7" },
      7: { col: "White, Yellow", num: "5, 6, 7" },
      8: { col: "White, Yellow", num: "3, 5, 6" },
      9: { col: "Red, Green", num: "1, 3, 5, 9" }
    };

    const yearlyPreds = {
      1: "New beginnings, seed planting, taking initiative.",
      2: "Patience, partnerships, gathering details.",
      3: "Social expansion, creativity, feeling scattered but joyful.",
      4: "Hard work, building foundations, organizing life.",
      5: "Changes, freedom, unexpected events, travel.",
      6: "Family, responsibility, home matters, healing.",
      7: "Introspection, spiritual growth, study, planning.",
      8: "Material achievements, career focus, financial empowerment.",
      9: "Completions, letting go, humanitarian efforts."
    };

    return {
      driver,
      conductor,
      personalYear: personalYearStr,
      element: elements[driver],
      luckyColors: lucky[driver]?.col || "Varied",
      luckyNumbers: lucky[driver]?.num || "Varied",
      yearlyPrediction: yearlyPreds[personalYearStr] || ""
    };
  }
};
