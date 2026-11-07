const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),main=fs.readFileSync(path.join(root,'assets/js/main.js'),'utf8');
const ctx={window:{},console,Date,Math,VORD:['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'],VYRS:{Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17}};vm.createContext(ctx);
vm.runInContext(main.slice(main.indexOf('function buildVimsh('),main.indexOf('// Determine Moon nakshatra lord')),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'src/predictions/logic/KP_prediction_13.js'),'utf8'),ctx);
const F=JSON.parse(fs.readFileSync(path.join(__dirname,'kp_reference_snapshots.json'),'utf8'));
for(const [name,c] of Object.entries(F)) {
 const a=ctx.window.KP_PREDICTION_13.analyzeData(Object.fromEntries(Object.entries(c.planets).map(([p,v])=>[p,v.sid])),c.cusps.map(x=>x.sid));
 const moon=c.planets.Moon.sid,idx=Math.floor(moon/(360/27)), lord=ctx.VORD[idx%9],el=(moon%(360/27))/(360/27)*ctx.VYRS[lord];
 const tree=ctx.buildVimsh(new Date(c.birth),lord,el,ctx.VYRS[lord]), from=new Date('2026-11-07T00:00:00Z');
 for(const k of ['wealth','marriage','foreign','affair','jail']){
  const w=ctx.window.KP_PREDICTION_13.dashaPeriods(a,tree,k,from,3);
  console.log(name,k,w.map(x=>x.md+'/'+x.ad+' '+new Date(x.start).toISOString().slice(0,10)+'–'+new Date(x.end).toISOString().slice(0,10)).join(' | ')||'none');
 }
}
