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
 // ===================== BAV IN NATAL KUNDALI (not a grid) =====================

    /**
     * Renders one <canvas> placeholder per planet, labeled with its BAV total.
     * Actual bindus are painted in by drawAllBAVKundalis() once this markup is
     * in the DOM (canvases can't be painted from an HTML string).
     */
    renderAllBAVKundalis: function (allBAV) {
        const A = window.ASHTAKVARGA;
        const cards = A.PLANETS7.map(p => {
            const total = allBAV[p] ? allBAV[p].total : '';
            return `<div style="flex:1 1 240px;min-width:210px;max-width:280px;">
                <div style="font-size:9.5px;font-weight:bold;color:var(--gold,#FFD700);margin-bottom:3px;text-align:center;">${p}'s Bhinnashtakavarga (total ${total})</div>
                <canvas id="bavKundali_${p}" width="250" height="250" style="width:100%;max-width:250px;display:block;margin:0 auto;"></canvas>
              </div>`;
        }).join('');
        return `<div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:6px;">${cards}</div>`;
    },

    /**
     * Paints one planet's bindus into a North-Indian diamond kundali (same house
     * geometry as the app's main drawDChart), instead of the flat sign-by-sign
     * grid. Each house shows: the sign number occupying it, that planet's bindu
     * count there (color-coded strong/average/weak), and which natal
     * planets/Ascendant sit in that house for context.
     */
    drawBAVKundali: function (canvasId, planetName, allBAV, natalPlanets, ascSignNum) {
        const A = window.ASHTAKVARGA;
        const cv = document.getElementById(canvasId);
        if (!cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;
        const S = cv.width || 250;
        const getVar = (name, fallback) => {
            try {
                const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
                return v || fallback;
            } catch (e) { return fallback; }
        };

        ctx.clearRect(0, 0, S, S);
        ctx.fillStyle = getVar('--bg', '#0a0a0a');
        ctx.fillRect(0, 0, S, S);

        const M = 8, L = S - 2 * M, x0 = M, y0 = M, U = L / 4;
        const P = (c, r) => ({ x: x0 + c * U, y: y0 + r * U });
        const p00 = P(0, 0), p20 = P(2, 0), p40 = P(4, 0);
        const p02 = P(0, 2), p11 = P(1, 1), p31 = P(3, 1), p22 = P(2, 2), p13 = P(1, 3), p33 = P(3, 3), p42 = P(4, 2);
        const p04 = P(0, 4), p24 = P(2, 4), p44 = P(4, 4);

        const ln = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
        ctx.strokeStyle = getVar('--border3', '#555555') + '88';
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, y0, L, L);
        ln(p20, p02); ln(p02, p24); ln(p24, p42); ln(p42, p20); // Inner diamond
        ln(p00, p44); ln(p40, p04); // Large diagonals

        const avg3 = (a, b, c) => ({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 });
        const avg4 = (a, b, c, d) => ({ x: (a.x + b.x + c.x + d.x) / 4, y: (a.y + b.y + c.y + d.y) / 4 });
        const CE = {
            1: avg4(p20, p11, p22, p31), 2: avg3(p00, p20, p11), 3: avg3(p00, p02, p11),
            4: avg4(p02, p11, p22, p13), 5: avg3(p04, p02, p13), 6: avg3(p04, p24, p13),
            7: avg4(p24, p13, p22, p33), 8: avg3(p44, p24, p33), 9: avg3(p44, p42, p33),
            10: avg4(p42, p31, p22, p33), 11: avg3(p40, p42, p31), 12: avg3(p40, p20, p31)
        };

        const bav = allBAV[planetName];
        if (!bav) return;

        const binduColorMap = { exceptional: '#00FFAA', strong: '#00DD77', good: '#FFD700', average: '#FFD700', weak: '#FF9955', 'very-weak': '#FF4477' };

        // Which planets (+ Ascendant) occupy each house, for context
        const hmap = {}; for (let i = 1; i <= 12; i++) hmap[i] = [];
        Object.entries(natalPlanets || {}).filter(([p]) => !['Uranus', 'Neptune', 'Pluto'].includes(p)).forEach(([p, pd]) => {
            const h = ((pd.sn - ascSignNum + 12) % 12) + 1;
            if (h >= 1 && h <= 12) hmap[h].push(p === planetName ? p.toUpperCase() : p.slice(0, 2));
        });
        hmap[1].unshift('As');

        for (let h = 1; h <= 12; h++) {
            const sn1 = ((ascSignNum + h - 1) % 12) + 1;
            const sn0 = sn1 - 1;
            const c = CE[h];
            if (!c) continue;
            const bindus = bav.bindus[sn0];
            const strength = A.classifyBAVStrength(planetName, bindus);
            const col = binduColorMap[strength] || '#AAAAAA';

            ctx.textAlign = 'center';
            ctx.font = '8px Courier New';
            ctx.fillStyle = getVar('--muted', '#888888');
            ctx.fillText(String(sn1), c.x, c.y - 15);

            ctx.font = 'bold 16px Courier New';
            ctx.fillStyle = col;
            ctx.fillText(String(bindus), c.x, c.y + 3);

            const occ = hmap[h].join(' ');
            if (occ) {
                ctx.font = '7px Courier New';
                ctx.fillStyle = getVar('--text', '#eeeeee');
                ctx.fillText(occ, c.x, c.y + 15);
            }
        }
        ctx.textAlign = 'left';
    },

    /** Draws all 7 planets' Bhinnashtakavarga kundalis into the canvases produced by renderAllBAVKundalis(). */
    drawAllBAVKundalis: function (allBAV, natalPlanets, ascSignNum) {
        window.ASHTAKVARGA.PLANETS7.forEach(p => this.drawBAVKundali(`bavKundali_${p}`, p, allBAV, natalPlanets, ascSignNum));
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
          // Bhinnashtakavarga — shown in the natal kundali (diamond chart) per planet, not a flat grid
        html += `<div style="margin-top:10px;">
            <div style="font-size:10.5px;font-weight:bold;color:var(--gold,#FFD700);border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:4px;margin-bottom:6px;">📊 Bhinnashtakavarga — In Natal Kundali (per planet)</div>
            ${this.renderAllBAVKundalis(allBAV)}
          </div>`;

        // Direction analysis chart — shown directly below the Bhinnashtakavarga charts
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
        // Ashtakavarga Secrets (four Khandas, marriage harmony, business ratios, transit secrets)
        try {
            if (window.ASHTAKVARGA_SECRETS_DISPLAY && A.SECRETS) {
                html += window.ASHTAKVARGA_SECRETS_DISPLAY.renderAllSecretsForAshtakvargaPanel({
                    natalPlanets: natalPlanets, ascSignNum: ascSignNum, ascDeg: ascDeg,
                    allBAV: allBAV, sav: sav, transitPlanets: transitPlanets,lords: lords,
                    birthDate: opts.birthDate instanceof Date ? opts.birthDate : (window.BIRTH && window.BIRTH.date instanceof Date ? window.BIRTH.date : null)
                });
            }
        } catch (e) { console.error('Ashtakavarga Secrets section failed:', e); }
// Classical Yogas relevant to strength/fortune (Raja Yoga, Bhava-strength, etc.)
        try {
            if (typeof window.buildThemedYogaSection === 'function') {
                const chartForYogas = { planets: natalPlanets, asc: { sn: ascSignNum, deg: ascDeg } };
                html += window.buildThemedYogaSection(chartForYogas, {
                    title: 'Classical Yogas (Strength & Fortune)',
                    icon: '🌟',
                    color: 'var(--gold)',
                    categories: ['Raja Yoga', 'Vipareeta Raja Yoga', 'Auspicious', 'Special/Rare', 'Bhava Strength Yoga'],
                    keywords: ['fortune', 'power', 'authority', 'strength', 'protection', 'prosperity', 'respect', 'greatness']
                });
            }
        } catch (e) { console.error('Ashtakavarga themed yoga section failed:', e); }

        html += `</div>`;

        // Canvases referenced above don't exist in the DOM yet (renderFullPanel
        // only returns an HTML string — the caller assigns it to innerHTML,
        // possibly directly instead of via mount()). Schedule the paint for the
        // next tick, by which point that assignment has already happened.
        const self = this;
        setTimeout(function () {
            try { self.drawAllBAVKundalis(allBAV, natalPlanets, ascSignNum); }
            catch (e) { console.error('Failed to draw Bhinnashtakavarga kundalis:', e); }
        }, 0);

        return html;
    },

    mount: function (containerId, opts) {
        const el = document.getElementById(containerId);
        if (!el) { console.warn('ASHTAKVARGA_DISPLAY.mount: container not found', containerId); return; }
        if (!window.ASHTAKVARGA) { el.innerHTML = '<div class="pred-item" style="color:var(--rose)">ASHTAKVARGA core engine not loaded.</div>'; return; }
        // renderFullPanel() self-schedules painting the BAV kundali canvases
        // once this HTML is in the DOM, so no extra draw step is needed here.
        el.innerHTML = this.renderFullPanel(opts);
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.ASHTAKVARGA_DISPLAY;