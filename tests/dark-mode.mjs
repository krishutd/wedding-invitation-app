// Run with a directory containing Playwright as the optional first argument.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { resolveTheme } from '../src/featureFlags.js';

const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:5177';
for (const query of ['', '?theme=dark', '?theme=DARK', '?theme=light', '?theme=true', '?theme=&theme=dark']) {
  assert.equal(resolveTheme(query), 'dark');
}
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: width === 375 ? 'reduce' : 'no-preference', colorScheme });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
      await page.goto(`${base}/?i=c12fbfce202e`);
      await page.waitForFunction(() => document.querySelector('.site-shell')?.getAttribute('aria-busy') === 'false');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#511C25');
      assert.equal(await page.locator('meta[name="color-scheme"]').getAttribute('content'), 'dark');
      const palette = () => page.evaluate(() => ['html', 'body', '#root', '.site-shell', '.envelope-front', '.couple-calligraphy', '.music-toggle'].map(selector => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const css = getComputedStyle(el);
        return [css.color, css.backgroundColor, css.backgroundImage, css.colorScheme];
      }));
      const originalPalette = await palette();
      await page.emulateMedia({ colorScheme: colorScheme === 'dark' ? 'light' : 'dark' });
      assert.deepEqual(await palette(), originalPalette, 'Palette changed when OS preference changed');
      await page.emulateMedia({ colorScheme });
      const backdrop = () => page.evaluate(() => {
        return getComputedStyle(document.querySelector('.site-shell'), '::before').backgroundImage;
      });
      assert.match(await backdrop(), /envelope-botanical-background-dark\.webp/);
      assert.equal(await page.evaluate(async () => {
        const image = new Image();
        image.src = document.querySelector('link[rel="preload"][href*="background-dark"]').href;
        await image.decode();
        return image.naturalWidth > 0;
      }), true);
      await page.waitForFunction(() => ['.envelope', '.date-row'].every(selector => {
        const el = document.querySelector(selector);
        return !el || Number(getComputedStyle(el).opacity) >= 0.99;
      }));
      await page.screenshot({ path: resolve(process.env.TEMP, `dark-intro-${'enhanced'}-${width}.png`) });
      await page.locator('.envelope-stage').click();
      await page.waitForFunction(() => document.querySelector('#invitation') && !document.querySelector('.intro-screen'), null, { timeout: 25000 });
      assert.match(await page.locator('.site-shell').evaluate(el => getComputedStyle(el, '::before').backgroundImage), /envelope-botanical-background-dark\.webp/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: resolve(process.env.TEMP, `dark-invite-enhanced-${width}.png`), fullPage: true });
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS dark design with ${colorScheme} OS preference ${width}px`);
    }
  }
  for (const colorScheme of ['light', 'dark']) {
    const page = await browser.newPage({ javaScriptEnabled: false, colorScheme });
    await page.goto(base + '/');
    assert.equal(await page.locator('.invitation-loading').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(81, 28, 37)');
    assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'dark only');
    await page.close();
    console.log(`PASS pre-JavaScript dark loading screen with ${colorScheme} OS preference`);
  }
  for (const query of ['', '?theme=dark', '?theme=light', '?theme=invalid', '?opening=enhanced']) {
    const page = await browser.newPage({ colorScheme: 'dark' });
    await page.goto(base + '/?i=4083fa314b9e&' + query.replace(/^\?/, ''));
    await page.locator('.site-shell').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).colorScheme), 'dark only');
    await page.close();
    console.log(`PASS fixed dark ${query || 'default'} under dark OS preference`);
  }
} finally {
  await browser.close();
}
