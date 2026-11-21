import { describe, expect, it } from 'vitest';
import { build, type Hand } from '../music/song';
import { pc } from '../music/theory';
import { matchesPart } from '../practice/judge';
import { dovregubben } from '../songs/dovregubben';
import { TwoHandDetector, ringingAt, rmsOf, type MicEvent } from './twohands';

// Kjører opptakene i tests/fixtures gjennom detektoren slik mic.ts gjør (60 rammer i sekundet), og dømmer som
// «Vent på meg» med begge hender. node:fs har ingen typer her (`types: []`), så modulen lastes uten.
async function readWav(name: string): Promise<{ x: Float32Array; sr: number }> {
  const fs = (await import(/* @vite-ignore */ 'node:' + 'fs')) as { readFileSync(p: string): Uint8Array };
  const b = fs.readFileSync(`tests/fixtures/${name}`);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const sr = dv.getUint32(24, true);
  for (let p = 12; p + 8 <= b.length; p += 8 + dv.getUint32(p + 4, true)) {
    if (String.fromCharCode(...b.subarray(p, p + 4)) !== 'data') continue;
    const n = dv.getUint32(p + 4, true) / 2, x = new Float32Array(n);
    for (let i = 0; i < n; i++) x[i] = dv.getInt16(p + 8 + 2 * i, true) / 32768;
    return { x, sr };
  }
  throw new Error(`Fant ikke lyd i ${name}`);
}

async function practise(wav: string, sens: number) {
  const { x, sr } = await readWav(wav);
  const model = build(dovregubben, dovregubben.sections[0], 'both');
  const steps = model.steps, split = model.split ?? 60;
  const det = new TwoHandDetector();
  let cur = 0, misses = 0, floor = 0.002, lastAcc: number | null = null;
  let got: Partial<Record<Hand, boolean>> = {};
  const log: string[] = [];
  const hop = Math.round(sr / 60);
  for (let end = 8192; end <= x.length && cur < steps.length; end += hop) {
    const frame = x.subarray(end - 2048, end);
    let ss = 0;
    for (let i = 0; i < frame.length; i++) ss += frame[i] * frame[i];
    const rms = Math.sqrt(ss / frame.length);
    if (rms < floor) floor = floor * 0.8 + rms * 0.2; else floor = Math.min(floor * 1.0003, 0.006);
    floor = Math.max(floor, 0.0003);
    const step = steps[cur];
    const pending = (h: Hand) => (step.parts?.[h] && !got[h] ? step.parts[h]!.midis : undefined);
    const now = (end / sr) * 1000;
    const events: MicEvent[] = det.frame({
      now, frame, rms, gate: Math.max(floor * 3, sens), sr, split, anyOct: true,
      long: () => x.subarray(end - 8192, end),
      target: { lh: pending('lh'), rh: pending('rh'), ringing: ringingAt(steps, cur) }
    });
    for (const e of events) {
      const s = steps[cur];
      if (!s) break;
      if (!e.attack && lastAcc != null && pc(e.midi) === pc(lastAcc)) continue;
      const hand: Hand = e.midi >= split ? 'rh' : 'lh';
      const part = s.parts?.[hand];
      const ok = !!part && matchesPart(part, e.midi, true);
      log.push(`${(now / 1000).toFixed(2)}s steg ${cur} (${s.name}) ${e.phase} ${e.midi}${e.attack ? ' anslag' : ''}: ${ok ? (got[hand] ? 'allerede' : 'riktig') : e.phase === 'sustain' ? 'BOM' : 'feil'}`);
      if (ok) {
        if (got[hand]) continue;
        got = { ...got, [hand]: true };
        if (hand === 'rh') lastAcc = e.midi;
        if ((['rh', 'lh'] as Hand[]).every(h => !s.parts?.[h] || got[h])) { cur++; got = {}; }
      } else if (e.phase === 'sustain') misses++;
    }
  }
  return { cur, misses, total: steps.length, log };
}

describe('begge hender med mikrofon: del A av «I Dovregubbens hall» (kunstig opptak)', () => {
  for (const [wav, sens] of [['del-a-begge-hender.wav', 0.008], ['del-a-begge-hender-svak.wav', 0.0008]] as const) {
    it(`${wav}: alle stegene, ingen bom`, async () => {
      const r = await practise(wav, sens);
      expect({ cur: r.cur, misses: r.misses }, r.log.join('\n')).toEqual({ cur: r.total, misses: 0 });
    });
  }

  it('feil bass godtas ikke: venter G2 + D3, hører A2 + E3', async () => {
    expect(await leftHand('del-a-begge-hender.wav', [43, 50])).toEqual([]);
  });

  it('høyre hånd alene (pianoopptaket) gir ingen tone i venstre hånd', async () => {
    expect(await leftHand('del-a-hoyre-hand.wav', [45, 52])).toEqual([]);
  });
});

/** Tonene detektoren godtar i venstre hånd gjennom hele opptaket, når den hele tiden venter `lh`. */
async function leftHand(wav: string, lh: number[]): Promise<number[]> {
  const { x, sr } = await readWav(wav);
  const det = new TwoHandDetector();
  const out: number[] = [];
  for (let end = 8192; end <= x.length; end += Math.round(sr / 60)) {
    const frame = x.subarray(end - 2048, end);
    const events = det.frame({
      now: (end / sr) * 1000, frame, rms: rmsOf(frame), gate: 0.008, sr, split: 60, anyOct: true,
      long: () => x.subarray(end - 8192, end), target: { lh, ringing: lh }
    });
    out.push(...events.filter(e => e.midi < 60).map(e => e.midi));
  }
  return out;
}
