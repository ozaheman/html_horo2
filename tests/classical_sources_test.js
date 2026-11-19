const assert = require('assert');
const classicalSources = require('../src/predictions/logic/classical_sources.js');

const planets = {
  Sun: { sn: 4 },
  Moon: { sid: 95 },
  Mars: { sn: 0 },
  Mercury: { sn: 5 },
  Jupiter: { sn: 9 },
  Venus: { sn: 7 },
  Saturn: { sn: 10 },
  Rahu: { sn: 2 },
  Ketu: { sn: 8 }
};
const ascendant = { sn: 0 };

const bphs = classicalSources.generate('classical_bphs', { planets, ascendant });
assert.strictEqual(bphs.ascendant, 'Aries');
assert(bphs.predictions.some((prediction) =>
  prediction.title === 'Jupiter in House 10' &&
  prediction.chartFacts === 'Jupiter in Capricorn, House 10'
));
assert(bphs.predictions.some((prediction) =>
  prediction.title === 'House 9 lord in House 10' &&
  prediction.description.includes('fortune')
));
assert(bphs.predictions[0].references[0].citation.includes('Ch. 24'));

const bphsYoga = classicalSources.generate('classical_bphs', {
  planets: { Mars: { sn: 0 }, Jupiter: { sn: 9 } },
  ascendant: { sn: 3 }
});
assert(bphsYoga.predictions.some((prediction) =>
  prediction.title === 'Fifth lord in the tenth house' &&
  prediction.description.includes('status and recognition')
));

const laghu = classicalSources.generate('classical_laghu', {
  planets,
  ascendant,
  dashaInfo: { mahadasha: { lord: 'Mars' } }
});
const currentDasha = laghu.predictions.find((prediction) => prediction.category === 'Vimshottari timing');
assert(currentDasha);
assert(currentDasha.title === 'Current Mahadasha: Mars');
assert(currentDasha.description.includes('House 1') && currentDasha.description.includes('House 8'));
assert(laghu.shlokas.some((reference) => reference.title.includes('Preliminaries, verse 3')));

const missingDasha = classicalSources.generate('classical_laghu', { planets, ascendant });
assert(missingDasha.error.includes('Vimshottari Mahadasha'));

const saravali = classicalSources.generate('classical_saravali', { planets, ascendant });
assert.strictEqual(saravali.source.references.length, 2);
assert(saravali.source.references.some((reference) => reference.file.endsWith('saravali-2.md')));
assert(saravali.shlokas.some((reference) => reference.title.includes('Ch. 30, verse 1')));

const phaladeepika = classicalSources.generate('classical_phaladeepika', { planets, ascendant });
assert(phaladeepika.shlokas.some((reference) =>
  reference.title.includes('Adhyaya VIII, ślokas 1–4') && reference.status === 'reference-found'
));
assert(phaladeepika.shlokas.every((reference) => reference.status === 'reference-found'));
assert(classicalSources.renderHTML(phaladeepika).includes('Phaladeepika2ndEd.1950ByVSubrahmanyaSastri'));
assert(classicalSources.renderHTML(phaladeepika).includes('Open online source edition'));

const gochar = classicalSources.generate('classical_gochar', {
  planets: { Moon: { sn: 0 } },
  transitPlanets: {
    Sun: { sn: 2 },
    Mars: { sn: 2 },
    Venus: { sn: 5 },
    Saturn: { sn: 6 }
  },
  currentDate: new Date(2024, 1, 3),
  dashaInfo: {
    mahadasha: { lord: 'Saturn' },
    antardasha: { lord: 'Mercury' }
  }
});
assert.strictEqual(gochar.currentDate, '2024-02-03');
assert.strictEqual(gochar.natalMoon, 'Aries');
assert(gochar.predictions.some((prediction) =>
  prediction.title === 'Sun in House 3 from natal Moon' &&
  prediction.classification === 'Supportive position in source table'
));
assert(gochar.predictions.some((prediction) =>
  prediction.title === 'Mars in House 3 from natal Moon' &&
  prediction.classification === 'Mixed in source — verify'
));
assert(gochar.predictions.some((prediction) =>
  prediction.title === 'Venus in House 6 from natal Moon' &&
  prediction.classification === 'Caution position in source table'
));
assert(gochar.predictions.some((prediction) =>
  prediction.title === 'Saturn in House 7 from natal Moon' &&
  prediction.classification === 'Caution position in source table'
));
assert(gochar.dashaContext.includes('Mahadasha: Saturn') && gochar.dashaContext.includes('Antardasha: Mercury'));
assert(gochar.shlokas[0].verificationNote.includes('REFERENCE NEEDED — VERIFY'));
assert(gochar.shlokas[0].title.includes('Ch. 20') && gochar.shlokas[0].title.includes('p. 192'));
const gocharHtml = classicalSources.renderHTML(gochar);
assert(gocharHtml.includes('2024-02-03'));
assert(gocharHtml.includes('Counted from the natal Moon') || gocharHtml.includes('counted from the natal Moon'));
assert(gocharHtml.includes('REFERENCE NEEDED — VERIFY'));

const missingGocharMoon = classicalSources.generate('classical_gochar', {
  planets: {},
  transitPlanets: { Sun: { sn: 2 } }
});
assert(missingGocharMoon.error.includes('natal Moon'));
const missingTransit = classicalSources.generate('classical_gochar', {
  planets: { Moon: { sn: 0 } }
});
assert(missingTransit.error.includes('transit positions'));
const saturnSourceConflict = classicalSources.generate('classical_gochar', {
  planets: { Moon: { sn: 0 } },
  transitPlanets: { Saturn: { sn: 8 } }
});
assert(saturnSourceConflict.predictions[0].classification === 'Mixed in source — verify');

const raman = classicalSources.generate('classical_raman', { planets, ascendant });
assert(raman.predictions.some((prediction) => prediction.category === 'House-lord connection'));
assert(raman.source.references[0].citation.includes('Ch. XXI'));
assert(raman.shlokas[0].verificationNote.includes('REFERENCE NEEDED — VERIFY'));

const profession = classicalSources.generate('classical_profession', {
  planets: {
    Saturn: { sn: 9 },
    Mars: { sn: 9 },
    Jupiter: { sn: 3 }
  },
  ascendant
});
assert.strictEqual(profession.predictions.length, 1);
assert(profession.predictions[0].title.includes('Saturn in Capricorn'));
assert(profession.predictions[0].chartFacts.includes('Mars (machinery and energy)'));
assert(profession.predictions[0].chartFacts.includes('Jupiter (prestige and spiritual matters)'));
assert(profession.shlokas[0].verificationNote.includes('REFERENCE NEEDED — VERIFY'));
const missingSaturn = classicalSources.generate('classical_profession', {
  planets: { Mars: { sn: 1 } },
  ascendant
});
assert(missingSaturn.error.includes('Saturn'));

const missingChart = classicalSources.generate('classical_phaladeepika', { planets, ascendant: null });
assert(missingChart.error);
assert.strictEqual(missingChart.predictions.length, 0);

const rendered = classicalSources.renderHTML(bphs);
assert(rendered.includes('Shloka references'));
assert(rendered.includes('bookbph.md'));
const yogaHtml = classicalSources.renderHTML(bphsYoga);
assert(yogaHtml.includes('सुतेशे राज्यमावस्थे'));
assert(yogaHtml.includes('classical_prediction_shlokas.md'));
assert(classicalSources.renderHTML(laghu).includes('फलानि नक्षत्र'));

console.log('Classical source prediction tests passed.');
