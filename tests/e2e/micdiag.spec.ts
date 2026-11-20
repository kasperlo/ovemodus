import { test, expect, type Browser } from '@playwright/test';
import { appUrl, fakeMicArgs } from './helpers';

// Mikrofontesten med falsk mikrofon (pianoopptak av del A, se CLAUDE.md). Gjelder bare den bygde appen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

const STORE_KEY = 'dovregubben-ovemodus-v1';

async function newPage(browser: Browser) {
  return browser.newPage({ viewport: { width: 1366, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
}

test('mikrofontest: viser innstillinger, kalibrerer, og del A gjenkjennes med kalibrert følsomhet', async ({ playwright }) => {
  test.setTimeout(90_000);
  let calGate: number;

  const first = await playwright.chromium.launch({ args: fakeMicArgs('del-a-hoyre-hand.wav') });
  try {
    const page = await newPage(first);
    await page.goto(appUrl());
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.evaluate(() => { window.ovemodus.setSection('delA'); window.ovemodus.setMode('vent'); });

    await page.click('#btnDiag');
    const dialog = page.locator('#diag');
    await expect(dialog).toBeVisible();
    await expect(page.locator('#diagSettings')).toContainText('Ekkofjerning');
    await expect(page.locator('#diagSettings dd').nth(1)).toHaveText('av');
    await page.click('#btnCal');

    await expect(page.locator('#diagLive')).toContainText(/hører [A-G]/, { timeout: 10_000 });
    await expect(page.locator('#diagStep')).toHaveText('Ferdig.', { timeout: 15_000 });
    await expect(page.locator('#diagResult')).toContainText('Anbefalt grense');
    await page.click('#btnUseCal');
    await expect(page.locator('#optSens')).toHaveValue('kalibrert');

    await page.click('#btnCopy');
    await expect(page.locator('#diagCopied')).toHaveText('Kopiert');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Kalibrering: stille');

    // Tonene som ble spilt mens testen var åpen, skal ikke ha telt i øvingen
    expect(await page.evaluate(() => window.ovemodus.state.cur)).toBe(0);
    await page.click('#btnDiagClose');
    await expect(dialog).toBeHidden();

    calGate = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).settings.calGate, STORE_KEY);
    expect(calGate).toBeGreaterThan(0.0008);
    expect(calGate).toBeLessThan(0.03);
  } finally {
    await first.close();
  }

  const second = await playwright.chromium.launch({ args: fakeMicArgs('del-a-hoyre-hand.wav') });
  try {
    const page = await newPage(second);
    await page.goto(appUrl());
    await page.evaluate(([k, g]) => {
      localStorage.clear();
      localStorage.setItem(k as string, JSON.stringify({ settings: { sens: 'kalibrert', calGate: g } }));
    }, [STORE_KEY, calGate!]);
    await page.reload();
    await expect(page.locator('#optSens')).toHaveValue('kalibrert');
    await page.evaluate(() => { window.ovemodus.setSection('delA'); window.ovemodus.setMode('vent'); });
    await page.click('#btnMic');
    await expect.poll(() => page.evaluate(() => window.ovemodus.state.finished), { timeout: 30_000 }).toBe(true);
    const st = await page.evaluate(() => window.ovemodus.state);
    expect(st.cur).toBe(26);
    expect(st.misses).toBe(0);
  } finally {
    await second.close();
  }
});

test('mikrofontest: svak lyd som på iPad (−17 dB) blir hørt med kalibrert følsomhet', async ({ playwright }) => {
  // Opptaket er del A dempet 17 dB, samme nivå som iPad-mikrofonen målte i notestativet (svake toner rundt −59 dB).
  // Med «Høy» høres nesten ingen toner.
  test.setTimeout(90_000);
  let calGate: number;

  const first = await playwright.chromium.launch({ args: fakeMicArgs('del-a-svak-ipad.wav') });
  try {
    const page = await newPage(first);
    await page.goto(appUrl());
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.click('#btnDiag');
    // Trykker med en gang, før mikrofonen er klar: kalibreringen skal vente på den
    await page.click('#btnCal');
    await expect(page.locator('#diagStep')).toHaveText('Ferdig.', { timeout: 15_000 });
    await expect(page.locator('#diagResult')).toContainText('svake');
    await page.click('#btnUseCal');
    calGate = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).settings.calGate, STORE_KEY);
  } finally {
    await first.close();
  }

  const second = await playwright.chromium.launch({ args: fakeMicArgs('del-a-svak-ipad.wav') });
  try {
    const page = await newPage(second);
    await page.goto(appUrl());
    await page.evaluate(([k, g]) => {
      localStorage.clear();
      localStorage.setItem(k as string, JSON.stringify({ settings: { sens: 'kalibrert', calGate: g } }));
    }, [STORE_KEY, calGate!]);
    await page.reload();
    await page.evaluate(() => { window.ovemodus.setSection('delA'); window.ovemodus.setMode('vent'); });
    await page.click('#btnMic');
    await expect.poll(() => page.evaluate(() => window.ovemodus.state.finished), { timeout: 30_000 }).toBe(true);
    const st = await page.evaluate(() => window.ovemodus.state);
    expect(st.cur).toBe(26);
    expect(st.misses).toBe(0);
  } finally {
    await second.close();
  }
});
