import { describe, expect, it } from 'vitest';
import { bassRanking, hz, lowpass, maskedBy, rhEstimate, rmsOf, stepSplit } from './twohands';

const SR = 48000;

/** Pianoaktig tone (inharmoniske deltoner, rask og så langsom utklingning), som i tests/fixtures/make-synthetic.mjs. */
function addTone(buf: Float32Array, midi: number, t0: number, vel: number) {
  const f0 = hz(midi), B = midi < 60 ? 0.0002 : 0.0004;
  for (let n = 1; n <= 14; n++) {
    const fn = n * f0 * Math.sqrt(1 + B * n * n);
    if (fn > SR / 2) break;
    const amp = vel * 0.3 / n ** 0.8, tau = 1.6 / (1 + 0.35 * n);
    for (let i = Math.max(0, Math.round(t0 * SR)); i < buf.length; i++) {
      const t = i / SR - t0;
      const env = Math.min(1, t / 0.003) * (0.65 * Math.exp(-t / 0.15) + 0.35 * Math.exp(-t / tau));
      buf[i] += amp * env * Math.sin(2 * Math.PI * fn * t + n);
    }
  }
}

/** Et vindu på `n` prøver som slutter `at` sekunder etter starten. */
function frame(notes: [midi: number, t0: number, vel: number][], at: number, n = 2048): Float32Array {
  const buf = new Float32Array(Math.round((at + 0.05) * SR));
  notes.forEach(([m, t0, v]) => addTone(buf, m, t0, v));
  const end = Math.round(at * SR);
  return buf.slice(end - n, end);
}

const A2E3: [number, number, number][] = [[45, 0, 0.7], [52, 0, 0.7]];

describe('høyre hånd med venstre hånd i samme signal', () => {
  it('finner tonen i høyre hånd når venstre hånds toner trekkes fra', () => {
    for (const rh of [72, 74, 75, 79]) { // C5, D5, D♯5, G5 over A2 + E3
      const f = frame([...A2E3, [rh, 0, 0.9]], 0.12);
      expect(rhEstimate(f, SR, [45, 52])?.midi, `MIDI ${rh}`).toBe(rh);
    }
  });

  it('uten å trekke fra venstre hånd blir det ingen sikker tone', () => {
    expect(rhEstimate(frame([...A2E3, [72, 0, 0.9]], 0.12), SR, [])).toBeNull();
  });

  it('kjenner igjen toner som ligger på en overtone av venstre hånd', () => {
    expect(maskedBy(69, [45, 52])).toBe(true);  // A4 er 4. deltone av A2
    expect(maskedBy(71, [45, 52])).toBe(true);  // B4 er 3. deltone av E3
    expect(maskedBy(76, [45, 52])).toBe(true);  // E5 er 4. deltone av E3
    expect(maskedBy(72, [45, 52])).toBe(false); // C5
    expect(maskedBy(74, [45, 52])).toBe(false); // D5
  });
});

describe('venstre hånd: bassnotene rangert i lavpassfiltrert, langt vindu', () => {
  const rank = (notes: [number, number, number][]) => {
    const long = frame(notes, 0.2, 8192);
    return bassRanking(lowpass(long, SR, hz(60) * 0.94), SR, 36, 59);
  };

  it('grunntonen i kvinten står øverst, også med en tone i høyre hånd', () => {
    expect(rank([...A2E3, [72, 0, 0.9]])[0]).toBe(45);
    expect(rank([[40, 0, 0.7], [47, 0, 0.7], [83, 0, 0.9]])[0]).toBe(40);
  });

  it('feil bass gir en annen grunntone', () => {
    expect(rank([[43, 0, 0.7], [50, 0, 0.7], [72, 0, 0.9]])[0]).toBe(43);
  });

  it('høyre hånd alene gir lite energi under skillet', () => {
    const f = frame([[69, 0, 0.9]], 0.12);
    expect(rmsOf(lowpass(f, SR, hz(60) * 0.94)) / rmsOf(f)).toBeLessThan(0.15);
    const g = frame([...A2E3, [69, 0, 0.9]], 0.12);
    expect(rmsOf(lowpass(g, SR, hz(60) * 0.94)) / rmsOf(g)).toBeGreaterThan(0.3);
  });
});

describe('skillet i ett steg', () => {
  it('bruker skillet for delen når hendene holder seg på hver sin side', () => {
    expect(stepSplit([45, 52], [69], 60)).toBe(60);
    expect(stepSplit(undefined, [57], 60)).toBe(60);
  });

  it('når hendene overlapper i delen: høyre hånd alene høres også under midtre C', () => {
    expect(stepSplit(undefined, [57], null)).toBe(57); // A3 i arpeggioen i Für Elise
    expect(stepSplit(undefined, [76], null)).toBe(60);
  });

  it('når hendene overlapper i delen: skiller hendene i steget når det går', () => {
    expect(stepSplit([45, 52], [69], null)).toBe(60);
    expect(stepSplit([60, 64], [72], null)).toBe(72); // C4 + E4 i venstre, C5 i høyre (F-dur-delen)
    expect(stepSplit([76], undefined, null)).toBe(60); // E5 i venstre hånd alene høres med YIN
    expect(stepSplit([64, 67], [64], null)).toBe(60); // samme tone i begge: kan ikke skilles
  });
});
