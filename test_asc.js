
const RAD=Math.PI/180, DEG=180/Math.PI;
function jd(y,mo,d,h=12){if(mo<=2){y--;mo+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(mo+1))+d+h/24+B-1524.5;}
function norm360(a){return((a%360)+360)%360;}
function sinD(a){return Math.sin(a*RAD);}function cosD(a){return Math.cos(a*RAD);}
function tanD(a){return Math.tan(a*RAD);}

function calcAscendant(jday, latDeg, lonDeg, utcOffset){
  const T=(jday-2451545.0)/36525.0;
  const eps=23.439292-0.013004*T-0.000164*T*T+0.000504*T*T*T;
  let GMST=280.46061837+360.98564736629*(jday-2451545.0)+0.000387933*T*T-T*T*T/38710000;
  GMST=norm360(GMST);
  const LST=norm360(GMST+lonDeg);
  const x=-sinD(LST)*cosD(eps)-tanD(latDeg)*sinD(eps);
  const y=cosD(LST);
  let asc=Math.atan2(y,x)*DEG;
  if(asc<0) asc+=360;
  return norm360(asc);
}

const y=2015, mo=7, d=13, h=10, mi=16, s=56, utcOff=5.5;
const lat=19.0760, lon=72.8777;
const utH = h - utcOff + mi/60 + s/3600;
const jday = jd(y, mo, d, utH);
const asc = calcAscendant(jday, lat, lon, utcOff);
console.log("JD:", jday);
console.log("Ascendant (Tropical):", asc);
console.log("Ayanamsa (Lahiri approx):", 24.0); 
console.log("Ascendant (Sidereal approx):", norm360(asc - 24.0));
console.log("Sign:", Math.floor(norm360(asc-24.0)/30));
