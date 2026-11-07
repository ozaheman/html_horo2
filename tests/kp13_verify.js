const fs=require('fs'), vm=require('vm'), path=require('path');
const root=path.resolve(__dirname,'..');const context={window:{},console};context.window.KP_PREDICTION=null;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'src/predictions/logic/KP_prediction_13.js'),'utf8'),context);
const kp=context.window.KP_PREDICTION_13, fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'kp_reference_snapshots.json'),'utf8'));
const alias={Sun:'SUN',Moon:'MON',Mars:'MAR',Mercury:'MER',Jupiter:'JUP',Venus:'VEN',Saturn:'SAT',Rahu:'RAH',Ketu:'KET'};
let mismatches=[];
for(const [name,f] of Object.entries(fixtures)) {
 for(const [p,v] of Object.entries(f.planets)) {
   const k=kp.kplords(v.sid),got=[alias[['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'][Math.floor(v.sid/30)]],alias[k.nakLord],alias[k.subLord],alias[k.subSubLord]];
   if(got.join()!==v.expectedLords.join())mismatches.push(`${name} planet ${p}: ${got} expected ${v.expectedLords}`);
 }
 for(let i=0;i<12;i++){
   const v=f.cusps[i],k=kp.kplords(v.sid),got=[alias[['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'][Math.floor(v.sid/30)]],alias[k.nakLord],alias[k.subLord],alias[k.subSubLord]];
   if(got.join()!==v.expectedLords.join())mismatches.push(`${name} cusp ${i+1}: ${got} expected ${v.expectedLords}`);
 }
 const d=kp.analyzeData(Object.fromEntries(Object.entries(f.planets).map(([p,v])=>[p,v.sid])),f.cusps.map(x=>x.sid));
 console.log('\n'+name,'money:',d.rows.map(x=>`${x.planet} +${x.positive.join('.')} -${x.negative.join('.')}`).join('; '));
 console.log('Cusp 2,7,8,12:',[2,7,8,12].map(n=>n+':'+d.cuspLords[n-1].subLord).join(' '));
 console.log('events:',Object.fromEntries(Object.entries(d.events).map(([k,v])=>[k,{CSL:v.csl,houses:v.signified,rule:v.ruleMatched}])));
 if(name.startsWith('1981')){
  if(d.events.marriage.csl!=='Jupiter'||!d.events.marriage.ruleMatched||d.events.affair.ruleMatched||d.events.jail.ruleMatched||d.cleanTop.map(x=>x.planet).sort().join(',')!=='Jupiter,Mercury') throw Error('1981 event validation failed');
 }else{
  if(d.events.marriage.csl!=='Moon'||!d.events.marriage.ruleMatched||d.events.affair.ruleMatched||d.events.jail.ruleMatched||d.cleanTop.length) throw Error('1977 event validation failed');
 }
}
console.log('reference rows checked',2*(9+12),'lord mismatches',mismatches.length);if(mismatches.length){console.log(mismatches.join('\n'));process.exitCode=1;}else console.log('PASS: all screenshot RAS/NAK/SUB/SS chains and event rules');
