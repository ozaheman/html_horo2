/**
 * Shadbala (Six-fold Strength) Engine
 * Calculates simplified but effective planetary strengths for Vedic predictions.
 */

window.SHADBALA = {
    /**
     * Calculates combined strength of a planet.
     * Returns a score object with components.
     */
    calculate: function(planetName, planets, asc) {
        if (!planets || !planets[planetName]) return { total: 0 };
        
        const p = planets[planetName];
        const ascSn = (asc && asc.sn !== undefined) ? asc.sn : Math.floor(asc / 30);
        
        // 1. Sthana Bala (Positional Strength)
        const sthana = this.calcSthanaBala(planetName, p);
        
        // 2. Dig Bala (Directional Strength)
        const dig = this.calcDigBala(planetName, p.house);
        
        // 3. Naisargika Bala (Natural Strength)
        const naisargika = this.calcNaisargikaBala(planetName);
        
        // 4. Kaala Bala (Temporal - Simplified: Day/Night)
        const kaala = this.calcKaalaBala(planetName, planets.Sun.house >= 7);

        const total = sthana + dig + naisargika + kaala;
        
        return {
            total: total,
            sthana: sthana,
            dig: dig,
            naisargika: naisargika,
            kaala: kaala,
            level: this.getStrengthLevel(total)
        };
    },

    calcSthanaBala: function(pName, p) {
        let score = 0;
        const sign = p.sn;
        
        // Exaltation (simplistic)
        const exaltation = {
            Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6
        };
        if (sign === exaltation[pName]) score += 60;
        
        // Debilitation
        const debilitation = {
            Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0
        };
        if (sign === debilitation[pName]) score -= 30;

        // Own Sign / Mulatrikona
        const lords = {
            0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury',
            6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
        };
        if (lords[sign] === pName) score += 45;

        // Kendra placement (1, 4, 7, 10)
        if ([1, 4, 7, 10].includes(p.house)) score += 30;
        else if ([2, 5, 8, 11].includes(p.house)) score += 15;

        return score;
    },

    calcDigBala: function(pName, house) {
        const digPoints = {
            Jupiter: 1, Mercury: 1, // East (Asc)
            Moon: 4, Venus: 4,      // North (IC)
            Saturn: 7,              // West (Dsc)
            Sun: 10, Mars: 10       // South (MC)
        };
        
        if (digPoints[pName] === house) return 60;
        
        // Opposite house (Minimum Dig Bala)
        const minH = (digPoints[pName] + 6 - 1) % 12 + 1;
        if (minH === house) return 0;

        // Proportional simplified
        return 30; 
    },

    calcNaisargikaBala: function(pName) {
        const order = ['Saturn', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Moon', 'Sun'];
        return (order.indexOf(pName) + 1) * 8.5; // Sun is strongest naturally
    },

    calcKaalaBala: function(pName, isDayBirth) {
        // Sun, Jupiter, Venus are strong in day
        // Moon, Mars, Saturn are strong in night
        // Mercury is always mid
        const dayPlanets = ['Sun', 'Jupiter', 'Venus'];
        const nightPlanets = ['Moon', 'Mars', 'Saturn'];
        
        if (isDayBirth && dayPlanets.includes(pName)) return 60;
        if (!isDayBirth && nightPlanets.includes(pName)) return 60;
        return 30;
    },

    getStrengthLevel: function(score) {
        if (score > 180) return "Very Strong";
        if (score > 140) return "Strong";
        if (score > 100) return "Moderate";
        return "Weak";
    }
};
