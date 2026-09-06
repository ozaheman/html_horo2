/**
 * KP_prediction_8.js
 *
 * PART 8 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-7 — reuses window.KP_PREDICTION (Part 1)
 * for house-signification / cusp lookups, and window.KP_PREDICTION_7's
 * house-data builder where possible (falls back to its own copy if
 * Part 7 isn't loaded, so this module stands on its own too).
 *
 * WHAT THIS ADDS
 * ---------------
 * The classic KP "Promise vs Result" distinction, applied to a curated,
 * self-authored set of traditional house-combination events:
 *
 *   - PROMISE is read from the house cusp's Nakshatra Lord (NL / star
 *     lord): does the NL's own house signification touch the event's
 *     required house combination at all?
 *   - RESULT QUALITY is read from the same cusp's Sub Lord (CSL / KP's
 *     "cuspal sub lord"): does the CSL lean toward growth houses
 *     (1-2-5-9-10-11) or trik/difficulty houses (6-8-12) — i.e. if the
 *     promise is there, does it tend to resolve positively, negatively,
 *     or as a mixed bag?
 *
 * Wired into the SAME two existing host panels as Part 7 (Dasha
 * Explorer via main.js, Predictions Dashboard via predictions_ui.js),
 * appended right after Part 7's section, via one function:
 *
 *   window.KP_PREDICTION_8.renderForPanel({ natalPlanets, natalAsc,
 *     sectionClass, instanceId })
 *
 * instanceId keeps DOM ids unique when both host panels render this
 * module at once (their search/detail state is tracked separately).
 *
 * The event list is a 406-entry KP house-combination reference spanning
 * all 12 houses (job, marriage, property, litigation, health, foreign
 * travel, disputes, education, and more). Each entry also carries a
 * requiredPlanets list where the source reference names specific
 * planets (e.g. "6,8,12 with influence of Mars") — the factual house
 * numbers and planet name are kept, but the reference's own descriptive
 * qualifiers around them are not reproduced.
 *
 * For any event with named planets, the detail view adds a
 * "Combination & strength check": for each named planet, whether it
 * occupies or aspects (graha drishti) any of the event's houses in the
 * loaded chart, and how strong it currently is via window.SHADBALA
 * (shadbala.js), when that module is loaded.
 *
 * Every event also carries a plain-language polarity tag — positive
 * (e.g. marriage, promotion, disease recovery), negative (e.g.
 * divorce, job loss, hospitalisation), or neutral/situational (e.g.
 * change of residence, foreign travel) — shown as a dot in the library
 * list and a badge in the detail view. This is independent of the
 * Promise/Result verdict: for a negative event, "Promised" means the
 * unwanted outcome is indicated, not that it's good news, so the
 * detail view adds a framing note to make that distinction explicit.
 *
 * Each required planet's combination check also covers affliction and
 * Maraka status, per commonly-cited classical rules (documented in
 * full at each function, since several of these points are genuinely
 * debated rather than settled):
 *   - A planet is "afflicted" here if it is conjunct with, or receives
 *     drishti (aspect) from, a classical malefic (Saturn/Mars/Rahu/
 *     Ketu) or a Maraka lord.
 *   - Rahu is given Jupiter-like 5th/7th/9th aspects (the most common
 *     modern convention); Ketu is given NO aspect at all here (only
 *     conjunction counts) — following the classical argument that
 *     Ketu, being headless, has no drishti. Other traditions treat
 *     Ketu like Mars (4th/7th/8th) instead; that view is not applied.
 *   - Maraka lords are always the 2nd & 7th house lords (universal
 *     rule), plus — shown separately — the classical alternate rule
 *     where Maraka houses shift by whether the ascendant is movable
 *     (2nd/7th), fixed (3rd/8th), or dual (7th/11th).
 *   - Sun and Moon's affliction status is checked for every event
 *     regardless of whether either is named in that event's own
 *     combination, since classical Jyotish gives afflicted luminaries
 *     special weight for vitality and mind.
 */

(function () {
  'use strict';

  var SEQ = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  var HOUSE_MEANING = {
    1: 'self, health, new starts', 2: 'wealth, family, speech, accumulated resources',
    3: 'self-effort, communication, courage, siblings, short travel',
    4: 'home, property, vehicles, mother, inner comfort',
    5: 'creativity, children, romance, speculation, intellect',
    6: 'service, disputes, debts, daily work, health friction',
    7: 'partnership, marriage, business dealings, the public',
    8: 'sudden change, obstacles, inheritance, research, transformation',
    9: 'fortune, father, higher learning, long journeys, dharma',
    10: 'career, status, authority, public recognition',
    11: 'gains, income, fulfillment of desire, networks',
    12: 'expenditure, loss, foreign connection, isolation, closure'
  };
  var GROWTH_HOUSES = [1, 2, 5, 9, 10, 11];
  var TRIK_HOUSES = [6, 8, 12];

  // ================================================================
  // EVENT LIBRARY (406 entries) — a comprehensive KP house-combination
  // reference covering all 12 houses, converted into structured data
  // (event name + governing house numbers only; the planetary/sign
  // qualifiers from the source reference are intentionally left out —
  // this engine's Promise/Result verdict works purely from house
  // signification, not planet-specific conditions).
  // ================================================================
  var EVENT_LIBRARY = [
    { name: "Always Sick", primary_house: 1, houses: [1,4,6,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Charming Face", primary_house: 1, houses: [1,5], requiredPlanets: ["Venus", "Moon", "Mercury"] , polarity: "positive" },
    { name: "Go out of Present Environment", primary_house: 1, houses: [1,3,7,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Good Health", primary_house: 1, houses: [1,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Lagan Lord Very Weak", primary_house: 1, houses: [1,5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Long Life (Over 66 years)", primary_house: 1, houses: [1,3,5,8,9,10], requiredPlanets: [] , polarity: "positive" },
    { name: "Long Life Span", primary_house: 1, houses: [1,3,5,8,9,10], requiredPlanets: [] , polarity: "positive" },
    { name: "Politics Failure", primary_house: 1, houses: [1,5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Proneness to Diseases", primary_house: 1, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Sickness of the mind", primary_house: 1, houses: [1,6,12], requiredPlanets: ["Moon"] , polarity: "negative" },
    { name: "Success in Political career", primary_house: 1, houses: [1,6,9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in Self Efforts", primary_house: 1, houses: [1,3,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Surgery", primary_house: 1, houses: [1,6,8,12], requiredPlanets: ["Mars"] , polarity: "negative" },
    { name: "Weak Lagan", primary_house: 1, houses: [1,5,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Discharge From Hospital", primary_house: 1, houses: [1,2,4,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Disease-Long Life", primary_house: 1, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Disease-Recovery", primary_house: 1, houses: [1,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Criminal mind", primary_house: 1, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Danger to Life or Unnatural or Accidental Death", primary_house: 1, houses: [1,4,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Accumulating Huge Wealth", primary_house: 2, houses: [2,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Ancestral property", primary_house: 2, houses: [2,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Bank Deposit", primary_house: 2, houses: [2,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Gain/Success in Independent Business", primary_house: 2, houses: [2,3,7,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Gaining Wealth, Increase Bank Deposit", primary_house: 2, houses: [2,6,10,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Illicit connections with women", primary_house: 2, houses: [2,5,8,11], requiredPlanets: ["Rahu", "Venus"] , polarity: "negative" },
    { name: "Increase in Ornaments, Jewels", primary_house: 2, houses: [2,8,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Independent earnings", primary_house: 2, houses: [2,4,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Insurance Claim", primary_house: 2, houses: [2,8,11], requiredPlanets: ["Mercury"] , polarity: "neutral" },
    { name: "Insurance legacy gratuity", primary_house: 2, houses: [2,8,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Long Journey and Interaction with Foreigners", primary_house: 2, houses: [2,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Loosing Wealth, Money", primary_house: 2, houses: [2,5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Loss of Money", primary_house: 2, houses: [1,2,7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Medical Claims", primary_house: 2, houses: [2,6,8,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Obtaining Jewellery", primary_house: 2, houses: [2,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Once for all Lost of property", primary_house: 2, houses: [2,5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "One's Exertion", primary_house: 2, houses: [1,2,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Opening Bank account", primary_house: 2, houses: [2,6,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Poverty", primary_house: 2, houses: [2,5,8,12], requiredPlanets: ["Saturn", "Rahu"] , polarity: "negative" },
    { name: "Proficient in occult science", primary_house: 2, houses: [2,9,12], requiredPlanets: ["Ketu", "Venus", "Mercury", "Saturn"] , polarity: "positive" },
    { name: "Self-acquisition", primary_house: 2, houses: [2,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Separation from family", primary_house: 2, houses: [1,2,3,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Serving others", primary_house: 2, houses: [2,6,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Purchase of movable property", primary_house: 2, houses: [2,6,9,11], requiredPlanets: ["Venus"] , polarity: "positive" },
    { name: "Recovery of lost property", primary_house: 2, houses: [2,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Wealth Enormous", primary_house: 2, houses: [2,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Wealth-Medium", primary_house: 2, houses: [2,5,8,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Wealthlessness", primary_house: 2, houses: [2,5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Defect in speech or defect in right vision of gents", primary_house: 2, houses: [2,8,12], requiredPlanets: ["Ketu"] , polarity: "negative" },
    { name: "Eyes to Be healthy", primary_house: 2, houses: [2,3,11], requiredPlanets: ["Sun", "Moon"] , polarity: "positive" },
    { name: "Financial status", primary_house: 2, houses: [2,6,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Gains from independent business", primary_house: 2, houses: [2,7,10,11], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Deaf and Dumb", primary_house: 2, houses: [2,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Boldness/Rashness", primary_house: 3, houses: [3,6,10,11], requiredPlanets: ["Mars"] , polarity: "neutral" },
    { name: "Boldness to Take a Job", primary_house: 3, houses: [2,3,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Getting a telephone call", primary_house: 3, houses: [3,9,11], requiredPlanets: ["Mercury"] , polarity: "neutral" },
    { name: "Hearing news about a missing person", primary_house: 3, houses: [3,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Instant Predictions", primary_house: 3, houses: [3,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Long Distance call", primary_house: 3, houses: [3,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Loss in appeal", primary_house: 3, houses: [3,5,12], requiredPlanets: ["Jupiter"] , polarity: "negative" },
    { name: "Loss in reputation", primary_house: 3, houses: [3,8,9,12], requiredPlanets: ["Sun", "Moon"] , polarity: "negative" },
    { name: "Making contract or agreement", primary_house: 3, houses: [1,3,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Marriage negotiation", primary_house: 3, houses: [3,7,9], requiredPlanets: [] , polarity: "neutral" },
    { name: "Marriage-engagement", primary_house: 3, houses: [3,7,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Meeting a Person or appointment", primary_house: 3, houses: [3,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Money obtained by selling possession", primary_house: 3, houses: [3,11,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Negotiation to take over a business", primary_house: 3, houses: [3,6,9,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Negotiation to adopt a child", primary_house: 3, houses: [3,5,9], requiredPlanets: [] , polarity: "neutral" },
    { name: "Negotiations", primary_house: 3, houses: [3,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "News of Promotion in service with transfer order", primary_house: 3, houses: [3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "One speak Truth", primary_house: 3, houses: [3,9,11], requiredPlanets: ["Sun", "Jupiter"] , polarity: "positive" },
    { name: "Passport, Green Card, Visa", primary_house: 3, houses: [3,9,11,12], requiredPlanets: ["Mercury", "Venus", "Jupiter"] , polarity: "positive" },
    { name: "Rumour or any information is false", primary_house: 3, houses: [3,9,11], requiredPlanets: ["Saturn", "Rahu", "Mars"] , polarity: "negative" },
    { name: "Selling at loss", primary_house: 3, houses: [3,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Selling with profit", primary_house: 3, houses: [3,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Short Journey, Touring", primary_house: 3, houses: [3,7,11], requiredPlanets: ["Mercury"] , polarity: "neutral" },
    { name: "Signing a contract", primary_house: 3, houses: [3,6,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Starting Journey", primary_house: 3, houses: [3,5,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Success in appeal", primary_house: 3, houses: [3,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in personal interview", primary_house: 3, houses: [3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Successful broker", primary_house: 3, houses: [3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Publishing a Book", primary_house: 3, houses: [3,10,11], requiredPlanets: ["Mars", "Mercury", "Jupiter"] , polarity: "positive" },
    { name: "Purchase of TV, Electrical goods", primary_house: 3, houses: [1,3,5,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Receipt of a letter", primary_house: 3, houses: [3,11], requiredPlanets: ["Mercury"] , polarity: "neutral" },
    { name: "Receipt of Document", primary_house: 3, houses: [3,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Receipt of news causing worries", primary_house: 3, houses: [3,8,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Successful negotiation", primary_house: 3, houses: [3,11], requiredPlanets: ["Mercury", "Jupiter"] , polarity: "positive" },
    { name: "Timid and Coward person", primary_house: 3, houses: [3,8,12], requiredPlanets: ["Saturn"] , polarity: "negative" },
    { name: "Younger siblings \u2013 Death", primary_house: 3, houses: [2,3,4], requiredPlanets: [] , polarity: "negative" },
    { name: "Younger siblings \u2013 living in Harmony", primary_house: 3, houses: [1,3,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Younger siblings - Enmity", primary_house: 3, houses: [3,6,8], requiredPlanets: [] , polarity: "negative" },
    { name: "Younger siblings \u2013 separation", primary_house: 3, houses: [2,3,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Filing a court case", primary_house: 3, houses: [3,6,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Gain from lottery", primary_house: 3, houses: [3,5,6,8,11], requiredPlanets: ["Rahu"] , polarity: "positive" },
    { name: "Danger to life", primary_house: 3, houses: [3,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Adopt a child", primary_house: 4, houses: [2,4,8], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Ancestral property (getting)", primary_house: 4, houses: [4,6,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Basic education up to Graduation", primary_house: 4, houses: [4,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Break Education", primary_house: 4, houses: [4,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Change of residence", primary_house: 4, houses: [3,4,11,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Get a degree with difficulties", primary_house: 4, houses: [2,4,8,10,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Job in a permanent place", primary_house: 4, houses: [4,10], requiredPlanets: [] , polarity: "positive" },
    { name: "Landed property ownership", primary_house: 4, houses: [4,11,12], requiredPlanets: ["Saturn", "Mars"] , polarity: "positive" },
    { name: "Lower level education", primary_house: 4, houses: [2,4,11], requiredPlanets: ["Mercury", "Moon", "Jupiter"] , polarity: "negative" },
    { name: "Marrying a career girl", primary_house: 4, houses: [4,8,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Occupying a new house", primary_house: 4, houses: [1,4,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Own Vehicle", primary_house: 4, houses: [4,11], requiredPlanets: ["Venus"] , polarity: "positive" },
    { name: "Pleasant function at home", primary_house: 4, houses: [4,5,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Sale of any vehicle", primary_house: 4, houses: [3,4,5,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Selling a car", primary_house: 4, houses: [3,4,5,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Separation from mother", primary_house: 4, houses: [3,4,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Study of law", primary_house: 4, houses: [4,6,9], requiredPlanets: ["Jupiter", "Mercury"] , polarity: "positive" },
    { name: "Success in competitive exam", primary_house: 4, houses: [4,6,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Purchase of car", primary_house: 4, houses: [4,9,10,11], requiredPlanets: ["Venus", "Mars"] , polarity: "positive" },
    { name: "Purchase of property by instalments/loan", primary_house: 4, houses: [4,6,11,12], requiredPlanets: ["Saturn"] , polarity: "positive" },
    { name: "Purchase of vehicles", primary_house: 4, houses: [4,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Reach home in time", primary_house: 4, houses: [4,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Rent a property", primary_house: 4, houses: [4,6,10,11,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Taking possession of flat, residence", primary_house: 4, houses: [4,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Theft of vehicle", primary_house: 4, houses: [4,6,8,12], requiredPlanets: ["Saturn", "Rahu"] , polarity: "negative" },
    { name: "Death of mother", primary_house: 4, houses: [3,4,5,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Deposit money in bank", primary_house: 4, houses: [2,4,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Education - less person", primary_house: 4, houses: [3,4,8,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Failure in exam", primary_house: 4, houses: [3,4,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Gain a degree through correspondence", primary_house: 4, houses: [3,4,9,12], requiredPlanets: [] , polarity: "positive" },
    { name: "College admission", primary_house: 4, houses: [4,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Coming back home after discharge from hospital", primary_house: 4, houses: [2,4,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Coming from abroad", primary_house: 4, houses: [2,3,4,8,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Completion or damage in education", primary_house: 4, houses: [3,4,5,8], requiredPlanets: [] , polarity: "negative" },
    { name: "Construct a house", primary_house: 4, houses: [4,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Construct of a religious building", primary_house: 4, houses: [4,11,12], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Construction of several houses", primary_house: 4, houses: [4,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Addiction to alcohol", primary_house: 5, houses: [1,2,3,4,5,6], requiredPlanets: ["Saturn", "Mars", "Rahu", "Venus"] , polarity: "negative" },
    { name: "Caesarean child birth", primary_house: 5, houses: [2,5,8], requiredPlanets: ["Mars"] , polarity: "neutral" },
    { name: "Child Birth", primary_house: 5, houses: [2,5,11], requiredPlanets: ["Jupiter", "Moon", "Venus"] , polarity: "positive" },
    { name: "Child adoption", primary_house: 5, houses: [5,6,8,10], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Child birth denial and abortion", primary_house: 5, houses: [1,4,5,8,10,12], requiredPlanets: ["Rahu", "Mars", "Ketu"] , polarity: "negative" },
    { name: "Child's health", primary_house: 5, houses: [3,5,9], requiredPlanets: [] , polarity: "neutral" },
    { name: "Having an affair with one's business partner", primary_house: 5, houses: [5,8,11], requiredPlanets: ["Rahu"] , polarity: "negative" },
    { name: "Intelligent thinking", primary_house: 5, houses: [3,5,9,11], requiredPlanets: ["Jupiter", "Venus"] , polarity: "positive" },
    { name: "Inter-community marriage", primary_house: 5, houses: [2,5,7,11], requiredPlanets: ["Rahu", "Ketu"] , polarity: "neutral" },
    { name: "Keeping a mistress", primary_house: 5, houses: [2,5,7,11,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Loose thinking", primary_house: 5, houses: [1,4,5,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Love affair", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Love marriage", primary_house: 5, houses: [2,5,7,11], requiredPlanets: ["Mars", "Venus", "Rahu"] , polarity: "positive" },
    { name: "Love partner and success in love affair", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Mantra receiving", primary_house: 5, houses: [2,5,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "No marriage with a love partner", primary_house: 5, houses: [4,5,6,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Normal delivery", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Pleasure by thinking of love", primary_house: 5, houses: [5,11], requiredPlanets: ["Rahu", "Venus", "Mars"] , polarity: "neutral" },
    { name: "Popular actor, artist", primary_house: 5, houses: [5,6,10], requiredPlanets: ["Mercury", "Venus", "Moon"] , polarity: "positive" },
    { name: "Popularity and success in music", primary_house: 5, houses: [5,6,10,11], requiredPlanets: ["Venus"] , polarity: "positive" },
    { name: "Pregnancy", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Pregnancy and child birth", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Safe and natural delivery of child", primary_house: 5, houses: [3,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Safe from danger/cure/recover", primary_house: 5, houses: [1,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Scandalous love affair", primary_house: 5, houses: [5,8,12], requiredPlanets: ["Rahu"] , polarity: "negative" },
    { name: "Separation from child", primary_house: 5, houses: [4,5,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Siddhi initiation", primary_house: 5, houses: [3,5,9,10,12], requiredPlanets: ["Ketu", "Saturn"] , polarity: "positive" },
    { name: "Speculative business", primary_house: 5, houses: [2,5,8,11], requiredPlanets: ["Rahu", "Mercury"] , polarity: "neutral" },
    { name: "Speculation, cinema, music, children", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Sports, fine arts, film, speculation as work", primary_house: 5, houses: [2,5,6,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Sterility of a woman", primary_house: 5, houses: [1,4,5,10], requiredPlanets: [] , polarity: "negative", signRequirement: "barren" },
    { name: "Success in sports", primary_house: 5, houses: [3,5,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Raped by someone", primary_house: 5, houses: [5,8,12], requiredPlanets: ["Mars", "Rahu", "Saturn"] , polarity: "negative" },
    { name: "Recovery health", primary_house: 5, houses: [3,5], requiredPlanets: [] , polarity: "positive" },
    { name: "Termination of love affair", primary_house: 5, houses: [5,6,8,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Treatment not effective", primary_house: 5, houses: [4,5,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Twin birth", primary_house: 5, houses: [2,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Death of child", primary_house: 5, houses: [4,5,6,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Delivery of child by operation", primary_house: 5, houses: [4,5,8,12], requiredPlanets: ["Mars", "Saturn"] , polarity: "neutral" },
    { name: "Gain in gambling", primary_house: 5, houses: [2,5,10,11], requiredPlanets: ["Rahu"] , polarity: "positive" },
    { name: "Cinema actor", primary_house: 5, houses: [5,7,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Cure disease/recovery/escape from accident or danger", primary_house: 5, houses: [1,5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Borrowing due to disease, difficulties", primary_house: 6, houses: [2,6,7], requiredPlanets: ["Saturn"] , polarity: "negative" },
    { name: "Borrowing from children", primary_house: 6, houses: [4,6], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing from elder brother", primary_house: 6, houses: [6,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing from friends", primary_house: 6, houses: [5,6,8], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing from mother", primary_house: 6, houses: [3,6], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing from wife or partner", primary_house: 6, houses: [6,8], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing from younger brother", primary_house: 6, houses: [2,6], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing from bank", primary_house: 6, houses: [2,6,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Borrowing to repay debts due to business", primary_house: 6, houses: [2,6,9], requiredPlanets: [] , polarity: "negative" },
    { name: "Change in job", primary_house: 6, houses: [1,5,6,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Change in place of job", primary_house: 6, houses: [3,6,7,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Get a desired or good job", primary_house: 6, houses: [2,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Getting a tenant", primary_house: 6, houses: [4,6,11], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Good health by cure/recovery", primary_house: 6, houses: [1,5,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Ill health", primary_house: 6, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Lifelong disease", primary_house: 6, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Loans from bank", primary_house: 6, houses: [2,6,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Loss in competition", primary_house: 6, houses: [5,6,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Obstacles in career", primary_house: 6, houses: [5,6,8,12], requiredPlanets: ["Saturn", "Rahu"] , polarity: "negative" },
    { name: "Promotion in work", primary_house: 6, houses: [2,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Repaying loan", primary_house: 6, houses: [5,6,8,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Returning borrowed money", primary_house: 6, houses: [4,5,6,8,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Secret activities of partner", primary_house: 6, houses: [5,6,11], requiredPlanets: [] , polarity: "negative", signRequirement: "mute" },
    { name: "Success in competitions", primary_house: 6, houses: [1,3,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in litigation", primary_house: 6, houses: [1,6,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Recovery from disease", primary_house: 6, houses: [5,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Suffer from disease", primary_house: 6, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Tender resignation of service in haste", primary_house: 6, houses: [2,6,8,9,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Winning election/litigation/sport/competition", primary_house: 6, houses: [1,3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Debt ridden life", primary_house: 6, houses: [6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Debt to repay debt", primary_house: 6, houses: [3,6,7,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Disease (chronic)", primary_house: 6, houses: [1,6,8], requiredPlanets: ["Saturn"] , polarity: "negative" },
    { name: "Disease is cured, safe from any danger", primary_house: 6, houses: [1,5,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Disease unknown in medical science", primary_house: 6, houses: [6,8,12], requiredPlanets: ["Ketu"] , polarity: "negative" },
    { name: "Earn sufficient money", primary_house: 6, houses: [2,6,11], requiredPlanets: ["Jupiter", "Venus"] , polarity: "positive" },
    { name: "Chronic disease", primary_house: 6, houses: [1,6,8], requiredPlanets: ["Saturn"] , polarity: "negative" },
    { name: "Competitive exam", primary_house: 6, houses: [4,6,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Breaking engagement", primary_house: 7, houses: [5,7,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Gain/profit in business", primary_house: 7, houses: [2,7,10,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Independent business", primary_house: 7, houses: [3,7,10,11], requiredPlanets: ["Mars", "Mercury"] , polarity: "positive" },
    { name: "Loss in business", primary_house: 7, houses: [5,7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Loss in business industry", primary_house: 7, houses: [5,7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Marriage already fixed stops abruptly", primary_house: 7, houses: [1,6,7,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Marriage and separation", primary_house: 7, houses: [1,6,7,10], requiredPlanets: ["Jupiter"] , polarity: "negative" },
    { name: "Marriage celebration", primary_house: 7, houses: [2,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Marriage negotiation (partnership)", primary_house: 7, houses: [3,7,9], requiredPlanets: [] , polarity: "neutral" },
    { name: "Marriage to a widow", primary_house: 7, houses: [2,7,11], requiredPlanets: ["Saturn", "Rahu"] , polarity: "neutral" },
    { name: "Marriage to an aged partner", primary_house: 7, houses: [2,7,11], requiredPlanets: ["Saturn"] , polarity: "neutral" },
    { name: "Marriage to foreigner", primary_house: 7, houses: [2,5,7,9,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Misunderstanding with partner and family members", primary_house: 7, houses: [2,7,8], requiredPlanets: [] , polarity: "negative" },
    { name: "Multiple marriage", primary_house: 7, houses: [2,7,9,11], requiredPlanets: ["Mercury"] , polarity: "negative", signRequirement: "dual" },
    { name: "No marriage", primary_house: 7, houses: [1,6,7,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Partnership breaks", primary_house: 7, houses: [6,7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Partnership of any kind", primary_house: 7, houses: [5,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Publications as business", primary_house: 7, houses: [2,3,6,7,11], requiredPlanets: ["Mars", "Mercury", "Jupiter"] , polarity: "positive" },
    { name: "Return of wife from normal separation", primary_house: 7, houses: [5,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Reunion with partner", primary_house: 7, houses: [5,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Second child", primary_house: 7, houses: [2,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Separation with profit", primary_house: 7, houses: [1,6,7,10,12], requiredPlanets: ["Sun", "Rahu", "Saturn", "Mars"] , polarity: "neutral" },
    { name: "Separation by violence", primary_house: 7, houses: [6,7,8,12], requiredPlanets: ["Mars"] , polarity: "negative" },
    { name: "Separation due to misunderstanding with partner", primary_house: 7, houses: [2,7,12], requiredPlanets: ["Mercury"] , polarity: "negative" },
    { name: "Separation from partner", primary_house: 7, houses: [6,7,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Separation of spouse/partner by death", primary_house: 7, houses: [6,7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Separation of spouses from each other", primary_house: 7, houses: [1,6,7,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Spouse/partner will be an employee", primary_house: 7, houses: [4,7,8,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Reconciliation after separation/divorce", primary_house: 7, houses: [1,2,5,6,7,10,11,12], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Theft in house", primary_house: 7, houses: [2,7,12], requiredPlanets: ["Saturn", "Mars", "Rahu"] , polarity: "negative" },
    { name: "Independent business (partnership)", primary_house: 7, houses: [2,3,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Difficulties in married life", primary_house: 7, houses: [4,6,7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Death of partner", primary_house: 7, houses: [1,6,7,8], requiredPlanets: [] , polarity: "negative" },
    { name: "Delay in marriage", primary_house: 7, houses: [1,2,6,7,10,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Divorce finalized", primary_house: 7, houses: [1,6,7,10,12], requiredPlanets: ["Jupiter"] , polarity: "negative" },
    { name: "Dowry receiving", primary_house: 7, houses: [2,7,8,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Dull business", primary_house: 7, houses: [1,5,7], requiredPlanets: [] , polarity: "negative" },
    { name: "Commission agency as business", primary_house: 7, houses: [3,7,11], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Conflicts in marriage", primary_house: 7, houses: [6,7,8,12], requiredPlanets: ["Mars"] , polarity: "negative" },
    { name: "Danger from opponents", primary_house: 7, houses: [7,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Accidental death", primary_house: 8, houses: [8,12], requiredPlanets: ["Mars", "Rahu", "Saturn"] , polarity: "negative" },
    { name: "Getting gratuity, insurance etc.", primary_house: 8, houses: [2,5,8,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Giving donation", primary_house: 8, houses: [5,8,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Giving dowry", primary_house: 8, houses: [5,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Calamity", primary_house: 8, houses: [8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Madness or insanity", primary_house: 8, houses: [6,8,12], requiredPlanets: ["Moon", "Mercury", "Ketu", "Saturn"] , polarity: "negative" },
    { name: "Ornaments or cash from inheritance", primary_house: 8, houses: [2,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Person of nuisance for others", primary_house: 8, houses: [5,8], requiredPlanets: ["Sun", "Mars"] , polarity: "negative" },
    { name: "Property through will", primary_house: 8, houses: [6,8,11], requiredPlanets: ["Saturn"] , polarity: "positive" },
    { name: "Property, vehicle from inheritance", primary_house: 8, houses: [4,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Receipt of gifts", primary_house: 8, houses: [6,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Recovery of lost articles", primary_house: 8, houses: [2,6,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Rendering wealth", primary_house: 8, houses: [2,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Suicide", primary_house: 8, houses: [4,8,12], requiredPlanets: ["Mars", "Saturn", "Rahu", "Ketu", "Mercury"] , polarity: "negative" },
    { name: "Surgery/operation", primary_house: 8, houses: [6,8,12], requiredPlanets: ["Mars"] , polarity: "negative" },
    { name: "Unearned gains", primary_house: 8, houses: [2,5,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Unexpected loss", primary_house: 8, houses: [5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Wife's property", primary_house: 8, houses: [1,3,8,9,10], requiredPlanets: ["Mars"] , polarity: "neutral" },
    { name: "Death due to sickness", primary_house: 8, houses: [6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Depression", primary_house: 8, houses: [1,3,8,12], requiredPlanets: ["Moon", "Saturn"] , polarity: "negative" },
    { name: "Disgrace, ill reputation and scandals", primary_house: 8, houses: [1,5,8], requiredPlanets: [] , polarity: "negative" },
    { name: "Free from debts", primary_house: 8, houses: [4,5,8,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Committing an assault/violation", primary_house: 8, houses: [5,8,12], requiredPlanets: ["Mercury"] , polarity: "negative" },
    { name: "Danger to health", primary_house: 8, houses: [1,6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Death due to accident", primary_house: 8, houses: [4,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Astrologer", primary_house: 9, houses: [4,9,12], requiredPlanets: ["Mercury", "Jupiter", "Saturn"] , polarity: "neutral" },
    { name: "Attainment of spirituality", primary_house: 9, houses: [5,9,11], requiredPlanets: ["Ketu", "Jupiter", "Saturn"] , polarity: "positive" },
    { name: "Change in line of career/vocation", primary_house: 9, houses: [5,9,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Good luck (lucky in all)", primary_house: 9, houses: [9,11], requiredPlanets: ["Sun", "Jupiter"] , polarity: "positive" },
    { name: "Higher education", primary_house: 9, houses: [4,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Inheritance of large property", primary_house: 9, houses: [2,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Long journey only", primary_house: 9, houses: [3,9,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Long life for father", primary_house: 9, houses: [1,6,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Marriage \u2013 second after divorce", primary_house: 9, houses: [2,9,11], requiredPlanets: ["Jupiter", "Mercury"] , polarity: "neutral" },
    { name: "Pilgrimage", primary_house: 9, houses: [3,9,10], requiredPlanets: [] , polarity: "positive" },
    { name: "Scientist", primary_house: 9, houses: [2,3,9,10,11], requiredPlanets: ["Saturn", "Jupiter"] , polarity: "neutral" },
    { name: "Second marriage after demise of first spouse", primary_house: 9, houses: [2,9,11], requiredPlanets: ["Ketu", "Mars"] , polarity: "neutral" },
    { name: "Separation from father", primary_house: 9, houses: [3,8,9,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Spiritual life and divine worship", primary_house: 9, houses: [1,5,9,11,12], requiredPlanets: ["Saturn", "Ketu"] , polarity: "positive" },
    { name: "Success in research", primary_house: 9, houses: [6,9,11], requiredPlanets: ["Venus", "Jupiter"] , polarity: "positive" },
    { name: "Success in research (alternate combination)", primary_house: 9, houses: [6,9,11,12], requiredPlanets: ["Saturn", "Jupiter"] , polarity: "positive" },
    { name: "Success in spiritual discipline", primary_house: 9, houses: [6,9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Third child", primary_house: 9, houses: [2,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Foreign study", primary_house: 9, houses: [6,9,11,12], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Further studies (Masters/PhD)", primary_house: 9, houses: [4,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Anticipated promotion (delayed)", primary_house: 10, houses: [2,3,5,10], requiredPlanets: ["Mercury", "Jupiter", "Saturn"] , polarity: "negative" },
    { name: "Break in service", primary_house: 10, houses: [5,8,9,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Getting a business partner", primary_house: 10, houses: [6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Getting an award/prize", primary_house: 10, houses: [6,10,11], requiredPlanets: ["Sun", "Jupiter"] , polarity: "positive" },
    { name: "Honourable life but materially poor", primary_house: 10, houses: [1,3,9,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Inheriting property", primary_house: 10, houses: [2,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Job and independent business together", primary_house: 10, houses: [2,3,6,7,10], requiredPlanets: ["Mercury"] , polarity: "positive" },
    { name: "Legal profession", primary_house: 10, houses: [2,6,9,10,11], requiredPlanets: ["Jupiter", "Mercury", "Mars"] , polarity: "positive", note: "Sub-domain by planet: a stronger, better-connected Mercury points to civil practice; a stronger, better-connected Mars points to criminal practice." },
    { name: "Loss of reputation and money or income tax trouble", primary_house: 10, houses: [7,8,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Loss of work", primary_house: 10, houses: [1,5,9,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "No change of work place", primary_house: 10, houses: [1,4,10,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "No improvement in service or business", primary_house: 10, houses: [2,5,10], requiredPlanets: [] , polarity: "negative" },
    { name: "No occupation in life", primary_house: 10, houses: [5,9,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Politics as profession", primary_house: 10, houses: [2,6,9,10,11], requiredPlanets: ["Jupiter", "Sun", "Saturn"] , polarity: "neutral" },
    { name: "Poor living", primary_house: 10, houses: [8,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Popular astrologer", primary_house: 10, houses: [2,5,9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Popularity and success in politics", primary_house: 10, houses: [2,3,6,10,11], requiredPlanets: ["Saturn", "Rahu"] , polarity: "positive" },
    { name: "Popularity", primary_house: 10, houses: [1,3,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Problem in service", primary_house: 10, houses: [5,6,8,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Promotion & overseas posting", primary_house: 10, houses: [2,3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Reputation", primary_house: 10, houses: [1,10,11], requiredPlanets: ["Sun", "Saturn"] , polarity: "positive" },
    { name: "Retirement from work", primary_house: 10, houses: [5,9,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Sale of immovable property", primary_house: 10, houses: [3,5,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Status and respect", primary_house: 10, houses: [1,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in politics", primary_house: 10, houses: [1,6,9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Successful astrologer", primary_house: 10, houses: [2,9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Successful in share market business", primary_house: 10, houses: [2,5,7,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Publishing press ownership", primary_house: 10, houses: [2,6,10], requiredPlanets: ["Mars", "Mercury"] , polarity: "positive" },
    { name: "Reinstatement", primary_house: 10, houses: [2,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Removal from service", primary_house: 10, houses: [5,8,9,10], requiredPlanets: ["Mars", "Jupiter"] , polarity: "negative" },
    { name: "Suspension", primary_house: 10, houses: [1,5,8,9,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Teaching as profession", primary_house: 10, houses: [2,4,6,9,10,11], requiredPlanets: ["Jupiter", "Venus"] , polarity: "neutral" },
    { name: "Temporary suspension in service", primary_house: 10, houses: [5,6,8,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Transfer", primary_house: 10, houses: [3,10,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Voluntary retirement from service", primary_house: 10, houses: [1,5,9,10], requiredPlanets: [] , polarity: "neutral" },
    { name: "Wife is destined to get property", primary_house: 10, houses: [5,8,10], requiredPlanets: [] , polarity: "positive" },
    { name: "Will tender resignation of service in haste", primary_house: 10, houses: [1,3,8,9,10], requiredPlanets: ["Mars"] , polarity: "negative" },
    { name: "Winding up business or break in career", primary_house: 10, houses: [5,8,10,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Decent living", primary_house: 10, houses: [2,6,9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Donations", primary_house: 10, houses: [9,10,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Export business", primary_house: 10, houses: [3,6,10,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Failure in politics", primary_house: 10, houses: [2,10], requiredPlanets: [] , polarity: "negative" },
    { name: "Fame", primary_house: 10, houses: [1,3,10], requiredPlanets: [] , polarity: "positive" },
    { name: "Forced retirement", primary_house: 10, houses: [5,8,9,10], requiredPlanets: ["Mars", "Jupiter"] , polarity: "negative", note: "The 9th house is classically read as the house of law/litigation here \u2014 its involvement points toward a legal or authority-driven forcing of retirement." },
    { name: "Computer professional", primary_house: 10, houses: [2,3,10,11], requiredPlanets: ["Mercury", "Ketu"] , polarity: "neutral" },
    { name: "Child's return home", primary_house: 11, houses: [5,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Childlessness of a man", primary_house: 11, houses: [1,4,10,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Getting hidden treasure", primary_house: 11, houses: [4,8,11], requiredPlanets: ["Rahu", "Saturn"] , polarity: "positive" },
    { name: "Happy married life", primary_house: 11, houses: [2,7,11], requiredPlanets: ["Venus", "Mars"] , polarity: "positive" },
    { name: "Having marriage as one desired", primary_house: 11, houses: [2,3,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "High position in politics", primary_house: 11, houses: [9,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Higher studies", primary_house: 11, houses: [3,6,9,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Leasing a landed or immovable property", primary_house: 11, houses: [6,11,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Losing through friends", primary_house: 11, houses: [4,5,8,11,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Loss of wealth", primary_house: 11, houses: [5,8,11,12], requiredPlanets: [] , polarity: "negative" },
    { name: "No cure of disease", primary_house: 11, houses: [4,6,11,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Non-recovery of lost articles due to theft", primary_house: 11, houses: [5,8,11,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Popular in acting", primary_house: 11, houses: [5,11], requiredPlanets: ["Mercury", "Venus", "Moon", "Sun"] , polarity: "positive" },
    { name: "Profit in business", primary_house: 11, houses: [2,7,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Promotion/reinstatement/gain in occupation", primary_house: 11, houses: [2,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Research scholarship", primary_house: 11, houses: [2,4,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Returning of missing person", primary_house: 11, houses: [1,2,4,8,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Reunion with spouse", primary_house: 11, houses: [2,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Reunion with kith and kin", primary_house: 11, houses: [3,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Satisfaction of desire", primary_house: 11, houses: [1,11], requiredPlanets: [] , polarity: "positive", signRequirement: "fruitful" },
    { name: "Satisfactory spiritual life", primary_house: 11, houses: [5,10,11], requiredPlanets: ["Ketu"] , polarity: "positive" },
    { name: "Scholarship", primary_house: 11, houses: [2,4,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Scholarship for higher study", primary_house: 11, houses: [4,6,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Sexual relationship with friend", primary_house: 11, houses: [5,8,11], requiredPlanets: [] , polarity: "neutral" },
    { name: "Success in undertakings", primary_house: 11, houses: [1,2,3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in education", primary_house: 11, houses: [4,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in interview", primary_house: 11, houses: [3,9,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Success in love affair", primary_house: 11, houses: [5,11], requiredPlanets: ["Mars", "Venus"] , polarity: "positive" },
    { name: "Successful writer, publisher", primary_house: 11, houses: [3,9,11], requiredPlanets: ["Jupiter", "Mercury"] , polarity: "positive" },
    { name: "Realization of amount due", primary_house: 11, houses: [2,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Unhappy married life", primary_house: 11, houses: [4,6,8,10,11,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Unreliable friend", primary_house: 11, houses: [7,8,9,11], requiredPlanets: ["Moon"] , polarity: "negative" },
    { name: "Vacating by tenant", primary_house: 11, houses: [6,8,11], requiredPlanets: [] , polarity: "negative" },
    { name: "Winning in love", primary_house: 11, houses: [5,7,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Doctorate degree", primary_house: 11, houses: [4,9,11], requiredPlanets: ["Jupiter"] , polarity: "positive" },
    { name: "Earning money through illegal means", primary_house: 11, houses: [2,5,8,11], requiredPlanets: ["Rahu"] , polarity: "negative" },
    { name: "Free of disease", primary_house: 11, houses: [6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Friends helpful and beneficial", primary_house: 11, houses: [1,2,3,6,10,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Gain of money/wealth", primary_house: 11, houses: [2,6,11], requiredPlanets: [] , polarity: "positive" },
    { name: "Absconding", primary_house: 12, houses: [3,8,12], requiredPlanets: ["Saturn", "Rahu"] , polarity: "negative", note: "The source reference actually reads these houses from the absconding/missing person's own chart, not the querent's \u2014 outside what a single-native reading here can check; shown against the loaded chart's own houses for reference only." },
    { name: "Bad luck in the form of any loss", primary_house: 12, houses: [5,8,12], requiredPlanets: ["Saturn", "Mars"] , polarity: "negative" },
    { name: "Getting bail", primary_house: 12, houses: [6,10,11,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Going abroad for job/business", primary_house: 12, houses: [3,6,9,10,12], requiredPlanets: ["Saturn"] , polarity: "positive" },
    { name: "Having bed comfort with one's spouse", primary_house: 12, houses: [1,5,7,12], requiredPlanets: [] , polarity: "positive" },
    { name: "House detention", primary_house: 12, houses: [4,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Imprisonment", primary_house: 12, houses: [3,8,12], requiredPlanets: ["Saturn", "Rahu"] , polarity: "negative" },
    { name: "Insanity", primary_house: 12, houses: [6,8,12], requiredPlanets: ["Moon", "Saturn", "Rahu"] , polarity: "negative" },
    { name: "Loss in investment", primary_house: 12, houses: [1,5,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Mind to commit crime", primary_house: 12, houses: [6,8,10,12], requiredPlanets: ["Rahu", "Mars"] , polarity: "negative" },
    { name: "Mind toward violation of another", primary_house: 12, houses: [5,6,8,12], requiredPlanets: ["Mars"] , polarity: "negative" },
    { name: "Moving from place to place", primary_house: 12, houses: [3,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "New inventions", primary_house: 12, houses: [1,5,9,12], requiredPlanets: ["Rahu"] , polarity: "positive" },
    { name: "Renunciation", primary_house: 12, houses: [1,4,12], requiredPlanets: ["Saturn", "Ketu"] , polarity: "neutral" },
    { name: "Stay in mother land", primary_house: 12, houses: [2,4,8,11,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Purchase of a house", primary_house: 12, houses: [4,6,9,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Release from jail", primary_house: 12, houses: [2,4,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Disease causing defect in body", primary_house: 12, houses: [6,8,12], requiredPlanets: [] , polarity: "negative" },
    { name: "Foreign going", primary_house: 12, houses: [3,9,12], requiredPlanets: [] , polarity: "neutral" },
    { name: "Foreign settlement", primary_house: 12, houses: [3,9,12], requiredPlanets: ["Moon", "Mars"] , polarity: "neutral" },
    { name: "Foreign travel", primary_house: 12, houses: [3,9,12], requiredPlanets: ["Moon", "Rahu"] , polarity: "neutral" },
    { name: "Gain in foreign land and/or with foreigners", primary_house: 12, houses: [2,3,6,10,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Eye disease (defect in left eye)", primary_house: 12, houses: [6,8,12], requiredPlanets: ["Sun", "Moon"] , polarity: "negative" },
    { name: "Gain in investment", primary_house: 12, houses: [2,6,11,12], requiredPlanets: [] , polarity: "positive" },
    { name: "Congenital birth defect", primary_house: 12, houses: [6,12], requiredPlanets: ["Saturn", "Rahu", "Ketu", "Mars"] , polarity: "negative", note: "Bhavat-bhavam link: the 12th (confinement/hospital) is read directly against the 6th (disease) here, rather than each house being judged in isolation." },
    { name: "Danger in secret activities", primary_house: 12, houses: [7,8,12], requiredPlanets: ["Saturn", "Rahu"] , polarity: "negative" },
    { name: "Danger to life or ruined life, death", primary_house: 12, houses: [8,12], requiredPlanets: [] , polarity: "negative" },
  ];

  // ================================================================
  // HOUSE DATA / CSL (reuse Part 7 if present; otherwise self-contained)
  // ================================================================
  function ascSidOf(natalAsc) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._ascSidOf === 'function') return window.KP_PREDICTION_7._ascSidOf(natalAsc);
    return (natalAsc && natalAsc.sid !== undefined) ? natalAsc.sid : ((natalAsc && natalAsc.sn) || 0) * 30;
  }

  function buildHouseData(natalPlanets, natalAsc) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._buildHouseData === 'function') {
      var hd = window.KP_PREDICTION_7._buildHouseData(natalPlanets, natalAsc);
      if (hd && Object.keys(hd).length) return hd;
    }
    var houseData = {};
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function' || typeof P1.getPlanetNumbers !== 'function') return houseData;
    try {
      var allCusps = P1.getAllCusps(ascSidOf(natalAsc));
      var planetNumbers = P1.getPlanetNumbers(allCusps) || {};
      Object.keys(planetNumbers).forEach(function (l) { houseData[l] = planetNumbers[l] || []; });
    } catch (e) {
      console.warn('KP_PREDICTION_8: house signification lookup failed', e);
    }
    return houseData;
  }

  function planetQuality(lord, houseData) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._planetQuality === 'function') return window.KP_PREDICTION_7._planetQuality(lord, houseData);
    var houses = houseData[lord] || [];
    var growth = houses.filter(function (h) { return GROWTH_HOUSES.indexOf(h) !== -1; }).length;
    var trik = houses.filter(function (h) { return TRIK_HOUSES.indexOf(h) !== -1; }).length;
    if (growth > trik) return 'Positive';
    if (trik > growth) return 'Negative';
    return 'Mixed';
  }

  function planetQualityPct(lord, houseData) {
    if (window.KP_PREDICTION_7 && typeof window.KP_PREDICTION_7._planetQualityPct === 'function') return window.KP_PREDICTION_7._planetQualityPct(lord, houseData);
    var houses = houseData[lord] || [];
    var growth = houses.filter(function (h) { return GROWTH_HOUSES.indexOf(h) !== -1; }).length;
    var trik = houses.filter(function (h) { return TRIK_HOUSES.indexOf(h) !== -1; }).length;
    var total = growth + trik;
    var pct = total > 0 ? Math.round((growth / total) * 100) : 50;
    var label = pct > 55 ? 'Positive' : (pct < 45 ? 'Negative' : 'Mixed');
    return { label: label, pct: pct, growth: growth, trik: trik, total: total };
  }

  // Best-effort extraction of a cusp's NL (star lord) and CSL (sub lord).
  // Tries Part 1's own fields first; falls back to computing the NL from
  // whatever numeric sidereal longitude field the cusp object exposes
  // (standard published nakshatra-lord method — same math used
  // everywhere else in this app for star lords).
  function cuspInfo(houseNum, natalPlanets, natalAsc) {
    var P1 = window.KP_PREDICTION;
    if (!P1 || typeof P1.getAllCusps !== 'function') return { subLord: null, starLord: null };
    var allCusps;
    try { allCusps = P1.getAllCusps(ascSidOf(natalAsc)); } catch (e) { return { subLord: null, starLord: null }; }
    var cusp = allCusps && allCusps[houseNum];
    if (!cusp) return { subLord: null, starLord: null };

    var subLord = cusp.subLord || null;
    var starLord = cusp.starLord || cusp.nakshatraLord || cusp.nlLord || cusp.nl || null;

    if (!starLord) {
      var lonFields = ['sid', 'longitude', 'long', 'lon', 'deg', 'cuspSid', 'cuspDeg', 'cuspLongitude'];
      var lon = null;
      for (var i = 0; i < lonFields.length; i++) {
        if (typeof cusp[lonFields[i]] === 'number') { lon = cusp[lonFields[i]]; break; }
      }
      if (lon !== null) {
        var nakArc = 360 / 27;
        var norm = ((lon % 360) + 360) % 360;
        var nakIndex = Math.floor(norm / nakArc);
        starLord = SEQ[nakIndex % 9];
      }
    }
    return { subLord: subLord, starLord: starLord };
  }

  // ================================================================
  // DRISHTI (graha aspect) + OCCUPATION + STRENGTH (Shadbala)
  // ================================================================
  // Standard whole-sign graha drishti: every planet aspects the house
  // 7 signs from its own (the opposite house); Mars additionally
  // aspects the 4th/8th, Jupiter the 5th/9th, Saturn the 3rd/10th
  // (counted inclusively from the planet's own house).
  //
  // Rahu and Ketu are genuinely contested in classical sources. This
  // engine follows the two most commonly cited positions rather than
  // picking one arbitrarily:
  //   - Rahu is given Jupiter-like 5th/7th/9th aspects (the most widely
  //     used convention among modern Jyotish writers, though not
  //     universal).
  //   - Ketu is given NO aspect at all here (not even the base 7th) —
  //     the stronger classical argument being that Ketu, as a headless
  //     (chhinna-shira) graha, has no drishti; Ketu's influence in this
  //     engine is read purely through conjunction, never projected
  //     aspect. Some traditions do give Ketu Mars-like 4th/7th/8th
  //     aspects instead — that view exists but is not applied here.
  var ASPECT_COUNTS = { Mars: [7, 4, 8], Jupiter: [7, 5, 9], Saturn: [7, 3, 10], Rahu: [7, 5, 9] };
  function aspectedHouses(planetName, planetHouse) {
    if (!planetHouse || planetName === 'Ketu') return [];
    var counts = ASPECT_COUNTS[planetName] || [7];
    return counts.map(function (n) { return ((planetHouse - 1 + (n - 1)) % 12) + 1; });
  }

  // Does a planet occupy, and/or aspect (drishti), any of a set of houses?
  function planetInvolvement(planetName, targetHouses, natalPlanets) {
    var p = natalPlanets && natalPlanets[planetName];
    if (!p || typeof p.house !== 'number') return { occupiesHouses: [], aspectsHouses: [] };
    var occupiesHouses = targetHouses.filter(function (h) { return p.house === h; });
    var asp = aspectedHouses(planetName, p.house);
    var aspectsHouses = targetHouses.filter(function (h) { return asp.indexOf(h) !== -1; });
    return { occupiesHouses: occupiesHouses, aspectsHouses: aspectsHouses };
  }

  // ================================================================
  // MARAKA (death/crisis-inflicting) LORDS
  // ================================================================
  // Primary rule (universal across classical sources): the lords of the
  // 2nd and 7th houses from the ascendant are Maraka.
  //
  // Secondary/alternate rule (also classical, less commonly applied):
  // Maraka houses shift depending on whether the ascendant sign is
  // movable (chara), fixed (sthira), or dual (ubhaya) —
  //   movable lagna (Aries/Cancer/Libra/Capricorn): 2nd & 7th lords
  //   fixed lagna (Taurus/Leo/Scorpio/Aquarius): 3rd & 8th lords
  //   dual lagna (Gemini/Virgo/Sagittarius/Pisces): 7th & 11th lords
  // Both are shown, clearly labelled, rather than silently picking one.
  var SIGN_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  var MOVABLE_SIGNS = [0, 3, 6, 9], FIXED_SIGNS = [1, 4, 7, 10], DUAL_SIGNS = [2, 5, 8, 11];
  var MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

  function houseLordOf(houseNum, ascSn) {
    var signIdx = (ascSn + houseNum - 1) % 12;
    return SIGN_LORDS[signIdx];
  }

  function marakaInfo(natalAsc) {
    var ascSn = (natalAsc && natalAsc.sn !== undefined) ? natalAsc.sn : Math.floor(ascSidOf(natalAsc) / 30);
    var primary = Array.from(new Set([houseLordOf(2, ascSn), houseLordOf(7, ascSn)]));
    var category = MOVABLE_SIGNS.indexOf(ascSn) !== -1 ? 'movable' : (FIXED_SIGNS.indexOf(ascSn) !== -1 ? 'fixed' : 'dual');
    var secondaryHouses = category === 'movable' ? [2, 7] : (category === 'fixed' ? [3, 8] : [7, 11]);
    var secondary = Array.from(new Set(secondaryHouses.map(function (h) { return houseLordOf(h, ascSn); })));
    return { primary: primary, secondary: secondary, secondaryHouses: secondaryHouses, category: category, all: Array.from(new Set(primary.concat(secondary))) };
  }

  // ================================================================
  // BADHAKA (obstruction) LORD
  // ================================================================
  // Cross-confirmed classical rule: the Badhaka house depends on the
  // ascendant's modality — movable lagna: 11th house; fixed lagna: 9th
  // house; dual lagna: 7th house. Its lord (Badhakesh) is treated here
  // as an additional affliction source, separate from Maraka.
  function badhakaInfo(natalAsc) {
    var ascSn = (natalAsc && natalAsc.sn !== undefined) ? natalAsc.sn : Math.floor(ascSidOf(natalAsc) / 30);
    var category = MOVABLE_SIGNS.indexOf(ascSn) !== -1 ? 'movable' : (FIXED_SIGNS.indexOf(ascSn) !== -1 ? 'fixed' : 'dual');
    var house = category === 'movable' ? 11 : (category === 'fixed' ? 9 : 7);
    return { house: house, lord: houseLordOf(house, ascSn), category: category };
  }

  // ================================================================
  // SIGN-TYPE CLASSIFICATIONS (mute/voice, fruitful/semi-fruitful/
  // barren) — the classical Hindu Predictive Astrology groupings, used
  // where the source reference names a sign-type requirement instead
  // of (or alongside) a planet. All are by sign element:
  //   Mute signs = the 3 water signs (Cancer, Scorpio, Pisces) — same
  //     set classical texts also call "fruitful" for childbirth/desire
  //     matters; the mute/fruitful duality both trace to water's
  //     receptive, internalising nature.
  //   Voice signs = the 3 air signs (Gemini, Libra, Aquarius).
  //   Barren signs = Aries, Gemini, Leo, Virgo (the most consistently
  //     cited set across sources; a few traditions also add Sagittarius
  //     and Aquarius, which is not applied here).
  //   Semi-fruitful = whatever's left (Taurus, Libra, Sagittarius,
  //     Capricorn, Aquarius).
  // ================================================================
  var MUTE_SIGNS = [3, 7, 11], VOICE_SIGNS = [2, 6, 10];
  var FRUITFUL_SIGNS = [3, 7, 11], BARREN_SIGNS = [0, 2, 4, 5];
  var SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  function signTypeOf(sn) {
    var fert = FRUITFUL_SIGNS.indexOf(sn) !== -1 ? 'fruitful' : (BARREN_SIGNS.indexOf(sn) !== -1 ? 'barren' : 'semi-fruitful');
    var voice = MUTE_SIGNS.indexOf(sn) !== -1 ? 'mute' : (VOICE_SIGNS.indexOf(sn) !== -1 ? 'voice' : 'neutral');
    var modality = MOVABLE_SIGNS.indexOf(sn) !== -1 ? 'movable' : (FIXED_SIGNS.indexOf(sn) !== -1 ? 'fixed' : 'dual');
    return { sign: SIGN_NAMES[sn], fertility: fert, voice: voice, modality: modality };
  }

  // The zodiac sign a given house cusp falls in, from the ascendant.
  function cuspSign(houseNum, natalAsc) {
    var ascSn = (natalAsc && natalAsc.sn !== undefined) ? natalAsc.sn : Math.floor(ascSidOf(natalAsc) / 30);
    return (ascSn + houseNum - 1) % 12;
  }

  // Is a planet afflicted — conjunct with, or aspected (drishti) by, a
  // classical malefic (Saturn/Mars/Rahu/Ketu), a Maraka lord, or the
  // Badhaka lord?
  function checkAffliction(planetName, natalPlanets, marakaLords, badhakaLord) {
    var p = natalPlanets && natalPlanets[planetName];
    if (!p || typeof p.house !== 'number') return { afflicted: false, reasons: [] };
    var reasons = [];
    MALEFICS.forEach(function (m) {
      if (m === planetName) return;
      var mp = natalPlanets[m];
      if (!mp || typeof mp.house !== 'number') return;
      if (mp.house === p.house) reasons.push(m + ' conjunct in H' + p.house);
      else if (aspectedHouses(m, mp.house).indexOf(p.house) !== -1) reasons.push(m + ' aspects (drishti) from H' + mp.house);
    });
    (marakaLords || []).forEach(function (ml) {
      if (ml === planetName || MALEFICS.indexOf(ml) !== -1) return; // already covered above if also a malefic
      var mp = natalPlanets[ml];
      if (!mp || typeof mp.house !== 'number') return;
      if (mp.house === p.house) reasons.push(ml + ' (Maraka lord) conjunct in H' + p.house);
      else if (aspectedHouses(ml, mp.house).indexOf(p.house) !== -1) reasons.push(ml + ' (Maraka lord) aspects from H' + mp.house);
    });
    if (badhakaLord && badhakaLord !== planetName && MALEFICS.indexOf(badhakaLord) === -1 && (marakaLords || []).indexOf(badhakaLord) === -1) {
      var bp = natalPlanets[badhakaLord];
      if (bp && typeof bp.house === 'number') {
        if (bp.house === p.house) reasons.push(badhakaLord + ' (Badhaka lord) conjunct in H' + p.house);
        else if (aspectedHouses(badhakaLord, bp.house).indexOf(p.house) !== -1) reasons.push(badhakaLord + ' (Badhaka lord) aspects from H' + bp.house);
      }
    }
    return { afflicted: reasons.length > 0, reasons: reasons };
  }

  // Live Shadbala lookup, if window.SHADBALA (shadbala.js) is loaded.
  function planetStrength(planetName, natalPlanets, natalAsc) {
    if (!window.SHADBALA || typeof window.SHADBALA.calculate !== 'function') return null;
    try {
      return window.SHADBALA.calculate(planetName, natalPlanets, natalAsc);
    } catch (e) {
      console.warn('KP_PREDICTION_8: Shadbala lookup failed for ' + planetName, e);
      return null;
    }
  }

  // Builds the "Combination & strength check" block for an event's
  // explicitly-named planets (parsed from the source reference's
  // qualifier text) — whether each one is connected to the event's
  // houses by occupation or drishti, how strong it currently is,
  // whether it's afflicted or is itself a Maraka/Badhaka lord, and
  // (where the event specifies one) whether the primary house's sign
  // matches a required sign-type (mute/fruitful/barren/dual/etc).
  function buildCombinationCheck(event, natalPlanets, natalAsc) {
    if (!event.requiredPlanets || !event.requiredPlanets.length) return '';
    var maraka = marakaInfo(natalAsc);
    var badhaka = badhakaInfo(natalAsc);
    var connectedCount = 0;
    var rows = event.requiredPlanets.map(function (pl) {
      var inv = planetInvolvement(pl, event.houses, natalPlanets);
      var connected = inv.occupiesHouses.length > 0 || inv.aspectsHouses.length > 0;
      if (connected) connectedCount++;
      var connLabel = '';
      if (inv.occupiesHouses.length) connLabel += 'occupies H' + inv.occupiesHouses.join(',H');
      if (inv.aspectsHouses.length) connLabel += (connLabel ? ' &amp; ' : '') + 'aspects H' + inv.aspectsHouses.join(',H') + ' (drishti)';
      if (!connected) connLabel = 'not connected to this combination';
      var strength = planetStrength(pl, natalPlanets, natalAsc);
      var strengthLabel = strength ? (strength.level + ' \u2014 ' + Math.round(strength.total) + ' rupas') : 'strength unavailable';

      var isPrimaryMaraka = maraka.primary.indexOf(pl) !== -1;
      var isSecondaryMaraka = !isPrimaryMaraka && maraka.secondary.indexOf(pl) !== -1;
      var isBadhaka = badhaka.lord === pl;
      var marakaTag = isPrimaryMaraka ? '<span class="kpdx8-maraka-tag primary">Maraka (2nd/7th lord)</span>'
        : (isSecondaryMaraka ? '<span class="kpdx8-maraka-tag secondary">Maraka (H' + maraka.secondaryHouses.join('/H') + ' lord, ' + maraka.category + ' lagna)</span>' : '');
      if (isBadhaka) marakaTag += '<span class="kpdx8-maraka-tag secondary">Badhaka (H' + badhaka.house + ' lord, ' + badhaka.category + ' lagna)</span>';

      var aff = checkAffliction(pl, natalPlanets, maraka.all, badhaka.lord);
      var afflictionHtml = aff.afflicted
        ? '<div class="kpdx8-affliction-line afflicted">Afflicted: ' + aff.reasons.join('; ') + '</div>'
        : '<div class="kpdx8-affliction-line clean">No classical affliction found (no malefic, Maraka-lord, or Badhaka-lord conjunction/aspect)</div>';

      return '<div class="kpdx8-combo-row ' + (connected ? 'yes' : 'no') + '">' +
        '<span class="kpdx8-combo-planet">' + pl + '</span>' + marakaTag +
        '<span class="kpdx8-combo-conn">' + connLabel + '</span>' +
        '<span class="kpdx8-combo-strength">' + strengthLabel + '</span>' +
        '</div>' + afflictionHtml;
    }).join('');

    var total = event.requiredPlanets.length;
    var verdictLabel, verdictClass;
    if (connectedCount === total) { verdictLabel = 'Combination fulfilled \u2014 all named planet(s) connect via occupation or aspect'; verdictClass = 'kpdx8-verdict-promised'; }
    else if (connectedCount > 0) { verdictLabel = 'Partially fulfilled \u2014 ' + connectedCount + '/' + total + ' named planet(s) connect'; verdictClass = 'kpdx8-verdict-partial'; }
    else { verdictLabel = 'Combination not fulfilled \u2014 none of the named planet(s) occupy or aspect this combination'; verdictClass = 'kpdx8-verdict-notseen'; }

    var signHtml = '';
    if (event.signRequirement) {
      var sType = signTypeOf(cuspSign(event.primary_house, natalAsc));
      var matchField = (event.signRequirement === 'mute' || event.signRequirement === 'voice') ? sType.voice
        : (event.signRequirement === 'dual' || event.signRequirement === 'movable' || event.signRequirement === 'fixed') ? sType.modality
        : sType.fertility;
      var matches = matchField === event.signRequirement;
      signHtml = '<div class="kpdx8-affliction-line ' + (matches ? 'clean' : 'afflicted') + '" style="padding-left:4px;">' +
        'Sign check: H' + event.primary_house + ' cusp falls in <b>' + sType.sign + '</b> (' + matchField + ') \u2014 ' +
        (matches ? 'matches' : 'does not match') + ' the required \u201c' + event.signRequirement + '\u201d sign category' +
        '</div>';
    }

    return '<div class="kpdx8-combo-block">' +
      '<div class="kpdx8-verdict ' + verdictClass + '">Combination &amp; strength check: ' + verdictLabel + '</div>' +
      rows + signHtml +
      '<div class="kpdx8-lib-note">Checked against the planet(s) this combination names in the source reference \u2014 occupation/aspect and affliction from the natal chart, strength via Shadbala. Maraka lords are this chart\u2019s 2nd/7th-house lords (primary rule), plus the classical movable/fixed/dual-lagna alternate shown above when different; Badhaka lord follows the same modality-based rule (movable\u219211th, fixed\u21929th, dual\u21927th).</div>' +
      '</div>';
  }

  // Standalone Sun/Moon condition check — classical Jyotish gives
  // afflicted luminaries (especially by Rahu/Ketu/Saturn/Mars) special
  // weight for mind and vitality, independent of whether Sun or Moon
  // happen to be named in this particular event's combination.
  function buildSunMoonCondition(natalPlanets, natalAsc) {
    var maraka = marakaInfo(natalAsc);
    var badhaka = badhakaInfo(natalAsc);
    var lines = ['Sun', 'Moon'].map(function (lum) {
      var aff = checkAffliction(lum, natalPlanets, maraka.all, badhaka.lord);
      var isMaraka = maraka.all.indexOf(lum) !== -1;
      var isBadhaka = badhaka.lord === lum;
      return '<div class="kpdx8-affliction-line ' + (aff.afflicted ? 'afflicted' : 'clean') + '">' +
        '<b>' + lum + '</b>' + (isMaraka ? ' <span class="kpdx8-maraka-tag ' + (maraka.primary.indexOf(lum) !== -1 ? 'primary' : 'secondary') + '">Maraka lord</span>' : '') +
        (isBadhaka ? ' <span class="kpdx8-maraka-tag secondary">Badhaka lord</span>' : '') +
        (aff.afflicted ? ' \u2014 afflicted: ' + aff.reasons.join('; ') : ' \u2014 no classical affliction found') +
        '</div>';
    }).join('');
    return '<div class="kpdx8-combo-block">' +
      '<div class="kpdx8-verdict kpdx8-verdict-notseen" style="background:rgba(228,192,119,.08);color:#E4C077;border-color:rgba(228,192,119,.25);">Sun &amp; Moon condition (checked for every event)</div>' +
      lines +
      '<div class="kpdx8-lib-note">Classical Jyotish gives special weight to afflicted luminaries \u2014 Sun for vitality/authority, Moon for mind and emotional steadiness \u2014 regardless of whether either is named in this specific combination.</div>' +
      '</div>';
  }

  // ================================================================
  // GOOD / BAD TAG — whether the event itself is generally desirable
  // (e.g. marriage, promotion, recovery) or undesirable (e.g. divorce,
  // job loss, hospitalisation), independent of the Promise/Result
  // verdict above. Purely descriptive of the event's plain-language
  // nature, not a KP computation.
  // ================================================================
  var POLARITY_LABEL = { positive: 'Favourable event', negative: 'Unfavourable event', neutral: 'Neutral / situational event' };
  function polarityBadge(polarity) {
    var p = polarity || 'neutral';
    return '<span class="kpdx8-polarity-badge kpdx8-polarity-badge-' + p + '">' + (POLARITY_LABEL[p] || POLARITY_LABEL.neutral) + '</span>';
  }
  function polarityFramingNote(polarity) {
    if (polarity === 'negative') return 'This is an unfavourable event \u2014 here \u201cPromised\u201d means the affliction itself is indicated, so a native would usually want \u201cNot promised\u201d or a favourable Result (CSL) quality instead.';
    if (polarity === 'positive') return 'This is a favourable event \u2014 \u201cPromised\u201d with a Positive Result (CSL) quality is the outcome a native would usually want here.';
    return 'This event is situational rather than clearly favourable or unfavourable \u2014 read the Promise/Result verdict on its own merits.';
  }

  // ================================================================
  // VERDICT (Promise via NL / Result quality via CSL)
  // ================================================================
  function computeVerdict(event, houseData, nlPlanet, cslPlanet) {
    var nlHouses = nlPlanet ? (houseData[nlPlanet] || []) : [];
    var cslHouses = cslPlanet ? (houseData[cslPlanet] || []) : [];
    var total = event.houses.length;

    var promiseMatched = event.houses.filter(function (h) { return nlHouses.indexOf(h) !== -1; });
    var promiseClass, promiseLabel;
    if (!nlPlanet) { promiseClass = 'kpdx8-verdict-notseen'; promiseLabel = 'NL data unavailable for this house'; }
    else if (promiseMatched.length === total && total > 0) { promiseClass = 'kpdx8-verdict-promised'; promiseLabel = 'Promised \u2014 NL fully signifies this combination'; }
    else if (promiseMatched.length > 0) { promiseClass = 'kpdx8-verdict-partial'; promiseLabel = 'Partly promised \u2014 NL covers ' + promiseMatched.length + '/' + total + ' houses'; }
    else { promiseClass = 'kpdx8-verdict-notseen'; promiseLabel = 'Not promised \u2014 NL does not touch this combination'; }

    var resultMatched = event.houses.filter(function (h) { return cslHouses.indexOf(h) !== -1; });
    var cslQualityInfo = cslPlanet ? planetQualityPct(cslPlanet, houseData) : { label: 'Mixed', pct: 50, growth: 0, trik: 0, total: 0 };

    var checksHtml = event.houses.map(function (h) {
      var onNL = nlHouses.indexOf(h) !== -1, onCSL = cslHouses.indexOf(h) !== -1;
      var mark = '\u2717', cls = 'no';
      if (onNL && onCSL) { mark = '\u2713\u2713'; cls = 'yes'; }
      else if (onNL || onCSL) { mark = '\u2713'; cls = 'yes'; }
      return '<span class="kpdx8-hcheck ' + cls + '">H' + h + ' ' + mark + (onNL ? ' NL' : '') + (onCSL ? ' CSL' : '') + '</span>';
    }).join('');

    return { promiseClass: promiseClass, promiseLabel: promiseLabel, cslQualityInfo: cslQualityInfo, resultMatched: resultMatched, checksHtml: checksHtml, total: total };
  }

  // ================================================================
  // STYLES
  // ================================================================
  var STYLE_ID = 'kpdx8-style';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.kpdx8-lib-search{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:7px 10px;color:inherit;font-size:11px;font-family:inherit;margin-bottom:6px;box-sizing:border-box;}' +
      '.kpdx8-lib-search:focus{outline:none;border-color:rgba(212,175,90,.4);}' +
      '.kpdx8-lib-count{font-size:9px;color:var(--muted,#9c9484);margin-bottom:6px;}' +
      '.kpdx8-lib-list{max-height:170px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;margin-bottom:4px;}' +
      '.kpdx8-lib-row{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:5px 8px;border-radius:5px;cursor:pointer;border:1px solid transparent;font-size:10px;}' +
      '.kpdx8-lib-row:hover{background:rgba(255,255,255,.04);}' +
      '.kpdx8-lib-row.picked{background:rgba(212,175,90,.09);border-color:rgba(212,175,90,.25);}' +
      '.kpdx8-lib-combo{color:var(--muted,#9c9484);font-size:9px;white-space:nowrap;}' +
      '.kpdx8-lib-badge{font-size:8.5px;padding:1px 7px;border-radius:8px;background:rgba(212,175,90,.08);color:#E4C077;border:1px solid rgba(212,175,90,.22);white-space:nowrap;}' +
      '.kpdx8-lib-planets{color:var(--muted,#9c9484);font-size:8.5px;font-style:italic;}' +
      '.kpdx8-polarity-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;vertical-align:middle;}' +
      '.kpdx8-polarity-positive{background:#4ee89a;}' +
      '.kpdx8-polarity-negative{background:#ff8080;}' +
      '.kpdx8-polarity-neutral{background:#9FC3D9;}' +
      '.kpdx8-polarity-badge{display:inline-block;font-size:8px;padding:2px 8px;border-radius:9px;margin-left:8px;vertical-align:middle;text-transform:uppercase;letter-spacing:.03em;font-weight:600;}' +
      '.kpdx8-polarity-badge-positive{background:rgba(78,232,154,.15);color:#4ee89a;border:1px solid rgba(78,232,154,.35);}' +
      '.kpdx8-polarity-badge-negative{background:rgba(255,128,128,.15);color:#ff8080;border:1px solid rgba(255,128,128,.35);}' +
      '.kpdx8-polarity-badge-neutral{background:rgba(159,195,217,.15);color:#9FC3D9;border:1px solid rgba(159,195,217,.35);}' +
      '.kpdx8-lib-detail{margin-top:8px;padding:10px 12px;background:rgba(212,175,90,.05);border:1px solid rgba(212,175,90,.22);border-radius:8px;}' +
      '.kpdx8-lib-detail-title{font-size:12px;color:#E4C077;font-weight:600;margin-bottom:2px;}' +
      '.kpdx8-lib-detail-rule{font-size:9px;color:var(--muted,#9c9484);margin-bottom:8px;}' +
      '.kpdx8-verdict{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;padding:3px 9px;border-radius:12px;margin-bottom:6px;margin-right:6px;font-weight:500;}' +
      '.kpdx8-verdict-promised{background:rgba(212,175,90,.18);color:#E4C077;border:1px solid rgba(212,175,90,.35);}' +
      '.kpdx8-verdict-partial{background:rgba(159,195,217,.13);color:#9FC3D9;border:1px solid rgba(159,195,217,.3);}' +
      '.kpdx8-verdict-notseen{background:rgba(156,148,132,.12);color:var(--muted,#9c9484);border:1px solid rgba(255,255,255,.08);}' +
      '.kpdx8-pct-bar-track{height:5px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;margin:4px 0 6px;}' +
      '.kpdx8-pct-bar-fill{height:100%;border-radius:3px;transition:width .2s;}' +
      '.kpdx8-house-checks{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0;}' +
      '.kpdx8-hcheck{font-size:9px;padding:2px 7px;border-radius:6px;border:1px solid rgba(255,255,255,.08);}' +
      '.kpdx8-hcheck.yes{color:#E4C077;border-color:rgba(212,175,90,.3);background:rgba(212,175,90,.07);}' +
      '.kpdx8-hcheck.no{color:var(--muted,#9c9484);}' +
      '.kpdx8-lib-note{font-size:9px;color:var(--muted,#9c9484);font-style:italic;margin-top:6px;line-height:1.5;}' +
      '.kpdx8-combo-block{margin-top:10px;border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:8px 10px;}' +
      '.kpdx8-combo-row{display:grid;grid-template-columns:56px 1fr auto;gap:8px;align-items:center;padding:4px 2px;font-size:9.5px;border-top:1px solid rgba(255,255,255,.05);}' +
      '.kpdx8-combo-row:first-of-type{border-top:none;}' +
      '.kpdx8-combo-planet{font-weight:600;color:#EDE9E0;}' +
      '.kpdx8-combo-row.yes .kpdx8-combo-planet{color:#E4C077;}' +
      '.kpdx8-combo-conn{color:var(--muted,#9c9484);}' +
      '.kpdx8-combo-row.yes .kpdx8-combo-conn{color:#d8d0bd;}' +
      '.kpdx8-combo-strength{font-size:8.5px;color:var(--muted,#9c9484);white-space:nowrap;}' +
      '.kpdx8-maraka-tag{font-size:7px;padding:1px 6px;border-radius:8px;margin-left:6px;text-transform:uppercase;letter-spacing:.02em;}' +
      '.kpdx8-maraka-tag.primary{background:rgba(255,128,128,.15);color:#ff8080;border:1px solid rgba(255,128,128,.35);}' +
      '.kpdx8-maraka-tag.secondary{background:rgba(255,180,120,.15);color:#ffb478;border:1px solid rgba(255,180,120,.3);}' +
      '.kpdx8-affliction-line{font-size:9px;padding:3px 4px 3px 62px;line-height:1.5;}' +
      '.kpdx8-affliction-line.afflicted{color:#ff9d9d;}' +
      '.kpdx8-affliction-line.clean{color:var(--muted,#9c9484);}' +
      '.kpdx8-find-timing-btn{background:#C6A15B;color:#0A0A0C;border:none;border-radius:6px;padding:6px 14px;font-weight:600;font-size:10px;cursor:pointer;font-family:inherit;margin-top:8px;}' +
      '.kpdx8-find-timing-btn:hover{background:#E4C077;}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ================================================================
  // STATE + GLOBAL WIRING (inline onclick/oninput, matching this app's
  // existing convention of window.someHandler(...) calls in generated HTML)
  // ================================================================
  var INSTANCES = {};

  function renderLibRows(instanceId, filterText) {
    var st = INSTANCES[instanceId];
    if (!st) return '';
    var q = (filterText || '').trim().toLowerCase();
    var filtered = q.length ? EVENT_LIBRARY.filter(function (e) {
      return e.name.toLowerCase().indexOf(q) !== -1 ||
        (e.requiredPlanets || []).some(function (p) { return p.toLowerCase().indexOf(q) !== -1; });
    }) : EVENT_LIBRARY;
    var shown = filtered.slice(0, 60);
    var countEl = document.getElementById('kpdx8-count-' + instanceId);
    if (countEl) {
      countEl.textContent = q.length === 0
        ? (EVENT_LIBRARY.length + ' events \u2014 type to filter.')
        : (filtered.length + ' match' + (filtered.length !== 1 ? 'es' : ''));
    }
    return shown.map(function (e, idx) {
      var realIdx = EVENT_LIBRARY.indexOf(e);
      return '<div class="kpdx8-lib-row' + (st.pickedIdx === realIdx ? ' picked' : '') + '" onclick="window.KP8_showDetail(\'' + instanceId + '\',' + realIdx + ')">' +
        '<div><span class="kpdx8-polarity-dot kpdx8-polarity-' + (e.polarity || 'neutral') + '" title="' + (e.polarity || 'neutral') + '"></span>' + e.name + (e.requiredPlanets && e.requiredPlanets.length ? ' <span class="kpdx8-lib-planets">(' + e.requiredPlanets.join(', ') + ')</span>' : '') + '</div>' +
        '<div class="kpdx8-lib-combo">' + e.houses.join('-') + '</div>' +
        '<div class="kpdx8-lib-badge">H' + e.primary_house + ' CSL</div>' +
        '</div>';
    }).join('');
  }

  window.KP8_filterLib = function (instanceId, value) {
    var st = INSTANCES[instanceId];
    if (!st) return;
    var listEl = document.getElementById('kpdx8-list-' + instanceId);
    if (listEl) listEl.innerHTML = renderLibRows(instanceId, value);
  };

  window.KP8_showDetail = function (instanceId, eventIdx) {
    var st = INSTANCES[instanceId];
    if (!st) return;
    st.pickedIdx = eventIdx;
    var event = EVENT_LIBRARY[eventIdx];
    var detailEl = document.getElementById('kpdx8-detail-' + instanceId);
    var listEl = document.getElementById('kpdx8-list-' + instanceId);
    if (listEl) {
      var searchEl = document.getElementById('kpdx8-search-' + instanceId);
      listEl.innerHTML = renderLibRows(instanceId, searchEl ? searchEl.value : '');
    }
    if (!detailEl) return;

    var info = cuspInfo(event.primary_house, st.natalPlanets, st.natalAsc);
    var v = computeVerdict(event, st.houseData, info.starLord, info.subLord);
    var qColor = v.cslQualityInfo.label === 'Positive' ? '#E4C077' : (v.cslQualityInfo.label === 'Negative' ? '#ff8f8f' : '#9FC3D9');

    detailEl.innerHTML =
      '<div class="kpdx8-lib-detail-title">' + event.name + polarityBadge(event.polarity) + '</div>' +
      '<div class="kpdx8-lib-detail-rule">Primary house ' + event.primary_house + ' \u00b7 required combination ' + event.houses.join('-') +
      ' \u00b7 NL (star lord) = <b style="color:#E4C077;">' + (info.starLord || '\u2014') + '</b> \u00b7 CSL (sub lord) = <b style="color:#E4C077;">' + (info.subLord || '\u2014') + '</b></div>' +
      '<div><span class="kpdx8-verdict ' + v.promiseClass + '">Promise (NL): ' + v.promiseLabel + '</span></div>' +
      '<div><span class="kpdx8-verdict" style="border:1px solid ' + qColor + ';color:' + qColor + ';background:rgba(255,255,255,.02);">Result quality (CSL): ' + v.cslQualityInfo.label + ' \u2014 ' + v.cslQualityInfo.pct + '% favourable' +
      (info.subLord ? (' \u00b7 ' + info.subLord + ' touches ' + v.resultMatched.length + '/' + v.total + ' of these houses') : '') + '</span></div>' +
      '<div class="kpdx8-pct-bar-track"><div class="kpdx8-pct-bar-fill" style="width:' + v.cslQualityInfo.pct + '%;background:' + qColor + ';"></div></div>' +
      '<div class="kpdx8-house-checks">' + v.checksHtml + '</div>' +
      '<div class="kpdx8-lib-note">\u2713\u2713 = confirmed by both NL and CSL (strongest) \u00b7 single \u2713 = only one level touches it \u00b7 Rule: NL shows whether the event\u2019s domain is promised; CSL decides whether that promise leans positive or negative.</div>' +
      '<div class="kpdx8-lib-note">The percentage weighs the CSL\u2019s own ' + v.cslQualityInfo.growth + ' growth-house link(s) (1,2,5,9,10,11) against its ' + v.cslQualityInfo.trik + ' trik-house link(s) (6,8,12) \u2014 higher is more favourable, 50% means no lean either way.</div>' +
      '<div class="kpdx8-lib-note">' + polarityFramingNote(event.polarity) + '</div>' +
      buildCombinationCheck(event, st.natalPlanets, st.natalAsc) +
      buildSunMoonCondition(st.natalPlanets, st.natalAsc) +
      (event.note ? '<div class="kpdx8-lib-note">' + event.note + '</div>' : '') +
      (window.KP_PREDICTION_9 ? ('<button class="kpdx8-find-timing-btn" onclick="window.KP9_applyHouses(\'' + instanceId + '\',\'' + event.houses.join(',') + '\',\'' + (event.requiredPlanets || []).join(',') + '\')">Find timing for houses ' + event.houses.join('-') + ' \u2193</button>') : '');
  };

  // ================================================================
  // PUBLIC API — called from renderDashaPanel() / updatePredictionsDisplay()
  // ================================================================
  // ctx: { natalPlanets, natalAsc, sectionClass, instanceId }
  function renderForPanel(ctx) {
    ctx = ctx || {};
    if (!ctx.natalPlanets || !ctx.natalAsc) return '';
    var houseData = buildHouseData(ctx.natalPlanets, ctx.natalAsc);
    if (!Object.keys(houseData).length) return '';

    injectStyles();
    var instanceId = ctx.instanceId || 'default';
    INSTANCES[instanceId] = { natalPlanets: ctx.natalPlanets, natalAsc: ctx.natalAsc, houseData: houseData, pickedIdx: -1 };

    var sectionClass = ctx.sectionClass || 'dt-section';
    var html = '<div class="' + sectionClass + '" style="margin-top:14px;">KP EVENT LIBRARY \u2014 PROMISE (NL) VS RESULT (CSL)</div>';
    html += '<input type="text" class="kpdx8-lib-search" id="kpdx8-search-' + instanceId + '" placeholder="Search an event \u2014 e.g. marriage, promotion, property, litigation\u2026" oninput="window.KP8_filterLib(\'' + instanceId + '\', this.value)">';
    html += '<div class="kpdx8-lib-count" id="kpdx8-count-' + instanceId + '">' + EVENT_LIBRARY.length + ' events \u2014 type to filter.</div>';
    html += '<div class="kpdx8-lib-list" id="kpdx8-list-' + instanceId + '">' + renderLibRows(instanceId, '') + '</div>';
    html += '<div class="kpdx8-lib-detail" id="kpdx8-detail-' + instanceId + '"></div>';

    return html;
  }

  window.KP_PREDICTION_8 = {
    renderForPanel: renderForPanel,
    _events: EVENT_LIBRARY,
    _cuspInfo: cuspInfo,
    _computeVerdict: computeVerdict,
    _buildCombinationCheck: buildCombinationCheck,
    _buildSunMoonCondition: buildSunMoonCondition,
    _planetInvolvement: planetInvolvement,
    _planetStrength: planetStrength,
    _aspectedHouses: aspectedHouses,
    _marakaInfo: marakaInfo,
    _badhakaInfo: badhakaInfo,
    _checkAffliction: checkAffliction,
    _signTypeOf: signTypeOf,
    _cuspSign: cuspSign
  };
})();