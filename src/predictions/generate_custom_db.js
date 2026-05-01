const fs = require('fs');
const path = require('path');

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const signsHi = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];

const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const planetsHi = ['सूर्य', 'चंद्रमा', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'];

const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

const charts = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

function buildScaffold(lang) {
    const isEn = lang === 'en';
    const sList = isEn ? signs : signsHi;
    const pList = isEn ? planets : planetsHi;

    let db = {
        meta: {
            language: lang,
            version: '1.0'
        },
        charts: {},
        signs_in_houses: {},
        planets_in_houses: {},
        planets_in_signs: {},
        planets_in_nakshatras: {},
        aspects: {},
        conjunctions: {},
        dashas: {},
        planet_degrees: {}
    };

    charts.forEach(c => {
        db.charts[c] = { title: `${c} Chart Analysis`, description: "" };
    });

    for (let h = 1; h <= 12; h++) {
        for (let s = 0; s < 12; s++) {
            const key = `${signs[s]}_House_${h}`;
            db.signs_in_houses[key] = {
                title: isEn ? `${signs[s]} in House ${h}` : `भाव ${h} में ${signsHi[s]}`,
                description: ""
            };
        }
    }

    for (let h = 1; h <= 12; h++) {
        for (let p = 0; p < 9; p++) {
            const key = `${planets[p]}_House_${h}`;
            db.planets_in_houses[key] = {
                 title: isEn ? `${planets[p]} in House ${h}` : `भाव ${h} में ${planetsHi[p]}`,
                 description: ""
            };
        }
    }

    for (let s = 0; s < 12; s++) {
        for (let p = 0; p < 9; p++) {
             const key = `${planets[p]}_${signs[s]}`;
             db.planets_in_signs[key] = {
                 title: isEn ? `${planets[p]} in ${signs[s]}` : `${signsHi[s]} में ${planetsHi[p]}`,
                 description: ""
             };
        }
    }

    for (let n = 0; n < 27; n++) {
        for (let p = 0; p < 9; p++) {
             const key = `${planets[p]}_${nakshatras[n].replace(' ', '')}`;
             db.planets_in_nakshatras[key] = {
                 title: isEn ? `${planets[p]} in Nakshatra ${nakshatras[n]}` : `${nakshatras[n]} नक्षत्र में ${planetsHi[p]}`,
                 description: ""
             };
        }
    }

    return db;
}

const enScaffold = buildScaffold('en');
const hiScaffold = buildScaffold('hi');

const headerEn = `// Auto-generated Comprehensive Astrological DB (English)\nwindow.ASTRO_CUSTOM_DB_EN = `;
const headerHi = `// Auto-generated Comprehensive Astrological DB (Hindi)\nwindow.ASTRO_CUSTOM_DB_HI = `;

fs.writeFileSync(path.join(__dirname, 'custom_db_en.js'), headerEn + JSON.stringify(enScaffold, null, 2) + ';\n');
fs.writeFileSync(path.join(__dirname, 'custom_db_hi.js'), headerHi + JSON.stringify(hiScaffold, null, 2) + ';\n');

console.log('Successfully generated custom_db_en.js and custom_db_hi.js');
