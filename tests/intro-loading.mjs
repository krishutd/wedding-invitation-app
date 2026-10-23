// Run against tests/serve-production.mjs. Optional argument: directory containing playwright.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || undefined });
const check = (value, message) => { if (!value) throw Error(message); };
try {
  for (const mode of ['classic', 'enhanced']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    page.on('pageerror', error => console.error(error.message));
    // Keep the test independent of the external Google Fonts service.
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
    let releaseImage;
    const imageGate = new Promise(resolve => { releaseImage = resolve; });
    await page.route('**/ganesha-seal-engraving.png', async route => {
      await imageGate;
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
        if (this.src.includes('ganesha-seal-engraving')) {
          window.sealDecoded = true;
          await decodeGate;
        }
      };
    });
    await page.goto(`http://127.0.0.1:4174/wedding-invitation-app/?opening=${mode}`, { waitUntil: 'domcontentloaded' });
    const shell = page.locator('.site-shell');
    await shell.waitFor({ state: 'attached' });
    const hidden = () => page.locator('.intro-screen').evaluate(el => getComputedStyle(el).visibility === 'hidden');
    check(await hidden(), `${mode}: partial envelope visible during image download`);
    if (mode === 'enhanced') {
      check(await shell.evaluate(el => getComputedStyle(el, '::before').visibility === 'hidden'), 'Background visible early');
      check(await page.locator('.envelope-stage').isDisabled(), 'Envelope interactive while loading');
    }
    releaseImage();
    await page.waitForFunction(() => window.sealDecoded);
    check(await hidden(), `${mode}: envelope visible before decoding finishes`);
    await page.evaluate(() => window.releaseDecode());
    check(await hidden(), `${mode}: envelope visible before fonts finish`);
    await page.evaluate(() => window.releaseFonts());
    await page.waitForFunction(() => !document.querySelector('.site-shell').classList.contains('is-loading'));
    check(!(await hidden()), `${mode}: envelope did not reveal`);
    check(await shell.getAttribute('aria-busy') === 'false', `${mode}: busy state not cleared`);
    for (const image of await page.locator('.wax-seal img').all()) {
      check(await image.evaluate(el => el.complete && el.naturalWidth > 0), `${mode}: missing seal artwork`);
    }
    if (mode === 'enhanced') check(!(await page.locator('.envelope-stage').isDisabled()), 'Envelope still disabled');
    console.log(`PASS ${mode}: delayed download, decoding and fonts; complete reveal`);
    await context.close();
  }
} finally {
  await browser.close();
}
