# Enhanced invitation browser checks

Run Vite and open /tests/stationery.html, then choose Run artwork checks.
The lifecycle cases keep production durations but explicitly finish native animations at their declared deadlines from the parent fixture, avoiding offscreen/background compositor throttling. Use Inspect artwork slowly and the actual invitation for visual timing checks. Coverage includes wedding/reception and missing/invalid parameters; 320x480, 375x667 and 390x1000 layouts; both near and below-viewport destinations; hidden wording and inert controls during the interlude; duplicate/particle cleanup; no automatic scroll; no artwork replay; wheel and keyboard skips; resize; reduced motion; animation and decoding failure; map URLs and music controls.

Inspect artwork slowly stretches only transition animations for visual inspection. No application code is changed by the fixture.

Run /tests/opening.html for the envelope trail, date, flap layering, repeated taps and recovery checks. Run /tests/feature-flags.html for classic/enhanced isolation.

The PNG is flattened, so only its original pixels are masked; there are no separately animated figures. Artwork reveal and hold take 3240ms, settling 700ms, and paper expansion 300ms. The envelope sequence takes approximately 2.6 seconds. Asset readiness is bounded, and failure completes immediately.

Physical Safari/WhatsApp rendering, device orientation and audible music output still require a device check. Browser checks verify controls and layout, not physical audio output.

The enhanced central reveal samples opaque pixels from the unchanged PNG. 190 falling flecks settle onto those points as soft overlapping mask blooms resolve the original image over three seconds. A local canvas is removed before the measured handoff; reduced motion skips it. The longer focal reveal intentionally brings the complete sequence to approximately 6.7 seconds.
