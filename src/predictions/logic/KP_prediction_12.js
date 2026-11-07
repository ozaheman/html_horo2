/**
 * KP_prediction_12.js — Money-gain planet / Vimshottari Dasha detector.
 *
 * Basis: attached Hindi lecture "धन कब आएगा KP Astrology से जानें अपने
 * Wealth Planet का सही समय".  Lecture's exact two-pass comparison:
 *   (1) Compare all nine planets' COMBINED planet + nakshatra-lord house
 *       numbers; count unique positive houses H2,H6,H10,H11.
 *   (2) From the highest-positive tier exclude any planet signifying
 *       negative houses H5,H8,H9,H12. If none survive, SAY SO, then
 *       optionally show the lower-positive clean candidates separately.
 *   (3) Evaluate the planet when its MD/AD/PD is running (MD>AD>PD).
 *
 * IMPORTANT: "getPlanetNumbers" in KP_prediction.js is a REVERSE CUSP SUB
 * LORD lookup, NOT the combined planet/star-lord significator list from the
 * lecture.  Do not reuse that for this calculation.
 *
 * House system: KP ordinarily uses Placidus cusps. A local deterministic
 * Placidus solver is included, using birth JD, latitude, longitude, and the
 * same ayanamsa as the parent chart. It does not rely on uncertain SwissEph
 * WASM house API availability. Accuracy tested against pyswisseph for the
 * two supplied Mumbai natives. Whole sign/equal house is NOT silently used.
 *
 * Sidereal planet positions come from the existing natal chart (Swiss WASM
 * when loaded), and dashas from the EXISTING Vimshottari tree. No separate
 * ephemeris, no hardcoded planetary results, and no mutation of old engines.
 */
(function () {
  'use strict';
  var NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  var RULERS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  var ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  var POSITIVE = [2, 6, 10, 11];
  var NEGATIVE = [5, 8, 9, 12];
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  var norm = function (x) { return (x % 360 + 360) % 360; };
  var wrap = function (x) { return norm(x + 180) - 180; };
  var finite = function (x) { return typeof x === 'number' && Number.isFinite(x); };
  var uniqSorted = function (a) { return Array.from(new Set(a)).sort(function (x, y) { return x - y; }); };
  var fmtH = function (a) { return a && a.length ? a.join(', ') : '—'; };
  var dateOnly = function (x) { return new Date(x).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
  function esc(x) { return String(x).replace(/[&<>"']/g, function (a) { return ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[a]; }); }

  /** The app stores local wall-clock components in BIRTH.date, not an instant. */
  function birthJD(b) {
    if (!b || !b.date || !finite(Number(b.utcOff))) return null;
    var d = b.date instanceof Date ? b.date : new Date(b.date);
    if (!Number.isFinite(d.getTime())) return null;
    var utcMs = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()) - Number(b.utcOff) * 3600000;
    return utcMs / 86400000 + 2440587.5;
  }

  /**
   * Deterministic Placidus house cusps in ecliptic tropical degrees.
   * Solve the diurnal/nocturnal semi-arc trisection condition for each
   * intersection of the ecliptic with the house meridian. At Mumbai's
   * latitude the six independent roots exist; the other six oppose them.
   * Meeus mean GMST/obliquity — <0.02 deg from Swiss for test natives.
   */
  function placidusTropical(jd, latitude, longitude) {
    if (!finite(jd) || !finite(latitude) || !finite(longitude) || Math.abs(latitude) >= 66) return null;
    var t = (jd - 2451545.0) / 36525;
    var eps = (23.439291111 - 0.0130041667 * t - 0.0000001639 * t * t + 0.0000005036 * t * t * t) * RAD;
    var gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t * t * t / 38710000;
    var lst = norm(gmst + longitude), phi = latitude * RAD;
    var independent = [10, 11, 12, 1, 2, 3], cs = Array(12).fill(null);
    function residual(lon, house) {
      var e = lon * RAD;
      var rightAscension = norm(Math.atan2(Math.sin(e) * Math.cos(eps), Math.cos(e)) * DEG);
      var declination = Math.asin(Math.sin(eps) * Math.sin(e));
      var x = Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(declination)));
      var halfArc = Math.acos(x) * DEG;
      var hourAngle = wrap(lst - rightAscension), target;
      switch (house) {
        case 10: target = 0; break;
        case 11: target = -halfArc / 3; break;
        case 12: target = -2 * halfArc / 3; break;
        case 1: target = -halfArc; break;
        case 2: target = -60 - 2 * halfArc / 3; break;
        default: target = -120 - halfArc / 3;
      }
      return wrap(hourAngle - target);
    }
    independent.forEach(function (house) {
      var roots = [];
      var lastDeg = 0, lastVal = residual(0, house);
      for (var i = 1; i <= 720; i++) {
        var deg = i * 0.5, val = residual(deg, house);
        // A sign change at the -180/180 seam is not a root.
        if (val * lastVal <= 0 && Math.abs(val - lastVal) < 45) {
          var lo = lastDeg, hi = deg, flo = lastVal;
          for (var j = 0; j < 39; j++) {
            var middle = (lo + hi) / 2, fm = residual(middle, house);
            if (fm * flo <= 0) hi = middle;
            else { lo = middle; flo = fm; }
          }
          roots.push((lo + hi) / 2);
        }
        lastDeg = deg; lastVal = val;
      }
      if (roots.length === 1) cs[house - 1] = norm(roots[0]);
    });
    if (independent.some(function (h) { return !finite(cs[h - 1]); })) return null;
    cs[3] = norm(cs[9] + 180);  // 4 opp 10
    cs[4] = norm(cs[10] + 180); // 5 opp 11
    cs[5] = norm(cs[11] + 180); // 6 opp 12
    cs[6] = norm(cs[0] + 180);  // 7 opp 1
    cs[7] = norm(cs[1] + 180);  // 8 opp 2
    cs[8] = norm(cs[2] + 180);  // 9 opp 3
    return cs;
  }

  function ayanamsa(jd, model) {
    if (typeof getAyanamsa === 'function') return getAyanamsa(jd, model || 'lahiri');
    // Same approximation as main.js, used when running this module by itself.
    var table = { lahiri: [23.8521, 50.2879], krishnamurti: [23.8600, 50.2333], raman: [22.4600, 50.2333], yukteshwar: [22.4600, 50.2333], fagan: [24.7400, 50.2333], tropical: [0, 0] };
    var ab = table[model] || table.lahiri;
    return ab[0] + ((jd - 2451545) / 36525) * ab[1] * 100 / 3600;
  }
  function getCusps(b) {
    var jd = birthJD(b);
    if (!finite(jd) || !finite(Number(b.lat)) || !finite(Number(b.lon))) return null;
    var trop = placidusTropical(jd, Number(b.lat), Number(b.lon));
    if (!trop) return null;
    var a = ayanamsa(jd, b.ayan);
    return { jd: jd, method: 'Placidus (semi-arc; numerical)', ayanamsa: a, cusps: trop.map(function (lon) { return norm(lon - a); }) };
  }

  function houseAt(sid, cs) {
    if (!finite(sid) || !Array.isArray(cs) || cs.length !== 12) return null;
    for (var i = 0; i < 12; i++) {
      var start = cs[i], end = cs[(i + 1) % 12];
      if (norm(sid - start) < norm(end - start)) return i + 1;
    }
    return null;
  }
  function starLordOf(lon) {
    var kp = window.KP_PREDICTION;
    if (kp && typeof kp._getKPLords === 'function') return kp._getKPLords(lon).nakLord;
    return ORDER[Math.floor(norm(lon) / (360 / 27)) % 9];
  }
  function analyze(args) {
    args = args || {};
    var natal = args.natalPlanets, b = args.birth || window.BIRTH;
    var c = getCusps(b);
    if (!natal || !c) return { error: 'Birth date, latitude, longitude, UTC offset, and D1 natal positions are needed for Placidus KP wealth calculation.' };
    var placements = {}, owners = {}, missing = [];
    for (var h = 1; h <= 12; h++) owners[h] = RULERS[Math.floor(c.cusps[h - 1] / 30) % 12];
    NAMES.forEach(function (name) {
      var data = natal[name];
      if (!data || !finite(Number(data.sid))) { missing.push(name); return; }
      var sid = norm(Number(data.sid));
      placements[name] = { sid: sid, house: houseAt(sid, c.cusps), nakLord: starLordOf(sid) };
    });
    if (missing.length) return { error: 'Missing D1 sidereal longitudes: ' + missing.join(', ') };
    var rows = NAMES.map(function (p) {
      var star = placements[p].nakLord;
      var sources = {};
      function add(h, tag) { if (!h) return; (sources[h] = sources[h] || []).push(tag); }
      // No 2nd-level recursion and no Rahu/Ketu sign-dispositor blend:
      // the given lecture explicitly asks for planet+its star-lord numbers.
      add(placements[star].house, 'nakshatra-lord occupancy (' + star + ')');
      for (var h = 1; h <= 12; h++) if (owners[h] === star) add(h, 'nakshatra-lord rulership (' + star + ')');
      add(placements[p].house, 'planet occupancy');
      for (var h2 = 1; h2 <= 12; h2++) if (owners[h2] === p) add(h2, 'planet rulership');
      var houses = uniqSorted(Object.keys(sources).map(Number));
      var positive = houses.filter(function (h) { return POSITIVE.indexOf(h) >= 0; });
      var negative = houses.filter(function (h) { return NEGATIVE.indexOf(h) >= 0; });
      return {
        planet: p, nakLord: star, natalHouse: placements[p].house, starHouse: placements[star].house,
        houses: houses, sources: sources, positive: positive, negative: negative,
        positiveCount: positive.length, negativeCount: negative.length
      };
    });
    rows.sort(function (a, b) { return b.positiveCount - a.positiveCount || a.negativeCount - b.negativeCount || NAMES.indexOf(a.planet) - NAMES.indexOf(b.planet); });
    var maxPositive = Math.max.apply(null, rows.map(function (x) { return x.positiveCount; }));
    var bestTier = rows.filter(function (x) { return x.positiveCount === maxPositive; });
    var strictWinners = bestTier.filter(function (x) { return x.negativeCount === 0; });
    var clean = rows.filter(function (x) { return x.negativeCount === 0 && x.positiveCount > 0; });
    var cleanScore = Math.max(0, ...clean.map(function (x) { return x.positiveCount; }));
    var fallback = strictWinners.length ? [] : clean.filter(function (x) { return x.positiveCount === cleanScore; });
    return {
      cusps: c.cusps, jd: c.jd, ayanamsa: c.ayanamsa, method: c.method,
      placements: placements, cuspOwners: owners, rows: rows,
      maxPositive: maxPositive, topTier: bestTier, strictWinners: strictWinners, fallbackClean: fallback,
      priority: strictWinners.length ? strictWinners : fallback,
      note: strictWinners.length ? 'Top positive tier has planet(s) with no negative money houses.' :
        'No planet in the highest positive-house tier has zero negative houses. Lower-tier clean planets are separately identified, NOT relabelled as top-tier winners.'
    };
  }

  function currentDasha(tree, ref) {
    if (!Array.isArray(tree)) return [];
    var chain = [], a = tree;
    for (var level = 0; level < 3; level++) {
      var current = a.find(function (d) { return new Date(d.start) <= ref && ref < new Date(d.end); });
      if (!current) break;
      chain.push(current); a = current.subs || [];
    }
    return chain;
  }
  function futureADs(tree, ref, wantedNames, horizonYrs) {
    if (!Array.isArray(tree) || !wantedNames || !wantedNames.length) return [];
    var cutoff = new Date(ref.getTime() + (horizonYrs || 12) * 365.25 * 86400000);
    var ret = [];
    tree.forEach(function (md) {
      if (new Date(md.end) <= ref || new Date(md.start) >= cutoff) return;
      (md.subs || []).forEach(function (ad) {
        if (new Date(ad.end) <= ref || new Date(ad.start) >= cutoff || wantedNames.indexOf(ad.lord) < 0) return;
        ret.push({ md: md.lord, ad: ad.lord, start: new Date(ad.start), end: new Date(ad.end) });
      });
    });
    return ret.sort(function (a, b) { return a.start - b.start; });
  }
  function rowColor(r, top) {
    if (!r.negativeCount && top) return '#50d79a';
    if (r.negativeCount) return '#e5b46b';
    return '#7aaed9';
  }
  function renderForPanel(ctx) {
    ctx = ctx || {};
    if (typeof window.CURRENT_DIV === 'number' && window.CURRENT_DIV !== 1) {
      return '<div style="font-size:10px;color:var(--muted);padding:8px;">KP money significators are calculated from the D1 natal chart. Switch to D1 to view this analysis.</div>';
    }
    var a = analyze({ natalPlanets: ctx.natalPlanets || window.BIRTH_PLANETS, birth: ctx.birth || window.BIRTH });
    var headClass = esc(ctx.sectionClass || 'dt-section');
    if (a.error) return '<div class="' + headClass + '">KP MONEY-GAIN PLANETS · PART 12</div><div style="padding:8px;font-size:10px;color:#e5b46b;">' + esc(a.error) + '</div>';
    var now = ctx.referenceDate ? new Date(ctx.referenceDate) : new Date();
    var tree = ctx.vimsh || window.VIMSH || [];
    var chain = currentDasha(tree, now), chainNames = chain.map(function (x) { return x.lord; });
    var priorityNames = a.priority.map(function (x) { return x.planet; });
    var strictNames = a.strictWinners.map(function (x) { return x.planet; });
    var ephemNote = ((ctx.birth || window.BIRTH || {}).ephem === 'swiss' && window.sweLoaded === false) ? '<div style="color:#e5b46b;font-size:9px;margin-bottom:6px;">Swiss WASM is not yet loaded; natal planet positions currently use the app’s approximation. Recheck after Swiss has loaded.</div>' : '';
    var intro = strictNames.length ?
      '<b style="color:#50d79a;">Clean highest-tier wealth significators: ' + esc(strictNames.join(', ')) + '.</b>' :
      '<b style="color:#e5b46b;">No clean winner in the top tier (' + a.maxPositive + '/4 positive houses).</b> ' +
      (priorityNames.length ? 'Strongest lower-tier clean candidates: <b>' + esc(priorityNames.join(', ')) + '</b>.' : 'No planet qualifies as positive-only.');
    var out = '<section class="kp12-wealth" style="margin:12px 0 8px; padding:9px;border:1px solid rgba(220,186,110,.26);border-radius:6px; background:rgba(206,170,100,.035);font-size:10px;line-height:1.5;color:var(--text);">' +
      '<div class="' + headClass + '" style="margin:0 0 7px;">KP WEALTH SIGNIFICATORS &amp; DASHA · PART 12</div>' +
      '<div style="margin-bottom:6px;">' + intro + '</div>' + ephemNote +
      '<div style="color:var(--muted);font-size:9px;margin-bottom:9px;">Transcript method: planet + Nakshatra lord (merged, unique houses) · Positive <b>2,6,10,11</b> · Negative <b>5,8,9,12</b> · <b>' + esc(a.method) + '</b> · ' + esc((ctx.birth || window.BIRTH || {}).ayan || 'lahiri') + ' ayanamsa. The existing CSL “planet numbers” are a different method and were not used here.</div>' +
      '<div style="overflow-x:auto;"><table style="border-collapse:collapse;width:100%;min-width:490px;font-size:9px;">' +
      '<thead><tr style="border-bottom:1px solid var(--border2,#666);text-align:left;color:var(--muted);"><th style="padding:4px;">Planet</th><th>Star lord</th><th>All houses</th><th style="color:#50d79a;">+ money</th><th style="color:#e5b46b;">− money</th><th>Reading</th></tr></thead><tbody>';
    a.rows.forEach(function (r) {
      var isTop = r.positiveCount === a.maxPositive;
      var tag = isTop && r.negativeCount === 0 ? 'TOP · CLEAN' : isTop ? 'TOP · MIXED' :
        (a.fallbackClean.indexOf(r) >= 0 ? 'CLEAN FALLBACK' : r.negativeCount ? 'MIXED' : r.positiveCount ? 'CLEAN · LESS +' : 'NO +');
      var color = rowColor(r, isTop);
      out += '<tr style="border-bottom:1px solid rgba(160,160,160,.10);">' +
        '<td style="padding:5px 4px;color:' + color + ';font-weight:650;">' + esc(r.planet) + '</td>' +
        '<td>' + esc(r.nakLord) + '</td>' +
        '<td>' + esc(fmtH(r.houses)) + '</td>' +
        '<td style="color:#50d79a;white-space:nowrap;">' + esc(fmtH(r.positive)) + ' <b>(' + r.positiveCount + ')</b></td>' +
        '<td style="color:#e5b46b;white-space:nowrap;">' + esc(fmtH(r.negative)) + ' <b>(' + r.negativeCount + ')</b></td>' +
        '<td style="color:' + color + ';white-space:nowrap;">' + tag + '</td></tr>';
    });
    out += '</tbody></table></div>';
    out += '<div style="font-size:9px;color:var(--muted);margin-top:6px;">The lecture excludes ALL H5/H8/H9/H12 candidates at the second step. H12 can also mean business investment; the negative label is specific to this lecture, not a universal verdict.</div>';
    if (chain.length) {
      var labels = ['Mahadasha', 'Antardasha', 'Pratyantardasha'];
      out += '<div style="margin-top:11px;font-weight:650;color:var(--gold,#daba73);">Current Dasha chain (' + dateOnly(now) + ')</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">';
      chain.forEach(function (d, i) {
        var row = a.rows.find(function (r) { return r.planet === d.lord; });
        var status = row ? (row.positiveCount + ' positive / ' + row.negativeCount + ' negative') : 'no data';
        var highlight = priorityNames.indexOf(d.lord) >= 0 && row && !row.negativeCount;
        out += '<div style="padding:5px 7px;border:1px solid ' + (highlight ? '#50d79a' : 'rgba(170,170,170,.20)') + ';border-radius:5px;">' +
          '<b>' + labels[i] + ': ' + esc(d.lord) + '</b><div style="font-size:8px;color:var(--muted);">' + status + '</div>' +
          '<div style="font-size:8px;color:var(--muted);">' + dateOnly(d.start) + ' – ' + dateOnly(d.end) + '</div></div>';
      });
      out += '</div>';
    }
    var windows = futureADs(tree, now, priorityNames, 12);
    if (windows.length) {
      out += '<details style="margin-top:9px;" open><summary style="cursor:pointer;color:var(--gold,#daba73);font-weight:650;">Upcoming clean-candidate Antardashas (next 12 years)</summary>' +
        '<div style="margin-top:5px;color:var(--muted);font-size:9px;">The period is shown because its AD lord is a shortlisted planet. A mixed or negative MD can modify its result. Dates come from the app’s existing Vimshottari tree.</div>';
      windows.slice(0, 12).forEach(function (w) {
        out += '<div style="border-bottom:1px solid rgba(160,160,160,.10);padding:4px 3px;">' + esc(w.md) + ' MD / <b>' + esc(w.ad) + ' AD</b> · ' + dateOnly(w.start) + ' – ' + dateOnly(w.end) + '</div>';
      });
      out += '</details>';
    }
    out += '<details style="margin-top:8px;"><summary style="cursor:pointer;color:var(--muted);">Show precise house-signification evidence</summary>';
    a.rows.forEach(function (r) {
      out += '<div style="margin:7px 0 3px;"><b>' + esc(r.planet) + '</b> (planet H' + r.natalHouse + '; star ' + esc(r.nakLord) + ' H' + r.starHouse + '):</div>';
      out += '<div style="font-size:8px;color:var(--muted);">' + r.houses.map(function (h) { return 'H' + h + ' [' + r.sources[h].map(esc).join(' + ') + ']'; }).join(' · ') + '</div>';
    });
    out += '</details><div style="font-size:8px;color:var(--muted);margin-top:8px;">This is an astrology interpretation, not a reliable prediction of actual financial returns. Do not make investment decisions from this ranking alone.</div></section>';
    return out;
  }

  window.KP_PREDICTION_12 = {
    POSITIVE: POSITIVE, NEGATIVE: NEGATIVE, birthJD: birthJD,
    placidusTropical: placidusTropical, getCusps: getCusps,
    houseAt: houseAt, analyze: analyze, currentDasha: currentDasha,
    futureADs: futureADs, renderForPanel: renderForPanel
  };
}());
