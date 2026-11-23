import { test, expect, type Page } from '@playwright/test';
import { appUrl } from './helpers';

// Farger, timingmerker og spøkelsesnote i notearket. Gjelder bare den bygde appen, ikke prototypen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

const DONE_INK = 'rgb(31, 95, 214)';
const SLIP_INK = 'rgb(194, 90, 0)';

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl());
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.ovemodus.setSection('delA'));
});

const note = (page: Page, i: number) => page.locator('#sheet .abcjs-note').nth(i);
const fill = (page: Page, sel: string) => page.locator(sel).first().evaluate(e => getComputedStyle(e).fill);

test('vent på meg: blå for riktig, oransje der du bommet, og spøkelsesnote for tonen du spilte', async ({ page }) => {
  const notes = await page.evaluate(() => window.ovemodus.state.notes.map(n => n.m));
  await page.evaluate(ns => { const o = window.ovemodus; ns.slice(0, 3).forEach(m => o.input(m)); o.input(65); }, notes);

  await expect(page.locator('#sheet .abc-ghost')).toHaveCount(1);
  await expect(page.locator('#sheet .abc-ghost title')).toHaveText('Du spilte F4');

  await page.evaluate(m => window.ovemodus.input(m), notes[3]);
  await expect(page.locator('#sheet .abc-ghost')).toHaveCount(0);
  for (const i of [0, 1, 2]) await expect(note(page, i)).toHaveClass(/n-done/);
  await expect(note(page, 3)).toHaveClass(/n-stumbled/);
  expect(await note(page, 0).locator('.abcjs-notehead').evaluate(e => getComputedStyle(e).fill)).toBe(DONE_INK);
  expect(await note(page, 3).locator('.abcjs-notehead').evaluate(e => getComputedStyle(e).fill)).toBe(SLIP_INK);

  // Bjelken over de fire første notene farges når alle er spilt. «Del A» er en etikett og forblir svart.
  expect(await fill(page, '#sheet .abcjs-beam-elem')).toBe(DONE_INK);
  expect(await fill(page, '#sheet .abc-label')).not.toBe(DONE_INK);
  await expect(page.locator('#sheet .abcjs-beam-elem').nth(1)).not.toHaveClass(/n-done/);

  // Fargene beholdes når arket tegnes på nytt
  await page.check('#optLHStaff');
  await expect(page.locator('#sheet .n-stumbled')).toHaveCount(1);
  await expect(page.locator('#sheet .n-done')).toHaveCount(4); // tre noter og bjelken

  await page.click('#segView button[data-view="bokstaver"]');
  await expect(page.locator('#strip .chip:not(.rest)').nth(3)).toHaveClass(/stumbled/);

  await page.evaluate(ns => { const o = window.ovemodus; ns.slice(4).forEach(m => o.input(m)); }, notes);
  expect((await page.evaluate(() => window.ovemodus.state.result))?.then).toContain('Oransje noter');
});

test('spill i takt: merke under tonenavnet for toner som kom for sent, og alt nullstilles ved ny runde', async ({ page }) => {
  const late = await page.evaluate(async () => {
    const o = window.ovemodus;
    o.setMode('takt');
    o.setTempo(120);
    o.startRun('takt');
    const st = o.state, t0 = st.run.t0;
    const late: number[] = [];
    st.notes.forEach((n, i) => {
      const off = i % 2 ? 60 : 0;
      if (off) late.push(i);
      setTimeout(() => o.input(n.m), t0 + n.t * 1000 + off - performance.now());
    });
    await new Promise(r => setTimeout(r, t0 + (st.run.countIn + 32 * st.run.e8) * 1000 - performance.now() + 900));
    return late;
  });
  for (const i of late) await expect(page.locator(`#sheet .abc-timing.late[data-si="${i}"]`)).toHaveCount(1);
  await expect(page.locator('#sheet .abc-timing.early')).toHaveCount(0);
  expect(await page.locator('#sheet .abc-timing polygon').first().evaluate(e => getComputedStyle(e).fill)).toBe(SLIP_INK);
  await expect(page.locator('#strip .chip:not(.rest)').nth(late[0])).toHaveClass(/late/);

  await page.click('#btnReset');
  await expect(page.locator('#sheet .abc-timing')).toHaveCount(0);
  await expect(page.locator('#sheet .n-done')).toHaveCount(0);
});

/** Markøren målt i forhold til notearket, og hvor langt arket er rullet. */
const cursorInSheet = (page: Page) => page.evaluate(() => {
  const s = document.getElementById('sheet')!, c = document.querySelector('#sheet .abc-cursor')!;
  const a = s.getBoundingClientRect(), b = c.getBoundingClientRect();
  return { top: b.top - a.top, bottom: b.bottom - a.top, height: a.height, scroll: s.scrollTop };
});

/** Spiller riktige toner i «Vent på meg» fra der man står, til og med tone nummer `to` (fra 0). */
const playTo = (page: Page, to: number) => page.evaluate(n => {
  const o = window.ovemodus, notes = o.state.notes;
  for (let i = o.state.cur; i <= n; i++) o.input(notes[i].m);
}, to);

test('notearket ruller innenfor 318 px og følger med: linjen med neste tone står øverst', async ({ page }) => {
  await page.evaluate(() => window.ovemodus.setSection('hele'));
  const sheet = page.locator('#sheet');
  expect((await sheet.boundingBox())!.height).toBeLessThanOrEqual(318);
  expect(await sheet.evaluate(e => e.scrollHeight)).toBeGreaterThan(900);
  for (const to of [20, 40, 60]) {
    await playTo(page, to);
    await expect.poll(async () => {
      const c = await cursorInSheet(page);
      return c.top >= 0 && c.bottom <= c.height && c.top < 60;
    }, { message: `markøren øverst i arket etter tone ${to}` }).toBe(true);
  }
  await expect.poll(async () => (await cursorInSheet(page)).scroll).toBeGreaterThan(300);
  await page.click('#btnReset');
  await expect.poll(async () => (await cursorInSheet(page)).scroll).toBe(0);
});

test('med redusert bevegelse rulles arket med en gang, uten animasjon', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.ovemodus.setSection('hele'));
  await playTo(page, 40);
  const c = await cursorInSheet(page);
  expect(c.scroll).toBeGreaterThan(300);
  expect(c.top).toBeGreaterThanOrEqual(0);
  expect(c.top).toBeLessThan(60);
});
