/**
 * KP_result_strength.js  ->  window.KP_RESULT_STRENGTH
 *
 * KP result-strength analysis from "kp_analysis_result_strength.md"
 * (KP Astrology Boot Camp material + share-market forum notes).
 *
 *  1. planetLevels()   planet -> houses at A / B / C / D
 *         A houses occupied by the STAR LORD   B house occupied by the PLANET
 *         C houses owned by the STAR LORD      D houses owned by the PLANET
 *  2. bhavaLevels()    house -> planets at A / B / C / D
 *  3. plusLevels()     borrowed A+ B+ C+ D+ via conjunction (orb rules of md section 5)
 *  4. nodeAgents()     Rahu/Ketu as agents, priority: placement > conjunct (nearest first)
 *                      > aspecting (<=15 deg) > star lord > sign lord
 *  5. tenancy()/independentHouses()  untenanted planets; a house is independent when its
 *                      lord is untenanted AND the house is empty (md section 9)
 *  6. eventHouseGroups() primary / supporting / negating (12th-from rule, md section 6)
 *  7. checkDBA()       MD, AD and PD must each support the event (md section 7)
 *  8. rulingPlanets(), selectFruitful()  the three elimination methods (md section 8)
 *  9. validatePrashna()  Moon check + number-sub-lord check, max 3 attempts (md section 10)
 * 10. shareMarketNatal() forum-sourced hypotheses, clearly labelled (md section 11)
 * 11. runChecklist()   the 10-step checklist (md section 14)
 * 12. installHoraryFix() corrects KP_PREDICTION horary to the 249-division table,
 *                      lagna at the START of the division (md section 10/12).
 *
 * Deviations from the md's sample code (documented, deliberate):
 *  - Sun orb: the md TABLE says a Sun pair between 3deg20' and 6deg40' is felt by the Sun
 *    ONLY; its sample code applied the wide orb to both planets. The table rule is used.
 *  - Aspects are not used for A+..D+ (the md gives no aspect angles); nodes use the 15 deg rule.
 *
 * Houses: Placidus cusps when KP_PREDICTION.getCuspSid() provides them (KP_placidus.js),
 * else the engine's equal-house fallback (flagged in output as `cuspSystem`).
 * Self-contained: no dependency on other KP parts beyond optional cusp/horary helpers.
 */
window.KP_RESULT_STRENGTH = {

    DASHA_ORDER: ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'],
    SIGN_LORDS: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],
    PLANETS: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    LEVELS: ['A', 'B', 'C', 'D'],
    LEVEL_SCORE: { A: 4, B: 3, C: 2, D: 1 },          // md 2.4: implementation convention, "+" same weight
    ORB: 10 / 3, SUN_ORB: 20 / 3, NODE_ASPECT_ORB: 15,
    DAY_LORDS: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],   // Sun=0 (Sunday)
    VEDIC_ASPECTS: { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10] },

    // ---------- basic helpers ----------
    _n: function (x) { return ((x % 360) + 360) % 360; },
    _uniq: function (a) { return Array.from(new Set(a)).sort(function (x, y) { return x - y; }); },
    _signLord: function (lon) { return this.SIGN_LORDS[Math.floor(this._n(lon) / 30)]; },
    _starLord: function (lon) { return this.DASHA_ORDER[Math.floor(this._n(lon) / (360 / 27)) % 9]; },
    _subLord: function (lon) {
        var NAK = 360 / 27, l = this._n(lon), idx = Math.floor(l / NAK), within = (l - idx * NAK) / NAK * 120; // years
        var start = idx % 9, acc = 0;
        for (var i = 0; i < 9; i++) {
            var p = this.DASHA_ORDER[(start + i) % 9], y = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 }[p];
            acc += y; if (within < acc - 1e-9) return p;
        }
        return this.DASHA_ORDER[(start + 8) % 9];
    },

    /** 12 cusp longitudes [cusp1..cusp12] for an Ascendant: Placidus if available, else equal-house. */
    getCusps: function (ascSid) {
        var kp = window.KP_PREDICTION, out = [], system = 'equal';
        for (var h = 1; h <= 12; h++) {
            out.push(kp && kp.getCuspSid ? kp.getCuspSid(ascSid, h) : this._n(ascSid + (h - 1) * 30));
        }
        if (kp && kp.getCuspSystem) system = kp.getCuspSystem(ascSid);
        return { cusps: out, system: system };
    },

    houseOf: function (lon, cusps) {
        var x = this._n(lon);
        for (var i = 0; i < 12; i++) {
            var s = cusps[i], e = cusps[(i + 1) % 12];
            if (s < e ? (s <= x && x < e) : (x >= s || x < e)) return i + 1;
        }
        return 12;
    },

    /** {planet: longitude} from a planets map ({sid}). */
    _lons: function (planetsMap) {
        var o = {}; var self = this;
        this.PLANETS.forEach(function (p) { var d = planetsMap && planetsMap[p]; if (d && d.sid !== undefined) o[p] = self._n(d.sid); });
        return o;
    },

    // ---------- 1. planet levels ----------
    planetLevels: function (lons, cusps) {
        var self = this, hof = {}, owns = {}, out = {};
        Object.keys(lons).forEach(function (p) {
            hof[p] = self.houseOf(lons[p], cusps);
            owns[p] = [];
            for (var h = 1; h <= 12; h++) if (self._signLord(cusps[h - 1]) === p) owns[p].push(h);
        });
        Object.keys(lons).forEach(function (p) {
            var sl = self._starLord(lons[p]);
            out[p] = { A: sl in hof ? [hof[sl]] : [], B: [hof[p]], C: sl in owns ? owns[sl].slice() : [], D: owns[p].slice(), starLord: sl };
        });
        return out;
    },

    // ---------- 2. bhava levels ----------
    bhavaLevels: function (lons, cusps) {
        var self = this, hof = {}, out = {};
        Object.keys(lons).forEach(function (p) { hof[p] = self.houseOf(lons[p], cusps); });
        for (var h = 1; h <= 12; h++) {
            var occ = Object.keys(lons).filter(function (p) { return hof[p] === h; });
            var lord = self._signLord(cusps[h - 1]);
            out[h] = {
                A: Object.keys(lons).filter(function (p) { return occ.indexOf(self._starLord(lons[p])) >= 0; }),
                B: occ,
                C: Object.keys(lons).filter(function (p) { return self._starLord(lons[p]) === lord; }),
                D: [lord]
            };
        }
        return out;
    },

    // ---------- 3. borrowed (+) levels ----------
    _angle: function (a, b) { var d = Math.abs(this._n(a) - this._n(b)); return Math.min(d, 360 - d); },
    plusLevels: function (lons, levels) {
        var self = this, plus = {};
        Object.keys(lons).forEach(function (p) { plus[p] = { A: [], B: [], C: [], D: [], from: [] }; });
        Object.keys(lons).forEach(function (m) {
            Object.keys(lons).forEach(function (n) {
                if (m === n) return;
                var d = self._angle(lons[m], lons[n]);
                var node = (m === 'Rahu' || m === 'Ketu' || n === 'Rahu' || n === 'Ketu');
                var sunPair = (m === 'Sun' || n === 'Sun');
                var borrow = false;
                if (node) borrow = Math.floor(lons[m] / 30) === Math.floor(lons[n] / 30);      // same sign, any degree
                else if (d <= self.ORB + 1e-9) borrow = true;                                    // both feel it
                else if (sunPair && d <= self.SUN_ORB + 1e-9) borrow = (m === 'Sun');            // only the Sun feels it
                if (!borrow) return;
                plus[m].from.push(n);
                self.LEVELS.forEach(function (k) { plus[m][k] = plus[m][k].concat(levels[n][k]); });
            });
        });
        Object.keys(plus).forEach(function (p) { self.LEVELS.forEach(function (k) { plus[p][k] = self._uniq(plus[p][k]); }); });
        return plus;
    },

    /** Houses a planet signifies, with the best level at which each is held (A>B>C>D, base before '+'). */
    signifiedHouses: function (p, levels, plus) {
        var best = {}, self = this;
        function put(h, lvl, borrowed) {
            var key = lvl + (borrowed ? '+' : ''), cur = best[h];
            var score = self.LEVEL_SCORE[lvl] * 10 - (borrowed ? 1 : 0);
            if (!cur || score > cur.score) best[h] = { level: key, score: score };
        }
        this.LEVELS.forEach(function (k) {
            (levels[p] ? levels[p][k] : []).forEach(function (h) { put(h, k, false); });
            (plus && plus[p] ? plus[p][k] : []).forEach(function (h) { put(h, k, true); });
        });
        return best;   // {house: {level, score}}
    },

    // ---------- 4. Rahu / Ketu agents ----------
    nodeAgents: function (node, planetsMap, lons, cusps, levels, plus) {
        var self = this, pd = planetsMap[node]; if (!pd) return null;
        var myLon = lons[node], mySn = Math.floor(myLon / 30);
        var placement = this.houseOf(myLon, cusps);
        var fromCusp = function (p) { return Object.keys(self.signifiedHouses(p, levels, null)).map(Number); };
        // conjunct: same sign, nearest first
        var conj = this.PLANETS.filter(function (p) { return p !== 'Rahu' && p !== 'Ketu' && lons[p] !== undefined && Math.floor(lons[p] / 30) === mySn; })
            .map(function (p) { return { planet: p, distance: Math.round(self._angle(lons[p], myLon) * 100) / 100 }; })
            .sort(function (a, b) { return a.distance - b.distance; });
        conj.forEach(function (c) { c.houses = fromCusp(c.planet).sort(function (a, b) { return a - b; }); });
        // aspecting: Vedic house aspect, aspecting planet within 15 deg of the exact aspect angle
        var asp = [];
        this.PLANETS.forEach(function (p) {
            if (p === 'Rahu' || p === 'Ketu' || lons[p] === undefined) return;
            var offs = self.VEDIC_ASPECTS[p] || [7];
            var fwd = self._n(myLon - lons[p]);                       // forward angle planet -> node
            for (var i = 0; i < offs.length; i++) {
                var exact = (offs[i] - 1) * 30;
                var dev = Math.abs(((fwd - exact + 540) % 360) - 180);
                var hsep = (Math.floor(myLon / 30) - Math.floor(lons[p] / 30) + 12) % 12 + 1;
                if (hsep === offs[i] && dev <= self.NODE_ASPECT_ORB) { asp.push({ planet: p, aspect: offs[i], deviation: Math.round(dev * 100) / 100, houses: fromCusp(p).sort(function (a, b) { return a - b; }) }); break; }
            }
        });
        asp.sort(function (a, b) { return a.deviation - b.deviation; });
        var sl = levels[node] ? levels[node].starLord : this._starLord(myLon);
        var rl = this._signLord(myLon);
        var ranked = [{ source: 'placement', planet: node, houses: [placement] }]
            .concat(conj.map(function (c) { return { source: 'conjunct', planet: c.planet, houses: c.houses }; }))
            .concat(asp.map(function (a) { return { source: 'aspecting', planet: a.planet, houses: a.houses }; }))
            .concat([{ source: 'star lord', planet: sl, houses: fromCusp(sl).sort(function (a, b) { return a - b; }) },
                     { source: 'sign lord', planet: rl, houses: fromCusp(rl).sort(function (a, b) { return a - b; }) }]);
        var all = []; ranked.forEach(function (r) { all = all.concat(r.houses); });
        return { node: node, placement: placement, conjunct: conj, aspecting: asp, starLord: sl, signLord: rl, ranked: ranked, houses: this._uniq(all) };
    },

    // ---------- 5. tenancy & independent houses ----------
    tenancy: function (lons) {
        var self = this, ps = Object.keys(lons), star = {}, tenants = {}, out = {};
        ps.forEach(function (p) { star[p] = self._starLord(lons[p]); });
        ps.forEach(function (p) { (tenants[star[p]] = tenants[star[p]] || []).push(p); });
        ps.forEach(function (p) {
            var others = (tenants[p] || []).filter(function (q) { return q !== p; });
            var untenanted = others.length === 0, why = untenanted ? 'no other planet sits in its star' : 'tenants: ' + others.join(', ');
            if (!untenanted && star[p] === p) { untenanted = true; why += '; but it sits in its OWN star (untenanted)'; }
            var partner = star[p];
            if (!untenanted && partner !== p && star[partner] === p) { untenanted = true; why += '; mutual star exchange with ' + partner + ' (untenanted)'; }
            out[p] = { untenanted: untenanted, tenants: others, reason: why };
        });
        return out;
    },
    independentHouses: function (lons, cusps, tenancy) {
        var self = this, out = [];
        for (var h = 1; h <= 12; h++) {
            var lord = self._signLord(cusps[h - 1]);
            var occupied = Object.keys(lons).some(function (p) { return self.houseOf(lons[p], cusps) === h; });
            if (tenancy[lord] && tenancy[lord].untenanted && !occupied) out.push({ house: h, lord: lord, reason: lord + ' is untenanted and house ' + h + ' is empty' });
        }
        return out;
    },

    // ---------- 6. event house groups ----------
    EVENT_PRESETS: {
        marriage: { label: 'Marriage', primary: [7], supporting: [2, 11] },
        job: { label: 'Job', primary: [10], supporting: [2, 6, 11] }
    },
    /** Negating houses = 12th from each event house (strongest from the primary), minus houses that are themselves event houses. */
    eventHouseGroups: function (primary, supporting) {
        var all = primary.concat(supporting), tw = function (h) { return ((h - 2 + 12) % 12) + 1; };
        var strong = [], weak = [];
        primary.forEach(function (h) { var t = tw(h); if (all.indexOf(t) < 0) strong.push(t); });
        supporting.forEach(function (h) { var t = tw(h); if (all.indexOf(t) < 0 && strong.indexOf(t) < 0) weak.push(t); });
        return { primary: primary, supporting: supporting, negatingStrong: strong, negatingWeak: weak,
                 negating: strong.concat(weak), note: '8 and 12: hidden obstacles/loss in material events, supportive in spiritual ones.' };
    },

    // ---------- 7. DBA ----------
    /** A lord "supports" if it signifies an event house and does not out-rank that with a negating house. */
    judgeLord: function (lord, ctxData, groups) {
        var sig = this.signifiedHouses(lord, ctxData.levels, ctxData.plus);
        var self = this;
        var best = function (hs) { var b = null; hs.forEach(function (h) { if (sig[h] && (!b || sig[h].score > b.score)) b = { house: h, level: sig[h].level, score: sig[h].score }; }); return b; };
        var sup = best(groups.primary.concat(groups.supporting)), neg = best(groups.negating);
        var verdict = !sup ? 'No' : (!neg ? 'Yes' : (sup.score > neg.score ? 'Yes (despite negating ' + neg.house + ')' : (sup.score === neg.score ? 'Mixed' : 'No (negating ' + neg.house + ' stronger)')));
        return { lord: lord, supports: sup, negates: neg, verdict: verdict, ok: /^Yes/.test(verdict) };
    },
    checkDBA: function (lords, ctxData, groups) {
        var self = this, rows = [];
        [['MD', lords.md], ['AD', lords.ad], ['PD', lords.pd]].forEach(function (x) { if (x[1]) { var r = self.judgeLord(x[1], ctxData, groups); r.period = x[0]; rows.push(r); } });
        return { rows: rows, possible: rows.length === 3 && rows.every(function (r) { return r.ok; }), complete: rows.length === 3 };
    },

    // ---------- 8. ruling planets & fruitful significators ----------
    /** md: Day lord, Moon sign lord, Moon star lord, Lagna (sign) lord, Lagna star lord; drop RPs in a retrograde star/sub. */
    rulingPlanets: function (planetsMap, ascSid, date) {
        var self = this, d = date ? new Date(date) : new Date();
        var moon = planetsMap.Moon; if (!moon) return null;
        var list = [
            { role: 'Day lord', planet: this.DAY_LORDS[d.getDay()] },
            { role: 'Moon sign lord', planet: this._signLord(moon.sid) },
            { role: 'Moon star lord', planet: this._starLord(moon.sid) },
            { role: 'Lagna lord', planet: this._signLord(ascSid) },
            { role: 'Lagna star lord', planet: this._starLord(ascSid) }
        ];
        // Rahu/Ketu are always retrograde, so only the true planets are tested (otherwise every RP in a node's star would be dropped).
        var retro = function (p) { return p !== 'Rahu' && p !== 'Ketu' && !!(planetsMap[p] && planetsMap[p].retro === true); };
        list.forEach(function (r) {
            var pd = planetsMap[r.planet];
            r.retroStarOrSub = !!(pd && (retro(self._starLord(pd.sid)) || retro(self._subLord(pd.sid))));
        });
        var kept = []; list.forEach(function (r) { if (!r.retroStarOrSub && kept.indexOf(r.planet) < 0) kept.push(r.planet); });
        return { list: list, kept: kept };
    },
    selectFruitful: function (eventHouses, detrimentalHouses, ctxData, rulingKept) {
        var self = this, ps = Object.keys(ctxData.lons);
        var sig = {}; ps.forEach(function (p) { sig[p] = self.signifiedHouses(p, ctxData.levels, ctxData.plus); });
        var signifies = function (p, hs) { return hs.some(function (h) { return sig[p][h]; }); };
        var step0 = ps.filter(function (p) { return signifies(p, eventHouses); });
        var detr = step0.filter(function (p) { return signifies(p, detrimentalHouses); });          // method 1 removals
        var step1 = step0.filter(function (p) { return detr.indexOf(p) < 0; });
        var allDetr = ps.filter(function (p) { return signifies(p, detrimentalHouses); });
        var inDetrSub = step1.filter(function (p) { return allDetr.indexOf(self._subLord(ctxData.lons[p])) >= 0; });   // method 2 removals
        var step2 = step1.filter(function (p) { return inDetrSub.indexOf(p) < 0; });
        var step3 = rulingKept ? step2.filter(function (p) { return rulingKept.indexOf(p) >= 0; }) : null;                // method 3
        var untenanted = ctxData.tenancy;
        var scored = (step3 || step2).map(function (p) {
            var bestLvl = 0; eventHouses.forEach(function (h) { if (sig[p][h]) bestLvl = Math.max(bestLvl, sig[p][h].score / 10); });
            var score = bestLvl + (untenanted[p] && untenanted[p].untenanted ? 1 : 0) + (rulingKept && rulingKept.indexOf(p) >= 0 ? 2 : 0);
            return { planet: p, bestLevelScore: bestLvl, untenanted: !!(untenanted[p] && untenanted[p].untenanted), inRulingPlanets: !!(rulingKept && rulingKept.indexOf(p) >= 0), score: score };
        }).sort(function (a, b) { return b.score - a.score; });
        return { significators: step0, afterMethod1: step1, removedMethod1: detr, afterMethod2: step2, removedMethod2: inDetrSub,
                 afterMethod3: step3, ranking: scored, note: 'Ranking weights (level + untenanted + ruling-planet) are an implementation heuristic, not from the source.' };
    },

    // ---------- 10. share-market (forum-sourced hypotheses) ----------
    shareMarketNatal: function (lons, cusps, levels, plus) {
        var csl = this._subLord(cusps[9]), starOfCsl = this._starLord(lons[csl] !== undefined ? lons[csl] : cusps[9]);
        var sigC = Object.keys(this.signifiedHouses(csl, levels, plus)).map(Number);
        var sigS = Object.keys(this.signifiedHouses(starOfCsl, levels, plus)).map(Number);
        var hit = function (arr, hs) { return hs.filter(function (h) { return arr.indexOf(h) >= 0; }); };
        var jm = (csl === 'Jupiter' || csl === 'Mercury' || starOfCsl === 'Jupiter' || starOfCsl === 'Mercury');
        return { csl10: csl, cslStarLord: starOfCsl,
                 linkedWith_5_10_2_7_11: hit(sigC, [5, 10, 2, 7, 11]), starLordLinked_2_5_6_10_11: hit(sigS, [2, 5, 6, 10, 11]), jupiterOrMercuryConnected: jm,
                 favoursTrading: hit(sigC, [5, 10, 2, 7, 11]).length >= 3 && hit(sigS, [2, 5, 6, 10, 11]).length >= 3 && jm,
                 caveat: 'Forum-sourced (IndiaDivine 2006-2014); one poster claims 95% accuracy, unverified. Treat as a hypothesis to test.' };
    },

    // ---------- 9. prashna validation ----------
    /** number 1-249 -> chart; valid only if (Moon or Moon's star lord signifies an event house) AND (number sub lord does). */
    validatePrashna: function (number, planetsMap, eventHouses, opts) {
        opts = opts || {};
        var R = window.KP_PREDICTION_11, row = R && R.build249Table ? R.build249Table()[number - 1] : null;
        if (!row) return { error: 'Number must be 1-249 (needs KP_prediction_11.js for the 249-row table).' };
        var asc = row.startSec / 3600, cs = opts.cusps || (function (s) { return s.getCusps(asc); })(this);
        var cusps = cs.cusps || cs, lons = this._lons(planetsMap);
        var levels = this.planetLevels(lons, cusps), plus = this.plusLevels(lons, levels), data = { levels: levels, plus: plus };
        var sig = function (self, p) { return Object.keys(self.signifiedHouses(p, levels, plus)).map(Number); };
        var inEvent = function (arr) { return arr.some(function (h) { return eventHouses.indexOf(h) >= 0; }); };
        var moonSig = inEvent(sig(this, 'Moon')), moonStarSig = inEvent(sig(this, levels.Moon.starLord));
        var subSig = inEvent(sig(this, row.subLord));
        var moonOk = moonSig || moonStarSig;
        return { number: number, ascendant: asc, row: row, moonSignifiesEvent: moonSig, moonStarLordSignifiesEvent: moonStarSig,
                 numberSubLord: row.subLord, numberSubLordSignifiesEvent: subSig, valid: moonOk && subSig,
                 advice: (moonOk && subSig) ? 'Chart is valid: judge the question.' : 'Chart invalid: take a NEW number (maximum 3 attempts, then stop and retry later).',
                 cuspSystem: cs.system || 'equal', rule: 'Time chart = lagna from the clock time (only one question/day); number chart = lagna from a 1-249 number (use for several questions).' };
    },

    // ---------- 11. master checklist ----------
    buildContext: function (planetsMap, ascSid) {
        var lons = this._lons(planetsMap), cs = this.getCusps(ascSid), cusps = cs.cusps;
        var levels = this.planetLevels(lons, cusps), plus = this.plusLevels(lons, levels), bhava = this.bhavaLevels(lons, cusps);
        var tenancy = this.tenancy(lons);
        return { lons: lons, cusps: cusps, cuspSystem: cs.system, levels: levels, plus: plus, bhava: bhava, tenancy: tenancy,
                 independent: this.independentHouses(lons, cusps, tenancy),
                 nodes: { Rahu: this.nodeAgents('Rahu', planetsMap, lons, cusps, levels, plus), Ketu: this.nodeAgents('Ketu', planetsMap, lons, cusps, levels, plus) } };
    },
    runChecklist: function (ctxData, opts) {
        // opts: {primary, supporting, lords:{md,ad,pd}, rulingPlanets:{kept}}
        var groups = this.eventHouseGroups(opts.primary, opts.supporting);
        var primaryCusp = opts.primary[0];
        var csl = this._subLord(ctxData.cusps[primaryCusp - 1]);
        var cslJudge = this.judgeLord(csl, ctxData, groups);
        var eventHouses = groups.primary.concat(groups.supporting);
        var fruit = this.selectFruitful(eventHouses, groups.negating, ctxData, opts.rulingPlanets ? opts.rulingPlanets.kept : null);
        var nodesInvolved = ['Rahu', 'Ketu'].filter(function (n) { return n === csl || fruit.significators.indexOf(n) >= 0 || (opts.lords && [opts.lords.md, opts.lords.ad, opts.lords.pd].indexOf(n) >= 0); });
        var dba = opts.lords ? this.checkDBA(opts.lords, ctxData, groups) : null;
        var indep = ctxData.independent.filter(function (x) { return eventHouses.indexOf(x.house) >= 0; });
        return { groups: groups, cuspSubLord: { house: primaryCusp, lord: csl, judgement: cslJudge }, fruitful: fruit,
                 nodeAgentsNeeded: nodesInvolved.map(function (n) { return ctxData.nodes[n]; }), independentEventHouses: indep, dba: dba,
                 notes: ['Confirm with Ruling Planets at the time of judgement.', groups.note] };
    },

    // ---------- horary correction ----------
    /**
     * KP horary uses 249 divisions, the Lagna at the START of the number's sub (number 1 = 0 Aries,
     * 108 = 3deg00' Virgo). The base engine used 243 raw segments and the segment MIDPOINT; this
     * overrides KP_PREDICTION.horaryNumberToLongitude/buildHoraryTable and updates the 1-243 UI text.
     */
    installHoraryFix: function () {
        var kp = window.KP_PREDICTION, R = window.KP_PREDICTION_11;
        if (!kp || !R || !R.build249Table || kp._horary249) return false;
        kp._horary249 = true;
        kp.buildHoraryTable = function () {
            return R.build249Table().map(function (r) { return { number: r.no, startDeg: r.startSec / 3600, endDeg: r.endSec / 3600, nakLord: r.nakLord, subLord: r.subLord, sign: r.sign, signLord: r.signLord }; });
        };
        kp.horaryNumberToLongitude = function (number) {
            var t = this.buildHoraryTable(), n = Math.round(number);
            if (!(n >= 1 && n <= t.length)) return null;
            var e = t[n - 1];
            return { longitude: e.startDeg, entry: e, totalSegments: t.length };
        };
        ['renderHoraryPanel', 'renderWinLoseHoraryPanel', 'renderHoraryComparisonPanel', 'renderHoraryResult'].forEach(function (fn) {
            if (typeof kp[fn] !== 'function') return;
            var orig = kp[fn];
            kp[fn] = function () {
                var out = orig.apply(this, arguments);
                return typeof out === 'string' ? out.replace(/max="243"/g, 'max="249"').replace(/1-243/g, '1-249').replace(/ see module notes on the 243 vs 249 count/g, '') : out;
            };
        });
        return true;
    },

    // ---------- UI ----------
    _esc: function (s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
    _list: function (a) { return a && a.length ? a.join(', ') : '–'; },
    _lastCtx: null,

    renderForPanel: function (ctx) {
        if (!ctx || !ctx.natalPlanets || !ctx.natalAsc) return '';
        try {
            var ascSid = ctx.natalAsc.sid !== undefined ? ctx.natalAsc.sid : (ctx.natalAsc.sn * 30 + (parseFloat(ctx.natalAsc.deg) || 0));
            var data = this.buildContext(ctx.natalPlanets, ascSid), self = this, e = this._esc, L = this._list;
            this._lastCtx = { data: data, ctx: ctx, ascSid: ascSid };
            var th = 'padding:3px 5px;text-align:left;color:var(--muted);';
            var rows = this.PLANETS.filter(function (p) { return data.levels[p]; }).map(function (p) {
                var lv = data.levels[p], pl = data.plus[p];
                return '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:3px 5px;color:#D4A64A;">' + p + '</td>' +
                    self.LEVELS.map(function (k) { return '<td style="padding:3px 5px;">' + L(lv[k]) + '</td>'; }).join('') +
                    self.LEVELS.map(function (k) { return '<td style="padding:3px 5px;color:var(--cyan);">' + L(pl[k]) + '</td>'; }).join('') + '</tr>';
            }).join('');
            var bRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (h) {
                var b = data.bhava[h];
                return '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:3px 5px;color:#D4A64A;">H' + h + '</td>' +
                    self.LEVELS.map(function (k) { return '<td style="padding:3px 5px;">' + L(b[k]) + '</td>'; }).join('') + '</tr>';
            }).join('');
            var unt = Object.keys(data.tenancy).filter(function (p) { return data.tenancy[p].untenanted; });
            var ind = data.independent.map(function (x) { return 'H' + x.house + ' (' + x.lord + ')'; });
            var nodes = ['Rahu', 'Ketu'].map(function (n) {
                var a = data.nodes[n]; if (!a) return '';
                return '<div style="margin-top:4px;font-size:9.5px;"><b style="color:#D4A64A;">' + n + '</b> — ' +
                    a.ranked.map(function (r) { return e(r.source) + ': ' + e(r.planet) + ' [H' + r.houses.join(',H') + ']'; }).join(' › ') +
                    ' <span style="color:#00DD77;">⇒ H' + a.houses.join(',H') + '</span></div>';
            }).join('');
            var opts = Object.keys(this.EVENT_PRESETS).map(function (k) { return '<option value="' + k + '">' + e(self.EVENT_PRESETS[k].label) + '</option>'; }).join('');
            var sm = this.shareMarketNatal(data.lons, data.cusps, data.levels, data.plus);
            return '<div class="biz-summary" style="border-color:#B58CFF;background:rgba(181,140,255,0.03);margin-top:20px;border-radius:12px;">' +
                '<h3 class="' + (ctx.sectionClass || '') + '" style="color:#B58CFF;font-size:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);">⚖️ KP Result Strength — A / B / C / D levels</h3>' +
                '<div style="font-size:9px;color:var(--muted);margin:8px 0;">A = houses occupied by the star lord (strongest) · B = house occupied by the planet · C = houses owned by the star lord · D = houses owned by the planet. A+ … D+ are borrowed through conjunction (3°20′; Sun 6°40′ one-sided; Rahu/Ketu same sign). Cusps: ' + e(data.cuspSystem) + '.</div>' +
                '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:9.5px;color:var(--text);"><tr><th style="' + th + '">Planet</th><th style="' + th + '">A</th><th style="' + th + '">B</th><th style="' + th + '">C</th><th style="' + th + '">D</th><th style="' + th + '">A+</th><th style="' + th + '">B+</th><th style="' + th + '">C+</th><th style="' + th + '">D+</th></tr>' + rows + '</table></div>' +
                '<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:10px;color:#B58CFF;">Bhava table — which planets deliver each house (A strongest)</summary><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:9.5px;color:var(--text);"><tr><th style="' + th + '">House</th><th style="' + th + '">A: in stars of occupants</th><th style="' + th + '">B: occupants</th><th style="' + th + '">C: in star of lord</th><th style="' + th + '">D: lord</th></tr>' + bRows + '</table></div></details>' +
                '<div style="margin-top:8px;font-size:9.5px;"><b style="color:#D4A64A;">Untenanted planets:</b> ' + L(unt) + ' · <b style="color:#D4A64A;">Independent houses</b> (lord untenanted and house empty): ' + L(ind) + '</div>' +
                '<div style="margin-top:6px;font-size:9.5px;color:var(--muted);">Rahu / Ketu as agents (placement › conjunct › aspecting › star lord › sign lord):</div>' + nodes +
                '<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05);font-size:10px;"><b style="color:#B58CFF;">Event checklist</b> ' +
                '<select id="kprsEvent" style="font-size:10px;background:var(--bg3,#1a1a2e);color:var(--text);border:1px solid var(--border);">' + opts + '<option value="custom">Custom houses…</option></select> ' +
                '<input id="kprsPrimary" placeholder="primary e.g. 7" style="width:80px;font-size:10px;background:var(--bg3,#1a1a2e);color:var(--text);border:1px solid var(--border);"> ' +
                '<input id="kprsSupport" placeholder="supporting e.g. 2,11" style="width:100px;font-size:10px;background:var(--bg3,#1a1a2e);color:var(--text);border:1px solid var(--border);"> ' +
                '<button type="button" onclick="KP_RESULT_STRENGTH.runChecklistFromUI()" style="font-size:10px;padding:2px 8px;cursor:pointer;">Run</button></div>' +
                '<div id="kprsResult" style="margin-top:6px;font-size:9.5px;color:var(--text);"></div>' +
                '<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:10px;color:var(--muted);">Share-market natal hint (forum-sourced hypothesis)</summary><div style="font-size:9.5px;margin-top:4px;">10th CSL: <b>' + e(sm.csl10) + '</b> (star lord ' + e(sm.cslStarLord) + '). Linked with 5/10/2/7/11: ' + L(sm.linkedWith_5_10_2_7_11) + '; star lord with 2/5/6/10/11: ' + L(sm.starLordLinked_2_5_6_10_11) + '; Jupiter/Mercury connected: ' + (sm.jupiterOrMercuryConnected ? 'yes' : 'no') + ' → ' + (sm.favoursTrading ? 'favours' : 'does not clearly favour') + ' share trading. <i>' + e(sm.caveat) + '</i></div></details>' +
                '</div>';
        } catch (err) { console.error('KP_RESULT_STRENGTH render failed', err); return ''; }
    },

    runChecklistFromUI: function () {
        var out = document.getElementById('kprsResult'), st = this._lastCtx; if (!out || !st) return;
        var ev = document.getElementById('kprsEvent').value, primary, supporting;
        if (ev === 'custom') {
            var num = function (id) { return (document.getElementById(id).value || '').split(/[,\s]+/).map(Number).filter(function (x) { return x >= 1 && x <= 12; }); };
            primary = num('kprsPrimary'); supporting = num('kprsSupport');
            if (!primary.length) { out.innerHTML = '<span style="color:#FF4477;">Enter at least one primary house (1-12).</span>'; return; }
        } else { primary = this.EVENT_PRESETS[ev].primary; supporting = this.EVENT_PRESETS[ev].supporting; }
        var c = st.ctx, lords = (c.mahaLord || c.adLord || c.pdLord) ? { md: c.mahaLord, ad: c.adLord, pd: c.pdLord } : null;
        var ruling = null;
        if (c.transitPlanets && c.transitAsc) { try { ruling = this.rulingPlanets(c.transitPlanets, c.transitAsc.sid, c.now || new Date()); } catch (e) { ruling = null; } }
        var r = this.runChecklist(st.data, { primary: primary, supporting: supporting, lords: lords, rulingPlanets: ruling });
        var e = this._esc, L = this._list, h = '';
        h += '<div><b>Groups:</b> primary ' + L(r.groups.primary) + ' · supporting ' + L(r.groups.supporting) + ' · negating ' + L(r.groups.negating) + ' (strongest: ' + L(r.groups.negatingStrong) + ')</div>';
        h += '<div><b>Cusp ' + r.cuspSubLord.house + ' sub lord:</b> ' + e(r.cuspSubLord.lord) + ' → ' + e(r.cuspSubLord.judgement.verdict) + '</div>';
        h += '<div><b>Fruitful significators:</b> all ' + L(r.fruitful.significators) + ' → after method 1 (drop negating-house significators) ' + L(r.fruitful.afterMethod1) + ' → after method 2 (drop planets in their sub) ' + L(r.fruitful.afterMethod2) + (r.fruitful.afterMethod3 ? ' → ruling planets ' + L(r.fruitful.afterMethod3) : ' (Ruling-Planet filter needs transit data)') + '</div>';
        h += '<div><b>Ranking:</b> ' + (r.fruitful.ranking.map(function (x) { return e(x.planet) + ' (' + x.score + ')'; }).join(', ') || '–') + '</div>';
        if (r.nodeAgentsNeeded.length) h += '<div><b>Node agents involved:</b> ' + r.nodeAgentsNeeded.map(function (a) { return a.node + ' ⇒ H' + a.houses.join(',H'); }).join(' · ') + '</div>';
        h += '<div><b>Independent event houses:</b> ' + (r.independentEventHouses.map(function (x) { return 'H' + x.house + ' (' + x.lord + ')'; }).join(', ') || '–') + '</div>';
        if (r.dba) h += '<div><b>DBA:</b> ' + r.dba.rows.map(function (x) { return x.period + ' ' + e(x.lord) + ': ' + e(x.verdict); }).join(' · ') + ' → <b style="color:' + (r.dba.possible ? '#00DD77' : '#FF9F43') + ';">' + (r.dba.complete ? (r.dba.possible ? 'event possible' : 'at least one period denies/mixes') : 'incomplete (need MD, AD and PD)') + '</b></div>';
        else h += '<div style="color:var(--muted);">DBA needs the running Mahadasha/Antardasha/Pratyantardasha (not available in this panel).</div>';
        h += '<div style="color:var(--muted);">' + e(r.notes.join(' ')) + '</div>';
        out.innerHTML = h;
    }
};

if (typeof window !== 'undefined') {
    window.KP_RESULT_STRENGTH.installHoraryFix();
    if (typeof document !== 'undefined' && document.addEventListener) {
        var _again = function () { window.KP_RESULT_STRENGTH.installHoraryFix(); };
        document.addEventListener('DOMContentLoaded', _again); window.addEventListener('load', _again);
    }
}
if (typeof module !== 'undefined' && module.exports) module.exports = window.KP_RESULT_STRENGTH;
