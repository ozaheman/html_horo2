/**
 * KP Part 13: Screenshot-auditable stellar significators, event promises and
 * Vimshottari windows. Interpretive model ONLY; never a factual claim about
 * finances, marriage, illness, incarceration or someone else's relationships.
 *
 * IMPORTANT: uses Placidus cusp starts (not equal houses), and the combined
 * planet+Nakshatra-lord four-source significations described in the supplied
 * Harish Kumar transcripts. Also exposes independent, orthodox four GRADE
 * significators, so they cannot be confused with reverse CSL assignments.
 */
(function () {
  'use strict';
  const P = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const R = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
  const ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
  const YRS = [7,20,6,10,7,18,16,19,17];
  const POS=[2,6,10,11], NEG=[5,8,9,12];
  const norm=x=>(x%360+360)%360;
  const unique=a=>[...new Set(a.filter(x=>Number.isInteger(x)&&x>=1&&x<=12))].sort((a,b)=>a-b);
  const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const short=d=>new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  function kplords(lon) {
    if (window.KP_PREDICTION && window.KP_PREDICTION._getKPLords) return window.KP_PREDICTION._getKPLords(lon);
    const n=norm(lon), ix=Math.floor(n/(360/27)), st=ix%9;
    const interval=(start,size,value)=>{
      let acc=0;
      for(let i=0;i<9;i++) {const idx=(start+i)%9,sz=size*YRS[idx]/120;
        if(value<acc+sz-1e-10 || i===8) return {idx,offset:value-acc,span:sz}; acc+=sz; }
    };
    const sub=interval(st,360/27,n-ix*(360/27));
    const ss=interval(sub.idx,sub.span,sub.offset);
    return {nakLord:ORDER[st],subLord:ORDER[sub.idx],subSubLord:ORDER[ss.idx]};
  }
  function houseOf(sid,cusps) {
    const v=norm(sid);
    for(let i=0;i<12;i++) {
      const start=norm(cusps[i]), end=norm(cusps[(i+1)%12]);
      if(norm(v-start)<norm(end-start)) return i+1;
    }
    throw new Error('Invalid cusp sequence; unable to locate house');
  }
  function analyzeData(planetDegrees,cusps) {
    if(!cusps || cusps.length!==12 || cusps.some(n=>!Number.isFinite(n))) throw new Error('12 finite Placidus cusp degrees required');
    for(let i=0;i<12;i++) if(!(norm(cusps[(i+1)%12]-cusps[i])>0)) throw new Error('Invalid house cusp geometry');
    const owners=cusps.map(x=>R[Math.floor(norm(x)/30)]);
    const positions={};
    P.forEach(p=>{
      const value=planetDegrees[p];
      const sid=typeof value==='number'?value:value&&value.sid;
      if(!Number.isFinite(sid)) throw new Error('Missing sidereal degree: '+p);
      positions[p]={sid:norm(sid),house:houseOf(sid,cusps),star:kplords(sid).nakLord,
        sub:kplords(sid).subLord};
    });
    const rows=P.map(p=>{
      const own=positions[p], star=positions[own.star], sources={};
      const add=(h,label)=>{if(h>=1){(sources[h]=sources[h]||[]).push(label);}};
      add(star.house,'star-lord '+own.star+' occupation');
      owners.forEach((o,i)=>{if(o===own.star)add(i+1,'star-lord '+own.star+' cusp ownership');});
      add(own.house,p+' occupation');
      owners.forEach((o,i)=>{if(o===p)add(i+1,p+' cusp ownership');});
      const houses=unique(Object.keys(sources).map(Number));
      return {planet:p,star:own.star,house:own.house,starHouse:star.house,
        houses,sources,positive:houses.filter(x=>POS.includes(x)),negative:houses.filter(x=>NEG.includes(x))};
    });
    const byPlanet=Object.fromEntries(rows.map(r=>[r.planet,r]));
    const cuspLords=cusps.map((sid,i)=>({house:i+1,sid,rasLord:owners[i],...kplords(sid)}));
    const fourGrades=Array.from({length:12},(_,i)=>{
      const h=i+1, occupant=P.filter(p=>positions[p].house===h), lord=owners[i];
      return {house:h,
        A:P.filter(p=>occupant.includes(positions[p].star)),
        B:occupant,
        C:P.filter(p=>positions[p].star===lord),
        D:[lord]};
    });
    function event(label,cusp,required,qualifier) {
      const csl=cuspLords[cusp-1].subLord;
      const signified=byPlanet[csl].houses;
      const matched=required.filter(h=>signified.includes(h));
      return {label,cusp,csl,required,matched,signified,ruleMatched:!!matched.length,
        ...(qualifier||{})};
    }
    const wealth=event('Wealth / 2nd cusp promise',2,POS);
    const marriage=event('Marriage / 7th cusp promise',7,[2,7,11]);
    const affair=event('8th CSL → 5th traditional relationship-symbol test',8,[5]);
    const foreign=event('12th CSL → travel / foreign connection',12,[3,9,12]);
    const jail=event('12th CSL Rahu + 3/8/12 confinement-symbol test',12,[3,8,12],{rahurequired:true});
    jail.ruleMatched=jail.csl==='Rahu'&&jail.matched.length>0;
    const expenditure=event('12th cusp expenditure themes',12,[1,2,3,4,5,6,7,8,9,10,11,12]);
    rows.sort((a,b)=>b.positive.length-a.positive.length||a.negative.length-b.negative.length||P.indexOf(a.planet)-P.indexOf(b.planet));
    const maxPositive=Math.max(...rows.map(r=>r.positive.length));
    const topTier=rows.filter(r=>r.positive.length===maxPositive);
    const cleanTop=topTier.filter(r=>!r.negative.length);
    const lowerClean=rows.filter(r=>r.positive.length>0&&!r.negative.length&&r.positive.length<maxPositive);
    const candidateCount=Math.max(0,...lowerClean.map(r=>r.positive.length));
    return {rows,byPlanet,positions,owners,cusps,cuspLords,fourGrades,maxPositive,
      topTier,cleanTop,lowerClean:lowerClean.filter(r=>r.positive.length===candidateCount),
      events:{wealth,marriage,affair,foreign,jail,expenditure},
      method:'KP unequal Placidus house starts; combined planet + Nakshatra-lord occupation/ownership; 4-grade hierarchy reported separately'};
  }
  function analyzeLive() {
    const natal=window.BIRTH_PLANETS, birth=window.BIRTH, chart=window.BIRTH_ASC;
    const liveDiv=(typeof CURRENT_DIV !== 'undefined') ? CURRENT_DIV : window.CURRENT_DIV;
    if(!natal||!birth||!chart||Number(liveDiv)!==1) return {error:'Open the natal D1 chart and calculate birth details first.'};
    if(!window.KP_PREDICTION_12 || !window.KP_PREDICTION_12.getCusps) return {error:'KP Part 12 Placidus cusp calculator is required.'};
    const c=window.KP_PREDICTION_12.getCusps(birth);
    if(!c) return {error:'Unable to compute Placidus cusps; no silent equal-house fallback.'};
    try {
      const result=analyzeData(natal,c.cusps);result.method+=' ('+(birth.ayan||'lahiri')+' ayanamsa)';result.ayanamsa=birth.ayan;
      const mismatch=Math.abs(norm(chart.sid-c.cusps[0]+180)-180);
      if(mismatch>0.5) result.warning='Displayed ascendant differs from calculated KP cusp 1 by '+mismatch.toFixed(2)+'°; verify ayanamsa, coordinates and ephemeris before timing.';
      return result;
    } catch(e){return {error:e.message};}
  }
  function dashaPeriods(data,tree,kind,from=new Date(),limit=8) {
    if(!data || !Array.isArray(tree))return [];
    const event=data.events[kind];if(!event||!event.ruleMatched)return [];
    let desired=kind==='wealth'?POS:kind==='marriage'?[2,7,11]:kind==='foreign'?[3,9,12]:kind==='affair'?[5,8]:[];
    if(!desired.length)return [];
    const found=[];
    for(const md of tree) {
      const mr=data.byPlanet[md.lord];if(!mr||new Date(md.end)<=from||!mr.houses.some(h=>desired.includes(h)))continue;
      for(const ad of md.subs||[]) {
        const ar=data.byPlanet[ad.lord];if(!ar||new Date(ad.end)<=from||!ar.houses.some(h=>desired.includes(h)))continue;
        const covered=unique([...mr.houses,...ar.houses].filter(h=>desired.includes(h)));
        if(kind==='affair' && !([5,8].every(h=>covered.includes(h)))) continue;
        const bothGain=kind==='wealth' && mr.positive.length && ar.positive.length;
        const mixed=kind==='wealth'&&(mr.negative.length||ar.negative.length);
        found.push({md:md.lord,ad:ad.lord,start:ad.start,end:ad.end,covered,mixed:!!mixed,
          criterion:kind==='wealth'? bothGain?'both lords signify gain houses':'partial gain-house coverage':'selected house overlap'});
      }
    }
    found.sort((a,b)=>new Date(a.start)-new Date(b.start));return found.slice(0,limit);
  }
  function renderForPanel(ctx) {
    ctx=ctx||{};
    const data=analyzeLive();
    if(data.error) return '<section style="padding:8px;font-size:10px;color:var(--muted);">KP 13 · '+html(data.error)+'</section>';
    const now=ctx.now||new Date();const tree=window.VIMSH||[];
    let out='<section class="'+html(ctx.sectionClass||'pred-section-title')+'" style="margin-top:12px;">KP SIGNIFICATORS · PROMISE → DASHA WINDOWS</section>';
    out+='<div style="font-size:9px;line-height:1.5;color:var(--muted);padding:7px;">Reference: supplied KP lecture rules. '+html(data.method)+'. Group scoring is not the same thing as CSL-of-house numbers; Grade A/B/C/D is separately calculated.'+(data.warning?' ⚠ '+html(data.warning):'')+'</div>';
    out+='<div style="overflow-x:auto"><table style="width:100%;font-size:9px;border-collapse:collapse;"><thead><tr><th>Planet</th><th>Star</th><th>Signified</th><th>Gain 2·6·10·11</th><th>Caution 5·8·9·12</th></tr></thead><tbody>';
    data.rows.forEach(r=>{out+='<tr style="border-bottom:1px solid var(--border);"><td><b>'+html(r.planet)+'</b></td><td>'+html(r.star)+'</td><td>'+r.houses.join(', ')+'</td><td style="color:#40c898">'+(r.positive.join(', ')||'—')+'</td><td style="color:#d7a05e">'+(r.negative.join(', ')||'—')+'</td></tr>';});
    out+='</tbody></table></div>';
    out+='<p style="font-size:9px;margin:5px 0;">'+(data.cleanTop.length?'Highest clean money MD candidate(s): '+data.cleanTop.map(r=>r.planet).join(', '):'No clean planet at the highest positive-house tier; '+(data.lowerClean.length?'lower-tier clean: '+data.lowerClean.map(r=>r.planet).join(', '):'no lower clean planet'))+'.</p>';
    Object.entries(data.events).filter(([k])=>k!=='expenditure').forEach(([key,e])=>{
      const label=key==='affair'?'8th-CSL/5th symbolic association (not evidence of infidelity)':key==='jail'?'12th-CSL/Rahu symbolic confinement association (not evidence of a criminal outcome)':e.label;
      out+='<div style="padding:5px 6px;margin:3px 0;border:1px solid var(--border);border-radius:4px;font-size:9px;"><b>'+html(label)+'</b> — cusp '+e.cusp+' CSL <b>'+html(e.csl)+'</b> signifies '+e.signified.join(', ')+'. Matched: '+(e.matched.join(', ')||'—')+'. <b>'+ (e.ruleMatched?'Rule match':'No rule match')+'</b>'+(key==='jail'?' (requires CSL = Rahu)':'')+'.';
      if(['wealth','marriage','foreign'].includes(key) && e.ruleMatched){
        const periods=dashaPeriods(data,tree,key,now,5);if(periods.length)out+='<details><summary>Candidate Dasha/Antardasha periods (illustrative)</summary>'+periods.map(p=>'<div>'+html(p.md)+' / '+html(p.ad)+' · '+short(p.start)+' – '+short(p.end)+(p.mixed?' · mixed money factors':'')+'</div>').join('')+'</details>';
      }
      out+='</div>';
    });
    const current=(window.KP_PREDICTION_12?.currentDasha||(()=>[]))(tree,now);
    if(current.length)out+='<p style="font-size:9px;">Running Vimshottari: '+current.map(x=>html(x.lord)).join(' → ')+'. 12th-house activation in an MD is <i>not</i> a medical or imprisonment forecast.</p>';
    out+='<details><summary style="cursor:pointer;font-size:9px;">4-grade house significators (A star of occupant → B occupant → C star of cusp lord → D cusp lord)</summary><div style="font-size:9px;">'+data.fourGrades.map(g=>'H'+g.house+': A '+(g.A.join(',')||'—')+' | B '+(g.B.join(',')||'—')+' | C '+(g.C.join(',')||'—')+' | D '+g.D.join(',')).join('<div style="height:3px"></div>')+'</div></details>';
    out+='<p style="font-size:8px;color:var(--muted);">These are traditional KP associations, not tested forecasts. They cannot establish earnings, marriage, affairs, criminal acts or hospital admissions; do not infer private conduct about a person from these labels.</p>';
    return out;
  }
  window.KP_PREDICTION_13={analyzeData,analyzeLive,kplords,houseOf,dashaPeriods,renderForPanel,POS,NEG};
}());
