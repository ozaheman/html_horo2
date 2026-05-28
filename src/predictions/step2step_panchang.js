/**
 * Step by Step Panchang & Rotated Kundalis Prediction Module
 */

window.STEP2STEP_PANCHANG = {
  analyze: function(planets, ascendant, houses, birthDate, birthConfig) {
    if(!planets || !planets.Sun || !planets.Moon) return "Planetary data missing.";
    
    // 1. Calculate Birth / Panchang Details
    const bCtx = birthConfig || {};
    const dateStr = bCtx.date ? bCtx.date.toISOString().split('T')[0] : "Unknown";
    const timeStr = bCtx.time || "Unknown";
    const dayStr = bCtx.date ? bCtx.date.toLocaleDateString('en-US', {weekday: 'long'}) : "Unknown";
    const latStr = bCtx.lat !== undefined ? bCtx.lat.toFixed(4) : "Unknown";
    const lonStr = bCtx.lon !== undefined ? bCtx.lon.toFixed(4) : "Unknown";
    const tzStr = bCtx.utcOff !== undefined ? (bCtx.utcOff >= 0 ? "+"+bCtx.utcOff : bCtx.utcOff) : "Unknown";
    const cityStr = bCtx.city || "Unknown";
    const ayanStr = bCtx.ayan || "lahiri";

    // Panchang basic
    const moonLon = planets.Moon.sid !== undefined ? planets.Moon.sid : planets.Moon.longitude;
    const sunLon = planets.Sun.sid !== undefined ? planets.Sun.sid : planets.Sun.longitude;
    
    const elong = (moonLon - sunLon + 360) % 360;
    const tithiNum = Math.floor(elong / 12) + 1;
    const tithiPhase = tithiNum <= 15 ? 'Shukla' : 'Krishna';
    const tithiStr = `${tithiPhase} - ${tithiNum <= 15 ? tithiNum : tithiNum - 15}`;

    const yelong = (moonLon + sunLon) % 360;
    const yogaZeroIndexed = Math.floor(yelong / (13 + 1/3)); 
    const yogaNum = yogaZeroIndexed + 1; // 1-indexed for the DB
    const P_YOGAS = ["Vishkumbha","Preeti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shoola","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
    const yogaStr = P_YOGAS[yogaZeroIndexed] || "Unknown";

    const karanNum = Math.floor(elong / 6) + 1;
    const P_KARANAS = ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti","Shakuni","Chatushpada","Naga","Kintughna"];
    // Mapped karana simplistic
    let karanStr = P_KARANAS[(karanNum-1)%7] || "Unknown";
    if(karanNum === 1) karanStr = "Kintughna";
    if(karanNum >= 58 && karanNum <= 60) {
      if(karanNum === 58) karanStr = "Shakuni";
      else if(karanNum === 59) karanStr = "Chatushpada";
      else karanStr = "Naga";
    }

    const nakInfo = window.getNakshatra ? window.getNakshatra(moonLon) : { name: 'Unknown', pada: 1 };

    const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const moonSign = SIGNS[Math.floor(moonLon/30)];
    const sunSign = SIGNS[Math.floor((planets.Sun.longitude)/30)] || "Unknown"; // Western sun sign approximated via sayana lon
    
    // Attempt Shadbala string
    let sbHtml = "";
    if (window.SHADBALA && typeof window.SHADBALA.calculateAll === "function") {
      const sb = window.SHADBALA.calculateAll(planets, ascendant.longitude);
      sbHtml = `<div style="font-size:10px; color:var(--text); margin-top:10px;">
        <strong style="color:var(--cyan);">Basic Strength (Shadbala Proxy View):</strong><br>`;
      Object.keys(sb).forEach(p => {
        sbHtml += `<span style="display:inline-block; margin-right:10px;">${p}: ${Math.floor(sb[p].totalRupas)} Rupas</span> `;
      });
      sbHtml += "</div>";
    }

    let html = `
      <div class="pred-item" style="border-left: 3px solid var(--gold); border-top: 1px solid var(--border);">
        <div class="pred-title" style="color:var(--gold); font-size:14px; text-align:center;">Birth & Panchang Details</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; font-size:10.5px; color:var(--text); line-height:1.4;">
          <div><strong style="color:var(--muted)">Date of Birth:</strong> ${dateStr}</div>
          <div><strong style="color:var(--muted)">Day of Birth:</strong> ${dayStr}</div>
          <div><strong style="color:var(--muted)">Time of Birth:</strong> ${timeStr}</div>
          <div><strong style="color:var(--muted)">City:</strong> ${cityStr}</div>
          <div><strong style="color:var(--muted)">Coordinates:</strong> ${latStr} N, ${lonStr} E</div>
          <div><strong style="color:var(--muted)">Time Zone:</strong> ${tzStr}</div>
          <div><strong style="color:var(--muted)">Ayanamsa:</strong> ${ayanStr}</div>
          <div><strong style="color:var(--muted)">Moon Sign (Rasi):</strong> ${moonSign}</div>
          <div><strong style="color:var(--muted)">Sun Sign (Western):</strong> ${sunSign}</div>
          <div><strong style="color:var(--muted)">Tithi:</strong> ${tithiStr}</div>
          <div><strong style="color:var(--muted)">Nakshatra:</strong> ${nakInfo.name} (${nakInfo.pada})</div>
          <div><strong style="color:var(--muted)">Yoga:</strong> ${yogaStr}</div>
          <div><strong style="color:var(--muted)">Karan:</strong> ${karanStr}</div>
        </div>
        ${sbHtml}
      </div>
    `;

    // ─────────────────────────────────────────────────────────────────
    // PANCHANG PREDICTIONS SECTION
    // ─────────────────────────────────────────────────────────────────
    if (window.AP_PREDICTION_DAY && window.AP_PREDICTION_TITHI && window.AP_PREDICTION_YOGA) {
      
      let dayKey = bCtx.date ? bCtx.date.getDay() : null;
      if (dayKey === null && window.BIRTH && window.BIRTH.date) dayKey = window.BIRTH.date.getDay(); 
      if (dayKey === null) dayKey = dayStr.split(',')[0].toLowerCase(); // Fallback string

      const dayPred = window.AP_PREDICTION_DAY.get(dayKey);
      const tithiPred = window.AP_PREDICTION_TITHI.get(tithiNum);
      const yogaPred = window.AP_PREDICTION_YOGA.get(yogaNum);

      html += `<div class="pred-item" style="border-left: 3px solid var(--violet); margin-top:20px;">
        <div class="pred-title" style="color:var(--violet); font-size:14px; text-align:center; margin-bottom:10px;">Panchang Deep Personality Predictions</div>
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Insights derived from traditional text references based on Day, Tithi, and Yoga.</div>
        
        <div style="display:grid; grid-template-columns:1fr; gap:15px;">`;

      if (dayPred) {
        html += `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px;">
            <div style="color:var(--gold); font-size:12px; margin-bottom:6px; font-weight:bold;">✨ Day of Birth: ${dayPred.name_en} / ${dayPred.name_hi}</div>
            <div style="font-size:10.5px; color:var(--cyan); margin-bottom:6px;"><strong>Lord:</strong> ${dayPred.lord_en} | <strong>Lucky Colors:</strong> ${dayPred.lucky_color_en}</div>
            <div style="font-size:11px; color:var(--text); line-height:1.5; margin-bottom:8px;">${dayPred.prediction_en}</div>
            <div style="font-size:10px; color:var(--text); font-style:italic; line-height:1.5; opacity:0.8; margin-bottom:8px;"><strong>हिंदी में:</strong> ${dayPred.prediction_hi}</div>
            <div style="font-size:9.5px; color:var(--gold2); border-top:1px dashed var(--border2); padding-top:6px;"><strong>Remedy:</strong> ${dayPred.remedy_en}</div>
          </div>`;
      }

      if (tithiPred) {
        html += `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px;">
            <div style="color:var(--gold); font-size:12px; margin-bottom:6px; font-weight:bold;">🌙 Tithi: ${tithiPred.name_en} / ${tithiPred.name_hi} (${tithiPhase})</div>
            <div style="font-size:10.5px; color:var(--cyan); margin-bottom:6px;"><strong>Presiding Deity:</strong> ${tithiPred.devata_en}</div>
            <div style="font-size:11px; color:var(--text); line-height:1.5; margin-bottom:8px;">${tithiPred.prediction_en}</div>
            <div style="font-size:10px; color:var(--text); font-style:italic; line-height:1.5; opacity:0.8; margin-bottom:8px;"><strong>हिंदी में:</strong> ${tithiPred.prediction_hi}</div>
            <div style="font-size:9.5px; color:var(--gold2); border-top:1px dashed var(--border2); padding-top:6px;"><strong>Remedy:</strong> ${tithiPred.remedy_en}</div>
          </div>`;
      }

      if (yogaPred) {
        html += `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px;">
            <div style="color:var(--gold); font-size:12px; margin-bottom:6px; font-weight:bold;">🧘 Yoga: ${yogaPred.name_en} / ${yogaPred.name_hi}</div>
            <div style="font-size:10.5px; color:var(--cyan); margin-bottom:6px; line-height:1.5;">
              <strong>Presiding Deity:</strong> ${yogaPred.devata_en} | <strong>Kind:</strong> ${yogaPred.kind || 'N/A'}<br/>
              <strong>Meaning:</strong> ${yogaPred.meaning || 'N/A'}<br/>
              <strong>Moon Akshar:</strong> ${yogaPred.moon_rashi_akshar || 'N/A'} | <strong>Favored Ascendants:</strong> ${yogaPred.ascendent_signs || 'N/A'}
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:9.5px; color:var(--text); margin-top:10px; padding-top:10px; border-top:1px dashed var(--border2); line-height:1.4;">
              <div><strong style="color:var(--gold2);">1. Life/Personality:</strong> ${yogaPred.house_1_life || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">2. Wealth/Ancestral:</strong> ${yogaPred.house_2_money || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">3. Skills/Siblings:</strong> ${yogaPred.house_3_skills || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">4. Happiness/Vehicles:</strong> ${yogaPred.house_4_happiness || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">5. Education:</strong> ${yogaPred.house_5_education || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">6. Health/Loans:</strong> ${yogaPred.house_6_loans || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">7. Marriage/Partner:</strong> ${yogaPred.house_7_marriage || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">8. Sudden Events:</strong> ${yogaPred.house_8_death || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">9. Luck/Father:</strong> ${yogaPred.house_9_luck || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">10. Profession/Fame:</strong> ${yogaPred.house_10_profession || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">11. Friends/Profit:</strong> ${yogaPred.house_11_friends || 'N/A'}</div>
              <div><strong style="color:var(--gold2);">12. Loss/Isolation:</strong> ${yogaPred.house_12_loss || 'N/A'}</div>
            </div>
          </div>`;
      }

      html += `</div></div>`;
    }

    // 2. Rotated Kundalis (12 Horoscopes)
    html += `<div class="pred-item" style="border-left: 3px solid var(--cyan); margin-top:20px;">
        <div class="pred-title" style="color:var(--cyan); font-size:14px; text-align:center;">12 Horoscopes (Rotated Kundalis)</div>
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Each house is treated as the Lagna sequentially.</div>
    `;

    const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    let planetSigns = {};
    planetList.forEach(p => {
      if(planets[p]) {
        let sid = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
        planetSigns[p] = Math.floor(sid / 30);
      }
    });
    
    let baseAscSign = Math.floor( (ascendant.sid !== undefined ? ascendant.sid : ascendant.longitude) / 30 );
    if (isNaN(baseAscSign)) baseAscSign = 0; // fallback

    for(let i=0; i<12; i++) {
        // Current rotated Ascendant Sign
        let rotAscSignInfo = (baseAscSign + i) % 12;
        let rotAscSignName = SIGNS[rotAscSignInfo];
        
        let customChartData = [];
        customChartData.push({ tx: 'Lg', id: 0, sign: rotAscSignInfo + 1, bhava: 1 });

        // Place Planets
        planetList.forEach(p => {
           if(planetSigns[p] !== undefined) {
               let psign = planetSigns[p];
               // Relative house from rotated asc sign
               let relativeHouse = ((psign - rotAscSignInfo + 12) % 12) + 1;
               
               let shortCode = p.substring(0, 2);
               if (p === 'Jupiter') shortCode = 'Ju';
               if (p === 'Saturn') shortCode = 'Sa';
               if (p === 'Venus') shortCode = 'Ve';
               if (p === 'Mercury') shortCode = 'Me';
               if (p === 'Mars') shortCode = 'Ma';
               
               customChartData.push({ 
                   tx: shortCode, 
                   sign: psign + 1, 
                   bhava: relativeHouse,
                   customColor: 'var(--text)'
               });
           }
        });

        let svgContent = "";
        if (typeof window.Writesvg === 'function') {
            svgContent = window.Writesvg(customChartData, null, false);
        } else {
            svgContent = `<div style="text-align:center; padding:20px; color:red;">SVG Engine Offline</div>`;
        }

        // HTML for this rotated chart
        html += `<div style="background:rgba(0,0,0,0.2); border:1px solid var(--border); border-radius:4px; margin-bottom:15px; padding:10px; display:flex; flex-direction:column; align-items:center; overflow:hidden;">
            <div style="font-size:12px; font-weight:bold; color:var(--gold2); margin-bottom:0px; border-bottom:1px solid var(--border2); padding-bottom:4px; width:100%; text-align:center;">
               Horoscope ${i+1} : ${rotAscSignName} Lagna
            </div>
            <div style="transform: scale(0.85); transform-origin: top center; margin-bottom:-45px;">
                ${svgContent}
            </div>
            <div style="font-size:9.5px; color:var(--cyan); text-align:center; padding:5px; width:100%;">
                Focus on House ${i+1} matters from natal chart.
            </div>
        </div>`;
    }

    html += `</div>`; // End 12 Horoscopes

    // 3. Deep Astrological Tables
    html += `<div class="pred-item" style="border-left: 3px solid #ff4757; margin-top:20px;">
        <div class="pred-title" style="color:#ff4757; font-size:14px; text-align:center;">Deep Astrological Tables</div>
        <div style="display:grid; grid-template-columns:1fr; gap:15px; margin-top:10px;">
    `;

    // A. Planets Nakshatra Chart
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">✨ Nakshatra & Pada Chart</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">Nakshatra</th>
                <th style="padding:4px;">Pada</th>
                <th style="padding:4px;">Lord</th>
            </tr>
    `;
    planetList.forEach(p => {
        if(planets[p]) {
            let lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
            let nakInfo = (typeof window.determineNakshatra === 'function') ? window.determineNakshatra(lon) : {name:'-', pada:'-', lord:'-'};
            html += `<tr><td style="padding:4px;">${p}</td><td style="padding:4px;">${nakInfo.name}</td><td style="padding:4px;">${nakInfo.pada}</td><td style="padding:4px;">${nakInfo.lord}</td></tr>`;
        }
    });
    html += `</table></div>`;

    // B. Varga Chart Positions
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">📜 Divisional (Varga) Chart Positions</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">D1 (Rashi)</th>
                <th style="padding:4px;">D9 (Navamsa)</th>
                <th style="padding:4px;">D10 (Dasamsa)</th>
            </tr>
    `;
    planetList.forEach(p => {
        if(planets[p] && typeof window.getVargaSign === 'function') {
            let lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
            let signDeg = lon % 30;
            let signNum = Math.floor(lon / 30);
            
            let d1 = SIGNS[(window.getVargaSign(signDeg, signNum, "D1-Rashi") - 1) % 12];
            let d9 = SIGNS[(window.getVargaSign(signDeg, signNum, "D9-Navamsa") - 1) % 12];
            let d10 = SIGNS[(window.getVargaSign(signDeg, signNum, "D10-Dasamsa") - 1) % 12];
            
            html += `<tr><td style="padding:4px;">${p}</td><td style="padding:4px;">${d1}</td><td style="padding:4px;">${d9}</td><td style="padding:4px;">${d10}</td></tr>`;
        }
    });
    html += `</table></div>`;

    // C. Planetary Friendship & Shadbala
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">⚔️ Planetary Friendships & Shadbala</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">Shadbala (Rupas)</th>
                <th style="padding:4px;">Natural Friends</th>
                <th style="padding:4px;">Enemies</th>
            </tr>
    `;
    const naturalFriends = {
        'Sun': { f: 'Moon, Mars, Jup', e: 'Ven, Sat' },
        'Moon': { f: 'Sun, Mer', e: 'None' },
        'Mars': { f: 'Sun, Moon, Jup', e: 'Mer' },
        'Mercury': { f: 'Sun, Ven', e: 'Moon' },
        'Jupiter': { f: 'Sun, Moon, Mars', e: 'Mer, Ven' },
        'Venus': { f: 'Mer, Sat', e: 'Sun, Moon' },
        'Saturn': { f: 'Mer, Ven', e: 'Sun, Moon, Mars' },
        'Rahu': { f: 'Jup, Ven, Sat', e: 'Sun, Moon, Mars' },
        'Ketu': { f: 'Mars, Ven, Sat', e: 'Sun, Moon' }
    };
    
    let sbData = null;
    if (window.SHADBALA && typeof window.SHADBALA.calculateAll === "function") {
        sbData = window.SHADBALA.calculateAll(planets, ascendant.longitude);
    }
    
    planetList.forEach(p => {
        if(planets[p]) {
            let sbVal = sbData && sbData[p] ? Math.floor(sbData[p].totalRupas) : 'N/A';
            let fr = naturalFriends[p] ? naturalFriends[p].f : '-';
            let en = naturalFriends[p] ? naturalFriends[p].e : '-';
            html += `<tr><td style="padding:4px; font-weight:bold;">${p}</td><td style="padding:4px;">${sbVal}</td><td style="padding:4px; color:#2ed573;">${fr}</td><td style="padding:4px; color:#ff4757;">${en}</td></tr>`;
        }
    });
    html += `</table></div></div></div>`; // End table and section

    // 4. Navamsha (D9) & Khar (Poisonous) Analysis
    if (window.NAVAMSHA_ANALYSIS && typeof window.NAVAMSHA_ANALYSIS.calculate === 'function') {
        const navData = window.NAVAMSHA_ANALYSIS.calculate(planets, ascendant);
        
        html += `<div class="pred-item" style="border-left: 3px solid #ff9f43; margin-top:20px;">
            <div class="pred-title" style="color:#ff9f43; font-size:14px; text-align:center;">Deep Navamsha & Khar Analysis</div>
            <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Jaimini Karakas, 64th Navamsha, 22nd Drekkana, and Poisonous Navamshas.</div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <!-- Jaimini Block -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px;">
                    <div style="color:var(--gold); font-size:11px; margin-bottom:6px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">👁 Jaimini Key Indicators</div>
                    <div style="font-size:9.5px; color:var(--text); line-height:1.6;">
                        <span style="color:var(--cyan)">Atmakaraka (AK):</span> <strong>${navData.AK}</strong><br/>
                        <span style="color:var(--cyan)">Amatyakaraka (AmK):</span> <strong>${navData.AmK}</strong><br/>
                        <span style="color:var(--cyan)">Karakamsa Sign:</span> <strong>${navData.KarakamsaSign}</strong><br/>
                        <span style="color:var(--cyan)">Arudha Lagna (AL):</span> <strong>${navData.ArudhaLagna}</strong><br/>
                        <span style="color:var(--cyan)">Upapada Lagna (UL):</span> <strong>${navData.UpapadaLagna}</strong>
                    </div>
                </div>

                <!-- Khar Block -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px;">
                    <div style="color:var(--gold); font-size:11px; margin-bottom:6px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">☠️ Khar (Malefic) Points</div>
                    <div style="font-size:9.5px; color:var(--text); line-height:1.6;">
                        <span style="color:var(--rose)">64th Navamsha Lord:</span> <strong>${navData.Khar64Lord}</strong><br/>
                        <span style="color:var(--rose)">22nd Drekkana Lord:</span> <strong>${navData.Khar22Lord}</strong><br/>
                        <span style="color:var(--rose)">Double Khar Planet:</span> <strong>${navData.DoubleKhar}</strong>
                    </div>
                </div>
            </div>`;

        // Vish Block
        html += `<div style="background:rgba(255,99,71,0.05); border:1px solid rgba(255,99,71,0.2); border-radius:6px; padding:10px; margin-top:10px;">
            <div style="color:#ff6b6b; font-size:12px; margin-bottom:8px; font-weight:bold; text-align:center;">🐍 Vish (Poisonous) Navamsha Alerts</div>
        `;
        
        if (navData.vishPlanets && navData.vishPlanets.length > 0) {
            navData.vishPlanets.forEach(vp => {
                const horaTag = vp.sunHora ? `<span style="color:red; font-size:8px; border:1px solid red; padding:1px 3px; border-radius:3px; margin-left:5px;">SUN HORA (Intense)</span>` : '';
                html += `<div style="font-size:10px; color:var(--text); margin-bottom:6px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:4px;">
                    <strong style="color:#ff6b6b;">${vp.name}</strong> ${horaTag}<br/>
                    <span style="color:#ffa0a0; font-style:italic;">Effect:</span> ${vp.effect}
                </div>`;
            });
        } else {
            html += `<div style="font-size:10px; color:var(--muted); text-align:center;">No planets are positioned in a Vish Navamsha. Your chart is clear of this specific deep struggle.</div>`;
        }
        
        html += `</div></div>`; // End Vish block and main Navamsha item
    }

    // 5. Analytical Blueprint: Timeline & House Matrix
    html += `<div class="pred-item" style="border-left: 3px solid #00cec9; margin-top:20px;">
        <div class="pred-title" style="color:#00cec9; font-size:14px; text-align:center;">Dynamic Analytical Blueprint</div>
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">Dasha Timeline & 10th House Matrix for Advanced Life Path Tracking.</div>
    `;

    // 5A. Vimshottari Dasha Timeline
    let dInfo = window.PREDICTION_FORECASTING ? window.PREDICTION_FORECASTING.getCurrentDashaInfo(new Date()) : null;
    if (dInfo && dInfo.mahadasha) {
        html += `<div style="background:rgba(0,0,0,0.2); border:1px solid var(--border2); border-radius:4px; padding:10px; margin-bottom:15px;">
            <div style="color:var(--cyan); font-size:11px; margin-bottom:4px; font-weight:bold;">⏳ Vimshottari Timeline</div>
            <div style="display:flex; justify-content:space-between; font-size:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                <span><strong>Mahadasha (MD):</strong> ${dInfo.mahadasha.lord}</span>
                <span style="color:var(--muted)">${dInfo.daysRemainingInMD ? Math.round(dInfo.daysRemainingInMD) : '?'} days left</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10px; margin-top:5px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                <span><strong>Antardasha (AD):</strong> ${dInfo.antardasha?.lord || '-'}</span>
                <span style="color:var(--muted)">${dInfo.daysRemainingInAD ? Math.round(dInfo.daysRemainingInAD) : '?'} days left</span>
            </div>
            <div style="font-size:10px; margin-top:5px;">
                <strong>Pratyantardasha (PD):</strong> <span style="color:var(--gold);">${dInfo.pratyantar?.lord || '-'}</span>
            </div>
        </div>`;
    }

    // 5B. 10th House Analysis Matrix
    const LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    let h10SignNum = (baseAscSign + 9) % 12;
    let h10LordName = LORDS[h10SignNum];

    let h10LordPlanet = planets[h10LordName];
    let dispositorName = '-';
    let d9DispositorName = '-';
    
    if (h10LordPlanet) {
        let lon = h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude;
        let d1Sign = Math.floor(lon / 30);
        dispositorName = LORDS[d1Sign];

        if (typeof window.getVargaSign === 'function') {
            let d9Sign = window.getVargaSign(lon % 30, d1Sign, "D9-Navamsa") - 1;
            d9DispositorName = LORDS[(d9Sign + 12) % 12];
        }
    }

    let sunPos = planets.Sun ? Math.floor((planets.Sun.sid !== undefined ? planets.Sun.sid : planets.Sun.longitude) / 30) : 0;
    let moonPos = planets.Moon ? Math.floor((planets.Moon.sid !== undefined ? planets.Moon.sid : planets.Moon.longitude) / 30) : 0;
    
    let fromSun = h10LordPlanet ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - sunPos + 12) % 12) + 1) : '-';
    let fromMoon = h10LordPlanet ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - moonPos + 12) % 12) + 1) : '-';
    
    // We already have navData if the block above executed, else we manually compute it or leave it
    let navDataReference = (window.NAVAMSHA_ANALYSIS && typeof window.NAVAMSHA_ANALYSIS.calculate === 'function') ? window.NAVAMSHA_ANALYSIS.calculate(planets, ascendant) : null;
    let kSignName = navDataReference?.KarakamsaSign;
    let aSignName = navDataReference?.ArudhaLagna;
    let kPos = SIGNS.indexOf(kSignName);
    let aPos = SIGNS.indexOf(aSignName);
    
    let fromKarakamsa = (h10LordPlanet && kPos !== -1) ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - kPos + 12) % 12) + 1) : '-';
    let fromArudha = (h10LordPlanet && aPos !== -1) ? (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - aPos + 12) % 12) + 1) : '-';

    let dashaLordName = dInfo?.mahadasha?.lord;
    let fromDasha = '-';
    if (dashaLordName && planets[dashaLordName] && h10LordPlanet) {
        let dlPos = Math.floor((planets[dashaLordName].sid !== undefined ? planets[dashaLordName].sid : planets[dashaLordName].longitude) / 30);
        fromDasha = (((Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude)/30) - dlPos + 12) % 12) + 1);
    }

    let conj = [];
    if (h10LordPlanet) {
        let targetSign = Math.floor((h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude) / 30);
        planetList.forEach(p => {
            if (p !== h10LordName && planets[p]) {
                if (Math.floor((planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude)/30) === targetSign) {
                    conj.push(p);
                }
            }
        });
    }

    let aspects = [];
    planetList.forEach(p => {
        if (p !== h10LordName && planets[p]) {
            let pSignNum = Math.floor((planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude) / 30);
            let dist = ((h10SignNum - pSignNum + 12) % 12) + 1; // Count from planet's sign to 10th house sign
            
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

    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px;">
        <div style="color:var(--gold); font-size:11px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">🏛 10th House Matrix (Career & Action)</div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px; font-size:9.5px; margin-bottom:10px;">
            <div style="background:rgba(0,0,0,0.2); padding:5px; text-align:center;">
                <span style="color:var(--muted)">10th Lord</span><br/><strong>${h10LordName}</strong>
            </div>
            <div style="background:rgba(0,0,0,0.2); padding:5px; text-align:center;">
                <span style="color:var(--muted)">Dispositor (D1)</span><br/><strong>${dispositorName}</strong>
            </div>
            <div style="background:rgba(0,0,0,0.2); padding:5px; text-align:center;">
                <span style="color:var(--muted)">Dispositor (D9)</span><br/><strong>${d9DispositorName}</strong>
            </div>
        </div>

        <table style="width:100%; font-size:9.5px; color:var(--text); text-align:left; border-collapse: collapse; margin-bottom:10px;">
            <tr style="color:var(--cyan); border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:4px;">10th Lord Perspective</th>
                <th style="padding:4px;">Relative House</th>
            </tr>
            <tr>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Sun</td>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2)">H${fromSun}</td>
            </tr>
            <tr>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Moon</td>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2)">H${fromMoon}</td>
            </tr>
            <tr>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Karakamsa</td>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2)">H${fromKarakamsa}</td>
            </tr>
            <tr>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Arudha Lagna</td>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2)">H${fromArudha}</td>
            </tr>
            <tr>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05);">From Dasha Lord (${dashaLordName || '-'})</td>
                <td style="padding:4px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold; color:var(--gold2)">H${fromDasha}</td>
            </tr>
        </table>

        </table>

        <div style="font-size:9.5px; margin-bottom:4px;">
            <span style="color:var(--violet); font-weight:bold;">Synthesis (Conjunctions):</span> ${conj.length > 0 ? conj.join(', ') : '<span style="color:var(--muted)">No direct conjunctions with 10th Lord</span>'}
        </div>
        <div style="font-size:9.5px;">
            <span style="color:var(--violet); font-weight:bold;">Aspects (Drishti) on 10th House:</span> ${aspects.length > 0 ? aspects.join(', ') : '<span style="color:var(--muted)">No planets aspect the 10th House</span>'}
        </div>
    </div>`;

    html += `</div>`; // End Dynamic Analytical Blueprint Window

    return html;
  }
};
