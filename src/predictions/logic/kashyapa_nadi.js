/**
 * Kashyapa Hora Nadi System
 * Predicts intent and situational context based on arrival time.
 * Calculates current Hora, Direction (Disha), and Causative Planets (2,3,5,7,11).
 */

window.KASHYAPA_NADI = window.KASHYAPA_NADI || {};

// Zodiac directions (standard Vedic assignment: Fiery=East, Earthy=South, Airy=West, Watery=North)
const KASHYAPA_SIGN_DIRECTIONS = {
    Aries: "East (Fiery, New beginnings)",
    Taurus: "South (Earthy, Steady, Material)",
    Gemini: "West (Airy, Travel, Communication)",
    Cancer: "North (Watery, Home, Changeable)",
    Leo: "East (Fiery, Powerful, Central)",
    Virgo: "South (Earthy, Detailed, Disputed)",
    Libra: "West (Airy, Distant places, Commerce)",
    Scorpio: "North (Watery, Sudden, Hidden)",
    Sagittarius: "East (Fiery, Long journeys, Spirituality)",
    Capricorn: "South (Earthy, Work, Karma)",
    Aquarius: "West (Airy, Distant/Abroad, Collective)",
    Pisces: "North (Watery, Endings, Distant lands/Moksha)"
};

// Simplified combination keywords for Mook Prashna deductions
const PLANET_KEYWORDS = {
    "Sun": "Government, Father, Prestige, Authority",
    "Moon": "Mind, Mother, Change, Travel, Liquid",
    "Mars": "Property, Surgery, Brothers, Disputes",
    "Mercury": "Commerce, Communication, Education, Land",
    "Jupiter": "Wealth, Children, Divine grace, Expansion",
    "Venus": "Marriage, Finance, Vehicles, Women",
    "Saturn": "Karma, Work, Delay, Real estate, Old things",
    "Rahu": "Foreign, Sudden, Illusion, Obsession, Secret",
    "Ketu": "Moksha, Legal, Blockage, Dispute, Renunciation"
};

// Returns standard array of planets for current exact time
function getCurrentPlanets() {
    let now = new Date();
    // Reusing the getPos caching from index
    // Fallback if not available
    if (window.getPos) {
        return window.getPos(now);
    }
    return window.BIRTH_PLANETS || {};
}

function getHoraLordNow() {
    let now = new Date();
    if (!window.jd || !window.getHora) return { lord: "Unknown" };

    // Standard geographic fallbacks if unavailable dynamically
    let lat = window.BIRTH?.lat || 28.61;
    let lon = window.BIRTH?.lon || 77.20;
    let utcOff = window.BIRTH?.utcOff || 5.5;

    let d = now.getDate(), m = now.getMonth() + 1, y = now.getFullYear();
    let timeRaw = now.getHours() + (now.getMinutes() / 60);
    let jday = window.jd(y, m, d, timeRaw - utcOff);

    // Call Hora Calculator
    let horas = window.getHora(jday, lat, lon, utcOff);

    // Find active Hora for `timeRaw`
    let active = null;
    let timeInDay = timeRaw;
    
    // Simplification for UI: `getHora` returns an array of object segments {name, start}
    // We must find the segment encompassing the current time. 
    // Time conversions inside index.html might be raw UTC/Local 0-24 bounds.
    // So we iterate through the returned segments backwards to find the highest start time <= current time.
    for (let i = horas.length - 1; i >= 0; i--) {
        if (timeRaw >= horas[i].start) {
            active = horas[i];
            break;
        }
    }
    
    // If it spans midnight edge case logic
    if (!active) active = horas[0];

    return active;
}

window.KASHYAPA_NADI.evaluate = function() {
    let hora = getHoraLordNow();
    if (!hora || !hora.lord || hora.lord === "Unknown") throw new Error("Could not compute current Hora.");

    let pos = getCurrentPlanets();
    if (!pos || Object.keys(pos).length === 0) throw new Error("Ephemeris positions unavailable.");

    let lord = hora.lord;
    let lordPos = pos[lord];
    if (!lordPos) throw new Error(`Could not find coordinate for Hora Lord ${lord}.`);

    let lordSign = lordPos.sign;
    let sn = lordPos.sn; // Sign number 0-11
    let dir = KASHYAPA_SIGN_DIRECTIONS[lordSign] || "Unknown";

    // Deduce Caulities (2nd, 3rd, 5th, 7th, 11th from Hora Sign)
    let causativeHouses = [1, 2, 4, 6, 10]; // 0-indexed offsets for 2, 3, 5, 7, 11
    let causativeSigns = causativeHouses.map(offset => (sn + offset) % 12);

    let causativePlanets = [];
    let conjunctPlanets = []; // In SAME sign

    Object.keys(pos).forEach(p => {
        if (p === lord || p === "Ascendant") return;
        let psn = pos[p].sn;
        
        if (psn === sn) {
            conjunctPlanets.push(p);
            causativePlanets.push(`${p} (Conjunct)`);
        } else if (causativeSigns.includes(psn)) {
            // Find which relative house it is
            let offset = (psn - sn + 12) % 12;
            causativePlanets.push(`${p} (${offset + 1}th)`);
            conjunctPlanets.push(p); // We will use all these for combinations
        }
    });

    let deductions = [];
    deductions.push(`Primary Intent via **${lord}**: ${PLANET_KEYWORDS[lord]}.`);
    
    conjunctPlanets.forEach(p => {
        if (PLANET_KEYWORDS[p]) {
            deductions.push(`Influence of **${p}**: ${PLANET_KEYWORDS[p]}.`);
        }
    });

    // Special combos (like Saturn + Mercury or Venus)
    let joined = [lord, ...conjunctPlanets];
    if (joined.includes("Saturn") && joined.includes("Mercury")) deductions.push("⭐ **Special Combo**: Saturn + Mercury indicates property dealing, commerce, or land matters linked to travel.");
    if (joined.includes("Saturn") && joined.includes("Venus")) deductions.push("⭐ **Special Combo**: Saturn + Venus indicates financial gains, vehicle/luxury acquisition, or marriage discussions.");
    if (joined.includes("Mercury") && joined.includes("Venus")) deductions.push("⭐ **Special Combo**: Mercury + Venus indicates highly favorable communication regarding wealth, art, or partnerships.");
    if (joined.includes("Moon") && joined.includes("Rahu")) deductions.push("⚠️ **Special Combo**: Moon + Rahu indicates significant confusion, foreign elements, or mental anxiety regarding the decision.");

    return {
        horaLord: lord,
        lordSign: lordSign,
        direction: dir,
        causative: causativePlanets.length > 0 ? causativePlanets.join(", ") : "None",
        deductions: deductions
    };
};

document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('btnKashyapaEval');
    if (btn) {
        btn.addEventListener('click', () => {
            try {
                let res = window.KASHYAPA_NADI.evaluate();
                let cont = document.getElementById('kashyapaResultContainer');
                cont.style.display = 'block';

                document.getElementById('kashyapaHoraLord').innerText = `Current Hora Lord: ${res.horaLord} (${res.lordSign})`;
                document.getElementById('kashyapaDirection').innerText = `Direction (Disha): ${res.direction}`;
                document.getElementById('kashyapaCausing').innerText = res.causative;
                
                let html = res.deductions.map(d => `<div style="margin-bottom:4px;border-left:2px solid var(--amber);padding-left:6px;">${d}</div>`).join('');
                document.getElementById('kashyapaDeductions').innerHTML = html;

            } catch (err) {
                alert("Error in Kashyapa Nadi Calculation: " + err.message);
                console.error(err);
            }
        });
    }
});
