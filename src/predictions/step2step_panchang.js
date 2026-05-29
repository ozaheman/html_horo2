
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

    const SIGNS = window.ASTRO_CONSTANTS ? window.ASTRO_CONSTANTS.SIGNS : ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const moonSign = SIGNS[Math.floor(moonLon/30)];
    const sunSign = SIGNS[Math.floor((planets.Sun.longitude)/30)] || "Unknown"; 
    
    // SHADBALA ADVANCED VISUALIZATION
    let sbHtml = "";
    if (window.SHADBALA && typeof window.SHADBALA.calculateAll === "function") {
      const sb = window.SHADBALA.calculateAll(planets, ascendant.longitude);
      sbHtml = `<div style="margin-top:15px; border-top:1px solid var(--border2); padding-top:10px;">
        <strong style="color:var(--cyan); font-size:12px; margin-bottom:8px; display:block;">Shadbala (Planetary Strength) - Achieved vs Required</strong>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">`;
      
      // Typical baseline requirements scaled to our engine's standard 0-200 output model
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
      if (dayKey === null) dayKey = dayStr.split(',')[0].toLowerCase(); 

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

    // ─────────────────────────────────────────────────────────────────
    // STEP-BY-STEP KARMIC AXIS CALCULATION (Per Prompt)
    // ─────────────────────────────────────────────────────────────────
    let stepHtml = `<div class="pred-item" style="border-left: 3px solid var(--violet); margin-top:20px;">
        <div class="pred-title" style="color:var(--violet); font-size:14px; text-align:center; margin-bottom:15px;">Step-by-Step Astrological Derivation (Karmic Axis)</div>
        <div style="font-family:'Courier New', monospace; font-size:11px; color:var(--text); line-height:1.7; background:rgba(0,0,0,0.25); padding:15px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); overflow-x:auto;">`;

    try {
        const LORDS = window.ASTRO_CONSTANTS.SIGN_LORDS;
        const pNames = window.ASTRO_CONSTANTS.PLANETS.slice(0, 9);
        const ascSn = ascendant.sn || Math.floor((ascendant.sid || ascendant.longitude) / 30);
        const ascDegInSign = (ascendant.deg !== undefined) ? ascendant.deg : ((ascendant.sid || ascendant.longitude) % 30);
        const h8Sn = (ascSn + 7) % 12;
        const h8Lord = LORDS[h8Sn];

        // Step 1
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">1. Ascendant and Basic Rashi Positions</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `Ascendant = ${SIGNS[ascSn]} (${ascDegInSign.toFixed(2)}°)<br><br>`;
        stepHtml += `<table style="width:100%; max-width:300px; color:var(--muted); border-collapse:collapse; text-align:left;">`;
        stepHtml += `<tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th style="padding:2px 0;">House</th><th style="padding:2px 0;">Sign</th><th style="padding:2px 0;">Planets</th></tr>`;
        
        let houseMap = {};
        for(let i=1; i<=12; i++) {
            let sn = (ascSn + i - 1) % 12;
            let occupants = pNames.filter(p => planets[p] && Math.floor((planets[p].sid || planets[p].longitude) / 30) === sn);
            if (occupants.length > 0 || i === 1 || i === 8 || i === 10) {
               houseMap[i] = { sign: SIGNS[sn], occupants: occupants };
               stepHtml += `<tr><td style="padding:2px 0;">${i}</td><td style="padding:2px 0;">${SIGNS[sn]}</td><td style="padding:2px 0;">${occupants.length > 0 ? occupants.join(', ') : 'None'}</td></tr>`;
            }
        }
        stepHtml += `</table></div>`;

        // Step 2
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">2. Randhreshvara (8th Lord)</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `The 8th house from ${SIGNS[ascSn]} is ${SIGNS[h8Sn]}.<br>`;
        stepHtml += `Lord of ${SIGNS[h8Sn]} is ${h8Lord} (in D1 natal chart).<br>`;
        stepHtml += `<strong style="color:var(--cyan);">Therefore: Randhreshvara = ${h8Lord}</strong></div>`;

        // Step 3
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">3. Randhra Yukta (Planets occupying 8th house)</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `8th house = ${SIGNS[h8Sn]}.<br>`;
        let occ8 = pNames.filter(p => planets[p] && Math.floor((planets[p].sid || planets[p].longitude)/30) === h8Sn);
        stepHtml += `Check planets in ${SIGNS[h8Sn]}: ${occ8.length > 0 ? occ8.join(', ') : 'None'}.<br>`;
        stepHtml += `<strong style="color:var(--cyan);">Therefore: Randhra Yukta = ${occ8.length > 0 ? occ8.join(', ') : 'None'}</strong></div>`;

        // Step 4
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">4. Randhra Drishta (Planets aspecting 8th house)</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        stepHtml += `Checking 7th aspect for all planets, and special aspects for Mars, Jupiter, Saturn, Rahu, and Ketu on ${SIGNS[h8Sn]}.<br>`;
        let asp8 = [];
        pNames.forEach(p => {
           if (!planets[p]) return;
           let pSn = Math.floor((planets[p].sid || planets[p].longitude)/30);
           if (pSn === h8Sn) return; // In house, not aspecting
           let dist = (h8Sn - pSn + 12) % 12; // 0-11
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
        stepHtml += `<strong style="color:var(--cyan);">Therefore: Randhra Drishta = ${asp8.length > 0 ? asp8.join(', ') : 'None'}</strong></div>`;

        // Step 5
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">5. Randhreshvara Yuti (Conjunction with 8th Lord)</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
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
        stepHtml += `<strong style="color:var(--cyan);">Therefore: Randhreshvara Yuti = ${yuti8.length > 0 ? yuti8.join(', ') : 'None'}</strong></div>`;

        // Step 6
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">6. Kharesha (22nd Drekkana Lord)</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        
        let ascAbs = ascendant.sid || ascendant.longitude;
        let kharesha = '-';
        if (typeof window.getVargaData === 'function') {
            let d3AscSign = window.getVargaData(ascAbs, 3).sign;
            // The 22nd Drekkana corresponds to the 8th house in the D3 chart.
            let h8D3Sign = (d3AscSign + 7) % 12;
            kharesha = LORDS[h8D3Sign];
            
            stepHtml += `Seeking D3 (Drekkana) chart:<br>`;
            stepHtml += `D3 Ascendant is ${SIGNS[d3AscSign]}.<br>`;
            stepHtml += `The 22nd Drekkana corresponds to the 8th house in the D3 chart.<br>`;
            stepHtml += `The 8th house in D3 is ${SIGNS[h8D3Sign]}.<br>`;
            stepHtml += `Lord of ${SIGNS[h8D3Sign]} is ${kharesha}.<br>`;
            stepHtml += `<strong style="color:var(--cyan);">Therefore: Kharesha = ${kharesha}</strong></div>`;
        } else {
            // Fallback logic
            let d3Idx = Math.floor(ascDegInSign / 10);
            let kharD3Sign = (h8Sn + d3Idx * 4) % 12;
            kharesha = LORDS[kharD3Sign];
            stepHtml += `D3 calculation fallback. 22nd Drekkana sign is ${SIGNS[kharD3Sign]}. Lord is ${kharesha}.<br>`;
            stepHtml += `<strong style="color:var(--cyan);">Therefore: Kharesha = ${kharesha}</strong></div>`;
        }

        // Step 7
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">7. 64th Navamsha from Moon</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        if (planets.Moon) {
            let mDeg = (planets.Moon.sid || planets.Moon.longitude);
            let mDegInSign = mDeg % 30;
            let mSn = Math.floor(mDeg/30);
            
            // Formula: +210 degrees gives exact 64th Navamsha
            let khar64LonMoon = (mDeg + 210) % 360;
            let m64D9Sn = typeof window.getVargaData === 'function' ? window.getVargaData(khar64LonMoon, 9).sign : 0;
            let m64Lord = LORDS[m64D9Sn];
            
            stepHtml += `Moon is in ${SIGNS[mSn]} at ${mDegInSign.toFixed(2)}°.<br>`;
            stepHtml += `Adding 210° (exactly 64 Navamshas = 7 signs + 1 Navamsha equivalence).<br>`;
            stepHtml += `This projects to ${SIGNS[Math.floor(khar64LonMoon/30)]} ${(khar64LonMoon%30).toFixed(2)}°.<br>`;
            stepHtml += `The Navamsha of this point falls in ${SIGNS[m64D9Sn]}.<br>`;
            stepHtml += `${SIGNS[m64D9Sn]} is ruled by ${m64Lord}.<br>`;
            stepHtml += `<strong style="color:var(--cyan);">Therefore: 64th Navamsha from Moon = ${m64Lord}</strong></div>`;
        } else {
            stepHtml += `Moon data unavailable.</div>`;
        }

        // Step 8
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-bottom:4px; font-size:12px;">8. 64th Navamsha from Ascendant</div>`;
        stepHtml += `<div style="margin-bottom:12px; padding-left:10px; border-left:2px solid rgba(255,255,255,0.1);">`;
        let khar64LonAsc = (ascAbs + 210) % 360;
        let a64D9Sn = typeof window.getVargaData === 'function' ? window.getVargaData(khar64LonAsc, 9).sign : 0;
        let a64Lord = LORDS[a64D9Sn];
        
        stepHtml += `Ascendant is in ${SIGNS[ascSn]} at ${ascDegInSign.toFixed(2)}°.<br>`;
        stepHtml += `Adding 210° projects to ${SIGNS[Math.floor(khar64LonAsc/30)]} ${(khar64LonAsc%30).toFixed(2)}°.<br>`;
        stepHtml += `The Navamsha of this point falls in ${SIGNS[a64D9Sn]}.<br>`;
        stepHtml += `${SIGNS[a64D9Sn]} is ruled by ${a64Lord}.<br>`;
        stepHtml += `<strong style="color:var(--cyan);">Therefore: 64th Navamsha from Ascendant = ${a64Lord}</strong></div>`;

        // Final Summary
        stepHtml += `<div style="color:var(--gold2); font-weight:bold; margin-top:20px; margin-bottom:4px; font-size:12px;">Final Summary Table</div>`;
        stepHtml += `<table style="width:100%; max-width:400px; color:var(--text); border-collapse:collapse; text-align:left; border:1px solid rgba(255,255,255,0.1);">`;
        stepHtml += `<tr style="background:rgba(255,255,255,0.05);"><th style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Factor</th><th style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Result</th></tr>`;
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Randhreshvara (8th Lord)</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${h8Lord}</td></tr>`;
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Randhra Yukta</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${occ8.length > 0 ? occ8.join(', ') : 'None'}</td></tr>`;
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Randhra Drishta</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${asp8.length > 0 ? asp8.join(', ') : 'None'}</td></tr>`;
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Randhreshvara Yuti</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--cyan);">${yuti8.length > 0 ? yuti8.join(', ') : 'None'}</td></tr>`;
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">Kharesha (22nd Drek Lord)</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--rose);">${kharesha}</td></tr>`;
        
        let m64L = planets.Moon ? LORDS[(typeof window.getVargaData === 'function' ? window.getVargaData(((planets.Moon.sid||planets.Moon.longitude)+210)%360, 9).sign : 0)] : '-';
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">64th Navamsha from Moon</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--rose);">${m64L}</td></tr>`;
        stepHtml += `<tr><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1);">64th Navamsha from Asc</td><td style="padding:4px 8px; border:1px solid rgba(255,255,255,0.1); font-weight:bold; color:var(--rose);">${a64Lord}</td></tr>`;
        stepHtml += `</table>`;

        // Gather unique karmic planets
        let karmicSet = new Set([h8Lord, ...occ8, ...asp8, ...yuti8, kharesha, m64L, a64Lord]);
        karmicSet.delete('None');
        karmicSet.delete('-');
        
        stepHtml += `<div style="margin-top:12px; font-style:italic; color:var(--muted);">These combinations show strong karmic activation through: <strong style="color:var(--text);">${Array.from(karmicSet).join(', ')}</strong>. Watch these planets carefully during their Mahadasha or transit over sensitive points.</div>`;

    } catch(e) {
        stepHtml += `<div style="color:var(--rose)">Error computing step-by-step breakdown: ${e.message}</div>`;
    }

    stepHtml += `</div></div>`;
    html += stepHtml;

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

        let lagnaTitle = i === 0 ? `Natal Chart (1st House) - ${rotAscSignName}` : `Horoscope ${i+1} : ${rotAscSignName} Lagna (${i+1}th House)`;
        // HTML for this rotated chart
        html += `<div style="background:rgba(0,0,0,0.2); border:1px solid var(--border); border-radius:4px; margin-bottom:15px; padding:10px; display:flex; flex-direction:column; align-items:center; overflow:hidden;">
            <div style="font-size:12px; font-weight:bold; color:var(--gold2); margin-bottom:0px; border-bottom:1px solid var(--border2); padding-bottom:4px; width:100%; text-align:center;">
               ${lagnaTitle}
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
    let navData = null;
    if (window.NAVAMSHA_ANALYSIS && typeof window.NAVAMSHA_ANALYSIS.calculate === 'function') {
        navData = window.NAVAMSHA_ANALYSIS.calculate(planets, ascendant);
    }
    
    html += `<div class="pred-item" style="border-left: 3px solid #ff4757; margin-top:20px;">
        <div class="pred-title" style="color:#ff4757; font-size:14px; text-align:center;">Deep Astrological Tables</div>
        <div style="display:grid; grid-template-columns:1fr; gap:15px; margin-top:10px;">
    `;

    // A. Planets Nakshatra, Degree & Vish Navamsha
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px; overflow-x:auto;">
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
    planetList.forEach(p => {
        if(planets[p]) {
            let lon = planets[p].sid !== undefined ? planets[p].sid : planets[p].longitude;
            let degStr = (lon % 30).toFixed(2) + "°";
            let nakInfo = (typeof window.determineNakshatra === 'function') ? window.determineNakshatra(lon) : {name:'-', pada:'-', lord:'-'};
            
            let isVish = '-';
            if (navData && navData.vishPlanets) {
                let vp = navData.vishPlanets.find(v => v.name === p);
                if (vp) isVish = `<span style="color:#ff4757;font-weight:bold;">Yes${vp.sunHora ? ' (Sun Hora)' : ''}</span>`;
            }
            
            html += `<tr><td style="padding:4px;">${p}</td><td style="padding:4px; font-family:monospace;">${degStr}</td><td style="padding:4px;">${nakInfo.name} (${nakInfo.pada})</td><td style="padding:4px;">${nakInfo.lord}</td><td style="padding:4px;">${isVish}</td></tr>`;
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
    html += `<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px; overflow-x:auto;">
        <div style="color:var(--gold); font-size:12px; margin-bottom:8px; font-weight:bold; border-bottom:1px solid var(--border2); padding-bottom:4px;">⚔️ Planetary Friendships</div>
        <table style="width:100%; font-size:10px; color:var(--text); text-align:left; border-collapse: collapse;">
            <tr style="color:var(--cyan); border-bottom:1px solid var(--border2);">
                <th style="padding:4px;">Planet</th>
                <th style="padding:4px;">Five-Fold Friends</th>
                <th style="padding:4px;">Five-Fold Enemies</th>
            </tr>
    `;

    let gmData = null;
    if (window.GRAHA_MAITRI && typeof window.GRAHA_MAITRI.calculateRelationships === "function") {
        gmData = window.GRAHA_MAITRI.calculateRelationships(planets);
    }
    
    planetList.forEach(p => {
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

    // 4. Navamsha (D9) & Khar (Poisonous) Analysis
    if (navData) {
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
                        <span style="color:var(--rose)">64th Navamsha Lord (Moon):</span> <strong>${navData.Khar64Lord}</strong><br/>
                        <span style="color:var(--rose)">64th Navamsha Lord (Asc):</span> <strong>${navData.Khar64Lord_Asc || '-'}</strong><br/>
                        <span style="color:var(--rose)">22nd Drekkana Lord:</span> <strong>${navData.Khar22Lord}</strong><br/>
                        <span style="color:var(--rose)">Double Khar Planet:</span> <strong>${navData.DoubleKhar || '-'}</strong>
                    </div>
                </div>
            </div>`;
            
        if (navData.Khar64_AllBodies) {
             html += `<div style="background:rgba(255,99,71,0.05); border:1px solid rgba(255,99,71,0.2); border-radius:6px; padding:10px; margin-top:10px; overflow-x:auto;">
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
                     <td style="padding:4px; font-weight:bold;">${b.name}</td>
                     <td style="padding:4px;">${navName}</td>
                     <td style="padding:4px;">${rasiName}</td>
                     <td style="padding:4px; color:#ff4757; font-weight:bold;">${b.pointLon.toFixed(4)}°</td>
                     <td style="padding:4px; font-family:monospace; color:var(--gold2);">${b.startDeg.toFixed(4)}° - ${b.endDeg.toFixed(4)}°</td>
                     <td style="padding:4px;">${b.navamsa64Lord}</td>
                 </tr>`;
             });
             html += `</table></div>`;
        }

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
        <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:15px;">10th House Matrix for Advanced Life Path Tracking.</div>
    `;

    // 5B. 10th House Analysis Matrix
    const LORDS = window.ASTRO_CONSTANTS.SIGN_LORDS;
    let h10SignNum = (baseAscSign + 9) % 12;
    let h10LordName = LORDS[h10SignNum];

    let h10LordPlanet = planets[h10LordName];
    let dispositorName = '-';
    let d9DispositorName = '-';
    
    if (h10LordPlanet) {
        let lon = h10LordPlanet.sid !== undefined ? h10LordPlanet.sid : h10LordPlanet.longitude;
        let d1Sign = Math.floor(lon / 30);
        dispositorName = LORDS[d1Sign];

        if (typeof window.getVargaData === 'function') {
            let d9Sign = window.getVargaData(lon, 9).sign;
            d9DispositorName = LORDS[d9Sign];
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
