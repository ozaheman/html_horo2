/**
 * Sankhya Prasna (Numerical Oracle) Logic
 * Method: evaluates an input number from 1 to 108.
 * Sign = N % 12 (if 0, Sign = 12).
 * Verifies friendliness between the Sign Lord and User's Moon Lord.
 */

window.SANKHYA_PRASNA = window.SANKHYA_PRASNA || {};

// Zodiac sign mapping (1=Aries ... 12=Pisces)
const signLordsMap = [
    null, // 0 buffer
    "Mars",     // 1 Aries
    "Venus",    // 2 Taurus
    "Mercury",  // 3 Gemini
    "Moon",     // 4 Cancer
    "Sun",      // 5 Leo
    "Mercury",  // 6 Virgo
    "Venus",    // 7 Libra
    "Mars",     // 8 Scorpio
    "Jupiter",  // 9 Sagittarius
    "Saturn",   // 10 Capricorn
    "Saturn",   // 11 Aquarius
    "Jupiter"   // 12 Pisces
];

// Determine Planetary Friendships (Basic traditional logic)
function checkRelationship(lord1, lord2) {
    if (!lord1 || !lord2) return "Neutral";
    if (lord1 === lord2) return "Same Planet (Very Favorable)";
    
    // Natural friendship table (simplified)
    const friends = {
        "Sun": ["Moon", "Mars", "Jupiter"],
        "Moon": ["Sun", "Mercury"],
        "Mars": ["Sun", "Moon", "Jupiter"],
        "Mercury": ["Sun", "Venus"],
        "Jupiter": ["Sun", "Moon", "Mars"],
        "Venus": ["Mercury", "Saturn"],
        "Saturn": ["Mercury", "Venus"]
    };
    
    const enemies = {
        "Sun": ["Venus", "Saturn"],
        "Moon": ["Rahu", "Ketu"], // Normally Moon has no formal enemies besides nodes but treating generically
        "Mars": ["Mercury"],
        "Mercury": ["Moon"],
        "Jupiter": ["Mercury", "Venus"],
        "Venus": ["Sun", "Moon"],
        "Saturn": ["Sun", "Moon", "Mars"]
    };
    
    if (friends[lord1]?.includes(lord2)) return "Friendly";
    if (enemies[lord1]?.includes(lord2)) return "Enemy";
    return "Neutral";
}

window.SANKHYA_PRASNA.evaluate = function(number, userMoonSign) {
    if (isNaN(number) || number < 1 || number > 108) {
        throw new Error("Please enter a valid number between 1 and 108.");
    }
    
    let signNum = number % 12;
    if (signNum === 0) signNum = 12;
    
    // Outcome Logic
    // 1, 5, 9 -> Fiery signs (Yes, highly favorable)
    // 2, 6, 10 -> Earthy signs (Neutral/Favorable, requires hard work)
    // 3, 7, 11 -> Airy signs (Success through help)
    // 4, 8, 12 -> Watery signs (No / Difficult)
    
    let outcome = "";
    let classification = "Neutral";
    let color = "white";
    
    if ([1, 5, 9].includes(signNum)) {
        outcome = "Highly Favorable! Yes, you will succeed.";
        classification = "Fiery / Auspicious";
        color = "#44FF88"; // Green
    } else if ([2, 6, 10].includes(signNum)) {
        outcome = "Neutral to Favorable. Yes, but you must work hard or be patient.";
        classification = "Earthy / Grounded";
        color = "#FFD700"; // Gold
    } else if ([3, 7, 11].includes(signNum)) {
        outcome = "Success! Yes, primarily through the help or communication of others.";
        classification = "Airy / Communicative";
        color = "#44CCFF"; // Blue
    } else if ([4, 8, 12].includes(signNum)) {
        outcome = "Difficult. Likely a 'No', or results will not align with your expectations.";
        classification = "Watery / Obstacles";
        color = "#FF4444"; // Red
    }
    
    // Lord validations
    let targetLord = signLordsMap[signNum];
    
    // Determine User Moon Lord
    let moonSignIdx = -1;
    let moonLord = "Unknown";
    
    // userMoonSign usually comes as a string e.g., "Aries", or as an index 0-11
    if (typeof userMoonSign === 'number') {
        moonSignIdx = (userMoonSign % 12) + 1; // 1-12
        moonLord = signLordsMap[moonSignIdx];
    } else if (typeof userMoonSign === 'string') {
        const signs = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
        let idx = signs.indexOf(userMoonSign.toLowerCase());
        if (idx !== -1) {
            moonSignIdx = idx + 1;
            moonLord = signLordsMap[moonSignIdx];
        }
    }
    
    let relationship = "Unknown";
    if (moonLord !== "Unknown") {
        relationship = checkRelationship(moonLord, targetLord);
    }

    return {
        signNum,
        targetLord,
        moonLord,
        relationship,
        outcome,
        classification,
        color
    };
};

document.addEventListener('DOMContentLoaded', () => {
    const btnRand = document.getElementById('btnSankhyaRand');
    const btnEval = document.getElementById('btnSankhyaEval');
    const inputNum = document.getElementById('sankhyaNumInput');
    
    if (btnRand) {
        btnRand.addEventListener('click', () => {
            // Standard pseudo-random logic between 1 and 108
            // Can be tied to Time MS as per astrology meditational methods
            const rand = Math.floor(Math.random() * 108) + 1;
            inputNum.value = rand;
        });
    }
    
    if (btnEval) {
        btnEval.addEventListener('click', () => {
            try {
                let userMoon = window.BIRTH_PLANETS?.Moon?.sign || 0; 
                // e.g. "Taurus" or an index depending on engine setup.
                
                let res = window.SANKHYA_PRASNA.evaluate(parseInt(inputNum.value), userMoon);
                
                const container = document.getElementById('sankhyaResultContainer');
                container.style.display = 'block';
                container.style.borderColor = res.color;
                
                document.getElementById('sankhyaResultHeader').innerText = `Sign Result: ${res.signNum} (${res.targetLord})`;
                document.getElementById('sankhyaResultHeader').style.color = res.color;
                
                document.getElementById('sankhyaResultVerdict').innerText = res.outcome;
                
                let relColor = res.relationship.includes("Enem") ? "#FF4444" : (res.relationship.includes("Friend") || res.relationship.includes("Same") ? "#44FF88" : "var(--muted)");
                
                document.getElementById('sankhyaResultDetails').innerHTML = `
                    <div><strong>Classification:</strong> <span style="color:${res.color}">${res.classification}</span></div>
                    <div><strong>Your Moon Lord:</strong> ${res.moonLord}</div>
                    <div><strong>Target Lord:</strong> ${res.targetLord}</div>
                    <div><strong>Lord Friendship:</strong> <span style="color:${relColor}">${res.relationship}</span></div>
                `;
                
            } catch (err) {
                alert(err.message);
            }
        });
    }
});
