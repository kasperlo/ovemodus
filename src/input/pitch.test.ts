import { describe, expect, it } from 'vitest';
import { estimatePitch, refineF, yin } from './pitch';

const SR = 48000;
const N = 2048; // samme som fftSize i mic.ts

/**
 * Pianoaktig tone: ti deltoner med strukket stemming, f_n = n·f0·√(1 + B·n²).
 * B er inharmonisitetskoeffisienten; 0,0003–0,003 dekker mellomregisteret på et piano.
 */
function pianoTone(midi: number, B: number, cents = 0): { buf: Float32Array; f0: number } {
  const f0 = 440 * 2 ** ((midi - 69 + cents / 100) / 12);
  const buf = new Float32Array(N);
  for (let n = 1; n <= 10; n++) {
    const fn = n * f0 * Math.sqrt(1 + B * n * n);
    if (fn > SR / 2) break;
    for (let i = 0; i < N; i++) buf[i] += (0.3 / n) * Math.sin(2 * Math.PI * fn * i / SR + n);
  }
  return { buf, f0 };
}

const centsOff = (f: number, ref: number) => 1200 * Math.log2(f / ref);
const NOTES = [48, 57, 60, 64, 69, 72, 76, 81, 84, 88]; // C3–E6

describe('tonedeteksjon på syntetiske pianotoner', () => {
  it('YIN alene leser inharmoniske toner for høyt (grunnen til finjusteringen)', () => {
    const { buf, f0 } = pianoTone(69, 0.003);
    expect(centsOff(yin(buf, SR)!.f, f0)).toBeGreaterThan(30);
  });

  for (const B of [0.0003, 0.001, 0.003]) {
    it(`Goertzel-finjusteringen havner innenfor ±5 cent (B = ${B})`, () => {
      for (const m of NOTES) {
        const { buf, f0 } = pianoTone(m, B);
        const f = refineF(buf, SR, yin(buf, SR)!.f);
        expect(Math.abs(centsOff(f, f0)), `MIDI ${m}`).toBeLessThan(5);
        expect(estimatePitch(buf, SR)?.midi, `MIDI ${m}`).toBe(m);
      }
    });
  }

  it('godtar en tone 30 cent ved siden av og runder til nærmeste halvtone', () => {
    expect(estimatePitch(pianoTone(64, 0.001, 30).buf, SR)?.midi).toBe(64);
    expect(estimatePitch(pianoTone(64, 0.001, -30).buf, SR)?.midi).toBe(64);
  });

  it('forkaster en tone midt mellom to halvtoner', () => {
    expect(estimatePitch(pianoTone(64, 0.001, 50).buf, SR)).toBeNull();
  });

  it('gir ingen tone for stillhet eller hvit støy', () => {
    expect(estimatePitch(new Float32Array(N), SR)).toBeNull();
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const noise = Float32Array.from({ length: N }, rnd);
    expect(estimatePitch(noise, SR)).toBeNull();
  });
});
