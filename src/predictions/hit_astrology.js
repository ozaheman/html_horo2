"use strict";

window.HitAstrologyEngine = (function() {
  
  // Vastu Mappings
  const VASTU_MAPPING = {
    Sun: { dir: "East", zone: "Main Entrance, Verandah", color: "Orange/Gold", element: "Fire (Light)" },
    Moon: { dir: "North-West (Vayavya)", zone: "Guest Room, Finished Goods, Pets", color: "White", element: "Air" },
    Mars: { dir: "South", zone: "Heavy items, Store, Master Bedroom", color: "Red", element: "Earth/Fire" },
    Mercury: { dir: "North", zone: "Safe, Cash Box, Open Windows", color: "Green", element: "Water/Space" },
    Jupiter: { dir: "North-East (Ishan)", zone: "Pooja Room, Meditation, Water source", color: "Yellow", element: "Water/Ether" },
    Venus: { dir: "South-East (Agneya)", zone: "Kitchen, Heaters, Generators", color: "Pink/White", element: "Fire" },
    Saturn: { dir: "West", zone: "Dining, Overhead Tank, Main Door", color: "Blue/Black", element: "Air/Ether" },
    Rahu: { dir: "South-West (Nairutya)", zone: "Wardrobes, Heavy Machinery, Master Bedroom", color: "Grey/Brown", element: "Earth" },
    Ketu: { dir: "Center/Brahmasthan (often paired with Rahu SW)", zone: "Open Courtyard, Lift, Staircase", color: "Multi", element: "Space" }
  };

  const DIGNITY = {
    Sun: { ex: 10, de: 190, own: [4] },
    Moon: { ex: 33, de: 213, own: [3] },
    Mars: { ex: 298, de: 118, own: [0, 7] },
    Mercury: { ex: 165, de: 345, own: [2, 5] },
    Jupiter: { ex: 95, de: 275, own: [8, 11] },
    Venus: { ex: 357, de: 177, own: [1, 6] },
    Saturn: { ex: 200, de: 20, own: [9, 10] },
    Rahu: { ex: 60, de: 240, own: [10] },
    Ketu: { ex: 240, de: 60, own: [7] }
  };

  const NAT_REL = {
    Sun: { Sun: 0, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: -1, Saturn: -1, Rahu: -1, Ketu: -1 },
    Moon: { Sun: 1, Moon: 0, Mars: 0, Mercury: 1, Jupiter: 1, Venus: 0, Saturn: 0, Rahu: -1, Ketu: -1 },
    Mars: { Sun: 1, Moon: 0, Mars: 0, Mercury: -1, Jupiter: 1, Venus: 0, Saturn: -1, Rahu: -1, Ketu: 1 },
    Mercury: { Sun: 0, Moon: -1, Mars: 0, Mercury: 0, Jupiter: 0, Venus: 1, Saturn: 1, Rahu: 1, Ketu: -1 },
    Jupiter: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 0, Venus: -1, Saturn: -1, Rahu: -1, Ketu: 1 },
    Venus: { Sun: -1, Moon: 0, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 0, Saturn: 1, Rahu: 1, Ketu: 0 },
    Saturn: { Sun: -1, Moon: -1, Mars: -1, Mercury: 1, Jupiter: -1, Venus: 1, Saturn: 0, Rahu: 1, Ketu: 0 },
    Rahu: { Sun: -1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: -1, Venus: 1, Saturn: 1, Rahu: 0, Ketu: -1 },
    Ketu: { Sun: 0, Moon: -1, Mars: 1, Mercury: 0, Jupiter: 1, Venus: 0, Saturn: 0, Rahu: -1, Ketu: 0 },
  };

  const HIT_ASPECTS = [0, 90, 120, 180]; // Major hits: Conj, Square, Trine, Opp

  function getDignityScore(planet, signNum, degree) {
    let score = "Neutral";
    let scoreVal = 0;
    const d = DIGNITY[planet];
    if (d) {
      const sid = signNum * 30 + degree;
      if (Math.abs(sid - d.ex) < 15) { score = "Exalted"; scoreVal = 5; }
      else if (Math.abs(sid - d.de) < 15) { score = "Debilitated"; scoreVal = -5; }
      else if (d.own.includes(signNum)) { score = "Own Sign"; scoreVal = 3; }
    }
    return { label: score, val: scoreVal };
  }

  function getRelationshipStr(p1, p2) {
    if (p1 === p2) return { label: "Same", val: 2 };
    const r = NAT_REL[p1][p2];
    if (r > 0) return { label: "Ati-Mitra/Friend", val: 2 };
    if (r < 0) return { label: "Enemy", val: -2 };
    return { label: "Neutral", val: 0 };
  }

  function detectHits(natal, transit) {
    const hits = [];
    const planets = Object.keys(natal);
    
    planets.forEach(tP => {
      const tPos = transit[tP];
      const tSign = tPos.sn;
      
      planets.forEach(nP => {
        const nPos = natal[nP];
        const diff = Math.abs(tPos.sid - nPos.sid);
        const dist = Math.min(diff, 360 - diff);
        
        let hitType = null;
        if (dist <= 8) hitType = "Conjunction";
        else if (Math.abs(dist - 90) <= 8) hitType = "Square (90°)";
        else if (Math.abs(dist - 120) <= 8) hitType = "Trine (120°)";
        else if (Math.abs(dist - 180) <= 8) hitType = "Opposition (180°)";

        if (hitType) {
          const rel = getRelationshipStr(tP, nP);
          let score = rel.val;
          if (hitType === "Trine (120°)") score += 2;
          if (hitType === "Opposition (180°)" && rel.val < 0) score -= 3;
          if (hitType === "Square (90°)") score -= 1;
          
          hits.push({
            transitPlanet: tP,
            natalPlanet: nP,
            hitType: hitType,
            score: score,
            relLabel: rel.label,
            houseHit: nPos.house
          });
        }
      });
    });
    return hits;
  }

  function generateDashboardHTML(natal, transit, hits) {
    // Generate Matrix
    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    let matrixHTML = `<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:10px; font-family:'Courier New',monospace; border:1px solid var(--border);">`;
    
    // Header
    matrixHTML += `<thead><tr style="background:var(--panel2);"><th style="padding:4px; border:1px solid var(--border);">Transit \\ Natal</th>`;
    planets.forEach(p => matrixHTML += `<th style="padding:4px; border:1px solid var(--border);">${p.substring(0,3)}</th>`);
    matrixHTML += `</tr></thead><tbody>`;

    let totalScore = 0;

    // Body
    planets.forEach(tP => {
      matrixHTML += `<tr><td style="padding:4px; border:1px solid var(--border); font-weight:bold; background:var(--panel2);">${tP.substring(0,3)}</td>`;
      planets.forEach(nP => {
        const matchingHits = hits.filter(h => h.transitPlanet === tP && h.natalPlanet === nP);
        if (matchingHits.length > 0) {
          const topHit = matchingHits[0];
          totalScore += topHit.score;
          const bg = topHit.score > 0 ? "rgba(0,255,136,0.15)" : topHit.score < 0 ? "rgba(255,51,68,0.15)" : "rgba(255,215,0,0.15)";
          const color = topHit.score > 0 ? "var(--green)" : topHit.score < 0 ? "var(--rose)" : "var(--gold)";
          matrixHTML += `<td style="padding:4px; border:1px solid var(--border); text-align:center; background:${bg}; color:${color};" title="${topHit.hitType} | ${topHit.relLabel}">${topHit.score > 0 ? '+'+topHit.score : topHit.score}</td>`;
        } else {
          matrixHTML += `<td style="padding:4px; border:1px solid var(--border); text-align:center; color:var(--muted);">-</td>`;
        }
      });
      matrixHTML += `</tr>`;
    });
    
    matrixHTML += `</tbody></table></div>`;
    
    const overallVerdict = totalScore > 10 ? "EXCELLENT HARMONY" : totalScore > 0 ? "AVERAGE / MIXED" : "CHALLENGING PHASE";
    const verdictColor = totalScore > 10 ? "var(--green)" : totalScore > 0 ? "var(--gold)" : "var(--rose)";

    return `
      <div style="margin-bottom:15px;">
        <h3 style="color:var(--amber); margin-bottom:8px; font-size:12px;">📊 Numerical HIT Scoring Matrix</h3>
        ${matrixHTML}
        <div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:4px; text-align:center;">
          <div style="font-size:10px; color:var(--muted); text-transform:uppercase;">Overall Transit Score</div>
          <div style="font-size:24px; font-weight:bold; font-family:Palatino,serif; color:${verdictColor}; margin:5px 0;">${totalScore > 0 ? '+'+totalScore : totalScore}</div>
          <div style="font-size:12px; font-weight:bold; color:${verdictColor};">${overallVerdict}</div>
        </div>
      </div>
    `;
  }

  function getVastuAdjustments(hits) {
    const criticalHits = hits.filter(h => h.score <= -1 || h.score >= 3);
    const affectedDirs = new Set();
    
    let html = `<h3 style="color:var(--amber); margin-bottom:8px; font-size:12px;">🏠 Practical Vastu & Layout Remedies</h3>`;
    html += `<div style="font-size:10px; color:var(--muted); margin-bottom:10px;">Applied to Warehouses, Villas, and Offices based on currently active planetary hits.</div>`;
    
    html += `<div style="display:grid; gap:10px;">`;
    criticalHits.forEach(h => {
      const v = VASTU_MAPPING[h.transitPlanet];
      if (!v || affectedDirs.has(v.dir)) return;
      affectedDirs.add(v.dir);

      const isNegative = h.score < 0;
      const borderCol = isNegative ? 'var(--rose)' : 'var(--green)';
      
      html += `
        <div style="padding:10px; background:rgba(255,255,255,0.03); border-left:3px solid ${borderCol}; border-radius:4px;">
          <div style="font-size:11px; font-weight:bold; color:${borderCol}; margin-bottom:4px;">${v.dir} Axis (${h.transitPlanet})</div>
          <div style="font-size:10px; color:var(--text); line-height:1.4;">
            <strong>Type:</strong> ${isNegative ? 'Negative Hit / Blockage' : 'Positive Hit / Expansion'}<br>
            <strong>Villa/Office Zone:</strong> ${v.zone}<br>
            <strong>Warehouse Application:</strong> ${isNegative ? `Ensure ${v.dir} is strictly clutter-free. Move dead stock away from here. Do not place water/fire conflicting items.` : `Activate ${v.dir} with active inventory, bright lighting (${v.color}), and keep this area ventilated for maximizing profits.`}<br>
            <strong>Remedy/Action:</strong> ${isNegative ? `Place a ${v.element} element balancer. Avoid renovations in this zone during this transit.` : `Utilize this zone for primary business operations or resting.`}
          </div>
        </div>
      `;
    });
    html += `</div>`;
    
    if(criticalHits.length === 0) {
      html += `<div style="font-size:10.5px; color:var(--text);">No critical Vastu adjustments required at this exact transit moment. Maintain general Brahmasthan (center) openness.</div>`;
    }

    return html;
  }

  function getPlanetDetailedReport(natal, transit, hits) {
    let html = `<h3 style="color:var(--amber); margin-bottom:8px; font-size:12px; margin-top:20px;">🪐 Detailed Planet Effects & Remedies</h3>`;
    html += `<div style="display:grid; gap:10px;">`;

    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    
    planets.forEach(p => {
      const tPos = transit[p];
      const dig = getDignityScore(p, tPos.sn, parseFloat(tPos.deg));
      const pColor = dig.val > 0 ? 'var(--green)' : dig.val < 0 ? 'var(--rose)' : 'var(--cyan)';
      const pHits = hits.filter(h => h.transitPlanet === p);

      let hitsStr = "";
      if (pHits.length > 0) {
        hitsStr = `<div style="margin-top:6px; padding:6px; background:rgba(0,0,0,0.2); border-radius:4px;">`;
        pHits.forEach(h => {
          const htColor = h.score > 0 ? "var(--green)" : h.score < 0 ? "var(--rose)" : "var(--gold)";
          hitsStr += `<div style="font-size:9px; color:var(--text); margin-bottom:2px;">
            HITTING Natal <strong style="color:var(--gold)">${h.natalPlanet}</strong> via ${h.hitType} (${h.relLabel}): 
            <span style="color:${htColor}; font-weight:bold;">${h.score > 0 ? '+'+h.score : h.score}</span>
          </div>`;
        });
        hitsStr += `</div>`;
      } else {
        hitsStr = `<div style="margin-top:6px; font-size:9px; color:var(--muted);">No major exact hits on natal planets currently.</div>`;
      }

      html += `
        <div style="padding:10px; border:1px solid var(--border); border-radius:4px; background:rgba(10,10,25,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div style="font-size:11px; font-weight:bold; color:var(--gold2);">${p} in House ${tPos.house}</div>
            <div style="font-size:9px; font-family:'Courier New',monospace; padding:2px 6px; background:${pColor}22; color:${pColor}; border-radius:3px;">${dig.label}</div>
          </div>
          <div style="font-size:10px; color:var(--text); line-height:1.4;">
            <strong>Cause:</strong> Transit in ${tPos.sign} acting upon Natal House ${tPos.house}.<br>
            <strong>Effect:</strong> ${dig.val < 0 ? 'Creates friction, delays, or misunderstandings.' : 'Promotes flow, success, and clear communication in this domain.'}
            ${hitsStr}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  return {
    generateReport: function(natalPlanets, ascendant, transitPlanets, currentDate) {
      if (!natalPlanets || !transitPlanets) return "<div style='color:red'>Data missing.</div>";
      
      const hits = detectHits(natalPlanets, transitPlanets);
      let reportHtml = "";
      
      reportHtml += generateDashboardHTML(natalPlanets, transitPlanets, hits);
      reportHtml += getVastuAdjustments(hits);
      reportHtml += getPlanetDetailedReport(natalPlanets, transitPlanets, hits);

      return reportHtml;
    }
  };

})();
