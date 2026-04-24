const fs = require('fs');
const code = fs.readFileSync('src/yoga_divisional_analysis.js', 'utf8');
eval(code);

console.log('Navamsa mapping test:');
for (let i = 0; i < 12; i++) {
  console.log(`Sign ${i}: Start from ${getNavamsaStartSign(i)}`);
}