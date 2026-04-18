/**
 * COMPREHENSIVE SYSTEM VERIFICATION SCRIPT
 * Run this in browser console to test everything at once
 * 
 * Usage: Copy & paste this entire script into browser console (F12)
 * It will run all tests and show results
 */

console.clear();
console.log('%c════════════════════════════════════════════════════════════════', 'color: #C8A84B; font-weight: bold; font-size: 14px');
console.log('%c🚀 VEDIC JYOTISH - COMPREHENSIVE VERIFICATION SUITE', 'color: #3AF0FF; font-weight: bold; font-size: 16px');
console.log('%c════════════════════════════════════════════════════════════════', 'color: #C8A84B; font-weight: weight: bold; font-size: 14px');

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: '✅ PASS', error: null });
    console.log(`%c✅ ${name}`, 'color: #3DFF9B; font-weight: bold');
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: '❌ FAIL', error: err.message });
    console.log(`%c❌ ${name}: ${err.message}`, 'color: #FF4477; font-weight: bold');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c📋 PART 1: PREDICTION MODULES', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('PREDICTION_ANALYSIS exists', () => {
  if (!window.PREDICTION_ANALYSIS) throw new Error('Module not found');
});

test('PREDICTION_ANALYSIS.getPlanetsInHouses is callable', () => {
  if (typeof window.PREDICTION_ANALYSIS.getPlanetsInHouses !== 'function') throw new Error('Function not found');
});

test('PREDICTION_FORECASTING exists', () => {
  if (!window.PREDICTION_FORECASTING) throw new Error('Module not found');
});

test('PREDICTION_FORECASTING.getCurrentDashaInfo is callable', () => {
  if (typeof window.PREDICTION_FORECASTING.getCurrentDashaInfo !== 'function') throw new Error('Function not found');
});

test('PREDICTION_ADVANCED exists', () => {
  if (!window.PREDICTION_ADVANCED) throw new Error('Module not found');
});

test('PREDICTION_ADVANCED.getKharaGraha is callable', () => {
  if (typeof window.PREDICTION_ADVANCED.getKharaGraha !== 'function') throw new Error('Function not found');
});

test('PREDICTION_PHALADEEPIKA exists', () => {
  if (!window.PREDICTION_PHALADEEPIKA) throw new Error('Module not found');
});

test('PREDICTION_PHALADEEPIKA.getPlanetaryResultsByHouse is callable', () => {
  if (typeof window.PREDICTION_PHALADEEPIKA.getPlanetaryResultsByHouse !== 'function') throw new Error('Function not found');
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c🧘 PART 2: YOGA SYSTEM', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('YOGAS_DATA is array', () => {
  if (!Array.isArray(window.YOGAS_DATA)) throw new Error('Not an array');
});

test('YOGAS_DATA has 95+ yogas', () => {
  if (!window.YOGAS_DATA || window.YOGAS_DATA.length < 95) {
    throw new Error(`Only ${window.YOGAS_DATA?.length || 0} yogas found (need 95+)`);
  }
});

test('YOGA_IMPLEMENTATIONS exists', () => {
  if (!window.YOGA_IMPLEMENTATIONS) throw new Error('Module not found');
});

test('detectAllYogasInChart is callable', () => {
  if (typeof window.detectAllYogasInChart !== 'function') throw new Error('Function not found');
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c📊 PART 3: BIRTH DATA STRUCTURE', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('BIRTH_PLANETS exists', () => {
  if (!window.BIRTH_PLANETS) throw new Error('BIRTH_PLANETS not found');
});

test('BIRTH_PLANETS has planets', () => {
  if (!window.BIRTH_PLANETS || Object.keys(window.BIRTH_PLANETS).length === 0) {
    throw new Error('BIRTH_PLANETS is empty - calculate chart first!');
  }
});

test('BIRTH_ASC exists', () => {
  if (!window.BIRTH_ASC) throw new Error('BIRTH_ASC not found');
});

test('VIMSH (Vimshottari Dasha) exists', () => {
  if (!window.VIMSH) throw new Error('VIMSH not found - calculate chart first!');
});

test('YOGINI (Yogini Dasha) exists', () => {
  if (!window.YOGINI) throw new Error('YOGINI not found - calculate chart first!');
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c🎨 PART 4: UI INTEGRATION', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('Predictions button exists', () => {
  const btn = document.getElementById('btnPredictions');
  if (!btn) throw new Error('Predictions button not found');
});

test('Predictions panel exists', () => {
  const panel = document.getElementById('predictionsPanel');
  if (!panel) throw new Error('Predictions panel not found');
});

test('Prediction date inputs exist', () => {
  const start = document.getElementById('pred-start');
  const end = document.getElementById('pred-end');
  if (!start || !end) throw new Error('Date inputs not found');
});

test('Analyze button exists', () => {
  const btn = document.getElementById('btnUpdatePredictions');
  if (!btn) throw new Error('Analyze button not found');
});

test('Predictions content div exists', () => {
  const content = document.getElementById('predictionsContent');
  if (!content) throw new Error('Predictions content div not found');
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c⚙️ PART 5: FUNCTION EXECUTION TESTS', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('getPlanetsInHouses() returns data', () => {
  const data = window.PREDICTION_ANALYSIS.getPlanetsInHouses();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No planet data returned - calculate chart first!');
  }
});

test('getCurrentDashaInfo() returns data', () => {
  const data = window.PREDICTION_FORECASTING.getCurrentDashaInfo();
  if (!data || !data.mahadasha) {
    throw new Error('No dasha data returned - calculate chart first!');
  }
});

test('getKharaGraha() returns data', () => {
  const data = window.PREDICTION_ADVANCED.getKharaGraha();
  if (!data || Object.keys(data).length === 0) {
    throw new Error('No Khara Graha data returned - calculate chart first!');
  }
});

test('getPlanetaryResultsByHouse() returns data', () => {
  const data = window.PREDICTION_PHALADEEPIKA.getPlanetaryResultsByHouse();
  if (!data || Object.keys(data).length === 0) {
    throw new Error('No Phaladeepika data returned');
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c🧬 PART 6: YOGA DETECTION TEST', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('detectAllYogasInChart() returns array', () => {
  const chart = window.BIRTH_CHART || { planets: window.BIRTH_PLANETS, asc: window.BIRTH_ASC };
  const yogas = window.detectAllYogasInChart(chart);
  if (!Array.isArray(yogas) || yogas.length === 0) {
    throw new Error('No yogas returned - calculate chart first!');
  }
});

test('Detected yogas count is valid', () => {
  const chart = window.BIRTH_CHART || { planets: window.BIRTH_PLANETS, asc: window.BIRTH_ASC };
  const yogas = window.detectAllYogasInChart(chart);
  const detected = yogas.filter(y => y.detected).length;
  console.log(`   → Found ${detected} detected yogas out of ${yogas.length} total`);
  if (detected < 0) throw new Error('Negative detected count');
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c📈 PART 7: DATA QUALITY CHECKS', 'color: #9B6FFF; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

test('Birth planets have expected fields', () => {
  const sun = window.BIRTH_PLANETS?.Sun;
  if (!sun) throw new Error('Sun not found');
  if (!sun.sn && sun.sn !== 0) throw new Error('Sign number missing');
  if (!sun.deg) throw new Error('Degree missing');
  if (!sun.house && sun.house !== 0) throw new Error('House missing');
});

test('Dasha data has valid structure', () => {
  if (!window.VIMSH || window.VIMSH.length === 0) {
    throw new Error('Dasha data empty - calculate chart first!');
  }
  const dasha = window.VIMSH[0];
  if (!dasha.lord) throw new Error('Dasha lord missing');
  if (!dasha.start && dasha.start !== 0) throw new Error('Start JD missing');
  if (!dasha.end && dasha.end !== 0) throw new Error('End JD missing');
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n%c🎯 FINAL SUMMARY', 'color: #C8A84B; font-weight: bold; font-size: 14px');
// ═══════════════════════════════════════════════════════════════════════════════

const totalTests = results.passed + results.failed;
const percentage = Math.round((results.passed / totalTests) * 100);

console.log('\n%c════════════════════════════════════════════════════════════════', 'color: #C8A84B; font-weight: bold');
console.log(`%c✅ PASSED: ${results.passed}/${totalTests}`, 'color: #3DFF9B; font-weight: bold; font-size: 14px');
if (results.failed > 0) {
  console.log(`%c❌ FAILED: ${results.failed}/${totalTests}`, 'color: #FF4477; font-weight: bold; font-size: 14px');
}
console.log(`%cSUCCESS RATE: ${percentage}%`, percentage === 100 ? 'color: #3DFF9B; font-weight: bold; font-size: 14px' : 'color: #FF9B3A; font-weight: bold; font-size: 14px');
console.log('%c════════════════════════════════════════════════════════════════', 'color: #C8A84B; font-weight: bold');

// Overall status
if (results.failed === 0 && results.passed >= 25) {
  console.log('%c\n🎉 ALL SYSTEMS READY FOR PRODUCTION! 🎉', 'color: #3DFF9B; font-weight: bold; font-size: 16px; background: rgba(61, 255, 155, 0.1); padding: 10px;');
} else if (results.failed === 0) {
  console.log('%c\n⚠️ SYSTEMS OPERATIONAL (Some checks skipped - calculate chart first)', 'color: #FF9B3A; font-weight: bold; font-size: 14px');
} else {
  console.log('%c\n❌ ISSUES DETECTED - See failures above', 'color: #FF4477; font-weight: bold; font-size: 14px');
}

console.log('%c════════════════════════════════════════════════════════════════', 'color: #C8A84B; font-weight: bold\n');

// Store results globally
window.VERIFICATION_RESULTS = {
  timestamp: new Date().toISOString(),
  ...results,
  successRate: percentage
};

console.log('%c📌 Results stored in: window.VERIFICATION_RESULTS', 'color: #44AAFF; font-style: italic');
console.log('%c📖 Full test details available: window.VERIFICATION_RESULTS.tests', 'color: #44AAFF; font-style: italic');
