/**
 * dasha_transit_relations.js
 *
 * "Dasha x Transit" relationship engine.
 * Answers: what is the current sky (transiting grahas) doing to the
 * planet(s) currently ruling your Mahadasha / Antardasha / Pratyantardasha
 * / Yogini dasha?
 *
 * Combines three classical layers:
 *
 *   1. NAVATARA / TARA CHAKRA (Sampat / Vipat / Kshema / Vadha / Mitra...)
 *      - Classical 9-fold Tara cycle. Reference point ("Janma Nakshatra")
 *        is the NATAL MOON's nakshatra — this is the standard basis for
 *        Tara Bala / Navatara Chakra (NOT the Ascendant).
 *      - Each active dasha lord (MD/AD/PD, Yogini's ruling planet) is
 *        evaluated by counting from the Janma Nakshatra to that lord's
 *        CURRENT TRANSIT nakshatra. The transiting Moon's own Tara from
 *        Janma Nakshatra is also shown as the classical daily headline
 *        Tara Bala check.
 *   2. GRAHA MAITRI ("Maitri") - Panchadha (five-fold) friendship between
 *      the dasha lord and every other transiting planet, reusing
 *      window.GRAHA_MAITRI (permanent + temporary + five-fold).
 *   3. YOGINI VEDHA - classical affliction pairing between Yogini dasha
 *      lords (used when a Vedha-paired Yogini lord's ruling planet is
 *      itself strongly activated via transit to natal Lagna/Moon).
 *
 * Depends on: window.GRAHA_MAITRI (graha_maitri.js), window.ASTRO_CONSTANTS
 * (constant.js) if available. Degrades gracefully if either is missing.
 */

window.DASHA_TRANSIT_RELATIONS = {

    // ===================== 1. NAVATARA / TARA CHAKRA LAYER =====================
    // Reference nakshatra = NATAL MOON's nakshatra (Janma Nakshatra).

    TARA_SEQUENCE: ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhaka', 'Vadha', 'Mitra', 'Parama Mitra'],

    TARA_MEANING: {
        'Janma':        { nature: 'caution', label: 'Janma (Birth Star)',       desc: 'Self-referential; identity/health focus, mildly cautionary.' },
        'Sampat':       { nature: 'good',    label: 'Sampat (Prosperity)',      desc: 'Wealth, gain, and favourable material outcomes.' },
        'Vipat':        { nature: 'bad',     label: 'Vipat (Danger)',           desc: 'Obstacles, setbacks, and risk; avoid new ventures.' },
        'Kshema':       { nature: 'good',    label: 'Kshema (Wellbeing)',       desc: 'Safety, comfort, steady favourable results.' },
        'Pratyak':      { nature: 'bad',     label: 'Pratyak / Pratyari (Adversity)', desc: 'Opposition, conflict, delays.' },
        'Sadhaka':      { nature: 'good',    label: 'Sadhaka (Fulfilment)',     desc: 'Goals accomplished; favourable for objectives.' },
        'Vadha':        { nature: 'bad',     label: 'Vadha / Naidhana (Destructive)', desc: 'Most inauspicious; loss, harm, endings.' },
        'Mitra':        { nature: 'good',    label: 'Mitra (Friend)',           desc: 'Supportive, harmonious, cooperative results.' },
        'Parama Mitra': { nature: 'good',    label: 'Parama Mitra (Best Friend)', desc: 'Highly auspicious, best supportive results.' }
    },

    NAK_NAMES_FALLBACK: ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
        'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
        'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'],

    _getNakIndex: function(sidLon) {
        const lon = ((sidLon % 360) + 360) % 360;
        return Math.floor(lon / (360 / 27));
    },

    _nakName: function(nakIdx) {
        const idx = ((nakIdx % 27) + 27) % 27;
        if (window.ASTRO_CONSTANTS && window.ASTRO_CONSTANTS.NAKSHATRAS && window.ASTRO_CONSTANTS.NAKSHATRAS[idx]) {
            return window.ASTRO_CONSTANTS.NAKSHATRAS[idx].name;
        }
        return this.NAK_NAMES_FALLBACK[idx];
    },

    /**
     * Tara relationship counted FROM the Janma Nakshatra (natal Moon)
     * TO a target nakshatra index (classical 9-fold cycle, repeats
     * every 9 nakshatras across the 27).
     */
    getTaraType: function(fromNakIdx, toNakIdx) {
        const diff = ((toNakIdx - fromNakIdx) % 27 + 27) % 27;
        const taraIdx = diff % 9;
        const name = this.TARA_SEQUENCE[taraIdx];
        const meta = this.TARA_MEANING[name];
        return { name: name, nakDiff: diff + 1, taraIdx: taraIdx, nature: meta.nature, label: meta.label, desc: meta.desc };
    },

    /**
     * Builds the full 27-nakshatra Navatara Chakra grouped by Tara type,
     * counted from a given Janma Nakshatra index. Useful for rendering
     * the classical "wheel" view.
     */
    buildNavataraChakra: function(janmaNakIdx) {
        const groups = {};
        this.TARA_SEQUENCE.forEach(name => groups[name] = []);
        for (let i = 0; i < 27; i++) {
            const nakIdx = (janmaNakIdx + i) % 27;
            const taraIdx = i % 9;
            const taraName = this.TARA_SEQUENCE[taraIdx];
            groups[taraName].push({ nakIdx: nakIdx, name: this._nakName(nakIdx) });
        }
        return groups;
    },

    // ===================== 2. GRAHA MAITRI ("MAITRI") LAYER =====================

    FIVEFOLD_LABELS: {
        'Intimate': { label: 'Adhi Mitra (Intimate Friend)', nature: 'good' },
        'Friend':   { label: 'Mitra (Friend)',               nature: 'good' },
        'Neutral':  { label: 'Sama (Neutral)',               nature: 'neutral' },
        'Enemy':    { label: 'Shatru (Enemy)',                nature: 'bad' },
        'Bitter':   { label: 'Adhi Shatru (Bitter Enemy)',    nature: 'bad' }
    },

    /**
     * Five-fold (panchadha) friendship of every currently transiting
     * planet TOWARD the given dasha-lord planet, using their current
     * transiting sign positions (both permanent + temporary friendship,
     * exactly as classical Graha Maitri prescribes for transits).
     * transitPlanetsMap: { PlanetName: { sid|longitude: number, ... }, ... }
     */
    getDashaLordTransitFriendships: function(dashaLordPlanet, transitPlanetsMap) {
        if (!window.GRAHA_MAITRI || !transitPlanetsMap || !transitPlanetsMap[dashaLordPlanet]) return [];
        if (!window.GRAHA_MAITRI.PERMANENT_FRIENDSHIP[dashaLordPlanet]) return [];

        const rel = window.GRAHA_MAITRI.calculateRelationships(transitPlanetsMap);
        const row = rel[dashaLordPlanet] || {};
        return Object.entries(row).map(([other, r]) => {
            const fmeta = this.FIVEFOLD_LABELS[r.fiveFold] || { label: r.fiveFold, nature: 'neutral' };
            return {
                planet: other,
                permanent: r.permanent,
                temporary: r.temporary,
                fiveFold: r.fiveFold,
                fiveFoldLabel: fmeta.label,
                nature: fmeta.nature
            };
        }).sort((a, b) => {
            const order = { good: 0, neutral: 1, bad: 2 };
            return order[a.nature] - order[b.nature];
        });
    },

    // ===================== 3. YOGINI VEDHA LAYER =====================

    YOGINI_ORDER: ['Mangala', 'Pingala', 'Dhanya', 'Bhramari', 'Bhadrika', 'Ulka', 'Siddha', 'Sankata'],

    YOGINI_VEDHA_PAIRS: {
        'Mangala': 'Bhadrika', 'Bhadrika': 'Mangala',
        'Pingala': 'Ulka',     'Ulka': 'Pingala',
        'Dhanya':  'Siddha',   'Siddha': 'Dhanya',
        'Bhramari':'Sankata',  'Sankata': 'Bhramari'
    },

    checkYoginiVedha: function(activeYoginiLord, transitPlanetsMap, natalAscSid, natalMoonSid, yoginiPlanetMap) {
        const vedhaLord = this.YOGINI_VEDHA_PAIRS[activeYoginiLord];
        if (!vedhaLord) return { vedhaLord: null, afflicted: false };

        const vedhaPlanet = yoginiPlanetMap ? yoginiPlanetMap[vedhaLord] : null;
        let afflicted = false;
        let reason = '';

        if (vedhaPlanet && transitPlanetsMap && transitPlanetsMap[vedhaPlanet]) {
            const pLon = transitPlanetsMap[vedhaPlanet].sid !== undefined
                ? transitPlanetsMap[vedhaPlanet].sid
                : transitPlanetsMap[vedhaPlanet].longitude;
            const orb = 6; // degrees - conjunction proxy for "activation"
            const chkD = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
            if (natalAscSid !== undefined && chkD(pLon, natalAscSid) < orb) { afflicted = true; reason = `${vedhaPlanet} (lord of Vedha-Yogini ${vedhaLord}) is transiting close to natal Lagna`; }
            else if (natalMoonSid !== undefined && chkD(pLon, natalMoonSid) < orb) { afflicted = true; reason = `${vedhaPlanet} (lord of Vedha-Yogini ${vedhaLord}) is transiting close to natal Moon`; }
        }

        return { vedhaLord: vedhaLord, vedhaPlanet: vedhaPlanet, afflicted: afflicted, reason: reason };
    },

    // ===================== 4. MAIN ANALYSIS ENTRY POINT =====================

    /**
     * Builds a full relationship report for the currently active MD / AD
     * / PD / Yogini lords against the live transit sky.
     *
     * params:
     *   md, ad, pd     : { lord } objects (from getVimsh(date) & its .subs)
     *   yogini         : { lord, planet } object (from getYogini(date))
     *   yoginiPlanetMap: YPLANET map {Mangala:'Moon',...}
     *   transitPlanetsMap : current transiting planet positions {P:{sid,...}}
     *   natalPlanetsMap   : natal planet positions {P:{sid,...}} - Moon used
     *                       as the Navatara Janma Nakshatra reference.
     *   natalAscSid       : natal Lagna sidereal longitude (used only for
     *                       the Yogini Vedha activation check, not Tara).
     */
    analyze: function(params) {
        const { md, ad, pd, yogini, yoginiPlanetMap, transitPlanetsMap, natalPlanetsMap, natalAscSid } = params;
        const out = { md: null, ad: null, pd: null, yogini: null, janmaNakIdx: null, janmaNakName: null, moonTara: null, chakra: null };

        const natalMoonSid = natalPlanetsMap && natalPlanetsMap.Moon
            ? (natalPlanetsMap.Moon.sid !== undefined ? natalPlanetsMap.Moon.sid : natalPlanetsMap.Moon.longitude)
            : undefined;

        if (natalMoonSid === undefined) return out; // can't build Navatara without Janma Nakshatra

        const janmaNakIdx = this._getNakIndex(natalMoonSid);
        out.janmaNakIdx = janmaNakIdx;
        out.janmaNakName = this._nakName(janmaNakIdx);
        out.chakra = this.buildNavataraChakra(janmaNakIdx);

        // Headline: classical daily Tara Bala - transiting Moon's Tara from Janma Nakshatra
        if (transitPlanetsMap && transitPlanetsMap.Moon) {
            const tMoonSid = transitPlanetsMap.Moon.sid !== undefined ? transitPlanetsMap.Moon.sid : transitPlanetsMap.Moon.longitude;
            const tMoonNak = this._getNakIndex(tMoonSid);
            out.moonTara = Object.assign({ nakIdx: tMoonNak, nakName: this._nakName(tMoonNak) }, this.getTaraType(janmaNakIdx, tMoonNak));
        }

        const buildForLord = (lordPlanet) => {
            if (!lordPlanet || !transitPlanetsMap || !transitPlanetsMap[lordPlanet]) return null;
            const tLon = transitPlanetsMap[lordPlanet].sid !== undefined ? transitPlanetsMap[lordPlanet].sid : transitPlanetsMap[lordPlanet].longitude;
            const tNak = this._getNakIndex(tLon);
            const tara = this.getTaraType(janmaNakIdx, tNak);
            const friendships = this.getDashaLordTransitFriendships(lordPlanet, transitPlanetsMap);
            return { lord: lordPlanet, transitNakIdx: tNak, transitNakName: this._nakName(tNak), tara: tara, friendships: friendships };
        };

        if (md && md.lord) out.md = buildForLord(md.lord);
        if (ad && ad.lord) out.ad = buildForLord(ad.lord);
        if (pd && pd.lord) out.pd = buildForLord(pd.lord);

        if (yogini && yogini.lord) {
            const vedha = this.checkYoginiVedha(yogini.lord, transitPlanetsMap, natalAscSid, natalMoonSid, yoginiPlanetMap);
            const yoginiPlanetName = yogini.planet || (yoginiPlanetMap ? yoginiPlanetMap[yogini.lord] : null);
            const base = buildForLord(yoginiPlanetName);
            out.yogini = Object.assign({ yoginiLord: yogini.lord, vedha: vedha }, base || {});
        }

        return out;
    },

    // ===================== 5. HTML RENDERING =====================

    _natureColor: function(nature) {
        if (nature === 'good') return '#00DD77';
        if (nature === 'bad') return '#FF4477';
        if (nature === 'caution') return '#FFA500';
        return '#8888AA';
    },

    _renderTaraBlock: function(tara, nakName) {
        if (!tara) return '';
        const c = this._natureColor(tara.nature);
        const nakBit = nakName ? `<span style="color:var(--muted);font-size:9px;">transiting ${nakName} · </span>` : '';
        return `<div style="margin-top:4px;padding:4px 6px;border-left:2px solid ${c};background:${c}11;">
                  ${nakBit}<span style="color:${c};font-weight:bold;font-size:10px;">TARA: ${tara.label}</span>
                  <span style="color:var(--muted);font-size:9px;"> — ${tara.desc}</span>
                </div>`;
    },

    _renderFriendshipBlock: function(friendships) {
        if (!friendships || !friendships.length) return '';
        const rows = friendships.map(f => {
            const c = this._natureColor(f.nature);
            return `<span style="display:inline-block;margin:2px 4px 0 0;padding:2px 5px;border-radius:4px;background:${c}22;color:${c};font-size:9px;font-weight:bold;" title="Permanent: ${f.permanent} | Temporary: ${f.temporary}">${f.planet}: ${f.fiveFoldLabel}</span>`;
        }).join('');
        return `<div style="margin-top:3px;">${rows}</div>`;
    },

    _renderLordSection: function(title, color, data) {
        if (!data) return '';
        return `<div style="margin-top:8px;padding:6px 8px;border:1px solid ${color}44;border-radius:6px;background:${color}0A;">
                  <div style="color:${color};font-weight:bold;font-size:11px;">${title}: ${data.lord}</div>
                  ${this._renderTaraBlock(data.tara, data.transitNakName)}
                  ${this._renderFriendshipBlock(data.friendships)}
                </div>`;
    },

    _renderChakraGrid: function(chakra) {
        if (!chakra) return '';
        const cells = this.TARA_SEQUENCE.map(name => {
            const meta = this.TARA_MEANING[name];
            const c = this._natureColor(meta.nature);
            const naks = (chakra[name] || []).map(n => n.name).join(', ');
            return `<div style="padding:4px 5px;border:1px solid ${c}33;border-radius:4px;background:${c}0C;min-width:110px;">
                      <div style="color:${c};font-weight:bold;font-size:9px;">${name}</div>
                      <div style="color:var(--muted);font-size:8px;line-height:1.3;">${naks}</div>
                    </div>`;
        }).join('');
        return `<details style="margin-top:8px;">
                  <summary style="cursor:pointer;color:#9b6fff;font-size:9px;font-weight:bold;">Show full Navatara Chakra (27 Nakshatras)</summary>
                  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">${cells}</div>
                </details>`;
    },

    /**
     * Renders the full panel HTML. `analysis` = output of analyze().
     */
    renderHTML: function(analysis) {
        if (!analysis) return '<div class="pred-item">No dasha/transit data available.</div>';
        if (!analysis.janmaNakIdx && analysis.janmaNakIdx !== 0) {
            return '<div class="pred-item" style="color:var(--rose);">Navatara Chakra unavailable: natal Moon position not found.</div>';
        }

        let html = `<div class="pred-item" style="border-left:3px solid #9b6fff;">
                       <div class="pred-title" style="color:#9b6fff;">🔮 Navatara (Tara Chakra) × Dasha Transit — Janma Nakshatra: ${analysis.janmaNakName}</div>
                       <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Tara counted from natal Moon's nakshatra. Maitri/Vedha layers show live planetary relationships to each dasha lord.</div>`;

        if (analysis.moonTara) {
            const mt = analysis.moonTara;
            const c = this._natureColor(mt.nature);
            html += `<div style="padding:4px 6px;border-left:2px solid ${c};background:${c}11;margin-bottom:4px;">
                        <span style="color:${c};font-weight:bold;font-size:10px;">TODAY'S MOON TARA: ${mt.label}</span>
                        <span style="color:var(--muted);font-size:9px;"> — transiting ${mt.nakName}</span>
                      </div>`;
        }

        html += this._renderLordSection('MAHADASHA', '#FFD700', analysis.md);
        html += this._renderLordSection('ANTARDASHA', '#66CCFF', analysis.ad);
        html += this._renderLordSection('PRATYANTARDASHA', '#FF9F43', analysis.pd);

        if (analysis.yogini) {
            const y = analysis.yogini;
            const vedhaColor = y.vedha && y.vedha.afflicted ? '#FF4477' : '#00DD77';
            html += `<div style="margin-top:8px;padding:6px 8px;border:1px solid #FF69B444;border-radius:6px;background:#FF69B40A;">
                        <div style="color:#FF69B4;font-weight:bold;font-size:11px;">YOGINI DASHA: ${y.yoginiLord}${y.lord ? ' (' + y.lord + ')' : ''}</div>
                        ${this._renderTaraBlock(y.tara, y.transitNakName)}
                        ${this._renderFriendshipBlock(y.friendships)}
                        <div style="margin-top:4px;padding:4px 6px;border-left:2px solid ${vedhaColor};background:${vedhaColor}11;">
                          <span style="color:${vedhaColor};font-weight:bold;font-size:10px;">VEDHA CHECK: ${y.vedha && y.vedha.vedhaLord ? y.vedha.vedhaLord : 'N/A'}</span>
                          <span style="color:var(--muted);font-size:9px;"> — ${y.vedha && y.vedha.afflicted ? (y.vedha.reason || 'Afflicted — results may be nullified/reversed.') : 'Not currently activated — results flow normally.'}</span>
                        </div>
                      </div>`;
        }

        html += this._renderChakraGrid(analysis.chakra);
        html += `</div>`;
        return html;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DASHA_TRANSIT_RELATIONS;
}