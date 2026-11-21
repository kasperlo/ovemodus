import { test, expect, type Page } from '@playwright/test';
import { deflateRawSync } from 'node:zlib';
import { appUrl } from './helpers';

// Import av egne noter (MusicXML). Gjelder bare den bygde appen, ikke prototypen.
test.skip(appUrl().startsWith('file:'), 'gjelder bare den bygde appen');

const pitched = (step: string, oct: number, dur: number, staff = 1, voice = '1', finger = '') =>
  `<note><pitch><step>${step}</step><octave>${oct}</octave></pitch><duration>${dur}</duration><voice>${voice}</voice><staff>${staff}</staff>${finger ? `<notations><technical><fingering>${finger}</fingering></technical></notations>` : ''}</note>`;

const PIANO = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0"><work><work-title>Min vise</work-title></work>
<part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
<part id="P1">
  <measure number="1"><attributes><divisions>1</divisions><key><fifths>1</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves></attributes>
    ${pitched('G', 4, 1, 1, '1', '1')}${pitched('A', 4, 1, 1, '1', '2')}${pitched('B', 4, 1, 1, '1', '3')}${pitched('G', 4, 1, 1, '1', '1')}
    <backup><duration>4</duration></backup>${pitched('G', 2, 4, 2, '5')}
  </measure>
  <measure number="2">
    ${pitched('D', 5, 2)}${pitched('D', 5, 2)}
    <backup><duration>4</duration></backup>${pitched('D', 3, 4, 2, '5')}
  </measure>
</part></score-partwise>`;

const MELODY = `<?xml version="1.0"?><score-partwise version="4.0"><part-list><score-part id="P1"/></part-list>
<part id="P1"><measure number="1"><attributes><divisions>1</divisions><time><beats>3</beats><beat-type>4</beat-type></time></attributes>
${pitched('E', 5, 1)}${pitched('D', 5, 1)}${pitched('C', 5, 1)}</measure></part></score-partwise>`;

function mxl(xml: string): Buffer {
  const files = [
    { name: 'META-INF/container.xml', data: Buffer.from('<container><rootfiles><rootfile full-path="score.xml"/></rootfiles></container>') },
    { name: 'score.xml', data: Buffer.from(xml) }
  ];
  const locals: Buffer[] = [], centrals: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const comp = deflateRawSync(f.data), name = Buffer.from(f.name);
    const l = Buffer.alloc(30);
    l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(8, 8); l.writeUInt32LE(comp.length, 18); l.writeUInt32LE(f.data.length, 22); l.writeUInt16LE(name.length, 26);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(8, 10); c.writeUInt32LE(comp.length, 20); c.writeUInt32LE(f.data.length, 24); c.writeUInt16LE(name.length, 28); c.writeUInt32LE(offset, 42);
    locals.push(l, name, comp); centrals.push(c, name);
    offset += 30 + name.length + comp.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl());
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
});

async function upload(page: Page, name: string, buffer: Buffer) {
  await page.setInputFiles('#fileImport', { name, mimeType: 'application/octet-stream', buffer });
}

test('importerer MusicXML: låten havner under «Mine noter», med noteark, begge hender, og overlever omlasting', async ({ page }) => {
  await upload(page, 'min-vise.musicxml', Buffer.from(PIANO));
  await expect(page.locator('#importStatus')).toContainText('«Min vise» er importert: 2 takter, 6 toner i høyre hånd og 2 i venstre');
  await expect(page.locator('#songTitle')).toHaveText('Min vise');
  await expect(page.locator('#selSong optgroup[label^="Mine noter"] option')).toHaveText(['Min vise']);
  await expect(page.locator('#secUse')).toContainText('Lagret bare på denne enheten');
  await expect(page.locator('#btnDeleteSong')).toBeVisible();
  await expect(page.locator('#clueSub')).toHaveText('G4 · finger 1');

  let st = await page.evaluate(() => window.ovemodus.state);
  expect(st.steps).toBe(6);
  expect(st.sheet.ok).toBe(true);

  await page.click('#segHand button[data-hand="lh"]');
  st = await page.evaluate(() => window.ovemodus.state);
  expect(st.steps).toBe(2);
  expect(st.sheet.ok).toBe(true);

  await page.reload();
  await expect(page.locator('#songTitle')).toHaveText('Min vise');
  expect(await page.evaluate(() => window.ovemodus.state.steps)).toBe(2);
});

test('importerer komprimert .mxl, og sletting fjerner låten fra enheten', async ({ page }) => {
  await upload(page, 'min-vise.mxl', mxl(PIANO));
  await expect(page.locator('#importStatus')).toContainText('er importert');
  await expect(page.locator('#songTitle')).toHaveText('Min vise');

  page.once('dialog', d => d.accept());
  await page.click('#btnDeleteSong');
  await expect(page.locator('#importStatus')).toContainText('er slettet');
  await expect(page.locator('#selSong optgroup[label^="Mine noter"]')).toHaveCount(0);
  await expect(page.locator('#btnDeleteSong')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('ovemodus-mine-noter-v1'))).toBe('[]');
});

test('melodi uten venstre hånd: venstre hånd kan ikke velges, og MIDI-fil gir en forklaring', async ({ page }) => {
  await upload(page, 'melodi.xml', Buffer.from(MELODY));
  await expect(page.locator('#importStatus')).toContainText('og 0 i venstre');
  await expect(page.locator('#segHand button[data-hand="lh"]')).toBeDisabled();
  await expect(page.locator('#clueSub')).toHaveText('E5');

  await upload(page, 'sang.mid', Buffer.from([0x4d, 0x54, 0x68, 0x64]));
  await expect(page.locator('#importStatus')).toHaveText(/MIDI kan ikke leses direkte/);
  await expect(page.locator('#importStatus')).toHaveClass(/bad/);
});
