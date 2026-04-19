/**
 * Yoga Engine - Detection, Calculation, and Analysis
 * Detects all yogas present in a birth chart and calculates their strength
 */

/**
 * Main function to detect all yogas in a chart
 * Returns both detected yogas AND all available yogas (for reference)
 * @param {Object} birthChart - Chart object with planets, houses, lagna
 * @param {String} vargaName - Optional name of the varga (e.g. 'D1', 'D9')
 * @returns {Array} Array of all yogas with analysis (detected: true/false)
 */
function detectAllYogasInChart(birthChart, vargaName = 'D1') {
    if (!window.YOGAS_DATA || !Array.isArray(window.YOGAS_DATA)) return [];
    
    const allYogas = [];
    const detectedYogaNames = new Set();
    
    const rationales = new Map();
    
    // First pass: detect yogas that evaluate to true
    window.YOGAS_DATA.forEach(yogaTemplate => {
        try {
            if (yogaTemplate && typeof yogaTemplate.evaluate === 'function') {
                const evalResult = yogaTemplate.evaluate(birthChart);
                if (typeof evalResult === 'object') {
                   if (evalResult.result) {
                       detectedYogaNames.add(yogaTemplate.name);
                       rationales.set(yogaTemplate.name, evalResult.rationale);
                   }
                } else if (evalResult === true) {
                    detectedYogaNames.add(yogaTemplate.name);
                }
            }
        } catch(e) {
            console.warn(`Error detecting yoga ${yogaTemplate?.name}:`, e);
        }
    });
    
    // Second pass: add all yogas to output (detected or reference)
    window.YOGAS_DATA.forEach(yogaTemplate => {
        try {
            if (!yogaTemplate) return;
            
            const isDetected = detectedYogaNames.has(yogaTemplate.name);
            
            const yogaAnalysis = {
                ...yogaTemplate,
                detected: isDetected,
                rationale: isDetected ? (rationales.get(yogaTemplate.name) || '') : '',
                varga: vargaName,
                isReference: !isDetected,  // Mark non-detected yogas as reference
                strength: isDetected ? calculateYogaStrengthLevel(yogaTemplate, birthChart) : yogaTemplate.strength,
                supportingFactors: isDetected ? findSupportingFactors(yogaTemplate, birthChart) : [],
                remedyPlan: generateRemedyPlan(yogaTemplate)
            };
            allYogas.push(yogaAnalysis);
        } catch(e) {
            console.warn(`Error processing yoga ${yogaTemplate?.name}:`, e);
        }
    });
    
    return allYogas;
}

/**
 * Calculate strength level of a yoga (affects display and remedies)
 * @param {Object} yoga - Yoga definition object
 * @param {Object} chart - Birth chart
 * @returns {Object} Strength details
 */
function calculateYogaStrengthLevel(yoga, chart) {
    let strengthScore = 50; // Base score
    let factors = [];
    
    // Check if planets are in good dignity
    if (yoga.planets && Array.isArray(yoga.planets)) {
        yoga.planets.forEach(planetName => {
            const planet = chart.planets[planetName];
            if (planet) {
                if (planet.status === 'Own' || planet.status === 'Exalt.') {
                    strengthScore += 10;
                    factors.push(`${planetName} in own/exalted sign (+10)`);
                } else if (planet.status === 'Mool') {
                    strengthScore += 8;
                    factors.push(`${planetName} in Moolatrikona (+8)`);
                } else if (planet.status === 'Frnd' || planet.status === 'Own House') {
                    strengthScore += 5;
                    factors.push(`${planetName} in friendly sign (+5)`);
                }
            }
        });
    }
    
    // Planets retrograde strengthens (usually)
    if (yoga.planets && Array.isArray(yoga.planets)) {
        yoga.planets.forEach(planetName => {
            const planet = chart.planets[planetName];
            if (planet && planet.isRetrograde) {
                strengthScore += 15;
                factors.push(`${planetName} retrograde (intensifies yoga +15)`);
            }
        });
    }
    
    // Cap the score
    strengthScore = Math.min(strengthScore, 100);
    
    // Determine strength level
    let strengthLevel = 'Weak';
    if (strengthScore <= 30) strengthLevel = 'Weak';
    else if (strengthScore <= 50) strengthLevel = 'Moderate';
    else if (strengthScore <= 75) strengthLevel = 'Strong';
    else strengthLevel = 'Very Strong';
    
    return {
        score: strengthScore,
        level: strengthLevel,
        supportingFactors: factors
    };
}

/**
 * Find additional supporting factors for a yoga
 * @param {Object} yoga - Yoga definition
 * @param {Object} chart - Birth chart
 * @returns {Object} Supporting factors details
 */
function findSupportingFactors(yoga, chart) {
    const factors = {
        planetaryAspects: [],
        housePlacements: [],
        nakshatraEffects: [],
        otherYogaSupport: [],
        cancellationFactors: []
    };
    
    // Check planetary aspects
    if (yoga.planets && Array.isArray(yoga.planets)) {
        yoga.planets.forEach(planetName => {
            const planet = chart.planets[planetName];
            if (planet && planet.aspects) {
                planet.aspects.forEach(aspect => {
                    if (aspect.planet && aspect.type === 'Favorable') {
                        factors.planetaryAspects.push(`${planetName} favorably aspected by ${aspect.planet}`);
                    }
                });
            }
        });
    }
    
    // Check house placements
    if (yoga.keywords && yoga.keywords.length > 0) {
        factors.housePlacements.push(`Yoga focuses on: ${yoga.keywords.join(', ')}`);
    }
    
    // Add remedial yoga support
    if (yoga.deities && Array.isArray(yoga.deities)) {
        factors.otherYogaSupport.push(`Associated deities: ${yoga.deities.join(', ')}`);
    }
    
    return factors;
}

/**
 * Generate a personalized remedy plan for a yoga
 * @param {Object} yoga - Yoga definition
 * @returns {Object} Remedy plan with mantras, donations, rituals
 */
function generateRemedyPlan(yoga) {
    return {
        mantras: yoga.mantras || [],
        donations: generateDonationSuggestions(yoga),
        rituals: generateRitualSuggestions(yoga),
        deities: yoga.deities || [],
        daysAndTimings: recommendedDaysAndTimings(yoga),
        duration: '40 days minimum for effectiveness'
    };
}

/**
 * Generate donation suggestions based on yoga and associated planets/elements
 * @param {Object} yoga - Yoga definition
 * @returns {Array} Donation items with quantities
 */
function generateDonationSuggestions(yoga) {
    const donations = [];
    
    // Based on yoga quality
    if (yoga.quality === 'Positive') {
        donations.push('Donate to temples (gold or money)');
        donations.push('Feed the poor or donate food to schools');
    } else if (yoga.quality === 'Negative') {
        donations.push('Donate money equal to native\'s weight in gold/silver');
        donations.push('Feed cows, birds, or poor people');
        donations.push('Donate black sesame seeds or til');
    }
    
    // Based on associated deities/planets
    if (yoga.deities) {
        yoga.deities.forEach(deity => {
            if (deity.includes('Jupiter') || deity.includes('Brihaspati')) {
                donations.push('Donate yellow items: turmeric, yellow cloth, jaggery');
                donations.push('Support guru, teachers, or educational institutions');
            }
            if (deity.includes('Venus') || deity.includes('Lakshmi')) {
                donations.push('Donate white items: milk, white flowers, diamonds');
                donations.push('Support women\'s education or empowerment programs');
            }
            if (deity.includes('Mars') || deity.includes('Hanuman')) {
                donations.push('Donate red items: red cloth, red pulses, coral');
                donations.push('Support military personnel or police organizations');
            }
            if (deity.includes('Saturn') || deity.includes('Shiva')) {
                donations.push('Donate black/blue items: black sesame, blue cloth');
                donations.push('Support handicapped or underprivileged people');
            }
            if (deity.includes('Mercury') || deity.includes('Saraswati')) {
                donations.push('Donate green items: green cloth, emeralds, books');
                donations.push('Support educational and literary institutions');
            }
            if (deity.includes('Moon')) {
                donations.push('Donate white items: milk, rice, pearls');
                donations.push('Support mental health or orphan care');
            }
            if (deity.includes('Sun')) {
                donations.push('Donate gold, wheat, or red cloth');
                donations.push('Support sun temples or solar energy projects');
            }
        });
    }
    
    return [...new Set(donations)]; // Remove duplicates
}

/**
 * Generate ritual suggestions for a yoga
 * @param {Object} yoga - Yoga definition
 * @returns {Array} Recommended rituals and practices
 */
function generateRitualSuggestions(yoga) {
    const rituals = [];
    
    // Common rituals for auspicious yogas
    if (yoga.quality === 'Positive') {
        rituals.push('Perform Puja at home or temple on the ruling day');
        rituals.push('Perform Havan/Yajna to strengthen the yoga');
        rituals.push('Chant associated mantras during morning hours (Brahma Muhurta)');
        rituals.push('Light a lamp on the associated deity\'s day');
    }
    
    // Remedial rituals for inauspicious yogas  
    if (yoga.quality === 'Negative') {
        rituals.push('Perform daily meditation for 40 minutes');
        rituals.push('Recite Hanuman Chalisa or Durga Saptashati');
        rituals.push('Use Rudraksha mala recommended for the yoga');
        rituals.push('Perform fasting on the associated day');
        rituals.push('Take ritual bath and perform Puja on auspicious timing');
    }
    
    // Add deity-specific rituals
    if (yoga.deities) {
        if (yoga.deities.some(d => d.includes('Hanuman'))) {
            rituals.push('Visit Hanuman Temple on Tuesdays or Saturdays');
        }
        if (yoga.deities.some(d => d.includes('Durga') || d.includes('Kali'))) {
            rituals.push('Perform Durga Puja or Kali Puja during Navratri');
        }
        if (yoga.deities.some(d => d.includes('Shiva'))) {
            rituals.push('Perform Shiva Abhisheka and chant Maha Mrityunjaya Mantra');
        }
        if (yoga.deities.some(d => d.includes('Saraswati'))) {
            rituals.push('Perform Saraswati Puja on Saraswati Jayanti');
        }
        if (yoga.deities.some(d => d.includes('Lakshmi'))) {
            rituals.push('Perform Lakshmi Puja on Fridays and Diwali');
        }
    }
    
    return [...new Set(rituals)]; // Remove duplicates
}

/**
 * Recommend days and timings for yoga practices
 * @param {Object} yoga - Yoga definition
 * @returns {Object} Days and timings recommendations
 */
function recommendedDaysAndTimings(yoga) {
    const recommendations = {};
    
    // Determine ruling day from deities
    if (yoga.deities) {
        const deityRulings = {
            'Sun': 'Sunday (early morning 6-7 AM)',
            'Moon': 'Monday (after moonrise)',
            'Mars': 'Tuesday (morning)',
            'Mercury': 'Wednesday (morning)',
            'Jupiter': 'Thursday (morning)',
            'Venus': 'Friday (evening)',
            'Saturn': 'Saturday (evening)',
            'Hanuman': 'Tuesday or Saturday',
            'Durga': 'Navratri or Tuesday',
            'Shiva': 'Monday or Shiva Ratri',
            'Saraswati': 'Saraswati Jayanti',
            'Lakshmi': 'Friday or Diwali'
        };
        
        yoga.deities.forEach(deity => {
            Object.keys(deityRulings).forEach(key => {
                if (deity.includes(key)) {
                    recommendations.preferredDays = deityRulings[key];
                }
            });
        });
    }
    
    recommendations.timing = 'Brahma Muhurta (1.5 hours before sunrise) is most auspicious';
    recommendations.durationMin = '40 days minimum';
    recommendations.bestMoon = yoga.quality === 'Negative' ? 'Shukla Paksha (bright half)' : 'Either Paksha';
    
    return recommendations;
}

/**
 * Compile comprehensive yoga analysis report
 * @param {Object} birthChart - Birth chart with planets and houses
 * @returns {Object} Complete yoga analysis with categories
 */
function generateComprehensiveYogaReport(birthChart) {
    const allDetectedYogas = detectAllYogasInChart(birthChart);
    
    if (!allDetectedYogas || !Array.isArray(allDetectedYogas)) {
        return { positive: [], negative: [], special: [], summary: {} };
    }
    
    const report = {
        positive: allDetectedYogas.filter(y => y.quality === 'Positive'),
        negative: allDetectedYogas.filter(y => y.quality === 'Negative'),
        special: allDetectedYogas.filter(y => y.quality !== 'Positive' && y.quality !== 'Negative'),
        summary: {
            totalYogasDetected: allDetectedYogas.length,
            auspiciousCount: allDetectedYogas.filter(y => y.quality === 'Positive').length,
            inauspiciousCount: allDetectedYogas.filter(y => y.quality === 'Negative').length,
            specialYogasCount: allDetectedYogas.filter(y => y.quality !== 'Positive' && y.quality !== 'Negative').length,
            overallIndex: calculateOverallYogaIndex(allDetectedYogas),
            primaryYogas: getTopYogasByStrength(allDetectedYogas, 5),
            remedySuggestions: compileRemedySuggestions(allDetectedYogas)
        }
    };
    
    return report;
}

/**
 * Calculate overall yoga index (net auspiciousness)
 * @param {Array} detectedYogas - All detected yogas
 * @returns {Object} Overall index with score and interpretation
 */
function calculateOverallYogaIndex(detectedYogas) {
    let positiveScore = 0;
    let negativeScore = 0;
    
    detectedYogas.forEach(yoga => {
        const strength = yoga.strength?.level;
        const quality = yoga.quality;
        
        let scoreValue = 1;
        if (strength === 'Very Strong') scoreValue = 4;
        else if (strength === 'Strong') scoreValue = 3;
        else if (strength === 'Moderate') scoreValue = 2;
        else if (strength === 'Weak') scoreValue = 1;
        
        if (quality === 'Positive') {
            positiveScore += scoreValue;
        } else if (quality === 'Negative') {
            negativeScore += scoreValue;
        }
    });
    
    const netIndex = positiveScore - negativeScore;
    let interpretation = 'Mixed Yoga Pattern';
    
    if (netIndex > 10) interpretation = 'Highly Auspicious Life Pattern';
    else if (netIndex > 5) interpretation = 'Generally Auspicious';
    else if (netIndex > 0) interpretation = 'Slightly Auspicious';
    else if (netIndex === 0) interpretation = 'Balanced Yoga Pattern';
    else if (netIndex > -5) interpretation = 'Slightly Challenging';
    else if (netIndex > -10) interpretation = 'Challenging Life Pattern';
    else interpretation = 'Highly Challenging - Intensive Remedies Needed';
    
    return {
        score: netIndex,
        interpretation: interpretation,
        positiveScore: positiveScore,
        negativeScore: negativeScore
    };
}

/**
 * Get top yogas sorted by strength
 * @param {Array} detectedYogas - All detected yogas
 * @param {Number} limit - Number of top yogas to return
 * @returns {Array} Top yogas by strength
 */
function getTopYogasByStrength(detectedYogas, limit = 5) {
    const strengthOrder = { 'Very Strong': 4, 'Strong': 3, 'Moderate': 2, 'Weak': 1 };
    
    return detectedYogas
        .sort((a, b) => {
            const scoreA = strengthOrder[a.strength?.level] || 0;
            const scoreB = strengthOrder[b.strength?.level] || 0;
            return scoreB - scoreA;
        })
        .slice(0, limit)
        .map(yoga => ({
            name: yoga.name,
            strength: yoga.strength?.level,
            quality: yoga.quality,
            effect: yoga.result || yoga.effect
        }));
}

/**
 * Compile remedy suggestions from all detected yogas
 * @param {Array} detectedYogas - All detected yogas
 * @returns {Object} Organized remedy suggestions
 */
function compileRemedySuggestions(detectedYogas) {
    const remedies = {
        allMantras: [],
        allDonations: [],
        allRituals: [],
        priorityRemedies: [],
        mantrasForDaily: [],
        deities: [],
        fastingDays: []
    };
    
    detectedYogas.forEach(yoga => {
        if (yoga.remedyPlan) {
            remedies.allMantras.push(...(yoga.remedyPlan.mantras || []));
            remedies.allDonations.push(...(yoga.remedyPlan.donations || []));
            remedies.allRituals.push(...(yoga.remedyPlan.rituals || []));
            remedies.deities.push(...(yoga.remedyPlan.deities || []));
            
            // Prioritize negative yoga remedies
            if (yoga.quality === 'Negative') {
                remedies.priorityRemedies.push({
                    yoga: yoga.name,
                    mantras: yoga.remedyPlan.mantras || [],
                    donations: yoga.remedyPlan.donations || []
                });
            }
        }
        
        if (yoga.mantras) {
            remedies.mantrasForDaily.push(...yoga.mantras);
        }
    });
    
    // Remove duplicates
    remedies.allMantras = [...new Set(remedies.allMantras)];
    remedies.allDonations = [...new Set(remedies.allDonations)];
    remedies.allRituals = [...new Set(remedies.allRituals)];
    remedies.deities = [...new Set(remedies.deities)];
    remedies.mantrasForDaily = [...new Set(remedies.mantrasForDaily)];
    
    return remedies;
}

/**
 * Get specific remedy details for a yoga
 * @param {String} yogaName - Name of yoga to get remedies for
 * @returns {Object} Detailed remedy information
 */
function getYogaRemedyDetails(yogaName) {
    const yoga = window.getYogaByName ? window.getYogaByName(yogaName) : null;
    if (!yoga) return null;
    
    return {
        yoga: yogaName,
        effect: yoga.result || yoga.effect || '',
        mantras: yoga.mantras || [],
        mantrasExplanation: {
            description: 'Chant these mantras in Brahma Muhurta (before sunrise) for best results',
            repetitions: '108 times minimum',
            mala: 'Use Rudraksha or Tulsi mala for counting'
        },
        donations: generateDonationSuggestions(yoga),
        rituals: generateRitualSuggestions(yoga),
        deities: yoga.deities || [],
        timing: recommendedDaysAndTimings(yoga),
        duration: '40-120 days for noticeable results',
        additionalPractices: [
            'Maintain sattvic diet (pure, clean food)',
            'Practice daily meditation (20-30 minutes)',
            'Avoid alcohol, non-vegetarian, and negative company',
            'Perform acts of charity and compassion',
            'Visit temples on recommended days',
            'Engage in seva (selfless service)'
        ]
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        detectAllYogasInChart,
        generateComprehensiveYogaReport,
        getYogaRemedyDetails,
        calculateYogaStrengthLevel,
        generateRemedyPlan
    };
}
