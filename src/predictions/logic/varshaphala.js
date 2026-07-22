/**
 * Comprehensive Varshaphala (Tajika Solar Return) Engine
 * Calculates the exact moment of Solar Return, casts the annual chart,
 * and computes Tajika Yogas, Panchadhikaris, Sahams, and Maasaphala.
 */

window.VARSHAPHALA = {
  // Tajika Deeptamsha (Orbs of influence)
  deeptamsha: {
    Sun: 15, Moon: 12, Mars: 8, Mercury: 7, Jupiter: 9, Venus: 7, Saturn: 9
  },

  jdToDate: function(jd) {
    const millis = (jd - 2440587.5) * 86400000;
    const dateObj = new Date(millis);
    return { year: dateObj.getUTCFullYear(), month: dateObj.getUTCMonth() + 1, day: dateObj.getUTCDate() };
  },

  /**
   * Casts the Varshaphala chart for a given target year.
   */
  castAnnualChart: function(targetYear) {
    if (!window.BIRTH_PLANETS || !window.BIRTH_PLANETS.Sun || !window.BIRTH) {
      console.warn("Natal chart not loaded for Varshaphala.");
      return null;
    }

    const natalSunSid = window.BIRTH_PLANETS.Sun.sid;
    const natalAscSn = window.BIRTH_ASC.sn;
    const bDate = window.BIRTH.date;
    const age = targetYear - bDate.getFullYear();

    // 1. Binary Search for Varshapravesha
    let searchStartJD = window.jd(targetYear, bDate.getMonth() + 1, bDate.getDate() - 2, 0);
    let searchEndJD = window.jd(targetYear, bDate.getMonth() + 1, bDate.getDate() + 2, 0);
    const ayan = window.BIRTH.ayan;
    const tolerance = 0.00001; 
    let midJD, diff;
    let iteration = 0;

    while (iteration < 50) {
      midJD = (searchStartJD + searchEndJD) / 2;
      const pos = window.computeAll(midJD, ayan, 1);
      diff = window.norm360(pos.Sun.sid - natalSunSid);
      if (diff > 180) diff -= 360;
      if (Math.abs(diff) < tolerance) break;
      if (diff > 0) searchEndJD = midJD;
      else searchStartJD = midJD;
      iteration++;
    }

    // 2. Cast Chart
    const varshaAsc = window.computeAsc(midJD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff, ayan, 1);
    const rawPos = window.computeAll(midJD, ayan, 1);
    const varshaPlanets = {};
    for (const [p, d] of Object.entries(rawPos)) {
      varshaPlanets[p] = {
        ...d,
        house: window.s2h(d.sn, varshaAsc.sn),
        sign: (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) ? window.ASTRO_CONSTANTS.SIGNS[d.sn] : "Sign" + d.sn
      };
    }

    const isDayVP = varshaPlanets.Sun.house >= 7;

    // 3. Muntha
    const munthaSn = (natalAscSn + age) % 12;
    const munthaSign = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) ? window.ASTRO_CONSTANTS.SIGNS[munthaSn] : "Sign"+munthaSn;
    const munthaHouse = window.s2h(munthaSn, varshaAsc.sn);
    const lords = {0:"Mars",1:"Venus",2:"Mercury",3:"Moon",4:"Sun",5:"Mercury",6:"Venus",7:"Mars",8:"Jupiter",9:"Saturn",10:"Saturn",11:"Jupiter"};
    const munthesh = lords[munthaSn];

    // 4. Varsheshvara (Year Lord)
    const janmaLagnesh = lords[natalAscSn];
    const varshaLagnesh = lords[varshaAsc.sn];
    const dinaRatriPati = isDayVP ? "Sun" : "Moon";
    
    const triRashiTable = {
      0: ["Sun", "Jupiter"], 1: ["Venus", "Moon"], 2: ["Saturn", "Mercury"], 3: ["Venus", "Mars"],
      4: ["Jupiter", "Sun"], 5: ["Moon", "Venus"], 6: ["Mercury", "Saturn"], 7: ["Mars", "Venus"],
      8: ["Saturn", "Saturn"], 9: ["Mars", "Mars"], 10: ["Jupiter", "Jupiter"], 11: ["Moon", "Moon"]
    };
    const triRashiPati = triRashiTable[varshaAsc.sn][isDayVP ? 0 : 1];
    const contenders = [munthesh, janmaLagnesh, varshaLagnesh, dinaRatriPati, triRashiPati];
    
    // Simplified Panchavargiya Bala
    let yearLord = contenders[0];
    let maxScore = -1;
    const panchadhikarisScores = {};

    contenders.forEach(p => {
      if(panchadhikarisScores[p]) return;
      let score = 0;
      const pos = varshaPlanets[p];
      if (!pos) return;
      
      if (p === munthesh) score += 5;
      if (p === varshaLagnesh) score += 5;
      if (p === janmaLagnesh) score += 3;
      if (p === triRashiPati) score += 2;
      if (p === dinaRatriPati) score += 1;

      // House strength
      if ([1, 4, 7, 10].includes(pos.house)) score += 10;
      else if ([2, 5, 8, 11].includes(pos.house)) score += 5;
      else score += 2;
      
      panchadhikarisScores[p] = score;
      if (score > maxScore && !["Rahu", "Ketu"].includes(p)) {
        maxScore = score;
        yearLord = p;
      }
    });

    // 5. Tajika Aspects & Ithasal Yoga
    const ithasalYogas = [];

    const tajikAspects = [
      { aspect: 0, orb: 5, type: 'Conjunction (Mutual)' },
      { aspect: 60, orb: 5, type: 'Mitra (Friendly 3/11)' },
      { aspect: 90, orb: 5, type: 'Shatru (Hostile 4/10)' },
      { aspect: 120, orb: 5, type: 'Ati Mitra (Very Friendly 5/9)' },
      { aspect: 180, orb: 5, type: 'Shatru (Hostile 7)' }
    ];

    const pKeys = Object.keys(varshaPlanets);
    for (let i = 0; i < pKeys.length; i++) {
      for (let j = i + 1; j < pKeys.length; j++) {
        const p1 = pKeys[i];
        const p2 = pKeys[j];
        // Rahu/Ketu don't usually cast Tajik aspects in classical way
        if (p1 === 'Rahu' || p1 === 'Ketu' || p2 === 'Rahu' || p2 === 'Ketu') continue;
        
        let diff = Math.abs(varshaPlanets[p1].sid - varshaPlanets[p2].sid);
        if (diff > 180) diff = 360 - diff;
        
        for (const a of tajikAspects) {
          if (Math.abs(diff - a.aspect) <= a.orb) {
            ithasalYogas.push({
              p1, p2, aspectType: a.type, distance: diff.toFixed(2)
            });
          }
        }
      }
    }

    // 6. Double Janma Check (Dwijanma)
    let doubleJanma = false;
    if(varshaAsc.sn === natalAscSn || varshaPlanets.Moon.sn === window.BIRTH_PLANETS.Moon.sn){
      doubleJanma = true;
    }

    // 6.5 Tajika Sahams
    const calcSaham = (p1Lon, p2Lon, ascLon) => {
      let s = window.norm360(p1Lon - p2Lon + ascLon);
      return s;
    };
    
    // Fix for Sahams calculation: varshaAsc.lon -> varshaAsc.sid
    const vAsc = varshaAsc.sid;
    const vSun = window.norm360(varshaPlanets.Sun.sid);
    const vMoon = window.norm360(varshaPlanets.Moon.sid);
    const vMars = window.norm360(varshaPlanets.Mars.sid);
    const vMercury = window.norm360(varshaPlanets.Mercury.sid);
    const vJupiter = window.norm360(varshaPlanets.Jupiter.sid);
    const vVenus = window.norm360(varshaPlanets.Venus.sid);
    const vSaturn = window.norm360(varshaPlanets.Saturn.sid);

    const sahams = {};
    sahams.Punya = isDayVP ? calcSaham(vMoon, vSun, vAsc) : calcSaham(vSun, vMoon, vAsc);
    sahams.Vidya = isDayVP ? calcSaham(vSun, vMoon, vAsc) : calcSaham(vMoon, vSun, vAsc);
    sahams.Yashas = isDayVP ? calcSaham(vJupiter, sahams.Punya, vAsc) : calcSaham(sahams.Punya, vJupiter, vAsc);
    sahams.Karma = isDayVP ? calcSaham(vMars, vMercury, vAsc) : calcSaham(vMercury, vMars, vAsc);
    sahams.Vivaha = calcSaham(vVenus, vSaturn, vAsc);
    sahams.Roga = isDayVP ? calcSaham(vAsc, vMoon, vAsc) : calcSaham(vMoon, vAsc, vAsc);
    sahams.Artha = isDayVP ? calcSaham(vMercury, vAsc, vAsc) : calcSaham(vAsc, vMercury, vAsc);
    
    // Add signs to Sahams
    const sahamData = {};
    for (const [sName, sLon] of Object.entries(sahams)) {
      const sn = Math.floor(sLon / 30);
      sahamData[sName] = { lon: sLon, sn: sn, sign: (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) ? window.ASTRO_CONSTANTS.SIGNS[sn] : "Sign"+sn };
    }

    
    // 6.5 Maasaphala (Monthly Returns)
    const maasaphala = [];
    let currentSunSid = natalSunSid;
    
    // Calculate 12 monthly returns
    for(let m=1; m<=12; m++) {
        let mStartJD = midJD + (m-1)*29.5;
        let mEndJD = mStartJD + 2;
        let targetSid = window.norm360(natalSunSid + (m-1)*30);
        
        let mMidJD, mDiff;
        let mIter = 0;
        while(mIter < 30) {
            mMidJD = (mStartJD + mEndJD) / 2;
            const mPos = window.computeAll(mMidJD, ayan, 1);
            mDiff = window.norm360(mPos.Sun.sid - targetSid);
            if (mDiff > 180) mDiff -= 360;
            if (Math.abs(mDiff) < tolerance) break;
            if (mDiff > 0) mEndJD = mMidJD;
            else mStartJD = mMidJD;
            mIter++;
        }
        
        const mAsc = window.computeAsc(mMidJD, window.BIRTH.lat, window.BIRTH.lon, window.BIRTH.utcOff, ayan, 1);
        const maasesh = lords[mAsc.sn];
        const mDate = (window.sweLoaded && window.swe && window.swe.revjul) ? window.swe.revjul(mMidJD, 1) : this.jdToDate(mMidJD);
        
        maasaphala.push({
            monthIndex: m,
            lord: maasesh,
            startDate: mDate.day + "/" + mDate.month + "/" + mDate.year,
            ascSign: (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) ? window.ASTRO_CONSTANTS.SIGNS[mAsc.sn] : "Sign"+mAsc.sn
        });
    }


    // 7. Analysis & Translation
    let analysisEn = `Muntha is in House ${munthaHouse} (${munthaSign}). `;
    let analysisHi = `मुंथा ${munthaHouse} भाव (${munthaSign}) में है। `;

    const goodHouses = [1, 2, 3, 5, 9, 10, 11];
    if (goodHouses.includes(munthaHouse)) {
      analysisEn += `This is an auspicious placement, promising growth in ${this.getHouseSigEn(munthaHouse)}. `;
      analysisHi += `यह एक शुभ स्थिति है, जो ${this.getHouseSigHi(munthaHouse)} में वृद्धि का संकेत देती है। `;
    } else {
      analysisEn += `This may bring challenges or hurdles related to ${this.getHouseSigEn(munthaHouse)}. `;
      analysisHi += `यह ${this.getHouseSigHi(munthaHouse)} से संबंधित चुनौतियां या बाधाएं ला सकता है। `;
    }

    analysisEn += `The Year Lord (Varsheshvara) is ${yearLord}. `;
    analysisHi += `वर्षेश (वर्ष का स्वामी) ${yearLord} है। `;

    if(doubleJanma){
      analysisEn += "Dwijanma (Double Janma) is present, which indicates a highly significant and potentially turbulent year. ";
      analysisHi += "द्विजन्म (डबल जन्म) उपस्थित है, जो एक अत्यधिक महत्वपूर्ण और संभावित रूप से उथल-पुथल वाले वर्ष का संकेत देता है। ";
    }

    return {
      year: targetYear,
      age: age,
      varshapraveshJD: midJD,
      asc: varshaAsc,
      planets: varshaPlanets,
      yearLord: yearLord,
      muntha: { sn: munthaSn, sign: munthaSign, house: munthaHouse, lord: munthesh },
      doubleJanma,
      sahams: sahamData,
      maasaphala,
      tajikaYogas: this.detectTajikaYogas(varshaPlanets, varshaAsc),
      panchadhikarisScores,
      analysis: analysisEn + "\n\n" + analysisHi,
      dateInfo: (window.sweLoaded && window.swe && window.swe.revjul) ? window.swe.revjul(midJD, 1) : this.jdToDate(midJD)
    };
  },

  getHouseSigEn: function(h){
    const s = {1:"self & health",2:"wealth & family",3:"courage & initiatives",4:"home & mother",5:"children & creativity",6:"health & debts",7:"partnerships",8:"obstacles & transformation",9:"luck & dharma",10:"career & status",11:"gains",12:"losses & expenses"};
    return s[h] || "this area";
  },
  
  getHouseSigHi: function(h){
    const s = {1:"स्वयं और स्वास्थ्य",2:"धन और परिवार",3:"साहस और पहल",4:"घर और माता",5:"संतान और रचनात्मकता",6:"स्वास्थ्य और ऋण",7:"साझेदारी",8:"बाधाओं और परिवर्तन",9:"भाग्य और धर्म",10:"करियर और स्थिति",11:"लाभ",12:"नुकसान और खर्च"};
    return s[h] || "इस क्षेत्र";
  },
detectTajikaYogas: function(varshaPlanets, varshaAsc) {
    const yogas = [];
    const planetsList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    
    // Tajika Orbs (Deeptamsha)
    const deeptamsha = { Sun: 15, Moon: 12, Mars: 8, Mercury: 7, Jupiter: 9, Venus: 7, Saturn: 9 };
    // Speeds (relative: Moon fastest, Saturn slowest)
    const speedRank = { Moon: 1, Mercury: 2, Venus: 3, Sun: 4, Mars: 5, Jupiter: 6, Saturn: 7 };

    const getOrb = (p1, p2) => (deeptamsha[p1] + deeptamsha[p2]) / 2;
    const isFaster = (p1, p2) => speedRank[p1] < speedRank[p2];

    const getTajikaAspect = (p1, p2) => {
        let diff = Math.abs(varshaPlanets[p1].sid - varshaPlanets[p2].sid);
        if (diff > 180) diff = 360 - diff;
        
        const aspects = [
            { a: 0, type: 'Conjunction' },
            { a: 60, type: 'Friendly' },
            { a: 90, type: 'Inimical' },
            { a: 120, type: 'Friendly' },
            { a: 180, type: 'Inimical' }
        ];
        
        const orb = getOrb(p1, p2);
        for (const aspect of aspects) {
            if (Math.abs(diff - aspect.a) <= orb) {
                return { type: aspect.type, exactDiff: Math.abs(diff - aspect.a), dist: diff };
            }
        }
        return null;
    };

    // 1. Ikbal Yoga (All planets in 1,4,7,10, 2,5,8,11)
    let allKendraPanaphara = true;
    let allApoklima = true;
    for (const p of planetsList) {
        const h = varshaPlanets[p].house;
        if ([3, 6, 9, 12].includes(h)) allKendraPanaphara = false;
        else allApoklima = false;
    }
    if (allKendraPanaphara) yogas.push({ name: 'Ikbal', desc: 'All planets in Kendra/Panaphara. Promises success and growth.' });
    if (allApoklima) yogas.push({ name: 'Induvara', desc: 'All planets in Apoklima. Indicates struggles, delays, or lack of support.' });

    const ithasals = [];

    // Analyze pairs
    for (let i = 0; i < planetsList.length; i++) {
        for (let j = i + 1; j < planetsList.length; j++) {
            let p1 = planetsList[i];
            let p2 = planetsList[j];
            
            let fast = isFaster(p1, p2) ? p1 : p2;
            let slow = isFaster(p1, p2) ? p2 : p1;
            
            const aspect = getTajikaAspect(fast, slow);
            if (!aspect) continue;

            // In classical Tajika, Ithasal happens when the fast planet is BEHIND the slow planet (applying).
            // Ishraf happens when the fast planet is AHEAD (separating).
            // Let's compute actual applying/separating by comparing precise degrees.
            const lF = varshaPlanets[fast].sid;
            const lS = varshaPlanets[slow].sid;
            
            // To simplify applying/separating for ANY aspect, we check if the fast planet is approaching the exact aspect point.
            // A simple approximation: if exactDiff is within 1 degree separating, it's Ishraf.
            // If it's applying, it's Ithasal.
            // In a standard horoscope, we'd need actual daily speeds to be perfectly accurate for retrogrades,
            // but we'll use a simplified longitude comparison assuming forward motion.
            
            // Simplified: if exact distance is narrowing, it's Ithasal.
            // Let's use simple degree comparison within sign for conjunction, or relative diff.
            // Actually, standard Tajika: if Fast Degree < Slow Degree (modulo 30), it is Applying (Ithasal).
            const dF = lF % 30;
            const dS = lS % 30;
            
            const isRetroF = varshaPlanets[fast].retro;
            const isRetroS = varshaPlanets[slow].retro;
            
            let isApplying = false;
            if (!isRetroF && !isRetroS) {
                isApplying = dF < dS; 
            } else if (isRetroF && !isRetroS) {
                isApplying = dF > dS;
            } else {
                isApplying = dF < dS; // simplified fallback
            }

            if (isApplying) {
                ithasals.push({ fast, slow, type: aspect.type });
                yogas.push({ name: 'Ithasal', desc: `${fast} and ${slow} form an applying ${aspect.type} aspect. Indicates future fruition.` });
                
                // Radda Yoga Check (Ithasal but retrograde or combust)
                if (varshaPlanets[fast].retro || varshaPlanets[slow].retro || varshaPlanets[fast].combust || varshaPlanets[slow].combust) {
                    yogas.push({ name: 'Radda', desc: `Ithasal between ${fast} and ${slow} is spoiled by retrogression or combustion.` });
                }
                
                // Duphali Kuttha / Duttota checks
                // Need basic strength (exaltation/own sign). Simplify by just checking own sign.
                const isOwnSign = (p) => (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.LORDS && window.ASTRO_CONSTANTS.LORDS[varshaPlanets[p].sn] === p);
                if (isOwnSign(slow) && !isOwnSign(fast)) {
                    yogas.push({ name: 'Duphali Kuttha', desc: `In Ithasal, ${slow} is strong while ${fast} is weak.` });
                }
                if (!isOwnSign(slow) && !isOwnSign(fast)) {
                    // Duttota implies BOTH are extremely weak (debilitated). We approximate with not-own-sign for now.
                }

                // Thambira Yoga Check (Fast at end of sign, Slow at start)
                if (dF >= 29 && dS <= 1) {
                    yogas.push({ name: 'Thambira', desc: `${fast} is at sign's end, ${slow} at beginning in Ithasal.` });
                }

            } else {
                if (Math.abs(dF - dS) <= 1.0) {
                    yogas.push({ name: 'Ishraf', desc: `${fast} and ${slow} form a separating ${aspect.type} aspect. Missed opportunity or past event.` });
                }
            }
        }
    }

    // Nakta & Yamaya
    // Find planets that DO NOT have Ithasal between them.
    for (let i = 0; i < planetsList.length; i++) {
        for (let j = i + 1; j < planetsList.length; j++) {
            let p1 = planetsList[i];
            let p2 = planetsList[j];
            const hasIthasal = ithasals.some(y => (y.fast === p1 && y.slow === p2) || (y.fast === p2 && y.slow === p1));
            
            if (!hasIthasal) {
                // Check if a third planet forms Ithasal with BOTH
                for (const p3 of planetsList) {
                    if (p3 === p1 || p3 === p2) continue;
                    const p3IthasalP1 = ithasals.some(y => (y.fast === p3 && y.slow === p1) || (y.fast === p1 && y.slow === p3));
                    const p3IthasalP2 = ithasals.some(y => (y.fast === p3 && y.slow === p2) || (y.fast === p2 && y.slow === p3));
                    
                    if (p3IthasalP1 && p3IthasalP2) {
                        if (isFaster(p3, p1) && isFaster(p3, p2)) {
                            if (!yogas.some(y => y.name === 'Nakta' && y.desc.includes(p3))) {
                                yogas.push({ name: 'Nakta', desc: `Faster ${p3} acts as a bridge between ${p1} and ${p2} (no direct aspect).` });
                            }
                        } else if (!isFaster(p3, p1) && !isFaster(p3, p2)) {
                            if (!yogas.some(y => y.name === 'Yamaya' && y.desc.includes(p3))) {
                                yogas.push({ name: 'Yamaya', desc: `Slower ${p3} acts as a bridge between ${p1} and ${p2} (no direct aspect).` });
                            }
                        }
                    }
                }
            }
        }
    }

    // Kamboola & Gairi Kamboola
    // If Ithasal exists, and Moon forms Ithasal with either planet
    ithasals.forEach(ith => {
        if (ith.fast !== 'Moon' && ith.slow !== 'Moon') {
            const moonFormsIthasal = ithasals.some(y => (y.fast === 'Moon' && (y.slow === ith.fast || y.slow === ith.slow)));
            if (moonFormsIthasal) {
                // If Moon is strong vs weak (debilitated/enemy). Simplified check.
                const isMoonWeak = [7, 8, 5, 9].includes(varshaPlanets.Moon.sn); // approximate
                if (isMoonWeak) {
                    yogas.push({ name: 'Gairi Kamboola', desc: `Moon forms Ithasal with ${ith.fast}/${ith.slow} but is weak, limiting success.` });
                } else {
                    yogas.push({ name: 'Kamboola', desc: `Strong Moon guarantees success of Ithasal between ${ith.fast} and ${ith.slow}.` });
                }
            }
        }
    });

    // Manau Yoga (Malefic interrupts)
    ithasals.forEach(ith => {
        ['Mars', 'Saturn'].forEach(malefic => {
            if (ith.fast !== malefic && ith.slow !== malefic) {
                const maleficAspectsFast = getTajikaAspect(malefic, ith.fast);
                const maleficAspectsSlow = getTajikaAspect(malefic, ith.slow);
                if (maleficAspectsFast || maleficAspectsSlow) {
                    yogas.push({ name: 'Manau', desc: `Malefic ${malefic} interferes with Ithasal between ${ith.fast} and ${ith.slow}.` });
                }
            }
        });
    });

    // Khallasa, Kuttha, Durapha
    for (const p of planetsList) {
        const hasAnyIthasal = ithasals.some(y => y.fast === p || y.slow === p);
        if (!hasAnyIthasal) {
            yogas.push({ name: 'Khallasa', desc: `${p} is void of course (no Ithasals).` });
        }
        
        const h = varshaPlanets[p].house;
        if ([1, 4, 7, 10].includes(h)) {
            // Check benefic aspects (Jupiter, Venus, Moon, Mercury)
            const beneficAspects = planetsList.filter(b => ['Jupiter', 'Venus'].includes(b) && getTajikaAspect(p, b));
            if (beneficAspects.length > 0) {
                yogas.push({ name: 'Kuttha', desc: `${p} is in Kendra aspected by benefics (${beneficAspects.join(',')}).` });
            }
        }
        if ([6, 8, 12].includes(h)) {
            const maleficAspects = planetsList.filter(m => ['Mars', 'Saturn', 'Sun'].includes(m) && getTajikaAspect(p, m));
            if (maleficAspects.length > 0) {
                yogas.push({ name: 'Durapha', desc: `${p} is in Dusthana aspected by malefics (${maleficAspects.join(',')}).` });
            }
        }
    }
    
    // Deduplicate
    const uniqueYogas = [];
    const seen = new Set();
    for (const y of yogas) {
        const key = y.name + y.desc;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueYogas.push(y);
        }
    }

    return uniqueYogas;
}

};

