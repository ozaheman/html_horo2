/**
 * Tushar Roy Predictions - Phase 2 (Comprehensive)
 * Performs exhaustive matching for every astrological component against 111 transcripts.
 */

window.TUSHAR_ROY = window.TUSHAR_ROY || {};

window.TUSHAR_ROY.analyze = function(d1Planets, houses, ascendant, d9Planets = null) {
  let predictions = [];
  const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  const signMap = {
    'Aries': ['एरीज', 'मेष', 'aries', '1'],
    'Taurus': ['टॉरस', 'वृषभ', 'taurus', '2'],
    'Gemini': ['जेमिनाई', 'मिथुन', 'gemini', '3'],
    'Cancer': ['कैंसर', 'कर्क', 'cancer', '4'],
    'Leo': ['लियो', 'सिंह', 'leo', '5'],
    'Virgo': ['वर्गो', 'कन्या', 'virgo', '6'],
    'Libra': ['लिब्रा', 'तुला', 'libra', '7'],
    'Scorpio': ['स्कर्पियो', 'वृश्चिक', 'scorpio', '8'],
    'Sagittarius': ['सेजिटेरियस', 'धनु', 'sagittarius', '9'],
    'Capricorn': ['कैप्रीिकॉर्न', 'मकर', 'capricorn', '10'],
    'Aquarius': ['अक्वेरियस', 'कुंभ', 'aquarius', '11'],
    'Pisces': ['पाइसिस', 'मीन', 'pisces', '12']
  };

  const planetHindi = {
    'Sun': 'सूर्य', 'Moon': 'चंद्रमा', 'Mars': 'मंगल', 'Mercury': 'बुध',
    'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु'
  };

  const ordinal = ['0', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  function extractContext(text, terms, maxResults = 1) {
    if (!text) return null;
    const sentences = text.split(/(?:\u0964|\.|\?|\!)/);
    let matchedSnippet = [];
    for (let i = 0; i < sentences.length; i++) {
        let sentenceLower = sentences[i].toLowerCase();
        if (terms.some(term => sentenceLower.includes(term.toLowerCase()))) {
            let start = Math.max(0, i - 1);
            let end = Math.min(sentences.length - 1, i + 1);
            let chunk = sentences.slice(start, end + 1).map(s => s.trim()).join('। ') + '।';
            if (!matchedSnippet.includes(chunk)) matchedSnippet.push(chunk);
            if (matchedSnippet.length >= maxResults) break;
        }
    }
    return matchedSnippet.length > 0 ? matchedSnippet.join('<br><br>') : null;
  }

  function addPrediction(category, title, terms, topicFilter = null) {
    if (!window.TUSHAR_DB) return;
    window.TUSHAR_DB.forEach(entry => {
        if (topicFilter && !entry.topic.toLowerCase().includes(topicFilter.toLowerCase())) return;
        const ctx = extractContext(entry.text, terms);
        if (ctx) {
            predictions.push({ category, title, effect: ctx });
        }
    });
  }

  // 1. Planet-by-Planet Deep Analysis
  const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  planetList.forEach(p => {
    const data = d1Planets[p];
    if (!data) return;
    
    // a. Sign Placement
    addPrediction('Planetary Placements', `${p} in ${data.sign}`, [data.sign, planetHindi[p], signMap[data.sign][1]], p);
    
    // b. House Placement
    addPrediction('Planetary Placements', `${p} in ${ordinal[data.house]} House`, [planetHindi[p], `${ordinal[data.house]} house`, `${data.house}वें घर`, `${data.house} भाव`], p);
    
    // c. Nakshatra Secrets
    if (data.nak) {
        addPrediction('Nakshatra Secrets', `${p} in ${data.nak}`, [data.nak, p.toLowerCase(), planetHindi[p]], 'Nakshatra');
    }
    
    // d. Dignity Status
    if (data.status && (data.status.includes('Exalt') || data.status.includes('Debil') || data.status.includes('Own'))) {
        addPrediction('Dignity & Status', `${p} is ${data.status}`, [p.toLowerCase(), 'exalted', 'debilitated', planetHindi[p], 'उच्च', 'नीच'], 'Exalted');
    }
    
    // e. Retrograde
    if (data.retrograde) {
        addPrediction('Special Status', `${p} is Retrograde`, [p.toLowerCase(), 'retrograde', 'वक्री', planetHindi[p]], 'Retro');
    }
  });

  // 2. House Lord Deep Analysis
  for (let h = 1; h <= 12; h++) {
    const lord = window.LORDS ? window.planetNames?.[((ascendant.sn - 1 + h - 1) % 12) + 1] : null;
    if (lord && d1Planets[lord]) {
        const targetHouse = d1Planets[lord].house;
        const terms = [
            `${ordinal[h]} lord in ${ordinal[targetHouse]}`,
            `${h}th lord in ${targetHouse}`,
            `${h}वें घर का स्वामी ${targetHouse}`,
            `${planetHindi[lord]} in ${targetHouse}th house`
        ];
        addPrediction('House Lord Results', `${ordinal[h]} Lord (${lord}) in ${ordinal[targetHouse]} House`, terms, `${h}th Lord`);
    }
  }

  // 3. Conjunctions
  const houseOccupants = {};
  planetList.forEach(p => {
    const h = d1Planets[p]?.house;
    if (h) {
        houseOccupants[h] = houseOccupants[h] || [];
        houseOccupants[h].push(p);
    }
  });
  
  for (const [h, occupants] of Object.entries(houseOccupants)) {
    if (occupants.length >= 2) {
        const terms = occupants.map(p => planetHindi[p] || p.toLowerCase());
        addPrediction('Special Combinations', `Conjunction in House ${h}: ${occupants.join(' + ')}`, terms, 'Conjunction');
    }
  }

  // 4. Kartari Yog (Flanking Check)
  for (let h = 1; h <= 12; h++) {
    const prev = (h === 1) ? 12 : h - 1;
    const next = (h === 12) ? 1 : h + 1;
    const occupantsPrev = houseOccupants[prev] || [];
    const occupantsNext = houseOccupants[next] || [];
    if (occupantsPrev.length > 0 && occupantsNext.length > 0) {
        addPrediction('Special Combinations', `Kartari Effect on House ${h}`, ['kartari', 'yog', 'कर्तरी'], 'Kartari');
    }
  }

  // 5. D9 Navamsha Insights
  if (d9Planets) {
    planetList.forEach(p => {
        const d9House = d9Planets[p]?.house;
        if (d9House) {
            addPrediction('Navamsha (D9) Insights', `D9: ${p} in ${ordinal[d9House]} House`, [`navamsha ${p.toLowerCase()}`, `d9 ${p.toLowerCase()}`, `नवमांश ${planetHindi[p]}`], 'D9');
        }
    });
  }

  // Filter Unique and Group
  let grouped = {};
  predictions.forEach(p => {
    grouped[p.category] = grouped[p.category] || [];
    // Avoid near-identical snippets
    if (!grouped[p.category].some(item => item.effect.substring(0, 30) === p.effect.substring(0, 30))) {
        grouped[p.category].push(p);
    }
  });

  let resultHtml = `
    <div class="pred-item">
      <div class="pred-title">Tushar Roy Exhaustive Analysis (Phase 2)</div>
      <div class="pred-dasha">Deeply Scanned across 111 Transcripts</div>
      <div style="margin-top:15px; display:flex; flex-direction:column; gap:15px;">
  `;

  if (Object.keys(grouped).length === 0) {
      resultHtml += `<div style="color:var(--rose); text-align:center; padding:20px;">No specific teachining matches found for this unique combination.</div>`;
  }

  const catColors = {
      'Planetary Placements': 'var(--gold)',
      'House Lord Results': 'var(--cyan)',
      'Nakshatra Secrets': 'var(--violet)',
      'Special Combinations': 'var(--rose)',
      'Navamsha (D9) Insights': 'var(--green)',
      'Special Status': 'var(--amber)',
      'Dignity & Status': 'var(--text)'
  };

  for (const [cat, items] of Object.entries(grouped)) {
    resultHtml += `
      <div>
        <div style="font-size:10px; color:${catColors[cat] || 'var(--muted)'}; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:2px;">
            ${cat}
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
    `;
    items.slice(0, 8).forEach(item => { // Limit per category for readability
        let sbInfo = '';
        const pName = item.title.split(' ')[0];
        if (d1Planets[pName] && d1Planets[pName].sb !== undefined && d1Planets[pName].sb !== null) {
            sbInfo = `<span style="color:var(--gold); font-size:9px; margin-left:10px;">Strength (Shadbala): ${d1Planets[pName].sb}</span>`;
        }

        resultHtml += `
          <div style="padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:4px;">
            <div style="color:var(--text); font-weight:700; font-size:11px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                <div><span style="color:var(--gold); font-size:9px; text-transform:uppercase;">Method:</span> ${item.title}</div>
                ${sbInfo}
            </div>
            <div style="line-height:1.4; font-size:10.5px; color:#CCC; font-style:italic; border-left:2px solid ${catColors[cat] || 'var(--muted)'}; padding-left:10px;">
                <span style="color:var(--cyan); font-size:9px; text-transform:uppercase; font-style:normal; font-weight:700;">Result Insight:</span> ${item.effect}
            </div>
          </div>
        `;
    });
    resultHtml += `</div></div>`;
  }

  resultHtml += `
      </div>
      
      <div style="margin-top:20px; padding-top:15px; border-top:1px solid var(--border);">
        <div class="pred-title" style="font-size:11px;">Transcript Topic Archives</div>
        <div style="margin-top:10px; display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
  `;
  
  if (window.TUSHAR_DB) {
     window.TUSHAR_DB.slice(0, 30).forEach((entry, i) => {
        resultHtml += `
          <button class="btn" style="text-align:left; font-size:9px; padding:4px;" onclick="viewTusharTopic(${i})">
            [${i+1}] ${entry.topic.substring(0, 25)}...
          </button>
        `;
     });
  }
  
  resultHtml += `
        </div>
        <div id="tusharRoyViewer" style="margin-top:15px; padding:10px; background:var(--bg3); border:1px solid var(--border); border-radius:4px; max-height:500px; overflow-y:auto; font-size:10.5px; line-height:1.6; display:none; white-space: pre-wrap;">
        </div>
      </div>
    </div>
  `;
  
  return resultHtml;
};

window.viewTusharTopic = function(index) {
    const viewer = document.getElementById('tusharRoyViewer');
    if (!viewer || !window.TUSHAR_DB[index]) return;
    viewer.style.display = 'block';
    const entry = window.TUSHAR_DB[index];
    viewer.innerHTML = `<h3 style="color:var(--gold); border-bottom:1px solid var(--border);">${entry.topic}</h3>\n${entry.text}`;
    viewer.scrollTop = 0;
};

