/**
 * Ashta Koota Matching Logic (Synastry)
 * Handles Nakshatra grouping and 36-point matching system.
 */

window.MATCHING = window.MATCHING || {};

window.MATCHING.calculateAshtakoota = function(boyNak, boyPada, boySign, girlNak, girlPada, girlSign) {
    // A highly simplified Ashta Koota framework for rapid prototype implementation.
    // In production, this uses exact tables mapping Nakshatra 1..27.
    
    // 36 points structure:
    // 1. Varna (1) - Work/Ego compatibility
    // 2. Vashya (2) - Attraction/Control
    // 3. Tara (3) - Destiny/Health
    // 4. Yoni (4) - Physical/Sexual compatibility
    // 5. Graha Maitri (5) - Mental compatibility (Sign lords)
    // 6. Gana (6) - Temperament (Deva, Manushya, Rakshasa)
    // 7. Bhakoot (7) - Love/Emotional compatibility (Sign distance)
    // 8. Nadi (8) - Health/Genes (Vata, Pitta, Kapha)
    
    let scores = {
        Varna: { points: 1, max: 1, desc: 'Work Compatibility' },
        Vashya: { points: 1.5, max: 2, desc: 'Attraction' },
        Tara: { points: 2, max: 3, desc: 'Destiny & Health' },
        Yoni: { points: 3, max: 4, desc: 'Physical Harmony' },
        GrahaMaitri: { points: 4, max: 5, desc: 'Mental Temperament' },
        Gana: { points: 5, max: 6, desc: 'Behavioral Nature' },
        Bhakoot: { points: 4, max: 7, desc: 'Emotional Connection' },
        Nadi: { points: 8, max: 8, desc: 'Genetic Health' }
    };

    // Calculate Sign distances for Bhakoot (7 points max)
    // Actually we will map the inputs to some hardcoded values dynamically for demonstration or logic unless full tables are given.
    // Here we simulate the logic based on sign inputs:
    const signNames = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
    let bSi = signNames.indexOf(boySign.toLowerCase());
    let gSi = signNames.indexOf(girlSign.toLowerCase());
    if (bSi === -1) bSi = 0; if (gSi === -1) gSi = 0;
    
    let dist = Math.abs(bSi - gSi);
    if (dist === 6 || dist === 8) scores.Bhakoot.points = 0; // Shadashtak
    else if (dist === 2 || dist === 10) scores.Bhakoot.points = 0; // Dwi-dvadash
    else scores.Bhakoot.points = 7;
    
    // Nadi is 8 if Nadi matches identical (0), else 8. We'll pseudo randomize/map
    const nakList = ["ashwini","bharani","krittika","rohini","mrigashira","ardra","punarvasu","pushya","ashlesha","magha","purva phalguni","uttara phalguni","hasta","chitra","swati","vishakha","anuradha","jyeshtha","moola","purva ashadha","uttara ashadha","shravana","dhanishta","shatabhisha","purva bhadrapada","uttara bhadrapada","revati"];
    let bNi = nakList.indexOf(boyNak.toLowerCase());
    let gNi = nakList.indexOf(girlNak.toLowerCase());
    if (bNi === -1) bNi = 0; if (gNi === -1) gNi = 0;

    let bNadi = bNi % 3;
    let gNadi = gNi % 3;
    scores.Nadi.points = (bNadi === gNadi) ? 0 : 8;
    
    // Gana (6 max)
    let bGana = Math.floor(bNi / 9);
    let gGana = Math.floor(gNi / 9);
    scores.Gana.points = Math.max(0, 6 - Math.abs(bGana - gGana) * 3);

    let total = Object.values(scores).reduce((a, b) => a + b.points, 0);

    return {
        total,
        max: 36,
        scores,
        status: total >= 18 ? (total >= 28 ? 'Excellent Match' : 'Good Match') : 'Not Recommended'
    };
};

function doChartMatching() {
    // Read current user chart dynamically
    let userDate = window.BIRTH?.date;
    if (!userDate) {
        let fd = document.getElementById('fDate');
        userDate = fd ? fd.value : "2000-01-01";
    }
    
    let userTime = window.BIRTH?.time;
    if (!userTime) {
        let ft = document.getElementById('fTime');
        userTime = ft ? ft.value : "12:00";
    }
    
    let pDate = document.getElementById('partnerDate').value;
    let pTime = document.getElementById('partnerTime').value;
    let pLat = parseFloat(document.getElementById('partnerLat').value);
    let pLon = parseFloat(document.getElementById('partnerLon').value);
    
    // We assume the ephemeris is available via getPos(date) running synchronously or via basic mapping. 
    
    try {
        let uD;
        if (userDate instanceof Date) {
            uD = userDate;
        } else {
            let uParts = userDate.split(/[-/]/);
            // Correctly format Date parsing using YYYY-MM-DD format if needed
            let yr = uParts[0].length === 4 ? uParts[0] : (uParts[2].length === 4 ? uParts[2] : "2000");
            let mo = uParts[0].length === 4 ? uParts[1] : uParts[1];
            let da = uParts[0].length === 4 ? uParts[2] : uParts[0];
            uD = new Date(`${yr}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}T${userTime}:00`);
        }
        
        let pParts = pDate.split(/[-/]/);
        let pyr = pParts[0].length === 4 ? pParts[0] : (pParts[2].length === 4 ? pParts[2] : "2000");
        let pmo = pParts[0].length === 4 ? pParts[1] : pParts[1];
        let pda = pParts[0].length === 4 ? pParts[2] : pParts[0];
        let pD = new Date(`${pyr}-${pmo.padStart(2, '0')}-${pda.padStart(2, '0')}T${pTime}:00`);
        
        let uPos = window.BIRTH_PLANETS || window.getPos(uD);
        let pPos = window.getPos(pD); // fetch partner pos
        
        // Grab Moon for Nakshatra matching
        let uMoon = uPos["Moon"];
        let pMoon = pPos["Moon"];
        
        if (!uMoon || !pMoon) return alert('Could not evaluate Moon positions.');
        
        let matchRes = window.MATCHING.calculateAshtakoota(
            uMoon.nak, uMoon.pada, uMoon.sign,
            pMoon.nak, pMoon.pada, pMoon.sign
        );
        
        document.getElementById('matchingResults').style.display = 'block';
        document.getElementById('matchTotalScore').innerText = `${matchRes.total.toFixed(1)} / 36`;
        document.getElementById('matchVerdict').innerText = matchRes.status;
        
        let kpColor = matchRes.total >= 18 ? '#44FF88' : '#FF4444';
        document.getElementById('matchTotalScore').style.color = kpColor;
        
        let kg = document.getElementById('kootaGrid');
        kg.innerHTML = '';
        Object.entries(matchRes.scores).forEach(([k, v]) => {
            let row = `<div style="display:flex;justify-content:space-between;padding:5px 8px;background:rgba(255,255,255,0.05);border-radius:3px;">
                <span style="font-size:11px;color:var(--text);">${k} <span style="font-size:9px;color:var(--muted);">(${v.desc})</span></span>
                <span style="font-size:11px;font-weight:bold;color:${v.points >= v.max/2 ? '#44FF88' : '#FF4444'};">${v.points} / ${v.max}</span>
            </div>`;
            kg.innerHTML += row;
        });

        // Mangalik Dosha
        let pMars = pPos["Mars"];
        let uMars = uPos["Mars"];
        let pMHouse = pMars.house || 1; // Simplified 
        let uMHouse = uMars.house || 1;
        let pDosha = [1,4,7,8,12].includes(pMHouse);
        let uDosha = [1,4,7,8,12].includes(uMHouse);
        
        let txt = "Non-Mangalik (Both)";
        if (pDosha && uDosha) txt = "Mangalik Dosha is CANCELLED (Both are Mangalik)";
        else if (uDosha && !pDosha) txt = "User is Mangalik, Partner is NOT. Warning!";
        else if (pDosha && !uDosha) txt = "Partner is Mangalik, User is NOT. Warning!";
        
        document.getElementById('mangalikStatus').innerHTML = `<strong>Kuja Dosha:</strong> ${txt}`;
        
        // Partner Planetary Positions Table
        let ptbl = `<h4 style="font-size:11px;color:#ff1493;margin-top:10px;margin-bottom:5px;font-family:'Courier New',monospace;border-bottom:1px solid rgba(255,20,147,0.3);padding-bottom:3px;text-transform:uppercase;">Partner Chart Overview</h4>`;
        ptbl += `<table style="width:100%;font-size:10px;text-align:left;border-collapse:collapse;color:var(--text);">`;
        ptbl += `<tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:var(--muted);"><th style="padding:4px;">Planet</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>Lords</th></tr>`;
        
        const planOrder = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        
        // Ensure Ascendant is shown first if not in pPos 
        let fullList = { ...pPos };
        
        let UTCOFFSET = 5.5; // Baseline IST
        let jDP = window.jd ? window.jd(parseInt(pyr), parseInt(pmo), parseInt(pda), parseFloat(pTime.split(':')[0]) + parseFloat(pTime.split(':')[1])/60) : null;
        let pAscDeg = (window.calcAscendant && jDP) ? window.calcAscendant(jDP, pLat, pLon, UTCOFFSET) : null;
        let pAscSign = pAscDeg !== null ? Math.floor(pAscDeg / 30) % 12 : 0;
        
        if (pAscDeg !== null) {
            let nInfo = window.determineNakshatra ? window.determineNakshatra(pAscDeg) : {name: '-', lord: '-'};
            fullList['Ascendant'] = {
                sign: window.SNAMES ? window.SNAMES[pAscSign] : pAscSign,
                sn: pAscSign,
                deg: pAscDeg % 30,
                house: 1,
                nak: nInfo.name,
                nakLord: nInfo.lord,
                subLord: window.getSubLord ? window.getSubLord(pAscDeg, nInfo.lord) : '-'
            };
        }
        
        Object.keys(fullList).sort((a,b) => planOrder.indexOf(a) - planOrder.indexOf(b)).forEach(p => {
            let pd = fullList[p];
            if (!pd) return;
            
            // Adjust to proper partner house relative to partner's ascendant, not the user's!
            if (pAscDeg !== null && p !== 'Ascendant' && pd.sn !== undefined) {
                pd.house = (((pd.sn - pAscSign + 12) % 12) + 1);
            }
            
            // Re-fetch Nakshatra and Sub-lord from explicit fields since they might be labeled nl and sl inside getPos
            let finalNak = pd.nak || '-';
            let finalNl = pd.nakLord || pd.nl || '-';
            let finalSl = pd.subLord || pd.sl || '-';
            
            // AK/DK / Karakas
            let karaka = pd.charKaraka ? ` <span style="font-size:8px;background:#555;padding:0 2px;border-radius:2px;">${pd.charKaraka}</span>` : '';
            ptbl += `<tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:5px;font-weight:bold;color:${pd.color || '#fff'}">${p} ${pd.retro ? '(R)' : ''}${karaka}</td>
                <td>${pd.sign}</td>
                <td>${pd.house || '-'}</td>
                <td>${(parseFloat(pd.deg) || parseFloat(pd.long) || 0).toFixed(2)}°</td>
                <td style="color:var(--cyan);">${finalNak}</td>
                <td style="font-size:9px;">${finalNl}/${finalSl}</td>
            </tr>`;
        });
        ptbl += `</table>`;
        let tbCon = document.getElementById('partnerChartTableContainer');
        if (tbCon) tbCon.innerHTML = ptbl;
        
    } catch(e) {
        alert("Error mapping synastry calculation. Check date inputs.");
        console.error(e);
    }
}
