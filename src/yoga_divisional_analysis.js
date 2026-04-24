/**
 * Yoga Divisional Chart Analysis
 * Shows where yogas are forming across D1, D2, D3, D9, D10, D12, etc.
 */

/**
 * Analyze yoga formations across divisional charts
 * @param {Object} birthChart - D1 birth chart data
 * @returns {Object} Yoga formations in each divisional chart
 */
function analyzeYogasAcrossDivisionalCharts(birthChart) {
  if (!birthChart || !birthChart.planets) return null;
  
  // Key divisional charts for yogas
  const divisionalCharts = [
    { divisor: 1, name: 'D1 - Rashi (Birth Chart)', purpose: 'Overall Personality & Destiny' },
    { divisor: 2, name: 'D2 - Hora (Wealth)', purpose: 'Financial Matters' },
    { divisor: 3, name: 'D3 - Drekkana (Siblings)', purpose: 'Siblings & Co-borns' },
    { divisor: 4, name: 'D4 - Chaturthamsa (Property)', purpose: 'Real Estate & Property' },
    { divisor: 9, name: 'D9 - Navamsa (Spouse)', purpose: 'Marriage & Partnership' },
    { divisor: 10, name: 'D10 - Dasamsa (Career)', purpose: 'Career & Profession' },
    { divisor: 12, name: 'D12 - Dwadasamsa (Parents)', purpose: 'Parental Matters' }
  ];
  
  const yogaFormations = {};
  
  divisionalCharts.forEach(chart => {
    // Calculate D-chart planets at divisional positions
    const dChartPlanets = calculateDivisionalChartPlanets(birthChart.planets, chart.divisor);
    
    // Create temporary chart object for D-chart evaluation
    const dChart = {
      planets: dChartPlanets,
      asc: birthChart.asc ? calculateDivisionalLagna(birthChart.asc, chart.divisor) : null
    };
    
    // Detect yogas in this D-chart
    const detectedYogasInDChart = [];
    
    if (window.YOGAS_DATA && Array.isArray(window.YOGAS_DATA)) {
      window.YOGAS_DATA.forEach(yogaTemplate => {
        try {
          if (yogaTemplate && typeof yogaTemplate.evaluate === 'function') {
            if (yogaTemplate.evaluate(dChart)) {
              detectedYogasInDChart.push({
                name: yogaTemplate.name,
                category: yogaTemplate.category || 'General',
                strength: yogaTemplate.strength || 'Medium',
                interpretation: yogaTemplate.interpretation || ''
              });
            }
          }
        } catch(e) {
          // Silently skip evaluation errors in D-charts
        }
      });
    }
    
    yogaFormations[chart.divisor] = {
      chartName: chart.name,
      purpose: chart.purpose,
      detectedYogasCount: detectedYogasInDChart.length,
      detectedYogas: detectedYogasInDChart,
      planets: dChartPlanets
    };
  });
  
  return yogaFormations;
}

/**
 * Calculate planetary positions in a divisional chart
 * @param {Object} d1Planets - D1 planets with sign (sn) and degree (deg)
 * @param {Number} divisor - D-chart divisor (2, 3, 4, 9, 10, 12, etc.)
 * @returns {Object} Planets in divisional chart positions
 */
function calculateDivisionalChartPlanets(d1Planets, divisor) {
  const dChartPlanets = {};

  Object.keys(d1Planets).forEach(planetName => {
    const planet = d1Planets[planetName];
    if (!planet) return;

    // Calculate absolute degree position in zodiac (0-360)
    const absoluteDeg = (planet.sn || 0) * 30 + (planet.deg || 0);

    // Special handling for Navamsa (D9) chart
    if (divisor === 9) {
      dChartPlanets[planetName] = calculateNavamsaPosition(planet, absoluteDeg);
    } else {
      // Generic Parashari mapping for D-charts:
      // sign index = floor((absoluteDeg * divisor) / 30) % 12
      // degree in mapped sign = fractional part within 30°
      const multiplied = absoluteDeg * divisor;
      const dSign = Math.floor(multiplied / 30) % 12;
      const dDegree = multiplied % 30;

      // Get sign name
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const dSignName = signNames[dSign % 12];

      dChartPlanets[planetName] = {
        ...planet,  // Keep original D1 data
        sn: dSign,  // D-chart sign number (0-11)
        sign: dSignName,  // D-chart sign name (for reference)
        deg: Math.round(dDegree * 100) / 100,  // D-chart degree
        d1Sign: planet.sign,  // Store original D1 sign
        d1Degree: planet.deg,  // Store original D1 degree
        house: planet.house  // Houses typically same across D-charts (simplified)
      };
    }
  });

  return dChartPlanets;
}

/**
 * Calculate Navamsa (D9) position using proper Vedic astrology method
 * @param {Object} planet - Planet data from D1 chart
 * @param {Number} absoluteDeg - Absolute degree position in zodiac (0-360)
 * @returns {Object} Navamsa position
 */
function calculateNavamsaPosition(planet, absoluteDeg) {
  // Each sign is divided into 9 navamsa parts (each 3°20' = 30°/9)
  // We need the degree WITHIN the current sign only (0–29.99°)
  const degInSign = absoluteDeg % 30;
  const navamsaPart = Math.floor(degInSign / (30 / 9)); // 0–8 within the sign

  // Determine the starting sign for Navamsa mapping based on the D1 sign
  const d1Sign = planet.sn || 0;
  const navamsaStartSign = getNavamsaStartSign(d1Sign);

  // Calculate Navamsa sign (0-11)
  const navamsaSign = (navamsaStartSign + navamsaPart) % 12;

  // Get sign name
  const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const navamsaSignName = signNames[navamsaSign];

  return {
    ...planet,  // Keep original D1 data
    sn: navamsaSign,  // Navamsa sign number (0-11)
    sign: navamsaSignName,  // Navamsa sign name
    deg: 0,  // Navamsa degree is always 0 (each navamsa is 3°20')
    d1Sign: planet.sign,  // Store original D1 sign
    d1Degree: planet.deg,  // Store original D1 degree
    house: planet.house,  // Houses typically same across D-charts (simplified)
    navamsaPart: navamsaPart  // Store which navamsa part (0-8)
  };
}

/**
 * Get the starting sign for Navamsa mapping based on D1 sign
 * @param {Number} d1Sign - D1 sign number (0-11)
 * @returns {Number} Starting sign for Navamsa mapping (0-11)
 */
function getNavamsaStartSign(d1Sign) {
  // Navamsa mapping starts from different signs based on D1 sign
  // Standard Vedic astrology mapping:
  // Fire signs (Aries, Leo, Sagittarius) start from Aries (0)
  // Earth signs (Taurus, Virgo, Capricorn) start from Capricorn (9)
  // Air signs (Gemini, Libra, Aquarius) start from Libra (6)
  // Water signs (Cancer, Scorpio, Pisces) start from Cancer (3)
  const startSigns = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
  return startSigns[d1Sign % 12];
}

/**
 * Calculate Nakshatra from absolute longitude (0-360)
 * @param {Number} lon - Absolute longitude
 * @returns {Object} Nakshatra details
 */
function determineNakshatra(lon) {
  const normalized = ((((lon || 0) % 360) + 360) % 360);
  const span = 360 / 27;
  const index = Math.floor(normalized / span);
  const pada = Math.floor((normalized % span) / (span / 4)) + 1;
  const names = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
    'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
    'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
  ];

  return {
    index,
    name: names[index] || 'Unknown',
    pada,
    degreeInNakshatra: normalized % span
  };
}

/**
 * Universal Varga calculator for major Parashara Vargas
 * @param {number} lon - Sidereal Longitude (0-360)
 * @param {number} v - Varga Number
 * @returns {{sign:number, longitude:number, degInSign:number}}
 */
function getVargaData(lon, v) {
  const normalizedLon = ((((lon || 0) % 360) + 360) % 360);
  const signNum = Math.floor(normalizedLon / 30);
  const degInSign = normalizedLon % 30;
  const part = Math.floor(degInSign / (30 / v));
  let targetSign = 0;

  switch (v) {
    case 1:
      targetSign = signNum;
      break;
    case 2:
      if (signNum % 2 === 0) targetSign = degInSign <= 15 ? 4 : 3;
      else targetSign = degInSign <= 15 ? 3 : 4;
      break;
    case 3:
      targetSign = (signNum + (part * 4)) % 12;
      break;
    case 4:
      targetSign = (signNum + (part * 3)) % 12;
      break;
    case 7:
      targetSign = (signNum % 2 === 0) ? (signNum + part) % 12 : (signNum + 6 + part) % 12;
      break;
    case 9: {
      const d9Starts = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
      targetSign = (d9Starts[signNum] + part) % 12;
      break;
    }
    case 10:
      targetSign = (signNum % 2 === 0) ? (signNum + part) % 12 : (signNum + 8 + part) % 12;
      break;
    case 12:
      targetSign = (signNum + part) % 12;
      break;
    case 16:
    case 20: {
      const starts = [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8];
      targetSign = (starts[signNum] + part) % 12;
      break;
    }
    case 24:
      targetSign = (signNum % 2 === 0) ? (4 + part) % 12 : (3 + part) % 12;
      break;
    case 27:
      targetSign = Math.floor(normalizedLon / (360 / 27)) % 12;
      break;
    case 30:
      if (signNum % 2 === 0) {
        if (degInSign < 5) targetSign = 0;
        else if (degInSign < 10) targetSign = 10;
        else if (degInSign < 18) targetSign = 8;
        else if (degInSign < 25) targetSign = 2;
        else targetSign = 1;
      } else {
        if (degInSign < 5) targetSign = 1;
        else if (degInSign < 12) targetSign = 5;
        else if (degInSign < 20) targetSign = 11;
        else if (degInSign < 25) targetSign = 9;
        else targetSign = 7;
      }
      break;
    case 40:
    case 45:
    case 60:
      targetSign = (signNum + part) % 12;
      break;
    default:
      targetSign = (signNum * v + part) % 12;
  }

  const vargaLon = (targetSign * 30) + ((degInSign * v) % 30);
  return {
    sign: targetSign,
    longitude: vargaLon,
    degInSign: vargaLon % 30
  };
}

/**
 * Build full divisional chart including planets, ascendant and houses
 * @param {number} vargaNumber
 * @returns {Object}
 */
function castDivisionalChart(vargaNumber) {
  const vargaChart = { planets: {}, asc: {}, houses: {} };
  const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  const d1AscLon = window.BIRTH_ASC && Number.isFinite(window.BIRTH_ASC.sid)
    ? window.BIRTH_ASC.sid
    : (((window.BIRTH_ASC?.sn || 0) * 30) + (window.BIRTH_ASC?.deg || 0));
  const vDataAsc = getVargaData(d1AscLon, vargaNumber);

  vargaChart.asc = {
    sign: vDataAsc.sign,
    signName: signNames[vDataAsc.sign],
    lon: vDataAsc.longitude,
    deg: vDataAsc.degInSign,
    nakshatra: determineNakshatra(vDataAsc.longitude)
  };

  const sourcePlanets = window.BIRTH_PLANETS || {};
  Object.entries(sourcePlanets).forEach(([pName, pData]) => {
    const d1Lon = Number.isFinite(pData?.sid) ? pData.sid : (((pData?.sn || 0) * 30) + (pData?.deg || 0));
    const vData = getVargaData(d1Lon, vargaNumber);
    const house = ((vData.sign - vDataAsc.sign + 12) % 12) + 1;

    vargaChart.planets[pName] = {
      ...pData,
      sn: vData.sign,
      sign: signNames[vData.sign],
      signName: signNames[vData.sign],
      longitude: vData.longitude,
      sid: vData.longitude,
      deg: vData.degInSign,
      house,
      nakshatra: determineNakshatra(vData.longitude)
    };
  });

  return vargaChart;
}

/**
 * Calculate lagna (ascendant) position in divisional chart
 * @param {Object} d1Lagna - D1 lagna with sn and deg
 * @param {Number} divisor - D-chart divisor
 * @returns {Object} D-chart lagna position
 */
function calculateDivisionalLagna(d1Lagna, divisor) {
  if (!d1Lagna) return null;

  const absoluteDeg = (d1Lagna.sn || 0) * 30 + (d1Lagna.deg || 0);

  // Lagna data may come either as {sn, deg} object OR as numeric ascendant degree (0-360)
  // from callers using `birthChart.asc`. Normalize both safely.
  const isNumericAsc = typeof d1Lagna === 'number' && Number.isFinite(d1Lagna);
  const normalizedSign = isNumericAsc ? Math.floor(((d1Lagna % 360) + 360) % 360 / 30) : (d1Lagna.sn || 0);
  const normalizedDeg = isNumericAsc ? ((((d1Lagna % 360) + 360) % 360) % 30) : (d1Lagna.deg || 0);
  const normalizedAbs = normalizedSign * 30 + normalizedDeg;

  const vData = getVargaData(normalizedAbs, divisor);
  const dSign = vData.sign;
  const dDegree = vData.degInSign;
  
  const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  
  return {
    ...(isNumericAsc ? {} : d1Lagna),
    sn: dSign,
    sign: signNames[dSign % 12],
    deg: Math.round(dDegree * 100) / 100,
    d1Sign: isNumericAsc ? signNames[normalizedSign] : d1Lagna.sign,
    d1Degree: normalizedDeg,
    sid: vData.longitude,
    longitude: vData.longitude,
    nakshatra: determineNakshatra(vData.longitude)
  };
}

/**
 * Generate HTML display for divisional yoga formations
 * @param {Object} yogaFormations - Result from analyzeYogasAcrossDivisionalCharts
 * @returns {String} HTML to display
 */
function generateDivisionalYogaDisplay(yogaFormations) {
  if (!yogaFormations) return '<p>No yoga data available</p>';
  
  let html = `
    <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 2px solid #8B4513;">
      <h2 style="color: #4a3728; text-align: center; margin-bottom: 20px;">
        🧘 YOGA FORMATIONS ACROSS DIVISIONAL CHARTS
      </h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
  `;
  
  // Sort by divisor order
  const sortedDivisors = [1, 2, 3, 4, 9, 10, 12].filter(d => yogaFormations[d]);
  
  sortedDivisors.forEach(divisor => {
    const formation = yogaFormations[divisor];
    const yogaCount = formation.detectedYogasCount;
    const backgroundColor = yogaCount === 0 ? '#f5f5f5' : 
                          yogaCount <= 2 ? '#fff9e6' :
                          yogaCount <= 5 ? '#e8f5e9' : '#c8e6c9';
    const borderColor = yogaCount === 0 ? '#ddd' :
                       yogaCount <= 2 ? '#ffc107' :
                       yogaCount <= 5 ? '#4caf50' : '#2e7d32';
    
    html += `
      <div style="background: ${backgroundColor}; border: 2px solid ${borderColor}; border-radius: 8px; padding: 15px;">
        <div style="font-weight: bold; font-size: 16px; color: #333; margin-bottom: 8px;">
          ${formation.chartName}
        </div>
        
        <div style="font-size: 12px; color: #666; margin-bottom: 12px;">
          📌 ${formation.purpose}
        </div>
        
        <div style="background: white; padding: 10px; border-radius: 5px; margin-bottom: 10px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: ${borderColor};">
            ${yogaCount}
          </div>
          <div style="font-size: 11px; color: #999;">Yogas Detected</div>
        </div>
        
        ${yogaCount > 0 ? `
          <div style="font-size: 11px; max-height: 120px; overflow-y: auto;">
            ${formation.detectedYogas.map(yoga => `
              <div style="padding: 5px; margin: 3px 0; background: white; border-left: 3px solid ${borderColor}; border-radius: 3px;">
                <strong>${yoga.name}</strong><br/>
                <span style="color: #888; font-size: 10px;">${yoga.category}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size: 11px; color: #aaa; padding: 10px; text-align: center;">
            No yogas detected in this chart
          </div>
        `}
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px; font-size: 12px; color: #666;">
        <strong>📖 Chart Meanings:</strong><br/>
        • <strong>D1 (Rashi)</strong>: Overall personality, life purpose, and destiny<br/>
        • <strong>D2 (Hora)</strong>: Wealth, finances, and material resources<br/>
        • <strong>D3 (Drekkana)</strong>: Siblings, co-borns, courage, and efforts<br/>
        • <strong>D4 (Chaturthamsa)</strong>: Real estate, property, land, and fixed assets<br/>
        • <strong>D9 (Navamsa)</strong>: Marriage, partnership, relationships, and spiritual life<br/>
        • <strong>D10 (Dasamsa)</strong>: Career, profession, reputation, and public image<br/>
        • <strong>D12 (Dwadasamsa)</strong>: Parents, ancestors, inheritance, and legacy
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Display divisional yoga formations in console
 * @param {Object} yogaFormations - Result from analyzeYogasAcrossDivisionalCharts
 */
function showDivisionalYogaAnalysis(yogaFormations) {
  if (!yogaFormations) {
    console.log('No yoga formations data');
    return;
  }
  
  console.clear();
  console.log('%c🧘 YOGA FORMATIONS ACROSS DIVISIONAL CHARTS', 'color: #8B4513; font-size: 16px; font-weight: bold;');
  console.log('═'.repeat(80));
  
  const sortedDivisors = [1, 2, 3, 4, 9, 10, 12].filter(d => yogaFormations[d]);
  
  sortedDivisors.forEach(divisor => {
    const formation = yogaFormations[divisor];
    const yogaCount = formation.detectedYogasCount;
    
    console.log(`\n%c${formation.chartName}`, 'color: #333; font-weight: bold; font-size: 14px;');
    console.log(`%c📌 ${formation.purpose}`, 'color: #666; font-style: italic;');
    console.log(`%cYogasDetected: ${yogaCount}`, `color: ${yogaCount === 0 ? '#ccc' : yogaCount <= 2 ? '#ff9800' : '#4caf50'}; font-weight: bold;`);
    
    if (yogaCount > 0) {
      console.log('Detected Yogas:');
      formation.detectedYogas.forEach(yoga => {
        console.log(`  ✓ ${yoga.name} (${yoga.category})`);
      });
    } else {
      console.log('  (No yogas detected)');
    }
  });
  
  console.log('\n' + '═'.repeat(80));
  console.log('%cAnalysis Complete', 'color: #4caf50; font-weight: bold;');
}

/**
 * Create summary of yoga formations across all D-charts
 * @param {Object} yogaFormations - Result from analyzeYogasAcrossDivisionalCharts
 * @returns {Object} Summary statistics
 */
function summarizeDivisionalYogaFormations(yogaFormations) {
  if (!yogaFormations) return null;
  
  const summary = {
    totalCharts: 0,
    totalYogasFound: 0,
    chartsWithMostYogasD: null,
    chartsWithMostCount: 0,
    yogasByChart: {},
    allYogasDetected: new Set()
  };
  
  Object.keys(yogaFormations).forEach(divisor => {
    const formation = yogaFormations[divisor];
    summary.totalCharts++;
    summary.totalYogasFound += formation.detectedYogasCount;
    
    formation.detectedYogas.forEach(yoga => {
      summary.allYogasDetected.add(yoga.name);
    });
    
    summary.yogasByChart[formation.chartName] = formation.detectedYogasCount;
    
    if (formation.detectedYogasCount > summary.chartsWithMostCount) {
      summary.chartsWithMostCount = formation.detectedYogasCount;
      summary.chartsWithMostYogasD = formation.chartName;
    }
  });
  
  summary.uniqueYogas = summary.allYogasDetected.size;
  
  return summary;
}

/**
 * Quick function to show divisional analysis
 * Usage: showDivisionalYogas() in browser console
 */
function showDivisionalYogas() {
  // Get the last calculated chart from window
  if (!window.lastCalculatedChart) {
    console.log('No chart data available. Please calculate a chart first.');
    return;
  }
  
  const formations = analyzeYogasAcrossDivisionalCharts(window.lastCalculatedChart);
  const summary = summarizeDivisionalYogaFormations(formations);
  
  console.clear();
  console.log('%c🧘 YOGA FORMATIONS ACROSS DIVISIONAL CHARTS', 'color: #8B4513; font-size: 16px; font-weight: bold;');
  console.log('%cSummary:', 'color: #333; font-weight: bold;');
  console.log(`   Total charts analyzed: ${summary.totalCharts}`);
  console.log(`   Total yogas detected: ${summary.totalYogasFound}`);
  console.log(`   Unique yogas: ${summary.uniqueYogas}`);
  console.log(`   Strongest in: ${summary.chartsWithMostYogasD} (${summary.chartsWithMostCount} yogas)`);
  console.log('\nDetails:');
  
  Object.entries(summary.yogasByChart).forEach(([chartName, count]) => {
    console.log(`   ${chartName}: ${count} yogas`);
  });
  
  console.log('\n' + '═'.repeat(80));
  showDivisionalYogaAnalysis(formations);
}
