// Jaimini (Jemini) Astrology Prediction Module
// Based on Krishnamurti Paddhati and Jaimini Sutras

// Calculate 7 Chara Karakas (significators based on planet degrees)
// Rahu and Ketu are NOT counted as chara karakas in Jaimini astrology
function calculateCharaKarakas(planets) {
    // Filter out Rahu and Ketu - they are not valid karakas
    const validPlanets = Object.keys(planets).filter(name => !['Rahu', 'Ketu'].includes(name));

    const planetNames = validPlanets.sort((a, b) => {
        const lonA = planets[a].longitude || 0;
        const lonB = planets[b].longitude || 0;
        return lonB - lonA;
    });

    const charaBakaNames = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'];
    const karakaMap = {};

    planetNames.forEach((name, index) => {
        if (index < charaBakaNames.length && planets[name]) {
            karakaMap[charaBakaNames[index]] = {
                name: name,
                longitude: planets[name].longitude || 0,
                sign: planets[name].sign || 'Unknown',
                degree: planets[name].degree || 0
            };
        }
    });

    charaBakaNames.forEach(k => {
        if (!karakaMap[k]) {
            const firstValid = validPlanets[0];
            karakaMap[k] = {
                name: firstValid,
                longitude: (planets[firstValid] && planets[firstValid].longitude) || 0,
                sign: (planets[firstValid] && planets[firstValid].sign) || 'Unknown',
                degree: (planets[firstValid] && planets[firstValid].degree) || 0
            };
        }
    });

    return karakaMap;
}