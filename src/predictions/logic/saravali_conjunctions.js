(function (global) {
  'use strict';

  const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const PLANET_RANK = PLANET_ORDER.reduce((ranks, planet, index) => {
    ranks[planet] = index;
    return ranks;
  }, {});
  const ENTRIES = [
    { planets: 'Sun Moon', text: 'The text associates this pairing with material skill, trade, and a forceful or complicated relationship dynamic.', verse: 'Ch. 15, sloka 2' },
    { planets: 'Sun Mars', text: 'The text emphasizes courage, energy, technical skill, and a tendency toward forceful conduct.', verse: 'Ch. 15, sloka 3' },
    { planets: 'Sun Mercury', text: 'The text emphasizes learning, eloquence, service, and public recognition.', verse: 'Ch. 15, sloka 4' },
    { planets: 'Sun Jupiter', text: 'The text associates this pairing with teaching, counsel, public service, and support through friends.', verse: 'Ch. 15, sloka 5' },
    { planets: 'Sun Venus', text: 'The text emphasizes artistic or public pursuits and material resources, with caution around relationships and visibility.', verse: 'Ch. 15, sloka 6' },
    { planets: 'Sun Saturn', text: 'The text emphasizes duty, practical or technical work, and possible strain around family responsibilities.', verse: 'Ch. 15, sloka 7' },
    { planets: 'Moon Mars', text: 'The text associates this pairing with courage, active work, and strong emotional responses.', verse: 'Ch. 15, sloka 8' },
    { planets: 'Moon Mercury', text: 'The text emphasizes communication, learning, literary or commercial skill, and social ease.', verse: 'Ch. 15, sloka 9' },
    { planets: 'Moon Jupiter', text: 'The text associates this pairing with generosity, learning, wealth, and regard for family and tradition.', verse: 'Ch. 15, sloka 10' },
    { planets: 'Moon Venus', text: 'The text emphasizes comfort, trade, and aesthetic interests, while cautioning against passivity.', verse: 'Ch. 15, sloka 11' },
    { planets: 'Moon Saturn', text: 'The text describes a serious, duty-bound disposition and possible dependence or strain in close relationships.', verse: 'Ch. 15, sloka 12' },
    { planets: 'Mars Mercury', text: 'The text emphasizes technical, architectural, medicinal, and commercial skills, with possible strain in partnerships or finances.', verse: 'Ch. 15, sloka 13' },
    { planets: 'Mars Jupiter', text: 'The text emphasizes learning, speech, courage, and leadership or advisory work.', verse: 'Ch. 15, sloka 14' },
    { planets: 'Mars Venus', text: 'The text associates this pairing with energetic artistic or competitive pursuits and relationship intensity.', verse: 'Ch. 15, sloka 15' },
    { planets: 'Mars Saturn', text: 'The text emphasizes metalwork, strategy, and persistence, alongside conflict-prone or difficult circumstances.', verse: 'Ch. 15, sloka 16' },
    { planets: 'Mercury Jupiter', text: 'The text emphasizes scholarship, music, speech, and learned or advisory work.', verse: 'Ch. 15, sloka 17' },
    { planets: 'Mercury Venus', text: 'The text associates this pairing with artistic skill, diplomacy, persuasive speech, and material gains.', verse: 'Ch. 15, sloka 18' },
    { planets: 'Mercury Saturn', text: 'The text emphasizes writing, planning, and careful speech, with possible burdens or delays.', verse: 'Ch. 15, sloka 19' },
    { planets: 'Jupiter Venus', text: 'The text associates this pairing with education, sound judgment, virtue, and supportive relationships.', verse: 'Ch. 15, sloka 20' },
    { planets: 'Jupiter Saturn', text: 'The text emphasizes public responsibility, leadership, wealth, and recognition.', verse: 'Ch. 15, sloka 21' },
    { planets: 'Venus Saturn', text: 'The text emphasizes craft, artistic work, and practical skill; results depend strongly on planetary condition.', verse: 'Ch. 15, sloka 22' },

    { planets: 'Sun Moon Mars', text: 'The text emphasizes technical ability, courage, and forceful action; it also cautions against impulsive conduct.', verse: 'Ch. 16, sloka 1' },
    { planets: 'Sun Moon Mercury', text: 'The text emphasizes intelligence, artistic interests, communication, and public or administrative work.', verse: 'Ch. 16, sloka 2' },
    { planets: 'Sun Moon Jupiter', text: 'The text associates this group with learning, service, travel, and a changeable temperament.', verse: 'Ch. 16, sloka 3' },
    { planets: 'Sun Moon Venus', text: 'The text describes strong artistic and material interests, with caution around trust and relationships.', verse: 'Ch. 16, sloka 4' },
    { planets: 'Sun Moon Saturn', text: 'The text describes a serious, argumentative disposition and possible difficulty maintaining resources or independence.', verse: 'Ch. 16, sloka 5' },
    { planets: 'Sun Mars Mercury', text: 'The text emphasizes fame, technical skill, and forceful communication, while noting possible strain in family and material matters.', verse: 'Ch. 16, sloka 6' },
    { planets: 'Sun Mars Jupiter', text: 'The text emphasizes eloquence, courage, resources, and leadership.', verse: 'Ch. 16, sloka 7' },
    { planets: 'Sun Mars Venus', text: 'The text associates this group with creative ambition, confidence, and material success, with relationship sensitivities.', verse: 'Ch. 16, sloka 8' },
    { planets: 'Sun Mars Saturn', text: 'The text emphasizes endurance and forceful action, but describes social and family strain.', verse: 'Ch. 16, sloka 9' },
    { planets: 'Sun Mercury Jupiter', text: 'The text emphasizes scholarship, writing, eloquence, and intellectual work.', verse: 'Ch. 16, sloka 10' },
    { planets: 'Sun Mercury Venus', text: 'The text emphasizes speech, artistic interests, public activity, and restlessness.', verse: 'Ch. 16, sloka 11' },
    { planets: 'Sun Mercury Saturn', text: 'The text describes strong opinions and communication skills, with possible conflict or isolation in social life.', verse: 'Ch. 16, sloka 12' },
    { planets: 'Sun Jupiter Venus', text: 'The text describes intelligence and public service, while noting that material results may vary.', verse: 'Ch. 16, sloka 13' },
    { planets: 'Sun Jupiter Saturn', text: 'The text emphasizes respect, public standing, and responsibility toward family or community.', verse: 'Ch. 16, sloka 14' },
    { planets: 'Sun Venus Saturn', text: 'The text describes sensitivity to conflict and obstacles affecting artistic or social pursuits.', verse: 'Ch. 16, sloka 15' },
    { planets: 'Moon Mars Mercury', text: 'The text describes forceful speech and conduct, with possible difficulty maintaining supportive relationships.', verse: 'Ch. 16, sloka 16' },
    { planets: 'Moon Mars Jupiter', text: 'The text emphasizes physical confidence and charisma, while cautioning against anger or rash choices.', verse: 'Ch. 16, sloka 17' },
    { planets: 'Moon Mars Venus', text: 'The text describes strong relationship themes, restlessness, and emotional intensity.', verse: 'Ch. 16, sloka 18' },
    { planets: 'Moon Mars Saturn', text: 'The text emphasizes persistence under pressure, while describing family or social friction.', verse: 'Ch. 16, sloka 19' },
    { planets: 'Moon Mercury Jupiter', text: 'The text emphasizes learning, eloquence, good judgment, and support from others.', verse: 'Ch. 16, sloka 20' },
    { planets: 'Moon Mercury Venus', text: 'The text emphasizes learning and culture, but cautions about jealousy or possessiveness around resources.', verse: 'Ch. 16, sloka 21' },
    { planets: 'Moon Mercury Saturn', text: 'The text emphasizes learning, speech, and public respect, alongside dependence on others.', verse: 'Ch. 16, sloka 22' },
    { planets: 'Moon Jupiter Venus', text: 'The text emphasizes scholarship, arts, virtue, and supportive relationships.', verse: 'Ch. 16, sloka 23' },
    { planets: 'Moon Jupiter Saturn', text: 'The text emphasizes knowledge and responsibility, with caution around emotional or relationship choices.', verse: 'Ch. 16, sloka 24' },
    { planets: 'Moon Venus Saturn', text: 'The text emphasizes study, writing, and traditional learning, while noting possible relationship strain.', verse: 'Ch. 16, sloka 25' },
    { planets: 'Mars Mercury Jupiter', text: 'The text emphasizes poetry, speech, learning, and work that benefits others.', verse: 'Ch. 16, sloka 26' },
    { planets: 'Mars Mercury Venus', text: 'The text describes forceful communication and restless or unconventional conduct.', verse: 'Ch. 16, sloka 27' },
    { planets: 'Mars Mercury Saturn', text: 'The text emphasizes service, technical work, travel, and wit under pressure.', verse: 'Ch. 16, sloka 28' },
    { planets: 'Mars Jupiter Venus', text: 'The text emphasizes public favor, family support, and enjoyment of relationships.', verse: 'Ch. 16, sloka 29' },
    { planets: 'Mars Jupiter Saturn', text: 'The text emphasizes public recognition and resilience, alongside possible conflict with peers.', verse: 'Ch. 16, sloka 30' },
    { planets: 'Mars Venus Saturn', text: 'The text describes relationship challenges, restlessness, and changing circumstances.', verse: 'Ch. 16, sloka 31' },
    { planets: 'Mercury Jupiter Venus', text: 'The text emphasizes learning, persuasive speech, public regard, and good judgment.', verse: 'Ch. 16, sloka 32' },
    { planets: 'Mercury Jupiter Saturn', text: 'The text emphasizes scholarship, responsibility, resources, and leadership.', verse: 'Ch. 16, sloka 33' },
    { planets: 'Mercury Venus Saturn', text: 'The text emphasizes artistic skill and communication, with caution about reliability in relationships.', verse: 'Ch. 16, sloka 34' },
    { planets: 'Jupiter Venus Saturn', text: 'The text emphasizes learning, virtue, and public recognition.', verse: 'Ch. 16, sloka 35' },
    { planets: 'Moon Jupiter Venus', text: 'This combination is also listed in the four-planet chapter, which names only these three planets; verify the source discrepancy.', verse: 'Ch. 17, sloka 8', warning: 'The chapter heading says four planets, but this verse names three.' },
    { planets: 'Sun Mercury Venus', text: 'This combination is also listed in the four-planet chapter, which names only these three planets; verify the source discrepancy.', verse: 'Ch. 17, sloka 17', warning: 'The chapter heading says four planets, but this verse names three.' },

    { planets: 'Sun Moon Mars Mercury', text: 'The text emphasizes writing, ingenuity, and persuasive speech, with caution about manipulation or evasiveness.', verse: 'Ch. 17, sloka 1' },
    { planets: 'Sun Moon Mars Jupiter', text: 'The text emphasizes wealth, energy, practical skill, and confidence.', verse: 'Ch. 17, sloka 2' },
    { planets: 'Sun Moon Mars Venus', text: 'The text emphasizes initiative, social confidence, resourcefulness, and family life.', verse: 'Ch. 17, sloka 3' },
    { planets: 'Sun Moon Mars Saturn', text: 'The text describes uneven progress, material pressure, and a need for steady effort.', verse: 'Ch. 17, sloka 4' },
    { planets: 'Sun Moon Mercury Jupiter', text: 'The text emphasizes scholarship, technical or artistic skill, wealth, and confidence.', verse: 'Ch. 17, sloka 5' },
    { planets: 'Sun Moon Mercury Venus', text: 'The text emphasizes good fortune, communication, and public recognition.', verse: 'Ch. 17, sloka 6' },
    { planets: 'Sun Moon Mercury Saturn', text: 'The text describes wandering or instability and possible strain around family and resources.', verse: 'Ch. 17, sloka 7' },
    { planets: 'Sun Moon Jupiter Saturn', text: 'The text emphasizes resources, public standing, and confidence, with intense emotional themes.', verse: 'Ch. 17, sloka 9' },
    { planets: 'Sun Moon Venus Saturn', text: 'The text describes uneven vitality and relationship pressures; treat this as a traditional theme, not a diagnosis.', verse: 'Ch. 17, sloka 10' },
    { planets: 'Sun Mars Mercury Jupiter', text: 'The text emphasizes courage, scholarship, writing, and a public or leadership role.', verse: 'Ch. 17, sloka 11' },
    { planets: 'Sun Mars Mercury Venus', text: 'The text describes intense passions and possible social or relationship conflict.', verse: 'Ch. 17, sloka 12' },
    { planets: 'Sun Mars Mercury Saturn', text: 'The text emphasizes scholarship, discipline, and leadership or service.', verse: 'Ch. 17, sloka 13' },
    { planets: 'Sun Mars Jupiter Venus', text: 'The text emphasizes fortune, resources, public respect, and recognition.', verse: 'Ch. 17, sloka 14' },
    { planets: 'Sun Mars Jupiter Saturn', text: 'The text emphasizes ambition, social standing, and supportive networks.', verse: 'Ch. 17, sloka 15' },
    { planets: 'Sun Mars Venus Saturn', text: 'The text describes difficult social dynamics and pressure on relationships.', verse: 'Ch. 17, sloka 16' },
    { planets: 'Sun Mercury Jupiter Saturn', text: 'The text emphasizes public responsibility, scholarship, and strong opinions.', verse: 'Ch. 17, sloka 18' },
    { planets: 'Sun Mercury Venus Saturn', text: 'The text emphasizes communication, learning, confidence, and helpfulness to friends.', verse: 'Ch. 17, sloka 19' },
    { planets: 'Sun Jupiter Venus Saturn', text: 'The text emphasizes practical intelligence, leadership, and creative or technical work.', verse: 'Ch. 17, sloka 20' },
    { planets: 'Moon Mars Mercury Jupiter', text: 'The text emphasizes scholarship, intelligence, speech, and leadership.', verse: 'Ch. 17, sloka 21' },
    { planets: 'Moon Mars Mercury Venus', text: 'The text describes argumentative tendencies and strain in family or relationship matters.', verse: 'Ch. 17, sloka 22' },
    { planets: 'Moon Mars Mercury Saturn', text: 'The text emphasizes courage and persistence, with complex family or social responsibilities.', verse: 'Ch. 17, sloka 23' },
    { planets: 'Moon Mars Jupiter Saturn', text: 'The text emphasizes self-respect, learning, tolerance, and support from friends.', verse: 'Ch. 17, sloka 24', warning: 'The same planetary set appears again in sloka 25 with differing results.' },
    { planets: 'Moon Mars Jupiter Saturn', text: 'A second verse gives a differing emphasis on courage, speech, wisdom, and generosity.', verse: 'Ch. 17, sloka 25', warning: 'The same planetary set appears in both slokas 24 and 25 with different wording.' },
    { planets: 'Moon Mars Saturn Venus', text: 'The text describes emotional intensity and relationship strain.', verse: 'Ch. 17, sloka 26' },
    { planets: 'Moon Mercury Jupiter Venus', text: 'The text emphasizes learning, wealth, good judgment, and social support.', verse: 'Ch. 17, sloka 27' },
    { planets: 'Moon Mercury Jupiter Saturn', text: 'The text emphasizes learning, responsibility, wisdom, and public service.', verse: 'Ch. 17, sloka 28' },
    { planets: 'Moon Mercury Saturn Venus', text: 'The text describes social or relationship complications alongside learning and communication.', verse: 'Ch. 17, sloka 29' },
    { planets: 'Moon Jupiter Venus Saturn', text: 'The text emphasizes language, knowledge, and travel, alongside periods of grief or strain.', verse: 'Ch. 17, sloka 30' },
    { planets: 'Mars Mercury Jupiter Venus', text: 'The text emphasizes resources, good qualities, public regard, and social intensity.', verse: 'Ch. 17, sloka 31' },
    { planets: 'Mars Mercury Jupiter Saturn', text: 'The text emphasizes courage, learning, speech, and perseverance.', verse: 'Ch. 17, sloka 32' },
    { planets: 'Mars Mercury Saturn Venus', text: 'The text emphasizes physical or technical work, determination, and dependence on others.', verse: 'Ch. 17, sloka 33' },
    { planets: 'Mars Jupiter Venus Saturn', text: 'The text emphasizes energy, resources, and ambition, with caution about impulsive choices.', verse: 'Ch. 17, sloka 34' },
    { planets: 'Mercury Jupiter Venus Saturn', text: 'The text emphasizes learning, intellectual interests, and service, with relationship cautions.', verse: 'Ch. 17, sloka 35' },

    { planets: 'Sun Moon Mars Jupiter Mercury', text: 'The text emphasizes learning, virtue, languages, and specialized knowledge, alongside personal strain.', verse: 'Ch. 18, sloka 1' },
    { planets: 'Sun Moon Mars Venus Mercury', text: 'The text describes service to others and possible loss of confidence or support from associates.', verse: 'Ch. 18, sloka 2' },
    { planets: 'Sun Moon Mars Mercury Saturn', text: 'The text describes restrictive circumstances, loss, and emotional pressure.', verse: 'Ch. 18, sloka 3' },
    { planets: 'Sun Moon Mars Jupiter Venus', text: 'The text describes grief and family strain, while noting musical or artistic interests.', verse: 'Ch. 18, sloka 4' },
    { planets: 'Sun Moon Mars Jupiter Saturn', text: 'The text emphasizes courage and action, with caution about conflict and unreliable conduct.', verse: 'Ch. 18, sloka 5' },
    { planets: 'Sun Moon Mars Venus Saturn', text: 'The text describes pressure on resources, reputation, and relationships.', verse: 'Ch. 18, sloka 6' },
    { planets: 'Sun Moon Mercury Jupiter Saturn', text: 'The text emphasizes technical skill, prosperity, public office, and recognition.', verse: 'Ch. 18, sloka 7', warning: 'The same planetary set appears again in sloka 8 with differing results.' },
    { planets: 'Sun Moon Mercury Jupiter Saturn', text: 'A second verse describes timidity, separation from support, and dependence on others.', verse: 'Ch. 18, sloka 8', warning: 'The same planetary set appears in both slokas 7 and 8 with differing results.' },
    { planets: 'Sun Moon Mercury Venus Saturn', text: 'The text describes limited ease in family or material matters and a tendency toward restlessness.', verse: 'Ch. 18, sloka 9' },
    { planets: 'Sun Moon Jupiter Venus Saturn', text: 'The text emphasizes learning and social appeal, alongside many competing demands.', verse: 'Ch. 18, sloka 10' },
    { planets: 'Sun Mars Mercury Jupiter Venus', text: 'The text emphasizes leadership, public favor, and success in organized or technical work.', verse: 'Ch. 18, sloka 11' },
    { planets: 'Sun Mars Mercury Jupiter Saturn', text: 'The text describes emotional strain, illness-related language in the source, and material instability; this is not a medical prediction.', verse: 'Ch. 18, sloka 12' },
    { planets: 'Moon Mars Mercury Venus Saturn', text: 'The text describes obstacles and conflict, while also emphasizing learning and public regard.', verse: 'Ch. 18, sloka 13', warning: 'The same planetary set appears again in sloka 20 with differing results.' },
    { planets: 'Sun Mars Mercury Venus Saturn', text: 'The text describes pressure from setbacks and strained social or professional circumstances.', verse: 'Ch. 18, sloka 14' },
    { planets: 'Moon Mars Jupiter Venus Saturn', text: 'The text describes service, difficulty, and strain around resources or relationships.', verse: 'Ch. 18, sloka 15' },
    { planets: 'Sun Mars Jupiter Venus Saturn', text: 'The text emphasizes technical and practical skill, work with materials, and recognition.', verse: 'Ch. 18, sloka 16' },
    { planets: 'Sun Mercury Jupiter Venus Saturn', text: 'The text emphasizes scholarship, virtue, and helpfulness toward friends and elders.', verse: 'Ch. 18, sloka 17' },
    { planets: 'Moon Mars Mercury Jupiter Venus', text: 'The text emphasizes learning, truthfulness, prosperity, and support for relatives and friends.', verse: 'Ch. 18, sloka 18' },
    { planets: 'Moon Mars Mercury Jupiter Saturn', text: 'The text describes hardship, dependence, and strain on social or family reputation.', verse: 'Ch. 18, sloka 19' },
    { planets: 'Moon Mars Mercury Venus Saturn', text: 'The text describes a wide social network and public regard, alongside difficult or mixed conduct.', verse: 'Ch. 18, sloka 20', warning: 'The same planetary set appears again in sloka 13 with differing results.' },
    { planets: 'Moon Mercury Jupiter Venus Saturn', text: 'The text emphasizes public service, leadership, and recognition.', verse: 'Ch. 18, sloka 21' },
    { planets: 'Mars Mercury Jupiter Venus Saturn', text: 'The text emphasizes public standing and strong feelings, while noting material pressure.', verse: 'Ch. 18, sloka 22' },

    { planets: 'Sun Moon Mars Mercury Jupiter Venus', text: 'The text emphasizes learning, virtue, languages, and specialized knowledge.', verse: 'Ch. 19, sloka 1' },
    { planets: 'Sun Moon Mars Mercury Jupiter Saturn', text: 'The text emphasizes generosity and service, with a changeable disposition.', verse: 'Ch. 19, sloka 2' },
    { planets: 'Sun Moon Mars Mercury Saturn Venus', text: 'The text describes conflict and difficulty in social, family, or material matters.', verse: 'Ch. 19, sloka 3' },
    { planets: 'Sun Moon Mars Jupiter Venus Saturn', text: 'The text describes service to others and strain involving relatives or responsibilities.', verse: 'Ch. 19, sloka 4' },
    { planets: 'Sun Moon Mercury Jupiter Venus Saturn', text: 'The text emphasizes public or administrative service, patience, and recognition, with personal trade-offs.', verse: 'Ch. 19, sloka 5' },
    { planets: 'Sun Mars Mercury Jupiter Venus Saturn', text: 'The text emphasizes travel, spiritual or service-oriented work, and material restraint.', verse: 'Ch. 19, sloka 6' },
    { planets: 'Moon Mars Mercury Jupiter Venus Saturn', text: 'The text emphasizes leadership, courage, and public favor, with complex relationship themes.', verse: 'Ch. 19, sloka 7' }
  ];

  function keyFor(planetNames) {
    const planets = Array.from(new Set(planetNames));
    if (planets.length !== planetNames.length || planets.some(name => PLANET_RANK[name] === undefined)) return null;
    return planets.sort((a, b) => PLANET_RANK[a] - PLANET_RANK[b]).join('|');
  }

  const grouped = ENTRIES.reduce((map, entry) => {
    const key = keyFor(entry.planets.split(' '));
    if (!map[key]) map[key] = [];
    map[key].push({
      planets: entry.planets.split(' '),
      text: entry.text,
      reference: 'Saravali, ' + entry.verse,
      warning: entry.warning || ''
    });
    return map;
  }, {});

  const api = {
    planets: PLANET_ORDER.slice(),
    getExact: function (planetNames) {
      if (!Array.isArray(planetNames)) return null;
      const key = keyFor(planetNames);
      if (!key || !grouped[key]) return null;
      return grouped[key].slice();
    },
    count: function () {
      return ENTRIES.length;
    }
  };

  global.SARAVALI_CONJUNCTIONS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
