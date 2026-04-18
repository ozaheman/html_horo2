const fs = require('fs');

const content = fs.readFileSync('src/yogas_data.js', 'utf-8');

// Find all yoga sections with their names and evaluate functions
const lines = content.split('\n');
const yogas = [];
let currentYoga = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect yoga name
  if (line.includes('name:') && line.includes('"')) {
    const nameMatch = line.match(/name:\s*"([^"]*)"/);
    if (nameMatch) {
      if (currentYoga) yogas.push(currentYoga);
      currentYoga = {
        name: nameMatch[1],
        lineNumber: i + 1,
        evaluate: null,
        category: null  
      };
    }
  }
  
  // Detect category
  if (currentYoga && line.includes('category:') && line.includes('"')) {
    const catMatch = line.match(/category:\s*"([^"]*)"/);
    if (catMatch) {
      currentYoga.category = catMatch[1];
    }
  }
  
  // Detect evaluate
  if (currentYoga && line.includes('evaluate:')) {
    let evalContent = line;
    // Collect multi-line evaluate functions
    let j = i;
    let braceCount = 0;
    let foundArrow = false;
    
    while (j < lines.length && (j === i || braceCount > 0 || !foundArrow || !evalContent.includes('}') || evalContent.endsWith(','))) {
      evalContent = lines.slice(i, j + 1).join('\n');
      
      if (evalContent.includes('=>')) foundArrow = true;
      braceCount = (evalContent.match(/\{/g) || []).length - (evalContent.match(/\}/g) || []).length;
      
      if (foundArrow && braceCount === 0 && (evalContent.trim().endsWith('},') || evalContent.trim().endsWith('},'))) {
        break;
      }
      j++;
    }
    
    currentYoga.evaluate = evalContent.trim();
    yogas.push(currentYoga);
    currentYoga = null;
  }
}

// Identify stubs and categorize
const stubs = yogas.filter(y => y.evaluate && y.evaluate.includes('=> false'));
const hasMinimalLogic = yogas.filter(y => 
  y.evaluate && 
  !y.evaluate.includes('=> false') && 
  y.evaluate.replace(/\s/g, '').length < 50
);

// Categorize stubs
const stubsByCategory = {};

stubs.forEach(stub => {
  const category = stub.category || 'Uncategorized';
  if (!stubsByCategory[category]) {
    stubsByCategory[category] = [];
  }
  stubsByCategory[category].push(stub.name);
});

console.log('='.repeat(60));
console.log('YOGA IMPLEMENTATION ANALYSIS');
console.log('='.repeat(60));
console.log('');

// Print stubs by category
console.log('STUB YOGAS BY CATEGORY:');
console.log('-'.repeat(60));
Object.keys(stubsByCategory).sort().forEach(category => {
  const count = stubsByCategory[category].length;
  console.log(`\n${category} (${count} stubs):`);
  stubsByCategory[category].forEach(name => {
    console.log(`  - ${name}`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('STUBS WITH MINIMAL LOGIC:');
console.log('-'.repeat(60));
hasMinimalLogic.forEach(yoga => {
  console.log(`${yoga.name} (${yoga.category || 'Uncategorized'})`);
  console.log(`  Length: ${yoga.evaluate.replace(/\s/g, '').length} chars`);
});

console.log('\n' + '='.repeat(60));
console.log('SUMMARY STATISTICS:');
console.log('-'.repeat(60));
console.log(`Total Yogas: ${yogas.length}`);
console.log(`Stub Yogas (=> false): ${stubs.length}`);
console.log(`Minimal Logic Yogas: ${hasMinimalLogic.length}`);
console.log(`Fully Implemented: ${yogas.length - stubs.length - hasMinimalLogic.length}`);
console.log('');
console.log('Top Priority Categories for Implementation:');
const sorted = Object.entries(stubsByCategory).sort((a, b) => b[1].length - a[1].length);
sorted.slice(0, 5).forEach(([cat, yogas]) => {
  console.log(`  ${cat}: ${yogas.length} stubs`);
});
