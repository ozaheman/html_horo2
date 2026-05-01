// src/predictions/astrology_knowledge.js
// Comprehensive Knowledge Database for Vedic Astrology

/**
 * Structure:
 * type: 'planet_in_house', 'rashi_in_house', 'nakshatra_effect', 'conjunction', 'advanced'
 * key: unique identifier (e.g., 'Sun_1', 'Aries_1', 'Moon_Pushya', 'Sun_Moon_Conj', 'Mandi')
 */

window.ASTRO_KNOWLEDGE = {
  // Planet in House Effects
  planet_in_house: {
    // Sun
    "Sun_1": { title: "Sun in 1st House", description: "Brings strong vitality, leadership qualities, a sense of pride, and sometimes ego issues. The native is usually ambitious and independent." },
    "Sun_2": { title: "Sun in 2nd House", description: "Focus on wealth, family heritage. Can bring wealth from government or authority, but may cause speech to be commanding or harsh." },
    "Sun_3": { title: "Sun in 3rd House", description: "Excellent placement for courage, self-efforts, and communication skills. Native is brave and dynamic." },
    "Sun_4": { title: "Sun in 4th House", description: "Desire for control in domestic life. Can bring real estate success, but may cause friction with the mother or loss of inner peace." },
    "Sun_5": { title: "Sun in 5th House", description: "Creative, intelligent, confident in self-expression. Good for politics or speculation, but may cause ego clashes with children." },
    "Sun_6": { title: "Sun in 6th House", description: "Native defeats enemies and competitors easily. Excellent for administration, medicine, or legal professions. Good immunity." },
    "Sun_7": { title: "Sun in 7th House", description: "Partnerships bring authority, but ego clashes in marriage are common. The spouse is usually confident and proud." },
    "Sun_8": { title: "Sun in 8th House", description: "Deep interest in the occult, research. Can bring sudden changes in life or inheritance. Ego undergoes transformation." },
    "Sun_9": { title: "Sun in 9th House", description: "Strong adherence to dharma, religion, and father's teachings. Good for higher education, long travels, and teaching." },
    "Sun_10": { title: "Sun in 10th House", description: "Sun gets Digbala (directional strength) here. Excellent for career, fame, political power, and executive positions." },
    "Sun_11": { title: "Sun in 11th House", description: "Fulfillment of desires, strong network with influential people, gains from authority. Ambitions are realized." },
    "Sun_12": { title: "Sun in 12th House", description: "Spiritual inclination, isolation. Can indicate living in foreign lands, working in hospitals or ashrams. Ego dissolution." },

    // Moon
    "Moon_1": { title: "Moon in 1st House", description: "Emotional, intuitive, receptive, and sensitive nature. Native is usually nurturing and compassionate." },
    "Moon_2": { title: "Moon in 2nd House", description: "Wealth fluctuates with emotions. Sweet speech, deeply attached to family and values." },
    "Moon_3": { title: "Moon in 3rd House", description: "Imaginative communication, frequent short travels. Strong emotional bond with younger siblings." },
    "Moon_4": { title: "Moon in 4th House", description: "Deep attachment to home, mother, and homeland. Emotionally centered, seeks comfort and security." },
    "Moon_5": { title: "Moon in 5th House", description: "Creative mind, emotionally attached to children and romance. Good for arts, education, and speculation." },
    "Moon_6": { title: "Moon in 6th House", description: "Emotional connection to service, healing, or pets. Mind may be prone to anxiety or worry regarding health." },
    "Moon_7": { title: "Moon in 7th House", description: "Seeks emotional fulfillment through partnerships. Spouse is nurturing, but relationship may have mood swings." },
    "Moon_8": { title: "Moon in 8th House", description: "Intense emotional depth, interest in psychology and the occult. Mind experiences deep transformations." },
    "Moon_9": { title: "Moon in 9th House", description: "Mind is drawn towards philosophy, religion, and higher learning. Respects traditions and teachers." },
    "Moon_10": { title: "Moon in 10th House", description: "Profession may involve public dealing, caregiving, HR, or hospitality. Emotional fulfillment through career." },
    "Moon_11": { title: "Moon in 11th House", description: "Extensive social network, gains through friends and elder siblings. Emotionally invested in group goals." },
    "Moon_12": { title: "Moon in 12th House", description: "Rich subconscious mind, vivid dreams. Good for spirituality, isolation, and foreign settlement." },

    // Mars
    "Mars_1": { title: "Mars in 1st House", description: "Energetic, dynamic, athletic, and impulsive. Natural leader and pioneer, but can be aggressive." },
    "Mars_2": { title: "Mars in 2nd House", description: "Direct and sometimes harsh speech. Driven to accumulate wealth. Can indicate financial disputes in family." },
    "Mars_3": { title: "Mars in 3rd House", description: "Great courage and willpower. Excellent for sports, technical skills, and taking initiative." },
    "Mars_4": { title: "Mars in 4th House", description: "Drive focused on home and property (real estate). Can cause friction or arguments in the domestic environment." },
    "Mars_5": { title: "Mars in 5th House", description: "Competitive in sports and romance. Highly energetic mind, good for technical education." },
    "Mars_6": { title: "Mars in 6th House", description: "Excellent placement. Native easily crushes enemies and overcomes obstacles. Good for law, police, medicine." },
    "Mars_7": { title: "Mars in 7th House", description: "Very passionate in relationships, but can lead to arguments and dominance issues. Creates Mangal Dosha." },
    "Mars_8": { title: "Mars in 8th House", description: "Strong investigative skills, interest in occult. Can indicate sudden events or surgeries. Intense energy." },
    "Mars_9": { title: "Mars in 9th House", description: "Willpower directed towards religion, beliefs, and father. Can make a person a spiritual warrior." },
    "Mars_10": { title: "Mars in 10th House", description: "Mars gets Digbala here. Highly ambitious, excellent for military, police, engineering, executive roles." },
    "Mars_11": { title: "Mars in 11th House", description: "Driven to achieve goals and amass wealth. Strong, dynamic social circle." },
    "Mars_12": { title: "Mars in 12th House", description: "Energy is directed inward or in isolated places (hospitals, foreign lands). Needs physical outlet to avoid frustration." },

    // Mercury
    "Mercury_1": { title: "Mercury in 1st House", description: "Youthful appearance, highly intellectual, communicative, adaptable, and quick-witted." },
    "Mercury_2": { title: "Mercury in 2nd House", description: "Excellent speaker, good with numbers and finance. Wealth from trade, speech, or writing." },
    "Mercury_3": { title: "Mercury in 3rd House", description: "Very analytical, great at writing, coding, sales, and communication. Short trips are common." },
    "Mercury_4": { title: "Mercury in 4th House", description: "Intellectualizes emotions. Education is a focus at home. Good for real estate or educational businesses." },
    "Mercury_5": { title: "Mercury in 5th House", description: "Highly intelligent, good memory. Excellent for logic, mathematics, counseling, and speculative analysis." },
    "Mercury_6": { title: "Mercury in 6th House", description: "Detail-oriented, excellent at problem-solving and diagnostics. Good for healthcare, accounting, programming." },
    "Mercury_7": { title: "Mercury in 7th House", description: "Seeks intellectual compatibility in partnership. Good for business partnerships and trade negotiations." },
    "Mercury_8": { title: "Mercury in 8th House", description: "Deep thinker, researcher, good at uncovering secrets (detective, astrology). Words carry weight." },
    "Mercury_9": { title: "Mercury in 9th House", description: "Interested in higher knowledge, philosophy, law, and cross-cultural communication. Lifelong student." },
    "Mercury_10": { title: "Mercury in 10th House", description: "Career involves communication, commerce, IT, teaching, or writing. Highly adaptable at work." },
    "Mercury_11": { title: "Mercury in 11th House", description: "Large network of intellectual friends. Gains through trade, communication, and social groups." },
    "Mercury_12": { title: "Mercury in 12th House", description: "Imaginative mind. Good for creative writing, foreign trade, working in isolated labs/hospitals." },

    // Jupiter
    "Jupiter_1": { title: "Jupiter in 1st House", description: "Optimistic, wise, generous, and spiritual. Protects the native like a shield. Good for teaching and counseling." },
    "Jupiter_2": { title: "Jupiter in 2nd House", description: "Wealth accumulative. Sweet, truthful speech. Strong family values and prosperity." },
    "Jupiter_3": { title: "Jupiter in 3rd House", description: "Wise communication. Siblings may be like teachers. Good at giving advice and publishing." },
    "Jupiter_4": { title: "Jupiter in 4th House", description: "Happiness in domestic life, large home, good education. Mother may be a guiding figure." },
    "Jupiter_5": { title: "Jupiter in 5th House", description: "Excellent for intelligence, education, and children. Highly creative and moralistic mind." },
    "Jupiter_6": { title: "Jupiter in 6th House", description: "Protect health but can bring issues related to liver/digestion. Wisdom used to resolve conflicts or in service." },
    "Jupiter_7": { title: "Jupiter in 7th House", description: "Wise, virtuous, and supportive partner. Good for business partnerships and legal matters." },
    "Jupiter_8": { title: "Jupiter in 8th House", description: "Deep intuition, interest in occult and profound subjects. Gains through inheritance or marriage." },
    "Jupiter_9": { title: "Jupiter in 9th House", description: "Excellent placement. Strong belief system, very spiritual, ethical. Success in higher education and law." },
    "Jupiter_10": { title: "Jupiter in 10th House", description: "Career as a teacher, advisor, judge, or mentor. Ethical behavior in professional life brings success." },
    "Jupiter_11": { title: "Jupiter in 11th House", description: "Expansion of wealth and social network. Fulfills desires easily. Friends are wise and supportive." },
    "Jupiter_12": { title: "Jupiter in 12th House", description: "Spiritual liberation, interest in ashrams/foreign lands. Expenditure on good causes." },

    // Venus
    "Venus_1": { title: "Venus in 1st House", description: "Charming, attractive, and graceful. Loves art, beauty, and luxury. Highly sociable." },
    "Venus_2": { title: "Venus in 2nd House", description: "Sweet speech, love for good food and luxuries. Wealth accumulated easily and spent on beautiful things." },
    "Venus_3": { title: "Venus in 3rd House", description: "Artistic communication. Good at creative writing, music, or design. Polite to siblings." },
    "Venus_4": { title: "Venus in 4th House", description: "Loves a beautiful and luxurious home. Inner peace and comfort are very important." },
    "Venus_5": { title: "Venus in 5th House", description: "Highly romantic and artistic. Good for acting, entertainment, and creative self-expression." },
    "Venus_6": { title: "Venus in 6th House", description: "Love for pets and service. May face struggles in love life or women competitors. Good for healing arts." },
    "Venus_7": { title: "Venus in 7th House", description: "Seeks harmony and beauty in relationships. Attractive spouse. Excellent for business and public dealing." },
    "Venus_8": { title: "Venus in 8th House", description: "Intense, secretive romances. Gains from partner's wealth. Uncovers the beauty in hidden things." },
    "Venus_9": { title: "Venus in 9th House", description: "Loves travel, philosophy, and learning. Seeks a partner with similar cultural/religious beliefs." },
    "Venus_10": { title: "Venus in 10th House", description: "Career in arts, fashion, beauty, diplomacy, or entertainment. Charming professional demeanor." },
    "Venus_11": { title: "Venus in 11th House", description: "Gains through women, arts, and socializing. Strong desire for luxuries. Fulfills material goals." },
    "Venus_12": { title: "Venus in 12th House", description: "Lover of bed-pleasures and luxuries. Secretly romantic. High expenditure on enjoyments." },

    // Saturn
    "Saturn_1": { title: "Saturn in 1st House", description: "Serious, disciplined, responsible, but may feel heavy or delay success. Hardworking and structured." },
    "Saturn_2": { title: "Saturn in 2nd House", description: "Conservative with money, slow but steady wealth accumulation. Serious tone of speech." },
    "Saturn_3": { title: "Saturn in 3rd House", description: "Hardwork yields results. Deep thinker, structured communication. Good for long-term projects." },
    "Saturn_4": { title: "Saturn in 4th House", description: "Strict or disciplined home environment. Can cause emotional distance, but gives long-lasting properties." },
    "Saturn_5": { title: "Saturn in 5th House", description: "Serious about education. Delays in children or romance. Good for technical, deep studies." },
    "Saturn_6": { title: "Saturn in 6th House", description: "Excellent placement. Crushes enemies slowly. Very hardworking and dedicated in service/jobs." },
    "Saturn_7": { title: "Saturn in 7th House", description: "Gets Digbala here. Delays marriage, but gives a mature, responsible, and stable partner." },
    "Saturn_8": { title: "Saturn in 8th House", description: "Long life. Hardworking in research. Delays inheritance. Can bring chronic issues if afflicted." },
    "Saturn_9": { title: "Saturn in 9th House", description: "Orthodox or structured belief system. Delays in higher education. Father is strict or distant." },
    "Saturn_10": { title: "Saturn in 10th House", description: "Slow, steady rise in career. Incredible work ethic. Gives lasting success in late 30s." },
    "Saturn_11": { title: "Saturn in 11th House", description: "Desires fulfilled slowly. Small, older, or mature social circle. Steady gains over time." },
    "Saturn_12": { title: "Saturn in 12th House", description: "Isolation, disciplined spirituality. Good for working in remote areas, foreign lands, or hospitals." },

    // Rahu
    "Rahu_1": { title: "Rahu in 1st House", description: "Unconventional, highly ambitious, desires fame and recognition. Illusionary self-image." },
    "Rahu_2": { title: "Rahu in 2nd House", description: "Craves wealth and unusual foods. Speech can be manipulative or highly persuasive. Materialistic values." },
    "Rahu_3": { title: "Rahu in 3rd House", description: "Excellent placement. High courage, communication skills, and drive. Good for media and mass communication." },
    "Rahu_4": { title: "Rahu in 4th House", description: "Desire for large properties. Feels unusual or foreign in the homeland. Can disrupt domestic peace." },
    "Rahu_5": { title: "Rahu in 5th House", description: "Obsession with intellect, speculation, and romance. Unconventional ideas and creativity." },
    "Rahu_6": { title: "Rahu in 6th House", description: "Excellent placement. Defeats enemies through cleverness. Highly competitive and successful." },
    "Rahu_7": { title: "Rahu in 7th House", description: "Desires an unconventional or foreign partner. Strong focus on business and public dealing." },
    "Rahu_8": { title: "Rahu in 8th House", description: "Deepest occult secrets, sudden transformations. Interest in hidden wealth, psychology, or taboo subjects." },
    "Rahu_9": { title: "Rahu in 9th House", description: "Questions traditional religion. Unconventional beliefs. Craves foreign travel and higher philosophy." },
    "Rahu_10": { title: "Rahu in 10th House", description: "Obsessed with career, status, and power. Can use any means to achieve success. Good for politics." },
    "Rahu_11": { title: "Rahu in 11th House", description: "Excellent placement. Huge network, huge gains, fulfillment of material desires." },
    "Rahu_12": { title: "Rahu in 12th House", description: "Fascination with spirituality, foreign lands, and hidden realms. Can cause sleep disturbances." },

    // Ketu
    "Ketu_1": { title: "Ketu in 1st House", description: "Spiritual, introspective, detached, and intuitive. May lack self-confidence or focus." },
    "Ketu_2": { title: "Ketu in 2nd House", description: "Detached from wealth and family values. Strange eating habits. Speech is philosophical or blunt." },
    "Ketu_3": { title: "Ketu in 3rd House", description: "Intuitive communication. Disconnect from younger siblings. Courageous but in an unseen way." },
    "Ketu_4": { title: "Ketu in 4th House", description: "Detachment from homeland and mother. Seeks inner peace through spirituality. Frequent changes in residence." },
    "Ketu_5": { title: "Ketu in 5th House", description: "Past life intelligence. Detached from romance or children. Pursues mantras, astrology, or deep research." },
    "Ketu_6": { title: "Ketu in 6th House", description: "Overcomes enemies spiritually. Good for healing professions, Ayurveda, and exact sciences." },
    "Ketu_7": { title: "Ketu in 7th House", description: "Detachment from worldly partnerships. Spouse may be spiritual. Marriage requires letting go of ego." },
    "Ketu_8": { title: "Ketu in 8th House", description: "Deeply occult inclination. Intuitive knowledge of the mysteries of life and death." },
    "Ketu_9": { title: "Ketu in 9th House", description: "Deep spiritual wanderer. Disconnect from traditional religion to find ultimate truth. Gurus are important." },
    "Ketu_10": { title: "Ketu in 10th House", description: "Detached from fame and career. Profession may change frequently or involve research, spirituality, IT." },
    "Ketu_11": { title: "Ketu in 11th House", description: "Detached from social networks and material gains. Few, but highly spiritual friends." },
    "Ketu_12": { title: "Ketu in 12th House", description: "Moksha placement. Ultimate spiritual liberation, deep meditation, vivid dreams, highly intuitive." },
  },

  // Rashi (Sign) in House Effects
  rashi_in_house: {
    "Aries_1": { title: "Aries in 1st House", description: "Native is energetic, pioneering, independent, headstrong, and quick to take action." },
    "Taurus_2": { title: "Taurus in 2nd House", description: "Finances are practical and stable. Loves arts, beauty, good food, and material security." },
    // Add dynamically in code, generic descriptions based on House + Lord
  },

  // Conjunction Effects
  conjunction: {
    "Sun_Moon": { title: "Sun & Moon Conjunct", description: "Amavasya (New Moon) birth. Strong focus on self, but emotions and ego are deeply intertwined." },
    "Sun_Mars": { title: "Sun & Mars Conjunct", description: "High physical energy, competitive, aggressive, courageous. Great for military, sports, engineering." },
    "Sun_Mercury": { title: "Sun & Mercury Conjunct", description: "Budhaditya Yoga. Highly intelligent, communicative, analytical, and successful in business." },
    "Sun_Jupiter": { title: "Sun & Jupiter Conjunct", description: "Highly moral, ethical, wise, and optimistic. Strong leadership with a sense of justice." },
    "Sun_Venus": { title: "Sun & Venus Conjunct", description: "Charming, artistic, loves luxury. Can indicate compromises in relationship due to ego." },
    "Sun_Saturn": { title: "Sun & Saturn Conjunct", description: "Clash of ego vs discipline. Friction with father or authority. Hardwork leads to slow success." },
    "Moon_Mars": { title: "Moon & Mars Conjunct", description: "Chandra-Mangala Yoga. Emotional fire, passionate, impulsive, driven to protect. Wealth generating." },
    "Moon_Mercury": { title: "Moon & Mercury Conjunct", description: "Highly intellectual and talkative mind. Can overthink. Great for writing and commerce." },
    "Moon_Jupiter": { title: "Moon & Jupiter Conjunct", description: "Gajakesari Yoga. Wise, optimistic, wealthy, respected, deeply spiritual and giving." },
    "Moon_Venus": { title: "Moon & Venus Conjunct", description: "Loves beauty, art, and comfort. Very romantic, emotional, and creatively talented." },
    "Moon_Saturn": { title: "Moon & Saturn Conjunct", description: "Vish Yoga. Emotional restriction, depression, or seriousness. Mind is structured and disciplined." },
    "Mars_Mercury": { title: "Mars & Mercury Conjunct", description: "Quick thinking, argumentative, fast speech. Great analytical drive, good for IT and engineering." },
    "Mars_Jupiter": { title: "Mars & Jupiter Conjunct", description: "Action guided by wisdom. Righteous warrior, optimistic drive, enthusiastic." },
    "Mars_Venus": { title: "Mars & Venus Conjunct", description: "High passion, romantic intensity, strong sexual drive, creative energy." },
    "Mars_Saturn": { title: "Mars & Saturn Conjunct", description: "Push-pull energy (stop and go). Frustration but immense endurance for hard physical work. Technical skills." },
    "Mercury_Jupiter": { title: "Mercury & Jupiter Conjunct", description: "Blend of logic (Mercury) and wisdom (Jupiter). Excellent for teaching, law, publishing, and counseling." },
    "Mercury_Venus": { title: "Mercury & Venus Conjunct", description: "Sweet speech, poetic, artistic intellect. Good for design, media, and trade." },
    "Mercury_Saturn": { title: "Mercury & Saturn Conjunct", description: "Deep, slow, structured thinker. Good for accounting, law, detail-oriented work. Speech is measured." },
    "Jupiter_Venus": { title: "Jupiter & Venus Conjunct", description: "Clash of two gurus (Deva vs Asura). Highly knowledgeable, wealthy, and comfortable." },
    "Jupiter_Saturn": { title: "Jupiter & Saturn Conjunct", description: "Dharma (Jupiter) meets Karma (Saturn). Responsible, structured approach to religion and law." },
    "Venus_Saturn": { title: "Venus & Saturn Conjunct", description: "Loyal, dutiful in relationships. Late marriage. Finds beauty in antique/old things. Realistic romance." },
    // Advanced Conjunctions
    "Three_Planets": { title: "Three Planet Conjunction", description: "Creates a strong focal point in the chart. Blends multiple energies, making the house highly active but complex." },
    "Four_Planets": { title: "Four Planet Conjunction", description: "Sanyaasa Yoga tendency. Intense focus on one area of life, leading to detachment from others." },
  },

  // Advanced Concepts
  advanced: {
    "Mandi": { title: "Mandi (Gulika)", description: "A highly malefic sub-planet (Upagraha) related to Saturn. Wherever it sits, it is said to cause delays, obstacles, and poison the significations of the house, but in the 3rd, 6th, or 11th it gives excellent material results." },
    "Khar_Graha": { title: "Khar Graha", description: "The lord of the 22nd Drekkana or 64th Navamsha. It acts as a hidden malefic, triggering sudden challenging events during its Dasha or transit." },
    "Argala": { title: "Argala", description: "Planetary intervention. Planets in the 2nd, 4th, and 11th from a house form Argala (intervention) on it, meaning they influence the outcome of that house, either positively or negatively." },
  }
};

/**
 * Helper function to retrieve knowledge
 * @param {string} type - Category (e.g., 'planet_in_house', 'conjunction')
 * @param {string} key - Specific lookup key (e.g., 'Moon_4', 'Sun_Moon')
 * @returns {Object|null} - { title, description }
 */
window.getAstrologyInsight = function(type, key) {
  const customKey = 'insight_' + type + '_' + key;
  const customDesc = localStorage.getItem('pred_override_' + customKey);

  if (window.ASTRO_KNOWLEDGE && window.ASTRO_KNOWLEDGE[type] && window.ASTRO_KNOWLEDGE[type][key]) {
    const original = window.ASTRO_KNOWLEDGE[type][key];
    return {
      title: original.title,
      description: customDesc ? customDesc : original.description,
      isOverridden: !!customDesc,
      key: customKey,
      originalDesc: original.description
    };
  }
  return null;
};
