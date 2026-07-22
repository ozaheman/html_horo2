/**
 * ap_prediction_tithi.js
 * Tithi-based personality predictions extracted from Arun Pandit reference.
 * Source: "Kya Aapki Tithi Aapki Personality Ke Bare Mein Sach Bolti Hai"
 *
 * Each entry contains:
 *   - tithi: Tithi number (1-30 lunar day index as used in Panchang; 1-15 Shukla, 16-30 Krishna)
 *   - name_hi: Tithi name in Hindi
 *   - name_en: Tithi name in English
 *   - devata_hi: Presiding deity (Hindi)
 *   - devata_en: Presiding deity (English)
 *   - prediction_hi: Key personality traits (Hindi)
 *   - prediction_en: Key personality traits (English)
 *   - remedy_hi: Suggested remedy (Hindi)
 *   - remedy_en: Suggested remedy (English)
 */

window.AP_PREDICTION_TITHI = {

  // ─── Pratipada (1st) ────────────────────────────────────────────────────────
  1: {
    tithi: 1,
    name_hi: "प्रतिपदा",
    name_en: "Pratipada",
    devata_hi: "अग्नि देव",
    devata_en: "Agni Dev (God of Fire)",
    prediction_hi: "ऊर्जावान, उत्साही और अेडवेंचरस स्वभाव। नई शुरुआत करने में विशेष रुचि। लीडर बनने की स्वाभाविक इच्छा। जल्दी निर्णय लेते हैं। कभी-कभी अधीर हो जाते हैं। आत्मविश्वास बहुत ऊंचा होता है और लोगों को प्रेरित करने की क्षमता होती है।",
    prediction_en: "Energetic, enthusiastic, and adventurous by nature. Strong interest in new beginnings and pioneering efforts. Natural desire to lead. Quick decision-makers, though sometimes impatient. Very high self-confidence with the ability to inspire and motivate others.",
    remedy_hi: "मंगलवार को लाल फूल से हनुमान जी की पूजा करें। 'ॐ अग्नये नमः' का जाप करें।",
    remedy_en: "Worship Lord Hanuman with red flowers on Tuesday. Chant 'Om Agnaye Namah'."
  },

  // ─── Dwitiya (2nd) ──────────────────────────────────────────────────────────
  2: {
    tithi: 2,
    name_hi: "द्वितीया",
    name_en: "Dwitiya",
    devata_hi: "विधाता / ब्रह्मा जी",
    devata_en: "Vidhata / Brahma (Creator)",
    prediction_hi: "रचनात्मक और कलात्मक प्रवृत्ति के होते हैं। संतुलन और सामंजस्य पसंद करते हैं। दो-विचारात्मक स्वभाव — किसी भी बात के दोनों पहलू देखते हैं। लोगों से जल्दी घुल-मिल जाते हैं। सौंदर्य प्रेमी होते हैं। रिश्तों में बहुत निवेश करते हैं।",
    prediction_en: "Creative and artistic by nature. Love balance and harmony. Two-sided thinkers who see both sides of every matter. Blend easily with people. Aesthetic lovers. Invest heavily in relationships.",
    remedy_hi: "बुधवार को हरे रंग की वस्तुएं दान करें। सरस्वती माँ की आराधना करें।",
    remedy_en: "Donate green-colored items on Wednesday. Worship Goddess Saraswati."
  },

  // ─── Tritiya (3rd) ──────────────────────────────────────────────────────────
  3: {
    tithi: 3,
    name_hi: "तृतीया",
    name_en: "Tritiya",
    devata_hi: "गौरी (माँ पार्वती)",
    devata_en: "Gauri (Goddess Parvati)",
    prediction_hi: "मेहनती और दृढ़ निश्चयी। जो ठान लिया वो करके ही दम लेते हैं। परिवार के प्रति गहरी जिम्मेदारी की भावना। संकट में शांत रहने की क्षमता। अच्छे वक्ता होते हैं। लोगों की मदद करना इनका स्वभाव है।",
    prediction_en: "Hard-working and determined. Complete what they set their mind to. Deep sense of responsibility towards family. Ability to stay calm in crisis. Good speakers. Helping others is in their nature.",
    remedy_hi: "सोमवार को शिव-गौरी की पूजा करें। 'ॐ गौर्यै नमः' का जाप करें।",
    remedy_en: "Worship Shiva-Gauri on Monday. Chant 'Om Gauryai Namah'."
  },

  // ─── Chaturthi (4th) ────────────────────────────────────────────────────────
  4: {
    tithi: 4,
    name_hi: "चतुर्थी",
    name_en: "Chaturthi",
    devata_hi: "श्री गणेश",
    devata_en: "Lord Ganesha",
    prediction_hi: "बुद्धिमान और समस्या सुलझाने में माहिर। जीवन में बाधाओं से घबराते नहीं बल्कि रास्ता निकालते हैं। नई-नई चीजें सीखने का शौक। धर्म और अध्यात्म में रुचि। फैसले सोच-समझकर लेते हैं। भाग्यशाली होते हैं।",
    prediction_en: "Intelligent and skilled at problem-solving. Don't fear obstacles in life but find solutions. Love learning new things. Interest in religion and spirituality. Take well-thought-out decisions. Lucky individuals.",
    remedy_hi: "बुधवार को गणेश जी को मोदक चढ़ाएं। 'ॐ गं गणपतये नमः' का जाप 21 बार करें।",
    remedy_en: "Offer modak to Lord Ganesha on Wednesday. Chant 'Om Gam Ganapataye Namah' 21 times."
  },

  // ─── Panchami (5th) ─────────────────────────────────────────────────────────
  5: {
    tithi: 5,
    name_hi: "पंचमी",
    name_en: "Panchami",
    devata_hi: "नागदेव / माँ लक्ष्मी",
    devata_en: "Naga Dev / Goddess Lakshmi",
    prediction_hi: "कुशाग्र बुद्धि और अच्छी याददाश्त। जानकारी इकट्ठा करना पसंद होता है। सृजनशीलता और कला में रुचि। ये लोग धन कमाने में कुशल होते हैं। परिवार की रक्षा के लिए कुछ भी कर सकते हैं। भावनात्मक रूप से संवेदनशील होते हैं।",
    prediction_en: "Sharp intellect and good memory. Love gathering knowledge and information. Interested in creativity and arts. Skilled at earning wealth. Will do anything to protect family. Emotionally sensitive.",
    remedy_hi: "शुक्रवार को लक्ष्मी माँ की पूजा करें। सांप को दूध चढ़ाएं। 'ॐ नागाय नमः' का जाप करें।",
    remedy_en: "Worship Goddess Lakshmi on Friday. Offer milk to snakes. Chant 'Om Nagaya Namah'."
  },

  // ─── Shashthi (6th) ─────────────────────────────────────────────────────────
  6: {
    tithi: 6,
    name_hi: "षष्ठी",
    name_en: "Shashthi",
    devata_hi: "कार्तिकेय (षष्ठी देवी)",
    devata_en: "Kartikeya (Lord of War & Victory)",
    prediction_hi: "साहसी, दृढ़ और लक्ष्य केंद्रित। युद्ध जैसी परिस्थितियों में भी हिम्मत नहीं हारते। प्रतिस्पर्धा पसंद है। बहुत जिद्दी स्वभाव के होते हैं। नेतृत्व करना आता है। दोस्तों के लिए जान देने को तैयार रहते हैं।",
    prediction_en: "Brave, determined, and goal-focused. Don't lose courage even in war-like situations. Enjoy competition. Very stubborn by nature. Natural leaders. Ready to do anything for their friends.",
    remedy_hi: "मंगलवार को लाल मसूर की दाल दान करें। कार्तिकेय की पूजा करें।",
    remedy_en: "Donate red lentils on Tuesday. Worship Lord Kartikeya."
  },

  // ─── Saptami (7th) ──────────────────────────────────────────────────────────
  7: {
    tithi: 7,
    name_hi: "सप्तमी",
    name_en: "Saptami",
    devata_hi: "सूर्य देव",
    devata_en: "Surya Dev (Sun God)",
    prediction_hi: "बहुत महत्वाकांक्षी। छोटे लक्ष्यों से संतुष्ट नहीं होते। आत्मविश्वास बहुत ऊंचा। आलोचना बिल्कुल बर्दाश्त नहीं करते। परिवार की इज्जत के लिए कुछ भी कर सकते हैं। चाहते हैं कि लोग इन्हें हमेशा नोटिस करते रहें और तारीफ करते रहें। सेल्फी और फोटो का बहुत शौक होता है।",
    prediction_en: "Very ambitious. Not satisfied with small goals. Very high confidence. Cannot tolerate criticism at all. Will do anything for family honor. Want people to always notice and praise them. Love taking selfies and photos.",
    remedy_hi: "रविवार को तांबे के लोटे में रोली मिलाकर सूर्य को अर्घ दें। 'ॐ श्री सूर्य नमः' का 11 बार जाप करें।",
    remedy_en: "On Sunday, offer water with vermilion to the Sun in a copper vessel. Chant 'Om Shri Surya Namah' 11 times."
  },

  // ─── Ashtami (8th) ──────────────────────────────────────────────────────────
  8: {
    tithi: 8,
    name_hi: "अष्टमी",
    name_en: "Ashtami",
    devata_hi: "माँ दुर्गा (महिषासुर मर्दिनी)",
    devata_en: "Goddess Durga (Mahishasura Mardini)",
    prediction_hi: "बाहर से शांत, अंदर से तूफान। बहुत इंटेंस स्वभाव। जीवन में बड़े बदलाव और परिवर्तन आते हैं। बहुत सीक्रेटिव होते हैं। दूसरों के राज़ मरते दम तक रख सकते हैं। अंतर्ज्ञान बहुत मजबूत — सपनों में भविष्य दिख जाता है। रिश्तों में वफादारी सबसे जरूरी होती है। दिल टूटने पर माफ करना बहुत मुश्किल होता है।",
    prediction_en: "Calm outside, storm inside. Very intense nature. Major changes and transformations come in life. Very secretive. Can keep others' secrets till their last breath. Very strong intuition — can see the future in dreams. Loyalty is most important in relationships. Very hard to forgive when heartbroken.",
    remedy_hi: "अष्टमी के दिन दुर्गा सप्तशती का पाठ करें। 'ॐ दुं दुर्गायै नमः' का जाप करें। काले तिल का दान करें।",
    remedy_en: "Recite Durga Saptashati on Ashtami. Chant 'Om Dum Durgayai Namah'. Donate black sesame seeds."
  },

  // ─── Navami (9th) ───────────────────────────────────────────────────────────
  9: {
    tithi: 9,
    name_hi: "नवमी",
    name_en: "Navami",
    devata_hi: "भगवान श्री राम / सिद्धिदात्री देवी",
    devata_en: "Lord Rama / Siddhi Datri Devi",
    prediction_hi: "ज्ञान को बहुत महत्व देते हैं। कम उम्र में ही परिपक्व और जिम्मेदार। विजनरी होते हैं, बड़ी पिक्चर देखते हैं। सिस्टम और नियम के पक्के समर्थक। किसी के साथ अन्याय होते देख आवाज उठाते हैं। भावनात्मक बुद्धि बहुत ऊंची होती है। दूसरों के लिए नेचुरल मेंटोर और गाइड होते हैं। कभी-कभी परफेक्शनिज्म में फंस जाते हैं।",
    prediction_en: "Place great importance on knowledge. Mature and responsible from an early age. Visionary — see the big picture. Strong supporters of systems and rules. Raise voice when injustice is done to anyone. Very high emotional intelligence. Natural mentors and guides for others. Sometimes get stuck in perfectionism.",
    remedy_hi: "गुरुवार को गरीब बच्चों को पेन, कॉपी या स्कूल की ड्रेस दें। 'ॐ ऐं ह्रीं क्लीं चामुंडायै विच्चे' या राम स्तुति का जाप करें।",
    remedy_en: "Give stationery or school clothes to poor children on Thursday. Chant 'Om Aim Hrim Klim Chamundayai Vicche' or Ram Stuti."
  },

  // ─── Dashami (10th) ─────────────────────────────────────────────────────────
  10: {
    tithi: 10,
    name_hi: "दशमी",
    name_en: "Dashami",
    devata_hi: "धर्मराज यमराज",
    devata_en: "Dharmaraj Yamraj (God of Karma & Justice)",
    prediction_hi: "बहुत अनुशासित और नैतिक। हर काम में नियम और सिस्टम फॉलो करते हैं। जो काम लिया उसकी जवाबदारी पूरी तरह लेते हैं। इमोशन से ज्यादा लॉजिक पर काम करते हैं। अपनी सार्वजनिक छवि की बहुत परवाह करते हैं। खुद का मजाक उड़ाना पसंद नहीं। न्याय और ईमानदारी सबसे बड़ा धर्म।",
    prediction_en: "Very disciplined and ethical. Follow rules and systems in every task. Take full accountability for the work they undertake. Work more on logic than emotion. Very conscious of their public image. Don't like being made fun of. Justice and honesty are their biggest dharma.",
    remedy_hi: "शनिवार को काले कपड़े में उड़द दाल बांधकर शनि मंदिर में रखें। 'ॐ यमाय नमः' का जाप करें। दक्षिण दिशा में दिया जलाएं।",
    remedy_en: "On Saturday, place black lentils tied in a black cloth at a Shani temple. Chant 'Om Yamaya Namah'. Light a lamp in the south direction."
  },

  // ─── Ekadashi (11th) ────────────────────────────────────────────────────────
  11: {
    tithi: 11,
    name_hi: "एकादशी",
    name_en: "Ekadashi",
    devata_hi: "भगवान विष्णु",
    devata_en: "Lord Vishnu",
    prediction_hi: "देवी-देवताओं की पूजा-पाठ में गहरा विश्वास। थोड़े धार्मिक होते ही हैं। व्रत और तपस्या से नेचुरल जुड़ाव। जब इमोशन ट्रिगर होते हैं तभी सबसे ज्यादा शाइन करते हैं। सेवा भाव बहुत गहरा। रिश्तों में बलिदान करने को हमेशा तैयार। फैसले लेने में बहुत तेज़ या बहुत धीमे नहीं, मध्यम गति। कभी-कभी खुद की इच्छाओं को दबा देते हैं जो बाद में तनाव बनती है।",
    prediction_en: "Deep faith in worship of deities. Somewhat religious by nature. Natural connection to fasting and penance. Shine the most when their emotions are triggered. Deep spirit of service. Always ready to sacrifice in relationships. Medium pace in decision-making — neither too fast nor too slow. Sometimes suppress their own desires, which causes stress later.",
    remedy_hi: "'ॐ नमो भगवते वासुदेवाय' का धीरे-धीरे मन में जाप करें। थोड़ा सेल्फ-डिसिप्लिन बढ़ाएं।",
    remedy_en: "Chant 'Om Namo Bhagavate Vasudevaya' slowly in mind. Increase self-discipline a little."
  },

  // ─── Dwadashi (12th) ────────────────────────────────────────────────────────
  12: {
    tithi: 12,
    name_hi: "द्वादशी",
    name_en: "Dwadashi",
    devata_hi: "श्री हरि विष्णु (आश्रय और दया के देवता)",
    devata_en: "Lord Vishnu (Deity of Refuge & Compassion)",
    prediction_hi: "बहुत अनुकूलनशील और सहयोगी। जहां जाते हैं वहां के हिसाब से खुद को ढाल लेते हैं। दूसरों को खुश रखने में अपना हित भूल जाते हैं। भरोसेमंद और वफादार होते हैं। मन की बात कम बताते हैं, खुद ही समस्याएं झेल लेते हैं। बिना केओस मचाए काम करवाना जानते हैं। इनका दिल बहुत बड़ा है पर खुद के लिए जगह कम है।",
    prediction_en: "Very adaptable and cooperative. Adjust to wherever they go. Forget their own interests in keeping others happy. Trustworthy and loyal. Share less about their internal feelings, deal with problems alone. Know how to get things done without creating chaos. Very big heart but less space for themselves.",
    remedy_hi: "गुरुवार को केले के पेड़ में जल अर्पित करें। 'ॐ नारायणाय नमः' का जाप करें।",
    remedy_en: "Offer water to a banana tree on Thursday. Chant 'Om Narayanaya Namah'."
  },

  // ─── Trayodashi (13th) ──────────────────────────────────────────────────────
  13: {
    tithi: 13,
    name_hi: "त्रयोदशी",
    name_en: "Trayodashi",
    devata_hi: "भगवान शिव (रुद्र अवतार)",
    devata_en: "Lord Shiva (Rudra Avatar)",
    prediction_hi: "क्रांतिकारी और विद्रोही स्वभाव। जो गलत चल रहा है उसके खिलाफ आवाज उठाते हैं। खुद का रास्ता खुद बनाते हैं। बहुत पैशनेट और मूड स्विंग्स वाले। जीवन में बड़े परिवर्तनों को ग्रेसफुली स्वीकार करते हैं। अपरंपरागत तरीके से आध्यात्मिक। प्रेम में अत्यंत तीव्र — पूरा सब कुछ देते हैं। जोखिम लेना पसंद है।",
    prediction_en: "Revolutionary and rebellious by nature. Raise voice against what's wrong. Forge their own path. Very passionate with mood swings. Gracefully accept major life transformations. Spiritually inclined in unconventional ways. Extremely intense in love — give everything. Love taking risks.",
    remedy_hi: "शिवलिंग पर बेल पत्र चढ़ाएं। 'ॐ नमः शिवाय' का डेली जाप करें।",
    remedy_en: "Offer Belpatra on the Shivalinga. Chant 'Om Namah Shivaya' daily."
  },

  // ─── Chaturdashi (14th) ─────────────────────────────────────────────────────
  14: {
    tithi: 14,
    name_hi: "चतुर्दशी",
    name_en: "Chaturdashi",
    devata_hi: "काल भैरव",
    devata_en: "Kaal Bhairav (Deity of Time & Mystery)",
    prediction_hi: "बहुत इंटेंस और गंभीर स्वभाव। कम बोलते हैं पर जब बोलते हैं तो लोग ध्यान देते हैं। गहरे विचारक। चीजों को हर कोण से देखते हैं। रहस्यमयी विद्याओं जैसे ज्योतिष, तंत्र में गहरी रुचि। अकेला रहना अच्छा लगता है। दूसरों के लिए भरोसेमंद हैं पर खुद का भरोसा कठिन है। अपनी WhatsApp DP और Last Seen छिपाते हैं। फोकस्ड और गोल-ओरिएंटेड।",
    prediction_en: "Very intense and serious nature. Speak less but people listen when they do. Deep thinkers. See things from every angle. Deep interest in mysterious subjects like astrology and tantra. Enjoy being alone. Trustworthy for others but hard to trust others themselves. Hide their WhatsApp DP and Last Seen. Focused and goal-oriented.",
    remedy_hi: "शनिवार को कुत्तों को खाना खिलाएं। काल भैरव की पूजा करें।",
    remedy_en: "Feed dogs on Saturday. Worship Kaal Bhairav."
  },

  // ─── Purnima (15th / Full Moon) ─────────────────────────────────────────────
  15: {
    tithi: 15,
    name_hi: "पूर्णिमा",
    name_en: "Purnima (Full Moon)",
    devata_hi: "चंद्र देव",
    devata_en: "Chandra Dev (Moon God)",
    prediction_hi: "अत्यंत भावुक और अभिव्यक्तिशील। चेहरा बार-बार बदलता रहता है — कभी सुंदर, कभी उदास। मूड स्विंग्स बहुत। कला, संगीत, कविता में स्वाभाविक रुचि। परिवार के प्रति गहरा लगाव। दूसरों की बातें हीलिंग की तरह सुनते हैं। इनकी बातों में भी हीलिंग होती है। चिंता, तनाव, अवसाद की ओर प्रवृत्ति। ट्रैवल बहुत पसंद है — एक जगह ज्यादा दिन नहीं टिक पाते।",
    prediction_en: "Extremely emotional and expressive. Face keeps changing — sometimes beautiful, sometimes sad. Very frequent mood swings. Natural interest in art, music, and poetry. Deep attachment to family. Listen to others like healing. Their own words also carry healing. Prone to anxiety, stress, and depression. Love to travel — can't stay in one place for too long.",
    remedy_hi: "पूर्णिमा के दिन चांदी के लोटे में दूध लेकर 'ॐ चंद्राय नमः' कहते हुए छत पर चंद्रमा को अर्पित करें। चंद्र की रोशनी में बैठकर मन की बातें चंद्र को बताएं।",
    remedy_en: "On Purnima, offer milk from a silver vessel to the Moon on the rooftop chanting 'Om Chandraya Namah'. Sit in moonlight and share your heart's feelings with the Moon."
  },

  // ─── Amavasya (30th / New Moon) ─────────────────────────────────────────────
  30: {
    tithi: 30,
    name_hi: "अमावस्या",
    name_en: "Amavasya (New Moon)",
    devata_hi: "पितृ देव / माँ काली",
    devata_en: "Pitru Dev (Ancestors) / Goddess Kali",
    prediction_hi: "रहस्यमय स्वभाव के। अवसाद, अत्यधिक सोचना और अकेलेपन की भावना जीवन में कभी-कभी बहुत तीव्र होती है। इनके रिश्ते कार्मिक होते हैं। आत्मिक रूप से बहुत gifted — ध्यान की गहराई बहुत जल्दी पा सकते हैं। नेगेटिविटी जल्दी अवशोषित करते हैं इसीलिए रुद्राक्ष धारण जरूरी। दुनिया इन्हें अक्सर अंडरएस्टीमेट करती है पर जीवन में अच्छा काम करते हैं। बेहतरीन काउंसलर, ज्योतिषी और मनोवैज्ञानिक बन सकते हैं।",
    prediction_en: "Mysterious by nature. Depression, overthinking, and loneliness can become very intense at times in life. Their relationships are karmic. Spiritually very gifted — can attain depth in meditation quickly. Absorb negativity fast, hence wearing Rudraksha is important. The world often underestimates them but they do good work in life. Can become excellent counselors, astrologers, and psychologists.",
    remedy_hi: "अमावस्या को पीपल के पेड़ पर दीपक जलाएं। पितरों को नाम लेकर जल और तिल अर्पित करें। रुद्राक्ष धारण करें।",
    remedy_en: "On Amavasya, light a lamp on the Peepal tree. Offer water and sesame seeds to ancestors by name. Wear Rudraksha."
  }
};

/**
 * Get Tithi prediction by Tithi number (1-30).
 * For Krishna paksha, use days 16-29 mapped to the same tithi as Shukla (1-14)
 * since the personality traits are the same.
 * Amavasya = 30, Purnima = 15.
 *
 * @param {number} tithiNum - Tithi number (1-30)
 * @returns {object|null} Prediction object or null if not found
 */
window.AP_PREDICTION_TITHI.get = function(tithiNum) {
  const num = parseInt(tithiNum, 10);
  if (isNaN(num)) return null;

  // Direct match
  if (this[num]) return this[num];

  // Krishna paksha tithis 16-29 correspond to Shukla 1-14
  if (num >= 16 && num <= 29) {
    const shuklaNum = num - 15;
    return this[shuklaNum] || null;
  }

  return null;
};
