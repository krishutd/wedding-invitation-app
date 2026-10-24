# Krishnanand & Archa — Mobile Wedding Invitation

A mobile-first React + Vite wedding invitation prototype inspired by the supplied ivory-and-antique-gold invitation.

## Requirements
- Windows 10/11
- Node.js LTS (includes npm): https://nodejs.org/

## Run locally on Windows
1. Download and extract `wedding-invitation-app.zip`.
2. Open the extracted `wedding-invitation-app` folder.
3. In File Explorer, click the address bar, type `cmd`, and press Enter.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed in the terminal, usually `http://localhost:5173`.

To stop the server, press `Ctrl+C` in the terminal.

## Test on your phone
Your computer and phone should be on the same Wi-Fi network. Run `npm run dev -- --host 0.0.0.0`, find your PC's local IPv4 address using `ipconfig`, then open `http://YOUR-PC-IP:5173` on the phone. Windows Firewall may ask you to allow Node.js on your private network.

## Build for deployment
```bash
npm run build
npm run preview
```
The production website is generated in `dist/`.

## Dark mode feature flag

Add `?theme=dark` to opt into royal burgundy backgrounds with ivory text and gold accents.
It works with either opening experience and all existing invitation parameters:

- `?theme=dark`
- `?theme=dark&side=bride&invite=wedding`
- `?theme=dark&invite=reception`

Omit the flag or use `theme=light` to retain the original light theme. Only `dark`
(case-insensitive) enables it; device appearance settings do not enable the flag.

## Personalize the invitation
Edit the `WEDDING` object near the top of `src/App.jsx`:
- Couple and parents' names and addresses
- Ceremony dates and times
- Venue names and Google Maps links

### Replace childhood photo placeholders
In `src/App.jsx`, find the two `PhotoPlaceholder` components in the `childhood-photos` section. Replace each `<PhotoPlaceholder ... />` with an image, for example:

```jsx
<Reveal delay={0.12}>
  <img className="childhood-photo" src="/assets/krishnanand-childhood.webp" alt="Krishnanand as a child" />
</Reveal>
```

Repeat for Archa with `/assets/archa-childhood.webp`, then add the image files to `public/assets/`. Add this CSS to `src/styles.css`:

```css
.childhood-photo {
  display: block;
  width: 100%;
  aspect-ratio: .78;
  object-fit: cover;
  padding: 7px;
  border: 1px solid #c6ad76;
  background: #e2d3ae;
  box-shadow: 0 8px 20px #59452013;
}
```

### Add background music
Add an MP3 you have permission to use at:
`public/assets/wedding-music.mp3`

The site starts it when the envelope is tapped. If the file is missing, the rest of the invitation still works. There is no in-page player control; guests can adjust their device volume.

### Update the venue QR code
The QR code is the static image at `public/assets/venue-qr.svg` and currently points to the Muhurtham Google Maps URL. It loads locally and does not call a QR service. If you change the Muhurtham `mapsUrl` in `WEDDING`, regenerate and replace this SVG with a QR code for the new URL so the printed code and the directions link stay in sync.

## Hosting on GitHub Pages
This project deploys to GitHub Pages using the workflow in `.github/workflows/pages.yml`. Vite is configured with a relative base path so assets work from the repository's Pages URL. On GitHub Free, the repository must be public for Pages to publish; private repository Pages requires a paid plan.

## Notes
- The site is a static front-end prototype; RSVP submissions and private guest-specific links are not implemented.
- Fonts load from Google Fonts and need an internet connection. The QR image is stored locally.
- The Radha–Krishna artwork is stored as a transparent PNG at `public/assets/radha-krishna-silhouette.png` and reveals with an animation when it enters view.
- The default Google Maps searches are based on the venue names from the supplied reference. Verify the exact pins before sharing the final invitation.

## Opening experience

The enhanced invitation and connected thread opening are permanent. The thread forms a heart around the selected date, holds, and sends a tug back to release the seal. The date remains stationary. Wedding links select January 19; reception links select January 21. Enhanced music plays after the opening tap.

The obsolete `opening` and `thread` parameters are ignored, including in previously shared links. `side`, `invite`, and `theme` retain their existing behavior.

- `?side=bride&invite=wedding`
- `?side=groom&invite=reception&theme=dark`

Run `node tests/thread-date.mjs [directory-containing-playwright]` against Vite (`TEST_URL` defaults to `http://127.0.0.1:5176`). Checks cover the stationary date, sequence stages, mobile overflow, reduced motion, resize, animation failure, repeated taps, and obsolete parameter handling.

Run the opening checks at `/tests/opening.html` and parameter checks at `/tests/feature-flags.html`.

### Verify deployed artwork locally

After building, run `node tests/serve-production.mjs`, then open `http://127.0.0.1:4174/tests/production-assets.html`. This serves the compiled app under `/wedding-invitation-app/`, matching GitHub Pages, and verifies decoded background, paper, and overlay images for light and dark themes. Runtime asset URLs are made absolute in `src/assets.js` before being passed to CSS custom properties; this prevents built stylesheets from requesting `assets/assets/` paths.
