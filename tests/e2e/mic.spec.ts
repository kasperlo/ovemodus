import { test, expect, type Page } from '@playwright/test';
import { appUrl, fakeMicArgs } from './helpers';

// Lydfilene er pianoopptak (FluidR3_GM) av høyre hånd i del A, se CLAUDE.md.
// Chromium spiller dem inn som om de kom fra mikrofonen, fra det øyeblikket appen ber om mikrofonen.
// Hver test starter sin egen nettleser, fordi lydfilen settes med et oppstartsflagg.

async function playThroughMic(playwright: typeof import('@playwright/test'), wav: string) {
  const browser = await playwright.chromium.launch({ args: fakeMicArgs(wav) });
  try {
    const page: Page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await page.goto(appUrl());
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.evaluate(() => { window.ovemodus.setSection('delA'); window.ovemodus.setMode('vent'); });
    await page.click('#btnMic');
    await expect.poll(() => page.evaluate(() => window.ovemodus.state.finished), { timeout: 30_000 }).toBe(true);
    return await page.evaluate(() => window.ovemodus.state);
  } finally {
    await browser.close();
  }
}

test('mikrofon: kjenner igjen alle 26 tonene i del A uten bom', async ({ playwright }) => {
  const st = await playThroughMic(playwright, 'del-a-hoyre-hand.wav');
  expect(st.cur).toBe(26);
  expect(st.misses).toBe(0);
});

test('mikrofon: godtar riktig tone en oktav lavere og teller nøyaktig én bom for én feil tone', async ({ playwright }) => {
  const st = await playThroughMic(playwright, 'del-a-oktav-ned-feil-tone.wav');
  expect(st.cur).toBe(26);
  expect(st.misses).toBe(1);
});
