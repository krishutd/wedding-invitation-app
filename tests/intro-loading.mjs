// Run against tests/serve-production.mjs. Optional argument: directory containing playwright.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:4174/wedding-invitation-app/';
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || undefined });
const check = (value, message) => { if (!value) throw Error(message); };
try {
  for (const mode of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 }, colorScheme: mode, reducedMotion: mode === 'dark' ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => console.error(error.message));
    let releaseImage;
    const imageGate = new Promise(resolve => { releaseImage = resolve; });
    await page.route('**/ganesha-seal-gold.svg', async route => {
      await imageGate;
      await route.continue();
    });
    let releaseBackground;
    const backgroundGate = new Promise(resolve => { releaseBackground = resolve; });
    await page.route('**/envelope-botanical-background-dark.webp', async route => {
      await backgroundGate;
      await route.continue();
    });
    await page.addInitScript(() => {
      const fontReady = document.fonts.ready;
      const fontGate = new Promise(resolve => { window.releaseFonts = resolve; });
      Object.defineProperty(document.fonts, 'ready', { get: () => Promise.all([fontReady, fontGate]) });
      const decode = Image.prototype.decode;
      const decodeGate = new Promise(resolve => { window.releaseDecode = resolve; });
      Image.prototype.decode = async function () {
        await decode.call(this);
        if (this.src.includes('ganesha-seal-gold')) {
          window.sealDecoded = true;
          await decodeGate;
        }
      };
    });
    await page.goto(`${base}?i=4083fa314b9e&theme=${mode}`, { waitUntil: 'domcontentloaded' });
    const shell = page.locator('.site-shell');
    await shell.waitFor({ state: 'attached' });
    const indicator = page.getByRole('status');
    check(await indicator.isVisible(), `${mode}: loading indicator missing`);
    check(await indicator.getAttribute('aria-label') === 'Loading invitation', `${mode}: accessible loading label missing`);
    check(await indicator.evaluate(el => getComputedStyle(el).backgroundColor) === 'rgb(81, 28, 37)', `${mode}: wrong loading palette`);
    check(await page.locator('.invitation-loading-orbit').evaluate(el => getComputedStyle(el).animationName) === (mode === 'dark' ? 'none' : 'invitation-loading-turn'), `${mode}: motion preference ignored`);
    const hidden = () => page.locator('.intro-screen').evaluate(el => getComputedStyle(el).visibility === 'hidden');
    check(await hidden(), `${mode}: partial envelope visible during image download`);
    {
      check(await shell.evaluate(el => getComputedStyle(el, '::before').visibility === 'hidden'), 'Background visible early');
      check(await page.locator('.envelope-stage').isDisabled(), 'Envelope interactive while loading');
    }
    releaseImage();
    await page.waitForFunction(() => window.sealDecoded);
    check(await hidden(), `${mode}: envelope visible before decoding finishes`);
    await page.evaluate(() => window.releaseDecode());
    check(await hidden(), `${mode}: envelope visible before fonts finish`);
    await page.evaluate(() => window.releaseFonts());
    check(await hidden(), `${mode}: envelope visible before theme background finishes`);
    check(await indicator.isVisible(), `${mode}: loading indicator disappeared early`);
    releaseBackground();
    await page.waitForFunction(() => !document.querySelector('.site-shell').classList.contains('is-loading'));
    await page.locator('.intro-screen').waitFor({ state: 'visible' });
    check(await shell.getAttribute('aria-busy') === 'false', `${mode}: busy state not cleared`);
    await indicator.waitFor({ state: 'detached' });
    for (const image of await page.locator('.wax-seal img').all()) {
      check(await image.evaluate(el => el.complete && el.naturalWidth > 0), `${mode}: missing seal artwork`);
    }
    check(!(await page.locator('.envelope-stage').isDisabled()), 'Envelope still disabled');
    check(!requests.some(url => /fonts\.(googleapis|gstatic)\.com/.test(url)), 'External font dependency');
    check(!requests.some(url => url.endsWith('/envelope-botanical-background.webp')), 'Unused light background downloaded');
    console.log(`PASS ${mode}: delayed download, decoding and fonts; complete reveal`);
    await context.close();
  }
  // Verify real font downloads as well as the synthetic FontFaceSet readiness gate.
  const context = await browser.newContext();
  const page = await context.newPage();
  let releaseFonts;
  const fontsGate = new Promise(resolve => { releaseFonts = resolve; });
  const fontRequested = page.waitForRequest(request => request.url().endsWith('.woff2'));
  await page.route('**/*.woff2', async route => {
    await fontsGate;
    await route.continue();
  });
  await page.goto(`${base}?i=4083fa314b9e`, { waitUntil: 'domcontentloaded' });
  await fontRequested;
  await page.evaluate(async () => {
    await Promise.all(performance.getEntriesByType('resource')
      .filter(entry => entry.name.endsWith('.webp'))
      .map(async entry => { const image = new Image(); image.src = entry.name; await image.decode(); }));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  check(await page.locator('.site-shell').evaluate(el => el.classList.contains('is-loading')), 'Envelope visible before local fonts download');
  releaseFonts();
  await page.waitForFunction(() => document.querySelector('.site-shell')?.getAttribute('aria-busy') === 'false');
  console.log('PASS actual local font download gate');
  await context.close();
} finally {
  await browser.close();
}
