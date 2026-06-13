/**
 * Step by Step Panchang & Rotated Kundalis Prediction Module
 * Complete rewrite with proper time display, error handling, and chart rotation
 */

window.STEP2STEP_PANCHANG = {
  analyze: function(planets, ascendant, houses, birthDate, birthConfig) {
    // ============================================================
    // 1. VALIDATION & ERROR HANDLING
    // ============================================================
    if (!planets || !planets.Sun || !planets.Moon) {
      return '<div class="pred-item" style="color:var(--rose);">❌ Error: Planetary data missing. Please ensure birth chart is calculated.</div>';
    }
// Helper to safely get planet data from the planets object
const getPlanetSafe = (name) => {
    if (!name) return null;
    return planets[name] || planets[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()] || null;
};
    // ============================================================
    // 2. BIRTH DETAILS EXTRACTION
    // ============================================================
    const bCtx = birthConfig || {};
    
    // Extract date and time properly
    let dateStr = "Unknown";
    let timeStr = "Unknown";
    let dayStr = "Unknown";
    let birthYear = "Unknown";
    let birthMonth = "Unknown";
    
    if (bCtx.date && bCtx.date instanceof Date) {
      const d = bCtx.date;
      dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      birthYear = d.getFullYear();
      birthMonth = d.toLocaleDateString('en-US', {month: 'long'});
      
      // Format time as HH:MM
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      timeStr = `${hours}:${minutes}`;
      
      // Get day name
      dayStr = d.toLocaleDateString('en-US', {weekday: 'long'});
    }
    
    // Override with direct properties if provided
    if (bCtx.birthDate) dateStr = bCtx.birthDate;
    if (bCtx.time) timeStr = bCtx.time;
    if (bCtx.day) dayStr = bCtx.day;
    
    const latStr = bCtx.lat !== undefined ? bCtx.lat.toFixed(4) : "Unknown";
    const lonStr = bCtx.lon !== undefined ? bCtx.lon.toFixed(4) : "Unknown";
    const tzStr = bCtx.utcOff !== undefined ? (bCtx.utcOff >= 0 ? "+"+bCtx.utcOff : bCtx.utcOff) : "Unknown";
    const cityStr = bCtx.city || "Unknown";
    const ayanStr = bCtx.ayan || "lahiri";

    // ============================================================
    // 3. PANCHANG CALCULATIONS
    // ============================================================
    
    const moonLon = planets.Moon.sid !== undefined ? planets.Moon.sid : planets.Moon.longitude;
    const sunLon = planets.Sun.sid !== undefined ? planets.Sun.sid : planets.Sun.longitude;
    
    // Tithi Calculation
    const elong = (moonLon - sunLon + 360) % 360;
    const tithiNum = Math.floor(elong / 12) + 1;
    const tithiPhase = tithiNum <= 15 ? 'Shukla' : 'Krishna';
    const tithiStr = `${tithiPhase} - ${tithiNum <= 15 ? tithiNum : tithiNum - 15}`;
      const LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) 
        ? window.ASTRO_CONSTANTS.SIGN_LORDS 
        : {0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter'};
    // Tithi names for display
    const tithiNames = [
      "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
      "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
      "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
    ];
    const tithiName = tithiNames[(tithiNum - 1) % 15];

    // Yoga Calculation
    const yelong = (moonLon + sunLon) % 360;
    const yogaZeroIndexed = Math.floor(yelong / (13 + 1/3)); 
    const yogaNum = yogaZeroIndexed + 1;
    const P_YOGAS = [
      "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", 
      "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", 
      "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", 
      "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", 
      "Shukla", "Brahma", "Indra", "Vaidhriti"
    ];
    const yogaStr = P_YOGAS[yogaZeroIndexed] || "Unknown";

    // Karana Calculation
    const karanNum = Math.floor(elong / 6) + 1;
    const P_KARANAS = [
      "Bava", "Balava", "Kaulava", "Taitila", "Gara", 
      "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kintughna"
    ];
    let karanStr = P_KARANAS[(karanNum-1) % 7] || "Unknown";
    if (karanNum === 1) karanStr = "Kintughna";
    if (karanNum >= 58 && karanNum <= 60) {
      if (karanNum === 58) karanStr = "Shakuni";
      else if (karanNum === 59) karanStr = "Chatushpada";
      else karanStr = "Naga";
    }

    // Nakshatra Info
    const nakInfo = window.getNakshatra ? window.getNakshatra(moonLon) : { name: 'Unknown', pada: 1, lord: 'Unknown' };
    
    // Get SIGNS from global constants or use fallback
    const SIGNS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) 
      ? window.ASTRO_CONSTANTS.SIGNS 
      : ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    
    const moonSign = SIGNS[Math.floor(moonLon/30)] || "Unknown";
    const sunSign = SIGNS[Math.floor((planets.Sun.longitude || planets.Sun.sid || 0) / 30)] || "Unknown";

    // ============================================================
    // 4. SHADBALA CALCULATION (if available)
    // ============================================================
    let sbHtml = "";
    if (window.SHADBALA && typeof window.SHADBALA.calculateAll === "function") {
      try {
        const sb = window.SHADBALA.calculateAll(planets, ascendant.longitude);
        sbHtml = `<div style="margin-top:15px; border-top:1px solid var(--border2); padding-top:10px;">
          <strong style="color:var(--cyan); font-size:12px; margin-bottom:8px; display:block;">Shadbala (Planetary Strength) - Achieved vs Required</strong>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">`;
        
        const reqMap = { Sun: 110, Moon: 130, Mars: 100, Mercury: 140, Jupiter: 130, Venus: 110, Saturn: 100 };
        
        Object.keys(sb).forEach(p => {
          const ach = Math.floor(sb[p].totalRupas);
          const req = reqMap[p] || 100;
          const pct = Math.min(100, Math.round((ach / req) * 100));
          const color = ach >= req ? 'var(--green)' : (ach >= req * 0.75 ? 'var(--gold)' : 'var(--rose)');
          const effectLabel = ach >= req ? 'Manifests fully' : 'Requires support';
          
          sbHtml += `
            <div style="background:rgba(0,0,0,0.2); padding:8px; border-radius:4px; font-size:10px; color:var(--text); border:1px solid rgba(255,255,255,0.05);">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <strong style="color:${color};">${p}</strong>
                <span style="color:var(--muted);">${ach} / ${req}</span>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden; margin-bottom:4px;">
                <div style="height:100%; width:${pct}%; background:${color}; box-shadow: 0 0 5px ${color}88;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:8px;">
                <span style="color:var(--muted);">${effectLabel}</span>
                <span style="color:${color}; font-weight:bold;">${sb[p].details.level}</span>
              </div>
            </div>
          `;
        });
        sbHtml += `</div></div>`;
      } catch(e) {
        console.warn("Shadbala calculation error:", e);
      }
    }

    // ============================================================
    // 5. BUILD BIRTH & PANCHANG HTML SECTION
    // ============================================================
    let html = `
      <div class="pred-item" style="border-left: 3px solid var(--gold); border-top: 1px solid var(--border);">
        <div class="pred-title" style="color:var(--gold); font-size:14px; text-align:center;">📋 Birth & Panchang Details</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:10.5px; color:var(--text); line-height:1.5;">
          <div><strong style="color:var(--muted)">📅 Date of Birth:</strong> ${dateStr}</div>
          <div><strong style="color:var(--muted)">📆 Day of Birth:</strong> ${dayStr}</div>
          <div><strong style="color:var(--muted)">⏰ Time of Birth:</strong> ${timeStr}</div>
          <div><strong style="color:var(--muted)">🌍 City:</strong> ${cityStr}</div>
          <div><strong style="color:var(--muted)">📍 Coordinates:</strong> ${latStr}°N, ${lonStr}°E</div>
          <div><strong style="color:var(--muted)">🕐 Time Zone:</strong> UTC${tzStr}</div>
          <div><strong style="color:var(--muted)">🌀 Ayanamsa:</strong> ${ayanStr}</div>
          <div><strong style="color:var(--muted)">🌙 Moon Sign (Rasi):</strong> ${moonSign}</div>
          <div><strong style="color:var(--muted)">☀️ Sun Sign (Western):</strong> ${sunSign}</div>
          <div><strong style="color:var(--muted)">🌗 Tithi:</strong> ${tithiStr} (${tithiName})</div>
          <div><strong style="color:var(--muted)">✨ Nakshatra:</strong> ${nakInfo.name} (Pada ${nakInfo.pada}) | Lord: ${nakInfo.lord || 'Unknown'}</div>
          <div><strong style="color:var(--muted)">🧘 Yoga:</strong> ${yogaStr}</div>
          <div><strong style="color:var(--muted)">📜 Karan:</strong> ${karanStr}</div>
        </div>
        ${sbHtml}
      </div>
    `;

    // ============================================================
    // 6. PANCHANG PREDICTIONS SECTION (if available)
    // ============================================================
    //---------------------added
const requestedDivs = [
      { div: 1, name: 'D1 - Rasi' },
      { div: 9, name: 'D9 - Navamsha' },
      { div: 'arudha', name: 'Arudha Lagna' }
      //{ div: 'indu', name: 'Indu Lagna' }
    ];

    html += `
            <div class="pred-item" style="border-left: 3px solid var(--cyan); margin-top:20px;">
                <div class="pred-title" style="color:var(--cyan); font-size:14px; text-align:center;">📊 Divisional Horoscope Charts</div>
                <div id="step2step-charts-grid" style="display:grid; grid-template-columns: 1fr; gap:20px; margin-top:15px;"></div>
            </div>
        `;

    // Append to the panel early so DOM is ready for canvas drawing
    const cont = document.getElementById('predictionsContent');
    if (cont) {
      cont.innerHTML = html;

      // ============================================================
      // EXECUTE CANVAS DRAWING + PLANET INFO TABLE (after DOM injection)
      // ============================================================
      setTimeout(() => {
        const grid = document.getElementById('step2step-charts-grid');
        if (!grid) return;

        const _SIGNS_DRAW = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS)
          ? window.ASTRO_CONSTANTS.SIGNS
          : ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
        const _LORDS_DRAW = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS)
          ? window.ASTRO_CONSTANTS.SIGN_LORDS
          : {0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter'};

        const planetColors = {
          Sun:'#FFD700', Moon:'#C0C0FF', Mars:'#FF6B6B', Mercury:'#00D2FF',
          Jupiter:'#FFA500', Venus:'#FF69B4', Saturn:'#9B9BFF', Rahu:'#666699', Ketu:'#CC9966'
        };

        requestedDivs.forEach((cfg, idx) => {
          const canvasId = `step2step_cvs_${idx}`;
          const infoId = `step2step_info_${idx}`;

          // Build planet table HTML
          let tableHtml = '';
          try {
            const chartData = window.getChartPlanetsForDiv ? window.getChartPlanetsForDiv(cfg.div) : null;
            if (chartData && chartData.planets) {
              const cp = chartData.planets;
              const ascSn2 = chartData.asc ? (chartData.asc.sn || 0) : 0;
              const ascSign = _SIGNS_DRAW[ascSn2] || '?';
              const ascLord = _LORDS_DRAW[ascSn2] || '?';

              tableHtml = `<div style="margin-top:10px; font-size:9px; color:var(--text);">
                <div style="color:var(--gold); font-weight:bold; margin-bottom:4px; font-size:10px;">
                  Lagna: <span style="color:#fff;">${ascSign}</span> | Lord: <span style="color:var(--cyan);">${ascLord}</span>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:9px;">
                  <tr style="color:var(--muted); border-bottom:1px solid rgba(255,255,255,0.1);">
                    <th style="padding:3px 4px; text-align:left;">Planet</th>
                    <th style="padding:3px 4px; text-align:left;">Sign</th>
                    <th style="padding:3px 4px; text-align:center;">H</th>
                    <th style="padding:3px 4px; text-align:right;">Deg</th>
                    <th style="padding:3px 4px; text-align:left;">Nakshatra</th>
                    <th style="padding:3px 4px; text-align:left;">Status</th>
                  </tr>`;

              const pOrder = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
              pOrder.forEach(pName => {
                const pd = cp[pName];
                if (!pd) return;
                const pSn = pd.sn !== undefined ? pd.sn : (pd.sid !== undefined ? Math.floor(pd.sid/30) : 0);
                const pSign = _SIGNS_DRAW[pSn] || '?';
                const pHouse = pd.house || ((pSn - ascSn2 + 12) % 12 + 1);
                const pDeg = pd.deg !== undefined ? parseFloat(pd.deg).toFixed(1) : (pd.sid !== undefined ? (pd.sid % 30).toFixed(1) : '?');
                const pNak = pd.nak || '—';
                const pStatus = pd.status || (pd.retro ? 'Retro' : '—');
                const retro = pd.retro ? ' ℞' : '';
                const color = planetColors[pName] || 'var(--text)';
                tableHtml += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                  <td style="padding:3px 4px; color:${color}; font-weight:bold;">${pName}${retro}</td>
                  <td style="padding:3px 4px;">${pSign}</td>
                  <td style="padding:3px 4px; text-align:center; color:var(--gold2);">${pHouse}</td>
                  <td style="padding:3px 4px; text-align:right; font-family:monospace;">${pDeg}°</td>
                  <td style="padding:3px 4px; color:var(--muted);">${pNak}</td>
                  <td style="padding:3px 4px; color:${pStatus === 'Exalted' ? 'var(--green)' : pStatus === 'Debilitated' ? 'var(--rose)' : 'var(--muted)'};">${pStatus}</td>
                </tr>`;
              });
              tableHtml += `</table></div>`;
            }
          } catch(e) {
            tableHtml = `<div style="color:var(--rose); font-size:9px;">Planet data unavailable</div>`;
          }

          const wrapper = document.createElement('div');
          wrapper.style.cssText = `background:rgba(0,0,0,0.2); border:1px solid var(--border2); border-radius:8px; padding:10px; text-align:center;`;
          wrapper.innerHTML = `
            <div style="font-size:11px; color:var(--cyan); font-weight:bold; margin-bottom:8px; border-bottom:1px solid var(--border2); padding-bottom:6px;">${cfg.name}</div>
            <canvas id="${canvasId}" width="440" height="440" style="width:332px; height:332px;"></canvas>
            <div id="${infoId}">${tableHtml}</div>
          `;
          grid.appendChild(wrapper);

          // Draw chart
          try {
            const chartData2 = window.getChartPlanetsForDiv ? window.getChartPlanetsForDiv(cfg.div) : null;
            if (chartData2 && typeof window.drawDChart === 'function') {
              window.drawDChart(canvasId, { planets: chartData2.planets, asc: chartData2.asc, showAspects: true });
            }
          } catch(e) {
            console.error(`Error drawing ${cfg.name}:`, e);
          }
        });
      }, 150);
    }

//---------------------added end
    // Calculate Navamsha (D9) chart
    
    function calculateNavamsha(planetsData, ascData) {
      const d9Planets = {};
      const ascLon = ascData.sid;
      //const ascSn = ascData.sn;
      //const ascDeg = ascData.deg;
      
      // Calculate D9 Ascendant
      //const ascLon = ascSn * 30 + ascDeg;
      const d9AscLon = (ascLon * 9) % 360;
      const d9AscSn = Math.floor(d9AscLon / 30);
      const d9AscDeg = d9AscLon % 30;
      
      // Calculate D9 planets
      Object.keys(planetsData).forEach(p => {
        const lon = planetsData[p].sid !== undefined ? planetsData[p].sid : planetsData[p].longitude;
        const d9Lon = (lon * 9) % 360;
        const d9Sn = Math.floor(d9Lon / 30);
        const relativeHouse = ((d9Sn - d9AscSn + 12) % 12) + 1;
        
        d9Planets[p] = {
          sid: d9Lon,
          longitude: d9Lon,
          sn: d9Sn,
          deg: d9Lon % 30,
          house: relativeHouse,
          sign: SIGNS[d9Sn]
        };
      });
      
      return {
        planets: d9Planets,
        asc: { sid: d9AscLon, sn: d9AscSn, deg: d9AscDeg, sign: SIGNS[d9AscSn] }
      };
    }
    
    // Calculate Dasamsa (D10) chart
    function calculateDasamsa(planetsData, ascData) {
      const d10Planets = {};
      const ascLon = ascData.sid;
      //const ascSn = ascData.sn;
      //const ascDeg = ascData.deg;
      
      //const ascLon = ascSn * 30 + ascDeg;
      const d10AscLon = (ascLon * 10) % 360;
      const d10AscSn = Math.floor(d10AscLon / 30);
      const d10AscDeg = d10AscLon % 30;
      
      Object.keys(planetsData).forEach(p => {
        const lon = planetsData[p].sid !== undefined ? planetsData[p].sid : planetsData[p].longitude;
        const d10Lon = (lon * 10) % 360;
        const d10Sn = Math.floor(d10Lon / 30);
        const relativeHouse = ((d10Sn - d10AscSn + 12) % 12) + 1;
        
        d10Planets[p] = {
          sid: d10Lon,
          longitude: d10Lon,
          sn: d10Sn,
          deg: d10Lon % 30,
          house: relativeHouse,
          sign: SIGNS[d10Sn]
        };
      });
      
      return {
        planets: d10Planets,
        asc: { sid: d10AscLon, sn: d10AscSn, deg: d10AscDeg, sign: SIGNS[d10AscSn] }
      };
    }
    
    // Calculate Indu Lagna (Wealth Lagna)
    function calculateInduLagna(planetsData, ascData) {
      /* const LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) 
        ? window.ASTRO_CONSTANTS.SIGN_LORDS 
        : {0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter'}; */
      const moonLon = planetsData.Moon ? (planetsData.Moon.sid || planetsData.Moon.longitude) : 0;
      const sunLon = planetsData.Sun ? (planetsData.Sun.sid || planetsData.Sun.longitude) : 0;
      
      const moonSn = Math.floor(moonLon / 30);
      const sunSn = Math.floor(sunLon / 30);
      //const moonSn = planetsData.Moon ? Math.floor((planetsData.Moon.sid || planetsData.Moon.longitude) / 30) : ascData.sn;
      //
      // Get degrees of Sun and Moon lords
      const lordMoon = LORDS[moonSn];
      const lordSun = LORDS[sunSn];
      const lordMoonDeg = planetsData[lordMoon] ? (planetsData[lordMoon].sid || planetsData[lordMoon].longitude) : 0;
       const lordSunDeg = planetsData[lordSun] ? (planets[lordSun].sid || planets[lordSun].longitude) : 0;
      
      const induLon = (lordMoonDeg + lordSunDeg) % 360;
      //const lordSunDeg = planetsData[lordSun] ? (planetsData[lordSun].sid || planetsData[lordSun].longitude) : 0;
      
      //const sumDeg = lordMoonDeg + lordSunDeg;
      //const induLon = sumDeg % 360;
      const induSn = Math.floor(induLon / 30);
      //const induDeg = induLon % 30;
      
      return {
        sid: induLon,
        sn: induSn,
       deg: induLon % 30,
        sign: SIGNS[induSn],
        name: "Indu Lagna (Wealth)"
      };
    }
    
    // Calculate Arudha Lagna (Pada Lagna)
    function calculateArudhaLagna(ascData, planetsData) {
    
      
      const ascSn = ascData.sn;
      const ascLord = LORDS[ascSn];
      const ascLordData = planetsData[ascLord];
      
      if (!ascLordData) {
        return { sn: ascSn, sign: SIGNS[ascSn], name: "Arudha Lagna (Pada)" };
      }
      
      const lordSn = ascLordData.sn;
      let diff = (lordSn - ascSn + 12) % 12;
      let arudhaSn = (lordSn + diff) % 12;
      
      // Special rule: If arudha is same as lagna or 7th from lagna, add 9
      if (arudhaSn === ascSn || (arudhaSn - ascSn + 12) % 12 === 6) {
        arudhaSn = (arudhaSn + 9) % 12;
      }
      
      return {
        sn: arudhaSn,
        sign: SIGNS[arudhaSn],
        name: "Arudha Lagna (Pada - Public Image)"
      };
    }

    // ============================================================
    // 7. CALCULATE ALL CHARTS
    // ============================================================
    
    //const ascSn = ascendant.sn || Math.floor((ascendant.sid || ascendant.longitude) / 30);
    //const ascDeg = (ascendant.deg !== undefined) ? ascendant.deg : ((ascendant.sid || ascendant.longitude) % 30);
    const ascAbs = ascendant.sid !== undefined ? ascendant.sid : ascendant.longitude;
    const ascSn = Math.floor(ascAbs / 30);
    const ascDeg = ascAbs % 30;
    const ascData = {
      sn: ascSn,
      deg: ascDeg,
      //sid: ascSn * 30 + ascDeg,
      sid: ascAbs,
      sign: SIGNS[ascSn]
    };
    
    // D9 Chart
    const d9Chart = calculateNavamsha(planets, ascData);
    
    // D10 Chart
    const d10Chart = calculateDasamsa(planets, ascData);
    
    // Indu Lagna
    const induLagna = calculateInduLagna(planets, ascData);
    
    // Arudha Lagna
    const arudhaLagna = calculateArudhaLagna(ascData, planets);
    
    // Create Indu chart data
    const induPlanets = {};
    Object.keys(planets).forEach(p => {
      const lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
      const relativeHouse = ((Math.floor(lon / 30) - induLagna.sn + 12) % 12) + 1;
      induPlanets[p] = {
        sid: lon,
        sn: Math.floor(lon / 30),
        deg: lon % 30,
        house: relativeHouse,
        sign: SIGNS[Math.floor(lon / 30)]
      };
    });
    
    // Create Arudha chart data
    const arudhaPlanets = {};
    Object.keys(planets).forEach(p => {
      const lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
      const relativeHouse = ((Math.floor(lon / 30) - arudhaLagna.sn + 12) % 12) + 1;
      arudhaPlanets[p] = {
        sid: lon,
        sn: Math.floor(lon / 30),
        deg: lon % 30,
        house: relativeHouse,
        sign: SIGNS[Math.floor(lon / 30)]
      };
    });
    // ============================================================
    // 8. RENDER ALL KEY CHARTS (D1, D9, D10, Indu, Arudha)
    // ============================================================
    
    html += `<div class="pred-item" style="border-left: 3px solid #ff9f43; margin-top:20px;">
      <div class="pred-title" style="color:#ff9f43; font-size:14px; text-align:center;">📊 Key Divisional Charts Analysis</div>
      <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">D1 (Rasi), D9 (Navamsha), D10 (Dasamsa), Indu Lagna (Wealth), Arudha Lagna (Pada)</div>
      <div id="keyChartsContainer" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
    `;

    // Chart configuration
    const chartsToRender = [
      { 
        name: "D1 - Rasi Chart", 
        planets: planets, 
        asc: ascData, 
        borderColor: "#ffd700", 
        desc: "Birth chart - Overall life, personality, and destiny" 
      },
      { 
        name: "D9 - Navamsha Chart", 
        planets: d9Chart.planets, 
        asc: d9Chart.asc, 
        borderColor: "#9b6fff", 
        desc: "Marriage, spouse, dharma, and fortune after 32" 
      },
      { 
        name: "D10 - Dasamsa Chart", 
        planets: d10Chart.planets, 
        asc: d10Chart.asc, 
        borderColor: "#00cec9", 
        desc: "Career, profession, status, and public image" 
      },
      { 
        name: "💰 Indu Lagna Chart", 
        planets: induPlanets, 
        asc: { sn: induLagna.sn, deg: induLagna.deg, sign: induLagna.sign, sid: induLagna.sid }, 
        borderColor: "#ff9f43", 
        desc: `Wealth chart - Lord: ${LORDS[induLagna.sn] || 'N/A'} | Financial prosperity and assets` 
      },
      { 
        name: "⭐ Arudha Lagna Chart", 
        planets: arudhaPlanets, 
        asc: { sn: arudhaLagna.sn, deg: 0, sign: arudhaLagna.sign, sid: arudhaLagna.sn * 30 }, 
        borderColor: "#ff6b6b", 
        desc: "Public image - How the world perceives you" 
      }
    ];

    let chartIds = [];

    chartsToRender.forEach((chart, idx) => {
      const canvasId = `key_chart_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      chartIds.push({ id: canvasId, data: chart, type: 'key' });
      
      html += `
        <div style="background:#0d0d1a; border:2px solid ${chart.borderColor}; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:12px; font-weight:bold; color:${chart.borderColor}; margin-bottom:6px; border-bottom:1px solid #2a2a4a; padding-bottom:6px;">
            ${chart.name}
          </div>
          <div style="display:flex; justify-content:center; min-height:280px;">
            <canvas id="${canvasId}" width="280" height="280" style="width:280px; height:280px; border-radius:8px;"></canvas>
          </div>
          <div style="font-size:8px; color:#8888aa; margin-top:6px; padding:4px;">
            ${chart.desc}
          </div>
          <div style="font-size:9px; color:#66ccff; background:#0a0a15; padding:4px; border-radius:4px; margin-top:4px;">
            Lagna: ${chart.asc.sign} at ${chart.asc.deg.toFixed(2)}°
          </div>
        </div>
      `;
    });

    html += `</div></div>`;

    // Draw key charts
    setTimeout(function() {
      chartIds.forEach(function(chartInfo) {
        const canvas = document.getElementById(chartInfo.id);
        if (canvas && typeof window.drawDChart === 'function') {
          try {
            const customData = {
              planets: chartInfo.data.planets,
              asc: chartInfo.data.asc,
              showAspects: true
            };
            window.drawDChart(chartInfo.id, customData);
          } catch(e) {
            console.error(`Error drawing ${chartInfo.data.name}:`, e);
          }
        }
      });
    }, 100);
    // ============================================================
    // 9. ANALYSIS SECTION FOR KEY CHARTS
    // ============================================================
    
    //const LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) ? window.ASTRO_CONSTANTS.SIGN_LORDS : {0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter'};
    
    // D1 Analysis
    const d10thLord = LORDS[(ascSn + 9) % 12];
    const d1tenthLordPlanet = planets[d10thLord];
    
    // D9 Analysis
    const d9AscSn = d9Chart.asc.sn;
    const d97thLord = LORDS[(d9AscSn + 6) % 12];
    const d97thLordPlanet = d9Chart.planets[d97thLord];
    
    // D10 Analysis
    const d10AscSn = d10Chart.asc.sn;
    const d1010thLord = LORDS[(d10AscSn + 9) % 12];
    const d1010thLordPlanet = d10Chart.planets[d1010thLord];
     html += `<div class="pred-item" style="border-left: 3px solid #00cec9; margin-top:20px;">
      <div class="pred-title" style="color:#00cec9; font-size:14px; text-align:center;">🔍 Divisional Chart Analysis</div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:15px; margin-top:10px;">
        
        <!-- D1 Analysis -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
          <div style="color:#ffd700; font-size:11px; font-weight:bold; margin-bottom:6px;">🌟 D1 - Rasi Chart</div>
          <div style="font-size:9.5px; line-height:1.5;">
            <div><strong>10th Lord (Career):</strong> ${d10thLord}</div>
            <div><strong>10th Lord in:</strong> ${d1tenthLordPlanet ? SIGNS[Math.floor((d1tenthLordPlanet.sid || d1tenthLordPlanet.longitude) / 30)] : 'N/A'} House ${d1tenthLordPlanet ? d1tenthLordPlanet.house : 'N/A'}</div>
            <div><strong>Lagna Lord:</strong> ${LORDS[ascSn]} in ${SIGNS[Math.floor((planets[LORDS[ascSn]]?.sid || 0) / 30)] || 'N/A'}</div>
            <div><strong>Moon Sign:</strong> ${moonSign}</div>
            <div style="margin-top:6px; color:var(--muted);">Overall life direction, personality, and karmic path.</div>
          </div>
        </div>
        
        <!-- D9 Analysis -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
          <div style="color:#9b6fff; font-size:11px; font-weight:bold; margin-bottom:6px;">💍 D9 - Navamsha Chart</div>
          <div style="font-size:9.5px; line-height:1.5;">
            <div><strong>7th Lord (Spouse):</strong> ${d97thLord}</div>
            <div><strong>7th Lord in:</strong> ${d97thLordPlanet ? SIGNS[d97thLordPlanet.sn] : 'N/A'} House ${d97thLordPlanet ? d97thLordPlanet.house : 'N/A'}</div>
            <div><strong>Lagna Lord:</strong> ${LORDS[d9AscSn]}</div>
            <div><strong>Marriage Destiny:</strong> ${d97thLordPlanet ? (d97thLordPlanet.house <= 6 ? 'Early marriage indication' : 'Late marriage indication') : 'Neutral'}</div>
            <div style="margin-top:6px; color:var(--muted);">Spouse, dharma, fortune, and life after 32-36.</div>
          </div>
        </div>
        
        <!-- D10 Analysis -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
          <div style="color:#00cec9; font-size:11px; font-weight:bold; margin-bottom:6px;">💼 D10 - Dasamsa Chart</div>
          <div style="font-size:9.5px; line-height:1.5;">
            <div><strong>10th Lord:</strong> ${d1010thLord}</div>
            <div><strong>10th Lord in:</strong> ${d1010thLordPlanet ? SIGNS[d1010thLordPlanet.sn] : 'N/A'} House ${d1010thLordPlanet ? d1010thLordPlanet.house : 'N/A'}</div>
            <div><strong>Lagna Lord:</strong> ${LORDS[d10AscSn]}</div>
            <div><strong>Career Path:</strong> ${getCareerPathFromHouse(d1010thLordPlanet ? d1010thLordPlanet.house : 0)}</div>
            <div style="margin-top:6px; color:var(--muted);">Profession, status, authority, and public recognition.</div>
          </div>
        </div>
        
        <!-- Indu Lagna Analysis -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
          <div style="color:#ff9f43; font-size:11px; font-weight:bold; margin-bottom:6px;">💰 Indu Lagna (Wealth)</div>
          <div style="font-size:9.5px; line-height:1.5;">
            <div><strong>Wealth Sign:</strong> ${induLagna.sign}</div>
            <div><strong>Wealth Lord:</strong> ${LORDS[induLagna.sn] || 'N/A'}</div>
            <div><strong>Wealth Lord Position:</strong> ${planets[LORDS[induLagna.sn]] ? `House ${planets[LORDS[induLagna.sn]].house}` : 'N/A'}</div>
            <div><strong>Wealth Nature:</strong> ${getWealthNature(induLagna.sn)}</div>
            <div style="margin-top:6px; color:var(--muted);">Financial prosperity, assets, and material gains.</div>
          </div>
        </div>
        
        <!-- Arudha Lagna Analysis -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
          <div style="color:#ff6b6b; font-size:11px; font-weight:bold; margin-bottom:6px;">⭐ Arudha Lagna (Pada)</div>
          <div style="font-size:9.5px; line-height:1.5;">
            <div><strong>Public Image Sign:</strong> ${arudhaLagna.sign}</div>
            <div><strong>Image Lord:</strong> ${LORDS[arudhaLagna.sn] || 'N/A'}</div>
            <div><strong>Perception:</strong> ${getPublicImageDesc(arudhaLagna.sn)}</div>
            <div><strong>World Sees You As:</strong> ${getArudhaNature(arudhaLagna.sn)}</div>
            <div style="margin-top:6px; color:var(--muted);">How the world perceives you - your public mask.</div>
          </div>
        </div>
        
      </div>
    </div>`;

    // Helper functions for analysis
    function getCareerPathFromHouse(house) {
      const careers = {
        1: 'Self-employed, leadership, independent work',
        2: 'Finance, banking, wealth management, family business',
        3: 'Communication, marketing, sales, short travel',
        4: 'Real estate, property, hospitality, home-based business',
        5: 'Creative arts, entertainment, education, stock market',
        6: 'Service industry, healthcare, legal, competitive fields',
        7: 'Partnerships, consulting, public relations, law',
        8: 'Research, occult, insurance, finance, transformation',
        9: 'Teaching, law, religion, long-distance travel, publishing',
        10: 'Government, administration, politics, high authority',
        11: 'Large organizations, social work, technology, gains',
        12: 'Foreign lands, spirituality, charity, hospitals'
      };
      return careers[house] || 'General profession';
    }
    
    function getWealthNature(signNum) {
      const natures = {
        0: 'Active wealth - Earned through initiative and courage',
        1: 'Steady wealth - Builds slowly through patience',
        2: 'Versatile wealth - Multiple income streams',
        3: 'Emotional wealth - Money through nurturing and care',
        4: 'Royal wealth - Status and recognition bring money',
        5: 'Analytical wealth - Earned through skill and service',
        6: 'Balanced wealth - Partnerships and fairness',
        7: 'Hidden wealth - Inheritance and transformation',
        8: 'Expansive wealth - Through wisdom and teaching',
        9: 'Structured wealth - Through discipline and time',
        10: 'Unconventional wealth - Through innovation',
        11: 'Spiritual wealth - Through surrender and faith'
      };
      return natures[signNum] || 'Mixed wealth sources';
    }
    
    function getPublicImageDesc(signNum) {
      const images = {
        0: 'Aggressive, pioneering, competitive',
        1: 'Stable, reliable, artistic, pleasure-loving',
        2: 'Intelligent, communicative, versatile, curious',
        3: 'Nurturing, emotional, protective, sensitive',
        4: 'Confident, proud, dramatic, authoritative',
        5: 'Analytical, service-oriented, humble, detail-focused',
        6: 'Diplomatic, fair, social, relationship-focused',
        7: 'Intense, mysterious, powerful, transformative',
        8: 'Optimistic, philosophical, adventurous, generous',
        9: 'Disciplined, responsible, ambitious, patient',
        10: 'Innovative, humanitarian, independent, eccentric',
        11: 'Compassionate, artistic, spiritual, dreamy'
      };
      return images[signNum] || 'Balanced public image';
    }
    
    function getArudhaNature(signNum) {
      const natures = {
        0: 'A go-getter, initiator, leader',
        1: 'A builder, stabilizer, artist',
        2: 'A communicator, networker, learner',
        3: 'A caregiver, healer, emotional support',
        4: 'A performer, leader, authority figure',
        5: 'A helper, analyst, service provider',
        6: 'A diplomat, mediator, partner',
        7: 'A transformer, researcher, healer',
        8: 'A teacher, guide, philosopher',
        9: 'A organizer, manager, achiever',
        10: 'An innovator, rebel, humanitarian',
        11: 'A dreamer, artist, spiritual guide'
      };
      return natures[signNum] || 'A balanced individual';
    }
    
    
    
    if (window.AP_PREDICTION_DAY && window.AP_PREDICTION_TITHI && window.AP_PREDICTION_YOGA) {
      
      let dayKey = bCtx.date ? bCtx.date.getDay() : null;
      if (dayKey === null && window.BIRTH && window.BIRTH.date) dayKey = window.BIRTH.date.getDay(); 
      if (dayKey === null && dayStr !== "Unknown") {
        const dayMap = { "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6 };
        dayKey = dayMap[dayStr];
      }

      const dayPred = window.AP_PREDICTION_DAY.get(dayKey);
      const tithiPred = window.AP_PREDICTION_TITHI.get(tithiNum);
      const yogaPred = window.AP_PREDICTION_YOGA.get(yogaNum);

      html += `<div class="pred-item" style="border-left: 3px solid var(--violet); margin-top:20px;">
        <div class="pred-title" style="color:var(--violet); font-size:14px; text-align:center; margin-bottom:10px;">🔮 Panchang Deep Personality Predictions</div>
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Insights derived from traditional texts based on Day, Tithi, and Yoga</div>
        <div style="display:grid; grid-template-columns:1fr; gap:15px;">`;

      if (dayPred) {
        html += `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px;">
            <div style="color:var(--gold); font-size:12px; margin-bottom:6px; font-weight:bold;">✨ Day of Birth: ${dayPred.name_en || dayPred.name || 'Unknown'} / ${dayPred.name_hi || ''}</div>
            <div style="font-size:10.5px; color:var(--cyan); margin-bottom:6px;"><strong>Lord:</strong> ${dayPred.lord_en || dayPred.lord || 'N/A'} | <strong>Lucky Colors:</strong> ${dayPred.lucky_color_en || dayPred.luckyColor || 'N/A'}</div>
            <div style="font-size:11px; color:var(--text); line-height:1.5; margin-bottom:8px;">${dayPred.prediction_en || dayPred.prediction || 'No prediction available'}</div>
            ${dayPred.prediction_hi ? `<div style="font-size:10px; color:var(--text); font-style:italic; line-height:1.5; opacity:0.8; margin-bottom:8px;"><strong>हिंदी में:</strong> ${dayPred.prediction_hi}</div>` : ''}
            <div style="font-size:9.5px; color:var(--gold2); border-top:1px dashed var(--border2); padding-top:6px;"><strong>Remedy:</strong> ${dayPred.remedy_en || dayPred.remedy || 'No remedy specified'}</div>
          </div>`;
      }

      if (tithiPred) {
        html += `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px;">
            <div style="color:var(--gold); font-size:12px; margin-bottom:6px; font-weight:bold;">🌙 Tithi: ${tithiPred.name_en || tithiPred.name || tithiName} / ${tithiPred.name_hi || ''} (${tithiPhase})</div>
            <div style="font-size:10.5px; color:var(--cyan); margin-bottom:6px;"><strong>Presiding Deity:</strong> ${tithiPred.devata_en || tithiPred.devata || 'N/A'}</div>
            <div style="font-size:11px; color:var(--text); line-height:1.5; margin-bottom:8px;">${tithiPred.prediction_en || tithiPred.prediction || 'No prediction available'}</div>
            ${tithiPred.prediction_hi ? `<div style="font-size:10px; color:var(--text); font-style:italic; line-height:1.5; opacity:0.8; margin-bottom:8px;"><strong>हिंदी में:</strong> ${tithiPred.prediction_hi}</div>` : ''}
            <div style="font-size:9.5px; color:var(--gold2); border-top:1px dashed var(--border2); padding-top:6px;"><strong>Remedy:</strong> ${tithiPred.remedy_en || tithiPred.remedy || 'No remedy specified'}</div>
          </div>`;
      }

      if (yogaPred) {
        html += `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px;">
            <div style="color:var(--gold); font-size:12px; margin-bottom:6px; font-weight:bold;">🧘 Yoga: ${yogaPred.name_en || yogaPred.name || yogaStr} / ${yogaPred.name_hi || ''}</div>
            <div style="font-size:10.5px; color:var(--cyan); margin-bottom:8px; line-height:1.5;">
              <strong>Presiding Deity:</strong> ${yogaPred.devata_en || yogaPred.devata || 'N/A'} | <strong>Kind:</strong> ${yogaPred.kind || 'N/A'}<br/>
              <strong>Meaning:</strong> ${yogaPred.meaning || yogaStr || 'N/A'}
            </div>
            <div style="font-size:11px; color:var(--text); line-height:1.5; margin-bottom:8px;">${yogaPred.prediction_en || yogaPred.prediction || 'No prediction available'}</div>
            ${yogaPred.prediction_hi ? `<div style="font-size:10px; color:var(--text); font-style:italic; line-height:1.5; opacity:0.8; margin-bottom:8px;"><strong>हिंदी में:</strong> ${yogaPred.prediction_hi}</div>` : ''}
          </div>`;
      }

      html += `</div></div>`;
    }

    // ============================================================
    // 7. STEP-BY-STEP KARMIC AXIS CALCULATION
    // ============================================================
    let stepHtml = `<div class="pred-item" style="border-left: 3px solid var(--violet); margin-top:20px;">
        <div class="pred-title" style="color:var(--violet); font-size:14px; text-align:center; margin-bottom:15px;">📐 Step-by-Step Karmic Axis Derivation</div>
        <div style="font-family:'Courier New', monospace; font-size:11px; color:var(--text); line-height:1.7; background:rgba(0,0,0,0.25); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); overflow-x:auto;">`;

    try {
       // const LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS)? window.ASTRO_CONSTANTS.SIGN_LORDS : {0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter'};
        
        const pNames = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.PLANETS) 
          ? window.ASTRO_CONSTANTS.PLANETS.slice(0, 9) 
          : ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
        
        const natalAscSn = ascendant.sn || Math.floor((ascendant.sid || ascendant.longitude) / 30);
        const ascDegInSign = (ascendant.deg !== undefined) ? ascendant.deg : ((ascendant.sid || ascendant.longitude) % 30);
        const h8Sn = (natalAscSn + 7) % 12;
        const h8Lord = LORDS[h8Sn];

        // Step 1
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">1. Ascendant and Basic Rashi Positions</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `Ascendant = ${SIGNS[natalAscSn]} (${ascDegInSign.toFixed(2)}°)<br><br>`;
        stepHtml += `<table style="width:100%; max-width:350px; color:var(--muted); border-collapse:collapse; text-align:left;">`;
        stepHtml += `<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th style="padding:4px 0;">House</th><th style="padding:4px 0;">Sign</th><th style="padding:4px 0;">Planets</th></tr>`;
        
        for(let i=1; i<=12; i++) {
            let sn = (natalAscSn + i - 1) % 12;
            let occupants = pNames.filter(p => planets[p] && Math.floor((planets[p].sid || planets[p].longitude) / 30) === sn);
            if (occupants.length > 0 || i === 1 || i === 8 || i === 10) {
               stepHtml += `<tr><td style="padding:4px 0;">${i}</td><td style="padding:4px 0;">${SIGNS[sn]}</td><td style="padding:4px 0;">${occupants.length > 0 ? occupants.join(', ') : 'None'}</td></tr>`;
            }
        }
        stepHtml += `</table></div>`;

        // Step 2
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">2. Randhreshvara (8th Lord)</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `The 8th house from ${SIGNS[natalAscSn]} is ${SIGNS[h8Sn]}.<br>`;
        stepHtml += `Lord of ${SIGNS[h8Sn]} is ${h8Lord} (in D1 natal chart).<br>`;
        stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: Randhreshvara = ${h8Lord}</strong></div>`;

        // Step 3
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">3. Randhra Yukta (Planets occupying 8th house)</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `8th house = ${SIGNS[h8Sn]}.<br>`;
        let occ8 = pNames.filter(p => planets[p] && Math.floor((planets[p].sid || planets[p].longitude)/30) === h8Sn);
        stepHtml += `Check planets in ${SIGNS[h8Sn]}: ${occ8.length > 0 ? occ8.join(', ') : 'None'}.<br>`;
        stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: Randhra Yukta = ${occ8.length > 0 ? occ8.join(', ') : 'None'}</strong></div>`;

        // Step 4
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">4. Randhra Drishta (Planets aspecting 8th house)</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        let asp8 = [];
        pNames.forEach(p => {
           if (!planets[p]) return;
           let pSn = Math.floor((planets[p].sid || planets[p].longitude)/30);
           if (pSn === h8Sn) return;
           let dist = (h8Sn - pSn + 12) % 12;
           let aspecting = false;
           let aspectType = "";
           
           if (dist === 6) { aspecting = true; aspectType = "7th"; }
           else if (p === 'Mars' && dist === 3) { aspecting = true; aspectType = "4th"; }
           else if (p === 'Mars' && dist === 7) { aspecting = true; aspectType = "8th"; }
           else if (['Jupiter', 'Rahu', 'Ketu'].includes(p) && dist === 4) { aspecting = true; aspectType = "5th"; }
           else if (['Jupiter', 'Rahu', 'Ketu'].includes(p) && dist === 8) { aspecting = true; aspectType = "9th"; }
           else if (p === 'Saturn' && dist === 2) { aspecting = true; aspectType = "3rd"; }
           else if (p === 'Saturn' && dist === 9) { aspecting = true; aspectType = "10th"; }

           if (aspecting) {
               asp8.push(p);
               stepHtml += `${p} from ${SIGNS[pSn]} casts its ${aspectType} aspect to ${SIGNS[h8Sn]}.<br>`;
           }
        });
        if (asp8.length === 0) stepHtml += `No planets cast an aspect to ${SIGNS[h8Sn]}.<br>`;
        stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: Randhra Drishta = ${asp8.length > 0 ? asp8.join(', ') : 'None'}</strong></div>`;

        // Step 5
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">5. Randhreshvara Yuti (Conjunction with 8th Lord)</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `8th lord = ${h8Lord}.<br>`;
        let h8LordSn = planets[h8Lord] ? Math.floor((planets[h8Lord].sid || planets[h8Lord].longitude)/30) : -1;
        let yuti8 = [];
        if (h8LordSn !== -1) {
            yuti8 = pNames.filter(p => p !== h8Lord && planets[p] && Math.floor((planets[p].sid || planets[p].longitude)/30) === h8LordSn);
            stepHtml += `Checking conjunction with the 8th lord in its placed house:<br>`;
            stepHtml += `${h8Lord} is placed in ${SIGNS[h8LordSn]} with ${yuti8.length > 0 ? yuti8.join(', ') : 'no other planets'}.<br>`;
        } else {
            stepHtml += `${h8Lord} position is unavailable.<br>`;
        }
        stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: Randhreshvara Yuti = ${yuti8.length > 0 ? yuti8.join(', ') : 'None'}</strong></div>`;

        // Step 6
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">6. Kharesha (22nd Drekkana Lord)</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        
        let ascAbs = ascendant.sid || ascendant.longitude;
        let kharesha = '-';
        if (typeof window.getVargaData === 'function') {
            let d3AscSign = window.getVargaData(ascAbs, 3).sign;
            let h8D3Sign = (d3AscSign + 7) % 12;
            kharesha = LORDS[h8D3Sign];
            
            stepHtml += `Seeking D3 (Drekkana) chart:<br>`;
            stepHtml += `D3 Ascendant is ${SIGNS[d3AscSign]}.<br>`;
            stepHtml += `The 22nd Drekkana corresponds to the 8th house in the D3 chart.<br>`;
            stepHtml += `The 8th house in D3 is ${SIGNS[h8D3Sign]}.<br>`;
            stepHtml += `Lord of ${SIGNS[h8D3Sign]} is ${kharesha}.<br>`;
            stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: Kharesha = ${kharesha}</strong></div>`;
        } else {
            let d3Idx = Math.floor(ascDegInSign / 10);
            let kharD3Sign = (h8Sn + d3Idx * 4) % 12;
            kharesha = LORDS[kharD3Sign];
            stepHtml += `D3 calculation fallback. 22nd Drekkana sign is ${SIGNS[kharD3Sign]}. Lord is ${kharesha}.<br>`;
            stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: Kharesha = ${kharesha}</strong></div>`;
        }

        // Step 7
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">7. 64th Navamsha from Moon</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        let m64Lord = '-';
        if (planets.Moon) {
            let mDeg = (planets.Moon.sid || planets.Moon.longitude);
            let mDegInSign = mDeg % 30;
            let mSn = Math.floor(mDeg/30);
            let khar64LonMoon = (mDeg + 210) % 360;
            let m64D9Sn = typeof window.getVargaData === 'function' ? window.getVargaData(khar64LonMoon, 9).sign : 0;
            m64Lord = LORDS[m64D9Sn];
            
            stepHtml += `Moon is in ${SIGNS[mSn]} at ${mDegInSign.toFixed(2)}°.<br>`;
            stepHtml += `Adding 210° (exactly 64 Navamshas = 7 signs + 1 Navamsha equivalence).<br>`;
            stepHtml += `This projects to ${SIGNS[Math.floor(khar64LonMoon/30)]} ${(khar64LonMoon%30).toFixed(2)}°.<br>`;
            stepHtml += `The Navamsha of this point falls in ${SIGNS[m64D9Sn]}.<br>`;
            stepHtml += `${SIGNS[m64D9Sn]} is ruled by ${m64Lord}.<br>`;
            stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: 64th Navamsha from Moon = ${m64Lord}</strong></div>`;
        } else {
            stepHtml += `Moon data unavailable.</div>`;
        }

        // Step 8
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:6px; font-size:12px;">8. 64th Navamsha from Ascendant</div>`;
        stepHtml += `<div style="margin-bottom:15px; padding-left:12px; border-left:2px solid rgba(255,255,255,0.1);">`;
        let khar64LonAsc = (ascAbs + 210) % 360;
        let a64D9Sn = typeof window.getVargaData === 'function' ? window.getVargaData(khar64LonAsc, 9).sign : 0;
        let a64Lord = LORDS[a64D9Sn];
        
        stepHtml += `Ascendant is in ${SIGNS[natalAscSn]} at ${ascDegInSign.toFixed(2)}°.<br>`;
        stepHtml += `Adding 210° projects to ${SIGNS[Math.floor(khar64LonAsc/30)]} ${(khar64LonAsc%30).toFixed(2)}°.<br>`;
        stepHtml += `The Navamsha of this point falls in ${SIGNS[a64D9Sn]}.<br>`;
        stepHtml += `${SIGNS[a64D9Sn]} is ruled by ${a64Lord}.<br>`;
        stepHtml += `<strong style="color:var(--cyan);">✓ Therefore: 64th Navamsha from Ascendant = ${a64Lord}</strong></div>`;

        // Final Summary
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-top:20px; margin-bottom:6px; font-size:12px;">📊 Final Summary Table</div>`;
        stepHtml += `<table style="width:100%; max-width:450px; color:var(--text); border-collapse:collapse; text-align:left; border:1px solid rgba(255,255,255,0.1);">`;
        stepHtml += `<tr style="background:rgba(255,255,255,0.05);"><th style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Factor</th><th style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Result</th></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Randhreshvara (8th Lord)</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${h8Lord}</td></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Randhra Yukta (Planets in 8th)</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${occ8.length > 0 ? occ8.join(', ') : 'None'}</td></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Randhra Drishta (Aspects to 8th)</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${asp8.length > 0 ? asp8.join(', ') : 'None'}</td></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Randhreshvara Yuti (Conjunct 8L)</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${yuti8.length > 0 ? yuti8.join(', ') : 'None'}</td></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">Kharesha (22nd Drek Lord)</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--rose);">${kharesha}</td></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">64th Navamsha from Moon</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--rose);">${m64Lord}</td></tr>`;
        stepHtml += `<tr><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1);">64th Navamsha from Ascendant</td><td style="padding:6px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--rose);">${a64Lord}</td></tr>`;
        stepHtml += `</table>`;

        // Karmic activation summary
        let karmicSet = new Set([h8Lord, ...occ8, ...asp8, ...yuti8, kharesha, m64Lord, a64Lord]);
        karmicSet.delete('None');
        karmicSet.delete('-');
        
        stepHtml += `<div style="margin-top:15px; padding:10px; background:rgba(155,111,255,0.1); border-radius:6px; font-style:italic; color:var(--muted);">
          ⚡ These combinations show strong karmic activation through: <strong style="color:var(--text);">${Array.from(karmicSet).join(', ') || 'None detected'}</strong>. 
          Watch these planets carefully during their Mahadasha or transit over sensitive points.
        </div>`;

    } catch(e) {
        stepHtml += `<div style="color:var(--rose); padding:10px;">⚠️ Error computing step-by-step breakdown: ${e.message}</div>`;
    }

    stepHtml += `</div></div>`;
    html += stepHtml;

    // ============================================================
    // 8. ROTATED KUNDALIS (12 HOROSCOPES)
    // ============================================================
    html += `<div class="pred-item" style="border-left: 3px solid var(--cyan); margin-top:20px;">
        <div class="pred-title" style="color:var(--cyan); font-size:14px; text-align:center;">🔄 12 Horoscopes (Rotated Kundalis)</div>
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Each house treated as Lagna - Bhavat Bhavam effect analysis</div>
        <div id="rotatedChartsContainer" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
    `;

    const planetListRot = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    let planetSigns = {};
    let planetDegrees = {};

    planetListRot.forEach(p => {
      if(planets[p]) {
        let sid = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
        planetSigns[p] = Math.floor(sid / 30);
        planetDegrees[p] = sid;
      }
    });

    // Get NATAL Ascendant sign
    let natalAscSign = Math.floor( (ascendant.sid !== undefined ? ascendant.sid : ascendant.longitude) / 30 );
    let natalAscDeg = (ascendant.sid !== undefined ? ascendant.sid : ascendant.longitude) % 30;
    if (isNaN(natalAscSign)) natalAscSign = 0;

    // Function to prepare chart data for a rotated ascendant
    function prepareRotatedChartData(rotatedAscSign, originalPlanets, originalPlanetDegrees, originalAscDeg) {
        let rotatedPlanets = {};
        
        let rotatedAscendant = {
            sid: rotatedAscSign * 30 + originalAscDeg,
            longitude: rotatedAscSign * 30 + originalAscDeg,
            sn: rotatedAscSign,
            deg: originalAscDeg,
            sign: SIGNS[rotatedAscSign],
            signIndex: rotatedAscSign
        };
        
        Object.keys(originalPlanets).forEach(planet => {
            let planetSign = originalPlanets[planet];
            let planetDeg = originalPlanetDegrees[planet];
            let relativeHouse = ((planetSign - rotatedAscSign + 12) % 12) + 1;
            
            rotatedPlanets[planet] = {
                sid: planetDeg,
                longitude: planetDeg,
                sn: planetSign,
                deg: planetDeg % 30,
                house: relativeHouse,
                sign: SIGNS[planetSign],
                signIndex: planetSign
            };
        });
        
        return {
            planets: rotatedPlanets,
            asc: rotatedAscendant
        };
    }

    chartIds = [];

    for(let rotNum = 0; rotNum < 12; rotNum++) {
        let originalHouseNumber = rotNum + 1;
        let rotatedAscSign = (natalAscSign + rotNum) % 12;
        let newAscName = SIGNS[rotatedAscSign];
        let originalHouseSign = SIGNS[(natalAscSign + rotNum) % 12];
        
        const chartData = prepareRotatedChartData(rotatedAscSign, planetSigns, planetDegrees, natalAscDeg);
        
        const canvasId = `rotated_chart_${rotNum}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        chartIds.push({ id: canvasId, data: chartData, rotNum: rotNum });
        
        //const LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS)?window.ASTRO_CONSTANTS.SIGN_LORDS: ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
        let originalLord = LORDS[(natalAscSign + rotNum) % 12];
        
        let title = "";
        let borderColor = "";
        let focusText = "";
        
        if (rotNum === 0) {
            title = `🌟 NATAL CHART (Original)`;
            borderColor = "#ffd700";
            focusText = `📖 Lagna: ${newAscName} at ${natalAscDeg.toFixed(2)}° | House 1 (Self) perspective`;
        } else {
            title = `🔄 HOUSE ${originalHouseNumber} AS LAGNA`;
            borderColor = "#9b6fff";
            focusText = `🎯 Lagna: ${newAscName} at ${natalAscDeg.toFixed(2)}° | Bhavat Bhavam: How ${getHouseMeaning(originalHouseNumber)} matters manifest from their own perspective`;
        }
        
        html += `
            <div style="background:#0d0d1a; border:2px solid ${borderColor}; border-radius:12px; padding:12px; text-align:center;">
                <div style="font-size:12px; font-weight:bold; color:${borderColor}; margin-bottom:8px; border-bottom:1px solid #2a2a4a; padding-bottom:6px;">
                    ${title}
                </div>
                <div style="display:flex; justify-content:center; min-height:320px;">
                    <canvas id="${canvasId}" width="318" height="318" style="width:318px; height:318px; border-radius:8px;"></canvas>
                </div>
                <div style="font-size:9px; color:#66ccff; background:#0a0a15; padding:6px; border-radius:6px; margin-top:8px;">
                    Original House ${originalHouseNumber}: ${originalHouseSign} (Lord: ${originalLord}) → Now becomes House 1 (Lagna)
                </div>
                <div style="font-size:8px; color:#8888aa; margin-top:6px; padding:4px;">
                    ${focusText}
                </div>
            </div>
        `;
    }

    html += `</div></div>`;

    function getHouseMeaning(houseNum) {
        const meanings = {
            1: 'Self, Personality, Health, Character',
            2: 'Wealth, Family, Speech, Food Habits',
            3: 'Courage, Siblings, Communication, Efforts',
            4: 'Home, Mother, Happiness, Vehicles',
            5: 'Children, Creativity, Intelligence, Romance',
            6: 'Health, Enemies, Service, Debts',
            7: 'Marriage, Partnership, Business, Travel',
            8: 'Transformation, Longevity, Occult, Inheritance',
            9: 'Luck, Father, Dharma, Higher Learning',
            10: 'Career, Status, Authority, Public Image',
            11: 'Gains, Friends, Aspirations, Income',
            12: 'Loss, Spirituality, Isolation, Foreign Lands'
        };
        return meanings[houseNum] || 'Life Area';
    }

    // Draw all charts after HTML is rendered
    setTimeout(function() {
        chartIds.forEach(function(chartInfo) {
            const canvas = document.getElementById(chartInfo.id);
            if (canvas && typeof window.drawDChart === 'function') {
                try {
                    const customData = {
                        planets: chartInfo.data.planets,
                        asc: chartInfo.data.asc,
                        showAspects: true
                    };
                    window.drawDChart(chartInfo.id, customData);
                } catch(e) {
                    console.error(`Error drawing chart ${chartInfo.id}:`, e);
                }
            }
        });
    }, 100);

    // ============================================================
    // 9. DEEP ASTROLOGICAL TABLES
    // ============================================================
    let navData = null;
    if (window.NAVAMSHA_ANALYSIS && typeof window.NAVAMSHA_ANALYSIS.calculate === 'function') {
        try {
            navData = window.NAVAMSHA_ANALYSIS.calculate(planets, ascendant);
        } catch(e) {
            console.warn("Navamsha analysis error:", e);
        }
    }
    
    html += `<div class="pred-item" style="border-left: 3px solid #ff4757; margin-top:20px;">
        <div class="pred-title" style="color:#ff4757; font-size:14px; text-align:center;">📊 Deep Astrological Tables</div>
        <div style="display:grid; grid-template-columns:1fr; gap:15px; margin-top:10px;">
    `;

    // A. Planets Nakshatra, Degree & Vish Navamsha
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">✨ Nakshatra, Degrees & Vish Status</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">Degree</th>
                <th style="padding:4px;">Nakshatra (Pada)</th>
                <th style="padding:4px;">Lord</th>
                <th style="padding:4px;">Vish Navamsha?</th>
            </tr>
    `;
    planetListRot.forEach(p => {
        if(planets[p]) {
            let lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
            let degStr = (lon % 30).toFixed(2) + "°";
            let nakInfoLocal = (typeof window.determineNakshatra === 'function') ? window.determineNakshatra(lon) : {name:'-', pada:'-', lord:'-'};
            
            let isVish = '-';
            if (navData && navData.vishPlanets) {
                let vp = navData.vishPlanets.find(v => v.name === p);
                if (vp) isVish = `<span style="color:#ff4757;font-weight:bold;">Yes${vp.sunHora ? ' (Sun Hora)' : ''}</span>`;
            }
            
            html += `<tr><td style="padding:4px;">${p}</td><td style="padding:4px; font-family:monospace;">${degStr}</td><td style="padding:4px;">${nakInfoLocal.name} (${nakInfoLocal.pada})</td><td style="padding:4px;">${nakInfoLocal.lord}</td><td style="padding:4px;">${isVish}</td></tr>`;
        }
    });
    html += `</table></div>`;

    // B. Varga Chart Positions
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">📜 Divisional (Varga) Chart Positions</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">D1 (Rashi)</th>
                <th style="padding:4px;">D9 (Navamsa)</th>
                <th style="padding:4px;">D10 (Dasamsa)</th>
            </tr>
    `;
    planetListRot.forEach(p => {
        if(planets[p] && typeof window.getVargaData === 'function') {
            let lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
            
            let d1 = SIGNS[window.getVargaData(lon, 1).sign];
            let d9 = SIGNS[window.getVargaData(lon, 9).sign];
            let d10 = SIGNS[window.getVargaData(lon, 10).sign];
            
            html += `<tr><td style="padding:4px;">${p}</td><td style="padding:4px;">${d1}</td><td style="padding:4px;">${d9}</td><td style="padding:4px;">${d10}</td></tr>`;
        }
    });
    html += `</table></div>`;

    // C. Planetary Friendship & Shadbala
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">⚔️ Planetary Friendships (Five-Fold)</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">Friends</th>
                <th style="padding:4px;">Enemies</th>
            </tr>
    `;

    let gmData = null;
    if (window.GRAHA_MAITRI && typeof window.GRAHA_MAITRI.calculateRelationships === "function") {
        try {
            gmData = window.GRAHA_MAITRI.calculateRelationships(planets);
        } catch(e) {
            console.warn("Graha Maitri error:", e);
        }
    }
    
    planetListRot.forEach(p => {
        if(planets[p]) {
            let fList = [];
            let eList = [];
            if (gmData && gmData[p]) {
                Object.keys(gmData[p]).forEach(p2 => {
                    let st = gmData[p][p2].fiveFold;
                    if (st === 'Intimate' || st === 'Friend') fList.push(p2);
                    else if (st === 'Enemy' || st === 'Bitter') eList.push(p2);
                });
            }
            let fr = fList.length > 0 ? fList.join(', ') : '-';
            let en = eList.length > 0 ? eList.join(', ') : '-';
            
            html += `<tr><td style="padding:4px; font-weight:bold;">${p}</td><td style="padding:4px; color:#2ed573;">${fr}</td><td style="padding:4px; color:#ff4757;">${en}</td></tr>`;
        }
    });
    html += `</table></div></div></div>`; 

    // ============================================================
    // 10. NAVAMSHA (D9) & KHAR (POISONOUS) ANALYSIS
    // ============================================================
    if (navData) {
        html += `<div class="pred-item" style="border-left: 3px solid #ff9f43; margin-top:20px;">
            <div class="pred-title" style="color:#ff9f43; font-size:14px; text-align:center;">🔬 Deep Navamsha & Khar Analysis</div>
            <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Jaimini Karakas, 64th Navamsha, 22nd Drekkana, and Poisonous Navamshas</div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <!-- Jaimini Block -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
                    <div style="color:var(--gold); font-size:11px; margin-bottom:6px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">👁 Jaimini Key Indicators</div>
                    <div style="font-size:9.5px; color:var(--text); line-height:1.6;">
                        <span style="color:var(--cyan)">Atmakaraka (AK):</span> <strong>${navData.AK || 'N/A'}</strong><br/>
                        <span style="color:var(--cyan)">Amatyakaraka (AmK):</span> <strong>${navData.AmK || 'N/A'}</strong><br/>
                        <span style="color:var(--cyan)">Karakamsa Sign:</span> <strong>${navData.KarakamsaSign || 'N/A'}</strong><br/>
                        <span style="color:var(--cyan)">Arudha Lagna (AL):</span> <strong>${navData.ArudhaLagna || 'N/A'}</strong><br/>
                        <span style="color:var(--cyan)">Upapada Lagna (UL):</span> <strong>${navData.UpapadaLagna || 'N/A'}</strong>
                    </div>
                </div>

                <!-- Khar Block -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
                    <div style="color:var(--gold); font-size:11px; margin-bottom:6px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">☠️ Khar (Malefic) Points</div>
                    <div style="font-size:9.5px; color:var(--text); line-height:1.6;">
                        <span style="color:var(--rose)">64th Navamsha Lord (Moon):</span> <strong>${navData.Khar64Lord || 'N/A'}</strong><br/>
                        <span style="color:var(--rose)">64th Navamsha Lord (Asc):</span> <strong>${navData.Khar64Lord_Asc || '-'}</strong><br/>
                        <span style="color:var(--rose)">22nd Drekkana Lord:</span> <strong>${navData.Khar22Lord || 'N/A'}</strong><br/>
                        <span style="color:var(--rose)">Double Khar Planet:</span> <strong>${navData.DoubleKhar || '-'}</strong>
                    </div>
                </div>
            </div>`;
            
        if (navData.Khar64_AllBodies) {
             html += `<div style="background:rgba(255,99,71,0.05); border:1px solid rgba(255,99,71,0.2); border-radius:8px; padding:10px; margin-top:10px; overflow-x:auto;">
                 <div style="color:#ff6b6b; font-size:12px; margin-bottom:8px; font-weight:bold; text-align:center;">🎯 64th Navamsha Step-by-Step Positions</div>
                 <div style="font-size:9px; color:var(--muted); text-align:center; margin-bottom:8px;">8th House from Rasi and 4th from Natal D9 (+210 Degrees). Check Transit Planets crossing these exact degrees.</div>
                 <table style="width:100%; font-size:9.5px; color:var(--text); text-align:left; border-collapse: collapse;">
                     <tr style="color:var(--cyan); border-bottom:1px solid rgba(255,99,71,0.2);">
                         <th style="padding:4px;">Planet/Point</th>
                         <th style="padding:4px;">Navamsa Span</th>
                         <th style="padding:4px;">In 8th Rasi</th>
                         <th style="padding:4px;">Exact 210° Point</th>
                         <th style="padding:4px;">Span Degrees</th>
                         <th style="padding:4px;">Lord</th>
                      </tr>`;
             
             navData.Khar64_AllBodies.forEach(b => {
                 let rasiName = SIGNS[b.rasi64];
                 let navName = SIGNS[b.navamsa64Sign];
                 html += `<tr>
                     <td style="padding:4px; font-weight:bold;">${b.name || 'Unknown'}</td>
                     <td style="padding:4px;">${navName}</td>
                     <td style="padding:4px;">${rasiName}</td>
                     <td style="padding:4px; color:#ff4757; font-weight:bold;">${b.pointLon?.toFixed(4) || 'N/A'}°</td>
                     <td style="padding:4px; font-family:monospace; color:var(--gold2);">${b.startDeg?.toFixed(4) || '0'}° - ${b.endDeg?.toFixed(4) || '0'}°</td>
                     <td style="padding:4px;">${b.navamsa64Lord || 'N/A'}</td>
                  </tr>`;
             });
             html += `</table></div>`;
        }

        // Vish Block
        html += `<div style="background:rgba(255,99,71,0.05); border:1px solid rgba(255,99,71,0.2); border-radius:8px; padding:10px; margin-top:10px;">
            <div style="color:#ff6b6b; font-size:12px; margin-bottom:8px; font-weight:bold; text-align:center;">🐍 Vish (Poisonous) Navamsha Alerts</div>`;
        
        if (navData.vishPlanets && navData.vishPlanets.length > 0) {
            navData.vishPlanets.forEach(vp => {
                const horaTag = vp.sunHora ? `<span style="color:red; font-size:8px; border:1px solid red; padding:1px 3px; border-radius:3px; margin-left:5px;">SUN HORA (Intense)</span>` : '';
                html += `<div style="font-size:10px; color:var(--text); margin-bottom:6px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:4px;">
                    <strong style="color:#ff6b6b;">${vp.name}</strong> ${horaTag}<br/>
                    <span style="color:#ffa0a0; font-style:italic;">Effect:</span> ${vp.effect || 'Unknown effect'}
                </div>`;
            });
        } else {
            html += `<div style="font-size:10px; color:var(--muted); text-align:center; padding:10px;">No planets are positioned in a Vish Navamsha. Your chart is clear of this specific deep struggle.</div>`;
        }
        
        html += `</div></div>`;
    }

    // ============================================================
    // 11. DYNAMIC ANALYTICAL BLUEPRINT (10th House Matrix)
    // ============================================================
    html += `<div class="pred-item" style="border-left: 3px solid #00cec9; margin-top:20px;">
        <div class="pred-title" style="color:#00cec9; font-size:14px; text-align:center;">⚡ Dynamic Analytical Blueprint</div>
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">10th House Matrix for Advanced Life Path Tracking</div>
    `;

    const LORDS_MATRIX = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) 
        ? window.ASTRO_CONSTANTS.SIGN_LORDS 
        : {0:'Mars',1:'Venus',2:'Mercury',3:'Moon',4:'Sun',5:'Mercury',6:'Venus',7:'Mars',8:'Jupiter',9:'Saturn',10:'Saturn',11:'Jupiter'};
    
    let natalAscSignForMatrix = Math.floor( (ascendant.sid !== undefined ? ascendant.sid : ascendant.longitude) / 30 );
    let h10SignNum = (natalAscSignForMatrix + 9) % 12;
    let h10LordName = LORDS_MATRIX[h10SignNum];

    let h10LordPlanet = planets[h10LordName];
    let dispositorName = '-';
    let d9DispositorName = '-';
    
    if (h10LordPlanet) {
        let lon = h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude;
        let d1Sign = Math.floor(lon / 30);
        dispositorName = LORDS_MATRIX[d1Sign];

        if (typeof window.getVargaData === 'function') {
            try {
                let d9Sign = window.getVargaData(lon, 9).sign;
                d9DispositorName = LORDS_MATRIX[d9Sign];
            } catch(e) {}
        }
    }

    let sunPos = planets.Sun ? Math.floor((planets.Sun.sid !== undefined ? planets.Sun.sid : planets.Sun.longitude) / 30) : 0;
    let moonPos = planets.Moon ? Math.floor((planets.Moon.sid !== undefined ? planets.Moon.sid : planets.Moon.longitude) / 30) : 0;
    
    let fromSun = h10LordPlanet ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - sunPos + 12) % 12) + 1) : '-';
    let fromMoon = h10LordPlanet ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - moonPos + 12) % 12) + 1) : '-';
    
    let navDataReference = (window.NAVAMSHA_ANALYSIS && typeof window.NAVAMSHA_ANALYSIS.calculate === 'function') ? window.NAVAMSHA_ANALYSIS.calculate(planets, ascendant) : null;
    let kSignName = navDataReference?.KarakamsaSign;
    let aSignName = navDataReference?.ArudhaLagna;
    let kPos = SIGNS.indexOf(kSignName);
    let aPos = SIGNS.indexOf(aSignName);
    
    let fromKarakamsa = (h10LordPlanet && kPos !== -1) ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - kPos + 12) % 12) + 1) : '-';
    let fromArudha = (h10LordPlanet && aPos !== -1) ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - aPos + 12) % 12) + 1) : '-';

    let conj = [];
    if (h10LordPlanet) {
        let targetSign = Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude) / 30);
        planetListRot.forEach(p => {
            if (p !== h10LordName && planets[p]) {
                if (Math.floor((planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude)/30) === targetSign) {
                    conj.push(p);
                }
            }
        });
    }

    let aspects = [];
    planetListRot.forEach(p => {
        if (p !== h10LordName && planets[p]) {
            let pSignNum = Math.floor((planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude) / 30);
            let dist = ((h10SignNum - pSignNum + 12) % 12) + 1;
            
            let castsAspect = false;
            if (dist === 7) castsAspect = true;
            if ((p === 'Jupiter' || p === 'Rahu' || p === 'Ketu') && (dist === 5 || dist === 9)) castsAspect = true;
            if (p === 'Mars' && (dist === 4 || dist === 8)) castsAspect = true;
            if (p === 'Saturn' && (dist === 3 || dist === 10)) castsAspect = true;
            
            if (castsAspect) {
                aspects.push(p);
            }
        }
    });

    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px;">
        <div style="color:var(--gold); font-size:11px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">🏛 10th House Matrix (Career & Action)</div>
        
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; font-size:9.5px; margin-bottom:12px;">
            <div style="background:rgba(0,0,0,0.2); padding:6px; text-align:center; border-radius:4px;">
                <span style="color:var(--muted)">10th Lord</span><br/><strong>${h10LordName}</strong>
            </div>
            <div style="background:rgba(0,0,0,0.2); padding:6px; text-align:center; border-radius:4px;">
                <span style="color:var(--muted)">Dispositor (D1)</span><br/><strong>${dispositorName}</strong>
            </div>
            <div style="background:rgba(0,0,0,0.2); padding:6px; text-align:center; border-radius:4px;">
                <span style="color:var(--muted)">Dispositor (D9)</span><br/><strong>${d9DispositorName}</strong>
            </div>
        </div>

        <table style="width:100%; font-size:9.5px; color:var(--text); text-align:left; border-collapse: collapse; margin-bottom:12px;">
            <tr style="color:var(--cyan); border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:4px;">10th Lord Perspective</th>
                <th style="padding:4px;">Relative House</th>
            </tr>
            <tr><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Sun</td><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2);">H${fromSun}</td></tr>
            <tr><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Moon</td><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2);">H${fromMoon}</td></tr>
            <tr><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Karakamsa</td><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2);">H${fromKarakamsa}</td></tr>
            <tr><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Arudha Lagna</td><td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2);">H${fromArudha}</td></tr>
        </table>

        <div style="font-size:9.5px; margin-bottom:4px;">
            <span style="color:var(--violet); font-weight:bold;">⭐ Conjunctions with 10th Lord:</span> ${conj.length > 0 ? conj.join(', ') : '<span style="color:var(--muted)">None</span>'}
        </div>
        <div style="font-size:9.5px;">
            <span style="color:var(--violet); font-weight:bold;">👁 Aspects (Drishti) on 10th House:</span> ${aspects.length > 0 ? aspects.join(', ') : '<span style="color:var(--muted)">None</span>'}
        </div>
    </div>`;

    html += `</div>`;

    // ============================================================
    // 12. JAIMINI ANALYSIS — KARAKAS, ARGALA & VIPRIT ARGALA
    // ============================================================
    html += buildJaiminiSection(planets, ascSn, SIGNS, LORDS);

    return html;
  }
};

// ==============================================================
// JAIMINI ANALYSIS ENGINE (Append to step2step_panchang.js)
// ==============================================================
function buildJaiminiSection(planets, ascSn, SIGNS, LORDS) {
  const pList = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  const malefics = ['Sun','Mars','Saturn','Rahu','Ketu'];

  // ── Chara Karakas (by degree within sign, ignoring sign number) ──
  function getCharaKarakas(planetData) {
    const scored = pList
      .filter(p => planetData[p])
      .map(p => {
        const lon = planetData[p].sid !== undefined ? planetData[p].sid : planetData[p].longitude;
        const degInSign = lon % 30;
        return { name: p, deg: degInSign };
      })
      .sort((a, b) => b.deg - a.deg);

    const karakaNames = ['AK (Atma)', 'AmK (Amatya)', 'BK (Bhratri)', 'MK (Matri)', 'PK (Putra)', 'GK (Gnati)', 'DK (Dara)'];
    return scored.map((p, i) => ({ planet: p.name, deg: p.deg.toFixed(2), role: karakaNames[i] || '—' }));
  }

  // ── Argala: houses 2, 4, 5, 11 give Argala to any reference house ──
  // Obstruction (Virodha): 12, 10, 9, 3 respectively
  const ARGALA_OFFSETS    = [2, 4, 5, 11];  // from ref house (1-based offset, so +1,+3,+4,+10)
  const VIRODHA_OFFSETS   = [12, 10, 9, 3]; // corresponding blockers

  function getPlanetsInSign(planetData, signIdx) {
    const all = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
    return all.filter(p => {
      const pd = planetData[p];
      if (!pd) return false;
      const lon = pd.sid !== undefined ? pd.sid : pd.longitude;
      return Math.floor(lon / 30) === signIdx;
    });
  }

  // Degree quarter for Virodha cancellation (0-7.5, 7.5-15, 15-22.5, 22.5-30)
  function getDegQuarter(lon) {
    const d = lon % 30;
    if (d < 7.5) return 1;
    if (d < 15)  return 2;
    if (d < 22.5) return 3;
    return 4;
  }

  // Argala strength: 1=basic, 2=+ Jaimini aspect, 3=+ lord of ref house
  function getArgalaStrength(argalaPlanet, refSignIdx, planetData, lords) {
    let score = 1; // basic argala
    const pLon = planetData[argalaPlanet] ? (planetData[argalaPlanet].sid || planetData[argalaPlanet].longitude) : -1;
    if (pLon < 0) return score;
    const pSignIdx = Math.floor(pLon / 30);

    // Check Jaimini aspect (sign-based: from sign A, aspects signs 7, 5&9 for movable, 4&10 for dual, all odd for fixed)
    const pSignType = getSignType(pSignIdx);
    const dist = ((refSignIdx - pSignIdx + 12) % 12) + 1;
    let hasAspect = false;
    if (dist === 7) hasAspect = true; // all signs aspect 7th
    else if (pSignType === 'movable' && (dist === 2 || dist === 6 || dist === 10)) hasAspect = true;
    else if (pSignType === 'fixed' && (dist === 4 || dist === 8)) hasAspect = true;
    else if (pSignType === 'dual' && (dist === 3 || dist === 9)) hasAspect = true;

    if (hasAspect) score++;

    // Check if argala planet is lord of the ref house
    const refLord = lords[refSignIdx];
    if (argalaPlanet === refLord) score++;

    return score;
  }

  function getSignType(sn) {
    if ([0,3,6,9].includes(sn))  return 'movable';
    if ([1,4,7,10].includes(sn)) return 'fixed';
    return 'dual';
  }

  function strengthLabel(s) {
    if (s >= 3) return { label: 'Mahabali (100%)', color: '#00ff88' };
    if (s === 2) return { label: 'Madhyam (66%)',  color: '#ffd700' };
    return          { label: 'Sadharan (33%)',  color: 'var(--muted)' };
  }

  // ── Full Argala calculation for a reference house (by sign index) ──
  function calcArgala(refSignIdx, planetData) {
    const results = [];
    ARGALA_OFFSETS.forEach((offset, i) => {
      const argalaSignIdx = (refSignIdx + offset - 1) % 12;
      const virodhaSignIdx = (refSignIdx + VIRODHA_OFFSETS[i] - 1) % 12;

      const argalaPlanets  = getPlanetsInSign(planetData, argalaSignIdx);
      const virodhaPlanets = getPlanetsInSign(planetData, virodhaSignIdx);

      argalaPlanets.forEach(ap => {
        // Check virodha cancellation (same quarter blocks)
        let blocked = false;
        const apLon = planetData[ap].sid || planetData[ap].longitude;
        const apQ = getDegQuarter(apLon);
        virodhaPlanets.forEach(vp => {
          const vpLon = planetData[vp].sid || planetData[vp].longitude;
          const vpQ = getDegQuarter(vpLon);
          // Cancellation: same quarter or specific cross-quarter rules
          if (Math.abs(apQ - vpQ) <= 1) blocked = true;
        });

        const strength = getArgalaStrength(ap, refSignIdx, planetData, LORDS);
        const sl = strengthLabel(strength);
        results.push({
          planet: ap,
          fromHouse: offset === 2 ? '2nd' : offset === 4 ? '4th' : offset === 5 ? '5th' : '11th',
          argalaSign: SIGNS[argalaSignIdx],
          virodhaSign: SIGNS[virodhaSignIdx],
          virodhaPlanets,
          blocked,
          strength,
          strengthLabel: sl.label,
          strengthColor: sl.color
        });
      });
    });
    return results;
  }

  // ── Viprit Argala: 3+ malefics in same sign ──
  function calcVipritArgala(planetData) {
    const results = [];
    for (let sn = 0; sn < 12; sn++) {
      const occ = getPlanetsInSign(planetData, sn);
      const malInSign = occ.filter(p => malefics.includes(p));
      if (malInSign.length >= 3) {
        const targetSn = (sn + 6) % 12; // 7th from that sign (= 5th from reference perspective in text)
        // Per Jaimini: 3 malefics in a sign give Viprit Argala to sign 5th from them (i.e., +4 houses)
        const vipritSn = (sn + 4) % 12;
        results.push({
          sign: SIGNS[sn],
          signIdx: sn,
          maleficsPresent: malInSign,
          vipritArgalaTo: SIGNS[vipritSn],
          vipritSignIdx: vipritSn,
          uncancellable: true,
          note: 'No Virodha can cancel Viprit Argala per Jaimini'
        });
      }
    }
    return results;
  }

  // ── Build HTML ──
  const karakas = getCharaKarakas(planets);
  const karakaColors = ['#FFD700','#C0C0FF','#FF6B6B','#00D2FF','#FFA500','#66FF66','#FF69B4'];
  const vipritList = calcVipritArgala(planets);

  // Compute Argala for all 12 houses
  const allArgala = [];
  for (let h = 0; h < 12; h++) {
    const refSn = (ascSn + h) % 12;
    const argalasForHouse = calcArgala(refSn, planets);
    allArgala.push({ house: h + 1, sign: SIGNS[refSn], argalas: argalasForHouse });
  }

  // Key houses: 1, 4, 7, 10 (kendra), 5, 9 (trikona), plus any house with viprit argala
  const keyHouses = [1, 4, 7, 9, 10];
  const keyArgala = allArgala.filter(a => keyHouses.includes(a.house) || vipritList.some(v => v.vipritSignIdx === (ascSn + a.house - 1) % 12));

  let html = `<div class="pred-item" style="border-left: 3px solid #e84393; margin-top:20px;">
    <div class="pred-title" style="color:#e84393; font-size:14px; text-align:center;">🔯 Jaimini Analysis: Karakas · Argala · Viprit Argala</div>
    <div style="font-size:9px; color:var(--muted); text-align:center; margin-bottom:15px;">Jaimini Chara Karakas · Planetary Intervention Analysis · Special Rajayoga from Malefics</div>
  `;

  // ─── SECTION A: Chara Karakas ───
  html += `<div style="background:rgba(232,67,147,0.06); border:1px solid rgba(232,67,147,0.25); border-radius:8px; padding:12px; margin-bottom:15px;">
    <div style="color:#e84393; font-size:11px; font-weight:bold; margin-bottom:10px; border-bottom:1px solid rgba(232,67,147,0.2); padding-bottom:4px;">
      🪐 Chara Karakas (Variable Significators)
    </div>
    <div style="font-size:9px; color:var(--muted); margin-bottom:8px;">Ranked by degree within sign (ignoring sign number). Rahu/Ketu excluded unless two planets tie.</div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:8px;">`;

  karakas.forEach((k, i) => {
    const pLon = planets[k.planet] ? (planets[k.planet].sid || planets[k.planet].longitude || 0) : 0;
    const pSn = Math.floor(pLon / 30);
    const pSign = SIGNS[pSn] || '?';
    const pHouse = ((pSn - ascSn + 12) % 12) + 1;
    html += `<div style="background:rgba(0,0,0,0.25); border:1px solid ${karakaColors[i]}44; border-radius:6px; padding:8px; text-align:center;">
      <div style="color:${karakaColors[i]}; font-weight:bold; font-size:11px;">${k.planet}</div>
      <div style="font-size:8px; color:var(--muted); margin:2px 0;">${k.role}</div>
      <div style="font-size:9px;">${pSign} H${pHouse}</div>
      <div style="font-size:8px; color:var(--muted); font-family:monospace;">${k.deg}° in sign</div>
    </div>`;
  });

  html += `</div></div>`;

  // ─── SECTION B: Argala on Key Houses ───
  html += `<div style="background:rgba(0,206,201,0.05); border:1px solid rgba(0,206,201,0.2); border-radius:8px; padding:12px; margin-bottom:15px;">
    <div style="color:#00cec9; font-size:11px; font-weight:bold; margin-bottom:6px; border-bottom:1px solid rgba(0,206,201,0.2); padding-bottom:4px;">
      🔗 Argala (Planetary Intervention on Key Houses)
    </div>
    <div style="font-size:9px; color:var(--muted); margin-bottom:10px;">
      Argala sources: <strong style="color:var(--text);">2nd, 4th, 5th, 11th</strong> house from reference. 
      Blocked by planets in <strong style="color:var(--text);">12th, 10th, 9th, 3rd</strong> respectively (same degree-quarter rule).
      Strength: 33% = Argala only · 66% = + Jaimini aspect · 100% = + House lord.
    </div>`;

  keyArgala.forEach(ha => {
    const activeArgalas = ha.argalas.filter(a => !a.blocked);
    const blockedArgalas = ha.argalas.filter(a => a.blocked);
    if (ha.argalas.length === 0) {
      html += `<div style="margin-bottom:10px; padding:8px; background:rgba(255,255,255,0.02); border-radius:6px; border-left:2px solid rgba(255,255,255,0.1);">
        <span style="color:var(--gold); font-weight:bold;">H${ha.house} — ${ha.sign}:</span>
        <span style="color:var(--muted); font-size:9px; margin-left:8px;">No planets provide Argala to this house.</span>
      </div>`;
      return;
    }
    html += `<div style="margin-bottom:12px; padding:8px; background:rgba(255,255,255,0.02); border-radius:6px; border-left:2px solid var(--cyan);">
      <div style="color:var(--gold); font-weight:bold; font-size:10px; margin-bottom:6px;">H${ha.house} — ${ha.sign}</div>`;

    if (activeArgalas.length > 0) {
      html += `<div style="font-size:9px; margin-bottom:4px; color:#00d2ff;">Active Argala:</div>`;
      activeArgalas.forEach(a => {
        html += `<div style="font-size:9px; padding:3px 0; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05);">
          <span><strong style="color:var(--text);">${a.planet}</strong> from ${a.fromHouse} (${a.argalaSign})</span>
          <span style="color:${a.strengthColor}; font-weight:bold;">${a.strengthLabel}</span>
        </div>`;
      });
    }
    if (blockedArgalas.length > 0) {
      html += `<div style="font-size:9px; margin-top:6px; margin-bottom:4px; color:var(--rose);">Blocked by Virodha:</div>`;
      blockedArgalas.forEach(a => {
        html += `<div style="font-size:9px; color:rgba(255,100,100,0.6); padding:2px 0;">
          <span style="text-decoration:line-through;">${a.planet}</span> (${a.argalaSign}) — blocked by ${a.virodhaPlanets.join(', ')||'—'} in ${a.virodhaSign}
        </div>`;
      });
    }
    html += `</div>`;
  });

  html += `</div>`;

  // ─── SECTION C: Viprit Argala ───
  html += `<div style="background:rgba(255,165,0,0.05); border:1px solid rgba(255,165,0,0.25); border-radius:8px; padding:12px; margin-bottom:15px;">
    <div style="color:#ffa500; font-size:11px; font-weight:bold; margin-bottom:6px; border-bottom:1px solid rgba(255,165,0,0.2); padding-bottom:4px;">
      🔥 Viprit Argala (Reverse / Special Rajayoga Intervention)
    </div>
    <div style="font-size:9px; color:var(--muted); margin-bottom:8px;">
      When <strong style="color:var(--text);">3 or more malefics</strong> (Sun, Mars, Saturn, Rahu, Ketu) occupy any sign together, they grant 
      Viprit Argala to the sign <strong style="color:var(--text);">5th from them</strong>. This Argala <strong style="color:#ffa500;">cannot be cancelled</strong> by any Virodha.
      It strongly empowers the receiving house/sign's significations.
    </div>`;

  if (vipritList.length === 0) {
    html += `<div style="font-size:10px; color:var(--muted); text-align:center; padding:10px; border:1px dashed rgba(255,255,255,0.1); border-radius:6px;">
      No Viprit Argala detected. Three or more malefics are not concentrated in any single sign.
    </div>`;
  } else {
    vipritList.forEach(v => {
      const receivingHouse = ((v.vipritSignIdx - ascSn + 12) % 12) + 1;
      const sourceHouse    = ((v.signIdx - ascSn + 12) % 12) + 1;
      html += `<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.3); border-radius:8px; padding:10px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <span style="color:#ffa500; font-weight:bold; font-size:11px;">H${sourceHouse} — ${v.sign}</span>
            <span style="font-size:9px; color:var(--muted); margin-left:8px;">→ Viprit Argala →</span>
            <span style="color:#00ff88; font-weight:bold; font-size:11px; margin-left:8px;">H${receivingHouse} — ${v.vipritArgalaTo}</span>
          </div>
          <span style="background:#ffa500; color:#000; font-size:8px; padding:2px 6px; border-radius:3px; font-weight:bold;">UNCANCELLABLE</span>
        </div>
        <div style="font-size:9px; margin-bottom:6px;">
          <span style="color:var(--rose); font-weight:bold;">Malefics in ${v.sign}:</span>
          ${v.maleficsPresent.map(p => `<span style="background:rgba(255,70,70,0.15); border:1px solid rgba(255,70,70,0.3); border-radius:3px; padding:1px 5px; margin:0 2px; color:#ff6b6b;">${p}</span>`).join('')}
        </div>
        <div style="font-size:9px; color:var(--muted);">${v.note}</div>
        <div style="margin-top:8px; font-size:9px; background:rgba(0,255,136,0.05); border:1px solid rgba(0,255,136,0.15); border-radius:4px; padding:6px; color:var(--text);">
          💡 H${receivingHouse} (${v.vipritArgalaTo}) is powerfully fortified. Significations of this house — 
          <em style="color:var(--gold2);">${getHouseKeywords(receivingHouse)}</em> — receive special karmic activation. 
          Check dasha of planets connected to H${receivingHouse} for timing.
        </div>
      </div>`;
    });
  }

  html += `</div>`;

  // ─── SECTION D: Argala Summary Table ───
  html += `<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px;">
    <div style="color:var(--violet); font-size:11px; font-weight:bold; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">
      📊 All Houses — Argala Summary
    </div>
    <table style="width:100%; font-size:9px; border-collapse:collapse;">
      <tr style="color:var(--muted); border-bottom:1px solid rgba(255,255,255,0.1);">
        <th style="padding:4px; text-align:left;">House</th>
        <th style="padding:4px; text-align:left;">Sign</th>
        <th style="padding:4px; text-align:left;">Active Argala Planets</th>
        <th style="padding:4px; text-align:left;">Viprit</th>
      </tr>`;

  allArgala.forEach(ha => {
    const active = ha.argalas.filter(a => !a.blocked);
    const hasViprit = vipritList.some(v => v.vipritSignIdx === (ascSn + ha.house - 1) % 12);
    const topStrength = active.length > 0 ? Math.max(...active.map(a => a.strength)) : 0;
    const rowColor = topStrength >= 3 ? 'rgba(0,255,136,0.05)' : topStrength === 2 ? 'rgba(255,215,0,0.04)' : 'transparent';
    html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.04); background:${rowColor};">
      <td style="padding:4px; color:var(--gold2); font-weight:bold;">H${ha.house}</td>
      <td style="padding:4px;">${ha.sign}</td>
      <td style="padding:4px;">${active.length > 0
        ? active.map(a => `<span style="color:${a.strengthColor};">${a.planet}</span>`).join(', ')
        : '<span style="color:rgba(255,255,255,0.2);">—</span>'}</td>
      <td style="padding:4px; color:#ffa500; font-weight:bold;">${hasViprit ? '✔ Yes' : ''}</td>
    </tr>`;
  });

  html += `<table></div></div>`;

  return html;
}

function getHouseKeywords(h) {
  const kw = {
    1:'Self, health, personality, longevity',
    2:'Wealth, family, speech, food',
    3:'Courage, siblings, communication, short travel',
    4:'Home, mother, happiness, vehicles, property',
    5:'Children, intelligence, creativity, speculation',
    6:'Enemies, debts, health, service, legal matters',
    7:'Marriage, partner, business, public relations',
    8:'Longevity, occult, transformation, inheritance',
    9:'Luck, father, dharma, higher learning, travel',
    10:'Career, status, authority, reputation',
    11:'Gains, income, friends, aspirations',
    12:'Losses, spirituality, foreign lands, moksha'
  };
  return kw[h] || 'Life significations';
}