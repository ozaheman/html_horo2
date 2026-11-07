const fs=require('fs'),vm=require('vm'),path=require('path');
const y=1981,bdate=new Date(y,8,18,1,20,0);
const jd=(yy,mo,d,h=0)=>Date.UTC(yy,mo-1,d,0,0,0)/86400000+2440587.5+h/24;
const bjd=jd(y,9,18,1+20/60-5.5),norm=x=>(x%360+360)%360;
const keys=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
const positions=j=>Object.fromEntries(keys.map((p,i)=>{
 const sid=norm(i===0?151+(j-bjd)*360/365.2422:20+i*30+(j-bjd)*(i+1)*.03);
 return [p,{sid,sn:Math.floor(sid/30),house:Math.floor(sid/30)+1,retro:false}];
}));
const W={BIRTH:{date:bdate,lat:19.07,lon:72.88,utcOff:5.5,ayan:'krishnamurti'},BIRTH_JD:bjd,
  BIRTH_PLANETS:positions(bjd),BIRTH_ASC:{sn:2,sid:80},
  computeAll:(j)=>positions(j),computeAsc:(j)=>({sid:80,sn:2}),jd, norm360:norm,
  ASTRO_CONSTANTS:{SIGNS:['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']},birthJD:()=>bjd};
const ctx={window:W,console,Date,Math};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/predictions/logic/varshaphala.js'),'utf8'),ctx);
const annual=W.VARSHAPHALA.castAnnualChart(2026);
if(!annual)throw Error('No annual chart returned');
if(annual.maasaphala.length!==12)throw Error('Wrong monthly count: '+annual.maasaphala.length);
if(Math.abs(norm(annual.planets.Sun.sid-151+180)-180)>0.001)throw Error('Solar return not converged');
console.log('PASS annual year',annual.year,'solar JD',annual.varshapraveshJD,'moon chart month count',annual.maasaphala.length,'year-lord method',annual.yearLordMethod);
