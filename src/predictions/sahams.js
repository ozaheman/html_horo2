/**
 * Tajaka Sahams Calculations
 * Important mathematical points in astrology for event prediction.
 * Reference: Tajaka Neelakanthi / Phala Deepika
 */

/**
 * Tajaka Sahams Calculations
 * Important mathematical points in astrology for event prediction.
 * Reference: Tajaka Neelakanthi / Phala Deepika
 */

window.SAHAMS = window.SAHAMS || {};

/**
 * Normalizes an angle to 0-360 degrees
 */
function norm360(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Returns sign number (1-12) for a given degree
 */
function getSignNumber(deg) {
  return Math.floor(deg / 30) + 1;
}

/**
 * Checks if Point A is on the SHORTER ARC between B and C.
 */
function isBetweenShortArc(b, c, a) {
  let start = b;
  let end = c;
  
  start = norm360(start);
  end = norm360(end);
  const valA = norm360(a);

  let diff = end - start;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;

  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const angDist = max - min;
  
  if (angDist <= 180) {
    return valA >= min && valA <= max;
  } else {
    return valA >= max || valA <= min;
  }
}

/**
 * Calculates generic Saham based on formula.
 */
function calculateBasicSaham(a, b, c, nameA, nameB, nameC, isDayBirth) {
  let valA = norm360(a);
  let valB = norm360(b);
  let valC = norm360(c);
  
  let saham = norm360(valC - valB + valA);
  const conditionMet = isBetweenShortArc(valB, valC, valA);
  
  let extra = "";
  if (!conditionMet) {
    if (isDayBirth) {
       saham = norm360(saham + 30);
       extra = " + 30°";
    } else {
       saham = norm360(saham - 30);
       extra = " - 30°";
    }
  }
  
  const baseFormula = `${nameC} - ${nameB} + ${nameA}`;
  const formulaWithExtra = baseFormula + extra;
  
  return {
    value: saham,
    formula: formulaWithExtra,
    wasBetween: conditionMet,
    calcDetails: `${valC.toFixed(1)} - ${valB.toFixed(1)} + ${valA.toFixed(1)}${extra}`
  };
}

/**
 * Calculates all 31 Tajaka Sahams based on provided chart data.
 */
window.CALCULATE_SAHAMS = function(planets, ascDegree, isDayBirth, houses) {
  const p = (name) => {
    const val = planets[name];
    if (val && typeof val === 'object' && 'sid' in val) return val.sid;
    return typeof val === 'number' ? val : 0;
  };

  const sun = p('Sun');
  const moon = p('Moon');
  const mars = p('Mars');
  const mercury = p('Mercury');
  const jupiter = p('Jupiter');
  const venus = p('Venus');
  const saturn = p('Saturn');
  const asc = ascDegree || 0;
  
  const signNames = window.ASTRO_CONSTANTS.SIGNS;
  
  const getLordDeg = (deg) => {
    const signNum = Math.floor(deg / 30);
    const lordName = window.ASTRO_CONSTANTS.SIGN_LORDS[signNum];
    return { name: lordName, deg: p(lordName) };
  };

  const getCusp = (h) => (houses && houses[h]) ? (houses[h].sid || houses[h]) : norm360(asc + (h - 1) * 30);

  const sahams = [];

  const topicMap = {
    'Rajya (Power)': { topic: 'Career & Public Life', color: '#00DDFF' },
    'Karma (Profession)': { topic: 'Career & Public Life', color: '#00DDFF' },
    'Yash (Fame)': { topic: 'Career & Public Life', color: '#00DDFF' },
    
    'Artha (Wealth)': { topic: 'Wealth & Finance', color: '#FFD700' },
    'Labha (Gains)': { topic: 'Wealth & Finance', color: '#FFD700' },
    'Daridra (Poverty)': { topic: 'Wealth & Finance', color: '#DAA520' },
    'Vyapara (Commerce)': { topic: 'Wealth & Finance', color: '#FFD700' },
    'Vanik (Trade)': { topic: 'Wealth & Finance', color: '#FFD700' },
    
    'Vivaha (Marriage)': { topic: 'Relationships & Family', color: '#FF4477' },
    'Putra (Children)': { topic: 'Relationships & Family', color: '#FF4477' },
    'Pitru (Father)': { topic: 'Relationships & Family', color: '#FF69B4' },
    'Matru (Mother)': { topic: 'Relationships & Family', color: '#FF69B4' },
    'Bhatri (Brother)': { topic: 'Relationships & Family', color: '#FF69B4' },
    'Preeti (Love)': { topic: 'Relationships & Family', color: '#FF1493' },
    'Paradhara (Adultery)': { topic: 'Relationships & Family', color: '#FF8C00' },

    'Deshantar (Travel)': { topic: 'Travel & Movement', color: '#9370DB' },
    'Jalapathna': { topic: 'Travel & Movement', color: '#9370DB' },
    
    'Kali (Strife)': { topic: 'Adversity & Strife', color: '#FF4500' },
    'Shatru (Enemies)': { topic: 'Adversity & Strife', color: '#FF4500' },
    'Disease (Health)': { topic: 'Adversity & Strife', color: '#FF6347' },
    'Apamrityu': { topic: 'Adversity & Strife', color: '#DC143C' },
    'Mrityu (Death)': { topic: 'Adversity & Strife', color: '#8B0000' },
    'Bandhana': { topic: 'Adversity & Strife', color: '#A52A2A' },
    'Bandak (Imprisonment)': { topic: 'Adversity & Strife', color: '#A52A2A' },
    
    'Punya (Fortune)': { topic: 'Core & Wellbeing', color: '#32CD32' },
    'Jeeva (Life)': { topic: 'Core & Wellbeing', color: '#32CD32' },
    'Vidya (Knowledge)': { topic: 'Core & Wellbeing', color: '#00FA9A' },
    'Shastra (Scriptures)': { topic: 'Core & Wellbeing', color: '#00FA9A' },
    'Desire': { topic: 'Core & Wellbeing', color: '#8A2BE2' },
    'Success': { topic: 'Core & Wellbeing', color: '#32CD32' },
    'Mahatmya (Greatness)': { topic: 'Core & Wellbeing', color: '#32CD32' }
  };

  const addS = (id, name, slug, A, B, C, nameA, nameB, nameC, isReversible = true) => {
    let valA = A, valB = B, valC = C, fA = nameA, fB = nameB, fC = nameC;
    
    if (!isDayBirth && isReversible) {
       valB = C; valC = B;
       fB = nameC; fC = nameB;
    }
    
    const res = calculateBasicSaham(valA, valB, valC, fA, fB, fC, isDayBirth);
    const val = res.value;
    const signNum = Math.floor(val / 30) + 1;
    let houseNum = signNum - (Math.floor(asc / 30) + 1) + 1;
    if (houseNum <= 0) houseNum += 12;

    const topicInfo = topicMap[name] || { topic: 'Other', color: '#AAAAAA' };

    sahams.push({
      id: id,
      name: `${id}. ${name}`,
      slug: slug,
      degree: val,
      sign: signNames[signNum - 1],
      house: houseNum,
      signDegree: val % 30,
      formula: res.formula,
      calcDetails: res.calcDetails,
      topic: topicInfo.topic,
      color: topicInfo.color
    });
    return val;
  };

  const punya = addS(1, "Punya (Fortune)", "Pun", asc, sun, moon, "Asc", "Sun", "Moon");
  const yash = addS(2, "Yash (Fame)", "Yas", asc, punya, jupiter, "Asc", "Punya", "Jupiter");
  const mahatmya = addS(3, "Mahatmya (Greatness)", "Mah", asc, mars, punya, "Asc", "Mars", "Punya");
  addS(4, "Rajya (Power)", "Raj", asc, sun, saturn, "Asc", "Sun", "Saturn");
  addS(5, "Desire", "Des", asc, venus, saturn, "Asc", "Venus", "Saturn");
  const sLord = getLordDeg(sun);
  addS(6, "Success", "Suc", saturn, sun, sLord.deg, "Saturn", "Sun", `Lord(${sLord.name})`);
  addS(7, "Kali (Strife)", "Kal", asc, mars, jupiter, "Asc", "Mars", "Jupiter");
  addS(8, "Pitru (Father)", "Pit", asc, sun, saturn, "Asc", "Sun", "Saturn");
  addS(9, "Matru (Mother)", "Mat", asc, venus, moon, "Asc", "Venus", "Moon");
  addS(10, "Putra (Children)", "Put", asc, moon, jupiter, "Asc", "Moon", "Jupiter", false);
  addS(11, "Jeeva (Life)", "Jee", asc, jupiter, saturn, "Asc", "Jupiter", "Saturn");
  addS(12, "Disease (Health)", "Dis", asc, moon, saturn, "Asc", "Moon", "Saturn");
  addS(13, "Mrityu (Death)", "Mri", saturn, moon, getCusp(8), "Saturn", "Moon", "Cusp VIII", false);
  addS(14, "Preeti (Love)", "Pre", asc, punya, saturn, "Asc", "Punya", "Saturn");
  addS(15, "Vivaha (Marriage)", "Viv", asc, saturn, venus, "Asc", "Saturn", "Venus", false);
  addS(16, "Paradhara (Adultery)", "Par", asc, sun, venus, "Asc", "Sun", "Venus", false);
  const l9 = getLordDeg(getCusp(9));
  addS(17, "Deshantar (Travel)", "Des", asc, l9.deg, getCusp(9), "Asc", `Lord(${l9.name})`, "Cusp IX", false);
  addS(18, "Jalapathna", "Jal", asc, saturn, 105, "Asc", "Saturn", "Can 15°");
  const l2 = getLordDeg(getCusp(2));
  addS(19, "Artha (Wealth)", "Art", asc, l2.deg, getCusp(2), "Asc", `Lord(${l2.name})`, "Cusp II", false);
  addS(20, "Vyapara (Commerce)", "Vya", asc, mercury, mars, "Asc", "Mercury", "Mars");
  addS(21, "Vanik (Trade)", "Van", asc, mercury, moon, "Asc", "Mercury", "Moon", false);
  addS(22, "Shatru (Enemies)", "Sha", asc, saturn, mars, "Asc", "Saturn", "Mars");
  addS(23, "Bandhana", "Ban", asc, saturn, punya, "Asc", "Saturn", "Punya");
  addS(24, "Bandak (Imprisonment)", "Bak", asc, moon, mercury, "Asc", "Moon", "Mercury");
  addS(25, "Shastra (Scriptures)", "Shs", asc, saturn, jupiter, "Asc", "Saturn", "Jupiter");
  addS(26, "Vidya (Knowledge)", "Vid", asc, moon, sun, "Asc", "Moon", "Sun");
  addS(27, "Apamrityu", "Apa", asc, mars, getCusp(8), "Asc", "Mars", "Cusp VIII");
  addS(28, "Karma (Profession)", "Kar", asc, mercury, mars, "Asc", "Mercury", "Mars");
  addS(29, "Bhatri (Brother)", "Bha", asc, saturn, jupiter, "Asc", "Saturn", "Jupiter", false);
  const l11 = getLordDeg(getCusp(11));
  addS(30, "Labha (Gains)", "Lab", asc, l11.deg, getCusp(11), "Asc", `Lord(${l11.name})`, "Cusp XI", false);
  addS(31, "Daridra (Poverty)", "Dar", asc, mercury, punya, "Asc", "Mercury", "Punya");

  const today = new Date();
  const results = sahams.map(s => {
    const activations = [];
    
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const jdVal = window.jd ? window.jd(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12) : 0;
        const mSid = window.moonLon ? window.moonLon(jdVal) : 0;
        
        const diff = Math.min(Math.abs(mSid - s.degree), 360 - Math.abs(mSid - s.degree));
        if (diff <= 6.5) { 
            activations.push({ date: d.toISOString().split('T')[0], planet: 'Moon', deg: mSid });
            break; 
        }
    }

    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const jdVal = window.jd ? window.jd(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12) : 0;
        const sSid = window.sunLon ? window.sunLon(jdVal) : 0;
        
        const diff = Math.min(Math.abs(sSid - s.degree), 360 - Math.abs(sSid - s.degree));
        if (diff <= 1.0) {
            activations.push({ date: d.toISOString().split('T')[0], planet: 'Sun', deg: sSid });
            break;
        }
    }

    return { ...s, nextActivations: activations };
  });

  return results;
};

/**
 * Estimates upcoming activation dates for a Saham point
 */
window.GET_SAHAM_ACTIVATIONS = function(sahamDeg, fromDate = new Date()) {
  const activities = [];
  const startDate = new Date(fromDate);
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const jdVal = window.jd ? window.jd(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12) : 0;
    const mSid = window.moonLon ? window.moonLon(jdVal) : 0;
    
    const diff = Math.min(Math.abs(mSid - sahamDeg), 360 - Math.abs(mSid - sahamDeg));
    if (diff <= 6.5) { 
      activities.push({ body: 'Moon', date: d, diff: diff, type: 'Monthly Trigger' });
      break;
    }
  }

  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const jdVal = window.jd ? window.jd(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12) : 0;
    const sSid = window.sunLon ? window.sunLon(jdVal) : 0;
    
    const diff = Math.min(Math.abs(sSid - sahamDeg), 360 - Math.abs(sSid - sahamDeg));
    if (diff <= 1.0) { 
      activities.push({ body: 'Sun', date: d, diff: diff, type: 'Annual Trigger' });
      break;
    }
  }

  return activities;
};

/**
 * Checks if a Saham is currently "active" on a specific date.
 */
window.IS_SAHAM_ACTIVE = function(sahamDeg, targetDate) {
    const jdVal = window.jd ? window.jd(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate(), 12) : 0;
    const mSid = window.moonLon ? window.moonLon(jdVal) : 0;
    const sSid = window.sunLon ? window.sunLon(jdVal) : 0;

    const moonDiff = Math.min(Math.abs(mSid - sahamDeg), 360 - Math.abs(mSid - sahamDeg));
    const sunDiff = Math.min(Math.abs(sSid - sahamDeg), 360 - Math.abs(sSid - sahamDeg));

    if (moonDiff <= 3.0) return { active: true, body: 'Moon', orb: moonDiff };
    if (sunDiff <= 1.0) return { active: true, body: 'Sun', orb: sunDiff };
    
    return { active: false };
};