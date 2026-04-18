/**
 * Prediction Dashboard UI
 * Render and manage predictions interface
 */

window.PREDICTIONS_UI = window.PREDICTIONS_UI || {
  currentStartDate: null,
  currentEndDate: null,
  initialized: false
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
    
    if (mode === 'tushar' && window.TUSHAR_ROY) {
      await showProgress('Analyzing Natal Horoscope (Tushar Roy)...');
      const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
      const d9 = window.CURRENT_NAVAMSHA_POSITIONS || null;
      const asc = window.CURRENT_ASCENDANT || 0;
      const houses = window.CURRENT_HOUSES || {};
      
      html += '<h3 style="color:var(--text);border-bottom:1px solid var(--border);padding-bottom:5px;">1. Tushar Roy Predictions (Natal Chart)</h3>';
      html += window.TUSHAR_ROY.analyze(d1, houses, asc, d9);
      
      if (window.VARSHAPHALA) {
         await showProgress('Calculating Solar Return (Varshaphala)...');
         const currentYear = new Date().getFullYear();
         const vChart = window.VARSHAPHALA.castAnnualChart(currentYear);
         if (vChart) {
            await showProgress('Analyzing Varshaphala Predictions...');
            html += '<h3 style="color:var(--gold);margin-top:20px;border-bottom:1px solid var(--gold);padding-bottom:5px;">2. Tushar Roy Predictions (Varshaphala ' + currentYear + ')</h3>';
            html += window.TUSHAR_ROY.analyze(vChart.planets, null, vChart.asc, vChart.d9Planets || null);
         }
      }
    } else {
      await showProgress('Loading forecasting modules...');
      // 1. CURRENT DASHA INFO
      const dashaInfo = PREDICTION_FORECASTING.getCurrentDashaInfo();
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
    }
    
    // Check Sahams
    const chkSahams = document.getElementById('chkCalculateSahams');
    if ((chkSahams && chkSahams.checked && window.CALCULATE_SAHAMS) || (mode === 'tushar' && window.CALCULATE_SAHAMS)) {
      await showProgress('Calculating Tajaka Sahams (Life Events)...');
      const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
      const asc = window.CURRENT_ASCENDANT || 0;
      const houses = window.CURRENT_HOUSES || {};
      
      const pDegs = {};
      for (const [k, v] of Object.entries(d1)) {
        if (v && v.longitude !== undefined) pDegs[k] = v.longitude;
      }
      
      const sunDeg = pDegs['Sun'] || 0;
      const diff = ((asc - (sunDeg % 360)) + 360) % 360;
      const isDayBirth = (diff > 0 && diff < 180);
      
      const sahams = window.CALCULATE_SAHAMS(pDegs, asc, isDayBirth, houses);
      
      if (mode === 'tushar') {
         html += '<h3 style="color:#007BFF;margin-top:20px;border-bottom:1px solid #007BFF;padding-bottom:5px;">3. Tajaka Sahams (Calculated Events)</h3>';
      }
      
      // Add Planet Reference Table
      html += `
        <div class="pred-item" style="background:rgba(0,0,0,0.2); border:1px dashed var(--muted);">
          <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-bottom:5px;">Reference: Planet Longitudes (Absolute)</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:5px; font-family:monospace; font-size:9px;">
            ${Object.entries(pDegs).map(([p, deg]) => `<div>${p}: ${deg.toFixed(4)}°</div>`).join('')}
            <div>Asc: ${asc.toFixed(4)}°</div>
          </div>
        </div>
      `;
      
      html += renderSahamsSection(sahams, isDayBirth);
    }
    
    await showProgress('Rendering Prediction Dashboard...');
    content.innerHTML = html;
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
          ${dashaInfo.daysRemainingInMD || 'N/A'} days left
        </span>
      </div>
      <div class="pred-detail">
        <strong>Antardasha:</strong> ${dashaInfo.antardasha?.lord || 'N/A'}
        <span style="float:right;font-family:'Courier New',monospace;font-size:9px;color:var(--muted);">
          ${dashaInfo.daysRemainingInAD || 'N/A'} days left
        </span>
      </div>
      <div class="pred-detail">
        <strong>Pratyantar:</strong> ${dashaInfo.pratyantar?.lord || 'N/A'}
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
  
  let html = `<div class="pred-item"><div class="pred-title">❇ Tajaka Sahams (Life Events)</div>
    <div style="font-size:9px;color:var(--muted);margin-bottom:8px;">Math model: ${isDayBirth ? 'Day Birth' : 'Night Birth'} Rules applied</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">`;
    
  sahams.forEach(s => {
    html += `
      <div style="padding:4px 6px; background:rgba(0,123,255,0.05); border:1px solid rgba(0,123,255,0.3); border-radius:3px;">
        <div style="font-weight:700;font-size:10px;color:#007BFF;margin-bottom:2px;">${s.name}</div>
        <div style="font-size:8px; color:var(--muted); margin-bottom:2px; font-style:italic;">Formula: ${s.formula}</div>
        <div style="font-size:9px; color:var(--text); margin-bottom:4px; font-family:monospace; background:rgba(0,0,0,0.2); padding:2px; border-radius:2px;">
          Calc: ${s.calc}
        </div>
        <div style="font-family:'Courier New',monospace;font-size:9x; color:var(--gold); font-weight:700;">
          Result: ${s.degree.toFixed(2)}° | ${s.sign} ${s.signDegree.toFixed(2)}° (House ${s.house})
        </div>
      </div>
    `;
  });
  
  html += '</div></div>';
  return html;
}
