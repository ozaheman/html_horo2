# KP16 — Step-by-Step chart rendering and Tattva analysis

## Changes

1. **Chart rendering bug**: `STEP2STEP_PANCHANG.analyze()` generated chart canvases in returned HTML but scheduled drawing immediately with timers, while `updatePredictionsDisplay()` still awaited other steps before assigning `content.innerHTML`. The render could expire before canvases existed. It now queues the five key charts and 12 rotated chart descriptors. The prediction dashboard draws them synchronously after `content.innerHTML` is committed.
2. **D10 (Dasamsa)**: The old `(sidereal longitude * 10) % 360` mapping was replaced with the Parashari odd/even-sign rule, using ten 3° subdivisions. Odd signs begin from themselves; even signs begin at their ninth sign. All D10 planet and ascendant signs and houses now derive from the same function.
3. **Indu Lagna**: Replaced a sum of sign-lord ecliptic longitudes with ninth-from-Lagna and ninth-from-Moon planetary Kala values (Sun 30, Moon 16, Mars 6, Mercury 8, Jupiter 10, Venus 12, Saturn 1), remainder mod 12, counted inclusively from the Moon. Result is sign-based; 0° is a display anchor rather than a physical degree.
4. **Arudha Lagna**: Resolve a planet sign from its longitude when a planet record does not contain `.sn`.
5. **Tattva analysis**: Added collapsible nine-graha report with graha tattva, sign/rashi tattva, whole-sign natal house, nakshatra, Pada, Nakshatra lord and sub lord, and chart-level element distribution. Explicitly labels the interpretation traditional and context-dependent; no diagnosis or guaranteed outcome.

## Source separation

The uploaded Nitin Kashyap Q&A transcript specifically recommends keeping basic chart interpretation grounded in sign, planet, dignity and house significations, with Nakshatra as an additional layer; it also gives the example of a fire-element Mars in Leo. The specific graha-element mapping in KP16 is an *implementation convention* (not a verbatim transcription of a complete nine-graha element table from the Q&A), and variations between traditions are acknowledged.

For the D10 odd/even-sign method and Indu Kala calculation, see:
- https://epandit.in/en/learn/varga/dashamsa-d10
- https://panchangbodh.com/indu-lagna-calculator

## Validation

- `node --check` passed for `src/core/step2step_panchang.js` and `src/predictions/logic/predictions_ui.js`.
- D10 checks passed for Aries and Taurus first/second divisions, Taurus last division and Pisces last division.
- Indu worked case passed: Cancer Ascendant, Virgo Moon -> Jupiter 10 Kala + Venus 12 Kala = 22 -> remainder 10 -> Gemini.
- Chart drawing occurs in source code after DOM assignment.
- All nine planet names, nakshatra and element table were produced in an isolated JS test.
- **Limitation:** Full browser navigation was blocked by the execution environment's administrator. Actual application UI visual verification on a loaded natal chart was not possible; screenshots show the old blank cards, not a post-fix screenshot.

## Installation

The full ZIP is self-contained as the previously supplied KP15 directory plus the two updated JavaScript files. The patch ZIP contains only those two files, with paths relative to the original project root. Preserve original directory structure. Reload the page with a cache-bypassing refresh after replacing the scripts.
