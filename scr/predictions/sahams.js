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
 * Checks if Point C is numerically between A and B (0-360 range).
 * This matches the user's examples where "shorter arc" means smaller to larger degree.
 */
function isBetweenArc(a, b, c) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return c >= min && c <= max;
}

/**
 * Calculates generic Saham based on formula.
 * Formula: Point = A - B + C
 * If C is NOT between A and B, add 30 degrees.
 */
function calculateBasicSaham(a, b, c) {
  let valA = norm360(a);
  let valB = norm360(b);
  let valC = norm360(c);
  
  let saham = norm360(valA - valB + valC);
  
  const conditionMet = isBetweenArc(valA, valB, valC);
  
  if (!conditionMet) {
    saham = norm360(saham + 30);
  }
  
  // Return the raw calc components for UI display
  return {
    value: saham,
    calcStr: `${valA.toFixed(2)} - ${valB.toFixed(2)} + ${valC.toFixed(2)}${!conditionMet ? ' + 30 (Offset)' : ''}`,
    wasBetween: conditionMet
  };
}

/**
 * Calculates all 31 Tajaka Sahams based on provided chart data.
 * @param {Object} planets - map of planet names to their longitudes (0-360) 
 * @param {Number} ascDegree - Ascendant degree (0-360)
 * @param {Boolean} isDayBirth - Day/Night birth flag
 * @param {Object} houses - House cusps 1-12
 * @returns {Array} - Array of calculated sahams
 */
window.CALCULATE_SAHAMS = function(planets, ascDegree, isDayBirth, houses) {
  const sun = planets['Sun'] || 0;
  const moon = planets['Moon'] || 0;
  const mars = planets['Mars'] || 0;
  const mercury = planets['Mercury'] || 0;
  const jupiter = planets['Jupiter'] || 0;
  const venus = planets['Venus'] || 0;
  const saturn = planets['Saturn'] || 0;
  const asc = ascDegree || 0;
  
  const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  const getLordDeg = (deg) => {
    const signNum = getSignNumber(deg);
    const lords = {
      1: mars, 2: venus, 3: mercury, 4: moon, 5: sun, 6: mercury,
      7: venus, 8: mars, 9: jupiter, 10: saturn, 11: saturn, 12: jupiter
    };
    return lords[signNum] || 0;
  };

  // Helper for house cusps
  const getCusp = (h) => (houses && houses[h]) ? houses[h] : norm360(asc + (h - 1) * 30);

  const sahams = [];
  const addS = (id, name, slug, dayA, dayB, dayC, nightA, nightB, nightC, dayFormula, nightFormula) => {
    let a, b, c, formula;
    if (isDayBirth) {
      a = dayA; b = dayB; c = dayC;
      formula = dayFormula;
    } else {
      a = nightA; b = nightB; c = nightC;
      formula = nightFormula;
    }
    const res = calculateBasicSaham(a, b, c);
    const val = res.value;
    const signNum = getSignNumber(val);
    let houseNum = signNum - getSignNumber(asc) + 1;
    if (houseNum <= 0) houseNum += 12;

    sahams.push({
      id: id,
      name: `${id}. ${name}`,
      slug: slug,
      degree: val,
      sign: signNames[signNum - 1],
      house: houseNum,
      signDegree: val % 30,
      formula: formula,
      calc: res.calcStr
    });
    return val;
  };

  // 1 Punya Saham
  const punya = addS(1, "Punya (Fortune)", "Pun", moon, sun, asc, sun, moon, asc, "Moon - Sun + Asc", "Sun - Moon + Asc");
  // 2 Yash Saham
  const yash = addS(2, "Yash (Fame)", "Yas", jupiter, punya, asc, punya, jupiter, asc, "Jupiter - Punya + Asc", "Punya - Jupiter + Asc");
  // 3 Mahatmya Saham
  addS(3, "Mahatmya (Greatness)", "Mah", punya, mars, asc, mars, punya, asc, "Punya - Mars + Asc", "Mars - Punya + Asc");
  // 4 Rajya Saham
  addS(4, "Rajya (Power)", "Raj", saturn, sun, asc, sun, saturn, asc, "Saturn - Sun + Asc", "Sun - Saturn + Asc");
  // 5 Desire Saham
  addS(5, "Desire", "Des", saturn, venus, asc, venus, saturn, asc, "Saturn - Venus + Asc", "Venus - Saturn + Asc");
  // 6 Success Saham
  const sunLord = getLordDeg(sun);
  addS(6, "Success", "Suc", saturn, sun, sunLord, sun, saturn, sunLord, "Saturn - Sun + Lord(Sun)", "Sun - Saturn + Lord(Sun)");
  // 7 Kali Saham
  addS(7, "Kali (Strife)", "Kal", jupiter, mars, asc, mars, jupiter, asc, "Jupiter - Mars + Asc", "Mars - Jupiter + Asc");
  // 8 Pitru Saham
  addS(8, "Pitru (Father)", "Pit", saturn, sun, asc, sun, saturn, asc, "Saturn - Sun + Asc", "Sun - Saturn + Asc");
  // 9 Matru Saham
  addS(9, "Matru (Mother)", "Mat", moon, venus, asc, venus, moon, asc, "Moon - Venus + Asc", "Venus - Moon + Asc");
  // 10 Putra Saham
  addS(10, "Putra (Children)", "Put", jupiter, moon, asc, jupiter, moon, asc, "Jupiter - Moon + Asc", "Jupiter - Moon + Asc");
  // 11 Jeeva Saham
  addS(11, "Jeeva (Life)", "Jee", saturn, jupiter, asc, jupiter, saturn, asc, "Saturn - Jupiter + Asc", "Jupiter - Saturn + Asc");
  // 12 Disease Saham
  addS(12, "Disease", "Dis", asc, moon, asc, moon, asc, asc, "Asc - Moon + Asc", "Moon - Asc + Asc");
  // 13 Mrityu Saham
  addS(13, "Mrityu (Death)", "Mri", getCusp(8), moon, saturn, getCusp(8), moon, saturn, "Cusp VIII - Moon + Saturn", "Cusp VIII - Moon + Saturn");
  // 14 Preeti Saham
  addS(14, "Preeti (Love)", "Pre", saturn, punya, asc, punya, saturn, asc, "Saturn - Punya + Asc", "Punya - Saturn + Asc");
  // 15 Vivaha Saham
  addS(15, "Vivaha (Marriage)", "Viv", venus, saturn, asc, venus, saturn, asc, "Venus - Saturn + Asc", "Venus - Saturn + Asc");
  // 16 Paradhara Saham
  addS(16, "Paradhara (Adultery)", "Par", venus, sun, asc, venus, sun, asc, "Venus - Sun + Asc", "Venus - Sun + Asc");
  // 17 Deshantar Saham
  const l9 = getLordDeg(getCusp(9));
  addS(17, "Deshantar (Travel)", "Des", getCusp(9), l9, asc, getCusp(9), l9, asc, "Cusp IX - Lord IX + Asc", "Cusp IX - Lord IX + Asc");
  // 18 Jalapathana Saham (Cancer 15 = 105)
  addS(18, "Jalapathna", "Jal", 105, saturn, asc, saturn, 105, asc, "Cancer 15° - Saturn + Asc", "Saturn - Cancer 15° + Asc");
  // 19 Artha Saham
  const l2 = getLordDeg(getCusp(2));
  addS(19, "Artha (Wealth)", "Art", getCusp(2), l2, asc, getCusp(2), l2, asc, "Cusp II - Lord II + Asc", "Cusp II - Lord II + Asc");
  // 20 Vyapara Saham
  addS(20, "Vyapara (Commerce)", "Vya", mars, mercury, asc, mercury, mars, asc, "Mars - Mercury + Asc", "Mercury - Mars + Asc");
  // 21 Vanik Saham
  addS(21, "Vanik (Trade)", "Van", moon, mercury, asc, moon, mercury, asc, "Moon - Mercury + Asc", "Moon - Mercury + Asc");
  // 22 Shatru Saham
  addS(22, "Shatru (Enemies)", "Sha", mars, saturn, asc, saturn, mars, asc, "Mars - Saturn + Asc", "Saturn - Mars + Asc");
  // 23 Bandhana Saham
  addS(23, "Bandhana", "Ban", punya, saturn, asc, saturn, punya, asc, "Punya - Saturn + Asc", "Saturn - Punya + Asc");
  // 24 Bandak Saham (Imprisonment)
  addS(24, "Bandak", "Bak", mercury, moon, asc, moon, mercury, asc, "Mercury - Moon + Asc", "Moon - Mercury + Asc");
  // 25 Shastra Saham
  addS(25, "Shastra (Scriptures)", "Shs", jupiter, saturn, asc, saturn, jupiter, asc, "Jupiter - Saturn + Asc", "Saturn - Jupiter + Asc");
  // 26 Vidya Saham
  addS(26, "Vidya (Knowledge)", "Vid", sun, moon, asc, moon, sun, asc, "Sun - Moon + Asc", "Moon - Sun + Asc");
  // 27 Apamrityu Saham
  addS(27, "Apamrityu", "Apa", getCusp(8), mars, asc, mars, getCusp(8), asc, "Cusp VIII - Mars + Asc", "Mars - Cusp VIII + Asc");
  // 28 Karma Saham
  addS(28, "Karma (Profession)", "Kar", mars, mercury, asc, mercury, mars, asc, "Mars - Mercury + Asc", "Mercury - Mars + Asc");
  // 29 Bhatri Saham
  addS(29, "Bhatri (Brother)", "Bha", jupiter, saturn, asc, jupiter, saturn, asc, "Jupiter - Saturn + Asc", "Jupiter - Saturn + Asc");
  // 30 Labha Saham
  const l11 = getLordDeg(getCusp(11));
  addS(30, "Labha (Gains)", "Lab", getCusp(11), l11, asc, getCusp(11), l11, asc, "Cusp XI - Lord XI + Asc", "Cusp XI - Lord XI + Asc");
  // 31 Daridra Saham
  addS(31, "Daridra (Poverty)", "Dar", punya, mercury, asc, mercury, punya, asc, "Punya - Mercury + Asc", "Mercury - Punya + Asc");

  return sahams;
};

