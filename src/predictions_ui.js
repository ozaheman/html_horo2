/**
 * Prediction Dashboard UI
 * Render and manage predictions interface
 */

window.PREDICTIONS_UI = window.PREDICTIONS_UI || {
  currentStartDate: null,
  currentEndDate: null,
  initialized: false
};

window.savePredictionOverride = function(key, newText) {
  if (key && newText !== undefined) {
    localStorage.setItem('pred_override_' + key, newText.trim());
    console.log('Saved override for:', key);
  }
};

window.makeEditable = function(key, defaultContent) {
  const customKey = 'pred_override_' + key;
  const savedContent = localStorage.getItem(customKey);
  const contentToRender = savedContent ? savedContent : defaultContent;
  return `<div contenteditable="plaintext-only" spellcheck="false" title="Click to edit this template" class="editable-prediction" data-pred-key="${key}" style="outline:none; border:1px solid transparent; border-radius:3px; transition:all 0.2s; padding:2px;" onfocus="this.style.border='1px dashed var(--cyan)'; this.style.background='rgba(255,255,255,0.05)';" onblur="this.style.border='1px solid transparent'; this.style.background='transparent'; window.savePredictionOverride('${key}', this.innerText);">${contentToRender}</div>`;
};

/**
 * Initialize predictions UI panel
 */
function initPredictionsUI() {
  if (PREDICTIONS_UI.initialized) return;
  
  const btnPredictions = document.getElementById('btnPredictions');
  const closePredictions = document.getElementById('closePredictions');
  const btnUpdatePredictions = document.getElementById('btnUpdatePredictions');
  const predictionsPanel = document.getElementById('predictionsPanel');
  
  if (!btnPredictions || !closePredictions || !btnUpdatePredictions || !predictionsPanel) {
    console.warn('⚠️ Prediction UI elements not found');
    return;
  }
  
  // Set default date range (today to 90 days from now)
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 90);
  
  const todayIso = formatDateISO(today);
  const endDateIso = formatDateISO(endDate);
  
  document.getElementById('pred-start').value = todayIso;
  document.getElementById('pred-end').value = endDateIso;
  
  PREDICTIONS_UI.currentStartDate = today;
  PREDICTIONS_UI.currentEndDate = endDate;
  
  // Event listeners
  btnPredictions.addEventListener('click', () => {
    predictionsPanel.classList.add('open');
    updatePredictionsDisplay();
  });
  
  closePredictions.addEventListener('click', () => {
    predictionsPanel.classList.remove('open');
  });
  
  btnUpdatePredictions.addEventListener('click', () => {
    const startStr = document.getElementById('pred-start').value;
    const endStr = document.getElementById('pred-end').value;
    
    if (!startStr || !endStr) {
      alert('Please select both start and end dates');
      return;
    }
    
    PREDICTIONS_UI.currentStartDate = new Date(startStr + 'T00:00:00');
    PREDICTIONS_UI.currentEndDate = new Date(endStr + 'T23:59:59');
    
    updatePredictionsDisplay();
  });
  
  PREDICTIONS_UI.initialized = true;
  
  // Sahams Transit Toggle
  const chkShowSahamsTransit = document.getElementById('chkShowSahamsTransit');
  if (chkShowSahamsTransit) {
    chkShowSahamsTransit.addEventListener('change', (e) => {
      window.showVarshaphala = e.target.checked;
      if (window.renderSvgChart) window.renderSvgChart();
    });
  }

  // Language Toggle
  const hdr = predictionsPanel.querySelector('.conj-hdr');
  if (hdr && !document.getElementById('langToggle')) {
    const btnBox = document.createElement('div');
    btnBox.style.display = 'flex';
    btnBox.style.alignItems = 'center';

    const btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.innerHTML = 'A / अ';
    btn.title = 'Toggle Language (English/Hindi)';
    btn.style.cssText = 'background:rgba(255,255,255,0.05); border:1px solid var(--border3); color:var(--text); padding:3px 8px; border-radius:3px; cursor:pointer; font-size:10px; margin-right:15px; margin-left: auto;';
    btn.onclick = () => {
        if (window.I18N) {
            window.I18N.current = window.I18N.current === 'en' ? 'hi' : 'en';
            updatePredictionsDisplay();
        }
    };
    btnBox.appendChild(btn);

    const closeBtn = hdr.querySelector('.close-btn');
    if (closeBtn) {
      hdr.insertBefore(btnBox, closeBtn);
    } else {
      hdr.appendChild(btnBox);
    }
  }
  
  console.log('✅ Predictions UI initialized');
}

/**
 * Show progress in the UI
 */
async function showProgress(message) {
  const progress = document.getElementById('pred-progress');
  if (progress) {
    progress.style.display = 'block';
    progress.textContent = '> ' + message;
  }
  // Brief delay to allow UI refresh
  await new Promise(resolve => setTimeout(resolve, 50));
}

/**
 * Clear progress UI
 */
function clearProgress() {
  const progress = document.getElementById('pred-progress');
  if (progress) {
    progress.style.display = 'none';
    progress.textContent = '';
  }
}

/**
 * Update predictions display with current date range
 */
async function updatePredictionsDisplay() {
  if (!window.PREDICTION_ANALYSIS || !window.PREDICTION_FORECASTING) {
    console.warn('⚠️ Prediction modules not loaded yet');
    return;
  }
  
  const content = document.getElementById('predictionsContent');
  let html = '';
  
  try {
    const mode = document.getElementById('predictionModeSel')?.value || 'default';
    
    // Ensure Natal Data is calculated with high precision
    if (!window.BIRTH_PLANETS || BIRTH.useComputed) {
      await showProgress('Recalculating Natal Chart (Swiss Ephemeris)...');
      if (window.recalcBirth) window.recalcBirth();
    }
    
    const targetDate = PREDICTIONS_UI.currentStartDate || new Date();
    const birthDate = window.BIRTH?.date || new Date();
    const targetYear = targetDate.getFullYear();
    const birthThisYear = new Date(targetYear, birthDate.getMonth(), birthDate.getDate());
    const solarYear = targetDate < birthThisYear ? targetYear - 1 : targetYear;

    if (mode === 'tushar' && window.TUSHAR_ROY) {
      await showProgress('Analyzing Natal Horoscope (Tushar Roy)...');
      const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
      const d9 = window.CURRENT_NAVAMSHA_POSITIONS || null;
      const asc = window.CURRENT_ASCENDANT || 0;
      const houses = window.CURRENT_HOUSES || {};
      
      html += '<h3 style="color:var(--text);border-bottom:1px solid var(--border);padding-bottom:5px;">1. Tushar Roy Predictions (Natal Chart)</h3>';
      html += window.TUSHAR_ROY.analyze(d1, houses, asc, d9);
      
      if (window.VARSHAPHALA) {
          await showProgress(`Calculating Solar Return for Year ${solarYear}...`);
          const vChart = window.VARSHAPHALA.castAnnualChart(solarYear);
          if (vChart) {
              await showProgress('Analyzing Varshaphala Predictions...');
              html += `<h3 style="color:var(--gold);margin-top:20px;border-bottom:1px solid var(--gold);padding-bottom:5px;">2. Tushar Roy Predictions (Varshaphala ${solarYear})</h3>`;
              
              // Add Varshaphala chart and details
              html += renderVarshaphalaSection(vChart);
              
              html += window.TUSHAR_ROY.analyze(vChart.planets, null, vChart.asc, vChart.d9Planets || null);
              
              if (window.CALCULATE_SAHAMS) {
                  const vPlanets = {};
                  Object.entries(vChart.planets).forEach(([k, v]) => { if (v && v.sid !== undefined) vPlanets[k] = v.sid; });
                  const vAsc = vChart.asc.sid;
                  const vHouses = vChart.houses;
                  const isDay = (vChart.planets.Sun.house >= 7);
                  const vSahams = window.CALCULATE_SAHAMS(vPlanets, vAsc, isDay, vHouses);
                  html += `<h3 style="color:#007BFF;margin-top:20px;border-bottom:1px solid #007BFF;padding-bottom:5px;">3. Tajaka Sahams (Annual ${solarYear})</h3>`;
                  html += renderSahamsSection(vSahams, isDay);
                  window.BIRTH_SAHAMS = vSahams;
              }
          }
      }
    } else if (mode === 'comprehensive') {
      const classicalFlatDB = [];
      if (window.ASTRO_KNOWLEDGE) {
          try {
            ['planet_in_house', 'planet_in_sign', 'nakshatra', 'yogas'].forEach(cat => {
                if(window.ASTRO_KNOWLEDGE[cat]) {
                    Object.keys(window.ASTRO_KNOWLEDGE[cat]).forEach(k => {
                        classicalFlatDB.push({ topic: cat + '_' + k, text: window.ASTRO_KNOWLEDGE[cat][k] });
                    });
                }
            });
          } catch(e) {}
      }

      const dbMap = {
          "Tushar Roy": { data: window.TUSHAR_DB || [], color: '#FFAAEE' },
          "Saral Jyotish": { data: window.SARAL_DB || [], color: 'var(--amber)' },
          "Astro Pathshala": { data: window.ASTRO_DB || [], color: 'var(--cyan)' },
          "Arun Pandit": { data: window.ARUN_PANDIT_DB || [], color: '#FF9933' },
          "Astrology Made Easy": { data: window.ASTROLOGY_MADE_EASY_DB || [], color: '#44FF88' },
          "BNN": { data: window.BNN_DB || [], color: 'var(--rose)' },
          "Kaalpurush Astrology": { data: window.KAALPURUSH_ASTROLOGY_DB || [], color: '#00FF88' },
          "Tathastu Anubhav": { data: window.TATHASTU_ANUBHAV_DB || [], color: '#44AAFF' },
          "The Professor": { data: window.THE_PROFESSOR_DB || [], color: '#FF3344' },
          "Vedang Jyotish": { data: window.VEDANG_JYOTIS_BY_SHIV_SHARMA_DB || [], color: '#FFD700' },
          "Classical texts (ASTRO KNOWLEDGE)": { data: classicalFlatDB, color: '#f3f3f3' }
      };

      const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
      const asc = window.CURRENT_ASCENDANT || 0;
      const houses = window.CURRENT_HOUSES || {};
      
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, d1, houses, asc, null);
      html += window.makeEditable('comprehensive_master', generatedHTML);
    } else if (mode === 'saral') {
      const dbMap = { "Saral Jyotish": { data: window.SARAL_DB || [], color: 'var(--amber)' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('saral_jyotish', generatedHTML);
    } else if (mode === 'astro') {
      const dbMap = { "Astro Pathshala": { data: window.ASTRO_DB || [], color: 'var(--cyan)' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('astro_jyotish', generatedHTML);
    } else if (mode === 'arun_pandit') {
      const dbMap = { "Arun Pandit": { data: window.ARUN_PANDIT_DB || [], color: '#FF9933' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('arun_pandit_db', generatedHTML);
    } else if (mode === 'astrology_made_easy') {
      const dbMap = { "Astrology Made Easy": { data: window.ASTROLOGY_MADE_EASY_DB || [], color: '#44FF88' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('astro_made_easy_db', generatedHTML);
    } else if (mode === 'bnn') {
      const dbMap = { "BNN": { data: window.BNN_DB || [], color: 'var(--rose)' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('bnn_db', generatedHTML);
    } else if (mode === 'kaalpurush') {
      const dbMap = { "Kaalpurush Astrology": { data: window.KAALPURUSH_ASTROLOGY_DB || [], color: '#00FF88' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('kaalpurush_db', generatedHTML);
    } else if (mode === 'tathastu') {
      const dbMap = { "Tathastu Anubhav": { data: window.TATHASTU_ANUBHAV_DB || [], color: '#44AAFF' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('tathastu_db', generatedHTML);
    } else if (mode === 'professor') {
      const dbMap = { "The Professor": { data: window.THE_PROFESSOR_DB || [], color: '#FF3344' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('professor_db', generatedHTML);
    } else if (mode === 'vedang') {
      const dbMap = { "Vedang Jyotish": { data: window.VEDANG_JYOTIS_BY_SHIV_SHARMA_DB || [], color: '#FFD700' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('vedang_db', generatedHTML);
    } else {
      await showProgress('Loading forecasting modules...');
      html += renderDailyCombinationsSection(targetDate);

      // 1. CURRENT DASHA INFO
      const dashaInfo = PREDICTION_FORECASTING.getCurrentDashaInfo(targetDate);
      html += renderCurrentDashaSection(dashaInfo);
      
      await showProgress('Projecting Dasha Timeline...');
      // 2. UPCOMING DASHA CHANGES
      const dashaTimeline = PREDICTION_FORECASTING.projectDashaTimeline(
        PREDICTIONS_UI.currentStartDate,
        PREDICTIONS_UI.currentEndDate
      );
      html += renderDashaTimelineSection(dashaTimeline);
      
      await showProgress('Calculating Optimal Dates...');
      // 3. SUGGESTED OPTIMAL DATES
      const optimalDates = PREDICTION_FORECASTING.suggestOptimalDates('remedy', 90);
      html += renderOptimalDatesSection(optimalDates);
      
      await showProgress('Analyzing House Placements...');
      // 4. MULTI-CHART ANALYSIS
      const analysis = PREDICTION_ANALYSIS.getPlanetsInHouses();
      html += renderMultiChartAnalysisSection(analysis);

      // 4.1 DETAILED PLANETARY KNOWLEDGE
      await showProgress('Fetching Detailed Planetary Insights...');
      html += renderAstrologyKnowledgeSection();

      // 4.5 NATAL DEGREES & DIVISIONAL DATA
      await showProgress('Calculating Natal Degrees & Varga Data...');
      html += renderNatalDegreesSection();

      // 5. VARSHAPHALA (ANNUAL)
      if (window.VARSHAPHALA) {
        await showProgress(`Calculating Varshaphala (Solar Return ${solarYear})...`);
        const vChart = window.VARSHAPHALA.castAnnualChart(solarYear);
        if (vChart) {
          html += renderVarshaphalaSection(vChart);
          
          const chkSahams = document.getElementById('chkCalculateSahams');
          if (chkSahams && chkSahams.checked && window.CALCULATE_SAHAMS) {
            await showProgress('Calculating Tajaka Sahams (Annual)...');
            const vPlanets = {};
            Object.entries(vChart.planets).forEach(([k, v]) => { if (v && v.sid !== undefined) vPlanets[k] = v.sid; });
            const vAsc = vChart.asc.sid;
            const isDay = (vChart.planets.Sun.house >= 7);
            const vSahams = window.CALCULATE_SAHAMS(vPlanets, vAsc, isDay, vChart.houses);
            html += `<h4 style="color:var(--cyan);margin-top:15px;margin-left:10px;">Annual Tajaka Sahams (${solarYear})</h4>`;
            html += renderSahamsSection(vSahams, isDay);
            window.BIRTH_SAHAMS = vSahams;
          }
        }
      }

      // 6. SPECIALIZED KARRA ANALYSIS (Career & Marriage)
      if (window.KARRA_ANALYSIS) {
        await showProgress('Performing Specialized Predictions...');
        const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
        const asc = window.CURRENT_ASCENDANT || 0;
        const nakshatras = {};
        if (window.getNakshatra) {
          Object.entries(d1).forEach(([p, v]) => { if (v && v.longitude !== undefined) nakshatras[p] = window.getNakshatra(v.longitude); });
          nakshatras.Ascendant = window.getNakshatra(asc);
        }

        const career = window.KARRA_ANALYSIS.getCareerPromise(d1, asc, nakshatras);
        if (career) html += renderKarraCareerSection(career);

        const age = targetDate.getFullYear() - birthDate.getFullYear();
        const timing = window.KARRA_ANALYSIS.getMarriageTiming(birthDate, window.BIRTH_ASC?.sn || 0, age);
        if (timing) html += renderMarriageTimingSection(timing);
      }

      // 7. SUDARSHAN CHAKRA INFO
      html += renderSudarshanChakraInfoSection();
    }
    
    // Check Natal Sahams (Only if explicitly checked and NOT already rendered in Varshaphala above)
    const chkSahams = document.getElementById('chkCalculateSahams');
    const isTushar = (mode === 'tushar');
    if (isTushar && window.CALCULATE_SAHAMS) {
      // In Tushar mode, we already handled Varshaphala Sahams potentially? 
      // No, let's keep Tushar mode simple or integrated.
    }
    
    await showProgress('Rendering Prediction Dashboard...');
    content.innerHTML = window.I18N ? window.I18N.t(html) : html;
    clearProgress();
    console.log('✅ Predictions display updated');
  } catch (err) {
    clearProgress();
    console.error('❌ Error updating predictions:', err);
    content.innerHTML = `<div class="pred-item"><div class="pred-title">⚠️ Error</div><div class="pred-detail">${err.message}</div></div>`;
  }
}

/**
 * Render current dasha information section
 */
function renderCurrentDashaSection(dashaInfo) {
  if (!dashaInfo) return '';
  
  const formatDays = (days) => {
    if (days === undefined || days === null) return 'N/A';
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const m = Math.floor(days / 30.44);
      const d = Math.floor(days % 30.44);
      return `${m}m ${d}d`;
    }
    const y = Math.floor(days / 365.25);
    const m = Math.floor((days % 365.25) / 30.44);
    const d = Math.floor(days % 30.44);
    return `${y}y ${m}m ${d}d`;
  };

  const formatDate = (date) => {
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    return 'N/A';
  };
  
  return `
    <div class="pred-item">
      <div class="pred-title">📊 Current Dasha Status (Today)</div>
      <div class="pred-dasha">Vimshottari Cycle</div>
      <div class="pred-detail">
        <strong>Mahadasha:</strong> ${dashaInfo.mahadasha?.lord || 'N/A'} 
        <span style="float:right;font-family:'Courier New',monospace;font-size:9px;color:var(--muted);">
          ${formatDays(dashaInfo.daysRemainingInMD)} left
        </span>
      </div>
      <div class="pred-detail">
        <strong>Antardasha:</strong> ${dashaInfo.antardasha?.lord || 'N/A'}
        <span style="float:right;font-family:'Courier New',monospace;font-size:9px;color:var(--muted);">
          ${formatDays(dashaInfo.daysRemainingInAD)} left
        </span>
      </div>
      <div class="pred-detail">
        <strong>Pratyantar:</strong> ${dashaInfo.pratyantar?.lord || 'N/A'}
      </div>
      <div class="pred-detail">
        <strong>Sukshma:</strong> ${dashaInfo.sukshma?.lord || 'N/A'}
      </div>
      <div class="pred-detail">
        <strong>Prana:</strong> ${dashaInfo.prana?.lord || 'N/A'}
      </div>
      ${dashaInfo.yogini ? `
        <div class="pred-dasha" style="margin-top:6px;">Yogini Dasha</div>
        <div class="pred-detail">
          <strong>Current:</strong> ${dashaInfo.yogini?.lord || 'N/A'}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render dasha timeline section (upcoming changes)
 */
function renderDashaTimelineSection(timeline) {
  if (!timeline || timeline.length === 0) {
    return `<div class="pred-item"><div class="pred-detail" style="color:var(--muted);">No dasha changes in selected period</div></div>`;
  }
  
  let html = '<div class="pred-item"><div class="pred-title">📅 Upcoming Dasha Changes</div>';
  
  timeline.slice(0, 8).forEach(event => {
    const dateStr = typeof event.startDate === 'string' 
      ? event.startDate 
      : event.startDate?.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: '2-digit'}) || 'N/A';
    
    const title = event.type === 'Mahadasha' ? '✦' : event.type === 'Antardasha' ? '◆' : '▪';
    
    html += `
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(155,111,255,.15);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;font-size:10px;color:var(--text);">${title} ${event.lord}</span>
          <span class="pred-date">${dateStr}</span>
        </div>
        ${event.significance ? `<div style="font-size:9px;color:var(--muted);margin-top:2px;">${event.significance}</div>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Render suggested optimal dates section
 */
function renderOptimalDatesSection(optimalDates) {
  if (!optimalDates || optimalDates.length === 0) {
    return `<div class="pred-item"><div class="pred-detail" style="color:var(--muted);">No optimal dates found</div></div>`;
  }
  
  let html = '<div class="pred-item"><div class="pred-title">✨ Suggested Optimal Dates</div>';
  
  optimalDates.slice(0, 5).forEach(dateObj => {
    const dateStr = dateObj.date instanceof Date 
      ? dateObj.date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
      : dateObj.date;
    
    const score = Math.round(dateObj.favorabilityScore || 0);
    const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--gold)' : 'var(--amber)';
    
    html += `
      <div style="margin-top:8px;padding:8px;background:rgba(155,111,255,.05);border-radius:2px;border-left:3px solid var(--cyan);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="font-weight:700;font-size:10px;color:var(--cyan);">${dateStr}</span>
          <span class="pred-score">Score: ${score}%</span>
        </div>
        <div style="font-size:9px;color:var(--muted);">${dateObj.reason || 'Favorable planetary alignment'}</div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Render multi-chart analysis section
 */
function renderMultiChartAnalysisSection(analysis) {
  if (!analysis || analysis.length === 0) {
    return '';
  }
  
  let html = '<div class="pred-item"><div class="pred-title">🔍 Multi-Chart Analysis (D1)</div>';
  
  // Show current planets summary
  const strong = analysis.filter(p => {
    const status = p.status || '';
    return status.includes('Own') || status.includes('Exalt');
  });
  
  const weak = analysis.filter(p => {
    const status = p.status || '';
    return status.includes('Debilitated') || status.includes('Enemy');
  });
  
  if (strong.length > 0) {
    html += `<div style="margin-top:6px;">
      <span style="font-size:9px;color:var(--green);font-weight:700;">✓ Strong:</span> 
      <span style="font-size:10px;color:var(--text);">${strong.map(p => p.name).join(', ')}</span>
    </div>`;
  }
  
  if (weak.length > 0) {
    html += `<div style="margin-top:4px;">
      <span style="font-size:9px;color:var(--rose);font-weight:700;">✗ Weak:</span> 
      <span style="font-size:10px;color:var(--text);">${weak.map(p => p.name).join(', ')}</span>
    </div>`;
  }
  
  html += `<div style="margin-top:6px;font-size:9px;color:var(--muted);padding-top:6px;border-top:1px solid rgba(155,111,255,.15);">
    Total planets: ${analysis.length} | Chart: D1 Rasi
  </div></div>`;
  
  return html;
}

/**
 * Render Detailed Astrology Knowledge Section
 */
function renderAstrologyKnowledgeSection() {
  if (typeof window.getAstrologyInsight !== 'function') return '';
  const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
  const houses = window.CURRENT_HOUSES || {};
  if (!Object.keys(d1).length || !Object.keys(houses).length) return '';

  let html = '<div class="pred-item" style="border-left: 3px solid var(--amber); background: rgba(255, 155, 58, 0.05);">';
  html += '<div class="pred-title" style="color:var(--amber);">📚 Deep Astrological Insights</div>';
  
  // Basic rendering of planets in houses
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  let foundInsights = false;
  
  planets.forEach(p => {
    const loc = Object.values(houses).find(h => h.planets && h.planets.includes(p));
    if (loc && loc.house) {
      const insight = window.getAstrologyInsight('planet_in_house', `${p}_${loc.house}`);
      if (insight) {
        foundInsights = true;
        html += `
          <div style="margin-top:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:3px;">
            <div style="font-weight:700; font-size:10px; color:var(--text); margin-bottom:2px;">${insight.title}</div>
            <div contenteditable="plaintext-only" spellcheck="false" title="Click to edit" onblur="window.savePredictionOverride('${insight.key || mandiInsight?.key}', this.innerText)" style="font-size:9.5px; color:var(--muted); line-height:1.4; outline:none; border-bottom:1px dashed transparent; transition:all 0.2s; padding:2px; cursor:text;" onfocus="this.style.borderBottom='1px dashed var(--cyan)'; this.style.color='var(--text)'; this.style.background='rgba(255,255,255,0.05)';" onblur="this.style.borderBottom='1px dashed transparent'; this.style.color='var(--muted)'; this.style.background='transparent'; window.savePredictionOverride('${insight?.key || mandiInsight?.key}', this.innerText)">${insight?.description || mandiInsight?.description}</div>
          </div>
        `;
      }
    }
  });

  // Basic check for conjunctions mapping
  const houseVals = Object.values(houses).filter(h => h.planets && h.planets.length > 1);
  houseVals.forEach(h => {
    if (h.planets.length === 2) {
      const insight1 = window.getAstrologyInsight('conjunction', `${h.planets[0]}_${h.planets[1]}`);
      const insight2 = window.getAstrologyInsight('conjunction', `${h.planets[1]}_${h.planets[0]}`);
      const insight = insight1 || insight2;
      if (insight) {
        foundInsights = true;
        html += `
          <div style="margin-top:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:3px; border-left:2px solid var(--violet);">
            <div style="font-weight:700; font-size:10px; color:var(--violet); margin-bottom:2px;">${insight.title}</div>
            <div contenteditable="plaintext-only" spellcheck="false" title="Click to edit" onblur="window.savePredictionOverride('${insight.key || mandiInsight?.key}', this.innerText)" style="font-size:9.5px; color:var(--muted); line-height:1.4; outline:none; border-bottom:1px dashed transparent; transition:all 0.2s; padding:2px; cursor:text;" onfocus="this.style.borderBottom='1px dashed var(--cyan)'; this.style.color='var(--text)'; this.style.background='rgba(255,255,255,0.05)';" onblur="this.style.borderBottom='1px dashed transparent'; this.style.color='var(--muted)'; this.style.background='transparent'; window.savePredictionOverride('${insight?.key || mandiInsight?.key}', this.innerText)">${insight?.description || mandiInsight?.description}</div>
          </div>
        `;
      }
    } else if (h.planets.length === 3) {
      const insight = window.getAstrologyInsight('conjunction', `Three_Planets`);
      if(insight) {
        html += `
          <div style="margin-top:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:3px; border-left:2px solid var(--violet);">
            <div style="font-weight:700; font-size:10px; color:var(--violet); margin-bottom:2px;">${h.planets.join(', ')} (3 Planet Conjunction in H${h.house})</div>
            <div contenteditable="plaintext-only" spellcheck="false" title="Click to edit" onblur="window.savePredictionOverride('${insight.key || mandiInsight?.key}', this.innerText)" style="font-size:9.5px; color:var(--muted); line-height:1.4; outline:none; border-bottom:1px dashed transparent; transition:all 0.2s; padding:2px; cursor:text;" onfocus="this.style.borderBottom='1px dashed var(--cyan)'; this.style.color='var(--text)'; this.style.background='rgba(255,255,255,0.05)';" onblur="this.style.borderBottom='1px dashed transparent'; this.style.color='var(--muted)'; this.style.background='transparent'; window.savePredictionOverride('${insight?.key || mandiInsight?.key}', this.innerText)">${insight?.description || mandiInsight?.description}</div>
          </div>
        `;
      }
    } else if (h.planets.length >= 4) {
      const insight = window.getAstrologyInsight('conjunction', `Four_Planets`);
      if(insight) {
        html += `
          <div style="margin-top:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:3px; border-left:2px solid var(--violet);">
            <div style="font-weight:700; font-size:10px; color:var(--violet); margin-bottom:2px;">${h.planets.join(', ')} (${h.planets.length} Planet Conjunction)</div>
            <div contenteditable="plaintext-only" spellcheck="false" title="Click to edit" onblur="window.savePredictionOverride('${insight.key || mandiInsight?.key}', this.innerText)" style="font-size:9.5px; color:var(--muted); line-height:1.4; outline:none; border-bottom:1px dashed transparent; transition:all 0.2s; padding:2px; cursor:text;" onfocus="this.style.borderBottom='1px dashed var(--cyan)'; this.style.color='var(--text)'; this.style.background='rgba(255,255,255,0.05)';" onblur="this.style.borderBottom='1px dashed transparent'; this.style.color='var(--muted)'; this.style.background='transparent'; window.savePredictionOverride('${insight?.key || mandiInsight?.key}', this.innerText)">${insight?.description || mandiInsight?.description}</div>
          </div>
        `;
      }
    }
  });

  // Display advanced concepts dynamically
  const mandiInsight = window.getAstrologyInsight('advanced', 'Mandi');
  if (mandiInsight) {
    foundInsights = true;
    html += `
      <div style="margin-top:8px; border-top:1px dashed var(--border3); padding-top:6px;">
        <div style="font-weight:700; font-size:9px; color:var(--text);">${mandiInsight.title}</div>
        <div contenteditable="plaintext-only" spellcheck="false" title="Click to edit" onblur="window.savePredictionOverride('${mandiInsight.key}', this.innerText)" style="font-size:9px; color:var(--muted); line-height:1.4; outline:none; border-bottom:1px dashed transparent; transition:all 0.2s; padding:2px; cursor:text;" onfocus="this.style.borderBottom='1px dashed var(--cyan)'; this.style.color='var(--text)'; this.style.background='rgba(255,255,255,0.05)';" onblur="this.style.borderBottom='1px dashed transparent'; this.style.color='var(--muted)'; this.style.background='transparent'; window.savePredictionOverride('${mandiInsight.key}', this.innerText)">${mandiInsight.description}</div>
      </div>
    `;
  }
  
  if (!foundInsights) return '';
  html += '</div>';
  return html;
}

/**
 * Helper: Format date to ISO format (YYYY-MM-DD)
 */
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Helper: Format date for display
 */
function formatDateDisplay(date) {
  if (typeof date === 'string') return date;
  if (!(date instanceof Date)) return 'N/A';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Initialize when document is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initPredictionsUI();
  }, 500);
});

// Auto-initialize if doc is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  setTimeout(() => {
    initPredictionsUI();
  }, 500);
}

/**
 * Render Sahams Section
 */
function renderSahamsSection(sahams, isDayBirth) {
  if (!sahams || sahams.length === 0) return '';
  
  const targetDate = PREDICTIONS_UI.currentStartDate || new Date();
  
  let html = `<div class="pred-item"><div class="pred-title">❇ Tajaka Sahams (Life Events)</div>
    <div style="font-size:9px;color:var(--muted);margin-bottom:8px;">Math model: ${isDayBirth ? 'Day Birth' : 'Night Birth'} Rules | Target: ${formatDateDisplay(targetDate)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
    <style>@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }</style>`;
    
  sahams.forEach(s => {
    const activations = window.GET_SAHAM_ACTIVATIONS ? window.GET_SAHAM_ACTIVATIONS(s.degree, targetDate) : [];
    const checkActive = window.IS_SAHAM_ACTIVE ? window.IS_SAHAM_ACTIVE(s.degree, targetDate) : {active:false};
    
    let moonAct = 'N/A';
    let sunAct = 'N/A';
    const isActivated = checkActive.active;

    activations.forEach(a => {
        if (!a.date) return;
        const d = a.date;
        if (a.body === 'Moon') {
            moonAct = d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
        }
        if (a.body === 'Sun') {
            sunAct = d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'2-digit'});
        }
    });

    const baseColor = s.color || '#007BFF';
    
    // Create an rgba version of the hex color for backgrounds
    let bgOpacity = 0.05, borderOpacity = 0.3;
    let r = 0, g = 123, b = 255; 
    if (baseColor.startsWith('#')) {
        const hex = baseColor.replace('#', '');
        if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    }
    
    let bg = isActivated ? 'rgba(255, 193, 7, 0.2)' : `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
    let border = isActivated ? '#FFC107' : `rgba(${r}, ${g}, ${b}, ${borderOpacity})`;
    let titleColor = isActivated ? '#FFC107' : baseColor;
    let indicator = isActivated ? `<span style="color:#FFC107; font-size:10px; margin-left:5px; animation: blink 1s infinite;">🔥 ACTIVE (${checkActive.body})</span>` : '';

    html += `
      <div style="padding:4px 6px; background:${bg}; border:1px solid ${border}; border-radius:3px; box-shadow: ${isActivated ? '0 0 5px rgba(255,193,7,0.3)' : 'none'};">
        <div style="font-weight:700;font-size:10px;color:${titleColor};margin-bottom:2px;">
            ${s.name} ${indicator} <span style="font-size:8px; float:right; font-weight:normal; opacity:0.8;">${s.topic || 'Saham'}</span>
        </div>
        <div style="font-size:8px; color:var(--muted); margin-bottom:2px; font-style:italic;">Formula: ${s.formula}</div>
        <div style="font-size:9px; color:var(--text); margin-bottom:4px; font-family:monospace; background:rgba(0,0,0,0.2); padding:2px; border-radius:2px;">
          Derivation: ${s.calcDetails}
        </div>
        <div style="font-family:'Courier New',monospace;font-size:9px; color:var(--gold); font-weight:700;">
          Result: ${s.degree.toFixed(2)}° | ${s.sign} ${s.signDegree.toFixed(2)}° (House ${s.house})
        </div>
        <div style="margin-top:4px; font-size:8px; color:var(--cyan);">
          📅 <strong>Forecast:</strong> Moon: ${moonAct} | Sun: ${sunAct}
        </div>
      </div>
    `;
  });
  
  html += '</div></div>';
  return html;
}
/**
 * Render Varshaphala (Solar Return) Section
 */
function renderVarshaphalaSection(v) {
  const chartId = `varshaChart_${v.year}_${Math.floor(Math.random()*1000)}`;
  setTimeout(() => drawChartInPredictionPanel(chartId, v.planets, v.asc), 250);
  const dateStr = v.dateInfo ? `${v.dateInfo.day}/${v.dateInfo.month}/${v.dateInfo.year} ${Math.floor(v.dateInfo.hour)}:${Math.floor((v.dateInfo.hour*60)%60).toString().padStart(2,'0')}` : 'Calculating...';
  
  return `
    <div class="pred-item" style="border-left: 3px solid var(--gold); background: rgba(255, 215, 0, 0.05);">
      <div class="pred-title" style="color:var(--gold);">📅 Varshaphala (Solar Return: ${v.year})</div>
      <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:5px;">${dateStr}</div>
      
      <div style="margin: 10px 0; text-align: center;">
        <canvas id="${chartId}" style="max-width:200px; border:1px solid var(--border3); border-radius:4px;"></canvas>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:6px;">
        <div class="pred-detail"><strong>Year Lord:</strong> ${v.yearLord}</div>
        <div class="pred-detail"><strong>Muntha:</strong> ${v.muntha.house}H (${v.muntha.sign})</div>
        <div class="pred-detail"><strong>Muntha Lord:</strong> ${v.muntha.lord}</div>
      </div>
      <div style="font-size:9px; color:var(--cyan); font-family:monospace; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:4px; border-radius:2px; text-align:center;">
        Formula: Muntha House = (Natal Ascendant Sign + Age in Years) % 12
      </div>
      <div class="pred-detail" style="color:var(--text); line-height:1.4; font-size:10px; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
        ${v.analysis}
      </div>
      <div style="font-size:9px;color:var(--muted);margin-top:8px;font-style:italic;">
        Solar Return Date: ${formatJD(v.varshapraveshJD)}
      </div>
    </div>
  `;
}

/**
 * Format JD to localized date string
 */
function formatJD(jdValue) {
    if (!jdValue) return 'N/A';
    // JD to Unix Epoch: (JD - 2440587.5) * 86400000
    const unix = (jdValue - 2440587.5) * 86400000;
    return new Date(unix).toLocaleString();
}

/**
 * Render Karra Career Section
 */
function renderKarraCareerSection(career) {
  if (!career || typeof career === 'string') return '';
  return `
    <div class="pred-item" style="border-left: 3px solid var(--cyan); background: rgba(0, 255, 255, 0.05);">
      <div class="pred-title" style="color:var(--cyan);">💼 Career Promise (Karra Method)</div>
      <div class="pred-detail" style="margin-bottom:5px;"><strong>Key Planet at Birth:</strong> ${career.planetAtBirth}</div>
      <div class="pred-detail" style="font-weight:700; color:var(--green); font-size:11px; margin-bottom:8px;">${career.conclusion}</div>
      <div style="font-size:10px; color:var(--muted); line-height:1.3;">
        ${career.details.map(d => `<div style="margin-bottom:3px;">• ${d}</div>`).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Marriage Timing Section
 */
function renderMarriageTimingSection(timing) {
  if (!timing || !timing.windows || !timing.windows.length) return '';
  
  // For Sudarshan Chakra Chart, we use the combined Lagna, Moon, Sun
  setTimeout(() => {
    const p = window.BIRTH_PLANETS || {};
    const asc = window.BIRTH_ASC || {};
    drawSudarshanChakraInPanel('scChartCanvas', p, asc);
  }, 100);

  return `
    <div class="pred-item" style="border-left: 3px solid var(--rose); background: rgba(255, 68, 119, 0.05);">
      <div class="pred-title" style="color:var(--rose);">♥ Marriage Timing (SCD Method)</div>
      
      <div style="margin: 10px 0; text-align: center;">
        <canvas id="scChartCanvas" style="max-width:200px; border:1px solid var(--border3); border-radius:4px;"></canvas>
      </div>

      <div style="font-size:9px; color:var(--muted); margin-bottom:8px;">Analyzing Sudarshan Chakra Dasa (SCD) for marriage house confluence.</div>
      <div style="max-height:150px; overflow-y:auto; padding-right:5px;">
        ${timing.windows.slice(0, 15).map(w => `
          <div style="margin-bottom:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:3px; border-right:2px solid var(--rose);">
            <div style="font-size:10px; color:var(--text); font-weight:700;">${w.period}</div>
            <div style="display:flex; justify-content:space-between; font-size:9px;">
              <span style="color:var(--muted);">MD: ${w.mdHouse} / AD: ${w.adHouse}</span>
              <span style="color:var(--rose);">Potential</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Sudarshan Chakra Info Section
 */
function renderSudarshanChakraInfoSection() {
  return `
    <div class="pred-item" style="border-left: 3px solid var(--violet); background: rgba(155, 111, 255, 0.05);">
      <div class="pred-title" style="color:var(--violet);">☸ Sudarshan Chakra Insights</div>
      <div class="pred-detail" style="font-size:10px; color:var(--muted); line-height:1.4;">
        The Sudarshan Chakra is the combined wheel of Lagna, Moon, and Sun. Karra's method uses the 
        Lagna Inclination for precise timing of life-defining events.
      </div>
    </div>
  `;
}
/**
 * Render Natal Degrees Section (D1, D9, D10 etc)
 */
function renderNatalDegreesSection() {
  const vargas = [1, 9, 10]; // Primary ones for display
  let html = `
    <div class="pred-item" style="border-left: 3px solid var(--cyan); background: rgba(0, 255, 255, 0.05);">
      <div class="pred-title" style="color:var(--cyan);">📍 Natal Degrees & Divisional Charts</div>
      <div style="overflow-x:auto; margin-top:8px;">
        <table style="width:100%; font-size:9px; color:var(--text); border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid var(--border); color:var(--muted);">
              <th style="text-align:left; padding:4px;">Planet</th>
              <th style="padding:4px;">D1 (Sidereal)</th>
              <th style="padding:4px;">D9 (Navamsa)</th>
              <th style="padding:4px;">D10 (Dasamsa)</th>
            </tr>
          </thead>
          <tbody>
  `;

  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const data = window.BIRTH_PLANETS || {};
  const asc = window.BIRTH_ASC || {};

  // Add Ascendant
  const ascSign = asc.sign || (asc.sid !== undefined ? SIGNS[Math.floor(asc.sid/30)] : 'N/A');
  html += `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
       <td style="padding:4px; color:var(--gold);">Ascendant</td>
       <td style="text-align:center; padding:4px;">${asc.sid !== undefined ? fmtDeg(asc.sid) : 'N/A'}</td>
       <td style="text-align:center; padding:4px;">${ascSign.substring(0,3)}</td>
       <td style="text-align:center; padding:4px;">-</td>
    </tr>
  `;

  planets.forEach(p => {
    const v = data[p];
    if (!v) {
       // Try current planetary positions if birth planets not set
       const backup = window.CURRENT_PLANETARY_POSITIONS?.[p];
       if (!backup) return;
       const d1lon = backup.longitude || 0;
       const d9 = divLon(d1lon, 9);
       const d10 = divLon(d1lon, 10);
       html += `
         <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
           <td style="padding:4px;">${p}</td>
           <td style="text-align:center; padding:4px;">${fmtDeg(d1lon)}</td>
           <td style="text-align:center; padding:4px;">${SIGNS[Math.floor(d9/30)].substring(0,3)} ${(d9%30).toFixed(0)}°</td>
           <td style="text-align:center; padding:4px;">${SIGNS[Math.floor(d10/30)].substring(0,3)} ${(d10%30).toFixed(0)}°</td>
         </tr>
       `;
       return;
    }
    const dlon = v.sid || v.dlon || 0;
    const d9 = divLon(dlon, 9);
    const d10 = divLon(dlon, 10);
    const sign9 = window.SIGNS ? window.SIGNS[Math.floor(d9/30)] : '???';
    const sign10 = window.SIGNS ? window.SIGNS[Math.floor(d10/30)] : '???';
    
    // Calculate Shadbala if available
    const shad = window.SHADBALA ? window.SHADBALA.calculate(p, window.BIRTH_PLANETS || window.CURRENT_PLANETARY_POSITIONS, window.BIRTH_ASC) : null;
    const shadLabel = shad ? `<br/><span style="color:var(--gold);font-size:7px;">${shad.level} (${shad.total.toFixed(0)})</span>` : '';

    html += `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:4px;">${p}${shadLabel}</td>
        <td style="text-align:center; padding:4px;">${dlon.toFixed(2)}° (${fmtDeg(dlon)})</td>
        <td style="text-align:center; padding:4px;">${sign9.substring(0,3)} ${(d9%30).toFixed(0)}°</td>
        <td style="text-align:center; padding:4px;">${sign10.substring(0,3)} ${(d10%30).toFixed(0)}°</td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;
  return html;
}

/**
 * Format degree to DMS string
 */
function fmtDeg(deg) {
  const d = Math.floor(deg % 30);
  const m = Math.floor(((deg % 30) - d) * 60);
  const sign = SIGNS[Math.floor(deg / 30)] || '??';
  return `${sign.substring(0,3)} ${d}°${m}'`;
}

/**
 * Divisional Longitude Calculation (Simple proportional)
 */
function divLon(lon, div) {
  return (lon * div) % 360;
}

/**
 * Draw a mini chart in the prediction panel (Rasi style)
 */
function drawChartInPredictionPanel(cvId, planets, asc) {
  const cv = document.getElementById(cvId);
  if (!cv) return;
  const S = 200;
  cv.width = S * 2; cv.height = S * 2;
  cv.style.width = S + 'px'; cv.style.height = S + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(2, 2);
  
  ctx.fillStyle = '#050510'; ctx.fillRect(0,0,S,S);
  ctx.strokeStyle = '#282860'; ctx.lineWidth = 1;
  ctx.strokeRect(5,5,S-10,S-10);
  
  // Draw diagonals
  ctx.beginPath();
  ctx.moveTo(5,5); ctx.lineTo(S-5,S-5);
  ctx.moveTo(S-5,5); ctx.lineTo(5,S-5);
  ctx.moveTo(S/2,5); ctx.lineTo(5,S/2);
  ctx.moveTo(5,S/2); ctx.lineTo(S/2,S-5);
  ctx.moveTo(S/2,S-5); ctx.lineTo(S-5,S/2);
  ctx.moveTo(S-5,S/2); ctx.lineTo(S/2,5);
  ctx.stroke();

  if(!planets || !asc) return;
  const lagnaLon = asc.sid !== undefined ? asc.sid : (asc.longitude || 0);
  const lSign = Math.floor(lagnaLon/30) + 1;
  
  const houseCoords = [
    {x:S/2, y:S/4}, {x:S/4, y:S/8}, {x:S/8, y:S/4}, {x:S/4, y:S/2},
    {x:S/8, y:3*S/4}, {x:S/4, y:7*S/8}, {x:S/2, y:3*S/4}, {x:3*S/4, y:7*S/8},
    {x:7*S/8, y:3*S/4}, {x:3*S/4, y:S/2}, {x:7*S/8, y:S/4}, {x:3*S/4, y:S/8}
  ];

  // Draw house numbers
  ctx.font = '8px Arial'; ctx.fillStyle = '#50508A';
  houseCoords.forEach((c, i) => {
    const s = ((lSign + i - 1) % 12) + 1;
    ctx.fillText(s, c.x-3, c.y-10);
  });
  
  // Draw planets
  ctx.fillStyle = '#D0D0EE'; ctx.font = '7px Arial';
  const occupants = Array(12).fill().map(() => []);
  occupants[0].push('As');

  Object.entries(planets).forEach(([name, data]) => {
     const lon = data.sid !== undefined ? data.sid : (data.longitude || 0);
     const h = (Math.floor(lon/30) - (lSign - 1) + 12) % 12;
     occupants[h].push(name.substring(0,2));
  });

  houseCoords.forEach((c, i) => {
    occupants[i].forEach((p, pi) => {
      ctx.fillText(p, c.x - 8, c.y + pi*8);
    });
  });
}

/**
 * Draw Sudarshan Chakra (3 circles)
 */
function drawSudarshanChakraInPanel(cvId, planets, asc) {
  const cv = document.getElementById(cvId);
  if (!cv) return;
  const S = 200;
  cv.width = S * 2; cv.height = S * 2;
  cv.style.width = S + 'px'; cv.style.height = S + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(2, 2);
  
  ctx.fillStyle = '#050510'; ctx.fillRect(0,0,S,S);
  ctx.strokeStyle = '#282860'; ctx.lineWidth = 1;
  const CX = S/2, CY = S/2;

  // 3 Circles
  [30, 50, 70].forEach(r => {
    ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI*2); ctx.stroke();
  });

  // 12 spokes
  for(let i=0; i<12; i++) {
    const ang = i * 30 * Math.PI/180;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(ang)*30, CY + Math.sin(ang)*30);
    ctx.lineTo(CX + Math.cos(ang)*90, CY + Math.sin(ang)*90);
    ctx.stroke();
  }

  // Label Houses
  ctx.font = '8px Arial'; ctx.fillStyle = '#50508A';
  for(let i=0; i<12; i++) {
    const ang = (i*30 + 15) * Math.PI/180;
    ctx.fillText(i+1, CX + Math.cos(ang)*82 - 3, CY + Math.sin(ang)*82 + 3);
  }

  // Draw Planets (simplified: just marks)
  const sunLon = planets.Sun?.sid || 0;
  const moonLon = planets.Moon?.sid || 0;
  const lagnaLon = asc.sid || 0;

  const drawP = (lon, r, color) => {
    const ang = (lon - 90) * Math.PI/180;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(CX + Math.cos(ang)*r, CY + Math.sin(ang)*r, 2, 0, Math.PI*2); ctx.fill();
  };

  drawP(lagnaLon, 40, '#3AF0FF');
  drawP(moonLon, 60, '#FFFFFF');
  drawP(sunLon, 80, '#FF9B3A');
}

/**
 * Render Grouped Saham Analysis
 */
function renderGroupedSahamAnalysis(sahams) {
  const getS = (slug) => sahams.find(s => s.slug === slug);
  const groups = [
    {
      title: "💼 Career & Public Life",
      color: "var(--cyan)",
      items: [
        { s: getS('Raj'), text: "Rajya Saham (Power/Status): Located in house {H}. Indicates that status is tied to personal charisma." },
        { s: getS('Kar'), text: "Karma Saham (Profession): Located in house {H}. Indicates unconventional or challenging path." },
        { s: getS('Yas'), text: "Yash Saham (Fame): Located in house {H}. Predicts widespread recognition." }
      ]
    },
    {
      title: "💰 Wealth & Finance",
      color: "var(--gold)",
      items: [
        { s: getS('Art'), text: "Artha Saham (Wealth): House {H}. Profit through partnerships and business." },
        { s: getS('Lab'), text: "Labha Saham (Gains): House {H}. Significant gains via real estate or family." },
        { s: getS('Dar'), text: "Daridra Saham (Poverty): House {H}. Risk of loss if risks are too high." }
      ]
    },
    {
      title: "♥ Relationships & Family",
      color: "var(--rose)",
      items: [
        { s: getS('Viv'), text: "Vivaha Saham (Marriage): House {H}. Marriage theme: Duty and family seriousness." },
        { s: getS('Put'), text: "Putra Saham (Children): House {H}. Children theme: Responsibility and delay." }
      ]
    }
  ];

  let html = `<div class="pred-title" style="margin-top:20px; color:var(--violet); padding-left:15px; font-size:11px;">📜 Grouped Life Analysis (Saham Method)</div>`;

  groups.forEach(g => {
    html += `
      <div class="pred-item" style="border-left: 3px solid ${g.color}; background: rgba(0,0,0,0.2);">
        <div class="pred-title" style="color:${g.color}; font-size:10px;">${g.title}</div>
        <div style="font-size:10px; color:var(--text); line-height:1.4;">
    `;
    g.items.forEach(it => {
      if (!it.s) return;
      let desc = it.text.replace('{H}', it.s.house).replace('{C}', it.s.sign);
      html += `<div style="margin-bottom:6px;">• <strong>${it.s.name}:</strong> ${desc}</div>`;
    });
    html += `</div></div>`;
  });

  return html;
}

/**
 * Render Daily Combinations
 */
function renderDailyCombinationsSection(date) {
  if (!date || (typeof getPos !== 'function')) return '';
  let pos;
  try {
    pos = getPos(date);
  } catch(e) {
    return '';
  }
  if (!pos) return '';

  const moonNak = pos.Moon?.nak || 'Unknown';
  const moonPada = pos.Moon?.pada || 1;
  const sunNak = pos.Sun?.nak || 'Unknown';

  let html = `
    <div class="pred-item" style="border-left: 3px solid var(--cyan); background: rgba(58, 240, 255, 0.05); margin-bottom:15px;">
      <div class="pred-title" style="color:var(--cyan);">📅 Daily Preview: ${formatDateDisplay(date)}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; font-size:10px; color:var(--text); margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid rgba(58, 240, 255, 0.2);">
        <div><strong style="color:var(--cyan);">Moon:</strong> ${pos.Moon?.sn ? SIGNS[pos.Moon.sn] : ''} - ${moonNak} (Pada ${moonPada})</div>
        <div><strong style="color:var(--gold);">Sun:</strong> ${pos.Sun?.sn ? SIGNS[pos.Sun.sn] : ''} - ${sunNak}</div>
      </div>
  `;

  // Active Sahams today
  if (window.BIRTH_SAHAMS && Array.isArray(window.BIRTH_SAHAMS)) {
    const todayTarget = new Date(date);
    todayTarget.setHours(0,0,0,0);
    const todayNum = todayTarget.getTime();
    
    const activeSahams = window.BIRTH_SAHAMS.map(s => {
      const activeInfo = window.IS_SAHAM_ACTIVE ? window.IS_SAHAM_ACTIVE(s.degree, todayTarget) : {active:false};
      return activeInfo.active ? { ...s, activeInfo } : null;
    }).filter(x => x !== null);

    if (activeSahams.length > 0) {
      html += `<div style="font-size:9px; color:var(--amber); font-weight:bold; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">🔥 Currently Active Sahams:</div>`;
      activeSahams.forEach(s => {
        const body = s.activeInfo.body;
        const pColor = body === 'Moon' ? 'var(--cyan)' : 'var(--gold)';
        html += `<div style="margin-left:5px; font-size:9.5px; color:var(--text); margin-bottom:5px; padding:3px 6px; background:rgba(255,193,7,0.1); border-left:2px solid var(--amber); border-radius:2px;">
          • <strong style="color:${s.color||'var(--text)'}">${s.name}</strong> 
          <span style="font-size:8px; opacity:0.8;">(${s.topic})</span>
          <br/>
          <span style="color:var(--muted);font-size:8px;">Activated by transit <strong style="color:${pColor}">${body}</strong> (Orb: ${s.activeInfo.orb.toFixed(2)}°)</span>
        </div>`;
      });
    } else {
      html += `<div style="font-size:9px; color:var(--muted); font-style:italic;">No major Saham points are being triggered by Sun/Moon transits today.</div>`;
    }
  }

  html += `</div>`;
  return html;
}

/**
 * Shift Prediction Date by a specified delta and unit
 */
window.shiftPredDate = function(delta, unit) {
  const startInp = document.getElementById('pred-start');
  const endInp = document.getElementById('pred-end');
  
  if (!startInp || !endInp || !startInp.value || !endInp.value) {
    alert("Please select a valid date range first!");
    return;
  }
  
  let sDate = new Date(startInp.value + 'T00:00:00');
  let eDate = new Date(endInp.value + 'T00:00:00');
  
  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) return;
  
  let shiftDays = 0;
  if (unit === 'day') shiftDays = 1;
  if (unit === 'week') shiftDays = 7;
  if (unit === 'month') {
    sDate.setMonth(sDate.getMonth() + delta);
    eDate.setMonth(eDate.getMonth() + delta);
  } else if (unit === 'year') {
    sDate.setFullYear(sDate.getFullYear() + delta);
    eDate.setFullYear(eDate.getFullYear() + delta);
  } else {
    sDate.setDate(sDate.getDate() + (delta * shiftDays));
    eDate.setDate(eDate.getDate() + (delta * shiftDays));
  }
  
  startInp.value = sDate.toISOString().split('T')[0];
  endInp.value = eDate.toISOString().split('T')[0];
  
  // Sync global centerDate used by the transit charts so visualization updates
  if (typeof window.centerDate !== 'undefined') {
      window.centerDate = new Date(sDate.getTime());
      window.centerDate.setHours(12,0,0,0); // Avoid timezone shift bugs
      
      const tdateInp = document.getElementById('tDate');
      if (tdateInp) tdateInp.value = sDate.toISOString().split('T')[0];
      
      if (typeof window.renderAll === 'function') {
          window.renderAll();
      }
  }

  const btnUpdatePredictions = document.getElementById('btnUpdatePredictions');
  if (btnUpdatePredictions) {
      btnUpdatePredictions.click();
  }
};

