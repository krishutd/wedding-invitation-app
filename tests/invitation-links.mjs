// Optional first argument: directory containing Playwright.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { invitationLinks, resolveInvitation } from '../src/invitationLinks.js';

const invalid = ['?i=', '?i=unknown', '?i=constructor', '?i=__proto__', '?i=4F6A2AE57F7D', '?i=4f6a2ae57f7d&i=e7713c25d1c8', '?i=unknown&side=bride&invite=wedding'];
for (const query of invalid) assert.equal(resolveInvitation(query), null);
const legacy = [
  ['', { side: 'groom', invite: 'both' }],
  ['?side=bride', { side: 'bride', invite: 'both' }],
  ['?invite=reception', { side: 'groom', invite: 'reception' }],
  ['?side=BRIDE&invite=WEDDING&theme=dark', { side: 'bride', invite: 'wedding' }],
  ['?side=invalid&invite=invalid', { side: 'groom', invite: 'both' }],
  ['?side=bride&side=groom&invite=reception&invite=wedding', { side: 'bride', invite: 'reception' }],
];
for (const [query, selection] of legacy) assert.deepEqual(resolveInvitation(query), selection);
assert.equal(Object.keys(invitationLinks).length, 6);
const require = createRequire(resolve(process.argv[2] || '.', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
const base = process.env.TEST_URL || 'http://127.0.0.1:4174/wedding-invitation-app/';
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const cases = [
    ...Object.entries(invitationLinks).map(([code, selection]) => [`?i=${code}&side=bride&invite=reception`, selection]),
    ...Object.values(invitationLinks).map(selection => [`?side=${selection.side}&invite=${selection.invite}`, selection]),
    ...legacy,
  ];
  for (const [query, selection] of cases) {
    assert.deepEqual(resolveInvitation(query), selection);
    await page.goto(base + query);
    await page.waitForFunction(() => document.querySelector('.site-shell')?.getAttribute('aria-busy') === 'false');
    assert.equal((await page.locator('.date-selected').textContent()).trim(), selection.invite === 'reception' ? '21' : '19');
    await page.locator('.envelope-stage').click();
    await page.waitForFunction(() => document.querySelector('#invitation') && !document.querySelector('.intro-screen'), null, { timeout: 25000 });
    assert.equal(await page.locator('.couple-names h2').first().textContent(), selection.side === 'bride' ? 'Archa' : 'Krishnanand');
    assert.equal(await page.locator('.ceremony-card').count(), selection.invite === 'both' ? 2 : 1);
    console.log(`PASS ${query || '(default)'}: ${selection.side}, ${selection.invite}`);
  }
  for (const query of invalid) {
    await page.goto(base + query);
    await page.getByRole('heading', { name: 'Please use your invitation link' }).waitFor();
    assert.equal(await page.locator('.envelope-stage, .ceremony-card, #invitation-loading').count(), 0);
  }
  assert.deepEqual(errors, []);
  console.log('PASS invalid and duplicate codes show neutral notice, even with legacy parameters');
} finally { await browser.close(); }
