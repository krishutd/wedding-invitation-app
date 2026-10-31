// This verifies image painting, not Samsung's proprietary forced-dark algorithm.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const side of ['groom', 'bride']) {
    const page = await browser.newPage({ viewport: { width: 375, height: 800 }, colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto(`${process.env.TEST_URL || 'http://127.0.0.1:4175/'}?side=${side}`);
    await page.waitForFunction(() => document.querySelector('.site-shell')?.getAttribute('aria-busy') === 'false');
    for (const selector of ['.couple-calligraphy', '.wax-seal-ganesha']) {
      const info = await page.locator(selector).evaluate(el => {
        const css = getComputedStyle(el);
        const canvas = document.createElement('canvas');
        canvas.width = el.naturalWidth; canvas.height = el.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(el, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let gold = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 240 && Math.abs(pixels[i] - 205) < 3 && Math.abs(pixels[i + 1] - 179) < 3 && Math.abs(pixels[i + 2] - 139) < 3) gold++;
        }
        return { tag: el.tagName, loaded: el.complete && el.naturalWidth > 0, mask: css.maskImage, background: css.backgroundImage, gold };
      });
      assert.equal(info.tag, 'IMG');
      assert.equal(info.loaded, true);
      assert.equal(info.mask, 'none');
      assert.equal(info.background, 'none');
      assert.ok(info.gold > 100, `${selector}: no opaque authored gold pixels`);
    }
    assert.match(await page.locator('.envelope-front').evaluate(el => getComputedStyle(el).backgroundImage), /envelope-dark-surface\.svg/);
    await page.screenshot({ path: resolve(process.env.TEMP, `opening-image-colors-${side}.png`) });
    await page.locator('.envelope-stage').click();
    await page.waitForFunction(() => document.querySelector('#invitation') && !document.querySelector('.intro-screen'));
    console.log(`PASS ${side}: gold image pixels, no CSS masks, surface image, opening transition`);
    await page.close();
  }
} finally { await browser.close(); }
