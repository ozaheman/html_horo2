// --- START OF FILE bnn_logic.js ---
// Contains the core logic for Bhrigu Nandi Nadi (BNN) predictions.
// Updated to use the new structured data from bnn_prediction.js and to handle new topics.
// REQUIRES: bnn_prediction.js must be loaded first.

/**
 * Finds the Hero Planet ID or subject identifier based on the selected topic.
 * @param {string} topic - The analysis topic.
 * @param {string} subject - The specific subject within the topic.
 * @returns {number|string|null} The PLANET_ID, a string identifier, or null.
 */
function getBnnHeroIdentifier(topic, subject) {
       // const planetMap = {
        // 'SUN': PLANET_IDS.SUN, 'MOON': PLANET_IDS.MOON, 'MARS': PLANET_IDS.MARS, 'MERCURY': PLANET_IDS.MERCURY,
        // 'JUPITER': PLANET_IDS.JUPITER, 'VENUS': PLANET_IDS.VENUS, 'SATURN': PLANET_IDS.SATURN, 'RAHU': PLANET_IDS.RAHU, 'KETU': PLANET_IDS.KETU
    // };

    if (topic === 'career_saturn_combinations') {
        return PLANET_IDS.SATURN;
    }
    if (topic === 'marriage_obstacles_or_love') {
        return subject; // 'obstacles' or 'love_marriage'
    }
    if (topic === 'progeny_issues') {
        return subject; // 'male_child' or 'female_child'
    }
    if (topic === 'education_mercury_combinations') {
        return PLANET_IDS.MERCURY;
    }
    if (topic === 'health_patterns') {
        return subject; // e.g., 'skin_issues', 'diabetes'
    }
    if (topic === 'property_venus_combinations') {
        return PLANET_IDS.VENUS;
    }

    // Original topic handling (for full karmic path, transits, profession, progression)
    if (topic === 'career') return PLANET_IDS.SATURN;
    if (topic === 'money') return PLANET_IDS.VENUS;
    if (topic === 'marriage') {
        if (subject === 'spouse_male') return PLANET_IDS.VENUS;
        if (subject === 'spouse_female') return PLANET_IDS.MARS;
        if (subject === 'self_journey') return PLANET_IDS.JUPITER;
    }
    // Topics that don't need a hero planet
    if (['core_principles', 'special_yogas', 'education_analysis'].includes(topic)) {
        return topic;
    }
    // Topics where the subject itself is the identifier
    if (['marriage_obstacles_or_love', 'progeny_issues', 'health_patterns', 'profession'].includes(topic)) {
        return subject;
    }
    // Topics requiring a planet ID
    if (['karmic_path', 'career_saturn_combinations', 'property_venus_combinations'].includes(topic)) {
        const planetMap = {
            'karmic_path': subject, 'career_saturn_combinations': 'SATURN',
            'property_venus_combinations': 'VENUS'
        };
        const planetKey = planetMap[topic].toUpperCase();
        return PLANET_IDS[planetKey] || null;
    }
    // Transit topics
    if (topic === 'transit_jupiter' || topic === 'transit_saturn') {
        for (const key in PLANET_IDS) {
            if (planetNames[PLANET_IDS[key]] && planetNames[PLANET_IDS[key]].short.toUpperCase() === subject.toUpperCase()) {
                return PLANET_IDS[key];
            }
        }
    }
     if (topic === 'progression') {
        return PLANET_IDS.JUPITER; // Progression is always from Jupiter
    }
    return null;
}

/**
 * Main function to generate BNN predictions.
 * @param {Array} chartData - The complete natal chart data.
 * @param {string} topic - The analysis topic.
 * @param {number|string} heroIdentifier - The ID or string identifier of the hero planet/subject.
 * @returns {object} An object with 'hindi' and 'english' prediction strings.
 */
function generateBnnPrediction(chartData, topic, heroIdentifier, subject ) {
    let english = "";
    let hindi = "";

    /*// --- New Feature Handling ---
    if (topic === 'career_saturn_combinations') {
        english += `<h4>Career/Profession: Saturn Combinations</h4>`;
        hindi += `<h4>करियर/व्यवसाय: शनि संयोजन</h4>`;
        let found = false;
        // Iterate through all planets Saturn can combine with
        for (const planetKey in PLANET_IDS) {
            if (PLANET_IDS.hasOwnProperty(planetKey) && PLANET_IDS[planetKey] !== PLANET_IDS.SATURN && PLANET_IDS[planetKey] !== PLANET_IDS.ASC) {
                const planetId = PLANET_IDS[planetKey];
                const key1 = `${PLANET_IDS.SATURN}-${planetId}`; // Saturn first
                const key2 = `${planetId}-${PLANET_IDS.SATURN}`; // Saturn second
                
                let predictionData = null;
                let combinationOrderNoteEn = "";
                let combinationOrderNoteHi = "";

                if (bnnCombinationPredictions[key1]) {
                    predictionData = bnnCombinationPredictions[key1];
                    combinationOrderNoteEn = `(Saturn → ${planetNames[planetId].en})`;
                    combinationOrderNoteHi = `(शनि → ${planetNames[planetId].hi})`;
                } else if (bnnCombinationPredictions[key2]) {
                    predictionData = bnnCombinationPredictions[key2];
                    combinationOrderNoteEn = `(${planetNames[planetId].en} → Saturn)`;
                    combinationOrderNoteHi = `(${planetNames[planetId].hi} → शनि)`;
                }

                if (predictionData) {
                    found = true;
                    const titleEn = `› Saturn with ${planetNames[planetId].en} ${combinationOrderNoteEn}:`;
                    const titleHi = `› शनि ${planetNames[planetId].hi} के साथ ${combinationOrderNoteHi}:`;
                    english += `<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
                    hindi += `<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
                }
            }
        }
        if (!found) {
            english += "<p>No specific Saturn combination predictions found in the database for career.</p>";
            hindi += "<p>करियर के लिए डेटाबेस में कोई विशिष्ट शनि संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
        }
        return { hindi, english };
    }

    if (topic === 'marriage_obstacles_or_love') {
        english += `<h4>Marriage: ${heroIdentifier === 'obstacles' ? 'Obstacles' : 'Love Marriage Potential'}</h4>`;
        hindi += `<h4>विवाह: ${heroIdentifier === 'obstacles' ? 'बाधाएं' : 'प्रेम विवाह संभावना'}</h4>`;
        let found = false;
        const combinationsToCheck = heroIdentifier === 'obstacles'
            ? [`${PLANET_IDS.VENUS}-${PLANET_IDS.KETU}`, `${PLANET_IDS.KETU}-${PLANET_IDS.VENUS}`, `${PLANET_IDS.MARS}-${PLANET_IDS.KETU}`, `${PLANET_IDS.KETU}-${PLANET_IDS.MARS}`]
            : [`${PLANET_IDS.VENUS}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.VENUS}`, `${PLANET_IDS.MARS}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.MARS}`];

        combinationsToCheck.forEach(key => {
            if (bnnCombinationPredictions[key]) {
                found = true;
                const p1Id = parseInt(key.split('-')[0]);
                const p2Id = parseInt(key.split('-')[1]);
                const predictionData = bnnCombinationPredictions[key];
                const titleEn = `› ${planetNames[p1Id].en} & ${planetNames[p2Id].en} Combination:`;
                const titleHi = `› ${planetNames[p1Id].hi} और ${planetNames[p2Id].hi} संयोजन:`;
                english += `<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
                hindi += `<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        });
        if (!found) {
            english += `<p>No specific combinations found for ${heroIdentifier} in marriage.</p>`;
            hindi += `<p>विवाह में ${heroIdentifier} के लिए कोई विशिष्ट संयोजन नहीं मिला।</p>`;
        }
        return { hindi, english };
    }

    if (topic === 'progeny_issues') {
        english += `<h4>Progeny Issues: ${heroIdentifier === 'male_child' ? 'Male Child' : 'Female Child'}</h4>`;
        hindi += `<h4>संतान संबंधी समस्याएं: ${heroIdentifier === 'male_child' ? 'पुत्र संतान' : 'पुत्री संतान'}</h4>`;
        let found = false;
        const combinationsToCheck = heroIdentifier === 'male_child'
            ? [`${PLANET_IDS.SUN}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.SUN}`, `${PLANET_IDS.SUN}-${PLANET_IDS.KETU}`, `${PLANET_IDS.KETU}-${PLANET_IDS.SUN}`]
            : [`${PLANET_IDS.VENUS}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.VENUS}`];

        combinationsToCheck.forEach(key => {
            if (bnnCombinationPredictions[key]) {
                found = true;
                const p1Id = parseInt(key.split('-')[0]);
                const p2Id = parseInt(key.split('-')[1]);
                const predictionData = bnnCombinationPredictions[key];
                const titleEn = `› ${planetNames[p1Id].en} & ${planetNames[p2Id].en} Combination:`;
                const titleHi = `› ${planetNames[p1Id].hi} और ${planetNames[p2Id].hi} संयोजन:`;
                english += `<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
                hindi += `<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        });
         if (!found) {
            english += `<p>No specific combinations found for ${heroIdentifier} progeny issues.</p>`;
            hindi += `<p>${heroIdentifier} संतान संबंधी समस्याओं के लिए कोई विशिष्ट संयोजन नहीं मिला।</p>`;
        }
        return { hindi, english };
    }

    if (topic === 'education_mercury_combinations') {
        english += `<h4>Education: Mercury Combinations</h4>`;
        hindi += `<h4>शिक्षा: बुध संयोजन</h4>`;
        let found = false;
        [PLANET_IDS.JUPITER, PLANET_IDS.RAHU, PLANET_IDS.KETU].forEach(planetId => {
            const key1 = `${PLANET_IDS.MERCURY}-${planetId}`;
            const key2 = `${planetId}-${PLANET_IDS.MERCURY}`;
            
            let predictionData = null;
            let combinationOrderNoteEn = "";
            let combinationOrderNoteHi = "";

            if (bnnCombinationPredictions[key1]) {
                predictionData = bnnCombinationPredictions[key1];
                 combinationOrderNoteEn = `(Mercury → ${planetNames[planetId].en})`;
                combinationOrderNoteHi = `(बुध → ${planetNames[planetId].hi})`;
            } else if (bnnCombinationPredictions[key2]) {
                predictionData = bnnCombinationPredictions[key2];
                combinationOrderNoteEn = `(${planetNames[planetId].en} → Mercury)`;
                combinationOrderNoteHi = `(${planetNames[planetId].hi} → बुध)`;
            }

            if (predictionData) {
                found = true;
                const titleEn = `› Mercury with ${planetNames[planetId].en} ${combinationOrderNoteEn}:`;
                const titleHi = `› बुध ${planetNames[planetId].hi} के साथ ${combinationOrderNoteHi}:`;
                english += `<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
                hindi += `<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        });
        if (!found) {
            english += "<p>No specific Mercury combination predictions found in the database for education.</p>";
            hindi += "<p>शिक्षा के लिए डेटाबेस में कोई विशिष्ट बुध संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
        }
        return { hindi, english };
    }
    
    if (topic === 'health_patterns') {
        english += `<h4>Health Patterns related to: ${heroIdentifier}</h4>`;
        hindi += `<h4>स्वास्थ्य पैटर्न संबंधित: ${heroIdentifier}</h4>`;
        let foundHealthPattern = false;

        // Example: Skin Issues (Moon-Mercury)
        if (heroIdentifier.toLowerCase().includes('skin')) {
            const skinCombos = [`${PLANET_IDS.MOON}-${PLANET_IDS.MERCURY}`, `${PLANET_IDS.MERCURY}-${PLANET_IDS.MOON}`];
            skinCombos.forEach(key => {
                 if (bnnCombinationPredictions[key]) {
                    foundHealthPattern = true;
                    const p1Id = parseInt(key.split('-')[0]);
                    const p2Id = parseInt(key.split('-')[1]);
                    english += `<b>${planetNames[p1Id].en} & ${planetNames[p2Id].en}:</b><ul>${bnnCombinationPredictions[key].en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
                    hindi += `<b>${planetNames[p1Id].hi} और ${planetNames[p2Id].hi}:</b><ul>${(bnnCombinationPredictions[key].hi && bnnCombinationPredictions[key].hi.length > 0 ? bnnCombinationPredictions[key].hi : bnnCombinationPredictions[key].en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
                 }
            });
        }
        // Example: Diabetes (Venus-Moon)
        if (heroIdentifier.toLowerCase().includes('diabete')) { // to catch diabetes
            const diabetesCombos = [`${PLANET_IDS.VENUS}-${PLANET_IDS.MOON}`, `${PLANET_IDS.MOON}-${PLANET_IDS.VENUS}`];
             diabetesCombos.forEach(key => {
                 if (bnnCombinationPredictions[key]) {
                    foundHealthPattern = true;
                     const p1Id = parseInt(key.split('-')[0]);
                    const p2Id = parseInt(key.split('-')[1]);
                    english += `<b>${planetNames[p1Id].en} & ${planetNames[p2Id].en}:</b><ul>${bnnCombinationPredictions[key].en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
                    hindi += `<b>${planetNames[p1Id].hi} और ${planetNames[p2Id].hi}:</b><ul>${(bnnCombinationPredictions[key].hi && bnnCombinationPredictions[key].hi.length > 0 ? bnnCombinationPredictions[key].hi : bnnCombinationPredictions[key].en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
                 }
            });
        }
         // Example: Blood Disorders (Rahu-Mars)
        if (heroIdentifier.toLowerCase().includes('blood')) {
            const bloodDisorderCombos = [`${PLANET_IDS.RAHU}-${PLANET_IDS.MARS}`, `${PLANET_IDS.MARS}-${PLANET_IDS.RAHU}`];
             bloodDisorderCombos.forEach(key => {
                 if (bnnCombinationPredictions[key]) {
                    foundHealthPattern = true;
                     const p1Id = parseInt(key.split('-')[0]);
                    const p2Id = parseInt(key.split('-')[1]);
                    english += `<b>${planetNames[p1Id].en} & ${planetNames[p2Id].en}:</b><ul>${bnnCombinationPredictions[key].en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
                    hindi += `<b>${planetNames[p1Id].hi} और ${planetNames[p2Id].hi}:</b><ul>${(bnnCombinationPredictions[key].hi && bnnCombinationPredictions[key].hi.length > 0 ? bnnCombinationPredictions[key].hi : bnnCombinationPredictions[key].en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
                 }
            });
        }

        if (!foundHealthPattern) {
             english += `<p>No specific planetary combinations for '${heroIdentifier}' were pre-defined for detailed lookup. General planetary karakatwas for health may apply.</p>`;
             hindi += `<p>'${heroIdentifier}' के लिए कोई विशिष्ट ग्रहों का संयोजन विस्तृत लुकअप के लिए पूर्व-निर्धारित नहीं किया गया था। स्वास्थ्य के लिए सामान्य ग्रहों के कारकत्व लागू हो सकते हैं।</p>`;
        }
        return { hindi, english };
    }

    if (topic === 'property_venus_combinations') {
        english += `<h4>Property: Venus Combinations</h4>`;
        hindi += `<h4>संपत्ति: शुक्र संयोजन</h4>`;
        let found = false;
        [PLANET_IDS.MERCURY, PLANET_IDS.RAHU, PLANET_IDS.SATURN].forEach(planetId => {
            const key1 = `${PLANET_IDS.VENUS}-${planetId}`;
            const key2 = `${planetId}-${PLANET_IDS.VENUS}`;
            
            let predictionData = null;
            let combinationOrderNoteEn = "";
            let combinationOrderNoteHi = "";

            if (bnnCombinationPredictions[key1]) {
                predictionData = bnnCombinationPredictions[key1];
                combinationOrderNoteEn = `(Venus → ${planetNames[planetId].en})`;
                combinationOrderNoteHi = `(शुक्र → ${planetNames[planetId].hi})`;
            } else if (bnnCombinationPredictions[key2]) {
                predictionData = bnnCombinationPredictions[key2];
                combinationOrderNoteEn = `(${planetNames[planetId].en} → Venus)`;
                combinationOrderNoteHi = `(${planetNames[planetId].hi} → शुक्र)`;
            }

            if (predictionData) {
                found = true;
                const titleEn = `› Venus with ${planetNames[planetId].en} ${combinationOrderNoteEn}:`;
                const titleHi = `› शुक्र ${planetNames[planetId].hi} के साथ ${combinationOrderNoteHi}:`;
                english += `<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
                hindi += `<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        });
        if (!found) {
            english += "<p>No specific Venus combination predictions found in the database for property.</p>";
            hindi += "<p>संपत्ति के लिए डेटाबेस में कोई विशिष्ट शुक्र संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
        }
        return { hindi, english };
    }


    // --- Existing Transit, Profession, Progression, and Karmic Path Logic ---
    // (Assuming this part of the code is correct and doesn't need changes for the new features)
    if (topic === 'transit_jupiter' || topic === 'transit_saturn') {
        const transitData = topic === 'transit_jupiter' ? bnnTransitJupiter : bnnTransitSaturn;
        const transitPlanetNameEn = topic === 'transit_jupiter' ? "Jupiter" : "Saturn";
        const transitPlanetNameHi = topic === 'transit_jupiter' ? "बृहस्पति" : "शनि";
        
        const natalPlanetShort = typeof heroIdentifier === 'string' ? heroIdentifier.toUpperCase() : planetNames[heroIdentifier]?.short.toUpperCase();
        let natalPlanetId = typeof heroIdentifier === 'number' ? heroIdentifier : null;

        if (!natalPlanetId) {
             for (const key in PLANET_IDS) {
                if (planetNames[PLANET_IDS[key]] && planetNames[PLANET_IDS[key]].short.toUpperCase() === natalPlanetShort) {
                    natalPlanetId = PLANET_IDS[key];
                    break;
                }
            }
        }


        if (natalPlanetId && transitData[planetNames[natalPlanetId].short]) {
            const natalPlanetNameEn = planetNames[natalPlanetId].en;
            const natalPlanetNameHi = planetNames[natalPlanetId].hi;
            english += `<h4>Transit of ${transitPlanetNameEn} over Natal ${natalPlanetNameEn}:</h4>`;
            hindi += `<h4>जन्म ${natalPlanetNameHi} पर ${transitPlanetNameHi} का गोचर:</h4>`;
            english += `<p>${transitData[planetNames[natalPlanetId].short]}</p>`;
            hindi += `<p>${transitData[planetNames[natalPlanetId].short]}</p>`; // Direct copy for hi, assuming PDF content is the primary source
        } else {
            english = `<p>Transit information for ${transitPlanetNameEn} over ${heroIdentifier} not found.</p>`;
            hindi = `<p>${transitPlanetNameHi} का ${heroIdentifier} पर गोचर जानकारी नहीं मिली।</p>`;
        }
        return { hindi, english };
    }

    if (topic === 'profession') {
        if (bnnProfessionSaturnInRashi[heroIdentifier]) {
            english += `<h4>Profession: Saturn in ${heroIdentifier}</h4>`;
            hindi += `<h4>व्यवसाय: शनि ${heroIdentifier} में</h4>`;
            english += `<p>${bnnProfessionSaturnInRashi[heroIdentifier]}</p>`;
            hindi += `<p>${bnnProfessionSaturnInRashi[heroIdentifier]}</p>`;
        } else if (heroIdentifier.includes('+') && bnnProfessionSaturnWithPlanet[heroIdentifier.split('+').pop()]) { 
             const connectedPlanetShort = heroIdentifier.split('+').pop();
             let connectedPlanetId = null;
             for (const key in PLANET_IDS) {
                 if (planetNames[PLANET_IDS[key]] && planetNames[PLANET_IDS[key]].short.toUpperCase() === connectedPlanetShort.toUpperCase()) {
                     connectedPlanetId = PLANET_IDS[key];
                     break;
                 }
             }
             if(connectedPlanetId) {
                english += `<h4>Profession: Saturn with ${planetNames[connectedPlanetId].en}</h4>`;
                hindi += `<h4>व्यवसाय: शनि ${planetNames[connectedPlanetId].hi} के साथ</h4>`;
                english += `<p>${bnnProfessionSaturnWithPlanet[planetNames[connectedPlanetId].short]}</p>`;
                hindi += `<p>${bnnProfessionSaturnWithPlanet[planetNames[connectedPlanetId].short]}</p>`;
             }
        } else {
            let foundProfessionCombo = false;
            for (const profType in bnnProfessionSpecificCombos) {
                if (bnnProfessionSpecificCombos[profType][heroIdentifier]) {
                    english += `<h4>Profession: ${profType} (${heroIdentifier})</h4>`;
                    hindi += `<h4>व्यवसाय: ${profType} (${heroIdentifier})</h4>`;
                    english += `<p>${bnnProfessionSpecificCombos[profType][heroIdentifier]}</p>`;
                    hindi += `<p>${bnnProfessionSpecificCombos[profType][heroIdentifier]}</p>`;
                    foundProfessionCombo = true;
                    break;
                }
            }
            if (!foundProfessionCombo) {
                english = `<p>Profession information for '${heroIdentifier}' not found.</p>`;
                hindi = `<p>'${heroIdentifier}' के लिए व्यवसाय जानकारी नहीं मिली।</p>`;
            }
        }
        return { hindi, english };
    }

    if (topic === 'progression') {
        const heroPlanetId = PLANET_IDS.JUPITER;
return generateProgressionHtml(chartData);        
      
    }


    // --- Original Karmic Path Logic ---
    if (typeof heroIdentifier !== 'number') {
         return { hindi: "अमान्य हीरो ग्रह पहचानकर्ता।", english: "Invalid hero planet identifier." };
    }
    const heroPlanetId = parseInt(heroIdentifier, 10);
    const heroPlanet = chartData.find(p => p.id === heroPlanetId);
    if (!heroPlanet) {
        return { hindi: "हीरो ग्रह नहीं मिला।", english: "Hero Planet not found." };
    }

    const heroBhava = heroPlanet.bhava;

    const trineHousesFromHero = [
        heroBhava, 
        ((heroBhava - 1 + 4) % 12) + 1, 
        ((heroBhava - 1 + 8) % 12) + 1  
    ];
    const uniqueTrineHouses = [...new Set(trineHousesFromHero)]; 
    
    const twelfthHouseFromHero = ((heroBhava - 2 + 12) % 12) + 1;
    const secondHouseFromHero = (heroBhava % 12) + 1;

    let pastPlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && p.bhava === twelfthHouseFromHero);
    let presentPlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && uniqueTrineHouses.includes(p.bhava));
    let futurePlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && p.bhava === secondHouseFromHero);
    
    chartData.forEach(p => {
        if (p.retro && p.retro.toLowerCase().includes('r')) { 
             const prevBhava = ((p.bhava - 2 + 12) % 12) + 1;
             if (uniqueTrineHouses.includes(prevBhava) && !presentPlanets.some(pp => pp.id === p.id)) {
                let retroPlanet = JSON.parse(JSON.stringify(p)); 
                retroPlanet.isRetroActingInTrineFromNextHouse = true; 
                presentPlanets.push(retroPlanet);
             }
        }
    });

    pastPlanets.sort((a, b) => (a.long % 30) - (b.long % 30));
    presentPlanets.sort((a, b) => (a.long % 30) - (b.long % 30));
    futurePlanets.sort((a, b) => (a.long % 30) - (b.long % 30));

    const fullPathObjects = [...pastPlanets, ...presentPlanets, ...futurePlanets];
    
    const heroNameEn = planetNames[heroPlanetId].en;
    const heroNameHi = planetNames[heroPlanetId].hi;

    const formatPlanetWithDegree = (p, lang) => {
        const isHero = p.id === heroPlanetId ? (lang === 'hi' ? ' (हीरो)' : ' (Hero)') : '';
        const isRetro = p.retro && p.retro.toLowerCase().includes('r') ? (lang === 'hi' ? '(व)' : '(R)') : '';
        const degree = (p.long % 30).toFixed(1);
        const name = lang === 'hi' ? planetNames[p.id].short_hi : planetNames[p.id].short;
        return `${name}${isRetro} ${degree}°${isHero}`;
    };
    
    let pathEn = fullPathObjects.map(p => formatPlanetWithDegree(p, 'en')).join(' → ');
    let pathHi = fullPathObjects.map(p => formatPlanetWithDegree(p, 'hi')).join(' → ');

    english = `<p><b>Full Karmic Path (Past → Present → Future) for ${heroNameEn}:</b><br>${pathEn || "No planets found in the sequence."}</p>`;
    hindi = `<p><b>${heroNameHi} के लिए संपूर्ण कर्म पथ (अतीत → वर्तमान → भविष्य):</b><br>${pathHi || "क्रम में कोई ग्रह नहीं मिला।"}</p>`;

    english += `<p><b>Interpretation:</b> The life story for '${heroNameEn}' unfolds along this complete path.
                <ul>
                    <li style="margin-bottom:5px;"><b>Past (12th from Hero):</b> Influences from planets in the 12th house from ${heroNameEn}.</li>
                    <li style="margin-bottom:5px;"><b>Present (Trines to Hero - 1st, 5th, 9th houses from ${heroNameEn}):</b> Core sequence.</li>
                    <li><b>Future (2nd from Hero):</b> Path progresses towards planets in the 2nd house from ${heroNameEn}.</li>
                </ul></p>`;
    hindi += `<p><b>व्याख्या:</b> '${heroNameHi}' के लिए जीवन की कहानी इस संपूर्ण पथ पर आगे बढ़ती है।
                <ul>
                    <li style="margin-bottom:5px;"><b>अतीत (${heroNameHi} से १२वां भाव):</b> ${heroNameHi} से १२वें भाव के ग्रहों के प्रभाव से।</li>
                    <li style="margin-bottom:5px;"><b>वर्तमान (${heroNameHi} से त्रिकोण - ${heroNameHi} से १, ५, ९ भाव):</b> मुख्य क्रम।</li>
                    <li><b>भविष्य (${heroNameHi} से दूसरा भाव):</b> ${heroNameHi} से दूसरे भाव के ग्रहों की ओर।</li>
                </ul></p>`;

    let combinationInsightsEn = [];
    let combinationInsightsHi = [];

    for (let i = 0; i < fullPathObjects.length - 1; i++) {
        const p1 = fullPathObjects[i];
        const p2 = fullPathObjects[i + 1];
        const actualSequenceKey = `${p1.id}-${p2.id}`; 
        
        if (bnnCombinationPredictions[actualSequenceKey]) { 
            const predictionData = bnnCombinationPredictions[actualSequenceKey];
            const titleEn = `› ${planetNames[p1.id].en} (at ${ (p1.long % 30).toFixed(1)}°) → ${planetNames[p2.id].en} (at ${(p2.long % 30).toFixed(1)}°) Insights:`;
            const titleHi = `› ${planetNames[p1.id].hi} (${ (p1.long % 30).toFixed(1)}°) → ${planetNames[p2.id].hi} (${(p2.long % 30).toFixed(1)}°) अंतर्दृष्टि:`;
            
            combinationInsightsEn.push(`<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`);
             combinationInsightsHi.push(`<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`);
        }
    }
    
    if(combinationInsightsEn.length > 0){
        english += `<hr><h4>Specific Combination Insights:</h4>${combinationInsightsEn.join('')}`;
        hindi += `<hr><h4>विशिष्ट संयोजन अंतर्दृष्टि:</h4>${combinationInsightsHi.join('')}`;
    }

    const involvedPlanets = new Set(fullPathObjects.map(p => p.id));
    if (involvedPlanets.size > 0) {
        english += `<hr><p><strong>All Involved Planets (Karakas) in this sequence:</strong></p>`;
        hindi += `<hr><p><strong>इस क्रम में सभी शामिल ग्रह (कारक):</strong></p>`;
        
        let planetsRow = "<div style='display:flex; flex-wrap:wrap; gap:15px; justify-content:center;'>";
        involvedPlanets.forEach(pId => {
            planetsRow += `<span style='border:1px solid #ccc; padding: 5px 8px; border-radius:4px;'>${planetNames[pId].en} (${planetNames[pId].hi})</span>`;
        });
        planetsRow += "</div>";

        english += planetsRow;
        hindi += planetsRow;
    } */
    
    // return { hindi, english };
    
    switch (topic) {
        
        case 'core_principles':
        
             return generateCorePrinciplesHtml();
        case 'special_yogas':
            return generateSpecialYogasHtml();
         // **FIXED HERE:** Added return statements for these cases
        case 'career':
        case 'money':
        case 'marriage':
        case 'karmic_path':
        if (heroIdentifier == null)
        {heroIdentifier = subject; }
        // alert('topic: '+topic);
        // alert('subject: '+subject);
        // alert('heroIdentifier: ' +heroIdentifier );
            return generateKarmicPathHtml(chartData, heroIdentifier);    
            
        case 'education_analysis':
            return generateEducationAnalysisHtml(chartData);
        case 'karmic_path':
            return generateKarmicPathHtml(chartData, heroIdentifier);
        // case 'career_saturn_combinations':
            // return generateKarmicPathHtml(chartData, heroIdentifier);    
        case 'transit_jupiter':
        case 'transit_saturn':
            return generateTransitHtml(topic, heroIdentifier);
        case 'progression':
            return generateProgressionHtml(chartData);
             case 'profession':
            return generateProfessionHtml(chartData);
        case 'career_saturn_combinations':
        
            return generateCareerSaturnCombinationsHtml();
        case 'marriage_obstacles_or_love':
            return generateMarriageObstaclesLoveHtml(heroIdentifier);
        case 'progeny_issues':
            return generateProgenyIssuesHtml(heroIdentifier);
        case 'education_mercury_combinations':
            return generateEducationMercuryCombinationsHtml();
        case 'health_patterns':
            return generateHealthPatternsHtml(heroIdentifier);
        case 'property_venus_combinations':
            return generatePropertyVenusCombinationsHtml();
           default:
            return {
                english: `<p>Analysis for topic "${topic}" is under development.</p>`,
                hindi: `<p>विषय "${topic}" के लिए विश्लेषण विकाсаधीन है।</p>`
            };  
            // hindi += `<details open><summary><b>${principle.title_hi}</b></summary>`;
        // english += `<p><b>Principle:</b> <i>${principle.principle_en}</i></p><b>Results:</b><ul>${principle.results.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
        // hindi += `<p><b>सिद्धांत:</b> <i>${principle.principle_hi}</i></p><b>परिणाम:</b><ul>${principle.results.hi.map(item => `<li>${item}</li>`).join('')}</ul>`;
        // english += `</details>`;
        // hindi += `</details>`;
    }
    // return {  english,hindi };
}
/**
 * Generates the HTML for a Bhrigu Nandi Nadi (BNN) Karmic Path analysis for a specific hero planet.
 * @param {Array} chartData - The complete natal chart data array.
 * @param {number} heroIdentifier - The PLANET_ID of the hero planet for the analysis.
 * @returns {object} An object with 'hindi' and 'english' prediction strings, or an error object.
 */

function generateSpecialYogasHtml() {
    let english = `<h3>Special BNN Yogas</h3>`;
    let hindi = `<h3>विशेष बीएनएन योग</h3>`;
    for (const key in bnnSpecialYogas) {
        const yoga = bnnSpecialYogas[key];
        english += `<details open><summary><b>${yoga.title_en}</b></summary>`;
        hindi += `<details open><summary><b>${yoga.title_hi}</b></summary>`;
        english += `<p><b>Cause:</b> ${yoga.cause_en}</p>`;
        hindi += `<p><b>कारण:</b> ${yoga.cause_hi}</p>`;
        english += `<p><b>Principle:</b> <i>${yoga.principle_en}</i></p>`;
        hindi += `<p><b>सिद्धांत:</b> <i>${yoga.principle_hi}</i></p>`;
        english += `<b>Results:</b><ul>${yoga.results.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
        hindi += `<b>परिणाम:</b><ul>${yoga.results.hi.map(item => `<li>${item}</li>`).join('')}</ul>`;
        english += `</details>`;
        hindi += `</details>`;
    }
    return { english,hindi };
}
// --- HTML Generation Helper Functions ---

function generateCorePrinciplesHtml() {
    let english = ``;
    let hindi = ``;
    alert ('tt');
    for (const key in bnnCorePrinciples) {
        const principle = bnnCorePrinciples[key];
        english += `<details open><summary><b>${principle.title_en}</b></summary>`;
        hindi += `<details open><summary><b>${principle.title_hi}</b></summary>`;
        english += `<p><b>Principle:</b> <i>${principle.principle_en}</i></p><b>Results:</b><ul>${principle.results.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
        hindi += `<p><b>सिद्धांत:</b> <i>${principle.principle_hi}</i></p><b>परिणाम:</b><ul>${principle.results.hi.map(item => `<li>${item}</li>`).join('')}</ul>`;
        english += `</details>`;
        hindi += `</details>`;
    }
    return {  english,hindi };
}
function generateEducationAnalysisHtml(chartData) {
    let english = `<h3>Education Analysis (Mercury as Hero)</h3>`;
    let hindi = `<h3>शिक्षा विश्लेषण (बुध नायक के रूप में)</h3>`;
    const mercury = chartData.find(p => p.id === PLANET_IDS.MERCURY);
    if (!mercury) {
        return { english: "<p>Mercury not found in chart data.</p>", hindi: "<p>चार्ट डेटा में बुध नहीं मिला।</p>" };
    }

    const mercuryBhava = mercury.bhava;
    const connectedPlanets = chartData.filter(p => {
        const pBhava = p.bhava;
        if (p.id === PLANET_IDS.ASC || p.id === PLANET_IDS.MERCURY) return false;
        const trineHouses = [mercuryBhava, ((mercuryBhava - 1 + 4) % 12) + 1, ((mercuryBhava - 1 + 8) % 12) + 1];
        const twelfthHouse = ((mercuryBhava - 2 + 12) % 12) + 1;
        const secondHouse = (mercuryBhava % 12) + 1;
        return [...new Set(trineHouses)].includes(pBhava) || pBhava === twelfthHouse || pBhava === secondHouse;
    });
    
    const promotersFound = [], blockersFound = [];
    connectedPlanets.forEach(p => {
        const pShort = planetNames[p.id].short;
        if (bnnEducation.promoters.planets[pShort]) {
            promotersFound.push({ name_en: planetNames[p.id].en, name_hi: planetNames[p.id].hi, details_en: bnnEducation.promoters.planets[pShort].en, details_hi: bnnEducation.promoters.planets[pShort].hi });
        }
        if (bnnEducation.blockers.planets[pShort]) {
            blockersFound.push({ name_en: planetNames[p.id].en, name_hi: planetNames[p.id].hi, details_en: bnnEducation.blockers.planets[pShort].en, details_hi: bnnEducation.blockers.planets[pShort].hi });
        }
    });

    english += `<h4>Education Promoters Found in Chart:</h4>`;
    if (promotersFound.length > 0) {
        english += `<ul>${promotersFound.map(p => `<li><b>${p.name_en}:</b> ${p.details_en}</li>`).join('')}</ul>`;
    } else { english += `<p>No direct promoters are connected to Mercury.</p>`; }

    english += `<hr><h4>Education Blockers / Stream-Changers Found:</h4><p><i><b>Principle:</b> ${bnnEducation.blockers.principle_en}</i></p>`;
    if (blockersFound.length > 0) {
        english += `<ul>${blockersFound.map(p => `<li><b>${p.name_en}:</b> ${p.details_en}</li>`).join('')}</ul>`;
    } else { english += `<p>No direct blockers are connected to Mercury. The education path may be smooth.</p>`; }
    
    hindi += `<h4>चार्ट में मिले शिक्षा प्रवर्तक:</h4>`;
    if (promotersFound.length > 0) {
        hindi += `<ul>${promotersFound.map(p => `<li><b>${p.name_hi}:</b> ${p.details_hi}</li>`).join('')}</ul>`;
    } else { hindi += `<p>बुध से कोई सीधा प्रवर्तक नहीं जुड़ा है।</p>`; }
    
    hindi += `<hr><h4>मिले शिक्षा अवरोधक / धारा-परिवर्तक:</h4><p><i><b>सिद्धांत:</b> ${bnnEducation.blockers.principle_hi}</i></p>`;
    if (blockersFound.length > 0) {
        hindi += `<ul>${blockersFound.map(p => `<li><b>${p.name_hi}:</b> ${p.details_hi}</li>`).join('')}</ul>`;
    } else { hindi += `<p>बुध से कोई सीधा अवरोधक नहीं जुड़ा है। शिक्षा का मार्ग सहज हो सकता है।</p>`; }
    
    let finalAnalysisEn = "<hr><h4>Overall Educational Path:</h4><ul>";
    let finalAnalysisHi = "<hr><h4>समग्र शैक्षिक पथ:</h4><ul>";
    if (promotersFound.length > 0 && blockersFound.length === 0) {
        finalAnalysisEn += "<li>The educational path appears smooth and supported. High achievement is likely.</li>";
        finalAnalysisHi += "<li>शैक्षिक पथ सहज और समर्थित प्रतीत होता है। उच्च उपलब्धि की संभावना है।</li>";
    } else if (promotersFound.length > 0 && blockersFound.length > 0) {
        finalAnalysisEn += "<li>The path may have breaks or challenges (due to blockers), but promoters indicate the native can overcome these, possibly by choosing a suitable stream, and achieve success. This often indicates a 'Stop and Restart' pattern.</li>";
        finalAnalysisHi += "<li>पथ में रुकावटें या चुनौतियाँ (अवरोधकों के कारण) हो सकती हैं, लेकिन प्रवर्तकों की उपस्थिति यह दर्शाती है कि जातक इन पर काबू पा सकता है, संभवतः एक उपयुक्त धारा चुनकर, और सफलता प्राप्त कर सकता है। यह अक्सर शिक्षा में 'रुको और फिर से शुरू करो' पैटर्न को इंगित करता है।</li>";
    } else if (promotersFound.length === 0 && blockersFound.length > 0) {
        finalAnalysisEn += "<li>Education could be challenging. It is crucial to choose a field aligned with the 'blocker' planets (e.g., technical studies for Mars) to turn the obstacle into a specialization. Otherwise, education may be incomplete.</li>";
        finalAnalysisHi += "<li>शिक्षा चुनौतीपूर्ण हो सकती है। 'अवरोधक' ग्रहों के अनुरूप एक क्षेत्र चुनना महत्वपूर्ण है (जैसे, मंगल के लिए तकनीकी अध्ययन) ताकि बाधा को विशेषज्ञता में बदल दिया जा सके। अन्यथा, शिक्षा अधूरी रह सकती है।</li>";
    } else {
        finalAnalysisEn += "<li>The educational path seems neutral and will be heavily influenced by transits and dasha periods.</li>";
        finalAnalysisHi += "<li>शैक्षिक पथ तटस्थ प्रतीत होता है और यह गोचर और दशा अवधियों से बहुत प्रभावित होगा।</li>";
    }
    english += finalAnalysisEn + "</ul>";
    hindi += finalAnalysisHi + "</ul>";
    
    return {  english ,hindi};
}

function generateTransitHtml(topic, heroIdentifier) {
    const transitData = topic === 'transit_jupiter' ? bnnTransitJupiter : bnnTransitSaturn;
    const transitPlanetNameEn = topic === 'transit_jupiter' ? "Jupiter" : "Saturn";
    const transitPlanetNameHi = topic === 'transit_jupiter' ? "बृहस्पति" : "शनि";

    const natalPlanetShort = planetNames[heroIdentifier]?.short;
    const natalPlanetNameEn = planetNames[heroIdentifier]?.en;
    const natalPlanetNameHi = planetNames[heroIdentifier]?.hi;

    let english = "", hindi = "";

    if (natalPlanetShort && transitData[natalPlanetShort]) {
        const data = transitData[natalPlanetShort];
        english += `<h4>Transit of ${transitPlanetNameEn} over Natal ${natalPlanetNameEn}</h4>`;
        hindi += `<h4>जन्म ${natalPlanetNameHi} पर ${transitPlanetNameHi} का गोचर</h4>`;
        english += `<p><b>Principle:</b> <i>${data.principle.en}</i></p>`;
        hindi += `<p><b>सिद्धांत:</b> <i>${data.principle.hi}</i></p>`;
        english += `<p><b>Result:</b> ${data.prediction.en}</p>`;
        hindi += `<p><b>परिणाम:</b> ${data.prediction.hi}</p>`;
    } else {
        english = `<p>Transit information not found.</p>`;
        hindi = `<p>गोचर जानकारी नहीं मिली।</p>`;
    }
    return {  english,hindi };
}

function generateKarmicPathHtml2(chartData, heroIdentifier) {
    const heroPlanetId = parseInt(heroIdentifier, 10);
    const heroPlanet = chartData.find(p => p.id === heroPlanetId);
    if (!heroPlanet) {
        return { hindi: "हीरो ग्रह नहीं मिला।", english: "Hero Planet not found." };
    }

    const heroBhava = heroPlanet.bhava;
    const trineHousesFromHero = [heroBhava, ((heroBhava - 1 + 4) % 12) + 1, ((heroBhava - 1 + 8) % 12) + 1];
     const uniqueTrineHouses = [...new Set(trineHousesFromHero)];
    
    const twelfthHouseFromHero = ((heroBhava - 2 + 12) % 12) + 1;
    const secondHouseFromHero = (heroBhava % 12) + 1;

    let pastPlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && p.bhava === twelfthHouseFromHero);
    let presentPlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && [...new Set(trineHousesFromHero)].includes(p.bhava));
    let futurePlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && p.bhava === secondHouseFromHero);
    chartData.forEach(p => {
        if (p.retro && p.retro.toLowerCase().includes('r')) { 
             const prevBhava = ((p.bhava - 2 + 12) % 12) + 1;
             if (uniqueTrineHouses.includes(prevBhava) && !presentPlanets.some(pp => pp.id === p.id)) {
                let retroPlanet = JSON.parse(JSON.stringify(p)); 
                retroPlanet.isRetroActingInTrineFromNextHouse = true; 
                presentPlanets.push(retroPlanet);
             }
        }
    });
    const sortByDegree = (a, b) => (a.long % 30) - (b.long % 30);
    pastPlanets.sort(sortByDegree);
    presentPlanets.sort(sortByDegree);
    futurePlanets.sort(sortByDegree);

    const fullPathObjects = [...pastPlanets, ...presentPlanets, ...futurePlanets];
    
    const heroNameEn = planetNames[heroPlanetId].en;
    const heroNameHi = planetNames[heroPlanetId].hi;
    const formatPlanet = (p, lang) => {
        const name = lang === 'hi' ? planetNames[p.id].short_hi : planetNames[p.id].short;
        const retro = p.retro && p.retro.toLowerCase().includes('r') ? (lang === 'hi' ? '(व)' : '(R)') : '';
        return `${name}${retro}`;
    };
    
    let pathEn = fullPathObjects.map(p => formatPlanet(p, 'en')).join(' → ');
    let pathHi = fullPathObjects.map(p => formatPlanet(p, 'hi')).join(' → ');
    let english = `<p><b>Karmic Path for ${heroNameEn}:</b><br>${pathEn || "No planets in sequence."}</p>`;
    let hindi = `<p><b>${heroNameHi} के लिए कर्म पथ:</b><br>${pathHi || "क्रम में कोई ग्रह नहीं।"}</p>`;

    let combinationInsightsEn = [];
    let combinationInsightsHi = [];
    for (let i = 0; i < fullPathObjects.length - 1; i++) {
        const p1 = fullPathObjects[i];
        const p2 = fullPathObjects[i + 1];
        const key = `${p1.id}-${p2.id}`;
        
        if (bnnCombinationPredictions[key]) {
            const pred = bnnCombinationPredictions[key];
            const titleEn = `› ${planetNames[p1.id].en} → ${planetNames[p2.id].en}`;
            const titleHi = `› ${planetNames[p1.id].hi} → ${planetNames[p2.id].hi}`;
            
            combinationInsightsEn.push(`<details><summary><b>${titleEn}</b></summary>
                <p><i><b>Principle:</b> ${pred.principle.en}</i></p>
                <ul>${pred.en.map(item => `<li>${item}</li>`).join('')}</ul></details>`);
            combinationInsightsHi.push(`<details><summary><b>${titleHi}</b></summary>
                <p><i><b>सिद्धांत:</b> ${pred.principle.hi}</i></p>
                <ul>${(pred.hi || pred.en).map(item => `<li>${item}</li>`).join('')}</ul></details>`);
        }
    }
    
    if (combinationInsightsEn.length > 0) {
        english += `<hr><h4>Specific Combination Insights:</h4>${combinationInsightsEn.join('')}`;
        hindi += `<hr><h4>विशिष्ट संयोजन अंतर्दृष्टि:</h4>${combinationInsightsHi.join('')}`;
    }

    return {  english,hindi };
}

function generateProgressionHtml(chartData) {
    let english = `<h3>Progression of Jupiter (बृहस्पति की प्रगति)</h3>`;
    let hindi = `<h3>बृहस्पति की प्रगति (Progression of Jupiter)</h3>`;

    bnnProgressionJupiter.rounds.forEach(round => {
        english += `<details><summary><b>Round ${round.house} (${round.years} Years): ${round.focus}</b></summary>`;
        hindi += `<details><summary><b>राउंड ${round.house} (${round.years} वर्ष): ${round.focus}</b></summary>`;
        
        const exampleRoundKey = `round${round.house}_${round.years.replace('-', '_').replace(' ','_')}_years`;

        if (bnnProgressionJupiter.example_interpretation[exampleRoundKey]) {
            const exampleData = bnnProgressionJupiter.example_interpretation[exampleRoundKey];
            english += `<p><i>Planet String (Example): ${exampleData.string_planets.join(', ')}</i></p><ul>`;
            hindi += `<p><i>ग्रह श्रृंखला (उदाहरण): ${exampleData.string_planets.join(', ')}</i></p><ul>`;
            exampleData.year_events.forEach(event => {
                english += `<li>${event}</li>`;
                hindi += `<li>${event}</li>`;
            });
            english += `</ul>`;
            hindi += `</ul>`;
        } else {
            english += `<p><i>Detailed string formation rules apply. Specific planets for this round need to be determined based on Jupiter's natal position. Example data for this round not found.</i></p>`;
            hindi += `<p><i>विस्तृत स्ट्रिंग गठन नियम लागू होते हैं। इस दौर के लिए विशिष्ट ग्रहों का निर्धारण बृहस्पति की जन्म स्थिति के आधार पर किया जाना चाहिए। इस दौर के लिए उदाहरण डेटा नहीं मिला।</i></p>`;
        }
        english += `</details>`;
        hindi += `</details>`;
    });
    
    english += `<hr><h4>General Rules of Progression:</h4><ul>${bnnProgressionJupiter.rules_string_formation.map(r => `<li>${r}</li>`).join('')}</ul>`;
    hindi += `<hr><h4>प्रगति के सामान्य नियम:</h4><ul>${bnnProgressionJupiter.rules_string_formation.map(r => `<li>${r}</li>`).join('')}</ul>`;

    return {  english,hindi };
}
function generateProfessionHtml(heroIdentifier) {
    let english = "", hindi = "";
    if (bnnProfessionSaturnInRashi[heroIdentifier]) {
        english += `<h4>Profession: Saturn in ${heroIdentifier}</h4><p>${bnnProfessionSaturnInRashi[heroIdentifier]}</p>`;
        hindi += `<h4>व्यवसाय: शनि ${heroIdentifier} में</h4><p>${bnnProfessionSaturnInRashi[heroIdentifier]}</p>`;
    } else if (heroIdentifier.includes('+') && bnnProfessionSaturnWithPlanet[heroIdentifier.split('+').pop()]) { 
         const connectedPlanetShort = heroIdentifier.split('+').pop();
         let connectedPlanetId = Object.keys(PLANET_IDS).find(key => planetNames[PLANET_IDS[key]]?.short.toUpperCase() === connectedPlanetShort.toUpperCase());
         if(connectedPlanetId) {
            const planetId = PLANET_IDS[connectedPlanetId];
            english += `<h4>Profession: Saturn with ${planetNames[planetId].en}</h4><p>${bnnProfessionSaturnWithPlanet[planetNames[planetId].short]}</p>`;
            hindi += `<h4>व्यवसाय: शनि ${planetNames[planetId].hi} के साथ</h4><p>${bnnProfessionSaturnWithPlanet[planetNames[planetId].short]}</p>`;
         }
    } else {
        let found = false;
        for (const profType in bnnProfessionSpecificCombos) {
            if (bnnProfessionSpecificCombos[profType][heroIdentifier]) {
                english += `<h4>Profession: ${profType} (${heroIdentifier})</h4><p>${bnnProfessionSpecificCombos[profType][heroIdentifier]}</p>`;
                hindi += `<h4>व्यवसाय: ${profType} (${heroIdentifier})</h4><p>${bnnProfessionSpecificCombos[profType][heroIdentifier]}</p>`;
                found = true; break;
            }
        }
        if (!found) {
            english = `<p>Profession information for '${heroIdentifier}' not found.</p>`;
            hindi = `<p>'${heroIdentifier}' के लिए व्यवसाय जानकारी नहीं मिली।</p>`;
        }
    }
    return {  english,hindi };
}
function generateCareerSaturnCombinationsHtml() {
    let english = "";
    let hindi = "";
    alert('career saturn2');
    english += `<h4>Career/Profession: Saturn Combinations</h4>`;
        hindi += `<h4>करियर/व्यवसाय: शनि संयोजन</h4>`;
        let found = false;
        // Iterate through all planets Saturn can combine with
        for (const planetKey in PLANET_IDS) {
            if (PLANET_IDS.hasOwnProperty(planetKey) && PLANET_IDS[planetKey] !== PLANET_IDS.SATURN && PLANET_IDS[planetKey] !== PLANET_IDS.ASC) {
                const planetId = PLANET_IDS[planetKey];
                const key1 = `${PLANET_IDS.SATURN}-${planetId}`; // Saturn first
                const key2 = `${planetId}-${PLANET_IDS.SATURN}`; // Saturn second
                alert('career saturn');
                let predictionData = null;
                let combinationOrderNoteEn = "";
                let combinationOrderNoteHi = "";

                if (bnnCombinationPredictions[key1]) {
                    predictionData = bnnCombinationPredictions[key1];
                    combinationOrderNoteEn = `(Saturn → ${planetNames[planetId].en})`;
                    combinationOrderNoteHi = `(शनि → ${planetNames[planetId].hi})`;
                } else if (bnnCombinationPredictions[key2]) {
                    predictionData = bnnCombinationPredictions[key2];
                    combinationOrderNoteEn = `(${planetNames[planetId].en} → Saturn)`;
                    combinationOrderNoteHi = `(${planetNames[planetId].hi} → शनि)`;
                }

                if (predictionData) {
                    found = true;
                    const titleEn = `› Saturn with ${planetNames[planetId].en} ${combinationOrderNoteEn}:`;
                    const titleHi = `› शनि ${planetNames[planetId].hi} के साथ ${combinationOrderNoteHi}:`;
                    english += `<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
                    hindi += `<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
                }
            }
        }
        if (!found) {
            english += "<p>No specific Saturn combination predictions found in the database for career.</p>";
            hindi += "<p>करियर के लिए डेटाबेस में कोई विशिष्ट शनि संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
        }
        return { english,hindi };
}
function generateCareerSaturnCombinationsHtml3() {
    let english = "", hindi = "";
    let found = false;
    for (const planetKey in PLANET_IDS) {
        const planetId = PLANET_IDS[planetKey];
        if (planetId !== PLANET_IDS.SATURN && planetId !== PLANET_IDS.ASC) {
            const key1 = `${PLANET_IDS.SATURN}-${planetId}`, key2 = `${planetId}-${PLANET_IDS.SATURN}`;
            let predData = null, noteEn = "", noteHi = "";
            if (bnnCombinationPredictions[key1]) {
                predData = bnnCombinationPredictions[key1];
                noteEn = `(Saturn → ${planetNames[planetId].en})`; noteHi = `(शनि → ${planetNames[planetId].hi})`;
            } else if (bnnCombinationPredictions[key2]) {
                predData = bnnCombinationPredictions[key2];
                noteEn = `(${planetNames[planetId].en} → Saturn)`; noteHi = `(${planetNames[planetId].hi} → शनि)`;
            }
            if (predData) {
                found = true;
                english += `<b>› Saturn with ${planetNames[planetId].en} ${noteEn}:</b><ul>${predData.en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
                hindi += `<b>› शनि ${planetNames[planetId].hi} के साथ ${noteHi}:</b><ul>${(predData.hi||predData.en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
            }
        }
    }
    if (!found) {
        english += "<p>No specific Saturn combination predictions found.</p>";
        hindi += "<p>कोई विशिष्ट शनि संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
    }
    return { english, hindi };
}

function generatePropertyVenusCombinationsHtml() {
    let english = "", hindi = "";
    let found = false;
    [PLANET_IDS.MERCURY, PLANET_IDS.RAHU, PLANET_IDS.SATURN].forEach(planetId => {
        const key1 = `${PLANET_IDS.VENUS}-${planetId}`, key2 = `${planetId}-${PLANET_IDS.VENUS}`;
        let predData = null, noteEn = "", noteHi = "";
        if (bnnCombinationPredictions[key1]) {
            predData = bnnCombinationPredictions[key1];
            noteEn = `(Venus → ${planetNames[planetId].en})`; noteHi = `(शुक्र → ${planetNames[planetId].hi})`;
        } else if (bnnCombinationPredictions[key2]) {
            predData = bnnCombinationPredictions[key2];
            noteEn = `(${planetNames[planetId].en} → Venus)`; noteHi = `(${planetNames[planetId].hi} → शुक्र)`;
        }
        if (predData) {
            found = true;
            english += `<b>› Venus with ${planetNames[planetId].en} ${noteEn}:</b><ul>${predData.en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
            hindi += `<b>› शुक्र ${planetNames[planetId].hi} के साथ ${noteHi}:</b><ul>${(predData.hi||predData.en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
        }
    });
    if (!found) {
        english += "<p>No specific Venus combination predictions found for property.</p>";
        hindi += "<p>संपत्ति के लिए कोई विशिष्ट शुक्र संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
    }
    return { english, hindi };
}

function generateMarriageObstaclesLoveHtml(heroIdentifier) {
    let english = "", hindi = "";
    let found = false;
    const combinationsToCheck = heroIdentifier === 'obstacles'
        ? [`${PLANET_IDS.VENUS}-${PLANET_IDS.KETU}`, `${PLANET_IDS.KETU}-${PLANET_IDS.VENUS}`, `${PLANET_IDS.MARS}-${PLANET_IDS.KETU}`, `${PLANET_IDS.KETU}-${PLANET_IDS.MARS}`]
        : [`${PLANET_IDS.VENUS}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.VENUS}`, `${PLANET_IDS.MARS}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.MARS}`];

    combinationsToCheck.forEach(key => {
        if (bnnCombinationPredictions[key]) {
            found = true;
            const p1Id = parseInt(key.split('-')[0]), p2Id = parseInt(key.split('-')[1]);
            const predData = bnnCombinationPredictions[key];
            const titleEn = `› ${planetNames[p1Id].en} & ${planetNames[p2Id].en} Combination:`;
            const titleHi = `› ${planetNames[p1Id].hi} और ${planetNames[p2Id].hi} संयोजन:`;
            english += `<b>${titleEn}</b><ul>${predData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
            hindi += `<b>${titleHi}</b><ul>${(predData.hi && predData.hi.length > 0 ? predData.hi : predData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
    });
    if (!found) {
        english += `<p>No specific combinations found for ${heroIdentifier.replace(/_/g, ' ')} in marriage.</p>`;
        hindi += `<p>विवाह में ${heroIdentifier.replace(/_/g, ' ')} के लिए कोई विशिष्ट संयोजन नहीं मिला।</p>`;
    }
    return { english, hindi };
}

function generateProgenyIssuesHtml(heroIdentifier) {
    let english = "", hindi = "";
    let found = false;
    const combinationsToCheck = heroIdentifier === 'male_child'
        ? [`${PLANET_IDS.SUN}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.SUN}`, `${PLANET_IDS.SUN}-${PLANET_IDS.KETU}`, `${PLANET_IDS.KETU}-${PLANET_IDS.SUN}`]
        : [`${PLANET_IDS.VENUS}-${PLANET_IDS.RAHU}`, `${PLANET_IDS.RAHU}-${PLANET_IDS.VENUS}`];

    combinationsToCheck.forEach(key => {
        if (bnnCombinationPredictions[key]) {
            found = true;
            const p1Id = parseInt(key.split('-')[0]), p2Id = parseInt(key.split('-')[1]);
            const predData = bnnCombinationPredictions[key];
            const titleEn = `› ${planetNames[p1Id].en} & ${planetNames[p2Id].en} Combination:`;
            const titleHi = `› ${planetNames[p1Id].hi} और ${planetNames[p2Id].hi} संयोजन:`;
            english += `<b>${titleEn}</b><ul>${predData.en.map(item => `<li>${item}</li>`).join('')}</ul>`;
            hindi += `<b>${titleHi}</b><ul>${(predData.hi && predData.hi.length > 0 ? predData.hi : predData.en).map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
    });
     if (!found) {
        english += `<p>No specific combinations found for ${heroIdentifier.replace(/_/g, ' ')} progeny issues.</p>`;
        hindi += `<p>${heroIdentifier.replace(/_/g, ' ')} संतान संबंधी समस्याओं के लिए कोई विशिष्ट संयोजन नहीं मिला।</p>`;
    }
    return { english, hindi };
}

function generateEducationMercuryCombinationsHtml() {
    let english = "", hindi = "";
    let found = false;
    [PLANET_IDS.JUPITER, PLANET_IDS.RAHU, PLANET_IDS.KETU].forEach(planetId => {
        const key1 = `${PLANET_IDS.MERCURY}-${planetId}`, key2 = `${planetId}-${PLANET_IDS.MERCURY}`;
        let predData = null, noteEn = "", noteHi = "";

        if (bnnCombinationPredictions[key1]) {
            predData = bnnCombinationPredictions[key1];
            noteEn = `(Mercury → ${planetNames[planetId].en})`; noteHi = `(बुध → ${planetNames[planetId].hi})`;
        } else if (bnnCombinationPredictions[key2]) {
            predData = bnnCombinationPredictions[key2];
            noteEn = `(${planetNames[planetId].en} → Mercury)`; noteHi = `(${planetNames[planetId].hi} → बुध)`;
        }

        if (predData) {
            found = true;
            english += `<b>› Mercury with ${planetNames[planetId].en} ${noteEn}:</b><ul>${predData.en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
            hindi += `<b>› बुध ${planetNames[planetId].hi} के साथ ${noteHi}:</b><ul>${(predData.hi||predData.en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
        }
    });
    if (!found) {
        english += "<p>No specific Mercury combination predictions found for education.</p>";
        hindi += "<p>शिक्षा के लिए डेटाबेस में कोई विशिष्ट बुध संयोजन भविष्यवाणियां नहीं मिलीं।</p>";
    }
    return { english, hindi };
}

function generateHealthPatternsHtml(heroIdentifier) {
    let english = "", hindi = "";
    let foundHealthPattern = false;
    const healthMap = {
        'skin_issues': [`${PLANET_IDS.MOON}-${PLANET_IDS.MERCURY}`, `${PLANET_IDS.MERCURY}-${PLANET_IDS.MOON}`],
        'diabetes': [`${PLANET_IDS.VENUS}-${PLANET_IDS.MOON}`, `${PLANET_IDS.MOON}-${PLANET_IDS.VENUS}`],
        'blood_disorders': [`${PLANET_IDS.RAHU}-${PLANET_IDS.MARS}`, `${PLANET_IDS.MARS}-${PLANET_IDS.RAHU}`],
        'eye_issues': [`${PLANET_IDS.SUN}-${PLANET_IDS.VENUS}`, `${PLANET_IDS.VENUS}-${PLANET_IDS.SUN}`],
        'bone_joint_issues': [`${PLANET_IDS.SUN}-${PLANET_IDS.SATURN}`, `${PLANET_IDS.SATURN}-${PLANET_IDS.SUN}`]
    };
    const combos = healthMap[heroIdentifier];
    if (combos) {
        combos.forEach(comboKey => {
             if (bnnCombinationPredictions[comboKey]) {
                foundHealthPattern = true;
                const p1Id = parseInt(comboKey.split('-')[0]), p2Id = parseInt(comboKey.split('-')[1]);
                english += `<b>${planetNames[p1Id].en} & ${planetNames[p2Id].en}:</b><ul>${bnnCombinationPredictions[comboKey].en.map(i=>`<li>${i}</li>`).join('')}</ul>`;
                hindi += `<b>${planetNames[p1Id].hi} और ${planetNames[p2Id].hi}:</b><ul>${(bnnCombinationPredictions[comboKey].hi||bnnCombinationPredictions[comboKey].en).map(i=>`<li>${i}</li>`).join('')}</ul>`;
             }
        });
    }
    if (!foundHealthPattern) {
         english += `<p>No specific planetary combinations for '${heroIdentifier.replace(/_/g, ' ')}' were found in the database.</p>`;
         hindi += `<p>'${heroIdentifier.replace(/_/g, ' ')}' के लिए डेटाबेस में कोई विशिष्ट ग्रहों का संयोजन नहीं मिला।</p>`;
    }
    return { english, hindi };
}

function generateKarmicPathHtml(chartData, heroIdentifier) {
    let english = "", hindi = "";
    // alert ('generateKarmicPathHtml: '+ heroIdentifier);
     // --- Original Karmic Path Logic ---
    // if (typeof heroIdentifier !== 'number') {
         // return { hindi: "अमान्य हीरो ग्रह पहचानकर्ता।", english: "Invalid hero planet identifier." };
    // }
    // alert (typeof(heroIdentifier));
    const heroPlanetId = parseInt(heroIdentifier);
    // console.log  ('heroPlanetId: '+ heroPlanetId);
// console.log (heroPlanetId);
    const heroPlanet = chartData.find(p => p.id === heroPlanetId);
    if (!heroPlanet) {
        return { hindi: "हीरो ग्रह नहीं मिला।", english: "Hero Planet not found." };
    }
     // console.log  ('chartData: '+ chartData);
     // console.log  ( chartData);
    
// console.log  ('heroPlanet: '+ heroPlanet);
// console.log (heroPlanet);
    const heroBhava = heroPlanet.bhava;

    const trineHousesFromHero = [
        heroBhava, 
        ((heroBhava - 1 + 4) % 12) + 1, 
        ((heroBhava - 1 + 8) % 12) + 1  
    ];
    const uniqueTrineHouses = [...new Set(trineHousesFromHero)]; 
    
    const twelfthHouseFromHero = ((heroBhava - 2 + 12) % 12) + 1;
    const secondHouseFromHero = (heroBhava % 12) + 1;

    let pastPlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && p.bhava === twelfthHouseFromHero);
    let presentPlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && uniqueTrineHouses.includes(p.bhava));
    let futurePlanets = chartData.filter(p => p.id !== PLANET_IDS.ASC && p.bhava === secondHouseFromHero);
     // alert('ddfd');
    chartData.forEach(p => {
        if (p.retro && p.retro.toLowerCase().includes('r')) { 
             const prevBhava = ((p.bhava - 2 + 12) % 12) + 1;
             if (uniqueTrineHouses.includes(prevBhava) && !presentPlanets.some(pp => pp.id === p.id)) {
                let retroPlanet = JSON.parse(JSON.stringify(p)); 
                retroPlanet.isRetroActingInTrineFromNextHouse = true; 
                presentPlanets.push(retroPlanet);
             }
        }
    });

    pastPlanets.sort((a, b) => (a.long % 30) - (b.long % 30));
    presentPlanets.sort((a, b) => (a.long % 30) - (b.long % 30));
    futurePlanets.sort((a, b) => (a.long % 30) - (b.long % 30));

    const fullPathObjects = [...pastPlanets, ...presentPlanets, ...futurePlanets];
    
    const heroNameEn = planetNames[heroPlanetId].en;
    const heroNameHi = planetNames[heroPlanetId].hi;

    const formatPlanetWithDegree = (p, lang) => {
        const isHero = p.id === heroPlanetId ? (lang === 'hi' ? ' (हीरो)' : ' (Hero)') : '';
        const isRetro = p.retro && p.retro.toLowerCase().includes('r') ? (lang === 'hi' ? '(व)' : '(R)') : '';
        const degree = (p.long % 30).toFixed(1);
        const name = lang === 'hi' ? planetNames[p.id].short_hi : planetNames[p.id].short;
        return `${name}${isRetro} ${degree}°${isHero}`;
    };
    
    let pathEn = fullPathObjects.map(p => formatPlanetWithDegree(p, 'en')).join(' → ');
    let pathHi = fullPathObjects.map(p => formatPlanetWithDegree(p, 'hi')).join(' → ');

    english = `<p><b>Full Karmic Path (Past → Present → Future) for ${heroNameEn}:</b><br>${pathEn || "No planets found in the sequence."}</p>`;
    hindi = `<p><b>${heroNameHi} के लिए संपूर्ण कर्म पथ (अतीत → वर्तमान → भविष्य):</b><br>${pathHi || "क्रम में कोई ग्रह नहीं मिला।"}</p>`;

    english += `<p><b>Interpretation:</b> The life story for '${heroNameEn}' unfolds along this complete path.
                <ul>
                    <li style="margin-bottom:5px;"><b>Past (12th from Hero):</b> Influences from planets in the 12th house from ${heroNameEn}.</li>
                    <li style="margin-bottom:5px;"><b>Present (Trines to Hero - 1st, 5th, 9th houses from ${heroNameEn}):</b> Core sequence.</li>
                    <li><b>Future (2nd from Hero):</b> Path progresses towards planets in the 2nd house from ${heroNameEn}.</li>
                </ul></p>`;
    hindi += `<p><b>व्याख्या:</b> '${heroNameHi}' के लिए जीवन की कहानी इस संपूर्ण पथ पर आगे बढ़ती है।
                <ul>
                    <li style="margin-bottom:5px;"><b>अतीत (${heroNameHi} से १२वां भाव):</b> ${heroNameHi} से १२वें भाव के ग्रहों के प्रभाव से।</li>
                    <li style="margin-bottom:5px;"><b>वर्तमान (${heroNameHi} से त्रिकोण - ${heroNameHi} से १, ५, ९ भाव):</b> मुख्य क्रम।</li>
                    <li><b>भविष्य (${heroNameHi} से दूसरा भाव):</b> ${heroNameHi} से दूसरे भाव के ग्रहों की ओर।</li>
                </ul></p>`;

    let combinationInsightsEn = [];
    let combinationInsightsHi = [];

    for (let i = 0; i < fullPathObjects.length - 1; i++) {
        const p1 = fullPathObjects[i];
        const p2 = fullPathObjects[i + 1];
        const actualSequenceKey = `${p1.id}-${p2.id}`; 
        
        if (bnnCombinationPredictions[actualSequenceKey]) { 
            const predictionData = bnnCombinationPredictions[actualSequenceKey];
            const titleEn = `› ${planetNames[p1.id].en} (at ${ (p1.long % 30).toFixed(1)}°) → ${planetNames[p2.id].en} (at ${(p2.long % 30).toFixed(1)}°) Insights:`;
            const titleHi = `› ${planetNames[p1.id].hi} (${ (p1.long % 30).toFixed(1)}°) → ${planetNames[p2.id].hi} (${(p2.long % 30).toFixed(1)}°) अंतर्दृष्टि:`;
            
            combinationInsightsEn.push(`<b>${titleEn}</b><ul>${predictionData.en.map(item => `<li>${item}</li>`).join('')}</ul>`);
             combinationInsightsHi.push(`<b>${titleHi}</b><ul>${(predictionData.hi && predictionData.hi.length > 0 ? predictionData.hi : predictionData.en).map(item => `<li>${item}</li>`).join('')}</ul>`);
        }
    }
    
    if(combinationInsightsEn.length > 0){
        english += `<hr><h4>Specific Combination Insights:</h4>${combinationInsightsEn.join('')}`;
        hindi += `<hr><h4>विशिष्ट संयोजन अंतर्दृष्टि:</h4>${combinationInsightsHi.join('')}`;
    }

    const involvedPlanets = new Set(fullPathObjects.map(p => p.id));
    if (involvedPlanets.size > 0) {
        english += `<hr><p><strong>All Involved Planets (Karakas) in this sequence:</strong></p>`;
        hindi += `<hr><p><strong>इस क्रम में सभी शामिल ग्रह (कारक):</strong></p>`;
        
        let planetsRow = "<div style='display:flex; flex-wrap:wrap; gap:15px; justify-content:center;'>";
        involvedPlanets.forEach(pId => {
            planetsRow += `<span style='border:1px solid #ccc; padding: 5px 8px; border-radius:4px;'>${planetNames[pId].en} (${planetNames[pId].hi})</span>`;
        });
        planetsRow += "</div>";

        english += planetsRow;
        hindi += planetsRow;
    }
    // alert(english);
    return {english, hindi};
}

// --- HTML Generation Helper Functions ---

/**
 * Generates a brief prediction for a specific year in the Jupiter Progression.
 * @param {object} round - The current round object { house, years, focus }.
 * @param {Array} touchedPlanets - Array of planet objects touched in this specific year.
 * @param {Array} activatedTouched - Array of activated planet objects touched in this year.
 * @param {Array} yearlyLords - Array of Rashi Lord IDs activated for this year.
 * @returns {object} An object with { english, hindi } prediction strings.
 */
function getYearlyProgressionPrediction(round, touchedPlanets, activatedTouched, yearlyLords) {
    let en = [], hi = [];
    const planetsToAnalyze = new Map();

    // Prioritize activated planets, then yearly lords, then other touched planets
    activatedTouched.forEach(p => planetsToAnalyze.set(p.id, p));
    yearlyLords.forEach(lordId => {
        if (!planetsToAnalyze.has(lordId)) {
            const planet = { id: lordId }; // Create a placeholder if not already touched
            planetsToAnalyze.set(lordId, planet);
        }
    });
    touchedPlanets.forEach(p => planetsToAnalyze.set(p.id, p));

    if (planetsToAnalyze.size === 0) {
        return { english: "A relatively neutral year, focus on the round's main theme.", hindi: "एक अपेक्षाकृत तटस्थ वर्ष, दौर के मुख्य विषय पर ध्यान केंद्रित करें।" };
    }

    if (activatedTouched.length > 0) {
        en.push("<b>Prominent Year:</b> Key events likely as Jupiter touches round-activated planets.");
        hi.push("<b>प्रमुख वर्ष:</b> मुख्य घटनाएं होने की संभावना है क्योंकि बृहस्पति दौर-सक्रिय ग्रहों को छू रहा है।");
    }

    planetsToAnalyze.forEach(p => {
        const isLordActivation = yearlyLords.includes(p.id) && !touchedPlanets.some(tp => tp.id === p.id);
        const prefixEn = isLordActivation ? "Results of the house lord " : "";
        const prefixHi = isLordActivation ? "भाव स्वामी के परिणाम " : "";

        switch (p.id) {
            case PLANET_IDS.SUN:
                en.push(`${prefixEn}Recognition, progress with authority/father, boost in confidence.`);
                hi.push(`${prefixHi}मान-सम्मान, अधिकार/पिता से प्रगति, आत्मविश्वास में वृद्धि।`);
                break;
            case PLANET_IDS.MOON:
                en.push(`${prefixEn}Change of place, travel, emotional events, matters related to mother.`);
                hi.push(`${prefixHi}स्थान परिवर्तन, यात्रा, भावनात्मक घटनाएँ, माता से संबंधित मामले।`);
                break;
            case PLANET_IDS.MARS:
                en.push(`${prefixEn}Efforts in property, technical work, or dealing with conflicts. Watch for arguments.`);
                hi.push(`${prefixHi}संपत्ति, तकनीकी कार्य, या संघर्षों से निपटने में प्रयास। तर्कों से सावधान रहें।`);
                break;
            case PLANET_IDS.MERCURY:
                en.push(`${prefixEn}Good for communication, learning, documentation, and business dealings.`);
                hi.push(`${prefixHi}संचार, सीखने, दस्तावेज़ीकरण और व्यावसायिक सौदों के लिए अच्छा है।`);
                break;
            case PLANET_IDS.JUPITER:
                en.push(`${prefixEn}Significant life event possible (marriage, childbirth, opportunity). Gain of wisdom.`);
                hi.push(`${prefixHi}महत्वपूर्ण जीवन घटना संभव (विवाह, संतान, अवसर)। ज्ञान की प्राप्ति।`);
                break;
            case PLANET_IDS.VENUS:
                en.push(`${prefixEn}Gains in finance, relationships, marriage prospects, purchase of vehicle/luxury.`);
                hi.push(`${prefixHi}वित्त, संबंधों, विवाह की संभावनाओं, वाहन/विलासिता की खरीद में लाभ।`);
                break;
            case PLANET_IDS.SATURN:
                en.push(`${prefixEn}Focus on career, hard work brings results. Possible pressure or increased responsibility.`);
                hi.push(`${prefixHi}करियर पर ध्यान, कड़ी मेहनत से परिणाम मिलेंगे। संभावित दबाव या बढ़ी हुई जिम्मेदारी।`);
                break;
            case PLANET_IDS.RAHU:
                en.push(`${prefixEn}Sudden changes, unconventional opportunities. Be wary of illusions.`);
                hi.push(`${prefixHi}अचानक परिवर्तन, अपरंपरागत अवसर। भ्रम से सावधान रहें।`);
                break;
            case PLANET_IDS.KETU:
                en.push(`${prefixEn}Detachment, spiritual insights, potential obstacles or endings.`);
                hi.push(`${prefixHi}वैराग्य, आध्यात्मिक अंतर्दृष्टि, संभावित बाधाएं या समाप्ति।`);
                break;
        }
    });

    return { english: `<ul>${en.map(i => `<li>${i}</li>`).join('')}</ul>`, hindi: `<ul>${hi.map(i => `<li>${i}</li>`).join('')}</ul>` };
}


function findActivatedPlanetsForProgressionRound(chartData, jupiter, roundHouseNum) {
    const activatedPlanets = new Map();
    const jupiterSign = jupiter.sign;
    let by_trine_focus = [], by_trine_lord = [];
    const focusHouseSign = ((jupiterSign - 1 + roundHouseNum - 1) % 12) + 1;

    chartData.filter(p => p.sign === focusHouseSign && p.id !== PLANET_IDS.ASC).forEach(p => activatedPlanets.set(p.id, p));

    const trineSigns = [((focusHouseSign - 1 + 4) % 12) + 1, ((focusHouseSign - 1 + 8) % 12) + 1];
    chartData.filter(p => trineSigns.includes(p.sign) && p.id !== PLANET_IDS.ASC).forEach(p => {
        activatedPlanets.set(p.id, p);
        by_trine_focus.push(p);
    });

    chartData.forEach(p => {
        if (p.id === PLANET_IDS.ASC) return;
        const pSign = p.sign;
        let aspects = [((pSign - 1 + 6) % 12) + 1];
        if (p.id === PLANET_IDS.SATURN) aspects.push(((pSign - 1 + 2) % 12) + 1, ((pSign - 1 + 9) % 12) + 1);
        if (p.id === PLANET_IDS.JUPITER) aspects.push(((pSign - 1 + 4) % 12) + 1, ((pSign - 1 + 8) % 12) + 1);
        if (p.id === PLANET_IDS.MARS) aspects.push(((pSign - 1 + 3) % 12) + 1, ((pSign - 1 + 7) % 12) + 1);
        if (aspects.includes(focusHouseSign)) activatedPlanets.set(p.id, p);
    });

    const lordId = signNames[focusHouseSign].lord;
    const lordPlanet = chartData.find(p => p.id === lordId);
    if (lordPlanet) {
        activatedPlanets.set(lordPlanet.id, lordPlanet);
        const lordBhava = lordPlanet.bhava;
        const lordTrineBhavas = [((lordBhava - 1 + 4) % 12) + 1, ((lordBhava - 1 + 8) % 12) + 1];
        chartData.filter(p => lordTrineBhavas.includes(p.bhava) && p.id !== PLANET_IDS.ASC).forEach(p => {
            activatedPlanets.set(p.id, p);
            by_trine_lord.push(p);
        });
        chartData.filter(p => p.sign === lordPlanet.sign && p.id !== lordPlanet.id && p.id !== PLANET_IDS.ASC)
                 .forEach(p => activatedPlanets.set(p.id, p));
    }
    
    chartData.filter(p => p.sign === focusHouseSign && p.id !== PLANET_IDS.ASC).forEach(planetInFocusHouse => {
        const dispositorId = signNames[planetInFocusHouse.sign].lord;
        const dispositorPlanet = chartData.find(p => p.id === dispositorId);
        if (dispositorPlanet) activatedPlanets.set(dispositorPlanet.id, dispositorPlanet);
    });

    return { 
        final_list: Array.from(activatedPlanets.values()),
        by_trine_focus: by_trine_focus,
        by_trine_lord: by_trine_lord
    };
}

/**
 * Generates an age-appropriate, brief prediction for a specific year in the Jupiter Progression.
 * @param {object} round - The current round object { house, years, focus }.
 * @param {Array} touchedPlanets - Array of planet objects touched in this specific year.
 * @param {Array} activatedTouched - Array of activated planet objects touched in this year.
 * @param {Array} yearlyLords - Array of Rashi Lord IDs activated for this year.
 * @returns {object} An object with { english, hindi } prediction strings.
 */
function getYearlyProgressionPrediction(round, touchedPlanets, activatedTouched, yearlyLords) {
    let en = [], hi = [];
    const planetsToAnalyze = new Map();
    const age = (round.house - 1) * 12; // Base age for the round

    activatedTouched.forEach(p => planetsToAnalyze.set(p.id, p));
    yearlyLords.forEach(lordId => {
        if (!planetsToAnalyze.has(lordId)) {
            planetsToAnalyze.set(lordId, { id: lordId }); // Placeholder
        }
    });
    touchedPlanets.forEach(p => planetsToAnalyze.set(p.id, p));

    if (planetsToAnalyze.size === 0) {
        return { english: "A relatively neutral year. Focus on the round's main theme.", hindi: "एक अपेक्षाकृत तटस्थ वर्ष। दौर के मुख्य विषय पर ध्यान केंद्रित करें।" };
    }

    if (activatedTouched.length > 0) {
        en.push("<b>Prominent Year:</b> Key events are likely.");
        hi.push("<b>प्रमुख वर्ष:</b> मुख्य घटनाएं होने की संभावना है।");
    }

    planetsToAnalyze.forEach(p => {
        const isLordActivation = yearlyLords.includes(p.id) && !touchedPlanets.some(tp => tp.id === p.id);
        const prefixEn = isLordActivation ? "Results of house lord " : "";
        const prefixHi = isLordActivation ? "भाव स्वामी के परिणाम " : "";

        switch (p.id) {
            case PLANET_IDS.SUN:
                if (age < 12) {
                    en.push(`${prefixEn}Praise from teachers/father, good performance in school activities.`);
                    hi.push(`${prefixHi}शिक्षकों/पिता से प्रशंसा, स्कूल की गतिविधियों में अच्छा प्रदर्शन।`);
                } else {
                    en.push(`${prefixEn}Recognition, progress with authority/father, boost in confidence.`);
                    hi.push(`${prefixHi}मान-सम्मान, अधिकार/पिता से प्रगति, आत्मविश्वास में वृद्धि।`);
                }
                break;
            case PLANET_IDS.MOON:
                en.push(`${prefixEn}Change of place/school, travel, emotional events, matters related to mother.`);
                hi.push(`${prefixHi}स्थान/स्कूल परिवर्तन, यात्रा, भावनात्मक घटनाएँ, माता से संबंधित मामले।`);
                break;
            case PLANET_IDS.MARS:
                if (age < 24) {
                    en.push(`${prefixEn}Increased energy for sports/activities. Potential for minor injuries, be cautious.`);
                    hi.push(`${prefixHi}खेल/गतिविधियों के लिए ऊर्जा में वृद्धि। छोटी-मोटी चोटों की संभावना, सतर्क रहें।`);
                } else {
                    en.push(`${prefixEn}Efforts in property, technical work, or dealing with conflicts. Watch for arguments.`);
                    hi.push(`${prefixHi}संपत्ति, तकनीकी कार्य, या संघर्षों से निपटने में प्रयास। तर्कों से सावधान रहें।`);
                }
                break;
            case PLANET_IDS.MERCURY:
                en.push(`${prefixEn}Focus on studies, learning new skills, good for friendships and communication.`);
                hi.push(`${prefixHi}पढ़ाई, नए कौशल सीखने पर ध्यान, दोस्ती और संचार के लिए अच्छा।`);
                break;
            case PLANET_IDS.JUPITER:
                if (age >= 12 && age < 48) {
                    en.push(`${prefixEn}Significant life event possible: marriage, childbirth, major opportunity. Gain of wisdom.`);
                    hi.push(`${prefixHi}महत्वपूर्ण जीवन घटना संभव: विवाह, संतान जन्म, बड़ा अवसर। ज्ञान की प्राप्ति।`);
                } else {
                    en.push(`${prefixEn}Auspicious year, blessings from elders, opportunities for learning and growth.`);
                    hi.push(`${prefixHi}शुभ वर्ष, बड़ों का आशीर्वाद, सीखने और विकास के अवसर।`);
                }
                break;
            case PLANET_IDS.VENUS:
                if (age < 12) {
                    en.push(`${prefixEn}Happy times, making new friends, receiving gifts, creative hobbies.`);
                    hi.push(`${prefixHi}खुशी का समय, नए दोस्त बनाना, उपहार मिलना, रचनात्मक शौक।`);
                } else if (age >= 12 && age < 48) {
                    en.push(`${prefixEn}Gains in finance, new relationships, marriage prospects, purchase of vehicle/luxury.`);
                    hi.push(`${prefixHi}वित्त में लाभ, नए रिश्ते, विवाह की संभावनाएं, वाहन/विलासिता की खरीद।`);
                } else {
                    en.push(`${prefixEn}Comforts, social gatherings, financial gains.`);
                    hi.push(`${prefixHi}सुख-सुविधाएं, सामाजिक समारोह, वित्तीय लाभ।`);
                }
                break;
            case PLANET_IDS.SATURN:
                if (age < 12) {
                    en.push(`${prefixEn}Focus on discipline in studies, may feel some pressure.`);
                    hi.push(`${prefixHi}पढ़ाई में अनुशासन पर ध्यान, कुछ दबाव महसूस हो सकता है।`);
                } else if (age >= 12 && age < 24) {
                    en.push(`${prefixEn}Need for hard work in education or first job. Establishes routine.`);
                     hi.push(`${prefixHi}शिक्षा या पहली नौकरी में कड़ी मेहनत की आवश्यकता। दिनचर्या स्थापित होती है।`);
                } else {
                    en.push(`${prefixEn}Focus on career, hard work brings results. Increased responsibility.`);
                    hi.push(`${prefixHi}करियर पर ध्यान, कड़ी मेहनत से परिणाम मिलेंगे। बढ़ी हुई जिम्मेदारी।`);
                }
                break;
            case PLANET_IDS.RAHU:
                en.push(`${prefixEn}Sudden changes, new interests, unconventional friends/opportunities. Be wary of distractions.`);
                hi.push(`${prefixHi}अचानक परिवर्तन, नई रुचियां, अपरंपरागत दोस्त/अवसर। ध्यान भटकने से सावधान रहें।`);
                break;
            case PLANET_IDS.KETU:
                en.push(`${prefixEn}Feeling of detachment, introspection, may end a friendship/phase to start anew.`);
                hi.push(`${prefixHi}अलगाव की भावना, आत्मनिरीक्षण, किसी दोस्ती/चरण को समाप्त कर नई शुरुआत हो सकती है।`);
                break;
        }
    });

    return { english: `<ul>${en.map(i => `<li>${i}</li>`).join('')}</ul>`, hindi: `<ul>${hi.map(i => `<li>${i}</li>`).join('')}</ul>` };
}

// ... (findActivatedPlanetsForProgressionRound remains the same) ...

function generateProgressionHtml(chartData) {
    let english = ``, hindi = ``;
    const ascendant = chartData.find(p => p.id === PLANET_IDS.ASC);
    const jupiter = chartData.find(p => p.id === PLANET_IDS.JUPITER);
    if (!jupiter || !ascendant) { return { english: "<p>Required chart data missing.</p>", hindi: "<p>आवश्यक चार्ट डेटा गुम है।</p>" }; }

    const rounds = bnnProgressionJupiter.rounds;
    for (const round of rounds) {
        english += `<details open><summary style='font-size:1.2em; font-weight:bold; cursor:pointer;'>Round ${round.house} (${round.years} Years): ${round.focus}</summary><div style='padding-left: 20px;'>`;
        hindi += `<details open><summary style='font-size:1.2em; font-weight:bold; cursor:pointer;'>राउंड ${round.house} (${round.years.replace(/(\d+)/g, n => n.toLocaleString('hi-IN'))} वर्ष): ${bnnProgressionJupiter.rounds_hi[round.house-1].focus}</summary><div style='padding-left: 20px;'>`;
        
        const activationDetails = findActivatedPlanetsForProgressionRound(chartData, jupiter, round.house);
        const activatedPlanets = activationDetails.final_list;
        const activatedPlanetIds = new Set(activatedPlanets.map(p => p.id));
        const activatedPlanetNamesEn = activatedPlanets.length > 0 ? activatedPlanets.map(p => planetNames[p.id].en).join(', ') : "None";
        const activatedPlanetNamesHi = activatedPlanets.length > 0 ? activatedPlanets.map(p => planetNames[p.id].hi).join(', ') : "कोई नहीं";
        
        english += `<h4>Activated Planets for this Round:</h4><p style="font-weight:bold; color: #0056b3;">${activatedPlanetNamesEn}</p>`;
        hindi += `<h4>इस दौर के लिए सक्रिय ग्रह:</h4><p style="font-weight:bold; color: #0056b3;">${activatedPlanetNamesHi}</p>`;
        
        const houseOfFocus = ((jupiter.bhava - 1 + round.house - 1) % 12) + 1;
        let tempChart = JSON.parse(JSON.stringify(chartData));
        tempChart.push({ bhava: houseOfFocus, ck: 'activated_house', tx: '' }); 
        
        if (typeof bnn_Writesvg === 'function') {
            const chartSvg = bnn_Writesvg(tempChart, `D1 Chart - Focus for Round ${round.house} (House ${houseOfFocus})`, false);
            english += chartSvg;
            hindi += chartSvg;
        }

        const tableHeaderEn = `<thead><tr style='background-color:#f2f2f2;'><th>Year (Age)</th><th>Virtual Ju Position</th><th>Touched Planets</th><th>Yearly Activated Lords</th><th>Yearly Application / Prediction</th></tr></thead>`;
        const tableHeaderHi = `<thead><tr style='background-color:#f2f2f2;'><th>वर्ष (आयु)</th><th>आभासी बृहस्पति स्थिति</th><th>स्पर्शित ग्रह</th><th>वार्षिक सक्रिय स्वामी</th><th>वार्षिक अनुप्रयोग / भविष्यवाणी</th></tr></thead>`;
        
        english += `<h4>Progression Timeline (${round.years} years):</h4><table border='1' style='width:100%; margin:10px auto; text-align:left; border-collapse: collapse;'>${tableHeaderEn}<tbody>`;
        hindi += `<h4>प्रगति समयरेखा (${round.years.replace(/(\d+)/g, n => n.toLocaleString('hi-IN'))} वर्ष):</h4><table border='1' style='width:100%; margin:10px auto; text-align:left; border-collapse: collapse;'>${tableHeaderHi}<tbody>`;

        for (let i = 0; i < 12; i++) {
            const currentAgeStart = (round.house - 1) * 12 + i;
            const currentAgeEnd = currentAgeStart + 1;
            const virtualJupiterBhava = ((jupiter.bhava - 1 + i) % 12) + 1;
            
            const yearlyLords = new Set();
            const transitSign = ((ascendant.sign - 1 + virtualJupiterBhava - 1) % 12) + 1;
            yearlyLords.add(signNames[transitSign].lord);
            
            const trineBhava5 = ((virtualJupiterBhava - 1 + 4) % 12) + 1;
            const trineBhava9 = ((virtualJupiterBhava - 1 + 8) % 12) + 1;
            const trineSign5 = ((ascendant.sign - 1 + trineBhava5 - 1) % 12) + 1;
            const trineSign9 = ((ascendant.sign - 1 + trineBhava9 - 1) % 12) + 1;
            yearlyLords.add(signNames[trineSign5].lord);
            yearlyLords.add(signNames[trineSign9].lord);
            const yearlyLordsArray = Array.from(yearlyLords);
            
            const yearlyLordsEn = yearlyLordsArray.map(id => planetNames[id].short).join(', ');
            const yearlyLordsHi = yearlyLordsArray.map(id => planetNames[id].short_hi).join(', ');

            const planetsInBhava = chartData.filter(p => p.bhava === virtualJupiterBhava && p.id !== PLANET_IDS.ASC);
            const touchedPlanetsEn = planetsInBhava.map(p => planetNames[p.id].en).join(', ');
            const touchedPlanetsHi = planetsInBhava.map(p => planetNames[p.id].hi).join(', ');

            const activatedTouched = planetsInBhava.filter(p => activatedPlanetIds.has(p.id));
            const prediction = getYearlyProgressionPrediction(round, planetsInBhava, activatedTouched, yearlyLordsArray);

            const isProminent = activatedTouched.length > 0;
            const rowStyle = isProminent ? "style='background-color:#e3f2fd;'" : "";
            
            english += `<tr ${rowStyle}>
                            <td style="text-align:center;"><b>${currentAgeStart}-${currentAgeEnd}</b></td>
                            <td style="text-align:center;">House ${virtualJupiterBhava}</td>
                            <td style="text-align:center;">${touchedPlanetsEn || "---"}</td>
                            <td style="text-align:center;">${yearlyLordsEn}</td>
                            <td>${prediction.english}</td>
                        </tr>`;
            hindi += `<tr ${rowStyle}>
                          <td style="text-align:center;"><b>${currentAgeStart.toLocaleString('hi-IN')}-${currentAgeEnd.toLocaleString('hi-IN')}</b></td>
                          <td style="text-align:center;">भाव ${virtualJupiterBhava.toLocaleString('hi-IN')}</td>
                          <td style="text-align:center;">${touchedPlanetsHi || "---"}</td>
                          <td style="text-align:center;">${yearlyLordsHi}</td>
                          <td>${prediction.hindi}</td>
                      </tr>`;
        }

        english += `</tbody></table></div></details>`;
        hindi += `</tbody></table></div></details>`;
    }
    
    english += `<hr><h4>General Rules of Progression:</h4><ul>${bnnProgressionJupiter.rules_string_formation.map(r => `<li>${r}</li>`).join('')}</ul>`;
    hindi += `<hr><h4>प्रगति के सामान्य नियम:</h4><ul>${bnnProgressionJupiter.rules_string_formation_hi.map(r => `<li>${r}</li>`).join('')}</ul>`;

    return { english, hindi };
}