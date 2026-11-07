const fs=require('fs'),vm=require('vm'),path=require('path');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'kp_reference_snapshots.json'),'utf8'));
let paint=0, texts=[];
const canvasCtx=new Proxy({}, {get:(_,name)=>{
 if(name==='measureText')return s=>({width:String(s).length*5});
 if(name==='fillText')return (...a)=>{paint++;texts.push(a[0]);};
 if(typeof name==='string')return (...a)=>{paint++;};
},set:()=>true});
const canvas={width:320,height:320,style:{},getContext:()=>canvasCtx};
const env={window:{devicePixelRatio:1},document:{getElementById:()=>canvas,documentElement:{}},getComputedStyle:()=>({getPropertyValue:()=>''}),console};vm.createContext(env);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/predictions/logic/sudarshan_chakra.js'),'utf8'),env);
const f=fixture['1981-09-18_01-20'];const ps=Object.fromEntries(Object.entries(f.planets).map(([p,r])=>[p,{sid:r.sid,sn:Math.floor(r.sid/30)}]));
const chart=env.window.SUDARSHAN_CHAKRA;
const a=chart.getChakraData(ps,{sn:2});
if(a.rows.length!==9)throw Error('9 planet rows missing');
chart.drawCombinedChart('sudarshanCombinedCanvas',ps,{sn:2});
if(canvas.width!==400||canvas.height!==400||paint<30)throw Error('Combined draw failed '+paint);
console.log('PASS Sudarshan 9 rows + actual drawing calls',paint,'text elements',texts.length);
