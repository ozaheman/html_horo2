
// --- START OF FILE bnn_prediction.js ---
// Contains the database of predictions for Bhrigu Nandi Nadi.
// This includes:
// 1. 2-planet combinations (updated based on all provided PDFs).
// 2. Transit interpretations of Jupiter and Saturn over natal planets.
// 3. Profession indicators (Saturn in Rashis, Saturn with Planets, Specific Profession Combinations).
// 4. Progression rules and example interpretations.

const bnnSpecialYogas = {
    "Accident_Yoga": {
        "title_en": "Accident Yoga (दुर्घटना योग)",
        "cause_en": "A connection between Saturn and Mars (conjunction, trine, 2/12, mutual aspect, or nakshatra exchange).",
        "cause_hi": "शनि और मंगल के बीच संबंध (युति, त्रिकोण, २/१२, आपसी दृष्टि, या नक्षत्र विनिमय)।",
        "principle_en": "Saturn (Karma, Structure, Obstruction) combines with Mars (Energy, Action, Accidents, Blood). This creates a volatile combination where energy can lead to structural damage.",
        "principle_hi": "शनि (कर्म, संरचना, बाधा) मंगल (ऊर्जा, क्रिया, दुर्घटना, रक्त) के साथ जुड़ता है। यह एक अस्थिर संयोजन बनाता है जहाँ ऊर्जा संरचनात्मक क्षति का कारण बन सकती है।",
        "results": {
            "en": [
                "Indicates a promise of accidents, surgery, or injury in the native's life.",
                "The yoga is triggered during specific transits: Saturn transiting over natal Mars, Jupiter transiting over the natal combination, or Rahu's transit involvement.",
                "The most dangerous periods are when a double transit of Saturn and Jupiter aspects the natal combination, or when transit Jupiter/Rahu aspects natal Rahu/Jupiter.",
                "Severity increases if the 8th or 12th house (from Jupiter) is also activated during these transits."
            ],
            "hi": [
                "जातक के जीवन में दुर्घटना, सर्जरी या चोट का संकेत देता है।",
                "यह योग विशिष्ट गोचर के दौरान सक्रिय होता है: शनि का जन्म मंगल पर गोचर, बृहस्पति का जन्म संयोजन पर गोचर, या राहु का गोचर।",
                "सबसे खतरनाक अवधि तब होती है जब शनि और बृहस्पति का दोहरा गोचर जन्म संयोजन पर प्रभाव डालता है, या जब गोचर बृहस्पति/राहु जन्म राहु/बृहस्पति पर प्रभाव डालते हैं।",
                "यदि इन गोचरों के दौरान 8वें या 12वें भाव (बृहस्पति से) भी सक्रिय हो जाते हैं तो गंभीरता बढ़ जाती है।"
            ]
        }
    },
    "Dhan_Yoga": {
        "title_en": "Dhan Yoga (धन योग - Wealth Combination)",
        "cause_en": "A strong connection between Jupiter-Venus or Saturn-Venus (conjunction, trine, 2/12).",
        "cause_hi": "बृहस्पति-शुक्र या शनि-शुक्र के बीच एक मजबूत संबंध (युति, त्रिकोण, २/१२)।",
        "principle_en": "Jupiter (Jeeva, Wisdom, Fortune) or Saturn (Karma, Profession) combines with Venus (Lakshmi, Wealth, Comforts). This links the soul or one's actions directly to wealth.",
        "principle_hi": "बृहस्पति (जीव, ज्ञान, भाग्य) या शनि (कर्म, व्यवसाय) शुक्र (लक्ष्मी, धन, सुख) के साथ जुड़ता है। यह आत्मा या व्यक्ति के कर्मों को सीधे धन से जोड़ता है।",
        "results": {
            "en": [
                "Indicates strong potential for wealth, prosperity, and acquisition of assets (vehicles, property).",
                "The yoga becomes active and delivers results during favorable transits of Jupiter, Saturn, and Venus over each other.",
                "Malefic transits, especially Rahu or Ketu over this combination, can temporarily block or delay the results, or cause losses."
            ],
            "hi": [
                "धन, समृद्धि और संपत्ति (वाहन, संपत्ति) के अधिग्रहण की मजबूत क्षमता का संकेत देता है।",
                "यह योग बृहस्पति, शनि और शुक्र के एक दूसरे पर अनुकूल गोचर के दौरान सक्रिय होता है और परिणाम देता है।",
                "अशुभ गोचर, विशेष रूप से इस संयोजन पर राहु या केतु का गोचर, परिणामों को अस्थायी रूप से अवरुद्ध या विलंबित कर सकता है, या नुकसान का कारण बन सकता है।"
            ]
        }
    },
    "Astrologer_Yoga": {
        "title_en": "Astrologer / Spiritual Guide Yoga (ज्योतिषी / आध्यात्मिक गुरु योग)",
        "cause_en": "A strong connection between Jupiter, Saturn, and Ketu. Moon's involvement strengthens it.",
        "cause_hi": "बृहस्पति, शनि और केतु के बीच एक मजबूत संबंध। चंद्रमा की भागीदारी इसे मजबूत करती है।",
        "principle_en": "Jupiter (Wisdom, Guru), Saturn (Karma, Discipline, Tradition), and Ketu (Moksha, Intuition, Occult) combine. This powerful trio connects deep wisdom with disciplined practice and intuitive insight, forming the basis for a spiritual guide or astrologer.",
        "principle_hi": "बृहस्पति (ज्ञान, गुरु), शनि (कर्म, अनुशासन, परंपरा), और केतु (मोक्ष, अंतर्ज्ञान, गुप्त) का संयोजन। यह शक्तिशाली तिकड़ी गहरे ज्ञान को अनुशासित अभ्यास और सहज अंतर्दृष्टि से जोड़ती है, जो एक आध्यात्मिक मार्गदर्शक या ज्योतिषी का आधार बनती है।",
        "results": {
            "en": [
                "Strong inclination towards astrology, occult sciences, spirituality, and traditional knowledge.",
                "The person often has a deep, intuitive understanding of life's karmic patterns.",
                "To *earn* money from this profession, a Dhan Yoga (e.g., connection to Venus) must also be present.",
                "A Moon-Mercury connection can indicate a tendency to use this sacred knowledge for purely commercial gains, potentially unethically."
            ],
            "hi": [
                "ज्योतिष, गुप्त विज्ञान, आध्यात्मिकता और पारंपरिक ज्ञान की ओर प्रबल झुकाव।",
                "व्यक्ति को अक्सर जीवन के कर्म पैटर्न की गहरी, सहज समझ होती है।",
                "इस पेशे से पैसा *कमाने* के लिए, एक धन योग (जैसे, शुक्र से संबंध) भी मौजूद होना चाहिए।",
                "चंद्र-बुध का संबंध इस पवित्र ज्ञान का विशुद्ध रूप से व्यावसायिक लाभ के लिए, संभावित रूप से अनैतिक रूप से उपयोग करने की प्रवृत्ति का संकेत दे सकता है।"
            ]
        }
    },
    "Support_From_Spouse_Yoga": {
        "title_en": "Support from Spouse Yoga (जीवनसाथी से सहयोग योग)",
        "cause_en": "A connection between Jupiter (self, Jeeva) and Venus (spouse in male chart), especially if Venus is in the 11th (gains) or 2nd (family, wealth) from Jupiter.",
        "cause_hi": "बृहस्पति (स्वयं, जीव) और शुक्र (पुरुष कुंडली में पत्नी) के बीच संबंध, खासकर यदि शुक्र बृहस्पति से 11वें (लाभ) या दूसरे (परिवार, धन) भाव में हो।",
        "principle_en": "The Jeevakaraka (Jupiter) is linked to the Kalatrakaraka (Venus) in a house of gains or resources, indicating that the spouse will be a source of support and prosperity.",
        "principle_hi": "जीवकारक (बृहस्पति) का संबंध कलत्रकारक (शुक्र) से लाभ या संसाधनों के भाव में होता है, जो यह दर्शाता है कि जीवनसाथी समर्थन और समृद्धि का स्रोत होगा।",
        "results": {
            "en": [
                "The native is likely to receive financial help, support, or valuable advice from their spouse or spouse's family.",
                "If the combination is not present, one should not expect significant material support from the spouse, as it is not part of their karmic promise."
            ],
            "hi": [
                "जातक को अपने जीवनसाथी या जीवनसाथी के परिवार से वित्तीय सहायता, समर्थन या बहुमूल्य सलाह मिलने की संभावना है।",
                "यदि यह संयोजन मौजूद नहीं है, तो व्यक्ति को जीवनसाथी से महत्वपूर्ण भौतिक समर्थन की उम्मीद नहीं करनी चाहिए, क्योंकि यह उनके कर्म वादे का हिस्सा नहीं है।"
            ]
        }
    }
};

const bnnEducation = {
    "promoters": {
        "title_en": "Education Promoters", "title_hi": "शिक्षा प्रवर्तक",
        "planets": {
            "Su": { "en": "General studies, administration, politics, medicine. Gives recognition.", "hi": "सामान्य अध्ययन, प्रशासन, राजनीति, चिकित्सा। मान्यता देता है।" },
            "Ju": { "en": "Higher knowledge, commerce, finance, spiritual studies, law. Ensures depth of learning.", "hi": "उच्च ज्ञान, वाणिज्य, वित्त, आध्यात्मिक अध्ययन, कानून। सीखने की गहराई सुनिश्चित करता है।" },
            "Ve": { "en": "Fine arts, science, administration, finance, design. Adds creativity and smoothness.", "hi": "ललित कला, विज्ञान, प्रशासन, वित्त, डिजाइन। रचनात्मकता और सहजता जोड़ता है।" }
        }
    },
    "blockers": {
        "title_en": "Education Blockers (or Stream-Changers)", "title_hi": "शिक्षा अवरोधक (या धारा-परिवर्तक)",
        "principle_en": "These planets can cause breaks or difficulties in education *unless* the native pursues a field of study related to the planet's own nature.",
        "principle_hi": "ये ग्रह शिक्षा में रुकावट या कठिनाइयों का कारण बन सकते हैं *जब तक कि* जातक ग्रह की अपनी प्रकृति से संबंधित अध्ययन के क्षेत्र को नहीं अपनाता।",
        "planets": {
            "Ma": { "en": "Causes breaks. Promotes technical education, engineering, logic, sports.", "hi": "रुकावटें पैदा करता है। तकनीकी शिक्षा, इंजीनियरिंग, तर्क, खेल को बढ़ावा देता है।" },
            "Ke": { "en": "Causes breaks/detachment. Promotes law, occult, medicine, surgery, languages, coding.", "hi": "रुकावटें/वैराग्य पैदा करता है। कानून, गुप्त विद्या, चिकित्सा, सर्जरी, भाषा, कोडिंग को बढ़ावा देता है।" },
            "Mo": { "en": "Causes frequent changes (stream/school). Promotes hospitality, psychology, food-related studies, HR.", "hi": "बार-बार बदलाव (धारा/स्कूल) का कारण बनता है। आतिथ्य, मनोविज्ञान, भोजन-संबंधी अध्ययन, मानव संसाधन को बढ़ावा देता है।" },
            "Ra": { "en": "Causes breaks/unconventional paths. Promotes foreign languages, research, IT, AI, photography, mass media.", "hi": "रुकावटें/अपरंपरागत रास्ते बनाता है। विदेशी भाषा, अनुसंधान, आईटी, एआई, फोटोग्राफी, मास मीडिया को बढ़ावा देता है।" }
        }
    },
    "higher_education": {
        "title_en": "Higher Education (PhD, Research)", "title_hi": "उच्च शिक्षा (पीएचडी, अनुसंधान)",
        "cause_en": "Mercury connected to a major promoter (Sun or Jupiter) AND Rahu.",
        "cause_hi": "बुध का एक प्रमुख प्रवर्तक (सूर्य या बृहस्पति) और राहु से संबंध।",
        "principle_en": "Rahu's nature of deep-diving, obsession, and unconventional thinking is essential for profound research and doctorate-level studies.",
        "principle_hi": "गहन शोध और डॉक्टरेट स्तर के अध्ययन के लिए राहु की गहरी डुबकी लगाने, जुनून और अपरंपरागत सोच की प्रकृति आवश्यक है।"
    },
    "timing_success": {
        "title_en": "Timing of Success in Education", "title_hi": "शिक्षा में सफलता का समय",
        "cause_en": "Transit of Jupiter and Sun over natal Mercury.",
        "cause_hi": "जन्म के बुध पर बृहस्पति और सूर्य का गोचर।",
        "principle_en": "The great benefic (Jupiter) and the planet of recognition (Sun) activate the karaka of education (Mercury), bringing success in exams and awards.",
        "principle_hi": "महान शुभ (बृहस्पति) और मान्यता का ग्रह (सूर्य) शिक्षा के कारक (बुध) को सक्रिय करते हैं, जिससे परीक्षाओं और पुरस्कारों में सफलता मिलती है।"
    }
};

const bnnCorePrinciples = {
    "past_life_and_retrogrades": {
        "title_en": "Past Life, Pending Karma, and Retrograde Planets",
        "title_hi": "पिछला जीवन, लंबित कर्म और वक्री ग्रह",
        "principle_en": "BNN posits that our soul's journey continues. Jupiter's position in the sign *before* its natal sign shows its placement in the past life. Any planet that is retrograde (R) signifies pending karma related to its significations, which must be addressed in this lifetime. The soul has to work on the duties of both the current house and the previous house of the retrograde planet.",
        "principle_hi": "बीएनएन के अनुसार हमारी आत्मा की यात्रा जारी रहती है। बृहस्पति की अपनी जन्म राशि से *पिछली* राशि में स्थिति पिछले जीवन में उसके स्थान को दर्शाती है। कोई भी ग्रह जो वक्री (R) है, वह उसके कारकों से संबंधित लंबित कर्म का प्रतीक है, जिसे इस जीवनकाल में संबोधित किया जाना चाहिए। आत्मा को वक्री ग्रह के वर्तमान भाव और पिछले भाव दोनों के कर्तव्यों पर काम करना पड़ता है।",
        "results": {
            "en": [
                "**Jupiter Retrograde:** Pending karma related to wisdom, dharma, children, or husband. The person must fulfill responsibilities they shirked.",
                "**Saturn Retrograde:** Pending karma related to profession, duty, and hard work. The person often feels they work harder for less reward initially, as they are paying off an old karmic debt of labor.",
                "**Venus Retrograde:** Pending karma related to spouse, relationships, finances, or respect for women (in a male chart).",
                "**Mars Retrograde:** Pending karma related to siblings, courage, energy, and property disputes.",
                "**Mercury Retrograde:** Pending karma related to education, communication, friends, or relatives."
            ],
            "hi": [
                "**बृहस्पति वक्री:** ज्ञान, धर्म, बच्चों या पति से संबंधित लंबित कर्म। व्यक्ति को उन जिम्मेदारियों को पूरा करना होगा जिनसे वे बचते थे।",
                "**शनि वक्री:** पेशे, कर्तव्य और कड़ी मेहनत से संबंधित लंबित कर्म। व्यक्ति को अक्सर लगता है कि वे कम इनाम के लिए अधिक मेहनत करते हैं, क्योंकि वे श्रम का एक पुराना कर्म ऋण चुका रहे हैं।",
                "**शुक्र वक्री:** जीवनसाथी, रिश्ते, वित्त, या महिलाओं के सम्मान (पुरुष कुंडली में) से संबंधित लंबित कर्म।",
                "**मंगल वक्री:** भाई-बहन, साहस, ऊर्जा और संपत्ति विवादों से संबंधित लंबित कर्म।",
                "**बुध वक्री:** शिक्षा, संचार, दोस्तों या रिश्तेदारों से संबंधित लंबित कर्म।"
            ]
        }
    },
    "karmic_path_2_12": {
        "title_en": "The Karmic Path: 2nd and 12th House Connections",
        "title_hi": "कर्म पथ: दूसरा और बारहवां भाव संबंध",
        "principle_en": "In BNN, planets in the 2nd and 12th house from a planet are considered conjunct. This forms the sequence of one's karmic journey.",
        "principle_hi": "बीएनएन में, किसी ग्रह से दूसरे और बारहवें भाव में स्थित ग्रहों को युति में माना जाता है। यह व्यक्ति की कर्म यात्रा का क्रम बनाता है।",
        "results": {
            "en": [
                "**Planet in 12th (Behind):** Represents a quality the 'hero' planet already possesses from the past. It is an ingrained trait or a situation that has already occurred.",
                "**Planet in 2nd (Ahead):** Represents a quality the 'hero' planet will acquire, move towards, or have to deal with in the future of this life. It is the direction of the soul's journey."
            ],
            "hi": [
                "**12वें भाव में ग्रह (पीछे):** एक ऐसे गुण का प्रतिनिधित्व करता है जो 'नायक' ग्रह के पास अतीत से पहले से ही है। यह एक अंतर्निहित विशेषता या एक ऐसी स्थिति है जो पहले ही हो चुकी है।",
                "**दूसरे भाव में ग्रह (आगे):** एक ऐसे गुण का प्रतिनिधित्व करता है जिसे 'नायक' ग्रह इस जीवन के भविष्य में प्राप्त करेगा, उसकी ओर बढ़ेगा, या उससे निपटना होगा। यह आत्मा की यात्रा की दिशा है।"
            ]
        }
    }
};

const bnnCombinationPredictions = {
    // Key format: "Planet1_ID-Planet2_ID" where Planet1 is the preceding planet (lower degree).
    // Note: For combinations not explicitly detailed in the provided PDFs for 2-planet,
    // a generic placeholder or inference might be used, or they remain empty.
    // Hindi translations are added for all English predictions. If a direct PDF translation
    // isn't available, a general translation of the English text is provided.

    // == SUN Combinations (Planet ID: 1) ==
    "1-2": { // Sun + Moon
        en: [
            "1. Father’s life encountered changes after the birth of native, changes may include job change, city change, house change, travel etc. (As moon’s degree is ahead of Sun), Or father may be in transferrable or travelling job.",
            "2. Mother belonged to a family with name , fame and status, she is dominating and will rule the house. (Sun is in history of Moon)",
            "3. Mother is pious, and native’s mind has pious thoughts.",
            "4. Native is very intelligent and will get out of any problem using his/her intelligence. (Sun gives luminosity to mind)",
            "5. Outer Personality- Mood swings(Unpredictable), Fluctuating, Changes , Emotional, caring, Fat body(If Rahu/Jupiter Influences), Not stable, Always in hurry, Can change themselves to adapt to any condition, Good eyes and smile.",
            "6. Family Deity- Parvati Maa, Female Deity.",
            "7. Native can have Female Bosses."
        ],
        hi: [
            "१. जातक के जन्म के बाद पिता के जीवन में परिवर्तन आए, परिवर्तनों में नौकरी बदलना, शहर बदलना, घर बदलना, यात्रा आदि शामिल हो सकते हैं (क्योंकि चंद्रमा की डिग्री सूर्य से आगे है), या पिता स्थानांतरणीय या यात्रा वाली नौकरी में हो सकते हैं।",
            "२. माता नाम, प्रसिद्धि और प्रतिष्ठा वाले परिवार से थीं, वह प्रभावशाली हैं और घर पर शासन करेंगी (सूर्य चंद्रमा के इतिहास में है)।",
            "३. माता पवित्र हैं, और जातक के मन में पवित्र विचार हैं।",
            "४. जातक बहुत बुद्धिमान है और अपनी बुद्धि का उपयोग करके किसी भी समस्या से बाहर निकल जाएगा (सूर्य मन को प्रकाश देता है)।",
            "५. बाहरी व्यक्तित्व- मिजाज में बदलाव (अप्रत्याशित), उतार-चढ़ाव, परिवर्तन, भावुक, देखभाल करने वाला, मोटा शरीर (यदि राहु/बृहस्पति का प्रभाव हो), अस्थिर, हमेशा जल्दी में, किसी भी स्थिति के अनुकूल खुद को बदल सकता है, अच्छी आँखें और मुस्कान।",
            "६. कुल देवी- पार्वती माँ, स्त्री देवता।",
            "७. जातक की बॉस महिला हो सकती हैं।"
        ]
    },
    "2-1": { // Moon + Sun
        en: [
            "1. Father’s life encountered changes before the birth of native, changes may include job change, city change, house change, travel etc. (As moon’s degree is behind of Sun), Or father may be in transferrable or travelling job.",
            "2. Mother got name , fame and status after the birth of native , she is dominating and will rule the house. (Sun is ahead of Moon)",
            "3. Mother is pious, and native’s mind has pious thoughts.",
            "4. Native is very intelligent and will get out of any problem using his/her intelligence. (Sun gives luminosity to mind)",
            "5. Mother And Father has good bond (unless malefic impact), sometimes it is seen that father is in travelling/transferrable job.",
            "6. Person here also is emotional, caring but his/her this side is unknown to the world, as planet ahead to sun gets luminosity and planet behind sun although a part of your personality remains hidden."
        ],
        hi: [
            "१. जातक के जन्म से पहले पिता के जीवन में परिवर्तन आए, परिवर्तनों में नौकरी बदलना, शहर बदलना, घर बदलना, यात्रा आदि शामिल हो सकते हैं (क्योंकि चंद्रमा की डिग्री सूर्य से पीछे है), या पिता स्थानांतरणीय या यात्रा वाली नौकरी में हो सकते हैं।",
            "२. जातक के जन्म के बाद माता को नाम, प्रसिद्धि और प्रतिष्ठा मिली, वह प्रभावशाली हैं और घर पर शासन करेंगी (सूर्य चंद्रमा से आगे है)।",
            "३. माता पवित्र हैं, और जातक के मन में पवित्र विचार हैं।",
            "४. जातक बहुत बुद्धिमान है और अपनी बुद्धि का उपयोग करके किसी भी समस्या से बाहर निकल जाएगा (सूर्य मन को प्रकाश देता है)।",
            "५. माता और पिता के बीच अच्छा संबंध है (जब तक कि कोई अशुभ प्रभाव न हो), कभी-कभी यह देखा जाता है कि पिता यात्रा/स्थानांतरणीय नौकरी में हैं।",
            "६. यहां व्यक्ति भावुक, देखभाल करने वाला भी है लेकिन उसका यह पक्ष दुनिया से अनजान है, क्योंकि सूर्य से आगे का ग्रह प्रकाश प्राप्त करता है और सूर्य के पीछे का ग्रह यद्यपि आपके व्यक्तित्व का एक हिस्सा छिपा रहता है।"
        ]
    },
    "1-3": { // Sun + Mars
        en: [
            "1. Father may have purchased a land/property after birth of native.",
            "2. Father will encounter an accident/surgery in his lifetime.",
            "3. Father’s life encountered obstructions/problems after birth of native.",
            "4. Father and brother look alike; Habits may be similar.",
            "5. Father is stubborn, sometimes arguments with father.",
            "6. Husband is dominating, egoistic and comes from a status family.",
            "7. Brother is born dominating and egoistic.",
            "8. Outer personality – Strong Body , Muscular, Tomboyish/Passionate in Female chart, Over aggressive, stubborn , Show courage(Overconfident), Justice loving , Sometimes scar mark on eyebrow or face, Gym , Physical activity, Sports.",
            "9. Family Deity- Hanuman Ji Or Kartikeya Ji"
        ],
        hi: [
            "१. पिता ने जातक के जन्म के बाद भूमि/संपत्ति खरीदी होगी।",
            "२. पिता को अपने जीवनकाल में दुर्घटना/सर्जरी का सामना करना पड़ेगा।",
            "३. जातक के जन्म के बाद पिता के जीवन में बाधाएं/समस्याएं आईं।",
            "४. पिता और भाई एक जैसे दिखते हैं; आदतें समान हो सकती हैं।",
            "५. पिता जिद्दी हैं, कभी-कभी पिता के साथ बहस होती है।",
            "६. पति दबंग, अहंकारी और प्रतिष्ठित परिवार से होता है।",
            "७. भाई जन्म से ही दबंग और अहंकारी होता है।",
            "८. बाहरी व्यक्तित्व - मजबूत शरीर, मांसल, स्त्री कुंडली में टॉमबॉयिश/भावुक, अत्यधिक आक्रामक, जिद्दी, साहस दिखाना (अति आत्मविश्वासी), न्यायप्रिय, कभी-कभी भौंह या चेहरे पर निशान, जिम, शारीरिक गतिविधि, खेल।",
            "९. कुल देवता- हनुमान जी या कार्तिकेय जी।"
        ]
    },
    "3-1": { // Mars + Sun
        en: [
            "1. Father may have purchased a land/property before birth of native.",
            "2. Father encountered an accident/surgery before birth of native.",
            "3. Father’s life encountered obstructions/problems before birth of native.",
            "4. Father and brother look alike; Habits may be similar.",
            "5. Father is stubborn.",
            "6. Husband will become dominating, egoistic and gets status after marriage.",
            "7. Brother will become dominating and egoistic.",
            "8. Su+ Ma is combination for promotions.",
            "9. Father may have a younger brother.",
            "10. Person is very stubborn, short tempered from inside but may not show it to the world."
        ],
        hi: [
            "१. पिता ने जातक के जन्म से पहले भूमि/संपत्ति खरीदी होगी।",
            "२. जातक के जन्म से पहले पिता को दुर्घटना/सर्जरी का सामना करना पड़ा।",
            "३. जातक के जन्म से पहले पिता के जीवन में बाधाएं/समस्याएं आईं।",
            "४. पिता और भाई एक जैसे दिखते हैं; आदतें समान हो सकती हैं।",
            "५. पिता जिद्दी हैं।",
            "६. पति विवाह के बाद दबंग, अहंकारी बनेगा और प्रतिष्ठा प्राप्त करेगा।",
            "७. भाई दबंग और अहंकारी बनेगा।",
            "८. सूर्य + मंगल पदोन्नति के लिए एक संयोजन है।",
            "९. पिता का एक छोटा भाई हो सकता है।",
            "१०. व्यक्ति अंदर से बहुत जिद्दी, गुस्सैल होता है लेकिन दुनिया को यह नहीं दिखाता।"
        ]
    },
    "1-4": { // Sun + Mercury
        en: [
            "1. Father is very intelligent.",
            "2. Father may have started a business after birth of native.",
            "3. Father is business minded.",
            "4. Sister/ Daughter is dominating by birth (Can be a tool to find which daughter is Ve/Me/Mo)",
            "5. Neighbours/ Relatives may be powerful/in politics/in govt. job.",
            "6. Outer Personality- May look younger than age, communications skills good, Talkative, witty nature, childish behavior(if Saturn also there mature and long face, intelligent, ), intelligent, whole life learner, padhne likhne wala bacha.",
            "7. Family Deity- Shri Vishnu (Mercury is Eunuch planet so Mohini Swaroopa )"
        ],
        hi: [
            "१. पिता बहुत बुद्धिमान हैं।",
            "२. पिता ने जातक के जन्म के बाद कोई व्यवसाय शुरू किया होगा।",
            "३. पिता व्यापारिक मानसिकता वाले हैं।",
            "४. बहन/बेटी जन्म से ही दबंग होती है (यह पता लगाने का एक उपकरण हो सकता है कि कौन सी बेटी शुक्र/बुध/चंद्रमा है)।",
            "५. पड़ोसी/रिश्तेदार शक्तिशाली/राजनीति में/सरकारी नौकरी में हो सकते हैं।",
            "६. बाहरी व्यक्तित्व- उम्र से छोटा दिख सकता है, संचार कौशल अच्छा, बातूनी, मजाकिया स्वभाव, बचकाना व्यवहार (यदि शनि भी हो तो परिपक्व और लंबा चेहरा, बुद्धिमान), बुद्धिमान, आजीवन सीखने वाला, पढ़ने लिखने वाला बच्चा।",
            "७. कुल देवता- श्री विष्णु (बुध नपुंसक ग्रह है इसलिए मोहिनी स्वरूप)।"
        ]
    },
    "4-1": { // Mercury + Sun
        en: [
            "1. Father is very intelligent, Belongs to educated family.",
            "2. Father may have started a business before the birth of native.",
            "3. Father is business minded ; May even come from business family.",
            "4. Sister/ Daughter will become dominating after birth (Can be a tool to find which daughter is Ve/Me/Mo)",
            "5. Neighbours/ Relatives may become powerful/in politics/in govt. job.",
            "6. Native has skills to talk but mostly seen introvert kind of people, If they speak, they will shine.",
            "7. Education is good/person is intelligent."
        ],
        hi: [
            "१. पिता बहुत बुद्धिमान हैं, शिक्षित परिवार से हैं।",
            "२. पिता ने जातक के जन्म से पहले कोई व्यवसाय शुरू किया होगा।",
            "३. पिता व्यापारिक मानसिकता वाले हैं; व्यावसायिक परिवार से भी आ सकते हैं।",
            "४. बहन/बेटी जन्म के बाद दबंग बन जाएगी (यह पता लगाने का एक उपकरण हो सकता है कि कौन सी बेटी शुक्र/बुध/चंद्रमा है)।",
            "५. पड़ोसी/रिश्तेदार शक्तिशाली/राजनीति में/सरकारी नौकरी में बन सकते हैं।",
            "६. जातक में बात करने का कौशल है लेकिन ज्यादातर अंतर्मुखी प्रकार के लोग देखे जाते हैं, यदि वे बोलते हैं, तो वे चमकेंगे।",
            "७. शिक्षा अच्छी है/व्यक्ति बुद्धिमान है।"
        ]
    },
    "1-5": { // Sun + Jupiter
        en: [
            "1. Father and Native look alike, or habits are similar.",
            "2. Father became religious after birth of native.",
            "3. Father may have joined social work, institution after birth of native.",
            "4. Father has great wisdom.",
            "5. Native has ego, dominance from birth.",
            "6. Native belongs to a family that has name, fame and status.",
            "7. Outer Personality- Interest in Dhrama, Astrology, good deeds, Weight gain(specially if rahu is there), Look mature than age with wisdom.",
            "8. Good combination for male child",
            "9. Father may have a younger brother.",
            "10. Native can become spiritual, great astrologer, shine in life , good nose , appears fat but highly intelligent, consultant, teacher.",
            "11. Family Deity- Guru(Spiritual teacher), Shri Krishna(Krishnam Vande Jagatgurum…)"
        ],
        hi: [
            "१. पिता और जातक एक जैसे दिखते हैं, या आदतें समान हैं।",
            "२. जातक के जन्म के बाद पिता धार्मिक हो गए।",
            "३. पिता ने जातक के जन्म के बाद सामाजिक कार्य, संस्था में शामिल हुए होंगे।",
            "४. पिता के पास महान ज्ञान है।",
            "५. जातक में जन्म से ही अहंकार, प्रभुत्व होता है।",
            "६. जातक एक ऐसे परिवार से है जिसका नाम, प्रसिद्धि और प्रतिष्ठा है।",
            "७. बाहरी व्यक्तित्व- धर्म, ज्योतिष, अच्छे कर्मों में रुचि, वजन बढ़ना (विशेषकर यदि राहु हो), ज्ञान के साथ उम्र से अधिक परिपक्व दिखना।",
            "८. पुत्र संतान के लिए अच्छा संयोजन।",
            "९. पिता का एक छोटा भाई हो सकता है।",
            "१०. जातक आध्यात्मिक, महान ज्योतिषी बन सकता है, जीवन में चमक सकता है, अच्छी नाक, मोटा दिखाई देता है लेकिन अत्यधिक बुद्धिमान, सलाहकार, शिक्षक।",
            "११. कुल देवता- गुरु (आध्यात्मिक शिक्षक), श्री कृष्ण (कृष्णं वंदे जगद्गुरुम्…)।"
        ]
    },
    "5-1": { // Jupiter + Sun
        en: [
            "1. Father and Native look alike, or habits are similar.",
            "2. Father was already religious before the birth of native.",
            "3. Father was in social work, institution before birth of native.",
            "4. Father has great wisdom.",
            "5. Native gathers ego, dominance, attitude after birth due to social triggers.",
            "6. Native’s family gets name, fame and status after his/her birth.",
            "7. Intuition power strong(Jeev- Atma Sanyog)",
            "8. Jeev always looks upto the father and has secretive admiration for him and later on catches his habits and qualities.",
            "9. Native has strong desire to shine well (respect) in life, Just need to take care of ego, have positive attitude towards life, Management skills.",
            "10. With this combination it can be said that jeev is reborn in same family again."
        ],
        hi: [
            "१. पिता और जातक एक जैसे दिखते हैं, या आदतें समान हैं।",
            "२. जातक के जन्म से पहले ही पिता धार्मिक थे।",
            "३. जातक के जन्म से पहले पिता सामाजिक कार्य, संस्था में थे।",
            "४. पिता के पास महान ज्ञान है।",
            "५. जातक सामाजिक कारणों से जन्म के बाद अहंकार, प्रभुत्व, दृष्टिकोण इकट्ठा करता है।",
            "६. जातक के जन्म के बाद उसके परिवार को नाम, प्रसिद्धि और प्रतिष्ठा मिलती है।",
            "७. अंतर्ज्ञान शक्ति मजबूत (जीव-आत्मा संयोग)।",
            "८. जीव हमेशा पिता की ओर देखता है और उसके लिए गुप्त प्रशंसा रखता है और बाद में उसकी आदतों और गुणों को पकड़ लेता है।",
            "९. जातक की जीवन में अच्छी तरह से चमकने (सम्मान) की प्रबल इच्छा होती है, बस अहंकार का ध्यान रखने, जीवन के प्रति सकारात्मक दृष्टिकोण रखने, प्रबंधन कौशल की आवश्यकता होती है।",
            "१०. इस संयोजन से यह कहा जा सकता है कि जीव उसी परिवार में फिर से जन्म लेता है।"
        ]
    },
    "1-6": { // Sun + Venus
        en: [
            "1. Bhagyashali Santan- Father got prosperity(Finances) after native’s birth.",
            "2. Father/Son will be good looking and organized.",
            "3. Father has any fine art quality(Music, dance, acting etc.)",
            "4. Wife belongs to status family, wife will rule the house has ego, attitude and dominance even before marriage.",
            "5. Wife may belong to same cast/ Same city.",
            "6. Outer Personality- Comfort loving, Will order online rather than going out, show off, can be a good guide, artistic nature, Desire for money and luxuries.",
            "7. Soul wants to be center of attraction.",
            "8. When Venus’s degree is more than sun It is good for money.",
            "9. Person likes cleanliness, organized things.",
            "10. Can indicate eye-related issues.",
            "11. Family Deity- Lakshmi Maa"
        ],
        hi: [
            "१. भाग्यशाली संतान- जातक के जन्म के बाद पिता को समृद्धि (वित्त) मिली।",
            "२. पिता/पुत्र सुंदर और व्यवस्थित होंगे।",
            "३. पिता में कोई ललित कला गुण है (संगीत, नृत्य, अभिनय आदि)।",
            "४. पत्नी प्रतिष्ठित परिवार से है, पत्नी शादी से पहले भी अहंकार, दृष्टिकोण और प्रभुत्व के साथ घर पर शासन करेगी।",
            "५. पत्नी उसी जाति/उसी शहर की हो सकती है।",
            "६. बाहरी व्यक्तित्व- आराम पसंद, बाहर जाने के बजाय ऑनलाइन ऑर्डर करेगा, दिखावा करेगा, एक अच्छा मार्गदर्शक हो सकता है, कलात्मक स्वभाव, धन और विलासिता की इच्छा।",
            "७. आत्मा आकर्षण का केंद्र बनना चाहती है।",
            "८. जब शुक्र की डिग्री सूर्य से अधिक हो तो यह धन के लिए अच्छा है।",
            "९. व्यक्ति स्वच्छता, व्यवस्थित चीजें पसंद करता है।",
            "१०. आंखों से संबंधित समस्याएं हो सकती हैं।",
            "११. कुल देवी- लक्ष्मी माँ।"
        ]
    },
    "6-1": { // Venus + Sun
        en: [
            "1. Father has good financial status even before birth of native/ Belongs to a rich family, has all luxuries and comforts.",
            "2. Father/Son will be good looking and organized.",
            "3. Father has any fine art quality(Music, dance, acting etc.)",
            "4. Wife will get ego, attitude and dominance after marriage due to social triggers.",
            "5. Wife may belong to same cast/ Same city.",
            "6. Atma has crossed venus , So in this life person should seek moksha or liberation, if still desires for materialistic things will not be happy even if he/she gets all luxuries and finances.",
            "7. Money would go in form of heavy expenses; you will not get happiness from money.",
            "8. Can indicate eye-related issues."
        ],
        hi: [
            "१. जातक के जन्म से पहले भी पिता की आर्थिक स्थिति अच्छी है/एक अमीर परिवार से है, सभी विलासिता और आराम हैं।",
            "२. पिता/पुत्र सुंदर और व्यवस्थित होंगे।",
            "३. पिता में कोई ललित कला गुण है (संगीत, नृत्य, अभिनय आदि)।",
            "४. सामाजिक कारणों से पत्नी में विवाह के बाद अहंकार, दृष्टिकोण और प्रभुत्व आएगा।",
            "५. पत्नी उसी जाति/उसी शहर की हो सकती है।",
            "६. आत्मा ने शुक्र को पार कर लिया है, इसलिए इस जीवन में व्यक्ति को मोक्ष या मुक्ति की तलाश करनी चाहिए, यदि फिर भी भौतिकवादी चीजों की इच्छा रखता है तो सभी विलासिता और वित्त प्राप्त होने पर भी खुश नहीं होगा।",
            "७. पैसा भारी खर्च के रूप में जाएगा; आपको पैसे से खुशी नहीं मिलेगी।",
            "८. आंखों से संबंधित समस्याएं हो सकती हैं।"
        ]
    },
    "1-7": { // Sun + Saturn
        en: [
            "1. Father faced obstacles , problems after birth of native.",
            "2. Profession of native may be inspired by father.",
            "3. Native may continue father’s business/profession or may do something of his/her father’s will.",
            "4. Elder brother has ego, dominance from his birth.",
            "5. Father and elder brother may look alike, or habits may be similar.",
            "6. Outer Personality: Mature, Struggle full life that makes you mature, Long face, looks mature than age(Old Head on Young Shoulders).",
            "7. Native gets everything by effort and struggle, Disciplined, Justice lovers, Strong Determination, Slow and careful workers, takes responsibility.",
            "8. Bones may have pain, Ill heath to father.",
            "9. Family Deity- Shiv Ji / Rudra Dev"
        ],
        hi: [
            "१. जातक के जन्म के बाद पिता को बाधाओं, समस्याओं का सामना करना पड़ा।",
            "२. जातक का पेशा पिता से प्रेरित हो सकता है।",
            "३. जातक पिता के व्यवसाय/पेशे को जारी रख सकता है या अपने पिता की इच्छा का कुछ कर सकता है।",
            "४. बड़े भाई में जन्म से ही अहंकार, प्रभुत्व होता है।",
            "५. पिता और बड़ा भाई एक जैसे दिख सकते हैं, या आदतें समान हो सकती हैं।",
            "६. बाहरी व्यक्तित्व: परिपक्व, संघर्षपूर्ण जीवन जो आपको परिपक्व बनाता है, लंबा चेहरा, उम्र से अधिक परिपक्व दिखता है (ओल्ड हेड ऑन यंग शोल्डर्स)।",
            "७. जातक प्रयास और संघर्ष से सब कुछ प्राप्त करता है, अनुशासित, न्याय प्रेमी, मजबूत दृढ़ संकल्प, धीमे और सावधान कार्यकर्ता, जिम्मेदारी लेता है।",
            "८. हड्डियों में दर्द हो सकता है, पिता को अस्वस्थता हो सकती है।",
            "९. कुल देवता- शिव जी / रुद्र देव।"
        ]
    },
    "7-1": { // Saturn + Sun
        en: [
            "1. Father faced obstacles , problems before birth of native.",
            "2. Profession of native may be related to government(Govt. Job), will get name, fame, top position in profession",
            "3. Native may continue father’s business/profession or may do something of his/her father’s will.",
            "4. Elder brother has ego, dominance after birth of native.",
            "5. Father and elder brother may look alike, or habits may be similar.",
            "6. Soul is carrying impressions of hardships, struggles and challenges faced in past life so such a person becomes mature earlier than age.",
            "7. Shine well in profession.(Unsatisfied with low paid job)"
        ],
        hi: [
            "१. जातक के जन्म से पहले पिता को बाधाओं, समस्याओं का सामना करना पड़ा।",
            "२. जातक का पेशा सरकार से संबंधित हो सकता है (सरकारी नौकरी), पेशे में नाम, प्रसिद्धि, शीर्ष स्थान प्राप्त होगा।",
            "३. जातक पिता के व्यवसाय/पेशे को जारी रख सकता है या अपने पिता की इच्छा का कुछ कर सकता है।",
            "४. जातक के जन्म के बाद बड़े भाई में अहंकार, प्रभुत्व होता है।",
            "५. पिता और बड़ा भाई एक जैसे दिख सकते हैं, या आदतें समान हो सकती हैं।",
            "६. आत्मा पिछले जीवन में सामना की गई कठिनाइयों, संघर्षों और चुनौतियों के संस्कार लेकर आई है, इसलिए ऐसा व्यक्ति उम्र से पहले परिपक्व हो जाता है।",
            "७. पेशे में अच्छी तरह से चमकना। (कम वेतन वाली नौकरी से असंतुष्ट)"
        ]
    },
    "1-8": { // Sun + Rahu
        en: [
            "1. Father faced obstacles , problems after birth of native.",
            "2. Father is a daydreamer, lives in illusion",
            "3. Father may start something new; the venture will have problems in beginning but later does good.",
            "4. Father and grandfather look alike.(If Ju also there , three of them)",
            "5. Native may have issues/conflicts with father",
            "6. Native will have trouble in having a male progeny, if it did happen the health of the child must be taken care of.",
            "7. Dadi- Dadi has name , fame and status.",
            "8. Outer Personality: Hide true identity, Looks innocent, very diplomatic, clever, intelligent, Innovative, Media , Jugadoo ,Wants Name/Fame , Can manipulate and have a masked personality, good politicians, Can become spiritual and have a constent seeking for “Who Am I”",
            "9. Can lead to digestive system problems (acidity, indigestion).",
            "10. Family Deity: Kaal Bhairav"
        ],
        hi: [
            "१. जातक के जन्म के बाद पिता को बाधाओं, समस्याओं का सामना करना पड़ा।",
            "२. पिता दिवास्वप्न देखते हैं, भ्रम में रहते हैं।",
            "३. पिता कुछ नया शुरू कर सकते हैं; उद्यम को शुरुआत में समस्याएं होंगी लेकिन बाद में अच्छा करेगा।",
            "४. पिता और दादा एक जैसे दिखते हैं। (यदि बृहस्पति भी हो, तो तीनों)",
            "५. जातक के पिता के साथ मुद्दे/संघर्ष हो सकते हैं।",
            "६. जातक को पुत्र संतान प्राप्त करने में परेशानी होगी, यदि ऐसा हुआ तो बच्चे के स्वास्थ्य का ध्यान रखना होगा।",
            "७. दादी- दादी का नाम, प्रसिद्धि और प्रतिष्ठा है।",
            "८. बाहरी व्यक्तित्व: सच्ची पहचान छिपाना, निर्दोष दिखना, बहुत कूटनीतिक, चालाक, बुद्धिमान, अभिनव, मीडिया, जुगाड़ू, नाम/प्रसिद्धि चाहता है, हेरफेर कर सकता है और एक नकाबपोश व्यक्तित्व रख सकता है, अच्छा राजनेता, आध्यात्मिक बन सकता है और “मैं कौन हूँ” की निरंतर खोज कर सकता है।",
            "९. पाचन तंत्र की समस्याएं (एसिडिटी, अपच) हो सकती हैं।",
            "१०. कुल देवता: काल भैरव।"
        ]
    },
    "8-1": { // Rahu + Sun
        en: [
            "1. Father faced obstacles , problems before birth of native.",
            "2. Father is a daydreamer, lives in illusion(May change if next planet is good)",
            "3. Father started something new before birth of native the venture had problems in beginning but later did good.",
            "4. Father and grandfather look alike.(If Ju also there , three of them)",
            "5. Native may have issues/conflicts with father",
            "6. Atma has crossed Maya, Good combination for spirituality.",
            "7. Trouble before or in birth of male progeny.",
            "8. Can lead to digestive system problems (acidity, indigestion)."
        ],
        hi: [
            "१. जातक के जन्म से पहले पिता को बाधाओं, समस्याओं का सामना करना पड़ा।",
            "२. पिता दिवास्वप्न देखते हैं, भ्रम में रहते हैं (यदि अगला ग्रह अच्छा हो तो बदल सकता है)।",
            "३. जातक के जन्म से पहले पिता ने कुछ नया शुरू किया, उद्यम को शुरुआत में समस्याएं थीं लेकिन बाद में अच्छा हुआ।",
            "४. पिता और दादा एक जैसे दिखते हैं। (यदि बृहस्पति भी हो, तो तीनों)",
            "५. जातक के पिता के साथ मुद्दे/संघर्ष हो सकते हैं।",
            "६. आत्मा ने माया को पार कर लिया है, आध्यात्मिकता के लिए अच्छा संयोजन।",
            "७. पुत्र संतान के जन्म से पहले या जन्म के समय परेशानी।",
            "८. पाचन तंत्र की समस्याएं (एसिडिटी, अपच) हो सकती हैं।"
        ]
    },
    "1-9": { // Sun + Ketu
        en: [
            "1. Father faced obstacles , problems after birth of native.",
            "2. Father may be the youngest child , no further siblings after birth of father.",
            "3. Father has lifelong tension, worry.",
            "4. Father may be spiritual and like a yogi.",
            "5. If Son is born as the first child, problem in getting second child.",
            "6. Nana- Nani has name, fame and status already.",
            "7. Outer personality: Introvert, Like a Yogi, Spiritual, Argumentative, Sometimes acts headless, goes in root of everything, May have beard,Migrane",
            "8. Pitta more(Acidity), Hastiness, isolation, always seek support , person feels deep emptiness within.",
            "9. Sun Always wanted ketu (Atma wants moksha)",
            "10. Family Deity- Ganesh Ji"
        ],
        hi: [
            "१. जातक के जन्म के बाद पिता को बाधाओं, समस्याओं का सामना करना पड़ा।",
            "२. पिता सबसे छोटे बच्चे हो सकते हैं, पिता के जन्म के बाद कोई और भाई-बहन नहीं।",
            "३. पिता को आजीवन तनाव, चिंता रहती है।",
            "४. पिता आध्यात्मिक और योगी की तरह हो सकते हैं।",
            "५. यदि पुत्र पहला बच्चा है, तो दूसरा बच्चा होने में समस्या।",
            "६. नाना-नानी का पहले से ही नाम, प्रसिद्धि और प्रतिष्ठा है।",
            "७. बाहरी व्यक्तित्व: अंतर्मुखी, एक योगी की तरह, आध्यात्मिक, तर्कशील, कभी-कभी बिना सोचे-समझे काम करता है, हर चीज की जड़ में जाता है, दाढ़ी हो सकती है, माइग्रेन।",
            "८. पित्त अधिक (अम्लता), जल्दबाजी, अलगाव, हमेशा समर्थन चाहता है, व्यक्ति भीतर गहरी शून्यता महसूस करता है।",
            "९. सूर्य हमेशा केतु चाहता था (आत्मा मोक्ष चाहती है)।",
            "१०. कुल देवता- गणेश जी।"
        ]
    },
    "9-1": { // Ketu + Sun
        en: [
            "1. Father faced obstacles , problems before birth of native.",
            "2. There may be a miscarriage/mishappening before birth of father/son.",
            "3. Father has lifelong tension, worry.(may change if next planet is good)",
            "4. Father may be spiritual and like a yogi.",
            "5. Wife may encounter a miscarriage before birth of male progeny.",
            "6. Nana- Nani got name, fame and status after native’s birth.",
            "7. Dwaj Kirti Yog – Good for govt.job, if Saturn is involved.",
            "8. Atma has memories of spirtuality and efforts for liberation done in past life, person is spiritual from birth."
        ],
        hi: [
            "१. जातक के जन्म से पहले पिता को बाधाओं, समस्याओं का सामना करना पड़ा।",
            "२. पिता/पुत्र के जन्म से पहले गर्भपात/अप्रिय घटना हो सकती है।",
            "३. पिता को आजीवन तनाव, चिंता रहती है (यदि अगला ग्रह अच्छा हो तो बदल सकता है)।",
            "४. पिता आध्यात्मिक और योगी की तरह हो सकते हैं।",
            "५. पत्नी को पुत्र संतान के जन्म से पहले गर्भपात का सामना करना पड़ सकता है।",
            "६. जातक के जन्म के बाद नाना-नानी को नाम, प्रसिद्धि और प्रतिष्ठा मिली।",
            "७. ध्वज कीर्ति योग - सरकारी नौकरी के लिए अच्छा है, यदि शनि शामिल हो।",
            "८. आत्मा में पिछले जन्म में किए गए आध्यात्मिकता और मुक्ति के प्रयासों की यादें हैं, व्यक्ति जन्म से आध्यात्मिक है।"
        ]
    },

    // == MOON Combinations (Planet ID: 2) ==
    "2-3": { // Moon + Mars
        en: [
            "1. Mother will face accident/ surgery in her lifetime.",
            "2. Mother will be dominating, rough, harsh, uses foul language, courageous.",
            "3. Husband may come from a distant place.",
            "4. Brother/Husband will be caring and nurturing.",
            "5. If this combination is there in male chart , the person has tendency to see women with wrong intentions.(don’t take anything too seriously aspects, conjunctions change a lot of things)",
            "6. Milk boils and falls in house, arguments while eating food, Water storage near gas burner.",
            "7. Mind is aggressive, and person is very reactive, they will act first and later think they did wrong or right.",
            "8. Problem in uterus , breast for female.",
            "9. Don’t keep Geyser open if you have this combination.",
            "10. Physical activity is must."
        ],
        hi: [
            "१. माँ को अपने जीवनकाल में दुर्घटना/सर्जरी का सामना करना पड़ेगा।",
            "२. माँ दबंग, खुरदरी, कठोर होंगी, अभद्र भाषा का प्रयोग करेंगी, साहसी होंगी।",
            "३. पति दूर स्थान से आ सकता है।",
            "४. भाई/पति देखभाल करने वाला और पोषण करने वाला होगा।",
            "५. यदि यह संयोजन पुरुष कुंडली में है, तो व्यक्ति की महिलाओं को गलत इरादों से देखने की प्रवृत्ति होती है (किसी भी चीज को बहुत गंभीरता से न लें, पहलू, संयोजन बहुत सी चीजें बदलते हैं)।",
            "६. घर में दूध उबलकर गिरता है, खाना खाते समय बहस, गैस बर्नर के पास पानी का भंडारण।",
            "७. मन आक्रामक है, और व्यक्ति बहुत प्रतिक्रियाशील है, वे पहले कार्य करेंगे और बाद में सोचेंगे कि उन्होंने गलत किया या सही।",
            "८. महिला के लिए गर्भाशय, स्तन में समस्या।",
            "९. यदि आपके पास यह संयोजन है तो गीजर खुला न रखें।",
            "१०. शारीरिक गतिविधि आवश्यक है।"
        ]
    },
    "3-2": { // Mars + Moon
        en: [
            "1. Mother faced accident/ surgery before birth of native or native may have born due to surgery or C-section. There can be a mark on mother’s or daughter’s face.",
            "2. Mother will become dominating, rough, harsh, uses foul language, courageous.",
            "3. Husband may have to undergo change after marriage, like city change, country change, home change, job change etc., or female may have to marry at a place away from birthplace.",
            "4. Brother/Husband will be caring and nurturing.",
            "5. If this combination is there in male chart , the person has tendency to see women with wrong intentions.(don’t take anything too seriously aspects, conjunctions change a lot of things)",
            "6. Husband is very fond of his mother, only problem in female chart, also husband has fluctuating nature, may travel a lot.",
            "7. Native may have agricultural land, gets ancestral property.",
            "8. Native is very protective towards mother.",
            "9. Overreactive and impulsive.",
            "10. Brother/ Husband may have addictions or may encounter blames(not necessarily, question matters)"
        ],
        hi: [
            "१. जातक के जन्म से पहले माँ को दुर्घटना/सर्जरी का सामना करना पड़ा या जातक का जन्म सर्जरी या सी-सेक्शन के कारण हुआ हो सकता है। माँ या बेटी के चेहरे पर निशान हो सकता है।",
            "२. माँ दबंग, खुरदरी, कठोर बन जाएगी, अभद्र भाषा का प्रयोग करेगी, साहसी होगी।",
            "३. पति को शादी के बाद बदलाव से गुजरना पड़ सकता है, जैसे शहर बदलना, देश बदलना, घर बदलना, नौकरी बदलना आदि, या महिला को जन्मस्थान से दूर किसी स्थान पर शादी करनी पड़ सकती है।",
            "४. भाई/पति देखभाल करने वाला और पोषण करने वाला होगा।",
            "५. यदि यह संयोजन पुरुष कुंडली में है, तो व्यक्ति की महिलाओं को गलत इरादों से देखने की प्रवृत्ति होती है (किसी भी चीज को बहुत गंभीरता से न लें, पहलू, संयोजन बहुत सी चीजें बदलते हैं)।",
            "६. पति अपनी माँ का बहुत शौकीन होता है, केवल महिला कुंडली में समस्या, पति का स्वभाव भी अस्थिर होता है, बहुत यात्रा कर सकता है।",
            "७. जातक के पास कृषि भूमि हो सकती है, पैतृक संपत्ति मिलती है।",
            "८. जातक माँ के प्रति बहुत सुरक्षात्मक होता है।",
            "९. अतिप्रतिक्रियाशील और आवेगी।",
            "१०. भाई/पति को लत लग सकती है या दोषों का सामना करना पड़ सकता है (जरूरी नहीं, प्रश्न मायने रखता है)।"
        ]
    },
    "2-4": { // Moon + Mercury
        en: [
            "1. Mother is very intelligent.",
            "2. Mother may become businesswomen after birth of native.",
            "3. Sister/Daughter will have good thoughts and well educated",
            "4. Native has elephant memory.(Cannot forget anything). - If moon is afflicted will forget things.",
            "5. Native faces changes in education beyond his control.(Moon is behind)",
            "6. Native is born to be cheated, will not get money back if given to friend, relatives, gets cheated in relationship, business partnership(Kapat Yog)",
            "7. If this combination is afflicted by Rahu, Ketu , person has unknown fears and faces phobia , depression, forgets things.",
            "8. Sleep is disturbed, and person keeps thinking.",
            "9. Can indicate skin issues or allergies.",
            "10. Bhola Yog or Kapat Yog"
        ],
        hi: [
            "१. माँ बहुत बुद्धिमान है।",
            "२. जातक के जन्म के बाद माँ व्यवसायी बन सकती है।",
            "३. बहन/बेटी के विचार अच्छे होंगे और वह सुशिक्षित होगी।",
            "४. जातक की याददाश्त हाथी जैसी होती है (कुछ भी नहीं भूल सकता)। - यदि चंद्रमा पीड़ित हो तो चीजें भूल जाएगा।",
            "५. जातक अपने नियंत्रण से बाहर शिक्षा में बदलाव का सामना करता है (चंद्रमा पीछे है)।",
            "६. जातक धोखा खाने के लिए पैदा हुआ है, दोस्त, रिश्तेदारों को दिया गया पैसा वापस नहीं मिलेगा, रिश्ते, व्यापार साझेदारी में धोखा मिलता है (कपट योग)।",
            "७. यदि यह संयोजन राहु, केतु से पीड़ित है, तो व्यक्ति को अज्ञात भय होता है और फोबिया, अवसाद का सामना करना पड़ता है, चीजें भूल जाता है।",
            "८. नींद में खलल पड़ता है, और व्यक्ति सोचता रहता है।",
            "९. त्वचा की समस्याएं या एलर्जी का संकेत दे सकता है।",
            "१०. भोला योग या कपट योग।"
        ]
    },
    "4-2": { // Mercury + Moon
        en: [
            "1. Mother is very intelligent.",
            "2. Mother may be a businesswomen even before birth of native.",
            "3. Sister/Daughter will have good thoughts and well educated, born intelligent",
            "4. Native has elephant memory.(Cannot forget anything). - If moon is afflicted will forget things.",
            "5. Native faces changes in education with choice.(Moon is ahead), Can study psychology and do business related to food, tours and travel company.",
            "6. Native is born to be cheated, will not get money back if given to friend, relatives, gets cheated in relationship, business partnership(Kapat Yog)",
            "7. Hard for native to concentrate on studies as moon is fluctuations, but can study Psychology, Auditing , Economics, Marketing, Numerology well.",
            "8. Should not make transactions of money to people just on trust basis.",
            "9. Can indicate skin issues or allergies."
        ],
        hi: [
            "१. माँ बहुत बुद्धिमान है।",
            "२. जातक के जन्म से पहले भी माँ व्यवसायी हो सकती है।",
            "३. बहन/बेटी के विचार अच्छे होंगे और वह सुशिक्षित, जन्म से बुद्धिमान होगी।",
            "४. जातक की याददाश्त हाथी जैसी होती है (कुछ भी नहीं भूल सकता)। - यदि चंद्रमा पीड़ित हो तो चीजें भूल जाएगा।",
            "५. जातक अपनी पसंद से शिक्षा में बदलाव का सामना करता है (चंद्रमा आगे है), मनोविज्ञान का अध्ययन कर सकता है और भोजन, पर्यटन और यात्रा कंपनी से संबंधित व्यवसाय कर सकता है।",
            "६. जातक धोखा खाने के लिए पैदा हुआ है, दोस्त, रिश्तेदारों को दिया गया पैसा वापस नहीं मिलेगा, रिश्ते, व्यापार साझेदारी में धोखा मिलता है (कपट योग)।",
            "७. जातक के लिए पढ़ाई पर ध्यान केंद्रित करना कठिन है क्योंकि चंद्रमा उतार-चढ़ाव वाला है, लेकिन मनोविज्ञान, लेखा परीक्षा, अर्थशास्त्र, विपणन, अंकशास्त्र का अच्छी तरह से अध्ययन कर सकता है।",
            "८. लोगों को केवल भरोसे के आधार पर पैसे का लेन-देन नहीं करना चाहिए।",
            "९. त्वचा की समस्याएं या एलर्जी का संकेत दे सकता है।"
        ]
    },
    "2-5": { // Moon + Jupiter
        en: [
            "1. Mother is very intelligent and has wisdom.",
            "2. Mother and native look alike, habits may be similar.",
            "3. Mother may be a social worker, joined a social group after birth of native.",
            "4. Mother is religious and pious.",
            "5. Native has flickering mind, changes in life beyond control, travels.",
            "6. Native is a good person, caring and nurturing has good thoughts.",
            "7. Native is fond of dairy products and sweets.",
            "8. Native’s family may have encountered a change before his/her birth."
        ],
        hi: [
            "१. माँ बहुत बुद्धिमान है और उसमें ज्ञान है।",
            "२. माँ और जातक एक जैसे दिखते हैं, आदतें समान हो सकती हैं।",
            "३. माँ एक सामाजिक कार्यकर्ता हो सकती है, जातक के जन्म के बाद एक सामाजिक समूह में शामिल हुई।",
            "४. माँ धार्मिक और पवित्र है।",
            "५. जातक का मन चंचल होता है, जीवन में नियंत्रण से बाहर परिवर्तन होते हैं, यात्राएं होती हैं।",
            "६. जातक एक अच्छा व्यक्ति है, देखभाल करने वाला और पोषण करने वाला है, अच्छे विचार रखता है।",
            "७. जातक डेयरी उत्पादों और मिठाइयों का शौकीन है।",
            "८. जातक के जन्म से पहले उसके परिवार में कोई बदलाव आया होगा।"
        ]
    },
    "5-2": { // Jupiter + Moon
        en: [
            "1. Mother is very intelligent and has wisdom.",
            "2. Mother and native look alike, habits may be similar.",
            "3. Mother may be a social worker, joined a social group before birth of native.",
            "4. Mother is religious and pious.",
            "5. Native has flickering mind, changes in life by will, travels.",
            "6. Native is a good person, caring and nurturing has good thoughts.",
            "7. Native is fond of dairy products and sweets.",
            "8. Native’s family may have encountered a change after his/her birth.",
            "9. Person gets cheated, get blames, Something very dear that belongs to you is taken away,(Shri Ram had this combination)",
            "10. Food distribution is good for them.",
            "11. Living place changes.",
            "12. Native can accumulate fat, emotional, mood swings, empathetic."
        ],
        hi: [
            "१. माँ बहुत बुद्धिमान है और उसमें ज्ञान है।",
            "२. माँ और जातक एक जैसे दिखते हैं, आदतें समान हो सकती हैं।",
            "३. माँ एक सामाजिक कार्यकर्ता हो सकती है, जातक के जन्म से पहले एक सामाजिक समूह में शामिल हुई।",
            "४. माँ धार्मिक और पवित्र है।",
            "५. जातक का मन चंचल होता है, इच्छा से जीवन में परिवर्तन होते हैं, यात्राएं होती हैं।",
            "६. जातक एक अच्छा व्यक्ति है, देखभाल करने वाला और पोषण करने वाला है, अच्छे विचार रखता है।",
            "७. जातक डेयरी उत्पादों और मिठाइयों का शौकीन है।",
            "८. जातक के जन्म के बाद उसके परिवार में कोई बदलाव आया होगा।",
            "९. व्यक्ति धोखा खाता है, दोषारोपण होता है, आपकी कोई बहुत प्रिय वस्तु छीन ली जाती है (श्री राम के पास यह संयोजन था)।",
            "१०. भोजन वितरण उनके लिए अच्छा है।",
            "११. रहने की जगह बदलती है।",
            "१२. जातक मोटा हो सकता है, भावुक, मिजाज में बदलाव, सहानुभूतिपूर्ण।"
        ]
    },
    "2-6": { // Moon + Venus
        en: [
            "1. Mother is good looking, organized, money minded, may have fine arts qualities",
            "2. Mother will get finances, luxuries, comforts after birth of native.",
            "3. Wife may have encountered changes in her life before marriage.",
            "4. Wife may have an elder sister, or she may come from a place near water.",
            "5. Mother may have a younger sister",
            "6. Wife will overpower mother(Ve degree is ahead of Mo)",
            "7. Wife, Mother or females in house suffers from ill health.",
            "8. Uterus , Fibroid related issues in females.",
            "9. This combination can be related to hormonal imbalances or diabetes, especially if afflicted.",
            "10. Bedroom should not have water source, water depicting painting."
        ],
        hi: [
            "१. माँ सुंदर, व्यवस्थित, पैसे वाली, ललित कलाओं के गुण हो सकते हैं।",
            "२. जातक के जन्म के बाद माँ को वित्त, विलासिता, आराम मिलेगा।",
            "३. पत्नी ने शादी से पहले अपने जीवन में बदलावों का सामना किया होगा।",
            "४. पत्नी की एक बड़ी बहन हो सकती है, या वह पानी के पास किसी स्थान से आ सकती है।",
            "५. माँ की एक छोटी बहन हो सकती है।",
            "६. पत्नी माँ पर हावी होगी (शुक्र की डिग्री चंद्रमा से आगे है)।",
            "७. पत्नी, माँ या घर में महिलाओं को अस्वस्थता का सामना करना पड़ता है।",
            "८. महिलाओं में गर्भाशय, फाइब्रॉएड संबंधी समस्याएं।",
            "९. यह संयोजन हार्मोनल असंतुलन या मधुमेह से संबंधित हो सकता है, खासकर यदि पीड़ित हो।",
            "१०. शयनकक्ष में पानी का स्रोत, पानी दर्शाने वाला चित्र नहीं होना चाहिए।"
        ]
    },
    "6-2": { // Venus + Moon
        en: [
            "1. Mother is good looking, organized, money minded, may have fine arts qualities",
            "2. Mother already has finances, luxuries, comforts before birth of native.",
            "3. Wife will bring changes in life after marriage(travel, city change, job change etc.).",
            "4. Money will drain out like water.",
            "5. No savings but money comes when needed but drained out like water.",
            "6. Mother will overpower Wife(Mo degree is ahead of Ve)",
            "7. Wife, Mother or females in house suffers from ill health.",
            "8. This combination can be related to hormonal imbalances or diabetes, especially if afflicted.",
            "9. Bedroom should not have water source, water depicting painting.",
            "10. Loan gets recovered in long time, should not lend or borrow.",
            "11. Late Marriage in Male chart(Based on my observation in charts)."
        ],
        hi: [
            "१. माँ सुंदर, व्यवस्थित, पैसे वाली, ललित कलाओं के गुण हो सकते हैं।",
            "२. जातक के जन्म से पहले ही माँ के पास वित्त, विलासिता, आराम है।",
            "३. पत्नी शादी के बाद जीवन में बदलाव लाएगी (यात्रा, शहर बदलना, नौकरी बदलना आदि)।",
            "४. पैसा पानी की तरह बह जाएगा।",
            "५. कोई बचत नहीं लेकिन जरूरत पड़ने पर पैसा आता है लेकिन पानी की तरह बह जाता है।",
            "६. माँ पत्नी पर हावी होगी (चंद्रमा की डिग्री शुक्र से आगे है)।",
            "७. पत्नी, माँ या घर में महिलाओं को अस्वस्थता का सामना करना पड़ता है।",
            "८. यह संयोजन हार्मोनल असंतुलन या मधुमेह से संबंधित हो सकता है, खासकर यदि पीड़ित हो।",
            "९. शयनकक्ष में पानी का स्रोत, पानी दर्शाने वाला चित्र नहीं होना चाहिए।",
            "१०. ऋण लंबे समय में वसूल होता है, उधार नहीं देना चाहिए।",
            "११. पुरुष कुंडली में देर से विवाह (चार्ट में मेरे अवलोकन के आधार पर)।"
        ]
    },
    "2-7": { // Moon + Saturn
        en: [
            "1. Mother faced problems, obstacles after birth of native.",
            "2. Mother may be professionally active, strict, burdensome life.",
            "3. Profession may be inspired by moon(Food, travels, economics , psychology etc.)",
            "4. Mother is hardworking .",
            "5. Mind feels like it is stuck, and person feels that he/she is not able to move forward in life.(depression)",
            "6. Frequent cold and cough, asthma etc.",
            "7. In Nadi Astrology Saturn is Shivamsha and Moon Is Parvatiamsha , so it forms Chandra Mouleshwar Yoga(Ke should be there also).",
            "8. These people have Vish Yog or Vishdhar Yoga , can feel depressed often but takes away depression of others(Good counselors or healers)",
            "9. Moon is thoughts , Saturn is boundary/limitation- So often depression, but can be attracted to Philosophies of Swami Vivekananda, Gurus…",
            "10. Practical thoughts , Research, Isolation, Astrology, deep thoughts.",
            "11. Northwest side has store, dustbin,clutter."
        ],
        hi: [
            "१. जातक के जन्म के बाद माँ को समस्याओं, बाधाओं का सामना करना पड़ा।",
            "२. माँ पेशेवर रूप से सक्रिय, सख्त, बोझिल जीवन जी सकती है।",
            "३. पेशा चंद्रमा से प्रेरित हो सकता है (भोजन, यात्रा, अर्थशास्त्र, मनोविज्ञान आदि)।",
            "४. माँ मेहनती है।",
            "५. मन फंसा हुआ महसूस करता है, और व्यक्ति महसूस करता है कि वह जीवन में आगे नहीं बढ़ पा रहा है (अवसाद)।",
            "६. बार-बार सर्दी और खांसी, अस्थमा आदि।",
            "७. नाडी ज्योतिष में शनि शिवांश है और चंद्रमा पार्वतीश है, इसलिए यह चंद्र मौलेश्वर योग बनाता है (केतु भी होना चाहिए)।",
            "८. इन लोगों में विष योग या विषधर योग होता है, अक्सर उदास महसूस कर सकते हैं लेकिन दूसरों के अवसाद को दूर करते हैं (अच्छे परामर्शदाता या उपचारक)।",
            "९. चंद्रमा विचार है, शनि सीमा/सीमा है- इसलिए अक्सर अवसाद, लेकिन स्वामी विवेकानंद, गुरुओं के दर्शन की ओर आकर्षित हो सकते हैं…",
            "१०. व्यावहारिक विचार, अनुसंधान, अलगाव, ज्योतिष, गहरे विचार।",
            "११. उत्तर-पश्चिम दिशा में स्टोर, कूड़ेदान, अव्यवस्था है।"
        ]
    },
    "7-2": { // Saturn + Moon
        en: [
            "1. Mother faced problems, obstacles before birth of native.",
            "2. Mother may be professionally active before birth of native.",
            "3. Profession may be related to moon(Food, travels, economics , psychology , designers, singers, artist, sketching , natural talent etc.)",
            "4. Mother is hardworking .",
            "5. Frequent Changes/ transfers in career , cannot stay in one job/career for long.",
            "6. Frequent cold and cough, asthma etc.",
            "7. Born near a shiv mandir, Chandra mouleshwar yoga, Shiv Bhakt",
            "8. Great Counselors and healers(Vishdhar yoga)",
            "9. Seepage of water in house, Asthma to anyone in house(mother or native also can have).",
            "10. Eats old food, fasting , cold food",
            "11. Elder brother may be food donator, in food business, service to mother.",
            "12. Irritated by noise(high frequnency), blames at work."
        ],
        hi: [
            "१. जातक के जन्म से पहले माँ को समस्याओं, बाधाओं का सामना करना पड़ा।",
            "२. जातक के जन्म से पहले माँ पेशेवर रूप से सक्रिय हो सकती है।",
            "३. पेशा चंद्रमा से संबंधित हो सकता है (भोजन, यात्रा, अर्थशास्त्र, मनोविज्ञान, डिजाइनर, गायक, कलाकार, स्केचिंग, प्राकृतिक प्रतिभा आदि)।",
            "४. माँ मेहनती है।",
            "५. करियर में बार-बार बदलाव/तबादले, एक नौकरी/करियर में लंबे समय तक नहीं रह सकते।",
            "६. बार-बार सर्दी और खांसी, अस्थमा आदि।",
            "७. शिव मंदिर के पास जन्म, चंद्र मौलेश्वर योग, शिव भक्त।",
            "८. महान परामर्शदाता और उपचारक (विषधर योग)।",
            "९. घर में पानी का रिसाव, घर में किसी को अस्थमा (माँ या जातक को भी हो सकता है)।",
            "१०. बासी भोजन, उपवास, ठंडा भोजन खाता है।",
            "११. बड़ा भाई भोजन दाता, खाद्य व्यवसाय में, माँ की सेवा करने वाला हो सकता है।",
            "१२. शोर (उच्च आवृत्ति) से चिढ़, काम पर दोषारोपण।"
        ]
    },
    "2-8": { // Moon + Rahu
        en: [
            "1. Mother faced problems, obstacles after birth of native, she overcomes later.",
            "2. Mind lives in daydreaming, always in illusions.(Can be said for mother also)",
            "3. Mind is very intuitive .",
            "4. Native does over expenses; money does not stay.",
            "5. Paternal grandparents migrated from distant place.",
            "6. Mother is homemaker, may be less educated but will always care for family.",
            "7. Moon is Mind and Rahu is Observer – Great Observation, what you see is what you become.",
            "8. Always in doubt, unknown fear , phobia.",
            "9. Good combination for foreign travel, Wholesale business, Grocery store, online Food business(Remember Saturn is profession, so they should connect to Saturn)",
            "10. Can be affected by paranormal energies.",
            "11. Physic Abilities, Sea journey , Water phobia, OCD, Chemical, overeating",
            "12. Avoid Blue colour.",
            "13. Problem in breasts , chest area."
        ],
        hi: [
            "१. जातक के जन्म के बाद माँ को समस्याओं, बाधाओं का सामना करना पड़ा, वह बाद में उन पर काबू पाती है।",
            "२. मन दिवास्वप्न में रहता है, हमेशा भ्रम में रहता है (माँ के लिए भी कहा जा सकता है)।",
            "३. मन बहुत सहज है।",
            "४. जातक अधिक खर्च करता है; पैसा नहीं टिकता।",
            "५. दादा-दादी दूर स्थान से आकर बसे थे।",
            "६. माँ गृहिणी है, कम पढ़ी-लिखी हो सकती है लेकिन हमेशा परिवार की देखभाल करेगी।",
            "७. चंद्रमा मन है और राहु प्रेक्षक है - महान अवलोकन, जो आप देखते हैं वही आप बनते हैं।",
            "८. हमेशा संदेह में, अज्ञात भय, फोबिया।",
            "९. विदेश यात्रा, थोक व्यापार, किराना स्टोर, ऑनलाइन खाद्य व्यवसाय के लिए अच्छा संयोजन (याद रखें शनि पेशा है, इसलिए उन्हें शनि से जुड़ना चाहिए)।",
            "१०. अपसामान्य ऊर्जाओं से प्रभावित हो सकता है।",
            "११. मानसिक क्षमताएं, समुद्री यात्रा, जल भय, ओसीडी, रसायन, अधिक भोजन।",
            "१२. नीले रंग से बचें।",
            "१३. स्तनों, छाती क्षेत्र में समस्या।"
        ]
    },
    "8-2": { // Rahu + Moon
        en: [
            "1. Mother faced problems, obstacles before birth of native.",
            "2. Mind lives in daydreaming, always in illusions.(Can be said for mother also)",
            "3. Mind is very intuitive .",
            "4. Native may remember past life, may be afflicted by paranormal energies",
            "5. Paternal grandparents encountered change after birth of native.",
            "6. Mother is homemaker, may be less educated but will always care for family.",
            "7. Overeating , phobia, foreign travel, excess of travel.",
            "8. What you see is what to become(Keep your sangati and surroundings good)"
        ],
        hi: [
            "१. जातक के जन्म से पहले माँ को समस्याओं, बाधाओं का सामना करना पड़ा।",
            "२. मन दिवास्वप्न में रहता है, हमेशा भ्रम में रहता है (माँ के लिए भी कहा जा सकता है)।",
            "३. मन बहुत सहज है।",
            "४. जातक पिछले जन्म को याद कर सकता है, अपसामान्य ऊर्जाओं से पीड़ित हो सकता है।",
            "५. जातक के जन्म के बाद दादा-दादी ने बदलाव का सामना किया।",
            "६. माँ गृहिणी है, कम पढ़ी-लिखी हो सकती है लेकिन हमेशा परिवार की देखभाल करेगी।",
            "७. अधिक भोजन, फोबिया, विदेश यात्रा, अत्यधिक यात्रा।",
            "८. जो आप देखते हैं वही बनते हैं (अपनी संगति और परिवेश को अच्छा रखें)।"
        ]
    },
    "2-9": { // Moon + Ketu
        en: [
            "1. Mother faced problems, obstacles after birth of native.",
            "2. Mother/ Daughter in lifelong tensions.(Mind is also in tension)",
            "3. Mind has spiritual thoughts; mother may become spiritual",
            "4. Research mind or sometimes mental retardation.",
            "5. No progeny after female progeny.",
            "6. Mother may be the last child, no further siblings.",
            "7. Nana- Nani may have migrated from distant land.",
            "8. Moon is water what you mix it becomes like that, moon is subconscious, past life memories and vasnas.",
            "9. Left eye/ left window in home may be afflicted(Stairs, shoe rack)",
            "10. Urinary tract issues",
            "11. Left eye weak, squint eyes",
            "12. Mind/Mother has depressive thoughts, argumentative.",
            "13. Food has hair often, drinks less water.",
            "14. Bathroom near stairs.",
            "15. shake legs and talk to themselves.",
            "16. Not happy in happiest of moments.",
            "17. Breaks in travel.",
            "18. Devoted to mother, conflicts with mother.",
            "19. Travel to ganga, holy river, pilgrimage.",
            "20. Add ganga water in bathing water."
        ],
        hi: [
            "१. जातक के जन्म के बाद माँ को समस्याओं, बाधाओं का सामना करना पड़ा।",
            "२. माँ/बेटी आजीवन तनाव में (मन भी तनाव में है)।",
            "३. मन में आध्यात्मिक विचार हैं; माँ आध्यात्मिक बन सकती है।",
            "४. अनुसंधान मन या कभी-कभी मानसिक मंदता।",
            "५. कन्या संतान के बाद कोई संतान नहीं।",
            "६. माँ अंतिम संतान हो सकती है, कोई और भाई-बहन नहीं।",
            "७. नाना-नानी दूर देश से आकर बसे होंगे।",
            "८. चंद्रमा पानी है, आप जो मिलाते हैं वह वैसा ही हो जाता है, चंद्रमा अवचेतन है, पिछले जन्म की यादें और वासनाएं।",
            "९. घर में बाईं आंख/बाईं खिड़की पीड़ित हो सकती है (सीढ़ियां, जूता रैक)।",
            "१०. मूत्र पथ के मुद्दे।",
            "११. बाईं आंख कमजोर, भेंगी आंखें।",
            "१२. मन/माँ के निराशाजनक विचार, तर्कशील।",
            "१३. भोजन में अक्सर बाल होते हैं, कम पानी पीता है।",
            "१४. सीढ़ियों के पास बाथरूम।",
            "१५. पैर हिलाते हैं और खुद से बात करते हैं।",
            "१६. खुशी के क्षणों में खुश नहीं।",
            "१७. यात्रा में रुकावटें।",
            "१८. माँ के प्रति समर्पित, माँ के साथ संघर्ष।",
            "१९. गंगा, पवित्र नदी, तीर्थ यात्रा।",
            "२०. नहाने के पानी में गंगाजल मिलाएं।"
        ]
    },
    "9-2": { // Ketu + Moon
        en: [
            "1. Mother faced problems, obstacles before birth of native.",
            "2. Mother/ Daughter in lifelong tensions.(Mind is also in tension)",
            "3. Mind has spiritual thoughts; mother is already spiritual",
            "4. Research mind or sometimes mental retardation.",
            "5. Some mishappening/ miscarriage before birth of female progeny.",
            "6. Mother had a miscarriage before your birth if Ju is with this combination.(Not 100% of times, question matters!!.)",
            "7. Nana- Nani encountered changes after birth of native.",
            "8. Good if Moon has crossed ketu."
        ],
        hi: [
            "१. जातक के जन्म से पहले माँ को समस्याओं, बाधाओं का सामना करना पड़ा।",
            "२. माँ/बेटी आजीवन तनाव में (मन भी तनाव में है)।",
            "३. मन में आध्यात्मिक विचार हैं; माँ पहले से ही आध्यात्मिक है।",
            "४. अनुसंधान मन या कभी-कभी मानसिक मंदता।",
            "५. कन्या संतान के जन्म से पहले कुछ अप्रिय घटना/गर्भपात।",
            "६. यदि बृहस्पति इस संयोजन के साथ है तो आपके जन्म से पहले माँ का गर्भपात हुआ था (१००% बार नहीं, प्रश्न मायने रखता है!!)।",
            "७. जातक के जन्म के बाद नाना-नानी ने बदलावों का सामना किया।",
            "८. अच्छा है यदि चंद्रमा ने केतु को पार कर लिया हो।"
        ]
    },

    // == MARS Combinations (Planet ID: 3) ==
    "3-4": { // Mars + Mercury
        en: [
            "1. Native’s brother is intelligent and well educated.",
            "2. Native can have land/property at commercial place.",
            "3. Sister/ Daughter may be born by surgery, may have a birth mark,may have died due to accident in past life.",
            "4. Problems before birth of sister/daughter.",
            "5. Good calculation power and mathematics.",
            "6. Neighbors and relatives are stubborn and quarrelsome.",
            "7. Makes a person Logical and calculative, communication is straight forward , strong, good sense of humor.",
            "8. Highly notorious children.",
            "9. Fights between brothers, business partners.",
            "10. Husband is very intelligent.",
            "11. Can have rashes on skin, if under good influence shine on face.",
            "12. Communication rough and argumentative."
        ],
        hi: [
            "१. जातक का भाई बुद्धिमान और सुशिक्षित है।",
            "२. जातक के पास व्यावसायिक स्थान पर भूमि/संपत्ति हो सकती है।",
            "३. बहन/बेटी का जन्म सर्जरी से हो सकता है, जन्मचिह्न हो सकता है, पिछले जन्म में दुर्घटना के कारण मृत्यु हो सकती है।",
            "४. बहन/बेटी के जन्म से पहले समस्याएं।",
            "५. अच्छी गणना शक्ति और गणित।",
            "६. पड़ोसी और रिश्तेदार जिद्दी और झगड़ालू होते हैं।",
            "७. व्यक्ति को तार्किक और गणनात्मक बनाता है, संचार सीधा, मजबूत, अच्छा हास्यबोध।",
            "८. अत्यधिक शरारती बच्चे।",
            "९. भाइयों, व्यापार भागीदारों के बीच झगड़े।",
            "१०. पति बहुत बुद्धिमान है।",
            "११. त्वचा पर चकत्ते हो सकते हैं, यदि अच्छे प्रभाव में हो तो चेहरे पर चमक।",
            "१२. संचार खुरदरा और तर्कपूर्ण।"
        ]
    },
    "4-3": { // Mercury + Mars
        en: [
            "1. Native’s education should be related to mathematics, engineering , sports, technical skills(ITI etc.) if not can show break in education, drop year etc.",
            "2. Ancestral property may be near school or commercial area, good combination for property but brothers may fight for land/property.",
            "3. Sister/ Daughter has problems initially.",
            "4. Problems after birth of sister/daughter.",
            "5. Good calculation power and mathematics.",
            "6. Neighbors and relatives are stubborn and quarrelsome.",
            "7. Brother is born intelligent.",
            "8. Communication is rough and harsh , straight forward, good sense of Humor.",
            "9. Good combination for law education, surgeons, engineering, Gym, skillful work, you will find people with sports complex, Zumba classes etc.",
            "10. Native can be a fast bowler, likes cricket, play something that has use of shoulder like badminton, tennis, basketball etc."
        ],
        hi: [
            "१. जातक की शिक्षा गणित, इंजीनियरिंग, खेल, तकनीकी कौशल (आईटीआई आदि) से संबंधित होनी चाहिए, यदि नहीं तो शिक्षा में रुकावट, ड्रॉप वर्ष आदि दिखा सकता है।",
            "२. पैतृक संपत्ति स्कूल या व्यावसायिक क्षेत्र के पास हो सकती है, संपत्ति के लिए अच्छा संयोजन लेकिन भाई भूमि/संपत्ति के लिए लड़ सकते हैं।",
            "३. बहन/बेटी को शुरुआत में समस्याएं होती हैं।",
            "४. बहन/बेटी के जन्म के बाद समस्याएं।",
            "५. अच्छी गणना शक्ति और गणित।",
            "६. पड़ोसी और रिश्तेदार जिद्दी और झगड़ालू होते हैं।",
            "७. भाई जन्म से बुद्धिमान होता है।",
            "८. संचार खुरदरा और कठोर, सीधा, अच्छा हास्यबोध।",
            "९. कानून शिक्षा, सर्जन, इंजीनियरिंग, जिम, कुशल काम के लिए अच्छा संयोजन, आपको स्पोर्ट्स कॉम्प्लेक्स, ज़ुम्बा क्लास आदि वाले लोग मिलेंगे।",
            "१०. जातक एक तेज गेंदबाज हो सकता है, क्रिकेट पसंद करता है, कंधे का उपयोग करने वाली कोई चीज खेलता है जैसे बैडमिंटन, टेनिस, बास्केटबॉल आदि।"
        ]
    },
    "3-5": { // Mars + Jupiter
        en: [
            "1. Native’s land/property may be near school, public place, place of social gathering, temple etc.",
            "2. Native may have died due to surgery in past life, may have a birthmark.",
            "3. Native may be born by surgery.",
            "4. Native and brother look alike, good compatibility , habits may be similar.",
            "5. Husband will become spiritual and get involved in public activity after marriage.",
            "6. Husband will have wisdom and is pious and good.",
            "7. Husband has good social status, success after marriage.",
            "8. Hardworking, good looking, Sharp nose, overconfident, Always in hurry."
        ],
        hi: [
            "१. जातक की भूमि/संपत्ति स्कूल, सार्वजनिक स्थान, सामाजिक सभा स्थल, मंदिर आदि के पास हो सकती है।",
            "२. जातक पिछले जन्म में सर्जरी के कारण मर गया होगा, जन्मचिह्न हो सकता है।",
            "३. जातक का जन्म सर्जरी से हो सकता है।",
            "४. जातक और भाई एक जैसे दिखते हैं, अच्छी अनुकूलता, आदतें समान हो सकती हैं।",
            "५. पति शादी के बाद आध्यात्मिक बनेगा और सार्वजनिक गतिविधियों में शामिल होगा।",
            "६. पति में ज्ञान होगा और वह पवित्र और अच्छा होगा।",
            "७. पति का सामाजिक स्तर अच्छा है, शादी के बाद सफलता।",
            "८. मेहनती, सुंदर, तेज नाक, अति आत्मविश्वासी, हमेशा जल्दी में।"
        ]
    },
    "5-3": { // Jupiter + Mars
        en: [
            "1. Native’s ancestral land/property may be near school, public place, place of social gathering, temple etc.",
            "2. Native can encounter surgery , accident in his lifetime.",
            "3. Native may have a younger brother, family faced issues after native’s birth.",
            "4. Native and brother look alike, good compatibility , habits may be similar.",
            "5. Husband is already spiritual and involved in public activity even before marriage.",
            "6. Husband will have wisdom and is pious and good.",
            "7. Reddish nose and Excess of anger, courage, stubbornness, energy.",
            "8. Hardworking, good looking, Sharp nose, overconfident, Always in hurry.",
            "9. High blood pressure",
            "10. Native is argumentative, arrogant, only cause of arguments in married life.",
            "11. Should get Full body checkup done , donate blood every year."
        ],
        hi: [
            "१. जातक की पैतृक भूमि/संपत्ति स्कूल, सार्वजनिक स्थान, सामाजिक सभा स्थल, मंदिर आदि के पास हो सकती है।",
            "२. जातक अपने जीवनकाल में सर्जरी, दुर्घटना का सामना कर सकता है।",
            "३. जातक का एक छोटा भाई हो सकता है, जातक के जन्म के बाद परिवार को समस्याओं का सामना करना पड़ा।",
            "४. जातक और भाई एक जैसे दिखते हैं, अच्छी अनुकूलता, आदतें समान हो सकती हैं।",
            "५. पति शादी से पहले भी आध्यात्मिक और सार्वजनिक गतिविधियों में शामिल है।",
            "६. पति में ज्ञान होगा और वह पवित्र और अच्छा होगा।",
            "७. लाल नाक और अत्यधिक क्रोध, साहस, जिद्दीपन, ऊर्जा।",
            "८. मेहनती, सुंदर, तेज नाक, अति आत्मविश्वासी, हमेशा जल्दी में।",
            "९. उच्च रक्तचाप।",
            "१०. जातक तर्कशील, अभिमानी, विवाहित जीवन में बहस का एकमात्र कारण।",
            "११. पूरे शरीर की जांच करवानी चाहिए, हर साल रक्तदान करना चाहिए।"
        ]
    },
    "3-6": { // Mars + Venus
        en: [
            "1. Brother/ Husband is good looking and organized.",
            "2. Native is also attractive and good looking.",
            "3. Husband and wife may be together in past life also.",
            "4. Land/property may be near chemist shop/ garment store.",
            "5. Native’s wife had problems before marriage.",
            "6. Brother may have qualities of fine arts(sports, music, acting etc.)",
            "7. Bhatti Yog- Always ready to do good for others.- As a reward will get a good and beautiful property.",
            "8. Passionate people in relationship",
            "9. Serve and help unknown people.",
            "10. Gets beautiful house, property, windfall gains, vehicles, trading , good money.",
            "11. Seen in many Astrologer’s chart",
            "12. Can be addicted to Porn or Sexual activity.",
            "13. Past life connection between husband and wife.(Female chart)"
        ],
        hi: [
            "१. भाई/पति सुंदर और व्यवस्थित है।",
            "२. जातक भी आकर्षक और सुंदर है।",
            "३. पति और पत्नी पिछले जन्म में भी साथ रहे होंगे।",
            "४. भूमि/संपत्ति केमिस्ट की दुकान/कपड़ों की दुकान के पास हो सकती है।",
            "५. जातक की पत्नी को शादी से पहले समस्याएं थीं।",
            "६. भाई में ललित कलाओं के गुण हो सकते हैं (खेल, संगीत, अभिनय आदि)।",
            "७. भट्टी योग- हमेशा दूसरों के लिए अच्छा करने को तैयार।- इनाम के तौर पर एक अच्छी और सुंदर संपत्ति मिलेगी।",
            "८. रिश्ते में भावुक लोग।",
            "९. अनजान लोगों की सेवा और मदद करना।",
            "१०. सुंदर घर, संपत्ति, अप्रत्याशित लाभ, वाहन, व्यापार, अच्छा पैसा मिलता है।",
            "११. कई ज्योतिषियों के चार्ट में देखा गया।",
            "१२. पोर्न या यौन गतिविधि की लत लग सकती है।",
            "१३. पति और पत्नी के बीच पिछले जन्म का संबंध (स्त्री कुंडली)।"
        ]
    },
    "6-3": { // Venus + Mars
        en: [
            "1. Problems may have come after marriage in life of native.",
            "2. Wife may encounter surgery / accident in her lifetime.",
            "3. Child born may be due to surgery or c-section.",
            "4. Native is attractive and good looking.",
            "5. Husband/brother is good looking, belongs to rich family, may have interest in fine arts.",
            "6. A combination for multiple affairs ( Ve+Ma )",
            "7. If Me and Sa between Mars and Venus there is a problem in physical relationship between husband and wife.",
            "8. Wife is Stubborn, courageous, iron lady, angry.",
            "9. Passionate people in relationship",
            "10. Serve and help unknown people.",
            "11. Gets beautiful house, property, windfall gains, vehicles, trading , good money.",
            "12. Seen in many Astrologer’s chart",
            "13. Can be addicted to Porn or Sexual activity.",
            "14. Past life connection between husband and wife.(Female chart)"
        ],
        hi: [
            "१. जातक के जीवन में शादी के बाद समस्याएं आ सकती हैं।",
            "२. पत्नी को अपने जीवनकाल में सर्जरी/दुर्घटना का सामना करना पड़ सकता है।",
            "३. बच्चे का जन्म सर्जरी या सी-सेक्शन के कारण हो सकता है।",
            "४. जातक आकर्षक और सुंदर है।",
            "५. पति/भाई सुंदर है, अमीर परिवार से है, ललित कलाओं में रुचि हो सकती है।",
            "६. एकाधिक मामलों के लिए एक संयोजन (शुक्र+मंगल)।",
            "७. यदि मंगल और शुक्र के बीच बुध और शनि हों तो पति और पत्नी के बीच शारीरिक संबंध में समस्या होती है।",
            "८. पत्नी जिद्दी, साहसी, लौह महिला, गुस्सैल होती है।",
            "९. रिश्ते में भावुक लोग।",
            "१०. अनजान लोगों की सेवा और मदद करना।",
            "११. सुंदर घर, संपत्ति, अप्रत्याशित लाभ, वाहन, व्यापार, अच्छा पैसा मिलता है।",
            "१२. कई ज्योतिषियों के चार्ट में देखा गया।",
            "१३. पोर्न या यौन गतिविधि की लत लग सकती है।",
            "१४. पति और पत्नी के बीच पिछले जन्म का संबंध (स्त्री कुंडली)।"
        ]
    },
    "3-7": { // Mars + Saturn
        en: [
            "1. Family faced problem after birth of brother.",
            "2. Problem in adjustment after marriage., Delay in marriage",
            "3. Problems in family after birth of brother.",
            "4. Profession should be inspired by mars, some technical skills, engineering, sports , army etc.",
            "5. Problems in profession, work environment not good. - There will be stubborn and irritated people in workplace.",
            "6. Ego clashes with higher ups , due to feeling that I have all skills, brings ego",
            "7. Fights between brothers.",
            "8. Teeth can have problems, not in shape.",
            "9. Acidity in body.",
            "10. Body is prone to diseases, fall, accidents, surgeries."
        ],
        hi: [
            "१. भाई के जन्म के बाद परिवार को समस्या का सामना करना पड़ा।",
            "२. शादी के बाद समायोजन में समस्या, शादी में देरी।",
            "३. भाई के जन्म के बाद परिवार में समस्याएं।",
            "४. पेशा मंगल से प्रेरित होना चाहिए, कुछ तकनीकी कौशल, इंजीनियरिंग, खेल, सेना आदि।",
            "५. पेशे में समस्याएं, काम का माहौल अच्छा नहीं। - कार्यस्थल पर जिद्दी और चिड़चिड़े लोग होंगे।",
            "६. उच्च अधिकारियों के साथ अहंकार का टकराव, यह महसूस करने के कारण कि मेरे पास सभी कौशल हैं, अहंकार लाता है।",
            "७. भाइयों के बीच झगड़े।",
            "८. दांतों में समस्या हो सकती है, आकार में नहीं।",
            "९. शरीर में अम्लता।",
            "१०. शरीर बीमारियों, गिरने, दुर्घटनाओं, सर्जरी के प्रति प्रवण होता है।"
        ]
    },
    "7-3": { // Saturn + Mars
        en: [
            "1. Problems in family before birth of brother.",
            "2. Problems in husband’s life before marriage.",
            "3. Delay/Obstacles in marriage.(Female Chart)",
            "4. Profession may be related to engineering, real estate, tools, machinery , factory, army, sports etc.",
            "5. If profession is not related to any karak tatwa of mars , there are problems in profession.",
            "6. Person’s karma is Mars, Mars is mantra , person may be chanting mantras.",
            "7. Delay in teeth development, malformed, some issue.",
            "8. Body is susceptible to falls, accidents, surgery , diseases.",
            "9. Person faces a mental turmoil and unrest , it is like a Civil War in your mind, Person defends his/her actions with ego and feels restless -Only remedy is Gita reading and mantra chanting, and doing work related to mars."
        ],
        hi: [
            "१. भाई के जन्म से पहले परिवार में समस्याएं।",
            "२. शादी से पहले पति के जीवन में समस्याएं।",
            "३. शादी में देरी/बाधाएं (स्त्री कुंडली)।",
            "४. पेशा इंजीनियरिंग, रियल एस्टेट, उपकरण, मशीनरी, कारखाना, सेना, खेल आदि से संबंधित हो सकता है।",
            "५. यदि पेशा मंगल के किसी कारक तत्व से संबंधित नहीं है, तो पेशे में समस्याएं हैं।",
            "६. व्यक्ति का कर्म मंगल है, मंगल मंत्र है, व्यक्ति मंत्रों का जाप कर सकता है।",
            "७. दांतों के विकास में देरी, विकृत, कुछ समस्या।",
            "८. शरीर गिरने, दुर्घटनाओं, सर्जरी, बीमारियों के प्रति संवेदनशील है।",
            "९. व्यक्ति मानसिक उथल-पुथल और अशांति का सामना करता है, यह आपके दिमाग में गृहयुद्ध की तरह है, व्यक्ति अहंकार के साथ अपने कार्यों का बचाव करता है और बेचैन महसूस करता है - एकमात्र उपाय गीता पढ़ना और मंत्र जाप करना है, और मंगल से संबंधित काम करना है।"
        ]
    },
    "3-8": { // Mars + Rahu
        en: [
            "1. Problems in husband’s life after marriage.",
            "2. Courage/Anger expanded yoga- Will not hesitate to do bad/risky things.",
            "3. Ve+Ma+Ra , Combination in female chart can show running away from home, molestation, sexual abuse etc.",
            "4. Criminals / gangsters/Jail can be seen through this.",
            "5. Intercaste marriage or cultural change or foreign travel after marriage(Female chart)",
            "6. If not one of the above things can show dispute and separation in marriage.",
            "7. Latent Energy: Kundlini, weapons, police, army, surgeon, commander.(Saturn is profession)",
            "8. Bhratra Rin: Chacha , Tau , Brother disputes.",
            "9. Not proper alignment of teeth.",
            "10. Blood infections, blood pressure.",
            "11. Back pain, Muscle stiffness.",
            "12. Husband can be software engineer, NRI, Love marriage (Female Chart), Toxicity in relationship."
        ],
        hi: [
            "१. शादी के बाद पति के जीवन में समस्याएं।",
            "२. साहस/क्रोध विस्तारित योग- बुरे/जोखिम भरे काम करने में संकोच नहीं करेगा।",
            "३. शुक्र+मंगल+राहु, स्त्री कुंडली में संयोजन घर से भागना, छेड़छाड़, यौन शोषण आदि दिखा सकता है।",
            "४. इसके माध्यम से अपराधी/गैंगस्टर/जेल देखे जा सकते हैं।",
            "५. अंतर्जातीय विवाह या सांस्कृतिक परिवर्तन या शादी के बाद विदेश यात्रा (स्त्री कुंडली)।",
            "६. यदि उपरोक्त में से कोई एक चीज नहीं है तो शादी में विवाद और अलगाव दिखा सकता है।",
            "७. गुप्त ऊर्जा: कुंडलिनी, हथियार, पुलिस, सेना, सर्जन, कमांडर (शनि पेशा है)।",
            "८. भ्रातृ ऋण: चाचा, ताऊ, भाई विवाद।",
            "९. दांतों का उचित संरेखण नहीं।",
            "१०. रक्त संक्रमण, रक्तचाप।",
            "११. पीठ दर्द, मांसपेशियों में अकड़न।",
            "१२. पति सॉफ्टवेयर इंजीनियर, एनआरआई, प्रेम विवाह (स्त्री कुंडली), रिश्ते में विषाक्तता हो सकता है।"
        ]
    },
    "8-3": { // Rahu + Mars
        en: [
            "1. Dada-Dadi purchased land/property after birth of native, Or they may encounter accident/surgery/problems.",
            "2. Husband may come from foreign land(NRI), New beginning/problems in husband’s life before marriage.",
            "3. Problems in family before birth of brother.",
            "4. Ma+Ra combination shows that a person has lot of energy but is wasting energy in anger, frustration.",
            "5. Husband can be a software engineer."
        ],
        hi: [
            "१. दादा-दादी ने जातक के जन्म के बाद भूमि/संपत्ति खरीदी, या उन्हें दुर्घटना/सर्जरी/समस्याओं का सामना करना पड़ सकता है।",
            "२. पति विदेश से आ सकता है (एनआरआई), शादी से पहले पति के जीवन में नई शुरुआत/समस्याएं।",
            "३. भाई के जन्म से पहले परिवार में समस्याएं।",
            "४. मंगल+राहु संयोजन दिखाता है कि एक व्यक्ति में बहुत ऊर्जा है लेकिन वह क्रोध, निराशा में ऊर्जा बर्बाद कर रहा है।",
            "५. पति एक सॉफ्टवेयर इंजीनियर हो सकता है।"
        ]
    },
    "3-9": { // Mars + Ketu
        en: [
            "1. Problems in life after marriage(Female chart)- -3 Possibilities- Separation, Miscarriage, Death in Family",
            "2. Remedy is Suhag things, Mangal Sutra.",
            "3. Husband/Brother lives in lifelong tension.",
            "4. Conflicts arguments with husband.",
            "5. Husband will become spiritual after the marriage.",
            "6. If with Ju this combination may signify multiple surgeries/accidents.",
            "7. Scar mark on face of husband",
            "9. High sixth sense , this if with Saturn is called Langoti Yoga or Sanyas Yoga (Sa+Ma+Ke)",
            "10. Conflict related to land , legal case for land.",
            "11. Sundarkand , Hanuman chalisa",
            "12. Like a latent Volcano"
        ],
        hi: [
            "१. शादी के बाद जीवन में समस्याएं (स्त्री कुंडली)- -३ संभावनाएं- अलगाव, गर्भपात, परिवार में मृत्यु।",
            "२. उपाय सुहाग की चीजें, मंगल सूत्र है।",
            "३. पति/भाई आजीवन तनाव में रहता है।",
            "४. पति के साथ संघर्ष, बहस।",
            "५. शादी के बाद पति आध्यात्मिक हो जाएगा।",
            "६. यदि बृहस्पति के साथ यह संयोजन कई सर्जरी/दुर्घटनाओं का संकेत दे सकता है।",
            "७. पति के चेहरे पर निशान।",
            "९. उच्च छठी इंद्रिय, यदि शनि के साथ हो तो इसे लंगोटी योग या संन्यास योग कहा जाता है (शनि+मंगल+केतु)।",
            "१०. भूमि से संबंधित संघर्ष, भूमि के लिए कानूनी मामला।",
            "११. सुंदरकांड, हनुमान चालीसा।",
            "१२. एक गुप्त ज्वालामुखी की तरह।"
        ]
    },
    "9-3": { // Ketu + Mars
        en: [
            "1. Nani- Nani may purchase a land/property after native’s birth, They may encounter surgery/ accident too.",
            "2. Past life connection with brother.",
            "3. Husband had problems in life before marriage.",
            "4. Family had problems before birth of brother.",
            "5. There may be a miscarriage/mishappening before birth of brother.",
            "6. Brother/Husband has lifelong tensions."
        ],
        hi: [
            "१. नानी-नानी जातक के जन्म के बाद भूमि/संपत्ति खरीद सकती हैं, उन्हें सर्जरी/दुर्घटना का भी सामना करना पड़ सकता है।",
            "२. भाई के साथ पिछले जन्म का संबंध।",
            "३. शादी से पहले पति के जीवन में समस्याएं थीं।",
            "४. भाई के जन्म से पहले परिवार में समस्याएं थीं।",
            "५. भाई के जन्म से पहले गर्भपात/अप्रिय घटना हो सकती है।",
            "६. भाई/पति को आजीवन तनाव रहता है।"
        ]
    },

    // == MERCURY Combinations (Planet ID: 4) ==
    "4-5": { // Mercury + Jupiter
        en: [
            "1. Sister/Daughter has deep wisdom may become religious, involve in public activity.",
            "2. Male Child after Sister/Daughter.",
            "3. Eduction is smooth and good.",
            "4. Native is intelligent by birth.",
            "5. Education in spiritual sciences, education(B.Ed Etc.)",
            "6. Relatives/Neighbours are good and pious.",
            "7. If Sun with this combination , he/she is meritious student.",
            "8. Guru- Shishya Yog(Can Always study)",
            "9. Mercury the student is behind Jupiter (Guru), it shows you learn by following footsteps of teachers, it ensures that no loopholes are left in learning process, and you become perfectionist.",
            "10. Mature and listens to Guru, in every Indian text guru is given the highest position."
        ],
        hi: [
            "१. बहन/बेटी में गहरा ज्ञान है, धार्मिक बन सकती है, सार्वजनिक गतिविधियों में शामिल हो सकती है।",
            "२. बहन/बेटी के बाद पुत्र संतान।",
            "३. शिक्षा सहज और अच्छी है।",
            "४. जातक जन्म से बुद्धिमान है।",
            "५. आध्यात्मिक विज्ञान में शिक्षा, शिक्षा (बी.एड आदि)।",
            "६. रिश्तेदार/पड़ोसी अच्छे और पवित्र हैं।",
            "७. यदि इस संयोजन के साथ सूर्य हो, तो वह मेधावी छात्र है।",
            "८. गुरु-शिष्य योग (हमेशा अध्ययन कर सकते हैं)।",
            "९. बुध छात्र बृहस्पति (गुरु) के पीछे है, यह दिखाता है कि आप शिक्षकों के पदचिन्हों पर चलकर सीखते हैं, यह सुनिश्चित करता है कि सीखने की प्रक्रिया में कोई खामी न रहे, और आप पूर्णतावादी बन जाते हैं।",
            "१०. परिपक्व और गुरु की सुनता है, प्रत्येक भारतीय पाठ में गुरु को सर्वोच्च स्थान दिया गया है।"
        ]
    },
    "5-4": { // Jupiter + Mercury
        en: [
            "1. Native is highly intelligent.",
            "2. Native may be businessman, education is good.",
            "3. Will study for his lifetime.",
            "4. Native may be followed by a younger sister.",
            "5. Daughter and native look alike, habits may be similar, Good compatibility.",
            "6. Sister/Daughter is born intelligent.",
            "7. Mercury the student is ahead of Jupiter(Guru) shows Adhoora Gyan Or loopholes as native doubt the teacher and think he knows way more.",
            "8. Nature- Childish, looks young, says like child",
            "9. Knowledge without wisdom.",
            "10. Shows that a person is fond of writing, may be fond of kids spending time with kids and writing unlocks Bhagya.",
            "11. Intuitive , good for astrology."
        ],
        hi: [
            "१. जातक अत्यधिक बुद्धिमान है।",
            "२. जातक व्यवसायी हो सकता है, शिक्षा अच्छी है।",
            "३. जीवन भर अध्ययन करेगा।",
            "४. जातक के बाद एक छोटी बहन हो सकती है।",
            "५. बेटी और जातक एक जैसे दिखते हैं, आदतें समान हो सकती हैं, अच्छी अनुकूलता।",
            "६. बहन/बेटी जन्म से बुद्धिमान है।",
            "७. बुध छात्र बृहस्पति (गुरु) से आगे है, यह अधूरा ज्ञान या खामियां दिखाता है क्योंकि जातक शिक्षक पर संदेह करता है और सोचता है कि वह बहुत अधिक जानता है।",
            "८. स्वभाव- बचकाना, युवा दिखता है, बच्चे की तरह कहता है।",
            "९. ज्ञान बिना विवेक के।",
            "१०. दिखाता है कि एक व्यक्ति लिखने का शौकीन है, बच्चों के साथ समय बिताने और लिखने से भाग्य खुलता है।",
            "११. सहज ज्ञान युक्त, ज्योतिष के लिए अच्छा।"
        ]
    },
    "4-6": { // Mercury + Venus
        en: [
            "1. Sister/Daughter is good looking , has fine arts quality, good finances and enjoys luxuries.",
            "2. Wife is very intelligent .",
            "3. Wife may be a businesswomen even before marriage.",
            "4. Wife has lot of friends and is very talkative.",
            "5. Education may be related to fine arts, humanities, Biology, Finance.",
            "6. As a business, person may have a garment shop, wine shop, Finance company etc.",
            "7. Marketing, Vehicle, Financial knowledge, communication knowledge to native.",
            "8. Native gets bored of education after a point of time.",
            "9. Native is intelligent, talks sense , Venus brings flow in communication.",
            "10. Skin is clear and has lusture (shine).",
            "11. Can indicate owning commercial property or property near educational/commercial centers."
        ],
        hi: [
            "१. बहन/बेटी सुंदर है, ललित कलाओं के गुण हैं, अच्छा वित्त है और विलासिता का आनंद लेती है।",
            "२. पत्नी बहुत बुद्धिमान है।",
            "३. पत्नी शादी से पहले भी व्यवसायी हो सकती है।",
            "४. पत्नी के बहुत सारे दोस्त हैं और वह बहुत बातूनी है।",
            "५. शिक्षा ललित कला, मानविकी, जीव विज्ञान, वित्त से संबंधित हो सकती है।",
            "६. एक व्यवसाय के रूप में, व्यक्ति के पास कपड़ों की दुकान, शराब की दुकान, वित्त कंपनी आदि हो सकती है।",
            "७. जातक को विपणन, वाहन, वित्तीय ज्ञान, संचार ज्ञान।",
            "८. जातक एक समय के बाद शिक्षा से ऊब जाता है।",
            "९. जातक बुद्धिमान है, समझदारी की बात करता है, शुक्र संचार में प्रवाह लाता है।",
            "१०. त्वचा साफ है और उसमें चमक है।",
            "११. व्यावसायिक संपत्ति या शैक्षिक/वाणिज्यिक केंद्रों के पास संपत्ति का संकेत दे सकता है।"
        ]
    },
    "6-4": { // Venus + Mercury
        en: [
            "1. Wife is intelligent, May have a younger sister.",
            "2. Wife has a lot of friends and will be very talkative.(Can be a reason for possessiveness of husband)",
            "3. Wife may start a business/venture after marriage.",
            "4. Sister/daughter already have access to all luxuries and comforts, fine arts qualities.",
            "5. Me+ Ve combination makes education smooth, but a person doesn't want to study after a particular age.",
            "6. There could be a family business of garments/Medical store, etc.",
            "7. Shows multiple affairs in male chart.",
            "8. Can indicate owning commercial property or property near educational/commercial centers."
        ],
        hi: [
            "१. पत्नी बुद्धिमान है, एक छोटी बहन हो सकती है।",
            "२. पत्नी के बहुत सारे दोस्त हैं और वह बहुत बातूनी होगी (पति के अधिकारवादी होने का कारण हो सकता है)।",
            "३. पत्नी शादी के बाद कोई व्यवसाय/उद्यम शुरू कर सकती है।",
            "४. बहन/बेटी के पास पहले से ही सभी विलासिता और आराम, ललित कलाओं के गुण हैं।",
            "५. बुध+शुक्र संयोजन शिक्षा को सहज बनाता है, लेकिन एक व्यक्ति एक विशेष उम्र के बाद अध्ययन नहीं करना चाहता है।",
            "६. कपड़ों/मेडिकल स्टोर आदि का पारिवारिक व्यवसाय हो सकता है।",
            "७. पुरुष कुंडली में कई मामले दिखाता है।",
            "८. व्यावसायिक संपत्ति या शैक्षिक/वाणिज्यिक केंद्रों के पास संपत्ति का संकेत दे सकता है।"
        ]
    },
    "4-7": { // Mercury + Saturn
        en: [
            "1. Kumbkaran Yoga – Idle Yoga, Person likes to sit idle and do nothing.",
            "2. Lack of interest/Troubles in education/studies, can have a drop year , dropout.",
            "3. Business in background of Profession(Saturn) so native may continue family business.",
            "4. Sister/Daughter lives has obstacles and troubles.",
            "5. Profession is inspired by mercury.",
            "6. Elder brother is born intelligent.",
            "7. Interest in Antiques, old things, books , learns from old people, things."
        ],
        hi: [
            "१. कुंभकर्ण योग - आलस्य योग, व्यक्ति आलस्य में बैठना और कुछ नहीं करना पसंद करता है।",
            "२. शिक्षा/अध्ययन में रुचि की कमी/परेशानियां, ड्रॉप वर्ष, ड्रॉपआउट हो सकता है।",
            "३. पेशे (शनि) की पृष्ठभूमि में व्यवसाय इसलिए जातक पारिवारिक व्यवसाय जारी रख सकता है।",
            "४. बहन/बेटी के जीवन में बाधाएं और परेशानियां हैं।",
            "५. पेशा बुध से प्रेरित है।",
            "६. बड़ा भाई जन्म से बुद्धिमान है।",
            "७. प्राचीन वस्तुओं, पुरानी चीजों, किताबों में रुचि, बूढ़े लोगों, चीजों से सीखता है।"
        ]
    },
    "7-4": { // Saturn + Mercury
        en: [
            "1. Kumbkaran Yoga – Idle Yoga, Person likes to sit idle and do nothing.",
            "2. Person will do profession in whatever education he/she has taken.",
            "3. Profession can be Business, MBA, Journalism ,Teaching, Communication realted etc.",
            "4. Family had obstacles before birth of Sister/Daughter.",
            "5. Profession would bring stable income .",
            "6. Elder brother is born intelligent.",
            "7. Good combination for stable money flow.",
            "8. Can have Dual Income, 2 jobs, part time work."
        ],
        hi: [
            "१. कुंभकर्ण योग - आलस्य योग, व्यक्ति आलस्य में बैठना और कुछ नहीं करना पसंद करता है।",
            "२. व्यक्ति जो भी शिक्षा प्राप्त की है, उसी में पेशा करेगा।",
            "३. पेशा व्यवसाय, एमबीए, पत्रकारिता, शिक्षण, संचार से संबंधित आदि हो सकता है।",
            "४. बहन/बेटी के जन्म से पहले परिवार में बाधाएं थीं।",
            "५. पेशा स्थिर आय लाएगा।",
            "६. बड़ा भाई जन्म से बुद्धिमान है।",
            "७. स्थिर धन प्रवाह के लिए अच्छा संयोजन।",
            "८. दोहरी आय, २ नौकरियां, अंशकालिक काम हो सकता है।"
        ]
    },
    "4-8": { // Mercury + Rahu
        en: [
            "1. Problem in family/New beginning after birth of sister/daughter.",
            "2. Education can happen in foreign land.",
            "3. Such a person may have 2 master degrees, there may be a break in education in between but person starts studying it again.",
            "4. Person will not use his degrees correctly, later on can earn money throughthem.",
            "5. Eduaction in software engineering, AI , Tantra , Mystical Sciences.",
            "6. As a business can do online business, Export-Import, etc.",
            "7. Grandparents are already intelligent and may be in business.",
            "8. Rahu is dissipation, so shows off knowledge",
            "9. Innovative, masked personality, Hazir Jawabi",
            "10. Highly curious(Mercury is curiosity)",
            "11. Should be in social media, good combination for foreign education, youtube educational channel, digital marketing, mass media.",
            "12. Become like person , who they talk to, good sense of humor , Pranksters.",
            "13. Diplomatic talk, Highly intelligent , Called Bhramand buddhi yog.",
            "14. Paternal Grandparents may have commercial property."
        ],
        hi: [
            "१. बहन/बेटी के जन्म के बाद परिवार में समस्या/नई शुरुआत।",
            "२. शिक्षा विदेश में हो सकती है।",
            "३. ऐसे व्यक्ति के पास २ मास्टर डिग्री हो सकती है, बीच में शिक्षा में रुकावट आ सकती है लेकिन व्यक्ति फिर से पढ़ाई शुरू कर देता है।",
            "४. व्यक्ति अपनी डिग्री का सही उपयोग नहीं करेगा, बाद में उनके माध्यम से पैसा कमा सकता है।",
            "५. सॉफ्टवेयर इंजीनियरिंग, एआई, तंत्र, रहस्यमय विज्ञान में शिक्षा।",
            "६. एक व्यवसाय के रूप में ऑनलाइन व्यवसाय, निर्यात-आयात आदि कर सकते हैं।",
            "७. दादा-दादी पहले से ही बुद्धिमान हैं और व्यवसाय में हो सकते हैं।",
            "८. राहु अपव्यय है, इसलिए ज्ञान का दिखावा करता है।",
            "९. अभिनव, नकाबपोश व्यक्तित्व, हाजिर जवाबी।",
            "१०. अत्यधिक जिज्ञासु (बुध जिज्ञासा है)।",
            "११. सोशल मीडिया में होना चाहिए, विदेश शिक्षा के लिए अच्छा संयोजन, यूट्यूब शैक्षिक चैनल, डिजिटल मार्केटिंग, मास मीडिया।",
            "१२. जिस व्यक्ति से वे बात करते हैं, वैसा ही बन जाते हैं, अच्छा हास्यबोध, शरारती।",
            "१३. कूटनीतिक बातचीत, अत्यधिक बुद्धिमान, ब्रह्मांड बुद्धि योग कहा जाता है।",
            "१४. दादा-दादी के पास व्यावसायिक संपत्ति हो सकती है।"
        ]
    },
    "8-4": { // Rahu + Mercury
        en: [
            "1. Problem in family/New beginning before birth of sister/daughter.",
            "2. Education/Business can happen in foreign land.",
            "3. Such a person is very interested in mantra, tantra, spells and mystical sciences shows that it is a continuation from past life.",
            "4. Grandparents are intelligent and may be in business.",
            "5. Sharp memory is seen in most cases, person is showing off his knowledge every time either by teaching or while talking, good communication, deceptive people and may deceive others for their benefit."
        ],
        hi: [
            "१. बहन/बेटी के जन्म से पहले परिवार में समस्या/नई शुरुआत।",
            "२. शिक्षा/व्यवसाय विदेश में हो सकता है।",
            "३. ऐसा व्यक्ति मंत्र, तंत्र, मंत्र और रहस्यमय विज्ञान में बहुत रुचि रखता है, यह दर्शाता है कि यह पिछले जन्म से एक निरंतरता है।",
            "४. दादा-दादी बुद्धिमान हैं और व्यवसाय में हो सकते हैं।",
            "५. ज्यादातर मामलों में तेज याददाश्त देखी जाती है, व्यक्ति हर बार या तो पढ़ाकर या बात करते समय अपने ज्ञान का दिखावा करता है, अच्छा संचार, धोखेबाज लोग और अपने लाभ के लिए दूसरों को धोखा दे सकते हैं।"
        ]
    },
    "4-9": { // Mercury + Ketu
        en: [
            "1. No child after daughter(Female progeny)",
            "2. Sister may be youngest in family, no siblings after younger sister.",
            "3. Break in education or incomplete education.",
            "4. Eduaction in Law, Occult, Vastu, Astrology, low skilled work(Barbers, food stalls etc.) - Kujavat Ketu(Ketu acts like Mars)",
            "5. Sister/Daughter has lifelong tensions/worries.",
            "6. Nana-Nani are very intelligent , may have a business.",
            "7. Person may go into research, good communication(point to point), poet",
            "8. Connection with roots, people feel connected with children.",
            "9. Spiritual, occult education and interest.",
            "10. People study analytical , logical, things like mathematics, B.Com , law, coding, CA, and are often found teaching children.",
            "11. People forget what they were saying in between, they have to leave a converstion in between and go to do some work.",
            "12. Shows that there is no major gain from ancestral land, the grandparents , parents land was distributed and didn’t give them much profit.",
            "13. If more malefic effect , less hearing power, memory weakness, cervical spondylitis , Speaking issues.",
            "14. Many girlfriends or boyfriends(3 sometimes)",
            "15. Acne , ulcer on skin and mouth.",
            "16. Book worms, speak less, vedic knowledge and spiritual."
        ],
        hi: [
            "१. बेटी के बाद कोई संतान नहीं (कन्या संतान)।",
            "२. बहन परिवार में सबसे छोटी हो सकती है, छोटी बहन के बाद कोई भाई-बहन नहीं।",
            "३. शिक्षा में रुकावट या अधूरी शिक्षा।",
            "४. कानून, गुप्त विद्या, वास्तु, ज्योतिष में शिक्षा, कम कुशल काम (नाई, भोजन स्टाल आदि) - कुजवत केतु (केतु मंगल की तरह कार्य करता है)।",
            "५. बहन/बेटी को आजीवन तनाव/चिंताएं रहती हैं।",
            "६. नाना-नानी बहुत बुद्धिमान हैं, उनका कोई व्यवसाय हो सकता है।",
            "७. व्यक्ति अनुसंधान में जा सकता है, अच्छा संचार (सीधे मुद्दे पर), कवि।",
            "८. जड़ों से जुड़ाव, लोग बच्चों से जुड़ाव महसूस करते हैं।",
            "९. आध्यात्मिक, गुप्त शिक्षा और रुचि।",
            "१०. लोग विश्लेषणात्मक, तार्किक, गणित, बी.कॉम, कानून, कोडिंग, सीए जैसी चीजें पढ़ते हैं, और अक्सर बच्चों को पढ़ाते हुए पाए जाते हैं।",
            "११. लोग बीच में भूल जाते हैं कि वे क्या कह रहे थे, उन्हें बीच में बातचीत छोड़नी पड़ती है और कुछ काम करने जाना पड़ता है।",
            "१२. दिखाता है कि पैतृक भूमि से कोई बड़ा लाभ नहीं है, दादा-दादी, माता-पिता की भूमि वितरित की गई और उन्हें ज्यादा लाभ नहीं हुआ।",
            "१३. यदि अधिक अशुभ प्रभाव हो, तो सुनने की शक्ति कम, स्मृति दुर्बलता, सर्वाइकल स्पॉन्डिलाइटिस, बोलने में समस्या।",
            "१४. कई गर्लफ्रेंड या बॉयफ्रेंड (कभी-कभी ३)।",
            "१५. मुंहासे, त्वचा और मुंह पर छाले।",
            "१६. किताबी कीड़ा, कम बोलना, वैदिक ज्ञान और आध्यात्मिक।"
        ]
    },
    "9-4": { // Ketu + Mercury
        en: [
            "1. Attained spiritual education/Occult/astrology in past life.",
            "2. Problems in family before birth of sister/daughter.",
            "3. Miscarrige/Mishappening before birth of sister/daughter.",
            "4. Nana-Nani may start a business after birth of native.",
            "5. Native may be inclined towards occult and spiritual knowledge.",
            "6. Person is introvert and don’t like to talk much, but we should know that he/she is a master in communication , and can very well talk it is just a choice."
        ],
        hi: [
            "१. पिछले जन्म में आध्यात्मिक शिक्षा/गुप्त विद्या/ज्योतिष प्राप्त किया।",
            "२. बहन/बेटी के जन्म से पहले परिवार में समस्याएं।",
            "३. बहन/बेटी के जन्म से पहले गर्भपात/अप्रिय घटना।",
            "४. नाना-नानी जातक के जन्म के बाद कोई व्यवसाय शुरू कर सकते हैं।",
            "५. जातक गुप्त और आध्यात्मिक ज्ञान की ओर आकर्षित हो सकता है।",
            "६. व्यक्ति अंतर्मुखी है और ज्यादा बात करना पसंद नहीं करता है, लेकिन हमें पता होना चाहिए कि वह संचार में माहिर है, और बहुत अच्छी तरह से बात कर सकता है यह सिर्फ एक विकल्प है।"
        ]
    },

    // == JUPITER Combinations (Planet ID: 5) ==
    "5-6": { // Jupiter + Venus
        en: [
            "1. Native is good looking and attractive.",
            "2. Wife is good looking and pious and good.",
            "3. Wife belongs to a prestigious and good family.",
            "4. This combination gives good wealth and ensures finances.",
            "5. Native is money minded, has desire for luxuries .",
            "6. Native has some fine arts quality(music , dance, acting etc.)",
            "7. Wife is religious/in public activity before marriage.",
            "8. Yoga And Bhoga ,so lot of sexual desires , specially in male chart.",
            "9. Person is intelligent and guides other people.",
            "10. Person is very attached to his wife, married life is good.",
            "11. Age of person is good , we can say 67 years for sure , after that also it is good person recovers.",
            "12. Natives achive prosperity in age of 30.",
            "13. Weight gain."
        ],
        hi: [
            "१. जातक सुंदर और आकर्षक है।",
            "२. पत्नी सुंदर, पवित्र और अच्छी है।",
            "३. पत्नी एक प्रतिष्ठित और अच्छे परिवार से है।",
            "४. यह संयोजन अच्छा धन देता है और वित्त सुनिश्चित करता है।",
            "५. जातक पैसे वाला है, विलासिता की इच्छा रखता है।",
            "६. जातक में कुछ ललित कला गुण हैं (संगीत, नृत्य, अभिनय आदि)।",
            "७. पत्नी शादी से पहले धार्मिक/सार्वजनिक गतिविधि में है।",
            "८. योग और भोग, इसलिए बहुत सारी यौन इच्छाएं, विशेष रूप से पुरुष कुंडली में।",
            "९. व्यक्ति बुद्धिमान है और अन्य लोगों का मार्गदर्शन करता है।",
            "१०. व्यक्ति अपनी पत्नी से बहुत जुड़ा हुआ है, विवाहित जीवन अच्छा है।",
            "११. व्यक्ति की आयु अच्छी है, हम निश्चित रूप से ६७ वर्ष कह सकते हैं, उसके बाद भी यह अच्छा है व्यक्ति ठीक हो जाता है।",
            "१२. जातक ३० वर्ष की आयु में समृद्धि प्राप्त करते हैं।",
            "१३. वजन बढ़ना।"
        ]
    },
    "6-5": { // Venus + Jupiter
        en: [
            "1. Native is good looking and attractive from birth.",
            "2. Wife is good looking and pious and good, may have a younger brother.",
            "3. Wife gets prestige, recognition after marriage.",
            "4. This combination gives good wealth and ensures finances(already rich).",
            "5. Native is money minded, has desire for luxuries .",
            "6. Native has some fine arts quality by birth (music , dance, acting etc.)",
            "7. Wife becomes religious/in public activity after marriage.",
            "8. Person may earn through consultation, teaching , astrology etc.",
            "9. Rounded and chubby faced, generally found in good doctors.",
            "10. Wife may be a teacher, banker, lawyer , spiritually inclined.",
            "11. Relationship with wife is good, sometimes there is a problem of giving to much advice and solutions and not respecting her emotions, specially in this case arguments with wife are more as compared to the previous one."
        ],
        hi: [
            "१. जातक जन्म से ही सुंदर और आकर्षक है।",
            "२. पत्नी सुंदर, पवित्र और अच्छी है, एक छोटा भाई हो सकता है।",
            "३. पत्नी को शादी के बाद प्रतिष्ठा, पहचान मिलती है।",
            "४. यह संयोजन अच्छा धन देता है और वित्त सुनिश्चित करता है (पहले से ही अमीर)।",
            "५. जातक पैसे वाला है, विलासिता की इच्छा रखता है।",
            "६. जातक में जन्म से ही कुछ ललित कला गुण हैं (संगीत, नृत्य, अभिनय आदि)।",
            "७. पत्नी शादी के बाद धार्मिक/सार्वजनिक गतिविधि में शामिल हो जाती है।",
            "८. व्यक्ति परामर्श, शिक्षण, ज्योतिष आदि के माध्यम से कमा सकता है।",
            "९. गोल और मोटा चेहरा, आमतौर पर अच्छे डॉक्टरों में पाया जाता है।",
            "१०. पत्नी एक शिक्षक, बैंकर, वकील, आध्यात्मिक रूप से इच्छुक हो सकती है।",
            "११. पत्नी के साथ संबंध अच्छे हैं, कभी-कभी बहुत अधिक सलाह और समाधान देने और उसकी भावनाओं का सम्मान न करने की समस्या होती है, खासकर इस मामले में पत्नी के साथ बहस पिछले वाले की तुलना में अधिक होती है।"
        ]
    },
    "5-7": { // Jupiter + Saturn
        en: [
            "1. Native’s family encountered problems after birth of native.",
            "2. Native is lazy , does procrastination.",
            "3. Profession is inspired by Jupiter",
            "4. Native may have taken tuition classes , teaching profession in early years.(Not by choice) e.g. Son of a priest has do work of priest.",
            "5. Native can suffer from frequent depression and life feels burdensome.",
            "6. Native is pious and good.",
            "7. Saturn is delay and lag, so person works slow and steady.",
            "8. Person is modest, responsible, Law abiding, Has to act mature, Work at less age.",
            "9. Person feels extreme guilt if he/she cheats someone or does something wrong.",
            "10. This is called karmadhipati- Dharamdhipati yog.",
            "11. They have self learning attitude, eklavya, finds guru late",
            "12. Wisdom by struggle.",
            "13. Likes to walk, or should walk(Saturn is legs)"
        ],
        hi: [
            "१. जातक के जन्म के बाद उसके परिवार को समस्याओं का सामना करना पड़ा।",
            "२. जातक आलसी है, टालमटोल करता है।",
            "३. पेशा बृहस्पति से प्रेरित है।",
            "४. जातक ने शुरुआती वर्षों में ट्यूशन कक्षाएं ली होंगी, शिक्षण पेशा (पसंद से नहीं) उदा. पुजारी का बेटा पुजारी का काम करता है।",
            "५. जातक बार-बार अवसाद से पीड़ित हो सकता है और जीवन बोझिल लगता है।",
            "६. जातक पवित्र और अच्छा है।",
            "७. शनि देरी और अंतराल है, इसलिए व्यक्ति धीरे और स्थिर रूप से काम करता है।",
            "८. व्यक्ति विनम्र, जिम्मेदार, कानून का पालन करने वाला, परिपक्व अभिनय करना पड़ता है, कम उम्र में काम करना पड़ता है।",
            "९. यदि व्यक्ति किसी को धोखा देता है या कुछ गलत करता है तो उसे अत्यधिक अपराधबोध महसूस होता है।",
            "१०. इसे कर्माधिपति-धर्माधिपति योग कहा जाता है।",
            "११. उनमें स्व-शिक्षण की प्रवृत्ति होती है, एकलव्य, गुरु देर से मिलता है।",
            "१२. संघर्ष से ज्ञान।",
            "१३. चलना पसंद है, या चलना चाहिए (शनि पैर है)।"
        ]
    },
    "7-5": { // Saturn + Jupiter
        en: [
            "1. Native’s family encountered problems before birth of native.",
            "2. Native is lazy , does procrastination.",
            "3. Profession can be related to Jupiter(Teaching, preaching)",
            "4. Native may take tuition classes , teaching profession in early years.",
            "5. Native spent his past life in poverty, problems.",
            "6. This combination is called Maha Bhagya Yoga.(Every 20 Years- 21 dec. 2021) - Native’s family prospers after his/her birth.",
            "7. Native is pious and good.",
            "8. Found in charts of Teachers, Preachers, Lawyers, consultants, bankers.",
            "9. Wisdom in Karma, don’t like to cheat others.",
            "10. Person does dual work, part time, side imcome, investment etc.",
            "11. Has to work early , mature people.",
            "12. Helping nature, dharam , karma doing.",
            "13. I don’t care attitude (theft , money fall even in these things they tend to forget early)"
        ],
        hi: [
            "१. जातक के जन्म से पहले उसके परिवार को समस्याओं का सामना करना पड़ा।",
            "२. जातक आलसी है, टालमटोल करता है।",
            "३. पेशा बृहस्पति से संबंधित हो सकता है (शिक्षण, उपदेश)।",
            "४. जातक शुरुआती वर्षों में ट्यूशन कक्षाएं ले सकता है, शिक्षण पेशा।",
            "५. जातक ने अपना पिछला जीवन गरीबी, समस्याओं में बिताया।",
            "६. इस संयोजन को महा भाग्य योग कहा जाता है (हर २० साल- २१ दिसंबर २०२१) - जातक के जन्म के बाद उसका परिवार समृद्ध होता है।",
            "७. जातक पवित्र और अच्छा है।",
            "८. शिक्षकों, उपदेशकों, वकीलों, सलाहकारों, बैंकरों के चार्ट में पाया जाता है।",
            "९. कर्म में ज्ञान, दूसरों को धोखा देना पसंद नहीं करते।",
            "१०. व्यक्ति दोहरा काम करता है, अंशकालिक, साइड इनकम, निवेश आदि।",
            "११. जल्दी काम करना पड़ता है, परिपक्व लोग।",
            "१२. मददगार स्वभाव, धर्म, कर्म करना।",
            "१३. मुझे परवाह नहीं है रवैया (चोरी, पैसे गिरना भी इन चीजों में वे जल्दी भूल जाते हैं)।"
        ]
    },
    "5-8": { // Jupiter + Rahu
        en: [
            "1. Native’s family encountered problems after birth of native.",
            "2. Native is a day dreamer and lives in illusions, Unlimited desires.",
            "3. Father started a new venture/new beginning after birth of native it had problems initially , later did good.",
            "4. Native has health issues(can be severe) in the 1st year of birth.",
            "5. Native may develop interest in tantra , mantra ,mystical sciences. He is susceptible to paranormal energies.",
            "6. Native and grandfather may look alike, Grandparents are religious.",
            "7. A type of Raj yoga(Does well in materialistic world)",
            "8. Conspiracy or Shadyantra happen with them.",
            "9. Good for foreign settlement, different culture attracts them.",
            "10. Extraordinary observation skills.",
            "11. Media, Youtube, Social sites.",
            "12. If Mars has an influence in this conjunction, person is kattar dharmic.",
            "13. Higher education may be from distant learning."
        ],
        hi: [
            "१. जातक के जन्म के बाद उसके परिवार को समस्याओं का सामना करना पड़ा।",
            "२. जातक दिवास्वप्न देखता है और भ्रम में रहता है, असीमित इच्छाएं।",
            "३. जातक के जन्म के बाद पिता ने एक नया उद्यम/नई शुरुआत की, शुरुआत में समस्याएं थीं, बाद में अच्छा हुआ।",
            "४. जातक को जन्म के पहले वर्ष में स्वास्थ्य समस्याएं होती हैं (गंभीर हो सकती हैं)।",
            "५. जातक तंत्र, मंत्र, रहस्यमय विज्ञान में रुचि विकसित कर सकता है। वह अपसामान्य ऊर्जाओं के प्रति संवेदनशील है।",
            "६. जातक और दादा एक जैसे दिख सकते हैं, दादा-दादी धार्मिक हैं।",
            "७. एक प्रकार का राज योग (भौतिकवादी दुनिया में अच्छा करता है)।",
            "८. उनके साथ षडयंत्र या षड्यंत्र होता है।",
            "९. विदेश में बसने के लिए अच्छा, अलग संस्कृति उन्हें आकर्षित करती है।",
            "१०. असाधारण अवलोकन कौशल।",
            "११. मीडिया, यूट्यूब, सोशल साइट्स।",
            "१२. यदि इस संयोजन में मंगल का प्रभाव है, तो व्यक्ति कट्टर धार्मिक है।",
            "१३. उच्च शिक्षा दूरस्थ शिक्षा से हो सकती है।"
        ]
    },
    "8-5": { // Rahu + Jupiter
        en: [
            "1. Native’s family encountered problems before birth of native.",
            "2. Native is a day dreamer and lives in illusions, Unlimited desires.",
            "3. Father started a new venture/new beginning before birth of native it had problems initially , later did good.",
            "4. Native may have died early in his past life.",
            "5. Native may develop interest in tantra , mantra ,mystical sciences.",
            "6. Native and grandfather may look alike, Grandparents are religious.",
            "7. A type of Raj yoga(Does well in materialistic world)"
        ],
        hi: [
            "१. जातक के जन्म से पहले उसके परिवार को समस्याओं का सामना करना पड़ा।",
            "२. जातक दिवास्वप्न देखता है और भ्रम में रहता है, असीमित इच्छाएं।",
            "३. जातक के जन्म से पहले पिता ने एक नया उद्यम/नई शुरुआत की, शुरुआत में समस्याएं थीं, बाद में अच्छा हुआ।",
            "४. जातक पिछले जन्म में जल्दी मर गया होगा।",
            "५. जातक तंत्र, मंत्र, रहस्यमय विज्ञान में रुचि विकसित कर सकता है।",
            "६. जातक और दादा एक जैसे दिख सकते हैं, दादा-दादी धार्मिक हैं।",
            "७. एक प्रकार का राज योग (भौतिकवादी दुनिया में अच्छा करता है)।"
        ]
    },
    "5-9": { // Jupiter + Ketu
        en: [
            "1. Native’s family encountered problems after birth of native.",
            "2. Native has lifelong tensions",
            "3. Native is spiritual , will seek moksha , will not be reborn.",
            "4. Native tries to go towards spirituality leaving materialistic world.",
            "5. Ketu here can show miscarriage/mishappening after birth of native.",
            "6. As discussed earlier Kujavat ketu(Ketu acts like Mars) it may give blockage, surgery, nervous disorder to native.",
            "7. This is a combination for Nobel prize.",
            "8. Called Ganesh Yog",
            "9. Person should not be irrigated , troubled much, he likes to works independently.",
            "10. You follow a guru, then leave them leaving faith.",
            "11. Person may be fond of dogs , seeks love from within.",
            "12. Person swings his chair."
        ],
        hi: [
            "१. जातक के जन्म के बाद उसके परिवार को समस्याओं का सामना करना पड़ा।",
            "२. जातक को आजीवन तनाव रहता है।",
            "३. जातक आध्यात्मिक है, मोक्ष की तलाश करेगा, पुनर्जन्म नहीं होगा।",
            "४. जातक भौतिकवादी दुनिया को छोड़कर आध्यात्मिकता की ओर जाने की कोशिश करता है।",
            "५. यहां केतु जातक के जन्म के बाद गर्भपात/अप्रिय घटना दिखा सकता है।",
            "६. जैसा कि पहले चर्चा की गई थी कुजवत केतु (केतु मंगल की तरह कार्य करता है) यह जातक को रुकावट, सर्जरी, तंत्रिका संबंधी विकार दे सकता है।",
            "७. यह नोबेल पुरस्कार के लिए एक संयोजन है।",
            "८. गणेश योग कहा जाता है।",
            "९. व्यक्ति को परेशान नहीं करना चाहिए, बहुत परेशान नहीं करना चाहिए, वह स्वतंत्र रूप से काम करना पसंद करता है।",
            "१०. आप एक गुरु का अनुसरण करते हैं, फिर उन्हें विश्वास छोड़कर छोड़ देते हैं।",
            "११. व्यक्ति कुत्तों का शौकीन हो सकता है, भीतर से प्यार चाहता है।",
            "१२. व्यक्ति अपनी कुर्सी झुलाता है।"
        ]
    },
    "9-5": { // Ketu + Jupiter
        en: [
            "1. Native’s family encountered problems before birth of native, or native had untimely death in past life, may be reborn in same family again.",
            "2. Native has lifelong tensions",
            "3. Native is already spiritual , will seek moksha.",
            "4. Ketu here can show miscarriage/mishappening before birth of native.",
            "6. Native can be eldest in family , no elder siblings(Ke behind Ju)", // Prediction 5 missing in PDF
            "7. This is a combination for Nobel prize."
        ],
        hi: [
            "१. जातक के जन्म से पहले उसके परिवार को समस्याओं का सामना करना पड़ा, या जातक की पिछले जन्म में असामयिक मृत्यु हुई थी, उसी परिवार में फिर से जन्म ले सकता है।",
            "२. जातक को आजीवन तनाव रहता है।",
            "३. जातक पहले से ही आध्यात्मिक है, मोक्ष की तलाश करेगा।",
            "४. यहां केतु जातक के जन्म से पहले गर्भपात/अप्रिय घटना दिखा सकता है।",
            "६. जातक परिवार में सबसे बड़ा हो सकता है, कोई बड़ा भाई-बहन नहीं (केतु बृहस्पति के पीछे)।",
            "७. यह नोबेल पुरस्कार के लिए एक संयोजन है।"
        ]
    },

    // == VENUS Combinations (Planet ID: 6) ==
    "6-7": { // Venus + Saturn
        en: [
            "1. Progress/Prosperity In Career/Profession after marriage(Sure shot).",
            "2. Profession is inspired by Venus, Work environment is good(Ve in history of Sa)",
            "3. Wife will face obstacles/problems in adjustment after marriage.",
            "4. Wife may be professionally active; May also be from same profession/company.",
            "5. Profession may be related to finance, banking, medicine, fine arts but not by choice.",
            "6. Native will do well professionally.",
            "7. Delay in marriage in male chart.",
            "8. Heavy expenses, money you earn is not saved much. As a remedy always donate food.",
            "9. Good for gaining property through hard work or profession. May indicate property related to one's career or an old property.",
            "10. House may be south or west facing."
        ],
        hi: [
            "१. शादी के बाद करियर/पेशे में प्रगति/समृद्धि (निश्चित)।",
            "२. पेशा शुक्र से प्रेरित है, काम का माहौल अच्छा है (शुक्र शनि के इतिहास में)।",
            "३. पत्नी को शादी के बाद समायोजन में बाधाओं/समस्याओं का सामना करना पड़ेगा।",
            "४. पत्नी पेशेवर रूप से सक्रिय हो सकती है; उसी पेशे/कंपनी से भी हो सकती है।",
            "५. पेशा वित्त, बैंकिंग, चिकित्सा, ललित कला से संबंधित हो सकता है लेकिन पसंद से नहीं।",
            "६. जातक पेशेवर रूप से अच्छा करेगा।",
            "७. पुरुष कुंडली में शादी में देरी।",
            "८. भारी खर्च, आप जो पैसा कमाते हैं वह ज्यादा नहीं बचता। उपाय के तौर पर हमेशा भोजन दान करें।",
            "९. कड़ी मेहनत या पेशे से संपत्ति प्राप्त करने के लिए अच्छा है। किसी के करियर या पुरानी संपत्ति से संबंधित संपत्ति का संकेत दे सकता है।",
            "१०. घर दक्षिण या पश्चिम मुखी हो सकता है।"
        ]
    },
    "7-6": { // Saturn + Venus
        en: [
            "1. Progress/Prosperity In Career/Profession after marriage(Sure shot).",
            "2. Profession can be related to Venus, smoothness in Career.",
            "3. Wife may have faced obstacles/problems before marriage.",
            "4. Wife may be professionally active even before marriage; May also be from same profession/company.",
            "5. Profession may be related to finance, banking, medicine, fine arts.",
            "6. Native will do well professionally.",
            "7. Guarantee of money from karma(Profession).",
            "8. Person may do something related to Venus, not necessarily profession, may do something good for women, or life may revolve around females in house(there heath, their job etc.)",
            "9. Good for gaining property through hard work or profession. May indicate property related to one's career or an old property.",
            "10. Good combination for BNN.",
            "11. Saturn Venus people are called Shukra Vanshi, money wise it is good , suffer from leg issues, pain in leg, fracture , or somebody in near family like Bhuaji may have leg related issues"
        ],
        hi: [
            "१. शादी के बाद करियर/पेशे में प्रगति/समृद्धि (निश्चित)।",
            "२. पेशा शुक्र से संबंधित हो सकता है, करियर में सहजता।",
            "३. पत्नी ने शादी से पहले बाधाओं/समस्याओं का सामना किया होगा।",
            "४. पत्नी शादी से पहले भी पेशेवर रूप से सक्रिय हो सकती है; उसी पेशे/कंपनी से भी हो सकती है।",
            "५. पेशा वित्त, बैंकिंग, चिकित्सा, ललित कला से संबंधित हो सकता है।",
            "६. जातक पेशेवर रूप से अच्छा करेगा।",
            "७. कर्म (पेशे) से धन की गारंटी।",
            "८. व्यक्ति शुक्र से संबंधित कुछ कर सकता है, जरूरी नहीं कि पेशा हो, महिलाओं के लिए कुछ अच्छा कर सकता है, या जीवन घर में महिलाओं के इर्द-गिर्द घूम सकता है (उनका स्वास्थ्य, उनकी नौकरी आदि)।",
            "९. कड़ी मेहनत या पेशे से संपत्ति प्राप्त करने के लिए अच्छा है। किसी के करियर या पुरानी संपत्ति से संबंधित संपत्ति का संकेत दे सकता है।",
            "१०. बीएनएन के लिए अच्छा संयोजन।",
            "११. शनि शुक्र के लोगों को शुक्र वंशी कहा जाता है, पैसे के मामले में यह अच्छा है, पैर की समस्याओं, पैर में दर्द, फ्रैक्चर से पीड़ित होते हैं, या बुआजी जैसे किसी करीबी परिवार के सदस्य को पैर से संबंधित समस्याएं हो सकती हैं।"
        ]
    },
    "6-8": { // Venus + Rahu
        en: [
            "1. Very Beautiful wife(Venus expanded), Female herself is beautiful.",
            "2. In male chart, this combination shows very strong desire for a good-looking wife.",
            "3. Flirt Yoga(In Male Chart)",
            "4. Grandparents are already rich, have luxurious lifestyle and comforts, may have fine arts qualities.",
            "5. Problems in wife’s life after marriage - Intercaste marriage, Foreign tour after marriage, Marriage in different culture, wife may be software engineer.",
            "6. Specualtion Yoga(Can do good in Share Market)- Moon should be there",
            "7. Nag mani yoga, Bahu Dhan Yoga, Easy money desire.",
            "8. Venus is cheek, rahu is mole/ round face.",
            "9. Ve Ra people are centre of attraction, So if they enter a shop crowd starts coming there.",
            "10. Indicates property in a foreign land or an unusually large/grand property. Can also indicate issues with property.",
            "11. Wife , Bhuaji has heath issues.",
            "12. Money will not give satisfaction, and you tend to spend money"
        ],
        hi: [
            "१. बहुत सुंदर पत्नी (शुक्र विस्तारित), महिला स्वयं सुंदर है।",
            "२. पुरुष कुंडली में, यह संयोजन एक सुंदर पत्नी की बहुत मजबूत इच्छा दिखाता है।",
            "३. फ्लर्ट योग (पुरुष कुंडली में)।",
            "४. दादा-दादी पहले से ही अमीर हैं, शानदार जीवनशैली और आराम है, ललित कलाओं के गुण हो सकते हैं।",
            "५. शादी के बाद पत्नी के जीवन में समस्याएं - अंतर्जातीय विवाह, शादी के बाद विदेश यात्रा, विभिन्न संस्कृति में विवाह, पत्नी सॉफ्टवेयर इंजीनियर हो सकती है।",
            "६. सट्टा योग (शेयर बाजार में अच्छा कर सकता है)- चंद्रमा होना चाहिए।",
            "७. नाग मणि योग, बहू धन योग, आसान धन की इच्छा।",
            "८. शुक्र गाल है, राहु तिल/गोल चेहरा है।",
            "९. शुक्र राहु के लोग आकर्षण का केंद्र होते हैं, इसलिए यदि वे किसी दुकान में प्रवेश करते हैं तो भीड़ आने लगती है।",
            "१०. विदेश में संपत्ति या एक असामान्य रूप से बड़ी/भव्य संपत्ति का संकेत देता है। संपत्ति के साथ समस्याओं का भी संकेत दे सकता है।",
            "११. पत्नी, बुआजी को स्वास्थ्य समस्याएं हैं।",
            "१२. पैसा संतुष्टि नहीं देगा, और आप पैसा खर्च करने की प्रवृत्ति रखते हैं।"
        ]
    },
    "8-6": { // Rahu + Venus
        en: [
            "1. Very Beautiful wife(Venus expanded), Female herself is beautiful.",
            "2. In male chart, this combination shows very strong desire for a good-looking wife.",
            "3. Flirt Yoga(In Male Chart)",
            "4. Grandparents will become rich, have luxurious lifestyle and comforts, may have fine arts qualities.",
            "5. Problems in wife’s life before marriage",
            "6. Wife may be from a different culture, cast.",
            "7. Indicates property in a foreign land or an unusually large/grand property. Can also indicate issues with property."
        ],
        hi: [
            "१. बहुत सुंदर पत्नी (शुक्र विस्तारित), महिला स्वयं सुंदर है।",
            "२. पुरुष कुंडली में, यह संयोजन एक सुंदर पत्नी की बहुत मजबूत इच्छा दिखाता है।",
            "३. फ्लर्ट योग (पुरुष कुंडली में)।",
            "४. दादा-दादी अमीर बनेंगे, शानदार जीवनशैली और आराम होगा, ललित कलाओं के गुण हो सकते हैं।",
            "५. शादी से पहले पत्नी के जीवन में समस्याएं।",
            "६. पत्नी एक अलग संस्कृति, जाति की हो सकती है।",
            "७. विदेश में संपत्ति या एक असामान्य रूप से बड़ी/भव्य संपत्ति का संकेत देता है। संपत्ति के साथ समस्याओं का भी संकेत दे सकता है।"
        ]
    },
    "6-9": { // Venus + Ketu
        en: [
            "1. Wife in lifelong tension.",
            "2. Problems after marriage(Male chart) - 3 possibilities- Separation, Miscarriage, Death in Family(Aspects and conjunctions change a lot of things)",
            "3. Nani- Nana are already rich and have all luxuries and comforts.",
            "4. Diffierence of opinion with wife.(Wife may be argumentative)",
            "5. Native may have 3 bank accounts.",
            "6. Wife may be youngest in her family, no siblings born after her.",
            "7. Padma yog, Laksmi yog(Great if in pisces)",
            "8. Devi Upasak",
            "9. Simple Sobar clothes, tailor , fibre and fabrics work",
            "10. Should wear silk clothes.",
            "11. Wife has health issues/introvert.",
            "12. Money will only come when person does work not to gather money but to contribute."
        ],
        hi: [
            "१. पत्नी आजीवन तनाव में।",
            "२. शादी के बाद समस्याएं (पुरुष कुंडली) - ३ संभावनाएं- अलगाव, गर्भपात, परिवार में मृत्यु (पहलू और संयोजन बहुत सी चीजें बदलते हैं)।",
            "३. नानी-नाना पहले से ही अमीर हैं और उनके पास सभी विलासिता और आराम हैं।",
            "४. पत्नी के साथ मतभेद (पत्नी तर्कशील हो सकती है)।",
            "५. जातक के ३ बैंक खाते हो सकते हैं।",
            "६. पत्नी अपने परिवार में सबसे छोटी हो सकती है, उसके बाद कोई भाई-बहन पैदा नहीं हुआ।",
            "७. पद्म योग, लक्ष्मी योग (मीन राशि में हो तो उत्तम)।",
            "८. देवी उपासक।",
            "९. सादे सोबर कपड़े, दर्जी, फाइबर और कपड़े का काम।",
            "१०. रेशमी कपड़े पहनने चाहिए।",
            "११. पत्नी को स्वास्थ्य समस्याएं/अंतर्मुखी।",
            "१२. पैसा तभी आएगा जब व्यक्ति पैसा इकट्ठा करने के लिए नहीं बल्कि योगदान करने के लिए काम करेगा।"
        ]
    },
    "9-6": { // Ketu + Venus
        en: [
            "1. Wife in lifelong tension.",
            "2. Problems before marriage in life of wife.",
            "3. Nani- Nana got richness, luxuries and comforts after birth of native.",
            "4. Diffierence of opinion with wife.(Wife may be argumentative)",
            "5. Native may have 3 bank accounts.",
            "6. Less marriage problems then last combination.",
            "7. Wife may be the eldest sister in her family, no elder siblings of wife."
        ],
        hi: [
            "१. पत्नी आजीवन तनाव में।",
            "२. पत्नी के जीवन में शादी से पहले समस्याएं।",
            "३. जातक के जन्म के बाद नानी-नाना को समृद्धि, विलासिता और आराम मिला।",
            "४. पत्नी के साथ मतभेद (पत्नी तर्कशील हो सकती है)।",
            "५. जातक के ३ बैंक खाते हो सकते हैं।",
            "६. पिछले संयोजन की तुलना में कम वैवाहिक समस्याएं।",
            "७. पत्नी अपने परिवार में सबसे बड़ी बहन हो सकती है, पत्नी के कोई बड़े भाई-बहन नहीं।"
        ]
    },

    // == SATURN Combinations (Planet ID: 7) ==
    "7-8": { // Saturn + Rahu
        en: [
            "1. Person has desire to go to foreign country and settle there.",
            "2. Native cannot do great in profession at his/her birthplace, need to travel and go far away from there.(Cultural change should be there).",
            "3. Native has interest in mantra , tantra , mystical sciences, his karma is bound to it.",
            "4. This combination is called Pitra Karma Dosh(Remedy- Care for elders)",
            "5. Will do profession related to Rahu(IT Sector, online business, digital marketing, foreign country , MNC).",
            "6. Native can have property in 2-3 different cities.",
            "7. Native is extremely talented and intelligent but seeks easy money.",
            "8. May do a thing of family lineage (Grandfather, father and native are all in army, doctors, medical store , any thing…)",
            "9. May indicate health issues like piles or heart-related stress if other factors concur.",
            "10. Sa Ra may show you started working as a lower post(maybe clerk) then got promotions and reached heights."
        ],
        hi: [
            "१. व्यक्ति की विदेश जाने और वहां बसने की इच्छा होती है।",
            "२. जातक अपने जन्मस्थान पर पेशे में बहुत अच्छा नहीं कर सकता है, वहां से दूर यात्रा करने और जाने की आवश्यकता है (सांस्कृतिक परिवर्तन होना चाहिए)।",
            "३. जातक को मंत्र, तंत्र, रहस्यमय विज्ञान में रुचि है, उसका कर्म इससे बंधा हुआ है।",
            "४. इस संयोजन को पितृ कर्म दोष कहा जाता है (उपाय- बड़ों की देखभाल करें)।",
            "५. राहु से संबंधित पेशा करेगा (आईटी क्षेत्र, ऑनलाइन व्यवसाय, डिजिटल मार्केटिंग, विदेश, एमएनसी)।",
            "६. जातक के पास २-३ अलग-अलग शहरों में संपत्ति हो सकती है।",
            "७. जातक अत्यधिक प्रतिभाशाली और बुद्धिमान है लेकिन आसान पैसा चाहता है।",
            "८. पारिवारिक वंश की कोई चीज कर सकता है (दादा, पिता और जातक सभी सेना, डॉक्टर, मेडिकल स्टोर, कुछ भी…)।",
            "९. यदि अन्य कारक भी हों तो यह बवासीर या हृदय संबंधी तनाव जैसी स्वास्थ्य समस्याओं का संकेत दे सकता है।",
            "१०. शनि राहु दिखा सकता है कि आपने एक निचले पद (शायद क्लर्क) के रूप में काम करना शुरू किया फिर पदोन्नति मिली और ऊंचाइयों पर पहुंचे।"
        ]
    },
    "8-7": { // Rahu + Saturn
        en: [
            "1. Person has desire to go to foreign country and settle there.",
            "2. Native cannot do great in profession at his/her birthplace, need to travel and go far away from there.(Cultural change should be there).",
            "3. Native has interest in mantra , tantra , mystical sciences, his karma is bound to it from past life.",
            "4. This combination is called Pitra Karma Dosh(Remedy- Care for elders)",
            "5. Will do profession related to Rahu(IT Sector, online business, digital marketing, foreign country , MNC) not by will., Work area not good.",
            "6. Native can have property in 2-3 different cities.",
            "7. Native is extremely talented and intelligent but seeks easy money.",
            "8. May indicate health issues like piles or heart-related stress if other factors concur."
        ],
        hi: [
            "१. व्यक्ति की विदेश जाने और वहां बसने की इच्छा होती है।",
            "२. जातक अपने जन्मस्थान पर पेशे में बहुत अच्छा नहीं कर सकता है, वहां से दूर यात्रा करने और जाने की आवश्यकता है (सांस्कृतिक परिवर्तन होना चाहिए)।",
            "३. जातक को मंत्र, तंत्र, रहस्यमय विज्ञान में रुचि है, उसका कर्म पिछले जन्म से इससे बंधा हुआ है।",
            "४. इस संयोजन को पितृ कर्म दोष कहा जाता है (उपाय- बड़ों की देखभाल करें)।",
            "५. राहु से संबंधित पेशा करेगा (आईटी क्षेत्र, ऑनलाइन व्यवसाय, डिजिटल मार्केटिंग, विदेश, एमएनसी) इच्छा से नहीं, कार्य क्षेत्र अच्छा नहीं है।",
            "६. जातक के पास २-३ अलग-अलग शहरों में संपत्ति हो सकती है।",
            "७. जातक अत्यधिक प्रतिभाशाली और बुद्धिमान है लेकिन आसान पैसा चाहता है।",
            "८. यदि अन्य कारक भी हों तो यह बवासीर या हृदय संबंधी तनाव जैसी स्वास्थ्य समस्याओं का संकेत दे सकता है।"
        ]
    },
    "7-9": { // Saturn + Ketu
        en: [
            "1. Hurdles/Problems/Obstacles in professional life.",
            "2. Native does not like to work under anybody, can fight and leave job(Does not like orders)",
            "3. Native will desire to do something of his own.(Own Business)",
            "4. Unsuccessful professional life, three or more changes in job, career.",
            "5. Can do well professionally as an astrologer, occultist, tarot reader, Yoga instructor, spiritual field, Law, Army, Surgery, Low skilled, ayurveda, Coding, Data analysit work , Doctor etc.",
            "6. Person may like meditation and it may be a remedy for his/her restlessness.",
            "7. Native born to end his karma(Karmic cycle) may desire moksha."
        ],
        hi: [
            "१. पेशेवर जीवन में बाधाएं/समस्याएं/अवरोध।",
            "२. जातक किसी के अधीन काम करना पसंद नहीं करता, लड़ सकता है और नौकरी छोड़ सकता है (आदेश पसंद नहीं करता)।",
            "३. जातक अपना कुछ करने की इच्छा रखेगा (अपना व्यवसाय)।",
            "४. असफल पेशेवर जीवन, नौकरी, करियर में तीन या अधिक बदलाव।",
            "५. एक ज्योतिषी, गुप्तचर, टैरो रीडर, योग प्रशिक्षक, आध्यात्मिक क्षेत्र, कानून, सेना, सर्जरी, कम कुशल, आयुर्वेद, कोडिंग, डेटा विश्लेषक कार्य, डॉक्टर आदि के रूप में पेशेवर रूप से अच्छा कर सकता है।",
            "६. व्यक्ति ध्यान पसंद कर सकता है और यह उसकी बेचैनी का उपाय हो सकता है।",
            "७. जातक अपने कर्म (कर्म चक्र) को समाप्त करने के लिए पैदा हुआ है, मोक्ष की इच्छा कर सकता है।"
        ]
    },
    "9-7": { // Ketu + Saturn
        en: [
            "1. Hurdles/Problems/Obstacles in professional life initially.",
            "2. Native does not like to work under anybody, can fight and leave job(Does not like orders)",
            "3. Native will desire to do something of his own.(Own Business)",
            "4. Can do well professionally as an astrologer, occultist, tarot reader, Yoga instructor, spiritual field, Law, Army, Surgery, Low skilled work etc. without his/her choice.",
            "6. Person may like meditation and it may be a remedy for his/her restlessness.", // Prediction 5 missing in PDF
            "7. Nani Nana faced problems/obstacles after birth of native."
        ],
        hi: [
            "१. शुरुआत में पेशेवर जीवन में बाधाएं/समस्याएं/अवरोध।",
            "२. जातक किसी के अधीन काम करना पसंद नहीं करता, लड़ सकता है और नौकरी छोड़ सकता है (आदेश पसंद नहीं करता)।",
            "३. जातक अपना कुछ करने की इच्छा रखेगा (अपना व्यवसाय)।",
            "४. एक ज्योतिषी, गुप्तचर, टैरो रीडर, योग प्रशिक्षक, आध्यात्मिक क्षेत्र, कानून, सेना, सर्जरी, कम कुशल काम आदि के रूप में पेशेवर रूप से अच्छा कर सकता है, अपनी पसंद के बिना।",
            "६. व्यक्ति ध्यान पसंद कर सकता है और यह उसकी बेचैनी का उपाय हो सकता है।",
            "७. जातक के जन्म के बाद नानी नाना को समस्याओं/बाधाओं का सामना करना पड़ा।"
        ]
    }
    // ... (Add other combinations as they become available or are inferred)
};
const bnnTransitJupiter = {
    "Su": {
        principle: { en: "Expansion of Soul, Authority, Government.", hi: "आत्मा, अधिकार, सरकार का विस्तार।" },
        prediction: { en: "Activation of natal Sun. Events related to Government, promotion, name, fame. Good for solving issues with authorities.", hi: "जन्म सूर्य का सक्रियण। सरकार, पदोन्नति, नाम, प्रसिद्धि से संबंधित घटनाएँ। अधिकारियों के साथ मुद्दों को सुलझाने के लिए अच्छा है।" }
    },
    "Mo": {
        principle: { en: "Expansion of Mind, Emotions, Travel, Change.", hi: "मन, भावनाओं, यात्रा, परिवर्तन का विस्तार।" },
        prediction: { en: "Can bring blames, changes (residence, job), travel, or litigation. Mother or native may become more devotional. Birth of a female child.", hi: "दोषारोपण, परिवर्तन (निवास, नौकरी), यात्रा, या मुकदमेबाजी ला सकता है। माता या जातक अधिक भक्तिमय हो सकते हैं। कन्या संतान का जन्म।" }
    },
    "Ma": {
        principle: { en: "Expansion of Energy, Courage, Action.", hi: "ऊर्जा, साहस, क्रिया का विस्तार।" },
        prediction: { en: "Increases haste and stubbornness. Good for construction, land deals, technical work. Brother or husband gets recognition. Marriage in a female chart.", hi: "जल्दबाजी और जिद्दीपन बढ़ाता है। निर्माण, भूमि सौदों, तकनीकी कार्यों के लिए अच्छा है। भाई या पति को मान्यता मिलती है। स्त्री कुंडली में विवाह।" }
    },
    "Me": {
        principle: { en: "Expansion of Intellect, Education, Communication.", hi: "बुद्धि, शिक्षा, संचार का विस्तार।" },
        prediction: { en: "Success in exams for students. Gain of new knowledge or skills. Younger siblings prosper. Gains from land deals. Good for new friendships.", hi: "छात्रों के लिए परीक्षाओं में सफलता। नए ज्ञान या कौशल की प्राप्ति। छोटे भाई-बहन समृद्ध होते हैं। भूमि सौदों से लाभ। नई दोस्ती के लिए अच्छा है।" }
    },
    "Ju": {
        principle: { en: "Expansion of Self, Wisdom, Fortune (Jupiter Return).", hi: "स्वयं, ज्ञान, भाग्य का विस्तार (बृहस्पति वापसी)।" },
        prediction: { en: "Excellent time for self-development. Name, fame, and fortune are activated. Good for family planning; childbirth during this phase is a result of good past karma.", hi: "आत्म-विकास के लिए उत्कृष्ट समय। नाम, प्रसिद्धि और भाग्य सक्रिय होते हैं। परिवार नियोजन के लिए अच्छा; इस चरण के दौरान संतान का जन्म अच्छे पिछले कर्मों का परिणाम है।" }
    },
    "Ve": {
        principle: { en: "Expansion of Wealth, Love, Comforts, Happiness.", hi: "धन, प्रेम, सुख, खुशी का विस्तार।" },
        prediction: { en: "Brings affluence, prosperity, money, vehicles, comforts. Good for house renovation, celebrations. Marriage in a male chart. Daughter's birth.", hi: "समृद्धि, धन, वाहन, सुख-सुविधाएं लाता है। घर के नवीनीकरण, उत्सव के लिए अच्छा है। पुरुष कुंडली में विवाह। बेटी का जन्म।" }
    },
    "Sa": {
        principle: { en: "Expansion of Karma, Profession, Discipline.", hi: "कर्म, पेशे, अनुशासन का विस्तार।" },
        prediction: { en: "Good for employment or promotion. A smooth period in career. Can also indicate a positive change in job or profession.", hi: "रोजगार या पदोन्नति के लिए अच्छा है। करियर में एक सहज अवधि। नौकरी या पेशे में सकारात्मक बदलाव का भी संकेत दे सकता है।" }
    },
    "Ra": {
        principle: { en: "Expansion of Illusion, Foreign Elements, Obsession.", hi: "भ्रम, विदेशी तत्वों, जुनून का विस्तार।" },
        prediction: { en: "Jeev (Jupiter) is caught in Maya (Rahu). Can lead to illusions, sickness, hospitalization, or surgery. Good effects of Jupiter are obstructed. A new (potentially problematic) beginning.", hi: "जीव (बृहस्पति) माया (राहु) में फंस गया है। भ्रम, बीमारी, अस्पताल में भर्ती, या सर्जरी का कारण बन सकता है। बृहस्पति के अच्छे प्रभाव बाधित होते हैं। एक नई (संभावित रूप से समस्याग्रस्त) शुरुआत।" }
    },
    "Ke": {
        principle: { en: "Expansion of Spirituality, Detachment, Obstruction.", hi: "आध्यात्मिकता, वैराग्य, बाधा का विस्तार।" },
        prediction: { en: "Gives divine knowledge and occult powers but blocks materialistic gains. A 'choking effect' on worldly pursuits. Can bring ill health, contemplation, or nervous issues.", hi: "दिव्य ज्ञान और गुप्त शक्तियाँ देता है लेकिन भौतिक लाभ को रोकता है। सांसारिक गतिविधियों पर 'गला घोंटने वाला प्रभाव'। खराब स्वास्थ्य, चिंतन, या तंत्रिका संबंधी समस्याएं ला सकता है।" }
    }};
const bnnTransitJupiter1 = {
    "Su": "Shows activation of natal sun, events can happen related to Government, Govt. Job, MBA, Authority, Politics, Name, Fame and promotion. If there is an issue related to govt.; Native may solve it with help of somebody in authority.",
    "Mo": "Blames, Change (residence, city, job), Litigation, Travel to some place, Mother may turn devotional, Native may turn devotional, moon causes change in life, birth of female child , interaction with opposite sex.",
    "Ma": "Haste, Stubbornness, keeps away from imamates , develops exercising power, blood pressure, Construction, land , technical skills job/work may be successful, one of the brothers or Husband will be benefitted and gets recognition, name, fame, marriage in female chart, if married promotion of husband.",
    "Me": "If Native is a student, he/she gets new knowledge, and success in exams, younger siblings gets prosperity, cooperation from knowledgeable persons, gains from land deals, professionals may have successful trainings or meetings, native may have friendship/relationship.",
    "Ju": "Very good time for native to concentrate on self development, Name/ Fame , Fortune is activated , decision to make addition in family(family planning), If childbirth during this phase it is result of good past karma.",
    "Ve": "Affluence, Prosperity, Money, Luxury, Vehicles(Car, two-wheeler), Comforts, Renovation in house, celebration and buying, rise in comforts, Marriage in male chart, Daughter birth, House purchase(Ghar is Venus).",
    "Sa": "Employment/Promotion for native, because Jupiter is planet of expansion and transits over karma karak, smooth period in career, also could be change in job/profession, if natal Mars is linked to natal Saturn, then obstructions in getting job or promotion.",
    "Ra": "The native will be under illusions, it may lead to sickness, hospitalization, surgery, medication, native may get disease (intensity of disease depends on malefic impact on natal Jupiter.), problems may be related to food poisoning, wrong medicine, unknown medicine reaction.Good effects of Jupiter may be obstructed, jeev is caught in maya.(Circumstances due to lust, excessive desire which may later on cause problems),New beginning.",
    "Ke": "Gives divine knowledge , occult powers, being a planet of blocking nature, will block materialistic gains, Jupiter is a planet of expansion, and ketu has no earthly feelings, it obstructs a person from materialistic pursuits, it means if Ju is transiting over natal Ketu, all materialistic results will not be good, if question is regarding law, occult, yoga, spirituality it may be positive. , this transits gives choking effect, pains in joints, opposite energies, ill heath, contemplation, nervous debility."
};

const bnnTransitSaturn = {
    "Su": "Stress and opposition in professional field, will get recognition and support from parental side, face troubles from higher position people(In job, govt.), Makes Sun a commener, subject to law of karma, ill health to native, health issues/ professional hazards to Father due to new people, Govt. Job",
    "Mo": "Called Sade Sati , person feels restless, may wake up at midnight (2 am ) and feel restless, feels like truck on head, changes in profession, transfers, blames, displeasures, expenses, cold-cough related problems. If moon is weak , a wicked women may cause issues, health issues to mother.",
    "Ma": "Mental Tensions, Harassment in profession, pressure from higher ups, disputes, quarrels at workplace(Due to ego and dominance), Purchase of land, opening of factory, construction related work, Me with Natal mars may support IT, Technical skills, Native thinks to quit job, new job is less paid, Husband may suffer from ill health and laziness.",
    "Me": "For students, good educational success, delayed but with cooperation of family/friends, native may get new degree, knowledge, training, business success, start of business, gain of land for siblings, good for siblings, may get commercial land.",
    "Ju": "Professional growth, Status, promotion, Good opportunities, new avenues , life settling transit, turning point of life, gastric problems.",
    "Ve": "Marriage Aspects, Girlfriend, Assets, birth of daughter, good financial prospects, 1st round of Saturn(0-30 years) over Venus gives first professional income, House, vehicle, prosperities, affluence in life.",
    "Sa": "Additional Work due to heavy workload, efficiency level drops, Laziness surrounds native, performance slows down, nervous breakdown, change in lifestyle, health problems, gastric troubles, additional workload, person may have to work double or much harder.",
    "Ra": "Person may involve in shadowy activities, unethical work, work at foreign places, foreign travel, death in house, has to do or attend mourning ceremony, purchase of vehicles, laziness, can be good if person starts something new(initial problems-1st year), online business, MNC, Software engineering etc.",
    "Ke": "Dejections and disputes at work, may involve in litigation, aimlessness , may visit holy places , financial losses, quitting the job(Constant thought), period of depression, stress, Karmo ki maar(results of all bad deeds), person should not change job unless he/she has an offer letter."
};

const bnnProfessionSaturnInRashi = {
    "Aries": "Govt. job, Police, Military Service, Fire Service, Sports, Engineering industry, Iron factory, boiler plant, brick chamber, pottery work, mining, surgeon, accountant, cooking, agriculture, trade union leader, Construction line.",
    "Taurus": "Fine Arts, Bank , Insurance, Banking, Hospitals, Pharmacy, Share Market, Jewelers, Finance.",
    "Gemini": "Journalism, Accountancy, Media, Marketing, Dual Income, Business, Coaching, Tutor .",
    "Cancer": "Unstable Job, Frequent Changes in Job/Business , Every 3-4 years transfer/travel/company change, Can do well in Food sector, Tours and travels, economics, navy, marine , marketing.",
    "Leo": "CEO, Strong position in Job, If ordinary Job then unsatisfied, MBA, Govt. Job, Authority , Handle a Team, HR, Venus and Mars relation may be a medical job.",
    "Virgo": "Law, Agriculture , Village head, Numerology, Astrology, govt. Job(Related to competitive exams), Broker, Consultant, Counselor",
    "Libra": "Medicine, Gynecology, Urologist, Judge, Lawyer, Bank , Finance, Fine arts",
    "Scorpio": "Machinery, Surgeon, Coding, Scientist, Biotechnology, Research, Army, Machinery, Engineering.",
    "Sagittarius": "Teacher, Manager, Clerk, Astrologer, Consultant, Bank",
    "Capricorn": "CA, Professor, Important person in his field, IAS, UPSC, Neurosurgeon.",
    "Aquarius": "Psychologist, Navy, Teaching, Consultant, Telecom industry, Jail department, CBI, etc.",
    "Pisces": "aviation, aeronautical engineer, works in different land, travel industry, work far off from place, auto industry, Teacher"
};

const bnnProfessionSaturnWithPlanet = {
    "Su": "Name , Fame,Recognition in profession, High paid Job, Higher rank, Authority, Would be unsatisfied with low esteem job, Govt. Job, Politics, MBA, Hospital, Establishing Planet.",
    "Mo": "Food Business, Grocery Store, Mo+Ra(Kirana store, Wholesale store), Tours and travel company, transferrable Govt./Private job, Navy, chemistry, economics, Liquor, Coldrinks, water related, Changes , up-down , travels in profession.",
    "Ma": "Engineering, Technical skills, ITI, Army, Defense Forces, Police, Surgeon, Dentist, Construction Work, Real Estate, B.com, Accountant, Electronics, Vastu",
    "Me": "Business, Education, Teacher, MBA, Journalism, Mathematics, Same as eduaction",
    "Ju": "Helps in Law education, Teacher, B.Ed. , Well educated, can always study, social work, CA, consultant, bank",
    "Ve": "Money, Assets, Vehicles , Bank, Finances, Insurance, Trading, Fine Arts, Garments, Utensils, Home Décor, Designing, smoothness in profession.",
    "Ra": "Software Engineer, MNC, Shadow and unethical work(Betting etc.), Profession in foreign land, digital marketing, export import, person is extremely intelligent.",
    "Ke": "Coding, Yoga teacher, spiritual guru, astrologer, occult, vastu , Surgery , Law, Low skilled jobs(Tailor, barber, painter etc.). Native is not happy with Job and wants to do something of his own."
};

const bnnProfessionSpecificCombos = {
    "Astrologers": {
        "Sa+Su+Me+Ke": "Famous Astrologers",
        "Sa+Me+Ke": "Astrologer",
        "Sa+Ju+Su": "Having 6th Sense",
        "Sa+Me+Ke+Ma/Ve": "Vastu+ Astrology",
        "Sa+Ve+Ju+Ke": "Great Healer",
        "Sa+Ju+Me+Ma+Ke": "Spiritual Guru/ Preacher"
    },
    "Scientist": {
        "Virgo sign + Ve+ Me + Su/Mo + Ra/Ke": "Scientist"
    },
    "Writer": {
        "Gemini sign + Me+ Ke + Ma + Su": "Writer"
    },
    "Politician": {
        "Aries/Leo/Capricorn + Su+Ju+Sa+Me+ Ra": "Politician",
        "If Su or Sa exhaulted then great": "Politician (enhanced)"
    },
    "Judge": {
        "Libra + Ve+ Ke+ Sa+ Ju +Su/Me": "Judge"
    },
    "Defense/Police": {
        "Firey Sign(Aries, Leo, Sagittarius) + Sa+ Su+ Ma +Ke/Ra": "Defense/Police"
    },
    "IAS/Civil Services": {
        "Capricorn/Aries/Leo + Sa+ Ju+ Su+ Me+ Ve": "IAS/Civil Services"
    },
    "Insurance": {
        "Pisces Sign + Sa+ Ra(Apsavya Karma- Done after death ) or Sa+ Ve": "Insurance"
    },
    "Industrialist": {
        "Gemini/Virgo/Libra/Taurus + Sa+ Me+ Ma+ Ve + Su": "Industrialist"
    },
    "Doctor": {
        "Pisces/Leo + Sa+ Ve + Su": "Doctor",
        "Pisces/Leo + Sa+ Mo": "Nurse/ Hospital work",
        "Pisces/Leo + Sa+ Ma/Ke": "Surgeon"
    },
    "Engineer": {
        "Sa+ Ma": "Engineer (general)",
        "Sa + Ra": "Software engineer",
        "Sa+ Ke": "Coding",
        "Sa + Ve + Ma": "Architect"
    },
    "Extraordinary Talent": {
        "Ju+ Sa+ Mo+ Ke+ Su+ Me": "Extraordinary Talent"
    }
};

/* const bnnProgressionJupiter = {
    rounds: [
        { years: "0-12", house: 1, focus: "Self, Health, School" },
        { years: "12-24", house: 2, focus: "Family, Speech, education, Finances" },
        { years: "24-36", house: 3, focus: "Courage, Risk, marriage, direction of life, loss" },
        { years: "36-48", house: 4, focus: "Home, Happiness" },
        { years: "48-60", house: 5, focus: "Children settlement" },
        { years: "60-72", house: 6, focus: "Purva paap, liability" }
    ],
    rules_string_formation: [
        "1. Planets in concerned house (Like in 1st round planets in first house, first house in BNN means in whichever Rashi Jupiter is there.)",
        "2. See the planet in conjunction in the concerned house.",
        "3. See the planets in trine.",
        "4. See the planets in 7th aspect from concerned house.",
        "5. See the dispositor (Rashi lord) of Jupiter.",
        "6. See planets in conjunction with Dispositor (Rashi Lord).",
        "7. See planets in 7th aspect from dispositor(Rashi Lord)",
        "8. Exchange of planets that we got till now if any-"
    ],
    example_interpretation: {
        round1_0_12_years: {
            string_planets: ["Ju", "Mo"],
            year_events: [
                "0-1 years: No conjunction",
                "1-2 years: Health issue",
                "2-3 years: Change of City, Dehradun to Jaipur.",
                "3-4 years: Burn injury, Hospitalization",
                "4-5 years: Celebration in family due birth of sister.",
                "5-6 years: (No specific event mentioned)",
                "6-7 years: (No specific event mentioned)",
                "7-8 years: Death of Grandfather",
                "8-9 years: (No specific event mentioned)",
                "9-10 years: Unforgettable gift",
                "10-11 years: Big birthday party at Banquet Hall",
                "11-12 years: (No specific event mentioned)"
            ]
        },
        round2_12_24_years: {
            string_planets: ["Sa","Ra","Ma","Ve","Su","Me"],
            year_events: [
                "12-13 years: (No specific event mentioned)",
                "13-14 years: Health issue and financial issue in family",
                "14-15 years: Small change , Opted for Science+ Maths.",
                "15-16 years: Puberty, acne on face",
                "16-17 years: Scored 80% in class 12.",
                "17-18 years: Engineering college",
                "18-19 years: (No specific event mentioned)",
                "19-20 years: Fight in college.",
                "20-21 years: (No specific event mentioned)",
                "21-22 years: Start of Affair",
                "22-23 years: Function/Celebration In Family.",
                "23-24 years: (No specific event mentioned)"
            ]
        },
         round3_24_36_years: { // Added from Class-8 PDF example
            string_planets: ["Mo", "Su", "Me"],
            year_events: [
                "24-25years: (No specific event mentioned)",
                "25-26 years: Marriage, Foreign Travel to Boston, USA(Regarding Career)",
                "26-27 years: Childbirth (Female child)",
                "27-28 years: Health issues to child",
                "28-29 years: (No specific event mentioned)",
                "29-30 years: (No specific event mentioned)",
                "30-31 years: (No specific event mentioned)",
                "31-32 years: Change of Job",
                "32-33 years: (No specific event mentioned)",
                "33-34 years: Uterus Cyst",
                "34-35 years: Function/Celebration In Family/ Happiness",
                "35-36 years: (No specific event mentioned)"
            ]
        },
        round4_36_48_years: { // Added from Class-8 PDF example
            string_planets: ["Ke", "Ma", "Ve"],
            year_events: [
                "36-37years: (No specific event mentioned)",
                "37-38 years: Professional Career down",
                "38-39 years: Change in Job- 30% less paid",
                "39-40 years: (No specific event mentioned)",
                "40-41 years: Some relaxion , promotion",
                "41-42 years: (No specific event mentioned)",
                "42-43 years: (No specific event mentioned)",
                "43-44 years: Death of mother",
                "44-45 years: (No specific event mentioned)",
                "45-46 years: Purchased a Farmhouse.",
                "46-47 years: Opened a swimming pool at there farmhouse , commercially.",
                "47-48 years: (No specific event mentioned)"
            ]
        },
        round5_48_60_years: { // Added from Class-8 PDF example (chart of 1956)
            string_planets: ["Mo", "Ju", "Ve", "Ma", "Sa", "Me"],
            year_events: [
                "48-49 years: (No specific event mentioned)",
                "49-50 years: (No specific event mentioned)",
                "50-51 years: Marriage of Daughter, conflicts in her life",
                "51-52 years: Shutdown of wholesale goods factory.",
                "52-53 years: (No specific event mentioned)",
                "53-54 years: (No specific event mentioned)",
                "54-55 years: Marriage of Male child.",
                "55-56 years: (No specific event mentioned)",
                "56-57 years: (No specific event mentioned)",
                "57-58 years: Business flopped.",
                "58-59 years: Business started to flourish a little.",
                "59-60 years: (No specific event mentioned)"
            ]
        },
        round6_60_72_years: { // Added from Class-8 PDF example (chart of 1956)
            string_planets: ["Su", "Ke", "Me", "Sa", "Ma", "Ve"],
            year_events: [
                "60-61 years: No issue",
                "61-62 years: Health issue",
                "62-63 years: (No specific event mentioned)",
                "63-64 years: Cancer Detected(Family treated well)",
                "64-65 years: (No specific event mentioned)",
                "65-66 years: (No specific event mentioned)",
                "66-67 years: Surgery successful for cancer in 2022.",
                "67-68 years: Cancer Relapsed and death",
                "68-69 years: (No specific event mentioned)",
                "69-70 years: (No specific event mentioned)",
                "70-71 years: (No specific event mentioned)",
                "71-72 years: (No specific event mentioned)"
            ]
        }
    }
}; */
const bnnProgressionJupiter = {
    rounds: [
        { years: "0-12", house: 1, focus: "Self, Health, School" },
        { years: "12-24", house: 2, focus: "Family, Education, Finances" },
        { years: "24-36", house: 3, focus: "Courage, Risk, Marriage, Direction of Life" },
        { years: "36-48", house: 4, focus: "Home, Happiness, Property" },
        { years: "48-60", house: 5, focus: "Children Settlement, Creativity" },
        { years: "60-72", house: 6, focus: "Health Issues, Liabilities, Service" }
    ],
    // *** THIS IS THE FIX ***
    rounds_hi: [
        { focus: "स्वयं, स्वास्थ्य, स्कूल" },
        { focus: "परिवार, शिक्षा, वित्त" },
        { focus: "साहस, जोखिम, विवाह, जीवन की दिशा" },
        { focus: "घर, सुख, संपत्ति" },
        { focus: "संतान का सेटलमेंट, रचनात्मकता" },
        { focus: "स्वास्थ्य समस्याएं, दायित्व, सेवा" }
    ],
    rules_string_formation: [
        "1. Identify the focus house for the round (e.g., Round 2 = 2nd house from natal Jupiter).",
        "2. Find planets IN the focus house.",
        "3. Find planets in TRINE (1, 5, 9) to the focus house.",
        "4. Find planets ASPECTING the focus house (using BNN aspects: 7th for all; 3rd/10th for Saturn; 5th/9th for Jupiter; 4th/8th for Mars).",
        "5. Identify the RASHI LORD of the focus house sign.",
        "6. Find planets in CONJUNCTION with (in the same house as) the Rashi Lord.",
        "7. Check for any planetary EXCHANGES involving the above planets.",
        "8. All these planets are considered 'Activated' for the entire 12-year round."
    ],
    rules_string_formation_hi: [
        "१. दौर के लिए फोकस भाव की पहचान करें (उदा. राउंड २ = जन्म बृहस्पति से दूसरा भाव)।",
        "२. फोकस भाव में स्थित ग्रहों का पता लगाएं।",
        "३. फोकस भाव से त्रिकोण (१, ५, ९) में स्थित ग्रहों का पता लगाएं।",
        "४. फोकस भाव पर दृष्टि डालने वाले ग्रहों का पता लगाएं (बीएनएन दृष्टि: सभी के लिए ७वीं; शनि के लिए ३/१०; बृहस्पति के लिए ५/९; मंगल के लिए ४/८)।",
        "५. फोकस भाव की राशि के स्वामी (राशिेश) की पहचान करें।",
        "६. राशिेश के साथ युति में (उसी भाव में) स्थित ग्रहों का पता लगाएं।",
        "७. उपरोक्त ग्रहों से संबंधित किसी भी ग्रह विनिमय की जाँच करें।",
        "८. इन सभी ग्रहों को पूरे १२-वर्षीय दौर के लिए 'सक्रिय' माना जाता है।"
    ],
    example_interpretation: { /* ... No changes ... */ }
};
// --- END OF FILE bnn_prediction.js ---
