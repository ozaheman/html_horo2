/**
 * navamsha_analysis.js
 * Comprehensive logic for Navamsha (D9) insights, Jaimini Karakas, 
 * Khar Points (64th Navamsha, 22nd Drekkana), and Vish (Poisonous) Navamshas.
 */

/**
 * navamsha_analysis.js
 * Comprehensive logic for Navamsha (D9) insights, Jaimini Karakas, 
 * Khar Points (64th Navamsha, 22nd Drekkana), and Vish (Poisonous) Navamshas.
 */

window.NAVAMSHA_ANALYSIS = {
    getSignLord: function(signIndex) {
        return window.ASTRO_CONSTANTS.SIGN_LORDS[signIndex];
    },

    /**
     * Calculate 7 Charakarakas (AK, AmK etc.)
     */
    calculateKarakas: function(planets) {
        let pArray = [];
        const corePlanets = window.ASTRO_CONSTANTS.PLANETS.slice(0, 7);
        
        corePlanets.forEach(p => {
            if (planets[p]) {
                let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                let signDeg = lon % 30;
                pArray.push({ name: p, degree: signDeg, totalLon: lon });
            }
        });

        // Sort descending by degree in sign
        pArray.sort((a, b) => b.degree - a.degree);

        return {
            AK: pArray[0] || null,
            AmK: pArray[1] || null,
            sorted: pArray
        };
    },

    /**
     * Calculate Arudha Lagna (AL) and Upapada Lagna (UL)
     */
    calculateArudha: function(houseIndex, lagnaSign) {
        let houseSign = (lagnaSign + houseIndex) % 12;
        let lord = this.getSignLord(houseSign);
        return { houseSign, lord };
    },

    getLordSignPos: function(lordName, planets) {
        if (!planets[lordName]) return 0;
        let lon = planets[lordName].longitude !== undefined ? planets[lordName].longitude : planets[lordName].sid;
        return Math.floor(lon / 30);
    },

    /**
     * Determine Arudha pad for an initial sign
     */
    getPadSign: function(baseSign, lordSign) {
        let dist = (lordSign - baseSign + 12) % 12;
        let arudhaSign = (lordSign + dist) % 12;
        
        // Parashara Exceptions
        if (dist === 0) { // lord in same house -> 10th from there
            arudhaSign = (baseSign + 9) % 12;
        } else if (dist === 6) { // lord in 7th -> 4th from there
            arudhaSign = (baseSign + 3) % 12;
        }
        
        return arudhaSign;
    },

    /**
     * Poisonous Navamsha Effects 
     */
    VISH_EFFECTS: {
        'Sun': "Issues with authority figures and father. Frequent ego clashes.",
        'Moon': "Negative thinking, deep emotional turbulence, and mental toxicity.",
        'Mars': "Relationship difficulties, aggressive outbursts, and sibling issues.",
        'Mercury': "Impaired communication, nervous anxiety, clouded worldly intelligence.",
        'Jupiter': "Lack of mutual respect with teachers/Gurus, stalled wisdom.",
        'Saturn': "A lifetime of extraordinary hard work, struggle, and slow progress.",
        'Rahu': "Suffering from deep past-life karmic bonds and illusions.",
        'Ketu': "Extreme isolation, detachment struggles, and sudden karmic events."
    },

    calculate: function(planets, ascendant) {
        let results = {};
        
        let ascLon = ascendant.longitude !== undefined ? ascendant.longitude : ascendant.sid;
        let ascSign = Math.floor(ascLon / 30);
        let ascDeg = ascLon % 30;

        // 1. Jaimini Karakas
        let karakas = this.calculateKarakas(planets);
        results.AK = karakas.AK ? karakas.AK.name : '-';
        results.AmK = karakas.AmK ? karakas.AmK.name : '-';
        
        // Karakamsa
        if (karakas.AK) {
            let akD9 = typeof getVargaData === 'function' ? getVargaData(karakas.AK.totalLon, 9).sign : 0;
            results.KarakamsaSign = window.ASTRO_CONSTANTS.SIGNS[akD9];
        } else {
            results.KarakamsaSign = '-';
        }

        // Arudha & Upapada (Simplified Parashara)
        let lagnaLord = this.getSignLord(ascSign);
        let lagnaLordPos = this.getLordSignPos(lagnaLord, planets);
        let AL_Sign = this.getPadSign(ascSign, lagnaLordPos);
        results.ArudhaLagna = window.ASTRO_CONSTANTS.SIGNS[AL_Sign];

        let twelfthSign = (ascSign + 11) % 12;
        let twelfthLord = this.getSignLord(twelfthSign);
        let twelfthLordPos = this.getLordSignPos(twelfthLord, planets);
        let UL_Sign = this.getPadSign(twelfthSign, twelfthLordPos);
        results.UpapadaLagna = window.ASTRO_CONSTANTS.SIGNS[UL_Sign];

        // 2. Khar Points
        // 64th Navamsha = 210 degrees from Planet
        if (planets.Moon && typeof getVargaData === 'function') {
            let moonLon = planets.Moon.longitude !== undefined ? planets.Moon.longitude : planets.Moon.sid;
            let khar64Lon = (moonLon + 210) % 360;
            let navamsha64th = getVargaData(khar64Lon, 9).sign;
            results.Khar64Lord = this.getSignLord(navamsha64th);
        } else {
            results.Khar64Lord = '-';
        }

        // 64th Navamsha (4th sign from Ascendant's Navamsha sign)
        if (typeof getVargaData === 'function') {
            let khar64AscLon = (ascLon + 210) % 360;
            let navamsha64th_asc = getVargaData(khar64AscLon, 9).sign;
            results.Khar64Lord_Asc = this.getSignLord(navamsha64th_asc);
        } else {
            results.Khar64Lord_Asc = '-';
        }

        // 22nd Drekkana = 210 degrees from Ascendant
        if (typeof getVargaData === 'function') {
            let drekkana22Lon = (ascLon + 210) % 360;
            let drekkana22nd = getVargaData(drekkana22Lon, 3).sign;
            results.Khar22Lord = this.getSignLord(drekkana22nd);
        } else {
            results.Khar22Lord = '-';
        }

        // Step by Step 64th Navamsha Calculation array for all bodies
        results.Khar64_AllBodies = [];
        let rasiMultiplier = 30;
        let navamsaLength = 3.3333333333333;

        let calculate64thNav = (name, totalLon) => {
             let kharPointLon = (totalLon + 210) % 360;
             let signD1 = Math.floor(kharPointLon / rasiMultiplier);
             let degInSign = kharPointLon % rasiMultiplier;
             
             let navIndex = Math.floor(degInSign / navamsaLength);
             
             let startDeg = (signD1 * rasiMultiplier) + (navIndex * navamsaLength);
             let endDeg = startDeg + navamsaLength;
             
             let navamsa64Sign = typeof getVargaData === 'function' ? getVargaData(kharPointLon, 9).sign : 0;

             return {
                 name: name,
                 rasi64: signD1,
                 navamsa64Sign: navamsa64Sign,
                 navamsa64Lord: this.getSignLord(navamsa64Sign),
                 pointLon: parseFloat(kharPointLon.toFixed(4)),
                 startDeg: parseFloat(startDeg.toFixed(4)),
                 endDeg: parseFloat(endDeg.toFixed(4))
             };
        };

        const allBodiesList = window.ASTRO_CONSTANTS.PLANETS;
        results.Khar64_AllBodies.push(calculate64thNav('Lagna', ascLon));
        allBodiesList.forEach(p => {
             if (planets[p]) {
                 let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                 results.Khar64_AllBodies.push(calculate64thNav(p, lon));
             }
        });

        results.DoubleKhar = (results.Khar64Lord !== '-' && results.Khar64Lord === results.Khar22Lord) ? results.Khar64Lord : 'None';

        // 3. Vish (Poisonous) Navamshas
        results.vishPlanets = [];
        
        let nav0_group = [0, 1, 5, 6, 7, 8]; 
        let nav4_group = [2, 4, 10, 11];     
        let nav8_group = [3, 9];             

        allBodiesList.forEach(p => {
            if (planets[p]) {
                let lon = planets[p].longitude !== undefined ? planets[p].longitude : planets[p].sid;
                let sign = Math.floor(lon / 30);
                let deg = lon % 30;
                let navIndex = Math.floor(deg / (30/9)); 

                let isVish = false;
                if (nav0_group.includes(sign) && navIndex === 0) isVish = true;
                if (nav4_group.includes(sign) && navIndex === 4) isVish = true;
                if (nav8_group.includes(sign) && navIndex === 8) isVish = true;

                if (isVish) {
                    let isSunHora = false;
                    if (typeof getVargaData === 'function') {
                        let hora = getVargaData(lon, 2).sign;
                        if (hora === 4) isSunHora = true;
                    }

                    results.vishPlanets.push({
                        name: p,
                        sunHora: isSunHora,
                        effect: this.VISH_EFFECTS[p] || 'Faces deep hurdles in related significations.'
                    });
                }
            }
        });

        return results;
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  NAVAMSHA (D9) — EXTENDED REFERENCE MODULE
 *  Planet-in-House effects, Yoga/Combination detection, and Marriage &
 *  Dharma analysis for the Navamsha chart.
 *
 *  REFERENCES (classical & compiled sources — content below is an original
 *  synthesis of traditional principles, not reproduced text):
 *   - Maharishi Parashara, "Brihat Parashara Hora Shastra" (Navamsha chapter)
 *   - Mantreswara, "Phaladeepika" (Varga chapter)
 *   - C.S. Patel, "Navamsa in Astrology" (Navamsha bhava-phala framework)
 *   - Jaimini Sutras (Karakamsa / Arudha principles, for Karaka-based rules)
 * ═══════════════════════════════════════════════════════════════════════
 */
(function () {

    // ─────────────────────────────────────────────────────────────────
    //  1. HOUSE SIGNIFICATIONS IN THE NAVAMSHA (used for narrative text)
    // ─────────────────────────────────────────────────────────────────
    const D9_HOUSE_SIGNIFICATIONS = {
        1: "Self, overall dharma, personality carried into marriage",
        2: "Family wealth after marriage, spouse's family, speech in partnership",
        3: "Courage & self-effort in relationships, siblings-in-law",
        4: "Domestic happiness, home life, mother-in-law",
        5: "Children, romance, intelligence, past-life merit (purva punya)",
        6: "Disputes, obstacles from in-laws, health of spouse",
        7: "Spouse, marriage & partnership — the primary D9 house",
        8: "Longevity of the marriage, transformation, in-laws' hidden matters",
        9: "Dharma, fortune, father, guru, higher wisdom, pilgrimage",
        10: "Status/career impact of marriage, spouse's career or authority",
        11: "Gains from marriage, fulfillment of desires, spouse's income",
        12: "Losses, foreign residence, intimacy, spiritual liberation (moksha)"
    };

    // ─────────────────────────────────────────────────────────────────
    //  2. PLANET-IN-HOUSE (D9) EFFECT / RESULT / PREDICTION TABLE
    //     Structure: PLANET_IN_HOUSE_D9[planet][house] = {effect, result, prediction}
    // ─────────────────────────────────────────────────────────────────
    const PLANET_IN_HOUSE_D9 = {
        Sun: {
            1: { effect: "Strong will and self-respect define the marital/dharma path.", result: "Favorable", prediction: "Native carries authority and dignity into marriage; spouse may be strong-willed or from a respected family, and the native seeks a union built on mutual self-respect." },
            2: { effect: "Ego and authority color family finances and speech.", result: "Mixed", prediction: "Financial matters may involve friction tied to paternal or authority figures; spouse's family holds traditional or authoritative values." },
            3: { effect: "Assertive courage in marital efforts; authoritative in-laws.", result: "Favorable", prediction: "Native takes confident initiative in relationship matters; siblings-in-law may hold official or leadership positions." },
            4: { effect: "Authority-driven tension in domestic life.", result: "Mixed", prediction: "Home life sees occasional ego-driven friction, though overall domestic dignity and status are maintained." },
            5: { effect: "Children carry leadership qualities; pride touches romance.", result: "Mixed", prediction: "Progeny tend toward authoritative or governmental pursuits; romantic relationships need humility to avoid ego clashes." },
            6: { effect: "Disputes with in-laws centered on authority or status.", result: "Challenging", prediction: "Possible friction or legal-type conflict with spouse's family; native should guard against pride-driven battles." },
            7: { effect: "Spouse is authoritative, dignified, possibly official/administrative.", result: "Mixed", prediction: "Partner tends to be dominant or proud, sometimes holding a position of authority; mutual respect sustains harmony." },
            8: { effect: "Hidden power struggles bring transformation via in-laws.", result: "Challenging", prediction: "Marriage may bring sudden shifts in status; caution is warranted around disputes over inheritance or authority." },
            9: { effect: "Father-like guidance strengthens dharma and fortune.", result: "Highly Auspicious", prediction: "A strong connection to father, guru, or government brings fortune; native is guided toward righteous, principled living." },
            10: { effect: "Marriage elevates public status and career authority.", result: "Highly Auspicious", prediction: "Partnership supports career advancement and public standing; spouse may hold an official or leadership role." },
            11: { effect: "Gains flow through authority figures or elder siblings.", result: "Favorable", prediction: "Financial and social gains arrive through official channels or a capable, respected spouse." },
            12: { effect: "Ego must be released; distance from father/authority possible.", result: "Challenging", prediction: "Native may feel distance from father or authority figures, or find growth by releasing pride within the marriage." }
        },
        Moon: {
            1: { effect: "Emotional, nurturing personality shapes married life.", result: "Favorable", prediction: "Native approaches marriage with sensitivity and care; emotional bonding is central to relationship happiness." },
            2: { effect: "Family security tied to emotional comfort and gentle speech.", result: "Favorable", prediction: "Spouse's family provides emotional and material comfort; communication within the marriage is caring." },
            3: { effect: "Emotional courage; close bond with siblings-in-law.", result: "Favorable", prediction: "Native shows emotional initiative in sustaining the relationship; siblings-in-law tend to be supportive." },
            4: { effect: "Strong domestic happiness; close mother/mother-in-law bond.", result: "Highly Auspicious", prediction: "Home life is emotionally fulfilling, with deep attachment to the mother-in-law and a comfortable domestic environment." },
            5: { effect: "Affectionate, intuitive children; emotionally rich romance.", result: "Highly Auspicious", prediction: "Children are caring and imaginative; romance carries emotional depth and mutual understanding." },
            6: { effect: "Emotional or minor health fluctuations touch the marriage.", result: "Challenging", prediction: "Mood swings or minor health concerns for spouse may test the couple's emotional resilience at times." },
            7: { effect: "Spouse is caring, expressive, and somewhat emotionally variable.", result: "Mixed", prediction: "Partner is nurturing and sensitive; emotional ups and downs need understanding, but the bond is strong overall." },
            8: { effect: "Emotional depth deepens through transformation in the bond.", result: "Mixed", prediction: "Intense emotional experiences reshape the relationship over time; sensitivity and intuition are heightened." },
            9: { effect: "Emotional connection to dharma; nurturing guru figure.", result: "Auspicious", prediction: "Fortune flows through intuitive wisdom and a caring mentor; strong bond with a maternal figure supports growth." },
            10: { effect: "Public recognition through a caring or hospitality-linked role.", result: "Favorable", prediction: "Career gains arrive through nurturing, public-facing, or hospitality-related work; spouse offers emotional support." },
            11: { effect: "Emotional fulfillment and social gains through marriage.", result: "Favorable", prediction: "Social and emotional needs are largely met through partnership; gains arrive through caring networks or popularity." },
            12: { effect: "Longing for solitude; emotional withdrawal at times.", result: "Mixed", prediction: "Native may feel emotionally distant occasionally, or be drawn toward reflective, private, or foreign settings." }
        },
        Mars: {
            1: { effect: "Assertive, passionate, sometimes impulsive marital outlook.", result: "Mixed", prediction: "Native brings energy and initiative to relationships; tempering impulsiveness helps avoid unnecessary conflict." },
            2: { effect: "Blunt speech and financial assertiveness in family matters.", result: "Challenging", prediction: "Sharp words or disputes over family wealth are possible; careful communication protects domestic harmony." },
            3: { effect: "Courageous, competitive bond with siblings-in-law.", result: "Favorable", prediction: "Native takes bold initiative for the relationship; siblings-in-law may be driven or athletic." },
            4: { effect: "Domestic friction; possible property disputes with in-laws.", result: "Challenging", prediction: "Home life may see occasional heated exchanges; land or property matters with in-laws call for patience." },
            5: { effect: "Energetic, competitive children; intense, passionate romance.", result: "Mixed", prediction: "Progeny are bold and driven; romance is passionate but can be volatile without conscious restraint." },
            6: { effect: "Conflict-prone in-laws met with strong resolve.", result: "Mixed", prediction: "Disputes with spouse's family are likely at points, but native's determination usually resolves them." },
            7: { effect: "Spouse is dynamic and assertive; classic caution for friction.", result: "Challenging", prediction: "Partner is strong-willed and driven; mutual patience is needed to prevent quarrels, particularly early in the marriage." },
            8: { effect: "Sudden events and health caution touch the spouse.", result: "Difficult", prediction: "Marriage may involve unexpected upheavals; health caution is advised for the spouse, and hidden disputes can surface." },
            9: { effect: "Bold, action-oriented approach to dharma and fortune.", result: "Favorable", prediction: "Fortune arrives through courageous action, land, or engineering/defence-linked pursuits; father figure may be dynamic." },
            10: { effect: "Ambitious drive elevates career and status through marriage.", result: "Favorable", prediction: "Spouse or partnership fuels professional ambition; success is achieved through determined, sustained effort." },
            11: { effect: "Gains through competitive ventures and an energetic circle.", result: "Favorable", prediction: "Desires are fulfilled through bold action; efforts of the spouse or elder siblings bring material gains." },
            12: { effect: "Suppressed aggression; possible periods of separation.", result: "Challenging", prediction: "Native benefits from releasing combative tendencies; phases of physical distance from spouse are possible." }
        },
        Mercury: {
            1: { effect: "Communicative, witty, intellectually engaged approach to marriage.", result: "Favorable", prediction: "Native values conversation and mental compatibility in partnership; temperament in relationships is adaptable." },
            2: { effect: "Business acumen strengthens family finances and dialogue.", result: "Favorable", prediction: "Spouse's family may be engaged in trade, communication, or education; financial discussions are analytical and clear." },
            3: { effect: "Skillful, communicative bond with siblings-in-law.", result: "Favorable", prediction: "Native uses wit and initiative to strengthen ties; siblings-in-law are articulate or business-minded." },
            4: { effect: "Intellectually stimulating home; analytical mother-in-law.", result: "Favorable", prediction: "Domestic life involves learning, discussion, or trade, creating a comfortable, communicative home environment." },
            5: { effect: "Clever, studious children; playful, witty romance.", result: "Highly Auspicious", prediction: "Progeny excel in learning or commerce; romance thrives on humor and genuine mental connection." },
            6: { effect: "Overthinking or nervous tension around marital disputes.", result: "Mixed", prediction: "Minor disagreements with in-laws are usually resolved through negotiation and clear, calm communication." },
            7: { effect: "Spouse is intelligent, versatile, possibly business-oriented.", result: "Favorable", prediction: "Partner brings analytical skill and adaptability to the relationship; intellectual rapport sustains the bond." },
            8: { effect: "Research-oriented depth; hidden matters need careful analysis.", result: "Mixed", prediction: "Spouse's family matters may involve subtle or hidden financial dealings requiring careful scrutiny." },
            9: { effect: "Wisdom through study, writing, or philosophical discussion.", result: "Auspicious", prediction: "Fortune flows through education, publishing, or advisory work; father or guru is intellectually inclined." },
            10: { effect: "Career gains through communication, trade, or analytical work.", result: "Highly Auspicious", prediction: "Professional success is aided by the spouse's business or communicative skill, with recognition through intellect." },
            11: { effect: "Gains through networking, trade, and communication skills.", result: "Favorable", prediction: "Financial and social desires are fulfilled through business ventures or a well-connected social circle." },
            12: { effect: "Overthinking prompts withdrawal; possible foreign trade ties.", result: "Mixed", prediction: "Native may retreat into study or introspection at times, with possible ties to foreign business or education." }
        },
        Jupiter: {
            1: { effect: "Wise, dharmic, optimistic approach to marriage.", result: "Highly Auspicious", prediction: "Native brings wisdom, generosity, and ethical grounding to the relationship — a naturally fortunate marital foundation." },
            2: { effect: "Growth of family wealth, values, and gracious speech.", result: "Highly Auspicious", prediction: "Spouse's family is prosperous or values-driven, often connected to teaching, law, or spirituality." },
            3: { effect: "Encouraging, principled bond with siblings-in-law.", result: "Favorable", prediction: "Native's relationship initiative is guided by principle; siblings-in-law act as wise, supportive counselors." },
            4: { effect: "Deep domestic contentment; benevolent mother-in-law.", result: "Highly Auspicious", prediction: "Home life is blessed with comfort and generosity, supported by strong maternal blessings." },
            5: { effect: "Wise, virtuous children; a dharmic, respectful romance.", result: "Highly Auspicious", prediction: "Progeny are intelligent and ethically grounded; romantic life is guided by mutual respect and shared values." },
            6: { effect: "Obstacles overcome through patience and ethical conduct.", result: "Favorable", prediction: "Disputes with in-laws are resolved through wisdom and generosity rather than confrontation." },
            7: { effect: "Guru-Yoga for marriage — spouse is wise, generous, dharmic.", result: "Highly Auspicious", prediction: "Partner is often learned, kind, and supportive — sometimes linked to teaching, law, or spiritual life — indicating a highly fortunate union." },
            8: { effect: "Spiritual depth brings protective transformation to marriage.", result: "Favorable", prediction: "Hidden matters concerning in-laws tend to resolve favorably; the union carries protective, karmic significance." },
            9: { effect: "Peak dharma placement — great fortune and higher learning.", result: "Highly Auspicious", prediction: "A powerful blessing of fortune, faith, and wisdom, with a strong bond to father, guru, or spiritual tradition." },
            10: { effect: "Career and status elevated through ethical, respected work.", result: "Highly Auspicious", prediction: "Professional life gains prestige through teaching, law, consultancy, or spiritual/religious association." },
            11: { effect: "Abundant gains and fulfillment of desires through generosity.", result: "Highly Auspicious", prediction: "Marriage and social circle bring prosperity; wishes are fulfilled through ethical, expansive effort." },
            12: { effect: "Spiritual liberation (moksha) themes; possible foreign/ashram tie.", result: "Favorable", prediction: "Native may be drawn toward charity, pilgrimage, or foreign spiritual pursuits alongside married life." }
        },
        Venus: {
            1: { effect: "Charming, refined, love-oriented approach to life and marriage.", result: "Highly Auspicious", prediction: "Native is naturally attractive to partnership; marital happiness and aesthetic sensibility define the personality." },
            2: { effect: "Refined taste and comfort enrich family wealth.", result: "Highly Auspicious", prediction: "Spouse's family is comfortable, cultured, or linked to arts, beauty, or luxury trade." },
            3: { effect: "Artistic, affectionate bond with siblings-in-law.", result: "Favorable", prediction: "Native's relationship initiative is graceful and charming; siblings-in-law are creative or sociable." },
            4: { effect: "Beautiful, harmonious, comfortable domestic life.", result: "Highly Auspicious", prediction: "Home is aesthetically pleasing and peaceful, with a strong affectionate bond with the mother-in-law." },
            5: { effect: "Creative, loving children; a deeply romantic connection.", result: "Highly Auspicious", prediction: "Progeny are artistic and affectionate; romance remains a central, joyful part of life." },
            6: { effect: "Minor friction from indulgence or comparison with in-laws.", result: "Mixed", prediction: "Small disputes may arise from differing tastes or expectations, generally resolved through diplomacy." },
            7: { effect: "Core marriage significator in its natural house — classic happy union.", result: "Highly Auspicious", prediction: "A textbook indicator of a happy, affectionate marriage with an attractive, cultured, or artistic partner." },
            8: { effect: "Deep intimacy and transformative emotional bonding.", result: "Favorable", prediction: "The relationship carries profound emotional and physical intimacy; shared resources with in-laws generally flow smoothly." },
            9: { effect: "Fortune arrives through beauty, arts, or gracious dharma.", result: "Highly Auspicious", prediction: "Fortune and higher learning connect to creative or luxury pursuits; father/guru figure is refined and supportive." },
            10: { effect: "Career success in arts, beauty, luxury, or diplomacy.", result: "Highly Auspicious", prediction: "Professional recognition comes through creative or relationship-oriented work; spouse supports public image." },
            11: { effect: "Gains through love, art, and social charm.", result: "Highly Auspicious", prediction: "Desires are fulfilled through pleasant social connections and a loving partnership, with comfortable financial gains." },
            12: { effect: "Deep intimacy or hidden relationships; possible foreign romance.", result: "Mixed", prediction: "Intimacy is heightened but privacy matters; a connection to a foreign partner or discreet matters may need careful handling." }
        },
        Saturn: {
            1: { effect: "Serious, responsible, reserved approach to marriage.", result: "Mixed", prediction: "Native approaches partnership with caution and duty; marital stability may take time to fully establish." },
            2: { effect: "Slow but steady growth of family wealth; disciplined speech.", result: "Mixed", prediction: "Family finances build gradually; spouse's family values discipline, thrift, or hard work." },
            3: { effect: "Persistent, hardworking bond with siblings-in-law.", result: "Favorable", prediction: "Native's initiative is patient and enduring; siblings-in-law are dutiful or reserved." },
            4: { effect: "Domestic duties are heavy, but stability grows over time.", result: "Mixed", prediction: "Home life demands patience, with a mature and sometimes reserved mother-in-law relationship." },
            5: { effect: "Fewer but responsible children; a slow-maturing romance.", result: "Challenging", prediction: "Romantic bonds develop gradually and require patience; any children tend toward seriousness and discipline." },
            6: { effect: "Long-standing but manageable friction with in-laws.", result: "Mixed", prediction: "Chronic minor tension with spouse's family is possible, but disciplined effort maintains peace over time." },
            7: { effect: "Mature or older spouse; delay before marital stability.", result: "Challenging", prediction: "Marriage may be delayed or the partner notably mature/reserved; the bond deepens into a durable, dutiful union over time." },
            8: { effect: "Karmic, long-term transformation through hardship.", result: "Difficult", prediction: "The relationship carries deep karmic lessons and possible prolonged hardship; patience yields eventual stability." },
            9: { effect: "Dharma built through discipline and hard-earned wisdom.", result: "Mixed", prediction: "Fortune arrives slowly through sustained ethical effort; father or guru figure is strict but ultimately guiding." },
            10: { effect: "Career built through sustained hard work and endurance.", result: "Favorable", prediction: "Professional status rises gradually through discipline, often achieving lasting success later in life." },
            11: { effect: "Gains arrive slowly but prove long-lasting.", result: "Favorable", prediction: "Desires are fulfilled through patient, sustained effort rather than sudden windfalls." },
            12: { effect: "Isolation or prolonged separation themes possible.", result: "Difficult", prediction: "Periods of loneliness or distance within married life are possible, though they can lead to spiritual maturity." }
        },
        Rahu: {
            1: { effect: "Unconventional, ambitious, restless approach to marriage.", result: "Mixed", prediction: "Native may be drawn to an unconventional or foreign-connected partnership; strong ambition shapes identity within marriage." },
            2: { effect: "Sudden, unconventional shifts in family wealth or values.", result: "Mixed", prediction: "Spouse's family background may be unusual or foreign-linked; speech is persuasive but occasionally exaggerated." },
            3: { effect: "Bold, unconventional initiative in relationships.", result: "Mixed", prediction: "Native pursues relationship goals through unconventional methods; siblings-in-law may be distant or foreign-based." },
            4: { effect: "Domestic life touched by foreign influence or relocation.", result: "Challenging", prediction: "Home environment may involve relocation or an atypical arrangement; the mother-in-law bond can feel ambiguous." },
            5: { effect: "Unconventional, intense romance; caution against illusion.", result: "Mixed", prediction: "Romantic attraction is intense and sometimes obsessive; clarity in communication helps avoid misunderstanding." },
            6: { effect: "Hidden or unconventional disputes with in-laws.", result: "Challenging", prediction: "Conflicts with spouse's family may involve deception or legal complexity requiring careful handling." },
            7: { effect: "Foreign or unconventional spouse; caution against illusion.", result: "Challenging", prediction: "The relationship may involve a foreign or unconventional partner; honesty and clarity are essential to sustain trust." },
            8: { effect: "Intense, transformative, karmically charged experiences.", result: "Difficult", prediction: "Sudden or unusual events affect the relationship; occult or hidden matters connected to in-laws may surface." },
            9: { effect: "Unconventional path to fortune or foreign dharma/guru link.", result: "Mixed", prediction: "Fortune may arrive through foreign lands, unconventional beliefs, or an atypical mentor figure." },
            10: { effect: "Ambitious, unconventional rise in status.", result: "Favorable", prediction: "Career success can arrive suddenly or through non-traditional, foreign, or technology-linked paths." },
            11: { effect: "Large, sudden gains through unconventional or foreign sources.", result: "Favorable", prediction: "Material desires are fulfilled through unusual, foreign, or technology-driven avenues connected to the marriage." },
            12: { effect: "Deep spiritual or foreign entanglement; possible illusion.", result: "Challenging", prediction: "Native may face confusion, foreign residence, or subconscious patterns needing spiritual clarity to resolve." }
        },
        Ketu: {
            1: { effect: "Detached, introspective, spiritually inclined marital outlook.", result: "Mixed", prediction: "Native may feel a degree of detachment even within close relationships; spiritual undertones color the marital path." },
            2: { effect: "Indifference to material family wealth; reserved speech.", result: "Mixed", prediction: "Spouse's family values may lean toward simplicity or spirituality rather than material accumulation." },
            3: { effect: "Reserved, karmic bond with siblings-in-law.", result: "Mixed", prediction: "Native's relationship initiative is understated, with a karmic familiarity toward siblings-in-law." },
            4: { effect: "Domestic detachment or an unconventional home arrangement.", result: "Mixed", prediction: "Home life may feel emotionally distant at times, with a spiritually inclined or reserved mother-in-law." },
            5: { effect: "Spiritually gifted but detached children; karmic romance.", result: "Mixed", prediction: "Romance may feel fated or karmic, sometimes accompanied by emotional detachment or delayed commitment." },
            6: { effect: "In-law obstacles dissolve through non-attachment.", result: "Favorable", prediction: "Disputes with spouse's family tend to resolve on their own as native maintains emotional distance from conflict." },
            7: { effect: "Elusive, karmically destined spouse; conscious effort needed for closeness.", result: "Challenging", prediction: "The relationship carries a strong karmic, sometimes otherworldly quality; emotional distance must be consciously bridged." },
            8: { effect: "Occult, transformative, deeply karmic marital undercurrents.", result: "Difficult", prediction: "Hidden or mystical themes touch the relationship; sudden karmic events involving in-laws are possible." },
            9: { effect: "Detached but genuine dharma; spiritual guru connection.", result: "Favorable", prediction: "Fortune arrives through spiritual practice, renunciation, or a mystic mentor rather than conventional means." },
            10: { effect: "Career touched by spirituality, research, or withdrawal from ambition.", result: "Mixed", prediction: "Professional life may include periods of withdrawal or a shift toward spiritual, research, or healing-oriented work." },
            11: { effect: "Detached gains; fulfillment through inner rather than material means.", result: "Mixed", prediction: "Desires are satisfied more through inner contentment than external gain; the social circle may be small but meaningful." },
            12: { effect: "Strong moksha (liberation) potential in its natural house.", result: "Highly Auspicious", prediction: "A powerful placement for spiritual liberation and inner peace, though it may coincide with periods of separation from the spouse." }
        }
    };

    // ─────────────────────────────────────────────────────────────────
    //  3. DIGNITY TABLES (for yoga detection)
    // ─────────────────────────────────────────────────────────────────
    const EXALTATION_SIGN = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
    const DEBILITATION_SIGN = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
    const NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const NATURAL_MALEFICS = ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun'];

    // ─────────────────────────────────────────────────────────────────
    //  4. HELPER: build a unified D1/D9 context for a chart
    // ─────────────────────────────────────────────────────────────────
    function getLon(obj) {
        if (!obj) return null;
        return obj.longitude !== undefined ? obj.longitude : obj.sid;
    }

    function buildD9Context(planets, ascendant) {
        const ascLon = getLon(ascendant);
        const d1AscSign = Math.floor(ascLon / 30);
        const d9AscSign = typeof getVargaData === 'function' ? getVargaData(ascLon, 9).sign : Math.floor(((ascLon * 9) % 360) / 30);

        const ctx = { d1AscSign, d9AscSign, planets: {} };

        const list = (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.PLANETS) || ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        list.forEach(function (p) {
            if (!planets[p]) return;
            const lon = getLon(planets[p]);
            const d1Sign = Math.floor(lon / 30);
            const d9Sign = typeof getVargaData === 'function' ? getVargaData(lon, 9).sign : Math.floor(((lon * 9) % 360) / 30);
            const d9House = ((d9Sign - d9AscSign + 12) % 12) + 1;
            ctx.planets[p] = {
                lon: lon,
                d1Sign: d1Sign,
                d9Sign: d9Sign,
                d9House: d9House,
                vargottama: d1Sign === d9Sign
            };
        });
        return ctx;
    }

    // ─────────────────────────────────────────────────────────────────
    //  5. YOGA / COMBINATION RULES
    // ─────────────────────────────────────────────────────────────────
    const YOGA_RULES = [
        {
            id: 'vargottama_lagna',
            name: 'Vargottama Lagna',
            reference: 'BPHS, Navamsha chapter',
            detect: function (ctx) { return ctx.d1AscSign === ctx.d9AscSign; },
            effect: 'The Ascendant sign is identical in Rasi (D1) and Navamsha (D9).',
            result: 'Highly Auspicious',
            prediction: 'A very strong soul-level indicator — the native\'s core personality, dharma, and marital foundation carry unusual permanence and strength through life.'
        },
        {
            id: 'vargottama_planets',
            name: 'Vargottama Planet(s)',
            reference: 'BPHS, Navamsha chapter',
            detect: function (ctx) {
                return Object.keys(ctx.planets).filter(function (p) { return ctx.planets[p].vargottama; });
            },
            effect: 'One or more planets occupy the same sign in both D1 and D9.',
            result: 'Highly Auspicious',
            prediction: 'Each vargottama planet gives unusually stable, matured, and reliable results for its significations across both worldly life and marriage/dharma.'
        },
        {
            id: 'multi_vargottama',
            name: 'Multiple Vargottama (Dhridha) Concentration',
            reference: 'Classical principle — strength through repetition',
            detect: function (ctx) {
                const n = Object.keys(ctx.planets).filter(function (p) { return ctx.planets[p].vargottama; }).length;
                return n >= 3;
            },
            effect: 'Three or more planets are vargottama simultaneously.',
            result: 'Highly Auspicious',
            prediction: 'Indicates an unusually firm (dhridha) chart where the promises of the birth chart are reliably fulfilled, including matters of marriage and dharma.'
        },
        {
            id: 'guru_shukra_yoga',
            name: 'Guru-Shukra Yoga (Jupiter-Venus Bond in D9)',
            reference: 'Classical Navamsha marital-harmony principle',
            detect: function (ctx) {
                if (!ctx.planets.Jupiter || !ctx.planets.Venus) return false;
                const diff = Math.abs(ctx.planets.Jupiter.d9House - ctx.planets.Venus.d9House);
                return ctx.planets.Jupiter.d9House === ctx.planets.Venus.d9House || diff === 6;
            },
            effect: 'Jupiter and Venus are conjunct or in mutual opposition (7th) in the Navamsha.',
            result: 'Highly Auspicious',
            prediction: 'A classic combination for a harmonious, values-aligned, and affectionate marriage; wisdom and love reinforce each other in the partnership.'
        },
        {
            id: 'benefics_in_d9_7th',
            name: 'Benefics in 7th house from Navamsha Lagna',
            reference: 'Classical Navamsha marriage-house principle',
            detect: function (ctx) {
                return Object.keys(ctx.planets).some(function (p) {
                    return NATURAL_BENEFICS.indexOf(p) !== -1 && ctx.planets[p].d9House === 7;
                });
            },
            effect: 'One or more natural benefics (Jupiter, Venus, Mercury, Moon) occupy the 7th house counted from the Navamsha Lagna.',
            result: 'Highly Auspicious',
            prediction: 'Strongly favors a happy, cooperative, and affectionate marriage with a supportive, well-disposed spouse.'
        },
        {
            id: 'malefics_in_d9_7th',
            name: 'Malefics in 7th house from Navamsha Lagna',
            reference: 'Classical Navamsha marriage-house caution',
            detect: function (ctx) {
                return Object.keys(ctx.planets).some(function (p) {
                    return NATURAL_MALEFICS.indexOf(p) !== -1 && ctx.planets[p].d9House === 7;
                });
            },
            effect: 'One or more natural malefics (Sun, Mars, Saturn, Rahu, Ketu) occupy the 7th house counted from the Navamsha Lagna.',
            result: 'Challenging',
            prediction: 'Suggests friction, delay, or an unconventional/demanding dynamic in marriage; patience, maturity, and conscious effort help the relationship stabilize.'
        },
        {
            id: 'd9_lagna_lord_kendra_trikona',
            name: 'Navamsha Lagna Lord in Kendra/Trikona (from D9 Lagna)',
            reference: 'Classical Raja-Yoga-like principle applied to Navamsha',
            detect: function (ctx) {
                const lordName = window.ASTRO_CONSTANTS.SIGN_LORDS[ctx.d9AscSign];
                if (!ctx.planets[lordName]) return false;
                const h = ctx.planets[lordName].d9House;
                return [1, 4, 5, 7, 9, 10].indexOf(h) !== -1;
            },
            effect: 'The lord of the Navamsha Lagna occupies a Kendra (1/4/7/10) or Trikona (1/5/9) from the Navamsha Lagna itself.',
            result: 'Highly Auspicious',
            prediction: 'Strengthens the native\'s overall dharma, marital stability, and capacity to fulfil the soul\'s deeper purpose in this lifetime.'
        },
        {
            id: 'neecha_bhanga_navamsha',
            name: 'Neecha Bhanga via Navamsha (Debilitation Cancellation)',
            reference: 'BPHS, Neecha Bhanga principle',
            detect: function (ctx) {
                return Object.keys(ctx.planets).filter(function (p) {
                    if (DEBILITATION_SIGN[p] === undefined) return false;
                    const pd = ctx.planets[p];
                    const isDebilInD1 = pd.d1Sign === DEBILITATION_SIGN[p];
                    const isStrongInD9 = pd.d9Sign === EXALTATION_SIGN[p] || window.ASTRO_CONSTANTS.SIGN_LORDS[pd.d9Sign] === p;
                    return isDebilInD1 && isStrongInD9;
                });
            },
            effect: 'A planet debilitated in Rasi (D1) is exalted or in its own sign in the Navamsha (D9).',
            result: 'Highly Auspicious',
            prediction: 'Cancels or substantially mitigates the debilitation — the planet ultimately delivers strong, redeeming results, often after early-life struggle.'
        },
        {
            id: 'exaltation_weakened_navamsha',
            name: 'Exaltation Weakened in Navamsha',
            reference: 'Classical caution — Varga confirmation principle',
            detect: function (ctx) {
                return Object.keys(ctx.planets).filter(function (p) {
                    if (EXALTATION_SIGN[p] === undefined) return false;
                    const pd = ctx.planets[p];
                    return pd.d1Sign === EXALTATION_SIGN[p] && pd.d9Sign === DEBILITATION_SIGN[p];
                });
            },
            effect: 'A planet exalted in Rasi (D1) falls into debilitation in the Navamsha (D9).',
            result: 'Challenging',
            prediction: 'The apparent strength of the exaltation is not fully confirmed — results connected to this planet may look promising outwardly but require more effort to sustain, especially in marriage/dharma matters.'
        },
        {
            id: 'ninth_lord_d9_strong',
            name: 'Ninth Lord (from D9 Lagna) Well Placed',
            reference: 'Classical dharma-house strengthening principle',
            detect: function (ctx) {
                const ninthSign = (ctx.d9AscSign + 8) % 12;
                const lordName = window.ASTRO_CONSTANTS.SIGN_LORDS[ninthSign];
                if (!ctx.planets[lordName]) return false;
                return [1, 4, 5, 7, 9, 10].indexOf(ctx.planets[lordName].d9House) !== -1;
            },
            effect: 'The lord of the 9th house from the Navamsha Lagna occupies a Kendra or Trikona from the Navamsha Lagna.',
            result: 'Highly Auspicious',
            prediction: 'Amplifies fortune, ethical conduct, higher learning, and blessings from father/guru figures throughout life.'
        }
    ];

    function detectD9Yogas(planets, ascendant) {
        const ctx = buildD9Context(planets, ascendant);
        const results = [];

        YOGA_RULES.forEach(function (rule) {
            let outcome;
            try { outcome = rule.detect(ctx); } catch (e) { outcome = false; }
            const detected = Array.isArray(outcome) ? outcome.length > 0 : !!outcome;
            results.push({
                id: rule.id,
                name: rule.name,
                reference: rule.reference,
                detected: detected,
                involves: Array.isArray(outcome) ? outcome : (detected ? [] : []),
                effect: rule.effect,
                result: rule.result,
                prediction: rule.prediction
            });
        });

        return { context: ctx, yogas: results, detected: results.filter(function (y) { return y.detected; }) };
    }

    // ─────────────────────────────────────────────────────────────────
    //  6. MARRIAGE & DHARMA ANALYSIS (D9's core signification)
    // ─────────────────────────────────────────────────────────────────
    function analyzeMarriageAndDharma(planets, ascendant) {
        const ctx = buildD9Context(planets, ascendant);
        const SIGNS = window.ASTRO_CONSTANTS.SIGNS;
        const SIGN_LORDS = window.ASTRO_CONSTANTS.SIGN_LORDS;

        // 7th house from Navamsha Lagna (spouse & marriage)
        const seventhSign = (ctx.d9AscSign + 6) % 12;
        const seventhLordName = SIGN_LORDS[seventhSign];
        const seventhLordPlacement = ctx.planets[seventhLordName] || null;

        // 9th house from Navamsha Lagna (dharma & fortune)
        const ninthSign = (ctx.d9AscSign + 8) % 12;
        const ninthLordName = SIGN_LORDS[ninthSign];
        const ninthLordPlacement = ctx.planets[ninthLordName] || null;

        // Venus — universal marriage significator
        const venus = ctx.planets.Venus || null;
        // Jupiter — dharma / husband-significator (contextually relevant for female charts)
        const jupiter = ctx.planets.Jupiter || null;

        // Darakaraka (DK) — the planet with the LEAST degrees within its sign among the 7 classical grahas
        let dkName = null, minDeg = 361;
        ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach(function (p) {
            if (!planets[p]) return;
            const lon = getLon(planets[p]);
            const deg = lon % 30;
            if (deg < minDeg) { minDeg = deg; dkName = p; }
        });
        const darakaraka = dkName ? { name: dkName, d9House: ctx.planets[dkName] ? ctx.planets[dkName].d9House : null, d9Sign: ctx.planets[dkName] ? SIGNS[ctx.planets[dkName].d9Sign] : null } : null;

        const notes = [];

        notes.push('The 7th house from the Navamsha Lagna falls in ' + SIGNS[seventhSign] + ', ruled by ' + seventhLordName + ' — the primary indicator of the spouse\'s nature and the quality of the marital bond.');

        if (seventhLordPlacement) {
            const kendraTrikona = [1, 4, 5, 7, 9, 10].indexOf(seventhLordPlacement.d9House) !== -1;
            notes.push(seventhLordName + ' (7th lord from D9 Lagna) is placed in house ' + seventhLordPlacement.d9House + ' of the Navamsha' + (kendraTrikona ? ', a Kendra/Trikona — favorable for marital strength and stability.' : ' — its house signification blends with marital matters, moderating the overall outcome.'));
        }

        if (venus) {
            const venusExalted = venus.d9Sign === EXALTATION_SIGN.Venus;
            const venusDebil = venus.d9Sign === DEBILITATION_SIGN.Venus;
            const venusOwn = SIGN_LORDS[venus.d9Sign] === 'Venus';
            notes.push('Venus, the universal significator of love and marriage, occupies house ' + venus.d9House + ' of the Navamsha in ' + SIGNS[venus.d9Sign] + (venusExalted ? ' (exalted — highly auspicious for marital happiness).' : venusDebil ? ' (debilitated — extra care and patience needed in relationship matters).' : venusOwn ? ' (own sign — strong and self-assured in matters of love).' : '.'));
        }

        if (jupiter) {
            notes.push('Jupiter, significator of dharma and wisdom (and of the husband in a female chart), is placed in house ' + jupiter.d9House + ' of the Navamsha in ' + SIGNS[jupiter.d9Sign] + ', shaping the ethical and philosophical tenor of the partnership.');
        }

        notes.push('The 9th house from the Navamsha Lagna (dharma, fortune, higher wisdom) falls in ' + SIGNS[ninthSign] + ', ruled by ' + ninthLordName + (ninthLordPlacement ? ', placed in house ' + ninthLordPlacement.d9House + ' of the Navamsha.' : '.'));

        if (darakaraka) {
            notes.push('The Darakaraka (spouse-indicating Jaimini Karaka) is ' + darakaraka.name + ', placed in house ' + darakaraka.d9House + ' of the Navamsha (' + darakaraka.d9Sign + ') — describing the qualities and life-context of the spouse.');
        }

        return {
            context: ctx,
            seventhFromD9: { sign: SIGNS[seventhSign], lord: seventhLordName, lordPlacement: seventhLordPlacement },
            ninthFromD9: { sign: SIGNS[ninthSign], lord: ninthLordName, lordPlacement: ninthLordPlacement },
            venus: venus,
            jupiter: jupiter,
            darakaraka: darakaraka,
            narrative: notes
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  7. PLANET-IN-HOUSE LOOKUP + FULL CHART REPORT BUILDER
    // ─────────────────────────────────────────────────────────────────
    function getPlanetHouseEffect(planetName, house) {
        const table = PLANET_IN_HOUSE_D9[planetName];
        if (!table || !table[house]) return null;
        return Object.assign({ house: house, houseSignification: D9_HOUSE_SIGNIFICATIONS[house] }, table[house]);
    }

    function generatePlanetHouseReport(planets, ascendant) {
        const ctx = buildD9Context(planets, ascendant);
        const report = [];
        Object.keys(ctx.planets).forEach(function (p) {
            const house = ctx.planets[p].d9House;
            const eff = getPlanetHouseEffect(p, house);
            if (eff) {
                report.push(Object.assign({ planet: p, vargottama: ctx.planets[p].vargottama, sign: window.ASTRO_CONSTANTS.SIGNS[ctx.planets[p].d9Sign] }, eff));
            }
        });
        return report;
    }

    /**
     * Master entry point — comprehensive Navamsha (D9) report combining:
     *  - Jaimini Karakas / Arudha / Khar / Vish (existing `calculate`)
     *  - Planet-in-house D9 effect/result/prediction
     *  - D9 Yoga/combination detection
     *  - Marriage & Dharma analysis
     */
    function generateComprehensiveD9Report(planets, ascendant) {
        const base = window.NAVAMSHA_ANALYSIS.calculate(planets, ascendant);
        const houseReport = generatePlanetHouseReport(planets, ascendant);
        const yogaReport = detectD9Yogas(planets, ascendant);
        const marriageDharma = analyzeMarriageAndDharma(planets, ascendant);

        return {
            base: base,
            planetHouseEffects: houseReport,
            yogas: yogaReport.detected,
            allYogaChecks: yogaReport.yogas,
            marriageAndDharma: marriageDharma,
            references: [
                'Maharishi Parashara — Brihat Parashara Hora Shastra (Navamsha chapter)',
                'Mantreswara — Phaladeepika (Varga phala chapter)',
                'C.S. Patel — Navamsa in Astrology (Navamsha bhava-phala framework)',
                'Jaimini Sutras — Karakamsa & Arudha principles'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  8. ATTACH TO EXISTING NAMESPACE (non-destructive extension)
    // ─────────────────────────────────────────────────────────────────
    Object.assign(window.NAVAMSHA_ANALYSIS, {
        D9_HOUSE_SIGNIFICATIONS: D9_HOUSE_SIGNIFICATIONS,
        PLANET_IN_HOUSE_D9: PLANET_IN_HOUSE_D9,
        YOGA_RULES: YOGA_RULES,
        buildD9Context: buildD9Context,
        detectD9Yogas: detectD9Yogas,
        analyzeMarriageAndDharma: analyzeMarriageAndDharma,
        getPlanetHouseEffect: getPlanetHouseEffect,
        generatePlanetHouseReport: generatePlanetHouseReport,
        generateComprehensiveD9Report: generateComprehensiveD9Report
    });

})();