/**
 * navamsha_analysis.js
 * Comprehensive logic for Navamsha (D9) insights, Jaimini Karakas, 
 * Khar Points (64th Navamsha, 22nd Drekkana), and Vish (Poisonous) Navamshas.
 */

window.NAVAMSHA_ANALYSIS = {
    SIGNS: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
    SIGN_LORDS: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],

    getSignLord: function(signIndex) {
        return this.SIGN_LORDS[signIndex];
    },

    /**
     * Calculate 7 Charakarakas (AK, AmK etc.)
     */
    calculateKarakas: function(planets) {
        let pArray = [];
        const corePlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        
        corePlanets.forEach(p => {
            if (planets[p]) {
                let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                let signDeg = lon % 30;
                pArray.push({ name: p, degree: signDeg, totalLon: lon });
            }
        });

        // Sort descending by degree in sign
        pArray.sort((a, b) => b.degree - a.degree);

        return {
            AK: pArray[0] || null,
            AmK: pArray[1] || null,
            sorted: pArray
        };
    },

    /**
     * Calculate Arudha Lagna (AL) and Upapada Lagna (UL)
     */
    calculateArudha: function(houseIndex, lagnaSign) {
        let houseSign = (lagnaSign + houseIndex) % 12;
        let lord = this.getSignLord(houseSign);
        
        // Find lord's position
        // This requires access to planet pos. 
        // We'll pass it in from main calculate function.
        return { houseSign, lord };
    },

    getLordSignPos: function(lordName, planets) {
        if (!planets[lordName]) return 0;
        let lon = planets[lordName].longitude !== undefined ? planets[lordName].longitude : planets[lordName].sid;
        return Math.floor(lon / 30);
    },

    /**
     * Determine Arudha pad for an initial sign
     */
    getPadSign: function(baseSign, lordSign) {
        let dist = (lordSign - baseSign + 12) % 12;
        let arudhaSign = (lordSign + dist) % 12;
        
        // Parashara Exceptions
        if (dist === 0) { // lord in same house -> 10th from there
            arudhaSign = (baseSign + 9) % 12;
        } else if (dist === 6) { // lord in 7th -> 4th from there
            arudhaSign = (baseSign + 3) % 12;
        }
        
        return arudhaSign;
    },

    /**
     * Poisonous Navamsha Effects 
     */
    VISH_EFFECTS: {
        'Sun': "Issues with authority figures and father. Frequent ego clashes.",
        'Moon': "Negative thinking, deep emotional turbulence, and mental toxicity.",
        'Mars': "Relationship difficulties, aggressive outbursts, and sibling issues.",
        'Mercury': "Impaired communication, nervous anxiety, clouded worldly intelligence.",
        'Jupiter': "Lack of mutual respect with teachers/Gurus, stalled wisdom.",
        'Saturn': "A lifetime of extraordinary hard work, struggle, and slow progress.",
        'Rahu': "Suffering from deep past-life karmic bonds and illusions.",
        'Ketu': "Extreme isolation, detachment struggles, and sudden karmic events."
    },

    calculate: function(planets, ascendant) {
        let results = {};
        
        let ascLon = ascendant.longitude !== undefined ? ascendant.longitude : ascendant.sid;
        let ascSign = Math.floor(ascLon / 30);
        let ascDeg = ascLon % 30;

        // 1. Jaimini Karakas
        let karakas = this.calculateKarakas(planets);
        results.AK = karakas.AK ? karakas.AK.name : '-';
        results.AmK = karakas.AmK ? karakas.AmK.name : '-';
        
        // Karakamsa
        if (karakas.AK) {
            let akSignNum = Math.floor(karakas.AK.totalLon / 30);
            let akD9 = window.getVargaSign ? window.getVargaSign(karakas.AK.degree, akSignNum, "D9-Navamsa") : 1;
            results.KarakamsaSign = this.SIGNS[(akD9 - 1) % 12];
        } else {
            results.KarakamsaSign = '-';
        }

        // Arudha & Upapada (Simplified Parashara)
        let lagnaLord = this.getSignLord(ascSign);
        let lagnaLordPos = this.getLordSignPos(lagnaLord, planets);
        let AL_Sign = this.getPadSign(ascSign, lagnaLordPos);
        results.ArudhaLagna = this.SIGNS[AL_Sign];

        let twelfthSign = (ascSign + 11) % 12;
        let twelfthLord = this.getSignLord(twelfthSign);
        let twelfthLordPos = this.getLordSignPos(twelfthLord, planets);
        let UL_Sign = this.getPadSign(twelfthSign, twelfthLordPos);
        results.UpapadaLagna = this.SIGNS[UL_Sign];

        // 2. Khar Points
        // 64th Navamsha (4th sign from Moon's Navamsha sign)
        if (planets.Moon && window.getVargaSign) {
            let moonLon = planets.Moon.longitude !== undefined ? planets.Moon.longitude : planets.Moon.sid;
            let moonD9 = window.getVargaSign(moonLon % 30, Math.floor(moonLon / 30), "D9-Navamsa");
            let navamsha64th = (moonD9 - 1 + 3) % 12; // 4th sign (index + 3)
            results.Khar64Lord = this.getSignLord(navamsha64th);
        } else {
            results.Khar64Lord = '-';
        }

        // 22nd Drekkana (8th sign from Lagna's D3 sign)
        if (window.getVargaSign) {
            let lagnaD3 = window.getVargaSign(ascDeg, ascSign, "D3-Dreshkana");
            let drekkana22nd = (lagnaD3 - 1 + 7) % 12; // 8th sign (index + 7)
            results.Khar22Lord = this.getSignLord(drekkana22nd);
        } else {
            results.Khar22Lord = '-';
        }

        results.DoubleKhar = (results.Khar64Lord !== '-' && results.Khar64Lord === results.Khar22Lord) ? results.Khar64Lord : 'None';

        // 3. Vish (Poisonous) Navamshas
        results.vishPlanets = [];
        
        let groupA = [0, 1, 5, 8]; // Aries, Taurus, Virgo, Sagittarius
        let groupB = [2, 4, 6, 10]; // Gemini, Leo, Libra, Aquarius
        let groupC = [3, 7, 9, 11]; // Cancer, Scorpio, Capricorn, Pisces

        let allPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        allPlanets.forEach(p => {
            if (planets[p]) {
                let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                let sign = Math.floor(lon / 30);
                let deg = lon % 30;
                let navIndex = Math.floor(deg / (30/9)); // 0 to 8

                let isVish = false;
                if (groupA.includes(sign) && navIndex === 0) isVish = true;
                if (groupB.includes(sign) && navIndex === 4) isVish = true;
                if (groupC.includes(sign) && navIndex === 8) isVish = true;

                if (isVish) {
                    // Check if in Sun's Hora (Leo = 5)
                    let isSunHora = false;
                    if (window.getVargaSign) {
                        let hora = window.getVargaSign(deg, sign, "D2-Hora");
                        if (hora === 5) isSunHora = true;
                    }

                    results.vishPlanets.push({
                        name: p,
                        sunHora: isSunHora,
                        effect: this.VISH_EFFECTS[p] || 'Faces deep hurdles in related significations.'
                    });
                }
            }
        });

        return results;
    }
};
