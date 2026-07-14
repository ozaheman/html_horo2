/**
 * ashtakvarga_display.js
 * ─────────────────────────────────────────────────────────────
 * Rendering layer for window.ASHTAKVARGA (see ashtakvarga_core.js).
 * Builds the full Ashtakavarga analysis panel: Bhinnashtakavarga
 * grids for all 7 planets, Sarvashtakavarga (raw + reduced), a
 * "current transit" tab (Kaksha + bindu-giver analysis for every
 * transiting planet), Sun's direction & meeting-timing analysis,
 * a marriage (Venus) tab, and a business/career tab.
 *
 * Mount with:
 *   window.ASHTAKVARGA_DISPLAY.mount('containerId', {
 *     natalPlanets: BIRTH_PLANETS, ascSignNum: BIRTH_ASC.sn, ascDeg: BIRTH_ASC.deg,
 *     lords: LORDS, transitPlanets: getPos(new Date())
 *   });
 */

window.ASHTAKVARGA_DISPLAY = {

    _bindColor: function (planetName, bindus) {
        const cls = window.ASHTAKVARGA.classifyBAVStrength(planetName, bindus);
        return cls === 'strong' ? '#00DD77' : cls === 'weak' ? '#FF4477' : '#FFD700';
    },
    _savColor: function (sav) {
        const cls = window.ASHTAKVARGA.classifySAVStrength(sav);
        return cls === 'exceptional' ? '#00FFAA' : cls === 'strong' ? '#00DD77' : cls === 'good' ? '#FFD700' : cls === 'weak' ? '#FF9955' : '#FF4477';
    },

    // ===================== BAV GRID =====================

    renderBAVGrid: function (bav, planetName) {
        const A = window.ASHTAKVARGA;
        const cells = A.SIGNS.map((sign, i) => {
            const b = bav.bindus[i];
            const color = this._bindColor(planetName, b);
            const givers = bav.contributorsBySign[i].join(', ') || 'none';
            return `<div title="${sign}: given by ${givers}" style="flex:1 1 7.5%;min-width:60px;padding:5px 3px;text-align:center;border:1px solid rgba(255,255,255,.08);background:${color}12;">
                <div style="font-size:7.5px;color:var(--muted);">${sign.slice(0,3)}</div>
                <div style="font-size:13px;font-weight:bold;color:${color};">${b}</div>
              </div>`;
        }).join('');
        return `<div style="margin-top:6px;">
                  <div style="font-size:9.5px;font-weight:bold;color:var(--gold,#FFD700);margin-bottom:3px;">${planetName}'s Bhinnashtakavarga (total ${bav.total}, own average ${A.planetOwnAverage(planetName).toFixed(2)}/sign)</div>
                  <div style="display:flex;flex-wrap:wrap;gap:2px;">${cells}</div>
                </div>`;
    },

    renderAllBAVGrids: function (allBAV) {
        return window.ASHTAKVARGA.PLANETS7.map(p => this.renderBAVGrid(allBAV[p], p)).join('');
    },

    // ===================== SAV GRID =====================

    renderSAVGrid: function (sav, reducedSAV) {
        const A = window.ASHTAKVARGA;
        const cells = A.SIGNS.map((sign, i) => {
            const v = sav[i];
            const color = this._savColor(v);
            const reducedVal = reducedSAV ? reducedSAV.afterEkadhipatya[i] : null;
            return `<div style="flex:1 1 7.5%;min-width:65px;padding:6px 3px;text-align:center;border:1px solid rgba(255,255,255,.08);background:${color}12;">
                <div style="font-size:7.5px;color:var(--muted);">${sign.slice(0,3)}</div>
                <div style="font-size:14px;font-weight:bold;color:${color};">${v}</div>
                ${reducedVal !== null ? `<div style="font-size:7px;color:var(--muted);">reduced: ${reducedVal}</div>` : ''}
              </div>`;
        }).join('');
        const total = sav.reduce((a, b) => a + b, 0);
        return `<div class="pred-item" style="border-left:3px solid var(--gold,#FFD700);">
                  <div class="pred-title" style="color:var(--gold,#FFD700);">📊 Sarvashtakavarga (SAV) — Total ${total}/337</div>
                  <div style="font-size:8px;color:var(--muted);margin-bottom:4px;">Average 28/sign · 30+ = very strong · 25-29 = moderate · below 25 = weak. "Reduced" values are after Mandala + Trikona + Ekadhipatya Sodhana.</div>
                  <div style="display:flex;flex-wrap:wrap;gap:2px;">${cells}</div>
                </div>`;
    },

    // ===================== CURRENT TRANSIT TAB =====================

    renderTransitAnalysis: function (opts) {
        const A = window.ASHTAKVARGA;
        const { allBAV, ascSignNum, lords, transitPlanets, savArray } = opts;
        const planetsToShow = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
        const rows = planetsToShow.map(p => {
            const tp = transitPlanets[p];
            if (!tp) return '';
            const signIdx = tp.sn;
            const deg = parseFloat(tp.deg !== undefined ? tp.deg : 0);
            const a = A.analyzeTransitPlanet(p, signIdx, deg, allBAV, ascSignNum, lords, savArray);
            if (!a) return '';
            const color = this._bindColor(p, a.bindus);
            const houseRoles = a.contributorHouseRoles.map(r => r.role ? r.role : `${r.contributor}(H${r.houses.join(',')})`).join(', ') || 'none';
            return `<div style="margin-top:6px;padding:6px 8px;border-left:3px solid ${color};background:${color}0A;border-radius:4px;">
                <div style="display:flex;justify-content:space-between;">
                  <span style="font-size:10px;font-weight:bold;">${p} transiting ${a.sign}</span>
                  <span style="font-size:9.5px;font-weight:bold;color:${color};">${a.bindus} bindus (${a.strength}, own avg ${a.ownAverage.toFixed(1)})</span>
                </div>
                <div style="font-size:8.5px;color:var(--muted);margin-top:2px;">Bindu givers: ${houseRoles}</div>
                <div style="font-size:8.5px;margin-top:2px;">Kaksha: <b>${a.kaksha.lord}</b> (${a.kaksha.rangeStart}°–${a.kaksha.rangeEnd}°) — ${a.kakshaGrantsBindu ? '<span style="color:#00DD77;">✓ grants a bindu here (gate open)</span>' : '<span style="color:#FF4477;">✗ withholds a bindu here (gate closed)</span>'}</div>
                ${a.sav !== null ? `<div style="font-size:8.5px;">Sign SAV: <b style="color:${this._savColor(a.sav)};">${a.sav}</b> (${a.savStrength})</div>` : ''}
              </div>`;
        }).join('');
        return `<div class="pred-item" style="border-left:3px solid var(--cyan);">
                  <div class="pred-title" style="color:var(--cyan);">🔭 Current Transit Analysis</div>
                  ${rows}
                </div>`;
    },

    renderOverallPeriod: function (overall) {
        const color = overall.verdict.includes('Good') ? '#00DD77' : overall.verdict.includes('Mixed') ? '#FFD700' : '#FF4477';
        const rows = overall.factors.map(f => {
            if (f.ok === null) return `<div style="font-size:8.5px;color:var(--muted);">${f.label} (${f.planet}): unavailable</div>`;
            const c = f.ok ? '#00DD77' : '#FF4477';
            return `<div style="font-size:8.5px;margin:2px 0;"><span style="color:${c};font-weight:bold;">${f.ok ? '✓' : '✗'}</span> ${f.label} (${f.planet}) — ${f.analysis.bindus} bindus, Kaksha ${f.analysis.kaksha.lord} ${f.analysis.kakshaGrantsBindu ? 'grants' : 'withholds'}</div>`;
        }).join('');
        return `<div class="pred-item" style="border-left:3px solid ${color};">
                  <div class="pred-title" style="color:${color};">⭐ Overall Period (5-Factor Method)</div>
                  ${rows}
                  <div style="margin-top:6px;font-size:10px;font-weight:bold;color:${color};">${overall.verdict} (${overall.goodCount}/${overall.total} factors favourable)</div>
                </div>`;
    },

    // ===================== SUN DIRECTION & MEETING TIMING =====================

    renderSunDirectionAndTiming: function (sunBAV, ascSignNum, sunTransit) {
        const A = window.ASHTAKVARGA;
        const dirAnalysis = A.analyzeSunDirection(sunBAV, ascSignNum);
        const houseRows = dirAnalysis.perHouse.map(h => {
            const color = this._bindColor('Sun', h.bindus);
            return `<div style="display:flex;justify-content:space-between;font-size:8.5px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05);">
                <span>H${h.house} ${h.sign}</span><span style="color:var(--muted);">${h.direction}</span><span style="color:${color};font-weight:bold;">${h.bindus}</span>
              </div>`;
        }).join('');

        let timingBlock = '';
        if (sunTransit) {
            const timing = A.analyzeMeetingTiming(sunTransit.sn, parseFloat(sunTransit.deg), sunBAV);
            const tColor = timing.kakshaGrantsBindu && timing.strength !== 'weak' ? '#00DD77' : '#FF4477';
            timingBlock = `<div style="margin-top:8px;padding:6px 8px;border-left:3px solid ${tColor};background:${tColor}0A;border-radius:4px;">
                <div style="font-size:9.5px;font-weight:bold;color:${tColor};">🕐 Meeting Timing (via Sun's Kaksha)</div>
                <div style="font-size:8.5px;margin-top:2px;">${timing.verdict}</div>
              </div>`;
        }

        return `<div class="pred-item" style="border-left:3px solid var(--gold,#FFD700);">
                  <div class="pred-title" style="color:var(--gold,#FFD700);">🧭 Sun's Direction & Meeting-Timing Analysis</div>
                  <div style="font-size:8.5px;color:var(--muted);margin-bottom:4px;">${dirAnalysis.recommendation}</div>
                  ${houseRows}
                  ${timingBlock}
                </div>`;
    },

    // ===================== MARRIAGE (VENUS) TAB =====================

    renderMarriageAnalysis: function (venusBAV, ascSignNum) {
        const A = window.ASHTAKVARGA;
        const perHouse = A.venusHouseBindus(venusBAV, ascSignNum);
        const seventhHouse = perHouse.find(h => h.house === 7);
        const seventhColor = this._bindColor('Venus', seventhHouse.bindus);
        const rows = perHouse.map(h => {
            const color = this._bindColor('Venus', h.bindus);
            return `<div style="display:flex;justify-content:space-between;font-size:8.5px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05);">
                <span>H${h.house} ${h.sign}</span><span style="color:${color};font-weight:bold;">${h.bindus} bindus</span>
              </div>`;
        }).join('');
        return `<div class="pred-item" style="border-left:3px solid #FF4477;">
                  <div class="pred-title" style="color:#FF4477;">💞 Marriage & Relationship (Venus Ashtakavarga)</div>
                  <div style="font-size:8.5px;color:var(--muted);margin-bottom:4px;">7th house (marriage/spouse) Venus bindus: <b style="color:${seventhColor};">${seventhHouse.bindus}</b> — ${seventhHouse.bindus <= 3 ? 'low; classically raises questions about ease/harmony in the marital relationship, especially in Venus Dasha/transit.' : seventhHouse.bindus >= 6 ? 'strong support for a harmonious married life.' : 'average — results depend heavily on other married-life factors too.'}</div>
                  ${rows}
                </div>`;
    },

    // ===================== BUSINESS/CAREER TAB =====================

    renderBusinessAnalysis: function (allBAV, ascSignNum, lords) {
        const A = window.ASHTAKVARGA;
        const sig = A.careerSignificatorBindus(allBAV, ascSignNum, lords);
        const rows = sig.map(s => {
            if (s.bindus === null) return '';
            const color = this._bindColor(s.lord, s.bindus);
            const label = s.house === 2 ? 'Wealth (2nd)' : s.house === 10 ? 'Career (10th)' : 'Gains (11th)';
            return `<div style="margin-top:4px;padding:5px 8px;border-left:3px solid ${color};background:${color}0A;border-radius:4px;font-size:8.5px;">
                <b>${label}</b> — lord ${s.lord} in own sign ${s.sign}: <span style="color:${color};font-weight:bold;">${s.bindus} bindus</span>
              </div>`;
        }).join('');
        return `<div class="pred-item" style="border-left:3px solid rgba(200,168,75,.6);">
                  <div class="pred-title" style="color:rgba(200,168,75,1);">💼 Business & Career (2nd/10th/11th Lords)</div>
                  ${rows}
                </div>`;
    },

    // ===================== NEW: LIFE-DOMAIN YOGA SECTIONS =====================

    renderWealthAnalysis: function (wealth) {
        const color = wealth.grandWealthYoga ? '#00DD77' : '#FFD700';
        return `<div class="pred-item" style="border-left:3px solid ${color};">
          <div class="pred-title" style="color:${color};">💰 Wealth (1-2-9-10-11 Houses)</div>
          <div style="font-size:8.5px;">Income (H11, ${wealth.income.sign}): <b>${wealth.income.sav}</b> vs Expense (H12, ${wealth.expense.sign}): <b>${wealth.expense.sav}</b> — ${wealth.incomeVsExpense.replace(/-/g,' ')}</div>
          <div style="font-size:8.5px;margin-top:2px;color:${color};font-weight:bold;">${wealth.verdict}</div>
        </div>`;
    },

    renderCareerAnalysis: function (career) {
        const color = career.profile.includes('Business') ? '#FFD700' : '#66CCFF';
        const rows = career.perPlanetTenthHouse.map(p => {
            if (p.bindus === null) return '';
            const c = p.strong ? '#00DD77' : p.weak ? '#FF4477' : 'var(--muted)';
            return `<div style="font-size:8.5px;margin:2px 0;"><span style="color:${c};font-weight:bold;">${p.planet} (${p.bindus})</span> ${p.strong ? '→ ' + p.field : p.weak ? '— weak, may bring career challenges/job changes' : ''}</div>`;
        }).join('');
        return `<div class="pred-item" style="border-left:3px solid ${color};">
          <div class="pred-title" style="color:${color};">💼 Career Power Ratio — <span style="color:${color};">${career.profile}</span></div>
          <div style="font-size:8.5px;">10th House SAV: <b>${career.tenthHouseSAV}</b> vs 11th House SAV: <b>${career.eleventhHouseSAV}</b></div>
          ${career.employmentYoga ? '<div style="font-size:8.5px;color:#66CCFF;">✓ Service/Employment Yoga (6th house > 28)</div>' : ''}
          ${career.businessYoga ? '<div style="font-size:8.5px;color:#FFD700;">✓ Self-Employment/Business Yoga (3rd & 7th houses both > 28)</div>' : ''}
          <div style="margin-top:4px;font-size:8.5px;font-weight:bold;color:var(--muted);">10th-house planet bindu strength → natural career field:</div>
          ${rows}
        </div>`;
    },

    renderMarriageDurability: function (m) {
        const color = m.durabilityYoga ? '#00DD77' : '#FF4477';
        return `<div class="pred-item" style="border-left:3px solid ${color};">
          <div class="pred-title" style="color:${color};">💍 Marriage Durability & Compatibility (SAV)</div>
          <div style="font-size:8.5px;">7th (${m.seventh.sign}): <b>${m.seventh.sav}</b> — ${m.seventhVerdict}</div>
          <div style="font-size:8.5px;">7th + 8th combined: <b>${m.combined}</b> ${m.durabilityYoga ? '<span style="color:#00DD77;">✓ Combined Marriage Durability Yoga</span>' : '(need >50, each >25)'}</div>
          <div style="font-size:8.5px;margin-top:2px;">1st vs 7th compatibility gap: <b>${m.compatibility.diff}</b> — ${m.compatibility.verdict}</div>
        </div>`;
    },

    renderForeignSettlement: function (f) {
        const color = f.pullToSettle ? '#00DD77' : '#FFD700';
        const rows = f.perPlanet12th.filter(p => p.bindus !== null).map(p => `<span style="font-size:8.5px;margin-right:8px;">${p.planet}: <b>${p.bindus}</b></span>`).join('');
        return `<div class="pred-item" style="border-left:3px solid ${color};">
          <div class="pred-title" style="color:${color};">✈️ Foreign Travel & Settlement</div>
          <div style="font-size:8.5px;">12th (${f.twelfth.sign}): <b>${f.twelfth.sav}</b> vs 4th (${f.fourth.sign}): <b>${f.fourth.sav}</b> — ${f.nature}</div>
          ${f.foreignEarningsYoga ? '<div style="font-size:8.5px;color:#00DD77;">✓ Foreign Earnings Yoga (12th SAV > 2nd SAV, and > 28)</div>' : ''}
          ${f.saturnLongTermIndicator ? '<div style="font-size:8.5px;color:#FFA500;">⚠ Saturn ≥4 bindus in 12th — indicates long-term foreign stay potential.</div>' : ''}
          <div style="margin-top:4px;font-size:8px;color:var(--muted);">12th-house bindus by planet: ${rows}</div>
        </div>`;
    },

    renderPropertyVehicle: function (p) {
        const color = p.personalUseFavourable ? '#00DD77' : 'var(--muted)';
        return `<div class="pred-item" style="border-left:3px solid ${color};">
          <div class="pred-title" style="color:${color};">🏠 Property & Vehicle</div>
          <div style="font-size:8.5px;">4th House (${p.fourth.sign}) SAV: <b>${p.fourth.sav}</b>, lord ${p.fourthLord} contributes <b>${p.fourthLordBAVInOwnHouse}</b> bindus there.</div>
          <div style="font-size:8.5px;">${p.personalUseFavourable ? '✓ Favourable for personal home/vehicle acquisition.' : 'Moderate — other chart factors matter more here.'}</div>
          ${p.flipInvestmentYoga ? '<div style="font-size:8.5px;color:#FFD700;">✓ Property Flip/Investment Yoga (4th weaker than 2nd, 5th & 10th, all three >28) — favours profitable buying/selling rather than long holding.</div>' : ''}
        </div>`;
    },

    renderTatwaChakra: function (dir) {
        const rows = dir.sorted.map((t, i) => `<div style="display:flex;justify-content:space-between;font-size:8.5px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05);">
            <span>${i===0?'⭐ ':''}${t.direction} (${t.name})</span><span style="color:var(--muted);">${t.signs.join(', ')}</span><span style="font-weight:bold;">${t.total}</span>
          </div>`).join('');
        return `<div class="pred-item" style="border-left:3px solid var(--gold,#FFD700);">
          <div class="pred-title" style="color:var(--gold,#FFD700);">🧭 Tatwa Chakra — Most Favourable Direction (classical, element-based)</div>
          <div style="font-size:9.5px;font-weight:bold;margin-bottom:4px;">Best direction: <span style="color:#00DD77;">${dir.finalDirection}</span></div>
          ${rows}
          <div style="font-size:8px;color:var(--muted);margin-top:4px;">${dir.best.label}${dir.nearEqual ? ` · runner-up: ${dir.second.label}` : ''}</div>
        </div>`;
    },

    // ===================== FULL PANEL =====================

    renderFullPanel: function (opts) {
        const A = window.ASHTAKVARGA;
        const { natalPlanets, ascSignNum, ascDeg, lords, transitPlanets, mdLord, adLord } = opts;
        const allBAV = A.computeAllBAV(natalPlanets, ascSignNum, ascDeg, true);
        const sav = A.computeSAV(allBAV);

        const occupied = A.PLANETS7.map(p => natalPlanets[p] ? A._signOf(natalPlanets[p].sid !== undefined ? natalPlanets[p].sid : natalPlanets[p].longitude) : null).filter(x => x !== null);
        const reducedSAV = A.computeReducedSAV(sav, occupied);

        let html = `<div style="padding:4px;">`;
        html += this.renderSAVGrid(sav, reducedSAV);
        html += this.renderTatwaChakra(A.analyzeTatwaChakraDirection(sav));

        if (mdLord && adLord && transitPlanets) {
            const lagnesh = lords[ascSignNum];
            const overall = A.analyzeOverallPeriod({ lagnesh, mdLord, adLord, allBAV, ascSignNum, lords, savArray: sav, transitPositions: Object.fromEntries(Object.entries(transitPlanets).map(([k,v]) => [k, { sn: v.sn, deg: parseFloat(v.deg !== undefined ? v.deg : 0) }])) });
            html += this.renderOverallPeriod(overall);
        }

        if (transitPlanets) {
            html += this.renderTransitAnalysis({ allBAV, ascSignNum, lords, transitPlanets, savArray: sav });
            if (natalPlanets.Sun && transitPlanets.Sun) {
                html += this.renderSunDirectionAndTiming(allBAV.Sun, ascSignNum, transitPlanets.Sun);
            }
        }

        html += this.renderWealthAnalysis(A.analyzeWealth(ascSignNum, sav));
        html += this.renderCareerAnalysis(A.analyzeCareer(allBAV, ascSignNum, sav, lords));
        html += this.renderMarriageDurability(A.analyzeMarriageSAV(ascSignNum, sav));
        html += this.renderForeignSettlement(A.analyzeForeignSettlement(allBAV, ascSignNum, sav));
        html += this.renderPropertyVehicle(A.analyzePropertyVehicle(ascSignNum, sav, lords, allBAV));

        if (allBAV.Venus) html += this.renderMarriageAnalysis(allBAV.Venus, ascSignNum);
        html += this.renderBusinessAnalysis(allBAV, ascSignNum, lords);

        html += `<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:9px;color:var(--cyan);">All 7 Bhinnashtakavarga Grids</summary>${this.renderAllBAVGrids(allBAV)}</details>`;
        html += `</div>`;
        return html;
    },

    mount: function (containerId, opts) {
        const el = document.getElementById(containerId);
        if (!el) { console.warn('ASHTAKVARGA_DISPLAY.mount: container not found', containerId); return; }
        if (!window.ASHTAKVARGA) { el.innerHTML = '<div class="pred-item" style="color:var(--rose)">ASHTAKVARGA core engine not loaded.</div>'; return; }
        el.innerHTML = this.renderFullPanel(opts);
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.ASHTAKVARGA_DISPLAY;