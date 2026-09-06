/**
 * KP_prediction_9.js
 *
 * PART 9 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-8 — reuses window.VIMSH (main.js's own
 * precomputed Vimshottari tree, already built five levels deep: Maha-
 * dasha → Antardasha → Pratyantardasha → Sukshma → Pran, via each
 * node's .subs array) and window.KP_PREDICTION_7 / _8's house-data
 * builder.
 *
 * WHAT THIS ADDS
 * ---------------
 * An "Event Timing Finder": pick a set of houses (by hand, or sent
 * straight from a Part 8 event-library entry via window.KP9_applyHouses),
 * and it searches the ENTIRE real Mahadasha–Antardasha–Pratyantardasha
 * tree for every period where the three running lords jointly signify
 * every selected house. Because window.VIMSH already stores the full
 * tree five levels deep, each match can then be drilled straight down
 * through the real Sukshma and Pran nodes (levels 4 and 5) to see
 * exactly where the combination still holds at the finest level —
 * no on-the-fly recomputation, all five levels come from the same
 * tree the Dasha Explorer itself uses.
 *
 * PROMISE vs RESULT (corrected to the standard KP dictum): for each
 * matched period, a selected house is "promised" if any of the three
 * running lords is that house cusp's Nakshatra/Star Lord (NL) — the
 * NL shows what result a house is trying to deliver. Whether that
 * promise actually fructifies, and how favourably, is read from the
 * cusp's Sub Lord (CSL) instead — the sub lord is KP's decisive
 * authority for fulfilment. Every result row shows both: a Promise
 * (NL) tag on the collapsed row, and a fuller Promise/Result (CSL
 * quality) breakdown once expanded — separate from, and in addition
 * to, the existing Strong/Good badge, which uses the classic 4-level
 * occupant/owner significator method rather than cuspal NL/CSL.
 *
 * When houses arrive from a Part 8 event via window.KP9_applyHouses
 * with that event's named planets, a static "Combination & strength
 * check" panel is also shown (drishti/occupation from the natal chart,
 * strength via window.SHADBALA) — reusing Part 8's own engine exactly,
 * since that check doesn't vary by which dasha period is open.
 *
 * Wired the same way as Parts 7-8: window.KP_PREDICTION_9.renderForPanel
 * is called from renderDashaPanel() (main.js) and the Predictions
 * Dashboard's KP block (predictions_ui.js), right after Part 8.
 */

(function () {
  'use strict';

  var HOUSE_SHORT = {
    1: 'self, health', 2: 'wealth, family', 3: 'effort, comms', 4: 'home, property',
    5: 'children, creativity', 6: 'service, disease', 7: 'partner, marriage', 8: 'crisis, transformation',
    9: 'fortune, father', 10: 'career, status', 11: 'gains, income', 12: 'loss, foreign'
  };
  var LEVEL_NAME = { md: 'Mahadasha', ad: 'Antardasha', pd: 'Pratyantardasha', sd: 'Sukshma', pra: 'Pran' };
  var MAX_RESULTS = 40;

  // ================================================================
  // HOUSE DATA (reuse Part 7/8 if present; self-contained fallback)
  // ================================================================
  function buildHouseData(natalPlanets, natalAsc) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._buildHouseData === 'function') {
      var hd = window.KP_PREDICTION_7._buildHouseData(natalPlanets, natalAsc);
      if (hd && Object.keys(hd).length) return hd;
    }
    var houseData = {};
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function' || typeof P1.getPlanetNumbers !== 'function') return houseData;
    try {
      var ascSid = (natalAsc && natalAsc.sid !== undefined) ? natalAsc.sid : ((natalAsc && natalAsc.sn) || 0) * 30;
      var allCusps = P1.getAllCusps(ascSid);
      var planetNumbers = P1.getPlanetNumbers(allCusps) || {};
      Object.keys(planetNumbers).forEach(function (l) { houseData[l] = planetNumbers[l] || []; });
    } catch (e) {
      console.warn('KP_PREDICTION_9: house signification lookup failed', e);
    }
    return houseData;
  }

  function fmtDT(d) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  function isCurrent(s, e) { var now = new Date(); return s <= now && now < e; }
  function touches(lord, h, houseData) { return (houseData[lord] || []).indexOf(h) !== -1; }
  function depthFor(h, mdLord, adLord, pdLord, houseData) {
    var d = 0;
    if (touches(mdLord, h, houseData)) d++;
    if (touches(adLord, h, houseData)) d++;
    if (touches(pdLord, h, houseData)) d++;
    return d;
  }

  // ================================================================
  // STYLES
  // ================================================================
  var STYLE_ID = 'kpdx9-style';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.kpdx9-house-select{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin:8px 0;}' +
      '@media (max-width:480px){.kpdx9-house-select{grid-template-columns:repeat(4,1fr);}}' +
      '.kpdx9-house-btn{border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:6px 4px;text-align:center;cursor:pointer;background:rgba(255,255,255,.02);}' +
      '.kpdx9-house-btn:hover{border-color:rgba(212,175,90,.3);}' +
      '.kpdx9-house-btn.selected{background:rgba(212,175,90,.13);border-color:#E4C077;}' +
      '.kpdx9-house-btn .hn{font-size:12px;font-weight:700;color:#EDE9E0;}' +
      '.kpdx9-house-btn.selected .hn{color:#E4C077;}' +
      '.kpdx9-house-btn .hm{font-size:7.5px;color:var(--muted,#9c9484);display:block;margin-top:2px;line-height:1.2;}' +
      '.kpdx9-actions{display:flex;align-items:center;gap:8px;margin:6px 0 10px;flex-wrap:wrap;}' +
      '.kpdx9-search-btn{background:#C6A15B;color:#0A0A0C;border:none;border-radius:6px;padding:6px 14px;font-weight:600;font-size:10px;cursor:pointer;font-family:inherit;}' +
      '.kpdx9-search-btn:hover{background:#E4C077;}' +
      '.kpdx9-clear-btn{background:transparent;color:var(--muted,#9c9484);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:6px 10px;font-size:9.5px;cursor:pointer;font-family:inherit;}' +
      '.kpdx9-clear-btn:hover{color:#EDE9E0;border-color:rgba(212,175,90,.3);}' +
      '.kpdx9-toggle-past{font-size:9.5px;color:var(--muted,#9c9484);display:flex;align-items:center;gap:5px;cursor:pointer;margin-left:auto;}' +
      '.kpdx9-toggle-past input{accent-color:#C6A15B;}' +
      '.kpdx9-summary{font-size:9.5px;color:var(--muted,#9c9484);margin-bottom:8px;}' +
      '.kpdx9-no-results{font-size:10px;color:var(--muted,#9c9484);font-style:italic;padding:8px 2px;}' +
      '.kpdx9-result-row{border:1px solid rgba(255,255,255,.08);border-radius:7px;margin-bottom:5px;overflow:hidden;}' +
      '.kpdx9-result-head{display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;padding:7px 9px;cursor:pointer;}' +
      '.kpdx9-result-head:hover{background:rgba(255,255,255,.03);}' +
      '.kpdx9-result-row.open > .kpdx9-result-head{background:rgba(212,175,90,.06);}' +
      '.kpdx9-result-chain{font-size:10.5px;color:#EDE9E0;font-weight:500;}' +
      '.kpdx9-nlcsl-tag{display:inline-block;font-size:7px;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;letter-spacing:.02em;border:1px solid;}' +
      '.kpdx9-nl-tag{background:rgba(228,192,119,.10);color:#E4C077;border-color:rgba(228,192,119,.35);}' +
      '.kpdx9-csl-tag{background:rgba(127,166,255,.10);color:#8fb4ff;border-color:rgba(127,166,255,.35);}' +
      '.kpdx9-pr-tag{display:inline-block;font-size:8px;padding:2px 8px;border-radius:9px;margin-top:3px;margin-right:5px;border:1px solid;}' +
      '.kpdx9-pr-promised{background:rgba(212,175,90,.16);color:#E4C077;border-color:rgba(212,175,90,.35);}' +
      '.kpdx9-pr-partial{background:rgba(159,195,217,.12);color:#9FC3D9;border-color:rgba(159,195,217,.3);}' +
      '.kpdx9-pr-notseen{background:rgba(156,148,132,.10);color:var(--muted,#9c9484);border-color:rgba(255,255,255,.08);}' +
      '.kpdx9-pr-result{background:rgba(127,166,255,.10);color:#8fb4ff;border-color:rgba(127,166,255,.3);}' +
      '.kpdx9-promise-result{margin-bottom:8px;}' +
      '.kpdx9-result-row.iscurrent .kpdx9-result-chain{color:#E4C077;}' +
      '.kpdx9-result-dates{font-size:9px;color:var(--muted,#9c9484);white-space:nowrap;}' +
      '.kpdx9-strength{font-size:8px;padding:2px 7px;border-radius:9px;white-space:nowrap;}' +
      '.kpdx9-strength-strong{background:rgba(212,175,90,.18);color:#E4C077;border:1px solid rgba(212,175,90,.35);}' +
      '.kpdx9-strength-good{background:rgba(159,195,217,.13);color:#9FC3D9;border:1px solid rgba(159,195,217,.3);}' +
      '.kpdx9-caret{font-size:9px;color:var(--muted,#9c9484);transition:transform .15s;}' +
      '.kpdx9-result-row.open .kpdx9-caret{transform:rotate(90deg);color:#E4C077;}' +
      '.kpdx9-result-body{display:none;padding:2px 9px 10px 9px;border-top:1px solid rgba(255,255,255,.06);}' +
      '.kpdx9-result-row.open .kpdx9-result-body{display:block;}' +
      '.kpdx9-house-detail{font-size:9.5px;color:var(--muted,#9c9484);margin:8px 0;}' +
      '.kpdx9-house-detail b{color:#E4C077;}' +
      '.kpdx9-lv-label{font-size:8.5px;color:var(--muted,#9c9484);text-transform:uppercase;letter-spacing:.05em;margin:8px 0 4px;}' +
      '.kpdx9-sub-row{display:grid;grid-template-columns:7px 1fr auto;gap:8px;align-items:center;padding:4px 4px;font-size:9.5px;border-radius:5px;cursor:pointer;}' +
      '.kpdx9-sub-row:hover{background:rgba(255,255,255,.03);}' +
      '.kpdx9-sub-row.match{background:rgba(212,175,90,.06);}' +
      '.kpdx9-sub-dot{width:6px;height:6px;border-radius:50%;}' +
      '.kpdx9-sub-lord{color:var(--muted,#9c9484);}' +
      '.kpdx9-sub-row.match .kpdx9-sub-lord{color:#E4C077;font-weight:500;}' +
      '.kpdx9-sub-dates{color:var(--muted,#9c9484);font-size:8.5px;white-space:nowrap;}' +
      '.kpdx9-weak{color:var(--muted,#9c9484);font-size:8px;}' +
      '.kpdx9-now-tag{background:rgba(0,221,119,.15);color:#4ee89a;font-size:7px;padding:1px 5px;border-radius:7px;margin-left:5px;text-transform:uppercase;}' +
      '.kpdx9-pra-list{padding-left:14px;border-left:1px solid rgba(255,255,255,.06);margin:2px 0 4px 3px;display:none;}' +
      '.kpdx9-pra-list.open{display:block;}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ================================================================
  // STATE
  // ================================================================
  var INSTANCES = {};
  var LORD_COLOR = {
    Ketu: '#8A7BB0', Venus: '#E4C077', Sun: '#D98A4F', Moon: '#9FC3D9',
    Mars: '#C2604F', Rahu: '#6E8F6B', Jupiter: '#D6B24A', Saturn: '#6B7280', Mercury: '#7FAE8C'
  };
  function nlCslTag(lord, maps) {
    if (!maps) return '';
    var tags = '';
    var nlHouses = maps.nlMap[lord];
    var cslHouses = maps.cslMap[lord];
    if (nlHouses && nlHouses.length) tags += '<span class="kpdx9-nlcsl-tag kpdx9-nl-tag">NL H' + nlHouses.join(',H') + '</span>';
    if (cslHouses && cslHouses.length) tags += '<span class="kpdx9-nlcsl-tag kpdx9-csl-tag">CSL H' + cslHouses.join(',H') + '</span>';
    return tags;
  }
  function getState(instanceId) { return INSTANCES[instanceId]; }

  // ================================================================
  // SEARCH — over the real window.VIMSH tree, MD -> AD -> PD
  // ================================================================
  function runSearch(instanceId) {
    var st = getState(instanceId);
    var resultsEl = document.getElementById('kpdx9-results-' + instanceId);
    if (!st || !resultsEl) return;

    var sel = Array.from(st.selectedHouses).sort(function (a, b) { return a - b; });
    if (sel.length === 0) {
      resultsEl.innerHTML = '<div class="kpdx9-no-results">Select at least one house above, then search.</div>';
      return;
    }
    var VIMSH = window.VIMSH || [];
    if (!VIMSH.length) {
      resultsEl.innerHTML = '<div class="kpdx9-no-results">No dasha timeline available yet \u2014 generate a chart first.</div>';
      return;
    }
    var showPast = !!st.showPast;
    var now = new Date();
    var matches = [];

    VIMSH.forEach(function (md, mdIdx) {
      (md.subs || []).forEach(function (ad, adIdx) {
        (ad.subs || []).forEach(function (pd, pdIdx) {
          var pEnd = new Date(pd.end);
          if (!showPast && pEnd < now) return;
          var covered = true;
          sel.forEach(function (h) {
            if (depthFor(h, md.lord, ad.lord, pd.lord, st.houseData) === 0) covered = false;
          });
          if (covered) {
            matches.push({ mdIdx: mdIdx, adIdx: adIdx, pdIdx: pdIdx, md: md, ad: ad, pd: pd, cur: isCurrent(new Date(pd.start), pEnd) });
          }
        });
      });
    });

    matches.sort(function (x, y) { return new Date(x.pd.start) - new Date(y.pd.start); });
    st.lastMatches = matches;

    if (matches.length === 0) {
      resultsEl.innerHTML = '<div class="kpdx9-no-results">No Mahadasha\u2013Antardasha\u2013Pratyantardasha period ' +
        (showPast ? 'in the recorded timeline' : 'from today onward') + ' jointly signifies house' + (sel.length > 1 ? 's' : '') +
        ' ' + sel.join(', ') + '. Try a smaller combination, or enable "show past periods".</div>';
      return;
    }

    var shown = matches.slice(0, MAX_RESULTS);
    var html = '<div class="kpdx9-summary">' + matches.length + ' matching period' + (matches.length > 1 ? 's' : '') +
      ' found for houses <b style="color:#E4C077;">' + sel.join(', ') + '</b>' +
      (matches.length > MAX_RESULTS ? (' \u2014 showing first ' + MAX_RESULTS) : '') + '.</div>';

    shown.forEach(function (mt, i) {
      var allStrong = sel.every(function (h) { return depthFor(h, mt.md.lord, mt.ad.lord, mt.pd.lord, st.houseData) >= 2; });
      var strengthClass = allStrong ? 'kpdx9-strength-strong' : 'kpdx9-strength-good';
      var strengthLabel = allStrong ? 'Strong' : 'Good';
      var lords3 = [mt.md.lord, mt.ad.lord, mt.pd.lord];
      var pr = promiseResultForMatch(lords3, sel, st.nlCslMaps, st.houseData);
      var prClassMap = { promised: 'kpdx9-pr-promised', partial: 'kpdx9-pr-partial', notseen: 'kpdx9-pr-notseen' };
      var prLabelMap = { promised: 'Promised', partial: 'Partly promised', notseen: 'Not promised' };
      
      var rowId = instanceId + '-' + mt.mdIdx + '-' + mt.adIdx + '-' + mt.pdIdx;
      html += '<div class="kpdx9-result-row' + (mt.cur ? ' iscurrent' : '') + '" id="kpdx9-row-' + rowId + '">' +
        '<div class="kpdx9-result-head" onclick="window.KP9_toggleResult(\'' + instanceId + '\',' + mt.mdIdx + ',' + mt.adIdx + ',' + mt.pdIdx + ')">' +
        '<div><div class="kpdx9-result-chain">' + mt.md.lord + nlCslTag(mt.md.lord, st.nlCslMaps) + '\u2013' + mt.ad.lord + nlCslTag(mt.ad.lord, st.nlCslMaps) + '\u2013' + mt.pd.lord + nlCslTag(mt.pd.lord, st.nlCslMaps) + (mt.cur ? '<span class="kpdx9-now-tag">now</span>' : '') + '</div>' +
        '<span class="kpdx9-pr-tag ' + prClassMap[pr.promiseVerdict] + '">Promise (NL): ' + prLabelMap[pr.promiseVerdict] + '</span></div>' +
        '<div class="kpdx9-result-dates">' + fmtDT(new Date(mt.pd.start)) + ' \u2013 ' + fmtDT(new Date(mt.pd.end)) + '</div>' +
        '<div class="kpdx9-strength ' + strengthClass + '">' + strengthLabel + '</div>' +
        '<div class="kpdx9-caret">\u203a</div>' +
        '</div>' +
        '<div class="kpdx9-result-body" id="kpdx9-body-' + rowId + '" data-loaded="0"></div>' +
        '</div>';
    });

    resultsEl.innerHTML = html;
  }

  function planetQuality(lord, houseData) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._planetQuality === 'function') return window.KP_PREDICTION_7._planetQuality(lord, houseData);
    return 'Mixed';
  }

  // ================================================================
  // PROMISE (via NL) vs RESULT (via CSL) — the core KP dictum: the star
  // lord (NL) of a house cusp shows what result that house is trying to
  // deliver (the promise); the sub lord (CSL) of that same cusp is the
  // deciding authority for whether that promise actually fructifies,
  // and whether favourably or not. Applied here to a running MD-AD-PD
  // chain: a selected house is "promised" if any of the three running
  // lords is that house's NL, and its "result" is read off whichever
  // running lord is that house's CSL.
  // ================================================================
  function promiseResultForMatch(lords, sel, maps, houseData) {
    var promisedHouses = sel.filter(function (h) {
      return lords.some(function (l) { return (maps.nlMap[l] || []).indexOf(h) !== -1; });
    });
    var resultHouses = sel.filter(function (h) {
      return lords.some(function (l) { return (maps.cslMap[l] || []).indexOf(h) !== -1; });
    });
    var promiseVerdict = promisedHouses.length === 0 ? 'notseen' : (promisedHouses.length === sel.length ? 'promised' : 'partial');
    var cslLords = lords.filter(function (l) { return sel.some(function (h) { return (maps.cslMap[l] || []).indexOf(h) !== -1; }); });
    var qualities = cslLords.map(function (l) { return { lord: l, quality: planetQuality(l, houseData) }; });
    return { promisedHouses: promisedHouses, resultHouses: resultHouses, promiseVerdict: promiseVerdict, qualities: qualities };
  }

  function promiseResultHtml(pr, sel) {
    var promiseLabelMap = { promised: 'Promised', partial: 'Partly promised', notseen: 'Not promised' };
    var promiseClassMap = { promised: 'kpdx9-pr-promised', partial: 'kpdx9-pr-partial', notseen: 'kpdx9-pr-notseen' };
    var promiseText = pr.promisedHouses.length ? ('H' + pr.promisedHouses.join(',H')) : 'none of the selected houses';
    var resultText = pr.qualities.length
      ? pr.qualities.map(function (q) { return q.lord + ' (' + q.quality + ')'; }).join(', ')
      : 'no running lord is CSL of the selected houses';
    return '<div class="kpdx9-promise-result">' +
      '<span class="kpdx9-pr-tag ' + promiseClassMap[pr.promiseVerdict] + '">Promise (NL): ' + promiseLabelMap[pr.promiseVerdict] + ' \u2014 ' + promiseText + '</span>' +
      '<span class="kpdx9-pr-tag kpdx9-pr-result">Result (CSL): ' + resultText + '</span>' +
      '</div>';
  }

  // Expand a MD-AD-PD result row: show house depth + the real Sukshma
  // list (pd.subs) — level 4 of the tree.
  window.KP9_toggleResult = function (instanceId, mdIdx, adIdx, pdIdx) {
    var st = getState(instanceId);
    if (!st) return;
    var rowId = instanceId + '-' + mdIdx + '-' + adIdx + '-' + pdIdx;
    var rowEl = document.getElementById('kpdx9-row-' + rowId);
    var bodyEl = document.getElementById('kpdx9-body-' + rowId);
    if (!rowEl || !bodyEl) return;
    rowEl.classList.toggle('open');
    if (!rowEl.classList.contains('open') || bodyEl.dataset.loaded === '1') return;
    bodyEl.dataset.loaded = '1';

    var VIMSH = window.VIMSH || [];
    var md = VIMSH[mdIdx], ad = md && md.subs && md.subs[adIdx], pd = ad && ad.subs && ad.subs[pdIdx];
    if (!pd) return;
    var sel = Array.from(st.selectedHouses).sort(function (a, b) { return a - b; });
    var lords = [md.lord, ad.lord, pd.lord];

    var pr = promiseResultForMatch(lords, sel, st.nlCslMaps, st.houseData);

    var detail = sel.map(function (h) { return '<b>H' + h + '</b> depth ' + depthFor(h, md.lord, ad.lord, pd.lord, st.houseData) + '/3'; }).join(' &nbsp;\u00b7&nbsp; ');
    var html = promiseResultHtml(pr, sel) +
      '<div class="kpdx9-house-detail">Signification depth per house (occupant/owner method \u2014 how many of the 3 running lords touch it): ' + detail + '</div>' +
      '<div class="kpdx9-lv-label">Sukshma refinement (level 4) within this Pratyantardasha</div>' +
      '<div id="kpdx9-sd-list-' + rowId + '"></div>';
    bodyEl.innerHTML = html;

    var sdListEl = document.getElementById('kpdx9-sd-list-' + rowId);
    (pd.subs || []).forEach(function (sd, sdIdx) {
      var sdRowId = rowId + '-' + sdIdx;
      var stillCovered = sel.every(function (h) {
        return touches(md.lord, h, st.houseData) || touches(ad.lord, h, st.houseData) || touches(pd.lord, h, st.houseData) || touches(sd.lord, h, st.houseData);
      });
      var sCur = isCurrent(new Date(sd.start), new Date(sd.end));
      var row = document.createElement('div');
      row.innerHTML = '<div class="kpdx9-sub-row' + (stillCovered ? ' match' : '') + '" id="kpdx9-sdrow-' + sdRowId + '" onclick="window.KP9_toggleSukshma(\'' + instanceId + '\',' + mdIdx + ',' + adIdx + ',' + pdIdx + ',' + sdIdx + ')">' +
        '<div class="kpdx9-sub-dot" style="background:' + (LORD_COLOR[sd.lord] || '#888') + '"></div>' +
        '<div class="kpdx9-sub-lord">' + md.lord + '\u2013' + ad.lord + '\u2013' + pd.lord + '\u2013' + sd.lord + (sCur ? '<span class="kpdx9-now-tag">now</span>' : '') + (stillCovered ? '' : ' <span class="kpdx9-weak">(weakens match)</span>') + '</div>' +
        '<div class="kpdx9-sub-dates">' + fmtDT(new Date(sd.start)) + ' \u2013 ' + fmtDT(new Date(sd.end)) + '</div>' +
        '</div>' +
        '<div class="kpdx9-pra-list" id="kpdx9-pralist-' + sdRowId + '" data-loaded="0"></div>';
      sdListEl.appendChild(row);
    });
  };

  // Expand a Sukshma row: show the real Pran list (sd.subs) — level 5,
  // the finest the tree goes.
  window.KP9_toggleSukshma = function (instanceId, mdIdx, adIdx, pdIdx, sdIdx) {
    var st = getState(instanceId);
    if (!st) return;
    var sdRowId = instanceId + '-' + mdIdx + '-' + adIdx + '-' + pdIdx + '-' + sdIdx;
    var praListEl = document.getElementById('kpdx9-pralist-' + sdRowId);
    if (!praListEl) return;
    praListEl.classList.toggle('open');
    if (!praListEl.classList.contains('open') || praListEl.dataset.loaded === '1') return;
    praListEl.dataset.loaded = '1';

    var VIMSH = window.VIMSH || [];
    var md = VIMSH[mdIdx], ad = md && md.subs && md.subs[adIdx], pd = ad && ad.subs && ad.subs[pdIdx], sd = pd && pd.subs && pd.subs[sdIdx];
    if (!sd) return;
    var sel = Array.from(st.selectedHouses).sort(function (a, b) { return a - b; });

    var html = '<div class="kpdx9-lv-label" style="margin-top:2px;">Pran refinement (level 5, finest)</div>';
    (sd.subs || []).forEach(function (pra) {
      var stillCovered = sel.every(function (h) {
        return touches(md.lord, h, st.houseData) || touches(ad.lord, h, st.houseData) || touches(pd.lord, h, st.houseData) || touches(sd.lord, h, st.houseData) || touches(pra.lord, h, st.houseData);
      });
      var pCur = isCurrent(new Date(pra.start), new Date(pra.end));
      html += '<div class="kpdx9-sub-row' + (stillCovered ? ' match' : '') + '">' +
        '<div class="kpdx9-sub-dot" style="background:' + (LORD_COLOR[pra.lord] || '#888') + '"></div>' +
        '<div class="kpdx9-sub-lord">' + md.lord + '\u2013' + ad.lord + '\u2013' + pd.lord + '\u2013' + sd.lord + '\u2013' + pra.lord + (pCur ? '<span class="kpdx9-now-tag">now</span>' : '') + (stillCovered ? '' : ' <span class="kpdx9-weak">(weakens match)</span>') + '</div>' +
        '<div class="kpdx9-sub-dates">' + fmtDT(new Date(pra.start)) + ' \u2013 ' + fmtDT(new Date(pra.end)) + '</div>' +
        '</div>';
    });
    praListEl.innerHTML = html;
  };

  window.KP9_toggleHouse = function (instanceId, h) {
    var st = getState(instanceId);
    if (!st) return;
    if (st.selectedHouses.has(h)) st.selectedHouses.delete(h); else st.selectedHouses.add(h);
    var btn = document.getElementById('kpdx9-hbtn-' + instanceId + '-' + h);
    if (btn) btn.classList.toggle('selected');
  };

  window.KP9_clearHouses = function (instanceId) {
    var st = getState(instanceId);
    if (!st) return;
    st.selectedHouses.clear();
    for (var h = 1; h <= 12; h++) {
      var btn = document.getElementById('kpdx9-hbtn-' + instanceId + '-' + h);
      if (btn) btn.classList.remove('selected');
    }
    var resultsEl = document.getElementById('kpdx9-results-' + instanceId);
    if (resultsEl) resultsEl.innerHTML = '';
  };

  window.KP9_togglePast = function (instanceId, checked) {
    var st = getState(instanceId);
    if (!st) return;
    st.showPast = !!checked;
    runSearch(instanceId);
  };

  window.KP9_runSearch = function (instanceId) { runSearch(instanceId); };
  // Static "Combination & strength check" for any planets a Part 8
  // event named (drishti/occupation via the natal chart + live Shadbala
  // strength) — reuses Part 8's engine exactly, since this doesn't vary
  // by which dasha period is open, only by the natal chart itself.
  function renderCombinationPanel(instanceId) {
    var st = getState(instanceId);
    if (!st || !st.requiredPlanets || !st.requiredPlanets.length) return '';
    if (!window.KP_PREDICTION_8 || typeof window.KP_PREDICTION_8._buildCombinationCheck !== 'function') return '';
    var pseudoEvent = { houses: Array.from(st.selectedHouses), requiredPlanets: st.requiredPlanets };
    return window.KP_PREDICTION_8._buildCombinationCheck(pseudoEvent, st.natalPlanets, st.natalAsc);
  }

  function refreshCombinationPanel(instanceId) {
    var el = document.getElementById('kpdx9-combo-' + instanceId);
    if (el) el.innerHTML = renderCombinationPanel(instanceId);
  }

  // Cross-link from Part 8: send an event's houses (and, when known,
  // its named planets) straight into the finder and run it immediately.
  window.KP9_applyHouses = function (instanceId, housesCsv, planetsCsv) {
    var st = getState(instanceId);
    if (!st) return;
    var houses = housesCsv.split(',').map(Number);
    st.selectedHouses = new Set(houses);
    st.requiredPlanets = (planetsCsv || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    
    for (var h = 1; h <= 12; h++) {
      var btn = document.getElementById('kpdx9-hbtn-' + instanceId + '-' + h);
      if (btn) btn.classList.toggle('selected', houses.indexOf(h) !== -1);
    }
    refreshCombinationPanel(instanceId);
    
    runSearch(instanceId);
    var card = document.getElementById('kpdx9-card-' + instanceId);
    if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ================================================================
  // PUBLIC API
  // ================================================================
  // ctx: { natalPlanets, natalAsc, sectionClass, instanceId, presetHouses (array, optional) }
  function renderForPanel(ctx) {
    ctx = ctx || {};
    if (!ctx.natalPlanets || !ctx.natalAsc) return '';
    var houseData = buildHouseData(ctx.natalPlanets, ctx.natalAsc);
    if (!Object.keys(houseData).length) return '';
    if (!window.VIMSH || !window.VIMSH.length) return '';

    injectStyles();
    var instanceId = ctx.instanceId || 'default';
    var preset = ctx.presetHouses || [];
    var presetPlanets = ctx.presetPlanets || [];

    var nlCslMaps = (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._buildNLCSLMaps === 'function')
      ? window.KP_PREDICTION_7._buildNLCSLMaps(ctx.natalPlanets, ctx.natalAsc) : { nlMap: {}, cslMap: {} };
    INSTANCES[instanceId] = {
      houseData: houseData, selectedHouses: new Set(preset), showPast: false, lastMatches: [],
      nlCslMaps: nlCslMaps, natalPlanets: ctx.natalPlanets, natalAsc: ctx.natalAsc, requiredPlanets: presetPlanets
    };

    var html = buildHtml(ctx, instanceId, preset, ctx.sectionClass || 'dt-section');
    if (preset.length) setTimeout(function () { runSearch(instanceId); }, 0);
    return html;
  }

  function buildHtml(ctx, instanceId, preset, sectionClass) {
    var html = '<div class="' + sectionClass + '" style="margin-top:14px;">KP EVENT TIMING FINDER \u2014 UP TO 5 LEVELS</div>';
    html += '<div id="kpdx9-card-' + instanceId + '">';
    html += '<div style="font-size:9.5px;color:var(--muted,#9c9484);margin-bottom:6px;">Select the houses for the event you\u2019re checking, then search the full Mahadasha\u2013Antardasha\u2013Pratyantardasha timeline. Click a result to refine down through the real Sukshma and Pran periods.</div>';
    html += '<div class="kpdx9-house-select" id="kpdx9-hsel-' + instanceId + '">';
    for (var h = 1; h <= 12; h++) {
      html += '<div class="kpdx9-house-btn' + (preset.indexOf(h) !== -1 ? ' selected' : '') + '" id="kpdx9-hbtn-' + instanceId + '-' + h + '" onclick="window.KP9_toggleHouse(\'' + instanceId + '\',' + h + ')">' +
        '<div class="hn">' + h + '</div><span class="hm">' + HOUSE_SHORT[h] + '</span></div>';
    }
    html += '</div>';
    html += '<div class="kpdx9-actions">' +
      '<button class="kpdx9-search-btn" onclick="window.KP9_runSearch(\'' + instanceId + '\')">Find Matching Periods</button>' +
      '<button class="kpdx9-clear-btn" onclick="window.KP9_clearHouses(\'' + instanceId + '\')">Clear</button>' +
      '<label class="kpdx9-toggle-past"><input type="checkbox" onchange="window.KP9_togglePast(\'' + instanceId + '\', this.checked)"> show past periods too</label>' +
      '</div>';
    html += '<div id="kpdx9-combo-' + instanceId + '">' + renderCombinationPanel(instanceId) + '</div>';
      
    html += '<div id="kpdx9-results-' + instanceId + '"></div>';
    html += '</div>';

    return html;
  }

  window.KP_PREDICTION_9 = {
    renderForPanel: renderForPanel
  };
})();
