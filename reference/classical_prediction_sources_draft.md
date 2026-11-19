# Draft: Classical Text Prediction Sources

**Status:** Implemented after review. The source selector and chart-specific report are available in the Predictions panel.

## Goal

Add individually selectable classical-text analyses to the existing Predictions panel. Keep the existing date range and Analyze flow, and show each result with its source attribution. The source selector should be part of the panel's existing **Analysis method** dropdown rather than a separate, duplicate control.

## Proposed source choices

The attached PDFs suggest these source options:

| Selector | Markdown source | Prediction topics and cited sections |
|---|---|---|
| Saravali | `saravali-1.md`, `saravali-2.md` | Planet-in-house results and bhava analysis; Vol. I Ch. 8 and 15, Vol. II Ch. 30 |
| Phaladeepika | `bookphd.md` | Bhava analysis and the twelve house results; Ch. 15–16 |
| Laghu Parashari | `booklbph.md` | Functional house lordship, yogas and Vimshottari dasha; Preliminaries, Yogadhyaya and Dasha Phala |
| Brihat Parashara Hora Shastra | `bookbph.md` | House judgement, individual house results and bhava-lord results; Ch. 11–24 |
| Gochar Phaladeepika | `bookgphd.md` | Current transits counted from natal Moon; Ch. 10–22, including transit results at a glance and Vedha |
| Hindu Predictive Astrology · B. V. Raman | `bookpreastro.md` | Natal house judgement and planetary house results; Ch. XIX and XXI |
| Profession from the Position of Planets · R. G. Rao | `bookrgrao.md` | Saturn-centered profession themes from planets with Saturn or in its seventh sign |

The Markdown files are the working source extracts. The report links to the relevant files and identifies the chapter/printed-page ranges available in their contents. The current engine uses concise interpretations, not copied passages; avoid inferring a specific result from a section that does not support it.

## Proposed output

For the selected source, generate concise, chart-specific results from available chart data. Each result should include:

- topic and plain-language prediction, phrased as a traditional indication rather than certainty;
- the chart factors that triggered it (for example, relevant house/lord, planet, dignity, yoga, dasha or transit);
- the source title and precise chapter/verse/page citation, when available;
- a separately labeled **Shloka reference** only when a source verse has been verified.

Do not present generic sample-chart placements as a user's result. Do not invent missing chart facts. Clearly distinguish natal indications from time-specific dasha/transit results, and show an explicit empty/unsupported state if required chart inputs are unavailable.

## Shlokas and references

Keep verse text separate from prediction rules and from generated prose. First inspect and reuse the existing files under `reference/shlokas/` where appropriate; avoid creating duplicate collections. Existing verse entries need to be checked against the attached edition before display: the current files do not consistently provide chapter/verse/page citations, so none should be treated as verified solely because it is already present.

For any verse used in the UI, record separately:

1. text title/edition and volume;
2. chapter and verse number, plus printed page where identifiable;
3. original Sanskrit and transliteration only if checked against the source;
4. a concise translation/meaning, with translator/edition identified if copied;
5. the prediction topic/rule it supports.

Do not add lengthy passages or reproduce book chapters. Prefer short, attributed quotations where permitted; otherwise provide a paraphrase and citation.

## Existing workspace context

- The right-side Predictions panel has an **Analysis method** dropdown (`index.html`, `#predictionModeSel`); it now includes separate choices for all four Markdown sources. The previous `default` flow remains available as **Forecast dashboard**.
- Classical source routing and rendering are in `src/predictions/logic/classical_sources.js` and `src/predictions/logic/predictions_ui.js`.
- The report derives whole-sign houses from the natal ascendant and planetary signs, then shows planetary placements and house-lord connections for BPHS, Phaladeepika, Saravali and B. V. Raman. BPHS includes two additional fifth-lord indications. Laghu Parashari uses the current Vimshottari Mahadasha and its functional lordship; it reports an explicit unavailable state if dasha data is missing. The Gochar Phaladeepika mode uses current transit signs counted from the natal Moon, and R. G. Rao's mode reports broad profession themes from Saturn's sign and its seventh sign.
- Existing notes include `reference/saravali_jaimini_predictions.md`, `reference/gochar_phaladeepika.md`, `reference/laghu_parashari_summary.md`, `reference/brihat_parashara_hora.md`, and `reference/hindu_predictive_astrology_bv_raman.md`.
- Those notes contain claims that need source verification before being used as rules. In particular, do not treat their attribution, terminology, or specific placements as authoritative without checking the attached books.
- Existing shloka collections are indexed in `reference/shlokas/index_shlokas.md`; review and correct/reuse these rather than duplicating them.

## Shloka status

The report keeps shloka references in a separate section. Laghu Parashari includes its Vimshottari method verse; Saravali links its house-results section; BPHS Chapter 24, verse 58 is displayed only when its matching fifth-lord/tenth-house rule is triggered. Phaladeepika’s planet-level verse ranges were checked against an online 1950 edition and are linked per planet. Gochar Phaladeepika’s online scan is linked, but its OCR does not establish a dependable verse number for the Chapter 20 transit-table stanza. The B. V. Raman online scan’s transit chapter gives prose rules without an individual shloka citation; R. G. Rao’s supplied section is also prose-only. Remaining missing citations are visibly tagged **REFERENCE NEEDED — VERIFY**. These references are recorded in `reference/shlokas/classical_prediction_shlokas.md`; unverified legacy verses are not rendered.

## Validation

`tests/classical_sources_test.js` covers house derivation, a BPHS fifth-lord indication, Laghu Parashari period context, source attribution and missing chart inputs.
