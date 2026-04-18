/**
 * PREDICTION SYSTEM - Event Forecasting & Dasha Analysis
 * Provides dasha timing, transit events, event forecasting, and optimal remedy dates
 * 
 * Key Functions:
 * - getCurrentDashaInfo()         : Active Mahadasha, Antardasha, Pratyantar, Sukshma, Yogini Dasha
 * - projectDashaTimeline()        : Array of dasha changes in date range
 * - findTransitEventDates()       : Cross-reference transits with natal planets
 * - getPredictionTimeline()       : Combined dasha + transit + yoga for forecasting
 * - suggestOptimalDates()         : Best dates for remedy/action
 * - getEventSummary()             : Upcoming important dates
 */

window.PREDICTION_FORECASTING = {
  
  /**
   * Get current active dasha periods
   * @param {Date} targetDate - Calculate dashas for this date (default: today)
   * @returns {Object} {mahadasha, antardasha, pratyantar, sukshma, yogini}
   */
  getCurrentDashaInfo: function(targetDate = new Date()) {
    if (!window.VIMSH || !window.YOGINI) {
      console.warn('Dasha data not available. Run rebuildDashas() first.');
      return null;
    }
    
    const jd = this.dateToJD(targetDate);
    const vimshotariDasha = this.findActiveDasha(window.VIMSH, jd);
    const yoginiDasha = this.findActiveDasha(window.YOGINI, jd);
    
    return {
      date: targetDate.toISOString().split('T')[0],
      mahadasha: vimshotariDasha?.maha || null,
      antardasha: vimshotariDasha?.ant || null,
      pratyantar: vimshotariDasha?.prat || null,
      sukshma: vimshotariDasha?.suksh || null,
      yogini: yoginiDasha?.maha || null,
      daysRemainingInMD: vimshotariDasha ? Math.round((vimshotariDasha.maha.end - jd)) : null,
      daysRemainingInAD: vimshotariDasha ? Math.round((vimshotariDasha.ant.end - jd)) : null
    };
  },
  
  /**
   * Find active dasha for given Julian Day
   */
  findActiveDasha: function(dashaArray, jd) {
    if (!Array.isArray(dashaArray)) return null;
    
    for (let i = 0; i < dashaArray.length; i++) {
      const d = dashaArray[i];
      if (jd >= d.start && jd <= d.end) {
        return {
          maha: d,
          ant: d.sub && Array.isArray(d.sub) ? d.sub.find(s => jd >= s.start && jd <= s.end) : null,
          prat: null,
          suksh: null
        };
      }
    }
    return null;
  },
  
  /**
   * Project dasha timeline between two dates
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Array} Dasha changes with dates
   */
  projectDashaTimeline: function(startDate, endDate) {
    if (!window.VIMSH) return [];
    
    const startJD = this.dateToJD(startDate);
    const endJD = this.dateToJD(endDate);
    const timeline = [];
    
    window.VIMSH.forEach(maha => {
      if (maha.start <= endJD && maha.end >= startJD) {
        // Mahadasha change
        if (maha.start >= startJD) {
          timeline.push({
            type: 'Mahadasha',
            lord: maha.lord,
            startDate: this.jdToDate(maha.start),
            endDate: this.jdToDate(maha.end),
            durationYears: maha.years,
            significance: 'New Mahadasha begins'
          });
        }
        
        // Antardasha changes within this period
        if (maha.sub && Array.isArray(maha.sub)) {
          maha.sub.forEach(ant => {
            if (ant.start <= endJD && ant.end >= startJD && ant.start >= startJD) {
              timeline.push({
                type: 'Antardasha',
                mahadasha: maha.lord,
                lord: ant.lord,
                startDate: this.jdToDate(ant.start),
                endDate: this.jdToDate(ant.end),
                durationMonths: ant.months,
                significance: `${ant.lord} Antardasha in ${maha.lord} Mahadasha`
              });
            }
          });
        }
      }
    });
    
    return timeline.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  },
  
  /**
   * Find transit event dates in a range
   * Transit events = transiting planet conjunct/opposite/trine to natal planet
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Array} Transit events
   */
  findTransitEventDates: function(startDate, endDate) {
    if (!window.BIRTH_PLANETS) return [];
    
    const events = [];
    const startJD = this.dateToJD(startDate);
    const endJD = this.dateToJD(endDate);
    
    // Important transits to track
    const transitPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Saturn'];
    const transitAspects = [0, 180, 120]; // Conjunction, Opposition, Trine
    const ORB = 2; // Orb for transit aspects
    
    // This is a simplified version - full implementation would require
    // continuous ephemeris calculations for the date range
    
    transitPlanets.forEach(transitPlanet => {
      Object.keys(window.BIRTH_PLANETS).forEach(natalPlanet => {
        const aspect = this.calculateTransitAspect(transitPlanet, natalPlanet, startDate);
        
        if (aspect && aspect.diff <= ORB) {
          events.push({
            type: 'Transit Aspect',
            transitPlanet: transitPlanet,
            natalPlanet: natalPlanet,
            aspect: this.aspectToName(aspect.diff),
            date: startDate.toISOString().split('T')[0],
            strength: Math.max(0, 100 - (aspect.diff * 50)),
            interpretation: this.getTransitInterpretation(transitPlanet, natalPlanet, aspect.diff)
          });
        }
      });
    });
    
    return events;
  },
  
  /**
   * Calculate aspect between transit and natal planet
   */
  calculateTransitAspect: function(transitPlanet, natalPlanet, date) {
    // Requires real ephemeris data - for now, return null
    // In full implementation, use Swift Ephemeris or similar
    return null;
  },
  
  /**
   * Get prediction timeline combining dasha + transit + yoga
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @returns {Array} Merged timeline with predictions
   */
  getPredictionTimeline: function(startDate, endDate) {
    const dashaTimeline = this.projectDashaTimeline(startDate, endDate);
    const transitEvents = this.findTransitEventDates(startDate, endDate);
    
    const combined = [...dashaTimeline, ...transitEvents];
    combined.sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
    
    // Annotate with predictions
    combined.forEach(event => {
      event.prediction = this.predictEventOutcome(event);
    });
    
    return combined;
  },
  
  /**
   * Predict outcome of an event based on dasha lord, transit planet, yoga strength
   */
  predictEventOutcome: function(event) {
    let prediction = 'Neutral period';
    let strength = 'Moderate';
    
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu'];
    
    if (event.type === 'Mahadasha' || event.type === 'Antardasha') {
      const lord = event.lord;
      if (benefics.includes(lord)) {
        prediction = 'Favorable period for new initiatives, expansion, growth';
        strength = 'Strong/Positive';
      } else if (malefics.includes(lord)) {
        prediction = 'Challenging period; focus on stability, defense, spiritual growth';
        strength = 'Strong/Challenging';
      }
    } else if (event.type === 'Transit Aspect') {
      const tPlanet = event.transitPlanet;
      const nPlanet = event.natalPlanet;
      
      // Benefic transit on benefic natal = very favorable
      if (benefics.includes(tPlanet) && benefics.includes(nPlanet)) {
        prediction = 'Highly favorable time for related matters';
        strength = 'Very Strong/Positive';
      }
      // Malefic transit on benefic natal = challenging
      if (malefics.includes(tPlanet) && benefics.includes(nPlanet)) {
        prediction = 'Challenges in related areas; use caution';
        strength = 'Strong/Challenging';
      }
    }
    
    return { prediction, strength };
  },
  
  /**
   * Suggest optimal dates for remedy/action
   * @param {String} action - Type of action ('remedy', 'marriage', 'business', 'travel', 'health')
   * @param {Number} dayLookAhead - How many days ahead to search (default 90)
   * @returns {Array} Suggested dates ranked by favorability
   */
  suggestOptimalDates: function(action = 'remedy', dayLookAhead = 90) {
    const today = new Date();
    const endDate = new Date(today.getTime() + dayLookAhead * 24 * 60 * 60 * 1000);
    const timeline = this.getPredictionTimeline(today, endDate);
    
    const suggestions = [];
    const benefics = ['Jupiter', 'Venus', 'Mercury'];
    
    timeline.forEach(event => {
      let score = 0;
      
      // Favor benefic dasha periods
      if ((event.type === 'Mahadasha' || event.type === 'Antardasha') && benefics.includes(event.lord)) {
        score += 30;
      }
      
      // Favor benefic transit aspects
      if (event.type === 'Transit Aspect' && benefics.includes(event.transitPlanet)) {
        score += 20;
      }
      
      // Action-specific scoring
      if (action === 'remedy') {
        // Best during benefic dasha and waxing Moon (if available)
        score += 10;
      } else if (action === 'business') {
        if (benefics.includes(event.lord) || event.prediction?.includes('growth')) score += 25;
      } else if (action === 'marriage') {
        if (benefics.includes(event.lord)) score += 35;
      }
      
      if (score > 0) {
        suggestions.push({
          date: event.startDate || event.date,
          action: action,
          reason: event.prediction || event.significance,
          favorabilityScore: score,
          dasha: event.mahadasha || event.lord
        });
      }
    });
    
    return suggestions.sort((a, b) => b.favorabilityScore - a.favorabilityScore).slice(0, 5);
  },
  
  /**
   * Get event summary - important dates in next N days
   * @param {Number} days - Number of days ahead (default 30)
   * @returns {Array} Important dates
   */
  getEventSummary: function(days = 30) {
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    const timeline = this.projectDashaTimeline(today, endDate);
    
    return timeline.filter(t => t.startDate === this.dateToString(today) || 
                                 new Date(t.startDate) > today).slice(0, 10);
  },
  
  // ===== HELPER FUNCTIONS =====
  
  /**
   * Convert Date to Julian Day
   */
  dateToJD: function(date) {
    const d = new Date(date);
    const a = Math.floor((14 - (d.getUTCMonth() + 1)) / 12);
    const y = d.getUTCFullYear() + 4800 - a;
    const m = (d.getUTCMonth() + 1) + 12 * a - 3;
    
    const jd = d.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
               Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045 +
               (d.getUTCHours() - 12) / 24 + d.getUTCMinutes() / 1440;
    return jd;
  },
  
  /**
   * Convert Julian Day to Date
   */
  jdToDate: function(jd) {
    const a = Math.floor(jd + 0.5);
    const b = a + 1537;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    return new Date(Date.UTC(year, month - 1, day));
  },
  
  /**
   * Date to string
   */
  dateToString: function(date) {
    return date.toISOString().split('T')[0];
  },
  
  /**
   * Aspect difference to name
   */
  aspectToName: function(diff) {
    if (diff <= 1) return 'Conjunction';
    if (diff <= 2 && diff > 1) return 'Semi-sextile';
    if (diff <= 3 && diff > 2) return 'Quincunx';
    if (diff >= 178 && diff <= 182) return 'Opposition';
    if (diff >= 118 && diff <= 122) return 'Trine';
    return 'Aspect';
  },
  
  /**
   * Get transit interpretation
   */
  getTransitInterpretation: function(transitPlanet, natalPlanet, diff) {
    const interpretations = {
      'Jupiter_Sun_0': 'Success and recognition in career',
      'Jupiter_Moon_0': 'Emotional harmony and family happiness',
      'Saturn_Sun_0': 'Time for responsibility and discipline',
      'Saturn_Moon_0': 'Emotional challenges; focus on stability',
      'Venus_Mars_0': 'Romance, passion, and attraction',
      'Mercury_Jupiter_0': 'Clear thinking and fortunate communications'
    };
    const key = `${transitPlanet}_${natalPlanet}_${Math.round(diff)}`;
    return interpretations[key] || `${transitPlanet} influencing ${natalPlanet}`;
  }
};
