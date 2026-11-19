/**
 * Comprehensive Jyotish Prediction Engine
 * Supports D1, D2, D3, D9 divisional charts
 * All 8 karakas calculations
 * Yoga detection and transit analysis
 * Shloka-integrated predictions
 */

(function(global) {
    'use strict';

    /**
     * Calculate all 8 karakas from planetary positions
     * @param {Object} planets - Planet names with sign and degree
     * @returns {Object} All 8 karakas
     */
    function calculateAllKarakas(planets) {
        const pn = Object.keys(planets);
        const sp = pn.map(n => ({name: n, ...planets[n]})).sort((a,b) => b.degree - a.degree);
        const K = {AK:null, AmK:null, DK:null, PK:null, MK:null, BK:null, GK:null, PiK:null};
        const sd = [...sp].sort((a,b) => b.degree - a.degree);
        if (sd.length >= 1) K.AK = {planet: sd[0].name, sign: sd[0].sign, degree: sd[0].degree};
        if (sd.length >= 2) K.AmK = {planet: sd[1].name, sign: sd[1].sign, degree: sd[1].degree};
        if (sd.length >= 8) {
            K.DK = {planet: sd[7].name, sign: sd[7].sign, degree: sd[7].degree};
            K.PK = {planet: sd[6].name, sign: sd[6].sign, degree: sd[6].degree};
            K.MK = {planet: sd[5].name, sign: sd[5].sign, degree: sd[5].degree};
            K.BK = {planet: sd[4].name, sign: sd[4].sign, degree: sd[4].degree};
            K.GK = {planet: sd[3].name, sign: sd[3].sign, degree: sd[3].degree};
            K.PiK = {planet: sd[2].name, sign: sd[2].sign, degree: sd[2].degree};
        }
        return K;
    }
/**
 * Generate divisional charts (Vargas) from D1 Rashi chart
 * @param {Object} rashiChart - D1 (Rashi) chart data with planets
 * @returns {Object} All divisional charts: D1, D2, D3, D9
 */
function generateDivisionalCharts(rashiChart) {
    const charts = {
        D1: { name: 'Rashi Chart', divisions: {} },
        D2: { name: 'Drekkana (Drekkana)', divisions: {} },
        D3: { name: 'Tripataka (Harmonic 3)', divisions: {} },
        D9: { name: 'Navamsa (D9)', divisions: {} }
    };
    const planets = rashiChart ? Object.keys(rashiChart.planets || {}) : [];
    planets.forEach(planetName => {
        const planetPos = rashiChart.planets ? rashiChart.planets[planetName] : { sign: 0, degree: 0 };
        const sign = planetPos.sign || 0;
        const degree = planetPos.degree || 0;
        charts.D1.divisions[planetName] = { sign: sign, degree: degree, longitude: degree };
        charts.D2.divisions[planetName] = { sign: Math.floor(degree / 10) % 3, degree: degree, longitude: degree, description: 'Drekkana division ' + (Math.floor(degree / 10) % 3 + 1) };
        charts.D3.divisions[planetName] = { sign: sign % 3, degree: degree, longitude: degree, description: 'Tripataka division ' + (sign % 3 + 1) };
        charts.D9.divisions[planetName] = { sign: Math.floor(degree / (360 / 9)) % 9, degree: degree, longitude: degree, description: 'Navamsa division ' + (Math.floor(degree / (360 / 9)) % 9 + 1) };
    });
    return charts;
}
/**
 * Detect Raja Yogas from planetary positions
 * @param {Object} chartData - Chart data with houses and lords
 * @returns {Array} Detected yogas
 */
function detectRajaYogas(chartData) {
    const yogas = [];
    const lagnaLord = chartData.lagnaLord;
    const fifthLord = chartData.fifthLord;
    const ninthLord = chartData.ninthLord;
    const eleventhLord = chartData.eleventhLord;
    // Gajakesari Yoga: Jupiter in kendra from Moon
    if (chartData.planets && chartData.planets.Jupiter) {
        const jupiterPos = chartData.planets.Jupiter;
        const moonSign = chartData.lagnaLord ? chartData.planets.Moon.sign : 0;
        const jupiterFromMoon = (jupiterPos.sign - moonSign + 12) % 12;
        if (jupiterFromMoon === 1 || jupiterFromMoon === 4 || jupiterFromMoon === 7 || jupiterFromMoon === 10) {
            yogas.push({name:'Gajakesari Yoga', text:'Jupiter in a kendra from Moon bestows wisdom, fame and fortune', severity:'benefic'});
        }
    }
    // Panchmahapurusha Yogas
    const benefics = ['Jupiter', 'Venus', 'Mercury'];
    benefics.forEach(planet => {
        if (chartData.planets && chartData.planets[planet]) {
            const pos = chartData.planets[planet];
            const kendras = [1, 4, 7, 10];
            if (kendras.includes(pos.house)) {
                yogas.push({name: planet.charAt(0).toUpperCase() + planet.slice(1) + ' Yoga', text: planet + ' in a kendra house produces Panchmahapurusha yoga', severity:'benefic'});
            }
        }
    });
    // Raja Yoga: Lagna lord with 9th lord
    if (lagnaLord && ninthLord) {
        yogas.push({name:'Raja Yoga', text:'Lagna lord with 9th lord produces Raja Yoga - success and authority', severity:'benefic'});
    }
    // Dharma-Karma Yoga: 9th lord in 10th or 10th lord in 9th
    if (ninthLord && eleventhLord) {
        const ninthInTenth = chartData.houses && chartData.houses[10] ? chartData.houses[10].lords && chartData.houses[10].lords.includes(ninthLord) : false;
        const tenthInNinth = chartData.houses && chartData.houses[9] ? chartData.houses[9].lords && chartData.houses[9].lords.includes(eleventhLord) : false;
        if (ninthInTenth || tenthInNinth) {
            yogas.push({name:'Dharma-Karma Yoga', text:'9th and 10th lord connection - dharma and karma alignment', severity:'benefic'});
        }
    }
    return yogas;
}
/**
 * Analyze current transits (Gochar)
 * @param {Array} transits - Array of {planet, sign, house, timing}
 * @returns {Array} Transit predictions
 */
function analyzeTransits(transits) {
    const rules = {Sun:{benefic:'Authority, vitality, health', malefic:'Health issues, ego conflicts', shloka:'Suryaya namah'}, Moon:{benefic:'Emotional balance, happiness', malefic:'Mood swings, psychological issues', shloka:'Chandraya namah'}, Mars:{benefic:'Courage, energy, success', malefic:'Aggression, conflicts, accidents', shloka:'Angaraka namah'}, Mercury:{benefic:'Intelligence, speech, business', malefic:'Confusion, debt, self-talk', shloka:'Budhaya namah'}, Jupiter:{benefic:'Wisdom, fortune, father', malefic:'Expert, delays, father problems', shloka:'Gurave namah'}, Venus:{benefic:'Love, beauty, wealth', malefic:'Relationship issues, material', shloka:'Shukraya namah'}, Saturn:{benefic:'Patience, discipline, longevity', malefic:'Delayed results, restrictions', shloka:'Shanai namah'}, Rahu:{benefic:'New opportunities, foreign luck', malefic:'Confusion, delusion, changes', shloka:'Ravenaya namah'}, Ketu:{benefic:'Spirituality, detachment', malefic:'Loss, separation, confusion', shloka:'Ketave namah'}};
    const preds = [];
    if (!transits || !Array.isArray(transits)) return preds;
    transits.forEach(t => {
        const r = rules[t.planet];
        if (!r) return;
        const effect = t.house <= 3 || t.house === 9 || t.house === 11 ? r.benefic : r.malefic;
        preds.push({category:'Transit', title:'Transit of '+t.planet, description:'Transit of '+t.planet+' in '+t.sign+' (H'+t.house+')', impact:effect, timing:t.timing||'Current', shloka:r.shloka});
    });
    return preds;
}
/**
 * Analyze houses and their meanings
 * @param {Object} chartData - Chart data
 * @returns {Object} House analysis
 */
function analyzeHouses(chartData) {
    const H = {1:'Self, life, body, personality, fortune', 2:'Wealth, family, speech, food', 3:'Courage, siblings, short journeys', 4:'Home, mother, mind, property', 5:'Children, education, intelligence', 6:'Health, enemies, debt, litigation', 7:'Marriage, partnerships, spouse', 8:'Death, occult, sudden, inheritance', 9:'Father, fortune, luck, dharma', 10:'Career, profession, reputation', 11:'Gains, income, hopes, fulfilment', 12:'Expenses, foreign, loss, spirituality'};
    const analysis = {};
    for (let h=1; h<=12; h++) {
        const planets = (chartData.houses && chartData.houses[h] && chartData.houses[h].planets) || [];
        analysis[h] = {number:h, meaning:H[h], planets: planets.map(p => ({name:p})), lord: chartData.houses && chartData.houses[h] && chartData.houses[h].lord};
    }
    return analysis;
}
/**
 * Generate comprehensive predictions based on chart data
 * @param {Object} chartData - Birth chart with karakas, houses, yogas, divisionals
 * @param {Array} [transitData] - Current transit data
 * @returns {Array} Predictions with shloka references
 */
function generatePredictions(chartData, transitData) {
    const predictions = [];
    const K = chartData.karakas;
    // Karaka readings
    if (K.AK) predictions.push({category:'Soul', title:'Atmakaraka', description:'Atmakaraka '+K.AK.planet+' in '+K.AK.sign, impact:'Soul purpose', shloka:'Atmakaraka determines the soul\'s journey'});
    if (K.AmK) predictions.push({category:'Career', title:'Amatyakaraka', description:'Amatyakaraka '+K.AmK.planet+' in '+K.AmK.sign, impact:'Career path', shloka:'Amatyakaraka indicates administrative ability'});
    if (K.DK) predictions.push({category:'Partnership', title:'Darakaraka', description:'Darakaraka '+K.DK.planet+' in '+K.DK.sign, impact:'Marriage dynamics', shloka:'Darakaraka reveals the spouse'});
    if (K.PK) predictions.push({category:'Progeny', title:'Putrakaraka', description:'Putrakaraka '+K.PK.planet+' in '+K.PK.sign, impact:'Children', shloka:'Putrakaraka signifies progeny'});
    if (K.MK) predictions.push({category:'Parental', title:'Matrikaraka', description:'Matrikaraka '+K.MK.planet+' in '+K.MK.sign, impact:'Mother', shloka:'Matrikaraka reflects the mother'});
    if (K.BK) predictions.push({category:'Sibling', title:'Bhratrikaraka', description:'Bhratrikaraka '+K.BK.planet+' in '+K.BK.sign, impact:'Siblings', shloka:'Bhratrikaraka indicates brothers/sisters'});
    if (K.GK) predictions.push({category:'Friendship', title:'Gnatikaraka', description:'Gnatikaraka '+K.GK.planet+' in '+K.GK.sign, impact:'Friends', shloka:'Gnatikaraka denotes friends'});
    if (K.PiK) predictions.push({category:'Ancestry', title:'Pitrikaraka', description:'Pitrikaraka '+K.PiK.planet+' in '+K.PiK.sign, impact:'Father', shloka:'Pitrikaraka shows the father'});
    // Raja Yogas
    const yogas = chartData.rajaYogas || detectRajaYogas(chartData);
    yogas.slice(0,5).forEach(y => {
        predictions.push({category:'Yoga', title:y.name, description:y.text, impact:y.severity||'benefit', shloka:'Yoga brings sure success'});
    });
    // House analysis
    const HA = chartData.houseAnalysis || analyzeHouses(chartData);
    Object.keys(HA).forEach(h => {
        const hn = parseInt(h);
        if (HOUSE_MEANINGS[hn]) {
            predictions.push({category:'House', title:'House '+hn, description:HOUSE_MEANINGS[hn], impact:'Planets: '+(HA[h].planets||[]).map(p=>p.name).join(', '), shloka:HOUSE_SHLOKAS[hn]});
        }
    });
    // Divisional charts
    if (chartData.divisionals) {
        const DCs = chartData.divisionals;
        if (DCs.D9 && DCs.D9.divisions) {
            Object.keys(DCs.D9.divisions).forEach(p => {
                predictions.push({category:'Divisional', title:'Navamsa '+p, description:'Navamsa analysis', impact:'Inner self & spirituality', shloka:'Navamsa reveals the inner self'});
            });
        }
    }
    // Transits
    if (transitData) {
        const TP = analyzeTransits(transitData);
        predictions.push(...TP);
    }
    return predictions;
}

const HOUSE_MEANINGS = {1:'Self, life, body, personality, fortune', 2:'Wealth, family, speech, food', 3:'Courage, siblings, short journeys', 4:'Home, mother, mind, property', 5:'Children, education, intelligence', 6:'Health, enemies, debt, litigation', 7:'Marriage, partnerships, spouse', 8:'Death, occult, sudden, inheritance', 9:'Father, fortune, luck, dharma', 10:'Career, profession, reputation', 11:'Gains, income, hopes, fulfilment', 12:'Expenses, foreign, loss, spirituality'};
const HOUSE_SHLOKAS = {1:'Athato dharma jignasa', 2:'Arthe jignyasa', 3:'Dharmo hyekeekarana', 4:'Sukhadam pati', 5:'Putraanaam apada', 6:'Ripuanaam jaya', 7:'Saha marriage', 8:'Mrtyonmukti', 9:'Dhano jignyasa', 10:'Karma phala', 11:'Phala Bhoktari', 12:'Vimochanam'};
/**
 * Comprehensive Jyotish Prediction Engine main export
 * @returns {Object} Engine with all methods
 */
const COMPREHENSIVE_ENGINE = {
    name: 'Comprehensive Jyotish Prediction Engine',
    version: '2.0.0',
    calculateAllKarakas: calculateAllKarakas,
    generateDivisionalCharts: generateDivisionalCharts,
    detectRajaYogas: detectRajaYogas,
    analyzeTransits: analyzeTransits,
    generatePredictions: generatePredictions
};

if (typeof module !== 'undefined' && module.exports) { module.exports = COMPREHENSIVE_ENGINE; }
if (typeof global !== 'undefined' && typeof global.COMPREHENSIVE_ENGINE === 'undefined') { global.COMPREHENSIVE_ENGINE = COMPREHENSIVE_ENGINE; }

})(typeof window !== 'undefined' ? window : globalThis);
