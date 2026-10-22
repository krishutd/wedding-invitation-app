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

## Classic and enhanced experience

The default experience is the original app from the base of PR #15. Both the PR's visual redesign and the enhanced date/seal animation are opt-in:

- `?opening=enhanced`: redesigned opening and invitation, including the date-unlock animation.
- `?opening=classic`, no `opening`, or an invalid value: original opening and invitation.
- Values are case-insensitive. The first value wins if the parameter is repeated.

Existing `side` and `invite` selection and their fallback behavior are unchanged. For example:

- `?side=bride&invite=wedding&opening=enhanced`
- `?side=groom&invite=reception&opening=enhanced`
- `?side=bride&invite=reception` (classic)

Selection happens before mounting React and loads only that experience's stylesheet. `src/ClassicApp.jsx` and `src/classic.css` preserve the original implementation from base commit e1ac1e1; `src/App.jsx` and `src/styles.css` contain the enhanced version. When changing shared invitation content in future, update both implementations while this flag exists. Shared artwork and reveal components remain reused.

Run the enhanced animation checks at `/tests/opening.html` and the flag checks at `/tests/feature-flags.html` using the Vite development server. These test pages are not part of the production build.
