async function test() {
  const { default: SwissEph } = await import('./node_modules/swisseph-wasm/src/swisseph.js');
  const swe = new SwissEph();
  await swe.initSwissEph();
  console.log("Loaded swe");
  
  // Date: 1981-09-18 01:20:00 IST (+5.5)
  // UT: 1981-09-17 19:50:00 UT
  let utH = 1 + 20/60 - 5.5; // -4.166666 hours.
  // This means 19.833333 hours on the PREVIOUS day (17th).
  // Let's use the jd formula from our code:
  function jd(y,mo,d,h){
    if(mo<=2){y--;mo+=12;}
    const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
    return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(mo+1))+d+h/24+B-1524.5;
  }
  let jday = jd(1981, 9, 18, 1 + 20/60 - 5.5);
  console.log("Julian Day UT:", jday);

  // SWE_PDB
  const SWE_PDB = { Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4, Jupiter: 5, Saturn: 6, Rahu: 11, Ketu: 11 };
  
  let out = "";
  for(let p in SWE_PDB) {
     if (p === 'Ketu') continue;
     const pos = swe.calc_ut(jday, SWE_PDB[p], swe.SEFLG_SWIEPH);
     out += `${p}: ${pos[0]} degrees Tropical\n`;
  }
  require('fs').writeFileSync('out.txt', out, 'utf8');
}
test();
