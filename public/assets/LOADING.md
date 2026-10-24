# Invitation loading assets

The invitation uses lossless WebP copies of the original PNG artwork. Dimensions,
alpha and visible RGB pixels were verified against the originals; only RGB values
in fully transparent pixels can differ. Keep the PNG originals as source artwork.
To regenerate a copy with Sharp, use `.webp({ lossless: true, effort: 6 })` without
resizing. Update both CSS and JavaScript references when replacing an asset.

Startup image bytes (uncompressed HTTP response bodies):

| Theme | Previous | Optimized | Reduction |
| --- | ---: | ---: | ---: |
| Light | 13,943,683 | 9,052,974 | 35.1% |
| Dark | 16,567,233 | 9,352,348 | 43.5% |

Dark mode previously downloaded both botanical backgrounds and waited for the dark
background before mounting React and starting the other image preloads. Bootstrap
now starts one shared image-readiness promise while application code and styles
load. React waits for that promise and font readiness before revealing the page.
There is no timeout that reveals an incomplete composition. Existing image-error
and decode-error handling is preserved.

`invitation-fonts.css` is the existing Google Fonts CSS, downloaded with a modern
browser user agent, with URLs replaced by local WOFF2 files. It retains all supplied
character subsets and the original family/style/weight declarations. The 12 unique
files total 313,992 bytes; only subsets needed by the page are requested. Their
licenses are in `fonts/CormorantGaramond-OFL.txt` and `fonts/DMSans-OFL.txt`.
Self-hosting removes the Google Fonts stylesheet-to-font request chain and external
service latency from the readiness gate. The Malayalam font is unchanged.

Transfer savings are measured file sizes, not a guarantee of a particular load
time. Slow connections still need to download all required assets before reveal.
