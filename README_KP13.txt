KP Part 13 — validated KP significators and Step 2 Step display repair

INPUT: html_node_review2(1).zip plus previous KP12 patch.
DELIVERY: complete project ZIP and smaller changed-file patch ZIP.

INSTALL: Extract the full project ZIP as a fresh directory, or overlay the
changed-file patch onto the SAME project tree, preserving src/ and assets/.
The patch includes KP12 (required by KP13) and does not delete your other files.

TO MATCH THE TWO REFERENCE IMAGES: choose Birth Details:
- 18 Sep 1981, 01:20 (24h), Mumbai, 19.076 N / 72.8777 E, UTC +5:30.
- 7 Oct 1977, 23:45 (24h), Mumbai, same coordinates and timezone.
- Choose Krishnamurti (KP) ayanamsa and the Swiss Ephemeris option.
- Keep natal D1 selected. The two images are KP, not Lahiri.

Go to Dasha Explorer and Predictions / KP. New Part13 shows the
nine-planet table, four-grade evidence, rule-based event-promise flags,
and illustrative Vimshottari MD/AD windows. The older Part12 panel remains
available. Legacy KP logic gets corrected Placidus/planet-number semantics.

Step 2 Step: render Varshaphala, use Select Year -> View, then check the
annual chart, 12 monthly returns and the Sudarshan combined + detail charts.
The Tajika Year-Lord formula is still a heuristic; not full classical
Panchavargiya Bala. A full browser visual smoke test is still necessary.

TESTS (requires Node.js):
  node tests/kp13_verify.js
  node tests/kp13_integration_test.js
  node tests/dasha_reference.js
  node tests/event_windows_reference.js
  node tests/varsha_numeric_test.js
  node tests/sudarshan_draw_test.js

See KP13_validation_report.md for source image data, every planetary number,
Dasha dates, limitations, and the methodology sources.

No chart demonstrates actual marriage, infidelity, criminality, illness,
or guaranteed wealth. Interpret these rule matches as non-evidentiary symbols.
