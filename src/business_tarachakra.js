/**
 * business_tarachakra.js
 * Navatara Chakra System for Business & Career Panel
 * Computes Tara positions from Moon Nakshatra and renders an HTML report
 * with Ati-Mitra, Sampat, and Kshem detail cards (tree, articles, remedies).
 */

// ─────────────────────────────────────────────────────────────
//  NAKSHATRA DATA (27 Stars)
//  Each entry: { name, ruler, tree, articles, birthStarOf }
// ─────────────────────────────────────────────────────────────
const TARA_NAKSHATRA_DATA = [
  {
    name: 'Ashwini',
    ruler: 'Ketu',
    tree: 'Kuchila (Strychnine)',
    articles: 'Conveyances, horses',
    birthStarOf: ''
  },
  {
    name: 'Bharani',
    ruler: 'Venus',
    tree: 'Amla (Indian Gooseberry)',
    articles: 'Wells, husky grains, cereals',
    birthStarOf: 'Rahu'
  },
  {
    name: 'Krittika',
    ruler: 'Sun',
    tree: 'Gular (Cluster Fig)',
    articles: 'Mantra, music, white flowers',
    birthStarOf: 'Chandra (Moon)'
  },
  {
    name: 'Rohini',
    ruler: 'Moon',
    tree: 'Jamun (Java Plum)',
    articles: 'Forest beasts, gems, ornaments, mountains, cows, bulls, aquatic animals, beauty parlors, markets',
    birthStarOf: 'Chandra (Moon)'
  },
  {
    name: 'Mrigashira',
    ruler: 'Mars',
    tree: 'Khair (Cutch Tree)',
    articles: 'Fruits, fragrant articles, garments, gems, perfumes, brewery, mango, juices, crops',
    birthStarOf: ''
  },
  {
    name: 'Ardra',
    ruler: 'Rahu',
    tree: 'Agar (Agarwood)',
    articles: 'Forts, husky grains, baheda (belleric myrobalan), heavy rains',
    birthStarOf: ''
  },
  {
    name: 'Punarvasu',
    ruler: 'Jupiter',
    tree: 'Bamboo',
    articles: 'Weapons, best grains (Kalama paddy)',
    birthStarOf: ''
  },
  {
    name: 'Pushya',
    ruler: 'Saturn',
    tree: 'Peepal (Sacred Fig)',
    articles: 'Sugarcane, barley, wheat, rice, forest, water tanks, flowers',
    birthStarOf: ''
  },
  {
    name: 'Ashlesha',
    ruler: 'Mercury',
    tree: 'Nagchampa (Cobra Saffron)',
    articles: 'Artificial articles, liquids, insects, reptiles, poison, herbs, snakes',
    birthStarOf: 'Ketu'
  },
  {
    name: 'Magha',
    ruler: 'Ketu',
    tree: 'Banyan',
    articles: 'Corns, granaries, non-vegetarian food',
    birthStarOf: 'Venus'
  },
  {
    name: 'Purva Phalguni',
    ruler: 'Venus',
    tree: 'Palash (Flame of Forest)',
    articles: 'Salt, fire, oil, cotton, honey, money exchangers, fried food',
    birthStarOf: 'Jupiter'
  },
  {
    name: 'Uttara Phalguni',
    ruler: 'Sun',
    tree: 'Pakar (Pilkhan Fig)',
    articles: 'Elephants, stone, fire, corns, jaggery, salt',
    birthStarOf: 'Jupiter'
  },
  {
    name: 'Hasta',
    ruler: 'Moon',
    tree: 'Neem',
    articles: 'Neem tree, ornaments, commodities, elephants',
    birthStarOf: ''
  },
  {
    name: 'Chitra',
    ruler: 'Mars',
    tree: 'Bel (Bilva)',
    articles: 'Coconut, corns for royal use, birds, painted vessels, women',
    birthStarOf: ''
  },
  {
    name: 'Swati',
    ruler: 'Rahu',
    tree: 'Arjun',
    articles: 'Green gram, Arjun tree, horses, deer, vegetables, birth control',
    birthStarOf: ''
  },
  {
    name: 'Vishakha',
    ruler: 'Jupiter',
    tree: 'Vilwa (Bael)',
    articles: 'Cotton, stone, red blossoms, sesame, grams, saffron, lac, madder',
    birthStarOf: 'Sun'
  },
  {
    name: 'Anuradha',
    ruler: 'Saturn',
    tree: 'Bakula (Spanish Cherry)',
    articles: 'Wool/hide articles, ornaments, horses, vehicles, games',
    birthStarOf: 'Sun'
  },
  {
    name: 'Jyeshtha',
    ruler: 'Mercury',
    tree: 'Shisham (Indian Rosewood)',
    articles: 'Wealth, buffaloes, fir, weapons, elite families, trade guilds',
    birthStarOf: ''
  },
  {
    name: 'Mula',
    ruler: 'Ketu',
    tree: 'Sal (Shorea Robusta)',
    articles: 'Seeds, weapons, agriculture, medicines, fruits, herbs',
    birthStarOf: ''
  },
  {
    name: 'Purva Ashadha',
    ruler: 'Venus',
    tree: 'Cane (Vetiver)',
    articles: 'Fire, fruits, aquatic flowers/animals',
    birthStarOf: 'Mars'
  },
  {
    name: 'Uttara Ashadha',
    ruler: 'Sun',
    tree: 'Jackfruit',
    articles: 'Elephants, horses, stone, commerce, immovable things (trees)',
    birthStarOf: 'Mars'
  },
  {
    name: 'Shravana',
    ruler: 'Moon',
    tree: 'Aak (Calotropis)',
    articles: 'Medicinal plants (Aak), conveyances',
    birthStarOf: 'Mercury'
  },
  {
    name: 'Dhanishta',
    ruler: 'Mars',
    tree: 'Shami (Prosopis)',
    articles: 'Ornaments',
    birthStarOf: 'Mercury'
  },
  {
    name: 'Shatabhisha',
    ruler: 'Rahu',
    tree: 'Kadamba (Burflower)',
    articles: 'Water creatures, ropes, nets, aquatic products',
    birthStarOf: ''
  },
  {
    name: 'Purva Bhadrapada',
    ruler: 'Jupiter',
    tree: 'Mango',
    articles: 'Mango tree, animal husbandry, fire',
    birthStarOf: ''
  },
  {
    name: 'Uttara Bhadrapada',
    ruler: 'Saturn',
    tree: 'Mango / Aam',
    articles: 'Elephants, stone, lemon, valuable corns, gold, women',
    birthStarOf: ''
  },
  {
    name: 'Revati',
    ruler: 'Mercury',
    tree: 'Mahua (Indian Butter Tree)',
    articles: 'Conches, ornaments, salt, pearls, gems, lotuses, autumnal crops',
    birthStarOf: 'Saturn'
  }
];

// ─────────────────────────────────────────────────────────────
//  TARA SYSTEM CONSTANTS
// ─────────────────────────────────────────────────────────────
const TARA_NAMES = [
  'Janma', 'Sampat', 'Vipat', 'Kshem',
  'Pratyari', 'Sadhak', 'Vadh', 'Mitra', 'Ati-Mitra'
];

const TARA_NATURE = [
  'neutral',   // 1 Janma: Self, watch health
  'good',      // 2 Sampat: Wealth, success
  'bad',       // 3 Vipat: Obstacles, loss
  'good',      // 4 Kshem: Peace, comfort
  'bad',       // 5 Pratyari: Opposition
  'good',      // 6 Sadhak: Achievement
  'bad',       // 7 Vadh: Danger
  'good',      // 8 Mitra: Friend
  'best',      // 9 Ati-Mitra: Best friend, identity
];

const TARA_MEANINGS = [
  'Birth star — watch health & self',
  'Wealth & prosperity — use articles for business branding',
  'Obstacle & loss — avoid these stars for key events',
  'Comfort & peace — use articles for mental stability',
  'Opposition & rivalry — enemies may come from these stars',
  'Achievement & success — good for spiritual/career goals',
  'Danger — avoid for major decisions',
  'Friendly support — network through these nakshatra energies',
  'Best friends & identity — core remedy & luck items'
];

// Planet ruler sequence for Ati-Mitra calculation
// Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury → (back to Ketu)
const RULER_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Planet symbols for display
const PLANET_SYMS = {
  Ketu: '☋', Venus: '♀', Sun: '☉', Moon: '☽',
  Mars: '♂', Rahu: '☊', Jupiter: '♃', Saturn: '♄', Mercury: '☿'
};

// ─────────────────────────────────────────────────────────────
//  CORE CALCULATION
// ─────────────────────────────────────────────────────────────

/**
 * Given the Moon nakshatra index (0–26), return the 3-row Tara Chakra grid.
 * Returns array of 27 entries: { nakIdx, nak, tara (1-9), row (1-3), col (1-9) }
 */
function buildTaraChakra(moonNakIdx) {
  const grid = [];
  for (let i = 0; i < 27; i++) {
    const offset = (i - moonNakIdx + 27) % 27; // 0-based distance from Moon nak
    const taraCol = offset % 9;   // 0-based tara column (0=Janma...8=Ati-Mitra)
    const taraRow = Math.floor(offset / 9); // 0-based row (0,1,2)
    grid.push({
      nakIdx: i,
      nak: TARA_NAKSHATRA_DATA[i],
      tara: taraCol + 1,     // 1-9
      row: taraRow + 1,      // 1-3
      col: taraCol + 1,      // 1-9
      offset: offset         // 0-26
    });
  }
  return grid;
}

/**
 * Get Ati-Mitra planet (the planet just before Moon's ruler in the sequence)
 */
function getAtiMitraPlanet(moonNakIdx) {
  const moonRuler = TARA_NAKSHATRA_DATA[moonNakIdx].ruler;
  const seqIdx = RULER_SEQUENCE.indexOf(moonRuler);
  const atiMitraRuler = RULER_SEQUENCE[(seqIdx - 1 + 9) % 9]; // one before in sequence
  return atiMitraRuler;
}

/**
 * Get all nakshatra entries ruled by a given planet
 */
function getNakshatrasByRuler(ruler) {
  return TARA_NAKSHATRA_DATA.filter(n => n.ruler === ruler);
}

// ─────────────────────────────────────────────────────────────
//  HTML RENDERER
// ─────────────────────────────────────────────────────────────

function renderTaraChakra(moonNakIdx) {
  if (moonNakIdx < 0 || moonNakIdx > 26) return '';

  const moonNak = TARA_NAKSHATRA_DATA[moonNakIdx];
  const grid = buildTaraChakra(moonNakIdx);

  // Group by row (1,2,3)
  const rows = [
    grid.filter(g => g.row === 1).sort((a, b) => a.col - b.col),
    grid.filter(g => g.row === 2).sort((a, b) => a.col - b.col),
    grid.filter(g => g.row === 3).sort((a, b) => a.col - b.col),
  ];

  // Key Tara sets for detail cards
  const sampat = grid.filter(g => g.tara === 2); // col 2, all 3 rows
  const kshem  = grid.filter(g => g.tara === 4); // col 4
  const atiMitra = grid.filter(g => g.tara === 9); // col 9

  const atiMitraPlanet = getAtiMitraPlanet(moonNakIdx);
  const moonRuler = moonNak.ruler;

  let html = '';

  // ── Section Header ──────────────────────────────────────────
  html += `<div style="margin:10px 12px;padding:14px;background:linear-gradient(135deg,rgba(200,168,75,.1),rgba(155,111,255,.07));border:1px solid rgba(200,168,75,.3);border-radius:6px;">`;
  html += `<div style="font-family:Palatino,'Book Antiqua',serif;font-size:13px;font-weight:700;color:var(--gold2);margin-bottom:4px;letter-spacing:1px;">🌙 Navatara Chakra</div>`;
  html += `<div style="font-family:'Courier New',monospace;font-size:9px;color:var(--muted);margin-bottom:10px;letter-spacing:.8px;">MOON NAKSHATRA: ${moonNak.name.toUpperCase()} · RULER: ${moonRuler} ${PLANET_SYMS[moonRuler] || ''} · ATI-MITRA RULER: ${atiMitraPlanet} ${PLANET_SYMS[atiMitraPlanet] || ''}</div>`;

  // ── 3×9 Tara Grid ────────────────────────────────────────────
  html += buildGridHTML(rows);

  // ── Color Legend ─────────────────────────────────────────────
  html += `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;font-family:'Courier New',monospace;font-size:9px;">`;
  html += `<span style="color:var(--gold)">★ Sampat/Kshem/Ati-Mitra</span>`;
  html += `<span style="color:var(--green)">● Good Taras</span>`;
  html += `<span style="color:var(--rose)">● Bad Taras</span>`;
  html += `<span style="color:var(--amber)">● Janma</span>`;
  html += `</div>`;

  html += `</div>`; // end section wrapper

  // ── Ati-Mitra Detail Card ─────────────────────────────────────
  html += buildTaraDetailCard('Ati-Mitra', '9', atiMitra, atiMitraPlanet,
    'var(--gold)', '💎',
    `Your <strong>identity & luck items</strong>. Use these for branding, logo, personal symbol. The universe offers selfless support through these star energies.`
  );

  // ── Sampat Detail Card ────────────────────────────────────────
  html += buildTaraDetailCard('Sampat', '2', sampat, null,
    'var(--green)', '💰',
    `Your <strong>wealth & prosperity</strong> stars. Use associated articles in your business decor, logo, or marketing to attract high-value opportunities.`
  );

  // ── Kshem Detail Card ─────────────────────────────────────────
  html += buildTaraDetailCard('Kshem', '4', kshem, null,
    'var(--cyan)', '🕊',
    `Your <strong>mental peace & comfort</strong> stars. Keep associated articles at home or workspace for calm, clarity, and emotional stability.`
  );

  // ── Planetary Birth Stars Box ─────────────────────────────────
  html += buildPlanetaryBirthStarsHTML(moonNakIdx);

  return html;
}

// ─────────────────────────────────────────────────────────────
//  SUB-RENDERERS
// ─────────────────────────────────────────────────────────────

function buildGridHTML(rows) {
  const taraColors = {
    1:'var(--amber)',  // Janma - neutral/watch
    2:'var(--green)', // Sampat - wealth
    3:'var(--rose)',  // Vipat - obstacle
    4:'var(--cyan)',  // Kshem - peace
    5:'var(--rose)',  // Pratyari - opposition
    6:'var(--green)', // Sadhak - achievement
    7:'var(--rose)',  // Vadh - danger
    8:'var(--green)', // Mitra - friend
    9:'var(--gold)',  // Ati-Mitra - best
  };

  let html = `<div style="overflow-x:auto;margin-bottom:6px;">`;
  html += `<table style="width:100%;border-collapse:collapse;font-size:9px;">`;

  // Header row (Tara names)
  html += `<thead><tr>`;
  html += `<th style="padding:3px;font-family:'Courier New',monospace;color:var(--muted);font-weight:400;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">Cycle</th>`;
  for (let t = 1; t <= 9; t++) {
    const clr = taraColors[t];
    const isKey = [2, 4, 9].includes(t);
    html += `<th style="padding:3px 4px;font-family:'Courier New',monospace;color:${clr};font-weight:${isKey?'900':'600'};text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);${isKey?'border-left:1px solid '+clr+'44;border-right:1px solid '+clr+'44;':''}">${TARA_NAMES[t-1]}</th>`;
  }
  html += `</tr></thead>`;

  // Data rows (3 cycles)
  html += `<tbody>`;
  for (let ri = 0; ri < 3; ri++) {
    const row = rows[ri];
    html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">`;
    html += `<td style="padding:4px;font-family:'Courier New',monospace;color:var(--muted);text-align:center;white-space:nowrap;">${ri+1}</td>`;
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      const tn = cell.tara;
      const clr = taraColors[tn];
      const isKey = [2, 4, 9].includes(tn);
      const isMoon = cell.nakIdx === (rows[0][0].col === 1 ? rows[0][0].nakIdx : -1); // highlight Janma row 1 only
      const bg = isKey ? `${clr}18` : ri === 0 && ci === 0 ? 'rgba(200,168,75,0.1)' : 'transparent';
      const borderL = isKey ? `border-left:1px solid ${clr}33;border-right:1px solid ${clr}33;` : '';
      html += `<td style="padding:3px 4px;text-align:center;background:${bg};${borderL}">`;
      html += `<div style="color:${clr};font-weight:${isKey?'700':'400'};white-space:nowrap;font-size:8.5px;">${cell.nak.name}</div>`;
      html += `<div style="color:var(--muted);font-size:8px;">${PLANET_SYMS[cell.nak.ruler]||cell.nak.ruler}</div>`;
      html += `</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table></div>`;
  return html;
}

function buildTaraDetailCard(taraName, taraNum, stars, rulerPlanet, color, icon, desc) {
  let html = `<div style="margin:8px 12px;padding:12px;background:${color}0F;border:1px solid ${color}33;border-left:4px solid ${color};border-radius:4px;">`;
  html += `<div style="font-family:Palatino,'Book Antiqua',serif;font-size:12px;font-weight:700;color:${color};margin-bottom:6px;display:flex;align-items:center;gap:6px;">${icon} ${taraName} Tara (${taraNum})${rulerPlanet ? ` — Ruled by ${rulerPlanet} ${PLANET_SYMS[rulerPlanet]||''}` : ''}</div>`;
  html += `<div style="font-size:10px;color:var(--text);line-height:1.5;margin-bottom:10px;">${desc}</div>`;

  // Stars table
  html += `<div style="display:grid;gap:8px;">`;
  stars.forEach(cell => {
    const nak = cell.nak;
    html += `<div style="padding:8px 10px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:4px;">`;
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">`;
    html += `<span style="font-weight:700;font-size:11px;color:${color};">${nak.name}</span>`;
    html += `<span style="font-family:'Courier New',monospace;font-size:9px;color:var(--muted);">Cycle ${cell.row} · ${nak.ruler} ${PLANET_SYMS[nak.ruler]||''}</span>`;
    html += `</div>`;

    html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:5px;">`;
    // Tree badge
    html += `<span style="padding:2px 7px;border-radius:10px;font-size:9px;background:rgba(61,255,155,.08);border:1px solid rgba(61,255,155,.2);color:var(--green);">🌿 ${nak.tree}</span>`;
    if (nak.birthStarOf) {
      html += `<span style="padding:2px 7px;border-radius:10px;font-size:9px;background:rgba(155,111,255,.08);border:1px solid rgba(155,111,255,.2);color:var(--violet);">⭐ Birth ✦ ${nak.birthStarOf}</span>`;
    }
    html += `</div>`;

    // Articles
    html += `<div style="font-size:9.5px;color:var(--muted);line-height:1.4;">`;
    html += `<span style="color:${color};font-weight:600;">Miscellaneous Articles: </span>${nak.articles}`;
    html += `</div>`;
    html += `</div>`;
  });
  html += `</div>`;
  html += `</div>`;
  return html;
}

function buildPlanetaryBirthStarsHTML(moonNakIdx) {
  // Collect all nakshatras that have a birthStarOf entry
  const birthStarNaks = TARA_NAKSHATRA_DATA.filter(n => n.birthStarOf);
  if (!birthStarNaks.length) return '';

  let html = `<div style="margin:8px 12px;padding:12px;background:rgba(58,240,255,.04);border:1px solid rgba(58,240,255,.15);border-radius:4px;">`;
  html += `<div style="font-family:Palatino,serif;font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:8px;">⭐ Planetary Birth Stars (Graha Janma Nakshatra)</div>`;
  html += `<div style="font-size:9.5px;color:var(--muted);margin-bottom:8px;line-height:1.4;">Remedies performed through a planet's birth star intensify that planet's energy. Use these during the corresponding Mahadasha for maximum alignment.</div>`;

  html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">`;
  birthStarNaks.forEach(nak => {
    // Check if this nak appears in any key Tara for this birth chart
    const nakIdx = TARA_NAKSHATRA_DATA.indexOf(nak);
    const offset = (nakIdx - moonNakIdx + 27) % 27;
    const taraCol = (offset % 9) + 1;
    const taraName = TARA_NAMES[taraCol - 1];
    const isKey = [2, 4, 9].includes(taraCol);
    const clr = isKey ? 'var(--gold)' : 'var(--muted)';

    html += `<div style="padding:6px 8px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.05);border-radius:3px;">`;
    html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
    html += `<span style="font-size:9.5px;font-weight:700;color:var(--cyan);">${nak.birthStarOf}</span>`;
    html += `<span style="font-family:'Courier New',monospace;font-size:8px;color:${clr};">${taraName}</span>`;
    html += `</div>`;
    html += `<div style="font-size:9px;color:var(--text);margin-top:2px;">${nak.name} (${nak.ruler})</div>`;
    html += `<div style="font-size:8.5px;color:var(--muted);margin-top:2px;">🌿 ${nak.tree}</div>`;
    html += `</div>`;
  });
  html += `</div>`;
  html += `</div>`;
  return html;
}
