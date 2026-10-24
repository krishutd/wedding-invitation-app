# Enhanced invitation browser checks

For the initial envelope reveal, build the site, run `node tests/serve-production.mjs`, then run `node tests/intro-loading.mjs` with Playwright installed (or pass its node_modules directory as the first argument). Set `BROWSER_CHANNEL=msedge` to use installed Edge. This checks both opening variants at the GitHub Pages project path with a delayed image response, delayed image decoding, and delayed font readiness. The composition stays hidden through all three stages, including the enhanced fixed background, then appears with its seal artwork loaded and its busy state cleared.

Run Vite and open /tests/stationery.html, then choose Run artwork checks.
The lifecycle cases keep production durations but finish native animations at their declared deadlines from the parent fixture to avoid background compositor throttling. Use Inspect artwork slowly and the real invitation for visual timing checks.

Coverage includes wedding/reception and missing/invalid parameters; 320x480, 375x667 and 390x1000 layouts; near and below-viewport destinations; concealed wording and inert controls; continuous artwork movement without a fade; duplicate/particle cleanup; no automatic scroll; no artwork replay; wheel and keyboard skips; resize; reduced motion; animation, canvas and decoding failure; map URLs and music controls.

Run /tests/opening.html for the envelope trail, date, flap layering, repeated taps and recovery checks. Run /tests/feature-flags.html for classic/enhanced isolation.

The enhanced timeline releases a strand from the opening seam (1000ms), then draws one circular ring with an orbiting golden segment while the original artwork forms inside it (3200ms). Delicate gold dust drifts inward from the ring. Two strands leave the ring directly sideways (400ms), then trace complementary halves of the frame perimeter (2000ms). The full border phase lasts 2400ms; no arches cross the wording, and the leafy corner decorations are removed. The permanent geometric frame takes over as tracing completes. The border remains concealed before tracing. Date-to-seal return is 1000ms, seal release 700ms and flap opening 1000ms; the approved 1350ms thread-to-date and 1050ms heart timings remain unchanged.

The original PNG stays unchanged. Its local canvas reveal runs concurrently with the circular thread, without a separate meeting or hold phase. Circle/dust rendering, hidden border, concurrent artwork reveal and outgoing frame geometry are included in the lifecycle checks.

The moving date thread remains limited to the measured heart perimeter, with decreasing opacity along its tail. The local opaque envelope-pocket fix is preserved and checked. The older /tests/envelope-inspection.html fixture remains available for layer inspection, but its insert/reading controls refer to the previous sequence; the new opening releases light directly from the flap.

The production build and browser lifecycle checks were run after this redesign. The fixture explicitly finishes native animations at their declared deadlines; it checks lifecycle and geometry rather than compositor smoothness. Physical Safari/WhatsApp rendering, orientation and audible music output also require a device check.

Diary ink reveal: run `node tests/diary-ink.mjs` with Vite on port 5177 (override with TEST_URL). Pass a Playwright node_modules directory as the first argument if needed. Checks cover StrictMode cleanup, below-fold waiting, scroll reveal, no replay, keyboard-focus visibility and reduced motion. Both invitation variants share this effect; the enhanced version waits until the artwork handoff completes.
