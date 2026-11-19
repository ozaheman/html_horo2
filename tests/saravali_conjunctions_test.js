const assert = require('assert');
const saravaliConjunctions = require('../src/predictions/logic/saravali_conjunctions.js');

const planets = saravaliConjunctions.planets;
const combinations = (size, start, selected, output) => {
  if (selected.length === size) {
    output.push(selected);
    return;
  }
  for (let index = start; index < planets.length; index++) {
    combinations(size, index + 1, selected.concat(planets[index]), output);
  }
};

const coverage = {};
for (let size = 2; size <= 6; size++) {
  const all = [];
  combinations(size, 0, [], all);
  coverage[size] = all.filter(group => saravaliConjunctions.getExact(group)).length;
}
assert.deepStrictEqual(coverage, { 2: 21, 3: 35, 4: 32, 5: 20, 6: 7 });

const sunMoon = saravaliConjunctions.getExact(['Sun', 'Moon']);
assert(sunMoon.some(entry => entry.reference === 'Saravali, Ch. 15, sloka 2'));
assert.deepStrictEqual(
  saravaliConjunctions.getExact(['Moon', 'Sun']).map(entry => entry.reference),
  sunMoon.map(entry => entry.reference)
);

const sourceVariant = saravaliConjunctions.getExact(['Sun', 'Mercury', 'Venus']);
assert(sourceVariant.some(entry => entry.reference === 'Saravali, Ch. 16, sloka 11'));
assert(sourceVariant.some(entry =>
  entry.reference === 'Saravali, Ch. 17, sloka 17' && entry.warning
));

assert.strictEqual(saravaliConjunctions.getExact(['Sun', 'Moon', 'Jupiter', 'Venus']), null);
const fivePlanetDuplicate = saravaliConjunctions.getExact(['Sun', 'Moon', 'Mercury', 'Jupiter', 'Saturn']);
assert.strictEqual(fivePlanetDuplicate.length, 2);
assert(fivePlanetDuplicate.every(entry => entry.warning));
assert.strictEqual(
  saravaliConjunctions.getExact(['Sun', 'Moon', 'Mercury', 'Jupiter', 'Venus']),
  null
);
const secondFivePlanetDuplicate = saravaliConjunctions.getExact(['Moon', 'Mars', 'Mercury', 'Venus', 'Saturn']);
assert.strictEqual(secondFivePlanetDuplicate.length, 2);
assert(secondFivePlanetDuplicate.every(entry => entry.warning));

assert.strictEqual(
  saravaliConjunctions.getExact(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']),
  null
);
assert.strictEqual(saravaliConjunctions.getExact(['Rahu', 'Ketu']), null);

console.log('Saravali conjunction tests passed.');
