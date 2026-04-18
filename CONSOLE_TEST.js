// ════════════════════════════════════════════════════════════════════════════
// QUICK COPY-PASTE TEST FOR BROWSER CONSOLE
// ════════════════════════════════════════════════════════════════════════════
// 
// HOW TO USE:
// 1. Press F12 to open browser console
// 2. Copy everything below (from "const testRunner" to the last closing brace)
// 3. Paste into console
// 4. Press Enter
// 5. Watch results appear below
//
// ════════════════════════════════════════════════════════════════════════════

const testRunner = (() => {
  const GREEN = '\x1b[32m';
  const RED = '\x1b[31m';
  const YELLOW = '\x1b[33m';
  const BLUE = '\x1b[34m';
  const CYAN = '\x1b[36m';
  const RESET = '\x1b[0m';
  
  let passed = 0, failed = 0, tests = [];
  
  function test(name, condition, details = '') {
    if (condition) {
      passed++;
      console.log(`${GREEN}✅ ${name}${RESET}${details ? ' - ' + details : ''}`);
    } else {
      failed++;
      console.log(`${RED}❌ ${name}${RESET}${details ? ' - ' + details : ''}`);
    }
    tests.push({ name, passed: condition, details });
  }
  
  function section(title) {
    console.log(`\n${BLUE}${'═'.repeat(70)}`);
    console.log(`${title}${RESET}`);
    console.log(`${BLUE}${'═'.repeat(70)}${RESET}\n`);
  }
  
  return {
    run: function() {
      console.clear();
      console.log(`\n${CYAN}${'═'.repeat(70)}`);
      console.log('🔍 VEDIC JYOTISH COMPREHENSIVE TEST SUITE');
      console.log(`${'═'.repeat(70)}${RESET}\n`);
      
      // ─────────────────────────────────────────────────────────────────────
      // 1. PREDICTION MODULES
      // ─────────────────────────────────────────────────────────────────────
      section('📋 PREDICTION MODULES');
      
      test('PREDICTION_ANALYSIS exists', typeof window.PREDICTION_ANALYSIS === 'object');
      test('PREDICTION_FORECASTING exists', typeof window.PREDICTION_FORECASTING === 'object');
      test('PREDICTION_ADVANCED exists', typeof window.PREDICTION_ADVANCED === 'object');
      test('PREDICTION_PHALADEEPIKA exists', typeof window.PREDICTION_PHALADEEPIKA === 'object');
      
      test('getPlanetsInHouses is function', 
        typeof PREDICTION_ANALYSIS.getPlanetsInHouses === 'function');
      test('getCurrentDashaInfo is function', 
        typeof PREDICTION_FORECASTING.getCurrentDashaInfo === 'function');
      test('getKharaGraha is function', 
        typeof PREDICTION_ADVANCED.getKharaGraha === 'function');
      test('getPhaladeepikaPrediction is function', 
        typeof PREDICTION_PHALADEEPIKA.getPhaladeepikaPrediction === 'function');
      
      // ─────────────────────────────────────────────────────────────────────
      // 2. YOGA SYSTEM
      // ─────────────────────────────────────────────────────────────────────
      section('🧘 YOGA SYSTEM');
      
      test('YOGAS_DATA exists', Array.isArray(window.YOGAS_DATA), 
        `${window.YOGAS_DATA?.length || 0} yogas`);
      test('YOGA_IMPLEMENTATIONS exists', typeof window.YOGA_IMPLEMENTATIONS === 'object');
      test('detectAllYogasInChart is function', 
        typeof window.detectAllYogasInChart === 'function');
      test('enhanceYogaImplementations is function', 
        typeof window.enhanceYogaImplementations === 'function');
      
      if (window.YOGAS_DATA && window.YOGAS_DATA.length > 0) {
        test('First yoga has evaluate function', 
          typeof window.YOGAS_DATA[0].evaluate === 'function');
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // 3. BIRTH DATA STRUCTURE
      // ─────────────────────────────────────────────────────────────────────
      section('📍 BIRTH DATA STRUCTURE');
      
      test('BIRTH_PLANETS exists', typeof window.BIRTH_PLANETS === 'object', 
        Object.keys(window.BIRTH_PLANETS || {}).length + ' planets');
      test('BIRTH_ASC exists', window.BIRTH_ASC !== undefined, 
        'Ascendant calculated');
      test('VIMSH dasha exists', Array.isArray(window.VIMSH), 
        window.VIMSH?.length + ' entries');
      test('YOGINI dasha exists', Array.isArray(window.YOGINI), 
        window.YOGINI?.length + ' entries');
      
      if (window.BIRTH_PLANETS) {
        const planets = Object.keys(window.BIRTH_PLANETS);
        test('9 planets present', planets.length === 9, planets.join(', '));
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // 4. FUNCTION EXECUTION TESTS
      // ─────────────────────────────────────────────────────────────────────
      section('⚙️  FUNCTION EXECUTION');
      
      try {
        const planetsInHouses = PREDICTION_ANALYSIS.getPlanetsInHouses();
        test('getPlanetsInHouses() executes', 
          Array.isArray(planetsInHouses), planetsInHouses.length + ' planets');
      } catch(e) {
        test('getPlanetsInHouses() executes', false, e.message);
      }
      
      try {
        const dashaInfo = PREDICTION_FORECASTING.getCurrentDashaInfo();
        test('getCurrentDashaInfo() executes', 
          typeof dashaInfo === 'object' && dashaInfo.mahadasha, 
          dashaInfo.mahadasha || 'pending');
      } catch(e) {
        test('getCurrentDashaInfo() executes', false, e.message);
      }
      
      try {
        const optimalDates = PREDICTION_FORECASTING.suggestOptimalDates('remedy', 30);
        test('suggestOptimalDates() executes', 
          Array.isArray(optimalDates), optimalDates.length + ' dates suggested');
      } catch(e) {
        test('suggestOptimalDates() executes', false, e.message);
      }
      
      try {
        const khara = PREDICTION_ADVANCED.getKharaGraha();
        test('getKharaGraha() executes', 
          typeof khara === 'object' && Object.keys(khara).length > 0, 
          Object.keys(khara || {}).length + ' planets analyzed');
      } catch(e) {
        test('getKharaGraha() executes', false, e.message);
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // 5. YOGA DETECTION
      // ─────────────────────────────────────────────────────────────────────
      section('🎯 YOGA DETECTION');
      
      try {
        if (window.BIRTH_CHART) {
          const yogasDetected = window.detectAllYogasInChart(window.BIRTH_CHART);
          const detected = yogasDetected.filter(y => y.detected).length;
          test('Yoga detection works', Array.isArray(yogasDetected), 
            detected + '/' + yogasDetected.length + ' yogas detected');
        } else {
          test('BIRTH_CHART available', false, 'Chart not calculated yet');
        }
      } catch(e) {
        test('Yoga detection works', false, e.message);
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // 6. UI INTEGRATION
      // ─────────────────────────────────────────────────────────────────────
      section('🎨 UI INTEGRATION');
      
      test('Predictions panel exists', document.getElementById('predictionsPanel') !== null);
      test('Predictions button exists', document.getElementById('btnPredictions') !== null);
      test('predictions_ui.js loaded', typeof window.initPredictionsUI === 'function');
      test('Date inputs present', 
        document.getElementById('predStartDate') && document.getElementById('predEndDate'));
      
      // ─────────────────────────────────────────────────────────────────────
      // SUMMARY
      // ─────────────────────────────────────────────────────────────────────
      section('📊 TEST SUMMARY');
      
      const total = passed + failed;
      const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      console.log(`${GREEN}✅ PASSED: ${passed}/${total}${RESET}`);
      if (failed > 0) {
        console.log(`${RED}❌ FAILED: ${failed}/${total}${RESET}`);
      } else {
        console.log(`${GREEN}✅ FAILED: 0${RESET}`);
      }
      console.log(`${YELLOW}📈 SUCCESS RATE: ${rate}%${RESET}\n`);
      
      if (rate === 100) {
        console.log(`${GREEN}🎉 ALL SYSTEMS OPERATIONAL!${RESET}`);
        console.log(`${GREEN}   ✓ Prediction modules loaded${RESET}`);
        console.log(`${GREEN}   ✓ Yoga system working${RESET}`);
        console.log(`${GREEN}   ✓ Birth data calculated${RESET}`);
        console.log(`${GREEN}   ✓ All functions executing${RESET}`);
        console.log(`${GREEN}   ✓ UI dashboard ready${RESET}\n`);
      } else if (rate >= 80) {
        console.log(`${YELLOW}⚠️  MOSTLY WORKING${RESET}`);
        console.log(`${YELLOW}   Check failed items above for details${RESET}\n`);
      } else {
        console.log(`${RED}⚠️  ISSUES DETECTED${RESET}`);
        console.log(`${RED}   Make sure: 1) Calculate chart first 2) Wait for WASM${RESET}\n`);
      }
      
      window.LAST_TEST_RESULTS = { passed, failed, total, rate, tests };
      
      console.log(`${CYAN}${'═'.repeat(70)}${RESET}`);
      console.log(`Results stored in: window.LAST_TEST_RESULTS\n`);
      
      return { passed, failed, total, rate };
    }
  };
})();

// ════════════════════════════════════════════════════════════════════════════
// RUN THE TESTS IMMEDIATELY
// ════════════════════════════════════════════════════════════════════════════
testRunner.run();
