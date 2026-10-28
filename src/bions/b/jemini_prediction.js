// Calculate 7 Chara Karakas (significators based on planet degrees)
function calculateCharaKarakas(planets) {
    const planetNames = Object.keys(planets).sort((a, b) => {
        const lonA = planets[a].longitude || 0;
        const lonB = planets[b].longitude || 0;
        return lonB - lonA;
    });

    // Rahu and Ketu are NOT counted as chara karakas in Jaimini
    // Only 7 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
    const validPlanets = Object.keys(planets).filter(name => !['Rahu', 'Ketu'].includes(name));

    const charaBakaNames = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'];
    const karakaMap = {};

    validPlanets.forEach((name, index) => {
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