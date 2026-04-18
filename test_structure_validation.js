#!/usr/bin/env node

/**
 * TEST STRUCTURE VALIDATION
 * Validates that all prediction modules, yoga systems, and UI components exist and are properly structured
 * (Does NOT require browser - runs in Node.js)
 */

const fs = require('fs');
const path = require('path');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(color, ...args) {
  console.log(color + args.join(' ') + RESET);
}

function test(description, condition) {
  totalTests++;
  if (condition) {
    log(GREEN, '✅', description);
    passedTests++;
  } else {
    log(RED, '❌', description);
    failedTests++;
  }
}

function checkFileExists(filePath, description) {
  test(description, fs.existsSync(filePath));
  return fs.existsSync(filePath);
}

function checkFileContains(filePath, pattern, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    test(description, content.includes(pattern));
    return content.includes(pattern);
  } catch {
    test(description, false);
    return false;
  }
}

function countPattern(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

const baseDir = __dirname;

console.log('\n');
log(CYAN, '═'.repeat(80));
log(CYAN, '🔍 VEDIC JYOTISH SYSTEM - STRUCTURE VALIDATION');
log(CYAN, '═'.repeat(80));

// ┌─────────────────────────────────────────┐
// │ 1. PREDICTION MODULES STRUCTURE         │
// └─────────────────────────────────────────┘

log(BLUE, '\n📋 PREDICTION MODULES STRUCTURE');
log(BLUE, '─'.repeat(80));

checkFileExists(path.join(baseDir, 'src/predictions/analysis.js'), 
  'analysis.js exists');
checkFileExists(path.join(baseDir, 'src/predictions/forecasting.js'), 
  'forecasting.js exists');
checkFileExists(path.join(baseDir, 'src/predictions/advanced_analysis.js'), 
  'advanced_analysis.js exists');
checkFileExists(path.join(baseDir, 'src/predictions/phaladeepika.js'), 
  'phaladeepika.js exists');

// Check content structure
checkFileContains(path.join(baseDir, 'src/predictions/analysis.js'), 'PREDICTION_ANALYSIS', 
  'analysis.js exports PREDICTION_ANALYSIS');
checkFileContains(path.join(baseDir, 'src/predictions/forecasting.js'), 'PREDICTION_FORECASTING', 
  'forecasting.js exports PREDICTION_FORECASTING');
checkFileContains(path.join(baseDir, 'src/predictions/advanced_analysis.js'), 'PREDICTION_ADVANCED', 
  'advanced_analysis.js exports PREDICTION_ADVANCED');
checkFileContains(path.join(baseDir, 'src/predictions/phaladeepika.js'), 'PREDICTION_PHALADEEPIKA', 
  'phaladeepika.js exports PREDICTION_PHALADEEPIKA');

// ┌─────────────────────────────────────────┐
// │ 2. YOGA SYSTEM STRUCTURE                │
// └─────────────────────────────────────────┘

log(BLUE, '\n🧘 YOGA SYSTEM STRUCTURE');
log(BLUE, '─'.repeat(80));

checkFileExists(path.join(baseDir, 'src/yoga_implementations.js'), 
  'yoga_implementations.js exists');
checkFileExists(path.join(baseDir, 'src/yogas_data.js'), 
  'yogas_data.js exists');
checkFileExists(path.join(baseDir, 'src/yoga_engine.js'), 
  'yoga_engine.js exists');

// Count yoga implementations
const yogaImplCount = countPattern(path.join(baseDir, 'src/yoga_implementations.js'), '"[^"]+Yoga"\\s*:\\s*\\{');
test('yoga_implementations.js has 30+ yoga implementations', yogaImplCount >= 30);
log(YELLOW, `  ℹ️  Found ${yogaImplCount} yoga implementations`);

const yogaDataCount = countPattern(path.join(baseDir, 'src/yogas_data.js'), '"[^"]+Yoga"\\s*:\\s*{');
test('yogas_data.js has 90+ yoga definitions', yogaDataCount >= 90);
log(YELLOW, `  ℹ️  Found ${yogaDataCount} yoga definitions in yogas_data.js`);

// ┌─────────────────────────────────────────┐
// │ 3. UI INTEGRATION                       │
// └─────────────────────────────────────────┘

log(BLUE, '\n🎨 UI INTEGRATION');
log(BLUE, '─'.repeat(80));

checkFileExists(path.join(baseDir, 'src/predictions_ui.js'), 
  'predictions_ui.js exists');

checkFileContains(path.join(baseDir, 'index.html'), 'predictions_ui.js', 
  'index.html includes predictions_ui.js');
checkFileContains(path.join(baseDir, 'index.html'), 'predictionsPanel', 
  'index.html has predictions panel HTML');
checkFileContains(path.join(baseDir, 'index.html'), 'btnPredictions', 
  'index.html has predictions button');

// ┌─────────────────────────────────────────┐
// │ 4. TEST & VERIFICATION SYSTEM           │
// └─────────────────────────────────────────┘

log(BLUE, '\n🧪 TEST & VERIFICATION SYSTEM');
log(BLUE, '─'.repeat(80));

checkFileExists(path.join(baseDir, 'src/test_verification.js'), 
  'test_verification.js exists');
checkFileExists(path.join(baseDir, 'COMPREHENSIVE_TEST.js'), 
  'COMPREHENSIVE_TEST.js exists');
checkFileExists(path.join(baseDir, 'ALL_TESTS_GUIDE.md'), 
  'ALL_TESTS_GUIDE.md exists');
checkFileExists(path.join(baseDir, 'RUN_TESTS_NOW.md'), 
  'RUN_TESTS_NOW.md exists');

checkFileContains(path.join(baseDir, 'index.html'), 'test_verification.js', 
  'index.html includes test_verification.js');

// ┌─────────────────────────────────────────┐
// │ 5. DOCUMENTATION                        │
// └─────────────────────────────────────────┘

log(BLUE, '\n📚 DOCUMENTATION');
log(BLUE, '─'.repeat(80));

checkFileExists(path.join(baseDir, 'IMPLEMENTATION_COMPLETE.md'), 
  'IMPLEMENTATION_COMPLETE.md exists');
checkFileExists(path.join(baseDir, 'TESTING_GUIDE.md'), 
  'TESTING_GUIDE.md exists');
checkFileExists(path.join(baseDir, 'EXPANSION_SUMMARY.md'), 
  'EXPANSION_SUMMARY.md exists');

// ┌─────────────────────────────────────────┐
// │ 6. CODE QUALITY CHECKS                  │
// └─────────────────────────────────────────┘

log(BLUE, '\n✨ CODE QUALITY');
log(BLUE, '─'.repeat(80));

// Check key functions exist in modules
checkFileContains(path.join(baseDir, 'src/predictions/analysis.js'), 'getPlanetsInHouses', 
  'analysis.js has getPlanetsInHouses function');
checkFileContains(path.join(baseDir, 'src/predictions/analysis.js'), 'getConjunctions', 
  'analysis.js has getConjunctions function');
checkFileContains(path.join(baseDir, 'src/predictions/analysis.js'), 'getNakshatraInfo', 
  'analysis.js has getNakshatraInfo function');

checkFileContains(path.join(baseDir, 'src/predictions/forecasting.js'), 'getCurrentDashaInfo', 
  'forecasting.js has getCurrentDashaInfo function');
checkFileContains(path.join(baseDir, 'src/predictions/forecasting.js'), 'suggestOptimalDates', 
  'forecasting.js has suggestOptimalDates function');

checkFileContains(path.join(baseDir, 'src/predictions/advanced_analysis.js'), 'getKharaGraha', 
  'advanced_analysis.js has getKharaGraha function');

checkFileContains(path.join(baseDir, 'src/predictions/phaladeepika.js'), 'getPhaladeepikaPrediction', 
  'phaladeepika.js has getPhaladeepikaPrediction function');

checkFileContains(path.join(baseDir, 'src/predictions_ui.js'), 'initPredictionsUI', 
  'predictions_ui.js has initPredictionsUI function');
checkFileContains(path.join(baseDir, 'src/predictions_ui.js'), 'updatePredictionsDisplay', 
  'predictions_ui.js has updatePredictionsDisplay function');

checkFileContains(path.join(baseDir, 'src/yoga_implementations.js'), 'enhanceYogaImplementations', 
  'yoga_implementations.js has enhanceYogaImplementations function');

// ┌─────────────────────────────────────────┐
// │ 7. INDEX.HTML INTEGRATION               │
// └─────────────────────────────────────────┘

log(BLUE, '\n🌐 INDEX.HTML SCRIPT INTEGRATION');
log(BLUE, '─'.repeat(80));

const indexPath = path.join(baseDir, 'index.html');
checkFileContains(indexPath, 'src="src/predictions/analysis.js"', 
  'index.html includes analysis.js');
checkFileContains(indexPath, 'src="src/predictions/forecasting.js"', 
  'index.html includes forecasting.js');
checkFileContains(indexPath, 'src="src/predictions/advanced_analysis.js"', 
  'index.html includes advanced_analysis.js');
checkFileContains(indexPath, 'src="src/predictions/phaladeepika.js"', 
  'index.html includes phaladeepika.js');
checkFileContains(indexPath, 'src="src/yoga_implementations.js"', 
  'index.html includes yoga_implementations.js');
checkFileContains(indexPath, 'src="src/predictions_ui.js"', 
  'index.html includes predictions_ui.js');
checkFileContains(indexPath, 'src="src/test_verification.js"', 
  'index.html includes test_verification.js');

// ┌─────────────────────────────────────────┐
// │ SUMMARY                                 │
// └─────────────────────────────────────────┘

log(CYAN, '\n' + '═'.repeat(80));
log(CYAN, '📊 TEST SUMMARY');
log(CYAN, '═'.repeat(80));

const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

log(GREEN, `\n✅ PASSED: ${passedTests}/${totalTests}`);
if (failedTests > 0) {
  log(RED, `❌ FAILED: ${failedTests}/${totalTests}`);
} else {
  log(GREEN, `❌ FAILED: 0/${totalTests}`);
}
log(YELLOW, `📈 SUCCESS RATE: ${successRate}%`);

if (successRate === 100) {
  log(GREEN, '\n🎉 ALL STRUCTURE CHECKS PASSED!');
  log(GREEN, '   ✓ All modules in place');
  log(GREEN, '   ✓ All functions defined');
  log(GREEN, '   ✓ All integrations complete');
  log(GREEN, '\n   → Ready to run COMPREHENSIVE_TEST.js in browser console');
  log(GREEN, '   → Follow instructions in RUN_TESTS_NOW.md');
  process.exit(0);
} else {
  log(RED, '\n⚠️  SOME CHECKS FAILED');
  log(RED, '   → Please fix issues before running browser tests');
  process.exit(1);
}
