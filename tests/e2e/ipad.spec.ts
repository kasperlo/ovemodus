import { test, expect, type Page } from '@playwright/test';
import { appUrl } from './helpers';

// Oppsett for iPad på notestativet. Gjelder bare den bygde appen, ikke prototypen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

async function open(page: Page) {
  await page.goto(appUrl());
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}

async function bottom(page: Page, sel: string): Promise<number> {
  const box = (await page.locator(sel).boundingBox())!;
  return box.y + box.height;
}

for (const [w, h] of [[768, 1024], [820, 1180], [1024, 1366]]) {
  test(`stående iPad ${w}×${h}: med oppsettet skjult får neste tone, noter og tastatur plass uten å scrolle`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    const btn = page.locator('#btnSetup');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#btnMic')).toBeVisible();

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#btnMic')).toBeHidden();
    await expect(page.locator('#setupSum')).toHaveText('Del A · Vent på meg · 100 BPM');
    for (const sel of ['#clue', '#sheet', '.kbd-wrap']) expect(await bottom(page, sel), sel).toBeLessThanOrEqual(h);

    await page.reload();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });
}

test('desktop viser alltid oppsettet, også når det er skjult på smal skjerm', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await open(page);
  await page.click('#btnSetup');
  await page.setViewportSize({ width: 1366, height: 900 });
  await expect(page.locator('#btnSetup')).toBeHidden();
  await expect(page.locator('#btnMic')).toBeVisible();
});

test('skjermen holdes våken mens appen spiller, og slippes etterpå', async ({ page }) => {
  await page.addInitScript(() => {
    const log: string[] = [];
    (window as unknown as { wakeLog: string[] }).wakeLog = log;
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: async () => {
          log.push('request');
          const s = new EventTarget() as EventTarget & { release(): Promise<void> };
          s.release = async () => { log.push('release'); s.dispatchEvent(new Event('release')); };
          return s;
        },
      },
    });
  });
  await open(page);
  await page.evaluate(() => { window.ovemodus.setSection('riktig'); window.ovemodus.startRun('demo'); });
  await expect.poll(() => page.evaluate(() => (window as unknown as { wakeLog: string[] }).wakeLog)).toEqual(['request']);
  await expect.poll(() => page.evaluate(() => window.ovemodus.state.runActive), { timeout: 10_000 }).toBe(false);
  await expect.poll(() => page.evaluate(() => (window as unknown as { wakeLog: string[] }).wakeLog)).toEqual(['request', 'release']);
});

test('kan installeres: manifest med ikoner og en aktiv service worker', async ({ page }) => {
  await open(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await page.evaluate(async h => (await fetch(h!)).json(), href);
  expect(manifest).toMatchObject({ short_name: 'Øvemodus', display: 'standalone', start_url: './' });
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toBe(new URL('./', appUrl()).href);
  const icon = await page.request.get(new URL('apple-touch-icon.png', appUrl()).href);
  expect(icon.status()).toBe(200);
});
