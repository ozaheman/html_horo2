/**
 * Sankhya Prasna (Numerical Oracle) Logic
 * Method: evaluates an input number from 1 to 108.
 * Sign = N % 12 (if 0, Sign = 12).
 * Verifies friendliness between the Sign Lord and User's Moon Lord.
 */

/**
 * Sankhya Prasna (Numerical Oracle) Logic
 * Method: evaluates an input number from 1 to 108.
 * Sign = N % 12 (if 0, Sign = 12).
 * Verifies friendliness between the Sign Lord and User's Moon Lord.
 */

window.SANKHYA_PRASNA = window.SANKHYA_PRASNA || {};

// Determine Planetary Friendships (Basic traditional logic)
function checkRelationship(lord1, lord2) {
    if (!lord1 || !lord2) return "Neutral";
    if (lord1 === lord2) return "Same Planet (Very Favorable)";
    
    const rel = window.ASTRO_CONSTANTS.NATURAL_RELATIONSHIPS[lord1]?.[lord2];
    if (rel === 'Friend') return "Friendly";
    if (rel === 'Enemy') return "Enemy";
    return "Neutral";
}

window.SANKHYA_PRASNA.evaluate = function(number, userMoonSign) {
    if (isNaN(number) || number < 1 || number > 108) {
        throw new Error("Please enter a valid number between 1 and 108.");
    }
    
    let signNum = number % 12;
    if (signNum === 0) signNum = 12;
    
    // Outcome Logic
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
    let targetLord = window.ASTRO_CONSTANTS.SIGN_LORDS[(signNum - 1) % 12];
    
    // Determine User Moon Lord
    let moonSignIdx = -1;
    let moonLord = "Unknown";
    
    if (typeof userMoonSign === 'number') {
        moonSignIdx = userMoonSign % 12; 
        moonLord = window.ASTRO_CONSTANTS.SIGN_LORDS[moonSignIdx];
    } else if (typeof userMoonSign === 'string') {
        let idx = window.ASTRO_CONSTANTS.SIGNS.findIndex(s => s.toLowerCase() === userMoonSign.toLowerCase());
        if (idx !== -1) {
            moonSignIdx = idx;
            moonLord = window.ASTRO_CONSTANTS.SIGN_LORDS[moonSignIdx];
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
            const rand = Math.floor(Math.random() * 108) + 1;
            inputNum.value = rand;
        });
    }
    
    if (btnEval) {
        btnEval.addEventListener('click', () => {
            try {
                let userMoon = window.BIRTH_PLANETS?.Moon?.sign || 0; 
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

