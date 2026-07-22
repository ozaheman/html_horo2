/**
 * graha_maitri.js
 * Engine for calculating Planetary Friendships: Permanent, Temporary, and Five-fold (Panchadha).
 */

window.GRAHA_MAITRI = {
    PLANETS: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    
    // Permanent Friendship definitions as per prompt matrix
    // Row is the reference planet, columns are its relationship towards others
    PERMANENT_FRIENDSHIP: {
        'Sun':      { 'Moon': 'Friend', 'Mars': 'Friend', 'Mercury': 'Neutral', 'Jupiter': 'Friend', 'Venus': 'Enemy',  'Saturn': 'Enemy',  'Rahu': 'Enemy',  'Ketu': 'Enemy' },
        'Moon':     { 'Sun': 'Friend',  'Mars': 'Neutral','Mercury': 'Friend',  'Jupiter': 'Neutral','Venus': 'Neutral','Saturn': 'Neutral','Rahu': 'Enemy',  'Ketu': 'Enemy' },
        'Mars':     { 'Sun': 'Friend',  'Moon': 'Friend', 'Mercury': 'Enemy',   'Jupiter': 'Friend', 'Venus': 'Neutral','Saturn': 'Neutral','Rahu': 'Enemy',  'Ketu': 'Friend' },
        'Mercury':  { 'Sun': 'Friend',  'Moon': 'Enemy',  'Mars': 'Neutral',    'Jupiter': 'Neutral','Venus': 'Friend', 'Saturn': 'Neutral','Rahu': 'Neutral','Ketu': 'Neutral' },
        'Jupiter':  { 'Sun': 'Friend',  'Moon': 'Friend', 'Mars': 'Friend',     'Mercury': 'Enemy',  'Venus': 'Enemy',  'Saturn': 'Neutral','Rahu': 'Neutral','Ketu': 'Neutral' },
        'Venus':    { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Neutral',    'Mercury': 'Friend', 'Jupiter': 'Neutral','Saturn': 'Friend','Rahu': 'Friend', 'Ketu': 'Friend' },
        'Saturn':   { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Enemy',      'Mercury': 'Friend', 'Jupiter': 'Neutral','Venus': 'Friend','Rahu': 'Friend', 'Ketu': 'Enemy' },
        'Rahu':     { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Enemy',      'Mercury': 'Neutral','Jupiter': 'Neutral','Venus': 'Friend','Saturn': 'Friend','Ketu': 'Enemy' },
        'Ketu':     { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Friend',     'Mercury': 'Neutral','Jupiter': 'Neutral','Venus': 'Friend','Saturn': 'Enemy', 'Rahu': 'Enemy' }
    },

    /**
     * Calculates the Temporary Friendship between two planets based on their signs
     * Planets in the 2nd, 3rd, 4th, 10th, 11th, and 12th signs from the given planet are Temporary Friends.
     * Planets in the same sign (1st), or 5th, 6th, 7th, 8th, 9th are Temporary Enemies.
     */
    getTemporaryFriendship: function(planetName, targetName, planetSignCount, targetSignCount) {
        if (planetName === targetName) return '---';
        const dist = (targetSignCount - planetSignCount + 12) % 12 + 1; // 1 to 12
        const friendlyHouses = [2, 3, 4, 10, 11, 12];
        if (friendlyHouses.includes(dist)) {
            return 'Friend';
        } else {
            return 'Enemy';
        }
    },

    /**
     * Calculates Five-Fold (Panchadha) Friendship
     * Friend + Friend = Intimate
     * Friend + Neutral = Friend
     * Neutral + Neutral = Neutral (Wait, Neutral + Enemy = Enemy here)
     * Let's use exact matrix combinations from standard Jyotish:
     * Permanent Friend + Temporary Friend = Intimate (Adhi Mitra)
     * Permanent Friend + Temporary Enemy = Neutral (Sama)
     * Permanent Neutral + Temporary Friend = Friend (Mitra)
     * Permanent Neutral + Temporary Enemy = Enemy (Shatru)
     * Permanent Enemy + Temporary Friend = Neutral (Sama)
     * Permanent Enemy + Temporary Enemy = Bitter Enemy (Adhi Shatru)
     */
    getFiveFoldFriendship: function(permanent, temporary) {
        if (permanent === 'Friend') {
            return temporary === 'Friend' ? 'Intimate' : 'Neutral';
        } else if (permanent === 'Neutral') {
            return temporary === 'Friend' ? 'Friend' : 'Enemy';
        } else if (permanent === 'Enemy') {
            return temporary === 'Friend' ? 'Neutral' : 'Bitter';
        }
        return '---';
    },

    /**
     * Main method to generate all matrices for the UI
     */
    calculateRelationships: function(planets) {
        let signs = {};
        this.PLANETS.forEach(p => {
            if (planets[p]) {
                const lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                signs[p] = Math.floor(lon / 30);
            }
        });

        let results = {};
        
        this.PLANETS.forEach(p1 => {
            if (!signs[p1]) return;
            results[p1] = {};
            this.PLANETS.forEach(p2 => {
                if (p1 === p2 || !signs[p2]) return;
                
                const perm = this.PERMANENT_FRIENDSHIP[p1][p2];
                const temp = this.getTemporaryFriendship(p1, p2, signs[p1], signs[p2]);
                const five = this.getFiveFoldFriendship(perm, temp);
                
                results[p1][p2] = {
                    permanent: perm,
                    temporary: temp,
                    fiveFold: five
                };
            });
        });

        return results;
    }
};
