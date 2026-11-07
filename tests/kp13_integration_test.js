const fs=require('fs'), vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),f=JSON.parse(fs.readFileSync(path.join(__dirname,'kp_reference_snapshots.json'),'utf8'));
const ctx={console,Math,Date,window:{CURRENT_DIV:1}};vm.createContext(ctx);
for(const file of ['KP_prediction.js','KP_prediction_13.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/predictions/logic',file),'utf8'),ctx);
for(const [name,c] of Object.entries(f)){
 const cusps=c.cusps.map(x=>x.sid);
 ctx.window.KP_PREDICTION_12={getCusps:()=>({cusps})};
 ctx.window.BIRTH={name,lat:19.076,lon:72.8777,ayan:'krishnamurti'};
 ctx.window.BIRTH_ASC={sid:cusps[0],sn:Math.floor(cusps[0]/30)};
 ctx.window.BIRTH_PLANETS=Object.fromEntries(Object.entries(c.planets).map(([p,v])=>[p,{sid:v.sid,house:99}]));
 const base=ctx.window.KP_PREDICTION,advanced=ctx.window.KP_PREDICTION_13;
 const cc=base.getAllCusps(cusps[0]);
 if(cc[1].cuspMethod!=='Placidus')throw Error('Not Placidus');
 const numbers=base.getPlanetNumbers(cc),expected=advanced.analyzeLive();
 if(expected.error)throw Error(expected.error);
 for(const planet of Object.keys(numbers)){
  const correct=expected.byPlanet[planet].houses;
  if(numbers[planet].join(',')!==correct.join(','))throw Error(name+' '+planet+' wrong significations');
 }
 const s=base.getSignificators(2,ctx.window.BIRTH_PLANETS,ctx.window.BIRTH_ASC.sn);
 if(s.cuspMethod!=='Placidus')throw Error('wrong significator method');
 if(s.gradeA.join(',')!==expected.fourGrades[1].A.join(','))throw Error('grade A wrong');
 console.log('PASS',name,'Placidus',cc[7].subLord,'numbers',Object.keys(numbers).length,'gradeA2',s.gradeA.join(','));
}
