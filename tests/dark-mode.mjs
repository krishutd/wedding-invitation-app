// Run with a directory containing Playwright as the optional first argument.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { resolveTheme } from '../src/featureFlags.js';

const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:5177';
for (const [query, theme] of [['', 'light'], ['?theme=dark', 'dark'], ['?theme=DARK', 'dark'], ['?theme=light', 'light'], ['?theme=true', 'light'], ['?theme=&theme=dark', 'light']]) {
  assert.equal(resolveTheme(query), theme);
}
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  for (const opening of ['']) {
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: width === 375 ? 'reduce' : 'no-preference', colorScheme: 'dark' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
      await page.goto(`${base}/?theme=dark${opening}&side=bride&invite=reception`);
      await page.waitForFunction(() => document.querySelector('.site-shell')?.getAttribute('aria-busy') === 'false');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#511C25');
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
      console.log(`PASS dark ${opening || 'enhanced'} ${width}px`);
    }
  }
  for (const query of ['', '?theme=invalid', '?opening=enhanced']) {
    const page = await browser.newPage({ colorScheme: 'dark' });
    await page.goto(base + '/' + query);
    await page.locator('.site-shell').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).colorScheme), 'light only');
    await page.close();
    console.log(`PASS light ${query || 'default'} under dark OS preference`);
  }
} finally {
  await browser.close();
}
