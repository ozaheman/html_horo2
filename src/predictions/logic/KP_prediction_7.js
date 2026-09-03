/**
 * KP_prediction_7.js
 *
 * PART 7 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-6 — reuses window.KP_PREDICTION (Part 1)
 * for house-signification / CSL lookups.
 *
 * WHAT THIS ADDS
 * ---------------
 * A single reusable renderer, window.KP_PREDICTION_7.renderForPanel(ctx),
 * wired into TWO existing host panels — not a separate modal:
 *
 *   - main.js's renderDashaPanel() (container #dashaPanelContent, the
 *     "DASHA EXPLORER" button) — passes the live refV/refAD/refPD/
 *     refSD/refPra lords it already computes from VIMSH/getVimsh.
 *   - predictions_ui.js's updatePredictionsDisplay() KP mode (container
 *     #predictionsPanel, the "PREDICTIONS" button, same block that
 *     already chains KP_PREDICTION through KP_PREDICTION_6) — passes
 *     the live dashaInfo.mahadasha/antardasha/pratyantar/sukshma/prana
 *     lords it already computes via PREDICTION_FORECASTING.
 *
 * Each caller passes ctx.sectionClass so the section headers this
 * module renders match that host panel's native heading style
 * ('dt-section' in the Dasha Explorer, 'pred-section-title' in the
 * Predictions Dashboard).
 *
 * Each call appends two sections at the bottom of that panel:
 *
 *   1. "KP EVENT READING — CURRENT RUNNING CHAIN": the houses signified
 *      by EVERY level of the currently-open Vimshottari chain, plus a
 *      plain-language interpretive reading (live, from real house
 *      significations pulled via KP_PREDICTION's getAllCusps /
 *      getPlanetNumbers — nothing hardcoded to one chart).
 *
 *   2. "KP RULE READING (10th CSL, live)": two dynamically-computed KP
 *      rule cards — Job vs Business leaning, and Transfer & Promotion
 *      signature — based on the actual 10th cuspal sub-lord of
 *      whichever chart is currently loaded.
 *
 * Degrades gracefully (returns '') if KP_PREDICTION (Part 1), or the
 * natal chart, isn't available yet.
 */

(function () {
  'use strict';

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
  var PLANET_FLAVOR = {
    Sun: 'authority, government, visibility, the father figure',
    Moon: 'mind, public dealing, fluctuation, travel, the mother figure',
    Mars: 'action, urgency, property, conflict or courage, technical skill',
    Mercury: 'communication, contracts, trade, analysis, short-distance movement',
    Jupiter: 'expansion, guidance, higher learning, finance, institutions',
    Venus: 'comfort, relationships, creativity, aesthetics, money',
    Saturn: 'delay, structure, long-term responsibility, labour, restriction',
    Rahu: 'the unconventional, foreign elements, sudden ambition, technology',
    Ketu: 'detachment, research, technical mastery, endings, the unseen'
  };
  var RISE_HOUSES = [2, 6, 10, 11];
  var GAIN_HOUSES = [2, 6, 11];
  var FRICTION_HOUSES = [5, 8, 12];
  var HEALTH_HOUSES = [6, 8, 12];
  var PROPERTY_HOUSES = [4, 11, 12];
  var MARRIAGE_HOUSES = [2, 7, 11];
  var FOREIGN_HOUSES = [3, 9, 12];
  var GROWTH_HOUSES = [1, 2, 5, 9, 10, 11];
  var TRIK_HOUSES = [6, 8, 12];

  // ================================================================
  // LIVE HOUSE SIGNIFICATIONS (from KP_PREDICTION Part 1, if present)
  // ================================================================
  function ascSidOf(natalAsc) {
    return (natalAsc && natalAsc.sid !== undefined) ? natalAsc.sid : ((natalAsc && natalAsc.sn) || 0) * 30;
  }

  function buildHouseData(natalPlanets, natalAsc) {
    var houseData = {};
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function' || typeof P1.getPlanetNumbers !== 'function') return houseData;
    try {
      var allCusps = P1.getAllCusps(ascSidOf(natalAsc));
      var planetNumbers = P1.getPlanetNumbers(allCusps) || {};
      Object.keys(planetNumbers).forEach(function (l) { houseData[l] = planetNumbers[l] || []; });
    } catch (e) {
      console.warn('KP_PREDICTION_7: house signification lookup failed', e);
    }
    return houseData;
  }

  // Determining planet (CSL-style) for a given house cusp, via Part 1's
  // precise resolver, when available.
  function resolveHouseCSL(houseNum, natalPlanets, natalAsc) {
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function' || typeof P1.resolveDeterminingPlanetPrecise !== 'function') return null;
    try {
      var allCusps = P1.getAllCusps(ascSidOf(natalAsc));
      var resolved = P1.resolveDeterminingPlanetPrecise(houseNum, allCusps, natalPlanets);
      if (!resolved) return null;
      return { csl: allCusps[houseNum] && allCusps[houseNum].subLord, determiningPlanet: resolved.determiningPlanet };
    } catch (e) {
      console.warn('KP_PREDICTION_7: CSL resolution failed for house ' + houseNum, e);
      return null;
    }
  }

  function commonHouses(houseArrays) {
    if (!houseArrays.length) return [];
    var sets = houseArrays.map(function (arr) { return new Set(arr || []); });
    var common = [].concat(Array.from(sets[0]));
    for (var i = 1; i < sets.length; i++) common = common.filter(function (h) { return sets[i].has(h); });
    return common.sort(function (a, b) { return a - b; });
  }

  function predictionText(chainLords, houses) {
    if (houses.length === 0) {
      return 'No single house is signified by every lord in this chain — the levels are pulling toward different life areas at once, so read them as separate, smaller threads rather than one concentrated event.';
    }
    var parts = houses.map(function (h) { return '<b>House ' + h + '</b> (' + HOUSE_MEANING[h] + ')'; });
    var lastTwo = chainLords.slice(-2);
    var flavor = lastTwo.map(function (l) { return PLANET_FLAVOR[l] || ''; }).join(' combined with ');
    var finest = chainLords[chainLords.length - 1];
    return 'The houses that stay active across every level of this chain are ' + parts.join(', ') +
      '. With <b>' + finest + '</b> as the finest running lord — carrying ' + (PLANET_FLAVOR[finest] || '') +
      ' — this window leans toward developments in that house\u2019s domain, coloured by ' + flavor + '.';
  }

  function ruleBadge(lord, houseData) {
    var houses = houseData[lord] || [];
    var hasN = function (arr) { return arr.filter(function (h) { return houses.indexOf(h) !== -1; }).length; };
    var tags = [];
    if (hasN(RISE_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-rise">rise</span>');
    if (hasN(GAIN_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-gain">gain</span>');
    if (hasN(FRICTION_HOUSES) >= 2 || hasN(HEALTH_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-friction">friction</span>');
    if (hasN(HEALTH_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-health">health</span>');
    if (houses.indexOf(3) !== -1) tags.push('<span class="kpdx-tag kpdx-tag-transfer">transfer</span>');
    if (hasN(PROPERTY_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-property">property</span>');
    if (hasN(MARRIAGE_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-marriage">marriage</span>');
    if (hasN(FOREIGN_HOUSES) >= 2) tags.push('<span class="kpdx-tag kpdx-tag-foreign">foreign</span>');
    return tags.slice(0, 4).join('');
  }

  // Positive / Negative / Mixed outlook for a lord, from its own house
  // mix: growth houses (1-2-5-9-10-11) vs trik/difficulty houses (6-8-12).
  function planetQuality(lord, houseData) {
    var houses = houseData[lord] || [];
    var growth = houses.filter(function (h) { return GROWTH_HOUSES.indexOf(h) !== -1; }).length;
    var trik = houses.filter(function (h) { return TRIK_HOUSES.indexOf(h) !== -1; }).length;
    if (growth > trik) return 'Positive';
    if (trik > growth) return 'Negative';
    return 'Mixed';
  }

  function outlookBadge(lord, houseData) {
    var q = planetQuality(lord, houseData);
    var cls = q === 'Positive' ? 'kpdx-tag-outlook-pos' : (q === 'Negative' ? 'kpdx-tag-outlook-neg' : 'kpdx-tag-outlook-mix');
    return '<span class="kpdx-tag ' + cls + '">' + q + '</span>';
  }

  // ================================================================
  // DYNAMIC KP RULE CARDS (Job vs Business, Transfer/Promotion)
  // ================================================================
  function buildRuleCards(natalPlanets, natalAsc) {
    var tenth = resolveHouseCSL(10, natalPlanets, natalAsc);
    if (!tenth) return '';
    var P1 = window.KP_PREDICTION;
    var allCusps, planetNumbers;
    try {
      allCusps = P1.getAllCusps(ascSidOf(natalAsc));
      planetNumbers = P1.getPlanetNumbers(allCusps) || {};
    } catch (e) { return ''; }
    var houses = planetNumbers[tenth.determiningPlanet] || [];

    var jobHouses = [2, 6, 10, 11].filter(function (h) { return houses.indexOf(h) !== -1; });
    var businessHouses = [7, 9, 10, 11].filter(function (h) { return houses.indexOf(h) !== -1; });
    var jobLean = jobHouses.length >= businessHouses.length;

    var cards = '';
    cards += '<div class="kpdx-rule-card">' +
      '<h3>Job vs Business \u2014 10th CSL ' + tenth.determiningPlanet + ' (H' + (houses.join(',H') || '\u2014') + ')</h3>' +
      '<div class="kpdx-rule-verdict">' + (jobLean ? 'Service / employment leaning' : 'Independent / business leaning') + '</div>' +
      '<p>10th CSL links to ' + (jobHouses.length ? 'H' + jobHouses.join(',H') : 'none of 2-6-10-11') +
      ' (service signature) and ' + (businessHouses.length ? 'H' + businessHouses.join(',H') : 'none of 7-9-10-11') +
      ' (business signature). ' +
      (jobLean
        ? 'The service-side houses are better represented here, so a structured job or salaried role fits the current running lord\u2019s significations more naturally than an independent venture.'
        : 'The business-side houses are better represented here, so independent or partnership-based work fits the current running lord\u2019s significations more naturally than a fixed salaried role.') +
      '</p></div>';

    var transferProne = houses.indexOf(3) !== -1 || houses.indexOf(12) !== -1;
    var promotionSignature = [2, 6, 10, 11].filter(function (h) { return houses.indexOf(h) !== -1; }).length >= 2;
    cards += '<div class="kpdx-rule-card">' +
      '<h3>Transfer &amp; Promotion</h3>' +
      '<div class="kpdx-rule-verdict">' + (transferProne ? 'Transfer/relocation-prone' : 'Low transfer signature') +
      ' \u00b7 ' + (promotionSignature ? 'promotion signature present' : 'weak promotion signature') + '</div>' +
      '<p>10th CSL ' + tenth.determiningPlanet + (transferProne ? ' touches the 3rd/12th house axis, favouring movement or relocation-linked developments' : ' does not strongly touch the 3rd/12th house axis') +
      ', most active whenever ' + tenth.determiningPlanet + '\u2019s own periods (Mahadasha/Antardasha) are running.</p></div>';

    return cards;
  }

  // ================================================================
  // STYLES (scoped under kpdx- so they can't collide with main.css)
  // ================================================================
  var STYLE_ID = 'kpdx-style';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.kpdx-no-chip{font-size:9px;color:var(--muted);font-style:italic;}' +
      '.kpdx-tag{display:inline-block;font-size:7px;padding:1px 5px;border-radius:8px;margin-left:5px;vertical-align:middle;text-transform:uppercase;letter-spacing:.03em;}' +
      '.kpdx-tag-rise{background:rgba(0,221,119,.15);color:#4ee89a;}' +
      '.kpdx-tag-gain{background:rgba(228,192,119,.15);color:#E4C077;}' +
      '.kpdx-tag-friction{background:rgba(255,90,90,.15);color:#ff8080;}' +
      '.kpdx-tag-health{background:rgba(255,150,90,.15);color:#ffab80;}' +
      '.kpdx-tag-transfer{background:rgba(127,166,255,.15);color:#8fb4ff;}' +
      '.kpdx-tag-property{background:rgba(159,195,217,.15);color:#9FC3D9;}' +
      '.kpdx-tag-marriage{background:rgba(228,150,220,.15);color:#e496dc;}' +
      '.kpdx-tag-foreign{background:rgba(142,197,157,.15);color:#8ec59d;}' +
      '.kpdx-tag-outlook-pos{background:rgba(228,192,119,.18);color:#E4C077;}' +
      '.kpdx-tag-outlook-neg{background:rgba(255,90,90,.18);color:#ff8080;}' +
      '.kpdx-tag-outlook-mix{background:rgba(159,195,217,.18);color:#9FC3D9;}' +
      '.kpdx-predict-box{margin-top:6px;padding:8px 10px;border-radius:6px;background:rgba(212,175,90,.06);border:1px solid rgba(212,175,90,.22);}' +
      '.kpdx-predict-chain{font-size:10.5px;margin-bottom:6px;}' +
      '.kpdx-predict-houses{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;}' +
      '.kpdx-predict-house-chip{font-size:8.5px;background:rgba(255,255,255,.05);border-radius:8px;padding:2px 6px;display:inline-block;margin:0 3px 3px 0;}' +
      '.kpdx-predict-text{font-size:9.5px;line-height:1.55;color:var(--text,#d8d0bd);}' +
      '.kpdx-predict-note{font-size:8.5px;color:var(--muted);margin-top:6px;font-style:italic;}' +
      '.kpdx-rule-card{border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:8px 10px;margin-top:8px;}' +
      '.kpdx-rule-card h3{margin:0 0 3px;font-size:10px;color:#E4C077;}' +
      '.kpdx-rule-verdict{font-size:8.5px;color:var(--muted);margin-bottom:4px;}' +
      '.kpdx-rule-card p{margin:0;font-size:9.5px;line-height:1.55;color:var(--text,#d8d0bd);}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ================================================================
  // PUBLIC API — called from renderDashaPanel() in main.js
  // ================================================================
  // ctx: { mahaLord, adLord, pdLord, sdLord, praLord, natalPlanets, natalAsc }
  function renderForPanel(ctx) {
    ctx = ctx || {};
    var chain = [ctx.mahaLord, ctx.adLord, ctx.pdLord, ctx.sdLord, ctx.praLord].filter(Boolean);
    if (!chain.length || !ctx.natalPlanets || !ctx.natalAsc) return '';

    var houseData = buildHouseData(ctx.natalPlanets, ctx.natalAsc);
    if (!Object.keys(houseData).length) return '';

    injectStyles();

    var sectionClass = ctx.sectionClass || 'dt-section';
    var common = commonHouses(chain.map(function (l) { return houseData[l] || []; }));
    var chainHtml = chain.map(function (l) { return '<b>' + l + '</b>' + ruleBadge(l, houseData) + outlookBadge(l, houseData); }).join(' \u2192 ');

    var html = '<div class="' + sectionClass + '" style="margin-top:14px;">KP EVENT READING \u2014 CURRENT RUNNING CHAIN</div>';
    html += '<div class="kpdx-predict-box">' +
      '<div class="kpdx-predict-chain">' + chainHtml + '</div>' +
      '<div class="kpdx-predict-houses">' + (common.length ? common.map(function (h) { return '<span class="kpdx-predict-house-chip">House ' + h + ' \u2014 ' + HOUSE_MEANING[h] + '</span>'; }).join('') : '<span class="kpdx-no-chip">No house common to the whole chain</span>') + '</div>' +
      '<div class="kpdx-predict-text">' + predictionText(chain, common) + '</div>' +
      '<div class="kpdx-predict-note">KP practitioners treat the finest running lord (here: ' + chain[chain.length - 1] + ') as the trigger and the common house(s) as the domain of the event \u2014 this is a traditional interpretive reading, not a guaranteed outcome.</div>' +
      '</div>';

    var ruleCardsHtml = buildRuleCards(ctx.natalPlanets, ctx.natalAsc);
    if (ruleCardsHtml) {
      html += '<div class="' + sectionClass + '" style="margin-top:10px;">KP RULE READING (10th CSL, live)</div>' + ruleCardsHtml;
    }

    return html;
  }

  window.KP_PREDICTION_7 = {
    renderForPanel: renderForPanel,
    _buildHouseData: buildHouseData,
    _resolveHouseCSL: resolveHouseCSL,
    _ascSidOf: ascSidOf,
    _planetQuality: planetQuality,
    _outlookBadge: outlookBadge,
    _houseMeaning: HOUSE_MEANING
  };
})();