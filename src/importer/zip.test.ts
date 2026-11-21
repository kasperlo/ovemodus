import { describe, expect, it } from 'vitest';
import { isZip, unzipMusicXml } from './zip';

async function deflateRaw(raw: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([raw as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Lager en enkel zip-fil i minnet, slik MuseScore lagrer .mxl. */
async function makeZip(files: { name: string; text: string; deflate: boolean }[]): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const raw = enc.encode(f.text);
    const data = f.deflate ? await deflateRaw(raw) : raw;
    const name = enc.encode(f.name);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(8, f.deflate ? 8 : 0, true);
    local.setUint32(18, data.length, true); local.setUint32(22, raw.length, true); local.setUint16(26, name.length, true);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(10, f.deflate ? 8 : 0, true);
    cd.setUint32(20, data.length, true); cd.setUint32(24, raw.length, true); cd.setUint16(28, name.length, true); cd.setUint32(42, offset, true);
    chunks.push(new Uint8Array(local.buffer), name, data);
    central.push(new Uint8Array(cd.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)] as BlobPart[]).arrayBuffer();
}

const CONTAINER = '<?xml version="1.0"?><container><rootfiles><rootfile full-path="score.musicxml"/></rootfiles></container>';
const SCORE = '<?xml version="1.0"?><score-partwise version="4.0"><part id="P1"/></score-partwise>';

describe('unzipMusicXml', () => {
  it('finner partituret som container.xml peker på, også når det er komprimert', async () => {
    const zip = await makeZip([
      { name: 'META-INF/container.xml', text: CONTAINER, deflate: true },
      { name: 'score.musicxml', text: SCORE, deflate: true }
    ]);
    expect(isZip(zip)).toBe(true);
    expect(await unzipMusicXml(zip)).toBe(SCORE);
  });

  it('uten container.xml: tar første .xml-fil', async () => {
    expect(await unzipMusicXml(await makeZip([{ name: 'noter.xml', text: SCORE, deflate: false }]))).toBe(SCORE);
  });

  it('vanlig tekst er ikke zip', () => {
    expect(isZip(new TextEncoder().encode(SCORE).buffer as ArrayBuffer)).toBe(false);
  });
});
