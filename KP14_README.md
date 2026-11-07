# KP 249-Division Ansh Phale — Part 14 validation and application update

## Scope

Updated the user's Vedic Jyotish web application using photographed Marathi *Jyotish Sobati*, "Krishnamurti Paddhatinusaar Ansh Phale" (कृष्णमूर्ती पद्धतीनुसार अंश फळे) reference pages. No live medical, character or profession conclusions are asserted: these are traditional historical book associations and **not reliable medical diagnoses or personal predictions**.

### Mapping from the source, p. 258

| Source field | Natal chart point | Application location |
|---|---|---|
| स्वभाव / गुण (nature / qualities) | 1st cusp / Lagna | DISEASES and BUSINESS |
| रोग (diseases / health references) | 6th house cusp | DISEASES |
| व्यवसाय (profession) | 10th house cusp | BUSINESS |
| भावी जोडीदाराचा व्यवसाय (prospective spouse profession) | 4th house cusp | BUSINESS |

**Important:** these are lookups by the exact **KP 249 sub-division number** of the sidereal degree, not arbitrary matching by zodiac sign or planet name. For the 6th, 10th and 4th cusps, the reader calls Part 12's native Placidus cusp calculator. No equal-house fallback is used. The book information is not a medical diagnosis, professional assessment or dependable prediction.

## Photographed content added

| Sign | KP row numbers | Page | Status |
|---|---|---:|---|
| Mesha / मेष / Aries | 1–22 | 259 | 22 photographed entries, selected legible phrases |
| Mithun / मिथुन / Gemini | 42–62 | 261 | 21 photographed entries, selected legible phrases |
| Simha / सिंह / Leo | 84–105 | 263 | 22 photographed entries, selected legible phrases |
| Tula / तूळ / Libra | 125–145 | 265 | 21 photographed entries, selected legible phrases |

These 86 entries are added to **the existing 120 entries** in KP Part 11 from pages 260, 262, 264, 266, 268 and 270. New total = **206 of 249** KP divisions (83%). Newly entered text retains selected Marathi terms visible in the photographs, not a claim of full literal transcription; the original book should be consulted for proofreading.

The photographs **do not include** p.267 (Dhanu/Sagittarius: rows 167–188) or p.269 (Kumbh/Aquarius: rows 208–228). Those 43 rows retain their mathematically correct sign-star-sub divisions but have no invented nature, disease or profession text. The UI explicitly says when an entry is missing.

## Changes to files

- `src/predictions/logic/KP_prediction_14_ansh.js` — new source-photo text entries and provenance; book reader with Placidus-only cusps; separate Diseases and Business components; coverage/missing-page reporting and safe HTML escaping.
- `index.html` — loads the new Part 14 module after Parts 11–13 and before the app's main script.
- `assets/js/main.js` — shows the nature/health reference at the top of DISEASES when it opens and after Generate; shows nature/10th/4th profession reference in BUSINESS without deleting existing analyses.
- Other application modules, Varshaphala and Sudarshan Chakra remain as in the supplied KP13 baseline (not changed in this part).

## Validation

- JavaScript syntax checks: `node --check` for all changed JS files **PASS**.
- `build249Table()` returns 249 consecutive, correctly bounded divisions **PASS**.
- All 86 new entries have three fields and their expected source-page ranges **PASS**.
- Combined book coverage 206/249; only two missing source-photo ranges (43 rows) **PASS**.
- Missing-image entry renders a clear **unavailable** state; it does not borrow the neighboring row or fabricate text **PASS**.
- Missing/mismatched Placidus cusps block disease/profession row conclusions rather than silently reverting to equal-house cusps **PASS**.
- HTML strings for both tabs render and include the expected exact row numbers **PASS** with deterministic fixture cusps.
- Runtime visual browser inspection could **not** be completed: Chromium navigation was denied by `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Browser panel appearance and user interactions should be smoke-tested on the user's local app.

## Cross-check using the previously supplied Mumbai KP cusps

| Chart | Lagna nature row | 6th cusp disease-reference row | 10th cusp profession-reference row | 4th cusp spouse-profession row |
|---|---:|---:|---:|---:|
| 18 September 1981, 01:20, Mumbai | 56, Gemini, p.261 | 160, Scorpio, p.266 | 239, Pisces, p.270 | 115, Virgo, p.264 |
| 7 October 1977, 23:45, Mumbai | 52, Gemini, p.261 | 157, Scorpio, p.266 | 235, Pisces, p.270 | 111, Virgo, p.264 |

These are deterministic **reference-row lookups**, *not* individual medical, personality or employment findings. The charts use the longitudes from the screenshots sent in the previous turn, and the displayed degree is provided for audit.

## How to use

1. Unzip the **Complete Application** ZIP, or merge the **Update-only Patch** into the installed KP13 application while preserving its directory structure.
2. Open the application and enter/confirm birth details using the natal D1 chart.
3. Open **DISEASES**. The KP 249 section shows Lagna *स्वभाव / गुण* and 6th-cusp *रोग* associations. Click **Generate** for the existing disease analysis; KP book reference remains at the top.
4. Open **BUSINESS**. The KP 249 section shows the 10th-cusp *व्यवसाय*, 4th-cusp spouse-profession and Lagna nature reference, followed by existing business analyses.
5. Check the row number and source-page label against the uploaded book photo. Do not use these lists as actual health or career predictions.

## Limitations and next source material

- Page 267 (Sagittarius) and p.269 (Aquarius) are needed to complete all 249 division texts.
- Newly transcribed lines are selected readable keywords, not exhaustive or independently proofread transcriptions.
- The 249-degree table depends on the user's chosen ayanamsa and exact recorded birth time; true cusp values can change by minutes of birth time.
