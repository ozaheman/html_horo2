// src/yogas_data.js
// Comprehensive Vedic Astrology Yogas Database - All 90+ Yoga Types
// Categories: Natal Yogas (~40+), Pancha Mahapurusha (5), Muhurta Yogas, Avatar Yogas (10),
// Deity Yogas (35+), Nakshatra Yogas (27), Tithi/Vaar Yogas, Drishti Yogas, 
// Element/Dosha Yogas, Spiritual Yogas, Kala Yogas
// Each yoga includes: formation, effect, strength, remedies, mantras, deities

// src/yogas_data.js
// Comprehensive Vedic Astrology Yogas Database - All 90+ Yoga Types
// Categories: Natal Yogas (~40+), Pancha Mahapurusha (5), Muhurta Yogas, Avatar Yogas (10),
// Deity Yogas (35+), Nakshatra Yogas (27), Tithi/Vaar Yogas, Drishti Yogas, 
// Element/Dosha Yogas, Spiritual Yogas, Kala Yogas
// Each yoga includes: formation, effect, strength, remedies, mantras, deities

window.YOGAS_DATA = [
  // ========== NATAL YOGAS - AUSPICIOUS ==========
  
  {
    name: "Raj Yoga",
    category: 'Auspicious',
    description: "Conjunction or mutual aspect of lords of Kendra (1,4,7,10) and Trikona (1,5,9) houses",
    result: "Brings power, authority, success, high status, and prosperous life. Strong leadership and influence.",
    effect: "Native achieves prominent position, gains respect and prosperity. Multiple avenues of success.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Worship the 9-planet mantra', 'Donate to temples', 'Practice Surya Namaskar', 'Perform family charity'],
    mantras: ['Om Namah Shivaya', 'Om Aim Saraswati Namaha', 'Gayatri Mantra'],
    deities: ['Vishnu', 'Lakshmi', 'Sun'],
    keywords: ['Power', 'Authority', 'Success', 'Status'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const kendraHouses = [1, 4, 7, 10];
      const trikonaHouses = [1, 5, 9];
      const asnc = c.asc.sn || 0;
      
      let rationale = "";
      let found = false;

      kendraHouses.forEach(kh => {
        trikonaHouses.forEach(th => {
          const kendraSignNum = (asnc + kh - 1) % 12;
          const trikonaSignNum = (asnc + th - 1) % 12;
          const kendraLord = getSignLord(signNames[kendraSignNum]);
          const trikonaLord = getSignLord(signNames[trikonaSignNum]);
          
          const kp = c.planets[kendraLord];
          const tp = c.planets[trikonaLord];
          if (kp && tp && kp.sn === tp.sn && Math.abs((kp.deg || 0) - (tp.deg || 0)) <= 8) {
            found = true;
            rationale = `${kendraLord} (Lord of H${kh}) and ${trikonaLord} (Lord of H${th}) are conjunct in ${kp.sign}.`;
          }
        });
      });
      return found ? { result: true, rationale } : false;
    }
  },
  
  {
    name: "Dhana Yoga",
    category: 'Auspicious',
    description: "Association of wealth-giving houses (2,5,9,11) lords with each other or with Lagna lord",
    result: "Leads to financial prosperity, accumulation of wealth, and material comforts. Multiple sources of income.",
    effect: "Native becomes wealthy through multiple channels. Financial stability and growth throughout life.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Worship Lakshmi', 'Donate yellow items', 'Practice charity', 'Feed the poor'],
    mantras: ['Om Shreem Mahalakshmiyai Namaha', 'Om Aim Kleem Sauh', 'Om Mahakalikayai Namaha'],
    deities: ['Lakshmi', 'Jupiter', 'Mercury'],
    keywords: ['Wealth', 'Prosperity', 'Finance', 'Abundance'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const wealthHouses = [2, 5, 9, 11];
      const asnc = c.asc.sn || 0;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      
      for(let i=0; i<wealthHouses.length; i++) {
        for(let j=i+1; j<wealthHouses.length; j++) {
           const h1 = wealthHouses[i], h2 = wealthHouses[j];
           const l1 = getSignLord(signNames[(asnc + h1 - 1) % 12]);
           const l2 = getSignLord(signNames[(asnc + h2 - 1) % 12]);
           const p1 = c.planets[l1], p2 = c.planets[l2];
           if (p1 && p2 && p1.sn === p2.sn) {
             return { result: true, rationale: `House ${h1} Lord (${l1}) and House ${h2} Lord (${l2}) are in conjunction in ${p1.sign}.` };
           }
        }
      }
      return false;
    },
  },

  {
    name: "Gajakesari Yoga",
    description: "Jupiter positioned in a Kendra (1,4,7,10) from the Moon",
    result: "Bestows wisdom, wealth, respect, fame, and authority in society. Strength like an elephant and courage of a lion.",
    effect: "Native becomes wise leader with good reputation. Success in endeavors and respect from all.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Wear yellow gemstone', 'Fast on Thursdays', 'Chant Guru Mantra', 'Worship Jupiter'],
    mantras: ['Om Brihaspataye Namaha', 'Om Guru Guravaay Namaha', 'Om Jupitery Namaha'],
    deities: ['Jupiter', 'Brihaspati', 'Wisdom-givers'],
    keywords: ['Wisdom', 'Fame', 'Authority', 'Respect'],
    evaluate: (c) => {
      const jup = c.planets.Jupiter, moon = c.planets.Moon;
      if(!jup || !moon) return false;
      const d = (jup.sn - moon.sn + 12) % 12;
      const kendraPos = (d / 3) + 1;
      if ([0,3,6,9].includes(d)) {
        return { 
          result: true, 
          rationale: `Jupiter is in the ${kendraPos}${kendraPos===1?'st':(kendraPos===2?'nd':(kendraPos===3?'rd':'th'))} house position from the Moon.` 
        };
      }
      return false;
    }
  },

  {
    name: "Chandra-Mangala Yoga",
    description: "Conjunction or mutual aspect of the Moon and Mars",
    result: "Indicates financial prosperity, landed properties, strong determination, and good reputation.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Donate red items', 'Wear coral', 'Chant Mars mantra', 'Perform land donations'],
    mantras: ['Om Angarakaya Namaha', 'Om Mangalaya Namaha', 'Om Chandraya Namaha'],
    deities: ['Mars', 'Hanuman', 'Moon'],
    keywords: ['Prosperity', 'Determination', 'Property', 'Reputation'],
    evaluate: (c) => {
      const moon = c.planets.Moon, mars = c.planets.Mars;
      if (!moon || !mars) return false;
      if (moon.sn === mars.sn) return { result: true, rationale: "Moon and Mars are conjunct in the same sign." };
      if ((moon.sn - mars.sn + 12) % 12 === 6) return { result: true, rationale: "Moon and Mars are in mutual aspect (7th house from each other)." };
      return false;
    },
  },

  {
    name: "Budha-Aditya Yoga",
    description: "Conjunction of the Sun and Mercury",
    result: "Enhances intelligence, communication skills, and success in education and business.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    methodOfCalculation: 'Formed when the Sun and Mercury occupy the same sign/house in the natal chart, with Mercury not combust (too close to the Sun to be seen).',
    cause: 'Mercury (intellect, communication) united with the Sun (vitality, authority) sharpens the mind and lends confidence and clarity to self-expression, provided Mercury is not overwhelmed by the Sun\'s glare (combustion).',
    nullification: 'Weakened or negated if Mercury is combust (typically within about 14° of the Sun) or afflicted by malefic conjunction/aspect; strongest when Mercury is also in its own or exaltation sign.',
    referenceShloka: 'A well-known combination discussed across classical texts (e.g. Phaladeepika, Saravali) under Surya-Budha yoga — precise verse numbering varies by edition, so no single canonical shloka is quoted here.',
    remedies: ['Offer green items', 'Wear emerald', 'Chant Mercury mantra', 'Study scriptures'],
    mantras: ['Om Budhaya Namaha', 'Om Herambaya Namaha', 'Om Mitrayaya Namaha'],
    deities: ['Mercury', 'Saraswati', 'Sun'],
    keywords: ['Intelligence', 'Communication', 'Success', 'Business'],
    evaluate: (c) => {
      const sun = c.planets.Sun, merc = c.planets.Mercury;
      if (sun && merc && sun.sn === merc.sn && !merc.combust) {
         return { result: true, rationale: "Sun and Mercury are conjunct (Mercury is not combust)." };
      }
      return false;
    },
  },

  {
    name: "Saraswati Yoga",
    description: "Jupiter, Venus, and Mercury in Kendra, Trikona, or 2nd house",
    result: "Brings immense knowledge, learning, artistic talents, and eloquence. Excellence in education and sciences.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Donate books', 'Study regularly', 'Chant Saraswati mantra', 'Support education'],
    mantras: ['Om Aim Saraswati Namaha', 'Om Saraswati Devyai Namaha', 'Rig Veda Suktas'],
    deities: ['Saraswati', 'Brihaspati', 'Learning deities'],
    keywords: ['Knowledge', 'Learning', 'Arts', 'Eloquence'],
    evaluate: (c) => {
      const p = c.planets;
      if(!p.Jupiter || !p.Venus || !p.Mercury) return false;
      const ben = [p.Jupiter, p.Venus, p.Mercury];
      return ben.some(b => [0,3,6,9,1].includes(b.house));
    }
  },

  {
    name: "Lakshmi Yoga",
    description: "9th lord in 10th house, associated with/aspected by benefic like Jupiter",
    result: "Immense wealth, luxury, prosperity, comfort, good standard of living, respect.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Worship Lakshmi', 'Charitable giving', 'Friday practices', 'Support temples'],
    mantras: ['Om Shreem Mahalakshmiyai Namaha', 'Om Padmakshi Namaha'],
    deities: ['Lakshmi', 'Venus'],
    keywords: ['Wealth', 'Luxury', 'Prosperity', 'Comfort'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const lord9 = getSignLord(signNames[(ascSn + 8) % 12]);
      const p9 = c.planets[lord9];
      if (!p9 || p9.house !== 10) return false;
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const conjunct = benefics.filter(b => b !== lord9 && c.planets[b] && c.planets[b].house === 10);
      const aspecting = benefics.filter(b => b !== lord9 && c.planets[b] && hasAspect(b, c.planets[b].house, 10));
      if (conjunct.length || aspecting.length) {
        const via = conjunct.length ? `conjunct with ${conjunct.join(', ')}` : `aspected by ${aspecting.join(', ')}`;
        return { result: true, rationale: `9th Lord (${lord9}) is placed in the 10th house and is ${via}.` };
      }
      return false;
    },
  },

  {
    name: "Vasumati Yoga",
    description: "2nd lord in 5th, 5th lord in 2nd, or both in Kendra/Trikona",
    result: "Powerful wealth-giving yoga. Immense financial gains, property, assets. Can rise from poverty to wealth.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Maintain financial discipline', 'Charitable giving', 'Property management'],
    mantras: ['Om Shreem Mahalakshmiyai Namaha', 'Om Kuberaya Namaha'],
    deities: ['Lakshmi', 'Jupiter', 'Kubera'],
    keywords: ['Wealth', 'Property', 'Assets', 'Prosperity'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const lord2 = getSignLord(signNames[(ascSn + 1) % 12]);
      const lord5 = getSignLord(signNames[(ascSn + 4) % 12]);
      const p2 = c.planets[lord2], p5 = c.planets[lord5];
      if (!p2 || !p5) return false;
      if (p2.house === 5 && p5.house === 2) {
        return { result: true, rationale: `2nd Lord (${lord2}) sits in the 5th house while 5th Lord (${lord5}) sits in the 2nd — a direct mutual exchange.` };
      }
      if (isKendraTrikona(p2.house) && isKendraTrikona(p5.house)) {
        return { result: true, rationale: `Both the 2nd Lord (${lord2}, H${p2.house}) and 5th Lord (${lord5}, H${p5.house}) are placed in Kendra/Trikona houses.` };
      }
      return false;
    },
  },

  {
    name: "Sunapha Yoga",
    description: "Planets (except Sun) in 2nd from Moon",
    result: "Self-made wealth, property, and intelligence.",
    quality: "Positive",
    varga: 1,
    methodOfCalculation: 'Check the 2nd house counted from the Moon. If any planet other than the Sun (and, per most classical formulations, other than Rahu/Ketu) occupies that house, Sunapha Yoga forms.',
    cause: 'A planet flanking the Moon from the accumulation house (2nd) lends the mind material and vocal support, translating into self-earned resources rather than inherited ones.',
    nullification: 'Weakened if the qualifying planet is combust, debilitated, or heavily afflicted; strongest when the planet is a natural benefic (especially Jupiter or Venus) in good dignity.',
    referenceShloka: 'One of the three classical lunar yogas (with Anapha and Durdhara) described in Brihat Parashara Hora Shastra Ch. 36 and Brihat Jataka — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
    remedies: ['Real estate investment', 'Business growth', 'Property development'],
    mantras: ['Om Chandramase Namaha', 'Om Rakaaye Namaha'],
    deities: ['Moon', 'Kubera'],
    keywords: ['Wealth', 'Property', 'Intelligence', 'Self-made'],
    evaluate: (c) => {
      const moon = c.planets.Moon; if(!moon) return false;
      const h2 = (moon.sn + 1) % 12;
      return Object.keys(c.planets).some(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
    }
  },

  {
    name: "Anapha Yoga",
    description: "Planets (except Sun) in 12th from Moon",
    result: "Polite manners, good health, and spiritual inclination.",
    quality: "Positive",
    varga: 1,
    methodOfCalculation: 'Check the 12th house counted from the Moon. If any planet other than the Sun (and, per most classical formulations, other than Rahu/Ketu) occupies that house, Anapha Yoga forms.',
    cause: 'A planet flanking the Moon from the release/dissolution house (12th) lends the mind an inward, refined quality — physical strength and good bearing paired with an eventual pull toward renunciation.',
    nullification: 'Weakened if the qualifying planet is combust, debilitated, or heavily afflicted; a malefic forming the yoga tends to blunt the polite/generous expression while keeping the physical-strength component.',
    referenceShloka: 'One of the three classical lunar yogas (with Sunapha and Durdhara) described in Brihat Parashara Hora Shastra Ch. 36 and Brihat Jataka — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
    remedies: ['Spiritual practices', 'Meditation', 'Pilgrimages', 'Health maintenance'],
    mantras: ['Om Namah Shivaya', 'Om Chandramase Namaha'],
    deities: ['Moon', 'Shiva'],
    keywords: ['Health', 'Spirituality', 'Politeness', 'Virtue'],
    evaluate: (c) => {
      const moon = c.planets.Moon; if(!moon) return false;
      const h12 = (moon.sn + 11) % 12;
      return Object.keys(c.planets).some(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
    }
  },

  {
    name: "Durdhara Yoga",
    description: "Planets in both 2nd and 12th from Moon",
    result: "Abundance of wealth, vehicles, and loyal followers.",
    quality: "Positive",
    varga: 1,
    methodOfCalculation: 'Formed when Sunapha Yoga and Anapha Yoga occur simultaneously — i.e. planets other than the Sun (and Rahu/Ketu) occupy both the 2nd and 12th houses counted from the Moon at once.',
    cause: 'The Moon fully flanked on both sides gives it the strongest possible structural support among the three lunar yogas, combining the material/vocal gains of Sunapha with the refinement of Anapha.',
    nullification: 'Considered the best of the three when both flanking planets are natural benefics; weakened if either or both are malefic, debilitated, or combust.',
    referenceShloka: 'The strongest of the three classical lunar yogas described in Brihat Parashara Hora Shastra Ch. 36 and Brihat Jataka — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
    remedies: ['Property acquisition', 'Vehicle purchase', 'Support community'],
    mantras: ['Om Chandramase Namaha', 'Om Rakaaye Namaha'],
    deities: ['Moon', 'Kubera'],
    keywords: ['Wealth', 'Followers', 'Vehicles', 'Abundance'],
    evaluate: (c) => {
      const moon = c.planets.Moon; if(!moon) return false;
      const h2 = (moon.sn + 1) % 12, h12 = (moon.sn + 11) % 12;
      const p2 = Object.keys(c.planets).some(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
      const p12 = Object.keys(c.planets).some(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
      return p2 && p12;
    }
  },

  // ========== INAUSPICIOUS YOGAS ==========

  {
    name: "Kemadruma Yoga",
    description: "No planets in 2nd /12th from Moon",
    result: "Mental isolation or financial struggles. Canceled if planets are in kendra from Lagna/Moon.",
    effect: "Loneliness, financial instability, mental distress, and lack of support from family/friends.",
    quality: "Negative",
    strength: 'Strong',
    varga: 1,
    methodOfCalculation: 'Check the houses immediately before and after the Moon (the 12th and 2nd counted from the Moon\'s sign). If no planet (other than the Moon itself, and excluding Sun/Rahu/Ketu in this implementation) occupies either house, the Moon is considered "isolated" and Kemadruma Yoga forms.',
    cause: 'An isolated Moon — with no planetary support flanking it — leaves the mind (which the Moon signifies) without steadying influences, classically read as sorrow, dependency, and instability.',
    nullification: 'Classically cancelled (or greatly reduced) if the Moon is in a Kendra (1st/4th/7th/10th) from the Lagna, if the Moon is conjunct or aspected by a benefic, if the Moon is in Kendra from the Lagna lord, or if the Moon is strong (own/exalted sign). This implementation reports only the raw isolation condition; cancellation factors are not separately checked.',
    referenceShloka: 'A major yoga discussed extensively in Brihat Parashara Hora Shastra and Phaladeepika under Kemadruma Yoga — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
    remedies: ['Strengthen 2nd/12th house lords', 'Wear pearls', 'Practice meditation', 'Build relationships'],
    mantras: ['Om Namah Shivaya', 'Maha Mrityunjaya Mantra', 'Om Chandramase Namaha'],
    deities: ['Shiva', 'Moon', 'Hanuman'],
    keywords: ['Loneliness', 'Instability', 'Distress', 'Lack of support'],
    evaluate: (c) => {
      const moon = c.planets.Moon; if(!moon) return false;
      const h2 = (moon.sn + 1) % 12, h12 = (moon.sn + 11) % 12;
      const p2 = Object.keys(c.planets).some(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h2);
      const p12 = Object.keys(c.planets).some(p => !['Sun','Moon','Rahu','Ketu'].includes(p) && c.planets[p].sn === h12);
      return !p2 && !p12;
    }
  },

  {
    name: "Daridra Yoga",
    description: "11th lord in 6th/8th/12th house; 2nd lord weak; Malefics aspect wealth houses",
    result: "Financial struggles, poverty, difficulty accumulating wealth, career instability.",
    quality: "Negative",
    strength: 'Strong',
    varga: 1,
    remedies: ['Strengthen 2nd/11th lords', 'Donate food', 'Chant Kubera mantra', 'Business discipline'],
    mantras: ['Om Shreem Mahalakshmiyai Namaha', 'Maha Mrityunjaya Mantra', 'Om Kuberaya Namaha'],
    deities: ['Lakshmi', 'Jupiter', 'Kubera'],
    keywords: ['Poverty', 'Struggle', 'Financial loss', 'Instability'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const lord11 = getSignLord(signNames[(ascSn + 10) % 12]);
      const lord2 = getSignLord(signNames[(ascSn + 1) % 12]);
      const p11 = c.planets[lord11];
      const p2 = c.planets[lord2];
      if (p11 && [6, 8, 12].includes(p11.house)) {
        return { result: true, rationale: `11th Lord (${lord11}) is placed in House ${p11.house}, a Dusthana, choking off the flow of gains.` };
      }
      if (p2 && (p2.status === 'Debil.' || p2.status === 'Enemy') && [6, 8, 12].includes(p2.house)) {
        return { result: true, rationale: `2nd Lord (${lord2}) is weak (${p2.status}) and placed in a Dusthana (H${p2.house}), undermining wealth accumulation.` };
      }
      return false;
    },
  },

  {
    name: "Shakata Yoga",
    description: "Jupiter in 6th/8th/12th house from the Moon",
    result: "Obstacles, financial instability, difficulties in achieving success. Jupiter's qualities are weakened.",
    quality: "Negative",
    strength: 'Moderate',
    varga: 1,
    remedies: ['Wear yellow', 'Chant Jupiter mantra', 'Fast on Thursdays', 'Guru worship'],
    mantras: ['Om Brihaspataye Namaha', 'Om Guru Guravaay Namaha', 'Om Jupitery Namaha'],
    deities: ['Jupiter', 'Brihaspati'],
    keywords: ['Obstacles', 'Instability', 'Difficulties', 'Delays'],
    evaluate: (c) => {
      if(!c.planets.Jupiter || !c.planets.Moon) return false;
      const d = (c.planets.Jupiter.house - c.planets.Moon.house + 12) % 12;
      return [5,7,11].includes(d);
    }
  },

  {
    name: "Grahan Yoga",
    description: "Sun or Moon in conjunction with Rahu or Ketu",
    result: "Health issues, mental stress, reputational challenges, emotional disturbances.",
    quality: "Negative",
    strength: 'Moderate to Strong',
    varga: 1,
    remedies: ['Chant Rahu/Ketu mantras', 'Wear blue sapphire', 'Perform Hanuman rituals', 'Spiritual practices'],
    mantras: ['Om Rahu Rahu Namaha', 'Om Ketu Ketu Namaha', 'Maha Mrityunjaya Mantra'],
    deities: ['Durga', 'Ganesha', 'Hanuman'],
    keywords: ['Health', 'Mental stress', 'Reputation', 'Disturbance'],
    evaluate: (c) => {
      const sun = c.planets.Sun, moon = c.planets.Moon, rahu = c.planets.Rahu, ketu = c.planets.Ketu;
      if (!rahu || !ketu) return false;
      if (sun && rahu && sun.sn === rahu.sn) return { result: true, rationale: "Sun is conjunct Rahu (Solar Grahan effect)." };
      if (sun && ketu && sun.sn === ketu.sn) return { result: true, rationale: "Sun is conjunct Ketu (Solar Grahan effect)." };
      if (moon && rahu && moon.sn === rahu.sn) return { result: true, rationale: "Moon is conjunct Rahu (Lunar Grahan effect)." };
      if (moon && ketu && moon.sn === ketu.sn) return { result: true, rationale: "Moon is conjunct Ketu (Lunar Grahan effect)." };
      return false;
    },
  },

  {
    name: "Kala Sarpa Yoga",
    description: "All planets positioned between Rahu and Ketu",
    result: "Obstacles, delays, struggles and challenges in various life areas. Serpent formation blocks progress.",
    quality: "Negative",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Worship Kali/Durga', 'Perform Kaal Sarpa Pooja', 'Chant Mrityunjaya', 'Pilgrimages'],
    mantras: ['Om Kali Kali Namaha', 'Maha Mrityunjaya Mantra', 'Om Rahu Rahu Namaha'],
    deities: ['Kali', 'Durga', 'Shiva'],
    keywords: ['Obstacles', 'Delays', 'Struggles', 'Challenges'],
    evaluate: (c) => {
      const rahu = c.planets.Rahu, ketu = c.planets.Ketu;
      if (!rahu || !ketu || typeof rahu.sn !== 'number' || typeof ketu.sn !== 'number' || rahu.sn === ketu.sn) return false;
      const r_sn = rahu.sn, k_sn = ketu.sn;
      const arc1 = [], arc2 = [];
      let cur = (r_sn + 1) % 12;
      let failsafe = 0;
      while (cur !== k_sn && failsafe < 15) { arc1.push(cur); cur = (cur + 1) % 12; failsafe++; }
      cur = (k_sn + 1) % 12;
      failsafe = 0;
      while (cur !== r_sn && failsafe < 15) { arc2.push(cur); cur = (cur + 1) % 12; failsafe++; }
      
      const p_sns = Object.values(c.planets).filter(p => !['Rahu','Ketu','Uranus','Neptune','Pluto'].includes(p.p || p.name)).map(p => p.sn);
      if (p_sns.length === 0) return false;
      const all_in_1 = p_sns.every(s => arc1.includes(s) || s === r_sn || s === k_sn);
      const all_in_2 = p_sns.every(s => arc2.includes(s) || s === r_sn || s === k_sn);
      if (all_in_1 || all_in_2) return { result: true, rationale: "All planets are hemmed between the Rahu and Ketu axis." };
      return false;
    },
  },

  {
    name: "Mangal Dosha",
    description: "Mars in 1st/4th/7th/8th/12th house from Lagna or Moon",
    result: "Marriage delays/conflicts, relationship issues, passion-related problems.",
    quality: "Negative",
    strength: 'Strong',
    varga: 1,
    remedies: ['Wear coral', 'Chant Mars mantra', 'Perform Hanuman rituals', 'Karmic actions'],
    mantras: ['Om Mangalaya Namaha', 'Om Angarakaya Namaha', 'Hanuman Chalisa'],
    deities: ['Mars', 'Hanuman'],
    keywords: ['Marriage delay', 'Conflict', 'Passion', 'Relationship issues'],
    evaluate: (c) => {
      const mars = c.planets.Mars;
      if(!mars) return false;
      const m_house = mars.house;
      if ([1,4,7,8,12].includes(m_house)) {
         return { result: true, rationale: `Mars is placed in the ${m_house}${m_house===1?'st':(m_house===2?'nd':(m_house===3?'rd':'th'))} house, causing Mangal Dosha.` };
      }
      return false;
    }
  },

  // ========== PANCHA MAHAPURUSHA YOGAS ==========

  {
    name: "Ruchaka Yoga",
    description: "Mars in own (Aries/Scorpio) or exalted (Capricorn) sign in Kendra house",
    result: "Brave, powerful, commanding, great physical strength, natural leader, good for military/sports/surgery.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Wear coral', 'Chant Mars mantra', 'Tuesday practices', 'Physical exercise'],
    mantras: ['Om Angarakaya Namaha', 'Om Mangalaya Namaha', 'Mars Beej Mantra'],
    deities: ['Mars', 'Hanuman', 'Skanda'],
    keywords: ['Courage', 'Strength', 'Leadership', 'Power'],
    evaluate: (c) => c.planets.Mars && [1, 4, 7, 10].includes(c.planets.Mars.house) && (c.planets.Mars.status === 'Own' || c.planets.Mars.status === 'Exalt.')
  },

  {
    name: "Bhadra Yoga",
    description: "Mercury in own (Gemini/Virgo) or exalted sign in Kendra house",
    result: "Highly intelligent, eloquent, skilled in writing/business/math, witty, successful communicator.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    methodOfCalculation: 'One of the five classical Pancha Mahapurusha Yogas. Formed when Mercury occupies a Kendra house (1st, 4th, 7th, or 10th from the Lagna) while also being in its own sign (Gemini or Virgo) or its sign of exaltation (Virgo).',
    cause: 'A naturally strong, well-dignified Mercury anchored in an angular house of visible life-impact (Kendra) gives sustained strength to intellect, communication, and commercial acumen throughout life.',
    nullification: 'Weakened if Mercury is combust, retrograde and afflicted, or heavily aspected/conjoined by malefics without any offsetting benefic influence; strength is also reduced if the Kendra house itself is a natural malefic house for the ascendant in question.',
    referenceShloka: 'One of the five Pancha Mahapurusha Yogas codified in Brihat Parashara Hora Shastra (Mahapurusha Yoga Adhyaya) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
    remedies: ['Wear emerald', 'Chant Mercury mantra', 'Wednesday practices', 'Learning activities'],
    mantras: ['Om Budhaya Namaha', 'Om Herambaya Namaha', 'Mercury Beej Mantra'],
    deities: ['Mercury', 'Saraswati', 'Ganesha'],
    keywords: ['Intelligence', 'Communication', 'Skill', 'Success'],
    evaluate: (c) => c.planets.Mercury && [1, 4, 7, 10].includes(c.planets.Mercury.house) && (c.planets.Mercury.status === 'Own' || c.planets.Mercury.status === 'Exalt.')
  },

  {
    name: "Hamsa Yoga",
    description: "Jupiter in own (Sagittarius/Pisces) or exalted (Cancer) in Kendra house",
    result: "Wise, learned, respected, charitable, spiritually inclined, good teacher/advisor/leader.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Wear yellow sapphire', 'Chant Jupiter mantra', 'Thursday practices', 'Spiritual study'],
    mantras: ['Om Brihaspataye Namaha', 'Om Guru Guravaay Namaha', 'Jupiter Beej Mantra'],
    deities: ['Jupiter', 'Brihaspati', 'Wisdom deities'],
    keywords: ['Wisdom', 'Learning', 'Spirituality', 'Teaching'],
    evaluate: (c) => c.planets.Jupiter && [1, 4, 7, 10].includes(c.planets.Jupiter.house) && (c.planets.Jupiter.status === 'Own' || c.planets.Jupiter.status === 'Exalt.')
  },

  {
    name: "Malavya Yoga",
    description: "Venus in own (Taurus/Libra) or exalted (Pisces) in Kendra house",
    result: "Beautiful, wealthy, artistic, successful in romance/relationship, fond of luxury and fine things.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Wear diamond', 'Chant Venus mantra', 'Friday practices', 'Artistic pursuits'],
    mantras: ['Om Shukraya Namaha', 'Om Kamaya Namaha', 'Venus Beej Mantra'],
    deities: ['Venus', 'Lakshmi', 'Cupid'],
    keywords: ['Beauty', 'Wealth', 'Art', 'Romance'],
    evaluate: (c) => c.planets.Venus && [1, 4, 7, 10].includes(c.planets.Venus.house) && (c.planets.Venus.status === 'Own' || c.planets.Venus.status === 'Exalt.')
  },

  {
    name: "Sasha Yoga",
    description: "Saturn in own (Capricorn/Aquarius) or exalted (Libra) in Kendra house",
    result: "Long-lived, wealthy, powerful, influential, good at management/agriculture/politics.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Wear blue sapphire', 'Chant Saturn mantra', 'Saturday practices', 'Land-based activities'],
    mantras: ['Om Shanaischaraya Namaha', 'Om Shani Namaha', 'Saturn Beej Mantra'],
    deities: ['Saturn', 'Shiva', 'Discipline deities'],
    keywords: ['Longevity', 'Wealth', 'Power', 'Discipline'],
    evaluate: (c) => c.planets.Saturn && [1, 4, 7, 10].includes(c.planets.Saturn.house) && (c.planets.Saturn.status === 'Own' || c.planets.Saturn.status === 'Exalt.')
  },

  // ========== SPECIAL YOGAS ==========

  {
    name: "Mudgal Yoga",
    description: "10th lord in 6th/8th/12th house with involvement of dusthana lords",
    result: "Fall from grace followed by rise through repentance and charity. Initial loss, then recovery with wisdom.",
    quality: "Special - Fall and Rise",
    strength: 'Variable',
    varga: 1,
    remedies: ['Perform charity', 'Donate food/land', 'Spiritual practices', 'Serve the wise'],
    mantras: ['Om Namah Shivaya', 'Maha Mrityunjaya Mantra', 'Transformation mantras'],
    deities: ['Shiva', 'Vishnu'],
    keywords: ['Fall', 'Rise', 'Redemption', 'Transformation'],
    evaluate: (c) => {
      const p = c.planets;
      return (p.Jupiter?.house === 1 || p.Venus?.house === 1) && p.Mercury?.house === 10 && [4, 7].includes(p.Moon?.house);
    }
  },

  {
    name: "Vipareeta Raj Yoga",
    description: "Lords of 6th/8th/12th in their own houses or in each other's houses",
    result: "Turns losses into gains. Enemies become helpers. Obstacles lead to unexpected success.",
    quality: "Special",
    strength: 'Variable',
    varga: 1,
    remedies: ['Continue beneficial practices', 'Maintain spiritual focus', 'Serve the needy'],
    mantras: ['Om Namah Shivaya', 'Maha Mrityunjaya Mantra'],
    deities: ['Shiva', 'Durga'],
    keywords: ['Reversal', 'Gain from loss', 'Unexpected success'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const dusthanas = [6, 8, 12];
      const findings = [];
      dusthanas.forEach(h => {
        const lord = getSignLord(signNames[(ascSn + h - 1) % 12]);
        const p = c.planets[lord];
        if (p && dusthanas.includes(p.house)) {
          findings.push(`${lord} (${h}th Lord) is placed in H${p.house}`);
        }
      });
      if (findings.length) {
        return { result: true, rationale: `Vipareeta Raj Yoga forms because ${findings.join('; ')} — a Dusthana lord confined within another Dusthana reverses into unexpected gain.` };
      }
      return false;
    },
  },

  {
    name: "Parivartana Yoga",
    description: "Mutual exchange of signs between two planet lords",
    result: "Creates a powerful link between the houses involved, blending their energies and often strengthening both.",
    quality: "Variable",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Strengthen both planets involved', 'Perform related charity'],
    mantras: ['Mantras for both planets'],
    deities: ['Deities of both planets'],
    keywords: ['Exchange', 'Mutual', 'Powerful link'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      for (let h1 = 1; h1 <= 12; h1++) {
        for (let h2 = h1 + 1; h2 <= 12; h2++) {
          const lord1 = getSignLord(signNames[(ascSn + h1 - 1) % 12]);
          const lord2 = getSignLord(signNames[(ascSn + h2 - 1) % 12]);
          if (lord1 === lord2) continue;
          const p1 = c.planets[lord1], p2 = c.planets[lord2];
          if (!p1 || !p2) continue;
          if (p1.house === h2 && p2.house === h1) {
            return { result: true, rationale: `House ${h1} Lord (${lord1}) sits in House ${h2}, while House ${h2} Lord (${lord2}) sits in House ${h1} — a mutual sign exchange (Parivartana).` };
          }
        }
      }
      return false;
    },
  },

  {
    name: "Neecha Bhanga Raj Yoga",
    description: "Debilitated planet's exaltation lord in Kendra/Trikona; or debilitated planet aspects exaltation lord",
    result: "Debilitation is cancelled. Native rises from low to high position, often with greater wisdom and humility.",
    quality: "Special",
    strength: 'Very Strong if developed',
    varga: 1,
    remedies: ['Strengthen the debilitated planet', 'Wear appropriate gemstone', 'Regular mantras'],
    mantras: ['Planet-specific mantras', 'Maha Mrityunjaya Mantra'],
    deities: ['Planet deities', 'Shiva'],
    keywords: ['Cancellation', 'Rise', 'Redemption', 'Strength'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const dignities = window.ASTRO_CONSTANTS.DIGNITIES;
      const moon = c.planets.Moon;
      const planetNames = Object.keys(dignities);
      for (const pName of planetNames) {
        const p = c.planets[pName];
        if (!p || p.sn !== dignities[pName].debilitation) continue;
        const dign = dignities[pName];
        const debSignLord = getSignLord(signNames[dign.debilitation]);
        const exaltSignLord = getSignLord(signNames[dign.exalt]);
        const debLordPlanet = c.planets[debSignLord];
        const exaltLordPlanet = c.planets[exaltSignLord];

        const cond1 = (debLordPlanet && isKendra(debLordPlanet.house)) || (exaltLordPlanet && isKendra(exaltLordPlanet.house));
        let cond2 = false;
        if (debLordPlanet && exaltLordPlanet) {
          const rel = ((debLordPlanet.house - exaltLordPlanet.house + 12) % 12) + 1;
          cond2 = [1, 4, 7, 10].includes(rel);
        }
        const cond3 = debLordPlanet && hasAspect(debSignLord, debLordPlanet.house, p.house);
        const cond4 = isKendra(p.house) || (moon && [1, 4, 7, 10].includes(((p.house - moon.house + 12) % 12) + 1));

        if (cond1 || cond2 || cond3 || cond4) {
          return { result: true, rationale: `${pName}'s debilitation in ${p.sign} is cancelled (Neecha Bhanga) — its dispositor/exaltation lord is angular, or it is otherwise angular from the Moon/Ascendant, transforming weakness into a powerful Raja Yoga.` };
        }
      }
      return false;
    },
  },

  // ========== HOUSE-BASED YOGAS ==========

  {
    name: "Lagnadhi Yoga",
    description: "Benefics in 6, 7, 8 from Lagna",
    result: "Success, prosperity, and victory over obstacles.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Regular benefic practices', 'Charity to temples', 'Good conduct'],
    mantras: ['Om Namah Shivaya', 'Jupiter/Venus mantras'],
    deities: ['Jupiter', 'Venus', 'Wisdom deities'],
    keywords: ['Success', 'Prosperity', 'Victory'],
    evaluate: (c) => {
      const asc = c.asc; if(!asc) return false;
      const h6 = (asc.sn + 5)%12, h7 = (asc.sn + 6)%12, h8 = (asc.sn + 7)%12;
      const ben = ['Jupiter','Venus','Mercury'];
      return ben.some(b => c.planets[b] && [h6,h7,h8].includes(c.planets[b].sn));
    }
  },

  {
    name: "Bhava Shuddhi Yoga",
    description: "House lord in own sign, exaltation, or Moolatrikona, aspected by benefic",
    result: "Strong, positive results in the area represented by that house.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Strengthen the house lord', 'Perform house-specific rituals'],
    mantras: ['Planet mantras', 'House ruling mantras'],
    deities: ['House ruling deity', 'Jupiter/Venus'],
    keywords: ['Strength', 'Success', 'Positive results'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      for (let h = 1; h <= 12; h++) {
        const lord = getSignLord(signNames[(ascSn + h - 1) % 12]);
        const p = c.planets[lord];
        if (!p) continue;
        const strong = p.status === 'Own' || p.status === 'Exalt.';
        if (!strong) continue;
        const aspecting = benefics.filter(b => b !== lord && c.planets[b] && hasAspect(b, c.planets[b].house, p.house));
        if (aspecting.length) {
          return { result: true, rationale: `House ${h}'s Lord (${lord}) is dignified (${p.status}) and receives a benefic aspect from ${aspecting.join(', ')}.` };
        }
      }
      return false;
    },
  },

  // ========== DIGNITY-BASED YOGAS ==========

  {
    name: "Uchcha Yoga",
    description: "Planet in exaltation sign",
    result: "Planet is extremely strong and positive. Native experiences greatest success in planet's areas.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Maintain positive actions', 'Strengthen gem', 'Regular mantras'],
    mantras: ['Planet mantra'],
    deities: ['Planet deity'],
    keywords: ['Strength', 'Excellence', 'Exaltation'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const exalted = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].status === 'Exalt.');
      if (exalted.length) {
        return { result: true, rationale: `${exalted.join(', ')} ${exalted.length > 1 ? 'are' : 'is'} placed in exaltation, at peak strength.` };
      }
      return false;
    },
  },

  {
    name: "Swakshetra Yoga",
    description: "Planet in own sign",
    result: "Planet is strong and stable. Native experiences consistent, positive results.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Strengthen gem', 'Regular practice'],
    mantras: ['Planet mantra'],
    deities: ['Planet deity'],
    keywords: ['Strength', 'Stability', 'Success'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const own = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].status === 'Own');
      if (own.length) {
        return { result: true, rationale: `${own.join(', ')} ${own.length > 1 ? 'are' : 'is'} placed in its own sign, giving stable, consistent strength.` };
      }
      return false;
    },
  },

  {
    name: "Vargottama Yoga",
    description: "Planet in same sign in both Rashi and Navamsha charts",
    result: "Planet is very strong and pure. Native experiences powerful, untainted results.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 9,
    remedies: ['Maintain positive karma', 'Good conduct'],
    mantras: ['Planet mantra'],
    deities: ['Planet deity'],
    keywords: ['Purity', 'Strength', 'Undiluted results'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const vargottama = Object.keys(c.planets).filter(p => {
        const pos = c.planets[p];
        return pos && pos.d1Sn !== undefined && pos.d1Sn === pos.sn;
      });
      if (vargottama.length) {
        return { result: true, rationale: `${vargottama.join(', ')} ${vargottama.length > 1 ? 'occupy' : 'occupies'} the same sign in both the Rashi and Navamsha charts (Vargottama), giving pure, undiluted strength.` };
      }
      return false;
    },
  },

  // ========== RETROGRADE YOGAS ==========

  {
    name: "Vakri Yoga",
    description: "Planet is retrograde in birth chart",
    result: "Planet's effects become intense, unpredictable, internalized. Delayed but powerful results.",
    quality: "Variable",
    strength: 'Variable',
    varga: 1,
    remedies: ['Strengthen through mantras', 'Wear appropriate gem', 'Patience needed'],
    mantras: ['Planet mantra', 'Shanti mantras'],
    deities: ['Planet deity'],
    keywords: ['Intensity', 'Delay', 'Power', 'Internalized'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const retro = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].retro);
      if (retro.length) {
        return { result: true, rationale: `${retro.join(', ')} ${retro.length > 1 ? 'are' : 'is'} retrograde, making its effects more intense, internalized, and delayed.` };
      }
      return false;
    },
  },

  // ========== COMBUSTION YOGA ==========

  {
    name: "Astangata Yoga",
    description: "Planet within specified degrees of Sun (Mercury:12°, Venus:10°, Mars/Jupiter/Saturn:15°)",
    result: "Planet's positive qualities burned up and hidden. Native struggles in that planet's areas.",
    quality: "Negative",
    strength: 'Moderate to Strong',
    varga: 1,
    remedies: ['Strengthen through mantras', 'Wear gem', 'Perform rituals', 'Patience practice'],
    mantras: ['Planet mantra', 'Maha Mrityunjaya Mantra'],
    deities: ['Planet deity', 'Sun deity'],
    keywords: ['Weakness', 'Burning', 'Hidden qualities'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const combust = Object.keys(c.planets).filter(p => p !== 'Sun' && c.planets[p] && c.planets[p].combust);
      if (combust.length) {
        return { result: true, rationale: `${combust.join(', ')} ${combust.length > 1 ? 'are' : 'is'} combust, its qualities burned up and hidden by proximity to the Sun.` };
      }
      return false;
    },
  },

  // ========== ASPECT YOGAS ==========

  {
    name: "Papakartari Yoga",
    description: "House/planet flanked by malefics in 2nd and 12th houses",
    result: "Native suffers pressure, obstacles, suffering in that area of life.",
    quality: "Negative",
    strength: 'Strong',
    varga: 1,
    remedies: ['Strengthen benefics', 'Wear protective gems', 'Spiritual practices'],
    mantras: ['Maha Mrityunjaya Mantra', 'Hanuman Chalisa', 'Shanti mantras'],
    deities: ['Durga', 'Hanuman', 'Shiva'],
    keywords: ['Pressure', 'Obstacles', 'Suffering'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const h2 = malefics.filter(m => c.planets[m] && c.planets[m].house === 2);
      const h12 = malefics.filter(m => c.planets[m] && c.planets[m].house === 12);
      if (h2.length && h12.length) {
        return { result: true, rationale: `The Lagna is hemmed in by malefics in House 2 (${h2.join(', ')}) and House 12 (${h12.join(', ')}).` };
      }
      return false;
    },
  },

  {
    name: "Shubhakartari Yoga",
    description: "House/planet flanked by benefics in 2nd and 12th houses",
    result: "Native receives protection, support, blessings in that area of life.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Maintain positive actions'],
    mantras: ['Jupiter mantra', 'Venus mantra'],
    deities: ['Jupiter', 'Venus', 'Lakshmi'],
    keywords: ['Protection', 'Support', 'Blessings'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const h2 = benefics.filter(b => c.planets[b] && c.planets[b].house === 2);
      const h12 = benefics.filter(b => c.planets[b] && c.planets[b].house === 12);
      if (h2.length && h12.length) {
        return { result: true, rationale: `The Lagna is flanked by benefics in House 2 (${h2.join(', ')}) and House 12 (${h12.join(', ')}), granting protection and support.` };
      }
      return false;
    },
  },

  // ========== NAKSHATRA-BASED YOGAS ==========

  {
    name: "Pushya Nakshatra Yoga",
    description: "Moon or important planet in Pushya Nakshatra",
    result: "Most auspicious nakshatra. Nourishing, supportive, prosperous, respected.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Regular Pushya rituals', 'Thursday practices'],
    mantras: ['Om Brihaspataye Namaha', 'Pushya Nakshatra mantra'],
    deities: ['Brihaspati', 'Jupiter'],
    keywords: ['Auspicious', 'Nourishing', 'Supportive', 'Prosperity'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const inPushya = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].nak === 'Pushya');
      if (inPushya.length) {
        return { result: true, rationale: `${inPushya.join(', ')} ${inPushya.length > 1 ? 'are' : 'is'} placed in Pushya Nakshatra, the most nourishing and supportive of all stars.` };
      }
      return false;
    },
  },

  {
    name: "Magha Nakshatra Yoga",
    description: "Moon or important planet in Magha Nakshatra",
    result: "Noble, proud, connected to ancestors, leadership ability.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Ancestor worship', 'Respect lineage', 'Family support'],
    mantras: ['Om Pitrbhyo Namaha', 'Magha Nakshatra mantra'],
    deities: ['Ancestors (Pitris)', 'Sun'],
    keywords: ['Noble', 'Leadership', 'Ancestry', 'Power'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const inMagha = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].nak === 'Magha');
      if (inMagha.length) {
        return { result: true, rationale: `${inMagha.join(', ')} ${inMagha.length > 1 ? 'are' : 'is'} placed in Magha Nakshatra, connecting the native to ancestral power and authority.` };
      }
      return false;
    },
  },

  {
    name: "Revati Nakshatra Yoga",
    description: "Moon or important planet in Revati Nakshatra",
    result: "Nourishing, wealthy, protected, good at travel and trade.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Travel for spiritual growth', 'Charitable giving', 'Trade practices'],
    mantras: ['Om Pushne Namaha', 'Revati Nakshatra mantra'],
    deities: ['Pushan', 'Mercury'],
    keywords: ['Nourishing', 'Wealthy', 'Protected', 'Travel'],
    evaluate: (c) => {
      if (!c.planets) return false;
      const inRevati = Object.keys(c.planets).filter(p => c.planets[p] && c.planets[p].nak === 'Revati');
      if (inRevati.length) {
        return { result: true, rationale: `${inRevati.join(', ')} ${inRevati.length > 1 ? 'are' : 'is'} placed in Revati Nakshatra, granting nourishment, protection, and success in trade/travel.` };
      }
      return false;
    },
  },

  // ========== ADDITIONAL YOGAS ==========

  {
    name: "Siddhamsa Excellence",
    description: "Jupiter/Mercury strong in D24",
    result: "Exceptional learning and scholarly achievements.",
    quality: "Positive",
    strength: 'Strong',
    varga: 24,
    remedies: ['Study and learning', 'Chant mantras'],
    mantras: ['Jupiter/Mercury mantras'],
    deities: ['Saraswati', 'Jupiter'],
    keywords: ['Learning', 'Excellence', 'Scholarship'],
    evaluate: (c) => {
       const j = c.planets.Jupiter, m = c.planets.Mercury;
       return (j && [3,8,11].includes(j.sn)) || (m && [2,5].includes(m.sn));
    }
  },

  {
     name: "Navamsha Puskara",
     description: "Moon in Pushkara Navamsha",
     result: "Great strength and nourishment to the life purpose.",
     quality: "Positive",
     strength: 'Strong',
     varga: 9,
     remedies: ['Regular practices', 'Monday vows'],
     mantras: ['Moon mantras', 'Pushya Nakshatra mantra'],
     deities: ['Moon', 'Lakshmi'],
     keywords: ['Strength', 'Nourishment', 'Support'],
     evaluate: (c) => {
        const m = c.planets.Moon;
        if(!m) return false;
        return [0,2,3,5,6,8,9,11].includes(m.sn);
     }
  },

  // ========== MUHURTA YOGAS - AUSPICIOUS TIMING ~60+ YOGAS ==========

  {
    name: "Amrit Yoga",
    category: 'Muhurta - Auspicious Timing',
    description: "Weekday lord in kendras; Moon not in 6/8/12 from Sun",
    result: "Most auspicious for initiating new ventures. Success guaranteed in all undertakings.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Start ventures on this yoga', 'Perform Puja before starting'],
    mantras: ['Om Namah Shivaya', 'Auspiciousness mantra'],
    deities: ['Brahma', 'All Devas'],
    keywords: ['Auspicious', 'Success', 'Starting new work'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const p = c.planets;
      if (!p.Sun || !p.Moon) return false;
      const rel = ((p.Moon.house - p.Sun.house + 12) % 12) + 1;
      if ([6, 8, 12].includes(rel)) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const lagnaLord = getSignLord(signNames[c.asc.sn || 0]);
      const pL = p[lagnaLord];
      if (pL && isKendra(pL.house)) {
        return { result: true, rationale: `The Lagna Lord (${lagnaLord}) is angular and the Moon avoids the Dusthanas from the Sun — a highly auspicious window for new beginnings.` };
      }
      return false;
    },
  },

  {
    name: "Siddhi Yoga",
    category: 'Muhurta - Auspicious Timing',
    description: "Mercury & Venus strong; Sun-Moon angular",
    result: "Perfect for starting education, business, travel, marriage. Guaranteed success.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Perform rituals on this yoga', 'Fast and pray'],
    mantras: ['Om Budhaya Namaha', 'Om Shukraya Namaha'],
    deities: ['Mercury', 'Venus', 'Saraswati'],
    keywords: ['Perfection', 'Completion', 'Success'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Venus || !p.Sun || !p.Moon) return false;
      const strongMercVen = ['Own', 'Exalt.'].includes(p.Mercury.status) && ['Own', 'Exalt.'].includes(p.Venus.status);
      const rel = ((p.Moon.house - p.Sun.house + 12) % 12) + 1;
      if (strongMercVen && [1, 4, 7, 10].includes(rel)) {
        return { result: true, rationale: "Mercury and Venus are both strongly dignified while the Sun-Moon axis is angular — perfect for education, business, or marriage." };
      }
      return false;
    },
  },

  {
    name: "Sadhya Yoga",
    category: 'Muhurta - Auspicious Timing',
    description: "Sun strong; no malefic in 8th",
    result: "Excellent for trade, business, buying vehicles. Very successful undertakings.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Start trade on this yoga', 'Worship Sun'],
    mantras: ['Gayatri Mantra', 'Sun mantra'],
    deities: ['Surya', 'Indra'],
    keywords: ['Achievement', 'Business', 'Success'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun) return false;
      const sunStrong = ['Own', 'Exalt.'].includes(p.Sun.status);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const maleficIn8 = malefics.some(m => p[m] && p[m].house === 8);
      if (sunStrong && !maleficIn8) {
        return { result: true, rationale: "The Sun is strongly placed and the 8th house is free of malefics — excellent for trade and major purchases." };
      }
      return false;
    },
  },

  {
    name: "Shubha Yoga",
    category: 'Muhurta - Auspicious Timing',
    description: "Jupiter-Moon in kendras; no malefic in 7th",
    result: "Auspicious for marriage, partnership, joining new group. Harmony assured.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Perform pada puja', 'Do good deeds'],
    mantras: ['Om Brihaspataye Namaha', 'Harmony mantra'],
    deities: ['Jupiter', 'Venus'],
    keywords: ['Partnership', 'Harmony', 'Marriage'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Jupiter || !p.Moon) return false;
      const bothKendra = isKendra(p.Jupiter.house) && isKendra(p.Moon.house);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const maleficIn7 = malefics.some(m => p[m] && p[m].house === 7);
      if (bothKendra && !maleficIn7) {
        return { result: true, rationale: "Jupiter and the Moon are both angular and the 7th house of partnership is unafflicted — auspicious for marriage and new alliances." };
      }
      return false;
    },
  },

  {
    name: "Pushya Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Moon in Pushya Nakshatra; Jupiter/Mercury aspecting",
    result: "Most auspicious for all activities. Nourishing and protective influences.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Perform all important work', 'Worship Jupiter'],
    mantras: ['Om Brihaspataye Namaha', 'Pushya Nakshatra mantra'],
    deities: ['Brihaspati', 'Jupiter'],
    keywords: ['Nourishing', 'Protective', 'Most auspicious'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Moon || p.Moon.nak !== 'Pushya') return false;
      const jupAspect = p.Jupiter && hasAspect('Jupiter', p.Jupiter.house, p.Moon.house);
      const mercAspect = p.Mercury && hasAspect('Mercury', p.Mercury.house, p.Moon.house);
      if (jupAspect || mercAspect) {
        return { result: true, rationale: `The Moon is in Pushya Nakshatra and receives the aspect of ${jupAspect ? 'Jupiter' : 'Mercury'} — the most nourishing timing window.` };
      }
      return false;
    },
  },

  {
    name: "Bhadra Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Mercury strong; Sun-Moon harmonious",
    result: "Excellent for education, writing, contracts, business communication.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Study and learn', 'Write and communicate'],
    mantras: ['Om Budhaya Namaha', 'Mercury mantra'],
    deities: ['Mercury', 'Saraswati', 'Ganesha'],
    keywords: ['Communication', 'Learning', 'Writing'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Sun || !p.Moon) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status);
      const rel = ((p.Moon.house - p.Sun.house + 12) % 12) + 1;
      if (mercStrong && ![6, 8, 12].includes(rel)) {
        return { result: true, rationale: "Mercury is strongly placed and the Sun-Moon relationship is harmonious — good for education, writing, and contracts." };
      }
      return false;
    },
  },

  {
    name: "Ravi Yoga",
    category: 'Muhurta - Auspicious Timing',
    description: "Sun in exaltation; no malefic aspects",
    result: "Excellent for government work, authority, leadership roles, public appearance.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Work on authority', 'Worship Sun'],
    mantras: ['Gayatri Mantra', 'Om Surya Namaha'],
    deities: ['Surya', 'Indra', 'Authority'],
    keywords: ['Authority', 'Government', 'Leadership'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun) return false;
      if (p.Sun.status !== 'Exalt.') return false;
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const afflicted = malefics.some(m => p[m] && hasAspect(m, p[m].house, p.Sun.house));
      if (!afflicted) {
        return { result: true, rationale: "The Sun is exalted and free from malefic aspects — excellent for authority and leadership matters." };
      }
      return false;
    },
  },

  {
    name: "Soma Yoga",
    category: 'Muhurta - Auspicious Timing',
    description: "Moon strong; no malefic in 2nd/8th",
    result: "Excellent for emotional, domestic, family matters. Domestic harmony.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Family activities', 'Women-focused work'],
    mantras: ['Moon mantra', 'Om Chandraya Namaha'],
    deities: ['Moon', 'Lakshmi', 'Durga'],
    keywords: ['Family', 'Emotions', 'Domestic harmony'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Moon) return false;
      const moonStrong = ['Own', 'Exalt.'].includes(p.Moon.status);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const afflicted = malefics.some(m => p[m] && [2, 8].includes(p[m].house));
      if (moonStrong && !afflicted) {
        return { result: true, rationale: "The Moon is strongly placed and Houses 2/8 are free of malefics — favorable for family and domestic matters." };
      }
      return false;
    },
  },

  {
    name: "Mangal Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Mars strong; Sun-Venus harmonious",
    result: "Excellent for sports, military, surgery, construction, physical accomplishments.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Physical work', 'Sports activities'],
    mantras: ['Om Mangalaya Namaha', 'Mars mantra'],
    deities: ['Mars', 'Hanuman', 'Skanda'],
    keywords: ['Physical', 'Courage', 'Construction'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Sun || !p.Venus) return false;
      const marsStrong = ['Own', 'Exalt.'].includes(p.Mars.status);
      const rel = ((p.Sun.house - p.Venus.house + 12) % 12) + 1;
      if (marsStrong && ![6, 8, 12].includes(rel)) {
        return { result: true, rationale: "Mars is strongly placed and the Sun-Venus relationship is unafflicted — good for physical undertakings and construction." };
      }
      return false;
    },
  },

  {
    name: "Budha Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Mercury strong; no malefic in 3rd/6th",
    result: "For short distance travel, trading, young people's work, commercial activities.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Trading activities', 'Short travels'],
    mantras: ['Mercury mantra', 'Om Budhaya Namaha'],
    deities: ['Mercury', 'Saraswati'],
    keywords: ['Commerce', 'Trade', 'Travel'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const afflicted = malefics.some(m => p[m] && [3, 6].includes(p[m].house));
      if (mercStrong && !afflicted) {
        return { result: true, rationale: "Mercury is strongly placed and Houses 3/6 are unafflicted — favorable for trade and short travel." };
      }
      return false;
    },
  },

  {
    name: "Guru Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Jupiter strong; Venus aspecting; Moon gaining light",
    result: "Perfect for education, spiritual practices, marriage, legal work, expansion.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Spiritual practices', 'Education'],
    mantras: ['Jupiter mantra', 'Om Brihaspataye Namaha'],
    deities: ['Jupiter', 'Brihaspati', 'Saraswati'],
    keywords: ['Knowledge', 'Expansion', 'Wisdom'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Jupiter || !p.Venus || !p.Moon || !p.Sun) return false;
      const jupStrong = ['Own', 'Exalt.'].includes(p.Jupiter.status);
      const venAspect = hasAspect('Venus', p.Venus.house, p.Jupiter.house);
      const moonLon = (p.Moon.sn || 0) * 30 + (parseFloat(p.Moon.deg) || 0);
      const sunLon = (p.Sun.sn || 0) * 30 + (parseFloat(p.Sun.deg) || 0);
      const waxing = ((moonLon - sunLon + 360) % 360) < 180;
      if (jupStrong && venAspect && waxing) {
        return { result: true, rationale: "Jupiter is strong, aspected by Venus, and the Moon is waxing — ideal for education, marriage, and expansion." };
      }
      return false;
    },
  },

  {
    name: "Sukra Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Venus strong; Moon in Taurus/Libra; benefics aspecting",
    result: "Excellent for marriage, artistic pursuits, luxury purchases, romantic activities.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Artistic work', 'Marriage rituals'],
    mantras: ['Venus mantra', 'Om Shukraya Namaha'],
    deities: ['Venus', 'Lakshmi', 'Cupid'],
    keywords: ['Beauty', 'Art', 'Romance', 'Luxury'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Venus || !p.Moon) return false;
      const venStrong = ['Own', 'Exalt.'].includes(p.Venus.status);
      const moonInVenSign = ['Taurus', 'Libra'].includes(p.Moon.sign);
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const beneficAspect = benefics.some(b => b !== 'Venus' && p[b] && hasAspect(b, p[b].house, p.Venus.house));
      if (venStrong && moonInVenSign && beneficAspect) {
        return { result: true, rationale: "Venus is strongly placed, the Moon rests in a Venusian sign, and a benefic aspects Venus — excellent for marriage and artistic pursuits." };
      }
      return false;
    },
  },

  {
    name: "Shani Yoga (Timing)",
    category: 'Muhurta - Auspicious Timing',
    description: "Saturn strong; Moon beyond first quarter; no 8th house involvement",
    result: "Good for real estate, land purchase, construction, agricultural work, long-term plans.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Land-based work', 'Long-term plans'],
    mantras: ['Saturn mantra', 'Om Shanaischaraya Namaha'],
    deities: ['Saturn', 'Shiva', 'Discipline'],
    keywords: ['Stability', 'Land', 'Long-term'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Saturn || !p.Moon || !p.Sun) return false;
      const satStrong = ['Own', 'Exalt.'].includes(p.Saturn.status);
      const moonLon = (p.Moon.sn || 0) * 30 + (parseFloat(p.Moon.deg) || 0);
      const sunLon = (p.Sun.sn || 0) * 30 + (parseFloat(p.Sun.deg) || 0);
      const phase = (moonLon - sunLon + 360) % 360;
      const beyondFirstQuarter = phase > 90;
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const maleficIn8 = malefics.some(m => p[m] && p[m].house === 8);
      if (satStrong && beyondFirstQuarter && !maleficIn8) {
        return { result: true, rationale: "Saturn is strongly placed, the Moon has passed its first quarter, and the 8th house is unafflicted — good for long-term plans and real estate." };
      }
      return false;
    },
  },

  // ========== INAUSPICIOUS TIMING YOGAS ==========

  {
    name: "Rikta Yoga",
    category: 'Muhurta - Inauspicious Timing',
    description: "Moon tithi 4,8,9,14 (Purnima); Sun-Moon in dushtana houses",
    result: "Avoid starting new work. Good for concluding, finishing, destruction activities.",
    quality: "Negative",
    strength: 'Moderate',
    varga: 1,
    remedies: ['Avoid starting new work', 'Complete old tasks', 'Donate'],
    mantras: ['Shanti mantras', 'Maha Mrityunjaya'],
    deities: ['Durga', 'Kali'],
    keywords: ['Inauspicious', 'Incomplete', 'Delays'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Moon || !p.Sun) return false;
      const moonLon = (p.Moon.sn || 0) * 30 + (parseFloat(p.Moon.deg) || 0);
      const sunLon = (p.Sun.sn || 0) * 30 + (parseFloat(p.Sun.deg) || 0);
      const diff = (moonLon - sunLon + 360) % 360;
      const tithi = Math.floor(diff / 12) + 1;
      const isRiktaTithi = [4, 9, 14].includes(((tithi - 1) % 15) + 1);
      const rel = ((p.Moon.house - p.Sun.house + 12) % 12) + 1;
      if (isRiktaTithi && [6, 8, 12].includes(rel)) {
        return { result: true, rationale: "The Moon falls on a Rikta (empty) Tithi while positioned in a Dusthana from the Sun — avoid starting new ventures now." };
      }
      return false;
    },
  },

  {
    name: "Bhadd Yoga",
    category: 'Muhurta - Inauspicious Timing',
    description: "Mercury afflicted; malefic in 3rd/6th; Moon in 6th/8th",
    result: "Unfavorable for communication, travel, studies. Delays and obstacles expected.",
    quality: "Negative",
    strength: 'Moderate',
    varga: 1,
    remedies: ['Avoid travel', 'Postpone studies', 'Wear green stone'],
    mantras: ['Mercury mantra', 'Shanti mantras'],
    deities: ['Mercury', 'Saraswati'],
    keywords: ['Communication issues', 'Travel delays', 'Study obstacles'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Moon) return false;
      const mercAfflicted = p.Mercury.combust || ['Debil.', 'Enemy'].includes(p.Mercury.status);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const maleficIn3or6 = malefics.some(m => p[m] && [3, 6].includes(p[m].house));
      const moonIn6or8 = [6, 8].includes(p.Moon.house);
      if (mercAfflicted && maleficIn3or6 && moonIn6or8) {
        return { result: true, rationale: "Mercury is afflicted, a malefic occupies House 3/6, and the Moon sits in a Dusthana — unfavorable for communication and travel." };
      }
      return false;
    },
  },

  {
    name: "Nanda Yoga",
    category: 'Muhurta - Inauspicious Timing',
    description: "Moon in Nanda tithi; malefic in kendras",
    result: "Causes delay, obstacles, losses. Avoid starting ventures.",
    quality: "Negative",
    strength: 'Strong',
    varga: 1,
    remedies: ['Postpone work', 'Do pujas', 'Charity'],
    mantras: ['Ganesh mantra', 'Shanti mantras'],
    deities: ['Ganesha', 'Durga'],
    keywords: ['Obstacles', 'Delays', 'Losses'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Moon || !p.Sun) return false;
      const moonLon = (p.Moon.sn || 0) * 30 + (parseFloat(p.Moon.deg) || 0);
      const sunLon = (p.Sun.sn || 0) * 30 + (parseFloat(p.Sun.deg) || 0);
      const diff = (moonLon - sunLon + 360) % 360;
      const tithi = Math.floor(diff / 12) + 1;
      const isNandaTithi = ((tithi - 1) % 5) === 0;
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const maleficInKendra = malefics.some(m => p[m] && isKendra(p[m].house));
      if (isNandaTithi && maleficInKendra) {
        return { result: true, rationale: "The Moon falls on a Nanda Tithi while a malefic occupies an angular house — expect delays and obstacles for new ventures." };
      }
      return false;
    },
  },

  // ========== AVATAR YOGAS (10 INCARNATIONS) ==========

  {
    name: "Matsya Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mercury-Jupiter conjunction in water signs; Moon in Cancer",
    result: "Protector and rescuer of people. Success in saving professions. Wisdom and knowledge.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Help people', 'Water-based charity', 'Study scriptures'],
    mantras: ['Om Namah Shivaya', 'Fish/Water mantras'],
    deities: ['Vishnu (Matsya)', 'Water deities'],
    keywords: ['Protection', 'Rescue', 'Wisdom'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Jupiter || !p.Moon) return false;
      const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
      if (p.Mercury.sn === p.Jupiter.sn && waterSigns.includes(p.Mercury.sign) && p.Moon.sign === 'Cancer') {
        return { result: true, rationale: "Mercury and Jupiter are conjunct in a water sign, and the Moon is placed in Cancer — invoking Matsya's protective wisdom." };
      }
      return false;
    },
  },

  {
    name: "Kurma Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Saturn-Moon conjunction; Sun in Taurus/Libra",
    result: "Stability, support to others, carrying responsibilities. Endurance and patience.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Support others', 'Long-term commitments', 'Patience practice'],
    mantras: ['Om Namah Shivaya', 'Kurma mantras'],
    deities: ['Vishnu (Kurma)', 'Saturn'],
    keywords: ['Stability', 'Support', 'Endurance'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Saturn || !p.Moon || !p.Sun) return false;
      if (p.Saturn.sn === p.Moon.sn && ['Taurus', 'Libra'].includes(p.Sun.sign)) {
        return { result: true, rationale: "Saturn and the Moon are conjunct while the Sun rests in Taurus or Libra — invoking Kurma's steady endurance." };
      }
      return false;
    },
  },

  {
    name: "Varaha Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mars-Sun conjunction; strong Mercury; Moon in earth signs",
    result: "Uplift people, brave warrior, leader, protector of dharma. Combats evil.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Fight injustice', 'Warrior practices', 'Protect others'],
    mantras: ['Om Namah Shivaya', 'Khanda mantras'],
    deities: ['Vishnu (Varaha)', 'Mars'],
    keywords: ['Warrior', 'Protection', 'Dharma'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Sun || !p.Mercury || !p.Moon) return false;
      const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status);
      if (p.Mars.sn === p.Sun.sn && mercStrong && earthSigns.includes(p.Moon.sign)) {
        return { result: true, rationale: "Mars and the Sun are conjunct, Mercury is strongly placed, and the Moon rests in an earth sign — invoking Varaha's protective strength." };
      }
      return false;
    },
  },

  {
    name: "Narasimha Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mars strong in Kendra; Leo rising; Sun exalted",
    result: "Fierce protector, warrior spirit, destroys darkness/evil. Fearlessness, power.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Destroy negativity', 'Fierce spiritual practice', 'Hanuman worship'],
    mantras: ['Om Namah Shivaya', 'Narasimha mantra'],
    deities: ['Narasimha', 'Fierce Shiva'],
    keywords: ['Fierce', 'Power', 'Fearless'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Sun || !c.asc) return false;
      const marsStrong = ['Own', 'Exalt.'].includes(p.Mars.status) && isKendra(p.Mars.house);
      const leoRising = c.asc.sn === 4;
      const sunExalted = p.Sun.status === 'Exalt.';
      if (marsStrong && leoRising && sunExalted) {
        return { result: true, rationale: "Mars is powerfully angular, Leo rises as the Ascendant, and the Sun is exalted — invoking Narasimha's fierce, fearless protection." };
      }
      return false;
    },
  },

  {
    name: "Vamana Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mercury strong in Virgo; Venus in 7th; Jupiter aspecting",
    result: "Strategic thinker, intellectual prowess, deceives enemies, spiritual knowledge.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Study strategy', 'Spiritual learning', 'Use intellect wisely'],
    mantras: ['Om Budhaya Namaha', 'Vamana mantra'],
    deities: ['Vamana', 'Mercury'],
    keywords: ['Strategy', 'Intellect', 'Spirituality'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Venus || !p.Jupiter) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status) && p.Mercury.sign === 'Virgo';
      const venIn7 = p.Venus.house === 7;
      const jupAspects = hasAspect('Jupiter', p.Jupiter.house, p.Mercury.house) || hasAspect('Jupiter', p.Jupiter.house, p.Venus.house);
      if (mercStrong && venIn7 && jupAspects) {
        return { result: true, rationale: "Mercury is strong in Virgo, Venus occupies the 7th house, and Jupiter casts its aspect — invoking Vamana's strategic wisdom." };
      }
      return false;
    },
  },

  {
    name: "Parasurama Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mars-Saturn conjunction strong; Mars in 10th; Sun aspecting",
    result: "Warrior saint, destroyer of corruption, teacher. Leadership with justice.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Destroy corruption', 'Teach dharma', 'Fight injustice'],
    mantras: ['Om Namah Shivaya', 'Parasurama mantra'],
    deities: ['Parasurama', 'Mars'],
    keywords: ['Warrior', 'Justice', 'Teacher'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Saturn || !p.Sun) return false;
      const conj = p.Mars.sn === p.Saturn.sn && ['Own', 'Exalt.'].includes(p.Mars.status);
      const marsIn10 = p.Mars.house === 10;
      const sunAspects = hasAspect('Sun', p.Sun.house, p.Mars.house);
      if (conj && marsIn10 && sunAspects) {
        return { result: true, rationale: "Mars and Saturn are powerfully conjunct in the 10th house, aspected by the Sun — invoking Parasurama's righteous warrior spirit." };
      }
      return false;
    },
  },

  {
    name: "Rama Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Sun-Jupiter conjunction strong; Saturn aspecting Moon; Mars in 1st",
    result: "Ideal leader, dharmic ruler, perfect son/father. Duty, honor, righteousness.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Follow dharma', 'Respect elders', 'Lead righteously'],
    mantras: ['Ram Mantra', 'Hanuman Chalisa'],
    deities: ['Rama', 'Sita', 'Vishnu'],
    keywords: ['Righteousness', 'Duty', 'Leadership'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Jupiter || !p.Saturn || !p.Moon || !p.Mars) return false;
      const conj = p.Sun.sn === p.Jupiter.sn && ['Own', 'Exalt.'].includes(p.Sun.status);
      const satAspectsMoon = hasAspect('Saturn', p.Saturn.house, p.Moon.house);
      const marsIn1 = p.Mars.house === 1;
      if (conj && satAspectsMoon && marsIn1) {
        return { result: true, rationale: "Sun and Jupiter are powerfully conjunct, Saturn aspects the Moon, and Mars occupies the 1st house — invoking Rama's dharmic leadership." };
      }
      return false;
    },
  },

  {
    name: "Krishna Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Moon-Venus strong; Mercury in 1st/7th; Jupiter aspecting multiple houses",
    result: "Divine play, charm, intelligence, music, love. Wisdom and Krishna consciousness.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Chant Krishna mantra', 'Bhakti practices', 'Music and art'],
    mantras: ['Hare Krishna Mantra', 'Krishna mantra'],
    deities: ['Krishna', 'Radha', 'Vishnu'],
    keywords: ['Divine play', 'Charm', 'Wisdom'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Moon || !p.Venus || !p.Mercury) return false;
      const moonVenStrong = ['Own', 'Exalt.'].includes(p.Moon.status) || ['Own', 'Exalt.'].includes(p.Venus.status);
      const mercAngular = [1, 7].includes(p.Mercury.house);
      if (moonVenStrong && mercAngular) {
        return { result: true, rationale: "The Moon or Venus is strongly dignified and Mercury occupies the 1st/7th house — invoking Krishna's charm, wisdom, and divine play." };
      }
      return false;
    },
  },

  {
    name: "Buddha Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mercury very strong; Moon in Virgo/Taurus; Saturn aspecting",
    result: "Spiritual enlightenment, non-violence, meditation, transcendence of ego.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Meditate', 'Practice non-violence', 'Spiritual study'],
    mantras: ['Om Mani Padme Hum', 'Buddha mantra'],
    deities: ['Buddha', 'Mercury', 'Enlightenment'],
    keywords: ['Meditation', 'Enlightenment', 'Non-violence'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Moon || !p.Saturn) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status);
      const moonOk = ['Virgo', 'Taurus'].includes(p.Moon.sign);
      const satAspects = hasAspect('Saturn', p.Saturn.house, p.Moon.house);
      if (mercStrong && moonOk && satAspects) {
        return { result: true, rationale: "Mercury is strongly placed, the Moon rests in Virgo/Taurus, and Saturn's restraining aspect is present — invoking Buddha's meditative detachment." };
      }
      return false;
    },
  },

  {
    name: "Kalki Avatar Yoga",
    category: 'Avatar Yoga',
    description: "Mars-Saturn strong; Jupiter afflicted; Saturn in 10th/7th",
    result: "Destroyer of evil age, regenerator, righteous warrior. End of cycles, new beginning.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Destroy evil', 'Regenerate society', 'Lead transformation'],
    mantras: ['Om Namah Shivaya', 'Kalki mantra'],
    deities: ['Kalki', 'Shiva', 'Destruction/Creation'],
    keywords: ['Destruction', 'Regeneration', 'Transformation'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Saturn || !p.Jupiter) return false;
      const marsSatStrong = ['Own', 'Exalt.'].includes(p.Mars.status) && ['Own', 'Exalt.'].includes(p.Saturn.status);
      const jupAfflicted = p.Jupiter.combust || ['Debil.', 'Enemy'].includes(p.Jupiter.status);
      const satPlaced = [7, 10].includes(p.Saturn.house);
      if (marsSatStrong && jupAfflicted && satPlaced) {
        return { result: true, rationale: "Mars and Saturn are powerfully placed while Jupiter is afflicted, and Saturn commands the 7th/10th house — invoking Kalki's transformative, cycle-ending power." };
      }
      return false;
    },
  },

  // ========== DEITY YOGAS (ADITYAS, RUDRAS, VASUS, etc.) ~30+ ==========

  // 12 ADITYAS
  {
    name: "Dhata Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Sun in Aries with Mercury/Venus; Mars exalted",
    result: "Creator, provider, sustenance. Success in creation and nurturing endeavors.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Create new things', 'Nurture others', 'Sun worship'],
    mantras: ['Om Aditya Hridayam', 'Sun mantra'],
    deities: ['Dhata (Aditya)', 'Sun'],
    keywords: ['Creator', 'Sustenance', 'Provision'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Mars) return false;
      const sunInAries = p.Sun.sign === 'Aries';
      const withMercVen = (p.Mercury && p.Mercury.sn === p.Sun.sn) || (p.Venus && p.Venus.sn === p.Sun.sn);
      const marsExalted = p.Mars.status === 'Exalt.';
      if (sunInAries && withMercVen && marsExalted) {
        return { result: true, rationale: "The Sun is in Aries alongside Mercury or Venus, while Mars stands exalted — invoking Dhata's creative sustenance." };
      }
      return false;
    },
  },

  {
    name: "Mitra Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Venus-Mercury strong; Moon in Libra/Taurus",
    result: "Friendship, partnership, love, contracts. Good relations with all.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Build relationships', 'Make contracts', 'Venus worship'],
    mantras: ['Om Mitraya Namaha', 'Venus mantra'],
    deities: ['Mitra (Aditya)', 'Venus'],
    keywords: ['Friendship', 'Partnership', 'Love'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Venus || !p.Mercury || !p.Moon) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Venus.status) && ['Own', 'Exalt.'].includes(p.Mercury.status);
      const moonOk = ['Libra', 'Taurus'].includes(p.Moon.sign);
      if (strong && moonOk) {
        return { result: true, rationale: "Venus and Mercury are both strongly dignified while the Moon rests in a Venusian sign — invoking Mitra's harmonious friendship." };
      }
      return false;
    },
  },

  {
    name: "Aryaman Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Sun-Jupiter strong; Mars in 1st/10th; Saturn aspecting",
    result: "Nobility, prestige, honor, wealth. Respect and high status.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Earn honor', 'Be noble', 'Sun/Jupiter worship'],
    mantras: ['Om Aryamne Namaha', 'Jupiter mantra'],
    deities: ['Aryaman (Aditya)', 'Sun'],
    keywords: ['Noble', 'Honor', 'Prestige'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Jupiter || !p.Mars || !p.Saturn) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Sun.status) && ['Own', 'Exalt.'].includes(p.Jupiter.status);
      const marsOk = [1, 10].includes(p.Mars.house);
      const satAspects = hasAspect('Saturn', p.Saturn.house, p.Mars.house);
      if (strong && marsOk && satAspects) {
        return { result: true, rationale: "The Sun and Jupiter are strongly dignified, Mars commands the 1st/10th house, and Saturn's aspect is present — invoking Aryaman's nobility." };
      }
      return false;
    },
  },

  {
    name: "Indra Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Sun-Mars strong; Jupiter in 1st/10th; no malefic aspects",
    result: "King/leader, authority, power, victory, prosperity. Dominion.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Lead with power', 'Be victorious', 'Mars/Sun worship'],
    mantras: ['Om Indraya Namaha', 'Indra mantra'],
    deities: ['Indra (Aditya)', 'Mars', 'Sun'],
    keywords: ['King', 'Power', 'Victory'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Mars || !p.Jupiter) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Sun.status) && ['Own', 'Exalt.'].includes(p.Mars.status);
      const jupOk = [1, 10].includes(p.Jupiter.house);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const afflicted = malefics.some(m => m !== 'Mars' && p[m] && hasAspect(m, p[m].house, p.Jupiter.house));
      if (strong && jupOk && !afflicted) {
        return { result: true, rationale: "The Sun and Mars are strongly dignified, Jupiter commands the 1st/10th house free of malefic aspects — invoking Indra's dominion and victory." };
      }
      return false;
    },
  },

  {
    name: "Varuna Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Moon strong in water signs; Jupiter/Venus aspecting",
    result: "Law, order, cosmic justice. Spiritual authority and command.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Uphold dharma', 'Ocean rituals', 'Moon worship'],
    mantras: ['Om Varunaya Namaha', 'Moon mantra'],
    deities: ['Varuna (Aditya)', 'Moon'],
    keywords: ['Law', 'Order', 'Justice'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Moon) return false;
      const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
      const moonStrong = ['Own', 'Exalt.'].includes(p.Moon.status) && waterSigns.includes(p.Moon.sign);
      const aspecting = (p.Jupiter && hasAspect('Jupiter', p.Jupiter.house, p.Moon.house)) || (p.Venus && hasAspect('Venus', p.Venus.house, p.Moon.house));
      if (moonStrong && aspecting) {
        return { result: true, rationale: "The Moon is strongly placed in a water sign and receives Jupiter's or Venus's aspect — invoking Varuna's cosmic order and justice." };
      }
      return false;
    },
  },

  {
    name: "Ansuman Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Mercury strong in Virgo; Venus/Jupiter aspecting",
    result: "Eternity, constancy, stability. Long-lasting success and relationships.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Build lasting relationships', 'Be constant', 'Mercury worship'],
    mantras: ['Om Ansumanaya Namaha', 'Mercury mantra'],
    deities: ['Ansuman (Aditya)', 'Mercury'],
    keywords: ['Constancy', 'Stability', 'Eternity'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status) && p.Mercury.sign === 'Virgo';
      const aspecting = (p.Venus && hasAspect('Venus', p.Venus.house, p.Mercury.house)) || (p.Jupiter && hasAspect('Jupiter', p.Jupiter.house, p.Mercury.house));
      if (mercStrong && aspecting) {
        return { result: true, rationale: "Mercury is strongly placed in Virgo and receives Venus's or Jupiter's aspect — invoking Ansuman's steady constancy." };
      }
      return false;
    },
  },

  {
    name: "Bhaga Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Venus strong in Libra; Moon in Taurus; Jupiter aspecting",
    result: "Good fortune, abundance, distributive wealth. Luck and prosperity.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Distribute wealth', 'Share fortunes', 'Venus worship'],
    mantras: ['Om Bhagaya Namaha', 'Venus mantra'],
    deities: ['Bhaga (Aditya)', 'Venus', 'Lakshmi'],
    keywords: ['Fortune', 'Abundance', 'Prosperity'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Venus || !p.Moon || !p.Jupiter) return false;
      const venStrong = ['Own', 'Exalt.'].includes(p.Venus.status) && p.Venus.sign === 'Libra';
      const moonOk = p.Moon.sign === 'Taurus';
      const jupAspects = hasAspect('Jupiter', p.Jupiter.house, p.Moon.house);
      if (venStrong && moonOk && jupAspects) {
        return { result: true, rationale: "Venus is strongly placed in Libra, the Moon rests in Taurus, and Jupiter's aspect graces it — invoking Bhaga's abundant fortune." };
      }
      return false;
    },
  },

  {
    name: "Vivasvat Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Sun strong in Leo; Mars/Mercury aspecting",
    result: "Illumination, clarity, vision. Seeing truth, enlightenment.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Seek truth', 'Illumine others', 'Sun worship'],
    mantras: ['Gayatri Mantra', 'Sun mantra'],
    deities: ['Vivasvat (Aditya)', 'Sun'],
    keywords: ['Vision', 'Clarity', 'Enlightenment'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun) return false;
      const sunStrong = ['Own', 'Exalt.'].includes(p.Sun.status) && p.Sun.sign === 'Leo';
      const aspecting = (p.Mars && hasAspect('Mars', p.Mars.house, p.Sun.house)) || (p.Mercury && hasAspect('Mercury', p.Mercury.house, p.Sun.house));
      if (sunStrong && aspecting) {
        return { result: true, rationale: "The Sun is strongly placed in Leo and receives Mars's or Mercury's aspect — invoking Vivasvat's radiant clarity." };
      }
      return false;
    },
  },

  {
    name: "Pushan Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Mercury-Venus strong; Moon in Taurus; Jupiter aspecting",
    result: "Nourishment, plenty, expansion. Spiritual and material growth.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Nourish others', 'Agriculture', 'Merchant practices'],
    mantras: ['Om Pushne Namaha', 'Mercury mantra'],
    deities: ['Pushan (Aditya)', 'Mercury'],
    keywords: ['Nourishment', 'Plenty', 'Growth'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Venus || !p.Moon || !p.Jupiter) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Mercury.status) && ['Own', 'Exalt.'].includes(p.Venus.status);
      const moonOk = p.Moon.sign === 'Taurus';
      const jupAspects = hasAspect('Jupiter', p.Jupiter.house, p.Moon.house);
      if (strong && moonOk && jupAspects) {
        return { result: true, rationale: "Mercury and Venus are strongly dignified, the Moon rests in Taurus, and Jupiter's aspect nourishes it — invoking Pushan's abundant growth." };
      }
      return false;
    },
  },

  {
    name: "Twashtar Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Mercury strong in Virgo; Venus/Saturn aspecting",
    result: "Creation, craftsmanship, architect. Building and creation abilities.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Create things', 'Craft work', 'Architecture'],
    mantras: ['Om Twashtre Namaha', 'Mercury mantra'],
    deities: ['Twashtar (Aditya)', 'Mercury'],
    keywords: ['Creation', 'Craft', 'Architecture'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status) && p.Mercury.sign === 'Virgo';
      const aspecting = (p.Venus && hasAspect('Venus', p.Venus.house, p.Mercury.house)) || (p.Saturn && hasAspect('Saturn', p.Saturn.house, p.Mercury.house));
      if (mercStrong && aspecting) {
        return { result: true, rationale: "Mercury is strongly placed in Virgo and receives Venus's or Saturn's aspect — invoking Twashtar's supreme craftsmanship." };
      }
      return false;
    },
  },

  {
    name: "Savitar Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Sun strong in Leo; Jupiter/Mercury aspecting",
    result: "Awakener, inspirer, stimulation. Motivation and energy.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Inspire others', 'Morning sun worship', 'Physical activity'],
    mantras: ['Gayatri Mantra', 'Sun mantra'],
    deities: ['Savitar (Aditya)', 'Sun'],
    keywords: ['Awakening', 'Inspiration', 'Energy'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun) return false;
      const sunStrong = ['Own', 'Exalt.'].includes(p.Sun.status) && p.Sun.sign === 'Leo';
      const aspecting = (p.Jupiter && hasAspect('Jupiter', p.Jupiter.house, p.Sun.house)) || (p.Mercury && hasAspect('Mercury', p.Mercury.house, p.Sun.house));
      if (sunStrong && aspecting) {
        return { result: true, rationale: "The Sun is strongly placed in Leo and stimulated by Jupiter's or Mercury's aspect — invoking Savitar's awakening energy." };
      }
      return false;
    },
  },

  {
    name: "Marichi Yoga",
    category: 'Deity Yoga - Aditya',
    description: "Sun very strong; Mercury in 1st/10th; no malefic aspects",
    result: "Radiance, light, illumination. Strong personality and influence.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Radiate positivity', 'Inspire others', 'Sun worship'],
    mantras: ['Gayatri Mantra', 'Sun mantra'],
    deities: ['Marichi (Aditya)', 'Sun'],
    keywords: ['Radiance', 'Light', 'Influence'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Mercury) return false;
      const sunStrong = p.Sun.status === 'Exalt.';
      const mercOk = [1, 10].includes(p.Mercury.house);
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const afflicted = malefics.some(m => p[m] && hasAspect(m, p[m].house, p.Sun.house));
      if (sunStrong && mercOk && !afflicted) {
        return { result: true, rationale: "The Sun is exalted, Mercury occupies the 1st/10th house, and no malefic aspect touches the Sun — invoking Marichi's brilliant radiance." };
      }
      return false;
    },
  },

  // 11 RUDRAS
  {
    name: "Rudra Yoga General",
    category: 'Deity Yoga - Rudra',
    description: "Mars-Saturn strong; Ketu aspecting; Mercury weak",
    result: "Destruction power, transformation, fierce protection. Overcoming obstacles.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Destroy negativity', 'Shiva worship', 'Meditation'],
    mantras: ['Om Namah Shivaya', 'Rudra mantra'],
    deities: ['Rudra', 'Shiva'],
    keywords: ['Destruction', 'Transformation', 'Power'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Saturn || !p.Ketu || !p.Mercury) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Mars.status) && ['Own', 'Exalt.'].includes(p.Saturn.status);
      const ketuAspects = hasAspect('Ketu', p.Ketu.house, p.Mars.house) || hasAspect('Ketu', p.Ketu.house, p.Saturn.house);
      const mercWeak = p.Mercury.combust || ['Debil.', 'Enemy'].includes(p.Mercury.status);
      if (strong && ketuAspects && mercWeak) {
        return { result: true, rationale: "Mars and Saturn are powerfully placed, Ketu's aspect touches them, and Mercury is weakened — invoking Rudra's fierce transformative power." };
      }
      return false;
    },
  },

  {
    name: "Hanuman Avatar Rudra",
    category: 'Deity Yoga - Rudra',
    description: "Mars strong in Aries; Sun aspecting; Leo influence",
    result: "Devotion, courage, service. Perfect disciple and warrior.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Serve guru', 'Be devoted', 'Hanuman worship'],
    mantras: ['Hanuman Chalisa', 'Mars mantra'],
    deities: ['Hanuman', 'Rudra', 'Mars'],
    keywords: ['Devotion', 'Courage', 'Service'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Sun) return false;
      const marsStrong = ['Own', 'Exalt.'].includes(p.Mars.status) && p.Mars.sign === 'Aries';
      const sunAspects = hasAspect('Sun', p.Sun.house, p.Mars.house);
      const leoInfluence = p.Sun.sign === 'Leo' || (c.asc && c.asc.sn === 4);
      if (marsStrong && sunAspects && leoInfluence) {
        return { result: true, rationale: "Mars is strongly placed in Aries, aspected by the Sun, with Leo's influence present — invoking Hanuman's devoted courage." };
      }
      return false;
    },
  },

  {
    name: "Bhairava Rudra Yoga",
    category: 'Deity Yoga - Rudra',
    description: "Mars-Saturn strong; Ketu strong; Jupiter weak",
    result: "Fearless protection, fierce destroyer of evil. Tremendous power.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Protect dharma', 'Destroy evil', 'Bhairava worship'],
    mantras: ['Om Namah Shivaya', 'Bhairava mantra'],
    deities: ['Bhairava', 'Shiva', 'Mars'],
    keywords: ['Fearless', 'Protection', 'Power'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Saturn || !p.Ketu || !p.Jupiter) return false;
      const marsSatStrong = ['Own', 'Exalt.'].includes(p.Mars.status) && ['Own', 'Exalt.'].includes(p.Saturn.status);
      const ketuStrong = ['Scorpio', 'Sagittarius', 'Pisces'].includes(p.Ketu.sign);
      const jupWeak = p.Jupiter.combust || ['Debil.', 'Enemy'].includes(p.Jupiter.status);
      if (marsSatStrong && ketuStrong && jupWeak) {
        return { result: true, rationale: "Mars and Saturn hold intense strength, Ketu is powerfully placed, and Jupiter is weakened — invoking Bhairava's fearless, fierce protection." };
      }
      return false;
    },
  },

  {
    name: "Ardhanarishvara Rudra",
    category: 'Deity Yoga - Rudra',
    description: "Mars-Venus strong equally; Moon-Sun balanced",
    result: "Union of masculine/feminine, completeness. Androgynous power.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Balance energies', 'Worship both', 'Yoga practices'],
    mantras: ['Om Namah Shivaya', 'Ardhanari mantra'],
    deities: ['Ardhanarishvara', 'Shiva'],
    keywords: ['Balance', 'Union', 'Completeness'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Venus) return false;
      const marsStrong = ['Own', 'Exalt.'].includes(p.Mars.status);
      const venStrong = ['Own', 'Exalt.'].includes(p.Venus.status);
      const conjunct = p.Mars.house === p.Venus.house;
      if (marsStrong && venStrong && conjunct) {
        return { result: true, rationale: "Mars and Venus are equally dignified and conjunct in the same house — invoking Ardhanarishvara's balanced union of masculine and feminine energies." };
      }
      return false;
    },
  },

  {
    name: "Virabhadra Rudra",
    category: 'Deity Yoga - Rudra',
    description: "Mars very strong; Saturn in 1st/10th; no benefic aspects",
    result: "Warrior supreme, fierce commander, unstoppable force.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Be warrior', 'Conquer enemies', 'Mars worship'],
    mantras: ['Om Namah Shivaya', 'Virabhadra mantra'],
    deities: ['Virabhadra', 'Mars', 'Shiva'],
    keywords: ['Warrior', 'Fierce', 'Commander'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Saturn) return false;
      const marsStrong = p.Mars.status === 'Exalt.' || p.Mars.status === 'Own';
      const satOk = [1, 10].includes(p.Saturn.house);
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const noBeneficAspect = !benefics.some(b => p[b] && hasAspect(b, p[b].house, p.Mars.house));
      if (marsStrong && satOk && noBeneficAspect) {
        return { result: true, rationale: "Mars is powerfully placed, Saturn commands the 1st/10th house, and no benefic softens Mars — invoking Virabhadra's unstoppable warrior force." };
      }
      return false;
    },
  },

  {
    name: "Ugra Rudra Yoga",
    category: 'Deity Yoga - Rudra',
    description: "Mars-Ketu conjunction strong; Saturn aspecting",
    result: "Fierce intensity, overwhelming power, destruction of obstacles.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Use power wisely', 'Intense practices', 'Shiva worship'],
    mantras: ['Om Namah Shivaya', 'Ugra mantra'],
    deities: ['Ugra Rudra', 'Shiva', 'Mars'],
    keywords: ['Fierce', 'Intense', 'Power'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Ketu || !p.Saturn) return false;
      const conj = p.Mars.sn === p.Ketu.sn && ['Own', 'Exalt.'].includes(p.Mars.status);
      const satAspects = hasAspect('Saturn', p.Saturn.house, p.Mars.house);
      if (conj && satAspects) {
        return { result: true, rationale: "Mars and Ketu are powerfully conjunct, aspected by Saturn — invoking Ugra Rudra's overwhelming destructive intensity." };
      }
      return false;
    },
  },

  {
    name: "Mahakala Rudra",
    category: 'Deity Yoga - Rudra',
    description: "Saturn strong; Moon afflicted; Mars aspecting",
    result: "Master of time, destroyer of time, liberation. End of cycles.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Accept time', 'Meditate', 'Saturn worship'],
    mantras: ['Om Namah Shivaya', 'Mahakala mantra'],
    deities: ['Mahakala', 'Shiva', 'Saturn'],
    keywords: ['Time', 'Liberation', 'Cycles'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Saturn || !p.Moon || !p.Mars) return false;
      const satStrong = ['Own', 'Exalt.'].includes(p.Saturn.status);
      const moonAfflicted = p.Moon.combust || ['Debil.', 'Enemy'].includes(p.Moon.status) || (p.Rahu && p.Moon.sn === p.Rahu.sn) || (p.Ketu && p.Moon.sn === p.Ketu.sn);
      const marsAspects = hasAspect('Mars', p.Mars.house, p.Moon.house);
      if (satStrong && moonAfflicted && marsAspects) {
        return { result: true, rationale: "Saturn (Time) is dominant, the Moon (Mind) is afflicted, and Mars casts its aspect — invoking Mahakala's power over cycles and endings." };
      }
      return false;
    },
  },

  // 8 VASUS
  {
    name: "Agni Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Sun strong in Leo; Mars aspecting; Jupiter aspecting",
    result: "Purification, energy, courage. Success through effort.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Purify self', 'Energy work', 'Sun worship'],
    mantras: ['Gayatri Mantra', 'Fire mantras'],
    deities: ['Agni (Vasu)', 'Sun'],
    keywords: ['Fire', 'Purification', 'Energy'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Mars || !p.Jupiter) return false;
      const sunStrong = ['Own', 'Exalt.'].includes(p.Sun.status) && p.Sun.sign === 'Leo';
      const marsAspects = hasAspect('Mars', p.Mars.house, p.Sun.house);
      const jupAspects = hasAspect('Jupiter', p.Jupiter.house, p.Sun.house);
      if (sunStrong && marsAspects && jupAspects) {
        return { result: true, rationale: "The Sun is strongly placed in Leo, receiving both Mars's and Jupiter's aspects — invoking Agni's purifying energy." };
      }
      return false;
    },
  },

  {
    name: "Prithvi Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Saturn strong; Moon in earth signs; Venus aspecting",
    result: "Stability, foundation, grounding. Real estate and material success.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Build foundation', 'Land work', 'Saturn worship'],
    mantras: ['Earth mantras', 'Saturn mantras'],
    deities: ['Prithvi (Vasu)', 'Saturn'],
    keywords: ['Earth', 'Stability', 'Foundation'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Saturn || !p.Moon || !p.Venus) return false;
      const satStrong = ['Own', 'Exalt.'].includes(p.Saturn.status);
      const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
      const moonOk = earthSigns.includes(p.Moon.sign);
      const venAspects = hasAspect('Venus', p.Venus.house, p.Moon.house);
      if (satStrong && moonOk && venAspects) {
        return { result: true, rationale: "Saturn is strongly placed, the Moon rests in an earth sign, and Venus aspects it — invoking Prithvi's grounded stability." };
      }
      return false;
    },
  },

  {
    name: "Vayu Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Mercury strong; Wind-related planets; Jupiter aspecting",
    result: "Movement, communication, speed. Travel and trade success.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Travel', 'Communicate', 'Mercury worship'],
    mantras: ['Air mantras', 'Mercury mantras'],
    deities: ['Vayu (Vasu)', 'Mercury'],
    keywords: ['Air', 'Movement', 'Speed'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Jupiter || !p.Saturn) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status);
      const jupAspects = hasAspect('Jupiter', p.Jupiter.house, p.Mercury.house);
      const windInfluence = p.Saturn.sn === p.Mercury.sn || (p.Rahu && p.Rahu.sn === p.Mercury.sn) || hasAspect('Saturn', p.Saturn.house, p.Mercury.house);
      if (mercStrong && jupAspects && windInfluence) {
        return { result: true, rationale: "Mercury is strongly placed with airy influences, expanded by Jupiter's aspect — invoking Vayu's speed and communication." };
      }
      return false;
    },
  },

  {
    name: "Dhanista Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Jupiter strong in Sagittarius; Moon in Taurus; Venus aspecting",
    result: "Wealth accumulation, prosperity, abundance. Rich and generous.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Accumulate wealth', 'Be generous', 'Jupiter worship'],
    mantras: ['Wealth mantras', 'Jupiter mantras'],
    deities: ['Dhanista (Vasu)', 'Jupiter'],
    keywords: ['Wealth', 'Prosperity', 'Abundance'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Jupiter || !p.Moon || !p.Venus) return false;
      const jupOk = ['Own', 'Exalt.'].includes(p.Jupiter.status) && p.Jupiter.sign === 'Sagittarius';
      const moonOk = p.Moon.sign === 'Taurus';
      const venAspects = hasAspect('Venus', p.Venus.house, p.Moon.house) || hasAspect('Venus', p.Venus.house, p.Jupiter.house);
      if (jupOk && moonOk && venAspects) {
        return { result: true, rationale: "Jupiter is strongly placed in Sagittarius, the Moon rests in Taurus, and Venus's aspect graces one of them — invoking Dhanista's abundant wealth." };
      }
      return false;
    },
  },

  {
    name: "Indra Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Mars-Jupiter strong; Sun in 1st/10th; Moon aspecting",
    result: "Leadership, power, dominion. Success and supremacy.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Lead others', 'Be powerful', 'Jupiter/Mars worship'],
    mantras: ['Indra mantras', 'Leadership mantras'],
    deities: ['Indra (Vasu)', 'Jupiter', 'Mars'],
    keywords: ['Leadership', 'Power', 'Dominion'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mars || !p.Jupiter || !p.Sun || !p.Moon) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Mars.status) && ['Own', 'Exalt.'].includes(p.Jupiter.status);
      const sunOk = [1, 10].includes(p.Sun.house);
      const moonAspects = hasAspect('Moon', p.Moon.house, p.Sun.house);
      if (strong && sunOk && moonAspects) {
        return { result: true, rationale: "Mars and Jupiter are strongly dignified, the Sun commands the 1st/10th house, and the Moon's aspect graces it — invoking Indra's supreme dominion." };
      }
      return false;
    },
  },

  {
    name: "Prabha Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Sun strong; Mercury aspecting; 5th house benefic",
    result: "Brilliance, intelligence, splendor. Shine and radiate success.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Shine brightly', 'Study', 'Sun worship'],
    mantras: ['Brilliance mantras', 'Sun mantras'],
    deities: ['Prabha (Vasu)', 'Sun'],
    keywords: ['Brilliance', 'Splendor', 'Intelligence'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Sun || !p.Mercury) return false;
      const sunStrong = ['Own', 'Exalt.'].includes(p.Sun.status);
      const mercAspects = hasAspect('Mercury', p.Mercury.house, p.Sun.house) || p.Mercury.sn === p.Sun.sn;
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const beneficIn5 = benefics.some(b => p[b] && p[b].house === 5);
      if (sunStrong && mercAspects && beneficIn5) {
        return { result: true, rationale: "The Sun is strongly placed, Mercury influences it, and a benefic graces the 5th house of intellect — invoking Prabha's brilliance." };
      }
      return false;
    },
  },

  {
    name: "Ratnakara Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Venus-Mercury strong; 2nd/11th lords aspecting",
    result: "Jewel treasure, precious things. Wealth through refinement.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Refine things', 'Jewel work', 'Venus worship'],
    mantras: ['Treasure mantras', 'Venus mantras'],
    deities: ['Ratnakara (Vasu)', 'Venus'],
    keywords: ['Treasure', 'Jewels', 'Refinement'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Venus || !p.Mercury || !c.asc) return false;
      const strong = ['Own', 'Exalt.'].includes(p.Venus.status) && ['Own', 'Exalt.'].includes(p.Mercury.status);
      if (!strong) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const lord2 = getSignLord(signNames[(ascSn + 1) % 12]);
      const lord11 = getSignLord(signNames[(ascSn + 10) % 12]);
      const aspecting = [lord2, lord11].some(l => p[l] && (hasAspect(l, p[l].house, p.Venus.house) || hasAspect(l, p[l].house, p.Mercury.house)));
      if (aspecting) {
        return { result: true, rationale: `Venus and Mercury are strongly dignified and receive an aspect from the lord of wealth (${lord2}) or gains (${lord11}) — invoking Ratnakara's treasure.` };
      }
      return false;
    },
  },

  {
    name: "Satya Vasu Yoga",
    category: 'Deity Yoga - Vasu',
    description: "Mercury strong; Jupiter aspecting; Moon in Libra",
    result: "Truth, honesty, righteousness. Truthful and just dealings.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Be truthful', 'Practice justice', 'Mercury worship'],
    mantras: ['Truth mantras', 'Dharma mantras'],
    deities: ['Satya (Vasu)', 'Mercury'],
    keywords: ['Truth', 'Honesty', 'Justice'],
    evaluate: (c) => {
      const p = c.planets;
      if (!p || !p.Mercury || !p.Moon || !p.Jupiter) return false;
      const mercStrong = ['Own', 'Exalt.'].includes(p.Mercury.status);
      const moonOk = p.Moon.sign === 'Libra';
      const jupAspects = hasAspect('Jupiter', p.Jupiter.house, p.Mercury.house);
      if (mercStrong && moonOk && jupAspects) {
        return { result: true, rationale: "Mercury is strongly placed, the Moon rests in Libra, and Jupiter's righteous aspect graces Mercury — invoking Satya's truthfulness." };
      }
      return false;
    },
    },

  // ========== PROPERTY YOGAS (Real Estate / Griha Yogas) ==========
  // Source: classical property-yoga principles (4th house = home/property)
  // covering (1) a beautiful/comfortable house, (2) multiple large
  // mansions, (3) effortless acquisition via Lagna/7th lord, (4) effortless
  // acquisition via 9th lord + 4th lord dignity, and (5) the negative
  // "Graha Nash Yoga" where property is acquired but does not stay.

  {
    name: "Bhavya Bhoomi Yoga",
    category: 'Property',
    description: "4th Lord placed in a Kendra (1,4,7,10) or Trikona (1,5,9) house, conjunct with or aspected by a natural benefic (Jupiter, Venus, Mercury or Moon)",
    result: "Native acquires a beautiful, spacious and comfortable house or property in life, generally without excessive struggle.",
    effect: "Strong 4th Lord blessed by benefic influence brings a good quality home/property, often earlier in life than average.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Perform Vastu Puja / Bhoomi Puja before construction or purchase', 'Donate white items on Mondays for domestic comfort', 'Keep the north-east corner of the home clean and well-lit', 'Strengthen the 4th Lord through its ruling mantra/gemstone'],
    mantras: ['Om Bhoomi Devyai Namaha', 'Vastu Shanti Mantra'],
    deities: ['Vastu Purush', 'Bhoomi Devi'],
    keywords: ['Property', 'House', 'Comfort', '4th Lord'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const ascSn = c.asc.sn || 0;
      const lord4 = getSignLord(signNames[(ascSn + 3) % 12]);
      const p4 = c.planets[lord4];
      if (!p4) return false;

      const kendraTrikona = [1, 4, 5, 7, 9, 10];
      if (!kendraTrikona.includes(p4.house)) return false;

      const ASPECT_HOUSES = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10] };
      let conjBenefic = null, aspectingBenefic = null;

      benefics.forEach(b => {
        if (b === lord4) return;
        const bp = c.planets[b];
        if (!bp) return;
        if (bp.sn === p4.sn && Math.abs((bp.deg || 0) - (p4.deg || 0)) <= 8) conjBenefic = b;
        const rules = ASPECT_HOUSES[b] || [7];
        const diff = ((p4.house - bp.house + 12) % 12) + 1;
        if (rules.includes(diff)) aspectingBenefic = b;
      });

      if (conjBenefic || aspectingBenefic) {
        const via = conjBenefic ? `conjunct with ${conjBenefic}` : `aspected by ${aspectingBenefic}`;
        return { result: true, rationale: `4th Lord ${lord4} is placed in House ${p4.house} (Kendra/Trikona) and is ${via} — a benefic influence on the house of property.` };
      }
      return false;
    }
  },

  {
    name: "Vichitra Saudha Yoga",
    category: 'Property',
    description: "Rare combination where the 4th Lord, 10th Lord, Saturn and Mars (as many of these as are distinct planets) all conjoin together in one sign",
    result: "Indicates ownership of more than one large house/mansion — in modern terms, multiple big properties or a palatial residence.",
    effect: "A rare, very strong property yoga; native tends to accumulate substantial real estate/landed property over a lifetime.",
    quality: "Positive",
    strength: 'Very Strong',
    varga: 1,
    remedies: ['Charitable donation of land or shelter to the needy to sustain the yoga\'s fruits', 'Worship Mars (Tuesdays) and Saturn (Saturdays) together for stability of assets', 'Maintain proper legal documentation for every property acquired'],
    mantras: ['Om Bhaumaya Namaha', 'Om Sham Shanicharaya Namaha'],
    deities: ['Mars', 'Saturn', 'Bhoomi Devi'],
    keywords: ['Property', 'Mansion', 'Multiple Houses', 'Real Estate'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const lord4 = getSignLord(signNames[(ascSn + 3) % 12]);
      const lord10 = getSignLord(signNames[(ascSn + 9) % 12]);
      const requiredPlanets = Array.from(new Set([lord4, lord10, 'Saturn', 'Mars']));
      if (requiredPlanets.length < 3) return false;

      const positions = requiredPlanets.map(p => c.planets[p]).filter(Boolean);
      if (positions.length !== requiredPlanets.length) return false;

      const firstSn = positions[0].sn;
      const allSameSign = positions.every(p => p.sn === firstSn);
      if (allSameSign) {
        return { result: true, rationale: `${requiredPlanets.join(', ')} are conjunct together in ${positions[0].sign} — a rare combination indicating ownership of multiple large properties/mansions.` };
      }
      return false;
    }
  },

  {
    name: "Ayatna Griha Prapti Yoga",
    category: 'Property',
    description: "Lagna Lord and 7th Lord both placed in Lagna (1st) or 4th house; the strength of the yoga depends on whether a benefic also aspects them",
    result: "Native acquires home and property with relative ease; if no benefic aspects the two lords, property still comes but only after extra effort.",
    effect: "Placement of both key lords in Lagna/4th links self and partnerships directly to the house of property.",
    quality: "Positive",
    strength: 'Moderate',
    varga: 1,
    remedies: ['Strengthen the Lagna Lord through its ruling mantra/colour/gemstone', 'Keep the home entrance (main door) clean, well-lit and clutter-free', 'Perform Ganesh Puja before initiating any property-related effort'],
    mantras: ['Om Gam Ganapataye Namaha'],
    deities: ['Ganesha', 'Vastu Purush'],
    keywords: ['Property', 'Lagna Lord', '7th Lord', 'Acquisition'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const benefics = window.ASTRO_CONSTANTS.BENEFICS;
      const ascSn = c.asc.sn || 0;
      const lagnaLord = getSignLord(signNames[ascSn % 12]);
      const lord7 = getSignLord(signNames[(ascSn + 6) % 12]);
      const pL = c.planets[lagnaLord];
      const p7 = c.planets[lord7];
      if (!pL || !p7) return false;

      const placementOk = [1, 4].includes(pL.house) && [1, 4].includes(p7.house);
      if (!placementOk) return false;

      const ASPECT_HOUSES = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10] };
      const isAspectedByBenefic = (target) => benefics.some(b => {
        const bp = c.planets[b];
        if (!bp || bp === target) return false;
        const rules = ASPECT_HOUSES[b] || [7];
        const diff = ((target.house - bp.house + 12) % 12) + 1;
        return rules.includes(diff);
      });

      const bothAspected = isAspectedByBenefic(pL) && isAspectedByBenefic(p7);

      if (bothAspected) {
        return { result: true, rationale: `Lagna Lord (${lagnaLord}) and 7th Lord (${lord7}) both occupy Lagna/4th house and are aspected by benefics — property comes with ease and with little effort.` };
      }
      return { result: true, rationale: `Lagna Lord (${lagnaLord}) and 7th Lord (${lord7}) both occupy Lagna/4th house, but lack a full benefic aspect — property/home will still come, but only after some extra effort.` };
    }
  },

  {
    name: "Navamsa Sukh Griha Yoga",
    category: 'Property',
    description: "9th Lord placed in a Kendra (1,4,7,10) house, while the 4th Lord is in its own sign, exaltation, or Moolatrikona",
    result: "Native can easily acquire a home and property in their lifetime, without needing to strive for it.",
    effect: "Fortune (9th house) actively supports the house of property, and the 4th Lord's own dignity makes the outcome stable and lasting.",
    quality: "Positive",
    strength: 'Strong',
    varga: 1,
    remedies: ['Worship Jupiter (Thursdays) to strengthen the 9th house of fortune', 'Perform charitable acts related to shelter/housing for others', 'Keep ancestral property documents and blessings (Pitru) in good order'],
    mantras: ['Om Brihaspataye Namaha', 'Om Namo Bhagavate Vasudevaya'],
    deities: ['Jupiter', 'Vastu Purush'],
    keywords: ['Property', '9th Lord', '4th Lord', 'Dignity', 'Fortune'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const ascSn = c.asc.sn || 0;
      const lord9 = getSignLord(signNames[(ascSn + 8) % 12]);
      const lord4 = getSignLord(signNames[(ascSn + 3) % 12]);
      const p9 = c.planets[lord9];
      const p4 = c.planets[lord4];
      if (!p9 || !p4) return false;

      const kendra = [1, 4, 7, 10];
      if (!kendra.includes(p9.house)) return false;

      const dign = window.ASTRO_CONSTANTS.DIGNITIES[lord4];
      const mt = window.ASTRO_CONSTANTS.MULATRIKONA[lord4];
      const isOwn = dign && Array.isArray(dign.own) && dign.own.includes(p4.sn);
      const isExalt = dign && dign.exalt === p4.sn;
      const isMT = mt && mt.sign === p4.sn && (p4.deg || 0) >= mt.start && (p4.deg || 0) <= mt.end;

      if (isOwn || isExalt || isMT) {
        const dignityLabel = isMT ? 'Moolatrikona' : (isExalt ? 'Exaltation' : 'Own sign');
        return { result: true, rationale: `9th Lord ${lord9} is in a Kendra (House ${p9.house}) and 4th Lord ${lord4} is in its ${dignityLabel} (${p4.sign}) — property/home comes easily and without struggle.` };
      }
      return false;
    }
  },

  {
    name: "Griha Nash Yoga",
    category: 'Property',
    description: "4th Lord placed in the 3rd house from Lagna (i.e. the 12th house counted from the 4th house itself) and afflicted by a malefic conjunction/aspect",
    result: "Property is acquired but does not stay with the native — forced sale, bank seizure on a loan-backed property, or transfer out of the native's name.",
    effect: "The 4th Lord's placement in the 'loss from property' zone, combined with malefic affliction, repeatedly disturbs ownership and retention of real estate.",
    quality: "Negative",
    strength: 'Strong',
    varga: 1,
    remedies: ['Avoid registering major property purely in your own single name; consider joint/family or trust ownership', 'Strengthen the 4th Lord via its mantra/gemstone before any property purchase', 'Perform Vastu Shanti and Bhoomi Puja before every purchase', 'Keep property-related loans conservative — avoid over-leveraging', 'Get legal documentation thoroughly verified before signing'],
    mantras: ['Om Namah Shivaya', "4th Lord's beej mantra"],
    deities: ['Vastu Purush', 'Bhoomi Devi'],
    keywords: ['Property Loss', '4th Lord', 'Graha Nash', 'Real Estate'],
    evaluate: (c) => {
      if (!c.planets || !c.asc) return false;
      const signNames = window.ASTRO_CONSTANTS.SIGNS;
      const malefics = window.ASTRO_CONSTANTS.MALEFICS;
      const ascSn = c.asc.sn || 0;
      const lord4 = getSignLord(signNames[(ascSn + 3) % 12]);
      const p4 = c.planets[lord4];
      if (!p4) return false;

      // 12th from the 4th house = the 3rd house from Lagna
      if (p4.house !== 3) return false;

      const ASPECT_HOUSES = { Mars: [4, 7, 8], Saturn: [3, 7, 10] };
      const afflicted = malefics.some(m => {
        if (m === lord4) return false;
        const mp = c.planets[m];
        if (!mp) return false;
        if (mp.sn === p4.sn && Math.abs((mp.deg || 0) - (p4.deg || 0)) <= 8) return true;
        const rules = ASPECT_HOUSES[m] || [7];
        const diff = ((p4.house - mp.house + 12) % 12) + 1;
        return rules.includes(diff);
      });

      if (afflicted) {
        return { result: true, rationale: `4th Lord ${lord4} is placed in the 3rd house from Lagna (the 12th house counted from the 4th house) and is afflicted by a malefic — property acquired may not stay; risk of forced sale, loss or transfer out of the native's name.` };
      }
      return false;
    }
  }

];

// =====================================================================
// MERGED ADDITIONS — Classical Yogas previously missing from the set
// above (originally shipped separately as yoga_missing_additions.js,
// merged in directly so there is a single source of truth).
//
// Each entry below follows the same evaluate(chart) contract as the
// yogas above, plus extra reference fields (methodOfCalculation,
// cause, nullification, referenceShloka) for a fuller picture of the
// classical logic behind each yoga.
// =====================================================================

// ===================== SHARED HELPERS =====================

    function YOGA_SIGNS() { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) || []; }
    function BENEFICS() { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.BENEFICS) || ['Jupiter', 'Venus', 'Mercury', 'Moon']; }
    function MALEFICS() { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.MALEFICS) || ['Saturn', 'Mars', 'Rahu', 'Ketu']; }
    function signLord(signName) {
        if (typeof getSignLord === 'function') return getSignLord(signName);
        const idx = YOGA_SIGNS().indexOf(signName);
        return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS[idx]) || 'Unknown';
    }
    function isStrong(pos) { return !!pos && (pos.status === 'Own' || pos.status === 'Exalt.'); }
    function isKendra(house) { return [1, 4, 7, 10].includes(house); }
    function isTrikona(house) { return [1, 5, 9].includes(house); }
    function isKendraTrikona(house) { return [1, 4, 5, 7, 9, 10].includes(house); }
    function isDusthana(house) { return [6, 8, 12].includes(house); }
    /** 1-indexed house count from `fromHouse` to `toHouse` (fromHouse itself = 1) */
    function houseCount(fromHouse, toHouse) { return ((toHouse - fromHouse + 12) % 12) + 1; }
    /** Does a planet placed in fromHouse aspect toHouse (Vedic full-aspect rules)? */
    function hasAspect(planetName, fromHouse, toHouse) {
        const dist = houseCount(fromHouse, toHouse);
        if (dist === 7) return true; // universal 7th aspect
        if (planetName === 'Jupiter' && (dist === 5 || dist === 9)) return true;
        if (planetName === 'Mars' && (dist === 4 || dist === 8)) return true;
        if (planetName === 'Saturn' && (dist === 3 || dist === 10)) return true;
        return false;
    }
    function lordOfHouse(ascSn, houseNum) {
        return signLord(YOGA_SIGNS()[(ascSn + houseNum - 1) % 12]);
    }
    function anyBeneficIn(c, house) {
        return BENEFICS().filter(b => c.planets[b] && c.planets[b].house === house);
    }
    function anyBeneficAspecting(c, house) {
        const found = [];
        Object.keys(c.planets).forEach(p => {
            if (!BENEFICS().includes(p)) return;
            const pos = c.planets[p];
            if (pos && pos.house && hasAspect(p, pos.house, house)) found.push(p);
        });
        return found;
    }

    

const NEW_YOGAS = [];
    // ---------- 1. Adhi Yoga (from Lagna) ----------
    NEW_YOGAS.push({
        name: 'Adhi Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: ['Mercury', 'Jupiter', 'Venus'],
        keywords: ['authority', 'command', 'prosperity', 'victory over enemies'],
        methodOfCalculation: 'Check houses 6, 7, and 8 counted from the Ascendant (Lagna). If benefic planets (Mercury, Jupiter, Venus) occupy at least two of these three houses (separately, together, or all three combined in one), Adhi Yoga is formed.',
        cause: 'Benefics naturally flanking the 7th house (the axis of partnership and public life) from both sides fortifies the native\'s standing without any single house being overloaded.',
        description: 'Formed when benefic planets (Mercury, Jupiter, and/or Venus) occupy the 6th, 7th, and 8th houses counted from the Ascendant — distributed singly, doubly, or all together in one of the three houses.',
        result: 'The native becomes a commander of an army, a minister, or a ruler of a state; highly renowned, prosperous, wealthy, long-lived, magnanimous, and victorious over enemies.',
        nullification: 'Weakened if the benefics involved are themselves combust, debilitated, or afflicted by malefic conjunction/aspect in those houses.',
        referenceShloka: 'लग्नात् षष्ठे तथा लाभे विलग्ने वा शुभग्रहाः। अध्याख्यो जायते योगो राजमन्त्रि-सम-प्रदः॥',
        strength: 'Strong',
        remedies: ['Strengthen the benefic planets involved through their respective mantras and donations', 'Worship Vishnu or Guru (Jupiter) for sustained support'],
        mantras: ['Om Gurave Namah', 'Om Namo Bhagavate Vasudevaya'],
        deities: ['Vishnu', 'Brihaspati'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const h6 = anyBeneficIn(c, 6), h7 = anyBeneficIn(c, 7), h8 = anyBeneficIn(c, 8);
            const occupied = [h6.length > 0, h7.length > 0, h8.length > 0].filter(Boolean).length;
            const isDetected = occupied >= 2;
            const detail = [
                h6.length ? `H6: ${h6.join(', ')}` : '',
                h7.length ? `H7: ${h7.join(', ')}` : '',
                h8.length ? `H8: ${h8.join(', ')}` : ''
            ].filter(Boolean).join('; ');
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because benefic planets occupy ${occupied} of the 6th/7th/8th houses from the Lagna (${detail}), fortifying the native's standing.` : 'Benefics do not sufficiently occupy the 6th/7th/8th houses from the Lagna.'
            };
        }
    });

    // ---------- 2. Chandradhi Yoga (Adhi Yoga from Moon) ----------
    NEW_YOGAS.push({
        name: 'Chandradhi Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: ['Mercury', 'Jupiter', 'Venus', 'Moon'],
        keywords: ['prosperity', 'mental strength', 'high status'],
        methodOfCalculation: 'Identical to Adhi Yoga, but the 6th, 7th, and 8th houses are counted from the natal Moon rather than the Ascendant.',
        cause: 'Benefics surrounding the Moon (the mind-significator) from both flanks stabilizes and elevates emotional and mental strength, which manifests as worldly success.',
        description: 'Formed when benefic planets occupy the 6th, 7th, and 8th houses counted from the natal Moon.',
        result: 'The native becomes a commander, minister, or ruler; highly prosperous, wealthy, and long-lived, with a calm and victorious mind.',
        nullification: 'Reduced if the Moon itself is severely afflicted (combust, debilitated, or in Kemadruma) despite benefics flanking it.',
        referenceShloka: 'चन्द्रात् षष्ठे तथा लाभे विलग्ने वा शुभग्रहाः। चन्द्राध्याख्यो भवेद्योगो मनोबल-प्रदायकः॥',
        strength: 'Strong',
        remedies: ['Chant Chandra mantras on Mondays', 'Donate white items (rice, milk, silver) to strengthen the Moon'],
        mantras: ['Om Som Somaya Namah'],
        deities: ['Chandra'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Moon) return { result: false };
            const moonHouse = c.planets.Moon.house || 1;
            const h6 = houseCount(1, 1); // placeholder not used
            const rel6 = ((moonHouse - 1 + 5) % 12) + 1;
            const rel7 = ((moonHouse - 1 + 6) % 12) + 1;
            const rel8 = ((moonHouse - 1 + 7) % 12) + 1;
            const p6 = BENEFICS().filter(b => c.planets[b] && c.planets[b].house === rel6);
            const p7 = BENEFICS().filter(b => c.planets[b] && c.planets[b].house === rel7);
            const p8 = BENEFICS().filter(b => c.planets[b] && c.planets[b].house === rel8);
            const occupied = [p6.length > 0, p7.length > 0, p8.length > 0].filter(Boolean).length;
            const isDetected = occupied >= 2;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because benefics occupy ${occupied} of the 6th/7th/8th houses counted from the Moon (H${moonHouse}, ${c.planets.Moon.sign}) — H6:${p6.join(',') || '—'} H7:${p7.join(',') || '—'} H8:${p8.join(',') || '—'}.` : 'Benefics do not sufficiently flank the Moon from the 6th/7th/8th houses.'
            };
        }
    });

    // ---------- 3. Mahabhagya Yoga ----------
    NEW_YOGAS.push({
        name: 'Mahabhagya Yoga',
        category: 'Special/Rare',
        quality: 'Positive',
        planets: ['Sun', 'Moon'],
        keywords: ['great fortune', 'popularity', 'longevity', 'spotless character'],
        methodOfCalculation: 'For a native born by day: the Ascendant, Sun, and Moon must all fall in odd signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius). For a native born by night: the Ascendant, Sun, and Moon must all fall in even signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces). This tool approximates day/night birth from whether the Sun occupies houses 7–12 (day) or 1–6 (night) relative to the Ascendant.',
        cause: 'A rare triple alignment of the two luminaries and the rising sign to the same odd/even polarity, harmonizing with the birth-time solar phase, produces exceptional overall life fortune.',
        description: 'A rare yoga formed when the Ascendant, Sun, and Moon are all in odd signs during a day birth, or all in even signs during a night birth.',
        result: 'Immense popularity, generosity, high reputation, spotless character, and an exceptionally long life (traditionally up to 80 years).',
        nullification: 'No classical nullification is described; its strength is proportional to how well-dignified the Sun and Moon otherwise are.',
        referenceShloka: '(Referenced generally in classical Jataka texts on luminary-Lagna sign parity; no single standard shloka is uniformly cited.)',
        strength: 'Very Strong',
        remedies: ['Maintain solar and lunar worship (Surya Namaskar at dawn, Chandra Darshan in the evening) to sustain this yoga\'s promise'],
        mantras: ['Om Suryaya Namah', 'Om Chandraya Namah'],
        deities: ['Surya', 'Chandra'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Sun || !c.planets.Moon || !c.asc) return { result: false };
            const sun = c.planets.Sun, moon = c.planets.Moon, asc = c.asc;
            const isDayBirth = (sun.house || 1) >= 7 && (sun.house || 1) <= 12;
            const ascOdd = (asc.sn % 2) === 0;
            const sunOdd = (sun.sn % 2) === 0;
            const moonOdd = (moon.sn % 2) === 0;
            const maleForm = isDayBirth && ascOdd && sunOdd && moonOdd;
            const femaleForm = !isDayBirth && !ascOdd && !sunOdd && !moonOdd;
            const isDetected = maleForm || femaleForm;
            return {
                result: isDetected,
                rationale: isDetected
                    ? `It forms because this is an approximate ${isDayBirth ? 'day' : 'night'} birth and the Ascendant (${asc.sign || YOGA_SIGNS()[asc.sn]}), Sun (${sun.sign}), and Moon (${moon.sign}) are all in ${maleForm ? 'odd' : 'even'} signs — the rare Mahabhagya alignment.`
                    : 'Ascendant, Sun, and Moon do not share the required odd/even sign parity for the estimated day/night birth.'
            };
        }
    });

    // ---------- 4–15. The 12 Bhava-Strength Yogas ----------
    const BHAVA_YOGAS = [
        { house: 1, name: 'Chamara Yoga', result: 'The native grows in prosperity like the waxing Moon, is well-behaved, wealthy, highly renowned, long-lived, and becomes a lord of men.' },
        { house: 2, name: 'Dhenu Yoga', result: 'The native is exceptionally well-equipped with gold, wealth, grains, and precious stones, living a life equal to an emperor.' },
        { house: 3, name: 'Shaurya Yoga', result: 'The native is blessed with devoted younger brothers, is exceptionally brave, valiant, and admired by others.' },
        { house: 4, name: 'Jaladhi Yoga', result: 'The native owns a beautiful mansion, uses excellent vehicles, is rich in cattle and grains, and is highly respected and happy.' },
        { house: 5, name: 'Chhatra Yoga', result: 'The native is blessed with a happy family, children, and wealth; possesses a sharp intellect and is revered by leaders.' },
        { house: 6, name: 'Astra Yoga', result: 'The native is capable of conquering powerful foes and rules over others, though may be somewhat arrogant.' },
        { house: 7, name: 'Kama Yoga', result: 'The native surpasses their father in good qualities, is highly prosperous, and strictly devoted to their own spouse.' },
        { house: 8, name: 'Asura Yoga', result: 'A Dusthana strengthening — the native may become self-serving, a talebearer, and prone to sinful cravings despite material gain.' },
        { house: 9, name: 'Bhagya Yoga', result: 'The native observes a righteous code of conduct, pleases the Gods, travels in comfort, and brings glory to their family.' },
        { house: 10, name: 'Khyati Yoga', result: 'The native becomes a respected leader who protects others through righteous conduct, enjoying fame, wealth, and a prosperous family.' },
        { house: 11, name: 'Parijata Yoga', result: 'The native constantly celebrates auspicious occasions, becomes wealthy, highly learned, and fond of music and stories.' },
        { house: 12, name: 'Musala Yoga', result: 'A Dusthana strengthening — wealth is accumulated only with great difficulty and remains unstable, though spent only for legitimate purposes.' }
    ];

    BHAVA_YOGAS.forEach(def => {
        const isDusthanaHouse = isDusthana(def.house);
        NEW_YOGAS.push({
            name: def.name,
            category: 'Bhava Strength Yoga',
            quality: isDusthanaHouse ? 'Special' : 'Positive',
            planets: [],
            keywords: [`house ${def.house} strength`],
            methodOfCalculation: `Formed when the ${def.house}${['th', 'st', 'nd', 'rd'][def.house % 10 > 3 || [11, 12, 13].includes(def.house % 100) ? 0 : def.house % 10] || 'th'} house is occupied or aspected by benefic planet(s), AND the Lord of that house is free from combustion, positioned in an auspicious house (not the 6th, 8th, or 12th), and placed in its own sign or sign of exaltation.`,
            cause: `A house fortified both by benefic occupation/aspect and by its own well-placed, dignified lord manifests its full significations powerfully.`,
            description: `One of the 12 classical Bhava-strength combinations: formed when House ${def.house} is strongly fortified by benefic influence and a well-placed, dignified house lord.`,
            result: def.result,
            nullification: 'Weakened if the house lord is combust, debilitated, or itself posited in a Dusthana (6th/8th/12th house).',
            referenceShloka: '(From the 12 Bhava-strength Yoga section of classical Phaladeepika-style texts.)',
            strength: isDusthanaHouse ? 'Moderate' : 'Strong',
            remedies: ['Strengthen the lord of this house through its planetary mantra, donation, and fasting day'],
            mantras: [],
            deities: [],
            evaluate: function (c) {
                if (!c.planets || !c.asc) return { result: false };
                const ascSn = c.asc.sn || 0;
                const lord = lordOfHouse(ascSn, def.house);
                const lordPos = c.planets[lord];
                if (!lordPos) return { result: false };
                const lordStrong = isStrong(lordPos) && !isDusthana(lordPos.house) && !lordPos.combust;
                const occupants = anyBeneficIn(c, def.house);
                const aspecting = anyBeneficAspecting(c, def.house);
                const fortified = occupants.length > 0 || aspecting.length > 0;
                const isDetected = lordStrong && fortified;
                return {
                    result: isDetected,
                    rationale: isDetected
                        ? `It forms because House ${def.house}'s lord ${lord} is dignified (${lordPos.status}, H${lordPos.house}) and outside the Dusthanas, while the house itself is fortified by benefic ${occupants.length ? 'occupation (' + occupants.join(', ') + ')' : 'aspect (' + aspecting.join(', ') + ')'}.`
                        : `House ${def.house}'s lord (${lord}) is not sufficiently dignified/well-placed, or the house lacks benefic support.`
                };
            }
        });
    });

    // ---------- 16–18. Harsha / Sarala / Vimala (Vipareeta Raja Yoga subtypes) ----------
    const VIPAREETA_SUBTYPES = [
        { house: 6, name: 'Harsha Yoga', result: 'The native is blessed with happiness, a strong constitution, and conquers their enemies.' },
        { house: 8, name: 'Sarala Yoga', result: 'The native becomes long-lived, fearless, prosperous, and successful in all ventures.' },
        { house: 12, name: 'Vimala Yoga', result: 'The native is frugal in expenses, independent, follows a respectable profession, and saves money well.' }
    ];
    VIPAREETA_SUBTYPES.forEach(def => {
        NEW_YOGAS.push({
            name: def.name,
            category: 'Vipareeta Raja Yoga',
            quality: 'Special',
            planets: [],
            keywords: ['reversal of evil', 'dusthana cancellation'],
            methodOfCalculation: `Formed specifically when the lord of the 6th, 8th, or 12th house (a Dusthana lord) is itself placed in the ${def.house}th house (also a Dusthana).`,
            cause: 'A Dusthana lord confined to another Dusthana cannot easily damage auspicious houses; by classical logic (Mantreswara\'s Phaladeepika), this self-contained affliction reverses into a protective, beneficial outcome — though Parasara-school texts dispute how fully beneficial this reversal actually is.',
            description: `A specific Vipareeta (Reversal) Raja Yoga: any of the 6th/8th/12th lords placed exactly in the ${def.house}th house.`,
            result: def.result,
            nullification: 'If this Dusthana-lord-in-Dusthana planet is simultaneously conjunct or aspected by a benefic, classical opinion is divided — some texts say it dilutes the yoga, others say benefic support only adds further protection.',
            referenceShloka: '(Vipareeta Raja Yoga section, Phaladeepika Ch. VI.)',
            strength: 'Moderate',
            remedies: ['No specific ritual remedy needed — this yoga is self-correcting by classical design; general strengthening of the Lagna lord supports its expression'],
            mantras: [],
            deities: [],
            evaluate: function (c) {
                if (!c.planets || !c.asc) return { result: false };
                const ascSn = c.asc.sn || 0;
                const dusthanaLords = [6, 8, 12].map(h => lordOfHouse(ascSn, h));
                const findings = dusthanaLords.filter(lord => {
                    const pos = c.planets[lord];
                    return pos && pos.house === def.house;
                });
                const isDetected = findings.length > 0;
                return {
                    result: isDetected,
                    rationale: isDetected ? `It forms because a Dusthana lord (${findings.join(', ')}) is placed in the ${def.house}th house — a Dusthana confined within a Dusthana reverses into benefit per classical Vipareeta logic.` : `No 6th/8th/12th lord is placed in the ${def.house}th house.`
                };
            }
        });
    });

    // ---------- 19. Kahala Yoga ----------
    NEW_YOGAS.push({
        name: 'Kahala Yoga',
        category: 'Parivartana Yoga',
        quality: 'Special',
        planets: [],
        keywords: ['fluctuating prosperity', 'effort and reward'],
        methodOfCalculation: 'Formed when the lord of the 3rd house (courage/effort) mutually exchanges signs (Parivartana) with the lord of any auspicious house (1st, 2nd, 4th, 5th, 7th, 9th, 10th, or 11th).',
        cause: 'The 3rd house governs self-effort; when its lord swaps places with an auspicious house lord, the native\'s fortunes become tied directly to their own initiative, producing an alternating pattern of highs and lows.',
        description: 'One of the 66 classical Parivartana (mutual exchange) yogas — specifically an exchange between the 3rd lord and the lord of any auspicious (non-Dusthana) house.',
        result: 'The native experiences fluctuating prosperity: occasionally haughty and commanding, at other times humble and sweet-spoken, with fortunes rising and falling.',
        nullification: 'Reduced if both exchanging lords are otherwise dignified (own/exalted) — the "fluctuation" theme softens into simple versatility rather than instability.',
        referenceShloka: '(From the Parivartana Yoga classification of Phaladeepika: the 8 Kahala Yogas.)',
        strength: 'Moderate',
        remedies: ['Cultivate consistent daily effort/discipline (3rd-house remedy) to steady the fluctuations', 'Strengthen the 3rd lord through its planetary mantra'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord3 = lordOfHouse(ascSn, 3);
            const auspiciousHouses = [1, 2, 4, 5, 7, 9, 10, 11];
            const findings = [];
            auspiciousHouses.forEach(h => {
                const lordH = lordOfHouse(ascSn, h);
                if (lordH === lord3) return;
                const p3 = c.planets[lord3], pH = c.planets[lordH];
                if (!p3 || !pH) return;
                if (signLord(p3.sign) === lordH && signLord(pH.sign) === lord3) {
                    findings.push(`${lord3} (3rd Lord, in ${p3.sign} H${p3.house}) ⇄ ${lordH} (${h}th Lord, in ${pH.sign} H${pH.house})`);
                }
            });
            const isDetected = findings.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the 3rd Lord exchanges signs with an auspicious house lord: ${findings.join('; ')}.` : 'The 3rd Lord does not exchange signs with any auspicious house lord.'
            };
        }
    });

    // ---------- 20. Dainya Yoga ----------
    NEW_YOGAS.push({
        name: 'Dainya Yoga',
        category: 'Parivartana Yoga',
        quality: 'Negative',
        planets: [],
        keywords: ['misery', 'obstacles', 'unsteady mind'],
        methodOfCalculation: 'Formed when the lord of a Dusthana house (6th, 8th, or 12th) mutually exchanges signs (Parivartana) with the lord of any other house.',
        cause: 'Binding an auspicious house\'s significations directly to a Dusthana lord\'s nature drags that house\'s promise down into difficulty, debt, or loss.',
        description: 'One of the 66 classical Parivartana yogas — an exchange between any 6th/8th/12th lord and the lord of any other house.',
        result: 'The native behaves foolishly at times, commits mistakes, is continuously tormented by enemies or obstacles, speaks harshly, and suffers from an unsteady mind.',
        nullification: 'Softened if both exchanging lords are strongly dignified (own/exalted sign) despite the exchange, or if the Dusthana lord is a natural benefic.',
        referenceShloka: '(From the Parivartana Yoga classification of Phaladeepika: the 30 Dainya Yogas.)',
        strength: 'Moderate',
        remedies: ['Propitiate the specific Dusthana lord involved with its planetary remedy (donation, mantra, fasting)', 'Perform regular charitable acts to offset the house\'s difficult significations'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const dusthanaHouses = [6, 8, 12];
            const findings = [];
            for (let h = 1; h <= 12; h++) {
                if (dusthanaHouses.includes(h)) continue;
                dusthanaHouses.forEach(dh => {
                    const lordDh = lordOfHouse(ascSn, dh);
                    const lordH = lordOfHouse(ascSn, h);
                    if (lordDh === lordH) return;
                    const pDh = c.planets[lordDh], pH = c.planets[lordH];
                    if (!pDh || !pH) return;
                    if (signLord(pDh.sign) === lordH && signLord(pH.sign) === lordDh) {
                        findings.push(`${lordDh} (${dh}th Lord, H${pDh.house}) ⇄ ${lordH} (${h}th Lord, H${pH.house})`);
                    }
                });
            }
            const uniqueFindings = [...new Set(findings)];
            const isDetected = uniqueFindings.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because a Dusthana lord exchanges signs with another house lord: ${uniqueFindings.join('; ')}.` : 'No 6th/8th/12th lord exchanges signs with another house lord.'
            };
        }
    });

    // ---------- 21. Srikantha Yoga ----------
    NEW_YOGAS.push({
        name: 'Srikantha Yoga',
        category: 'Divine/Devotional Yoga',
        quality: 'Positive',
        planets: ['Sun', 'Moon'],
        keywords: ['devotion', 'Shiva worship', 'liberality'],
        methodOfCalculation: 'Formed when the Lagna Lord, the Sun, and the Moon are all in exalted, own, or friendly signs, and are placed in Kendras (1,4,7,10) or Trikonas (1,5,9).',
        cause: 'A simultaneous strong alignment of the self (Lagna lord), soul (Sun), and mind (Moon) in dignified, powerfully placed positions produces a deeply devotional, radiant character.',
        description: 'Formed when the Ascendant Lord, Sun, and Moon are all dignified (exalted/own/friendly) and placed in Kendra or Trikona houses.',
        result: 'The native is deeply devoted to Lord Shiva, wears holy ashes or Rudraksha, and is very liberal in giving.',
        nullification: 'Weakened if any of the three (Lagna lord, Sun, Moon) is combust, debilitated, or placed in a Dusthana.',
        referenceShloka: '(Divine/Devotional Yoga section, classical Jataka texts.)',
        strength: 'Strong',
        remedies: ['Worship Lord Shiva, especially on Mondays and during Pradosh', 'Wear Rudraksha and apply Vibhuti (holy ash)'],
        mantras: ['Om Namah Shivaya'],
        deities: ['Shiva'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lagnaLord = signLord(YOGA_SIGNS()[ascSn]);
            const trio = [lagnaLord, 'Sun', 'Moon'];
            const strongOnes = trio.filter(p => {
                const pos = c.planets[p];
                return pos && isKendraTrikona(pos.house) && (isStrong(pos) || pos.status === 'Frnd');
            });
            const isDetected = strongOnes.length === 3;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the Lagna Lord (${lagnaLord}), Sun, and Moon are all dignified and placed in Kendra/Trikona houses (${trio.map(p => `${p} H${c.planets[p].house}`).join(', ')}).` : 'Lagna Lord, Sun, and Moon are not all simultaneously dignified in Kendra/Trikona houses.'
            };
        }
    });

    // ---------- 22. Srinatha Yoga ----------
    NEW_YOGAS.push({
        name: 'Srinatha Yoga',
        category: 'Divine/Devotional Yoga',
        quality: 'Positive',
        planets: ['Venus', 'Mercury'],
        keywords: ['attractiveness', 'devotion to Vishnu', 'eloquence'],
        methodOfCalculation: 'Formed when Venus, Mercury, and the 9th lord are all dignified (exalted/own/friendly) and placed in Kendras or Trikonas.',
        cause: 'The significators of charm (Venus), intellect (Mercury), and fortune/dharma (9th lord) combining in strength produces an attractive, articulate, devotional character.',
        description: 'Formed when Venus, Mercury, and the 9th house lord are all strongly placed in Kendra/Trikona houses.',
        result: 'The native is highly attractive, soft-spoken, bears the marks of Lord Vishnu, and is devoted to reciting religious songs.',
        nullification: 'Weakened if any of the three planets is combust, debilitated, or in a Dusthana.',
        referenceShloka: '(Divine/Devotional Yoga section, classical Jataka texts.)',
        strength: 'Strong',
        remedies: ['Worship Lord Vishnu, especially on Thursdays and Ekadashi', 'Recite Vishnu Sahasranama'],
        mantras: ['Om Namo Narayanaya'],
        deities: ['Vishnu'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord9 = lordOfHouse(ascSn, 9);
            const trio = ['Venus', 'Mercury', lord9];
            const strongOnes = trio.filter(p => {
                const pos = c.planets[p];
                return pos && isKendraTrikona(pos.house) && (isStrong(pos) || pos.status === 'Frnd');
            });
            const isDetected = strongOnes.length === 3;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because Venus, Mercury, and the 9th Lord (${lord9}) are all dignified and placed in Kendra/Trikona houses.` : 'Venus, Mercury, and the 9th Lord are not all simultaneously dignified in Kendra/Trikona houses.'
            };
        }
    });

    // ---------- 23. Virinchi Yoga ----------
    NEW_YOGAS.push({
        name: 'Virinchi Yoga',
        category: 'Divine/Devotional Yoga',
        quality: 'Positive',
        planets: ['Jupiter', 'Saturn'],
        keywords: ['spiritual mastery', 'Brahma devotion', 'disciples'],
        methodOfCalculation: 'Formed when Jupiter, Saturn, and the 5th house lord are all dignified (exalted/own/friendly) and placed in Kendras or Trikonas.',
        cause: 'The combination of wisdom (Jupiter), discipline (Saturn), and intelligence/dharma (5th lord) in strength produces rare spiritual mastery.',
        description: 'Formed when Jupiter, Saturn, and the 5th house lord are all strongly placed in Kendra/Trikona houses.',
        result: 'The native is devoted to Lord Brahma and Vedanta philosophy, is highly spiritual, and will have many distinguished disciples.',
        nullification: 'Weakened if any of the three planets is combust, debilitated, or in a Dusthana.',
        referenceShloka: '(Divine/Devotional Yoga section, classical Jataka texts.)',
        strength: 'Strong',
        remedies: ['Study of Vedanta and scriptural texts', 'Serve a genuine spiritual teacher (Guru)'],
        mantras: ['Om Brahmane Namah'],
        deities: ['Brahma'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord5 = lordOfHouse(ascSn, 5);
            const trio = ['Jupiter', 'Saturn', lord5];
            const strongOnes = trio.filter(p => {
                const pos = c.planets[p];
                return pos && isKendraTrikona(pos.house) && (isStrong(pos) || pos.status === 'Frnd');
            });
            const isDetected = strongOnes.length === 3;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because Jupiter, Saturn, and the 5th Lord (${lord5}) are all dignified and placed in Kendra/Trikona houses.` : 'Jupiter, Saturn, and the 5th Lord are not all simultaneously dignified in Kendra/Trikona houses.'
            };
        }
    });

    // ---------- 24. Sankhya Yoga ----------
    NEW_YOGAS.push({
        name: 'Sankhya Yoga',
        category: 'Numerical Placement Yoga',
        quality: 'Special',
        planets: [],
        keywords: ['sign distribution', 'numerical destiny'],
        methodOfCalculation: 'Count how many distinct zodiac signs are occupied by the seven classical planets (Sun through Saturn). The resulting count (1 through 7) determines the specific sub-yoga: 7 signs = Vallaki/Veena, 6 = Dharma, 5 = Hasha, 4 = Kendra, 3 = Shula, 2 = Yuga, 1 = Gola.',
        cause: 'How concentrated or spread the seven planets are across the zodiac reflects how focused vs. scattered the native\'s life energies and interests will be.',
        description: 'A family of 7 yogas classified purely by how many distinct signs the seven classical planets occupy.',
        result: '7 signs (Vallaki/Veena): wealthy, fond of dancing/music. 6 (Dharma): generous, kingly. 5 (Hasha): enjoys life, good conduct. 4 (Kendra): acquires wealth and land. 3 (Shula): poor, wrathful. 2 (Yuga): heretical, without wealth. 1 (Gola): short-lived, indolent, sinful.',
        nullification: 'Not classically nullified — this is a descriptive/temperamental yoga rather than a fortune-bearing one; its effects blend with the rest of the chart.',
        referenceShloka: '(Sankhya Yoga classification, classical Jataka texts.)',
        strength: 'Moderate',
        remedies: ['If 1–3 signs occupied (Gola/Yuga/Shula), deliberately diversify activities/interests as a behavioral remedy to counter excessive concentration'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const seven = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
            const signsOccupied = new Set();
            seven.forEach(p => { if (c.planets[p] && c.planets[p].sn !== undefined) signsOccupied.add(c.planets[p].sn); });
            const count = signsOccupied.size;
            const names = { 7: 'Vallaki/Veena Yoga', 6: 'Dharma Yoga', 5: 'Hasha Yoga', 4: 'Kendra Yoga', 3: 'Shula Yoga', 2: 'Yuga Yoga', 1: 'Gola Yoga' };
            const subName = names[count] || 'Unclassified';
            return {
                result: count >= 1 && count <= 7,
                rationale: `The seven classical planets occupy ${count} distinct sign(s), forming the specific sub-combination: ${subName}.`
            };
        }
    });

    // ---------- 25. Amala Yoga (proper — any benefic in 10th from Lagna) ----------
    NEW_YOGAS.push({
        name: 'Amala Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: [],
        keywords: ['spotless reputation', 'government favor', 'lasting fame'],
        methodOfCalculation: 'Formed when any benefic planet (Jupiter, Venus, Mercury, or a waxing Moon) is placed exactly in the 10th house counted from the Ascendant.',
        cause: 'A pure, unafflicted benefic occupying the house of public action and karma keeps the native\'s reputation and conduct spotless ("Amala" = "without blemish").',
        description: 'Formed when a benefic planet occupies the 10th house from the Lagna.',
        result: 'The native is highly revered by their sovereign or government, gentle, affable, possesses lands and wealth, and remains famous and wise throughout life.',
        nullification: 'Weakened if the benefic in the 10th house is combust, debilitated, or heavily aspected by malefics.',
        referenceShloka: 'लाभे वा दशमे शुद्धे शुभखेटे व्यवस्थिते। अमलाख्यो भवेद्योगो कीर्तिमान् राजपूजितः॥',
        strength: 'Strong',
        remedies: ['Maintain the purity/dignity of profession and public conduct — this yoga rewards a spotless public image', 'Strengthen the benefic planet involved with its mantra'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const found = BENEFICS().filter(b => c.planets[b] && c.planets[b].house === 10 && !c.planets[b].combust);
            const isDetected = found.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${found.join(', ')} occup${found.length > 1 ? 'y' : 'ies'} the 10th house (${found.map(p => c.planets[p].sign).join(', ')}) without being combust.` : 'No unafflicted benefic occupies the 10th house from the Lagna.'
            };
        }
    });

    // ---------- 26. Gouri Yoga ----------
    NEW_YOGAS.push({
        name: 'Gouri Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: ['Moon', 'Jupiter'],
        keywords: ['beauty', 'prosperity', 'illustrious family'],
        methodOfCalculation: 'Formed if the Moon occupies its own sign (Cancer) or exaltation sign (Taurus) identical with a Trikona (1,5,9) or Kendra (1,4,7,10) house, and is simultaneously aspected by Jupiter.',
        cause: 'The Moon strongly dignified in a powerful house, further blessed by Jupiter\'s benevolent aspect, produces beauty, grace, and prosperity.',
        description: 'Formed when a dignified Moon (own or exalted) in a Kendra/Trikona house receives Jupiter\'s aspect.',
        result: 'The native will be exceptionally beautiful, praised by kings, belong to an illustrious family, and enjoy a prosperous lineage.',
        nullification: 'Weakened if the Moon is simultaneously afflicted by a malefic conjunction that outweighs Jupiter\'s benefic aspect.',
        referenceShloka: '(Gouri Yoga, classical Lakshmi/Gouri Yoga section of Jataka texts.)',
        strength: 'Strong',
        remedies: ['Worship Goddess Gouri/Parvati, especially on Mondays', 'Strengthen the Moon through white donations'],
        mantras: ['Om Gauryai Namah'],
        deities: ['Gouri', 'Parvati'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Moon || !c.planets.Jupiter) return { result: false };
            const moon = c.planets.Moon, jupiter = c.planets.Jupiter;
            const moonDignified = moon.status === 'Own' || moon.status === 'Exalt.';
            const moonInGoodHouse = isKendraTrikona(moon.house);
            const jupAspects = hasAspect('Jupiter', jupiter.house, moon.house);
            const isDetected = moonDignified && moonInGoodHouse && jupAspects;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the Moon is dignified (${moon.status}) in a Kendra/Trikona house (H${moon.house}) and receives Jupiter's aspect from H${jupiter.house}.` : 'The Moon is not simultaneously dignified, well-housed, and Jupiter-aspected.'
            };
        }
    });

    // ---------- 27. Pushkala Yoga ----------
    NEW_YOGAS.push({
        name: 'Pushkala Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: [],
        keywords: ['high status', 'wealth', 'renown'],
        methodOfCalculation: 'Formed when the lord of the Moon\'s sign (Rashi lord) and the lord of the Ascendant are together in an auspicious house (Kendra/Trikona), aspected by a benefic planet.',
        cause: 'The mind\'s dispositor and the self\'s dispositor uniting in a strong house, blessed by a benefic\'s aspect, produces high status and renown.',
        description: 'Formed when the Moon-sign lord and the Lagna lord are conjoined in a Kendra/Trikona house and aspected by a benefic.',
        result: 'The native will be highly revered by kings/authorities, achieve high status, become a lord of many men, be renowned, immensely wealthy, and wear expensive clothes and ornaments.',
        nullification: 'Weakened if the conjoined lords are afflicted by malefic conjunction outweighing the benefic aspect.',
        referenceShloka: '(Pushkala Yoga, classical Jataka texts.)',
        strength: 'Strong',
        remedies: ['Strengthen both the Lagna lord and Moon-sign lord through their respective remedies'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets || !c.asc || !c.planets.Moon) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lagnaLord = signLord(YOGA_SIGNS()[ascSn]);
            const moonSignLord = signLord(c.planets.Moon.sign);
            if (lagnaLord === moonSignLord) return { result: false };
            const pLagna = c.planets[lagnaLord], pMoonLord = c.planets[moonSignLord];
            if (!pLagna || !pMoonLord) return { result: false };
            const conjoined = pLagna.house === pMoonLord.house && isKendraTrikona(pLagna.house);
            if (!conjoined) return { result: false };
            const beneficAspecting = anyBeneficAspecting(c, pLagna.house).filter(p => p !== lagnaLord && p !== moonSignLord);
            const isDetected = beneficAspecting.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the Lagna Lord (${lagnaLord}) and Moon-sign Lord (${moonSignLord}) are conjoined in H${pLagna.house} (a Kendra/Trikona), aspected by ${beneficAspecting.join(', ')}.` : 'The Lagna Lord and Moon-sign Lord are not conjoined in a benefic-aspected Kendra/Trikona house.'
            };
        }
    });

    // ---------- 28. Yogakaraka Yoga (generalized) ----------
    NEW_YOGAS.push({
        name: 'Yogakaraka Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: [],
        keywords: ['raja yoga', 'combined lordship power'],
        methodOfCalculation: 'Formed when the lord of a Kendra house (1st, 4th, 7th, or 10th) is conjoined (in the same house/sign) with the lord of a Trikona house (5th or 9th).',
        cause: 'A planet ruling both angular strength (Kendra) and trinal grace (Trikona) — or two such planets combining — produces one of the most powerful Raja Yoga effects in the chart, since Kendra provides power and Trikona provides fortune.',
        description: 'A generalized Raja Yoga formed whenever a Kendra-lord and a Trikona-lord (excluding the 1st lord counted twice) are conjoined in the same house.',
        result: 'Even if these planets independently rule difficult houses, their connection makes them highly auspicious "Yogakarakas." During their combined Dasas and Antardasas, the native becomes highly prosperous, successful, and affluent.',
        nullification: 'Reduced if the conjoined planets are combust or severely afflicted by malefic aspect despite the conjunction.',
        referenceShloka: '(Yogakaraka classification, classical Jataka texts.)',
        strength: 'Strong',
        remedies: ['Time major undertakings to the joint Dasa/Antardasa periods of the two Yogakaraka planets for best results'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const kendraLords = [1, 4, 7, 10].map(h => lordOfHouse(ascSn, h));
            const trikonaLords = [5, 9].map(h => lordOfHouse(ascSn, h));
            const findings = [];
            kendraLords.forEach(kl => {
                trikonaLords.forEach(tl => {
                    if (kl === tl) return;
                    const pk = c.planets[kl], pt = c.planets[tl];
                    if (pk && pt && pk.house === pt.house) {
                        findings.push(`${kl} (Kendra Lord) + ${tl} (Trikona Lord) conjoined in H${pk.house} (${pk.sign})`);
                    }
                });
            });
            const uniqueFindings = [...new Set(findings)];
            const isDetected = uniqueFindings.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${uniqueFindings.join('; ')}.` : 'No Kendra lord is conjoined with a Trikona lord.'
            };
        }
    });

    // ---------- 29. Subhamala Yoga ----------
    NEW_YOGAS.push({
        name: 'Subhamala Yoga',
        category: 'Chain Yoga',
        quality: 'Positive',
        planets: [],
        keywords: ['governance', 'liberal spending', 'courage'],
        methodOfCalculation: 'Formed if benefic planets, taken together, occupy the 5th, 6th, and 7th houses in an unbroken chain (at least one distinct benefic in each of the three consecutive houses).',
        cause: 'A continuous chain of benefic occupation across three consecutive houses (creativity, service, partnership) grants smooth, uninterrupted good fortune across those life domains.',
        description: 'Formed when benefic planets occupy the 5th, 6th, and 7th houses in an unbroken chain.',
        result: 'The native becomes a governor or director, is extolled by leaders, devoted to enjoyment, liberal in gifts, and blessed with a good spouse, children, and courage.',
        nullification: 'Broken if any of the three houses (5th, 6th, or 7th) lacks a benefic occupant, which converts the chain into a partial or absent yoga.',
        referenceShloka: '(Subhamala/Asubhamala Yoga, classical Jataka texts.)',
        strength: 'Strong',
        remedies: ['Continue supporting the benefics involved via their planetary remedies to sustain the unbroken chain\'s promise'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const h5 = anyBeneficIn(c, 5), h6 = anyBeneficIn(c, 6), h7 = anyBeneficIn(c, 7);
            const isDetected = h5.length > 0 && h6.length > 0 && h7.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because benefics occupy an unbroken chain across H5 (${h5.join(',')}), H6 (${h6.join(',')}), and H7 (${h7.join(',')}).` : 'Benefics do not occupy all three of houses 5, 6, and 7.'
            };
        }
    });

    // ---------- 30. Asubhamala Yoga ----------
    NEW_YOGAS.push({
        name: 'Asubhamala Yoga',
        category: 'Chain Yoga',
        quality: 'Negative',
        planets: [],
        keywords: ['unhappiness', 'quarrelsome nature'],
        methodOfCalculation: 'Formed if malefic planets, taken together, occupy the 6th, 8th, and 12th houses in an unbroken chain (at least one distinct malefic in each of the three houses).',
        cause: 'A continuous chain of malefic occupation across the three most difficult houses (disease, sudden loss, and expenditure/isolation) compounds hardship across those domains without relief.',
        description: 'Formed when malefic planets occupy the 6th, 8th, and 12th houses in an unbroken chain.',
        result: 'The native becomes unhappy, ungrateful, timid, and fond of promoting quarrels; may resort to bad ways and cause harm to others.',
        nullification: 'Broken if any of the three houses lacks a malefic occupant, or if a strong benefic aspects all three houses.',
        referenceShloka: '(Subhamala/Asubhamala Yoga, classical Jataka texts.)',
        strength: 'Moderate',
        remedies: ['Propitiate each malefic involved through its specific planetary remedy (donation, mantra, fasting day)', 'Regular charitable service to offset the compounded hardship'],
        mantras: [],
        deities: [],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const malefics = MALEFICS();
            const h6 = malefics.filter(m => c.planets[m] && c.planets[m].house === 6);
            const h8 = malefics.filter(m => c.planets[m] && c.planets[m].house === 8);
            const h12 = malefics.filter(m => c.planets[m] && c.planets[m].house === 12);
            const isDetected = h6.length > 0 && h8.length > 0 && h12.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because malefics occupy an unbroken chain across H6 (${h6.join(',')}), H8 (${h8.join(',')}), and H12 (${h12.join(',')}).` : 'Malefics do not occupy all three of houses 6, 8, and 12.'
            };
        }
    });
    // ---------- 31. Tharai Yoga (Sudden Life-Event Yoga) ----------
    NEW_YOGAS.push({
        name: 'Tharai Yoga',
        category: 'Special/Rare',
        quality: 'Mixed',
        planets: ['Moon', 'Venus'],
        keywords: ['sudden event', 'lightning-like turn', 'destiny shift', 'unexpected fortune or misfortune'],
        methodOfCalculation: 'Formed when the Moon and Venus are conjunct in the same house, or stand mutually in the 4th/10th-house relationship from one another (i.e. Venus falls in the 4th house counted from the Moon, or the Moon falls in the 4th house counted from Venus). The yoga is stronger and more impactful when this Moon-Venus combination itself occupies a Kendra house (1st, 4th, 7th, or 10th) from the Lagna, since both Moon and Venus are said to gain Digbala (directional strength) in the 4th house.',
        cause: 'Moon (mind, public perception) and Venus (comfort, relationships, worldly attainment) meeting in a mutual angular relationship concentrates their combined significations into one sudden, life-altering turn rather than a gradual unfolding — hence compared to a bolt of lightning ("Tharai" = sudden thunder-like strike).',
        description: 'A yoga adapted from a classical Tamil astrological text: the Moon and Venus conjunct, or placed 4th from each other, produce one (occasionally more than one) sudden and pivotal event in the native\'s life that permanently changes its direction. Whether that event is fortunate or unfortunate hinges on the strength of the Lagna and Lagna lord — not on the Moon-Venus combination itself.',
        result: 'If the Lagna and Lagna lord are strong and unafflicted, the sudden event is auspicious — an unexpected windfall, a rise to fame or high office, a stroke of unlooked-for luck. If the Lagna or Lagna lord is weak or afflicted, the sudden event is instead a hardship or misfortune — a forced departure, a sudden loss, a difficult, unplanned turn of life. If the combination itself carries an additional 6th/8th/12th-house involvement, the resulting event tends to be somewhat less extreme in either direction, though it still arrives unexpectedly.',
        nullification: 'No formal cancellation is described; rather than being nullified outright, the yoga\'s outcome polarity (favorable vs. unfavorable) is read entirely from the independent strength of the Lagna and Lagna lord, and its intensity is moderated when a 6th/8th/12th-house connection is also present.',
        referenceShloka: '(No single standardized Sanskrit shloka is cited for this yoga in mainstream Jataka texts; per the source material this yoga is a translated rule from a classical Tamil astrological text, compiled into the teacher\'s own 108-rule "Saral Panchang/Saral Five" reference system rather than drawn from Brihat Parashara Hora Shastra or Phaladeepika.)',
        strength: 'Moderate to Strong (scales with Lagna strength)',
        remedies: ['Strengthen the Lagna lord through its specific planetary remedy (mantra, gemstone, donation) so that the inevitable sudden turn resolves favorably', 'Worship Chandra (Moon) on Mondays and Shukra (Venus) on Fridays to soften any harsh manifestation', 'Keep savings and contingency plans in place going into Dasha periods of the Moon, Venus, or the Lagna lord, since the event tends to land during those periods'],
        mantras: ['Om Som Somaya Namah', 'Om Shukraya Namah'],
        deities: ['Chandra', 'Shukra'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Moon || !c.planets.Venus || !c.asc) return { result: false };
            const moon = c.planets.Moon, venus = c.planets.Venus;
            const moonHouse = moon.house, venusHouse = venus.house;
            if (!moonHouse || !venusHouse) return { result: false };

            const conjunct = moonHouse === venusHouse;
            const venusIs4thFromMoon = houseCount(moonHouse, venusHouse) === 4;
            const moonIs4thFromVenus = houseCount(venusHouse, moonHouse) === 4;
            const isDetected = conjunct || venusIs4thFromMoon || moonIs4thFromVenus;
            if (!isDetected) {
                return { result: false, rationale: 'Moon and Venus are neither conjunct nor mutually 4th/10th from each other.' };
            }

            const inKendra = isKendra(moonHouse) || isKendra(venusHouse);

            const ascSn = c.asc.sn || 0;
            const lagnaLordName = lordOfHouse(ascSn, 1);
            const lagnaLordPos = c.planets[lagnaLordName];
            const lagnaLordStrong = !!lagnaLordPos && (isStrong(lagnaLordPos) || isKendraTrikona(lagnaLordPos.house));
            const maleficsInLagna = MALEFICS().filter(m => c.planets[m] && c.planets[m].house === 1);
            const lagnaAfflicted = maleficsInLagna.length > 0;
            const favorable = lagnaLordStrong && !lagnaAfflicted;

            const relDesc = conjunct
                ? `conjunct in H${moonHouse} (${moon.sign || ''})`
                : (venusIs4thFromMoon
                    ? `Venus (H${venusHouse}) is 4th from the Moon (H${moonHouse})`
                    : `Moon (H${moonHouse}) is 4th from Venus (H${venusHouse})`);

            return {
                result: true,
                rationale: `It forms because Moon and Venus are ${relDesc}${inKendra ? ', which strengthens it by also falling in a Kendra house from the Lagna' : ''}. The Lagna lord (${lagnaLordName}) is ${lagnaLordStrong ? 'reasonably strong' : 'not particularly strong'}${lagnaAfflicted ? ' and the Lagna itself carries a malefic influence' : ''}, so the single defining sudden event this yoga brings is more likely to be ${favorable ? 'auspicious and fortune-bringing' : 'testing or adverse'} in nature.`
            };
        }
    });

    // ---------- 32. Kangaal Yoga (Wealth-to-Poverty Yoga) ----------
    NEW_YOGAS.push({
        name: 'Kangaal Yoga',
        category: 'Special/Rare',
        quality: 'Mixed',
        planets: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
        keywords: ['destitution', 'late-life poverty', 'wealth that does not last', 'no accumulation'],
        methodOfCalculation: 'Formed when at least three of the four natural benefic planets (Jupiter, Venus, Mercury, Moon) are conjunct together in a single Kendra house (1st, 4th, 7th, or 10th) from the Lagna, while at the same time at least one natural malefic (Mars, Saturn, Rahu, or Ketu) occupies either the 2nd house (accumulated wealth/family resources) or the 11th house (gains/income) from the Lagna. The combination is considered "pure" and gives its fullest, most literal result when the Sun does not also join the benefic trio in that Kendra house; if the Sun joins them, the result is only partial.',
        cause: 'Three benefics conjunct in a Kendra is, on its own, a strong wealth-producing (Dhana Yoga-adjacent) configuration that brings prosperity through most of life — but a natural malefic sitting in the 2nd or 11th house simultaneously afflicts the very houses that govern savings and steady income, so whatever is earned fails to be retained or passed on, surfacing as poverty specifically in the final phase of life rather than throughout it.',
        description: 'A native-teacher-compiled yoga (part of the same 108-rule "Saral Five" reference system as Tharai Yoga): the native earns considerable wealth, status, or success for most of their life through a strong benefic conjunction in a Kendra house, but a malefic afflicting the 2nd or 11th house prevents that wealth from being conserved, so the native ends up in financial hardship — "Kangaal" (destitute) — in the last phase of life, having lost or given away everything previously earned.',
        result: 'The native experiences real and often substantial prosperity for most of their working life — sometimes even a genuine Raja Yoga or Dhana Yoga alongside this combination — but by the final stage of life has little or nothing left in their own name; wealth may have been transferred to children or spouse, lost in failed ventures, or simply never accumulated despite high earnings. When the Sun also sits with the benefic trio, the loss tends to be partial (some accumulation/savings habit survives) rather than a complete wipeout.',
        nullification: 'Weakened or made partial if the Sun joins the benefic conjunction (impurifying it), or if the malefic occupying the 2nd/11th house itself receives a strong benefic aspect; strengthened (i.e. more completely and literally destitute) when the configuration is otherwise clean of any such mitigating influence.',
        referenceShloka: '(Not drawn from a single standardized Sanskrit shloka in classical Jataka texts; per the source material this is a teacher-compiled rule from the "Saral Panchang/Saral Five" system of 108 predictive combinations, illustrated through case-chart analysis rather than cited to a specific classical verse.)',
        strength: 'Moderate to Strong (fuller effect when unmixed with the Sun)',
        remedies: ['Proactively transfer or formally settle major assets onto a spouse or children during the prosperous years, before the late-life dasha periods associated with the 2nd/11th-house malefic arrive', 'Propitiate the malefic occupying the 2nd or 11th house through its specific planetary remedy to soften the loss of accumulated wealth', 'Maintain a disciplined, separate savings or trust structure that is not easily depleted, since natural spending/loss patterns intensify in later life under this yoga'],
        mantras: ['Om Shreem Mahalakshmiyai Namaha', 'Om Gurave Namah'],
        deities: ['Lakshmi', 'Brihaspati'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
            const kendraHouses = [1, 4, 7, 10];
            let formingHouse = null;
            let beneficsInHouse = [];

            for (let i = 0; i < kendraHouses.length; i++) {
                const h = kendraHouses[i];
                const present = benefics.filter(b => c.planets[b] && c.planets[b].house === h);
                if (present.length >= 3) {
                    formingHouse = h;
                    beneficsInHouse = present;
                    break;
                }
            }
            if (!formingHouse) {
                return { result: false, rationale: 'No Kendra house has at least three natural benefics conjunct together.' };
            }

            const maleficsIn2or11 = MALEFICS().filter(m => c.planets[m] && (c.planets[m].house === 2 || c.planets[m].house === 11));
            if (maleficsIn2or11.length === 0) {
                return { result: false, rationale: `Three benefics (${beneficsInHouse.join(', ')}) are conjunct in H${formingHouse}, but no natural malefic occupies the 2nd or 11th house, so this does not form Kangaal Yoga.` };
            }

            const sunJoins = !!(c.planets.Sun && c.planets.Sun.house === formingHouse);
            const pure = !sunJoins;

            return {
                result: true,
                rationale: `It forms because three natural benefics (${beneficsInHouse.join(', ')}) are conjunct in the Kendra house H${formingHouse}${sunJoins ? ' (joined there by the Sun, which impurifies the combination)' : ''}, while a natural malefic (${maleficsIn2or11.join(', ')}) occupies the wealth-accumulation house (2nd or 11th). This is the classic Kangaal Yoga signature: substantial wealth is earned through most of life, but ${pure ? 'in this pure form it tends to dissipate almost entirely by life\'s final phase' : 'the Sun\'s involvement means the loss is likely to be partial rather than total'}.`
            };
        }
    });

    // ---------- 31. Chandradhi Yoga (Adhi Yoga from the Moon) ----------
    NEW_YOGAS.push({
        name: 'Chandradhi Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: ['Mercury', 'Jupiter', 'Venus'],
        keywords: ['authority', 'command', 'prosperity', 'longevity', 'victory over enemies'],
        methodOfCalculation: 'Check the houses 6th, 7th, and 8th counted from the Moon (not the Lagna — see "Adhi Yoga" in this data set for the Lagna-based Lagnadhi Yoga variant). If natural benefics (Mercury, Jupiter, Venus) occupy at least two of these three houses, Chandradhi Yoga forms; if all three houses are occupied, it is at full strength.',
        cause: 'Benefics flanking the Moon (mind, emotional foundation) from the 6th/7th/8th give steady support and confidence to the native\'s inner life, which in classical astrology translates into the capacity to hold positions of command.',
        description: 'The Moon-based form of Adhi Yoga (classically the primary/original form; the Lagna-based version is separately called Lagnadhi Yoga). Formed when Mercury, Jupiter, and/or Venus occupy the 6th, 7th, and 8th houses counted from the Moon.',
        result: 'The native becomes a commander, minister, or ruler by the strength of the planets involved — commanding authority, prosperity, freedom from enemies, good health, and a long, substantive life.',
        nullification: 'Reduced if the Moon itself is weak or afflicted (combust, debilitated, or hemmed by malefics) even though benefics flank it; strongest when all three benefics participate and are individually well-dignified.',
        referenceShloka: 'Brihat Jataka XIII.2 and Brihat Parashara Hora Shastra Ch. 38 both describe this combination under Adhi/Chandradhi Yoga — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Strong',
        remedies: ['Strengthen the benefics involved through their mantras and donations', 'Worship Vishnu or Guru (Jupiter) for sustained support', 'Keep the Moon strong through Somvar (Monday) practices'],
        mantras: ['Om Chandraya Namah', 'Om Gurave Namah', 'Om Namo Bhagavate Vasudevaya'],
        deities: ['Chandra', 'Vishnu', 'Brihaspati'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Moon) return { result: false };
            const moon = c.planets.Moon;
            const moonHouse = moon.house;
            if (!moonHouse) return { result: false };
            const relHouse = (offset) => (((moonHouse - 1 + offset - 1) % 12) + 1);
            const h6 = relHouse(6), h7 = relHouse(7), h8 = relHouse(8);
            const benefics = BENEFICS().filter(b => b !== 'Moon');
            const inH6 = benefics.filter(b => c.planets[b] && c.planets[b].house === h6);
            const inH7 = benefics.filter(b => c.planets[b] && c.planets[b].house === h7);
            const inH8 = benefics.filter(b => c.planets[b] && c.planets[b].house === h8);
            const occupied = [inH6.length > 0, inH7.length > 0, inH8.length > 0].filter(Boolean).length;
            const isDetected = occupied >= 2;
            const detail = [
                inH6.length ? `H${h6} (6th from Moon): ${inH6.join(', ')}` : '',
                inH7.length ? `H${h7} (7th from Moon): ${inH7.join(', ')}` : '',
                inH8.length ? `H${h8} (8th from Moon): ${inH8.join(', ')}` : ''
            ].filter(Boolean).join('; ');
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because benefic planets occupy ${occupied} of the 6th/7th/8th houses from the Moon (${detail}), fortifying the native's standing.` : 'Benefics do not sufficiently occupy the 6th/7th/8th houses from the Moon.'
            };
        }
    });

    // ---------- 32. Vasumathi Yoga ----------
    NEW_YOGAS.push({
        name: 'Vasumathi Yoga',
        category: 'Property',
        quality: 'Positive',
        planets: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
        keywords: ['wealth', 'independence', 'prosperity', 'gains'],
        methodOfCalculation: 'Check the Upachaya houses — 3rd, 6th, 10th, and 11th — counted from the Lagna. If natural benefics (Jupiter, Venus, Mercury, and/or a waxing Moon) occupy at least three of these four houses, Vasumathi Yoga forms.',
        cause: 'Upachaya houses are the "houses of growth" that improve with time and effort; benefics seated there means sustained, self-earned material growth rather than one-off luck.',
        description: 'Formed when the majority of the natural benefics occupy the Upachaya houses (3rd, 6th, 10th, 11th) from the Lagna (some classical sources also allow counting from the Moon).',
        result: 'The native will not be dependent on others and will always command plenty of wealth, gained substantially through personal effort and courage.',
        nullification: 'Weaker if the benefics involved are debilitated, combust, or afflicted by malefic conjunction/aspect; strongest when a benefic occupies its exaltation sign within an Upachaya house. A "pure" Vasumathi Yoga with all benefics in Upachaya houses is rare.',
        referenceShloka: 'Described under Upachayasthana combinations in classical Jyotish compilations (e.g. Phaladeepika-tradition wealth yogas) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the benefics occupying the Upachaya houses', 'Charitable giving tied to Jupiter/Venus significations', 'Cultivate self-driven effort rather than relying on inheritance'],
        mantras: ['Om Shreem Mahalakshmiyai Namaha', 'Om Gurave Namah'],
        deities: ['Lakshmi', 'Brihaspati'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const upachayaHouses = [3, 6, 10, 11];
            const benefics = BENEFICS();
            const occupiedHouses = upachayaHouses.filter(h => benefics.some(b => c.planets[b] && c.planets[b].house === h));
            const isDetected = occupiedHouses.length >= 3;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because benefic planets occupy ${occupiedHouses.length} of the four Upachaya houses (H${occupiedHouses.join(', H')}) from the Lagna, giving self-earned, sustained wealth.` : 'Benefics do not occupy enough of the Upachaya houses (3rd/6th/10th/11th) from the Lagna.'
            };
        }
    });

    // ---------- 33. Sakata Yoga ----------
    NEW_YOGAS.push({
        name: 'Sakata Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Moon', 'Jupiter'],
        keywords: ['fluctuating fortune', 'instability', 'poverty', 'struggle'],
        methodOfCalculation: 'Counting Jupiter\'s house as the 1st house, check whether the Moon falls in the 6th, 8th, or 12th house from that position. If so, Sakata Yoga forms.',
        cause: 'Jupiter (fortune, wisdom) and the Moon (mind, day-to-day fortune) in a dusthana relationship to each other means the native\'s sense of fortune and Jupiter\'s protective, expansive influence are out of step — producing an up-and-down "cart wheel" (Sakata) pattern of fortune.',
        description: 'One of the classical fortune-fluctuation yogas: the Moon positioned in the 6th, 8th, or 12th house counted from Jupiter.',
        result: 'The native loses fortune and may regain it; tends to be ordinary and insignificant, suffering from poverty, privation, and misery; can be stubborn and disliked by relatives.',
        nullification: 'Classically cancelled (Sakata-Bhanga) if the Moon is in a Kendra (1st/4th/7th/10th) from the Lagna, if Jupiter is itself in a Kendra from the Lagna, or if both Moon and Jupiter are strong (own/exaltation) — in which case the milder "Mukuta Yoga" variant is sometimes read instead, bringing authority rather than hardship. This implementation reports only the raw 6th/8th/12th condition; cancellation factors are not separately checked.',
        referenceShloka: 'A widely cited combination across Jyotish compilations (attributed in various sources to Mansagari and to Dr. B.V. Raman\'s formulation) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen Jupiter through Thursday practices and yellow sapphire (after consultation)', 'Strengthen the Moon through pearls and Monday practices', 'Chant Guru and Chandra mantras'],
        mantras: ['Om Gurave Namah', 'Om Chandraya Namah'],
        deities: ['Brihaspati', 'Chandra'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Moon || !c.planets.Jupiter) return { result: false };
            const jupHouse = c.planets.Jupiter.house, moonHouse = c.planets.Moon.house;
            if (!jupHouse || !moonHouse) return { result: false };
            const moonFromJup = houseCount(jupHouse, moonHouse);
            const isDetected = [6, 8, 12].includes(moonFromJup);
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the Moon falls in the ${moonFromJup}th house counted from Jupiter, an inauspicious dusthana relationship that produces fluctuating fortune.` : 'The Moon does not fall in the 6th, 8th, or 12th house counted from Jupiter.'
            };
        }
    });

    // ---------- 34. Vesi Yoga ----------
    NEW_YOGAS.push({
        name: 'Vesi Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['Sun'],
        keywords: ['fortune', 'virtue', 'reputation'],
        methodOfCalculation: 'Check the 2nd house counted from the Sun. If any planet other than the Moon, Rahu, or Ketu occupies that house, Vesi Yoga forms.',
        cause: 'A planet immediately following the Sun lends the solar identity (ego, authority, vitality) forward-moving support and visibility, strengthening the native\'s public standing.',
        description: 'Formed when a planet (other than Moon, Rahu, Ketu) occupies the 2nd house from the Sun. Its counterpart, Vasi (Vosi) Yoga, uses the 12th house instead; when both occur together it is Ubhayachari Yoga.',
        result: 'The native is fortunate and virtuous, leading a happy, famous, and aristocratic life — the precise flavor depends on which planet forms the yoga.',
        nullification: 'Weakened if the qualifying planet is combust, debilitated, or heavily afflicted by malefic aspect/conjunction.',
        referenceShloka: 'Discussed in Brihat Parashara Hora Shastra and Saravali under the Veshi/Vashi/Ubhayachari family of Sun-based yogas — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the Sun through Sunday practices', 'Strengthen the specific planet occupying the 2nd from Sun'],
        mantras: ['Om Suryaya Namah'],
        deities: ['Surya'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Sun) return { result: false };
            const sunHouse = c.planets.Sun.house;
            if (!sunHouse) return { result: false };
            const h2 = (((sunHouse - 1 + 1) % 12) + 1);
            const qualifying = Object.keys(c.planets).filter(p => !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(p) && c.planets[p].house === h2);
            const isDetected = qualifying.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${qualifying.join(', ')} occupies the 2nd house from the Sun (H${h2}), lending the Sun forward support.` : 'No qualifying planet occupies the 2nd house from the Sun.'
            };
        }
    });

    // ---------- 35. Ubhayachari Yoga (Obhayachari) ----------
    NEW_YOGAS.push({
        name: 'Ubhayachari Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['Sun'],
        keywords: ['eloquence', 'popularity', 'wealth', 'fame'],
        methodOfCalculation: 'Check the 2nd and 12th houses counted from the Sun. If planets other than the Moon, Rahu, or Ketu occupy BOTH houses simultaneously (Vesi Yoga in the 2nd and Vasi Yoga in the 12th together), Ubhayachari Yoga forms.',
        cause: 'The Sun (soul, identity) is supported on both flanks — from what accumulates toward it (2nd) and what it releases outward (12th) — giving the most complete and balanced form of solar support among the three related yogas.',
        description: 'Considered the strongest of the three solar-adjacent yogas (Vesi, Vasi, Ubhayachari), formed when qualifying planets occupy both the 2nd and 12th houses from the Sun at once.',
        result: 'The native is an eloquent speaker with well-proportioned limbs, takes delight in everything, and is liked by all — wealthy and famous.',
        nullification: 'Weakened if the qualifying planets are combust, debilitated, or heavily afflicted; strongest when both sides carry naturally benefic planets.',
        referenceShloka: 'Described in Brihat Parashara Hora Shastra and Saravali (Kalyana Varma) as the most powerful of the Veshi/Vashi/Ubhayachari family — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Strong',
        remedies: ['Strengthen the Sun through Sunday practices and ruby (after consultation)', 'Support with charity aligned to the planets on both sides'],
        mantras: ['Om Suryaya Namah', 'Om Hraam Hreem Hraum Sah Suryaya Namah'],
        deities: ['Surya'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Sun) return { result: false };
            const sunHouse = c.planets.Sun.house;
            if (!sunHouse) return { result: false };
            const h2 = (((sunHouse - 1 + 1) % 12) + 1);
            const h12 = (((sunHouse - 1 + 11) % 12) + 1);
            const exclude = ['Sun', 'Moon', 'Rahu', 'Ketu'];
            const in2 = Object.keys(c.planets).filter(p => !exclude.includes(p) && c.planets[p].house === h2);
            const in12 = Object.keys(c.planets).filter(p => !exclude.includes(p) && c.planets[p].house === h12);
            const isDetected = in2.length > 0 && in12.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${in2.join(', ')} occupies the 2nd house and ${in12.join(', ')} occupies the 12th house from the Sun, supporting it from both sides.` : 'Planets do not occupy both the 2nd and 12th houses from the Sun simultaneously.'
            };
        }
    });

    // ---------- 36. Brahma Yoga ----------
    NEW_YOGAS.push({
        name: 'Brahma Yoga',
        category: 'Raja Yoga',
        quality: 'Positive',
        planets: ['Jupiter', 'Venus', 'Mercury'],
        keywords: ['wisdom', 'respect', 'charity', 'longevity', 'luxury'],
        methodOfCalculation: 'Three conditions checked together: (1) Jupiter occupies a Kendra (1st/4th/7th/10th) counted from the 9th lord; (2) Venus occupies a Kendra counted from the 11th lord; (3) Mercury occupies a Kendra counted from the Lagna lord or the 10th lord. All three must hold for the full yoga.',
        cause: 'Each of the three benefics is placed angularly from the lord of a highly favorable house (fortune, gains, self/career) — a rare triple reinforcement classical texts associate with the creative, sustaining quality of Brahma.',
        description: 'A rare and powerful combination requiring Jupiter, Venus, and Mercury to each be angularly placed from specific significant house lords (9th, 11th, and Lagna/10th respectively).',
        result: 'The native enjoys luxurious foods and is respected by Brahmins and learned persons; highly learned, long-lived, charitable, and always inclined toward good deeds.',
        nullification: 'Weakened by affliction (combustion, debilitation, malefic conjunction/aspect) to Jupiter, Venus, Mercury, or the 9th/11th lords involved; for some Lagnas the exact condition cannot be geometrically fulfilled, in which case a partial fulfillment still gives reduced results.',
        referenceShloka: 'A named combination discussed in general Jyotish yoga compilations (associated with the Brahma-Vishnu-Shiva group of yogas) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Strong',
        remedies: ['Strengthen Jupiter, Venus, and Mercury through their respective mantras and donations', 'Support education and charitable causes', 'Respect teachers and elders'],
        mantras: ['Om Gurave Namah', 'Om Shukraya Namah', 'Om Budhaya Namaha'],
        deities: ['Brahma', 'Brihaspati', 'Shukra', 'Budha'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord9 = lordOfHouse(ascSn, 9), lord11 = lordOfHouse(ascSn, 11), lordAsc = lordOfHouse(ascSn, 1), lord10 = lordOfHouse(ascSn, 10);
            const p9 = c.planets[lord9], p11 = c.planets[lord11], pAsc = c.planets[lordAsc], p10 = c.planets[lord10];
            const jup = c.planets.Jupiter, ven = c.planets.Venus, merc = c.planets.Mercury;
            if (!jup || !ven || !merc || !p9 || !p11) return { result: false };
            const jupOk = p9.house && jup.house && isKendra(houseCount(p9.house, jup.house));
            const venOk = p11.house && ven.house && isKendra(houseCount(p11.house, ven.house));
            const mercOk = merc.house && ((pAsc && pAsc.house && isKendra(houseCount(pAsc.house, merc.house))) || (p10 && p10.house && isKendra(houseCount(p10.house, merc.house))));
            const isDetected = !!(jupOk && venOk && mercOk);
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because Jupiter is in a Kendra from the 9th lord (${lord9}), Venus is in a Kendra from the 11th lord (${lord11}), and Mercury is in a Kendra from the Lagna or 10th lord.` : 'Jupiter, Venus, and Mercury are not all simultaneously angular from the 9th lord, 11th lord, and Lagna/10th lord respectively.'
            };
        }
    });

    // ---------- 37. Dehakashta Yoga ----------
    NEW_YOGAS.push({
        name: 'Dehakashta Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Lagna lord'],
        keywords: ['bodily hardship', 'lack of comfort', 'affliction'],
        methodOfCalculation: 'Check the Lagna lord\'s placement. If it occupies a Dusthana (6th, 8th, or 12th house) from the Lagna and is also conjunct or aspected by a natural malefic, Dehakashta Yoga forms.',
        cause: 'The Lagna lord governs the physical body and general well-being; placed in a house of loss/disease/hidden trouble and further pressured by malefic influence, the body is denied the ease and comfort it would otherwise enjoy.',
        description: 'A body-hardship (deha = body, kashta = suffering) combination: the Lagna lord afflicted in a Dusthana house.',
        result: 'The native is devoid of bodily comforts.',
        nullification: 'Eased if the Lagna lord is otherwise strong (own/exalted sign) despite the house placement, or if a benefic also aspects/conjoins it, offsetting the malefic pressure.',
        referenceShloka: 'A body-affliction combination discussed among the classical "Deha" yogas in general Jyotish yoga compilations — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the Lagna lord through its mantra and gemstone (after consultation)', 'General health-supportive practices (yoga, Ayurveda)', 'Maha Mrityunjaya mantra for overall vitality'],
        mantras: ['Maha Mrityunjaya Mantra'],
        deities: ['Shiva'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lagnaLordName = lordOfHouse(ascSn, 1);
            const lagnaLord = c.planets[lagnaLordName];
            if (!lagnaLord || !lagnaLord.house) return { result: false };
            const inDusthana = isDusthana(lagnaLord.house);
            const conjunctMalefic = MALEFICS().some(m => m !== lagnaLordName && c.planets[m] && c.planets[m].house === lagnaLord.house);
            const aspectedByMalefic = MALEFICS().some(m => m !== lagnaLordName && c.planets[m] && c.planets[m].house && hasAspect(m, c.planets[m].house, lagnaLord.house));
            const isDetected = inDusthana && (conjunctMalefic || aspectedByMalefic);
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the Lagna lord (${lagnaLordName}) occupies a Dusthana house (H${lagnaLord.house}) and is ${conjunctMalefic ? 'conjunct' : 'aspected by'} a natural malefic.` : 'The Lagna lord is not both in a Dusthana house and afflicted by a malefic.'
            };
        }
    });

    // ---------- 38. Sarpaganda Yoga ----------
    NEW_YOGAS.push({
        name: 'Sarpaganda Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Rahu'],
        keywords: ['snakebite', 'sudden danger', 'Rahu affliction'],
        methodOfCalculation: 'Classically defined as Rahu joining the 2nd house together with Mandi (Gulika) — an upagraha (shadow sub-point) computed from the weekday and time of birth, not a standard planet. Because Mandi/Gulika is not part of every chart object this engine evaluates, this implementation checks a defensive approximation: Rahu occupying the 2nd house from the Lagna, optionally strengthened if Mandi/Gulika data (c.planets.Mandi or c.planets.Gulika) is present and also falls there.',
        cause: 'Classically, Rahu (fear, poison, sudden affliction) combined with Mandi (a point associated with misfortune and hidden danger) in the 2nd house (face, family, immediate surroundings) was read as a specific marker for snakebite-type sudden danger.',
        description: 'Definition: Rahu should join the 2nd house with Mandi (Gulika).',
        result: 'The person will be bitten by a snake (classically read broadly as vulnerability to sudden, poison-like danger).',
        nullification: 'Reduced or absent if Rahu is otherwise well-placed, aspected by benefics, or if Mandi/Gulika does not in fact join it in the 2nd house.',
        referenceShloka: 'Recorded among the classical combinations collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Weak',
        remedies: ['Rahu-pacifying practices (worship of Durga/Bhairava, donations on Saturdays)', 'General caution around snakes/sharp or poisonous hazards is a traditional, non-astrological precaution some practitioners also suggest alongside remedies'],
        mantras: ['Om Rahave Namah'],
        deities: ['Rahu', 'Nagas (serpent deities)'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Rahu) return { result: false };
            const rahuHouse = c.planets.Rahu.house;
            if (rahuHouse !== 2) return { result: false };
            const mandi = c.planets.Mandi || c.planets.Gulika;
            const mandiJoins = !!(mandi && mandi.house === 2);
            return {
                result: true,
                rationale: mandiJoins ? 'It forms because Rahu occupies the 2nd house together with Mandi/Gulika, the full classical Sarpaganda condition.' : 'Rahu occupies the 2nd house from the Lagna (an approximation of the classical rule, since Mandi/Gulika data was not available to confirm the full condition).'
            };
        }
    });

    // ---------- 39. Uttam Griha Yoga ----------
    NEW_YOGAS.push({
        name: 'Uttam Griha Yoga',
        category: 'Property',
        quality: 'Positive',
        planets: ['4th lord'],
        keywords: ['property', 'houses', 'home', 'success'],
        methodOfCalculation: 'Check the 4th lord\'s placement. If it occupies a Kendra (1st/4th/7th/10th) or Trikona (1st/5th/9th) house and is conjunct at least one natural benefic there, Uttam Griha Yoga forms.',
        cause: 'The 4th house governs home and property; its lord placed in a strong angular/trinal house and supported by benefic company brings good residences and the comfort/success associated with them.',
        description: 'Formed when the 4th lord is in a Kendra or Trikona house together with benefic planets.',
        result: 'The native will possess good houses; the home brings success and happiness.',
        nullification: 'Weakened if the 4th lord is instead afflicted by malefic conjunction/aspect, or debilitated.',
        referenceShloka: 'Recorded among the classical property combinations collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the 4th lord through its mantra and donations', 'Vastu-conscious home practices', 'Worship of Bhoomi Devi (Mother Earth) for property matters'],
        mantras: ['Om Bhoomi Devyai Namah'],
        deities: ['Bhoomi Devi'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord4Name = lordOfHouse(ascSn, 4);
            const lord4 = c.planets[lord4Name];
            if (!lord4 || !lord4.house) return { result: false };
            const inKendraTrikona = isKendraTrikona(lord4.house);
            const beneficWithIt = BENEFICS().filter(b => b !== lord4Name && c.planets[b] && c.planets[b].house === lord4.house);
            const isDetected = inKendraTrikona && beneficWithIt.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the 4th lord (${lord4Name}) occupies a Kendra/Trikona house (H${lord4.house}) together with benefic(s) ${beneficWithIt.join(', ')}.` : 'The 4th lord is not both in a Kendra/Trikona house and conjunct a benefic.'
            };
        }
    });

    // ---------- 40. Kapata Yoga ----------
    NEW_YOGAS.push({
        name: 'Kapata Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['4th lord'],
        keywords: ['hypocrisy', 'secrecy', 'concealment'],
        methodOfCalculation: 'Check the 4th house and its lord. If the 4th house itself is occupied by a natural malefic, AND the 4th lord is conjunct or aspected by a natural malefic, Kapata Yoga forms.',
        cause: 'The 4th house governs the inner mind/heart; malefic pressure both within the house and on its lord classically indicates a mind that conceals its true feelings behind a guarded exterior.',
        description: 'One of several classical Kapata (deceit/hypocrisy) combinations: a malefic in the 4th house together with the 4th lord being afflicted by malefics.',
        result: 'The native becomes a hypocrite, concealing their own feelings and seldom revealing their true mind.',
        nullification: 'Absent or weakened if the 4th house/lord instead receives benefic support, or if the malefic involved is itself well-dignified (own/exalted) rather than purely afflicting.',
        referenceShloka: 'Recorded among the Kapata Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the 4th lord and pacify the malefic involved through its mantra', 'Journaling or trusted counsel to build habits of open communication'],
        mantras: ['Om Namah Shivaya'],
        deities: ['Shiva'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord4Name = lordOfHouse(ascSn, 4);
            const lord4 = c.planets[lord4Name];
            const maleficIn4 = MALEFICS().filter(m => c.planets[m] && c.planets[m].house === 4);
            if (!lord4 || !lord4.house || maleficIn4.length === 0) return { result: false };
            const maleficWithLord = MALEFICS().some(m => m !== lord4Name && c.planets[m] && c.planets[m].house === lord4.house);
            const maleficAspectingLord = MALEFICS().some(m => m !== lord4Name && c.planets[m] && c.planets[m].house && hasAspect(m, c.planets[m].house, lord4.house));
            const isDetected = maleficIn4.length > 0 && (maleficWithLord || maleficAspectingLord);
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because a natural malefic (${maleficIn4.join(', ')}) occupies the 4th house while the 4th lord (${lord4Name}) is also afflicted by malefic conjunction/aspect.` : 'The 4th house and its lord are not both under malefic pressure.'
            };
        }
    });

    // ---------- 41. Nishkapata Yoga ----------
    NEW_YOGAS.push({
        name: 'Nishkapata Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['4th lord'],
        keywords: ['sincerity', 'purity of heart', 'openness'],
        methodOfCalculation: 'Check the 4th house. If it is occupied by a natural benefic, or the 4th house sign itself is a benefic\'s own/friendly/exaltation sign, Nishkapata Yoga forms.',
        cause: 'A benefic-supported 4th house (inner mind/heart) reflects an open, untroubled inner life with nothing to hide.',
        description: 'The counterpart to Kapata Yoga: the 4th house occupied by, or in the sign of, a natural benefic.',
        result: 'The native is pure-hearted and hates secrecy and hypocrisy.',
        nullification: 'Reduced if the benefic involved is itself weak, combust, or afflicted by a simultaneous malefic influence.',
        referenceShloka: 'Recorded among the Nishkapata Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the benefic occupying the 4th house', 'Practices that cultivate emotional openness (journaling, satsang, honest communication)'],
        mantras: ['Om Shreem Mahalakshmiyai Namaha'],
        deities: ['Lakshmi'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const beneficIn4 = BENEFICS().filter(b => c.planets[b] && c.planets[b].house === 4);
            const isDetected = beneficIn4.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because a natural benefic (${beneficIn4.join(', ')}) occupies the 4th house, keeping the inner mind open and untroubled.` : 'No natural benefic occupies the 4th house.'
            };
        }
    });

    // ---------- 42. Matru Satrutwa Yoga ----------
    NEW_YOGAS.push({
        name: 'Matru Satrutwa Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Moon'],
        keywords: ['mother', 'estrangement', 'family tension'],
        methodOfCalculation: 'Check the Moon (mother significator) and the 4th house (house of the mother). If the Moon or the 4th house/lord is conjunct or aspected by a natural malefic, Matru Satrutwa Yoga forms.',
        cause: 'Malefic pressure on the mother significator (Moon) or the 4th house (mother\'s house) classically indicates friction or estrangement in the relationship with the mother.',
        description: 'A mother-relationship combination (satrutwa = enmity/estrangement): malefic affliction to the Moon or the 4th house/lord.',
        result: 'Some cordial feelings may nonetheless exist in the native\'s mind on account of the mother, even where the underlying combination points toward tension.',
        nullification: 'Eased considerably if the Moon and 4th lord are otherwise strong and also receive benefic support.',
        referenceShloka: 'Recorded among the maternal-relationship combinations collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Weak',
        remedies: ['Strengthen the Moon through Monday practices and pearl (after consultation)', 'Conscious relationship-repair efforts with the mother', 'Chant Chandra and Durga mantras'],
        mantras: ['Om Chandraya Namah', 'Om Dum Durgayai Namah'],
        deities: ['Chandra', 'Durga'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Moon) return { result: false };
            const moonHouse = c.planets.Moon.house;
            const moonAfflicted = MALEFICS().some(m => c.planets[m] && ((c.planets[m].house === moonHouse) || (c.planets[m].house && hasAspect(m, c.planets[m].house, moonHouse))));
            const house4Afflicted = MALEFICS().some(m => c.planets[m] && ((c.planets[m].house === 4) || (c.planets[m].house && hasAspect(m, c.planets[m].house, 4))));
            const isDetected = moonAfflicted || house4Afflicted;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${moonAfflicted ? 'the Moon' : 'the 4th house'} receives malefic conjunction/aspect, indicating some tension in the relationship with the mother.` : 'Neither the Moon nor the 4th house is afflicted by a natural malefic.'
            };
        }
    });

    // ---------- 43. Vahana Yoga ----------
    NEW_YOGAS.push({
        name: 'Vahana Yoga',
        category: 'Property',
        quality: 'Positive',
        planets: ['4th lord', 'Venus'],
        keywords: ['vehicles', 'conveyances', 'material comforts'],
        methodOfCalculation: 'Check the 4th house (house of vehicles/conveyances) and Venus (karaka for comforts/luxury). If a natural benefic occupies the 4th house, or the 4th lord is conjunct Venus, Vahana Yoga forms.',
        cause: 'The 4th house governs vehicles and comfort; benefic occupation or a link to Venus (luxury, comfort) brings the material means to acquire them.',
        description: 'Formed when the 4th house/lord is supported by a natural benefic or specifically by Venus.',
        result: 'The native acquires material comforts, happiness, and conveyances; in later life, a good motor car.',
        nullification: 'Weakened if the 4th house/lord is instead afflicted by malefics without benefic support.',
        referenceShloka: 'Recorded among the Vahana Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen Venus and the 4th lord through their mantras', 'Friday practices honoring Venus/Lakshmi'],
        mantras: ['Om Shukraya Namah'],
        deities: ['Shukra', 'Lakshmi'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord4Name = lordOfHouse(ascSn, 4);
            const lord4 = c.planets[lord4Name];
            const beneficIn4 = BENEFICS().filter(b => c.planets[b] && c.planets[b].house === 4);
            const lord4WithVenus = !!(lord4 && lord4.house && c.planets.Venus && c.planets.Venus.house === lord4.house && lord4Name !== 'Venus');
            const isDetected = beneficIn4.length > 0 || lord4WithVenus;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${beneficIn4.length ? `a benefic (${beneficIn4.join(', ')}) occupies the 4th house` : `the 4th lord (${lord4Name}) is conjunct Venus`}, bringing material comforts and conveyances.` : 'The 4th house/lord shows no benefic or Venus support.'
            };
        }
    });

    // ---------- 44. Ekaputra Yoga ----------
    NEW_YOGAS.push({
        name: 'Ekaputra Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['Jupiter', '5th lord'],
        keywords: ['children', 'son', 'progeny'],
        methodOfCalculation: 'Check the 5th house (house of children) and Jupiter (putra-karaka, significator of children). If Jupiter occupies the 5th house, or aspects it, without any malefic conjunction/aspect on the 5th house or its lord, Ekaputra Yoga forms.',
        cause: 'Jupiter\'s unafflicted connection to the 5th house — the house of children — classically assures at least one child (specifically read as at least one son in the traditional formulation), though modern readings extend this to children generally.',
        description: 'A children-related combination: Jupiter connected to an otherwise unafflicted 5th house.',
        result: 'The native may have at least one son (read in modern practice as at least one child).',
        nullification: 'Negated if the 5th house or its lord is instead heavily afflicted by malefics despite Jupiter\'s connection.',
        referenceShloka: 'Recorded among the Putra (children) Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen Jupiter and the 5th lord through their mantras', 'Santan Gopal mantra for progeny matters', 'Thursday practices honoring Jupiter'],
        mantras: ['Om Gurave Namah', 'Om Devaki Sut Govind Vasudev Jagatpate Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah'],
        deities: ['Brihaspati', 'Krishna'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Jupiter) return { result: false };
            const jupHouse = c.planets.Jupiter.house;
            if (!jupHouse) return { result: false };
            const jupConnected = jupHouse === 5 || hasAspect('Jupiter', jupHouse, 5);
            const house5Afflicted = MALEFICS().some(m => c.planets[m] && ((c.planets[m].house === 5) || (c.planets[m].house && hasAspect(m, c.planets[m].house, 5))));
            const isDetected = jupConnected && !house5Afflicted;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because Jupiter ${jupHouse === 5 ? 'occupies' : 'aspects'} the 5th house of children without malefic affliction there.` : 'Jupiter is not favorably connected to an unafflicted 5th house.'
            };
        }
    });

    // ---------- 45. Buddhimaturya Yoga ----------
    NEW_YOGAS.push({
        name: 'Buddhimaturya Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['Mercury', 'Jupiter'],
        keywords: ['intelligence', 'maturity', 'character'],
        methodOfCalculation: 'Check Mercury\'s dignity and its relationship to Jupiter. If Mercury occupies its own sign or exaltation sign, AND is conjunct or aspected by Jupiter, Buddhimaturya Yoga forms.',
        cause: 'A strong, well-dignified Mercury (intellect) further supported by Jupiter (wisdom, judgment) gives an intelligence that is not merely sharp but also mature and well-grounded.',
        description: 'Formed when a strong Mercury is supported by Jupiter\'s conjunction or aspect.',
        result: 'The native is a person of great intelligence and character.',
        nullification: 'Reduced if Mercury is combust or otherwise afflicted despite its dignity, or if Jupiter\'s support is countered by a stronger simultaneous malefic influence.',
        referenceShloka: 'Recorded among the intelligence (Buddhi) Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen Mercury and Jupiter through their mantras', 'Study and mentorship under a learned guide', 'Wednesday and Thursday practices'],
        mantras: ['Om Budhaya Namaha', 'Om Gurave Namah'],
        deities: ['Budha', 'Brihaspati'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Mercury || !c.planets.Jupiter) return { result: false };
            const merc = c.planets.Mercury, jup = c.planets.Jupiter;
            if (!isStrong(merc) || !merc.house || !jup.house) return { result: false };
            const jupConnected = merc.house === jup.house || hasAspect('Jupiter', jup.house, merc.house);
            const isDetected = jupConnected;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because Mercury is strong (${merc.status}) and is ${merc.house === jup.house ? 'conjunct' : 'aspected by'} Jupiter, giving mature, well-grounded intelligence.` : 'Mercury is not both strong and connected to Jupiter.'
            };
        }
    });

    // ---------- 46. Putra Sukha Yoga ----------
    NEW_YOGAS.push({
        name: 'Putra Sukha Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['5th lord', 'Jupiter'],
        keywords: ['happiness from children', 'family harmony'],
        methodOfCalculation: 'Check the 5th lord\'s placement. If it occupies a Kendra or Trikona house and is conjunct or aspected by a natural benefic (especially Jupiter), Putra Sukha Yoga forms.',
        cause: 'A strong, benefic-supported 5th lord in an angular/trinal house reflects harmony and joy in the relationship with one\'s children.',
        description: 'Formed when the 5th lord is well-placed (Kendra/Trikona) and benefic-supported.',
        result: 'The native gains happiness on account of children; grown-up children show liking, obedience, and respect toward their parents.',
        nullification: 'Reduced if the 5th lord is instead afflicted by malefics despite favorable house placement.',
        referenceShloka: 'Recorded among the Putra (children) Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the 5th lord and Jupiter through their mantras', 'Family time and open communication with children'],
        mantras: ['Om Gurave Namah'],
        deities: ['Brihaspati'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord5Name = lordOfHouse(ascSn, 5);
            const lord5 = c.planets[lord5Name];
            if (!lord5 || !lord5.house) return { result: false };
            const inKendraTrikona = isKendraTrikona(lord5.house);
            const beneficSupport = BENEFICS().filter(b => b !== lord5Name && c.planets[b] && c.planets[b].house && (c.planets[b].house === lord5.house || hasAspect(b, c.planets[b].house, lord5.house)));
            const isDetected = inKendraTrikona && beneficSupport.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the 5th lord (${lord5Name}) occupies a Kendra/Trikona house (H${lord5.house}) with benefic support from ${beneficSupport.join(', ')}.` : 'The 5th lord is not both favorably placed and benefic-supported.'
            };
        }
    });

    // ---------- 47. Bahu Stree Yoga ----------
    NEW_YOGAS.push({
        name: 'Bahu Stree Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['7th house'],
        keywords: ['multiple relationships', 'instability in partnerships'],
        methodOfCalculation: 'Check the 7th house (house of partnerships). If two or more planets occupy the 7th house, Bahu Stree Yoga forms.',
        cause: 'Multiple planets crowding the house of marriage/partnership classically indicates a life with multiple significant relationships rather than a single, stable partnership.',
        description: 'Formed when the 7th house is occupied by two or more planets.',
        result: 'The native has many relations with the opposite sex.',
        nullification: 'Softened if the occupying planets are mutually benefic and well-dignified, in which case the multiplicity may express instead as many close relationships/collaborations rather than romantic instability.',
        referenceShloka: 'Recorded among the Kalatra (spouse/partnership) Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Weak',
        remedies: ['Strengthen Venus and the 7th lord for relationship stability', 'Friday practices honoring Venus'],
        mantras: ['Om Shukraya Namah'],
        deities: ['Shukra'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const occupants = Object.keys(c.planets).filter(p => !['Rahu', 'Ketu'].includes(p) && c.planets[p] && c.planets[p].house === 7);
            const isDetected = occupants.length >= 2;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${occupants.length} planets (${occupants.join(', ')}) occupy the 7th house of partnerships.` : 'Fewer than two planets occupy the 7th house.'
            };
        }
    });

    // ---------- 48. Satkalatra Yoga ----------
    NEW_YOGAS.push({
        name: 'Satkalatra Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['7th lord', 'Venus'],
        keywords: ['noble spouse', 'marital harmony', 'virtue'],
        methodOfCalculation: 'Check the 7th lord\'s dignity. If the 7th lord occupies its own sign or exaltation sign, and is not conjunct a natural malefic, Satkalatra Yoga forms.',
        cause: 'A strong, unafflicted 7th lord (spouse significator) reflects a life partner of genuine quality and stability.',
        description: 'Formed when the 7th lord is strong (own/exaltation) and free from malefic conjunction.',
        result: 'The native\'s life partner will be noble and virtuous — a person of strict moral discipline, god-fearing, and deeply attached to the native.',
        nullification: 'Negated if the 7th lord, despite its dignity, is heavily aspected by malefics or combust.',
        referenceShloka: 'Recorded among the Kalatra (spouse) Yogas collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the 7th lord and Venus through their mantras', 'Friday practices honoring Venus/Lakshmi'],
        mantras: ['Om Shukraya Namah'],
        deities: ['Shukra'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord7Name = lordOfHouse(ascSn, 7);
            const lord7 = c.planets[lord7Name];
            if (!lord7) return { result: false };
            const strong = isStrong(lord7);
            const maleficConjunct = MALEFICS().some(m => m !== lord7Name && c.planets[m] && c.planets[m].house === lord7.house);
            const isDetected = strong && !maleficConjunct;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the 7th lord (${lord7Name}) is strong (${lord7.status}) and free from malefic conjunction.` : 'The 7th lord is not both strong and unafflicted.'
            };
        }
    });

    // ---------- 49. Ardh Kal-Sarpa Yoga ----------
    NEW_YOGAS.push({
        name: 'Ardh Kal-Sarpa Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Rahu', 'Ketu'],
        keywords: ['partial hemming', 'obstacles', 'instability'],
        methodOfCalculation: 'Check the distribution of the seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) relative to the Rahu-Ketu axis. Full Kaal Sarpa Yoga requires all seven to fall on the same side (hemmed between Rahu and Ketu); Ardh (half/partial) Kaal Sarpa Yoga forms when exactly six of the seven fall on one side and exactly one planet falls on the other side, breaking the complete enclosure.',
        cause: 'A near-total, but not complete, hemming-in of the planets by the shadow points Rahu and Ketu produces a milder version of the volatility and obstacle-prone pattern associated with full Kaal Sarpa Yoga.',
        description: 'A partial form of Kaal Sarpa Yoga: six of the seven classical planets are hemmed on one side of the Rahu-Ketu axis, with one planet outside that enclosure.',
        result: 'Generally brings difficulties in life — obstacles, instability, and periods of struggle, though less intense than full Kaal Sarpa Yoga.',
        nullification: 'Its effective strength is considered whenever the one "escaping" planet is itself well-placed and strong, and is further reduced by the presence of strong Raja Yogas elsewhere in the chart; effects are said to be most pronounced during Rahu/Ketu dashas and transits.',
        referenceShloka: 'A widely discussed modern classification (popularized alongside Kaal Sarpa Yoga) rather than a single named verse in the earliest classical texts — no canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Rahu-Ketu pacification (Kaal Sarpa Shanti puja, as per individual tradition)', 'Chant Maha Mrityunjaya Mantra', 'Nag Panchami observances honoring serpent deities'],
        mantras: ['Maha Mrityunjaya Mantra', 'Om Rahave Namah', 'Om Ketave Namah'],
        deities: ['Shiva', 'Rahu', 'Ketu'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Rahu || !c.planets.Ketu) return { result: false };
            const rahuDeg = (c.planets.Rahu.sn * 30) + (parseFloat(c.planets.Rahu.deg) || 0);
            const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
            const present = classical.filter(p => c.planets[p]);
            if (present.length < 6) return { result: false };
            let onRahuSide = 0, onKetuSide = 0;
            present.forEach(p => {
                const deg = (c.planets[p].sn * 30) + (parseFloat(c.planets[p].deg) || 0);
                const diff = ((deg - rahuDeg) % 360 + 360) % 360;
                if (diff < 180) onRahuSide++; else onKetuSide++;
            });
            const isDetected = (onRahuSide === present.length - 1 && onKetuSide === 1) || (onKetuSide === present.length - 1 && onRahuSide === 1);
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${Math.max(onRahuSide, onKetuSide)} of the ${present.length} classical planets are hemmed on one side of the Rahu-Ketu axis, with exactly one planet outside — a partial hemming pattern.` : 'The classical planets are not split into a 6-and-1 pattern across the Rahu-Ketu axis.'
            };
        }
    });


    // ---------- 50. Vasi Yoga ----------
    NEW_YOGAS.push({
        name: 'Vasi Yoga',
        category: 'Auspicious',
        quality: 'Positive',
        planets: ['Sun'],
        keywords: ['prosperity', 'generosity', 'popularity'],
        methodOfCalculation: 'Check the 12th house counted from the Sun. If any planet other than the Moon (and, per most classical formulations, other than Rahu/Ketu) occupies that house, Vasi Yoga forms.',
        cause: 'A planet immediately preceding the Sun (in the 12th, the house of release/withdrawal) lends the solar identity a reflective, generous quality — support that comes from within rather than from external validation.',
        description: 'The counterpart to Vesi Yoga: formed when a planet (other than Moon, Rahu, Ketu) occupies the 12th house from the Sun. When both Vesi and Vasi occur together it is Ubhayachari Yoga.',
        result: 'The native will be happy, remain prosperous and liberal, and will be liked by all people.',
        nullification: 'Weakened if the qualifying planet is combust, debilitated, or heavily afflicted by malefic aspect/conjunction; a malefic forming the yoga gives contrary/mixed results rather than fully negating it.',
        referenceShloka: 'Discussed in Brihat Parashara Hora Shastra and Saravali under the Veshi/Vashi/Ubhayachari family of Sun-based yogas — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Strengthen the Sun through Sunday practices', 'Strengthen the specific planet occupying the 12th from Sun'],
        mantras: ['Om Suryaya Namah'],
        deities: ['Surya'],
        evaluate: function (c) {
            if (!c.planets || !c.planets.Sun) return { result: false };
            const sunHouse = c.planets.Sun.house;
            if (!sunHouse) return { result: false };
            const h12 = (((sunHouse - 1 + 11) % 12) + 1);
            const qualifying = Object.keys(c.planets).filter(p => !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(p) && c.planets[p].house === h12);
            const isDetected = qualifying.length > 0;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because ${qualifying.join(', ')} occupies the 12th house from the Sun (H${h12}), lending it reflective, generous support.` : 'No qualifying planet occupies the 12th house from the Sun.'
            };
        }
    });

    // ---------- 51. Nav Yoga (Nauka Yoga) ----------
    NEW_YOGAS.push({
        name: 'Nav Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
        keywords: ['rise and fall', 'early fame', 'later misery'],
        methodOfCalculation: 'One of the Nabhasa (Akriti) Yogas from "300 Important Combinations": check whether all seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) occupy seven contiguous houses starting from the Lagna (i.e. all fall within houses 1 through 7, with houses 8-12 empty of these seven).',
        cause: 'All seven classical planets crowded into the first half of the chart (Lagna through 7th) — the visible, outward-facing houses — while the closing houses (8-12, endings/losses/foreign matters) are empty, is read as a life that peaks early and has no planetary support to sustain it into later years, like a boat (Nauka) that floats but eventually runs aground.',
        description: 'Formed when all seven classical planets occupy seven contiguous houses starting from the Lagna. Related combinations in the same Nabhasa Yoga family (starting from other houses) are Kuta, Chhatra, and Chapa Yoga.',
        result: 'The native will be occasionally happy and famous in the earlier part of life, but will later suffer from miseries.',
        nullification: 'Its severity is read as reduced if the planets within the 1st-7th span are individually strong and well-dignified, and if the lords of the empty houses (8th-12th) are themselves strong from elsewhere in the chart.',
        referenceShloka: 'Recorded among the Nabhasa (Akriti) Yogas in "300 Important Combinations" (Dr. B.V. Raman), following the classification tradition of Brihat Jataka\'s Nabhasa Yoga chapter — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Build savings and support structures early to cushion later life', 'Strengthen the lords of the 8th-12th houses', 'General long-term financial planning'],
        mantras: ['Om Namah Shivaya'],
        deities: ['Shiva'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
            const houses = classical.map(p => c.planets[p] && c.planets[p].house).filter(h => h);
            if (houses.length < 7) return { result: false };
            const isDetected = houses.every(h => h >= 1 && h <= 7);
            return {
                result: isDetected,
                rationale: isDetected ? 'It forms because all seven classical planets occupy the seven contiguous houses starting from the Lagna (H1-H7), leaving the closing houses of the chart without planetary support.' : 'The seven classical planets are not confined to the contiguous span of houses 1 through 7.'
            };
        }
    });

    // ---------- 52. Kuta Yoga ----------
    NEW_YOGAS.push({
        name: 'Kuta Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
        keywords: ['deceit', 'cunning', 'concealment'],
        methodOfCalculation: 'One of the Nabhasa (Akriti) Yogas: check whether all seven classical planets occupy seven contiguous houses starting from the 4th house (i.e. all fall within houses 4 through 10).',
        cause: 'All seven planets clustered starting from the 4th (a hidden, private house) rather than the visible Lagna is read as a life oriented toward concealment and private dealings rather than open conduct.',
        description: 'Formed when all seven classical planets occupy seven contiguous houses starting from the 4th house. Related combinations in the same family (starting from other houses) are Nav, Chhatra, and Chapa Yoga.',
        result: 'The native becomes a liar and cunning; classically also associated with confinement (jailor/jailed connotations in some traditions).',
        nullification: 'Its severity is reduced if the planets within the 4th-10th span are individually well-dignified and benefic in nature, softening the deceptive tendency into mere shrewdness.',
        referenceShloka: 'Recorded among the Nabhasa (Akriti) Yogas in "300 Important Combinations" (Dr. B.V. Raman), following the classification tradition of Brihat Jataka\'s Nabhasa Yoga chapter — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Medium',
        remedies: ['Cultivate honesty and transparency as a conscious practice', 'Strengthen Jupiter and Mercury for clarity of judgment and speech'],
        mantras: ['Om Gurave Namah', 'Om Budhaya Namaha'],
        deities: ['Brihaspati', 'Budha'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
            const houses = classical.map(p => c.planets[p] && c.planets[p].house).filter(h => h);
            if (houses.length < 7) return { result: false };
            const isDetected = houses.every(h => h >= 4 && h <= 10);
            return {
                result: isDetected,
                rationale: isDetected ? 'It forms because all seven classical planets occupy the seven contiguous houses starting from the 4th house (H4-H10).' : 'The seven classical planets are not confined to the contiguous span of houses 4 through 10.'
            };
        }
    });

    // ---------- 53. Chapa Yoga ----------
    NEW_YOGAS.push({
        name: 'Chapa Yoga',
        category: 'Muhurta - Auspicious Timing',
        quality: 'Positive',
        planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
        keywords: ['administrative power', 'wealth', 'advocacy for the poor'],
        methodOfCalculation: 'One of the Nabhasa (Akriti) Yogas: check whether all seven classical planets occupy seven contiguous houses starting from the 10th house (i.e. all fall within houses 10, 11, 12, 1, 2, 3, 4, wrapping around the chart).',
        cause: 'All seven planets clustered starting from the 10th (career, public standing) gives sustained public-facing capability and control over resources, classically read as the ability to command high office.',
        description: 'Formed when all seven classical planets occupy seven contiguous houses starting from the 10th house. Related combinations in the same family (starting from other houses) are Nav, Kuta, and Chhatra Yoga.',
        result: 'The native becomes brave, and happy in the later stages of life; inclined to help the poor and champion their causes, and becomes famous and well-liked, especially among common people.',
        nullification: 'Strongest when the planets within the 10th-4th span are individually well-dignified; weakened if the majority are debilitated or heavily afflicted.',
        referenceShloka: 'Recorded among the Nabhasa (Akriti) Yogas in "300 Important Combinations" (Dr. B.V. Raman), following the classification tradition of Brihat Jataka\'s Nabhasa Yoga chapter — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Strong',
        remedies: ['Channel the yoga\'s administrative capacity into public service or advocacy work', 'Strengthen the 10th lord for sustained career results'],
        mantras: ['Om Suryaya Namah'],
        deities: ['Surya'],
        evaluate: function (c) {
            if (!c.planets) return { result: false };
            const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
            const houses = classical.map(p => c.planets[p] && c.planets[p].house).filter(h => h);
            if (houses.length < 7) return { result: false };
            const wrappedSpan = [10, 11, 12, 1, 2, 3, 4];
            const isDetected = houses.every(h => wrappedSpan.includes(h));
            return {
                result: isDetected,
                rationale: isDetected ? 'It forms because all seven classical planets occupy the seven contiguous houses starting from the 10th house (H10-H4, wrapping around the chart).' : 'The seven classical planets are not confined to the contiguous span of houses 10 through 4.'
            };
        }
    });

    // ---------- 54. Vrana Yoga ----------
    NEW_YOGAS.push({
        name: 'Vrana Yoga',
        category: 'Muhurta - Inauspicious Timing',
        quality: 'Negative',
        planets: ['6th lord'],
        keywords: ['disease', 'ulcer', 'affliction'],
        methodOfCalculation: 'Check the 6th lord (house of disease). If it is a natural malefic AND occupies the Lagna, 8th house, or 10th house, Vrana Yoga forms.',
        cause: 'The 6th house governs disease and the 6th lord being both malefic by nature and placed in a sensitive house (self, longevity/transformation, or public career) channels its disease-signification directly onto the body or public life.',
        description: 'Definition (per classical sources): the 6th lord, being a malefic, should occupy the Lagna, 8th, or 10th house.',
        result: 'The native may suffer from a dreadful, deep-seated disease (classically associated with cancer/ulcer-type ailments); the specific body part affected is traditionally read from which planet is involved (e.g. Sun: head, Moon: face, Mars: throat/neck, Mercury: lower stomach, Jupiter: nose, Venus: eyes, Saturn: legs, Rahu/Ketu: abdomen).',
        nullification: 'Substantially eased if the malefic 6th lord is also aspected by a natural benefic; classical commentary itself cautions against a literal/severe reading of this yoga and recommends weighing it alongside the chart\'s overall strength.',
        referenceShloka: 'Recorded among the classical disease (Arishta) combinations collected in "300 Important Combinations" (Dr. B.V. Raman) — exact verse numbering varies by edition, so no single canonical shloka is quoted here.',
        strength: 'Weak',
        remedies: ['Strengthen the 6th lord and pacify it through its mantra and donations', 'Maha Mrityunjaya mantra for overall protection', 'Regular medical checkups as a sensible complement to any remedy — this yoga is not a diagnosis'],
        mantras: ['Maha Mrityunjaya Mantra'],
        deities: ['Shiva', 'Dhanvantari'],
        evaluate: function (c) {
            if (!c.planets || !c.asc) return { result: false };
            const ascSn = c.asc.sn || 0;
            const lord6Name = lordOfHouse(ascSn, 6);
            const lord6 = c.planets[lord6Name];
            if (!lord6 || !lord6.house) return { result: false };
            const isMalefic = MALEFICS().includes(lord6Name);
            const inSensitiveHouse = [1, 8, 10].includes(lord6.house);
            const isDetected = isMalefic && inSensitiveHouse;
            return {
                result: isDetected,
                rationale: isDetected ? `It forms because the 6th lord (${lord6Name}), a natural malefic, occupies H${lord6.house} (Lagna/8th/10th).` : 'The 6th lord is not both a natural malefic and placed in the Lagna, 8th, or 10th house.'
            };
        }
    });


// Merge NEW_YOGAS into YOGAS_DATA, skipping any name that already exists
// (kept idempotent/defensive even though there are no known collisions
// with the yogas defined above).
(function mergeMissingYogas() {
    const existingNames = new Set(window.YOGAS_DATA.map(y => y && y.name));
    let addedCount = 0;
    NEW_YOGAS.forEach(yoga => {
        if (!existingNames.has(yoga.name)) {
            window.YOGAS_DATA.push(yoga);
            existingNames.add(yoga.name);
            addedCount++;
        }
    });
    console.log(`yogas_data.js: merged ${addedCount} additional yoga(s) — total now ${window.YOGAS_DATA.length}.`);
})();

/**
 * Calculate all yogas present in a birth chart across all divisional charts
 */
window.getAllYogas = function(allVargas) {
    const found = [];
    if (!window.YOGAS_DATA || !Array.isArray(window.YOGAS_DATA)) return found;

    window.YOGAS_DATA.forEach(y => {
        if (!y || typeof y.evaluate !== 'function') return;
        const vNum = y.varga || 1;
        const chart = allVargas['d' + vNum];
        if (chart) {
            try {
                const res = y.evaluate(chart);
                // Normalize both return conventions used across YOGAS_DATA:
                //  - boolean true/false
                //  - { result: true, rationale } on match
                //  - { result: false } on no match (an object, so it must be
                //    checked via .result rather than truthiness alone)
                const passed = res === true || (res && typeof res === 'object' && res.result === true);
                if (passed) {
                    const rationale = (res && typeof res === 'object' && res.rationale) ? res.rationale : undefined;
                    found.push({...y, activeChart: 'D' + vNum, ...(rationale ? { rationale } : {})});
                }
            } catch (e) {
                console.warn("Error evaluating yoga:", y.name, e);
            }
        }
    });
    return found;
};

/**
 * Get a yoga by name for detail display
 */
window.getYogaByName = function(yogaName) {
    if (!window.YOGAS_DATA) return null;
    return window.YOGAS_DATA.find(y => y && y.name === yogaName) || null;
};

/**
 * Get all yogas of a specific quality
 */
window.getYogasByQuality = function(quality) {
    if (!window.YOGAS_DATA) return [];
    return window.YOGAS_DATA.filter(y => y && y.quality === quality);
};

/**
 * Get yogas by category
 */
window.getYogasByCategory = function(category) {
    if (!window.YOGAS_DATA) return [];
    return window.YOGAS_DATA.filter(y => y && y.category === category);
};

/**
 * Calculate yoga strength based on supporting factors
 */
window.calculateYogaStrength = function(yogaName, chart) {
    const yoga = window.getYogaByName(yogaName);
    if (!yoga) return { strength: 'Unknown', score: 0 };
    
    return { 
        strength: yoga.strength || 'Moderate', 
        score: 50,
        description: yoga.result || 'No additional details'
    };
};

/**
 * Get remedies for a specific yoga
 */
window.getYogaRemedies = function(yogaName) {
    const yoga = window.getYogaByName(yogaName);
    if (!yoga) return null;
    
    return {
        name: yoga.name,
        remedies: yoga.remedies || [],
        mantras: yoga.mantras || [],
        deities: yoga.deities || [],
        effect: yoga.result || yoga.effect || '',
        keywords: yoga.keywords || []
    };
};

/**
 * Export yogas data for UI rendering
 */
window.getYogasForDisplay = function(detectedYogas) {
    if (!Array.isArray(detectedYogas)) return { positive: [], negative: [], special: [] };
    
    const organized = {
        positive: [],
        negative: [],
        special: []
    };
    
    detectedYogas.forEach(yoga => {
        if (!yoga) return;
        const yogaDetails = {
            name: yoga.name,
            strength: yoga.strength || 'Moderate',
            category: yoga.category || 'General',
            effect: yoga.result || yoga.effect || '',
            keywords: yoga.keywords || [],
            remedies: yoga.remedies || [],
            mantras: yoga.mantras || [],
            deities: yoga.deities || [],
            activeChart: yoga.activeChart || 'D1'
        };
        
        if (yoga.quality === 'Positive') {
            organized.positive.push(yogaDetails);
        } else if (yoga.quality === 'Negative') {
            organized.negative.push(yogaDetails);
        } else {
            organized.special.push(yogaDetails);
        }
    });
    
    return organized;
};