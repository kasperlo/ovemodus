import { test, expect, type Page } from '@playwright/test';
import { appUrl } from './helpers';

// Låtvelger og venstre hånd. Gjelder bare den bygde appen, ikke prototypen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

const STORE_KEY = 'dovregubben-ovemodus-v1';

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl());
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
});

async function sectionIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const sel = document.getElementById('selSong') as HTMLSelectElement;
    const ids: string[] = [];
    for (const o of Array.from(sel.options)) {
      sel.value = o.value;
      sel.dispatchEvent(new Event('change'));
      document.querySelectorAll<HTMLElement>('#segSection button').forEach(b => ids.push(b.dataset.sec!));
    }
    return ids;
  });
}

test('låtvelger: velger låt og del, og skjuler delvalget når låten har én del', async ({ page }) => {
  await page.selectOption('#selSong', 'wilhelm-tell');
  await expect(page.locator('#songTitle')).toHaveText('Wilhelm Tell');
  await expect(page.locator('#secCasio')).toContainText('Registrering 3-1: 224 TRUMPET 1 · lag: 183 STEREO STRINGS');
  expect(await page.locator('#casioTable tbody tr').count()).toBe(await page.locator('#selSong option').count());
  await expect(page.locator('#segSection')).toBeHidden();
  expect(await page.evaluate(() => window.ovemodus.state.section)).toBe('tell');

  await page.selectOption('#selSong', 'dovregubben');
  await expect(page.locator('#segSection button')).toHaveCount(3);
  await page.click('#segSection button[data-sec="delB"]');
  expect(await page.evaluate(() => window.ovemodus.state.section)).toBe('delB');

  await page.reload();
  await expect(page.locator('#selSong')).toHaveValue('dovregubben');
  expect(await page.evaluate(() => window.ovemodus.state.section)).toBe('delB');
});

test('venstre hånd: kvintene er stegene, tastaturet viser C2–C4, og rekorden lagres for seg', async ({ page }) => {
  await page.click('#segHand button[data-hand="lh"]');
  await expect(page.locator('#segHand button[data-hand="lh"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#subText')).toContainText('Spill venstre hånd');
  await expect(page.locator('#optAccText')).toHaveText('Spill høyre hånd for meg');
  await expect(page.locator('#clueBig')).toHaveText('A+E');
  await expect(page.locator('#kbd .key[data-m="36"]')).toHaveCount(1);
  await expect(page.locator('#kbd .key[data-m="45"]')).toHaveClass(/target/);
  await expect(page.locator('#kbd .key[data-m="52"]')).toHaveClass(/target/);

  const st = await page.evaluate(() => {
    const o = window.ovemodus;
    o.state.notes.forEach(n => o.input(n.m));
    return o.state;
  });
  expect(st.steps).toBe(16);
  expect(st.finished).toBe(true);
  const rec = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).rec, STORE_KEY);
  expect(Object.keys(rec)).toEqual(['delA|lh|vent']);

  await page.reload();
  await expect(page.locator('#segHand button[data-hand="lh"]')).toHaveAttribute('aria-pressed', 'true');
});

test('notearket har én note per steg i alle deler, med begge hender og med den andre hånden vist', async ({ page }) => {
  test.setTimeout(120_000);
  const ids = await sectionIds(page);
  expect(ids.length).toBeGreaterThanOrEqual(11);
  for (const hand of ['rh', 'lh', 'both'] as const) {
    await page.click(`#segHand button[data-hand="${hand}"]`);
    for (const other of hand === 'both' ? [true] : [false, true]) {
      if (hand !== 'both') await page.setChecked('#optLHStaff', other);
      for (const id of ids) {
        const st = await page.evaluate(s => { window.ovemodus.setSection(s); return window.ovemodus.state; }, id);
        const where = `${id} ${hand}${other ? ' + andre hånd' : ''}`;
        expect(st.sheet.ok, where).toBe(true);
        expect(st.sheet.count, where).toBe(st.steps);
        expect(st.sheet.cursorW, where).toBeGreaterThan(0);
      }
    }
  }
});

test('spill i takt med 2/4: inntelling på to takter og fire klikk', async ({ page }) => {
  const ids = await sectionIds(page);
  test.skip(!ids.includes('tell'), 'ingen låt i 2/4 ennå');
  const run = await page.evaluate(() => {
    const o = window.ovemodus;
    o.setSection('tell');
    o.setMode('takt');
    o.setTempo(120);
    o.startRun('takt');
    const r = o.state.run;
    o.stopRun(true);
    return r;
  });
  expect(run.countIn).toBeCloseTo(8 * run.e8);
});

test('begge hender, vent på meg: steget venter til begge hendene har spilt sin del', async ({ page }) => {
  await page.click('#segHand button[data-hand="both"]');
  await expect(page.locator('#segHand button[data-hand="both"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#subText')).toContainText('begge hender');
  await expect(page.locator('#kbd .key[data-m="36"]')).toHaveCount(1);
  await expect(page.locator('#kbd .key[data-m="84"]')).toHaveCount(1);
  await expect(page.locator('#clueSub')).toHaveText('Høyre: A4 (1) · Venstre: A2 E3 (5 1)');

  const first = await page.evaluate(() => window.ovemodus.state.notes[0]);
  expect(first).toMatchObject({ rh: 69, lh: 45 });
  await page.evaluate(m => window.ovemodus.input(m), first.rh!);
  expect(await page.evaluate(() => window.ovemodus.state.cur)).toBe(0);
  await expect(page.locator('#clueSub')).toHaveText('Høyre: A4 (1) ✓ · Venstre: A2 E3 (5 1)');
  await expect(page.locator('#kbd .key[data-m="69"]')).not.toHaveClass(/target/);
  await expect(page.locator('#kbd .key[data-m="45"]')).toHaveClass(/target/);

  await page.evaluate(m => window.ovemodus.input(m), first.lh!);
  expect(await page.evaluate(() => window.ovemodus.state.cur)).toBe(1);

  const st = await page.evaluate(() => {
    const o = window.ovemodus;
    o.state.notes.slice(1).forEach(n => { if (n.lh) o.input(n.lh); if (n.rh) o.input(n.rh); });
    return o.state;
  });
  expect(st.steps).toBe(27);
  expect(st.finished).toBe(true);
  expect(st.misses).toBe(0);
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('dovregubben-ovemodus-v1')!).rec);
  expect(Object.keys(rec)).toEqual(['delA|both|vent']);
});

test('begge hender, spill i takt: begge hender i takt gir 100 %, og hver hånd teller', async ({ page }) => {
  await page.click('#segHand button[data-hand="both"]');
  const st = await page.evaluate(async () => {
    const o = window.ovemodus;
    o.setMode('takt');
    o.setTempo(120);
    o.startRun('takt');
    const s = o.state, t0 = s.run.t0;
    s.notes.forEach(n => {
      const at = t0 + n.t * 1000 - performance.now();
      if (n.rh) setTimeout(() => o.input(n.rh!), at);
      if (n.lh) setTimeout(() => o.input(n.lh!), at + 5);
    });
    await new Promise(r => setTimeout(r, t0 + (s.run.countIn + 32 * s.run.e8) * 1000 - performance.now() + 900));
    return o.state;
  });
  expect(st.result?.big).toBe('100 %');
  // 26 toner i høyre hånd og 16 kvinter i venstre
  expect(st.result?.sub).toContain('42 av 42 toner');
});
