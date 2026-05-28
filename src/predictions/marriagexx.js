/**
 * marriage.js 
 * Specialized Module for BNN/Jaimini Marriage Analysis
 * Synthesizes 12-Year Jupiter Cycles, D9 Navamsa Strengths, and Vivaha Saham Transits.
 */

(function() {
    const MARRIAGE_ENGINE = {
        
        /**
         * Calculates the 12-Year Jupiter Cycle markers (BNN Style)
         * Triggers occur when Jupiter transits the 1st, 5th, or 9th from Natal Venus.
         */
        calculateJupiterCycle: function(natalVenusSign, birthDate, birthYear) {
            const trines = [natalVenusSign, (natalVenusSign + 4) % 12, (natalVenusSign + 8) % 12];
            const cycles = [];
            const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
            
            if (typeof window.getPos !== 'function') {
                // Fallback if getPos is somehow not available
                return { trines, trineNames: trines.map(s => SIGNS[s]), cycles: [12, 24, 36, 48, 60, 72].map(age => ({ age, year: birthYear + age })) };
            }

            // Quick scan for the first 84 years (approx 7 Jupiter cycles)
            for (let age = 0; age <= 84; age++) {
                const checkDate = new Date(birthDate);
                checkDate.setFullYear(checkDate.getFullYear() + age);
                const pos = window.getPos(checkDate);
                // Jupiter sign index (sn) check
                if (pos && pos.Jupiter && trines.includes(pos.Jupiter.sn)) {
                    // Avoid double counting same transit window (Jupiter stays ~1 year in a sign)
                    if (cycles.length === 0 || (age - cycles[cycles.length - 1].age) > 3) {
                        cycles.push({ age, year: birthYear + age, sign: SIGNS[pos.Jupiter.sn] });
                    }
                }
            }
            
            return {
                trines: trines,
                trineNames: trines.map(s => SIGNS[s]),
                cycles: cycles
            };
        },

        /**
         * Scans for Vivaha Saham transits (Jupiter/Venus) over a duration.
         */
        scanTransitWindows: async function(sahamDeg, startYear, duration, natalPlanets) {
            const results = [];
            const endYear = startYear + duration;
            const ORB = 3;
            
            const dkInfo = natalPlanets.find(p => p.karaka === 'DK');
            const dkPlanet = dkInfo ? dkInfo.name : null;

            // This logic requires a getPos function that can calculate historical/future positions.
            // If window.getPos exists, we use it.
            if (typeof window.getPos !== 'function') return [];

            let lastJupHit = null, lastVenHit = null;
            let d = new Date(startYear, 0, 1);
            const endDate = new Date(endYear, 11, 31);

            while (d <= endDate) {
                const pos = window.getPos(d);
                if (!pos) { d.setDate(d.getDate() + 3); continue; }

                const jupSid = pos.Jupiter.sid || pos.Jupiter.longitude;
                const venSid = pos.Venus.sid || pos.Venus.longitude;

                const jupClose = Math.min(Math.abs(jupSid - sahamDeg), 360 - Math.abs(jupSid - sahamDeg));
                const venClose = Math.min(Math.abs(venSid - sahamDeg), 360 - Math.abs(venSid - sahamDeg));
                
                let isHit = false;
                let planet = '';
                let dist = 0;

                if (jupClose <= ORB && (!lastJupHit || (d - lastJupHit) > 30 * 864e5)) {
                    isHit = true; planet = 'Jupiter'; dist = jupClose; lastJupHit = new Date(d);
                } else if (venClose <= ORB && (!lastVenHit || (d - lastVenHit) > 20 * 864e5)) {
                    isHit = true; planet = 'Venus'; dist = venClose; lastVenHit = new Date(d);
                }

                if (isHit) {
                    let dkContext = null;
                    if (dkPlanet && pos[dkPlanet]) {
                        const transDK = pos[dkPlanet];
                        const conjs = [];
                        Object.keys(pos).forEach(p => {
                            if (p !== dkPlanet && !['Uranus','Neptune','Pluto'].includes(p)) {
                                if (pos[p].house === transDK.house) conjs.push(p);
                            }
                        });
                        dkContext = { house: transDK.house, sign: transDK.sign, conjs: conjs };
                    }
                    results.push({ date: new Date(d), planet: planet, dist: dist.toFixed(1), dk: dkContext });
                }
                d.setDate(d.getDate() + 3);
            }
            return results;
        },

        /**
         * Analyzes Navamsa (D9) Venus for spouse nature.
         */
        analyzeNavamsaSpouse: function(natalVenusSign, d9VenusSign) {
            const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
            const isVargottama = natalVenusSign === d9VenusSign;
            const signName = SIGNS[d9VenusSign] || "Unknown";
            
            let nature = "Spouse nature evolves over time.";
            if (isVargottama) nature = "<strong>Vargottama:</strong> Exceptional stability and consistency in relationship.";
            else if (d9VenusSign === 1 || d9VenusSign === 6) nature = "Spouse has strong aesthetic sense and refined tastes.";
            else if (d9VenusSign === 3 || d9VenusSign === 11) nature = "Spouse is nurturing and family-oriented.";
            else if (d9VenusSign === 8 || d9VenusSign === 0) nature = "Spouse is wise, traditional, and values-driven.";

            return {
                sign: signName,
                isVargottama: isVargottama,
                description: nature
            };
        }
    };

    if (typeof window !== 'undefined') window.MARRIAGE_ENGINE = MARRIAGE_ENGINE;
})();
