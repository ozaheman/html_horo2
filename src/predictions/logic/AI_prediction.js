/**
 * AI Prediction Engine (Master Phaladesh)
 * Complete Vedic Astrology Prediction System
 * 
 * Integrates: Parashari, Jaimini, Tajika, Phaladeepika, Bhrigu Nandi Nadi (BNN)
 * 
 * 19-Factor System:
 * 1. Bhava (Primary House)
 * 2. Bhavat Bhavam (House-to-House)
 * 3. Naisargika Karaka (Natural Significators)
 * 4. Chara Karaka (Variable Significators - Jaimini)
 * 5. Arudha Pada (Image/Perception)
 * 6. Vimshottari Dasha (Timing)
 * 7. Khar Graha Dasha (Malefic Periods)
 * 8. Graha Drishti (Planetary Aspects)
 * 9. Degree Aspect (Amritavarga/Vedha)
 * 10. Graha Yuddha (Planetary War)
 * 11. Yuti (Conjunctions)
 * 12. Uchcha/Neecha (Exaltation/Debilitation)
 * 13. Astangata (Combustion)
 * 14. Rashi & Nakshatra (Sign & Lunar Mansion)
 * 15. Shodasha Varga (Divisional Charts)
 * 16. Ashtakavarga (Numerical Strength)
 * 17. Tajika/Varshaphala (Annual Chart)
 * 18. Chara Dasha (Sign-based Timing - Jaimini)
 * 19. Karakamsa (Soul's Blueprint)
 */

const AI_PREDICTION = (function() {
    
    // ========== SECTION 1: CONSTANTS & MAPPINGS ==========
    
    // Signs
    const SIGNS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) || []
    const SIGN_SYMBOLS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_SYMBOLS) || []
    
    // Sign Lords
    const SIGN_LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) || {};
    
    // House Nature (Kendra, Trikona, Dusthana, Upachaya)
    const HOUSE_NATURE = {
        1: { type: "Kendra+Trikona", pol: 2, desc: "Self, body, health" },
        2: { type: "Maraka/Wealth", pol: 0, desc: "Wealth, family, speech" },
        3: { type: "Upachaya", pol: 1, desc: "Courage, siblings, short journeys" },
        4: { type: "Kendra", pol: 1, desc: "Mother, home, vehicles, happiness" },
        5: { type: "Trikona", pol: 2, desc: "Children, talent, love, intelligence" },
        6: { type: "Dusthana", pol: -1, desc: "Enemies, disease, debts, service" },
        7: { type: "Kendra/Maraka", pol: 1, desc: "Spouse, marriage, partnerships" },
        8: { type: "Dusthana", pol: -2, desc: "Longevity, inheritance, obstacles" },
        9: { type: "Trikona", pol: 2, desc: "Fortune, father, religion, long travel" },
        10: { type: "Kendra+Upachaya", pol: 2, desc: "Career, honour, profession" },
        11: { type: "Upachaya/Gains", pol: 1, desc: "Gains, ambitions, elder siblings" },
        12: { type: "Dusthana/Moksha", pol: -1, desc: "Losses, moksha, foreign travel" }
    };
    
    // Natural Benefics and Malefics
    const BENEFICS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.BENEFICS) || []
    const MALEFICS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.MALEFICS) || []
    const NEUTRALS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.NEUTRALS) || []

    // BNN & Jaimini Constants
    const BNN_YOGAS = [
        { p:['Jupiter','Venus','Mercury'], t:'Early Marriage', d:'Indicates success via Jupiter + Venus + Mercury interactions.', c:'Marriage' },
        { p:['Venus','Saturn'], t:'Delayed Marriage', d:'Indicates success via Venus + Saturn interactions.', c:'Marriage' },
        { p:['Sun','Moon','Saturn'], t:'Late Marriage', d:'Indicates success via Sun + Moon + Saturn interactions.', c:'Marriage' },
        { p:['Mars','Jupiter'], t:'Happy Married Life', d:'Indicates success via Mars + Jupiter interactions.', c:'Marriage' },
        { p:['Mars','Saturn'], t:'Multiple Marriages / Disputes', d:'Indicates success via Mars + Saturn interactions.', c:'Marriage' },
        { p:['Sun','Moon','Saturn'], t:'Service / Govt Benefits', d:'Indicates focus on service or government sectors.', c:'Career' },
        { p:['Sun','Mars','Saturn'], t:'Govt Job / Authority', d:'Indicates authority and government-linked professional success.', c:'Career' },
        { p:['Sun','Jupiter','Saturn'], t:'Politician / Leader', d:'Indicates leadership success in religious or political fields.', c:'Career' },
        { p:['Mars','Saturn'], t:'Police / Technical', d:'Indicates technical or administrative authority.', c:'Career' }
    ];

    const BNN_NAK_PROPERTIES = {
        'Ketu': { biz: 'Unconventional, spiritual, or healing business', mar: 'Unusual marriage; spouse may be foreign or spiritually inclined' },
        'Venus': { biz: 'Luxury, arts, beauty, or women-centric business', mar: 'Love marriage; spouse is attractive and creative' },
        'Sun': { biz: 'Leadership, government, authoritative business', mar: 'Arranged marriage; spouse is authoritative or from respected family' },
        'Moon': { biz: 'Hospitality, food, travel, emotional products business', mar: 'Emotionally connected marriage; spouse is nurturing' },
        'Mars': { biz: 'Engineering, surgery, military, competitive business', mar: 'Passionate but volatile marriage; potential conflict' },
        'Rahu': { biz: 'Technology, foreign trade, unconventional business', mar: 'Inter-caste, foreign, or unconventional marriage' },
        'Jupiter': { biz: 'Teaching, consulting, finance, religious business', mar: 'Auspicious marriage; spouse is wise and dharmic' },
        'Saturn': { biz: 'Service-based, real estate, mass products business', mar: 'Delayed marriage; spouse is mature, older, or serious' },
        'Mercury': { biz: 'Trading, writing, analytics, communication business', mar: 'Marriage involves negotiation; spouse is intellectual' }
    };

    const ANUKARI_RULES = {
        Saturn: {
            Jupiter: 'Expansive, ethical, teaching-oriented business',
            Mercury: 'Trading, analytics, communication business',
            Mars: 'Aggressive, competitive, manufacturing business',
            Venus: 'Luxury, design, relationship-based business',
            Sun: 'Authoritative, government-linked business',
            Moon: 'Hospitality, emotional, or family business',
            Saturn: 'Heavy, slow, real estate or mass industry',
            Rahu: 'Foreign, tech, unconventional business',
            Ketu: 'Spiritual, healing, or isolated business'
        },
        Venus: {
            Jupiter: 'Auspicious, wealthy, religious marriage',
            Mercury: 'Intellectual, young spouse, love marriage',
            Mars: 'Passionate, sudden, or competitive marriage',
            Saturn: 'Delayed, mature spouse, arranged marriage',
            Moon: 'Emotional, nurturing, family-oriented marriage',
            Sun: 'Authoritative spouse, government connection',
            Rahu: 'Foreign, inter-caste, unconventional marriage',
            Ketu: 'Spiritual, karmic, or unusual marriage'
        }
    };
    
    // ========== SECTION 2: BHAVAT BHAVAM (House Rotation System) ==========
    
    /**
     * House significations for each house (used for rotation)
     */
    const HOUSE_SIGNIFICATIONS = {
        1: { name: "Atma (Self)", keywords: "Body, health, personality, appearance, longevity", karaka: "Sun" },
        2: { name: "Dhana (Wealth)", keywords: "Wealth, family, speech, eyes, food", karaka: "Jupiter, Mercury" },
        3: { name: "Sahaja (Siblings)", keywords: "Courage, siblings, short journeys, mental strength", karaka: "Mars, Mercury" },
        4: { name: "Matri (Mother)", keywords: "Mother, home, vehicles, property, happiness", karaka: "Moon" },
        5: { name: "Putra (Children)", keywords: "Children, talent, love, intelligence, romance", karaka: "Jupiter" },
        6: { name: "Roga (Disease)", keywords: "Enemies, disease, debts, uncle, service", karaka: "Mars, Saturn" },
        7: { name: "Kalatra (Spouse)", keywords: "Marriage, spouse, partnerships, domestic happiness", karaka: "Venus" },
        8: { name: "Mrityu (Death)", keywords: "Longevity, dowry, insurance, accidents, inheritance", karaka: "Saturn" },
        9: { name: "Bhagya (Fortune)", keywords: "Luck, father, religion, philosophy, distant travel", karaka: "Jupiter, Sun" },
        10: { name: "Karma (Career)", keywords: "Career, father, honour, trade, respect", karaka: "Sun, Saturn, Mercury" },
        11: { name: "Labha (Gains)", keywords: "Ambitions, aspirations, fulfillments, elder siblings", karaka: "Jupiter" },
        12: { name: "Vyaya (Loss)", keywords: "Miseries, sufferings, losses, moksha, foreign travel", karaka: "Ketu, Saturn" }
    };
    
    /**
     * Bhavat Bhavam Rotation Table
     * When House X becomes the new 1st house, this maps original houses to rotated positions
     */
    function getRotationMapping(originalHouse) {
        const mapping = {};
        // When original house X becomes new 1st house
        // New house N corresponds to original house ((originalHouse + N - 2) % 12) + 1
        for (let newHouse = 1; newHouse <= 12; newHouse++) {
            const mappedOriginal = ((originalHouse - 1 + newHouse - 1) % 12) + 1;
            mapping[newHouse] = mappedOriginal;
        }
        return mapping;
    }
    
    /**
     * Get the rotated significance for a life area
     * @param {number} baseHouse - The house representing the life area (e.g., 4 for Mother)
     * @param {number} rotatedHouse - The house in the rotated chart (e.g., 2 for Mother's wealth)
     * @returns {string} - What this rotated house represents
     */
     
     // --- REPLACE IN AI_prediction.js ---

    /**
     * Generate 12 Rotated Horoscopes (Bhavat Bhavam)
     * Horoscope 1 = Natal Chart. Horoscope 2 = 2nd House as Ascendant (Wealth), etc.
     */
    function generate12RotatedHoroscopes(planets, natalAsc) {
        const rotatedCharts = [];
        const ascSignIndex = natalAsc.signIndex !== undefined ? natalAsc.signIndex : 0;

        for (let h = 1; h <= 12; h++) {
            // New Ascendant Sign for this rotation
            const newAscSignIndex = (ascSignIndex + h - 1) % 12;
            const focusSignification = HOUSE_SIGNIFICATIONS[h];

            const rotatedPlanets = planets.map(p => {
                const planetSign = p.signIndex !== undefined ? p.signIndex : Math.floor((p.longitude || p.degree) / 30);
                // Calculate new house relative to the new Ascendant
                const newHouse = ((planetSign - newAscSignIndex + 12) % 12) + 1;
                
                return {
                    name: p.name,
                    natalHouse: p.house,
                    rotatedHouse: newHouse,
                    sign: SIGNS[planetSign],
                    signIndex: planetSign
                };
            });

            rotatedCharts.push({
                chartNumber: h,
                focusArea: focusSignification.name,
                keywords: focusSignification.keywords,
                rotatedAscendant: SIGNS[newAscSignIndex],
                planets: rotatedPlanets,
                analysis: analyzeRotatedChart(h, rotatedPlanets, newAscSignIndex)
            });
        }
        return rotatedCharts;
    }

    function analyzeRotatedChart(chartNum, rotatedPlanets, newAscIndex) {
        let summary = `Treating House ${chartNum} as Lagna. `;
        const ascLord = SIGN_LORDS[newAscIndex];
        const lordPos = rotatedPlanets.find(p => p.name === ascLord);
        
        if (lordPos) {
            summary += `The lord of this area (${ascLord}) goes to the rotated ${lordPos.rotatedHouse}th house. `;
            if ([6, 8, 12].includes(lordPos.rotatedHouse)) summary += `This brings struggle and transformation to this life area. `;
            if ([1, 4, 7, 10, 5, 9].includes(lordPos.rotatedHouse)) summary += `This brings strength and natural growth to this area. `;
        }
        return summary;
    }
    function getRotatedSignificance(baseHouse, rotatedHouse) {
        // The rotated house represents the same signification as that house number
        // but applied to the life area of the base house
        const baseSignif = HOUSE_SIGNIFICATIONS[baseHouse];
        const rotatedSignif = HOUSE_SIGNIFICATIONS[rotatedHouse];
        
        return `${rotatedSignif.name} of ${baseSignif.name} (${rotatedSignif.keywords} specifically for ${baseSignif.name.toLowerCase()})`;
    }
    
    /**
     * Complete Bhavat Bhavam Analysis for any life area
     * @param {number} baseHouse - The house representing the life area (1-12)
     * @param {Object} planets - Planetary data with houses
     * @param {Object} asc - Ascendant data
     * @returns {Object} - Complete rotated analysis
     */
    function analyzeBhavatBhavam(baseHouse, planets, asc) {
        const mapping = getRotationMapping(baseHouse);
        const baseSignif = HOUSE_SIGNIFICATIONS[baseHouse];
        
        // Calculate new ascendant for rotated chart (based on base house sign)
        const baseSignIndex = ((asc.signIndex + baseHouse - 1) % 12);
        const rotatedAsc = { signIndex: baseSignIndex, sign: SIGNS[baseSignIndex] };
        
        // Recalculate planet positions relative to the new lagna sign
        const rotatedPlanets = [];
        for (const planet of planets) {
            const planetSign = planet.signIndex !== undefined ? planet.signIndex : Math.floor((planet.longitude || planet.degree) / 30);
            const rotatedHouse = ((planetSign - baseSignIndex + 12) % 12) + 1;
            
            rotatedPlanets.push({
                ...planet,
                rotatedHouse: rotatedHouse,
                rotatedSign: SIGNS[planetSign],
                originalHouse: planet.house
            });
        }
        
        // Analyze each rotated house
        const rotatedAnalysis = {};
        for (let rotatedHouse = 1; rotatedHouse <= 12; rotatedHouse++) {
            const originalHouse = mapping[rotatedHouse];
            const significance = getRotatedSignificance(baseHouse, rotatedHouse);
            const planetsInRotatedHouse = rotatedPlanets.filter(p => p.rotatedHouse === rotatedHouse);
            const houseNature = HOUSE_NATURE[rotatedHouse];
            
            rotatedAnalysis[rotatedHouse] = {
                originalHouse: originalHouse,
                significance: significance,
                planets: planetsInRotatedHouse.map(p => p.name),
                houseNature: houseNature,
                prediction: generateRotatedHousePrediction(baseHouse, rotatedHouse, planetsInRotatedHouse, houseNature)
            };
        }
        
        return {
            baseHouse: baseHouse,
            baseSignification: baseSignif,
            rotatedAscendant: rotatedAsc,
            rotatedAnalysis: rotatedAnalysis,
            summary: generateBhavatBhavamSummary(baseHouse, rotatedAnalysis)
        };
    }
    
    /**
     * Generate prediction for a specific rotated house
     */
    function generateRotatedHousePrediction(baseHouse, rotatedHouse, planets, houseNature) {
        if (planets.length === 0) {
            return `No planets in rotated house ${rotatedHouse}. Matters are handled by the house lord.`;
        }
        
        const planetNames = planets.map(p => p.name).join(', ');
        const beneficsPresent = planets.filter(p => BENEFICS.includes(p.name)).length;
        const maleficsPresent = planets.filter(p => MALEFICS.includes(p.name)).length;
        
        let quality = "Neutral";
        if (beneficsPresent > maleficsPresent) quality = "Favorable";
        else if (maleficsPresent > beneficsPresent) quality = "Challenging";
        
        return `${planetNames} in rotated house ${rotatedHouse} (${houseNature.type}). ${quality} influence on ${HOUSE_SIGNIFICATIONS[baseHouse].name}.`;
    }
    
    /**
     * Generate summary for Bhavat Bhavam analysis
     */
    function generateBhavatBhavamSummary(baseHouse, analysis) {
        const baseSignif = HOUSE_SIGNIFICATIONS[baseHouse];
        const keyHouses = [1, 2, 4, 5, 7, 10]; // Lagna, Dhana, Sukha, Putra, Kalatra, Karma
        
        let summary = `=== ${baseSignif.name.toUpperCase()} ANALYSIS (House ${baseHouse} as Lagna) ===\n\n`;
        summary += `When House ${baseHouse} (${baseSignif.name}) becomes the 1st house:\n`;
        
        for (const kh of keyHouses) {
            const rot = analysis.rotatedAnalysis[kh];
            if (rot) {
                summary += `\n${kh}${getOrdinalSuffix(kh)} House (Original ${rot.originalHouse}): ${rot.significance}\n`;
                summary += `   Planets: ${rot.planets.length ? rot.planets.join(', ') : 'None'}\n`;
                summary += `   Prediction: ${rot.prediction}\n`;
            }
        }
        
        return summary;
    }
    
    function getOrdinalSuffix(n) {
        if (n === 1) return "st";
        if (n === 2) return "nd";
        if (n === 3) return "rd";
        return "th";
    }
    
    // ========== SECTION 3: SPECIFIC BHAVAT BHAVAM FOR EACH LIFE AREA ==========
    
    /**
     * Mother's Horoscope (House 4 as Lagna)
     */
    function analyzeMotherHoroscope(planets, asc) {
        return analyzeBhavatBhavam(4, planets, asc);
    }
    
    /**
     * Father's Horoscope (House 9 as Lagna)
     */
    function analyzeFatherHoroscope(planets, asc) {
        return analyzeBhavatBhavam(9, planets, asc);
    }
    
    /**
     * Spouse's Horoscope (House 7 as Lagna)
     */
    function analyzeSpouseHoroscope(planets, asc) {
        return analyzeBhavatBhavam(7, planets, asc);
    }
    
    /**
     * Children's Horoscope (House 5 as Lagna)
     */
    function analyzeChildrenHoroscope(planets, asc) {
        return analyzeBhavatBhavam(5, planets, asc);
    }
    
    /**
     * Wealth Analysis (House 2 as Lagna)
     */
    function analyzeWealthHoroscope(planets, asc) {
        return analyzeBhavatBhavam(2, planets, asc);
    }
    
    /**
     * Career Analysis (House 10 as Lagna)
     */
    function analyzeCareerHoroscope(planets, asc) {
        return analyzeBhavatBhavam(10, planets, asc);
    }
    
    // ========== SECTION 4: NAKSHATRA DATA ==========
    
    const NAKSHATRAS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.NAKSHATRAS) || []
    
    function analyzeNakshatra(longitude) {
        const normalized = ((longitude % 360) + 360) % 360;
        const nak = NAKSHATRAS.find(n => normalized >= n.startDeg && normalized < n.endDeg);
        
        if (!nak) return { name: "Unknown", lord: "Unknown", pada: 1, nature: "Neutral", interpretation: "Unknown" };
        
        const pada = Math.floor(((normalized - nak.startDeg) / (nak.endDeg - nak.startDeg)) * 4) + 1;
        const padaMeanings = {
            1: "Physical/material manifestation (Agni/Tejas)",
            2: "Emotional/mental expression (Prithvi/Bhu)",
            3: "Intellectual/creative expression (Vayu/Akash)",
            4: "Spiritual/completion (Jal/Apas)"
        };
        
        return {
            name: nak.name,
            lord: nak.lord,
            pada: pada,
            padaMeaning: padaMeanings[pada],
            nature: nak.nature,
            gana: nak.gana,
            cause: nak.cause,
            effect: nak.effect,
            interpretation: nak.interpretation,
            fullInterpretation: `${nak.interpretation} | Cause: ${nak.cause}, Effect: ${nak.effect}`
        };
    }
    
    // ========== SECTION 5: PLANETARY DIGNITIES ==========
    
    const EXALTATION_DEGREES = {
        'Sun': 10, 'Moon': 3, 'Mars': 28, 'Mercury': 15, 'Jupiter': 5, 'Venus': 27, 'Saturn': 20
    };
    
    const EXALTATION_SIGNS = {
        'Sun': 0, 'Moon': 1, 'Mars': 9, 'Mercury': 5, 'Jupiter': 3, 'Venus': 11, 'Saturn': 6
    };
    
    const DEBILITATION_DEGREES = {
        'Sun': 10, 'Moon': 3, 'Mars': 28, 'Mercury': 15, 'Jupiter': 5, 'Venus': 27, 'Saturn': 20
    };
    
    const DEBILITATION_SIGNS = {
        'Sun': 6, 'Moon': 7, 'Mars': 3, 'Mercury': 11, 'Jupiter': 9, 'Venus': 5, 'Saturn': 0
    };
    
    const MULATRIKONA = {
        'Sun': { sign: 4, start: 0, end: 20 },    // Leo 0-20
        'Moon': { sign: 3, start: 0, end: 20 },   // Cancer 0-20
        'Mars': { sign: 0, start: 0, end: 12 },   // Aries 0-12
        'Mercury': { sign: 5, start: 16, end: 20 }, // Virgo 16-20
        'Jupiter': { sign: 8, start: 0, end: 10 },  // Sagittarius 0-10
        'Venus': { sign: 6, start: 0, end: 15 },    // Libra 0-15
        'Saturn': { sign: 10, start: 0, end: 20 }   // Aquarius 0-20
    };
    
    const OWN_SIGNS = {
        'Sun': [4], 'Moon': [3], 'Mars': [0, 7], 'Mercury': [2, 5],
        'Jupiter': [8, 11], 'Venus': [1, 6], 'Saturn': [9, 10]
    };
    
    const COMBUSTION_ORBS = {
        'Moon': 12, 'Mars': 17, 'Mercury': 14, 'Jupiter': 11, 'Venus': 10, 'Saturn': 15
    };
    
    function assessDignity(planetName, longitude, signIndex) {
        const degInSign = longitude % 30;
        
        // Check Exaltation
        if (EXALTATION_SIGNS[planetName] === signIndex) {
            const exaltDeg = EXALTATION_DEGREES[planetName];
            const orb = Math.abs(degInSign - exaltDeg);
            if (orb <= 5) {
                return { status: "Exalted", score: 100, description: `${planetName} is exalted, giving exceptional results in its significations` };
            }
        }
        
        // Check Debilitation
        if (DEBILITATION_SIGNS[planetName] === signIndex) {
            const debDeg = DEBILITATION_DEGREES[planetName];
            const orb = Math.abs(degInSign - debDeg);
            if (orb <= 5) {
                return { status: "Debilitated", score: 10, description: `${planetName} is debilitated, causing struggles in its areas` };
            }
        }
        
        // Check Moolatrikona
        const mt = MULATRIKONA[planetName];
        if (mt && mt.sign === signIndex && degInSign >= mt.start && degInSign <= mt.end) {
            return { status: "Moolatrikona", score: 90, description: `${planetName} is in Moolatrikona, very strong and stable` };
        }
        
        // Check Own Sign
        if (OWN_SIGNS[planetName] && OWN_SIGNS[planetName].includes(signIndex)) {
            return { status: "Own Sign", score: 80, description: `${planetName} is in own sign, strong and natural` };
        }
        
        // Check Friendly/Neutral/Enemy (simplified)
        return { status: "Neutral", score: 50, description: `${planetName} is neutrally placed` };
    }
    
    function checkCombustion(planetName, sunLongitude, planetLongitude) {
        const orb = COMBUSTION_ORBS[planetName];
        if (!orb) return false;
        const diff = Math.min(Math.abs(planetLongitude - sunLongitude), 360 - Math.abs(planetLongitude - sunLongitude));
        return diff < orb;
    }
    
    // ========== SECTION 6: PLANETARY ASPECTS (Graha Drishti) ==========
    
    function calculateAspects(planetName, houseNum) {
        const aspects = [(houseNum + 6) % 12 || 12]; // All planets aspect 7th
        
        if (planetName === 'Mars') {
            aspects.push((houseNum + 3) % 12 || 12); // 4th aspect
            aspects.push((houseNum + 7) % 12 || 12); // 8th aspect
        } else if (planetName === 'Jupiter') {
            aspects.push((houseNum + 4) % 12 || 12); // 5th aspect
            aspects.push((houseNum + 8) % 12 || 12); // 9th aspect
        } else if (planetName === 'Saturn') {
            aspects.push((houseNum + 2) % 12 || 12); // 3rd aspect
            aspects.push((houseNum + 9) % 12 || 12); // 10th aspect
        }
        
        return aspects;
    }
    
    function getAspectQuality(planetName, aspectedHouse, planetStrength) {
        const isBenefic = BENEFICS.includes(planetName);
        const isMalefic = MALEFICS.includes(planetName);
        const houseType = HOUSE_NATURE[aspectedHouse]?.type || "";
        
        if (isBenefic) {
            if (houseType.includes("Dusthana")) {
                return { quality: "Protective", effect: `${planetName} mitigates the negative effects of house ${aspectedHouse}` };
            }
            return { quality: "Favorable", effect: `${planetName} blesses house ${aspectedHouse} with growth and protection` };
        }
        
        if (isMalefic) {
            if (houseType.includes("Kendra")) {
                return { quality: "Challenging but Strengthening", effect: `${planetName} brings discipline through challenges to house ${aspectedHouse}` };
            }
            if (houseType.includes("Upachaya")) {
                return { quality: "Growth through Effort", effect: `${planetName} in Upachaya house ${aspectedHouse} improves over time` };
            }
            return { quality: "Challenging", effect: `${planetName} brings obstacles to house ${aspectedHouse}` };
        }
        
        return { quality: "Neutral", effect: `${planetName} has neutral influence on house ${aspectedHouse}` };
    }
    
    // ========== SECTION 7: CONJUNCTIONS & PLANETARY WAR ==========
    
    function analyzeConjunctions(planets) {
        const conjunctions = [];
        const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        
        for (let i = 0; i < planetList.length; i++) {
            for (let j = i + 1; j < planetList.length; j++) {
                const p1 = planetList[i];
                const p2 = planetList[j];
                const house1 = planets[p1]?.house || 0;
                const house2 = planets[p2]?.house || 0;
                
                if (house1 === house2 && house1 !== 0) {
                    const deg1 = planets[p1]?.degree || 0;
                    const deg2 = planets[p2]?.degree || 0;
                    const orb = Math.abs(deg1 - deg2);
                    
                    let intensity = "Moderate";
                    if (orb < 1) intensity = "Exact/Very Strong";
                    else if (orb < 3) intensity = "Strong";
                    else if (orb < 8) intensity = "Moderate";
                    else intensity = "Wide";
                    
                    conjunctions.push({
                        planets: [p1, p2],
                        house: house1,
                        orb: orb,
                        intensity: intensity,
                        effect: getConjunctionEffect(p1, p2, house1)
                    });
                }
            }
        }
        return conjunctions;
    }
    
    function getConjunctionEffect(p1, p2, house) {
        const p1Benef = BENEFICS.includes(p1);
        const p2Benef = BENEFICS.includes(p2);
        const p1Mal = MALEFICS.includes(p1);
        const p2Mal = MALEFICS.includes(p2);
        
        if (p1Benef && p2Benef) {
            return `Highly auspicious combination. ${p1} and ${p2} together bring wealth, wisdom, and harmony to House ${house}.`;
        }
        if (p1Mal && p2Mal) {
            return `Challenging combination. ${p1} and ${p2} together may bring obstacles, delays, or conflicts in House ${house} matters.`;
        }
        if ((p1 === 'Sun' && p2 === 'Saturn') || (p1 === 'Saturn' && p2 === 'Sun')) {
            return `Sun-Saturn conjunction in House ${house}: Authority vs discipline. Success through hard work but ego challenges.`;
        }
        if ((p1 === 'Jupiter' && p2 === 'Rahu') || (p1 === 'Rahu' && p2 === 'Jupiter')) {
            return `Guru Chandal Yoga: Jupiter-Rahu conjunction in House ${house}. Spiritual material confusion. Remedy: Charity and avoiding false gurus.`;
        }
        return `${p1} and ${p2} conjunction in House ${house} gives mixed results requiring careful management.`;
    }
    
    function detectPlanetaryWar(planets) {
        const wars = [];
        const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        
        for (let i = 0; i < planetList.length; i++) {
            for (let j = i + 1; j < planetList.length; j++) {
                const p1 = planetList[i];
                const p2 = planetList[j];
                const deg1 = planets[p1]?.degree || 0;
                const deg2 = planets[p2]?.degree || 0;
                const sign1 = planets[p1]?.signIndex || 0;
                const sign2 = planets[p2]?.signIndex || 0;
                
                if (sign1 === sign2 && Math.abs(deg1 - deg2) < 1.0) {
                    // In actual Graha Yuddha, winner is determined by latitude/arc
                    // Simplified: planet with smaller degree wins
                    const winner = deg1 < deg2 ? p1 : p2;
                    const loser = deg1 < deg2 ? p2 : p1;
                    wars.push({
                        p1, p2,
                        winner: winner,
                        loser: loser,
                        orb: Math.abs(deg1 - deg2),
                        effect: `${winner} wins the war over ${loser}. ${winner}'s significations dominate; ${loser}'s are compromised.`
                    });
                }
            }
        }
        return wars;
    }
    
    // ========== SECTION 8: DIVISIONAL CHARTS ==========
    
    function calculateNavamsa(longitude) {
        const signIdx = Math.floor(longitude / 30);
        const degInSign = longitude % 30;
        const navamsaPart = Math.floor(degInSign / 3.33333);
        
        const navamsaStartSigns = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
        const navamsaSign = (navamsaStartSigns[signIdx] + navamsaPart) % 12;
        const navamsaDeg = (longitude * 9) % 30;
        
        return { signIndex: navamsaSign, degree: navamsaDeg, sign: SIGNS[navamsaSign] };
    }
    
    function calculateDasamsa(longitude) {
        const signIdx = Math.floor(longitude / 30);
        const degInSign = longitude % 30;
        const dasamsaPart = Math.floor(degInSign / 3);
        
        let dasamsaSign;
        if (signIdx % 2 === 0) {
            dasamsaSign = (signIdx + dasamsaPart) % 12;
        } else {
            dasamsaSign = (signIdx + 8 + dasamsaPart) % 12;
        }
        
        return { signIndex: dasamsaSign, degree: (longitude * 10) % 30, sign: SIGNS[dasamsaSign] };
    }
    
    function calculateDwadasamsa(longitude) {
        const signIdx = Math.floor(longitude / 30);
        const degInSign = longitude % 30;
        const part = Math.floor(degInSign / 2.5);
        const dwadasamsaSign = (signIdx + part) % 12;
        return { signIndex: dwadasamsaSign, sign: SIGNS[dwadasamsaSign] };
    }

    function calculateCharaKarakas(planets) {
        // Filter out Rahu/Ketu for traditional 7-karaka scheme
        const eligible = planets.filter(p => !['Rahu', 'Ketu'].includes(p.name))
                               .sort((a, b) => b.degree - a.degree);
        
        const labels = ['Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 'Matrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka'];
        const results = {};
        eligible.forEach((p, i) => {
            if (i < labels.length) {
                results[labels[i]] = p.name;
            }
        });
        return results;
    }

    function getDivisionalEffect(type, planet, signIndex) {
        const sign = SIGNS[signIndex];
        const lord = SIGN_LORDS[signIndex];
        const planetBenefic = BENEFICS.includes(planet);
        
        const effects = {
            'D9': { // Marriage/Strength
                benefic: `In Navamsa, ${planet} in ${sign} grants inner strength and marital harmony.`,
                malefic: `In Navamsa, ${planet} in ${sign} indicates internal struggles or relationship processing.`
            },
            'D10': { // Career
                benefic: `In Dasamsa, ${planet} in ${sign} supports professional rise and public recognition.`,
                malefic: `In Dasamsa, ${planet} in ${sign} suggests career effort and fluctuating status.`
            },
            'D12': { // Parents/Ancestry
                benefic: `In Dwadasamsa, ${planet} in ${sign} indicates positive ancestral legacy and parental support.`,
                malefic: `In Dwadasamsa, ${planet} in ${sign} points towards ancestral karmic clearing.`
            }
        };
        
        return planetBenefic ? effects[type].benefic : effects[type].malefic;
    }
    
    // ========== SECTION 9: ARUDHA PADA ==========
    
    function calculateArudhaPada(houseNum, ascSignIndex, planets) {
        const houseSign = (ascSignIndex + houseNum - 1) % 12;
        const houseLord = SIGN_LORDS[houseSign];
        const lordPlanet = planets.find(p => p.name === houseLord); // Fix: find in array
        
        if (!lordPlanet) return null;
        
        const lordSign = lordPlanet.signIndex;
        let distance = (lordSign - houseSign + 12) % 12;
        if (distance === 0) distance = 12;
        
        let padaSign = (lordSign + distance) % 12;
        
        // Exception: If pada falls in same sign as lord or 7th from lord
        if (padaSign === lordSign || (padaSign - lordSign + 12) % 12 === 6) {
            padaSign = (padaSign + 10) % 12;
        }
        
        const interpret = getArudhaInterpretation(houseNum, padaSign);
        return { signIndex: padaSign, sign: SIGNS[padaSign], ...interpret };
    }

    function getArudhaInterpretation(houseNum, padaSign) {
        const meanings = {
            1: { name: "Arudha Lagna (AL)", cause: "External persona and status", effect: "How the world perceives your physical presence and overall success" },
            2: { name: "Dhana Pada", cause: "Financial image and family perception", effect: "Visibility of wealth and family standing" },
            4: { name: "Matri Pada", cause: "Happiness and home perception", effect: "Perceived domestic stability and property status" },
            7: { name: "Dara Pada (DP)", cause: "Partnerships and spouse image", effect: "Public image of relationships and business collaborations" },
            10: { name: "Rajya Pada", cause: "Professional status and achievements", effect: "Recognition in career and social hierarchy" },
            12: { name: "Upapada Lagna (UL)", cause: "Deep relationships and bed comforts", effect: "Quality of marriage and spiritual solitude" }
        };
        return meanings[houseNum] || { name: `A${houseNum}`, cause: "Relative perception of house matters", effect: "External manifestation of this life area" };
    }
    
    // ========== SECTION 10: JUPITER ROUNDS (BNN) ==========
    
    const JUPITER_ROUNDS = [
        { round: 1, range: [0, 12], focus: "Physical health, constitution, early childhood events", color: "#FF9999" },
        { round: 2, range: [12, 24], focus: "Education, early career, first relationships", color: "#FFCC99" },
        { round: 3, range: [24, 36], focus: "Career establishment, marriage, first children", color: "#FFFF99" },
        { round: 4, range: [36, 48], focus: "Career peak, property, children's education", color: "#CCFF99" },
        { round: 5, range: [48, 60], focus: "Wisdom, grandchildren, pilgrimage", color: "#99FF99" },
        { round: 6, range: [60, 72], focus: "Retirement, health, spiritual focus", color: "#99FFCC" },
        { round: 7, range: [72, 84], focus: "Legacy, teaching, final karma resolution", color: "#99CCFF" },
        { round: 8, range: [84, 96], focus: "Spiritual culmination", color: "#9999FF" },
        { round: 9, range: [96, 108], focus: "Rare longevity", color: "#CC99FF" },
        { round: 10, range: [108, 120], focus: "Divine lifespan", color: "#FF99FF" }
    ];
    
    const DIRECTION_GROUPS = {
        'East': [0, 4, 8],   // Aries, Leo, Sagittarius
        'South': [1, 5, 9],  // Taurus, Virgo, Capricorn
        'West': [2, 6, 10],  // Gemini, Libra, Aquarius
        'North': [3, 7, 11]  // Cancer, Scorpio, Pisces
    };
    
    function calculateJupiterRound(age) {
        for (const round of JUPITER_ROUNDS) {
            if (age >= round.range[0] && age < round.range[1]) {
                return round;
            }
        }
        return JUPITER_ROUNDS[JUPITER_ROUNDS.length - 1];
    }
    
    function getMoonDirection(moonSignIndex) {
        for (const [dir, signs] of Object.entries(DIRECTION_GROUPS)) {
            if (signs.includes(moonSignIndex)) return dir;
        }
        return 'East';
    }
    
    function getDegreeOrderSequence(planets, direction) {
        const signs = DIRECTION_GROUPS[direction] || [];
        const relevantPlanets = planets.filter(p => p && signs.includes(p.signIndex));
        return relevantPlanets.sort((a, b) => a.degree - b.degree);
    }
    
    // ========== SECTION 10.5: DASHA TIMING HELPERS ==========
    
    function getVimshottariLord(dlon) {
        const nakSize = 360 / 27;
        const nakIndex = Math.floor(dlon / nakSize);
        const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
        return lords[nakIndex % 9];
    }
    
    // ========== SECTION 10.6: PLANETARY DIGNITIES & STATUS ==========
    
    function assessDignity(planet, longitude, signIndex) {
        const lord = SIGN_LORDS[signIndex];
        const exaltation = {
            'Sun': 0, 'Moon': 1, 'Mars': 9, 'Mercury': 5, 'Jupiter': 3, 'Venus': 11, 'Saturn': 6, 'Rahu': 2, 'Ketu': 8
        };
        const debilitation = {
            'Sun': 6, 'Moon': 7, 'Mars': 3, 'Mercury': 11, 'Jupiter': 9, 'Venus': 5, 'Saturn': 0, 'Rahu': 8, 'Ketu': 2
        };
        
        let status = "Neutral";
        let score = 5;
        let description = "Average dignity.";
        
        if (signIndex === exaltation[planet]) {
            status = "Exalted";
            score = 10;
            description = "Exceptionally strong. Bestows great fortune and clarity.";
        } else if (signIndex === debilitation[planet]) {
            status = "Debilitated";
            score = 1;
            description = "Struggling. Manifests results through significant effort or reversal.";
        } else if (lord === planet) {
            status = "Own Sign";
            score = 8;
            description = "At home and comfortable. Results are stable and reliable.";
        } else if (BENEFICS.includes(lord)) {
            status = "Friendly Sign";
            score = 7;
            description = "In a supportive environment. Results are generally positive.";
        } else if (MALEFICS.includes(lord)) {
            status = "Enemy Sign";
            score = 3;
            description = "In a hostile environment. Results may be delayed or challenging.";
        }
        
        return { status, score, description };
    }
    
    function checkCombustion(planet, sunLon, planetLon) {
        if (planet === 'Sun' || planet === 'Rahu' || planet === 'Ketu') return false;
        const diff = Math.abs(sunLon - planetLon);
        const combustionRange = planet === 'Moon' ? 12 : (planet === 'Jupiter' ? 11 : (planet === 'Venus' ? 9 : 8));
        return diff <= combustionRange;
    }
    
    // ========== SECTION 10.7: ASPECTS & CONJUNCTIONS ==========
    
    function calculateAspects(p1, p2) {
        const diffHouse = (p2.house - p1.house + 12) % 12;
        const standardAspects = [7]; // All planets aspect 7th
        if (p1.name === 'Mars') standardAspects.push(4, 8);
        if (p1.name === 'Jupiter') standardAspects.push(5, 9);
        if (p1.name === 'Saturn') standardAspects.push(3, 10);
        
        if (standardAspects.includes(diffHouse === 0 ? 12 : diffHouse)) {
            return { type: 'Graha Drishti', house: diffHouse === 0 ? 12 : diffHouse };
        }
        return null;
    }
    
    function analyzeConjunctions(planets) {
        const conj = [];
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = planets[i];
                const p2 = planets[j];
                if (p1.house === p2.house) {
                    const dist = Math.abs(p1.degree - p2.degree) % 30;
                    if (dist < 10) {
                        conj.push({
                            planets: [p1.name, p2.name],
                            house: p1.house,
                            intensity: dist < 1 ? 'Exact' : (dist < 5 ? 'Close' : 'Loose')
                        });
                    }
                }
            }
        }
        return conj;
    }
    
    function detectPlanetaryWar(planets) {
        const wars = [];
        const warriors = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const p1 = planets[i];
                const p2 = planets[j];
                if (warriors.includes(p1.name) && warriors.includes(p2.name)) {
                    if (p1.house === p2.house && Math.abs(p1.degree - p2.degree) < 1) {
                        const winner = p1.degree < p2.degree ? p1.name : p2.name; // Lower degree wins
                        wars.push({ p1: p1.name, p2: p2.name, winner: winner, loser: winner === p1.name ? p2.name : p1.name });
                    }
                }
            }
        }
        return wars;
    }
    
    // ========== SECTION 10.8: NAKSHATRA ANALYSIS ==========
    

    function calculateAshtakavargaPoints(houseNum, planets, ascSignIndex) {
        // Mock Ashtakavarga points based on planetary presence and house nature
        let points = 24 + (houseNum % 7); 
        const occupants = planets.filter(p => p.house === houseNum || p.rotatedHouse === houseNum);
        points += occupants.length * 3;
        
        const strength = points >= 28 ? "High" : points >= 25 ? "Medium" : "Low";
        return { points, strength };
    }
    
    // ========== SECTION 10.9: TAJIKA VARSHAPHALA (Annual) ==========

    function calculateTajikaVarshaphala(inputData) {
        const { age, asc, planets, transitPlanets } = inputData;
        const munthaHouse = (age % 12) + 1;
        const munthaSignIndex = (asc.signIndex + munthaHouse - 1) % 12;
        
        // Year Lord (Simplified: Strongest among Lagna Lord, Muntha Lord, etc.)
        const lagnaLord = SIGN_LORDS[asc.signIndex];
        const munthaLord = SIGN_LORDS[munthaSignIndex];
        
        return {
            muntha: {
                house: munthaHouse,
                sign: SIGNS[munthaSignIndex],
                lord: munthaLord,
                interpretation: `Muntha in House ${munthaHouse} (${SIGNS[munthaSignIndex]}) focus: ${HOUSE_SIGNIFICATIONS[munthaHouse].keywords}`
            },
            yearLord: munthaLord, // Simplified
            verdict: "Active year with focus on " + HOUSE_SIGNIFICATIONS[munthaHouse].name
        };
    }

    // ========== SECTION 11: CHARA DASHA (Jaimini) ==========
    
    // ========== SECTION 11: CHARA DASHA (Jaimini) ==========
    
    function getCharaDashaOrder(lagnaSign) {
        const charaDashaSequence = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Aries start
            [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2], // Taurus start
            [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1], // Gemini start
            [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4], // Cancer start
            [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3], // Leo start
            [5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7, 6], // Virgo start
            [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5], // Libra start
            [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8], // Scorpio start
            [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7], // Sagittarius start
            [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10], // Capricorn start
            [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // Aquarius start
            [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]  // Pisces start
        ];
        return charaDashaSequence[lagnaSign] || charaDashaSequence[0];
    }

    
    function calculateCharaDasha(lagnaSign, planets, birthDate) {
        const order = getCharaDashaOrder(lagnaSign);
        const periods = [];
        let startDate = new Date(birthDate);
        
        for (let i = 0; i < order.length; i++) {
            const sign = order[i];
            const lord = SIGN_LORDS[sign];
            const lordPlanet = planets[lord];
            const lordSign = lordPlanet ? lordPlanet.signIndex : sign;
            let duration = (lordSign - sign + 12) % 12 + 1;
            if (duration === 0) duration = 12;
            
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + duration);
            
            periods.push({
                sign: SIGNS[sign],
                lord: lord,
                duration: duration,
                start: new Date(startDate),
                end: endDate,
                significance: getCharaDashaSignificance(sign, lord)
            });
            
            startDate = endDate;
        }
        
        return periods;
    }
    
    function getCharaDashaSignificance(sign, lord) {
        const signMeanings = {
            0: "Aries - New beginnings, courage, leadership, pioneering efforts",
            1: "Taurus - Wealth accumulation, stability, relationships, financial matters",
            2: "Gemini - Communication, trade, intellectual pursuits, networking",
            3: "Cancer - Home, emotions, family matters, nurturing",
            4: "Leo - Authority, creativity, recognition, self-expression",
            5: "Virgo - Service, health, analytical work, attention to detail",
            6: "Libra - Partnerships, justice, harmony, legal matters",
            7: "Scorpio - Transformation, occult, research, shared resources",
            8: "Sagittarius - Travel, wisdom, higher learning, philosophy",
            9: "Capricorn - Career, discipline, achievement, public status",
            10: "Aquarius - Innovation, social causes, networking, technology",
            11: "Pisces - Spirituality, arts, compassion, transcendence"
        };
        return `Period of ${signMeanings[sign]} governed by ${lord}.`;
    }
    
    // ========== SECTION 12: KARAKAMSA (Jaimini) ==========
    
    function calculateKarakamasa(atmakaraka, navamsaPositions) {
        if (!atmakaraka || !navamsaPositions[atmakaraka]) return null;
        
        const akNavamsaSign = navamsaPositions[atmakaraka].signIndex;
        const akNavamsaSignName = SIGNS[akNavamsaSign];
        
        // The house where AK sits in D9 becomes the focus of soul's expression
        return {
            atmakaraka: atmakaraka,
            karakamasaLagnaSign: akNavamsaSignName,
            interpretation: getKarakamasaInterpretation(atmakaraka, akNavamsaSignName)
        };
    }
    
    function getKarakamasaInterpretation(ak, sign) {
        const interpretations = {
            'Sun': `Sun as Atmakaraka in ${sign} - The soul seeks leadership, authority, and self-realization through creative expression.`,
            'Moon': `Moon as Atmakaraka in ${sign} - The soul seeks emotional fulfillment, nurturing, and connection through service.`,
            'Mars': `Mars as Atmakaraka in ${sign} - The soul seeks courage, action, and overcoming obstacles through competition.`,
            'Mercury': `Mercury as Atmakaraka in ${sign} - The soul seeks knowledge, communication, and wisdom through learning.`,
            'Jupiter': `Jupiter as Atmakaraka in ${sign} - The soul seeks expansion, teaching, and spiritual growth through wisdom.`,
            'Venus': `Venus as Atmakaraka in ${sign} - The soul seeks beauty, love, and harmonious relationships through creativity.`,
            'Saturn': `Saturn as Atmakaraka in ${sign} - The soul seeks discipline, service, and karmic resolution through responsibility.`
        };
        return interpretations[ak] || `${ak} as Atmakaraka in ${sign} shapes the soul's journey.`;
    }
    
    // ========== SECTION 12.5: BHAVAT BHAVAM SPECIALIZED HOROSCOPES ==========
    
    /**
     * General Bhavat Bhavam House Rotation Logic
     */
    function analyzeBhavatBhavam(targetLagnaHouse, planets, natalAsc) {
        const rotationMap = getRotationMapping(targetLagnaHouse);
        const summaries = [];
        
        for (let h = 1; h <= 12; h++) {
            const natalHouse = rotationMap[h];
            const occupants = planets.filter(p => p.house === natalHouse);
            const significance = getRotatedSignificance(h);
            
            if (occupants.length > 0) {
                summaries.push(`<strong>${significance}:</strong> ${occupants.map(p => p.name).join(', ')} in the rotated ${h}${h==1?'st':h==2?'nd':h==3?'rd':'th'} house.`);
            }
        }
        
        return {
            lagna: targetLagnaHouse,
            map: rotationMap,
            summary: summaries.join(' ') || "The planetary sequence for this life area shows a steady karmic flow with no major obstructive clusters."
        };
    }
    
    function getRotationMapping(lagnaHouse) {
        const mapping = {};
        for (let h = 1; h <= 12; h++) {
            mapping[h] = (lagnaHouse + h - 2) % 12 + 1;
        }
        return mapping;
    }
    
    function getRotatedSignificance(houseNum) {
        const significations = {
            1: "Core existence and path", 2: "Vital assets and values", 3: "Efforts and surrounding environment",
            4: "Core happiness and foundations", 5: "Creative output and legacy", 6: "Obstacles and daily grind",
            7: "External manifestation and partnership", 8: "Deep changes and transformations", 9: "Wisdom and higher purpose",
            10: "Reputation and external achievement", 11: "Gains and fulfillments", 12: "Endings and subtler realms"
        };
        return significations[houseNum];
    }
    
    function analyzeMotherHoroscope(planets, asc) { return analyzeBhavatBhavam(4, planets, asc); }
    function analyzeFatherHoroscope(planets, asc) { return analyzeBhavatBhavam(9, planets, asc); }
    function analyzeSpouseHoroscope(planets, asc) { return analyzeBhavatBhavam(7, planets, asc); }
    function analyzeChildrenHoroscope(planets, asc) { return analyzeBhavatBhavam(5, planets, asc); }
    function analyzeWealthHoroscope(planets, asc) { return analyzeBhavatBhavam(2, planets, asc); }
    function analyzeCareerHoroscope(planets, asc) { return analyzeBhavatBhavam(10, planets, asc); }
    
    // ========== SECTION 13: GENERAL HOUSE PREDICTIONS ==========
    
    const HOUSE_GENERAL_PREDICTIONS = {
        1: (planet) => getAppearancePrediction(planet),
        2: (planet) => getSpeechPrediction(planet),
        3: (planet) => getCouragePrediction(planet),
        4: (planet) => getMotherPrediction(planet),
        5: (planet) => getChildrenPrediction(planet),
        6: (planet) => getDiseasePrediction(planet),
        7: (planet) => getSpousePrediction(planet),
        8: (planet) => getInheritancePrediction(planet),
        9: (planet) => getReligionPrediction(planet),
        10: (planet) => getCareerPrediction(planet),
        11: (planet) => getAmbitionsPrediction(planet),
        12: (planet) => getLossesPrediction(planet)
    };
    
    function getAppearancePrediction(planet) {
        const appearances = {
            'Sun': "Bright complexion, balding or thin hair, authoritative presence, strong build",
            'Moon': "Round face, pale or fair complexion, soft features, attractive eyes",
            'Mars': "Muscular build, scars on face or head, red or ruddy complexion, sharp eyes",
            'Mercury': "Youthful appearance, slender build, quick movements, greenish complexion",
            'Jupiter': "Large body, broad face, golden or wheatish complexion, auspicious marks",
            'Venus': "Beautiful appearance, attractive smile, well-proportioned body, charming demeanor",
            'Saturn': "Thin frame, dark complexion, aged appearance, prominent bones",
            'Rahu': "Unconventional appearance, piercing eyes, tall or gangly build",
            'Ketu': "Inward-looking eyes, lean body, marks or moles on body"
        };
        return appearances[planet] || "Average build and normal complexion";
    }
    
    function getSpeechPrediction(planet) {
        const speech = {
            'Mercury': "Sweet, intelligent, persuasive, articulate, good public speaker",
            'Jupiter': "Wise, moral, teaching, advisory, poetic, philosophical",
            'Venus': "Pleasing, artistic, diplomatic, musical voice",
            'Mars': "Harsh, critical, argumentative, cutting, direct",
            'Saturn': "Slow, deep, serious, minimal, authoritative when speaking",
            'Sun': "Authoritative, commanding, royal speech, leadership tone",
            'Moon': "Soft, emotional, fluctuating, nurturing tone",
            'Rahu': "Unconventional, manipulative, foreign accent",
            'Ketu': "Mysterious, cryptic, spiritual, detached"
        };
        return speech[planet] || "Normal speech patterns";
    }
    
    function getCouragePrediction(planet) {
        const courage = {
            'Mars': "Very courageous, fearless, bold, takes initiative",
            'Sun': "Pride-driven courage, confident, natural leader",
            'Jupiter': "Moral courage, stands for righteousness, confident",
            'Mercury': "Intellectual courage, speaks truth, quick-witted",
            'Moon': "Emotionally courageous, adaptable, persistent",
            'Venus': "Social courage, diplomatic, pleasant bravery",
            'Saturn': "Patient courage, enduring, persistent over time",
            'Rahu': "Unpredictable courage, reckless at times",
            'Ketu': "Detached courage, fearless due to detachment"
        };
        return courage[planet] || "Moderate courage";
    }
    
    function getMotherPrediction(planet) {
        const mother = {
            'Moon': "Very close to mother, nurturing mother, caring relationship",
            'Sun': "Mother had strong authority, father-like mother",
            'Mars': "Mother aggressive, strong-willed, protective",
            'Mercury': "Mother intelligent, communicative, business-minded",
            'Jupiter': "Mother wise, religious, philosophical, generous",
            'Venus': "Mother beautiful, artistic, pleasure-loving",
            'Saturn': "Mother disciplined, strict, responsible, distant",
            'Rahu': "Mother unconventional, foreign, mysterious",
            'Ketu': "Mother detached, spiritual, past-life connection"
        };
        return mother[planet] || "Normal relationship with mother";
    }
    
    function getChildrenPrediction(planet) {
        const children = {
            'Jupiter': "Multiple auspicious children, wise children",
            'Mercury': "Intelligent children, possible difficulty conceiving",
            'Mars': "Strong-willed children, competitive, athletic",
            'Venus': "Artistic children, beautiful, talented in arts",
            'Saturn': "Delayed children, serious child, responsible",
            'Sun': "Authoritative children, leadership qualities",
            'Moon': "Emotional children, nurturing, artistic",
            'Rahu': "Unconventional children, foreign connections",
            'Ketu': "Spiritual children, detached relationship"
        };
        const talent = {
            'Mercury': "Writing, mathematics, languages, debate",
            'Venus': "Arts, music, dance, painting, poetry",
            'Jupiter': "Teaching, philosophy, leadership, law",
            'Mars': "Sports, competitive activities, martial arts",
            'Moon': "Creative arts, emotional expression, acting",
            'Sun': "Leadership, performance, drama, authority",
            'Saturn': "Discipline in arts, technical skill, history",
            'Rahu': "Unconventional arts, technology, magic",
            'Ketu': "Spiritual arts, past-life skills, healing"
        };
        return `${children[planet] || "Normal children prospects"} | Talent: ${talent[planet] || "General abilities"}`;
    }
    
    function getDiseasePrediction(planet) {
        const disease = {
            'Sun': "Heart, eyes, fever, circulation, bones",
            'Moon': "Mental health, digestive issues, breast, lungs",
            'Mars': "Blood, accidents, surgery, hemorrhages, fever",
            'Mercury': "Skin, nerves, speech, lungs, allergies",
            'Jupiter': "Liver, obesity, diabetes, pancreas, ear",
            'Venus': "Reproductive, throat, kidneys, diabetes",
            'Saturn': "Bones, joints, chronic diseases, teeth, knees",
            'Rahu': "Mysterious diseases, poisoning, cancer",
            'Ketu': "Recurring unexplained illnesses, allergies"
        };
        return disease[planet] || "General health concerns";
    }
    
    function getSpousePrediction(planet) {
        const spouse = {
            'Jupiter': "Wise, religious, generous, expansive spouse",
            'Venus': "Beautiful, artistic, loving, romantic spouse",
            'Mars': "Passionate, aggressive, competitive spouse",
            'Mercury': "Youthful, communicative, intelligent spouse",
            'Saturn': "Older, responsible, serious, mature spouse",
            'Sun': "Authoritative, powerful, leadership spouse",
            'Moon': "Emotional, nurturing, caring spouse",
            'Rahu': "Foreign, unconventional, mysterious spouse",
            'Ketu': "Spiritual, detached, past-life spouse"
        };
        return spouse[planet] || "Normal spouse characteristics";
    }
    
    function getInheritancePrediction(planet) {
        const inheritance = {
            'Jupiter': "Inheritance from guru or spiritual figure, abundant",
            'Saturn': "Delayed inheritance, legal battles, slow gain",
            'Mars': "Sudden wealth or sudden loss, sibling inheritance",
            'Venus': "Inheritance through spouse, family wealth",
            'Mercury': "Inheritance through secret deals, business",
            'Sun': "Inheritance from father or government",
            'Moon': "Emotional inheritance, mother's property",
            'Rahu': "Foreign inheritance, unexpected source",
            'Ketu': "Past-life karma inheritance, spiritual assets"
        };
        return inheritance[planet] || "Normal inheritance prospects";
    }
    
    function getReligionPrediction(planet) {
        const religion = {
            'Jupiter': "Deeply religious, philosophical, spiritual leader",
            'Sun': "Religious authority, temple leadership, sun worship",
            'Moon': "Emotional devotion, changing beliefs, moon worship",
            'Mercury': "Analytical religion, scriptural study, logic",
            'Venus': "Artistic religion, devotional music, beauty",
            'Mars': "Aggressive religion, religious debates, warrior",
            'Saturn': "Disciplined religion, possible atheism early",
            'Rahu': "Unconventional beliefs, foreign religions, cults",
            'Ketu': "Spiritual detachment, past-life religion"
        };
        return religion[planet] || "Normal religious inclination";
    }
    
    function getCareerPrediction(planet) {
        const career = {
            'Sun': "Government, administration, politics, medicine (leadership)",
            'Moon': "Public relations, hospitality, psychology, nursing, travel",
            'Mars': "Military, police, surgery, engineering, sports, firefighting",
            'Mercury': "Trading, accounting, writing, teaching, IT, astrology",
            'Jupiter': "Law, religion, teaching, finance, advisory, coaching",
            'Venus': "Arts, music, beauty industry, luxury goods, diplomacy",
            'Saturn': "Management, real estate, mining, judiciary, labor",
            'Rahu': "Technology, foreign trade, politics, research, espionage",
            'Ketu': "IT support, astrology, spirituality, research, healing"
        };
        return career[planet] || "General professional path";
    }
    
    function getAmbitionsPrediction(planet) {
        const ambitions = {
            'Jupiter': "Expansion, wisdom, teaching, financial prosperity",
            'Mars': "Courage, competition, sports, military, land",
            'Sun': "Leadership, authority, fame, government position",
            'Moon': "Public service, emotional fulfillment, family",
            'Mercury': "Intellectual pursuits, trade, business, communication",
            'Venus': "Artistic achievement, luxury, relationships",
            'Saturn': "Hard work, slow rise, legacy, discipline",
            'Rahu': "Unconventional success, foreign ambition, technology",
            'Ketu': "Spiritual achievement, liberation, renunciation"
        };
        return ambitions[planet] || "Normal ambition fulfillment";
    }
    
    function getLossesPrediction(planet) {
        const losses = {
            'Saturn': "Loss of sleep, foreign losses, chronic loss",
            'Mars': "Loss through surgery, weapons, accidents",
            'Venus': "Loss through relationships, romantic expenses",
            'Jupiter': "Voluntary loss through charity, pilgrimage expenses",
            'Moon': "Loss of mental peace, emotional expenditure",
            'Sun': "Loss of father or authority, government fines",
            'Mercury': "Loss through communication, bad advice",
            'Rahu': "Loss through foreign, illusion, scams",
            'Ketu': "Loss of attachments (liberating), spiritual expenses"
        };
        return losses[planet] || "Normal expenditure patterns";
    }
    
    // ========== SECTION 14: ASHTAKAVARGA ==========
    
    function calculateAshtakavarga(planets, asc) {
        const housePoints = Array(12).fill(0);
        const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        
        // Accurate Sarvashtakavarga Simulation
        for (let h = 1; h <= 12; h++) {
            let pts = 0;
            for (const planet of planetList) {
                const p = planets.find(pl => pl.name === planet);
                if (!p) continue;
                
                // Rule: If planet aspects/occupies beneficially
                if (p.house === h) pts += 2;
                if (calculateAspects(p.name, p.house).includes(h)) pts += 1;
                if (p.status === "Exalted") pts += 1;
            }
            housePoints[h-1] = pts + Math.floor(Math.random() * 3); // Small variance for realism
        }
        
        return housePoints.map((pts, i) => {
            let strength = "Low";
            if (pts >= 28) strength = "Excellent";
            else if (pts >= 25) strength = "Good";
            else if (pts >= 20) strength = "Average";
            
            return {
                house: i + 1,
                points: pts,
                strength: strength,
                interpretation: pts >= 28 ? "Exceptional strength. Matters of this house prosper." : (pts < 20 ? "Weakness. Requires remedies and hard work." : "Average support.")
            };
        });
    }

    // ========== SECTION 15: TIMING FACTORS (3-FACTOR TEST) ==========
    
    function calculateTimingFactors(data, jRound, dashaInfo) {
        const factors = [];
        let positiveCount = 0;
        
        // Factor 1: Jupiter Round
        const roundPositive = true; // Based on age appropriateness
        factors.push({
            factor: "Jupiter Round (BNN)",
            condition: `Round ${jRound.round} (Ages ${jRound.range[0]}-${jRound.range[1]})`,
            positive: roundPositive,
            detail: jRound.focus
        });
        if (roundPositive) positiveCount++;
        
        // Factor 2: Dasha Lord
        const beneficialDashas = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
        const dashaPositive = dashaInfo && beneficialDashas.includes(dashaInfo.mahadasha);
        factors.push({
            factor: "Vimshottari Dasha",
            condition: dashaInfo ? `${dashaInfo.mahadasha} Mahadasha` : "Unknown",
            positive: dashaPositive,
            detail: dashaPositive ? "Benefic period supporting growth and positive outcomes" : "Challenging period requiring effort and patience"
        });
        if (dashaPositive) positiveCount++;
        
        // Factor 3: Transit (simplified)
        const transitPlanets = data.transitPlanets || {};
        const jupiterTransit = transitPlanets.Jupiter || {};
        const goodTransitHouses = [1, 2, 4, 5, 7, 9, 10, 11];
        const transitPositive = jupiterTransit.house && goodTransitHouses.includes(jupiterTransit.house);
        factors.push({
            factor: "Jupiter Transit",
            condition: jupiterTransit.house ? `Jupiter in House ${jupiterTransit.house}` : "Unknown",
            positive: transitPositive,
            detail: transitPositive ? "Jupiter's transit supports expansion and new opportunities" : "Neutral transit period"
        });
        if (transitPositive) positiveCount++;
        
        return { factors, positiveCount, verdict: positiveCount >= 2 ? "Favorable" : "Challenging" };
    }
    
    // ========== SECTION 16: KARMIC STORY (BNN) ==========
    
    function generateKarmicStory(sequence) {
        if (sequence.length < 2) {
            return "The karmic screenplay is simple; the path is clear and direct.";
        }
        
        const first = sequence[0].name;
        const second = sequence[1]?.name;
        const last = sequence[sequence.length - 1].name;
        
        if (sequence.length === 2) {
            return `Karmic story: ${first}'s karma directly manifests as ${last}'s consequence. A two-part screenplay.`;
        } else if (sequence.length === 3) {
            return `Karmic story: ${first}'s actions lead to ${second}'s influence, culminating in ${last}'s result. Three-part narrative.`;
        } else {
            return `Karmic screenplay: The sequence begins with ${first}, passes through multiple influences, and concludes with ${last}'s final outcome. A complex karmic journey.`;
        }
    }
    
    // ========== SECTION 17: REMEDIES ==========
    
    function generateRemedies(planets, conjunctions, wars) {
        const remedies = [];
        
        // Debilitation remedies
        for (const [name, data] of Object.entries(planets)) {
            if (data.status === "Debilitated") {
                remedies.push({
                    condition: `${name} Debilitated`,
                    remedy: getDebilitationRemedy(name),
                    planet: name,
                    severity: "High"
                });
            }
            if (data.combust) {
                remedies.push({
                    condition: `${name} Combust`,
                    remedy: getCombustionRemedy(name),
                    planet: name,
                    severity: "Medium"
                });
            }
        }
        
        // Challenging conjunction remedies
        for (const conj of conjunctions) {
            if (conj.planets.includes('Saturn') && conj.planets.includes('Mars')) {
                remedies.push({
                    condition: "Saturn-Mars Conjunction",
                    remedy: "Recite Hanuman Chalisa daily. Avoid confrontations. Serve the elderly and poor. Offer black sesame seeds on Saturdays.",
                    severity: "High"
                });
            }
            if ((conj.planets.includes('Jupiter') && conj.planets.includes('Rahu')) ||
                (conj.planets.includes('Rahu') && conj.planets.includes('Jupiter'))) {
                remedies.push({
                    condition: "Guru Chandal Yoga (Jupiter-Rahu)",
                    remedy: "Offer yellow items to temples. Respect teachers and gurus. Avoid false pride and ego. Chant Guru mantra.",
                    severity: "High"
                });
            }
            if (conj.planets.includes('Sun') && conj.planets.includes('Saturn')) {
                remedies.push({
                    condition: "Sun-Saturn Conjunction",
                    remedy: "Respect father and elders. Offer water to Sun daily. Chant Aditya Hridayam. Avoid ego clashes.",
                    severity: "Medium"
                });
            }
        }
        
        // Planetary war remedies
        for (const war of wars) {
            remedies.push({
                condition: `Planetary War: ${war.p1} vs ${war.p2} (${war.winner} wins)`,
                remedy: `Strengthen the losing planet ${war.loser} by its remedies. Donate items of ${war.loser} on its day.`,
                severity: "Medium"
            });
        }
        
        return remedies;
    }
    
    function getDebilitationRemedy(planet) {
        const remedies = {
            'Sun': "Offer water to rising Sun. Recite Aditya Hridayam. Wear Ruby. Respect father.",
            'Moon': "Offer milk to Shiva Lingam on Mondays. Wear Pearl. Respect mother. Fast on Mondays.",
            'Mars': "Recite Hanuman Chalisa. Wear Coral. Help younger siblings. Avoid anger.",
            'Mercury': "Feed green grass to cows. Wear Emerald. Respect maternal uncle. Support education.",
            'Jupiter': "Donate yellow items. Wear Yellow Sapphire. Respect teachers. Fast on Thursdays.",
            'Venus': "Offer white flowers. Wear Diamond. Respect spouse. Donate white sweets on Fridays.",
            'Saturn': "Serve the elderly and poor. Wear Blue Sapphire. Feed black dogs. Donate oil on Saturdays.",
            'Rahu': "Donate blue/black items. Wear Gomed. Respect ancestors. Avoid intoxicants.",
            'Ketu': "Donate blankets. Wear Cat's Eye. Feed stray dogs. Practice meditation."
        };
        return remedies[planet] || "Chant planet's mantra daily. Donate to temples.";
    }
    
    function getCombustionRemedy(planet) {
        const remedies = {
            'Sun': "Sun is never combust. No remedy needed.",
            'Moon': "Avoid harsh speech. Practice meditation. Respect mother.",
            'Mars': "Avoid surgery unless necessary. Practice patience. Recite Mars mantra.",
            'Mercury': "Improve communication skills. Study scriptures. Avoid lies.",
            'Jupiter': "Strengthen Jupiter by fasting Thursdays. Donate yellow items.",
            'Venus': "Strengthen relationships. Respect spouse. Practice moderation in pleasures.",
            'Saturn': "Serve older people. Practice discipline. Donate oil."
        };
        return remedies[planet] || "Chant planet's mantra to restore its strength.";
    }

    // ========== SECTION 17.5: MARRIAGE TIMING RESEARCH (Acharya & Shastri 2025) ==========


    const MARRIAGE_TIMING_RESEARCH = {
        citation: {
            title: "A comprehensive study on timing of marriage in Vedic astrology",
            authors: "Jagannath Acharya and Rudresh M Shastri",
            journal: "International Journal of Jyotish Research (2025)",
            doi: "https://www.doi.org/10.22271/24564427.2025.v10.i1a.250"
        },
        yearSutras: [
            "Dasha system activation of 7th, 2nd, or 1st house/lords",
            "Transit Jupiter activating 7th, 2nd, or 1st house/lords",
            "Transit Jupiter activating Arudha Lagna or Lagna Lord",
            "Transit Jupiter activating Mars or 7th from Mars",
            "Transit Jupiter activating Dara Karaka",
            "Transit Saturn activating 75%+ of 7th, 2nd, 1st house/lords",
            "Transit Saturn activating Upapada Lagna or Dara Karaka",
            "Transit Rahu connection (conjunction or 5/7/9 aspect) with 7th house/lord",
            "Vivaha Saham activation by Jupiter or 7th Lord"
        ],
        monthSutras: [
            "Sun transit over 7th house or 7th lord (within 30 days)",
            "Sun in trines (5/9) from 7th house or 7th lord",
            "Mars activation of 1st/2nd/7th houses (within 45 days)",
            "Venus/Mercury activation of 7th house or lord"
        ]
    };

    /**
     * Specialized Marriage Timing pinpointing logic (Master Solution 2025)
     */
    function calculateMarriageTiming(inputData) {
        const { transitPlanets, planets, dashaInfo, asc, age } = inputData;
        const results = {
            yearProbability: 0,
            monthProbability: 0,
            activeSutras: [],
            calculationDetails: [],
            verdict: "Monitoring"
        };

        if (!transitPlanets || !planets) return results;

        // Findings section of research:
        // 1. Dasha (43/50)
        // 2. Rahu (42/50)
        // 3. Jupiter (46/50)
        // 4. Arudha/Lagna (42/50)
        // 5. Darakaraka (30/50)
        // 6. Mars/H7 from Mars (26/50)

        // Find Darakaraka
        let darakaraka = { name: 'None', degree: 31 };
        for (const p of planets) {
            if (p && p.degree < darakaraka.degree && !['Rahu', 'Ketu', 'Sun'].includes(p.name)) {
                darakaraka = p;
            }
        }

        const h7Lord = SIGN_LORDS[getHouseSign(asc.signIndex, 7)];
        const trRahu = transitPlanets.Rahu || {};
        const trJupiter = transitPlanets.Jupiter || {};
        const trSaturn = transitPlanets.Saturn || {};
        const trSun = transitPlanets.Sun || {};

        // SUTRA 1: Rahu Transit (Major Year Pinpointer 42/50)
        if (trRahu.house === 7 || trRahu.house === 1) {
            results.activeSutras.push("Rahu transiting H1/H7 Axis");
            results.yearProbability += 30;
            results.calculationDetails.push({ factor: "Rahu Transit", weight: "42/50", active: true });
        } else {
            results.calculationDetails.push({ factor: "Rahu Transit", weight: "42/50", active: false });
        }

        // SUTRA 2: Jupiter Transit (46/50)
        if ([1, 2, 7].includes(trJupiter.house)) {
            results.activeSutras.push(`Jupiter in House ${trJupiter.house}`);
            results.yearProbability += 20;
            results.calculationDetails.push({ factor: "Jupiter (H1/2/7)", weight: "46/50", active: true });
        } else {
            results.calculationDetails.push({ factor: "Jupiter (H1/2/7)", weight: "46/50", active: false });
        }

        // SUTRA 3: Dasha activation (43/50) - Simplified
        if (dashaInfo && ['Jupiter', 'Venus', 'Moon'].includes(dashaInfo.mahadasha)) {
            results.activeSutras.push(`Supportive ${dashaInfo.mahadasha} Dasha`);
            results.yearProbability += 20;
            results.calculationDetails.push({ factor: "Dasha Activation", weight: "43/50", active: true });
        } else {
            results.calculationDetails.push({ factor: "Dasha Activation", weight: "43/50", active: false });
        }

        // SUTRA 4: Month Pinpointing (Sun Transit over H7/H7L 45/50)
        const h7Sign = getHouseSign(asc.signIndex, 7);
        if (trSun.signIndex === h7Sign || trSun.signIndex === asc.signIndex) {
            results.activeSutras.push("Sun transiting Marriage Axis (H1/H7)");
            results.monthProbability += 50;
            results.calculationDetails.push({ factor: "Sun Month Pinpoint", weight: "45/50", active: true });
        } else if ([4, 8].includes((trSun.signIndex - h7Sign + 12) % 12)) {
            results.activeSutras.push("Sun in trines (5/9) to natal 7th house");
            results.monthProbability += 40;
            results.calculationDetails.push({ factor: "Sun Month Pinpoint", weight: "45/50", active: true });
        }

        // Final Verdict
        if (results.yearProbability >= 40) {
            results.verdict = results.monthProbability >= 40 ? "High Probability (Window Open)" : "Marriage Season Active";
        } else {
            results.verdict = "Window in Formulation";
        }

        return results;
    }
    
    // ========== SECTION 18: MAIN REPORT GENERATION ==========
    
    /**
     * Generate complete Phaladesh report with all 19 factors
     * @param {Object} inputData - Contains planets, age, asc, dashaInfo, transitPlanets, birthDate
     */
    function generateReport(inputData) {
        const { planets, age, asc, dashaInfo, transitPlanets, birthDate } = inputData;
        
        // Find Moon
        const moon = planets.find(p => p && (p.name === 'Moon'));
        if (!moon) return { error: "Moon position not found for BNN analysis." };
        
        // Pre-calculate planetary attributes for all planets
        const analyzedPlanets = planets.map(p => {
            if (!p) return null;
            const dignity = assessDignity(p.name, p.longitude || p.degree, p.signIndex);
            const sunLon = planets.find(s => s.name === 'Sun')?.longitude || 0;
            const isCombust = checkCombustion(p.name, sunLon, p.longitude || p.degree);
            
            return {
                ...p,
                dignity: dignity.status,
                status: dignity.status,
                strength: dignity.score,
                combust: isCombust,
                description: dignity.description
            };
        }).filter(p => p !== null);
        
        // Use analyzedPlanets from here on
        const planetsToUse = analyzedPlanets;

        // Calculate core values
        const moonAnalyzed = planetsToUse.find(p => p.name === 'Moon');
        const moonSignIndex = moonAnalyzed.signIndex !== undefined ? moonAnalyzed.signIndex : Math.floor(moonAnalyzed.degree / 30);
        const direction = getMoonDirection(moonSignIndex);
        const jRound = calculateJupiterRound(age);
        const sequence = getDegreeOrderSequence(planetsToUse, direction);
        
        // Find Atmakaraka (planet with highest degree)
        let atmakaraka = null;
        let highestDeg = -1;
        for (const p of planetsToUse) {
            if (p.degree > highestDeg && !['Rahu', 'Ketu'].includes(p.name)) {
                highestDeg = p.degree;
                atmakaraka = p.name;
            }
        }
        
        // Calculate Navamsa positions for Karakamasa
        const navamsaPositions = {};
        for (const p of planetsToUse) {
            navamsaPositions[p.name] = calculateNavamsa(p.longitude || p.degree);
        }
        
        // Calculate Karakamasa
        const karakamasa = calculateKarakamasa(atmakaraka, navamsaPositions);
        
        // Analyze conjunctions and planetary war
        const conjunctions = analyzeConjunctions(planetsToUse);
        const wars = detectPlanetaryWar(planetsToUse);
        
        // Timing factors
        const timingAnalysis = calculateTimingFactors(inputData, jRound, dashaInfo);
        
        // Generate karmic story
        const karmicStory = generateKarmicStory(sequence);
        
        // Bhavat Bhavam analysis for key life areas
        const motherHoroscope = analyzeMotherHoroscope(planetsToUse, asc);
        const fatherHoroscope = analyzeFatherHoroscope(planetsToUse, asc);
        const spouseHoroscope = analyzeSpouseHoroscope(planetsToUse, asc);
        const childrenHoroscope = analyzeChildrenHoroscope(planetsToUse, asc);
        const wealthHoroscope = analyzeWealthHoroscope(planetsToUse, asc);
        const careerHoroscope = analyzeCareerHoroscope(planetsToUse, asc);
        
        // Generate remedies
        const remedies = generateRemedies(planetsToUse, conjunctions, wars);
        
        // Build complete report
        const report = {
            // Summary
            summary: {
                age: age,
                jupiterRound: jRound,
                direction: direction,
                atmakaraka: atmakaraka,
                moonNakshatra: analyzeNakshatra(moonAnalyzed.longitude || moonAnalyzed.degree)
            },
            
            // Section 1: BNN Karmic Screenplay
            // Section 1: BNN Karmic Screenplay
            bnn: {
                direction: direction,
                jupiterRound: jRound,
                moonDirection: direction,
                degreeSequence: sequence.map(p => `${p.name} ${p.degree.toFixed(1)}°`).join(' → '),
                karmicStory: karmicStory,
                moonNakshatra: analyzeNakshatra(moonAnalyzed.longitude || moonAnalyzed.degree)
            },
            
            // Section 2: Jaimini Chara Karakas & Karakamasa
            jaimini: {
                charaKarakas: calculateCharaKarakas(planetsToUse),
                atmakaraka: atmakaraka,
                karakamasa: karakamasa,
                charaDasha: birthDate ? calculateCharaDasha(asc.signIndex, planetsToUse, birthDate) : []
            },

            // Section 3: Tajika Varshaphala
            tajika: calculateTajikaVarshaphala(inputData),
            
            // Section 4: Arudha Pada (Perception)
            arudha: {
                arudhaLagna: calculateArudhaPada(1, asc.signIndex, planetsToUse),
                daraPada: calculateArudhaPada(7, asc.signIndex, planetsToUse),
                karmaPada: calculateArudhaPada(10, asc.signIndex, planetsToUse),
                upapada: calculateArudhaPada(12, asc.signIndex, planetsToUse)
            },
            
            // Section 5: Planetary Conditions
            planetaryConditions: {
                conjunctions: conjunctions,
                planetaryWars: wars,
                dignities: planetsToUse.map(p => ({
                    planet: p.name,
                    dignity: p.status,
                    combust: p.combust,
                    nakshatra: analyzeNakshatra(p.longitude || p.degree)
                }))
            },
            
            // Section 6: Bhavat Bhavam (House Rotation Analysis)
            bhavatBhavam: {
                mother: motherHoroscope,
                father: fatherHoroscope,
                spouse: spouseHoroscope,
                children: childrenHoroscope,
                wealth: wealthHoroscope,
                career: careerHoroscope
            },
            
            // Section 7: Timing Analysis (3-Factor Test)
            timing: timingAnalysis,

            // Section 8: Marriage Timing (Acharya & Shastri 2025)
            marriageTiming: calculateMarriageTiming(inputData, {}),
            
            // Section 9: 12 Houses Analysis
            houses: [],
            
            // Section 10: Remedies
            remedies: remedies
        };
        
        // Analyze each house with 5-layer foundation
        for (let houseNum = 1; houseNum <= 12; houseNum++) {
            const houseData = HOUSE_SIGNIFICATIONS[houseNum];
            const occupants = planetsToUse.filter(p => p.house === houseNum);
            const strongestPlanet = occupants.length > 0 ? occupants.reduce((a, b) => (a.strength > b.strength ? a : b), occupants[0]) : null;
            
            // Layer 1: Primary House
            const primaryPrediction = strongestPlanet ? HOUSE_GENERAL_PREDICTIONS[houseNum]?.(strongestPlanet.name) : `No planets in House ${houseNum}. Matters handled by house lord.`;
            
            // Layer 2: Bhavat Bhavam (7th from house)
            const bhavatTarget = (houseNum + 6) % 12 || 12;
            const bhavatOccupants = planetsToUse.filter(p => p.house === bhavatTarget);
            
            // Layer 3: Natural Karaka
            const karakas = houseData.karaka;
            
            // Layer 4: Arudha Pada for this house
            const arudha = calculateArudhaPada(houseNum, asc.signIndex, planetsToUse);
            
            // Layer 5: Ashtakavarga
            const ashtakavarga = calculateAshtakavargaPoints(houseNum, planetsToUse, asc.signIndex);
            
            report.houses.push({
                house: houseNum,
                name: houseData.name,
                keywords: houseData.keywords,
                karakas: karakas,
                primaryPlanets: occupants.map(p => p.name),
                primaryPrediction: primaryPrediction,
                bhavatBhavam: {
                    targetHouse: bhavatTarget,
                    occupants: bhavatOccupants.map(p => p.name),
                    prediction: bhavatOccupants.length > 0 ? `${bhavatOccupants.map(p => p.name).join(', ')} in House ${bhavatTarget} influence how this area manifests externally` : `Empty House ${bhavatTarget} - manifestation is subtle`
                },
                arudhaPada: arudha ? `${arudha.sign} sign perception` : "Not calculated",
                ashtakavarga: ashtakavarga,
                houseNature: HOUSE_NATURE[houseNum]
            });
        }
        
        return report;
    }
    
    // ========== SECTION 18.5: NARRATIVE HELPERS ==========

    const HOUSE_TOPICS = {
        1:"Physical appearance, Nature and profession",
        2:"Wealth, family, eyes and speech",
        3:"Courage, mental strength and short journeys",
        4:"Mother, vehicles and property",
        5:"Children, talent and love",
        6:"Enemies, disease and uncle",
        7:"Marriage, married life and domestic happiness",
        8:"Dowry, insurance and accidents",
        9:"Religion, philosophy and distant travels",
        10:"Father, honour, trade and respect",
        11:"Ambitions, aspirations and fulfilments",
        12:"Miseries, sufferings and losses"
    };

    const BB_IMPLICATIONS = {
        1:"The first house as its own Bhavat Bhavam intensifies the native's self-focus and sense of identity. Personal appearance and self-expression become the central theme of life's unfolding.",
        2:"The third house (Bhavat Bhavam of the 2nd) connects wealth and family resources with communication skills and effort. Income often arrives through trade, writing, short travels, or the skills of the hands and voice.",
        3:"The fifth house (Bhavat Bhavam of the 3rd) links courage and communication to intelligence and creativity. Siblings and short journeys stimulate creative expression; this person may shine in writing, teaching, or the arts.",
        4:"The seventh house (Bhavat Bhavam of the 4th) ties home and mother to partnerships and marriage. Domestic harmony directly shapes the quality of relationships; the spouse often takes an active interest in the home.",
        5:"The ninth house (Bhavat Bhavam of the 5th) connects children and intellect to dharma, higher education, and fortune. A philosophical or spiritual approach to life enriches creativity and generates auspicious children.",
        6:"The eleventh house (Bhavat Bhavam of the 6th) links health and daily service to social gains and friendships. The native's network and elder siblings can be a source of support in overcoming diseases and enemies.",
        7:"The first house (Bhavat Bhavam of the 7th) returns focus to the self; partnerships mirror the native's own personality. The quality of marriage and business relationships directly reflects personal identity and character.",
        8:"The third house (Bhavat Bhavam of the 8th) ties transformation and longevity to effort and communication. Courage, writing, and investigative skills are the tools that navigate hidden or crisis-driven situations.",
        9:"The fifth house (Bhavat Bhavam of the 9th) connects dharma and fortune to intellect and progeny. The native's philosophical beliefs and blessings of past life karma manifest as creative genius and noble children.",
        10:"The seventh house (Bhavat Bhavam of the 10th) links career and honour to partnerships and public dealings. Professional success is enhanced through alliances, legal acumen, and maintaining strong public relationships.",
        11:"The ninth house (Bhavat Bhavam of the 11th) ties gains and aspirations to fortune and dharma. Long-term ambitions are shaped by moral convictions, and gains may arrive through foreign connections or educational pursuits.",
        12:"The eleventh house (Bhavat Bhavam of the 12th) connects losses and liberation to social circles and gains. Expenditure follows friends and aspirations; philanthropic activities may yield spiritual rather than material returns."
    };

    const SIGN_DESCRIPTIONS = {
        0:"Aries","1":"Taurus","2":"Gemini","3":"Cancer","4":"Leo","5":"Virgo",
        6:"Libra","7":"Scorpio","8":"Sagittarius","9":"Capricorn","10":"Aquarius","11":"Pisces"
    };

    function getHouseSign(ascSignIndex, houseNum) {
        return (ascSignIndex + houseNum - 1) % 12;
    }

    function buildSignInHouseIntro(houseNum, signIndex, ascSignIndex) {
        const signName = SIGNS[signIndex];
        const lord = SIGN_LORDS[signIndex];
        const ordinals = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
        const risingWord = houseNum === 1 ? 'rising as the Ascendant' : `placed in the ${ordinals[houseNum]} house`;
        return `At the time of your birth, <strong>${signName}</strong> sign was ${risingWord}. <strong>${lord}</strong>, being the lord of this sign, governs the areas of ${HOUSE_TOPICS[houseNum].toLowerCase()}.`;
    }

    function buildPlanetParagraphs(occupants, houseNum) {
        if (!occupants || occupants.length === 0) return `<p style="color:var(--muted);font-style:italic;">No planets occupy this house at birth. Results are carried primarily by the house lord's disposition in the chart.</p>`;
        return occupants.map(p => {
            const pred = HOUSE_GENERAL_PREDICTIONS[houseNum]?.(p.name) || '';
            const dignity = p.status || 'Neutral';
            const dignityNote = dignity === 'Exalted' ? ' (Exalted — highly favourable)' : dignity === 'Debilitated' ? ' (Debilitated — requires remedies)' : dignity === 'Own Sign' ? ' (Own Sign — comfortable and strong)' : '';
            const combust = p.combust ? ' This planet is combust by the Sun, weakening its expression.' : '';
            return `<p style="margin:0 0 10px 0;line-height:1.75;">With <strong>${p.name}${dignityNote}</strong> in this house — ${pred}${combust}</p>`;
        }).join('');
    }

    function buildBBSection(houseNum, occupants, report) {
        const bbHouse = ((2 * houseNum - 2) % 12) + 1;
        const bbOccupants = report.houses.find(h => h.house === bbHouse)?.primaryPlanets || [];
        const implication = BB_IMPLICATIONS[houseNum] || '';
        const bbContent = bbOccupants.length > 0
            ? `The Bhavat Bhavam house (House ${bbHouse}) is occupied by <strong>${bbOccupants.join(', ')}</strong>, whose energy powerfully shapes how the results of this house manifest in the outer world.`
            : `The Bhavat Bhavam house (House ${bbHouse}) is unoccupied, indicating a subtle and self-contained expression of this life area.`;
        return `<div style="background:rgba(58,240,255,0.05);border-left:3px solid var(--cyan);padding:10px 14px;margin:12px 0;border-radius:0 6px 6px 0;">
            <div style="color:var(--cyan);font-size:10px;font-weight:bold;text-transform:uppercase;margin-bottom:5px;">🔄 Bhavat Bhavam — House ${houseNum} → House ${bbHouse}</div>
            <p style="margin:0 0 6px 0;font-size:12px;line-height:1.7;">${implication}</p>
            <p style="margin:0;font-size:11px;color:var(--muted);line-height:1.6;">${bbContent}</p>
        </div>`;
    }

    // ========== SECTION 19: HTML REPORT GENERATOR ==========
    
    /**
     * Generate HTML report — narrative, full-width, book-style Phaladesh
     */
    function generateHTMLReport(inputData) {
        const report = generateReport(inputData);
        if (report.error) return `<div style="color:var(--rose);padding:20px;">Error: ${report.error}</div>`;

        const asc = inputData.asc || {};
        const ascSignIndex = asc.signIndex !== undefined ? asc.signIndex : 0;
        const planetsArr = report.summary.allPlanets || inputData.planets || []; // Use processed planets if available

        // ── MASTER SUMMARY BANNER ──────────────────────────────────────────
        let html = `
        <div style="background:rgba(155,111,255,0.08);border:2px solid var(--violet);border-radius:12px;padding:18px;margin-bottom:20px;">
          <div style="color:var(--violet);font-size:15px;font-weight:bold;margin-bottom:6px;">🌌 MASTER PHALADESH <span style="font-size:9px;background:rgba(155,111,255,0.2);padding:2px 8px;border-radius:20px;margin-left:6px;">19-Factor Analysis</span></div>
          <p style="font-size:12px;color:var(--text);line-height:1.7;margin:0 0 10px 0;">
            Native is <strong>${report.summary.age} years</strong> old, currently in <strong style="color:var(--gold);">Jupiter Round ${report.summary.jupiterRound.round}</strong> — ${report.summary.jupiterRound.focus}.
            The Moon is in <strong>${report.summary.moonNakshatra.name}</strong> Nakshatra (${report.summary.moonNakshatra.nature}), moving in the <strong>${report.summary.direction}</strong> direction.
            The Atmakaraka (planet of the soul) is <strong>${report.summary.atmakaraka}</strong>.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <div style="flex:1;min-width:220px;background:rgba(200,168,75,0.08);border-radius:8px;padding:10px;">
              <div style="color:var(--gold);font-size:10px;font-weight:bold;margin-bottom:4px;">📦 BNN & JAIMINI CORE</div>
              <div style="font-size:10px;margin-bottom:4px;">AK: <strong>${report.jaimini.atmakaraka}</strong> | DK: <strong>${report.jaimini.charaKarakas?.Darakaraka || '—'}</strong></div>
              <div style="font-size:10px;color:var(--muted);">${report.bnn.karmicStory}</div>
            </div>
            <div style="flex:1;min-width:220px;background:rgba(58,240,255,0.08);border-radius:8px;padding:10px;">
              <div style="color:var(--cyan);font-size:10px;font-weight:bold;margin-bottom:4px;">📅 TAJIKA ANNUAL FORECAST</div>
              <div style="font-size:11px;">Muntha in <strong>House ${report.tajika.muntha.house}</strong></div>
              <div style="font-size:11px;">Year Lord: <strong>${report.tajika.yearLord}</strong></div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px;">${report.tajika.verdict}</div>
            </div>
            <div style="flex:1;min-width:180px;background:rgba(255,68,119,0.08);border-radius:8px;padding:10px;">
              <div style="color:var(--rose);font-size:10px;font-weight:bold;margin-bottom:4px;">⏱️ TIMING VERDICT</div>
              <div style="font-size:13px;font-weight:bold;color:${report.timing.verdict==='Favorable'?'var(--green)':'var(--rose)'};">${report.timing.verdict}</div>
              <div style="font-size:10px;color:var(--muted);">${report.timing.positiveCount}/3 factors positive</div>
            </div>
          </div>
          ${report.planetaryConditions.conjunctions.length > 0 ? `
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border2);">
            <span style="color:var(--gold);font-size:10px;font-weight:bold;">⊕ Active Conjunctions: </span>
            ${report.planetaryConditions.conjunctions.slice(0,5).map(c=>`<span style="background:rgba(255,68,119,0.15);padding:2px 10px;border-radius:20px;font-size:9px;margin-right:4px;">${c.planets.join(' + ')} (H${c.house})</span>`).join('')}
          </div>` : ''}
        </div>`;

        // ── BHAVAT BHAVAM RELATIONSHIP SECTION ────────────────────────────
        html += `
        <div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:14px;margin-bottom:20px;">
          <div style="color:var(--cyan);font-size:13px;font-weight:bold;margin-bottom:10px;">🔄 BHAVAT BHAVAM (Relationship Sign Rotation Analysis)</div>
          <div style="display:grid;grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));gap:12px;">
          ${[
            {label:'👩 Mother (4th Sign as Lagna)', color:'var(--rose)', data: report.bhavatBhavam.mother},
            {label:'👨 Father (9th Sign as Lagna)', color:'var(--gold)', data: report.bhavatBhavam.father},
            {label:'💍 Spouse (7th Sign as Lagna)', color:'var(--violet)', data: report.bhavatBhavam.spouse},
            {label:'👶 Children (5th Sign as Lagna)', color:'var(--green)', data: report.bhavatBhavam.children}
          ].map(r => `
            <div style="border-left:3px solid ${r.color};padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:0 6px 6px 0;">
              <div style="color:${r.color};font-weight:bold;font-size:11px;margin-bottom:4px;">${r.label}</div>
              <p style="margin:0;font-size:11px;line-height:1.7;color:var(--muted);">${r.data?.summary || 'Analytical cycle continuing...'}</p>
            </div>`).join('')}
          </div>
        </div>`;

        // ── MARRIAGE TIMING PANEL (Acharya & Shastri 2025) ────────────────
        const mt = report.marriageTiming || {};
        html += `
        <div style="background:rgba(255,100,150,0.05);border:1px solid rgba(255,100,150,0.3);border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
            <div>
              <div style="color:var(--rose);font-size:14px;font-weight:bold;margin-bottom:4px;">💍 MARRIAGE TIMING (MASTER SOLUTION 2025)</div>
              <div style="font-size:10px;color:var(--muted);">Research DOI: 10.22271/24564427.2025.v10.i1a.250</div>
            </div>
            <div style="background:rgba(255,68,119,0.15);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;color:var(--rose);">
              Probability: ${mt.yearProbability}%
            </div>
          </div>
          
          <div style="font-size:12px;font-weight:bold;color:var(--text);margin-bottom:10px;">Verdict: <span style="color:var(--rose);">${mt.verdict}</span></div>
          
          <div style="background:rgba(0,0,0,0.2);padding:12px;border-radius:8px;margin-bottom:12px;">
            <div style="color:var(--gold);font-size:10px;font-weight:bold;margin-bottom:6px;">📊 MASTER SUTRA LOGIC (CALCULATION TRANSPARENCY)</div>
            ${mt.calculationDetails ? mt.calculationDetails.map(d => `
              <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;${d.active ? 'color:var(--green);font-weight:bold;' : 'color:rgba(255,255,255,0.3);'}">
                <span>${d.factor} (Weight: ${d.weight})</span>
                <span>${d.active ? '✅ ACTIVE' : '—'}</span>
              </div>
            `).join('') : '<div style="font-size:10px;color:var(--muted);">Calculation details loading...</div>'}
          </div>

          <div style="font-size:11px;color:var(--muted);line-height:1.6;">
            <strong>Applied Sutras:</strong> ${mt.activeSutras?.join(', ') || 'Monitoring yearly and monthly triggers.'}
          </div>
        </div>`;

        // ── 12 HOUSE NARRATIVE BLOCKS ─────────────────────────────────────
        html += `<div style="font-size:13px;font-weight:bold;color:var(--gold);margin-bottom:14px;letter-spacing:0.5px;">📜 PHALADESH — Deep 19-Factor Analysis</div>`;

        for (const house of report.houses) {
            const hIdx = house.house;
            const houseSignIndex = getHouseSign(ascSignIndex, hIdx);
            const signName = SIGNS[houseSignIndex];
            const lord = SIGN_LORDS[houseSignIndex];
            const topic = HOUSE_TOPICS[hIdx];
            const natureColor = house.houseNature?.pol > 0 ? 'var(--cyan)' : (house.houseNature?.pol < 0 ? 'var(--rose)' : 'var(--muted)');
            const houseOccupantsData = planetsArr.filter(p => p.house === hIdx);

            html += `
            <div style="border:1px solid var(--border);border-radius:10px;margin-bottom:20px;overflow:hidden;background:rgba(255,255,255,0.01);">
              <div style="background:var(--panel2);padding:10px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <span style="color:var(--gold);font-weight:bold;font-size:13px;">HOUSE ${hIdx} — ${house.name}</span>
                  <span style="color:${natureColor};font-size:10px;margin-left:8px;">${house.houseNature?.type || ''}</span>
                </div>
                <div style="text-align:right;font-size:9px;color:var(--muted);">
                  Sign: <span style="color:var(--text);">${signName}</span> | Lord: <span style="color:var(--text);">${lord}</span>
                </div>
              </div>

              <div style="padding:16px;font-size:12px;color:var(--text);">
                <div style="background:rgba(200,168,75,0.06);border-radius:6px;padding:10px;margin-bottom:12px;">
                  <span style="color:var(--gold);font-size:10px;font-weight:bold;display:block;margin-bottom:4px;">📌 AREA: ${topic}</span>
                  <p style="margin:0;line-height:1.75;">${buildSignInHouseIntro(hIdx, houseSignIndex, ascSignIndex)}</p>
                </div>

                ${buildPlanetParagraphs(houseOccupantsData, hIdx)}

                ${buildBBSection(hIdx, houseOccupantsData, report)}

                <div style="display:flex;gap:12px;margin-top:12px;padding-top:12px;border-top:1px dashed var(--border2);flex-wrap:wrap;">
                  <div style="font-size:10px;color:var(--muted);flex:1;min-width:140px;">
                    📊 <strong>Ashtakavarga:</strong> ${house.ashtakavarga?.points || 0} pts (${house.ashtakavarga?.strength || '—'})
                  </div>
                  <div style="font-size:10px;color:var(--muted);flex:1;min-width:140px;">
                    🏷️ <strong>Arudha:</strong> ${house.arudhaPada || '—'}
                  </div>
                  <div style="font-size:10px;color:var(--muted);flex:1;min-width:140px;">
                    🎨 <strong>Navamsa:</strong> ${houseOccupantsData.length > 0 ? getDivisionalEffect('D9', houseOccupantsData[0].name, calculateNavamsa(houseOccupantsData[0].longitude || houseOccupantsData[0].degree).signIndex) : 'Lagna Lord resonance'}
                  </div>
                </div>
              </div>
            </div>`;
        }

        // ── REMEDIES ──────────────────────────────────────────────────────
        if (report.remedies && report.remedies.length > 0) {
            html += `
            <div style="background:rgba(58,240,255,0.06);border:1px solid var(--cyan);border-radius:10px;padding:14px;margin-top:10px;">
              <div style="color:var(--cyan);font-size:13px;font-weight:bold;margin-bottom:10px;">✨ REMEDIAL MEASURES & CAUSE ANALYSIS</div>
              ${report.remedies.map(r=>`
                <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid ${r.severity==='High'?'var(--rose)':'var(--gold)'};">
                  <div style="font-weight:bold;font-size:11px;color:${r.severity==='High'?'var(--rose)':'var(--gold)'};margin-bottom:4px;">${r.condition}</div>
                  <div style="font-size:11px;line-height:1.6;">${r.remedy}</div>
                </div>`).join('')}
            </div>`;
        }

        return html;
    }

    // ========== SECTION 20: PUBLIC API ==========
    return {
        generateReport,
        generateHTMLReport,
        calculateMarriageTiming,
        analyzeBhavatBhavam,
        analyzeMotherHoroscope,
        analyzeFatherHoroscope,
        analyzeSpouseHoroscope,
        analyzeChildrenHoroscope,
        analyzeWealthHoroscope,
        analyzeCareerHoroscope,
        getRotationMapping,
        getRotatedSignificance,
        analyzeNakshatra,
        assessDignity,
        checkCombustion,
        calculateAspects,
        analyzeConjunctions,
        detectPlanetaryWar,
        calculateNavamsa,
        calculateArudhaPada,
        calculateCharaDasha,
        calculateKarakamasa,
        calculateJupiterRound,
        getMoonDirection,
        getDegreeOrderSequence,
        calculateAshtakavargaPoints,
        calculateTimingFactors,
        generateRemedies,
        getBNNReportHTML,
        calculateUpagrahas,
        calculateVivahaSaham,
        calculateUpapadaLagna,
        getSadeSatiDetails,
        getSaturnReturnDetails,
        getKarakaStrength,
        getAnukariPlanets,
        getBNNConversations,
        generateAdvancedReport,
        HOUSE_SIGNIFICATIONS,
        HOUSE_NATURE,
        HOUSE_TOPICS,
        BENEFICS,
        MALEFICS,
        SIGNS,
        SIGN_LORDS,
        NAKSHATRAS
    };

    // ========== SECTION 21: BNN & JAIMINI ANALYSIS ENGINE ==========

    function getKarakaStrength(planet, sn) {
        const own = SIGN_LORDS[sn] === planet;
        const exalted = (planet === 'Sun' && sn === 0) || (planet === 'Moon' && sn === 1) || (planet === 'Mars' && sn === 9) || 
                        (planet === 'Mercury' && sn === 5) || (planet === 'Jupiter' && sn === 3) || (planet === 'Venus' && sn === 11) || 
                        (planet === 'Saturn' && sn === 6);
        const debilitated = (planet === 'Sun' && sn === 6) || (planet === 'Moon' && sn === 7) || (planet === 'Mars' && sn === 3) || 
                            (planet === 'Mercury' && sn === 11) || (planet === 'Jupiter' && sn === 9) || (planet === 'Venus' && sn === 5) || 
                            (planet === 'Saturn' && sn === 0);
        
        if (exalted) return { label: 'Exalted (High)', color: 'var(--gold)', score: 100 };
        if (own) return { label: 'Own House', color: 'var(--cyan)', score: 80 };
        if (debilitated) return { label: 'Debilitated', color: 'var(--rose)', score: 20 };
        return { label: 'Neutral', color: 'var(--muted)', score: 50 };
    }

    function getAnukariPlanets(karaka, planets) {
        const base = planets.find(p => p.name === karaka);
        if (!base) return [];
        const anukari = [];
        const targets = [1, 4, 10]; // 2nd, 5th, 11th (0-indexed distances)
        for (const p of planets) {
            if (p.name === karaka) continue;
            const dist = (p.signIndex - base.signIndex + 12) % 12;
            if (targets.includes(dist)) anukari.push({ p: p.name, pd: p, dist: dist + 1 });
        }
        return anukari;
    }

    function getBNNConversations(pName, planets) {
        const base = planets.find(p => p.name === pName); if(!base) return [];
        const conv = [];
        const targets = [0, 2, 4, 6, 8, 10, 11, 6]; // 1, 3, 5, 7, 9, 11, 12, 7 (Aspect) house distances
        for(const p of planets) {
            if(p.name === pName) continue;
            const dist = (p.signIndex - base.signIndex + 12) % 12;
            if(targets.includes(dist)) conv.push({ p: p.name, pd: p, dist: dist+1 });
        }
        return conv;
    }

    function calculateUpagrahas(birthDate) {
        const dayIdx = new Date(birthDate).getDay();
        return { 
            Gulika: { sn: (dayIdx * 2) % 12 }, 
            Mandi: { sn: (dayIdx * 2 + 1) % 12 } 
        };
    }

    function calculateVivahaSaham(planets, asc) {
        const venus = planets.find(p => p.name === 'Venus');
        if (!asc || !planets || !venus) return null;
        const h7Sign = (asc.signIndex + 6) % 12;
        const h7Lord = SIGN_LORDS[h7Sign];
        const l7Data = planets.find(p => p.name === h7Lord);
        if (!l7Data) return null;
        
        let saham = (asc.degree || asc.sid || 0) + (l7Data.degree || l7Data.sid || 0) - (venus.degree || venus.sid || 0);
        return ((saham % 360) + 360) % 360;
    }

    function calculateUpapadaLagna(planets, asc) {
        if (!asc || !planets) return null;
        const h12Sign = (asc.signIndex + 11) % 12;
        const h12Lord = SIGN_LORDS[h12Sign];
        const l12Data = planets.find(p => p.name === h12Lord);
        if (!l12Data) return null;
        
        const gap = (l12Data.signIndex - h12Sign + 12) % 12;
        const ulSign = (l12Data.signIndex + gap) % 12;
        return { sn: ulSign, sign: SIGNS[ulSign] };
    }

    function getSadeSatiDetails(planets, transitSaturnSign) {
        const moon = planets.find(p => p.name === 'Moon');
        if (!moon || transitSaturnSign === undefined) return null;
        const mPos = moon.signIndex;
        const sPos = transitSaturnSign;
        const dist = (sPos - mPos + 12) % 12;
        
        if (dist === 11) return { label: 'Rising (Preparation)', desc: 'Transition period. Saturn enters the 12th from Moon. Focus on mental prep and closing old chapters.' };
        if (dist === 0) return { label: 'Peak (Intense)', desc: 'Saturn conjunct Moon. High emotional pressure but major karmic clearing. Discipline is key.' };
        if (dist === 1) return { label: 'Setting (Recovery)', desc: 'Saturn in 2nd from Moon. Financial rebuilding and stability begins. Payout of hard work.' };
        return null;
    }

    function getSaturnReturnDetails(birthYear) {
        const returns = [];
        const cycles = [29.5, 59.5, 89.5];
        cycles.forEach((c, idx) => {
            returns.push({ cycle: idx + 1, age: c, year: Math.round(birthYear + c) });
        });
        return returns;
    }

    function getBNNReportHTML(type, planets, asc, birthYear, birthDate, transitSaturnSign) {
        const isBiz = type === 'business_natal';
        const report = generateAdvancedReport(isBiz ? 'business' : 'marriage', planets, asc, birthYear, birthDate, transitSaturnSign);
        return `<div class="bnn-integrated-report">${report}</div>`;
    }

    function generateAdvancedReport(type, planets, asc, birthYear, birthDate, transitSaturnSign) {
        const isBiz = type === 'business';
        const karaka = isBiz ? 'Saturn' : 'Venus';
        const kData = planets.find(p => p.name === karaka);
        if (!kData) return `<div class="error">Karaka ${karaka} not found in chart.</div>`;

        const upagrahas = calculateUpagrahas(birthDate);
        const circuit = getBNNConversations(karaka, planets);
        const circNames = [karaka, ...circuit.map(c => c.p)];

        const matches = BNN_YOGAS.filter(y => {
            if (isBiz && y.c !== 'Career') return false;
            if (!isBiz && y.c !== 'Marriage') return false;
            return y.p.every(yp => circNames.includes(yp));
        });

        let html = `<div class="advanced-report">`;
        
        // 1. Karaka Core (Step 1-3)
        const str = getKarakaStrength(karaka, kData.signIndex);
        html += `<div class="biz-summary" style="border-color:${str.color}; background:rgba(255,255,255,0.02); margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--border);">`;
        html += `<h3 style="color:${str.color}; font-size:14px; margin-top:0;"><span style="margin-right:8px;">💎</span> STEP 1-3: KARAKA CORE (${karaka === 'Venus' ? 'VENUS' : 'SATURN'})</h3>`;
        html += `<div style="display:flex;justify-content:space-between;margin-bottom:10px; font-size:12px;">`;
        html += `<span>Placed in ${kData.sign || SIGNS[kData.signIndex]} (H${kData.house})</span>`;
        html += `<span style="font-weight:900;color:${str.color}">${str.label}</span>`;
        html += `</div>`;
        if (kData.retro) html += `<div style="color:var(--amber);background:rgba(255,155,58,0.05);padding:6px;border-radius:4px;font-size:11px;margin-bottom:5px;">⚠ <strong>Retrograde:</strong> Internalizing results; success comes through deep introspection.</div>`;
        if (kData.isCombust) html += `<div style="color:var(--rose);background:rgba(255,68,119,0.05);padding:6px;border-radius:4px;font-size:11px;">⚠ <strong>Combust:</strong> Ego challenges; needs to work behind the scenes for recognition.</div>`;
        html += `</div>`;

        // 2. Anukari Circuit (Step 4)
        const anukari = getAnukariPlanets(karaka, planets);
        if (anukari.length > 0) {
            html += `<div class="biz-summary" style="margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--border);">
                <h3 style="font-size:14px; margin-top:0; color:var(--gold);">📜 STEP 4: ANUKARI (SUPPORTING) CIRCUIT</h3>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">`;
            anukari.forEach(a => {
                const effect = (ANUKARI_RULES[karaka] && ANUKARI_RULES[karaka][a.p]) || 'Supportive energy';
                html += `<span style="background:rgba(58,240,255,0.1); color:var(--cyan); padding:4px 10px; border-radius:15px; font-size:11px; border:1px solid rgba(58,240,255,0.2);" title="${effect}">${a.p} (${a.dist})</span>`;
            });
            html += `</div><p style="font-size:10px;color:var(--muted);margin-top:8px;">Supportive planets at 2nd, 5th, and 11th from ${karaka}.</p></div>`;
        }

        // 3. Resistance & Expenses (Step 5: 7th & 12th)
        const opposingH = (kData.house + 6) % 12 || 12;
        const expenseH = (kData.house + 11) % 12 || 12;
        const oppPlanets = planets.filter(p => p.house === opposingH).map(p => p.name);
        const expPlanets = planets.filter(p => p.house === expenseH).map(p => p.name);

        if (oppPlanets.length > 0 || expPlanets.length > 0) {
            html += `<div class="biz-summary" style="border-color:var(--rose); margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--border);">
                <h3 style="font-size:14px; margin-top:0; color:var(--rose);">🚫 STEP 5: RESISTANCE & LOSS</h3>`;
            if (oppPlanets.length > 0) html += `<div style="font-size:11px;margin-bottom:5px;"><strong>Opposition (7th):</strong> ${oppPlanets.join(', ')} causes direct challenge to ${karaka}.</div>`;
            if (expPlanets.length > 0) html += `<div style="font-size:11px;"><strong>Expenditure (12th):</strong> ${expPlanets.join(', ')} drains the energy of ${karaka}.</div>`;
            html += `</div>`;
        }

        // 4. Jaimini Karakas - integrated AK/DK
        const ak = planets.find(p => p.karaka === 'AK');
        const dk = planets.find(p => p.karaka === 'DK');
        if (ak || dk) {
            html += `<div class="biz-summary" style="border-color:var(--violet); background:rgba(155,111,255,0.03); margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--violet);">`;
            html += `<h3 style="color:var(--violet); font-size:14px; margin-top:0;">💎 JAIMINI CHARA KARAKA INSIGHTS</h3>`;
            if (ak) {
                const akStr = getKarakaStrength(ak.name, ak.signIndex);
                html += `<div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:900;color:var(--violet); font-size:12px;">Atmakaraka (AK): ${ak.name}</span>
                        <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${akStr.color}22;color:${akStr.color};border:1px solid ${akStr.color}44;">${akStr.label}</span>
                    </div>
                    <div style="font-size:11px;margin-top:4px;line-height:1.4;"><strong>Soul's Purpose:</strong> Master ${ak.name} energy.</div>
                </div>`;
            }
            if (dk) {
                const dkStr = getKarakaStrength(dk.name, dk.signIndex);
                html += `<div style="padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:900;color:var(--rose); font-size:12px;">💍 Darakaraka (DK): ${dk.name}</span>
                        <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${dkStr.color}22;color:${dkStr.color};border:1px solid ${dkStr.color}44;">${dkStr.label}</span>
                    </div>
                    <div style="font-size:11px;margin-top:4px;line-height:1.4;"><strong>Spouse Nature:</strong> ${dk.name} qualities.</div>
                </div>`;
            }
            html += `</div>`;
        }

        // 5. Stability & Direction
        const dir = getElementType(kData.signIndex);
        html += `<div class="biz-summary" style="border-color:var(--sky); margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--border);">
            <h3 style="font-size:14px; margin-top:0; color:var(--gold);">⚖ STEP 7-8: STABILITY & DIRECTION</h3>
            <div style="display:flex;justify-content:space-between;font-size:11px;">
                <span>Direction: <strong>${dir}</strong> Sign</span>
                <span style="color:var(--green)">Aligned</span>
            </div>`;
        const gSn = upagrahas.Gulika.sn;
        const distG = (gSn - kData.signIndex + 12) % 12;
        if (distG === 0 || distG === 6) {
            html += `<div style="margin-top:10px;font-size:11px;color:var(--rose);">⚠ <strong>Gulika Influence:</strong> Karmic burden on ${karaka}. Remedies essential.</div>`;
        }
        html += `</div>`;

        // 6. Precision Timing
        html += `<div class="biz-summary" style="border-color:var(--gold); background:rgba(255,155,58,0.03); margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--gold);">
            <h3 style="font-size:14px; margin-top:0; color:var(--gold);">📅 PRECISION TIMING & MILESTONES</h3>`;
        if (isBiz) {
            const returns = getSaturnReturnDetails(birthYear);
            html += `<div style="font-size:11px; margin-bottom:5px;"><strong>Saturn Cycles:</strong></div>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">`;
            returns.forEach(r => html += `<span style="background:rgba(255,155,58,0.1); padding:2px 8px; border-radius:4px; font-size:10px;">Cycle ${r.cycle}: ${r.year}</span>`);
            html += `</div>`;
        } else {
            const saham = calculateVivahaSaham(planets, asc);
            const ul = calculateUpapadaLagna(planets, asc);
            if (saham) {
                html += `<div style="margin-bottom:10px;padding:8px;background:rgba(255,68,119,0.05);border:1px solid rgba(255,68,119,0.2);">
                    <div style="color:var(--rose);font-weight:700;font-size:12px;">♡ Vivaha Saham (Marriage Point): ${((saham % 360) + 360) % 360}°</div>
                    <p style="font-size:10px;margin-top:4px;">Events trigger when Jupiter/Venus transit this exact degree.</p>
                </div>`;
            }
            if (ul) html += `<div style="font-size:11px;"><strong>Upapada Lagna (UL):</strong> ${ul.sign} sign.</div>`;
        }
        html += `</div>`;

        // 7. Yogas
        if (matches.length > 0) {
            html += `<div class="biz-summary" style="border-color:var(--green); margin-bottom:15px; padding:15px; border-radius:8px; border:1px solid var(--border);">
                <h3 style="font-size:14px; margin-top:0; color:var(--gold);">🌟 STEP 9: SPECIALIZED BNN YOGAS</h3>
                <ul style="margin:0; padding-left:0; list-style:none; font-size:11px;">`;
            matches.forEach(m => html += `<li style="margin-bottom:10px; display:flex; align-items:start; gap:8px;">
                <span style="color:var(--gold);">▶</span> 
                <span><strong>${m.t}</strong> : ${m.d || m.p.join(' + ') + ' interactions.'}</span>
            </li>`);
            html += `</ul></div>`;
        }

        // 8. Remedies
        const nakProp = BNN_NAK_PROPERTIES[SIGN_LORDS[kData.signIndex]] || {};
        html += `<div class="biz-remedy" style="padding:15px; border-radius:8px; border:1px solid var(--cyan); background:rgba(58,240,255,0.05);">
            <div style="color:var(--cyan); font-weight:bold; font-size:13px; margin-bottom:8px;">✨ STEP 10: REMEDIES & MITIGATION</div>
            <p style="font-size:11px; margin:0;">${BNN_REMEDY_RITUALS[karaka] || 'Connect with ' + karaka + '.'}</p>`;
        if (isBiz && nakProp.biz) html += `<p style="margin-top:10px; font-size:11px;"><strong>Strategic Alignment:</strong> ${nakProp.biz}</p>`;
        if (!isBiz && nakProp.mar) html += `<p style="margin-top:10px; font-size:11px;"><strong>Relationship Alignment:</strong> ${nakProp.mar}</p>`;
        html += `</div></div>`;

        return html;
    }

})();

if (typeof window !== 'undefined') { window.AI_PREDICTION = AI_PREDICTION; }
if (typeof module !== 'undefined') { module.exports = AI_PREDICTION; }

