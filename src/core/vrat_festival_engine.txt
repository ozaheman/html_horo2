/**
 * vrat_festival_engine.js
 * ─────────────────────────────────────────────────────────────
 * Vrat (fasting), auspicious-day, and festival detection for a
 * given Panchang moment.
 *
 * Deliberately decoupled from any one Panchang implementation —
 * detect() takes plain primitives (tithi number, paksha, weekday,
 * nakshatra, lunar/solar month name) rather than a specific
 * engine's object shape, so it can be wired into:
 *   - main.js's "Today's Panchang" widget (showPanchang())
 *   - window.PANCHANG_ENGINE.compute() output, via fromPanchangEngineResult()
 *   - step2step_panchang.js, predictions_ui.js, or any future caller
 *
 * Room to grow (this is a starting data set, not exhaustive):
 *   - Add more entries to RECURRING_VRATS / MAJOR_FESTIVALS — detect()
 *     picks up new keys automatically, no logic changes needed.
 *   - Add a SOLAR_FESTIVALS table for fixed civil-calendar events
 *     (Makar Sankranti, New Year, etc.) keyed by month/day instead
 *     of tithi, and fold it into detect().
 *   - Add nakshatra-pinned entries (e.g. some Jayanti days are
 *     nakshatra-based, not just tithi-based) — the `nakshatra`
 *     primitive is already threaded through for this.
 *   - Add per-vrat "how to observe" detail (meal timing, items to
 *     avoid, katha/story reference) as an extra field per entry.
 */
window.VRAT_FESTIVAL_ENGINE = {

    MAAS_NAMES: ["Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Sravana", "Bhadrapada", "Asvina", "Karttika", "Margasiras", "Pushya", "Magha", "Phalguna"],

    // ===================== WEEKDAY (RECURRING) VRATS =====================
    // Every week, independent of tithi — the deity/day association
    // most Hindu almanacs list alongside the daily Panchang.
    WEEKDAY_VRATS: {
        0: { name: 'Ravivar Vrat', deity: 'Surya (Sun)', note: 'Fasting for health, vitality, and paternal harmony; many take a single salt-free meal.' },
        1: { name: 'Somvar Vrat', deity: 'Shiva', note: "For marital harmony and Shiva's grace; often paired with a Shivling abhishek." },
        2: { name: 'Mangalvar Vrat', deity: 'Hanuman / Mangal (Mars)', note: 'For courage, debt relief, and Mars-related afflictions; red items and Hanuman Chalisa recitation are common.' },
        3: { name: 'Budhvar Vrat', deity: 'Ganesha / Budh (Mercury)', note: 'For intellect, business success, and clear communication.' },
        4: { name: 'Guruvar Vrat', deity: 'Vishnu / Brihaspati (Jupiter)', note: "For wisdom, marriage prospects, and the guru's blessings; yellow items favoured." },
        5: { name: 'Shukravar Vrat', deity: 'Lakshmi / Santoshi Maa / Shukra (Venus)', note: 'For prosperity and relationships; especially popular with married women.' },
        6: { name: 'Shanivar Vrat', deity: 'Shani (Saturn) / Hanuman', note: 'To ease Sade Sati/Dhaiya hardship; black items, oil donation, and Hanuman worship are common.' }
    },

    // ===================== RECURRING (TWICE-MONTHLY) VRATS =====================
    // Keyed by "<Paksha>-<tithi within that paksha, 1-15>". These repeat
    // every lunar month regardless of solar/lunar month name.
    RECURRING_VRATS: {
        'Shukla-4': { name: 'Vinayaka Chaturthi', deity: 'Ganesha', note: 'Monthly Ganesha vrat for removing obstacles, observed on the 4th of the waxing moon.' },
        'Krishna-4': { name: 'Sankashti Chaturthi', deity: 'Ganesha', note: 'Monthly Ganesha vrat broken after moonrise sighting; considered especially powerful for resolving difficulties.' },
        'Shukla-11': { name: 'Ekadashi (Shukla)', deity: 'Vishnu', note: 'One of the most important recurring Vrats; a strict or partial fast is kept, broken the next day (Dwadashi Parana).' },
        'Krishna-11': { name: 'Ekadashi (Krishna)', deity: 'Vishnu', note: 'One of the most important recurring Vrats; a strict or partial fast is kept, broken the next day (Dwadashi Parana).' },
        'Shukla-13': { name: 'Pradosh Vrat (Shukla)', deity: 'Shiva', note: 'Evening (Pradosh Kaal) worship of Shiva for removing sins and fulfilling wishes.' },
        'Krishna-13': { name: 'Pradosh Vrat (Krishna)', deity: 'Shiva', note: 'Evening (Pradosh Kaal) worship of Shiva for removing sins and fulfilling wishes.' },
        'Krishna-14': { name: 'Masik Shivratri', deity: 'Shiva', note: "Monthly observance of Shiva and Parvati's union; night-long vigil and abhishek are traditional." },
        'Shukla-15': { name: 'Purnima Vrat', deity: 'Vishnu / Chandra', note: 'Full-moon fasting/charity day; considered auspicious for spiritual practice and Satyanarayan Puja.' },
        'Krishna-15': { name: 'Amavasya', deity: 'Pitru (ancestors)', note: 'New-moon day for ancestor worship (Tarpan/Shraddha) and charity; not favoured for new auspicious beginnings.' }
    },

    // ===================== MAJOR (ANNUAL) FESTIVALS =====================
    // Keyed by "<MaasName>-<Paksha>-<tithi within that paksha>", pinned to
    // the solar-sign-based Maas this app already computes elsewhere
    // (see getMaas() / PANCHANG_ENGINE.getMaas()). This is an approximation
    // consistent with that simplification — a full lunisolar calendar
    // (tracking the actual amanta/purnimanta month boundary) would refine
    // a handful of these further; that's a good next addition.
    MAJOR_FESTIVALS: {
        'Magha-Shukla-5': { name: 'Vasant Panchami', deity: 'Saraswati', note: 'Worship of the goddess of knowledge and the arts; marks the start of spring.' },
        'Magha-Krishna-14': { name: 'Maha Shivratri', deity: 'Shiva', note: 'The great night of Shiva — the most important Shivratri of the year; night-long vigil, fasting, and abhishek.' },
        'Phalguna-Shukla-15': { name: 'Holi (Phalgun Purnima)', deity: 'Vishnu (Holika legend)', note: 'Festival of colours; Holika Dahan bonfire the evening before, colours the next morning.' },
        'Chaitra-Shukla-1': { name: 'Chaitra Navratri begins / Gudi Padwa / Ugadi', deity: 'Durga', note: 'Start of the Hindu lunar new year in many regions, and of Chaitra Navratri.' },
        'Chaitra-Shukla-9': { name: 'Ram Navami', deity: 'Rama', note: 'Birth of Lord Rama; concludes Chaitra Navratri.' },
        'Chaitra-Shukla-15': { name: 'Hanuman Jayanti', deity: 'Hanuman', note: 'Birth of Lord Hanuman.' },
        'Vaisakha-Shukla-3': { name: 'Akshaya Tritiya', deity: 'Vishnu / Lakshmi', note: 'Considered eternally auspicious — favoured for new ventures, gold purchase, and weddings.' },
        'Jyeshtha-Shukla-10': { name: 'Ganga Dussehra', deity: 'Ganga', note: "Commemorates the Ganga's descent to earth." },
        'Ashadha-Shukla-15': { name: 'Guru Purnima', deity: 'Guru / teachers', note: "Day of gratitude and reverence toward one's teacher or guru." },
        'Sravana-Shukla-5': { name: 'Nag Panchami', deity: 'Naga (serpent) deities', note: 'Worship of serpent deities for protection from snakebite and to pacify Kaal Sarp-type afflictions.' },
        'Sravana-Shukla-15': { name: 'Raksha Bandhan', deity: 'Vishnu (protective-thread legend)', note: "Siblings' bond of protection — sisters tie a Rakhi on brothers' wrists." },
        'Bhadrapada-Shukla-4': { name: 'Ganesh Chaturthi', deity: 'Ganesha', note: 'Birth of Lord Ganesha; begins the multi-day Ganeshotsav.' },
        'Bhadrapada-Krishna-8': { name: 'Krishna Janmashtami', deity: 'Krishna', note: 'Birth of Lord Krishna; fasting until midnight, then celebration.' },
        'Asvina-Shukla-1': { name: 'Sharad Navratri begins', deity: 'Durga', note: 'Nine nights honouring the Goddess in her nine forms — the most widely observed Navratri.' },
        'Asvina-Shukla-8': { name: 'Durgashtami', deity: 'Durga', note: 'Major day of Durga worship (Ashtami) during Sharad Navratri.' },
        'Asvina-Shukla-10': { name: 'Vijayadashami / Dussehra', deity: 'Durga / Rama', note: 'Victory of good over evil — Ravana-dahan and Durga visarjan.' },
        'Asvina-Shukla-15': { name: 'Sharad Purnima', deity: 'Chandra / Lakshmi', note: "Full moon believed to shower the Moon's healing nectar; kheer is traditionally left under moonlight overnight." },
        'Karttika-Krishna-4': { name: 'Karva Chauth', deity: 'Shiva-Parvati / Chandra', note: "Married women fast from sunrise to moonrise for their husband's wellbeing." },
        'Karttika-Krishna-13': { name: 'Dhanteras', deity: 'Dhanvantari / Lakshmi', note: 'Start of the Diwali festival cycle; purchase of gold/metal utensils considered auspicious.' },
        'Karttika-Krishna-14': { name: 'Naraka Chaturdashi / Choti Diwali', deity: 'Krishna', note: "Commemorates Krishna's defeat of the demon Narakasura." },
        'Karttika-Krishna-15': { name: 'Diwali (Amavasya)', deity: 'Lakshmi / Ganesha', note: 'Festival of lights — Lakshmi Puja for prosperity; the most widely celebrated Hindu festival.' },
        'Karttika-Shukla-1': { name: 'Govardhan Puja', deity: 'Krishna', note: 'Commemorates Krishna lifting Govardhan hill.' },
        'Karttika-Shukla-2': { name: 'Bhai Dooj', deity: 'Yama / Yamuna', note: 'Sibling festival honouring the brother-sister bond, concluding Diwali.' },
        'Karttika-Shukla-6': { name: 'Chhath Puja', deity: 'Surya', note: 'Rigorous multi-day fast honouring the Sun god, prominent in Bihar/UP/Nepal.' },
        'Karttika-Shukla-11': { name: 'Prabodhini (Devutthana) Ekadashi / Tulsi Vivah', deity: 'Vishnu / Tulsi', note: 'Vishnu is believed to awaken from cosmic sleep; ceremonial marriage of Tulsi to Vishnu/Shaligram.' },
        'Karttika-Shukla-15': { name: 'Kartik Purnima / Dev Diwali', deity: 'Vishnu / Shiva', note: 'Considered highly auspicious for holy-river bathing and lamp-lighting.' }
    },

    // ===================== DETECTION =====================

    /**
     * Detects Vrats/festivals for a given moment.
     * @param {Object} o
     *   - tithiNum {Number}   1-30, as returned by this app's getTithi()
     *                         or PANCHANG_ENGINE's tithi.number (optional
     *                         if paksha+ofPaksha are given directly)
     *   - paksha {String}     'Shukla' | 'Krishna' (derived from tithiNum if omitted)
     *   - ofPaksha {Number}   1-15, day within the paksha (derived from tithiNum if omitted)
     *   - weekday {Number}    0(Sun)-6(Sat), for the weekday vrat
     *   - nakshatra {String}  nakshatra name (reserved for future nakshatra-pinned entries)
     *   - maasName {String}   month name from MAAS_NAMES — needed to match MAJOR_FESTIVALS
     * @returns {Object} { vrats: [...], festivals: [...], weekdayVrat: {...}|null }
     */
    detect: function (o) {
        o = o || {};
        let paksha = o.paksha;
        let ofPaksha = o.ofPaksha;
        if (o.tithiNum !== undefined) {
            if (!paksha) paksha = o.tithiNum <= 15 ? 'Shukla' : 'Krishna';
            if (ofPaksha === undefined) ofPaksha = o.tithiNum <= 15 ? o.tithiNum : o.tithiNum - 15;
        }

        const vrats = [];
        const festivals = [];

        if (paksha !== undefined && ofPaksha !== undefined) {
            const rv = this.RECURRING_VRATS[`${paksha}-${ofPaksha}`];
            if (rv) vrats.push(rv);

            if (o.maasName) {
                const mf = this.MAJOR_FESTIVALS[`${o.maasName}-${paksha}-${ofPaksha}`];
                if (mf) festivals.push(mf);
            }
        }

        const weekdayVrat = (o.weekday !== undefined) ? (this.WEEKDAY_VRATS[o.weekday] || null) : null;

        return { vrats: vrats, festivals: festivals, weekdayVrat: weekdayVrat };
    },

    /** Adapter: pulls the primitives detect() needs out of a window.PANCHANG_ENGINE.compute() result. */
    fromPanchangEngineResult: function (p) {
        if (!p) return {};
        return {
            tithiNum: p.tithi ? p.tithi.number : undefined,
            paksha: p.tithi ? p.tithi.paksha : undefined,
            ofPaksha: p.tithi ? p.tithi.ofPaksha : undefined,
            weekday: p.date ? p.date.getDay() : undefined,
            nakshatra: p.nakshatra ? p.nakshatra.name : undefined,
            maasName: p.maas
        };
    },

    // ===================== DISPLAY =====================

    /** Renders a "Vrat & Festivals" HTML block. Returns '' if nothing was detected. */
    renderHTML: function (result) {
        result = result || {};
        const vrats = result.vrats || [];
        const festivals = result.festivals || [];
        const weekdayVrat = result.weekdayVrat;

        if (vrats.length === 0 && festivals.length === 0 && !weekdayVrat) return '';

        let html = `<hr style="border:0;border-top:1px solid var(--border);margin:8px 0;">
          <strong style="color:var(--text);font-size:11px;">🪔 Vrat & Festivals:</strong><br>`;

        festivals.forEach(f => {
            html += `<div style="margin:4px 0 4px 8px;padding:6px 8px;background:rgba(255,215,0,0.08);border-left:2px solid var(--gold,#FFD700);border-radius:3px;">
                <span style="color:var(--gold,#FFD700);font-weight:bold;font-size:11px;">🎉 ${f.name}</span>
                <span style="color:var(--muted);font-size:9px;"> — ${f.deity}</span><br>
                <span style="color:var(--muted);font-size:9.5px;">${f.note}</span>
              </div>`;
        });

        vrats.forEach(v => {
            html += `<div style="margin:4px 0 4px 8px;padding:6px 8px;background:rgba(255,255,255,0.04);border-left:2px solid var(--cyan);border-radius:3px;">
                <span style="color:var(--cyan);font-weight:bold;font-size:11px;">🙏 ${v.name}</span>
                <span style="color:var(--muted);font-size:9px;"> — ${v.deity}</span><br>
                <span style="color:var(--muted);font-size:9.5px;">${v.note}</span>
              </div>`;
        });

        if (weekdayVrat) {
            html += `<div style="margin:4px 0 4px 8px;padding:6px 8px;background:rgba(255,255,255,0.03);border-left:2px solid var(--muted);border-radius:3px;">
                <span style="color:var(--text);font-weight:bold;font-size:10.5px;">📿 ${weekdayVrat.name}</span>
                <span style="color:var(--muted);font-size:9px;"> — ${weekdayVrat.deity}</span><br>
                <span style="color:var(--muted);font-size:9.5px;">${weekdayVrat.note}</span>
              </div>`;
        }

        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) module.exports = window.VRAT_FESTIVAL_ENGINE;
