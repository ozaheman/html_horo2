/**
 * KP_prediction_5.js
 *
 * PART 5 of the Krishnamurti Paddhati (KP) Prediction Engine.
 *
 * Purely additive, like Parts 2-4 — reuses window.KP_PREDICTION (Part 1)
 * for CSL resolution rather than re-deriving any chart math.
 *
 * ============================ SOURCE & PURPOSE ===========================
 *
 * This module encodes the full "House Signification" master reference table
 * (Rahul Kaushik, house-by-house Event-of-Life -> Primary House -> Supporting
 * Houses listing, houses 1 through 12; ~406 distinct entries after removing
 * the table's own section-break rows). This is a DIFFERENT source document
 * from anything already in Parts 1-4:
 *
 *   - It is NOT the same list as EVENT_PRIME_HOUSES in KP_prediction.js
 *     (that table is a smaller, hand-curated set of ~45 events with full
 *     prime/supporting/negative splits plus narrative note/effect/remedy
 *     text). Checked by exact-name keyword search across KP_prediction.js
 *     before writing this module — none of the ~406 event names below
 *     appear there.
 *   - It is NOT the same list as HORARY_LIBRARY / HORARY_QA_LIBRARY in
 *     KP_prediction_3.js (those are 200 phrased-as-a-question horary
 *     entries with a single house-combination each, sourced from a
 *     different lecture set). Checked the same way — no overlap found.
 *
 * Because the source table gives only "Event of Life | Primary House |
 * Supporting Houses" (no separate note/reference/effect/remedy prose per
 * row the way EVENT_PRIME_HOUSES does), this module does not fabricate
 * that narrative detail for all 406 rows — inventing effect/remedy text
 * that was never in the source would misrepresent it as sourced content.
 * Instead each entry keeps exactly what the source table states:
 *   - event        : the event name, verbatim from the source table
 *   - house        : the "Primary House" column (1-12) — which house's
 *                    chapter/significations this event is classified under
 *   - houses       : the full "Supporting Houses" combination, parsed into
 *                    a plain house-number array (e.g. [2, 6, 11])
 *   - condition    : any non-numeric qualifier from the source ("with
 *                    Jupiter", "afflicted Moon", "strong Mars", etc.) —
 *                    empty string if the source gave a pure house list
 *   - srcNum       : the original 1-412 row number in the source table,
 *                    kept for traceability back to the source PDF
 *
 * PARSING NOTES (documented gaps, per this module's own convention):
 *   - Two rows (srcNum 363 "Returning of missing person" and srcNum 386
 *     "Absconding") describe a house combination read from a DIFFERENT
 *     person's chart (the missing/absconding person's own horoscope, not
 *     the querent's) rather than a simple own-chart house list. These are
 *     preserved with their special cross-chart house numbers in `houses`
 *     and the cross-chart instruction spelled out in `condition`.
 *   - Two OCR-style digit-run typos in the source ("6,910,11" for event
 *     'Success in Political career', and "3,912" for 'Foreign settlement')
 *     were corrected to "6,9,10,11" and "3,9,12" respectively — both are
 *     unambiguous given the surrounding house-range context (no chart ever
 *     has a "house 910" or "house 912").
 *   - A handful of rows had trailing connector words ("and", "or", "with")
 *     left over after the numeric houses were extracted into `houses` —
 *     these were cleaned to an empty `condition` string rather than left
 *     as a dangling fragment.
 *
 * ============================ TOPICS COVERED ===========================
 *
 * 1. RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE — the full 406-entry table.
 * 2. searchRKEvents() / getRKEventById() / getRKEventsByHouse() /
 *    getRKEventsByPrimaryHouse() — lookup helpers, same pattern as
 *    KP_prediction_3.js's searchHorary()/HORARY_LIBRARY helpers.
 * 3. crossCheckRKEvent() — resolves any table entry's Primary House CSL via
 *    window.KP_PREDICTION's own resolveDeterminingPlanetPrecise() +
 *    getPlanetNumbers() (the exact same "2 levels deep" CSL rule used by
 *    checkEventPromise() in Part 1) and reports whether the determining
 *    planet's numbers intersect this entry's full `houses` combination.
 */

window.KP_PREDICTION_5 = {

    _p1: function () { return window.KP_PREDICTION || null; },

    // ================================================================
    // 1. RAHUL KAUSHIK HOUSE SIGNIFICATION MASTER TABLE (406 entries)
    // ================================================================

    RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE: [
        { id: 1, event: 'Always Sick', house: 1, houses: [1, 4, 6, 12], condition: '', srcNum: 2 },
        { id: 2, event: 'Charming Face', house: 1, houses: [5], condition: 'Venus and Moon/Mercury', srcNum: 3 },
        { id: 3, event: 'Go out of Present Environment', house: 1, houses: [3, 7, 12], condition: '', srcNum: 4 },
        { id: 4, event: 'Good Health', house: 1, houses: [1, 5, 11], condition: '', srcNum: 5 },
        { id: 5, event: 'Lagan Lord Very Weak', house: 1, houses: [5, 8, 12], condition: '', srcNum: 6 },
        { id: 6, event: 'Long Life (Over 66 years)', house: 1, houses: [1, 5, 9, 10, 3, 8], condition: '', srcNum: 7 },
        { id: 7, event: 'Long Life Span', house: 1, houses: [1, 5, 9, 10, 3, 8], condition: '', srcNum: 8 },
        { id: 8, event: 'Politics Failure', house: 1, houses: [5, 8, 12], condition: '', srcNum: 9 },
        { id: 9, event: 'Proneness to Diseases', house: 1, houses: [6, 8, 12], condition: '', srcNum: 10 },
        { id: 10, event: 'Sickness of the mind', house: 1, houses: [1, 6, 12], condition: 'afflicted Moon', srcNum: 11 },
        { id: 11, event: 'Success in Political career', house: 1, houses: [1, 6, 9, 10, 11], condition: '', srcNum: 12 },
        { id: 12, event: 'Success in Self Efforts', house: 1, houses: [3, 6, 11], condition: '', srcNum: 13 },
        { id: 13, event: 'Surgery', house: 1, houses: [6, 8, 12], condition: 'influence of Mars', srcNum: 14 },
        { id: 14, event: 'Weak Lagan', house: 1, houses: [6, 8, 12, 5], condition: 'Badhaka', srcNum: 15 },
        { id: 15, event: 'Discharge From Hospital', house: 1, houses: [2, 4, 11], condition: '', srcNum: 16 },
        { id: 16, event: 'Disease-Long Life', house: 1, houses: [1, 6, 8, 12], condition: '', srcNum: 17 },
        { id: 17, event: 'Disease-Recovery', house: 1, houses: [1, 5, 11], condition: '', srcNum: 18 },
        { id: 18, event: 'Criminal mind', house: 1, houses: [6, 8, 12], condition: '', srcNum: 19 },
        { id: 19, event: 'Danger to Life or Unnatural or Accidental Death', house: 1, houses: [4, 8, 12], condition: 'Badhaka Maraka Lords', srcNum: 20 },
        { id: 20, event: 'Accumulating Huge Wealth', house: 2, houses: [2, 6, 11], condition: '', srcNum: 22 },
        { id: 21, event: 'Ancestral property', house: 2, houses: [10, 2, 11], condition: '', srcNum: 23 },
        { id: 22, event: 'Bank Deposit', house: 2, houses: [2, 6, 10, 11], condition: '', srcNum: 24 },
        { id: 23, event: 'Gain/Success in Independent Business', house: 2, houses: [3, 7, 10, 11], condition: '', srcNum: 25 },
        { id: 24, event: 'Gaining Wealth, Increase Bank Deposit', house: 2, houses: [2, 6, 10, 11], condition: 'Jupiter', srcNum: 26 },
        { id: 25, event: 'Illict connections with women', house: 2, houses: [2, 5, 8, 11], condition: 'Rahu and Venus', srcNum: 27 },
        { id: 26, event: 'Increase in Ornaments, Jewels', house: 2, houses: [2, 10, 11, 8], condition: '', srcNum: 28 },
        { id: 27, event: 'Independent earnings', house: 2, houses: [4, 6, 10, 11], condition: '', srcNum: 29 },
        { id: 28, event: 'Insurance Claim', house: 2, houses: [8, 11], condition: 'Mercury', srcNum: 30 },
        { id: 29, event: 'Insurance legacy gratuity', house: 2, houses: [8, 2, 11], condition: 'Jupiter', srcNum: 31 },
        { id: 30, event: 'Long Journey and Interaction with Foreigners', house: 2, houses: [9, 2, 11], condition: '', srcNum: 32 },
        { id: 31, event: 'Loosing Wealth, Money', house: 2, houses: [5, 8, 12], condition: 'Combinations', srcNum: 33 },
        { id: 32, event: 'Loss of Money', house: 2, houses: [1, 7, 8, 12], condition: '', srcNum: 34 },
        { id: 33, event: 'Medical Claims', house: 2, houses: [6, 8, 11], condition: '', srcNum: 35 },
        { id: 34, event: 'Obtaining Jewellery', house: 2, houses: [11], condition: '', srcNum: 36 },
        { id: 35, event: 'Once for all Lost of property', house: 2, houses: [5, 8, 12], condition: '', srcNum: 37 },
        { id: 36, event: 'One’s Exertion', house: 2, houses: [1, 2, 11], condition: '', srcNum: 38 },
        { id: 37, event: 'Opening Bank account', house: 2, houses: [6, 11], condition: '', srcNum: 39 },
        { id: 38, event: 'Poverty', house: 2, houses: [8, 12, 5], condition: 'Strong and Afflicted Saturn and Rahu with weak sun and moon', srcNum: 40 },
        { id: 39, event: 'Proficient in occult science', house: 2, houses: [9, 12], condition: 'ketu venus Mercury and Saturn', srcNum: 41 },
        { id: 40, event: 'Self-acquisition', house: 2, houses: [2, 11], condition: '', srcNum: 42 },
        { id: 41, event: 'Separation from family', house: 2, houses: [1, 12, 3], condition: '', srcNum: 43 },
        { id: 42, event: 'Serving others', house: 2, houses: [6, 2, 11], condition: '', srcNum: 44 },
        { id: 43, event: 'Purchase of movable property', house: 2, houses: [6, 9, 2, 11], condition: 'Venus', srcNum: 45 },
        { id: 44, event: 'Recovery of lost property', house: 2, houses: [2, 6, 11], condition: '', srcNum: 46 },
        { id: 45, event: 'Wealth Enormous', house: 2, houses: [2, 6, 10, 11], condition: '', srcNum: 47 },
        { id: 46, event: 'Wealth-Medium', house: 2, houses: [5, 8, 12], condition: '', srcNum: 48 },
        { id: 47, event: 'Wealthlessness', house: 2, houses: [5, 8, 12], condition: '', srcNum: 49 },
        { id: 48, event: 'Defect in speech or defect in right vision of gents', house: 2, houses: [12, 8], condition: 'ketu and involvement of mute signs', srcNum: 50 },
        { id: 49, event: 'Eyes to Be healthy', house: 2, houses: [11, 3], condition: 'sun and moon', srcNum: 51 },
        { id: 50, event: 'Financial status', house: 2, houses: [2, 6, 11], condition: '', srcNum: 52 },
        { id: 51, event: 'Gains from independent business', house: 2, houses: [2, 7, 10, 11], condition: 'benefice mercury', srcNum: 53 },
        { id: 52, event: 'Deaf and Dumb', house: 2, houses: [6, 8, 12], condition: 'influence of mute signs', srcNum: 54 },
        { id: 53, event: 'Boldness/Rashness', house: 3, houses: [6, 10, 11], condition: 'Mars', srcNum: 56 },
        { id: 54, event: 'Boldness to Take a Job', house: 3, houses: [2, 10, 11], condition: '', srcNum: 57 },
        { id: 55, event: 'Getting a telephone call', house: 3, houses: [3, 9, 11], condition: 'Mercury', srcNum: 58 },
        { id: 56, event: 'Hearing news about a missing person', house: 3, houses: [3, 11], condition: 'the missing person’s asc. House', srcNum: 59 },
        { id: 57, event: 'Instant Predictions', house: 3, houses: [3, 9, 11], condition: '', srcNum: 60 },
        { id: 58, event: 'Long Distance call', house: 3, houses: [3, 9, 11], condition: '', srcNum: 61 },
        { id: 59, event: 'Loss in appeal', house: 3, houses: [5, 12], condition: 'afflicted Jupiter', srcNum: 62 },
        { id: 60, event: 'Loss in reputation', house: 3, houses: [8, 12, 9], condition: 'afflicted sun or moon', srcNum: 63 },
        { id: 61, event: 'Making contract or agreement', house: 3, houses: [3, 9, 11, 1], condition: '', srcNum: 64 },
        { id: 62, event: 'Marriage negotiation', house: 3, houses: [7, 3, 9], condition: '', srcNum: 65 },
        { id: 63, event: 'Marriage-engagement', house: 3, houses: [7, 9, 11], condition: '', srcNum: 66 },
        { id: 64, event: 'Meeting a Person or appointment', house: 3, houses: [9, 11], condition: 'influence of the 11th-house significators', srcNum: 67 },
        { id: 65, event: 'Money obtained by selling possession', house: 3, houses: [3, 11, 12], condition: '', srcNum: 68 },
        { id: 66, event: 'Negotiation to take over a business', house: 3, houses: [10, 6, 3, 9], condition: '', srcNum: 69 },
        { id: 67, event: 'Negotiation to adopt a child', house: 3, houses: [5, 3, 9], condition: '', srcNum: 70 },
        { id: 68, event: 'Negotiations', house: 3, houses: [9, 11], condition: 'the cuspal position that represents the purpose', srcNum: 71 },
        { id: 69, event: 'News of Promotion in service with transfer order', house: 3, houses: [3, 6, 10, 11], condition: '', srcNum: 72 },
        { id: 70, event: 'One speak Truth', house: 3, houses: [3, 9, 11], condition: 'influence of sun and Jupiter', srcNum: 73 },
        { id: 71, event: 'Passport, Green Card, Visa', house: 3, houses: [9, 11, 12], condition: 'Mercury Venus and Jupiter', srcNum: 74 },
        { id: 72, event: 'Rumour or any information is false', house: 3, houses: [3, 9, 11], condition: 'saturn rahu and mars', srcNum: 75 },
        { id: 73, event: 'Selling at loss', house: 3, houses: [3, 12, 8], condition: '', srcNum: 76 },
        { id: 74, event: 'Selling with profit', house: 3, houses: [3, 11], condition: '', srcNum: 77 },
        { id: 75, event: 'Short Journey, Touring', house: 3, houses: [3, 7, 11], condition: 'influence of Mercury', srcNum: 78 },
        { id: 76, event: 'Signing a contract', house: 3, houses: [6, 9, 11], condition: '', srcNum: 79 },
        { id: 77, event: 'Starting Journey', house: 3, houses: [5, 9, 11], condition: '', srcNum: 80 },
        { id: 78, event: 'Success in appeal', house: 3, houses: [6, 11], condition: '', srcNum: 81 },
        { id: 79, event: 'Success in personal interview', house: 3, houses: [3, 6, 10, 11], condition: '', srcNum: 82 },
        { id: 80, event: 'Successful broker', house: 3, houses: [3, 10, 6, 11], condition: '', srcNum: 83 },
        { id: 81, event: 'Publishing a Book', house: 3, houses: [3, 11, 10], condition: 'Mars Mercury and Jupiter', srcNum: 84 },
        { id: 82, event: 'Purchase of TV, Electrical goods', house: 3, houses: [3, 12, 5, 1], condition: '', srcNum: 85 },
        { id: 83, event: 'Receipt of a letter', house: 3, houses: [3, 11], condition: 'mercury and strong lord', srcNum: 86 },
        { id: 84, event: 'Receipt of Document', house: 3, houses: [3, 11], condition: 'as Above', srcNum: 87 },
        { id: 85, event: 'Receipt of news causing worries', house: 3, houses: [3, 11, 8], condition: '', srcNum: 88 },
        { id: 86, event: 'Successful negotiation', house: 3, houses: [3, 11], condition: 'Mercury or Jupiter', srcNum: 89 },
        { id: 87, event: 'Timid and Coward person', house: 3, houses: [8, 12], condition: 'influenced by Saturn', srcNum: 90 },
        { id: 88, event: 'Younger siblings – Death', house: 3, houses: [2, 4], condition: 'Maraka and Badhaka of the particular sibling', srcNum: 91 },
        { id: 89, event: 'Younger siblings – living in Harmony', house: 3, houses: [1, 11], condition: '', srcNum: 92 },
        { id: 90, event: 'Younger siblings - Enmity', house: 3, houses: [6, 8], condition: '', srcNum: 93 },
        { id: 91, event: 'Younger siblings – separation', house: 3, houses: [2, 10], condition: '', srcNum: 94 },
        { id: 92, event: 'Filing a court case', house: 3, houses: [6, 11], condition: '', srcNum: 95 },
        { id: 93, event: 'Gain from lottery', house: 3, houses: [5, 6, 11, 8], condition: 'rahu', srcNum: 96 },
        { id: 94, event: 'Danger to life', house: 3, houses: [8, 12], condition: 'badhaka lord', srcNum: 97 },
        { id: 95, event: 'Adopt a child', house: 4, houses: [2, 8], condition: 'house with mercury and Dual signs', srcNum: 99 },
        { id: 96, event: 'Ancestral property (getting)', house: 4, houses: [4, 9, 11, 6], condition: '', srcNum: 100 },
        { id: 97, event: 'Basic education up to Graduation', house: 4, houses: [11, 9], condition: '', srcNum: 101 },
        { id: 98, event: 'Break Education', house: 4, houses: [8, 12], condition: '', srcNum: 102 },
        { id: 99, event: 'Change of residence', house: 4, houses: [3, 12, 11], condition: '', srcNum: 103 },
        { id: 100, event: 'Get a degree with difficulties', house: 4, houses: [8, 2, 10, 11], condition: '', srcNum: 104 },
        { id: 101, event: 'Job in a permanent place', house: 4, houses: [4, 10], condition: '', srcNum: 105 },
        { id: 102, event: 'Landed property ownership', house: 4, houses: [4, 11, 12], condition: 'Saturn and Mars', srcNum: 106 },
        { id: 103, event: 'Lower level education', house: 4, houses: [2, 11], condition: 'weak Mercury Moon and Jupiter', srcNum: 107 },
        { id: 104, event: 'Marrying a career girl', house: 4, houses: [8, 12, 4], condition: '', srcNum: 108 },
        { id: 105, event: 'Occupying a new house', house: 4, houses: [11, 1], condition: '', srcNum: 109 },
        { id: 106, event: 'Own Vehicle', house: 4, houses: [4, 11], condition: 'Venus', srcNum: 110 },
        { id: 107, event: 'Pleasant function at home', house: 4, houses: [10, 11, 5], condition: '', srcNum: 111 },
        { id: 108, event: 'Sale of any vehicle', house: 4, houses: [3, 4, 5, 10], condition: '', srcNum: 112 },
        { id: 109, event: 'Selling at car', house: 4, houses: [3, 5, 10, 4], condition: '', srcNum: 113 },
        { id: 110, event: 'Separation from mother', house: 4, houses: [3, 12], condition: '', srcNum: 114 },
        { id: 111, event: 'Study of law', house: 4, houses: [6, 9], condition: 'Jupiter and mercury in these cuspal positions', srcNum: 115 },
        { id: 112, event: 'Success in competitive exam', house: 4, houses: [4, 9, 11, 6], condition: '', srcNum: 116 },
        { id: 113, event: 'Purchase of car', house: 4, houses: [4, 9, 10, 11], condition: 'venus and mars in movable sign', srcNum: 117 },
        { id: 114, event: 'Purchase of property by instalments/loan', house: 4, houses: [4, 6, 11, 12], condition: 'saturn', srcNum: 118 },
        { id: 115, event: 'Purchase of vehicles', house: 4, houses: [4, 11, 12], condition: '', srcNum: 119 },
        { id: 116, event: 'Reach home in time', house: 4, houses: [4, 11], condition: '', srcNum: 120 },
        { id: 117, event: 'Rent a property', house: 4, houses: [4, 11, 12, 6, 10], condition: '', srcNum: 121 },
        { id: 118, event: 'Taking possession of flat, residence', house: 4, houses: [9, 11], condition: '', srcNum: 122 },
        { id: 119, event: 'Theft of vehicle', house: 4, houses: [4, 6, 8, 12], condition: 'saturn and rahu influencing the cuspal position', srcNum: 123 },
        { id: 120, event: 'Death of mother', house: 4, houses: [3, 5, 10], condition: 'maraca and badhaka of the mother', srcNum: 124 },
        { id: 121, event: 'Deposit money in bank', house: 4, houses: [4, 2, 11], condition: 'Jupiter', srcNum: 125 },
        { id: 122, event: 'Education – less person', house: 4, houses: [3, 8, 10], condition: '', srcNum: 126 },
        { id: 123, event: 'Failure in exam', house: 4, houses: [6, 8, 12, 3], condition: '', srcNum: 127 },
        { id: 124, event: 'Gain a degree through correspondence', house: 4, houses: [3, 9, 12], condition: '', srcNum: 128 },
        { id: 125, event: 'College admission', house: 4, houses: [4, 11], condition: '', srcNum: 129 },
        { id: 126, event: 'Coming back home after discharge from hospital', house: 4, houses: [2, 11, 5], condition: '', srcNum: 130 },
        { id: 127, event: 'Coming from abroad', house: 4, houses: [3, 9, 11, 2, 4, 8], condition: '', srcNum: 131 },
        { id: 128, event: 'Completion or damage in education', house: 4, houses: [3, 8, 5], condition: '', srcNum: 132 },
        { id: 129, event: 'Construct a house', house: 4, houses: [4, 11, 12], condition: '', srcNum: 133 },
        { id: 130, event: 'Construct of a religious building', house: 4, houses: [12, 4, 11], condition: 'influence of Jupiter', srcNum: 134 },
        { id: 131, event: 'Construction of several houses', house: 4, houses: [4, 11, 12], condition: 'influence of dual signs', srcNum: 135 },
        { id: 132, event: 'Addiction to alcohol', house: 5, houses: [3, 6, 2, 1, 4], condition: 'influence of Saturn/mars//rahu/venus', srcNum: 136 },
        { id: 133, event: 'Caesarean child birth', house: 5, houses: [2, 8, 12], condition: 'mars will be present in the cuspal positions with the influence of the lord', srcNum: 137 },
        { id: 134, event: 'Child Birth', house: 5, houses: [2, 11], condition: 'influence from any of the planets of growth such as Jupiter moon and venus', srcNum: 138 },
        { id: 135, event: 'Child adoption', house: 5, houses: [8, 6, 10], condition: 'influence from mercury and dual signs', srcNum: 139 },
        { id: 136, event: 'Child birth denial and abortion', house: 5, houses: [4, 10, 1, 8, 12], condition: 'and12 and influence of rahu mars and ketu', srcNum: 140 },
        { id: 137, event: 'Child’s health', house: 5, houses: [9, 3, 5], condition: '', srcNum: 141 },
        { id: 138, event: 'Having an affair with one’s business partner', house: 5, houses: [8, 5, 11], condition: 'rahu', srcNum: 142 },
        { id: 139, event: 'Intelligent thinking', house: 5, houses: [5, 11, 3, 9], condition: 'Jupiter and venus', srcNum: 143 },
        { id: 140, event: 'Inter-community marriage', house: 5, houses: [2, 7, 11], condition: 'rahu / ketu', srcNum: 144 },
        { id: 141, event: 'Keeping a mistress', house: 5, houses: [7, 11, 2, 12], condition: '', srcNum: 145 },
        { id: 142, event: 'Loose thinking', house: 5, houses: [4, 8, 6, 1, 12], condition: '', srcNum: 146 },
        { id: 143, event: 'Love affair', house: 5, houses: [2, 11], condition: '', srcNum: 147 },
        { id: 144, event: 'Love marriage', house: 5, houses: [7, 11, 2], condition: 'strong mars venus. Rahu', srcNum: 148 },
        { id: 145, event: 'Love partner and success in love affair', house: 5, houses: [11, 2], condition: '', srcNum: 149 },
        { id: 146, event: 'Mantra receiving', house: 5, houses: [5, 9, 11, 2], condition: '', srcNum: 150 },
        { id: 147, event: 'No marriage with a love partner', house: 5, houses: [6, 12, 4], condition: '', srcNum: 151 },
        { id: 148, event: 'Normal delivery', house: 5, houses: [2, 5, 11], condition: '', srcNum: 152 },
        { id: 149, event: 'Pleasure by thinking by love', house: 5, houses: [11], condition: 'rahu and venus / mars and afflicted moon and influence of airy signs', srcNum: 153 },
        { id: 150, event: 'Popular actor, artist', house: 5, houses: [5, 6, 10], condition: 'influenced by mercury venus moon and air and water signs', srcNum: 154 },
        { id: 151, event: 'Popularity and success in music', house: 5, houses: [5, 6, 10, 11], condition: 'venus', srcNum: 155 },
        { id: 152, event: 'Pregnancy', house: 5, houses: [2, 11], condition: '', srcNum: 156 },
        { id: 153, event: 'Pregnancy and child birth', house: 5, houses: [5, 11, 2], condition: '', srcNum: 157 },
        { id: 154, event: 'Safe and natural delivery of child', house: 5, houses: [3, 5, 11], condition: '', srcNum: 158 },
        { id: 155, event: 'Safe from danger/cure/recover', house: 5, houses: [1, 5, 11], condition: '', srcNum: 159 },
        { id: 156, event: 'Scandalous love affair', house: 5, houses: [5, 8, 12], condition: 'rahu', srcNum: 160 },
        { id: 157, event: 'Separation from child', house: 5, houses: [4, 12], condition: '', srcNum: 161 },
        { id: 158, event: 'Siddhi initiation', house: 5, houses: [3, 9, 10, 12], condition: 'ketu Saturn', srcNum: 162 },
        { id: 159, event: 'Speculative business', house: 5, houses: [2, 11, 8], condition: 'rahu mercury', srcNum: 163 },
        { id: 160, event: 'Speculation, cinema, music, children', house: 5, houses: [5, 2, 11], condition: '', srcNum: 164 },
        { id: 161, event: 'Sports, fine arts, film, speculation as work', house: 5, houses: [10, 2, 11, 6], condition: '', srcNum: 165 },
        { id: 162, event: 'Sterility of a woman', house: 5, houses: [4, 10, 1], condition: 'barren signs', srcNum: 166 },
        { id: 163, event: 'Success in sports', house: 5, houses: [6, 11, 3], condition: '', srcNum: 167 },
        { id: 164, event: 'Raped by someone', house: 5, houses: [8, 12], condition: 'influence of pluto Uranus mars rahu and satu at the cuspal positions', srcNum: 168 },
        { id: 165, event: 'Recovery health', house: 5, houses: [3, 5], condition: '', srcNum: 169 },
        { id: 166, event: 'Termination of love affair', house: 5, houses: [6, 8, 12, 10], condition: '', srcNum: 170 },
        { id: 167, event: 'Treatment not effective', house: 5, houses: [4, 10], condition: '', srcNum: 171 },
        { id: 168, event: 'Twin birth', house: 5, houses: [2, 5, 11], condition: 'influenced of dual signs', srcNum: 172 },
        { id: 169, event: 'Death of child', house: 5, houses: [4, 6, 11], condition: 'maraka and badhaka of the child', srcNum: 173 },
        { id: 170, event: 'Delivery of child by operation', house: 5, houses: [4, 8, 12], condition: 'influence from mars and Saturn', srcNum: 174 },
        { id: 171, event: 'Gain in gambling', house: 5, houses: [5, 10, 11, 2], condition: 'rahu', srcNum: 175 },
        { id: 172, event: 'Cinema actor', house: 5, houses: [5, 10, 11, 7], condition: '', srcNum: 176 },
        { id: 173, event: 'Cure disease/recovery/escape from accident or danger', house: 5, houses: [1, 5, 11], condition: '', srcNum: 177 },
        { id: 174, event: 'Borrowing due to disease, difficulties', house: 6, houses: [7, 6, 2], condition: 'influence of Saturn', srcNum: 178 },
        { id: 175, event: 'Borrowing from children', house: 6, houses: [4, 6], condition: '', srcNum: 179 },
        { id: 176, event: 'Borrowing from elder brother', house: 6, houses: [10, 6], condition: '', srcNum: 180 },
        { id: 177, event: 'Borrowing from friends', house: 6, houses: [8, 5, 6], condition: '', srcNum: 181 },
        { id: 178, event: 'Borrowing from mother', house: 6, houses: [3, 6], condition: '', srcNum: 182 },
        { id: 179, event: 'Borrowing from wife or partner', house: 6, houses: [6, 8], condition: '', srcNum: 183 },
        { id: 180, event: 'Borrowing from younger brother', house: 6, houses: [2, 6], condition: '', srcNum: 184 },
        { id: 181, event: 'Borrowing from bank', house: 6, houses: [2, 6, 10, 11], condition: '', srcNum: 185 },
        { id: 182, event: 'Borrowing to repay debts due to business', house: 6, houses: [9, 6, 2], condition: '', srcNum: 186 },
        { id: 183, event: 'Change in job', house: 6, houses: [1, 5, 10, 11], condition: '', srcNum: 187 },
        { id: 184, event: 'Change in place of job', house: 6, houses: [3, 7, 10, 11], condition: '', srcNum: 188 },
        { id: 185, event: 'Get a desired or good job', house: 6, houses: [2, 6, 11, 10], condition: '', srcNum: 189 },
        { id: 186, event: 'Getting a tenant', house: 6, houses: [4, 11, 6], condition: 'mercury', srcNum: 190 },
        { id: 187, event: 'Good health by cure/ recovery', house: 6, houses: [1, 5, 11], condition: '', srcNum: 191 },
        { id: 188, event: 'Ill health', house: 6, houses: [1, 8, 12], condition: '', srcNum: 192 },
        { id: 189, event: 'Lifelong disease', house: 6, houses: [1, 6, 8, 12], condition: '', srcNum: 193 },
        { id: 190, event: 'Loans from bank', house: 6, houses: [2, 11], condition: '', srcNum: 194 },
        { id: 191, event: 'Loss in competition', house: 6, houses: [5, 12, 10], condition: '', srcNum: 195 },
        { id: 192, event: 'Obstacles in career', house: 6, houses: [5, 8, 12], condition: 'influence of Saturn and rahu', srcNum: 196 },
        { id: 193, event: 'Promotion in work', house: 6, houses: [2, 6, 10, 11], condition: '', srcNum: 197 },
        { id: 194, event: 'Repaying loan', house: 6, houses: [12, 5, 8], condition: '', srcNum: 198 },
        { id: 195, event: 'Returning borrowed money', house: 6, houses: [4, 5, 8, 12], condition: '', srcNum: 199 },
        { id: 196, event: 'Secret activities of partner', house: 6, houses: [5, 11], condition: 'mute signs', srcNum: 200 },
        { id: 197, event: 'Success in competitions', house: 6, houses: [1, 11, 3], condition: '', srcNum: 201 },
        { id: 198, event: 'Success in litigation', house: 6, houses: [1, 11], condition: 'favourable Jupiter', srcNum: 202 },
        { id: 199, event: 'Recovery from disease', house: 6, houses: [5, 11], condition: '', srcNum: 203 },
        { id: 200, event: 'Suffer from disease', house: 6, houses: [6, 8, 12, 1], condition: 'influence of the house lord', srcNum: 204 },
        { id: 201, event: 'Tender resignation of service in haste', house: 6, houses: [2, 8, 9, 10], condition: '', srcNum: 205 },
        { id: 202, event: 'Winning election/litigation/sport/competition', house: 6, houses: [1, 6, 11, 3, 10], condition: '', srcNum: 206 },
        { id: 203, event: 'Debt ridden life', house: 6, houses: [6, 8, 12], condition: '', srcNum: 207 },
        { id: 204, event: 'Debt to repay debt', house: 6, houses: [3, 7, 12], condition: '', srcNum: 208 },
        { id: 205, event: 'Disease(chronic)', house: 6, houses: [1, 6, 8], condition: 'Saturn', srcNum: 209 },
        { id: 206, event: 'Disease is cured, safe from any danger', house: 6, houses: [1, 5, 11], condition: '', srcNum: 210 },
        { id: 207, event: 'Disease unknown in medical science', house: 6, houses: [8, 12], condition: 'influence of ketu', srcNum: 211 },
        { id: 208, event: 'Earn sufficient money', house: 6, houses: [2, 6, 11], condition: 'Jupiter and venus', srcNum: 212 },
        { id: 209, event: 'Chronic disease', house: 6, houses: [1, 6, 8], condition: 'Saturn influencing these houses', srcNum: 213 },
        { id: 210, event: 'Competitive exam', house: 6, houses: [4, 9, 11], condition: '', srcNum: 214 },
        { id: 211, event: 'Breaking engagement', house: 7, houses: [5, 7, 11], condition: '', srcNum: 216 },
        { id: 212, event: 'Gain/profit in business', house: 7, houses: [2, 10, 11], condition: 'Jupiter', srcNum: 217 },
        { id: 213, event: 'Independent business', house: 7, houses: [3, 7, 10, 11], condition: 'mars and Mercury', srcNum: 218 },
        { id: 214, event: 'Loss in business', house: 7, houses: [5, 8, 12], condition: 'influence of earthy signs', srcNum: 219 },
        { id: 215, event: 'Loss in business industry', house: 7, houses: [5, 8, 12], condition: 'influence of earthy signs', srcNum: 220 },
        { id: 216, event: 'Marriage already fixed stops abruptly', house: 7, houses: [1, 6, 10, 12], condition: '', srcNum: 221 },
        { id: 217, event: 'Marriage and separation', house: 7, houses: [1, 6, 10], condition: 'Jupiter for legal separation', srcNum: 222 },
        { id: 218, event: 'Marriage celebration', house: 7, houses: [2, 11], condition: '', srcNum: 223 },
        { id: 219, event: 'Marriage negotiation', house: 7, houses: [7, 3, 9], condition: '', srcNum: 224 },
        { id: 220, event: 'Marriage to a widow', house: 7, houses: [2, 7, 11], condition: 'heavy influence of Saturn and rahu', srcNum: 225 },
        { id: 221, event: 'Marriage to an aged partner', house: 7, houses: [2, 7, 11], condition: 'heavy influence of Saturn', srcNum: 226 },
        { id: 222, event: 'Marriage to foreigner', house: 7, houses: [5, 9, 2, 7, 11], condition: '', srcNum: 227 },
        { id: 223, event: 'Misunderstanding with partner and family members', house: 7, houses: [2, 7, 8], condition: '', srcNum: 228 },
        { id: 224, event: 'Multiple marriage', house: 7, houses: [2, 7, 9, 11], condition: 'mercury/dual signs', srcNum: 229 },
        { id: 225, event: 'No marriage', house: 7, houses: [1, 6, 10], condition: 'house strong', srcNum: 230 },
        { id: 226, event: 'Partnership breaks', house: 7, houses: [8, 6, 12], condition: '', srcNum: 231 },
        { id: 227, event: 'Partnership of any kind', house: 7, houses: [5, 11], condition: '', srcNum: 232 },
        { id: 228, event: 'Publications as business', house: 7, houses: [2, 6, 11, 3], condition: 'influence of mars mercury and Jupiter', srcNum: 233 },
        { id: 229, event: 'Return of wife from normal separation', house: 7, houses: [11, 7, 5], condition: '', srcNum: 234 },
        { id: 230, event: 'Reunion with partner', house: 7, houses: [7, 11, 5], condition: '', srcNum: 235 },
        { id: 231, event: 'Second child', house: 7, houses: [2, 11], condition: '', srcNum: 236 },
        { id: 232, event: 'Separation with profit', house: 7, houses: [1, 7, 6, 12, 10], condition: 'influence from sun and rahu or Saturn and mars', srcNum: 237 },
        { id: 233, event: 'Separation by violence', house: 7, houses: [8, 12, 6], condition: 'mars and fiery signs', srcNum: 238 },
        { id: 234, event: 'Separation due to misunderstanding with partner', house: 7, houses: [2, 7, 12], condition: 'mercury', srcNum: 239 },
        { id: 235, event: 'Separation from partner', house: 7, houses: [6, 12], condition: '', srcNum: 240 },
        { id: 236, event: 'Separation of spouse/ partner by death', house: 7, houses: [8, 12, 6], condition: 'maraca and badhaka of the partner', srcNum: 241 },
        { id: 237, event: 'Separation spouses from each other', house: 7, houses: [1, 6, 10, 12], condition: '', srcNum: 242 },
        { id: 238, event: 'Spouse/partner will be an employee', house: 7, houses: [4, 8, 12], condition: '', srcNum: 243 },
        { id: 239, event: 'Reconciliation after separation /divorce', house: 7, houses: [1, 6, 10, 12, 2, 5, 7, 11], condition: '', srcNum: 244 },
        { id: 240, event: 'Theft in house', house: 7, houses: [2, 12], condition: 'influence Saturn and mars rahu', srcNum: 245 },
        { id: 241, event: 'Independent business', house: 7, houses: [3, 7, 2, 11], condition: '', srcNum: 246 },
        { id: 242, event: 'Difficulties in married life', house: 7, houses: [4, 6, 8, 12], condition: '', srcNum: 247 },
        { id: 243, event: 'Death of partner', house: 7, houses: [8, 6, 1], condition: 'maraca and badhaka of the person', srcNum: 248 },
        { id: 244, event: 'Delay in marriage', house: 7, houses: [2, 7, 11, 1, 6, 10], condition: '', srcNum: 249 },
        { id: 245, event: 'Divorce finalized', house: 7, houses: [1, 6, 10, 12], condition: 'Jupiter', srcNum: 250 },
        { id: 246, event: 'Dowry receiving', house: 7, houses: [2, 7, 8, 11], condition: '', srcNum: 251 },
        { id: 247, event: 'Dull business', house: 7, houses: [1, 5], condition: 'influence of tarus virgo and Capricorn', srcNum: 252 },
        { id: 248, event: 'Commission agency as business', house: 7, houses: [3, 11], condition: 'mercury will be present in some of the cuspal places', srcNum: 253 },
        { id: 249, event: 'Conflicts in marriage', house: 7, houses: [6, 8, 12], condition: 'influence of mars', srcNum: 254 },
        { id: 250, event: 'Danger from opponents', house: 7, houses: [8, 12], condition: '', srcNum: 255 },
        { id: 251, event: 'Accidental death', house: 8, houses: [8, 12], condition: 'influence of mars rahu and Saturn at the cuspal position with maraca and badhaka', srcNum: 257 },
        { id: 252, event: 'Getting gratuity, insurance etc, property of the decreased person of the deceased person', house: 8, houses: [8, 2, 11, 5], condition: 'Jupiter', srcNum: 258 },
        { id: 253, event: 'Giving donation', house: 8, houses: [5, 8, 12], condition: '', srcNum: 259 },
        { id: 254, event: 'Giving dowry', house: 8, houses: [5, 12], condition: 'indirect link', srcNum: 260 },
        { id: 255, event: 'Calamity', house: 8, houses: [8, 12], condition: 'influence of the badhaka lord and ketu', srcNum: 261 },
        { id: 256, event: 'Madness or insanity', house: 8, houses: [6, 8, 12], condition: 'moon mercury ketu and Saturn influencing these cuspal points', srcNum: 262 },
        { id: 257, event: 'Ornaments or cash from inheritance', house: 8, houses: [2, 11], condition: '', srcNum: 263 },
        { id: 258, event: 'Person of nuisance for others', house: 8, houses: [5, 8], condition: 'sun and mars', srcNum: 264 },
        { id: 259, event: 'Property through will', house: 8, houses: [6, 8, 11, 3, 10], condition: 'influence of Saturn, also involving houses 3 and 10', srcNum: 265 },
        { id: 260, event: 'Property, vehicle from inheritance', house: 8, houses: [4, 11], condition: '', srcNum: 266 },
        { id: 261, event: 'Receipt of gifts', house: 8, houses: [6, 11], condition: '', srcNum: 267 },
        { id: 262, event: 'Recovery of lost articles', house: 8, houses: [2, 6, 11], condition: '', srcNum: 268 },
        { id: 263, event: 'Rendering wealth', house: 8, houses: [2, 11], condition: '', srcNum: 269 },
        { id: 264, event: 'Suicide', house: 8, houses: [12, 4], condition: 'badhaka and maraca and mars Saturn rahu ketu and mercury', srcNum: 270 },
        { id: 265, event: 'Surgery/operation', house: 8, houses: [8, 6, 12], condition: 'influence mars', srcNum: 271 },
        { id: 266, event: 'Unearned gains', house: 8, houses: [2, 11, 5], condition: 'for speculation related gains', srcNum: 272 },
        { id: 267, event: 'Unexpected loss', house: 8, houses: [5, 12], condition: '', srcNum: 273 },
        { id: 268, event: 'Wife’s property', house: 8, houses: [1, 3, 8, 9, 10], condition: 'influence of mars', srcNum: 274 },
        { id: 269, event: 'Death due to sickness', house: 8, houses: [6, 12], condition: 'maraka and badhaka planets involved in these cusp', srcNum: 275 },
        { id: 270, event: 'Depression', house: 8, houses: [1, 3, 12], condition: 'moon afflicted by Saturn', srcNum: 276 },
        { id: 271, event: 'Disgrace, ill reputation and scandals', house: 8, houses: [1, 5, 8], condition: '', srcNum: 277 },
        { id: 272, event: 'Free from debts', house: 8, houses: [4, 5, 8, 12], condition: '', srcNum: 278 },
        { id: 273, event: 'Committing rape', house: 8, houses: [5, 12], condition: 'involvement if Pluto mercury will be present in some of the cuspal places', srcNum: 279 },
        { id: 274, event: 'Danger to health', house: 8, houses: [6, 8, 12, 1], condition: '', srcNum: 280 },
        { id: 275, event: 'Death due to accident', house: 8, houses: [4, 12], condition: 'maraka and badhaka planets involved in these cusps', srcNum: 281 },
        { id: 276, event: 'Astrologer', house: 9, houses: [4, 9, 12], condition: 'influenced by mercury Jupiter and Saturn', srcNum: 282 },
        { id: 277, event: 'Attainment of spirituality', house: 9, houses: [5, 11], condition: 'ketu Jupiter or Saturn', srcNum: 283 },
        { id: 278, event: 'Change in line of career/ vocation', house: 9, houses: [5, 9, 11, 10], condition: '', srcNum: 284 },
        { id: 279, event: 'Good luck (lucky in all)', house: 9, houses: [9, 11], condition: 'sun or jupiter', srcNum: 285 },
        { id: 280, event: 'Higher education', house: 9, houses: [11, 4, 9], condition: '', srcNum: 286 },
        { id: 281, event: 'Inheritance of large property', house: 9, houses: [2, 11], condition: '', srcNum: 287 },
        { id: 282, event: 'Long journey only', house: 9, houses: [3, 12], condition: '', srcNum: 288 },
        { id: 283, event: 'Long life father', house: 9, houses: [9, 11, 1, 6], condition: '', srcNum: 289 },
        { id: 284, event: 'Marriage- second after divorce', house: 9, houses: [2, 9, 11], condition: 'Jupiter and mercury influencing the dual signs', srcNum: 290 },
        { id: 285, event: 'Pilgrimage', house: 9, houses: [3, 9, 10], condition: '', srcNum: 291 },
        { id: 286, event: 'Scientist', house: 9, houses: [9, 11, 10, 2, 3], condition: 'Saturn and Jupiter', srcNum: 292 },
        { id: 287, event: 'Second marriage after demise of first spouse', house: 9, houses: [2, 9, 11], condition: 'influence from ketu and mars', srcNum: 293 },
        { id: 288, event: 'Separation from father', house: 9, houses: [8, 12, 3], condition: '', srcNum: 294 },
        { id: 289, event: 'Spiritual life and divine worship', house: 9, houses: [1, 5, 9, 11, 12], condition: 'saturn and ketu as benefices', srcNum: 295 },
        { id: 290, event: 'Success in research', house: 9, houses: [6, 11], condition: 'venus and Jupiter in the cuspal positions', srcNum: 296 },
        { id: 291, event: 'Success in research', house: 9, houses: [9, 11, 6, 12], condition: 'saturn and Jupiter', srcNum: 297 },
        { id: 292, event: 'Success in spiritual discipline', house: 9, houses: [6, 11, 9, 10], condition: '', srcNum: 298 },
        { id: 293, event: 'Third child', house: 9, houses: [2, 11], condition: '', srcNum: 299 },
        { id: 294, event: 'Foreign study', house: 9, houses: [6, 9, 11, 12], condition: 'mercury at any of these cuspal position', srcNum: 300 },
        { id: 295, event: 'Further studies (master in Ph.D.)', house: 9, houses: [4, 9, 11], condition: '', srcNum: 301 },
        { id: 296, event: 'Anticipated promotion (delayed)', house: 10, houses: [3, 2, 5, 10], condition: 'influence by mercury Jupiter and Saturn', srcNum: 302 },
        { id: 297, event: 'Break in service', house: 10, houses: [5, 8, 12, 9], condition: '', srcNum: 303 },
        { id: 298, event: 'Getting a business partner', house: 10, houses: [6, 11], condition: '', srcNum: 304 },
        { id: 299, event: 'Getting an award/prize', house: 10, houses: [10, 11, 6], condition: 'sun and Jupiter', srcNum: 305 },
        { id: 300, event: 'Honourable life but materially poor', house: 10, houses: [1, 3, 9, 10], condition: '', srcNum: 306 },
        { id: 301, event: 'Inheriting property', house: 10, houses: [2, 10, 11], condition: '', srcNum: 307 },
        { id: 302, event: 'Job and independent business together', house: 10, houses: [10, 6, 7, 2, 3], condition: 'mercury and dual signs', srcNum: 308 },
        { id: 303, event: 'Legal profession', house: 10, houses: [2, 6, 11, 9], condition: 'Jupiter. mercury for civil and mars for criminal matters', srcNum: 309 },
        { id: 304, event: 'Loss of reputation and money or income tax trouble', house: 10, houses: [7, 8, 12], condition: '', srcNum: 310 },
        { id: 305, event: 'Loss of work', house: 10, houses: [1, 5, 9, 12], condition: 'influence of planets occupying the 5th and 9th houses', srcNum: 311 },
        { id: 306, event: 'No change of work place', house: 10, houses: [1, 4, 10, 11], condition: '', srcNum: 312 },
        { id: 307, event: 'No improvement in service or business', house: 10, houses: [2, 5, 10], condition: '', srcNum: 313 },
        { id: 308, event: 'No occupation in life', house: 10, houses: [5, 9], condition: 'houses very strong', srcNum: 314 },
        { id: 309, event: 'Politics as profession', house: 10, houses: [2, 6, 11, 9], condition: 'Jupiter sun and Saturn very strong in horoscope and in the cuspal positions', srcNum: 315 },
        { id: 310, event: 'Poor living', house: 10, houses: [8, 12], condition: '', srcNum: 316 },
        { id: 311, event: 'Popular astrologer', house: 10, houses: [11, 2, 5, 9], condition: '', srcNum: 317 },
        { id: 312, event: 'Popularity and success in politics', house: 10, houses: [3, 10, 11, 2, 6], condition: 'influenced from Saturn and rahu with weak sun and moon', srcNum: 318 },
        { id: 313, event: 'Popularity', house: 10, houses: [1, 10, 3, 11], condition: '', srcNum: 319 },
        { id: 314, event: 'Problem in service', house: 10, houses: [6, 5, 8], condition: '', srcNum: 320 },
        { id: 315, event: 'Promotion & overseas', house: 10, houses: [2, 3, 6, 10, 11], condition: '', srcNum: 321 },
        { id: 316, event: 'Reputation', house: 10, houses: [1, 11], condition: 'strong sun or Saturn in the cuspal positions', srcNum: 322 },
        { id: 317, event: 'Retirement from work', house: 10, houses: [5, 9], condition: '', srcNum: 323 },
        { id: 318, event: 'Sale of immovable property', house: 10, houses: [10, 5, 3], condition: '', srcNum: 324 },
        { id: 319, event: 'Status and respect', house: 10, houses: [1, 11], condition: '', srcNum: 325 },
        { id: 320, event: 'Success in politics', house: 10, houses: [9, 10, 11, 1, 6], condition: '', srcNum: 326 },
        { id: 321, event: 'Successful astrologer', house: 10, houses: [2, 9, 11, 10], condition: '', srcNum: 327 },
        { id: 322, event: 'Successful in share market business', house: 10, houses: [5, 10, 2, 7, 11], condition: '', srcNum: 328 },
        { id: 323, event: 'Publishing press ownership', house: 10, houses: [2, 6, 10], condition: 'influence of mars and mercury', srcNum: 329 },
        { id: 324, event: 'Reinstatement', house: 10, houses: [2, 6, 10, 11], condition: '', srcNum: 330 },
        { id: 325, event: 'Removal from service', house: 10, houses: [5, 9, 8], condition: 'influence of mars and Jupiter in the cuspal positions', srcNum: 331 },
        { id: 326, event: 'Suspension', house: 10, houses: [1, 8, 9, 12, 5], condition: '', srcNum: 332 },
        { id: 327, event: 'Teaching as profession', house: 10, houses: [2, 6, 11, 4, 9], condition: 'Jupiter and venus cuspal positions', srcNum: 333 },
        { id: 328, event: 'Temporary suspension in service', house: 10, houses: [5, 6, 8], condition: '', srcNum: 334 },
        { id: 329, event: 'Transfer', house: 10, houses: [3, 10, 12], condition: '', srcNum: 335 },
        { id: 330, event: 'Voluntary retirement from service', house: 10, houses: [1, 5, 9], condition: '', srcNum: 336 },
        { id: 331, event: 'Wife is destined to get property', house: 10, houses: [10, 5, 8], condition: '', srcNum: 337 },
        { id: 332, event: 'Will tender resignation of service in haste', house: 10, houses: [1, 3, 8, 9, 10], condition: 'influenced with mars', srcNum: 338 },
        { id: 333, event: 'Winding up business or break in career', house: 10, houses: [5, 8, 12], condition: 'influenced of earthy signs', srcNum: 339 },
        { id: 334, event: 'Decent living', house: 10, houses: [2, 6, 9, 11], condition: '', srcNum: 340 },
        { id: 335, event: 'Donations', house: 10, houses: [9, 11], condition: 'Jupiter', srcNum: 341 },
        { id: 336, event: 'Export business', house: 10, houses: [3, 6, 11, 12], condition: 'influenced of moon', srcNum: 342 },
        { id: 337, event: 'Failure in politics', house: 10, houses: [2], condition: '', srcNum: 343 },
        { id: 338, event: 'Fame', house: 10, houses: [1, 3, 10], condition: '', srcNum: 344 },
        { id: 339, event: 'Forced retirement', house: 10, houses: [5, 8, 9], condition: 'mars appearing with Jupiter having influenced of house of law', srcNum: 345 },
        { id: 340, event: 'Computer professional', house: 10, houses: [3, 2, 11], condition: 'mercury and ketu will be related with these cuspal positions', srcNum: 346 },
        { id: 341, event: 'Child’s return home', house: 11, houses: [5, 11], condition: '', srcNum: 347 },
        { id: 342, event: 'Childlessness’ of a man', house: 11, houses: [10, 4, 1], condition: '', srcNum: 348 },
        { id: 343, event: 'Getting hidden treasure', house: 11, houses: [4, 11, 8], condition: 'rahu and Saturn influencing the cuspal positions', srcNum: 349 },
        { id: 344, event: 'Happy married life', house: 11, houses: [2, 7, 11], condition: 'strong venus and mars unafflicted', srcNum: 350 },
        { id: 345, event: 'Having marriage as one desired', house: 11, houses: [2, 3, 7, 11], condition: '', srcNum: 351 },
        { id: 346, event: 'High position in politics', house: 11, houses: [9, 10, 11], condition: '', srcNum: 352 },
        { id: 347, event: 'Higher studies', house: 11, houses: [9, 11, 3, 6], condition: 'influence of Jupiter', srcNum: 353 },
        { id: 348, event: 'Leasing a landed or immovable property', house: 11, houses: [6, 11, 12], condition: '', srcNum: 354 },
        { id: 349, event: 'Losing through friends', house: 11, houses: [4, 5, 8, 12], condition: '', srcNum: 355 },
        { id: 350, event: 'Loss of wealth', house: 11, houses: [5, 8, 12], condition: '', srcNum: 356 },
        { id: 351, event: 'No cure of disease', house: 11, houses: [4, 6, 12], condition: '', srcNum: 357 },
        { id: 352, event: 'Non-recovery of lost articles due to theft', house: 11, houses: [5, 8, 12], condition: '', srcNum: 358 },
        { id: 353, event: 'Popular in acting', house: 11, houses: [5, 11], condition: 'mercury venus moon and sun', srcNum: 359 },
        { id: 354, event: 'Profit in business', house: 11, houses: [2, 7, 10, 11], condition: '', srcNum: 360 },
        { id: 355, event: 'Promotion/reinstatement/ gain in occupation', house: 11, houses: [2, 6, 10, 11], condition: '', srcNum: 361 },
        { id: 356, event: 'Research scholarship', house: 11, houses: [2, 6, 11, 4], condition: 'also connected to the 4th house', srcNum: 362 },
        { id: 357, event: 'Returning of missing person', house: 11, houses: [1, 11, 2, 8, 4], condition: 'CSL of the missing person’s own chart; also 2,8,11 of the missing person along with the 4th house of the missing person', srcNum: 363 },
        { id: 358, event: 'Reunion with spouse', house: 11, houses: [2, 7, 11], condition: '', srcNum: 364 },
        { id: 359, event: 'Reunion with kith and kin', house: 11, houses: [3, 9, 11], condition: '', srcNum: 365 },
        { id: 360, event: 'Satisfaction of desire', house: 11, houses: [1, 11], condition: 'fruitful signs', srcNum: 366 },
        { id: 361, event: 'Satisfactory spiritual life', house: 11, houses: [5, 10], condition: 'ketu', srcNum: 367 },
        { id: 362, event: 'Scholarship', house: 11, houses: [2, 6, 11, 4], condition: '', srcNum: 368 },
        { id: 363, event: 'Scholarship for higher study', house: 11, houses: [6, 9, 11, 4], condition: '', srcNum: 369 },
        { id: 364, event: 'Sexual relationship with friend', house: 11, houses: [8, 5], condition: '', srcNum: 370 },
        { id: 365, event: 'Success in undertakings', house: 11, houses: [6, 11, 1, 2, 3, 10], condition: '', srcNum: 371 },
        { id: 366, event: 'Success in education', house: 11, houses: [4, 9, 11], condition: '', srcNum: 372 },
        { id: 367, event: 'Success in interview', house: 11, houses: [3, 9], condition: '', srcNum: 373 },
        { id: 368, event: 'Success in love affair', house: 11, houses: [5, 11], condition: 'influence of mars and venus together', srcNum: 374 },
        { id: 369, event: 'Successful writer, publisher', house: 11, houses: [3, 9], condition: 'connected Ju Me', srcNum: 375 },
        { id: 370, event: 'Realization of amount due', house: 11, houses: [2, 11], condition: '', srcNum: 376 },
        { id: 371, event: 'Unhappy married life', house: 11, houses: [4, 6, 8, 10, 12], condition: '', srcNum: 377 },
        { id: 372, event: 'Unreliable friend', house: 11, houses: [7, 8, 9], condition: 'moon', srcNum: 378 },
        { id: 373, event: 'Vacating by tenant', house: 11, houses: [8, 6], condition: '', srcNum: 379 },
        { id: 374, event: 'Winning in love', house: 11, houses: [5, 7], condition: '', srcNum: 380 },
        { id: 375, event: 'Doctorate degree', house: 11, houses: [4, 9, 11], condition: 'strong Jupiter', srcNum: 381 },
        { id: 376, event: 'Earning money through illegal means', house: 11, houses: [2, 5, 8], condition: 'rahu', srcNum: 382 },
        { id: 377, event: 'Free of disease', house: 11, houses: [6, 11], condition: '', srcNum: 383 },
        { id: 378, event: 'Friends helpful and beneficial', house: 11, houses: [1, 2, 3, 6, 10, 11], condition: '', srcNum: 384 },
        { id: 379, event: 'Gain of money/wealth', house: 11, houses: [2, 6, 11], condition: '', srcNum: 385 },
        { id: 380, event: 'Absconding', house: 12, houses: [12, 3, 8], condition: 'house of the absconding person\'s own chart; 3,8 of the absconding person\'s chart, plus Saturn/Rahu appearing in these places', srcNum: 386 },
        { id: 381, event: 'Bad luck in the form of any loss', house: 12, houses: [5, 8, 12], condition: 'Saturn and mars', srcNum: 387 },
        { id: 382, event: 'Getting bail', house: 12, houses: [6, 11, 10], condition: '', srcNum: 388 },
        { id: 383, event: 'Going aboard for job/ business', house: 12, houses: [3, 9, 12, 6, 10], condition: 'Saturn', srcNum: 389 },
        { id: 384, event: 'Having bed comfort with one’s wife', house: 12, houses: [1, 5, 7, 12], condition: '', srcNum: 390 },
        { id: 385, event: 'House detention', house: 12, houses: [4, 8, 12], condition: '', srcNum: 391 },
        { id: 386, event: 'Imprisonment', house: 12, houses: [3, 8], condition: 'Saturn or rahu or both are found in these cuspal positions', srcNum: 392 },
        { id: 387, event: 'Insanity', house: 12, houses: [6, 8, 12], condition: 'moon afflicited by Saturn and rahu', srcNum: 393 },
        { id: 388, event: 'Loss in investment', house: 12, houses: [1, 5, 8], condition: '', srcNum: 394 },
        { id: 389, event: 'Mind to commit crime', house: 12, houses: [6, 8, 10, 12], condition: 'influence of rahu and mars', srcNum: 395 },
        { id: 390, event: 'Mind to raping', house: 12, houses: [5, 6, 8, 12], condition: 'mars', srcNum: 396 },
        { id: 391, event: 'Moving from place to place', house: 12, houses: [3, 12], condition: '', srcNum: 397 },
        { id: 392, event: 'New inventions', house: 12, houses: [1, 5, 9, 12], condition: 'strong influence of rahu', srcNum: 398 },
        { id: 393, event: 'Renunciation', house: 12, houses: [1, 4, 12], condition: 'Saturn and ketu', srcNum: 399 },
        { id: 394, event: 'Stay in mother land', house: 12, houses: [2, 4, 8, 11], condition: '', srcNum: 400 },
        { id: 395, event: 'Purchase of a house', house: 12, houses: [4, 6, 9, 12], condition: '', srcNum: 401 },
        { id: 396, event: 'Release from jail', house: 12, houses: [2, 4, 11], condition: '', srcNum: 402 },
        { id: 397, event: 'Disease causing defect in body', house: 12, houses: [6, 8, 12], condition: '', srcNum: 403 },
        { id: 398, event: 'Foreign going', house: 12, houses: [3, 9, 12], condition: '', srcNum: 404 },
        { id: 399, event: 'Foreign settlement', house: 12, houses: [3, 9, 12], condition: 'moon and mars', srcNum: 405 },
        { id: 400, event: 'Foreign travel', house: 12, houses: [3, 9], condition: 'moon/rahu', srcNum: 406 },
        { id: 401, event: 'Gain in foreign land and/or with foreigners', house: 12, houses: [2, 3, 6, 10, 11], condition: '', srcNum: 407 },
        { id: 402, event: 'Eye disease (defect in left eye)', house: 12, houses: [6, 8], condition: 'sun and moon', srcNum: 408 },
        { id: 403, event: 'Gain in investment', house: 12, houses: [2, 6, 11], condition: '', srcNum: 409 },
        { id: 404, event: 'Congenital birth defect', house: 12, houses: [12, 6], condition: '12th cusp is linked to the 6th cusp; influence of Saturn/Rahu/Ketu/Mars', srcNum: 410 },
        { id: 405, event: 'Danger in being secret activities', house: 12, houses: [7, 8], condition: 'Saturn rahu and Uranus in these cuspal positions', srcNum: 411 },
        { id: 406, event: 'Danger to life or ruined life, death', house: 12, houses: [8, 12], condition: 'badhaka lord', srcNum: 412 },
    ],

    // ================================================================
    // 2. LOOKUP HELPERS
    // ================================================================

    /** Case-insensitive substring search across event name/condition/srcNum. */
    searchRKEvents: function (query) {
        if (!query) return this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE;
        const q = String(query).toLowerCase();
        return this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE.filter(e =>
            e.event.toLowerCase().includes(q) ||
            (e.condition && e.condition.toLowerCase().includes(q)) ||
            String(e.id) === q || String(e.srcNum) === q);
    },

    getRKEventById: function (id) {
        return this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE.find(e => e.id === id) || null;
    },

    /** All events whose full houses combination touches the given house. */
    getRKEventsByHouse: function (house) {
        return this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE.filter(e => e.houses.includes(house));
    },

    /** All events filed under a given Primary House (1-12) — i.e. that house's own significations chapter. */
    getRKEventsByPrimaryHouse: function (house) {
        return this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE.filter(e => e.house === house);
    },

    // ================================================================
    // 3. CROSS-CHECK AGAINST A LIVE CHART
    // ================================================================

    /**
     * Resolves this table entry's Primary House CSL through Part 1's own
     * "2 levels deep" rule (resolveDeterminingPlanetPrecise + getPlanetNumbers)
     * and reports whether the determining planet's numbers intersect the
     * entry's full houses combination. This mirrors checkEventPromise() in
     * KP_prediction.js but works generically off this table's flat houses
     * list (the source table doesn't split prime/supporting/negative the
     * way the curated EVENT_PRIME_HOUSES does, so there is no separate
     * "negative" cross-check here — read the `condition` field for any
     * additional planetary qualifier the source table specified).
     */
    crossCheckRKEvent: function (idOrQuery, ascSid, natalPlanetsMap, lords) {
        const P1 = this._p1();
        if (!P1 || !natalPlanetsMap) return null;

        let entry = null;
        if (typeof idOrQuery === 'number') entry = this.getRKEventById(idOrQuery);
        else {
            const matches = this.searchRKEvents(idOrQuery);
            if (matches && matches.length) entry = matches[0];
        }
        if (!entry) return null;

        const allCusps = P1.getAllCusps(ascSid);
        const ascSignNum = Math.floor((((ascSid % 360) + 360) % 360) / 30);
        const planetNumbers = P1.applyNodeDispositorBlend(P1.getPlanetNumbers(allCusps), ascSid, ascSignNum, natalPlanetsMap, lords);

        const resolved = P1.resolveDeterminingPlanetPrecise(entry.house, allCusps, natalPlanetsMap);
        if (!resolved) return null;

        const detPlanet = resolved.determiningPlanet;
        const detNumbers = planetNumbers[detPlanet] || [];
        const matched = entry.houses.filter(h => detNumbers.includes(h));
        const promised = matched.length > 0;

        return {
            entry: entry,
            primaryHouse: entry.house,
            cusp: allCusps[entry.house],
            resolved: resolved,
            determiningPlanet: detPlanet,
            determiningPlanetNumbers: detNumbers,
            matchedHouses: matched,
            promised: promised,
            result: promised
                ? `PROMISED — ${detPlanet} (Primary House ${entry.house}'s determining planet) touches H${matched.join(',H')} of this event's houses combination (${entry.houses.join(',')}).${entry.condition ? ' Source table also specifies: ' + entry.condition + '.' : ''}`
                : `NOT PROMISED — ${detPlanet}'s numbers (H${detNumbers.join(',H') || '—'}) do not touch any of this event's houses combination (H${entry.houses.join(',H')}).`,
            reference: 'Rahul Kaushik, House Signification master reference (source row #' + entry.srcNum + ').'
        };
    },

    /** Runs crossCheckRKEvent() for every entry in the table at once. */
    crossCheckAllRKEvents: function (ascSid, natalPlanetsMap, lords) {
        const out = [];
        this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE.forEach(e => {
            try {
                const res = this.crossCheckRKEvent(e.id, ascSid, natalPlanetsMap, lords);
                if (res) out.push(res);
            } catch (err) {
                console.warn('crossCheckAllRKEvents: entry failed', e.id, e.event, err);
            }
        });
        return out;
    },

    // ================================================================
    // 4. UI DRIVER — analyze5() / renderHTML5()
    //    (same params/return-shape convention as analyze2/3/4 in Parts
    //    2-4, so predictions_ui.js can wire this module in identically.)
    // ================================================================

    /**
     * params: { natalPlanets, natalAsc, lords }
     * Bulk cross-checks the full 406-entry table against the supplied
     * chart and returns only the PROMISED ones, grouped by Primary House,
     * so the render step doesn't have to dump all 406 rows into the page.
     */
    analyze5: function (params) {
        params = params || {};
        const P1 = this._p1();
        const natalPlanets = params.natalPlanets, natalAsc = params.natalAsc;
        if (!P1 || !natalPlanets || !natalAsc) return null;
        const ascSid = natalAsc.sid !== undefined ? natalAsc.sid : (natalAsc.sn || 0) * 30;

        // Cached for the interactive single-event evaluator UI below.
        this._cachedAnalysisParams = { ascSid: ascSid, natalPlanets: natalPlanets, lords: params.lords };

        const allResults = this.crossCheckAllRKEvents(ascSid, natalPlanets, params.lords);
        const promised = allResults.filter(r => r.promised);

        const byHouse = {};
        promised.forEach(r => {
            const h = r.primaryHouse;
            if (!byHouse[h]) byHouse[h] = [];
            byHouse[h].push(r);
        });

        return {
            totalEvents: this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE.length,
            totalPromised: promised.length,
            byHouse: byHouse
        };
    },

    renderHTML5: function (data) {
        if (!data) return '<div class="pred-item">KP Part 5 (House Signification Table) analysis unavailable — check that natalPlanets/natalAsc were supplied.</div>';

        let html = '<div class="pred-section-title" style="margin-top:10px;">🗒️ KP Astrology — Part 5 (Rahul Kaushik House Signification Master Table)</div>';
        html += `<div class="pred-item" style="border-left:3px solid #C9A8FF;">
            <div class="pred-title" style="color:#C9A8FF;">📖 Full Reference Table</div>
            <div class="pred-detail">${data.totalEvents} events indexed from the source table. Of these, <b>${data.totalPromised}</b> show a promise (Primary House CSL's determining-planet numbers touch the event's houses combination) in this chart.</div>
        </div>`;

        const houseKeys = Object.keys(data.byHouse).map(Number).sort((a, b) => a - b);
        if (houseKeys.length === 0) {
            html += '<div class="pred-item">No promised events found among the 406 table entries for this chart.</div>';
        } else {
            houseKeys.forEach(h => {
                const rows = data.byHouse[h].map(r => `<div style="margin:4px 0;padding:6px;border-left:2px solid #C9A8FF;background:rgba(201,168,255,.06);">
                    <b>${r.entry.event}</b> <span style="font-size:8.5px;color:var(--muted);">(H${r.entry.houses.join(',H')})</span>
                    <div style="font-size:8.5px;color:#66CCFF;margin-top:2px;">${r.result}</div>
                </div>`).join('');
                html += `<details style="margin-top:6px;">
                    <summary style="cursor:pointer;color:#C9A8FF;font-size:10px;font-weight:bold;">House ${h} — ${data.byHouse[h].length} promised event(s)</summary>
                    ${rows}
                </details>`;
            });
        }

        html += this.renderRKEvaluatorUI();
        return html;
    },

    // ================================================================
    // 5. INTERACTIVE SINGLE-EVENT EVALUATOR (search-and-check any of the
    //    406 entries on demand, same pattern as Part 3's Master Horary
    //    Evaluator). Requires analyze5() to have run first in this page
    //    load so this._cachedAnalysisParams is populated.
    // ================================================================

    renderRKEvaluatorUI: function () {
        const options = this.RAHUL_KAUSHIK_HOUSE_SIGNIFICATION_TABLE
            .map(e => `<option value="${e.id}">[#${e.id} H${e.house}] ${e.event}</option>`).join('');
        return `<details style="margin-top:6px;">
                  <summary style="cursor:pointer;color:#C9A8FF;font-size:10.5px;font-weight:bold;">🔎 House Signification Evaluator (406 Events)</summary>
                  <div style="font-size:8.5px;color:var(--muted);margin:4px 0;">Select any event from the full table or type a keyword to check it against the active chart:</div>
                  <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <select id="kpRKEventSelect" style="max-width:320px;background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">${options}</select>
                    <input id="kpRKEventSearch" type="text" placeholder="Or search keyword..." style="width:130px;background:var(--bg3,#1a1a2e);border:1px solid var(--border);color:var(--text);font-size:10px;padding:4px;border-radius:3px;">
                    <button onclick="window.KP_PREDICTION_5.runRKEvaluator()" style="background:#C9A8FF;color:#000;border:none;padding:4px 10px;border-radius:3px;font-size:10px;font-weight:bold;cursor:pointer;">Evaluate</button>
                  </div>
                  <div id="kpRKEvalResult" style="margin-top:8px;"></div>
                </details>`;
    },

    runRKEvaluator: function () {
        const selEl = document.getElementById('kpRKEventSelect');
        const searchEl = document.getElementById('kpRKEventSearch');
        const resultEl = document.getElementById('kpRKEvalResult');
        if (!resultEl || !this._cachedAnalysisParams) return;

        const p = this._cachedAnalysisParams;
        const idOrQuery = (searchEl && searchEl.value.trim().length > 0) ? searchEl.value.trim() : parseInt(selEl.value, 10);
        const evalRes = this.crossCheckRKEvent(idOrQuery, p.ascSid, p.natalPlanets, p.lords);

        if (!evalRes) {
            resultEl.innerHTML = '<div style="font-size:9px;color:#FF4477;">Event not found or could not be evaluated.</div>';
            return;
        }

        resultEl.innerHTML = `<div style="padding:8px;border-left:3px solid ${evalRes.promised ? '#00DD77' : '#FF4477'};background:rgba(201,168,255,.06);">
            <b>${evalRes.entry.event}</b> <span style="font-size:8.5px;color:var(--muted);">(Primary House ${evalRes.primaryHouse}, combination H${evalRes.entry.houses.join(',H')})</span>
            <div style="font-size:9px;color:${evalRes.promised ? '#00DD77' : '#FF4477'};margin-top:4px;">${evalRes.result}</div>
            ${evalRes.entry.condition ? `<div style="font-size:8.5px;color:var(--muted);margin-top:3px;"><b>Source table condition:</b> ${evalRes.entry.condition}</div>` : ''}
            <div style="font-size:8px;color:var(--muted);margin-top:3px;">${evalRes.reference}</div>
        </div>`;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.KP_PREDICTION_5;
}