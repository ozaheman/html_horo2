/**
 * KP_prediction_8.js
 *
 * PART 8 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-7 — reuses window.KP_PREDICTION (Part 1)
 * for house-signification / cusp lookups, and window.KP_PREDICTION_7's
 * house-data builder where possible (falls back to its own copy if
 * Part 7 isn't loaded, so this module stands on its own too).
 *
 * WHAT THIS ADDS
 * ---------------
 * The classic KP "Promise vs Result" distinction, applied to a curated,
 * self-authored set of traditional house-combination events:
 *
 *   - PROMISE is read from the house cusp's Nakshatra Lord (NL / star
 *     lord): does the NL's own house signification touch the event's
 *     required house combination at all?
 *   - RESULT QUALITY is read from the same cusp's Sub Lord (CSL / KP's
 *     "cuspal sub lord"): does the CSL lean toward growth houses
 *     (1-2-5-9-10-11) or trik/difficulty houses (6-8-12) — i.e. if the
 *     promise is there, does it tend to resolve positively, negatively,
 *     or as a mixed bag?
 *
 * Wired into the SAME two existing host panels as Part 7 (Dasha
 * Explorer via main.js, Predictions Dashboard via predictions_ui.js),
 * appended right after Part 7's section, via one function:
 *
 *   window.KP_PREDICTION_8.renderForPanel({ natalPlanets, natalAsc,
 *     sectionClass, instanceId })
 *
 * instanceId keeps DOM ids unique when both host panels render this
 * module at once (their search/detail state is tracked separately).
 *
 * The event list here is a compact, self-authored reference of widely
 * taught KP house combinations (job, marriage, property, litigation,
 * health, foreign travel, etc.) — not a reproduction of any specific
 * published book's combination table.
 */

(function () {
  'use strict';

  var SEQ = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  var HOUSE_MEANING = {
    1: 'self, health, new starts', 2: 'wealth, family, speech, accumulated resources',
    3: 'self-effort, communication, courage, siblings, short travel',
    4: 'home, property, vehicles, mother, inner comfort',
    5: 'creativity, children, romance, speculation, intellect',
    6: 'service, disputes, debts, daily work, health friction',
    7: 'partnership, marriage, business dealings, the public',
    8: 'sudden change, obstacles, inheritance, research, transformation',
    9: 'fortune, father, higher learning, long journeys, dharma',
    10: 'career, status, authority, public recognition',
    11: 'gains, income, fulfillment of desire, networks',
    12: 'expenditure, loss, foreign connection, isolation, closure'
  };
  var GROWTH_HOUSES = [1, 2, 5, 9, 10, 11];
  var TRIK_HOUSES = [6, 8, 12];

  // ================================================================
  // CURATED EVENT LIBRARY (self-authored — traditional, widely-taught
  // KP house combinations; not sourced from any single published work)
  // ================================================================
  var EVENT_LIBRARY = [
    { name: 'New job / entering service', primary_house: 6, houses: [2, 6, 10, 11], note: 'Classic service combination — steady employment.' },
    { name: 'Promotion at work', primary_house: 10, houses: [2, 6, 10, 11], note: 'Same service houses, read through the 10th cusp.' },
    { name: 'Transfer or relocation of job', primary_house: 10, houses: [3, 12], note: '3rd = change of place, 12th = leaving the current base.' },
    { name: 'Job loss / termination', primary_house: 10, houses: [8, 10, 12], note: 'Sudden change (8) and ending (12) touching career (10).' },
    { name: 'Starting own business', primary_house: 7, houses: [7, 10, 11], note: '7th = trade/public dealing, with 10th and 11th for standing and gain.' },
    { name: 'Business loss', primary_house: 7, houses: [6, 8, 12], note: 'Trik houses touching the business significator.' },
    { name: 'Marriage', primary_house: 7, houses: [2, 7, 11], note: 'The standard marriage combination — family (2), partner (7), fulfilment (11).' },
    { name: 'Delay or obstacle in marriage', primary_house: 7, houses: [1, 6, 10], note: 'Obstruction houses opposing 2-7-11.' },
    { name: 'Love marriage', primary_house: 7, houses: [5, 7, 11], note: 'Romance (5) joins the standard partnership houses.' },
    { name: 'Divorce / separation', primary_house: 7, houses: [1, 6, 12], note: 'Self-focus, dispute and separation houses over the partnership.' },
    { name: 'Childbirth', primary_house: 5, houses: [2, 5, 11], note: 'Family increase (2), children (5), fulfilment (11).' },
    { name: 'Obstacle in conceiving / childbirth', primary_house: 5, houses: [1, 5, 12], note: 'Self and loss houses weighing on the 5th.' },
    { name: 'Purchase of property or land', primary_house: 4, houses: [4, 11, 12], note: 'Home (4), gain (11) and outlay (12) together.' },
    { name: 'Sale of property', primary_house: 4, houses: [3, 5, 10], note: 'Effort/negotiation, speculation and transaction houses.' },
    { name: 'Construction of a house', primary_house: 4, houses: [4, 11], note: 'The 4th itself, supported by resources (11).' },
    { name: 'Purchase of a vehicle', primary_house: 4, houses: [3, 4, 11], note: 'Short-distance movement (3) with comfort (4) and gain (11).' },
    { name: 'Short foreign travel', primary_house: 12, houses: [3, 9, 12], note: 'Movement (3), long journey (9) and foreign connection (12).' },
    { name: 'Foreign settlement / immigration', primary_house: 12, houses: [7, 9, 12], note: 'Leaving the home base (12) with 7th/9th for the new country.' },
    { name: 'Higher education / admission', primary_house: 9, houses: [4, 9, 11], note: 'Learning (9) with foundation (4) and fulfilment (11).' },
    { name: 'Competitive exam / selection success', primary_house: 6, houses: [3, 6, 11], note: 'Effort (3), competition (6) and gain (11).' },
    { name: 'Winning a legal case', primary_house: 6, houses: [6, 10, 11], note: 'Victory over opposition (6), with standing (10) and gain (11).' },
    { name: 'Losing a legal case', primary_house: 6, houses: [6, 8, 12], note: 'Trik houses dominating over the 6th.' },
    { name: 'Taking a loan', primary_house: 6, houses: [6, 11], note: 'Debt (6) alongside inflow (11).' },
    { name: 'Clearing a debt', primary_house: 11, houses: [2, 11], note: 'Accumulated resources (2) and gain (11) over the 6th/8th/12th.' },
    { name: 'Recovery from illness', primary_house: 6, houses: [1, 5, 11], note: 'Vitality (1), wellbeing (5) and relief (11) outweighing the 6th.' },
    { name: 'Surgery or hospitalisation', primary_house: 6, houses: [6, 8, 12], note: 'The classic disease/crisis/confinement combination.' },
    { name: 'Accident', primary_house: 8, houses: [6, 8, 12], note: 'Sudden event (8) with the other trik houses.' },
    { name: "Father's health concern", primary_house: 9, houses: [6, 8, 9, 12], note: '9th house (father) afflicted by the trik houses.' },
    { name: "Mother's health concern", primary_house: 4, houses: [4, 6, 8, 12], note: '4th house (mother) afflicted by the trik houses.' },
    { name: "Spouse's health concern", primary_house: 7, houses: [6, 7, 8, 12], note: '7th house (spouse) afflicted by the trik houses.' },
    { name: 'Inheritance', primary_house: 8, houses: [4, 8, 11], note: 'Ancestral property/legacy (8) with home (4) and gain (11).' },
    { name: 'Speculative gain (stocks, lottery)', primary_house: 5, houses: [2, 5, 11], note: 'Speculation (5) with resources (2) and gain (11).' },
    { name: 'Financial loss / heavy expenditure', primary_house: 12, houses: [6, 8, 12], note: 'The trik houses read purely for loss/outflow.' },
    { name: 'Change of residence (without purchase)', primary_house: 4, houses: [4, 12], note: 'Home (4) combined with leaving the previous base (12).' },
    { name: 'New partnership / collaboration', primary_house: 7, houses: [7, 11], note: 'Partnership (7) with fulfilment/networks (11).' }
  ];

  // ================================================================
  // HOUSE DATA / CSL (reuse Part 7 if present; otherwise self-contained)
  // ================================================================
  function ascSidOf(natalAsc) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._ascSidOf === 'function') return window.KP_PREDICTION_7._ascSidOf(natalAsc);
    return (natalAsc && natalAsc.sid !== undefined) ? natalAsc.sid : ((natalAsc && natalAsc.sn) || 0) * 30;
  }

  function buildHouseData(natalPlanets, natalAsc) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._buildHouseData === 'function') {
      var hd = window.KP_PREDICTION_7._buildHouseData(natalPlanets, natalAsc);
      if (hd && Object.keys(hd).length) return hd;
    }
    var houseData = {};
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function' || typeof P1.getPlanetNumbers !== 'function') return houseData;
    try {
      var allCusps = P1.getAllCusps(ascSidOf(natalAsc));
      var planetNumbers = P1.getPlanetNumbers(allCusps) || {};
      Object.keys(planetNumbers).forEach(function (l) { houseData[l] = planetNumbers[l] || []; });
    } catch (e) {
      console.warn('KP_PREDICTION_8: house signification lookup failed', e);
    }
    return houseData;
  }

  function planetQuality(lord, houseData) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._planetQuality === 'function') return window.KP_PREDICTION_7._planetQuality(lord, houseData);
    var houses = houseData[lord] || [];
    var growth = houses.filter(function (h) { return GROWTH_HOUSES.indexOf(h) !== -1; }).length;
    var trik = houses.filter(function (h) { return TRIK_HOUSES.indexOf(h) !== -1; }).length;
    if (growth > trik) return 'Positive';
    if (trik > growth) return 'Negative';
    return 'Mixed';
  }

  // Best-effort extraction of a cusp's NL (star lord) and CSL (sub lord).
  // Tries Part 1's own fields first; falls back to computing the NL from
  // whatever numeric sidereal longitude field the cusp object exposes
  // (standard published nakshatra-lord method — same math used
  // everywhere else in this app for star lords).
  function cuspInfo(houseNum, natalPlanets, natalAsc) {
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function') return { subLord: null, starLord: null };
    var allCusps;
    try { allCusps = P1.getAllCusps(ascSidOf(natalAsc)); } catch (e) { return { subLord: null, starLord: null }; }
    var cusp = allCusps && allCusps[houseNum];
    if (!cusp) return { subLord: null, starLord: null };

    var subLord = cusp.subLord || null;
    var starLord = cusp.starLord || cusp.nakshatraLord || cusp.nlLord || cusp.nl || null;

    if (!starLord) {
      var lonFields = ['sid', 'longitude', 'long', 'lon', 'deg', 'cuspSid', 'cuspDeg', 'cuspLongitude'];
      var lon = null;
      for (var i = 0; i < lonFields.length; i++) {
        if (typeof cusp[lonFields[i]] === 'number') { lon = cusp[lonFields[i]]; break; }
      }
      if (lon !== null) {
        var nakArc = 360 / 27;
        var norm = ((lon % 360) + 360) % 360;
        var nakIndex = Math.floor(norm / nakArc);
        starLord = SEQ[nakIndex % 9];
      }
    }
    return { subLord: subLord, starLord: starLord };
  }

  // ================================================================
  // VERDICT (Promise via NL / Result quality via CSL)
  // ================================================================
  function computeVerdict(event, houseData, nlPlanet, cslPlanet) {
    var nlHouses = nlPlanet ? (houseData[nlPlanet] || []) : [];
    var cslHouses = cslPlanet ? (houseData[cslPlanet] || []) : [];
    var total = event.houses.length;

    var promiseMatched = event.houses.filter(function (h) { return nlHouses.indexOf(h) !== -1; });
    var promiseClass, promiseLabel;
    if (!nlPlanet) { promiseClass = 'kpdx8-verdict-notseen'; promiseLabel = 'NL data unavailable for this house'; }
    else if (promiseMatched.length === total && total > 0) { promiseClass = 'kpdx8-verdict-promised'; promiseLabel = 'Promised \u2014 NL fully signifies this combination'; }
    else if (promiseMatched.length > 0) { promiseClass = 'kpdx8-verdict-partial'; promiseLabel = 'Partly promised \u2014 NL covers ' + promiseMatched.length + '/' + total + ' houses'; }
    else { promiseClass = 'kpdx8-verdict-notseen'; promiseLabel = 'Not promised \u2014 NL does not touch this combination'; }

    var resultMatched = event.houses.filter(function (h) { return cslHouses.indexOf(h) !== -1; });
    var cslQuality = cslPlanet ? planetQuality(cslPlanet, houseData) : 'Mixed';

    var checksHtml = event.houses.map(function (h) {
      var onNL = nlHouses.indexOf(h) !== -1, onCSL = cslHouses.indexOf(h) !== -1;
      var mark = '\u2717', cls = 'no';
      if (onNL && onCSL) { mark = '\u2713\u2713'; cls = 'yes'; }
      else if (onNL || onCSL) { mark = '\u2713'; cls = 'yes'; }
      return '<span class="kpdx8-hcheck ' + cls + '">H' + h + ' ' + mark + (onNL ? ' NL' : '') + (onCSL ? ' CSL' : '') + '</span>';
    }).join('');

    return { promiseClass: promiseClass, promiseLabel: promiseLabel, cslQuality: cslQuality, resultMatched: resultMatched, checksHtml: checksHtml, total: total };
  }

  // ================================================================
  // STYLES
  // ================================================================
  var STYLE_ID = 'kpdx8-style';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.kpdx8-lib-search{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:7px 10px;color:inherit;font-size:11px;font-family:inherit;margin-bottom:6px;box-sizing:border-box;}' +
      '.kpdx8-lib-search:focus{outline:none;border-color:rgba(212,175,90,.4);}' +
      '.kpdx8-lib-count{font-size:9px;color:var(--muted,#9c9484);margin-bottom:6px;}' +
      '.kpdx8-lib-list{max-height:170px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;margin-bottom:4px;}' +
      '.kpdx8-lib-row{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:5px 8px;border-radius:5px;cursor:pointer;border:1px solid transparent;font-size:10px;}' +
      '.kpdx8-lib-row:hover{background:rgba(255,255,255,.04);}' +
      '.kpdx8-lib-row.picked{background:rgba(212,175,90,.09);border-color:rgba(212,175,90,.25);}' +
      '.kpdx8-lib-combo{color:var(--muted,#9c9484);font-size:9px;white-space:nowrap;}' +
      '.kpdx8-lib-badge{font-size:8.5px;padding:1px 7px;border-radius:8px;background:rgba(212,175,90,.08);color:#E4C077;border:1px solid rgba(212,175,90,.22);white-space:nowrap;}' +
      '.kpdx8-lib-detail{margin-top:8px;padding:10px 12px;background:rgba(212,175,90,.05);border:1px solid rgba(212,175,90,.22);border-radius:8px;}' +
      '.kpdx8-lib-detail-title{font-size:12px;color:#E4C077;font-weight:600;margin-bottom:2px;}' +
      '.kpdx8-lib-detail-rule{font-size:9px;color:var(--muted,#9c9484);margin-bottom:8px;}' +
      '.kpdx8-verdict{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;padding:3px 9px;border-radius:12px;margin-bottom:6px;margin-right:6px;font-weight:500;}' +
      '.kpdx8-verdict-promised{background:rgba(212,175,90,.18);color:#E4C077;border:1px solid rgba(212,175,90,.35);}' +
      '.kpdx8-verdict-partial{background:rgba(159,195,217,.13);color:#9FC3D9;border:1px solid rgba(159,195,217,.3);}' +
      '.kpdx8-verdict-notseen{background:rgba(156,148,132,.12);color:var(--muted,#9c9484);border:1px solid rgba(255,255,255,.08);}' +
      '.kpdx8-house-checks{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0;}' +
      '.kpdx8-hcheck{font-size:9px;padding:2px 7px;border-radius:6px;border:1px solid rgba(255,255,255,.08);}' +
      '.kpdx8-hcheck.yes{color:#E4C077;border-color:rgba(212,175,90,.3);background:rgba(212,175,90,.07);}' +
      '.kpdx8-hcheck.no{color:var(--muted,#9c9484);}' +
      '.kpdx8-lib-note{font-size:9px;color:var(--muted,#9c9484);font-style:italic;margin-top:6px;line-height:1.5;}' +
      '.kpdx8-find-timing-btn{background:#C6A15B;color:#0A0A0C;border:none;border-radius:6px;padding:6px 14px;font-weight:600;font-size:10px;cursor:pointer;font-family:inherit;margin-top:8px;}' +
      '.kpdx8-find-timing-btn:hover{background:#E4C077;}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ================================================================
  // STATE + GLOBAL WIRING (inline onclick/oninput, matching this app's
  // existing convention of window.someHandler(...) calls in generated HTML)
  // ================================================================
  var INSTANCES = {};

  function renderLibRows(instanceId, filterText) {
    var st = INSTANCES[instanceId];
    if (!st) return '';
    var q = (filterText || '').trim().toLowerCase();
    var filtered = q.length ? EVENT_LIBRARY.filter(function (e) { return e.name.toLowerCase().indexOf(q) !== -1; }) : EVENT_LIBRARY;
    var shown = filtered.slice(0, 60);
    var countEl = document.getElementById('kpdx8-count-' + instanceId);
    if (countEl) {
      countEl.textContent = q.length === 0
        ? (EVENT_LIBRARY.length + ' events \u2014 type to filter.')
        : (filtered.length + ' match' + (filtered.length !== 1 ? 'es' : ''));
    }
    return shown.map(function (e, idx) {
      var realIdx = EVENT_LIBRARY.indexOf(e);
      return '<div class="kpdx8-lib-row' + (st.pickedIdx === realIdx ? ' picked' : '') + '" onclick="window.KP8_showDetail(\'' + instanceId + '\',' + realIdx + ')">' +
        '<div>' + e.name + '</div>' +
        '<div class="kpdx8-lib-combo">' + e.houses.join('-') + '</div>' +
        '<div class="kpdx8-lib-badge">H' + e.primary_house + ' CSL</div>' +
        '</div>';
    }).join('');
  }

  window.KP8_filterLib = function (instanceId, value) {
    var st = INSTANCES[instanceId];
    if (!st) return;
    var listEl = document.getElementById('kpdx8-list-' + instanceId);
    if (listEl) listEl.innerHTML = renderLibRows(instanceId, value);
  };

  window.KP8_showDetail = function (instanceId, eventIdx) {
    var st = INSTANCES[instanceId];
    if (!st) return;
    st.pickedIdx = eventIdx;
    var event = EVENT_LIBRARY[eventIdx];
    var detailEl = document.getElementById('kpdx8-detail-' + instanceId);
    var listEl = document.getElementById('kpdx8-list-' + instanceId);
    if (listEl) {
      var searchEl = document.getElementById('kpdx8-search-' + instanceId);
      listEl.innerHTML = renderLibRows(instanceId, searchEl ? searchEl.value : '');
    }
    if (!detailEl) return;

    var info = cuspInfo(event.primary_house, st.natalPlanets, st.natalAsc);
    var v = computeVerdict(event, st.houseData, info.starLord, info.subLord);
    var qColor = v.cslQuality === 'Positive' ? '#E4C077' : (v.cslQuality === 'Negative' ? '#ff8f8f' : '#9FC3D9');

    detailEl.innerHTML =
      '<div class="kpdx8-lib-detail-title">' + event.name + '</div>' +
      '<div class="kpdx8-lib-detail-rule">Primary house ' + event.primary_house + ' \u00b7 required combination ' + event.houses.join('-') +
      ' \u00b7 NL (star lord) = <b style="color:#E4C077;">' + (info.starLord || '\u2014') + '</b> \u00b7 CSL (sub lord) = <b style="color:#E4C077;">' + (info.subLord || '\u2014') + '</b></div>' +
      '<div><span class="kpdx8-verdict ' + v.promiseClass + '">Promise (NL): ' + v.promiseLabel + '</span></div>' +
      '<div><span class="kpdx8-verdict" style="border:1px solid ' + qColor + ';color:' + qColor + ';background:rgba(255,255,255,.02);">Result quality (CSL): ' + v.cslQuality +
      (info.subLord ? (' \u2014 ' + info.subLord + ' touches ' + v.resultMatched.length + '/' + v.total + ' of these houses') : '') + '</span></div>' +
      '<div class="kpdx8-house-checks">' + v.checksHtml + '</div>' +
      '<div class="kpdx8-lib-note">\u2713\u2713 = confirmed by both NL and CSL (strongest) \u00b7 single \u2713 = only one level touches it \u00b7 Rule: NL shows whether the event\u2019s domain is promised; CSL decides whether that promise leans positive or negative.</div>' +
      (event.note ? '<div class="kpdx8-lib-note">' + event.note + '</div>' : '') +
      (window.KP_PREDICTION_9 ? ('<button class="kpdx8-find-timing-btn" onclick="window.KP9_applyHouses(\'' + instanceId + '\',\'' + event.houses.join(',') + '\')">Find timing for houses ' + event.houses.join('-') + ' \u2193</button>') : '');
  };

  // ================================================================
  // PUBLIC API — called from renderDashaPanel() / updatePredictionsDisplay()
  // ================================================================
  // ctx: { natalPlanets, natalAsc, sectionClass, instanceId }
  function renderForPanel(ctx) {
    ctx = ctx || {};
    if (!ctx.natalPlanets || !ctx.natalAsc) return '';
    var houseData = buildHouseData(ctx.natalPlanets, ctx.natalAsc);
    if (!Object.keys(houseData).length) return '';

    injectStyles();
    var instanceId = ctx.instanceId || 'default';
    INSTANCES[instanceId] = { natalPlanets: ctx.natalPlanets, natalAsc: ctx.natalAsc, houseData: houseData, pickedIdx: -1 };

    var sectionClass = ctx.sectionClass || 'dt-section';
    var html = '<div class="' + sectionClass + '" style="margin-top:14px;">KP EVENT LIBRARY \u2014 PROMISE (NL) VS RESULT (CSL)</div>';
    html += '<input type="text" class="kpdx8-lib-search" id="kpdx8-search-' + instanceId + '" placeholder="Search an event \u2014 e.g. marriage, promotion, property, litigation\u2026" oninput="window.KP8_filterLib(\'' + instanceId + '\', this.value)">';
    html += '<div class="kpdx8-lib-count" id="kpdx8-count-' + instanceId + '">' + EVENT_LIBRARY.length + ' events \u2014 type to filter.</div>';
    html += '<div class="kpdx8-lib-list" id="kpdx8-list-' + instanceId + '">' + renderLibRows(instanceId, '') + '</div>';
    html += '<div class="kpdx8-lib-detail" id="kpdx8-detail-' + instanceId + '"></div>';

    return html;
  }

  window.KP_PREDICTION_8 = {
    renderForPanel: renderForPanel,
    _events: EVENT_LIBRARY,
    _cuspInfo: cuspInfo,
    _computeVerdict: computeVerdict
  };
})();