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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
  },

  {
    name: "Sunapha Yoga",
    description: "Planets (except Sun) in 2nd from Moon",
    result: "Self-made wealth, property, and intelligence.",
    quality: "Positive",
    varga: 1,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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
    evaluate: (c) => false,
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