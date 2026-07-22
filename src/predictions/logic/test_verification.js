/**
 * Test Verification Script
 * Runs automated checks to verify all prediction and yoga systems are loaded correctly
 */

window.TEST_RESULTS = {
  timestamp: new Date().toISOString(),
  checks: [],
  systemsReady: false
};

function runTests() {
  const results = window.TEST_RESULTS;
  
  // Test 1: Check prediction modules exist
  const moduleTests = [
    { name: 'PREDICTION_ANALYSIS', exists: !!window.PREDICTION_ANALYSIS },
    { name: 'PREDICTION_FORECASTING', exists: !!window.PREDICTION_FORECASTING },
    { name: 'PREDICTION_ADVANCED', exists: !!window.PREDICTION_ADVANCED },
    { name: 'PREDICTION_PHALADEEPIKA', exists: !!window.PREDICTION_PHALADEEPIKA }
  ];
  
  moduleTests.forEach(test => {
    results.checks.push({
      category: 'Module Loading',
      test: test.name,
      status: test.exists ? '✅ PASS' : '❌ FAIL',
      details: test.exists ? `${test.name} loaded successfully` : `${test.name} not found in window`
    });
  });
  
  // Test 2: Check key functions exist
  const functionTests = [
    { module: 'PREDICTION_ANALYSIS', func: 'getPlanetsInHouses' },
    { module: 'PREDICTION_ANALYSIS', func: 'getConjunctions' },
    { module: 'PREDICTION_FORECASTING', func: 'getCurrentDashaInfo' },
    { module: 'PREDICTION_FORECASTING', func: 'projectDashaTimeline' },
    { module: 'PREDICTION_FORECASTING', func: 'suggestOptimalDates' },
    { module: 'PREDICTION_ADVANCED', func: 'getKharaGraha' },
    { module: 'PREDICTION_PHALADEEPIKA', func: 'getPlanetaryResultsByHouse' }
  ];
  
  functionTests.forEach(test => {
    const mod = window[test.module];
    const exists = mod && typeof mod[test.func] === 'function';
    results.checks.push({
      category: 'Function Check',
      test: `${test.module}.${test.func}`,
      status: exists ? '✅ PASS' : '❌ FAIL',
      details: exists ? 'Function available' : 'Function not found'
    });
  });
  
  // Test 3: Check yoga system
  const yogaTests = [
    { name: 'YOGAS_DATA', exists: !!window.YOGAS_DATA },
    { name: 'YOGA_IMPLEMENTATIONS', exists: !!window.YOGA_IMPLEMENTATIONS },
    { name: 'detectAllYogasInChart', exists: typeof window.detectAllYogasInChart === 'function' }
  ];
  
  yogaTests.forEach(test => {
    results.checks.push({
      category: 'Yoga System',
      test: test.name,
      status: test.exists ? '✅ PASS' : '❌ FAIL',
      details: test.exists ? 'Available' : 'Not found'
    });
  });
  
  // Test 4: Check birth data
  const birthDataTests = [
    { name: 'BIRTH_PLANETS', exists: !!window.BIRTH_PLANETS },
    { name: 'BIRTH_ASC', exists: !!window.BIRTH_ASC },
    { name: 'VIMSH (Dasha)', exists: !!window.VIMSH },
    { name: 'YOGINI (Dasha)', exists: !!window.YOGINI }
  ];
  
  birthDataTests.forEach(test => {
    results.checks.push({
      category: 'Birth Data',
      test: test.name,
      status: test.exists ? '✅ PASS' : '⚠️ NOT SET',
      details: test.exists ? 'Data available' : 'Will be set when chart is calculated'
    });
  });
  
  // Test 5: Try to run key functions
  if (window.BIRTH_PLANETS) {
    try {
      const planets = window.PREDICTION_ANALYSIS.getPlanetsInHouses();
      results.checks.push({
        category: 'Function Test',
        test: 'getPlanetsInHouses()',
        status: planets.length > 0 ? '✅ PASS' : '⚠️ EMPTY',
        details: `Returned ${planets.length} planets`
      });
    } catch (err) {
      results.checks.push({
        category: 'Function Test',
        test: 'getPlanetsInHouses()',
        status: '❌ ERROR',
        details: err.message
      });
    }
  }
  
  // Test 6: Try dasha info
  if (window.VIMSH) {
    try {
      const dashaInfo = window.PREDICTION_FORECASTING.getCurrentDashaInfo();
      const hasDashas = dashaInfo && dashaInfo.mahadasha;
      results.checks.push({
        category: 'Function Test',
        test: 'getCurrentDashaInfo()',
        status: hasDashas ? '✅ PASS' : '⚠️ NO DATA',
        details: hasDashas ? `Mahadasha: ${dashaInfo.mahadasha.lord}` : 'Dasha data not populated'
      });
    } catch (err) {
      results.checks.push({
        category: 'Function Test',
        test: 'getCurrentDashaInfo()',
        status: '❌ ERROR',
        details: err.message
      });
    }
  }
  
  // Determine overall status
  const failCount = results.checks.filter(c => c.status.includes('FAIL')).length;
  results.systemsReady = failCount === 0;
  
  // Log results
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 VEDIC JYOTISH SYSTEM TEST RESULTS');
  console.log('═'.repeat(60));
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Total Checks: ${results.checks.length}`);
  console.log(`Passed: ${results.checks.filter(c => c.status.includes('✅')).length}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Warnings: ${results.checks.filter(c => c.status.includes('⚠️')).length}`);
  console.log('═'.repeat(60) + '\n');
  
  // Group and display by category
  const categories = [...new Set(results.checks.map(c => c.category))];
  categories.forEach(cat => {
    const catChecks = results.checks.filter(c => c.category === cat);
    console.log(`\n📋 ${cat.toUpperCase()}`);
    console.log('─'.repeat(60));
    catChecks.forEach(check => {
      console.log(`${check.status} ${check.test}`);
      if (check.details) console.log(`   └─ ${check.details}`);
    });
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log(results.systemsReady ? '✅ ALL SYSTEMS READY' : '⚠️ SOME ISSUES DETECTED');
  console.log('═'.repeat(60) + '\n');
  
  return results;
}

// Run tests when everything is likely loaded
window.addEventListener('load', () => {
  setTimeout(() => {
    const results = runTests();
    // Expose results globally for inspection
    window.LAST_TEST_RESULTS = results;
  }, 2000);
});

// Also allow manual run
window.runSystemTests = function() {
  return runTests();
};

console.log('✓ Test verification script loaded. Tests will run automatically on page load.');
console.log('  Or run manually: window.runSystemTests()');
