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
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
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
      const signNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      
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
  }

];

/**
 * Calculate all yogas present in a birth chart across all divisional charts
 * @param {Object} allVargas - Object with d1, d9, d24, d60 charts
 * @returns {Array} Array of detected yogas with strength scores and active charts
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
                if (y.evaluate(chart)) {
                    found.push({...y, activeChart: 'D' + vNum});
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
 * @param {String} yogaName - Name of the yoga
 * @returns {Object} Yoga object with all details
 */
window.getYogaByName = function(yogaName) {
    if (!window.YOGAS_DATA) return null;
    return window.YOGAS_DATA.find(y => y && y.name === yogaName) || null;
};

/**
 * Get all yogas of a specific quality
 * @param {String} quality - Quality filter ('Positive', 'Negative', etc.)
 * @returns {Array} Filtered array of yogas
 */
window.getYogasByQuality = function(quality) {
    if (!window.YOGAS_DATA) return [];
    return window.YOGAS_DATA.filter(y => y && y.quality === quality);
};

/**
 * Get yogas by category
 * @param {String} category - Category name
 * @returns {Array} Filtered array of yogas
 */
window.getYogasByCategory = function(category) {
    if (!window.YOGAS_DATA) return [];
    return window.YOGAS_DATA.filter(y => y && y.category === category);
};

/**
 * Calculate yoga strength based on supporting factors
 * @param {String} yogaName - Name of the yoga
 * @param {Object} chart - Birth chart object
 * @returns {Object} Strength assessment (Weak/Moderate/Strong/Very Strong)
 */
window.calculateYogaStrength = function(yogaName, chart) {
    const yoga = window.getYogaByName(yogaName);
    if (!yoga) return { strength: 'Unknown', score: 0 };
    
    // Placeholder for strength calculation logic
    // This would check supporting factors like aspects, dignities, etc.
    return { 
        strength: yoga.strength || 'Moderate', 
        score: 50,
        description: yoga.result || 'No additional details'
    };
};

/**
 * Get remedies for a specific yoga
 * @param {String} yogaName - Name of the yoga
 * @returns {Object} Remedies, mantras, and deities for the yoga
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
 * Export yogas data for UI rendering (filtered and organized)
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

