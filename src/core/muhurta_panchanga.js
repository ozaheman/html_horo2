/**
 * muhurta_panchanga.js  ->  window.MUHURTA_PANCHANGA
 *
 * Muhurta and Panchanga rules from "muhurta_panchanga_reference.md" (+ the Panchanga / Tarabala
 * parts of "nakshatra_complete_reference.md", served by nakshatra_reference.js).
 * Tables are generated from the markdown (no hand-retyping): vara, tithi, yoga, karana, Siddha /
 * Amrita / Ku-yogas, 28-nakshatra Tatkalika yogas, Kalavelas, Choghadiya, 30 muhurtas, panchaka,
 * rising-sign qualities, 21 doshas, activity rules, priority weights, calendar, Samvatsara.
 *
 * WHAT THE APP ALREADY HAD (not duplicated): panchang timeline, Rahu/Yama/Gulika, Abhijit, Hora,
 * Choghadiya UI. This module adds what was missing: quality ratings for tithi / yoga / karana /
 * vara, Siddha-Amrita-Ku-yogas, Tatkalika yoga, panchaka (energy), Chandrabala + Tarabala, lagna
 * tyajya, tithi/nakshatra gandanta, dagdha rashi, activity-specific checks, a weighted muhurta
 * score, Indu Lagna, Samvatsara, plus installChoghadiyaFix() (see below).
 *
 * CORRECTION FOUND WHILE CHECKING THE APP AGAINST THE MD: getChogadiya() in main.js had the
 * WEDNESDAY day sequence copied from Friday and derived every NIGHT sequence as "day sequence
 * shifted by 5", which gives wrong night slots on all seven days (the night cycle is a different
 * cycle). installChoghadiyaFix() replaces it with the md's tables. Rahu / Yama / Gulika segments
 * were checked and are correct; the existing P_NAKS classes all match the md.
 *
 * Conventions / known source conflicts (kept visible, not hidden):
 *  - Weekday index 0 = Sunday. Tithi 1..30 (15 Purnima, 30 Amavasya).
 *  - Amita Siddha for Monday: Shravana here (md main table); Mrigashira in another PDF -> flagged.
 *  - Yoga inauspicious portions differ between PDFs for Vishkambha / Parigha / Vyaghata -> text shown as given.
 *  - Abhijit nakshatra start: 6deg40' Capricorn (standard) vs 6deg50' (one PDF); 6deg40'..10deg53'20" used.
 *  - Priority weights (md section 12) and "nakshatra, vara, tithi matter most in practice" disagree; both stated.
 *  - Free-text activity rules (md section 11) are parsed heuristically; the raw rule text is always returned too.
 *  - Muhurta rules are traditional, not empirically tested.
 */
window.MUHURTA_PANCHANGA = {

    DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    SIGNS: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
    SIGN_LORDS: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],
    TITHI_NAMES: ['Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi'],
    NAK: 360 / 27,

    VARA: [{"no": 1, "day": "Sunday (Ravi)", "planet": "Sun", "deity": "Sun", "goodFor": "Nature, gold, copper, trees, silk, fire, coronation", "avoid": "Anger, ego, laziness, rudeness"}, {"no": 2, "day": "Monday (Soma)", "planet": "Moon", "deity": "Shiva", "goodFor": "New clothes, accessories, jewellery, marriage, intuitive decisions, things related to mother, water, milk", "avoid": "Rigidity; haircut and manicure"}, {"no": 3, "day": "Tuesday (Mangala)", "planet": "Mars", "deity": "Karttikeya", "goodFor": "Minerals and metals, medicine, fire, electricity, sport; surgery", "avoid": "Starting new things, travel, injuries, quarrels"}, {"no": 4, "day": "Wednesday (Budha)", "planet": "Mercury", "deity": "Vishnu", "goodFor": "Refined work, shopping, sales, business, logic, communication, marriage, medicines, printing and media", "avoid": "Lies, cruelty, violence, betting"}, {"no": 5, "day": "Thursday (Guru)", "planet": "Jupiter", "deity": "Guru", "goodFor": "Marriage, gifts, charity, buying and selling, financial planning, learning, meeting guru or boss, banking, new education", "avoid": "Anger, greed, lies"}, {"no": 6, "day": "Friday (Shukra)", "planet": "Venus", "deity": "Lakshmi / Durga", "goodFor": "Jewellery, clothes, flowers, fine arts, marriage, courting, pleasures, money matters, travel", "avoid": "Selling important things, loneliness"}, {"no": 7, "day": "Saturday (Shani)", "planet": "Saturn", "deity": "Vishnu / Hanuman", "goodFor": "Iron, land, farming, housing, yoga, meditation, rest", "avoid": "Fuss, beginning anything new, arguing, haircut and manicure"}],
    TITHI_ROWS: [{"no": "1 / 16", "name": "Pratipada", "type": "Nanda", "ruler": "Brahma / Agni", "goodFor": "Religious ceremonies, festivals, journeys, wedding, installation, vows, real estate, haircut", "avoid": "Dead on Sun/Tue if Moon in Bharani or Uttara Ashadha"}, {"no": "2 / 17", "name": "Dvitiya", "type": "Bhadra", "ruler": "Vidhata / Brahma", "goodFor": "Starting new work, foundations, wedding, jewellery", "avoid": "Dead on Mon/Fri when Moon in Chitra or Jyeshtha"}, {"no": "3 / 18", "name": "Tritiya", "type": "Jaya", "ruler": "Vishnu / Gauri", "goodFor": "Important business, wedding, first music lesson, first feeding, construction, hair and nails", "avoid": "Dead on Wed, very bad if Moon in Dhanishtha"}, {"no": "4 / 19", "name": "Chaturthi", "type": "Rikta", "ruler": "Yama / Ganesh", "goodFor": "Destroying enemies, removing obstacles, combat, cleaning, weapons and fire", "avoid": "Not good for auspicious work. Dead on Thu; very bad if Moon in Uttara Phalguni"}, {"no": "5 / 20", "name": "Panchami", "type": "Purna", "ruler": "Moon / Naga", "goodFor": "Completing work, medicine, surgery, wedding, healing", "avoid": "Dead on Sat"}, {"no": "6 / 21", "name": "Shashthi", "type": "Nanda", "ruler": "Karttikeya / Yaksha", "goodFor": "Coronation, construction, houses, jewellery, friendship, war", "avoid": "Not very auspicious for marriage. Dead on Sun/Tue, esp. Moon in Bharani/Uttara Ashadha"}, {"no": "7 / 22", "name": "Saptami", "type": "Bhadra", "ruler": "Indra / Surya", "goodFor": "Transport, conveyances, wedding, music, dance, decoration, journeys, exercise", "avoid": "Dead on Mon/Fri"}, {"no": "8 / 23", "name": "Ashtami", "type": "Jaya", "ruler": "Vasus / Shiva", "goodFor": "Arms, defence, fortification, architecture, debate, dance, studies, construction", "avoid": "Dead on Wed; marriage semi-auspicious"}, {"no": "9 / 24", "name": "Navami", "type": "Rikta", "ruler": "Serpent / Durga", "goodFor": "Killing enemies, violence, gambling, debate, hunting, marksmanship", "avoid": "Journey on the 9th is prohibited (urgent cases at a propitious moment). Dead on Thu; very bad if Moon in Uttara Phalguni"}, {"no": "10 / 25", "name": "Dashami", "type": "Purna", "ruler": "Dharma / Yama", "goodFor": "Virtuous acts, spiritual practice, entering a home, wedding, jewels, journeys, vehicles", "avoid": "Dead on Sat or if Moon in Revati"}, {"no": "11 / 26", "name": "Ekadashi", "type": "Nanda", "ruler": "Rudra / Vishvedeva", "goodFor": "Fasting, vows, wedding, construction, exercise, pilgrimage, festivals", "avoid": "Dead on Sun/Tue, esp. Moon in Bharani/Uttara Ashadha"}, {"no": "12 / 27", "name": "Dvadashi", "type": "Bhadra", "ruler": "Sun / Vishnu", "goodFor": "Religious ceremonies, sacred fire, duties, promises", "avoid": "Not for travel, oil bath, entering a new house; wedding not very auspicious. Dead on Mon/Fri, esp. Moon in Chitra/Jyeshtha"}, {"no": "13 / 28", "name": "Trayodashi", "type": "Jaya", "ruler": "Cupid / Kamadeva", "goodFor": "Important business, new clothes and jewels, struggle, promises, vows, pleasures", "avoid": "Pradosham (Shiva puja). Dead on Wed; very bad if Moon in Dhanishtha"}, {"no": "14 / 29", "name": "Chaturdashi", "type": "Rikta", "ruler": "Kali / Shiva", "goodFor": "War, killing, scriptures, Shivaratri", "avoid": "Avoid journeys, hair cutting, manicure; only routine work. Dead on Thu"}, {"no": "15", "name": "Purnima", "type": "Purna", "ruler": "Moon / Vishvedeva", "goodFor": "All auspicious work, construction, spiritual ceremonies", "avoid": "Avoid for upanayana and education (one source)"}, {"no": "30", "name": "Amavasya", "type": "Purna", "ruler": "Pitris", "goodFor": "Religious ceremonies, charity, rites for the departed, ancestor worship", "avoid": "Inauspicious for everything else"}],
    YOGA: [{"no": 1, "name": "Vishkambha", "meaning": "Poison pot", "quality": "Bad", "inauspicious": "First ~3 ghatis (about 1 h 17 min); one PDF says last 3 ghatis"}, {"no": 2, "name": "Priti", "meaning": "Gratification, love", "quality": "Good", "inauspicious": ""}, {"no": 3, "name": "Ayushman", "meaning": "Longevity", "quality": "Good", "inauspicious": ""}, {"no": 4, "name": "Saubhagya", "meaning": "Good fortune", "quality": "Good", "inauspicious": ""}, {"no": 5, "name": "Shobhana", "meaning": "Splendid", "quality": "Good", "inauspicious": ""}, {"no": 6, "name": "Atiganda", "meaning": "Many obstacles", "quality": "Bad", "inauspicious": "First 6 ghatis (about 2 h 24 min)"}, {"no": 7, "name": "Sukarma", "meaning": "Good work", "quality": "Good", "inauspicious": ""}, {"no": 8, "name": "Dhriti", "meaning": "Steadiness", "quality": "Good", "inauspicious": ""}, {"no": 9, "name": "Shula", "meaning": "Spear / trident", "quality": "Bad", "inauspicious": "First 5 ghatis (about 2 h)"}, {"no": 10, "name": "Ganda", "meaning": "Danger", "quality": "Bad", "inauspicious": "First 6 ghatis (about 2 h 24 min)"}, {"no": 11, "name": "Vriddhi", "meaning": "Growth", "quality": "Good", "inauspicious": ""}, {"no": 12, "name": "Dhruva", "meaning": "Permanent / steady", "quality": "Good (but rejected for marriage)", "inauspicious": ""}, {"no": 13, "name": "Vyaghata", "meaning": "Slaughter", "quality": "Bad", "inauspicious": "First 9 ghatis"}, {"no": 14, "name": "Harshana", "meaning": "Rejoicing", "quality": "Good", "inauspicious": ""}, {"no": 15, "name": "Vajra", "meaning": "Thunderbolt", "quality": "Bad", "inauspicious": "First ~3 ghatis"}, {"no": 16, "name": "Siddhi", "meaning": "Attainment", "quality": "Good", "inauspicious": ""}, {"no": 17, "name": "Vyatipata", "meaning": "Calamity", "quality": "Bad", "inauspicious": "**Whole** yoga (good only for shraddha and holy baths)"}, {"no": 18, "name": "Variyan", "meaning": "Better", "quality": "Good", "inauspicious": ""}, {"no": 19, "name": "Parigha", "meaning": "Iron club", "quality": "Bad", "inauspicious": "Sources conflict: first half hour in one, last 30 ghatis in another"}, {"no": 20, "name": "Shiva", "meaning": "Auspiciousness", "quality": "Good", "inauspicious": ""}, {"no": 21, "name": "Siddha", "meaning": "Accomplishment", "quality": "Good", "inauspicious": ""}, {"no": 22, "name": "Sadhya", "meaning": "Achievable", "quality": "Good", "inauspicious": ""}, {"no": 23, "name": "Shubha", "meaning": "Auspicious", "quality": "Good", "inauspicious": ""}, {"no": 24, "name": "Shukla", "meaning": "Bright", "quality": "Good", "inauspicious": ""}, {"no": 25, "name": "Brahma", "meaning": "Creator", "quality": "Good", "inauspicious": ""}, {"no": 26, "name": "Indra", "meaning": "King of the gods", "quality": "Good", "inauspicious": ""}, {"no": 27, "name": "Vaidhriti", "meaning": "Stopping, arresting", "quality": "Bad", "inauspicious": "**Whole** yoga"}],
    KARANA: [{"no": 1, "name": "Bava", "type": "Moving", "deity": "Vishnu (lion)", "goodFor": "Permanent works; incantation, improving health and power; start of any travel", "notes": "Good for works of lasting nature"}, {"no": 2, "name": "Balava", "type": "Moving", "deity": "Brahma (leopard)", "goodFor": "Yajnas, samskaras, coronation, spiritual and brahminical deeds", "notes": ""}, {"no": 3, "name": "Kaulava", "type": "Moving", "deity": "Indra (pig)", "goodFor": "Wedding, choosing a bride, friendship, love, decoration, government duties", "notes": ""}, {"no": 4, "name": "Taitila", "type": "Moving", "deity": "Chandra (donkey)", "goodFor": "Marriage, ceremonies, coronation, making friends, home work, permanent work", "notes": "Best for marriage"}, {"no": 5, "name": "Gara", "type": "Moving", "deity": "Vasudeva (elephant)", "goodFor": "Cultivating soil, sowing, building a house, animals, plowing, Vastu karma", "notes": ""}, {"no": 6, "name": "Vanija", "type": "Moving", "deity": "Manibhadra (cow)", "goodFor": "Trade, cooperation, travel, business, selling", "notes": ""}, {"no": 7, "name": "Vishti (Bhadra)", "type": "Moving", "deity": "Mrityu", "goodFor": "Violent or cruel deeds, destruction, tricks, court cases", "notes": "Unfit for any good work. Last 3 ghatis (about 72 min) are auspicious (10% to 0% of the karana left)"}, {"no": 8, "name": "Kimstughna", "type": "Fixed", "deity": "Worm", "goodFor": "Noble deeds, offerings, nutrition, auspicious rites", "notes": "One source lists it as good for noble deeds; another as theft and cheating"}, {"no": 9, "name": "Shakuni", "type": "Fixed", "deity": "Bird", "goodFor": "Initiation into kshudra mantras, herbs, medication, competition, taming birds", "notes": ""}, {"no": 10, "name": "Chatushpada", "type": "Fixed", "deity": "Cattle", "goodFor": "Shraddha, tarpana, ancestor rites, cattle business, government duties, politics", "notes": ""}, {"no": 11, "name": "Naga", "type": "Fixed", "deity": "Snake", "goodFor": "Work with immovable objects, cruel deeds, using power, competition", "notes": "Not good for undertaking any action"}],
    SIDDHA: {"0": {"tithi": "1, 4, 6, 7, 12", "nakshatras": ["Pushya", "Hasta", "Uttara Phalguni", "Uttara Ashadha", "Moola", "Shravana", "Uttara Bhadrapada"]}, "1": {"tithi": "2, 7, 12", "nakshatras": ["Rohini", "Mrigashira", "Punarvasu", "Chitra", "Shravana", "Shatabhisha", "Dhanishtha", "Purva Bhadrapada"]}, "2": {"tithi": "(Jaya 3, 8, 13)", "nakshatras": ["Ashwini", "Mrigashira", "Chitra", "Anuradha", "Moola", "Uttara Phalguni", "Dhanishtha", "Purva Bhadrapada"]}, "3": {"tithi": "Bhadra and Jaya", "nakshatras": ["Rohini", "Mrigashira", "Ardra", "Uttara Phalguni", "Uttara Ashadha", "Anuradha"]}, "4": {"tithi": "4, 5, 7, 9, 13, 14 (Purna 5, 10, 15)", "nakshatras": ["Magha", "Pushya", "Punarvasu", "Swati", "Purva Ashadha", "Purva Bhadrapada", "Revati", "Ashwini"]}, "5": {"tithi": "Nanda and Bhadra (1, 6, 11)", "nakshatras": ["Ashwini", "Bharani", "Ardra", "Uttara Phalguni", "Chitra", "Swati", "Purva Ashadha", "Revati"]}, "6": {"tithi": "Bhadra and Rikta (4, 9, 14)", "nakshatras": ["Swati", "Rohini", "Vishakha", "Anuradha", "Dhanishtha", "Shatabhisha"]}},            // weekday index -> {tithi text, nakshatras[]}
    AMITA_NAK: ["Hasta", "Shravana", "Ashwini", "Anuradha", "Pushya", "Revati", "Rohini"],      // Sun..Sat
    AMITA_NEGATING_TITHI: [5, 6, 7, 8, 9, 10, 11],   // Sun..Sat (Panchanga introduction; Monday pairing as printed)
    AMITA_FORBIDS: { 2: 'griha pravesha', 4: 'marriage', 6: 'travel' },
    KUYOGA: {"0": {"mrityu": "Anuradha", "dagdha": "Dvadashi", "dagdhaTithi": 12, "yamaghanta": "Magha"}, "1": {"mrityu": "Uttara Ashadha", "dagdha": "Ekadashi", "dagdhaTithi": 11, "yamaghanta": "Vishakha"}, "2": {"mrityu": "Shatabhisha", "dagdha": "Panchami", "dagdhaTithi": 5, "yamaghanta": "Ardra"}, "3": {"mrityu": "Ashwini", "dagdha": "Tritiya", "dagdhaTithi": 3, "yamaghanta": "Moola"}, "4": {"mrityu": "Mrigashira", "dagdha": "Shashthi", "dagdhaTithi": 6, "yamaghanta": "Krittika"}, "5": {"mrityu": "Ashlesha", "dagdha": "Ashtami", "dagdhaTithi": 8, "yamaghanta": "Rohini"}, "6": {"mrityu": "Hasta", "dagdha": "Navami", "dagdhaTithi": 9, "yamaghanta": "Hasta"}},
    TATKALIKA: [{"no": 1, "yoga": "Ananda", "result": "Arthasiddhi, prosperity, increase", "bad": false}, {"no": 2, "yoga": "Kaaldanda", "result": "Mrityubhaya, fear of death (bad)", "bad": true}, {"no": 3, "yoga": "Dhoomra", "result": "Dukha, unhappy (bad)", "bad": true}, {"no": 4, "yoga": "Prajapati", "result": "Saubhagya, opulence", "bad": false}, {"no": 5, "yoga": "Saumya", "result": "Bahusukha, happy", "bad": false}, {"no": 6, "yoga": "Dhwanksha", "result": "Arthanasha, ruin (bad)", "bad": true}, {"no": 7, "yoga": "Dhwaja", "result": "Saubhagya, opulence", "bad": false}, {"no": 8, "yoga": "Srivatsa", "result": "Aishvarya, lordship", "bad": false}, {"no": 9, "yoga": "Vajra", "result": "Dhanakshaya; always rich (check)", "bad": false}, {"no": 10, "yoga": "Mudgara", "result": "Dhananasha, penury, losses (bad)", "bad": true}, {"no": 11, "yoga": "Chatra", "result": "Rajasammana, like a king", "bad": false}, {"no": 12, "yoga": "Mitra", "result": "Saukhya, happy", "bad": false}, {"no": 13, "yoga": "Manasa", "result": "Saubhagya, opulence", "bad": false}, {"no": 14, "yoga": "Padma", "result": "Dhanagama, get wealth", "bad": false}, {"no": 15, "yoga": "Lumba", "result": "Lakshminasha, penury (bad)", "bad": true}, {"no": 16, "yoga": "Utpaata", "result": "Prananasha, lifeless (bad)", "bad": true}, {"no": 17, "yoga": "Mrityu", "result": "Maranabhaya, fear of death (bad)", "bad": true}, {"no": 18, "yoga": "Kaan", "result": "Kleshavriddhi, afflictions (bad)", "bad": true}, {"no": 19, "yoga": "Siddhi", "result": "Abhishtasiddhi, wishes satisfied", "bad": false}, {"no": 20, "yoga": "Shubha", "result": "Kalyana, auspicious", "bad": false}, {"no": 21, "yoga": "Amrita", "result": "Rajasammana, king-like", "bad": false}, {"no": 22, "yoga": "Mushala", "result": "Arthakshaya, destroys economy (bad)", "bad": true}, {"no": 23, "yoga": "Antaka (Guda)", "result": "Roga, buddhinasha, sick (bad)", "bad": true}, {"no": 24, "yoga": "Matanga", "result": "Kulavriddhi; shame for family (bad)", "bad": true}, {"no": 25, "yoga": "Raksha", "result": "Bahupeeda, bad influences (bad)", "bad": true}, {"no": 26, "yoga": "Chara", "result": "Karyalabha; greedy", "bad": false}, {"no": 27, "yoga": "Susthira", "result": "Grihaprapti, getting land, house", "bad": false}, {"no": 28, "yoga": "Pravardhamana", "result": "Sumangala, all auspicious", "bad": false}],
    KALA: {"0": {"rahu": 8, "yama": 5, "gulika": 7, "kuStart": 0.866667, "kuEnd": 0.933333}, "1": {"rahu": 2, "yama": 4, "gulika": 6, "kuStart": 0.466667, "kuEnd": 0.533333}, "2": {"rahu": 7, "yama": 3, "gulika": 5, "kuStart": 0.2, "kuEnd": 0.266667}, "3": {"rahu": 5, "yama": 2, "gulika": 4, "kuStart": 0.5, "kuEnd": 0.541667}, "4": {"rahu": 6, "yama": 1, "gulika": 3, "kuStart": 0.733333, "kuEnd": 0.8}, "5": {"rahu": 4, "yama": 7, "gulika": 2, "kuStart": 0.2, "kuEnd": 0.266667}, "6": {"rahu": 3, "yama": 6, "gulika": 1, "kuStart": 0.0, "kuEnd": 0.133333}},                // weekday -> yama segments (1..8) for Rahu/Yama/Gulika + ku-muhurta fractions of the day
    CHOGHADIYA: {"day": [["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"], ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"], ["Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"], ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh"], ["Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh"], ["Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal"], ["Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal"]], "night": [["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh"], ["Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal"], ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal"], ["Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg"], ["Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"], ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog"], ["Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh"]]},    // {day:[7][8], night:[7][8]}
    MUHURTAS: [{"no": 1, "time": "06:00 to 06:48", "name": "Rudra", "effect": "−"}, {"no": 2, "time": "06:48 to 07:36", "name": "Ahi", "effect": "−"}, {"no": 3, "time": "07:36 to 08:24", "name": "Mitra", "effect": "+"}, {"no": 4, "time": "08:24 to 09:12", "name": "Pitru", "effect": "−"}, {"no": 5, "time": "09:12 to 10:00", "name": "Vasu", "effect": "+"}, {"no": 6, "time": "10:00 to 10:48", "name": "Vara", "effect": "+"}, {"no": 7, "time": "10:48 to 11:36", "name": "Vishvedeva", "effect": "+"}, {"no": 8, "time": "11:36 to 12:24", "name": "Vidhi (Abhijit)", "effect": "+"}, {"no": 9, "time": "12:24 to 13:12", "name": "Shatamukhi", "effect": "+"}, {"no": 10, "time": "13:12 to 14:00", "name": "Puruhuta", "effect": "−"}, {"no": 11, "time": "14:00 to 14:48", "name": "Vahni", "effect": "−"}, {"no": 12, "time": "14:48 to 15:36", "name": "Naktancara", "effect": "−"}, {"no": 13, "time": "15:36 to 16:24", "name": "Varuna", "effect": "+"}, {"no": 14, "time": "16:24 to 17:12", "name": "Aryama", "effect": "+"}, {"no": 15, "time": "17:12 to 18:00", "name": "Bhaga", "effect": "−"}, {"no": 16, "time": "18:00 to 18:48", "name": "Girisa", "effect": "−"}, {"no": 17, "time": "18:48 to 19:36", "name": "Ajapada", "effect": "−"}, {"no": 18, "time": "19:36 to 20:24", "name": "Ahirbudhnya", "effect": "+"}, {"no": 19, "time": "20:24 to 21:12", "name": "Pusha", "effect": "+"}, {"no": 20, "time": "21:12 to 22:00", "name": "Ashvini", "effect": "+"}, {"no": 21, "time": "22:00 to 22:48", "name": "Yama", "effect": "−"}, {"no": 22, "time": "22:48 to 23:36", "name": "Agni", "effect": "−"}, {"no": 23, "time": "23:36 to 00:24", "name": "Vidhatri", "effect": "+"}, {"no": 24, "time": "00:24 to 01:12", "name": "Chanda", "effect": "+"}, {"no": 25, "time": "01:12 to 02:00", "name": "Aditi", "effect": "+"}, {"no": 26, "time": "02:00 to 02:48", "name": "Jiva", "effect": "+"}, {"no": 27, "time": "02:48 to 03:36", "name": "Vishnu", "effect": "+"}, {"no": 28, "time": "03:36 to 04:24", "name": "Yumigadyuti", "effect": "+"}, {"no": 29, "time": "04:24 to 05:12", "name": "Brahma", "effect": "+"}, {"no": 30, "time": "05:12 to 06:00", "name": "Samudra", "effect": "+"}],
    PANCHAKA: [{"rem": "0, 3, 5, 7", "result": "Good", "avoid": ""}, {"rem": "1", "result": "Mrityu panchaka: danger", "avoid": "marriage and upanayanam"}, {"rem": "2", "result": "Agni panchaka: risk from fire", "avoid": "house building and entering"}, {"rem": "4", "result": "Raja panchaka: problems with authorities", "avoid": "job matters, travel (visas), marriage, house building"}, {"rem": "6", "result": "Chora panchaka: thieves, evil happenings", "avoid": "travel"}, {"rem": "8", "result": "Roga panchaka: disease", "avoid": "house building, marriage, upanayanam"}],
    RISING_SIGNS: [{"sign": "Aries", "strength": "Night", "guna": "Rajas, daivik, Kshatriya", "theme": "Action", "direction": "East", "caution": "Blind by day: obstacles, destruction"}, {"sign": "Taurus", "strength": "Night", "guna": "Tamas, asuric, Vaishya", "theme": "Pleasure", "direction": "South", "caution": "Blind by day"}, {"sign": "Gemini", "strength": "Night", "guna": "Sattvik, asuric, Shudra", "theme": "Sharing", "direction": "West", "caution": "Blind at night"}, {"sign": "Cancer", "strength": "Night", "guna": "Rajas, daivik, Brahmin", "theme": "Caring", "direction": "North", "caution": "Blind at night and/or deaf at midday (loss of property)"}, {"sign": "Leo", "strength": "Day", "guna": "Tamas, daivik, Kshatriya", "theme": "Power", "direction": "East", "caution": "Blind by day"}, {"sign": "Virgo", "strength": "Day", "guna": "Sattvik, asuric, Vaishya", "theme": "Purity", "direction": "South", "caution": "Deaf at midday"}, {"sign": "Libra", "strength": "Day", "guna": "Rajas, asuric, Shudra", "theme": "Business", "direction": "West", "caution": "Deaf in the morning"}, {"sign": "Scorpio", "strength": "Day", "guna": "Tamas, daivik, Brahmin", "theme": "Privacy", "direction": "North", "caution": "Deaf in the morning"}, {"sign": "Sagittarius", "strength": "Night", "guna": "Sattvik, daivik, Kshatriya", "theme": "Goals", "direction": "East", "caution": "Deaf in the evening"}, {"sign": "Capricorn", "strength": "Night", "guna": "Rajas, asuric, Vaishya", "theme": "Hard work; needs a planet to activate", "direction": "South", "caution": "Deaf in the evening"}, {"sign": "Aquarius", "strength": "Day", "guna": "Tamas, asuric, Shudra", "theme": "Scientific", "direction": "West", "caution": "Lame at twilight: adverse effect on longevity"}, {"sign": "Pisces", "strength": "Day", "guna": "Sattvik, daivik, Brahmin", "theme": "Peace", "direction": "North", "caution": "Lame at twilight"}],
    DOSHAS: [{"no": 1, "name": "Panchanga shuddhi", "rule": "Tithi, vara, nakshatra, yoga and karana must all be fit"}, {"no": 2, "name": "Surya sankramana", "rule": "Avoid 16 ghatis (6 h 24 min) before and after the Sun's sign ingress"}, {"no": 3, "name": "Karthari", "rule": "Two malefics on either side of the lagna (scissors), especially for marriage"}, {"no": 4, "name": "Shashtashta riphagata Chandra", "rule": "Moon in the 6th, 8th, 12th from the lagna"}, {"no": 5, "name": "Sagraha Chandra", "rule": "Moon with any other planet"}, {"no": 6, "name": "Udayasta shuddhi", "rule": "Lagna and 7th must be strong, lords well placed"}, {"no": 7, "name": "Durmuhurta", "rule": "See section 8"}, {"no": 8, "name": "Gandanta", "rule": "See tithi and nakshatra gandanta"}, {"no": 9, "name": "Papashadvarga", "rule": "Malefics should not be strong in shadvargas"}, {"no": 10, "name": "Bhrigu shatka", "rule": "Venus in the 6th, even if exalted"}, {"no": 11, "name": "Kujashtama", "rule": "Mars in the 8th (unthinkable for marriage)"}, {"no": 12, "name": "Ashtama lagna", "rule": "Lagna is the 8th from the janma lagna of bride or groom"}, {"no": 13, "name": "Rashi visha ghatika", "rule": "Lagna tyajya periods"}, {"no": 14, "name": "Kunavamsa", "rule": "Lagna in a malefic's navamsa"}, {"no": 15, "name": "Vara dosha", "rule": "Certain weekdays for certain activities"}, {"no": 16, "name": "Grahanotpata", "rule": "Nakshatra where an eclipse occurred (6 months for marriage)"}, {"no": 17, "name": "Ekargala", "rule": "Yogas such as Vishkambha, active by day only; minor"}, {"no": 18, "name": "Krura samyuta", "rule": "The Sun's nakshatra and the ones before and after it"}, {"no": 19, "name": "Akalagarjita vrishti", "rule": "Out-of-season rain and thunder"}, {"no": 20, "name": "Mahapatha", "rule": "Sun and Moon at equal declination on the same side (Vyatipata)"}, {"no": 21, "name": "Vaidhriti", "rule": "Evil yoga"}],
    ACTIVITIES: [{"activity": "Marriage", "tithis": "Magha, Phalguna, Vaisakha, Jyeshtha good; Kartika, Margasira ordinary (Pushya and Chaitra only if Sun in Capricorn/Aries). Best tithis: 2, 3, 5, 7, 10, 11, 13 of Shukla; reject Krishna 11th to Amavasya, Rikta, 8, 12, 6", "nakshatras": "Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Moola, Uttara Ashadha, Uttara Bhadrapada, Revati. First pada of Magha and Moola and last pada of Revati rejected", "lagna": "Gemini, Virgo, Libra best; Taurus, Cancer, Leo, Sagittarius, Aquarius middling. 7th empty, no Mars in 8th, no Venus in 6th, lagna not between malefics, Moon unaccompanied, Vishti karana rejected. Tuesday always rejected"}, {"activity": "Nuptials (nishekha)", "tithis": "Avoid 4, 8, 9, 14, Full/New Moon", "nakshatras": "Highly favourable: Shravana, Rohini, Anuradha, Swati, Revati, Moola, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Shatabhisha. Ordinary: Pushya, Dhanishtha, Mrigashira, Ashwini, Chitra, Punarvasu", "lagna": "Taurus to Libra and Pisces favourable. Avoid Janma star, 10th, 19th. No planet in the 8th"}, {"activity": "Pumsavanam (3rd month of pregnancy)", "tithis": "Avoid 4, 6, 8, 9, 12, 14, Full/New Moon", "nakshatras": "", "lagna": "All signs except Gemini, Cancer, Virgo (Virgo specially adverse); 8th empty"}, {"activity": "Seemantha (5th or 7th month)", "tithis": "Avoid 4, 6, 8, 9, 14, New Moon; Sun/Tue/Sat avoided", "nakshatras": "Rohini, Mrigashira, Punarvasu, Pushya, Uttara Phalguni, Uttara Ashadha, Hasta, Shravana, Revati", "lagna": "All signs except Leo and Scorpio; 8th free"}, {"activity": "Naming (namakarana)", "tithis": "10th, 12th or 16th day after birth. Avoid 4, 6, 8, 9, 12, 14, Full/New Moon", "nakshatras": "Anuradha, Punarvasu, Magha, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Shatabhisha, Swati, Dhanishtha, Shravana, Rohini, Ashwini, Mrigashira, Revati, Hasta, Pushya", "lagna": "Fixed signs preferable; 8th empty. Male names: even number of letters; female names: odd number"}, {"activity": "First feeding (annaprasana)", "tithis": "6th, 8th, 9th or 12th month", "nakshatras": "Ashwini, Mrigashira, Punarvasu, Dhanishtha, Pushya, Hasta, Swati, Anuradha, Shravana, Shatabhisha, Uttara Phalguni, Chitra. Avoid Ardra, Krittika, Jyeshtha, Bharani, Ashlesha, Purva Ashadha, Purva Bhadrapada", "lagna": "Avoid Aries, Scorpio, Pisces; 10th empty"}, {"activity": "Ear piercing", "tithis": "12th or 16th day, or 6th, 7th, 8th month; forenoon or afternoon, never at night", "nakshatras": "", "lagna": "8th empty; avoid Aquarius, Leo, Scorpio"}, {"activity": "Tonsure (chowlam)", "tithis": "2, 3, 6, 7, 10, 11, 13 good; Shukla gives longevity", "nakshatras": "Punarvasu, Mrigashira, Dhanishtha, Shravana, Revati, Pushya, Chitra, Ashwini, Hasta favourable", "lagna": "Cancer, Virgo, Gemini, Pisces, Libra, Taurus, Capricorn rising; never Aquarius. Forenoon"}, {"activity": "Beginning education (aksharabhyasa)", "tithis": "6th day of the 5th month of the 5th year is best. Good tithis 1 (Krishna), 2, 3, 5, 6, 10, 11", "nakshatras": "Ashwini, Punarvasu, Ardra, Hasta, Chitra, Swati, Shravana, Revati (broader list: Mrigashira, Pushya, Dhanishtha, Shatabhisha)", "lagna": "Movable and common signs; forenoon or noon; 8th empty. Saraswati and Vidya yogas listed in the source"}, {"activity": "Upanayanam", "tithis": "Northern course of the Sun; Magha, Phalguna, Chaitra, Vaisakha; Shukla 2, 3, 5, 7, 10, 13 and Krishna 1, 2, 3", "nakshatras": "Anuradha, Hasta, Chitra, Swati, Shravana, Dhanishtha, Shatabhisha, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Revati, Rohini, Mrigashira, Ashwini, Punarvasu, Pushya", "lagna": "Aries, Taurus, Gemini, Cancer, Virgo, Libra, Aquarius. Moon not in 6, 8, 12. Tuesday invariably rejected. Before noon"}, {"activity": "New clothes", "tithis": "Avoid 4, 9, 14, New Moon", "nakshatras": "Ashwini, Rohini, Punarvasu, Pushya, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Dhanishtha, Revati", "lagna": "Moon in good aspect to the Sun"}, {"activity": "Foundation stone", "tithis": "Chaitra, Vaisakha, Shravana, Kartika, Magha best; odd tithis except 9 and even 2, 6, 10", "nakshatras": "Rohini, Mrigashira, Chitra, Hasta, Jyeshtha, Uttara Phalguni, Uttara Ashadha, Shravana best; Swati, Pushya, Anuradha, Ashwini, Shatabhisha, Uttara Bhadrapada, Revati middling", "lagna": "Fixed signs; malefics in 3, 6, 11; benefics in kendras and trines; 8th empty. Sun in fixed or movable sign"}, {"activity": "Door frame", "tithis": "", "nakshatras": "Rohini, Mrigashira, Uttara Phalguni, Chitra, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati", "lagna": "Fixed lagna"}, {"activity": "Digging wells", "tithis": "", "nakshatras": "Revati, Uttara Bhadrapada, Hasta, Anuradha, Magha, Shravana, Rohini, Pushya", "lagna": "Pisces, Cancer or Capricorn rising; Venus and Moon in kendras"}, {"activity": "Griha pravesha (entering a house)", "tithis": "Sun in Uttarayana", "nakshatras": "", "lagna": "Jupiter and Venus strong. Avoid tithi 12"}, {"activity": "Installing a deity", "tithis": "Sun in Uttarayana; avoid Magha. Odd tithis except 9, plus 2, 6, 10", "nakshatras": "Rohini, Mrigashira, Punarvasu, Pushya, Uttara Phalguni, Hasta, Swati, Uttara Ashadha, Uttara Bhadrapada", "lagna": "Fixed lagna (common for a female deity); no planet in the 8th, no malefic in the 7th"}, {"activity": "Journeys", "tithis": "Best 2, 3, 5, 7, 10, 11, 13; avoid 9, 14, Full/New Moon", "nakshatras": "Early-return stars: Mrigashira, Ashwini, Pushya, Punarvasu, Hasta, Anuradha, Shravana, Moola, Dhanishtha, Revati", "lagna": "Favourable signs Aries, Taurus, Cancer, Leo, Libra, Sagittarius. Moon in 3, 6, 9, 12 with Jupiter in a kendra; Mars not in 8. Avoid lagna being 5th, 7th, 9th from janma lagna"}, {"activity": "Starting medical treatment", "tithis": "", "nakshatras": "Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Hasta, Chitra, Swati, Anuradha, Shravana, Dhanishtha, Shatabhisha, Revati", "lagna": "Monday, Wednesday, Thursday, Friday. Surgery: Tuesday or Saturday, Mars powerful, 8th empty; do not operate on the body part of the Moon's current sign"}, {"activity": "Plowing", "tithis": "All tithis except 4, 6, 8, 9, 10, New Moon", "nakshatras": "Rohini, Punarvasu, Pushya, Uttara Phalguni, Hasta, Anuradha, Moola, Uttara Ashadha, Uttara Bhadrapada", "lagna": "Taurus, Gemini, Cancer, Capricorn, Pisces rising; avoid Scorpio and Aquarius; start east or north"}, {"activity": "Sowing and planting", "tithis": "Odd tithis except 9; even only 2, 4", "nakshatras": "Hasta, Chitra, Swati, Magha, Pushya, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Rohini, Revati, Ashwini, Moola, Anuradha", "lagna": "Lagna owned by the lord of the weekday; Moon waxing; Cancer, Scorpio or Pisces rising (see the crop-by-sign list in the source)"}, {"activity": "Reaping and harvest", "tithis": "Avoid 4, 8, 9, 11, 12, 14, New Moon", "nakshatras": "Bharani, Rohini, Mrigashira, Ardra, Pushya, Magha, Uttara Phalguni, Hasta, Vishakha, Anuradha, Uttara Ashadha, Shravana", "lagna": "Taurus, Gemini, Virgo, Libra, Sagittarius or Pisces rising"}, {"activity": "Lending / borrowing money", "tithis": "", "nakshatras": "Do not lend on Krittika, Magha, Moola, Shatabhisha, Uttara Phalguni, Punarvasu or the Janma star; do not borrow on Krittika, Moola, Punarvasu, Dhanishtha or Janma star", "lagna": "Avoid Tuesday and Friday; never lend on a Saturday New Moon"}, {"activity": "Business purchases", "tithis": "10th tithi best", "nakshatras": "Pushya best", "lagna": "Thursday best, Tuesday rejected. Mercury strong"}, {"activity": "Filing lawsuits", "tithis": "Avoid unfavourable tithis", "nakshatras": "Ashwini, Rohini, Mrigashira, Pushya, Uttara Phalguni, Hasta, Chitra, Anuradha, Dhanishtha, Revati", "lagna": "Avoid Tuesday and Saturday; Jupiter in a trine; no malefic in 6th"}, {"activity": "Lotteries and competitions", "tithis": "Tithis 2, 3, 5, 6, 11, 13", "nakshatras": "Ashwini, Bharani, Punarvasu, Pushya, Hasta, Chitra, Vishakha, Purva Ashadha, Revati", "lagna": "Benefic lagna; fortify Moon, 5th and 9th; no Mars in the 8th. Much reliance should not be placed on a muhurta for chance games"}, {"activity": "Learning", "tithis": "", "nakshatras": "Astrology and astronomy: Ashwini, Punarvasu, Pushya, Hasta, Swati, Moola, Revati. Vedas and shastras: Pushya, Dhanishtha, Shravana. Medicine: Dhanishtha. Music and dance: Hasta, Pushya, Dhanishtha, Anuradha, Jyeshtha, Revati, Shatabhisha, Uttara Ashadha, Uttara Bhadrapada", "lagna": "Strengthen Mercury (learning), Venus (arts), Jupiter (Vedas)"}],
    WEIGHTS: [{"rank": 1, "element": "Tarabala", "points": 160, "check": "Moon's transit star vs natal star (only for an individual)"}, {"rank": 2, "element": "Chandrabala", "points": 100, "check": "Moon strong (full, waxing), not in dusthana or dusthana from natal, not in tyajya or visha ghatika"}, {"rank": 3, "element": "Lagna and lagna lord", "points": 100, "check": "Strong, not in dusthana, afflicted, debilitated, combust or in planetary war; fit the lagna (2-hour slot) into an appropriate muhurta (Abhijit is best, Sun in 10th); karaka planet of the task in good shape; sign type (movable, fixed, dual) chosen for the task"}, {"rank": 4, "element": "Yoga", "points": 32, "check": "Fits the action; yogi planet benefic"}, {"rank": 5, "element": "Karana", "points": 16, "check": "Karana is stability of the project, ruled by Jupiter"}, {"rank": 6, "element": "Vara", "points": 8, "check": "Weekday fits the activity"}, {"rank": 7, "element": "Nakshatra of Moon", "points": 4, "check": "Favourable, avoid bad star combinations"}, {"rank": 8, "element": "Tithi", "points": 1, "check": "One of 5 types; avoid bad tithi-vara or tithi-nakshatra combinations"}],
    CALENDAR: [{"sign": "Aries", "solar": "Mesha", "lunar": "Chaitra", "ritu": "Vasanta (spring) with Taurus"}, {"sign": "Taurus", "solar": "Vrishabha", "lunar": "Vaishakha", "ritu": ""}, {"sign": "Gemini", "solar": "Mithuna", "lunar": "Jyeshtha", "ritu": "Grishma (summer) with Cancer"}, {"sign": "Cancer", "solar": "Karka", "lunar": "Ashadha", "ritu": ""}, {"sign": "Leo", "solar": "Simha", "lunar": "Shravana", "ritu": "Varsha (monsoon) with Virgo"}, {"sign": "Virgo", "solar": "Kanya", "lunar": "Bhadrapada", "ritu": ""}, {"sign": "Libra", "solar": "Tula", "lunar": "Ashvina", "ritu": "Sharad (autumn) with Scorpio"}, {"sign": "Scorpio", "solar": "Vrishchika", "lunar": "Kartika", "ritu": ""}, {"sign": "Sagittarius", "solar": "Dhanus", "lunar": "Margashirsha", "ritu": "Hemanta (winter) with Capricorn"}, {"sign": "Capricorn", "solar": "Makara", "lunar": "Pushya", "ritu": ""}, {"sign": "Aquarius", "solar": "Kumbha", "lunar": "Magha", "ritu": "Shishira with Pisces"}, {"sign": "Pisces", "solar": "Mina", "lunar": "Phalguna", "ritu": ""}],
    SAMVATSARA: ["Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", "Shrimukha", "Bhava", "Yuvan", "Dhatri", "Ishvara", "Bahudhanya", "Pramathin", "Vikrama", "Vrisha", "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit", "Sarvadharin", "Virodhin", "Vikrita", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha", "Hemalambin", "Vilambin", "Vikarin", "Sharvari", "Plava", "Shubhakrit", "Shobhana", "Krodhin", "Vishvavasu", "Parabhava", "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paritapin", "Pramadin", "Ananda", "Rakshasa", "Nala", "Pingala", "Kalayukti", "Siddharthin", "Raudra", "Durmati", "Dundubhi", "Rudhirodgarin", "Raktaksha", "Krodhana", "Kshaya"],

    TITHI_CLASS: { 1: 'Nanda', 2: 'Bhadra', 3: 'Jaya', 4: 'Rikta', 5: 'Purna' },   // (tithi-1)%5 + 1 pattern within a paksha
    SIDDHA_TITHI_WEEKDAY: { Nanda: 5, Bhadra: 3, Jaya: 2, Rikta: 6, Purna: 4 },    // class -> weekday (Fri, Wed, Tue, Sat, Thu)
    BEST_TITHIS: [2, 3, 5, 7, 10, 11, 13],
    REJECT_TITHIS: [4, 6, 8, 9, 12, 14, 30],
    DAGDHA_RASHI: { 1: [6, 9], 12: [6, 9], 2: [8, 11], 11: [8, 11], 3: [4, 9], 4: [1, 10], 5: [2, 5], 8: [2, 5], 6: [0, 4], 7: [3, 8], 9: [4, 7], 10: [4, 7], 13: [1, 4], 14: [11, 2, 5, 8], 15: [], 30: [] },
    BAD_VARA_MUHURTA: [
        { day: 6, muhurta: 'Rudra and Ahi (06:00-07:36)' }, { day: 0, muhurta: 'Aryama (16:24-17:12)' }, { day: 1, muhurta: 'Vidhi/Abhijit (11:36-12:24)' },
        { day: 2, muhurta: 'Pitru (08:24-09:12)' }, { day: 3, muhurta: 'Abhijit (12:00-12:30)' }, { day: 4, muhurta: 'Naktancara (14:48-15:36)' }, { day: 5, muhurta: 'Pitru (08:24-09:12)' }
    ],
    DIURNAL_BAD_MUHURTAS: [1, 2, 4, 10, 11, 12, 15],
    NOCTURNAL_BAD_MUHURTAS: [1, 2, 6, 7],
    TRAVEL_DIRECTION_BAN: { 0: 'west', 1: 'east', 2: 'north', 3: 'north', 4: 'south', 5: 'west', 6: 'east' },
    TRAVEL_BAN_LIFTS_AFTER_GHATI: { 0: 15, 1: 8, 2: 12, 3: 12, 4: 22, 5: 15, 6: 8 },
    NEUTRALISERS: [
        'Lagna tyajya applies only on the specific weekdays (see lagnaTyajya).',
        'Chandrashtama is harmless if the Moon is waxing in a benefic sign and navamsa, or Tarabala holds.',
        'Tuesday is not evil after midday; Vyatipata-type aspects lapse after midday.',
        'No weekday is blemished if its lord is strong.',
        'Venus, Mercury or Jupiter in the ascendant destroys all other adverse influences.',
        'Jupiter dispels the evils of lagna, navamsa and malefic aspects.',
        'The Sun or Moon in the 11th is an antidote.',
        'Well-fortified angles; a planet exalted in lagna.',
        'Jupiter or Venus in a kendra with malefics in 3, 6, 11 removes flaws from weekday, nakshatra, tithi and yoga.',
        'Abhijit muhurta is said to remove the doshas present at that time (but not on Wednesday; no travel south).'
    ],
    INDU_KALAS: { Sun: 30, Moon: 16, Mars: 6, Mercury: 8, Jupiter: 10, Venus: 12, Saturn: 1 },

    // ---------- helpers ----------
    _n: function (x) { return ((x % 360) + 360) % 360; },
    _R: function () { return window.NAKSHATRA_REFERENCE; },

    // ---------- the five limbs ----------
    tithiInfo: function (sunSid, moonSid) {
        const elong = this._n(moonSid - sunSid), no = Math.floor(elong / 12) + 1, inTithi = (elong % 12) / 12;
        const k = ((no - 1) % 15) + 1;
        const row = no === 15 ? this.TITHI_ROWS[14] : (no === 30 ? this.TITHI_ROWS[15] : this.TITHI_ROWS[k - 1]);
        const name = no === 15 ? 'Purnima' : (no === 30 ? 'Amavasya' : this.TITHI_NAMES[k - 1]);
        const cls = (no === 30 || no === 15) ? 'Purna' : this.TITHI_CLASS[((k - 1) % 5) + 1];
        return { no: no, name: name, paksha: no <= 15 ? 'Shukla' : 'Krishna', class: cls, ruler: row.ruler, goodFor: row.goodFor, avoid: row.avoid,
                 percentLeft: Math.round((1 - inTithi) * 1000) / 10,
                 best: this.BEST_TITHIS.indexOf(k) >= 0 && no !== 30, general_reject: this.REJECT_TITHIS.indexOf(no <= 15 ? no : no) >= 0 || this.REJECT_TITHIS.indexOf(k) >= 0 };
    },
    yogaInfo: function (sunSid, moonSid) {
        const v = this._n(sunSid + moonSid), no = Math.floor(v / this.NAK) + 1, row = this.YOGA[no - 1];
        return { no: no, name: row.name, meaning: row.meaning, quality: row.quality, inauspiciousPortion: row.inauspicious, percentLeft: Math.round((1 - (v % this.NAK) / this.NAK) * 1000) / 10,
                 wholeBad: no === 17 || no === 27, forMarriageRejected: [17, 12, 10, 15, 9, 1, 6, 13, 19].indexOf(no) >= 0 };
    },
    karanaInfo: function (sunSid, moonSid) {
        const half = Math.floor(this._n(moonSid - sunSid) / 6);          // 0..59
        let name;
        if (half === 0) name = 'Kimstughna';
        else if (half <= 56) name = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'][(half - 1) % 7];
        else name = ['Shakuni', 'Chatushpada', 'Naga'][half - 57];
        const row = this.KARANA.find(k => k.name.indexOf(name) === 0);
        return { halfTithi: half + 1, name: name, type: row.type, goodFor: row.goodFor, notes: row.notes, percentLeft: Math.round((1 - (this._n(moonSid - sunSid) % 6) / 6) * 1000) / 10 };
    },
    /** Bhadra (Vishti) malefic condition: night 2nd half of tithis 3,4,10,11 or day 1st half of 7,8,14,15 (md section 5). */
    bhadraMalefic: function (tithiNoInPaksha, isSecondHalfOfTithi, isDay) {
        const t = tithiNoInPaksha;
        return (!isDay && isSecondHalfOfTithi && [3, 4, 10, 11].indexOf(t) >= 0) || (isDay && !isSecondHalfOfTithi && [7, 8, 14, 15].indexOf(t) >= 0);
    },
    varaInfo: function (date, sunriseHour) {
        // Vedic day runs sunrise to sunrise: before sunrise it is still the previous weekday.
        const d = new Date(date), h = d.getHours() + d.getMinutes() / 60;
        let w = d.getDay(); if (sunriseHour !== undefined && h < sunriseHour) w = (w + 6) % 7;
        const v = this.VARA[w];
        return { index: w, day: v.day, planet: v.planet, deity: v.deity, goodFor: v.goodFor, avoid: v.avoid, goodDay: [1, 3, 4, 5].indexOf(w) >= 0,
                 travelBan: this.TRAVEL_DIRECTION_BAN[w] + ' (lifts after ghati ' + this.TRAVEL_BAN_LIFTS_AFTER_GHATI[w] + ')' };
    },
    nakshatraInfo: function (moonSid) {
        const R = this._R(), f = R.fromLongitude(moonSid), n = f.nakshatra;
        return { no: n.n, name: n.name, pada: f.pada, akshar: f.akshar, class: n.classLabel, quality: n.quality, nature: n.nature,
                 gandanta: R.getGandanta(moonSid), panchaka: R.isPanchaka(n.name, f.pada), unfitForGoodStarts: !!n.unfitForGoodStarts };
    },

    // ---------- weekday combinations ----------
    siddhaYoga: function (weekday, tithiNo, nakName) {
        const cls = tithiNo === 30 ? 'Purna' : this.TITHI_CLASS[(((tithiNo - 1) % 15) % 5) + 1];
        const byTithi = this.SIDDHA_TITHI_WEEKDAY[cls] === weekday;
        const byNak = this.SIDDHA[weekday].nakshatras.indexOf(nakName) >= 0;
        return { tithiWeekday: byTithi, nakshatraWeekday: byNak, any: byTithi || byNak, tithiClass: cls };
    },
    amitaSiddha: function (weekday, nakName, tithiNo) {
        const ok = this.AMITA_NAK[weekday] === nakName || (weekday === 1 && nakName === 'Mrigashira');
        if (!ok) return { active: false };
        const k = ((tithiNo - 1) % 15) + 1, cancelled = this.AMITA_NEGATING_TITHI[weekday] === k;
        return { active: !cancelled, cancelledByTithi: cancelled, forbids: cancelled ? (this.AMITA_FORBIDS[weekday] || null) : null,
                 conflict: weekday === 1 ? 'Monday pairing differs between PDFs (Shravana vs Mrigashira) - check' : null };
    },
    kuYogas: function (weekday, nakName, tithiNo) {
        const row = this.KUYOGA[weekday], k = ((tithiNo - 1) % 15) + 1, out = [];
        if (row.mrityu === nakName) out.push({ name: 'Mrityu yoga', why: nakName + ' on ' + this.DAYS[weekday] });
        if (row.dagdhaTithi === k && tithiNo !== 30) out.push({ name: 'Dagdha yoga', why: row.dagdha + ' on ' + this.DAYS[weekday] });
        if (row.yamaghanta === nakName) out.push({ name: 'Yamaghanta yoga', why: nakName + ' on ' + this.DAYS[weekday] + ': no consecration, new home or travel; Shanti Homa for a birth' });
        return out;
    },
    /** Position (1..28) of the Moon in the 28-nakshatra count with Abhijit (6deg40'-10deg53'20" Capricorn) at 22. */
    pos28: function (moonSid) {
        const l = this._n(moonSid);
        if (l >= 276 + 2 / 3 && l < 280 + 8 / 9) return 22;
        const i = Math.floor(l / this.NAK);
        return i <= 20 ? i + 1 : i + 2;
    },
    tatkalikaYoga: function (weekday, moonSid) {
        const p = this.pos28(moonSid), k = ((((p - 1 - 4 * weekday) % 28) + 28) % 28) + 1, t = this.TATKALIKA[k - 1];
        return { no: k, yoga: t.yoga, result: t.result, bad: t.bad,
                 note: t.bad ? 'A bad yoga plus a good yoga wipes out the bad; two bad yogas make it really bad; malefic yogas act at night only. A count of 4,6,9,10,13,20 from the Moon\'s star to the Sun\'s star gives Ravi yoga, which cancels bad effects.' : '' };
    },
    /** Panchaka (energy): (tithi + weekday(Sun=1) + nakshatra + lagna sign) mod 9. tithiNumbering 'continuous' (1-30) or 'paksha' (1-15). */
    panchakaEnergy: function (tithiNo, weekday, nakNo, lagnaSignNo, tithiNumbering) {
        const t = (tithiNumbering === 'paksha') ? ((tithiNo - 1) % 15) + 1 : tithiNo;
        const total = t + (weekday + 1) + nakNo + lagnaSignNo, rem = total % 9, row = this.PANCHAKA.find(r => r.rem.split(',').map(x => parseInt(x)).indexOf(rem) >= 0) || null;
        return { total: total, remainder: rem, result: row ? row.result : null, avoid: row ? row.avoid : null };
    },
    dagdhaRashi: function (tithiNo, moonSign) {
        const k = tithiNo === 30 ? 30 : (tithiNo === 15 ? 15 : ((tithiNo - 1) % 15) + 1), list = this.DAGDHA_RASHI[k] || [];
        return { signs: list.map(s => this.SIGNS[s]), hit: moonSign !== undefined && list.indexOf(moonSign) >= 0 };
    },
    tithiGandanta: function (tithiNo, percentLeft) {
        const k = ((tithiNo - 1) % 15) + 1, ghatis = percentLeft * 60 / 100;
        const last = ([5, 10, 15].indexOf(k) >= 0 && ghatis <= 2), first = ([6, 11, 1].indexOf(k) >= 0 && tithiNo > 15 && (60 - ghatis) <= 2);
        return last ? 'last 2 ghatis of tithi ' + k : (first ? 'first 2 ghatis of Krishna tithi ' + k : null);
    },

    // ---------- Moon checks ----------
    chandrabala: function (natalMoonSign, transitMoonSign, waxing) {
        const house = ((transitMoonSign - natalMoonSign + 12) % 12) + 1, bad = [6, 8, 12].indexOf(house) >= 0;
        return { house: house, ok: !bad, chandrashtama: house === 8,
                 note: house === 8 && waxing ? 'Chandrashtama is mild when the Moon is waxing in a benefic sign and navamsa, or Tarabala holds.' : (bad ? 'Moon in 6/8/12 from the Janma rashi.' : '') };
    },
    tarabala: function (natalMoonSid, transitMoonSid) {
        const R = this._R();
        return R.getTarabala(R.fromLongitude(natalMoonSid).index, R.fromLongitude(transitMoonSid).index);
    },

    // ---------- lagna rules ----------
    lagnaTyajya: function (lagnaSid, weekday) {
        const sn = Math.floor(this._n(lagnaSid) / 30), deg = this._n(lagnaSid) % 30, out = [];
        if ([0, 1, 8, 5].indexOf(sn) >= 0 && deg < 3) out.push({ name: 'Bhujanga (first 3 deg)', active: [3, 6].indexOf(weekday) >= 0, days: 'Wednesday, Saturday' });
        if ([11, 9, 3, 7].indexOf(sn) >= 0 && deg >= 27) out.push({ name: 'Rahu (last 3 deg)', active: [2, 4, 0].indexOf(weekday) >= 0, days: 'Tuesday, Thursday, Sunday' });
        if ([2, 6, 4, 10].indexOf(sn) >= 0 && deg >= 13.5 && deg <= 16.5) out.push({ name: 'Gridhra (13deg30\'-16deg30\')', active: [1, 5].indexOf(weekday) >= 0, days: 'Monday, Friday' });
        return { zones: out, avoid: out.some(z => z.active) };
    },
    risingSign: function (signIdx) { return this.RISING_SIGNS[signIdx]; },

    /** Indu Lagna (implementation note in the md, not from the source: count the remainder from the Moon's sign, 0 = 12). Confirm against BPHS. */
    induLagna: function (lagnaSign, moonSign) {
        const lord9 = (s) => this.SIGN_LORDS[(s + 8) % 12];
        const a = lord9(lagnaSign), b = lord9(moonSign);
        const total = this.INDU_KALAS[a] + this.INDU_KALAS[b], rem = total % 12 || 12;
        return { lordsOf9th: [a, b], kalas: total, remainder: rem, sign: (moonSign + rem - 1) % 12, signName: this.SIGNS[(moonSign + rem - 1) % 12],
                 note: 'Implementation note: counting convention (Moon sign = 1) should be confirmed against a reference text.' };
    },

    // ---------- calendar ----------
    calendarForSunSign: function (sunSign) { return this.CALENDAR[sunSign]; },
    /** 60-year Samvatsara by the (Chaitra) year; 1987-88 = Prabhava. The md's printed table is one year later than this (flagged "check" there). */
    samvatsara: function (year) { return this.SAMVATSARA[(((year - 1987) % 60) + 60) % 60]; },

    // ---------- time-of-day windows (hours; pass sunrise/sunset/nextSunrise in decimal hours) ----------
    dayParts: function (weekday, sunrise, sunset, nextSunrise) {
        const dayLen = sunset - sunrise, seg = dayLen / 8, k = this.KALA[weekday];
        const win = (n) => ({ start: sunrise + (n - 1) * seg, end: sunrise + n * seg });
        const lnt = (sunrise + sunset) / 2, half = dayLen / 30;
        const abhijit = { start: lnt - half, end: lnt + half, malefic: weekday === 3, note: weekday === 3 ? 'Wednesday: Abhijit coincides with Rahu kala - do not use for auspicious work' : 'No travel to the south in Abhijit' };
        const mid = (sunset + nextSunrise) / 2, nightAbhijit = { start: mid - 0.4, end: mid + 0.4 };
        const ku = { start: sunrise + k.kuStart * dayLen, end: sunrise + k.kuEnd * dayLen };
        const mDay = dayLen / 15, nightLen = nextSunrise - sunset, mNight = nightLen / 15, ms = [];
        this.MUHURTAS.forEach(m => {
            const day = m.no <= 15, idx = day ? m.no : m.no - 15;
            ms.push({ no: m.no, name: m.name, effect: m.effect, day: day, start: day ? sunrise + (idx - 1) * mDay : sunset + (idx - 1) * mNight, end: day ? sunrise + idx * mDay : sunset + idx * mNight,
                      durmuhurta: day ? this.DIURNAL_BAD_MUHURTAS.indexOf(idx) >= 0 : this.NOCTURNAL_BAD_MUHURTAS.indexOf(idx) >= 0 });
        });
        return { rahuKala: win(k.rahu), yamaghanta: win(k.yama), gulikaKala: win(k.gulika), kuMuhurta: ku, abhijit: abhijit, nightAbhijit: nightAbhijit, muhurtas: ms,
                 badVaraMuhurta: this.BAD_VARA_MUHURTA[weekday] };
    },
    choghadiya: function (weekday, sunrise, sunset, nextSunrise) {
        const out = [], dP = (sunset - sunrise) / 8, nP = (nextSunrise - sunset) / 8;
        const good = { Amrit: 'Auspicious', Shubh: 'Auspicious', Labh: 'Auspicious', Chal: 'Intermediate', Udveg: 'Inauspicious', Rog: 'Inauspicious', Kaal: 'Inauspicious' };
        for (let i = 0; i < 8; i++) out.push({ name: this.CHOGHADIYA.day[weekday][i], quality: good[this.CHOGHADIYA.day[weekday][i]], isDay: true, start: sunrise + i * dP, end: sunrise + (i + 1) * dP });
        for (let i = 0; i < 8; i++) out.push({ name: this.CHOGHADIYA.night[weekday][i], quality: good[this.CHOGHADIYA.night[weekday][i]], isDay: false, start: sunset + i * nP, end: sunset + (i + 1) * nP });
        return out;
    },

    // ---------- activity rules (md section 11; free text parsed heuristically) ----------
    activityKeys: function () { return this.ACTIVITIES.map((a, i) => ({ key: i, name: a.activity })); },
    _namesIn: function (text, list) {
        const found = []; const t = ' ' + text + ' ';
        list.slice().sort((a, b) => b.length - a.length).forEach(n => { const re = new RegExp('[^A-Za-z]' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])'); if (re.test(t)) found.push(n); });
        return found;
    },
    _splitNeg: function (text) {
        const m = text.search(/\b(Avoid|avoid|rejected|Do not|do not|not lend|never)\b/);
        return m < 0 ? { pos: text, neg: '' } : { pos: text.slice(0, m), neg: text.slice(m) };
    },
    getActivity: function (keyOrName) {
        const a = (typeof keyOrName === 'number') ? this.ACTIVITIES[keyOrName] : this.ACTIVITIES.find(x => x.activity.toLowerCase().indexOf(String(keyOrName).toLowerCase()) >= 0);
        if (!a) return null;
        const R = this._R(), names = R.LIST.map(n => n.name), sp = this._splitNeg(a.nakshatras);
        const pos = this._namesIn(sp.pos, names), neg = this._namesIn(sp.neg, names).filter(n => pos.indexOf(n) < 0 || /pada/.test(sp.neg));
        const lg = this._splitNeg(a.lagna), lpos = this._namesIn(lg.pos, this.SIGNS), lneg = this._namesIn(lg.neg, this.SIGNS);
        const tneg = [], tnegCont = [];
        (a.tithis.match(/(?:Avoid|avoid|reject|Reject)[^;.|]*/g) || []).forEach(seg => {
            (seg.replace(/Krishna\s+\d{1,2}\w*\s+to\s+Amavasya/g, '').match(/\b(\d{1,2})\b/g) || []).forEach(x => { const n = parseInt(x); if (n >= 1 && n <= 15 && tneg.indexOf(n) < 0) tneg.push(n); });
            if (/Full\/New|Full Moon/.test(seg) && tneg.indexOf(15) < 0) tneg.push(15);
            if (/Full\/New|New Moon/.test(seg) && tneg.indexOf(30) < 0) tneg.push(30);
            if (/Rikta/.test(seg)) [4, 9, 14].forEach(n => { if (tneg.indexOf(n) < 0) tneg.push(n); });
            const kr = seg.match(/Krishna\s+(\d{1,2})(?:th|st|nd|rd)?\s+to\s+Amavasya/);
            if (kr) for (let n = 15 + parseInt(kr[1]); n <= 30; n++) tnegCont.push(n);
        });
        const tgood = []; const gm = a.tithis.match(/(?:Best(?: tithis)?|Good tithis|Tithis)[:\s]+((?:\d{1,2}(?:\s*\([^)]*\))?[,\s]*(?:and\s*)?)+)/);
        if (gm) (gm[1].match(/\b\d{1,2}\b/g) || []).forEach(x => { const n = parseInt(x); if (tgood.indexOf(n) < 0 && tneg.indexOf(n) < 0) tgood.push(n); });
        const padaNote = (a.nakshatras.match(/[^.;]*\bpada\b[^.;]*/) || [null])[0];
        return { name: a.activity, raw: a, favourableNakshatras: pos, avoidNakshatras: neg, favourableSigns: lpos, avoidSigns: lneg, avoidTithis: tneg, avoidTithisContinuous: tnegCont, goodTithis: tgood, padaNote: padaNote ? padaNote.trim() : null };
    },
    checkActivity: function (keyOrName, ctx) {
        // ctx: {nakshatra, tithiNo, weekday, lagnaSign}
        const g = this.getActivity(keyOrName); if (!g) return null;
        const r = [];
        const nv = g.favourableNakshatras.indexOf(ctx.nakshatra) >= 0 ? 'favourable' : (g.avoidNakshatras.indexOf(ctx.nakshatra) >= 0 ? 'avoid' : 'not listed');
        const k = ctx.tithiNo === 30 ? 30 : (ctx.tithiNo === 15 ? 15 : ((ctx.tithiNo - 1) % 15) + 1);
        const tv = (g.avoidTithis.indexOf(k) >= 0 || g.avoidTithis.indexOf(ctx.tithiNo) >= 0 || g.avoidTithisContinuous.indexOf(ctx.tithiNo) >= 0) ? 'avoid' : (g.goodTithis.indexOf(k) >= 0 ? 'good' : 'not listed');
        const lv = ctx.lagnaSign === undefined ? 'unknown' : (g.favourableSigns.indexOf(this.SIGNS[ctx.lagnaSign]) >= 0 ? 'favourable' : (g.avoidSigns.indexOf(this.SIGNS[ctx.lagnaSign]) >= 0 ? 'avoid' : 'not listed'));
        return { activity: g.name, nakshatra: nv, tithi: tv, lagna: lv, rule: g.raw, parsed: g, padaNote: (nv === 'favourable' && g.padaNote) ? g.padaNote : null,
                 tuesdayRejected: /Tuesday (always |invariably )?rejected|Tuesday and (Friday|Saturday)|Avoid Tuesday/i.test(g.raw.lagna + ' ' + g.raw.tithis + ' ' + g.raw.nakshatras) && ctx.weekday === 2 };
    },

    // ---------- weighted score (md section 12; implementation heuristic) ----------
    scoreMuhurta: function (ev, activity) {
        const W = {}; this.WEIGHTS.forEach(w => { W[w.element.toLowerCase()] = w.points; });
        const parts = []; const add = (name, key, factor, why) => { if (factor === null || factor === undefined) return; parts.push({ element: name, points: W[key], factor: factor, got: W[key] * factor, why: why }); };
        if (ev.tarabala) { const t = ev.tarabala; add('Tarabala', 'tarabala', t.good ? 1 : (t.tara === 1 ? 0.3 : (t.cycle === 3 ? 0.5 : (t.cycle === 2 ? 0.25 : 0))), t.name + ' (' + t.rating + '), cycle ' + t.cycle); }
        if (ev.chandrabala) add('Chandrabala', 'chandrabala', ev.chandrabala.ok ? 1 : (ev.chandrabala.chandrashtama && ev.waxing ? 0.5 : 0), 'Moon ' + ev.chandrabala.house + 'th from natal Moon');
        if (ev.lagnaTyajya) add('Lagna and lagna lord', 'lagna and lagna lord', ev.lagnaTyajya.avoid ? 0 : 1, ev.lagnaTyajya.avoid ? 'Lagna in an active tyajya zone' : 'Lagna not in an active tyajya zone (strength of lagna lord NOT assessed)');
        add('Yoga', 'yoga', ev.yoga.quality.indexOf('Good') === 0 ? 1 : 0, ev.yoga.name + ' (' + ev.yoga.quality + ')');
        add('Karana', 'karana', ev.karana.name === 'Vishti' ? 0 : (['Naga'].indexOf(ev.karana.name) >= 0 ? 0 : (['Shakuni', 'Chatushpada', 'Kimstughna'].indexOf(ev.karana.name) >= 0 ? 0.5 : 1)), ev.karana.name);
        let vf = ev.vara.goodDay ? 1 : (ev.vara.index === 0 ? 0.5 : 0);
        if (ev.activityCheck && ev.activityCheck.tuesdayRejected) vf = 0;
        add('Vara', 'vara', vf, ev.vara.day);
        let nf = ev.nakshatra.quality === 'good' ? 1 : (ev.nakshatra.quality === 'average' ? 0.5 : 0);
        if (ev.activityCheck) nf = ev.activityCheck.nakshatra === 'favourable' ? 1 : (ev.activityCheck.nakshatra === 'avoid' ? 0 : nf);
        add('Nakshatra of Moon', 'nakshatra of moon', nf, ev.nakshatra.name);
        let tf = ev.tithi.best ? 1 : (ev.tithi.general_reject ? 0 : 0.5);
        if (ev.activityCheck) tf = ev.activityCheck.tithi === 'avoid' ? 0 : (ev.activityCheck.tithi === 'good' ? 1 : tf);
        add('Tithi', 'tithi', tf, ev.tithi.name + ' ' + ev.tithi.paksha);
        const got = parts.reduce((s, p) => s + p.got, 0), max = parts.reduce((s, p) => s + p.points, 0);
        return { parts: parts, got: Math.round(got * 10) / 10, max: max, percent: max ? Math.round(got / max * 1000) / 10 : 0,
                 note: 'Heuristic: weights from md section 12 (Tarabala 160, Chandrabala 100, lagna 100, yoga 32, karana 16, vara 8, nakshatra 4, tithi 1); elements without input (no natal Moon / lagna) are left out. The same source also says nakshatra, vara and tithi matter most in practice.' };
    },

    // ---------- one-call evaluation ----------
    /** ctx: {date, sunSid, moonSid, sunrise, sunset, nextSunrise (decimal hours, optional), lagnaSid, natalMoonSid, natalLagnaSign, activity, tithiNumbering} */
    evaluate: function (ctx) {
        const sun = ctx.sunSid, moon = ctx.moonSid;
        const vara = this.varaInfo(ctx.date || new Date(), ctx.sunrise), tithi = this.tithiInfo(sun, moon), yoga = this.yogaInfo(sun, moon), karana = this.karanaInfo(sun, moon), nak = this.nakshatraInfo(moon);
        const moonSign = Math.floor(this._n(moon) / 30), ev = { vara: vara, tithi: tithi, yoga: yoga, karana: karana, nakshatra: nak, waxing: tithi.no <= 15 };
        ev.siddha = this.siddhaYoga(vara.index, tithi.no, nak.name); ev.amita = this.amitaSiddha(vara.index, nak.name, tithi.no);
        ev.kuYogas = this.kuYogas(vara.index, nak.name, tithi.no); ev.tatkalika = this.tatkalikaYoga(vara.index, moon);
        ev.dagdha = this.dagdhaRashi(tithi.no, moonSign); ev.tithiGandanta = this.tithiGandanta(tithi.no, tithi.percentLeft);
        ev.tyajya = this._R().getTyajya(nak.name);
        if (ctx.lagnaSid !== undefined) {
            const ls = Math.floor(this._n(ctx.lagnaSid) / 30);
            ev.lagnaSign = ls; ev.lagnaTyajya = this.lagnaTyajya(ctx.lagnaSid, vara.index); ev.risingSign = this.risingSign(ls);
            ev.panchakaEnergy = this.panchakaEnergy(tithi.no, vara.index, nak.no, ls + 1, ctx.tithiNumbering);
        }
        if (ctx.natalMoonSid !== undefined) {
            ev.tarabala = this.tarabala(ctx.natalMoonSid, moon);
            ev.chandrabala = this.chandrabala(Math.floor(this._n(ctx.natalMoonSid) / 30), moonSign, ev.waxing);
        }
        if (ctx.sunrise !== undefined && ctx.sunset !== undefined) {
            const next = ctx.nextSunrise !== undefined ? ctx.nextSunrise : ctx.sunrise + 24;
            ev.dayParts = this.dayParts(vara.index, ctx.sunrise, ctx.sunset, next); ev.choghadiya = this.choghadiya(vara.index, ctx.sunrise, ctx.sunset, next);
        }
        if (ctx.activity !== undefined && ctx.activity !== null && ctx.activity !== '') ev.activityCheck = this.checkActivity(ctx.activity, { nakshatra: nak.name, tithiNo: tithi.no, weekday: vara.index, lagnaSign: ev.lagnaSign });
        ev.score = this.scoreMuhurta(ev, ctx.activity);
        const flags = [];
        if (karana.name === 'Vishti') flags.push('Vishti (Bhadra) karana - unfit for good work (last 3 ghatis are auspicious)');
        if (yoga.wholeBad) flags.push(yoga.name + ' yoga - inauspicious for the whole yoga');
        else if (yoga.quality === 'Bad') flags.push(yoga.name + ' yoga - avoid its inauspicious portion: ' + yoga.inauspiciousPortion);
        if (nak.gandanta.length) flags.push(nak.gandanta.join('; '));
        if (nak.unfitForGoodStarts) flags.push(nak.name + ' is unfit for good starts');
        if (nak.panchaka && nak.panchaka.general) flags.push('Panchaka nakshatra (Dhanishtha to Revati)');
        if (ev.kuYogas.length) ev.kuYogas.forEach(k => flags.push(k.name + ': ' + k.why));
        if (ev.tatkalika.bad) flags.push('Tatkalika ' + ev.tatkalika.yoga + ' (' + ev.tatkalika.result + ')');
        if (ev.dagdha.hit) flags.push('Moon in a dagdha rashi for this tithi');
        if (ev.tithiGandanta) flags.push('Tithi gandanta: ' + ev.tithiGandanta);
        if (ev.chandrabala && !ev.chandrabala.ok) flags.push('No Chandrabala (Moon ' + ev.chandrabala.house + 'th from natal Moon)');
        if (ev.tarabala && !ev.tarabala.good && ev.tarabala.tara !== 1) flags.push('Tarabala: ' + ev.tarabala.name + ' (' + ev.tarabala.cycleNote + ')');
        if (ev.lagnaTyajya && ev.lagnaTyajya.avoid) flags.push('Lagna tyajya zone is active today');
        if (ev.panchakaEnergy && ev.panchakaEnergy.result && /Mrityu|Agni|Raja|Chora|Roga/.test(ev.panchakaEnergy.result)) flags.push('Panchaka energy: ' + ev.panchakaEnergy.result + ' (avoid for ' + ev.panchakaEnergy.avoid + ')');
        const good = [];
        if (ev.siddha.any) good.push('Siddha yoga (' + (ev.siddha.tithiWeekday ? 'tithi + weekday' : '') + (ev.siddha.tithiWeekday && ev.siddha.nakshatraWeekday ? ', ' : '') + (ev.siddha.nakshatraWeekday ? 'weekday + nakshatra' : '') + ')');
        if (ev.amita.active) good.push('Amrita Siddha yoga');
        if (!ev.tatkalika.bad) good.push('Tatkalika ' + ev.tatkalika.yoga + ' (' + ev.tatkalika.result + ')');
        ev.flags = flags; ev.positives = good; ev.neutralisers = this.NEUTRALISERS;
        return ev;
    },

    // ---------- Choghadiya correction for main.js getChogadiya() ----------
    installChoghadiyaFix: function () {
        if (typeof window === 'undefined' || typeof window.getChogadiya !== 'function' || window.getChogadiya._mdFixed || typeof window.calcSunriseSunset !== 'function') return false;
        const self = this;
        const fixed = function (jday, lat, lon, utcOff) {
            const res = window.calcSunriseSunset(jday, lat, lon, utcOff), dayLen = res.sunset - res.sunrise, dP = dayLen / 8;
            const nextRise = window.calcSunriseSunset(jday + 1, lat, lon, utcOff).sunrise + 1, nP = (nextRise - res.sunset) / 8;
            const dow = (Math.floor(jday + 0.5 + utcOff / 24) + 1) % 7;
            const type = { Amrit: 'Good', Shubh: 'Good', Labh: 'Good', Chal: 'Neutral', Udveg: 'Bad', Rog: 'Bad', Kaal: 'Bad' };
            const out = [];
            for (let i = 0; i < 8; i++) { const n = self.CHOGHADIYA.day[dow][i]; out.push({ name: n, type: type[n], start: res.sunrise + i * dP, isDay: true }); }
            for (let i = 0; i < 8; i++) { const n = self.CHOGHADIYA.night[dow][i]; out.push({ name: n, type: type[n], start: res.sunset + i * nP, isDay: false }); }
            return out;
        };
        fixed._mdFixed = true; window.getChogadiya = fixed; return true;
    },

    // ---------- panel ----------
    _esc: function (s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
    _t: function (h) { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return (hh < 10 ? '0' : '') + hh + ':' + (mm === 60 ? '00' : (mm < 10 ? '0' : '') + mm); },
    _lastEval: null,
    renderForPanel: function (ctx) {
        if (!ctx || !ctx.transitPlanets || !ctx.transitPlanets.Sun || !ctx.transitPlanets.Moon) return '';
        try {
            const e = this._esc, self = this;
            const evCtx = { date: ctx.now || new Date(), sunSid: ctx.transitPlanets.Sun.sid, moonSid: ctx.transitPlanets.Moon.sid, sunrise: ctx.sunrise, sunset: ctx.sunset, nextSunrise: ctx.nextSunrise,
                            lagnaSid: ctx.transitAsc ? ctx.transitAsc.sid : undefined, natalMoonSid: ctx.natalPlanets && ctx.natalPlanets.Moon ? ctx.natalPlanets.Moon.sid : undefined };
            this._lastEval = evCtx;
            const ev = this.evaluate(evCtx);
            const row = (k, v) => '<div style="display:flex;gap:8px;margin-top:3px;font-size:9.5px;"><span style="min-width:96px;color:var(--muted);">' + k + '</span><span style="color:var(--text);">' + v + '</span></div>';
            let h = '<div class="biz-summary" style="border-color:#2EC4B6;background:rgba(46,196,182,0.03);margin-top:20px;border-radius:12px;">' +
                '<h3 class="' + (ctx.sectionClass || '') + '" style="color:#2EC4B6;font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">🗓️ Muhurta & Panchanga quality</h3>';
            h += row('Vara', e(ev.vara.day) + ' — ' + (ev.vara.goodDay ? 'good day for most ceremonies' : 'generally avoided for ceremonies') + '. Good for: ' + e(ev.vara.goodFor));
            h += row('Tithi', e(ev.tithi.name) + ' ' + e(ev.tithi.paksha) + ' (' + e(ev.tithi.class) + ', ' + ev.tithi.percentLeft + '% left) — ' + e(ev.tithi.goodFor));
            h += row('Nakshatra', e(ev.nakshatra.name) + ' pada ' + ev.nakshatra.pada + ' · ' + e(ev.nakshatra.class) + ' · ' + e(ev.nakshatra.quality) + '/' + e(ev.nakshatra.nature));
            h += row('Yoga', e(ev.yoga.name) + ' (' + e(ev.yoga.quality) + ') ' + e(ev.yoga.meaning) + (ev.yoga.inauspiciousPortion ? ' — avoid: ' + e(ev.yoga.inauspiciousPortion) : ''));
            h += row('Karana', e(ev.karana.name) + ' (' + e(ev.karana.type) + ') — ' + e(ev.karana.goodFor));
            h += row('Tatkalika', e(ev.tatkalika.yoga) + ' — ' + e(ev.tatkalika.result) + (ev.tatkalika.bad ? ' <span style="color:#FF4477;">(bad)</span>' : ''));
            if (ev.tarabala) h += row('Tarabala', e(ev.tarabala.name) + ' (' + e(ev.tarabala.rating) + ') — ' + e(ev.tarabala.effect) + '; cycle ' + ev.tarabala.cycle);
            if (ev.chandrabala) h += row('Chandrabala', 'Moon ' + ev.chandrabala.house + 'th from natal Moon — ' + (ev.chandrabala.ok ? 'present' : '<span style="color:#FF4477;">absent</span>'));
            if (ev.panchakaEnergy && ev.panchakaEnergy.result) h += row('Panchaka', e(ev.panchakaEnergy.result) + (ev.panchakaEnergy.avoid ? ' (avoid for ' + e(ev.panchakaEnergy.avoid) + ')' : ''));
            if (ev.dayParts) {
                const p = ev.dayParts, w = (x) => self._t(x.start) + '–' + self._t(x.end);
                h += row('Rahu / Yama / Gulika', w(p.rahuKala) + ' · ' + w(p.yamaghanta) + ' · ' + w(p.gulikaKala));
                h += row('Abhijit', w(p.abhijit) + (p.abhijit.malefic ? ' <span style="color:#FF9F43;">(Wednesday: not for auspicious work)</span>' : ''));
                const cur = (ctx.now ? ctx.now.getHours() + ctx.now.getMinutes() / 60 : null), cg = ev.choghadiya.find(c => cur !== null && ((cur >= c.start && cur < c.end) || (cur + 24 >= c.start && cur + 24 < c.end)));
                if (cg) h += row('Choghadiya now', e(cg.name) + ' (' + e(cg.quality) + ') until ' + self._t(cg.end));
            }
            if (ev.positives.length) h += '<div style="margin-top:6px;font-size:9.5px;color:#00DD77;">✔ ' + e(ev.positives.join(' · ')) + '</div>';
            if (ev.flags.length) h += '<div style="margin-top:4px;font-size:9.5px;color:#FF9F43;">⚠ ' + e(ev.flags.join(' · ')) + '</div>';
            const opts = this.ACTIVITIES.map((a, i) => '<option value="' + i + '">' + e(a.activity) + '</option>').join('');
            h += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05);font-size:10px;"><b style="color:#2EC4B6;">Activity check</b> <select id="mpActivity" style="font-size:10px;background:var(--bg3,#1a1a2e);color:var(--text);border:1px solid var(--border);max-width:200px;">' + opts + '</select> ' +
                '<button type="button" onclick="MUHURTA_PANCHANGA.runActivityFromUI()" style="font-size:10px;padding:2px 8px;cursor:pointer;">Check</button></div><div id="mpResult" style="margin-top:6px;font-size:9.5px;color:var(--text);"></div>';
            h += '<div style="font-size:8.5px;color:var(--muted);margin-top:6px;">Traditional, rule-based, not empirically tested. Weighted score is a heuristic (md section 12).</div></div>';
            return h;
        } catch (err) { console.error('MUHURTA_PANCHANGA render failed', err); return ''; }
    },
    runActivityFromUI: function () {
        const out = document.getElementById('mpResult'), ctx = this._lastEval; if (!out || !ctx) return;
        const key = parseInt(document.getElementById('mpActivity').value), e = this._esc;
        const ev = this.evaluate(Object.assign({}, ctx, { activity: key })), a = ev.activityCheck, col = (v) => v === 'favourable' || v === 'good' ? '#00DD77' : (v === 'avoid' ? '#FF4477' : 'var(--muted)');
        out.innerHTML = '<div><b>' + e(a.activity) + '</b> — nakshatra <span style="color:' + col(a.nakshatra) + ';">' + e(a.nakshatra) + '</span>, tithi <span style="color:' + col(a.tithi) + ';">' + e(a.tithi) + '</span>, lagna <span style="color:' + col(a.lagna) + ';">' + e(a.lagna) + '</span>' + (a.tuesdayRejected ? ' · <span style="color:#FF4477;">Tuesday rejected</span>' : '') + (a.padaNote ? ' · <span style="color:#FF9F43;">pada rule: ' + e(a.padaNote) + '</span>' : '') + '</div>' +
            '<div style="color:var(--muted);margin-top:3px;">Rule: tithis — ' + e(a.rule.tithis) + '; nakshatras — ' + e(a.rule.nakshatras) + '; lagna — ' + e(a.rule.lagna) + '</div>' +
            '<div style="margin-top:3px;">Score <b>' + ev.score.percent + '%</b> (' + ev.score.got + ' / ' + ev.score.max + ' points) — ' + ev.score.parts.map(p => e(p.element) + ' ' + Math.round(p.factor * 100) + '%').join(', ') + '</div>';
    }
};

if (typeof window !== 'undefined') {
    window.MUHURTA_PANCHANGA.installChoghadiyaFix();
    if (typeof document !== 'undefined' && document.addEventListener) {
        const _again = function () { window.MUHURTA_PANCHANGA.installChoghadiyaFix(); };
        document.addEventListener('DOMContentLoaded', _again); window.addEventListener('load', _again);
    }
}
if (typeof module !== 'undefined' && module.exports) module.exports = window.MUHURTA_PANCHANGA;
