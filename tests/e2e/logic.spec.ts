import { test, expect, type Page } from '@playwright/test';
import { appUrl } from './helpers';

// Disse testene bruker testkroken window.ovemodus i stedet for mikrofon,
// på samme måte som MIDI og skjermtastaturet sender toner inn i appen.

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl());
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('vent på meg: hele stykket, én feil tone gir én bom', async ({ page }) => {
  const st = await page.evaluate(() => {
    const o = window.ovemodus;
    o.setSection('hele');
    o.setMode('vent');
    const notes = o.state.notes;
    notes.forEach((n, i) => {
      if (i === 30) o.input(61); // C♯4 er feil her
      o.input(n.m);
    });
    return o.state;
  });
  expect(st.steps).toBe(103);
  expect(st.cur).toBe(103);
  expect(st.misses).toBe(1);
  expect(st.finished).toBe(true);
});

/** Starter «Spill i takt» for del A og spiller tonene med gitt forsinkelse via kroken. */
async function taktRun(page: Page, tempo: number, lateMs: number, skip: number[]) {
  return page.evaluate(async ({ tempo, lateMs, skip }) => {
    const o = window.ovemodus;
    o.setSection('delA');
    o.setMode('takt');
    o.setTempo(tempo);
    o.startRun('takt');
    const st = o.state;
    const t0 = st.run.t0;
    st.notes.forEach((n, i) => {
      if (skip.includes(i)) return;
      setTimeout(() => o.input(n.m), t0 + n.t * 1000 + lateMs - performance.now());
    });
    const endMs = t0 + (st.run.countIn + 32 * st.run.e8) * 1000 - performance.now() + 900;
    await new Promise(r => setTimeout(r, endMs));
    return o.state;
  }, { tempo, lateMs, skip });
}

test('spill i takt: perfekt timing gir 100 %', async ({ page }) => {
  const st = await taktRun(page, 120, 0, []);
  expect(st.runActive).toBe(false);
  expect(st.result?.big).toBe('100 %');
});

test('spill i takt: 60 ms for sent og tre toner hoppet over', async ({ page }) => {
  const st = await taktRun(page, 140, 60, [3, 10, 17]);
  expect(st.result?.big).toBe('88 %');
  const late = /I snitt (\d+) ms for sent/.exec(st.result?.then ?? '');
  expect(late, st.result?.then).not.toBeNull();
  expect(Number(late![1])).toBeGreaterThan(40);
  expect(Number(late![1])).toBeLessThan(85);
});

for (const lh of [false, true]) {
  test(`notearket har én note per tone (venstre hånd vist: ${lh})`, async ({ page }) => {
    if (lh) await page.check('#optLHStaff');
    for (const sec of ['delA', 'delB', 'hele', 'riktig', 'feil']) {
      const st = await page.evaluate(s => { window.ovemodus.setSection(s); return window.ovemodus.state; }, sec);
      expect(st.sheet.ok, sec).toBe(true);
      expect(st.sheet.count, sec).toBe(st.steps);
      expect(st.sheet.cursorW, sec).toBeGreaterThan(0);
    }
  });
}

test('klikk på en note i notearket starter derfra', async ({ page }) => {
  await page.evaluate(() => window.ovemodus.setSection('delA'));
  const notes = page.locator('#sheet .abcjs-note');
  await expect(notes).toHaveCount(26);
  // abcjs fanger klikk på hele SVG-en, så vi klikker på koordinatene til noten
  const bb = await notes.nth(8).boundingBox();
  await page.mouse.click(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2);
  expect(await page.evaluate(() => window.ovemodus.state.cur)).toBe(8);
});

test('demo spiller av og stopper av seg selv', async ({ page }) => {
  await page.evaluate(() => { window.ovemodus.setSection('riktig'); window.ovemodus.startRun('demo'); });
  await expect(page.locator('#clueLabel')).toHaveText('Hør etter');
  await expect.poll(() => page.evaluate(() => window.ovemodus.state.runActive), { timeout: 10_000 }).toBe(false);
});

test('bokstavvisningen skjuler notearket, og notevisningen viser det igjen', async ({ page }) => {
  const sheet = page.locator('#sheet'), strip = page.locator('#strip');
  await expect(sheet).toBeVisible();
  await page.click('#segView button[data-view="bokstaver"]');
  await expect(sheet).toBeHidden();
  await expect(strip).toBeVisible();
  await page.click('#segView button[data-view="noter"]');
  await expect(sheet).toBeVisible();
  await expect(strip).toBeHidden();
  expect(await page.evaluate(() => window.ovemodus.state.sheet.ok)).toBe(true);
});
