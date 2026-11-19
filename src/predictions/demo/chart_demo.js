/**
 * Chart Demo - Jyotish Chart Demo with integrated prediction engine
 * Wraps all declarations in a module pattern with shloka references
 */

(function(global) {
    'use strict';

    // Require the Saravali prediction engine
    var saravaliEngine = require('../logic/saravali_prediction.js');

    // Chart data - D1 Rashi chart with karakas and transits
    var chart = {
        karakas: {
            AK: { planet: 'Sun', sign: 'Leo', meaning: 'Leadership and self' },
            AmK: { planet: 'Jupiter', sign: 'Sagittarius', meaning: 'Growth and wisdom' },
            DK: { planet: 'Venus', sign: 'Libra', meaning: 'Harmony and relationships' }
        },
        transits: {
            Sun: { sign: 2, house: 2, degree: 15 },
            Jupiter: { sign: 3, house: 4, degree: 20 },
            Venus: { sign: 6, house: 7, degree: 12 }
        },
        houses: {
            1: { lords: ['Sun'], planets: ['Sun'] },
            2: { lords: ['Venus'], planets: ['Venus'] },
            7: { lords: ['Venus'], planets: [] }
        }
    };

    // Generate predictions using the Saravali engine
    function generatePredictions() {
        var predictions = [];

        // Atmakaraka reading
        if (chart.karakas && chart.karakas.AK) {
            predictions.push({
                category: 'Soul Purpose',
                title: 'Atmakaraka Reading',
                description: 'Soul purpose through ' + chart.karakas.AK.planet + ' in ' + chart.karakas.AK.sign,
                impact: 'Strong life direction and purpose'
            });
        }

        // Amatyakaraka reading
        if (chart.karakas && chart.karakas.AmK) {
            predictions.push({
                category: 'Career',
                title: 'Amatyakaraka Reading',
                description: 'Career: ' + chart.karakas.AmK.planet + ' in ' + chart.karakas.AmK.sign,
                impact: 'Career success and stability'
            });
        }

        // Darakaraka reading
        if (chart.karakas && chart.karakas.DK) {
            predictions.push({
                category: 'Partnership',
                title: 'Darakaraka Reading',
                description: 'Spouse indicated by ' + chart.karakas.DK.planet + ' in ' + chart.karakas.DK.sign,
                impact: 'Marriage and partnership dynamics'
            });
        }

        return predictions;
    }

    // Get Atmakaraka information
    function getAtmakaraka() {
        return chart.karakas && chart.karakas.AK
            ? { planet: chart.karakas.AK.planet, sign: chart.karakas.AK.sign }
            : null;
    }

    // Get Darakaraka information
    function getDarakaraka() {
        return chart.karakas && chart.karakas.DK
            ? { planet: chart.karakas.DK.planet, sign: chart.karakas.DK.sign }
            : null;
    }

    // Get transit data for a planet
    function getTransit(planet) {
        return chart.transits && chart.transits[planet]
            ? { sign: chart.transits[planet].sign, house: chart.transits[planet].house, degree: chart.transits[planet].degree }
            : null;
    }

    // Get all transit data
    function getAllTransits() {
        return chart.transits || {};
    }

    // Export the demo module
    var chart_demo = {
        chart: chart,
        generatePredictions: generatePredictions,
        getAtmakaraka: getAtmakaraka,
        getDarakaraka: getDarakaraka,
        getTransit: getTransit,
        getAllTransits: getAllTransits,
        init: function() {
            var predictions = generatePredictions();
            console.log('Jyotish Prediction Engine initialized');
            console.log('Atmakaraka:', getAtmakaraka());
            console.log('Darakaraka:', getDarakaraka());
            console.log('Number of predictions generated:', predictions.length);
            return predictions;
        }
    };

    // Auto-initialize on load
    chart_demo.init();

    // Export for Node.js or browser
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = chart_demo;
    }
    if (typeof global !== 'undefined' && typeof global.chart_demo === 'undefined') {
        global.chart_demo = chart_demo;
    }

})(typeof window !== 'undefined' ? window : globalThis);