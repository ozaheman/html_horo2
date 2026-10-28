/**
 * VARGA TEXT ANALYSIS — Jaimini Varga Chart Method, Procedure & Result Analysis
 * ============================================================================
 * Implements the hooks expected by jemini_prediction.js (lines 510–593):
 *   • generateJaiminiVargaAnalysis(planets, { lagnaSign, karakas, scheme })
 *   • toHTML(vargaAnalysis)
 *
 * Teaching basis: Jaimini first-look method from the video lecture series:
 *   1. Check AK in every varga — it shows your position there.
 *   2. Check the varga-specific karaka (AmK for D10, DK for D9, BK for D3, etc.)
 *   3. GK + Rahu/Ketu on a karaka → obstruction; AK/AmK/PK/DK links → Raja Yoga.
 *   4. Note planet dignity (exalted/own/debilitated) for strength modifier.
 *
 * Load order: jemini_prediction.js → varga_text_analysis.js
 */

(function (global) {
    'use strict';

    // ─── borrowing helpers from the already-loaded Jaimini module ────────────
    const J = () => global.JEMINI_PREDICTION;

    function norm(v) { return ((v % 360) + 360) % 360; }
    function houseFrom(from, to) { return ((to - from + 12) % 12) + 1; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

    const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const EXALT = {Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6};
    const DEBIL = {Sun:6,Moon:7,Mars:3,Mercury:11,Jupiter:9,Venus:5,Saturn:0};
    const OWN   = {Sun:[4],Moon:[3],Mars:[0,7],Mercury:[2,5],Jupiter:[8,11],Venus:[1,6],Saturn:[9,10]};

    function signIdx(sign) {
        if (typeof sign === 'number') return ((Math.floor(sign) % 12) + 12) % 12;
        const i = SIGNS.findIndex(s => s.toLowerCase() === String(sign).trim().toLowerCase());
        return i >= 0 ? i : 0;
    }

    function vargaSignIdx(longitude, n) {
        const j = J();
        if (j && j.vargaSignIndex) return j.vargaSignIndex(norm(longitude), n);
        // fallback integer split
        const s = Math.floor(norm(longitude) / 30) % 12;
        const d = norm(longitude) - s * 30;
        const part = Math.min(Math.floor(d / (30 / n)), n - 1);
        return (s * n + part) % 12;
    }

    function dignity(planet, sIdx) {
        if (EXALT[planet] === sIdx) return 'Exalted';
        if (DEBIL[planet]  === sIdx) return 'Debilitated';
        if (OWN[planet]  && OWN[planet].includes(sIdx)) return 'Own Sign';
        return 'Neutral';
    }

    /** Returns true if sign a aspects sign b under Jaimini rashi drishti rules. */
    function rashiAspects(a, b) {
        const j = J();
        if (j && j.signAspects) return j.signAspects(a, b);
        const ta = a % 3, tb = b % 3;
        if (ta === 0 && tb === 1 && b !== (a + 1) % 12) return true;
        if (ta === 1 && tb === 0 && b !== (a + 11) % 12) return true;
        if (ta === 2 && tb === 2 && a !== b) return true;
        return false;
    }

    /** planets for a given varga — map name → {sign, signIndex, dignity} */
    function vargaPlanets(rawPlanets, divisor) {
        const out = {};
        Object.keys(rawPlanets).forEach(name => {
            const p = rawPlanets[name];
            const lon = typeof p.longitude === 'number' ? p.longitude : (p.sid != null ? p.sid : null);
            if (lon === null) return;
            const si = vargaSignIdx(lon, divisor);
            out[name] = { signIndex: si, sign: SIGNS[si], dignity: dignity(name, si) };
        });
        return out;
    }

    /** Who influences (conjoins or aspects) `targetPlanetName` in the given varga? */
    function influencers(vp, targetPlanetName, karakas) {
        const target = vp[targetPlanetName];
        if (!target) return { afflict: [], support: [], yoga: [] };
        const ti = target.signIndex;

        const afflict = [], support = [], yoga = [];
        const gkName   = karakas.GK  && karakas.GK.name;
        const akName   = karakas.AK  && karakas.AK.name;
        const amkName  = karakas.AmK && karakas.AmK.name;
        const pkName   = karakas.PK  && karakas.PK.name;
        const dkName   = karakas.DK  && karakas.DK.name;
        const bkName   = karakas.BK  && karakas.BK.name;
        const mkName   = karakas.MK  && karakas.MK.name;

        Object.keys(vp).forEach(name => {
            if (name === targetPlanetName) return;
            const si = vp[name].signIndex;
            const linked = (si === ti) || rashiAspects(si, ti);
            if (!linked) return;
            const how = (si === ti) ? 'conjunction' : 'rashi drishti';

            if (name === gkName)          afflict.push({ name, label:'GK', how });
            else if (name === 'Rahu')     afflict.push({ name, label:'Rahu', how });
            else if (name === 'Ketu')     afflict.push({ name, label:'Ketu (spiritual pull)', how });
            else if ([akName,amkName,pkName,dkName,bkName,mkName].includes(name)) {
                const lbl = (name===akName?'AK' : name===amkName?'AmK' : name===pkName?'PK'
                            : name===dkName?'DK' : name===bkName?'BK' : 'MK');
                support.push({ name, label:lbl, how });
                if (['AK','AmK','PK','DK'].includes(lbl)) yoga.push(lbl);
            }
        });
        return { afflict, support, yoga };
    }

    // ─── VARGA CHART DEFINITIONS ─────────────────────────────────────────────
    const VARGA_DEFS = [
        {
            divisor: 1,
            name: 'D1 — Rashi (Birth Chart)',
            topic: 'Overall Life, Body & Personality',
            primaryKaraka: 'AK',
            secondaryKarakas: ['AmK','BK','MK','PK','GK','DK'],
            vargaKaraka: 'ALL', // all karakas are read through D1
            method: [
                'D1 is the foundation: read AK (Atmakaraka = lagnesh analog) for the self, body and life direction.',
                'AmK shows career & advisors; BK shows siblings/mentors; MK shows mother & home; PK shows intelligence & children; DK shows spouse & partners.',
                'GK (Gnatikaraka) on any karaka → obstacles/conflict in that area. Rahu → worldly pull; Ketu → detachment.',
            ],
            procedure: [
                '1. Locate AK in D1: note its sign, house from lagna, and dignity.',
                '2. Check who aspects or conjoins AK: Raja Yoga if AmK/PK/DK link; affliction if GK/Rahu/Ketu.',
                '3. Locate AmK: repeat — dignity, aspects. Forms "Mahashakti Yoga" if with Rahu in a kendra.',
                '4. Check GK: note every karaka it aspects — those life areas face struggle.',
                '5. Note argala (2H, 4H, 5H, 11H planets) contributing to lagna strength.',
            ],
        },
        {
            divisor: 3,
            name: 'D3 — Drekkana (Siblings & Courage)',
            topic: 'Siblings, Courage & Relatives',
            primaryKaraka: 'AK',
            secondaryKarakas: ['BK'],
            vargaKaraka: 'BK', // BK = Bhratrikaraka
            method: [
                'D3 is the chart for siblings (bhratri), and by extension all extended family, courage, and communication.',
                'AK shows the native\'s own position; BK (Bhratrikaraka) is the dedicated karaka for siblings and mentors.',
                'Father is seen from D1 (not D3); sisters/brothers from D3 with BK.',
            ],
            procedure: [
                '1. Locate AK in D3: if GK afflicts → personal difficulties with relatives.',
                '2. Locate BK (primary karaka for siblings): note its sign and dignity.',
                '3. Check who aspects BK in D3: GK/Rahu/Ketu → suffering or loss of sibling; AK/AmK/PK/DK → they benefit/support you.',
                '4. If BK is exalted or in own sign without GK → strong sibling relations.',
                '5. Consider DK in D3: for partnerships and co-travelers in life.',
            ],
        },
        {
            divisor: 4,
            name: 'D4 — Chaturthamsa (Home & Property)',
            topic: 'Property, Home, Vehicles & Comforts',
            primaryKaraka: 'AK',
            secondaryKarakas: ['MK','PK'],
            vargaKaraka: 'MK', // MK = Matrikaraka
            method: [
                'D4 reveals matters of the 4th bhava: home, property, mother, vehicles, and emotional security.',
                'MK (Matrikaraka) is the dedicated karaka for home/property and mother in D4.',
                'PK (Putrakaraka) in D4 shows intelligence (5th is 2nd from 4th = wealth of home).',
            ],
            procedure: [
                '1. Locate AK in D4: shows the native\'s comfort level and lifestyle.',
                '2. Locate MK (primary D4 karaka): its dignity and influencers determine home life quality.',
                '3. GK or Rahu afflicting MK → difficulties with home/property/mother.',
                '4. Locate PK in D4 to assess intelligence applied to property/domestic affairs.',
                '5. Check DK in D4 for spouse\'s role in home matters.',
            ],
        },
        {
            divisor: 7,
            name: 'D7 — Saptamsa (Children & Creativity)',
            topic: 'Children, Creativity & Intellectual Capacity',
            primaryKaraka: 'AK',
            secondaryKarakas: ['PK','DK'],
            vargaKaraka: 'PK', // PK = Putrakaraka
            method: [
                'D7 reveals the 5th bhava (children, creativity, intellect, past-life merit, and career change).',
                'PK (Putrakaraka) is the primary karaka — it shows children AND intelligence.',
                'DK in D7 shows if a partner or spouse is involved with children/creativity matters.',
            ],
            procedure: [
                '1. Locate AK in D7: shows native\'s involvement with children and creativity.',
                '2. Locate PK (Putrakaraka) and note its sign, dignity, and aspects.',
                '3. GK/Rahu on PK → obstacles to having children or delays; disrupted intellect.',
                '4. AK + PK together → strong intelligence; career change through merit (5th is 8th from 10th).',
                '5. DK aspecting PK → spouse connected to children outcomes.',
            ],
        },
        {
            divisor: 9,
            name: 'D9 — Navamsa (Spouse & Dharma)',
            topic: 'Marriage, Partnerships, Dharma & Soul Refinement',
            primaryKaraka: 'AK',
            secondaryKarakas: ['DK'],
            vargaKaraka: 'DK', // DK = Darakaraka
            method: [
                'D9 shows the quality of marriage, partnerships, and dharmic orientation.',
                'DK (Darakaraka) is the dedicated karaka for spouse and partnerships.',
                'AK in D9 reveals how the soul manifests in partnerships; Karakamsa is the AK\'s sign in D9.',
            ],
            procedure: [
                '1. Locate AK in D9: note conjunction/aspects — Rahu → materially driven marriage; Ketu → spiritual bond.',
                '2. Locate DK in D9: its dignified position → strong marriage; GK affliction → marital friction.',
                '3. AK + AmK in D9 → Raja Yoga for status through marriage.',
                '4. Note which planets are in the AK\'s navamsa sign (Karakamsa): they color life purpose deeply.',
                '5. DK conjunct GK or Rahu/Ketu → multiple relationships or troubled marriage.',
            ],
        },
        {
            divisor: 10,
            name: 'D10 — Dasamsa (Career & Profession)',
            topic: 'Career, Public Recognition & Profession',
            primaryKaraka: 'AmK',
            secondaryKarakas: ['AK','DK'],
            vargaKaraka: 'AmK', // AmK = Amatyakaraka (the "Prime Minister")
            method: [
                'D10 is the career chart. AmK (Amatyakaraka) is the main indicator — it is the Prime Minister of the chart.',
                'AK shows the native\'s self-expression in career. DK shows business partners.',
                'Planets that are exalted or in own sign in D10 grant exceptional position and authority.',
            ],
            procedure: [
                '1. Locate AmK in D10: note sign, house, dignity.',
                '2. Check who aspects AmK: AK + AmK → Raja Yoga for career peak; GK/Rahu/Ketu → obstacles in profession.',
                '3. Locate AK in D10: if debilitated → struggles with self-projection in career.',
                '4. Rahu with AmK → material success, mass-scale work; Ketu → secretive or spiritual profession.',
                '5. DK in D10 → business partnerships drive career; GK on AmK → legal disputes or professional conflict.',
            ],
        },
        {
            divisor: 12,
            name: 'D12 — Dwadasamsa (Parents)',
            topic: 'Parents, Grandparents & Hereditary Karma',
            primaryKaraka: 'AK',
            secondaryKarakas: ['BK','MK'],
            vargaKaraka: 'BK_MK', // BK for father, MK for mother
            method: [
                'D12 shows parental themes, hereditary patterns, and ancestry.',
                'BK (Bhratrikaraka) covers the father in D1; in D12 it also covers the paternal line.',
                'MK (Matrikaraka) shows the mother and maternal influences.',
            ],
            procedure: [
                '1. Locate BK in D12: note dignity and influencers for paternal line analysis.',
                '2. Locate MK in D12: note dignity and influencers for maternal line analysis.',
                '3. GK or Rahu on BK → father\'s early death, struggles, or difficult relationship.',
                '4. GK or Rahu on MK → mother\'s health/longevity issues or troubled relationship.',
                '5. Locate AK in D12: shows how the self relates to ancestral karma.',
            ],
        },
        {
            divisor: 24,
            name: 'D24 — Chaturvimshamsa (Education & Learning)',
            topic: 'Education, Knowledge Acquisition & Skill',
            primaryKaraka: 'AK',
            secondaryKarakas: ['PK','MK'],
            vargaKaraka: 'PK', // PK for intelligence/education
            method: [
                'D24 reveals learning capacity, educational achievements, and specialised skills.',
                'PK (Putrakaraka): as indicator of intellect, PK in D24 reveals quality of study.',
                'MK (Matrikaraka): mother\'s guidance and foundational learning.',
            ],
            procedure: [
                '1. Locate AK in D24: note sign, and who aspects — Rahu/GK → disrupted education; AK clean → self-directed learning.',
                '2. Locate PK (main karaka): its dignity and aspects show sharpness of intellect.',
                '3. GK or Rahu on PK in D24 → academic struggles, unconventional education.',
                '4. MK (mother/guidance karaka) dignified in D24 → strong foundational guidance.',
                '5. PK exalted or in own sign → distinguished scholar, advanced degrees, creative mastery.',
            ],
        },
    ];

    // ─── JAIMINI YOGA DEFINITIONS ─────────────────────────────────────────────
    /**
     * Each yoga has:
     *   name, category, detect(vp, karakas, divisor) → true/false,
     *   describe(vp, karakas) → string
     */
    const JAIMINI_YOGAS = [
        {
            name: 'Jaimini Raja Yoga',
            category: 'Status & Power',
            desc: 'AK & AmK are linked by conjunction or mutual rashi drishti — highest mark of achievement, recognition, and authority.',
            detect: (vp, k) => linked(vp, k.AK, k.AmK),
        },
        {
            name: 'Raja Yoga (AK–PK)',
            category: 'Status & Intelligence',
            desc: 'AK & PK linked — indicates brilliance, executive authority, and recognition through intellect or children.',
            detect: (vp, k) => linked(vp, k.AK, k.PK),
        },
        {
            name: 'Raja Yoga (AK–DK)',
            category: 'Status through Partnership',
            desc: 'AK & DK linked — the spouse or a key partner becomes a gateway to fame, status, and social elevation.',
            detect: (vp, k) => linked(vp, k.AK, k.DK),
        },
        {
            name: 'Raja Yoga (AmK–PK)',
            category: 'Career & Intellect',
            desc: 'AmK & PK linked — career driven by intellect; excels in advisory, analytical, or creative leadership roles.',
            detect: (vp, k) => linked(vp, k.AmK, k.PK),
        },
        {
            name: 'Raja Yoga (AmK–DK)',
            category: 'Career through Partnership',
            desc: 'AmK & DK linked — wealth and career elevation directly through marriage, business partnerships, or public ventures.',
            detect: (vp, k) => linked(vp, k.AmK, k.DK),
        },
        {
            name: 'Mahashakti Yoga',
            category: 'Power & Material Success',
            desc: 'AmK is in conjunction with Rahu (especially in a kendra) — extraordinary material power, mass influence, and worldly ambition.',
            detect: (vp, k) => {
                if (!k.AmK || !vp[k.AmK.name] || !vp['Rahu']) return false;
                return vp[k.AmK.name].signIndex === vp['Rahu'].signIndex;
            },
        },
        {
            name: 'Gnati Yoga (Obstruction)',
            category: 'Obstacle & Struggle',
            desc: 'GK conjoins or aspects AK — continuous friction, health challenges, and obstruction to the soul\'s core expression. Can trigger intense spiritual evolution.',
            detect: (vp, k) => linked(vp, k.AK, k.GK),
        },
        {
            name: 'Viparita Raja Yoga (Jaimini)',
            category: 'Success through Adversity',
            desc: 'GK links with AmK — peak career achievement comes after severe struggle, litigation, or crises; a phoenix trajectory.',
            detect: (vp, k) => linked(vp, k.AmK, k.GK),
        },
        {
            name: 'Putra Yoga',
            category: 'Children & Creative Merits',
            desc: 'PK is free of GK/Rahu/Ketu influence and links with BK or AK — promotes progeny, intellectual flourishing, and creative mastery.',
            detect: (vp, k) => {
                if (!k.PK || !vp[k.PK.name]) return false;
                const free = !linked(vp, k.PK, k.GK)
                          && !linkedRaw(vp, k.PK && k.PK.name, 'Rahu')
                          && !linkedRaw(vp, k.PK && k.PK.name, 'Ketu');
                return free && (linked(vp, k.PK, k.AK) || linked(vp, k.PK, k.BK));
            },
        },
        {
            name: 'Dhana Yoga (Jaimini)',
            category: 'Wealth',
            desc: 'AmK or DK in own sign / exaltation, linked with AK — substantial wealth accumulation and financial independence.',
            detect: (vp, k) => {
                const amkGood = k.AmK && vp[k.AmK.name] && ['Exalted','Own Sign'].includes(vp[k.AmK.name].dignity);
                const dkGood  = k.DK  && vp[k.DK.name]  && ['Exalted','Own Sign'].includes(vp[k.DK.name].dignity);
                return (amkGood || dkGood) && (linked(vp, k.AK, k.AmK) || linked(vp, k.AK, k.DK));
            },
        },
        {
            name: 'Moksha Yoga (Jaimini)',
            category: 'Spiritual Liberation',
            desc: 'AK or PK with Ketu (especially in the 4th, 8th, or 12th bhava) — deep spiritual inclination, monastic tendencies, or liberation from material cycles.',
            detect: (vp, k) => {
                return linkedRaw(vp, k.AK && k.AK.name, 'Ketu')
                    || linkedRaw(vp, k.PK && k.PK.name, 'Ketu');
            },
        },
        {
            name: 'Bandhu Yoga (Relative Support)',
            category: 'Family & Community',
            desc: 'BK is strengthened (exalted / own sign or linked with AK) without GK affliction — strong, supportive siblings, mentors, and close community.',
            detect: (vp, k) => {
                if (!k.BK || !vp[k.BK.name]) return false;
                const strong = ['Exalted','Own Sign'].includes(vp[k.BK.name].dignity)
                            || linked(vp, k.BK, k.AK);
                const clean  = !linked(vp, k.BK, k.GK);
                return strong && clean;
            },
        },
        {
            name: 'Dara Yoga (Marriage Harmony)',
            category: 'Marriage & Partnership',
            desc: 'DK is dignified (exalted/own sign) or linked with AK without GK — harmonious, elevating marriage and partnerships.',
            detect: (vp, k) => {
                if (!k.DK || !vp[k.DK.name]) return false;
                const good  = ['Exalted','Own Sign'].includes(vp[k.DK.name].dignity)
                           || linked(vp, k.DK, k.AK);
                const clean = !linked(vp, k.DK, k.GK);
                return good && clean;
            },
        },
        {
            name: 'Gnati–Ketu Yoga (Intense Sadhana)',
            category: 'Spiritual Obstacles → Evolution',
            desc: 'GK is with Ketu — extreme asceticism, periods of isolation, and breakthrough through intense spiritual practice.',
            detect: (vp, k) => {
                return k.GK && k.GK.name && linkedRaw(vp, k.GK.name, 'Ketu');
            },
        },
    ];

    /** linked: checks if karaka a and karaka b are conjoined or mutually aspecting in the varga */
    function linked(vp, ka, kb) {
        if (!ka || !kb || !vp[ka.name] || !vp[kb.name]) return false;
        const ai = vp[ka.name].signIndex, bi = vp[kb.name].signIndex;
        return ai === bi || rashiAspects(ai, bi);
    }
    function linkedRaw(vp, nameA, nameB) {
        if (!vp || !nameA || !nameB || !vp[nameA] || !vp[nameB]) return false;
        const ai = vp[nameA].signIndex, bi = vp[nameB].signIndex;
        return ai === bi || rashiAspects(ai, bi);
    }

    // ─── CORE ENGINE ─────────────────────────────────────────────────────────

    /**
     * Generate the full Jaimini varga analysis object.
     * @param {object} rawPlanets — normalised planet map from jemini_prediction.js
     * @param {object} opts       — { lagnaSign, karakas, scheme }
     */
    function generateJaiminiVargaAnalysis(rawPlanets, opts) {
        const karakas    = opts.karakas || {};
        const lagnaIdx   = signIdx(opts.lagnaSign || 'Aries');
        const highlights = [];
        const charts     = [];

        VARGA_DEFS.forEach(def => {
            const vp = vargaPlanets(rawPlanets, def.divisor);
            const chartEntry = analyzeOneVarga(def, vp, karakas, lagnaIdx, rawPlanets);
            charts.push(chartEntry);
            if (chartEntry.yogas.length) {
                chartEntry.yogas.forEach(y => {
                    highlights.push({ title: `${def.name} — ${y.name}`, text: y.desc });
                });
            }
        });

        // Global yogas (across D1)
        const globalVp = vargaPlanets(rawPlanets, 1);
        const globalYogas = detectYogas(globalVp, karakas);

        return { charts, globalYogas, highlights };
    }

    function analyzeOneVarga(def, vp, karakas, lagnaIdx, rawPlanets) {
        const akName  = karakas.AK  && karakas.AK.name;
        const yogas   = detectYogas(vp, karakas);

        // AK position in this varga
        const akPos = akName && vp[akName]
            ? { sign: vp[akName].sign, signIndex: vp[akName].signIndex, dignity: vp[akName].dignity,
                house: houseFrom(lagnaIdx, vp[akName].signIndex) }
            : null;

        // Primary karaka for this varga
        const pcKey = def.primaryKaraka === 'AmK' ? 'AmK'
                    : def.vargaKaraka   === 'BK_MK' ? null : def.vargaKaraka;
        const pcKaraka = pcKey && karakas[pcKey];
        const pcPos = pcKaraka && vp[pcKaraka.name]
            ? { planet: pcKaraka.name, sign: vp[pcKaraka.name].sign,
                signIndex: vp[pcKaraka.name].signIndex, dignity: vp[pcKaraka.name].dignity,
                house: houseFrom(lagnaIdx, vp[pcKaraka.name].signIndex) }
            : null;

        // Secondary karakas (BK+MK for D12)
        let scPos = null;
        if (def.vargaKaraka === 'BK_MK') {
            const bk = karakas.BK && vp[karakas.BK.name];
            const mk = karakas.MK && vp[karakas.MK.name];
            scPos = {
                BK: bk ? { planet: karakas.BK.name, sign: bk.sign, dignity: bk.dignity } : null,
                MK: mk ? { planet: karakas.MK.name, sign: mk.sign, dignity: mk.dignity } : null,
            };
        }

        // Compute result analysis text
        const resultText = buildResultText(def, vp, karakas, akPos, pcPos, pcKey, scPos);

        return {
            divisor:    def.divisor,
            name:       def.name,
            topic:      def.topic,
            method:     def.method,
            procedure:  def.procedure,
            akPosition: akPos,
            primaryKaraka: pcKey && { key: pcKey, position: pcPos },
            secondaryKaraka: scPos,
            yogas,
            resultText,
        };
    }

    function detectYogas(vp, karakas) {
        return JAIMINI_YOGAS.filter(y => {
            try { return y.detect(vp, karakas); } catch(e) { return false; }
        }).map(y => ({ name: y.name, category: y.category, desc: y.desc }));
    }

    function buildResultText(def, vp, karakas, akPos, pcPos, pcKey, scPos) {
        const lines = [];

        // AK in this varga
        if (akPos) {
            const infl = influencers(vp, karakas.AK.name, karakas);
            let line = `AK (${esc(karakas.AK.name)}) is in ${esc(akPos.sign)} (House ${akPos.house}) — ${esc(akPos.dignity)}.`;
            if (infl.yoga.length)   line += ` Raja Yoga formed with: ${infl.yoga.join(', ')}.`;
            if (infl.afflict.length)line += ` Afflicted by: ${infl.afflict.map(a=>`${esc(a.label)} (${esc(a.how)})`).join(', ')} — expect friction/obstacles.`;
            if (infl.support.length && !infl.yoga.length) line += ` Supported by: ${infl.support.map(a=>esc(a.label)).join(', ')}.`;
            if (infl.afflict.length === 0 && infl.yoga.length === 0 && infl.support.length === 0)
                line += ' Free of GK/Rahu/Ketu — this area of life runs smoothly.';
            lines.push(line);
        }

        // Primary karaka
        if (pcPos) {
            const infl = influencers(vp, pcPos.planet, karakas);
            let line = `${esc(pcKey)} (${esc(pcPos.planet)}) — primary karaka for ${esc(def.topic)} — is in ${esc(pcPos.sign)} (House ${pcPos.house}), ${esc(pcPos.dignity)}.`;
            if (infl.yoga.length)   line += ` Links with ${infl.yoga.join(', ')} → Raja Yoga for ${esc(def.topic)}.`;
            if (infl.afflict.length)line += ` Influenced by ${infl.afflict.map(a=>esc(a.label)).join(', ')} → challenges in ${esc(def.topic)}.`;
            if (infl.afflict.length === 0 && infl.yoga.length === 0)
                line += ` No GK/Rahu/Ketu influence — ${esc(def.topic)} unfolds naturally.`;
            lines.push(line);
        }

        // D12 special: BK (father) + MK (mother)
        if (scPos) {
            const bkEntry = scPos.BK;
            const mkEntry = scPos.MK;
            if (bkEntry) {
                const infl = influencers(vp, bkEntry.planet, karakas);
                let line = `BK (${esc(bkEntry.planet)}) — father/paternal line — ${esc(bkEntry.dignity)}.`;
                if (infl.afflict.length) line += ` Afflicted by GK/Rahu/Ketu → paternal difficulties or early loss.`;
                else line += ` Clean of major afflictions → father supportive or long-lived.`;
                lines.push(line);
            }
            if (mkEntry) {
                const infl = influencers(vp, mkEntry.planet, karakas);
                let line = `MK (${esc(mkEntry.planet)}) — mother — ${esc(mkEntry.dignity)}.`;
                if (infl.afflict.length) line += ` Afflicted → challenges for mother's longevity or relationship.`;
                else line += ` Unafflicted → mother well-placed and supportive.`;
                lines.push(line);
            }
        }

        // Rahu/Ketu note
        const gkName = karakas.GK && karakas.GK.name;
        const akName = karakas.AK && karakas.AK.name;
        if (akName && vp[akName]) {
            const akSi = vp[akName].signIndex;
            if (vp.Rahu && vp.Rahu.signIndex === akSi)
                lines.push(`Rahu conjunct AK here → strong material orientation; worldly ambition shapes ${esc(def.topic)}.`);
            if (vp.Ketu && vp.Ketu.signIndex === akSi)
                lines.push(`Ketu conjunct AK here → spiritual inclination; inner searching shapes ${esc(def.topic)}.`);
        }

        return lines.join(' ');
    }

    // ─── HTML RENDERER ────────────────────────────────────────────────────────

    const CATEGORY_COLOR = {
        'Status & Power':           '#FFD700',
        'Status & Intelligence':    '#FFD700',
        'Status through Partnership':'#FFD700',
        'Career & Intellect':       '#44FFAA',
        'Career through Partnership':'#44FFAA',
        'Power & Material Success': '#FF9933',
        'Obstacle & Struggle':      '#FF6688',
        'Success through Adversity':'#FFB347',
        'Wealth':                   '#7FFF00',
        'Spiritual Liberation':     '#9B6FFF',
        'Family & Community':       '#44FFCC',
        'Marriage & Partnership':   '#FF88CC',
        'Children & Creative Merits':'#7FFFFF',
        'Spiritual Obstacles → Evolution': '#C39EFF',
    };

    function toHTML(vargaAnalysis) {
        if (!vargaAnalysis) return '';
        const { charts, globalYogas } = vargaAnalysis;
        let html = '';

        // ── Global Jaimini Yogas (D1-based) ─────────────────────────────────
        if (globalYogas && globalYogas.length) {
            html += sectionHeader('🔱 Jaimini Yogas Detected (Birth Chart)', '#9B6FFF');
            html += '<div style="margin-bottom:10px;">';
            globalYogas.forEach(y => {
                const col = CATEGORY_COLOR[y.category] || '#AAAAAA';
                html += yogaBadge(y, col);
            });
            html += '</div>';
        }

        // ── Per-Varga Analysis ───────────────────────────────────────────────
        if (charts && charts.length) {
            charts.forEach(c => renderChart(c));
        }

        function renderChart(c) {
            html += sectionHeader(`📊 ${esc(c.name)} — ${esc(c.topic)}`, '#3AF0FF');

            // Method
            html += subHeader('Method', '#FFD700');
            html += '<ul style="margin:0 0 8px 0;padding-left:16px;font-size:10.5px;line-height:1.8;color:var(--text);">';
            (c.method || []).forEach(m => { html += `<li>${esc(m)}</li>`; });
            html += '</ul>';

            // Procedure
            html += subHeader('Procedure', '#44FFAA');
            html += '<ol style="margin:0 0 8px 0;padding-left:18px;font-size:10.5px;line-height:1.8;color:var(--text);">';
            (c.procedure || []).forEach(p => { html += `<li>${esc(p)}</li>`; });
            html += '</ol>';

            // Result Analysis (dynamic)
            html += subHeader('Result Analysis', '#FF9933');
            html += `<div style="font-size:10.5px;line-height:1.8;color:var(--text);background:rgba(255,153,51,.07);border-left:3px solid #FF9933;padding:8px 12px;border-radius:4px;margin-bottom:8px;">${esc(c.resultText) || '<em>Chart data not available.</em>'}</div>`;

            // Varga-specific Yogas
            if (c.yogas && c.yogas.length) {
                html += subHeader(`Yogas in ${c.name.split(' ')[0]}`, '#44FFCC');
                html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">';
                c.yogas.forEach(y => {
                    const col = CATEGORY_COLOR[y.category] || '#AAAAAA';
                    html += yogaBadge(y, col);
                });
                html += '</div>';
            }
        }

        return html || '<div style="color:var(--muted);font-size:10px;">No varga analysis generated.</div>';
    }

    function sectionHeader(title, color) {
        return `<div style="font-size:10px;font-weight:bold;color:${color};text-transform:uppercase;letter-spacing:1.2px;border-bottom:1px solid ${color}33;padding-bottom:4px;margin:16px 0 10px;">${title}</div>`;
    }
    function subHeader(title, color) {
        return `<div style="font-size:9.5px;font-weight:bold;color:${color};letter-spacing:0.8px;margin:8px 0 4px;">${title}</div>`;
    }
    function yogaBadge(y, col) {
        return `<div style="font-size:9.5px;border:1px solid ${col}55;border-radius:4px;padding:5px 9px;margin-bottom:4px;background:${col}11;">
            <span style="color:${col};font-weight:bold;">${esc(y.name)}</span>
            <span style="color:rgba(255,255,255,.35);margin-left:4px;">[${esc(y.category)}]</span><br>
            <span style="color:rgba(255,255,255,.65);font-size:9px;">${esc(y.desc)}</span>
        </div>`;
    }

    // ─── PUBLIC API ───────────────────────────────────────────────────────────
    global.VARGA_TEXT_ANALYSIS = {
        generateJaiminiVargaAnalysis,
        toHTML,
        detectYogas,
        JAIMINI_YOGAS,
        VARGA_DEFS,
        // legacy stubs (kept for any callers of the old API)
        getVargaChartText:              () => ({}),
        generateComprehensiveVargaAnalysis: () => [],
        formatVargaAnalysis:            () => '',
        VARGA_SIGNIFICANCES:            {},
        getPlanetStrength:              p => 5,
    };

})(typeof window !== 'undefined' ? window : globalThis);
