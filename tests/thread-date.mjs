import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { resolveOpening, isThreadDateEnabled } from '../src/featureFlags.js';
const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const base = process.env.TEST_URL || 'http://127.0.0.1:5176';
try {
  for (const [query, mode, enabled] of [ ['', 'classic', false], ['?opening=enhanced', 'enhanced', false], ['?opening=enhancement', 'enhanced', false], ['?thread=invalid', 'classic', false], ['?thread=choose-date', 'enhanced', true], ['?thread=CHOOSE-DATE', 'enhanced', true], ['?thread=&thread=choose-date', 'classic', false] ]) {
    assert.equal(resolveOpening(query), mode);
    assert.equal(isThreadDateEnabled(query), enabled);
  }
  for (const [width, height, mode] of [[320,480,'normal'], [390,844,'normal'], [375,667,'reduced'], [375,667,'resize'], [375,667,'failure']]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType:'text/css', body:'' }));
    await page.goto(`${base}/?thread=choose-date&invite=wedding`);
    await page.waitForFunction(() => document.querySelector('.envelope-stage')?.disabled === false);
    const date = page.locator('.date-selected');
    const before = await date.boundingBox();
    assert.equal((await date.textContent()).trim(), '19');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (mode === 'failure') await page.evaluate(() => { Element.prototype.animate = () => { throw Error('test'); }; });
    await page.locator('.envelope-stage').evaluate(el => { el.click(); el.click(); });
    if (mode === 'normal') {
      for (const stage of ['drawing', 'looping', 'holding', 'tightening', 'tugging', 'release', 'flap']) {
        await page.waitForFunction(stage => document.querySelector('.opening-composition')?.dataset.stage === stage, stage);
        const after = await date.boundingBox();
        assert.ok(Math.abs(before.x-after.x) < .1 && Math.abs(before.y-after.y) < .1, `Stationary date: ${stage}`);
        if (stage === 'looping') assert.equal(await page.locator('.date-neighbour').first().evaluate(el => getComputedStyle(el).opacity), '1');
        if (stage === 'holding') assert.equal(await page.locator('.date-thread > path').first().evaluate(el => getComputedStyle(el).opacity), '0', 'No connector during heart hold');
        if (stage === 'tugging') {
          assert.equal(await page.locator('.date-neighbour').first().evaluate(el => getComputedStyle(el).opacity), '0');
          assert.equal(await page.locator('.date-month').evaluate(el => getComputedStyle(el).opacity), '1');
          await page.screenshot({ path: resolve(tmpdir(), `thread-date-${width}.png`) });
        }
      }
    }
    if (mode === 'resize') await page.setViewportSize({ width:400, height:700 });
    await page.waitForFunction(() => document.querySelector('#invitation') && !document.querySelector('.intro-screen'), null, { timeout:23000 });
    console.log(`PASS ${width}x${height} ${mode}`);
    await page.close();
  }
  for (const query of ['', '?opening=enhanced', '?opening=enhancement', '?thread=invalid']) {
    const page = await browser.newPage();
    await page.goto(base + '/' + query);
    await page.locator('.envelope-stage').waitFor();
    assert.equal(await page.locator('[data-thread-date]').count(), 0);
    console.log(`PASS existing experience ${query || '(default)'}`);
    await page.close();
  }
} finally { await browser.close(); }
