const fs=require('fs'),vm=require('vm'),path=require('path');
const content=fs.readFileSync(path.join(__dirname,'../assets/js/main.js'),'utf8');
const code=content.slice(content.indexOf('function buildVimsh('),content.indexOf('// Determine Moon nakshatra lord'));
if(!code.startsWith('function buildVimsh('))throw Error('Missing code');
const ctx={Date,Math,VORD:['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'],VYRS:{Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const F=JSON.parse(fs.readFileSync(path.join(__dirname,'kp_reference_snapshots.json'),'utf8'));
for (const [id,d] of Object.entries(F)) {
 const moon=d.planets.Moon.sid,
 idx=Math.floor(moon/(360/27)), lord=ctx.VORD[idx%9], elapsed=(moon%(360/27))/(360/27)*ctx.VYRS[lord];
 const bdate=new Date(d.birth),tree=ctx.buildVimsh(bdate,lord,elapsed,ctx.VYRS[lord]);
 const start=new Date('2026-11-07T00:00:00Z');
 console.log('\n',id, 'moon',moon,'starting MD',lord,'elapsed years',elapsed);
 for(const md of tree.filter(m=>m.end>start && m.start<new Date('2040-01-01T00:00:00Z'))) {
  console.log('MD',md.lord,md.start.toISOString().slice(0,10),md.end.toISOString().slice(0,10));
  for(const ad of md.subs.filter(a=>a.end>start && a.start<new Date('2040-01-01T00:00:00Z'))) console.log(' AD',ad.lord,ad.start.toISOString().slice(0,10),ad.end.toISOString().slice(0,10));
 }
 const initial=tree[0];
 const nested=initial.subs; if(!nested.every(x=>x.start>=bdate&&x.end<=initial.end))throw Error('Initial MD nested invalid');
}
