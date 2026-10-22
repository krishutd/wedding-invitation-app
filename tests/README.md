# Opening sequence browser checks

Start the Vite dev server and open `/tests/opening.html`, then choose **Run opening checks**. The fixtures are development-only and are not included in the production build.

Checks cover wedding/reception, empty and invalid invitation parameters, date rows, a 320 x 480 viewport, early/repeated activation, resize interruption, an unavailable animation API, removal of opening elements, event cards, and final scrolling. The reduced-motion fixture simulates the JavaScript media preference before mounting React; it does not change the host OS setting.

Also checked manually: keyboard Enter activation, reception/wedding invitation content, music toggle, and scrolling. Actual WhatsApp/iOS/Android audio autoplay policy and physical orientation changes need a device check.

The normal-flow cases also verify that the heart stays undrawn until activation, neighbours remain visible during drawing, and the slowed sequence reaches a distinct reading pause before revealing the invitation directly. The full sequence now lasts about 14 seconds, with a 17-second recovery watchdog.

The thread path is checked for an open 310-degree sweep outside the measured seal before it departs toward the date. The sweep and departure draw continuously over 2.7 seconds without pausing at their join.


The moving thread is limited to the measured heart perimeter, with decreasing opacity along its tail. Checks verify its length and opacity falloff; the remaining connector is withdrawn while the heart draws.
