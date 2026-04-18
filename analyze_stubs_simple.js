const fs = require('fs');

const content = fs.readFileSync('src/yogas_data.js', 'utf-8');

// Simple approach: find all name: "X" followed by evaluate:
const lines = content.split('\n');
const stubs = [];
const implemented = [];

let currentName = null;
let currentCategory = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Get yoga name
  if (line.includes('name:') && line.includes('"')) {
    const nameMatch = line.match(/name:\s*"([^"]*)"/);
    if (nameMatch) {
      currentName = nameMatch[1];
      currentCategory = 'Uncategorized';
    }
  }
  
  // Get category
  if (currentName && line.includes('category:') && line.includes('"')) {
    const catMatch = line.match(/category:\s*"([^"]*)"/);
    if (catMatch) {
      currentCategory = catMatch[1];
    }
  }
  
  // Find evaluate line
  if (currentName && line.includes('evaluate:')) {
    if (line.includes('=> false')) {
      stubs.push({ name: currentName, category: currentCategory });
    } else {
      implemented.push({ name: currentName, category: currentCategory });
    }
    currentName = null;
  }
}

// Group stubs by category
const stubsByCategory = {};
stubs.forEach(s => {
  if (!stubsByCategory[s.category]) stubsByCategory[s.category] = [];
  stubsByCategory[s.category].push(s.name);
});

// Sort categories by count
const sorted = Object.entries(stubsByCategory).sort((a, b) => b[1].length - a[1].length);

console.log('YOGA IMPLEMENTATION ANALYSIS - STUBS REPORT\n');
console.log('============================================\n');

console.log('STUB YOGAS BY CATEGORY:\n');
sorted.forEach(([category, yogaNames]) => {
  console.log(`${category} (${yogaNames.length} stubs):`);
  yogaNames.forEach(name => {
    console.log(`  - ${name}`);
  });
  console.log();
});

console.log('============================================\n');
console.log('SUMMARY STATISTICS:\n');
console.log(`Total Yogas Analyzed: ${stubs.length + implemented.length}`);
console.log(`Stub Yogas (not implemented): ${stubs.length}`);
console.log(`Implemented Yogas: ${implemented.length}`);
console.log(`Implementation Rate: ${((implemented.length / (stubs.length + implemented.length)) * 100).toFixed(1)}%\n`);

console.log('TOP PRIORITY CATEGORIES FOR PHASE 4:\n');
sorted.slice(0, 5).forEach(([category, yogaNames], idx) => {
  console.log(`${idx + 1}. ${category}: ${yogaNames.length} stubs`);
  console.log(`   Impact: High priority - affects ${yogaNames.length} detection features`);
});
