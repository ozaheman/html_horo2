const fs = require('fs');

const content = fs.readFileSync('src/yogas_data.js', 'utf-8');

// Extract all yoga objects with their metadata
const lines = content.split('\n');
const yogas = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // Start of a yoga object
  if (line.trim().startsWith('{') && line.includes('name:')) {
    const yoga = {};
    
    // Extract name and other properties until we hit evaluate
    let j = i;
    let yogaBlock = '';
    let braceCount = 1;
    
    while (j < lines.length && braceCount > 0) {
      const blockLine = lines[j].trim();
      yogaBlock += lines[j] + '\n';
      
      braceCount += (lines[j].match(/\{/g) || []).length;
      braceCount -= (lines[j].match(/\}/g) || []).length;
      j++;
    }
    
    // Parse the yoga properties
    const nameMatch = yogaBlock.match(/name:\s*"([^"]*)"/);
    const categoryMatch = yogaBlock.match(/category:\s*'([^']*)'/);
    const descMatch = yogaBlock.match(/description:\s*"([^"]*)"/);
    const isStub = yogaBlock.includes('evaluate: (c) => false');
    
    if (nameMatch) {
      yoga.name = nameMatch[1];
      yoga.category = categoryMatch ? categoryMatch[1] : 'Uncategorized';
      yoga.description = descMatch ? descMatch[1] : '';
      yoga.isStub = isStub;
      yoga.lineNumber = i + 1;
      yogas.push(yoga);
    }
    
    i = j;
  } else {
    i++;
  }
}

// Separate stubs and implemented
const stubs = yogas.filter(y => y.isStub);
const implemented = yogas.filter(y => !y.isStub);

// Semantic categorization of stubs
const semanticCategories = {
  'Wealth & Prosperity': [
    'Dhana Yoga', 'Lakshmi Yoga', 'Vasumati Yoga', 'Sunapha Yoga', 
    'Anapha Yoga', 'Durdhara Yoga'
  ],
  'Inauspicious/Challenge': [
    'Daridra Yoga', 'Grahan Yoga', 'Kala Sarpa Yoga', 'Kemadruma Yoga'
  ],
  'Dignity & Strength': [
    'Uchcha Yoga', 'Swakshetra Yoga', 'Vargottama Yoga', 'Vakri Yoga', 
    'Astangata Yoga'
  ],
  'House & Aspect Yogas': [
    'Papakartari Yoga', 'Shubhakartari Yoga', 'Lagnadhi Yoga',
    'Bhava Shuddhi Yoga'
  ],
  'Special & Redemptive': [
    'Vipareeta Raj Yoga', 'Neecha Bhanga Raj Yoga'
  ],
  'Nakshatra Yogas': [
    'Pushya Nakshatra Yoga', 'Magha Nakshatra Yoga', 'Revati Nakshatra Yoga'
  ],
  'Muhurta/Timing Yogas': [
    'Amrit Yoga', 'Siddhi Yoga', 'Sadhya Yoga', 'Shubha Yoga',
    'Pushya Yoga (Timing)', 'Bhadra Yoga (Timing)', 'Ravi Yoga', 'Soma Yoga',
    'Mangal Yoga (Timing)', 'Budha Yoga (Timing)', 'Guru Yoga (Timing)',
    'Sukra Yoga (Timing)', 'Shani Yoga (Timing)', 'Rikta Yoga', 'Bhadd Yoga', 'Nanda Yoga'
  ],
  'Avatar Yogas': [
    'Matsya Avatar Yoga', 'Kurma Avatar Yoga', 'Varaha Avatar Yoga',
    'Narasimha Avatar Yoga', 'Vamana Avatar Yoga', 'Parasurama Avatar Yoga',
    'Rama Avatar Yoga', 'Krishna Avatar Yoga', 'Buddha Avatar Yoga', 'Kalki Avatar Yoga'
  ],
  'Aditya/Deity Yogas': [
    'Dhata Yoga', 'Mitra Yoga', 'Aryaman Yoga', 'Indra Yoga', 'Varuna Yoga',
    'Ansuman Yoga', 'Bhaga Yoga', 'Vivasvat Yoga', 'Pushan Yoga', 'Twashtar Yoga',
    'Savitar Yoga', 'Marichi Yoga'
  ],
  'Rudra Yogas': [
    'Rudra Yoga General', 'Hanuman Avatar Rudra', 'Bhairava Rudra Yoga',
    'Ardhanarishvara Rudra', 'Virabhadra Rudra', 'Ugra Rudra Yoga', 'Mahakala Rudra'
  ],
  'Vasu Yogas': [
    'Agni Vasu Yoga', 'Prithvi Vasu Yoga', 'Vayu Vasu Yoga',
    'Dhanista Vasu Yoga', 'Indra Vasu Yoga', 'Prabha Vasu Yoga',
    'Ratnakara Vasu Yoga', 'Satya Vasu Yoga'
  ]
};

// Generate impact analysis
const impactScores = {
  'Wealth & Prosperity': 95,        // HIGH - Core life indicator
  'Inauspicious/Challenge': 85,     // HIGH - Critical for remediation
  'Dignity & Strength': 90,         // HIGH - Planetary foundation
  'House & Aspect Yogas': 80,       // MEDIUM-HIGH - Life area specific
  'Special & Redemptive': 85,       // HIGH - Transformation indicators
  'Nakshatra Yogas': 70,            // MEDIUM - Compatibility/timing
  'Muhurta/Timing Yogas': 65,       // MEDIUM - Auspicious timing
  'Avatar Yogas': 40,               // MEDIUM-LOW - Spiritual connection
  'Aditya/Deity Yogas': 50,         // MEDIUM-LOW - Specialized attributes
  'Rudra Yogas': 60,                // MEDIUM - Intense transformation
  'Vasu Yogas': 55                  // MEDIUM - Resource attributes
};

// Generate report
console.log('═'.repeat(70));
console.log(' COMPREHENSIVE YOGA STUB ANALYSIS FOR PHASE 4 EXPANSION');
console.log('═'.repeat(70));
console.log('');

console.log('EXECUTIVE SUMMARY');
console.log('-'.repeat(70));
console.log(`Total Yogas in Database: ${yogas.length}`);
console.log(`Fully Implemented: ${implemented.length} (${((implemented.length/yogas.length)*100).toFixed(1)}%)`);
console.log(`Stubs Requiring Implementation: ${stubs.length} (${((stubs.length/yogas.length)*100).toFixed(1)}%)`);
console.log('');

// Show by semantic category with impact scores
console.log('STUBS BY SEMANTIC CATEGORY (Sorted by Impact Priority)');
console.log('-'.repeat(70));
console.log('');

const categoryStats = Object.entries(semanticCategories)
  .map(([cat, yogas]) => ({
    category: cat,
    count: yogas.length,
    impact: impactScores[cat] || 50,
    yogas
  }))
  .sort((a, b) => b.impact - a.impact);

categoryStats.forEach((stat, idx) => {
  const impactLevel = stat.impact >= 90 ? '🔴 CRITICAL' : 
                     stat.impact >= 80 ? '🟠 HIGH' :
                     stat.impact >= 70 ? '🟡 MEDIUM-HIGH' :
                     stat.impact >= 60 ? '🟡 MEDIUM' : '🟢 LOW';
  
  console.log(`${idx + 1}. ${stat.category} (${stat.count} stubs) ${impactLevel}`);
  console.log(`   Impact Score: ${stat.impact}/100  |  Implementation Effort: ${stat.count <= 5 ? 'LOW' : stat.count <= 12 ? 'MEDIUM' : 'HIGH'}`);
  stat.yogas.forEach(yoga => {
    const yogaData = stubs.find(s => s.name === yoga);
    if (yogaData) {
      console.log(`   ✓ ${yoga}`);
    }
  });
  console.log('');
});

// Estimated implementation effort
console.log('IMPLEMENTATION EFFORT ESTIMATE');
console.log('-'.repeat(70));
console.log('');

let totalMinutes = 0;
categoryStats.forEach((stat) => {
  let effortMinutes = 0;
  if (stat.category === 'Wealth & Prosperity') effortMinutes = stat.count * 8; // 8 min each
  else if (stat.category === 'Inauspicious/Challenge') effortMinutes = stat.count * 10; // Complex logic
  else if (stat.category === 'Dignity & Strength') effortMinutes = stat.count * 7; // Pattern-based
  else if (stat.category === 'House & Aspect Yogas') effortMinutes = stat.count * 6;
  else if (stat.category === 'Special & Redemptive') effortMinutes = stat.count * 15; // Complex
  else if (stat.category === 'Nakshatra Yogas') effortMinutes = stat.count * 3; // Simple check
  else if (stat.category === 'Muhurta/Timing Yogas') effortMinutes = stat.count * 5; // Timing rules
  else effortMinutes = stat.count * 4; // Avatar, Deity, Vasu - simpler patterns
  
  totalMinutes += effortMinutes;
  const hours = (effortMinutes / 60).toFixed(1);
  console.log(`${stat.category}: ${stat.count} stubs × ~${Math.round(effortMinutes/stat.count)} min/stub = ${hours}h`);
});

console.log('');
console.log(`TOTAL ESTIMATED TIME: ~${(totalMinutes / 60).toFixed(1)} hours (${Math.round(totalMinutes)} minutes)`);
console.log('');

// Implementation prioritization
console.log('PHASE 4 RECOMMENDED IMPLEMENTATION SEQUENCE');
console.log('-'.repeat(70));
console.log('');

console.log('PHASE 4A (Priority 1 - CRITICAL - 2-3 hours)');
const criticalCategories = categoryStats.filter(s => s.impact >= 85);
criticalCategories.forEach(stat => {
  console.log(`  ${stat.category} (${stat.count} stubs)`);
  console.log(`    Why: ${stat.category === 'Wealth & Prosperity' ? 'Core life indicator' : 
    stat.category === 'Inauspicious/Challenge' ? 'Critical for remediation' :
    stat.category === 'Special & Redemptive' ? 'Transformation indicators' : 'Unknown'}`);
  console.log('');
});

console.log('PHASE 4B (Priority 2 - HIGH - 1-2 hours)');
const highCategories = categoryStats.filter(s => s.impact >= 70 && s.impact < 85);
highCategories.forEach(stat => {
  console.log(`  ${stat.category} (${stat.count} stubs)`);
});

console.log('');
console.log('PHASE 4C (Priority 3 - MEDIUM - 2-3 hours)');
const mediumCategories = categoryStats.filter(s => s.impact < 70);
mediumCategories.forEach(stat => {
  console.log(`  ${stat.category} (${stat.count} stubs)`);
});

console.log('');
console.log('═'.repeat(70));
console.log('KEY OBSERVATIONS');
console.log('-'.repeat(70));
console.log('');
console.log('1. 74 out of 93 yogas are stubs (79.6% incomplete)');
console.log('2. Top 3 categories account for 15 stubs - HIGH PRIORITY');
console.log('3. 16 Muhurta yogas use timing rules - could batch implement');
console.log('4. Avatar/Deity/Vasu yogas (24 total) are lower priority - niche use');
console.log('5. Recommend starting with Wealth & Prosperity category (6 core stubs)');
console.log('');
console.log('PROJECTED IMPACT IF ALL PHASE 4 STUBS IMPLEMENTED:');
console.log('  • Current implementation rate: 20.4%');
console.log('  • After Phase 4: ~95%+ complete');
console.log('  • Coverage improvement: +75 percentage points');
console.log('  • User experience: Detection of nearly ALL major yogas');
console.log('');
