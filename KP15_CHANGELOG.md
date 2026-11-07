# KP15 — Predictions Workflow + Bhavat Bhava Rotation Fix

## Scope
Rebased on `KP14_AnshPhale_Complete_App.zip`. Only four existing application files were edited:

- `index.html`
- `assets/css/main.css`
- `src/predictions/logic/predictions_ui.js`
- `src/predictions/logic/AI_prediction.js`

## Prediction panel workflow

- Analysis mode and forecast dates are the primary controls; date-step buttons, Tajaka Sahams and Khar/Ashtam settings move into **Advanced timing & chart options**.
- Methods are grouped into **Main analyses** and **Extended research / source libraries**.
- KP results use five stages: **Overview**, **Wealth & career**, **Events & timing**, **Advanced rules**, **References**.
- Each stage contains collapsible analysis modules. All existing KP modules remain in the HTML output, including the Event Library → Event Timing Finder cross-link. The Event Timing Finder is open when its stage is selected.
- Deferred redraw for chart canvases initially hidden in a collapsed KP stage.
- The prediction panel is wider on desktop (up to 610 px), with full-width mobile behavior.
- Default prediction mode is **KP** (previously Gochar).

## Bhavat Bhava correction

- Removed the second, simplified declarations that shadowed the sign-aware `analyzeBhavatBhavam`, `getRotationMapping`, `getRotatedSignificance` and family analysis wrappers.
- Fixed a summary argument mismatch that threw on the canonical rotation implementation.
- Corrected AI input to use **natal D1** (`BIRTH_PLANETS`, `BIRTH_ASC`) instead of a numeric `CURRENT_ASCENDANT`, and to derive planet houses from **natal ascendant + sidereal sign** rather than stale selected-chart house assignments.
- Numeric ascendant input now means a longitude, not an index, and missing ascendants emit an error rather than defaulting silently to Aries.
- Corrected rotation uses inclusive Vedic house counting: a new house `n` based at original house `h` corresponds to natal house `((h + n - 2) % 12) + 1`. This maps H7's rotated H2 to natal H8, H10's Bhavat Bhava to natal H7, etc.
- The AI report now shows natal lagna and an expandable **12-house rotated→natal mapping** for mother, father, spouse and children so the rotation is auditable.

## Validation

- JavaScript syntax passed for both modified logic modules.
- Unit test: all 12 Bhavat Bhava results; all 144 parent/rotated house mappings; natal vs numeric ascendant; planet occupancy even when `planet.house` is intentionally stale.
- `generateReport()` and `generateHTMLReport()` passed with both saved reference charts:
  - **7 Oct 1977, 23:45, Mumbai**: Gemini natal lagna; Sagittarius spouse-rotated lagna; H7→H1; H10→H7.
  - **18 Sep 1981, 01:20, Mumbai**: Gemini natal lagna; Sagittarius spouse-rotated lagna; H7→H1; H10→H7.
- KP workflow unit test preserved all 12 existing report blocks across five panes.
- Focused Chromium `page.set_content()` smoke test passed: mode selector, stage navigation, pane visibility and event-timing disclosure.

## Testing limitation

The environment blocks navigation (`net::ERR_BLOCKED_BY_ADMINISTRATOR`) to local `file://` project pages. Consequently, a complete end-to-end launch of the whole application and full live KP module integration/visual regression test **was not possible**. The focused browser UI test used the actual panel HTML and CSS with representative content, and the JS calculation tests used real chart fixture longitudes. Please smoke-test the full app locally after merging.

## Context

The Vedic northern-chart convention counts houses **anticlockwise**, **inclusive** from the relevant house. Bhavat Bhava is the nth from the nth: natal H2→H3, H4→H7, H7→H1, H10→H7 and H12→H11. This is an astrological interpretive rule, not a scientifically validated predictive method.
