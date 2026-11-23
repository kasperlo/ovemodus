import { test, expect, type Page } from '@playwright/test';
import { appUrl } from './helpers';

// Øve på noen takter: utsnitt, løkke og tempotrapp. Gjelder bare den bygde appen, ikke prototypen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

const STORE_KEY = 'dovregubben-ovemodus-v1';

async function open(page: Page, saved?: unknown) {
  await page.goto(appUrl());
  await page.evaluate(([k, s]) => {
    localStorage.clear();
    if (s) localStorage.setItem(k as string, JSON.stringify(s));
  }, [STORE_KEY, saved]);
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}

const stored = (page: Page) => page.evaluate(k => JSON.parse(localStorage.getItem(k)!), STORE_KEY);
const summary = (page: Page) => page.evaluate(() => document.getElementById('setupSum')!.textContent);

test('utsnitt: takter velges i oppsettet, notearket og stegene følger, og valget huskes', async ({ page }) => {
  await open(page);
  await page.evaluate(() => window.ovemodus.setSection('hele'));
  await expect(page.locator('#rangeFrom option')).toHaveCount(17);
  await expect(page.locator('#btnWholePart')).toBeHidden();

  await page.selectOption('#rangeFrom', { label: '5' });
  await page.selectOption('#rangeTo', { label: '8' });
  let st = await page.evaluate(() => window.ovemodus.state);
  expect(st.range).toEqual({ first: 5, last: 8 });
  expect(st.steps).toBe(26);
  expect(st.sheet.ok).toBe(true);
  expect(st.sheet.count).toBe(26);
  await expect(page.locator('#sheet .abcjs-bar-number')).toHaveText(['5', '7']);
  expect(await summary(page)).toBe('Hele stykket · Takt 5–8 · Vent på meg · 100 BPM');
  await expect(page.locator('#btnWholePart')).toBeVisible();

  // «Til» før «fra» flytter «fra» med, så utsnittet blir én takt
  await page.selectOption('#rangeTo', { label: '3' });
  st = await page.evaluate(() => window.ovemodus.state);
  expect(st.range).toEqual({ first: 3, last: 3 });
  await expect(page.locator('#rangeFrom')).toHaveValue('2');

  // Rekorden lagres for utsnittet, ikke for hele delen
  st = await page.evaluate(() => {
    const o = window.ovemodus;
    o.state.notes.forEach(n => o.input(n.m));
    return o.state;
  });
  expect(st.finished).toBe(true);
  expect(Object.keys((await stored(page)).rec)).toEqual(['hele|t3-3|vent']);

  await page.reload();
  expect(await page.evaluate(() => window.ovemodus.state.range)).toEqual({ first: 3, last: 3 });
  await expect(page.locator('#rangeTo')).toHaveValue('2');

  await page.click('#btnWholePart');
  st = await page.evaluate(() => window.ovemodus.state);
  expect(st.range).toBeNull();
  expect(st.steps).toBe(103);
  await expect(page.locator('#btnWholePart')).toBeHidden();
  await expect(page.locator('#rangeFrom')).toBeFocused();
});

test('gjenta i «Vent på meg»: utsnittet starter på nytt av seg selv, og rundene vises', async ({ page }) => {
  await open(page);
  await page.evaluate(() => { window.ovemodus.setSection('delA'); window.ovemodus.setRange(1, 2); });
  await expect(page.locator('#loopCard')).toBeHidden();
  await page.check('#optLoop');
  await expect(page.locator('#loopCard')).toBeVisible();
  await expect(page.locator('#loopTitle')).toHaveText('Løkke · Takt 1–2');

  const st = await page.evaluate(() => {
    const o = window.ovemodus;
    const notes = o.state.notes.map(n => n.m);
    notes.forEach(m => o.input(m));
    const first = o.state;
    notes.forEach((m, i) => { if (i === 4) o.input(61); o.input(m); });
    return { first, second: o.state };
  });
  expect(st.first).toMatchObject({ steps: 13, cur: 0, finished: false, misses: 0 });
  expect(st.second).toMatchObject({ cur: 0, finished: false, misses: 0 });
  expect(st.second.loop.rounds.map(r => r.misses)).toEqual([0, 1]);
  await expect(page.locator('#hint')).toContainText('1 bom. Fra start igjen.');
  await expect(page.locator('#loopRounds li')).toHaveCount(2);
  await expect(page.locator('#loopRounds li').nth(1)).toHaveClass('meh');
  expect(await summary(page)).toBe('Del A · Takt 1–2 · Vent på meg · Gjenta · 100 BPM');

  // Av igjen: delen stopper som før når den er ferdig
  await page.uncheck('#optLoop');
  const end = await page.evaluate(() => {
    const o = window.ovemodus;
    o.state.notes.forEach(n => o.input(n.m));
    return o.state;
  });
  expect(end.finished).toBe(true);
  await expect(page.locator('#loopCard')).toBeHidden();
});

test('gjenta i «Spill i takt»: ny inntelling hver runde, tempoet går opp til målet og ned etter en svak runde', async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  await page.evaluate(() => {
    const o = window.ovemodus;
    o.setSection('delA');
    o.setRange(1, 2);
    o.setMode('takt');
    o.setLoop(true);
    o.setTempo(155);
    o.setTarget(160);
  });
  await expect(page.locator('#loopTempo')).toHaveText('155 BPM · mål 160');
  await expect(page.locator('#optTarget')).toHaveValue('160');
  // Løkken startes og stoppes fra kortet over notene, som også vises når oppsettet er skjult på iPad
  await expect(page.locator('#btnLoopGo')).toHaveText('Start');
  await page.click('#btnLoopGo');

  const log = await page.evaluate(async () => {
    const o = window.ovemodus;
    const until = (f: () => boolean) => new Promise<void>((resolve, reject) => {
      const start = performance.now();
      const id = setInterval(() => {
        if (f()) { clearInterval(id); resolve(); } else if (performance.now() - start > 15_000) { clearInterval(id); reject(new Error('tidsavbrudd')); }
      }, 10);
    });
    const text = (id: string) => document.getElementById(id)!.textContent;
    const rounds: { round: number; tempo: number; countIn: number; next?: { pending: boolean; tempo: number; big?: string; then?: string; btn: string | null; card: string | null; actions: number } }[] = [];
    // To runder uten feil, så en runde der ingenting spilles
    for (const play of [true, true, false]) {
      await until(() => o.state.runActive);
      const st = o.state;
      const r: (typeof rounds)[number] = { round: st.loop.round, tempo: st.tempo, countIn: st.run.countIn };
      rounds.push(r);
      if (play) st.notes.forEach(n => setTimeout(() => o.input(n.m), st.run.t0 + n.t * 1000 - performance.now()));
      await until(() => !o.state.runActive);
      const after = o.state;
      r.next = {
        pending: after.loop.pending, tempo: after.tempo, big: after.result?.big, then: after.result?.then,
        btn: text('btnGo'), card: text('btnLoopGo'), actions: document.querySelectorAll('#clueActions button').length
      };
    }
    document.getElementById('btnLoopGo')!.click();
    return { rounds, loop: o.state.loop, btn: text('btnGo'), card: text('btnLoopGo') };
  });

  expect(log.rounds.map(r => r.round)).toEqual([1, 2, 3]);
  expect(log.rounds.map(r => r.tempo)).toEqual([155, 160, 160]);
  log.rounds.forEach(r => expect(r.countIn, `inntelling i runde ${r.round}`).toBeCloseTo(4 * 60 / r.tempo, 5));
  expect(log.rounds.map(r => r.next!.big)).toEqual(['100 %', '100 %', '0 %']);
  expect(log.rounds.map(r => r.next!.tempo)).toEqual([160, 160, 155]);
  expect(log.rounds[0].next!.then).toContain('Målet er nådd! Neste runde i 160 BPM.');
  expect(log.rounds[1].next!.then).toContain('Du holder måltempoet, 160 BPM.');
  expect(log.rounds[2].next!.then).toContain('Litt saktere: 155 BPM.');
  // Pausen mellom rundene har ingen knapper i kortet for neste tone, så det ikke endrer høyde
  log.rounds.forEach(r => expect(r.next).toMatchObject({ pending: true, btn: 'Stopp', card: 'Stopp', actions: 0 }));

  // Stoppet i pausen: ingen ny runde, og resultatet står med en knapp for å starte igjen
  expect(log.loop.pending).toBe(false);
  expect(log.btn).toBe('Start i takt');
  expect(log.card).toBe('Start');
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.ovemodus.state.runActive)).toBe(false);
  await expect(page.locator('#clueActions button')).toHaveText(['Start løkken igjen']);

  expect(log.loop.rounds.map(r => [r.tempo, r.pct])).toEqual([[155, 100], [160, 100], [160, 0]]);
  await expect(page.locator('#loopRounds li')).toHaveCount(3);
  await expect(page.locator('#loopRounds li')).toHaveClass(['good', 'good', 'weak']);
  const saved = await stored(page);
  expect(saved.v).toBe(2);
  expect(saved.rec['delA|t1-2|takt']).toEqual({ tempo: 160, pct: 100 });
  expect(saved.settings.tempo['delA|t1-2']).toBe(155);
  expect(saved.settings.tempo.delA).toBe(100);

  // Beste tempo i dag står i grafen og i tabellen for skjermlesere
  await expect(page.locator('#days')).toBeVisible();
  await expect(page.locator('#daysTable tbody tr')).toHaveCount(1);
  await expect(page.locator('#daysTable tbody td').nth(1)).toHaveText('160 BPM');
  await expect(page.locator('#days .val')).toHaveText('160');
  await page.hover('#daysPlot svg');
  await expect(page.locator('#daysPlot .days-tip')).toHaveText(/ · 160 BPM$/);

  // Hele delen har sitt eget tempo og sin egen rekord
  await page.click('#btnWholePart');
  expect(await page.evaluate(() => window.ovemodus.state.tempo)).toBe(100);
  await expect(page.locator('#v4')).toHaveText('–');
  await expect(page.locator('#days')).toBeHidden();
});

test('lagret data fra før utsnitt og løkke virker som før', async ({ page }) => {
  await open(page, {
    settings: { section: 'delB', hand: 'rh', mode: 'takt', oct: true, lh: true, acc: true, sens: 'middels', tempo: { delB: 95 }, view: 'noter', lhStaff: false, setupOpen: true },
    rec: { 'delB|takt': { tempo: 95, pct: 92 } }
  });
  const st = await page.evaluate(() => window.ovemodus.state);
  expect(st).toMatchObject({ section: 'delB', mode: 'takt', tempo: 95, range: null, loop: { on: false } });
  await expect(page.locator('#v4')).toHaveText('95 BPM');
  await expect(page.locator('#optLoop')).not.toBeChecked();
  await page.evaluate(() => window.ovemodus.setTempo(100));
  const saved = await stored(page);
  expect(saved.v).toBe(2);
  expect(saved.rec).toEqual({ 'delB|takt': { tempo: 95, pct: 92 } });
  expect(saved.settings.tempo).toEqual({ delB: 100 });
});

for (const [w, h] of [[768, 1024], [820, 1180], [1024, 1366]]) {
  test(`stående iPad ${w}×${h}: løkkekortet gjør ikke scenen høyere, og alt får plass uten å scrolle`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    const rounds = [95, 80, 60, 92, 100].map((pct, i) => ({ at: i, tempo: 100 + 5 * i, pct }));
    const kbdBottom = async (loop: boolean) => {
      await open(page, {
        settings: { section: 'delA', mode: 'takt', setupOpen: false, loop, ranges: { delA: [0, 1] } },
        rec: {},
        progress: { 'delA|t1-2|takt': { rounds, days: { '2026-11-20': 110, '2026-11-23': 120 } } }
      });
      await expect(page.locator('#loopCard')).toBeVisible({ visible: loop });
      const box = (await page.locator('.kbd-wrap').boundingBox())!;
      return box.y + box.height;
    };
    const without = await kbdBottom(false);
    expect(await kbdBottom(true)).toBe(without);
    await expect(page.locator('#loopRounds li')).toHaveCount(5);
    for (const sel of ['#clue', '#sheet', '#loopCard', '.kbd-wrap']) {
      const box = (await page.locator(sel).boundingBox())!;
      expect(box.y + box.height, sel).toBeLessThanOrEqual(h);
    }
    // Rundene og knappen får plass i kortet
    const overflow = await page.evaluate(() => [...document.querySelectorAll('#loopCard, #loopRounds li')].some(el => el.scrollWidth > el.clientWidth + 1));
    expect(overflow).toBe(false);
    await expect(page.locator('#btnLoopGo')).toBeVisible();
  });
}
