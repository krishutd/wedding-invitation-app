# Enhanced invitation browser checks

Opening image colors: `node tests/opening-image-colors.mjs` (optional Playwright node_modules path) checks both name orders, decoded gold pixels, absence of CSS masks on the opening names/seal, the image-backed envelope surface, and the opening transition. Defaults to a production preview on port 4175; override with `TEST_URL`. This is not Samsung forced-dark emulation. Retest on a physical Samsung browser with forced-dark enabled, comparing name and seal contrast, envelope color, and the animated flap.

The standalone gold SVGs embed the original raster alpha and tint it inside the image, avoiding the CSS mask fill that Samsung recolored in the reported screenshots. Regenerate them with `node scripts/build-opening-art.mjs` after changing the source art. Original PNG/WebP assets remain unchanged. The envelope surface is a standalone SVG as well. These changes cannot prevent browser-wide image/page dimming.

Invitation codes: run `node tests/invitation-links.mjs` against the production server, with the optional Playwright node_modules directory argument. It checks all six family/event combinations in both coded and legacy URLs, code precedence, legacy casing/defaults, and invalid/duplicate codes. Without a code, legacy parameters and their original defaults still work. Fixtures also use the stable codes listed in `INVITATION_LINKS.md`.

For the initial envelope reveal, build the site, run `node tests/serve-production.mjs`, then run `node tests/intro-loading.mjs` with Playwright installed (or pass its node_modules directory as the first argument). Set `BROWSER_CHANNEL=msedge` to use installed Edge. This checks the permanent opening at the GitHub Pages project path with a delayed image response, delayed image decoding, and delayed font readiness. The composition stays hidden through all three stages, including the enhanced fixed background, then appears with its seal artwork loaded and its busy state cleared.

Run Vite and open /tests/stationery.html, then choose Run artwork checks.
The lifecycle cases keep production durations but finish native animations at their declared deadlines from the parent fixture to avoid background compositor throttling. Use Inspect artwork slowly and the real invitation for visual timing checks.

Coverage includes wedding/reception and missing/invalid parameters; 320x480, 375x667 and 390x1000 layouts; near and below-viewport destinations; concealed wording and inert controls; continuous artwork movement without a fade; duplicate/particle cleanup; no automatic scroll; no artwork replay; wheel and keyboard skips; resize; reduced motion; animation, canvas and decoding failure; map URLs and music controls.

Run /tests/opening.html for the envelope trail, date, flap layering, repeated taps and recovery checks. Run /tests/feature-flags.html for permanent opening and invitation parameter checks.

The enhanced timeline releases a strand from the opening seam (1000ms), then draws one circular ring with an orbiting golden segment while the original artwork forms inside it (3200ms). Delicate gold dust drifts inward from the ring. Two strands leave the ring directly sideways (400ms), then trace complementary halves of the frame perimeter (2000ms). The full border phase lasts 2400ms; no arches cross the wording, and the leafy corner decorations are removed. The permanent geometric frame takes over as tracing completes. The border remains concealed before tracing. The date remains stationary; seal release is 700ms and flap opening 1000ms; the approved 1350ms thread-to-date and 1050ms heart timings remain unchanged.

The original PNG stays unchanged. Its local canvas reveal runs concurrently with the circular thread, without a separate meeting or hold phase. Circle/dust rendering, hidden border, concurrent artwork reveal and outgoing frame geometry are included in the lifecycle checks.

The moving date thread remains limited to the measured heart perimeter, with decreasing opacity along its tail. The local opaque envelope-pocket fix is preserved and checked. The older /tests/envelope-inspection.html fixture remains available for layer inspection, but its insert/reading controls refer to the previous sequence; the new opening releases light directly from the flap.

The production build and browser lifecycle checks were run after this redesign. The fixture explicitly finishes native animations at their declared deadlines; it checks lifecycle and geometry rather than compositor smoothness. Physical Safari/WhatsApp rendering, orientation and audible music output also require a device check.

Diary ink reveal: run `node tests/diary-ink.mjs` with Vite on port 5177 (override with TEST_URL). Pass a Playwright node_modules directory as the first argument if needed. Checks cover StrictMode cleanup, below-fold waiting, scroll reveal, no replay, keyboard-focus visibility and reduced motion. The invitation waits until the artwork handoff completes.

Loading performance: the intro check covers both OS color preferences with the permanent dark palette, delayed background completion, real local font downloads, no external font requests, and no unused light background request. See public/assets/LOADING.md for measured transfer savings and asset provenance.

The loading indicator checks cover the fixed dark palette, visibility throughout delayed assets, removal on readiness, and reduced motion. The inline HTML/SVG indicator has no image or web font dependencies and is visible before the application JavaScript loads.

Permanent dark design: run `node tests/dark-mode.mjs` with the optional Playwright node_modules path. Set `TEST_URL=http://127.0.0.1:4174/wedding-invitation-app` to test the production server. It checks mobile and desktop opening/reveal, both OS preferences, live preference changes, pre-JavaScript loading colors, and legacy theme parameters (all now use dark). The HTML advertises `dark` and CSS uses `only dark` to request the authored palette without automatic recoloring. The old ivory dark-mode media override is removed.

Device verification still required: on Samsung Internet, compare the envelope and invitation in phone light and dark modes, including its website-dark-theme and forced-dark settings. Desktop OS-preference emulation does not reproduce Samsung's proprietary forced-dark algorithm. Browser settings that forcibly override author colors cannot be universally disabled by website CSS; do not treat this suite as a guarantee for those settings. See Samsung's [dark-mode explanation](https://developer.samsung.com/browser/blog/en/2020/12/15/dark-mode-in-samsung-internet).
