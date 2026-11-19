/**
 * Saravali - Jaimini Predictive Astrology Prediction Engine
 * Based on: saravali_jaimini_predictions.md
 */

(function(global) {
    'use strict';

    const RAJA_YOGAS = {
        rabhu: 'Jupiter in 5th or 9th from Lagna or its lord in own sign',
        dhana: 'Venus in 7th from 5th, or 5th lord in 7th/9th',
        lakshmi: 'Jupiter in 3rd from Lagna',
        uchchaishwyapa: 'Moon, Jupiter, Saturn in 7th from Lagna',
        vashya: 'Venus or Moon aspects to Lagna'
    };

    const GOCHAR_RULES = {
        Sun: { benefic: 'Authority, vitality, health', malefic: 'Health issues, ego, conflicts' },
        Moon: { benefic: 'Emotional balance, happiness', malefic: 'Mood swings, psychological issues' },
        Mars: { benefic: 'Courage, energy, success', malefic: 'Aggression, conflicts, accidents' },
        Mercury: { benefic: 'Intelligence, speech, business', malefic: 'Confusion, debt, self-talk' },
        Jupiter: { benefic: 'Wisdom, fortune, father', malefic: 'Expert, delays, father problems' },
        Venus: { benefic: 'Love, beauty, wealth', malefic: 'Relationship issues, material' },
        Saturn: { benefic: 'Patience, discipline, longevity', malefic: 'Delayed results, restrictions' },
        Rahu: { benefic: 'New opportunities, foreign luck', malefic: 'Confusion, delusion, changes' },
        Ketu: { benefic: 'Spirituality, detachment', malefic: 'Loss, separation' }
    };

    const HOUSE_ANALYSIS = {
        1: 'Self, life, body, personality, fortune',
        2: 'Wealth, family, speech, food',
        3: 'Courage, siblings, short journeys',
        4: 'Home, mother, mind, property',
        5: 'Children, education, intelligence',
        6: 'Health, enemies, debt, litigation',
        7: 'Marriage, partnerships, spouse',
        8: 'Death, occult, sudden, inheritance',
        9: 'Father, fortune, luck, dharma',
        10: 'Career, profession, reputation',
        11: 'Gains, income, hopes, fulfilment',
        12: 'Expenses, foreign, loss, spirituality'
    };

    function generateSaravaliPredictions(chartData) {
        const predictions = [];
        
        if (chartData.karakas && chartData.karakas.AK) {
            predictions.push({
                category: 'Soul Purpose',
                title: 'Atmakaraka Reading',
                description: 'Soul purpose through ' + chartData.karakas.AK.planet + ' in ' + chartData.karakas.AK.sign,
                impact: 'Strong life direction and purpose'
            });
        }
        
        if (chartData.karakas && chartData.karakas.AmK) {
            predictions.push({
                category: 'Career',
                title: 'Amatyakaraka Reading',
                description: 'Career: ' + chartData.karakas.AmK.planet + ' in ' + chartData.karakas.AmK.sign,
                impact: 'Career success and stability'
            });
        }
        
        if (chartData.karakas && chartData.karakas.DK) {
            predictions.push({
                category: 'Partnership',
                title: 'Darakaraka Reading',
                description: 'Spouse indicated by ' + chartData.karakas.DK.planet + ' in ' + chartData.karakas.DK.sign,
                impact: 'Marriage and partnership dynamics'
            });
        }

        if (chartData.rajaYogas && chartData.rajaYogas.length > 0) {
            chartData.rajaYogas.slice(0, 3).forEach(yoga => {
                if (RAJA_YOGAS[yoga.name]) {
                    predictions.push({
                        category: 'Yoga Analysis',
                        title: yoga.name,
                        description: yoga.text,
                        prediction: RAJA_YOGAS[yoga.name]
                    });
                }
            });
        }

        if (chartData.houseAnalysis) {
            Object.keys(chartData.houseAnalysis).forEach(house => {
                const houseNum = parseInt(house);
                if (HOUSE_ANALYSIS[houseNum] && chartData.houseAnalysis[house].planets) {
                    predictions.push({
                        category: 'House Analysis',
                        title: 'House ' + houseNum,
                        description: 'Governing: ' + HOUSE_ANALYSIS[houseNum],
                        impact: 'Planets: ' + chartData.houseAnalysis[house].planets.join(', ')
                    });
                }
            });
        }

        if (chartData.transits) {
            chartData.transits.forEach(transit => {
                const effects = GOCHAR_RULES[transit.planet];
                if (effects) {
                    predictions.push({
                        category: 'Transit Predictions',
                        title: 'Transit of ' + transit.planet,
                        description: 'Transit of ' + transit.planet + ' in ' + transit.sign + ' (H' + transit.house + ')',
                        impact: effects.benefic || effects.malefic,
                        timing: transit.timing || 'Current period'
                    });
                }
            });
        }

        return predictions;
    }

    function calculateKarakaDegrees(planets) {
        const sorted = planets.sort((a, b) => (b.degree % 30) - (a.degree % 30));
        const karakaMap = {};
        const types = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PK', 'GK', 'DK'];
        sorted.forEach((planet, index) => {
            if (index < types.length) {
                karakaMap[types[index]] = planet;
            }
        });
        return karakaMap;
    }

    const SARAVALI_ENGINE = {
        name: 'Saravali Prediction Engine',
        version: '1.0.0',
        generatePredictions: generateSaravaliPredictions,
        calculateKarakaDegrees: calculateKarakaDegrees
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SARAVALI_ENGINE;
    }
    if (typeof global !== 'undefined' && typeof global.SARAVALI_ENGINE === 'undefined') {
        global.SARAVALI_ENGINE = SARAVALI_ENGINE;
    }
})(typeof window !== 'undefined' ? window : globalThis);
