// Pakker ut komprimert MusicXML (.mxl), som er en zip-fil. Bruker nettleserens DecompressionStream.

import { ImportError } from './musicxml';

interface Entry {
  method: number;
  data: Uint8Array;
}

const u16 = (b: DataView, o: number) => b.getUint16(o, true);
const u32 = (b: DataView, o: number) => b.getUint32(o, true);

export const isZip = (buf: ArrayBuffer): boolean => {
  const b = new Uint8Array(buf, 0, Math.min(4, buf.byteLength));
  return b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
};

function readZip(buf: ArrayBuffer): Map<string, Entry> {
  const view = new DataView(buf);
  // Slutten av den sentrale katalogen ligger de siste 22 bytene, eller før en kommentar på opptil 64 kB
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (u32(view, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new ImportError('Filen ser ut som en zip-fil, men kunne ikke åpnes.');
  const total = u16(view, eocd + 10);
  let p = u32(view, eocd + 16);
  const files = new Map<string, Entry>();
  const decoder = new TextDecoder();
  for (let n = 0; n < total; n++) {
    if (u32(view, p) !== 0x02014b50) break;
    const method = u16(view, p + 10), size = u32(view, p + 20);
    const nameLen = u16(view, p + 28), extraLen = u16(view, p + 30), commentLen = u16(view, p + 32);
    const local = u32(view, p + 42);
    const name = decoder.decode(new Uint8Array(buf, p + 46, nameLen));
    const start = local + 30 + u16(view, local + 26) + u16(view, local + 28);
    files.set(name, { method, data: new Uint8Array(buf, start, size) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

async function inflate(e: Entry): Promise<string> {
  if (e.method === 0) return new TextDecoder().decode(e.data);
  if (e.method !== 8) throw new ImportError('Filen er komprimert på en måte appen ikke kan pakke ut.');
  const copy = new Uint8Array(e.data); // en egen kopi, så strømmen ikke låser hele filen
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

/** Finner selve partituret i en .mxl-fil, slik META-INF/container.xml peker på det. */
export async function unzipMusicXml(buf: ArrayBuffer): Promise<string> {
  const files = readZip(buf);
  const container = files.get('META-INF/container.xml');
  let path: string | undefined;
  if (container) {
    const m = /full-path="([^"]+)"/.exec(await inflate(container));
    path = m?.[1];
  }
  path ??= [...files.keys()].find(n => !n.startsWith('META-INF/') && /\.(musicxml|xml)$/i.test(n));
  const entry = path ? files.get(path) : undefined;
  if (!entry) throw new ImportError('Fant ikke noe partitur i .mxl-filen.');
  return inflate(entry);
}
