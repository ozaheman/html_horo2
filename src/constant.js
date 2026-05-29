/**
 * ASTRO_CONSTANTS
 * Global shared data dictionary for all Vedic Astrology prediction modules.
 * Centralizes signs, planets, dignities, houses, and nakshatras.
 */

window.ASTRO_CONSTANTS = (function() {

    // ========== 1. CORE PLANETS & SIGNS ==========

    const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
    const NEUTRALS = ['Sun'];

    const SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    const SIGN_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

    // Mapping of Sign Index (0-11) to its Ruling Planet
    const SIGN_LORDS = {
        0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun',
        5: 'Mercury', 6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn',
        10: 'Saturn', 11: 'Jupiter'
    };

    // ========== 2. DIGNITIES & STRENGTHS ==========

    // Exact Exaltation Degrees
    const EXALTATION_DEGREES = {
        'Sun': 10, 'Moon': 3, 'Mars': 28, 'Mercury': 15, 'Jupiter': 5, 'Venus': 27, 'Saturn': 20
    };

    // Exaltation, Debilitation, and Own Sign Indices
    const DIGNITIES = {
        'Sun':     { exalt: 0,  debilitation: 6,  own: [4] },
        'Moon':    { exalt: 1,  debilitation: 7,  own: [3] },
        'Mars':    { exalt: 9,  debilitation: 3,  own: [0, 7] },
        'Mercury': { exalt: 5,  debilitation: 11, own: [2, 5] },
        'Jupiter': { exalt: 3,  debilitation: 9,  own: [8, 11] },
        'Venus':   { exalt: 11, debilitation: 5,  own: [1, 6] },
        'Saturn':  { exalt: 6,  debilitation: 0,  own: [9, 10] },
        'Rahu':    { exalt: 2,  debilitation: 8,  own: [10] }, // Secondary/Proxy rules
        'Ketu':    { exalt: 8,  debilitation: 2,  own: [7] }
    };

    // Moolatrikona Degrees (Sign Index, Start Deg, End Deg)
    const MULATRIKONA = {
        'Sun':     { sign: 4,  start: 0,  end: 20 },
        'Moon':    { sign: 3,  start: 0,  end: 20 },
        'Mars':    { sign: 0,  start: 0,  end: 12 },
        'Mercury': { sign: 5,  start: 16, end: 20 },
        'Jupiter': { sign: 8,  start: 0,  end: 10 },
        'Venus':   { sign: 6,  start: 0,  end: 15 },
        'Saturn':  { sign: 10, start: 0,  end: 20 }
    };

    const COMBUSTION_ORBS = {
        'Moon': 12, 'Mars': 17, 'Mercury': 14, 'Jupiter': 11, 'Venus': 10, 'Saturn': 15
    };

    // Permanent Natural Friendships (Row: Base Planet, Column: Relationship towards target)
    const NATURAL_RELATIONSHIPS = {
        'Sun':     { 'Moon': 'Friend', 'Mars': 'Friend', 'Mercury': 'Neutral', 'Jupiter': 'Friend', 'Venus': 'Enemy',  'Saturn': 'Enemy',  'Rahu': 'Enemy',  'Ketu': 'Enemy' },
        'Moon':    { 'Sun': 'Friend',  'Mars': 'Neutral','Mercury': 'Friend',  'Jupiter': 'Neutral','Venus': 'Neutral','Saturn': 'Neutral','Rahu': 'Enemy',  'Ketu': 'Enemy' },
        'Mars':    { 'Sun': 'Friend',  'Moon': 'Friend', 'Mercury': 'Enemy',   'Jupiter': 'Friend', 'Venus': 'Neutral','Saturn': 'Neutral','Rahu': 'Enemy',  'Ketu': 'Friend' },
        'Mercury': { 'Sun': 'Friend',  'Moon': 'Enemy',  'Mars': 'Neutral',    'Jupiter': 'Neutral','Venus': 'Friend', 'Saturn': 'Neutral','Rahu': 'Neutral','Ketu': 'Neutral' },
        'Jupiter': { 'Sun': 'Friend',  'Moon': 'Friend', 'Mars': 'Friend',     'Mercury': 'Enemy',  'Venus': 'Enemy',  'Saturn': 'Neutral','Rahu': 'Neutral','Ketu': 'Neutral' },
        'Venus':   { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Neutral',    'Mercury': 'Friend', 'Jupiter': 'Neutral','Saturn': 'Friend','Rahu': 'Friend', 'Ketu': 'Friend' },
        'Saturn':  { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Enemy',      'Mercury': 'Friend', 'Jupiter': 'Neutral','Venus': 'Friend','Rahu': 'Friend', 'Ketu': 'Enemy' },
        'Rahu':    { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Enemy',      'Mercury': 'Neutral','Jupiter': 'Neutral','Venus': 'Friend','Saturn': 'Friend','Ketu': 'Enemy' },
        'Ketu':    { 'Sun': 'Enemy',   'Moon': 'Enemy',  'Mars': 'Friend',     'Mercury': 'Neutral','Jupiter': 'Neutral','Venus': 'Friend','Saturn': 'Enemy', 'Rahu': 'Enemy' }
    };

    // Basic Gemstones Mapping
    const GEMSTONES = {
        'Sun': 'Ruby', 'Moon': 'Pearl', 'Mars': 'Coral',
        'Mercury': 'Emerald', 'Jupiter': 'Yellow Sapphire',
        'Venus': 'Diamond', 'Saturn': 'Blue Sapphire',
        'Rahu': 'Hessonite (Gomed)', 'Ketu': 'Cat\'s Eye'
    };

    // ========== 3. HOUSE SIGNIFICATIONS ==========

    const HOUSE_NATURE = {
        1:  { type: "Kendra+Trikona", pol: 2,  desc: "Self, body, health" },
        2:  { type: "Maraka/Wealth",  pol: 0,  desc: "Wealth, family, speech" },
        3:  { type: "Upachaya",       pol: 1,  desc: "Courage, siblings, short journeys" },
        4:  { type: "Kendra",         pol: 1,  desc: "Mother, home, vehicles, happiness" },
        5:  { type: "Trikona",        pol: 2,  desc: "Children, talent, love, intelligence" },
        6:  { type: "Dusthana",       pol: -1, desc: "Enemies, disease, debts, service" },
        7:  { type: "Kendra/Maraka",  pol: 1,  desc: "Spouse, marriage, partnerships" },
        8:  { type: "Dusthana",       pol: -2, desc: "Longevity, inheritance, obstacles" },
        9:  { type: "Trikona",        pol: 2,  desc: "Fortune, father, religion, long travel" },
        10: { type: "Kendra+Upachaya",pol: 2,  desc: "Career, honour, profession" },
        11: { type: "Upachaya/Gains", pol: 1,  desc: "Gains, ambitions, elder siblings" },
        12: { type: "Dusthana/Moksha",pol: -1, desc: "Losses, moksha, foreign travel" }
    };

    const HOUSE_SIGNIFICATIONS = {
        1:  { name: "Atma (Self)",       keywords: "Body, health, personality, appearance, longevity", karaka: "Sun" },
        2:  { name: "Dhana (Wealth)",    keywords: "Wealth, family, speech, eyes, food", karaka: "Jupiter, Mercury" },
        3:  { name: "Sahaja (Siblings)", keywords: "Courage, siblings, short journeys, mental strength", karaka: "Mars, Mercury" },
        4:  { name: "Matri (Mother)",    keywords: "Mother, home, vehicles, property, happiness", karaka: "Moon" },
        5:  { name: "Putra (Children)",  keywords: "Children, talent, love, intelligence, romance", karaka: "Jupiter" },
        6:  { name: "Roga (Disease)",    keywords: "Enemies, disease, debts, uncle, service", karaka: "Mars, Saturn" },
        7:  { name: "Kalatra (Spouse)",  keywords: "Marriage, spouse, partnerships, domestic happiness", karaka: "Venus" },
        8:  { name: "Mrityu (Death)",    keywords: "Longevity, dowry, insurance, accidents, inheritance", karaka: "Saturn" },
        9:  { name: "Bhagya (Fortune)",  keywords: "Luck, father, religion, philosophy, distant travel", karaka: "Jupiter, Sun" },
        10: { name: "Karma (Career)",    keywords: "Career, father, honour, trade, respect", karaka: "Sun, Saturn, Mercury" },
        11: { name: "Labha (Gains)",     keywords: "Ambitions, aspirations, fulfillments, elder siblings", karaka: "Jupiter" },
        12: { name: "Vyaya (Loss)",      keywords: "Miseries, sufferings, losses, moksha, foreign travel", karaka: "Ketu, Saturn" }
    };

    // ========== 4. NAKSHATRAS ==========

    const NAKSHATRAS = [
        { name: "Ashwini", lord: "Ketu", gana: "Deva", nature: "Kshipra (Swift)", startDeg: 0, endDeg: 13.3333,
          interpretation: "Swift action, healing, new beginnings, horse-like energy" },
        { name: "Bharani", lord: "Venus", gana: "Manushya", nature: "Ugra (Fierce)", startDeg: 13.3333, endDeg: 26.6667,
          interpretation: "Transformation, letting go, deep karma, bearer of life" },
        { name: "Krittika", lord: "Sun", gana: "Rakshasa", nature: "Mixed", startDeg: 26.6667, endDeg: 40.0,
          interpretation: "Sharp intelligence, purification, courage, cutting through ignorance" },
        { name: "Rohini", lord: "Moon", gana: "Manushya", nature: "Dhruva (Fixed)", startDeg: 40.0, endDeg: 53.3333,
          interpretation: "Creativity, fertility, material comforts, growth" },
        { name: "Mrigashira", lord: "Mars", gana: "Deva", nature: "Mridu (Soft)", startDeg: 53.3333, endDeg: 66.6667,
          interpretation: "Curiosity, searching, adventure, deer-like grace" },
        { name: "Ardra", lord: "Rahu", gana: "Manushya", nature: "Tikshna (Dreadful)", startDeg: 66.6667, endDeg: 80.0,
          interpretation: "Destruction, rebuilding, emotional intensity, tears" },
        { name: "Punarvasu", lord: "Jupiter", gana: "Deva", nature: "Chara (Movable)", startDeg: 80.0, endDeg: 93.3333,
          interpretation: "Return, renewal, optimism, restoration" },
        { name: "Pushya", lord: "Saturn", gana: "Deva", nature: "Kshipra (Swift)", startDeg: 93.3333, endDeg: 106.6667,
          interpretation: "Nourishment, protection, spiritual growth, prosperity" },
        { name: "Ashlesha", lord: "Mercury", gana: "Rakshasa", nature: "Tikshna (Dreadful)", startDeg: 106.6667, endDeg: 120.0,
          interpretation: "Mystery, wisdom, karmic healing, serpentine energy" },
        { name: "Magha", lord: "Ketu", gana: "Rakshasa", nature: "Ugra (Fierce)", startDeg: 120.0, endDeg: 133.3333,
          interpretation: "Ancestral power, authority, legacy, throne" },
        { name: "Purva Phalguni", lord: "Venus", gana: "Manushya", nature: "Ugra (Fierce)", startDeg: 133.3333, endDeg: 146.6667,
          interpretation: "Creativity, romance, pleasure, front of the bed" },
        { name: "Uttara Phalguni", lord: "Sun", gana: "Manushya", nature: "Dhruva (Fixed)", startDeg: 146.6667, endDeg: 160.0,
          interpretation: "Service, marriage, fulfillment, back of the bed" },
        { name: "Hasta", lord: "Moon", gana: "Deva", nature: "Kshipra (Swift)", startDeg: 160.0, endDeg: 173.3333,
          interpretation: "Skill, manifestation, craftsmanship, hand" },
        { name: "Chitra", lord: "Mars", gana: "Rakshasa", nature: "Mridu (Soft)", startDeg: 173.3333, endDeg: 186.6667,
          interpretation: "Creativity, architecture, brilliance, bright jewel" },
        { name: "Swati", lord: "Rahu", gana: "Deva", nature: "Chara (Movable)", startDeg: 186.6667, endDeg: 200.0,
          interpretation: "Independence, movement, adaptability, sword" },
        { name: "Vishakha", lord: "Jupiter", gana: "Rakshasa", nature: "Mixed", startDeg: 200.0, endDeg: 213.3333,
          interpretation: "Determination, focus, transformation, forked" },
        { name: "Anuradha", lord: "Saturn", gana: "Deva", nature: "Mridu (Soft)", startDeg: 213.3333, endDeg: 226.6667,
          interpretation: "Friendship, devotion, success, following Radha" },
        { name: "Jyeshtha", lord: "Mercury", gana: "Rakshasa", nature: "Tikshna (Dreadful)", startDeg: 226.6667, endDeg: 240.0,
          interpretation: "Wisdom, seniority, protection, eldest" },
        { name: "Mula", lord: "Ketu", gana: "Rakshasa", nature: "Tikshna (Dreadful)", startDeg: 240.0, endDeg: 253.3333,
          interpretation: "Roots, destruction, rebirth, root" },
        { name: "Purva Ashadha", lord: "Venus", gana: "Manushya", nature: "Ugra (Fierce)", startDeg: 253.3333, endDeg: 266.6667,
          interpretation: "Invigoration, purification, optimism, earlier victory" },
        { name: "Uttara Ashadha", lord: "Sun", gana: "Manushya", nature: "Dhruva (Fixed)", startDeg: 266.6667, endDeg: 280.0,
          interpretation: "Victory, perseverance, leadership, later victory" },
        { name: "Shravana", lord: "Moon", gana: "Deva", nature: "Chara (Movable)", startDeg: 280.0, endDeg: 293.3333,
          interpretation: "Learning, listening, wisdom, ear" },
        { name: "Dhanishta", lord: "Mars", gana: "Rakshasa", nature: "Chara (Movable)", startDeg: 293.3333, endDeg: 306.6667,
          interpretation: "Wealth, music, prosperity, drum" },
        { name: "Shatabhisha", lord: "Rahu", gana: "Rakshasa", nature: "Chara (Movable)", startDeg: 306.6667, endDeg: 320.0,
          interpretation: "Healing, mystery, secrets, hundred physicians" },
        { name: "Purva Bhadrapada", lord: "Jupiter", gana: "Manushya", nature: "Ugra (Fierce)", startDeg: 320.0, endDeg: 333.3333,
          interpretation: "Spiritual warrior, purification, front of the funeral cot" },
        { name: "Uttara Bhadrapada", lord: "Saturn", gana: "Manushya", nature: "Dhruva (Fixed)", startDeg: 333.3333, endDeg: 346.6667,
          interpretation: "Wisdom, compassion, finality, back of the funeral cot" },
        { name: "Revati", lord: "Mercury", gana: "Deva", nature: "Mridu (Soft)", startDeg: 346.6667, endDeg: 360.0,
          interpretation: "Completion, nourishment, protection, wealthy" }
    ];

    return {
        PLANETS,
        BENEFICS,
        MALEFICS,
        NEUTRALS,
        SIGNS,
        SIGN_SYMBOLS,
        SIGN_LORDS,
        EXALTATION_DEGREES,
        DIGNITIES,
        MULATRIKONA,
        COMBUSTION_ORBS,
        NATURAL_RELATIONSHIPS,
        GEMSTONES,
        HOUSE_NATURE,
        HOUSE_SIGNIFICATIONS,
        NAKSHATRAS
    };

})();

 // ========== 5. LAGNA AKSHARA, COLORS & KAAL PURUSH ==========
     const SIGN_ATTRIBUTES = {
        0: { sign: "Aries", akshara: ["A", "L", "E", "I", "O"], luckyColor: "Red, Coral", kaalPurushHouse: 1, element: "Fire" },
        1: { sign: "Taurus", akshara: ["B", "V", "U", "W"], luckyColor: "White, Cream, Pink", kaalPurushHouse: 2, element: "Earth" },
        2: { sign: "Gemini", akshara: ["K", "Ch", "Gh", "Q", "C"], luckyColor: "Green, Emerald", kaalPurushHouse: 3, element: "Air" },
        3: { sign: "Cancer", akshara: ["D", "H"], luckyColor: "Milky White, Silver", kaalPurushHouse: 4, element: "Water" },
        4: { sign: "Leo", akshara: ["M", "T"], luckyColor: "Gold, Orange, Ruby", kaalPurushHouse: 5, element: "Fire" },
        5: { sign: "Virgo", akshara: ["P", "T", "N", "S"], luckyColor: "Green, Earthy tones", kaalPurushHouse: 6, element: "Earth" },
        6: { sign: "Libra", akshara: ["R", "T"], luckyColor: "White, Light Blue", kaalPurushHouse: 7, element: "Air" },
        7: { sign: "Scorpio", akshara: ["N", "Y"], luckyColor: "Dark Red, Maroon", kaalPurushHouse: 8, element: "Water" },
        8: { sign: "Sagittarius", akshara: ["Bh", "F", "Dh", "Y"], luckyColor: "Yellow, Mustard", kaalPurushHouse: 9, element: "Fire" },
        9: { sign: "Capricorn", akshara: ["Kh", "J"], luckyColor: "Navy Blue, Black", kaalPurushHouse: 10, element: "Earth" },
        10: { sign: "Aquarius", akshara: ["G", "S", "Sh"], luckyColor: "Electric Blue, Grey", kaalPurushHouse: 11, element: "Air" },
        11: { sign: "Pisces", akshara: ["D", "Ch", "Z", "Th"], luckyColor: "Sea Green, Yellow", kaalPurushHouse: 12, element: "Water" }
    };

// Export for Node/CommonJS compatibility if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.ASTRO_CONSTANTS;
}