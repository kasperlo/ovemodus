import fs from 'node:fs';
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
    await expect(page.locator('#diagSettings')).toContainText('Lydmotorgår');
    await expect(page.locator('#diagSettings')).toContainText('Mikrofonsporåpent');
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

// Kunstig pianoopptak (tests/fixtures/make-synthetic.mjs): hjerteslaget i «Spenning» med venstre hånd, A2 A2 legato.
// Den andre A2-en slås an mens den første klinger, så den telles bare hvis appen hører anslaget.
for (const [wav, sens, calGate] of [['spenning-lh-legato.wav', 'middels', undefined], ['spenning-lh-legato-svak.wav', 'kalibrert', 0.0008]] as const) {
  test(`mikrofon, venstre hånd: gjentatt tone høres som nytt anslag (${wav}, ${sens})`, async ({ playwright }) => {
    const browser = await playwright.chromium.launch({ args: fakeMicArgs(wav) });
    try {
      const page = await newPage(browser);
      await page.goto(appUrl());
      await page.evaluate(([k, s, g]) => {
        localStorage.clear();
        localStorage.setItem(k as string, JSON.stringify({ settings: { sens: s, calGate: g, hand: 'lh', section: 'spenning' } }));
      }, [STORE_KEY, sens, calGate ?? null] as const);
      await page.reload();
      await page.evaluate(() => window.ovemodus.setMode('vent'));
      await page.click('#btnMic');
      await expect.poll(() => page.evaluate(() => window.ovemodus.state.finished), { timeout: 20_000 }).toBe(true);
      const st = await page.evaluate(() => window.ovemodus.state);
      expect(st.cur).toBe(8);
      expect(st.misses).toBe(0);
    } finally {
      await browser.close();
    }
  });
}

// Kunstig pianoopptak av del A med begge hender (make-synthetic.mjs): høyre hånd staccato, A2 + E3 på hvert slag.
for (const [wav, sens, calGate] of [['del-a-begge-hender.wav', 'middels', undefined], ['del-a-begge-hender-svak.wav', 'kalibrert', 0.0008]] as const) {
  test(`mikrofon, begge hender: del A gjenkjennes uten bom (${wav}, ${sens})`, async ({ playwright }) => {
    const browser = await playwright.chromium.launch({ args: fakeMicArgs(wav) });
    try {
      const page = await newPage(browser);
      await page.goto(appUrl());
      await page.evaluate(([k, s, g]) => {
        localStorage.clear();
        localStorage.setItem(k as string, JSON.stringify({ settings: { sens: s, calGate: g, hand: 'both', section: 'delA' } }));
      }, [STORE_KEY, sens, calGate ?? null] as const);
      await page.reload();
      await page.evaluate(() => window.ovemodus.setMode('vent'));
      await page.click('#btnMic');
      await expect.poll(() => page.evaluate(() => window.ovemodus.state.finished), { timeout: 25_000 }).toBe(true);
      const st = await page.evaluate(() => window.ovemodus.state);
      expect(st.cur).toBe(27);
      expect(st.misses).toBe(0);
    } finally {
      await browser.close();
    }
  });
}

/** WAV med bare nuller (mono, 16 bit, 8 kHz), som en mikrofon nettleseren ikke sender lyd fra. */
function silentWav(seconds: number): Buffer {
  const rate = 8000, n = rate * seconds, b = Buffer.alloc(44 + 2 * n);
  b.write('RIFF', 0); b.writeUInt32LE(36 + 2 * n, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(2 * rate, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(2 * n, 40);
  return b;
}

test('mikrofon som bare gir nuller: appen sier fra i stedet for å stå stille', async ({ playwright }) => {
  const wav = test.info().outputPath('stille.wav');
  fs.mkdirSync(test.info().outputDir, { recursive: true });
  fs.writeFileSync(wav, silentWav(1));
  const browser = await playwright.chromium.launch({ args: fakeMicArgs(wav) });
  try {
    const page = await newPage(browser);
    await page.goto(appUrl());
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.click('#btnMic');
    // Først starter appen mikrofonen på nytt av seg selv (etter 3 s), så sier den fra (etter 3 s til)
    await expect(page.locator('#inputStatus')).toHaveText(/Mikrofonen gir ingen lyd/, { timeout: 15_000 });
    await expect(page.locator('#inputStatus')).toHaveClass(/warn/);
  } finally {
    await browser.close();
  }
});
