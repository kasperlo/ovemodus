import { test, expect, type Page } from '@playwright/test';
import { appUrl } from './helpers';

// Hele akkorden med MIDI. Gjelder bare den bygde appen, ikke prototypen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl());
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

/** Tangentene skjermtastaturet viser som neste. */
const targets = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#kbd .key.target')].map(k => Number(k.dataset.m)));

// Fanfaren: C4 E4 G4 C5, så akkorden C4 E4 G4 C5 i høyre hånd
test('vent på meg med MIDI: akkorden er ferdig først når alle tonene er spilt', async ({ page }) => {
  await page.evaluate(() => {
    const o = window.ovemodus;
    o.setSection('riktig');
    o.setMode('vent');
    o.state.notes.slice(0, 4).forEach(n => o.input(n.m, 'midi'));
    o.input(60, 'midi');
  });
  expect(await page.evaluate(() => window.ovemodus.state)).toMatchObject({ cur: 4, misses: 0, finished: false });
  // C er spilt (i alle oktaver), så bare E og G står igjen på tastaturet
  expect((await targets(page)).sort()).toEqual([64, 67]);

  const st = await page.evaluate(() => { const o = window.ovemodus; o.input(64, 'midi'); o.input(67, 'midi'); return o.state; });
  expect(st).toMatchObject({ cur: 5, misses: 0, finished: true });
});

test('mikrofon, skjermtastatur og valget av: én tone i akkorden er nok som før', async ({ page }) => {
  const play = (src: string) => page.evaluate(s => {
    const o = window.ovemodus;
    o.setSection('riktig');
    o.setMode('vent');
    o.state.notes.forEach(n => o.input(n.m, s));
    return o.state.finished;
  }, src);
  expect(await play('click')).toBe(true);
  expect(await play('mic')).toBe(true);
  await page.uncheck('#optChordAll');
  expect(await play('midi')).toBe(true);
  await page.reload();
  await expect(page.locator('#optChordAll')).not.toBeChecked();
});

test('spill i takt med MIDI: en halv akkord er bom, hele akkorden er treff', async ({ page }) => {
  const run = (chord: number[]) => page.evaluate(async tones => {
    const o = window.ovemodus;
    o.setSection('riktig');
    o.setMode('takt');
    o.setTempo(120);
    o.startRun('takt');
    const st = o.state, t0 = st.run.t0;
    st.notes.forEach((n, i) => {
      const at = t0 + n.t * 1000 - performance.now();
      if (i < 4) setTimeout(() => o.input(n.m, 'midi'), at);
      else tones.forEach((m, j) => setTimeout(() => o.input(m, 'midi'), at + 3 * j));
    });
    await new Promise<void>(resolve => { const id = setInterval(() => { if (!o.state.runActive) { clearInterval(id); resolve(); } }, 50); });
    return o.state.result?.big;
  }, chord);
  expect(await run([60])).toBe('80 %');
  expect(await run([60, 64, 67, 72])).toBe('100 %');
});

test('begge hender med MIDI: venstre hånds kvint krever begge tonene', async ({ page }) => {
  await page.click('#segHand button[data-hand="both"]');
  const first = await page.evaluate(() => {
    const o = window.ovemodus;
    o.setSection('delA');
    o.setMode('vent');
    o.input(69, 'midi'); // A4 i høyre hånd
    o.input(45, 'midi'); // A2, men ikke E3
    return o.state.cur;
  });
  expect(first).toBe(0);
  expect(await targets(page)).toEqual([52]);
  expect(await page.evaluate(() => { window.ovemodus.input(52, 'midi'); return window.ovemodus.state.cur; })).toBe(1);
});
