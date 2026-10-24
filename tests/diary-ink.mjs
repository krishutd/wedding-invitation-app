import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const page = await browser.newPage({ reducedMotion, viewport: { width: 390, height: 700 } });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5177');
    await page.evaluate(async () => {
      const { default: React } = await import('/node_modules/.vite/deps/react.js');
      const { default: ReactDOM } = await import('/node_modules/.vite/deps/react-dom_client.js');
      const { default: Reveal } = await import('/src/InvitationPageReveal.jsx');
      document.body.innerHTML = '<div id="fixture"></div>';
      const h = React.createElement;
      const root = ReactDOM.createRoot(document.getElementById('fixture'));
      window.renderDiary = active => root.render(h(React.StrictMode, null,
        h('section', { className: 'invitation-section' }, h(Reveal, { active }),
          h('p', { className: 'family-names' }, 'Ink emerges on the page'),
          h('a', { className: 'map-link', href: '#venue' }, 'Open in Maps'),
          h('div', { style: { height: 1100 } }),
          h('p', { className: 'presence-note', id: 'venue' }, 'Your presence and blessings'))));
      window.renderDiary(false);
    });
    await page.waitForSelector('.presence-note');
    if (reducedMotion === 'no-preference') {
      assert.equal(await page.locator('.family-names').evaluate(el => getComputedStyle(el).opacity), '0');
      assert.equal(await page.locator('.family-names').evaluate(el => el.getAnimations()[0].playState), 'paused');
      await page.evaluate(() => window.renderDiary(true));
      await page.waitForFunction(() => document.querySelector('.family-names').getAnimations().some(a => a.playState === 'running'));
      assert.equal(await page.locator('.presence-note').evaluate(el => el.getAnimations()[0].playState), 'paused');
      await page.locator('.map-link').focus();
      assert.equal(await page.locator('.map-link').evaluate(el => el.getAnimations().length), 0);
      await page.waitForFunction(() => document.querySelector('.family-names').getAnimations().length === 0);
      await page.locator('.presence-note').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.presence-note').getAnimations().some(a => a.playState === 'running'));
      await page.waitForFunction(() => document.querySelector('.presence-note').getAnimations().length === 0);
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(await page.locator('.family-names').evaluate(el => el.getAnimations().length), 0);
    } else {
      assert.equal(await page.locator('.invitation-section').evaluate(el => el.getAnimations({ subtree: true }).length), 0);
    }
    console.log(`PASS diary reveal ${reducedMotion}: lifecycle, scroll and focus`);
    await page.close();
  }
} finally { await browser.close(); }
