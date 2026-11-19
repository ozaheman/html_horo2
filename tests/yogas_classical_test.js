const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const signs = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];
const signLords = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter'
};
const dignities = {
  Sun: { exalt: 0, own: [4] },
  Moon: { exalt: 1, own: [3] },
  Mars: { exalt: 9, own: [0, 7] },
  Mercury: { exalt: 5, own: [2, 5] },
  Jupiter: { exalt: 3, own: [8, 11] },
  Venus: { exalt: 11, own: [1, 6] },
  Saturn: { exalt: 6, own: [9, 10] }
};
const relationships = {};
Object.keys(signLords).forEach(sign => {
  const lord = signLords[sign];
  if (!relationships[lord]) relationships[lord] = {};
  relationships[lord][lord] = 'Friend';
});

const context = {
  window: {
    ASTRO_CONSTANTS: {
      SIGNS: signs,
      SIGN_LORDS: Object.fromEntries(signs.map((sign, index) => [index, signLords[sign]])),
      BENEFICS: ['Jupiter', 'Venus', 'Mercury', 'Moon'],
      MALEFICS: ['Saturn', 'Mars', 'Rahu', 'Ketu'],
      DIGNITIES: dignities,
      NATURAL_RELATIONSHIPS: relationships
    }
  },
  console: { log() {}, warn() {} },
  getSignLord: sign => signLords[sign]
};

vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'yogas_data.js'), 'utf8'),
  context,
  { filename: 'yogas_data.js' }
);

const catalog = context.window.YOGAS_DATA;
const yoga = name => {
  const definition = catalog.find(entry => entry.name === name);
  assert(definition, `Missing yoga definition: ${name}`);
  return definition;
};
const chartFromHouses = (ascSn, houses) => {
  const planets = {};
  ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach((name, index) => {
    const house = houses[index];
    const sn = (ascSn + house - 1) % 12;
    planets[name] = { house, sn, sign: signs[sn], deg: 1, status: 'Other' };
  });
  return { asc: { sn: ascSn }, planets };
};
const chartFromSigns = (ascSn, signIndexes) => {
  const planets = {};
  ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach((name, index) => {
    const sn = signIndexes[index];
    const house = ((sn - ascSn + 12) % 12) + 1;
    planets[name] = { house, sn, sign: signs[sn], deg: 1, status: 'Other' };
  });
  return { asc: { sn: ascSn }, planets };
};

const rajju = yoga('Rajju Yoga');
const movableSigns = chartFromSigns(1, [0, 0, 3, 3, 6, 6, 9]);
assert.strictEqual(rajju.evaluate(movableSigns).result, true);
assert(rajju.nullification.includes('Saravali'));
assert(rajju.referenceShloka.includes('shloka 7 (formation)'));
assert(rajju.referenceShloka.includes('shloka 18'));
const incompleteChart = chartFromSigns(1, [0, 0, 3, 3, 6, 6, 9]);
delete incompleteChart.planets.Saturn;
assert.strictEqual(rajju.evaluate(incompleteChart).result, false);

const sakataNabhasa = yoga('Sakata (Nabhasa) Yoga');
assert.strictEqual(sakataNabhasa.evaluate(chartFromHouses(0, [1, 7, 1, 7, 1, 7, 1])).result, true);

const aradhachandra = yoga('Ardhachandra Yoga');
assert.strictEqual(aradhachandra.evaluate(chartFromHouses(0, [2, 3, 4, 5, 6, 7, 8])).result, true);
assert.strictEqual(aradhachandra.evaluate(chartFromHouses(0, [1, 2, 3, 4, 5, 6, 7])).result, false);
assert(aradhachandra.referenceShloka.includes('Saravali, Ch. 21, shloka 13'));
assert(aradhachandra.referenceShloka.includes('BPHS, Ch. 35, shloka 40'));

const vallaki = yoga('Vallaki/Veena Yoga');
assert.strictEqual(vallaki.evaluate(chartFromHouses(0, [1, 2, 4, 6, 8, 10, 12])).result, true);
assert.strictEqual(yoga('Gola Yoga').evaluate(chartFromHouses(0, [1, 1, 1, 1, 1, 1, 1])).result, false);
assert.strictEqual(catalog.some(entry => entry.name === 'Sankhya Yoga'), false);

const vosiChart = chartFromHouses(0, [1, 2, 3, 12, 4, 5, 6]);
assert.strictEqual(yoga('Vosi/Vasi Yoga').evaluate(vosiChart).result, true);
assert(yoga('Chamara Yoga').referenceShloka.includes('Ch. 36, shlokas 11-12'));

console.log('Classical yoga tests passed.');
