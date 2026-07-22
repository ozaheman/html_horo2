/**
 * disease_predictor.js
 *
 * "Disease Predictor" — Vedic Health/Disease Analysis Engine
 * ─────────────────────────────────────────────────────────────
 * Encodes the body-part / planet / house correspondences and disease
 * timing rules summarised from "Indian Astrology and Diseases" by
 * Parimal Purkāyastha (Calcutta, 1956), and applies them to the
 * current birth chart + running Dasha to build a STEP-BY-STEP report:
 *
 *   STEP 1 — Health Foundation (Lagna / Sun / Moon / 6th house check)
 *   STEP 2 — Afflicted Planets & the Body Parts they govern
 *   STEP 3 — Predicted Disease Tendencies  (CAUSE → EFFECT → REMEDY)
 *   STEP 4 — Dasha Timing  (CAUSE & EFFECT during current MD/AD/PD)
 *   STEP 5 — General Remedial Measures for the planets involved
 *
 * Depends on (optional, degrades gracefully if absent):
 *   - window.ASTRO_CONSTANTS   (SIGNS, SIGN_LORDS, BENEFICS, MALEFICS)
 *   - window.PREDICTION_ANALYSIS (analysis.js — getConjunctions/getAspects/getPlanetsInHouses)
 *
 * IMPORTANT: This is a study/reference tool based on a historical
 * astrological text. It is NOT medical advice and must never be used
 * as a substitute for professional diagnosis or treatment.
 */

window.DISEASE_PREDICTOR = {

    META: {
        title: 'Indian Astrology and Diseases',
        author: 'Parimal Purkāyastha',
        year: 1956,
        place: 'Calcutta'
    },

    // ===================== FALLBACK CONSTANTS =====================
    SIGNS_FALLBACK: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
    SIGN_LORDS_FALLBACK: ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'],
    MALEFICS_FALLBACK: ['Sun','Mars','Saturn','Rahu','Ketu'],
    BENEFICS_FALLBACK: ['Jupiter','Venus','Moon','Mercury'],
    PLANETS_FALLBACK: ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'],

    _signs: function () { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGNS) || this.SIGNS_FALLBACK; },
    _signLords: function () { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.SIGN_LORDS) || this.SIGN_LORDS_FALLBACK; },
    _malefics: function () { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.MALEFICS) || this.MALEFICS_FALLBACK; },
    _benefics: function () { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.BENEFICS) || this.BENEFICS_FALLBACK; },
    _planets: function () { return (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.PLANETS) || this.PLANETS_FALLBACK; },

    // ===================== BODY-PART CORRESPONDENCES =====================

    SIGN_BODY_PARTS: {
        Aries: 'Head', Taurus: 'Face', Gemini: 'Neck', Cancer: 'Chest',
        Leo: 'Upper Abdomen', Virgo: 'Lower Abdomen', Libra: 'Groins',
        Scorpio: 'Genital Organs', Sagittarius: 'Thighs', Capricorn: 'Knees',
        Aquarius: 'Shanks', Pisces: 'Feet'
    },

    HOUSE_BODY_PARTS: {
        1: 'Head, Brain, Mind',
        2: 'Face, Eyes, Nose, Tongue, Teeth, Ears, Fingers, Nails, Bones, Flesh',
        3: 'Neck, Throat, Collar Bones, Hands, Breathing, Bodily Growth',
        4: 'Heart, Lungs, Chest, Blood',
        5: 'Upper Abdomen, Mind',
        6: 'Lower Abdomen, Navel, Bones, Flesh, Mental Faculties',
        7: 'Groins, Semen, Female Organs, Breathing',
        8: 'Genital Organs, Urinary System, Blood',
        9: 'Thighs, Limbs',
        10: 'Knees, Bones, Flesh',
        11: 'Shanks, Breathing',
        12: 'Feet, Blood'
    },

    PLANET_DOSHA: {
        Sun: 'Bile (Pitta)', Moon: 'Wind (Vata)', Mars: 'Bile (Pitta)',
        Mercury: 'Wind (with slight Bile & Phlegm)', Jupiter: 'Phlegm (Kapha)',
        Venus: 'Wind (Vata)', Saturn: 'Wind (Vata)', Rahu: '—', Ketu: '—'
    },

    PLANET_BODY_PARTS: {
        Sun: 'Stomach, Bones, Right Eye, Heart, Skin, Belly, Head',
        Moon: 'Heart, Lungs, Mind, Blood, Left Eye, Kidney, Alimentary Canal, Bodily Fluids',
        Mars: 'Blood, Marrow, Vital Energy, Neck, Genitals, Rectum, Head, Veins, Female Organs',
        Mercury: 'Chest, Nerves, Skin, Navel, Nose, Spinal System, Gall Bladder',
        Jupiter: 'Thighs, Fat Tissue, Brain, Lungs, Liver, Kidney, Ears, Memory, Tongue, Spleen',
        Venus: 'Face, Eyesight, Genital Organs, Semen, Urine, Complexion, Throat, Glands',
        Saturn: 'Legs, Bones, Muscles, Limbs, Teeth, Skin, Hair',
        Rahu: 'Feet, Breathing',
        Ketu: 'Belly'
    },

    // General disease tendencies ruled by each planet (used for Dasha effect text)
    PLANET_DISEASES: {
        Sun: ['general debility', 'eye trouble', 'heart trouble', 'bone fracture', 'palpitation', 'fevers'],
        Moon: ['emotional/mental disturbance', 'menstrual disorder', 'blood-related trouble', 'cough/cold', 'water retention'],
        Mars: ['blood pressure issues', 'accidents/injuries', 'inflammation', 'skin eruptions', 'surgical conditions'],
        Mercury: ['nervous system trouble', 'skin ailments', 'digestive/nervous breakdown', 'speech-related issues', 'fever (typhoid-type)'],
        Jupiter: ['liver/spleen trouble', 'kidney or ear trouble', 'weight/fat-related issues', 'thirst-related (diabetic-type) tendency'],
        Venus: ['reproductive-system trouble', 'urinary/kidney trouble', 'eye trouble', 'throat/glandular trouble'],
        Saturn: ['bone/joint disease', 'chronic and lingering ailments', 'skin disease', 'mental worry/depression-like state', 'rheumatic pain'],
        Rahu: ['breathing difficulty', 'skin/toxicity related ailment', 'unusual or hard-to-diagnose conditions'],
        Ketu: ['bodily pain of unclear origin', 'lingering, slow-to-resolve ailments']
    },

    // ===================== MARAKA / FUNCTIONAL MALEFIC TABLE (BY LAGNA) =====================
    MARAKA_MALEFIC_BY_LAGNA: {
        Aries:       { maraka: ['Venus'],           malefic: ['Mercury', 'Moon', 'Saturn', 'Mars'] },
        Taurus:      { maraka: ['Mars'],             malefic: ['Moon', 'Jupiter'] },
        Gemini:      { maraka: ['Jupiter'],           malefic: ['Sun', 'Mars', 'Saturn', 'Mercury'] },
        Cancer:      { maraka: ['Sun'],               malefic: ['Mercury', 'Venus', 'Moon'] },
        Leo:         { maraka: ['Mercury', 'Saturn'], malefic: ['Venus'] },
        Virgo:       { maraka: ['Jupiter', 'Venus'],  malefic: ['Mars', 'Saturn', 'Moon', 'Mercury'] },
        Libra:       { maraka: ['Mars'],               malefic: ['Jupiter', 'Sun', 'Moon'] },
        Scorpio:     { maraka: ['Venus'],             malefic: ['Saturn', 'Mercury'] },
        Sagittarius: { maraka: ['Saturn', 'Mercury'], malefic: ['Venus', 'Moon', 'Jupiter'] },
        Capricorn:   { maraka: ['Saturn', 'Moon'],    malefic: ['Jupiter', 'Mars', 'Sun'] },
        Aquarius:    { maraka: ['Jupiter', 'Sun'],    malefic: ['Mars', 'Moon'] },
        Pisces:      { maraka: ['Mercury', 'Mars'],   malefic: ['Jupiter', 'Venus', 'Sun', 'Saturn'] }
    },

    // ===================== SPECIFIC DISEASE DATABASE (Chapters III–X) =====================
    DISEASE_DB: [
        // Chapter III — Brain & Nerves
        { name: 'Insanity / Mental Disorder', chapter: 'III', planets: ['Moon','Mercury','Rahu','Saturn'], houses: [1,5] },
        { name: 'Brain Disease (tumour/haemorrhage/inflammation)', chapter: 'III', planets: ['Sun','Mars'], houses: [1], signs: ['Aries'] },
        { name: 'Epilepsy / Neurasthenia / Hysteria', chapter: 'III', planets: ['Mercury','Moon'], houses: [1] },
        { name: 'Paralysis / Poliomyelitis', chapter: 'III', planets: ['Mercury','Sun','Moon'], houses: [1,9] },

        // Chapter IV — Face & Throat
        { name: 'Eye Disease', chapter: 'IV', planets: ['Sun','Moon','Venus','Saturn','Mars','Rahu','Ketu'], houses: [2,12] },
        { name: 'Dental Disease', chapter: 'IV', planets: ['Saturn'], houses: [2,7] },
        { name: 'Nasal Disease', chapter: 'IV', planets: ['Mercury'], houses: [2] },
        { name: 'Tongue/Speech Disorder', chapter: 'IV', planets: ['Jupiter'], houses: [2] },
        { name: 'Deafness / Ear Trouble', chapter: 'IV', planets: ['Jupiter'], houses: [2,3,11,12] },
        { name: 'Throat Disease (Tonsillitis / Pharyngitis)', chapter: 'IV', planets: ['Venus','Mars','Rahu'], houses: [3] },

        // Chapter V — Chest, Lungs, Heart
        { name: 'Asthma', chapter: 'V', planets: ['Mercury','Moon','Rahu'], houses: [3], signs: ['Gemini','Libra','Aquarius'] },
        { name: 'Pleura / Lung Disease (incl. Tuberculosis)', chapter: 'V', planets: ['Sun','Moon','Rahu'], houses: [4], signs: ['Cancer'] },
        { name: 'Heart Disease', chapter: 'V', planets: ['Sun','Moon','Saturn','Ketu'], houses: [4], signs: ['Cancer'] },
        { name: 'Mammary Gland Disorder', chapter: 'V', planets: ['Moon'], houses: [4,10] },

        // Chapter VI — Abdomen
        { name: 'Stomach Disease', chapter: 'VI', planets: ['Sun'], houses: [5], signs: ['Leo'] },
        { name: 'Spleen Disease', chapter: 'VI', planets: ['Jupiter'], houses: [9], signs: ['Sagittarius'] },
        { name: 'Liver Disease', chapter: 'VI', planets: ['Jupiter'], houses: [5], signs: ['Leo'] },
        { name: 'Bilious Disorder', chapter: 'VI', planets: ['Sun','Mars'] },
        { name: 'Bowel / Intestinal Disease', chapter: 'VI', planets: ['Sun'], houses: [6], signs: ['Virgo'] },
        { name: 'Colic', chapter: 'VI', planets: ['Saturn','Ketu'], houses: [6] },
        { name: 'Dyspepsia / Diarrhoea / Cholera', chapter: 'VI', planets: ['Sun','Moon','Mercury'], houses: [6], signs: ['Virgo'] },
        { name: 'Dysentery', chapter: 'VI', planets: ['Mars'], houses: [5,6] },
        { name: 'Gall Bladder Disorder', chapter: 'VI', planets: ['Mercury'], houses: [6] },
        { name: 'Appendicitis', chapter: 'VI', planets: ['Moon','Sun'], houses: [6], signs: ['Virgo'] },
        { name: 'Diabetes', chapter: 'VI', planets: ['Venus','Moon','Jupiter'], houses: [6,8] },

        // Chapter VII — Groins & Genital Organs
        { name: 'Kidney / Pelvis Disorder', chapter: 'VII', planets: ['Jupiter','Moon'], houses: [7], signs: ['Libra'] },
        { name: 'Hernia', chapter: 'VII', planets: ['Moon'], signs: ['Libra'] },
        { name: 'Female Organ Disorder', chapter: 'VII', planets: ['Mars'], houses: [7], signs: ['Libra'] },
        { name: 'Menstrual Disorder', chapter: 'VII', planets: ['Moon','Mars'], houses: [6,7,8] },
        { name: 'Urinary Disease', chapter: 'VII', planets: ['Venus','Mars'], houses: [7,8] },
        { name: 'Piles & Fistula', chapter: 'VII', planets: ['Mars'], houses: [7,8] },
        { name: 'Genital Ulcer', chapter: 'VII', planets: ['Mercury','Mars'], houses: [8] },
        { name: 'Venereal Disease', chapter: 'VII', planets: ['Venus'], houses: [8] },
        { name: 'Hydrocele', chapter: 'VII', planets: ['Rahu'], houses: [8] },
        { name: 'Impotency / Sterility', chapter: 'VII', planets: ['Venus','Mars'], houses: [7,5] },

        // Chapter VIII — Blood, Bones & Limbs
        { name: 'Anaemia', chapter: 'VIII', planets: ['Mars'], signs: ['Cancer','Scorpio','Pisces'] },
        { name: 'Blood Pressure Disorder', chapter: 'VIII', planets: ['Moon','Mars'] },
        { name: 'Leukaemia', chapter: 'VIII', planets: ['Rahu'], signs: ['Cancer','Scorpio','Pisces'] },
        { name: 'Bone Fracture', chapter: 'VIII', planets: ['Saturn','Sun','Mars','Mercury'], houses: [2,6,10], signs: ['Taurus','Virgo','Capricorn'] },
        { name: 'Loss of Limb', chapter: 'VIII', planets: ['Saturn'], houses: [9], signs: ['Sagittarius'] },
        { name: 'Physical Deformity', chapter: 'VIII', planets: ['Sun','Saturn','Ketu'], houses: [1], signs: ['Aries'] },

        // Chapter IX — Impure Blood & Skin
        { name: 'Leprosy', chapter: 'IX', planets: ['Rahu','Saturn','Mars','Moon','Mercury','Sun'], houses: [1] },
        { name: 'Leucoderma', chapter: 'IX', planets: ['Moon','Saturn','Mercury'], houses: [6] },
        { name: 'Malignant Growth / Cancer-type Condition', chapter: 'IX', planets: ['Rahu'] },
        { name: 'Tumour / Boil / Abscess', chapter: 'IX', planets: ['Mars'], signs: ['Cancer','Scorpio','Pisces'] },
        { name: 'Blood Impurity / Toxicity', chapter: 'IX', planets: ['Mars','Moon','Rahu','Ketu'], signs: ['Cancer','Scorpio','Pisces'] },
        { name: 'Ulcer / Wound / Cut / Burn', chapter: 'IX', planets: ['Mercury','Mars','Sun'], signs: ['Aries','Leo','Sagittarius'] },
        { name: 'Pox-type Eruptive Disease', chapter: 'IX', planets: ['Mars','Mercury'] },
        { name: 'Skin Itches / Skin Disease', chapter: 'IX', planets: ['Saturn','Moon'] },

        // Chapter X — Other Diseases
        { name: 'Fever', chapter: 'X', planets: ['Sun','Mars','Moon','Mercury','Venus','Rahu'] },
        { name: 'Rheumatic Disease', chapter: 'X', planets: ['Moon','Mercury','Venus','Saturn'] },
        { name: 'Filaria / Dropsy / Beri-beri', chapter: 'X', planets: ['Moon','Venus'], signs: ['Cancer','Scorpio','Pisces'] },
        { name: 'Plague / Tetanus / Hydrophobia-type Condition', chapter: 'X', planets: ['Moon','Saturn'], houses: [2] }
    ],

    // ===================== GENERAL REMEDIAL MEASURES (BY PLANET) =====================
    REMEDIES: {
        Sun:     { day: 'Sunday',    items: 'Offer water to the rising sun; donate wheat, jaggery or copper', practice: 'Recite Aditya Hridayam or a Surya mantra; respect one\u2019s father/authority figures' },
        Moon:    { day: 'Monday',    items: 'Donate rice, milk or white clothing', practice: 'Keep a calm evening routine; recite a Chandra mantra; be gentle with the mind' },
        Mars:    { day: 'Tuesday',   items: 'Donate red lentils or red cloth', practice: 'Recite Hanuman Chalisa; channel energy into disciplined exercise; avoid conflict' },
        Mercury: { day: 'Wednesday', items: 'Donate green items or green gram', practice: 'Practice calming breathwork; recite Vishnu Sahasranama; keep the nervous system unstrained' },
        Jupiter: { day: 'Thursday',  items: 'Donate turmeric, yellow items, or books to teachers/priests', practice: 'Show respect to elders and gurus; recite a Guru/Jupiter mantra' },
        Venus:   { day: 'Friday',    items: 'Donate white clothing, sugar, or ghee', practice: 'Practice moderation in diet and relationships; recite a Venus/Lakshmi mantra' },
        Saturn:  { day: 'Saturday',  items: 'Donate black sesame, mustard oil, or iron to the needy', practice: 'Serve the elderly/underprivileged; recite Shani mantra or Hanuman Chalisa; cultivate patience' },
        Rahu:    { day: 'Saturday',  items: 'Donate mustard oil or black gram', practice: 'Avoid intoxicants; chant a Durga or Rahu-pacifying mantra' },
        Ketu:    { day: 'Tuesday',   items: 'Donate multi-coloured blankets or til (sesame)', practice: 'Feed dogs; chant a Ganesha mantra; keep a simple, grounded routine' }
    },

    // ===================== CORE ANALYSIS =====================

    /**
     * Determine which planets are afflicted, and why.
     */
    getAfflictions: function (planetsData, planetsInHouses, conjunctions, aspects) {
        const malefics = this._malefics();
        const afflictions = {};
        const byName = {};
        (planetsInHouses || []).forEach(p => { byName[p.name] = p; });

        this._planets().forEach(name => {
            const raw = planetsData[name];
            const p = byName[name] || (raw ? {
                name: name, house: raw.house || 1, status: raw.status || 'Neutral',
                retrograde: raw.retro || false, combust: raw.combust || false, sign: null
            } : null);
            if (!raw || !p) return;

            const reasons = [];
            const status = String(p.status || '').toLowerCase();
            if (status.indexOf('debil') === 0 || status.indexOf('debil') > -1) reasons.push('Debilitated');
            if (status.indexOf('enem') > -1) reasons.push('In an enemy sign');
            if (p.combust) reasons.push('Combust (too close to the Sun)');
            if (p.retrograde && malefics.includes(name)) reasons.push('Retrograde malefic (intensified affliction)');
            if ([6, 8, 12].includes(p.house)) reasons.push(`Placed in Dusthana (${p.house}th house)`);

            (conjunctions || []).forEach(c => {
                let other = null;
                if (c.planet1 === name) other = c.planet2;
                else if (c.planet2 === name) other = c.planet1;
                if (other && malefics.includes(other)) {
                    reasons.push(`Conjunct malefic ${other} (orb ${c.orb.toFixed(1)}°)`);
                }
            });

            (aspects || []).forEach(a => {
                if (a.aspectingPlanet === name && a.type === 'Unfavorable' && malefics.includes(a.planet)) {
                    reasons.push(`Malefic aspect from ${a.planet}`);
                }
            });

            if (reasons.length) {
                afflictions[name] = {
                    reasons: reasons,
                    score: reasons.length,
                    house: p.house,
                    sign: p.sign || null
                };
            }
        });

        return afflictions;
    },

    /**
     * Match the affliction pattern against the disease database.
     */
    matchDiseases: function (afflictions, planetsInHouses) {
        const afflictedPlanets = Object.keys(afflictions);
        const afflictedHouses = new Set();
        const afflictedSigns = new Set();
        (planetsInHouses || []).forEach(p => {
            if (afflictions[p.name]) {
                afflictedHouses.add(p.house);
                if (p.sign) afflictedSigns.add(p.sign);
            }
        });

        const matches = [];
        this.DISEASE_DB.forEach(entry => {
            let score = 0;
            const matchedPlanets = [];
            const matchedHouses = [];
            const matchedSigns = [];

            (entry.planets || []).forEach(pl => {
                if (afflictedPlanets.includes(pl)) { score++; matchedPlanets.push(pl); }
            });
            (entry.houses || []).forEach(h => {
                if (afflictedHouses.has(h)) { score++; matchedHouses.push(h); }
            });
            (entry.signs || []).forEach(s => {
                if (afflictedSigns.has(s)) { score++; matchedSigns.push(s); }
            });

            if (score > 0) {
                matches.push({
                    name: entry.name, chapter: entry.chapter, score: score,
                    matchedPlanets: matchedPlanets, matchedHouses: matchedHouses, matchedSigns: matchedSigns
                });
            }
        });

        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, 12);
    },

    /**
     * Analyse current Dasha timing for disease-triggering potential.
     * dashaCtx: { md, ad, pd } — planet names of current Mahadasha/Antardasha/Pratyantardasha lords
     */
    analyzeDasha: function (dashaCtx, ascSign, sixthLord, eighthLord, afflictions) {
        const table = this.MARAKA_MALEFIC_BY_LAGNA[ascSign] || { maraka: [], malefic: [] };
        const levels = [
            { level: 'Mahadasha (MD)', lord: dashaCtx.md },
            { level: 'Antardasha (AD)', lord: dashaCtx.ad },
            { level: 'Pratyantardasha (PD)', lord: dashaCtx.pd }
        ].filter(l => l.lord);

        return levels.map(l => {
            const causes = [];
            if (table.maraka.includes(l.lord)) causes.push(`${l.lord} is a Maraka (death/serious-illness-inflicting) planet for ${ascSign} Lagna`);
            if (table.malefic.includes(l.lord)) causes.push(`${l.lord} is a functional malefic (disease-inflicting) planet for ${ascSign} Lagna`);
            if (l.lord === sixthLord) causes.push(`${l.lord} is the 6th Lord (primary house of disease)`);
            if (l.lord === eighthLord) causes.push(`${l.lord} is the 8th Lord (house of chronic disease)`);
            if (afflictions[l.lord]) causes.push(`${l.lord} is itself natally afflicted: ${afflictions[l.lord].reasons.join('; ')}`);

            const diseases = this.PLANET_DISEASES[l.lord] || [];
            const bodyParts = this.PLANET_BODY_PARTS[l.lord] || 'general constitution';

            return {
                level: l.level,
                lord: l.lord,
                triggered: causes.length > 0,
                causes: causes,
                effect: causes.length
                    ? `Increased likelihood of issues related to ${bodyParts} — commonly manifesting as ${diseases.join(', ') || 'general weakness'} during this period.`
                    : `No strong classical disease-timing factor found for ${l.lord} in this period; general vitality should hold steady, subject to transit influences.`,
                remedy: this.REMEDIES[l.lord]
            };
        });
    },

    /**
     * Build the complete step-by-step report.
     */
    generateReport: function (planetsData, ascData, dashaCtx) {
        if (!planetsData || !ascData) return null;
        const SIGNS = this._signs();
        const SIGN_LORDS = this._signLords();
        const ascSn = ascData.sn || 0;
        const ascSign = SIGNS[ascSn];
        const lagnaLord = SIGN_LORDS[ascSn];
        const sixthLord = SIGN_LORDS[(ascSn + 5) % 12];
        const eighthLord = SIGN_LORDS[(ascSn + 7) % 12];
        const twelfthLord = SIGN_LORDS[(ascSn + 11) % 12];

        let planetsInHouses = [], conjunctions = [], aspects = [];
        if (window.PREDICTION_ANALYSIS) {
            planetsInHouses = window.PREDICTION_ANALYSIS.getPlanetsInHouses(planetsData) || [];
            conjunctions = window.PREDICTION_ANALYSIS.getConjunctions(planetsData) || [];
            aspects = window.PREDICTION_ANALYSIS.getAspects(planetsData) || [];
        } else {
            // minimal fallback
            this._planets().forEach(name => {
                const p = planetsData[name];
                if (p) planetsInHouses.push({ name: name, house: p.house || 1, sign: SIGNS[p.sn % 12], status: p.status, retrograde: p.retro, combust: p.combust });
            });
        }

        const afflictions = this.getAfflictions(planetsData, planetsInHouses, conjunctions, aspects);

        // Foundational health flags (Step 1)
        const foundationFlags = [];
        if (afflictions[lagnaLord]) foundationFlags.push(`Lagna Lord (${lagnaLord}) is afflicted: ${afflictions[lagnaLord].reasons.join('; ')} — general health/vitality needs attention.`);
        if (afflictions['Sun']) foundationFlags.push(`Sun (Karaka for the physical body) is afflicted: ${afflictions['Sun'].reasons.join('; ')}.`);
        if (afflictions['Moon']) foundationFlags.push(`Moon (Karaka for the mind) is afflicted: ${afflictions['Moon'].reasons.join('; ')}.`);

        const sixthHouseOccupants = planetsInHouses.filter(p => p.house === 6).map(p => p.name);
        const eighthHouseOccupants = planetsInHouses.filter(p => p.house === 8).map(p => p.name);
        const twelfthHouseOccupants = planetsInHouses.filter(p => p.house === 12).map(p => p.name);
        const lagnaOccupants = planetsInHouses.filter(p => p.house === 1).map(p => p.name);
        const malefics = this._malefics();

        if (sixthHouseOccupants.some(p => ['Saturn','Mars'].includes(p))) {
            foundationFlags.push(`Saturn and/or Mars occupy the 6th house — classic disease-inflicting placement, especially if aspected by Sun/Rahu.`);
        }
        if (eighthHouseOccupants.filter(p => malefics.includes(p)).length >= 2) {
            foundationFlags.push(`Two or more malefics (${eighthHouseOccupants.filter(p => malefics.includes(p)).join(', ')}) occupy the 8th house — indicates chronic/serious health risk.`);
        }
        if (twelfthHouseOccupants.includes('Venus') && afflictions['Venus']) {
            foundationFlags.push(`Venus is afflicted in the 12th house.`);
        }
        if (lagnaOccupants.includes('Ketu')) foundationFlags.push(`Ketu is placed in the Lagna.`);
        if (lagnaOccupants.includes('Saturn') || planetsInHouses.some(p => p.name === 'Saturn' && p.house === 7)) {
            foundationFlags.push(`Saturn is placed in the Lagna or 7th house.`);
        }

        const diseaseMatches = this.matchDiseases(afflictions, planetsInHouses);
        const dashaAnalysis = this.analyzeDasha(dashaCtx || {}, ascSign, sixthLord, eighthLord, afflictions);

        // Collect involved planets for remedy section
        const involvedPlanets = new Set(Object.keys(afflictions));
        (dashaCtx ? [dashaCtx.md, dashaCtx.ad, dashaCtx.pd] : []).forEach(l => { if (l) involvedPlanets.add(l); });

        return {
            ascSign: ascSign, lagnaLord: lagnaLord, sixthLord: sixthLord, eighthLord: eighthLord, twelfthLord: twelfthLord,
            foundationFlags: foundationFlags,
            afflictions: afflictions,
            diseaseMatches: diseaseMatches,
            dashaAnalysis: dashaAnalysis,
            involvedPlanets: Array.from(involvedPlanets)
        };
    },

    // ===================== RENDER (STEP-BY-STEP HTML) =====================

    _stepHeader: function (num, title, color) {
        return `<div class="pred-title" style="color:${color || 'var(--rose)'};margin-top:10px;">STEP ${num} — ${title}</div>`;
    },

    renderHTML: function (report) {
        if (!report) {
            return `<div class="pred-item">Please set birth details first.</div>`;
        }
        const RED = '#FF4444', ORANGE = '#FF9933', GOLD = '#FFD700', MUTED = 'var(--muted)';

        let html = `<div class="pred-item" style="border-left:3px solid ${RED};">
            <div class="pred-title" style="color:${RED};">🩺 Disease Predictor — "${this.META.title}" (${this.META.author}, ${this.META.year})</div>
            <div style="font-size:9px;color:${MUTED};margin-bottom:4px;">Lagna: <b>${report.ascSign}</b> · Lagna Lord: <b>${report.lagnaLord}</b> · 6th Lord: <b>${report.sixthLord}</b> · 8th Lord: <b>${report.eighthLord}</b> · 12th Lord: <b>${report.twelfthLord}</b></div>`;

        // STEP 1 — Foundation
        html += this._stepHeader(1, 'Health Foundation Check', GOLD);
        if (report.foundationFlags.length) {
            html += `<div style="font-size:9.5px;color:${MUTED};">`;
            report.foundationFlags.forEach(f => {
                html += `<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06);">⚠ ${f}</div>`;
            });
            html += `</div>`;
        } else {
            html += `<div style="font-size:9.5px;color:${MUTED};">No major classical red-flags found on Lagna/Sun/Moon/6th house — foundation appears reasonably stable.</div>`;
        }

        // STEP 2 — Afflicted planets & body parts
        html += this._stepHeader(2, 'Afflicted Planets & Body Parts Governed', ORANGE);
        const afflictedNames = Object.keys(report.afflictions);
        if (afflictedNames.length) {
            html += `<div style="font-size:9.5px;">`;
            afflictedNames.forEach(name => {
                const a = report.afflictions[name];
                const parts = this.PLANET_BODY_PARTS[name] || '';
                html += `<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                    <b style="color:${ORANGE};">${name}</b> <span style="color:${MUTED};">(${this.PLANET_DOSHA[name] || ''})</span>
                    — <span style="color:${MUTED};">${a.reasons.join('; ')}</span>
                    <div style="color:${MUTED};font-size:8.5px;">Body parts ruled: ${parts}</div>
                </div>`;
            });
            html += `</div>`;
        } else {
            html += `<div style="font-size:9.5px;color:${MUTED};">No significant planetary afflictions detected by conjunction/aspect/dignity rules.</div>`;
        }

        // STEP 3 — Disease tendencies (Cause -> Effect -> Remedy)
        html += this._stepHeader(3, 'Predicted Disease Tendencies (Cause → Effect → Remedy)', RED);
        if (report.diseaseMatches.length) {
            report.diseaseMatches.forEach(m => {
                const chief = m.matchedPlanets[0] || (report.involvedPlanets[0]);
                const remedy = this.REMEDIES[chief];
                html += `<div style="margin:6px 0;padding:6px 8px;border-radius:5px;background:rgba(255,68,68,.06);border:1px solid rgba(255,68,68,.2);">
                    <div style="font-weight:bold;color:${RED};font-size:10px;">${m.name} <span style="color:${MUTED};font-weight:normal;font-size:8px;">(Ch.${m.chapter} · match strength ${m.score})</span></div>
                    <div style="font-size:9px;color:${MUTED};margin-top:2px;"><b style="color:${GOLD};">CAUSE:</b> Affliction involving ${[...m.matchedPlanets, ...m.matchedHouses.map(h => 'House ' + h), ...m.matchedSigns].join(', ') || 'related factors'}.</div>
                    <div style="font-size:9px;color:${MUTED};"><b style="color:${GOLD};">EFFECT:</b> Tendency toward ${m.name.toLowerCase()}, affecting ${this.HOUSE_BODY_PARTS[m.matchedHouses[0]] || (chief ? this.PLANET_BODY_PARTS[chief] : 'related body area')}.</div>
                    ${remedy ? `<div style="font-size:9px;color:${MUTED};"><b style="color:${GOLD};">REMEDY:</b> ${remedy.items}; ${remedy.practice} (best observed on ${remedy.day}).</div>` : ''}
                </div>`;
            });
        } else {
            html += `<div style="font-size:9.5px;color:${MUTED};">No specific disease pattern strongly matched — chart shows no major planetary afflictions against the reference database.</div>`;
        }

        // STEP 4 — Dasha timing
        html += this._stepHeader(4, 'Dasha Timing — Cause & Effect During Current Periods', GOLD);
        if (report.dashaAnalysis.length) {
            report.dashaAnalysis.forEach(d => {
                const color = d.triggered ? RED : '#00DD77';
                html += `<div style="margin:6px 0;padding:6px 8px;border-radius:5px;background:rgba(255,215,0,.05);border:1px solid rgba(255,215,0,.2);">
                    <div style="font-weight:bold;color:${color};font-size:10px;">${d.level}: ${d.lord} ${d.triggered ? '⚠ Disease-Timing Alert' : '(Neutral for health)'}</div>
                    ${d.causes.length ? `<div style="font-size:9px;color:${MUTED};"><b style="color:${GOLD};">CAUSE:</b> ${d.causes.join('; ')}.</div>` : ''}
                    <div style="font-size:9px;color:${MUTED};"><b style="color:${GOLD};">EFFECT:</b> ${d.effect}</div>
                    ${d.remedy ? `<div style="font-size:9px;color:${MUTED};"><b style="color:${GOLD};">REMEDY:</b> ${d.remedy.items}; ${d.remedy.practice} (best observed on ${d.remedy.day}).</div>` : ''}
                </div>`;
            });
        } else {
            html += `<div style="font-size:9.5px;color:${MUTED};">No active Dasha context supplied.</div>`;
        }

        // STEP 5 — General remedies summary
        html += this._stepHeader(5, 'General Remedial Measures (Planets Involved)', '#00DD77');
        html += `<div style="font-size:9px;color:${MUTED};">`;
        report.involvedPlanets.forEach(p => {
            const r = this.REMEDIES[p];
            if (!r) return;
            html += `<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06);"><b style="color:#00DD77;">${p}</b> (${r.day}): ${r.items}; ${r.practice}.</div>`;
        });
        html += `</div>`;

        html += `<div style="margin-top:10px;padding-top:6px;border-top:1px dashed rgba(255,68,68,.3);font-size:8px;color:${MUTED};">
            Reference: "${this.META.title}" — ${this.META.author}, ${this.META.place}, ${this.META.year}. This is a study/reference tool for classical Vedic health-astrology correspondences.
            It is <b>not medical advice</b> — always consult a qualified medical professional for any health concern.
        </div>`;

        html += `</div>`;
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DISEASE_PREDICTOR;
}
