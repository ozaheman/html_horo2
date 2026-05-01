/**
 * Generic Analyzer - Reusable prediction matching engine
 * Leverages keyword extraction on custom databases.
 */

window.GENERIC_ANALYZER = window.GENERIC_ANALYZER || {};

// Helpers
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
    if (!text || typeof text !== 'string') return null;
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

// -------------------------------------------------------------
// analyzeComprehensive: The Master Integrated Logic grouping by Astrological Element
// -------------------------------------------------------------
window.GENERIC_ANALYZER.analyzeComprehensive = function(dbMap, d1Planets, houses, ascendant, d9Planets = null) {
  if (!dbMap) return '';
  let predictions = [];

  function addMultiDBSearch(category, title, terms, topicFilter = null) {
    // For a given logical placement, run across ALL DBs
    for (const [dbName, db] of Object.entries(dbMap)) {
        if (!db || !Array.isArray(db.data)) continue;
        
        db.data.forEach(entry => {
            if (topicFilter && entry.topic && !entry.topic.toLowerCase().includes(topicFilter.toLowerCase())) return;
            const ctx = entry.text ? extractContext(entry.text, terms, 2) : null;
            if (ctx) {
                predictions.push({ 
                    category, 
                    title, 
                    effect: ctx, 
                    topic: entry.topic,
                    sourceName: dbName,
                    color: db.color || 'var(--cyan)'
                });
            }
        });
    }
  }

  // 1. Planet-by-Planet Deep Analysis
  const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  if (d1Planets) {
      planetList.forEach(p => {
        const data = d1Planets[p];
        if (!data) return;
        
        const signDetails = signMap[data.sign] || [data.sign, data.sign, data.sign.toLowerCase()];
        const pElementTitle = `${p} in ${data.sign} (${ordinal[data.house]} House)`;

        // Comprehensive search for this unique element
        addMultiDBSearch('Planetary Placements', pElementTitle, [data.sign, planetHindi[p], signDetails[1]], p);
        if (data.house !== undefined) {
             addMultiDBSearch('Planetary Placements', pElementTitle, [`${ordinal[data.house]} house`, `${data.house}वें घर`, `${data.house} भाव`], p);
        }
        
        if (data.nak) {
            addMultiDBSearch('Nakshatra Secrets', `${p} in ${data.nak} Nakshatra`, [data.nak, p.toLowerCase(), planetHindi[p]], 'Nakshatra');
        }
      });

      // 2. House Lord Deep Analysis
      if (ascendant) {
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
                addMultiDBSearch('House Lord Karma', `${ordinal[h]} Lord (${lord}) placed in ${ordinal[targetHouse]} House`, terms, null);
            }
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
            addMultiDBSearch('Special Combinations', `Conjunction in House ${h}: ${occupants.join(' + ')}`, terms, 'Conjunction');
        }
      }
  }

  // Generate HTML: Group by Category -> then by element Title -> then stacked UI for each DB source!
  if (predictions.length === 0) {
      return `<div class="pred-item" style="color:var(--rose)">No matching contextual transcripts found across the comprehensive DBs.</div>`;
  }

  const grouped = predictions.reduce((acc, pred) => {
    if (!acc[pred.category]) acc[pred.category] = {};
    if (!acc[pred.category][pred.title]) acc[pred.category][pred.title] = [];
    acc[pred.category][pred.title].push(pred);
    return acc;
  }, {});

  let html = `<div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">`;
  html += `<h3 style="color:var(--text); margin-top:0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">🌌 COMPREHENSIVE TEXT ANALYSIS (All Experts)</h3>`;
  
  for (const [category, titles] of Object.entries(grouped)) {
      html += `<div style="margin-top:25px;">`;
      html += `<h4 style="color:white; background:rgba(0,0,0,0.4); padding:6px 12px; border-radius:4px; margin-bottom:15px; font-family:'Courier New',monospace; text-transform:uppercase; font-size:12px; letter-spacing:1px; border-left:3px solid var(--gold);">■ ${category}</h4>`;
      
      for (const [title, sources] of Object.entries(titles)) {
          html += `<div style="margin-bottom:20px; padding:10px; background:rgba(255,255,255,0.02); border-radius:4px; border-left:2px solid rgba(255,255,255,0.1);">`;
          html += `<div style="color:var(--gold);font-weight:bold;font-size:13px;margin-bottom:10px;text-transform:uppercase;">● ${title}</div>`;
          
          sources.forEach(p => {
             html += `
                <div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.05);">
                  <div style="font-size:10px;font-weight:bold;color:${p.color};margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">
                    ▶ ${p.sourceName} <span style="color:var(--muted); font-weight:normal; text-transform:none;">— matched from "${p.topic}"</span>
                  </div>
                  <div style="font-size:11px;color:var(--text);line-height:1.6;">${p.effect}</div>
                </div>
             `;
          });
          html += `</div>`;
      }
      html += `</div>`;
  }
  html += `</div>`;
  return html;
};

// -------------------------------------------------------------
// Legacy Single DB analyze function
// -------------------------------------------------------------
window.GENERIC_ANALYZER.analyze = function(dbArray, blockTitle, blockColor, d1Planets, houses, ascendant, d9Planets = null) {
   // Kept for backward compatibility with Single-DB tabs
   if(!dbArray) return '';
   return window.GENERIC_ANALYZER.analyzeComprehensive({
       [blockTitle]: { data: dbArray, color: blockColor }
   }, d1Planets, houses, ascendant, d9Planets);
};
