/**
 * navamsha_analysis.js
 * Comprehensive logic for Navamsha (D9) insights, Jaimini Karakas, 
 * Khar Points (64th Navamsha, 22nd Drekkana), and Vish (Poisonous) Navamshas.
 */

/**
 * navamsha_analysis.js
 * Comprehensive logic for Navamsha (D9) insights, Jaimini Karakas, 
 * Khar Points (64th Navamsha, 22nd Drekkana), and Vish (Poisonous) Navamshas.
 */

window.NAVAMSHA_ANALYSIS = {
    getSignLord: function(signIndex) {
        return window.ASTRO_CONSTANTS.SIGN_LORDS[signIndex];
    },

    /**
     * Calculate 7 Charakarakas (AK, AmK etc.)
     */
    calculateKarakas: function(planets) {
        let pArray = [];
        const corePlanets = window.ASTRO_CONSTANTS.PLANETS.slice(0, 7);
        
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
            let akD9 = typeof getVargaData === 'function' ? getVargaData(karakas.AK.totalLon, 9).sign : 0;
            results.KarakamsaSign = window.ASTRO_CONSTANTS.SIGNS[akD9];
        } else {
            results.KarakamsaSign = '-';
        }

        // Arudha & Upapada (Simplified Parashara)
        let lagnaLord = this.getSignLord(ascSign);
        let lagnaLordPos = this.getLordSignPos(lagnaLord, planets);
        let AL_Sign = this.getPadSign(ascSign, lagnaLordPos);
        results.ArudhaLagna = window.ASTRO_CONSTANTS.SIGNS[AL_Sign];

        let twelfthSign = (ascSign + 11) % 12;
        let twelfthLord = this.getSignLord(twelfthSign);
        let twelfthLordPos = this.getLordSignPos(twelfthLord, planets);
        let UL_Sign = this.getPadSign(twelfthSign, twelfthLordPos);
        results.UpapadaLagna = window.ASTRO_CONSTANTS.SIGNS[UL_Sign];

        // 2. Khar Points
        // 64th Navamsha = 210 degrees from Planet
        if (planets.Moon && typeof getVargaData === 'function') {
            let moonLon = planets.Moon.longitude !== undefined ? planets.Moon.longitude : planets.Moon.sid;
            let khar64Lon = (moonLon + 210) % 360;
            let navamsha64th = getVargaData(khar64Lon, 9).sign;
            results.Khar64Lord = this.getSignLord(navamsha64th);
        } else {
            results.Khar64Lord = '-';
        }

        // 64th Navamsha (4th sign from Ascendant's Navamsha sign)
        if (typeof getVargaData === 'function') {
            let khar64AscLon = (ascLon + 210) % 360;
            let navamsha64th_asc = getVargaData(khar64AscLon, 9).sign;
            results.Khar64Lord_Asc = this.getSignLord(navamsha64th_asc);
        } else {
            results.Khar64Lord_Asc = '-';
        }

        // 22nd Drekkana = 210 degrees from Ascendant
        if (typeof getVargaData === 'function') {
            let drekkana22Lon = (ascLon + 210) % 360;
            let drekkana22nd = getVargaData(drekkana22Lon, 3).sign;
            results.Khar22Lord = this.getSignLord(drekkana22nd);
        } else {
            results.Khar22Lord = '-';
        }

        // Step by Step 64th Navamsha Calculation array for all bodies
        results.Khar64_AllBodies = [];
        let rasiMultiplier = 30;
        let navamsaLength = 3.3333333333333;

        let calculate64thNav = (name, totalLon) => {
             let kharPointLon = (totalLon + 210) % 360;
             let signD1 = Math.floor(kharPointLon / rasiMultiplier);
             let degInSign = kharPointLon % rasiMultiplier;
             
             let navIndex = Math.floor(degInSign / navamsaLength);
             
             let startDeg = (signD1 * rasiMultiplier) + (navIndex * navamsaLength);
             let endDeg = startDeg + navamsaLength;
             
             let navamsa64Sign = typeof getVargaData === 'function' ? getVargaData(kharPointLon, 9).sign : 0;

             return {
                 name: name,
                 rasi64: signD1,
                 navamsa64Sign: navamsa64Sign,
                 navamsa64Lord: this.getSignLord(navamsa64Sign),
                 pointLon: parseFloat(kharPointLon.toFixed(4)),
                 startDeg: parseFloat(startDeg.toFixed(4)),
                 endDeg: parseFloat(endDeg.toFixed(4))
             };
        };

        const allBodiesList = window.ASTRO_CONSTANTS.PLANETS;
        results.Khar64_AllBodies.push(calculate64thNav('Lagna', ascLon));
        allBodiesList.forEach(p => {
             if (planets[p]) {
                 let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                 results.Khar64_AllBodies.push(calculate64thNav(p, lon));
             }
        });

        results.DoubleKhar = (results.Khar64Lord !== '-' && results.Khar64Lord === results.Khar22Lord) ? results.Khar64Lord : 'None';

        // 3. Vish (Poisonous) Navamshas
        results.vishPlanets = [];
        
        let nav0_group = [0, 1, 5, 6, 7, 8]; 
        let nav4_group = [2, 4, 10, 11];     
        let nav8_group = [3, 9];             

        allBodiesList.forEach(p => {
            if (planets[p]) {
                let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                let sign = Math.floor(lon / 30);
                let deg = lon % 30;
                let navIndex = Math.floor(deg / (30/9)); 

                let isVish = false;
                if (nav0_group.includes(sign) && navIndex === 0) isVish = true;
                if (nav4_group.includes(sign) && navIndex === 4) isVish = true;
                if (nav8_group.includes(sign) && navIndex === 8) isVish = true;

                if (isVish) {
                    let isSunHora = false;
                    if (typeof getVargaData === 'function') {
                        let hora = getVargaData(lon, 2).sign;
                        if (hora === 4) isSunHora = true;
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
