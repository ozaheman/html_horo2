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
  
  const btnMarriageAnalysis = document.getElementById('btnMarriageAnalysis');
  const closeMarriage = document.getElementById('closeMarriage');
  const marriagePanel = document.getElementById('marriagePanel');

  if (btnMarriageAnalysis && marriagePanel) {
    btnMarriageAnalysis.addEventListener('click', () => {
      if (typeof runMarriageAnalysis === 'function') {
        runMarriageAnalysis();
      } else {
        marriagePanel.classList.add('open');
        console.error("runMarriageAnalysis not found in marriage.js");
      }
    });
  }
  if (closeMarriage && marriagePanel) {
    closeMarriage.addEventListener('click', () => {
      marriagePanel.classList.remove('open');
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

    let gocharChartConfigsToRender = null;

    if (mode === 'gochar') {
      await showProgress('Computing Live Transit (Gochar) Analysis...');
      if (!window.GOCHAR) {
        html += `<div class="pred-item"><div class="pred-title">⚠️ gochar.js module not found</div></div>`;
      } else if (!window.BIRTH_PLANETS || !window.BIRTH_ASC) {
        html += `<div class="pred-item"><div class="pred-title">⚠️ Natal chart not available</div></div>`;
      } else {
        try {
          // Today's/target transit positions + today's own ascendant
          const transitPlanets = (typeof getPos === 'function') ? getPos(targetDate) : null;
          let transitAsc = null;
          if (typeof computeAsc === 'function' && typeof jd === 'function' && window.BIRTH) {
            const j2 = jd(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate(), 12.0);
            transitAsc = computeAsc(j2, BIRTH.lat, BIRTH.lon, BIRTH.utcOff, BIRTH.ayan, 1);
          }

          // Natal D9 (Navamsha) for the chart panel
          let d9Planets = null, d9Asc = null;
          if (typeof computeAll === 'function' && typeof computeAsc === 'function' && window.BIRTH_JD && window.BIRTH) {
            d9Planets = computeAll(window.BIRTH_JD, BIRTH.ayan, 9);
            d9Asc = computeAsc(window.BIRTH_JD, BIRTH.lat, BIRTH.lon, BIRTH.utcOff, BIRTH.ayan, 9);
          }

          // Current dasha chain (MD/AD/PD/Sookshma)
          const dashaInfo = window.PREDICTION_FORECASTING ? window.PREDICTION_FORECASTING.getCurrentDashaInfo(targetDate) : null;

          const analysis = window.GOCHAR.analyze({
            natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
            transitPlanets: transitPlanets, transitAsc: transitAsc,
            lords: (typeof LORDS !== 'undefined') ? LORDS : null,
            dashaInfo: dashaInfo, currentDate: targetDate, birthDate: birthDate,
            birthLagnaLon: window.BIRTH_ASC?.sid
          });

          const chartConfigs = window.GOCHAR.getChartConfigs({
            natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
            d9Planets: d9Planets, d9Asc: d9Asc,
            transitPlanets: transitPlanets, transitAsc: transitAsc
          });
          gocharChartConfigsToRender = chartConfigs;

          html += window.GOCHAR.renderHTML(analysis, chartConfigs);
        } catch (gErr) {
          console.error('Gochar analysis failed:', gErr);
          html += `<div class="pred-item"><div class="pred-title">⚠️ Gochar analysis error</div><div class="pred-detail">${gErr.message}</div></div>`;
        }
      }
       } else if (mode === 'kp') {
      await showProgress('Computing KP (Krishnamurti Paddhati) Analysis...');
      if (!window.KP_PREDICTION) {
        html += `<div class="pred-item"><div class="pred-title">⚠️ KP_prediction.js module not found</div></div>`;
      } else if (!window.BIRTH_PLANETS || !window.BIRTH_ASC) {
        html += `<div class="pred-item"><div class="pred-title">⚠️ Natal chart not available</div></div>`;
      } else {
        try {
          const transitPlanets = (typeof getPos === 'function') ? getPos(targetDate) : null;
          let transitAsc = null;
          if (typeof computeAsc === 'function' && typeof jd === 'function' && window.BIRTH) {
            const j2 = jd(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate(), 12.0);
            transitAsc = computeAsc(j2, BIRTH.lat, BIRTH.lon, BIRTH.utcOff, BIRTH.ayan, 1);
          }

          let d9Planets = null, d9Asc = null;
          if (typeof computeAll === 'function' && typeof computeAsc === 'function' && window.BIRTH_JD && window.BIRTH) {
            d9Planets = computeAll(window.BIRTH_JD, BIRTH.ayan, 9);
            d9Asc = computeAsc(window.BIRTH_JD, BIRTH.lat, BIRTH.lon, BIRTH.utcOff, BIRTH.ayan, 9);
          }

          // Current running Mahadasha node (full sub-tree) for the
          // "search events in current Mahadasha" panel
          let mdNode = null;
          if (typeof getVimsh === 'function') {
            try { mdNode = getVimsh(targetDate); } catch (vErr) { console.error('getVimsh failed:', vErr); }
          }
 // Current Mahadasha/Antardasha/Pratyantardasha/Sookshma/Prana lords
          // for the "verify current effect / sure-shot" dasha confirmation panel.
          const dashaInfo = window.PREDICTION_FORECASTING ? window.PREDICTION_FORECASTING.getCurrentDashaInfo(targetDate) : null;

          const kpAnalysis = window.KP_PREDICTION.analyze({
            natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
            lords: (typeof LORDS !== 'undefined') ? LORDS : null,
            dashaInfo: dashaInfo, transitPlanets: transitPlanets, mdNode: mdNode, currentDate: targetDate
          });

          const chartConfigs = window.GOCHAR ? window.GOCHAR.getChartConfigs({
            natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
            d9Planets: d9Planets, d9Asc: d9Asc,
            transitPlanets: transitPlanets, transitAsc: transitAsc
          }) : [];

          // KP's own Cuspal / Bhava Chalit chart canvases (drawn from the
          // same natal placement data — see KP_prediction.js module notes
          // on the equal-house cusp approximation).
          const kpChartConfigs = window.KP_PREDICTION.getChartConfigs ? window.KP_PREDICTION.getChartConfigs({
            natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC
          }) : [];

          gocharChartConfigsToRender = chartConfigs.concat(kpChartConfigs);

          if (window.GOCHAR && chartConfigs.length) {
            html += window.GOCHAR._renderChartPanels ? window.GOCHAR._renderChartPanels(chartConfigs) : '';
          }
          html += window.KP_PREDICTION.renderHTML(kpAnalysis, transitPlanets, mdNode, kpChartConfigs);

          // KP Part 2 — advanced/supplementary rules not covered by
          // KP_prediction.js (Dasha Pravesh, BTR 1-9 connectivity, Sun
          // Bhava-Chalit Soul Purpose, Karakatva blending, Share Market,
          // Remedies/donations, dedicated Twin-Birth check, Dual-Sign 15°
          // rule, Competitive Prashna defeat-houses, 12th-CSL investment
          // formula, 2nd-CSL wealth-source table, Jupiter Yearly panel).
          // Purely additive — degrades gracefully if inputs are missing.
          if (window.KP_PREDICTION_2) {
            try {
              const kp2Analysis = window.KP_PREDICTION_2.analyze2({
                natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
                lords: (typeof LORDS !== 'undefined') ? LORDS : null,
                dashaInfo: dashaInfo, transitPlanets: transitPlanets,
                // Dasha Pravesh needs the transiting Sun's longitude at the
                // exact moment of the currently-running sub-period's start;
                // as a practical approximation this reuses today's transit
                // Sun position and the running Antardasha lord.
                transitPlanetSid: (transitPlanets && transitPlanets.Sun) ? transitPlanets.Sun.sid : undefined,
                subPeriodLord: (dashaInfo && dashaInfo.antardasha) ? dashaInfo.antardasha.lord : null
              });
              html += window.KP_PREDICTION_2.renderHTML2(kp2Analysis);
            } catch (kp2Err) {
              console.error('KP Part 2 analysis failed:', kp2Err);
              html += `<div class="pred-item"><div class="pred-title">⚠️ KP Part 2 analysis error</div><div class="pred-detail">${kp2Err.message}</div></div>`;
            }
          }

          // KP Part 3 — extended KAT conjunctions (Jupiter+Rahu,
          // Sun+Rahu, Mars+Ketu, Mars+Rahu), four-trine conjunction
          // reading, full 3-rule retrograde filter, tiered 5th-house
          // money/childbirth grading, and the curated horary library.
          if (window.KP_PREDICTION_3) {
            try {
              const kp3Analysis = window.KP_PREDICTION_3.analyze3({
                natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
                // Retrograde-filter check defaults to the running Antardasha
                // lord (the significator whose delivery is currently in question).
                retroCheckPlanet: (dashaInfo && dashaInfo.antardasha) ? dashaInfo.antardasha.lord : null,
                transitTriggerPlanets: transitPlanets
              });
              html += window.KP_PREDICTION_3.renderHTML3(kp3Analysis);
            } catch (kp3Err) {
              console.error('KP Part 3 analysis failed:', kp3Err);
              html += `<div class="pred-item"><div class="pred-title">⚠️ KP Part 3 analysis error</div><div class="pred-detail">${kp3Err.message}</div></div>`;
            }
          }

          // KP Part 4 — Disease Source-Cause-Effect diagnosis, the
          // Dasha Pravesh Guide-Planet method (with worked case
          // studies), marriage-override check, and the 3rd-CSL
          // authorship/publication rule.
          if (window.KP_PREDICTION_4) {
            try {
              const kp4Analysis = window.KP_PREDICTION_4.analyze4({
                natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
                lords: (typeof LORDS !== 'undefined') ? LORDS : null,
                // Illness-source diagnosis defaults to the running Mahadasha lord.
                illnessDashaPlanet: (dashaInfo && dashaInfo.mahadasha) ? dashaInfo.mahadasha.lord : null,
                // Dasha Pravesh needs the Antardasha lord's TRANSIT longitude
                // at the exact moment the Antardasha began; as a practical
                // approximation this reuses that planet's CURRENT transit
                // position (exact historical antardasha-start ephemeris
                // lookup would need the natal dasha-start-date calculator).
                antardashaLordTransitSid: (dashaInfo && dashaInfo.antardasha && transitPlanets && transitPlanets[dashaInfo.antardasha.lord])
                  ? transitPlanets[dashaInfo.antardasha.lord].sid : undefined
              });
              html += window.KP_PREDICTION_4.renderHTML4(kp4Analysis);
            } catch (kp4Err) {
              console.error('KP Part 4 analysis failed:', kp4Err);
              html += `<div class="pred-item"><div class="pred-title">⚠️ KP Part 4 analysis error</div><div class="pred-detail">${kp4Err.message}</div></div>`;
            }
          }

          // KP Part 5 — 406-entry Event Signification Database, Ruling
          // Planets engine, two new horary rules (Moon-guarantee,
          // reciprocal fulfilment), Snapshot Prediction (birth-chart-only,
          // no T.O.B. needed), Parashari Moon-transit+Vedha (supplementary,
          // non-KP), and the Varga quick-reference table.
          if (window.KP_PREDICTION_5) {
            try {
              const now = new Date();
              const kp5Analysis = window.KP_PREDICTION_5.analyze5({
                natalPlanets: window.BIRTH_PLANETS, natalAsc: window.BIRTH_ASC,
                lords: (typeof LORDS !== 'undefined') ? LORDS : null,
                // Ruling Planets / horary-rule inputs default to "now" using
                // the current transit chart already computed above.
                horaryAscSid: (transitPlanets && transitPlanets.Ascendant) ? transitPlanets.Ascendant.sid : undefined,
                transitMoonSid: (transitPlanets && transitPlanets.Moon) ? transitPlanets.Moon.sid : undefined,
                dayOfWeek: now.getDay(),
                transitPlanetsMap: transitPlanets
              });
              html += window.KP_PREDICTION_5.renderHTML5(kp5Analysis);
            } catch (kp5Err) {
              console.error('KP Part 5 analysis failed:', kp5Err);
              html += `<div class="pred-item"><div class="pred-title">⚠️ KP Part 5 analysis error</div><div class="pred-detail">${kp5Err.message}</div></div>`;
            }
          }
        } catch (kpErr) {
          console.error('KP analysis failed:', kpErr);
          html += `<div class="pred-item"><div class="pred-title">⚠️ KP analysis error</div><div class="pred-detail">${kpErr.message}</div></div>`;
        }
      }
    } else if (mode === 'tushar' && window.TUSHAR_ROY) {
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
    } else if (mode === 'ai') {
      await showProgress('Synthesizing 19-Factor AI Prediction...');
      const d1 = window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {};
      const asc = window.CURRENT_ASCENDANT || window.BIRTH_ASC || { signIndex: 0 };
      const bDate = window.BIRTH?.date || new Date();
      const targetDate = PREDICTIONS_UI.currentStartDate || new Date();
      const age = targetDate.getFullYear() - bDate.getFullYear();
      
      const dashaInfo = window.PREDICTION_FORECASTING ? window.PREDICTION_FORECASTING.getCurrentDashaInfo(targetDate) : null;
      const transitJupiter = d1.Jupiter || {};

      const planetsArr = Object.entries(d1).map(([name, data]) => {
          const deg = data.sid !== undefined ? data.sid : (data.longitude || 0);
          return {
            name,
            degree: deg,
            longitude: deg,
            signIndex: Math.floor(deg / 30),
            house: data.house || 1,
            sign: data.sign || "",
            isRetrograde: !!data.isRetrograde
          };
      });
      
      const inputData = { 
          planets: planetsArr, 
          planetMap: d1,
          asc: asc, 
          age, 
          dashaInfo, 
          transitPlanets: d1, // Actually we should pass current transit if different
          birthDate: bDate,
          natalJupiterSign: window.BIRTH_PLANETS?.Jupiter?.signIndex || 0,
          natalRahuSign: window.BIRTH_PLANETS?.Rahu?.signIndex || 0
      };

      html += window.AI_PREDICTION.generateHTMLReport(inputData);
    } else if (mode === 'step2step') {
      const d1 = window.CURRENT_PLANETARY_POSITIONS || {};
      const asc = window.CURRENT_ASCENDANT || 0;
      const houses = window.CURRENT_HOUSES || {};
      const birthDate = window.BIRTH?.date || new Date();
      if (window.STEP2STEP_PANCHANG) {
         html += window.STEP2STEP_PANCHANG.analyze(d1, asc, houses, birthDate, window.BIRTH);
      } else {
         html += `<div class="pred-item">Error: step2step_panchang.js module not found</div>`;
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
      const dbMap = { "Saral Jyotish": { data: window.SARAL_JYOTISH_DB || [], color: 'var(--amber)' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('saral_jyotish', generatedHTML);
    } else if (mode === 'astro') {
      const dbMap = { "Astro Pathshala": { data: window.ASTRO_PATHSHALA_DB || [], color: 'var(--cyan)' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('astro_jyotish', generatedHTML);
    } else if (mode === 'arun_pandit') {
      const dbMap = { "Arun Pandit": { data: window.ARUN_PANDIT_DB || [], color: '#FF9933' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('arun_pandit_db', generatedHTML);
    } else if (mode === 'astrology_made_easy') {
      const dbMap = { "Astrology Made Easy": { data: window.ASTROLOGY_MADE_EASY_DB || [], color: '#44FF88' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('astro_made_easy_db', generatedHTML);
    } else if (mode === 'bnn') {
     // Primary: full structured natal-chart BNN analysis — the engine
      // (bnn_logic.js) driving career/money/marriage/health via the
      // structured combination data (bnn_prediction.js), enriched with
      // matching raw excerpts pulled from BNN_DB (bnn_db.js).
      if (typeof window.renderNatalBnnAnalysisHtml === 'function') {
        html += window.renderNatalBnnAnalysisHtml(window.BIRTH_PLANETS || {}, window.BIRTH_ASC || null);
      } else {
        html += `<div class="pred-item"><div class="pred-title">⚠️ BNN engine unavailable</div><div class="pred-detail">bnn_logic.js / bnn_prediction.js did not load.</div></div>`;
      }

      // Secondary: broader keyword/house-driven scan of the full BNN_DB
      // (not just the topics above) via the generic comprehensive analyzer,
      // for anything the structured engine doesn't explicitly cover.
      if (window.GENERIC_ANALYZER) {
        const dbMap = { "BNN": { data: window.BNN_DB || [], color: 'var(--rose)' } };
        const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
        if (generatedHTML && generatedHTML.trim()) {
          html += `<div style="margin-top:10px;font-size:10px;font-weight:bold;color:var(--gold);padding:6px 0;border-top:1px dashed rgba(255,255,255,.1);">📜 Additional House-wise BNN Source Matches</div>`;
          html += window.makeEditable('bnn_db', generatedHTML);
        }
      }
    } else if (mode === 'kaalpurush') {
      const dbMap = { "Kaalpurush Astrology": { data: window.KAALPURUSH_ASTROLOGY_DB || [], color: '#00FF88' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('kaalpurush_db', generatedHTML);
    } else if (mode === 'tathastu') {
      const dbMap = { "Tathastu Anubhav": { data: window.TATHASTU_ANUBHAV_DB || [], color: '#44AAFF' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('tathastu_db', generatedHTML);
    } else if (mode === 'professor') {
      const dbMap = { "The Professor": { data: window.THE_PROFESSOR_DB || [], color: '#FF3344' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
      html += window.makeEditable('professor_db', generatedHTML);
    } else if (mode === 'vedang') {
      const dbMap = { "Vedang Jyotish": { data: window.VEDANG_JYOTIS_BY_SHIV_SHARMA_DB || [], color: '#FFD700' } };
      const generatedHTML = window.GENERIC_ANALYZER.analyzeComprehensive(dbMap, window.CURRENT_PLANETARY_POSITIONS || window.BIRTH_PLANETS || {}, window.CURRENT_HOUSES || {}, window.CURRENT_ASCENDANT || 0, null);
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
/**
 * Analyze Rajyogas and Rajyoga Bhanga (Breakage)
 * Based on Parashari principles (Kendra-Trikona lords, Neecha Bhanga, Kemadruma, etc.)
 */
function analyzeRajyogasAndBhanga(planets, ascendant) {
  if (!planets || !ascendant) return '<div class="pred-item">Insufficient chart data for Yoga analysis.</div>';
  
  const ascSn = ascendant.sn !== undefined ? ascendant.sn : Math.floor(ascendant.longitude / 30);
  const LORDS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) 
    ? window.ASTRO_CONSTANTS.SIGN_LORDS 
    : ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const SIGNS = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS)
    ? window.ASTRO_CONSTANTS.SIGNS
    : ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  // Helper: Get planet's sign index
  const getSign = (p) => {
    if (!planets[p]) return -1;
    return planets[p].sn !== undefined ? planets[p].sn : Math.floor((planets[p].longitude || planets[p].sid) / 30);
  };

  // Helper: Get house of a planet
  const getHouse = (p) => {
    if (!planets[p]) return -1;
    const pSn = getSign(p);
    return ((pSn - ascSn + 12) % 12) + 1;
  };

  // 1. Identify Kendra (1,4,7,10) and Trikona (1,5,9) Lords
  const kendraLords = [LORDS[ascSn], LORDS[(ascSn+3)%12], LORDS[(ascSn+6)%12], LORDS[(ascSn+9)%12]];
  const trikonaLords = [LORDS[ascSn], LORDS[(ascSn+4)%12], LORDS[(ascSn+8)%12]];
  
  // Union of Kendra & Trikona lords (Rajyoga Lords)
  const rajyogaLordSet = new Set([...kendraLords, ...trikonaLords]);
  
  // Check if Rajyoga Lords are in Kendra/Trikona or mutually aspecting each other
  let rajyogas = [];
  let rajyogaDetails = [];
  
  rajyogaLordSet.forEach(lord => {
    const lordSign = getSign(lord);
    const lordHouse = ((lordSign - ascSn + 12) % 12) + 1;
    if (lordHouse === 1 || lordHouse === 4 || lordHouse === 5 || lordHouse === 7 || lordHouse === 9 || lordHouse === 10) {
      rajyogas.push(`${lord} in H${lordHouse} (${SIGNS[lordSign]})`);
      rajyogaDetails.push(`${lord} (${SIGNS[lordSign]}) in H${lordHouse} — forms a potent ${lordHouse === 1 ? 'Vimala' : lordHouse === 4 ? 'Shash' : lordHouse === 5 ? 'Bhadra' : 'Rajyoga'}`);
    }
  });

  // Mutual aspect between Rajyoga Lords
  const rajPairs = [];
  const rajyogaLordArray = Array.from(rajyogaLordSet);
  for (let i = 0; i < rajyogaLordArray.length; i++) {
    for (let j = i+1; j < rajyogaLordArray.length; j++) {
      const l1 = rajyogaLordArray[i], l2 = rajyogaLordArray[j];
      const h1 = getHouse(l1), h2 = getHouse(l2);
      if (h1 === 7 - h2 || Math.abs(h1 - h2) === 4 || Math.abs(h1 - h2) === 8) {
        rajPairs.push(`${l1} (H${h1}) aspects ${l2} (H${h2})`);
        rajyogaDetails.push(`Mutual aspect between Rajyoga Lords ${l1} and ${l2}: Creates a powerful Rajyoga.`);
      }
    }
  }

  // 2. Neecha Bhanga Rajayoga (Cancellation of Debilitation)
  const exaltations = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
  const debilitations = { Sun: 190, Moon: 213, Mars: 118, Mercury: 345, Jupiter: 275, Venus: 177, Saturn: 20 };
  const signDegBounds = (deg) => {
    const sign = Math.floor(deg / 30);
    const d = deg % 30;
    return { sign, d };
  };

  let neechaBhanga = [];
  for (const [p, ex] of Object.entries(exaltations)) {
    const pData = planets[p];
    if (!pData) continue;
    const pLon = pData.sid !== undefined ? pData.sid : pData.longitude;
    const deb = debilitations[p];
    const isDebilitated = Math.abs((pLon - deb + 360) % 360) < 1.5;
    
    if (isDebilitated) {
      // Check if lord of sign where planet is debilitated is in Kendra/Trikona
      const debSignIdx = Math.floor(pLon / 30);
      const debSignLord = LORDS[debSignIdx];
      const debLordPos = getSign(debSignLord);
      const debLordHouse = ((deblordPos - ascSn + 12) % 12) + 1;
      
      if ([1,4,5,7,9,10].includes(deblordHouse)) {
        neechaBhanga.push(`${p} debilitated but lord ${debSignLord} in H${deblordHouse} — Neecha Bhanga Rajyoga formed.`);
      } else {
        // Also check if planet conjuncts its exaltation lord
        const exaltLord = LORDS[Math.floor(ex / 30)];
        const exaltLordSign = getSign(exaltLord);
        if (exaltLordSign === debSignIdx) {
          neechaBhanga.push(`${p} debilitated but conjunct its exaltation lord ${exaltLord} — Neecha Bhanga Rajyoga formed.`);
        } else {
          neechaBhanga.push(`${p} debilitated: No Neecha Bhanga — permanent weakness.`);
        }
      }
    }
  }

  // 3. Kemadruma Yoga & Bhanga
  const moonSign = getSign('Moon');
  const moonHouse = ((moonSign - ascSn + 12) % 12) + 1;
  let planetsAdjacent = false;
  const adjHouses = [((moonHouse - 2 + 12) % 12) + 1, ((moonHouse + 0) % 12) + 1, ((moonHouse + 2) % 12) + 1];
  for (const p of ['Sun','Mars','Mercury','Jupiter','Venus','Saturn']) {
    if (getHouse(p) !== -1 && adjHouses.includes(getHouse(p))) planetsAdjacent = true;
  }
  const kemadruma = !planetsAdjacent;
  
  let kemadrumaBhanga = false;
  // Kemadruma Bhanga if Moon is with another planet or aspected by Jupiter/Venus
  const moonConjunct = Object.keys(planets).some(p => p !== 'Moon' && getSign(p) === moonSign && getHouse(p) === moonHouse);
  const jupiterAspect = Math.abs(getSign('Jupiter') - moonSign) % 12 === 4 || Math.abs(getSign('Jupiter') - moonSign) % 12 === 8;
  const venusAspect = Math.abs(getSign('Venus') - moonSign) % 12 === 4 || Math.abs(getSign('Venus') - moonSign) % 12 === 8;
  
  if (kemadruma && (moonConjunct || jupiterAspect || venusAspect)) {
    kemadrumaBhanga = true;
  }

  // 4. Raja Yoga Bhanga (Breakage) — Mainly due to malefic influence on Kendra/Trikona lords or their houses
  let rajyogaBhanga = [];
  rajyogaLordArray.forEach(lord => {
    const lordHouse = getHouse(lord);
    // If lord is in Dusthana (6,8,12)
    if ([6,8,12].includes(lordHouse)) {
      rajyogaBhanga.push(`${lord} in H${lordHouse} (Dusthana) — weakens/breaks the Rajyoga potential.`);
    }
    // If lord is combust (within 10° of Sun)
    const lordLon = planets[lord] ? (planets[lord].sid || planets[lord].longitude) : 0;
    const sunLon = planets.Sun ? (planets.Sun.sid || planets.Sun.longitude) : 0;
    if (Math.abs((lordLon - sunLon + 360) % 360) < 10) {
      rajyogaBhanga.push(`${lord} is combust — its power is diminished, breaking the Rajyoga.`);
    }
    // If lord is debilitated
    const lordDeg = lordLon % 30;
    const debDeg = debilitations[lord] % 30;
    if (Math.abs(lordDeg - debDeg) < 1.5) {
      rajyogaBhanga.push(`${lord} is debilitated — breaks the yoga.`);
    }
  });

  // Also check if any house representing Kendra/Trikona is afflicted by malefics in Dusthana
  const kendraHouses = [1,4,7,10];
  const trikonaHouses = [1,5,9];
  const dusthanaHouses = [6,8,12];
  const malefics = ['Mars','Saturn','Rahu','Ketu','Sun'];
  for (let h of [...kendraHouses, ...trikonaHouses]) {
    const signIdx = (ascSn + h - 1) % 12;
    const planetsInHouse = Object.keys(planets).filter(p => getSign(p) === signIdx);
    const maleficsInHouse = planetsInHouse.filter(p => malefics.includes(p));
    if (maleficsInHouse.length > 0) {
      rajyogaBhanga.push(`Malefics (${maleficsInHouse.join(',')}) in H${h} (${SIGNS[signIdx]}) — weakens the Rajyoga of that house.`);
    }
  }

  // 5. Build HTML Output
  let html = `<div class="pred-item" style="border-left: 3px solid var(--gold); margin-top:20px;">
    <div class="pred-title" style="color:var(--gold); font-size:14px; text-align:center;">👑 Rajyoga & Rajyoga Bhanga Analysis</div>
    <div style="font-size:10px; color:var(--muted); text-align:center; margin-bottom:10px;">Classical Parashari Principles: Kendra-Trikona Lords, Neecha Bhanga, Kemadruma</div>
  `;

  // Rajyogas Found
  html += `<div style="background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.2); border-radius:8px; padding:10px; margin-bottom:15px;">
    <div style="color:var(--gold); font-size:11px; font-weight:bold; margin-bottom:8px;">✨ Detected Rajyogas</div>`;
  if (rajyogas.length === 0 && rajPairs.length === 0 && neechaBhanga.length === 0 && !kemadrumaBhanga) {
    html += `<div style="font-size:10px; color:var(--muted);">No strong Rajyogas detected from Kendra-Trikona lords.</div>`;
  } else {
    if (rajyogas.length > 0) html += `<div style="margin-bottom:6px;"><strong>Kendra/Trikona Lords:</strong> ${rajyogas.join(', ')}</div>`;
    if (rajPairs.length > 0) html += `<div style="margin-bottom:6px;"><strong>Mutual Aspects:</strong> ${rajPairs.join(', ')}</div>`;
    if (neechaBhanga.length > 0) html += `<div style="margin-bottom:6px;"><strong>Neecha Bhanga Rajyoga:</strong><br/>${neechaBhanga.join('<br/>')}</div>`;
    if (kemadrumaBhanga) html += `<div><strong>Kemadruma Bhanga:</strong> Kemadruma averted by conjunction/benefic aspect — Rajyoga potential activated.</div>`;
  }
  html += `</div>`;

  // Rajyoga Bhanga (Breakage)
  html += `<div style="background:rgba(255,68,68,0.05); border:1px solid rgba(255,68,68,0.2); border-radius:8px; padding:10px; margin-bottom:15px;">
    <div style="color:var(--rose); font-size:11px; font-weight:bold; margin-bottom:8px;">⚠️ Rajyoga Bhanga (Breakage Factors)</div>`;
  if (rajyogaBhanga.length === 0 && !kemadruma) {
    html += `<div style="font-size:10px; color:var(--muted);">No significant breakage factors observed. Rajyogas are likely to manifest fully.</div>`;
  } else {
    if (rajyogaBhanga.length > 0) html += `<div>${rajyogaBhanga.join('<br/>')}</div>`;
    if (kemadruma && !kemadrumaBhanga) html += `<div><strong>Kemadruma Yoga:</strong> Moon is isolated with no planets 2 houses away. This nullifies many Rajyogas.</div>`;
  }
  html += `</div></div>`;

  return html;
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
      if (window.SUDARSHAN_CHAKRA && typeof window.SUDARSHAN_CHAKRA.renderChakraSection === 'function' && window.BIRTH_PLANETS && window.BIRTH_ASC) {
        const sudarshanTransit = (typeof getPos === 'function') ? getPos(targetDate) : null;
        const sudarshanNatalData = window.SUDARSHAN_CHAKRA.getChakraData(window.BIRTH_PLANETS, window.BIRTH_ASC);
        const sudarshanTransitData = sudarshanTransit ? window.SUDARSHAN_CHAKRA.getTransitChakraData(window.BIRTH_PLANETS, window.BIRTH_ASC, sudarshanTransit) : null;
        const sudarshanChartConfigs = window.SUDARSHAN_CHAKRA.getChartConfigs(window.BIRTH_PLANETS, window.BIRTH_ASC, sudarshanTransit);
        // Drawn in its own pass below (after the HTML is in the DOM), independent
        // of the gochar/kp-only chart draw loop, since this section renders for
        // every mode.
        window.__sudarshanChartConfigs = sudarshanChartConfigs;
        html += window.SUDARSHAN_CHAKRA.renderChakraSection(sudarshanNatalData, sudarshanTransitData, sudarshanChartConfigs);
      } else {
        html += renderSudarshanChakraInfoSection();
      }
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
    // Gochar & KP modes draw their D1/D9/Transit/Rashi-Tulya/Moon canvases now that
    // the <canvas> elements exist in the DOM (chart drawing needs real DOM nodes).
    if ((mode === 'gochar' || mode === 'kp') && gocharChartConfigsToRender && typeof drawDChart === 'function') {
      gocharChartConfigsToRender.forEach(cfg => {
        try { drawDChart(cfg.canvasId, { planets: cfg.planets, asc: cfg.asc }); } catch (dErr) { console.error('Gochar chart draw failed:', cfg.canvasId, dErr); }
      });
    }
    // Sudarshan Chakra Chart draws independently of mode (it renders for every
    // mode as section 7 above), so it gets its own pass rather than piggybacking
    // on the gochar/kp-only loop above.
    if (window.__sudarshanChartConfigs && typeof drawDChart === 'function') {
      window.__sudarshanChartConfigs.forEach(cfg => {
        try { drawDChart(cfg.canvasId, { planets: cfg.planets, asc: cfg.asc }); } catch (dErr) { console.error('Sudarshan chart draw failed:', cfg.canvasId, dErr); }
      });
      window.__sudarshanChartConfigs = null;
    }
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
  
  const chkKhar = document.getElementById('chkMarkKharDasha');
  const showKhar = chkKhar && chkKhar.checked;
  let kharPlanets = [];
  if (showKhar && window.NAVAMSHA_ANALYSIS && window.BIRTH_PLANETS && window.BIRTH_ASC) {
      const nd = window.NAVAMSHA_ANALYSIS.calculate(window.BIRTH_PLANETS, window.BIRTH_ASC);
      kharPlanets = [nd.Khar64Lord, nd.Khar64Lord_Asc, nd.Khar22Lord].filter(x => x);
      const signLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
      let ashtamSignIndex = (window.BIRTH_ASC.signIndex + 7) % 12;
      let randhreshvara = signLords[ashtamSignIndex] || null;
      if (randhreshvara) kharPlanets.push(randhreshvara);
  }

  const getKharBadge = (lord) => {
      if (!lord || !showKhar) return '';
      if (kharPlanets.includes(lord)) {
          return ` <span style="background:#ff4757; color:white; font-size:7px; padding:1px 3px; border-radius:2px; vertical-align:middle; margin-left:3px;" title="Khar/Ashtam Planet Effect">⚠️ KHAR</span>`;
      }
      return '';
  };

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
        <strong>Mahadasha:</strong> ${dashaInfo.mahadasha?.lord || 'N/A'} ${getKharBadge(dashaInfo.mahadasha?.lord)}
        <span style="float:right;font-family:'Courier New',monospace;font-size:9px;color:var(--muted);">
          ${formatDays(dashaInfo.daysRemainingInMD)} left
        </span>
      </div>
      <div class="pred-detail">
        <strong>Antardasha:</strong> ${dashaInfo.antardasha?.lord || 'N/A'} ${getKharBadge(dashaInfo.antardasha?.lord)}
        <span style="float:right;font-family:'Courier New',monospace;font-size:9px;color:var(--muted);">
          ${formatDays(dashaInfo.daysRemainingInAD)} left
        </span>
      </div>
      <div class="pred-detail">
        <strong>Pratyantar:</strong> ${dashaInfo.pratyantar?.lord || 'N/A'} ${getKharBadge(dashaInfo.pratyantar?.lord)}
      </div>
      <div class="pred-detail">
        <strong>Sukshma:</strong> ${dashaInfo.sukshma?.lord || 'N/A'} ${getKharBadge(dashaInfo.sukshma?.lord)}
      </div>
      <div class="pred-detail">
        <strong>Prana:</strong> ${dashaInfo.prana?.lord || 'N/A'} ${getKharBadge(dashaInfo.prana?.lord)}
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
  
  const chkKhar = document.getElementById('chkMarkKharDasha');
  const showKhar = chkKhar && chkKhar.checked;
  let kharPlanets = [];
  if (showKhar && window.NAVAMSHA_ANALYSIS && window.BIRTH_PLANETS && window.BIRTH_ASC) {
      const nd = window.NAVAMSHA_ANALYSIS.calculate(window.BIRTH_PLANETS, window.BIRTH_ASC);
      kharPlanets = [nd.Khar64Lord, nd.Khar64Lord_Asc, nd.Khar22Lord].filter(x => x);
      const signLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
      let ashtamSignIndex = (window.BIRTH_ASC.signIndex + 7) % 12;
      let randhreshvara = signLords[ashtamSignIndex] || null;
      if (randhreshvara) kharPlanets.push(randhreshvara);
  }

  const getKharBadge = (lord) => {
      if (!lord || !showKhar) return '';
      if (kharPlanets.includes(lord)) {
          return ` <span style="background:#ff4757; color:white; font-size:7px; padding:1px 3px; border-radius:2px; vertical-align:top; margin-left:3px;" title="Khar/Ashtam Planet Effect">⚠️ KHAR</span>`;
      }
      return '';
  };

  let html = '<div class="pred-item"><div class="pred-title">📅 Upcoming Dasha Changes</div>';
  
  timeline.slice(0, 8).forEach(event => {
    const dateStr = typeof event.startDate === 'string' 
      ? event.startDate 
      : event.startDate?.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: '2-digit'}) || 'N/A';
    
    const title = event.type === 'Mahadasha' ? '✦' : event.type === 'Antardasha' ? '◆' : '▪';
    
    html += `
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(155,111,255,.15);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;font-size:10px;color:var(--text);">${title} ${event.lord}${getKharBadge(event.lord)}</span>
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
  const planets = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.PLANETS) || [];
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

  const planets = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.PLANETS) || [];
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
  
  const parseLocalDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0); 
  };

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let sDate = parseLocalDate(startInp.value);
  let eDate = parseLocalDate(endInp.value);
  
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
    sDate.setDate(sDate.getDate() + (delta * (shiftDays || 30)));
  }
  
  startInp.value = formatLocalDate(sDate);
  endInp.value = formatLocalDate(eDate);
  
  if (typeof window.centerDate !== 'undefined') {
      window.centerDate = new Date(sDate.getTime());
      window.centerDate.setHours(12,0,0,0);
      
      const tdateInp = document.getElementById('tDate');
      if (tdateInp) tdateInp.value = formatLocalDate(sDate);
      
      if (typeof window.renderAll === 'function') {
          window.renderAll();
      }
  }

  const btnUpdatePredictions = document.getElementById('btnUpdatePredictions');
  if (btnUpdatePredictions) {
      btnUpdatePredictions.click();
  }
};

/**
 

 * Specialized Marriage Panel Update — delegates to runMarriageAnalysis(),
 * which is defined in marriage.js (loaded as a separate <script> — make
 * sure marriage.js is included on the page alongside this file). Kept as
 * a thin wrapper for any call sites that still invoke
 * updateMarriagePanel() directly instead of runMarriageAnalysis().
 */
async function updateMarriagePanel() {
  if (typeof runMarriageAnalysis === 'function') {
    runMarriageAnalysis();
     
  } else {
    console.error("runMarriageAnalysis not found in marriage.js");
  }
}